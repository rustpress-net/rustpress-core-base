//! API request handlers.
//!
//! This module contains the handler functions that process
//! incoming HTTP requests and return responses.

pub mod auth;
pub mod comments;
pub mod media;
pub mod pages;
pub mod posts;
pub mod settings;
pub mod themes;
pub mod users;

// Re-export handlers
pub use auth::*;
pub use comments::*;
pub use media::*;
pub use pages::*;
pub use posts::*;
pub use settings::*;
pub use themes::*;
pub use users::*;
