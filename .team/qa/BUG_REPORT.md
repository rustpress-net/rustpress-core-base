# RustPress CMS - Consolidated Bug Report

> **Author**: QA Engineer (QA)
> **Date**: 2026-03-02
> **Version**: 1.0
> **Status**: Wave 3 QA Artifact
> **Sources**: Compiler Audit, API Design, DB Schema, Test Coverage, Auth Flow, Component Arch, API Integration, Test Plan, TypeScript Audit, CI/CD Pipeline, Security Audit

---

## Severity Definitions

| Severity | Definition |
|----------|-----------|
| **CRITICAL** | System cannot function. Compilation failure, data loss, complete security bypass. Must fix before any other work. |
| **HIGH** | Major feature broken or serious security vulnerability. Must fix before production deployment. |
| **MEDIUM** | Feature partially broken, workaround exists, or moderate security concern. Fix before v1.0 release. |
| **LOW** | Cosmetic issue, minor inconvenience, or documentation gap. Fix when convenient. |

---

## CRITICAL Severity Issues

### BUG-001: Missing `pageforge` Plugin Crate Blocks All Compilation

| Field | Value |
|-------|-------|
| **ID** | BUG-001 |
| **Severity** | CRITICAL |
| **Component** | Backend / Build System |
| **Found By** | Backend Engineer (Compiler Audit) |
| **File/Location** | `Cargo.toml` line 28, `crates/rustpress-server/Cargo.toml` line 22 |
| **Description** | The `pageforge` plugin is listed as a workspace member and a dependency of `rustpress-server`, but the `plugins/pageforge/` directory does not exist. The workspace cannot resolve the manifest, which means `cargo check`, `cargo test`, `cargo build`, and ALL Rust tooling fails. This blocks all backend development, testing, and deployment. |
| **Error** | `error: failed to load manifest for workspace member 'rustpress-server' -- Caused by: failed to read 'plugins\pageforge\Cargo.toml' -- os error 3` |
| **Proposed Fix** | **Option A (Recommended)**: Create a minimal stub `plugins/pageforge/` crate with `Cargo.toml` and `src/lib.rs`. The routes.rs already references `build_pageforge_router(&state)` and the admin UI has `pageforgeApi.ts`. **Option B**: Remove pageforge from both Cargo.toml files and comment out the router call. |
| **Effort** | 30 minutes (Option A), 15 minutes (Option B) |

---

### BUG-002: CORS Allows Any Origin

| Field | Value |
|-------|-------|
| **ID** | BUG-002 |
| **Severity** | CRITICAL |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` line 199 |
| **Description** | `CorsLayer::new().allow_origin(Any)` allows any website to make authenticated API requests. An attacker could create a malicious page that makes API calls to the RustPress instance using the victim's JWT stored in the browser, enabling cross-site data theft and unauthorized actions. |
| **Proposed Fix** | Replace `Any` with explicit allowed origins from configuration. Use `cors_origins` field from `ApiConfig`. Allow configuration via `CORS_ORIGINS` environment variable (comma-separated list). |
| **Effort** | 1-2 hours |

---

### BUG-003: Default JWT Secret is Predictable

| Field | Value |
|-------|-------|
| **ID** | BUG-003 |
| **Severity** | CRITICAL |
| **Component** | Backend / Auth / Security |
| **Found By** | Backend Engineer (Auth Flow), Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-auth/src/jwt.rs` line 109 |
| **Description** | The default JWT secret is `"change-me-in-production"`. If the server starts without a proper `JWT_SECRET` environment variable, all JWT tokens are trivially forgeable by anyone who knows the default. This is a complete authentication bypass. |
| **Proposed Fix** | Fail to start if `JWT_SECRET` is not set or equals the default value. Log a CRITICAL-level error and exit the process. |
| **Effort** | 30 minutes |

---

### BUG-004: No RBAC Enforcement on 22 of 24 Route Groups

| Field | Value |
|-------|-------|
| **ID** | BUG-004 |
| **Severity** | CRITICAL |
| **Component** | Backend / Auth / Authorization |
| **Found By** | Backend Engineer (Auth Flow) |
| **File/Location** | `crates/rustpress-server/src/routes.rs` (all route group definitions) |
| **Description** | Only the email configuration endpoints (`/api/v1/email/*`) check for `role == "administrator"`. All other admin operations (user management, plugin install/uninstall, theme management, settings changes, backup/restore, CDN configuration, cache purge, file system access) only require a valid JWT token. A user with `subscriber` role can: install/uninstall plugins, change site settings, purge the cache, modify CDN configuration, create/restore backups, delete other users, and access file system APIs. |
| **Proposed Fix** | Add role-based middleware to all admin operation routes. At minimum: plugin management, theme management, user management, settings, backups, CDN, cache, file system, and git routes should require `administrator` or `editor` role. |
| **Effort** | 2-3 hours |

