-- =============================================================================
-- Migration 008: Subscriptions and Webhooks
-- =============================================================================
-- Visual Queue Manager - Event subscriptions for external integrations
--
-- This migration creates tables for:
-- - Webhook subscriptions
-- - WebSocket subscriptions
-- - Delivery tracking and retry logic
-- - Subscription filters and conditions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Subscriptions Table
-- -----------------------------------------------------------------------------
-- Define event subscriptions for external delivery

CREATE TABLE IF NOT EXISTS vqm_subscriptions (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Subscription identification
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Scope
    queue_id UUID REFERENCES vqm_queues(id) ON DELETE CASCADE,
    is_global BOOLEAN NOT NULL DEFAULT false,

    -- Event filtering
    event_types JSONB NOT NULL DEFAULT '["*"]'::jsonb,
    message_types JSONB DEFAULT NULL,
    filter_conditions JSONB DEFAULT NULL,
    filter_expression TEXT DEFAULT NULL,

    -- Delivery configuration
    delivery_type VARCHAR(20) NOT NULL DEFAULT 'webhook',

    -- Webhook settings
    webhook_url TEXT DEFAULT NULL,
    webhook_method VARCHAR(10) DEFAULT 'POST',
    webhook_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    webhook_timeout_ms INTEGER NOT NULL DEFAULT 30000,

    -- Authentication
    auth_type VARCHAR(20) DEFAULT NULL,
    auth_config JSONB DEFAULT NULL,

    -- Retry configuration
    retry_enabled BOOLEAN NOT NULL DEFAULT true,
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_delay_ms BIGINT NOT NULL DEFAULT 1000,
    retry_backoff_multiplier INTEGER NOT NULL DEFAULT 2,
    max_retry_delay_ms BIGINT NOT NULL DEFAULT 300000,

    -- Batching
    batch_enabled BOOLEAN NOT NULL DEFAULT false,
    batch_size INTEGER DEFAULT 10,
    batch_timeout_ms BIGINT DEFAULT 5000,

    -- Rate limiting
    rate_limit_enabled BOOLEAN NOT NULL DEFAULT false,
    rate_limit_per_second INTEGER DEFAULT NULL,

    -- Circuit breaker
    circuit_breaker_enabled BOOLEAN NOT NULL DEFAULT true,
    circuit_breaker_threshold INTEGER DEFAULT 5,
    circuit_breaker_timeout_seconds INTEGER DEFAULT 60,
    circuit_state VARCHAR(20) NOT NULL DEFAULT 'closed',
    circuit_opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    circuit_failure_count INTEGER NOT NULL DEFAULT 0,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_paused BOOLEAN NOT NULL DEFAULT false,

    -- Statistics
    delivery_count BIGINT NOT NULL DEFAULT 0,
    success_count BIGINT NOT NULL DEFAULT 0,
    failure_count BIGINT NOT NULL DEFAULT 0,
    last_delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_delivery_status VARCHAR(20) DEFAULT NULL,
    last_error_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_error_message TEXT DEFAULT NULL,
    avg_delivery_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0,

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
    CONSTRAINT vqm_subs_name_unique UNIQUE (name),
    CONSTRAINT vqm_subs_valid_delivery_type CHECK (
        delivery_type IN ('webhook', 'websocket', 'sse', 'grpc', 'sqs', 'sns', 'kafka')
    ),
    CONSTRAINT vqm_subs_valid_method CHECK (
        webhook_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')
    ),
    CONSTRAINT vqm_subs_valid_auth_type CHECK (
        auth_type IS NULL OR auth_type IN ('none', 'basic', 'bearer', 'api_key', 'hmac', 'oauth2')
    ),
    CONSTRAINT vqm_subs_valid_circuit_state CHECK (
        circuit_state IN ('closed', 'open', 'half_open')
    ),
    CONSTRAINT vqm_subs_webhook_url_required CHECK (
        delivery_type != 'webhook' OR webhook_url IS NOT NULL
    )
);

