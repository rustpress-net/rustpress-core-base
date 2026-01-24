//! Worker Data Models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

/// Worker status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum WorkerStatus {
    Active,
    Idle,
    Busy,
    Draining,
    Disconnected,
}

impl Default for WorkerStatus {
    fn default() -> Self {
        Self::Active
    }
}

/// Register worker request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RegisterWorkerRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub group_id: Option<Uuid>,
    pub subscribed_queues: Vec<Uuid>,
    #[validate(range(min = 1, max = 100))]
    pub concurrency_limit: i32,
    #[serde(default)]
    pub capabilities: Vec<String>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

/// Worker heartbeat request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerHeartbeatRequest {
    pub current_load: i32,
    pub active_message_ids: Vec<Uuid>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

/// Worker response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerResponse {
    pub id: Uuid,
    pub name: String,
    pub group_id: Option<Uuid>,
    pub status: WorkerStatus,
    pub subscribed_queues: Vec<Uuid>,
    pub concurrency_limit: i32,
    pub current_load: i32,
    pub capabilities: Vec<String>,
    pub last_heartbeat_at: Option<DateTime<Utc>>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

/// Worker statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerStatsResponse {
    pub worker_id: Uuid,
    pub worker_name: String,
    pub status: WorkerStatus,
    pub current_load: i32,
    pub concurrency_limit: i32,
    pub messages_processed: i64,
    pub messages_failed: i64,
    pub avg_processing_time_ms: f64,
    pub uptime_secs: i64,
    pub last_heartbeat_ago_secs: i64,
}

/// Worker group response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerGroupResponse {
    pub id: Uuid,
    pub name: String,
    pub min_workers: i32,
    pub max_workers: i32,
    pub current_workers: i32,
    pub target_workers: i32,
    pub auto_scaling_enabled: bool,
    pub scale_up_threshold: f64,
    pub scale_down_threshold: f64,
    pub cooldown_period_secs: i32,
    pub last_scaled_at: Option<DateTime<Utc>>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create worker group request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateWorkerGroupRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[validate(range(min = 0, max = 100))]
    pub min_workers: i32,
    #[validate(range(min = 1, max = 1000))]
    pub max_workers: i32,
    pub target_workers: Option<i32>,
    #[serde(default)]
    pub auto_scaling_enabled: bool,
    #[serde(default = "default_scale_up_threshold")]
    pub scale_up_threshold: f64,
    #[serde(default = "default_scale_down_threshold")]
    pub scale_down_threshold: f64,
    #[serde(default = "default_cooldown")]
    pub cooldown_period_secs: i32,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

fn default_scale_up_threshold() -> f64 {
    0.8
}
fn default_scale_down_threshold() -> f64 {
    0.2
}
fn default_cooldown() -> i32 {
    300
}

/// Scale worker group request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct ScaleWorkerGroupRequest {
    #[validate(range(min = 0, max = 1000))]
    pub target_workers: i32,
}

/// Update worker subscriptions request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSubscriptionsRequest {
    pub queue_ids: Vec<Uuid>,
}

/// Worker filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerFilters {
    pub status: Option<WorkerStatus>,
    pub group_id: Option<Uuid>,
    pub name_contains: Option<String>,
}

/// Aggregated worker pool statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerPoolStatsResponse {
    pub total_workers: i64,
    pub active_workers: i64,
    pub idle_workers: i64,
    pub busy_workers: i64,
    pub disconnected_workers: i64,
    pub total_capacity: i64,
    pub used_capacity: i64,
    pub utilization_percent: f64,
}
