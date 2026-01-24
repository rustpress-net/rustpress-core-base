//! Audit Data Models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Audit action type
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AuditAction {
    // Queue actions
    QueueCreate,
    QueueUpdate,
    QueueDelete,
    QueuePause,
    QueueResume,
    QueuePurge,

    // Message actions
    MessageEnqueue,
    MessageBatchEnqueue,
    MessageClaim,
    MessageAcknowledge,
    MessageNack,
    MessageRetry,
    MessageDelete,
    MessageMoveToDlq,

    // Worker actions
    WorkerRegister,
    WorkerUnregister,
    WorkerHeartbeat,
    WorkerDrain,

    // Handler actions
    HandlerCreate,
    HandlerUpdate,
    HandlerDelete,
    HandlerTest,
    CircuitBreakerReset,

    // Subscription actions
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionDelete,
    SubscriptionVerify,
    SubscriptionTest,

    // Job actions
    JobCreate,
    JobUpdate,
    JobDelete,
    JobPause,
    JobResume,
    JobTrigger,

    // Alert actions
    AlertRuleCreate,
    AlertRuleUpdate,
    AlertRuleDelete,
    AlertAcknowledge,
    AlertResolve,
    AlertSilence,

    // Admin actions
    ConfigUpdate,
    MaintenanceStart,
    MaintenanceEnd,
    BackupCreate,
    BackupRestore,
    DataCleanup,

    // Auth actions
    Login,
    Logout,
    PermissionGrant,
    PermissionRevoke,

    // System actions
    SystemStartup,
    SystemShutdown,
    PluginActivate,
    PluginDeactivate,
}

/// Audit log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogEntry {
    pub id: Uuid,
    pub action: AuditAction,
    pub actor_id: Option<Uuid>,
    pub actor_name: Option<String>,
    pub actor_type: ActorType,
    pub resource_type: String,
    pub resource_id: Option<Uuid>,
    pub resource_name: Option<String>,
    pub description: String,
    pub old_value: Option<serde_json::Value>,
    pub new_value: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub request_id: Option<String>,
    pub tenant_id: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

/// Actor type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ActorType {
    User,
    System,
    Worker,
    Scheduler,
    Api,
    Webhook,
}

impl Default for ActorType {
    fn default() -> Self {
        Self::System
    }
}

/// Audit log filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogFilters {
    pub action: Option<AuditAction>,
    pub actor_id: Option<Uuid>,
    pub actor_type: Option<ActorType>,
    pub resource_type: Option<String>,
    pub resource_id: Option<Uuid>,
    pub created_after: Option<DateTime<Utc>>,
    pub created_before: Option<DateTime<Utc>>,
    pub ip_address: Option<String>,
    pub tenant_id: Option<Uuid>,
}

/// Audit log response (for API)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogResponse {
    pub id: Uuid,
    pub action: AuditAction,
    pub actor_id: Option<Uuid>,
    pub actor_name: Option<String>,
    pub actor_type: ActorType,
    pub resource_type: String,
    pub resource_id: Option<Uuid>,
    pub resource_name: Option<String>,
    pub description: String,
    pub ip_address: Option<String>,
    pub tenant_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

/// Audit log detail response (includes values)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogDetailResponse {
    pub id: Uuid,
    pub action: AuditAction,
    pub actor_id: Option<Uuid>,
    pub actor_name: Option<String>,
    pub actor_type: ActorType,
    pub resource_type: String,
    pub resource_id: Option<Uuid>,
    pub resource_name: Option<String>,
    pub description: String,
    pub old_value: Option<serde_json::Value>,
    pub new_value: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub request_id: Option<String>,
    pub tenant_id: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

/// Audit statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditStatsResponse {
    pub total_entries: i64,
    pub entries_today: i64,
    pub entries_this_week: i64,
    pub entries_by_action: Vec<(String, i64)>,
    pub entries_by_actor_type: Vec<(ActorType, i64)>,
    pub top_actors: Vec<(String, i64)>,
    pub top_resources: Vec<(String, i64)>,
}

/// Export audit logs request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportAuditLogsRequest {
    pub filters: AuditLogFilters,
    pub format: ExportFormat,
    pub include_values: bool,
}

/// Export format
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Json,
    Csv,
    Pdf,
}

/// Audit context for creating entries
#[derive(Debug, Clone, Default)]
pub struct AuditContext {
    pub actor_id: Option<Uuid>,
    pub actor_name: Option<String>,
    pub actor_type: ActorType,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub request_id: Option<String>,
    pub tenant_id: Option<Uuid>,
}

impl AuditContext {
    pub fn system() -> Self {
        Self {
            actor_type: ActorType::System,
            ..Default::default()
        }
    }

    pub fn user(id: Uuid, name: &str) -> Self {
        Self {
            actor_id: Some(id),
            actor_name: Some(name.to_string()),
            actor_type: ActorType::User,
            ..Default::default()
        }
    }

    pub fn worker(id: Uuid, name: &str) -> Self {
        Self {
            actor_id: Some(id),
            actor_name: Some(name.to_string()),
            actor_type: ActorType::Worker,
            ..Default::default()
        }
    }

    pub fn with_request_info(
        mut self,
        ip: Option<String>,
        user_agent: Option<String>,
        request_id: Option<String>,
    ) -> Self {
        self.ip_address = ip;
        self.user_agent = user_agent;
        self.request_id = request_id;
        self
    }

    pub fn with_tenant(mut self, tenant_id: Uuid) -> Self {
        self.tenant_id = Some(tenant_id);
        self
    }
}
