//! Compliance and Data Governance
//!
//! Provides compliance features including audit logging, data retention,
//! PII handling, and regulatory compliance support.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Compliance manager for data governance
pub struct ComplianceManager {
    config: ComplianceConfig,
    audit_logger: Arc<AuditLogger>,
    data_classifier: Arc<DataClassifier>,
    retention_manager: Arc<RetentionManager>,
    pii_detector: Arc<PiiDetector>,
}

impl ComplianceManager {
    pub fn new(config: ComplianceConfig) -> Self {
        Self {
            config: config.clone(),
            audit_logger: Arc::new(AuditLogger::new(config.audit.clone())),
            data_classifier: Arc::new(DataClassifier::new(config.classification.clone())),
            retention_manager: Arc::new(RetentionManager::new(config.retention.clone())),
            pii_detector: Arc::new(PiiDetector::new(config.pii.clone())),
        }
    }

    pub async fn initialize(&self) -> Result<(), super::EnterpriseError> {
        self.audit_logger.initialize().await?;
        self.retention_manager.start_cleanup_job().await?;
        Ok(())
    }

    /// Log an audit event
    pub async fn audit(&self, event: AuditEvent) {
        if self.config.audit.enabled {
            self.audit_logger.log(event).await;
        }
    }

    /// Classify data sensitivity
    pub async fn classify(&self, data: &serde_json::Value) -> DataClassification {
        self.data_classifier.classify(data).await
    }

    /// Check if data contains PII
    pub async fn check_pii(&self, data: &str) -> PiiCheckResult {
        self.pii_detector.detect(data).await
    }

    /// Mask PII in data
    pub async fn mask_pii(&self, data: &str) -> String {
        self.pii_detector.mask(data).await
    }

    /// Check retention policy compliance
    pub async fn check_retention(&self, resource_type: &str, created_at: chrono::DateTime<chrono::Utc>) -> RetentionStatus {
        self.retention_manager.check(resource_type, created_at).await
    }

    /// Get audit logger reference
    pub fn audit_logger(&self) -> Arc<AuditLogger> {
        self.audit_logger.clone()
    }

    /// Get data classifier reference
    pub fn data_classifier(&self) -> Arc<DataClassifier> {
        self.data_classifier.clone()
    }

    /// Check if action is compliant
    pub async fn is_compliant(&self, action: &ComplianceCheck) -> ComplianceResult {
        let mut violations = Vec::new();

        // Check data classification restrictions
        if let Some(ref data) = action.data {
            let classification = self.classify(data).await;
            if classification.level > action.max_allowed_classification {
                violations.push(ComplianceViolation {
                    rule: "DATA_CLASSIFICATION".to_string(),
                    message: format!(
                        "Data classification {:?} exceeds maximum allowed {:?}",
                        classification.level, action.max_allowed_classification
                    ),
                    severity: ViolationSeverity::High,
                });
            }
        }

        // Check PII restrictions
        if let Some(ref text) = action.text_content {
            let pii_result = self.check_pii(text).await;
            if pii_result.contains_pii && !action.allow_pii {
                violations.push(ComplianceViolation {
                    rule: "PII_DETECTED".to_string(),
                    message: format!(
                        "PII detected: {:?}",
                        pii_result.detected_types
                    ),
                    severity: ViolationSeverity::High,
                });
            }
        }

        // Check geo restrictions
        if let Some(ref geo) = action.geo_location {
            if !self.config.allowed_regions.is_empty()
                && !self.config.allowed_regions.contains(geo)
            {
                violations.push(ComplianceViolation {
                    rule: "GEO_RESTRICTION".to_string(),
                    message: format!("Region '{}' is not allowed", geo),
                    severity: ViolationSeverity::Medium,
                });
            }
        }

        ComplianceResult {
            compliant: violations.is_empty(),
            violations,
            checked_at: chrono::Utc::now(),
        }
    }

