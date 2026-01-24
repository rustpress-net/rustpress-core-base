// =============================================================================
// Visual Queue Manager - Scheduled Jobs API Endpoints
// =============================================================================
// REST API endpoints for scheduled and recurring jobs.
// Point 34: Job scheduling, cron jobs, and delayed execution
// =============================================================================

use axum::{
    extract::{Extension, Json, Path, Query},
    http::StatusCode,
    routing::{delete, get, post, put},
    Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use super::{
    parse_uuid, validate_request, ApiError, ApiResponse, AppError, AuthUser, PaginationParams,
    ResponseMeta,
};
use crate::VisualQueueManager;

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

pub fn router() -> Router {
    Router::new()
        // List scheduled jobs
        .route("/", get(list_jobs))
        // Create scheduled job
        .route("/", post(create_job))
        // Get job
        .route("/:id", get(get_job))
        // Update job
        .route("/:id", put(update_job))
        // Delete job
        .route("/:id", delete(delete_job))
        // Toggle job enabled
        .route("/:id/toggle", post(toggle_job))
        // Run job immediately
        .route("/:id/run", post(run_job_now))
        // Job executions
        .route("/:id/executions", get(get_job_executions))
        // Cancel execution
        .route("/:id/executions/:exec_id/cancel", post(cancel_execution))
        // Job dependencies
        .route("/:id/dependencies", get(get_job_dependencies))
        .route("/:id/dependencies", post(add_job_dependency))
        .route("/:id/dependencies/:dep_id", delete(remove_job_dependency))
        // Due jobs
        .route("/due", get(list_due_jobs))
        // Pause/Resume all
        .route("/pause-all", post(pause_all_jobs))
        .route("/resume-all", post(resume_all_jobs))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// List jobs params
#[derive(Debug, Deserialize)]
pub struct ListJobsParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    pub schedule_type: Option<String>,
    pub is_enabled: Option<bool>,
    pub queue_id: Option<Uuid>,
}

/// Create job request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateJobRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    pub description: Option<String>,
    pub schedule_type: String, // cron, interval, once
    pub cron_expression: Option<String>,
    pub interval_seconds: Option<i64>,
    pub run_at: Option<DateTime<Utc>>,
    pub timezone: Option<String>,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub priority: Option<i32>,
    pub is_enabled: Option<bool>,
    pub max_retries: Option<i32>,
    pub retry_delay_seconds: Option<i32>,
    pub timeout_seconds: Option<i32>,
    pub max_concurrent: Option<i32>,
    pub jitter_seconds: Option<i32>,
}

/// Job response
#[derive(Debug, Serialize)]
pub struct JobResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub schedule_type: String,
    pub cron_expression: Option<String>,
    pub interval_seconds: Option<i64>,
    pub run_at: Option<DateTime<Utc>>,
    pub timezone: String,
    pub queue_id: Uuid,
    pub queue_name: String,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub priority: i32,
    pub is_enabled: bool,
    pub max_retries: i32,
    pub retry_delay_seconds: i32,
    pub timeout_seconds: i32,
    pub max_concurrent: i32,
    pub jitter_seconds: i32,
    // Execution info
    pub last_run_at: Option<DateTime<Utc>>,
    pub next_run_at: Option<DateTime<Utc>>,
    pub run_count: i64,
    pub success_count: i64,
    pub failure_count: i64,
    pub last_status: Option<String>,
    pub last_error: Option<String>,
    pub last_duration_ms: Option<i64>,
    // Timestamps
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Job execution record
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct JobExecution {
    pub id: i64,
    pub job_id: Uuid,
    pub message_id: Option<Uuid>,
    pub status: String,
    pub attempt: i32,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<i64>,
    pub error_message: Option<String>,
    pub triggered_by: String,
}

