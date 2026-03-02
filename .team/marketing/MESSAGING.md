# RustPress CMS — Key Messages

> **Document Owner**: MKT (Marketing Strategist)
> **Created**: 2026-03-02
> **Status**: Active

---

## 1. Elevator Pitch (30 Seconds)

> RustPress is a WordPress alternative built entirely in Rust. It gives you the same content management workflow -- posts, pages, themes, plugins, media library -- but runs 40 times faster, uses a fraction of the memory, and eliminates entire categories of security vulnerabilities at compile time. You deploy it with a single `docker-compose up` command, and it handles 5,000 requests per second on hardware where WordPress struggles with 200.

---

## 2. Technical Pitch (For Developers)

> RustPress is an open-source CMS built on Axum 0.7, Tokio, sqlx with PostgreSQL 16, and Redis 7. The backend is organized into 19 Rust crates covering auth, content, media, plugins, themes, caching, search, and more. The admin UI is React 18 with TypeScript, Vite 6, Tailwind CSS, and Zustand for state management.
>
> Why Rust for a CMS? Three reasons. First, performance: our API P95 is under 100ms and we sustain 5,000 req/s on a single instance with less than 256MB RAM under load. Second, safety: sqlx gives us compile-time verified SQL queries, Rust's ownership model eliminates memory bugs, and Argon2id handles password hashing. Third, concurrency: Tokio's async runtime lets us handle thousands of concurrent connections without the thread-per-request overhead of PHP or the single-threaded limitations of Node.js.
>
> The plugin system uses WordPress-style action and filter hooks, so the mental model is familiar. Themes use a template engine with full-site editing support. We import WordPress WXR files for migration. The whole thing ships as a single Docker image under 100MB.
>
> It's dual-licensed MIT + Apache-2.0. Clone it, run it, contribute to it.

---

## 3. Business Pitch (For Agencies and Businesses)

> If you run WordPress sites for clients, you know the drill: monthly security patches, plugin conflicts after updates, performance optimization that eats billable hours, and scaling emergencies when a client's post goes viral.
>
> RustPress eliminates most of that. It's a full-featured CMS -- posts, pages, media, themes, plugins, user management, e-commerce -- built in Rust instead of PHP. Your content team gets a modern React dashboard that loads instantly. Your DevOps team gets a Docker container with health probes and Prometheus metrics. Your security team gets a CMS where SQL injection is literally impossible at the language level.
>
> The result: fewer emergency maintenance calls, lower hosting costs (it runs on a $5/month VPS), and more time for the work that actually generates revenue. Your clients get faster websites. You get fewer 2 AM pages.
>
> Migration is straightforward. Export your WordPress content as WXR, import it into RustPress, verify, and switch DNS. Your content structure carries over.

---

## 4. Migration Pitch (For WordPress Users)

> You don't have to give up what works about WordPress to get something better.
>
> RustPress keeps the content model you know: posts, pages, categories, tags, media, menus, widgets, users with roles. The admin dashboard has the same sections -- just faster, built in React instead of jQuery. The plugin system uses the same hook architecture. Themes work the same way conceptually.
>
> What changes is everything underneath. PHP becomes Rust. MySQL becomes PostgreSQL. A sprawling LAMP stack becomes a single Docker container. Page load times drop from seconds to milliseconds. Memory usage drops from hundreds of megabytes to under fifty. Security patches become rare events instead of monthly chores.
>
> To migrate: export your WordPress content using the built-in WXR export tool, start RustPress with `docker-compose up`, import your WXR file, and your content is live. Posts, pages, media references, categories, tags -- it all comes across.
>
> You keep your content. You gain the performance.

---

## 5. Key Differentiators with Evidence Claims

### Differentiator 1: 10-40x Performance Over WordPress

| Claim | Evidence | How to Verify |
|-------|----------|---------------|
| API P95 latency < 100ms | k6 load test report | Run `k6 run benchmarks/api-load.js` against running instance |
| 5,000 req/s sustained (single instance) | k6 sustained load test (60s) | Same k6 script, 60-second duration |
| Server startup < 3 seconds | Timed from process start to health check | `time curl http://localhost:8080/health/live` after `docker-compose up` |
| Idle memory < 50MB | Prometheus metrics at idle | `curl http://localhost:8080/metrics | grep process_resident_memory_bytes` |
| Memory under load < 256MB | Prometheus metrics at 1K concurrent | Same metric during k6 load test |
| Docker image < 100MB | Docker image listing | `docker images rustpress` |
| WordPress comparison: 50-200 req/s (same hardware) | Side-by-side k6 test | Published benchmark methodology and raw data |

