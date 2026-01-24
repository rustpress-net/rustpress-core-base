// =============================================================================
// Visual Queue Manager - Event Handlers API Endpoints
// =============================================================================
// REST API endpoints for event handler management.
// Point 32: Event handler registration and routing
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
        // List handlers
        .route("/", get(list_handlers))
        // Create handler
        .route("/", post(create_handler))
        // Get handler
        .route("/:id", get(get_handler))
        // Update handler
        .route("/:id", put(update_handler))
        // Delete handler
        .route("/:id", delete(delete_handler))
        // Toggle handler
        .route("/:id/toggle", post(toggle_handler))
        // Handler executions
        .route("/:id/executions", get(get_handler_executions))
        // Test handler
        .route("/:id/test", post(test_handler))
        // Handler routes
        .route("/:id/routes", get(list_handler_routes))
        .route("/:id/routes", post(create_handler_route))
        .route("/:id/routes/:route_id", delete(delete_handler_route))
        // Circuit breaker
        .route("/:id/circuit-breaker", get(get_circuit_breaker_status))
        .route("/:id/circuit-breaker/reset", post(reset_circuit_breaker))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// List handlers params
#[derive(Debug, Deserialize)]
pub struct ListHandlersParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    pub event_type: Option<String>,
    pub is_enabled: Option<bool>,
    pub handler_type: Option<String>,
}

