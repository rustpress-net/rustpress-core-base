# RustPress CMS - Comprehensive Test Strategy

> **Author**: QA Engineer (QA)
> **Date**: 2026-03-02
> **Version**: 1.0
> **Status**: Wave 3 QA Artifact
> **Repositories**:
>   - Backend: `C:\Users\Software Engineering\Desktop\rustpress-core-base`
>   - Frontend: `C:\Users\Software Engineering\Desktop\rustpress-core-admin-ui`

---

## 1. Testing Philosophy

RustPress is a dual-repository, polyrepo project with a Rust backend (Axum, PostgreSQL, Redis) and a React/TypeScript admin UI. The testing strategy must address both codebases independently and together, verifying that:

1. **Backend correctness**: All 19 crates compile, all API handlers behave per contract, data persistence is reliable, and security layers are enforced.
2. **Frontend correctness**: All admin pages render correctly, state management is sound, API integration works, and the user experience is accessible.
3. **Integration correctness**: The admin UI communicates correctly with the backend API, authentication flows work end-to-end, and CRUD operations complete successfully across the stack.

### 1.1 Guiding Principles

- **Test the contract, not the implementation**: Focus on API inputs/outputs, not internal data structures.
- **Risk-based prioritization**: Test P0 features first, security-critical paths second, convenience features third.
- **Fail fast**: Static analysis and compilation checks run before any dynamic tests.
- **Realistic environments**: Integration tests run against real PostgreSQL 16 and Redis 7, not mocks.
- **Evidence-based**: Every test run produces artifacts (coverage reports, screenshots, logs) stored in `.team/evidence/`.

---

## 2. Test Pyramid

The test pyramid for RustPress follows six layers, from fastest/cheapest at the base to slowest/most expensive at the top:

```
                    /\
                   /  \
                  / Sec \          Layer 6: Security Testing
                 /------\             cargo audit, npm audit, OWASP ZAP
                / Perf   \        Layer 5: Performance Testing
               /----------\          k6 load tests (5K req/s target)
              /    E2E      \     Layer 4: End-to-End Tests
             /--------------\        Playwright (admin UI critical flows)
            /  Integration    \   Layer 3: Integration Tests
           /------------------\      Backend: Axum handler tests w/ PG+Redis
          /     Component       \    Frontend: RTL + MSW mock API
         /----------------------\ Layer 2: Component/Unit Tests
        /     Unit Tests          \  Backend: #[test] in each crate
       /--------------------------\  Frontend: Vitest + RTL
      /    Static Analysis          \ Layer 1: Static Analysis
     /------------------------------\   Backend: cargo clippy -D warnings
    /                                \  Frontend: tsc --strict, ESLint
```

### 2.1 Layer 1: Static Analysis (Gate: Must Pass Before Merge)

| Tool | Repository | Purpose | Target |
|------|-----------|---------|--------|
| `cargo fmt --check` | Backend | Code formatting consistency | Zero violations |
| `cargo clippy -- -D warnings` | Backend | Linting, bug detection, style | Zero warnings (NO suppression flags) |
| `tsc --noEmit --strict` | Frontend | TypeScript type safety | Zero errors (currently 1,057 -- must fix) |
| ESLint | Frontend | Code quality, React best practices | Zero warnings |
| Prettier | Frontend | Code formatting | Zero violations |

**Current state**: Backend cannot compile (pageforge blocker). Frontend has `strict: false` with 1,057 errors when strict is enabled.

### 2.2 Layer 2: Unit Tests

**Backend (Rust)**:
- Framework: Built-in `#[test]` + `#[tokio::test]`
- Mocking: `mockall 0.12`
- Fake data: `fake 2.9`
- Scope: Individual functions, structs, trait implementations within each crate
- Location: `#[cfg(test)]` modules in source files (202 files already contain test modules)
- Target: >= 80% line coverage per crate (cargo-tarpaulin)

