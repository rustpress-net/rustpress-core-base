// =============================================================================
// Visual Queue Manager - Subscriptions API Endpoints
// =============================================================================
// REST API endpoints for webhook subscriptions and notifications.
// Point 33: Webhooks, subscriptions, and event delivery
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
        // List subscriptions
        .route("/", get(list_subscriptions))
        // Create subscription
        .route("/", post(create_subscription))
        // Get subscription
        .route("/:id", get(get_subscription))
        // Update subscription
        .route("/:id", put(update_subscription))
        // Delete subscription
        .route("/:id", delete(delete_subscription))
        // Toggle subscription
        .route("/:id/toggle", post(toggle_subscription))
        // Subscription deliveries
        .route("/:id/deliveries", get(get_deliveries))
        // Retry delivery
        .route("/:id/deliveries/:delivery_id/retry", post(retry_delivery))
        // Test subscription
        .route("/:id/test", post(test_subscription))
        // Verify subscription (for webhook verification)
        .route("/:id/verify", post(verify_subscription))
        // Subscription secret
        .route("/:id/secret", post(regenerate_secret))
        // WebSocket connections
        .route("/websocket/connections", get(list_ws_connections))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// List subscriptions params
#[derive(Debug, Deserialize)]
pub struct ListSubscriptionsParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    pub event_type: Option<String>,
    pub is_active: Option<bool>,
    pub subscription_type: Option<String>,
}

/// Create subscription request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateSubscriptionRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    pub description: Option<String>,
    pub subscription_type: String, // webhook, websocket, email
    pub event_types: Vec<String>,
    pub config: SubscriptionConfig,
    pub filter: Option<serde_json::Value>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubscriptionConfig {
    // For webhook
    pub url: Option<String>,
    pub method: Option<String>,
    pub headers: Option<serde_json::Value>,
    pub timeout_ms: Option<i32>,
    pub include_payload: Option<bool>,
    // For email
    pub email_addresses: Option<Vec<String>>,
    pub email_template: Option<String>,
    // Retry settings
    pub max_retries: Option<i32>,
    pub retry_delay_ms: Option<i32>,
    // Batching
    pub batch_enabled: Option<bool>,
    pub batch_size: Option<i32>,
    pub batch_delay_ms: Option<i32>,
}

/// Subscription response
#[derive(Debug, Serialize)]
pub struct SubscriptionResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub subscription_type: String,
    pub event_types: Vec<String>,
    pub config: serde_json::Value,
    pub filter: Option<serde_json::Value>,
    pub is_active: bool,
    pub is_verified: bool,
    pub secret_key: Option<String>, // Only shown on creation
    pub delivery_count: i64,
    pub success_count: i64,
    pub failure_count: i64,
    pub last_delivery_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Delivery record
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DeliveryRecord {
    pub id: i64,
    pub subscription_id: Uuid,
    pub event_type: String,
    pub event_id: Uuid,
    pub status: String,
    pub attempt: i32,
    pub http_status: Option<i32>,
    pub response_body: Option<String>,
    pub error_message: Option<String>,
    pub delivered_at: DateTime<Utc>,
    pub duration_ms: Option<i64>,
}

/// Test subscription request
#[derive(Debug, Deserialize)]
pub struct TestSubscriptionRequest {
    pub event_type: String,
    pub payload: serde_json::Value,
}

/// Test subscription response
#[derive(Debug, Serialize)]
pub struct TestSubscriptionResponse {
    pub success: bool,
    pub http_status: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: i64,
    pub error: Option<String>,
}

/// WebSocket connection
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct WebSocketConnection {
    pub id: Uuid,
    pub user_id: Uuid,
    pub subscribed_events: Vec<String>,
    pub connected_at: DateTime<Utc>,
    pub last_ping_at: DateTime<Utc>,
    pub messages_sent: i64,
    pub client_info: serde_json::Value,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// List subscriptions
async fn list_subscriptions(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<ListSubscriptionsParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<SubscriptionResponse>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut conditions = vec!["1=1".to_string()];

    if let Some(ref event_type) = params.event_type {
        conditions.push(format!("'{}' = ANY(event_types)", event_type));
    }

    if let Some(active) = params.is_active {
        conditions.push(format!("is_active = {}", active));
    }

    if let Some(ref sub_type) = params.subscription_type {
        conditions.push(format!("subscription_type = '{}'", sub_type));
    }

    let where_clause = conditions.join(" AND ");

    let subscriptions: Vec<SubscriptionRow> = sqlx::query_as(&format!(
        r#"
        SELECT id, name, description, subscription_type, event_types, config,
               filter, is_active, is_verified, delivery_count, success_count,
               failure_count, last_delivery_at, created_at, updated_at
        FROM vqm_subscriptions
        WHERE {}
        ORDER BY name ASC
        LIMIT {} OFFSET {}
        "#,
        where_clause, params.pagination.per_page, offset
    ))
    .fetch_all(pool)
    .await?;

    let total: (i64,) = sqlx::query_as(&format!(
        "SELECT COUNT(*) FROM vqm_subscriptions WHERE {}",
        where_clause
    ))
    .fetch_one(pool)
    .await?;

    let responses: Vec<SubscriptionResponse> =
        subscriptions.into_iter().map(|s| s.into()).collect();
    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(responses, meta)))
}

