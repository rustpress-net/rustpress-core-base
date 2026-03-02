# Kanban Board -- RustPress CMS v1.0.0

> **Document Owner**: PM (Project Manager)
> **Created**: 2026-03-02
> **Last Updated**: 2026-03-02 (Wave 5 -- FINAL)
> **Status**: PROJECT COMPLETE (Planning & Audit Phase)
> **Board Refresh**: Final update -- all planning/audit work complete, engineering handoff ready

---

## Board Legend

| Priority | Meaning | Wave Target |
|----------|---------|-------------|
| **P0** | Must-Have (Launch Blocker) | Waves 2-5 |
| **P1** | Should-Have | Waves 3-5 |
| **P2** | Nice-to-Have | Wave 4+ (if time permits) |

| Complexity | Meaning |
|------------|---------|
| S | Small -- a few hours |
| M | Medium -- 1-2 days |
| L | Large -- 3-5 days |
| XL | Extra Large -- 1+ week |

---

## DONE

| # | Feature | Priority | Complexity | Owner | Completed | Notes |
|---|---------|----------|------------|-------|-----------|-------|
| W0 | Strategy read + cost estimation | P0 | S | TL | 2026-03-02 | Budget approved (Option C: $112.50) |
| W1 | PM planning artifacts (8 docs) | P0 | M | PM | 2026-03-02 | PROJECT_CHARTER, MILESTONES, KANBAN, TIMELINE, RISK_REGISTER, COMMIT_LOG, DECISION_LOG, TEAM_STATUS |
| W1.5-MKT | Marketing positioning & GTM | P1 | M | MKT | 2026-03-02 | POSITIONING.md, MESSAGING.md, GO_TO_MARKET.md |
| W1.5-LEGAL | License & compliance review | P1 | M | LEGAL | 2026-03-02 | LICENSE_REVIEW.md, COMPLIANCE_CHECKLIST.md, PRIVACY_POLICY_TEMPLATE.md, RISK_ASSESSMENT.md, TERMS_OF_SERVICE_TEMPLATE.md |
| W2-BE | Backend codebase audit (5 docs) | P0 | L | BE | 2026-03-02 | COMPILER_AUDIT.md, API_DESIGN.md, AUTH_FLOW.md, DB_SCHEMA.md, TEST_COVERAGE.md |
| W2-FE | Frontend codebase audit (5 docs) | P0 | L | FE | 2026-03-02 | API_INTEGRATION.md, COMPONENT_ARCH.md, STATE_MANAGEMENT.md, TEST_PLAN.md, TYPESCRIPT_AUDIT.md |
| W2-DEVOPS | DevOps audit (6 docs) | P0 | M | DEVOPS | 2026-03-02 | CICD_PIPELINE.md, DOCKER_CONFIG.md, MONITORING.md (both repos) |
| W2-INFRA | Infrastructure audit (5 docs) | P0 | M | INFRA | 2026-03-02 | ARCHITECTURE.md, COST_ESTIMATE.md, DEPLOYMENT.md, SECURITY.md, COST_ESTIMATION.md |
| W2.5-PM | PM Wave 2.5 reporting checkpoint | P0 | M | PM | 2026-03-02 | KANBAN, TEAM_STATUS, COMMIT_LOG, TIMELINE, PM_manifest updated |
| W3-QA | QA assessment (5 docs) | P0 | L | QA | 2026-03-02 | TEST_STRATEGY.md, TEST_CASES.md, TEST_RESULTS.md, BUG_REPORT.md, QA_SIGNOFF.md |
| W5-PM | Final reporting (3 docs) | P0 | M | PM | 2026-03-02 | FINAL_SUMMARY.md, ENGINEERING_HANDOFF.md, updated planning docs |

**Total Done**: 11 work packages, 46 documents produced

---

## TESTING

| # | Feature | Priority | Complexity | Owner | Notes |
|---|---------|----------|------------|-------|-------|
| -- | *Empty* | -- | -- | -- | -- |

---

## IN REVIEW

| # | Feature | Priority | Complexity | Owner | Notes |
|---|---------|----------|------------|-------|-------|
| -- | *Empty* | -- | -- | -- | -- |

---

## IN PROGRESS

| # | Feature | Priority | Complexity | Owner | Notes |
|---|---------|----------|------------|-------|-------|
| -- | *Empty* | -- | -- | -- | All AI team work complete. Engineering handoff ready. |

---

## BLOCKED (Documented -- Awaiting Engineering)

> These items were discovered during Wave 2 audits and Wave 3 QA assessment. Fix instructions are provided in ENGINEERING_HANDOFF.md.