/// Job dependency
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct JobDependency {
    pub id: Uuid,
    pub job_id: Uuid,
    pub depends_on_job_id: Uuid,
    pub depends_on_job_name: String,
    pub dependency_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct AddDependencyRequest {
    pub depends_on_job_id: Uuid,
    pub dependency_type: Option<String>, // success, completion, any
}

/// Run job request
#[derive(Debug, Deserialize)]
pub struct RunJobRequest {
    pub payload_override: Option<serde_json::Value>,
    pub priority_override: Option<i32>,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// List scheduled jobs
async fn list_jobs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ListJobsParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<JobResponse>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut conditions = vec!["1=1".to_string()];

    if let Some(ref schedule_type) = params.schedule_type {
        conditions.push(format!("j.schedule_type = '{}'", schedule_type));
    }

    if let Some(enabled) = params.is_enabled {
        conditions.push(format!("j.is_enabled = {}", enabled));
    }

    if let Some(queue_id) = params.queue_id {
        conditions.push(format!("j.queue_id = '{}'", queue_id));
    }

    let where_clause = conditions.join(" AND ");

    let jobs: Vec<JobRow> = sqlx::query_as(&format!(
        r#"
        SELECT j.id, j.name, j.description, j.schedule_type, j.cron_expression,
               j.interval_seconds, j.run_at, j.timezone, j.queue_id, q.name as queue_name,
               j.message_type, j.payload, j.priority, j.is_enabled,
               j.max_retries, j.retry_delay_seconds, j.timeout_seconds,
               j.max_concurrent, j.jitter_seconds,
               j.last_run_at, j.next_run_at, j.run_count, j.success_count,
               j.failure_count, j.last_status, j.last_error, j.last_duration_ms,
               j.created_at, j.updated_at
        FROM vqm_scheduled_jobs j
        JOIN vqm_queues q ON j.queue_id = q.id
        WHERE {}
        ORDER BY j.name ASC
        LIMIT {} OFFSET {}
        "#,
        where_clause, params.pagination.per_page, offset
    ))
    .fetch_all(pool)
    .await?;

    let total: (i64,) = sqlx::query_as(&format!(
        "SELECT COUNT(*) FROM vqm_scheduled_jobs j WHERE {}",
        where_clause
    ))
    .fetch_one(pool)
    .await?;

    let responses: Vec<JobResponse> = jobs.into_iter().map(|j| j.into()).collect();
    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(responses, meta)))
}

/// Create scheduled job
async fn create_job(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CreateJobRequest>,
) -> Result<(StatusCode, Json<ApiResponse<JobResponse>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    // Validate schedule type and required fields
    match req.schedule_type.as_str() {
        "cron" => {
            if req.cron_expression.is_none() {
                return Err(AppError::validation(
                    "cron_expression required for cron schedule type",
                ));
            }
        }
        "interval" => {
            if req.interval_seconds.is_none() {
                return Err(AppError::validation(
                    "interval_seconds required for interval schedule type",
                ));
            }
        }
        "once" => {
            if req.run_at.is_none() {
                return Err(AppError::validation(
                    "run_at required for once schedule type",
                ));
            }
        }
        _ => return Err(AppError::validation("Invalid schedule_type")),
    }

    let pool = plugin.db_pool();
    let job_id = Uuid::new_v4();

    // Calculate next run time
    let next_run_at = calculate_next_run(
        &req.schedule_type,
        req.cron_expression.as_deref(),
        req.interval_seconds,
        req.run_at,
    )?;

    sqlx::query(
        r#"
        INSERT INTO vqm_scheduled_jobs (
            id, name, description, schedule_type, cron_expression,
            interval_seconds, run_at, timezone, queue_id, message_type,
            payload, priority, is_enabled, max_retries, retry_delay_seconds,
            timeout_seconds, max_concurrent, jitter_seconds, next_run_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        "#
    )
    .bind(job_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.schedule_type)
    .bind(&req.cron_expression)
    .bind(req.interval_seconds)
    .bind(req.run_at)
    .bind(req.timezone.as_deref().unwrap_or("UTC"))
    .bind(req.queue_id)
    .bind(&req.message_type)
    .bind(&req.payload)
    .bind(req.priority.unwrap_or(5))
    .bind(req.is_enabled.unwrap_or(true))
    .bind(req.max_retries.unwrap_or(3))
    .bind(req.retry_delay_seconds.unwrap_or(60))
    .bind(req.timeout_seconds.unwrap_or(3600))
    .bind(req.max_concurrent.unwrap_or(1))
    .bind(req.jitter_seconds.unwrap_or(0))
    .bind(next_run_at)
    .bind(auth.id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "scheduled_job.created",
            "scheduled_job",
            "create",
            Some(job_id),
            Some(&req.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let job = get_job_by_id(pool, job_id).await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(job))))
}