/// Create handler request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateHandlerRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    pub description: Option<String>,
    pub event_types: Vec<String>,
    pub handler_type: String, // webhook, queue, function
    pub config: HandlerConfig,
    pub priority: Option<i32>,
    pub is_enabled: Option<bool>,
    pub retry_config: Option<RetryConfig>,
    pub circuit_breaker_config: Option<CircuitBreakerConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HandlerConfig {
    // For webhook handlers
    pub url: Option<String>,
    pub method: Option<String>,
    pub headers: Option<serde_json::Value>,
    pub timeout_ms: Option<i32>,
    // For queue handlers
    pub target_queue_id: Option<Uuid>,
    pub transform: Option<serde_json::Value>,
    // For function handlers
    pub function_name: Option<String>,
    pub function_args: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RetryConfig {
    pub max_retries: i32,
    pub retry_delay_ms: i32,
    pub backoff_multiplier: f64,
    pub max_delay_ms: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CircuitBreakerConfig {
    pub failure_threshold: i32,
    pub success_threshold: i32,
    pub timeout_seconds: i32,
}

/// Handler response
#[derive(Debug, Serialize)]
pub struct HandlerResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub event_types: Vec<String>,
    pub handler_type: String,
    pub config: serde_json::Value,
    pub priority: i32,
    pub is_enabled: bool,
    pub retry_config: serde_json::Value,
    pub circuit_breaker_config: serde_json::Value,
    pub circuit_breaker_state: String,
    pub execution_count: i64,
    pub success_count: i64,
    pub failure_count: i64,
    pub last_execution_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Handler execution
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct HandlerExecution {
    pub id: i64,
    pub handler_id: Uuid,
    pub event_type: String,
    pub event_id: Uuid,
    pub status: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<i64>,
    pub attempt: i32,
    pub error_message: Option<String>,
    pub response: Option<serde_json::Value>,
}

/// Handler route
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct HandlerRoute {
    pub id: Uuid,
    pub handler_id: Uuid,
    pub event_type: String,
    pub condition: Option<String>,
    pub priority: i32,
    pub is_enabled: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRouteRequest {
    pub event_type: String,
    pub condition: Option<String>,
    pub priority: Option<i32>,
}

/// Test handler request
#[derive(Debug, Deserialize)]
pub struct TestHandlerRequest {
    pub event_type: String,
    pub payload: serde_json::Value,
}

/// Test handler response
#[derive(Debug, Serialize)]
pub struct TestHandlerResponse {
    pub success: bool,
    pub duration_ms: i64,
    pub response: Option<serde_json::Value>,
    pub error: Option<String>,
}

/// Circuit breaker status
#[derive(Debug, Serialize)]
pub struct CircuitBreakerStatus {
    pub handler_id: Uuid,
    pub state: String, // closed, open, half_open
    pub failure_count: i32,
    pub success_count: i32,
    pub last_failure_at: Option<DateTime<Utc>>,
    pub last_state_change: DateTime<Utc>,
    pub retry_after: Option<DateTime<Utc>>,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// List event handlers
async fn list_handlers(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ListHandlersParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<HandlerResponse>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut conditions = vec!["1=1".to_string()];

    if let Some(ref event_type) = params.event_type {
        conditions.push(format!("'{}' = ANY(event_types)", event_type));
    }

    if let Some(enabled) = params.is_enabled {
        conditions.push(format!("is_enabled = {}", enabled));
    }

    if let Some(ref handler_type) = params.handler_type {
        conditions.push(format!("handler_type = '{}'", handler_type));
    }

    let where_clause = conditions.join(" AND ");

    let handlers: Vec<HandlerRow> = sqlx::query_as(&format!(
        r#"
        SELECT id, name, description, event_types, handler_type, config,
               priority, is_enabled, retry_config, circuit_breaker_config,
               circuit_breaker_state, execution_count, success_count, failure_count,
               last_execution_at, created_at, updated_at
        FROM vqm_event_handlers
        WHERE {}
        ORDER BY priority DESC, name ASC
        LIMIT {} OFFSET {}
        "#,
        where_clause, params.pagination.per_page, offset
    ))
    .fetch_all(pool)
    .await?;

    let total: (i64,) = sqlx::query_as(&format!(
        "SELECT COUNT(*) FROM vqm_event_handlers WHERE {}",
        where_clause
    ))
    .fetch_one(pool)
    .await?;

    let responses: Vec<HandlerResponse> = handlers.into_iter().map(|h| h.into()).collect();
    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(responses, meta)))
}

/// Create event handler
async fn create_handler(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CreateHandlerRequest>,
) -> Result<(StatusCode, Json<ApiResponse<HandlerResponse>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();
    let handler_id = Uuid::new_v4();

    let config_json = serde_json::to_value(&req.config)
        .map_err(|_| AppError::internal("Failed to serialize config"))?;

    let retry_config = req
        .retry_config
        .map(|c| serde_json::to_value(c).unwrap())
        .unwrap_or(serde_json::json!({
            "max_retries": 3,
            "retry_delay_ms": 1000,
            "backoff_multiplier": 2.0,
            "max_delay_ms": 30000
        }));

    let cb_config = req
        .circuit_breaker_config
        .map(|c| serde_json::to_value(c).unwrap())
        .unwrap_or(serde_json::json!({
            "failure_threshold": 5,
            "success_threshold": 2,
            "timeout_seconds": 60
        }));

    sqlx::query(
        r#"
        INSERT INTO vqm_event_handlers (
            id, name, description, event_types, handler_type, config,
            priority, is_enabled, retry_config, circuit_breaker_config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        "#,
    )
    .bind(handler_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.event_types)
    .bind(&req.handler_type)
    .bind(&config_json)
    .bind(req.priority.unwrap_or(0))
    .bind(req.is_enabled.unwrap_or(true))
    .bind(&retry_config)
    .bind(&cb_config)
    .execute(pool)
    .await?;

    // Create routes for each event type
    for event_type in &req.event_types {
        sqlx::query(
            r#"
            INSERT INTO vqm_handler_routes (handler_id, event_type, priority)
            VALUES ($1, $2, $3)
            "#,
        )
        .bind(handler_id)
        .bind(event_type)
        .bind(req.priority.unwrap_or(0))
        .execute(pool)
        .await?;
    }

    plugin
        .log_audit(
            "handler.created",
            "event_handler",
            "create",
            Some(handler_id),
            Some(&req.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let handler = get_handler_by_id(pool, handler_id).await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(handler))))
}

/// Get event handler
async fn get_handler(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<HandlerResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let handler = get_handler_by_id(pool, handler_id).await?;

    Ok(Json(ApiResponse::success(handler)))
}

/// Update event handler
async fn update_handler(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<CreateHandlerRequest>,
) -> Result<Json<ApiResponse<HandlerResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let config_json = serde_json::to_value(&req.config)
        .map_err(|_| AppError::internal("Failed to serialize config"))?;

    let retry_config = req
        .retry_config
        .map(|c| serde_json::to_value(c).unwrap())
        .unwrap_or(serde_json::json!({}));

    let cb_config = req
        .circuit_breaker_config
        .map(|c| serde_json::to_value(c).unwrap())
        .unwrap_or(serde_json::json!({}));

    sqlx::query(
        r#"
        UPDATE vqm_event_handlers
        SET name = $1, description = $2, event_types = $3, handler_type = $4,
            config = $5, priority = $6, is_enabled = $7, retry_config = $8,
            circuit_breaker_config = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.event_types)
    .bind(&req.handler_type)
    .bind(&config_json)
    .bind(req.priority.unwrap_or(0))
    .bind(req.is_enabled.unwrap_or(true))
    .bind(&retry_config)
    .bind(&cb_config)
    .bind(handler_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "handler.updated",
            "event_handler",
            "update",
            Some(handler_id),
            Some(&req.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let handler = get_handler_by_id(pool, handler_id).await?;

    Ok(Json(ApiResponse::success(handler)))
}

/// Delete event handler
async fn delete_handler(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Delete routes first
    sqlx::query("DELETE FROM vqm_handler_routes WHERE handler_id = $1")
        .bind(handler_id)
        .execute(pool)
        .await?;

    // Delete handler
    sqlx::query("DELETE FROM vqm_event_handlers WHERE id = $1")
        .bind(handler_id)
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "handler.deleted",
            "event_handler",
            "delete",
            Some(handler_id),
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(StatusCode::NO_CONTENT)
}

/// Toggle handler enabled state
async fn toggle_handler(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<HandlerResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        "UPDATE vqm_event_handlers SET is_enabled = NOT is_enabled, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(handler_id)
    .execute(pool)
    .await?;

    let handler = get_handler_by_id(pool, handler_id).await?;

    Ok(Json(ApiResponse::success(handler)))
}

/// Get handler executions
async fn get_handler_executions(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<HandlerExecution>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let executions: Vec<HandlerExecution> = sqlx::query_as(
        r#"
        SELECT id, handler_id, event_type, event_id, status,
               started_at, completed_at, duration_ms, attempt,
               error_message, response
        FROM vqm_handler_executions
        WHERE handler_id = $1
        ORDER BY started_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(handler_id)
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(executions)))
}

/// Test handler
async fn test_handler(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<TestHandlerRequest>,
) -> Result<Json<ApiResponse<TestHandlerResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Get handler config
    let handler = get_handler_by_id(pool, handler_id).await?;

    let start = std::time::Instant::now();

    // Execute handler based on type
    let result = match handler.handler_type.as_str() {
        "webhook" => {
            // Test webhook call
            let url = handler
                .config
                .get("url")
                .and_then(|v| v.as_str())
                .ok_or_else(|| AppError::validation("Webhook URL not configured"))?;

            let client = reqwest::Client::new();
            let response = client.post(url).json(&req.payload).send().await;

            match response {
                Ok(resp) => {
                    let status = resp.status();
                    let body = resp.text().await.ok();
                    if status.is_success() {
                        Ok(serde_json::json!({ "status": status.as_u16(), "body": body }))
                    } else {
                        Err(format!("HTTP {}: {:?}", status, body))
                    }
                }
                Err(e) => Err(e.to_string()),
            }
        }
        "queue" => {
            // Test queue routing
            let target_queue_id = handler
                .config
                .get("target_queue_id")
                .and_then(|v| v.as_str())
                .and_then(|s| Uuid::parse_str(s).ok())
                .ok_or_else(|| AppError::validation("Target queue not configured"))?;

            // Verify queue exists
            let exists: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM vqm_queues WHERE id = $1")
                .bind(target_queue_id)
                .fetch_optional(pool)
                .await?;

            if exists.is_some() {
                Ok(serde_json::json!({ "target_queue_id": target_queue_id, "routed": true }))
            } else {
                Err("Target queue not found".to_string())
            }
        }
        _ => Err(format!("Unknown handler type: {}", handler.handler_type)),
    };

    let duration_ms = start.elapsed().as_millis() as i64;

    let response = match result {
        Ok(data) => TestHandlerResponse {
            success: true,
            duration_ms,
            response: Some(data),
            error: None,
        },
        Err(error) => TestHandlerResponse {
            success: false,
            duration_ms,
            response: None,
            error: Some(error),
        },
    };

    Ok(Json(ApiResponse::success(response)))
}

/// List handler routes
async fn list_handler_routes(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<HandlerRoute>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let routes: Vec<HandlerRoute> = sqlx::query_as(
        r#"
        SELECT id, handler_id, event_type, condition, priority, is_enabled, created_at
        FROM vqm_handler_routes
        WHERE handler_id = $1
        ORDER BY priority DESC
        "#,
    )
    .bind(handler_id)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(routes)))
}

