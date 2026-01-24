// =============================================================================
// Visual Queue Manager - API Module
// =============================================================================
// REST API endpoints for queue management, message handling, worker control,
// metrics retrieval, and administrative operations.
// =============================================================================

pub mod admin;
pub mod handlers;
pub mod messages;
pub mod metrics;
pub mod queues;
pub mod scheduled;
pub mod subscriptions;
pub mod workers;

use crate::VisualQueueManager;
use axum::{
    extract::Extension,
    middleware,
    routing::{delete, get, patch, post, put},
    Router,
};
use std::sync::Arc;

// -----------------------------------------------------------------------------
// API Router Configuration
// -----------------------------------------------------------------------------

/// Build the complete API router with all endpoints
pub fn build_router(plugin: Arc<VisualQueueManager>) -> Router {
    Router::new()
        // Queue Management (Points 21-23)
        .nest("/queues", queues::router())
        // Message Operations (Points 24-26)
        .nest("/messages", messages::router())
        // Worker Management (Points 27-28)
        .nest("/workers", workers::router())
        // Metrics & Monitoring (Points 29-31)
        .nest("/metrics", metrics::router())
        // Event Handlers (Point 32)
        .nest("/handlers", handlers::router())
        // Subscriptions/Webhooks (Point 33)
        .nest("/subscriptions", subscriptions::router())
        // Scheduled Jobs (Point 34)
        .nest("/scheduled", scheduled::router())
        // Admin Operations (Point 35)
        .nest("/admin", admin::router())
        // Attach plugin state
        .layer(Extension(plugin))
}

// -----------------------------------------------------------------------------
// Common API Types
// -----------------------------------------------------------------------------

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Standard API response wrapper
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ApiError>,
    pub meta: Option<ResponseMeta>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            meta: None,
        }
    }

    pub fn success_with_meta(data: T, meta: ResponseMeta) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            meta: Some(meta),
        }
    }

    pub fn error(error: ApiError) -> ApiResponse<()> {
        ApiResponse {
            success: false,
            data: None,
            error: Some(error),
            meta: None,
        }
    }
}

/// API error details
#[derive(Debug, Serialize)]
pub struct ApiError {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

impl ApiError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: None,
        }
    }

    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = Some(details);
        self
    }

    pub fn not_found(entity: &str) -> Self {
        Self::new("NOT_FOUND", format!("{} not found", entity))
    }

    pub fn validation(message: impl Into<String>) -> Self {
        Self::new("VALIDATION_ERROR", message)
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::new("INTERNAL_ERROR", message)
    }

    pub fn unauthorized() -> Self {
        Self::new("UNAUTHORIZED", "Authentication required")
    }

    pub fn forbidden() -> Self {
        Self::new("FORBIDDEN", "Insufficient permissions")
    }

    pub fn conflict(message: impl Into<String>) -> Self {
        Self::new("CONFLICT", message)
    }

    pub fn rate_limited() -> Self {
        Self::new("RATE_LIMITED", "Too many requests")
    }
}

/// Response metadata for pagination
#[derive(Debug, Serialize)]
pub struct ResponseMeta {
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
    pub total_pages: i32,
}

impl ResponseMeta {
    pub fn new(total: i64, page: i32, per_page: i32) -> Self {
        let total_pages = ((total as f64) / (per_page as f64)).ceil() as i32;
        Self {
            total,
            page,
            per_page,
            total_pages,
        }
    }
}

/// Common pagination parameters
#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    pub page: i32,
    #[serde(default = "default_per_page")]
    pub per_page: i32,
}

fn default_page() -> i32 {
    1
}
fn default_per_page() -> i32 {
    20
}

/// Common sorting parameters
#[derive(Debug, Deserialize)]
pub struct SortParams {
    #[serde(default)]
    pub sort_by: Option<String>,
    #[serde(default = "default_sort_order")]
    pub sort_order: String,
}

fn default_sort_order() -> String {
    "desc".to_string()
}

/// Date range filter
#[derive(Debug, Deserialize)]
pub struct DateRangeParams {
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
}

// -----------------------------------------------------------------------------
// Error Handling
// -----------------------------------------------------------------------------

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

pub struct AppError {
    status: StatusCode,
    error: ApiError,
}

impl AppError {
    pub fn new(status: StatusCode, error: ApiError) -> Self {
        Self { status, error }
    }

    pub fn not_found(entity: &str) -> Self {
        Self::new(StatusCode::NOT_FOUND, ApiError::not_found(entity))
    }

