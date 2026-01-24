//! Multi-Tenancy Support
//!
//! Provides tenant isolation, management, and resource allocation for enterprise deployments.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Multi-tenancy manager
pub struct TenancyManager {
    config: TenancyConfig,
    tenants: Arc<RwLock<HashMap<String, Tenant>>>,
    resource_allocations: Arc<RwLock<HashMap<String, ResourceAllocation>>>,
}

impl TenancyManager {
    pub fn new(config: TenancyConfig) -> Self {
        Self {
            config,
            tenants: Arc::new(RwLock::new(HashMap::new())),
            resource_allocations: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn initialize(&self) -> Result<(), super::EnterpriseError> {
        // Initialize default tenant if configured
        if self.config.create_default_tenant {
            self.create_tenant(CreateTenantRequest {
                name: "default".to_string(),
                display_name: "Default Tenant".to_string(),
                tier: TenantTier::Standard,
                settings: None,
            })
            .await?;
        }
        Ok(())
    }

    /// Create a new tenant
    pub async fn create_tenant(
        &self,
        request: CreateTenantRequest,
    ) -> Result<Tenant, super::EnterpriseError> {
        let mut tenants = self.tenants.write().await;

        // Check if tenant already exists
        if tenants.values().any(|t| t.name == request.name) {
            return Err(super::EnterpriseError::Tenancy(format!(
                "Tenant '{}' already exists",
                request.name
            )));
        }

        let tenant_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        let tenant = Tenant {
            id: tenant_id.clone(),
            name: request.name,
            display_name: request.display_name,
            tier: request.tier,
            status: TenantStatus::Active,
            settings: request.settings.unwrap_or_default(),
            created_at: now,
            updated_at: now,
            metadata: HashMap::new(),
        };

        // Set up resource allocation based on tier
        let allocation = self.get_tier_allocation(&tenant.tier);
        self.resource_allocations
            .write()
            .await
            .insert(tenant_id.clone(), allocation);

        tenants.insert(tenant_id, tenant.clone());
        Ok(tenant)
    }

    /// Get a tenant by ID
    pub async fn get_tenant(&self, tenant_id: &str) -> Option<Tenant> {
        let tenants = self.tenants.read().await;
        tenants.get(tenant_id).cloned()
    }

    /// Get tenant by name
    pub async fn get_tenant_by_name(&self, name: &str) -> Option<Tenant> {
        let tenants = self.tenants.read().await;
        tenants.values().find(|t| t.name == name).cloned()
    }

    /// List all tenants
    pub async fn list_tenants(&self) -> Vec<Tenant> {
        let tenants = self.tenants.read().await;
        tenants.values().cloned().collect()
    }

    /// Update tenant settings
    pub async fn update_tenant(
        &self,
        tenant_id: &str,
        update: UpdateTenantRequest,
    ) -> Result<Tenant, super::EnterpriseError> {
        let mut tenants = self.tenants.write().await;

        let tenant = tenants
            .get_mut(tenant_id)
            .ok_or_else(|| super::EnterpriseError::Tenancy("Tenant not found".to_string()))?;

        if let Some(display_name) = update.display_name {
            tenant.display_name = display_name;
        }

        if let Some(tier) = update.tier {
            tenant.tier = tier.clone();
            // Update resource allocation
            let allocation = self.get_tier_allocation(&tier);
            self.resource_allocations
                .write()
                .await
                .insert(tenant_id.to_string(), allocation);
        }

        if let Some(settings) = update.settings {
            tenant.settings = settings;
        }

        if let Some(status) = update.status {
            tenant.status = status;
        }

        tenant.updated_at = chrono::Utc::now();

        Ok(tenant.clone())
    }

    /// Delete a tenant
    pub async fn delete_tenant(&self, tenant_id: &str) -> Result<(), super::EnterpriseError> {
        let mut tenants = self.tenants.write().await;

        if let Some(tenant) = tenants.get(tenant_id) {
            if tenant.name == "default" {
                return Err(super::EnterpriseError::Tenancy(
                    "Cannot delete default tenant".to_string(),
                ));
            }
        }

        tenants.remove(tenant_id);
        self.resource_allocations.write().await.remove(tenant_id);

        Ok(())
    }

    /// Check if tenant has capacity for resource
    pub async fn check_capacity(
        &self,
        tenant_id: &str,
        resource: ResourceType,
        requested: u64,
    ) -> Result<bool, super::EnterpriseError> {
        let allocations = self.resource_allocations.read().await;

        let allocation = allocations
            .get(tenant_id)
            .ok_or_else(|| super::EnterpriseError::Tenancy("Tenant not found".to_string()))?;

        let limit = match resource {
            ResourceType::Queues => allocation.max_queues,
            ResourceType::Messages => allocation.max_messages_per_queue,
            ResourceType::Workers => allocation.max_workers,
            ResourceType::MessageSize => allocation.max_message_size as u64,
            ResourceType::RequestsPerSecond => allocation.requests_per_second as u64,
        };

        Ok(requested <= limit)
    }

    /// Get resource allocation for a tenant
    pub async fn get_allocation(&self, tenant_id: &str) -> Option<ResourceAllocation> {
        let allocations = self.resource_allocations.read().await;
        allocations.get(tenant_id).cloned()
    }

    /// Get default allocation for a tier
    fn get_tier_allocation(&self, tier: &TenantTier) -> ResourceAllocation {
        match tier {
            TenantTier::Free => ResourceAllocation {
                max_queues: 5,
                max_messages_per_queue: 10000,
                max_workers: 2,
                max_message_size: 64 * 1024, // 64KB
                requests_per_second: 10,
                storage_gb: 1,
                retention_days: 7,
            },
            TenantTier::Standard => ResourceAllocation {
                max_queues: 50,
                max_messages_per_queue: 100000,
                max_workers: 10,
                max_message_size: 256 * 1024, // 256KB
                requests_per_second: 100,
                storage_gb: 10,
                retention_days: 30,
            },
            TenantTier::Professional => ResourceAllocation {
                max_queues: 500,
                max_messages_per_queue: 1000000,
                max_workers: 100,
                max_message_size: 1024 * 1024, // 1MB
                requests_per_second: 1000,
                storage_gb: 100,
                retention_days: 90,
            },
            TenantTier::Enterprise => ResourceAllocation {
                max_queues: u64::MAX,
                max_messages_per_queue: u64::MAX,
                max_workers: u64::MAX,
                max_message_size: 10 * 1024 * 1024, // 10MB
                requests_per_second: 10000,
                storage_gb: 1000,
                retention_days: 365,
            },
        }
    }

    /// Validate tenant context for an operation
    pub async fn validate_context(&self, ctx: &TenantContext) -> Result<(), super::EnterpriseError> {
        let tenants = self.tenants.read().await;

        let tenant = tenants
            .get(&ctx.tenant_id)
            .ok_or_else(|| super::EnterpriseError::Tenancy("Tenant not found".to_string()))?;

        if tenant.status != TenantStatus::Active {
            return Err(super::EnterpriseError::Tenancy(format!(
                "Tenant is {:?}",
                tenant.status
            )));
        }

        Ok(())
    }
}

/// Tenant configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenancyConfig {
    pub enabled: bool,
    pub create_default_tenant: bool,
    pub isolation_mode: IsolationMode,
    pub allow_cross_tenant_access: bool,
}

impl Default for TenancyConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            create_default_tenant: true,
            isolation_mode: IsolationMode::Logical,
            allow_cross_tenant_access: false,
        }
    }
}

