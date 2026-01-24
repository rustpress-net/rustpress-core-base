// =============================================================================
// Visual Queue Manager - Message API Endpoints
// =============================================================================
// REST API endpoints for message operations.
// Points 24-26: Message CRUD, enqueueing, and processing
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
use chrono::{DateTime, Utc, Duration};
use validator::Validate;
use std::sync::Arc;

use super::{
    ApiResponse, ApiError, AppError, ResponseMeta,
    PaginationParams, SortParams, DateRangeParams, AuthUser,
    validate_request, parse_uuid,
};
use crate::VisualQueueManager;

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

pub fn router() -> Router {
    Router::new()
        // List and search messages
        .route("/", get(list_messages))
        // Enqueue new message
        .route("/", post(enqueue_message))
        // Batch enqueue
        .route("/batch", post(batch_enqueue))
        // Get message by ID
        .route("/:id", get(get_message))
        // Update message (metadata only)
        .route("/:id", patch(update_message))
        // Delete/cancel message
        .route("/:id", delete(delete_message))
        // Message actions
        .route("/:id/retry", post(retry_message))
        .route("/:id/requeue", post(requeue_message))
        .route("/:id/cancel", post(cancel_message))
        .route("/:id/move", post(move_message))
        // Message history
        .route("/:id/history", get(get_message_history))
        // Acknowledge message (for workers)
        .route("/:id/ack", post(acknowledge_message))
        .route("/:id/nack", post(negative_acknowledge))
        // Claim message for processing
        .route("/claim", post(claim_messages))
        // Release claimed message
        .route("/:id/release", post(release_message))
        // Search across all queues
        .route("/search", get(search_messages))
        // Bulk operations
        .route("/bulk/retry", post(bulk_retry))
        .route("/bulk/delete", post(bulk_delete))
        .route("/bulk/move", post(bulk_move))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// List messages query parameters
#[derive(Debug, Deserialize)]
pub struct ListMessagesParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    #[serde(flatten)]
    pub sort: SortParams,
    #[serde(flatten)]
    pub date_range: DateRangeParams,
    pub queue_id: Option<Uuid>,
    pub status: Option<String>,
    pub message_type: Option<String>,
    pub priority_min: Option<i32>,
    pub priority_max: Option<i32>,
    pub correlation_id: Option<Uuid>,
    pub has_errors: Option<bool>,
}

/// Enqueue message request
#[derive(Debug, Deserialize, Validate)]
pub struct EnqueueRequest {
    pub queue_id: Uuid,
    #[validate(length(min = 1, max = 100))]
    pub message_type: String,
    pub payload: serde_json::Value,
    pub priority: Option<i32>,
    pub delay_ms: Option<i64>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub ttl_seconds: Option<i32>,
    pub correlation_id: Option<Uuid>,
    pub causation_id: Option<Uuid>,
    pub deduplication_key: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub headers: Option<serde_json::Value>,
}

/// Batch enqueue request
#[derive(Debug, Deserialize, Validate)]
pub struct BatchEnqueueRequest {
    pub queue_id: Uuid,
    #[validate(length(min = 1, max = 1000))]
    pub messages: Vec<BatchMessageItem>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BatchMessageItem {
    pub message_type: String,
    pub payload: serde_json::Value,
    pub priority: Option<i32>,
    pub delay_ms: Option<i64>,
    pub metadata: Option<serde_json::Value>,
}

/// Update message request
#[derive(Debug, Deserialize)]
pub struct UpdateMessageRequest {
    pub priority: Option<i32>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub metadata: Option<serde_json::Value>,
}

/// Move message request
#[derive(Debug, Deserialize)]
pub struct MoveMessageRequest {
    pub target_queue_id: Uuid,
    pub reset_attempts: Option<bool>,
}

/// Claim messages request
#[derive(Debug, Deserialize)]
pub struct ClaimRequest {
    pub queue_id: Uuid,
    pub worker_id: Uuid,
    pub count: Option<i32>,
    pub visibility_timeout_ms: Option<i64>,
}

/// Acknowledge message request
#[derive(Debug, Deserialize)]
pub struct AckRequest {
    pub worker_id: Uuid,
    pub result: Option<serde_json::Value>,
}

/// Negative acknowledge request
#[derive(Debug, Deserialize)]
pub struct NackRequest {
    pub worker_id: Uuid,
    pub error_code: Option<String>,
    pub error_message: Option<String>,
    pub requeue: Option<bool>,
    pub delay_ms: Option<i64>,
}

/// Bulk operation request
#[derive(Debug, Deserialize)]
pub struct BulkOperationRequest {
    pub message_ids: Vec<Uuid>,
    pub target_queue_id: Option<Uuid>, // For bulk move
}

/// Message search parameters
#[derive(Debug, Deserialize)]
pub struct SearchMessagesParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    pub query: String,
    pub queue_ids: Option<Vec<Uuid>>,
    pub statuses: Option<Vec<String>>,
    pub message_types: Option<Vec<String>>,
    #[serde(flatten)]
    pub date_range: DateRangeParams,
}

