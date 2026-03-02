# RustPress CMS -- Engineering Handoff

> **Document Owner**: PM (Project Manager)
> **Date**: 2026-03-02
> **Version**: 1.0
> **Status**: FINAL
> **Wave**: 5 (Final Reporting)
> **Audience**: Engineering team executing the development work

---

## How to Use This Document

This document is the engineering team's roadmap from the current state (non-functional, blocked by critical bugs) to production readiness (v1.0.0). It is organized into 5 phases, each with:

- **Tasks**: Specific work items with file paths
- **Estimated Hours**: Per task and per phase
- **Dependencies**: What must be done before this task
- **Success Criteria**: How to verify the task is complete

**Start with Phase 1.** Each phase unblocks the next. Do not skip phases.

**Reference documents** (read these alongside this handoff):
- `BUG_REPORT.md` -- detailed bug descriptions with exact file locations
- `TEST_CASES.md` -- 260 ready-to-implement test cases
- `API_DESIGN.md` -- complete endpoint inventory
- `AUTH_FLOW.md` -- authentication module documentation
- `DB_SCHEMA.md` -- database table inventory
- `COMPILER_AUDIT.md` -- compilation error details

---

## Phase 1: Fix All CRITICAL/BLOCKER Issues (Week 1)

**Goal**: Backend compiles, frontend connects to backend, users can authenticate.
**Estimated Total Effort**: 12-18 hours
**Success Criteria**: `cargo check` passes, login works in browser, API calls return data

### Task 1.1: Fix Missing Pageforge Crate (BUG-001)

**Priority**: CRITICAL -- unblocks ALL backend work
**Effort**: 30 minutes
**Dependencies**: None
**Owner**: Backend Engineer

**Steps:**

Option A (Recommended -- preserves existing references):
1. Create directory `plugins/pageforge/`
2. Create `plugins/pageforge/Cargo.toml`:
   ```toml
   [package]
   name = "pageforge"
   version = "0.1.0"
   edition = "2021"

   [dependencies]
   rustpress-core = { path = "../../crates/rustpress-core" }
   axum = { workspace = true }
   ```
3. Create `plugins/pageforge/src/lib.rs`:
   ```rust
   use axum::Router;

   pub fn build_pageforge_router<S: Clone + Send + Sync + 'static>(_state: &S) -> Router<S> {
       Router::new()
   }
   ```
4. Verify: `cargo check --workspace` no longer fails with "os error 3"

Option B (Faster but may break admin UI):
1. Remove `"plugins/pageforge"` from workspace `Cargo.toml` line 28
2. Remove `pageforge = { path = "../../plugins/pageforge" }` from `crates/rustpress-server/Cargo.toml` line 22
3. Comment out `build_pageforge_router(&state)` call in `routes.rs`
4. Note: The admin UI has `pageforgeApi.ts` which will need to be addressed later

**Success Criteria**: `cargo check --workspace` passes this specific error

---

### Task 1.2: Fix Missing Database Tables and Columns (BUG-005, BUG-006)

**Priority**: CRITICAL -- queries reference non-existent tables/columns
**Effort**: 2-3 hours
**Dependencies**: None (parallel with Task 1.1)
**Owner**: Backend Engineer

**Steps:**

1. Create `migrations/00031_add_deleted_at_columns.sql`:
   ```sql
   ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
   ALTER TABLE menus ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
   CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);
   CREATE INDEX IF NOT EXISTS idx_menus_deleted_at ON menus(deleted_at);
   ```

