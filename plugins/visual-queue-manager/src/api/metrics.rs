// =============================================================================
// Visual Queue Manager - Metrics API Endpoints
// =============================================================================
// REST API endpoints for metrics, monitoring, and alerting.
// Points 29-31: Metrics collection, dashboards, and alerts
// =============================================================================

use axum::{
    extract::{Extension, Json, Path, Query},
    http::StatusCode,
    routing::{delete, get, post, put},
    Router,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use super::{
    parse_uuid, validate_request, ApiError, ApiResponse, AppError, AuthUser, DateRangeParams,
    PaginationParams, ResponseMeta,
};
use crate::VisualQueueManager;

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

pub fn router() -> Router {
    Router::new()
        // Dashboard overview
        .route("/dashboard", get(get_dashboard))
        // Real-time metrics
        .route("/realtime", get(get_realtime_metrics))
        // Historical metrics
        .route("/historical", get(get_historical_metrics))
        // Queue-specific metrics
        .route("/queues/:id", get(get_queue_metrics))
        // Worker-specific metrics
        .route("/workers/:id", get(get_worker_metrics))
        // Throughput metrics
        .route("/throughput", get(get_throughput_metrics))
        // Latency metrics
        .route("/latency", get(get_latency_metrics))
        // Error metrics
        .route("/errors", get(get_error_metrics))
        // System health
        .route("/health", get(get_system_health))
        // Prometheus endpoint
        .route("/prometheus", get(prometheus_metrics))
        // Alerts
        .route("/alerts", get(list_alerts))
        .route("/alerts", post(create_alert_rule))
        .route("/alerts/:id", get(get_alert_rule))
        .route("/alerts/:id", put(update_alert_rule))
        .route("/alerts/:id", delete(delete_alert_rule))
        .route("/alerts/:id/toggle", post(toggle_alert_rule))
        .route("/alerts/history", get(get_alert_history))
        .route("/alerts/active", get(get_active_alerts))
        // Custom metrics
        .route("/custom", post(record_custom_metric))
        // Export metrics
        .route("/export", get(export_metrics))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// Dashboard overview response
#[derive(Debug, Serialize)]
pub struct DashboardOverview {
    // Queue summary
    pub total_queues: i64,
    pub active_queues: i64,
    pub paused_queues: i64,
    // Message summary
    pub total_messages: i64,
    pub pending_messages: i64,
    pub processing_messages: i64,
    pub completed_today: i64,
    pub failed_today: i64,
    // Worker summary
    pub total_workers: i64,
    pub active_workers: i64,
    pub idle_workers: i64,
    // Performance
    pub messages_per_minute: f64,
    pub avg_processing_time_ms: f64,
    pub success_rate: f64,
    // Alerts
    pub active_alerts: i64,
    pub critical_alerts: i64,
    // System
    pub system_health: String,
    pub uptime_seconds: i64,
    // Timestamps
    pub last_updated: DateTime<Utc>,
}

/// Real-time metrics
#[derive(Debug, Serialize)]
pub struct RealtimeMetrics {
    pub timestamp: DateTime<Utc>,
    // Current rates
    pub enqueue_rate: f64,
    pub dequeue_rate: f64,
    pub error_rate: f64,
    // Queue depths
    pub queue_depths: Vec<QueueDepth>,
    // Worker utilization
    pub worker_utilization: f64,
    pub active_connections: i64,
    // Memory
    pub memory_usage_mb: i64,
    pub redis_memory_mb: i64,
    // Recent events
    pub recent_errors: Vec<RecentError>,
}

#[derive(Debug, Serialize)]
pub struct QueueDepth {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub pending: i64,
    pub processing: i64,
}

#[derive(Debug, Serialize)]
pub struct RecentError {
    pub message_id: Uuid,
    pub queue_name: String,
    pub error: String,
    pub occurred_at: DateTime<Utc>,
}

/// Historical metrics query
#[derive(Debug, Deserialize)]
pub struct HistoricalMetricsParams {
    #[serde(flatten)]
    pub date_range: DateRangeParams,
    pub granularity: Option<String>, // minute, hour, day
    pub queue_id: Option<Uuid>,
    pub metric_types: Option<Vec<String>>,
}

/// Historical metrics response
#[derive(Debug, Serialize)]
pub struct HistoricalMetrics {
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub granularity: String,
    pub data_points: Vec<MetricDataPoint>,
}

#[derive(Debug, Serialize)]
pub struct MetricDataPoint {
    pub timestamp: DateTime<Utc>,
    pub messages_enqueued: i64,
    pub messages_completed: i64,
    pub messages_failed: i64,
    pub avg_wait_time_ms: f64,
    pub avg_processing_time_ms: f64,
    pub active_workers: i64,
    pub throughput: f64,
}

/// Throughput metrics
#[derive(Debug, Serialize)]
pub struct ThroughputMetrics {
    pub period: String,
    pub total_processed: i64,
    pub messages_per_second: f64,
    pub messages_per_minute: f64,
    pub messages_per_hour: f64,
    pub peak_throughput: f64,
    pub peak_time: DateTime<Utc>,
    pub by_queue: Vec<QueueThroughput>,
}

#[derive(Debug, Serialize)]
pub struct QueueThroughput {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub processed: i64,
    pub rate_per_minute: f64,
}

/// Latency metrics
#[derive(Debug, Serialize)]
pub struct LatencyMetrics {
    pub period: String,
    // Wait time (time in queue)
    pub avg_wait_time_ms: f64,
    pub p50_wait_time_ms: f64,
    pub p95_wait_time_ms: f64,
    pub p99_wait_time_ms: f64,
    // Processing time
    pub avg_processing_time_ms: f64,
    pub p50_processing_time_ms: f64,
    pub p95_processing_time_ms: f64,
    pub p99_processing_time_ms: f64,
    // By queue
    pub by_queue: Vec<QueueLatency>,
}

#[derive(Debug, Serialize)]
pub struct QueueLatency {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub avg_wait_ms: f64,
    pub avg_processing_ms: f64,
}

/// Error metrics
#[derive(Debug, Serialize)]
pub struct ErrorMetrics {
    pub period: String,
    pub total_errors: i64,
    pub error_rate: f64,
    pub by_type: Vec<ErrorByType>,
    pub by_queue: Vec<ErrorByQueue>,
    pub recent_errors: Vec<ErrorDetail>,
}

#[derive(Debug, Serialize)]
pub struct ErrorByType {
    pub error_code: String,
    pub count: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
pub struct ErrorByQueue {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub error_count: i64,
    pub error_rate: f64,
}

#[derive(Debug, Serialize)]
pub struct ErrorDetail {
    pub message_id: Uuid,
    pub queue_name: String,
    pub message_type: String,
    pub error_code: Option<String>,
    pub error_message: String,
    pub occurred_at: DateTime<Utc>,
    pub attempts: i32,
}

/// System health
#[derive(Debug, Serialize)]
pub struct SystemHealth {
    pub status: String, // healthy, degraded, unhealthy
    pub components: Vec<ComponentHealth>,
    pub checks: Vec<HealthCheck>,
    pub last_check: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ComponentHealth {
    pub name: String,
    pub status: String,
    pub latency_ms: Option<i64>,
    pub message: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HealthCheck {
    pub name: String,
    pub passed: bool,
    pub details: Option<String>,
}

/// Alert rule
#[derive(Debug, Serialize)]
pub struct AlertRule {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub metric: String,
    pub condition: String,
    pub threshold: f64,
    pub duration_seconds: i32,
    pub severity: String,
    pub is_enabled: bool,
    pub notification_channels: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateAlertRuleRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    pub description: Option<String>,
    pub metric: String,
    pub condition: String, // gt, gte, lt, lte, eq
    pub threshold: f64,
    pub duration_seconds: Option<i32>,
    pub severity: Option<String>,
    pub notification_channels: Option<Vec<String>>,
    pub queue_id: Option<Uuid>,
}

/// Alert history entry
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct AlertHistoryEntry {
    pub id: i64,
    pub rule_id: Uuid,
    pub rule_name: String,
    pub severity: String,
    pub triggered_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub metric_value: f64,
    pub threshold: f64,
    pub message: String,
}

/// Custom metric
#[derive(Debug, Deserialize)]
pub struct RecordMetricRequest {
    pub name: String,
    pub value: f64,
    pub tags: Option<serde_json::Value>,
    pub timestamp: Option<DateTime<Utc>>,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// Get dashboard overview
async fn get_dashboard(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<DashboardOverview>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // Queue counts
    let queue_counts: (i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'paused') as paused
        FROM vqm_queues
        WHERE is_system_queue = false
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0));

    // Message counts
    let msg_counts: (i64, i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'processing') as processing,
            COUNT(*) FILTER (WHERE status = 'completed' AND completed_at > CURRENT_DATE) as completed_today,
            COUNT(*) FILTER (WHERE status = 'failed' AND completed_at > CURRENT_DATE) as failed_today
        FROM vqm_messages
        "#
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0, 0, 0));

    // Worker counts
    let worker_counts: (i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'idle') as idle
        FROM vqm_workers
        WHERE status != 'offline'
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0));

    // Performance metrics (last hour)
    let perf: (f64, f64, f64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(COUNT(*) / 60.0, 0) as per_minute,
            COALESCE(AVG(processing_time_ms), 0) as avg_processing,
            COALESCE(
                COUNT(*) FILTER (WHERE status = 'completed')::float /
                NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'failed')), 0) * 100,
                0
            ) as success_rate
        FROM vqm_messages
        WHERE completed_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0.0, 0.0));

    // Alert counts
    let alert_counts: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE resolved_at IS NULL) as active,
            COUNT(*) FILTER (WHERE resolved_at IS NULL AND severity = 'critical') as critical
        FROM vqm_alert_history
        WHERE triggered_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0));

    // System health check
    let system_health = if alert_counts.1 > 0 {
        "unhealthy"
    } else if alert_counts.0 > 0 || perf.2 < 95.0 {
        "degraded"
    } else {
        "healthy"
    };

    let dashboard = DashboardOverview {
        total_queues: queue_counts.0,
        active_queues: queue_counts.1,
        paused_queues: queue_counts.2,
        total_messages: msg_counts.0,
        pending_messages: msg_counts.1,
        processing_messages: msg_counts.2,
        completed_today: msg_counts.3,
        failed_today: msg_counts.4,
        total_workers: worker_counts.0,
        active_workers: worker_counts.1,
        idle_workers: worker_counts.2,
        messages_per_minute: perf.0,
        avg_processing_time_ms: perf.1,
        success_rate: perf.2,
        active_alerts: alert_counts.0,
        critical_alerts: alert_counts.1,
        system_health: system_health.to_string(),
        uptime_seconds: 0, // Would come from plugin state
        last_updated: Utc::now(),
    };

    Ok(Json(ApiResponse::success(dashboard)))
}

