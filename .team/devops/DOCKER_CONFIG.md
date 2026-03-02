# Docker Configuration Audit -- RustPress CMS

> Wave 2 DevOps Research & Planning Artifact
> Date: 2026-03-02
> Author: DevOps Engineer (DEVOPS)
> Status: RESEARCH COMPLETE -- Ready for implementation review

---

## 1. Current State: Dockerfile Audit

**File:** `rustpress-core-base/Dockerfile` (64 lines)

### 1.1 Builder Stage

```dockerfile
FROM rust:slim-bookworm AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY plugins ./plugins
ENV RUSTFLAGS="-Aunused -Amismatched_lifetime_syntaxes -Adependency_on_unit_never_type_fallback -Aunused_comparisons"
RUN cargo build --release
```

**Findings:**

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| 1 | Warning suppression via RUSTFLAGS | HIGH | Suppresses 4 warning categories; strategy mandates zero suppression |
| 2 | No dependency caching layer | MEDIUM | Every build recompiles ALL dependencies from scratch. The `COPY crates` and `COPY plugins` before `cargo build` means any source change invalidates the entire build cache |
| 3 | No admin-ui build | INFO | The Dockerfile only builds the Rust backend. The admin-ui is handled separately in the release workflow. For production docker-compose, admin-ui must be included |
| 4 | `rust:slim-bookworm` base | GOOD | Slim variant reduces builder image size. Bookworm (Debian 12) is current stable |
| 5 | Build dependencies cleaned up | GOOD | `rm -rf /var/lib/apt/lists/*` after apt-get |

### 1.2 Runtime Stage

```dockerfile
FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates libssl3 curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/rustpress /usr/local/bin/rustpress
COPY --from=builder /app/target/release/rustpress-cli /usr/local/bin/rustpress-cli
COPY --from=builder /app/target/release/rustpress-migrate /usr/local/bin/rustpress-migrate
COPY config ./config
COPY themes ./themes
COPY public ./public
COPY migrations ./migrations
RUN mkdir -p /app/uploads /app/logs
ENV HOST=0.0.0.0 PORT=8080 RUST_LOG=info
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
CMD ["rustpress"]
```

**Findings:**

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| 6 | Good multi-stage separation | GOOD | Builder and runtime stages properly separated |
| 7 | Runtime deps minimal | GOOD | Only `ca-certificates`, `libssl3`, `curl` |
| 8 | Three binaries copied | GOOD | `rustpress`, `rustpress-cli`, `rustpress-migrate` all included |
| 9 | Health check present | GOOD | Uses `curl -f http://localhost:8080/health` |
| 10 | Health check hits `/health` not `/health/live` | LOW | The liveness probe should use `/health/live` for Kubernetes compatibility. `/health` may do a full deep check including DB which is too heavy for liveness |
| 11 | No non-root user | HIGH | Container runs as root. Security best practice requires a non-root user |
| 12 | No `.dockerignore` | MEDIUM | Could copy unnecessary files (.git, target/, etc.) into build context |
| 13 | No admin-ui files in runtime | INFO | No `admin-ui/` directory copied. For standalone Docker, admin-ui dist must be embedded |
| 14 | `start-period=5s` too short | LOW | Rust compilation produces fast-starting binaries, but DB connection + migration may take longer. Consider 10-15s |
| 15 | No entrypoint script used | MEDIUM | The `deploy/scripts/entrypoint.sh` exists but is NOT used in the Dockerfile. It handles DB migration, seeding, and startup -- all critical for docker-compose deployment |
| 16 | Config file contains hardcoded JWT secret | HIGH | `config/rustpress.toml` has a JWT secret. Must be overridden via env vars in production |
| 17 | Migrations directory copied | GOOD | Enables entrypoint-based migration on startup |

### 1.3 Image Size Estimate

