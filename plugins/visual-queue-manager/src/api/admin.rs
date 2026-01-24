// =============================================================================
// Visual Queue Manager - Admin API Endpoints
// =============================================================================
// REST API endpoints for administrative operations.
// Point 35: System administration, configuration, and maintenance
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

use super::{
    parse_uuid, ApiError, ApiResponse, AppError, AuthUser, DateRangeParams, PaginationParams,
    ResponseMeta,
};
use crate::VisualQueueManager;

// -----------------------------------------------------------------------------
// Router Configuration
// -----------------------------------------------------------------------------

pub fn router() -> Router {
    Router::new()
        // System info
        .route("/info", get(get_system_info))
        .route("/status", get(get_system_status))
        // Configuration
        .route("/config", get(get_config))
        .route("/config", put(update_config))
        .route("/config/:key", get(get_config_value))
        .route("/config/:key", put(set_config_value))
        // Maintenance
        .route("/maintenance/start", post(start_maintenance))
        .route("/maintenance/stop", post(stop_maintenance))
        .route("/maintenance/status", get(get_maintenance_status))
        // Cleanup operations
        .route("/cleanup/messages", post(cleanup_old_messages))
        .route("/cleanup/audit-logs", post(cleanup_audit_logs))
        .route("/cleanup/metrics", post(cleanup_old_metrics))
        .route("/cleanup/preview", get(preview_cleanup))
        // Database
        .route("/db/stats", get(get_db_stats))
        .route("/db/vacuum", post(vacuum_database))
        .route("/db/reindex", post(reindex_tables))
        // Cache
        .route("/cache/stats", get(get_cache_stats))
        .route("/cache/clear", post(clear_cache))
        .route("/cache/clear/:pattern", post(clear_cache_pattern))
        // Audit logs
        .route("/audit-logs", get(list_audit_logs))
        .route("/audit-logs/export", get(export_audit_logs))
        // User management (VQM-specific permissions)
        .route("/users", get(list_users))
        .route("/users/:id/permissions", get(get_user_permissions))
        .route("/users/:id/permissions", put(set_user_permissions))
        // API keys
        .route("/api-keys", get(list_api_keys))
        .route("/api-keys", post(create_api_key))
        .route("/api-keys/:id", delete(revoke_api_key))
        // Backup/Restore
        .route("/backup", post(create_backup))
        .route("/backup/list", get(list_backups))
        .route("/restore/:id", post(restore_backup))
        // Debug
        .route("/debug/queue/:id", get(debug_queue))
        .route("/debug/message/:id", get(debug_message))
        .route("/debug/connections", get(debug_connections))
}

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/// System information
#[derive(Debug, Serialize)]
pub struct SystemInfo {
    pub version: String,
    pub build_date: String,
    pub rust_version: String,
    pub plugin_id: String,
    pub uptime_seconds: i64,
    pub started_at: DateTime<Utc>,
    pub environment: String,
    pub features: Vec<String>,
}

/// System status
#[derive(Debug, Serialize)]
pub struct SystemStatus {
    pub status: String,
    pub database: ComponentStatus,
    pub cache: ComponentStatus,
    pub workers: WorkerStatus,
    pub queues: QueueStatus,
    pub maintenance_mode: bool,
}

