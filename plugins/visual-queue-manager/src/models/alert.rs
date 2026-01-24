//! Alert Data Models

use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

/// Alert severity
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AlertSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

impl Default for AlertSeverity {
    fn default() -> Self {
        Self::Warning
    }
}

/// Alert status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AlertStatus {
    Active,
    Acknowledged,
    Resolved,
    Silenced,
}

impl Default for AlertStatus {
    fn default() -> Self {
        Self::Active
    }
}

/// Metric type for alert rules
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AlertMetricType {
    QueueDepth,
    MessageAge,
    ErrorRate,
    ProcessingTime,
    WorkerCount,
    ThroughputRate,
    DlqDepth,
    Custom,
}

/// Comparison operator
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ComparisonOperator {
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Equal,
    NotEqual,
}

/// Create alert rule request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateAlertRuleRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    pub metric_type: AlertMetricType,
    pub metric_name: Option<String>,
    pub queue_id: Option<Uuid>,
    pub operator: ComparisonOperator,
    pub threshold: f64,
    pub duration_secs: Option<i32>,
    pub severity: AlertSeverity,
    pub notification_channels: Vec<NotificationChannel>,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    #[serde(default)]
    pub labels: serde_json::Value,
}

fn default_enabled() -> bool { true }

/// Notification channel
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum NotificationChannel {
    Email { addresses: Vec<String> },
    Slack { webhook_url: String, channel: Option<String> },
    Webhook { url: String, headers: Option<serde_json::Value> },
    PagerDuty { routing_key: String },
}

/// Update alert rule request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct UpdateAlertRuleRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub threshold: Option<f64>,
    pub duration_secs: Option<i32>,
    pub severity: Option<AlertSeverity>,
    pub notification_channels: Option<Vec<NotificationChannel>>,
    pub enabled: Option<bool>,
    pub labels: Option<serde_json::Value>,
}

/// Alert rule response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertRuleResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub metric_type: AlertMetricType,
    pub metric_name: Option<String>,
    pub queue_id: Option<Uuid>,
    pub operator: ComparisonOperator,
    pub threshold: f64,
    pub duration_secs: Option<i32>,
    pub severity: AlertSeverity,
    pub notification_channels: Vec<NotificationChannel>,
    pub enabled: bool,
    pub labels: serde_json::Value,
    pub last_triggered_at: Option<DateTime<Utc>>,
    pub trigger_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Alert response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertResponse {
    pub id: Uuid,
    pub rule_id: Uuid,
    pub rule_name: String,
    pub severity: AlertSeverity,
    pub status: AlertStatus,
    pub message: String,
    pub metric_value: f64,
    pub threshold: f64,
    pub queue_id: Option<Uuid>,
    pub triggered_at: DateTime<Utc>,
    pub acknowledged_at: Option<DateTime<Utc>>,
    pub acknowledged_by: Option<String>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub resolved_by: Option<String>,
    pub labels: serde_json::Value,
    pub metadata: serde_json::Value,
}

/// Acknowledge alert request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcknowledgeAlertRequest {
    pub acknowledged_by: String,
    pub comment: Option<String>,
}

/// Resolve alert request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolveAlertRequest {
    pub resolved_by: String,
    pub resolution: Option<String>,
}

/// Silence alert request
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct SilenceAlertRequest {
    pub rule_id: Option<Uuid>,
    pub queue_id: Option<Uuid>,
    #[validate(range(min = 1, max = 604800))]
    pub duration_secs: i32,
    pub created_by: String,
    pub reason: Option<String>,
}

/// Silence response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SilenceResponse {
    pub id: Uuid,
    pub rule_id: Option<Uuid>,
    pub queue_id: Option<Uuid>,
    pub expires_at: DateTime<Utc>,
    pub created_by: String,
    pub reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Alert history filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertFilters {
    pub status: Option<AlertStatus>,
    pub severity: Option<AlertSeverity>,
    pub rule_id: Option<Uuid>,
    pub queue_id: Option<Uuid>,
    pub triggered_after: Option<DateTime<Utc>>,
    pub triggered_before: Option<DateTime<Utc>>,
}

/// Alert statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertStatsResponse {
    pub total_alerts: i64,
    pub active_alerts: i64,
    pub acknowledged_alerts: i64,
    pub resolved_alerts: i64,
    pub alerts_by_severity: Vec<(AlertSeverity, i64)>,
    pub avg_time_to_acknowledge_secs: Option<f64>,
    pub avg_time_to_resolve_secs: Option<f64>,
}