| Layer | Estimated Size |
|-------|---------------|
| `debian:bookworm-slim` base | ~80MB |
| `ca-certificates + libssl3 + curl` | ~15MB |
| `rustpress` binary (release) | ~30-50MB |
| `rustpress-cli` binary | ~15-25MB |
| `rustpress-migrate` binary | ~10-15MB |
| Config, themes, public, migrations | ~5MB |
| **Total estimated** | **~155-190MB** |

**Strategy target:** < 100MB. Current estimate exceeds this.

---

## 2. Image Size Optimization Opportunities

### 2.1 Use Alpine Instead of Debian (Saves ~60MB)

```dockerfile
# Instead of debian:bookworm-slim (~80MB)
FROM alpine:3.19 AS runtime
RUN apk add --no-cache ca-certificates libgcc curl
```

**Risk:** Alpine uses musl libc instead of glibc. The Rust binary must be compiled with `x86_64-unknown-linux-musl` target. This requires changes to the builder stage:

```dockerfile
FROM rust:alpine3.19 AS builder
RUN apk add --no-cache musl-dev openssl-dev openssl-libs-static pkgconfig
```

**Or use `xx` cross-compilation:**
```dockerfile
FROM --platform=$BUILDPLATFORM rust:slim-bookworm AS builder
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --target x86_64-unknown-linux-musl

FROM alpine:3.19
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/rustpress /usr/local/bin/
```

### 2.2 Use UPX Binary Compression (Saves ~10-20MB)

```dockerfile
FROM builder AS compressor
RUN apt-get update && apt-get install -y upx
RUN upx --best --lzma /app/target/release/rustpress
RUN upx --best --lzma /app/target/release/rustpress-cli
```

**Risk:** Slightly slower startup (decompression), and debugging with GDB becomes harder. Acceptable for production.

### 2.3 Strip Debug Symbols (Saves ~5-15MB)

Add to `Cargo.toml` workspace:
```toml
[profile.release]
strip = true
lto = true
codegen-units = 1
opt-level = "s"  # Optimize for size
```

Or in Dockerfile:
```dockerfile
RUN strip /app/target/release/rustpress
RUN strip /app/target/release/rustpress-cli
RUN strip /app/target/release/rustpress-migrate
```

### 2.4 Dependency Caching Layer (Faster Builds)

```dockerfile
# Cache dependencies by building a dummy project first
COPY Cargo.toml Cargo.lock ./
# Create dummy source files for each crate
RUN mkdir -p crates/rustpress-core/src && echo "fn main() {}" > crates/rustpress-core/src/lib.rs
# ... repeat for all 19 crates + 4 plugins
RUN cargo build --release 2>/dev/null || true
# Now copy real source
COPY crates ./crates
COPY plugins ./plugins
RUN cargo build --release
```

**Better approach:** Use `cargo-chef` for reproducible dependency caching:

```dockerfile
FROM rust:slim-bookworm AS chef
RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release
```

This caches dependencies as a separate Docker layer. Source-only changes do not trigger dependency recompilation.

### 2.5 Estimated Optimized Image Size

| Optimization | Size Impact |
|-------------|------------|
| Switch to Alpine base | -60MB (80MB -> 20MB) |
| Strip binaries | -10MB |
| LTO + opt-level=s | -5MB |
| UPX compression | -15MB |
| **Optimized total estimate** | **~65-85MB** |

This puts us within the < 100MB target.

---

## 3. Current State: docker-compose.yml Audit