    pub fn validation(message: impl Into<String>) -> Self {
        Self::new(StatusCode::BAD_REQUEST, ApiError::validation(message))
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::internal(message),
        )
    }

    pub fn unauthorized() -> Self {
        Self::new(StatusCode::UNAUTHORIZED, ApiError::unauthorized())
    }

    pub fn forbidden() -> Self {
        Self::new(StatusCode::FORBIDDEN, ApiError::forbidden())
    }

    pub fn conflict(message: impl Into<String>) -> Self {
        Self::new(StatusCode::CONFLICT, ApiError::conflict(message))
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let body = Json(ApiResponse::<()>::error(self.error));
        (self.status, body).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database error: {:?}", err);
        Self::internal("Database operation failed")
    }
}

impl From<redis::RedisError> for AppError {
    fn from(err: redis::RedisError) -> Self {
        tracing::error!("Redis error: {:?}", err);
        Self::internal("Cache operation failed")
    }
}

// -----------------------------------------------------------------------------
// Authentication & Authorization Middleware
// -----------------------------------------------------------------------------

use axum::extract::FromRequestParts;
use axum::http::request::Parts;

/// Authenticated user context
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub roles: Vec<String>,
    pub capabilities: Vec<String>,
}

impl AuthUser {
    pub fn has_capability(&self, capability: &str) -> bool {
        self.capabilities.contains(&capability.to_string())
            || self.capabilities.contains(&"vqm_manage_all".to_string())
    }

    pub fn can_manage_queues(&self) -> bool {
        self.has_capability("vqm_manage_queues")
    }

    pub fn can_manage_workers(&self) -> bool {
        self.has_capability("vqm_manage_workers")
    }

    pub fn can_view_metrics(&self) -> bool {
        self.has_capability("vqm_view_metrics")
    }

    pub fn can_admin(&self) -> bool {
        self.has_capability("vqm_manage_all")
    }
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Extract user from RustPress session/JWT
        // This integrates with RustPress's authentication system

        // Get auth header or session cookie
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok());

        if let Some(token) = auth_header.and_then(|h| h.strip_prefix("Bearer ")) {
            // Validate JWT token with RustPress
            // For now, return error - actual implementation will use rustpress_sdk
            return Err(AppError::unauthorized());
        }

        // Check session cookie
        let session_cookie = parts
            .headers
            .get("Cookie")
            .and_then(|h| h.to_str().ok())
            .and_then(|cookies| {
                cookies
                    .split(';')
                    .find(|c| c.trim().starts_with("rustpress_session="))
                    .map(|c| c.trim().strip_prefix("rustpress_session=").unwrap_or(""))
            });

        if session_cookie.is_none() {
            return Err(AppError::unauthorized());
        }

        // Validate session with RustPress - placeholder
        Err(AppError::unauthorized())
    }
}

/// Optional authentication (for public endpoints)
#[derive(Debug, Clone)]
pub struct MaybeAuthUser(pub Option<AuthUser>);

#[axum::async_trait]
impl<S> FromRequestParts<S> for MaybeAuthUser
where
    S: Send + Sync,
{
    type Rejection = std::convert::Infallible;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        match AuthUser::from_request_parts(parts, state).await {
            Ok(user) => Ok(MaybeAuthUser(Some(user))),
            Err(_) => Ok(MaybeAuthUser(None)),
        }
    }
}

// -----------------------------------------------------------------------------
// Rate Limiting
// -----------------------------------------------------------------------------

use std::collections::HashMap;
use std::sync::RwLock;
use std::time::Instant;

/// Simple in-memory rate limiter
pub struct RateLimiter {
    requests: RwLock<HashMap<String, Vec<Instant>>>,
    max_requests: usize,
    window_secs: u64,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_secs: u64) -> Self {
        Self {
            requests: RwLock::new(HashMap::new()),
            max_requests,
            window_secs,
        }
    }

    pub fn check(&self, key: &str) -> bool {
        let now = Instant::now();
        let mut requests = self.requests.write().unwrap();

        let entry = requests.entry(key.to_string()).or_insert_with(Vec::new);

        // Remove old requests outside the window
        let cutoff = now - std::time::Duration::from_secs(self.window_secs);
        entry.retain(|&t| t > cutoff);

        if entry.len() >= self.max_requests {
            false
        } else {
            entry.push(now);
            true
        }
    }
}

// -----------------------------------------------------------------------------
// Request Validation
// -----------------------------------------------------------------------------

use validator::Validate;

pub fn validate_request<T: Validate>(data: &T) -> Result<(), AppError> {
    data.validate()
        .map_err(|e| AppError::validation(format!("Validation failed: {}", e)))
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/// Parse UUID from string, returning appropriate error
pub fn parse_uuid(s: &str) -> Result<Uuid, AppError> {
    Uuid::parse_str(s).map_err(|_| AppError::validation("Invalid UUID format"))
}

/// Extract request ID from headers or generate new one
pub fn get_request_id(headers: &axum::http::HeaderMap) -> Uuid {
    headers
        .get("X-Request-ID")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| Uuid::parse_str(s).ok())
        .unwrap_or_else(Uuid::new_v4)
}