/// Get real-time metrics
async fn get_realtime_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<RealtimeMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // Calculate rates (last minute)
    let rates: (f64, f64, f64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 minute') / 60.0, 0),
            COALESCE(COUNT(*) FILTER (WHERE completed_at > CURRENT_TIMESTAMP - INTERVAL '1 minute') / 60.0, 0),
            COALESCE(COUNT(*) FILTER (WHERE status = 'failed' AND completed_at > CURRENT_TIMESTAMP - INTERVAL '1 minute') / 60.0, 0)
        FROM vqm_messages
        "#
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0.0, 0.0));

    // Queue depths
    let depths: Vec<QueueDepthRow> = sqlx::query_as(
        r#"
        SELECT id as queue_id, name as queue_name, pending_count as pending, processing_count as processing
        FROM vqm_queues
        WHERE is_system_queue = false AND status = 'active'
        ORDER BY pending_count DESC
        LIMIT 10
        "#
    )
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    // Worker utilization
    let utilization: (f64, i64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(AVG(current_load), 0),
            COUNT(*) FILTER (WHERE current_job_id IS NOT NULL)
        FROM vqm_workers
        WHERE status IN ('active', 'idle')
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0));

    // Recent errors
    let errors: Vec<RecentErrorRow> = sqlx::query_as(
        r#"
        SELECT m.id as message_id, q.name as queue_name, m.last_error as error, m.updated_at as occurred_at
        FROM vqm_messages m
        JOIN vqm_queues q ON m.queue_id = q.id
        WHERE m.status = 'failed' AND m.updated_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
        ORDER BY m.updated_at DESC
        LIMIT 5
        "#
    )
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let metrics = RealtimeMetrics {
        timestamp: Utc::now(),
        enqueue_rate: rates.0,
        dequeue_rate: rates.1,
        error_rate: rates.2,
        queue_depths: depths
            .into_iter()
            .map(|d| QueueDepth {
                queue_id: d.queue_id,
                queue_name: d.queue_name,
                pending: d.pending,
                processing: d.processing,
            })
            .collect(),
        worker_utilization: utilization.0,
        active_connections: utilization.1,
        memory_usage_mb: 0, // Would come from system metrics
        redis_memory_mb: 0,
        recent_errors: errors
            .into_iter()
            .map(|e| RecentError {
                message_id: e.message_id,
                queue_name: e.queue_name,
                error: e.error.unwrap_or_default(),
                occurred_at: e.occurred_at,
            })
            .collect(),
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get historical metrics
async fn get_historical_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<HistoricalMetricsParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<HistoricalMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let end_time = params.date_range.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .date_range
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(24));

    let granularity = params.granularity.as_deref().unwrap_or("hour");

    let table = match granularity {
        "minute" => "vqm_metrics_snapshots",
        "hour" => "vqm_metrics_hourly",
        "day" => "vqm_metrics_daily",
        _ => "vqm_metrics_hourly",
    };

    let data_points: Vec<MetricDataPointRow> = sqlx::query_as(&format!(
        r#"
        SELECT
            period_start as timestamp,
            messages_enqueued,
            messages_completed,
            messages_failed,
            COALESCE(avg_wait_time_ms, 0) as avg_wait_time_ms,
            COALESCE(avg_processing_time_ms, 0) as avg_processing_time_ms,
            active_workers,
            COALESCE(throughput_per_second * 60, 0) as throughput
        FROM {}
        WHERE period_start BETWEEN $1 AND $2
        ORDER BY period_start ASC
        "#,
        table
    ))
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let metrics = HistoricalMetrics {
        period_start: start_time,
        period_end: end_time,
        granularity: granularity.to_string(),
        data_points: data_points
            .into_iter()
            .map(|p| MetricDataPoint {
                timestamp: p.timestamp,
                messages_enqueued: p.messages_enqueued,
                messages_completed: p.messages_completed,
                messages_failed: p.messages_failed,
                avg_wait_time_ms: p.avg_wait_time_ms,
                avg_processing_time_ms: p.avg_processing_time_ms,
                active_workers: p.active_workers,
                throughput: p.throughput,
            })
            .collect(),
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get queue-specific metrics
async fn get_queue_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<DateRangeParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<QueueMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let end_time = params.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(1));

    // Get queue info
    let queue_info: (String, i64, i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT name, message_count, pending_count, processing_count, completed_count, failed_count
        FROM vqm_queues WHERE id = $1
        "#,
    )
    .bind(queue_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Queue"))?;

    // Get performance stats for period
    let perf: (f64, f64, f64, f64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(AVG(wait_time_ms), 0),
            COALESCE(AVG(processing_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY processing_time_ms), 0),
            COUNT(*) FILTER (WHERE status = 'completed'),
            COUNT(*) FILTER (WHERE status = 'failed')
        FROM vqm_messages
        WHERE queue_id = $1 AND completed_at BETWEEN $2 AND $3
        "#,
    )
    .bind(queue_id)
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0.0, 0.0, 0.0, 0, 0));

    let metrics = QueueMetrics {
        queue_id,
        queue_name: queue_info.0,
        total_messages: queue_info.1,
        pending_messages: queue_info.2,
        processing_messages: queue_info.3,
        completed_messages: queue_info.4,
        failed_messages: queue_info.5,
        avg_wait_time_ms: perf.0,
        avg_processing_time_ms: perf.1,
        p95_processing_time_ms: perf.2,
        p99_processing_time_ms: perf.3,
        completed_in_period: perf.4,
        failed_in_period: perf.5,
        period_start: start_time,
        period_end: end_time,
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get worker-specific metrics
async fn get_worker_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<DateRangeParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<WorkerMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let end_time = params.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(1));

    // Get worker info
    let worker: (String, i64, i64, f64, i64, f64, DateTime<Utc>) = sqlx::query_as(
        r#"
        SELECT name, jobs_completed, jobs_failed, current_load,
               memory_usage_mb, cpu_usage_percent, registered_at
        FROM vqm_workers WHERE id = $1
        "#,
    )
    .bind(worker_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Worker"))?;

    // Get period stats
    let period_stats: (i64, i64, f64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE status = 'completed'),
            COUNT(*) FILTER (WHERE status = 'failed'),
            COALESCE(AVG(processing_time_ms), 0)
        FROM vqm_worker_job_history
        WHERE worker_id = $1 AND started_at BETWEEN $2 AND $3
        "#,
    )
    .bind(worker_id)
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0.0));

    let metrics = WorkerMetrics {
        worker_id,
        worker_name: worker.0,
        total_completed: worker.1,
        total_failed: worker.2,
        current_load: worker.3,
        memory_usage_mb: worker.4,
        cpu_usage_percent: worker.5,
        uptime_seconds: (Utc::now() - worker.6).num_seconds(),
        completed_in_period: period_stats.0,
        failed_in_period: period_stats.1,
        avg_processing_time_ms: period_stats.2,
        period_start: start_time,
        period_end: end_time,
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get throughput metrics
async fn get_throughput_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<DateRangeParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<ThroughputMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let end_time = params.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(1));
    let period_seconds = (end_time - start_time).num_seconds() as f64;

    // Overall throughput
    let overall: (i64, DateTime<Utc>) = sqlx::query_as(
        r#"
        WITH hourly AS (
            SELECT date_trunc('hour', completed_at) as hour, COUNT(*) as count
            FROM vqm_messages
            WHERE completed_at BETWEEN $1 AND $2
            GROUP BY hour
        )
        SELECT
            (SELECT COUNT(*) FROM vqm_messages WHERE completed_at BETWEEN $1 AND $2),
            COALESCE((SELECT hour FROM hourly ORDER BY count DESC LIMIT 1), $2)
        "#,
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .unwrap_or((0, end_time));

    // By queue
    let by_queue: Vec<(Uuid, String, i64)> = sqlx::query_as(
        r#"
        SELECT q.id, q.name, COUNT(m.id) as processed
        FROM vqm_queues q
        LEFT JOIN vqm_messages m ON q.id = m.queue_id AND m.completed_at BETWEEN $1 AND $2
        WHERE q.is_system_queue = false
        GROUP BY q.id, q.name
        ORDER BY processed DESC
        LIMIT 10
        "#,
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let metrics = ThroughputMetrics {
        period: format!("{}s", period_seconds as i64),
        total_processed: overall.0,
        messages_per_second: overall.0 as f64 / period_seconds,
        messages_per_minute: overall.0 as f64 / (period_seconds / 60.0),
        messages_per_hour: overall.0 as f64 / (period_seconds / 3600.0),
        peak_throughput: 0.0, // Would need more detailed tracking
        peak_time: overall.1,
        by_queue: by_queue
            .into_iter()
            .map(|(id, name, processed)| QueueThroughput {
                queue_id: id,
                queue_name: name,
                processed,
                rate_per_minute: processed as f64 / (period_seconds / 60.0),
            })
            .collect(),
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get latency metrics
async fn get_latency_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<DateRangeParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<LatencyMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let end_time = params.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(1));

    // Overall latency
    let latency: (f64, f64, f64, f64, f64, f64, f64, f64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(AVG(wait_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY wait_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY wait_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY wait_time_ms), 0),
            COALESCE(AVG(processing_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms), 0),
            COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY processing_time_ms), 0)
        FROM vqm_messages
        WHERE completed_at BETWEEN $1 AND $2
        "#,
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0));

    // By queue
    let by_queue: Vec<(Uuid, String, f64, f64)> = sqlx::query_as(
        r#"
        SELECT q.id, q.name,
               COALESCE(AVG(m.wait_time_ms), 0),
               COALESCE(AVG(m.processing_time_ms), 0)
        FROM vqm_queues q
        LEFT JOIN vqm_messages m ON q.id = m.queue_id AND m.completed_at BETWEEN $1 AND $2
        WHERE q.is_system_queue = false
        GROUP BY q.id, q.name
        ORDER BY AVG(m.processing_time_ms) DESC NULLS LAST
        LIMIT 10
        "#,
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let metrics = LatencyMetrics {
        period: format!("{} to {}", start_time, end_time),
        avg_wait_time_ms: latency.0,
        p50_wait_time_ms: latency.1,
        p95_wait_time_ms: latency.2,
        p99_wait_time_ms: latency.3,
        avg_processing_time_ms: latency.4,
        p50_processing_time_ms: latency.5,
        p95_processing_time_ms: latency.6,
        p99_processing_time_ms: latency.7,
        by_queue: by_queue
            .into_iter()
            .map(|(id, name, wait, proc)| QueueLatency {
                queue_id: id,
                queue_name: name,
                avg_wait_ms: wait,
                avg_processing_ms: proc,
            })
            .collect(),
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get error metrics
async fn get_error_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<DateRangeParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<ErrorMetrics>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let end_time = params.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(1));

    // Total errors and rate
    let totals: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE status = 'failed'),
            COUNT(*) FILTER (WHERE status IN ('completed', 'failed'))
        FROM vqm_messages
        WHERE completed_at BETWEEN $1 AND $2
        "#,
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0));

    let error_rate = if totals.1 > 0 {
        (totals.0 as f64 / totals.1 as f64) * 100.0
    } else {
        0.0
    };

    // Recent errors
    let recent: Vec<ErrorDetailRow> = sqlx::query_as(
        r#"
        SELECT m.id as message_id, q.name as queue_name, m.message_type,
               NULL as error_code, m.last_error as error_message,
               m.completed_at as occurred_at, m.attempts
        FROM vqm_messages m
        JOIN vqm_queues q ON m.queue_id = q.id
        WHERE m.status = 'failed' AND m.completed_at BETWEEN $1 AND $2
        ORDER BY m.completed_at DESC
        LIMIT 20
        "#,
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let metrics = ErrorMetrics {
        period: format!("{} to {}", start_time, end_time),
        total_errors: totals.0,
        error_rate,
        by_type: vec![],  // Would need error code tracking
        by_queue: vec![], // Would need more queries
        recent_errors: recent
            .into_iter()
            .map(|e| ErrorDetail {
                message_id: e.message_id,
                queue_name: e.queue_name,
                message_type: e.message_type,
                error_code: e.error_code,
                error_message: e.error_message.unwrap_or_default(),
                occurred_at: e.occurred_at,
                attempts: e.attempts,
            })
            .collect(),
    };

    Ok(Json(ApiResponse::success(metrics)))
}

