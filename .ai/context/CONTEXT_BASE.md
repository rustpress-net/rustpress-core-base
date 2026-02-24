# RustPress Core Base — AI Context Document

> **Purpose**: This document teaches an AI agent everything it needs to know about `rustpress-core-base` to build plugins, extend the platform, or contribute to the core. Read this FIRST. Only explore the full codebase if something specific is unclear.

---

## 1. What Is RustPress?

RustPress is a modern, high-performance Content Management System (CMS) built in Rust — designed as a WordPress alternative. It uses:
- **Axum** HTTP framework
- **PostgreSQL 16** database (via `sqlx`)
- **Redis 7** caching (optional, with in-memory fallback via `moka`)
- A **WordPress-like plugin/hook architecture** implemented in Rust

**Version**: 0.4.0 | **Rust Edition**: 2021 (min Rust 1.75) | **License**: MIT / Apache-2.0

---

## 2. Project Structure

```
rustpress-core-base/
├── Cargo.toml                    # Workspace root (29 members)
├── config/rustpress.toml         # Default server config
├── .env.example                  # Environment variables template
├── docker-compose.yml            # PostgreSQL 16 + Redis 7
├── Dockerfile                    # Multi-stage (rust:slim-bookworm → debian:bookworm-slim)
├── migrations/                   # 10 SQL migration files (00001–00030)
├── init_db.sql                   # Initial database setup
│
├── crates/                       # 19 workspace crates
│   ├── rustpress-core/           # Core traits, types, plugin system, hooks
│   ├── rustpress-database/       # PostgreSQL: pool, models, repositories
│   ├── rustpress-auth/           # JWT, OAuth2, TOTP, CSRF, sessions, API keys
│   ├── rustpress-api/            # REST API handlers + services (posts, pages, users, etc.)
│   ├── rustpress-server/         # Axum HTTP server, routes, middleware, security
│   ├── rustpress-plugins/        # Plugin registry, loader, discovery, sandbox
│   ├── rustpress-themes/         # Theme manager, manifests, templates, FSE
│   ├── rustpress-cache/          # Memory (moka), Redis, hybrid caching
│   ├── rustpress-storage/        # Local, S3, Azure, GCS file storage
│   ├── rustpress-jobs/           # Background job queue and workers
│   ├── rustpress-events/         # Event bus with subscribers
│   ├── rustpress-content/        # Blocks, shortcodes, revisions
│   ├── rustpress-users/          # User management, roles, GDPR, 2FA
│   ├── rustpress-media/          # Upload, image optimizer, srcset
│   ├── rustpress-admin/          # Admin dashboard handlers/routes
│   ├── rustpress-cli/            # CLI tools (clap-based, REPL, 14+ command groups)
│   ├── rustpress-health/         # Health probes
│   ├── rustpress-cdn/            # CDN integration (Cloudflare, BunnyCDN)
│   ├── rustpress-editor/         # Block editor, Gutenberg-like blocks, SEO analysis
│   └── rustpress-performance/    # SSR, ISR, minification, page cache
│
├── plugins/                      # Built-in plugins (workspace members)
│   ├── rustcloudflare/           # Cloudflare CDN/DNS/WAF/R2/D1/Workers
│   ├── rustbuilder/              # Visual page builder (disabled by default)
│   ├── visual-queue-manager/     # Enterprise queue management
│   ├── rustanalytics/            # Google Analytics integration
│   ├── rustbackup/               # Backup/restore
│   ├── rustcommerce/             # E-commerce (plugin.json config only)
│   └── rustpress-dbmanager/      # Database manager
│
├── admin-ui/                     # React/TypeScript admin dashboard (separate repo)
├── themes/                       # Theme directory
├── public/                       # Public static files
└── scripts/                      # Build & deployment scripts
```

---

## 3. Architecture Overview

```
┌──────────────────────────────────┐
│     admin-ui (React/Vite)        │  Separate repo: rustpress-core-admin-ui
└──────────────┬───────────────────┘
               │ HTTP/REST + WebSocket
┌──────────────▼───────────────────┐
│    rustpress-server (Axum)       │
│  ┌────────────────────────────┐  │
│  │ Middleware Stack:           │  │
│  │  Compression → Tracing     │  │
│  │  → Request ID → Audit      │  │
│  │  → Bot Detection → Logging │  │
│  │  → Security Headers → CORS │  │
│  │  → Rate Limit → Tenant     │  │
│  │  → Request Validation      │  │
│  └────────────────────────────┘  │
│  Routes: /api/v1, /admin, /health│
└──┬──────┬──────┬───────┬────────┘
   │      │      │       │
┌──▼──┐ ┌─▼──┐ ┌▼───┐ ┌─▼────────┐
│ api │ │auth│ │jobs│ │ plugins  │
└──┬──┘ └────┘ └────┘ └──────────┘
   │
┌──▼───────────┐     ┌────────────┐
│rustpress-db  │ ←── │ PostgreSQL │
│(sqlx pools)  │     │ + Redis    │
└──────────────┘     └────────────┘
```

