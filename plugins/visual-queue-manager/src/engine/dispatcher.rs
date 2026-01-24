//! Event Dispatcher Module
//!
//! Handles routing messages to handlers and managing event delivery.

use chrono::{DateTime, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::circuit_breaker::{CircuitBreaker, CircuitConfig, CircuitState};
use super::message::Message;
use super::{EngineError, EngineEvent};

/// Dispatch configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DispatchConfig {
    /// Enable circuit breaker
    pub enable_circuit_breaker: bool,
    /// Failure threshold for circuit breaker
    pub failure_threshold: u32,
    /// Reset timeout in seconds
    pub reset_timeout_secs: u64,
    /// Request timeout in milliseconds
    pub request_timeout_ms: u64,
    /// Max concurrent dispatches per handler
    pub max_concurrent: u32,
}

impl Default for DispatchConfig {
    fn default() -> Self {
        Self {
            enable_circuit_breaker: true,
            failure_threshold: 5,
            reset_timeout_secs: 60,
            request_timeout_ms: 30000,
            max_concurrent: 10,
        }
    }
}

/// Dispatch result
#[derive(Debug, Clone)]
pub enum DispatchResult {
    /// Message dispatched successfully
    Success,
    /// Message should be retried after delay
    Retry { delay_ms: u64 },
    /// Message should be moved to DLQ
    MoveToDlq { reason: String },
}

/// Handler type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum HandlerType {
    Http,
    Webhook,
    InternalFunction,
    RustpressHook,
}

impl From<String> for HandlerType {
    fn from(s: String) -> Self {
        match s.as_str() {
            "http" => HandlerType::Http,
            "webhook" => HandlerType::Webhook,
            "internal_function" => HandlerType::InternalFunction,
            "rustpress_hook" => HandlerType::RustpressHook,
            _ => HandlerType::Http,
        }
    }
}

/// Handler definition
#[derive(Debug, Clone, Serialize)]
pub struct Handler {
    pub id: Uuid,
    pub name: String,
    pub handler_type: HandlerType,
    pub endpoint: String,
    pub method: String,
    pub headers: serde_json::Value,
    pub timeout_ms: u64,
    pub retry_config: RetryConfig,
    pub enabled: bool,
    pub routing_rules: Vec<RoutingRule>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Handler retry configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfig {
    pub max_retries: u32,
    pub base_delay_ms: u64,
    pub max_delay_ms: u64,
    pub backoff_multiplier: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_retries: 3,
            base_delay_ms: 1000,
            max_delay_ms: 60000,
            backoff_multiplier: 2.0,
        }
    }
}

/// Routing rule for message-to-handler matching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingRule {
    pub id: Uuid,
    pub handler_id: Uuid,
    pub queue_id: Option<Uuid>,
    pub message_type: Option<String>,
    pub condition: Option<String>,
    pub priority: i32,
    pub enabled: bool,
}

/// Database row for handler query results
#[derive(Debug, FromRow)]
struct HandlerRow {
    pub id: Uuid,
    pub name: String,
    pub handler_type: String,
    pub endpoint: String,
    pub method: Option<String>,
    pub headers: Option<serde_json::Value>,
    pub timeout_ms: Option<i32>,
    pub retry_config: Option<serde_json::Value>,
    pub enabled: Option<bool>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Database row for routing rule query results
#[derive(Debug, FromRow)]
struct RoutingRuleRow {
    pub id: Uuid,
    pub handler_id: Uuid,
    pub queue_id: Option<Uuid>,
    pub message_type: Option<String>,
    pub condition: Option<String>,
    pub priority: Option<i32>,
    pub enabled: Option<bool>,
}

/// Event dispatcher for routing and delivering messages
pub struct EventDispatcher {
    pool: PgPool,
    event_tx: broadcast::Sender<EngineEvent>,
    http_client: Client,
    enable_circuit_breaker: bool,
    circuit_breaker_threshold: u32,
    circuit_breaker_reset_secs: u64,
    /// Circuit breakers per handler
    circuit_breakers: RwLock<HashMap<Uuid, CircuitBreaker>>,
    /// Handler cache
    handlers: RwLock<HashMap<Uuid, Handler>>,
    /// Routing rules cache
    routing_rules: RwLock<Vec<RoutingRule>>,
}

impl EventDispatcher {
    /// Create a new event dispatcher
    pub fn new(
        pool: PgPool,
        event_tx: broadcast::Sender<EngineEvent>,
        enable_circuit_breaker: bool,
        circuit_breaker_threshold: u32,
        circuit_breaker_reset_secs: u64,
    ) -> Self {
        let http_client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            pool,
            event_tx,
            http_client,
            enable_circuit_breaker,
            circuit_breaker_threshold,
            circuit_breaker_reset_secs,
            circuit_breakers: RwLock::new(HashMap::new()),
            handlers: RwLock::new(HashMap::new()),
            routing_rules: RwLock::new(Vec::new()),
        }
    }