### CRITICAL (7 items -- Fix in Engineering Phase 1)

| # | Bug ID | Issue | Severity | Owner | Fix Effort | Handoff Phase |
|---|--------|-------|----------|-------|-----------|---------------|
| B1 | BUG-001 | Missing `pageforge` plugin crate -- workspace cannot compile | CRITICAL | BE | 30 min | Phase 1, Task 1.1 |
| B2 | BUG-003 | Default JWT secret `"change-me-in-production"` -- tokens forgeable | CRITICAL | BE | 30 min | Phase 1, Task 1.3 |
| B3 | BUG-005 | Missing `backups`, `backup_schedules`, `widget_areas` tables | CRITICAL | BE | 2-3 hrs | Phase 1, Task 1.2 |
| B4 | BUG-006 | Missing `deleted_at` columns on posts/menus tables | CRITICAL | BE | 30 min | Phase 1, Task 1.2 |
| B5 | BUG-002 | CORS allows `Any` origin -- cross-site attacks | CRITICAL | BE | 1-2 hrs | Phase 1, Task 1.5 |
| B6 | BUG-007 | Frontend URL prefix mismatch (`/api` vs `/api/v1`) | CRITICAL | FE | 2-3 hrs | Phase 1, Task 1.6 |
| B7 | BUG-004 | No RBAC on 22/24 route groups -- privilege escalation | CRITICAL | BE | 2-3 hrs | Phase 2, Task 2.1 |

### HIGH (18 items -- Fix in Engineering Phase 2)

| # | Bug ID | Issue | Severity | Owner | Fix Effort | Handoff Phase |
|---|--------|-------|----------|-------|-----------|---------------|
| H1 | BUG-008 | Login page is `<div>Login Page</div>` | HIGH | FE | 4-6 hrs | Phase 1, Task 1.7 |
| H2 | BUG-009 | 13 core CMS pages are stubs with hardcoded data | HIGH | FE | 100+ hrs | Phase 3 |
| H3 | BUG-010 | Dashboard uses 100% mock data | HIGH | FE | 4-6 hrs | Phase 2, Task 2.20 |
| H4 | BUG-011 | Backend stats endpoints return fake/empty data | HIGH | BE | 3-4 hrs | Phase 2, Task 2.8 |
| H5 | BUG-012 | Prometheus metrics endpoint is stubbed | HIGH | BE | 4-6 hrs | Phase 2, Task 2.9 |
| H6 | BUG-013 | Search reindex endpoint is stubbed | HIGH | BE | 4-8 hrs | Phase 3 |
| H7 | BUG-014 | Refresh tokens stored in memory only | HIGH | BE | 2-4 hrs | Phase 2, Task 2.3 |
| H8 | BUG-015 | CSRF middleware not applied | HIGH | BE | 2-3 hrs | Phase 2, Task 2.2 |
| H9 | BUG-016 | CSP allows unsafe-inline and unsafe-eval | HIGH | BE | 3-5 hrs | Phase 2, Task 2.4 |
| H10 | BUG-017 | Docker entrypoint uses bcrypt vs Argon2 | HIGH | DEVOPS | 1-2 hrs | Phase 1, Task 1.4 |
| H11 | BUG-018 | Admin password logged to stdout | HIGH | DEVOPS | 15 min | Phase 1, Task 1.4 |
| H12 | BUG-019 | CI clippy suppresses all lints | HIGH | DEVOPS | 15 min | Phase 2, Task 2.12 |
| H13 | BUG-020 | CI RUSTFLAGS suppress 6 warning categories | HIGH | DEVOPS | 4-8 hrs | Phase 2, Task 2.13 |
| H14 | BUG-021 | No frontend CI pipeline | HIGH | DEVOPS | 2-3 hrs | Phase 2, Task 2.14 |
| H15 | BUG-022 | Bot detection is log-only by default | HIGH | BE | 30 min | Phase 2, Task 2.5 |
| H16 | BUG-023 | Security audit log is in-memory only | HIGH | BE | 3-4 hrs | Phase 2, Task 2.6 |
| H17 | BUG-024 | Rate limiter uses per-instance cache | HIGH | BE | 3-4 hrs | Phase 2, Task 2.7 |
| H18 | BUG-025 | Migration 00030 DROP CASCADE destroys data | HIGH | BE | 2-3 hrs | Phase 2, Task 2.10 |

---

## SPRINT READY (Engineering Phases 2-3)

> Items ready for engineering execution once CRITICAL blockers are resolved.

