//! Enterprise Features
//!
//! Advanced features for enterprise deployments including multi-tenancy,
//! encryption, rate limiting, and compliance features.

mod multi_tenancy;
mod encryption;
mod rate_limiter;
mod compliance;

pub use multi_tenancy::*;
pub use encryption::*;
pub use rate_limiter::*;
pub use compliance::*;

use std::sync::Arc;

/// Enterprise features manager
#[derive(Clone)]
pub struct EnterpriseManager {
    pub tenancy: Arc<TenancyManager>,
    pub encryption: Arc<EncryptionService>,
    pub rate_limiter: Arc<RateLimiter>,
    pub compliance: Arc<ComplianceManager>,
}

impl EnterpriseManager {
    pub fn new(config: EnterpriseConfig) -> Self {
        Self {
            tenancy: Arc::new(TenancyManager::new(config.tenancy)),
            encryption: Arc::new(EncryptionService::new(config.encryption)),
            rate_limiter: Arc::new(RateLimiter::new(config.rate_limiting)),
            compliance: Arc::new(ComplianceManager::new(config.compliance)),
        }
    }

    pub async fn initialize(&self) -> Result<(), EnterpriseError> {
        self.tenancy.initialize().await?;
        self.encryption.initialize().await?;
        self.rate_limiter.initialize().await?;
        self.compliance.initialize().await?;
        Ok(())
    }
}

/// Enterprise configuration
#[derive(Debug, Clone, serde::Deserialize)]
pub struct EnterpriseConfig {
    pub tenancy: TenancyConfig,
    pub encryption: EncryptionConfig,
    pub rate_limiting: RateLimitConfig,
    pub compliance: ComplianceConfig,
}

impl Default for EnterpriseConfig {
    fn default() -> Self {
        Self {
            tenancy: TenancyConfig::default(),
            encryption: EncryptionConfig::default(),
            rate_limiting: RateLimitConfig::default(),
            compliance: ComplianceConfig::default(),
        }
    }
}

/// Enterprise errors
#[derive(Debug, thiserror::Error)]
pub enum EnterpriseError {
    #[error("Tenancy error: {0}")]
    Tenancy(String),

    #[error("Encryption error: {0}")]
    Encryption(String),

    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    #[error("Compliance error: {0}")]
    Compliance(String),

    #[error("License error: {0}")]
    License(String),
}
