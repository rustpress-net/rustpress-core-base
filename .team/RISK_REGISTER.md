# Risk Register — RustPress CMS v1.0.0

> **Document Owner**: PM (Project Manager)
> **Created**: 2026-03-02
> **Last Updated**: 2026-03-02
> **Status**: Active

---

## Risk Severity Matrix

|  | Low Impact | Medium Impact | High Impact | Critical Impact |
|--|-----------|---------------|-------------|-----------------|
| **High Probability** | Monitor | Mitigate | Mitigate Urgently | STOP — Escalate |
| **Medium Probability** | Accept | Monitor | Mitigate | Mitigate Urgently |
| **Low Probability** | Accept | Accept | Monitor | Mitigate |

---

## Active Risks

### R01: Compiler Warnings Hide Real Bugs

| Field | Value |
|-------|-------|
| **ID** | R01 |
| **Category** | Technical |
| **Source** | Strategy Section 11 |
| **Probability** | High |
| **Impact** | High |
| **Severity** | Mitigate Urgently |
| **Description** | All 19 crates currently compile with RUSTFLAGS suppressing 5 warning categories (`Aunused`, `Amismatched_lifetime_syntaxes`, `Adependency_on_unit_never_type_fallback`, `Aunused_comparisons`, `Aambiguous_glob_reexports`). These warnings may mask real logic bugs, lifetime issues, and dead code. |
| **Mitigation** | Fix ALL warnings in Wave 2 (M1). Remove RUSTFLAGS suppression entirely. Run `cargo clippy -- -D warnings` until clean. |
| **Owner** | BE |
| **Wave** | 2 |
| **Status** | Open |

### R02: Admin UI Mock Data Masks Missing Backend Integration

| Field | Value |
|-------|-------|
| **ID** | R02 |
| **Category** | Integration |
| **Source** | Strategy Section 11 |
| **Probability** | High |
| **Impact** | High |
| **Severity** | Mitigate Urgently |
| **Description** | Multiple Zustand stores and pages use mock/hardcoded data. Until all mock data is replaced with real API calls, integration gaps remain invisible. Users will see a working UI that silently fails when connected to the backend. |
| **Mitigation** | Full mock data audit in Wave 3 (M4). Grep for hardcoded data, replace with API calls, test with empty database. |
| **Owner** | FE |
| **Wave** | 3-4 |
| **Status** | Open |

### R03: RustCommerce Plugin Is Mostly Stub

| Field | Value |
|-------|-------|
| **ID** | R03 |
| **Category** | Feature Completeness |
| **Source** | Strategy Section 11 |
| **Probability** | High |
| **Impact** | Medium |
| **Severity** | Mitigate |
| **Description** | The RustCommerce plugin exists as config/stub only — no actual e-commerce logic. Full implementation (products, orders, customers, checkout, payments, shipping, tax) is a massive effort. |
| **Mitigation** | Deferred to Wave 4 (M6). P1 priority — does not block v1.0 launch if incomplete. Focus on core product/order flow first. |
| **Owner** | BE |
| **Wave** | 4 |
| **Status** | Open |

### R04: Plugin System Instability (WordPress Hooks in Rust)

| Field | Value |
|-------|-------|
| **ID** | R04 |
| **Category** | Technical |
| **Source** | Strategy Section 11 |
| **Probability** | Medium |
| **Impact** | High |
| **Severity** | Mitigate |
| **Description** | Reimplementing WordPress's hook architecture (actions + filters) in Rust is non-trivial. Rust's ownership model makes dynamic hook registration, mutable state sharing, and plugin lifecycle management challenging. |
| **Mitigation** | Extensive plugin lifecycle tests in Wave 3 (M3). Sandboxed execution. Test all 6 built-in plugins as validation. |
| **Owner** | BE |
| **Wave** | 3 |
| **Status** | Open |

### R05: Theme Rendering Gaps (Rust Templating vs PHP)

| Field | Value |
|-------|-------|
| **ID** | R05 |
| **Category** | Technical |
| **Source** | Strategy Section 11 |
| **Probability** | Medium |
| **Impact** | High |
| **Severity** | Mitigate |
| **Description** | WordPress themes use PHP templating with dynamic includes, global state, and template hierarchy. Rust templating engines (Tera, Askama) have different paradigms. Gaps may exist in template feature coverage. |
| **Mitigation** | Define minimum template API. Ship 2+ default themes that exercise ALL features. Theme rendering tests for every public route. |
| **Owner** | BE |
| **Wave** | 3 |
| **Status** | Open |

### R06: sqlx Compile-Time Verification Slows Builds

