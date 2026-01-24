//! Job Scheduler Module
//!
//! Handles scheduled job execution with cron and interval-based scheduling.

use chrono::{DateTime, Duration, Utc};
use cron::Schedule;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::{EngineError, EngineEvent};

/// Database row for scheduled job
#[derive(Debug, FromRow)]
struct ScheduledJobRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    queue_id: Uuid,
    message_type: String,
    payload_template: Option<serde_json::Value>,
    schedule_type: String,
    cron_expression: Option<String>,
    interval_seconds: Option<i64>,
    run_at: Option<DateTime<Utc>>,
    timezone: Option<String>,
    status: String,
    timeout_secs: Option<i32>,
    max_concurrent: Option<i32>,
    current_concurrent: Option<i32>,
    retry_on_failure: Option<bool>,
    max_retries: Option<i32>,
    total_runs: Option<i64>,
    successful_runs: Option<i64>,
    failed_runs: Option<i64>,
    last_run_at: Option<DateTime<Utc>>,
    next_run_at: Option<DateTime<Utc>>,
    metadata: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

/// Database row for job execution
#[derive(Debug, FromRow)]
struct JobExecutionRow {
    id: Uuid,
    job_id: Uuid,
    status: String,
    started_at: DateTime<Utc>,
    completed_at: Option<DateTime<Utc>>,
    duration_ms: Option<i64>,
    message_id: Option<Uuid>,
    error: Option<String>,
    retry_count: Option<i32>,
    metadata: Option<serde_json::Value>,
}

/// Job status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JobStatus {
    Active,
    Paused,
    Running,
    Completed,
    Failed,
}

impl From<String> for JobStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "active" => JobStatus::Active,
            "paused" => JobStatus::Paused,
            "running" => JobStatus::Running,
            "completed" => JobStatus::Completed,
            "failed" => JobStatus::Failed,
            _ => JobStatus::Active,
        }
    }
}

impl ToString for JobStatus {
    fn to_string(&self) -> String {
        match self {
            JobStatus::Active => "active".to_string(),
            JobStatus::Paused => "paused".to_string(),
            JobStatus::Running => "running".to_string(),
            JobStatus::Completed => "completed".to_string(),
            JobStatus::Failed => "failed".to_string(),
        }
    }
}

/// Schedule type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ScheduleType {
    Cron { expression: String },
    Interval { seconds: u64 },
    Once { at: DateTime<Utc> },
}

/// Job configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobConfig {
    /// Job name
    pub name: String,
    /// Job description
    pub description: Option<String>,
    /// Queue to enqueue messages to
    pub queue_id: Uuid,
    /// Message type to create
    pub message_type: String,
    /// Message payload template
    pub payload_template: serde_json::Value,
    /// Schedule configuration
    pub schedule: ScheduleType,
    /// Timezone for cron expressions
    pub timezone: String,
    /// Maximum execution time in seconds
    pub timeout_secs: u64,
    /// Maximum concurrent executions
    pub max_concurrent: u32,
    /// Retry on failure
    pub retry_on_failure: bool,
    /// Maximum retries
    pub max_retries: u32,
    /// Dependencies (other job IDs that must complete first)
    pub dependencies: Vec<Uuid>,
    /// Custom metadata
    pub metadata: serde_json::Value,
}