/// Get system health
async fn get_system_health(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SystemHealth>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // Check database
    let db_start = std::time::Instant::now();
    let db_ok = sqlx::query("SELECT 1").execute(pool).await.is_ok();
    let db_latency = db_start.elapsed().as_millis() as i64;

    // Check for stale workers
    let stale_workers: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_workers WHERE status != 'offline' AND last_heartbeat < CURRENT_TIMESTAMP - INTERVAL '5 minutes'"
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0,));

    // Check queue health
    let unhealthy_queues: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_queues WHERE status = 'error' OR dead_letter_count > 1000",
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0,));

    let mut components = vec![ComponentHealth {
        name: "database".to_string(),
        status: if db_ok {
            "healthy".to_string()
        } else {
            "unhealthy".to_string()
        },
        latency_ms: Some(db_latency),
        message: None,
    }];

    let mut checks = vec![
        HealthCheck {
            name: "database_connection".to_string(),
            passed: db_ok,
            details: None,
        },
        HealthCheck {
            name: "worker_heartbeats".to_string(),
            passed: stale_workers.0 == 0,
            details: Some(format!("{} stale workers", stale_workers.0)),
        },
        HealthCheck {
            name: "queue_health".to_string(),
            passed: unhealthy_queues.0 == 0,
            details: Some(format!("{} unhealthy queues", unhealthy_queues.0)),
        },
    ];

    let overall_status = if !db_ok {
        "unhealthy"
    } else if stale_workers.0 > 0 || unhealthy_queues.0 > 0 {
        "degraded"
    } else {
        "healthy"
    };

    let health = SystemHealth {
        status: overall_status.to_string(),
        components,
        checks,
        last_check: Utc::now(),
    };

    Ok(Json(ApiResponse::success(health)))
}

