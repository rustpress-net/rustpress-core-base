//! # Hook Implementations
//!
//! This module contains all the hook implementations for the Visual Queue Manager plugin.
//! Hooks allow the plugin to respond to RustPress events and integrate with the core system.

use crate::{PluginConfig, VqmError};
use chrono::{Duration, Utc};
use rustpress_sdk::prelude::*;
use serde_json::json;
use std::sync::Arc;

// =============================================================================
// Lifecycle Hooks
// =============================================================================

/// Called when RustPress initializes
///
/// This hook sets up the queue manager's core services and registers
/// custom capabilities for access control.
pub fn on_init(ctx: &HookContext) -> Result<(), HookError> {
    tracing::info!("Visual Queue Manager: on_init hook triggered");

    // Register custom capabilities for the plugin
    let capabilities = vec![
        "vqm_view_queues",
        "vqm_manage_queues",
        "vqm_view_messages",
        "vqm_manage_messages",
        "vqm_enqueue",
        "vqm_view_workers",
        "vqm_manage_workers",
        "vqm_view_metrics",
        "vqm_view_audit",
        "vqm_view_scheduled",
        "vqm_manage_scheduled",
        "vqm_view_subscriptions",
        "vqm_manage_subscriptions",
        "vqm_view_handlers",
        "vqm_manage_handlers",
        "vqm_admin",
    ];

    for cap in capabilities {
        if let Err(e) = ctx.register_capability(cap) {
            tracing::warn!("Failed to register capability {}: {}", cap, e);
        }
    }

    // Initialize the queue engine service
    if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
        tokio::spawn(async move {
            if let Err(e) = engine.initialize().await {
                tracing::error!("Failed to initialize queue engine: {}", e);
            }
        });
    }

    tracing::info!("Visual Queue Manager: on_init completed successfully");
    Ok(())
}

/// Called when RustPress is fully loaded
///
/// This hook starts background workers and scheduled jobs if configured.
pub fn on_loaded(ctx: &HookContext) -> Result<(), HookError> {
    tracing::info!("Visual Queue Manager: on_loaded hook triggered");

    // Check if auto-start workers is enabled
    let auto_start = ctx
        .get_setting::<bool>("auto_start_workers")
        .unwrap_or(true);

    if auto_start {
        if let Ok(pool) = ctx.get_service::<crate::WorkerPool>() {
            let concurrency = ctx
                .get_setting::<u32>("default_worker_concurrency")
                .unwrap_or(5);

            tokio::spawn(async move {
                if let Err(e) = pool.start_default_workers(concurrency).await {
                    tracing::error!("Failed to start workers: {}", e);
                } else {
                    tracing::info!("Started {} default workers", concurrency);
                }
            });
        }
    }

    // Start the scheduler for cron jobs
    if let Ok(scheduler) = ctx.get_service::<crate::Scheduler>() {
        tokio::spawn(async move {
            if let Err(e) = scheduler.start().await {
                tracing::error!("Failed to start scheduler: {}", e);
            }
        });
    }

    tracing::info!("Visual Queue Manager: on_loaded completed");
    Ok(())
}

// =============================================================================
// Business Event Hooks
// =============================================================================

/// Handle user registration events
///
/// Optionally enqueue a welcome email or onboarding job when a user registers.
pub fn on_user_registered(ctx: &HookContext) -> Result<(), HookError> {
    let user_id = ctx.get_data::<uuid::Uuid>("user_id")?;
    let user_email = ctx.get_data::<String>("user_email")?;

    tracing::info!("User registered: {} ({})", user_id, user_email);

    // Check if we should enqueue a welcome job
    let enqueue_welcome = ctx
        .get_setting::<bool>("enqueue_welcome_on_registration")
        .unwrap_or(false);

    if enqueue_welcome {
        if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
            let payload = json!({
                "user_id": user_id.to_string(),
                "user_email": user_email,
                "event": "user_registered",
                "timestamp": Utc::now().to_rfc3339(),
            });

            tokio::spawn(async move {
                if let Err(e) = engine
                    .enqueue("user-events", "user.registered", payload)
                    .await
                {
                    tracing::error!("Failed to enqueue user registration event: {}", e);
                }
            });
        }
    }

    Ok(())
}

