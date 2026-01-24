// =============================================================================
// Visual Queue Manager - Queue API Endpoints
// =============================================================================
// REST API endpoints for queue management operations.
// Points 21-23: Queue CRUD, configuration, and statistics
// =============================================================================

use axum::{
    Router,
    routing::{get, post, put, patch, delete},
    extract::{Path, Query, Extension, Json},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;
use std::sync::Arc;

use super::{
    ApiResponse, ApiError, AppError, ResponseMeta,
    PaginationParams, SortParams, AuthUser,
    validate_request, parse_uuid,
};
use crate::VisualQueueManager;

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

pub fn router() -> Router {
    Router::new()
        // List and search queues
        .route("/", get(list_queues))
        // Create new queue
        .route("/", post(create_queue))
        // Get queue by ID
        .route("/:id", get(get_queue))
        // Update queue
        .route("/:id", put(update_queue))
        // Partial update
        .route("/:id", patch(patch_queue))
        // Delete queue
        .route("/:id", delete(delete_queue))
        // Queue statistics
        .route("/:id/stats", get(get_queue_stats))
        // Queue messages (paginated)
        .route("/:id/messages", get(list_queue_messages))
        // Purge queue messages
        .route("/:id/purge", post(purge_queue))
        // Pause/Resume queue
        .route("/:id/pause", post(pause_queue))
        .route("/:id/resume", post(resume_queue))
        // Queue configuration
        .route("/:id/config", get(get_queue_config))
        .route("/:id/config", put(update_queue_config))
        // Queue workers
        .route("/:id/workers", get(list_queue_workers))
        // Batch operations
        .route("/batch", post(batch_queue_operation))
        // Queue types/templates
        .route("/templates", get(list_queue_templates))
        .route("/templates/:name", get(get_queue_template))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// Queue list query parameters
#[derive(Debug, Deserialize)]
pub struct ListQueuesParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    #[serde(flatten)]
    pub sort: SortParams,
    pub search: Option<String>,
    pub status: Option<String>,
    pub queue_type: Option<String>,
    pub tag: Option<String>,
    pub group_id: Option<Uuid>,
}

/// Create queue request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateQueueRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    #[validate(length(min = 1, max = 255))]
    pub slug: String,
    pub description: Option<String>,
    #[validate(custom = "validate_queue_type")]
    pub queue_type: Option<String>,
    pub config: Option<QueueConfig>,
    pub tags: Option<Vec<String>>,
    pub group_id: Option<Uuid>,
}

fn validate_queue_type(value: &str) -> Result<(), validator::ValidationError> {
    let valid_types = ["fifo", "priority", "delay", "broadcast", "round_robin"];
    if valid_types.contains(&value) {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_queue_type"))
    }
}

/// Update queue request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateQueueRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub config: Option<QueueConfig>,
    pub tags: Option<Vec<String>>,
    pub group_id: Option<Uuid>,
}

/// Queue configuration
#[derive(Debug, Serialize, Deserialize, Default)]
pub struct QueueConfig {
    pub max_retries: Option<i32>,
    pub retry_delay_ms: Option<i32>,
    pub retry_backoff: Option<String>,
    pub max_retry_delay_ms: Option<i32>,
    pub visibility_timeout_ms: Option<i32>,
    pub message_ttl_seconds: Option<i32>,
    pub max_message_size_bytes: Option<i32>,
    pub max_messages: Option<i64>,
    pub max_consumers: Option<i32>,
    pub dlq_enabled: Option<bool>,
    pub dlq_queue_id: Option<Uuid>,
    pub dlq_max_retries: Option<i32>,
    pub rate_limit_per_second: Option<i32>,
    pub priority_levels: Option<i32>,
    pub fifo_deduplication: Option<bool>,
    pub deduplication_window_ms: Option<i32>,
    pub batch_size: Option<i32>,
    pub prefetch_count: Option<i32>,
}

