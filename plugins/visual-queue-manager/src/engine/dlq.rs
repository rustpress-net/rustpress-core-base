//! Dead Letter Queue Module
//!
//! Handles messages that have failed processing after all retry attempts.

use std::sync::Arc;
use sqlx::{PgPool, Row, FromRow};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use tokio::sync::broadcast;

use super::{EngineError, EngineEvent};
use super::storage::StorageBackend;

/// DLQ policy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DlqPolicy {
    /// Whether DLQ is enabled
    pub enabled: bool,
    /// Target DLQ queue ID (None = use same queue with status change)
    pub target_queue_id: Option<Uuid>,
    /// Retention period in days
    pub retention_days: u32,
    /// Maximum DLQ size
    pub max_size: Option<u64>,
    /// Alert threshold (trigger alert when DLQ reaches this size)
    pub alert_threshold: Option<u64>,
    /// Auto-retry settings
    pub auto_retry: Option<AutoRetryConfig>,
}

impl Default for DlqPolicy {
    fn default() -> Self {
        Self {
            enabled: true,
            target_queue_id: None,
            retention_days: 30,
            max_size: None,
            alert_threshold: Some(100),
            auto_retry: None,
        }
    }
}

/// Auto-retry configuration for DLQ messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoRetryConfig {
    /// Enable automatic retry
    pub enabled: bool,
    /// Interval between retry attempts in seconds
    pub interval_secs: u64,
    /// Maximum auto-retry attempts
    pub max_attempts: u32,
    /// Only retry messages with specific error patterns
    pub error_patterns: Vec<String>,
}

/// DLQ message entry
#[derive(Debug, Clone, Serialize)]
pub struct DlqMessage {
    pub id: Uuid,
    pub original_message_id: Uuid,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub headers: serde_json::Value,
    pub original_created_at: DateTime<Utc>,
    pub moved_to_dlq_at: DateTime<Utc>,
    pub reason: String,
    pub failure_count: i32,
    pub last_error: Option<String>,
    pub retry_count: i32,
    pub can_retry: bool,
    pub metadata: serde_json::Value,
}

/// DLQ statistics
#[derive(Debug, Clone, Serialize)]
pub struct DlqStats {
    pub total_messages: u64,
    pub messages_by_queue: Vec<(Uuid, String, u64)>,
    pub messages_by_reason: Vec<(String, u64)>,
    pub oldest_message: Option<DateTime<Utc>>,
    pub newest_message: Option<DateTime<Utc>>,
    pub retry_pending: u64,
    pub avg_age_hours: f64,
}

// Row types for runtime queries

/// Row type for fetching original message data
#[derive(FromRow)]
struct OriginalMessageRow {
    id: Uuid,
    queue_id: Uuid,
    message_type: String,
    payload: serde_json::Value,
    headers: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
    attempt_count: Option<i32>,
    last_error: Option<String>,
    metadata: Option<serde_json::Value>,
}

/// Row type for fetching DLQ entry data for retry
#[derive(FromRow)]
struct DlqEntryRow {
    id: Uuid,
    original_message_id: Uuid,
    queue_id: Uuid,
    message_type: String,
    payload: serde_json::Value,
    headers: Option<serde_json::Value>,
    retry_count: Option<i32>,
    metadata: Option<serde_json::Value>,
}

/// Row type for fetching full DLQ message
#[derive(FromRow)]
struct DlqMessageRow {
    id: Uuid,
    original_message_id: Uuid,
    queue_id: Uuid,
    message_type: String,
    payload: serde_json::Value,
    headers: Option<serde_json::Value>,
    original_created_at: DateTime<Utc>,
    moved_to_dlq_at: DateTime<Utc>,
    reason: String,
    failure_count: Option<i32>,
    last_error: Option<String>,
    retry_count: Option<i32>,
    can_retry: Option<bool>,
    metadata: Option<serde_json::Value>,
}

/// Row type for queue stats
#[derive(FromRow)]
struct QueueStatsRow {
    queue_id: Uuid,
    name: String,
    count: i64,
}

/// Row type for reason stats
#[derive(FromRow)]
struct ReasonStatsRow {
    reason: String,
    count: i64,
}

/// Row type for time stats
#[derive(FromRow)]
struct TimeStatsRow {
    oldest: Option<DateTime<Utc>>,
    newest: Option<DateTime<Utc>>,
    avg_age_hours: Option<f64>,
}