**Frontend (React/TypeScript)**:
- Framework: Vitest 3.x
- Component testing: React Testing Library 16.x
- DOM assertions: @testing-library/jest-dom 6.x
- User interaction: @testing-library/user-event 14.x
- Environment: jsdom 25.x
- Scope: Individual components, stores, utility functions
- Target: >= 70% line coverage (vitest --coverage with v8 provider)

### 2.3 Layer 3: Integration Tests

**Backend**:
- Framework: `cargo test` with real PostgreSQL 16 + Redis 7 services
- HTTP testing: `axum-test` or direct `reqwest` calls against running server
- Database: `testcontainers` for isolated PostgreSQL per test suite, or `sqlx` test fixtures
- Serialization: Tests must verify exact JSON request/response shapes for all ~240 endpoints
- Scope: Full request lifecycle -- HTTP request -> middleware -> handler -> DB -> response

**Frontend**:
- Framework: Vitest + React Testing Library
- API mocking: MSW 2.x (Mock Service Worker)
- Scope: Page-level components with mocked API responses, verifying store integration and render output
- Location: `src/test/mocks/handlers/` for centralized MSW handlers

### 2.4 Layer 4: End-to-End Tests

- Framework: Playwright 1.49+
- Browsers: Chromium (primary), Firefox, WebKit (secondary)
- Scope: Full user flows through the admin UI against a running backend
- Accessibility: `@axe-core/playwright` for WCAG 2.1 AA compliance on every page
- Location: `e2e/` directory in frontend repo
- Configuration: `playwright.config.ts` with web server management

**Critical E2E flows**:
1. Login -> Dashboard -> Logout
2. Create Post -> Edit -> Publish -> View on frontend
3. Upload Media -> Assign to Post -> Verify rendering
4. Plugin lifecycle: Activate -> Configure -> Deactivate
5. Theme switch -> Verify public frontend changes
6. User management: Create -> Assign Role -> Delete
7. Settings: Modify -> Save -> Verify persistence
8. Comment moderation: Approve -> Spam -> Trash

### 2.5 Layer 5: Performance Tests

- Framework: k6 (preferred) or drill
- Targets (from strategy):
  - API P95 latency < 100ms
  - Throughput: 5,000 req/s sustained for 60 seconds
  - Soak test: 1,000 req/s for 1 hour, no memory leaks
  - Server startup time < 3 seconds
  - Database query P95 < 50ms
- Admin UI:
  - Lighthouse LCP < 2.0s
  - Bundle size < 5MB gzipped
- Location: `tests/load/` in backend repo

### 2.6 Layer 6: Security Tests

| Test Type | Tool | Scope | Frequency |
|-----------|------|-------|-----------|
| Dependency audit | `cargo audit` | Backend crate vulnerabilities | Every CI run |
| Dependency audit | `npm audit` | Frontend package vulnerabilities | Every CI run |
| DAST scan | OWASP ZAP | Running instance, all endpoints | Pre-release |
| Container scan | Trivy | Docker image vulnerabilities | Every Docker build |
| Auth bypass | Manual + automated | All protected endpoints | Per wave |
| Privilege escalation | Manual + automated | RBAC boundary testing | Per wave |
| CORS exploitation | Manual | Cross-origin request testing | Per wave |
| Injection testing | sqlmap + manual | All input endpoints | Pre-release |

---

## 3. Coverage Targets

### 3.1 Backend Coverage (cargo-tarpaulin)

