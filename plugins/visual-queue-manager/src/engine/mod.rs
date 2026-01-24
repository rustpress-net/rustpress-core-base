//! Core Queue Engine Module
//!
//! This module contains the core queue processing engine including:
//! - Queue management and operations
//! - Message processing pipeline
//! - Worker pool management
//! - Event dispatching
//! - Job scheduling
//! - Circuit breaker pattern
//! - Retry logic

pub mod queue;
pub mod message;
pub mod worker;
pub mod dispatcher;
pub mod scheduler;
pub mod circuit_breaker;
pub mod retry;
pub mod metrics;
pub mod storage;
pub mod dlq;

use std::sync::Arc;
use std::collections::HashMap;
use tokio::sync::{RwLock, mpsc, broadcast};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

pub use queue::{QueueManager, QueueConfig, QueueState};
pub use message::{MessageProcessor, ProcessingResult, MessageBatch};
pub use worker::{WorkerPool, WorkerConfig, WorkerState, WorkerHandle};
pub use dispatcher::{EventDispatcher, DispatchConfig, DispatchResult};
pub use scheduler::{JobScheduler, ScheduledJob, JobConfig};
pub use circuit_breaker::{CircuitBreaker, CircuitState, CircuitConfig};
pub use retry::{RetryPolicy, RetryStrategy, BackoffCalculator};
pub use metrics::{EngineMetrics, MetricsCollector};
pub use storage::{StorageBackend, PostgresStorage};
pub use dlq::{DeadLetterQueue, DlqPolicy};

/// Core engine configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineConfig {
    /// Maximum concurrent message processing
    pub max_concurrent_processing: usize,
    /// Default message timeout in seconds
    pub default_message_timeout_secs: u64,
    /// Worker heartbeat interval in seconds
    pub worker_heartbeat_interval_secs: u64,
    /// Stale worker threshold in seconds
    pub stale_worker_threshold_secs: u64,
    /// Metrics collection interval in seconds
    pub metrics_interval_secs: u64,
    /// Enable dead letter queue
    pub enable_dlq: bool,
    /// Maximum retry attempts
    pub max_retry_attempts: u32,
    /// Base retry delay in milliseconds
    pub base_retry_delay_ms: u64,
    /// Enable circuit breaker
    pub enable_circuit_breaker: bool,
    /// Circuit breaker failure threshold
    pub circuit_breaker_threshold: u32,
    /// Circuit breaker reset timeout in seconds
    pub circuit_breaker_reset_secs: u64,
    /// Batch size for processing
    pub batch_size: usize,
    /// Cleanup interval for old messages in hours
    pub cleanup_interval_hours: u64,
    /// Message retention days
    pub message_retention_days: u32,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            max_concurrent_processing: 100,
            default_message_timeout_secs: 300,
            worker_heartbeat_interval_secs: 30,
            stale_worker_threshold_secs: 90,
            metrics_interval_secs: 10,
            enable_dlq: true,
            max_retry_attempts: 3,
            base_retry_delay_ms: 1000,
            enable_circuit_breaker: true,
            circuit_breaker_threshold: 5,
            circuit_breaker_reset_secs: 60,
            batch_size: 100,
            cleanup_interval_hours: 24,
            message_retention_days: 30,
        }
    }
}

