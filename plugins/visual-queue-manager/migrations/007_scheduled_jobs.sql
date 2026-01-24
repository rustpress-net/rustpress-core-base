-- =============================================================================
-- Migration 007: Scheduled Jobs
-- =============================================================================
-- Visual Queue Manager - Scheduled and recurring job management
--
-- This migration creates tables for:
-- - Scheduled job definitions
-- - Job execution history
-- - Cron expression support
-- - One-time delayed jobs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Scheduled Jobs Table
-- -----------------------------------------------------------------------------
-- Define recurring and one-time scheduled jobs

CREATE TABLE IF NOT EXISTS vqm_scheduled_jobs (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Job identification
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,

    -- Target queue
    queue_id UUID NOT NULL REFERENCES vqm_queues(id) ON DELETE CASCADE,

    -- Message configuration
    message_type VARCHAR(255) NOT NULL,
    payload_template JSONB NOT NULL,
    headers_template JSONB NOT NULL DEFAULT '{}'::jsonb,
    priority INTEGER NOT NULL DEFAULT 0,

    -- Schedule type
    schedule_type VARCHAR(20) NOT NULL,

    -- Cron schedule (for recurring jobs)
    cron_expression VARCHAR(100) DEFAULT NULL,

    -- Interval schedule (alternative to cron)
    interval_seconds INTEGER DEFAULT NULL,

    -- One-time schedule
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Timezone for schedule interpretation
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',

    -- Execution tracking
    next_run_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_run_status VARCHAR(20) DEFAULT NULL,
    last_run_message_id UUID DEFAULT NULL,
    last_run_duration_ms INTEGER DEFAULT NULL,
    last_run_error TEXT DEFAULT NULL,

    -- Statistics
    run_count BIGINT NOT NULL DEFAULT 0,
    success_count BIGINT NOT NULL DEFAULT 0,
    failure_count BIGINT NOT NULL DEFAULT 0,
    skip_count BIGINT NOT NULL DEFAULT 0,
    total_duration_ms BIGINT NOT NULL DEFAULT 0,
    avg_duration_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_paused BOOLEAN NOT NULL DEFAULT false,

    -- Concurrency control
    allow_concurrent BOOLEAN NOT NULL DEFAULT false,
    max_concurrent INTEGER DEFAULT 1,
    currently_running INTEGER NOT NULL DEFAULT 0,

    -- Retry configuration
    retry_on_failure BOOLEAN NOT NULL DEFAULT true,
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_delay_ms BIGINT NOT NULL DEFAULT 60000,

    -- Expiration (for one-time jobs)
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Execution window (optional time window restriction)
    execution_window_start TIME DEFAULT NULL,
    execution_window_end TIME DEFAULT NULL,
    execution_days INTEGER[] DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Audit
    created_by UUID NOT NULL,
    updated_by UUID DEFAULT NULL,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Constraints
    CONSTRAINT vqm_scheduled_name_unique UNIQUE (name),
    CONSTRAINT vqm_scheduled_valid_type CHECK (
        schedule_type IN ('cron', 'interval', 'once', 'manual')
    ),
    CONSTRAINT vqm_scheduled_valid_status CHECK (
        last_run_status IS NULL OR last_run_status IN ('success', 'failure', 'timeout', 'skipped', 'cancelled')
    ),
    CONSTRAINT vqm_scheduled_cron_required CHECK (
        schedule_type != 'cron' OR cron_expression IS NOT NULL
    ),
    CONSTRAINT vqm_scheduled_interval_required CHECK (
        schedule_type != 'interval' OR interval_seconds IS NOT NULL
    ),
    CONSTRAINT vqm_scheduled_once_required CHECK (
        schedule_type != 'once' OR run_at IS NOT NULL
    ),
    CONSTRAINT vqm_scheduled_valid_interval CHECK (
        interval_seconds IS NULL OR interval_seconds >= 1
    ),
    CONSTRAINT vqm_scheduled_valid_priority CHECK (priority >= -100 AND priority <= 100),
    CONSTRAINT vqm_scheduled_valid_execution_days CHECK (
        execution_days IS NULL OR (
            array_length(execution_days, 1) > 0 AND
            execution_days <@ ARRAY[0,1,2,3,4,5,6]
        )
    )
);

-- -----------------------------------------------------------------------------
-- Scheduled Job Executions Table
-- -----------------------------------------------------------------------------
-- Track individual executions of scheduled jobs