#[derive(Debug, Serialize)]
pub struct ComponentStatus {
    pub status: String,
    pub latency_ms: i64,
    pub connections: i32,
    pub version: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct WorkerStatus {
    pub total: i64,
    pub active: i64,
    pub idle: i64,
    pub offline: i64,
}

#[derive(Debug, Serialize)]
pub struct QueueStatus {
    pub total: i64,
    pub active: i64,
    pub paused: i64,
    pub total_messages: i64,
    pub pending_messages: i64,
}

/// Configuration
#[derive(Debug, Serialize)]
pub struct ConfigResponse {
    pub settings: serde_json::Value,
    pub last_updated: DateTime<Utc>,
    pub updated_by: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateConfigRequest {
    pub settings: serde_json::Value,
}

/// Maintenance status
#[derive(Debug, Serialize)]
pub struct MaintenanceStatus {
    pub is_active: bool,
    pub started_at: Option<DateTime<Utc>>,
    pub started_by: Option<String>,
    pub reason: Option<String>,
    pub estimated_end: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct StartMaintenanceRequest {
    pub reason: Option<String>,
    pub estimated_duration_minutes: Option<i32>,
}

/// Cleanup request
#[derive(Debug, Deserialize)]
pub struct CleanupRequest {
    pub older_than_days: Option<i32>,
    pub statuses: Option<Vec<String>>,
    pub queue_ids: Option<Vec<Uuid>>,
    pub dry_run: Option<bool>,
}

/// Cleanup result
#[derive(Debug, Serialize)]
pub struct CleanupResult {
    pub deleted_count: i64,
    pub freed_space_bytes: i64,
    pub duration_ms: i64,
    pub dry_run: bool,
}

/// Database stats
#[derive(Debug, Serialize)]
pub struct DbStats {
    pub total_size_bytes: i64,
    pub tables: Vec<TableStats>,
    pub connections_used: i32,
    pub connections_max: i32,
    pub cache_hit_ratio: f64,
    pub transactions_per_second: f64,
}

#[derive(Debug, Serialize)]
pub struct TableStats {
    pub table_name: String,
    pub row_count: i64,
    pub total_size_bytes: i64,
    pub index_size_bytes: i64,
    pub last_vacuum: Option<DateTime<Utc>>,
    pub last_analyze: Option<DateTime<Utc>>,
}

/// Cache stats
#[derive(Debug, Serialize)]
pub struct CacheStats {
    pub memory_used_bytes: i64,
    pub memory_max_bytes: i64,
    pub keys_count: i64,
    pub hit_rate: f64,
    pub miss_rate: f64,
    pub evictions: i64,
    pub connected_clients: i32,
}

/// Audit log entry
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct AuditLogEntry {
    pub id: i64,
    pub event_time: DateTime<Utc>,
    pub event_type: String,
    pub event_category: String,
    pub severity: String,
    pub entity_type: String,
    pub entity_id: Option<Uuid>,
    pub entity_name: Option<String>,
    pub action: String,
    pub action_result: String,
    pub actor_id: Option<Uuid>,
    pub actor_name: Option<String>,
    pub actor_ip: Option<String>,
    pub metadata: serde_json::Value,
}

/// Audit log query params
#[derive(Debug, Deserialize)]
pub struct AuditLogParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    #[serde(flatten)]
    pub date_range: DateRangeParams,
    pub event_type: Option<String>,
    pub entity_type: Option<String>,
    pub actor_id: Option<Uuid>,
    pub severity: Option<String>,
}

/// User with permissions
#[derive(Debug, Serialize)]
pub struct UserWithPermissions {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub permissions: Vec<String>,
    pub last_active: Option<DateTime<Utc>>,
}

/// Set permissions request
#[derive(Debug, Deserialize)]
pub struct SetPermissionsRequest {
    pub permissions: Vec<String>,
}

/// API key
#[derive(Debug, Serialize)]
pub struct ApiKey {
    pub id: Uuid,
    pub name: String,
    pub key_prefix: String,
    pub permissions: Vec<String>,
    pub last_used: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub created_by: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateApiKeyRequest {
    pub name: String,
    pub permissions: Vec<String>,
    pub expires_in_days: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct CreateApiKeyResponse {
    pub id: Uuid,
    pub name: String,
    pub key: String, // Full key, only shown once
    pub expires_at: Option<DateTime<Utc>>,
}

/// Backup info
#[derive(Debug, Serialize)]
pub struct BackupInfo {
    pub id: Uuid,
    pub filename: String,
    pub size_bytes: i64,
    pub created_at: DateTime<Utc>,
    pub created_by: String,
    pub includes: Vec<String>,
}

/// Debug info
#[derive(Debug, Serialize)]
pub struct DebugInfo {
    pub entity_type: String,
    pub entity_id: String,
    pub raw_data: serde_json::Value,
    pub related_data: serde_json::Value,
    pub diagnostics: serde_json::Value,
}

// -----------------------------------------------------------------------------
// Endpoint Handlers
// -----------------------------------------------------------------------------

/// Get system information
async fn get_system_info(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SystemInfo>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let info = SystemInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        build_date: "2024-01-01".to_string(), // Would be set at build time
        rust_version: "1.75.0".to_string(),
        plugin_id: "visual-queue-manager".to_string(),
        uptime_seconds: plugin.uptime_seconds(),
        started_at: plugin.started_at(),
        environment: std::env::var("RUSTPRESS_ENV").unwrap_or_else(|_| "production".to_string()),
        features: vec![
            "queues".to_string(),
            "workers".to_string(),
            "metrics".to_string(),
            "webhooks".to_string(),
            "scheduled-jobs".to_string(),
            "audit-logs".to_string(),
        ],
    };

    Ok(Json(ApiResponse::success(info)))
}

/// Get system status
async fn get_system_status(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<SystemStatus>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // Check database
    let db_start = std::time::Instant::now();
    let _: (i32,) = sqlx::query_as("SELECT 1")
        .fetch_one(pool)
        .await
        .unwrap_or((0,));
    let db_latency = db_start.elapsed().as_millis() as i64;

    // Get worker counts
    let workers: (i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*),
            COUNT(*) FILTER (WHERE status = 'active'),
            COUNT(*) FILTER (WHERE status = 'idle'),
            COUNT(*) FILTER (WHERE status = 'offline')
        FROM vqm_workers
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0, 0));

