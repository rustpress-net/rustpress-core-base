-- =============================================================================
-- Migration 002: Messages Table
-- =============================================================================
-- Visual Queue Manager - Message storage and processing state
--
-- This migration creates the messages table with:
-- - Full message lifecycle tracking
-- - Correlation and causation IDs for tracing
-- - Performance-optimized indexes for high-throughput processing
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Queue Messages Table
-- -----------------------------------------------------------------------------
-- Stores all messages across all queues with full lifecycle tracking

CREATE TABLE IF NOT EXISTS vqm_messages (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Queue relationship
    queue_id UUID NOT NULL REFERENCES vqm_queues(id) ON DELETE CASCADE,

    -- Distributed tracing identifiers
    correlation_id UUID DEFAULT NULL,
    causation_id UUID DEFAULT NULL,
    trace_id VARCHAR(64) DEFAULT NULL,
    span_id VARCHAR(32) DEFAULT NULL,

    -- Message identification
    message_type VARCHAR(255) NOT NULL,
    message_group_id VARCHAR(255) DEFAULT NULL,
    deduplication_id VARCHAR(255) DEFAULT NULL,

    -- Message content
    payload JSONB NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Priority and ordering
    priority INTEGER NOT NULL DEFAULT 0,
    sequence_number BIGSERIAL,

    -- Processing state
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,

    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delay_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Processing timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    failed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Locking for visibility timeout
    locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    locked_by VARCHAR(255) DEFAULT NULL,
    lock_token UUID DEFAULT NULL,

    -- Error tracking
    error_message TEXT DEFAULT NULL,
    error_code VARCHAR(100) DEFAULT NULL,
    error_stack TEXT DEFAULT NULL,
    last_error_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Processing result
    result JSONB DEFAULT NULL,
    result_size_bytes INTEGER DEFAULT NULL,

    -- Performance metrics
    wait_time_ms BIGINT DEFAULT NULL,
    processing_time_ms BIGINT DEFAULT NULL,
    total_time_ms BIGINT DEFAULT NULL,

    -- Size tracking
    payload_size_bytes INTEGER NOT NULL DEFAULT 0,

    -- Batch processing
    batch_id UUID DEFAULT NULL,
    batch_index INTEGER DEFAULT NULL,

    -- Dead letter tracking
    original_queue_id UUID DEFAULT NULL,
    moved_to_dlq_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    dlq_reason VARCHAR(100) DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vqm_messages_valid_status CHECK (
        status IN ('pending', 'scheduled', 'processing', 'completed', 'failed', 'dead', 'cancelled', 'expired')
    ),
    CONSTRAINT vqm_messages_valid_priority CHECK (priority >= -100 AND priority <= 100),
    CONSTRAINT vqm_messages_valid_attempts CHECK (attempt_count >= 0),
    CONSTRAINT vqm_messages_valid_batch_index CHECK (batch_index IS NULL OR batch_index >= 0)
);

-- -----------------------------------------------------------------------------
-- Indexes for Message Processing (Critical for Performance)
-- -----------------------------------------------------------------------------

-- Primary processing query: fetch pending messages for a queue
-- This is THE most critical index for queue performance
CREATE INDEX IF NOT EXISTS idx_vqm_messages_queue_pending
    ON vqm_messages(queue_id, available_at ASC, priority DESC, sequence_number ASC)
    WHERE status = 'pending';

-- Alternative: fetch by priority first (for priority queues)
CREATE INDEX IF NOT EXISTS idx_vqm_messages_queue_priority
    ON vqm_messages(queue_id, priority DESC, available_at ASC, sequence_number ASC)
    WHERE status = 'pending';

-- Scheduled messages ready to be made available
CREATE INDEX IF NOT EXISTS idx_vqm_messages_scheduled
    ON vqm_messages(scheduled_at ASC)
    WHERE status = 'scheduled' AND scheduled_at IS NOT NULL;

-- Delayed messages ready to process
CREATE INDEX IF NOT EXISTS idx_vqm_messages_delayed
    ON vqm_messages(delay_until ASC)
    WHERE status = 'pending' AND delay_until IS NOT NULL;

-- Expired locks (for cleanup and reprocessing)
CREATE INDEX IF NOT EXISTS idx_vqm_messages_locked
    ON vqm_messages(locked_until ASC)
    WHERE locked_until IS NOT NULL AND status = 'processing';

-- Expired messages for cleanup
CREATE INDEX IF NOT EXISTS idx_vqm_messages_expires
    ON vqm_messages(expires_at ASC)
    WHERE expires_at IS NOT NULL AND status NOT IN ('completed', 'dead', 'cancelled', 'expired');

-- Queue and status for statistics
CREATE INDEX IF NOT EXISTS idx_vqm_messages_queue_status
    ON vqm_messages(queue_id, status);

-- Correlation ID for distributed tracing
CREATE INDEX IF NOT EXISTS idx_vqm_messages_correlation
    ON vqm_messages(correlation_id)
    WHERE correlation_id IS NOT NULL;

