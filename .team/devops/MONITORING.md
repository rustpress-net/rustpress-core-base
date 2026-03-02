# Monitoring & Observability Plan -- RustPress CMS

> Wave 2 DevOps Research & Planning Artifact
> Date: 2026-03-02
> Author: DevOps Engineer (DEVOPS)
> Status: RESEARCH COMPLETE -- Ready for implementation review

---

## 1. Current Observability Assessment

### 1.1 What Already Exists (Evidence from Source Code)

#### Prometheus Metrics (`crates/rustpress-server/src/metrics.rs`)

A comprehensive `Metrics` struct is already implemented using `prometheus-client 0.22`. It registers the following metric families:

| Metric Name | Type | Labels | Description |
|-------------|------|--------|-------------|
| `http_requests_total` | Counter | method, path, status | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, path, status | Request latency (exponential buckets: 1ms to 65s) |
| `http_connections_active` | Gauge | -- | Active HTTP connections |
| `db_queries_total` | Counter | operation, table | Total database queries |
| `db_query_duration_seconds` | Histogram | operation, table | Query latency (exponential buckets: 0.1ms to 6.5s) |
| `db_connections_active` | Gauge | -- | Active DB connections |
| `db_pool_size` | Gauge | -- | DB connection pool size |
| `cache_operations_total` | Counter | operation (Hit/Miss/Set/Delete) | Cache operations |
| `cache_size_bytes` | Gauge | -- | Cache memory usage |
| `cache_entries` | Gauge | -- | Number of cached items |
| `jobs_total` | Counter | job_type, status | Background job counts |
| `job_duration_seconds` | Histogram | job_type, status | Job processing time |
| `jobs_queued` | Gauge | -- | Jobs waiting in queue |
| `jobs_processing` | Gauge | -- | Jobs currently executing |
| `uptime_seconds` | Gauge | -- | Server uptime |
| `memory_usage_bytes` | Gauge | -- | Process memory usage |
| `active_users` | Gauge | -- | Active user sessions |
| `total_users` | Gauge | -- | Total registered users |
| `total_posts` | Gauge | -- | Total posts |
| `total_pages` | Gauge | -- | Total pages |
| `total_media` | Gauge | -- | Total media files |

**Evidence:** The `Metrics::encode()` method produces Prometheus text format output. Path normalization replaces UUIDs and numeric IDs with `:id` placeholders (preventing high-cardinality explosions).

**Histogram bucket configuration:**
- HTTP requests: `exponential_buckets(0.001, 2.0, 16)` = 1ms, 2ms, 4ms, ... , 65.5s
- DB queries: `exponential_buckets(0.0001, 2.0, 16)` = 0.1ms, 0.2ms, ... , 6.5s
- Jobs: `exponential_buckets(0.1, 2.0, 12)` = 100ms, 200ms, ... , 409.6s

#### Health Check Endpoints (`crates/rustpress-health/`)

Full Kubernetes-compatible probe system:

| Endpoint | Type | Purpose |
|----------|------|---------|
| `/health` | Combined | Full health report (DB, Redis, external services) |
| `/health/live` | Liveness | Is the process alive? (lightweight) |
| `/health/ready` | Readiness | Can the service accept traffic? (checks DB, Redis) |
| `/health/startup` | Startup | Has initial startup completed? |
| `/health/detailed` | Deep | Full component breakdown with timings |
| `/health/db` | Component | Database connectivity specifically |
| `/health/cache` | Component | Redis/cache connectivity specifically |
| `/status` | Simple | Quick status response |
| `/version` | Info | Version information |
| `/healthz` | K8s alias | Kubernetes liveness alias |
| `/readyz` | K8s alias | Kubernetes readiness alias |
| `/livez` | K8s alias | Kubernetes liveness alias |

**Evidence:** `HealthChecker` verifies DB pool, Redis connection, and external services. Results are cached for 5 seconds (configurable). The `HealthCheckerBuilder` pattern allows adding custom health checks.

#### Profiling System (`crates/rustpress-performance/src/profiling.rs`)

