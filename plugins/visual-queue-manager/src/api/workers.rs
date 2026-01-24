// =============================================================================
// Visual Queue Manager - Worker API Endpoints
// =============================================================================
// REST API endpoints for worker management and monitoring.
// Points 27-28: Worker registration, heartbeat, and control
// =============================================================================

use axum::{
    extract::{Extension, Json, Path, Query},
    http::StatusCode,
    routing::{delete, get, patch, post, put},
    Router,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use super::{
    parse_uuid, validate_request, ApiError, ApiResponse, AppError, AuthUser, PaginationParams,
    ResponseMeta, SortParams,
};
use crate::VisualQueueManager;

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

pub fn router() -> Router {
    Router::new()
        // List workers
        .route("/", get(list_workers))
        // Register new worker
        .route("/", post(register_worker))
        // Get worker by ID
        .route("/:id", get(get_worker))
        // Update worker
        .route("/:id", patch(update_worker))
        // Deregister worker
        .route("/:id", delete(deregister_worker))
        // Worker heartbeat
        .route("/:id/heartbeat", post(worker_heartbeat))
        // Worker status
        .route("/:id/status", get(get_worker_status))
        .route("/:id/status", put(set_worker_status))
        // Worker statistics
        .route("/:id/stats", get(get_worker_stats))
        // Worker job history
        .route("/:id/history", get(get_worker_history))
        // Worker groups
        .route("/groups", get(list_worker_groups))
        .route("/groups", post(create_worker_group))
        .route("/groups/:id", get(get_worker_group))
        .route("/groups/:id", put(update_worker_group))
        .route("/groups/:id", delete(delete_worker_group))
        .route("/groups/:id/workers", get(list_group_workers))
        .route("/groups/:id/scale", post(scale_worker_group))
        // Batch operations
        .route("/batch/pause", post(batch_pause_workers))
        .route("/batch/resume", post(batch_resume_workers))
        // Cleanup stale workers
        .route("/cleanup", post(cleanup_stale_workers))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// List workers query parameters
#[derive(Debug, Deserialize)]
pub struct ListWorkersParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    #[serde(flatten)]
    pub sort: SortParams,
    pub status: Option<String>,
    pub queue_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
    pub hostname: Option<String>,
}

/// Register worker request
#[derive(Debug, Deserialize, Validate)]
pub struct RegisterWorkerRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub hostname: Option<String>,
    pub queue_ids: Vec<Uuid>,
    pub group_id: Option<Uuid>,
    pub max_concurrent_jobs: Option<i32>,
    pub capabilities: Option<Vec<String>>,
    pub metadata: Option<serde_json::Value>,
}

/// Update worker request
#[derive(Debug, Deserialize)]
pub struct UpdateWorkerRequest {
    pub name: Option<String>,
    pub queue_ids: Option<Vec<Uuid>>,
    pub max_concurrent_jobs: Option<i32>,
    pub capabilities: Option<Vec<String>>,
    pub metadata: Option<serde_json::Value>,
}

/// Worker heartbeat request
#[derive(Debug, Deserialize)]
pub struct HeartbeatRequest {
    pub current_load: Option<f64>,
    pub memory_usage_mb: Option<i64>,
    pub cpu_usage_percent: Option<f64>,
    pub jobs_in_progress: Option<i32>,
    pub metadata: Option<serde_json::Value>,
}

/// Set worker status request
#[derive(Debug, Deserialize)]
pub struct SetStatusRequest {
    pub status: String, // active, paused, draining
    pub reason: Option<String>,
}

/// Worker group request
#[derive(Debug, Deserialize, Validate)]
pub struct WorkerGroupRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    pub description: Option<String>,
    pub queue_ids: Vec<Uuid>,
    pub min_workers: Option<i32>,
    pub max_workers: Option<i32>,
    pub target_workers: Option<i32>,
    pub auto_scale: Option<bool>,
    pub scale_up_threshold: Option<f64>,
    pub scale_down_threshold: Option<f64>,
    pub metadata: Option<serde_json::Value>,
}

/// Scale worker group request
#[derive(Debug, Deserialize)]
pub struct ScaleRequest {
    pub target_count: i32,
}

/// Batch worker operation request
#[derive(Debug, Deserialize)]
pub struct BatchWorkerOperation {
    pub worker_ids: Vec<Uuid>,
}