2. Create `migrations/00032_add_missing_tables.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS backups (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(255) NOT NULL,
       backup_type VARCHAR(50) NOT NULL DEFAULT 'full',
       file_size BIGINT DEFAULT 0,
       file_path TEXT,
       status VARCHAR(50) NOT NULL DEFAULT 'pending',
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       completed_at TIMESTAMPTZ,
       created_by UUID REFERENCES users(id)
   );

   CREATE TABLE IF NOT EXISTS backup_schedules (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(255) NOT NULL,
       schedule_type VARCHAR(50) NOT NULL,
       cron_expression VARCHAR(100),
       enabled BOOLEAN NOT NULL DEFAULT true,
       last_run TIMESTAMPTZ,
       next_run TIMESTAMPTZ,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE TABLE IF NOT EXISTS widget_areas (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       slug VARCHAR(100) NOT NULL UNIQUE,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       deleted_at TIMESTAMPTZ,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

3. Run migrations against fresh PostgreSQL 16 to verify

**Success Criteria**: All migrations execute without error; querying backup, widget_areas, posts.deleted_at, menus.deleted_at succeeds

---

### Task 1.3: Fix Default JWT Secret (BUG-003)

**Priority**: CRITICAL -- authentication bypass if not set
**Effort**: 30 minutes
**Dependencies**: Task 1.1 (must compile)
**Owner**: Backend Engineer

**Steps:**

1. Open `crates/rustpress-auth/src/jwt.rs` (around line 109)
2. Find the default JWT secret assignment (currently `"change-me-in-production"`)
3. Add a startup check:
   ```rust
   let jwt_secret = std::env::var("JWT_SECRET")
       .expect("JWT_SECRET environment variable must be set");
   if jwt_secret == "change-me-in-production" || jwt_secret.len() < 32 {
       panic!("JWT_SECRET must be set to a secure value (minimum 32 characters). Do not use the default value.");
   }
   ```
4. Update `.env.example` to include: `JWT_SECRET=your-secure-random-string-minimum-32-characters`

**Success Criteria**: Server refuses to start with default JWT secret; starts successfully with proper secret

---

### Task 1.4: Fix Default Admin Password (BUG-002 partial)

**Priority**: CRITICAL -- known password in production
**Effort**: 30 minutes
**Dependencies**: Task 1.1
**Owner**: Backend Engineer

**Steps:**

1. Open `migrations/00001_initial_schema.sql`
2. Find the admin user seed INSERT
3. Replace hardcoded password with a placeholder that the entrypoint script will override:
   - Option: Remove the password insert from migration entirely
   - Option: Add environment variable `ADMIN_PASSWORD` that the entrypoint reads
4. Update `entrypoint.sh`:
   - Remove the line that logs password to stdout (line ~142): `echo "Password: ${ADMIN_PASSWORD}"` (BUG-018)
   - Fix bcrypt vs Argon2 mismatch (BUG-017): use the RustPress application itself to hash the password

**Success Criteria**: No hardcoded password in migrations; password not logged to stdout; admin can log in with env-var-configured password

---

### Task 1.5: Restrict CORS Origins (BUG-002)

**Priority**: CRITICAL -- allows cross-site attacks
**Effort**: 1-2 hours
**Dependencies**: Task 1.1
**Owner**: Backend Engineer

**Steps:**

1. Open `crates/rustpress-server/src/middleware.rs` (around line 199)
2. Replace:
   ```rust
   CorsLayer::new().allow_origin(Any)
   ```
   With:
   ```rust
   let origins = std::env::var("CORS_ORIGINS")
       .unwrap_or_else(|_| "http://localhost:3000,http://localhost:8080".to_string());
   let origins: Vec<HeaderValue> = origins
       .split(',')
       .filter_map(|s| s.trim().parse().ok())
       .collect();
   CorsLayer::new()
       .allow_origin(origins)
       .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::PATCH])
       .allow_headers([CONTENT_TYPE, AUTHORIZATION])
       .allow_credentials(true)
   ```
3. Update `.env.example`: `CORS_ORIGINS=http://localhost:3000,http://localhost:8080`

**Success Criteria**: Cross-origin requests from non-allowed origins are rejected (403); allowed origins work normally

---

### Task 1.6: Fix Frontend URL Prefix (BUG-007)

**Priority**: CRITICAL -- all frontend API calls 404
**Effort**: 2-3 hours
**Dependencies**: None (can run parallel with backend tasks)
**Owner**: Frontend Engineer

**Steps:**

1. Open `src/api/client.ts` in the admin-ui repo
2. Update the base URL from `/api` to `/api/v1`
3. Search all files in `src/api/` for hardcoded `/api/` paths that don't include `/v1/`
4. Update `vite.config.ts` proxy configuration:
   - Verify the proxy target port matches the backend (likely 8080, not 3080)
   - Ensure the proxy forwards `/api/v1` correctly
5. Check these specific services that already use `/api/v1/` to avoid double-prefixing:
   - `analyticsApi` -- already uses `/api/v1/`
   - `chatApi` -- already uses `/api/v1/`
   - `themeService` -- already uses `/api/v1/`
6. Test by running both backend and frontend, verify network tab shows correct URLs

**Success Criteria**: All API calls from frontend hit correct backend endpoints; no 404 errors in browser console

---

### Task 1.7: Build Functional Login Page (BUG-008)

**Priority**: HIGH (blocks all user testing)
**Effort**: 4-6 hours
**Dependencies**: Task 1.6 (URL prefix must be correct)
**Owner**: Frontend Engineer

**Steps:**

1. Create `src/api/authApi.ts`:
   ```typescript
   import { apiClient } from './client';

   export const authApi = {
     login: (email: string, password: string) =>
       apiClient.post('/auth/login', { email, password }),
     register: (data: { email: string; username: string; password: string }) =>
       apiClient.post('/auth/register', data),
     refresh: (refreshToken: string) =>
       apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
     logout: () => apiClient.post('/auth/logout'),
     me: () => apiClient.get('/auth/me'),
   };
   ```

2. Create `src/store/authStore.ts`:
   ```typescript
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   import { authApi } from '../api/authApi';

   interface AuthState {
     accessToken: string | null;
     refreshToken: string | null;
     user: any | null;
     isAuthenticated: boolean;
     login: (email: string, password: string) => Promise<void>;
     logout: () => Promise<void>;
   }

   export const useAuthStore = create<AuthState>()(
     persist(
       (set) => ({
         accessToken: null,
         refreshToken: null,
         user: null,
         isAuthenticated: false,
         login: async (email, password) => {
           const response = await authApi.login(email, password);
           set({
             accessToken: response.data.access_token,
             refreshToken: response.data.refresh_token,
             isAuthenticated: true,
           });
           const userResponse = await authApi.me();
           set({ user: userResponse.data });
         },
         logout: async () => {
           try { await authApi.logout(); } catch {}
           set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
         },
       }),
       { name: 'auth-storage' }
     )
   );
   ```