CREATE TABLE IF NOT EXISTS vqm_scheduled_executions (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Job reference
    job_id UUID NOT NULL REFERENCES vqm_scheduled_jobs(id) ON DELETE CASCADE,

    -- Scheduled vs actual execution time
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Execution status
    status VARCHAR(20) NOT NULL DEFAULT 'running',

    -- Created message reference
    message_id UUID DEFAULT NULL,
    queue_id UUID DEFAULT NULL,

    -- Performance
    duration_ms INTEGER DEFAULT NULL,
    delay_ms INTEGER DEFAULT NULL,

    -- Error tracking
    error_message TEXT DEFAULT NULL,
    error_code VARCHAR(100) DEFAULT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,

    -- Metadata
    execution_context JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT vqm_exec_valid_status CHECK (
        status IN ('running', 'success', 'failure', 'timeout', 'skipped', 'cancelled')
    )
);

-- -----------------------------------------------------------------------------
-- Job Dependencies Table
-- -----------------------------------------------------------------------------
-- Define dependencies between scheduled jobs

CREATE TABLE IF NOT EXISTS vqm_job_dependencies (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Job that has the dependency
    job_id UUID NOT NULL REFERENCES vqm_scheduled_jobs(id) ON DELETE CASCADE,

    -- Job that must complete first
    depends_on_job_id UUID NOT NULL REFERENCES vqm_scheduled_jobs(id) ON DELETE CASCADE,

    -- Dependency type
    dependency_type VARCHAR(20) NOT NULL DEFAULT 'success',

    -- Time window for dependency check (NULL = any time)
    window_seconds INTEGER DEFAULT NULL,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Constraints
    CONSTRAINT vqm_deps_no_self_dependency CHECK (job_id != depends_on_job_id),
    CONSTRAINT vqm_deps_unique UNIQUE (job_id, depends_on_job_id),
    CONSTRAINT vqm_deps_valid_type CHECK (
        dependency_type IN ('success', 'completion', 'failure')
    )
);

-- -----------------------------------------------------------------------------
-- Indexes for Scheduled Jobs
-- -----------------------------------------------------------------------------

-- Primary scheduling query: find jobs due for execution
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_next_run
    ON vqm_scheduled_jobs(next_run_at ASC)
    WHERE is_active = true AND is_paused = false AND next_run_at IS NOT NULL;

-- Queue-specific jobs
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_queue
    ON vqm_scheduled_jobs(queue_id);

-- Active jobs
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_active
    ON vqm_scheduled_jobs(is_active)
    WHERE is_active = true;

-- Schedule type filtering
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_type
    ON vqm_scheduled_jobs(schedule_type);

-- Jobs by last run status (find failures)
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_status
    ON vqm_scheduled_jobs(last_run_status)
    WHERE last_run_status IS NOT NULL;

-- One-time jobs expiration
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_expires
    ON vqm_scheduled_jobs(expires_at)
    WHERE schedule_type = 'once' AND expires_at IS NOT NULL;

-- Tags search
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_tags
    ON vqm_scheduled_jobs USING GIN(tags);

-- Created by lookup
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_created_by
    ON vqm_scheduled_jobs(created_by);

-- Currently running (for concurrency check)
CREATE INDEX IF NOT EXISTS idx_vqm_scheduled_running
    ON vqm_scheduled_jobs(currently_running)
    WHERE currently_running > 0;

-- -----------------------------------------------------------------------------
-- Indexes for Scheduled Executions
-- -----------------------------------------------------------------------------

-- Job execution history
CREATE INDEX IF NOT EXISTS idx_vqm_exec_job_time
    ON vqm_scheduled_executions(job_id, started_at DESC);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_vqm_exec_time
    ON vqm_scheduled_executions(started_at DESC);

-- Running executions
CREATE INDEX IF NOT EXISTS idx_vqm_exec_running
    ON vqm_scheduled_executions(started_at)
    WHERE status = 'running';

-- Failed executions
CREATE INDEX IF NOT EXISTS idx_vqm_exec_failed
    ON vqm_scheduled_executions(job_id, started_at DESC)
    WHERE status = 'failure';

-- Message lookup
CREATE INDEX IF NOT EXISTS idx_vqm_exec_message
    ON vqm_scheduled_executions(message_id)
    WHERE message_id IS NOT NULL;

