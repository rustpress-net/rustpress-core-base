//! Template service implementation.
//!
//! Provides business logic for template operations including
//! listing, creating, rating, and using templates.

use anyhow::{anyhow, Result};
use chrono::Utc;
use regex::Regex;
use sqlx::PgPool;
use uuid::Uuid;

use crate::handlers::templates::*;

/// Service for template operations
pub struct TemplateService;

impl TemplateService {
    /// List templates with filtering and pagination
    pub async fn list_templates(
        pool: &PgPool,
        query: TemplateListQuery,
    ) -> Result<TemplateListResponse> {
        let page = query.page.unwrap_or(1).max(1);
        let per_page = query.per_page.unwrap_or(20).min(100);
        let offset = ((page - 1) * per_page) as i64;

        let mut sql = String::from(
            r#"
            SELECT
                t.id, t.name, t.slug, t.description, t.category_id,
                t.thumbnail_url, t.is_pro, t.is_system, t.downloads,
                CASE WHEN t.rating_count > 0
                    THEN t.rating_sum::float / t.rating_count
                    ELSE 0
                END as rating,
                t.rating_count, t.tags,
                u.display_name as author_name
            FROM templates t
            LEFT JOIN users u ON t.author_id = u.id
            WHERE 1=1
            "#,
        );

        let mut count_sql = String::from(
            "SELECT COUNT(*) FROM templates t WHERE 1=1",
        );

        // Build WHERE clauses
        let mut conditions = Vec::new();

        if let Some(ref category) = query.category {
            conditions.push(format!("t.category_id = '{}'", category));
        }

        if let Some(ref search) = query.search {
            conditions.push(format!(
                "(t.name ILIKE '%{}%' OR t.description ILIKE '%{}%')",
                search, search
            ));
        }

        if let Some(ref tags) = query.tags {
            let tag_list: Vec<&str> = tags.split(',').collect();
            let tag_array = tag_list
                .iter()
                .map(|t| format!("'{}'", t.trim()))
                .collect::<Vec<_>>()
                .join(",");
            conditions.push(format!("t.tags && ARRAY[{}]", tag_array));
        }

        if let Some(is_system) = query.is_system {
            conditions.push(format!("t.is_system = {}", is_system));
        }

        if let Some(is_pro) = query.is_pro {
            conditions.push(format!("t.is_pro = {}", is_pro));
        }

        // Add conditions to queries
        for condition in &conditions {
            sql.push_str(&format!(" AND {}", condition));
            count_sql.push_str(&format!(" AND {}", condition));
        }

        // Add ORDER BY
        let order = match query.sort_by.unwrap_or_default() {
            TemplateSortBy::Newest => "t.created_at DESC",
            TemplateSortBy::Popular => "t.downloads DESC",
            TemplateSortBy::Rating => "rating DESC",
            TemplateSortBy::Name => "t.name ASC",
            TemplateSortBy::Downloads => "t.downloads DESC",
        };
        sql.push_str(&format!(" ORDER BY {} LIMIT {} OFFSET {}", order, per_page, offset));

        // Execute queries
        let templates: Vec<TemplateListItem> = sqlx::query_as::<_, TemplateRow>(&sql)
            .fetch_all(pool)
            .await?
            .into_iter()
            .map(|row| TemplateListItem {
                id: row.id,
                name: row.name,
                slug: row.slug,
                description: row.description,
                category_id: row.category_id,
                thumbnail_url: row.thumbnail_url,
                is_pro: row.is_pro,
                is_system: row.is_system,
                author_name: row.author_name,
                downloads: row.downloads,
                rating: row.rating.unwrap_or(0.0) as f32,
                rating_count: row.rating_count,
                tags: row.tags.unwrap_or_default(),
            })
            .collect();

        let total: (i64,) = sqlx::query_as(&count_sql)
            .fetch_one(pool)
            .await?;

        let total_pages = (total.0 as f64 / per_page as f64).ceil() as u64;

        Ok(TemplateListResponse {
            items: templates,
            total: total.0 as u64,
            page: page as u64,
            per_page: per_page as u64,
            total_pages,
        })
    }