/// Full message response
#[derive(Debug, Serialize)]
pub struct MessageResponse {
    pub id: Uuid,
    pub queue_id: Uuid,
    pub queue_name: String,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub status: String,
    pub priority: i32,
    pub attempts: i32,
    pub max_attempts: i32,
    // Timestamps
    pub created_at: DateTime<Utc>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    // Tracing
    pub correlation_id: Option<Uuid>,
    pub causation_id: Option<Uuid>,
    pub trace_id: Option<String>,
    // Error info
    pub last_error: Option<String>,
    pub error_count: i32,
    // Worker info
    pub locked_by: Option<Uuid>,
    pub locked_until: Option<DateTime<Utc>>,
    // Performance
    pub wait_time_ms: Option<i64>,
    pub processing_time_ms: Option<i64>,
    // Metadata
    pub metadata: serde_json::Value,
    pub headers: serde_json::Value,
}

/// Message summary for lists
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MessageSummary {
    pub id: Uuid,
    pub queue_id: Uuid,
    pub message_type: String,
    pub status: String,
    pub priority: i32,
    pub attempts: i32,
    pub created_at: DateTime<Utc>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
}

/// Enqueue result
#[derive(Debug, Serialize)]
pub struct EnqueueResult {
    pub id: Uuid,
    pub queue_id: Uuid,
    pub status: String,
    pub position: Option<i64>,
}

/// Batch enqueue result
#[derive(Debug, Serialize)]
pub struct BatchEnqueueResult {
    pub total: i32,
    pub success_count: i32,
    pub failed_count: i32,
    pub message_ids: Vec<Uuid>,
    pub errors: Vec<BatchError>,
}

#[derive(Debug, Serialize)]
pub struct BatchError {
    pub index: i32,
    pub error: String,
}

