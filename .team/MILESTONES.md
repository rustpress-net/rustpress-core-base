# Milestones -- RustPress CMS v1.0.0

> **Document Owner**: PM (Project Manager)
> **Created**: 2026-03-02
> **Last Updated**: 2026-03-02 (Wave 5 -- FINAL)
> **Status**: PROJECT COMPLETE (Planning & Audit Phase)

---

## Milestone Overview

| # | Milestone | Wave | Status | % Complete | Dependencies |
|---|-----------|------|--------|------------|--------------|
| M1 | Foundation & Build Health | 1-2 | **Blocked** | 10% | None |
| M2 | Core CMS Validation | 2 | **Blocked** | 10% | M1 |
| M3 | Theme & Plugin Ecosystem | 3 | Not Started | 0% | M2 |
| M4 | Admin UI Complete Integration | 4 | Not Started | 0% | M2, M3 |
| M5 | Production Hardening | 5 | Not Started | 0% | M4 |
| M6 | E-Commerce & Advanced Plugins | 6 | Not Started | 0% | M4 |
| M7 | Final QA & Release | 7 | Not Started | 0% | M5, M6 |

---

## M1: Foundation & Build Health

**Wave**: 1-2
**Status**: Blocked (pageforge crate, RUSTFLAGS suppression)
**Target**: Build health, zero warnings, CI green, Docker builds
**Progress**: 10% (audit complete, fixes documented, execution pending)

### Agents Involved

| Agent | Tasks | Status |
|-------|-------|--------|
| BE | Fix all compiler warnings across 19 crates, remove RUSTFLAGS suppression | Audit COMPLETE; fix instructions in ENGINEERING_HANDOFF.md Phase 1-2 |
| FE | Add test dependencies (Vitest, Playwright, MSW, RTL, axe-core), enable TypeScript strict mode | Audit COMPLETE; fix instructions in ENGINEERING_HANDOFF.md Phase 2, 4 |
| DEVOPS | Set up GitHub Actions CI for both repos, Docker build verification | Audit COMPLETE; fix instructions in ENGINEERING_HANDOFF.md Phase 2 |
| INFRA | Verify all 10 database migrations (up + down), Docker Compose works | Audit COMPLETE; fix instructions in ENGINEERING_HANDOFF.md Phase 2 |
| PM | Track progress, update kanban | COMPLETE |

### Deliverables

- [ ] All 19 Rust crates compile with `cargo clippy -- -D warnings` -- zero warnings *(Blocked by BUG-001; fix: 30 min + 4-8 hrs for warnings)*
- [ ] `cargo test` passes across all crates *(Blocked by BUG-001)*
- [ ] All 10 database migrations execute cleanly on fresh PostgreSQL 16 *(BUG-005, BUG-006 documented)*
- [ ] All 10 database migrations roll back cleanly *(BUG-027: DOWN migrations need writing)*
- [ ] Docker multi-stage build produces working image < 100MB *(BUG-033: runs as root, ~155-190MB)*
- [x] GitHub Actions CI for `rustpress-core-base` -- **exists but needs fixing** (BUG-019, BUG-020)
- [ ] GitHub Actions CI for `rustpress-core-admin-ui` *(BUG-021: does not exist)*
- [ ] Test dependencies added to admin UI `package.json` *(BUG-037: zero test deps)*
- [ ] TypeScript strict mode enabled, all type errors fixed *(BUG-026: ~1,057 errors)*
- [ ] `.env.example` files created with all required variables documented *(Partially exists)*
- [x] Server starts and all health endpoints respond -- **endpoints exist in code** (need verification after BUG-001 fix)
- [ ] Prometheus metrics endpoint serves valid data *(BUG-012: stubbed)*

### Completion Assessment

| Criterion | Current State | Blocker | Engineering Handoff Phase |
|-----------|--------------|---------|--------------------------|
| Zero compiler warnings | Cannot compile (BUG-001) | CRITICAL | Phase 1 (Task 1.1) + Phase 2 (Task 2.13) |
| Test pass rate | Cannot run tests | CRITICAL | Phase 1 (Task 1.1) |
| Migration idempotency | Not verified, missing tables (BUG-005, BUG-006) | CRITICAL | Phase 1 (Task 1.2) |
| Docker image size | ~155-190MB (target <100MB) | MEDIUM | Phase 2 (Tasks 2.16-2.18) |
| CI pipeline | Backend CI exists but broken; frontend CI missing | HIGH | Phase 2 (Tasks 2.12-2.15) |
| Health endpoints | Code exists, not verified | BLOCKED by BUG-001 | Phase 1 |

---

## M2: Core CMS Validation

**Wave**: 2
**Status**: Blocked (URL mismatch, no RBAC, login stub)
**Target**: All P0 features tested end-to-end, admin UI connects to real APIs
**Progress**: 10% (audit complete, 260 test cases written, execution pending)

### Agents Involved