### Key Design Patterns
- **Builder pattern**: `AppState::builder()`, `ServerBuilder`, config objects
- **Trait objects + dynamic dispatch**: `Arc<dyn Plugin>`, `Arc<dyn StorageBackend>`
- **WordPress-like hooks**: `HookRegistry` with `Action` and `Filter<T>`
- **Type-erased state**: `TypeMap` using `Any` for extensible `AppContext`
- **Factory pattern**: Plugin factories registered in `main.rs`
- **UUID v4/v7 everywhere**: All entity IDs are UUIDs

---

## 4. The Plugin System — How to Build a Plugin

This is the most important section for plugin development.

### 4.1 The Plugin Trait

Every plugin MUST implement this trait from `crates/rustpress-core/src/plugin.rs`:

```rust
#[async_trait]
pub trait Plugin: Send + Sync {
    /// Returns plugin metadata (name, version, description, etc.)
    fn info(&self) -> &PluginInfo;

    /// Called when the plugin is activated
    async fn activate(&self, ctx: &AppContext) -> Result<()>;

    /// Called when the plugin is deactivated
    async fn deactivate(&self, ctx: &AppContext) -> Result<()>;

    /// Called on server startup (after activation)
    async fn on_startup(&self, _ctx: &AppContext) -> Result<()> { Ok(()) }

    /// Called on server shutdown (before deactivation)
    async fn on_shutdown(&self, _ctx: &AppContext) -> Result<()> { Ok(()) }

    /// Check if this plugin is compatible with the environment
    fn is_compatible(&self) -> bool { true }

    /// Return JSON Schema for plugin configuration UI
    fn config_schema(&self) -> Option<serde_json::Value> { None }

    /// Current state of the plugin
    fn state(&self) -> PluginState { PluginState::Inactive }
}
```

### 4.2 PluginInfo Struct

```rust
pub struct PluginInfo {
    pub id: String,           // Unique identifier (e.g., "rustcommerce")
    pub name: String,         // Display name (e.g., "RustCommerce")
    pub version: String,      // SemVer (e.g., "1.0.0")
    pub description: String,
    pub author: String,
    pub license: String,
    pub homepage: Option<String>,
    pub repository: Option<String>,
    pub tags: Vec<String>,
    pub dependencies: Vec<PluginDependency>,
    pub min_rustpress_version: Option<String>,
}
```

### 4.3 Plugin Lifecycle

```
1. DISCOVERY   → PluginLoader::scan() reads plugins/*/plugin.toml manifests
2. FACTORY     → register_factory("id", || Arc::new(MyPlugin::new())) in main.rs
3. REGISTER    → PluginManager::register(plugin) stores in HashMap
4. ACTIVATE    → Dependency checking → state: Inactive → Activating → Active/Error
5. STARTUP     → PluginManager::startup() calls on_startup() on all active plugins
6. RUNNING     → Plugin responds to hooks, serves routes, processes events
7. SHUTDOWN    → PluginManager::shutdown() calls on_shutdown() in reverse order
8. DEACTIVATE  → Dependent checking → state cleanup
```

### 4.4 Plugin Manifest (plugin.toml)

Every plugin needs a `plugin.toml` in its directory. This is what RustPress scans for. Here is the full schema with all supported sections:

