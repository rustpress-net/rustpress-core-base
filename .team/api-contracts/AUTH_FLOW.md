# Authentication & Authorization Flow Documentation - RustPress CMS v0.4.0

> **Author**: Backend Engineer (BE)
> **Date**: 2026-03-02
> **Branch**: `ai-develop`
> **Source crate**: `crates/rustpress-auth/` (19 source files)
> **Status**: Wave 2 Research

---

## 1. Architecture Overview

The `rustpress-auth` crate provides a comprehensive authentication and authorization system organized into 19 modules:

```
rustpress-auth/src/
  lib.rs              - Module declarations and re-exports
  jwt.rs              - JWT token generation/validation (Point 57)
  password.rs         - Argon2id password hashing (Point 76, 78)
  refresh_token.rs    - Token rotation with family tracking (Point 58)
  session.rs          - Server-side sessions with cookies (Point 56)
  tokens.rs           - Password reset + email verification tokens (Point 64, 65)
  oauth2_client.rs    - Social login (Google, GitHub) (Point 60)
  oauth2_provider.rs  - Authorization server for 3rd-party apps (Point 59)
  middleware.rs       - Route-level auth middleware (Point 63)
  permission.rs       - RBAC with capabilities (Point 61, 62)
  totp.rs             - TOTP 2FA with recovery codes (Point 66)
  webauthn.rs         - Passkey/FIDO2 authentication (Point 80)
  api_key.rs          - API key with scopes (Point 67)
  rate_limit.rs       - Per-user/IP rate limiting (Point 68)
  brute_force.rs      - Login attempt limiting with lockout (Point 69, 77)
  csrf.rs             - CSRF token protection (Point 75)
  ip_filter.rs        - IP allowlist/blocklist with CIDR (Point 72)
  audit.rs            - Auth event logging (Point 73)
  impersonation.rs    - Admin user impersonation (Point 79)
```

---

## 2. Primary Auth Flow: JWT-Based Authentication

### 2.1 Login Flow

**Endpoint**: `POST /api/v1/auth/login`

```
Client                           Server
  |  POST /auth/login            |
  |  { email, password }         |
  |----------------------------->|
  |                              | 1. Look up user by email
  |                              | 2. Verify password with Argon2id
  |                              | 3. Check brute force protection
  |                              | 4. Generate JWT access token (15min)
  |                              | 5. Generate JWT refresh token (7d)
  |                              | 6. Create server session record
  |                              | 7. Log audit event
  |  { access_token,             |
  |    refresh_token,            |
  |    token_type: "Bearer",     |
  |    expires_in: 900 }         |
  |<-----------------------------|
```

**JWT Claims Structure** (from `jwt.rs` lines 10-33):
```json
{
  "sub": "user-uuid",           // Subject (user ID)
  "iat": 1709337600,            // Issued at
  "exp": 1709338500,            // Expiration (15 min for access)
  "nbf": 1709337600,            // Not before
  "jti": "unique-token-id",     // JWT ID (UUID v7)
  "iss": "rustpress",           // Issuer
  "typ": "access",              // Token type (access/refresh)
  "role": "administrator",      // User role (optional)
  "tenant_id": null,            // Multi-tenancy (optional)
  // ... custom claims via HashMap
}
```

**JWT Configuration** (from `jwt.rs` lines 94-114):
```rust
JwtConfig {
    secret: "change-me-in-production",  // DEFAULT VALUE - security risk
    issuer: "rustpress",
    access_expiry_secs: 900,            // 15 minutes
    refresh_expiry_secs: 604800,        // 7 days
}
```

### 2.2 Token Refresh Flow

**Endpoint**: `POST /api/v1/auth/refresh`

```
Client                           Server
  |  POST /auth/refresh          |
  |  { refresh_token }           |
  |----------------------------->|
  |                              | 1. Validate refresh token JWT
  |                              | 2. Check token not revoked
  |                              | 3. Check token family (rotation)
  |                              | 4. Revoke old refresh token
  |                              | 5. Generate new token pair
  |                              | 6. Log audit event
  |  { access_token,             |
  |    refresh_token (new),      |
  |    token_type: "Bearer",     |
  |    expires_in: 900 }         |
  |<-----------------------------|
```