/// Dead Letter Queue handler
pub struct DeadLetterQueue {
    pool: PgPool,
    storage: Arc<dyn StorageBackend>,
    event_tx: broadcast::Sender<EngineEvent>,
}

impl DeadLetterQueue {
    /// Create a new DLQ handler
    pub fn new(
        pool: PgPool,
        storage: Arc<dyn StorageBackend>,
        event_tx: broadcast::Sender<EngineEvent>,
    ) -> Self {
        Self {
            pool,
            storage,
            event_tx,
        }
    }

    /// Move a message to DLQ
    pub async fn move_message(&self, message_id: Uuid, reason: &str) -> Result<(), EngineError> {
        let now = Utc::now();

        // Get the original message
        let message = sqlx::query_as::<_, OriginalMessageRow>(
            r#"
            SELECT id, queue_id, message_type, payload, headers, created_at,
                   attempt_count, last_error, metadata
            FROM vqm_messages WHERE id = $1
            "#
        )
        .bind(message_id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::MessageNotFound(message_id))?;

        // Create DLQ entry
        let dlq_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO vqm_dead_letter_queue (
                id, original_message_id, queue_id, message_type, payload, headers,
                original_created_at, moved_to_dlq_at, reason, failure_count,
                last_error, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            "#
        )
        .bind(dlq_id)
        .bind(message_id)
        .bind(message.queue_id)
        .bind(&message.message_type)
        .bind(&message.payload)
        .bind(&message.headers)
        .bind(message.created_at)
        .bind(now)
        .bind(reason)
        .bind(message.attempt_count)
        .bind(&message.last_error)
        .bind(&message.metadata)
        .execute(&self.pool)
        .await?;

        // Update original message status
        sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = 'dead_letter', completed_at = $2
            WHERE id = $1
            "#
        )
        .bind(message_id)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Emit event
        let _ = self.event_tx.send(EngineEvent::MessageMovedToDlq {
            queue_id: message.queue_id,
            message_id,
            reason: reason.to_string(),
        });

        tracing::info!(
            "Message {} moved to DLQ: {}",
            message_id,
            reason
        );

