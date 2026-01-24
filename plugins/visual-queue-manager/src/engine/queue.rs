//! Queue Management Module
//!
//! Handles queue creation, configuration, and operations.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::storage::StorageBackend;
use super::{EngineError, EngineEvent};

/// Queue state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum QueueState {
    Active,
    Paused,
    Draining,
    Disabled,
}

impl From<String> for QueueState {
    fn from(s: String) -> Self {
        match s.as_str() {
            "active" => QueueState::Active,
            "paused" => QueueState::Paused,
            "draining" => QueueState::Draining,
            "disabled" => QueueState::Disabled,
            _ => QueueState::Active,
        }
    }
}

impl ToString for QueueState {
    fn to_string(&self) -> String {
        match self {
            QueueState::Active => "active".to_string(),
            QueueState::Paused => "paused".to_string(),
            QueueState::Draining => "draining".to_string(),
            QueueState::Disabled => "disabled".to_string(),
        }
    }
}

/// Queue configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueConfig {
    /// Queue name
    pub name: String,
    /// Queue description
    pub description: Option<String>,
    /// Maximum message size in bytes
    pub max_message_size: u64,
    /// Maximum messages in queue
    pub max_queue_size: u64,
    /// Default message TTL in seconds
    pub default_ttl_secs: u64,
    /// Default visibility timeout in seconds
    pub visibility_timeout_secs: u64,
    /// Enable dead letter queue
    pub enable_dlq: bool,
    /// DLQ queue ID (if separate)
    pub dlq_queue_id: Option<Uuid>,
    /// Max retries before DLQ
    pub max_retries: u32,
    /// Enable priority ordering
    pub enable_priority: bool,
    /// Enable FIFO ordering
    pub fifo_enabled: bool,
    /// Content-based deduplication
    pub content_based_deduplication: bool,
    /// Deduplication window in seconds
    pub deduplication_window_secs: u64,
    /// Rate limit (messages per second)
    pub rate_limit: Option<f64>,
    /// Batch processing size
    pub batch_size: u32,
    /// Custom metadata
    pub metadata: serde_json::Value,
}

impl Default for QueueConfig {
    fn default() -> Self {
        Self {
            name: String::new(),
            description: None,
            max_message_size: 256 * 1024, // 256 KB
            max_queue_size: 1_000_000,
            default_ttl_secs: 86400 * 14, // 14 days
            visibility_timeout_secs: 300, // 5 minutes
            enable_dlq: true,
            dlq_queue_id: None,
            max_retries: 3,
            enable_priority: true,
            fifo_enabled: false,
            content_based_deduplication: false,
            deduplication_window_secs: 300,
            rate_limit: None,
            batch_size: 10,
            metadata: serde_json::json!({}),
        }
    }
}

