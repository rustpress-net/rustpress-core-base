-- =============================================================================
-- Migration 003: Workers Table
-- =============================================================================
-- Visual Queue Manager - Worker registration and tracking
--
-- This migration creates tables for:
-- - Worker registration and heartbeat tracking
-- - Worker group management
-- - Processing statistics per worker
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Worker Registration Table
-- -----------------------------------------------------------------------------
-- Tracks all active and historical workers processing queue messages

CREATE TABLE IF NOT EXISTS vqm_workers (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Worker identification
    worker_name VARCHAR(255) NOT NULL,
    worker_group VARCHAR(100) DEFAULT NULL,
    worker_type VARCHAR(50) NOT NULL DEFAULT 'standard',

    -- Host information
    hostname VARCHAR(255) NOT NULL,
    ip_address INET DEFAULT NULL,
    pid INTEGER NOT NULL,

    -- Configuration
    queues JSONB NOT NULL DEFAULT '[]'::jsonb,
    concurrency INTEGER NOT NULL DEFAULT 1,
    max_memory_mb INTEGER DEFAULT NULL,
    max_jobs INTEGER DEFAULT NULL,

    -- Current state
    status VARCHAR(20) NOT NULL DEFAULT 'starting',
    current_job_id UUID DEFAULT NULL,
    current_jobs JSONB NOT NULL DEFAULT '[]'::jsonb,
    jobs_in_progress INTEGER NOT NULL DEFAULT 0,

    -- Heartbeat tracking
    last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    heartbeat_interval_ms INTEGER NOT NULL DEFAULT 5000,
    missed_heartbeats INTEGER NOT NULL DEFAULT 0,

    -- Lifecycle timestamps
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stopped_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    paused_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_job_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Statistics
    jobs_processed BIGINT NOT NULL DEFAULT 0,
    jobs_succeeded BIGINT NOT NULL DEFAULT 0,
    jobs_failed BIGINT NOT NULL DEFAULT 0,
    jobs_retried BIGINT NOT NULL DEFAULT 0,
    total_processing_time_ms BIGINT NOT NULL DEFAULT 0,
    avg_processing_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Resource usage
    memory_usage_bytes BIGINT DEFAULT NULL,
    cpu_usage_percent DOUBLE PRECISION DEFAULT NULL,

    -- Version info
    worker_version VARCHAR(50) DEFAULT NULL,
    plugin_version VARCHAR(50) DEFAULT NULL,

    -- Extended metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Constraints
    CONSTRAINT vqm_workers_valid_status CHECK (
        status IN ('starting', 'idle', 'busy', 'paused', 'stopping', 'stopped', 'dead')
    ),
    CONSTRAINT vqm_workers_valid_type CHECK (
        worker_type IN ('standard', 'priority', 'dedicated', 'ephemeral')
    ),
    CONSTRAINT vqm_workers_valid_concurrency CHECK (concurrency >= 1 AND concurrency <= 1000)
);

-- -----------------------------------------------------------------------------
-- Worker Groups Table
-- -----------------------------------------------------------------------------
-- Organize workers into groups for management and scaling

CREATE TABLE IF NOT EXISTS vqm_worker_groups (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Group identification
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Configuration
    min_workers INTEGER NOT NULL DEFAULT 1,
    max_workers INTEGER NOT NULL DEFAULT 10,
    target_workers INTEGER NOT NULL DEFAULT 1,

    -- Auto-scaling settings
    auto_scale_enabled BOOLEAN NOT NULL DEFAULT false,
    scale_up_threshold INTEGER DEFAULT 80,
    scale_down_threshold INTEGER DEFAULT 20,
    scale_up_step INTEGER DEFAULT 1,
    scale_down_step INTEGER DEFAULT 1,
    scale_cooldown_seconds INTEGER DEFAULT 300,

    -- Queue assignments
    queues JSONB NOT NULL DEFAULT '[]'::jsonb,
    queue_priorities JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Worker configuration template
    worker_config JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_scale_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vqm_worker_groups_name_unique UNIQUE (name),
    CONSTRAINT vqm_worker_groups_valid_workers CHECK (
        min_workers >= 0 AND
        max_workers >= min_workers AND
        target_workers >= min_workers AND
        target_workers <= max_workers
    )
);

-- -----------------------------------------------------------------------------
-- Worker Job History Table
-- -----------------------------------------------------------------------------
-- Track individual job executions by workers (for debugging and analytics)

CREATE TABLE IF NOT EXISTS vqm_worker_job_history (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- References
    worker_id UUID NOT NULL,
    message_id UUID NOT NULL,
    queue_id UUID NOT NULL,

    -- Job details
    message_type VARCHAR(255) NOT NULL,

    -- Execution
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    status VARCHAR(20) NOT NULL,

    -- Performance
    processing_time_ms BIGINT DEFAULT NULL,
    memory_used_bytes BIGINT DEFAULT NULL,

    -- Error tracking
    error_message TEXT DEFAULT NULL,
    error_code VARCHAR(100) DEFAULT NULL,

    -- Attempt tracking
    attempt_number INTEGER NOT NULL DEFAULT 1,

    -- Constraints
    CONSTRAINT vqm_job_history_valid_status CHECK (
        status IN ('started', 'completed', 'failed', 'timeout', 'cancelled')
    )
);

-- -----------------------------------------------------------------------------
-- Indexes for Workers
-- -----------------------------------------------------------------------------

-- Worker status for monitoring
CREATE INDEX IF NOT EXISTS idx_vqm_workers_status
    ON vqm_workers(status);