/// Worker response
#[derive(Debug, Serialize)]
pub struct WorkerResponse {
    pub id: Uuid,
    pub name: String,
    pub hostname: Option<String>,
    pub status: String,
    pub queue_ids: Vec<Uuid>,
    pub group_id: Option<Uuid>,
    pub max_concurrent_jobs: i32,
    pub current_job_id: Option<Uuid>,
    pub capabilities: Vec<String>,
    // Statistics
    pub jobs_completed: i64,
    pub jobs_failed: i64,
    pub total_processing_time_ms: i64,
    // Health
    pub last_heartbeat: DateTime<Utc>,
    pub current_load: f64,
    pub memory_usage_mb: i64,
    pub cpu_usage_percent: f64,
    // Timestamps
    pub registered_at: DateTime<Utc>,
    pub last_job_at: Option<DateTime<Utc>>,
    // Metadata
    pub metadata: serde_json::Value,
}

/// Worker summary for lists
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct WorkerSummary {
    pub id: Uuid,
    pub name: String,
    pub hostname: Option<String>,
    pub status: String,
    pub current_job_id: Option<Uuid>,
    pub jobs_completed: i64,
    pub jobs_failed: i64,
    pub last_heartbeat: DateTime<Utc>,
    pub current_load: f64,
}

/// Worker statistics
#[derive(Debug, Serialize)]
pub struct WorkerStats {
    pub worker_id: Uuid,
    pub worker_name: String,
    // Job counts
    pub total_jobs: i64,
    pub completed_jobs: i64,
    pub failed_jobs: i64,
    pub success_rate: f64,
    // Performance
    pub avg_processing_time_ms: f64,
    pub min_processing_time_ms: i64,
    pub max_processing_time_ms: i64,
    pub total_processing_time_ms: i64,
    // Throughput
    pub jobs_per_hour: f64,
    pub jobs_per_day: f64,
    // Uptime
    pub uptime_seconds: i64,
    pub active_time_percent: f64,
    // Recent activity
    pub jobs_last_hour: i64,
    pub jobs_last_24h: i64,
}

/// Worker job history entry
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct WorkerJobHistory {
    pub id: i64,
    pub worker_id: Uuid,
    pub message_id: Uuid,
    pub queue_id: Uuid,
    pub message_type: String,
    pub status: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub processing_time_ms: Option<i64>,
    pub error_message: Option<String>,
}

/// Worker group response
#[derive(Debug, Serialize)]
pub struct WorkerGroupResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub queue_ids: Vec<Uuid>,
    pub min_workers: i32,
    pub max_workers: i32,
    pub target_workers: i32,
    pub current_workers: i32,
    pub auto_scale: bool,
    pub scale_up_threshold: f64,
    pub scale_down_threshold: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: serde_json::Value,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// List workers with filtering and pagination
async fn list_workers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ListWorkersParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<WorkerSummary>>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut conditions = vec!["1=1".to_string()];

    if let Some(ref status) = params.status {
        conditions.push(format!("status = '{}'", status));
    }

    if let Some(queue_id) = params.queue_id {
        conditions.push(format!("'{}' = ANY(queue_ids)", queue_id));
    }

    if let Some(group_id) = params.group_id {
        conditions.push(format!("group_id = '{}'", group_id));
    }

    if let Some(ref hostname) = params.hostname {
        conditions.push(format!("hostname ILIKE '%{}%'", hostname));
    }

    let where_clause = conditions.join(" AND ");

    let sort_column = match params.sort.sort_by.as_deref() {
        Some("name") => "name",
        Some("status") => "status",
        Some("last_heartbeat") => "last_heartbeat",
        Some("jobs_completed") => "jobs_completed",
        _ => "last_heartbeat",
    };
    let sort_order = if params.sort.sort_order == "asc" {
        "ASC"
    } else {
        "DESC"
    };

    let query = format!(
        r#"
        SELECT id, name, hostname, status, current_job_id,
               jobs_completed, jobs_failed, last_heartbeat, current_load
        FROM vqm_workers
        WHERE {}
        ORDER BY {} {}
        LIMIT {} OFFSET {}
        "#,
        where_clause, sort_column, sort_order, params.pagination.per_page, offset
    );

    let workers: Vec<WorkerSummary> = sqlx::query_as(&query).fetch_all(pool).await?;

    let count_query = format!("SELECT COUNT(*) FROM vqm_workers WHERE {}", where_clause);
    let total: (i64,) = sqlx::query_as(&count_query).fetch_one(pool).await?;

    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(workers, meta)))
}