/// Message history entry
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MessageHistoryEntry {
    pub id: i64,
    pub message_id: Uuid,
    pub event_type: String,
    pub event_data: serde_json::Value,
    pub worker_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

/// Claimed message response
#[derive(Debug, Serialize)]
pub struct ClaimedMessage {
    pub id: Uuid,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub priority: i32,
    pub attempts: i32,
    pub correlation_id: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub headers: serde_json::Value,
    pub lock_until: DateTime<Utc>,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// List messages with filtering and pagination
async fn list_messages(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ListMessagesParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<MessageSummary>>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut conditions = vec!["1=1".to_string()];

    if let Some(queue_id) = params.queue_id {
        conditions.push(format!("m.queue_id = '{}'", queue_id));
    }

    if let Some(ref status) = params.status {
        conditions.push(format!("m.status = '{}'", status));
    }

    if let Some(ref msg_type) = params.message_type {
        conditions.push(format!("m.message_type = '{}'", msg_type));
    }

    if let Some(min) = params.priority_min {
        conditions.push(format!("m.priority >= {}", min));
    }

    if let Some(max) = params.priority_max {
        conditions.push(format!("m.priority <= {}", max));
    }

    if let Some(corr_id) = params.correlation_id {
        conditions.push(format!("m.correlation_id = '{}'", corr_id));
    }

    if let Some(start) = params.date_range.start_date {
        conditions.push(format!("m.created_at >= '{}'", start));
    }

    if let Some(end) = params.date_range.end_date {
        conditions.push(format!("m.created_at <= '{}'", end));
    }

    if params.has_errors == Some(true) {
        conditions.push("m.last_error IS NOT NULL".to_string());
    }

    let where_clause = conditions.join(" AND ");

    let sort_column = match params.sort.sort_by.as_deref() {
        Some("created_at") => "m.created_at",
        Some("priority") => "m.priority",
        Some("status") => "m.status",
        Some("attempts") => "m.attempts",
        _ => "m.created_at",
    };
    let sort_order = if params.sort.sort_order == "asc" { "ASC" } else { "DESC" };

    let query = format!(
        r#"
        SELECT m.id, m.queue_id, m.message_type, m.status, m.priority,
               m.attempts, m.created_at, m.scheduled_at, m.completed_at, m.last_error
        FROM vqm_messages m
        WHERE {}
        ORDER BY {} {}
        LIMIT {} OFFSET {}
        "#,
        where_clause, sort_column, sort_order,
        params.pagination.per_page, offset
    );

    let messages: Vec<MessageSummary> = sqlx::query_as(&query)
        .fetch_all(pool)
        .await?;

    let count_query = format!(
        "SELECT COUNT(*) FROM vqm_messages m WHERE {}",
        where_clause
    );
    let total: (i64,) = sqlx::query_as(&count_query)
        .fetch_one(pool)
        .await?;

    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(messages, meta)))
}

/// Enqueue a new message
async fn enqueue_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<EnqueueRequest>,
) -> Result<(StatusCode, Json<ApiResponse<EnqueueResult>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();

    // Verify queue exists and is active
    let queue: (String, serde_json::Value) = sqlx::query_as(
        "SELECT status, config FROM vqm_queues WHERE id = $1"
    )
    .bind(req.queue_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Queue"))?;

    if queue.0 != "active" {
        return Err(AppError::conflict("Queue is not active"));
    }

    // Check deduplication if key provided
    if let Some(ref dedup_key) = req.deduplication_key {
        let existing: Option<(Uuid,)> = sqlx::query_as(
            r#"
            SELECT id FROM vqm_messages
            WHERE queue_id = $1 AND deduplication_key = $2
            AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
            "#
        )
        .bind(req.queue_id)
        .bind(dedup_key)
        .fetch_optional(pool)
        .await?;

        if let Some((existing_id,)) = existing {
            return Ok((StatusCode::OK, Json(ApiResponse::success(EnqueueResult {
                id: existing_id,
                queue_id: req.queue_id,
                status: "deduplicated".to_string(),
                position: None,
            }))));
        }
    }

    // Calculate scheduled time
    let scheduled_at = if let Some(scheduled) = req.scheduled_at {
        Some(scheduled)
    } else if let Some(delay_ms) = req.delay_ms {
        Some(Utc::now() + Duration::milliseconds(delay_ms))
    } else {
        None
    };

    // Calculate expiration
    let expires_at = req.ttl_seconds.map(|ttl| Utc::now() + Duration::seconds(ttl as i64));

    // Determine initial status
    let status = if scheduled_at.map(|s| s > Utc::now()).unwrap_or(false) {
        "scheduled"
    } else {
        "pending"
    };

    // Get max attempts from queue config
    let max_attempts = queue.1.get("max_retries")
        .and_then(|v| v.as_i64())
        .unwrap_or(3) as i32 + 1;

    let message_id = Uuid::new_v4();
    let metadata = req.metadata.unwrap_or(serde_json::json!({}));
    let headers = req.headers.unwrap_or(serde_json::json!({}));

    sqlx::query(
        r#"
        INSERT INTO vqm_messages (
            id, queue_id, message_type, payload, status, priority,
            max_attempts, scheduled_at, expires_at,
            correlation_id, causation_id, deduplication_key,
            metadata, headers, created_by
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
        "#
    )
    .bind(message_id)
    .bind(req.queue_id)
    .bind(&req.message_type)
    .bind(&req.payload)
    .bind(status)
    .bind(req.priority.unwrap_or(5))
    .bind(max_attempts)
    .bind(scheduled_at)
    .bind(expires_at)
    .bind(req.correlation_id)
    .bind(req.causation_id)
    .bind(&req.deduplication_key)
    .bind(&metadata)
    .bind(&headers)
    .bind(auth.id)
    .execute(pool)
    .await?;

    // Get position in queue
    let position: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_messages WHERE queue_id = $1 AND status = 'pending' AND created_at < (SELECT created_at FROM vqm_messages WHERE id = $2)"
    )
    .bind(req.queue_id)
    .bind(message_id)
    .fetch_one(pool)
    .await
    .unwrap_or((0,));

    // Log audit
    plugin.log_audit(
        "message.enqueued",
        "message",
        "enqueue",
        Some(message_id),
        Some(&req.message_type),
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(EnqueueResult {
        id: message_id,
        queue_id: req.queue_id,
        status: status.to_string(),
        position: Some(position.0 + 1),
    }))))
}

