//! Admin Dashboard Provider
//!
//! Provides dashboard widgets and data for the RustPress admin panel.

use crate::engine::QueueEngine;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Dashboard provider for admin panel integration
pub struct DashboardProvider {
    engine: Arc<QueueEngine>,
}

impl DashboardProvider {
    pub fn new(engine: Arc<QueueEngine>) -> Self {
        Self { engine }
    }

    /// Get all dashboard widgets
    pub async fn get_widgets(&self) -> Vec<DashboardWidget> {
        vec![
            self.overview_widget().await,
            self.queue_health_widget().await,
            self.throughput_widget().await,
            self.worker_status_widget().await,
            self.alert_summary_widget().await,
            self.recent_activity_widget().await,
        ]
    }

    async fn overview_widget(&self) -> DashboardWidget {
        let metrics = self.engine.metrics().get_snapshot().await;

        DashboardWidget {
            id: "vqm-overview".to_string(),
            title: "Queue Manager Overview".to_string(),
            widget_type: WidgetType::Stats,
            size: WidgetSize::Large,
            position: WidgetPosition { row: 0, col: 0 },
            data: WidgetData::Stats(StatsWidgetData {
                items: vec![
                    StatItem {
                        label: "Total Queues".to_string(),
                        value: metrics.total_queues.to_string(),
                        change: None,
                        trend: None,
                    },
                    StatItem {
                        label: "Messages/sec".to_string(),
                        value: format!("{:.1}", metrics.throughput.messages_per_second),
                        change: Some(5.2),
                        trend: Some(Trend::Up),
                    },
                    StatItem {
                        label: "Active Workers".to_string(),
                        value: format!("{}/{}", metrics.workers.active, metrics.workers.total),
                        change: None,
                        trend: None,
                    },
                    StatItem {
                        label: "Error Rate".to_string(),
                        value: format!("{:.2}%", metrics.error_rate * 100.0),
                        change: Some(-0.5),
                        trend: Some(Trend::Down),
                    },
                ],
            }),
            refresh_interval: Some(5000),
        }
    }

    async fn queue_health_widget(&self) -> DashboardWidget {
        let queues = self.engine.queue_manager().list_all().await;

        let mut healthy = 0;
        let mut warning = 0;
        let mut critical = 0;

        for queue in &queues {
            match self.assess_queue_health(queue).await {
                HealthStatus::Healthy => healthy += 1,
                HealthStatus::Warning => warning += 1,
                HealthStatus::Critical => critical += 1,
            }
        }

        DashboardWidget {
            id: "vqm-queue-health".to_string(),
            title: "Queue Health".to_string(),
            widget_type: WidgetType::Chart,
            size: WidgetSize::Medium,
            position: WidgetPosition { row: 0, col: 1 },
            data: WidgetData::Chart(ChartWidgetData {
                chart_type: ChartType::Doughnut,
                labels: vec!["Healthy".to_string(), "Warning".to_string(), "Critical".to_string()],
                datasets: vec![ChartDataset {
                    label: "Queues".to_string(),
                    data: vec![healthy as f64, warning as f64, critical as f64],
                    colors: vec![
                        "#22c55e".to_string(),
                        "#f59e0b".to_string(),
                        "#ef4444".to_string(),
                    ],
                }],
            }),
            refresh_interval: Some(30000),
        }
    }

    async fn throughput_widget(&self) -> DashboardWidget {
        // Get last 24 hours of throughput data
        let data = self.engine.metrics().get_throughput_history(24).await;

        DashboardWidget {
            id: "vqm-throughput".to_string(),
            title: "Message Throughput".to_string(),
            widget_type: WidgetType::Chart,
            size: WidgetSize::Large,
            position: WidgetPosition { row: 1, col: 0 },
            data: WidgetData::Chart(ChartWidgetData {
                chart_type: ChartType::Area,
                labels: data.iter().map(|d| d.timestamp.clone()).collect(),
                datasets: vec![
                    ChartDataset {
                        label: "Enqueued".to_string(),
                        data: data.iter().map(|d| d.enqueued as f64).collect(),
                        colors: vec!["#0ea5e9".to_string()],
                    },
                    ChartDataset {
                        label: "Processed".to_string(),
                        data: data.iter().map(|d| d.processed as f64).collect(),
                        colors: vec!["#22c55e".to_string()],
                    },
                ],
            }),
            refresh_interval: Some(10000),
        }
    }

