//! Permission and RBAC System
//!
//! Provides role-based access control for the Queue Manager plugin.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Permission manager for RBAC
pub struct PermissionManager {
    roles: Arc<RwLock<HashMap<String, Role>>>,
    user_roles: Arc<RwLock<HashMap<String, HashSet<String>>>>,
    capabilities: Arc<RwLock<HashSet<Capability>>>,
}

impl PermissionManager {
    pub fn new() -> Self {
        Self {
            roles: Arc::new(RwLock::new(HashMap::new())),
            user_roles: Arc::new(RwLock::new(HashMap::new())),
            capabilities: Arc::new(RwLock::new(HashSet::new())),
        }
    }

    pub async fn register_all(&self) -> Result<(), super::AdminError> {
        self.register_capabilities().await;
        self.register_default_roles().await;
        Ok(())
    }

    async fn register_capabilities(&self) {
        let mut caps = self.capabilities.write().await;

        // Queue capabilities
        caps.insert(Capability::ViewQueues);
        caps.insert(Capability::CreateQueue);
        caps.insert(Capability::UpdateQueue);
        caps.insert(Capability::DeleteQueue);
        caps.insert(Capability::PauseQueue);
        caps.insert(Capability::PurgeQueue);

        // Message capabilities
        caps.insert(Capability::ViewMessages);
        caps.insert(Capability::EnqueueMessage);
        caps.insert(Capability::DeleteMessage);
        caps.insert(Capability::RetryMessage);
        caps.insert(Capability::ManageDLQ);

        // Worker capabilities
        caps.insert(Capability::ViewWorkers);
        caps.insert(Capability::ManageWorkers);
        caps.insert(Capability::DrainWorker);

        // Handler capabilities
        caps.insert(Capability::ViewHandlers);
        caps.insert(Capability::CreateHandler);
        caps.insert(Capability::UpdateHandler);
        caps.insert(Capability::DeleteHandler);
        caps.insert(Capability::TestHandler);

        // Subscription capabilities
        caps.insert(Capability::ViewSubscriptions);
        caps.insert(Capability::ManageSubscriptions);

        // Job capabilities
        caps.insert(Capability::ViewJobs);
        caps.insert(Capability::ManageJobs);
        caps.insert(Capability::TriggerJob);

        // Alert capabilities
        caps.insert(Capability::ViewAlerts);
        caps.insert(Capability::ManageAlerts);
        caps.insert(Capability::AcknowledgeAlert);

        // Metrics capabilities
        caps.insert(Capability::ViewMetrics);
        caps.insert(Capability::ExportMetrics);

        // Audit capabilities
        caps.insert(Capability::ViewAuditLogs);
        caps.insert(Capability::ExportAuditLogs);

        // Settings capabilities
        caps.insert(Capability::ViewSettings);
        caps.insert(Capability::ManageSettings);

        // Admin capabilities
        caps.insert(Capability::FullAccess);
    }

    async fn register_default_roles(&self) {
        let mut roles = self.roles.write().await;

        // Administrator - full access
        roles.insert("vqm_admin".to_string(), Role {
            id: "vqm_admin".to_string(),
            name: "Queue Manager Administrator".to_string(),
            description: "Full access to all Queue Manager features".to_string(),
            capabilities: vec![Capability::FullAccess],
            is_system: true,
        });

        // Operator - can manage queues and messages
        roles.insert("vqm_operator".to_string(), Role {
            id: "vqm_operator".to_string(),
            name: "Queue Manager Operator".to_string(),
            description: "Can manage queues, messages, and workers".to_string(),
            capabilities: vec![
                Capability::ViewQueues,
                Capability::CreateQueue,
                Capability::UpdateQueue,
                Capability::PauseQueue,
                Capability::ViewMessages,
                Capability::EnqueueMessage,
                Capability::RetryMessage,
                Capability::ManageDLQ,
                Capability::ViewWorkers,
                Capability::ManageWorkers,
                Capability::ViewHandlers,
                Capability::ViewSubscriptions,
                Capability::ViewJobs,
                Capability::TriggerJob,
                Capability::ViewAlerts,
                Capability::AcknowledgeAlert,
                Capability::ViewMetrics,
            ],
            is_system: true,
        });

        // Developer - can enqueue and view
        roles.insert("vqm_developer".to_string(), Role {
            id: "vqm_developer".to_string(),
            name: "Queue Manager Developer".to_string(),
            description: "Can enqueue messages and view queue status".to_string(),
            capabilities: vec![
                Capability::ViewQueues,
                Capability::ViewMessages,
                Capability::EnqueueMessage,
                Capability::ViewWorkers,
                Capability::ViewHandlers,
                Capability::ViewSubscriptions,
                Capability::ViewJobs,
                Capability::ViewMetrics,
            ],
            is_system: true,
        });

        // Viewer - read-only access
        roles.insert("vqm_viewer".to_string(), Role {
            id: "vqm_viewer".to_string(),
            name: "Queue Manager Viewer".to_string(),
            description: "Read-only access to Queue Manager".to_string(),
            capabilities: vec![
                Capability::ViewQueues,
                Capability::ViewMessages,
                Capability::ViewWorkers,
                Capability::ViewHandlers,
                Capability::ViewSubscriptions,
                Capability::ViewJobs,
                Capability::ViewAlerts,
                Capability::ViewMetrics,
            ],
            is_system: true,
        });
    }

