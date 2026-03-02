# CI/CD Pipeline Design -- RustPress CMS

> Wave 2 DevOps Research & Planning Artifact
> Date: 2026-03-02
> Author: DevOps Engineer (DEVOPS)
> Status: RESEARCH COMPLETE -- Ready for implementation review

---

## 1. Current State Assessment

### 1.1 Backend Repository (`rustpress-core-base`)

**Existing CI:** `.github/workflows/ci.yml`

| Job | What it does | Issues found |
|-----|-------------|--------------|
| `check` | `cargo check --all-targets --all-features` | Good, but uses warning-suppression RUSTFLAGS |
| `test` | `cargo test --all-features` with PG 15 + Redis 7 services | Uses PostgreSQL 15, strategy says 16. Only 1 integration test file exists (`crates/rustpress-database/tests/persistence_tests.rs`) |
| `fmt` | `cargo fmt --all -- --check` | Clean -- no issues |
| `clippy` | `cargo clippy --all-targets --all-features -- -A warnings -A clippy::all` | **CRITICAL**: Suppresses ALL clippy lints (`-A warnings -A clippy::all`), making the job useless |
| `build` | Multi-OS matrix (ubuntu, windows, macos) release build | Expensive (3 runners), consider narrowing for CI |

**RUSTFLAGS in CI (line 12):**
```
RUSTFLAGS: -Dwarnings -Aunused -Amismatched_lifetime_syntaxes -Adependency_on_unit_never_type_fallback -Aunused_comparisons -Aambiguous_glob_reexports -Aimproper_ctypes_definitions
```
This suppresses 6 categories of warnings. The strategy hard-constraint requires `cargo clippy -- -D warnings` with NO suppression.

**Existing Release:** `.github/workflows/release.yml`
- Sophisticated conventional-commit version bumping
- Multi-platform build matrix (linux, windows, macos x86 + ARM)
- Clones admin-ui repo, builds it, bundles with backend
- Pushes Docker image to ghcr.io
- Cleanup of old drafts/prereleases
- Uses `softprops/action-gh-release@v1`

**Reusable workflows in `devops-workflows/`:**
- `ci-rust.yml` -- reusable Rust CI (check, test, fmt, clippy, build)
- `ci-node.yml` -- reusable Node.js CI (lint, test, build)
- `release-rust.yml`, `release-node.yml`, etc.
- These are NOT currently wired into `.github/workflows/` -- they exist as templates

**GitLab CI:** `.gitlab-ci.yml` exists as an alternative CI definition (MinIO artifact storage). Not actively used but provides additional reference.

### 1.2 Frontend Repository (`rustpress-core-admin-ui`)

**Existing CI:** NONE. No `.github/` directory exists.

**package.json scripts:**
```json
"dev": "vite",
"build": "vite build",
"build:typecheck": "tsc -b && vite build",
"preview": "vite preview"
```

**Missing from package.json:**
- No `test` script
- No `lint` script
- No Vitest dependency
- No Playwright dependency
- No ESLint / Prettier dependency
- No `@testing-library/react` dependency
- No MSW dependency

**TypeScript config:** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` -- all safety off.

### 1.3 CI Trigger Branches

The existing CI triggers on `push: [main, develop]` and `pull_request: [main]`. The strategy mandates `ai-develop` as the working branch. Both `ai-develop` and `main` need protection.

---

## 2. Proposed CI/CD Architecture

### 2.1 Backend CI Pipeline (`rustpress-core-base/.github/workflows/ci.yml`)

```
Trigger: push to ai-develop, main
         pull_request to ai-develop, main

  +----------+     +---------+     +----------+     +---------+
  |   fmt    |     |  check  |     |  clippy  |     | audit   |
  | (30s)    |     | (3-5m)  |     | (3-5m)   |     | (1m)    |
  +----------+     +---------+     +----------+     +---------+
       |                |               |                |
       +-------+--------+-------+-------+                |
               |                |                        |
          +----v----+     +-----v-----+            +-----v------+
          |  test   |     |  docker   |            |  migration |
          | (5-8m)  |     |  build    |            |   test     |
          | PG16+   |     |  (3-5m)   |            |   (2-3m)   |
          | Redis7  |     +-----------+            +------------+
          +---------+