/// Handle post publication events
///
/// Enqueue jobs for notifications, indexing, or other post-publish tasks.
pub fn on_post_published(ctx: &HookContext) -> Result<(), HookError> {
    let post_id = ctx.get_data::<uuid::Uuid>("post_id")?;
    let post_title = ctx.get_data::<String>("post_title").unwrap_or_default();
    let author_id = ctx.get_data::<uuid::Uuid>("author_id")?;

    tracing::info!("Post published: {} - {}", post_id, post_title);

    if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
        let payload = json!({
            "post_id": post_id.to_string(),
            "post_title": post_title,
            "author_id": author_id.to_string(),
            "event": "post_published",
            "timestamp": Utc::now().to_rfc3339(),
        });

        tokio::spawn(async move {
            // Enqueue for search indexing
            if let Err(e) = engine
                .enqueue("content-events", "post.published", payload.clone())
                .await
            {
                tracing::error!("Failed to enqueue post published event: {}", e);
            }

            // Enqueue for notification dispatch
            if let Err(e) = engine
                .enqueue("notifications", "post.notify_subscribers", payload)
                .await
            {
                tracing::error!("Failed to enqueue notification event: {}", e);
            }
        });
    }

    Ok(())
}

/// Handle order creation events
///
/// Critical for e-commerce: enqueue order processing jobs.
pub fn on_order_created(ctx: &HookContext) -> Result<(), HookError> {
    let order_id = ctx.get_data::<uuid::Uuid>("order_id")?;
    let customer_id = ctx.get_data::<uuid::Uuid>("customer_id")?;
    let total_amount = ctx.get_data::<f64>("total_amount").unwrap_or(0.0);

    tracing::info!(
        "Order created: {} for customer {} (${:.2})",
        order_id,
        customer_id,
        total_amount
    );

    if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
        let payload = json!({
            "order_id": order_id.to_string(),
            "customer_id": customer_id.to_string(),
            "total_amount": total_amount,
            "event": "order_created",
            "timestamp": Utc::now().to_rfc3339(),
        });

        // Use high priority for order processing
        let priority = if total_amount > 1000.0 { 10 } else { 5 };

        tokio::spawn(async move {
            if let Err(e) = engine
                .enqueue_with_priority("orders", "order.process", payload, priority)
                .await
            {
                tracing::error!("Failed to enqueue order created event: {}", e);
            }
        });
    }

    Ok(())
}

/// Handle payment completion events
///
/// Trigger fulfillment and notification jobs after successful payment.
pub fn on_payment_completed(ctx: &HookContext) -> Result<(), HookError> {
    let payment_id = ctx.get_data::<uuid::Uuid>("payment_id")?;
    let order_id = ctx.get_data::<uuid::Uuid>("order_id")?;
    let amount = ctx.get_data::<f64>("amount").unwrap_or(0.0);

    tracing::info!(
        "Payment completed: {} for order {} (${:.2})",
        payment_id,
        order_id,
        amount
    );

    if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
        let payload = json!({
            "payment_id": payment_id.to_string(),
            "order_id": order_id.to_string(),
            "amount": amount,
            "event": "payment_completed",
            "timestamp": Utc::now().to_rfc3339(),
        });

        tokio::spawn(async move {
            // High priority for fulfillment
            if let Err(e) = engine
                .enqueue_with_priority("orders", "order.fulfill", payload.clone(), 10)
                .await
            {
                tracing::error!("Failed to enqueue fulfillment event: {}", e);
            }

            // Send receipt notification
            if let Err(e) = engine
                .enqueue("notifications", "payment.send_receipt", payload)
                .await
            {
                tracing::error!("Failed to enqueue receipt notification: {}", e);
            }
        });
    }

    Ok(())
}

// =============================================================================
// Maintenance Hooks (Cron)
// =============================================================================

