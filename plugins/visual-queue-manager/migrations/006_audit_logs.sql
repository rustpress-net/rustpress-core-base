-- =============================================================================
-- Migration 006: Audit Logs
-- =============================================================================
-- Visual Queue Manager - Comprehensive audit logging for compliance
--
-- This migration creates tables for:
-- - Audit log entries
-- - Change tracking
-- - Session management
-- - Compliance reporting
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Audit Logs Table
-- -----------------------------------------------------------------------------
-- Comprehensive audit logging for all actions within the queue manager

CREATE TABLE IF NOT EXISTS vqm_audit_logs (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Timestamp (with high precision)
    event_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Event classification
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL DEFAULT 'general',
    severity VARCHAR(20) NOT NULL DEFAULT 'info',

    -- Entity being acted upon
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID DEFAULT NULL,
    entity_name VARCHAR(255) DEFAULT NULL,

    -- Action performed
    action VARCHAR(50) NOT NULL,
    action_result VARCHAR(20) NOT NULL DEFAULT 'success',

    -- Actor information
    actor_id UUID DEFAULT NULL,
    actor_name VARCHAR(255) DEFAULT NULL,
    actor_type VARCHAR(50) NOT NULL DEFAULT 'user',
    actor_ip INET DEFAULT NULL,
    actor_user_agent TEXT DEFAULT NULL,

    -- Request context
    request_id UUID DEFAULT NULL,
    session_id UUID DEFAULT NULL,
    correlation_id UUID DEFAULT NULL,

    -- Change tracking
    old_values JSONB DEFAULT NULL,
    new_values JSONB DEFAULT NULL,
    changes JSONB DEFAULT NULL,

    -- Additional context
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Error information (if action failed)
    error_code VARCHAR(100) DEFAULT NULL,
    error_message TEXT DEFAULT NULL,

    -- Performance
    duration_ms INTEGER DEFAULT NULL,

    -- Retention
    retention_until DATE DEFAULT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,

    -- Constraints
    CONSTRAINT vqm_audit_valid_severity CHECK (
        severity IN ('debug', 'info', 'warning', 'error', 'critical')
    ),
    CONSTRAINT vqm_audit_valid_result CHECK (
        action_result IN ('success', 'failure', 'partial', 'denied', 'error')
    ),
    CONSTRAINT vqm_audit_valid_actor_type CHECK (
        actor_type IN ('user', 'system', 'api', 'worker', 'scheduler', 'webhook')
    )
);

-- -----------------------------------------------------------------------------
-- Audit Sessions Table
-- -----------------------------------------------------------------------------
-- Track user sessions for audit context