| Field | Value |
|-------|-------|
| **ID** | R06 |
| **Category** | Developer Experience |
| **Source** | Strategy Section 11 |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | sqlx's compile-time query verification requires a running database during `cargo check`. This slows CI and local development, especially with 19 crates. |
| **Mitigation** | Use `sqlx prepare` offline mode. Cache compiled queries in `.sqlx/` directory. CI pipeline uses prepared queries. |
| **Owner** | DEVOPS |
| **Wave** | 2 |
| **Status** | Open |

### R07: Database Migration Conflicts

| Field | Value |
|-------|-------|
| **ID** | R07 |
| **Category** | Process |
| **Source** | Strategy Section 11 |
| **Probability** | Low |
| **Impact** | Medium |
| **Severity** | Accept |
| **Description** | Multiple agents working on database schema changes could create conflicting migration files. Current numbering has gaps (00001, 00002, 00023-00030) suggesting past conflicts. |
| **Mitigation** | Sequential migration numbering enforced. CI runs migrations on fresh DB. Never modify existing migrations — always add new ones. |
| **Owner** | INFRA |
| **Wave** | 2 |
| **Status** | Open |

### R08: Redis Dependency for Basic Operation

| Field | Value |
|-------|-------|
| **ID** | R08 |
| **Category** | Reliability |
| **Source** | Strategy Section 11 |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | If Redis is unavailable and moka fallback doesn't cover all code paths, the server may fail or degrade unexpectedly. |
| **Mitigation** | moka fallback already implemented. Wave 3 (M5) tests: shutdown Redis, verify ALL code paths work with moka only. |
| **Owner** | INFRA |
| **Wave** | 3 |
| **Status** | Open |

### R09: Large Codebase Slows CI

| Field | Value |
|-------|-------|
| **ID** | R09 |
| **Category** | Developer Experience |
| **Source** | Strategy Section 11 |
| **Probability** | Medium |
| **Impact** | Low |
| **Severity** | Monitor |
| **Description** | 19 crates + 150+ frontend components = long CI build times. GitHub Actions free tier has limited minutes. Slow CI discourages frequent commits. |
| **Mitigation** | Parallel CI jobs per crate. Incremental compilation caching. sccache or GitHub Actions cache for Rust. npm cache for frontend. |
| **Owner** | DEVOPS |
| **Wave** | 2 |
| **Status** | Open |

### R10: Frontend TypeScript Strict Mode Disabled

| Field | Value |
|-------|-------|
| **ID** | R10 |
| **Category** | Code Quality |
| **Source** | Strategy Section 11 |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | TypeScript strict mode is OFF. This allows `any` types, missing null checks, and implicit returns to compile without error. Type bugs may hide in the frontend codebase. |
| **Mitigation** | Enable strict mode in Wave 2 (M1). Fix type errors incrementally per module. May need phased rollout if error count is high. |
| **Owner** | FE |
| **Wave** | 2 |
| **Status** | Open |

---

## PM-Identified Additional Risks

### R11: Routes File Complexity (272KB)

| Field | Value |
|-------|-------|
| **ID** | R11 |
| **Category** | Technical Debt |
| **Source** | PM analysis |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | `crates/rustpress-server/src/routes.rs` is 272KB — an extremely large single file. This creates merge conflicts, slows IDE performance, and makes code navigation difficult. May contain duplicated logic. |
| **Mitigation** | Evaluate refactoring into route modules (one file per resource group). Only refactor if it blocks progress — avoid unnecessary churn. |
| **Owner** | BE |
| **Wave** | 2 (assess), 3 (refactor if needed) |
| **Status** | Open |

### R12: Repository File Complexity (75KB)

| Field | Value |
|-------|-------|
| **ID** | R12 |
| **Category** | Technical Debt |
| **Source** | PM analysis |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | `crates/rustpress-database/src/repository.rs` is 75KB. Large repository files are hard to test, review, and maintain. Individual methods may have inconsistent error handling. |
| **Mitigation** | Evaluate splitting into domain-specific repository files (post_repository, user_repository, etc.). Only refactor if it blocks testing. |
| **Owner** | BE |
| **Wave** | 2 (assess), 3 (refactor if needed) |
| **Status** | Open |

### R13: No Existing Test Infrastructure (Frontend)

| Field | Value |
|-------|-------|
| **ID** | R13 |
| **Category** | Quality |
| **Source** | PM analysis |
| **Probability** | High |
| **Impact** | Medium |
| **Severity** | Mitigate |
| **Description** | Admin UI has no test dependencies in `package.json` (no Vitest, Playwright, MSW, RTL). Only the visual-queue-manager plugin has 5 test files. Setting up test infrastructure from scratch takes time. |
| **Mitigation** | Wave 2 (M1): FE adds all test dependencies, configures Vitest, sets up Playwright, creates MSW handlers. Start with critical path components. |
| **Owner** | FE |
| **Wave** | 2 |
| **Status** | Open |

### R14: API Contract Drift Between Repos

