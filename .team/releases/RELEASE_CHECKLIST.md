# RustPress CMS v1.0.0 -- Release Checklist

> **Author**: Release Manager (RM)
> **Date**: 2026-03-02
> **Version**: 1.0
> **Status**: Wave 4 Release Artifact
> **Overall Gate**: BLOCKED (QA Verdict: FAIL)

---

## Status Legend

| Status | Meaning |
|--------|---------|
| PASS | Verified and complete |
| FAIL | Verified and does NOT meet criteria |
| BLOCKED | Cannot evaluate due to upstream dependency |
| PENDING | Not yet evaluated |
| N/A | Not applicable for this release |

---

## 1. Pre-Release Checklist

### 1.1 Build Health

| # | Item | Status | Owner | Bug Ref | Notes |
|---|------|--------|-------|---------|-------|
| 1.1.1 | All 19 backend crates compile with zero errors | **FAIL** | BE | BUG-001 | Missing `pageforge` crate blocks entire workspace compilation |
| 1.1.2 | `cargo clippy -- -D warnings` passes with zero warnings | **FAIL** | BE | BUG-019, BUG-020 | CI suppresses all lints; estimated 400-750 hidden warnings |
| 1.1.3 | `cargo fmt --check` passes | **BLOCKED** | BE | -- | Cannot verify while compilation is broken |
| 1.1.4 | `npm run build` (frontend) passes with zero errors | **PENDING** | FE | -- | Build may succeed but produces non-functional application |
| 1.1.5 | `npx tsc --noEmit --strict` passes with zero errors | **FAIL** | FE | BUG-026 | 1,057 TypeScript strict mode errors |
| 1.1.6 | ESLint passes with zero warnings | **PENDING** | FE | -- | ESLint not yet configured |
| 1.1.7 | No `TODO`, `FIXME`, or `HACK` comments in production code | **PENDING** | BE/FE | -- | Cannot audit while compilation is broken |

### 1.2 QA Sign-off

| # | Item | Status | Owner | Bug Ref | Notes |
|---|------|--------|-------|---------|-------|
| 1.2.1 | QA Verdict: PASS | **FAIL** | QA | -- | QA verdict is FAIL with 45 bugs (7 CRITICAL, 18 HIGH) |
| 1.2.2 | All CRITICAL bugs resolved | **FAIL** | BE/FE | BUG-001 through BUG-007 | 7 CRITICAL bugs remain open |
| 1.2.3 | All HIGH bugs resolved | **FAIL** | BE/FE/DEVOPS | BUG-008 through BUG-025 | 18 HIGH bugs remain open |
| 1.2.4 | All MEDIUM bugs resolved or deferred with justification | **FAIL** | ALL | BUG-026 through BUG-040 | 15 MEDIUM bugs remain open |
| 1.2.5 | Backend test coverage >= 80% (cargo-tarpaulin) | **BLOCKED** | BE | BUG-001 | Cannot measure; estimated ~20-25% if compilable |
| 1.2.6 | Frontend test coverage >= 70% (vitest --coverage) | **FAIL** | FE | BUG-037 | Currently < 1%; zero test dependencies installed |
| 1.2.7 | All P0 E2E test flows pass (Playwright) | **FAIL** | QA | -- | Zero E2E tests exist; no Playwright infrastructure |
| 1.2.8 | All 260 test cases from TEST_CASES.md have implementations | **FAIL** | BE/FE/QA | -- | Zero of 260 test cases implemented |

### 1.3 Security Audit

| # | Item | Status | Owner | Bug Ref | Notes |
|---|------|--------|-------|---------|-------|
| 1.3.1 | `cargo audit` -- zero CRITICAL/HIGH vulnerabilities | **BLOCKED** | BE | BUG-001 | Cannot run while compilation is broken |
| 1.3.2 | `npm audit` -- zero CRITICAL/HIGH vulnerabilities | **PENDING** | FE | -- | Not yet executed |
| 1.3.3 | OWASP ZAP scan -- zero HIGH findings | **BLOCKED** | QA | BUG-001 | Cannot scan; server cannot start |
| 1.3.4 | CORS restricted to explicit origins | **FAIL** | BE | BUG-002 | `allow_origin(Any)` allows all origins |
| 1.3.5 | RBAC enforced on all admin routes | **FAIL** | BE | BUG-004 | Only 2/24 route groups have role checks |
| 1.3.6 | JWT default secret causes startup failure | **FAIL** | BE | BUG-003 | Default `"change-me-in-production"` is accepted |
| 1.3.7 | CSRF protection applied to state-changing requests | **FAIL** | BE | BUG-015 | CSRF module exists but not wired into middleware |
| 1.3.8 | CSP headers properly configured | **FAIL** | BE | BUG-016 | CSP allows `unsafe-inline` and `unsafe-eval` |
| 1.3.9 | No secrets in source code or Docker logs | **FAIL** | DEVOPS | BUG-018, BUG-042 | Admin password logged to stdout; JWT secret in config file |
| 1.3.10 | Token revocation functional on logout | **FAIL** | BE | BUG-036 | No token blacklist; logout does not invalidate tokens |
| 1.3.11 | Container runs as non-root user | **FAIL** | DEVOPS | BUG-033 | Dockerfile has no USER directive |

