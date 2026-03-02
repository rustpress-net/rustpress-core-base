# RustPress CMS — Market Positioning

> **Document Owner**: MKT (Marketing Strategist)
> **Created**: 2026-03-02
> **Status**: Active

---

## 1. Tagline

**"The CMS that WordPress should have been."**

Alternative taglines for different contexts:

| Context | Tagline |
|---------|---------|
| Technical audiences | "WordPress-compatible. Rust-powered. Zero compromises." |
| Performance-focused | "40x faster than WordPress. Same workflow." |
| Security-focused | "Memory-safe CMS. No more midnight security patches." |
| Migration-focused | "Your WordPress content. Our Rust engine." |

---

## 2. Value Proposition

RustPress is a production-grade, self-hostable CMS that gives WordPress users and agencies the content management workflow they already know, rebuilt from the ground up in Rust for the performance, security, and reliability that PHP cannot deliver.

**For** self-hosting developers, WordPress agencies, and DevOps teams
**Who** need a fast, secure, scalable content management system
**RustPress is** a WordPress-compatible CMS built in Rust with a modern React admin dashboard
**That** delivers sub-100ms API responses, memory-safe execution, and container-native deployment
**Unlike** WordPress, Ghost, Strapi, and other PHP/Node.js CMS platforms
**RustPress** eliminates entire categories of vulnerabilities through Rust's type system, runs on 512MB RAM, and handles 5,000 requests per second on a single instance.

---

## 3. Competitive Analysis

| Dimension | RustPress | WordPress | Ghost | Strapi | Payload CMS | Directus |
|-----------|-----------|-----------|-------|--------|-------------|----------|
| **Language** | Rust + TypeScript | PHP | Node.js | Node.js | TypeScript | Node.js |
| **Architecture** | Monolith (19 crates) | Monolith | Monolith | Headless | Headless | Headless |
| **API P95 Latency** | < 100ms | 500-2000ms | 200-500ms | 200-600ms | 150-400ms | 200-500ms |
| **Throughput (single instance)** | 5,000 req/s | 50-200 req/s | 500-1,000 req/s | 300-800 req/s | 500-1,000 req/s | 300-800 req/s |
| **Memory (idle)** | < 50MB | 128-256MB | 150-300MB | 200-400MB | 150-300MB | 200-400MB |
| **Memory safety** | Compile-time guaranteed | None (runtime) | None (runtime) | None (runtime) | None (runtime) | None (runtime) |
| **SQL injection risk** | Impossible (sqlx parameterized) | High (manual escaping) | Low (ORM) | Low (ORM) | Low (ORM) | Low (ORM) |
| **Plugin ecosystem** | WordPress-compatible hooks | 60,000+ plugins | Limited | Plugin system | Plugin system | Extensions |
| **Theme system** | Full theme engine | 10,000+ themes | Limited (Handlebars) | None (headless) | None (headless) | None (headless) |
| **Admin UI** | React 18 + Tailwind | jQuery + PHP | Ember.js | React (Strapi admin) | React (custom) | Vue.js |
| **Database** | PostgreSQL 16 | MySQL/MariaDB | MySQL/SQLite | PostgreSQL/MySQL/SQLite | MongoDB/PostgreSQL | PostgreSQL/MySQL/SQLite/etc. |
| **Deployment** | Docker (single container) | LAMP stack / managed | Docker / managed | Docker / managed | Docker / managed | Docker / managed |
| **Startup time** | < 3 seconds | 10-30 seconds | 5-15 seconds | 5-15 seconds | 5-10 seconds | 5-15 seconds |
| **Docker image size** | < 100MB | 500MB+ | 300MB+ | 400MB+ | 300MB+ | 300MB+ |
| **License** | MIT + Apache-2.0 | GPLv2 | MIT | MIT (with EE) | MIT | GPLv3 (with EE) |
| **Price** | Free (open source) | Free (plugins paid) | Free + paid tiers | Free + paid tiers | Free + paid tiers | Free + paid tiers |
| **Content API** | REST (GraphQL in v2) | REST + GraphQL | REST + GraphQL | REST + GraphQL | REST + GraphQL | REST + GraphQL |
| **WP Migration** | WXR import supported | N/A (is WordPress) | WP import tool | Manual | Manual | Manual |
| **E-commerce** | RustCommerce plugin | WooCommerce | Members/Stripe | Custom build | Custom build | Custom build |