/// Get job by ID
async fn get_job(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<JobResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let job = get_job_by_id(pool, job_id).await?;

    Ok(Json(ApiResponse::success(job)))
}

/// Update job
async fn update_job(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<CreateJobRequest>,
) -> Result<Json<ApiResponse<JobResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Calculate new next run time
    let next_run_at = calculate_next_run(
        &req.schedule_type,
        req.cron_expression.as_deref(),
        req.interval_seconds,
        req.run_at,
    )?;

    sqlx::query(
        r#"
        UPDATE vqm_scheduled_jobs
        SET name = $1, description = $2, schedule_type = $3, cron_expression = $4,
            interval_seconds = $5, run_at = $6, timezone = $7, queue_id = $8,
            message_type = $9, payload = $10, priority = $11, is_enabled = $12,
            max_retries = $13, retry_delay_seconds = $14, timeout_seconds = $15,
            max_concurrent = $16, jitter_seconds = $17, next_run_at = $18,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $19
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.schedule_type)
    .bind(&req.cron_expression)
    .bind(req.interval_seconds)
    .bind(req.run_at)
    .bind(req.timezone.as_deref().unwrap_or("UTC"))
    .bind(req.queue_id)
    .bind(&req.message_type)
    .bind(&req.payload)
    .bind(req.priority.unwrap_or(5))
    .bind(req.is_enabled.unwrap_or(true))
    .bind(req.max_retries.unwrap_or(3))
    .bind(req.retry_delay_seconds.unwrap_or(60))
    .bind(req.timeout_seconds.unwrap_or(3600))
    .bind(req.max_concurrent.unwrap_or(1))
    .bind(req.jitter_seconds.unwrap_or(0))
    .bind(next_run_at)
    .bind(job_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "scheduled_job.updated",
            "scheduled_job",
            "update",
            Some(job_id),
            Some(&req.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let job = get_job_by_id(pool, job_id).await?;

    Ok(Json(ApiResponse::success(job)))
}

/// Delete job
async fn delete_job(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Remove dependencies first
    sqlx::query("DELETE FROM vqm_job_dependencies WHERE job_id = $1 OR depends_on_job_id = $1")
        .bind(job_id)
        .execute(pool)
        .await?;

    sqlx::query("DELETE FROM vqm_scheduled_jobs WHERE id = $1")
        .bind(job_id)
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "scheduled_job.deleted",
            "scheduled_job",
            "delete",
            Some(job_id),
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(StatusCode::NO_CONTENT)
}

/// Toggle job enabled state
async fn toggle_job(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<JobResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        "UPDATE vqm_scheduled_jobs SET is_enabled = NOT is_enabled, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(job_id)
    .execute(pool)
    .await?;

    let job = get_job_by_id(pool, job_id).await?;

    Ok(Json(ApiResponse::success(job)))
}

/// Run job immediately
async fn run_job_now(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<RunJobRequest>,
) -> Result<Json<ApiResponse<JobExecution>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get job details
    let job = get_job_by_id(pool, job_id).await?;

    if !job.is_enabled {
        return Err(AppError::conflict("Job is disabled"));
    }

    // Use override values or defaults from job
    let payload = req.payload_override.unwrap_or(job.payload);
    let priority = req.priority_override.unwrap_or(job.priority);

    // Create message
    let message_id = Uuid::new_v4();
    sqlx::query(
        r#"
        INSERT INTO vqm_messages (id, queue_id, message_type, payload, priority, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        "#,
    )
    .bind(message_id)
    .bind(job.queue_id)
    .bind(&job.message_type)
    .bind(&payload)
    .bind(priority)
    .execute(pool)
    .await?;

    // Create execution record
    let execution: JobExecution = sqlx::query_as(
        r#"
        INSERT INTO vqm_scheduled_executions (
            job_id, message_id, status, triggered_by
        ) VALUES ($1, $2, 'running', 'manual')
        RETURNING id, job_id, message_id, status, attempt, started_at,
                  completed_at, duration_ms, error_message, triggered_by
        "#,
    )
    .bind(job_id)
    .bind(message_id)
    .fetch_one(pool)
    .await?;

    // Update job stats
    sqlx::query(
        r#"
        UPDATE vqm_scheduled_jobs
        SET last_run_at = CURRENT_TIMESTAMP, run_count = run_count + 1
        WHERE id = $1
        "#,
    )
    .bind(job_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "scheduled_job.manual_run",
            "scheduled_job",
            "run",
            Some(job_id),
            Some(&job.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(execution)))
}

/// Get job executions
async fn get_job_executions(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<JobExecution>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let executions: Vec<JobExecution> = sqlx::query_as(
        r#"
        SELECT id, job_id, message_id, status, attempt, started_at,
               completed_at, duration_ms, error_message, triggered_by
        FROM vqm_scheduled_executions
        WHERE job_id = $1
        ORDER BY started_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(job_id)
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM vqm_scheduled_executions WHERE job_id = $1")
            .bind(job_id)
            .fetch_one(pool)
            .await?;

    let meta = ResponseMeta::new(total.0, params.page, params.per_page);

    Ok(Json(ApiResponse::success_with_meta(executions, meta)))
}

/// Cancel a running execution
async fn cancel_execution(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path((id, exec_id)): Path<(String, String)>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<JobExecution>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let exec_id: i64 = exec_id
        .parse()
        .map_err(|_| AppError::validation("Invalid execution ID"))?;

    let pool = plugin.db_pool();

    let execution: JobExecution = sqlx::query_as(
        r#"
        UPDATE vqm_scheduled_executions
        SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND job_id = $2 AND status = 'running'
        RETURNING id, job_id, message_id, status, attempt, started_at,
                  completed_at, duration_ms, error_message, triggered_by
        "#,
    )
    .bind(exec_id)
    .bind(job_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Execution"))?;

    // Cancel the associated message if it exists
    if let Some(message_id) = execution.message_id {
        sqlx::query(
            "UPDATE vqm_messages SET status = 'cancelled' WHERE id = $1 AND status IN ('pending', 'scheduled')"
        )
        .bind(message_id)
        .execute(pool)
        .await?;
    }

    Ok(Json(ApiResponse::success(execution)))
}

/// Get job dependencies
async fn get_job_dependencies(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<JobDependency>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let dependencies: Vec<JobDependency> = sqlx::query_as(
        r#"
        SELECT d.id, d.job_id, d.depends_on_job_id, j.name as depends_on_job_name,
               d.dependency_type, d.created_at
        FROM vqm_job_dependencies d
        JOIN vqm_scheduled_jobs j ON d.depends_on_job_id = j.id
        WHERE d.job_id = $1
        ORDER BY j.name ASC
        "#,
    )
    .bind(job_id)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(dependencies)))
}

/// Add job dependency
async fn add_job_dependency(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<AddDependencyRequest>,
) -> Result<(StatusCode, Json<ApiResponse<JobDependency>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Prevent self-dependency
    if job_id == req.depends_on_job_id {
        return Err(AppError::validation("A job cannot depend on itself"));
    }

    // Check for circular dependency
    let circular: Option<(Uuid,)> = sqlx::query_as(
        r#"
        WITH RECURSIVE deps AS (
            SELECT depends_on_job_id FROM vqm_job_dependencies WHERE job_id = $1
            UNION
            SELECT d.depends_on_job_id FROM vqm_job_dependencies d
            JOIN deps ON d.job_id = deps.depends_on_job_id
        )
        SELECT depends_on_job_id FROM deps WHERE depends_on_job_id = $2
        "#,
    )
    .bind(req.depends_on_job_id)
    .bind(job_id)
    .fetch_optional(pool)
    .await?;

    if circular.is_some() {
        return Err(AppError::validation(
            "Adding this dependency would create a circular reference",
        ));
    }

    let dep_id = Uuid::new_v4();
    let dep_type = req.dependency_type.unwrap_or_else(|| "success".to_string());

    sqlx::query(
        r#"
        INSERT INTO vqm_job_dependencies (id, job_id, depends_on_job_id, dependency_type)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(dep_id)
    .bind(job_id)
    .bind(req.depends_on_job_id)
    .bind(&dep_type)
    .execute(pool)
    .await?;

    let dependency: JobDependency = sqlx::query_as(
        r#"
        SELECT d.id, d.job_id, d.depends_on_job_id, j.name as depends_on_job_name,
               d.dependency_type, d.created_at
        FROM vqm_job_dependencies d
        JOIN vqm_scheduled_jobs j ON d.depends_on_job_id = j.id
        WHERE d.id = $1
        "#,
    )
    .bind(dep_id)
    .fetch_one(pool)
    .await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(dependency))))
}