-- Scheduled time lookup (for delay analysis)
CREATE INDEX IF NOT EXISTS idx_vqm_exec_scheduled
    ON vqm_scheduled_executions(scheduled_at);

-- -----------------------------------------------------------------------------
-- Indexes for Job Dependencies
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_deps_job
    ON vqm_job_dependencies(job_id)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vqm_deps_depends_on
    ON vqm_job_dependencies(depends_on_job_id)
    WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

CREATE TRIGGER vqm_scheduled_jobs_update_timestamp
    BEFORE UPDATE ON vqm_scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Track pause status
CREATE OR REPLACE FUNCTION vqm_track_scheduled_pause()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_paused = true AND (OLD.is_paused = false OR OLD.is_paused IS NULL) THEN
        NEW.paused_at = CURRENT_TIMESTAMP;
    ELSIF NEW.is_paused = false AND OLD.is_paused = true THEN
        NEW.paused_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_scheduled_track_pause
    BEFORE UPDATE ON vqm_scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION vqm_track_scheduled_pause();

-- Update statistics
CREATE OR REPLACE FUNCTION vqm_update_scheduled_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.run_count > 0 THEN
        NEW.avg_duration_ms = NEW.total_duration_ms::DOUBLE PRECISION / NEW.run_count;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_scheduled_update_stats
    BEFORE UPDATE OF run_count, total_duration_ms ON vqm_scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_scheduled_stats();

-- -----------------------------------------------------------------------------
-- Functions for Scheduled Jobs
-- -----------------------------------------------------------------------------

