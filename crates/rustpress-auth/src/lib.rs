//! # RustPress Auth
//!
//! Comprehensive authentication and authorization system for RustPress.
//!
//! ## Features
//!
//! - **Session Management** (Point 56): Server-side sessions with secure cookies
//! - **JWT Authentication** (Point 57): JSON Web Token based authentication
//! - **Refresh Token Rotation** (Point 58): Secure token refresh with family tracking
//! - **OAuth2 Provider** (Point 59): Authorization server for third-party apps
//! - **OAuth2 Client** (Point 60): Social login integration (Google, GitHub, etc.)
//! - **RBAC** (Point 61): Role-Based Access Control with permissions
//! - **Capability Permissions** (Point 62): Fine-grained permission system
//! - **Auth Middleware** (Point 63): Route-level authentication/authorization
//! - **Password Reset** (Point 64): Secure password reset flow
//! - **Email Verification** (Point 65): Email verification tokens
//! - **Two-Factor Auth** (Point 66): TOTP-based 2FA with recovery codes
//! - **API Keys** (Point 67): API key authentication with scopes
//! - **Rate Limiting** (Point 68): Per-user/IP rate limiting
//! - **Brute Force Protection** (Point 69, 77): Login attempt limiting with lockout
//! - **Session Invalidation** (Point 70): Cross-device session management
//! - **Remember Me** (Point 71): Extended session support
//! - **IP Filtering** (Point 72): Allowlist/blocklist with CIDR support
//! - **Audit Logging** (Point 73): Comprehensive auth event logging
//! - **CORS** (Point 74): Cross-Origin Resource Sharing configuration
//! - **CSRF Protection** (Point 75): Cross-Site Request Forgery prevention
//! - **Password Policies** (Point 76): Configurable password requirements
//! - **Password Change** (Point 78): Secure password change workflow
//! - **Impersonation** (Point 79): Admin user impersonation with audit trail
//! - **WebAuthn** (Point 80): Passwordless authentication with passkeys

// Core authentication modules
pub mod jwt;
pub mod password;
pub mod refresh_token;
pub mod session;
pub mod tokens;

// OAuth2 modules
pub mod oauth2_client;
pub mod oauth2_provider;

// Authorization modules
pub mod middleware;
pub mod permission;

// Two-factor authentication
pub mod totp;
pub mod webauthn;

// API authentication
pub mod api_key;

// Security modules
pub mod brute_force;
pub mod csrf;
pub mod ip_filter;
pub mod rate_limit;

// Audit and monitoring
pub mod audit;

// Admin features
pub mod impersonation;

// Re-exports for convenience
pub use api_key::{ApiKey, ApiKeyConfig, ApiKeyManager, ApiKeyScope};
pub use audit::{AuditLogger, AuthAuditEvent, AuthEventBuilder, AuthEventType, EventSeverity};
pub use brute_force::{BruteForceConfig, BruteForceProtection, LockoutStatus, LoginAttempt};
pub use csrf::{CsrfConfig, CsrfProtection, CsrfToken};
pub use impersonation::{
    ImpersonationConfig, ImpersonationManager, ImpersonationRestrictions, ImpersonationSession,
};
pub use ip_filter::{IpFilter, IpFilterConfig, IpPattern, IpRule, IpRuleType};
pub use jwt::{Claims, JwtConfig, JwtManager, TokenPair, TokenType};
pub use middleware::{
    AuthContext, AuthMethod, AuthMiddleware, AuthRequest, AuthRequirement, RouteProtection,
};
pub use oauth2_client::{OAuth2Client, OAuth2ClientProvider, OAuth2UserInfo, SocialConnection};
pub use oauth2_provider::{
    GrantType, OAuth2Client as OAuth2RegisteredClient, OAuth2Provider, OAuth2ProviderConfig,
};
pub use password::{PasswordHasher, PasswordRules, PasswordStrength, PasswordValidator};
pub use permission::{Permission, PermissionChecker, Role};
pub use rate_limit::{RateLimitConfig, RateLimitResult, RateLimiter};
pub use refresh_token::{
    RefreshToken, RefreshTokenConfig, RefreshTokenManager, RefreshTokenStore, RevokeReason,
};
pub use session::{SameSite, Session, SessionConfig, SessionManager, SessionStore};
pub use tokens::{
    PasswordResetToken, SecureToken, TokenManager, TokenStore, TokenType as SecureTokenType,
    VerificationToken,
};
pub use totp::{TotpConfig, TotpManager, TotpSecret};
pub use webauthn::{CredentialType, WebAuthnConfig, WebAuthnCredential, WebAuthnManager};

/// Prelude module for common imports
pub mod prelude {
    pub use crate::api_key::ApiKeyManager;
    pub use crate::audit::AuditLogger;
    pub use crate::brute_force::BruteForceProtection;
    pub use crate::csrf::CsrfProtection;
    pub use crate::jwt::{Claims, JwtManager};
    pub use crate::middleware::{AuthContext, AuthMiddleware, AuthRequirement};
    pub use crate::password::{PasswordHasher, PasswordValidator};
    pub use crate::permission::{Permission, PermissionChecker, Role};
    pub use crate::rate_limit::RateLimiter;
    pub use crate::session::{Session, SessionManager};
    pub use crate::totp::TotpManager;
}