---

### BUG-005: Missing Database Tables Referenced in Handler Code

| Field | Value |
|-------|-------|
| **ID** | BUG-005 |
| **Severity** | CRITICAL |
| **Component** | Backend / Database |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | `routes.rs` lines 4174-4188 (backups), 4129 (backup_schedules), 6251 (widget_areas) |
| **Description** | The route handlers execute SQL queries against tables that do not exist in any migration: (1) `backups` table -- queried for id, name, backup_type, file_size, status, created_at, (2) `backup_schedules` table -- queried for schedule CRUD, (3) `widget_areas` table -- queried for id, slug, name, description, deleted_at. Any request to these endpoints will result in a PostgreSQL runtime error (table not found). |
| **Proposed Fix** | Create new migration files: 00031 for `backups` + `backup_schedules` tables, 00032 for `widget_areas` table. |
| **Effort** | 2-3 hours |

---

### BUG-006: Missing `deleted_at` Column on Posts and Menus Tables

| Field | Value |
|-------|-------|
| **ID** | BUG-006 |
| **Severity** | CRITICAL |
| **Component** | Backend / Database |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | `routes.rs` lines 3981, 4100, 4426-4448, 6470-6521 (posts), line 5842 (menus) |
| **Description** | Multiple SQL queries in `routes.rs` use `WHERE p.deleted_at IS NULL` for posts and `WHERE deleted_at IS NULL` for menus, but neither the `posts` nor `menus` table has a `deleted_at` column in any migration. Every query that filters on `deleted_at` will fail at runtime with "column does not exist". This affects post listing, post detail, bulk operations, and menu listing. |
| **Proposed Fix** | Create new migration adding `deleted_at TIMESTAMPTZ` to both `posts` and `menus` tables. |
| **Effort** | 30 minutes |

---

### BUG-007: Frontend API URL Prefix Mismatch

| Field | Value |
|-------|-------|
| **ID** | BUG-007 |
| **Severity** | CRITICAL |
| **Component** | Frontend / API Integration |
| **Found By** | Frontend Engineer (API Integration Audit) |
| **File/Location** | `src/api/client.ts` (base URL), `vite.config.ts` (proxy config) |
| **Description** | The frontend `apiClient` uses base URL `/api` while the backend routes are at `/api/v1/`. Frontend calls `GET /api/posts` but backend expects `GET /api/v1/posts`. Some services (analyticsApi, chatApi, themeService) already use the `/api/v1/` prefix, creating inconsistency. The Vite dev proxy forwards `/api` to `http://localhost:3080` without path rewriting. This means NO API calls from the admin UI will reach the correct backend endpoints. |
| **Proposed Fix** | Update `apiClient` base URL to `/api/v1` and update all endpoint paths in API modules. Also update Vite proxy target from port 3080 to whatever port the backend runs on (likely 8080). |
| **Effort** | 2-3 hours |

---

## HIGH Severity Issues

### BUG-008: Frontend Login Page is a Placeholder

| Field | Value |
|-------|-------|
| **ID** | BUG-008 |
| **Severity** | HIGH |
| **Component** | Frontend / Auth |
| **Found By** | Frontend Engineer (Component Arch Audit) |
| **File/Location** | `src/App.tsx` (inline Login component) |
| **Description** | The login route renders `<div>Login Page</div>` only. There is no login form, no email/password inputs, no authentication logic, no `authApi` module. Users cannot log into the admin UI. |
| **Proposed Fix** | Create a proper `src/pages/auth/LoginPage.tsx` with email/password form, create `src/api/authApi.ts` for login/register/refresh/logout calls, create `src/store/authStore.ts` for JWT management. |
| **Effort** | 4-6 hours |

---

### BUG-009: 13 Core CMS Pages are Stubs with Hardcoded Data

