//! RustPress Hook Integration
//!
//! Provides integration with RustPress hook system for event-driven architecture.

use crate::engine::QueueEngine;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Hook registry for managing RustPress integration hooks
pub struct HookRegistry {
    engine: Arc<QueueEngine>,
    registered_hooks: Arc<RwLock<HashMap<String, HookHandler>>>,
    filters: Arc<RwLock<HashMap<String, Vec<FilterCallback>>>>,
}

impl HookRegistry {
    pub fn new(engine: Arc<QueueEngine>) -> Self {
        Self {
            engine,
            registered_hooks: Arc::new(RwLock::new(HashMap::new())),
            filters: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn initialize(&self) -> Result<(), super::AdminError> {
        // Register default hooks
        self.register_action_hooks().await?;
        self.register_filter_hooks().await?;
        Ok(())
    }

    async fn register_action_hooks(&self) -> Result<(), super::AdminError> {
        let mut hooks = self.registered_hooks.write().await;

        // Queue lifecycle hooks
        hooks.insert(
            "vqm_queue_created".to_string(),
            HookHandler {
                name: "vqm_queue_created".to_string(),
                description: "Triggered when a new queue is created".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        hooks.insert(
            "vqm_queue_deleted".to_string(),
            HookHandler {
                name: "vqm_queue_deleted".to_string(),
                description: "Triggered when a queue is deleted".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        // Message lifecycle hooks
        hooks.insert(
            "vqm_message_enqueued".to_string(),
            HookHandler {
                name: "vqm_message_enqueued".to_string(),
                description: "Triggered when a message is enqueued".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        hooks.insert(
            "vqm_message_processed".to_string(),
            HookHandler {
                name: "vqm_message_processed".to_string(),
                description: "Triggered when a message is successfully processed".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        hooks.insert(
            "vqm_message_failed".to_string(),
            HookHandler {
                name: "vqm_message_failed".to_string(),
                description: "Triggered when message processing fails".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        hooks.insert(
            "vqm_message_dlq".to_string(),
            HookHandler {
                name: "vqm_message_dlq".to_string(),
                description: "Triggered when a message is moved to DLQ".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        // Worker hooks
        hooks.insert(
            "vqm_worker_registered".to_string(),
            HookHandler {
                name: "vqm_worker_registered".to_string(),
                description: "Triggered when a worker registers".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        hooks.insert(
            "vqm_worker_offline".to_string(),
            HookHandler {
                name: "vqm_worker_offline".to_string(),
                description: "Triggered when a worker goes offline".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        // Alert hooks
        hooks.insert(
            "vqm_alert_triggered".to_string(),
            HookHandler {
                name: "vqm_alert_triggered".to_string(),
                description: "Triggered when an alert is raised".to_string(),
                priority: 10,
                callback_type: CallbackType::Action,
            },
        );

        Ok(())
    }

    async fn register_filter_hooks(&self) -> Result<(), super::AdminError> {
        let mut hooks = self.registered_hooks.write().await;

        // Message filters
        hooks.insert(
            "vqm_filter_message_body".to_string(),
            HookHandler {
                name: "vqm_filter_message_body".to_string(),
                description: "Filter message body before enqueue".to_string(),
                priority: 10,
                callback_type: CallbackType::Filter,
            },
        );

        hooks.insert(
            "vqm_filter_message_headers".to_string(),
            HookHandler {
                name: "vqm_filter_message_headers".to_string(),
                description: "Filter message headers before enqueue".to_string(),
                priority: 10,
                callback_type: CallbackType::Filter,
            },
        );

        // Handler filters
        hooks.insert(
            "vqm_filter_handler_payload".to_string(),
            HookHandler {
                name: "vqm_filter_handler_payload".to_string(),
                description: "Filter payload before sending to handler".to_string(),
                priority: 10,
                callback_type: CallbackType::Filter,
            },
        );

        // API response filters
        hooks.insert(
            "vqm_filter_api_response".to_string(),
            HookHandler {
                name: "vqm_filter_api_response".to_string(),
                description: "Filter API response before sending to client".to_string(),
                priority: 10,
                callback_type: CallbackType::Filter,
            },
        );

        Ok(())
    }

    /// Execute an action hook
    pub async fn do_action(&self, hook_name: &str, data: HookData) {
        // In a real implementation, this would call registered callbacks
        // through RustPress's hook system
        tracing::debug!("Action hook triggered: {} with data: {:?}", hook_name, data);
    }

    /// Apply a filter hook
    pub async fn apply_filter<T: Serialize + for<'de> Deserialize<'de>>(
        &self,
        hook_name: &str,
        value: T,
    ) -> T {
        // In a real implementation, this would apply registered filter callbacks
        tracing::debug!("Filter hook applied: {}", hook_name);
        value
    }

    /// Register a custom action callback
    pub async fn add_action(
        &self,
        hook_name: &str,
        callback: impl Fn(HookData) + Send + Sync + 'static,
        priority: i32,
    ) {
        // Store callback for later execution
        tracing::info!("Action callback registered for hook: {}", hook_name);
    }

    /// Register a custom filter callback
    pub async fn add_filter(&self, hook_name: &str, callback: FilterCallback, priority: i32) {
        let mut filters = self.filters.write().await;
        filters
            .entry(hook_name.to_string())
            .or_insert_with(Vec::new)
            .push(callback);
    }

    /// Get all registered hooks
    pub async fn get_registered_hooks(&self) -> Vec<HookHandler> {
        let hooks = self.registered_hooks.read().await;
        hooks.values().cloned().collect()
    }
}

/// Hook handler definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookHandler {
    pub name: String,
    pub description: String,
    pub priority: i32,
    pub callback_type: CallbackType,
}

/// Type of hook callback
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CallbackType {
    Action,
    Filter,
}

/// Data passed to hook callbacks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookData {
    pub event_type: String,
    pub resource_type: String,
    pub resource_id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub data: serde_json::Value,
    pub metadata: HashMap<String, String>,
}

impl HookData {
    pub fn new(event_type: &str, resource_type: &str, resource_id: &str) -> Self {
        Self {
            event_type: event_type.to_string(),
            resource_type: resource_type.to_string(),
            resource_id: resource_id.to_string(),
            timestamp: chrono::Utc::now(),
            data: serde_json::Value::Null,
            metadata: HashMap::new(),
        }
    }

    pub fn with_data(mut self, data: serde_json::Value) -> Self {
        self.data = data;
        self
    }

    pub fn with_metadata(mut self, key: &str, value: &str) -> Self {
        self.metadata.insert(key.to_string(), value.to_string());
        self
    }
}

/// Filter callback type
pub type FilterCallback = Box<dyn Fn(serde_json::Value) -> serde_json::Value + Send + Sync>;

/// Shorthand action hooks for common events
pub mod actions {
    use super::*;

    pub const QUEUE_CREATED: &str = "vqm_queue_created";
    pub const QUEUE_DELETED: &str = "vqm_queue_deleted";
    pub const QUEUE_PAUSED: &str = "vqm_queue_paused";
    pub const QUEUE_RESUMED: &str = "vqm_queue_resumed";

    pub const MESSAGE_ENQUEUED: &str = "vqm_message_enqueued";
    pub const MESSAGE_PROCESSED: &str = "vqm_message_processed";
    pub const MESSAGE_FAILED: &str = "vqm_message_failed";
    pub const MESSAGE_DLQ: &str = "vqm_message_dlq";

    pub const WORKER_REGISTERED: &str = "vqm_worker_registered";
    pub const WORKER_OFFLINE: &str = "vqm_worker_offline";

    pub const ALERT_TRIGGERED: &str = "vqm_alert_triggered";
    pub const ALERT_RESOLVED: &str = "vqm_alert_resolved";
}

/// Shorthand filter hooks
pub mod filters {
    pub const MESSAGE_BODY: &str = "vqm_filter_message_body";
    pub const MESSAGE_HEADERS: &str = "vqm_filter_message_headers";
    pub const HANDLER_PAYLOAD: &str = "vqm_filter_handler_payload";
    pub const API_RESPONSE: &str = "vqm_filter_api_response";
}
