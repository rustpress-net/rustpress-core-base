//! Engine Metrics Module
//!
//! Collects and aggregates metrics for monitoring and alerting.

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Row type for message statistics query
#[derive(Debug, FromRow)]
struct MessageStatsRow {
    completed: i64,
    failed: i64,
    pending: i64,
    dlq: i64,
    avg_time: Option<f64>,
}

/// Row type for worker statistics query
#[derive(Debug, FromRow)]
struct WorkerStatsRow {
    active: i64,
}

/// Row type for queue metrics query
#[derive(Debug, FromRow)]
struct QueueMetricsRow {
    id: Uuid,
    name: String,
    pending: i64,
    processing: i64,
    completed: i64,
    failed: i64,
    dlq: i64,
    avg_time: Option<f64>,
}

/// Row type for time series query
#[derive(Debug, FromRow)]
struct TimeSeriesRow {
    bucket: DateTime<Utc>,
    avg: Option<f64>,
    sum: Option<f64>,
    min: Option<f64>,
    max: Option<f64>,
    count: i64,
}

use super::EngineError;

/// Metric type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MetricType {
    Counter,
    Gauge,
    Histogram,
    Summary,
}

/// Metric data point
#[derive(Debug, Clone, Serialize)]
pub struct MetricDataPoint {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
    pub labels: HashMap<String, String>,
}

/// Aggregated metrics
#[derive(Debug, Clone, Serialize)]
pub struct EngineMetrics {
    /// Total messages processed
    pub total_messages_processed: u64,
    /// Total messages failed
    pub total_messages_failed: u64,
    /// Messages per second (current rate)
    pub messages_per_second: f64,
    /// Average processing time in milliseconds
    pub avg_processing_time_ms: f64,
    /// P50 processing time
    pub p50_processing_time_ms: f64,
    /// P95 processing time
    pub p95_processing_time_ms: f64,
    /// P99 processing time
    pub p99_processing_time_ms: f64,
    /// Error rate (0.0 - 1.0)
    pub error_rate: f64,
    /// Active workers count
    pub active_workers: u64,
    /// Queue depth (total pending messages)
    pub queue_depth: u64,
    /// DLQ depth
    pub dlq_depth: u64,
    /// Memory usage bytes
    pub memory_usage_bytes: u64,
    /// CPU usage percentage
    pub cpu_usage_percent: f64,
    /// Uptime in seconds
    pub uptime_secs: u64,
    /// Timestamp of metrics collection
    pub collected_at: DateTime<Utc>,
}

/// Queue-specific metrics
#[derive(Debug, Clone, Serialize)]
pub struct QueueMetrics {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub pending_messages: u64,
    pub processing_messages: u64,
    pub completed_messages: u64,
    pub failed_messages: u64,
    pub dlq_messages: u64,
    pub messages_per_minute: f64,
    pub avg_processing_time_ms: f64,
    pub oldest_message_age_secs: Option<u64>,
    pub throughput_trend: ThroughputTrend,
}

/// Throughput trend indicator
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ThroughputTrend {
    Increasing,
    Stable,
    Decreasing,
}

/// Worker metrics
#[derive(Debug, Clone, Serialize)]
pub struct WorkerMetrics {
    pub worker_id: Uuid,
    pub worker_name: String,
    pub current_load: u32,
    pub max_capacity: u32,
    pub messages_processed: u64,
    pub messages_failed: u64,
    pub avg_processing_time_ms: f64,
    pub last_heartbeat_ago_secs: u64,
}

/// Handler metrics
#[derive(Debug, Clone, Serialize)]
pub struct HandlerMetrics {
    pub handler_id: Uuid,
    pub handler_name: String,
    pub total_calls: u64,
    pub successful_calls: u64,
    pub failed_calls: u64,
    pub avg_latency_ms: f64,
    pub circuit_breaker_state: String,
    pub error_rate: f64,
}