| Field | Value |
|-------|-------|
| **ID** | BUG-009 |
| **Severity** | HIGH |
| **Component** | Frontend / Pages |
| **Found By** | Frontend Engineer (Component Arch Audit) |
| **File/Location** | `src/App.tsx` lines (inline components) |
| **Description** | The following core CMS pages are inline stub components in App.tsx with hardcoded data and non-functional buttons: PagesList (4 hardcoded pages), MediaLibrary (12 empty squares), CommentsPage (2 hardcoded comments), ThemesPage (4 hardcoded themes), UsersListPage (3 hardcoded users), SettingsListPage (static form), CategoriesPage (EmptyState), TagsPage (EmptyState), WidgetsPage ("coming soon"), ThemeEditorPage ("coming soon"), RolesPage (4 hardcoded roles), Login (`<div>Login Page</div>`). None make API calls. |
| **Proposed Fix** | Extract each into its own file under `src/pages/`, create corresponding API modules, connect to Zustand stores that call real backend APIs. |
| **Effort** | 8-12 hours per page, ~100+ hours total |

---

### BUG-010: Dashboard Uses 100% Mock Data

| Field | Value |
|-------|-------|
| **ID** | BUG-010 |
| **Severity** | HIGH |
| **Component** | Frontend / Dashboard |
| **Found By** | Frontend Engineer (Component Arch Audit) |
| **File/Location** | `src/pages/enterprise/Dashboard.tsx`, `src/store/dashboardStore.ts` |
| **Description** | The main dashboard page pulls from `dashboardStore` which is entirely populated with `Math.random()` sample data generators. Post counts, comment counts, user counts, activity feeds, and traffic graphs are all fake. The backend has `/api/v1/stats` and `/api/v1/stats/dashboard` endpoints that return real data (though `/stats/overview` returns hardcoded fake data and `/stats/activity` returns empty arrays). |
| **Proposed Fix** | Connect `dashboardStore` to real `/api/v1/stats/dashboard` endpoint. Fix backend `/stats/overview` and `/stats/activity` to return real data. |
| **Effort** | 4-6 hours (frontend + backend fixes) |

---

### BUG-011: Backend Stats Endpoints Return Fake/Empty Data

| Field | Value |
|-------|-------|
| **ID** | BUG-011 |
| **Severity** | HIGH |
| **Component** | Backend / API |
| **Found By** | Backend Engineer (API Design Audit) |
| **File/Location** | `routes.rs` -- stats handlers |
| **Description** | `GET /stats/overview` returns hardcoded fake data (e.g., `total_views: 12500`). `GET /stats/activity` returns empty arrays. `GET /stats/content` is missing `by_category` and `by_author` breakdowns. The strategy requires "Dashboard shows real metrics from backend." |
| **Proposed Fix** | Replace hardcoded values with actual database queries. Implement activity feed from recent posts/comments. |
| **Effort** | 3-4 hours |

---

### BUG-012: Prometheus Metrics Endpoint is Stubbed

| Field | Value |
|-------|-------|
| **ID** | BUG-012 |
| **Severity** | HIGH |
| **Component** | Backend / Observability |
| **Found By** | Backend Engineer (API Design Audit) |
| **File/Location** | `routes.rs` lines 1151-1153 |
| **Description** | `GET /metrics` returns a static string `"# Metrics endpoint - implement with prometheus-client"`. The `prometheus-client` crate is in dependencies but not wired up. The strategy requires real Prometheus metrics. |
| **Proposed Fix** | Wire `prometheus-client` crate to collect request counts, latencies, error rates, DB pool stats, and serve them at `/metrics`. |
| **Effort** | 4-6 hours |

---

### BUG-013: Search Reindex Endpoint is Stubbed

| Field | Value |
|-------|-------|
| **ID** | BUG-013 |
| **Severity** | HIGH |
| **Component** | Backend / Search |
| **Found By** | Backend Engineer (API Design Audit) |
| **File/Location** | `routes.rs` -- search reindex handler |
| **Description** | `POST /search/reindex` returns `{ status: "queued" }` but no background job is actually queued. There is no job queue infrastructure to process the reindex. |
| **Proposed Fix** | Either implement background reindex job or change response to accurately reflect behavior. |
| **Effort** | 4-8 hours (depending on job queue approach) |

---

### BUG-014: Refresh Tokens Stored in Memory Only

| Field | Value |
|-------|-------|
| **ID** | BUG-014 |
| **Severity** | HIGH |
| **Component** | Backend / Auth |
| **Found By** | Backend Engineer (Auth Flow) |
| **File/Location** | `crates/rustpress-auth/src/refresh_token.rs` |
| **Description** | `RefreshTokenStore` uses `RwLock<HashMap>`. If the server restarts, all refresh tokens are lost and all users must re-login. In a multi-instance deployment, tokens are instance-local. |
| **Proposed Fix** | Store refresh tokens in PostgreSQL or Redis. The `sessions` table exists and could be extended, or a dedicated `refresh_tokens` table should be created. |
| **Effort** | 2-4 hours |

