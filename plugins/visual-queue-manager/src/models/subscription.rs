//! Webhook Subscription Data Models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

/// Subscription status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum SubscriptionStatus {
    Active,
    Paused,
    PendingVerification,
    Failed,
    Disabled,
}

impl Default for SubscriptionStatus {
    fn default() -> Self {
        Self::PendingVerification
    }
}

/// Create subscription request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateSubscriptionRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    #[validate(url)]
    pub endpoint_url: String,
    pub events: Vec<String>,
    #[serde(default)]
    pub headers: serde_json::Value,
    #[validate(range(min = 1000, max = 60000))]
    #[serde(default = "default_timeout")]
    pub timeout_ms: i32,
    pub retry_policy: Option<SubscriptionRetryPolicy>,
    #[serde(default)]
    pub filter: Option<SubscriptionFilter>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

fn default_timeout() -> i32 {
    10000
}

/// Subscription retry policy
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct SubscriptionRetryPolicy {
    #[validate(range(min = 0, max = 10))]
    pub max_retries: i32,
    #[validate(range(min = 100, max = 60000))]
    pub base_delay_ms: i64,
    #[validate(range(min = 1000, max = 3600000))]
    pub max_delay_ms: i64,
}

/// Subscription filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscriptionFilter {
    pub queue_ids: Option<Vec<Uuid>>,
    pub message_types: Option<Vec<String>>,
    pub conditions: Option<serde_json::Value>,
}

/// Update subscription request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct UpdateSubscriptionRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    #[validate(url)]
    pub endpoint_url: Option<String>,
    pub events: Option<Vec<String>>,
    pub headers: Option<serde_json::Value>,
    pub timeout_ms: Option<i32>,
    pub retry_policy: Option<SubscriptionRetryPolicy>,
    pub filter: Option<SubscriptionFilter>,
    pub metadata: Option<serde_json::Value>,
}

/// Subscription response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscriptionResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub endpoint_url: String,
    pub status: SubscriptionStatus,
    pub events: Vec<String>,
    pub headers: serde_json::Value,
    pub timeout_ms: i32,
    pub retry_policy: SubscriptionRetryPolicy,
    pub filter: Option<SubscriptionFilter>,
    pub secret_key: Option<String>,
    pub verified_at: Option<DateTime<Utc>>,
    pub last_delivery_at: Option<DateTime<Utc>>,
    pub consecutive_failures: i32,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Delivery status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum DeliveryStatus {
    Pending,
    Delivered,
    Failed,
    Retrying,
}

/// Delivery response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryResponse {
    pub id: Uuid,
    pub subscription_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub status: DeliveryStatus,
    pub attempts: i32,
    pub last_attempt_at: Option<DateTime<Utc>>,
    pub delivered_at: Option<DateTime<Utc>>,
    pub response_status_code: Option<i32>,
    pub response_time_ms: Option<i64>,
    pub last_error: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Test subscription request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubscriptionRequest {
    pub event_type: String,
    pub test_payload: serde_json::Value,
}

/// Test subscription response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubscriptionResponse {
    pub success: bool,
    pub status_code: Option<u16>,
    pub response_time_ms: i64,
    pub error: Option<String>,
}

/// Verify subscription request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifySubscriptionRequest {
    pub challenge_response: String,
}

/// Subscription statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscriptionStatsResponse {
    pub subscription_id: Uuid,
    pub total_deliveries: i64,
    pub successful_deliveries: i64,
    pub failed_deliveries: i64,
    pub avg_response_time_ms: f64,
    pub success_rate: f64,
    pub last_delivery_at: Option<DateTime<Utc>>,
}

/// Subscription filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscriptionFilters {
    pub status: Option<SubscriptionStatus>,
    pub name_contains: Option<String>,
}