-- Active workers
CREATE INDEX IF NOT EXISTS idx_vqm_workers_active
    ON vqm_workers(status)
    WHERE status NOT IN ('stopped', 'dead');

-- Heartbeat monitoring (find stale workers)
CREATE INDEX IF NOT EXISTS idx_vqm_workers_heartbeat
    ON vqm_workers(last_heartbeat ASC)
    WHERE status NOT IN ('stopped', 'dead');

-- Worker group membership
CREATE INDEX IF NOT EXISTS idx_vqm_workers_group
    ON vqm_workers(worker_group)
    WHERE worker_group IS NOT NULL;

-- Hostname lookup
CREATE INDEX IF NOT EXISTS idx_vqm_workers_hostname
    ON vqm_workers(hostname);

-- Current job lookup
CREATE INDEX IF NOT EXISTS idx_vqm_workers_current_job
    ON vqm_workers(current_job_id)
    WHERE current_job_id IS NOT NULL;

-- Worker queues (GIN for JSONB array)
CREATE INDEX IF NOT EXISTS idx_vqm_workers_queues
    ON vqm_workers USING GIN(queues);

-- Worker tags
CREATE INDEX IF NOT EXISTS idx_vqm_workers_tags
    ON vqm_workers USING GIN(tags);

-- -----------------------------------------------------------------------------
-- Indexes for Worker Groups
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_worker_groups_active
    ON vqm_worker_groups(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vqm_worker_groups_queues
    ON vqm_worker_groups USING GIN(queues);

-- -----------------------------------------------------------------------------
-- Indexes for Job History
-- -----------------------------------------------------------------------------

-- Worker job history lookup
CREATE INDEX IF NOT EXISTS idx_vqm_job_history_worker
    ON vqm_worker_job_history(worker_id, started_at DESC);

-- Message job history
CREATE INDEX IF NOT EXISTS idx_vqm_job_history_message
    ON vqm_worker_job_history(message_id);

-- Queue job history
CREATE INDEX IF NOT EXISTS idx_vqm_job_history_queue
    ON vqm_worker_job_history(queue_id, started_at DESC);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_vqm_job_history_time
    ON vqm_worker_job_history(started_at DESC);

-- Failed jobs
CREATE INDEX IF NOT EXISTS idx_vqm_job_history_failed
    ON vqm_worker_job_history(queue_id, started_at DESC)
    WHERE status = 'failed';

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Auto-update timestamps
CREATE TRIGGER vqm_workers_update_timestamp
    BEFORE UPDATE ON vqm_workers
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

CREATE TRIGGER vqm_worker_groups_update_timestamp
    BEFORE UPDATE ON vqm_worker_groups
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Update worker statistics on status change
CREATE OR REPLACE FUNCTION vqm_update_worker_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average processing time
    IF NEW.jobs_processed > 0 THEN
        NEW.avg_processing_time_ms = NEW.total_processing_time_ms::DOUBLE PRECISION / NEW.jobs_processed;
    END IF;

    -- Update last job timestamp
    IF NEW.jobs_processed > OLD.jobs_processed THEN
        NEW.last_job_at = CURRENT_TIMESTAMP;
    END IF;

    -- Track pause time
    IF NEW.status = 'paused' AND OLD.status != 'paused' THEN
        NEW.paused_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'paused' AND OLD.status = 'paused' THEN
        NEW.paused_at = NULL;
    END IF;

    -- Track stop time
    IF NEW.status IN ('stopped', 'dead') AND OLD.status NOT IN ('stopped', 'dead') THEN
        NEW.stopped_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_workers_update_stats
    BEFORE UPDATE ON vqm_workers
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_worker_stats();

-- -----------------------------------------------------------------------------
-- Functions for Worker Management
-- -----------------------------------------------------------------------------

-- Function to mark stale workers as dead
CREATE OR REPLACE FUNCTION vqm_mark_stale_workers(stale_threshold_seconds INTEGER DEFAULT 60)
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE vqm_workers
    SET
        status = 'dead',
        stopped_at = CURRENT_TIMESTAMP
    WHERE
        status NOT IN ('stopped', 'dead')
        AND last_heartbeat < CURRENT_TIMESTAMP - (stale_threshold_seconds || ' seconds')::INTERVAL;

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get worker count by group
CREATE OR REPLACE FUNCTION vqm_get_worker_counts_by_group()
RETURNS TABLE (
    worker_group VARCHAR(100),
    total_workers BIGINT,
    active_workers BIGINT,
    idle_workers BIGINT,
    busy_workers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.worker_group,
        COUNT(*) as total_workers,
        COUNT(*) FILTER (WHERE w.status NOT IN ('stopped', 'dead')) as active_workers,
        COUNT(*) FILTER (WHERE w.status = 'idle') as idle_workers,
        COUNT(*) FILTER (WHERE w.status = 'busy') as busy_workers
    FROM vqm_workers w
    GROUP BY w.worker_group;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_workers IS 'Worker registration and heartbeat tracking';
COMMENT ON TABLE vqm_worker_groups IS 'Worker group configuration for scaling and management';
COMMENT ON TABLE vqm_worker_job_history IS 'Historical record of job executions by workers';
COMMENT ON COLUMN vqm_workers.concurrency IS 'Maximum number of concurrent jobs this worker can process';
COMMENT ON COLUMN vqm_workers.heartbeat_interval_ms IS 'Expected interval between heartbeats in milliseconds';
COMMENT ON COLUMN vqm_workers.missed_heartbeats IS 'Count of consecutive missed heartbeats';
COMMENT ON FUNCTION vqm_mark_stale_workers IS 'Marks workers as dead if they have not sent a heartbeat recently';