    /// Check if a user has a specific capability
    pub async fn user_can(&self, user_id: &str, capability: Capability) -> bool {
        let user_roles = self.user_roles.read().await;
        let roles = self.roles.read().await;

        if let Some(user_role_ids) = user_roles.get(user_id) {
            for role_id in user_role_ids {
                if let Some(role) = roles.get(role_id) {
                    if role.capabilities.contains(&Capability::FullAccess) {
                        return true;
                    }
                    if role.capabilities.contains(&capability) {
                        return true;
                    }
                }
            }
        }

        false
    }

    /// Assign a role to a user
    pub async fn assign_role(&self, user_id: &str, role_id: &str) -> Result<(), PermissionError> {
        let roles = self.roles.read().await;
        if !roles.contains_key(role_id) {
            return Err(PermissionError::RoleNotFound(role_id.to_string()));
        }
        drop(roles);

        let mut user_roles = self.user_roles.write().await;
        user_roles
            .entry(user_id.to_string())
            .or_insert_with(HashSet::new)
            .insert(role_id.to_string());

        Ok(())
    }

    /// Remove a role from a user
    pub async fn revoke_role(&self, user_id: &str, role_id: &str) {
        let mut user_roles = self.user_roles.write().await;
        if let Some(roles) = user_roles.get_mut(user_id) {
            roles.remove(role_id);
        }
    }