---

### BUG-015: CSRF Middleware Not Applied

| Field | Value |
|-------|-------|
| **ID** | BUG-015 |
| **Severity** | HIGH |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-auth/src/csrf.rs` (exists), `crates/rustpress-server/src/app.rs` (not applied) |
| **Description** | A full CSRF protection module exists in `rustpress-auth` with token generation, cookie management, and header validation. However, it is NOT wired into the middleware stack in `app.rs`. State-changing requests (POST/PUT/DELETE) can be forged via cross-origin requests, especially combined with BUG-002 (CORS Any). |
| **Proposed Fix** | Wire CSRF middleware from `rustpress-auth` into the middleware stack for all state-changing API routes. For JWT-only auth this is less critical, but session-based auth requires it. |
| **Effort** | 2-3 hours |

---

### BUG-016: CSP Allows unsafe-inline and unsafe-eval

| Field | Value |
|-------|-------|
| **ID** | BUG-016 |
| **Severity** | HIGH |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` (security_headers function) |
| **Description** | Content Security Policy includes `script-src 'self' 'unsafe-inline' 'unsafe-eval'` which negates most of CSP's XSS protection. The `unsafe-eval` is likely required by Monaco Editor and some React dependencies. |
| **Proposed Fix** | Use CSP nonces for inline scripts. Scope `unsafe-eval` to specific paths (e.g., IDE/editor routes only). Tighten CSP for all other routes. |
| **Effort** | 3-5 hours |

---

### BUG-017: Entrypoint Script Uses bcrypt Instead of Argon2

| Field | Value |
|-------|-------|
| **ID** | BUG-017 |
| **Severity** | HIGH |
| **Component** | Backend / Docker / Auth |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `entrypoint.sh` line 119 |
| **Description** | The Docker entrypoint script uses Python bcrypt for the admin seed password, while the application uses Argon2id for password verification. This hash format mismatch means the initial admin user's password may not work -- the login handler will try to verify against an Argon2id hash but find a bcrypt hash instead. |
| **Proposed Fix** | Use the RustPress CLI tool to hash the password with Argon2id in the entrypoint script, or embed a Rust binary that generates Argon2id hashes. |
| **Effort** | 1-2 hours |

---

### BUG-018: Admin Password Logged to stdout

| Field | Value |
|-------|-------|
| **ID** | BUG-018 |
| **Severity** | HIGH |
| **Component** | Backend / Docker / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `entrypoint.sh` line 142 |
| **Description** | The entrypoint script logs `"Password: ${ADMIN_PASSWORD}"` to stdout. This means the admin password is visible in Docker container logs, potentially exposed to anyone with log access. |
| **Proposed Fix** | Remove the password logging line. If needed, write to a temporary file with restricted permissions that is deleted after first login. |
| **Effort** | 15 minutes |

---

### BUG-019: CI Clippy Job Suppresses All Lints

| Field | Value |
|-------|-------|
| **ID** | BUG-019 |
| **Severity** | HIGH |
| **Component** | Backend / CI/CD |
| **Found By** | DevOps Engineer (CI/CD Pipeline Audit) |
| **File/Location** | `.github/workflows/ci.yml` (clippy job) |
| **Description** | The CI clippy job runs with `cargo clippy --all-targets --all-features -- -A warnings -A clippy::all` which suppresses ALL lints, making the job completely useless. It always passes regardless of code quality. The strategy requires `cargo clippy -- -D warnings` with zero suppression. |
| **Proposed Fix** | Change to `cargo clippy --all-targets --all-features -- -D warnings`. This will likely fail until all compiler warnings are fixed (dependent on BUG-001 resolution). |
| **Effort** | 15 minutes (config change), 4-8 hours (fixing resulting warnings) |

---

### BUG-020: CI Uses RUSTFLAGS to Suppress 6 Warning Categories

| Field | Value |
|-------|-------|
| **ID** | BUG-020 |
| **Severity** | HIGH |
| **Component** | Backend / CI/CD |
| **Found By** | DevOps Engineer (CI/CD Pipeline Audit) |
| **File/Location** | `.github/workflows/ci.yml` line 12 |
| **Description** | CI environment sets `RUSTFLAGS: -Dwarnings -Aunused -Amismatched_lifetime_syntaxes -Adependency_on_unit_never_type_fallback -Aunused_comparisons -Aambiguous_glob_reexports -Aimproper_ctypes_definitions` which suppresses 6 categories of warnings. The strategy requires zero warning suppression. Estimated 400-750 warnings are hidden. |
| **Proposed Fix** | Remove all `-A` flags from RUSTFLAGS after fixing the underlying warnings in the source code. |
| **Effort** | 4-8 hours (fixing warnings across 200+ source files) |

