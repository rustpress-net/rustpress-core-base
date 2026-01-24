//! Scheduled Job Data Models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

/// Job status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ScheduledJobStatus {
    Active,
    Paused,
    Running,
    Completed,
    Failed,
}

impl Default for ScheduledJobStatus {
    fn default() -> Self {
        Self::Active
    }
}

/// Schedule type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ScheduleTypeRequest {
    Cron { expression: String },
    Interval { seconds: i64 },
    Once { at: DateTime<Utc> },
}

/// Create scheduled job request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateScheduledJobRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    pub queue_id: Uuid,
    #[validate(length(min = 1, max = 255))]
    pub message_type: String,
    pub payload_template: serde_json::Value,
    pub schedule: ScheduleTypeRequest,
    #[serde(default = "default_timezone")]
    pub timezone: String,
    #[validate(range(min = 1, max = 86400))]
    #[serde(default = "default_timeout")]
    pub timeout_secs: i32,
    #[validate(range(min = 1, max = 10))]
    #[serde(default = "default_max_concurrent")]
    pub max_concurrent: i32,
    #[serde(default = "default_retry_on_failure")]
    pub retry_on_failure: bool,
    #[validate(range(min = 0, max = 10))]
    #[serde(default = "default_max_retries")]
    pub max_retries: i32,
    #[serde(default)]
    pub dependencies: Vec<Uuid>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

fn default_timezone() -> String {
    "UTC".to_string()
}
fn default_timeout() -> i32 {
    300
}
fn default_max_concurrent() -> i32 {
    1
}
fn default_retry_on_failure() -> bool {
    true
}
fn default_max_retries() -> i32 {
    3
}

/// Update scheduled job request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct UpdateScheduledJobRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub queue_id: Option<Uuid>,
    pub message_type: Option<String>,
    pub payload_template: Option<serde_json::Value>,
    pub schedule: Option<ScheduleTypeRequest>,
    pub timezone: Option<String>,
    pub timeout_secs: Option<i32>,
    pub max_concurrent: Option<i32>,
    pub retry_on_failure: Option<bool>,
    pub max_retries: Option<i32>,
    pub metadata: Option<serde_json::Value>,
}

/// Scheduled job response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledJobResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload_template: serde_json::Value,
    pub schedule: ScheduleTypeResponse,
    pub timezone: String,
    pub status: ScheduledJobStatus,
    pub timeout_secs: i32,
    pub max_concurrent: i32,
    pub current_concurrent: i32,
    pub retry_on_failure: bool,
    pub max_retries: i32,
    pub total_runs: i64,
    pub successful_runs: i64,
    pub failed_runs: i64,
    pub last_run_at: Option<DateTime<Utc>>,
    pub next_run_at: Option<DateTime<Utc>>,
    pub dependencies: Vec<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Schedule type response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ScheduleTypeResponse {
    Cron { expression: String },
    Interval { seconds: i64 },
    Once { at: DateTime<Utc> },
}

/// Job execution status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum JobExecutionStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Job execution response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobExecutionResponse {
    pub id: Uuid,
    pub job_id: Uuid,
    pub status: JobExecutionStatus,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<i64>,
    pub message_id: Option<Uuid>,
    pub error: Option<String>,
    pub retry_count: i32,
    pub metadata: serde_json::Value,
}

/// Add job dependency request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddJobDependencyRequest {
    pub dependency_job_id: Uuid,
}

/// Job statistics response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobStatsResponse {
    pub job_id: Uuid,
    pub job_name: String,
    pub total_executions: i64,
    pub successful_executions: i64,
    pub failed_executions: i64,
    pub avg_duration_ms: f64,
    pub last_execution_at: Option<DateTime<Utc>>,
    pub next_execution_at: Option<DateTime<Utc>>,
    pub success_rate: f64,
}

/// Job filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobFilters {
    pub status: Option<ScheduledJobStatus>,
    pub queue_id: Option<Uuid>,
    pub name_contains: Option<String>,
}