**Refresh Token Rotation** (from `refresh_token.rs`):
- Each refresh token belongs to a "family" (identified by `family_id`)
- When a refresh token is used, it is revoked and a new one is issued in the same family
- If a revoked token is reused (replay attack), the entire family is revoked
- Configuration: `max_active_tokens`, `max_family_size`, `cleanup_interval`

### 2.3 Auth Middleware / Request Authentication

**Implementation**: `middleware.rs` (lines 1-100+)

The `AuthUser` extractor (used in route handlers) performs:
1. Extract `Authorization: Bearer <token>` header
2. Validate JWT signature and expiration via `JwtManager`
3. Parse claims to get user ID, role, tenant
4. Construct `AuthContext` with user permissions
5. Return `AuthUser` or `401 Unauthorized`

**Auth Methods Supported** (from `middleware.rs` lines 85-92):
```rust
pub enum AuthMethod {
    Session,       // Cookie-based session
    JwtBearer,     // Authorization: Bearer header
    ApiKey,        // X-API-Key header
    BasicAuth,     // Basic auth (username:password)
    OAuth2,        // OAuth2 token
}
```

**Auth Requirements** (from `middleware.rs` lines 95-100+):
```rust
pub enum AuthRequirement {
    None,                              // No auth required
    Authenticated,                     // Any authenticated user
    Role(String),                      // Specific role required
    AnyRole(Vec<String>),              // Any of these roles
    Permission(String),                // Specific permission
    AnyPermission(Vec<String>),        // Any of these permissions
    AllPermissions(Vec<String>),       // All of these permissions
    Custom(fn(&AuthContext) -> bool),  // Custom predicate
}
```

---

## 3. Password Management

### 3.1 Password Hashing

**Implementation**: `password.rs`

- **Algorithm**: Argon2id (memory-hard, timing-safe) via `argon2` crate v0.5
- **Configuration**: Configurable via `PasswordRules`
- **Validation**: `PasswordValidator` enforces configurable rules:
  - Minimum length
  - Require uppercase/lowercase/numbers/special characters
  - Password strength scoring (`PasswordStrength` enum)

**Default admin password in migration**: `admin123` (hashed with Argon2id)
- Hash: `$argon2id$v=19$m=19456,t=2,p=1$ciLQC8dPihNq8CTLEnStlw$ilGVcVTxhIy20fr0wZtLwSfTsTtKny4DGmp0BfmMUYo`
- Parameters: m=19456 (19MB memory), t=2 iterations, p=1 parallelism

### 3.2 Password Reset Flow

**Endpoints**: `POST /auth/forgot-password`, `POST /auth/reset-password`

```
Client                           Server
  |  POST /auth/forgot-password  |
  |  { email }                   |
  |----------------------------->|
  |                              | 1. Look up user by email
  |                              | 2. Generate secure random token
  |                              | 3. Hash token (SHA-256)
  |                              | 4. Store in password_reset_tokens table
  |                              |    with expiry (e.g., 1 hour)
  |                              | 5. Send email with reset link + token
  |  { success, message }        |
  |<-----------------------------|
  |                              |
  |  POST /auth/reset-password   |
  |  { token, new_password }     |
  |----------------------------->|
  |                              | 1. Hash provided token
  |                              | 2. Look up matching unexpired token
  |                              | 3. Validate new password rules
  |                              | 4. Hash new password with Argon2id
  |                              | 5. Update user's password_hash
  |                              | 6. Mark token as used
  |                              | 7. Invalidate all sessions
  |  { success }                 |
  |<-----------------------------|
```

**Token Storage** (from migration `00023`):
```sql
password_reset_tokens (
    id, user_id, token_hash, expires_at, used_at, created_at
)
```

---

## 4. Role-Based Access Control (RBAC)

### 4.1 Role System

**Implementation**: `permission.rs`

