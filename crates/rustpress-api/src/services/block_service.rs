//! Block Library service for handling block-related business logic.
//!
//! This service manages content blocks, user preferences for blocks,
//! custom reusable blocks, and block usage analytics.

use chrono::{DateTime, Utc};
use rustpress_core::error::{Error, Result};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::handlers::blocks::{
    BlockAnalyticsResponse, BlockCategory, BlockDefinition, BlockLibraryResponse, BlockSupports,
    BlockToggleFavoriteResponse, BlockUsageEntry, CreateCustomBlockRequest, CustomBlockListQuery,
    CustomBlockListResponse, CustomBlockResponse, TrackBlockUsageRequest,
    UpdateBlockSettingsRequest, UpdateCustomBlockRequest, UpdateRecentBlocksRequest,
    UserBlockPreferencesResponse,
};

/// Database row for user block preferences
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct UserBlockPreferencesRow {
    pub id: Uuid,
    pub user_id: Uuid,
    pub recent_blocks: serde_json::Value,
    pub favorite_blocks: serde_json::Value,
    pub block_settings: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Database row for custom blocks
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct CustomBlockRow {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub icon: String,
    pub content: String,
    pub preview_html: Option<String>,
    pub settings: serde_json::Value,
    pub is_global: bool,
    pub usage_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Database row for block categories
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct BlockCategoryRow {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub sort_order: i32,
    pub is_system: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Database row for block usage analytics
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct BlockUsageRow {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub block_id: String,
    pub block_type: String,
    pub post_id: Option<Uuid>,
    pub action: String,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

impl From<UserBlockPreferencesRow> for UserBlockPreferencesResponse {
    fn from(row: UserBlockPreferencesRow) -> Self {
        let recent_blocks: Vec<String> =
            serde_json::from_value(row.recent_blocks).unwrap_or_default();
        let favorite_blocks: Vec<String> =
            serde_json::from_value(row.favorite_blocks).unwrap_or_default();

        Self {
            user_id: row.user_id,
            recent_blocks,
            favorite_blocks,
            block_settings: row.block_settings,
            updated_at: row.updated_at,
        }
    }
}

impl From<CustomBlockRow> for CustomBlockResponse {
    fn from(row: CustomBlockRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            description: row.description,
            category: row.category,
            icon: row.icon,
            content: row.content,
            preview_html: row.preview_html,
            settings: row.settings,
            is_global: row.is_global,
            usage_count: row.usage_count,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

impl From<BlockCategoryRow> for BlockCategory {
    fn from(row: BlockCategoryRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            icon: row.icon,
            sort_order: row.sort_order,
            is_system: row.is_system,
        }
    }
}

/// Block service for handling block library operations
#[derive(Clone)]
pub struct BlockService {
    pool: PgPool,
}

impl BlockService {
    /// Create a new block service
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Get all built-in block definitions
    pub fn get_builtin_blocks() -> Vec<BlockDefinition> {
        vec![
            // Text blocks
            BlockDefinition {
                id: "paragraph".to_string(),
                name: "Paragraph".to_string(),
                description: "Start writing with plain text".to_string(),
                icon: "FileText".to_string(),
                category: "text".to_string(),
                html_template: "<p>{{content}}</p>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "heading".to_string(),
                name: "Heading".to_string(),
                description: "Large section heading (H2-H6)".to_string(),
                icon: "Type".to_string(),
                category: "text".to_string(),
                html_template: "<h{{level}}>{{content}}</h{{level}}>".to_string(),
                default_attributes: serde_json::json!({"level": 2}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "quote".to_string(),
                name: "Quote".to_string(),
                description: "Give quoted text visual emphasis".to_string(),
                icon: "Quote".to_string(),
                category: "text".to_string(),
                html_template: "<blockquote><p>{{content}}</p><cite>{{citation}}</cite></blockquote>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "list".to_string(),
                name: "List".to_string(),
                description: "Create a bulleted or numbered list".to_string(),
                icon: "List".to_string(),
                category: "text".to_string(),
                html_template: "<{{tag}}><li>{{item}}</li></{{tag}}>".to_string(),
                default_attributes: serde_json::json!({"ordered": false}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "code".to_string(),
                name: "Code".to_string(),
                description: "Display code with syntax highlighting".to_string(),
                icon: "Code".to_string(),
                category: "text".to_string(),
                html_template: "<pre><code class=\"language-{{language}}\">{{content}}</code></pre>".to_string(),
                default_attributes: serde_json::json!({"language": "javascript"}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "preformatted".to_string(),
                name: "Preformatted".to_string(),
                description: "Add text that respects whitespace".to_string(),
                icon: "FileText".to_string(),
                category: "text".to_string(),
                html_template: "<pre>{{content}}</pre>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            // Media blocks
            BlockDefinition {
                id: "image".to_string(),
                name: "Image".to_string(),
                description: "Insert an image to make a visual statement".to_string(),
                icon: "Image".to_string(),
                category: "media".to_string(),
                html_template: "<figure><img src=\"{{src}}\" alt=\"{{alt}}\" /><figcaption>{{caption}}</figcaption></figure>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: false,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "gallery".to_string(),
                name: "Gallery".to_string(),
                description: "Display multiple images in a gallery".to_string(),
                icon: "Grid".to_string(),
                category: "media".to_string(),
                html_template: "<div class=\"gallery\">{{images}}</div>".to_string(),
                default_attributes: serde_json::json!({"columns": 3}),
                supports: BlockSupports {
                    alignment: true,
                    color: false,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "video".to_string(),
                name: "Video".to_string(),
                description: "Embed a video from your media library".to_string(),
                icon: "Play".to_string(),
                category: "media".to_string(),
                html_template: "<video src=\"{{src}}\" controls>{{fallback}}</video>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: false,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "audio".to_string(),
                name: "Audio".to_string(),
                description: "Embed a simple audio player".to_string(),
                icon: "Volume2".to_string(),
                category: "media".to_string(),
                html_template: "<audio src=\"{{src}}\" controls>{{fallback}}</audio>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: false,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "file".to_string(),
                name: "File".to_string(),
                description: "Add a link to a downloadable file".to_string(),
                icon: "Download".to_string(),
                category: "media".to_string(),
                html_template: "<a href=\"{{href}}\" download>{{text}}</a>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            // Layout blocks
            BlockDefinition {
                id: "columns".to_string(),
                name: "Columns".to_string(),
                description: "Add a block that displays content in columns".to_string(),
                icon: "Columns".to_string(),
                category: "layout".to_string(),
                html_template: "<div class=\"columns\">{{columns}}</div>".to_string(),
                default_attributes: serde_json::json!({"columns": 2}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "group".to_string(),
                name: "Group".to_string(),
                description: "Group blocks together and style them".to_string(),
                icon: "Folder".to_string(),
                category: "layout".to_string(),
                html_template: "<div class=\"group\">{{content}}</div>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "separator".to_string(),
                name: "Separator".to_string(),
                description: "Create a break between ideas".to_string(),
                icon: "MoreHorizontal".to_string(),
                category: "layout".to_string(),
                html_template: "<hr class=\"separator\" />".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "spacer".to_string(),
                name: "Spacer".to_string(),
                description: "Add whitespace between blocks".to_string(),
                icon: "Square".to_string(),
                category: "layout".to_string(),
                html_template: "<div class=\"spacer\" style=\"height:{{height}}px\"></div>".to_string(),
                default_attributes: serde_json::json!({"height": 50}),
                supports: BlockSupports {
                    alignment: false,
                    color: false,
                    typography: false,
                    spacing: false,
                    html: true,
                    reusable: true,
                },
            },
            // Embed blocks
            BlockDefinition {
                id: "embed".to_string(),
                name: "Embed".to_string(),
                description: "Embed content from external sources".to_string(),
                icon: "ExternalLink".to_string(),
                category: "embed".to_string(),
                html_template: "<div class=\"embed\">{{embed}}</div>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: false,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "html".to_string(),
                name: "Custom HTML".to_string(),
                description: "Add custom HTML code".to_string(),
                icon: "Code".to_string(),
                category: "embed".to_string(),
                html_template: "{{content}}".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: false,
                    color: false,
                    typography: false,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            // Interactive blocks
            BlockDefinition {
                id: "button".to_string(),
                name: "Button".to_string(),
                description: "Add a customizable call-to-action button".to_string(),
                icon: "MousePointer".to_string(),
                category: "interactive".to_string(),
                html_template: "<a href=\"{{href}}\" class=\"button\">{{text}}</a>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "accordion".to_string(),
                name: "Accordion".to_string(),
                description: "Create expandable/collapsible content sections".to_string(),
                icon: "ChevronRight".to_string(),
                category: "interactive".to_string(),
                html_template: "<details><summary>{{title}}</summary><div>{{content}}</div></details>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "tabs".to_string(),
                name: "Tabs".to_string(),
                description: "Organize content into tabbed sections".to_string(),
                icon: "Folder".to_string(),
                category: "interactive".to_string(),
                html_template: "<div class=\"tabs\">{{tabs}}</div>".to_string(),
                default_attributes: serde_json::json!({}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "alert".to_string(),
                name: "Alert".to_string(),
                description: "Display important notices or warnings".to_string(),
                icon: "AlertCircle".to_string(),
                category: "interactive".to_string(),
                html_template: "<div class=\"alert alert-{{type}}\">{{content}}</div>".to_string(),
                default_attributes: serde_json::json!({"type": "info"}),
                supports: BlockSupports {
                    alignment: false,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
            BlockDefinition {
                id: "table".to_string(),
                name: "Table".to_string(),
                description: "Insert a table for displaying structured data".to_string(),
                icon: "Grid".to_string(),
                category: "interactive".to_string(),
                html_template: "<table>{{content}}</table>".to_string(),
                default_attributes: serde_json::json!({"rows": 3, "columns": 3}),
                supports: BlockSupports {
                    alignment: true,
                    color: true,
                    typography: true,
                    spacing: true,
                    html: true,
                    reusable: true,
                },
            },
        ]
    }

    /// Get block categories from database
    pub async fn get_categories(&self) -> Result<Vec<BlockCategory>> {
        let rows: Vec<BlockCategoryRow> =
            sqlx::query_as("SELECT * FROM block_categories ORDER BY sort_order ASC")
                .fetch_all(&self.pool)
                .await
                .map_err(|e| Error::database_with_source("Failed to fetch block categories", e))?;

        Ok(rows.into_iter().map(BlockCategory::from).collect())
    }

    /// Get user's block preferences
    pub async fn get_user_preferences(
        &self,
        user_id: Uuid,
    ) -> Result<UserBlockPreferencesResponse> {
        let row: Option<UserBlockPreferencesRow> =
            sqlx::query_as("SELECT * FROM user_block_preferences WHERE user_id = $1")
                .bind(user_id)
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| Error::database_with_source("Failed to fetch user preferences", e))?;

        match row {
            Some(r) => Ok(UserBlockPreferencesResponse::from(r)),
            None => {
                // Create default preferences
                let created = self.create_user_preferences(user_id).await?;
                Ok(UserBlockPreferencesResponse::from(created))
            }
        }
    }

    /// Create default user preferences
    async fn create_user_preferences(&self, user_id: Uuid) -> Result<UserBlockPreferencesRow> {
        let row: UserBlockPreferencesRow = sqlx::query_as(
            r#"
            INSERT INTO user_block_preferences (user_id, recent_blocks, favorite_blocks, block_settings)
            VALUES ($1, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb)
            ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
            RETURNING *
            "#
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to create user preferences", e))?;

        Ok(row)
    }

    /// Update user's recent blocks
    pub async fn update_recent_blocks(
        &self,
        user_id: Uuid,
        request: UpdateRecentBlocksRequest,
    ) -> Result<UserBlockPreferencesResponse> {
        // Get current preferences or create them
        let prefs = self.get_user_preferences(user_id).await?;

        // Add block to recent list (max 20, most recent first)
        let mut recent = prefs.recent_blocks;
        recent.retain(|b| b != &request.block_id);
        recent.insert(0, request.block_id);
        recent.truncate(20);

        let row: UserBlockPreferencesRow = sqlx::query_as(
            r#"
            UPDATE user_block_preferences
            SET recent_blocks = $2, updated_at = NOW()
            WHERE user_id = $1
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(serde_json::to_value(&recent).unwrap_or_default())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to update recent blocks", e))?;

        Ok(UserBlockPreferencesResponse::from(row))
    }

    /// Toggle a block as favorite
    pub async fn toggle_favorite_block(
        &self,
        user_id: Uuid,
        block_id: String,
    ) -> Result<BlockToggleFavoriteResponse> {
        let prefs = self.get_user_preferences(user_id).await?;

        let mut favorites = prefs.favorite_blocks;
        let is_favorite = if favorites.contains(&block_id) {
            favorites.retain(|b| b != &block_id);
            false
        } else {
            favorites.push(block_id.clone());
            true
        };

        sqlx::query(
            r#"
            UPDATE user_block_preferences
            SET favorite_blocks = $2, updated_at = NOW()
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .bind(serde_json::to_value(&favorites).unwrap_or_default())
        .execute(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to update favorite blocks", e))?;

        Ok(BlockToggleFavoriteResponse {
            block_id,
            is_favorite,
        })
    }

    /// Update user's block settings
    pub async fn update_block_settings(
        &self,
        user_id: Uuid,
        request: UpdateBlockSettingsRequest,
    ) -> Result<UserBlockPreferencesResponse> {
        let row: UserBlockPreferencesRow = sqlx::query_as(
            r#"
            UPDATE user_block_preferences
            SET block_settings = $2, updated_at = NOW()
            WHERE user_id = $1
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(&request.settings)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to update block settings", e))?;

        Ok(UserBlockPreferencesResponse::from(row))
    }

    /// List custom blocks
    pub async fn list_custom_blocks(
        &self,
        user_id: Uuid,
        params: CustomBlockListQuery,
    ) -> Result<CustomBlockListResponse> {
        let page = params.page.unwrap_or(1).max(1);
        let per_page = params.per_page.unwrap_or(20).min(100).max(1);
        let offset = (page - 1) * per_page;

        let mut conditions = vec!["(user_id = $1 OR is_global = TRUE)".to_string()];

        if let Some(ref category) = params.category {
            conditions.push(format!("category = '{}'", category.replace('\'', "''")));
        }

        if let Some(ref search) = params.search {
            let escaped = search.replace('\'', "''");
            conditions.push(format!(
                "(name ILIKE '%{}%' OR description ILIKE '%{}%')",
                escaped, escaped
            ));
        }

        if let Some(is_global) = params.is_global {
            conditions.push(format!("is_global = {}", is_global));
        }

        let where_clause = conditions.join(" AND ");

        // Count query
        let count_query = format!("SELECT COUNT(*) FROM custom_blocks WHERE {}", where_clause);
        let total: (i64,) = sqlx::query_as(&count_query)
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to count custom blocks", e))?;

        // Data query
        let data_query = format!(
            "SELECT * FROM custom_blocks WHERE {} ORDER BY created_at DESC LIMIT {} OFFSET {}",
            where_clause, per_page, offset
        );
        let rows: Vec<CustomBlockRow> = sqlx::query_as(&data_query)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to list custom blocks", e))?;

        let items: Vec<CustomBlockResponse> =
            rows.into_iter().map(CustomBlockResponse::from).collect();
        let total_pages = ((total.0 as f64) / (per_page as f64)).ceil() as u64;

        Ok(CustomBlockListResponse {
            items,
            total: total.0 as u64,
            page: page as u64,
            per_page: per_page as u64,
            total_pages,
        })
    }

    /// Get a custom block by ID
    pub async fn get_custom_block(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<CustomBlockResponse>> {
        let row: Option<CustomBlockRow> = sqlx::query_as(
            "SELECT * FROM custom_blocks WHERE id = $1 AND (user_id = $2 OR is_global = TRUE)",
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to fetch custom block", e))?;

        Ok(row.map(CustomBlockResponse::from))
    }

    /// Create a custom block
    pub async fn create_custom_block(
        &self,
        user_id: Uuid,
        request: CreateCustomBlockRequest,
    ) -> Result<CustomBlockResponse> {
        let row: CustomBlockRow = sqlx::query_as(
            r#"
            INSERT INTO custom_blocks (user_id, name, description, category, icon, content, preview_html, settings, is_global)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            "#
        )
        .bind(user_id)
        .bind(&request.name)
        .bind(&request.description)
        .bind(request.category.as_deref().unwrap_or("custom"))
        .bind(request.icon.as_deref().unwrap_or("Box"))
        .bind(&request.content)
        .bind(&request.preview_html)
        .bind(request.settings.as_ref().unwrap_or(&serde_json::json!({})))
        .bind(request.is_global.unwrap_or(false))
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to create custom block", e))?;

        Ok(CustomBlockResponse::from(row))
    }

    /// Update a custom block
    pub async fn update_custom_block(
        &self,
        id: Uuid,
        user_id: Uuid,
        request: UpdateCustomBlockRequest,
    ) -> Result<CustomBlockResponse> {
        // Verify ownership
        let existing = self
            .get_custom_block(id, user_id)
            .await?
            .ok_or_else(|| Error::not_found("Custom block", id.to_string()))?;

        if existing.user_id != user_id {
            return Err(Error::forbidden(
                "You can only update your own custom blocks",
            ));
        }

        let row: CustomBlockRow = sqlx::query_as(
            r#"
            UPDATE custom_blocks
            SET
                name = COALESCE($3, name),
                description = COALESCE($4, description),
                category = COALESCE($5, category),
                icon = COALESCE($6, icon),
                content = COALESCE($7, content),
                preview_html = COALESCE($8, preview_html),
                settings = COALESCE($9, settings),
                is_global = COALESCE($10, is_global),
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(user_id)
        .bind(&request.name)
        .bind(&request.description)
        .bind(&request.category)
        .bind(&request.icon)
        .bind(&request.content)
        .bind(&request.preview_html)
        .bind(&request.settings)
        .bind(request.is_global)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to update custom block", e))?;

        Ok(CustomBlockResponse::from(row))
    }

    /// Delete a custom block
    pub async fn delete_custom_block(&self, id: Uuid, user_id: Uuid) -> Result<bool> {
        let existing = self
            .get_custom_block(id, user_id)
            .await?
            .ok_or_else(|| Error::not_found("Custom block", id.to_string()))?;

        if existing.user_id != user_id {
            return Err(Error::forbidden(
                "You can only delete your own custom blocks",
            ));
        }

        sqlx::query("DELETE FROM custom_blocks WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to delete custom block", e))?;

        Ok(true)
    }

    /// Track block usage for analytics
    pub async fn track_usage(
        &self,
        user_id: Option<Uuid>,
        request: TrackBlockUsageRequest,
    ) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO block_usage_analytics (user_id, block_id, block_type, post_id, action, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#
        )
        .bind(user_id)
        .bind(&request.block_id)
        .bind(&request.block_type)
        .bind(request.post_id)
        .bind(request.action.as_deref().unwrap_or("insert"))
        .bind(request.metadata.as_ref().unwrap_or(&serde_json::json!({})))
        .execute(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to track block usage", e))?;

        // Update custom block usage count if applicable
        if request.block_type == "custom" {
            if let Ok(block_uuid) = Uuid::parse_str(&request.block_id) {
                let _ = sqlx::query(
                    "UPDATE custom_blocks SET usage_count = usage_count + 1 WHERE id = $1",
                )
                .bind(block_uuid)
                .execute(&self.pool)
                .await;
            }
        }

        Ok(())
    }

    /// Get block usage analytics
    pub async fn get_analytics(&self, user_id: Uuid) -> Result<BlockAnalyticsResponse> {
        // Total insertions
        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM block_usage_analytics WHERE user_id = $1 AND action = 'insert'",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to count insertions", e))?;

        // Unique blocks used
        let unique: (i64,) = sqlx::query_as(
            "SELECT COUNT(DISTINCT block_id) FROM block_usage_analytics WHERE user_id = $1",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to count unique blocks", e))?;

        // Most used blocks
        let most_used: Vec<(String, String, i64, DateTime<Utc>)> = sqlx::query_as(
            r#"
            SELECT block_id, block_type, COUNT(*) as count, MAX(created_at) as last_used
            FROM block_usage_analytics
            WHERE user_id = $1
            GROUP BY block_id, block_type
            ORDER BY count DESC
            LIMIT 10
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to get most used blocks", e))?;

        // Recent activity
        let recent: Vec<(String, String, i64, DateTime<Utc>)> = sqlx::query_as(
            r#"
            SELECT block_id, block_type, COUNT(*) as count, MAX(created_at) as last_used
            FROM block_usage_analytics
            WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
            GROUP BY block_id, block_type
            ORDER BY last_used DESC
            LIMIT 10
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to get recent activity", e))?;

        Ok(BlockAnalyticsResponse {
            total_insertions: total.0,
            unique_blocks_used: unique.0,
            most_used_blocks: most_used
                .into_iter()
                .map(|(id, t, c, l)| BlockUsageEntry {
                    block_id: id,
                    block_type: t,
                    usage_count: c,
                    last_used: l,
                })
                .collect(),
            recent_activity: recent
                .into_iter()
                .map(|(id, t, c, l)| BlockUsageEntry {
                    block_id: id,
                    block_type: t,
                    usage_count: c,
                    last_used: l,
                })
                .collect(),
        })
    }

    /// Get complete block library
    pub async fn get_block_library(&self, user_id: Uuid) -> Result<BlockLibraryResponse> {
        let blocks = Self::get_builtin_blocks();
        let categories = self.get_categories().await?;
        let prefs = self.get_user_preferences(user_id).await?;

        let custom_list = self
            .list_custom_blocks(user_id, CustomBlockListQuery::default())
            .await?;

        Ok(BlockLibraryResponse {
            blocks,
            categories,
            custom_blocks: custom_list.items,
            recent_blocks: prefs.recent_blocks,
            favorite_blocks: prefs.favorite_blocks,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builtin_blocks() {
        let blocks = BlockService::get_builtin_blocks();
        assert!(!blocks.is_empty());

        // Check that all blocks have required fields
        for block in &blocks {
            assert!(!block.id.is_empty());
            assert!(!block.name.is_empty());
            assert!(!block.category.is_empty());
        }
    }

    #[test]
    fn test_block_categories() {
        let blocks = BlockService::get_builtin_blocks();
        let categories: std::collections::HashSet<_> = blocks.iter().map(|b| &b.category).collect();

        assert!(categories.contains(&"text".to_string()));
        assert!(categories.contains(&"media".to_string()));
        assert!(categories.contains(&"layout".to_string()));
    }
}
