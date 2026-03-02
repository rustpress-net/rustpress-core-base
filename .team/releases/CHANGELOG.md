# Changelog -- RustPress CMS v1.0.0

> **Author**: Release Manager (RM)
> **Date**: 2026-03-02
> **Version**: DRAFT (pre-release -- subject to change as bugs are resolved)
> **Status**: Wave 4 Release Artifact

---

## [1.0.0] -- UNRELEASED

### Overview

RustPress v1.0.0 is the first production release of a WordPress-compatible CMS built entirely in Rust with a modern React/TypeScript admin dashboard. This release represents the evolution from the v0.4.0 MVP to a feature-complete, production-grade content management system.

**Highlights:**
- Full CMS functionality: posts, pages, media, comments, taxonomies, menus, widgets, settings
- Plugin architecture compatible with WordPress-style hooks (actions + filters)
- Theme system with server-rendered public pages and Full Site Editing
- Modern React 18 admin dashboard with Zustand state management
- Docker-based deployment with one-command startup
- Comprehensive security: JWT auth, RBAC, CSRF, rate limiting, brute force protection
- Redis caching with moka in-memory fallback
- Prometheus-compatible monitoring and health checks

---

### Added -- New Features (P0 -- Launch Requirements)

#### Content Management
- **Post Management**: Full lifecycle -- create, edit, publish, schedule, unpublish, trash, delete, restore. Bulk operations supported. Revision history with diff comparison. Autosave with conflict detection.
- **Page Management**: Hierarchical pages with parent/child relationships. Per-page template selection. Slug auto-generation with uniqueness enforcement.
- **Media Library**: Upload, organize, and serve media files. Automatic image optimization (WebP, AVIF variants). Responsive image generation. Folder organization. Gallery support. Drag-and-drop upload.
- **Comments System**: Threaded comments with configurable depth. Moderation workflow (approve, spam, trash). Comment likes. Batch moderation actions. Gravatar integration.
- **Taxonomy System**: Hierarchical categories and flat tags. Post assignment. Category/tag CRUD via API. Archive pages per taxonomy.
- **Search**: Full-text search across posts, pages, and media. Filtering and pagination support.

#### Navigation & Layout
- **Menu Management**: Create menus with nested items (pages, posts, categories, custom links). Assign menus to theme locations. Drag-and-drop reordering.
- **Widget System**: Sidebar widgets with configurable areas. Widget CRUD with drag-and-drop ordering per sidebar.
- **Settings Management**: Site configuration organized by group (General, Reading, Writing, Discussion, Permalinks, Media, Privacy). All settings persisted and applied at runtime.

#### Authentication & Security
- **JWT Authentication**: Access tokens (15min) and refresh tokens (7 days). Token refresh flow. Secure token storage.
- **User Management**: Full CRUD with role-based access control. Built-in roles: Administrator, Editor, Author, Contributor, Subscriber. Custom role support.
- **OAuth2 Social Login** (P1): Google, GitHub, Facebook login flows.
- **WebAuthn / FIDO2** (P1): Passwordless authentication with hardware security keys.
- **TOTP 2FA** (P1): Time-based one-time password with QR code setup.
- **API Key Authentication** (P1): Machine-to-machine API access with scoped permissions.
- **RBAC Enforcement**: Role-based middleware on all administrative route groups.
- **CSRF Protection**: Token-based validation on all state-changing requests.
- **Rate Limiting**: Per-IP and per-user configurable rate limits.
- **Brute Force Protection**: Progressive delay with account lockout after configurable threshold.
- **Bot Detection**: User-Agent analysis with behavioral scoring.
- **Security Audit Logging**: All security-relevant events logged for forensic analysis.
- **CSP Headers**: Content Security Policy, X-Frame-Options, X-Content-Type-Options, HSTS.

#### Theme & Plugin Ecosystem
- **Theme System**: Theme discovery from filesystem. Activation switches public frontend. Theme customizer settings persist. Server-side template rendering with Tera/Handlebars. Full Site Editing support. 2+ default themes included.
- **Plugin System**: WordPress-compatible plugin architecture. Plugin discovery, activation, deactivation, uninstall lifecycle. Action hooks and filter hooks. Plugin settings schema with admin UI rendering. 6 built-in plugins:
  - **Cloudflare CDN**: Cache purge, asset serving, DNS management
  - **Visual Queue Manager**: Background job monitoring dashboard
  - **RustAnalytics**: Built-in privacy-first analytics
  - **RustBackup**: Automated backup and restore
  - **RustCommerce Config**: E-commerce configuration framework
  - **DB Manager**: Database management and optimization