/// Batch enqueue messages
async fn batch_enqueue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BatchEnqueueRequest>,
) -> Result<Json<ApiResponse<BatchEnqueueResult>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();

    // Verify queue exists
    let queue: Option<(String,)> = sqlx::query_as(
        "SELECT status FROM vqm_queues WHERE id = $1"
    )
    .bind(req.queue_id)
    .fetch_optional(pool)
    .await?;

    if queue.is_none() {
        return Err(AppError::not_found("Queue"));
    }

    let mut message_ids = Vec::new();
    let mut errors = Vec::new();
    let mut success_count = 0;

    for (index, item) in req.messages.iter().enumerate() {
        let message_id = Uuid::new_v4();

        let scheduled_at = item.delay_ms.map(|ms| Utc::now() + Duration::milliseconds(ms));
        let status = if scheduled_at.map(|s| s > Utc::now()).unwrap_or(false) {
            "scheduled"
        } else {
            "pending"
        };

        let result = sqlx::query(
            r#"
            INSERT INTO vqm_messages (
                id, queue_id, message_type, payload, status, priority,
                scheduled_at, metadata, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            "#
        )
        .bind(message_id)
        .bind(req.queue_id)
        .bind(&item.message_type)
        .bind(&item.payload)
        .bind(status)
        .bind(item.priority.unwrap_or(5))
        .bind(scheduled_at)
        .bind(&item.metadata.clone().unwrap_or(serde_json::json!({})))
        .bind(auth.id)
        .execute(pool)
        .await;

        match result {
            Ok(_) => {
                message_ids.push(message_id);
                success_count += 1;
            }
            Err(e) => {
                errors.push(BatchError {
                    index: index as i32,
                    error: e.to_string(),
                });
            }
        }
    }

    Ok(Json(ApiResponse::success(BatchEnqueueResult {
        total: req.messages.len() as i32,
        success_count,
        failed_count: errors.len() as i32,
        message_ids,
        errors,
    })))
}

/// Get message by ID
async fn get_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let message = get_message_by_id(pool, message_id).await?;

    Ok(Json(ApiResponse::success(message)))
}

