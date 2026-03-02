# Decision Log — RustPress CMS v1.0.0

> **Document Owner**: PM (Project Manager)
> **Created**: 2026-03-02
> **Last Updated**: 2026-03-02
> **Status**: Active
> **Policy**: Every significant decision by any agent is logged here with rationale.

---

## Decision Log Format

Each entry follows the ADR (Architecture Decision Record) lightweight format:

| Field | Description |
|-------|-------------|
| **ID** | Sequential decision number (D-NNN) |
| **Date** | ISO 8601 date |
| **Title** | Short decision title |
| **Status** | Proposed / Accepted / Superseded / Deprecated |
| **Decider** | Agent(s) who made the decision |
| **Context** | Why was this decision needed? |
| **Decision** | What was decided? |
| **Alternatives** | What other options were considered? |
| **Consequences** | What are the implications? |
| **Related** | Related decisions, risks, or features |

---

## Decisions

### D-001: Approve Full Execution Budget (Option C)

| Field | Value |
|-------|-------|
| **ID** | D-001 |
| **Date** | 2026-03-02 |
| **Title** | Approve Full Execution Budget (Option C — $112.50) |
| **Status** | Accepted |
| **Decider** | TL + User |
| **Context** | Strategy specifies $50 token budget tolerance. TL estimated $112.50 for full 7-wave execution with 10 agents. Four options presented: A (scope reduction, ~$55), B (phased, ~$35/phase), C (full, ~$112.50), D (hybrid models, ~$65). |
| **Decision** | Option C selected — full execution with all 7 waves, 10 agents, $112.50 hard cap. |
| **Alternatives** | Option A (reduced scope), Option B (phased with approval gates), Option D (mixed Claude models). |
| **Consequences** | All P0 + P1 features in scope. Full test coverage. Full documentation. Higher cost but highest quality outcome. If costs exceed estimate, STOP and escalate. |
| **Related** | COST_ESTIMATION.md, Risk R18 |

### D-002: Exclude Mobile Engineer (MOB) from Team

| Field | Value |
|-------|-------|
| **ID** | D-002 |
| **Date** | 2026-03-02 |
| **Title** | Exclude Mobile Engineer from team composition |
| **Status** | Accepted |
| **Decider** | TL |
| **Context** | Full-Stack Team template includes 11 roles including Mobile Engineer. RustPress has no mobile app in v1.0 scope (Strategy Section 10 — explicitly out of scope). |
| **Decision** | Remove MOB from team. Reduce to 10 active agents: TL, PM, BE, FE, DEVOPS, INFRA, QA, RM, MKT, LEGAL. |
| **Alternatives** | Keep MOB for responsive admin UI work — rejected (FE covers responsive). |
| **Consequences** | Saves agent cost. No gap — mobile-responsive admin UI is FE responsibility. |
| **Related** | PROJECT_CHARTER.md Section 4, COST_ESTIMATION.md |

### D-003: P0 Features to Sprint Ready for Wave 2

| Field | Value |
|-------|-------|
| **ID** | D-003 |
| **Date** | 2026-03-02 |
| **Title** | Move 17 P0 features to Sprint Ready for Wave 2 |
| **Status** | Accepted |
| **Decider** | PM |
| **Context** | 23 P0 features total. Wave 2 focuses on Foundation (M1) and Core CMS (M2). Six P0 features depend on M1/M2 completion (themes, plugins, public rendering, email, widgets, CLI) and should wait for Wave 3. |
| **Decision** | 17 P0 features moved to Sprint Ready (Features #1-9, #12, #14-17, #19-20, #23). 6 P0 features remain in Backlog for Wave 3 (Features #10-11, #13, #18, #21-22). |
| **Alternatives** | Move all 23 P0 to Sprint Ready — rejected (themes/plugins depend on core features working first). |
| **Consequences** | Wave 2 is focused and achievable. Theme/plugin work deferred to Wave 3 where it has proper dependencies. |
| **Related** | KANBAN.md, MILESTONES.md (M1, M2) |

### D-004: P2 Features Deferred to v2.0

| Field | Value |
|-------|-------|
| **ID** | D-004 |
| **Date** | 2026-03-02 |
| **Title** | Defer all P2 features to v2.0 |
| **Status** | Accepted |
| **Decider** | PM |
| **Context** | 10 P2 features (GraphQL, Headless, Marketplace, AI Assistant, CRM, Serverless, Query Builder, Audit Log, Performance Profiler). These are nice-to-have and not required for v1.0 launch. Strategy Section 10 explicitly defers several of these. |
| **Decision** | All P2 features (Features #40-49) remain in Backlog with "Deferred" target wave. Will not be worked on unless all P0 and P1 features are complete with time remaining. |
| **Alternatives** | Include selective P2 items (e.g., Audit Log Viewer is useful) — rejected (focus on launch quality over feature breadth). |
| **Consequences** | Team focuses on P0 + P1 quality. P2 features documented for v2.0 roadmap. |
| **Related** | KANBAN.md, Strategy Section 10 |

---

## Decision Index

| ID | Title | Status | Wave | Decider |
|----|-------|--------|------|---------|
| D-001 | Approve Full Execution Budget | Accepted | 0 | TL + User |
| D-002 | Exclude Mobile Engineer | Accepted | 0 | TL |
| D-003 | P0 Features to Sprint Ready for Wave 2 | Accepted | 1 | PM |
| D-004 | P2 Features Deferred to v2.0 | Accepted | 1 | PM |

---

## Pending Decisions

| ID | Title | Context | Proposed By | Needs Decision From | Target Date |
|----|-------|---------|-------------|---------------------|-------------|
| — | Routes file refactoring approach | routes.rs is 272KB — split into modules or keep monolith? | PM | BE + TL | Wave 2 |
| — | Repository file splitting approach | repository.rs is 75KB — split by domain or keep monolith? | PM | BE + TL | Wave 2 |
| — | TypeScript strict mode rollout | Enable all at once or incrementally per module? | PM | FE | Wave 2 |
| — | Test database strategy | testcontainers vs CI-managed PostgreSQL vs sqlx offline mode? | PM | BE + DEVOPS | Wave 2 |

> *Pending decisions will be assigned IDs and resolved during the relevant wave.*