/// Engine event for internal communication
#[derive(Debug, Clone)]
pub enum EngineEvent {
    /// Message enqueued
    MessageEnqueued {
        queue_id: Uuid,
        message_id: Uuid,
        priority: i32,
    },
    /// Message processing started
    MessageProcessingStarted {
        queue_id: Uuid,
        message_id: Uuid,
        worker_id: Uuid,
    },
    /// Message processed successfully
    MessageProcessed {
        queue_id: Uuid,
        message_id: Uuid,
        processing_time_ms: u64,
    },
    /// Message processing failed
    MessageFailed {
        queue_id: Uuid,
        message_id: Uuid,
        error: String,
        will_retry: bool,
    },
    /// Message moved to DLQ
    MessageMovedToDlq {
        queue_id: Uuid,
        message_id: Uuid,
        reason: String,
    },
    /// Worker registered
    WorkerRegistered {
        worker_id: Uuid,
        group_id: Option<Uuid>,
    },
    /// Worker heartbeat received
    WorkerHeartbeat {
        worker_id: Uuid,
        active_messages: u32,
    },
    /// Worker disconnected
    WorkerDisconnected {
        worker_id: Uuid,
        reason: String,
    },
    /// Queue created
    QueueCreated {
        queue_id: Uuid,
        name: String,
    },
    /// Queue paused
    QueuePaused {
        queue_id: Uuid,
    },
    /// Queue resumed
    QueueResumed {
        queue_id: Uuid,
    },
    /// Circuit breaker state changed
    CircuitBreakerStateChanged {
        handler_id: Uuid,
        old_state: CircuitState,
        new_state: CircuitState,
    },
    /// Scheduled job executed
    ScheduledJobExecuted {
        job_id: Uuid,
        success: bool,
    },
    /// Alert triggered
    AlertTriggered {
        alert_id: Uuid,
        message: String,
    },
}

/// The main queue engine that orchestrates all components
pub struct QueueEngine {
    /// Database pool
    pool: PgPool,
    /// Engine configuration
    config: EngineConfig,
    /// Queue manager
    queue_manager: Arc<QueueManager>,
    /// Message processor
    message_processor: Arc<MessageProcessor>,
    /// Worker pool
    worker_pool: Arc<WorkerPool>,
    /// Event dispatcher
    event_dispatcher: Arc<EventDispatcher>,
    /// Job scheduler
    job_scheduler: Arc<JobScheduler>,
    /// Metrics collector
    metrics: Arc<MetricsCollector>,
    /// Dead letter queue handler
    dlq: Arc<DeadLetterQueue>,
    /// Event broadcast channel
    event_tx: broadcast::Sender<EngineEvent>,
    /// Shutdown signal
    shutdown_tx: mpsc::Sender<()>,
    /// Running state
    running: Arc<RwLock<bool>>,
}

impl QueueEngine {
    /// Create a new queue engine
    pub async fn new(pool: PgPool, config: EngineConfig) -> Result<Self, EngineError> {
        let (event_tx, _) = broadcast::channel(10000);
        let (shutdown_tx, _shutdown_rx) = mpsc::channel(1);

        let storage = Arc::new(PostgresStorage::new(pool.clone()));

        let queue_manager = Arc::new(QueueManager::new(
            pool.clone(),
            storage.clone(),
            event_tx.clone(),
        ));

        let retry_policy = RetryPolicy::new(
            config.max_retry_attempts,
            RetryStrategy::ExponentialBackoff {
                base_delay_ms: config.base_retry_delay_ms,
                max_delay_ms: config.base_retry_delay_ms * 64,
                multiplier: 2.0,
            },
        );

        let message_processor = Arc::new(MessageProcessor::new(
            pool.clone(),
            storage.clone(),
            retry_policy,
            event_tx.clone(),
            config.batch_size,
        ));

        let worker_pool = Arc::new(WorkerPool::new(
            pool.clone(),
            event_tx.clone(),
            config.worker_heartbeat_interval_secs,
            config.stale_worker_threshold_secs,
        ));

        let event_dispatcher = Arc::new(EventDispatcher::new(
            pool.clone(),
            event_tx.clone(),
            config.enable_circuit_breaker,
            config.circuit_breaker_threshold,
            config.circuit_breaker_reset_secs,
        ));

        let job_scheduler = Arc::new(JobScheduler::new(
            pool.clone(),
            event_tx.clone(),
        ));

        let metrics = Arc::new(MetricsCollector::new(
            pool.clone(),
            config.metrics_interval_secs,
        ));

        let dlq = Arc::new(DeadLetterQueue::new(
            pool.clone(),
            storage.clone(),
            event_tx.clone(),
        ));

        Ok(Self {
            pool,
            config,
            queue_manager,
            message_processor,
            worker_pool,
            event_dispatcher,
            job_scheduler,
            metrics,
            dlq,
            event_tx,
            shutdown_tx,
            running: Arc::new(RwLock::new(false)),
        })
    }

