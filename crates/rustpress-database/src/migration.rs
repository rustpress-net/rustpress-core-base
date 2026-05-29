//! Database migration system.

use rustpress_core::error::{Error, Result};
use sqlx::PgPool;
#[allow(unused_imports)]
use std::path::Path;

/// Migration entry
#[derive(Debug, Clone)]
pub struct Migration {
    pub version: i64,
    pub name: String,
    pub sql: String,
}

impl Migration {
    pub fn new(version: i64, name: impl Into<String>, sql: impl Into<String>) -> Self {
        Self {
            version,
            name: name.into(),
            sql: sql.into(),
        }
    }
}

/// Database migrator
pub struct Migrator {
    migrations: Vec<Migration>,
}

impl Migrator {
    pub fn new() -> Self {
        Self {
            migrations: Vec::new(),
        }
    }

    /// Add a migration
    pub fn add(&mut self, migration: Migration) -> &mut Self {
        self.migrations.push(migration);
        self.migrations.sort_by_key(|m| m.version);
        self
    }

    /// Load migrations from embedded SQL
    pub fn with_migrations(mut self, migrations: Vec<Migration>) -> Self {
        for m in migrations {
            self.add(m);
        }
        self
    }

    /// Run all pending migrations
    pub async fn run(&self, pool: &PgPool) -> Result<Vec<i64>> {
        // Ensure migrations table exists
        self.ensure_migrations_table(pool).await?;

        // Get applied migrations
        let applied = self.get_applied_migrations(pool).await?;

        let mut newly_applied = Vec::new();

        for migration in &self.migrations {
            if !applied.contains(&migration.version) {
                self.apply_migration(pool, migration).await?;
                newly_applied.push(migration.version);
            }
        }

        if newly_applied.is_empty() {
            tracing::info!("No pending migrations");
        } else {
            tracing::info!(count = newly_applied.len(), "Applied migrations");
        }

        Ok(newly_applied)
    }

    /// Rollback the last migration
    pub async fn rollback(&self, pool: &PgPool) -> Result<Option<i64>> {
        let applied = self.get_applied_migrations(pool).await?;

        if let Some(&last_version) = applied.last() {
            // Find the migration
            let migration = self
                .migrations
                .iter()
                .find(|m| m.version == last_version)
                .ok_or_else(|| Error::Migration {
                    message: format!("Migration {} not found", last_version),
                })?;

            // Remove from applied
            sqlx::query("DELETE FROM _migrations WHERE version = $1")
                .bind(last_version)
                .execute(pool)
                .await
                .map_err(|e| Error::database_with_source("Failed to remove migration record", e))?;

            tracing::info!(version = last_version, name = %migration.name, "Rolled back migration");
            Ok(Some(last_version))
        } else {
            Ok(None)
        }
    }

    /// Get migration status
    pub async fn status(&self, pool: &PgPool) -> Result<Vec<MigrationStatus>> {
        self.ensure_migrations_table(pool).await?;
        let applied = self.get_applied_migrations(pool).await?;

        let statuses = self
            .migrations
            .iter()
            .map(|m| MigrationStatus {
                version: m.version,
                name: m.name.clone(),
                applied: applied.contains(&m.version),
            })
            .collect();

        Ok(statuses)
    }

    async fn ensure_migrations_table(&self, pool: &PgPool) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS _migrations (
                version BIGINT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            "#,
        )
        .execute(pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to create migrations table", e))?;

        Ok(())
    }

    async fn get_applied_migrations(&self, pool: &PgPool) -> Result<Vec<i64>> {
        let rows: Vec<(i64,)> = sqlx::query_as("SELECT version FROM _migrations ORDER BY version")
            .fetch_all(pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get applied migrations", e))?;

        Ok(rows.into_iter().map(|(v,)| v).collect())
    }

    async fn apply_migration(&self, pool: &PgPool, migration: &Migration) -> Result<()> {
        tracing::info!(
            version = migration.version,
            name = %migration.name,
            "Applying migration"
        );

        // Execute the migration SQL
        sqlx::query(&migration.sql)
            .execute(pool)
            .await
            .map_err(|e| {
                Error::database_with_source(format!("Migration {} failed", migration.version), e)
            })?;

        // Record the migration
        sqlx::query("INSERT INTO _migrations (version, name) VALUES ($1, $2)")
            .bind(migration.version)
            .bind(&migration.name)
            .execute(pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to record migration", e))?;

        Ok(())
    }
}

impl Default for Migrator {
    fn default() -> Self {
        Self::new()
    }
}

/// Migration status
#[derive(Debug, Clone)]
pub struct MigrationStatus {
    pub version: i64,
    pub name: String,
    pub applied: bool,
}

// NOTE: Production database schema migrations are applied by the
// `rustpress-migrate` binary directly from the SQL files in `migrations/`
// (tracked in the `schema_migrations` table). The `Migrator`/`Migration`
// types above are a reusable engine; there is deliberately no hardcoded seed
// schema in this crate, to avoid drift with the canonical SQL files. The old
// `create_initial_migrations()` helper was removed for that reason — its
// hardcoded schema had diverged from `migrations/` (e.g. `media.uploader_id`
// vs the SQL files' `media.uploaded_by`).

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_migrator_add() {
        let mut migrator = Migrator::new();
        migrator.add(Migration::new(2, "second", "SELECT 2"));
        migrator.add(Migration::new(1, "first", "SELECT 1"));

        assert_eq!(migrator.migrations[0].version, 1);
        assert_eq!(migrator.migrations[1].version, 2);
    }
}