### Differentiator 2: Compile-Time Security

| Claim | Evidence | How to Verify |
|-------|----------|---------------|
| SQL injection impossible | sqlx parameterized queries (compile-time verified) | `grep -r "query!" crates/` -- all queries use sqlx macros, no string concatenation |
| Buffer overflow impossible | Rust ownership model, no unsafe in application code | `grep -r "unsafe" crates/` -- zero unsafe blocks in application crates |
| Data races impossible | Rust Send/Sync trait system | Compiler enforces thread safety; `cargo clippy` passes |
| Zero CRITICAL/HIGH CVEs | cargo-audit + npm audit reports | Run `cargo audit` and `npm audit` against repos |
| OWASP Top 10 mitigated | OWASP ZAP scan report | Run ZAP scan against running instance |
| Argon2id password hashing | Source code inspection | `grep -r "argon2" crates/rustpress-auth/` |
| JWT with configurable expiry | Environment variable configuration | Check `.env.example` for `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` |

### Differentiator 3: WordPress Compatibility Without WordPress Baggage

| Claim | Evidence | How to Verify |
|-------|----------|---------------|
| WordPress content model (posts, pages, categories, tags) | Database schema | Review migration files in `migrations/` |
| WordPress-style plugin hooks (actions + filters) | Plugin system source | Review `crates/rustpress-plugins/` hook architecture |
| WordPress WXR import | Import functionality | Export WordPress WXR, import via CLI or admin UI |
| Theme system with template hierarchy | Theme engine source | Review `crates/rustpress-themes/` |
| Modern admin UI (React 18, not jQuery) | Admin UI codebase | 150+ React components, Zustand stores, Tailwind CSS |
| PostgreSQL 16 (not MySQL 5.x) | Database configuration | sqlx connection to PostgreSQL, compile-time verified |
| Docker-native (not LAMP) | Deployment config | Single `docker-compose.yml`, multi-stage Dockerfile |

### Differentiator 4: Operational Simplicity

| Claim | Evidence | How to Verify |
|-------|----------|---------------|
| Single `docker-compose up` deployment | docker-compose.yml in repo | Clone repo, run `docker-compose up`, site is live |
| Working site in < 5 minutes | End-to-end deployment test | Time from `git clone` to first admin login |
| Kubernetes-ready health probes | `/health/live`, `/health/ready` endpoints | `curl` both endpoints, verify 200 responses |
| Prometheus metrics built-in | `/metrics` endpoint | `curl http://localhost:8080/metrics` |
| Runs on 1 vCPU / 512MB RAM | Resource monitoring under load | Deploy to minimal VPS, verify stable operation |
| Horizontal scaling (multiple instances behind LB) | Architecture design | Stateless application server, shared PostgreSQL + Redis |

---

## 6. Objection Handling

### "WordPress has 60,000 plugins. RustPress has almost none."

**Response**: You're right, and we won't pretend otherwise. WordPress's ecosystem is its greatest asset. RustPress ships with 7 built-in plugins covering the most common needs (analytics, backup, e-commerce, CDN, database management). For v1.0, we focus on core CMS functionality that works reliably. The plugin architecture uses WordPress-style hooks, so the development model is familiar. Our bet is that a smaller number of high-quality, Rust-native plugins will serve most users better than thousands of poorly-maintained PHP plugins that conflict with each other.

### "Rust is hard. Who will build plugins and themes?"

**Response**: Plugin and theme developers don't need to write Rust. The plugin API exposes hooks through a well-documented interface. Theme templates use a templating engine, not raw Rust. The admin UI is React/TypeScript -- the same stack millions of frontend developers already know. The Rust complexity is in the engine, not the extensions.

### "Why not just use WordPress with good caching?"