/// Queue response
#[derive(Debug, Serialize)]
pub struct QueueResponse {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub queue_type: String,
    pub status: String,
    pub config: serde_json::Value,
    pub message_count: i64,
    pub pending_count: i64,
    pub processing_count: i64,
    pub completed_count: i64,
    pub failed_count: i64,
    pub dead_letter_count: i64,
    pub tags: Vec<String>,
    pub group_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Queue statistics
#[derive(Debug, Serialize)]
pub struct QueueStats {
    pub queue_id: Uuid,
    pub queue_name: String,
    // Message counts
    pub total_messages: i64,
    pub pending_messages: i64,
    pub processing_messages: i64,
    pub completed_messages: i64,
    pub failed_messages: i64,
    pub dead_letter_messages: i64,
    pub scheduled_messages: i64,
    // Throughput
    pub messages_per_second: f64,
    pub messages_per_minute: f64,
    pub messages_per_hour: f64,
    // Latency
    pub avg_wait_time_ms: f64,
    pub avg_processing_time_ms: f64,
    pub p50_processing_time_ms: f64,
    pub p95_processing_time_ms: f64,
    pub p99_processing_time_ms: f64,
    // Workers
    pub active_workers: i32,
    pub idle_workers: i32,
    // Rates
    pub success_rate: f64,
    pub failure_rate: f64,
    pub retry_rate: f64,
    // Time range
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
}

/// Batch operation request
#[derive(Debug, Deserialize)]
pub struct BatchQueueOperation {
    pub operation: String, // pause, resume, purge, delete
    pub queue_ids: Vec<Uuid>,
}

/// Queue template
#[derive(Debug, Serialize)]
pub struct QueueTemplate {
    pub name: String,
    pub description: String,
    pub queue_type: String,
    pub config: QueueConfig,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// List queues with filtering and pagination
async fn list_queues(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ListQueuesParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<QueueResponse>>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    // Build dynamic query
    let mut query = String::from(
        r#"
        SELECT
            q.id, q.name, q.slug, q.description, q.queue_type, q.status,
            q.config, q.message_count, q.pending_count, q.processing_count,
            q.completed_count, q.failed_count, q.dead_letter_count,
            q.group_id, q.created_at, q.updated_at,
            COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM vqm_queues q
        LEFT JOIN vqm_queue_tags qt ON q.id = qt.queue_id
        LEFT JOIN vqm_tags t ON qt.tag_id = t.id
        WHERE q.is_system_queue = false
        "#
    );

    // Add filters
    if let Some(ref search) = params.search {
        query.push_str(&format!(
            " AND (q.name ILIKE '%{}%' OR q.slug ILIKE '%{}%' OR q.description ILIKE '%{}%')",
            search, search, search
        ));
    }

    if let Some(ref status) = params.status {
        query.push_str(&format!(" AND q.status = '{}'", status));
    }

    if let Some(ref queue_type) = params.queue_type {
        query.push_str(&format!(" AND q.queue_type = '{}'", queue_type));
    }

    if let Some(group_id) = params.group_id {
        query.push_str(&format!(" AND q.group_id = '{}'", group_id));
    }

    query.push_str(" GROUP BY q.id");

    // Add sorting
    let sort_column = match params.sort.sort_by.as_deref() {
        Some("name") => "q.name",
        Some("created_at") => "q.created_at",
        Some("message_count") => "q.message_count",
        Some("status") => "q.status",
        _ => "q.created_at",
    };
    let sort_order = if params.sort.sort_order == "asc" { "ASC" } else { "DESC" };
    query.push_str(&format!(" ORDER BY {} {}", sort_column, sort_order));
    query.push_str(&format!(" LIMIT {} OFFSET {}", params.pagination.per_page, offset));

    // Execute query
    let rows: Vec<QueueRow> = sqlx::query_as(&query)
        .fetch_all(pool)
        .await?;

    // Get total count
    let count_query = r#"
        SELECT COUNT(*) as count FROM vqm_queues WHERE is_system_queue = false
    "#;
    let total: (i64,) = sqlx::query_as(count_query)
        .fetch_one(pool)
        .await?;

    let queues: Vec<QueueResponse> = rows.into_iter().map(|r| r.into()).collect();
    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(queues, meta)))
}

