# Database Schema Audit - RustPress CMS v0.4.0

> **Author**: Backend Engineer (BE)
> **Date**: 2026-03-02
> **Branch**: `ai-develop`
> **Database**: PostgreSQL 16
> **Migration Files**: 10 files in `migrations/`
> **Status**: Wave 2 Research

---

## 1. Migration File Inventory

| # | File | Description | Tables Created/Modified |
|---|------|-------------|----------------------|
| 1 | `00001_initial_schema.sql` | Core CMS tables | users, posts, pages, categories, tags, post_categories, post_tags, media, comments, settings, themes, menus, menu_items, widgets |
| 2 | `00002_sites_table.sql` | Multi-site support | sites |
| 3 | `00023_create_password_reset_tokens.sql` | Auth tokens | password_reset_tokens, email_verification_tokens |
| 4 | `00024_add_missing_schema.sql` | Schema fixes + additions | sessions, options, media_folders, comment_likes; ALTER users, media, comments |
| 5 | `00025_collaboration_and_chat.sql` | Real-time collab + chat | collaboration_sessions, file_presence, chat_conversations, chat_conversation_participants, chat_conversation_tags, chat_messages, chat_message_reactions, chat_message_stars, chat_message_reminders |
| 6 | `00026_storage_configuration.sql` | Storage backends | storage_configurations, storage_migrations, storage_migration_files, storage_migration_checkpoints; ALTER media |
| 7 | `00027_block_library.sql` | Block editor | user_block_preferences, custom_blocks, block_categories, block_usage_analytics |
| 8 | `00028_animations.sql` | Animation library | animations, user_animations, user_animation_preferences, animation_presets, animation_usage_analytics |
| 9 | `00029_templates.sql` | Content templates | template_categories, templates, template_ratings, template_usage, user_template_favorites |
| 10 | `00030_media_library.sql` | Enhanced media | media_folders (DROP+CREATE), media_variants, media_usage, media_optimization_queue, user_media_preferences; ALTER media (many columns) |

**Note**: Migration numbering jumps from `00002` to `00023`. This suggests migrations 3-22 were either deleted or never existed. No `DOWN` migrations are present in any file.

---

## 2. Complete Schema (All Tables)

### 2.1 Core Content Tables

#### `users`
| Column | Type | Constraints | Added In |
|--------|------|-------------|----------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 00001 |
| email | VARCHAR(255) | NOT NULL UNIQUE | 00001 |
| username | VARCHAR(100) | NOT NULL UNIQUE | 00001 |
| password_hash | VARCHAR(255) | NOT NULL | 00001 |
| display_name | VARCHAR(255) | | 00001 |
| avatar_url | VARCHAR(500) | | 00001 |
| role | VARCHAR(50) | NOT NULL DEFAULT 'subscriber' | 00001 |
| status | VARCHAR(50) | NOT NULL DEFAULT 'active' | 00001 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| last_login_at | TIMESTAMPTZ | | 00001 |
| email_verified_at | TIMESTAMPTZ | | 00001 |
| meta | JSONB | DEFAULT '{}' | 00001 |
| locale | VARCHAR(50) | | 00024 |
| timezone | VARCHAR(100) | | 00024 |
| deleted_at | TIMESTAMPTZ | | 00024 |

**Default data**: Admin user with Argon2id hash for "admin123"

#### `posts`
| Column | Type | Constraints | Added In |
|--------|------|-------------|----------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 00001 |
| title | VARCHAR(500) | NOT NULL | 00001 |
| slug | VARCHAR(500) | NOT NULL UNIQUE | 00001 |
| content | TEXT | | 00001 |
| excerpt | TEXT | | 00001 |
| status | VARCHAR(50) | NOT NULL DEFAULT 'draft' | 00001 |
| post_type | VARCHAR(50) | NOT NULL DEFAULT 'post' | 00001 |
| author_id | UUID | FK -> users(id) ON DELETE SET NULL | 00001 |
| featured_image_id | UUID | (no FK constraint) | 00001 |
| published_at | TIMESTAMPTZ | | 00001 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| meta | JSONB | DEFAULT '{}' | 00001 |

**Note**: `featured_image_id` lacks a FK constraint to `media(id)`. Also, `deleted_at` is referenced in SQL queries (e.g., routes.rs line 3981: `AND p.deleted_at IS NULL`) but is **NOT defined** in any migration. This is a schema gap.

**Indexes**: `idx_posts_status`, `idx_posts_author`, `idx_posts_published_at`, `idx_posts_slug`