```toml
# === REQUIRED METADATA ===
id = "my-plugin"
name = "My Plugin"
version = "1.0.0"
description = "What this plugin does"
author = "Author Name"
license = "MIT"
tags = ["tag1", "tag2"]
category = "ecommerce"     # or: analytics, security, content, development, tools, etc.
icon = "shopping-cart"      # Lucide icon name

[requirements]
rustpress_version = ">=1.0.0"

# === DEPENDENCIES ===
[dependencies]
required = ["rustpress-core >= 0.5.0"]
optional = ["rustpress-auth >= 1.0.0"]
conflicts = ["legacy-plugin"]

# === SETTINGS SCHEMA (for admin UI) ===
[settings.schema]
[settings.schema.my_setting]
type = "string"         # string, boolean, integer, select, password, url, email, code
label = "My Setting"
description = "What this setting does"
default = "default_value"
required = true
group = "general"       # Groups settings in the UI

# === HOOKS ===
[hooks]
activate = "onActivate"
deactivate = "onDeactivate"
uninstall = "onUninstall"

[[hooks.actions]]
hook = "post_created"
callback = "onPostCreated"
priority = 10

[[hooks.filters]]
hook = "filter_post_content"
callback = "filterContent"
priority = 10

# === REST API ENDPOINTS ===
[api]
namespace = "my-plugin/v1"

[[api.endpoints]]
method = "GET"
path = "/items"
handler = "list_items"
permission = "read"
rate_limit = 60

[[api.endpoints]]
method = "POST"
path = "/items"
handler = "create_item"
permission = "manage_items"
rate_limit = 30

# === ADMIN UI INTEGRATION ===
[[admin.menu]]
label = "My Plugin"
icon = "package"
position = 30

[[admin.pages]]
path = "/admin/my-plugin"
component = "MyPluginDashboard"
title = "My Plugin Dashboard"

[[admin.widgets]]
id = "my-widget"
title = "My Dashboard Widget"
component = "MyWidget"
position = "main"
size = "medium"

# === DATABASE MIGRATIONS ===
[migrations]
directory = "migrations"
version_table = "my_plugin_migrations"

# === FRONTEND ASSETS ===
[[assets.css]]
path = "/plugins/my-plugin/assets/style.css"
location = "admin"     # admin, frontend, or both

[[assets.js]]
path = "/plugins/my-plugin/assets/app.js"
location = "admin"

# === SHORTCODES ===
[[shortcodes]]
tag = "my-shortcode"
handler = "render_shortcode"
description = "Renders my shortcode"

# === BLOCKS (Gutenberg-like) ===
[[blocks]]
name = "my-plugin/my-block"
title = "My Block"
category = "widgets"
editor_script = "my-block-editor"

# === CLI COMMANDS ===
[[cli]]
command = "my-plugin:status"
handler = "cli_status"
description = "Show plugin status"

# === CRON JOBS ===
[[cron]]
name = "my_daily_task"
schedule = "daily"          # hourly, twicedaily, daily, weekly, monthly, or cron expression
handler = "run_daily_task"
description = "Runs once a day"

# === FEATURE FLAGS ===
[features]
advanced_feature = { enabled = false, rollout = 0 }

# === PERMISSIONS ===
[permissions]
manage_items = "Manage plugin items"
view_reports = "View plugin reports"
```

### 4.5 How Plugins Register Routes

Plugins register their API routes in the core's route tree. In `crates/rustpress-server/src/routes.rs`, plugin routes are nested under `/api/v1/`:

```rust
// Example of how the Cloudflare plugin routes are added:
.nest("/api/v1/cloudflare", cloudflare_routes(state.clone()))

// Example of how the RustBuilder plugin routes are added:
.nest("/api/v1/rustbuilder", rustbuilder_routes(state.clone()))
```

**Convention**: Plugin routes use `/api/v1/{plugin-name}/` as their base path.

### 4.6 How Plugins Are Loaded in main.rs

Plugins are registered via factory functions:

```rust
// In main.rs
let mut plugin_loader = PluginLoader::new(&plugins_dir);

// Register built-in plugin factories
plugin_loader.register_factory("rustcloudflare", || Arc::new(RustCloudflarePlugin::new()));
plugin_loader.register_factory("rustcommerce", || Arc::new(RustCommercePlugin::new()));

// Discover and load plugins from filesystem
plugin_loader.discover().await?;

// Register with plugin manager
let plugin_manager = PluginManager::new();
for plugin in plugin_loader.loaded_plugins() {
    plugin_manager.register(plugin).await?;
}

// Activate enabled plugins
plugin_manager.startup().await?;
```

---

## 5. The Hook System

Located at `crates/rustpress-core/src/hook.rs`. WordPress-compatible pattern.

### 5.1 Actions (Side Effects)

```rust
// REGISTER an action hook
hook_registry.add_action(
    "post_created",
    Box::new(|data| Box::pin(async move {
        println!("A post was created: {:?}", data);
        Ok(())
    })),
    Priority::NORMAL,          // Priority(-100 to 100), higher = first
    Some("my-plugin".into()),  // Plugin ID for cleanup on deactivation
);

// EXECUTE an action hook (triggers all registered callbacks)
hook_registry.do_action("post_created", &some_data).await?;
```

### 5.2 Filters (Data Transformation)