/// Create a new queue
async fn create_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CreateQueueRequest>,
) -> Result<(StatusCode, Json<ApiResponse<QueueResponse>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();

    // Check for duplicate slug
    let existing: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM vqm_queues WHERE slug = $1"
    )
    .bind(&req.slug)
    .fetch_optional(pool)
    .await?;

    if existing.is_some() {
        return Err(AppError::conflict("Queue with this slug already exists"));
    }

    // Build config JSON
    let config = req.config.unwrap_or_default();
    let config_json = serde_json::to_value(&config)
        .map_err(|_| AppError::internal("Failed to serialize config"))?;

    // Insert queue
    let queue_type = req.queue_type.unwrap_or_else(|| "fifo".to_string());
    let queue_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO vqm_queues (
            id, name, slug, description, queue_type, config, group_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#
    )
    .bind(queue_id)
    .bind(&req.name)
    .bind(&req.slug)
    .bind(&req.description)
    .bind(&queue_type)
    .bind(&config_json)
    .bind(&req.group_id)
    .bind(auth.id)
    .execute(pool)
    .await?;

    // Add tags if provided
    if let Some(tags) = req.tags {
        for tag_name in tags {
            // Get or create tag
            let tag_id: (Uuid,) = sqlx::query_as(
                r#"
                INSERT INTO vqm_tags (name) VALUES ($1)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
                "#
            )
            .bind(&tag_name)
            .fetch_one(pool)
            .await?;

            // Link tag to queue
            sqlx::query(
                "INSERT INTO vqm_queue_tags (queue_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING"
            )
            .bind(queue_id)
            .bind(tag_id.0)
            .execute(pool)
            .await?;
        }
    }

    // Log audit event
    plugin.log_audit(
        "queue.created",
        "queue",
        "create",
        Some(queue_id),
        Some(&req.name),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    // Fetch the created queue
    let queue = get_queue_by_id(pool, queue_id).await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(queue))))
}

/// Get queue by ID
async fn get_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<QueueResponse>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let queue = get_queue_by_id(pool, queue_id).await?;

    Ok(Json(ApiResponse::success(queue)))
}

/// Update queue (full replace)
async fn update_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<UpdateQueueRequest>,
) -> Result<Json<ApiResponse<QueueResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get existing queue
    let existing = get_queue_by_id(pool, queue_id).await?;

    // Build update query
    let name = req.name.unwrap_or(existing.name.clone());
    let description = req.description.or(existing.description.clone());
    let config = if let Some(cfg) = req.config {
        serde_json::to_value(&cfg).unwrap_or(existing.config.clone())
    } else {
        existing.config.clone()
    };

    sqlx::query(
        r#"
        UPDATE vqm_queues
        SET name = $1, description = $2, config = $3, group_id = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        "#
    )
    .bind(&name)
    .bind(&description)
    .bind(&config)
    .bind(&req.group_id)
    .bind(queue_id)
    .execute(pool)
    .await?;

    // Update tags if provided
    if let Some(tags) = req.tags {
        // Remove existing tags
        sqlx::query("DELETE FROM vqm_queue_tags WHERE queue_id = $1")
            .bind(queue_id)
            .execute(pool)
            .await?;

        // Add new tags
        for tag_name in tags {
            let tag_id: (Uuid,) = sqlx::query_as(
                r#"
                INSERT INTO vqm_tags (name) VALUES ($1)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
                "#
            )
            .bind(&tag_name)
            .fetch_one(pool)
            .await?;

            sqlx::query(
                "INSERT INTO vqm_queue_tags (queue_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING"
            )
            .bind(queue_id)
            .bind(tag_id.0)
            .execute(pool)
            .await?;
        }
    }

    // Log audit event
    plugin.log_audit(
        "queue.updated",
        "queue",
        "update",
        Some(queue_id),
        Some(&name),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    let queue = get_queue_by_id(pool, queue_id).await?;
    Ok(Json(ApiResponse::success(queue)))
}