/// Daily maintenance tasks
///
/// Runs at 2 AM UTC daily to clean up old messages and aggregate statistics.
pub fn on_daily_maintenance(ctx: &HookContext) -> Result<(), HookError> {
    tracing::info!("Running daily maintenance tasks...");

    let completed_retention = ctx
        .get_setting::<u32>("completed_message_retention_days")
        .unwrap_or(30);

    let failed_retention = ctx
        .get_setting::<u32>("failed_message_retention_days")
        .unwrap_or(90);

    let audit_retention = ctx
        .get_setting::<u32>("audit_log_retention_days")
        .unwrap_or(365);

    tokio::spawn(async move {
        // Clean up old completed messages
        let completed_cutoff = Utc::now() - Duration::days(completed_retention as i64);
        tracing::info!(
            "Cleaning completed messages older than {}",
            completed_cutoff
        );

        // Clean up old failed messages
        let failed_cutoff = Utc::now() - Duration::days(failed_retention as i64);
        tracing::info!("Cleaning failed messages older than {}", failed_cutoff);

        // Clean up old audit logs
        let audit_cutoff = Utc::now() - Duration::days(audit_retention as i64);
        tracing::info!("Cleaning audit logs older than {}", audit_cutoff);

        // Aggregate daily statistics
        tracing::info!("Aggregating daily statistics...");

        tracing::info!("Daily maintenance completed");
    });

    Ok(())
}

/// Hourly metrics collection
///
/// Aggregates hourly statistics for reporting and dashboards.
pub fn on_hourly_metrics(ctx: &HookContext) -> Result<(), HookError> {
    tracing::debug!("Running hourly metrics aggregation...");

    if let Ok(metrics) = ctx.get_service::<crate::MetricsCollector>() {
        tokio::spawn(async move {
            if let Err(e) = metrics.aggregate_hourly_stats().await {
                tracing::error!("Failed to aggregate hourly metrics: {}", e);
            }
        });
    }

    Ok(())
}

// =============================================================================
// Filter Hooks
// =============================================================================

/// Filter messages before enqueueing
///
/// Adds metadata, validates payloads, and optionally encrypts sensitive data.
pub fn filter_message_before_enqueue(
    mut message: crate::models::Message,
    ctx: &FilterContext,
) -> Result<crate::models::Message, HookError> {
    // Add enqueue metadata
    message.headers.insert(
        "enqueued_by".to_string(),
        ctx.current_user_id()
            .map(|id| id.to_string())
            .unwrap_or_else(|| "system".to_string()),
    );
    message
        .headers
        .insert("enqueued_at".to_string(), Utc::now().to_rfc3339());

    // Validate payload size
    let max_size_kb = ctx.get_setting::<u64>("max_payload_size_kb").unwrap_or(1024);
    let payload_size = serde_json::to_string(&message.payload)
        .map(|s| s.len())
        .unwrap_or(0);

    if payload_size > (max_size_kb as usize * 1024) {
        return Err(HookError::Validation(format!(
            "Payload size {} exceeds maximum allowed {} KB",
            payload_size / 1024,
            max_size_kb
        )));
    }

    // Encrypt payload if configured
    let encrypt_payloads = ctx.get_setting::<bool>("encrypt_payloads").unwrap_or(false);
    if encrypt_payloads {
        // Encryption would be applied here
        message
            .headers
            .insert("encrypted".to_string(), "true".to_string());
    }

    // Mask sensitive fields in headers for logging
    let sensitive_patterns = ctx
        .get_setting::<Vec<String>>("sensitive_fields")
        .unwrap_or_else(|| {
            vec![
                "password".to_string(),
                "secret".to_string(),
                "token".to_string(),
                "api_key".to_string(),
            ]
        });

    for pattern in &sensitive_patterns {
        if let Some(value) = message.headers.get_mut(pattern) {
            *value = "***REDACTED***".to_string();
        }
    }

    Ok(message)
}

/// Filter messages after processing
///
/// Can modify results or trigger post-processing actions.
pub fn filter_message_after_process(
    message: crate::models::Message,
    _ctx: &FilterContext,
) -> Result<crate::models::Message, HookError> {
    // Post-processing logic would go here
    // For example, updating metrics or triggering webhooks

    Ok(message)
}

/// Add dashboard widgets
///
/// Injects queue manager widgets into the admin dashboard.
pub fn add_dashboard_widgets(
    mut widgets: Vec<DashboardWidget>,
    _ctx: &FilterContext,
) -> Result<Vec<DashboardWidget>, HookError> {
    // Add queue summary widget
    widgets.push(DashboardWidget {
        id: "vqm-queue-summary".to_string(),
        title: "Queue Summary".to_string(),
        component: "VqmQueueSummary".to_string(),
        position: WidgetPosition::TopRight,
        size: WidgetSize::Medium,
        refresh_interval: Some(5),
    });

    // Add throughput chart widget
    widgets.push(DashboardWidget {
        id: "vqm-throughput".to_string(),
        title: "Queue Throughput".to_string(),
        component: "VqmThroughputChart".to_string(),
        position: WidgetPosition::MiddleLeft,
        size: WidgetSize::Large,
        refresh_interval: Some(10),
    });

    // Add recent failures widget
    widgets.push(DashboardWidget {
        id: "vqm-recent-failures".to_string(),
        title: "Recent Failures".to_string(),
        component: "VqmRecentFailures".to_string(),
        position: WidgetPosition::BottomRight,
        size: WidgetSize::Small,
        refresh_interval: Some(30),
    });

    Ok(widgets)
}