/// Remove job dependency
async fn remove_job_dependency(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path((id, dep_id)): Path<(String, String)>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let job_id = parse_uuid(&id)?;
    let dep_uuid = parse_uuid(&dep_id)?;
    let pool = plugin.db_pool();

    sqlx::query("DELETE FROM vqm_job_dependencies WHERE id = $1 AND job_id = $2")
        .bind(dep_uuid)
        .bind(job_id)
        .execute(pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// List jobs due to run
async fn list_due_jobs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<JobResponse>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let jobs: Vec<JobRow> = sqlx::query_as(
        r#"
        SELECT j.id, j.name, j.description, j.schedule_type, j.cron_expression,
               j.interval_seconds, j.run_at, j.timezone, j.queue_id, q.name as queue_name,
               j.message_type, j.payload, j.priority, j.is_enabled,
               j.max_retries, j.retry_delay_seconds, j.timeout_seconds,
               j.max_concurrent, j.jitter_seconds,
               j.last_run_at, j.next_run_at, j.run_count, j.success_count,
               j.failure_count, j.last_status, j.last_error, j.last_duration_ms,
               j.created_at, j.updated_at
        FROM vqm_scheduled_jobs j
        JOIN vqm_queues q ON j.queue_id = q.id
        WHERE j.is_enabled = true AND j.next_run_at <= CURRENT_TIMESTAMP
        ORDER BY j.next_run_at ASC
        LIMIT 100
        "#,
    )
    .fetch_all(pool)
    .await?;

    let responses: Vec<JobResponse> = jobs.into_iter().map(|j| j.into()).collect();

    Ok(Json(ApiResponse::success(responses)))
}

/// Pause all jobs
async fn pause_all_jobs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<BatchResult>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let result = sqlx::query(
        "UPDATE vqm_scheduled_jobs SET is_enabled = false, updated_at = CURRENT_TIMESTAMP WHERE is_enabled = true"
    )
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "scheduled_jobs.paused_all",
            "scheduled_job",
            "pause_all",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(BatchResult {
        affected: result.rows_affected() as i32,
    })))
}