**Built-in Roles** (from `permission.rs`):
```rust
pub enum Role {
    Administrator,  // Full access to everything
    Editor,         // Can manage all content
    Author,         // Can create and manage own content
    Contributor,    // Can submit content for review
    Subscriber,     // Can read and manage own profile
    Custom(String), // Custom role with defined permissions
}
```

**Permission System**:
```rust
pub struct Permission {
    pub resource: String,  // e.g., "posts", "users", "plugins"
    pub action: String,    // e.g., "create", "read", "update", "delete"
}
```

- Wildcard support: `"*:*"` grants full access (used by Administrator)
- `PermissionChecker` validates user permissions against required permissions
- Permissions stored in `AuthContext.permissions` as `HashSet<String>`

### 4.2 Current Auth Enforcement in Routes

| Route Group | Auth Required | Role Check | Notes |
|-------------|--------------|------------|-------|
| `/auth/*` | No (except /me) | None | Public endpoints |
| `/users/*` | Yes (AuthUser) | None explicit | Missing role check for admin ops |
| `/posts/*` | Yes (AuthUser) | None explicit | Any authenticated user can CRUD posts |
| `/pages/*` | Yes (AuthUser) | None explicit | Same concern |
| `/media/*` | Yes (AuthUser) | None explicit | Upload access unrestricted |
| `/comments/*` | Mixed | None | Some public, some auth |
| `/settings/*` | Yes (AuthUser) | None explicit | Settings writable by any user |
| `/plugins/*` | Yes (AuthUser) | None explicit | Plugin install by any user |
| `/themes/*` | Yes (AuthUser) | None explicit | Theme changes by any user |
| `/email/*` | Yes (AuthUser) | **administrator** | Only admin can view/modify |
| `/stats/*` | Yes (AuthUser) | None explicit | Dashboard viewable by all |
| `/search/*` | No | None | Public search |
| `/taxonomies/*` | Mixed | None | Read=public, Write=auth |
| `/menus/*` | Mixed | None | Read=public, Write=auth |
| `/widgets/*` | Mixed | None | Read=public, Write=auth |
| `/cache/*` | Yes (AuthUser) | None explicit | Cache purge by any user |
| `/cdn/*` | Yes (AuthUser) | None explicit | CDN config by any user |
| `/backups/*` | Yes (AuthUser) | None explicit | Backup by any user |

**SECURITY CONCERN**: Only the email endpoints enforce `role == "administrator"`. All other admin operations (user management, plugin install/uninstall, theme management, settings changes, backup/restore, CDN configuration) only require a valid JWT token with no role check. A `subscriber` role user could potentially:
- Install/uninstall plugins
- Change site settings
- Purge the cache
- Modify CDN configuration
- Create/restore backups
- Delete other users

---

## 5. OAuth2 Social Login

### 5.1 OAuth2 Client (Social Login)

**Implementation**: `oauth2_client.rs`

**Supported Providers**:
```rust
pub enum OAuth2ClientProvider {
    Google,
    GitHub,
    Facebook,
    Apple,
    Microsoft,
    Twitter,
    Discord,
    Custom(String),
}
```

**Data Model**:
```rust
pub struct OAuth2UserInfo {
    pub provider: OAuth2ClientProvider,
    pub provider_user_id: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
    pub profile_url: Option<String>,
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub raw_profile: serde_json::Value,
}

pub struct SocialConnection {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: String,
    pub provider_user_id: String,
    pub connected_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}
```

**Status**: The crate defines the OAuth2 client data structures but **no API routes** are registered in `routes.rs` for OAuth2 flows. The following endpoints are needed:
- `GET /auth/oauth2/:provider` - Initiate OAuth2 flow (redirect to provider)
- `GET /auth/oauth2/:provider/callback` - Handle OAuth2 callback
- `POST /auth/oauth2/:provider/link` - Link existing account to provider
- `DELETE /auth/oauth2/:provider/unlink` - Unlink provider

### 5.2 OAuth2 Provider (Authorization Server)

**Implementation**: `oauth2_provider.rs`

