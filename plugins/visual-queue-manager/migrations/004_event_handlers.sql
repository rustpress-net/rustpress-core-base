-- =============================================================================
-- Migration 004: Event Handlers
-- =============================================================================
-- Visual Queue Manager - Event handler registrations and configuration
--
-- This migration creates tables for:
-- - Event handler definitions
-- - Handler execution history
-- - Handler conditions and routing rules
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Event Handlers Table
-- -----------------------------------------------------------------------------
-- Stores handler registrations that process queue messages

CREATE TABLE IF NOT EXISTS vqm_event_handlers (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Queue association (NULL = global handler)
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,

    -- Handler identification
    event_type VARCHAR(255) NOT NULL,
    handler_name VARCHAR(255) NOT NULL,
    handler_path VARCHAR(500) NOT NULL,
    handler_method VARCHAR(100) NOT NULL DEFAULT 'handle',

    -- Handler type
    handler_type VARCHAR(50) NOT NULL DEFAULT 'rust',

    -- Execution configuration
    is_async BOOLEAN NOT NULL DEFAULT true,
    timeout_ms BIGINT NOT NULL DEFAULT 30000,
    retry_on_failure BOOLEAN NOT NULL DEFAULT true,
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_delay_ms BIGINT NOT NULL DEFAULT 1000,

    -- Priority and ordering
    priority INTEGER NOT NULL DEFAULT 0,
    execution_order INTEGER NOT NULL DEFAULT 0,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Conditional execution
    conditions JSONB DEFAULT NULL,
    filter_expression TEXT DEFAULT NULL,

    -- Error handling
    on_error_action VARCHAR(50) NOT NULL DEFAULT 'retry',
    fallback_handler_id UUID REFERENCES vqm_event_handlers(id) ON DELETE SET NULL,

    -- Circuit breaker settings
    circuit_breaker_enabled BOOLEAN NOT NULL DEFAULT false,
    circuit_breaker_threshold INTEGER DEFAULT 5,
    circuit_breaker_timeout_seconds INTEGER DEFAULT 60,

    -- Rate limiting
    rate_limit_enabled BOOLEAN NOT NULL DEFAULT false,
    rate_limit_per_second INTEGER DEFAULT NULL,

    -- Statistics
    execution_count BIGINT NOT NULL DEFAULT 0,
    success_count BIGINT NOT NULL DEFAULT 0,
    failure_count BIGINT NOT NULL DEFAULT 0,
    total_execution_time_ms BIGINT NOT NULL DEFAULT 0,
    avg_execution_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_error_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_error_message TEXT DEFAULT NULL,

    -- Circuit breaker state
    circuit_state VARCHAR(20) NOT NULL DEFAULT 'closed',
    circuit_opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    circuit_failure_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Constraints
    CONSTRAINT vqm_handlers_unique_registration UNIQUE (queue_id, event_type, handler_name),
    CONSTRAINT vqm_handlers_valid_type CHECK (
        handler_type IN ('rust', 'wasm', 'http', 'grpc', 'script')
    ),
    CONSTRAINT vqm_handlers_valid_error_action CHECK (
        on_error_action IN ('retry', 'skip', 'fail', 'dlq', 'fallback')
    ),
    CONSTRAINT vqm_handlers_valid_circuit_state CHECK (
        circuit_state IN ('closed', 'open', 'half_open')
    ),
    CONSTRAINT vqm_handlers_valid_priority CHECK (priority >= -100 AND priority <= 100),
    CONSTRAINT vqm_handlers_no_self_fallback CHECK (id != fallback_handler_id)
);

-- -----------------------------------------------------------------------------
-- Handler Execution History Table
-- -----------------------------------------------------------------------------
-- Tracks individual handler executions for debugging and analytics