| Crate | Current Estimate | Target | Priority |
|-------|-----------------|--------|----------|
| rustpress-auth | 25-35% | 85% | P0 (security-critical) |
| rustpress-server | 10-15% | 80% | P0 (all handlers) |
| rustpress-database | 15-25% | 85% | P0 (data integrity) |
| rustpress-core | 20-30% | 80% | P0 (foundation) |
| rustpress-content | 20-30% | 80% | P0 (core CMS) |
| rustpress-cache | 30-40% | 80% | P0 (performance) |
| rustpress-plugins | 20-30% | 80% | P0 (plugin system) |
| rustpress-themes | 20-30% | 80% | P0 (theme system) |
| rustpress-users | 25-35% | 80% | P0 (user management) |
| rustpress-media | 15-20% | 80% | P0 (media pipeline) |
| rustpress-api | 15-20% | 80% | P1 |
| rustpress-health | 25-35% | 80% | P1 |
| rustpress-cdn | 20-30% | 75% | P1 |
| rustpress-performance | 15-25% | 75% | P1 |
| rustpress-storage | 25-35% | 75% | P1 |
| rustpress-editor | 35-50% | 75% | P1 |
| rustpress-jobs | 15-25% | 75% | P2 |
| rustpress-events | 20-30% | 75% | P2 |
| rustpress-cli | 5-10% | 70% | P2 |
| rustpress-admin | 10-15% | 70% | P2 |
| **Weighted Average** | **~20-25%** | **>= 80%** | |

### 3.2 Frontend Coverage (vitest --coverage)

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| API client (`src/api/`) | 0% | 90% | P0 |
| Zustand stores (`src/store/`) | 0% | 85% | P0 |
| Core CMS pages | 0% | 70% | P0 |
| Design system components (top 30) | 0% | 70% | P1 |
| Feature components | ~5% (VQM only) | 70% | P1 |
| All design system (169 components) | 0% | 60% | P2 |
| E2E critical flows | 0% | 100% of P0 flows | P0 |
| **Overall** | **< 1%** | **>= 70%** | |

---

## 4. Tool Selection

### 4.1 Backend Tools

| Purpose | Tool | Version | Notes |
|---------|------|---------|-------|
| Unit testing | `cargo test` (built-in) | Rust stable | #[test] and #[tokio::test] |
| Mocking | `mockall` | 0.12 | Already in workspace Cargo.toml |
| Fake data | `fake` | 2.9 | Already in workspace Cargo.toml |
| HTTP mocking | `wiremock` | 0.5 | Already in workspace Cargo.toml |
| Benchmarks | `criterion` | 0.5 | Already in workspace Cargo.toml |
| Coverage | `cargo-tarpaulin` | Latest | HTML + lcov output |
| Integration DB | `testcontainers` | Latest | Docker-based PostgreSQL |
| HTTP testing | `axum-test` or `reqwest` | Latest | Needs to be added |
| Serial tests | `serial_test` | Latest | Needs to be added |
| Load testing | k6 | Latest | External tool |
| Security audit | `cargo-audit` | Latest | RustSec advisory DB |

### 4.2 Frontend Tools

| Purpose | Tool | Version | Notes |
|---------|------|---------|-------|
| Unit/component testing | Vitest | 3.x | Needs to be added to package.json |
| Coverage | @vitest/coverage-v8 | 3.x | Needs to be added |
| Component testing | @testing-library/react | 16.x | Needs to be added |
| DOM assertions | @testing-library/jest-dom | 6.x | Needs to be added |
| User interaction | @testing-library/user-event | 14.x | Needs to be added |
| DOM environment | jsdom | 25.x | Needs to be added |
| API mocking | MSW | 2.x | Needs to be added |
| E2E testing | @playwright/test | 1.49+ | Needs to be added |
| Accessibility | @axe-core/playwright | 4.10+ | Needs to be added |
| Linting | ESLint | 9.x | Needs to be added |
| Formatting | Prettier | 3.x | Needs to be added |
| Security audit | npm audit | Built-in | Already available |

**Current state**: NONE of the frontend test dependencies exist in `package.json`. This is a Wave 1 blocker.

---

## 5. Environment Requirements

### 5.1 Development/CI Test Environment

| Service | Version | Purpose | Configuration |
|---------|---------|---------|---------------|
| PostgreSQL | 16 (Alpine) | Primary database | `rustpress:rustpress@localhost:5432/rustpress_test` |
| Redis | 7 (Alpine) | Cache + sessions | `redis://localhost:6379` |
| Node.js | 20 LTS | Frontend build/test | npm for package management |
| Rust | Stable (>= 1.75) | Backend build/test | Edition 2021 |
| Docker | Latest | Container builds, testcontainers | For integration tests |
| Chromium | Via Playwright | E2E browser testing | `npx playwright install --with-deps chromium` |

