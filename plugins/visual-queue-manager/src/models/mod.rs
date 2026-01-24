//! Data Models Module
//!
//! Contains all data transfer objects and domain models.

pub mod queue;
pub mod message;
pub mod worker;
pub mod handler;
pub mod subscription;
pub mod job;
pub mod alert;
pub mod audit;

pub use queue::*;
pub use message::*;
pub use worker::*;
pub use handler::*;
pub use subscription::*;
pub use job::*;
pub use alert::*;
pub use audit::*;

use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Common pagination parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub offset: i64,
    pub limit: i64,
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            offset: 0,
            limit: 20,
        }
    }
}

/// Common sorting parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sorting {
    pub field: String,
    pub direction: SortDirection,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortDirection {
    Asc,
    Desc,
}

impl Default for SortDirection {
    fn default() -> Self {
        Self::Desc
    }
}

/// Common response metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMeta {
    pub total: i64,
    pub offset: i64,
    pub limit: i64,
    pub has_more: bool,
}

impl ResponseMeta {
    pub fn new(total: i64, offset: i64, limit: i64) -> Self {
        Self {
            total,
            offset,
            limit,
            has_more: offset + limit < total,
        }
    }
}

/// Common timestamp fields
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Timestamps {
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Default for Timestamps {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            created_at: now,
            updated_at: now,
        }
    }
}

/// Entity with ID and timestamps
pub trait Entity {
    fn id(&self) -> Uuid;
    fn created_at(&self) -> DateTime<Utc>;
    fn updated_at(&self) -> DateTime<Utc>;
}

/// Soft-deletable entity
pub trait SoftDeletable: Entity {
    fn deleted_at(&self) -> Option<DateTime<Utc>>;
    fn is_deleted(&self) -> bool {
        self.deleted_at().is_some()
    }
}

/// Tenant-scoped entity for multi-tenancy
pub trait TenantScoped: Entity {
    fn tenant_id(&self) -> Option<Uuid>;
}
