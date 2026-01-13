//! Server services module
//!
//! Contains service layers that coordinate between handlers and repositories.

pub mod email_service;
pub mod render_service;
pub mod theme_service;

pub use theme_service::{
    DefaultThemeInfo, ThemeInfo, ThemeInstallResult, ThemePreviewResult, ThemeScanResult,
    ThemeService, ThemeSettingsInfo, ThemeValidationResult,
};

pub use render_service::{
    ArchiveData, AuthorData, MediaData, MenuData, MenuItemData, PaginationData, PostData,
    RenderService, RenderedPage, SiteInfo, TermData, WidgetAreaData, WidgetData,
};

pub use email_service::{EmailConfig, EmailError, EmailResult, EmailService, EmailTemplate};
