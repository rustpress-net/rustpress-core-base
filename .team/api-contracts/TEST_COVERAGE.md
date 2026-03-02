# Test Coverage Assessment - RustPress CMS v0.4.0

> **Author**: Backend Engineer (BE)
> **Date**: 2026-03-02
> **Branch**: `ai-develop`
> **Target**: 80% line coverage (cargo-tarpaulin)
> **Status**: Wave 2 Research

---

## 1. Executive Summary

The RustPress backend has **significantly more testing infrastructure than initially reported** in the strategy document. While the strategy states "only 1 integration test file exists," the actual codebase contains:

- **202 source files** with `#[cfg(test)]` modules containing inline unit tests
- **4 integration test files** in `crates/*/tests/` directories
- **12 integration test files** in `plugins/rustanalytics/tests/`
- **Total estimated test functions**: ~500+ across all crates and plugins

However, **none of these tests can currently run** because the workspace fails to compile (missing `pageforge` crate). The quality and accuracy of these tests is unknown until compilation is restored.

---

## 2. Existing Test Files

### 2.1 Integration Tests (External `tests/` Directories)

| Crate | File | Lines | Est. Tests |
|-------|------|-------|------------|
| rustpress-database | `tests/persistence_tests.rs` | 597 | 15 |
| rustpress-editor | `tests/comprehensive_tests.rs` | 1,867 | ~40 |
| rustpress-editor | `tests/editor_tests.rs` | 1,686 | ~35 |
| rustpress-editor | `tests/ide_tests.rs` | 3,798 | ~80 |
| **Subtotal** | | **7,948** | **~170** |

### 2.2 Plugin Tests

| Plugin | File | Lines | Est. Tests |
|--------|------|-------|------------|
| rustanalytics | `acquisition_models_test.rs` | 2,131 | ~40 |
| rustanalytics | `admin_test.rs` | 1,061 | ~20 |
| rustanalytics | `analytics_service_test.rs` | 2,362 | ~45 |
| rustanalytics | `behavior_models_test.rs` | 1,943 | ~35 |
| rustanalytics | `cache_service_test.rs` | 761 | ~15 |
| rustanalytics | `client_service_test.rs` | 2,562 | ~50 |
| rustanalytics | `conversions_models_test.rs` | 1,854 | ~35 |
| rustanalytics | `ecommerce_models_test.rs` | 1,802 | ~35 |
| rustanalytics | `ga_client_integration.rs` | 1,119 | ~20 |
| rustanalytics | `handlers_test.rs` | 1,004 | ~20 |
| rustanalytics | `realtime_service_test.rs` | 3,028 | ~55 |
| rustanalytics | `reports_service_test.rs` | 1,028 | ~20 |
| rustanalytics | `sync_service_test.rs` | 899 | ~18 |
| **Subtotal** | | **21,554** | **~408** |

### 2.3 Inline Unit Tests (Inside Source Files)

The following files contain `#[cfg(test)]` modules with `#[test]` or `#[tokio::test]` annotations:

#### rustpress-auth (19 source files, all with tests)
| File | Test Count |
|------|-----------|
| `api_key.rs` | 3 |
| `audit.rs` | 4 |
| `brute_force.rs` | 3 |
| `csrf.rs` | 7 |
| `impersonation.rs` | 4 |
| `ip_filter.rs` | 6 |
| `jwt.rs` | (see below) |
| `middleware.rs` | (in test module) |
| `oauth2_client.rs` | (in test module) |
| `oauth2_provider.rs` | (in test module) |
| `password.rs` | (in test module) |
| `permission.rs` | (in test module) |
| `rate_limit.rs` | (in test module) |
| `refresh_token.rs` | (in test module) |
| `session.rs` | (in test module) |
| `tokens.rs` | 2 |
| `totp.rs` | 4 |
| `webauthn.rs` | 3 |