CREATE TABLE IF NOT EXISTS vqm_handler_executions (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- References
    handler_id UUID NOT NULL REFERENCES vqm_event_handlers(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    queue_id UUID NOT NULL,
    worker_id UUID DEFAULT NULL,

    -- Execution details
    event_type VARCHAR(255) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    execution_time_ms BIGINT DEFAULT NULL,

    -- Result
    status VARCHAR(20) NOT NULL DEFAULT 'running',
    result JSONB DEFAULT NULL,

    -- Error tracking
    error_message TEXT DEFAULT NULL,
    error_code VARCHAR(100) DEFAULT NULL,
    error_stack TEXT DEFAULT NULL,

    -- Input/output sizes
    input_size_bytes INTEGER DEFAULT NULL,
    output_size_bytes INTEGER DEFAULT NULL,

    -- Circuit breaker
    circuit_state_at_execution VARCHAR(20) DEFAULT NULL,

    -- Constraints
    CONSTRAINT vqm_executions_valid_status CHECK (
        status IN ('running', 'completed', 'failed', 'timeout', 'skipped', 'circuit_open')
    )
);

-- -----------------------------------------------------------------------------
-- Handler Routes Table
-- -----------------------------------------------------------------------------
-- Define routing rules for messages to handlers

CREATE TABLE IF NOT EXISTS vqm_handler_routes (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Route identification
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Matching criteria
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,
    event_type_pattern VARCHAR(255) NOT NULL DEFAULT '*',
    message_type_pattern VARCHAR(255) DEFAULT NULL,

    -- Routing rules (JSON DSL)
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Target handlers (ordered list)
    handler_ids UUID[] NOT NULL DEFAULT '{}',

    -- Execution mode
    execution_mode VARCHAR(20) NOT NULL DEFAULT 'sequential',

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vqm_routes_valid_mode CHECK (
        execution_mode IN ('sequential', 'parallel', 'first_match', 'all')
    ),
    CONSTRAINT vqm_routes_name_unique UNIQUE (name)
);

-- -----------------------------------------------------------------------------
-- Indexes for Event Handlers
-- -----------------------------------------------------------------------------

-- Handler lookup by queue and event type
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_queue_event
    ON vqm_event_handlers(queue_id, event_type)
    WHERE is_active = true;

-- Global handlers (no specific queue)
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_global
    ON vqm_event_handlers(event_type)
    WHERE queue_id IS NULL AND is_active = true;

-- Active handlers
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_active
    ON vqm_event_handlers(is_active)
    WHERE is_active = true;

-- Handler type filtering
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_type
    ON vqm_event_handlers(handler_type);

-- Priority ordering
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_priority
    ON vqm_event_handlers(queue_id, event_type, priority DESC, execution_order ASC)
    WHERE is_active = true;

-- Circuit breaker state monitoring
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_circuit
    ON vqm_event_handlers(circuit_state)
    WHERE circuit_breaker_enabled = true;

-- Tags search
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_tags
    ON vqm_event_handlers USING GIN(tags);

-- Conditions search
CREATE INDEX IF NOT EXISTS idx_vqm_handlers_conditions
    ON vqm_event_handlers USING GIN(conditions jsonb_path_ops)
    WHERE conditions IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Indexes for Handler Executions
-- -----------------------------------------------------------------------------

-- Handler execution history
CREATE INDEX IF NOT EXISTS idx_vqm_executions_handler
    ON vqm_handler_executions(handler_id, started_at DESC);

-- Message execution history
CREATE INDEX IF NOT EXISTS idx_vqm_executions_message
    ON vqm_handler_executions(message_id);

-- Queue execution history
CREATE INDEX IF NOT EXISTS idx_vqm_executions_queue
    ON vqm_handler_executions(queue_id, started_at DESC);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_vqm_executions_time
    ON vqm_handler_executions(started_at DESC);

-- Failed executions
CREATE INDEX IF NOT EXISTS idx_vqm_executions_failed
    ON vqm_handler_executions(handler_id, started_at DESC)
    WHERE status = 'failed';

-- Running executions
CREATE INDEX IF NOT EXISTS idx_vqm_executions_running
    ON vqm_handler_executions(started_at)
    WHERE status = 'running';

-- -----------------------------------------------------------------------------
-- Indexes for Handler Routes
-- -----------------------------------------------------------------------------

-- Route matching
CREATE INDEX IF NOT EXISTS idx_vqm_routes_queue
    ON vqm_handler_routes(queue_id, priority DESC)
    WHERE is_active = true;

-- Event type pattern matching
CREATE INDEX IF NOT EXISTS idx_vqm_routes_event_pattern
    ON vqm_handler_routes(event_type_pattern)
    WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

CREATE TRIGGER vqm_handlers_update_timestamp
    BEFORE UPDATE ON vqm_event_handlers
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

CREATE TRIGGER vqm_routes_update_timestamp
    BEFORE UPDATE ON vqm_handler_routes
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Update handler statistics
CREATE OR REPLACE FUNCTION vqm_update_handler_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average execution time
    IF NEW.execution_count > 0 THEN
        NEW.avg_execution_time_ms = NEW.total_execution_time_ms::DOUBLE PRECISION / NEW.execution_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_handlers_update_stats
    BEFORE UPDATE OF execution_count, total_execution_time_ms ON vqm_event_handlers
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_handler_stats();

-- Circuit breaker management
CREATE OR REPLACE FUNCTION vqm_manage_circuit_breaker()
RETURNS TRIGGER AS $$
BEGIN
    -- Open circuit if failures exceed threshold
    IF NEW.circuit_breaker_enabled AND NEW.circuit_failure_count >= NEW.circuit_breaker_threshold THEN
        IF NEW.circuit_state = 'closed' THEN
            NEW.circuit_state = 'open';
            NEW.circuit_opened_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_handlers_circuit_breaker
    BEFORE UPDATE OF circuit_failure_count ON vqm_event_handlers
    FOR EACH ROW
    WHEN (NEW.circuit_breaker_enabled = true)
    EXECUTE FUNCTION vqm_manage_circuit_breaker();

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------

-- Get handlers for an event
CREATE OR REPLACE FUNCTION vqm_get_handlers_for_event(
    p_queue_id UUID,
    p_event_type VARCHAR(255)
)
RETURNS TABLE (
    handler_id UUID,
    handler_name VARCHAR(255),
    handler_path VARCHAR(500),
    handler_method VARCHAR(100),
    handler_type VARCHAR(50),
    priority INTEGER,
    timeout_ms BIGINT,
    conditions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        h.id,
        h.handler_name,
        h.handler_path,
        h.handler_method,
        h.handler_type,
        h.priority,
        h.timeout_ms,
        h.conditions
    FROM vqm_event_handlers h
    WHERE
        h.is_active = true
        AND h.circuit_state != 'open'
        AND (h.queue_id = p_queue_id OR h.queue_id IS NULL)
        AND (h.event_type = p_event_type OR h.event_type = '*')
    ORDER BY
        h.priority DESC,
        h.execution_order ASC;
END;
$$ LANGUAGE plpgsql;

-- Reset circuit breaker for a handler
CREATE OR REPLACE FUNCTION vqm_reset_circuit_breaker(p_handler_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE vqm_event_handlers
    SET
        circuit_state = 'closed',
        circuit_opened_at = NULL,
        circuit_failure_count = 0
    WHERE id = p_handler_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_event_handlers IS 'Event handler registrations for processing queue messages';
COMMENT ON TABLE vqm_handler_executions IS 'Historical record of handler executions';
COMMENT ON TABLE vqm_handler_routes IS 'Routing rules for directing messages to handlers';
COMMENT ON COLUMN vqm_event_handlers.handler_type IS 'Type of handler: rust, wasm, http, grpc, script';
COMMENT ON COLUMN vqm_event_handlers.circuit_state IS 'Circuit breaker state: closed, open, half_open';
COMMENT ON COLUMN vqm_event_handlers.conditions IS 'JSON conditions that must be met for handler to execute';
COMMENT ON FUNCTION vqm_get_handlers_for_event IS 'Get all active handlers that should process a given event';