3. Create `src/pages/auth/LoginPage.tsx` with:
   - Email and password input fields
   - Form submission calling `useAuthStore().login()`
   - Error display for failed attempts
   - Redirect to `/admin/dashboard` on success
   - Link to registration page

4. Update `src/App.tsx`:
   - Replace the inline `Login` stub (`<div>Login Page</div>`) with the new LoginPage component
   - Add route protection (redirect to login if not authenticated)

5. Wire JWT token into the API client interceptor:
   - Update `src/api/client.ts` to read token from authStore and add `Authorization: Bearer <token>` header

**Success Criteria**: User can enter email/password, authenticate against backend, see dashboard; unauthenticated users are redirected to login

---

### Phase 1 Summary

| Task | Bug IDs | Effort | Owner |
|------|---------|--------|-------|
| 1.1 Fix pageforge | BUG-001 | 30 min | BE |
| 1.2 Fix DB tables/columns | BUG-005, BUG-006 | 2-3 hrs | BE |
| 1.3 Fix JWT secret default | BUG-003 | 30 min | BE |
| 1.4 Fix admin password | BUG-002 (partial), BUG-017, BUG-018 | 30 min | BE |
| 1.5 Restrict CORS | BUG-002 | 1-2 hrs | BE |
| 1.6 Fix URL prefix | BUG-007 | 2-3 hrs | FE |
| 1.7 Build login page | BUG-008 | 4-6 hrs | FE |
| **Phase 1 Total** | | **12-18 hrs** | |

**Phase 1 Success Gate**: Run `cargo check --workspace`, start the server, open admin UI, log in successfully, see dashboard (even with mock data).

---

## Phase 2: Fix All HIGH Issues (Weeks 2-3)

**Goal**: Security hardened, CI functional, stub pages replaced, Docker improved.
**Estimated Total Effort**: 50-70 hours
**Success Criteria**: RBAC enforced, CI passes on both repos, core admin pages functional

### Backend Security (16-22 hours)

| Task | Bug ID | Description | File | Effort |
|------|--------|-------------|------|--------|
| 2.1 | BUG-004 | Add RBAC middleware to all 22 unprotected route groups | `routes.rs` (all route group definitions) | 2-3 hrs |
| 2.2 | BUG-015 | Wire CSRF middleware into middleware stack | `crates/rustpress-auth/src/csrf.rs` -> `app.rs` | 2-3 hrs |
| 2.3 | BUG-014 | Move refresh tokens from in-memory to PostgreSQL/Redis | `crates/rustpress-auth/src/refresh_token.rs` | 2-4 hrs |
| 2.4 | BUG-016 | Tighten CSP (remove unsafe-inline/eval where possible) | `crates/rustpress-server/src/middleware.rs` | 3-5 hrs |
| 2.5 | BUG-022 | Enable bot detection blocking by default | `crates/rustpress-server/src/security/bot_detection.rs` | 30 min |
| 2.6 | BUG-023 | Persist security audit log to database | `crates/rustpress-server/src/security/security_audit.rs` | 3-4 hrs |
| 2.7 | BUG-024 | Move rate limiter to Redis for distributed environments | `crates/rustpress-server/src/middleware.rs` | 3-4 hrs |

**Task 2.1 Detail (RBAC):**
- The `auth_middleware` already extracts the user role from the JWT
- Create a `require_role()` middleware function that checks the extracted role
- Apply `require_role("administrator")` to: plugin management, theme management, user management, settings, backups, CDN, cache, file system, git routes
- Apply `require_role("editor")` or higher to: post management, page management, media management, comment moderation
- Leave public endpoints (auth, health, public content) unprotected

### Backend API Fixes (7-10 hours)

| Task | Bug ID | Description | File | Effort |
|------|--------|-------------|------|--------|
| 2.8 | BUG-011 | Fix stats endpoints to return real data | `routes.rs` stats handlers | 3-4 hrs |
| 2.9 | BUG-012 | Wire Prometheus metrics crate to /metrics | `routes.rs`, metrics module | 4-6 hrs |

### Backend Database Fixes (4-6 hours)

| Task | Bug ID | Description | File | Effort |
|------|--------|-------------|------|--------|
| 2.10 | BUG-025 | Fix migration 00030 DROP CASCADE | `migrations/00030_media_library.sql` | 2-3 hrs |
| 2.11 | BUG-027 | Write DOWN migration scripts for all 10 migrations | `migrations/` directory | 4-6 hrs |

### CI/CD Fixes (4-6 hours)

