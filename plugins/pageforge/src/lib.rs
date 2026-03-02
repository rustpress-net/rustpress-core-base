//! PageForge - Visual Page Builder Plugin for RustPress
//!
//! This is a stub implementation that provides the API router interface
//! expected by rustpress-server. Full implementation to follow.

use axum::{
    extract::State,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPool;

#[derive(Clone)]
pub struct PageForgeState {
    pub db_pool: PgPool,
    pub base_url: String,
}

#[derive(Serialize, Deserialize)]
pub struct PageForgeStatus {
    pub status: String,
    pub version: String,
}

async fn health(State(state): State<PageForgeState>) -> impl IntoResponse {
    Json(PageForgeStatus {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn list_pages(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "pages": [],
        "total": 0,
        "page": 1,
        "per_page": 20
    }))
}

async fn list_templates(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "templates": [],
        "total": 0
    }))
}

async fn list_elements(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "elements": [],
        "total": 0
    }))
}

async fn list_widgets(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "widgets": [],
        "total": 0
    }))
}

async fn list_global_widgets(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "global_widgets": [],
        "total": 0
    }))
}

async fn list_forms(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "forms": [],
        "total": 0
    }))
}

async fn list_popups(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "popups": [],
        "total": 0
    }))
}

async fn global_styles(State(_state): State<PageForgeState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "styles": {}
    }))
}

/// Create the PageForge API router with all endpoints.
/// This is the public entry point called by rustpress-server.
pub fn create_api_router(db_pool: PgPool, base_url: String) -> Router {
    let state = PageForgeState { db_pool, base_url };

    Router::new()
        .route("/health", get(health))
        .route("/pages", get(list_pages))
        .route("/templates", get(list_templates))
        .route("/elements", get(list_elements))
        .route("/widgets", get(list_widgets))
        .route("/global-widgets", get(list_global_widgets))
        .route("/forms", get(list_forms))
        .route("/popups", get(list_popups))
        .route("/global-styles", get(global_styles))
        .with_state(state)
}