    /// Start the queue engine
    pub async fn start(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        if *running {
            return Err(EngineError::AlreadyRunning);
        }
        *running = true;
        drop(running);

        // Start all components
        self.worker_pool.start().await?;
        self.job_scheduler.start().await?;
        self.metrics.start().await?;

        // Start the main processing loop
        self.start_processing_loop().await?;

        // Start cleanup task
        self.start_cleanup_task().await?;

        tracing::info!("Queue engine started successfully");
        Ok(())
    }

    /// Stop the queue engine
    pub async fn stop(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        if !*running {
            return Ok(());
        }
        *running = false;
        drop(running);

        // Send shutdown signal
        let _ = self.shutdown_tx.send(()).await;

        // Stop all components
        self.worker_pool.stop().await?;
        self.job_scheduler.stop().await?;
        self.metrics.stop().await?;

        tracing::info!("Queue engine stopped");
        Ok(())
    }

    /// Start the main message processing loop
    async fn start_processing_loop(&self) -> Result<(), EngineError> {
        let processor = self.message_processor.clone();
        let worker_pool = self.worker_pool.clone();
        let dispatcher = self.event_dispatcher.clone();
        let dlq = self.dlq.clone();
        let running = self.running.clone();
        let config = self.config.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(
                tokio::time::Duration::from_millis(100)
            );

            loop {
                interval.tick().await;

                if !*running.read().await {
                    break;
                }

                // Get available workers
                let available_workers = match worker_pool.get_available_workers().await {
                    Ok(workers) => workers,
                    Err(e) => {
                        tracing::error!("Failed to get available workers: {}", e);
                        continue;
                    }
                };

                if available_workers.is_empty() {
                    continue;
                }

                // Process messages for each available worker
                for worker in available_workers.iter().take(config.max_concurrent_processing) {
                    let processor = processor.clone();
                    let dispatcher = dispatcher.clone();
                    let dlq = dlq.clone();
                    let worker_id = worker.id;
                    let queue_ids = worker.subscribed_queues.clone();

                    tokio::spawn(async move {
                        if let Err(e) = process_worker_messages(
                            processor,
                            dispatcher,
                            dlq,
                            worker_id,
                            queue_ids,
                        ).await {
                            tracing::error!(
                                "Error processing messages for worker {}: {}",
                                worker_id,
                                e
                            );
                        }
                    });
                }
            }
        });

        Ok(())
    }

    /// Start the cleanup task
    async fn start_cleanup_task(&self) -> Result<(), EngineError> {
        let pool = self.pool.clone();
        let running = self.running.clone();
        let retention_days = self.config.message_retention_days;
        let cleanup_interval = self.config.cleanup_interval_hours;

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(
                tokio::time::Duration::from_secs(cleanup_interval * 3600)
            );

            loop {
                interval.tick().await;

                if !*running.read().await {
                    break;
                }

                if let Err(e) = cleanup_old_messages(&pool, retention_days).await {
                    tracing::error!("Failed to cleanup old messages: {}", e);
                }
            }
        });

        Ok(())
    }

    /// Get the queue manager
    pub fn queue_manager(&self) -> Arc<QueueManager> {
        self.queue_manager.clone()
    }

    /// Get the message processor
    pub fn message_processor(&self) -> Arc<MessageProcessor> {
        self.message_processor.clone()
    }

    /// Get the worker pool
    pub fn worker_pool(&self) -> Arc<WorkerPool> {
        self.worker_pool.clone()
    }

    /// Get the event dispatcher
    pub fn event_dispatcher(&self) -> Arc<EventDispatcher> {
        self.event_dispatcher.clone()
    }

    /// Get the job scheduler
    pub fn job_scheduler(&self) -> Arc<JobScheduler> {
        self.job_scheduler.clone()
    }

    /// Get the metrics collector
    pub fn metrics(&self) -> Arc<MetricsCollector> {
        self.metrics.clone()
    }

    /// Get the DLQ handler
    pub fn dlq(&self) -> Arc<DeadLetterQueue> {
        self.dlq.clone()
    }

    /// Subscribe to engine events
    pub fn subscribe_events(&self) -> broadcast::Receiver<EngineEvent> {
        self.event_tx.subscribe()
    }

    /// Get engine statistics
    pub async fn get_stats(&self) -> Result<EngineStats, EngineError> {
        let queue_stats = self.queue_manager.get_all_stats().await?;
        let worker_stats = self.worker_pool.get_stats().await?;
        let processor_stats = self.message_processor.get_stats().await?;

        Ok(EngineStats {
            total_queues: queue_stats.total_queues,
            active_queues: queue_stats.active_queues,
            total_messages: queue_stats.total_messages,
            pending_messages: queue_stats.pending_messages,
            processing_messages: queue_stats.processing_messages,
            total_workers: worker_stats.total_workers,
            active_workers: worker_stats.active_workers,
            messages_per_second: processor_stats.messages_per_second,
            avg_processing_time_ms: processor_stats.avg_processing_time_ms,
            error_rate: processor_stats.error_rate,
            uptime_secs: processor_stats.uptime_secs,
        })
    }
}