/// Scheduled job
#[derive(Debug, Clone, Serialize)]
pub struct ScheduledJob {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub queue_id: Uuid,
    pub message_type: String,
    pub payload_template: serde_json::Value,
    pub schedule: ScheduleType,
    pub timezone: String,
    pub status: JobStatus,
    pub timeout_secs: u64,
    pub max_concurrent: u32,
    pub current_concurrent: u32,
    pub retry_on_failure: bool,
    pub max_retries: u32,
    pub total_runs: u64,
    pub successful_runs: u64,
    pub failed_runs: u64,
    pub last_run_at: Option<DateTime<Utc>>,
    pub next_run_at: Option<DateTime<Utc>>,
    pub dependencies: Vec<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Job execution record
#[derive(Debug, Clone, Serialize)]
pub struct JobExecution {
    pub id: Uuid,
    pub job_id: Uuid,
    pub status: JobStatus,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<u64>,
    pub message_id: Option<Uuid>,
    pub error: Option<String>,
    pub retry_count: u32,
    pub metadata: serde_json::Value,
}

/// Job scheduler for managing scheduled jobs
pub struct JobScheduler {
    pool: PgPool,
    event_tx: broadcast::Sender<EngineEvent>,
    /// Running state
    running: Arc<RwLock<bool>>,
    /// Job cache
    jobs: Arc<RwLock<HashMap<Uuid, ScheduledJob>>>,
}

impl JobScheduler {
    /// Create a new job scheduler
    pub fn new(pool: PgPool, event_tx: broadcast::Sender<EngineEvent>) -> Self {
        Self {
            pool,
            event_tx,
            running: Arc::new(RwLock::new(false)),
            jobs: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Start the scheduler
    pub async fn start(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        if *running {
            return Ok(());
        }
        *running = true;
        drop(running);

        // Load all active jobs
        self.load_jobs().await?;

        // Start the scheduling loop
        self.start_scheduling_loop().await;

        tracing::info!("Job scheduler started");
        Ok(())
    }

    /// Stop the scheduler
    pub async fn stop(&self) -> Result<(), EngineError> {
        let mut running = self.running.write().await;
        *running = false;
        tracing::info!("Job scheduler stopped");
        Ok(())
    }

    /// Start the scheduling loop
    async fn start_scheduling_loop(&self) {
        let pool = self.pool.clone();
        let event_tx = self.event_tx.clone();
        let running = self.running.clone();
        let jobs_cache = self.jobs.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(1));

            loop {
                interval.tick().await;

                if !*running.read().await {
                    break;
                }

                // Find and execute due jobs
                if let Err(e) = execute_due_jobs(&pool, &event_tx, &jobs_cache).await {
                    tracing::error!("Error executing scheduled jobs: {}", e);
                }
            }
        });
    }

