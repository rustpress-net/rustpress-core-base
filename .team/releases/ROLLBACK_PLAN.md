# RustPress CMS v1.0.0 -- Production Rollback Plan

> **Author**: Release Manager (RM)
> **Date**: 2026-03-02
> **Version**: 1.0
> **Status**: Wave 4 Release Artifact
> **Classification**: OPERATIONAL -- Must be accessible to all on-call engineers

---

## 1. Executive Summary

This document defines the rollback procedures for RustPress CMS v1.0.0 production deployments. It covers trigger conditions, step-by-step rollback procedures for all system components, data preservation strategies, communication protocols, and recovery time objectives.

**RTO Target**: 30 minutes (from rollback decision to restored service)
**RPO Target**: 5 minutes (maximum acceptable data loss window)

---

## 2. Rollback Triggers

### 2.1 Automatic Rollback Triggers

These conditions should trigger an immediate, automated rollback if automated deployment monitoring is in place:

| Trigger | Threshold | Detection Method | Response Time |
|---------|-----------|------------------|---------------|
| Health check failure | `/health/ready` returns non-200 for > 3 consecutive checks (90s) | Docker HEALTHCHECK / Kubernetes probe | Automatic (< 2 min) |
| Error rate spike | HTTP 5xx rate > 10% of total requests for > 5 minutes | Prometheus alerting (or log-based if BUG-012 unresolved) | Automatic (< 6 min) |
| Database connection failure | Connection pool exhausted or all connections fail | Application logs + health endpoint | Automatic (< 2 min) |
| Memory leak detected | RSS memory > 512MB (2x limit) sustained for > 10 minutes | Prometheus / `docker stats` | Automatic (< 11 min) |

### 2.2 Manual Rollback Triggers

These conditions require human judgment and should trigger a manual rollback decision:

| Trigger | Detection | Decision Maker |
|---------|-----------|----------------|
| Authentication completely broken -- users cannot log in | User reports + monitoring | On-call engineer |
| Data corruption detected -- posts/pages returning wrong content | User reports + database audit | On-call engineer + DB admin |
| Security vulnerability actively exploited | WAF alerts, unusual traffic patterns, audit log anomalies | Security team lead |
| API contract broken -- frontend cannot communicate with backend | Error monitoring, client-side error reports | On-call engineer |
| Migration failure -- server started but some features return SQL errors | Application error logs (table/column not found errors) | On-call engineer |
| Performance degradation > 5x baseline | P95 latency > 500ms sustained for > 15 minutes | On-call engineer |
| Critical business impact | User/stakeholder escalation | Release Manager / Team Lead |

### 2.3 Do NOT Rollback For

These conditions should be investigated and fixed forward, not rolled back:

- Individual user account issues (password reset, permission problems)
- Single slow API endpoint (investigate query, add caching)
- Cosmetic UI issues (CSS, layout, non-blocking visual bugs)
- Log warnings that do not affect functionality
- Third-party service degradation (SMTP, OAuth providers, CDN)

---

## 3. Pre-Rollback Checklist

Before initiating any rollback, complete these steps:

| # | Step | Purpose | Time |
|---|------|---------|------|
| 1 | **Notify the team** -- send message to `#incident` channel | Ensure awareness, prevent conflicting changes | 1 min |
| 2 | **Capture current state** -- screenshot dashboards, save recent logs | Preserve evidence for post-mortem | 2 min |
| 3 | **Verify rollback target** -- confirm the previous known-good version | Prevent rolling back to another broken version | 1 min |
| 4 | **Confirm database compatibility** -- check if v1.0.0 migrations can be reversed | Determine if DB rollback is needed or data-compatible | 2 min |
| 5 | **Start incident timer** -- record rollback start time | Track RTO compliance | 0 min |

**Total pre-rollback time: ~6 minutes**

---

## 4. Rollback Procedures