#### rustpress-core (15+ source files with tests)
| File | Test Count |
|------|-----------|
| `api.rs` | 5 |
| `config.rs` | 3 |
| `context.rs` | 4 |
| `discovery.rs` | 2 |
| `error.rs` | 3 |
| `health.rs` | 3 |
| `hook.rs` | (in test module) |
| `id.rs` | (in test module) |
| `middleware.rs` | (in test module) |
| `plugin.rs` | (in test module) |
| `plugin_loader.rs` | (in test module) |
| `repository.rs` | (in test module) |
| `service.rs` | (in test module) |
| `tenant.rs` | (in test module) |
| `types.rs` | (in test module) |

#### rustpress-content (20+ source files with tests)
| File | Test Count |
|------|-----------|
| `access.rs` | 4 |
| `autosave.rs` | 2 |
| `blocks.rs` | 3 |
| `bulk.rs` | 4 |
| `elementor.rs` | 3 |
| `excerpt.rs` | 5 |
| `featured.rs` | (in test module) |
| `fields.rs` | (in test module) |
| `i18n.rs` | (in test module) |
| `markdown.rs` | (in test module) |
| `media.rs` | (in test module) |
| `oembed.rs` | (in test module) |
| `post_type.rs` | (in test module) |
| `post_types.rs` | (in test module) |
| `related.rs` | (in test module) |
| `revision.rs` | (in test module) |
| `sanitize.rs` | (in test module) |
| `scheduling.rs` | (in test module) |
| `shortcode.rs` | (in test module) |
| `taxonomy.rs` | (in test module) |
| `toc.rs` | (in test module) |
| `trash.rs` | (in test module) |

#### Other Crates with Inline Tests
| Crate | Files with Tests | Approx. Test Count |
|-------|-----------------|-------------------|
| rustpress-cache | 3 files | 13 |
| rustpress-database | 6 files | ~30 |
| rustpress-health | 7 files | ~17 |
| rustpress-cdn | 4 files | ~8 |
| rustpress-server | 10 files | ~35 |
| rustpress-plugins | 15+ files | ~40 |
| rustpress-themes | 18 files | ~50 |
| rustpress-users | 17 files | ~80 |
| rustpress-storage | 3 files | ~11 |
| rustpress-performance | 18 files | ~50+ |
| rustpress-media | 5 files | ~10 |
| rustpress-jobs | 4 files | ~8 |
| rustpress-events | 3 files | ~6 |
| rustpress-api | 8 files | ~17 |
| rustpress-admin | 2 files | ~5 |
| rustpress-cli | 1 file | ~2 |
| rustpress-editor | 1 file (inline) + 3 test files | ~6 inline |

---

## 3. Test Coverage by Crate — Estimated Current State

| Crate | Source Files | Has Unit Tests | Has Integration Tests | Est. Coverage |
|-------|-------------|---------------|----------------------|---------------|
| rustpress-core | 15 | Yes (all) | No | 20-30% |
| rustpress-database | 10 | Yes (6/10) | Yes (1 file) | 15-25% |
| rustpress-auth | 19 | Yes (all) | No | 25-35% |
| rustpress-server | 15 | Yes (10/15) | No | 10-15% |
| rustpress-api | 8 | Yes (8/8) | No | 15-20% |
| rustpress-plugins | 17 | Yes (15+/17) | No | 20-30% |
| rustpress-themes | 18 | Yes (all) | No | 20-30% |
| rustpress-content | 22 | Yes (20+/22) | No | 20-30% |
| rustpress-users | 17 | Yes (all) | No | 25-35% |
| rustpress-cache | 3 | Yes (all) | No | 30-40% |
| rustpress-health | 7 | Yes (all) | No | 25-35% |
| rustpress-cdn | 4 | Yes (all) | No | 20-30% |
| rustpress-performance | 18 | Yes (most) | No | 15-25% |
| rustpress-media | 5 | Yes (most) | No | 15-20% |
| rustpress-storage | 3 | Yes (all) | No | 25-35% |
| rustpress-jobs | 4 | Yes (most) | No | 15-25% |
| rustpress-events | 3 | Yes (all) | No | 20-30% |
| rustpress-editor | 5 | Yes (1) | Yes (3 files) | 35-50% |
| rustpress-cli | 3+ | Yes (1) | No | 5-10% |
| rustpress-admin | 2+ | Yes (2) | No | 10-15% |
| **Estimated Weighted Average** | | | | **~20-25%** |