#### `pages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| title | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | NOT NULL UNIQUE |
| content | TEXT | |
| status | VARCHAR(50) | NOT NULL DEFAULT 'draft' |
| author_id | UUID | FK -> users(id) ON DELETE SET NULL |
| parent_id | UUID | FK -> pages(id) ON DELETE SET NULL |
| template | VARCHAR(100) | |
| menu_order | INTEGER | NOT NULL DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| meta | JSONB | DEFAULT '{}' |

**Indexes**: `idx_pages_slug`

#### `categories`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL UNIQUE |
| description | TEXT | |
| parent_id | UUID | FK -> categories(id) ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

**Default data**: "Uncategorized" category

#### `tags`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL UNIQUE |
| description | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

#### `post_categories` (Junction)
| Column | Type | Constraints |
|--------|------|-------------|
| post_id | UUID | FK -> posts(id) ON DELETE CASCADE |
| category_id | UUID | FK -> categories(id) ON DELETE CASCADE |
| **PK** | | (post_id, category_id) |

#### `post_tags` (Junction)
| Column | Type | Constraints |
|--------|------|-------------|
| post_id | UUID | FK -> posts(id) ON DELETE CASCADE |
| tag_id | UUID | FK -> tags(id) ON DELETE CASCADE |
| **PK** | | (post_id, tag_id) |

### 2.2 Media Tables

#### `media`
| Column | Type | Constraints | Added In |
|--------|------|-------------|----------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 00001 |
| filename | VARCHAR(500) | NOT NULL | 00001 |
| original_filename | VARCHAR(500) | NOT NULL | 00001 |
| mime_type | VARCHAR(100) | NOT NULL | 00001 |
| file_size | BIGINT | NOT NULL | 00001 |
| width | INTEGER | | 00001 |
| height | INTEGER | | 00001 |
| alt_text | VARCHAR(500) | | 00001 |
| caption | TEXT | | 00001 |
| uploaded_by | UUID | FK -> users(id) ON DELETE SET NULL | 00001 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| meta | JSONB | DEFAULT '{}' | 00001 |
| folder_id | UUID | FK -> media_folders(id) | 00024 -> 00030 |
| title | VARCHAR(500) | | 00024 |
| description | TEXT | | 00024 |
| deleted_at | TIMESTAMPTZ | | 00024 |
| storage_backend | VARCHAR(50) | DEFAULT 'local' | 00026 |
| storage_path | TEXT | | 00026 |
| cdn_url | TEXT | | 00026 |
| duration | INTEGER | | 00030 |
| url | TEXT | | 00030 |
| thumbnail_url | TEXT | | 00030 |
| is_optimized | BOOLEAN | DEFAULT FALSE | 00030 |
| original_size | BIGINT | | 00030 |
| optimized_url | TEXT | | 00030 |
| blurhash | VARCHAR(100) | | 00030 |
| dominant_color | VARCHAR(7) | | 00030 |
| focal_point_x | DECIMAL(5,2) | DEFAULT 50.00 | 00030 |
| focal_point_y | DECIMAL(5,2) | DEFAULT 50.00 | 00030 |
| tags | TEXT[] | DEFAULT '{}' | 00030 |
| is_favorite | BOOLEAN | DEFAULT FALSE | 00030 |
| view_count | INTEGER | DEFAULT 0 | 00030 |
| download_count | INTEGER | DEFAULT 0 | 00030 |

**Note**: `folder_id` is added in 00024, then 00030 drops `media_folders` and recreates it, and adds `folder_id` again with `IF NOT EXISTS`. This is safe but redundant.

**Indexes**: `idx_media_uploaded_by`, `idx_media_folder_id`, `idx_media_tags` (GIN), `idx_media_is_favorite`, `idx_media_mime_type`

#### `media_folders` (Recreated in 00030)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(200) | NOT NULL |
| description | TEXT | |
| parent_id | UUID | FK -> media_folders(id) ON DELETE CASCADE |
| user_id | UUID | FK -> users(id) ON DELETE CASCADE |
| color | VARCHAR(7) | DEFAULT '#6366f1' |
| icon | VARCHAR(50) | DEFAULT 'folder' |
| item_count | INTEGER | DEFAULT 0 |
| total_size | BIGINT | DEFAULT 0 |
| is_system | BOOLEAN | DEFAULT FALSE |
| sort_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | | (parent_id, slug) |

**Default data**: 5 system folders (Images, Videos, Audio, Documents, Uploads) with sub-folders