A request profiling system exists with:
- Request timing with span-based breakdown
- Database query tracing per request
- Memory snapshots
- Percentile calculation (P50, P95, P99)
- Slow request detection (threshold: 500ms)
- Flame graph generation from traces
- Prometheus-compatible metrics output
- Server-Timing header generation

**Evidence:** `ProfilingEndpoints` struct provides `/metrics` (Prometheus format), `/traces`, `/slow-traces`, and `/flamegraph` endpoints.

#### Structured Logging (`crates/rustpress-server/src/main.rs`)

```rust
tracing_subscriber::registry()
    .with(tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "rustpress=info,tower_http=info,sqlx=warn".into()))
    .with(tracing_subscriber::fmt::layer())
    .init();
```

- Uses `tracing` + `tracing-subscriber`
- Environment-based log level control via `RUST_LOG`
- Default: `rustpress=info, tower_http=info, sqlx=warn`
- `tracing-appender 0.2` is in workspace deps (for file-based logging) but not confirmed as wired in

#### Configuration for Metrics Port

From `deploy/config/default.toml`:
```toml
[server]
metrics_port = 9090
```

A separate metrics port (9090) is configured, suggesting the intent to serve `/metrics` on a separate port from the application (security best practice -- metrics should not be publicly exposed).

### 1.2 What is Missing

| Gap | Impact | Priority |
|-----|--------|----------|
| No Prometheus scrape target configured | Metrics exist but nothing collects them | HIGH |
| No Grafana dashboards | Metrics are raw text; no visualization | HIGH |
| No alerting rules | Failures go undetected | HIGH |
| No log aggregation | Logs are in container stdout only; lost on restart | MEDIUM |
| No distributed tracing (Jaeger/Zipkin) | Cannot trace requests across services | LOW (single-service) |
| No error tracking (Sentry) | No proactive error notification | MEDIUM |
| JSON logging not enabled by default | `format = "json"` in config but `fmt::layer()` in code is default (human-readable) | LOW |
| Metrics port separation not implemented | Config says 9090 but not confirmed in routes | MEDIUM |

---

## 2. Proposed Monitoring Stack

### 2.1 Architecture

```
  +-------------------+
  |  RustPress App    |
  |  :8080 (app)      |----> stdout/stderr ---> Docker JSON logs
  |  :9090 (/metrics) |                              |
  +--------+----------+                              |
           |                                         |
     Prometheus scrape                               |
           |                                    (optional)
  +--------v----------+                    +---------v--------+
  |   Prometheus       |                   |   Loki           |
  |   :9090            |                   |   :3100          |
  |   (time-series DB) |                   |   (log aggregator)|
  +--------+-----------+                   +---------+---------+
           |                                         |
  +--------v-----------------------------------------v--------+
  |                    Grafana :3000                            |
  |   - Prometheus data source (metrics)                       |
  |   - Loki data source (logs)                                |
  |   - Pre-built dashboards                                   |
  |   - Alert rules + notification channels                    |
  +-----------------------------------------------------------+
```

### 2.2 Monitoring docker-compose Overlay