        Ok(())
    }

    /// Retry a DLQ message
    pub async fn retry_message(&self, dlq_id: Uuid) -> Result<Uuid, EngineError> {
        let now = Utc::now();

        // Get DLQ entry
        let entry = sqlx::query_as::<_, DlqEntryRow>(
            r#"
            SELECT id, original_message_id, queue_id, message_type, payload,
                   headers, retry_count, metadata
            FROM vqm_dead_letter_queue WHERE id = $1
            "#
        )
        .bind(dlq_id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::MessageNotFound(dlq_id))?;

        // Create new message
        let new_message_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO vqm_messages (
                id, queue_id, message_type, payload, headers, status,
                attempt_count, created_at, metadata
            ) VALUES ($1, $2, $3, $4, $5, 'pending', 0, $6, $7)
            "#
        )
        .bind(new_message_id)
        .bind(entry.queue_id)
        .bind(&entry.message_type)
        .bind(&entry.payload)
        .bind(&entry.headers)
        .bind(now)
        .bind(&entry.metadata)
        .execute(&self.pool)
        .await?;

        // Update DLQ entry
        sqlx::query(
            r#"
            UPDATE vqm_dead_letter_queue
            SET retry_count = retry_count + 1,
                last_retry_at = $2,
                retried_message_id = $3
            WHERE id = $1
            "#
        )
        .bind(dlq_id)
        .bind(now)
        .bind(new_message_id)
        .execute(&self.pool)
        .await?;

        // Emit event
        let _ = self.event_tx.send(EngineEvent::MessageEnqueued {
            queue_id: entry.queue_id,
            message_id: new_message_id,
            priority: 0,
        });

        tracing::info!(
            "DLQ message {} retried as new message {}",
            dlq_id,
            new_message_id
        );

        Ok(new_message_id)
    }

    /// Bulk retry DLQ messages
    pub async fn bulk_retry(
        &self,
        queue_id: Option<Uuid>,
        reason_filter: Option<&str>,
        limit: i64,
    ) -> Result<Vec<Uuid>, EngineError> {
        let entries: Vec<Uuid> = sqlx::query_scalar::<_, Uuid>(
            r#"
            SELECT id FROM vqm_dead_letter_queue
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::text IS NULL OR reason ILIKE '%' || $2 || '%')
            AND can_retry = true
            ORDER BY moved_to_dlq_at ASC
            LIMIT $3
            "#
        )
        .bind(queue_id)
        .bind(reason_filter)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let mut retried = Vec::new();
        for entry_id in entries {
            match self.retry_message(entry_id).await {
                Ok(new_id) => retried.push(new_id),
                Err(e) => {
                    tracing::error!("Failed to retry DLQ message {}: {}", entry_id, e);
                }
            }
        }

        Ok(retried)
    }

    /// Delete a DLQ message
    pub async fn delete_message(&self, dlq_id: Uuid) -> Result<bool, EngineError> {
        let result = sqlx::query(
            "DELETE FROM vqm_dead_letter_queue WHERE id = $1"
        )
        .bind(dlq_id)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Purge DLQ messages
    pub async fn purge(
        &self,
        queue_id: Option<Uuid>,
        older_than: Option<DateTime<Utc>>,
    ) -> Result<u64, EngineError> {
        let result = sqlx::query(
            r#"
            DELETE FROM vqm_dead_letter_queue
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::timestamptz IS NULL OR moved_to_dlq_at < $2)
            "#
        )
        .bind(queue_id)
        .bind(older_than)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Get DLQ message by ID
    pub async fn get_message(&self, dlq_id: Uuid) -> Result<DlqMessage, EngineError> {
        let row = sqlx::query_as::<_, DlqMessageRow>(
            r#"
            SELECT id, original_message_id, queue_id, message_type, payload, headers,
                   original_created_at, moved_to_dlq_at, reason, failure_count,
                   last_error, retry_count, can_retry, metadata
            FROM vqm_dead_letter_queue WHERE id = $1
            "#
        )
        .bind(dlq_id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::MessageNotFound(dlq_id))?;

        Ok(DlqMessage {
            id: row.id,
            original_message_id: row.original_message_id,
            queue_id: row.queue_id,
            message_type: row.message_type,
            payload: row.payload,
            headers: row.headers.unwrap_or(serde_json::json!({})),
            original_created_at: row.original_created_at,
            moved_to_dlq_at: row.moved_to_dlq_at,
            reason: row.reason,
            failure_count: row.failure_count.unwrap_or(0),
            last_error: row.last_error,
            retry_count: row.retry_count.unwrap_or(0),
            can_retry: row.can_retry.unwrap_or(true),
            metadata: row.metadata.unwrap_or(serde_json::json!({})),
        })
    }

    /// List DLQ messages
    pub async fn list_messages(
        &self,
        queue_id: Option<Uuid>,
        reason_filter: Option<&str>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<DlqMessage>, i64), EngineError> {
        let total: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_dead_letter_queue
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::text IS NULL OR reason ILIKE '%' || $2 || '%')
            "#
        )
        .bind(queue_id)
        .bind(reason_filter)
        .fetch_one(&self.pool)
        .await?;

        let rows = sqlx::query_as::<_, DlqMessageRow>(
            r#"
            SELECT id, original_message_id, queue_id, message_type, payload, headers,
                   original_created_at, moved_to_dlq_at, reason, failure_count,
                   last_error, retry_count, can_retry, metadata
            FROM vqm_dead_letter_queue
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::text IS NULL OR reason ILIKE '%' || $2 || '%')
            ORDER BY moved_to_dlq_at DESC
            OFFSET $3 LIMIT $4
            "#
        )
        .bind(queue_id)
        .bind(reason_filter)
        .bind(offset)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let messages: Vec<DlqMessage> = rows.into_iter().map(|row| {
            DlqMessage {
                id: row.id,
                original_message_id: row.original_message_id,
                queue_id: row.queue_id,
                message_type: row.message_type,
                payload: row.payload,
                headers: row.headers.unwrap_or(serde_json::json!({})),
                original_created_at: row.original_created_at,
                moved_to_dlq_at: row.moved_to_dlq_at,
                reason: row.reason,
                failure_count: row.failure_count.unwrap_or(0),
                last_error: row.last_error,
                retry_count: row.retry_count.unwrap_or(0),
                can_retry: row.can_retry.unwrap_or(true),
                metadata: row.metadata.unwrap_or(serde_json::json!({})),
            }
        }).collect();

        Ok((messages, total))
    }

    /// Get DLQ statistics
    pub async fn get_stats(&self) -> Result<DlqStats, EngineError> {
        let total: i64 = sqlx::query_scalar::<_, i64>(
            r#"SELECT COUNT(*) FROM vqm_dead_letter_queue"#
        )
        .fetch_one(&self.pool)
        .await?;

        let by_queue = sqlx::query_as::<_, QueueStatsRow>(
            r#"
            SELECT d.queue_id, q.name, COUNT(*) as count
            FROM vqm_dead_letter_queue d
            JOIN vqm_queues q ON d.queue_id = q.id
            GROUP BY d.queue_id, q.name
            ORDER BY count DESC
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        let by_reason = sqlx::query_as::<_, ReasonStatsRow>(
            r#"
            SELECT reason, COUNT(*) as count
            FROM vqm_dead_letter_queue
            GROUP BY reason
            ORDER BY count DESC
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        let time_stats = sqlx::query_as::<_, TimeStatsRow>(
            r#"
            SELECT
                MIN(moved_to_dlq_at) as oldest,
                MAX(moved_to_dlq_at) as newest,
                AVG(EXTRACT(EPOCH FROM (NOW() - moved_to_dlq_at)) / 3600) as avg_age_hours
            FROM vqm_dead_letter_queue
            "#
        )
        .fetch_one(&self.pool)
        .await?;

        let retry_pending: i64 = sqlx::query_scalar::<_, i64>(
            r#"SELECT COUNT(*) FROM vqm_dead_letter_queue WHERE can_retry = true"#
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(DlqStats {
            total_messages: total as u64,
            messages_by_queue: by_queue.into_iter()
                .map(|r| (r.queue_id, r.name, r.count as u64))
                .collect(),
            messages_by_reason: by_reason.into_iter()
                .map(|r| (r.reason, r.count as u64))
                .collect(),
            oldest_message: time_stats.oldest,
            newest_message: time_stats.newest,
            retry_pending: retry_pending as u64,
            avg_age_hours: time_stats.avg_age_hours.unwrap_or(0.0),
        })
    }

    /// Mark a DLQ message as non-retryable
    pub async fn mark_non_retryable(&self, dlq_id: Uuid) -> Result<(), EngineError> {
        sqlx::query(
            "UPDATE vqm_dead_letter_queue SET can_retry = false WHERE id = $1"
        )
        .bind(dlq_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Export DLQ messages
    pub async fn export(
        &self,
        queue_id: Option<Uuid>,
        format: ExportFormat,
    ) -> Result<Vec<u8>, EngineError> {
        let (messages, _) = self.list_messages(queue_id, None, 0, 10000).await?;

        match format {
            ExportFormat::Json => {
                let json = serde_json::to_vec_pretty(&messages)?;
                Ok(json)
            }
            ExportFormat::Csv => {
                let mut csv_data = "id,original_message_id,queue_id,message_type,reason,moved_to_dlq_at,failure_count\n".to_string();
                for msg in messages {
                    csv_data.push_str(&format!(
                        "{},{},{},{},{},{},{}\n",
                        msg.id,
                        msg.original_message_id,
                        msg.queue_id,
                        msg.message_type,
                        msg.reason.replace(',', ";"),
                        msg.moved_to_dlq_at.to_rfc3339(),
                        msg.failure_count,
                    ));
                }
                Ok(csv_data.into_bytes())
            }
        }
    }

    /// Cleanup old DLQ messages based on retention policy
    pub async fn cleanup(&self, retention_days: u32) -> Result<u64, EngineError> {
        let cutoff = Utc::now() - chrono::Duration::days(retention_days as i64);

        let result = sqlx::query(
            "DELETE FROM vqm_dead_letter_queue WHERE moved_to_dlq_at < $1"
        )
        .bind(cutoff)
        .execute(&self.pool)
        .await?;

        let deleted = result.rows_affected();
        if deleted > 0 {
            tracing::info!(
                "Cleaned up {} DLQ messages older than {} days",
                deleted,
                retention_days
            );
        }

        Ok(deleted)
    }
}

/// Export format options
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Json,
    Csv,
}
