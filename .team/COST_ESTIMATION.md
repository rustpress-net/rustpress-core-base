# Cost Estimation — RustPress CMS
## Date: 2026-03-02T00:00:00Z
## Team: Full-Stack Team (11 roles)
## Strategy: RUSTPRESS_STRATEGY.md
## Branch: ai-develop (both repos)

---

### 1. Token & AI Cost Estimate

> Pricing basis: Claude Opus 4.6 ($15/M input, $75/M output)
> Each agent run = multiple agentic turns with file reads, code writes, bash commands

| Wave | Agents | Estimated Turns | Est. Input Tokens | Est. Output Tokens | Est. Cost (USD) |
|------|--------|-----------------|-------------------|--------------------|-----------------|
| Wave 0 | TL (init) | 10 | ~50K | ~20K | ~$2.25 |
| Wave 1 | PM (planning) | 30 | ~200K | ~100K | ~$10.50 |
| Wave 1.5 | MKT + LEGAL | 20 each | ~200K | ~80K | ~$9.00 |
| Wave 2 | BE + FE + DEVOPS + INFRA | 50 each (x4) | ~1.2M | ~400K | ~$48.00 |
| Wave 2.5 | PM (reporting) | 15 | ~100K | ~50K | ~$5.25 |
| Wave 3 | QA | 60 | ~400K | ~150K | ~$17.25 |
| Wave 3.5 | Bug fix loop (conditional) | 30 | ~200K | ~80K | ~$9.00 |
| Wave 4 | RM (release) | 20 | ~150K | ~60K | ~$6.75 |
| Wave 5 | PM (final report) | 15 | ~100K | ~40K | ~$4.50 |
| **TOTAL** | **~10 agents** | **~360 turns** | **~2.6M** | **~980K** | **~$112.50** |

> **NOTE**: Mobile Engineer (MOB) excluded — no mobile app in RustPress scope. Reduces team to 10 active agents.

### 2. External Service Costs

| Service | Purpose | Expected Cost | Payment Method | Pre-Approved? |
|---------|---------|---------------|----------------|---------------|
| PostgreSQL 16 | Database | $0 (Docker local) | N/A | Yes |
| Redis 7 | Cache | $0 (Docker local) | N/A | Yes |
| GitHub Actions | CI/CD | $0 (free tier) | N/A | Yes |
| Docker Hub / GHCR | Container registry | $0 (free tier) | N/A | Yes |
| SMTP (testing) | Email testing | $0 (local Mailhog) | N/A | Yes |
| npm packages | Test dependencies | $0 (open source) | N/A | Yes |
| cargo crates | Rust dependencies | $0 (open source) | N/A | Yes |
| **TOTAL EXTERNAL** | | **$0.00** | | |

### 3. Total Project Cost

| Category | Estimated Cost |
|----------|---------------|
| AI Token Usage (Claude Opus 4.6) | ~$112.50 |
| External Services | $0.00 |
| Infrastructure | $0.00 |
| **GRAND TOTAL** | **~$112.50** |

### 4. Budget Analysis

- **Strategy Token Budget Tolerance**: < $50 per full execution run
- **Estimated Cost**: ~$112.50
- **Status**: **EXCEEDS BUDGET by ~$62.50 (125% over)**

### 5. Cost Reduction Options

To bring the project within the $50 budget tolerance, the TL proposes these options:

#### Option A: Reduce Scope to P0 Only (~$55)
- Skip Waves 1.5 (Marketing + Legal) — save ~$9
- Skip Wave 6 (E-Commerce + Advanced Plugins) — already not in primary waves
- Use Haiku for non-critical agents (PM reporting, Legal, Marketing) — save ~$15
- Reduce Bug Fix Loop budget — save ~$5
- Combine DEVOPS + INFRA into single agent — save ~$12
- **Estimated: ~$55** (still slightly over, close to tolerance)

#### Option B: Phased Execution (~$35 per phase)
- **Phase 1** (Waves 0-2): Foundation + Core CMS = ~$35
- **Phase 2** (Waves 3-5): QA + Hardening + Release = ~$35
- **Phase 3** (Wave 6): E-Commerce + Advanced = ~$30
- User approves each phase separately

#### Option C: Approve Full Budget (~$112.50)
- Execute all 7 waves with full team
- Most thorough outcome — comprehensive testing, documentation, evidence
- Best quality, highest cost

#### Option D: Hybrid — Use Sonnet for Engineering, Opus for QA (~$65)
- Use Claude Sonnet 4.6 for Wave 2 engineering agents (cheaper, still capable)
- Keep Opus for QA, Release, and TL oversight
- Save ~40% on engineering wave tokens

### 6. Payment Governance

- **Auto-approve threshold**: $0 (always ask before any payment)
- **Requires explicit approval**: All costs above
- **Forbidden without user present**: Any recurring subscription, any external payment
- **If costs exceed estimate**: STOP and ask user

### 7. Recommendation

**TL Recommendation: Option B (Phased Execution)**

This allows the user to:
1. See Wave 0-2 results (~$35) before committing to more
2. Stop at any phase if satisfied with progress
3. Control total spend incrementally
4. Get the most critical work (build health + core CMS) done first

---

## APPROVAL STATUS: ✅ APPROVED

- **Option Selected**: C — Full Execution (~$112.50)
- **Approved By**: User
- **Approved Date**: 2026-03-02
- **Hard Cap**: $112.50
- **Scope**: All 7 waves, 10 active agents, full team