/// Update message (metadata only for pending messages)
async fn update_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<UpdateMessageRequest>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Check if message can be updated
    let status: (String,) = sqlx::query_as(
        "SELECT status FROM vqm_messages WHERE id = $1"
    )
    .bind(message_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Message"))?;

    if !["pending", "scheduled"].contains(&status.0.as_str()) {
        return Err(AppError::conflict("Can only update pending or scheduled messages"));
    }

    // Build update
    if let Some(priority) = req.priority {
        sqlx::query("UPDATE vqm_messages SET priority = $1 WHERE id = $2")
            .bind(priority)
            .bind(message_id)
            .execute(pool)
            .await?;
    }

    if let Some(scheduled_at) = req.scheduled_at {
        let new_status = if scheduled_at > Utc::now() { "scheduled" } else { "pending" };
        sqlx::query("UPDATE vqm_messages SET scheduled_at = $1, status = $2 WHERE id = $3")
            .bind(scheduled_at)
            .bind(new_status)
            .bind(message_id)
            .execute(pool)
            .await?;
    }

    if let Some(metadata) = req.metadata {
        sqlx::query("UPDATE vqm_messages SET metadata = metadata || $1 WHERE id = $2")
            .bind(metadata)
            .bind(message_id)
            .execute(pool)
            .await?;
    }

    let message = get_message_by_id(pool, message_id).await?;

    Ok(Json(ApiResponse::success(message)))
}

/// Delete/cancel a message
async fn delete_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Only delete if not processing
    let result = sqlx::query(
        "DELETE FROM vqm_messages WHERE id = $1 AND status NOT IN ('processing')"
    )
    .bind(message_id)
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::conflict("Cannot delete message that is currently processing"));
    }

    plugin.log_audit(
        "message.deleted",
        "message",
        "delete",
        Some(message_id),
        None,
        Some(auth.id),
        Some(&auth.username),
    ).await;

    Ok(StatusCode::NO_CONTENT)
}

/// Retry a failed message
async fn retry_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Only retry failed or dead messages
    let status: (String, i32, i32) = sqlx::query_as(
        "SELECT status, attempts, max_attempts FROM vqm_messages WHERE id = $1"
    )
    .bind(message_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Message"))?;

    if !["failed", "dead", "cancelled"].contains(&status.0.as_str()) {
        return Err(AppError::conflict("Can only retry failed, dead, or cancelled messages"));
    }

    // Reset for retry
    sqlx::query(
        r#"
        UPDATE vqm_messages
        SET status = 'pending',
            attempts = 0,
            last_error = NULL,
            started_at = NULL,
            completed_at = NULL,
            locked_by = NULL,
            locked_until = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        "#
    )
    .bind(message_id)
    .execute(pool)
    .await?;

    plugin.log_audit(
        "message.retried",
        "message",
        "retry",
        Some(message_id),
        None,
        Some(auth.id),
        Some(&auth.username),
    ).await;

    let message = get_message_by_id(pool, message_id).await?;

    Ok(Json(ApiResponse::success(message)))
}

/// Requeue a message to the beginning
async fn requeue_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    retry_message(Extension(plugin), Path(id), auth).await
}

/// Cancel a message
async fn cancel_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        UPDATE vqm_messages
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status IN ('pending', 'scheduled')
        "#
    )
    .bind(message_id)
    .execute(pool)
    .await?;

    plugin.log_audit(
        "message.cancelled",
        "message",
        "cancel",
        Some(message_id),
        None,
        Some(auth.id),
        Some(&auth.username),
    ).await;

    let message = get_message_by_id(pool, message_id).await?;

    Ok(Json(ApiResponse::success(message)))
}

/// Move message to another queue
async fn move_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<MoveMessageRequest>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Verify target queue exists
    let queue_exists: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM vqm_queues WHERE id = $1 AND status = 'active'"
    )
    .bind(req.target_queue_id)
    .fetch_optional(pool)
    .await?;

    if queue_exists.is_none() {
        return Err(AppError::not_found("Target queue"));
    }

    // Move message
    let mut query = String::from(
        "UPDATE vqm_messages SET queue_id = $1, updated_at = CURRENT_TIMESTAMP"
    );

    if req.reset_attempts.unwrap_or(false) {
        query.push_str(", attempts = 0, last_error = NULL");
    }

    query.push_str(" WHERE id = $2 AND status NOT IN ('processing')");

    let result = sqlx::query(&query)
        .bind(req.target_queue_id)
        .bind(message_id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::conflict("Cannot move message that is currently processing"));
    }

    plugin.log_audit(
        "message.moved",
        "message",
        "move",
        Some(message_id),
        None,
        Some(auth.id),
        Some(&auth.username),
    ).await;

    let message = get_message_by_id(pool, message_id).await?;

    Ok(Json(ApiResponse::success(message)))
}

