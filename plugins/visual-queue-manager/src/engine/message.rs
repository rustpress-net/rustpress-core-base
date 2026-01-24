//! Message Processing Module
//!
//! Handles message enqueueing, claiming, acknowledgment, and processing.

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::{FromRow, PgPool, Row};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::retry::RetryPolicy;
use super::storage::StorageBackend;
use super::{EngineError, EngineEvent};

/// Message status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    DeadLetter,
    Scheduled,
}

impl From<String> for MessageStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "pending" => MessageStatus::Pending,
            "processing" => MessageStatus::Processing,
            "completed" => MessageStatus::Completed,
            "failed" => MessageStatus::Failed,
            "dead_letter" => MessageStatus::DeadLetter,
            "scheduled" => MessageStatus::Scheduled,
            _ => MessageStatus::Pending,
        }
    }
}

impl ToString for MessageStatus {
    fn to_string(&self) -> String {
        match self {
            MessageStatus::Pending => "pending".to_string(),
            MessageStatus::Processing => "processing".to_string(),
            MessageStatus::Completed => "completed".to_string(),
            MessageStatus::Failed => "failed".to_string(),
            MessageStatus::DeadLetter => "dead_letter".to_string(),
            MessageStatus::Scheduled => "scheduled".to_string(),
        }
    }
}

/// Row struct for queue configuration query
#[derive(FromRow)]
struct QueueConfigRow {
    max_retries: Option<i32>,
}

/// Row struct for claimed messages query
#[derive(FromRow)]
struct ClaimedMessageRow {
    id: Uuid,
    queue_id: Uuid,
    message_type: String,
    payload: serde_json::Value,
    headers: Option<serde_json::Value>,
    priority: Option<i32>,
    status: String,
    attempt_count: Option<i32>,
    max_attempts: Option<i32>,
    created_at: DateTime<Utc>,
    scheduled_at: Option<DateTime<Utc>>,
    processing_started_at: Option<DateTime<Utc>>,
    completed_at: Option<DateTime<Utc>>,
    visibility_timeout_at: Option<DateTime<Utc>>,
    deduplication_id: Option<String>,
    group_id: Option<String>,
    correlation_id: Option<String>,
    trace_id: Option<String>,
    claimed_by: Option<Uuid>,
    last_error: Option<String>,
    metadata: Option<serde_json::Value>,
}

/// Row struct for acknowledge query
#[derive(FromRow)]
struct AcknowledgeRow {
    queue_id: Uuid,
    processing_started_at: Option<DateTime<Utc>>,
}

/// Row struct for get message query
#[derive(FromRow)]
struct MessageRow {
    id: Uuid,
    queue_id: Uuid,
    message_type: String,
    payload: serde_json::Value,
    headers: Option<serde_json::Value>,
    priority: Option<i32>,
    status: String,
    attempt_count: Option<i32>,
    max_attempts: Option<i32>,
    created_at: DateTime<Utc>,
    scheduled_at: Option<DateTime<Utc>>,
    processing_started_at: Option<DateTime<Utc>>,
    completed_at: Option<DateTime<Utc>>,
    visibility_timeout_at: Option<DateTime<Utc>>,
    deduplication_id: Option<String>,
    group_id: Option<String>,
    correlation_id: Option<String>,
    trace_id: Option<String>,
    claimed_by: Option<Uuid>,
    last_error: Option<String>,
    metadata: Option<serde_json::Value>,
}

/// Message data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: Uuid,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub headers: serde_json::Value,
    pub priority: i32,
    pub status: MessageStatus,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub created_at: DateTime<Utc>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub processing_started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub visibility_timeout_at: Option<DateTime<Utc>>,
    pub deduplication_id: Option<String>,
    pub group_id: Option<String>,
    pub correlation_id: Option<String>,
    pub trace_id: Option<String>,
    pub claimed_by: Option<Uuid>,
    pub last_error: Option<String>,
    pub metadata: serde_json::Value,
}