#### `media_variants`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| media_id | UUID | FK -> media(id) ON DELETE CASCADE, NOT NULL |
| variant_type | VARCHAR(50) | NOT NULL |
| filename | VARCHAR(500) | NOT NULL |
| url | TEXT | NOT NULL |
| width | INTEGER | |
| height | INTEGER | |
| file_size | BIGINT | |
| mime_type | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `media_usage`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| media_id | UUID | FK -> media(id) ON DELETE CASCADE, NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | NOT NULL |
| context | VARCHAR(100) | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| **UNIQUE** | | (media_id, entity_type, entity_id, context) |

#### `media_optimization_queue`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| media_id | UUID | FK -> media(id) ON DELETE CASCADE, NOT NULL |
| status | VARCHAR(50) | DEFAULT 'pending' |
| options | JSONB | DEFAULT '{}' |
| result | JSONB | |
| error_message | TEXT | |
| attempts | INTEGER | DEFAULT 0 |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### 2.3 Auth & Session Tables

#### `sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| user_id | UUID | FK -> users(id) ON DELETE CASCADE, NOT NULL |
| token_hash | VARCHAR(255) | NOT NULL |
| user_agent | TEXT | |
| ip_address | VARCHAR(45) | |
| last_activity_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

#### `password_reset_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK -> users(id) ON DELETE CASCADE, NOT NULL |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| used_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

#### `email_verification_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK -> users(id) ON DELETE CASCADE, NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| verified_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.4 Settings & Options

#### `settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| key | VARCHAR(255) | NOT NULL UNIQUE |
| value | TEXT | |
| type | VARCHAR(50) | NOT NULL DEFAULT 'string' |
| group_name | VARCHAR(100) | NOT NULL DEFAULT 'general' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

#### `options`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| site_id | UUID | |
| option_name | VARCHAR(255) | NOT NULL |
| option_value | JSONB | |
| option_group | VARCHAR(100) | NOT NULL DEFAULT 'general' |
| autoload | BOOLEAN | NOT NULL DEFAULT TRUE |
| is_system | BOOLEAN | NOT NULL DEFAULT FALSE |
| value_type | VARCHAR(50) | |
| validation | JSONB | |
| display_name | VARCHAR(255) | |
| description | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| **UNIQUE** | | (site_id, option_name) |

### 2.5 Interaction Tables

#### `comments`
| Column | Type | Constraints | Added In |
|--------|------|-------------|----------|
| id | UUID | PK | 00001 |
| post_id | UUID | FK -> posts(id) ON DELETE CASCADE, NOT NULL | 00001 |
| parent_id | UUID | FK -> comments(id) ON DELETE CASCADE | 00001 |
| author_id | UUID | FK -> users(id) ON DELETE SET NULL | 00001 |
| author_name | VARCHAR(255) | | 00001 |
| author_email | VARCHAR(255) | | 00001 |
| author_url | VARCHAR(500) | | 00001 |
| content | TEXT | NOT NULL | 00001 |
| status | VARCHAR(50) | NOT NULL DEFAULT 'pending' | 00001 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 00001 |
| likes_count | INTEGER | DEFAULT 0 | 00024 |
| deleted_at | TIMESTAMPTZ | | 00024 |

#### `comment_likes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| comment_id | UUID | FK -> comments(id) ON DELETE CASCADE, NOT NULL |
| user_id | UUID | FK -> users(id) ON DELETE CASCADE |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| **UNIQUE INDEX** | | (comment_id, COALESCE(user_id, NULL_UUID), COALESCE(ip_address, '')) |

### 2.6 Navigation Tables

#### `menus`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL UNIQUE |
| location | VARCHAR(100) | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

**Note**: `deleted_at` is used in queries (`WHERE deleted_at IS NULL` at routes.rs line 5842) but NOT in the schema. Schema gap.

#### `menu_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| menu_id | UUID | FK -> menus(id) ON DELETE CASCADE, NOT NULL |
| parent_id | UUID | FK -> menu_items(id) ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| url | VARCHAR(500) | |
| target | VARCHAR(50) | DEFAULT '_self' |
| object_type | VARCHAR(50) | |
| object_id | UUID | |
| menu_order | INTEGER | NOT NULL DEFAULT 0 |
| css_classes | VARCHAR(500) | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

#### `widgets`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| sidebar | VARCHAR(100) | NOT NULL |
| widget_type | VARCHAR(100) | NOT NULL |
| title | VARCHAR(255) | |
| content | TEXT | |
| settings | JSONB | DEFAULT '{}' |
| widget_order | INTEGER | NOT NULL DEFAULT 0 |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.7 Multi-site

#### `sites`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| domain | VARCHAR(255) | NOT NULL UNIQUE |
| description | TEXT | |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |
| settings | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.8 - 2.14: Collaboration, Chat, Storage, Block, Animation, Template Tables

