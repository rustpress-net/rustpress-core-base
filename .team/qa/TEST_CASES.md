# RustPress CMS - Test Cases for P0 Features

> **Author**: QA Engineer (QA)
> **Date**: 2026-03-02
> **Version**: 1.0
> **Status**: Wave 3 QA Artifact
> **Scope**: All 23 P0 features from RUSTPRESS_STRATEGY.md

---

## Format Legend

- **ID**: TC-{Feature#}-{Sequence}
- **Type**: Unit / Integration / E2E / Security
- **Priority**: P0 (must test) / P1 (should test) / P2 (nice to test)

---

## P0-1: Backend Compilation & Startup

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-1-01 | All 19 crates compile with zero errors | Run `cargo check --all-targets --all-features` with no RUSTFLAGS suppression | Exit code 0, zero errors | P0 | Unit |
| TC-1-02 | All crates compile with zero warnings | Run `cargo clippy -- -D warnings` | Exit code 0, zero warnings | P0 | Unit |
| TC-1-03 | Server starts and binds to configured port | Start server with valid config, check port binding | Server listening on configured HOST:PORT within 5 seconds | P0 | Integration |
| TC-1-04 | Health liveness endpoint responds | `GET /health/live` | 200 OK with health status | P0 | Integration |
| TC-1-05 | Health readiness endpoint responds | `GET /health/ready` (with DB connected) | 200 OK confirming DB connectivity | P0 | Integration |
| TC-1-06 | Health readiness fails without DB | `GET /health/ready` (DB not running) | 503 Service Unavailable | P0 | Integration |
| TC-1-07 | API health alias responds | `GET /api/health` | 200 OK | P1 | Integration |
| TC-1-08 | Prometheus metrics endpoint returns data | `GET /metrics` | 200 OK with Prometheus-formatted metrics (not static stub) | P0 | Integration |
| TC-1-09 | Server starts in under 5 seconds | Measure time from process start to first health check response | < 5 seconds | P1 | Integration |
| TC-1-10 | Server handles graceful shutdown | Send SIGTERM, verify in-flight requests complete | Clean shutdown, no panics | P1 | Integration |

---

## P0-2: Database Migrations

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-2-01 | All migrations run on fresh PostgreSQL 16 | Run all 10 migration files sequentially against empty database | All execute successfully, key tables created | P0 | Integration |
| TC-2-02 | Migrations are idempotent | Run all migrations twice consecutively | Second run succeeds without errors | P0 | Integration |
| TC-2-03 | Core tables exist after migration | Query `information_schema.tables` | users, posts, pages, categories, tags, media, comments, settings, themes, menus, menu_items, widgets tables exist | P0 | Integration |
| TC-2-04 | Default admin user is seeded | Query `users` table after migration | Admin user exists with Argon2id hashed password | P0 | Integration |
| TC-2-05 | Default category is seeded | Query `categories` table after migration | "Uncategorized" category exists | P0 | Integration |
| TC-2-06 | Foreign key constraints are enforced | Insert post with non-existent author_id | Foreign key violation error | P0 | Integration |
| TC-2-07 | Cascade deletes work correctly | Delete a user, check their posts | Posts have author_id set to NULL (ON DELETE SET NULL) | P0 | Integration |
| TC-2-08 | DOWN migrations exist and work | Run UP then DOWN for each migration | Database returns to pre-migration state | P0 | Integration |
| TC-2-09 | Migration numbering gap handled | Verify migrations 00001, 00002, 00023-00030 run in order | Numbering gap does not cause framework errors | P1 | Integration |
| TC-2-10 | Missing `deleted_at` columns are added | Check posts and menus tables for `deleted_at` | Column exists (requires new migration 00031+) | P0 | Integration |
| TC-2-11 | Missing `backups` table is created | Check for backups and backup_schedules tables | Tables exist (requires new migration) | P0 | Integration |
| TC-2-12 | Missing `widget_areas` table is created | Check for widget_areas table | Table exists (requires new migration) | P0 | Integration |

---

## P0-3: Authentication System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-3-01 | Successful login with valid credentials | `POST /api/v1/auth/login` with valid email+password | 200 OK with access_token, refresh_token, token_type, expires_in | P0 | Integration |
| TC-3-02 | Login fails with wrong password | `POST /api/v1/auth/login` with valid email, wrong password | 401 Unauthorized | P0 | Integration |
| TC-3-03 | Login fails with non-existent email | `POST /api/v1/auth/login` with unknown email | 401 Unauthorized (generic message, no email enumeration) | P0 | Integration |
| TC-3-04 | Login fails with empty email | `POST /api/v1/auth/login` with empty email | 400 Bad Request, validation error | P0 | Integration |
| TC-3-05 | Login fails with empty password | `POST /api/v1/auth/login` with empty password | 400 Bad Request, validation error | P0 | Integration |
| TC-3-06 | JWT access token is valid | Decode returned access_token | Contains sub (user_id), iat, exp, iss="rustpress", typ="access" | P0 | Unit |
| TC-3-07 | Access token expires in 15 minutes | Check exp claim in access_token | exp - iat = 900 seconds | P0 | Unit |
| TC-3-08 | Refresh token expires in 7 days | Check exp claim in refresh_token | exp - iat = 604800 seconds | P0 | Unit |
| TC-3-09 | Token refresh returns new token pair | `POST /api/v1/auth/refresh` with valid refresh_token | 200 OK with new access_token and refresh_token | P0 | Integration |
| TC-3-10 | Old refresh token is revoked after use | Use a refresh token, then use it again | Second use returns 401 (token revoked) | P0 | Integration |
| TC-3-11 | Replay attack revokes token family | Use revoked refresh token | Entire token family is revoked | P0 | Security |
| TC-3-12 | Logout invalidates session | `POST /api/v1/auth/logout` with valid JWT | 200 OK, subsequent requests with same token return 401 | P0 | Integration |
| TC-3-13 | User registration succeeds | `POST /api/v1/auth/register` with valid email, username, password | 201 Created with user object | P0 | Integration |
| TC-3-14 | Registration rejects duplicate email | `POST /api/v1/auth/register` with existing email | 409 Conflict | P0 | Integration |
| TC-3-15 | Registration rejects weak password | `POST /api/v1/auth/register` with "123" | 400 Bad Request, password strength error | P0 | Integration |
| TC-3-16 | Forgot password sends email | `POST /api/v1/auth/forgot-password` with valid email | 200 OK with success message (email sent) | P0 | Integration |
| TC-3-17 | Forgot password with unknown email | `POST /api/v1/auth/forgot-password` with unknown email | 200 OK (same response to prevent enumeration) | P0 | Security |
| TC-3-18 | Password reset with valid token | `POST /api/v1/auth/reset-password` with valid token and new password | 200 OK, password changed | P0 | Integration |
| TC-3-19 | Password reset with expired token | `POST /api/v1/auth/reset-password` with expired token | 400 Bad Request, token expired | P0 | Integration |
| TC-3-20 | Password reset with used token | Use same reset token twice | Second use returns 400 (already used) | P0 | Integration |
| TC-3-21 | `/auth/me` returns current user | `GET /api/v1/auth/me` with valid JWT | 200 OK with user object | P0 | Integration |
| TC-3-22 | Brute force lockout after 5 attempts | Send 5 failed login attempts from same IP | Account locked for 15 minutes | P0 | Security |
| TC-3-23 | SQL injection in login email field | `POST /api/v1/auth/login` with `email: "' OR 1=1 --"` | 400/401, no SQL execution | P0 | Security |
| TC-3-24 | JWT with tampered signature | Modify JWT payload, keep old signature | 401 Unauthorized | P0 | Security |
| TC-3-25 | Expired JWT rejected | Use JWT after 15-minute expiry | 401 Unauthorized | P0 | Security |
| TC-3-26 | Default JWT secret rejected in production | Start server with `JWT_SECRET=change-me-in-production` | Server refuses to start or logs critical warning | P0 | Security |

---

## P0-4: User Management

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-4-01 | List users (paginated) | `GET /api/v1/users?page=1&per_page=10` with admin JWT | 200 OK with users array, total, pagination | P0 | Integration |
| TC-4-02 | Create user with admin role | `POST /api/v1/users` with admin JWT, user data | 201 Created with new user | P0 | Integration |
| TC-4-03 | Get user by ID | `GET /api/v1/users/:id` with valid JWT | 200 OK with user object | P0 | Integration |
| TC-4-04 | Update user profile | `PUT /api/v1/users/:id` with admin JWT, updated fields | 200 OK with updated user | P0 | Integration |
| TC-4-05 | Delete user | `DELETE /api/v1/users/:id` with admin JWT | 204 No Content | P0 | Integration |
| TC-4-06 | Assign role to user | `PUT /api/v1/users/:id/roles` with admin JWT | 200 OK with success | P0 | Integration |
| TC-4-07 | Non-admin cannot create users | `POST /api/v1/users` with subscriber JWT | 403 Forbidden | P0 | Security |
| TC-4-08 | Non-admin cannot delete users | `DELETE /api/v1/users/:id` with subscriber JWT | 403 Forbidden | P0 | Security |
| TC-4-09 | User cannot delete themselves | `DELETE /api/v1/users/:own_id` with own JWT | 400 Bad Request or 403 | P1 | Integration |
| TC-4-10 | Get non-existent user | `GET /api/v1/users/:nonexistent_id` | 404 Not Found | P0 | Integration |
| TC-4-11 | Create user with duplicate email | `POST /api/v1/users` with existing email | 409 Conflict | P0 | Integration |
| TC-4-12 | IDOR: subscriber accessing other user's data | `GET /api/v1/users/:other_id` with subscriber JWT | 403 Forbidden (or limited data) | P0 | Security |

---

## P0-5: Post Management

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-5-01 | Create draft post | `POST /api/v1/posts` with title, content, status="draft" | 201 Created with post ID, slug auto-generated | P0 | Integration |
| TC-5-02 | List posts (paginated) | `GET /api/v1/posts?page=1&per_page=10` | 200 OK with posts array, total, pagination | P0 | Integration |
| TC-5-03 | Get post by ID | `GET /api/v1/posts/:id` | 200 OK with full post object | P0 | Integration |
| TC-5-04 | Update post | `PUT /api/v1/posts/:id` with updated title | 200 OK with updated post | P0 | Integration |
| TC-5-05 | Publish post | `POST /api/v1/posts/:id/publish` | 200 OK, status changes to "published", published_at set | P0 | Integration |
| TC-5-06 | Unpublish post | `POST /api/v1/posts/:id/unpublish` | 200 OK, status returns to "draft" | P0 | Integration |
| TC-5-07 | Delete post | `DELETE /api/v1/posts/:id` | 204 No Content | P0 | Integration |
| TC-5-08 | Bulk delete posts | `POST /api/v1/posts/bulk-delete` with array of IDs | 200 OK with deleted_count | P0 | Integration |
| TC-5-09 | Duplicate post | `POST /api/v1/posts/:id/duplicate` | 200 OK with new post (different ID, same content) | P0 | Integration |
| TC-5-10 | Create post with empty title | `POST /api/v1/posts` with empty title | 400 Bad Request, validation error | P0 | Integration |
| TC-5-11 | Create post with max-length title | `POST /api/v1/posts` with 500-char title | 201 Created (VARCHAR(500) limit) | P1 | Integration |
| TC-5-12 | Create post with title exceeding max | `POST /api/v1/posts` with 501-char title | 400 Bad Request or truncation | P1 | Integration |
| TC-5-13 | Create post with XSS in content | `POST /api/v1/posts` with `<script>alert('xss')</script>` | Content sanitized, no script tags in stored content | P0 | Security |
| TC-5-14 | Filter posts by status | `GET /api/v1/posts?status=published` | Only published posts returned | P0 | Integration |
| TC-5-15 | Filter posts by author | `GET /api/v1/posts?author_id=:id` | Only posts by specified author | P0 | Integration |
| TC-5-16 | Auto-generated slug is unique | Create two posts with same title | Second post gets slug with suffix (e.g., "-2") | P0 | Integration |
| TC-5-17 | Post with categories and tags | `POST /api/v1/posts` with categories[] and tags[] | Post created with taxonomy assignments | P0 | Integration |
| TC-5-18 | Get non-existent post | `GET /api/v1/posts/:nonexistent_id` | 404 Not Found | P0 | Integration |
| TC-5-19 | Unauthenticated post creation | `POST /api/v1/posts` without JWT | 401 Unauthorized | P0 | Security |

---

## P0-6: Page Management

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-6-01 | Create page | `POST /api/v1/pages` with title, content | 201 Created | P0 | Integration |
| TC-6-02 | Create child page | `POST /api/v1/pages` with parent_id | 201 Created with hierarchy | P0 | Integration |
| TC-6-03 | List pages | `GET /api/v1/pages` | 200 OK with pages array | P0 | Integration |
| TC-6-04 | Get page by ID | `GET /api/v1/pages/:id` | 200 OK with page object including parent/children | P0 | Integration |
| TC-6-05 | Update page | `PUT /api/v1/pages/:id` | 200 OK with updated page | P0 | Integration |
| TC-6-06 | Delete page | `DELETE /api/v1/pages/:id` | 204 No Content | P0 | Integration |
| TC-6-07 | Set page template | `PUT /api/v1/pages/:id` with template field | Template saved and returned | P0 | Integration |
| TC-6-08 | Circular parent reference rejected | Set page as its own parent | 400 Bad Request | P0 | Integration |
| TC-6-09 | Deleting parent page updates children | Delete parent, check children | Children have parent_id set to NULL | P0 | Integration |

---

## P0-7: Media Library

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-7-01 | Upload image file | `POST /api/v1/media` multipart with JPEG file | 201 Created with id, filename, url, mime_type | P0 | Integration |
| TC-7-02 | Upload large file | `POST /api/v1/media` with 100MB video | 201 Created (within configured limit) | P1 | Integration |
| TC-7-03 | Upload file exceeding size limit | `POST /api/v1/media` with file > max size | 413 Payload Too Large | P0 | Integration |
| TC-7-04 | Upload disallowed file type | `POST /api/v1/media` with .exe file | 400 Bad Request, file type not allowed | P0 | Security |
| TC-7-05 | Upload file with spoofed MIME type | Upload .exe renamed to .jpg with wrong Content-Type | 400 Bad Request (magic byte validation fails) | P0 | Security |
| TC-7-06 | List media files | `GET /api/v1/media` | 200 OK with media array, total | P0 | Integration |
| TC-7-07 | Filter media by MIME type | `GET /api/v1/media?mime_type=image/jpeg` | Only JPEG files returned | P0 | Integration |
| TC-7-08 | Filter media by folder | `GET /api/v1/media?folder_id=:id` | Only files in specified folder | P0 | Integration |
| TC-7-09 | Get media by ID | `GET /api/v1/media/:id` | 200 OK with media object | P0 | Integration |
| TC-7-10 | Update media metadata | `PUT /api/v1/media/:id` with alt_text, caption | 200 OK with updated metadata | P0 | Integration |
| TC-7-11 | Delete media | `DELETE /api/v1/media/:id` | 204 No Content, file removed | P0 | Integration |
| TC-7-12 | List media folders | `GET /api/v1/media/folders` | 200 OK with folder hierarchy | P0 | Integration |
| TC-7-13 | Create media folder | `POST /api/v1/media/folders` with name | 201 Created with folder | P0 | Integration |
| TC-7-14 | Upload with XSS in filename | Upload file named `<script>alert(1)</script>.jpg` | Filename sanitized | P0 | Security |

---

## P0-8: Comments System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-8-01 | Create comment on post | `POST /api/v1/comments` with post_id, content | 201 Created with comment | P0 | Integration |
| TC-8-02 | Create threaded reply | `POST /api/v1/comments` with parent_id | 201 Created with threading | P0 | Integration |
| TC-8-03 | List comments on post | `GET /api/v1/comments?post_id=:id` | 200 OK with comments, threaded structure | P0 | Integration |
| TC-8-04 | Get comment counts | `GET /api/v1/comments/counts` | 200 OK with pending, approved, spam, trash counts | P0 | Integration |
| TC-8-05 | Approve comment | `POST /api/v1/comments/:id/approve` | 200 OK, status="approved" | P0 | Integration |
| TC-8-06 | Mark comment as spam | `POST /api/v1/comments/:id/spam` | 200 OK, status="spam" | P0 | Integration |
| TC-8-07 | Trash comment | `POST /api/v1/comments/:id/trash` | 200 OK, status="trash" | P0 | Integration |
| TC-8-08 | Batch moderation | `POST /api/v1/comments/batch` with ids and action | 200 OK with affected_count | P0 | Integration |
| TC-8-09 | Like comment | `POST /api/v1/comments/:id/like` | 200 OK with incremented likes_count | P0 | Integration |
| TC-8-10 | Double-like prevented | Like same comment twice from same user | Second like returns same count (idempotent) | P1 | Integration |
| TC-8-11 | Comment with XSS content | `POST /api/v1/comments` with `<script>` in content | Content sanitized | P0 | Security |
| TC-8-12 | Comment with empty content | `POST /api/v1/comments` with empty content | 400 Bad Request | P0 | Integration |
| TC-8-13 | Comment on non-existent post | `POST /api/v1/comments` with invalid post_id | 404 Not Found or 400 Bad Request | P0 | Integration |

---

## P0-9: Taxonomy System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-9-01 | Create category | `POST /api/v1/taxonomies/categories` | 201 Created with id, name, slug | P0 | Integration |
| TC-9-02 | Create hierarchical category | `POST /api/v1/taxonomies/categories` with parent_id | Category with parent relationship | P0 | Integration |
| TC-9-03 | List categories | `GET /api/v1/taxonomies/categories` | 200 OK with categories (tree structure) | P0 | Integration |
| TC-9-04 | Update category | `PUT /api/v1/taxonomies/categories/:id` | 200 OK with updated data | P0 | Integration |
| TC-9-05 | Delete category | `DELETE /api/v1/taxonomies/categories/:id` | 204 No Content | P0 | Integration |
| TC-9-06 | Create tag | `POST /api/v1/taxonomies/tags` | 201 Created | P0 | Integration |
| TC-9-07 | List tags | `GET /api/v1/taxonomies/tags` | 200 OK with tags array | P0 | Integration |
| TC-9-08 | Update tag | `PUT /api/v1/taxonomies/tags/:id` | 200 OK | P0 | Integration |
| TC-9-09 | Delete tag | `DELETE /api/v1/taxonomies/tags/:id` | 204 No Content | P0 | Integration |
| TC-9-10 | Assign categories to post | Create post with category IDs | Post-category junction records created | P0 | Integration |
| TC-9-11 | Duplicate category slug rejected | Create two categories with same slug | 409 Conflict | P0 | Integration |
| TC-9-12 | Delete category with posts | Delete category that has assigned posts | Category deleted, posts unlinked (CASCADE) | P0 | Integration |

---

## P0-10: Theme System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-10-01 | List installed themes | `GET /api/v1/themes` | 200 OK with themes array | P0 | Integration |
| TC-10-02 | Get active theme | `GET /api/v1/themes/active` | 200 OK with active theme details | P0 | Integration |
| TC-10-03 | Activate a theme | `POST /api/v1/themes/:id/activate` | 200 OK, theme becomes active | P0 | Integration |
| TC-10-04 | Get theme settings | `GET /api/v1/themes/:id/settings` | 200 OK with theme settings | P0 | Integration |
| TC-10-05 | Update theme settings | `PUT /api/v1/themes/:id/settings` | Settings persist | P0 | Integration |
| TC-10-06 | Upload theme ZIP | `POST /api/v1/themes/upload` multipart | Theme installed | P0 | Integration |
| TC-10-07 | Validate theme ZIP | `POST /api/v1/themes/validate` | Validation results returned | P0 | Integration |
| TC-10-08 | Delete theme | `DELETE /api/v1/themes/:id` | 204 No Content | P0 | Integration |
| TC-10-09 | Cannot delete active theme | `DELETE /api/v1/themes/:active_id` | 400 Bad Request | P0 | Integration |
| TC-10-10 | Theme static assets served | `GET /themes/:theme_id/style.css` | 200 OK with CSS file | P0 | Integration |
| TC-10-11 | Upload malicious ZIP | Upload ZIP with path traversal filenames | Upload rejected or paths sanitized | P0 | Security |

---

## P0-11: Plugin System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-11-01 | List installed plugins | `GET /api/v1/plugins` | 200 OK with plugins array | P0 | Integration |
| TC-11-02 | Get plugin details | `GET /api/v1/plugins/:id` | 200 OK with plugin info | P0 | Integration |
| TC-11-03 | Activate plugin | `POST /api/v1/plugins/:id/activate` | 200 OK, plugin marked active | P0 | Integration |
| TC-11-04 | Deactivate plugin | `POST /api/v1/plugins/:id/deactivate` | 200 OK, plugin marked inactive | P0 | Integration |
| TC-11-05 | Install plugin via ZIP upload | `POST /api/v1/plugins` multipart | Plugin installed | P0 | Integration |
| TC-11-06 | Uninstall plugin | `DELETE /api/v1/plugins/:id` | Plugin files removed, hooks unregistered | P0 | Integration |
| TC-11-07 | Plugin hooks fire on activation | Activate plugin with `on_activate` hook | Hook callback executes | P0 | Integration |
| TC-11-08 | Plugin hooks fire on deactivation | Deactivate plugin with `on_deactivate` hook | Hook callback executes | P0 | Integration |
| TC-11-09 | Non-admin cannot install plugins | `POST /api/v1/plugins` with subscriber JWT | 403 Forbidden | P0 | Security |
| TC-11-10 | Malicious plugin ZIP rejected | Upload ZIP with executable payloads | Upload rejected | P0 | Security |

---

## P0-12: Admin UI <-> Backend Integration

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-12-01 | Login page authenticates against backend | Enter credentials in admin UI login form | JWT stored, redirected to dashboard | P0 | E2E |
| TC-12-02 | Dashboard shows real backend data | Navigate to /admin/dashboard after login | Post count, comment count, user count from API (not mock) | P0 | E2E |
| TC-12-03 | Posts list loads from API | Navigate to /admin/posts | Posts loaded from `/api/v1/posts` | P0 | E2E |
| TC-12-04 | Post editor creates real post | Create post via editor, submit | Post appears in backend database | P0 | E2E |
| TC-12-05 | Media upload via admin UI | Upload file through media library page | File stored on server, record in media table | P0 | E2E |
| TC-12-06 | User management via admin UI | Create user through admin users page | User appears in backend database | P0 | E2E |
| TC-12-07 | Settings saved via admin UI | Change a setting, save | Setting persisted in backend | P0 | E2E |
| TC-12-08 | API URL prefix matches backend | All API calls from frontend | Requests hit `/api/v1/*` (not just `/api/*`) | P0 | Integration |
| TC-12-09 | JWT token refresh works in admin UI | Use admin UI for > 15 minutes | Token auto-refreshes, no forced logout | P0 | E2E |
| TC-12-10 | 401 response redirects to login | Use admin UI with expired token | Redirected to login page | P0 | E2E |
| TC-12-11 | No mock data in production build | Run `npm run build`, inspect bundle | No hardcoded mock data in JS output | P0 | Unit |
| TC-12-12 | Admin UI accessible without JS | Critical actions available | Login and basic navigation work (graceful degradation) | P2 | E2E |

---

## P0-13: Public Frontend Rendering

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-13-01 | Home page renders with active theme | `GET /` | 200 OK with HTML, theme applied | P0 | Integration |
| TC-13-02 | Blog archive page renders | `GET /blog` | 200 OK with list of published posts | P0 | Integration |
| TC-13-03 | Single post page renders | `GET /post/:slug` | 200 OK with post content, theme template | P0 | Integration |
| TC-13-04 | Single page renders | `GET /page/:slug` | 200 OK with page content | P0 | Integration |
| TC-13-05 | Category archive renders | `GET /category/:slug` | 200 OK with category posts | P0 | Integration |
| TC-13-06 | Tag archive renders | `GET /tag/:slug` | 200 OK with tagged posts | P0 | Integration |
| TC-13-07 | Author archive renders | `GET /author/:slug` | 200 OK with author's posts | P0 | Integration |
| TC-13-08 | Search results page renders | `GET /search?q=test` | 200 OK with search results | P0 | Integration |
| TC-13-09 | RSS feed is valid | `GET /feed` or `/feed/rss` | Valid RSS 2.0 XML | P0 | Integration |
| TC-13-10 | Atom feed is valid | `GET /feed/atom` | Valid Atom XML | P0 | Integration |
| TC-13-11 | Sitemap is valid | `GET /sitemap.xml` | Valid XML sitemap with all published content URLs | P0 | Integration |
| TC-13-12 | Robots.txt serves correctly | `GET /robots.txt` | Valid robots.txt content | P0 | Integration |
| TC-13-13 | SEO meta tags present | `GET /post/:slug` | HTML contains title, description, og:* meta tags | P0 | Integration |
| TC-13-14 | 404 page for non-existent content | `GET /post/nonexistent-slug` | 404 Not Found with themed error page | P0 | Integration |
| TC-13-15 | Draft posts not publicly visible | `GET /post/:draft_slug` (unpublished post) | 404 Not Found | P0 | Security |

---

## P0-14: Settings Management

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-14-01 | Get all settings | `GET /api/v1/settings` | 200 OK with all settings | P0 | Integration |
| TC-14-02 | Get settings by group | `GET /api/v1/settings/groups/general` | 200 OK with general settings | P0 | Integration |
| TC-14-03 | Update single setting | `PUT /api/v1/settings/site_title` with new value | 200 OK, value persisted | P0 | Integration |
| TC-14-04 | Batch update settings | `PUT /api/v1/settings/batch` with multiple key-value pairs | 200 OK, all values persisted | P0 | Integration |
| TC-14-05 | Get general settings | `GET /api/v1/settings/general` | Returns site_title, site_description, etc. | P0 | Integration |
| TC-14-06 | Get reading settings | `GET /api/v1/settings/reading` | Returns posts_per_page, etc. | P0 | Integration |
| TC-14-07 | Get writing settings | `GET /api/v1/settings/writing` | Returns default_category, etc. | P0 | Integration |
| TC-14-08 | Get discussion settings | `GET /api/v1/settings/discussion` | Returns comment moderation settings | P0 | Integration |
| TC-14-09 | Get permalink settings | `GET /api/v1/settings/permalinks` | Returns permalink structure | P0 | Integration |
| TC-14-10 | Non-admin cannot modify settings | `PUT /api/v1/settings/:key` with subscriber JWT | 403 Forbidden | P0 | Security |
| TC-14-11 | Setting with XSS value | `PUT /api/v1/settings/site_title` with `<script>alert(1)</script>` | Value sanitized or rejected | P0 | Security |

---

## P0-15: Menu Management

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-15-01 | Create menu | `POST /api/v1/menus` with name | 201 Created | P0 | Integration |
| TC-15-02 | List menus | `GET /api/v1/menus` | 200 OK with menus array | P0 | Integration |
| TC-15-03 | Get menu by ID | `GET /api/v1/menus/:id` | 200 OK with menu and items | P0 | Integration |
| TC-15-04 | Update menu | `PUT /api/v1/menus/:id` | 200 OK with updated data | P0 | Integration |
| TC-15-05 | Delete menu | `DELETE /api/v1/menus/:id` | 204 No Content | P0 | Integration |
| TC-15-06 | Add items to menu | `PUT /api/v1/menus/:id/items` with items array | Items saved with ordering | P0 | Integration |
| TC-15-07 | Nested menu items | Add items with parent_id references | Hierarchical structure preserved | P0 | Integration |
| TC-15-08 | Reorder menu items | Update items with different menu_order values | Order persisted correctly | P0 | Integration |
| TC-15-09 | Assign menu to theme location | Update menu with location field | Menu appears in theme location | P0 | Integration |
| TC-15-10 | Get menu locations | `GET /api/v1/menus/locations` | 200 OK with available locations | P0 | Integration |

---

## P0-16: Search Functionality

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-16-01 | Search posts by keyword | `GET /api/v1/search?q=keyword` | Results include matching posts | P0 | Integration |
| TC-16-02 | Search with empty query | `GET /api/v1/search?q=` | 400 Bad Request or empty results | P0 | Integration |
| TC-16-03 | Search with pagination | `GET /api/v1/search?q=keyword&page=2&per_page=5` | Correct pagination | P0 | Integration |
| TC-16-04 | Search by content type | `GET /api/v1/search?q=keyword&type=post` | Only posts returned | P0 | Integration |
| TC-16-05 | Search suggestions | `GET /api/v1/search/suggest?q=key` | Relevant suggestions returned | P1 | Integration |
| TC-16-06 | Search returns published only | Search for draft post title | Draft posts not in results | P0 | Security |
| TC-16-07 | Search with special characters | `GET /api/v1/search?q=<script>alert(1)</script>` | No XSS, results properly escaped | P0 | Security |
| TC-16-08 | Search with SQL injection | `GET /api/v1/search?q=' OR 1=1 --` | No SQL execution, safe response | P0 | Security |

---

## P0-17: Cache System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-17-01 | Cache stats accessible | `GET /api/v1/cache/stats` | 200 OK with hit_count, miss_count | P0 | Integration |
| TC-17-02 | Clear all caches | `POST /api/v1/cache/clear` | 200 OK, caches cleared | P0 | Integration |
| TC-17-03 | Clear specific cache type | `POST /api/v1/cache/clear/posts` | 200 OK, post cache cleared | P0 | Integration |
| TC-17-04 | Cache reduces DB queries | Make same request twice, monitor DB queries | Second request uses cache (fewer DB queries) | P0 | Integration |
| TC-17-05 | Cache invalidation on update | Update a post, then GET the post | Updated data returned (not stale cache) | P0 | Integration |
| TC-17-06 | Fallback to moka when Redis down | Stop Redis, make cached requests | moka in-memory cache serves requests | P0 | Integration |
| TC-17-07 | Cache health check | `GET /api/v1/cache/health` | Returns Redis connection status | P0 | Integration |

---

## P0-18: Email System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-18-01 | Get email configuration | `GET /api/v1/email/config` with admin JWT | 200 OK with SMTP settings | P0 | Integration |
| TC-18-02 | Update email configuration | `PUT /api/v1/email/config` with SMTP host, port, etc. | Settings saved | P0 | Integration |
| TC-18-03 | Send test email | `POST /api/v1/email/test` with recipient | Email sent (or meaningful error if SMTP not configured) | P0 | Integration |
| TC-18-04 | List email templates | `GET /api/v1/email/templates` | 200 OK with available templates | P0 | Integration |
| TC-18-05 | Password reset email sends | Trigger forgot-password flow | Password reset email delivered | P0 | Integration |
| TC-18-06 | Non-admin cannot access email config | `GET /api/v1/email/config` with subscriber JWT | 403 Forbidden | P0 | Security |
| TC-18-07 | SMTP credentials not exposed in response | `GET /api/v1/email/config` | Password field masked or omitted | P0 | Security |

---

## P0-19: Docker Production Deployment

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-19-01 | Docker compose starts full stack | `docker-compose up -d` | All containers healthy within 60s | P0 | Integration |
| TC-19-02 | Health checks pass after startup | `curl http://localhost:8080/health/live` | 200 OK | P0 | Integration |
| TC-19-03 | Admin UI accessible | `curl http://localhost:8080/admin/` | 200 OK with SPA HTML | P0 | Integration |
| TC-19-04 | API accessible | `curl http://localhost:8080/api/v1/health` | 200 OK | P0 | Integration |
| TC-19-05 | Data persists across restarts | Create post, restart containers, verify post exists | Post survives restart | P0 | Integration |
| TC-19-06 | Docker image size | `docker images rustpress:latest` | < 100MB | P1 | Integration |
| TC-19-07 | Container runs as non-root | `docker exec rustpress whoami` | Non-root user | P0 | Security |
| TC-19-08 | Migrations run automatically | Start fresh, check tables | All migration tables exist | P0 | Integration |
| TC-19-09 | Environment variables configure app | Set custom PORT, JWT_SECRET via env | Server uses provided values | P0 | Integration |

---

## P0-20: Admin Dashboard Accuracy

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-20-01 | Dashboard post count matches DB | Compare `/api/v1/stats` post count with `SELECT COUNT(*) FROM posts` | Counts match | P0 | Integration |
| TC-20-02 | Dashboard comment count matches DB | Compare stats comment count with DB | Counts match | P0 | Integration |
| TC-20-03 | Dashboard user count matches DB | Compare stats user count with DB | Counts match | P0 | Integration |
| TC-20-04 | Dashboard media count matches DB | Compare stats media count with DB | Counts match | P0 | Integration |
| TC-20-05 | Dashboard with empty database | Stats endpoint with no content | All counts return 0 (not error, not fake data) | P0 | Integration |
| TC-20-06 | Stats overview returns real data | `GET /api/v1/stats/overview` | Real view counts (not hardcoded 12500) | P0 | Integration |
| TC-20-07 | Activity feed returns real data | `GET /api/v1/stats/activity` | Real recent posts/comments (not empty arrays) | P0 | Integration |

---

## P0-21: Widget System

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-21-01 | List available widget types | `GET /api/v1/widgets/types` | 200 OK with widget type list | P0 | Integration |
| TC-21-02 | List widget areas | `GET /api/v1/widgets/areas` | 200 OK with sidebar areas | P0 | Integration |
| TC-21-03 | Get widgets in area | `GET /api/v1/widgets/areas/:area_id` | 200 OK with area widgets | P0 | Integration |
| TC-21-04 | Update widgets in area | `PUT /api/v1/widgets/areas/:area_id` with widgets array | Widgets saved with ordering | P0 | Integration |
| TC-21-05 | Get single widget | `GET /api/v1/widgets/:id` | 200 OK with widget details | P0 | Integration |
| TC-21-06 | Update widget settings | `PUT /api/v1/widgets/:id` with settings | Settings persisted | P0 | Integration |
| TC-21-07 | Delete widget | `DELETE /api/v1/widgets/:id` | 204 No Content | P0 | Integration |
| TC-21-08 | Reorder widgets via drag-and-drop | Update widget_order values | New order persisted | P0 | Integration |

---

## P0-22: CLI Tools Validation

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-22-01 | CLI help command | Run CLI with `--help` | Usage information displayed | P0 | Integration |
| TC-22-02 | CLI version command | Run CLI with `--version` | Version string displayed | P0 | Integration |
| TC-22-03 | CLI server start | Run `rustpress serve` | Server starts | P0 | Integration |
| TC-22-04 | CLI migrate command | Run `rustpress migrate` | Migrations execute | P0 | Integration |
| TC-22-05 | CLI user create command | Run `rustpress user create` | User created in database | P0 | Integration |
| TC-22-06 | CLI config check command | Run `rustpress config check` | Configuration validated | P1 | Integration |
| TC-22-07 | CLI with invalid command | Run `rustpress invalidcommand` | Helpful error message | P0 | Integration |
| TC-22-08 | All 14 CLI command groups functional | Run each of the 14 documented command groups | Each executes without error | P0 | Integration |

---

## P0-23: Error Handling & Logging

| ID | Test Case | Steps | Expected Result | Priority | Type |
|----|-----------|-------|-----------------|----------|------|
| TC-23-01 | API errors return standard JSON | Trigger various error types | All return `{ error: { code, message, details } }` format | P0 | Integration |
| TC-23-02 | 400 Bad Request format | Send invalid JSON body | Standard error JSON with validation details | P0 | Integration |
| TC-23-03 | 401 Unauthorized format | Request without JWT | Standard error JSON | P0 | Integration |
| TC-23-04 | 403 Forbidden format | Request with insufficient role | Standard error JSON | P0 | Integration |
| TC-23-05 | 404 Not Found format | Request non-existent resource | Standard error JSON | P0 | Integration |
| TC-23-06 | 500 Internal Server Error format | Trigger server error (e.g., DB down) | Standard error JSON, no stack trace leaked | P0 | Security |
| TC-23-07 | Structured logging format | Check server logs | JSON-formatted log entries with timestamp, level, message, request_id | P0 | Integration |
| TC-23-08 | No panics in production | Trigger edge cases (null input, overflow) | Graceful error response, no process crash | P0 | Integration |
| TC-23-09 | Error details don't leak internals | Trigger DB error | Error message does not include SQL, table names, or file paths | P0 | Security |
| TC-23-10 | Request ID in error responses | Trigger any error | Error response includes `X-Request-Id` header for correlation | P1 | Integration |

---

## Test Case Summary

| Feature | Total Test Cases | P0 | P1 | P2 | Security |
|---------|-----------------|----|----|----|---------|
| P0-1: Compilation & Startup | 10 | 7 | 3 | 0 | 0 |
| P0-2: Database Migrations | 12 | 10 | 1 | 0 | 0 |
| P0-3: Authentication | 26 | 20 | 0 | 0 | 6 |
| P0-4: User Management | 12 | 8 | 1 | 0 | 3 |
| P0-5: Post Management | 19 | 15 | 2 | 0 | 2 |
| P0-6: Page Management | 9 | 9 | 0 | 0 | 0 |
| P0-7: Media Library | 14 | 11 | 1 | 0 | 2 |
| P0-8: Comments System | 13 | 10 | 1 | 0 | 2 |
| P0-9: Taxonomy System | 12 | 12 | 0 | 0 | 0 |
| P0-10: Theme System | 11 | 10 | 0 | 0 | 1 |
| P0-11: Plugin System | 10 | 8 | 0 | 0 | 2 |
| P0-12: Admin UI Integration | 12 | 10 | 0 | 1 | 0 |
| P0-13: Public Frontend | 15 | 14 | 0 | 0 | 1 |
| P0-14: Settings Management | 11 | 9 | 0 | 0 | 2 |
| P0-15: Menu Management | 10 | 10 | 0 | 0 | 0 |
| P0-16: Search | 8 | 5 | 1 | 0 | 2 |
| P0-17: Cache System | 7 | 7 | 0 | 0 | 0 |
| P0-18: Email System | 7 | 5 | 0 | 0 | 2 |
| P0-19: Docker Deployment | 9 | 7 | 1 | 0 | 1 |
| P0-20: Dashboard Accuracy | 7 | 7 | 0 | 0 | 0 |
| P0-21: Widget System | 8 | 8 | 0 | 0 | 0 |
| P0-22: CLI Tools | 8 | 6 | 1 | 0 | 0 |
| P0-23: Error Handling | 10 | 8 | 1 | 0 | 1 |
| **TOTAL** | **260** | **216** | **13** | **1** | **27** |

---

*End of Test Cases*