This module implements RustPress as an OAuth2 authorization server, allowing third-party applications to authenticate against RustPress:

```rust
pub struct OAuth2Provider {
    config: OAuth2ProviderConfig,
    clients: RwLock<HashMap<String, OAuth2RegisteredClient>>,
    authorization_codes: RwLock<HashMap<String, AuthorizationCode>>,
}
```

**Grant Types Supported**:
```rust
pub enum GrantType {
    AuthorizationCode,
    ClientCredentials,
    RefreshToken,
    Password,  // Legacy, not recommended
}
```

**Status**: Data structures defined, no routes registered.

---

## 6. WebAuthn (Passwordless Authentication)

**Implementation**: `webauthn.rs`

**Data Model** (lines 17-49):
```rust
pub struct WebAuthnCredential {
    pub id: Uuid,
    pub user_id: Uuid,
    pub credential_id: String,      // Base64url encoded
    pub public_key: String,          // COSE encoded, base64url
    pub name: String,                // User-assigned nickname
    pub aaguid: Option<String>,      // Authenticator model ID
    pub sign_count: u32,             // Cloning detection counter
    pub credential_type: CredentialType, // Platform or CrossPlatform
    pub user_verified: bool,
    pub backup_eligible: bool,
    pub backed_up: bool,
    pub transports: Vec<String>,     // usb, nfc, ble, internal, hybrid
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
    pub is_primary: bool,
    pub is_active: bool,
}
```

**Credential Types**:
```rust
pub enum CredentialType {
    Platform,        // TouchID, FaceID, Windows Hello
    CrossPlatform,   // YubiKey, security keys
    Unknown,
}
```

**WebAuthn Manager** provides:
- `begin_registration()` - Generate registration challenge
- `complete_registration()` - Verify attestation response
- `begin_authentication()` - Generate authentication challenge
- `complete_authentication()` - Verify assertion response

**Status**: Full data model and manager logic implemented. **No API routes registered** and **no database table** for storing WebAuthn credentials in the migrations.

---

## 7. TOTP Two-Factor Authentication

**Implementation**: `totp.rs`

**Configuration** (lines 18-45):
```rust
TotpConfig {
    issuer: "RustPress",
    digits: 6,
    period: 30,              // seconds
    algorithm: TotpAlgorithm::SHA1,  // Most compatible
    recovery_codes_count: 10,
    validation_window: 1,    // Allow 1 step skew
}
```

**Features**:
- TOTP code generation using HMAC-SHA1
- QR code URI generation for authenticator apps
- Recovery code generation (10 codes, hashed)
- Code validation with time window tolerance
- Replay attack prevention via `last_used_counter`

**Status**: Logic implemented. **No API routes** and **no database table** for TOTP secrets.

---

## 8. API Key Authentication

**Implementation**: `api_key.rs`

**Data Model** (lines 54-80):
```rust
pub struct ApiKey {
    pub id: Uuid,
    pub site_id: Option<Uuid>,
    pub user_id: Uuid,
    pub name: String,
    pub prefix: String,           // First 8 chars (display)
    pub key_hash: String,         // SHA-256 hashed
    pub scopes: HashSet<ApiKeyScope>,
    pub rate_limit: Option<u32>,  // Requests per minute
    pub allowed_ips: Option<Vec<String>>,
    pub expires_at: Option<DateTime<Utc>>,
}
```

**Scope System**:
```rust
ApiKeyScope {
    resource: String,  // e.g., "posts", "*"
    action: String,    // e.g., "read", "*"
}
// Wildcard: "*:*" = full access
// Read-only: "*:read"
```

**Status**: Logic implemented. **No API routes** and **no database table** for API keys.

---

## 9. Security Modules

### 9.1 Brute Force Protection (`brute_force.rs`)

```rust
BruteForceConfig {
    max_attempts: 5,
    lockout_duration_secs: 900,   // 15 minutes
    window_secs: 300,              // 5-minute sliding window
    progressive_delay: true,       // Increasing delays
}
```