-- Get jobs due for execution
CREATE OR REPLACE FUNCTION vqm_get_due_jobs(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    job_id UUID,
    name VARCHAR(255),
    queue_id UUID,
    message_type VARCHAR(255),
    payload_template JSONB,
    headers_template JSONB,
    priority INTEGER,
    next_run_at TIMESTAMP WITH TIME ZONE,
    allow_concurrent BOOLEAN,
    max_concurrent INTEGER,
    currently_running INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.name,
        j.queue_id,
        j.message_type,
        j.payload_template,
        j.headers_template,
        j.priority,
        j.next_run_at,
        j.allow_concurrent,
        j.max_concurrent,
        j.currently_running
    FROM vqm_scheduled_jobs j
    WHERE
        j.is_active = true
        AND j.is_paused = false
        AND j.next_run_at IS NOT NULL
        AND j.next_run_at <= CURRENT_TIMESTAMP
        AND (j.allow_concurrent = true OR j.currently_running = 0)
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
    ORDER BY j.next_run_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- Calculate next run time for a cron job
CREATE OR REPLACE FUNCTION vqm_calculate_next_cron_run(
    p_cron_expression VARCHAR(100),
    p_timezone VARCHAR(50),
    p_from_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    -- Note: This is a simplified implementation
    -- In production, use a proper cron parser library
    v_next_run TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Placeholder: add interval based on simple patterns
    -- Real implementation would parse cron expression properly
    IF p_cron_expression LIKE '*/% * * * *' THEN
        -- Every N minutes
        v_next_run := p_from_time + (
            SUBSTRING(p_cron_expression FROM 3 FOR POSITION(' ' IN SUBSTRING(p_cron_expression FROM 3)) - 1)::INTEGER * INTERVAL '1 minute'
        );
    ELSIF p_cron_expression = '0 * * * *' THEN
        -- Every hour
        v_next_run := date_trunc('hour', p_from_time) + INTERVAL '1 hour';
    ELSIF p_cron_expression LIKE '0 */% * * *' THEN
        -- Every N hours
        v_next_run := date_trunc('hour', p_from_time) + (
            SUBSTRING(p_cron_expression FROM 5 FOR 1)::INTEGER * INTERVAL '1 hour'
        );
    ELSIF p_cron_expression LIKE '% % * * *' THEN
        -- Daily at specific time
        v_next_run := date_trunc('day', p_from_time) + INTERVAL '1 day';
    ELSE
        -- Default: next minute
        v_next_run := date_trunc('minute', p_from_time) + INTERVAL '1 minute';
    END IF;

    RETURN v_next_run;
END;
$$ LANGUAGE plpgsql;

-- Update job after execution
CREATE OR REPLACE FUNCTION vqm_complete_job_execution(
    p_job_id UUID,
    p_execution_id BIGINT,
    p_status VARCHAR(20),
    p_message_id UUID DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_job RECORD;
    v_next_run TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get job details
    SELECT * INTO v_job FROM vqm_scheduled_jobs WHERE id = p_job_id;

    -- Update execution record
    UPDATE vqm_scheduled_executions
    SET
        completed_at = CURRENT_TIMESTAMP,
        status = p_status,
        message_id = p_message_id,
        duration_ms = p_duration_ms,
        error_message = p_error_message
    WHERE id = p_execution_id;

    -- Calculate next run time
    IF v_job.schedule_type = 'cron' THEN
        v_next_run := vqm_calculate_next_cron_run(v_job.cron_expression, v_job.timezone);
    ELSIF v_job.schedule_type = 'interval' THEN
        v_next_run := CURRENT_TIMESTAMP + (v_job.interval_seconds || ' seconds')::INTERVAL;
    ELSIF v_job.schedule_type = 'once' THEN
        v_next_run := NULL;
    ELSE
        v_next_run := NULL;
    END IF;

    -- Update job statistics
    UPDATE vqm_scheduled_jobs
    SET
        last_run_at = CURRENT_TIMESTAMP,
        last_run_status = p_status,
        last_run_message_id = p_message_id,
        last_run_duration_ms = p_duration_ms,
        last_run_error = p_error_message,
        next_run_at = v_next_run,
        run_count = run_count + 1,
        success_count = success_count + CASE WHEN p_status = 'success' THEN 1 ELSE 0 END,
        failure_count = failure_count + CASE WHEN p_status = 'failure' THEN 1 ELSE 0 END,
        skip_count = skip_count + CASE WHEN p_status = 'skipped' THEN 1 ELSE 0 END,
        total_duration_ms = total_duration_ms + COALESCE(p_duration_ms, 0),
        currently_running = GREATEST(0, currently_running - 1),
        is_active = CASE
            WHEN v_job.schedule_type = 'once' AND p_status = 'success' THEN false
            ELSE is_active
        END
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Check job dependencies
CREATE OR REPLACE FUNCTION vqm_check_job_dependencies(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_dep RECORD;
    v_met BOOLEAN := true;
BEGIN
    FOR v_dep IN
        SELECT
            d.*,
            j.last_run_status,
            j.last_run_at
        FROM vqm_job_dependencies d
        JOIN vqm_scheduled_jobs j ON j.id = d.depends_on_job_id
        WHERE d.job_id = p_job_id AND d.is_active = true
    LOOP
        -- Check if dependency is met based on type
        IF v_dep.dependency_type = 'success' THEN
            IF v_dep.last_run_status != 'success' THEN
                v_met := false;
                EXIT;
            END IF;
        ELSIF v_dep.dependency_type = 'completion' THEN
            IF v_dep.last_run_at IS NULL THEN
                v_met := false;
                EXIT;
            END IF;
        ELSIF v_dep.dependency_type = 'failure' THEN
            IF v_dep.last_run_status != 'failure' THEN
                v_met := false;
                EXIT;
            END IF;
        END IF;

        -- Check time window if specified
        IF v_dep.window_seconds IS NOT NULL THEN
            IF v_dep.last_run_at < CURRENT_TIMESTAMP - (v_dep.window_seconds || ' seconds')::INTERVAL THEN
                v_met := false;
                EXIT;
            END IF;
        END IF;
    END LOOP;

    RETURN v_met;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_scheduled_jobs IS 'Scheduled and recurring job definitions';
COMMENT ON TABLE vqm_scheduled_executions IS 'Historical record of scheduled job executions';
COMMENT ON TABLE vqm_job_dependencies IS 'Dependencies between scheduled jobs';
COMMENT ON COLUMN vqm_scheduled_jobs.schedule_type IS 'Schedule type: cron, interval, once, manual';
COMMENT ON COLUMN vqm_scheduled_jobs.execution_days IS 'Days of week allowed for execution (0=Sunday, 6=Saturday)';
COMMENT ON FUNCTION vqm_get_due_jobs IS 'Get jobs that are due for execution with row locking';
COMMENT ON FUNCTION vqm_complete_job_execution IS 'Update job and execution records after job completes';
COMMENT ON FUNCTION vqm_check_job_dependencies IS 'Check if all dependencies are met for a job';
