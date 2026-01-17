//! # RustPress Server
//!
//! HTTP server implementation using Axum framework.

pub mod app;
pub mod background;
pub mod error;
pub mod extract;
pub mod metrics;
pub mod middleware;
pub mod response;
pub mod routes;
pub mod security;
pub mod services;
pub mod setup;
pub mod shutdown;
pub mod state;
pub mod websocket;

pub use app::App;
pub use background::init_background_tasks;
pub use services::{EmailConfig, EmailService, EmailTemplate};
pub use state::AppState;
pub use websocket::{websocket_handler, WebSocketHub};
