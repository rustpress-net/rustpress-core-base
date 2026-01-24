//! Storage Backend Module
//!
//! Provides abstraction over storage operations for messages and queues.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use std::sync::Arc;
use uuid::Uuid;

use super::message::{Message, MessageStatus};
use super::EngineError;

/// Row struct for message queries
#[derive(Debug, FromRow)]
struct MessageRow {
    pub id: Uuid,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub headers: Option<serde_json::Value>,
    pub priority: Option<i32>,
    pub status: String,
    pub attempt_count: Option<i32>,
    pub max_attempts: Option<i32>,
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
    pub metadata: Option<serde_json::Value>,
}

impl From<MessageRow> for Message {
    fn from(r: MessageRow) -> Self {
        Message {
            id: r.id,
            queue_id: r.queue_id,
            message_type: r.message_type,
            payload: r.payload,
            headers: r.headers.unwrap_or(serde_json::json!({})),
            priority: r.priority.unwrap_or(0),
            status: MessageStatus::from(r.status),
            attempt_count: r.attempt_count.unwrap_or(0),
            max_attempts: r.max_attempts.unwrap_or(3),
            created_at: r.created_at,
            scheduled_at: r.scheduled_at,
            processing_started_at: r.processing_started_at,
            completed_at: r.completed_at,
            visibility_timeout_at: r.visibility_timeout_at,
            deduplication_id: r.deduplication_id,
            group_id: r.group_id,
            correlation_id: r.correlation_id,
            trace_id: r.trace_id,
            claimed_by: r.claimed_by,
            last_error: r.last_error,
            metadata: r.metadata.unwrap_or(serde_json::json!({})),
        }
    }
}

/// Row struct for message stats query
#[derive(Debug, FromRow)]
struct MessageStatsRow {
    pub total: i64,
    pub pending: i64,
    pub processing: i64,
    pub completed: i64,
    pub failed: i64,
    pub dlq: i64,
    pub oldest: Option<DateTime<Utc>>,
    pub newest: Option<DateTime<Utc>>,
}

/// Storage operation result
#[derive(Debug, Clone, Serialize)]
pub struct StorageResult {
    pub success: bool,
    pub affected_rows: u64,
    pub message: Option<String>,
}

/// Message filter for queries
#[derive(Debug, Clone, Default)]
pub struct MessageFilter {
    pub queue_id: Option<Uuid>,
    pub status: Option<MessageStatus>,
    pub message_type: Option<String>,
    pub group_id: Option<String>,
    pub correlation_id: Option<String>,
    pub created_after: Option<DateTime<Utc>>,
    pub created_before: Option<DateTime<Utc>>,
    pub priority_min: Option<i32>,
    pub priority_max: Option<i32>,
}

/// Storage backend trait
#[async_trait]
pub trait StorageBackend: Send + Sync {
    /// Store a message
    async fn store_message(&self, message: &Message) -> Result<(), EngineError>;

    /// Get a message by ID
    async fn get_message(&self, id: Uuid) -> Result<Option<Message>, EngineError>;

    /// Update message status
    async fn update_message_status(
        &self,
        id: Uuid,
        status: MessageStatus,
    ) -> Result<(), EngineError>;

    /// Delete a message
    async fn delete_message(&self, id: Uuid) -> Result<bool, EngineError>;

    /// Query messages with filter
    async fn query_messages(
        &self,
        filter: MessageFilter,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<Message>, i64), EngineError>;

    /// Batch store messages
    async fn batch_store_messages(&self, messages: &[Message]) -> Result<u64, EngineError>;

    /// Batch delete messages
    async fn batch_delete_messages(&self, ids: &[Uuid]) -> Result<u64, EngineError>;

    /// Count messages matching filter
    async fn count_messages(&self, filter: MessageFilter) -> Result<u64, EngineError>;

    /// Archive old messages
    async fn archive_messages(
        &self,
        before: DateTime<Utc>,
        status: MessageStatus,
    ) -> Result<u64, EngineError>;

    /// Get storage statistics
    async fn get_storage_stats(&self) -> Result<StorageStats, EngineError>;
}