**Response**: Caching helps WordPress, but it's a band-aid on a fundamental architecture limitation. RustPress is fast without caching. With Redis caching enabled, it's faster still. More importantly, caching doesn't fix WordPress's security surface area, its memory usage, its startup time, or its operational complexity. If WP Super Cache solves your problems, keep using WordPress. RustPress is for teams that have hit the ceiling.

### "Ghost / Strapi / Payload already solved this."

**Response**: Each of those makes different trade-offs. Ghost is a publishing platform (not a general CMS) with limited plugin/theme extensibility. Strapi and Payload are headless-only -- you build your own frontend. RustPress is a full-featured CMS with server-rendered public pages, a plugin ecosystem, a theme engine, AND a REST API. It's the WordPress replacement, not the "API backend for your Next.js app" replacement.

### "Is Rust really necessary for a CMS?"

**Response**: Necessary? No. Beneficial? Dramatically. The performance gains (40x over PHP) mean lower hosting costs and better user experience. The memory safety means entire vulnerability categories simply don't exist. The type system catches bugs at compile time that WordPress discovers in production. You could build a CMS in any language. We chose the one that makes the most important properties -- speed and safety -- guarantees rather than aspirations.

### "Can I migrate back to WordPress if RustPress doesn't work out?"

**Response**: Your content is in PostgreSQL with a well-documented schema. Export functionality produces standard formats. We don't lock you in. That said, we're building RustPress to be good enough that you won't want to go back.

---

## 7. Messaging Do's and Don'ts

### Do

- Lead with concrete numbers (100ms, 5K req/s, 50MB, 100MB image)
- Be honest about limitations (small ecosystem, v1.0, Docker required)
- Credit WordPress for pioneering the CMS category
- Emphasize migration path, not forced abandonment
- Show reproducible benchmarks with published methodology
- Use "alternative" not "killer" or "replacement" in public messaging
- Acknowledge the ecosystem gap and explain the strategy to close it

### Don't

- Claim RustPress "replaces" WordPress (it's an alternative for those who want it)
- Trash PHP or WordPress developers
- Make security claims without evidence (always cite specific mechanisms)
- Promise features that aren't in v1.0 without clearly marking them as roadmap
- Compare against WordPress with 50 plugins installed (compare apples to apples)
- Use "blazing fast" without numbers (every project claims this)
- Imply WordPress is insecure in general (it's insecure in specific, documented ways)

---

## 8. Boilerplate Descriptions

### One-Liner (for GitHub, directories, social profiles)

> RustPress: A production-grade WordPress alternative built in Rust with a React admin dashboard. Open source (MIT + Apache-2.0).

### Short Description (for Product Hunt, directories)

> RustPress is an open-source CMS built in Rust that delivers WordPress-level content management with 40x better performance, compile-time security guarantees, and single-command Docker deployment. Features include posts, pages, themes, plugins, media library, user management, and e-commerce -- all running on less than 50MB of RAM.

### README Introduction (for GitHub)

> **RustPress** is a production-grade, self-hostable content management system built entirely in Rust (backend) and React/TypeScript (admin UI). It provides the content management workflow that WordPress popularized -- posts, pages, themes, plugins, media, users, menus, widgets -- rebuilt from the ground up for modern performance, security, and deployment standards.
>
> - API P95 < 100ms | 5,000 req/s sustained | < 50MB idle memory
> - Compile-time SQL verification | Argon2id passwords | Zero unsafe application code
> - `docker-compose up` to working site in under 5 minutes
> - WordPress WXR content import for migration
> - MIT + Apache-2.0 dual license

### Conference Talk Abstract

> **Title**: Building a WordPress Alternative in Rust: Architecture, Performance, and Lessons Learned
>
> WordPress powers 40% of the web, but its PHP foundation limits performance, security, and scalability. RustPress is an open-source CMS that reimplements WordPress's content management model in Rust -- 19 crates covering auth, content, media, plugins, themes, caching, and more -- with a React/TypeScript admin dashboard. This talk covers the architecture decisions behind RustPress (why Axum, why sqlx, why 19 crates), the performance results (5K req/s on a single instance, sub-100ms P95), the security properties Rust provides for free (compile-time SQL verification, memory safety), and the hard lessons learned building a production application in Rust (compile times, ecosystem gaps, the async learning curve). Live demo included.