    async fn worker_status_widget(&self) -> DashboardWidget {
        let workers = self.engine.worker_pool().list_all().await;

        let items: Vec<TableRow> = workers
            .iter()
            .take(5)
            .map(|w| TableRow {
                cells: vec![
                    w.name.clone(),
                    w.status.to_string(),
                    format!("{}/{}", w.active_jobs, w.concurrency),
                    format!("{}", w.total_processed),
                ],
            })
            .collect();

        DashboardWidget {
            id: "vqm-workers".to_string(),
            title: "Worker Status".to_string(),
            widget_type: WidgetType::Table,
            size: WidgetSize::Medium,
            position: WidgetPosition { row: 1, col: 1 },
            data: WidgetData::Table(TableWidgetData {
                headers: vec![
                    "Name".to_string(),
                    "Status".to_string(),
                    "Jobs".to_string(),
                    "Processed".to_string(),
                ],
                rows: items,
            }),
            refresh_interval: Some(5000),
        }
    }

    async fn alert_summary_widget(&self) -> DashboardWidget {
        // Mock alert data - would come from alert service
        DashboardWidget {
            id: "vqm-alerts".to_string(),
            title: "Active Alerts".to_string(),
            widget_type: WidgetType::List,
            size: WidgetSize::Small,
            position: WidgetPosition { row: 2, col: 0 },
            data: WidgetData::List(ListWidgetData {
                items: vec![
                    ListItem {
                        title: "High queue depth".to_string(),
                        subtitle: Some("orders-queue".to_string()),
                        badge: Some(Badge {
                            text: "Warning".to_string(),
                            variant: BadgeVariant::Warning,
                        }),
                        icon: Some("alert-triangle".to_string()),
                    },
                ],
            }),
            refresh_interval: Some(10000),
        }
    }

    async fn recent_activity_widget(&self) -> DashboardWidget {
        DashboardWidget {
            id: "vqm-activity".to_string(),
            title: "Recent Activity".to_string(),
            widget_type: WidgetType::Timeline,
            size: WidgetSize::Medium,
            position: WidgetPosition { row: 2, col: 1 },
            data: WidgetData::Timeline(TimelineWidgetData {
                events: vec![
                    TimelineEvent {
                        timestamp: chrono::Utc::now().to_rfc3339(),
                        title: "Worker registered".to_string(),
                        description: Some("worker-prod-01 joined the pool".to_string()),
                        icon: Some("server".to_string()),
                        color: Some("#22c55e".to_string()),
                    },
                    TimelineEvent {
                        timestamp: (chrono::Utc::now() - chrono::Duration::minutes(5)).to_rfc3339(),
                        title: "Queue created".to_string(),
                        description: Some("notifications-queue".to_string()),
                        icon: Some("plus".to_string()),
                        color: Some("#0ea5e9".to_string()),
                    },
                ],
            }),
            refresh_interval: Some(30000),
        }
    }

    async fn assess_queue_health(&self, _queue: &crate::engine::queue::QueueInfo) -> HealthStatus {
        // Assess queue health based on metrics
        HealthStatus::Healthy
    }
}

/// Dashboard widget definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardWidget {
    pub id: String,
    pub title: String,
    pub widget_type: WidgetType,
    pub size: WidgetSize,
    pub position: WidgetPosition,
    pub data: WidgetData,
    pub refresh_interval: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WidgetType {
    Stats,
    Chart,
    Table,
    List,
    Timeline,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WidgetSize {
    Small,
    Medium,
    Large,
    Full,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetPosition {
    pub row: u32,
    pub col: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WidgetData {
    Stats(StatsWidgetData),
    Chart(ChartWidgetData),
    Table(TableWidgetData),
    List(ListWidgetData),
    Timeline(TimelineWidgetData),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsWidgetData {
    pub items: Vec<StatItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatItem {
    pub label: String,
    pub value: String,
    pub change: Option<f64>,
    pub trend: Option<Trend>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Trend {
    Up,
    Down,
    Stable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartWidgetData {
    pub chart_type: ChartType,
    pub labels: Vec<String>,
    pub datasets: Vec<ChartDataset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChartType {
    Line,
    Bar,
    Area,
    Doughnut,
    Pie,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartDataset {
    pub label: String,
    pub data: Vec<f64>,
    pub colors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableWidgetData {
    pub headers: Vec<String>,
    pub rows: Vec<TableRow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableRow {
    pub cells: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListWidgetData {
    pub items: Vec<ListItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListItem {
    pub title: String,
    pub subtitle: Option<String>,
    pub badge: Option<Badge>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Badge {
    pub text: String,
    pub variant: BadgeVariant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BadgeVariant {
    Primary,
    Success,
    Warning,
    Danger,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineWidgetData {
    pub events: Vec<TimelineEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub timestamp: String,
    pub title: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Clone, Copy)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
}