/// Storage statistics
#[derive(Debug, Clone, Serialize)]
pub struct StorageStats {
    pub total_messages: u64,
    pub total_queues: u64,
    pub total_size_bytes: u64,
    pub pending_messages: u64,
    pub processing_messages: u64,
    pub completed_messages: u64,
    pub failed_messages: u64,
    pub dlq_messages: u64,
    pub oldest_message: Option<DateTime<Utc>>,
    pub newest_message: Option<DateTime<Utc>>,
}

/// PostgreSQL storage backend implementation
pub struct PostgresStorage {
    pool: PgPool,
}

impl PostgresStorage {
    /// Create a new PostgreSQL storage backend
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl StorageBackend for PostgresStorage {
    async fn store_message(&self, message: &Message) -> Result<(), EngineError> {
        sqlx::query(
            r#"
            INSERT INTO vqm_messages (
                id, queue_id, message_type, payload, headers, priority, status,
                attempt_count, max_attempts, created_at, scheduled_at,
                deduplication_id, group_id, correlation_id, trace_id, metadata
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            )
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                attempt_count = EXCLUDED.attempt_count,
                last_error = EXCLUDED.last_error
            "#,
        )
        .bind(message.id)
        .bind(message.queue_id)
        .bind(&message.message_type)
        .bind(&message.payload)
        .bind(&message.headers)
        .bind(message.priority)
        .bind(message.status.to_string())
        .bind(message.attempt_count)
        .bind(message.max_attempts)
        .bind(message.created_at)
        .bind(message.scheduled_at)
        .bind(&message.deduplication_id)
        .bind(&message.group_id)
        .bind(&message.correlation_id)
        .bind(&message.trace_id)
        .bind(&message.metadata)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn get_message(&self, id: Uuid) -> Result<Option<Message>, EngineError> {
        let row = sqlx::query_as::<_, MessageRow>(
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
        .await?;

        Ok(row.map(Message::from))
    }

    async fn update_message_status(
        &self,
        id: Uuid,
        status: MessageStatus,
    ) -> Result<(), EngineError> {
        let now = if status == MessageStatus::Completed || status == MessageStatus::Failed {
            Some(Utc::now())
        } else {
            None
        };

        sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = $2, completed_at = COALESCE($3, completed_at)
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(status.to_string())
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn delete_message(&self, id: Uuid) -> Result<bool, EngineError> {
        let result = sqlx::query("DELETE FROM vqm_messages WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    async fn query_messages(
        &self,
        filter: MessageFilter,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<Message>, i64), EngineError> {
        let status_str = filter.status.map(|s| s.to_string());

        // Count total
        let total: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::text IS NULL OR status = $2)
            AND ($3::text IS NULL OR message_type = $3)
            AND ($4::text IS NULL OR group_id = $4)
            AND ($5::text IS NULL OR correlation_id = $5)
            AND ($6::timestamptz IS NULL OR created_at >= $6)
            AND ($7::timestamptz IS NULL OR created_at <= $7)
            AND ($8::int IS NULL OR priority >= $8)
            AND ($9::int IS NULL OR priority <= $9)
            "#,
        )
        .bind(filter.queue_id)
        .bind(&status_str)
        .bind(&filter.message_type)
        .bind(&filter.group_id)
        .bind(&filter.correlation_id)
        .bind(filter.created_after)
        .bind(filter.created_before)
        .bind(filter.priority_min)
        .bind(filter.priority_max)
        .fetch_one(&self.pool)
        .await?;

        // Fetch messages
        let rows = sqlx::query_as::<_, MessageRow>(
            r#"
            SELECT id, queue_id, message_type, payload, headers, priority, status,
                   attempt_count, max_attempts, created_at, scheduled_at,
                   processing_started_at, completed_at, visibility_timeout_at,
                   deduplication_id, group_id, correlation_id, trace_id,
                   claimed_by, last_error, metadata
            FROM vqm_messages
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::text IS NULL OR status = $2)
            AND ($3::text IS NULL OR message_type = $3)
            AND ($4::text IS NULL OR group_id = $4)
            AND ($5::text IS NULL OR correlation_id = $5)
            AND ($6::timestamptz IS NULL OR created_at >= $6)
            AND ($7::timestamptz IS NULL OR created_at <= $7)
            AND ($8::int IS NULL OR priority >= $8)
            AND ($9::int IS NULL OR priority <= $9)
            ORDER BY priority DESC, created_at ASC
            OFFSET $10 LIMIT $11
            "#,
        )
        .bind(filter.queue_id)
        .bind(&status_str)
        .bind(&filter.message_type)
        .bind(&filter.group_id)
        .bind(&filter.correlation_id)
        .bind(filter.created_after)
        .bind(filter.created_before)
        .bind(filter.priority_min)
        .bind(filter.priority_max)
        .bind(offset)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let messages: Vec<Message> = rows.into_iter().map(Message::from).collect();

        Ok((messages, total))
    }

    async fn batch_store_messages(&self, messages: &[Message]) -> Result<u64, EngineError> {
        if messages.is_empty() {
            return Ok(0);
        }

        let mut tx = self.pool.begin().await?;
        let mut stored = 0u64;

        for message in messages {
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
            .bind(message.id)
            .bind(message.queue_id)
            .bind(&message.message_type)
            .bind(&message.payload)
            .bind(&message.headers)
            .bind(message.priority)
            .bind(message.status.to_string())
            .bind(message.attempt_count)
            .bind(message.max_attempts)
            .bind(message.created_at)
            .bind(message.scheduled_at)
            .bind(&message.deduplication_id)
            .bind(&message.group_id)
            .bind(&message.correlation_id)
            .bind(&message.trace_id)
            .bind(&message.metadata)
            .execute(&mut *tx)
            .await?;

            stored += 1;
        }

        tx.commit().await?;
        Ok(stored)
    }

    async fn batch_delete_messages(&self, ids: &[Uuid]) -> Result<u64, EngineError> {
        if ids.is_empty() {
            return Ok(0);
        }

        let result = sqlx::query("DELETE FROM vqm_messages WHERE id = ANY($1)")
            .bind(ids)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected())
    }

    async fn count_messages(&self, filter: MessageFilter) -> Result<u64, EngineError> {
        let status_str = filter.status.map(|s| s.to_string());

        let count: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE ($1::uuid IS NULL OR queue_id = $1)
            AND ($2::text IS NULL OR status = $2)
            AND ($3::text IS NULL OR message_type = $3)
            "#,
        )
        .bind(filter.queue_id)
        .bind(&status_str)
        .bind(&filter.message_type)
        .fetch_one(&self.pool)
        .await?;

        Ok(count as u64)
    }

