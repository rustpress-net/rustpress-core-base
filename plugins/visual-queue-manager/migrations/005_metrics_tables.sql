-- =============================================================================
-- Migration 005: Metrics Tables
-- =============================================================================
-- Visual Queue Manager - Metrics collection and aggregation
--
-- This migration creates tables for:
-- - Real-time metrics snapshots
-- - Hourly aggregated statistics
-- - Daily summaries
-- - Alert thresholds and notifications
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Real-time Metrics Snapshots Table
-- -----------------------------------------------------------------------------
-- Captures point-in-time metrics for queues (collected every 5 minutes)

CREATE TABLE IF NOT EXISTS vqm_metrics_snapshots (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Queue reference (NULL = system-wide metrics)
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,

    -- Snapshot timestamp
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Message counts by status
    pending_count BIGINT NOT NULL DEFAULT 0,
    scheduled_count BIGINT NOT NULL DEFAULT 0,
    processing_count BIGINT NOT NULL DEFAULT 0,
    completed_count BIGINT NOT NULL DEFAULT 0,
    failed_count BIGINT NOT NULL DEFAULT 0,
    dead_count BIGINT NOT NULL DEFAULT 0,
    cancelled_count BIGINT NOT NULL DEFAULT 0,
    expired_count BIGINT NOT NULL DEFAULT 0,

    -- Throughput metrics
    throughput_per_second DOUBLE PRECISION NOT NULL DEFAULT 0,
    throughput_per_minute DOUBLE PRECISION NOT NULL DEFAULT 0,
    enqueue_rate_per_second DOUBLE PRECISION NOT NULL DEFAULT 0,
    dequeue_rate_per_second DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Latency metrics (in milliseconds)
    avg_wait_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    avg_processing_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    avg_total_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Latency percentiles
    p50_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p75_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p90_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p95_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p99_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Error metrics
    error_count BIGINT NOT NULL DEFAULT 0,
    error_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    retry_count BIGINT NOT NULL DEFAULT 0,
    retry_rate DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Worker metrics
    worker_count INTEGER NOT NULL DEFAULT 0,
    active_worker_count INTEGER NOT NULL DEFAULT 0,
    idle_worker_count INTEGER NOT NULL DEFAULT 0,
    busy_worker_count INTEGER NOT NULL DEFAULT 0,

    -- Resource metrics
    memory_usage_bytes BIGINT NOT NULL DEFAULT 0,
    cpu_usage_percent DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Queue depth metrics
    queue_depth INTEGER NOT NULL DEFAULT 0,
    oldest_message_age_seconds BIGINT DEFAULT NULL,

    -- Backpressure indicators
    saturation_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
    backlog_growth_rate DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Hourly Aggregated Statistics Table
-- -----------------------------------------------------------------------------
-- Aggregated statistics per hour for reporting and dashboards

CREATE TABLE IF NOT EXISTS vqm_metrics_hourly (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Queue reference
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,

    -- Time bucket
    hour_start TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Message volumes
    messages_enqueued BIGINT NOT NULL DEFAULT 0,
    messages_processed BIGINT NOT NULL DEFAULT 0,
    messages_completed BIGINT NOT NULL DEFAULT 0,
    messages_failed BIGINT NOT NULL DEFAULT 0,
    messages_retried BIGINT NOT NULL DEFAULT 0,
    messages_dead BIGINT NOT NULL DEFAULT 0,

    -- Throughput statistics
    avg_throughput DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_throughput DOUBLE PRECISION NOT NULL DEFAULT 0,
    min_throughput DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Latency statistics
    avg_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    min_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p50_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p95_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p99_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Queue depth statistics
    avg_queue_depth DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_queue_depth INTEGER NOT NULL DEFAULT 0,
    min_queue_depth INTEGER NOT NULL DEFAULT 0,

    -- Worker statistics
    avg_worker_count DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_worker_count INTEGER NOT NULL DEFAULT 0,

    -- Error statistics
    error_count BIGINT NOT NULL DEFAULT 0,
    error_rate DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Success rate
    success_rate DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Resource usage
    avg_memory_bytes BIGINT NOT NULL DEFAULT 0,
    max_memory_bytes BIGINT NOT NULL DEFAULT 0,
    avg_cpu_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_cpu_percent DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Unique constraint for upsert
    CONSTRAINT vqm_hourly_unique UNIQUE (queue_id, hour_start)
);

-- -----------------------------------------------------------------------------
-- Daily Summary Statistics Table
-- -----------------------------------------------------------------------------
-- Daily aggregated statistics for long-term reporting

CREATE TABLE IF NOT EXISTS vqm_metrics_daily (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Queue reference
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,

    -- Date
    date DATE NOT NULL,

    -- Message volumes
    messages_enqueued BIGINT NOT NULL DEFAULT 0,
    messages_processed BIGINT NOT NULL DEFAULT 0,
    messages_completed BIGINT NOT NULL DEFAULT 0,
    messages_failed BIGINT NOT NULL DEFAULT 0,
    messages_dead BIGINT NOT NULL DEFAULT 0,

    -- Performance metrics
    avg_throughput DOUBLE PRECISION NOT NULL DEFAULT 0,
    peak_throughput DOUBLE PRECISION NOT NULL DEFAULT 0,
    avg_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p95_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    p99_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Queue depth
    avg_queue_depth DOUBLE PRECISION NOT NULL DEFAULT 0,
    peak_queue_depth INTEGER NOT NULL DEFAULT 0,

    -- Success/error rates
    success_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    error_rate DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Worker utilization
    avg_worker_utilization DOUBLE PRECISION NOT NULL DEFAULT 0,
    peak_worker_count INTEGER NOT NULL DEFAULT 0,

    -- SLA metrics
    sla_met_percent DOUBLE PRECISION NOT NULL DEFAULT 100,
    sla_breaches INTEGER NOT NULL DEFAULT 0,

    -- Unique constraint
    CONSTRAINT vqm_daily_unique UNIQUE (queue_id, date)
);

-- -----------------------------------------------------------------------------
-- Alert Rules Table
-- -----------------------------------------------------------------------------
-- Define alerting thresholds and conditions

CREATE TABLE IF NOT EXISTS vqm_alert_rules (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Alert identification
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Scope
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,
    is_global BOOLEAN NOT NULL DEFAULT false,

    -- Alert type
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning',

    -- Condition
    metric_name VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    threshold_value DOUBLE PRECISION NOT NULL,
    threshold_unit VARCHAR(50) DEFAULT NULL,

    -- Duration requirement (must be true for this long)
    duration_seconds INTEGER NOT NULL DEFAULT 0,

    -- Notification settings
    notification_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
    notification_template TEXT DEFAULT NULL,

    -- Cooldown
    cooldown_seconds INTEGER NOT NULL DEFAULT 300,
    last_triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_triggered BOOLEAN NOT NULL DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    triggered_value DOUBLE PRECISION DEFAULT NULL,

    -- Statistics
    trigger_count BIGINT NOT NULL DEFAULT 0,
    last_evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Constraints
    CONSTRAINT vqm_alerts_valid_type CHECK (
        alert_type IN ('threshold', 'anomaly', 'trend', 'absence', 'composite')
    ),
    CONSTRAINT vqm_alerts_valid_severity CHECK (
        severity IN ('info', 'warning', 'error', 'critical')
    ),
    CONSTRAINT vqm_alerts_valid_operator CHECK (
        operator IN ('gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'between', 'outside')
    ),
    CONSTRAINT vqm_alerts_name_unique UNIQUE (name)
);

-- -----------------------------------------------------------------------------
-- Alert History Table
-- -----------------------------------------------------------------------------
-- Track alert triggers and resolutions

CREATE TABLE IF NOT EXISTS vqm_alert_history (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Alert reference
    alert_rule_id UUID NOT NULL REFERENCES vqm_alert_rules(id) ON DELETE CASCADE,
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE SET NULL,

    -- Trigger details
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Values
    trigger_value DOUBLE PRECISION NOT NULL,
    threshold_value DOUBLE PRECISION NOT NULL,
    metric_name VARCHAR(100) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'triggered',
    severity VARCHAR(20) NOT NULL,

    -- Notification tracking
    notifications_sent JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Resolution
    resolution_type VARCHAR(50) DEFAULT NULL,
    resolution_notes TEXT DEFAULT NULL,
    resolved_by UUID DEFAULT NULL,

    -- Constraints
    CONSTRAINT vqm_alert_history_valid_status CHECK (
        status IN ('triggered', 'acknowledged', 'resolved', 'auto_resolved', 'escalated')
    )
);

-- -----------------------------------------------------------------------------
-- Indexes for Metrics Snapshots
-- -----------------------------------------------------------------------------

-- Primary query: get snapshots for a queue over time
CREATE INDEX IF NOT EXISTS idx_vqm_snapshots_queue_time
    ON vqm_metrics_snapshots(queue_id, snapshot_time DESC);

-- System-wide metrics
CREATE INDEX IF NOT EXISTS idx_vqm_snapshots_system_time
    ON vqm_metrics_snapshots(snapshot_time DESC)
    WHERE queue_id IS NULL;

-- Time-based cleanup
CREATE INDEX IF NOT EXISTS idx_vqm_snapshots_time
    ON vqm_metrics_snapshots(snapshot_time);

-- High error rate snapshots
CREATE INDEX IF NOT EXISTS idx_vqm_snapshots_errors
    ON vqm_metrics_snapshots(queue_id, snapshot_time DESC)
    WHERE error_rate > 0;

-- -----------------------------------------------------------------------------
-- Indexes for Hourly Metrics
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_hourly_queue_time
    ON vqm_metrics_hourly(queue_id, hour_start DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_hourly_time
    ON vqm_metrics_hourly(hour_start DESC);

-- -----------------------------------------------------------------------------
-- Indexes for Daily Metrics
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_daily_queue_date
    ON vqm_metrics_daily(queue_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_daily_date
    ON vqm_metrics_daily(date DESC);

-- -----------------------------------------------------------------------------
-- Indexes for Alert Rules
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_alerts_queue
    ON vqm_alert_rules(queue_id)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vqm_alerts_global
    ON vqm_alert_rules(is_global)
    WHERE is_global = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_vqm_alerts_triggered
    ON vqm_alert_rules(is_triggered)
    WHERE is_triggered = true;

CREATE INDEX IF NOT EXISTS idx_vqm_alerts_severity
    ON vqm_alert_rules(severity)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vqm_alerts_tags
    ON vqm_alert_rules USING GIN(tags);

-- -----------------------------------------------------------------------------
-- Indexes for Alert History
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_alert_history_rule
    ON vqm_alert_history(alert_rule_id, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_alert_history_queue
    ON vqm_alert_history(queue_id, triggered_at DESC)
    WHERE queue_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vqm_alert_history_time
    ON vqm_alert_history(triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_alert_history_unresolved
    ON vqm_alert_history(triggered_at DESC)
    WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vqm_alert_history_severity
    ON vqm_alert_history(severity, triggered_at DESC);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

CREATE TRIGGER vqm_alert_rules_update_timestamp
    BEFORE UPDATE ON vqm_alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- -----------------------------------------------------------------------------
-- Functions for Metrics Aggregation
-- -----------------------------------------------------------------------------

-- Aggregate hourly statistics from snapshots
CREATE OR REPLACE FUNCTION vqm_aggregate_hourly_stats(p_hour TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    target_hour TIMESTAMP WITH TIME ZONE;
    affected_count INTEGER := 0;
BEGIN
    -- Default to previous hour
    target_hour := COALESCE(p_hour, date_trunc('hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'));

    -- Aggregate for each queue
    INSERT INTO vqm_metrics_hourly (
        queue_id, hour_start,
        messages_enqueued, messages_processed, messages_completed,
        messages_failed, messages_retried, messages_dead,
        avg_throughput, max_throughput, min_throughput,
        avg_latency_ms, max_latency_ms, min_latency_ms,
        p50_latency_ms, p95_latency_ms, p99_latency_ms,
        avg_queue_depth, max_queue_depth, min_queue_depth,
        avg_worker_count, max_worker_count,
        error_count, error_rate, success_rate
    )
    SELECT
        queue_id,
        target_hour,
        MAX(completed_count) - MIN(completed_count) + MAX(failed_count) - MIN(failed_count),
        MAX(completed_count) - MIN(completed_count) + MAX(failed_count) - MIN(failed_count),
        MAX(completed_count) - MIN(completed_count),
        MAX(failed_count) - MIN(failed_count),
        SUM(retry_count),
        MAX(dead_count) - MIN(dead_count),
        AVG(throughput_per_second),
        MAX(throughput_per_second),
        MIN(NULLIF(throughput_per_second, 0)),
        AVG(avg_processing_time_ms),
        MAX(max_latency_ms),
        MIN(NULLIF(avg_processing_time_ms, 0)),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY avg_processing_time_ms),
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY avg_processing_time_ms),
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY avg_processing_time_ms),
        AVG(queue_depth),
        MAX(queue_depth),
        MIN(queue_depth),
        AVG(worker_count),
        MAX(worker_count),
        SUM(error_count),
        AVG(error_rate),
        1.0 - AVG(error_rate)
    FROM vqm_metrics_snapshots
    WHERE snapshot_time >= target_hour
      AND snapshot_time < target_hour + INTERVAL '1 hour'
    GROUP BY queue_id
    ON CONFLICT (queue_id, hour_start)
    DO UPDATE SET
        messages_enqueued = EXCLUDED.messages_enqueued,
        messages_processed = EXCLUDED.messages_processed,
        messages_completed = EXCLUDED.messages_completed,
        messages_failed = EXCLUDED.messages_failed,
        avg_throughput = EXCLUDED.avg_throughput,
        max_throughput = EXCLUDED.max_throughput,
        avg_latency_ms = EXCLUDED.avg_latency_ms,
        max_latency_ms = EXCLUDED.max_latency_ms,
        avg_queue_depth = EXCLUDED.avg_queue_depth,
        max_queue_depth = EXCLUDED.max_queue_depth,
        error_rate = EXCLUDED.error_rate,
        success_rate = EXCLUDED.success_rate;

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Get current queue metrics
CREATE OR REPLACE FUNCTION vqm_get_queue_metrics(p_queue_id UUID)
RETURNS TABLE (
    pending_count BIGINT,
    processing_count BIGINT,
    completed_count BIGINT,
    failed_count BIGINT,
    dead_count BIGINT,
    throughput DOUBLE PRECISION,
    avg_latency_ms DOUBLE PRECISION,
    error_rate DOUBLE PRECISION,
    worker_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.pending_count,
        s.processing_count,
        s.completed_count,
        s.failed_count,
        s.dead_count,
        s.throughput_per_second,
        s.avg_processing_time_ms,
        s.error_rate,
        s.worker_count
    FROM vqm_metrics_snapshots s
    WHERE s.queue_id = p_queue_id
    ORDER BY s.snapshot_time DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Clean up old metrics
CREATE OR REPLACE FUNCTION vqm_cleanup_old_metrics(
    p_snapshots_days INTEGER DEFAULT 7,
    p_hourly_days INTEGER DEFAULT 90,
    p_daily_days INTEGER DEFAULT 365
)
RETURNS TABLE (
    snapshots_deleted BIGINT,
    hourly_deleted BIGINT,
    daily_deleted BIGINT
) AS $$
DECLARE
    v_snapshots BIGINT;
    v_hourly BIGINT;
    v_daily BIGINT;
BEGIN
    DELETE FROM vqm_metrics_snapshots
    WHERE snapshot_time < CURRENT_TIMESTAMP - (p_snapshots_days || ' days')::INTERVAL;
    GET DIAGNOSTICS v_snapshots = ROW_COUNT;

    DELETE FROM vqm_metrics_hourly
    WHERE hour_start < CURRENT_TIMESTAMP - (p_hourly_days || ' days')::INTERVAL;
    GET DIAGNOSTICS v_hourly = ROW_COUNT;

    DELETE FROM vqm_metrics_daily
    WHERE date < CURRENT_DATE - p_daily_days;
    GET DIAGNOSTICS v_daily = ROW_COUNT;

    RETURN QUERY SELECT v_snapshots, v_hourly, v_daily;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_metrics_snapshots IS 'Point-in-time metrics snapshots collected every 5 minutes';
COMMENT ON TABLE vqm_metrics_hourly IS 'Hourly aggregated statistics for dashboards and reporting';
COMMENT ON TABLE vqm_metrics_daily IS 'Daily summary statistics for long-term reporting';
COMMENT ON TABLE vqm_alert_rules IS 'Alert threshold definitions and configuration';
COMMENT ON TABLE vqm_alert_history IS 'Historical record of triggered alerts';
COMMENT ON FUNCTION vqm_aggregate_hourly_stats IS 'Aggregate snapshot data into hourly statistics';
COMMENT ON FUNCTION vqm_cleanup_old_metrics IS 'Clean up old metrics data based on retention settings';