```yaml
# docker-compose.monitoring.yml
# Usage: docker compose -f docker-compose.production.yml -f docker-compose.monitoring.yml up -d

version: '3.8'

services:
  # ============================================================
  # Prometheus -- Metrics Collection
  # ============================================================
  prometheus:
    image: prom/prometheus:v2.51.0
    container_name: rustpress-prometheus
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/prometheus/rules/:/etc/prometheus/rules/:ro
      - prometheus_data:/prometheus
    ports:
      - "127.0.0.1:9091:9090"
    networks:
      - rustpress-net
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--storage.tsdb.retention.size=5GB'
      - '--web.enable-lifecycle'
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'

  # ============================================================
  # Grafana -- Visualization & Alerting
  # ============================================================
  grafana:
    image: grafana/grafana:10.4.0
    container_name: rustpress-grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning/:/etc/grafana/provisioning/:ro
      - ./monitoring/grafana/dashboards/:/var/lib/grafana/dashboards/:ro
    ports:
      - "${GRAFANA_PORT:-127.0.0.1:3000}:3000"
    environment:
      GF_SECURITY_ADMIN_USER: "${GRAFANA_USER:-admin}"
      GF_SECURITY_ADMIN_PASSWORD: "${GRAFANA_PASSWORD:-admin}"
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-piechart-panel
      GF_SERVER_ROOT_URL: "${GRAFANA_ROOT_URL:-http://localhost:3000}"
    networks:
      - rustpress-net
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  # ============================================================
  # Loki -- Log Aggregation (Lightweight Alternative to ELK)
  # ============================================================
  loki:
    image: grafana/loki:2.9.0
    container_name: rustpress-loki
    restart: unless-stopped
    volumes:
      - ./monitoring/loki/loki-config.yml:/etc/loki/local-config.yaml:ro
      - loki_data:/loki
    ports:
      - "127.0.0.1:3100:3100"
    networks:
      - rustpress-net
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  # ============================================================
  # Promtail -- Log Shipper (sends Docker logs to Loki)
  # ============================================================
  promtail:
    image: grafana/promtail:2.9.0
    container_name: rustpress-promtail
    restart: unless-stopped
    volumes:
      - ./monitoring/promtail/promtail-config.yml:/etc/promtail/config.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - rustpress-net
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.25'

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

---

## 3. Prometheus Configuration

### 3.1 Scrape Configuration

```yaml
# monitoring/prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  # RustPress application metrics
  - job_name: 'rustpress'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['rustpress-app:8080']
        labels:
          service: 'rustpress'
          environment: 'production'
    # Or if metrics are on a separate port:
    # static_configs:
    #   - targets: ['rustpress-app:9090']

  # PostgreSQL metrics (via pg_exporter if added)
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
        labels:
          service: 'postgresql'
    # Note: Requires adding postgres_exporter container (see section 3.2)

  # Redis metrics (via redis_exporter if added)
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
        labels:
          service: 'redis'
    # Note: Requires adding redis_exporter container (see section 3.2)

  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node exporter (host metrics -- optional)
  # - job_name: 'node'
  #   static_configs:
  #     - targets: ['node-exporter:9100']
```

### 3.2 Optional Exporters (Add to Monitoring Overlay)

```yaml
  # PostgreSQL Exporter
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:v0.15.0
    container_name: rustpress-pg-exporter
    restart: unless-stopped
    environment:
      DATA_SOURCE_NAME: "postgresql://${PG_USER:-rustpress}:${PG_PASSWORD}@postgres:5432/${PG_DB:-rustpress}?sslmode=disable"
    ports:
      - "127.0.0.1:9187:9187"
    networks:
      - rustpress-net

  # Redis Exporter
  redis-exporter:
    image: oliver006/redis_exporter:v1.58.0
    container_name: rustpress-redis-exporter
    restart: unless-stopped
    environment:
      REDIS_ADDR: "redis://redis:6379"
      REDIS_PASSWORD: "${REDIS_PASSWORD}"
    ports:
      - "127.0.0.1:9121:9121"
    networks:
      - rustpress-net