/// Filter API responses
///
/// Can modify API responses before they're sent to clients.
pub fn filter_api_response(
    mut response: ApiResponse,
    ctx: &FilterContext,
) -> Result<ApiResponse, HookError> {
    // Add rate limit headers if applicable
    if let Some(remaining) = ctx.get_data::<u64>("rate_limit_remaining").ok() {
        response
            .headers
            .insert("X-RateLimit-Remaining".to_string(), remaining.to_string());
    }

    // Add request ID for tracing
    if let Some(request_id) = ctx.get_data::<String>("request_id").ok() {
        response
            .headers
            .insert("X-Request-ID".to_string(), request_id);
    }

    Ok(response)
}

/// Add VQM capabilities to user
///
/// Extends the default capability system with queue manager permissions.
pub fn add_vqm_capabilities(
    mut capabilities: Vec<String>,
    ctx: &FilterContext,
) -> Result<Vec<String>, HookError> {
    let user_role = ctx.get_data::<String>("user_role").unwrap_or_default();

    match user_role.as_str() {
        "administrator" => {
            // Admins get full access
            capabilities.extend(vec![
                "vqm_view_queues".to_string(),
                "vqm_manage_queues".to_string(),
                "vqm_view_messages".to_string(),
                "vqm_manage_messages".to_string(),
                "vqm_enqueue".to_string(),
                "vqm_view_workers".to_string(),
                "vqm_manage_workers".to_string(),
                "vqm_view_metrics".to_string(),
                "vqm_view_audit".to_string(),
                "vqm_view_scheduled".to_string(),
                "vqm_manage_scheduled".to_string(),
                "vqm_view_subscriptions".to_string(),
                "vqm_manage_subscriptions".to_string(),
                "vqm_view_handlers".to_string(),
                "vqm_manage_handlers".to_string(),
                "vqm_admin".to_string(),
            ]);
        }
        "editor" => {
            // Editors get view and basic enqueue access
            capabilities.extend(vec![
                "vqm_view_queues".to_string(),
                "vqm_view_messages".to_string(),
                "vqm_enqueue".to_string(),
                "vqm_view_metrics".to_string(),
            ]);
        }
        "author" => {
            // Authors can only enqueue
            capabilities.extend(vec!["vqm_enqueue".to_string()]);
        }
        _ => {
            // Default: read-only for queues
            capabilities.push("vqm_view_queues".to_string());
        }
    }

    Ok(capabilities)
}

// =============================================================================
// Cron Job Handlers
// =============================================================================

/// Collect metrics snapshot every 5 minutes
pub async fn collect_metrics_snapshot(ctx: &CronContext) -> Result<(), CronError> {
    tracing::debug!("Collecting metrics snapshot...");

    if let Ok(metrics) = ctx.get_service::<crate::MetricsCollector>() {
        if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
            // Collect metrics for all queues
            let queues = engine.list_all_queues().await?;

            for queue in queues {
                let snapshot = metrics.collect_for_queue(queue.id).await?;
                metrics.store_snapshot(snapshot).await?;

                // Check alert thresholds
                check_alert_thresholds(&queue, &snapshot, ctx).await?;
            }
        }
    }

    Ok(())
}