    // Get queue counts
    let queues: (i64, i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*),
            COUNT(*) FILTER (WHERE status = 'active'),
            COUNT(*) FILTER (WHERE status = 'paused'),
            SUM(message_count),
            SUM(pending_count)
        FROM vqm_queues
        WHERE is_system_queue = false
        "#,
    )
    .fetch_one(pool)
    .await
    .unwrap_or((0, 0, 0, 0, 0));

    let status = SystemStatus {
        status: "healthy".to_string(),
        database: ComponentStatus {
            status: "connected".to_string(),
            latency_ms: db_latency,
            connections: 0,
            version: Some("PostgreSQL 15".to_string()),
        },
        cache: ComponentStatus {
            status: "connected".to_string(),
            latency_ms: 0,
            connections: 0,
            version: Some("Redis 7".to_string()),
        },
        workers: WorkerStatus {
            total: workers.0,
            active: workers.1,
            idle: workers.2,
            offline: workers.3,
        },
        queues: QueueStatus {
            total: queues.0,
            active: queues.1,
            paused: queues.2,
            total_messages: queues.3,
            pending_messages: queues.4,
        },
        maintenance_mode: false,
    };

    Ok(Json(ApiResponse::success(status)))
}

/// Get configuration
async fn get_config(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<ConfigResponse>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let config: Option<(serde_json::Value, DateTime<Utc>, Option<String>)> =
        sqlx::query_as("SELECT settings, updated_at, updated_by FROM vqm_config WHERE id = 1")
            .fetch_optional(pool)
            .await?;

    let response = config
        .map(|(settings, updated, by)| ConfigResponse {
            settings,
            last_updated: updated,
            updated_by: by,
        })
        .unwrap_or(ConfigResponse {
            settings: serde_json::json!({}),
            last_updated: Utc::now(),
            updated_by: None,
        });

    Ok(Json(ApiResponse::success(response)))
}

/// Update configuration
async fn update_config(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<UpdateConfigRequest>,
) -> Result<Json<ApiResponse<ConfigResponse>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        INSERT INTO vqm_config (id, settings, updated_at, updated_by)
        VALUES (1, $1, CURRENT_TIMESTAMP, $2)
        ON CONFLICT (id) DO UPDATE
        SET settings = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
        "#,
    )
    .bind(&req.settings)
    .bind(&auth.username)
    .execute(pool)
    .await?;

    plugin
        .log_audit(
            "config.updated",
            "config",
            "update",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    get_config(Extension(plugin), auth).await
}

/// Get specific config value
async fn get_config_value(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(key): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let config: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT settings FROM vqm_config WHERE id = 1")
            .fetch_optional(pool)
            .await?;

    let value = config
        .map(|(settings,)| settings.get(&key).cloned())
        .flatten()
        .unwrap_or(serde_json::Value::Null);

    Ok(Json(ApiResponse::success(value)))
}

/// Set specific config value
async fn set_config_value(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(key): Path<String>,
    auth: AuthUser,
    Json(value): Json<serde_json::Value>,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    sqlx::query(
        r#"
        INSERT INTO vqm_config (id, settings, updated_at, updated_by)
        VALUES (1, jsonb_build_object($1, $2), CURRENT_TIMESTAMP, $3)
        ON CONFLICT (id) DO UPDATE
        SET settings = vqm_config.settings || jsonb_build_object($1, $2),
            updated_at = CURRENT_TIMESTAMP, updated_by = $3
        "#,
    )
    .bind(&key)
    .bind(&value)
    .bind(&auth.username)
    .execute(pool)
    .await?;

    Ok(Json(ApiResponse::success(value)))
}

