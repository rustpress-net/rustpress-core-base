//! Handler Data Models

use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

/// Handler type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum HandlerType {
    Http,
    Webhook,
    InternalFunction,
    RustpressHook,
}

impl Default for HandlerType {
    fn default() -> Self {
        Self::Http
    }
}

/// Create handler request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateHandlerRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    pub handler_type: HandlerType,
    #[validate(url)]
    pub endpoint: String,
    #[serde(default = "default_method")]
    pub method: String,
    #[serde(default)]
    pub headers: serde_json::Value,
    #[validate(range(min = 1000, max = 300000))]
    #[serde(default = "default_timeout")]
    pub timeout_ms: i64,
    pub retry_config: Option<RetryConfigRequest>,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

fn default_method() -> String { "POST".to_string() }
fn default_timeout() -> i64 { 30000 }
fn default_enabled() -> bool { true }

/// Retry configuration for handlers
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RetryConfigRequest {
    #[validate(range(min = 0, max = 10))]
    pub max_retries: i32,
    #[validate(range(min = 100, max = 60000))]
    pub base_delay_ms: i64,
    #[validate(range(min = 1000, max = 3600000))]
    pub max_delay_ms: i64,
    #[serde(default = "default_multiplier")]
    pub backoff_multiplier: f64,
}

fn default_multiplier() -> f64 { 2.0 }

/// Update handler request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct UpdateHandlerRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    #[validate(url)]
    pub endpoint: Option<String>,
    pub method: Option<String>,
    pub headers: Option<serde_json::Value>,
    pub timeout_ms: Option<i64>,
    pub retry_config: Option<RetryConfigRequest>,
    pub enabled: Option<bool>,
    pub metadata: Option<serde_json::Value>,
}

/// Handler response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandlerResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub handler_type: HandlerType,
    pub endpoint: String,
    pub method: String,
    pub headers: serde_json::Value,
    pub timeout_ms: i64,
    pub retry_config: RetryConfigResponse,
    pub enabled: bool,
    pub routing_rules: Vec<RoutingRuleResponse>,
    pub circuit_breaker_state: Option<CircuitBreakerStateResponse>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Retry config response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfigResponse {
    pub max_retries: i32,
    pub base_delay_ms: i64,
    pub max_delay_ms: i64,
    pub backoff_multiplier: f64,
}

/// Create routing rule request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateRoutingRuleRequest {
    pub handler_id: Uuid,
    pub queue_id: Option<Uuid>,
    pub message_type: Option<String>,
    pub condition: Option<String>,
    #[serde(default)]
    pub priority: i32,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

/// Routing rule response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingRuleResponse {
    pub id: Uuid,
    pub handler_id: Uuid,
    pub queue_id: Option<Uuid>,
    pub message_type: Option<String>,
    pub condition: Option<String>,
    pub priority: i32,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
}

/// Circuit breaker state response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreakerStateResponse {
    pub state: CircuitState,
    pub failure_count: i32,
    pub success_count: i32,
    pub last_failure_at: Option<DateTime<Utc>>,
    pub last_state_change_at: DateTime<Utc>,
    pub total_requests: i64,
    pub total_failures: i64,
    pub total_successes: i64,
}

/// Circuit state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

/// Test handler request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestHandlerRequest {
    pub test_payload: serde_json::Value,
}

/// Test handler response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestHandlerResponse {
    pub success: bool,
    pub status_code: Option<u16>,
    pub response_time_ms: i64,
    pub response_body: Option<String>,
    pub error: Option<String>,
}

/// Handler filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandlerFilters {
    pub handler_type: Option<HandlerType>,
    pub enabled: Option<bool>,
    pub name_contains: Option<String>,
}

/// Handler statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandlerStatsResponse {
    pub handler_id: Uuid,
    pub handler_name: String,
    pub total_calls: i64,
    pub successful_calls: i64,
    pub failed_calls: i64,
    pub avg_latency_ms: f64,
    pub p50_latency_ms: f64,
    pub p95_latency_ms: f64,
    pub p99_latency_ms: f64,
    pub error_rate: f64,
    pub circuit_breaker_trips: i64,
}