/// Create handler route
async fn create_handler_route(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<CreateRouteRequest>,
) -> Result<(StatusCode, Json<ApiResponse<HandlerRoute>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let route_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO vqm_handler_routes (id, handler_id, event_type, condition, priority)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(route_id)
    .bind(handler_id)
    .bind(&req.event_type)
    .bind(&req.condition)
    .bind(req.priority.unwrap_or(0))
    .execute(pool)
    .await?;

    let route: HandlerRoute = sqlx::query_as(
        "SELECT id, handler_id, event_type, condition, priority, is_enabled, created_at FROM vqm_handler_routes WHERE id = $1"
    )
    .bind(route_id)
    .fetch_one(pool)
    .await?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(route))))
}

/// Delete handler route
async fn delete_handler_route(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path((id, route_id)): Path<(String, String)>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let route_uuid = parse_uuid(&route_id)?;
    let pool = plugin.db_pool();

    sqlx::query("DELETE FROM vqm_handler_routes WHERE id = $1 AND handler_id = $2")
        .bind(route_uuid)
        .bind(handler_id)
        .execute(pool)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// Get circuit breaker status
async fn get_circuit_breaker_status(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<CircuitBreakerStatus>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let cb: (String, i32, i32, Option<DateTime<Utc>>, DateTime<Utc>) = sqlx::query_as(
        r#"
        SELECT circuit_breaker_state, cb_failure_count, cb_success_count,
               cb_last_failure_at, cb_last_state_change
        FROM vqm_event_handlers
        WHERE id = $1
        "#,
    )
    .bind(handler_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Handler"))?;

    let retry_after = if cb.0 == "open" {
        // Calculate retry time based on config
        cb.3.map(|last| last + chrono::Duration::seconds(60))
    } else {
        None
    };

    let status = CircuitBreakerStatus {
        handler_id,
        state: cb.0,
        failure_count: cb.1,
        success_count: cb.2,
        last_failure_at: cb.3,
        last_state_change: cb.4,
        retry_after,
    };

    Ok(Json(ApiResponse::success(status)))
}

/// Reset circuit breaker
async fn reset_circuit_breaker(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<CircuitBreakerStatus>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let handler_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        UPDATE vqm_event_handlers
        SET circuit_breaker_state = 'closed',
            cb_failure_count = 0,
            cb_success_count = 0,
            cb_last_state_change = CURRENT_TIMESTAMP
        WHERE id = $1
        "#,
    )
    .bind(handler_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "handler.circuit_breaker_reset",
            "event_handler",
            "reset_circuit_breaker",
            Some(handler_id),
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    // Return updated status
    get_circuit_breaker_status(Extension(plugin), Path(id), auth).await
}

// -----------------------------------------------------------------------------
// Helper Types
// -----------------------------------------------------------------------------

#[derive(Debug, sqlx::FromRow)]
struct HandlerRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    event_types: Vec<String>,
    handler_type: String,
    config: serde_json::Value,
    priority: i32,
    is_enabled: bool,
    retry_config: serde_json::Value,
    circuit_breaker_config: serde_json::Value,
    circuit_breaker_state: String,
    execution_count: i64,
    success_count: i64,
    failure_count: i64,
    last_execution_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<HandlerRow> for HandlerResponse {
    fn from(row: HandlerRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            description: row.description,
            event_types: row.event_types,
            handler_type: row.handler_type,
            config: row.config,
            priority: row.priority,
            is_enabled: row.is_enabled,
            retry_config: row.retry_config,
            circuit_breaker_config: row.circuit_breaker_config,
            circuit_breaker_state: row.circuit_breaker_state,
            execution_count: row.execution_count,
            success_count: row.success_count,
            failure_count: row.failure_count,
            last_execution_at: row.last_execution_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

async fn get_handler_by_id(pool: &PgPool, handler_id: Uuid) -> Result<HandlerResponse, AppError> {
    let row: HandlerRow = sqlx::query_as(
        r#"
        SELECT id, name, description, event_types, handler_type, config,
               priority, is_enabled, retry_config, circuit_breaker_config,
               circuit_breaker_state, execution_count, success_count, failure_count,
               last_execution_at, created_at, updated_at
        FROM vqm_event_handlers
        WHERE id = $1
        "#,
    )
    .bind(handler_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Handler"))?;

    Ok(row.into())
}