/// Prometheus metrics endpoint
async fn prometheus_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
) -> Result<String, AppError> {
    let pool = plugin.db_pool();

    let mut output = String::new();

    // Queue metrics
    let queues: Vec<(String, i64, i64, i64, i64)> = sqlx::query_as(
        r#"
        SELECT name, pending_count, processing_count, completed_count, failed_count
        FROM vqm_queues WHERE is_system_queue = false
        "#,
    )
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    output.push_str("# HELP vqm_queue_pending_messages Number of pending messages in queue\n");
    output.push_str("# TYPE vqm_queue_pending_messages gauge\n");
    for (name, pending, _, _, _) in &queues {
        output.push_str(&format!(
            "vqm_queue_pending_messages{{queue=\"{}\"}} {}\n",
            name, pending
        ));
    }

    output.push_str("# HELP vqm_queue_processing_messages Number of messages being processed\n");
    output.push_str("# TYPE vqm_queue_processing_messages gauge\n");
    for (name, _, processing, _, _) in &queues {
        output.push_str(&format!(
            "vqm_queue_processing_messages{{queue=\"{}\"}} {}\n",
            name, processing
        ));
    }

    output.push_str("# HELP vqm_queue_completed_total Total completed messages\n");
    output.push_str("# TYPE vqm_queue_completed_total counter\n");
    for (name, _, _, completed, _) in &queues {
        output.push_str(&format!(
            "vqm_queue_completed_total{{queue=\"{}\"}} {}\n",
            name, completed
        ));
    }

    output.push_str("# HELP vqm_queue_failed_total Total failed messages\n");
    output.push_str("# TYPE vqm_queue_failed_total counter\n");
    for (name, _, _, _, failed) in &queues {
        output.push_str(&format!(
            "vqm_queue_failed_total{{queue=\"{}\"}} {}\n",
            name, failed
        ));
    }

    // Worker metrics
    let workers: (i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE status = 'active'),
            COUNT(*) FILTER (WHERE status = 'idle'),
            COUNT(*) FILTER (WHERE status = 'offline')
        FROM vqm_workers
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0));

    output.push_str("# HELP vqm_workers_active Number of active workers\n");
    output.push_str("# TYPE vqm_workers_active gauge\n");
    output.push_str(&format!("vqm_workers_active {}\n", workers.0));

    output.push_str("# HELP vqm_workers_idle Number of idle workers\n");
    output.push_str("# TYPE vqm_workers_idle gauge\n");
    output.push_str(&format!("vqm_workers_idle {}\n", workers.1));

    Ok(output)
}

