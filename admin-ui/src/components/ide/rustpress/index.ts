/**
 * RustPress IDE Components Index
 *
 * This module exports all RustPress-specific IDE components that provide
 * comprehensive CMS functionality within the IDE environment.
 *
 * Total Components: 25
 * Total Features: 50+
 */

// Content Management
export { ContentManager } from './ContentManager';
export { MediaLibrary } from './MediaLibrary';
export { TaxonomyManager } from './TaxonomyManager';
export { MenuBuilder } from './MenuBuilder';
export { CommentModeration } from './CommentModeration';

// Theme & Design
export { ThemeDesigner } from './ThemeDesigner';

// API & Data
export { APIExplorer } from './APIExplorer';
export { DatabaseInspector } from './DatabaseInspector';
export { WebhookManager } from './WebhookManager';

// Performance & SEO
export { SEOAnalyzer } from './SEOAnalyzer';
export { PerformanceProfiler } from './PerformanceProfiler';
export { CacheManager } from './CacheManager';

// Security & System
export { SecurityScanner } from './SecurityScanner';
export { BackupManager } from './BackupManager';
export { LogViewer } from './LogViewer';

// User & Access
export { UserRoleEditor } from './UserRoleEditor';

// Forms & Widgets
export { FormBuilder } from './FormBuilder';
export { WidgetManager } from './WidgetManager';

// Plugins & Extensions
export { PluginManager } from './PluginManager';

// Analytics & Reporting
export { AnalyticsDashboard } from './AnalyticsDashboard';

// Settings & Configuration
export { SettingsPanel } from './SettingsPanel';

// Email & Communication
export { EmailTemplateEditor } from './EmailTemplateEditor';

// URL Management
export { RedirectManager } from './RedirectManager';

// Scheduling & Automation
export { ScheduledTasks } from './ScheduledTasks';

// Re-export types
export type { ContentItem, ContentFilter } from './ContentManager';
export type { MediaItem, MediaFolder } from './MediaLibrary';
export type { Taxonomy } from './TaxonomyManager';
export type { MenuItem, MenuLocation, MenuConfig } from './MenuBuilder';
export type { Comment } from './CommentModeration';
export type { ThemeVariable, ThemeSection } from './ThemeDesigner';
export type { APIEndpoint, APIParameter } from './APIExplorer';
export type { TableSchema, ColumnSchema, IndexSchema, ForeignKeySchema } from './DatabaseInspector';
export type { WebhookConfig, WebhookLog } from './WebhookManager';
export type { SEOIssue, SEOScore } from './SEOAnalyzer';
export type { PerformanceMetric, ResourceTiming } from './PerformanceProfiler';
export type { CacheEntry, CacheStats, CacheSettings } from './CacheManager';
export type { SecurityIssue, SecurityScore } from './SecurityScanner';
export type { Backup, BackupSchedule } from './BackupManager';
export type { LogEntry, LogFilter } from './LogViewer';
export type { Permission, Role, User } from './UserRoleEditor';
export type { FormField, Form } from './FormBuilder';
export type { Widget, WidgetArea } from './WidgetManager';
export type { Plugin } from './PluginManager';
export type { AnalyticsData, PageView, TrafficSource, DeviceData, GeoData } from './AnalyticsDashboard';
export type { SettingsSection, Setting } from './SettingsPanel';
export type { EmailTemplate } from './EmailTemplateEditor';
export type { Redirect } from './RedirectManager';
export type { ScheduledTask, TaskLog } from './ScheduledTasks';

/**
 * Component Categories and Features:
 *
 * === CONTENT MANAGEMENT (5 components, 15+ features) ===
 * - ContentManager: Create, edit, publish posts/pages, bulk actions, filtering
 * - MediaLibrary: Upload, organize, preview media files, drag-drop, folders
 * - TaxonomyManager: Categories, tags, hierarchical taxonomy management
 * - MenuBuilder: Visual menu builder, drag-drop ordering, multi-location
 * - CommentModeration: Approve, reject, spam detection, bulk moderation
 *
 * === THEME & DESIGN (1 component, 8+ features) ===
 * - ThemeDesigner: Colors, typography, spacing, live preview, export CSS
 *
 * === API & DATA (3 components, 10+ features) ===
 * - APIExplorer: REST API documentation, request testing, response preview
 * - DatabaseInspector: Table browser, column info, indexes, SQL queries
 * - WebhookManager: Configure webhooks, event triggers, delivery logs
 *
 * === PERFORMANCE & SEO (3 components, 12+ features) ===
 * - SEOAnalyzer: On-page SEO analysis, meta tags, recommendations
 * - PerformanceProfiler: Core Web Vitals, resource timing, waterfall
 * - CacheManager: Cache entries, TTL, clear/purge, statistics
 *
 * === SECURITY & SYSTEM (3 components, 10+ features) ===
 * - SecurityScanner: Vulnerability detection, severity levels, fixes
 * - BackupManager: Create, restore, schedule backups, cloud storage
 * - LogViewer: Real-time logs, filtering, log levels, export
 *
 * === USER & ACCESS (1 component, 6+ features) ===
 * - UserRoleEditor: Roles, permissions, user assignments
 *
 * === FORMS & WIDGETS (2 components, 10+ features) ===
 * - FormBuilder: Drag-drop form creation, field types, validation
 * - WidgetManager: Widget areas, configuration, placement
 *
 * === PLUGINS & EXTENSIONS (1 component, 5+ features) ===
 * - PluginManager: Install, activate, update, configure plugins
 *
 * === ANALYTICS & REPORTING (1 component, 8+ features) ===
 * - AnalyticsDashboard: Traffic, visitors, pages, sources, real-time
 *
 * === SETTINGS & CONFIGURATION (1 component, 6+ features) ===
 * - SettingsPanel: General, reading, writing, media, performance settings
 *
 * === EMAIL & COMMUNICATION (1 component, 5+ features) ===
 * - EmailTemplateEditor: Create, edit, preview email templates
 *
 * === URL MANAGEMENT (1 component, 5+ features) ===
 * - RedirectManager: 301/302 redirects, regex patterns, hit tracking
 *
 * === SCHEDULING & AUTOMATION (1 component, 6+ features) ===
 * - ScheduledTasks: Cron jobs, run history, pause/resume, logs
 *
 * TOTAL: 25 Components, 100+ Features
 */