/// Register a new worker
async fn register_worker(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Json(req): Json<RegisterWorkerRequest>,
) -> Result<(StatusCode, Json<ApiResponse<WorkerResponse>>), AppError> {
    validate_request(&req)?;

    let pool = plugin.db_pool();
    let worker_id = Uuid::new_v4();
    let hostname = req.hostname.unwrap_or_else(|| "unknown".to_string());
    let capabilities = req.capabilities.unwrap_or_default();
    let metadata = req.metadata.unwrap_or(serde_json::json!({}));

    sqlx::query(
        r#"
        INSERT INTO vqm_workers (
            id, name, hostname, queue_ids, group_id,
            max_concurrent_jobs, capabilities, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(worker_id)
    .bind(&req.name)
    .bind(&hostname)
    .bind(&req.queue_ids)
    .bind(&req.group_id)
    .bind(req.max_concurrent_jobs.unwrap_or(1))
    .bind(&capabilities)
    .bind(&metadata)
    .execute(pool)
    .await?;

    // Update group worker count if in a group
    if let Some(group_id) = req.group_id {
        sqlx::query(
            "UPDATE vqm_worker_groups SET current_workers = current_workers + 1 WHERE id = $1",
        )
        .bind(group_id)
        .execute(pool)
        .await?;
    }

    let worker = get_worker_by_id(pool, worker_id).await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(worker))))
}

/// Get worker by ID
async fn get_worker(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<WorkerResponse>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let worker = get_worker_by_id(pool, worker_id).await?;

    Ok(Json(ApiResponse::success(worker)))
}

/// Update worker
async fn update_worker(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<UpdateWorkerRequest>,
) -> Result<Json<ApiResponse<WorkerResponse>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Build update dynamically
    let mut updates = Vec::new();

    if let Some(ref name) = req.name {
        updates.push(format!("name = '{}'", name));
    }

    if let Some(ref queue_ids) = req.queue_ids {
        let queue_ids_str: Vec<String> = queue_ids.iter().map(|id| format!("'{}'", id)).collect();
        updates.push(format!(
            "queue_ids = ARRAY[{}]::uuid[]",
            queue_ids_str.join(",")
        ));
    }

    if let Some(max_jobs) = req.max_concurrent_jobs {
        updates.push(format!("max_concurrent_jobs = {}", max_jobs));
    }

    if let Some(ref capabilities) = req.capabilities {
        let caps_str: Vec<String> = capabilities.iter().map(|c| format!("'{}'", c)).collect();
        updates.push(format!(
            "capabilities = ARRAY[{}]::text[]",
            caps_str.join(",")
        ));
    }

    if updates.is_empty() {
        let worker = get_worker_by_id(pool, worker_id).await?;
        return Ok(Json(ApiResponse::success(worker)));
    }

    let query = format!(
        "UPDATE vqm_workers SET {}, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        updates.join(", ")
    );

    sqlx::query(&query).bind(worker_id).execute(pool).await?;

    let worker = get_worker_by_id(pool, worker_id).await?;

    Ok(Json(ApiResponse::success(worker)))
}