### 4.1 Docker Container Rollback (Primary Method)

This is the fastest rollback method. Use when the application code is the problem but the database schema is compatible with the previous version.

```bash
# Step 1: Record current state
docker ps --filter "name=rustpress" --format "{{.Image}} {{.Status}}" > /tmp/rollback_before.txt
date -u >> /tmp/rollback_before.txt

# Step 2: Pull the previous known-good image
docker pull ghcr.io/rustpress/rustpress:v0.4.0

# Step 3: Stop the current container
docker-compose down

# Step 4: Update docker-compose.yml to previous version
# Change: image: ghcr.io/rustpress/rustpress:v1.0.0
# To:     image: ghcr.io/rustpress/rustpress:v0.4.0
sed -i 's|ghcr.io/rustpress/rustpress:v1.0.0|ghcr.io/rustpress/rustpress:v0.4.0|g' docker-compose.yml

# Step 5: Start with previous version
docker-compose up -d

# Step 6: Verify health
for i in 1 2 3 4 5; do
  sleep 5
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health/ready)
  echo "Health check $i: HTTP $HTTP_CODE"
  if [ "$HTTP_CODE" = "200" ]; then
    echo "ROLLBACK SUCCESS: Service is healthy"
    break
  fi
done

# Step 7: Record result
docker ps --filter "name=rustpress" --format "{{.Image}} {{.Status}}" > /tmp/rollback_after.txt
date -u >> /tmp/rollback_after.txt
```

**Estimated time: 5-10 minutes**

**Volume considerations:**
- PostgreSQL data volume (`rustpress-db-data`): Preserved across container restarts. Do NOT remove this volume.
- Redis data volume (`rustpress-redis-data`): Preserved. Session data may be stale but will be regenerated.
- Media uploads volume (`rustpress-uploads`): Preserved. File paths should be compatible between versions.
- Configuration volume: Ensure environment variables are compatible with v0.4.0 (v1.0.0 added new required variables that v0.4.0 does not recognize -- these will be ignored).

### 4.2 Database Rollback

Required when v1.0.0 database migrations are incompatible with v0.4.0 application code, or when data corruption is detected.

**IMPORTANT**: Database rollback involves data risk. Always backup before proceeding.

```bash
# Step 1: Stop the application to prevent further writes
docker-compose stop rustpress

# Step 2: Create a point-in-time backup of the CURRENT (v1.0.0) database
docker exec rustpress-db pg_dump -U rustpress -d rustpress -F c -f /tmp/rustpress_v100_rollback_backup.dump
docker cp rustpress-db:/tmp/rustpress_v100_rollback_backup.dump ./backups/

# Step 3: Run DOWN migrations (when available)
# Note: As of QA report (BUG-027), DOWN migrations do not exist.
# If DOWN migrations have been implemented since then:
docker exec rustpress rustpress-migrate down --to 00002

# Step 4: If DOWN migrations are NOT available, restore from pre-upgrade backup
docker exec -i rustpress-db pg_restore \
  -U rustpress \
  -d rustpress \
  --clean \
  --if-exists \
  -F c < ./backups/rustpress_v040_pre_upgrade.dump

# Step 5: Verify database state
docker exec rustpress-db psql -U rustpress -d rustpress -c "SELECT version FROM _refinery_schema_history ORDER BY version DESC LIMIT 1;"

# Step 6: Start the v0.4.0 application
docker-compose up -d
```

**Migration rollback specifics (v1.0.0 -> v0.4.0):**