    async fn archive_messages(
        &self,
        before: DateTime<Utc>,
        status: MessageStatus,
    ) -> Result<u64, EngineError> {
        // Move messages to archive table
        let result = sqlx::query(
            r#"
            WITH archived AS (
                DELETE FROM vqm_messages
                WHERE status = $1 AND created_at < $2
                RETURNING *
            )
            INSERT INTO vqm_messages_archive
            SELECT * FROM archived
            "#,
        )
        .bind(status.to_string())
        .bind(before)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    async fn get_storage_stats(&self) -> Result<StorageStats, EngineError> {
        let message_stats = sqlx::query_as::<_, MessageStatsRow>(
            r#"
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'processing') as processing,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'failed') as failed,
                COUNT(*) FILTER (WHERE status = 'dead_letter') as dlq,
                MIN(created_at) as oldest,
                MAX(created_at) as newest
            FROM vqm_messages
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        let queue_count: i64 = sqlx::query_scalar::<_, i64>(r#"SELECT COUNT(*) FROM vqm_queues"#)
            .fetch_one(&self.pool)
            .await?;

        // Estimate storage size
        let size_estimate: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT pg_total_relation_size('vqm_messages')
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .unwrap_or(0);

        Ok(StorageStats {
            total_messages: message_stats.total as u64,
            total_queues: queue_count as u64,
            total_size_bytes: size_estimate as u64,
            pending_messages: message_stats.pending as u64,
            processing_messages: message_stats.processing as u64,
            completed_messages: message_stats.completed as u64,
            failed_messages: message_stats.failed as u64,
            dlq_messages: message_stats.dlq as u64,
            oldest_message: message_stats.oldest,
            newest_message: message_stats.newest,
        })
    }
}

/// In-memory storage backend for testing
#[cfg(test)]
pub struct InMemoryStorage {
    messages: std::sync::RwLock<std::collections::HashMap<Uuid, Message>>,
}

#[cfg(test)]
impl InMemoryStorage {
    pub fn new() -> Self {
        Self {
            messages: std::sync::RwLock::new(std::collections::HashMap::new()),
        }
    }
}

#[cfg(test)]
#[async_trait]
impl StorageBackend for InMemoryStorage {
    async fn store_message(&self, message: &Message) -> Result<(), EngineError> {
        self.messages
            .write()
            .unwrap()
            .insert(message.id, message.clone());
        Ok(())
    }