### 1.4 Documentation

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 1.4.1 | README covers install-to-first-post tutorial | **PENDING** | BE/FE | README exists but completeness not verified |
| 1.4.2 | OpenAPI specification generated and validated | **BLOCKED** | BE | Cannot generate while server does not start |
| 1.4.3 | Plugin development guide written | **PENDING** | BE | Not yet created |
| 1.4.4 | Theme development guide written | **PENDING** | BE | Not yet created |
| 1.4.5 | `.env.example` with all variables documented | **PENDING** | DEVOPS | Not yet verified |
| 1.4.6 | CHANGELOG.md for v1.0.0 written | **PENDING** | RM | This wave deliverable |
| 1.4.7 | API documentation covers all P0 endpoints | **BLOCKED** | BE | Cannot validate without running server |
| 1.4.8 | Architecture diagram current and accurate | **PASS** | INFRA | ARCHITECTURE.md produced in Wave 2 |

### 1.5 Feature Completeness

| # | Feature (P0) | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 1.5.1 | Backend compilation & startup | **FAIL** | BE | BUG-001 blocks compilation |
| 1.5.2 | Database migrations (all 10 up + down) | **FAIL** | BE | No DOWN migrations (BUG-027), missing tables (BUG-005), missing columns (BUG-006) |
| 1.5.3 | Authentication system | **FAIL** | BE | JWT secret insecure (BUG-003), refresh tokens in-memory (BUG-014) |
| 1.5.4 | User management with RBAC | **FAIL** | BE | No RBAC enforcement (BUG-004) |
| 1.5.5 | Post management (full lifecycle) | **BLOCKED** | BE | Missing `deleted_at` column (BUG-006) |
| 1.5.6 | Page management | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.7 | Media library | **BLOCKED** | BE | Upload pipeline untested |
| 1.5.8 | Comments system | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.9 | Taxonomy system | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.10 | Theme system | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.11 | Plugin system | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.12 | Admin UI <-> Backend integration | **FAIL** | FE | URL prefix mismatch (BUG-007), login is stub (BUG-008), 13 stub pages (BUG-009) |
| 1.5.13 | Public frontend rendering | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.14 | Settings management | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.15 | Menu management | **BLOCKED** | BE | Missing `deleted_at` on menus (BUG-006) |
| 1.5.16 | Search functionality | **BLOCKED** | BE | Search reindex stubbed (BUG-013) |
| 1.5.17 | Cache system (Redis + moka) | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.18 | Email system | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.19 | Docker production deployment | **FAIL** | DEVOPS | bcrypt/Argon2 mismatch (BUG-017), runs as root (BUG-033) |
| 1.5.20 | Admin dashboard accuracy | **FAIL** | FE/BE | 100% mock data (BUG-010), backend stats fake (BUG-011) |
| 1.5.21 | Widget system | **FAIL** | BE | Missing `widget_areas` table (BUG-005) |
| 1.5.22 | CLI tools validation (all 14 groups) | **BLOCKED** | BE | Cannot test while compilation broken |
| 1.5.23 | Error handling & logging | **BLOCKED** | BE | Cannot test while compilation broken |

---

## 2. Build Checklist

### 2.1 Backend Build

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 2.1.1 | `cargo build --release` completes successfully | **FAIL** | BE | BUG-001 blocks compilation |
| 2.1.2 | Release binary size < target | **BLOCKED** | BE | Cannot build |
| 2.1.3 | All feature flags documented and tested | **BLOCKED** | BE | Cannot verify |
| 2.1.4 | No debug assertions in release build | **BLOCKED** | BE | Cannot verify |
| 2.1.5 | Database migrations bundled with binary | **BLOCKED** | BE | Cannot verify |
| 2.1.6 | Version string matches v1.0.0 in Cargo.toml | **PENDING** | BE | Not yet verified |