    /// Dispatch a message to appropriate handlers
    pub async fn dispatch_message(&self, message: &Message) -> Result<DispatchResult, EngineError> {
        // Find matching handlers
        let handlers = self.find_handlers_for_message(message).await?;

        if handlers.is_empty() {
            tracing::warn!(
                "No handlers found for message {} of type {}",
                message.id,
                message.message_type
            );
            // No handlers - consider it processed
            return Ok(DispatchResult::Success);
        }

        let mut last_error: Option<String> = None;
        let mut should_retry = false;
        let mut retry_delay = 0u64;

        for handler in handlers {
            // Check circuit breaker
            if self.enable_circuit_breaker {
                if let Some(cb) = self.circuit_breakers.read().await.get(&handler.id) {
                    if !cb.can_execute() {
                        tracing::warn!("Circuit breaker open for handler {}, skipping", handler.id);
                        continue;
                    }
                }
            }

            // Dispatch to handler
            let result = self.dispatch_to_handler(&handler, message).await;

            match result {
                Ok(_) => {
                    // Record success
                    if self.enable_circuit_breaker {
                        self.record_success(handler.id).await;
                    }
                    return Ok(DispatchResult::Success);
                }
                Err(e) => {
                    // Record failure
                    if self.enable_circuit_breaker {
                        self.record_failure(handler.id).await;
                    }

                    last_error = Some(e.to_string());

                    // Check if we should retry based on error type
                    if is_retryable_error(&e) {
                        should_retry = true;
                        retry_delay = handler.retry_config.base_delay_ms;
                    }
                }
            }
        }

        // All handlers failed
        if should_retry && message.attempt_count < message.max_attempts {
            Ok(DispatchResult::Retry {
                delay_ms: retry_delay,
            })
        } else if message.attempt_count >= message.max_attempts {
            Ok(DispatchResult::MoveToDlq {
                reason: last_error.unwrap_or_else(|| "Max retries exceeded".to_string()),
            })
        } else {
            Err(EngineError::DispatchError(
                last_error.unwrap_or_else(|| "Unknown dispatch error".to_string()),
            ))
        }
    }

    /// Find handlers that match a message
    async fn find_handlers_for_message(
        &self,
        message: &Message,
    ) -> Result<Vec<Handler>, EngineError> {
        // First, try to use cached routing rules
        let rules = self.routing_rules.read().await;

        // If cache is empty, refresh it
        if rules.is_empty() {
            drop(rules);
            self.refresh_routing_rules().await?;
        }

        let rules = self.routing_rules.read().await;
        let mut matching_handler_ids: Vec<Uuid> = Vec::new();

        for rule in rules.iter() {
            if !rule.enabled {
                continue;
            }

            // Check queue match
            if let Some(queue_id) = rule.queue_id {
                if queue_id != message.queue_id {
                    continue;
                }
            }

            // Check message type match
            if let Some(ref msg_type) = rule.message_type {
                if *msg_type != message.message_type && !msg_type.is_empty() {
                    continue;
                }
            }

            // Check condition (simple JSON path matching for now)
            if let Some(ref condition) = rule.condition {
                if !evaluate_condition(condition, &message.payload) {
                    continue;
                }
            }

            matching_handler_ids.push(rule.handler_id);
        }

        // Get handler details
        let mut handlers = Vec::new();
        let handler_cache = self.handlers.read().await;

        for handler_id in matching_handler_ids {
            if let Some(handler) = handler_cache.get(&handler_id) {
                if handler.enabled {
                    handlers.push(handler.clone());
                }
            } else {
                // Fetch from database
                drop(handler_cache);
                if let Ok(handler) = self.get_handler(handler_id).await {
                    if handler.enabled {
                        handlers.push(handler);
                    }
                }
                break; // Need to re-acquire lock
            }
        }

        // Sort by routing rule priority
        handlers.sort_by(|a, b| {
            let a_priority = rules
                .iter()
                .find(|r| r.handler_id == a.id)
                .map(|r| r.priority)
                .unwrap_or(0);
            let b_priority = rules
                .iter()
                .find(|r| r.handler_id == b.id)
                .map(|r| r.priority)
                .unwrap_or(0);
            b_priority.cmp(&a_priority)
        });

        Ok(handlers)
    }