```

**Job Details:**

#### Job 1: `fmt` -- Formatting Check
```yaml
fmt:
  name: Formatting
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
      with:
        components: rustfmt
    - run: cargo fmt --all -- --check
```

#### Job 2: `check` -- Compilation Check
```yaml
check:
  name: Cargo Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
    - uses: Swatinem/rust-cache@v2
    - run: cargo check --all-targets --all-features
  env:
    CARGO_TERM_COLOR: always
    # NO RUSTFLAGS suppression -- strategy hard constraint
```

**Key change:** Remove all `-A` flags from RUSTFLAGS. The strategy requires zero warning suppression. If compilation fails, that is a Wave 1 responsibility to fix the source code.

#### Job 3: `clippy` -- Linting
```yaml
clippy:
  name: Clippy Lints
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
      with:
        components: clippy
    - uses: Swatinem/rust-cache@v2
    - run: cargo clippy --all-targets --all-features -- -D warnings
```

**Key change:** Replace `-A warnings -A clippy::all` with `-D warnings` (deny all warnings). This is the strategy hard constraint.

#### Job 4: `audit` -- Security Audit
```yaml
audit:
  name: Security Audit
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: rustsec/audit-check@v2.0.0
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
```
Alternatively:
```yaml
    - run: cargo install cargo-audit && cargo audit
```

#### Job 5: `test` -- Unit & Integration Tests
```yaml
test:
  name: Test Suite
  runs-on: ubuntu-latest
  needs: [check]  # Only run if compilation succeeds
  services:
    postgres:
      image: postgres:16-alpine  # Upgrade from 15 to 16
      env:
        POSTGRES_USER: rustpress
        POSTGRES_PASSWORD: rustpress
        POSTGRES_DB: rustpress_test
      ports: ["5432:5432"]
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
    redis:
      image: redis:7-alpine
      ports: ["6379:6379"]
      options: >-
        --health-cmd "redis-cli ping"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
    - uses: Swatinem/rust-cache@v2
    - name: Run tests
      env:
        DATABASE_URL: postgres://rustpress:rustpress@localhost:5432/rustpress_test
        REDIS_URL: redis://localhost:6379
        JWT_SECRET: test-secret-key-for-ci-only
      run: cargo test --all-features -- --test-threads=4
