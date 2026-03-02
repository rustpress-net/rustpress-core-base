# Project Charter — RustPress CMS v1.0.0

> **Document Owner**: PM (Project Manager)
> **Created**: 2026-03-02
> **Last Updated**: 2026-03-02
> **Status**: Active
> **Branch**: `ai-develop` (both repos)

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | RustPress CMS |
| **Version Target** | v1.0.0 (Production Release) |
| **Project Type** | Extending (MVP v0.4.0 exists — completing to v1.0.0) |
| **One-Line Vision** | A blazing-fast, secure, WordPress-compatible CMS built entirely in Rust with a modern React admin dashboard. |

### Problem Statement

WordPress powers 40%+ of the web but suffers from PHP performance limitations, security vulnerabilities, plugin conflicts, and scaling challenges. RustPress delivers WordPress-level functionality with Rust-level performance, memory safety, and concurrency.

### Desired Outcome

A production-ready, self-hostable CMS that WordPress users can migrate to — with full content management, theme/plugin ecosystems, media handling, e-commerce, and a modern admin UI — deployable via Docker in under 5 minutes.

---

## 2. Repositories

| Repo | Path | Tech Stack |
|------|------|------------|
| **Backend** | `rustpress-core-base` | Rust (Axum 0.7, Tokio, sqlx, PostgreSQL 16, Redis 7) |
| **Admin UI** | `rustpress-core-admin-ui` | React 18, TypeScript 5, Vite 6, Tailwind CSS, Zustand |

### Backend Architecture

- **19 core crates** in Cargo workspace
- **7 plugins** (rustanalytics, rustbackup, rustbuilder [disabled], rustcloudflare, rustcommerce, rustpress-dbmanager, visual-queue-manager)
- **10 migration files** for PostgreSQL schema
- **12-layer middleware stack** (Axum/Tower)

### Frontend Architecture

- **150+ components**, 40+ pages, 10+ Zustand stores
- **Monaco Editor** for code editing
- **Recharts** for dashboard analytics
- **Framer Motion** for animations

---

## 3. Scope

### In Scope (v1.0.0)

- 23 P0 features (launch blockers) — see Features section
- 16 P1 features (should-have)
- 10 P2 features (nice-to-have, if time permits)
- Full backend-to-frontend integration
- Docker production deployment
- Comprehensive test coverage (80% backend, 70% frontend)
- Documentation (README, API docs, plugin/theme dev guides)
- CI/CD pipelines for both repos
- Security hardening (OWASP, audits, rate limiting)
- Performance validation (5K req/s, P95 < 100ms)

### Out of Scope (v1.0.0)

1. GraphQL API (REST-only)
2. Mobile native apps (iOS/Android)
3. Multi-region deployment automation
4. Plugin/theme marketplace infrastructure
5. WYSIWYG visual page builder in public frontend
6. Email marketing / newsletter system
7. A/B testing framework
8. Built-in CDN (relies on external CDN services)
9. Automatic WordPress migration tool (manual WXR import supported)
10. WASM-based serverless functions runtime

---

## 4. Team Composition

| # | Role | Agent ID | Responsibilities | Primary Repo |
|---|------|----------|------------------|--------------|
| 1 | **Team Leader (TL)** | TL | Strategy alignment, cost approval, escalation, merge gates, final review | Both |
| 2 | **Project Manager (PM)** | PM | Planning, kanban, milestones, risk tracking, wave coordination, reporting | Both |
| 3 | **Backend Engineer (BE)** | BE | Rust crate development, API endpoints, database, auth, plugins, themes | Backend |
| 4 | **Frontend Engineer (FE)** | FE | React components, Zustand stores, API integration, UI/UX, accessibility | Frontend |
| 5 | **DevOps Engineer (DEVOPS)** | DEVOPS | Docker, CI/CD, GitHub Actions, build pipelines, deployment automation | Both |
| 6 | **Infrastructure Engineer (INFRA)** | INFRA | PostgreSQL optimization, Redis config, Docker Compose, health probes, monitoring | Backend |
| 7 | **QA Engineer (QA)** | QA | Test strategy, Playwright E2E, integration tests, load tests, security scans | Both |
| 8 | **Release Manager (RM)** | RM | Versioning, changelogs, release tagging, Docker image publishing, documentation | Both |
| 9 | **Marketing (MKT)** | MKT | README polish, landing page copy, feature highlights, competitive positioning | Both |
| 10 | **Legal (LEGAL)** | LEGAL | License compliance, dependency audit, GDPR readiness, privacy policy | Both |

> **NOTE**: Mobile Engineer (MOB) excluded — no mobile app in RustPress scope. Team size: 10 active agents.

### Dynamic Scaling

- PM may spawn additional specialist agents (Rust Plugin Architect, DB Specialist, Security Specialist, etc.) with TL approval
- Max concurrent agents: 15
- Scaling triggers: XL complexity, timeline slippage, 5+ blocking bugs, crate-level parallelism
- All scaling decisions documented in `.team/SCALING_LOG.md`

---

## 5. Success Criteria

### Launch Criteria (ALL must be true for v1.0.0 release)