**File:** `rustpress-core-base/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: rustpress-db
    environment:
      POSTGRES_USER: rustpress
      POSTGRES_PASSWORD: rustpress
      POSTGRES_DB: rustpress
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rustpress"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: rustpress-cache
    ports:
      - "6380:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Findings:**

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| 1 | No RustPress app service | CRITICAL | Only PostgreSQL and Redis are defined. The app itself is missing -- this is a dev-helper compose, not a deployment compose |
| 2 | Hardcoded credentials | HIGH | `POSTGRES_USER: rustpress`, `POSTGRES_PASSWORD: rustpress` -- not suitable for production |
| 3 | Non-standard port mapping | LOW | PG mapped to 5433, Redis to 6380 (to avoid conflicts with local installs). Fine for dev, but production should use standard ports internally |
| 4 | No restart policies | MEDIUM | Containers will not restart after crash or host reboot |
| 5 | No resource limits | MEDIUM | Containers can consume unlimited memory/CPU |
| 6 | No network isolation | LOW | All services on default bridge network; should use a named network |
| 7 | No Redis password | HIGH | Redis is unprotected. In production, `requirepass` must be set |
| 8 | No Redis persistence config | MEDIUM | Redis uses default persistence (RDB snapshots). Should be explicit about AOF/RDB |
| 9 | Good PG healthcheck | GOOD | Uses `pg_isready` |
| 10 | Good Redis healthcheck | GOOD | Uses `redis-cli ping` |
| 11 | Volumes for data persistence | GOOD | Named volumes for both PG and Redis data |
| 12 | No init_db.sql usage | INFO | `init_db.sql` exists in repo root but is not mounted into PG container |

---

## 4. Proposed Production docker-compose.yml

```yaml
# docker-compose.production.yml
# RustPress CMS -- Production Deployment
# Usage: docker compose -f docker-compose.production.yml up -d

version: '3.8'

x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
    tag: "{{.Name}}"

services:
  # ============================================================
  # RustPress Application Server
  # ============================================================
  rustpress:
    image: ghcr.io/rustpress/rustpress:${RUSTPRESS_VERSION:-latest}
    container_name: rustpress-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "${RUSTPRESS_PORT:-8080}:8080"
    environment:
      # Server
      HOST: "0.0.0.0"
      PORT: "8080"
      RUST_LOG: "${RUST_LOG:-info}"

      # Database
      DATABASE_URL: "postgres://${PG_USER:-rustpress}:${PG_PASSWORD}@postgres:5432/${PG_DB:-rustpress}"

      # Cache
      REDIS_URL: "redis://:${REDIS_PASSWORD}@redis:6379"

      # Security (REQUIRED -- must be set in .env)
      JWT_SECRET: "${JWT_SECRET}"

      # Storage
      UPLOAD_DIR: "/app/uploads"
      THEMES_DIR: "/app/themes"

      # Email (optional)
      SMTP_HOST: "${SMTP_HOST:-}"
      SMTP_PORT: "${SMTP_PORT:-587}"
      SMTP_USER: "${SMTP_USER:-}"
      SMTP_PASSWORD: "${SMTP_PASSWORD:-}"

      # Site
      RUSTPRESS_SITE_URL: "${SITE_URL:-http://localhost:8080}"

      # Admin seed (first run only)
      ADMIN_EMAIL: "${ADMIN_EMAIL:-admin@localhost}"
      ADMIN_USERNAME: "${ADMIN_USERNAME:-admin}"
      ADMIN_PASSWORD: "${ADMIN_PASSWORD:-}"
    volumes:
      - uploads_data:/app/uploads
      - logs_data:/app/logs
      - themes_data:/app/themes
      # Mount custom config if needed
      # - ./config/rustpress.toml:/app/config/rustpress.toml:ro
    networks:
      - rustpress-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/live"]
      interval: 30s
      timeout: 10s
      start_period: 15s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '2.0'
        reservations:
          memory: 128M
          cpus: '0.25'
    logging: *default-logging

  # ============================================================
  # PostgreSQL 16 Database
  # ============================================================
  postgres:
    image: postgres:16-alpine
    container_name: rustpress-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: "${PG_USER:-rustpress}"
      POSTGRES_PASSWORD: "${PG_PASSWORD}"
      POSTGRES_DB: "${PG_DB:-rustpress}"
      # Performance tuning
      POSTGRES_INITDB_ARGS: "--data-checksums"
    ports:
      # Only expose for external access if needed (remove in hardened production)
      - "${PG_EXTERNAL_PORT:-127.0.0.1:5433}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init_db.sql:/docker-entrypoint-initdb.d/init_db.sql:ro
    networks:
      - rustpress-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER:-rustpress} -d ${PG_DB:-rustpress}"]
      interval: 10s
      timeout: 5s
      start_period: 10s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2.0'
        reservations:
          memory: 256M
          cpus: '0.25'
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=512MB"
      - "-c"
      - "work_mem=4MB"
      - "-c"
      - "maintenance_work_mem=128MB"
      - "-c"
      - "wal_level=replica"
      - "-c"
      - "max_wal_size=1GB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "log_min_duration_statement=500"
      - "-c"
      - "log_checkpoints=on"
      - "-c"
      - "log_connections=on"
      - "-c"
      - "log_disconnections=on"
    logging: *default-logging

  # ============================================================
  # Redis 7 Cache & Session Store
  # ============================================================
  redis:
    image: redis:7-alpine
    container_name: rustpress-cache
    restart: unless-stopped
    ports:
      # Only expose for external access if needed
      - "${REDIS_EXTERNAL_PORT:-127.0.0.1:6380}:6379"
    volumes:
      - redis_data:/data
    networks:
      - rustpress-net
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      start_period: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '1.0'
        reservations:
          memory: 64M
          cpus: '0.1'
    command:
      - "redis-server"
      - "--requirepass"
      - "${REDIS_PASSWORD}"
      - "--maxmemory"
      - "200mb"
      - "--maxmemory-policy"
      - "allkeys-lru"
      - "--appendonly"
      - "yes"
      - "--appendfsync"
      - "everysec"
      - "--save"
      - "60 1000"
      - "--save"
      - "300 100"
    logging: *default-logging