- Tracks login attempts per IP and per user
- Progressive delay: 1s, 2s, 4s, 8s, 16s...
- Account lockout after max attempts
- `LockoutStatus` provides remaining attempts and lockout expiry

### 9.2 Rate Limiting (`rate_limit.rs`)

```rust
RateLimitConfig {
    window_secs: 60,     // 1-minute window
    max_requests: 100,   // Per window
    burst_size: 20,      // Allow burst above limit briefly
}
```

- Token bucket algorithm
- Per-IP and per-user limits
- `RateLimitResult` returns remaining requests and reset time

### 9.3 CSRF Protection (`csrf.rs`)

```rust
CsrfConfig {
    token_length: 32,
    cookie_name: "csrf_token",
    header_name: "X-CSRF-Token",
    same_site: SameSite::Lax,
    secure: true,
    expiry_secs: 3600,
}
```

**Status**: Fully implemented module but **not applied** as middleware on any routes. JWT-based APIs don't strictly need CSRF, but session-based auth does.

### 9.4 IP Filtering (`ip_filter.rs`)

```rust
pub struct IpFilter {
    rules: Vec<IpRule>,
    default_action: IpRuleType,  // Allow or Deny
}

pub enum IpRuleType {
    Allow,
    Deny,
}
```

- CIDR support for subnet filtering
- Configurable default action (allow-list vs deny-list mode)
- Inline tests cover IPv4, IPv6, and CIDR matching

### 9.5 Audit Logging (`audit.rs`)

```rust
pub enum AuthEventType {
    LoginSuccess, LoginFailed, Logout,
    TokenRefresh, TokenRevoke,
    PasswordChange, PasswordReset,
    TwoFactorEnabled, TwoFactorDisabled, TwoFactorVerified,
    ApiKeyCreated, ApiKeyRevoked,
    SessionCreated, SessionRevoked,
    AccountLocked, AccountUnlocked,
    ImpersonationStart, ImpersonationEnd,
    PermissionDenied,
}

pub enum EventSeverity {
    Info, Warning, Error, Critical,
}
```

- Structured event builder pattern (`AuthEventBuilder`)
- Captures user_id, ip_address, user_agent, timestamp
- **No persistence layer** -- events are logged but not stored in database

### 9.6 Impersonation (`impersonation.rs`)

```rust
pub struct ImpersonationManager {
    config: ImpersonationConfig,
    sessions: RwLock<HashMap<Uuid, ImpersonationSession>>,
}

pub struct ImpersonationRestrictions {
    pub allowed_roles: Vec<String>,       // Only these roles can impersonate
    pub excluded_users: Vec<Uuid>,        // Can't impersonate these users
    pub max_duration_secs: u64,           // Auto-expire
    pub require_reason: bool,
    pub audit_all_actions: bool,
}
```

**Status**: Logic implemented. No routes registered.

---

## 10. Session Management

**Implementation**: `session.rs`

```rust
pub struct SessionConfig {
    pub cookie_name: String,
    pub secret: String,
    pub max_age_secs: u64,
    pub secure: bool,
    pub http_only: bool,
    pub same_site: SameSite,
    pub domain: Option<String>,
    pub path: String,
}

pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_hash: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub last_activity_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub data: HashMap<String, serde_json::Value>,
}
```

**Session Storage**:
- Database table: `sessions` (created in migration `00024`)
- In-memory: `SessionStore` uses `RwLock<HashMap<Uuid, Session>>`
- **No Redis session storage** despite Redis being available

---

## 11. Incomplete Auth Features (Summary)