(See migration files 00025-00030 above for complete definitions. Total of 30+ additional tables.)

---

## 3. Schema Gaps & Issues

### 3.1 CRITICAL: Missing Tables Referenced in Code

| Table | Referenced In | Issue |
|-------|--------------|-------|
| `backups` | routes.rs lines 4174-4188 | Queries `backups` table (id, name, backup_type, file_size, status, created_at) but NO migration creates this table |
| `backup_schedules` | routes.rs line 4129 | Referenced but no migration |
| `widget_areas` | routes.rs line 6251 | Queries `widget_areas` (id, slug, name, description, deleted_at) but no migration creates this table |
| `posts.deleted_at` | routes.rs lines 3981, 4100, 4426-4448, 6470-6521 | Widely used in WHERE clauses but not in any migration |
| `menus.deleted_at` | routes.rs line 5842 | Used in WHERE clause but not in schema |
| `post_revisions` | Referenced in crates/rustpress-content/src/revision.rs | No migration exists |

### 3.2 Missing Foreign Key Constraints

| Issue | Location |
|-------|----------|
| `posts.featured_image_id` has no FK to `media(id)` | 00001 line 34 |
| `sites` table has no ON DELETE CASCADE chains to other tables that reference `site_id` | 00002 |

### 3.3 Missing Indexes (Performance Risks)

| Table | Missing Index | Impact |
|-------|--------------|--------|
| `posts` | Index on `(post_type, status, deleted_at)` composite | Slow dashboard stats queries |
| `posts` | Full-text search index (`tsvector`) on `title + content` | Search uses `to_tsvector()` at query time without stored index |
| `posts` | Index on `created_at` | No index for time-sorted queries |
| `comments` | Index on `(post_id, status)` composite | Slow comment count queries |
| `users` | Index on `role` | Role-based filtering |
| `users` | Index on `deleted_at` | Soft-delete filter queries |
| `options` | Missing index on `(option_group, autoload)` composite | Batch loading settings |
| `media` | Index on `created_at` | Time-sorted media listing |

### 3.4 Migration Numbering Gap

Migrations jump from `00002` to `00023`. This means:
- If the project used a migration framework that expects sequential numbering, migrations 3-22 would be missing
- The `refinery` crate (listed in Cargo.toml dependencies) uses file-based sequential migrations
- Running all migrations on a fresh database may fail if the framework expects gap-free numbering
- **Recommendation**: Verify refinery's behavior with non-sequential numbers, or consolidate migrations

### 3.5 Duplicate Table Definition

`media_folders` is created in migration 00024, then **DROP CASCADE + recreated** in 00030 with a different schema. This means:
- Running 00030 will destroy all existing folder data
- The `fk_media_folder` constraint added in 00024 will be lost with CASCADE
- This is a data-loss risk in production migration scenarios

### 3.6 No DOWN Migrations

None of the 10 migration files include rollback SQL. The project charter requires: "Database migrations are reversible and tested (up + down for all 10 migration files)." Every migration needs a corresponding DOWN script.

---

## 4. Schema Statistics

| Metric | Value |
|--------|-------|
| Total tables defined in migrations | ~55 |
| Total tables referenced in code but missing from migrations | 3-4 |
| Total columns across all tables | ~350+ |
| Total indexes defined | ~80+ |
| Total triggers defined | ~8 |
| Total functions defined | ~8 |
| Default data inserts | Users (1), Categories (1), Settings (10), Storage configs (5), Block categories (6), Animations (56), Template categories (15), Templates (10), Media folders (10) |

---

## 5. Recommendations

### P0 (Must Fix)
1. Add `deleted_at TIMESTAMPTZ` to `posts`, `menus` tables (new migration 00031)
2. Create `backups` and `backup_schedules` tables (new migration 00032)
3. Create `widget_areas` table (new migration 00033)
4. Add composite index on `posts(post_type, status)` for dashboard queries
5. Add GIN index on `to_tsvector('english', title || ' ' || content)` for search

### P1 (Should Fix)
6. Add FK constraint on `posts.featured_image_id`
7. Add DOWN migration scripts for all 10 existing migrations
8. Verify migration numbering compatibility with refinery
9. Fix `media_folders` DROP CASCADE in 00030 to be non-destructive
10. Add missing composite indexes per Section 3.3

### P2 (Nice to Have)
11. Consolidate settings/options tables (currently both exist with migrated data)
12. Add `post_revisions` table for version history
13. Add audit log table for security events
14. Consider partitioning `block_usage_analytics` and `animation_usage_analytics` by date
