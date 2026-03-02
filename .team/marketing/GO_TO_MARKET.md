# RustPress CMS — Go-To-Market Strategy

> **Document Owner**: MKT (Marketing Strategist)
> **Created**: 2026-03-02
> **Status**: Active

---

## 1. Launch Phases

### Phase 1: Pre-Launch — Developer Preview (Weeks 1-4 after v1.0.0-rc1)

**Goal**: Build credibility with technical early adopters before the public launch.

| Action | Owner | Timeline | Success Metric |
|--------|-------|----------|----------------|
| Tag `v1.0.0-rc1` and publish Docker image to ghcr.io | RM | Day 1 | Image available, pulls > 0 |
| Post "Building a WordPress Alternative in Rust" on personal blog / Dev.to | MKT | Week 1 | > 500 reads |
| Submit to "This Week in Rust" newsletter | MKT | Week 1 | Inclusion in newsletter |
| Share in Rust Discord (#showcase) and r/rust | MKT | Week 1 | > 50 upvotes |
| Invite 20-30 Rust developers for private beta testing | PM | Week 1-2 | 15+ active testers |
| Create GitHub Discussions board (categories: General, Plugins, Themes, Bugs, Feature Requests) | DEVOPS | Week 1 | Board live |
| Collect beta feedback, triage into GitHub Issues | QA | Weeks 2-4 | > 30 issues filed and triaged |
| Fix critical beta feedback, tag `v1.0.0-rc2` | BE + FE | Week 3-4 | Zero P0 regressions |
| Publish benchmark results (RustPress vs WordPress on same hardware) | QA | Week 2 | Benchmark post drafted |

**Beta Program Structure:**
- Private GitHub repo access (or early Docker image access)
- Dedicated Discord channel (#beta-testers)
- Weekly feedback form (Google Form or GitHub Discussion thread)
- Beta testers credited in CHANGELOG.md and README.md
- Selection criteria: active in Rust or CMS communities, willing to file detailed bug reports

---

### Phase 2: Public Launch — v1.0.0 (Week 5)

**Goal**: Maximum visibility across developer communities in a 72-hour window.

**Launch Day Sequence (staggered for maximum reach):**

| Time | Action | Platform | Target |
|------|--------|----------|--------|
| Day 1, 08:00 UTC | Tag v1.0.0, push Docker image | GitHub + ghcr.io | Release artifact live |
| Day 1, 09:00 UTC | Publish "Show HN: RustPress — A WordPress Alternative Built in Rust" | Hacker News | Front page (aim for > 200 points) |
| Day 1, 10:00 UTC | Post to r/rust with technical deep-dive | Reddit | > 100 upvotes |
| Day 1, 12:00 UTC | Post to r/webdev with benchmark comparison | Reddit | > 50 upvotes |
| Day 1, 14:00 UTC | Post to r/selfhosted with deployment guide | Reddit | > 50 upvotes |
| Day 1, 16:00 UTC | Publish launch blog post on Dev.to | Dev.to | > 1,000 reads in 48h |
| Day 2, 08:00 UTC | Submit to Product Hunt | Product Hunt | Top 5 of the day |
| Day 2, 12:00 UTC | Share on LinkedIn with agency-focused messaging | LinkedIn | > 50 reactions |
| Day 2, 14:00 UTC | Post to r/WordPress with migration story | Reddit | Respectful positioning |
| Day 3 | Respond to all comments, questions, and issues | All platforms | < 2 hour response time |

**Hacker News Post Guidelines:**
- Title: "Show HN: RustPress -- WordPress alternative in Rust (5K req/s, < 50MB RAM)"
- Lead with performance numbers (concrete, measurable)
- Be honest about what is and isn't ready (ecosystem size, v1.0 limitations)
- Answer every technical question in comments
- Do NOT trash WordPress -- position as "standing on the shoulders of"

---

### Phase 3: Post-Launch Growth (Weeks 6-12)

**Goal**: Sustain momentum, grow contributor base, begin building ecosystem.

| Action | Timeline | Success Metric |
|--------|----------|----------------|
| Publish weekly "Building RustPress" dev blog series | Ongoing | 4+ posts published |
| First community plugin accepted | Week 8 | 1+ third-party plugin |
| First community theme accepted | Week 10 | 1+ third-party theme |
| Reach 1,000 GitHub stars (combined repos) | Week 8 | Star count |
| Reach 100 Discord members | Week 6 | Member count |
| First external blog post / review by someone outside the team | Week 7 | 1+ external mention |
| Monthly release cadence established (v1.1, v1.2) | Ongoing | Releases on schedule |

---

## 2. Content Strategy

### Blog Posts (ordered by priority)

| # | Title | Audience | Goal | Publish |
|---|-------|----------|------|---------|
| 1 | "Why We Built a WordPress Alternative in Rust" | General dev | Origin story, motivation, vision | Launch day |
| 2 | "RustPress vs WordPress: Benchmark Results on Identical Hardware" | Performance-minded devs | Credibility through data | Launch day |
| 3 | "Migrating from WordPress to RustPress: A Step-by-Step Guide" | WordPress users | Reduce migration friction | Week 1 |
| 4 | "RustPress Architecture: 19 Crates, Zero Unsafe" | Rust devs | Technical depth, attract contributors | Week 2 |
| 5 | "Building Your First RustPress Plugin" | Plugin devs | Ecosystem growth | Week 3 |
| 6 | "RustPress Theme Development Guide" | Theme devs | Ecosystem growth | Week 4 |
| 7 | "Running RustPress on a $5/month VPS" | Self-hosters | Show resource efficiency | Week 5 |
| 8 | "How RustPress Eliminates SQL Injection at Compile Time" | Security-minded devs | Security positioning | Week 6 |
| 9 | "RustPress for Agencies: Cutting WordPress Maintenance by 80%" | Agencies | Business case | Week 7 |
| 10 | "Deploying RustPress on Kubernetes with Helm" | DevOps | Enterprise-ready positioning | Week 8 |

### Tutorial Series

1. **"Zero to Published"**: Install Docker, run `docker-compose up`, create first post, publish, view on frontend. (5 minutes, video + written)
2. **"WordPress to RustPress"**: Export WordPress WXR, import into RustPress, verify content, switch DNS. (15 minutes, written)
3. **"Plugin Development 101"**: Create a simple plugin with hooks, test it, package it. (30 minutes, written + code repo)
4. **"Theme Development 101"**: Create a theme from scratch, templates, customizer settings. (45 minutes, written + code repo)
5. **"Production Deployment"**: Docker Compose with Caddy reverse proxy, Let's Encrypt TLS, backup strategy. (20 minutes, written)

### Benchmark Content

Publish reproducible benchmarks comparing RustPress against WordPress (with and without caching plugins) on identical hardware:

| Test | Hardware | Metrics |
|------|----------|---------|
| API throughput | 2 vCPU / 4GB RAM VPS | Requests/second (k6) |
| Page load time | Same | TTFB, LCP (Lighthouse) |
| Memory usage under load | Same | RSS at idle, 100 concurrent, 1000 concurrent |
| Cold start time | Same | Time to first health check response |
| Docker image size | N/A | `docker images` output |
| Database query latency | Same | P50, P95, P99 per endpoint |

**Rules for benchmarks:**
- All tests reproducible (publish k6 scripts, Docker configs, test data)
- WordPress tested with default theme (Twenty Twenty-Four) + no plugins, then with common caching plugin (WP Super Cache)
- RustPress tested with default theme, default configuration
- Same PostgreSQL version, same server, same test data volume
- Publish raw data alongside analysis

---

## 3. Community Building

### Discord Server Structure

| Channel | Purpose |
|---------|---------|
| #announcements | Release notes, major updates (read-only) |
| #general | General discussion |
| #help | Installation and usage support |
| #development | Contributor discussion |
| #plugins | Plugin development discussion |
| #themes | Theme development discussion |
| #showcase | Community sites running RustPress |
| #feedback | Feature requests, UX feedback |
| #rust-internals | Deep technical discussion about the Rust codebase |
| #off-topic | Non-RustPress conversation |

**Moderation**: Code of conduct based on Rust community CoC. Zero tolerance for harassment. Welcoming to newcomers.

### GitHub Discussions

| Category | Purpose |
|----------|---------|
| Announcements | Official updates |
| General | Open discussion |
| Ideas | Feature proposals |
| Plugins & Themes | Ecosystem development |
| Q&A | Technical support |
| Show and Tell | Community projects |

### Contributor Growth Strategy

| Stage | Action | Target |
|-------|--------|--------|
| Week 1-4 | Label issues as "good first issue", "help wanted", "documentation" | 20+ labeled issues |
| Week 4-8 | Write CONTRIBUTING.md with clear setup instructions | Contributors can build locally in < 15 min |
| Week 8-12 | Recognize contributors in README.md and release notes | 5+ external contributors |
| Month 3-6 | Identify potential maintainers from active contributors | 2+ co-maintainers |
| Month 6-12 | Establish RFC process for significant changes | First community RFC merged |

### "Good First Issue" Categories for RustPress

- Documentation improvements (typos, clarifications, examples)
- Admin UI component tests (Vitest + React Testing Library)
- Accessibility fixes (axe-core violations)
- CLI help text improvements
- Default theme CSS refinements
- Plugin/theme template projects
- Translation files (i18n groundwork)

---

## 4. Launch Channels — Detailed Playbook

### Hacker News

- **Post type**: "Show HN"
- **Title formula**: "Show HN: RustPress -- [concise description] ([key metric])"
- **Best posting time**: Tuesday-Thursday, 08:00-10:00 UTC
- **Comment strategy**: Founder/lead responds to every top-level comment within 2 hours. Be humble, transparent about limitations, generous with technical details.
- **What works on HN**: Performance data, architecture explanations, honest "what we don't do yet" admissions
- **What fails on HN**: Marketing speak, unfounded claims, dismissing WordPress

### Reddit

| Subreddit | Subscriber Count | Angle | Post Type |
|-----------|-----------------|-------|-----------|
| r/rust | 300K+ | Technical architecture, Rust-specific design decisions | Technical deep-dive |
| r/webdev | 2M+ | CMS comparison, performance benchmarks | Benchmark + demo |
| r/selfhosted | 400K+ | Docker deployment, resource efficiency | Deployment guide |
| r/WordPress | 200K+ | Migration path, respectful alternative | Migration story |
| r/devops | 200K+ | Container-native, Prometheus metrics, health probes | Infrastructure angle |
| r/programming | 5M+ | General interest, "Rust in production" angle | Architecture overview |

### Dev.to

- Tag: #rust, #webdev, #cms, #opensource
- Series: "Building RustPress" (weekly posts)
- Cross-post benchmark and architecture articles
- Engage with comments, follow back Dev.to users who engage

### Product Hunt

- **Launch day**: Day 2 of public launch (after HN momentum)
- **Tagline**: "WordPress alternative built in Rust -- 40x faster, memory-safe"
- **First comment**: Technical founder story, link to benchmarks, honest roadmap
- **Assets needed**: Logo, 5 screenshots (dashboard, post editor, plugin management, theme switching, public frontend), optional demo GIF/video
- **Hunter**: Find a well-known Product Hunt community member to hunt the product (reach out 2 weeks before launch)

### Twitter / X

- Thread format: "We just launched RustPress -- a WordPress alternative built in Rust. Here's what we learned building a CMS in 19 Rust crates. [thread]"
- Tag: @rustlang, @axaborot (Axum), relevant Rust community accounts
- Share benchmark charts as images (visual content gets more engagement)

---

## 5. Partnership Opportunities

### Tier 1 — Rust Ecosystem (Highest Priority)

| Partner | Type | Value Exchange |
|---------|------|----------------|
| **Axum / Tokio** | Framework | RustPress as showcase application for Axum; contribute back fixes/docs |
| **sqlx** | Database library | RustPress as large-scale sqlx user; contribute real-world usage patterns |
| **This Week in Rust** | Newsletter | Feature in newsletter; contribute write-ups |
| **Rust Foundation** | Community | Showcase as production Rust web application |
| **Are We Web Yet?** | Directory | Listed as production CMS on arewewebyet.org |

### Tier 2 — Hosting Providers

| Partner | Type | Value Exchange |
|---------|------|----------------|
| **DigitalOcean** | Cloud hosting | One-click droplet / marketplace app; they get Rust CMS listing |
| **Railway** | PaaS | One-click deploy template; they get CMS users |
| **Fly.io** | Edge hosting | Fly.io deployment guide; multi-region positioning |
| **Coolify** | Self-hosting platform | RustPress template in Coolify; easy self-hosting story |
| **Hetzner** | VPS hosting | "$5/month RustPress" content collaboration |

### Tier 3 — CMS Ecosystem

| Partner | Type | Value Exchange |
|---------|------|----------------|
| **WordPress migration tool authors** | Tools | Collaborate on WXR import accuracy; cross-promotion |
| **Headless CMS comparison sites** | Media | Inclusion in CMS comparison lists with accurate data |
| **JAMstack community** | Ecosystem | RustPress as headless CMS option (API-first mode in v2) |

### Tier 4 — Conference Presence

| Event | Type | Talk Angle |
|-------|------|------------|
| **RustConf** | Conference | "Building a Production CMS in Rust: 19 Crates and What We Learned" |
| **EuroRust** | Conference | "Rust on the Web: Performance Lessons from RustPress" |
| **FOSDEM** | Conference | Web Development devroom — open source CMS in Rust |
| **All Things Open** | Conference | "Replacing WordPress with Rust: A Performance Story" |
| **Local Rust meetups** | Meetups | 20-minute lightning talks, live demo |

---

## 6. Metrics and Milestones

### Launch Success Metrics (30 days post-launch)

| Metric | Target | Stretch |
|--------|--------|---------|
| GitHub stars (combined repos) | 1,000 | 3,000 |
| Docker image pulls | 500 | 2,000 |
| Discord members | 100 | 300 |
| GitHub Issues filed (non-spam) | 50 | 150 |
| External blog posts / reviews | 3 | 10 |
| Contributors (non-team) | 5 | 15 |
| Hacker News points | 200 | 500 |
| Product Hunt rank | Top 10 | Top 3 |

### 90-Day Growth Targets

| Metric | Target |
|--------|--------|
| GitHub stars | 3,000 |
| Docker image pulls (monthly) | 2,000 |
| Discord members | 500 |
| Active contributors | 15 |
| Community plugins | 3 |
| Community themes | 2 |
| Production deployments (self-reported) | 50 |

---

## 7. Budget

| Item | Cost | Notes |
|------|------|-------|
| Domain (rustpress.dev or similar) | ~$12/year | If not already owned |
| Discord server | $0 | Free tier sufficient |
| GitHub repos | $0 | Open source, free tier |
| Dev.to / blog hosting | $0 | Free platforms |
| Product Hunt launch | $0 | Free submission |
| Docker Hub / ghcr.io | $0 | Open source, free tier |
| Conference travel (if applicable) | TBD | Only if invited/sponsored |
| **Total (launch)** | **~$12** | Essentially free |

---

## 8. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| HN launch gets negative reception | Medium | High | Be honest about limitations, have benchmark data ready, respond to every concern respectfully |
| WordPress community hostility | Medium | Medium | Position as "standing on shoulders of", never trash WordPress, emphasize migration path not replacement |
| Early adopters find critical bugs | High | High | Have beta program first, rapid response to issues, hotfix release process ready |
| Low initial adoption | Medium | Medium | Focus on Rust community first (most receptive), build outward from there |
| Competitor launches similar product | Low | Low | Execution speed, community building, open source advantage |
| Overwhelming support requests | Medium | Medium | Good documentation, FAQ, community self-help in Discord |
