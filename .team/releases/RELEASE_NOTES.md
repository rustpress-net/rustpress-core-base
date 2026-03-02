# RustPress CMS v1.0.0 -- Release Notes

> **Date**: UNRELEASED (DRAFT)
> **Status**: Pending QA approval and bug resolution
> **License**: MIT OR Apache-2.0

---

## What is RustPress?

RustPress is a production-grade, self-hostable content management system built entirely in Rust with a modern React/TypeScript admin dashboard. It is designed as a high-performance, secure alternative to WordPress, offering familiar CMS functionality with the speed, safety, and concurrency advantages of Rust.

---

## What's New in v1.0.0

### Full Content Management

Create, edit, publish, and schedule **posts** and **pages** with a rich editing experience. Organize content with **hierarchical categories** and **tags**. Manage **threaded comments** with approval workflows and batch moderation. Build **navigation menus** with nested items and assign them to theme locations. Configure **sidebar widgets** with drag-and-drop ordering.

### Media Library

Upload and manage media files with automatic **image optimization** (WebP, AVIF). RustPress generates **responsive image variants** for optimal loading across devices. Organize files in **folders** with drag-and-drop. Supports images, videos, documents, and audio files.

### Theme System

Switch your site's appearance with a single click. RustPress ships with **2+ default themes** and supports custom theme development. Themes use **server-side rendering** for fast page loads and SEO. The **Full Site Editing** interface lets you customize headers, footers, and sidebars visually. Theme settings persist across activation/deactivation cycles.

### Plugin Architecture

Extend RustPress with plugins using a **WordPress-compatible hook system**. Install, activate, configure, and deactivate plugins through the admin UI. Plugins support **action hooks** (execute code at specific points) and **filter hooks** (transform data as it flows through the system). Six built-in plugins are included:

- **Cloudflare CDN** -- Cache purge, asset delivery, DNS management
- **RustAnalytics** -- Privacy-first built-in analytics
- **RustBackup** -- Automated backup and point-in-time restore
- **Visual Queue Manager** -- Background job monitoring
- **DB Manager** -- Database optimization and management
- **RustCommerce** -- E-commerce framework (products, orders, checkout)

### Modern Admin Dashboard

A responsive **React 18** admin interface with:
- Real-time dashboard metrics (posts, comments, users, traffic)
- Built-in **Monaco code editor** with syntax highlighting for theme/plugin editing
- **Dark mode** support
- Smooth **animations** powered by Framer Motion
- **Keyboard navigation** and screen reader support (WCAG 2.1 AA)
- 150+ design system components

### Security

- **JWT authentication** with configurable token expiry
- **Role-Based Access Control** (Administrator, Editor, Author, Contributor, Subscriber)
- **OAuth2 social login** (Google, GitHub, Facebook)
- **WebAuthn / FIDO2** passwordless authentication
- **TOTP two-factor authentication** with QR code setup
- **API key authentication** for machine-to-machine access
- **Argon2id** password hashing (memory-hard, timing-safe)
- **CSRF protection** on all state-changing requests
- **Rate limiting** (per-IP and per-user)
- **Brute force protection** with progressive delay and account lockout
- **Content Security Policy** headers and HSTS
- **Bot detection** with behavioral scoring

### Performance

- **API response time**: P95 < 100ms (target)
- **Throughput**: 5,000 requests/second sustained (single instance, target)
- **Server startup**: < 3 seconds
- **Memory usage**: < 50MB at idle, < 256MB under load
- **Redis caching** with automatic **moka in-memory fallback** when Redis is unavailable
- **PostgreSQL connection pooling** via sqlx

### Search

Full-text search across posts, pages, and media with relevance ranking, filtering, and pagination.

### Email

Built-in transactional email system via SMTP. Sends password reset emails, comment notifications, and administrative alerts. Customizable email templates.

### CLI Tools

14 command groups for server administration:
- User management (create, list, reset password, assign roles)
- Content operations (import, export, bulk operations)
- Cache management (clear, warm, inspect)
- Database operations (migrate, seed, backup, restore)
- Server diagnostics (health check, configuration validation)

### Observability

- **Health endpoints**: `/health/live` (liveness), `/health/ready` (readiness) -- Kubernetes-compatible
- **Prometheus metrics**: `/metrics` endpoint with request counts, latencies, error rates, DB pool stats
- **Structured logging**: JSON-formatted logs via `tracing` for easy ingestion by Grafana Loki, Elasticsearch, etc.

---

## System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 1 vCPU | 2+ vCPUs |
| **RAM** | 512 MB | 2 GB |
| **Disk** | 1 GB (+ media storage) | 10 GB SSD |
| **PostgreSQL** | 16 | 16 (latest patch) |
| **Redis** | 7 | 7 (latest patch) |
| **Docker** | 24+ | Latest stable |
| **OS** | Linux (x86_64, aarch64) | Ubuntu 22.04+ / Debian 12+ |

### For Building from Source

| Component | Version |
|-----------|---------|
| **Rust** | 1.75+ (stable) |
| **Node.js** | 20 LTS |
| **npm** | 10+ |