---

### BUG-021: No Frontend CI Pipeline

| Field | Value |
|-------|-------|
| **ID** | BUG-021 |
| **Severity** | HIGH |
| **Component** | Frontend / CI/CD |
| **Found By** | DevOps Engineer (CI/CD Pipeline Audit) |
| **File/Location** | `rustpress-core-admin-ui/.github/` (does not exist) |
| **Description** | The frontend repository has no `.github/` directory, no CI workflow, no automated type checking, no test execution, no build verification. Code can be pushed with type errors, broken builds, or regressions with no automated detection. |
| **Proposed Fix** | Create `.github/workflows/ci.yml` with typecheck, lint, test, build, and audit jobs. |
| **Effort** | 2-3 hours |

---

### BUG-022: Bot Detection is Log-Only by Default

| Field | Value |
|-------|-------|
| **ID** | BUG-022 |
| **Severity** | HIGH |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/security/bot_detection.rs` |
| **Description** | Bot detection scoring exists but `block_bots: false` is the default. Automated attacks (scrapers, brute force tools, vulnerability scanners) are logged but never blocked. |
| **Proposed Fix** | Change default to `block_bots: true` or make it configurable via environment variable with blocking as the recommended default. |
| **Effort** | 30 minutes |

---

### BUG-023: Security Audit Log is In-Memory Only

| Field | Value |
|-------|-------|
| **ID** | BUG-023 |
| **Severity** | HIGH |
| **Component** | Backend / Security / Logging |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/security/security_audit.rs` |
| **Description** | Security events (blocked requests, auth failures, brute force attempts, rate limit violations) are stored in an in-memory `VecDeque`. All security event history is lost on server restart. There is no persistent storage, no alerting, and no way to forensically analyze attacks after the fact. |
| **Proposed Fix** | Persist security events to a database table (`security_audit_log`) or to structured log files. Add alerting for CRITICAL severity events. |
| **Effort** | 3-4 hours |

---

### BUG-024: Rate Limiter Uses Per-Instance Cache

| Field | Value |
|-------|-------|
| **ID** | BUG-024 |
| **Severity** | HIGH |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` (rate limiter setup) |
| **Description** | Rate limit counters are stored in moka (in-memory) cache. In a multi-instance deployment, each instance has its own rate limit counters, so an attacker can multiply their allowed requests by the number of instances. The `window_secs` config is reportedly not respected (fixed at 60s). |
| **Proposed Fix** | Use Redis as the rate limit backend for distributed rate limiting. Respect the `window_secs` configuration value. |
| **Effort** | 3-4 hours |

---

### BUG-025: `media_folders` Table DROP CASCADE in Migration 00030

| Field | Value |
|-------|-------|
| **ID** | BUG-025 |
| **Severity** | HIGH |
| **Component** | Backend / Database |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | `migrations/00030_media_library.sql` |
| **Description** | Migration 00030 drops the `media_folders` table (created in 00024) with `CASCADE` and recreates it with a different schema. This destroys all existing folder data and breaks the `fk_media_folder` constraint added in 00024. In a production migration scenario, this causes data loss. |
| **Proposed Fix** | Replace DROP CASCADE with ALTER TABLE commands that add/modify columns while preserving existing data. |
| **Effort** | 2-3 hours |

---

## MEDIUM Severity Issues

### BUG-026: TypeScript Strict Mode Disabled with 1,057 Errors

| Field | Value |
|-------|-------|
| **ID** | BUG-026 |
| **Severity** | MEDIUM |
| **Component** | Frontend / TypeScript |
| **Found By** | Frontend Engineer (TypeScript Audit) |
| **File/Location** | `tsconfig.json` |
| **Description** | `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`. Running `npx tsc --noEmit --strict` produces ~1,057 errors. Some errors are genuine bugs: 18 property name typos (TS2551), 14 argument type mismatches (TS2345), 3 wrong argument counts (TS2554), 11 undefined names (TS2304). |
| **Proposed Fix** | Enable strict mode incrementally per the TypeScript Audit migration strategy (6 phases, estimated 27-40 hours). |
| **Effort** | 27-40 hours |

---

### BUG-027: No DOWN Migrations

| Field | Value |
|-------|-------|
| **ID** | BUG-027 |
| **Severity** | MEDIUM |
| **Component** | Backend / Database |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | `migrations/` directory (all 10 files) |
| **Description** | None of the 10 migration files include rollback SQL. The strategy requires: "Database migrations are reversible and tested (up + down for all 10 migration files)." Without DOWN migrations, there is no way to safely roll back a failed deployment. |
| **Proposed Fix** | Write DOWN migration scripts for all 10 existing migrations. |
| **Effort** | 4-6 hours |

---

### BUG-028: Migration Numbering Gap (00002 to 00023)

| Field | Value |
|-------|-------|
| **ID** | BUG-028 |
| **Severity** | MEDIUM |
| **Component** | Backend / Database |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | `migrations/` directory |
| **Description** | Migration numbering jumps from `00002` to `00023`, suggesting migrations 3-22 were deleted or never existed. The `refinery` migration framework may have issues with non-sequential numbering. |
| **Proposed Fix** | Verify refinery handles gaps correctly. If not, consolidate migrations with sequential numbering. |
| **Effort** | 1-2 hours (verification), 4-6 hours (renumbering if needed) |

---

### BUG-029: Missing Foreign Key on posts.featured_image_id

| Field | Value |
|-------|-------|
| **ID** | BUG-029 |
| **Severity** | MEDIUM |
| **Component** | Backend / Database |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | `migrations/00001_initial_schema.sql` line 34 |
| **Description** | `posts.featured_image_id` is a UUID column but has no foreign key constraint to `media(id)`. Orphaned media references can exist. |
| **Proposed Fix** | Add FK constraint in a new migration: `ALTER TABLE posts ADD CONSTRAINT fk_posts_featured_image FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL`. |
| **Effort** | 30 minutes |

---

### BUG-030: No Request Timeout Middleware

| Field | Value |
|-------|-------|
| **ID** | BUG-030 |
| **Severity** | MEDIUM |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` (exists), `app.rs` (not applied) |
| **Description** | `request_timeout()` function exists but is not in the middleware stack. Slow requests can hold connections indefinitely, enabling Slowloris-style DoS attacks. |
| **Proposed Fix** | Add request timeout middleware to the stack with a configurable timeout (e.g., 30 seconds). |
| **Effort** | 30 minutes |