/// Time series data for historical metrics
#[derive(Debug, Clone, Serialize)]
pub struct TimeSeriesData {
    pub metric_name: String,
    pub data_points: Vec<MetricDataPoint>,
    pub interval_secs: u64,
    pub aggregation: AggregationType,
}

/// Aggregation type for time series
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AggregationType {
    Sum,
    Avg,
    Min,
    Max,
    Count,
    Rate,
}

/// Metrics snapshot for dashboard
#[derive(Debug, Clone, Serialize)]
pub struct MetricsSnapshot {
    pub total_queues: u64,
    pub throughput: ThroughputSnapshot,
    pub workers: WorkersSnapshot,
    pub error_rate: f64,
}

/// Throughput snapshot data
#[derive(Debug, Clone, Serialize)]
pub struct ThroughputSnapshot {
    pub messages_per_second: f64,
}

/// Workers snapshot data
#[derive(Debug, Clone, Serialize)]
pub struct WorkersSnapshot {
    pub active: u64,
    pub total: u64,
}

/// Throughput history data point
#[derive(Debug, Clone, Serialize)]
pub struct ThroughputHistoryPoint {
    pub timestamp: String,
    pub enqueued: i64,
    pub processed: i64,
}

/// Metrics collector for the engine
pub struct MetricsCollector {
    pool: PgPool,
    interval_secs: u64,
    running: Arc<RwLock<bool>>,
    start_time: Instant,
    /// In-memory metric counters
    counters: RwLock<HashMap<String, u64>>,
    /// In-memory gauges
    gauges: RwLock<HashMap<String, f64>>,
    /// Processing time samples for percentile calculation
    processing_times: RwLock<Vec<f64>>,
}

impl MetricsCollector {
    /// Create a new metrics collector
    pub fn new(pool: PgPool, interval_secs: u64) -> Self {
        Self {
            pool,
            interval_secs,
            running: Arc::new(RwLock::new(false)),
            start_time: Instant::now(),
            counters: RwLock::new(HashMap::new()),
            gauges: RwLock::new(HashMap::new()),
            processing_times: RwLock::new(Vec::with_capacity(10000)),
        }
    }

    /// Start metrics collection
    pub async fn start(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        if *running {
            return Ok(());
        }
        *running = true;
        drop(running);

        // Start periodic collection task
        self.start_collection_task().await;

        tracing::info!("Metrics collector started");
        Ok(())
    }

    /// Stop metrics collection
    pub async fn stop(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        *running = false;
        tracing::info!("Metrics collector stopped");
        Ok(())
    }

    /// Start periodic metrics collection
    async fn start_collection_task(&self) {
        let pool = self.pool.clone();
        let running = self.running.clone();
        let interval = self.interval_secs;

        tokio::spawn(async move {
            let mut ticker = tokio::time::interval(tokio::time::Duration::from_secs(interval));

            loop {
                ticker.tick().await;

                if !*running.read().await {
                    break;
                }

                if let Err(e) = collect_and_store_metrics(&pool).await {
                    tracing::error!("Failed to collect metrics: {}", e);
                }
            }
        });
    }

    /// Record a counter increment
    pub async fn increment_counter(&self, name: &str, value: u64) {
        let mut counters = self.counters.write().await;
        *counters.entry(name.to_string()).or_insert(0) += value;
    }

    /// Set a gauge value
    pub async fn set_gauge(&self, name: &str, value: f64) {
        let mut gauges = self.gauges.write().await;
        gauges.insert(name.to_string(), value);
    }

    /// Record a processing time sample
    pub async fn record_processing_time(&self, time_ms: f64) {
        let mut times = self.processing_times.write().await;
        times.push(time_ms);

        // Keep only last 10000 samples
        if times.len() > 10000 {
            times.drain(0..5000);
        }
    }