| Migration | UP Action | DOWN Action (Required) | Data Risk |
|-----------|-----------|----------------------|-----------|
| 00030 | Recreate `media_folders` with new schema | Restore original `media_folders` schema | **HIGH** -- folder data recreated in new format |
| 00029 | (Various schema additions) | Drop added columns/tables | LOW -- additive changes |
| 00028 | (Various schema additions) | Drop added columns/tables | LOW -- additive changes |
| 00027 | (Various schema additions) | Drop added columns/tables | LOW -- additive changes |
| 00026 | (Various schema additions) | Drop added columns/tables | LOW -- additive changes |
| 00025 | (Various schema additions) | Drop added columns/tables | LOW -- additive changes |
| 00024 | Create `media_folders`, add FK | Drop `media_folders`, remove FK | MEDIUM -- folder data lost |
| 00023 | Create additional CMS tables | Drop additional tables | MEDIUM -- data in those tables lost |
| 00002 | Additional schema setup | Reverse schema changes | LOW |
| 00001 | Initial schema | DROP ALL TABLES | **CRITICAL** -- total data loss |

**Data at risk during database rollback:**
- Content created after v1.0.0 upgrade (posts, pages, comments created during v1.0.0 operation)
- Media uploaded and organized in new folder structure
- Widget configurations (if `widget_areas` table was newly created)
- Backup schedules and backup records
- Any v1.0.0-specific settings

### 4.3 Full System Rollback (Nuclear Option)

Use only when both application and database are irrecoverably broken.

```bash
# Step 1: Stop everything
docker-compose down

# Step 2: Remove all volumes (THIS DESTROYS ALL DATA)
# Only do this if you have a verified backup
docker volume rm rustpress-db-data rustpress-redis-data

# Step 3: Restore from pre-upgrade backup
docker-compose up -d postgres redis
sleep 10  # Wait for services to be ready

# Step 4: Restore database from pre-upgrade backup
docker exec -i rustpress-db psql -U rustpress -d rustpress < ./backups/rustpress_v040_full_backup.sql

# Step 5: Restore media uploads
docker cp ./backups/uploads/ rustpress:/app/uploads/

# Step 6: Switch to v0.4.0 image and start
sed -i 's|ghcr.io/rustpress/rustpress:v1.0.0|ghcr.io/rustpress/rustpress:v0.4.0|g' docker-compose.yml
docker-compose up -d

# Step 7: Verify complete system
curl http://localhost:8080/health/ready
curl http://localhost:8080/api/v1/posts  # Verify content exists
```

**Estimated time: 15-30 minutes depending on database size**

### 4.4 Binary Deployment Rollback

For non-Docker deployments where RustPress runs as a native binary:

```bash
# Step 1: Stop the running service
sudo systemctl stop rustpress

# Step 2: Swap the binary
sudo mv /usr/local/bin/rustpress /usr/local/bin/rustpress.v100.bak
sudo mv /usr/local/bin/rustpress.v040.bak /usr/local/bin/rustpress

# Step 3: Rollback database if needed (see Section 4.2)

# Step 4: Start the service
sudo systemctl start rustpress

# Step 5: Verify
sudo systemctl status rustpress
curl http://localhost:8080/health/ready
```

---

## 5. Data Preservation During Rollback

### 5.1 Data That MUST Be Preserved

| Data Type | Location | Preservation Method |
|-----------|----------|-------------------|
| PostgreSQL database | Docker volume `rustpress-db-data` | pg_dump before rollback |
| Media uploads | Docker volume / `/app/uploads/` | tar backup before rollback |
| Configuration files | `config/rustpress.toml`, `.env` | File copy before rollback |
| SSL certificates | Reverse proxy configuration | Not affected by rollback |
| Redis session data | Docker volume `rustpress-redis-data` | Accept loss -- users re-login |

### 5.2 Data That May Be Lost (Acceptable)

| Data Type | Impact | Recovery Method |
|-----------|--------|----------------|
| Redis cache entries | Temporary performance degradation | Auto-rebuilt from database |
| Active user sessions | Users must re-login | Automatic on next request |
| In-memory rate limit counters | Rate limits reset | Counters rebuild within window |
| In-memory security audit log | Forensic data lost | Check structured log files |
| Background job queue (in-memory) | Pending jobs lost | Jobs re-queued on next trigger |