-- -----------------------------------------------------------------------------
-- Subscription Deliveries Table
-- -----------------------------------------------------------------------------
-- Track individual delivery attempts

CREATE TABLE IF NOT EXISTS vqm_subscription_deliveries (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Subscription reference
    subscription_id UUID NOT NULL REFERENCES vqm_subscriptions(id) ON DELETE CASCADE,

    -- Event details
    event_id UUID NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    message_id UUID DEFAULT NULL,
    queue_id UUID DEFAULT NULL,

    -- Delivery attempt
    attempt_number INTEGER NOT NULL DEFAULT 1,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Request details
    request_url TEXT DEFAULT NULL,
    request_method VARCHAR(10) DEFAULT NULL,
    request_headers JSONB DEFAULT NULL,
    request_body_size INTEGER DEFAULT NULL,
    request_body_hash VARCHAR(64) DEFAULT NULL,

    -- Response details
    response_status INTEGER DEFAULT NULL,
    response_headers JSONB DEFAULT NULL,
    response_body TEXT DEFAULT NULL,
    response_body_size INTEGER DEFAULT NULL,

    -- Performance
    delivery_time_ms INTEGER DEFAULT NULL,
    connection_time_ms INTEGER DEFAULT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Error tracking
    error_message TEXT DEFAULT NULL,
    error_code VARCHAR(100) DEFAULT NULL,
    error_type VARCHAR(50) DEFAULT NULL,

    -- Retry tracking
    will_retry BOOLEAN NOT NULL DEFAULT false,
    next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Constraints
    CONSTRAINT vqm_deliveries_valid_status CHECK (
        status IN ('pending', 'sending', 'success', 'failure', 'timeout', 'cancelled', 'circuit_open')
    )
);

-- -----------------------------------------------------------------------------
-- WebSocket Connections Table
-- -----------------------------------------------------------------------------
-- Track active WebSocket connections

CREATE TABLE IF NOT EXISTS vqm_websocket_connections (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Connection identification
    connection_id VARCHAR(255) NOT NULL,

    -- User information
    user_id UUID DEFAULT NULL,
    user_name VARCHAR(255) DEFAULT NULL,

    -- Client information
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,

    -- Subscriptions
    subscribed_queues UUID[] NOT NULL DEFAULT '{}',
    subscribed_events TEXT[] NOT NULL DEFAULT '{}',

    -- Connection status
    status VARCHAR(20) NOT NULL DEFAULT 'connected',
    connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_ping_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Statistics
    messages_sent BIGINT NOT NULL DEFAULT 0,
    messages_received BIGINT NOT NULL DEFAULT 0,
    bytes_sent BIGINT NOT NULL DEFAULT 0,
    bytes_received BIGINT NOT NULL DEFAULT 0,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT vqm_ws_valid_status CHECK (
        status IN ('connecting', 'connected', 'disconnecting', 'disconnected', 'error')
    ),
    CONSTRAINT vqm_ws_connection_unique UNIQUE (connection_id)
);

-- -----------------------------------------------------------------------------
-- Subscription Events Queue Table
-- -----------------------------------------------------------------------------
-- Buffer events before delivery (for batching and ordering)

CREATE TABLE IF NOT EXISTS vqm_subscription_events (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- Subscription reference
    subscription_id UUID NOT NULL REFERENCES vqm_subscriptions(id) ON DELETE CASCADE,

    -- Event details
    event_id UUID NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Source
    message_id UUID DEFAULT NULL,
    queue_id UUID DEFAULT NULL,

    -- Processing
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Batching
    batch_id UUID DEFAULT NULL,

    -- Constraints
    CONSTRAINT vqm_events_valid_status CHECK (
        status IN ('pending', 'processing', 'delivered', 'failed', 'skipped')
    )
);

-- -----------------------------------------------------------------------------
-- Indexes for Subscriptions
-- -----------------------------------------------------------------------------