/// Message batch for bulk operations
#[derive(Debug, Clone)]
pub struct MessageBatch {
    pub messages: Vec<Message>,
    pub queue_id: Uuid,
}

/// Processing result
#[derive(Debug, Clone)]
pub enum ProcessingResult {
    Success,
    Retry { delay_ms: u64 },
    Fail { error: String },
    DeadLetter { reason: String },
}

/// Message enqueue request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnqueueRequest {
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    #[serde(default)]
    pub headers: serde_json::Value,
    #[serde(default)]
    pub priority: i32,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub deduplication_id: Option<String>,
    pub group_id: Option<String>,
    pub correlation_id: Option<String>,
    pub trace_id: Option<String>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

/// Processor statistics
#[derive(Debug, Clone, Serialize)]
pub struct ProcessorStats {
    pub messages_per_second: f64,
    pub avg_processing_time_ms: f64,
    pub error_rate: f64,
    pub uptime_secs: u64,
    pub total_processed: u64,
    pub total_failed: u64,
}

/// Message processor for handling message operations
pub struct MessageProcessor {
    pool: PgPool,
    storage: Arc<dyn StorageBackend>,
    retry_policy: RetryPolicy,
    event_tx: broadcast::Sender<EngineEvent>,
    batch_size: usize,
    /// Internal statistics
    stats: RwLock<InternalStats>,
    start_time: Instant,
}

#[derive(Debug, Default)]
struct InternalStats {
    total_processed: u64,
    total_failed: u64,
    total_processing_time_ms: u64,
    recent_successes: u64,
    recent_failures: u64,
}

impl MessageProcessor {
    /// Create a new message processor
    pub fn new(
        pool: PgPool,
        storage: Arc<dyn StorageBackend>,
        retry_policy: RetryPolicy,
        event_tx: broadcast::Sender<EngineEvent>,
        batch_size: usize,
    ) -> Self {
        Self {
            pool,
            storage,
            retry_policy,
            event_tx,
            batch_size,
            stats: RwLock::new(InternalStats::default()),
            start_time: Instant::now(),
        }
    }

    /// Enqueue a single message
    pub async fn enqueue(&self, request: EnqueueRequest) -> Result<Message, EngineError> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        // Check for deduplication
        if let Some(ref dedup_id) = request.deduplication_id {
            let existing: Option<Uuid> = sqlx::query_scalar::<_, Uuid>(
                r#"
                SELECT id FROM vqm_messages
                WHERE queue_id = $1 AND deduplication_id = $2
                AND created_at > NOW() - INTERVAL '5 minutes'
                "#,
            )
            .bind(request.queue_id)
            .bind(dedup_id)
            .fetch_optional(&self.pool)
            .await?;

            if let Some(existing_id) = existing {
                // Return existing message instead of creating duplicate
                return self.get_message(existing_id).await;
            }
        }

        // Get queue configuration for max_attempts
        let queue_config: QueueConfigRow =
            sqlx::query_as::<_, QueueConfigRow>("SELECT max_retries FROM vqm_queues WHERE id = $1")
                .bind(request.queue_id)
                .fetch_optional(&self.pool)
                .await?
                .ok_or(EngineError::QueueNotFound(request.queue_id))?;

        let max_attempts = queue_config.max_retries.unwrap_or(3);
        let status = if request.scheduled_at.is_some() {
            "scheduled"
        } else {
            "pending"
        };

        // Generate content-based deduplication ID if needed
        let dedup_id = request.deduplication_id.or_else(|| {
            // Generate hash of payload for content-based deduplication
            let mut hasher = Sha256::new();
            hasher.update(request.payload.to_string().as_bytes());
            Some(format!("{:x}", hasher.finalize()))
        });