    /// Get template by ID with full details
    pub async fn get_template(
        pool: &PgPool,
        template_id: Uuid,
        user_id: Option<Uuid>,
    ) -> Result<TemplateDetailResponse> {
        let template = sqlx::query_as::<_, TemplateDetailRow>(
            r#"
            SELECT
                t.id, t.name, t.slug, t.description, t.category_id,
                t.thumbnail_url, t.html_content, t.css_content,
                t.variables, t.is_pro, t.is_system, t.author_id,
                t.downloads, t.rating_sum, t.rating_count,
                t.is_public, t.tags, t.version,
                t.created_at, t.updated_at,
                tc.name as category_name, tc.description as category_description,
                tc.icon as category_icon, tc.sort_order as category_sort_order,
                u.display_name as author_name, u.avatar_url as author_avatar
            FROM templates t
            LEFT JOIN template_categories tc ON t.category_id = tc.id
            LEFT JOIN users u ON t.author_id = u.id
            WHERE t.id = $1
            "#,
        )
        .bind(template_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| anyhow!("Template not found"))?;

        // Get user's rating if authenticated
        let user_rating = if let Some(uid) = user_id {
            sqlx::query_scalar::<_, i32>(
                "SELECT rating FROM template_ratings WHERE template_id = $1 AND user_id = $2"
            )
            .bind(template_id)
            .bind(uid)
            .fetch_optional(pool)
            .await?
        } else {
            None
        };

        // Check if favorited
        let is_favorited = if let Some(uid) = user_id {
            sqlx::query_scalar::<_, bool>(
                "SELECT EXISTS(SELECT 1 FROM user_template_favorites WHERE template_id = $1 AND user_id = $2)"
            )
            .bind(template_id)
            .bind(uid)
            .fetch_one(pool)
            .await
            .unwrap_or(false)
        } else {
            false
        };

        // Parse variables
        let variables: Vec<TemplateVariable> = serde_json::from_value(
            template.variables.clone().unwrap_or(serde_json::json!([]))
        ).unwrap_or_default();

        // Build category
        let category = template.category_id.as_ref().map(|_| TemplateCategory {
            id: template.category_id.clone().unwrap_or_default(),
            name: template.category_name.clone().unwrap_or_default(),
            description: template.category_description.clone(),
            icon: template.category_icon.clone(),
            sort_order: template.category_sort_order.unwrap_or(0),
        });

        // Build author
        let author = template.author_id.map(|id| TemplateAuthor {
            id,
            name: template.author_name.clone().unwrap_or_default(),
            avatar_url: template.author_avatar.clone(),
        });

        let rating = if template.rating_count > 0 {
            template.rating_sum as f32 / template.rating_count as f32
        } else {
            0.0
        };

        Ok(TemplateDetailResponse {
            id: template.id,
            name: template.name,
            slug: template.slug,
            description: template.description,
            category,
            thumbnail_url: template.thumbnail_url,
            html_content: template.html_content,
            css_content: template.css_content,
            variables,
            is_pro: template.is_pro,
            is_system: template.is_system,
            author,
            downloads: template.downloads,
            rating,
            rating_count: template.rating_count,
            is_public: template.is_public,
            tags: template.tags.unwrap_or_default(),
            version: template.version,
            user_rating,
            is_favorited,
            created_at: template.created_at,
            updated_at: template.updated_at,
        })
    }

