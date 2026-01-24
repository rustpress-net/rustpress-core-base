//! Post Document System
//!
//! Comprehensive post management with:
//! - Post content (blocks)
//! - Metadata (author, date, categories, tags)
//! - SEO settings
//! - Publishing workflow
//! - Version history
//! - Media attachments

pub mod document;
pub mod media;
pub mod metadata;
pub mod publishing;
pub mod revision;
pub mod seo;
pub mod stats;

pub use document::*;
pub use media::*;
pub use metadata::*;
pub use publishing::*;
pub use revision::*;
pub use seo::*;
pub use stats::*;