### Where RustPress Wins

1. **Performance**: 10-40x faster than WordPress, 5-10x faster than Node.js alternatives on equivalent hardware.
2. **Security**: Rust eliminates buffer overflows, use-after-free, data races, and SQL injection at compile time. No CVE treadmill.
3. **Resource efficiency**: Runs a full CMS on 512MB RAM / 1 vCPU. WordPress needs 2-4x that for equivalent traffic.
4. **WordPress familiarity**: Plugin hooks, theme system, content model, and admin workflows that WordPress users recognize.
5. **Modern stack**: React 18 admin UI, PostgreSQL 16, Redis 7, Docker-native. No jQuery, no MySQL 5.x legacy.

### Where Competitors Win (Honest Assessment)

| Competitor | Their Advantage |
|------------|----------------|
| WordPress | Massive ecosystem (60K plugins, 10K themes), largest community, most hosting providers, non-technical user friendliness |
| Ghost | Polished publishing experience, built-in membership/subscription system, managed hosting (Ghost Pro) |
| Strapi | Mature headless API, content type builder UI, extensive marketplace |
| Payload CMS | TypeScript-native, strong access control system, modern DX |
| Directus | Database-first approach, connects to existing databases, excellent data modeling |

---

## 4. Unique Selling Points (USPs)

### USP 1: Rust Performance Without Rust Complexity

RustPress gives content teams the performance benefits of Rust (sub-100ms APIs, 5K req/s, < 50MB idle memory) without requiring them to write or understand Rust. The admin UI is React/TypeScript. Plugins can be written in familiar patterns. Only the engine is Rust.

**Evidence claims:**
- API P95 < 100ms (validated via k6 load tests)
- 5,000 req/s sustained on single instance
- Server startup in < 3 seconds
- Docker image < 100MB

### USP 2: Memory Safety as a Feature, Not a Promise

WordPress has had 4,800+ CVEs since 2004. Most PHP/Node.js CMS platforms patch security vulnerabilities monthly. RustPress eliminates entire vulnerability categories at compile time:

- Buffer overflows: impossible (Rust ownership model)
- Use-after-free: impossible (borrow checker)
- Data races: impossible (Send/Sync traits)
- SQL injection: impossible (sqlx parameterized queries)
- Null pointer dereferences: impossible (Option type)

**Evidence claims:**
- Zero CRITICAL/HIGH vulnerabilities (cargo-audit + npm audit)
- OWASP ZAP scan passes
- Argon2id password hashing (memory-hard, timing-safe)
- JWT with configurable expiry, refresh token rotation

### USP 3: WordPress-Compatible, Not WordPress-Constrained

RustPress adopts the WordPress content model and plugin hook architecture that agencies and developers already understand, but runs it on modern infrastructure:

- PostgreSQL 16 instead of MySQL 5.x
- Compile-time verified SQL instead of string concatenation
- React 18 admin UI instead of jQuery
- Docker-native instead of LAMP stack
- WXR import for WordPress content migration

### USP 4: Single-Binary, Container-Native Deployment

No PHP-FPM. No Node.js process manager. No nginx configuration dance. RustPress ships as a single compiled binary in a Docker container under 100MB. `docker-compose up` gives you a production-ready CMS with PostgreSQL and Redis in under 5 minutes.

---

## 5. Target Segments and Messaging

### Segment 1: Self-Hosting Developers

**Profile**: Full-stack or backend developers who self-host their personal sites, blogs, or side projects. They value performance, security, and modern tooling. They are comfortable with Docker and the command line.

**Pain points**: WordPress feels bloated and outdated. Ghost is limited. Headless CMS platforms require building a frontend from scratch.

