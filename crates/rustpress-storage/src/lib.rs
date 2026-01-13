//! # RustPress Storage
//!
//! File storage abstraction supporting local and cloud storage backends.

pub mod backend;
pub mod file;
pub mod storage;

pub use backend::{LocalBackend, StorageBackend};
pub use file::{FileMetadata, StoredFile};
pub use storage::{Storage, StorageConfig};

#[cfg(feature = "s3")]
pub use backend::S3Backend;