    /// Create a new user template
    pub async fn create_template(
        pool: &PgPool,
        user_id: Uuid,
        request: CreateTemplateRequest,
    ) -> Result<Template> {
        let slug = Self::generate_slug(&request.name);
        let variables = serde_json::to_value(&request.variables.unwrap_or_default())?;
        let tags = request.tags.unwrap_or_default();

        let template = sqlx::query_as::<_, TemplateFullRow>(
            r#"
            INSERT INTO templates (
                name, slug, description, category_id, thumbnail_url,
                html_content, css_content, variables, is_pro, is_system,
                author_id, is_public, tags
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, FALSE, $9, $10, $11)
            RETURNING *
            "#,
        )
        .bind(&request.name)
        .bind(&slug)
        .bind(&request.description)
        .bind(&request.category_id)
        .bind(&request.thumbnail_url)
        .bind(&request.html_content)
        .bind(&request.css_content)
        .bind(&variables)
        .bind(user_id)
        .bind(request.is_public.unwrap_or(false))
        .bind(&tags)
        .fetch_one(pool)
        .await?;

        Ok(Self::row_to_template(template))
    }

    /// Update an existing template
    pub async fn update_template(
        pool: &PgPool,
        user_id: Uuid,
        template_id: Uuid,
        request: UpdateTemplateRequest,
    ) -> Result<Template> {
        // Verify ownership
        let owner_id: Option<Uuid> = sqlx::query_scalar(
            "SELECT author_id FROM templates WHERE id = $1"
        )
        .bind(template_id)
        .fetch_optional(pool)
        .await?
        .flatten();

        if owner_id != Some(user_id) {
            return Err(anyhow!("Not authorized to update this template"));
        }

        let template = sqlx::query_as::<_, TemplateFullRow>(
            r#"
            UPDATE templates SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                category_id = COALESCE($3, category_id),
                thumbnail_url = COALESCE($4, thumbnail_url),
                html_content = COALESCE($5, html_content),
                css_content = COALESCE($6, css_content),
                variables = COALESCE($7, variables),
                is_public = COALESCE($8, is_public),
                tags = COALESCE($9, tags),
                updated_at = NOW()
            WHERE id = $10
            RETURNING *
            "#,
        )
        .bind(&request.name)
        .bind(&request.description)
        .bind(&request.category_id)
        .bind(&request.thumbnail_url)
        .bind(&request.html_content)
        .bind(&request.css_content)
        .bind(request.variables.map(|v| serde_json::to_value(v).unwrap_or_default()))
        .bind(request.is_public)
        .bind(&request.tags)
        .bind(template_id)
        .fetch_one(pool)
        .await?;

        Ok(Self::row_to_template(template))
    }

    /// Delete a template
    pub async fn delete_template(
        pool: &PgPool,
        user_id: Uuid,
        template_id: Uuid,
    ) -> Result<()> {
        let result = sqlx::query(
            "DELETE FROM templates WHERE id = $1 AND author_id = $2 AND is_system = FALSE"
        )
        .bind(template_id)
        .bind(user_id)
        .execute(pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(anyhow!("Template not found or not authorized to delete"));
        }

        Ok(())
    }

    /// Get all template categories
    pub async fn get_categories(pool: &PgPool) -> Result<Vec<TemplateCategory>> {
        let categories = sqlx::query_as::<_, TemplateCategoryRow>(
            "SELECT id, name, description, icon, sort_order FROM template_categories ORDER BY sort_order"
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| TemplateCategory {
            id: row.id,
            name: row.name,
            description: row.description,
            icon: row.icon,
            sort_order: row.sort_order,
        })
        .collect();

        Ok(categories)
    }