# ============================================================
# Volumes
# ============================================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads_data:
    driver: local
  logs_data:
    driver: local
  themes_data:
    driver: local

# ============================================================
# Networks
# ============================================================
networks:
  rustpress-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### 4.1 Required `.env` File for Production

```env
# .env (NEVER commit this file)

# === REQUIRED ===
PG_PASSWORD=<generate-strong-password-here>
REDIS_PASSWORD=<generate-strong-password-here>
JWT_SECRET=<generate-64-char-random-string-here>

# === RECOMMENDED ===
SITE_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=<initial-admin-password>
RUST_LOG=info

# === OPTIONAL ===
RUSTPRESS_VERSION=latest
RUSTPRESS_PORT=8080
PG_USER=rustpress
PG_DB=rustpress
PG_EXTERNAL_PORT=127.0.0.1:5433
REDIS_EXTERNAL_PORT=127.0.0.1:6380

# SMTP (for email features)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=smtp-password
```

---

## 5. Proposed Optimized Dockerfile

```dockerfile
# ============================================================
# Stage 1: Chef -- Dependency caching
# ============================================================
FROM rust:slim-bookworm AS chef
RUN cargo install cargo-chef --locked
WORKDIR /app

# ============================================================
# Stage 2: Planner -- Generate dependency recipe
# ============================================================
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ============================================================
# Stage 3: Builder -- Compile dependencies, then source
# ============================================================
FROM chef AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Build dependencies first (cached layer)
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Build application (only this layer rebuilds on source change)
COPY . .
RUN cargo build --release

# Strip binaries to reduce size
RUN strip target/release/rustpress \
    target/release/rustpress-cli \
    target/release/rustpress-migrate

# ============================================================
# Stage 4: Admin UI Builder
# ============================================================
FROM node:20-alpine AS ui-builder
WORKDIR /ui

# Install dependencies (cached layer)
COPY admin-ui/package.json admin-ui/package-lock.json ./
RUN npm ci --production=false

# Build admin UI
COPY admin-ui/ .
RUN npm run build

# ============================================================
# Stage 5: Runtime
# ============================================================
FROM debian:bookworm-slim AS runtime

# Create non-root user
RUN groupadd -r rustpress && useradd -r -g rustpress -d /app -s /bin/false rustpress

WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy binaries
COPY --from=builder /app/target/release/rustpress /usr/local/bin/rustpress
COPY --from=builder /app/target/release/rustpress-cli /usr/local/bin/rustpress-cli
COPY --from=builder /app/target/release/rustpress-migrate /usr/local/bin/rustpress-migrate

# Copy application assets
COPY config ./config
COPY themes ./themes
COPY public ./public
COPY migrations ./migrations
COPY deploy/scripts/entrypoint.sh /entrypoint.sh

# Copy built admin UI
COPY --from=ui-builder /ui/dist ./admin-ui/

# Create data directories and set ownership
RUN mkdir -p /app/uploads /app/logs /app/plugins \
    && chown -R rustpress:rustpress /app

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Set environment defaults
ENV HOST=0.0.0.0 \
    PORT=8080 \
    RUST_LOG=info \
    RUSTPRESS_VERSION=0.4.0

# Expose port
EXPOSE 8080

# Health check -- use liveness probe endpoint (lightweight)
HEALTHCHECK --interval=30s --timeout=10s --start_period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health/live || exit 1

# Switch to non-root user
USER rustpress

# Use entrypoint for migration + seed + start
ENTRYPOINT ["/entrypoint.sh"]
CMD ["rustpress"]
```