#### Admin Dashboard
- **Dashboard**: Real-time metrics -- post count, comment count, user count, recent activity feed, traffic overview. All data from backend API.
- **Admin UI**: 150+ React components, 40+ admin pages. Responsive design with Tailwind CSS. Framer Motion animations. Dark mode support. Keyboard navigation.
- **Monaco Code Editor**: Built-in code editor for theme/plugin editing with syntax highlighting and IntelliSense.

#### Infrastructure & DevOps
- **Docker Deployment**: One-command deployment via `docker-compose up`. Multi-stage Dockerfile. Health checks. Data persistence across restarts.
- **Cache System**: Redis 7 primary cache with moka 0.12 in-memory fallback. Automatic cache invalidation on content updates.
- **Email System**: SMTP configuration. Transactional emails: password reset, notification templates, new comment alerts.
- **CLI Tools**: 14 command groups for server administration, user management, content operations, cache management, migration, and diagnostics.
- **Health Endpoints**: `/health/live` (liveness), `/health/ready` (readiness with DB/Redis checks). Kubernetes-compatible.
- **Prometheus Metrics**: Request counts, latencies, error rates, DB pool statistics at `/metrics`.
- **Structured Logging**: JSON-formatted structured logs via `tracing` + `tracing-subscriber`.
- **Public Frontend**: Server-rendered pages with active theme. SEO meta tags. RSS/Atom feeds. XML sitemap.

#### E-Commerce (P1)
- **RustCommerce Plugin**: Products CRUD with variants and inventory. Orders with status workflow. Customer management. Coupon/discount system. Checkout flow with payment gateway abstraction. Shipping methods. Tax calculation.

#### Page Builder (P1)
- **RustBuilder Plugin**: Visual drag-and-drop page builder. Block-based editing. Preview mode. Responsive editing.

#### Cloud & CDN (P1)
- **Cloud Storage Backends**: S3, Azure Blob Storage, Google Cloud Storage support for media files.
- **CDN Integration**: Cloudflare and BunnyCDN asset delivery with cache purge on content update.

#### Background Processing (P1)
- **Job Queue**: Reliable background job processing with retry logic, dead letter queue, and monitoring UI.

#### Real-time Features (P1)
- **WebSocket Collaboration**: Multi-user editing with cursor sharing, presence indicators, and conflict resolution.

#### Import/Export (P1)
- **WordPress Import**: WXR (WordPress eXtended RSS) import for posts, pages, media, users, categories, tags.
- **Data Export**: Full content export for backup and migration.

#### Backup & Restore (P1)
- **Automated Backups**: Scheduled backups with configurable retention. Manual backup trigger. Point-in-time restore. Backup verification.

---

### Changed -- Breaking Changes from v0.4.0

1. **Authentication System Overhaul**: JWT token format changed. All v0.4.0 tokens are invalid. Users must re-authenticate after upgrade.
2. **API URL Structure**: All API endpoints now consistently use `/api/v1/` prefix. v0.4.0 mixed prefixes are standardized.
3. **Database Schema**: 10 migration files with significant schema changes. Direct database upgrades from v0.4.0 require running all migrations in sequence. See Migration Guide below.
4. **Configuration Format**: Environment variables are now the primary configuration method. `rustpress.toml` is supported but secrets MUST use environment variables.
5. **Password Hashing**: Migrated from potential bcrypt usage to Argon2id exclusively. Existing bcrypt-hashed passwords will not authenticate. Users must reset passwords after migration.
6. **Plugin API**: Plugin manifest format changed from `plugin.json` to `plugin.toml`. Hook registration API updated with new trait signatures.
7. **Theme API**: Theme manifest format changed from `theme.json` to `theme.toml`. Template engine standardized on Tera with Handlebars compatibility layer.
8. **Docker Image**: Base image changed. New entrypoint script. Environment variable names may differ.
9. **Redis Requirements**: Redis 7+ now required (previously Redis 6 was acceptable). New data structures used for sessions and rate limiting.
10. **Rust MSRV**: Minimum Supported Rust Version raised to 1.75 (from 1.70 in v0.4.0).

---

### Migration Guide -- v0.4.0 to v1.0.0

#### Prerequisites

- PostgreSQL 16 (upgrade from 15 if needed)
- Redis 7 (upgrade from 6 if needed)
- Rust 1.75+ (for building from source)
- Docker 24+ (for container deployment)

#### Step 1: Backup

```bash
# Backup existing database
pg_dump -U rustpress -d rustpress -F c -f rustpress_v040_backup.dump

# Backup media uploads directory
tar -czf media_v040_backup.tar.gz /path/to/uploads/

# Backup configuration
cp config/rustpress.toml config/rustpress.toml.v040.bak
```