**Note**: These coverage estimates are rough because the tests cannot be compiled and run. Actual coverage may be higher if tests exercise significant code paths, or lower if tests are primarily structural/compilation tests.

---

## 4. Untested Areas (Critical Gaps)

### 4.1 Zero Integration Tests for P0 Features

| Feature | Crate(s) | Integration Test Status |
|---------|----------|----------------------|
| Auth flow (login/register/refresh) | rustpress-auth, rustpress-server | **None** |
| Post CRUD lifecycle | rustpress-content, rustpress-server | **None** |
| Page CRUD | rustpress-content, rustpress-server | **None** |
| Media upload pipeline | rustpress-media, rustpress-server | **None** |
| Comment moderation | rustpress-content, rustpress-server | **None** |
| Settings management | rustpress-api, rustpress-server | **None** |
| Theme activation | rustpress-themes, rustpress-server | **None** |
| Plugin lifecycle | rustpress-plugins, rustpress-server | **None** |
| Menu/widget management | rustpress-server | **None** |
| Search functionality | rustpress-server | **None** |
| Email sending | rustpress-server | **None** |
| Cache invalidation | rustpress-cache | **None** |
| WebSocket collaboration | rustpress-server | **None** |

### 4.2 Untested Handler Code

The `routes.rs` file (8036 lines) contains all HTTP handlers. With only structural tests in `rustpress-server`, the actual request/response cycle is entirely untested. This is the largest single gap because:
- It contains raw SQL queries that may not match the actual schema
- Error handling paths are not verified
- Authentication extraction is not tested
- Response format compliance is not verified

### 4.3 No API Contract Tests

No tests verify that the API endpoints match the documented request/response schemas. Given there are ~240 endpoints, this is a massive gap.

### 4.4 No Database Migration Tests

The strategy requires migration up/down idempotency testing. Currently:
- No DOWN migrations exist
- No test verifies that migrations run on a fresh database
- No test verifies migration ordering

---

## 5. Test Plan to Achieve 80% Coverage

### Phase 1: Foundation (Est. 3-4 days)

**Goal**: Get tests compiling and establish baseline

1. Fix `pageforge` crate blocker
2. Run `cargo test` to see which existing tests pass
3. Run `cargo tarpaulin` to establish baseline coverage number
4. Fix any test compilation errors

### Phase 2: Core Unit Tests (Est. 5-7 days)

**Goal**: Reach 50% unit test coverage

| Priority | Crate | Tests to Write | Est. Tests |
|----------|-------|---------------|------------|
| 1 | rustpress-auth | JWT generation/validation, password hashing, RBAC, session management | 30 |
| 2 | rustpress-database | Repository CRUD methods for all entities | 50 |
| 3 | rustpress-core | Error handling, config loading, plugin trait impls | 20 |
| 4 | rustpress-content | Post/page lifecycle, taxonomy assignment, content sanitization | 30 |
| 5 | rustpress-cache | Cache get/set/invalidate, Redis fallback to moka | 15 |
| 6 | rustpress-server | Request/response types, middleware, error formatting | 25 |

### Phase 3: Integration Tests (Est. 5-7 days)

**Goal**: 100% P0 API endpoint coverage with integration tests