| # | Feature | Priority | Complexity | Owner | Milestone | Phase | Dependency |
|---|---------|----------|------------|-------|-----------|-------|------------|
| 1 | Remove RUSTFLAGS warning suppression | P0 | S | BE | M1 | 2 | Blockers resolved |
| 2 | Fix 400-750 compiler warnings across 20 crates | P0 | L | BE | M1 | 2 | #1 |
| 3 | Move JWT storage from localStorage to httpOnly cookies | P1 | M | FE + BE | M2 | 2 | Blockers resolved |
| 4 | Add missing DB tables (backups, widget_areas, posts.deleted_at) | P0 | M | BE | M1 | 1 | None |
| 5 | Add DOWN migration scripts for all 10 migrations | P0 | M | INFRA | M1 | 2 | Blockers resolved |
| 6 | Create frontend CI workflow (GitHub Actions) | P0 | M | DEVOPS | M1 | 2 | None |
| 7 | Fix backend CI (remove -A clippy::all, upgrade PG 15->16) | P0 | S | DEVOPS | M1 | 2 | #1 |
| 8 | Enable TypeScript strict mode (fix ~1,057 errors) | P0 | L | FE | M1 | 4 | None |
| 9 | Add non-root user to Dockerfile | P1 | S | DEVOPS | M1 | 2 | None |
| 10 | Create .dockerignore | P1 | S | DEVOPS | M1 | 2 | None |
| 11 | Create production docker-compose.yml | P1 | M | DEVOPS | M1 | 2 | None |
| 12 | Wire missing frontend API modules (pages, comments, settings, menus, widgets, plugins, search) | P0 | L | FE | M2 | 3 | Blockers resolved |
| 13 | Add Prometheus metrics wiring (currently stubbed) | P1 | M | BE | M2 | 2 | Blockers resolved |
| 14 | Connect admin dashboard to real stats (not hardcoded) | P1 | M | FE + BE | M2 | 2 | Blockers resolved |
| 15 | Replace 13 stub pages with real API-connected implementations | P0 | XL | FE | M4 | 3 | #12 |
| 16 | Write backend unit tests (auth, DB, core, content) | P0 | L | BE | M2 | 4 | Blockers resolved |
| 17 | Write backend integration tests (all P0 endpoints) | P0 | L | BE + QA | M2 | 4 | #16 |
| 18 | Write frontend store unit tests (14 stores) | P0 | M | FE | M4 | 4 | #8 |
| 19 | Write frontend component tests (top 30) | P0 | L | FE | M4 | 4 | #8 |
| 20 | Write E2E tests (Playwright, 8 critical flows) | P0 | L | QA | M4 | 4 | #15, #17 |
| 21 | Add test dependencies to frontend package.json | P0 | S | FE | M1 | 2 | None |

---

## BACKLOG

### P0 -- Queued for Engineering Phase 3+ (Themes, Plugins, Hardening)

| # | Feature | Priority | Complexity | Owner | Milestone | Target Phase |
|---|---------|----------|------------|-------|-----------|-------------|
| 10 | Theme System validation | P0 | XL | BE | M3 | 3 |
| 11 | Plugin System validation | P0 | XL | BE | M3 | 3 |
| 13 | Public Frontend Rendering | P0 | L | BE | M3 | 3 |
| 18 | Email System | P0 | M | BE | M5 | 5 |
| 21 | Widget System | P0 | M | BE | M3 | 3 |
| 22 | CLI Tools Validation | P0 | L | BE | M5 | 5 |
| 23 | Error Handling & Logging | P0 | M | BE | M5 | 5 |

### P1 -- Should-Have

| # | Feature | Priority | Complexity | Owner | Milestone | Target Phase |
|---|---------|----------|------------|-------|-----------|-------------|
| 24 | OAuth2 Social Login | P1 | L | BE | M5 | Deferred |
| 25 | WebAuthn (FIDO2) | P1 | L | BE | M5 | Deferred |
| 26 | TOTP 2FA | P1 | M | BE | M5 | Deferred |
| 27 | API Key Authentication | P1 | M | BE | M5 | Deferred |
| 28 | RustCommerce Plugin | P1 | XL | BE | M6 | Deferred |
| 29 | RustBuilder Plugin | P1 | XL | BE | M6 | Deferred |
| 30 | Cloud Storage Backends | P1 | L | BE | M6 | Deferred |
| 31 | CDN Integration | P1 | M | BE | M6 | Deferred |
| 32 | Background Jobs | P1 | L | BE | M6 | Deferred |
| 33 | Real-time Collaboration | P1 | L | BE | M6 | Deferred |
| 34 | Multi-site/Multi-tenancy | P1 | XL | BE | M6 | Deferred |
| 35 | Import/Export | P1 | L | BE | M5 | Deferred |
| 36 | Backup & Restore | P1 | M | BE | M6 | Deferred |
| 37 | Analytics Dashboard | P1 | L | BE | M6 | Deferred |
| 38 | Internationalization (i18n) | P1 | L | FE + BE | M5 | Deferred |
| 39 | Admin UI Full Test Coverage | P1 | XL | FE + QA | M4 | 4 |