**Key message**: "A CMS that respects your server resources and your intelligence. Rust performance, React admin, Docker deployment. No PHP required."

**Channels**: Hacker News, Reddit (r/rust, r/selfhosted, r/webdev), Dev.to, personal tech blogs, Rust community forums.

---

### Segment 2: WordPress Agencies

**Profile**: Digital agencies managing 10-100+ client WordPress sites. They deal with constant security patches, plugin conflicts, performance optimization, and scaling challenges. They bill by the hour and want to reduce maintenance overhead.

**Pain points**: Security patch treadmill. Plugin conflicts after updates. Performance optimization is a billable service, not a default. Client sites crash under traffic spikes.

**Key message**: "Cut your maintenance burden by 80%. RustPress gives your clients WordPress-level content management on infrastructure that doesn't need babysitting. Fewer security patches. Fewer scaling emergencies. More time for billable work."

**Channels**: WordPress community events (WordCamp), agency-focused publications, LinkedIn, web development podcasts, case studies with performance benchmarks.

---

### Segment 3: DevOps / Platform Engineers

**Profile**: Engineers responsible for running content infrastructure at scale. They care about container density, health probes, metrics, horizontal scaling, and resource efficiency. They evaluate CMS platforms as infrastructure components, not creative tools.

**Pain points**: WordPress doesn't scale horizontally without significant custom work. PHP-FPM tuning is a dark art. No native Prometheus metrics. No Kubernetes-ready health probes.

**Key message**: "A CMS built like infrastructure software. Kubernetes-ready health probes, Prometheus metrics, < 50MB idle memory, horizontal scaling out of the box. Run 10x more sites per server."

**Channels**: DevOps conferences, Kubernetes community, CNCF ecosystem, infrastructure-focused blogs, Reddit (r/devops, r/kubernetes), cloud provider marketplaces.

---

### Segment 4: Content Creators Moving Away from WordPress

**Profile**: Bloggers, writers, and content creators who use WordPress but are frustrated by slow dashboards, plugin bloat, and security anxiety. They are moderately technical (can follow Docker instructions) or use managed hosting.

**Pain points**: The WordPress admin dashboard is slow. Media uploads timeout. Updates break things. Security plugins add more bloat to solve bloat.

**Key message**: "Everything you love about WordPress content management, none of the things you hate. Faster dashboard. Reliable media uploads. No security anxiety. Your content, accelerated."

**Channels**: Content creator communities, blogging podcasts, Medium, Substack alternatives discussions, Product Hunt.

---

### Segment 5: Rust Ecosystem Enthusiasts

**Profile**: Developers who use Rust professionally or as a passion language. They want to see Rust succeed in web application territory traditionally dominated by PHP, Node.js, and Python. They will contribute to open source projects that advance Rust's ecosystem.

**Pain points**: Rust lacks a production-grade CMS. Most Rust web projects are frameworks, not applications. They want to contribute to something tangible.

**Key message**: "The largest open-source Rust web application you can actually use. 19 crates, 7 plugins, production-grade architecture. Help us prove Rust belongs on the web."

**Channels**: Rust community (users.rust-lang.org, r/rust, Rust Discord), This Week in Rust newsletter, RustConf, Rust meetups, crates.io visibility.

---

## 6. Positioning Statement (Internal)

RustPress positions itself in the CMS market as the **performance and security leader** for teams that have outgrown WordPress but don't want to give up the full-featured CMS experience for a headless API.

We do NOT compete on:
- Ecosystem size (WordPress wins here and will for years)
- Non-technical user friendliness (WordPress and Ghost win here)
- Headless API flexibility (Strapi, Payload, Directus win here)

We DO compete on:
- Raw performance (10-40x faster than WordPress)
- Security posture (compile-time safety vs. runtime patching)
- Operational efficiency (< 50MB RAM, single binary, Docker-native)
- Modern developer experience (Rust + React + TypeScript + PostgreSQL)
- WordPress migration path (WXR import, familiar content model)
