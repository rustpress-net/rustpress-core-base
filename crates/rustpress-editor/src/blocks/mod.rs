//! Block System for RustPress Editor
//!
//! Implements a comprehensive block-based content editing system with:
//! - 100+ block types (paragraphs, headings, images, galleries, etc.)
//! - Drag-and-drop reordering
//! - Nested blocks (groups, columns)
//! - Block patterns and templates
//! - Real-time validation
//! - Multiple serialization formats (HTML, Markdown, JSON)

pub mod registry;
pub mod serialization;
pub mod transform;
pub mod types;
pub mod validation;

pub use registry::{BlockDefinition, BlockRegistry, BlockSupports};
pub use serialization::BlockSerializer;
pub use transform::BlockTransformer;
pub use types::*;
pub use validation::{BlockValidator, ValidationConfig, ValidationError, ValidationResult};