    /// Load all active jobs into cache
    async fn load_jobs(&self) -> Result<(), EngineError> {
        let rows: Vec<ScheduledJobRow> = sqlx::query_as::<_, ScheduledJobRow>(
            r#"
            SELECT id, name, description, queue_id, message_type, payload_template,
                   schedule_type, cron_expression, interval_seconds, run_at,
                   timezone, status, timeout_secs, max_concurrent, current_concurrent,
                   retry_on_failure, max_retries, total_runs, successful_runs,
                   failed_runs, last_run_at, next_run_at, metadata, created_at, updated_at
            FROM vqm_scheduled_jobs WHERE status IN ('active', 'paused')
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        let mut jobs = self.jobs.write().await;
        for row in rows {
            let schedule = match row.schedule_type.as_str() {
                "cron" => ScheduleType::Cron {
                    expression: row.cron_expression.unwrap_or_default(),
                },
                "interval" => ScheduleType::Interval {
                    seconds: row.interval_seconds.unwrap_or(60) as u64,
                },
                "once" => ScheduleType::Once {
                    at: row.run_at.unwrap_or_else(Utc::now),
                },
                _ => ScheduleType::Interval { seconds: 60 },
            };

            // Fetch dependencies
            let deps: Vec<Uuid> = sqlx::query_scalar::<_, Uuid>(
                "SELECT dependency_job_id FROM vqm_job_dependencies WHERE job_id = $1",
            )
            .bind(row.id)
            .fetch_all(&self.pool)
            .await?;

            let job = ScheduledJob {
                id: row.id,
                name: row.name,
                description: row.description,
                queue_id: row.queue_id,
                message_type: row.message_type,
                payload_template: row.payload_template.unwrap_or(serde_json::json!({})),
                schedule,
                timezone: row.timezone.unwrap_or_else(|| "UTC".to_string()),
                status: JobStatus::from(row.status),
                timeout_secs: row.timeout_secs.unwrap_or(300) as u64,
                max_concurrent: row.max_concurrent.unwrap_or(1) as u32,
                current_concurrent: row.current_concurrent.unwrap_or(0) as u32,
                retry_on_failure: row.retry_on_failure.unwrap_or(true),
                max_retries: row.max_retries.unwrap_or(3) as u32,
                total_runs: row.total_runs.unwrap_or(0) as u64,
                successful_runs: row.successful_runs.unwrap_or(0) as u64,
                failed_runs: row.failed_runs.unwrap_or(0) as u64,
                last_run_at: row.last_run_at,
                next_run_at: row.next_run_at,
                dependencies: deps,
                metadata: row.metadata.unwrap_or(serde_json::json!({})),
                created_at: row.created_at,
                updated_at: row.updated_at,
            };

            jobs.insert(row.id, job);
        }

        Ok(())
    }

    /// Create a new scheduled job
    pub async fn create_job(&self, config: JobConfig) -> Result<ScheduledJob, EngineError> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        // Validate schedule
        let (schedule_type, cron_expr, interval_secs, run_at) = match &config.schedule {
            ScheduleType::Cron { expression } => {
                // Validate cron expression
                Schedule::from_str(expression).map_err(|e| {
                    EngineError::InvalidConfig(format!("Invalid cron expression: {}", e))
                })?;
                ("cron", Some(expression.clone()), None, None)
            }
            ScheduleType::Interval { seconds } => {
                if *seconds < 1 {
                    return Err(EngineError::InvalidConfig(
                        "Interval must be at least 1 second".into(),
                    ));
                }
                ("interval", None, Some(*seconds as i64), None)
            }
            ScheduleType::Once { at } => ("once", None, None, Some(*at)),
        };

        // Calculate next run time
        let next_run = calculate_next_run(&config.schedule, &config.timezone, None)?;

        sqlx::query(
            r#"
            INSERT INTO vqm_scheduled_jobs (
                id, name, description, queue_id, message_type, payload_template,
                schedule_type, cron_expression, interval_seconds, run_at,
                timezone, status, timeout_secs, max_concurrent, current_concurrent,
                retry_on_failure, max_retries, next_run_at, metadata, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            )
            "#
        )
        .bind(id)
        .bind(&config.name)
        .bind(&config.description)
        .bind(config.queue_id)
        .bind(&config.message_type)
        .bind(&config.payload_template)
        .bind(schedule_type)
        .bind(&cron_expr)
        .bind(interval_secs)
        .bind(run_at)
        .bind(&config.timezone)
        .bind("active")
        .bind(config.timeout_secs as i32)
        .bind(config.max_concurrent as i32)
        .bind(0i32)
        .bind(config.retry_on_failure)
        .bind(config.max_retries as i32)
        .bind(next_run)
        .bind(&config.metadata)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Add dependencies
        for dep_id in &config.dependencies {
            sqlx::query(
                r#"
                INSERT INTO vqm_job_dependencies (job_id, dependency_job_id)
                VALUES ($1, $2)
                "#,
            )
            .bind(id)
            .bind(dep_id)
            .execute(&self.pool)
            .await?;
        }

        let job = ScheduledJob {
            id,
            name: config.name,
            description: config.description,
            queue_id: config.queue_id,
            message_type: config.message_type,
            payload_template: config.payload_template,
            schedule: config.schedule,
            timezone: config.timezone,
            status: JobStatus::Active,
            timeout_secs: config.timeout_secs,
            max_concurrent: config.max_concurrent,
            current_concurrent: 0,
            retry_on_failure: config.retry_on_failure,
            max_retries: config.max_retries,
            total_runs: 0,
            successful_runs: 0,
            failed_runs: 0,
            last_run_at: None,
            next_run_at: next_run,
            dependencies: config.dependencies,
            metadata: config.metadata,
            created_at: now,
            updated_at: now,
        };

        // Update cache
        self.jobs.write().await.insert(id, job.clone());

        Ok(job)
    }