        sqlx::query(
            r#"
            INSERT INTO vqm_messages (
                id, queue_id, message_type, payload, headers, priority, status,
                attempt_count, max_attempts, created_at, scheduled_at,
                deduplication_id, group_id, correlation_id, trace_id, metadata
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            )
            "#,
        )
        .bind(id)
        .bind(request.queue_id)
        .bind(&request.message_type)
        .bind(&request.payload)
        .bind(&request.headers)
        .bind(request.priority)
        .bind(status)
        .bind(0i32)
        .bind(max_attempts)
        .bind(now)
        .bind(request.scheduled_at)
        .bind(&dedup_id)
        .bind(&request.group_id)
        .bind(&request.correlation_id)
        .bind(&request.trace_id)
        .bind(&request.metadata)
        .execute(&self.pool)
        .await?;

        let message = Message {
            id,
            queue_id: request.queue_id,
            message_type: request.message_type,
            payload: request.payload,
            headers: request.headers,
            priority: request.priority,
            status: MessageStatus::from(status.to_string()),
            attempt_count: 0,
            max_attempts,
            created_at: now,
            scheduled_at: request.scheduled_at,
            processing_started_at: None,
            completed_at: None,
            visibility_timeout_at: None,
            deduplication_id: dedup_id,
            group_id: request.group_id,
            correlation_id: request.correlation_id,
            trace_id: request.trace_id,
            claimed_by: None,
            last_error: None,
            metadata: request.metadata,
        };

        // Emit event
        let _ = self.event_tx.send(EngineEvent::MessageEnqueued {
            queue_id: request.queue_id,
            message_id: id,
            priority: request.priority,
        });