    /// Get all roles for a user
    pub async fn get_user_roles(&self, user_id: &str) -> Vec<Role> {
        let user_roles = self.user_roles.read().await;
        let roles = self.roles.read().await;

        user_roles
            .get(user_id)
            .map(|role_ids| {
                role_ids
                    .iter()
                    .filter_map(|id| roles.get(id).cloned())
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Create a custom role
    pub async fn create_role(&self, role: Role) -> Result<(), PermissionError> {
        if role.is_system {
            return Err(PermissionError::CannotModifySystemRole);
        }

        let mut roles = self.roles.write().await;
        if roles.contains_key(&role.id) {
            return Err(PermissionError::RoleExists(role.id.clone()));
        }

        roles.insert(role.id.clone(), role);
        Ok(())
    }

    /// Delete a custom role
    pub async fn delete_role(&self, role_id: &str) -> Result<(), PermissionError> {
        let mut roles = self.roles.write().await;

        if let Some(role) = roles.get(role_id) {
            if role.is_system {
                return Err(PermissionError::CannotModifySystemRole);
            }
        }

        roles.remove(role_id);
        Ok(())
    }

    /// Get all available roles
    pub async fn list_roles(&self) -> Vec<Role> {
        let roles = self.roles.read().await;
        roles.values().cloned().collect()
    }

    /// Get all available capabilities
    pub async fn list_capabilities(&self) -> Vec<Capability> {
        let caps = self.capabilities.read().await;
        caps.iter().cloned().collect()
    }
}

/// Role definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: String,
    pub name: String,
    pub description: String,
    pub capabilities: Vec<Capability>,
    pub is_system: bool,
}

/// Available capabilities
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Capability {
    // Queue management
    ViewQueues,
    CreateQueue,
    UpdateQueue,
    DeleteQueue,
    PauseQueue,
    PurgeQueue,

    // Message management
    ViewMessages,
    EnqueueMessage,
    DeleteMessage,
    RetryMessage,
    ManageDLQ,

    // Worker management
    ViewWorkers,
    ManageWorkers,
    DrainWorker,

    // Handler management
    ViewHandlers,
    CreateHandler,
    UpdateHandler,
    DeleteHandler,
    TestHandler,

    // Subscription management
    ViewSubscriptions,
    ManageSubscriptions,

    // Job management
    ViewJobs,
    ManageJobs,
    TriggerJob,

    // Alert management
    ViewAlerts,
    ManageAlerts,
    AcknowledgeAlert,

    // Metrics
    ViewMetrics,
    ExportMetrics,

    // Audit
    ViewAuditLogs,
    ExportAuditLogs,

    // Settings
    ViewSettings,
    ManageSettings,

    // Super admin
    FullAccess,
}

impl std::fmt::Display for Capability {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Capability::ViewQueues => "view_queues",
            Capability::CreateQueue => "create_queue",
            Capability::UpdateQueue => "update_queue",
            Capability::DeleteQueue => "delete_queue",
            Capability::PauseQueue => "pause_queue",
            Capability::PurgeQueue => "purge_queue",
            Capability::ViewMessages => "view_messages",
            Capability::EnqueueMessage => "enqueue_message",
            Capability::DeleteMessage => "delete_message",
            Capability::RetryMessage => "retry_message",
            Capability::ManageDLQ => "manage_dlq",
            Capability::ViewWorkers => "view_workers",
            Capability::ManageWorkers => "manage_workers",
            Capability::DrainWorker => "drain_worker",
            Capability::ViewHandlers => "view_handlers",
            Capability::CreateHandler => "create_handler",
            Capability::UpdateHandler => "update_handler",
            Capability::DeleteHandler => "delete_handler",
            Capability::TestHandler => "test_handler",
            Capability::ViewSubscriptions => "view_subscriptions",
            Capability::ManageSubscriptions => "manage_subscriptions",
            Capability::ViewJobs => "view_jobs",
            Capability::ManageJobs => "manage_jobs",
            Capability::TriggerJob => "trigger_job",
            Capability::ViewAlerts => "view_alerts",
            Capability::ManageAlerts => "manage_alerts",
            Capability::AcknowledgeAlert => "acknowledge_alert",
            Capability::ViewMetrics => "view_metrics",
            Capability::ExportMetrics => "export_metrics",
            Capability::ViewAuditLogs => "view_audit_logs",
            Capability::ExportAuditLogs => "export_audit_logs",
            Capability::ViewSettings => "view_settings",
            Capability::ManageSettings => "manage_settings",
            Capability::FullAccess => "full_access",
        };
        write!(f, "{}", s)
    }
}

/// Permission errors
#[derive(Debug, thiserror::Error)]
pub enum PermissionError {
    #[error("Role not found: {0}")]
    RoleNotFound(String),

    #[error("Role already exists: {0}")]
    RoleExists(String),

    #[error("Cannot modify system role")]
    CannotModifySystemRole,

    #[error("Access denied: missing capability {0}")]
    AccessDenied(String),
}

/// Permission guard for async handlers
pub struct PermissionGuard {
    manager: Arc<PermissionManager>,
    user_id: String,
    required: Vec<Capability>,
}

impl PermissionGuard {
    pub fn new(manager: Arc<PermissionManager>, user_id: String) -> Self {
        Self {
            manager,
            user_id,
            required: Vec::new(),
        }
    }

    pub fn require(mut self, capability: Capability) -> Self {
        self.required.push(capability);
        self
    }

    pub async fn check(&self) -> Result<(), PermissionError> {
        for cap in &self.required {
            if !self.manager.user_can(&self.user_id, *cap).await {
                return Err(PermissionError::AccessDenied(cap.to_string()));
            }
        }
        Ok(())
    }
}