/// List alert rules
async fn list_alerts(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<AlertRule>>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let rules: Vec<AlertRuleRow> = sqlx::query_as(
        r#"
        SELECT id, name, description, metric, condition, threshold,
               duration_seconds, severity, is_enabled, notification_channels,
               created_at, updated_at
        FROM vqm_alert_rules
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let alerts: Vec<AlertRule> = rules.into_iter().map(|r| r.into()).collect();

    Ok(Json(ApiResponse::success(alerts)))
}

/// Create alert rule
async fn create_alert_rule(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CreateAlertRuleRequest>,
) -> Result<(StatusCode, Json<ApiResponse<AlertRule>>), AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();
    let rule_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO vqm_alert_rules (
            id, name, description, metric, condition, threshold,
            duration_seconds, severity, notification_channels, queue_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        "#,
    )
    .bind(rule_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.metric)
    .bind(&req.condition)
    .bind(req.threshold)
    .bind(req.duration_seconds.unwrap_or(60))
    .bind(req.severity.as_deref().unwrap_or("warning"))
    .bind(&req.notification_channels.clone().unwrap_or_default())
    .bind(&req.queue_id)
    .execute(pool)
    .await?;

    let rule = get_alert_rule_by_id(pool, rule_id).await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(rule))))
}

/// Get alert rule
async fn get_alert_rule(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<AlertRule>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let rule_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let rule = get_alert_rule_by_id(pool, rule_id).await?;

    Ok(Json(ApiResponse::success(rule)))
}