/// Create subscription
async fn create_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CreateSubscriptionRequest>,
) -> Result<(StatusCode, Json<ApiResponse<SubscriptionResponse>>), AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let pool = plugin.db_pool();
    let sub_id = Uuid::new_v4();

    // Generate secret key for webhook verification
    let secret_key = generate_secret_key();

    let config_json = serde_json::to_value(&req.config)
        .map_err(|_| AppError::internal("Failed to serialize config"))?;

    sqlx::query(
        r#"
        INSERT INTO vqm_subscriptions (
            id, name, description, subscription_type, event_types,
            config, filter, is_active, secret_key, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        "#,
    )
    .bind(sub_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.subscription_type)
    .bind(&req.event_types)
    .bind(&config_json)
    .bind(&req.filter)
    .bind(req.is_active.unwrap_or(true))
    .bind(&secret_key)
    .bind(auth.id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "subscription.created",
            "subscription",
            "create",
            Some(sub_id),
            Some(&req.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let mut subscription = get_subscription_by_id(pool, sub_id).await?;
    // Include secret key only on creation
    subscription.secret_key = Some(secret_key);

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success(subscription)),
    ))
}

/// Get subscription
async fn get_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SubscriptionResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let subscription = get_subscription_by_id(pool, sub_id).await?;

    Ok(Json(ApiResponse::success(subscription)))
}

/// Update subscription
async fn update_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<CreateSubscriptionRequest>,
) -> Result<Json<ApiResponse<SubscriptionResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    validate_request(&req)?;

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let config_json = serde_json::to_value(&req.config)
        .map_err(|_| AppError::internal("Failed to serialize config"))?;

    sqlx::query(
        r#"
        UPDATE vqm_subscriptions
        SET name = $1, description = $2, subscription_type = $3,
            event_types = $4, config = $5, filter = $6, is_active = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        "#,
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.subscription_type)
    .bind(&req.event_types)
    .bind(&config_json)
    .bind(&req.filter)
    .bind(req.is_active.unwrap_or(true))
    .bind(sub_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "subscription.updated",
            "subscription",
            "update",
            Some(sub_id),
            Some(&req.name),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    let subscription = get_subscription_by_id(pool, sub_id).await?;

    Ok(Json(ApiResponse::success(subscription)))
}

/// Delete subscription
async fn delete_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query("DELETE FROM vqm_subscriptions WHERE id = $1")
        .bind(sub_id)
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "subscription.deleted",
            "subscription",
            "delete",
            Some(sub_id),
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(StatusCode::NO_CONTENT)
}

/// Toggle subscription active state
async fn toggle_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SubscriptionResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    sqlx::query(
        "UPDATE vqm_subscriptions SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(sub_id)
    .execute(pool)
    .await?;

    let subscription = get_subscription_by_id(pool, sub_id).await?;

    Ok(Json(ApiResponse::success(subscription)))
}

/// Get delivery history for subscription
async fn get_deliveries(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<DeliveryRecord>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let deliveries: Vec<DeliveryRecord> = sqlx::query_as(
        r#"
        SELECT id, subscription_id, event_type, event_id, status,
               attempt, http_status, response_body, error_message,
               delivered_at, duration_ms
        FROM vqm_subscription_deliveries
        WHERE subscription_id = $1
        ORDER BY delivered_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(sub_id)
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_subscription_deliveries WHERE subscription_id = $1",
    )
    .bind(sub_id)
    .fetch_one(pool)
    .await?;

    let meta = ResponseMeta::new(total.0, params.page, params.per_page);

    Ok(Json(ApiResponse::success_with_meta(deliveries, meta)))
}