#### Step 2: Update Configuration

```bash
# v1.0.0 requires these environment variables (previously optional or in config file)
export JWT_SECRET="$(openssl rand -base64 64)"      # REQUIRED -- no default
export DATABASE_URL="postgres://user:pass@host:5432/rustpress"
export REDIS_URL="redis://host:6379"
export CORS_ORIGINS="https://your-domain.com"        # No longer accepts '*'
export ADMIN_EMAIL="admin@your-domain.com"
```

#### Step 3: Run Database Migrations

```bash
# Using the CLI tool
rustpress-migrate up

# Or via Docker
docker exec -it rustpress rustpress-migrate up
```

**Important**: Migrations are forward-only in v1.0.0. Test on a copy of your database first.

#### Step 4: Reset User Passwords

Due to the bcrypt-to-Argon2id migration, all existing user passwords must be reset:

```bash
# Reset admin password via CLI
rustpress-cli user reset-password --email admin@example.com

# Or trigger password reset emails for all users
rustpress-cli user reset-all-passwords
```

#### Step 5: Update Docker Compose

```yaml
# v1.0.0 docker-compose.yml changes
services:
  rustpress:
    image: ghcr.io/rustpress/rustpress:v1.0.0  # Updated tag
    environment:
      - JWT_SECRET=${JWT_SECRET}                 # Now required
      - CORS_ORIGINS=${CORS_ORIGINS}             # Now required
    user: "1000:1000"                            # Now runs as non-root
```

#### Step 6: Verify

```bash
# Start the application
docker-compose up -d

# Check health
curl http://localhost:8080/health/ready

# Verify admin login
open http://localhost:8080/admin
```

---

### Known Issues

The following issues are known in v1.0.0 and tracked for resolution in v1.0.1 or v1.1.0:

#### Identified by QA (Bug Report -- 2026-03-02)

| ID | Severity | Description | Status | Target Fix |
|----|----------|-------------|--------|------------|
| BUG-012 | HIGH | Prometheus `/metrics` endpoint returns static placeholder | Open | v1.0.1 |
| BUG-013 | HIGH | Search reindex endpoint is stubbed -- returns "queued" but does not process | Open | v1.0.1 |
| BUG-016 | HIGH | CSP allows `unsafe-inline` and `unsafe-eval` (required by Monaco Editor) | Open | v1.1.0 |
| BUG-022 | HIGH | Bot detection is log-only by default (does not block) | Open | v1.0.1 |
| BUG-023 | HIGH | Security audit log stored in memory only (lost on restart) | Open | v1.0.1 |
| BUG-024 | HIGH | Rate limiter uses per-instance cache (not distributed) | Open | v1.1.0 |
| BUG-026 | MEDIUM | TypeScript strict mode disabled -- some type errors may exist | Open | v1.1.0 |
| BUG-028 | MEDIUM | Migration numbering has gap from 00002 to 00023 | Accepted | Won't fix |
| BUG-031 | MEDIUM | IP extraction trusts X-Forwarded-For without trusted proxy config | Open | v1.0.1 |
| BUG-039 | MEDIUM | HSTS header sent on HTTP connections (should only send on HTTPS) | Open | v1.0.1 |
| BUG-040 | MEDIUM | No plugin integrity/signature verification on upload | Open | v1.1.0 |
| BUG-041 | LOW | 42 missing aria-label attributes on icon buttons | Open | v1.0.1 |
| BUG-044 | LOW | 19 CRM/enterprise pages exist but have no routes | Accepted | v1.1.0 |
| BUG-045 | LOW | Cross-origin policies may conflict with CDN asset delivery | Open | v1.0.1 |

**Note**: All CRITICAL (BUG-001 through BUG-007) and blocking HIGH bugs must be resolved before this release. The above are non-blocking known issues that will ship with documented workarounds.

#### Workarounds

- **BUG-012**: Use application logs for monitoring until Prometheus endpoint is implemented. Structured JSON logs can be parsed by Grafana Loki or similar.
- **BUG-022**: Set `BLOCK_BOTS=true` environment variable to enable bot blocking.
- **BUG-024**: For single-instance deployments, this is not an issue. Multi-instance deployments should use a reverse proxy rate limiter (e.g., Nginx `limit_req`).
- **BUG-031**: Configure trusted proxies in your reverse proxy and ensure `X-Forwarded-For` is set only by trusted sources.

---

### Fixed -- Bugs Fixed from v0.4.0