-- Causation ID for event sourcing
CREATE INDEX IF NOT EXISTS idx_vqm_messages_causation
    ON vqm_messages(causation_id)
    WHERE causation_id IS NOT NULL;

-- Trace ID for distributed tracing integration
CREATE INDEX IF NOT EXISTS idx_vqm_messages_trace
    ON vqm_messages(trace_id)
    WHERE trace_id IS NOT NULL;

-- Message type for analytics and filtering
CREATE INDEX IF NOT EXISTS idx_vqm_messages_type
    ON vqm_messages(message_type);

-- Message group for FIFO ordering within groups
CREATE INDEX IF NOT EXISTS idx_vqm_messages_group
    ON vqm_messages(queue_id, message_group_id, sequence_number ASC)
    WHERE message_group_id IS NOT NULL;

-- Deduplication lookup
CREATE INDEX IF NOT EXISTS idx_vqm_messages_dedup
    ON vqm_messages(queue_id, deduplication_id, created_at DESC)
    WHERE deduplication_id IS NOT NULL;

-- Batch processing
CREATE INDEX IF NOT EXISTS idx_vqm_messages_batch
    ON vqm_messages(batch_id, batch_index ASC)
    WHERE batch_id IS NOT NULL;

-- Created timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_vqm_messages_created
    ON vqm_messages(created_at DESC);

-- Failed messages for retry dashboard
CREATE INDEX IF NOT EXISTS idx_vqm_messages_failed
    ON vqm_messages(queue_id, failed_at DESC)
    WHERE status = 'failed';

-- Dead letter messages for DLQ dashboard
CREATE INDEX IF NOT EXISTS idx_vqm_messages_dead
    ON vqm_messages(queue_id, moved_to_dlq_at DESC)
    WHERE status = 'dead';

-- Worker lookup for current jobs
CREATE INDEX IF NOT EXISTS idx_vqm_messages_locked_by
    ON vqm_messages(locked_by)
    WHERE locked_by IS NOT NULL AND status = 'processing';

-- Payload search (GIN index - use sparingly due to size)
CREATE INDEX IF NOT EXISTS idx_vqm_messages_payload
    ON vqm_messages USING GIN(payload jsonb_path_ops);

-- Headers search
CREATE INDEX IF NOT EXISTS idx_vqm_messages_headers
    ON vqm_messages USING GIN(headers jsonb_path_ops);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Auto-update timestamp
CREATE TRIGGER vqm_messages_update_timestamp
    BEFORE UPDATE ON vqm_messages
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Calculate payload size on insert/update
CREATE OR REPLACE FUNCTION vqm_calculate_payload_size()
RETURNS TRIGGER AS $$
BEGIN
    NEW.payload_size_bytes = octet_length(NEW.payload::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_messages_calc_payload_size
    BEFORE INSERT OR UPDATE OF payload ON vqm_messages
    FOR EACH ROW
    EXECUTE FUNCTION vqm_calculate_payload_size();

-- Track processing times
CREATE OR REPLACE FUNCTION vqm_track_processing_times()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate wait time when processing starts
    IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
        NEW.wait_time_ms = EXTRACT(EPOCH FROM (NEW.started_at - NEW.created_at)) * 1000;
    END IF;

    -- Calculate processing time when completed
    IF NEW.status IN ('completed', 'failed') AND OLD.status = 'processing' THEN
        IF NEW.started_at IS NOT NULL THEN
            NEW.processing_time_ms = EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, NEW.failed_at) - NEW.started_at)) * 1000;
            NEW.total_time_ms = EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, NEW.failed_at) - NEW.created_at)) * 1000;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_messages_track_times
    BEFORE UPDATE ON vqm_messages
    FOR EACH ROW
    EXECUTE FUNCTION vqm_track_processing_times();

-- Update queue last_activity_at
CREATE OR REPLACE FUNCTION vqm_update_queue_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vqm_queues
    SET last_activity_at = CURRENT_TIMESTAMP
    WHERE id = NEW.queue_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_messages_update_queue_activity
    AFTER INSERT OR UPDATE OF status ON vqm_messages
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_queue_activity();

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_messages IS 'Queue messages with full lifecycle tracking';
COMMENT ON COLUMN vqm_messages.correlation_id IS 'Groups related messages across queues for distributed tracing';
COMMENT ON COLUMN vqm_messages.causation_id IS 'References the message that caused this message to be created';
COMMENT ON COLUMN vqm_messages.visibility_timeout_ms IS 'Time message is hidden while being processed';
COMMENT ON COLUMN vqm_messages.message_group_id IS 'Groups messages for FIFO ordering within a queue';
COMMENT ON COLUMN vqm_messages.deduplication_id IS 'Unique ID for deduplication within the deduplication window';
COMMENT ON COLUMN vqm_messages.lock_token IS 'Token required to complete or fail a locked message';