/// Deregister worker
async fn deregister_worker(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get group_id before deletion
    let group_id: Option<(Option<Uuid>,)> =
        sqlx::query_as("SELECT group_id FROM vqm_workers WHERE id = $1")
            .bind(worker_id)
            .fetch_optional(pool)
            .await?;

    // Mark worker as offline
    sqlx::query(
        "UPDATE vqm_workers SET status = 'offline', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
    )
    .bind(worker_id)
    .execute(pool)
    .await?;

    // Update group count
    if let Some((Some(gid),)) = group_id {
        sqlx::query(
            "UPDATE vqm_worker_groups SET current_workers = GREATEST(0, current_workers - 1) WHERE id = $1"
        )
        .bind(gid)
        .execute(pool)
        .await?;
    }

    plugin
        .log_audit(
            "worker.deregistered",
            "worker",
            "deregister",
            Some(worker_id),
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(StatusCode::NO_CONTENT)
}

/// Worker heartbeat
async fn worker_heartbeat(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Json(req): Json<HeartbeatRequest>,
) -> Result<Json<ApiResponse<HeartbeatResponse>>, AppError> {
    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let result = sqlx::query(
        r#"
        UPDATE vqm_workers
        SET last_heartbeat = CURRENT_TIMESTAMP,
            current_load = COALESCE($1, current_load),
            memory_usage_mb = COALESCE($2, memory_usage_mb),
            cpu_usage_percent = COALESCE($3, cpu_usage_percent),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        "#,
    )
    .bind(req.current_load)
    .bind(req.memory_usage_mb)
    .bind(req.cpu_usage_percent)
    .bind(worker_id)
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::not_found("Worker"));
    }

    // Get any pending commands for this worker
    let commands: Vec<WorkerCommand> = sqlx::query_as(
        r#"
        SELECT id, command, parameters
        FROM vqm_worker_commands
        WHERE worker_id = $1 AND executed = false
        ORDER BY created_at ASC
        LIMIT 10
        "#,
    )
    .bind(worker_id)
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    // Mark commands as executed
    if !commands.is_empty() {
        let command_ids: Vec<i64> = commands.iter().map(|c| c.id).collect();
        sqlx::query("UPDATE vqm_worker_commands SET executed = true WHERE id = ANY($1)")
            .bind(&command_ids)
            .execute(pool)
            .await?;
    }

    Ok(Json(ApiResponse::success(HeartbeatResponse {
        acknowledged: true,
        server_time: Utc::now(),
        commands,
    })))
}

/// Get worker status
async fn get_worker_status(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<WorkerStatusResponse>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let status: (String, Option<Uuid>, DateTime<Utc>, f64, i64, f64) = sqlx::query_as(
        r#"
        SELECT status, current_job_id, last_heartbeat,
               current_load, memory_usage_mb, cpu_usage_percent
        FROM vqm_workers WHERE id = $1
        "#,
    )
    .bind(worker_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Worker"))?;

    // Check if heartbeat is stale
    let heartbeat_age = Utc::now() - status.2;
    let is_healthy = heartbeat_age < Duration::seconds(60);

    Ok(Json(ApiResponse::success(WorkerStatusResponse {
        worker_id,
        status: status.0,
        current_job_id: status.1,
        last_heartbeat: status.2,
        heartbeat_age_seconds: heartbeat_age.num_seconds(),
        is_healthy,
        current_load: status.3,
        memory_usage_mb: status.4,
        cpu_usage_percent: status.5,
    })))
}

/// Set worker status
async fn set_worker_status(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<SetStatusRequest>,
) -> Result<Json<ApiResponse<WorkerResponse>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Validate status
    let valid_statuses = ["active", "paused", "draining", "idle"];
    if !valid_statuses.contains(&req.status.as_str()) {
        return Err(AppError::validation("Invalid status value"));
    }

    sqlx::query("UPDATE vqm_workers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2")
        .bind(&req.status)
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "worker.status_changed",
            "worker",
            "set_status",
            Some(worker_id),
            Some(&req.status),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let worker = get_worker_by_id(pool, worker_id).await?;

    Ok(Json(ApiResponse::success(worker)))
}

/// Get worker statistics
async fn get_worker_stats(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<WorkerStats>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get basic worker info
    let worker = get_worker_by_id(pool, worker_id).await?;

    // Calculate statistics
    let total_jobs = worker.jobs_completed + worker.jobs_failed;
    let success_rate = if total_jobs > 0 {
        (worker.jobs_completed as f64 / total_jobs as f64) * 100.0
    } else {
        0.0
    };

    // Get processing time stats
    let time_stats: (f64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(AVG(processing_time_ms), 0),
            COALESCE(MIN(processing_time_ms), 0),
            COALESCE(MAX(processing_time_ms), 0)
        FROM vqm_worker_job_history
        WHERE worker_id = $1 AND processing_time_ms IS NOT NULL
        "#,
    )
    .bind(worker_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0, 0));

    // Get recent activity
    let recent_jobs: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'),
            COUNT(*) FILTER (WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '24 hours')
        FROM vqm_worker_job_history
        WHERE worker_id = $1
        "#,
    )
    .bind(worker_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0));

    // Calculate uptime
    let uptime_seconds = (Utc::now() - worker.registered_at).num_seconds();

    // Calculate throughput
    let jobs_per_hour = if uptime_seconds > 0 {
        (total_jobs as f64 / uptime_seconds as f64) * 3600.0
    } else {
        0.0
    };

    let stats = WorkerStats {
        worker_id,
        worker_name: worker.name,
        total_jobs,
        completed_jobs: worker.jobs_completed,
        failed_jobs: worker.jobs_failed,
        success_rate,
        avg_processing_time_ms: time_stats.0,
        min_processing_time_ms: time_stats.1,
        max_processing_time_ms: time_stats.2,
        total_processing_time_ms: worker.total_processing_time_ms,
        jobs_per_hour,
        jobs_per_day: jobs_per_hour * 24.0,
        uptime_seconds,
        active_time_percent: 0.0, // Would need more tracking
        jobs_last_hour: recent_jobs.0,
        jobs_last_24h: recent_jobs.1,
    };

    Ok(Json(ApiResponse::success(stats)))
}

