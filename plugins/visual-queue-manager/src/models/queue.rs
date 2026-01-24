//! Queue Data Models

use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

/// Queue status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum QueueStatus {
    Active,
    Paused,
    Draining,
    Disabled,
}

impl Default for QueueStatus {
    fn default() -> Self {
        Self::Active
    }
}

/// Queue creation request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateQueueRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    #[validate(range(min = 0, max = 100))]
    pub max_retries: Option<i32>,
    pub retry_delay_ms: Option<i64>,
    pub visibility_timeout_secs: Option<i32>,
    pub message_ttl_secs: Option<i64>,
    pub max_message_size_bytes: Option<i64>,
    pub max_queue_size: Option<i64>,
    #[serde(default)]
    pub priority_enabled: bool,
    #[serde(default)]
    pub fifo_enabled: bool,
    #[serde(default)]
    pub content_based_deduplication: bool,
    pub deduplication_window_secs: Option<i32>,
    pub rate_limit_per_second: Option<f64>,
    pub dlq_queue_id: Option<Uuid>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

/// Queue update request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct UpdateQueueRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    #[validate(range(min = 0, max = 100))]
    pub max_retries: Option<i32>,
    pub retry_delay_ms: Option<i64>,
    pub visibility_timeout_secs: Option<i32>,
    pub message_ttl_secs: Option<i64>,
    pub max_message_size_bytes: Option<i64>,
    pub max_queue_size: Option<i64>,
    pub priority_enabled: Option<bool>,
    pub rate_limit_per_second: Option<f64>,
    pub dlq_queue_id: Option<Uuid>,
    pub metadata: Option<serde_json::Value>,
}

/// Queue response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub status: QueueStatus,
    pub max_retries: i32,
    pub retry_delay_ms: i64,
    pub visibility_timeout_secs: i32,
    pub message_ttl_secs: i64,
    pub max_message_size_bytes: i64,
    pub max_queue_size: i64,
    pub priority_enabled: bool,
    pub fifo_enabled: bool,
    pub content_based_deduplication: bool,
    pub deduplication_window_secs: i32,
    pub rate_limit_per_second: Option<f64>,
    pub dlq_queue_id: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Queue statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueStatsResponse {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub status: QueueStatus,
    pub total_messages: i64,
    pub pending_messages: i64,
    pub processing_messages: i64,
    pub completed_messages: i64,
    pub failed_messages: i64,
    pub dlq_messages: i64,
    pub messages_per_minute: f64,
    pub avg_processing_time_ms: f64,
    pub oldest_message_age_secs: Option<i64>,
    pub approximate_age_of_oldest_message: Option<DateTime<Utc>>,
}

/// Queue list filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueFilters {
    pub status: Option<QueueStatus>,
    pub name_contains: Option<String>,
}

/// Queue template for creating pre-configured queues
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueTemplate {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub config: CreateQueueRequest,
    pub created_at: DateTime<Utc>,
}

/// Batch queue operation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchQueueOperationRequest {
    pub queue_ids: Vec<Uuid>,
    pub operation: BatchQueueOperation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BatchQueueOperation {
    Pause,
    Resume,
    Delete,
}
