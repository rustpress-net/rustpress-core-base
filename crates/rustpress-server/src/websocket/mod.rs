//! WebSocket module for real-time collaboration and chat.
//!
//! This module provides:
//! - WebSocket connection handling
//! - User presence tracking
//! - Real-time file collaboration (cursors, selections, edits)
//! - Chat messaging system

pub mod chat;
pub mod collaboration;
pub mod handler;
pub mod hub;
pub mod message;
pub mod presence;

pub use handler::websocket_handler;
pub use hub::WebSocketHub;
pub use message::{ClientMessage, ServerMessage, UserPresence, UserStatus};