    /// Generate compliance report
    pub async fn generate_report(&self, period: ReportPeriod) -> ComplianceReport {
        let audit_summary = self.audit_logger.get_summary(period.clone()).await;
        let retention_summary = self.retention_manager.get_summary().await;

        ComplianceReport {
            period,
            generated_at: chrono::Utc::now(),
            audit_summary,
            retention_summary,
            pii_summary: PiiSummary {
                total_scans: 0,
                pii_detected: 0,
                pii_masked: 0,
            },
            classification_summary: ClassificationSummary {
                public: 0,
                internal: 0,
                confidential: 0,
                restricted: 0,
            },
        }
    }
}

/// Audit logger for compliance
pub struct AuditLogger {
    config: AuditConfig,
    events: Arc<RwLock<Vec<AuditEvent>>>,
}

impl AuditLogger {
    pub fn new(config: AuditConfig) -> Self {
        Self {
            config,
            events: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn initialize(&self) -> Result<(), super::EnterpriseError> {
        Ok(())
    }

    pub async fn log(&self, event: AuditEvent) {
        if self.should_log(&event) {
            let mut events = self.events.write().await;
            events.push(event.clone());

            // Also log to tracing if configured
            if self.config.log_to_stdout {
                tracing::info!(
                    audit_event = true,
                    event_type = %event.event_type,
                    actor = %event.actor,
                    resource = %event.resource_type,
                    resource_id = %event.resource_id,
                    "Audit event"
                );
            }
        }
    }

    fn should_log(&self, event: &AuditEvent) -> bool {
        // Check event type filters
        if !self.config.event_types.is_empty()
            && !self.config.event_types.contains(&event.event_type)
        {
            return false;
        }

        // Check minimum severity
        event.severity >= self.config.min_severity
    }

    pub async fn query(&self, filter: AuditFilter) -> Vec<AuditEvent> {
        let events = self.events.read().await;

        events
            .iter()
            .filter(|e| {
                // Apply filters
                if let Some(ref event_type) = filter.event_type {
                    if &e.event_type != event_type {
                        return false;
                    }
                }
                if let Some(ref actor) = filter.actor {
                    if &e.actor != actor {
                        return false;
                    }
                }
                if let Some(ref resource_type) = filter.resource_type {
                    if &e.resource_type != resource_type {
                        return false;
                    }
                }
                if let Some(start) = filter.start_time {
                    if e.timestamp < start {
                        return false;
                    }
                }
                if let Some(end) = filter.end_time {
                    if e.timestamp > end {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect()
    }

    pub async fn get_summary(&self, period: ReportPeriod) -> AuditSummary {
        let events = self.events.read().await;
        let (start, end) = period.to_range();

        let filtered: Vec<_> = events
            .iter()
            .filter(|e| e.timestamp >= start && e.timestamp <= end)
            .collect();

        let mut by_type: HashMap<String, u64> = HashMap::new();
        let mut by_actor: HashMap<String, u64> = HashMap::new();

        for event in &filtered {
            *by_type.entry(event.event_type.clone()).or_insert(0) += 1;
            *by_actor.entry(event.actor.clone()).or_insert(0) += 1;
        }

        AuditSummary {
            total_events: filtered.len() as u64,
            events_by_type: by_type,
            events_by_actor: by_actor,
            period_start: start,
            period_end: end,
        }
    }
}

/// Data classifier for sensitivity levels
pub struct DataClassifier {
    config: ClassificationConfig,
    rules: Vec<ClassificationRule>,
}

impl DataClassifier {
    pub fn new(config: ClassificationConfig) -> Self {
        let rules = Self::default_rules();
        Self { config, rules }
    }

    fn default_rules() -> Vec<ClassificationRule> {
        vec![
            ClassificationRule {
                name: "credit_card".to_string(),
                pattern: r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b".to_string(),
                classification: ClassificationLevel::Restricted,
            },
            ClassificationRule {
                name: "ssn".to_string(),
                pattern: r"\b\d{3}-\d{2}-\d{4}\b".to_string(),
                classification: ClassificationLevel::Restricted,
            },
            ClassificationRule {
                name: "email".to_string(),
                pattern: r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b".to_string(),
                classification: ClassificationLevel::Confidential,
            },
            ClassificationRule {
                name: "api_key".to_string(),
                pattern: r#"(?i)(api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*['"]?[\w-]+['"]?"#.to_string(),
                classification: ClassificationLevel::Restricted,
            },
        ]
    }

    pub async fn classify(&self, data: &serde_json::Value) -> DataClassification {
        let text = serde_json::to_string(data).unwrap_or_default();
        let mut highest_level = ClassificationLevel::Public;
        let mut matched_rules = Vec::new();

        for rule in &self.rules {
            if let Ok(regex) = regex::Regex::new(&rule.pattern) {
                if regex.is_match(&text) {
                    matched_rules.push(rule.name.clone());
                    if rule.classification > highest_level {
                        highest_level = rule.classification.clone();
                    }
                }
            }
        }

        DataClassification {
            level: highest_level,
            matched_rules,
            classified_at: chrono::Utc::now(),
        }
    }
}

/// PII detector
pub struct PiiDetector {
    config: PiiConfig,
    patterns: HashMap<PiiType, regex::Regex>,
}

impl PiiDetector {
    pub fn new(config: PiiConfig) -> Self {
        let mut patterns = HashMap::new();

        // Add default PII patterns
        if let Ok(re) = regex::Regex::new(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b") {
            patterns.insert(PiiType::Email, re);
        }
        if let Ok(re) = regex::Regex::new(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b") {
            patterns.insert(PiiType::Phone, re);
        }
        if let Ok(re) = regex::Regex::new(r"\b\d{3}-\d{2}-\d{4}\b") {
            patterns.insert(PiiType::Ssn, re);
        }
        if let Ok(re) = regex::Regex::new(r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b") {
            patterns.insert(PiiType::CreditCard, re);
        }
        if let Ok(re) = regex::Regex::new(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b") {
            patterns.insert(PiiType::IpAddress, re);
        }

        Self { config, patterns }
    }

    pub async fn detect(&self, text: &str) -> PiiCheckResult {
        let mut detected = HashSet::new();
        let mut locations = Vec::new();

        for (pii_type, regex) in &self.patterns {
            for m in regex.find_iter(text) {
                detected.insert(pii_type.clone());
                locations.push(PiiLocation {
                    pii_type: pii_type.clone(),
                    start: m.start(),
                    end: m.end(),
                });
            }
        }

        PiiCheckResult {
            contains_pii: !detected.is_empty(),
            detected_types: detected.into_iter().collect(),
            locations,
        }
    }

    pub async fn mask(&self, text: &str) -> String {
        let mut result = text.to_string();

        for (pii_type, regex) in &self.patterns {
            let mask = self.get_mask(pii_type);
            result = regex.replace_all(&result, mask.as_str()).to_string();
        }

        result
    }

    fn get_mask(&self, pii_type: &PiiType) -> String {
        match pii_type {
            PiiType::Email => "[EMAIL REDACTED]".to_string(),
            PiiType::Phone => "[PHONE REDACTED]".to_string(),
            PiiType::Ssn => "[SSN REDACTED]".to_string(),
            PiiType::CreditCard => "[CARD REDACTED]".to_string(),
            PiiType::IpAddress => "[IP REDACTED]".to_string(),
            PiiType::Name => "[NAME REDACTED]".to_string(),
            PiiType::Address => "[ADDRESS REDACTED]".to_string(),
            PiiType::DateOfBirth => "[DOB REDACTED]".to_string(),
        }
    }
}

/// Retention manager for data lifecycle
pub struct RetentionManager {
    config: RetentionConfig,
    policies: Arc<RwLock<HashMap<String, RetentionPolicy>>>,
}

impl RetentionManager {
    pub fn new(config: RetentionConfig) -> Self {
        Self {
            config,
            policies: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn start_cleanup_job(&self) -> Result<(), super::EnterpriseError> {
        // Start background job for retention cleanup
        Ok(())
    }

    pub async fn add_policy(&self, policy: RetentionPolicy) {
        let mut policies = self.policies.write().await;
        policies.insert(policy.resource_type.clone(), policy);
    }

    pub async fn check(
        &self,
        resource_type: &str,
        created_at: chrono::DateTime<chrono::Utc>,
    ) -> RetentionStatus {
        let policies = self.policies.read().await;

        if let Some(policy) = policies.get(resource_type) {
            let age = chrono::Utc::now().signed_duration_since(created_at);
            let retention_duration = chrono::Duration::days(policy.retention_days as i64);

            if age > retention_duration {
                RetentionStatus::Expired {
                    expired_at: created_at + retention_duration,
                }
            } else {
                RetentionStatus::Valid {
                    expires_at: created_at + retention_duration,
                }
            }
        } else {
            // No policy defined, use default
            RetentionStatus::NoPolicyDefined
        }
    }

    pub async fn get_summary(&self) -> RetentionSummary {
        let policies = self.policies.read().await;
        RetentionSummary {
            total_policies: policies.len(),
            policies: policies.values().cloned().collect(),
        }
    }
}

/// Compliance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceConfig {
    pub audit: AuditConfig,
    pub classification: ClassificationConfig,
    pub retention: RetentionConfig,
    pub pii: PiiConfig,
    pub allowed_regions: Vec<String>,
    pub compliance_frameworks: Vec<ComplianceFramework>,
}

impl Default for ComplianceConfig {
    fn default() -> Self {
        Self {
            audit: AuditConfig::default(),
            classification: ClassificationConfig::default(),
            retention: RetentionConfig::default(),
            pii: PiiConfig::default(),
            allowed_regions: Vec::new(),
            compliance_frameworks: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditConfig {
    pub enabled: bool,
    pub log_to_stdout: bool,
    pub log_to_file: bool,
    pub file_path: Option<String>,
    pub event_types: Vec<String>,
    pub min_severity: AuditSeverity,
    pub retention_days: u32,
}

impl Default for AuditConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            log_to_stdout: true,
            log_to_file: false,
            file_path: None,
            event_types: Vec::new(),
            min_severity: AuditSeverity::Info,
            retention_days: 90,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassificationConfig {
    pub enabled: bool,
    pub default_level: ClassificationLevel,
    pub auto_classify: bool,
}

impl Default for ClassificationConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            default_level: ClassificationLevel::Internal,
            auto_classify: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionConfig {
    pub enabled: bool,
    pub default_retention_days: u32,
    pub cleanup_schedule: String,
}

impl Default for RetentionConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            default_retention_days: 90,
            cleanup_schedule: "0 0 * * *".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PiiConfig {
    pub enabled: bool,
    pub auto_mask: bool,
    pub detect_types: Vec<PiiType>,
}

impl Default for PiiConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            auto_mask: false,
            detect_types: vec![
                PiiType::Email,
                PiiType::Phone,
                PiiType::Ssn,
                PiiType::CreditCard,
            ],
        }
    }
}

/// Audit event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub event_type: String,
    pub actor: String,
    pub actor_type: ActorType,
    pub resource_type: String,
    pub resource_id: String,
    pub action: String,
    pub outcome: AuditOutcome,
    pub severity: AuditSeverity,
    pub details: serde_json::Value,
    pub metadata: HashMap<String, String>,
}

impl AuditEvent {
    pub fn new(
        event_type: &str,
        actor: &str,
        resource_type: &str,
        resource_id: &str,
        action: &str,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now(),
            event_type: event_type.to_string(),
            actor: actor.to_string(),
            actor_type: ActorType::User,
            resource_type: resource_type.to_string(),
            resource_id: resource_id.to_string(),
            action: action.to_string(),
            outcome: AuditOutcome::Success,
            severity: AuditSeverity::Info,
            details: serde_json::Value::Null,
            metadata: HashMap::new(),
        }
    }

    pub fn with_outcome(mut self, outcome: AuditOutcome) -> Self {
        self.outcome = outcome;
        self
    }

    pub fn with_severity(mut self, severity: AuditSeverity) -> Self {
        self.severity = severity;
        self
    }

    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = details;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActorType {
    User,
    System,
    Api,
    Service,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditOutcome {
    Success,
    Failure,
    Denied,
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub enum AuditSeverity {
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3,
    Critical = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditFilter {
    pub event_type: Option<String>,
    pub actor: Option<String>,
    pub resource_type: Option<String>,
    pub start_time: Option<chrono::DateTime<chrono::Utc>>,
    pub end_time: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditSummary {
    pub total_events: u64,
    pub events_by_type: HashMap<String, u64>,
    pub events_by_actor: HashMap<String, u64>,
    pub period_start: chrono::DateTime<chrono::Utc>,
    pub period_end: chrono::DateTime<chrono::Utc>,
}

/// Data classification
#[derive(Debug, Clone, PartialEq, PartialOrd, Serialize, Deserialize)]
pub enum ClassificationLevel {
    Public = 0,
    Internal = 1,
    Confidential = 2,
    Restricted = 3,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataClassification {
    pub level: ClassificationLevel,
    pub matched_rules: Vec<String>,
    pub classified_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassificationRule {
    pub name: String,
    pub pattern: String,
    pub classification: ClassificationLevel,
}

/// PII types
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PiiType {
    Email,
    Phone,
    Ssn,
    CreditCard,
    IpAddress,
    Name,
    Address,
    DateOfBirth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PiiCheckResult {
    pub contains_pii: bool,
    pub detected_types: Vec<PiiType>,
    pub locations: Vec<PiiLocation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PiiLocation {
    pub pii_type: PiiType,
    pub start: usize,
    pub end: usize,
}

/// Retention policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionPolicy {
    pub resource_type: String,
    pub retention_days: u32,
    pub action: RetentionAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RetentionAction {
    Delete,
    Archive,
    Anonymize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RetentionStatus {
    Valid {
        expires_at: chrono::DateTime<chrono::Utc>,
    },
    Expired {
        expired_at: chrono::DateTime<chrono::Utc>,
    },
    NoPolicyDefined,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionSummary {
    pub total_policies: usize,
    pub policies: Vec<RetentionPolicy>,
}

/// Compliance check request
#[derive(Debug, Clone)]
pub struct ComplianceCheck {
    pub data: Option<serde_json::Value>,
    pub text_content: Option<String>,
    pub max_allowed_classification: ClassificationLevel,
    pub allow_pii: bool,
    pub geo_location: Option<String>,
}

/// Compliance check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceResult {
    pub compliant: bool,
    pub violations: Vec<ComplianceViolation>,
    pub checked_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceViolation {
    pub rule: String,
    pub message: String,
    pub severity: ViolationSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Supported compliance frameworks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceFramework {
    Gdpr,
    Hipaa,
    Pci,
    Sox,
    Ccpa,
    Custom(String),
}

/// Report period
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportPeriod {
    LastHour,
    Last24Hours,
    Last7Days,
    Last30Days,
    Custom {
        start: chrono::DateTime<chrono::Utc>,
        end: chrono::DateTime<chrono::Utc>,
    },
}

impl ReportPeriod {
    pub fn to_range(&self) -> (chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>) {
        let now = chrono::Utc::now();
        match self {
            ReportPeriod::LastHour => (now - chrono::Duration::hours(1), now),
            ReportPeriod::Last24Hours => (now - chrono::Duration::hours(24), now),
            ReportPeriod::Last7Days => (now - chrono::Duration::days(7), now),
            ReportPeriod::Last30Days => (now - chrono::Duration::days(30), now),
            ReportPeriod::Custom { start, end } => (*start, *end),
        }
    }
}

/// Compliance report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub period: ReportPeriod,
    pub generated_at: chrono::DateTime<chrono::Utc>,
    pub audit_summary: AuditSummary,
    pub retention_summary: RetentionSummary,
    pub pii_summary: PiiSummary,
    pub classification_summary: ClassificationSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PiiSummary {
    pub total_scans: u64,
    pub pii_detected: u64,
    pub pii_masked: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassificationSummary {
    pub public: u64,
    pub internal: u64,
    pub confidential: u64,
    pub restricted: u64,
}