/// Update alert rule
async fn update_alert_rule(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<CreateAlertRuleRequest>,
) -> Result<Json<ApiResponse<AlertRule>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let rule_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        UPDATE vqm_alert_rules
        SET name = $1, description = $2, metric = $3, condition = $4,
            threshold = $5, duration_seconds = $6, severity = $7,
            notification_channels = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.metric)
    .bind(&req.condition)
    .bind(req.threshold)
    .bind(req.duration_seconds.unwrap_or(60))
    .bind(req.severity.as_deref().unwrap_or("warning"))
    .bind(&req.notification_channels.clone().unwrap_or_default())
    .bind(rule_id)
    .execute(pool)
    .await?;

    let rule = get_alert_rule_by_id(pool, rule_id).await?;

    Ok(Json(ApiResponse::success(rule)))
}

/// Delete alert rule
async fn delete_alert_rule(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let rule_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query("DELETE FROM vqm_alert_rules WHERE id = $1")
        .bind(rule_id)
        .execute(pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// Toggle alert rule enabled/disabled
async fn toggle_alert_rule(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<AlertRule>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let rule_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        "UPDATE vqm_alert_rules SET is_enabled = NOT is_enabled, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(rule_id)
    .execute(pool)
    .await?;

    let rule = get_alert_rule_by_id(pool, rule_id).await?;

    Ok(Json(ApiResponse::success(rule)))
}

/// Get alert history
async fn get_alert_history(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<AlertHistoryEntry>>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let history: Vec<AlertHistoryEntry> = sqlx::query_as(
        r#"
        SELECT h.id, h.rule_id, r.name as rule_name, h.severity,
               h.triggered_at, h.resolved_at, h.metric_value, h.threshold, h.message
        FROM vqm_alert_history h
        JOIN vqm_alert_rules r ON h.rule_id = r.id
        ORDER BY h.triggered_at DESC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(history)))
}

/// Get active alerts
async fn get_active_alerts(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<AlertHistoryEntry>>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let alerts: Vec<AlertHistoryEntry> = sqlx::query_as(
        r#"
        SELECT h.id, h.rule_id, r.name as rule_name, h.severity,
               h.triggered_at, h.resolved_at, h.metric_value, h.threshold, h.message
        FROM vqm_alert_history h
        JOIN vqm_alert_rules r ON h.rule_id = r.id
        WHERE h.resolved_at IS NULL
        ORDER BY h.severity DESC, h.triggered_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(alerts)))
}

