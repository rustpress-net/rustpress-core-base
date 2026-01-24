//! Message Data Models

use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

/// Message status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum MessageStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    DeadLetter,
    Scheduled,
}

impl Default for MessageStatus {
    fn default() -> Self {
        Self::Pending
    }
}

/// Enqueue message request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct EnqueueMessageRequest {
    pub queue_id: Uuid,
    #[validate(length(min = 1, max = 255))]
    pub message_type: String,
    pub payload: serde_json::Value,
    #[serde(default)]
    pub headers: serde_json::Value,
    #[serde(default)]
    pub priority: i32,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub deduplication_id: Option<String>,
    pub group_id: Option<String>,
    pub correlation_id: Option<String>,
    pub trace_id: Option<String>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

/// Batch enqueue request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct BatchEnqueueRequest {
    pub queue_id: Uuid,
    #[validate(length(min = 1, max = 1000))]
    pub messages: Vec<BatchMessageItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct BatchMessageItem {
    #[validate(length(min = 1, max = 255))]
    pub message_type: String,
    pub payload: serde_json::Value,
    #[serde(default)]
    pub headers: serde_json::Value,
    #[serde(default)]
    pub priority: i32,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub deduplication_id: Option<String>,
    pub group_id: Option<String>,
}

/// Message response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageResponse {
    pub id: Uuid,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub headers: serde_json::Value,
    pub priority: i32,
    pub status: MessageStatus,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub created_at: DateTime<Utc>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub processing_started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub visibility_timeout_at: Option<DateTime<Utc>>,
    pub deduplication_id: Option<String>,
    pub group_id: Option<String>,
    pub correlation_id: Option<String>,
    pub trace_id: Option<String>,
    pub claimed_by: Option<Uuid>,
    pub last_error: Option<String>,
    pub metadata: serde_json::Value,
}

/// Claim messages request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct ClaimMessagesRequest {
    pub worker_id: Uuid,
    pub queue_ids: Vec<Uuid>,
    #[validate(range(min = 1, max = 100))]
    pub max_messages: i32,
    pub visibility_timeout_secs: Option<i32>,
}

/// Acknowledge message request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcknowledgeMessageRequest {
    pub worker_id: Uuid,
}

/// Negative acknowledge request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NackMessageRequest {
    pub worker_id: Uuid,
    pub error: Option<String>,
    pub requeue: bool,
    pub delay_ms: Option<i64>,
}

/// Retry message request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryMessageRequest {
    pub delay_ms: Option<i64>,
    pub reset_attempts: bool,
}

/// Bulk operation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkMessageOperationRequest {
    pub message_ids: Vec<Uuid>,
    pub operation: BulkMessageOperation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BulkMessageOperation {
    Delete,
    Retry,
    MoveToDlq,
    UpdatePriority { priority: i32 },
}

/// Message filters for queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageFilters {
    pub queue_id: Option<Uuid>,
    pub status: Option<MessageStatus>,
    pub message_type: Option<String>,
    pub group_id: Option<String>,
    pub correlation_id: Option<String>,
    pub created_after: Option<DateTime<Utc>>,
    pub created_before: Option<DateTime<Utc>>,
    pub priority_min: Option<i32>,
    pub priority_max: Option<i32>,
}

/// Message with processing context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageWithContext {
    pub message: MessageResponse,
    pub queue_name: String,
    pub handler_name: Option<String>,
    pub retry_history: Vec<RetryAttempt>,
}

/// Retry attempt record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryAttempt {
    pub attempt: i32,
    pub attempted_at: DateTime<Utc>,
    pub error: Option<String>,
    pub delay_ms: i64,
}

/// Enqueue result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnqueueResult {
    pub message_id: Uuid,
    pub queue_id: Uuid,
    pub deduplicated: bool,
}

/// Batch enqueue result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchEnqueueResult {
    pub total: usize,
    pub succeeded: usize,
    pub failed: usize,
    pub results: Vec<BatchEnqueueItemResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchEnqueueItemResult {
    pub index: usize,
    pub message_id: Option<Uuid>,
    pub success: bool,
    pub error: Option<String>,
    pub deduplicated: bool,
}