| Field | Value |
|-------|-------|
| **ID** | R14 |
| **Category** | Integration |
| **Source** | PM analysis |
| **Probability** | High |
| **Impact** | High |
| **Severity** | Mitigate Urgently |
| **Description** | Backend and frontend are in separate repos. API contracts (endpoint paths, request/response shapes) may have drifted. Frontend may call endpoints that don't exist or send wrong payloads. |
| **Mitigation** | Wave 2: Generate OpenAPI spec from backend. Validate frontend API client against spec. Add API contract tests to CI. |
| **Owner** | BE + FE |
| **Wave** | 2 |
| **Status** | Open |

### R15: Missing Integration Test Coverage (Backend)

| Field | Value |
|-------|-------|
| **ID** | R15 |
| **Category** | Quality |
| **Source** | PM analysis |
| **Probability** | High |
| **Impact** | High |
| **Severity** | Mitigate Urgently |
| **Description** | Only 1 integration test file exists (`crates/rustpress-database/tests/persistence_tests.rs`). Core features (auth, posts, pages, media, comments, plugins, themes) have zero integration test coverage. |
| **Mitigation** | Wave 2 (M2): BE writes comprehensive integration tests for ALL core features. Use testcontainers for PostgreSQL/Redis in tests. |
| **Owner** | BE + QA |
| **Wave** | 2 |
| **Status** | Open |

### R16: Email System May Be Stubbed

| Field | Value |
|-------|-------|
| **ID** | R16 |
| **Category** | Feature Completeness |
| **Source** | Strategy Section 14 |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | Email endpoint exists but implementation status is unknown. Password reset and notification emails are P0 features. If stubbed, significant work needed. |
| **Mitigation** | Wave 2: BE verifies email system status. Wave 3 (M5): Implement SMTP sending if needed. Use Mailhog for testing. |
| **Owner** | BE |
| **Wave** | 2 (verify), 3 (implement) |
| **Status** | Open |

### R17: RustBuilder Plugin Disabled

| Field | Value |
|-------|-------|
| **ID** | R17 |
| **Category** | Feature Completeness |
| **Source** | Strategy Section 14 |
| **Probability** | High |
| **Impact** | Low |
| **Severity** | Monitor |
| **Description** | RustBuilder plugin has `.disabled` marker. Visual page builder is P1 but adds significant complexity. Reason for disabling unknown. |
| **Mitigation** | Deferred to Wave 4 (M6). Investigate disable reason. Only re-enable if stable. |
| **Owner** | BE |
| **Wave** | 4 |
| **Status** | Open |

### R18: Budget Exceeds Token Tolerance

| Field | Value |
|-------|-------|
| **ID** | R18 |
| **Category** | Financial |
| **Source** | COST_ESTIMATION.md |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | Estimated cost ($112.50) exceeds the strategy's $50 tolerance by 125%. User approved Option C (full execution) with $112.50 hard cap. Actual costs may vary. |
| **Mitigation** | Track token usage per wave. If costs exceed estimate by >20%, STOP and escalate to TL and user. Use phased checkpoints (Wave 2.5) to assess spend. |
| **Owner** | PM |
| **Wave** | All |
| **Status** | Open — Monitored |

### R19: Cross-Repo Coordination Complexity

| Field | Value |
|-------|-------|
| **ID** | R19 |
| **Category** | Process |
| **Source** | PM analysis |
| **Probability** | Medium |
| **Impact** | Medium |
| **Severity** | Monitor |
| **Description** | Two separate repos must stay in sync. Backend API changes must be accompanied by frontend updates in the same wave. Version alignment required. |
| **Mitigation** | Enforce cross-repo coordination rules in TIMELINE.md. API contract tests in CI. Version tags applied to both repos simultaneously. |
| **Owner** | PM + DEVOPS |
| **Wave** | All |
| **Status** | Open |

---

## Risk Summary

| Severity | Count | Risk IDs |
|----------|-------|----------|
| Mitigate Urgently | 4 | R01, R02, R14, R15 |
| Mitigate | 4 | R03, R04, R05, R13 |
| Monitor | 11 | R06, R07, R08, R09, R10, R11, R12, R16, R17, R18, R19 |
| Accept | 0 | — |

---

## Risk Review Schedule

| Review Point | Reviewer | Risks Reviewed |
|-------------|----------|----------------|
| Wave 2 start | PM + TL | All (pre-engineering assessment) |
| Wave 2.5 checkpoint | PM | R01, R02, R10, R13, R14, R15 (build health validation) |
| Wave 3 start | PM + QA | R04, R05, R08 (theme/plugin/reliability) |
| Wave 4 start | PM | R03, R17 (e-commerce/builder readiness) |
| Wave 5 end | PM + TL | All (final risk assessment before release) |

---

## Closed Risks

| ID | Description | Closed Date | Resolution |
|----|-------------|-------------|------------|
| — | — | — | — |

> *Table populated as risks are resolved during execution.*