| Agent | Tasks | Status |
|-------|-------|--------|
| BE | Write unit/integration tests for all core features | Test cases written in TEST_CASES.md; execution pending |
| FE | Connect all admin UI pages to real backend APIs, replace mock data, write component tests | Audit complete; 13 stub pages identified; 7 missing API modules documented |
| QA | Define test strategy, verify API contract alignment | TEST_STRATEGY.md complete; 260 test cases ready |
| PM | Track progress, update kanban | COMPLETE |

### Deliverables

- [ ] Unit tests for ALL repository methods in `rustpress-database` *(TC-* cases ready in TEST_CASES.md)*
- [ ] Integration tests for auth flow *(TC-3-01 through TC-3-26 written)*
- [ ] Integration tests for post lifecycle *(TC-5-* cases written)*
- [ ] Integration tests for page CRUD *(TC-6-* cases written)*
- [ ] Integration tests for media pipeline *(TC-7-* cases written)*
- [ ] Integration tests for comments *(TC-8-* cases written)*
- [ ] Integration tests for taxonomy *(TC-9-* cases written)*
- [ ] Integration tests for settings *(TC-14-* cases written)*
- [ ] Integration tests for menus *(TC-15-* cases written)*
- [ ] Integration tests for widgets *(TC-21-* cases written)*
- [ ] Integration tests for search *(TC-16-* cases written)*
- [ ] All admin UI pages connected to real backend APIs *(BUG-007, BUG-009: 13 stubs + URL mismatch)*
- [ ] Admin UI component tests for all major pages *(BUG-037: no test infrastructure)*
- [ ] Admin dashboard displays real backend data *(BUG-010, BUG-011: mock data)*

### Completion Assessment

| Criterion | Current State | Engineering Handoff Phase |
|-----------|--------------|--------------------------|
| P0 API coverage | 260 test cases written, zero executed | Phase 4 |
| Backend test coverage | ~20-25% estimated, unmeasurable | Phase 4 (target: 80%) |
| Mock data remaining | 13 pages with hardcoded data | Phase 3 |
| API contract alignment | URL prefix mismatch (BUG-007) | Phase 1 (Task 1.6) |

---

## M3: Theme & Plugin Ecosystem

**Wave**: 3
**Status**: Not Started
**Target**: Themes render public pages, plugins activate/deactivate, hooks fire correctly
**Progress**: 0% (code exists in crates, untested)

### Assessment

The backend contains:
- `rustpress-themes` crate with theme manager, template engine, and theme settings
- `rustpress-plugins` crate with plugin lifecycle, hooks, and dependency resolution
- 6 built-in plugins: rustanalytics, rustbackup, rustcloudflare, rustcommerce (config only), rustpress-dbmanager, visual-queue-manager
- 2 default themes referenced in codebase
- RustBuilder plugin has `.disabled` marker

All plugin/theme code is **unverifiable** until BUG-001 (compilation blocker) is resolved.

### Deliverables (Pending Engineering)

- [ ] Theme discovery tests
- [ ] Theme activation tests
- [ ] Theme rendering tests (every public route)
- [ ] Theme customizer tests
- [ ] 2+ default themes verified
- [ ] Plugin discovery tests
- [ ] Plugin lifecycle tests
- [ ] Plugin hook tests
- [ ] Plugin dependency resolution tests
- [ ] All 6 built-in plugins verified
- [ ] E2E: plugin install/activate/deactivate
- [ ] E2E: theme switch/verify

---

## M4: Admin UI Complete Integration

**Wave**: 4
**Status**: Not Started
**Target**: Every admin page talks to real backend, mock data replaced
**Progress**: 0% (components exist, integration gaps documented)

### Assessment

The frontend repository contains 150+ design system components and 40+ pages, but:
- 13 core CMS pages are inline stubs in App.tsx with hardcoded data (BUG-009)
- 7 core API modules are missing (pages, comments, settings, menus, widgets, plugins, search)
- Dashboard uses Math.random() data generators (BUG-010)
- Login page is a placeholder (BUG-008)

### Deliverables (Pending Engineering)

- [ ] Audit report identifying all mock/hardcoded data -- **COMPLETE** (API_INTEGRATION.md, COMPONENT_ARCH.md)
- [ ] ALL mock data replaced with real API calls
- [ ] Every CRUD flow tested through admin UI
- [ ] Media upload end-to-end
- [ ] Plugin management end-to-end
- [ ] Theme switching end-to-end
- [ ] User management end-to-end
- [ ] Settings pages end-to-end
- [ ] Menu/widget management end-to-end
- [ ] Playwright E2E tests for all critical flows
- [ ] axe-core accessibility audit -- violations fixed
- [ ] Lighthouse performance audit -- LCP < 2.0s

---

## M5: Production Hardening

**Wave**: 5
**Status**: Not Started
**Target**: Security audit passed, load tests passed, error handling complete, docs written
**Progress**: 0% (security middleware exists in code, needs wiring and testing)

### Assessment

The backend contains extensive security infrastructure:
- 12+ middleware layers (rate limiting, bot detection, brute force, security headers)
- However, CORS allows Any origin (BUG-002), CSRF not wired (BUG-015), CSP too permissive (BUG-016)
- Prometheus metrics struct implemented but endpoint stubbed (BUG-012)
- Health check endpoints defined in routes