/// Get message history/audit trail
async fn get_message_history(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<MessageHistoryEntry>>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let history: Vec<MessageHistoryEntry> = sqlx::query_as(
        r#"
        SELECT id, message_id, event_type, event_data, worker_id, created_at
        FROM vqm_message_history
        WHERE message_id = $1
        ORDER BY created_at DESC
        LIMIT 100
        "#
    )
    .bind(message_id)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(history)))
}

/// Acknowledge message completion (for workers)
async fn acknowledge_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Json(req): Json<AckRequest>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Verify worker owns the lock
    let lock_info: Option<(Uuid,)> = sqlx::query_as(
        "SELECT locked_by FROM vqm_messages WHERE id = $1 AND status = 'processing'"
    )
    .bind(message_id)
    .fetch_optional(pool)
    .await?;

    match lock_info {
        Some((locked_by,)) if locked_by == req.worker_id => {
            // Update message as completed
            sqlx::query(
                r#"
                UPDATE vqm_messages
                SET status = 'completed',
                    completed_at = CURRENT_TIMESTAMP,
                    result = $1,
                    locked_by = NULL,
                    locked_until = NULL,
                    processing_time_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                "#
            )
            .bind(&req.result.unwrap_or(serde_json::json!({})))
            .bind(message_id)
            .execute(pool)
            .await?;

            // Update worker stats
            sqlx::query(
                "UPDATE vqm_workers SET jobs_completed = jobs_completed + 1, current_job_id = NULL WHERE id = $1"
            )
            .bind(req.worker_id)
            .execute(pool)
            .await?;

            Ok(Json(ApiResponse::success(())))
        }
        _ => Err(AppError::conflict("Worker does not own the lock on this message")),
    }
}

/// Negative acknowledge (for workers to report failure)
async fn negative_acknowledge(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Json(req): Json<NackRequest>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Verify worker owns the lock
    let msg_info: Option<(Uuid, i32, i32)> = sqlx::query_as(
        "SELECT locked_by, attempts, max_attempts FROM vqm_messages WHERE id = $1 AND status = 'processing'"
    )
    .bind(message_id)
    .fetch_optional(pool)
    .await?;

    match msg_info {
        Some((locked_by, attempts, max_attempts)) if locked_by == req.worker_id => {
            let error_msg = req.error_message.clone().unwrap_or_else(|| "Unknown error".to_string());

            // Determine new status
            let new_status = if req.requeue.unwrap_or(true) && attempts < max_attempts {
                "pending"
            } else if attempts >= max_attempts {
                "dead"
            } else {
                "failed"
            };

            // Calculate retry delay
            let scheduled_at = if new_status == "pending" {
                req.delay_ms.map(|ms| Utc::now() + Duration::milliseconds(ms))
            } else {
                None
            };

            sqlx::query(
                r#"
                UPDATE vqm_messages
                SET status = $1,
                    last_error = $2,
                    error_count = error_count + 1,
                    scheduled_at = COALESCE($3, scheduled_at),
                    locked_by = NULL,
                    locked_until = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                "#
            )
            .bind(new_status)
            .bind(&error_msg)
            .bind(scheduled_at)
            .bind(message_id)
            .execute(pool)
            .await?;

            // Update worker stats
            sqlx::query(
                "UPDATE vqm_workers SET jobs_failed = jobs_failed + 1, current_job_id = NULL WHERE id = $1"
            )
            .bind(req.worker_id)
            .execute(pool)
            .await?;

            Ok(Json(ApiResponse::success(())))
        }
        _ => Err(AppError::conflict("Worker does not own the lock on this message")),
    }
}