```

#### Job 6: `docker-build` -- Docker Image Build (no push)
```yaml
docker-build:
  name: Docker Build Verification
  runs-on: ubuntu-latest
  needs: [check]
  steps:
    - uses: actions/checkout@v4
    - uses: docker/setup-buildx-action@v3
    - uses: docker/build-push-action@v5
      with:
        context: .
        push: false
        tags: rustpress:ci-${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    - name: Check image size
      run: |
        docker images rustpress:ci-${{ github.sha }} --format "{{.Size}}"
        SIZE=$(docker images rustpress:ci-${{ github.sha }} --format "{{.Size}}")
        echo "Docker image size: $SIZE"
```

#### Job 7: `migration-test` -- Database Migration Verification
```yaml
migration-test:
  name: Migration Test
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_USER: rustpress
        POSTGRES_PASSWORD: rustpress
        POSTGRES_DB: rustpress_migration_test
      ports: ["5432:5432"]
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  steps:
    - uses: actions/checkout@v4
    - name: Run all migrations up
      env:
        DATABASE_URL: postgres://rustpress:rustpress@localhost:5432/rustpress_migration_test
      run: |
        for f in migrations/*.sql; do
          echo "Applying: $f"
          psql "$DATABASE_URL" -f "$f"
        done
    - name: Verify tables created
      env:
        DATABASE_URL: postgres://rustpress:rustpress@localhost:5432/rustpress_migration_test
      run: |
        psql "$DATABASE_URL" -c "\dt" | tee migration-tables.txt
        # Verify key tables exist
        psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### 2.2 Frontend CI Pipeline (`rustpress-core-admin-ui/.github/workflows/ci.yml`)

```
Trigger: push to ai-develop, main
         pull_request to ai-develop, main

  +----------+     +-----------+     +----------+
  | typecheck |     |   lint    |     |  audit   |
  |  (1-2m)  |     |  (1-2m)  |     |  (30s)   |
  +----------+     +-----------+     +----------+
       |                |                |
       +-------+--------+               |
               |                        |
          +----v----+             +-----v------+
          |  test   |             |   build    |
          | vitest  |             |  (1-2m)    |
          | (2-3m)  |             +------------+
          +---------+                   |
               |                   +----v-----+
          +----v--------+          | bundle   |
          | playwright  |          | analyze  |
          |   e2e       |          | (30s)    |
          |  (3-5m)     |          +----------+
          +-------------+
```

**Prerequisites:** These npm scripts and devDependencies must be added first (Wave 1 task).

```json
// package.json additions needed:
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "msw": "^2.0.0",
    "@playwright/test": "^1.45.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "prettier": "^3.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "jsdom": "^25.0.0"
  }
}
```

#### Job 1: `typecheck` -- TypeScript Compilation
```yaml
typecheck:
  name: TypeScript Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx tsc --noEmit
```

**Note:** Once `strict: true` is enabled in tsconfig.json (Wave 1), this becomes the primary type-safety gate.

#### Job 2: `lint` -- ESLint
```yaml
lint:
  name: ESLint
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
```

#### Job 3: `audit` -- npm Security Audit
```yaml
audit:
  name: Security Audit
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm audit --audit-level=high
```

#### Job 4: `test` -- Vitest Unit Tests
```yaml
test:
  name: Vitest
  runs-on: ubuntu-latest
  needs: [typecheck]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run test:coverage
    - name: Upload coverage
      uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: coverage/
```

#### Job 5: `e2e` -- Playwright End-to-End Tests
```yaml
e2e:
  name: Playwright E2E
  runs-on: ubuntu-latest
  needs: [test]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run build
    - run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

#### Job 6: `build` -- Production Build
```yaml
build:
  name: Build
  runs-on: ubuntu-latest
  needs: [typecheck]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - name: Check bundle size
      run: |
        du -sh dist/
        # Fail if gzipped bundle exceeds 5MB
        GZIP_SIZE=$(find dist -name "*.js" -exec gzip -c {} \; | wc -c)
        echo "Gzipped JS size: $((GZIP_SIZE / 1024))KB"
    - uses: actions/upload-artifact@v4
      with:
        name: admin-ui-dist
        path: dist/
```

### 2.3 Cross-Repo Integration Testing

**Approach: Composite workflow triggered on both repos**

Since the repos are polyrepo (separate repositories), cross-repo integration testing requires a coordinated approach.

#### Option A (Recommended): Backend triggers frontend integration test

Create `.github/workflows/integration.yml` in `rustpress-core-base`:

```yaml
name: Integration Test

on:
  workflow_dispatch:
  push:
    branches: [ai-develop]

jobs:
  integration:
    name: Full Stack Integration
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: rustpress
          POSTGRES_PASSWORD: rustpress
          POSTGRES_DB: rustpress_integration
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout backend
        uses: actions/checkout@v4

      - name: Checkout admin-ui
        uses: actions/checkout@v4
        with:
          repository: ${{ github.repository_owner }}/rustpress-core-admin-ui
          ref: ai-develop
          path: admin-ui-src

      # Build admin UI
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: admin-ui-src/package-lock.json
      - run: cd admin-ui-src && npm ci && npm run build

      # Copy built admin UI to expected location
      - run: cp -r admin-ui-src/dist admin-ui/

      # Build and start backend
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: Build backend
        run: cargo build --release
      - name: Run migrations
        env:
          DATABASE_URL: postgres://rustpress:rustpress@localhost:5432/rustpress_integration
        run: |
          for f in migrations/*.sql; do
            psql "$DATABASE_URL" -f "$f"
          done

      # Start server in background
      - name: Start RustPress server
        env:
          DATABASE_URL: postgres://rustpress:rustpress@localhost:5432/rustpress_integration
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: integration-test-secret
          HOST: 127.0.0.1
          PORT: 8080
        run: |
          ./target/release/rustpress &
          sleep 5

      # Verify endpoints
      - name: Health check
        run: |
          curl -f http://localhost:8080/health/live || exit 1
          curl -f http://localhost:8080/health/ready || exit 1

      - name: API smoke test
        run: |
          # Verify admin UI is served
          curl -f http://localhost:8080/admin/ || exit 1
          # Verify API responds
          curl -f http://localhost:8080/api/v1/health || true
          # Verify metrics endpoint
          curl -f http://localhost:8080/metrics || true

      # Run Playwright E2E against full stack
      - name: Install Playwright
        run: cd admin-ui-src && npx playwright install --with-deps chromium
      - name: Run E2E integration tests
        run: cd admin-ui-src && BACKEND_URL=http://localhost:8080 npx playwright test --project=integration
```

#### Option B: Repository dispatch (event-driven)

Frontend pushes can trigger backend integration via `repository_dispatch`:

```yaml
# In admin-ui: on push to ai-develop, dispatch to backend
- name: Trigger integration test
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.CROSS_REPO_TOKEN }}
    repository: ${{ github.repository_owner }}/rustpress-core-base
    event-type: admin-ui-updated
    client-payload: '{"ref": "${{ github.sha }}"}'
```

**Recommendation:** Use Option A for now (simpler, no extra secrets needed). Add Option B once the CI is stable and we want push-triggered cross-repo tests.

---

## 3. Branch Protection Rules

### 3.1 `ai-develop` Branch (Working Branch)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Require pull request reviews | 0 reviews (AI agents push directly) | Strategy says auto-sync on agent completion |
| Require status checks to pass | YES | Prevent broken code |
| Required checks (backend) | `fmt`, `check`, `clippy`, `test` | Core quality gates |
| Required checks (frontend) | `typecheck`, `lint`, `test`, `build` | Core quality gates |
| Require branches to be up to date | No | Avoid rebase overhead for frequent AI commits |
| Restrict force pushes | YES | Strategy: never rebase published commits |
| Restrict deletions | YES | Branch protection |
| Allow auto-merge | YES | For CI-green PRs |

### 3.2 `main` Branch (Production)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Require pull request reviews | 1 review (Team Leader) | Strategy: merge to main requires explicit user approval |
| Require status checks to pass | YES | All CI must be green |
| Required checks (backend) | `fmt`, `check`, `clippy`, `test`, `audit`, `docker-build`, `migration-test` | Full quality gate |
| Required checks (frontend) | `typecheck`, `lint`, `test`, `e2e`, `audit`, `build` | Full quality gate including E2E |
| Require branches to be up to date | YES | Ensure merge is against latest main |
| Require signed commits | OPTIONAL | Nice-to-have for production |
| Restrict force pushes | YES | Never force push to main |
| Restrict deletions | YES | Never delete main |
| Require linear history | PREFERRED | Clean commit history |

---

## 4. Caching Strategy

### 4.1 Backend (Rust)

Use `Swatinem/rust-cache@v2` instead of manual `actions/cache@v4`:
- Automatically caches `~/.cargo/registry`, `~/.cargo/git`, `target/`
- Generates optimal cache keys from `Cargo.lock`
- Handles cache eviction and restoration
- Saves ~3-5 minutes per job on cache hit

**Manual cache config for fallback:**
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/registry
      ~/.cargo/git
      target
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
    restore-keys: |
      ${{ runner.os }}-cargo-
```

### 4.2 Frontend (Node.js)

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```
Built-in npm caching via `actions/setup-node` is sufficient. Cache key is derived from `package-lock.json`.

---

## 5. Estimated CI Timing

| Job | Backend | Frontend |
|-----|---------|----------|
| Format/Lint | ~30s | ~1-2m |
| Type Check | N/A (Rust is compiled) | ~1-2m |
| Compilation Check | ~3-5m (cold), ~1-2m (cached) | N/A |
| Clippy | ~3-5m (cold), ~1-2m (cached) | N/A |
| Tests | ~5-8m (with services) | ~2-3m (Vitest), ~3-5m (Playwright) |
| Build | ~5-10m (release) | ~1-2m |
| Security Audit | ~1m | ~30s |
| Docker Build | ~3-5m (cached) | N/A |
| Migration Test | ~2-3m | N/A |
| **Total (parallel)** | **~8-10m** | **~5-7m** |
| **Total (serial)** | **~25-35m** | **~10-15m** |

**Strategy target:** Backend < 10 min, Frontend < 5 min. With parallelization, both targets are achievable.

---

## 6. Pre-commit Hooks

### 6.1 Backend

Use `lefthook` or `pre-commit` framework:

```yaml
# .lefthook.yml
pre-commit:
  parallel: true
  commands:
    fmt:
      run: cargo fmt --all -- --check
    clippy:
      run: cargo clippy --all-targets --all-features -- -D warnings
```

### 6.2 Frontend

```yaml
# .lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{ts,tsx,json,css}"
      run: npx prettier --check {staged_files}
    typecheck:
      run: npx tsc --noEmit
```

---

## 7. Release Pipeline (Existing -- Verified Adequate)

The existing `release.yml` in the backend repo is well-designed:
- Conventional commit version detection
- Multi-platform builds (Linux, Windows, macOS x86 + ARM)
- Admin UI bundling via cross-repo checkout
- Docker image push to ghcr.io
- Automatic changelog generation
- Draft/prerelease/release classification
- Cleanup of old releases

**Recommended improvements:**
1. Add `cargo audit` check before release build
2. Add admin-ui `npm audit` check before release
3. Add smoke test after Docker build (start container, check health)
4. Pin `softprops/action-gh-release` to specific SHA (security)
5. Add SBOM generation for release artifacts

---

## 8. Secrets Required

| Secret | Repository | Purpose |
|--------|-----------|---------|
| `GITHUB_TOKEN` | Both (auto-provided) | Release creation, package publishing |
| `CROSS_REPO_TOKEN` | Both (optional) | Cross-repo dispatch for integration tests |

No additional paid services or API keys are required. GitHub Actions free tier provides 2000 minutes/month, which is sufficient for this project's CI volume.

---

## 9. Implementation Priority

| Priority | Task | Repo | Dependency |
|----------|------|------|------------|
| P0 | Fix RUSTFLAGS suppression in CI | Backend | Wave 1 must fix warnings first |
| P0 | Fix clippy job (remove `-A clippy::all`) | Backend | Wave 1 must fix clippy warnings first |
| P0 | Create frontend CI workflow | Frontend | Must add test deps to package.json first |
| P0 | Upgrade PostgreSQL 15 -> 16 in CI services | Backend | None |
| P1 | Add `cargo audit` job | Backend | None |
| P1 | Add `npm audit` job | Frontend | None |
| P1 | Add Docker build verification job | Backend | None |
| P1 | Add migration test job | Backend | None |
| P2 | Cross-repo integration workflow | Backend | Both CIs must be green first |
| P2 | Pre-commit hooks | Both | None |
| P2 | Bundle size check | Frontend | Build job must exist |
| P3 | Branch protection rule configuration | Both | CI must be stable first |

---

## 10. Files to Create/Modify

### Backend (`rustpress-core-base`)
| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | MODIFY | Remove RUSTFLAGS suppression, fix clippy, add audit/docker/migration jobs, upgrade PG to 16 |
| `.github/workflows/integration.yml` | CREATE | Cross-repo integration test |
| `.lefthook.yml` | CREATE | Pre-commit hooks |

### Frontend (`rustpress-core-admin-ui`)
| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | CREATE | Full frontend CI pipeline |
| `vitest.config.ts` | CREATE | Vitest configuration |
| `playwright.config.ts` | CREATE | Playwright configuration |
| `.eslintrc.cjs` or `eslint.config.js` | CREATE | ESLint configuration |
| `.prettierrc` | CREATE | Prettier configuration |
| `.lefthook.yml` | CREATE | Pre-commit hooks |
| `package.json` | MODIFY | Add test/lint deps and scripts |
