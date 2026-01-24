//! Worker Pool Management Module
//!
//! Handles worker registration, heartbeats, and pool management.

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::{EngineError, EngineEvent};

/// Row type for available workers query
#[derive(Debug, FromRow)]
struct AvailableWorkerRow {
    id: Uuid,
    concurrency_limit: Option<i32>,
    current_load: Option<i32>,
    subscribed_queues: Option<Vec<Uuid>>,
}

/// Row type for worker details query
#[derive(Debug, FromRow)]
struct WorkerRow {
    id: Uuid,
    name: String,
    group_id: Option<Uuid>,
    status: String,
    concurrency_limit: Option<i32>,
    current_load: Option<i32>,
    capabilities: Option<Vec<String>>,
    metadata: Option<serde_json::Value>,
    last_heartbeat_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    subscribed_queues: Option<Vec<Uuid>>,
}

/// Worker state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkerState {
    Active,
    Idle,
    Busy,
    Draining,
    Disconnected,
}

impl From<String> for WorkerState {
    fn from(s: String) -> Self {
        match s.as_str() {
            "active" => WorkerState::Active,
            "idle" => WorkerState::Idle,
            "busy" => WorkerState::Busy,
            "draining" => WorkerState::Draining,
            "disconnected" => WorkerState::Disconnected,
            _ => WorkerState::Active,
        }
    }
}

impl ToString for WorkerState {
    fn to_string(&self) -> String {
        match self {
            WorkerState::Active => "active".to_string(),
            WorkerState::Idle => "idle".to_string(),
            WorkerState::Busy => "busy".to_string(),
            WorkerState::Draining => "draining".to_string(),
            WorkerState::Disconnected => "disconnected".to_string(),
        }
    }
}

/// Worker configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerConfig {
    /// Worker name
    pub name: String,
    /// Worker group ID
    pub group_id: Option<Uuid>,
    /// Queues the worker subscribes to
    pub subscribed_queues: Vec<Uuid>,
    /// Maximum concurrent messages
    pub max_concurrent: u32,
    /// Capabilities/tags
    pub capabilities: Vec<String>,
    /// Custom metadata
    pub metadata: serde_json::Value,
}

/// Worker information
#[derive(Debug, Clone, Serialize)]
pub struct WorkerInfo {
    pub id: Uuid,
    pub name: String,
    pub group_id: Option<Uuid>,
    pub state: WorkerState,
    pub subscribed_queues: Vec<Uuid>,
    pub max_concurrent: u32,
    pub active_messages: u32,
    pub capabilities: Vec<String>,
    pub last_heartbeat: DateTime<Utc>,
    pub registered_at: DateTime<Utc>,
    pub metadata: serde_json::Value,
}

/// Worker handle for claiming messages
#[derive(Debug, Clone)]
pub struct WorkerHandle {
    pub id: Uuid,
    pub subscribed_queues: Vec<Uuid>,
    pub available_capacity: u32,
}

/// Worker summary for dashboard display
#[derive(Debug, Clone, Serialize)]
pub struct WorkerSummary {
    pub id: Uuid,
    pub name: String,
    pub status: String,
    pub active_jobs: u32,
    pub concurrency: u32,
    pub total_processed: u64,
}

/// Worker statistics
#[derive(Debug, Clone, Serialize)]
pub struct WorkerStats {
    pub total_workers: u64,
    pub active_workers: u64,
    pub idle_workers: u64,
    pub busy_workers: u64,
    pub disconnected_workers: u64,
    pub total_capacity: u64,
    pub used_capacity: u64,
}

/// Worker group information
#[derive(Debug, Clone, Serialize)]
pub struct WorkerGroup {
    pub id: Uuid,
    pub name: String,
    pub min_workers: u32,
    pub max_workers: u32,
    pub current_workers: u32,
    pub target_workers: u32,
    pub auto_scaling_enabled: bool,
    pub scale_up_threshold: f64,
    pub scale_down_threshold: f64,
    pub cooldown_secs: u64,
    pub last_scaled_at: Option<DateTime<Utc>>,
    pub metadata: serde_json::Value,
}