/// Claim messages for processing
async fn claim_messages(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Json(req): Json<ClaimRequest>,
) -> Result<Json<ApiResponse<Vec<ClaimedMessage>>>, AppError> {
    let pool = plugin.db_pool();
    let count = req.count.unwrap_or(1).min(100);
    let visibility_timeout = req.visibility_timeout_ms.unwrap_or(30000);
    let lock_until = Utc::now() + Duration::milliseconds(visibility_timeout);

    // Claim messages atomically
    let claimed: Vec<ClaimedMessageRow> = sqlx::query_as(
        r#"
        WITH claimable AS (
            SELECT id
            FROM vqm_messages
            WHERE queue_id = $1
              AND status = 'pending'
              AND (scheduled_at IS NULL OR scheduled_at <= CURRENT_TIMESTAMP)
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            ORDER BY priority DESC, created_at ASC
            LIMIT $2
            FOR UPDATE SKIP LOCKED
        )
        UPDATE vqm_messages m
        SET status = 'processing',
            locked_by = $3,
            locked_until = $4,
            started_at = CURRENT_TIMESTAMP,
            attempts = attempts + 1,
            wait_time_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) * 1000,
            updated_at = CURRENT_TIMESTAMP
        FROM claimable c
        WHERE m.id = c.id
        RETURNING m.id, m.message_type, m.payload, m.priority, m.attempts,
                  m.correlation_id, m.metadata, m.headers
        "#
    )
    .bind(req.queue_id)
    .bind(count)
    .bind(req.worker_id)
    .bind(lock_until)
    .fetch_all(pool)
    .await?;

    // Update worker's current job if single claim
    if claimed.len() == 1 {
        sqlx::query("UPDATE vqm_workers SET current_job_id = $1, status = 'active' WHERE id = $2")
            .bind(claimed[0].id)
            .bind(req.worker_id)
            .execute(pool)
            .await?;
    }

    let messages: Vec<ClaimedMessage> = claimed.into_iter().map(|r| ClaimedMessage {
        id: r.id,
        message_type: r.message_type,
        payload: r.payload,
        priority: r.priority,
        attempts: r.attempts,
        correlation_id: r.correlation_id,
        metadata: r.metadata,
        headers: r.headers,
        lock_until,
    }).collect();

    Ok(Json(ApiResponse::success(messages)))
}

/// Release a claimed message
async fn release_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<()>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        UPDATE vqm_messages
        SET status = 'pending',
            locked_by = NULL,
            locked_until = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'processing'
        "#
    )
    .bind(message_id)
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(())))
}

/// Search messages across all queues
async fn search_messages(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<SearchMessagesParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<MessageSummary>>>, AppError> {
    if !auth.can_manage_queues() && !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    // Build search query with full-text search
    let search_pattern = format!("%{}%", params.query);

    let messages: Vec<MessageSummary> = sqlx::query_as(
        r#"
        SELECT m.id, m.queue_id, m.message_type, m.status, m.priority,
               m.attempts, m.created_at, m.scheduled_at, m.completed_at, m.last_error
        FROM vqm_messages m
        WHERE (
            m.message_type ILIKE $1
            OR m.payload::text ILIKE $1
            OR m.last_error ILIKE $1
            OR m.id::text ILIKE $1
        )
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
        "#
    )
    .bind(&search_pattern)
    .bind(params.pagination.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(messages)))
}

/// Bulk retry messages
async fn bulk_retry(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BulkOperationRequest>,
) -> Result<Json<ApiResponse<BulkResult>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let mut success_count = 0;

    for message_id in &req.message_ids {
        let result = sqlx::query(
            r#"
            UPDATE vqm_messages
            SET status = 'pending', attempts = 0, last_error = NULL,
                started_at = NULL, completed_at = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND status IN ('failed', 'dead', 'cancelled')
            "#
        )
        .bind(message_id)
        .execute(pool)
        .await;

        if result.is_ok() {
            success_count += 1;
        }
    }

    Ok(Json(ApiResponse::success(BulkResult {
        total: req.message_ids.len() as i32,
        success_count,
    })))
}

/// Bulk delete messages
async fn bulk_delete(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BulkOperationRequest>,
) -> Result<Json<ApiResponse<BulkResult>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let result = sqlx::query(
        "DELETE FROM vqm_messages WHERE id = ANY($1) AND status NOT IN ('processing')"
    )
    .bind(&req.message_ids)
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(BulkResult {
        total: req.message_ids.len() as i32,
        success_count: result.rows_affected() as i32,
    })))
}