    /// Dispatch message to a specific handler
    async fn dispatch_to_handler(
        &self,
        handler: &Handler,
        message: &Message,
    ) -> Result<(), EngineError> {
        match handler.handler_type {
            HandlerType::Http | HandlerType::Webhook => self.dispatch_http(handler, message).await,
            HandlerType::InternalFunction => self.dispatch_internal(handler, message).await,
            HandlerType::RustpressHook => self.dispatch_rustpress_hook(handler, message).await,
        }
    }

    /// Dispatch via HTTP
    async fn dispatch_http(&self, handler: &Handler, message: &Message) -> Result<(), EngineError> {
        let payload = serde_json::json!({
            "message_id": message.id,
            "queue_id": message.queue_id,
            "message_type": message.message_type,
            "payload": message.payload,
            "headers": message.headers,
            "metadata": {
                "attempt": message.attempt_count,
                "created_at": message.created_at,
                "correlation_id": message.correlation_id,
                "trace_id": message.trace_id,
            }
        });

        let mut request = match handler.method.to_uppercase().as_str() {
            "GET" => self.http_client.get(&handler.endpoint),
            "POST" => self.http_client.post(&handler.endpoint),
            "PUT" => self.http_client.put(&handler.endpoint),
            "PATCH" => self.http_client.patch(&handler.endpoint),
            "DELETE" => self.http_client.delete(&handler.endpoint),
            _ => self.http_client.post(&handler.endpoint),
        };

        // Add custom headers
        if let Some(headers) = handler.headers.as_object() {
            for (key, value) in headers {
                if let Some(v) = value.as_str() {
                    request = request.header(key, v);
                }
            }
        }

        // Set content type and body
        request = request
            .header("Content-Type", "application/json")
            .header("X-VQM-Message-ID", message.id.to_string())
            .header("X-VQM-Queue-ID", message.queue_id.to_string())
            .timeout(std::time::Duration::from_millis(handler.timeout_ms))
            .json(&payload);

        let response = request
            .send()
            .await
            .map_err(|e| EngineError::DispatchError(format!("HTTP request failed: {}", e)))?;

        if response.status().is_success() {
            Ok(())
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(EngineError::DispatchError(format!(
                "HTTP {} - {}",
                status, body
            )))
        }
    }

    /// Dispatch to internal function
    async fn dispatch_internal(
        &self,
        handler: &Handler,
        message: &Message,
    ) -> Result<(), EngineError> {
        // Internal functions are handled through RustPress plugin system
        // This is a placeholder for actual implementation
        tracing::info!(
            "Dispatching to internal function {} for message {}",
            handler.endpoint,
            message.id
        );
        Ok(())
    }

    /// Dispatch through RustPress hook system
    async fn dispatch_rustpress_hook(
        &self,
        handler: &Handler,
        message: &Message,
    ) -> Result<(), EngineError> {
        // RustPress hooks are handled through the plugin system
        // This is a placeholder for actual implementation
        tracing::info!(
            "Dispatching to RustPress hook {} for message {}",
            handler.endpoint,
            message.id
        );
        Ok(())
    }

    /// Get a handler by ID
    pub async fn get_handler(&self, id: Uuid) -> Result<Handler, EngineError> {
        // Check cache first
        if let Some(handler) = self.handlers.read().await.get(&id) {
            return Ok(handler.clone());
        }

        let row = sqlx::query_as::<_, HandlerRow>(
            r#"
            SELECT id, name, handler_type, endpoint, method, headers,
                   timeout_ms, retry_config, enabled, created_at, updated_at
            FROM vqm_event_handlers WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::HandlerNotFound(id))?;

        let retry_config: RetryConfig = row
            .retry_config
            .and_then(|v| serde_json::from_value(v).ok())
            .unwrap_or_default();

        // Fetch routing rules for this handler
        let rules = sqlx::query_as::<_, RoutingRuleRow>(
            r#"
            SELECT id, handler_id, queue_id, message_type, condition, priority, enabled
            FROM vqm_handler_routes WHERE handler_id = $1 AND enabled = true
            "#,
        )
        .bind(id)
        .fetch_all(&self.pool)
        .await?;

        let routing_rules: Vec<RoutingRule> = rules
            .into_iter()
            .map(|r| RoutingRule {
                id: r.id,
                handler_id: r.handler_id,
                queue_id: r.queue_id,
                message_type: r.message_type,
                condition: r.condition,
                priority: r.priority.unwrap_or(0),
                enabled: r.enabled.unwrap_or(true),
            })
            .collect();

        let handler = Handler {
            id: row.id,
            name: row.name,
            handler_type: HandlerType::from(row.handler_type),
            endpoint: row.endpoint,
            method: row.method.unwrap_or_else(|| "POST".to_string()),
            headers: row.headers.unwrap_or(serde_json::json!({})),
            timeout_ms: row.timeout_ms.unwrap_or(30000) as u64,
            retry_config,
            enabled: row.enabled.unwrap_or(true),
            routing_rules,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };

        // Update cache
        self.handlers.write().await.insert(id, handler.clone());

        Ok(handler)
    }