    async fn get_message(&self, id: Uuid) -> Result<Option<Message>, EngineError> {
        Ok(self.messages.read().unwrap().get(&id).cloned())
    }

    async fn update_message_status(
        &self,
        id: Uuid,
        status: MessageStatus,
    ) -> Result<(), EngineError> {
        if let Some(msg) = self.messages.write().unwrap().get_mut(&id) {
            msg.status = status;
        }
        Ok(())
    }

    async fn delete_message(&self, id: Uuid) -> Result<bool, EngineError> {
        Ok(self.messages.write().unwrap().remove(&id).is_some())
    }

    async fn query_messages(
        &self,
        filter: MessageFilter,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<Message>, i64), EngineError> {
        let messages: Vec<Message> = self
            .messages
            .read()
            .unwrap()
            .values()
            .filter(|m| {
                filter.queue_id.map_or(true, |q| m.queue_id == q)
                    && filter.status.map_or(true, |s| m.status == s)
            })
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect();

        let total = messages.len() as i64;
        Ok((messages, total))
    }

    async fn batch_store_messages(&self, messages: &[Message]) -> Result<u64, EngineError> {
        let mut storage = self.messages.write().unwrap();
        for msg in messages {
            storage.insert(msg.id, msg.clone());
        }
        Ok(messages.len() as u64)
    }

    async fn batch_delete_messages(&self, ids: &[Uuid]) -> Result<u64, EngineError> {
        let mut storage = self.messages.write().unwrap();
        let mut deleted = 0u64;
        for id in ids {
            if storage.remove(id).is_some() {
                deleted += 1;
            }
        }
        Ok(deleted)
    }

    async fn count_messages(&self, filter: MessageFilter) -> Result<u64, EngineError> {
        let count = self
            .messages
            .read()
            .unwrap()
            .values()
            .filter(|m| {
                filter.queue_id.map_or(true, |q| m.queue_id == q)
                    && filter.status.map_or(true, |s| m.status == s)
            })
            .count();
        Ok(count as u64)
    }

    async fn archive_messages(
        &self,
        _before: DateTime<Utc>,
        _status: MessageStatus,
    ) -> Result<u64, EngineError> {
        Ok(0)
    }

    async fn get_storage_stats(&self) -> Result<StorageStats, EngineError> {
        let storage = self.messages.read().unwrap();
        Ok(StorageStats {
            total_messages: storage.len() as u64,
            total_queues: 0,
            total_size_bytes: 0,
            pending_messages: storage
                .values()
                .filter(|m| m.status == MessageStatus::Pending)
                .count() as u64,
            processing_messages: storage
                .values()
                .filter(|m| m.status == MessageStatus::Processing)
                .count() as u64,
            completed_messages: storage
                .values()
                .filter(|m| m.status == MessageStatus::Completed)
                .count() as u64,
            failed_messages: storage
                .values()
                .filter(|m| m.status == MessageStatus::Failed)
                .count() as u64,
            dlq_messages: storage
                .values()
                .filter(|m| m.status == MessageStatus::DeadLetter)
                .count() as u64,
            oldest_message: storage.values().map(|m| m.created_at).min(),
            newest_message: storage.values().map(|m| m.created_at).max(),
        })
    }
}
