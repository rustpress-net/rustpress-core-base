# RustPress CMS -- Compliance Checklist

> **Document Owner**: Legal/Compliance Attorney (LEGAL)
> **Last Updated**: 2026-03-02
> **Status**: ACTIVE -- Requires implementation verification each wave
> **Applies To**: RustPress Core (backend + admin UI) and all site operators deploying RustPress

---

## Table of Contents

1. [GDPR Compliance](#1-gdpr-compliance)
2. [CCPA Considerations](#2-ccpa-considerations)
3. [Cookie Consent Requirements](#3-cookie-consent-requirements)
4. [Data Retention Policies](#4-data-retention-policies)
5. [User Data Export Requirements](#5-user-data-export-requirements)
6. [Implementation Priority Matrix](#6-implementation-priority-matrix)

---

## 1. GDPR Compliance

The General Data Protection Regulation applies to any RustPress instance processing personal data of EU/EEA residents. Since RustPress is open source software deployed by site operators, compliance responsibility is shared: RustPress must provide the **technical mechanisms**; site operators must implement the **organizational measures**.

### 1.1 Lawful Basis for Processing (Article 6)

| Data Processing Activity | Lawful Basis | Implementation Requirement | Status |
|--------------------------|-------------|---------------------------|--------|
| User registration (email, username, password hash) | Consent (Art. 6(1)(a)) or Contract (Art. 6(1)(b)) | Registration form must include consent checkbox with link to privacy policy; OR terms of service must establish contractual basis | [ ] NOT IMPLEMENTED |
| Comment submission (name, email, content, IP) | Legitimate interest (Art. 6(1)(f)) | Must document legitimate interest assessment; commenter email collection must be justified | [ ] NOT IMPLEMENTED |
| Session management (JWT tokens, last_login_at) | Contract (Art. 6(1)(b)) | Necessary for service delivery; no additional consent needed | [x] IMPLICIT |
| Analytics data collection | Consent (Art. 6(1)(a)) | Requires explicit opt-in consent before any tracking begins | [ ] NOT IMPLEMENTED |
| Media uploads (file metadata, uploaded_by) | Contract (Art. 6(1)(b)) | Part of CMS functionality; ensure EXIF stripping on upload | [ ] PARTIAL |
| Email notifications | Consent (Art. 6(1)(a)) | Must allow granular email preference management | [ ] NOT IMPLEMENTED |
| Collaboration sessions (presence, cursor data) | Legitimate interest (Art. 6(1)(f)) | Ephemeral data; document retention justification | [ ] NOT IMPLEMENTED |

### 1.2 Consent Management

**CRITICAL -- HIGH PRIORITY**

- [ ] **Consent collection**: Registration and comment forms must collect affirmative consent (no pre-checked boxes)
- [ ] **Consent records**: Store timestamp, version of policy consented to, and method of consent in a dedicated `consent_records` table
- [ ] **Consent withdrawal**: Users must be able to withdraw consent at any time through account settings; withdrawal must be as easy as giving consent
- [ ] **Granular consent**: Separate consent for: (a) account creation, (b) marketing emails, (c) analytics tracking, (d) third-party data sharing
- [ ] **Age verification**: If the site targets users under 16 (varies by EU member state), parental consent mechanism required
- [ ] **Consent versioning**: When privacy policy changes, re-consent must be collected from existing users

**Database schema recommendation** (new migration required):

```sql
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    consent_type VARCHAR(100) NOT NULL, -- 'registration', 'marketing', 'analytics', 'third_party'
    granted BOOLEAN NOT NULL,
    policy_version VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMP WITH TIME ZONE
);
```

### 1.3 Right to Erasure (Article 17) -- "Right to be Forgotten"

**CRITICAL -- HIGH PRIORITY**

- [ ] **Account deletion endpoint**: `DELETE /api/v1/users/{id}` must fully delete OR anonymize all personal data
- [ ] **Cascading deletion scope**: When a user requests erasure, the following must be addressed:

| Data Type | Table(s) | Erasure Action | Notes |
|-----------|----------|---------------|-------|
| User account | `users` | DELETE row | Primary record |
| User content (posts) | `posts` | Anonymize `author_id` to NULL or reassign to "deleted user" | Content may have independent legal basis for retention |
| User content (pages) | `pages` | Anonymize `author_id` to NULL | Same as posts |
| Comments authored | `comments` | Anonymize `author_id`, `author_name`, `author_email` | Or delete if commenter requests |
| Media uploads | `media` | DELETE files from storage + DELETE rows | Includes all variant sizes |
| Collaboration sessions | `collaboration_sessions` | DELETE rows | Ephemeral anyway |
| Chat messages | `chat_messages` | Anonymize or DELETE | Consider retention for other participants |
| Consent records | `consent_records` | RETAIN with anonymized user reference | Legal obligation to retain proof of consent |
| Audit logs | (if implemented) | Anonymize user identifiers | Legal basis for retention may override |
| Session tokens | JWT/Redis | Invalidate all active sessions | Immediate effect |

- [ ] **Erasure request tracking**: Log all erasure requests with status (pending, completed, partially completed, denied with reason)
- [ ] **Erasure timeline**: Must complete within 30 days (Art. 17(1)) or communicate delay
- [ ] **Third-party notification**: If data was shared with third parties (CDN, analytics), notify them of erasure request (Art. 17(2))
- [ ] **Exceptions documentation**: Document when erasure can be refused (legal obligation, public interest, exercise of legal claims)

### 1.4 Data Portability (Article 20)

- [ ] **Export endpoint**: `GET /api/v1/users/{id}/export` must return all user data in machine-readable format (JSON)
- [ ] **Export scope**: Must include ALL personal data provided by or generated about the user:
  - Account profile (email, username, display_name, avatar_url, role, created_at)
  - All posts authored (with metadata)
  - All pages authored
  - All comments
  - All media uploads (metadata + file URLs or downloadable archive)
  - Consent records
  - Login history (last_login_at)
- [ ] **Format**: JSON (primary), with optional CSV or XML; must be structured and documented
- [ ] **Delivery method**: Direct download from admin panel or email link to downloadable archive
- [ ] **Timeline**: Must be provided within 30 days of request

### 1.5 Data Protection Impact Assessment (DPIA) -- Article 35

A DPIA is required when processing is "likely to result in a high risk to the rights and freedoms of natural persons." RustPress site operators should conduct a DPIA when:

- [ ] Processing data of vulnerable individuals (e.g., children, patients)
- [ ] Large-scale systematic monitoring (analytics on all visitors)
- [ ] Automated decision-making with legal effects
- [ ] Processing special categories of data

**RustPress project responsibility**: Provide a DPIA template that site operators can customize. Include in documentation.

### 1.6 Data Processing Agreement (DPA) Requirements

RustPress as software does not itself require a DPA. However, site operators using RustPress with third-party services MUST execute DPAs with:

| Third-Party Service | Relationship | DPA Required? | Notes |
|--------------------|-------------|---------------|-------|
| Cloud hosting provider (AWS, GCP, Azure, etc.) | Data Processor | YES | Standard DPA usually available |
| SMTP email provider (SendGrid, Mailgun, etc.) | Data Processor | YES | Processes user email addresses |
| CDN provider (Cloudflare, BunnyCDN) | Data Processor | YES | May cache pages containing personal data |
| OAuth provider (Google, GitHub) | Joint Controller or Processor | DEPENDS | Google is typically joint controller |
| Analytics provider (Google Analytics) | Data Processor | YES | Google requires specific GA4 DPA |
| Cloud storage (S3, Azure Blob, GCS) | Data Processor | YES | Stores media uploads |

**RustPress project responsibility**: Document DPA requirements in deployment guide; provide checklist for site operators.

### 1.7 Data Protection Officer (DPO) -- Articles 37-39

- Not required for the RustPress open source project itself
- Site operators must assess whether they require a DPO based on their processing activities
- RustPress documentation should note this requirement

### 1.8 Breach Notification (Articles 33-34)

- [ ] **Logging infrastructure**: Implement security event logging sufficient to detect breaches
- [ ] **Breach detection**: Rate limiting alerts, failed login monitoring, unauthorized data access logging
- [ ] **Documentation template**: Provide breach notification template for site operators (72-hour supervisory authority notification, "without undue delay" data subject notification)

### 1.9 Privacy by Design and by Default (Article 25)

- [ ] **Minimal data collection**: Only collect data that is strictly necessary (current schema is reasonable)
- [ ] **Default privacy settings**: New installations should default to privacy-protective settings:
  - Analytics OFF by default
  - Comment email collection optional, not required
  - User registration should not require unnecessary fields
- [ ] **Data minimization in logs**: Ensure access logs do not retain full IP addresses beyond necessary period
- [ ] **Pseudonymization**: Comment authors who are not registered users should be pseudonymized in admin views unless moderation requires full data

---

## 2. CCPA Considerations

The California Consumer Privacy Act (as amended by CPRA) applies when a site operator meets thresholds (annual revenue > $25M, data on 100K+ consumers, or 50%+ revenue from selling data). RustPress must provide mechanisms to support compliance.

### 2.1 Required Mechanisms

| CCPA Right | Technical Implementation | Status |
|-----------|------------------------|--------|
| Right to Know (what data is collected) | Privacy policy template + data inventory API | [ ] TEMPLATE NEEDED |
| Right to Delete | Same as GDPR erasure -- `DELETE /api/v1/users/{id}` | [ ] NOT IMPLEMENTED |
| Right to Opt-Out of Sale | "Do Not Sell My Personal Information" link support; must be hookable in theme | [ ] NOT IMPLEMENTED |
| Right to Non-Discrimination | No feature gating based on privacy choices | [x] IMPLICIT (open source) |
| Right to Correct | User profile edit functionality | [x] PARTIAL (edit profile exists) |
| Right to Limit Use of Sensitive Data | Granular consent controls for sensitive data categories | [ ] NOT IMPLEMENTED |

### 2.2 "Do Not Sell" Implementation

- [ ] Theme hook/widget for "Do Not Sell My Personal Information" footer link
- [ ] Backend setting to toggle CCPA mode (enables additional UI elements)
- [ ] API endpoint to record opt-out: `POST /api/v1/privacy/opt-out`
- [ ] Respect Global Privacy Control (GPC) HTTP header (`Sec-GPC: 1`)

### 2.3 Financial Incentive Disclosure

If site operators offer incentives for data collection (e.g., premium content for registration), RustPress should support a financial incentive notice in the privacy policy template.

---

## 3. Cookie Consent Requirements

### 3.1 Cookie Inventory

RustPress and its integrations use the following cookies/storage:

| Cookie/Storage | Purpose | Category | Consent Required? |
|---------------|---------|----------|-------------------|
| JWT access token (httpOnly cookie or localStorage) | Authentication | Strictly Necessary | NO |
| JWT refresh token (httpOnly cookie) | Session persistence | Strictly Necessary | NO |
| CSRF token | Security | Strictly Necessary | NO |
| Theme preference (localStorage) | User preference | Functional | YES (EU) |
| Admin UI state (Zustand/localStorage) | UI persistence | Functional | YES (EU) |
| Google Analytics cookies (_ga, _gid, _gat) | Analytics | Analytics | YES |
| OAuth state parameter | Authentication flow | Strictly Necessary | NO |
| CDN cookies (Cloudflare __cflb, __cf_bm) | Performance/Security | Strictly Necessary | DEPENDS on jurisdiction |

### 3.2 EU ePrivacy Directive (Cookie Law) Requirements

- [ ] **Cookie consent banner**: Must be displayed before ANY non-essential cookies are set
- [ ] **Granular consent**: Users must be able to accept/reject cookies by category (necessary, functional, analytics, marketing)
- [ ] **No cookie walls**: Access to the site must not be conditional on accepting all cookies
- [ ] **Consent storage**: Record cookie consent preferences (timestamp, categories accepted)
- [ ] **Easy withdrawal**: Users must be able to change cookie preferences at any time
- [ ] **Pre-consent blocking**: Analytics scripts must NOT load until consent is granted

### 3.3 Implementation Approach

**Recommended**: Build a lightweight, configurable cookie consent component into the default theme system.

- [ ] Server-side cookie consent configuration in settings
- [ ] Theme template tag/block for cookie consent banner: `{% cookie_consent %}`
- [ ] JavaScript API for checking consent status before loading third-party scripts
- [ ] Admin UI settings page for configuring cookie categories and descriptions
- [ ] Support for external consent management platforms (OneTrust, CookieBot) via plugin hooks

### 3.4 International Variations

| Jurisdiction | Key Requirement | RustPress Impact |
|-------------|----------------|-----------------|
| EU/EEA (ePrivacy) | Prior consent for non-essential cookies | Cookie banner required |
| UK (PECR) | Same as EU post-Brexit | Cookie banner required |
| Brazil (LGPD) | Similar to GDPR; consent for cookies | Cookie banner required |
| California (CCPA) | Disclosure required; consent for "sale" via cookies | "Do Not Sell" link + cookie disclosure |
| Canada (PIPEDA) | Meaningful consent for tracking | Cookie banner recommended |
| Australia | No specific cookie law (yet) | General privacy principles apply |

---

## 4. Data Retention Policies

### 4.1 Default Retention Schedule

RustPress should ship with configurable retention policies. The following are recommended defaults:

| Data Category | Default Retention | Justification | Configurable? |
|--------------|-------------------|---------------|---------------|
| User accounts (active) | Indefinite while active | Service delivery | N/A |
| User accounts (inactive) | 2 years after last login | Data minimization | [ ] YES -- admin setting |
| Published posts/pages | Indefinite | Content is the product | N/A |
| Draft posts/pages | 1 year after last edit | Data minimization | [ ] YES -- admin setting |
| Post revisions | 50 revisions per post | Storage management | [ ] YES -- admin setting |
| Comments (approved) | Lifetime of parent post | Content value | N/A |
| Comments (spam/trash) | 30 days | No legitimate purpose after review | [ ] YES -- admin setting |
| Media files | Indefinite while referenced | Content dependency | N/A |
| Media files (orphaned) | 90 days | Storage management | [ ] YES -- admin setting |
| Session data (Redis) | 7 days (refresh token lifetime) | Security | [x] YES -- JWT config |
| Collaboration sessions | 24 hours after disconnect | Ephemeral | [ ] YES -- admin setting |
| Chat messages | 1 year | Communication record | [ ] YES -- admin setting |
| Audit/security logs | 90 days | Security monitoring | [ ] YES -- admin setting |
| Access logs (with IP) | 30 days | Security/debugging | [ ] YES -- admin setting |
| Consent records | 5 years after withdrawal | Legal obligation (proof of consent) | NO -- hardcoded minimum |
| Password reset tokens | 1 hour | Security | [x] YES -- token config |
| Backup archives | 30 days | Disaster recovery | [ ] YES -- admin setting |
| Analytics data (aggregate) | Indefinite | No personal data | N/A |
| Analytics data (per-user) | 26 months (GA4 default) | Operator choice | [ ] YES -- analytics config |

### 4.2 Automated Retention Enforcement

- [ ] **Background job**: Implement `data_retention_cleanup` job that runs daily
- [ ] **Spam/trash comment purge**: Auto-delete comments in spam/trash older than configured period
- [ ] **Orphaned media cleanup**: Identify and flag media not referenced by any post/page
- [ ] **Inactive user notification**: Email users 30 days before account deletion due to inactivity
- [ ] **Session cleanup**: Redis TTL handles this automatically; verify moka fallback also expires
- [ ] **Log rotation**: Structured logs must rotate based on size and age

### 4.3 Retention Policy Documentation

- [ ] Include retention schedule in generated privacy policy
- [ ] Admin UI page showing current retention settings with explanations
- [ ] CLI command: `rustpress data-retention --dry-run` to preview what would be purged

---

## 5. User Data Export Requirements

### 5.1 Current Implementation Status

Based on strategy review, user data export is **partially implemented** at the API level. The following gaps must be addressed:

### 5.2 Export Specification

**Endpoint**: `GET /api/v1/users/{id}/export`

**Authentication**: Requires either (a) the user themselves (self-service) or (b) an administrator

**Response format**: JSON archive with the following structure:

```json
{
  "export_metadata": {
    "exported_at": "2026-03-02T00:00:00Z",
    "rustpress_version": "0.4.0",
    "export_format_version": "1.0",
    "user_id": "uuid"
  },
  "account": {
    "email": "...",
    "username": "...",
    "display_name": "...",
    "avatar_url": "...",
    "role": "...",
    "status": "...",
    "created_at": "...",
    "last_login_at": "...",
    "email_verified_at": "...",
    "meta": {}
  },
  "posts": [
    {
      "title": "...",
      "slug": "...",
      "content": "...",
      "status": "...",
      "published_at": "...",
      "created_at": "...",
      "categories": ["..."],
      "tags": ["..."],
      "meta": {}
    }
  ],
  "pages": [],
  "comments": [],
  "media": [
    {
      "filename": "...",
      "original_filename": "...",
      "mime_type": "...",
      "file_size": 0,
      "alt_text": "...",
      "download_url": "...",
      "created_at": "..."
    }
  ],
  "consent_records": [],
  "activity_log": {
    "last_login_at": "...",
    "total_posts": 0,
    "total_comments": 0,
    "total_media_uploads": 0
  }
}
```

### 5.3 Export Checklist

- [ ] **Self-service export**: Users can trigger their own export from account settings page
- [ ] **Admin-triggered export**: Administrators can export any user's data
- [ ] **Large export handling**: For users with many media files, generate a ZIP archive asynchronously and email download link
- [ ] **Export notification**: Email user when export is ready for download
- [ ] **Export expiry**: Download links expire after 48 hours
- [ ] **Export audit trail**: Log all export requests (who requested, when, for which user)
- [ ] **Media inclusion toggle**: Allow export with or without media file binaries (metadata always included)
- [ ] **Format options**: JSON (required), CSV (optional), WordPress WXR XML (optional -- aids migration)

---

## 6. Implementation Priority Matrix

### IMMEDIATE (Must be in v1.0 -- Launch Blockers)

| Item | Risk if Missing | Effort |
|------|----------------|--------|
| User data export endpoint (GDPR Art. 20, CCPA) | Legal non-compliance; regulatory fines up to 4% annual revenue for site operators | M |
| Account deletion/erasure endpoint (GDPR Art. 17, CCPA) | Legal non-compliance | M |
| Privacy policy template for site operators | Site operators deploy without privacy policy | S |
| Cookie consent theme component (basic) | ePrivacy violation for EU-facing sites | M |
| Consent record storage (registration consent) | Cannot prove lawful basis for processing | S |
| Default privacy-protective settings | Privacy by Design violation | S |

### SHORT-TERM (Should be in v1.0 or v1.1)

| Item | Risk if Missing | Effort |
|------|----------------|--------|
| Granular cookie consent management | Incomplete ePrivacy compliance | M |
| Data retention configuration UI | Operator confusion; over-retention | M |
| Automated retention cleanup job | Data minimization principle violation | M |
| GPC header respect (`Sec-GPC`) | CCPA non-compliance for California users | S |
| EXIF data stripping on media upload | Unintentional location/device data exposure | S |
| Breach notification template | Operators unprepared for incidents | S |

### MEDIUM-TERM (v1.1 or v1.2)

| Item | Risk if Missing | Effort |
|------|----------------|--------|
| DPIA template for site operators | Operators unaware of DPIA obligation | S |
| DPA documentation for third-party services | Operators lack processor agreements | S |
| Consent re-collection on policy change | Stale consent records | M |
| Inactive user cleanup with notification | Over-retention of personal data | M |
| Export in multiple formats (CSV, WXR) | Reduced portability | M |

---

## Appendix A: Regulatory Reference

| Regulation | Full Name | Jurisdiction | Key Articles for CMS |
|-----------|-----------|-------------|---------------------|
| GDPR | General Data Protection Regulation (EU) 2016/679 | EU/EEA + international transfers | Art. 5-7 (principles, consent), Art. 12-23 (data subject rights), Art. 25 (privacy by design), Art. 30 (records of processing), Art. 33-34 (breach notification), Art. 35 (DPIA) |
| CCPA/CPRA | California Consumer Privacy Act + California Privacy Rights Act | California, USA | Sec. 1798.100-199 |
| ePrivacy | Directive 2002/58/EC (as amended) | EU/EEA | Art. 5(3) (cookies/storage) |
| LGPD | Lei Geral de Protecao de Dados | Brazil | Similar to GDPR |
| PIPEDA | Personal Information Protection and Electronic Documents Act | Canada | Similar principles |
| UK GDPR | UK General Data Protection Regulation | United Kingdom | Post-Brexit GDPR equivalent |

---

**Document maintained by**: Legal/Compliance Attorney (LEGAL), Full-Stack Team
**Review cadence**: Every wave completion + any time user data schema changes