### Supported Browsers (Admin UI)

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 120+ |
| Firefox | 120+ |
| Safari | 17+ |
| Edge | 120+ |

---

## Installation

### Option 1: Docker (Recommended)

The fastest way to get RustPress running. Requires Docker and Docker Compose.

```bash
# 1. Create a project directory
mkdir rustpress && cd rustpress

# 2. Download the docker-compose file
curl -O https://raw.githubusercontent.com/rustpress/rustpress/v1.0.0/docker-compose.yml

# 3. Create your environment file
cat > .env << 'EOF'
# Required
JWT_SECRET=$(openssl rand -base64 64)
DATABASE_URL=postgres://rustpress:rustpress@postgres:5432/rustpress
REDIS_URL=redis://redis:6379
CORS_ORIGINS=http://localhost:8080

# Optional
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=changeme123!
SITE_URL=http://localhost:8080
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EOF

# 4. Generate a secure JWT secret
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -base64 64)|" .env

# 5. Start RustPress
docker-compose up -d

# 6. Check health
curl http://localhost:8080/health/ready

# 7. Open the admin dashboard
open http://localhost:8080/admin
```

**Default credentials**: `admin@localhost` / `changeme123!` (change immediately after first login).

### Option 2: Pre-built Binary

Download the pre-built binary for your platform from the [GitHub Releases](https://github.com/rustpress/rustpress/releases/v1.0.0) page.

```bash
# Linux x86_64
curl -LO https://github.com/rustpress/rustpress/releases/download/v1.0.0/rustpress-v1.0.0-linux-x86_64.tar.gz
tar -xzf rustpress-v1.0.0-linux-x86_64.tar.gz
cd rustpress-v1.0.0

# Set required environment variables
export JWT_SECRET="$(openssl rand -base64 64)"
export DATABASE_URL="postgres://user:pass@localhost:5432/rustpress"
export REDIS_URL="redis://localhost:6379"
export CORS_ORIGINS="http://localhost:8080"

# Run database migrations
./rustpress-migrate up

# Start the server
./rustpress serve
```

**Available binaries:**
- `rustpress-v1.0.0-linux-x86_64.tar.gz`
- `rustpress-v1.0.0-linux-aarch64.tar.gz`
- `rustpress-v1.0.0-macos-x86_64.tar.gz`
- `rustpress-v1.0.0-macos-aarch64.tar.gz`
- `rustpress-v1.0.0-windows-x86_64.zip`

SHA256 checksums are provided in `checksums.txt` alongside each release binary.

### Option 3: Build from Source

```bash
# 1. Clone both repositories
git clone https://github.com/rustpress/rustpress-core-base.git
git clone https://github.com/rustpress/rustpress-core-admin-ui.git

# 2. Build the backend
cd rustpress-core-base
cargo build --release

# 3. Build the frontend
cd ../rustpress-core-admin-ui
npm install
npm run build

# 4. Copy frontend build to backend static directory
cp -r dist/ ../rustpress-core-base/static/admin/

# 5. Set environment variables and run
cd ../rustpress-core-base
export JWT_SECRET="$(openssl rand -base64 64)"
export DATABASE_URL="postgres://user:pass@localhost:5432/rustpress"
export REDIS_URL="redis://localhost:6379"
export CORS_ORIGINS="http://localhost:8080"

# 6. Run migrations
cargo run --release --bin rustpress-migrate -- up

# 7. Start the server
cargo run --release --bin rustpress -- serve
```

---

## Quick Start: Your First Post in 5 Minutes

Assuming you have Docker installed:

```bash
# Step 1: Start RustPress (2 minutes)
mkdir rustpress && cd rustpress
curl -O https://raw.githubusercontent.com/rustpress/rustpress/v1.0.0/docker-compose.yml
echo 'JWT_SECRET=my-super-secret-key-change-this' > .env
echo 'CORS_ORIGINS=http://localhost:8080' >> .env
docker-compose up -d

# Step 2: Log in (30 seconds)
# Open http://localhost:8080/admin in your browser
# Log in with: admin@localhost / changeme123!

# Step 3: Create a post (2 minutes)
# Click "Posts" in the sidebar
# Click "New Post"
# Enter a title: "Hello, RustPress!"
# Write your content in the editor
# Click "Publish"

# Step 4: View your post (30 seconds)
# Open http://localhost:8080/post/hello-rustpress
# Your post is live with the default theme!
```

---

## Known Limitations

### v1.0.0 Scope Boundaries

The following features are **not included** in v1.0.0 and are planned for future releases:

1. **GraphQL API** -- REST API only. GraphQL planned for v2.0.
2. **Mobile native apps** -- Admin UI is responsive web, no native iOS/Android apps.
3. **Multi-region deployment** -- Single-region only. Multi-region planned for v2.0.
4. **Plugin/theme marketplace** -- Manual installation only. Marketplace planned for v2.0.
5. **Public visual page builder** -- Page builder available in admin only, not on public frontend.
6. **Email marketing / newsletters** -- Use external services (Mailchimp, SendGrid, etc.).
7. **A/B testing** -- Not included. Use external tools if needed.
8. **Built-in CDN** -- Requires external CDN (Cloudflare, BunnyCDN). CDN plugin included.
9. **Automatic WordPress migration** -- Manual WXR import supported; no automated migration wizard.
10. **WASM serverless functions** -- Planned for v2.0.

### Known Technical Limitations

- **CSP `unsafe-eval`**: Required by Monaco Editor for the code editing feature. Cannot be removed without replacing the code editor.
- **Rate limiting is per-instance**: In multi-instance deployments, rate limits are not shared. Use a reverse proxy rate limiter for distributed rate limiting.
- **Security audit log is in-memory**: Security events are lost on restart. Use structured log files for persistent audit trails.
- **Prometheus metrics endpoint**: May return limited metrics in this release. Use application logs as a supplementary monitoring source.

---

## Upgrading from v0.4.0

See the [Migration Guide in CHANGELOG.md](./CHANGELOG.md) for detailed upgrade instructions.

**Summary:**
1. Backup your database and media files
2. Update environment variables (new required: `JWT_SECRET`, `CORS_ORIGINS`)
3. Run database migrations (`rustpress-migrate up`)
4. Reset user passwords (bcrypt-to-Argon2id migration)
5. Update your `docker-compose.yml` to use the v1.0.0 image
6. Restart and verify

**Breaking changes**: JWT token format, API URL structure, configuration format, password hashing algorithm, plugin/theme manifest format, Redis version requirement (7+), Rust MSRV (1.75+). See CHANGELOG.md for complete details.

---

## Getting Help

### Documentation

- **Installation Guide**: Included in the repository README
- **API Documentation**: Available at `http://your-site/api/docs` (Swagger UI)
- **Plugin Development Guide**: `docs/plugin-development.md` in the repository
- **Theme Development Guide**: `docs/theme-development.md` in the repository

### Community

- **GitHub Issues**: [rustpress/rustpress-core-base/issues](https://github.com/rustpress/rustpress-core-base/issues) -- Bug reports and feature requests
- **GitHub Discussions**: [rustpress/rustpress-core-base/discussions](https://github.com/rustpress/rustpress-core-base/discussions) -- Questions, ideas, and community help
- **Discord**: [Join our Discord server](#) -- Real-time chat with the community and maintainers

### Reporting Bugs

When reporting a bug, please include:
1. RustPress version (`rustpress --version`)
2. Operating system and architecture
3. PostgreSQL and Redis versions
4. Steps to reproduce the issue
5. Expected behavior vs actual behavior
6. Relevant log output (with sensitive information redacted)

### Security Vulnerabilities

**Do NOT report security vulnerabilities via public GitHub issues.**

Please email security reports to `security@rustpress.dev` with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for resolution.

---

## Roadmap

### v1.0.1 (Patch Release -- Target: 2-4 weeks after v1.0.0)

- Prometheus metrics endpoint fully wired with real data
- Security audit log persistence to database
- Bot detection blocking enabled by default
- HSTS header only sent on HTTPS connections
- Accessibility improvements (aria-labels on all interactive elements)
- Cross-origin policy configuration for CDN compatibility

### v1.1.0 (Minor Release -- Target: 2-3 months after v1.0.0)

- TypeScript strict mode fully enabled in admin UI
- Distributed rate limiting via Redis backend
- Plugin integrity verification (checksum + optional signature)
- CSP nonces for inline scripts (reduce `unsafe-eval` scope)
- Improved search with stored `tsvector` indexes
- Admin UI performance optimizations
- CRM pages enabled (Dashboard, Customers, Leads, Pipeline)

### v2.0.0 (Major Release -- Target: 6-12 months after v1.0.0)

- **GraphQL API** alongside REST
- **Plugin & theme marketplace** with ratings and auto-updates
- **Multi-region** active-active deployment
- **AI content assistant** for writing suggestions and SEO optimization
- **Headless CMS mode** (API-only, no frontend rendering)
- **Advanced CRM** with customer management
- **WASM serverless functions** runtime
- **Mobile-optimized admin experience**

---

## Acknowledgments

RustPress is built on the shoulders of incredible open-source projects:

- [Axum](https://github.com/tokio-rs/axum) -- The fast, ergonomic Rust web framework
- [Tokio](https://tokio.rs/) -- The async runtime that powers RustPress
- [sqlx](https://github.com/launchbadge/sqlx) -- Compile-time verified PostgreSQL queries
- [React](https://react.dev/) -- The UI library behind the admin dashboard
- [Tailwind CSS](https://tailwindcss.com/) -- Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) -- Lightweight state management
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) -- The code editor from VS Code

And the many contributors who made this release possible. See the [Contributors section in CHANGELOG.md](./CHANGELOG.md) for the full team.

---

*RustPress CMS -- Blazing-fast content management, built in Rust.*

*Release Manager (RM) -- 2026-03-02*
