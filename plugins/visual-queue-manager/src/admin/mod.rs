//! Admin Interface and RustPress Integration
//!
//! This module provides integration with RustPress admin panel,
//! settings management, and administrative hooks.

mod dashboard;
mod hooks;
mod permissions;
mod settings;

pub use dashboard::*;
pub use hooks::*;
pub use permissions::*;
pub use settings::*;

use crate::engine::QueueEngine;
use std::sync::Arc;

/// Admin module context containing all administrative functionality
pub struct AdminModule {
    pub settings: SettingsManager,
    pub hooks: HookRegistry,
    pub dashboard: DashboardProvider,
    pub permissions: PermissionManager,
}

impl AdminModule {
    pub fn new(engine: Arc<QueueEngine>) -> Self {
        Self {
            settings: SettingsManager::new(),
            hooks: HookRegistry::new(engine.clone()),
            dashboard: DashboardProvider::new(engine.clone()),
            permissions: PermissionManager::new(),
        }
    }

    /// Initialize admin module with RustPress
    pub async fn initialize(&self) -> Result<(), AdminError> {
        // Register admin menu items
        self.register_menu_items().await?;

        // Register settings pages
        self.settings.register_pages().await?;

        // Initialize hooks
        self.hooks.initialize().await?;

        // Register permissions
        self.permissions.register_all().await?;

        Ok(())
    }

    async fn register_menu_items(&self) -> Result<(), AdminError> {
        // Menu registration would integrate with RustPress admin
        Ok(())
    }
}

/// Admin module errors
#[derive(Debug, thiserror::Error)]
pub enum AdminError {
    #[error("Settings error: {0}")]
    Settings(String),

    #[error("Hook error: {0}")]
    Hook(String),

    #[error("Permission error: {0}")]
    Permission(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
}