        Ok(message)
    }

    /// Enqueue multiple messages in batch
    pub async fn enqueue_batch(
        &self,
        requests: Vec<EnqueueRequest>,
    ) -> Result<Vec<Message>, EngineError> {
        let mut messages = Vec::with_capacity(requests.len());
        let mut tx = self.pool.begin().await?;

        for request in requests {
            let id = Uuid::new_v4();
            let now = Utc::now();

            let queue_config: QueueConfigRow = sqlx::query_as::<_, QueueConfigRow>(
                "SELECT max_retries FROM vqm_queues WHERE id = $1",
            )
            .bind(request.queue_id)
            .fetch_optional(&mut *tx)
            .await?
            .ok_or(EngineError::QueueNotFound(request.queue_id))?;

            let max_attempts = queue_config.max_retries.unwrap_or(3);
            let status = if request.scheduled_at.is_some() {
                "scheduled"
            } else {
                "pending"
            };

            let dedup_id = request.deduplication_id.clone();

            sqlx::query(
                r#"
                INSERT INTO vqm_messages (
                    id, queue_id, message_type, payload, headers, priority, status,
                    attempt_count, max_attempts, created_at, scheduled_at,
                    deduplication_id, group_id, correlation_id, trace_id, metadata
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                )
                "#,
            )
            .bind(id)
            .bind(request.queue_id)
            .bind(&request.message_type)
            .bind(&request.payload)
            .bind(&request.headers)
            .bind(request.priority)
            .bind(status)
            .bind(0i32)
            .bind(max_attempts)
            .bind(now)
            .bind(request.scheduled_at)
            .bind(&dedup_id)
            .bind(&request.group_id)
            .bind(&request.correlation_id)
            .bind(&request.trace_id)
            .bind(&request.metadata)
            .execute(&mut *tx)
            .await?;

            messages.push(Message {
                id,
                queue_id: request.queue_id,
                message_type: request.message_type,
                payload: request.payload,
                headers: request.headers,
                priority: request.priority,
                status: MessageStatus::from(status.to_string()),
                attempt_count: 0,
                max_attempts,
                created_at: now,
                scheduled_at: request.scheduled_at,
                processing_started_at: None,
                completed_at: None,
                visibility_timeout_at: None,
                deduplication_id: dedup_id,
                group_id: request.group_id,
                correlation_id: request.correlation_id,
                trace_id: request.trace_id,
                claimed_by: None,
                last_error: None,
                metadata: request.metadata,
            });
        }

        tx.commit().await?;

        // Emit events
        for msg in &messages {
            let _ = self.event_tx.send(EngineEvent::MessageEnqueued {
                queue_id: msg.queue_id,
                message_id: msg.id,
                priority: msg.priority,
            });
        }

        Ok(messages)
    }

    /// Claim messages for processing
    pub async fn claim_messages(
        &self,
        worker_id: Uuid,
        queue_ids: &[Uuid],
        limit: i64,
    ) -> Result<Vec<Message>, EngineError> {
        if queue_ids.is_empty() {
            return Ok(Vec::new());
        }

        let now = Utc::now();
        let visibility_timeout = Duration::seconds(300); // 5 minutes default

        // Use SELECT FOR UPDATE SKIP LOCKED for concurrent claim
        let rows: Vec<ClaimedMessageRow> = sqlx::query_as::<_, ClaimedMessageRow>(
            r#"
            WITH claimed AS (
                SELECT id FROM vqm_messages
                WHERE queue_id = ANY($1)
                AND status = 'pending'
                AND (scheduled_at IS NULL OR scheduled_at <= $2)
                ORDER BY priority DESC, created_at ASC
                LIMIT $3
                FOR UPDATE SKIP LOCKED
            )
            UPDATE vqm_messages m
            SET status = 'processing',
                claimed_by = $4,
                processing_started_at = $2,
                visibility_timeout_at = $5,
                attempt_count = attempt_count + 1
            FROM claimed c
            WHERE m.id = c.id
            RETURNING m.id, m.queue_id, m.message_type, m.payload, m.headers,
                      m.priority, m.status, m.attempt_count, m.max_attempts,
                      m.created_at, m.scheduled_at, m.processing_started_at,
                      m.completed_at, m.visibility_timeout_at, m.deduplication_id,
                      m.group_id, m.correlation_id, m.trace_id, m.claimed_by,
                      m.last_error, m.metadata
            "#,
        )
        .bind(queue_ids)
        .bind(now)
        .bind(limit)
        .bind(worker_id)
        .bind(now + visibility_timeout)
        .fetch_all(&self.pool)
        .await?;

        let messages: Vec<Message> = rows
            .into_iter()
            .map(|row| {
                // Emit event for each claimed message
                let _ = self.event_tx.send(EngineEvent::MessageProcessingStarted {
                    queue_id: row.queue_id,
                    message_id: row.id,
                    worker_id,
                });

                Message {
                    id: row.id,
                    queue_id: row.queue_id,
                    message_type: row.message_type,
                    payload: row.payload,
                    headers: row.headers.unwrap_or(serde_json::json!({})),
                    priority: row.priority.unwrap_or(0),
                    status: MessageStatus::Processing,
                    attempt_count: row.attempt_count.unwrap_or(1),
                    max_attempts: row.max_attempts.unwrap_or(3),
                    created_at: row.created_at,
                    scheduled_at: row.scheduled_at,
                    processing_started_at: row.processing_started_at,
                    completed_at: row.completed_at,
                    visibility_timeout_at: row.visibility_timeout_at,
                    deduplication_id: row.deduplication_id,
                    group_id: row.group_id,
                    correlation_id: row.correlation_id,
                    trace_id: row.trace_id,
                    claimed_by: row.claimed_by,
                    last_error: row.last_error,
                    metadata: row.metadata.unwrap_or(serde_json::json!({})),
                }
            })
            .collect();

        Ok(messages)
    }

    /// Acknowledge successful message processing
    pub async fn acknowledge(&self, message_id: Uuid, worker_id: Uuid) -> Result<(), EngineError> {
        let now = Utc::now();

        let result: Option<AcknowledgeRow> = sqlx::query_as::<_, AcknowledgeRow>(
            r#"
            UPDATE vqm_messages
            SET status = 'completed',
                completed_at = $2
            WHERE id = $1 AND claimed_by = $3 AND status = 'processing'
            RETURNING queue_id, processing_started_at
            "#,
        )
        .bind(message_id)
        .bind(now)
        .bind(worker_id)
        .fetch_optional(&self.pool)
        .await?;

        let row = result.ok_or(EngineError::MessageNotFound(message_id))?;

        // Calculate processing time
        let processing_time_ms = row
            .processing_started_at
            .map(|start| (now - start).num_milliseconds() as u64)
            .unwrap_or(0);

        // Update statistics
        {
            let mut stats = self.stats.write().await;
            stats.total_processed += 1;
            stats.total_processing_time_ms += processing_time_ms;
            stats.recent_successes += 1;
        }

        // Emit event
        let _ = self.event_tx.send(EngineEvent::MessageProcessed {
            queue_id: row.queue_id,
            message_id,
            processing_time_ms,
        });

        Ok(())
    }

    /// Negative acknowledge (failed processing)
    pub async fn negative_acknowledge(
        &self,
        message_id: Uuid,
        worker_id: Uuid,
        error: &str,
    ) -> Result<(), EngineError> {
        let message = self.get_message(message_id).await?;

        // Check if we should retry
        let should_retry = message.attempt_count < message.max_attempts;

        if should_retry {
            let delay = self
                .retry_policy
                .calculate_delay(message.attempt_count as u32);
            let retry_at = Utc::now() + Duration::milliseconds(delay as i64);

            sqlx::query(
                r#"
                UPDATE vqm_messages
                SET status = 'pending',
                    claimed_by = NULL,
                    processing_started_at = NULL,
                    visibility_timeout_at = NULL,
                    scheduled_at = $2,
                    last_error = $3
                WHERE id = $1 AND claimed_by = $4
                "#,
            )
            .bind(message_id)
            .bind(retry_at)
            .bind(error)
            .bind(worker_id)
            .execute(&self.pool)
            .await?;

            // Emit retry event
            let _ = self.event_tx.send(EngineEvent::MessageFailed {
                queue_id: message.queue_id,
                message_id,
                error: error.to_string(),
                will_retry: true,
            });
        } else {
            // Move to failed status
            sqlx::query(
                r#"
                UPDATE vqm_messages
                SET status = 'failed',
                    completed_at = NOW(),
                    last_error = $2
                WHERE id = $1 AND claimed_by = $3
                "#,
            )
            .bind(message_id)
            .bind(error)
            .bind(worker_id)
            .execute(&self.pool)
            .await?;

            // Update statistics
            {
                let mut stats = self.stats.write().await;
                stats.total_failed += 1;
                stats.recent_failures += 1;
            }

            // Emit failure event
            let _ = self.event_tx.send(EngineEvent::MessageFailed {
                queue_id: message.queue_id,
                message_id,
                error: error.to_string(),
                will_retry: false,
            });
        }

        Ok(())
    }

    /// Schedule a message for retry
    pub async fn schedule_retry(&self, message_id: Uuid, delay_ms: u64) -> Result<(), EngineError> {
        let retry_at = Utc::now() + Duration::milliseconds(delay_ms as i64);

        sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = 'pending',
                claimed_by = NULL,
                processing_started_at = NULL,
                visibility_timeout_at = NULL,
                scheduled_at = $2
            WHERE id = $1
            "#,
        )
        .bind(message_id)
        .bind(retry_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Get a message by ID
    pub async fn get_message(&self, id: Uuid) -> Result<Message, EngineError> {
        let row: MessageRow = sqlx::query_as::<_, MessageRow>(
            r#"
            SELECT id, queue_id, message_type, payload, headers, priority, status,
                   attempt_count, max_attempts, created_at, scheduled_at,
                   processing_started_at, completed_at, visibility_timeout_at,
                   deduplication_id, group_id, correlation_id, trace_id,
                   claimed_by, last_error, metadata
            FROM vqm_messages WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::MessageNotFound(id))?;

        Ok(Message {
            id: row.id,
            queue_id: row.queue_id,
            message_type: row.message_type,
            payload: row.payload,
            headers: row.headers.unwrap_or(serde_json::json!({})),
            priority: row.priority.unwrap_or(0),
            status: MessageStatus::from(row.status),
            attempt_count: row.attempt_count.unwrap_or(0),
            max_attempts: row.max_attempts.unwrap_or(3),
            created_at: row.created_at,
            scheduled_at: row.scheduled_at,
            processing_started_at: row.processing_started_at,
            completed_at: row.completed_at,
            visibility_timeout_at: row.visibility_timeout_at,
            deduplication_id: row.deduplication_id,
            group_id: row.group_id,
            correlation_id: row.correlation_id,
            trace_id: row.trace_id,
            claimed_by: row.claimed_by,
            last_error: row.last_error,
            metadata: row.metadata.unwrap_or(serde_json::json!({})),
        })
    }

    /// Release timed-out messages back to pending
    pub async fn release_timed_out_messages(&self) -> Result<u64, EngineError> {
        let now = Utc::now();

        let result = sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = 'pending',
                claimed_by = NULL,
                processing_started_at = NULL,
                visibility_timeout_at = NULL
            WHERE status = 'processing'
            AND visibility_timeout_at < $1
            "#,
        )
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Activate scheduled messages that are due
    pub async fn activate_scheduled_messages(&self) -> Result<u64, EngineError> {
        let now = Utc::now();

        let result = sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = 'pending',
                scheduled_at = NULL
            WHERE status = 'scheduled'
            AND scheduled_at <= $1
            "#,
        )
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Get processor statistics
    pub async fn get_stats(&self) -> Result<ProcessorStats, EngineError> {
        let stats = self.stats.read().await;
        let uptime_secs = self.start_time.elapsed().as_secs();

        let messages_per_second = if uptime_secs > 0 {
            stats.total_processed as f64 / uptime_secs as f64
        } else {
            0.0
        };

        let avg_processing_time_ms = if stats.total_processed > 0 {
            stats.total_processing_time_ms as f64 / stats.total_processed as f64
        } else {
            0.0
        };

        let total = stats.recent_successes + stats.recent_failures;
        let error_rate = if total > 0 {
            stats.recent_failures as f64 / total as f64
        } else {
            0.0
        };

        Ok(ProcessorStats {
            messages_per_second,
            avg_processing_time_ms,
            error_rate,
            uptime_secs,
            total_processed: stats.total_processed,
            total_failed: stats.total_failed,
        })
    }

    /// Bulk delete messages by status
    pub async fn bulk_delete(
        &self,
        queue_id: Uuid,
        status: MessageStatus,
    ) -> Result<u64, EngineError> {
        let result = sqlx::query("DELETE FROM vqm_messages WHERE queue_id = $1 AND status = $2")
            .bind(queue_id)
            .bind(status.to_string())
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected())
    }

    /// Bulk retry failed messages
    pub async fn bulk_retry(&self, queue_id: Uuid) -> Result<u64, EngineError> {
        let result = sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = 'pending',
                attempt_count = 0,
                scheduled_at = NULL,
                last_error = NULL
            WHERE queue_id = $1 AND status = 'failed'
            "#,
        )
        .bind(queue_id)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Update message priority
    pub async fn update_priority(
        &self,
        message_id: Uuid,
        priority: i32,
    ) -> Result<(), EngineError> {
        sqlx::query("UPDATE vqm_messages SET priority = $2 WHERE id = $1 AND status = 'pending'")
            .bind(message_id)
            .bind(priority)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    /// Cancel a message (if pending)
    pub async fn cancel(&self, message_id: Uuid) -> Result<bool, EngineError> {
        let result = sqlx::query(
            "DELETE FROM vqm_messages WHERE id = $1 AND status IN ('pending', 'scheduled')",
        )
        .bind(message_id)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Extend visibility timeout for a message
    pub async fn extend_visibility(
        &self,
        message_id: Uuid,
        worker_id: Uuid,
        extension_secs: i64,
    ) -> Result<(), EngineError> {
        sqlx::query(
            r#"
            UPDATE vqm_messages
            SET visibility_timeout_at = visibility_timeout_at + INTERVAL '1 second' * $3
            WHERE id = $1 AND claimed_by = $2 AND status = 'processing'
            "#,
        )
        .bind(message_id)
        .bind(worker_id)
        .bind(extension_secs)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