    /// Get current engine metrics
    pub async fn get_metrics(&self) -> Result<EngineMetrics, EngineError> {
        let message_stats: MessageStatsRow = sqlx::query_as::<_, MessageStatsRow>(
            r#"
            SELECT
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'failed') as failed,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'dead_letter') as dlq,
                AVG(EXTRACT(EPOCH FROM (completed_at - processing_started_at)) * 1000)
                    FILTER (WHERE completed_at IS NOT NULL) as avg_time
            FROM vqm_messages
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        let worker_stats: WorkerStatsRow = sqlx::query_as::<_, WorkerStatsRow>(
            r#"
            SELECT COUNT(*) FILTER (WHERE status IN ('active', 'idle', 'busy')) as active
            FROM vqm_workers
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        // Calculate messages per second (last minute)
        let recent_count: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE completed_at > NOW() - INTERVAL '1 minute'
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        let messages_per_second = recent_count as f64 / 60.0;

        // Calculate percentiles from in-memory samples
        let times = self.processing_times.read().await;
        let (p50, p95, p99) = calculate_percentiles(&times);

        let total = message_stats.completed + message_stats.failed;
        let error_rate = if total > 0 {
            message_stats.failed as f64 / total as f64
        } else {
            0.0
        };

        Ok(EngineMetrics {
            total_messages_processed: message_stats.completed as u64,
            total_messages_failed: message_stats.failed as u64,
            messages_per_second,
            avg_processing_time_ms: message_stats.avg_time.unwrap_or(0.0),
            p50_processing_time_ms: p50,
            p95_processing_time_ms: p95,
            p99_processing_time_ms: p99,
            error_rate,
            active_workers: worker_stats.active as u64,
            queue_depth: message_stats.pending as u64,
            dlq_depth: message_stats.dlq as u64,
            memory_usage_bytes: get_memory_usage(),
            cpu_usage_percent: 0.0, // Would need system-specific implementation
            uptime_secs: self.start_time.elapsed().as_secs(),
            collected_at: Utc::now(),
        })
    }