/// Get worker job history
async fn get_worker_history(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<WorkerJobHistory>>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let worker_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let history: Vec<WorkerJobHistory> = sqlx::query_as(
        r#"
        SELECT id, worker_id, message_id, queue_id, message_type,
               status, started_at, completed_at, processing_time_ms, error_message
        FROM vqm_worker_job_history
        WHERE worker_id = $1
        ORDER BY started_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(worker_id)
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM vqm_worker_job_history WHERE worker_id = $1")
            .bind(worker_id)
            .fetch_one(pool)
            .await?;

    let meta = ResponseMeta::new(total.0, params.page, params.per_page);

    Ok(Json(ApiResponse::success_with_meta(history, meta)))
}

/// List worker groups
async fn list_worker_groups(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<WorkerGroupResponse>>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let groups: Vec<WorkerGroupRow> = sqlx::query_as(
        r#"
        SELECT id, name, description, queue_ids, min_workers, max_workers,
               target_workers, current_workers, auto_scale,
               scale_up_threshold, scale_down_threshold,
               created_at, updated_at, metadata
        FROM vqm_worker_groups
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM vqm_worker_groups")
        .fetch_one(pool)
        .await?;

    let responses: Vec<WorkerGroupResponse> = groups.into_iter().map(|g| g.into()).collect();
    let meta = ResponseMeta::new(total.0, params.page, params.per_page);

    Ok(Json(ApiResponse::success_with_meta(responses, meta)))
}

/// Create worker group
async fn create_worker_group(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<WorkerGroupRequest>,
) -> Result<(StatusCode, Json<ApiResponse<WorkerGroupResponse>>), AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();
    let group_id = Uuid::new_v4();
    let metadata = req.metadata.unwrap_or(serde_json::json!({}));

    sqlx::query(
        r#"
        INSERT INTO vqm_worker_groups (
            id, name, description, queue_ids, min_workers, max_workers,
            target_workers, auto_scale, scale_up_threshold, scale_down_threshold,
            metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        "#,
    )
    .bind(group_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.queue_ids)
    .bind(req.min_workers.unwrap_or(1))
    .bind(req.max_workers.unwrap_or(10))
    .bind(req.target_workers.unwrap_or(1))
    .bind(req.auto_scale.unwrap_or(false))
    .bind(req.scale_up_threshold.unwrap_or(0.8))
    .bind(req.scale_down_threshold.unwrap_or(0.2))
    .bind(&metadata)
    .execute(pool)
    .await?;

    let group = get_worker_group_by_id(pool, group_id).await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(group))))
}

/// Get worker group by ID
async fn get_worker_group(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<WorkerGroupResponse>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let group_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let group = get_worker_group_by_id(pool, group_id).await?;

    Ok(Json(ApiResponse::success(group)))
}

/// Update worker group
async fn update_worker_group(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<WorkerGroupRequest>,
) -> Result<Json<ApiResponse<WorkerGroupResponse>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let group_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        UPDATE vqm_worker_groups
        SET name = $1, description = $2, queue_ids = $3, min_workers = $4,
            max_workers = $5, target_workers = $6, auto_scale = $7,
            scale_up_threshold = $8, scale_down_threshold = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.queue_ids)
    .bind(req.min_workers.unwrap_or(1))
    .bind(req.max_workers.unwrap_or(10))
    .bind(req.target_workers.unwrap_or(1))
    .bind(req.auto_scale.unwrap_or(false))
    .bind(req.scale_up_threshold.unwrap_or(0.8))
    .bind(req.scale_down_threshold.unwrap_or(0.2))
    .bind(group_id)
    .execute(pool)
    .await?;

    let group = get_worker_group_by_id(pool, group_id).await?;

    Ok(Json(ApiResponse::success(group)))
}

