-- =============================================================================
-- Migration 001: Core Queue Tables
-- =============================================================================
-- Visual Queue Manager - Core queue definitions and configuration
--
-- This migration creates the foundational tables for queue management:
-- - vqm_queues: Queue definitions and configuration
-- - Indexes for optimized lookups
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Queue Definitions Table
-- -----------------------------------------------------------------------------
-- Stores all queue configurations and metadata
-- Each queue can have different processing behaviors and constraints

CREATE TABLE IF NOT EXISTS vqm_queues (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Queue identification
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Queue type determines processing behavior
    -- fifo: First-in-first-out (default)
    -- priority: Process by priority value
    -- delay: Support delayed/scheduled messages
    -- broadcast: Fan-out to multiple consumers
    -- round_robin: Distribute across workers evenly
    queue_type VARCHAR(50) NOT NULL DEFAULT 'fifo',

    -- Processing configuration
    priority INTEGER NOT NULL DEFAULT 0,
    max_size BIGINT DEFAULT NULL,
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_delay_ms BIGINT NOT NULL DEFAULT 1000,
    retry_backoff_multiplier INTEGER NOT NULL DEFAULT 2,
    max_retry_delay_ms BIGINT NOT NULL DEFAULT 300000,
    visibility_timeout_ms BIGINT NOT NULL DEFAULT 30000,
    message_ttl_seconds BIGINT DEFAULT NULL,

    -- Dead letter queue configuration
    dead_letter_queue_id UUID REFERENCES vqm_queues(id) ON DELETE SET NULL,
    dead_letter_after_attempts INTEGER DEFAULT NULL,

    -- Rate limiting
    rate_limit_per_second INTEGER DEFAULT NULL,
    rate_limit_burst INTEGER DEFAULT NULL,

    -- Status flags
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_paused BOOLEAN NOT NULL DEFAULT false,
    is_fifo_strict BOOLEAN NOT NULL DEFAULT false,

    -- Deduplication settings
    deduplication_enabled BOOLEAN NOT NULL DEFAULT false,
    deduplication_window_seconds INTEGER DEFAULT 300,
    deduplication_scope VARCHAR(20) DEFAULT 'queue',

    -- Batching configuration
    batch_enabled BOOLEAN NOT NULL DEFAULT false,
    batch_size INTEGER DEFAULT 10,
    batch_timeout_ms BIGINT DEFAULT 5000,

    -- Encryption settings
    encryption_enabled BOOLEAN NOT NULL DEFAULT false,
    encryption_key_id VARCHAR(255) DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Audit fields
    created_by UUID NOT NULL,
    updated_by UUID DEFAULT NULL,

    -- Extended metadata (JSON for flexibility)
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Constraints
    CONSTRAINT vqm_queues_name_unique UNIQUE (name),
    CONSTRAINT vqm_queues_valid_type CHECK (
        queue_type IN ('fifo', 'priority', 'delay', 'broadcast', 'round_robin')
    ),
    CONSTRAINT vqm_queues_valid_dedup_scope CHECK (
        deduplication_scope IN ('queue', 'message_type', 'global')
    ),
    CONSTRAINT vqm_queues_valid_max_retries CHECK (max_retries >= 0 AND max_retries <= 100),
    CONSTRAINT vqm_queues_valid_priority CHECK (priority >= -100 AND priority <= 100),
    CONSTRAINT vqm_queues_no_self_dlq CHECK (id != dead_letter_queue_id)
);

-- -----------------------------------------------------------------------------
-- Indexes for Queue Lookups
-- -----------------------------------------------------------------------------

-- Primary lookup by name (most common)
CREATE INDEX IF NOT EXISTS idx_vqm_queues_name
    ON vqm_queues(name);

-- Filter by queue type
CREATE INDEX IF NOT EXISTS idx_vqm_queues_type
    ON vqm_queues(queue_type);

-- Filter by active status
CREATE INDEX IF NOT EXISTS idx_vqm_queues_active
    ON vqm_queues(is_active)
    WHERE is_active = true;

-- Sort by priority
CREATE INDEX IF NOT EXISTS idx_vqm_queues_priority
    ON vqm_queues(priority DESC);

-- Filter by paused status
CREATE INDEX IF NOT EXISTS idx_vqm_queues_paused
    ON vqm_queues(is_paused)
    WHERE is_paused = true;

-- Tag-based filtering (GIN index for array)
CREATE INDEX IF NOT EXISTS idx_vqm_queues_tags
    ON vqm_queues USING GIN(tags);

-- Metadata search (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_vqm_queues_metadata
    ON vqm_queues USING GIN(metadata jsonb_path_ops);

-- Created by user lookup
CREATE INDEX IF NOT EXISTS idx_vqm_queues_created_by
    ON vqm_queues(created_by);

-- Last activity for monitoring
CREATE INDEX IF NOT EXISTS idx_vqm_queues_last_activity
    ON vqm_queues(last_activity_at DESC NULLS LAST);

-- Dead letter queue relationship
CREATE INDEX IF NOT EXISTS idx_vqm_queues_dlq
    ON vqm_queues(dead_letter_queue_id)
    WHERE dead_letter_queue_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION vqm_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_queues_update_timestamp
    BEFORE UPDATE ON vqm_queues
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Track pause/resume timestamps
CREATE OR REPLACE FUNCTION vqm_track_pause_status()
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

CREATE TRIGGER vqm_queues_track_pause
    BEFORE UPDATE ON vqm_queues
    FOR EACH ROW
    EXECUTE FUNCTION vqm_track_pause_status();

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_queues IS 'Queue definitions and configuration for the Visual Queue Manager';
COMMENT ON COLUMN vqm_queues.queue_type IS 'Processing behavior: fifo, priority, delay, broadcast, round_robin';
COMMENT ON COLUMN vqm_queues.visibility_timeout_ms IS 'Time a message is hidden from other consumers while being processed';
COMMENT ON COLUMN vqm_queues.dead_letter_queue_id IS 'Queue to move failed messages after max retries exceeded';
COMMENT ON COLUMN vqm_queues.deduplication_scope IS 'Scope for deduplication: queue, message_type, or global';