/// Queue information
#[derive(Debug, Clone, Serialize)]
pub struct QueueInfo {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub state: QueueState,
    pub config: QueueConfig,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Database row for queue
#[derive(Debug, FromRow)]
struct QueueRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    status: String,
    max_retries: Option<i32>,
    #[allow(dead_code)]
    retry_delay_ms: Option<i64>,
    visibility_timeout_secs: Option<i32>,
    message_ttl_secs: Option<i64>,
    max_message_size_bytes: Option<i64>,
    max_queue_size: Option<i64>,
    priority_enabled: Option<bool>,
    fifo_enabled: Option<bool>,
    content_based_deduplication: Option<bool>,
    deduplication_window_secs: Option<i32>,
    rate_limit_per_second: Option<f64>,
    dlq_queue_id: Option<Uuid>,
    metadata: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl QueueRow {
    fn into_queue_info(self) -> QueueInfo {
        let config = QueueConfig {
            name: self.name.clone(),
            description: self.description.clone(),
            max_message_size: self.max_message_size_bytes.unwrap_or(262144) as u64,
            max_queue_size: self.max_queue_size.unwrap_or(1_000_000) as u64,
            default_ttl_secs: self.message_ttl_secs.unwrap_or(1209600) as u64,
            visibility_timeout_secs: self.visibility_timeout_secs.unwrap_or(300) as u64,
            enable_dlq: self.dlq_queue_id.is_some(),
            dlq_queue_id: self.dlq_queue_id,
            max_retries: self.max_retries.unwrap_or(3) as u32,
            enable_priority: self.priority_enabled.unwrap_or(true),
            fifo_enabled: self.fifo_enabled.unwrap_or(false),
            content_based_deduplication: self.content_based_deduplication.unwrap_or(false),
            deduplication_window_secs: self.deduplication_window_secs.unwrap_or(300) as u64,
            rate_limit: self.rate_limit_per_second,
            batch_size: 10,
            metadata: self.metadata.unwrap_or(serde_json::json!({})),
        };

        QueueInfo {
            id: self.id,
            name: self.name,
            description: self.description,
            state: QueueState::from(self.status),
            config,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

/// Queue statistics
#[derive(Debug, Clone, Serialize)]
pub struct QueueStats {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub state: QueueState,
    pub total_messages: u64,
    pub pending_messages: u64,
    pub processing_messages: u64,
    pub completed_messages: u64,
    pub failed_messages: u64,
    pub dlq_messages: u64,
    pub messages_per_minute: f64,
    pub avg_processing_time_ms: f64,
    pub oldest_message_age_secs: Option<u64>,
    pub approximate_age_of_oldest_message: Option<DateTime<Utc>>,
}

/// Aggregated queue statistics
#[derive(Debug, Clone, Serialize)]
pub struct AggregatedQueueStats {
    pub total_queues: u64,
    pub active_queues: u64,
    pub total_messages: u64,
    pub pending_messages: u64,
    pub processing_messages: u64,
}

/// Queue manager for handling queue operations
pub struct QueueManager {
    pool: PgPool,
    storage: Arc<dyn StorageBackend>,
    event_tx: broadcast::Sender<EngineEvent>,
    /// In-memory cache of queue configs
    cache: RwLock<HashMap<Uuid, QueueInfo>>,
}

impl QueueManager {
    /// Create a new queue manager
    pub fn new(
        pool: PgPool,
        storage: Arc<dyn StorageBackend>,
        event_tx: broadcast::Sender<EngineEvent>,
    ) -> Self {
        Self {
            pool,
            storage,
            event_tx,
            cache: RwLock::new(HashMap::new()),
        }
    }

    /// Create a new queue
    pub async fn create_queue(&self, config: QueueConfig) -> Result<QueueInfo, EngineError> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        // Validate configuration
        self.validate_config(&config)?;

        // Check for duplicate name
        let existing: Option<Uuid> =
            sqlx::query_scalar("SELECT id FROM vqm_queues WHERE name = $1")
                .bind(&config.name)
                .fetch_optional(&self.pool)
                .await?;

        if existing.is_some() {
            return Err(EngineError::InvalidConfig(format!(
                "Queue with name '{}' already exists",
                config.name
            )));
        }

        // Insert into database
        sqlx::query(
            r#"
            INSERT INTO vqm_queues (
                id, name, description, status, max_retries, retry_delay_ms,
                visibility_timeout_secs, message_ttl_secs, max_message_size_bytes,
                max_queue_size, priority_enabled, fifo_enabled,
                content_based_deduplication, deduplication_window_secs,
                rate_limit_per_second, dlq_queue_id, metadata, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            )
            "#,
        )
        .bind(id)
        .bind(&config.name)
        .bind(&config.description)
        .bind("active")
        .bind(config.max_retries as i32)
        .bind(1000i64) // default retry delay
        .bind(config.visibility_timeout_secs as i32)
        .bind(config.default_ttl_secs as i64)
        .bind(config.max_message_size as i64)
        .bind(config.max_queue_size as i64)
        .bind(config.enable_priority)
        .bind(config.fifo_enabled)
        .bind(config.content_based_deduplication)
        .bind(config.deduplication_window_secs as i32)
        .bind(config.rate_limit)
        .bind(config.dlq_queue_id)
        .bind(&config.metadata)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        let queue_info = QueueInfo {
            id,
            name: config.name.clone(),
            description: config.description.clone(),
            state: QueueState::Active,
            config,
            created_at: now,
            updated_at: now,
        };

        // Update cache
        self.cache.write().await.insert(id, queue_info.clone());

        // Emit event
        let _ = self.event_tx.send(EngineEvent::QueueCreated {
            queue_id: id,
            name: queue_info.name.clone(),
        });

        Ok(queue_info)
    }

    /// Get queue by ID
    pub async fn get_queue(&self, id: Uuid) -> Result<QueueInfo, EngineError> {
        // Check cache first
        if let Some(info) = self.cache.read().await.get(&id) {
            return Ok(info.clone());
        }

        // Fetch from database
        let row: QueueRow = sqlx::query_as(
            r#"
            SELECT id, name, description, status, max_retries, retry_delay_ms,
                   visibility_timeout_secs, message_ttl_secs, max_message_size_bytes,
                   max_queue_size, priority_enabled, fifo_enabled,
                   content_based_deduplication, deduplication_window_secs,
                   rate_limit_per_second, dlq_queue_id, metadata, created_at, updated_at
            FROM vqm_queues WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::QueueNotFound(id))?;

        let info = row.into_queue_info();

        // Update cache
        self.cache.write().await.insert(id, info.clone());

        Ok(info)
    }

    /// Get queue by name
    pub async fn get_queue_by_name(&self, name: &str) -> Result<QueueInfo, EngineError> {
        let id: Uuid = sqlx::query_scalar("SELECT id FROM vqm_queues WHERE name = $1")
            .bind(name)
            .fetch_optional(&self.pool)
            .await?
            .ok_or_else(|| EngineError::InvalidConfig(format!("Queue '{}' not found", name)))?;

        self.get_queue(id).await
    }

    /// Update queue configuration
    pub async fn update_queue(
        &self,
        id: Uuid,
        config: QueueConfig,
    ) -> Result<QueueInfo, EngineError> {
        // Validate configuration
        self.validate_config(&config)?;

        let now = Utc::now();

        sqlx::query(
            r#"
            UPDATE vqm_queues SET
                name = $2,
                description = $3,
                max_retries = $4,
                visibility_timeout_secs = $5,
                message_ttl_secs = $6,
                max_message_size_bytes = $7,
                max_queue_size = $8,
                priority_enabled = $9,
                fifo_enabled = $10,
                content_based_deduplication = $11,
                deduplication_window_secs = $12,
                rate_limit_per_second = $13,
                dlq_queue_id = $14,
                metadata = $15,
                updated_at = $16
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(&config.name)
        .bind(&config.description)
        .bind(config.max_retries as i32)
        .bind(config.visibility_timeout_secs as i32)
        .bind(config.default_ttl_secs as i64)
        .bind(config.max_message_size as i64)
        .bind(config.max_queue_size as i64)
        .bind(config.enable_priority)
        .bind(config.fifo_enabled)
        .bind(config.content_based_deduplication)
        .bind(config.deduplication_window_secs as i32)
        .bind(config.rate_limit)
        .bind(config.dlq_queue_id)
        .bind(&config.metadata)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Invalidate cache
        self.cache.write().await.remove(&id);

        // Fetch updated queue
        self.get_queue(id).await
    }

    /// Delete a queue
    pub async fn delete_queue(&self, id: Uuid) -> Result<(), EngineError> {
        // Check if queue has pending messages
        let pending_count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE queue_id = $1 AND status IN ('pending', 'processing')
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        if pending_count > 0 {
            return Err(EngineError::InvalidConfig(format!(
                "Cannot delete queue with {} pending messages",
                pending_count
            )));
        }

        // Delete the queue
        sqlx::query("DELETE FROM vqm_queues WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        // Remove from cache
        self.cache.write().await.remove(&id);

        Ok(())
    }

    /// Pause a queue
    pub async fn pause_queue(&self, id: Uuid) -> Result<(), EngineError> {
        sqlx::query("UPDATE vqm_queues SET status = 'paused', updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        // Update cache
        if let Some(info) = self.cache.write().await.get_mut(&id) {
            info.state = QueueState::Paused;
            info.updated_at = Utc::now();
        }

        let _ = self
            .event_tx
            .send(EngineEvent::QueuePaused { queue_id: id });

        Ok(())
    }

    /// Resume a queue
    pub async fn resume_queue(&self, id: Uuid) -> Result<(), EngineError> {
        sqlx::query("UPDATE vqm_queues SET status = 'active', updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        // Update cache
        if let Some(info) = self.cache.write().await.get_mut(&id) {
            info.state = QueueState::Active;
            info.updated_at = Utc::now();
        }

        let _ = self
            .event_tx
            .send(EngineEvent::QueueResumed { queue_id: id });

        Ok(())
    }

    /// Purge all messages from a queue
    pub async fn purge_queue(&self, id: Uuid) -> Result<u64, EngineError> {
        let result = sqlx::query("DELETE FROM vqm_messages WHERE queue_id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected())
    }

    /// Get queue statistics
    pub async fn get_queue_stats(&self, id: Uuid) -> Result<QueueStats, EngineError> {
        let queue = self.get_queue(id).await?;

        let stats_row = sqlx::query(
            r#"
            SELECT
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'processing') as processing,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'failed') as failed,
                COUNT(*) FILTER (WHERE status = 'dead_letter') as dlq,
                COUNT(*) as total,
                AVG(EXTRACT(EPOCH FROM (completed_at - processing_started_at)) * 1000)
                    FILTER (WHERE completed_at IS NOT NULL) as avg_processing_ms,
                MIN(created_at) FILTER (WHERE status = 'pending') as oldest_pending
            FROM vqm_messages WHERE queue_id = $1
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        let pending: i64 = stats_row.get("pending");
        let processing: i64 = stats_row.get("processing");
        let completed: i64 = stats_row.get("completed");
        let failed: i64 = stats_row.get("failed");
        let dlq: i64 = stats_row.get("dlq");
        let total: i64 = stats_row.get("total");
        let avg_processing_ms: Option<f64> = stats_row.get("avg_processing_ms");
        let oldest_pending: Option<DateTime<Utc>> = stats_row.get("oldest_pending");

        // Calculate messages per minute (last 5 minutes)
        let recent_count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE queue_id = $1 AND created_at > NOW() - INTERVAL '5 minutes'
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        let messages_per_minute = recent_count as f64 / 5.0;

        let oldest_age = oldest_pending.map(|t| (Utc::now() - t).num_seconds() as u64);

        Ok(QueueStats {
            queue_id: id,
            queue_name: queue.name,
            state: queue.state,
            total_messages: total as u64,
            pending_messages: pending as u64,
            processing_messages: processing as u64,
            completed_messages: completed as u64,
            failed_messages: failed as u64,
            dlq_messages: dlq as u64,
            messages_per_minute,
            avg_processing_time_ms: avg_processing_ms.unwrap_or(0.0),
            oldest_message_age_secs: oldest_age,
            approximate_age_of_oldest_message: oldest_pending,
        })
    }

    /// Get all queue statistics aggregated
    pub async fn get_all_stats(&self) -> Result<AggregatedQueueStats, EngineError> {
        let queue_counts_row = sqlx::query(
            r#"
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active
            FROM vqm_queues
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        let total_queues: i64 = queue_counts_row.get("total");
        let active_queues: i64 = queue_counts_row.get("active");

        let message_counts_row = sqlx::query(
            r#"
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'processing') as processing
            FROM vqm_messages
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        let total_messages: i64 = message_counts_row.get("total");
        let pending_messages: i64 = message_counts_row.get("pending");
        let processing_messages: i64 = message_counts_row.get("processing");

        Ok(AggregatedQueueStats {
            total_queues: total_queues as u64,
            active_queues: active_queues as u64,
            total_messages: total_messages as u64,
            pending_messages: pending_messages as u64,
            processing_messages: processing_messages as u64,
        })
    }

    /// List all queues with optional filtering
    pub async fn list_queues(
        &self,
        state_filter: Option<QueueState>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<QueueInfo>, i64), EngineError> {
        let state_str = state_filter.map(|s| s.to_string());

        let total: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM vqm_queues
            WHERE ($1::text IS NULL OR status = $1)
            "#,
        )
        .bind(&state_str)
        .fetch_one(&self.pool)
        .await?;

        let rows: Vec<QueueRow> = sqlx::query_as(
            r#"
            SELECT id, name, description, status, max_retries, retry_delay_ms,
                   visibility_timeout_secs, message_ttl_secs, max_message_size_bytes,
                   max_queue_size, priority_enabled, fifo_enabled,
                   content_based_deduplication, deduplication_window_secs,
                   rate_limit_per_second, dlq_queue_id, metadata, created_at, updated_at
            FROM vqm_queues
            WHERE ($1::text IS NULL OR status = $1)
            ORDER BY created_at DESC
            OFFSET $2 LIMIT $3
            "#,
        )
        .bind(&state_str)
        .bind(offset)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let queues: Vec<QueueInfo> = rows.into_iter().map(|row| row.into_queue_info()).collect();

        Ok((queues, total))
    }

    /// List all queues (no filtering or pagination)
    pub async fn list_all(&self) -> Vec<QueueInfo> {
        match self.list_queues(None, 0, 10000).await {
            Ok((queues, _)) => queues,
            Err(_) => Vec::new(),
        }
    }

    /// Validate queue configuration
    fn validate_config(&self, config: &QueueConfig) -> Result<(), EngineError> {
        if config.name.is_empty() {
            return Err(EngineError::InvalidConfig(
                "Queue name cannot be empty".into(),
            ));
        }

        if config.name.len() > 255 {
            return Err(EngineError::InvalidConfig("Queue name too long".into()));
        }

        if config.max_message_size > 10 * 1024 * 1024 {
            return Err(EngineError::InvalidConfig(
                "Max message size cannot exceed 10MB".into(),
            ));
        }

        if config.max_retries > 100 {
            return Err(EngineError::InvalidConfig(
                "Max retries cannot exceed 100".into(),
            ));
        }

        if config.visibility_timeout_secs < 1 {
            return Err(EngineError::InvalidConfig(
                "Visibility timeout must be at least 1 second".into(),
            ));
        }

        Ok(())
    }

    /// Invalidate cache for a queue
    pub async fn invalidate_cache(&self, id: Uuid) {
        self.cache.write().await.remove(&id);
    }

    /// Clear entire cache
    pub async fn clear_cache(&self) {
        self.cache.write().await.clear();
    }
}