---

## 6. Container Stack Summary

```
                 +----------------------------+
                 |   Host / Reverse Proxy     |
                 |   (Nginx/Caddy/Traefik)    |
                 +-------------|-------------+
                               |
                    port ${RUSTPRESS_PORT:-8080}
                               |
  +----------------------------v----------------------------+
  |              rustpress-net (bridge network)             |
  |                                                         |
  |  +----------------+  +----------+  +-----------+       |
  |  | rustpress-app  |  | rustpress|  | rustpress |       |
  |  | (Axum :8080)   |--| -db      |--| -cache    |       |
  |  |                |  | (PG16    |  | (Redis 7  |       |
  |  | /admin/* -> SPA|  | :5432)   |  | :6379)    |       |
  |  | /api/*  -> API |  |          |  |           |       |
  |  | /*      -> SSR |  | Volume:  |  | Volume:   |       |
  |  | /health -> HC  |  | pg_data  |  | redis_data|       |
  |  | /metrics-> Prom|  |          |  |           |       |
  |  +----------------+  +----------+  +-----------+       |
  |                                                         |
  |  Volumes:                                               |
  |    postgres_data, redis_data, uploads_data,            |
  |    logs_data, themes_data                               |
  +---------------------------------------------------------+
```

### 6.1 Service Communication Matrix

| Source | Destination | Protocol | Port | Auth |
|--------|------------|----------|------|------|
| Client | rustpress-app | HTTP/HTTPS | 8080 | JWT |
| rustpress-app | postgres | TCP (PG wire) | 5432 | Username/password |
| rustpress-app | redis | TCP (RESP) | 6379 | Password (requirepass) |
| Prometheus | rustpress-app | HTTP | 8080 (/metrics) | None (internal network) |

### 6.2 Data Persistence Matrix

| Volume | Service | Mount Point | Purpose | Backup Priority |
|--------|---------|-------------|---------|-----------------|
| `postgres_data` | postgres | `/var/lib/postgresql/data` | Database files | CRITICAL |
| `redis_data` | redis | `/data` | Cache + session persistence | MEDIUM |
| `uploads_data` | rustpress | `/app/uploads` | User-uploaded media | HIGH |
| `logs_data` | rustpress | `/app/logs` | Application logs | LOW |
| `themes_data` | rustpress | `/app/themes` | Installed themes | MEDIUM |

---

## 7. .dockerignore (Missing -- Must Create)