/// Process messages for a specific worker
async fn process_worker_messages(
    processor: Arc<MessageProcessor>,
    dispatcher: Arc<EventDispatcher>,
    dlq: Arc<DeadLetterQueue>,
    worker_id: Uuid,
    queue_ids: Vec<Uuid>,
) -> Result<(), EngineError> {
    // Claim messages for the worker
    let messages = processor.claim_messages(worker_id, &queue_ids, 10).await?;

    for message in messages {
        let result = dispatcher.dispatch_message(&message).await;

        match result {
            Ok(DispatchResult::Success) => {
                processor.acknowledge(message.id, worker_id).await?;
            }
            Ok(DispatchResult::Retry { delay_ms }) => {
                processor.schedule_retry(message.id, delay_ms).await?;
            }
            Ok(DispatchResult::MoveToDlq { reason }) => {
                dlq.move_message(message.id, &reason).await?;
            }
            Err(e) => {
                processor.negative_acknowledge(
                    message.id,
                    worker_id,
                    &e.to_string(),
                ).await?;
            }
        }
    }

    Ok(())
}

/// Cleanup old messages from the database
async fn cleanup_old_messages(pool: &PgPool, retention_days: u32) -> Result<u64, EngineError> {
    let result = sqlx::query(
        r#"
        DELETE FROM vqm_messages
        WHERE status IN ('completed', 'failed', 'dead_letter')
        AND updated_at < NOW() - INTERVAL '1 day' * $1
        "#,
    )
    .bind(retention_days as i32)
    .execute(pool)
    .await?;

    let deleted = result.rows_affected();
    if deleted > 0 {
        tracing::info!("Cleaned up {} old messages", deleted);
    }

    Ok(deleted)
}

/// Engine statistics
#[derive(Debug, Clone, Serialize)]
pub struct EngineStats {
    pub total_queues: u64,
    pub active_queues: u64,
    pub total_messages: u64,
    pub pending_messages: u64,
    pub processing_messages: u64,
    pub total_workers: u64,
    pub active_workers: u64,
    pub messages_per_second: f64,
    pub avg_processing_time_ms: f64,
    pub error_rate: f64,
    pub uptime_secs: u64,
}

/// Engine error types
#[derive(Debug, thiserror::Error)]
pub enum EngineError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Engine is already running")]
    AlreadyRunning,

    #[error("Engine is not running")]
    NotRunning,

    #[error("Queue not found: {0}")]
    QueueNotFound(Uuid),

    #[error("Message not found: {0}")]
    MessageNotFound(Uuid),

    #[error("Worker not found: {0}")]
    WorkerNotFound(Uuid),

    #[error("Handler not found: {0}")]
    HandlerNotFound(Uuid),

    #[error("Circuit breaker open for handler: {0}")]
    CircuitBreakerOpen(Uuid),

    #[error("Message timeout")]
    MessageTimeout,

    #[error("Retry limit exceeded")]
    RetryLimitExceeded,

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("Dispatch error: {0}")]
    DispatchError(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Internal error: {0}")]
    Internal(String),
}