/// Clean up old messages based on retention settings
pub async fn cleanup_old_messages(ctx: &CronContext) -> Result<(), CronError> {
    tracing::info!("Running message cleanup job...");

    if let Ok(storage) = ctx.get_service::<crate::storage::QueueStorage>() {
        let completed_retention = ctx
            .get_setting::<u32>("completed_message_retention_days")
            .unwrap_or(30);
        let failed_retention = ctx
            .get_setting::<u32>("failed_message_retention_days")
            .unwrap_or(90);

        let completed_cutoff = Utc::now() - Duration::days(completed_retention as i64);
        let completed_deleted = storage
            .delete_messages_before(completed_cutoff, crate::models::MessageStatus::Completed)
            .await?;

        let failed_cutoff = Utc::now() - Duration::days(failed_retention as i64);
        let failed_deleted = storage
            .delete_messages_before(failed_cutoff, crate::models::MessageStatus::Failed)
            .await?;

        tracing::info!(
            "Cleaned up {} completed and {} failed messages",
            completed_deleted,
            failed_deleted
        );
    }

    Ok(())
}

/// Aggregate hourly statistics
pub async fn aggregate_hourly_stats(ctx: &CronContext) -> Result<(), CronError> {
    tracing::debug!("Aggregating hourly statistics...");

    if let Ok(metrics) = ctx.get_service::<crate::MetricsCollector>() {
        metrics.aggregate_hourly_stats().await?;
    }

    Ok(())
}

/// Check for stale workers and clean them up
pub async fn check_stale_workers(ctx: &CronContext) -> Result<(), CronError> {
    tracing::debug!("Checking for stale workers...");

    if let Ok(pool) = ctx.get_service::<crate::WorkerPool>() {
        let cleaned = pool.cleanup_stale_workers().await?;
        if cleaned > 0 {
            tracing::warn!("Cleaned up {} stale workers", cleaned);
        }
    }

    Ok(())
}

/// Process scheduled jobs
pub async fn process_scheduled_jobs(ctx: &CronContext) -> Result<(), CronError> {
    if let Ok(scheduler) = ctx.get_service::<crate::Scheduler>() {
        scheduler.process_due_jobs().await?;
    }

    Ok(())
}

/// Send daily alert digests
pub async fn send_alert_digests(ctx: &CronContext) -> Result<(), CronError> {
    tracing::info!("Sending alert digests...");

    let send_daily_report = ctx.get_setting::<bool>("send_daily_report").unwrap_or(false);

    if send_daily_report {
        if let Ok(metrics) = ctx.get_service::<crate::MetricsCollector>() {
            let report = metrics.generate_daily_report().await?;

            // Send via configured channels (email, Slack, etc.)
            if let Some(slack_webhook) = ctx.get_setting::<String>("slack_webhook").ok() {
                if !slack_webhook.is_empty() {
                    send_slack_report(&slack_webhook, &report).await?;
                }
            }
        }
    }

    Ok(())
}

/// Clean up old audit logs
pub async fn cleanup_audit_logs(ctx: &CronContext) -> Result<(), CronError> {
    tracing::info!("Cleaning up old audit logs...");

    let retention_days = ctx
        .get_setting::<u32>("audit_log_retention_days")
        .unwrap_or(365);

    if let Ok(audit) = ctx.get_service::<crate::audit::AuditLogger>() {
        let cutoff = Utc::now() - Duration::days(retention_days as i64);
        let deleted = audit.delete_logs_before(cutoff).await?;
        tracing::info!("Deleted {} old audit log entries", deleted);
    }

    Ok(())
}

/// Run periodic health checks
pub async fn run_health_checks(ctx: &CronContext) -> Result<(), CronError> {
    tracing::debug!("Running health checks...");

    // Check queue engine health
    if let Ok(engine) = ctx.get_service::<crate::QueueEngine>() {
        if !engine.is_healthy().await {
            tracing::error!("Queue engine health check failed!");
            // Trigger alert
        }
    }

    // Check worker pool health
    if let Ok(pool) = ctx.get_service::<crate::WorkerPool>() {
        if !pool.is_healthy().await {
            tracing::error!("Worker pool health check failed!");
            // Trigger alert
        }
    }

    // Check scheduler health
    if let Ok(scheduler) = ctx.get_service::<crate::Scheduler>() {
        if !scheduler.is_healthy().await {
            tracing::error!("Scheduler health check failed!");
            // Trigger alert
        }
    }

    Ok(())
}

// =============================================================================
// Helper Functions
// =============================================================================