```

---

## 4. Key Metrics to Track

### 4.1 Application Metrics (from RustPress built-in)

| Category | Metric | Type | Alert Threshold | Dashboard Panel |
|----------|--------|------|-----------------|-----------------|
| **Request Rate** | `http_requests_total` | Counter | > 10K/min sustained (capacity) | Requests/second graph |
| **Latency P50** | `http_request_duration_seconds{quantile="0.5"}` | Histogram | > 50ms | Latency heatmap |
| **Latency P95** | `http_request_duration_seconds{quantile="0.95"}` | Histogram | > 100ms (strategy KPI) | Latency heatmap |
| **Latency P99** | `http_request_duration_seconds{quantile="0.99"}` | Histogram | > 500ms | Latency heatmap |
| **Error Rate** | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])` | Derived | > 1% | Error rate gauge |
| **4xx Rate** | `rate(http_requests_total{status=~"4.."}[5m])` | Derived | > 50/min (brute force?) | Client error graph |
| **Active Connections** | `http_connections_active` | Gauge | > 500 | Connection gauge |
| **DB Query Rate** | `rate(db_queries_total[5m])` | Counter | Informational | QPS graph |
| **DB Query P95** | `db_query_duration_seconds{quantile="0.95"}` | Histogram | > 50ms (strategy KPI) | DB latency heatmap |
| **DB Pool Active** | `db_connections_active` | Gauge | > 80% of pool_size | Pool utilization gauge |
| **DB Pool Size** | `db_pool_size` | Gauge | Informational | Pool size indicator |
| **Cache Hit Rate** | `cache_operations_total{operation="Hit"} / (cache_operations_total{operation="Hit"} + cache_operations_total{operation="Miss"})` | Derived | < 60% (cache ineffective) | Hit rate percentage |
| **Cache Size** | `cache_size_bytes` | Gauge | > 80% of max memory | Cache memory gauge |
| **Cache Entries** | `cache_entries` | Gauge | Informational | Entry count |
| **Jobs Queued** | `jobs_queued` | Gauge | > 100 (backlog) | Job queue depth |
| **Jobs Processing** | `jobs_processing` | Gauge | Informational | Active workers |
| **Uptime** | `uptime_seconds` | Gauge | < 60 (recent restart) | Uptime display |
| **Memory** | `memory_usage_bytes` | Gauge | > 256MB (strategy limit under load) | Memory graph |
| **Active Users** | `active_users` | Gauge | Informational | User count |
| **Content Counts** | `total_posts`, `total_pages`, `total_media` | Gauge | Informational | Content summary |

### 4.2 Infrastructure Metrics (from Exporters)

| Category | Metric | Source | Alert Threshold |
|----------|--------|--------|-----------------|
| **PG Connections** | `pg_stat_activity_count` | postgres-exporter | > 80% of max_connections |
| **PG Replication Lag** | `pg_replication_lag` | postgres-exporter | > 10s |
| **PG Dead Tuples** | `pg_stat_user_tables_n_dead_tup` | postgres-exporter | > 100K (needs VACUUM) |
| **PG Transaction Rate** | `pg_stat_database_xact_commit` | postgres-exporter | Informational |
| **PG Cache Hit** | `pg_stat_database_blks_hit / (blks_hit + blks_read)` | postgres-exporter | < 95% |
| **Redis Memory** | `redis_memory_used_bytes` | redis-exporter | > 80% of maxmemory |
| **Redis Evictions** | `redis_evicted_keys_total` | redis-exporter | > 0 sustained |
| **Redis Connected Clients** | `redis_connected_clients` | redis-exporter | > 100 |
| **Redis Keyspace Hit Rate** | `redis_keyspace_hits / (hits + misses)` | redis-exporter | < 80% |

---

## 5. Alerting Rules

### 5.1 Prometheus Alert Rules