/// Retry a failed delivery
async fn retry_delivery(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path((id, delivery_id)): Path<(String, String)>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<DeliveryRecord>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let delivery_id: i64 = delivery_id
        .parse()
        .map_err(|_| AppError::validation("Invalid delivery ID"))?;

    let pool = plugin.db_pool();

    // Get the delivery record
    let delivery: Option<(String, Uuid, serde_json::Value)> = sqlx::query_as(
        r#"
        SELECT d.event_type, d.event_id, e.payload
        FROM vqm_subscription_deliveries d
        JOIN vqm_subscription_events e ON d.event_id = e.id
        WHERE d.id = $1 AND d.subscription_id = $2
        "#,
    )
    .bind(delivery_id)
    .bind(sub_id)
    .fetch_optional(pool)
    .await?;

    let (event_type, event_id, payload) =
        delivery.ok_or_else(|| AppError::not_found("Delivery"))?;

    // Get subscription config
    let subscription = get_subscription_by_id(pool, sub_id).await?;

    // Attempt redelivery
    let result = deliver_webhook(&subscription, &event_type, &payload).await;

    // Record new delivery attempt
    let new_delivery: DeliveryRecord = match result {
        Ok((status, body, duration)) => {
            sqlx::query_as(
                r#"
                INSERT INTO vqm_subscription_deliveries (
                    subscription_id, event_type, event_id, status,
                    attempt, http_status, response_body, delivered_at, duration_ms
                ) VALUES ($1, $2, $3, 'success', 1, $4, $5, CURRENT_TIMESTAMP, $6)
                RETURNING id, subscription_id, event_type, event_id, status,
                          attempt, http_status, response_body, error_message,
                          delivered_at, duration_ms
                "#,
            )
            .bind(sub_id)
            .bind(&event_type)
            .bind(event_id)
            .bind(status)
            .bind(&body)
            .bind(duration)
            .fetch_one(pool)
            .await?
        }
        Err(error) => {
            sqlx::query_as(
                r#"
                INSERT INTO vqm_subscription_deliveries (
                    subscription_id, event_type, event_id, status,
                    attempt, error_message, delivered_at
                ) VALUES ($1, $2, $3, 'failed', 1, $4, CURRENT_TIMESTAMP)
                RETURNING id, subscription_id, event_type, event_id, status,
                          attempt, http_status, response_body, error_message,
                          delivered_at, duration_ms
                "#,
            )
            .bind(sub_id)
            .bind(&event_type)
            .bind(event_id)
            .bind(&error)
            .fetch_one(pool)
            .await?
        }
    };

    Ok(Json(ApiResponse::success(new_delivery)))
}

/// Test subscription with sample event
async fn test_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
    Json(req): Json<TestSubscriptionRequest>,
) -> Result<Json<ApiResponse<TestSubscriptionResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let subscription = get_subscription_by_id(pool, sub_id).await?;

    let start = std::time::Instant::now();
    let result = deliver_webhook(&subscription, &req.event_type, &req.payload).await;
    let duration_ms = start.elapsed().as_millis() as i64;

    let response = match result {
        Ok((status, body, _)) => TestSubscriptionResponse {
            success: true,
            http_status: Some(status),
            response_body: body,
            duration_ms,
            error: None,
        },
        Err(error) => TestSubscriptionResponse {
            success: false,
            http_status: None,
            response_body: None,
            duration_ms,
            error: Some(error),
        },
    };

    Ok(Json(ApiResponse::success(response)))
}

/// Verify subscription ownership (webhook verification)
async fn verify_subscription(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SubscriptionResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    // Send verification request to webhook
    let subscription = get_subscription_by_id(pool, sub_id).await?;

    if subscription.subscription_type != "webhook" {
        return Err(AppError::validation(
            "Only webhook subscriptions can be verified",
        ));
    }

    let url = subscription
        .config
        .get("url")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::validation("Webhook URL not configured"))?;

    // Send verification challenge
    let challenge = Uuid::new_v4().to_string();
    let client = reqwest::Client::new();

    let verification_payload = serde_json::json!({
        "type": "verification",
        "challenge": challenge,
        "subscription_id": sub_id
    });

    let response = client.post(url).json(&verification_payload).send().await;

    match response {
        Ok(resp) => {
            let body = resp.text().await.unwrap_or_default();

            // Check if challenge was echoed back
            if body.contains(&challenge) {
                sqlx::query(
                    "UPDATE vqm_subscriptions SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
                )
                .bind(sub_id)
                .execute(pool)
                .await?;

                let updated = get_subscription_by_id(pool, sub_id).await?;
                return Ok(Json(ApiResponse::success(updated)));
            }

            Err(AppError::validation(
                "Verification challenge not echoed correctly",
            ))
        }
        Err(e) => Err(AppError::validation(format!(
            "Verification request failed: {}",
            e
        ))),
    }
}