### 5.2 CI Services (GitHub Actions)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: rustpress
      POSTGRES_PASSWORD: rustpress
      POSTGRES_DB: rustpress_test
    ports: ["5432:5432"]
    options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5
```

### 5.3 Environment Variables for Testing

```bash
DATABASE_URL=postgres://rustpress:rustpress@localhost:5432/rustpress_test
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key-for-ci-only-do-not-use-in-production
HOST=127.0.0.1
PORT=8080
RUST_LOG=info
```

---

## 6. Risk-Based Testing Priorities

### 6.1 Risk Assessment Matrix

| Risk Area | Probability | Impact | Risk Score | Test Priority |
|-----------|------------|--------|------------|---------------|
| **Compilation failure** (pageforge blocker) | Certain | Critical | CRITICAL | P0 - Fix first |
| **Authentication bypass** (no RBAC enforcement) | High | Critical | CRITICAL | P0 - Test immediately after fix |
| **Data loss** (missing DB columns, no DOWN migrations) | High | High | HIGH | P0 - Migration tests |
| **API contract mismatch** (FE/BE URL prefix) | Certain | High | HIGH | P0 - Integration tests |
| **XSS/Injection** via unsanitized input | Medium | High | HIGH | P0 - Security tests |
| **CORS exploitation** (Any origin allowed) | High | High | HIGH | P0 - Security tests |
| **Cache inconsistency** (Redis/moka fallback) | Medium | Medium | MEDIUM | P1 |
| **Media upload failures** | Medium | Medium | MEDIUM | P1 |
| **Theme rendering errors** | Medium | Medium | MEDIUM | P1 |
| **Plugin lifecycle failures** | Medium | Medium | MEDIUM | P1 |
| **Performance degradation** | Low | Medium | LOW | P2 |
| **Accessibility violations** | Medium | Low | LOW | P2 |

### 6.2 Test Execution Order

When blockers are resolved, tests should be executed in this order:

1. **Phase 0**: Restore compilation (fix pageforge crate)
2. **Phase 1**: Run `cargo test` -- establish baseline, fix broken tests
3. **Phase 2**: Run `cargo tarpaulin` -- measure baseline coverage
4. **Phase 3**: Write and run authentication integration tests
5. **Phase 4**: Write and run CRUD integration tests (posts, pages, media, comments)
6. **Phase 5**: Set up frontend test infrastructure (install deps, create configs)
7. **Phase 6**: Write and run frontend store unit tests
8. **Phase 7**: Write and run frontend component tests
9. **Phase 8**: Write and run E2E tests (Playwright)
10. **Phase 9**: Run security scans (cargo audit, npm audit, OWASP ZAP)
11. **Phase 10**: Run performance tests (k6 load/soak)

---

## 7. Test Data Management

### 7.1 Backend Test Data

- **Migration-seeded data**: Default admin user (email: admin@rustpress.local, password: admin123), default "Uncategorized" category, default settings
- **Factory functions**: Create test data programmatically using `fake` crate for random data generation
- **Fixtures**: Static JSON/TOML fixtures for known test scenarios (e.g., post with all fields populated)
- **Cleanup**: Each integration test should run in a database transaction that rolls back after the test

### 7.2 Frontend Test Data

- **MSW handlers**: Centralized mock API responses in `src/test/mocks/handlers/`
- **Factory functions**: TypeScript factory functions for creating test data objects
- **Store reset**: Each test should reset Zustand stores to initial state before running

---

## 8. Reporting and Evidence

### 8.1 Artifacts Generated Per Test Run

| Artifact | Tool | Format | Location |
|----------|------|--------|----------|
| Backend coverage report | cargo-tarpaulin | HTML + lcov | `.team/evidence/wave-N/backend-coverage/` |
| Frontend coverage report | vitest --coverage | HTML + lcov | `.team/evidence/wave-N/frontend-coverage/` |
| E2E test report | Playwright | HTML | `.team/evidence/wave-N/playwright-report/` |
| Load test results | k6 | JSON + HTML | `.team/evidence/wave-N/load-test/` |
| Security audit | cargo-audit + npm audit | Text | `.team/evidence/wave-N/security-audit/` |
| OWASP ZAP scan | OWASP ZAP | HTML | `.team/evidence/wave-N/zap-report/` |
| Clippy output | cargo clippy | Text | `.team/evidence/wave-N/clippy.txt` |
| TypeScript strict output | tsc --strict | Text | `.team/evidence/wave-N/tsc-strict.txt` |

### 8.2 CI Coverage Gates

| Gate | Threshold | Action on Failure |
|------|-----------|-------------------|
| Backend coverage | >= 80% | Block merge to main |
| Frontend coverage | >= 70% | Block merge to main |
| Clippy warnings | 0 | Block merge to ai-develop |
| TypeScript errors (strict) | 0 | Block merge to ai-develop |
| cargo audit CRITICAL/HIGH | 0 | Block merge to main |
| npm audit CRITICAL/HIGH | 0 | Block merge to main |
| E2E tests | 100% pass | Block merge to main |

---

## 9. Estimated Effort to Reach Coverage Targets

### 9.1 Backend (20% -> 80%)

| Phase | Work | Duration | Coverage After |
|-------|------|----------|---------------|
| Fix compilation blocker | Stub pageforge crate | 0.5 day | N/A (enables testing) |
| Baseline measurement | Run cargo test + tarpaulin | 0.5 day | ~20% |
| Core unit tests | Auth, DB, Core, Content crates | 5-7 days | ~50% |
| Integration tests | All P0 API endpoints | 5-7 days | ~70% |
| Edge cases + error paths | Validation, auth failures, concurrency | 3-4 days | ~80% |
| Database tests | Migration up/down, concurrent access | 2-3 days | ~82% |
| **Total** | | **16-22 days** | **80%+** |

### 9.2 Frontend (0% -> 70%)

| Phase | Work | Duration | Coverage After |
|-------|------|----------|---------------|
| Infrastructure setup | Install deps, create configs | 0.5 day | 0% |
| Store unit tests (14 stores) | All Zustand stores | 2-3 days | ~15% |
| API client tests | Interceptors, error handling | 0.5 day | ~18% |
| Core component tests (30) | Top design system components | 3-4 days | ~40% |
| Page tests (15 pages) | Critical admin pages | 2-3 days | ~55% |
| E2E setup + tests (10 flows) | Playwright critical flows | 3-4 days | ~65% |
| Remaining component tests | Fill to 70% | 2-3 days | ~70% |
| **Total** | | **13-18 days** | **70%+** |

### 9.3 Combined Effort

**Total estimated effort**: 29-40 engineering days to reach coverage targets from current state.

---

## 10. Assumptions and Dependencies

### 10.1 Assumptions

1. The `pageforge` crate blocker will be resolved before any test execution can begin
2. Frontend test dependencies will be added to `package.json` before frontend testing begins
3. TypeScript strict mode will be enabled incrementally (not blocking test work)
4. A running PostgreSQL 16 and Redis 7 instance will be available for integration tests
5. GitHub Actions CI will be configured for both repositories

### 10.2 Dependencies

| Dependency | Blocking | Owner |
|-----------|----------|-------|
| Pageforge crate creation/removal | ALL backend testing | Backend Engineer |
| Frontend test deps in package.json | ALL frontend testing | Frontend Engineer |
| CI pipeline creation for frontend | Automated testing | DevOps Engineer |
| CORS fix (Any -> explicit origins) | Security testing | Backend Engineer |
| RBAC enforcement on routes | Auth testing | Backend Engineer |
| URL prefix fix (/api vs /api/v1) | Integration testing | Frontend/Backend Engineer |

---

*End of Test Strategy*