```rust
// REGISTER a filter hook
hook_registry.add_filter::<String>(
    "filter_post_content",
    Box::new(|content| Box::pin(async move {
        // Modify content before it's displayed
        Ok(content.replace("foo", "bar"))
    })),
    Priority::NORMAL,
    Some("my-plugin".into()),
);

// APPLY a filter (passes data through all registered callbacks)
let modified_content = hook_registry.apply_filter("filter_post_content", original_content).await?;
```

### 5.3 Predefined Hook Names

**Actions**: `post_created`, `pre_post_save`, `post_saved`, `pre_post_delete`, `post_deleted`, `user_created`, `user_login`, `user_logout`, `comment_created`, `pre_comment_approve`, `plugin_activated`, `plugin_deactivated`, `request_start`, `request_end`

**Filters**: `filter_post_content`, `filter_post_title`, `filter_the_content`, `filter_user_caps`

### 5.4 Priority Levels

```rust
Priority::LOWEST   // Priority(-100) — executes last
Priority::LOW      // Priority(-50)
Priority::NORMAL   // Priority(0) — default
Priority::HIGH     // Priority(50)
Priority::HIGHEST  // Priority(100) — executes first
```

---

## 6. Database Schema (Key Models)

Located at `crates/rustpress-database/src/schema.rs`. All models use **UUID primary keys** and **timestamps with timezone**.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | User accounts | email, username, password_hash, 2FA, status |
| `Role` / `Capability` | RBAC | name, parent roles, priorities |
| `Post` | Content | title, slug, content, PostType enum, PostStatus enum |
| `Revision` | Content history | revision_number, change_summary, diff |
| `Taxonomy` / `Term` | Categories/tags | Hierarchical with ordering |
| `Media` | Files/images | MediaType enum, thumbnails, EXIF |
| `Comment` | Discussions | Nested (parent_id, depth), spam scoring |
| `SiteOption` | Key-value settings | group, autoload (like WordPress wp_options) |
| `Session` | Auth sessions | Device info, geolocation, revocation |
| `Menu` / `MenuItem` | Navigation | Nested with visibility rules |
| `Widget` / `BlockTemplate` | Layout | Display rules, area assignment |
| `Job` | Background tasks | Queue-based, dependencies, batches |
| `AuditLog` | Audit trail | Entity tracking, diff recording |

### Migration Convention

Migration files go in `migrations/` with format `NNNNN_description.sql` (e.g., `00031_ecommerce_tables.sql`). Plugins can also define their own migration directory in `plugin.toml`.

---

## 7. API Structure

### Route Hierarchy

```
/health                    → Health check
/api/health               → Health check (frontend alias)
/api/v1/auth/login        → POST: Authentication
/api/v1/auth/register     → POST: Registration
/api/v1/auth/refresh      → POST: Token refresh
/api/v1/posts             → CRUD: Posts
/api/v1/pages             → CRUD: Pages
/api/v1/media             → CRUD: Media
/api/v1/users             → CRUD: Users (admin)
/api/v1/comments          → CRUD: Comments
/api/v1/settings          → GET/PUT: Settings
/api/v1/themes            → Theme management
/api/v1/blocks            → Block management
/api/v1/{plugin-name}/*   → Plugin-specific routes
/admin                    → Admin SPA (serves React build)
/metrics                  → Prometheus metrics
/                         → Public website (theme rendering)
```

### API Pattern

Handlers follow this pattern:

```rust
// In crates/rustpress-api/src/handlers/
pub async fn list_items(
    State(state): State<AppState>,
    Query(params): Query<ListParams>,
) -> Result<Json<Vec<Item>>, Error> {
    let items = state.db.items.list(&params).await?;
    Ok(Json(items))
}

pub async fn create_item(
    State(state): State<AppState>,
    Json(payload): Json<CreateItemRequest>,
) -> Result<Json<Item>, Error> {
    let item = state.db.items.create(&payload).await?;
    Ok(Json(item))
}
```

### Authentication

- **JWT Bearer tokens** in `Authorization` header
- Access tokens expire (configurable, default 15min)
- Refresh tokens for renewal
- Rate limiting per IP/user/API key

---

## 8. Error Handling

From `crates/rustpress-core/src/error.rs`:

```rust
pub type Result<T> = std::result::Result<T, Error>;

// Key error variants for plugins:
Error::NotFound(String)           // 404
Error::Validation(ValidationErrors) // 400
Error::Authentication(String)     // 401
Error::Authorization(String)      // 403
Error::Plugin(String)             // 500 — plugin-specific errors
Error::PluginNotFound(String)     // 404
Error::PluginDependency(String)   // 400
Error::Internal(String)           // 500
```