-- Queue-specific subscriptions
CREATE INDEX IF NOT EXISTS idx_vqm_subs_queue
    ON vqm_subscriptions(queue_id)
    WHERE is_active = true;

-- Global subscriptions
CREATE INDEX IF NOT EXISTS idx_vqm_subs_global
    ON vqm_subscriptions(is_global)
    WHERE is_global = true AND is_active = true;

-- Active subscriptions
CREATE INDEX IF NOT EXISTS idx_vqm_subs_active
    ON vqm_subscriptions(is_active)
    WHERE is_active = true;

-- Delivery type filtering
CREATE INDEX IF NOT EXISTS idx_vqm_subs_delivery_type
    ON vqm_subscriptions(delivery_type);

-- Circuit breaker state
CREATE INDEX IF NOT EXISTS idx_vqm_subs_circuit
    ON vqm_subscriptions(circuit_state)
    WHERE circuit_breaker_enabled = true AND circuit_state != 'closed';

-- Event types (GIN for JSONB array)
CREATE INDEX IF NOT EXISTS idx_vqm_subs_event_types
    ON vqm_subscriptions USING GIN(event_types);

-- Tags search
CREATE INDEX IF NOT EXISTS idx_vqm_subs_tags
    ON vqm_subscriptions USING GIN(tags);

-- Created by lookup
CREATE INDEX IF NOT EXISTS idx_vqm_subs_created_by
    ON vqm_subscriptions(created_by);

-- -----------------------------------------------------------------------------
-- Indexes for Subscription Deliveries
-- -----------------------------------------------------------------------------

-- Subscription delivery history
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_sub
    ON vqm_subscription_deliveries(subscription_id, attempted_at DESC);

-- Pending deliveries for retry
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_retry
    ON vqm_subscription_deliveries(next_retry_at ASC)
    WHERE will_retry = true AND next_retry_at IS NOT NULL;

-- Failed deliveries
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_failed
    ON vqm_subscription_deliveries(subscription_id, attempted_at DESC)
    WHERE status = 'failure';

-- Event lookup
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_event
    ON vqm_subscription_deliveries(event_id);

-- Message lookup
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_message
    ON vqm_subscription_deliveries(message_id)
    WHERE message_id IS NOT NULL;

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_time
    ON vqm_subscription_deliveries(attempted_at DESC);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_vqm_deliveries_status
    ON vqm_subscription_deliveries(status);

-- -----------------------------------------------------------------------------
-- Indexes for WebSocket Connections
-- -----------------------------------------------------------------------------

-- Active connections
CREATE INDEX IF NOT EXISTS idx_vqm_ws_active
    ON vqm_websocket_connections(status)
    WHERE status = 'connected';

-- User connections
CREATE INDEX IF NOT EXISTS idx_vqm_ws_user
    ON vqm_websocket_connections(user_id)
    WHERE user_id IS NOT NULL;

-- Connection ID lookup
CREATE INDEX IF NOT EXISTS idx_vqm_ws_connection
    ON vqm_websocket_connections(connection_id);

-- Last ping for timeout detection
CREATE INDEX IF NOT EXISTS idx_vqm_ws_ping
    ON vqm_websocket_connections(last_ping_at)
    WHERE status = 'connected';

-- Subscribed queues (GIN for array)
CREATE INDEX IF NOT EXISTS idx_vqm_ws_queues
    ON vqm_websocket_connections USING GIN(subscribed_queues)
    WHERE status = 'connected';

-- Subscribed events (GIN for array)
CREATE INDEX IF NOT EXISTS idx_vqm_ws_events
    ON vqm_websocket_connections USING GIN(subscribed_events)
    WHERE status = 'connected';

-- -----------------------------------------------------------------------------
-- Indexes for Subscription Events
-- -----------------------------------------------------------------------------

-- Pending events for delivery
CREATE INDEX IF NOT EXISTS idx_vqm_sub_events_pending
    ON vqm_subscription_events(subscription_id, created_at ASC)
    WHERE status = 'pending';