### 2.2 Frontend Build

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 2.2.1 | `npm run build` produces dist/ directory | **PENDING** | FE | Build likely succeeds but app is non-functional |
| 2.2.2 | Bundle size < 5MB gzipped | **PENDING** | FE | Not yet measured |
| 2.2.3 | No mock data in production build | **FAIL** | FE | BUG-009, BUG-010: 13 stub pages + mock dashboard |
| 2.2.4 | Source maps excluded from production | **PENDING** | FE | Not yet verified |
| 2.2.5 | Environment variables externalized | **PENDING** | FE | Not yet verified |
| 2.2.6 | Lighthouse LCP < 2.0s | **BLOCKED** | FE | Cannot test without working backend |

### 2.3 Docker Build

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 2.3.1 | Multi-stage Dockerfile builds successfully | **FAIL** | DEVOPS | Compilation blocker prevents backend build stage |
| 2.3.2 | Docker image < 100MB | **FAIL** | DEVOPS | Estimated 155-190MB |
| 2.3.3 | `.dockerignore` configured | **FAIL** | DEVOPS | No .dockerignore exists |
| 2.3.4 | Non-root user in container | **FAIL** | DEVOPS | BUG-033: no USER directive |
| 2.3.5 | Health check in Dockerfile | **PENDING** | DEVOPS | Not yet verified |
| 2.3.6 | Image tagged as `ghcr.io/rustpress/rustpress:v1.0.0` | **PENDING** | DEVOPS | Cannot build until compilation fixed |
| 2.3.7 | Image tagged as `ghcr.io/rustpress/rustpress:latest` | **PENDING** | DEVOPS | Cannot build until compilation fixed |

### 2.4 Binary Artifacts

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 2.4.1 | Linux x86_64 binary built and tested | **BLOCKED** | DEVOPS | Cannot build |
| 2.4.2 | Linux aarch64 binary built and tested | **BLOCKED** | DEVOPS | Cannot build |
| 2.4.3 | macOS x86_64 binary built and tested | **BLOCKED** | DEVOPS | Cannot build |
| 2.4.4 | macOS aarch64 (Apple Silicon) binary built and tested | **BLOCKED** | DEVOPS | Cannot build |
| 2.4.5 | Windows x86_64 binary built and tested | **BLOCKED** | DEVOPS | Cannot build |
| 2.4.6 | SHA256 checksums generated for all binaries | **BLOCKED** | DEVOPS | Cannot build |

---

## 3. Deployment Checklist

### 3.1 Database Migration

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.1.1 | All migrations run cleanly on fresh PostgreSQL 16 | **FAIL** | BE | Missing tables (BUG-005), missing columns (BUG-006), DROP CASCADE (BUG-025) |
| 3.1.2 | All DOWN migrations verified | **FAIL** | BE | No DOWN migrations exist (BUG-027) |
| 3.1.3 | Migration idempotency verified | **BLOCKED** | BE | Cannot test |
| 3.1.4 | Migration performance on large datasets tested | **BLOCKED** | BE | Cannot test |
| 3.1.5 | Data migration scripts for v0.4.0 -> v1.0.0 prepared | **PENDING** | BE | Not yet created |
| 3.1.6 | Database backup taken before migration | **PENDING** | DEVOPS | Deployment procedure not yet finalized |

### 3.2 Environment Configuration

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.2.1 | All required environment variables documented | **PENDING** | DEVOPS | `.env.example` not verified |
| 3.2.2 | JWT_SECRET set to strong random value | **FAIL** | BE | BUG-003: default accepted |
| 3.2.3 | DATABASE_URL configured for production | **PENDING** | DEVOPS | -- |
| 3.2.4 | REDIS_URL configured for production | **PENDING** | DEVOPS | -- |
| 3.2.5 | CORS_ORIGINS set to production domain(s) | **FAIL** | BE | BUG-002: `allow_origin(Any)` |
| 3.2.6 | SMTP credentials configured for email | **PENDING** | DEVOPS | -- |
| 3.2.7 | TLS termination configured (reverse proxy or built-in) | **PENDING** | DEVOPS | -- |
| 3.2.8 | Log level set to `info` or `warn` for production | **PENDING** | DEVOPS | -- |