/// Bulk move messages
async fn bulk_move(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<BulkOperationRequest>,
) -> Result<Json<ApiResponse<BulkResult>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let target_queue_id = req.target_queue_id
        .ok_or_else(|| AppError::validation("target_queue_id is required"))?;

    let pool = plugin.db_pool();

    let result = sqlx::query(
        "UPDATE vqm_messages SET queue_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2) AND status NOT IN ('processing')"
    )
    .bind(target_queue_id)
    .bind(&req.message_ids)
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(BulkResult {
        total: req.message_ids.len() as i32,
        success_count: result.rows_affected() as i32,
    })))
}

// -----------------------------------------------------------------------------
// Helper Types and Functions
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct BulkResult {
    pub total: i32,
    pub success_count: i32,
}

#[derive(Debug, sqlx::FromRow)]
struct ClaimedMessageRow {
    id: Uuid,
    message_type: String,
    payload: serde_json::Value,
    priority: i32,
    attempts: i32,
    correlation_id: Option<Uuid>,
    metadata: serde_json::Value,
    headers: serde_json::Value,
}

async fn get_message_by_id(pool: &PgPool, message_id: Uuid) -> Result<MessageResponse, AppError> {
    let row: MessageRow = sqlx::query_as(
        r#"
        SELECT
            m.id, m.queue_id, q.name as queue_name, m.message_type, m.payload,
            m.status, m.priority, m.attempts, m.max_attempts,
            m.created_at, m.scheduled_at, m.started_at, m.completed_at, m.expires_at,
            m.correlation_id, m.causation_id, m.trace_id,
            m.last_error, m.error_count,
            m.locked_by, m.locked_until,
            m.wait_time_ms, m.processing_time_ms,
            m.metadata, m.headers
        FROM vqm_messages m
        JOIN vqm_queues q ON m.queue_id = q.id
        WHERE m.id = $1
        "#
    )
    .bind(message_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Message"))?;

    Ok(row.into())
}

#[derive(Debug, sqlx::FromRow)]
struct MessageRow {
    id: Uuid,
    queue_id: Uuid,
    queue_name: String,
    message_type: String,
    payload: serde_json::Value,
    status: String,
    priority: i32,
    attempts: i32,
    max_attempts: i32,
    created_at: DateTime<Utc>,
    scheduled_at: Option<DateTime<Utc>>,
    started_at: Option<DateTime<Utc>>,
    completed_at: Option<DateTime<Utc>>,
    expires_at: Option<DateTime<Utc>>,
    correlation_id: Option<Uuid>,
    causation_id: Option<Uuid>,
    trace_id: Option<String>,
    last_error: Option<String>,
    error_count: i32,
    locked_by: Option<Uuid>,
    locked_until: Option<DateTime<Utc>>,
    wait_time_ms: Option<i64>,
    processing_time_ms: Option<i64>,
    metadata: serde_json::Value,
    headers: serde_json::Value,
}

impl From<MessageRow> for MessageResponse {
    fn from(row: MessageRow) -> Self {
        Self {
            id: row.id,
            queue_id: row.queue_id,
            queue_name: row.queue_name,
            message_type: row.message_type,
            payload: row.payload,
            status: row.status,
            priority: row.priority,
            attempts: row.attempts,
            max_attempts: row.max_attempts,
            created_at: row.created_at,
            scheduled_at: row.scheduled_at,
            started_at: row.started_at,
            completed_at: row.completed_at,
            expires_at: row.expires_at,
            correlation_id: row.correlation_id,
            causation_id: row.causation_id,
            trace_id: row.trace_id,
            last_error: row.last_error,
            error_count: row.error_count,
            locked_by: row.locked_by,
            locked_until: row.locked_until,
            wait_time_ms: row.wait_time_ms,
            processing_time_ms: row.processing_time_ms,
            metadata: row.metadata,
            headers: row.headers,
        }
    }
}