Always use the `Error` type from `rustpress-core` for consistency. Errors automatically map to HTTP status codes.

---

## 9. Configuration

Config is loaded from (highest to lowest precedence):
1. CLI arguments (`--port`, `--host`)
2. Environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.)
3. Config file (`config/rustpress.toml`)
4. Defaults

Key env vars:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — JWT signing secret
- `RUSTPRESS_HOST` / `RUSTPRESS_PORT` — Server bind address
- `ADMIN_UI_PATH` — Path to admin UI build (default: `./admin-ui/dist`)

---

## 10. Build & Run

```bash
# Prerequisites: Rust 1.75+, PostgreSQL 16, Redis 7 (optional)

# Setup
cp .env.example .env           # Configure DATABASE_URL, JWT_SECRET, etc.
docker-compose up -d           # Start PostgreSQL + Redis

# Build & Run
cargo build --release          # Outputs: rustpress, rustpress-cli, rustpress-migrate
cargo run --bin rustpress      # Start the server

# Testing
cargo test                     # Run all tests
cargo clippy                   # Lint
cargo fmt                      # Format
```

---

## 11. Code Conventions

1. **Async everywhere**: Use `#[async_trait]` for async trait methods
2. **`Arc<T>` for shared state**: `AppState` fields are all `Arc<T>`
3. **`parking_lot::RwLock`** for sync locks, `tokio::sync::RwLock` for async
4. **`thiserror`** for error enums with HTTP status code mapping
5. **`serde`** everywhere: `Serialize` + `Deserialize` on all models; TOML for config, JSON for API
6. **`tracing`** for structured logging with span creation per request
7. **Builder pattern** for complex object construction
8. **Feature flags** via Cargo features for optional functionality

---

## 12. Existing Plugin Examples

Study these for implementation patterns:

| Plugin | Complexity | Best For Learning |
|--------|-----------|-------------------|
| `plugins/rustcommerce/` | Config-only (`plugin.json`) | Route definitions, admin menu, permissions |
| `plugins/rustanalytics/` | Medium (`plugin.toml`) | API endpoints, cron jobs, dashboard widgets |
| `plugins/rustpress-dbmanager/` | Medium (`plugin.toml`) | Settings schema, security hooks |
| `plugins/rustcloudflare/` | High (`plugin.toml` + Rust code) | Full implementation: settings, 96+ endpoints, CLI |
| `plugins/visual-queue-manager/` | Very High (`plugin.toml` + React frontend) | Feature flags, migrations, WebSocket, 80+ endpoints |

---

## 13. Quick Reference: Creating a New Plugin

```
1. Create directory:          plugins/my-plugin/
2. Create manifest:           plugins/my-plugin/plugin.toml
3. Create Cargo.toml:         Standard Rust crate depending on rustpress-core
4. Implement Plugin trait:    src/lib.rs with PluginInfo, activate, deactivate
5. Register hooks:            In activate() method, add actions/filters
6. Add API routes:            Define handler functions, declare in plugin.toml [api.endpoints]
7. Add migrations:            SQL files in plugins/my-plugin/migrations/
8. Register in main.rs:       plugin_loader.register_factory("my-plugin", ...)
9. Add route in routes.rs:    .nest("/api/v1/my-plugin", my_plugin_routes(state))
10. Build admin UI:           React components registered in admin-ui plugin system
```

---

## 14. File Reference for Deep Dives

If you need more detail, read these files in order:

| Topic | File |
|-------|------|
| Plugin trait | `crates/rustpress-core/src/plugin.rs` |
| Hook system | `crates/rustpress-core/src/hook.rs` |
| Error types | `crates/rustpress-core/src/error.rs` |
| Configuration | `crates/rustpress-core/src/config.rs` |
| Plugin registry | `crates/rustpress-plugins/src/registry.rs` |
| Plugin loader | `crates/rustpress-plugins/src/loader.rs` |
| Plugin discovery | `crates/rustpress-plugins/src/discovery.rs` |
| Plugin manager | `crates/rustpress-core/src/plugin.rs` (PluginManager struct) |
| Route definitions | `crates/rustpress-server/src/routes.rs` |
| Database models | `crates/rustpress-database/src/schema.rs` |
| API handlers | `crates/rustpress-api/src/handlers/` |
| Existing plugins | `plugins/*/plugin.toml` |
| Main entry | `src/main.rs` |