    /// Rate a template
    pub async fn rate_template(
        pool: &PgPool,
        user_id: Uuid,
        template_id: Uuid,
        request: RateTemplateRequest,
    ) -> Result<TemplateRatingResponse> {
        if request.rating < 1 || request.rating > 5 {
            return Err(anyhow!("Rating must be between 1 and 5"));
        }

        // Upsert rating
        sqlx::query(
            r#"
            INSERT INTO template_ratings (template_id, user_id, rating, review)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (template_id, user_id)
            DO UPDATE SET rating = $3, review = $4, updated_at = NOW()
            "#,
        )
        .bind(template_id)
        .bind(user_id)
        .bind(request.rating)
        .bind(&request.review)
        .execute(pool)
        .await?;

        // Get updated stats
        let stats: (i32, i32) = sqlx::query_as(
            "SELECT rating_sum, rating_count FROM templates WHERE id = $1"
        )
        .bind(template_id)
        .fetch_one(pool)
        .await?;

        let new_average = if stats.1 > 0 {
            stats.0 as f32 / stats.1 as f32
        } else {
            0.0
        };

        Ok(TemplateRatingResponse {
            template_id,
            rating: request.rating,
            new_average,
            total_ratings: stats.1,
        })
    }

    /// Track template usage
    pub async fn track_usage(
        pool: &PgPool,
        user_id: Option<Uuid>,
        request: TrackTemplateUsageRequest,
    ) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO template_usage (template_id, user_id, post_id, action, variables_used)
            VALUES ($1, $2, $3, $4, $5)
            "#,
        )
        .bind(request.template_id)
        .bind(user_id)
        .bind(request.post_id)
        .bind(request.action.to_string())
        .bind(request.variables_used)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Toggle template favorite
    pub async fn toggle_favorite(
        pool: &PgPool,
        user_id: Uuid,
        template_id: Uuid,
    ) -> Result<ToggleFavoriteResponse> {
        // Check if already favorited
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM user_template_favorites WHERE user_id = $1 AND template_id = $2)"
        )
        .bind(user_id)
        .bind(template_id)
        .fetch_one(pool)
        .await?;

        if exists {
            sqlx::query(
                "DELETE FROM user_template_favorites WHERE user_id = $1 AND template_id = $2"
            )
            .bind(user_id)
            .bind(template_id)
            .execute(pool)
            .await?;
        } else {
            sqlx::query(
                "INSERT INTO user_template_favorites (user_id, template_id) VALUES ($1, $2)"
            )
            .bind(user_id)
            .bind(template_id)
            .execute(pool)
            .await?;
        }

        Ok(ToggleFavoriteResponse {
            template_id,
            is_favorited: !exists,
        })
    }

    /// Get user's favorite templates
    pub async fn get_favorites(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<UserFavoritesResponse> {
        let favorites: Vec<TemplateListItem> = sqlx::query_as::<_, TemplateRow>(
            r#"
            SELECT
                t.id, t.name, t.slug, t.description, t.category_id,
                t.thumbnail_url, t.is_pro, t.is_system, t.downloads,
                CASE WHEN t.rating_count > 0
                    THEN t.rating_sum::float / t.rating_count
                    ELSE 0
                END as rating,
                t.rating_count, t.tags,
                u.display_name as author_name
            FROM templates t
            JOIN user_template_favorites f ON t.id = f.template_id
            LEFT JOIN users u ON t.author_id = u.id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| TemplateListItem {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            category_id: row.category_id,
            thumbnail_url: row.thumbnail_url,
            is_pro: row.is_pro,
            is_system: row.is_system,
            author_name: row.author_name,
            downloads: row.downloads,
            rating: row.rating.unwrap_or(0.0) as f32,
            rating_count: row.rating_count,
            tags: row.tags.unwrap_or_default(),
        })
        .collect();

        let total = favorites.len() as u64;

        Ok(UserFavoritesResponse { favorites, total })
    }

    /// Process template with variable replacements
    pub async fn process_template(
        pool: &PgPool,
        request: ProcessTemplateRequest,
    ) -> Result<ProcessTemplateResponse> {
        let template = sqlx::query_as::<_, (String, Option<String>)>(
            "SELECT html_content, css_content FROM templates WHERE id = $1"
        )
        .bind(request.template_id)
        .fetch_one(pool)
        .await?;

        let mut html = template.0;
        let css = template.1;
        let mut variables_replaced = Vec::new();

        // Replace {{variable}} placeholders
        if let Some(vars) = request.variables.as_object() {
            for (key, value) in vars {
                let placeholder = format!("{{{{{}}}}}", key);
                let replacement = value.as_str().unwrap_or("");
                if html.contains(&placeholder) {
                    html = html.replace(&placeholder, replacement);
                    variables_replaced.push(key.clone());
                }
            }
        }

        Ok(ProcessTemplateResponse {
            html,
            css: if request.include_css.unwrap_or(true) { css } else { None },
            variables_replaced,
        })
    }

    /// Extract variables from HTML content
    pub async fn extract_variables(html: &str) -> Result<ExtractVariablesResponse> {
        let re = Regex::new(r"\{\{(\w+)\}\}").unwrap();
        let mut variables: Vec<ExtractedVariable> = Vec::new();
        let mut seen: std::collections::HashMap<String, usize> = std::collections::HashMap::new();

        for cap in re.captures_iter(html) {
            let name = cap[1].to_string();
            if let Some(idx) = seen.get(&name) {
                variables[*idx].occurrences += 1;
            } else {
                let idx = variables.len();
                seen.insert(name.clone(), idx);

                // Guess variable type from name
                let suggested_type = if name.contains("image") || name.contains("img") || name.contains("avatar") || name.contains("photo") {
                    TemplateVariableType::Image
                } else if name.contains("link") || name.contains("url") || name.contains("href") {
                    TemplateVariableType::Link
                } else if name.contains("color") || name.contains("bg") {
                    TemplateVariableType::Color
                } else {
                    TemplateVariableType::Text
                };

                variables.push(ExtractedVariable {
                    name,
                    suggested_type,
                    current_value: String::new(),
                    occurrences: 1,
                });
            }
        }

        Ok(ExtractVariablesResponse {
            variables,
            html_with_placeholders: html.to_string(),
        })
    }

    /// Get template library for modal
    pub async fn get_library(
        pool: &PgPool,
        user_id: Option<Uuid>,
    ) -> Result<TemplateLibraryResponse> {
        // Get system templates
        let templates = sqlx::query_as::<_, TemplateRow>(
            r#"
            SELECT
                t.id, t.name, t.slug, t.description, t.category_id,
                t.thumbnail_url, t.is_pro, t.is_system, t.downloads,
                CASE WHEN t.rating_count > 0
                    THEN t.rating_sum::float / t.rating_count
                    ELSE 0
                END as rating,
                t.rating_count, t.tags,
                u.display_name as author_name
            FROM templates t
            LEFT JOIN users u ON t.author_id = u.id
            WHERE t.is_system = TRUE OR t.is_public = TRUE
            ORDER BY t.category_id, t.sort_order, t.name
            "#,
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| TemplateListItem {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            category_id: row.category_id,
            thumbnail_url: row.thumbnail_url,
            is_pro: row.is_pro,
            is_system: row.is_system,
            author_name: row.author_name,
            downloads: row.downloads,
            rating: row.rating.unwrap_or(0.0) as f32,
            rating_count: row.rating_count,
            tags: row.tags.unwrap_or_default(),
        })
        .collect();

        // Get categories
        let categories = Self::get_categories(pool).await?;

        // Get user templates if authenticated
        let user_templates = if let Some(uid) = user_id {
            sqlx::query_as::<_, TemplateRow>(
                r#"
                SELECT
                    t.id, t.name, t.slug, t.description, t.category_id,
                    t.thumbnail_url, t.is_pro, t.is_system, t.downloads,
                    CASE WHEN t.rating_count > 0
                        THEN t.rating_sum::float / t.rating_count
                        ELSE 0
                    END as rating,
                    t.rating_count, t.tags,
                    u.display_name as author_name
                FROM templates t
                LEFT JOIN users u ON t.author_id = u.id
                WHERE t.author_id = $1
                ORDER BY t.created_at DESC
                "#,
            )
            .bind(uid)
            .fetch_all(pool)
            .await?
            .into_iter()
            .map(|row| TemplateListItem {
                id: row.id,
                name: row.name,
                slug: row.slug,
                description: row.description,
                category_id: row.category_id,
                thumbnail_url: row.thumbnail_url,
                is_pro: row.is_pro,
                is_system: row.is_system,
                author_name: row.author_name,
                downloads: row.downloads,
                rating: row.rating.unwrap_or(0.0) as f32,
                rating_count: row.rating_count,
                tags: row.tags.unwrap_or_default(),
            })
            .collect()
        } else {
            Vec::new()
        };

        // Get favorites
        let favorites = if let Some(uid) = user_id {
            sqlx::query_scalar::<_, Uuid>(
                "SELECT template_id FROM user_template_favorites WHERE user_id = $1"
            )
            .bind(uid)
            .fetch_all(pool)
            .await?
        } else {
            Vec::new()
        };

        // Get recent used
        let recent_used = if let Some(uid) = user_id {
            sqlx::query_scalar::<_, Uuid>(
                r#"
                SELECT DISTINCT template_id
                FROM template_usage
                WHERE user_id = $1 AND action = 'insert'
                ORDER BY created_at DESC
                LIMIT 10
                "#
            )
            .bind(uid)
            .fetch_all(pool)
            .await?
        } else {
            Vec::new()
        };

        Ok(TemplateLibraryResponse {
            templates,
            categories,
            user_templates,
            favorites,
            recent_used,
        })
    }

    /// Get template analytics
    pub async fn get_analytics(
        pool: &PgPool,
        user_id: Option<Uuid>,
    ) -> Result<TemplateAnalyticsResponse> {
        let mut total_cond = String::new();
        let mut usage_cond = String::new();

        if let Some(uid) = user_id {
            total_cond = format!(" WHERE author_id = '{}'", uid);
            usage_cond = format!(" WHERE user_id = '{}'", uid);
        }

        // Total templates
        let total_templates: (i64,) = sqlx::query_as(
            &format!("SELECT COUNT(*) FROM templates{}", total_cond)
        )
        .fetch_one(pool)
        .await?;

        // Total downloads
        let total_downloads: (i64,) = sqlx::query_as(
            &format!("SELECT COALESCE(SUM(downloads), 0) FROM templates{}", total_cond)
        )
        .fetch_one(pool)
        .await?;

        // Total inserts
        let total_inserts: (i64,) = sqlx::query_as(
            &format!(
                "SELECT COUNT(*) FROM template_usage{} AND action = 'insert'",
                if usage_cond.is_empty() { " WHERE 1=1" } else { &usage_cond }
            )
        )
        .fetch_one(pool)
        .await?;

        // Most popular templates
        let most_popular = sqlx::query_as::<_, (Uuid, String, i64, f64)>(
            r#"
            SELECT t.id, t.name, t.downloads::bigint,
                CASE WHEN t.rating_count > 0
                    THEN t.rating_sum::float / t.rating_count
                    ELSE 0
                END as rating
            FROM templates t
            WHERE t.is_system = TRUE OR t.is_public = TRUE
            ORDER BY t.downloads DESC
            LIMIT 10
            "#,
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|(id, name, downloads, rating)| TemplatePopularityEntry {
            template_id: id,
            template_name: name,
            downloads,
            rating: rating as f32,
        })
        .collect();

        // Category breakdown
        let category_breakdown = sqlx::query_as::<_, (String, String, i64, i64)>(
            r#"
            SELECT tc.id, tc.name, COUNT(t.id), COALESCE(SUM(t.downloads), 0)
            FROM template_categories tc
            LEFT JOIN templates t ON tc.id = t.category_id
            GROUP BY tc.id, tc.name
            ORDER BY tc.sort_order
            "#,
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|(id, name, count, downloads)| CategoryUsageStats {
            category_id: id,
            category_name: name,
            template_count: count,
            total_downloads: downloads,
        })
        .collect();

        Ok(TemplateAnalyticsResponse {
            total_templates: total_templates.0,
            total_downloads: total_downloads.0,
            total_inserts: total_inserts.0,
            most_popular,
            recent_usage: Vec::new(), // Simplified for now
            category_breakdown,
        })
    }

    /// Generate URL-safe slug from name
    fn generate_slug(name: &str) -> String {
        let slug = name
            .to_lowercase()
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>();

        let re = Regex::new(r"-+").unwrap();
        let slug = re.replace_all(&slug, "-").to_string();
        let slug = slug.trim_matches('-').to_string();

        // Add timestamp for uniqueness
        format!("{}-{}", slug, Utc::now().timestamp_millis() % 10000)
    }

    /// Convert database row to Template
    fn row_to_template(row: TemplateFullRow) -> Template {
        let variables: Vec<TemplateVariable> = serde_json::from_value(
            row.variables.clone().unwrap_or(serde_json::json!([]))
        ).unwrap_or_default();

        let rating = if row.rating_count > 0 {
            row.rating_sum as f32 / row.rating_count as f32
        } else {
            0.0
        };

        Template {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            category_id: row.category_id,
            thumbnail_url: row.thumbnail_url,
            html_content: row.html_content,
            css_content: row.css_content,
            variables,
            is_pro: row.is_pro,
            is_system: row.is_system,
            author_id: row.author_id,
            downloads: row.downloads,
            rating,
            rating_count: row.rating_count,
            is_public: row.is_public,
            tags: row.tags.unwrap_or_default(),
            version: row.version,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

// Database row types
#[derive(sqlx::FromRow)]
struct TemplateRow {
    id: Uuid,
    name: String,
    slug: String,
    description: Option<String>,
    category_id: Option<String>,
    thumbnail_url: Option<String>,
    is_pro: bool,
    is_system: bool,
    downloads: i32,
    rating: Option<f64>,
    rating_count: i32,
    tags: Option<Vec<String>>,
    author_name: Option<String>,
}

#[derive(sqlx::FromRow)]
struct TemplateDetailRow {
    id: Uuid,
    name: String,
    slug: String,
    description: Option<String>,
    category_id: Option<String>,
    thumbnail_url: Option<String>,
    html_content: String,
    css_content: Option<String>,
    variables: Option<serde_json::Value>,
    is_pro: bool,
    is_system: bool,
    author_id: Option<Uuid>,
    downloads: i32,
    rating_sum: i32,
    rating_count: i32,
    is_public: bool,
    tags: Option<Vec<String>>,
    version: String,
    created_at: chrono::DateTime<Utc>,
    updated_at: chrono::DateTime<Utc>,
    category_name: Option<String>,
    category_description: Option<String>,
    category_icon: Option<String>,
    category_sort_order: Option<i32>,
    author_name: Option<String>,
    author_avatar: Option<String>,
}

#[derive(sqlx::FromRow)]
struct TemplateFullRow {
    id: Uuid,
    name: String,
    slug: String,
    description: Option<String>,
    category_id: Option<String>,
    thumbnail_url: Option<String>,
    html_content: String,
    css_content: Option<String>,
    variables: Option<serde_json::Value>,
    is_pro: bool,
    is_system: bool,
    author_id: Option<Uuid>,
    downloads: i32,
    rating_sum: i32,
    rating_count: i32,
    is_public: bool,
    tags: Option<Vec<String>>,
    version: String,
    created_at: chrono::DateTime<Utc>,
    updated_at: chrono::DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
struct TemplateCategoryRow {
    id: String,
    name: String,
    description: Option<String>,
    icon: Option<String>,
    sort_order: i32,
}