```yaml
# monitoring/prometheus/rules/rustpress-alerts.yml

groups:
  - name: rustpress-application
    rules:
      # ============================================================
      # CRITICAL Alerts (PagerDuty / immediate response)
      # ============================================================

      - alert: RustPressDown
        expr: up{job="rustpress"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "RustPress is DOWN"
          description: "RustPress application has been unreachable for more than 1 minute."
          runbook: "Check container status: docker ps | grep rustpress"

      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate: {{ $value | humanizePercentage }}"
          description: "More than 5% of requests are returning 5xx errors for 5+ minutes."
          runbook: "Check application logs: docker logs rustpress-app --tail 100"

      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is DOWN"
          description: "PostgreSQL database has been unreachable for more than 1 minute."

      - alert: RedisDown
        expr: redis_up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Redis is DOWN"
          description: "Redis cache has been unreachable for more than 2 minutes. Moka fallback should be active."

      # ============================================================
      # WARNING Alerts (Slack / investigate within hours)
      # ============================================================

      - alert: HighLatencyP95
        expr: |
          histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
          > 0.1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency above 100ms: {{ $value | humanizeDuration }}"
          description: "API P95 latency exceeds the 100ms strategy target for 10+ minutes."

      - alert: HighLatencyP99
        expr: |
          histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
          > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 latency above 500ms: {{ $value | humanizeDuration }}"

      - alert: DatabasePoolExhaustion
        expr: db_connections_active / db_pool_size > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "DB connection pool at {{ $value | humanizePercentage }} capacity"
          description: "Database connection pool is over 80% utilized. Consider increasing max_connections."

      - alert: CacheHitRateLow
        expr: |
          (
            sum(rate(cache_operations_total{operation="Hit"}[15m]))
            /
            (sum(rate(cache_operations_total{operation="Hit"}[15m])) + sum(rate(cache_operations_total{operation="Miss"}[15m])))
          ) < 0.6
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate below 60%: {{ $value | humanizePercentage }}"
          description: "Low cache hit rate may indicate cache misconfiguration or changed access patterns."

      - alert: HighMemoryUsage
        expr: memory_usage_bytes > 256 * 1024 * 1024  # 256MB
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage above 256MB: {{ $value | humanizeBytes }}"
          description: "Memory usage exceeds strategy target of 256MB under load."

      - alert: JobQueueBacklog
        expr: jobs_queued > 100
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Job queue backlog: {{ $value }} jobs pending"
          description: "More than 100 jobs are waiting in the queue. Workers may be stalled."

      - alert: FrequentRestarts
        expr: changes(uptime_seconds[1h]) > 3
        for: 0m
        labels:
          severity: warning
        annotations:
          summary: "RustPress restarted {{ $value }} times in the last hour"
          description: "Frequent restarts may indicate a crash loop."

      # ============================================================
      # INFO Alerts (Dashboard notification only)
      # ============================================================

      - alert: HighRequestRate
        expr: sum(rate(http_requests_total[1m])) > 5000
        for: 5m
        labels:
          severity: info
        annotations:
          summary: "Request rate above 5K/s: {{ $value }}"

      - alert: SlowDatabaseQueries
        expr: |
          histogram_quantile(0.95, sum(rate(db_query_duration_seconds_bucket[5m])) by (le))
          > 0.05
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "DB P95 query time above 50ms"

  - name: rustpress-infrastructure
    rules:
      - alert: PostgresConnectionsHigh
        expr: pg_stat_activity_count > 160  # 80% of 200 max
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL connections at {{ $value }}/200"

      - alert: PostgresCacheHitLow
        expr: |
          pg_stat_database_blks_hit{datname="rustpress"}
          / (pg_stat_database_blks_hit{datname="rustpress"} + pg_stat_database_blks_read{datname="rustpress"})
          < 0.95
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL buffer cache hit rate below 95%"

      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory at {{ $value | humanizePercentage }}"

      - alert: RedisEvictions
        expr: rate(redis_evicted_keys_total[5m]) > 0
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "Redis is evicting keys: {{ $value }}/s"
```

### 5.2 Alerting Channels

| Channel | Severity | Tool |
|---------|----------|------|
| Email | All (critical, warning) | Grafana notification channel |
| Slack / Discord | Critical only | Grafana webhook |
| PagerDuty | Critical only (opt-in) | Grafana PagerDuty integration |
| Dashboard | All | Grafana annotations |

Grafana alerting is preferred over Prometheus Alertmanager because:
1. Single tool for visualization + alerting
2. Easier notification channel management
3. No additional container needed
4. Grafana 10.x unified alerting is mature

---

## 6. Log Aggregation Approach

### 6.1 Current State

RustPress uses `tracing` with `tracing-subscriber`. Logs go to stdout/stderr. Docker captures these as JSON files in `/var/lib/docker/containers/<id>/`.

### 6.2 Recommended Approach: Loki + Promtail

**Why Loki over ELK/OpenSearch:**
- 10x less resource usage than Elasticsearch
- Native Grafana integration (same tool for metrics + logs)
- Label-based indexing (like Prometheus, not full-text)
- Simpler to operate (single binary, no cluster needed)
- Free/OSS

**Promtail Configuration:**