    /// Get a job by ID
    pub async fn get_job(&self, id: Uuid) -> Result<ScheduledJob, EngineError> {
        if let Some(job) = self.jobs.read().await.get(&id) {
            return Ok(job.clone());
        }

        // Fetch from database (implementation similar to load_jobs)
        Err(EngineError::InvalidConfig(format!("Job {} not found", id)))
    }

    /// Pause a job
    pub async fn pause_job(&self, id: Uuid) -> Result<(), EngineError> {
        sqlx::query(
            "UPDATE vqm_scheduled_jobs SET status = 'paused', updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .execute(&self.pool)
        .await?;

        if let Some(job) = self.jobs.write().await.get_mut(&id) {
            job.status = JobStatus::Paused;
            job.updated_at = Utc::now();
        }

        Ok(())
    }

    /// Resume a job
    pub async fn resume_job(&self, id: Uuid) -> Result<(), EngineError> {
        // Calculate next run time
        let job = self.jobs.read().await.get(&id).cloned();
        let next_run = if let Some(j) = job {
            calculate_next_run(&j.schedule, &j.timezone, None)?
        } else {
            None
        };

        sqlx::query(
            r#"
            UPDATE vqm_scheduled_jobs
            SET status = 'active', next_run_at = $2, updated_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(next_run)
        .execute(&self.pool)
        .await?;

        if let Some(job) = self.jobs.write().await.get_mut(&id) {
            job.status = JobStatus::Active;
            job.next_run_at = next_run;
            job.updated_at = Utc::now();
        }

        Ok(())
    }

    /// Delete a job
    pub async fn delete_job(&self, id: Uuid) -> Result<(), EngineError> {
        // Delete dependencies first
        sqlx::query("DELETE FROM vqm_job_dependencies WHERE job_id = $1 OR dependency_job_id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        // Delete executions
        sqlx::query("DELETE FROM vqm_job_executions WHERE job_id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        // Delete job
        sqlx::query("DELETE FROM vqm_scheduled_jobs WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        self.jobs.write().await.remove(&id);

        Ok(())
    }

    /// Trigger a job to run immediately
    pub async fn trigger_job(&self, id: Uuid) -> Result<JobExecution, EngineError> {
        let job = self.get_job(id).await?;

        if job.status == JobStatus::Paused {
            return Err(EngineError::InvalidConfig(
                "Cannot trigger paused job".into(),
            ));
        }

        if job.current_concurrent >= job.max_concurrent {
            return Err(EngineError::InvalidConfig(
                "Maximum concurrent executions reached".into(),
            ));
        }

        execute_job(&self.pool, &self.event_tx, &job).await
    }

    /// List all jobs
    pub async fn list_jobs(
        &self,
        status_filter: Option<JobStatus>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<ScheduledJob>, i64), EngineError> {
        let status_str = status_filter.map(|s| s.to_string());

        let total: i64 = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM vqm_scheduled_jobs
            WHERE ($1::text IS NULL OR status = $1)
            "#,
        )
        .bind(&status_str)
        .fetch_one(&self.pool)
        .await?;

        // Simplified query - just return from cache for active jobs
        let jobs: Vec<ScheduledJob> = self
            .jobs
            .read()
            .await
            .values()
            .filter(|j| status_filter.map_or(true, |s| j.status == s))
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect();

        Ok((jobs, total))
    }

    /// Get job execution history
    pub async fn get_executions(
        &self,
        job_id: Uuid,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<JobExecution>, i64), EngineError> {
        let total: i64 = sqlx::query_scalar::<_, i64>(
            r#"SELECT COUNT(*) FROM vqm_job_executions WHERE job_id = $1"#,
        )
        .bind(job_id)
        .fetch_one(&self.pool)
        .await?;

        let rows: Vec<JobExecutionRow> = sqlx::query_as::<_, JobExecutionRow>(
            r#"
            SELECT id, job_id, status, started_at, completed_at, duration_ms,
                   message_id, error, retry_count, metadata
            FROM vqm_job_executions
            WHERE job_id = $1
            ORDER BY started_at DESC
            OFFSET $2 LIMIT $3
            "#,
        )
        .bind(job_id)
        .bind(offset)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let executions: Vec<JobExecution> = rows
            .into_iter()
            .map(|row| JobExecution {
                id: row.id,
                job_id: row.job_id,
                status: JobStatus::from(row.status),
                started_at: row.started_at,
                completed_at: row.completed_at,
                duration_ms: row.duration_ms.map(|d| d as u64),
                message_id: row.message_id,
                error: row.error,
                retry_count: row.retry_count.unwrap_or(0) as u32,
                metadata: row.metadata.unwrap_or(serde_json::json!({})),
            })
            .collect();

        Ok((executions, total))
    }

    /// Invalidate job cache
    pub async fn invalidate_cache(&self, id: Uuid) {
        self.jobs.write().await.remove(&id);
    }
}

/// Execute due jobs
async fn execute_due_jobs(
    pool: &PgPool,
    event_tx: &broadcast::Sender<EngineEvent>,
    jobs_cache: &RwLock<HashMap<Uuid, ScheduledJob>>,
) -> Result<(), EngineError> {
    let now = Utc::now();

    // Find jobs that are due
    let due_job_ids: Vec<Uuid> = sqlx::query_scalar::<_, Uuid>(
        r#"
        SELECT id FROM vqm_scheduled_jobs
        WHERE status = 'active'
        AND next_run_at <= $1
        AND current_concurrent < max_concurrent
        "#,
    )
    .bind(now)
    .fetch_all(pool)
    .await?;

    for job_id in due_job_ids {
        let job = {
            let cache = jobs_cache.read().await;
            cache.get(&job_id).cloned()
        };

        if let Some(job) = job {
            // Check dependencies
            if !check_dependencies(pool, &job).await? {
                continue;
            }

            // Execute the job
            match execute_job(pool, event_tx, &job).await {
                Ok(execution) => {
                    tracing::info!(
                        "Job {} executed successfully (execution: {})",
                        job.id,
                        execution.id
                    );
                }
                Err(e) => {
                    tracing::error!("Failed to execute job {}: {}", job.id, e);
                }
            }

            // Update next run time
            let next_run = calculate_next_run(&job.schedule, &job.timezone, Some(now))?;
            sqlx::query("UPDATE vqm_scheduled_jobs SET next_run_at = $2 WHERE id = $1")
                .bind(job_id)
                .bind(next_run)
                .execute(pool)
                .await?;

            // Update cache
            if let Some(cached_job) = jobs_cache.write().await.get_mut(&job_id) {
                cached_job.next_run_at = next_run;
            }
        }
    }

    Ok(())
}

/// Check if job dependencies are satisfied
async fn check_dependencies(pool: &PgPool, job: &ScheduledJob) -> Result<bool, EngineError> {
    if job.dependencies.is_empty() {
        return Ok(true);
    }

    // Check if all dependencies have completed their latest run successfully
    for dep_id in &job.dependencies {
        let last_success: Option<DateTime<Utc>> = sqlx::query_scalar::<_, Option<DateTime<Utc>>>(
            r#"
            SELECT MAX(completed_at)
            FROM vqm_job_executions
            WHERE job_id = $1 AND status = 'completed'
            "#,
        )
        .bind(dep_id)
        .fetch_one(pool)
        .await?;

        if last_success.is_none() {
            return Ok(false);
        }

        // Check if dependency ran after the last run of this job
        if let Some(last_run) = job.last_run_at {
            if let Some(dep_completed) = last_success {
                if dep_completed < last_run {
                    return Ok(false);
                }
            }
        }
    }

    Ok(true)
}

/// Execute a single job
async fn execute_job(
    pool: &PgPool,
    event_tx: &broadcast::Sender<EngineEvent>,
    job: &ScheduledJob,
) -> Result<JobExecution, EngineError> {
    let execution_id = Uuid::new_v4();
    let now = Utc::now();

    // Mark job as running
    sqlx::query(
        r#"
        UPDATE vqm_scheduled_jobs
        SET current_concurrent = current_concurrent + 1,
            status = 'running'
        WHERE id = $1
        "#,
    )
    .bind(job.id)
    .execute(pool)
    .await?;

    // Create execution record
    sqlx::query(
        r#"
        INSERT INTO vqm_job_executions (id, job_id, status, started_at)
        VALUES ($1, $2, 'running', $3)
        "#,
    )
    .bind(execution_id)
    .bind(job.id)
    .bind(now)
    .execute(pool)
    .await?;

    // Create the message
    let message_id = Uuid::new_v4();

    // Prepare payload with job context
    let mut payload = job.payload_template.clone();
    if let Some(obj) = payload.as_object_mut() {
        obj.insert("_job_id".to_string(), serde_json::json!(job.id));
        obj.insert("_execution_id".to_string(), serde_json::json!(execution_id));
        obj.insert("_scheduled_at".to_string(), serde_json::json!(now));
    }

    let result = sqlx::query(
        r#"
        INSERT INTO vqm_messages (
            id, queue_id, message_type, payload, status, created_at
        ) VALUES ($1, $2, $3, $4, 'pending', $5)
        "#,
    )
    .bind(message_id)
    .bind(job.queue_id)
    .bind(&job.message_type)
    .bind(&payload)
    .bind(now)
    .execute(pool)
    .await;

    let (status, error) = match result {
        Ok(_) => ("completed", None),
        Err(e) => ("failed", Some(e.to_string())),
    };

    let completed_at = Utc::now();
    let duration_ms = (completed_at - now).num_milliseconds() as i64;

    // Update execution record
    sqlx::query(
        r#"
        UPDATE vqm_job_executions
        SET status = $2, completed_at = $3, duration_ms = $4, message_id = $5, error = $6
        WHERE id = $1
        "#,
    )
    .bind(execution_id)
    .bind(status)
    .bind(completed_at)
    .bind(duration_ms)
    .bind(if error.is_none() {
        Some(message_id)
    } else {
        None
    })
    .bind(&error)
    .execute(pool)
    .await?;

    // Update job statistics
    let (success_inc, fail_inc) = if error.is_none() { (1, 0) } else { (0, 1) };
    sqlx::query(
        r#"
        UPDATE vqm_scheduled_jobs
        SET current_concurrent = current_concurrent - 1,
            status = 'active',
            total_runs = total_runs + 1,
            successful_runs = successful_runs + $2,
            failed_runs = failed_runs + $3,
            last_run_at = $4
        WHERE id = $1
        "#,
    )
    .bind(job.id)
    .bind(success_inc)
    .bind(fail_inc)
    .bind(completed_at)
    .execute(pool)
    .await?;

    // Emit event
    let _ = event_tx.send(EngineEvent::ScheduledJobExecuted {
        job_id: job.id,
        success: error.is_none(),
    });

    Ok(JobExecution {
        id: execution_id,
        job_id: job.id,
        status: JobStatus::from(status.to_string()),
        started_at: now,
        completed_at: Some(completed_at),
        duration_ms: Some(duration_ms as u64),
        message_id: if error.is_none() {
            Some(message_id)
        } else {
            None
        },
        error,
        retry_count: 0,
        metadata: serde_json::json!({}),
    })
}

/// Calculate the next run time for a schedule
fn calculate_next_run(
    schedule: &ScheduleType,
    _timezone: &str,
    after: Option<DateTime<Utc>>,
) -> Result<Option<DateTime<Utc>>, EngineError> {
    let base = after.unwrap_or_else(Utc::now);

    match schedule {
        ScheduleType::Cron { expression } => {
            let cron_schedule = Schedule::from_str(expression)
                .map_err(|e| EngineError::InvalidConfig(format!("Invalid cron: {}", e)))?;

            Ok(cron_schedule.after(&base).next())
        }
        ScheduleType::Interval { seconds } => Ok(Some(base + Duration::seconds(*seconds as i64))),
        ScheduleType::Once { at } => {
            if *at > base {
                Ok(Some(*at))
            } else {
                Ok(None) // Already passed
            }
        }
    }
}
