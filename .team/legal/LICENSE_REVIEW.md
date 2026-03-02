# RustPress CMS -- License Review

> **Document Owner**: Legal/Compliance Attorney (LEGAL)
> **Last Updated**: 2026-03-02
> **Status**: ACTIVE
> **Applies To**: RustPress Core (backend + admin UI), plugin ecosystem, theme ecosystem, contributor agreements

---

## Table of Contents

1. [Dual License Analysis: MIT + Apache-2.0](#1-dual-license-analysis-mit--apache-20)
2. [Dependency License Audit](#2-dependency-license-audit)
3. [Plugin and Theme License Requirements](#3-plugin-and-theme-license-requirements)
4. [Contributor License Agreement (CLA)](#4-contributor-license-agreement-cla)
5. [Action Items](#5-action-items)

---

## 1. Dual License Analysis: MIT + Apache-2.0

### 1.1 Current License Configuration

RustPress uses a standard Rust ecosystem dual license, as declared in the workspace `Cargo.toml`:

```toml
license = "MIT OR Apache-2.0"
```

Both license files are present in the repository root:
- `LICENSE-MIT` -- Copyright (c) 2024-2025 RustPress Team
- `LICENSE-APACHE` -- Copyright 2024-2025 RustPress Team

### 1.2 Compatibility Assessment

| Factor | MIT | Apache-2.0 | Dual License Impact |
|--------|-----|------------|-------------------|
| **Permissiveness** | Very permissive | Permissive with patent grant | Users choose the more favorable license for their use case |
| **Patent grant** | None (silent on patents) | Explicit patent license (Sec. 3) | Apache-2.0 provides superior protection against patent claims |
| **Attribution** | Copyright notice + permission notice required | Copyright/patent/trademark/attribution notices required | Both require attribution; Apache-2.0 is slightly more demanding |
| **Copyleft** | None | None | Neither is copyleft; compatible with proprietary use |
| **Trademark** | Silent | Explicit non-grant (Sec. 6) | Apache-2.0 correctly excludes trademark rights |
| **State changes** | Not required | Must note modified files (Sec. 4(b)) | Apache-2.0 requires modified file notices |
| **Warranty disclaimer** | Yes | Yes | Both provide standard disclaimers |
| **GPL compatibility** | GPL-2.0+, GPL-3.0+ | GPL-3.0+ only (NOT GPL-2.0) | MIT provides broader GPL compatibility |

### 1.3 Why Dual License is Correct for RustPress

**VERDICT: The MIT OR Apache-2.0 dual license is well-chosen.** This is the de facto standard for the Rust ecosystem (used by Rust itself, Tokio, serde, axum, and nearly all major crates).

**Benefits:**
1. **Maximum compatibility**: Users can choose MIT for GPL-2.0 compatibility or Apache-2.0 for patent protection
2. **Rust ecosystem alignment**: Avoids friction when depending on or being depended upon by other Rust crates
3. **Commercial friendliness**: Both licenses allow proprietary derivative works, encouraging enterprise adoption
4. **Patent protection**: Apache-2.0 provides defensive patent termination (if a contributor sues over patents, their license terminates)
5. **WordPress migration path**: WordPress is GPL-2.0, and MIT is GPL-2.0-compatible, meaning RustPress code can be used in WordPress-adjacent projects

### 1.4 Known Issues and Recommendations

**ISSUE 1: Frontend license declaration**

The admin UI repository (`rustpress-core-admin-ui`) must also carry both license files and declare the license in `package.json`. Verify:

- [ ] `LICENSE-MIT` present in admin UI repo root
- [ ] `LICENSE-APACHE` present in admin UI repo root
- [ ] `package.json` includes `"license": "(MIT OR Apache-2.0)"`
- [ ] SPDX expression uses correct syntax for npm: `(MIT OR Apache-2.0)` (parentheses required for compound expressions)

**ISSUE 2: NOTICE file**

Apache-2.0 Section 4(d) requires that if a NOTICE file exists, derivative works must include it. RustPress does not currently have a NOTICE file.

- **Recommendation**: Create a `NOTICE` file in both repos listing:
  - Project name and copyright
  - Major third-party components and their licenses
  - This simplifies compliance for downstream users

**ISSUE 3: Copyright holder clarity**

Both licenses list "RustPress Team" as the copyright holder. If RustPress becomes a formal organization (foundation, LLC, etc.), the copyright should be assigned or the entity name updated.

- **Current risk**: LOW -- "RustPress Team" is acceptable for a community project
- **Future action**: If incorporating, execute copyright assignment from contributors to the entity

---

## 2. Dependency License Audit

### 2.1 Audit Approach

RustPress has a significant dependency tree across both backend (Rust/Cargo) and frontend (TypeScript/npm). All dependencies must be audited for license compatibility.

### 2.2 Backend (Rust) -- Audit Tools

**Primary tool: `cargo-license`**

```bash
# Install
cargo install cargo-license

# Run audit -- outputs all dependency licenses
cargo license --manifest-path Cargo.toml

# JSON output for automated checking
cargo license --json --manifest-path Cargo.toml > license-audit-backend.json

# Check for specific problematic licenses
cargo license --manifest-path Cargo.toml | grep -i -E "GPL|AGPL|SSPL|BSL|EUPL|OSL"
```

**Secondary tool: `cargo-deny`**

```bash
# Install
cargo install cargo-deny

# Initialize configuration
cargo deny init

# Run license check
cargo deny check licenses
```

**Recommended `deny.toml` configuration:**

```toml
[licenses]
unlicensed = "deny"
copyleft = "deny"
allow-osi-fsf-free = "neither"
confidence-threshold = 0.8

allow = [
    "MIT",
    "Apache-2.0",
    "Apache-2.0 WITH LLVM-exception",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "Unicode-DFS-2016",
    "Unicode-3.0",
    "Zlib",
    "BSL-1.0",
    "CC0-1.0",
    "OpenSSL",
]

deny = [
    "GPL-2.0",
    "GPL-3.0",
    "AGPL-1.0",
    "AGPL-3.0",
    "SSPL-1.0",
    "EUPL-1.1",
    "EUPL-1.2",
]

[[licenses.exceptions]]
allow = ["MPL-2.0"]
name = "webpki-roots"
```

### 2.3 Known Backend Dependency License Status

Based on the workspace `Cargo.toml`, the following are the direct dependencies and their expected licenses:

| Dependency | Expected License | Compatible? | Notes |
|-----------|-----------------|-------------|-------|
| tokio | MIT | YES | |
| axum | MIT | YES | |
| tower | MIT | YES | |
| tower-http | MIT | YES | |
| hyper | MIT | YES | |
| sqlx | MIT OR Apache-2.0 | YES | |
| serde | MIT OR Apache-2.0 | YES | |
| serde_json | MIT OR Apache-2.0 | YES | |
| toml | MIT OR Apache-2.0 | YES | |
| thiserror | MIT OR Apache-2.0 | YES | |
| anyhow | MIT OR Apache-2.0 | YES | |
| tracing | MIT | YES | |
| prometheus-client | MIT OR Apache-2.0 | YES | |
| jsonwebtoken | MIT | YES | |
| argon2 | MIT OR Apache-2.0 | YES | |
| uuid | MIT OR Apache-2.0 | YES | |
| redis | BSD-3-Clause | YES | |
| moka | MIT OR Apache-2.0 | YES | |
| chrono | MIT OR Apache-2.0 | YES | |
| reqwest | MIT OR Apache-2.0 | YES | |
| object_store | Apache-2.0 | YES | |
| validator | MIT | YES | |
| clap | MIT OR Apache-2.0 | YES | |
| regex | MIT OR Apache-2.0 | YES | |
| ring (transitive) | ISC-style | YES | Custom license but permissive; verify text |

**FLAG: `ring` crate** -- The `ring` cryptography crate (likely a transitive dependency via `jsonwebtoken` or TLS) uses a custom license that is ISC-like but includes OpenSSL-derived code. It is generally considered permissive and compatible, but should be explicitly verified.

### 2.4 Frontend (TypeScript/npm) -- Audit Tools

**Primary tool: `license-checker`**

```bash
# Install
npm install -g license-checker

# Run audit
cd rustpress-core-admin-ui
license-checker --json > license-audit-frontend.json

# Check for problematic licenses
license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-1.0;AGPL-3.0;SSPL-1.0"

# Summary view
license-checker --summary
```

**Alternative: `license-checker-rspack2` (faster)**

```bash
npx license-checker-rspack2 --json > license-audit-frontend.json
```

### 2.5 Known Frontend Dependency License Status

| Dependency | Expected License | Compatible? | Notes |
|-----------|-----------------|-------------|-------|
| react | MIT | YES | |
| react-dom | MIT | YES | |
| react-router | MIT | YES | |
| vite | MIT | YES | |
| tailwindcss | MIT | YES | |
| framer-motion | MIT | YES | |
| zustand | MIT | YES | |
| axios | MIT | YES | |
| recharts | MIT | YES | |
| monaco-editor | MIT | YES | |
| lucide-react | ISC | YES | |

### 2.6 CI Integration

**CRITICAL**: License auditing must be automated in CI to catch new problematic dependencies.

- [ ] Add `cargo deny check licenses` to backend CI pipeline
- [ ] Add `npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0;SSPL-1.0"` to frontend CI pipeline
- [ ] Generate license report artifact on each release build
- [ ] Create `THIRD_PARTY_LICENSES.md` or `THIRD_PARTY_LICENSES.txt` as part of release process

### 2.7 Transitive Dependency Risks

| Risk | Description | Mitigation |
|------|------------|-----------|
| License change in upstream | A dependency changes license in a new version | Pin versions in CI; `cargo deny` catches changes on update |
| Unlicensed code | Transitive dependency has no license declaration | `cargo deny` flags "unlicensed" crates; review manually |
| "License: SEE LICENSE IN ..." | npm packages with custom licenses | license-checker flags these; manual review required |
| Dual-meaning licenses | "BSD" without version specifier | Verify exact license text; usually BSD-2-Clause or BSD-3-Clause |

---

## 3. Plugin and Theme License Requirements

### 3.1 Plugin Ecosystem License Policy

RustPress's plugin architecture is a key differentiator. The license policy for the ecosystem must balance openness with legal clarity.

**CRITICAL DECISION: RustPress is NOT copyleft.**

Unlike WordPress (which is GPL-2.0 and controversially requires all plugins/themes to also be GPL), RustPress's MIT/Apache-2.0 dual license does NOT require plugins or themes to be open source. This is a deliberate choice with significant implications.

### 3.2 Recommended Plugin License Policy

| Plugin Distribution Channel | License Requirement | Rationale |
|-----------------------------|-------------------|-----------|
| **Bundled with RustPress** (built-in plugins) | MIT OR Apache-2.0 (same as core) | Must match project license |
| **Official plugin registry** (future marketplace) | Any OSI-approved open source license | Ensures auditability and forkability |
| **Third-party distribution** (GitHub, npm, etc.) | Any license (including proprietary) | Cannot restrict; MIT/Apache-2.0 allows it |

### 3.3 Plugin License Declaration Standard

All plugins distributed through official channels MUST include:

```toml
# plugin.toml
[plugin]
name = "my-plugin"
version = "1.0.0"
license = "MIT"  # SPDX identifier required
license_file = "LICENSE"  # Must be present in plugin root
```

- [ ] Plugin loader must parse and validate `license` field
- [ ] Admin UI plugin management page must display license information
- [ ] Plugin installation must warn if license is not recognized (non-SPDX)
- [ ] Plugin installation must block if license field is missing

### 3.4 Theme License Policy

Same policy as plugins. Themes bundled with RustPress must be MIT OR Apache-2.0. Third-party themes may use any license.

### 3.5 Plugin/Theme License Compatibility Matrix

When a plugin or theme depends on other licensed code, compatibility matters:

| Plugin License | Can use MIT deps? | Can use Apache-2.0 deps? | Can use GPL-3.0 deps? | Can use proprietary deps? |
|---------------|-------------------|--------------------------|----------------------|--------------------------|
| MIT | YES | YES | Only if plugin is also GPL-3.0 | Depends on proprietary terms |
| Apache-2.0 | YES | YES | Only if plugin is also GPL-3.0 | Depends on proprietary terms |
| GPL-2.0 | YES | NO (incompatible) | NO (version mismatch) | NO |
| GPL-3.0 | YES | YES | YES | NO |
| Proprietary | YES | YES (with attribution) | NO | Depends |

### 3.6 Plugin Marketplace Legal Requirements (Future)

When the plugin/theme marketplace is implemented (P2 feature), the following legal infrastructure is needed:

- [ ] Developer agreement for marketplace publishers
- [ ] License verification on upload (SPDX parsing)
- [ ] DMCA takedown procedure
- [ ] Trademark usage guidelines for plugin names (cannot use "RustPress" in misleading ways)
- [ ] Liability disclaimer (RustPress not responsible for third-party plugin behavior)
- [ ] Revenue sharing terms (if applicable)
- [ ] Data processing terms for marketplace user data

---

## 4. Contributor License Agreement (CLA)

### 4.1 Recommendation

**RECOMMENDATION: Implement a lightweight CLA using the Developer Certificate of Origin (DCO) model.**

A full CLA (like Apache ICLA or Google CLA) is heavyweight and can deter contributors. The DCO model, used by Linux, GitLab, and many Rust projects, is simpler and achieves the key legal goals.

### 4.2 Options Comparison

| Approach | Legal Protection | Contributor Friction | Implementation Effort |
|----------|-----------------|---------------------|----------------------|
| **No CLA** | LOW -- Cannot relicense; contributor claims possible | None | None |
| **DCO (Signed-off-by)** | MEDIUM -- Certifies contributor has right to submit; establishes license grant | Very Low (one git flag) | Low (CI check) |
| **Lightweight CLA (CLA Assistant)** | HIGH -- Explicit copyright/patent grant; relicense permission | Low (one-time GitHub click) | Medium (CLA bot setup) |
| **Full CLA (Apache ICLA)** | HIGHEST -- Comprehensive legal protections | High (mail-in form, wet signature) | High |

### 4.3 Recommended Approach: DCO + CLA Assistant Hybrid

**Phase 1 (Immediate -- v1.0)**: Implement DCO

The Developer Certificate of Origin requires contributors to add a `Signed-off-by` line to each commit, certifying they have the right to submit the code under the project's license.

**DCO text** (standard version 1.1):

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project and the open source license(s) involved.
```

**Implementation:**

- [ ] Add `DCO` file to both repository roots
- [ ] Require `Signed-off-by: Name <email>` trailer on all commits
- [ ] Add [DCO GitHub App](https://github.com/apps/dco) to both repos (free, automated PR check)
- [ ] Document in `CONTRIBUTING.md`: `git commit -s` flag auto-adds the sign-off
- [ ] CI check: Reject PRs without DCO sign-off

**Phase 2 (If needed -- pre-v2.0 or before accepting corporate contributions)**: Add CLA Assistant

If the project grows to the point where relicensing might be needed (e.g., adding AGPL option for SaaS protection), implement [CLA Assistant](https://github.com/cla-assistant/cla-assistant):

- One-time signature via GitHub OAuth
- Stored centrally; no per-commit overhead
- Grants explicit patent and copyright license
- Permits relicensing by the project (important for future flexibility)

### 4.4 Corporate Contributor Considerations

If corporations contribute to RustPress, additional considerations apply:

- [ ] Corporate contributors should verify their employer's IP policy permits open source contribution
- [ ] Consider a Corporate CLA (CCLA) template for large organizational contributors
- [ ] Document in CONTRIBUTING.md that contributors represent they have authority to license their contributions

### 4.5 AI-Generated Code Policy

**FLAG: EMERGING RISK**

Given that RustPress development uses AI coding assistants, the project should establish a policy on AI-generated contributions:

- [ ] Contributors must disclose if code is AI-generated (per DCO clause (a) -- "created in whole or in part by me")
- [ ] AI-generated code must be reviewed by a human contributor who takes responsibility
- [ ] The `Co-Authored-By` convention for AI tools should be documented and permitted
- [ ] Note: Copyright status of AI-generated code is unsettled law in most jurisdictions; human review and modification establishes human authorship claim

---

## 5. Action Items

### Immediate (Wave 1-2)

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | Add `cargo-deny` to CI pipeline with `deny.toml` config from Section 2.2 | DevOps | HIGH |
| 2 | Add `license-checker` to frontend CI pipeline | DevOps | HIGH |
| 3 | Add DCO file to both repos | LEGAL | HIGH |
| 4 | Install DCO GitHub App on both repos | LEGAL/DevOps | HIGH |
| 5 | Create `CONTRIBUTING.md` with DCO instructions | LEGAL | HIGH |
| 6 | Verify admin UI repo has both license files and correct `package.json` license field | LEGAL | HIGH |
| 7 | Run initial `cargo license` audit and review all transitive dependencies | LEGAL | MEDIUM |
| 8 | Run initial `license-checker` audit on admin UI | LEGAL | MEDIUM |

### Short-Term (Wave 3-4)

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 9 | Implement plugin license declaration standard (`plugin.toml` license field) | Backend Eng | MEDIUM |
| 10 | Display plugin license in admin UI plugin management page | Frontend Eng | MEDIUM |
| 11 | Create `NOTICE` file listing major third-party components | LEGAL | MEDIUM |
| 12 | Generate `THIRD_PARTY_LICENSES.txt` as release artifact | DevOps | MEDIUM |

### Medium-Term (Wave 5-7)

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 13 | Evaluate CLA Assistant need based on contributor growth | LEGAL | LOW |
| 14 | Draft plugin marketplace developer agreement | LEGAL | LOW |
| 15 | Draft AI-generated code contribution policy | LEGAL | LOW |
| 16 | Review and update copyright year annually | LEGAL | LOW |

---

**Document maintained by**: Legal/Compliance Attorney (LEGAL), Full-Stack Team
**Review cadence**: Every major release + when adding new dependencies