CREATE TABLE IF NOT EXISTS vqm_audit_sessions (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User information
    user_id UUID NOT NULL,
    user_name VARCHAR(255) DEFAULT NULL,
    user_email VARCHAR(255) DEFAULT NULL,

    -- Session details
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Client information
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    client_type VARCHAR(50) DEFAULT NULL,

    -- Location (if available)
    country_code CHAR(2) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,

    -- Security
    is_active BOOLEAN NOT NULL DEFAULT true,
    termination_reason VARCHAR(100) DEFAULT NULL,

    -- Statistics
    action_count INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- Data Change Log Table
-- -----------------------------------------------------------------------------
-- Detailed tracking of data changes for specific entities

CREATE TABLE IF NOT EXISTS vqm_change_log (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Timestamp
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Entity reference
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,

    -- Change type
    operation VARCHAR(10) NOT NULL,

    -- Change details
    old_data JSONB DEFAULT NULL,
    new_data JSONB DEFAULT NULL,
    changed_fields TEXT[] DEFAULT NULL,

    -- Actor
    changed_by UUID DEFAULT NULL,
    changed_by_name VARCHAR(255) DEFAULT NULL,

    -- Context
    transaction_id BIGINT DEFAULT NULL,
    statement_id INTEGER DEFAULT NULL,

    -- Constraints
    CONSTRAINT vqm_change_valid_operation CHECK (
        operation IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
    )
);

-- -----------------------------------------------------------------------------
-- Compliance Reports Table
-- -----------------------------------------------------------------------------
-- Store generated compliance and audit reports

CREATE TABLE IF NOT EXISTS vqm_compliance_reports (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Report identification
    report_type VARCHAR(100) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Time range
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Report content
    report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Generation details
    generated_by UUID DEFAULT NULL,
    generation_time_ms INTEGER DEFAULT NULL,

    -- File storage (if exported)
    file_path VARCHAR(500) DEFAULT NULL,
    file_format VARCHAR(20) DEFAULT NULL,
    file_size_bytes BIGINT DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT vqm_reports_valid_status CHECK (
        status IN ('pending', 'generating', 'completed', 'failed', 'expired')
    )
);

-- -----------------------------------------------------------------------------
-- Indexes for Audit Logs
-- -----------------------------------------------------------------------------

-- Time-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_vqm_audit_time
    ON vqm_audit_logs(event_time DESC);

-- Filter by event type
CREATE INDEX IF NOT EXISTS idx_vqm_audit_event_type
    ON vqm_audit_logs(event_type, event_time DESC);

-- Filter by category
CREATE INDEX IF NOT EXISTS idx_vqm_audit_category
    ON vqm_audit_logs(event_category, event_time DESC);

-- Filter by entity
CREATE INDEX IF NOT EXISTS idx_vqm_audit_entity
    ON vqm_audit_logs(entity_type, entity_id, event_time DESC);

-- Filter by actor
CREATE INDEX IF NOT EXISTS idx_vqm_audit_actor
    ON vqm_audit_logs(actor_id, event_time DESC)
    WHERE actor_id IS NOT NULL;

-- Filter by action
CREATE INDEX IF NOT EXISTS idx_vqm_audit_action
    ON vqm_audit_logs(action, event_time DESC);

-- Filter by result (find failures)
CREATE INDEX IF NOT EXISTS idx_vqm_audit_failures
    ON vqm_audit_logs(event_time DESC)
    WHERE action_result IN ('failure', 'denied', 'error');

-- Correlation tracking
CREATE INDEX IF NOT EXISTS idx_vqm_audit_correlation
    ON vqm_audit_logs(correlation_id)
    WHERE correlation_id IS NOT NULL;

-- Request tracking
CREATE INDEX IF NOT EXISTS idx_vqm_audit_request
    ON vqm_audit_logs(request_id)
    WHERE request_id IS NOT NULL;

-- Session tracking
CREATE INDEX IF NOT EXISTS idx_vqm_audit_session
    ON vqm_audit_logs(session_id, event_time DESC)
    WHERE session_id IS NOT NULL;

-- Severity filtering
CREATE INDEX IF NOT EXISTS idx_vqm_audit_severity
    ON vqm_audit_logs(severity, event_time DESC)
    WHERE severity IN ('warning', 'error', 'critical');

-- Tags search
CREATE INDEX IF NOT EXISTS idx_vqm_audit_tags
    ON vqm_audit_logs USING GIN(tags);

-- Metadata search
CREATE INDEX IF NOT EXISTS idx_vqm_audit_metadata
    ON vqm_audit_logs USING GIN(metadata jsonb_path_ops);

-- Retention cleanup
CREATE INDEX IF NOT EXISTS idx_vqm_audit_retention
    ON vqm_audit_logs(retention_until)
    WHERE retention_until IS NOT NULL;

-- IP address lookup
CREATE INDEX IF NOT EXISTS idx_vqm_audit_ip
    ON vqm_audit_logs(actor_ip)
    WHERE actor_ip IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Indexes for Sessions
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_sessions_user
    ON vqm_audit_sessions(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_sessions_active
    ON vqm_audit_sessions(last_activity_at DESC)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vqm_sessions_ip
    ON vqm_audit_sessions(ip_address)
    WHERE ip_address IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Indexes for Change Log
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_changes_record
    ON vqm_change_log(table_name, record_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_changes_time
    ON vqm_change_log(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_changes_user
    ON vqm_change_log(changed_by, changed_at DESC)
    WHERE changed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vqm_changes_operation
    ON vqm_change_log(operation, changed_at DESC);

-- -----------------------------------------------------------------------------
-- Indexes for Compliance Reports
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_reports_type
    ON vqm_compliance_reports(report_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_reports_period
    ON vqm_compliance_reports(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_vqm_reports_status
    ON vqm_compliance_reports(status)
    WHERE status NOT IN ('completed', 'expired');

-- -----------------------------------------------------------------------------
-- Functions for Audit Logging
-- -----------------------------------------------------------------------------

-- Log an audit event
CREATE OR REPLACE FUNCTION vqm_log_audit(
    p_event_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_action VARCHAR(50),
    p_entity_id UUID DEFAULT NULL,
    p_entity_name VARCHAR(255) DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_actor_name VARCHAR(255) DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_severity VARCHAR(20) DEFAULT 'info',
    p_action_result VARCHAR(20) DEFAULT 'success'
)
RETURNS BIGINT AS $$
DECLARE
    v_id BIGINT;
    v_changes JSONB;
BEGIN
    -- Calculate changes if both old and new values provided
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        SELECT jsonb_object_agg(key, jsonb_build_object('old', p_old_values->key, 'new', value))
        INTO v_changes
        FROM jsonb_each(p_new_values)
        WHERE p_old_values->key IS DISTINCT FROM value;
    END IF;

    INSERT INTO vqm_audit_logs (
        event_type, entity_type, entity_id, entity_name,
        action, action_result, severity,
        actor_id, actor_name,
        old_values, new_values, changes,
        metadata
    ) VALUES (
        p_event_type, p_entity_type, p_entity_id, p_entity_name,
        p_action, p_action_result, p_severity,
        p_actor_id, p_actor_name,
        p_old_values, p_new_values, v_changes,
        p_metadata
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Search audit logs with filters
CREATE OR REPLACE FUNCTION vqm_search_audit_logs(
    p_start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_event_types TEXT[] DEFAULT NULL,
    p_entity_types TEXT[] DEFAULT NULL,
    p_actions TEXT[] DEFAULT NULL,
    p_actor_ids UUID[] DEFAULT NULL,
    p_severities TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    event_time TIMESTAMP WITH TIME ZONE,
    event_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    entity_name VARCHAR(255),
    action VARCHAR(50),
    action_result VARCHAR(20),
    severity VARCHAR(20),
    actor_id UUID,
    actor_name VARCHAR(255),
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.event_time,
        l.event_type,
        l.entity_type,
        l.entity_id,
        l.entity_name,
        l.action,
        l.action_result,
        l.severity,
        l.actor_id,
        l.actor_name,
        l.metadata
    FROM vqm_audit_logs l
    WHERE
        (p_start_time IS NULL OR l.event_time >= p_start_time)
        AND (p_end_time IS NULL OR l.event_time <= p_end_time)
        AND (p_event_types IS NULL OR l.event_type = ANY(p_event_types))
        AND (p_entity_types IS NULL OR l.entity_type = ANY(p_entity_types))
        AND (p_actions IS NULL OR l.action = ANY(p_actions))
        AND (p_actor_ids IS NULL OR l.actor_id = ANY(p_actor_ids))
        AND (p_severities IS NULL OR l.severity = ANY(p_severities))
    ORDER BY l.event_time DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Clean up old audit logs
CREATE OR REPLACE FUNCTION vqm_cleanup_audit_logs(p_retention_days INTEGER DEFAULT 365)
RETURNS BIGINT AS $$
DECLARE
    deleted_count BIGINT;
BEGIN
    -- Delete logs past their explicit retention date
    DELETE FROM vqm_audit_logs
    WHERE retention_until IS NOT NULL AND retention_until < CURRENT_DATE;

    -- Delete old logs based on default retention
    DELETE FROM vqm_audit_logs
    WHERE retention_until IS NULL
      AND event_time < CURRENT_TIMESTAMP - (p_retention_days || ' days')::INTERVAL
      AND is_sensitive = false;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Generate audit summary for a time period
CREATE OR REPLACE FUNCTION vqm_audit_summary(
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    event_type VARCHAR(50),
    action VARCHAR(50),
    total_count BIGINT,
    success_count BIGINT,
    failure_count BIGINT,
    unique_actors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.event_type,
        l.action,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE l.action_result = 'success') as success_count,
        COUNT(*) FILTER (WHERE l.action_result IN ('failure', 'error', 'denied')) as failure_count,
        COUNT(DISTINCT l.actor_id) as unique_actors
    FROM vqm_audit_logs l
    WHERE l.event_time >= p_start_time AND l.event_time <= p_end_time
    GROUP BY l.event_type, l.action
    ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Trigger for Automatic Change Logging
-- -----------------------------------------------------------------------------

-- Generic change logging trigger function
CREATE OR REPLACE FUNCTION vqm_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO vqm_change_log (table_name, record_id, operation, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO vqm_change_log (table_name, record_id, operation, old_data, new_data, changed_fields)
        VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            to_jsonb(OLD),
            to_jsonb(NEW),
            ARRAY(
                SELECT key
                FROM jsonb_each(to_jsonb(OLD)) old_kv
                WHERE to_jsonb(NEW)->key IS DISTINCT FROM old_kv.value
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO vqm_change_log (table_name, record_id, operation, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply change logging to main tables
CREATE TRIGGER vqm_queues_change_log
    AFTER INSERT OR UPDATE OR DELETE ON vqm_queues
    FOR EACH ROW EXECUTE FUNCTION vqm_log_changes();

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_audit_logs IS 'Comprehensive audit log for all queue manager actions';
COMMENT ON TABLE vqm_audit_sessions IS 'User session tracking for audit context';
COMMENT ON TABLE vqm_change_log IS 'Detailed data change tracking for specific entities';
COMMENT ON TABLE vqm_compliance_reports IS 'Generated compliance and audit reports';
COMMENT ON FUNCTION vqm_log_audit IS 'Helper function to create audit log entries';
COMMENT ON FUNCTION vqm_search_audit_logs IS 'Search audit logs with various filters';
COMMENT ON FUNCTION vqm_audit_summary IS 'Generate summary statistics for audit logs';