/// Partial update queue
async fn patch_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<UpdateQueueRequest>,
) -> Result<Json<ApiResponse<QueueResponse>>, AppError> {
    // Reuse update logic - patch is same as update in our case
    update_queue(Extension(plugin), Path(id), auth, Json(req)).await
}

/// Delete queue
async fn delete_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get queue name for audit
    let queue = get_queue_by_id(pool, queue_id).await?;

    // Check if queue has pending messages
    if queue.pending_count > 0 || queue.processing_count > 0 {
        return Err(AppError::conflict(
            "Cannot delete queue with pending or processing messages. Purge the queue first."
        ));
    }

    // Soft delete the queue
    sqlx::query(
        "UPDATE vqm_queues SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(queue_id)
    .execute(pool)
    .await?;

    // Log audit event
    plugin.log_audit(
        "queue.deleted",
        "queue",
        "delete",
        Some(queue_id),
        Some(&queue.name),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok(StatusCode::NO_CONTENT)
}

/// Get queue statistics
async fn get_queue_stats(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<DateRangeParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<QueueStats>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get queue basic info
    let queue = get_queue_by_id(pool, queue_id).await?;

    // Calculate time range
    let end_time = params.end_date.unwrap_or_else(Utc::now);
    let start_time = params.start_date.unwrap_or_else(|| end_time - chrono::Duration::hours(1));

    // Get throughput stats
    let throughput: (f64, f64, f64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(COUNT(*) / NULLIF(EXTRACT(EPOCH FROM ($2 - $1)), 0), 0) as per_second,
            COALESCE(COUNT(*) / NULLIF(EXTRACT(EPOCH FROM ($2 - $1)) / 60, 0), 0) as per_minute,
            COALESCE(COUNT(*) / NULLIF(EXTRACT(EPOCH FROM ($2 - $1)) / 3600, 0), 0) as per_hour
        FROM vqm_messages
        WHERE queue_id = $3 AND completed_at BETWEEN $1 AND $2
        "#
    )
    .bind(start_time)
    .bind(end_time)
    .bind(queue_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0.0, 0.0));

    // Get latency stats
    let latency: (f64, f64, f64, f64, f64) = sqlx::query_as(
        r#"
        SELECT
            COALESCE(AVG(wait_time_ms), 0) as avg_wait,
            COALESCE(AVG(processing_time_ms), 0) as avg_processing,
            COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p50,
            COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p95,
            COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p99
        FROM vqm_messages
        WHERE queue_id = $1 AND completed_at BETWEEN $2 AND $3
        "#
    )
    .bind(queue_id)
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .unwrap_or((0.0, 0.0, 0.0, 0.0, 0.0));

    // Get worker counts
    let workers: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'idle') as idle
        FROM vqm_workers
        WHERE $1 = ANY(queue_ids) AND status != 'offline'
        "#
    )
    .bind(queue_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0));

    // Calculate rates
    let total_completed = queue.completed_count + queue.failed_count;
    let success_rate = if total_completed > 0 {
        (queue.completed_count as f64 / total_completed as f64) * 100.0
    } else {
        0.0
    };
    let failure_rate = 100.0 - success_rate;

    // Get retry count
    let retry_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_messages WHERE queue_id = $1 AND attempts > 1"
    )
    .bind(queue_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0,));

    let retry_rate = if queue.message_count > 0 {
        (retry_count.0 as f64 / queue.message_count as f64) * 100.0
    } else {
        0.0
    };

    // Get scheduled count
    let scheduled: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_messages WHERE queue_id = $1 AND status = 'scheduled'"
    )
    .bind(queue_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0,));

    let stats = QueueStats {
        queue_id,
        queue_name: queue.name,
        total_messages: queue.message_count,
        pending_messages: queue.pending_count,
        processing_messages: queue.processing_count,
        completed_messages: queue.completed_count,
        failed_messages: queue.failed_count,
        dead_letter_messages: queue.dead_letter_count,
        scheduled_messages: scheduled.0,
        messages_per_second: throughput.0,
        messages_per_minute: throughput.1,
        messages_per_hour: throughput.2,
        avg_wait_time_ms: latency.0,
        avg_processing_time_ms: latency.1,
        p50_processing_time_ms: latency.2,
        p95_processing_time_ms: latency.3,
        p99_processing_time_ms: latency.4,
        active_workers: workers.0 as i32,
        idle_workers: workers.1 as i32,
        success_rate,
        failure_rate,
        retry_rate,
        period_start: start_time,
        period_end: end_time,
    };

    Ok(Json(ApiResponse::success(stats)))
}