/// Record custom metric
async fn record_custom_metric(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<RecordMetricRequest>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        INSERT INTO vqm_custom_metrics (name, value, tags, recorded_at)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(&req.name)
    .bind(req.value)
    .bind(&req.tags.unwrap_or(serde_json::json!({})))
    .bind(req.timestamp.unwrap_or_else(Utc::now))
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(())))
}

/// Export metrics
async fn export_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ExportParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let end_time = params.date_range.end_date.unwrap_or_else(Utc::now);
    let start_time = params
        .date_range
        .start_date
        .unwrap_or_else(|| end_time - Duration::hours(24));

    // Export all metrics for the period
    let data = serde_json::json!({
        "export_time": Utc::now(),
        "period_start": start_time,
        "period_end": end_time,
        "format": params.format.unwrap_or_else(|| "json".to_string()),
        // Would include actual metric data
        "metrics": {}
    });

    Ok(Json(ApiResponse::success(data)))
}

// -----------------------------------------------------------------------------
// Helper Types
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct ExportParams {
    #[serde(flatten)]
    pub date_range: DateRangeParams,
    pub format: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct QueueMetrics {
    pub queue_id: Uuid,
    pub queue_name: String,
    pub total_messages: i64,
    pub pending_messages: i64,
    pub processing_messages: i64,
    pub completed_messages: i64,
    pub failed_messages: i64,
    pub avg_wait_time_ms: f64,
    pub avg_processing_time_ms: f64,
    pub p95_processing_time_ms: f64,
    pub p99_processing_time_ms: f64,
    pub completed_in_period: i64,
    pub failed_in_period: i64,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct WorkerMetrics {
    pub worker_id: Uuid,
    pub worker_name: String,
    pub total_completed: i64,
    pub total_failed: i64,
    pub current_load: f64,
    pub memory_usage_mb: i64,
    pub cpu_usage_percent: f64,
    pub uptime_seconds: i64,
    pub completed_in_period: i64,
    pub failed_in_period: i64,
    pub avg_processing_time_ms: f64,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
struct QueueDepthRow {
    queue_id: Uuid,
    queue_name: String,
    pending: i64,
    processing: i64,
}

#[derive(Debug, sqlx::FromRow)]
struct RecentErrorRow {
    message_id: Uuid,
    queue_name: String,
    error: Option<String>,
    occurred_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
struct MetricDataPointRow {
    timestamp: DateTime<Utc>,
    messages_enqueued: i64,
    messages_completed: i64,
    messages_failed: i64,
    avg_wait_time_ms: f64,
    avg_processing_time_ms: f64,
    active_workers: i64,
    throughput: f64,
}

#[derive(Debug, sqlx::FromRow)]
struct ErrorDetailRow {
    message_id: Uuid,
    queue_name: String,
    message_type: String,
    error_code: Option<String>,
    error_message: Option<String>,
    occurred_at: DateTime<Utc>,
    attempts: i32,
}

#[derive(Debug, sqlx::FromRow)]
struct AlertRuleRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    metric: String,
    condition: String,
    threshold: f64,
    duration_seconds: i32,
    severity: String,
    is_enabled: bool,
    notification_channels: Vec<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<AlertRuleRow> for AlertRule {
    fn from(row: AlertRuleRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            description: row.description,
            metric: row.metric,
            condition: row.condition,
            threshold: row.threshold,
            duration_seconds: row.duration_seconds,
            severity: row.severity,
            is_enabled: row.is_enabled,
            notification_channels: row.notification_channels,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

async fn get_alert_rule_by_id(pool: &PgPool, rule_id: Uuid) -> Result<AlertRule, AppError> {
    let row: AlertRuleRow = sqlx::query_as(
        r#"
        SELECT id, name, description, metric, condition, threshold,
               duration_seconds, severity, is_enabled, notification_channels,
               created_at, updated_at
        FROM vqm_alert_rules WHERE id = $1
        "#,
    )
    .bind(rule_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Alert rule"))?;

    Ok(row.into())
}