| Feature | Crate Module | Has Logic | Has Routes | Has DB Table | Status |
|---------|-------------|-----------|------------|-------------|--------|
| JWT Auth | `jwt.rs` | Yes | Yes | N/A | **Working** |
| Password Auth | `password.rs` | Yes | Yes | Yes (users) | **Working** |
| Token Refresh | `refresh_token.rs` | Yes | Yes | N/A (in-memory) | **Partially Working** |
| Server Sessions | `session.rs` | Yes | Yes | Yes (sessions) | **Working** |
| Password Reset | `tokens.rs` | Yes | Yes | Yes (password_reset_tokens) | **Working** |
| Email Verification | `tokens.rs` | Yes | No | Yes (email_verification_tokens) | **Missing Route** |
| RBAC | `permission.rs` | Yes | Partial | N/A (derived from user role) | **Underenforced** |
| OAuth2 Social Login | `oauth2_client.rs` | Yes | **No** | **No** | **Not Wired** |
| OAuth2 Server | `oauth2_provider.rs` | Yes | **No** | **No** | **Not Wired** |
| WebAuthn/Passkeys | `webauthn.rs` | Yes | **No** | **No** | **Not Wired** |
| TOTP 2FA | `totp.rs` | Yes | **No** | **No** | **Not Wired** |
| API Keys | `api_key.rs` | Yes | **No** | **No** | **Not Wired** |
| Rate Limiting | `rate_limit.rs` | Yes | **No middleware** | N/A | **Not Applied** |
| Brute Force | `brute_force.rs` | Yes | **No middleware** | N/A | **Not Applied** |
| CSRF | `csrf.rs` | Yes | **No middleware** | N/A | **Not Applied** |
| IP Filtering | `ip_filter.rs` | Yes | **No middleware** | N/A | **Not Applied** |
| Audit Logging | `audit.rs` | Yes | **No persistence** | **No** | **Not Persisted** |
| Impersonation | `impersonation.rs` | Yes | **No** | **No** | **Not Wired** |

---

## 12. Security Considerations & Recommendations

### 12.1 Critical Issues

1. **JWT secret is hardcoded default**: `jwt.rs` line 109 uses `"change-me-in-production"`. If the application starts without a `JWT_SECRET` environment variable being properly set, all tokens are trivially forgeable. **Recommendation**: Fail to start if JWT_SECRET is not set or equals the default.

2. **No role enforcement on admin routes**: 22 of 24 route groups only check for valid JWT, not for admin role. A subscriber can install plugins, delete users, change settings. **Recommendation**: Add role-based middleware to all admin operation routes.

3. **Password reset token not rate-limited**: The forgot-password endpoint could be used for email bombing. **Recommendation**: Apply rate limiter middleware.

4. **Refresh tokens stored in-memory only**: The `RefreshTokenStore` uses `RwLock<HashMap>`. If the server restarts, all refresh tokens are lost and all users must re-login. **Recommendation**: Store in database or Redis.

5. **Session data in-memory only**: Same issue as refresh tokens -- server restart loses all sessions.

### 12.2 Important Issues

6. **No CORS middleware configured**: While `cors.rs` module exists in the crate, CORS middleware is not applied in `routes.rs`. This may cause issues for admin UI on different origins.

7. **No security headers middleware**: CSP, X-Frame-Options, HSTS, X-Content-Type-Options are not configured despite being mentioned in the strategy.

8. **Audit events not persisted**: Auth events are logged to tracing but not stored in a queryable database table.

9. **No account lockout recovery**: Brute force protection locks accounts but there's no self-service unlock mechanism.

10. **File system endpoints lack auth checks**: The `/files/*` endpoints restrict paths to allowed directories but don't verify the user has write permissions to modify themes/plugins.

### 12.3 Recommendations Priority

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Add role enforcement to all admin routes | 2-3 hours |
| P0 | Fail on default JWT secret | 30 min |
| P0 | Persist refresh tokens to database/Redis | 2-4 hours |
| P0 | Apply rate limiting middleware | 1-2 hours |
| P1 | Wire OAuth2 routes | 4-6 hours |
| P1 | Wire TOTP 2FA routes | 3-4 hours |
| P1 | Wire WebAuthn routes | 4-6 hours |
| P1 | Wire API key routes | 3-4 hours |
| P1 | Add security headers middleware | 1-2 hours |
| P1 | Create audit_log database table | 1-2 hours |
| P2 | Wire impersonation routes | 2-3 hours |
| P2 | Add CORS middleware configuration | 1-2 hours |
| P2 | Add CSRF middleware for session-based auth | 2-3 hours |