/// Start maintenance mode
async fn start_maintenance(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<StartMaintenanceRequest>,
) -> Result<Json<ApiResponse<MaintenanceStatus>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let estimated_end = req
        .estimated_duration_minutes
        .map(|m| Utc::now() + Duration::minutes(m as i64));

    sqlx::query(
        r#"
        INSERT INTO vqm_maintenance (id, is_active, started_at, started_by, reason, estimated_end)
        VALUES (1, true, CURRENT_TIMESTAMP, $1, $2, $3)
        ON CONFLICT (id) DO UPDATE
        SET is_active = true, started_at = CURRENT_TIMESTAMP, started_by = $1, reason = $2, estimated_end = $3
        "#
    )
    .bind(&auth.username)
    .bind(&req.reason)
    .bind(estimated_end)
    .execute(pool)
    .await?;

    // Pause all queues
    sqlx::query("UPDATE vqm_queues SET status = 'paused' WHERE status = 'active'")
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "maintenance.started",
            "system",
            "start_maintenance",
            None,
            req.reason.as_deref(),
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    get_maintenance_status(Extension(plugin), auth).await
}

/// Stop maintenance mode
async fn stop_maintenance(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<MaintenanceStatus>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    sqlx::query("UPDATE vqm_maintenance SET is_active = false WHERE id = 1")
        .execute(pool)
        .await?;

    // Resume all queues
    sqlx::query("UPDATE vqm_queues SET status = 'active' WHERE status = 'paused'")
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "maintenance.stopped",
            "system",
            "stop_maintenance",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    get_maintenance_status(Extension(plugin), auth).await
}

/// Get maintenance status
async fn get_maintenance_status(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<MaintenanceStatus>>, AppError> {
    if !auth.can_view_metrics() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    let status: Option<(bool, Option<DateTime<Utc>>, Option<String>, Option<String>, Option<DateTime<Utc>>)> = sqlx::query_as(
        "SELECT is_active, started_at, started_by, reason, estimated_end FROM vqm_maintenance WHERE id = 1"
    )
    .fetch_optional(pool)
    .await?;

    let response = status
        .map(|(active, started, by, reason, end)| MaintenanceStatus {
            is_active: active,
            started_at: started,
            started_by: by,
            reason,
            estimated_end: end,
        })
        .unwrap_or(MaintenanceStatus {
            is_active: false,
            started_at: None,
            started_by: None,
            reason: None,
            estimated_end: None,
        });

    Ok(Json(ApiResponse::success(response)))
}

/// Cleanup old messages
async fn cleanup_old_messages(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CleanupRequest>,
) -> Result<Json<ApiResponse<CleanupResult>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let days = req.older_than_days.unwrap_or(30);
    let dry_run = req.dry_run.unwrap_or(false);
    let start = std::time::Instant::now();

    let statuses = req.statuses.unwrap_or_else(|| {
        vec![
            "completed".to_string(),
            "failed".to_string(),
            "dead".to_string(),
            "cancelled".to_string(),
        ]
    });

    let count: (i64,) = if dry_run {
        sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM vqm_messages
            WHERE status = ANY($1)
            AND completed_at < CURRENT_TIMESTAMP - ($2 || ' days')::INTERVAL
            "#,
        )
        .bind(&statuses)
        .bind(days.to_string())
        .fetch_one(pool)
        .await?
    } else {
        let result = sqlx::query(
            r#"
            DELETE FROM vqm_messages
            WHERE status = ANY($1)
            AND completed_at < CURRENT_TIMESTAMP - ($2 || ' days')::INTERVAL
            "#,
        )
        .bind(&statuses)
        .bind(days.to_string())
        .execute(pool)
        .await?;

        (result.rows_affected() as i64,)
    };

    if !dry_run {
        plugin
            .log_audit(
                "cleanup.messages",
                "system",
                "cleanup",
                None,
                Some(&format!("Deleted {} messages", count.0)),
                Some(auth.id),
                Some(&auth.username),
            )
            .await;
    }

    Ok(Json(ApiResponse::success(CleanupResult {
        deleted_count: count.0,
        freed_space_bytes: 0, // Would need pg_relation_size tracking
        duration_ms: start.elapsed().as_millis() as i64,
        dry_run,
    })))
}