### 3.3 Health Checks & Readiness

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.3.1 | `/health/live` returns 200 OK | **BLOCKED** | BE | Server cannot start |
| 3.3.2 | `/health/ready` returns 200 OK (DB + Redis connected) | **BLOCKED** | BE | Server cannot start |
| 3.3.3 | `/metrics` returns valid Prometheus data | **FAIL** | BE | BUG-012: endpoint is stubbed |
| 3.3.4 | Docker HEALTHCHECK defined | **PENDING** | DEVOPS | Not yet verified |
| 3.3.5 | Kubernetes readiness/liveness probes tested | **PENDING** | DEVOPS | Not yet tested |

### 3.4 Rollback Readiness

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.4.1 | Previous Docker image tagged and preserved | **PENDING** | DEVOPS | v0.4.0 image status unknown |
| 3.4.2 | Database rollback scripts tested | **FAIL** | BE | No DOWN migrations (BUG-027) |
| 3.4.3 | Rollback procedure documented | **PENDING** | RM | ROLLBACK_PLAN.md being created this wave |
| 3.4.4 | Rollback tested in staging environment | **BLOCKED** | DEVOPS | No staging environment exists |
| 3.4.5 | Data backup verified and restorable | **BLOCKED** | DEVOPS | Backup system tables missing (BUG-005) |

---

## 4. Post-Release Checklist

### 4.1 Monitoring

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.1.1 | Prometheus monitoring configured and scraping | **FAIL** | DEVOPS | BUG-012: metrics endpoint stubbed |
| 4.1.2 | Alert rules deployed (error rate, latency, disk usage) | **PENDING** | DEVOPS | -- |
| 4.1.3 | Log aggregation configured | **PENDING** | DEVOPS | -- |
| 4.1.4 | Error tracking configured (Sentry or equivalent) | **PENDING** | DEVOPS | -- |
| 4.1.5 | Uptime monitoring configured | **PENDING** | DEVOPS | -- |

### 4.2 Announcement

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.2.1 | Release notes published (RELEASE_NOTES.md) | **PENDING** | RM | This wave deliverable |
| 4.2.2 | GitHub Release created with changelog | **PENDING** | RM | Depends on all blockers resolved |
| 4.2.3 | Docker Hub / GHCR image published | **PENDING** | DEVOPS | Cannot build |
| 4.2.4 | Blog post / announcement written | **PENDING** | MKT | GO_TO_MARKET.md prepared |
| 4.2.5 | Social media announcement | **PENDING** | MKT | -- |
| 4.2.6 | Community channels notified (Discord, forums) | **PENDING** | MKT | -- |

### 4.3 Documentation Published

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.3.1 | Installation guide verified on clean machine | **BLOCKED** | DEVOPS | Cannot test |
| 4.3.2 | API documentation published (Swagger/ReDoc) | **BLOCKED** | BE | Cannot generate |
| 4.3.3 | Plugin development guide published | **PENDING** | BE | Not yet written |
| 4.3.4 | Theme development guide published | **PENDING** | BE | Not yet written |
| 4.3.5 | Migration guide from v0.4.0 published | **PENDING** | RM | CHANGELOG.md being created this wave |

---

## 5. Summary

### Status Counts

| Status | Count |
|--------|-------|
| PASS | 1 |
| FAIL | 38 |
| BLOCKED | 28 |
| PENDING | 30 |
| N/A | 0 |
| **Total Items** | **97** |

### Release Decision

**GATE STATUS: BLOCKED**

The v1.0.0 release CANNOT proceed. 38 items are in FAIL status and 28 are BLOCKED (primarily by BUG-001 compilation failure). The single PASS item is the architecture documentation.

### Critical Path to Unblock

1. **Fix BUG-001** (pageforge crate) -- unblocks compilation, testing, server startup, metrics, health checks, and all BLOCKED items
2. **Fix BUG-002 through BUG-007** (remaining CRITICAL bugs) -- unblocks security testing, API integration, database operations
3. **Fix all 18 HIGH bugs** -- required for production deployment
4. **Achieve test coverage targets** -- 80% backend, 70% frontend
5. **Pass QA re-evaluation** -- all gates in QA_SIGNOFF.md Section 3 must be met
6. **Complete deployment verification** -- docker-compose up on clean machine

### Estimated Timeline to Release Readiness

| Scenario | Duration | Notes |
|----------|----------|-------|
| Parallel execution (3+ engineers) | 25-35 days | Dedicated backend, frontend, security/devops |
| Parallel execution (2 engineers) | 35-50 days | Backend and frontend in parallel |
| Serial execution (1 engineer) | 70-95 days | All work sequential |

---

*This checklist will be re-evaluated after each blocker resolution phase. Next evaluation: after Tier 1 blockers (BUG-001, BUG-005, BUG-006) are fixed.*

*Release Manager (RM) -- 2026-03-02*
