# API Contract Documentation - RustPress CMS v0.4.0

> **Author**: Backend Engineer (BE)
> **Date**: 2026-03-02
> **Branch**: `ai-develop`
> **Source**: `crates/rustpress-server/src/routes.rs` (8036 lines)
> **Status**: Wave 2 Research

---

## 1. Router Architecture

The main router is constructed in `create_router()` (line 21) and organized as:

```
/ (root)
  /health/*              -> Health check routes
  /api/health            -> Frontend-compatible health alias
  /api/v1/*              -> All REST API endpoints
  /api/v1/cloudflare     -> Cloudflare plugin (separate router)
  /api/v1/rustbuilder    -> RustBuilder plugin (separate router)
  /api/v1/pageforge      -> PageForge plugin (separate router)
  /pagebuilder           -> PageForge visual editor UI (embedded HTML/JS)
  /admin/*               -> Admin UI SPA (static file serving)
  /metrics               -> Prometheus metrics
  /*                     -> Public-facing website routes (theme rendering)
```

---

## 2. Complete API Endpoint Inventory

### 2.1 Health & System Endpoints

| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/health` | No | General health check | Implemented |
| GET | `/health/live` | No | Kubernetes liveness probe | Implemented |
| GET | `/health/ready` | No | Kubernetes readiness probe (checks DB) | Implemented |
| GET | `/api/health` | No | Frontend compatibility alias for health | Implemented |
| GET | `/metrics` | No | Prometheus metrics endpoint | **STUBBED** (returns static string) |

**Note on `/metrics`**: Line 1151-1153 shows this is a stub returning `"# Metrics endpoint - implement with prometheus-client"`. The `prometheus-client` crate is in dependencies but not wired up.

### 2.2 Authentication Routes (`/api/v1/auth`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| POST | `/auth/login` | No | `{ email, password }` | `{ access_token, refresh_token, token_type, expires_in }` | Implemented |
| POST | `/auth/logout` | Yes | - | `{ success }` | Implemented |
| POST | `/auth/refresh` | No | `{ refresh_token }` | `{ access_token, refresh_token, ... }` | Implemented |
| POST | `/auth/register` | No | `{ email, username, password, display_name }` | `{ id, email, username }` | Implemented |
| POST | `/auth/forgot-password` | No | `{ email }` | `{ success, message }` | Implemented |
| POST | `/auth/reset-password` | No | `{ token, new_password }` | `{ success }` | Implemented |
| GET | `/auth/me` | Yes | - | `{ user object }` | Implemented |

**Missing auth endpoints (from rustpress-auth crate capabilities)**:
- No `/auth/oauth2/*` routes for social login (Google, GitHub)
- No `/auth/webauthn/*` routes for passkey registration/authentication
- No `/auth/totp/*` routes for 2FA enable/disable/verify
- No `/auth/api-keys/*` routes for API key management
- No `/auth/sessions` route for listing active sessions
- No `/auth/change-password` route (separate from reset)
- No `/auth/impersonate` routes

### 2.3 User Management Routes (`/api/v1/users`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/users` | Yes | Query: `page, per_page` | `{ users[], total, page, per_page }` | Implemented |
| POST | `/users` | Yes | `{ email, username, password, display_name, role }` | `{ id, email, username }` | Implemented |
| GET | `/users/me` | Yes | - | `{ user object }` | Implemented |
| GET | `/users/:id` | Yes | - | `{ user object }` | Implemented |
| PUT | `/users/:id` | Yes | `{ fields to update }` | `{ updated user }` | Implemented |
| DELETE | `/users/:id` | Yes | - | `204 No Content` | Implemented |
| PUT | `/users/:id/roles` | Yes | `{ roles[] }` | `{ success }` | Implemented |

### 2.4 Post Management Routes (`/api/v1/posts`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/posts` | Yes | Query: `page, per_page, status, author_id` | `{ posts[], total, page, per_page }` | Implemented |
| POST | `/posts` | Yes | `{ title, content, excerpt, status, categories[], tags[] }` | `{ id, title, slug }` | Implemented |
| POST | `/posts/bulk-delete` | Yes | `{ ids[] }` | `{ deleted_count }` | Implemented |
| GET | `/posts/:id` | Yes | - | `{ post object }` | Implemented |
| PUT | `/posts/:id` | Yes | `{ fields to update }` | `{ updated post }` | Implemented |
| DELETE | `/posts/:id` | Yes | - | `204 No Content` | Implemented |
| POST | `/posts/:id/publish` | Yes | - | `{ success }` | Implemented |
| POST | `/posts/:id/unpublish` | Yes | - | `{ success }` | Implemented |
| POST | `/posts/:id/duplicate` | Yes | - | `{ new_post }` | Implemented |

**Missing post endpoints**:
- No `/posts/:id/revisions` for version history
- No `/posts/:id/schedule` for scheduled publishing
- No `/posts/:id/autosave` for auto-save drafts (crate has `autosave.rs` module)

### 2.5 Page Management Routes (`/api/v1/pages`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/pages` | Yes | Query: `page, per_page` | `{ pages[], total }` | Implemented |
| POST | `/pages` | Yes | `{ title, content, status, parent_id, template }` | `{ id, title, slug }` | Implemented |
| GET | `/pages/:id` | Yes | - | `{ page object }` | Implemented |
| PUT | `/pages/:id` | Yes | `{ fields to update }` | `{ updated page }` | Implemented |
| DELETE | `/pages/:id` | Yes | - | `204 No Content` | Implemented |

### 2.6 Media Routes (`/api/v1/media`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/media` | Yes | Query: `page, per_page, mime_type, folder_id` | `{ media[], total }` | Implemented |
| POST | `/media` | Yes | Multipart: file upload | `{ id, filename, url, ... }` | Implemented |
| GET | `/media/folders` | Yes | - | `{ folders[] }` | Implemented |
| POST | `/media/folders` | Yes | `{ name, parent_id }` | `{ id, name, slug }` | Implemented |
| GET | `/media/:id` | Yes | - | `{ media object }` | Implemented |
| PUT | `/media/:id` | Yes | `{ alt_text, caption, folder_id }` | `{ updated media }` | Implemented |
| DELETE | `/media/:id` | Yes | - | `204 No Content` | Implemented |

**Missing media endpoints**:
- No `/media/:id/optimize` for triggering image optimization
- No `/media/:id/variants` for listing responsive variants
- No `/media/bulk-delete` for batch operations
- No `/media/folders/:id` for folder CRUD (only list/create at `/folders`)

### 2.7 Comment Routes (`/api/v1/comments`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/comments` | Yes | Query: `page, per_page, status, post_id` | `{ comments[], total }` | Implemented |
| POST | `/comments` | Mixed | `{ post_id, content, parent_id, author_name, author_email }` | `{ id, content }` | Implemented |
| POST | `/comments/batch` | Yes | `{ ids[], action }` | `{ affected_count }` | Implemented |
| GET | `/comments/counts` | Yes | - | `{ pending, approved, spam, trash }` | Implemented |
| GET | `/comments/:id` | Yes | - | `{ comment object }` | Implemented |
| PUT | `/comments/:id` | Yes | `{ content }` | `{ updated comment }` | Implemented |
| DELETE | `/comments/:id` | Yes | - | `204 No Content` | Implemented |
| POST | `/comments/:id/approve` | Yes | - | `{ success }` | Implemented |
| POST | `/comments/:id/spam` | Yes | - | `{ success }` | Implemented |
| POST | `/comments/:id/trash` | Yes | - | `{ success }` | Implemented |
| POST | `/comments/:id/like` | Mixed | - | `{ likes_count }` | Implemented |

### 2.8 Settings Routes (`/api/v1/settings`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/settings` | Yes | - | `{ settings[] }` | Implemented |
| PUT | `/settings/batch` | Yes | `{ key: value, ... }` | `{ success }` | Implemented |
| GET | `/settings/groups/:group` | Yes | - | `{ settings for group }` | Implemented |
| GET | `/settings/general` | Yes | - | `{ general settings }` | Implemented |
| GET | `/settings/reading` | Yes | - | `{ reading settings }` | Implemented |
| GET | `/settings/writing` | Yes | - | `{ writing settings }` | Implemented |
| GET | `/settings/discussion` | Yes | - | `{ discussion settings }` | Implemented |
| GET | `/settings/permalinks` | Yes | - | `{ permalink settings }` | Implemented |
| GET | `/settings/:key` | Yes | - | `{ key, value }` | Implemented |
| PUT | `/settings/:key` | Yes | `{ value }` | `{ success }` | Implemented |

### 2.9 Storage Configuration Routes (`/api/v1/storage`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/storage` | Yes | - | `{ configurations[] }` | Implemented |
| POST | `/storage/test` | Yes | `{ provider, config }` | `{ success, latency_ms }` | Implemented |
| POST | `/storage/migrations` | Yes | `{ source, target, ... }` | `{ migration_id }` | Implemented |
| GET | `/storage/migrations/:id` | Yes | - | `{ migration status }` | Implemented |
| DELETE | `/storage/migrations/:id` | Yes | - | `{ cancelled }` | Implemented |
| GET | `/storage/:category` | Yes | - | `{ configuration for category }` | Implemented |
| PUT | `/storage/:category` | Yes | `{ provider, config }` | `{ success }` | Implemented |

### 2.10 Plugin Routes (`/api/v1/plugins`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/plugins` | Yes | - | `{ plugins[] }` | Implemented |
| POST | `/plugins` | Yes | Multipart: plugin ZIP | `{ installed plugin }` | Implemented |
| GET | `/plugins/:id` | Yes | - | `{ plugin details }` | Implemented |
| DELETE | `/plugins/:id` | Yes | - | `{ uninstalled }` | Implemented |
| POST | `/plugins/:id/activate` | Yes | - | `{ success }` | Implemented |
| POST | `/plugins/:id/deactivate` | Yes | - | `{ success }` | Implemented |

**Missing plugin endpoints**:
- No `/plugins/:id/settings` for plugin configuration
- No `/plugins/:id/update` for plugin updates
- No `/plugins/marketplace` for browsing available plugins

### 2.11 Theme Routes (`/api/v1/themes`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/themes` | Yes | - | `{ themes[] }` | Implemented |
| POST | `/themes` | Yes | - | Scan for themes | Implemented |
| POST | `/themes/upload` | Yes | Multipart: theme ZIP | `{ installed theme }` | Implemented |
| POST | `/themes/validate` | Yes | Multipart: theme ZIP | `{ validation results }` | Implemented |
| GET | `/themes/available` | Yes | - | `{ available default themes }` | Implemented |
| GET | `/themes/active` | Yes | - | `{ active theme }` | Implemented |
| GET | `/themes/:theme_id` | Yes | - | `{ theme details }` | Implemented |
| DELETE | `/themes/:theme_id` | Yes | - | `{ deleted }` | Implemented |
| POST | `/themes/:theme_id/activate` | Yes | - | `{ success }` | Implemented |
| POST | `/themes/:theme_id/update` | Yes | Multipart: ZIP | `{ updated }` | Implemented |
| GET | `/themes/:theme_id/export` | Yes | - | ZIP file download | Implemented |
| GET | `/themes/:theme_id/settings` | Yes | - | `{ theme settings }` | Implemented |
| PUT | `/themes/:theme_id/settings` | Yes | `{ settings }` | `{ success }` | Implemented |
| GET | `/themes/:theme_id/menus` | Yes | - | `{ menu assignments }` | Implemented |
| PUT | `/themes/:theme_id/menus` | Yes | `{ assignments }` | `{ success }` | Implemented |
| GET | `/themes/:theme_id/widgets` | Yes | - | `{ widget assignments }` | Implemented |
| PUT | `/themes/:theme_id/widgets` | Yes | `{ assignments }` | `{ success }` | Implemented |
| POST | `/themes/:theme_id/preview` | Yes | - | `{ preview URL }` | Implemented |

### 2.12 Search Routes (`/api/v1/search`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/search` | No | Query: `q, type, page, per_page` | `{ results[], total, page }` | Implemented (PostgreSQL FTS) |
| GET | `/search/suggest` | No | Query: `q, per_page` | `{ suggestions[] }` | Implemented |
| POST | `/search/reindex` | Yes | - | `{ status: "queued" }` | **STUBBED** (no actual reindex) |
| GET | `/search/stats` | Yes | - | `{ indexed_posts, indexed_pages }` | Implemented |

### 2.13 Taxonomy Routes (`/api/v1/taxonomies` and `/api/v1/categories`, `/api/v1/tags`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/taxonomies/categories` | No | - | `{ categories[] }` | Implemented |
| POST | `/taxonomies/categories` | Yes | `{ name, slug?, description?, parent_id? }` | `{ id, name, slug }` | Implemented |
| GET | `/taxonomies/categories/:id` | No | - | `{ category }` | Implemented |
| PUT | `/taxonomies/categories/:id` | Yes | `{ name?, slug?, description? }` | `{ updated }` | Implemented |
| DELETE | `/taxonomies/categories/:id` | Yes | - | `204 No Content` | Implemented |
| GET | `/taxonomies/tags` | No | - | `{ tags[] }` | Implemented |
| POST | `/taxonomies/tags` | Yes | `{ name, slug?, description? }` | `{ id, name, slug }` | Implemented |
| GET | `/taxonomies/tags/:id` | No | - | `{ tag }` | Implemented |
| PUT | `/taxonomies/tags/:id` | Yes | `{ name?, slug?, description? }` | `{ updated }` | Implemented |
| DELETE | `/taxonomies/tags/:id` | Yes | - | `204 No Content` | Implemented |

Note: `/api/v1/categories` and `/api/v1/tags` are aliases that map to the same handlers.

### 2.14 Menu Routes (`/api/v1/menus`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/menus` | No | - | `{ menus[] }` | Implemented |
| POST | `/menus` | Yes | `{ name, slug?, location? }` | `{ id, name, slug }` | Implemented |
| GET | `/menus/locations` | No | - | `{ locations[] }` | Implemented (hardcoded) |
| GET | `/menus/:id` | No | - | `{ menu }` | Implemented |
| PUT | `/menus/:id` | Yes | `{ name?, location? }` | `{ updated }` | Implemented |
| DELETE | `/menus/:id` | Yes | - | `204 No Content` | Implemented |
| GET | `/menus/:id/items` | No | - | `{ items[] }` | Implemented |
| PUT | `/menus/:id/items` | Yes | `{ items[] }` | `{ success }` | Implemented |

### 2.15 Widget Routes (`/api/v1/widgets`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/widgets` | No | - | `{ widgets[] }` (available types) | Implemented (hardcoded) |
| GET | `/widgets/types` | No | - | `{ types[] }` | Implemented (hardcoded) |
| GET | `/widgets/areas` | No | - | `{ areas[] }` | Implemented |
| GET | `/widgets/areas/:area_id` | No | - | `{ area with widgets }` | Implemented |
| PUT | `/widgets/areas/:area_id` | Yes | `{ widgets[] }` | `{ success }` | Implemented |
| GET | `/widgets/:id` | No | - | `{ widget }` | Implemented |
| PUT | `/widgets/:id` | Yes | `{ settings }` | `{ updated }` | Implemented |
| DELETE | `/widgets/:id` | Yes | - | `204 No Content` | Implemented |

**Note**: `widget_areas` table is referenced in queries but not defined in any migration file. This is a schema gap.

### 2.16 Stats/Dashboard Routes (`/api/v1/stats`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/stats` | Yes | - | `{ posts, pages, comments, users, media }` | Implemented |
| GET | `/stats/dashboard` | Yes | - | Same as above | Implemented |
| GET | `/stats/posts` | Yes | - | `{ total, published, draft }` | Implemented |
| GET | `/stats/overview` | Yes | - | `{ views, top_posts, referrers }` | **HARDCODED** (fake data) |
| GET | `/stats/content` | Yes | - | `{ published, drafts }` | Partially implemented |
| GET | `/stats/activity` | Yes | - | `{ recent_posts, recent_comments }` | **STUBBED** (empty arrays) |

### 2.17 Email Routes (`/api/v1/email`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/email/config` | Yes (admin) | - | `{ smtp_host, smtp_port, ... }` | Implemented |
| PUT | `/email/config` | Yes (admin) | `{ smtp_host, smtp_port, ... }` | `{ success }` | Implemented |
| GET | `/email/settings` | Yes (admin) | - | Alias for config | Implemented |
| PUT | `/email/settings` | Yes (admin) | - | Alias for config | Implemented |
| POST | `/email/test` | Yes (admin) | `{ to }` | `{ success, message }` | Implemented |
| GET | `/email/templates` | Yes | - | `{ templates[] }` | Implemented |
| POST | `/email/send` | Yes (admin) | `{ to, subject, template, data }` | `{ success }` | Implemented |

### 2.18 Backup Routes (`/api/v1/backups`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/backups` | Yes | Query: `page, per_page, type` | `{ backups[], total }` | Implemented |
| POST | `/backups` | Yes | `{ type?, include_media?, ... }` | `{ backup object }` | Implemented |
| GET | `/backups/storage` | Yes | - | `{ storage info }` | Implemented |
| GET | `/backups/schedules` | Yes | - | `{ schedules[] }` | Implemented |
| POST | `/backups/schedules` | Yes | `{ frequency, type, retention }` | `{ schedule }` | Implemented |
| GET | `/backups/schedules/:id` | Yes | - | `{ schedule }` | Implemented |
| PUT | `/backups/schedules/:id` | Yes | `{ updates }` | `{ updated }` | Implemented |
| DELETE | `/backups/schedules/:id` | Yes | - | `{ deleted }` | Implemented |
| GET | `/backups/:id` | Yes | - | `{ backup details }` | Implemented |
| DELETE | `/backups/:id` | Yes | - | `{ deleted }` | Implemented |
| GET | `/backups/:id/download` | Yes | - | File download | Implemented |
| POST | `/backups/:id/restore` | Yes | - | `{ job_id }` | Implemented |
| GET | `/backups/restore/:job_id` | Yes | - | `{ progress }` | Implemented |

**Note**: The `backups` table is referenced in queries but not defined in any migration file. Schema gap.

### 2.19 SEO Routes (`/api/v1/seo`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/seo/settings` | Yes | - | `{ seo settings }` | Implemented |
| PUT | `/seo/settings` | Yes | `{ key: value }` | `{ success }` | Implemented |
| GET | `/seo/sitemap` | No | - | `{ sitemap status }` | Implemented |
| POST | `/seo/sitemap/generate` | Yes | - | `{ success }` | Implemented |
| GET | `/seo/robots` | No | - | `{ robots.txt content }` | Implemented |
| PUT | `/seo/robots` | Yes | `{ content }` | `{ success }` | Implemented |
| POST | `/seo/analyze` | Yes | `{ content, title, slug }` | `{ seo analysis }` | Implemented |
| POST | `/seo/bulk-analyze` | Yes | `{ ids[] }` | `{ analyses[] }` | Implemented |
| GET | `/seo/dashboard` | Yes | - | `{ overview stats }` | Implemented |
| GET | `/seo/:content_type/:id` | Yes | - | `{ seo data for content }` | Implemented |
| PUT | `/seo/:content_type/:id` | Yes | `{ meta data }` | `{ success }` | Implemented |

### 2.20 Cache Routes (`/api/v1/cache`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/cache/stats` | Yes | - | `{ hit_count, miss_count, ... }` | Implemented |
| POST | `/cache/clear` | Yes | - | `{ success }` | Implemented |
| POST | `/cache/clear/:cache_type` | Yes | - | `{ success }` | Implemented |
| POST | `/cache/clear/tag` | Yes | `{ tag }` | `{ success }` | Implemented |
| POST | `/cache/clear/:content_type/:id` | Yes | - | `{ success }` | Implemented |
| GET | `/cache/entries` | Yes | - | `{ entries[] }` | Implemented |
| GET | `/cache/config` | Yes | - | `{ cache config }` | Implemented |
| PUT | `/cache/config` | Yes | `{ config }` | `{ success }` | Implemented |
| POST | `/cache/warm` | Yes | - | `{ success }` | Implemented |
| GET | `/cache/health` | Yes | - | `{ health status }` | Implemented |

### 2.21 CDN Routes (`/api/v1/cdn`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/cdn/status` | Yes | - | `{ enabled, provider, status }` | Implemented |
| GET | `/cdn/config` | Yes | - | `{ config }` | Implemented |
| PUT | `/cdn/config` | Yes | `{ provider, api_key, zone_id, enabled }` | `{ success }` | Implemented |
| POST | `/cdn/purge/all` | Yes | - | `{ success }` | Implemented |
| POST | `/cdn/purge/urls` | Yes | `{ urls[] }` | `{ success }` | Implemented |
| POST | `/cdn/purge/tags` | Yes | `{ tags[] }` | `{ success }` | Implemented |
| GET | `/cdn/stats` | Yes | - | `{ cdn statistics }` | Implemented |
| GET | `/cdn/health` | Yes | - | `{ health status }` | Implemented |

### 2.22 Chat Routes (`/api/v1/chat`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/chat/personal-notes` | Yes | - | `{ notes[] }` | Implemented |
| GET | `/chat/online-users` | Yes | - | `{ users[] }` | Implemented |
| POST | `/chat/group` | Yes | `{ name, user_ids[] }` | `{ conversation }` | Implemented |
| GET | `/chat/conversations` | Yes | - | `{ conversations[] }` | Implemented |
| POST | `/chat/conversations` | Yes | `{ type, participant_ids[] }` | `{ conversation }` | Implemented |
| GET | `/chat/conversations/:id` | Yes | - | `{ conversation }` | Implemented |
| PUT | `/chat/conversations/:id` | Yes | `{ title }` | `{ updated }` | Implemented |
| DELETE | `/chat/conversations/:id` | Yes | - | Archives conversation | Implemented |
| GET | `/chat/conversations/:id/messages` | Yes | - | `{ messages[] }` | Implemented |
| POST | `/chat/conversations/:id/messages` | Yes | `{ content }` | `{ message }` | Implemented |
| GET | `/chat/conversations/:id/participants` | Yes | - | `{ participants[] }` | Implemented |
| POST | `/chat/conversations/:id/participants` | Yes | `{ user_id }` | `{ success }` | Implemented |
| DELETE | `/chat/conversations/:id/participants/:user_id` | Yes | - | Removes participant | Implemented |
| POST | `/chat/conversations/:id/tags` | Yes | `{ tag, color }` | `{ success }` | Implemented |
| DELETE | `/chat/conversations/:id/tags/:tag` | Yes | - | Removes tag | Implemented |
| PUT | `/chat/messages/:id` | Yes | `{ content }` | `{ updated }` | Implemented |
| DELETE | `/chat/messages/:id` | Yes | - | Soft deletes | Implemented |
| POST | `/chat/messages/:id/reactions` | Yes | `{ emoji }` | `{ success }` | Implemented |
| DELETE | `/chat/messages/:id/reactions/:emoji` | Yes | - | Removes reaction | Implemented |
| POST | `/chat/messages/:id/star` | Yes | - | Stars message | Implemented |
| DELETE | `/chat/messages/:id/star` | Yes | - | Unstars message | Implemented |
| POST | `/chat/messages/:id/pin` | Yes | - | Pins message | Implemented |
| DELETE | `/chat/messages/:id/pin` | Yes | - | Unpins message | Implemented |
| POST | `/chat/messages/:id/remind` | Yes | `{ remind_at }` | `{ success }` | Implemented |
| GET | `/chat/history` | Yes | - | `{ history[] }` | Implemented |
| GET | `/chat/starred` | Yes | - | `{ starred[] }` | Implemented |

### 2.23 File System / IDE Routes (`/api/v1/files`, `/api/v1/git`)

| Method | Path | Auth | Request Body | Response Body | Status |
|--------|------|------|-------------|---------------|--------|
| GET | `/files/list` | Yes | Query: `path` | `{ files[] }` | Implemented |
| GET | `/files/read` | Yes | Query: `path` | `{ content, language }` | Implemented |
| PUT | `/files/write` | Yes | `{ path, content }` | `{ success }` | Implemented |
| POST | `/files/create` | Yes | `{ path, type }` | `{ success }` | Implemented |
| DELETE | `/files/delete` | Yes | Query: `path` | `{ success }` | Implemented |
| PUT | `/files/rename` | Yes | `{ old_path, new_path }` | `{ success }` | Implemented |
| GET | `/git/status` | Yes | - | `{ status }` | Implemented |
| POST | `/git/init` | Yes | - | `{ success }` | Implemented |

### 2.24 WebSocket Endpoint

| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/api/v1/ws` | Yes | WebSocket upgrade for real-time collaboration | Implemented |

### 2.25 Public Frontend Routes

| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/` | No | Home page (theme rendered) | Implemented |
| GET | `/blog` | No | Blog archive page | Implemented |
| GET | `/post/:slug` | No | Single post view | Implemented |
| GET | `/page/:slug` | No | Single page view | Implemented |
| GET | `/category/:slug` | No | Category archive | Implemented |
| GET | `/tag/:slug` | No | Tag archive | Implemented |
| GET | `/author/:slug` | No | Author archive | Implemented |
| GET | `/search` | No | Search results page | Implemented |
| GET | `/feed` | No | RSS 2.0 feed | Implemented |
| GET | `/feed/rss` | No | RSS 2.0 feed (alias) | Implemented |
| GET | `/feed/atom` | No | Atom feed | Implemented |
| GET | `/sitemap.xml` | No | XML sitemap | Implemented |
| GET | `/robots.txt` | No | Robots.txt | Implemented |
| GET | `/themes/:theme_id/*path` | No | Theme static assets | Implemented |

---

## 3. Total Endpoint Count

| Category | Count |
|----------|-------|
| Health & System | 5 |
| Auth | 7 |
| Users | 7 |
| Posts | 9 |
| Pages | 5 |
| Media | 7 |
| Comments | 11 |
| Settings | 10 |
| Storage | 7 |
| Plugins | 6 |
| Themes | 18 |
| Search | 4 |
| Taxonomy | 10 |
| Menus | 8 |
| Widgets | 8 |
| Stats | 6 |
| Email | 6 |
| Backups | 13 |
| SEO | 11 |
| Cache | 10 |
| CDN | 8 |
| Chat | 26 |
| Files/Git | 8 |
| WebSocket | 1 |
| Public Frontend | 14 |
| Plugin Routes (Cloudflare, RustBuilder, PageForge) | ~30 (estimated) |
| **TOTAL** | **~240+** |

---

## 4. Stubbed / Incomplete Endpoints

| Endpoint | Issue |
|----------|-------|
| `GET /metrics` | Returns static string, not real Prometheus metrics |
| `POST /search/reindex` | Returns "queued" but no background job is actually queued |
| `GET /stats/overview` | Returns hardcoded fake data (`total_views: 12500`) |
| `GET /stats/activity` | Returns empty arrays |
| `GET /stats/content` | Missing `by_category` and `by_author` breakdowns |

---

## 5. Endpoints Missing for Admin UI Integration

Based on the admin UI components referenced in the strategy, these endpoints are likely needed but not present:

1. **OAuth2 Social Login** - `/auth/oauth2/google`, `/auth/oauth2/github`
2. **WebAuthn** - `/auth/webauthn/register`, `/auth/webauthn/authenticate`
3. **TOTP 2FA** - `/auth/totp/enable`, `/auth/totp/disable`, `/auth/totp/verify`
4. **API Key Management** - `/auth/api-keys` CRUD
5. **Session Management** - `/auth/sessions` list/revoke
6. **Post Revisions** - `/posts/:id/revisions`
7. **Post Scheduling** - `/posts/:id/schedule`
8. **Media Optimization** - `/media/:id/optimize`
9. **Plugin Settings** - `/plugins/:id/settings`
10. **Widget Areas CRUD** - `/widgets/areas` POST (create)
11. **Real Analytics** - Replace hardcoded stats with actual data
12. **Audit Log** - `/audit-log` for admin security review

---

## 6. Security Observations

1. **Auth enforcement is inconsistent**: Some route groups (categories, tags, menus, search) do not require authentication for read operations, while others (settings, cache, CDN) require auth for all operations. This should be reviewed for intentional public vs. private access.

2. **Admin role check**: Only the email configuration handler explicitly checks for `role == "administrator"` (line 6603). Other admin-only operations (plugin install, theme delete, user management) do not appear to have explicit role checks in the route definitions -- they rely on the `AuthUser` extractor alone.

3. **File system access**: The `/files/*` endpoints allow reading/writing files in `themes/`, `functions/`, `plugins/`, `apps/`, and `assets/` directories. This is a significant attack surface if auth is not properly enforced.

4. **CSRF protection**: No CSRF middleware is applied to the API routes, despite the `rustpress-auth` crate having a full CSRF module. This is acceptable for JWT-only auth but may be an issue for session-based auth.