/// List messages in a queue
async fn list_queue_messages(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<ListMessagesParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<MessageSummary>>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut query = String::from(
        r#"
        SELECT id, message_type, status, priority, attempts,
               created_at, scheduled_at, started_at, completed_at
        FROM vqm_messages
        WHERE queue_id = $1
        "#
    );

    if let Some(ref status) = params.status {
        query.push_str(&format!(" AND status = '{}'", status));
    }

    query.push_str(&format!(
        " ORDER BY created_at DESC LIMIT {} OFFSET {}",
        params.pagination.per_page, offset
    ));

    let messages: Vec<MessageSummary> = sqlx::query_as(&query)
        .bind(queue_id)
        .fetch_all(pool)
        .await?;

    // Get total count
    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_messages WHERE queue_id = $1"
    )
    .bind(queue_id)
    .fetch_one(pool)
    .await?;

    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(messages, meta)))
}

/// Purge all messages from a queue
async fn purge_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<PurgeRequest>,
) -> Result<Json<ApiResponse<PurgeResult>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let queue = get_queue_by_id(pool, queue_id).await?;

    // Build delete query based on status filter
    let mut query = String::from("DELETE FROM vqm_messages WHERE queue_id = $1");

    if let Some(ref status) = req.status {
        query.push_str(&format!(" AND status = '{}'", status));
    } else {
        // By default, only purge completed and failed messages
        query.push_str(" AND status IN ('completed', 'failed', 'dead', 'cancelled')");
    }

    let result = sqlx::query(&query)
        .bind(queue_id)
        .execute(pool)
        .await?;

    let deleted_count = result.rows_affected() as i64;

    // Update queue counts
    sqlx::query("SELECT vqm_update_queue_stats($1)")
        .bind(queue_id)
        .execute(pool)
        .await?;

    // Log audit event
    plugin.log_audit(
        "queue.purged",
        "queue",
        "purge",
        Some(queue_id),
        Some(&queue.name),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok(Json(ApiResponse::success(PurgeResult {
        queue_id,
        deleted_count,
    })))
}

/// Pause a queue
async fn pause_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<QueueResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        "UPDATE vqm_queues SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(queue_id)
    .execute(pool)
    .await?;

    let queue = get_queue_by_id(pool, queue_id).await?;

    plugin.log_audit(
        "queue.paused",
        "queue",
        "pause",
        Some(queue_id),
        Some(&queue.name),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok(Json(ApiResponse::success(queue)))
}

/// Resume a paused queue
async fn resume_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<QueueResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        "UPDATE vqm_queues SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(queue_id)
    .execute(pool)
    .await?;

    let queue = get_queue_by_id(pool, queue_id).await?;

    plugin.log_audit(
        "queue.resumed",
        "queue",
        "resume",
        Some(queue_id),
        Some(&queue.name),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok(Json(ApiResponse::success(queue)))
}