---

### BUG-031: IP Extraction Trusts X-Forwarded-For Header

| Field | Value |
|-------|-------|
| **ID** | BUG-031 |
| **Severity** | MEDIUM |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` line 126 |
| **Description** | The rate limiter uses `X-Forwarded-For` header directly to identify client IPs. Without proper reverse proxy configuration, this header can be spoofed, allowing attackers to bypass rate limiting. |
| **Proposed Fix** | Only trust `X-Forwarded-For` when a trusted proxy is configured. Add a `TRUSTED_PROXIES` configuration option. Fall back to the direct connection IP when no trusted proxy is present. |
| **Effort** | 2-3 hours |

---

### BUG-032: No Chat Message Sanitization

| Field | Value |
|-------|-------|
| **ID** | BUG-032 |
| **Severity** | MEDIUM |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `routes.rs` chat message handlers |
| **Description** | Chat routes accept user content for real-time messaging. If this content is rendered unsanitized in the admin UI or any other consumer, stored XSS is possible. |
| **Proposed Fix** | Sanitize chat message content on storage and/or rendering. Use HTML entity encoding for all user-generated content. |
| **Effort** | 1-2 hours |

---

### BUG-033: Docker Container Runs as Root

| Field | Value |
|-------|-------|
| **ID** | BUG-033 |
| **Severity** | MEDIUM |
| **Component** | Backend / Docker / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `Dockerfile` |
| **Description** | The Dockerfile does not set a `USER` directive. The container process runs as root, which increases the blast radius if the application is compromised. |
| **Proposed Fix** | Add `RUN useradd -r rustpress && USER rustpress` in the Dockerfile. Ensure file permissions are correct for the non-root user. |
| **Effort** | 1 hour |

---

### BUG-034: CI Uses PostgreSQL 15 Instead of 16

| Field | Value |
|-------|-------|
| **ID** | BUG-034 |
| **Severity** | MEDIUM |
| **Component** | Backend / CI/CD |
| **Found By** | DevOps Engineer (CI/CD Pipeline Audit) |
| **File/Location** | `.github/workflows/ci.yml` (postgres service) |
| **Description** | CI uses `postgres:15` image but the strategy specifies PostgreSQL 16. Version mismatch could mask compatibility issues. |
| **Proposed Fix** | Update CI service to `postgres:16-alpine`. |
| **Effort** | 15 minutes |

---

### BUG-035: Missing Composite Indexes for Performance

| Field | Value |
|-------|-------|
| **ID** | BUG-035 |
| **Severity** | MEDIUM |
| **Component** | Backend / Database / Performance |
| **Found By** | Backend Engineer (DB Schema Audit) |
| **File/Location** | Various migration files |
| **Description** | Several important composite indexes are missing: `posts(post_type, status, deleted_at)` for dashboard queries, full-text search index on `posts(title, content)` using `tsvector`, `comments(post_id, status)` for comment counts, `users(role)` for role-based filtering, `users(deleted_at)` for soft-delete queries. |
| **Proposed Fix** | Add indexes in a new migration. The full-text search index is especially important since the search handler calls `to_tsvector()` at query time without a stored index. |
| **Effort** | 1-2 hours |

---

### BUG-036: No Token Revocation Check on Request

| Field | Value |
|-------|-------|
| **ID** | BUG-036 |
| **Severity** | MEDIUM |
| **Component** | Backend / Auth / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-auth/src/middleware.rs` (AuthUser extractor) |
| **Description** | JWT validation only checks signature and expiry. There is no check against a revocation list. If a token is compromised, it remains valid until its 15-minute expiry. Combined with the in-memory session store (BUG-014), logout does not truly invalidate tokens. |
| **Proposed Fix** | Implement a token blacklist (in Redis for performance) that is checked on every authenticated request. Add tokens to the blacklist on logout. |
| **Effort** | 3-4 hours |

