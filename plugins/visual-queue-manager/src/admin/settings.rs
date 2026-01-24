//! Settings Management for Queue Manager Plugin
//!
//! Provides configuration management through the RustPress admin panel.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Plugin settings manager
pub struct SettingsManager {
    settings: Arc<RwLock<PluginSettings>>,
    validators: HashMap<String, Box<dyn SettingValidator + Send + Sync>>,
}

impl SettingsManager {
    pub fn new() -> Self {
        Self {
            settings: Arc::new(RwLock::new(PluginSettings::default())),
            validators: Self::create_validators(),
        }
    }

    fn create_validators() -> HashMap<String, Box<dyn SettingValidator + Send + Sync>> {
        let mut validators: HashMap<String, Box<dyn SettingValidator + Send + Sync>> =
            HashMap::new();

        validators.insert(
            "general.max_queues".to_string(),
            Box::new(RangeValidator::new(1, 10000)),
        );
        validators.insert(
            "general.max_message_size".to_string(),
            Box::new(RangeValidator::new(1024, 10 * 1024 * 1024)),
        );
        validators.insert(
            "performance.worker_concurrency".to_string(),
            Box::new(RangeValidator::new(1, 1000)),
        );

        validators
    }

    pub async fn register_pages(&self) -> Result<(), super::AdminError> {
        // Register settings pages with RustPress admin
        Ok(())
    }

    pub async fn get(&self) -> PluginSettings {
        self.settings.read().await.clone()
    }

    pub async fn update(&self, updates: SettingsUpdate) -> Result<PluginSettings, SettingsError> {
        let mut settings = self.settings.write().await;

        // Apply updates with validation
        if let Some(general) = updates.general {
            self.validate_section("general", &general)?;
            settings.general = general;
        }

        if let Some(performance) = updates.performance {
            self.validate_section("performance", &performance)?;
            settings.performance = performance;
        }

        if let Some(retention) = updates.retention {
            self.validate_section("retention", &retention)?;
            settings.retention = retention;
        }

        if let Some(notifications) = updates.notifications {
            settings.notifications = notifications;
        }

        if let Some(enterprise) = updates.enterprise {
            settings.enterprise = enterprise;
        }

        Ok(settings.clone())
    }

    fn validate_section<T: Serialize>(&self, prefix: &str, value: &T) -> Result<(), SettingsError> {
        // Serialize to check fields
        let json =
            serde_json::to_value(value).map_err(|e| SettingsError::Validation(e.to_string()))?;

        if let Some(obj) = json.as_object() {
            for (key, val) in obj {
                let full_key = format!("{}.{}", prefix, key);
                if let Some(validator) = self.validators.get(&full_key) {
                    validator.validate(val)?;
                }
            }
        }

        Ok(())
    }

    pub async fn reset_to_defaults(&self) {
        let mut settings = self.settings.write().await;
        *settings = PluginSettings::default();
    }

    pub async fn export(&self) -> String {
        let settings = self.settings.read().await;
        serde_json::to_string_pretty(&*settings).unwrap_or_default()
    }

    pub async fn import(&self, json: &str) -> Result<(), SettingsError> {
        let new_settings: PluginSettings =
            serde_json::from_str(json).map_err(|e| SettingsError::Parse(e.to_string()))?;

        let mut settings = self.settings.write().await;
        *settings = new_settings;

        Ok(())
    }
}

/// Complete plugin settings structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginSettings {
    pub general: GeneralSettings,
    pub performance: PerformanceSettings,
    pub retention: RetentionSettings,
    pub notifications: NotificationSettings,
    pub enterprise: EnterpriseSettings,
}