| Task | Bug ID | Description | File | Effort |
|------|--------|-------------|------|--------|
| 2.12 | BUG-019 | Fix backend CI clippy (remove -A flags) | `.github/workflows/ci.yml` | 15 min |
| 2.13 | BUG-020 | Remove RUSTFLAGS warning suppression | `.github/workflows/ci.yml` + fix ~400-750 warnings in source | 4-8 hrs |
| 2.14 | BUG-021 | Create frontend CI pipeline | `admin-ui/.github/workflows/ci.yml` | 2-3 hrs |
| 2.15 | BUG-034 | Update CI PostgreSQL from 15 to 16 | `.github/workflows/ci.yml` | 15 min |

**Task 2.14 Detail (Frontend CI):**
Create `.github/workflows/ci.yml` in the admin-ui repo:
```yaml
name: Frontend CI
on: [push, pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test -- --coverage
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm audit --audit-level=high
```

### Docker Fixes (2-3 hours)

| Task | Bug ID | Description | File | Effort |
|------|--------|-------------|------|--------|
| 2.16 | BUG-033 | Add non-root user to Dockerfile | `Dockerfile` | 1 hr |
| 2.17 | -- | Create .dockerignore | `.dockerignore` | 15 min |
| 2.18 | -- | Create production docker-compose.yml | `docker-compose.prod.yml` | 1-2 hrs |

### Frontend Page Fixes (15-20 hours)

| Task | Bug ID | Description | Effort |
|------|--------|-------------|--------|
| 2.19 | BUG-009 (partial) | Extract 13 inline stub pages from App.tsx to separate files | 4-6 hrs |
| 2.20 | BUG-010 | Connect dashboard to real /api/v1/stats endpoint | 4-6 hrs |
| 2.21 | BUG-037 | Add test dependencies to package.json | 2-4 hrs |
| 2.22 | BUG-038 | Refactor App.tsx (extract inline components) | 4-6 hrs |