### 5.3 Backup Strategy

**Pre-upgrade backup procedure** (MUST be completed before any v1.0.0 deployment):

```bash
#!/bin/bash
# pre-upgrade-backup.sh
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)_pre_v100"
mkdir -p "$BACKUP_DIR"

# Database full backup
docker exec rustpress-db pg_dump -U rustpress -d rustpress -F c -f /tmp/backup.dump
docker cp rustpress-db:/tmp/backup.dump "$BACKUP_DIR/database.dump"

# Database schema-only backup (for structure comparison)
docker exec rustpress-db pg_dump -U rustpress -d rustpress --schema-only -f /tmp/schema.sql
docker cp rustpress-db:/tmp/schema.sql "$BACKUP_DIR/schema.sql"

# Media uploads
docker cp rustpress:/app/uploads "$BACKUP_DIR/uploads"

# Configuration
cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml"
cp .env "$BACKUP_DIR/.env" 2>/dev/null
cp config/rustpress.toml "$BACKUP_DIR/rustpress.toml" 2>/dev/null

# Record versions
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep rustpress > "$BACKUP_DIR/images.txt"
docker exec rustpress-db psql -U rustpress -d rustpress -c "SELECT * FROM _refinery_schema_history;" > "$BACKUP_DIR/migration_history.txt"

echo "Backup complete: $BACKUP_DIR"
echo "Verify backup integrity before proceeding with upgrade."
```

---

## 6. Communication Plan During Incident

### 6.1 Notification Timeline

| Time | Action | Channel | Audience |
|------|--------|---------|----------|
| T+0 min | Incident detected -- initial alert | PagerDuty / alerting system | On-call engineer |
| T+2 min | Incident acknowledged -- investigation started | `#incident` Slack/Discord channel | Engineering team |
| T+5 min | Rollback decision made (if criteria met) | `#incident` channel | Engineering team + Team Lead |
| T+6 min | Status page updated -- "Investigating" | Public status page | All users |
| T+10 min | Rollback initiated -- progress updates every 5 min | `#incident` channel | Engineering team |
| T+15 min | Status page updated -- "Identified, fix in progress" | Public status page | All users |
| T+30 min | Rollback complete or escalation | `#incident` channel | Engineering team + management |
| T+31 min | Status page updated -- "Resolved" or "Monitoring" | Public status page | All users |
| T+60 min | Initial incident summary posted | `#incident` channel | Engineering team |
| T+24 hrs | Post-mortem document started | Internal wiki / `.team/postmortems/` | Engineering team |
| T+72 hrs | Post-mortem review meeting | Video call | All involved parties |

### 6.2 Communication Templates

**Status Page -- Investigating:**
```
RustPress CMS -- Service Degradation

We are currently investigating reports of [brief description].
Our team has been alerted and is working to identify the cause.

We will provide updates every 15 minutes.

Started: [timestamp UTC]
```

**Status Page -- Identified:**
```
RustPress CMS -- Service Degradation (Identified)

We have identified the issue as [brief description].
We are rolling back to the previous stable version (v0.4.0) to restore service.

Expected resolution: [estimated time]

Started: [timestamp UTC]
Last updated: [timestamp UTC]
```

**Status Page -- Resolved:**
```
RustPress CMS -- Service Restored

The issue has been resolved. The service has been rolled back to v0.4.0
while we investigate the root cause of the v1.0.0 upgrade issue.

We will schedule a maintenance window for a re-deployment attempt
once the issue is resolved and thoroughly tested.

Duration: [total downtime]
Started: [timestamp UTC]
Resolved: [timestamp UTC]
```

### 6.3 Escalation Matrix