- [ ] All 19 Rust crates compile with zero warnings (`cargo clippy -- -D warnings`)
- [ ] All P0 features (23) implemented and tested end-to-end
- [ ] Backend test coverage >= 80% (cargo-tarpaulin)
- [ ] Frontend test coverage >= 70% (vitest --coverage)
- [ ] Zero CRITICAL/HIGH security vulnerabilities (cargo-audit + npm audit + OWASP ZAP)
- [ ] E2E tests pass for all P0 user flows (Playwright)
- [ ] API P95 latency < 100ms
- [ ] Sustained throughput >= 5,000 req/s
- [ ] Admin UI LCP < 2.0s
- [ ] All 14 CLI command groups verified functional
- [ ] Docker deployment works end-to-end (`docker-compose up` to working site in < 5min)
- [ ] Database migrations reversible and tested (up + down for all 10 migration files)
- [ ] Public frontend renders correctly with default theme
- [ ] Admin UI has zero mock data in production build
- [ ] Documentation complete: README, OpenAPI spec, plugin dev guide, theme dev guide
- [ ] All environment variables documented in `.env.example`
- [ ] Email system sends actual emails

### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Server startup time | < 3 seconds | Process start to first health check |
| API P95 latency | < 100ms | k6 load test report |
| Throughput | 5,000 req/s | k6 sustained load (60s) |
| Memory usage (idle) | < 50MB | Prometheus metrics |
| Memory usage (load) | < 256MB | Prometheus at 1K concurrent |
| Docker image size | < 100MB | `docker images` output |
| Admin UI bundle size | < 5MB (gzipped) | Vite build output |
| Cold start to first paint | < 2.0s | Lighthouse audit |
| Test suite (backend) | < 10 min | CI pipeline duration |
| Test suite (frontend) | < 5 min | CI pipeline duration |

### Definition of Done

The project is "done" when a developer can:

1. Clone both repos
2. Run `docker-compose up`
3. Open `http://localhost:8080/admin`, log in with default admin credentials
4. Create a post with media, publish it
5. View the published post on the public frontend at `http://localhost:8080/post/slug`
6. Install and activate a plugin
7. Switch themes and see the frontend change
8. All of this works reliably, every time, with zero errors

---

## 6. Constraints

### Hard Constraints (Non-Negotiable)

1. All Rust code must compile with `cargo clippy -- -D warnings` (no warning suppression)
2. All API endpoints must have request/response type definitions
3. All database queries must use sqlx parameterized queries (no string concatenation)
4. All passwords hashed with Argon2id (no MD5, no bcrypt)
5. All user input validated before processing
6. JWT tokens must have configurable expiry (no hardcoded values)
7. Docker image must be multi-stage build (builder + slim runtime)
8. Admin UI must work with JavaScript disabled (graceful degradation for critical actions)
9. No secrets in source code (all via environment variables)
10. Conventional commits enforced via CI

### Soft Constraints (Preferred)

1. Prefer `sqlx` compile-time verification over runtime query building
2. Prefer Zustand over Redux for frontend state
3. Prefer Tailwind utility classes over CSS modules
4. Prefer feature flags over long-lived feature branches

### Budget Constraints

| Category | Budget | Status |
|----------|--------|--------|
| AI Token Usage (Claude Opus 4.6) | ~$112.50 | Approved (Option C) |
| External Services | $0.00 | All free tier / self-hosted |
| Infrastructure | $0.00 | Docker local dev |
| **GRAND TOTAL** | **~$112.50** | **Approved 2026-03-02** |

---

## 7. Assumptions

1. Both repos are on the `ai-develop` branch and writable
2. MVP v0.4.0 backend compiles (with suppressed warnings) and serves requests
3. PostgreSQL 16 and Redis 7 are available via Docker for local development
4. GitHub Actions free tier is sufficient for CI/CD
5. No external paid services are required for v1.0.0
6. The 19 existing crates cover the necessary domain boundaries
7. The 150+ admin UI components cover the necessary page layouts
8. SMTP testing can use local Mailhog (no external SMTP required)
9. All team agents have access to both repos
10. User is available for async escalation when confidence < 90%

---

## 8. Stakeholders

| Stakeholder | Role | Interest | Communication |
|-------------|------|----------|---------------|
| **User (Owner)** | Project sponsor, final approver | Full product delivery, quality, cost control | Async — escalation when needed |
| **Team Leader (TL)** | Technical authority | Architecture decisions, merge gates, agent oversight | Every wave boundary |
| **PM** | Planning authority | Timeline, scope, risk, coordination | Continuous |
| **Self-hosting developers** | Primary end users | Fast, secure, modern CMS alternative | Via documentation + README |
| **WordPress agencies** | Secondary end users | Scalable, reliable CMS for clients | Via documentation + migration guide |
| **Plugin developers** | Ecosystem contributors | Clear plugin API, development guide | Via plugin dev guide |
| **Theme developers** | Ecosystem contributors | Clear theme API, development guide | Via theme dev guide |

---

## 9. Governance

### Decision Authority

| Decision Type | Authority | Escalation |
|---------------|-----------|------------|
| Feature scope changes | PM + TL | User if > P1 impact |
| Architecture changes | TL | User if breaking change |
| Budget overruns (> 20%) | TL | User (mandatory) |
| Agent scaling | PM | TL approval required |
| Merge to main | TL | User approval required |
| Timeline changes | PM | TL if > 1 wave slip |
| Security exceptions | TL | User (mandatory) |

### Data Preservation Policy

- Files: archive to `.team/archive/` — NEVER delete
- Table rows: add `status: archived` — NEVER remove
- Documents: add `[ARCHIVED]` marker — NEVER erase
- Git history: NEVER rebase/squash published commits
- Database migrations: NEVER modify existing — always add new ones

### GitHub Sync Policy

- Auto-sync: Every agent completion
- Auto-push: Yes (to `ai-develop`)
- Merge to main: ONLY with explicit user approval via TL gate

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| User (Owner) | — | 2026-03-02 | Approved (Cost Option C) |
| Team Leader | TL | 2026-03-02 | Approved (Strategy v3.1) |
| Project Manager | PM | 2026-03-02 | Created this charter |