**Task 2.21 Detail (Test Dependencies):**
Add to `package.json` devDependencies:
```json
{
  "vitest": "^3.0.0",
  "@vitest/coverage-v8": "^3.0.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "jsdom": "^25.0.0",
  "msw": "^2.0.0",
  "@playwright/test": "^1.49.0",
  "@axe-core/playwright": "^4.10.0"
}
```
Add scripts:
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```
Create `vitest.config.ts` and `playwright.config.ts`.

### Phase 2 Summary

| Category | Tasks | Effort |
|----------|-------|--------|
| Backend Security | 2.1-2.7 | 16-22 hrs |
| Backend API | 2.8-2.9 | 7-10 hrs |
| Backend Database | 2.10-2.11 | 4-6 hrs |
| CI/CD | 2.12-2.15 | 4-8 hrs |
| Docker | 2.16-2.18 | 2-3 hrs |
| Frontend | 2.19-2.22 | 15-20 hrs |
| **Phase 2 Total** | | **48-69 hrs** |

**Phase 2 Success Gate**: `cargo clippy -- -D warnings` passes (after warning fixes); all admin routes enforce RBAC; frontend CI passes; dashboard shows real data; test dependencies installed.

---

## Phase 3: Implement Missing P0 Features (Weeks 3-4)

**Goal**: All core CMS features operational through the admin UI.
**Estimated Total Effort**: 80-120 hours
**Success Criteria**: All 23 P0 features from strategy are functional end-to-end

### Feature Stubs to Complete

These features have backend code but the frontend pages are stubs with hardcoded data:

| Task | Feature | Current State | Work Required | Effort |
|------|---------|--------------|---------------|--------|
| 3.1 | Pages management | Stub (4 hardcoded pages) | Create API module, connect to store, build CRUD UI | 8-12 hrs |
| 3.2 | Media library | Stub (12 empty squares) | Create upload UI, connect to /media API, display real media | 8-12 hrs |
| 3.3 | Comments moderation | Stub (2 hardcoded comments) | Create API module, build moderation UI, threading | 8-12 hrs |
| 3.4 | Themes management | Stub (4 hardcoded themes) | Connect to /themes API, theme switching, preview | 6-8 hrs |
| 3.5 | Users management | Stub (3 hardcoded users) | Create list/create/edit UI, role assignment | 6-8 hrs |
| 3.6 | Settings pages | Stub (static form) | Connect to /settings API, group tabs, save/load | 6-8 hrs |
| 3.7 | Categories | Stub (EmptyState) | Create CRUD UI, hierarchical tree, post assignment | 6-8 hrs |
| 3.8 | Tags | Stub (EmptyState) | Create CRUD UI, tag cloud, post assignment | 4-6 hrs |
| 3.9 | Widgets | Stub ("coming soon") | Create widget area UI, drag-and-drop ordering | 6-8 hrs |
| 3.10 | Theme editor | Stub ("coming soon") | Connect to file editing API, Monaco Editor integration | 4-6 hrs |
| 3.11 | Roles management | Stub (4 hardcoded roles) | Connect to roles API, permission matrix | 4-6 hrs |
| 3.12 | Menu management | Already more developed | Wire remaining API connections, nesting UI | 4-6 hrs |
| 3.13 | Search functionality | Exists in backend | Create search UI in admin, connect to /search API | 3-4 hrs |

### Missing API Modules (Frontend)

7 core API modules need to be created in `src/api/`:

| Module | Endpoints | Effort |
|--------|-----------|--------|
| `pagesApi.ts` | CRUD pages, hierarchy, templates | 2-3 hrs |
| `commentsApi.ts` | CRUD comments, moderation, threading, likes | 2-3 hrs |
| `settingsApi.ts` | Read/write all settings groups | 1-2 hrs |
| `menusApi.ts` | CRUD menus, items, nesting, theme locations | 2-3 hrs |
| `widgetsApi.ts` | CRUD widgets, areas, ordering | 1-2 hrs |
| `pluginsApi.ts` | List, activate, deactivate, settings, install | 2-3 hrs |
| `searchApi.ts` | Search posts, pages, media with filters | 1-2 hrs |

### Phase 3 Summary

| Category | Tasks | Effort |
|----------|-------|--------|
| Stub page replacement (13 pages) | 3.1-3.13 | 70-96 hrs |
| Missing API modules (7 modules) | -- | 12-18 hrs |
| **Phase 3 Total** | | **82-114 hrs** |

**Phase 3 Success Gate**: Every admin page makes real API calls (zero mock data in production build). All CRUD operations work through the UI. `grep -r "Math.random\|hardcoded\|mock" src/` returns zero results in production code.

---

## Phase 4: Testing to Coverage Targets (Weeks 4-6)

**Goal**: Achieve 80% backend / 70% frontend test coverage.
**Estimated Total Effort**: 130-180 hours
**Success Criteria**: `cargo tarpaulin` >= 80%, `vitest --coverage` >= 70%, all P0 E2E flows green

### Backend Testing Plan (16-22 days / 128-176 hours)

#### 4.1 Establish Baseline (1 day)

1. Run `cargo test --all-features` -- record how many of ~500 existing tests pass
2. Run `cargo tarpaulin --all-features` -- measure baseline coverage
3. Fix any broken existing tests (expected: some will fail due to missing tables, etc.)

#### 4.2 Core Unit Tests (5-7 days)

Write unit tests for these priority crates:

| Crate | Target Coverage | Key Test Areas | Effort |
|-------|----------------|---------------|--------|
| rustpress-auth | 85% | JWT creation/validation, password hashing, role checks, session management | 2-3 days |
| rustpress-database | 85% | Repository CRUD for all entities, query correctness, error handling | 2-3 days |
| rustpress-core | 80% | Type conversions, validation, configuration parsing | 1 day |
| rustpress-content | 80% | Post/page/comment models, slug generation, revision tracking | 1-2 days |

#### 4.3 Integration Tests (5-7 days)

Write integration tests using `axum-test` or `reqwest` against a real running server with PostgreSQL:

| Feature | Test Cases (from TEST_CASES.md) | Effort |
|---------|-------------------------------|--------|
| Authentication (TC-3-*) | 26 test cases | 1-2 days |
| User Management (TC-4-*) | 10 test cases | 0.5-1 day |
| Post Management (TC-5-*) | 15+ test cases | 1-2 days |
| Page Management (TC-6-*) | 10+ test cases | 0.5-1 day |
| Media Pipeline (TC-7-*) | 10+ test cases | 1 day |
| Comments (TC-8-*) | 12+ test cases | 0.5-1 day |
| Taxonomy (TC-9-*) | 10+ test cases | 0.5 day |
| Settings, Menus, Widgets | 20+ test cases | 1-2 days |

#### 4.4 Edge Cases and Error Paths (3-4 days)

- Validation failures (invalid input, missing required fields)
- Authentication failures (expired tokens, revoked tokens, wrong passwords)
- Authorization failures (wrong role accessing admin endpoints)
- Database failures (connection errors, constraint violations, concurrent access)
- Rate limiting triggers

#### 4.5 Database Migration Tests (2-3 days)

- UP migration for each of 10+ migration files on fresh database
- DOWN migration for each file (requires Phase 2 Task 2.11)
- Idempotency test (run all migrations twice)
- Data integrity after migration (verify FK constraints, indexes)

### Frontend Testing Plan (13-18 days / 104-144 hours)

#### 4.6 Store Unit Tests (2-3 days)

Write Vitest tests for all 14 Zustand stores:

| Store | Key Test Areas | Effort |
|-------|---------------|--------|
| authStore | Login, logout, token refresh, error handling | 3-4 hrs |
| postStore | CRUD operations, pagination, filters | 3-4 hrs |
| dashboardStore | Data fetching, metric calculations | 2-3 hrs |
| pluginStore | Activate, deactivate, settings | 2-3 hrs |
| themeStore | Theme switching, settings persistence | 2-3 hrs |
| Remaining 9 stores | CRUD patterns, error states | 6-9 hrs |

#### 4.7 API Client Tests (0.5 day)

- JWT interceptor adds Authorization header
- 401 response triggers token refresh
- Network error handling
- Request/response transformation

#### 4.8 Core Component Tests (3-4 days)

Write RTL tests for the top 30 most-used design system components:
- Form components (Input, Select, TextArea, Toggle, Checkbox)
- Layout components (PageHeader, Sidebar, Breadcrumb, Tabs)
- Data display (Table, Card, Badge, Avatar, Stat)
- Feedback (Toast, Modal, Alert, Spinner)
- Navigation (Button, Link, Menu, Dropdown)

#### 4.9 Page Tests (2-3 days)

Write RTL + MSW tests for critical admin pages:
- Login page (form submission, error display, redirect)
- Dashboard (data loading, metric rendering)
- Post list (CRUD, pagination, filters)
- Post editor (form fields, save, publish)
- Media library (upload, grid, search)

#### 4.10 E2E Tests with Playwright (3-4 days)

Write and verify all critical user flows:

| Flow | Steps | Priority |
|------|-------|----------|
| Login -> Dashboard -> Logout | Enter credentials, verify dashboard loads, click logout | P0 |
| Create Post -> Edit -> Publish | New post, add title/content, save draft, publish | P0 |
| Upload Media -> Assign to Post | Upload image, verify in library, insert into post | P0 |
| Plugin lifecycle | List plugins, activate, configure, deactivate | P0 |
| Theme switch | List themes, activate different theme, verify change | P0 |
| User management | Create user, assign role, verify permissions | P0 |
| Settings | Change site title, save, verify persistence | P0 |
| Comment moderation | Approve, spam, trash comments | P0 |

#### 4.11 TypeScript Strict Mode (5-7 days)

Enable strict mode incrementally per the TypeScript Audit migration strategy:
1. Phase 1: `strictNullChecks` (fixes ~400 errors)
2. Phase 2: `noImplicitAny` (fixes ~300 errors)
3. Phase 3: `strictFunctionTypes` (fixes ~100 errors)
4. Phase 4: `strictPropertyInitialization` (fixes ~150 errors)
5. Phase 5: `noImplicitReturns` (fixes ~50 errors)
6. Phase 6: Full `strict: true` (fixes remaining ~57 errors)

### Phase 4 Summary

| Category | Tasks | Effort |
|----------|-------|--------|
| Backend baseline + fixes | 4.1 | 8 hrs |
| Backend unit tests | 4.2 | 40-56 hrs |
| Backend integration tests | 4.3 | 32-48 hrs |
| Backend edge cases | 4.4 | 24-32 hrs |
| Backend migration tests | 4.5 | 16-24 hrs |
| Frontend store tests | 4.6 | 16-24 hrs |
| Frontend API client tests | 4.7 | 4 hrs |
| Frontend component tests | 4.8 | 24-32 hrs |
| Frontend page tests | 4.9 | 16-24 hrs |
| Frontend E2E tests | 4.10 | 24-32 hrs |
| TypeScript strict mode | 4.11 | 40-56 hrs |
| **Phase 4 Total** | | **244-340 hrs** |

**Phase 4 Success Gate**: `cargo tarpaulin` reports >= 80%; `vitest --coverage` reports >= 70%; all Playwright E2E flows green; `npx tsc --noEmit --strict` passes with zero errors.

---

## Phase 5: Production Hardening (Weeks 6-7)

**Goal**: Security validated, performance verified, documentation complete, deployment verified.
**Estimated Total Effort**: 40-60 hours
**Success Criteria**: Zero CRITICAL/HIGH vulnerabilities, 5K req/s sustained, Docker deployment works on clean machine

### Security Validation (8-12 hours)

| Task | Description | Effort |
|------|-------------|--------|
| 5.1 | Run `cargo audit` -- fix any CRITICAL/HIGH | 2-4 hrs |
| 5.2 | Run `npm audit` -- fix any CRITICAL/HIGH | 1-2 hrs |
| 5.3 | Run OWASP ZAP scan against running instance | 3-4 hrs |
| 5.4 | Verify RBAC enforcement manually (try subscriber accessing admin routes) | 1-2 hrs |

### Performance Testing (8-12 hours)

| Task | Description | Target | Effort |
|------|-------------|--------|--------|
| 5.5 | k6 load test: sustained throughput | 5,000 req/s for 60s | 3-4 hrs |
| 5.6 | k6 soak test: memory stability | 1,000 req/s for 1 hr, no leaks | 3-4 hrs |
| 5.7 | Lighthouse audit on admin UI | LCP < 2.0s, Accessibility > 90 | 1-2 hrs |
| 5.8 | Measure server startup time | < 3 seconds | 30 min |
| 5.9 | Measure Docker image size | < 100MB | 30 min |

### Documentation (12-16 hours)

| Task | Description | Effort |
|------|-------------|--------|
| 5.10 | Write README: installation, configuration, first-post tutorial | 4-6 hrs |
| 5.11 | Generate and validate OpenAPI specification | 3-4 hrs |
| 5.12 | Write plugin development guide | 3-4 hrs |
| 5.13 | Write theme development guide | 3-4 hrs |
| 5.14 | Verify `.env.example` files have all required variables | 1 hr |

### Deployment Verification (6-8 hours)

| Task | Description | Effort |
|------|-------------|--------|
| 5.15 | Test `docker-compose up` on clean machine | 2-3 hrs |
| 5.16 | Verify Redis failure fallback (shutdown Redis, test moka) | 2-3 hrs |
| 5.17 | Test email system (SMTP config, password reset, notifications) | 2-3 hrs |
| 5.18 | Verify all 14 CLI command groups | 2-3 hrs |

### Evidence Generation (4-6 hours)

| Task | Description | Effort |
|------|-------------|--------|
| 5.19 | Generate and store backend coverage report | 1 hr |
| 5.20 | Generate and store frontend coverage report | 1 hr |
| 5.21 | Generate and store Playwright E2E report | 1 hr |
| 5.22 | Generate and store k6 load test results | 1 hr |
| 5.23 | Generate and store security audit reports | 1 hr |
| 5.24 | Write CHANGELOG.md for v1.0.0 | 1-2 hrs |

### Phase 5 Summary

| Category | Tasks | Effort |
|----------|-------|--------|
| Security validation | 5.1-5.4 | 8-12 hrs |
| Performance testing | 5.5-5.9 | 8-12 hrs |
| Documentation | 5.10-5.14 | 14-19 hrs |
| Deployment verification | 5.15-5.18 | 8-12 hrs |
| Evidence generation | 5.19-5.24 | 5-8 hrs |
| **Phase 5 Total** | | **43-63 hrs** |

**Phase 5 Success Gate**: `cargo audit` and `npm audit` report zero CRITICAL/HIGH; k6 shows 5K req/s with P95 < 100ms; `docker-compose up` produces working site on clean machine; all documentation reviewed and complete; v1.0.0 tag ready to apply.

---

## Total Effort Summary

| Phase | Duration | Effort | Key Outcome |
|-------|----------|--------|-------------|
| Phase 1: Fix CRITICAL bugs | Week 1 | 12-18 hrs | Backend compiles, login works, APIs connect |
| Phase 2: Fix HIGH issues | Weeks 2-3 | 48-69 hrs | Security hardened, CI functional, stubs extracted |
| Phase 3: Missing P0 features | Weeks 3-4 | 82-114 hrs | All core CMS features operational |
| Phase 4: Testing | Weeks 4-6 | 244-340 hrs | 80% backend, 70% frontend coverage |
| Phase 5: Production hardening | Weeks 6-7 | 43-63 hrs | Deployable, documented, performant |
| **TOTAL** | **7 weeks** | **429-604 hrs** | **v1.0.0 production ready** |

### Parallelism Opportunities

- Phase 1: Backend tasks (1.1-1.5) and frontend tasks (1.6-1.7) can run in parallel
- Phase 2: Backend security (2.1-2.7), CI/CD (2.12-2.15), Docker (2.16-2.18), and frontend (2.19-2.22) can run in parallel
- Phase 3: Different frontend pages can be built in parallel by multiple engineers
- Phase 4: Backend tests and frontend tests can be written in parallel
- Phase 5: Security, performance, documentation, and deployment can overlap

### Team Size Impact

| Team Size | Estimated Duration | Notes |
|-----------|-------------------|-------|
| 1 engineer | 11-15 weeks | All sequential |
| 2 engineers (BE + FE) | 7-10 weeks | Backend and frontend in parallel |
| 3 engineers (BE + FE + QA) | 5-7 weeks | Testing overlaps with feature work |
| 4+ engineers | 4-6 weeks | Diminishing returns due to coordination overhead |

---

## Appendix A: Bug Reference Quick-Lookup

| Bug ID | Severity | Phase | Task | One-Line Summary |
|--------|----------|-------|------|-----------------|
| BUG-001 | CRITICAL | 1 | 1.1 | Missing pageforge crate blocks compilation |
| BUG-002 | CRITICAL | 1 | 1.5 | CORS allows Any origin |
| BUG-003 | CRITICAL | 1 | 1.3 | Default JWT secret forgeable |
| BUG-004 | CRITICAL | 2 | 2.1 | No RBAC on 22/24 route groups |
| BUG-005 | CRITICAL | 1 | 1.2 | Missing backups/widget_areas tables |
| BUG-006 | CRITICAL | 1 | 1.2 | Missing deleted_at columns |
| BUG-007 | CRITICAL | 1 | 1.6 | Frontend URL prefix mismatch |
| BUG-008 | HIGH | 1 | 1.7 | Login page is stub |
| BUG-009 | HIGH | 3 | 3.1-3.13 | 13 pages are stubs |
| BUG-010 | HIGH | 2 | 2.20 | Dashboard 100% mock data |
| BUG-011 | HIGH | 2 | 2.8 | Stats endpoints return fake data |
| BUG-012 | HIGH | 2 | 2.9 | Prometheus metrics stubbed |
| BUG-013 | HIGH | 3 | -- | Search reindex stubbed |
| BUG-014 | HIGH | 2 | 2.3 | Refresh tokens in-memory only |
| BUG-015 | HIGH | 2 | 2.2 | CSRF middleware not applied |
| BUG-016 | HIGH | 2 | 2.4 | CSP allows unsafe-inline/eval |
| BUG-017 | HIGH | 1 | 1.4 | Entrypoint uses bcrypt vs Argon2 |
| BUG-018 | HIGH | 1 | 1.4 | Admin password logged to stdout |
| BUG-019 | HIGH | 2 | 2.12 | CI clippy suppresses all lints |
| BUG-020 | HIGH | 2 | 2.13 | CI RUSTFLAGS suppress 6 categories |
| BUG-021 | HIGH | 2 | 2.14 | No frontend CI pipeline |
| BUG-022 | HIGH | 2 | 2.5 | Bot detection log-only |
| BUG-023 | HIGH | 2 | 2.6 | Security audit log in-memory |
| BUG-024 | HIGH | 2 | 2.7 | Rate limiter per-instance |
| BUG-025 | HIGH | 2 | 2.10 | Migration DROP CASCADE |
| BUG-026 | MEDIUM | 4 | 4.11 | TypeScript strict mode disabled |
| BUG-027 | MEDIUM | 2 | 2.11 | No DOWN migrations |
| BUG-028 | MEDIUM | 2 | -- | Migration numbering gap |
| BUG-029 | MEDIUM | 2 | -- | Missing FK on featured_image_id |
| BUG-030 | MEDIUM | 2 | -- | No request timeout middleware |
| BUG-031 | MEDIUM | 2 | -- | IP extraction trusts X-Forwarded-For |
| BUG-032 | MEDIUM | 3 | -- | No chat message sanitization |
| BUG-033 | MEDIUM | 2 | 2.16 | Docker runs as root |
| BUG-034 | MEDIUM | 2 | 2.15 | CI uses PostgreSQL 15 not 16 |
| BUG-035 | MEDIUM | 4 | -- | Missing composite indexes |
| BUG-036 | MEDIUM | 2 | -- | No token revocation check |
| BUG-037 | MEDIUM | 2 | 2.21 | Zero frontend test dependencies |
| BUG-038 | MEDIUM | 2 | 2.22 | App.tsx 917 lines, 13 inline components |
| BUG-039 | MEDIUM | 5 | -- | HSTS sent unconditionally |
| BUG-040 | MEDIUM | 5 | -- | No plugin integrity verification |
| BUG-041 | LOW | 4 | -- | 42 missing aria-labels |
| BUG-042 | LOW | 5 | -- | Config file JWT secret in plaintext |
| BUG-043 | LOW | 2 | -- | Git/File API expose internals |
| BUG-044 | LOW | 3 | -- | 19 CRM/Enterprise pages not routed |
| BUG-045 | LOW | 5 | -- | Cross-origin policies may break CDN |

---

## Appendix B: Key File Paths

### Backend (`rustpress-core-base`)

| File | Purpose | Size | Notes |
|------|---------|------|-------|
| `Cargo.toml` | Workspace manifest | -- | Line 28: pageforge reference |
| `crates/rustpress-server/Cargo.toml` | Server crate deps | -- | Line 22: pageforge dependency |
| `crates/rustpress-server/src/routes.rs` | ALL route definitions | 272KB | Central file -- contains ~240 endpoint handlers |
| `crates/rustpress-server/src/middleware.rs` | Middleware stack | -- | CORS (line 199), rate limiter, security headers |
| `crates/rustpress-server/src/app.rs` | Application builder | -- | Middleware wiring point |
| `crates/rustpress-auth/src/jwt.rs` | JWT handling | -- | Line 109: default secret |
| `crates/rustpress-auth/src/csrf.rs` | CSRF module | -- | Exists but not wired |
| `crates/rustpress-auth/src/refresh_token.rs` | Refresh token store | -- | In-memory HashMap |
| `crates/rustpress-database/src/repository.rs` | Data access layer | 75KB | All DB queries |
| `migrations/` | Database migrations | -- | 10 files, gaps 00002->00023 |
| `entrypoint.sh` | Docker entrypoint | -- | Line 119: bcrypt, line 142: password log |
| `.github/workflows/ci.yml` | Backend CI | -- | Line 12: RUSTFLAGS suppression |

### Frontend (`rustpress-core-admin-ui`)

| File | Purpose | Size | Notes |
|------|---------|------|-------|
| `src/App.tsx` | Route definitions | 917 lines | 13 inline stub components |
| `src/api/client.ts` | API client | -- | Base URL needs /api/v1 |
| `vite.config.ts` | Dev server config | -- | Proxy configuration |
| `tsconfig.json` | TypeScript config | -- | strict: false |
| `package.json` | Dependencies | -- | Zero test dependencies |
| `src/store/` | Zustand stores | -- | 14 stores, some with mock data |
| `src/pages/enterprise/Dashboard.tsx` | Dashboard | -- | Uses mock data store |

---

*Generated by PM -- Wave 5 Final Reporting (2026-03-02)*