impl Default for PluginSettings {
    fn default() -> Self {
        Self {
            general: GeneralSettings::default(),
            performance: PerformanceSettings::default(),
            retention: RetentionSettings::default(),
            notifications: NotificationSettings::default(),
            enterprise: EnterpriseSettings::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralSettings {
    pub enabled: bool,
    pub max_queues: u32,
    pub max_message_size: usize,
    pub default_visibility_timeout: u32,
    pub enable_deduplication: bool,
    pub deduplication_window: u32,
    pub enable_dlq: bool,
    pub max_receive_count: u32,
}

impl Default for GeneralSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            max_queues: 1000,
            max_message_size: 256 * 1024, // 256KB
            default_visibility_timeout: 30,
            enable_deduplication: true,
            deduplication_window: 300,
            enable_dlq: true,
            max_receive_count: 3,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSettings {
    pub worker_concurrency: u32,
    pub batch_size: u32,
    pub polling_interval_ms: u32,
    pub long_polling_timeout_ms: u32,
    pub enable_compression: bool,
    pub compression_threshold: usize,
    pub connection_pool_size: u32,
    pub enable_metrics: bool,
    pub metrics_interval_seconds: u32,
}

impl Default for PerformanceSettings {
    fn default() -> Self {
        Self {
            worker_concurrency: 10,
            batch_size: 10,
            polling_interval_ms: 100,
            long_polling_timeout_ms: 20000,
            enable_compression: true,
            compression_threshold: 1024,
            connection_pool_size: 10,
            enable_metrics: true,
            metrics_interval_seconds: 60,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionSettings {
    pub message_retention_days: u32,
    pub dlq_retention_days: u32,
    pub completed_message_retention_hours: u32,
    pub audit_log_retention_days: u32,
    pub metrics_retention_days: u32,
    pub enable_auto_cleanup: bool,
    pub cleanup_schedule: String,
}

impl Default for RetentionSettings {
    fn default() -> Self {
        Self {
            message_retention_days: 14,
            dlq_retention_days: 30,
            completed_message_retention_hours: 24,
            audit_log_retention_days: 90,
            metrics_retention_days: 30,
            enable_auto_cleanup: true,
            cleanup_schedule: "0 0 * * *".to_string(), // Daily at midnight
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
    pub enable_email: bool,
    pub email_recipients: Vec<String>,
    pub enable_slack: bool,
    pub slack_webhook_url: Option<String>,
    pub enable_pagerduty: bool,
    pub pagerduty_routing_key: Option<String>,
    pub alert_thresholds: AlertThresholds,
}

impl Default for NotificationSettings {
    fn default() -> Self {
        Self {
            enable_email: false,
            email_recipients: Vec::new(),
            enable_slack: false,
            slack_webhook_url: None,
            enable_pagerduty: false,
            pagerduty_routing_key: None,
            alert_thresholds: AlertThresholds::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    pub queue_depth_warning: u64,
    pub queue_depth_critical: u64,
    pub dlq_depth_warning: u64,
    pub dlq_depth_critical: u64,
    pub error_rate_warning: f64,
    pub error_rate_critical: f64,
    pub latency_warning_ms: u64,
    pub latency_critical_ms: u64,
}

impl Default for AlertThresholds {
    fn default() -> Self {
        Self {
            queue_depth_warning: 10000,
            queue_depth_critical: 50000,
            dlq_depth_warning: 100,
            dlq_depth_critical: 1000,
            error_rate_warning: 0.01,  // 1%
            error_rate_critical: 0.05, // 5%
            latency_warning_ms: 1000,
            latency_critical_ms: 5000,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnterpriseSettings {
    pub enable_multi_tenancy: bool,
    pub enable_rbac: bool,
    pub enable_encryption_at_rest: bool,
    pub encryption_key_id: Option<String>,
    pub enable_audit_logging: bool,
    pub enable_data_masking: bool,
    pub masked_fields: Vec<String>,
    pub rate_limiting: RateLimitSettings,
}

impl Default for EnterpriseSettings {
    fn default() -> Self {
        Self {
            enable_multi_tenancy: false,
            enable_rbac: true,
            enable_encryption_at_rest: false,
            encryption_key_id: None,
            enable_audit_logging: true,
            enable_data_masking: false,
            masked_fields: Vec::new(),
            rate_limiting: RateLimitSettings::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitSettings {
    pub enabled: bool,
    pub requests_per_second: u32,
    pub burst_size: u32,
    pub per_queue_limits: bool,
    pub per_tenant_limits: bool,
}

impl Default for RateLimitSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            requests_per_second: 1000,
            burst_size: 100,
            per_queue_limits: true,
            per_tenant_limits: true,
        }
    }
}

/// Partial settings update
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingsUpdate {
    pub general: Option<GeneralSettings>,
    pub performance: Option<PerformanceSettings>,
    pub retention: Option<RetentionSettings>,
    pub notifications: Option<NotificationSettings>,
    pub enterprise: Option<EnterpriseSettings>,
}

/// Setting validation trait
pub trait SettingValidator {
    fn validate(&self, value: &serde_json::Value) -> Result<(), SettingsError>;
}

/// Range validator for numeric settings
pub struct RangeValidator {
    min: i64,
    max: i64,
}

impl RangeValidator {
    pub fn new(min: i64, max: i64) -> Self {
        Self { min, max }
    }
}

impl SettingValidator for RangeValidator {
    fn validate(&self, value: &serde_json::Value) -> Result<(), SettingsError> {
        if let Some(num) = value.as_i64() {
            if num < self.min || num > self.max {
                return Err(SettingsError::Validation(format!(
                    "Value {} is out of range [{}, {}]",
                    num, self.min, self.max
                )));
            }
        }
        Ok(())
    }
}

/// Settings errors
#[derive(Debug, thiserror::Error)]
pub enum SettingsError {
    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Storage error: {0}")]
    Storage(String),
}