```dockerignore
# Version control
.git
.gitignore

# Build artifacts
target/
node_modules/
dist/

# IDE
.idea/
.vscode/
*.swp
*.swo

# CI/CD
.github/
.gitlab-ci.yml
devops-workflows/
devops-actions/

# Tests
test-*/
release-test-*/

# Documentation
*.md
!README.md
docs/

# Scripts not needed in image
*.py
*.bat
*.ps1

# Team artifacts
.team/
.ai/

# OS files
.DS_Store
Thumbs.db
```

---

## 8. Entrypoint Script Audit

**File:** `deploy/scripts/entrypoint.sh`

The existing entrypoint.sh is well-written and handles:
1. PostgreSQL readiness wait (30 attempts, 2s intervals = 60s max)
2. Database migration execution (idempotent, tracks applied migrations)
3. Initial admin user seeding (only if no users exist)
4. Default site options seeding (only if not configured)
5. Exec into main process (proper PID 1 handling)

**Issues found:**

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | Uses `psql` for migrations | MEDIUM | The entrypoint uses `psql` CLI which requires `postgresql-client` to be installed in the runtime image. Current Dockerfile does NOT install this |
| 2 | Uses `python3 + bcrypt` for password hashing | MEDIUM | The runtime image does not have Python or bcrypt. Admin seeding will silently fail |
| 3 | `pg_isready` used but not installed | MEDIUM | Same issue -- `postgresql-client` needed |
| 4 | No `rustpress-migrate` binary usage | INFO | The binary exists but entrypoint uses raw psql instead. Consider using the dedicated migration binary |

**Resolution options:**
- A) Install `postgresql-client` in runtime image (~5MB additional)
- B) Rewrite entrypoint to use `rustpress-migrate` binary for migrations and `rustpress-cli` for seeding
- C) Add a lightweight init container that runs migrations

**Recommendation:** Option B is cleanest. The `rustpress-migrate` and `rustpress-cli` binaries already exist in the image. Refactor entrypoint to use them instead of raw psql.

---

## 9. Security Hardening Checklist

| # | Item | Current | Target | Action |
|---|------|---------|--------|--------|
| 1 | Non-root user | Missing | `rustpress:rustpress` | Add to Dockerfile |
| 2 | Read-only filesystem | Not set | Enable where possible | Add `read_only: true` to compose, mount writable volumes |
| 3 | No new privileges | Not set | `no-new-privileges:true` | Add security_opt to compose |
| 4 | Drop capabilities | Not set | Drop ALL, add only needed | Add cap_drop/cap_add to compose |
| 5 | Secrets management | Env vars | Docker secrets or Vault | Use `docker compose secrets` for passwords |
| 6 | Image scanning | None | Trivy in CI | Add `aquasecurity/trivy-action` to CI |
| 7 | Signed images | None | cosign | Add image signing to release pipeline |
| 8 | Network segmentation | Default bridge | Named bridge with subnet | Implemented in proposed compose |
| 9 | Bind host-only ports | All interfaces | `127.0.0.1:port` | Implemented in proposed compose for PG/Redis |

---

## 10. Implementation Priority

| Priority | Task | Impact |
|----------|------|--------|
| P0 | Remove RUSTFLAGS suppression from Dockerfile | Aligns with strategy hard constraint |
| P0 | Add non-root user to Dockerfile | Security |
| P0 | Create `.dockerignore` | Build context size, security |
| P0 | Create production `docker-compose.production.yml` | Deployment readiness |
| P1 | Integrate entrypoint.sh into Dockerfile | Database migration on startup |
| P1 | Add dependency caching (cargo-chef) | Build speed |
| P1 | Include admin-ui build stage | Complete image |
| P1 | Install `postgresql-client` or refactor entrypoint | Migration support |
| P2 | Strip binaries | Image size |
| P2 | Add Trivy scanning to CI | Security |
| P2 | PostgreSQL tuning parameters | Performance |
| P3 | Alpine base migration | Image size (risky, test thoroughly) |
| P3 | Docker secrets for passwords | Security hardening |