/// Regenerate subscription secret key
async fn regenerate_secret(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SecretResponse>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let sub_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let new_secret = generate_secret_key();

    sqlx::query(
        "UPDATE vqm_subscriptions SET secret_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2"
    )
    .bind(&new_secret)
    .bind(sub_id)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "subscription.secret_regenerated",
            "subscription",
            "regenerate_secret",
            Some(sub_id),
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(SecretResponse {
        secret_key: new_secret,
    })))
}

/// List WebSocket connections
async fn list_ws_connections(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<WebSocketConnection>>>, AppError> {
    if !auth.can_manage_queues() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.page - 1) * params.per_page;

    let connections: Vec<WebSocketConnection> = sqlx::query_as(
        r#"
        SELECT id, user_id, subscribed_events, connected_at,
               last_ping_at, messages_sent, client_info
        FROM vqm_websocket_connections
        WHERE is_active = true
        ORDER BY connected_at DESC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(params.per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(Json(ApiResponse::success(connections)))
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

fn generate_secret_key() -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();

    (0..32)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

async fn deliver_webhook(
    subscription: &SubscriptionResponse,
    event_type: &str,
    payload: &serde_json::Value,
) -> Result<(i32, Option<String>, i64), String> {
    let url = subscription
        .config
        .get("url")
        .and_then(|v| v.as_str())
        .ok_or("Webhook URL not configured")?;

    let method = subscription
        .config
        .get("method")
        .and_then(|v| v.as_str())
        .unwrap_or("POST");

    let timeout_ms = subscription
        .config
        .get("timeout_ms")
        .and_then(|v| v.as_i64())
        .unwrap_or(30000) as u64;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(timeout_ms))
        .build()
        .map_err(|e| e.to_string())?;

    let event_payload = serde_json::json!({
        "event_type": event_type,
        "timestamp": Utc::now(),
        "payload": payload
    });

    let start = std::time::Instant::now();

    let request = match method.to_uppercase().as_str() {
        "POST" => client.post(url),
        "PUT" => client.put(url),
        _ => client.post(url),
    };

    // Add custom headers if configured
    let mut request = request.json(&event_payload);

    if let Some(headers) = subscription
        .config
        .get("headers")
        .and_then(|v| v.as_object())
    {
        for (key, value) in headers {
            if let Some(v) = value.as_str() {
                request = request.header(key.as_str(), v);
            }
        }
    }

    let response = request.send().await.map_err(|e| e.to_string())?;
    let duration_ms = start.elapsed().as_millis() as i64;

    let status = response.status().as_u16() as i32;
    let body = response.text().await.ok();

    if status >= 200 && status < 300 {
        Ok((status, body, duration_ms))
    } else {
        Err(format!("HTTP {}: {:?}", status, body))
    }
}

// -----------------------------------------------------------------------------
// Helper Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct SecretResponse {
    pub secret_key: String,
}

#[derive(Debug, sqlx::FromRow)]
struct SubscriptionRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    subscription_type: String,
    event_types: Vec<String>,
    config: serde_json::Value,
    filter: Option<serde_json::Value>,
    is_active: bool,
    is_verified: bool,
    delivery_count: i64,
    success_count: i64,
    failure_count: i64,
    last_delivery_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<SubscriptionRow> for SubscriptionResponse {
    fn from(row: SubscriptionRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            description: row.description,
            subscription_type: row.subscription_type,
            event_types: row.event_types,
            config: row.config,
            filter: row.filter,
            is_active: row.is_active,
            is_verified: row.is_verified,
            secret_key: None, // Never expose secret after creation
            delivery_count: row.delivery_count,
            success_count: row.success_count,
            failure_count: row.failure_count,
            last_delivery_at: row.last_delivery_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

async fn get_subscription_by_id(
    pool: &PgPool,
    sub_id: Uuid,
) -> Result<SubscriptionResponse, AppError> {
    let row: SubscriptionRow = sqlx::query_as(
        r#"
        SELECT id, name, description, subscription_type, event_types, config,
               filter, is_active, is_verified, delivery_count, success_count,
               failure_count, last_delivery_at, created_at, updated_at
        FROM vqm_subscriptions
        WHERE id = $1
        "#,
    )
    .bind(sub_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::not_found("Subscription"))?;

    Ok(row.into())
}