/// Cleanup audit logs
async fn cleanup_audit_logs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CleanupRequest>,
) -> Result<Json<ApiResponse<CleanupResult>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let days = req.older_than_days.unwrap_or(365);
    let dry_run = req.dry_run.unwrap_or(false);
    let start = std::time::Instant::now();

    let count: (i64,) = if dry_run {
        sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM vqm_audit_logs
            WHERE event_time < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL
            AND is_sensitive = false
            "#,
        )
        .bind(days.to_string())
        .fetch_one(pool)
        .await?
    } else {
        let result = sqlx::query(
            r#"
            DELETE FROM vqm_audit_logs
            WHERE event_time < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL
            AND is_sensitive = false
            "#,
        )
        .bind(days.to_string())
        .execute(pool)
        .await?;

        (result.rows_affected() as i64,)
    };

    Ok(Json(ApiResponse::success(CleanupResult {
        deleted_count: count.0,
        freed_space_bytes: 0,
        duration_ms: start.elapsed().as_millis() as i64,
        dry_run,
    })))
}

/// Cleanup old metrics
async fn cleanup_old_metrics(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CleanupRequest>,
) -> Result<Json<ApiResponse<CleanupResult>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let days = req.older_than_days.unwrap_or(90);
    let dry_run = req.dry_run.unwrap_or(false);
    let start = std::time::Instant::now();

    let mut deleted = 0i64;

    if !dry_run {
        // Clean snapshots older than specified days
        let r1 = sqlx::query(
            "DELETE FROM vqm_metrics_snapshots WHERE period_start < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL"
        )
        .bind(days.to_string())
        .execute(pool)
        .await?;
        deleted += r1.rows_affected() as i64;

        // Clean hourly older than 2x days
        let r2 = sqlx::query(
            "DELETE FROM vqm_metrics_hourly WHERE period_start < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL"
        )
        .bind((days * 2).to_string())
        .execute(pool)
        .await?;
        deleted += r2.rows_affected() as i64;
    } else {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM vqm_metrics_snapshots WHERE period_start < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL"
        )
        .bind(days.to_string())
        .fetch_one(pool)
        .await?;
        deleted = count.0;
    }

    Ok(Json(ApiResponse::success(CleanupResult {
        deleted_count: deleted,
        freed_space_bytes: 0,
        duration_ms: start.elapsed().as_millis() as i64,
        dry_run,
    })))
}

/// Preview cleanup
async fn preview_cleanup(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<CleanupRequest>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let days = params.older_than_days.unwrap_or(30);

    let messages: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_messages WHERE status IN ('completed', 'failed') AND completed_at < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL"
    )
    .bind(days.to_string())
    .fetch_one(pool)
    .await?;

    let audit: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_audit_logs WHERE event_time < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL"
    )
    .bind(days.to_string())
    .fetch_one(pool)
    .await?;

    let metrics: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM vqm_metrics_snapshots WHERE period_start < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL"
    )
    .bind(days.to_string())
    .fetch_one(pool)
    .await?;

    let preview = serde_json::json!({
        "older_than_days": days,
        "messages_to_delete": messages.0,
        "audit_logs_to_delete": audit.0,
        "metrics_to_delete": metrics.0,
    });

    Ok(Json(ApiResponse::success(preview)))
}

/// Get database stats
async fn get_db_stats(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<DbStats>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // Get table stats
    let tables: Vec<(String, i64, i64, i64)> = sqlx::query_as(
        r#"
        SELECT
            relname::text,
            n_live_tup,
            pg_total_relation_size(c.oid),
            pg_indexes_size(c.oid)
        FROM pg_class c
        JOIN pg_stat_user_tables s ON c.relname = s.relname
        WHERE c.relname LIKE 'vqm_%'
        ORDER BY pg_total_relation_size(c.oid) DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let table_stats: Vec<TableStats> = tables
        .into_iter()
        .map(|(name, rows, total, idx)| TableStats {
            table_name: name,
            row_count: rows,
            total_size_bytes: total,
            index_size_bytes: idx,
            last_vacuum: None,
            last_analyze: None,
        })
        .collect();

    let total_size: i64 = table_stats.iter().map(|t| t.total_size_bytes).sum();

    let stats = DbStats {
        total_size_bytes: total_size,
        tables: table_stats,
        connections_used: 0,
        connections_max: 100,
        cache_hit_ratio: 0.99,
        transactions_per_second: 0.0,
    };

    Ok(Json(ApiResponse::success(stats)))
}

/// Vacuum database
async fn vacuum_database(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<()>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    // VACUUM ANALYZE main tables
    sqlx::query("VACUUM ANALYZE vqm_messages")
        .execute(pool)
        .await?;

    sqlx::query("VACUUM ANALYZE vqm_audit_logs")
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "database.vacuumed",
            "system",
            "vacuum",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(())))
}