/// Delete worker group
async fn delete_worker_group(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let group_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Check if group has workers
    let worker_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_workers WHERE group_id = $1 AND status != 'offline'",
    )
    .bind(group_id)
    .fetch_one(pool)
    .await?;

    if worker_count.0 > 0 {
        return Err(AppError::conflict(
            "Cannot delete group with active workers",
        ));
    }

    sqlx::query("DELETE FROM vqm_worker_groups WHERE id = $1")
        .bind(group_id)
        .execute(pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// List workers in a group
async fn list_group_workers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<WorkerSummary>>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let group_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let workers: Vec<WorkerSummary> = sqlx::query_as(
        r#"
        SELECT id, name, hostname, status, current_job_id,
               jobs_completed, jobs_failed, last_heartbeat, current_load
        FROM vqm_workers
        WHERE group_id = $1
        ORDER BY name ASC
        "#,
    )
    .bind(group_id)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(workers)))
}

/// Scale worker group
async fn scale_worker_group(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<ScaleRequest>,
) -> Result<Json<ApiResponse<WorkerGroupResponse>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let group_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get group constraints
    let constraints: (i32, i32) =
        sqlx::query_as("SELECT min_workers, max_workers FROM vqm_worker_groups WHERE id = $1")
            .bind(group_id)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::not_found("Worker group"))?;

    // Validate target count
    let target = req.target_count.max(constraints.0).min(constraints.1);

    sqlx::query(
        "UPDATE vqm_worker_groups SET target_workers = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2"
    )
    .bind(target)
    .bind(group_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "worker_group.scaled",
            "worker_group",
            "scale",
            Some(group_id),
            Some(&target.to_string()),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let group = get_worker_group_by_id(pool, group_id).await?;

    Ok(Json(ApiResponse::success(group)))
}

/// Batch pause workers
async fn batch_pause_workers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BatchWorkerOperation>,
) -> Result<Json<ApiResponse<BatchResult>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let result = sqlx::query(
        "UPDATE vqm_workers SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1)"
    )
    .bind(&req.worker_ids)
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(BatchResult {
        total: req.worker_ids.len() as i32,
        affected: result.rows_affected() as i32,
    })))
}

/// Batch resume workers
async fn batch_resume_workers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BatchWorkerOperation>,
) -> Result<Json<ApiResponse<BatchResult>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let result = sqlx::query(
        "UPDATE vqm_workers SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1)"
    )
    .bind(&req.worker_ids)
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(BatchResult {
        total: req.worker_ids.len() as i32,
        affected: result.rows_affected() as i32,
    })))
}

/// Cleanup stale workers
async fn cleanup_stale_workers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<CleanupResult>>, AppError> {
    if !auth.can_manage_workers() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // Mark workers as offline if no heartbeat for 5 minutes
    let result = sqlx::query(
        r#"
        UPDATE vqm_workers
        SET status = 'offline', updated_at = CURRENT_TIMESTAMP
        WHERE status != 'offline'
          AND last_heartbeat < CURRENT_TIMESTAMP - INTERVAL '5 minutes'
        "#,
    )
    .execute(pool)
    .await?;

    let marked_offline = result.rows_affected() as i32;

    // Release any locks held by offline workers
    let locks_released = sqlx::query(
        r#"
        UPDATE vqm_messages
        SET status = 'pending', locked_by = NULL, locked_until = NULL
        WHERE locked_by IN (
            SELECT id FROM vqm_workers WHERE status = 'offline'
        )
        "#,
    )
    .execute(pool)
    .await?
    .rows_affected() as i32;

    plugin
        .log_audit(
            "workers.cleanup",
            "worker",
            "cleanup",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(CleanupResult {
        workers_marked_offline: marked_offline,
        locks_released,
    })))
}

