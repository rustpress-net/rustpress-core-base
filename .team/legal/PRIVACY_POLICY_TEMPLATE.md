# Privacy Policy Template for RustPress Site Operators

> **Document Owner**: Legal/Compliance Attorney (LEGAL)
> **Last Updated**: 2026-03-02
> **Status**: TEMPLATE -- Must be customized by each site operator before deployment
> **Usage**: Ship this template with RustPress as `templates/legal/privacy-policy.md`. Site operators MUST customize all sections marked with `[OPERATOR: ...]` before publishing.

---

> **IMPORTANT NOTICE TO SITE OPERATORS**
>
> This is a template privacy policy provided by the RustPress project for convenience. It is NOT legal advice. You MUST:
> 1. Replace all `[OPERATOR: ...]` placeholders with your actual information
> 2. Review with qualified legal counsel in your jurisdiction
> 3. Remove sections that do not apply to your deployment
> 4. Add sections for any additional data processing you perform
> 5. Publish this policy on your site and link to it from registration/comment forms
>
> The RustPress project assumes no liability for the accuracy or completeness of this template.

---

# Privacy Policy

**Last Updated**: [OPERATOR: Insert date]

**Effective Date**: [OPERATOR: Insert date]

## 1. Introduction

[OPERATOR: Insert your organization/site name] ("we," "us," or "our") operates [OPERATOR: Insert site URL] (the "Site"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Site.

We are committed to protecting your privacy. This policy applies to all information collected through our Site, including any related services, sales, marketing, or events (collectively, the "Services").

Please read this Privacy Policy carefully. By using the Site, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Site.

## 2. Information We Collect

### 2.1 Information You Provide Directly

We collect information that you voluntarily provide when you:

**Account Registration**
- Email address (required)
- Username (required)
- Display name (optional)
- Avatar/profile image (optional)
- Any additional profile metadata you choose to provide

**Content Creation**
- Posts, pages, and other content you author
- Media files you upload (images, documents, videos)
- Comments you submit on posts

**Communication**
- Messages sent through the site's collaboration or chat features
- Email correspondence with us
- Support requests

**Authentication**
- Password (stored as an irreversible Argon2id hash -- we cannot read your password)
- OAuth tokens when using social login (Google, GitHub, etc.) -- we receive only the profile information you authorize
- Two-factor authentication device registration (if enabled)

### 2.2 Information Collected Automatically

When you visit our Site, we automatically collect certain information:

**Technical Data**
- IP address
- Browser type and version
- Operating system
- Referring URL
- Pages visited and time spent
- Date and time of access

**Cookies and Similar Technologies**
- Session cookies (required for authentication)
- Security tokens (CSRF protection)
- Preference cookies (theme, language)
- Analytics cookies (if enabled -- see Section 5)

See Section 5 (Cookie Policy) for complete details.

### 2.3 Information from Third Parties

If you choose to log in using a third-party service, we may receive:

| Provider | Information Received |
|----------|---------------------|
| Google OAuth | Email, name, profile picture, locale |
| GitHub OAuth | Email, username, avatar, profile URL |
| [OPERATOR: Add/remove providers as applicable] | [OPERATOR: Specify data received] |

We only receive information you explicitly authorize the third-party provider to share.

## 3. How We Use Your Information

We use the information we collect for the following purposes:

| Purpose | Legal Basis (GDPR) | Data Used |
|---------|-------------------|-----------|
| Provide and maintain the Site | Contract performance | Account data, content |
| Authenticate your identity | Contract performance | Email, password hash, OAuth tokens |
| Display your content to visitors | Legitimate interest / Consent | Posts, pages, comments, media |
| Send transactional emails (password reset, notifications) | Contract performance | Email address |
| Moderate comments and content | Legitimate interest | Comment content, author data, IP address |
| Improve the Site and fix bugs | Legitimate interest | Technical data, usage patterns |
| Analyze site traffic and usage | Consent | Analytics data (see Section 5) |
| Comply with legal obligations | Legal obligation | As required by law |
| [OPERATOR: Add any additional purposes] | [OPERATOR: Specify basis] | [OPERATOR: Specify data] |

We do NOT:
- Sell your personal data to third parties
- Use your data for automated decision-making or profiling with legal effects
- Process your data for purposes incompatible with those listed above

## 4. How We Share Your Information

We may share your information in the following circumstances:

### 4.1 Public Content

Content you publish on the Site (posts, pages, comments) is publicly visible by design. Your display name and avatar are shown alongside your content. **Do not include personal information in public content that you do not wish to be publicly accessible.**

### 4.2 Service Providers

We use the following third-party services that may process your data:

| Service | Purpose | Data Shared | Privacy Policy |
|---------|---------|-------------|----------------|
| [OPERATOR: Hosting provider, e.g., AWS] | Site hosting | All site data (stored on their infrastructure) | [OPERATOR: Link] |
| [OPERATOR: Email provider, e.g., SendGrid] | Transactional email | Email addresses, email content | [OPERATOR: Link] |
| [OPERATOR: CDN provider, e.g., Cloudflare] | Content delivery, security | IP addresses, cached content | [OPERATOR: Link] |
| [OPERATOR: Cloud storage, e.g., AWS S3] | Media file storage | Uploaded files | [OPERATOR: Link] |
| Google Analytics | Site analytics | See Section 5 | https://policies.google.com/privacy |
| [OPERATOR: Add/remove as applicable] | [Purpose] | [Data] | [Link] |

All service providers are bound by data processing agreements and are prohibited from using your data for their own purposes.

### 4.3 Legal Requirements

We may disclose your information if required by law, court order, or governmental regulation, or if we believe disclosure is necessary to:
- Comply with a legal obligation
- Protect the rights, property, or safety of our users or others
- Prevent fraud or abuse of the Site

### 4.4 Business Transfers

If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your information becomes subject to a different privacy policy.

## 5. Cookie Policy

### 5.1 What Are Cookies

Cookies are small text files stored on your device when you visit a website. We use cookies and similar technologies (localStorage, sessionStorage) to operate and improve the Site.

### 5.2 Cookies We Use

**Strictly Necessary Cookies** (cannot be disabled)

| Cookie | Purpose | Duration |
|--------|---------|----------|
| Authentication token | Keeps you logged in | Session / 7 days |
| CSRF token | Protects against cross-site request forgery | Session |
| Cookie consent preference | Remembers your cookie choices | 1 year |

**Functional Cookies** (optional)

| Cookie | Purpose | Duration |
|--------|---------|----------|
| Theme preference | Remembers your visual theme choice | 1 year |
| Admin UI state | Preserves your dashboard layout preferences | Persistent |
| Language preference | Remembers your language selection | 1 year |

**Analytics Cookies** (optional -- requires your consent)

| Cookie | Purpose | Duration | Provider |
|--------|---------|----------|----------|
| _ga | Distinguishes unique users | 2 years | Google Analytics |
| _gid | Distinguishes unique users | 24 hours | Google Analytics |
| _gat | Throttles request rate | 1 minute | Google Analytics |
| [OPERATOR: Add/remove based on your analytics setup] | | | |

### 5.3 Managing Cookies

You can manage your cookie preferences at any time by:
- Clicking the "Cookie Settings" link in the site footer
- Adjusting your browser settings to block or delete cookies
- Using browser extensions that block tracking cookies

Note: Disabling strictly necessary cookies will prevent you from logging in and using authenticated features.

### 5.4 Do Not Track

[OPERATOR: Choose one of the following]

**Option A**: We honor the "Do Not Track" (DNT) browser signal and the Global Privacy Control (GPC) signal. When detected, we disable analytics tracking for your session.

**Option B**: We do not currently respond to "Do Not Track" signals because [OPERATOR: explain reason].

## 6. Data Retention

We retain your information for as long as necessary to fulfill the purposes described in this policy:

| Data Category | Retention Period | Reason |
|--------------|-----------------|--------|
| Active user accounts | Duration of account + [OPERATOR: e.g., 2 years] after deletion request | Service delivery + legal hold period |
| Published content | Indefinitely (or until you delete it) | Content is the service |
| Draft content | [OPERATOR: e.g., 1 year] after last edit | Allows you to resume editing |
| Comments | Lifetime of the parent post | Community value |
| Spam/trashed comments | [OPERATOR: e.g., 30 days] | Review period |
| Media files | Until you delete them or account deletion | Content dependency |
| Transactional email logs | [OPERATOR: e.g., 90 days] | Debugging delivery issues |
| Security/access logs | [OPERATOR: e.g., 30 days] | Security monitoring |
| Analytics data | [OPERATOR: e.g., 26 months] | Site improvement |
| Consent records | [OPERATOR: e.g., 5 years] after withdrawal | Legal proof of consent |
| Backup archives | [OPERATOR: e.g., 30 days] | Disaster recovery |

When data reaches its retention limit, it is either deleted or anonymized so that it can no longer be associated with you.

## 7. Your Rights

Depending on your location, you may have some or all of the following rights regarding your personal data:

### 7.1 Rights Under GDPR (EU/EEA/UK Residents)

| Right | Description | How to Exercise |
|-------|-------------|----------------|
| **Access** (Art. 15) | Obtain a copy of all personal data we hold about you | Account Settings > Export My Data |
| **Rectification** (Art. 16) | Correct inaccurate personal data | Account Settings > Edit Profile |
| **Erasure** (Art. 17) | Request deletion of your personal data | Account Settings > Delete My Account, or contact us |
| **Restrict Processing** (Art. 18) | Limit how we use your data | Contact us at [OPERATOR: privacy email] |
| **Data Portability** (Art. 20) | Receive your data in machine-readable format (JSON) | Account Settings > Export My Data |
| **Object** (Art. 21) | Object to processing based on legitimate interest | Contact us at [OPERATOR: privacy email] |
| **Withdraw Consent** (Art. 7(3)) | Withdraw previously given consent at any time | Cookie Settings, Account Settings, or contact us |
| **Complain** (Art. 77) | Lodge a complaint with a supervisory authority | [OPERATOR: Link to relevant DPA, e.g., https://ico.org.uk for UK] |

### 7.2 Rights Under CCPA (California Residents)

| Right | Description | How to Exercise |
|-------|-------------|----------------|
| **Right to Know** | Know what personal information we collect and why | This Privacy Policy + Account Settings > Export My Data |
| **Right to Delete** | Request deletion of personal information | Account Settings > Delete My Account |
| **Right to Opt-Out** | Opt out of the "sale" of personal information | We do not sell personal information. [OPERATOR: If you do, add "Do Not Sell" link] |
| **Right to Non-Discrimination** | Equal service regardless of privacy choices | We do not discriminate based on privacy choices |
| **Right to Correct** | Correct inaccurate personal information | Account Settings > Edit Profile |

### 7.3 Exercising Your Rights

To exercise any of these rights:

1. **Self-service**: Use the Account Settings page for data export, profile editing, and account deletion
2. **Email**: Send a request to [OPERATOR: privacy email address]
3. **Response time**: We will respond within 30 days (GDPR) or 45 days (CCPA)
4. **Verification**: We may need to verify your identity before processing your request

## 8. Data Security

We implement appropriate technical and organizational measures to protect your personal data:

- **Encryption in transit**: All data transmitted between your browser and our servers is encrypted using TLS 1.3
- **Encryption at rest**: Sensitive data (passwords, API keys) is encrypted using industry-standard algorithms
- **Password hashing**: Passwords are hashed using Argon2id (memory-hard, timing-safe) -- we never store or see your plaintext password
- **Access control**: Role-based access control limits data access to authorized personnel
- **Rate limiting**: Automated protections against brute-force attacks
- **SQL injection prevention**: All database queries use parameterized statements
- **XSS prevention**: User-generated content is sanitized before display
- **Regular updates**: We apply security patches and updates regularly

No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.

## 9. International Data Transfers

[OPERATOR: Choose and customize the applicable section]

**If your servers are in the EU/EEA:**
Your data is stored and processed within the European Economic Area.

**If your servers are outside the EU/EEA:**
Your data may be transferred to and processed in [OPERATOR: country], which may have different data protection laws than your country. We ensure adequate safeguards through:
- Standard Contractual Clauses (SCCs) approved by the European Commission
- [OPERATOR: Or other transfer mechanism, e.g., adequacy decision, BCRs]

## 10. Children's Privacy

Our Site is not directed to individuals under the age of [OPERATOR: 13 for US/COPPA, 16 for EU/GDPR, or your chosen age]. We do not knowingly collect personal information from children under this age. If we learn that we have collected data from a child under this age, we will delete it promptly. If you believe we have collected data from a child, please contact us at [OPERATOR: privacy email].

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any material changes by:
- Posting the new Privacy Policy on this page
- Updating the "Last Updated" date at the top
- [OPERATOR: e.g., Sending an email notification to registered users]

We encourage you to review this Privacy Policy periodically. Your continued use of the Site after changes constitutes acceptance of the updated policy.

## 12. Contact Us

If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:

[OPERATOR: Organization/Individual Name]
[OPERATOR: Mailing address]
[OPERATOR: Email address for privacy inquiries]
[OPERATOR: Phone number (optional)]

**Data Protection Officer**: [OPERATOR: If you have appointed a DPO, list their contact information here. If not required, remove this line.]

**EU Representative** (if applicable): [OPERATOR: If you are established outside the EU but process EU resident data, you must appoint an EU representative under GDPR Art. 27. List their contact here, or remove if not applicable.]

---

> **RustPress Project Note**: This template covers the most common data processing scenarios for a RustPress-powered site. Site operators who install plugins that collect additional data (e.g., RustCommerce for e-commerce, RustAnalytics for built-in analytics) must update this policy to reflect the additional data processing.