---

### BUG-037: Frontend Has Zero Test Dependencies

| Field | Value |
|-------|-------|
| **ID** | BUG-037 |
| **Severity** | MEDIUM |
| **Component** | Frontend / Testing |
| **Found By** | Frontend Engineer (Test Plan) |
| **File/Location** | `package.json` devDependencies |
| **Description** | The project has zero test-related dependencies. Missing: Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, MSW, Playwright, @axe-core/playwright, @vitest/coverage-v8. The 5 existing test files for visual-queue-manager cannot run. |
| **Proposed Fix** | Add all required test dependencies, create config files (vitest.config.ts, playwright.config.ts), add test scripts to package.json. |
| **Effort** | 2-4 hours |

---

### BUG-038: App.tsx is 917 Lines with 13 Inline Page Components

| Field | Value |
|-------|-------|
| **ID** | BUG-038 |
| **Severity** | MEDIUM |
| **Component** | Frontend / Architecture |
| **Found By** | Frontend Engineer (Component Arch Audit) |
| **File/Location** | `src/App.tsx` |
| **Description** | App.tsx contains 13 inline functional components (PagesList, MediaLibrary, CommentsPage, etc.) that should be separate files. This makes the file difficult to maintain, test, and review. Each inline component re-implements the same `motion.div` + `PageHeader` pattern. |
| **Proposed Fix** | Extract each inline component to its own file under the appropriate `src/pages/` directory. Create a shared page template component. |
| **Effort** | 4-6 hours |

---

### BUG-039: HSTS Sent Unconditionally (Including HTTP)