| Severity | Response Time | Escalation Path |
|----------|-------------|-----------------|
| SEV-1 (Complete outage) | Immediate | On-call -> Team Lead -> CTO (if > 30 min) |
| SEV-2 (Major feature broken) | < 15 min | On-call -> Team Lead |
| SEV-3 (Minor degradation) | < 1 hour | On-call (self-resolve, notify team) |
| SEV-4 (Cosmetic/non-urgent) | Next business day | Ticket created, no rollback needed |

---

## 7. RTO/RPO Targets and Validation

### 7.1 Recovery Time Objective (RTO): 30 Minutes

| Phase | Target Duration | Cumulative |
|-------|----------------|------------|
| Detection + alerting | 5 min | 5 min |
| Pre-rollback checklist | 6 min | 11 min |
| Container rollback (Section 4.1) | 10 min | 21 min |
| Health verification | 5 min | 26 min |
| Status page update + communication | 4 min | 30 min |

**Note**: Database rollback (Section 4.2) adds 15-30 minutes. If DB rollback is required, RTO extends to 45-60 minutes.

### 7.2 Recovery Point Objective (RPO): 5 Minutes

| Component | RPO Mechanism | Actual RPO |
|-----------|--------------|------------|
| PostgreSQL data | WAL archiving (continuous) | < 1 min (if WAL configured) |
| PostgreSQL data | pg_dump backup (scheduled) | Last backup interval (configure to 5 min for critical data) |
| Media uploads | File system (persisted on write) | 0 min (immediately durable) |
| Redis cache | Reconstructed from DB | 0 min (cache is disposable) |
| User sessions | Lost on rollback | Full loss (users re-login) |

### 7.3 Rollback Drill Schedule

Rollback procedures should be tested before production deployment:

| Drill | Frequency | Environment | Validates |
|-------|-----------|-------------|-----------|
| Container swap drill | Before every major release | Staging | Section 4.1 procedure |
| Database restore drill | Quarterly | Staging | Section 4.2 procedure + backup integrity |
| Full system restore drill | Semi-annually | Staging | Section 4.3 procedure |
| Communication drill | Before every major release | All channels | Section 6 notification flow |

---

## 8. Post-Rollback Actions

After a successful rollback, the following actions are required:

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | Verify all public-facing functionality works | On-call engineer | T+30 min |
| 2 | Monitor error rates for 1 hour after rollback | On-call engineer | T+90 min |
| 3 | Update status page to "Resolved" or "Monitoring" | On-call engineer | T+35 min |
| 4 | Capture logs from the failed v1.0.0 deployment | On-call engineer | T+60 min |
| 5 | Create incident ticket with timeline and root cause hypothesis | On-call engineer | T+2 hours |
| 6 | Notify stakeholders of rollback and next steps | Release Manager | T+2 hours |
| 7 | Begin post-mortem investigation | Engineering team | T+24 hours |
| 8 | Document root cause and remediation in post-mortem | Engineering team | T+72 hours |
| 9 | Implement fix and verify in staging | Engineering team | TBD |
| 10 | Schedule re-deployment with enhanced monitoring | Release Manager | TBD |

---

## 9. Rollback Decision Tree

```
Incident Detected
       |
       v
  Is the service responding?
       |           |
      YES          NO
       |           |
       v           v
  Error rate     Container rollback (4.1)
  > 10%?         immediately
       |           |
      YES    NO    v
       |     |   Service restored?
       v     |        |        |
  Rollback   |       YES      NO
  (4.1)      |        |        |
       |     v        v        v
       |  Monitor   Done    Database rollback (4.2)
       |  closely              |
       v                       v
  Service restored?     Service restored?
       |        |          |        |
      YES      NO        YES      NO
       |        |          |        |
       v        v          v        v
     Done   Database     Done   Full system
             rollback            restore (4.3)
             (4.2)
```

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-02 | Release Manager (RM) | Initial rollback plan |

---

*This rollback plan must be reviewed and updated before every production deployment. All on-call engineers must be familiar with these procedures.*

*Release Manager (RM) -- 2026-03-02*