/// Worker pool for managing workers
pub struct WorkerPool {
    pool: PgPool,
    event_tx: broadcast::Sender<EngineEvent>,
    heartbeat_interval_secs: u64,
    stale_threshold_secs: u64,
    /// In-memory worker cache
    workers: Arc<RwLock<HashMap<Uuid, WorkerInfo>>>,
    running: Arc<RwLock<bool>>,
}

impl WorkerPool {
    /// Create a new worker pool
    pub fn new(
        pool: PgPool,
        event_tx: broadcast::Sender<EngineEvent>,
        heartbeat_interval_secs: u64,
        stale_threshold_secs: u64,
    ) -> Self {
        Self {
            pool,
            event_tx,
            heartbeat_interval_secs,
            stale_threshold_secs,
            workers: Arc::new(RwLock::new(HashMap::new())),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Start the worker pool
    pub async fn start(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        if *running {
            return Ok(());
        }
        *running = true;
        drop(running);

        // Start stale worker cleanup task
        self.start_cleanup_task().await;

        tracing::info!("Worker pool started");
        Ok(())
    }

    /// Stop the worker pool
    pub async fn stop(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        *running = false;
        tracing::info!("Worker pool stopped");
        Ok(())
    }

    /// Start periodic cleanup of stale workers
    async fn start_cleanup_task(&self) {
        let pool = self.pool.clone();
        let event_tx = self.event_tx.clone();
        let stale_threshold = self.stale_threshold_secs;
        let running = self.running.clone();
        let workers_cache = self.workers.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));

            loop {
                interval.tick().await;

                if !*running.read().await {
                    break;
                }

                // Find and mark stale workers
                if let Err(e) =
                    cleanup_stale_workers(&pool, &event_tx, stale_threshold, &workers_cache).await
                {
                    tracing::error!("Failed to cleanup stale workers: {}", e);
                }
            }
        });
    }

    /// Register a new worker
    pub async fn register(&self, config: WorkerConfig) -> Result<WorkerInfo, EngineError> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        sqlx::query(
            r#"
            INSERT INTO vqm_workers (
                id, name, group_id, status, concurrency_limit,
                current_load, capabilities, metadata, last_heartbeat_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
        )
        .bind(id)
        .bind(&config.name)
        .bind(config.group_id)
        .bind("active")
        .bind(config.max_concurrent as i32)
        .bind(0i32)
        .bind(&config.capabilities)
        .bind(&config.metadata)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Register queue subscriptions
        for queue_id in &config.subscribed_queues {
            sqlx::query(
                r#"
                INSERT INTO vqm_worker_queue_subscriptions (worker_id, queue_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                "#,
            )
            .bind(id)
            .bind(queue_id)
            .execute(&self.pool)
            .await?;
        }

        let worker_info = WorkerInfo {
            id,
            name: config.name,
            group_id: config.group_id,
            state: WorkerState::Active,
            subscribed_queues: config.subscribed_queues,
            max_concurrent: config.max_concurrent,
            active_messages: 0,
            capabilities: config.capabilities,
            last_heartbeat: now,
            registered_at: now,
            metadata: config.metadata,
        };

        // Update cache
        self.workers.write().await.insert(id, worker_info.clone());

        // Emit event
        let _ = self.event_tx.send(EngineEvent::WorkerRegistered {
            worker_id: id,
            group_id: config.group_id,
        });

        Ok(worker_info)
    }

    /// Update worker heartbeat
    pub async fn heartbeat(
        &self,
        worker_id: Uuid,
        active_messages: u32,
    ) -> Result<(), EngineError> {
        let now = Utc::now();

        let state = if active_messages == 0 { "idle" } else { "busy" };

        sqlx::query(
            r#"
            UPDATE vqm_workers
            SET last_heartbeat_at = $2,
                current_load = $3,
                status = $4
            WHERE id = $1
            "#,
        )
        .bind(worker_id)
        .bind(now)
        .bind(active_messages as i32)
        .bind(state)
        .execute(&self.pool)
        .await?;

        // Update cache
        if let Some(worker) = self.workers.write().await.get_mut(&worker_id) {
            worker.last_heartbeat = now;
            worker.active_messages = active_messages;
            worker.state = WorkerState::from(state.to_string());
        }

        // Emit event
        let _ = self.event_tx.send(EngineEvent::WorkerHeartbeat {
            worker_id,
            active_messages,
        });

        Ok(())
    }

    /// Unregister a worker
    pub async fn unregister(&self, worker_id: Uuid) -> Result<(), EngineError> {
        // Remove queue subscriptions
        sqlx::query("DELETE FROM vqm_worker_queue_subscriptions WHERE worker_id = $1")
            .bind(worker_id)
            .execute(&self.pool)
            .await?;

        // Delete worker
        sqlx::query("DELETE FROM vqm_workers WHERE id = $1")
            .bind(worker_id)
            .execute(&self.pool)
            .await?;

        // Remove from cache
        self.workers.write().await.remove(&worker_id);

        // Emit event
        let _ = self.event_tx.send(EngineEvent::WorkerDisconnected {
            worker_id,
            reason: "unregistered".to_string(),
        });

        Ok(())
    }

    /// Get available workers with capacity
    pub async fn get_available_workers(&self) -> Result<Vec<WorkerHandle>, EngineError> {
        let rows: Vec<AvailableWorkerRow> = sqlx::query_as::<_, AvailableWorkerRow>(
            r#"
            SELECT w.id, w.concurrency_limit, w.current_load,
                   array_agg(wqs.queue_id) as subscribed_queues
            FROM vqm_workers w
            LEFT JOIN vqm_worker_queue_subscriptions wqs ON w.id = wqs.worker_id
            WHERE w.status IN ('active', 'idle')
            AND w.current_load < w.concurrency_limit
            GROUP BY w.id
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        let workers: Vec<WorkerHandle> = rows
            .into_iter()
            .filter_map(|row| {
                let queues = row.subscribed_queues?;
                let capacity = row.concurrency_limit.unwrap_or(1) - row.current_load.unwrap_or(0);

                if capacity > 0 && !queues.is_empty() {
                    Some(WorkerHandle {
                        id: row.id,
                        subscribed_queues: queues,
                        available_capacity: capacity as u32,
                    })
                } else {
                    None
                }
            })
            .collect();

        Ok(workers)
    }

    /// Get worker by ID
    pub async fn get_worker(&self, id: Uuid) -> Result<WorkerInfo, EngineError> {
        // Check cache first
        if let Some(worker) = self.workers.read().await.get(&id) {
            return Ok(worker.clone());
        }

        let row: WorkerRow = sqlx::query_as::<_, WorkerRow>(
            r#"
            SELECT w.id, w.name, w.group_id, w.status, w.concurrency_limit,
                   w.current_load, w.capabilities, w.metadata,
                   w.last_heartbeat_at, w.created_at,
                   array_agg(wqs.queue_id) FILTER (WHERE wqs.queue_id IS NOT NULL) as subscribed_queues
            FROM vqm_workers w
            LEFT JOIN vqm_worker_queue_subscriptions wqs ON w.id = wqs.worker_id
            WHERE w.id = $1
            GROUP BY w.id
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(EngineError::WorkerNotFound(id))?;

        let worker = WorkerInfo {
            id: row.id,
            name: row.name,
            group_id: row.group_id,
            state: WorkerState::from(row.status),
            subscribed_queues: row.subscribed_queues.unwrap_or_default(),
            max_concurrent: row.concurrency_limit.unwrap_or(1) as u32,
            active_messages: row.current_load.unwrap_or(0) as u32,
            capabilities: row.capabilities.unwrap_or_default(),
            last_heartbeat: row.last_heartbeat_at.unwrap_or(row.created_at),
            registered_at: row.created_at,
            metadata: row.metadata.unwrap_or(serde_json::json!({})),
        };

        // Update cache
        self.workers.write().await.insert(id, worker.clone());

        Ok(worker)
    }

    /// List all workers
    pub async fn list_workers(
        &self,
        group_id: Option<Uuid>,
        state_filter: Option<WorkerState>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<WorkerInfo>, i64), EngineError> {
        let state_str = state_filter.map(|s| s.to_string());

        let total: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_workers
            WHERE ($1::uuid IS NULL OR group_id = $1)
            AND ($2::text IS NULL OR status = $2)
            "#,
        )
        .bind(group_id)
        .bind(&state_str)
        .fetch_one(&self.pool)
        .await?;

        let rows: Vec<WorkerRow> = sqlx::query_as::<_, WorkerRow>(
            r#"
            SELECT w.id, w.name, w.group_id, w.status, w.concurrency_limit,
                   w.current_load, w.capabilities, w.metadata,
                   w.last_heartbeat_at, w.created_at,
                   array_agg(wqs.queue_id) FILTER (WHERE wqs.queue_id IS NOT NULL) as subscribed_queues
            FROM vqm_workers w
            LEFT JOIN vqm_worker_queue_subscriptions wqs ON w.id = wqs.worker_id
            WHERE ($1::uuid IS NULL OR w.group_id = $1)
            AND ($2::text IS NULL OR w.status = $2)
            GROUP BY w.id
            ORDER BY w.created_at DESC
            OFFSET $3 LIMIT $4
            "#,
        )
        .bind(group_id)
        .bind(&state_str)
        .bind(offset)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let workers: Vec<WorkerInfo> = rows
            .into_iter()
            .map(|row| WorkerInfo {
                id: row.id,
                name: row.name,
                group_id: row.group_id,
                state: WorkerState::from(row.status),
                subscribed_queues: row.subscribed_queues.unwrap_or_default(),
                max_concurrent: row.concurrency_limit.unwrap_or(1) as u32,
                active_messages: row.current_load.unwrap_or(0) as u32,
                capabilities: row.capabilities.unwrap_or_default(),
                last_heartbeat: row.last_heartbeat_at.unwrap_or(row.created_at),
                registered_at: row.created_at,
                metadata: row.metadata.unwrap_or(serde_json::json!({})),
            })
            .collect();

        Ok((workers, total))
    }

    /// List all workers as summaries for dashboard display
    pub async fn list_all(&self) -> Vec<WorkerSummary> {
        #[derive(Debug, FromRow)]
        struct WorkerSummaryRow {
            id: Uuid,
            name: String,
            status: String,
            concurrency_limit: Option<i32>,
            current_load: Option<i32>,
            total_processed: Option<i64>,
        }

        let rows: Vec<WorkerSummaryRow> = sqlx::query_as::<_, WorkerSummaryRow>(
            r#"
            SELECT w.id, w.name, w.status, w.concurrency_limit, w.current_load,
                   (SELECT COUNT(*) FROM vqm_messages m
                    WHERE m.claimed_by = w.id AND m.status = 'completed') as total_processed
            FROM vqm_workers w
            ORDER BY w.created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .unwrap_or_default();

        rows.into_iter()
            .map(|row| WorkerSummary {
                id: row.id,
                name: row.name,
                status: row.status,
                active_jobs: row.current_load.unwrap_or(0) as u32,
                concurrency: row.concurrency_limit.unwrap_or(1) as u32,
                total_processed: row.total_processed.unwrap_or(0) as u64,
            })
            .collect()
    }

    /// Get worker pool statistics
    pub async fn get_stats(&self) -> Result<WorkerStats, EngineError> {
        let row = sqlx::query(
            r#"
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'idle') as idle,
                COUNT(*) FILTER (WHERE status = 'busy') as busy,
                COUNT(*) FILTER (WHERE status = 'disconnected') as disconnected,
                COALESCE(SUM(concurrency_limit), 0) as total_capacity,
                COALESCE(SUM(current_load), 0) as used_capacity
            FROM vqm_workers
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(WorkerStats {
            total_workers: row.get::<i64, _>("total") as u64,
            active_workers: row.get::<i64, _>("active") as u64,
            idle_workers: row.get::<i64, _>("idle") as u64,
            busy_workers: row.get::<i64, _>("busy") as u64,
            disconnected_workers: row.get::<i64, _>("disconnected") as u64,
            total_capacity: row.get::<i64, _>("total_capacity") as u64,
            used_capacity: row.get::<i64, _>("used_capacity") as u64,
        })
    }

    /// Create a worker group
    pub async fn create_group(&self, group: WorkerGroup) -> Result<WorkerGroup, EngineError> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        sqlx::query(
            r#"
            INSERT INTO vqm_worker_groups (
                id, name, min_workers, max_workers, target_workers,
                auto_scaling_enabled, scale_up_threshold, scale_down_threshold,
                cooldown_period_secs, metadata, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            "#,
        )
        .bind(id)
        .bind(&group.name)
        .bind(group.min_workers as i32)
        .bind(group.max_workers as i32)
        .bind(group.target_workers as i32)
        .bind(group.auto_scaling_enabled)
        .bind(group.scale_up_threshold)
        .bind(group.scale_down_threshold)
        .bind(group.cooldown_secs as i32)
        .bind(&group.metadata)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(WorkerGroup {
            id,
            name: group.name,
            min_workers: group.min_workers,
            max_workers: group.max_workers,
            current_workers: 0,
            target_workers: group.target_workers,
            auto_scaling_enabled: group.auto_scaling_enabled,
            scale_up_threshold: group.scale_up_threshold,
            scale_down_threshold: group.scale_down_threshold,
            cooldown_secs: group.cooldown_secs,
            last_scaled_at: None,
            metadata: group.metadata,
        })
    }

    /// Update worker queue subscriptions
    pub async fn update_subscriptions(
        &self,
        worker_id: Uuid,
        queue_ids: Vec<Uuid>,
    ) -> Result<(), EngineError> {
        // Delete existing subscriptions
        sqlx::query("DELETE FROM vqm_worker_queue_subscriptions WHERE worker_id = $1")
            .bind(worker_id)
            .execute(&self.pool)
            .await?;

        // Insert new subscriptions
        for queue_id in &queue_ids {
            sqlx::query(
                r#"
                INSERT INTO vqm_worker_queue_subscriptions (worker_id, queue_id)
                VALUES ($1, $2)
                "#,
            )
            .bind(worker_id)
            .bind(queue_id)
            .execute(&self.pool)
            .await?;
        }

        // Update cache
        if let Some(worker) = self.workers.write().await.get_mut(&worker_id) {
            worker.subscribed_queues = queue_ids;
        }

        Ok(())
    }

    /// Drain a worker (stop accepting new messages)
    pub async fn drain_worker(&self, worker_id: Uuid) -> Result<(), EngineError> {
        sqlx::query("UPDATE vqm_workers SET status = 'draining' WHERE id = $1")
            .bind(worker_id)
            .execute(&self.pool)
            .await?;

        if let Some(worker) = self.workers.write().await.get_mut(&worker_id) {
            worker.state = WorkerState::Draining;
        }

        Ok(())
    }
}

/// Cleanup stale workers
async fn cleanup_stale_workers(
    pool: &PgPool,
    event_tx: &broadcast::Sender<EngineEvent>,
    stale_threshold_secs: u64,
    workers_cache: &RwLock<HashMap<Uuid, WorkerInfo>>,
) -> Result<(), EngineError> {
    let threshold = Utc::now() - Duration::seconds(stale_threshold_secs as i64);

    // Find stale workers
    let stale_workers: Vec<Uuid> = sqlx::query_scalar::<_, Uuid>(
        r#"
        SELECT id FROM vqm_workers
        WHERE status NOT IN ('disconnected', 'draining')
        AND last_heartbeat_at < $1
        "#,
    )
    .bind(threshold)
    .fetch_all(pool)
    .await?;

    if stale_workers.is_empty() {
        return Ok(());
    }

    // Mark as disconnected
    sqlx::query(
        r#"
        UPDATE vqm_workers
        SET status = 'disconnected'
        WHERE id = ANY($1)
        "#,
    )
    .bind(&stale_workers)
    .execute(pool)
    .await?;

    // Release their claimed messages
    sqlx::query(
        r#"
        UPDATE vqm_messages
        SET status = 'pending',
            claimed_by = NULL,
            processing_started_at = NULL,
            visibility_timeout_at = NULL
        WHERE claimed_by = ANY($1) AND status = 'processing'
        "#,
    )
    .bind(&stale_workers)
    .execute(pool)
    .await?;

    // Update cache and emit events
    let mut cache = workers_cache.write().await;
    for worker_id in stale_workers {
        if let Some(worker) = cache.get_mut(&worker_id) {
            worker.state = WorkerState::Disconnected;
        }

        let _ = event_tx.send(EngineEvent::WorkerDisconnected {
            worker_id,
            reason: "stale heartbeat".to_string(),
        });
    }

    Ok(())
}