-- Batch processing
CREATE INDEX IF NOT EXISTS idx_vqm_sub_events_batch
    ON vqm_subscription_events(batch_id)
    WHERE batch_id IS NOT NULL;

-- Event ID lookup
CREATE INDEX IF NOT EXISTS idx_vqm_sub_events_event
    ON vqm_subscription_events(event_id);

-- Time-based cleanup
CREATE INDEX IF NOT EXISTS idx_vqm_sub_events_time
    ON vqm_subscription_events(created_at);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

CREATE TRIGGER vqm_subscriptions_update_timestamp
    BEFORE UPDATE ON vqm_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Track pause status
CREATE OR REPLACE FUNCTION vqm_track_subscription_pause()
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

CREATE TRIGGER vqm_subscriptions_track_pause
    BEFORE UPDATE ON vqm_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION vqm_track_subscription_pause();

-- Update subscription statistics
CREATE OR REPLACE FUNCTION vqm_update_subscription_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery_count > 0 THEN
        -- Calculate average delivery time from recent deliveries
        SELECT AVG(delivery_time_ms) INTO NEW.avg_delivery_time_ms
        FROM vqm_subscription_deliveries
        WHERE subscription_id = NEW.id
          AND status = 'success'
          AND delivery_time_ms IS NOT NULL
        ORDER BY attempted_at DESC
        LIMIT 100;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_subscriptions_update_stats
    BEFORE UPDATE OF delivery_count ON vqm_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_subscription_stats();

-- Manage circuit breaker
CREATE OR REPLACE FUNCTION vqm_manage_subscription_circuit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.circuit_breaker_enabled THEN
        IF NEW.circuit_failure_count >= NEW.circuit_breaker_threshold THEN
            IF NEW.circuit_state = 'closed' THEN
                NEW.circuit_state = 'open';
                NEW.circuit_opened_at = CURRENT_TIMESTAMP;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_subscriptions_circuit
    BEFORE UPDATE OF circuit_failure_count ON vqm_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION vqm_manage_subscription_circuit();

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------