- Fixed: Compiler warnings suppressed via `RUSTFLAGS` -- all warnings resolved at source
- Fixed: JWT secret accepted insecure defaults -- server now refuses to start with default secret
- Fixed: CORS allowed any origin -- now requires explicit origin configuration
- Fixed: RBAC not enforced on admin routes -- all 24 route groups now have role-based middleware
- Fixed: CSRF protection not applied -- CSRF middleware wired into all state-changing routes
- Fixed: Admin password logged to Docker stdout -- credential logging removed
- Fixed: Docker container ran as root -- now runs as dedicated `rustpress` user
- Fixed: Entrypoint used bcrypt instead of Argon2 -- password hashing algorithm aligned
- Fixed: Refresh tokens stored in memory only -- now persisted to PostgreSQL/Redis
- Fixed: Frontend API URL prefix mismatch (`/api` vs `/api/v1`) -- unified to `/api/v1`
- Fixed: Login page was a placeholder `<div>` -- full authentication UI implemented
- Fixed: 13 admin pages used hardcoded/mock data -- all connected to real backend APIs
- Fixed: Dashboard displayed random `Math.random()` data -- shows real statistics
- Fixed: Missing `deleted_at` columns on posts and menus tables -- soft delete working
- Fixed: Missing `backups`, `backup_schedules`, `widget_areas` database tables -- created via migration
- Fixed: Migration 00030 DROP CASCADE destroyed media folder data -- replaced with ALTER TABLE
- Fixed: CI clippy suppressed all warnings -- now uses `-D warnings` with zero suppression

---

### Dependencies

#### Backend (Rust)

| Dependency | Version | Purpose |
|------------|---------|---------|
| axum | 0.7 | HTTP framework |
| tokio | 1.35 | Async runtime |
| sqlx | 0.7 | PostgreSQL driver (compile-time verified) |
| serde / serde_json | 1.0 | Serialization |
| jsonwebtoken | 9.2 | JWT authentication |
| argon2 | 0.5 | Password hashing |
| tracing / tracing-subscriber | 0.1 / 0.3 | Structured logging |
| prometheus-client | 0.22 | Metrics |
| moka | 0.12 | In-memory cache |
| reqwest | 0.11 | HTTP client |
| object_store | 0.9 | Cloud storage abstraction |
| validator | 0.16 | Input validation |
| toml | 0.8 | Configuration parsing |

#### Frontend (React/TypeScript)

| Dependency | Version | Purpose |
|------------|---------|---------|
| react | 18.3 | UI framework |
| react-router | 6.28 | Client-side routing |
| typescript | 5.7 | Type safety |
| vite | 6.0 | Build tool |
| tailwindcss | 3.4 | Styling |
| zustand | 5.0 | State management |
| axios | 1.7 | HTTP client |
| framer-motion | 11.15 | Animations |
| recharts | 3.6 | Charts |
| monaco-editor | 4.7 | Code editor |
| lucide-react | 0.468 | Icons |

#### Infrastructure

| Dependency | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Primary database |
| Redis | 7 | Cache + sessions |
| Docker | 24+ | Container deployment |
| Nginx/Caddy | Latest | Reverse proxy (recommended) |

---

### Contributors

| Role | Contributor | Contributions |
|------|------------|--------------|
| Team Leader (TL) | -- | Strategy, cost estimation, architecture oversight |
| Project Manager (PM) | -- | Planning, kanban, timeline, milestone tracking |
| Backend Engineer (BE) | -- | All 19 Rust crates, API endpoints, database schema, auth system |
| Frontend Engineer (FE) | -- | React admin UI, 150+ components, Zustand stores, API integration |
| DevOps Engineer (DEVOPS) | -- | CI/CD pipelines, Docker configuration, monitoring setup |
| Infrastructure Engineer (INFRA) | -- | Architecture design, security audit, deployment planning |
| QA Engineer (QA) | -- | Test strategy, bug reports, QA sign-off assessment |
| Release Manager (RM) | -- | Release checklist, changelog, rollback plan, deployment sign-off |
| Marketing (MKT) | -- | Positioning, messaging, go-to-market strategy |
| Legal (LEGAL) | -- | License review, compliance checklist, privacy policy, terms of service |

---

### Repositories

- **Backend**: `rustpress-core-base` (branch: `ai-develop`)
- **Frontend**: `rustpress-core-admin-ui` (branch: `ai-develop`)

### License

Dual-licensed under MIT OR Apache-2.0.

---

*This is a DRAFT changelog. It will be finalized when all CRITICAL and HIGH bugs are resolved and QA issues a PASS verdict.*

*Release Manager (RM) -- 2026-03-02*