```yaml
# monitoring/promtail/promtail-config.yml

server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      # Only collect from rustpress containers
      - source_labels: ['__meta_docker_container_name']
        regex: '/(rustpress-.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_name']
        regex: '/(rustpress-app)'
        target_label: 'service'
        replacement: 'rustpress'
      - source_labels: ['__meta_docker_container_name']
        regex: '/(rustpress-db)'
        target_label: 'service'
        replacement: 'postgresql'
      - source_labels: ['__meta_docker_container_name']
        regex: '/(rustpress-cache)'
        target_label: 'service'
        replacement: 'redis'
    pipeline_stages:
      # Parse JSON logs from RustPress
      - json:
          expressions:
            level: level
            message: fields.message
            target: target
            span: span.name
      - labels:
          level:
          target:
```

**Loki Configuration:**

```yaml
# monitoring/loki/loki-config.yml

auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

limits_config:
  retention_period: 30d
  max_query_length: 0h
  max_query_parallelism: 2

compactor:
  working_directory: /loki/compactor
  retention_enabled: true
```

### 6.3 Structured JSON Logging

To enable JSON logging in RustPress, the tracing subscriber should use the JSON formatter:

```rust
// Proposed change to init_tracing() in main.rs
fn init_tracing() {
    let json_enabled = std::env::var("RUST_LOG_FORMAT")
        .map(|v| v == "json")
        .unwrap_or(false);

    let registry = tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "rustpress=info,tower_http=info,sqlx=warn".into()));

    if json_enabled {
        registry
            .with(tracing_subscriber::fmt::layer().json())
            .init();
    } else {
        registry
            .with(tracing_subscriber::fmt::layer())
            .init();
    }
}
```

Set `RUST_LOG_FORMAT=json` in production docker-compose to enable structured logs for Loki parsing.

---

## 7. Grafana Dashboard Provisioning

### 7.1 Data Source Provisioning

```yaml
# monitoring/grafana/provisioning/datasources/datasources.yml

apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false
```

### 7.2 Dashboard Provisioning

```yaml
# monitoring/grafana/provisioning/dashboards/dashboards.yml

apiVersion: 1

providers:
  - name: 'RustPress'
    orgId: 1
    folder: 'RustPress'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

### 7.3 Proposed Dashboard Panels

**Dashboard 1: RustPress Overview**

| Panel | Type | Metric/Query | Position |
|-------|------|-------------|----------|
| Uptime | Stat | `uptime_seconds` | Top-left |
| Request Rate | Graph | `rate(http_requests_total[5m])` | Top-center |
| Error Rate | Gauge | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])` | Top-right |
| Latency P50/P95/P99 | Time series | `histogram_quantile(...)` | Middle-left |
| Active Connections | Graph | `http_connections_active` | Middle-center |
| Memory Usage | Graph | `memory_usage_bytes` | Middle-right |
| Content Counts | Stat (row) | `total_posts`, `total_pages`, `total_media`, `active_users` | Bottom-left |
| Top Endpoints | Table | `topk(10, sum by (path) (rate(http_requests_total[5m])))` | Bottom-right |

**Dashboard 2: Database Performance**

| Panel | Type | Metric/Query |
|-------|------|-------------|
| Query Rate | Graph | `rate(db_queries_total[5m])` |
| Query Latency Heatmap | Heatmap | `db_query_duration_seconds_bucket` |
| Connection Pool | Gauge | `db_connections_active / db_pool_size * 100` |
| Slow Queries | Stat | `rate(db_queries_total{duration > 0.05}[5m])` |
| Top Queries by Table | Table | `topk(10, sum by (table) (rate(db_queries_total[5m])))` |

**Dashboard 3: Cache Performance**

| Panel | Type | Metric/Query |
|-------|------|-------------|
| Hit Rate | Gauge | `cache hit / (hit + miss) * 100` |
| Operations/s | Graph | `rate(cache_operations_total[5m])` by operation |
| Cache Size | Graph | `cache_size_bytes` |
| Cache Entries | Graph | `cache_entries` |
| Redis Memory | Graph | `redis_memory_used_bytes` |

**Dashboard 4: Background Jobs**