    /// Get metrics for all queues
    pub async fn get_queue_metrics(&self) -> Result<Vec<QueueMetrics>, EngineError> {
        let rows: Vec<QueueMetricsRow> = sqlx::query_as::<_, QueueMetricsRow>(
            r#"
            SELECT
                q.id,
                q.name,
                COUNT(*) FILTER (WHERE m.status = 'pending') as pending,
                COUNT(*) FILTER (WHERE m.status = 'processing') as processing,
                COUNT(*) FILTER (WHERE m.status = 'completed') as completed,
                COUNT(*) FILTER (WHERE m.status = 'failed') as failed,
                COUNT(*) FILTER (WHERE m.status = 'dead_letter') as dlq,
                AVG(EXTRACT(EPOCH FROM (m.completed_at - m.processing_started_at)) * 1000)
                    FILTER (WHERE m.completed_at IS NOT NULL) as avg_time
            FROM vqm_queues q
            LEFT JOIN vqm_messages m ON q.id = m.queue_id
            GROUP BY q.id, q.name
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        let mut metrics = Vec::new();
        for row in rows {
            // Calculate messages per minute for this queue
            let recent_count: i64 = sqlx::query_scalar::<_, i64>(
                r#"
                SELECT COUNT(*) FROM vqm_messages
                WHERE queue_id = $1 AND created_at > NOW() - INTERVAL '5 minutes'
                "#,
            )
            .bind(row.id)
            .fetch_one(&self.pool)
            .await?;

            let messages_per_minute = recent_count as f64 / 5.0;

            // Determine throughput trend
            let older_count: i64 = sqlx::query_scalar::<_, i64>(
                r#"
                SELECT COUNT(*) FROM vqm_messages
                WHERE queue_id = $1
                AND created_at > NOW() - INTERVAL '10 minutes'
                AND created_at <= NOW() - INTERVAL '5 minutes'
                "#,
            )
            .bind(row.id)
            .fetch_one(&self.pool)
            .await?;

            let trend = if recent_count > (older_count as f64 * 1.1) as i64 {
                ThroughputTrend::Increasing
            } else if recent_count < (older_count as f64 * 0.9) as i64 {
                ThroughputTrend::Decreasing
            } else {
                ThroughputTrend::Stable
            };

            // Get oldest pending message age
            let oldest: Option<DateTime<Utc>> = sqlx::query_scalar::<_, Option<DateTime<Utc>>>(
                r#"
                SELECT MIN(created_at)
                FROM vqm_messages
                WHERE queue_id = $1 AND status = 'pending'
                "#,
            )
            .bind(row.id)
            .fetch_one(&self.pool)
            .await?;

            let oldest_age = oldest.map(|t| (Utc::now() - t).num_seconds() as u64);

            metrics.push(QueueMetrics {
                queue_id: row.id,
                queue_name: row.name,
                pending_messages: row.pending as u64,
                processing_messages: row.processing as u64,
                completed_messages: row.completed as u64,
                failed_messages: row.failed as u64,
                dlq_messages: row.dlq as u64,
                messages_per_minute,
                avg_processing_time_ms: row.avg_time.unwrap_or(0.0),
                oldest_message_age_secs: oldest_age,
                throughput_trend: trend,
            });
        }

        Ok(metrics)
    }

    /// Get historical time series data
    pub async fn get_time_series(
        &self,
        metric_name: &str,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        interval_secs: u64,
        aggregation: AggregationType,
    ) -> Result<TimeSeriesData, EngineError> {
        let rows: Vec<TimeSeriesRow> = sqlx::query_as::<_, TimeSeriesRow>(
            r#"
            SELECT
                time_bucket($4::interval, recorded_at) as bucket,
                AVG(value) as avg,
                SUM(value) as sum,
                MIN(value) as min,
                MAX(value) as max,
                COUNT(*) as count
            FROM vqm_metrics_history
            WHERE metric_name = $1
            AND recorded_at BETWEEN $2 AND $3
            GROUP BY bucket
            ORDER BY bucket
            "#,
        )
        .bind(metric_name)
        .bind(start_time)
        .bind(end_time)
        .bind(format!("{} seconds", interval_secs))
        .fetch_all(&self.pool)
        .await?;

        let data_points: Vec<MetricDataPoint> = rows
            .into_iter()
            .map(|row| {
                let value = match aggregation {
                    AggregationType::Avg => row.avg.unwrap_or(0.0),
                    AggregationType::Sum => row.sum.unwrap_or(0.0),
                    AggregationType::Min => row.min.unwrap_or(0.0),
                    AggregationType::Max => row.max.unwrap_or(0.0),
                    AggregationType::Count => row.count as f64,
                    AggregationType::Rate => row.sum.unwrap_or(0.0) / interval_secs as f64,
                };

                MetricDataPoint {
                    timestamp: row.bucket,
                    value,
                    labels: HashMap::new(),
                }
            })
            .collect();

        Ok(TimeSeriesData {
            metric_name: metric_name.to_string(),
            data_points,
            interval_secs,
            aggregation,
        })
    }

    /// Export metrics in Prometheus format
    pub async fn export_prometheus(&self) -> Result<String, EngineError> {
        let metrics = self.get_metrics().await?;
        let queue_metrics = self.get_queue_metrics().await?;

        let mut output = String::new();

        // Engine metrics
        output.push_str("# HELP vqm_messages_processed_total Total messages processed\n");
        output.push_str("# TYPE vqm_messages_processed_total counter\n");
        output.push_str(&format!(
            "vqm_messages_processed_total {}\n",
            metrics.total_messages_processed
        ));

        output.push_str("# HELP vqm_messages_failed_total Total messages failed\n");
        output.push_str("# TYPE vqm_messages_failed_total counter\n");
        output.push_str(&format!(
            "vqm_messages_failed_total {}\n",
            metrics.total_messages_failed
        ));

        output.push_str("# HELP vqm_messages_per_second Current message throughput\n");
        output.push_str("# TYPE vqm_messages_per_second gauge\n");
        output.push_str(&format!(
            "vqm_messages_per_second {:.2}\n",
            metrics.messages_per_second
        ));

        output.push_str("# HELP vqm_processing_time_ms Processing time in milliseconds\n");
        output.push_str("# TYPE vqm_processing_time_ms summary\n");
        output.push_str(&format!(
            "vqm_processing_time_ms{{quantile=\"0.5\"}} {:.2}\n",
            metrics.p50_processing_time_ms
        ));
        output.push_str(&format!(
            "vqm_processing_time_ms{{quantile=\"0.95\"}} {:.2}\n",
            metrics.p95_processing_time_ms
        ));
        output.push_str(&format!(
            "vqm_processing_time_ms{{quantile=\"0.99\"}} {:.2}\n",
            metrics.p99_processing_time_ms
        ));

        output.push_str("# HELP vqm_error_rate Current error rate\n");
        output.push_str("# TYPE vqm_error_rate gauge\n");
        output.push_str(&format!("vqm_error_rate {:.4}\n", metrics.error_rate));

        output.push_str("# HELP vqm_active_workers Number of active workers\n");
        output.push_str("# TYPE vqm_active_workers gauge\n");
        output.push_str(&format!("vqm_active_workers {}\n", metrics.active_workers));

        output.push_str("# HELP vqm_queue_depth Total pending messages\n");
        output.push_str("# TYPE vqm_queue_depth gauge\n");
        output.push_str(&format!("vqm_queue_depth {}\n", metrics.queue_depth));

        output.push_str("# HELP vqm_dlq_depth Dead letter queue depth\n");
        output.push_str("# TYPE vqm_dlq_depth gauge\n");
        output.push_str(&format!("vqm_dlq_depth {}\n", metrics.dlq_depth));

        output.push_str("# HELP vqm_uptime_seconds Engine uptime in seconds\n");
        output.push_str("# TYPE vqm_uptime_seconds counter\n");
        output.push_str(&format!("vqm_uptime_seconds {}\n", metrics.uptime_secs));

        // Per-queue metrics
        output.push_str("\n# HELP vqm_queue_pending Pending messages per queue\n");
        output.push_str("# TYPE vqm_queue_pending gauge\n");
        for qm in &queue_metrics {
            output.push_str(&format!(
                "vqm_queue_pending{{queue=\"{}\"}} {}\n",
                qm.queue_name, qm.pending_messages
            ));
        }

        output.push_str("\n# HELP vqm_queue_processing Processing messages per queue\n");
        output.push_str("# TYPE vqm_queue_processing gauge\n");
        for qm in &queue_metrics {
            output.push_str(&format!(
                "vqm_queue_processing{{queue=\"{}\"}} {}\n",
                qm.queue_name, qm.processing_messages
            ));
        }

        Ok(output)
    }

    /// Get a snapshot of metrics for dashboard
    pub async fn get_snapshot(&self) -> MetricsSnapshot {
        // Get queue count
        let total_queues: i64 = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM vqm_queues")
            .fetch_one(&self.pool)
            .await
            .unwrap_or(0);

        // Get messages per second (last minute)
        let recent_count: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE completed_at > NOW() - INTERVAL '1 minute'
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .unwrap_or(0);

        let messages_per_second = recent_count as f64 / 60.0;

        // Get worker counts
        let active_workers: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_workers
            WHERE status IN ('active', 'busy')
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .unwrap_or(0);

        let total_workers: i64 = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM vqm_workers")
            .fetch_one(&self.pool)
            .await
            .unwrap_or(0);

        // Calculate error rate
        let message_stats: Option<(i64, i64)> = sqlx::query_as::<_, (i64, i64)>(
            r#"
            SELECT
                COUNT(*) FILTER (WHERE status = 'completed'),
                COUNT(*) FILTER (WHERE status = 'failed')
            FROM vqm_messages
            "#,
        )
        .fetch_optional(&self.pool)
        .await
        .ok()
        .flatten();

        let error_rate = match message_stats {
            Some((completed, failed)) => {
                let total = completed + failed;
                if total > 0 {
                    failed as f64 / total as f64
                } else {
                    0.0
                }
            }
            None => 0.0,
        };

        MetricsSnapshot {
            total_queues: total_queues as u64,
            throughput: ThroughputSnapshot {
                messages_per_second,
            },
            workers: WorkersSnapshot {
                active: active_workers as u64,
                total: total_workers as u64,
            },
            error_rate,
        }
    }

    /// Get throughput history for the last N hours
    pub async fn get_throughput_history(&self, hours: i32) -> Vec<ThroughputHistoryPoint> {
        #[derive(Debug, FromRow)]
        struct HistoryRow {
            bucket: DateTime<Utc>,
            enqueued: i64,
            processed: i64,
        }

        let rows: Vec<HistoryRow> = sqlx::query_as::<_, HistoryRow>(
            r#"
            SELECT
                date_trunc('hour', created_at) as bucket,
                COUNT(*) as enqueued,
                COUNT(*) FILTER (WHERE status = 'completed') as processed
            FROM vqm_messages
            WHERE created_at > NOW() - ($1 || ' hours')::interval
            GROUP BY bucket
            ORDER BY bucket
            "#,
        )
        .bind(hours)
        .fetch_all(&self.pool)
        .await
        .unwrap_or_default();

        rows.into_iter()
            .map(|row| ThroughputHistoryPoint {
                timestamp: row.bucket.format("%H:%M").to_string(),
                enqueued: row.enqueued,
                processed: row.processed,
            })
            .collect()
    }
}

/// Collect and store metrics to database
async fn collect_and_store_metrics(pool: &PgPool) -> Result<(), EngineError> {
    let now = Utc::now();

    // Collect message throughput
    let throughput: i64 = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*) FROM vqm_messages
        WHERE completed_at > NOW() - INTERVAL '1 minute'
        "#,
    )
    .fetch_one(pool)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO vqm_metrics_history (metric_name, value, labels, recorded_at)
        VALUES ('messages_per_minute', $1, '{}', $2)
        "#,
    )
    .bind(throughput as f64)
    .bind(now)
    .execute(pool)
    .await?;

    // Collect queue depth
    let queue_depth: i64 = sqlx::query_scalar::<_, i64>(
        r#"SELECT COUNT(*) FROM vqm_messages WHERE status = 'pending'"#,
    )
    .fetch_one(pool)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO vqm_metrics_history (metric_name, value, labels, recorded_at)
        VALUES ('queue_depth', $1, '{}', $2)
        "#,
    )
    .bind(queue_depth as f64)
    .bind(now)
    .execute(pool)
    .await?;

    // Collect active workers
    let workers: i64 = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*) FROM vqm_workers
        WHERE status IN ('active', 'idle', 'busy')
        "#,
    )
    .fetch_one(pool)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO vqm_metrics_history (metric_name, value, labels, recorded_at)
        VALUES ('active_workers', $1, '{}', $2)
        "#,
    )
    .bind(workers as f64)
    .bind(now)
    .execute(pool)
    .await?;

    Ok(())
}

/// Calculate percentiles from a slice of values
fn calculate_percentiles(values: &[f64]) -> (f64, f64, f64) {
    if values.is_empty() {
        return (0.0, 0.0, 0.0);
    }

    let mut sorted = values.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

    let len = sorted.len();
    let p50_idx = (len as f64 * 0.50) as usize;
    let p95_idx = (len as f64 * 0.95) as usize;
    let p99_idx = (len as f64 * 0.99) as usize;

    (
        sorted.get(p50_idx).copied().unwrap_or(0.0),
        sorted.get(p95_idx.min(len - 1)).copied().unwrap_or(0.0),
        sorted.get(p99_idx.min(len - 1)).copied().unwrap_or(0.0),
    )
}

/// Get current process memory usage
fn get_memory_usage() -> u64 {
    // This is a simplified implementation
    // In production, you'd use a system-specific API
    0
}