/// Isolation mode for multi-tenancy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IsolationMode {
    /// Logical isolation using tenant IDs
    Logical,
    /// Schema-based isolation (separate database schemas)
    Schema,
    /// Database-based isolation (separate databases)
    Database,
}

/// Tenant definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tenant {
    pub id: String,
    pub name: String,
    pub display_name: String,
    pub tier: TenantTier,
    pub status: TenantStatus,
    pub settings: TenantSettings,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, String>,
}

/// Tenant tier levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TenantTier {
    Free,
    Standard,
    Professional,
    Enterprise,
}

/// Tenant status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TenantStatus {
    Active,
    Suspended,
    PendingDeletion,
    Deleted,
}

/// Tenant-specific settings
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TenantSettings {
    pub custom_domain: Option<String>,
    pub webhook_url: Option<String>,
    pub notification_email: Option<String>,
    pub timezone: Option<String>,
    pub locale: Option<String>,
    pub features: HashMap<String, bool>,
}

/// Resource allocation for a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAllocation {
    pub max_queues: u64,
    pub max_messages_per_queue: u64,
    pub max_workers: u64,
    pub max_message_size: usize,
    pub requests_per_second: u32,
    pub storage_gb: u64,
    pub retention_days: u32,
}

/// Resource types for capacity checking
#[derive(Debug, Clone)]
pub enum ResourceType {
    Queues,
    Messages,
    Workers,
    MessageSize,
    RequestsPerSecond,
}

/// Tenant context for operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantContext {
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub api_key_id: Option<String>,
    pub request_id: String,
}

impl TenantContext {
    pub fn new(tenant_id: String) -> Self {
        Self {
            tenant_id,
            user_id: None,
            api_key_id: None,
            request_id: Uuid::new_v4().to_string(),
        }
    }

    pub fn with_user(mut self, user_id: String) -> Self {
        self.user_id = Some(user_id);
        self
    }

    pub fn with_api_key(mut self, api_key_id: String) -> Self {
        self.api_key_id = Some(api_key_id);
        self
    }
}

/// Request to create a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTenantRequest {
    pub name: String,
    pub display_name: String,
    pub tier: TenantTier,
    pub settings: Option<TenantSettings>,
}

/// Request to update a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTenantRequest {
    pub display_name: Option<String>,
    pub tier: Option<TenantTier>,
    pub status: Option<TenantStatus>,
    pub settings: Option<TenantSettings>,
}
