# RustPress CMS -- Legal Risk Assessment

> **Document Owner**: Legal/Compliance Attorney (LEGAL)
> **Last Updated**: 2026-03-02
> **Status**: ACTIVE -- Review at each wave and before any public release
> **Classification**: Internal planning document

---

## Table of Contents

1. [WordPress Trademark Considerations](#1-wordpress-trademark-considerations)
2. [Plugin Ecosystem Liability](#2-plugin-ecosystem-liability)
3. [User Data Handling Risks](#3-user-data-handling-risks)
4. [Open Source Contribution Risks](#4-open-source-contribution-risks)
5. [Additional Legal Risks](#5-additional-legal-risks)
6. [Risk Register Summary](#6-risk-register-summary)

---

## 1. WordPress Trademark Considerations

### Risk Level: HIGH -- Requires Immediate Attention

### 1.1 Background

The WordPress trademark is owned by the **WordPress Foundation** (a 501(c)(3) nonprofit). The WordPress Foundation has published a [Trademark Policy](https://wordpressfoundation.org/trademark-policy/) that governs use of the "WordPress" name, "WP" abbreviation, and the WordPress logo.

RustPress's strategy document explicitly positions it as a "WordPress alternative" and references WordPress compatibility, WordPress-style hooks, WordPress WXR import, and WordPress-like admin UX. This creates trademark exposure that must be carefully managed.

### 1.2 Current Risk Areas

| Area | Current Usage | Risk Level | Assessment |
|------|--------------|------------|------------|
| **Project name "RustPress"** | Core identity | MEDIUM | Does NOT contain "WordPress" or "WP." The "-Press" suffix is generic (used by many projects: Ghost, Strapi, Keystone). No infringement. |
| **Strategy document language** | "WordPress alternative," "WordPress-compatible" | MEDIUM | Nominative fair use is permitted for comparison. Must be truthful and not imply endorsement. |
| **Plugin hook naming** | WordPress-style action/filter hooks | LOW | Functional compatibility is not trademark infringement. API compatibility is generally permissible. |
| **WXR import feature** | WordPress eXtended RSS import | LOW | Importing a standard file format is not trademark use. WXR is a published format. |
| **Admin UI design** | WordPress-inspired admin layout | LOW | UI patterns are not protectable by trademark (they may be protectable by trade dress, but WordPress's admin UI is not distinctive enough for trade dress). |
| **"WordPress migration"** | Documentation referencing migration from WordPress | MEDIUM | Nominative fair use for comparison. Must say "migrate FROM WordPress" not imply partnership. |
| **Domain names** | None currently registered | N/A | Do NOT register domains containing "WordPress" or "WP" |
| **Marketing materials** | Future concern | HIGH if mishandled | Must follow guidelines below |

### 1.3 Safe Language Guidelines

**SAFE (nominative fair use):**
- "RustPress is a CMS alternative to WordPress"
- "Migrate your content from WordPress to RustPress"
- "RustPress supports importing WordPress WXR export files"
- "A modern CMS inspired by the WordPress content model"
- "Compatible with WordPress export formats"

**UNSAFE (implies affiliation or endorsement):**
- ~~"RustPress for WordPress"~~ (implies it IS WordPress)
- ~~"The WordPress replacement built in Rust"~~ (appropriates the WordPress brand)
- ~~"WordPress-compatible CMS"~~ (implies official compatibility certification)
- ~~"WP-compatible"~~ (uses WP abbreviation in product context)
- ~~"Built on WordPress technology"~~ (false and misleading)
- ~~"Endorsed by WordPress"~~ (false)
- ~~"RustPress: WordPress, but faster"~~ (equates the two products)

**Recommended standard disclaimer for marketing/docs:**
> "WordPress is a registered trademark of the WordPress Foundation. RustPress is an independent project and is not affiliated with, endorsed by, or sponsored by the WordPress Foundation."

### 1.4 Required Actions

| # | Action | Priority | Status |
|---|--------|----------|--------|
| 1 | Add WordPress trademark disclaimer to README.md | HIGH | [ ] NOT DONE |
| 2 | Review all documentation for unsafe WordPress references | HIGH | [ ] NOT DONE |
| 3 | Add disclaimer to project website (when created) | HIGH | [ ] FUTURE |
| 4 | Do NOT use "WP" in any RustPress feature names, CLI commands, or API endpoints | HIGH | [ ] VERIFY |
| 5 | Ensure strategy document internal language is cleaned up before any public sharing | MEDIUM | [ ] NOT DONE |
| 6 | Consider registering "RustPress" as a trademark (see Section 1.5) | MEDIUM | [ ] FUTURE |

### 1.5 RustPress Trademark Registration

**Recommendation**: Register "RustPress" as a trademark once the project reaches v1.0 and has a formal entity.

**Benefits:**
- Prevents others from creating confusingly similar products (e.g., "RustPress Pro", "RustPress Cloud")
- Establishes priority date for the mark
- Enables enforcement against squatters

**Estimated cost**: $250-$400 USD per class (USPTO), or $800-$1500 via a trademark attorney

**Classes to consider**:
- Class 9: Computer software
- Class 42: Software as a service (if SaaS offering planned)

### 1.6 "Rust" Name Consideration

The Rust programming language trademark is owned by the **Rust Foundation**. Using "Rust" in "RustPress" to describe software written in Rust is nominative fair use and is permitted under the [Rust trademark policy](https://foundation.rust-lang.org/policies/logo-policy-and-media-guide/), provided:
- It accurately describes the software (RustPress IS written in Rust)
- It does not imply endorsement by the Rust Foundation
- The Rust logo is not used as the RustPress logo

**Assessment**: LOW RISK -- Current usage is compliant.

---

## 2. Plugin Ecosystem Liability

### Risk Level: MEDIUM -- Requires policy framework before marketplace launch

### 2.1 Liability Exposure from Third-Party Plugins

When site operators install third-party plugins, several liability scenarios arise:

| Scenario | Who is liable? | RustPress exposure | Mitigation |
|----------|---------------|-------------------|-----------|
| Plugin contains malware | Plugin developer (primary); site operator (for not vetting) | LOW if adequate disclaimers | Clear "install at your own risk" warnings; automated security scanning |
| Plugin causes data breach | Plugin developer + site operator | LOW-MEDIUM | Plugin permission system to limit data access; security review process |
| Plugin infringes third-party IP | Plugin developer | LOW if DMCA process exists | DMCA takedown procedure; developer agreement requiring IP ownership |
| Plugin violates privacy law (collects data without consent) | Site operator (primary); plugin developer | LOW if disclosure required | Require plugins to declare data collection in manifest; admin UI shows data disclosure |
| Plugin conflicts cause site outage | No one (software limitation) | LOW | Disclaimer of warranty; plugin conflict detection system |
| Malicious plugin sold on marketplace | Marketplace operator (RustPress) | MEDIUM-HIGH | Mandatory review process; developer identity verification; escrow for payments |

### 2.2 Plugin Permission System (Recommended)

To limit liability and protect site operators, implement a plugin permission model:

```toml
# plugin.toml
[permissions]
database_read = ["posts", "comments"]  # Tables the plugin can read
database_write = ["posts"]              # Tables the plugin can write
user_data_access = false                # Whether plugin accesses PII
network_access = ["api.example.com"]    # External domains plugin contacts
file_system_access = ["uploads/"]       # Filesystem paths plugin can access
hooks = ["before_publish", "after_comment"]  # Hooks plugin registers
```

- [ ] Admin UI displays permission summary before plugin activation
- [ ] Plugin runtime enforces declared permissions (sandboxing)
- [ ] Plugins that access user data must include a privacy disclosure

### 2.3 Plugin Security Policy

- [ ] All marketplace plugins must pass `cargo audit` (Rust) or `npm audit` (JS) with zero CRITICAL/HIGH
- [ ] Plugins must not include obfuscated code
- [ ] Plugins must not transmit data to external services without explicit disclosure
- [ ] Security vulnerability reports for plugins must be handled within 72 hours
- [ ] Unresponsive plugin developers: plugin delisted after 30 days of no response to critical security issue

### 2.4 DMCA and IP Takedown Process

For the future marketplace:

- [ ] Designated DMCA agent registered with US Copyright Office (required if hosting user-generated content in the US)
- [ ] Published DMCA takedown procedure on marketplace website
- [ ] Counter-notification process for disputed takedowns
- [ ] Repeat infringer policy (three strikes)
- [ ] Estimated cost: $6 filing fee for DMCA agent registration

---

## 3. User Data Handling Risks

### Risk Level: HIGH -- Core CMS functionality involves personal data

### 3.1 Risk Matrix

| Risk | Probability | Impact | Overall | Description |
|------|-------------|--------|---------|-------------|
| Data breach via SQL injection | VERY LOW | CRITICAL | MEDIUM | sqlx parameterized queries prevent SQLi; risk is near-zero if consistently used |
| Data breach via authentication bypass | LOW | CRITICAL | HIGH | JWT implementation must be flawless; token invalidation, refresh rotation, session management |
| GDPR non-compliance by site operator | HIGH | HIGH | HIGH | Site operators may deploy without privacy policy or consent mechanisms |
| Excessive data collection in default config | MEDIUM | MEDIUM | MEDIUM | Default settings must minimize data collection (privacy by design) |
| Data retained beyond necessary period | HIGH | MEDIUM | HIGH | No automated retention enforcement currently exists |
| Cross-border data transfer without safeguards | MEDIUM | HIGH | HIGH | Cloud deployments may store EU data in non-adequate countries |
| Insecure password storage | VERY LOW | CRITICAL | LOW | Argon2id is state-of-the-art; risk is only if misconfigured |
| Media files exposing EXIF data | HIGH | LOW | MEDIUM | Uploaded photos may contain GPS coordinates, device info |
| Insufficient access logging | MEDIUM | MEDIUM | MEDIUM | Cannot detect breaches without adequate audit trails |
| Plugin access to user data without consent | MEDIUM | HIGH | HIGH | No plugin permission system currently exists |

### 3.2 Default Admin Account Risk

**FLAG: IMMEDIATE CONCERN**

The initial migration (`00001_initial_schema.sql`) creates a default admin user with password `admin123`:

```sql
INSERT INTO users (email, username, password_hash, display_name, role, status, email_verified_at) VALUES
    ('admin@rustpress.local', 'admin', '$argon2id$v=19$m=19456,t=2,p=1$...', 'Administrator', 'administrator', 'active', NOW())
```

**Risks:**
- If site operators do not change the default password, the site is immediately compromised
- The Argon2id hash of `admin123` is publicly known (in the open source repo)
- Automated scanners will attempt this credential pair

**Required mitigations:**
- [ ] Force password change on first admin login (mandatory, not optional)
- [ ] Display prominent warning in admin UI until default password is changed
- [ ] CLI setup wizard should prompt for admin password during `rustpress-migrate`
- [ ] Remove hardcoded admin credentials from migration; generate random password at install time
- [ ] Log security warning at startup if default admin password is still in use

### 3.3 Personal Data Inventory

All tables containing personal data that require GDPR consideration:

| Table | Personal Data Fields | Sensitivity | Erasure Required? |
|-------|---------------------|-------------|-------------------|
| `users` | email, username, display_name, avatar_url, password_hash, last_login_at, meta | HIGH | YES -- full deletion |
| `comments` | author_name, author_email, author_url (for guest commenters) | MEDIUM | YES -- anonymize or delete |
| `media` | uploaded_by (FK to users), EXIF data in files | MEDIUM | YES -- unlink or delete |
| `posts` | author_id (FK to users) | LOW (authorship) | ANONYMIZE -- content may have independent retention basis |
| `pages` | author_id (FK to users) | LOW | ANONYMIZE |
| `collaboration_sessions` | user_id, session_token, metadata | HIGH | YES -- delete on account deletion |
| `file_presence` | user_id, user_color | LOW | YES -- ephemeral, auto-cleanup |
| `chat_conversations` | created_by | MEDIUM | ANONYMIZE or DELETE |
| `chat_messages` | (likely contains sender_id, content) | HIGH | DELETE or ANONYMIZE |
| `password_reset_tokens` | (likely contains user_id, email) | HIGH | YES -- auto-expire + cleanup |

### 3.4 Encryption at Rest

**Current state**: The strategy mentions "AES-256 for sensitive fields at rest" but implementation status is unknown.

**Minimum requirements:**
- [ ] Password hashes: Argon2id (IMPLEMENTED -- verified in migration)
- [ ] API keys: Encrypted at rest in database (NOT just hashed -- need to retrieve)
- [ ] OAuth tokens: Encrypted at rest
- [ ] Session tokens: Not stored in DB (JWT is stateless); refresh tokens if stored must be hashed
- [ ] Media files: Encryption at rest via storage backend (cloud storage handles this; local storage needs docs)
- [ ] Database backups: Must be encrypted

### 3.5 Data Minimization Audit

Review each data collection point for necessity:

| Data Point | Currently Collected | Necessary? | Recommendation |
|-----------|-------------------|------------|----------------|
| User email | YES | YES (auth, notifications) | Keep |
| User IP (comments) | NOT VERIFIED | CONDITIONAL (anti-spam) | Collect only if anti-spam enabled; hash after 30 days |
| User-Agent (requests) | Via server logs | CONDITIONAL (security) | Ensure log rotation; do not store permanently |
| Full request body logging | UNKNOWN | NO | Ensure request bodies are NOT logged in production |
| Comment author email (guests) | YES | CONDITIONAL | Make optional; explain purpose |
| Comment author URL (guests) | YES | NO (nice-to-have) | Make optional; not strictly necessary |
| EXIF data in media | YES (not stripped) | NO | Strip EXIF on upload (preserve only dimensions) |

---

## 4. Open Source Contribution Risks

### Risk Level: MEDIUM -- Standard risks for open source projects

### 4.1 IP Contamination Risk

| Risk | Description | Probability | Mitigation |
|------|------------|-------------|-----------|
| Contributor submits copyrighted code | Code copied from proprietary or incompatibly-licensed projects | LOW-MEDIUM | DCO sign-off; code review; CI license scanning |
| Contributor submits employer-owned code | Contributor's employment agreement assigns IP to employer | LOW | DCO clause (a) addresses this; corporate CLA for large contributors |
| AI-generated code IP uncertainty | Copyright status of AI-generated code is legally unsettled | MEDIUM | Human review requirement; DCO sign-off by human reviewer |
| Patent encumbrance | Contributed code implements patented algorithm | LOW | Apache-2.0 patent grant provides some protection; patent review for crypto/compression |

### 4.2 Supply Chain Security Risks

| Risk | Description | Probability | Impact | Mitigation |
|------|------------|-------------|--------|-----------|
| Compromised dependency | Upstream crate/npm package is hijacked | LOW | CRITICAL | `cargo audit` + `npm audit` in CI; Dependabot alerts enabled; pin dependency versions |
| Typosquatting | Contributor adds a typosquatted dependency | LOW | HIGH | `cargo deny` in CI; review all new dependency additions manually |
| Dependency license change | Upstream changes from MIT to AGPL | LOW | HIGH | `cargo deny` license check in CI; alerts on dependency updates |
| Abandoned dependency | Critical dependency stops receiving security patches | MEDIUM | MEDIUM | Monitor dependency health; have migration plan for key dependencies |

### 4.3 Contributor Conduct Risks

| Risk | Description | Mitigation |
|------|------------|-----------|
| Code of Conduct violations | Toxic behavior in issues/PRs | Adopt and enforce a Code of Conduct (e.g., Contributor Covenant) |
| Sabotage/backdoor | Malicious contributor inserts backdoor | Mandatory code review for all PRs; CI security scanning; branch protection |
| Burnout/abandonment | Key maintainers leave | Bus factor mitigation: document everything; multiple maintainers with admin access |
| Legal threats from contributors | Contributor threatens to revoke license | MIT/Apache-2.0 grants are irrevocable; DCO provides additional protection |

### 4.4 Required Contributor Documentation

- [ ] `CONTRIBUTING.md` -- Contribution guidelines, DCO requirement, coding standards
- [ ] `CODE_OF_CONDUCT.md` -- Contributor Covenant or similar
- [ ] `SECURITY.md` -- Vulnerability disclosure process
- [ ] `DCO` -- Developer Certificate of Origin text
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` -- PR template with DCO reminder

---

## 5. Additional Legal Risks

### 5.1 Export Control

Rust's cryptographic libraries (ring, rustls, argon2) may be subject to export control regulations:

- **US EAR (Export Administration Regulations)**: Open source cryptographic software is generally exempt under EAR 740.13(e) if publicly available. RustPress is published on GitHub (publicly available), so this exemption likely applies.
- **Required action**: File a notification with the Bureau of Industry and Security (BIS) and NSA before public release. This is a technical requirement; non-compliance risk is LOW but non-zero.
- [ ] File EAR notification before v1.0 public release (email to crypt@bis.doc.gov and enc@nsa.gov)

### 5.2 Accessibility Compliance

- **ADA (Americans with Disabilities Act)**: Websites may be considered "places of public accommodation." The admin UI's WCAG 2.1 AA target (from strategy) is appropriate.
- **EAA (European Accessibility Act)**: Takes effect June 2025 for new products. Applies to e-commerce websites (relevant when RustCommerce is enabled).
- **Risk**: LOW for the open source project itself; MEDIUM for site operators who deploy public-facing sites.
- [ ] Document accessibility compliance target in README

### 5.3 E-Commerce Legal Requirements (RustCommerce Plugin)

When RustCommerce is implemented (P1 feature), additional legal requirements apply:

- [ ] Consumer rights (returns, cancellations) -- EU Consumer Rights Directive, US state consumer protection laws
- [ ] Payment card industry (PCI DSS) compliance -- if handling card data directly
- [ ] Tax calculation liability -- sales tax, VAT
- [ ] Pricing transparency -- no hidden fees
- [ ] Digital Services Act (EU) -- platform liability for marketplace sellers
- [ ] Terms template for e-commerce sites

**Recommendation**: RustCommerce should NEVER directly handle payment card data. Use payment gateways (Stripe, PayPal) that handle PCI compliance. Document this requirement clearly.

### 5.4 Content Liability

RustPress enables user-generated content. Liability framework:

| Jurisdiction | Safe Harbor | Requirements |
|-------------|------------|-------------|
| US (Section 230) | Broad immunity for platform operators | Act as platform, not publisher; honor DMCA |
| EU (Digital Services Act) | Conditional immunity | Notice-and-action procedure; transparency reports for large platforms |
| UK (Online Safety Act) | Duty of care | Age verification for harmful content; risk assessments |

**RustPress responsibility**: Provide content moderation tools (comment moderation, user blocking, content reporting). Site operators are responsible for implementing appropriate moderation policies.

### 5.5 AI Content Risks (Future)

The strategy includes an AI Content Assistant as a P2 feature. Legal considerations:

- AI-generated content may not be copyrightable (US Copyright Office position)
- AI-generated content must be disclosed in some jurisdictions (EU AI Act)
- AI content assistant must not generate defamatory, infringing, or harmful content
- [ ] When implementing AI features, add clear disclosure that content is AI-generated
- [ ] Add content filtering/safety measures to AI assistant

---

## 6. Risk Register Summary

### Heat Map

```
                    IMPACT
                Low    Medium    High    Critical
            +--------+---------+--------+----------+
  Very Low  |        |         |  SQLi  | Password |
            |        |         | (VL/H) |  (VL/C)  |
            +--------+---------+--------+----------+
  Low       | UI     | Log     | Auth   | Supply   |
 P          | access | rotation| bypass | chain    |
 R          | (L/L)  | (L/M)  | (L/C)  | (L/C)    |
 O          +--------+---------+--------+----------+
 B          | EXIF   | Default | Plugin | GDPR     |
 A Medium   | data   | config  | data   | non-     |
 B          | (M/L)  | (M/M)  | access | comply   |
 I          |        |         | (M/H)  | (M/H)    |
 L          +--------+---------+--------+----------+
 I High     |        | Data    | WP     |          |
 T          |        | retent. | trade- |          |
 Y          |        | (H/M)  | mark   |          |
            |        |         | (H/H)  |          |
            +--------+---------+--------+----------+
```

### Top 5 Risks Requiring Immediate Action

| # | Risk | Level | Required Action | Owner | Deadline |
|---|------|-------|-----------------|-------|----------|
| 1 | **Default admin password in public repo** | CRITICAL | Remove hardcoded password; force change on first login; generate random password at install | Backend Eng | Wave 1 |
| 2 | **No GDPR data export/erasure endpoints** | HIGH | Implement `/users/{id}/export` and `DELETE /users/{id}` with cascading cleanup | Backend Eng | Wave 2 |
| 3 | **WordPress trademark exposure in docs** | HIGH | Add disclaimer to README; audit all docs for unsafe references | LEGAL | Wave 1 |
| 4 | **No consent collection mechanism** | HIGH | Add consent checkbox to registration; create consent_records table | Backend + Frontend | Wave 2 |
| 5 | **No dependency license audit in CI** | HIGH | Add `cargo deny` and `license-checker` to CI pipelines | DevOps | Wave 1 |

### Risks Acceptable at Current Level

| Risk | Level | Rationale for Acceptance |
|------|-------|-------------------------|
| "RustPress" name contains "Press" | LOW | "-Press" is generic and widely used; no WordPress trademark issue |
| "Rust" in project name | LOW | Nominative fair use; accurately describes the technology |
| AI-generated code copyright uncertainty | LOW | Human review and DCO sign-off provide adequate protection for now |
| Export control for crypto libraries | LOW | Open source exemption applies; notification is low-effort |
| Accessibility compliance for open source project | LOW | Target is documented; site operators bear compliance responsibility |

---

## Appendix A: Legal Action Checklist for v1.0 Release

Before tagging v1.0.0, the following MUST be completed:

- [ ] WordPress trademark disclaimer in README.md and project website
- [ ] Both license files present and correct in both repos
- [ ] DCO file in both repos
- [ ] CONTRIBUTING.md with legal requirements
- [ ] SECURITY.md with vulnerability disclosure process
- [ ] CODE_OF_CONDUCT.md
- [ ] `cargo deny` passing in CI (no copyleft or problematic licenses)
- [ ] `license-checker` passing in CI for frontend
- [ ] Default admin password issue resolved
- [ ] User data export endpoint functional
- [ ] User data deletion endpoint functional
- [ ] Consent collection on registration
- [ ] Privacy policy template included in distribution
- [ ] Terms of Service template included in distribution
- [ ] Cookie consent component available in default theme
- [ ] EXIF stripping on media upload
- [ ] Data retention configuration available
- [ ] EAR notification filed (cryptography export control)
- [ ] NOTICE file created listing major third-party components

---

**Document maintained by**: Legal/Compliance Attorney (LEGAL), Full-Stack Team
**Review cadence**: Every wave completion + before any public release
**Escalation path**: LEGAL -> Team Leader -> User (for decisions requiring business judgment)