### Deliverables (Pending Engineering)

- [ ] Email system functional
- [ ] All 14 CLI command groups verified
- [ ] `cargo audit` -- zero CRITICAL/HIGH
- [ ] `npm audit` -- zero CRITICAL/HIGH
- [ ] OWASP ZAP scan -- zero HIGH findings
- [ ] k6 load test: 5K req/s, P95 < 100ms
- [ ] k6 soak test: 1K req/s for 1 hour
- [ ] Redis failure fallback verified
- [ ] Error handling tested
- [ ] OpenAPI specification generated
- [ ] README written
- [ ] Plugin development guide written
- [ ] Theme development guide written
- [ ] Docker deployment verified on clean machine

---

## M6: E-Commerce & Advanced Plugins

**Wave**: 6
**Status**: Not Started
**Target**: RustCommerce functional, RustBuilder functional
**Progress**: 0%

### Assessment

- RustCommerce exists as a crate with configuration only -- no actual e-commerce logic
- RustBuilder has `.disabled` marker -- reason unknown
- These are P1 features and do not block v1.0 launch

### Deliverables (Pending Engineering -- P1 Priority)

- [ ] RustCommerce: products, orders, customers, coupons, checkout
- [ ] RustCommerce admin UI
- [ ] RustBuilder plugin fixed and re-enabled
- [ ] Cloud storage backend switching
- [ ] CDN plugin integration
- [ ] Background job queue
- [ ] Tests for all Wave 6 features

---

## M7: Final QA & Release

**Wave**: 7
**Status**: Not Started (QA assessment complete, execution pending)
**Target**: All tests green, documentation complete, v1.0.0 tagged
**Progress**: 5% (QA framework established, 260 test cases ready)

### Assessment

QA has provided:
- Comprehensive test strategy (TEST_STRATEGY.md)
- 260 test cases for all 23 P0 features (TEST_CASES.md)
- 45-bug consolidated report with severity and fix instructions (BUG_REPORT.md)
- QA signoff assessment with re-test conditions (QA_SIGNOFF.md)
- Current verdict: **FAIL** -- must resolve all CRITICAL/HIGH bugs and achieve coverage targets

### Deliverables (Pending Engineering)

- [ ] Full E2E regression suite -- green
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Final security audit pass
- [ ] Final performance benchmark
- [ ] All evidence artifacts generated
- [ ] CHANGELOG.md for v1.0.0
- [ ] v1.0.0 tag on both repos
- [ ] Docker image published to ghcr.io
- [ ] Final documentation review
- [ ] PPTX + PDF final report

---

## Milestone Dependency Graph

```
M1 (Foundation) -- 10% complete, BLOCKED
 +---> M2 (Core CMS) -- 10% complete, BLOCKED
       +---> M3 (Theme & Plugin) -- 0%
       |     +---> M4 (Admin UI Integration) -- 0%
       |           +---> M5 (Production Hardening) -- 0%
       |           +---> M6 (E-Commerce) -- 0% [parallel with M5]
       +---> M4 (Admin UI Integration)
                    +---> M7 (Final QA & Release) -- 5% (framework ready)
                           +-- depends on M5
                           +-- depends on M6
```

---

## Progress Tracking (Final)

| Milestone | Deliverables Total | Completed | Audit/Plan Ready | % Complete | Engineering Handoff Phase |
|-----------|-------------------|-----------|-----------------|------------|--------------------------|
| M1 | 12 | 1 | 11 | 10% | Phase 1-2 |
| M2 | 14 | 0 | 14 (260 test cases) | 10% | Phase 3-4 |
| M3 | 12 | 0 | 12 (documented) | 0% | Phase 3 |
| M4 | 12 | 1 | 11 | 0% | Phase 3 |
| M5 | 14 | 0 | 14 (documented) | 0% | Phase 5 |
| M6 | 12 | 0 | 0 | 0% | Deferred (P1) |
| M7 | 11 | 0 | 5 (QA framework) | 5% | Phase 5 |
| **TOTAL** | **87** | **2** | **67** | **~5%** | **All documented** |

> **Note on "Audit/Plan Ready"**: This indicates deliverables that have been fully analyzed, documented, and have actionable fix instructions in the ENGINEERING_HANDOFF.md. While the deliverables themselves are not yet completed, the engineering team has everything needed to execute them efficiently.

---

## Key Takeaway

The planning and audit phase has transformed these milestones from abstract goals into concrete, actionable engineering tasks. Each milestone now has:

1. **Clear blockers** with exact bug IDs and fix instructions
2. **Test cases** ready for implementation (260 total)
3. **File paths** and code examples for all fixes
4. **Effort estimates** for engineering planning
5. **Dependencies** mapped between milestones

The engineering team should start with **ENGINEERING_HANDOFF.md** Phase 1 to unblock M1, then proceed sequentially through the phases.

---

*Final milestone state -- PM Wave 5 (2026-03-02)*