    /// Refresh routing rules cache
    pub async fn refresh_routing_rules(&self) -> Result<(), EngineError> {
        let rules = sqlx::query_as::<_, RoutingRuleRow>(
            r#"
            SELECT id, handler_id, queue_id, message_type, condition, priority, enabled
            FROM vqm_handler_routes WHERE enabled = true
            ORDER BY priority DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        let routing_rules: Vec<RoutingRule> = rules
            .into_iter()
            .map(|r| RoutingRule {
                id: r.id,
                handler_id: r.handler_id,
                queue_id: r.queue_id,
                message_type: r.message_type,
                condition: r.condition,
                priority: r.priority.unwrap_or(0),
                enabled: r.enabled.unwrap_or(true),
            })
            .collect();

        *self.routing_rules.write().await = routing_rules;

        Ok(())
    }

    /// Record successful dispatch
    async fn record_success(&self, handler_id: Uuid) {
        let mut breakers = self.circuit_breakers.write().await;
        if let Some(cb) = breakers.get_mut(&handler_id) {
            cb.record_success();
        }
    }

    /// Record failed dispatch
    async fn record_failure(&self, handler_id: Uuid) {
        let mut breakers = self.circuit_breakers.write().await;

        if let Some(cb) = breakers.get_mut(&handler_id) {
            let old_state = cb.state();
            cb.record_failure();
            let new_state = cb.state();

            if old_state != new_state {
                let _ = self.event_tx.send(EngineEvent::CircuitBreakerStateChanged {
                    handler_id,
                    old_state,
                    new_state,
                });
            }
        } else {
            // Create new circuit breaker
            let config = CircuitConfig {
                failure_threshold: self.circuit_breaker_threshold,
                success_threshold: 2,
                timeout_secs: self.circuit_breaker_reset_secs,
            };
            let mut cb = CircuitBreaker::new(config);
            cb.record_failure();
            breakers.insert(handler_id, cb);
        }
    }

    /// Reset circuit breaker for a handler
    pub async fn reset_circuit_breaker(&self, handler_id: Uuid) {
        let mut breakers = self.circuit_breakers.write().await;
        if let Some(cb) = breakers.get_mut(&handler_id) {
            let old_state = cb.state();
            cb.reset();

            let _ = self.event_tx.send(EngineEvent::CircuitBreakerStateChanged {
                handler_id,
                old_state,
                new_state: CircuitState::Closed,
            });
        }
    }

    /// Get circuit breaker state for a handler
    pub async fn get_circuit_breaker_state(&self, handler_id: Uuid) -> Option<CircuitState> {
        self.circuit_breakers
            .read()
            .await
            .get(&handler_id)
            .map(|cb| cb.state())
    }

    /// Invalidate handler cache
    pub async fn invalidate_handler_cache(&self, handler_id: Uuid) {
        self.handlers.write().await.remove(&handler_id);
    }

    /// Clear all caches
    pub async fn clear_caches(&self) {
        self.handlers.write().await.clear();
        self.routing_rules.write().await.clear();
    }
}

/// Check if an error is retryable
fn is_retryable_error(error: &EngineError) -> bool {
    match error {
        EngineError::DispatchError(msg) => {
            // Network errors, timeouts, 5xx errors are retryable
            msg.contains("timeout")
                || msg.contains("connection")
                || msg.contains("HTTP 5")
                || msg.contains("temporarily unavailable")
        }
        _ => false,
    }
}

/// Evaluate a simple condition against message payload
fn evaluate_condition(condition: &str, payload: &serde_json::Value) -> bool {
    // Simple JSON path matching: "field=value" or "field.subfield=value"
    if let Some((path, expected)) = condition.split_once('=') {
        let parts: Vec<&str> = path.trim().split('.').collect();
        let mut current = payload;

        for part in parts {
            match current.get(part) {
                Some(v) => current = v,
                None => return false,
            }
        }

        // Compare values
        let expected = expected.trim();
        match current {
            serde_json::Value::String(s) => s == expected,
            serde_json::Value::Number(n) => n.to_string() == expected,
            serde_json::Value::Bool(b) => b.to_string() == expected,
            _ => false,
        }
    } else {
        // No condition or invalid format - match all
        true
    }
}