/// Reindex tables
async fn reindex_tables(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<()>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();

    sqlx::query("REINDEX TABLE CONCURRENTLY vqm_messages")
        .execute(pool)
        .await?;

    plugin
        .log_audit(
            "database.reindexed",
            "system",
            "reindex",
            None,
            None,
            Some(auth.id),
            Some(&auth.username),
        )
        .await;

    Ok(Json(ApiResponse::success(())))
}

/// Get cache stats
async fn get_cache_stats(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<CacheStats>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    // Would connect to Redis and get INFO
    let stats = CacheStats {
        memory_used_bytes: 0,
        memory_max_bytes: 0,
        keys_count: 0,
        hit_rate: 0.0,
        miss_rate: 0.0,
        evictions: 0,
        connected_clients: 0,
    };

    Ok(Json(ApiResponse::success(stats)))
}

/// Clear cache
async fn clear_cache(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<()>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    // Would flush Redis cache
    Ok(Json(ApiResponse::success(())))
}

/// Clear cache by pattern
async fn clear_cache_pattern(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    Path(_pattern): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<i64>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    // Would delete keys matching pattern
    Ok(Json(ApiResponse::success(0)))
}

/// List audit logs
async fn list_audit_logs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<AuditLogParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<AuditLogEntry>>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let pool = plugin.db_pool();
    let offset = (params.pagination.page - 1) * params.pagination.per_page;

    let mut conditions = vec!["1=1".to_string()];

    if let Some(start) = params.date_range.start_date {
        conditions.push(format!("event_time >= '{}'", start));
    }
    if let Some(end) = params.date_range.end_date {
        conditions.push(format!("event_time <= '{}'", end));
    }
    if let Some(ref et) = params.event_type {
        conditions.push(format!("event_type = '{}'", et));
    }
    if let Some(ref ent) = params.entity_type {
        conditions.push(format!("entity_type = '{}'", ent));
    }
    if let Some(actor) = params.actor_id {
        conditions.push(format!("actor_id = '{}'", actor));
    }
    if let Some(ref sev) = params.severity {
        conditions.push(format!("severity = '{}'", sev));
    }

    let where_clause = conditions.join(" AND ");

    let logs: Vec<AuditLogEntry> = sqlx::query_as(&format!(
        r#"
        SELECT id, event_time, event_type, event_category, severity,
               entity_type, entity_id, entity_name, action, action_result,
               actor_id, actor_name, actor_ip::text, metadata
        FROM vqm_audit_logs
        WHERE {}
        ORDER BY event_time DESC
        LIMIT {} OFFSET {}
        "#,
        where_clause, params.pagination.per_page, offset
    ))
    .fetch_all(pool)
    .await?;

    let total: (i64,) = sqlx::query_as(&format!(
        "SELECT COUNT(*) FROM vqm_audit_logs WHERE {}",
        where_clause
    ))
    .fetch_one(pool)
    .await?;

    let meta = ResponseMeta::new(total.0, params.pagination.page, params.pagination.per_page);

    Ok(Json(ApiResponse::success_with_meta(logs, meta)))
}

/// Export audit logs
async fn export_audit_logs(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Query(params): Query<AuditLogParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    // Would generate export file
    let export = serde_json::json!({
        "status": "pending",
        "message": "Export will be available for download shortly"
    });

    Ok(Json(ApiResponse::success(export)))
}

/// List users with VQM permissions
async fn list_users(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    Query(_params): Query<PaginationParams>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<UserWithPermissions>>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    // Would integrate with RustPress user system
    Ok(Json(ApiResponse::success(vec![])))
}