### P2 -- Nice-to-Have (Deferred to v2.0)

| # | Feature | Priority | Complexity | Owner | Milestone | Target Phase |
|---|---------|----------|------------|-------|-----------|-------------|
| 40 | GraphQL API | P2 | L | BE | -- | v2.0 |
| 41 | Headless CMS Mode | P2 | M | BE | -- | v2.0 |
| 42 | Plugin Marketplace | P2 | XL | BE + FE | -- | v2.0 |
| 43 | Theme Marketplace | P2 | XL | BE + FE | -- | v2.0 |
| 44 | AI Content Assistant | P2 | L | BE + FE | -- | v2.0 |
| 45 | Advanced CRM | P2 | XL | BE + FE | -- | v2.0 |
| 46 | Serverless Functions | P2 | XL | BE | -- | v2.0 |
| 47 | Visual Query Builder | P2 | L | FE | -- | v2.0 |
| 48 | Audit Log Viewer | P2 | M | FE | -- | v2.0 |
| 49 | Performance Profiler | P2 | M | FE | -- | v2.0 |

---

## Board Statistics (Final)

| Column | P0 | P1 | P2 | Total |
|--------|----|----|-----|-------|
| Done | 8 | 3 | 0 | 11 |
| Testing | 0 | 0 | 0 | 0 |
| In Review | 0 | 0 | 0 | 0 |
| In Progress | 0 | 0 | 0 | 0 |
| Blocked (CRITICAL) | 7 | 0 | 0 | 7 |
| Blocked (HIGH) | 9 | 9 | 0 | 18 |
| Sprint Ready | 15 | 6 | 0 | 21 |
| Backlog (P0) | 7 | 0 | 0 | 7 |
| Backlog (P1) | 0 | 16 | 0 | 16 |
| Backlog (P2) | 0 | 0 | 10 | 10 |
| **Total** | **46** | **34** | **10** | **90** |

> **Note**: Total increased from 68 to 90 because Wave 3 QA assessment discovered additional bugs and test tasks. The Done column now includes all planning/audit/QA/reporting work packages (11 items producing 46 documents).

---

## Velocity Tracking (Final)

| Wave | Features Planned | Features Completed | Features Blocked | Velocity |
|------|------------------|--------------------|-------------------|----------|
| Wave 0 | 1 | 1 | 0 | 100% |
| Wave 1 | 1 | 1 | 0 | 100% |
| Wave 1.5 | 2 | 2 | 0 | 100% |
| Wave 2 | 4 | 4 | 0 | 100% |
| Wave 2.5 | 1 | 1 | 0 | 100% |
| Wave 3 (QA) | 1 | 1 | 0 | 100% |
| Wave 5 (Final) | 1 | 1 | 0 | 100% |
| **Total** | **11** | **11** | **0** | **100%** |

> All planned AI team work completed at 100% velocity. The 25 BLOCKED and 44 BACKLOG items are engineering work to be executed by the human engineering team using the ENGINEERING_HANDOFF.md document.

---

## Blocker Summary (Final -- for Engineering Team)

| Tier | Bug IDs | Total | Fix Effort | Handoff Phase |
|------|---------|-------|-----------|---------------|
| Tier 1 (Unblocks Everything) | BUG-001, BUG-005, BUG-006 | 3 | 3-4 hrs | Phase 1 |
| Tier 2 (Security Baseline) | BUG-002, BUG-003, BUG-004, BUG-015 | 4 | 5-8 hrs | Phase 1-2 |
| Tier 3 (Frontend Testing) | BUG-007, BUG-008, BUG-021, BUG-037 | 4 | 10-16 hrs | Phase 1-2 |
| Tier 4 (Production Deploy) | BUG-009, BUG-010, BUG-011, BUG-014, BUG-017, BUG-018, BUG-019, BUG-020, BUG-025 | 9 | 25-40 hrs | Phase 2-3 |

**Total blocking issues**: 7 CRITICAL + 18 HIGH = **25 issues** with documented fixes.
**Total estimated fix effort**: ~45-70 hours for all CRITICAL + HIGH bugs.

See `ENGINEERING_HANDOFF.md` for step-by-step fix instructions with exact file paths and code examples.

---

*Final board state -- PM Wave 5 (2026-03-02)*