| Field | Value |
|-------|-------|
| **ID** | BUG-039 |
| **Severity** | MEDIUM |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` |
| **Description** | `Strict-Transport-Security` header is sent on all responses including HTTP (non-TLS). This is technically incorrect and could cause issues if users access the site directly over HTTP without a reverse proxy. |
| **Proposed Fix** | Only send HSTS when the request came via TLS (detect via `X-Forwarded-Proto: https` header). |
| **Effort** | 30 minutes |

---

### BUG-040: No Plugin Integrity Verification

| Field | Value |
|-------|-------|
| **ID** | BUG-040 |
| **Severity** | MEDIUM |
| **Component** | Backend / Plugins / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | Plugin upload/install handlers |
| **Description** | Uploaded plugin ZIP files are not verified for integrity. There is no signature verification, no checksum validation, and no sandboxing of plugin code. A malicious plugin could execute arbitrary code on the server. |
| **Proposed Fix** | Add plugin signature verification for trusted sources. Add checksum validation. Consider sandboxing via WASM for untrusted plugins. |
| **Effort** | 8-12 hours (full solution), 2 hours (basic checksum) |

---

## LOW Severity Issues

### BUG-041: 42 Missing aria-label Attributes

| Field | Value |
|-------|-------|
| **ID** | BUG-041 |
| **Severity** | LOW |
| **Component** | Frontend / Accessibility |
| **Found By** | Frontend Engineer (TypeScript Audit) |
| **File/Location** | Various components using IconButton |
| **Description** | 42 TypeScript errors for missing `aria-label` on `IconButton` components. This is both a type error (TS2741) and an accessibility violation (WCAG 2.1 AA). Screen readers cannot identify the purpose of these buttons. |
| **Proposed Fix** | Add descriptive `aria-label` props to all IconButton usages. |
| **Effort** | 1-2 hours |

---

### BUG-042: Config File Contains JWT Secret in Plaintext

| Field | Value |
|-------|-------|
| **ID** | BUG-042 |
| **Severity** | LOW |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `config/rustpress.toml` |
| **Description** | JWT secret is stored in plaintext in the configuration file. While this file is on the server and not in git, it is readable by all users on the system. |
| **Proposed Fix** | Prefer environment variables for secrets. Document that `config/rustpress.toml` should have restricted file permissions (600). |
| **Effort** | 30 minutes |

---

### BUG-043: Git/File API Routes Expose Internal Data

| Field | Value |
|-------|-------|
| **ID** | BUG-043 |
| **Severity** | LOW |
| **Component** | Backend / Security |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `routes.rs` -- `/api/v1/git/*` and `/api/v1/files/*` routes |
| **Description** | `/api/v1/git/status` and `/api/v1/files/list` routes expose internal repository and filesystem information. While authenticated, they should be admin-only and optionally disableable in production. |
| **Proposed Fix** | Add admin role check. Add configuration flag to disable these routes in production. |
| **Effort** | 1 hour |

---

### BUG-044: 19 CRM/Enterprise Pages Not Routed

| Field | Value |
|-------|-------|
| **ID** | BUG-044 |
| **Severity** | LOW |
| **Component** | Frontend / Architecture |
| **Found By** | Frontend Engineer (Component Arch Audit) |
| **File/Location** | `src/pages/crm/`, `src/pages/enterprise/` |
| **Description** | 19 page components exist as files but have no routes in App.tsx. 4 CRM pages (Dashboard, Customers, Leads, Pipeline) and 15 enterprise demo pages are unreachable. |
| **Proposed Fix** | Either add routes for CRM pages (if they are intended features) or move demo pages to a separate `examples/` directory. |
| **Effort** | 2-3 hours |

---

### BUG-045: Cross-Origin Policies May Break CDN

| Field | Value |
|-------|-------|
| **ID** | BUG-045 |
| **Severity** | LOW |
| **Component** | Backend / Security / CDN |
| **Found By** | Infrastructure Engineer (Security Audit) |
| **File/Location** | `crates/rustpress-server/src/middleware.rs` |
| **Description** | `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Resource-Policy: same-origin` will block loading resources from external CDN origins (Cloudflare, BunnyCDN, etc.). |
| **Proposed Fix** | Make Cross-Origin policies configurable. Relax to `cross-origin` for resources served via CDN. |
| **Effort** | 1 hour |

---

## Bug Summary

| Severity | Count | Must Fix For |
|----------|-------|-------------|
| CRITICAL | 7 | Any testing or development to proceed |
| HIGH | 18 | Production deployment (v1.0) |
| MEDIUM | 15 | v1.0 release |
| LOW | 5 | When convenient |
| **TOTAL** | **45** | |

### By Component

| Component | CRITICAL | HIGH | MEDIUM | LOW | Total |
|-----------|----------|------|--------|-----|-------|
| Backend / Database | 2 | 1 | 3 | 0 | 6 |
| Backend / Security | 2 | 6 | 5 | 2 | 15 |
| Backend / Auth | 1 | 2 | 1 | 0 | 4 |
| Backend / API | 0 | 2 | 0 | 0 | 2 |
| Backend / CI/CD | 0 | 3 | 1 | 0 | 4 |
| Backend / Docker | 0 | 2 | 1 | 0 | 3 |
| Backend / Build | 1 | 0 | 0 | 0 | 1 |
| Frontend / API | 1 | 0 | 0 | 0 | 1 |
| Frontend / Auth | 0 | 1 | 0 | 0 | 1 |
| Frontend / Pages | 0 | 2 | 0 | 1 | 3 |
| Frontend / TypeScript | 0 | 0 | 1 | 0 | 1 |
| Frontend / Testing | 0 | 0 | 1 | 0 | 1 |
| Frontend / Architecture | 0 | 0 | 1 | 0 | 1 |
| Frontend / Accessibility | 0 | 0 | 0 | 1 | 1 |
| Frontend / CI/CD | 0 | 1 | 0 | 0 | 1 |

---

*End of Bug Report*