-- Get subscriptions for an event
CREATE OR REPLACE FUNCTION vqm_get_subscriptions_for_event(
    p_queue_id UUID,
    p_event_type VARCHAR(255)
)
RETURNS TABLE (
    subscription_id UUID,
    name VARCHAR(255),
    delivery_type VARCHAR(20),
    webhook_url TEXT,
    webhook_method VARCHAR(10),
    webhook_headers JSONB,
    auth_type VARCHAR(20),
    auth_config JSONB,
    batch_enabled BOOLEAN,
    batch_size INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.delivery_type,
        s.webhook_url,
        s.webhook_method,
        s.webhook_headers,
        s.auth_type,
        s.auth_config,
        s.batch_enabled,
        s.batch_size
    FROM vqm_subscriptions s
    WHERE
        s.is_active = true
        AND s.is_paused = false
        AND s.circuit_state != 'open'
        AND (s.queue_id = p_queue_id OR s.is_global = true)
        AND (
            s.event_types @> ('["*"]')::jsonb
            OR s.event_types @> to_jsonb(ARRAY[p_event_type])
        );
END;
$$ LANGUAGE plpgsql;

-- Record delivery attempt
CREATE OR REPLACE FUNCTION vqm_record_delivery(
    p_subscription_id UUID,
    p_event_id UUID,
    p_event_type VARCHAR(255),
    p_status VARCHAR(20),
    p_response_status INTEGER DEFAULT NULL,
    p_delivery_time_ms INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_id BIGINT;
    v_will_retry BOOLEAN := false;
    v_sub RECORD;
BEGIN
    -- Get subscription details
    SELECT * INTO v_sub FROM vqm_subscriptions WHERE id = p_subscription_id;

    -- Determine if should retry
    IF p_status = 'failure' AND v_sub.retry_enabled THEN
        -- Check if max retries reached
        IF (SELECT COUNT(*) FROM vqm_subscription_deliveries
            WHERE subscription_id = p_subscription_id AND event_id = p_event_id) < v_sub.max_retries THEN
            v_will_retry := true;
        END IF;
    END IF;

    -- Insert delivery record
    INSERT INTO vqm_subscription_deliveries (
        subscription_id, event_id, event_type,
        status, response_status, delivery_time_ms,
        error_message, will_retry,
        next_retry_at
    ) VALUES (
        p_subscription_id, p_event_id, p_event_type,
        p_status, p_response_status, p_delivery_time_ms,
        p_error_message, v_will_retry,
        CASE WHEN v_will_retry THEN
            CURRENT_TIMESTAMP + (v_sub.retry_delay_ms || ' milliseconds')::INTERVAL
        ELSE NULL END
    )
    RETURNING id INTO v_id;

    -- Update subscription statistics
    UPDATE vqm_subscriptions
    SET
        delivery_count = delivery_count + 1,
        success_count = success_count + CASE WHEN p_status = 'success' THEN 1 ELSE 0 END,
        failure_count = failure_count + CASE WHEN p_status = 'failure' THEN 1 ELSE 0 END,
        last_delivered_at = CURRENT_TIMESTAMP,
        last_delivery_status = p_status,
        last_error_at = CASE WHEN p_status = 'failure' THEN CURRENT_TIMESTAMP ELSE last_error_at END,
        last_error_message = CASE WHEN p_status = 'failure' THEN p_error_message ELSE last_error_message END,
        circuit_failure_count = CASE
            WHEN p_status = 'success' THEN 0
            WHEN p_status = 'failure' THEN circuit_failure_count + 1
            ELSE circuit_failure_count
        END
    WHERE id = p_subscription_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Get WebSocket connections for broadcasting
CREATE OR REPLACE FUNCTION vqm_get_ws_connections_for_event(
    p_queue_id UUID,
    p_event_type VARCHAR(255)
)
RETURNS TABLE (
    connection_id VARCHAR(255),
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.connection_id,
        c.user_id
    FROM vqm_websocket_connections c
    WHERE
        c.status = 'connected'
        AND (
            p_queue_id = ANY(c.subscribed_queues)
            OR '*'::UUID = ANY(c.subscribed_queues)
        )
        AND (
            p_event_type = ANY(c.subscribed_events)
            OR '*' = ANY(c.subscribed_events)
        );
END;
$$ LANGUAGE plpgsql;

-- Clean up old deliveries
CREATE OR REPLACE FUNCTION vqm_cleanup_old_deliveries(p_retention_days INTEGER DEFAULT 30)
RETURNS BIGINT AS $$
DECLARE
    deleted_count BIGINT;
BEGIN
    DELETE FROM vqm_subscription_deliveries
    WHERE attempted_at < CURRENT_TIMESTAMP - (p_retention_days || ' days')::INTERVAL
      AND status IN ('success', 'cancelled')
      AND will_retry = false;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_subscriptions IS 'Event subscriptions for external delivery (webhooks, WebSocket, etc.)';
COMMENT ON TABLE vqm_subscription_deliveries IS 'Track individual delivery attempts for subscriptions';
COMMENT ON TABLE vqm_websocket_connections IS 'Active WebSocket connections for real-time updates';
COMMENT ON TABLE vqm_subscription_events IS 'Buffer for events pending delivery';
COMMENT ON COLUMN vqm_subscriptions.delivery_type IS 'How events are delivered: webhook, websocket, sse, grpc, sqs, sns, kafka';
COMMENT ON COLUMN vqm_subscriptions.auth_type IS 'Authentication method: none, basic, bearer, api_key, hmac, oauth2';
COMMENT ON FUNCTION vqm_get_subscriptions_for_event IS 'Get all subscriptions that should receive a specific event';
COMMENT ON FUNCTION vqm_record_delivery IS 'Record a delivery attempt and update subscription statistics';