/// Get queue configuration
async fn get_queue_config(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let config: (serde_json::Value,) = sqlx::query_as(
        "SELECT config FROM vqm_queues WHERE id = $1"
    )
    .bind(queue_id)
    .fetch_one(pool)
    .await?;

    Ok(Json(ApiResponse::success(config.0)))
}

/// Update queue configuration
async fn update_queue_config(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(config): Json<QueueConfig>,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let config_json = serde_json::to_value(&config)
        .map_err(|_| AppError::internal("Failed to serialize config"))?;

    sqlx::query(
        "UPDATE vqm_queues SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2"
    )
    .bind(&config_json)
    .bind(queue_id)
    .execute(pool)
    .await?;

    plugin.log_audit(
        "queue.config_updated",
        "queue",
        "update_config",
        Some(queue_id),
        None,
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok(Json(ApiResponse::success(config_json)))
}

/// List workers assigned to a queue
async fn list_queue_workers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<WorkerSummary>>>, AppError> {
    if !auth.can_manage_workers() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let workers: Vec<WorkerSummary> = sqlx::query_as(
        r#"
        SELECT id, name, status, current_job_id, jobs_completed, jobs_failed, last_heartbeat
        FROM vqm_workers
        WHERE $1 = ANY(queue_ids) AND status != 'offline'
        ORDER BY last_heartbeat DESC
        "#
    )
    .bind(queue_id)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(workers)))
}

/// Batch queue operations
async fn batch_queue_operation(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BatchQueueOperation>,
) -> Result<Json<ApiResponse<BatchResult>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let mut success_count = 0;
    let mut failed_ids = Vec::new();

    for queue_id in &req.queue_ids {
        let result = match req.operation.as_str() {
            "pause" => {
                sqlx::query("UPDATE vqm_queues SET status = 'paused' WHERE id = $1")
                    .bind(queue_id)
                    .execute(pool)
                    .await
            }
            "resume" => {
                sqlx::query("UPDATE vqm_queues SET status = 'active' WHERE id = $1")
                    .bind(queue_id)
                    .execute(pool)
                    .await
            }
            "purge" => {
                sqlx::query("DELETE FROM vqm_messages WHERE queue_id = $1 AND status IN ('completed', 'failed')")
                    .bind(queue_id)
                    .execute(pool)
                    .await
            }
            _ => {
                failed_ids.push(*queue_id);
                continue;
            }
        };

        match result {
            Ok(_) => success_count += 1,
            Err(_) => failed_ids.push(*queue_id),
        }
    }

    Ok(Json(ApiResponse::success(BatchResult {
        operation: req.operation,
        total: req.queue_ids.len() as i32,
        success_count,
        failed_ids,
    })))
}