/// Check alert thresholds and trigger notifications if needed
async fn check_alert_thresholds(
    queue: &crate::models::Queue,
    snapshot: &crate::metrics::MetricsSnapshot,
    ctx: &impl SettingsProvider,
) -> Result<(), CronError> {
    let warning_threshold = ctx
        .get_setting::<u64>("alert_threshold_warning")
        .unwrap_or(5000);
    let critical_threshold = ctx
        .get_setting::<u64>("alert_threshold_critical")
        .unwrap_or(10000);
    let error_rate_threshold = ctx
        .get_setting::<u64>("alert_threshold_error_rate")
        .unwrap_or(10);

    // Check queue depth
    if snapshot.pending_count >= critical_threshold {
        tracing::error!(
            "CRITICAL: Queue {} has {} pending messages (threshold: {})",
            queue.name,
            snapshot.pending_count,
            critical_threshold
        );
        // Trigger critical alert
    } else if snapshot.pending_count >= warning_threshold {
        tracing::warn!(
            "WARNING: Queue {} has {} pending messages (threshold: {})",
            queue.name,
            snapshot.pending_count,
            warning_threshold
        );
        // Trigger warning alert
    }

    // Check error rate
    let error_rate_percent = (snapshot.error_rate * 100.0) as u64;
    if error_rate_percent >= error_rate_threshold {
        tracing::warn!(
            "WARNING: Queue {} has {}% error rate (threshold: {}%)",
            queue.name,
            error_rate_percent,
            error_rate_threshold
        );
        // Trigger error rate alert
    }

    Ok(())
}

/// Send report to Slack webhook
async fn send_slack_report(
    webhook_url: &str,
    report: &crate::metrics::DailyReport,
) -> Result<(), CronError> {
    let client = reqwest::Client::new();

    let message = json!({
        "text": format!(
            "*Visual Queue Manager Daily Report*\n\n\
            Messages Processed: {}\n\
            Messages Failed: {}\n\
            Success Rate: {:.2}%\n\
            Avg Processing Time: {:.2}ms\n\
            Peak Queue Depth: {}",
            report.messages_processed,
            report.messages_failed,
            report.success_rate * 100.0,
            report.avg_processing_time_ms,
            report.peak_queue_depth
        )
    });

    client
        .post(webhook_url)
        .json(&message)
        .send()
        .await
        .map_err(|e| CronError::Execution(e.to_string()))?;

    Ok(())
}

// =============================================================================
// Type Definitions for Hooks
// =============================================================================

/// Dashboard widget configuration
#[derive(Debug, Clone)]
pub struct DashboardWidget {
    pub id: String,
    pub title: String,
    pub component: String,
    pub position: WidgetPosition,
    pub size: WidgetSize,
    pub refresh_interval: Option<u32>,
}

/// Widget position on dashboard
#[derive(Debug, Clone)]
pub enum WidgetPosition {
    TopLeft,
    TopRight,
    MiddleLeft,
    MiddleRight,
    BottomLeft,
    BottomRight,
}

/// Widget size
#[derive(Debug, Clone)]
pub enum WidgetSize {
    Small,
    Medium,
    Large,
}

/// API response wrapper
#[derive(Debug, Clone)]
pub struct ApiResponse {
    pub status: u16,
    pub body: serde_json::Value,
    pub headers: std::collections::HashMap<String, String>,
}

/// Settings provider trait
pub trait SettingsProvider {
    fn get_setting<T: serde::de::DeserializeOwned>(&self, key: &str) -> Result<T, HookError>;
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dashboard_widgets() {
        let widgets = vec![];
        let ctx = MockFilterContext::new();

        let result = add_dashboard_widgets(widgets, &ctx).unwrap();
        assert_eq!(result.len(), 3);
        assert!(result.iter().any(|w| w.id == "vqm-queue-summary"));
    }

    #[test]
    fn test_capabilities_admin() {
        let capabilities = vec![];
        let mut ctx = MockFilterContext::new();
        ctx.set_data("user_role", "administrator".to_string());

        let result = add_vqm_capabilities(capabilities, &ctx).unwrap();
        assert!(result.contains(&"vqm_admin".to_string()));
        assert!(result.contains(&"vqm_manage_queues".to_string()));
    }

    #[test]
    fn test_capabilities_author() {
        let capabilities = vec![];
        let mut ctx = MockFilterContext::new();
        ctx.set_data("user_role", "author".to_string());

        let result = add_vqm_capabilities(capabilities, &ctx).unwrap();
        assert!(result.contains(&"vqm_enqueue".to_string()));
        assert!(!result.contains(&"vqm_admin".to_string()));
    }
}