/// Resume all jobs
async fn resume_all_jobs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<BatchResult>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let result = sqlx::query(
        "UPDATE vqm_scheduled_jobs SET is_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE is_enabled = false"
    )
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "scheduled_jobs.resumed_all",
            "scheduled_job",
            "resume_all",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(BatchResult {
        affected: result.rows_affected() as i32,
    })))
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

fn calculate_next_run(
    schedule_type: &str,
    cron_expression: Option<&str>,
    interval_seconds: Option<i64>,
    run_at: Option<DateTime<Utc>>,
) -> Result<Option<DateTime<Utc>>, AppError> {
    match schedule_type {
        "cron" => {
            // Parse cron expression and calculate next run
            // For now, return immediate next run
            Ok(Some(Utc::now()))
        }
        "interval" => {
            if let Some(secs) = interval_seconds {
                Ok(Some(Utc::now() + chrono::Duration::seconds(secs)))
            } else {
                Ok(None)
            }
        }
        "once" => Ok(run_at),
        _ => Ok(None),
    }
}

// -----------------------------------------------------------------------------
// Helper Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct BatchResult {
    pub affected: i32,
}

#[derive(Debug, sqlx::FromRow)]
struct JobRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    schedule_type: String,
    cron_expression: Option<String>,
    interval_seconds: Option<i64>,
    run_at: Option<DateTime<Utc>>,
    timezone: String,
    queue_id: Uuid,
    queue_name: String,
    message_type: String,
    payload: serde_json::Value,
    priority: i32,
    is_enabled: bool,
    max_retries: i32,
    retry_delay_seconds: i32,
    timeout_seconds: i32,
    max_concurrent: i32,
    jitter_seconds: i32,
    last_run_at: Option<DateTime<Utc>>,
    next_run_at: Option<DateTime<Utc>>,
    run_count: i64,
    success_count: i64,
    failure_count: i64,
    last_status: Option<String>,
    last_error: Option<String>,
    last_duration_ms: Option<i64>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<JobRow> for JobResponse {
    fn from(row: JobRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            description: row.description,
            schedule_type: row.schedule_type,
            cron_expression: row.cron_expression,
            interval_seconds: row.interval_seconds,
            run_at: row.run_at,
            timezone: row.timezone,
            queue_id: row.queue_id,
            queue_name: row.queue_name,
            message_type: row.message_type,
            payload: row.payload,
            priority: row.priority,
            is_enabled: row.is_enabled,
            max_retries: row.max_retries,
            retry_delay_seconds: row.retry_delay_seconds,
            timeout_seconds: row.timeout_seconds,
            max_concurrent: row.max_concurrent,
            jitter_seconds: row.jitter_seconds,
            last_run_at: row.last_run_at,
            next_run_at: row.next_run_at,
            run_count: row.run_count,
            success_count: row.success_count,
            failure_count: row.failure_count,
            last_status: row.last_status,
            last_error: row.last_error,
            last_duration_ms: row.last_duration_ms,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

async fn get_job_by_id(pool: &PgPool, job_id: Uuid) -> Result<JobResponse, AppError> {
    let row: JobRow = sqlx::query_as(
        r#"
        SELECT j.id, j.name, j.description, j.schedule_type, j.cron_expression,
               j.interval_seconds, j.run_at, j.timezone, j.queue_id, q.name as queue_name,
               j.message_type, j.payload, j.priority, j.is_enabled,
               j.max_retries, j.retry_delay_seconds, j.timeout_seconds,
               j.max_concurrent, j.jitter_seconds,
               j.last_run_at, j.next_run_at, j.run_count, j.success_count,
               j.failure_count, j.last_status, j.last_error, j.last_duration_ms,
               j.created_at, j.updated_at
        FROM vqm_scheduled_jobs j
        JOIN vqm_queues q ON j.queue_id = q.id
        WHERE j.id = $1
        "#,
    )
    .bind(job_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Scheduled job"))?;

    Ok(row.into())
}