// -----------------------------------------------------------------------------
// Helper Types and Functions
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct HeartbeatResponse {
    pub acknowledged: bool,
    pub server_time: DateTime<Utc>,
    pub commands: Vec<WorkerCommand>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct WorkerCommand {
    pub id: i64,
    pub command: String,
    pub parameters: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct WorkerStatusResponse {
    pub worker_id: Uuid,
    pub status: String,
    pub current_job_id: Option<Uuid>,
    pub last_heartbeat: DateTime<Utc>,
    pub heartbeat_age_seconds: i64,
    pub is_healthy: bool,
    pub current_load: f64,
    pub memory_usage_mb: i64,
    pub cpu_usage_percent: f64,
}

#[derive(Debug, Serialize)]
pub struct BatchResult {
    pub total: i32,
    pub affected: i32,
}

#[derive(Debug, Serialize)]
pub struct CleanupResult {
    pub workers_marked_offline: i32,
    pub locks_released: i32,
}

#[derive(Debug, sqlx::FromRow)]
struct WorkerRow {
    id: Uuid,
    name: String,
    hostname: Option<String>,
    status: String,
    queue_ids: Vec<Uuid>,
    group_id: Option<Uuid>,
    max_concurrent_jobs: i32,
    current_job_id: Option<Uuid>,
    capabilities: Vec<String>,
    jobs_completed: i64,
    jobs_failed: i64,
    total_processing_time_ms: i64,
    last_heartbeat: DateTime<Utc>,
    current_load: f64,
    memory_usage_mb: i64,
    cpu_usage_percent: f64,
    registered_at: DateTime<Utc>,
    last_job_at: Option<DateTime<Utc>>,
    metadata: serde_json::Value,
}

impl From<WorkerRow> for WorkerResponse {
    fn from(row: WorkerRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            hostname: row.hostname,
            status: row.status,
            queue_ids: row.queue_ids,
            group_id: row.group_id,
            max_concurrent_jobs: row.max_concurrent_jobs,
            current_job_id: row.current_job_id,
            capabilities: row.capabilities,
            jobs_completed: row.jobs_completed,
            jobs_failed: row.jobs_failed,
            total_processing_time_ms: row.total_processing_time_ms,
            last_heartbeat: row.last_heartbeat,
            current_load: row.current_load,
            memory_usage_mb: row.memory_usage_mb,
            cpu_usage_percent: row.cpu_usage_percent,
            registered_at: row.registered_at,
            last_job_at: row.last_job_at,
            metadata: row.metadata,
        }
    }
}

async fn get_worker_by_id(pool: &PgPool, worker_id: Uuid) -> Result<WorkerResponse, AppError> {
    let row: WorkerRow = sqlx::query_as(
        r#"
        SELECT id, name, hostname, status, queue_ids, group_id,
               max_concurrent_jobs, current_job_id, capabilities,
               jobs_completed, jobs_failed, total_processing_time_ms,
               last_heartbeat, current_load, memory_usage_mb, cpu_usage_percent,
               registered_at, last_job_at, metadata
        FROM vqm_workers
        WHERE id = $1
        "#,
    )
    .bind(worker_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Worker"))?;

    Ok(row.into())
}

#[derive(Debug, sqlx::FromRow)]
struct WorkerGroupRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    queue_ids: Vec<Uuid>,
    min_workers: i32,
    max_workers: i32,
    target_workers: i32,
    current_workers: i32,
    auto_scale: bool,
    scale_up_threshold: f64,
    scale_down_threshold: f64,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    metadata: serde_json::Value,
}

impl From<WorkerGroupRow> for WorkerGroupResponse {
    fn from(row: WorkerGroupRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            description: row.description,
            queue_ids: row.queue_ids,
            min_workers: row.min_workers,
            max_workers: row.max_workers,
            target_workers: row.target_workers,
            current_workers: row.current_workers,
            auto_scale: row.auto_scale,
            scale_up_threshold: row.scale_up_threshold,
            scale_down_threshold: row.scale_down_threshold,
            created_at: row.created_at,
            updated_at: row.updated_at,
            metadata: row.metadata,
        }
    }
}

async fn get_worker_group_by_id(
    pool: &PgPool,
    group_id: Uuid,
) -> Result<WorkerGroupResponse, AppError> {
    let row: WorkerGroupRow = sqlx::query_as(
        r#"
        SELECT id, name, description, queue_ids, min_workers, max_workers,
               target_workers, current_workers, auto_scale,
               scale_up_threshold, scale_down_threshold,
               created_at, updated_at, metadata
        FROM vqm_worker_groups
        WHERE id = $1
        "#,
    )
    .bind(group_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Worker group"))?;

    Ok(row.into())
}