/// List queue templates
async fn list_queue_templates(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    _auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<QueueTemplate>>>, AppError> {
    let templates = vec![
        QueueTemplate {
            name: "default".to_string(),
            description: "Standard FIFO queue with default settings".to_string(),
            queue_type: "fifo".to_string(),
            config: QueueConfig::default(),
        },
        QueueTemplate {
            name: "priority".to_string(),
            description: "Priority queue with 10 priority levels".to_string(),
            queue_type: "priority".to_string(),
            config: QueueConfig {
                priority_levels: Some(10),
                ..Default::default()
            },
        },
        QueueTemplate {
            name: "delayed".to_string(),
            description: "Queue with delayed message support".to_string(),
            queue_type: "delay".to_string(),
            config: QueueConfig {
                visibility_timeout_ms: Some(30000),
                ..Default::default()
            },
        },
        QueueTemplate {
            name: "broadcast".to_string(),
            description: "Broadcast queue for fan-out patterns".to_string(),
            queue_type: "broadcast".to_string(),
            config: QueueConfig::default(),
        },
        QueueTemplate {
            name: "high-throughput".to_string(),
            description: "Optimized for high message throughput".to_string(),
            queue_type: "fifo".to_string(),
            config: QueueConfig {
                batch_size: Some(100),
                prefetch_count: Some(50),
                rate_limit_per_second: Some(10000),
                ..Default::default()
            },
        },
        QueueTemplate {
            name: "reliable".to_string(),
            description: "High reliability with retries and DLQ".to_string(),
            queue_type: "fifo".to_string(),
            config: QueueConfig {
                max_retries: Some(5),
                retry_delay_ms: Some(5000),
                retry_backoff: Some("exponential".to_string()),
                dlq_enabled: Some(true),
                ..Default::default()
            },
        },
    ];

    Ok(Json(ApiResponse::success(templates)))
}

/// Get a specific queue template
async fn get_queue_template(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(name): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<QueueTemplate>>, AppError> {
    let templates_response = list_queue_templates(Extension(plugin), auth).await?;

    let template = templates_response.0.data
        .and_then(|templates| templates.into_iter().find(|t| t.name == name))
        .ok_or_else(|| AppError::not_found("Template"))?;

    Ok(Json(ApiResponse::success(template)))
}

// -----------------------------------------------------------------------------
// Helper Types and Functions
// -----------------------------------------------------------------------------

#[derive(Debug, sqlx::FromRow)]
struct QueueRow {
    id: Uuid,
    name: String,
    slug: String,
    description: Option<String>,
    queue_type: String,
    status: String,
    config: serde_json::Value,
    message_count: i64,
    pending_count: i64,
    processing_count: i64,
    completed_count: i64,
    failed_count: i64,
    dead_letter_count: i64,
    group_id: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    tags: Vec<String>,
}

impl From<QueueRow> for QueueResponse {
    fn from(row: QueueRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            queue_type: row.queue_type,
            status: row.status,
            config: row.config,
            message_count: row.message_count,
            pending_count: row.pending_count,
            processing_count: row.processing_count,
            completed_count: row.completed_count,
            failed_count: row.failed_count,
            dead_letter_count: row.dead_letter_count,
            tags: row.tags,
            group_id: row.group_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

async fn get_queue_by_id(pool: &PgPool, queue_id: Uuid) -> Result<QueueResponse, AppError> {
    let row: QueueRow = sqlx::query_as(
        r#"
        SELECT
            q.id, q.name, q.slug, q.description, q.queue_type, q.status,
            q.config, q.message_count, q.pending_count, q.processing_count,
            q.completed_count, q.failed_count, q.dead_letter_count,
            q.group_id, q.created_at, q.updated_at,
            COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM vqm_queues q
        LEFT JOIN vqm_queue_tags qt ON q.id = qt.queue_id
        LEFT JOIN vqm_tags t ON qt.tag_id = t.id
        WHERE q.id = $1
        GROUP BY q.id
        "#
    )
    .bind(queue_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Queue"))?;

    Ok(row.into())
}

#[derive(Debug, Deserialize)]
pub struct ListMessagesParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MessageSummary {
    pub id: Uuid,
    pub message_type: String,
    pub status: String,
    pub priority: i32,
    pub attempts: i32,
    pub created_at: DateTime<Utc>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct PurgeRequest {
    pub status: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PurgeResult {
    pub queue_id: Uuid,
    pub deleted_count: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct WorkerSummary {
    pub id: Uuid,
    pub name: String,
    pub status: String,
    pub current_job_id: Option<Uuid>,
    pub jobs_completed: i64,
    pub jobs_failed: i64,
    pub last_heartbeat: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct BatchResult {
    pub operation: String,
    pub total: i32,
    pub success_count: i32,
    pub failed_ids: Vec<Uuid>,
}

use super::DateRangeParams;
