//! RustPress Themes
//!
//! A comprehensive theme system for the RustPress CMS, providing:
//!
//! - Theme manifest format and loading
//! - Template hierarchy and engine (Tera-based)
//! - Theme customizer with live preview
//! - Asset compilation (CSS/SCSS/JS)
//! - Responsive images
//! - Block patterns
//! - Full-site editing support
//! - Theme variations and dark mode
//! - Accessibility and performance tools

pub mod assets;
pub mod child_theme;
pub mod critical_css;
pub mod customizer;
pub mod design_tokens;
pub mod docs;
pub mod export;
pub mod fse;
pub mod images;
pub mod manager;
pub mod manifest;
pub mod marketplace;
pub mod patterns;
pub mod quality;
pub mod settings;
pub mod starter_content;
pub mod templates;
pub mod theme_json;
pub mod variations;

// Re-exports for convenience
pub use assets::{AssetCompiler, AssetConfig};
pub use child_theme::{ChildThemeBuilder, ThemeInheritance};
pub use critical_css::{CriticalCssConfig, CriticalCssExtractor};
pub use customizer::ThemeCustomizer;
pub use design_tokens::{ColorPalette, DesignTokens, LayoutSettings, TypographySettings};
pub use docs::{DocGenerator, ScreenshotGenerator};
pub use export::{ExportOptions, ThemeExporter, ThemeImporter};
pub use fse::{FseManager, FseTemplate, TemplatePart};
pub use images::{ImageSize, ResponsiveImageGenerator};
pub use manager::{RegisteredTheme, ThemeManager, ThemePreview};
pub use manifest::ThemeManifest;
pub use marketplace::{MarketplaceClient, MarketplaceConfig, ThemeListing};
pub use patterns::{BlockPattern, PatternRegistry};
pub use quality::{AccessibilityChecker, AmpCompatibility, PerformanceScorer};
pub use settings::{GlobalSettingsRegistry, ThemeSettings};
pub use starter_content::StarterContent;
pub use templates::{TemplateEngine, TemplateHierarchy, TemplatePartManager};
pub use theme_json::ThemeJson;
pub use variations::{DarkModeConfig, StyleVariation, VariationManager};

use thiserror::Error;

/// Theme system errors
#[derive(Debug, Error)]
pub enum ThemeError {
    #[error("Theme not found: {0}")]
    NotFound(String),

    #[error("Invalid theme manifest: {0}")]
    InvalidManifest(String),

    #[error("Template error: {0}")]
    Template(String),

    #[error("Asset error: {0}")]
    Asset(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

/// Theme type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ThemeType {
    /// Classic PHP-style theme
    Classic,
    /// Block-based theme
    Block,
    /// Hybrid (supports both)
    Hybrid,
}

/// Prelude for common imports
pub mod prelude {
    pub use crate::AssetCompiler;
    pub use crate::DesignTokens;
    pub use crate::PatternRegistry;
    pub use crate::TemplateEngine;
    pub use crate::ThemeCustomizer;
    pub use crate::ThemeError;
    pub use crate::ThemeManager;
    pub use crate::ThemeManifest;
    pub use crate::ThemeSettings;
    pub use crate::ThemeType;
}