| Priority | Test Suite | Description | Est. Tests |
|----------|-----------|-------------|------------|
| 1 | Auth flow | Register -> login -> refresh -> logout -> forgot -> reset | 15 |
| 2 | Post lifecycle | Create -> edit -> publish -> schedule -> unpublish -> delete -> bulk | 20 |
| 3 | Page CRUD | Create -> edit -> parent/child -> template -> delete | 10 |
| 4 | Media pipeline | Upload -> optimize -> variants -> folder -> move -> delete | 15 |
| 5 | Comments | Create -> thread -> approve -> spam -> trash -> like -> batch | 15 |
| 6 | Taxonomy | Categories CRUD, tags CRUD, post assignment, archive | 15 |
| 7 | Settings | All groups read/write, batch update, persistence | 10 |
| 8 | Menus | CRUD menus, manage items, nesting, theme assignment | 10 |
| 9 | Widgets | CRUD widgets, area assignment, ordering | 10 |
| 10 | Search | Full-text search, suggestions, pagination | 8 |
| 11 | Themes | Discovery, activation, settings, export/import | 12 |
| 12 | Plugins | Discovery, activate/deactivate, lifecycle | 10 |
| 13 | Dashboard stats | Verify real data, not hardcoded | 5 |
| 14 | Email | Config, test send, templates | 5 |

### Phase 4: Edge Cases & Error Paths (Est. 3-4 days)

**Goal**: Reach 80% coverage target

1. Invalid input validation tests (all endpoints)
2. Unauthorized access tests (role-based)
3. Concurrent access tests (optimistic locking)
4. Large payload tests (media upload limits)
5. Empty database tests (no data, graceful handling)
6. Redis failure tests (moka fallback verification)
7. Rate limiting tests
8. CSRF/XSS prevention tests

### Phase 5: Database Tests (Est. 2-3 days)

1. Migration up on fresh PostgreSQL 16
2. Migration idempotency (run twice, no errors)
3. DOWN migration scripts (write + test)
4. Connection pool exhaustion behavior
5. Transaction rollback on error
6. Concurrent write conflict handling

---

## 6. Testing Infrastructure Needed

### Already in Cargo.toml (workspace)
- `mockall = "0.12"` - Mock trait implementations
- `wiremock = "0.5"` - HTTP mock server
- `fake = "2.9"` - Fake data generation
- `criterion = "0.5"` - Benchmarks (with HTML reports)

### Needs to Be Added
- `testcontainers` - Docker-based PostgreSQL for integration tests
- `sqlx::testing` fixtures - Test database setup/teardown
- `tower::ServiceExt` - For testing Axum handlers directly
- `axum-test` or `reqwest` - For HTTP-level integration tests
- `serial_test` - For tests that need exclusive database access

### CI Configuration Needed
- PostgreSQL 16 service in GitHub Actions
- Redis 7 service in GitHub Actions
- `cargo tarpaulin` for coverage reporting
- Coverage threshold gate (fail if < 80%)
- Test result artifact upload

---

## 7. Estimated Timeline to 80% Coverage

| Phase | Duration | Coverage After |
|-------|----------|---------------|
| Phase 1: Foundation | 3-4 days | ~20% (baseline) |
| Phase 2: Core Unit Tests | 5-7 days | ~50% |
| Phase 3: Integration Tests | 5-7 days | ~70% |
| Phase 4: Edge Cases | 3-4 days | ~80% |
| Phase 5: Database Tests | 2-3 days | ~82% (with margin) |
| **Total** | **18-25 days** | **80%+** |

---

## 8. Key Risks

1. **Compilation blocker**: Until `pageforge` is resolved, no tests can run at all
2. **Test quality**: Existing inline tests may be shallow compilation checks, not behavioral assertions
3. **Database dependency**: Many integration tests need a running PostgreSQL instance, which adds CI complexity
4. **Route handler monolith**: The 8036-line `routes.rs` is difficult to test in isolation; handler logic should be extracted to service layers
5. **No test fixtures**: No shared test data setup utilities exist, requiring each test to bootstrap its own state