| Panel | Type | Metric/Query |
|-------|------|-------------|
| Queue Depth | Graph | `jobs_queued` |
| Processing | Graph | `jobs_processing` |
| Throughput | Graph | `rate(jobs_total{status="Completed"}[5m])` |
| Failure Rate | Gauge | `rate(jobs_total{status="Failed"}[5m]) / rate(jobs_total[5m])` |
| Job Duration P95 | Graph | `histogram_quantile(0.95, ...)` |

---

## 8. Monitoring File Structure

```
monitoring/
  prometheus/
    prometheus.yml                  # Scrape configuration
    rules/
      rustpress-alerts.yml          # Application alerting rules
      infrastructure-alerts.yml     # Infrastructure alerting rules
  grafana/
    provisioning/
      datasources/
        datasources.yml             # Prometheus + Loki data sources
      dashboards/
        dashboards.yml              # Dashboard auto-provisioning config
    dashboards/
      overview.json                 # RustPress Overview dashboard
      database.json                 # Database Performance dashboard
      cache.json                    # Cache Performance dashboard
      jobs.json                     # Background Jobs dashboard
      logs.json                     # Log Explorer dashboard
  loki/
    loki-config.yml                 # Loki storage and retention config
  promtail/
    promtail-config.yml             # Log collection config
```

---

## 9. Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| P0 | Verify `/metrics` endpoint serves Prometheus format | Low | Confirms existing implementation works |
| P0 | Create `docker-compose.monitoring.yml` with Prometheus + Grafana | Medium | Core observability |
| P0 | Create Prometheus scrape config for RustPress | Low | Metric collection |
| P0 | Create basic alerting rules (app down, high error rate, high latency) | Medium | Incident detection |
| P1 | Create overview Grafana dashboard | Medium | Visualization |
| P1 | Enable JSON structured logging | Low | Log parseability |
| P1 | Add Loki + Promtail for log aggregation | Medium | Log centralization |
| P1 | Create database + cache Grafana dashboards | Medium | Deep visibility |
| P2 | Add postgres-exporter and redis-exporter | Low | Infrastructure metrics |
| P2 | Create background jobs dashboard | Low | Job visibility |
| P2 | Configure Grafana alerting notifications (email/Slack) | Low | Alert delivery |
| P3 | Evaluate Sentry integration for error tracking | Low | Proactive error detection |
| P3 | Add node-exporter for host metrics | Low | Host visibility |
| P3 | Implement distributed tracing (OpenTelemetry) | High | Cross-service tracing (not needed for single-service) |

---

## 10. Resource Budget

| Service | Memory Limit | CPU Limit | Disk (30d retention) |
|---------|-------------|-----------|---------------------|
| Prometheus | 512MB | 1.0 | ~2-5GB |
| Grafana | 256MB | 0.5 | ~100MB |
| Loki | 256MB | 0.5 | ~1-3GB |
| Promtail | 128MB | 0.25 | ~10MB |
| postgres-exporter | 64MB | 0.1 | -- |
| redis-exporter | 64MB | 0.1 | -- |
| **Total monitoring** | **~1.3GB** | **~2.5 cores** | **~5-10GB** |

This is acceptable for a production server. For minimal setups (1 vCPU / 512MB target), the monitoring stack should be deployed on a separate host or disabled entirely -- the RustPress `/metrics` endpoint can be scraped by external Prometheus.

---

## 11. Relationship to Strategy KPIs

| Strategy KPI | Metric | Alert Rule |
|-------------|--------|------------|
| API P95 < 100ms | `histogram_quantile(0.95, http_request_duration_seconds_bucket)` | `HighLatencyP95` |
| 5,000 req/s throughput | `sum(rate(http_requests_total[1m]))` | `HighRequestRate` (info) |
| Memory idle < 50MB | `memory_usage_bytes` | Custom rule |
| Memory load < 256MB | `memory_usage_bytes` | `HighMemoryUsage` |
| DB query P95 < 50ms | `histogram_quantile(0.95, db_query_duration_seconds_bucket)` | `SlowDatabaseQueries` |
| Uptime 99.9% | `avg_over_time(up{job="rustpress"}[30d])` | `RustPressDown` |
| Docker image < 100MB | CI check (not runtime metric) | N/A |
| Server startup < 3s | `uptime_seconds` after restart | `FrequentRestarts` |