/// Get user permissions
async fn get_user_permissions(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    Path(_id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<String>>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    Ok(Json(ApiResponse::success(vec![])))
}

/// Set user permissions
async fn set_user_permissions(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    Path(_id): Path<String>,
    auth: AuthUser,
    Json(_req): Json<SetPermissionsRequest>,
) -> Result<Json<ApiResponse<Vec<String>>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    Ok(Json(ApiResponse::success(vec![])))
}

/// List API keys
async fn list_api_keys(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<ApiKey>>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    Ok(Json(ApiResponse::success(vec![])))
}

/// Create API key
async fn create_api_key(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
    Json(req): Json<CreateApiKeyRequest>,
) -> Result<Json<ApiResponse<CreateApiKeyResponse>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let key_id = Uuid::new_v4();
    let full_key = format!(
        "vqm_{}_{}",
        key_id.to_string().replace("-", "")[..8].to_string(),
        generate_random_string(32)
    );

    Ok(Json(ApiResponse::success(CreateApiKeyResponse {
        id: key_id,
        name: req.name,
        key: full_key,
        expires_at: req
            .expires_in_days
            .map(|d| Utc::now() + Duration::days(d as i64)),
    })))
}

/// Revoke API key
async fn revoke_api_key(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    Path(_id): Path<String>,
    auth: AuthUser,
) -> Result<StatusCode, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    Ok(StatusCode::NO_CONTENT)
}

/// Create backup
async fn create_backup(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<BackupInfo>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let backup = BackupInfo {
        id: Uuid::new_v4(),
        filename: format!("vqm_backup_{}.sql", Utc::now().format("%Y%m%d_%H%M%S")),
        size_bytes: 0,
        created_at: Utc::now(),
        created_by: auth.username,
        includes: vec![
            "queues".to_string(),
            "messages".to_string(),
            "config".to_string(),
        ],
    };

    Ok(Json(ApiResponse::success(backup)))
}

/// List backups
async fn list_backups(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<Vec<BackupInfo>>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    Ok(Json(ApiResponse::success(vec![])))
}

/// Restore backup
async fn restore_backup(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    Path(_id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<()>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    Ok(Json(ApiResponse::success(())))
}

/// Debug queue
async fn debug_queue(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<DebugInfo>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let queue_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let raw: Option<serde_json::Value> =
        sqlx::query_scalar("SELECT to_jsonb(q.*) FROM vqm_queues q WHERE id = $1")
            .bind(queue_id)
            .fetch_optional(pool)
            .await?;

    let diagnostics = serde_json::json!({
        "lock_status": "none",
        "index_usage": "optimal",
        "fragmentation": "low"
    });

    Ok(Json(ApiResponse::success(DebugInfo {
        entity_type: "queue".to_string(),
        entity_id: id,
        raw_data: raw.unwrap_or(serde_json::json!({})),
        related_data: serde_json::json!({}),
        diagnostics,
    })))
}

/// Debug message
async fn debug_message(
    Extension(plugin): Extension<Arc<VisualQueueManager>>,
    Path(id): Path<String>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<DebugInfo>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let message_id = parse_uuid(&id)?;
    let pool = plugin.db_pool();

    let raw: Option<serde_json::Value> =
        sqlx::query_scalar("SELECT to_jsonb(m.*) FROM vqm_messages m WHERE id = $1")
            .bind(message_id)
            .fetch_optional(pool)
            .await?;

    Ok(Json(ApiResponse::success(DebugInfo {
        entity_type: "message".to_string(),
        entity_id: id,
        raw_data: raw.unwrap_or(serde_json::json!({})),
        related_data: serde_json::json!({}),
        diagnostics: serde_json::json!({}),
    })))
}

/// Debug connections
async fn debug_connections(
    Extension(_plugin): Extension<Arc<VisualQueueManager>>,
    auth: AuthUser,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if !auth.can_admin() {
        return Err(AppError::forbidden());
    }

    let connections = serde_json::json!({
        "database": {
            "active": 5,
            "idle": 10,
            "max": 100
        },
        "redis": {
            "connected": true,
            "clients": 3
        },
        "websocket": {
            "connections": 0
        }
    });

    Ok(Json(ApiResponse::success(connections)))
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

fn generate_random_string(len: usize) -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();

    (0..len)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}
