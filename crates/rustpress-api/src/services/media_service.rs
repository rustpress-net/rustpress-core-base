//! Media service for handling media-related business logic.
//!
//! This module provides comprehensive media management including:
//! - File upload, listing, and deletion
//! - Folder organization and navigation
//! - Image optimization and variant generation
//! - Usage tracking and analytics
//! - Bulk operations

use chrono::{DateTime, Utc};
use rustpress_core::error::{Error, Result};
use rustpress_core::service::SortOrder;
use rustpress_database::models::MediaRow;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::handlers::media::{
    BulkDeleteResponse, BulkDeleteError, BulkMoveRequest, BulkTagRequest,
    MediaFolder, MediaItem, MediaLibraryResponse, MediaStats, MediaVariant,
    OptimizationResult, OptimizeOptions, PaginatedMediaResponse, UserMediaPreferences,
    MediaUsage, MediaAnalytics, DateCount, ReferrerStat,
};

/// Media types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Image,
    Video,
    Audio,
    Document,
    Archive,
    Other,
}

impl MediaType {
    pub fn from_mime(mime: &str) -> Self {
        if mime.starts_with("image/") {
            Self::Image
        } else if mime.starts_with("video/") {
            Self::Video
        } else if mime.starts_with("audio/") {
            Self::Audio
        } else if mime == "application/pdf"
            || mime.contains("document")
            || mime.contains("text/")
            || mime.contains("spreadsheet")
            || mime.contains("presentation")
        {
            Self::Document
        } else if mime.contains("zip")
            || mime.contains("rar")
            || mime.contains("tar")
            || mime.contains("gzip")
        {
            Self::Archive
        } else {
            Self::Other
        }
    }
}

/// Media response for API
#[derive(Debug, Clone, Serialize)]
pub struct MediaResponse {
    pub id: Uuid,
    pub uploader_id: Option<Uuid>,
    pub filename: String,
    pub original_filename: String,
    pub mime_type: String,
    pub media_type: String,
    pub file_size: i64,
    pub storage_path: String,
    pub url: Option<String>,
    pub alt_text: Option<String>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub duration: Option<i32>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Paginated media response
#[derive(Debug, Clone, Serialize)]
pub struct MediaListResponse {
    pub items: Vec<MediaResponse>,
    pub total: u64,
    pub page: u64,
    pub per_page: u64,
    pub total_pages: u64,
}

/// Upload media request (metadata)
#[derive(Debug, Clone, Deserialize)]
pub struct UploadMediaMetadata {
    pub alt_text: Option<String>,
    pub title: Option<String>,
    pub description: Option<String>,
}

/// Update media request
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateMediaRequest {
    pub alt_text: Option<String>,
    pub title: Option<String>,
    pub description: Option<String>,
}

/// Media list query parameters
#[derive(Debug, Clone, Deserialize, Default)]
pub struct MediaListParams {
    pub page: Option<u32>,
    pub per_page: Option<u32>,
    pub media_type: Option<String>,
    pub mime_type: Option<String>,
    pub uploader_id: Option<Uuid>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}

impl From<MediaRow> for MediaResponse {
    fn from(row: MediaRow) -> Self {
        let media_type = MediaType::from_mime(&row.mime_type);
        Self {
            id: row.id,
            uploader_id: row.uploader_id,
            filename: row.filename,
            original_filename: row.original_filename,
            mime_type: row.mime_type,
            media_type: format!("{:?}", media_type).to_lowercase(),
            file_size: row.file_size,
            storage_path: row.storage_path.clone(),
            url: Some(format!("/uploads/{}", row.storage_path)),
            alt_text: row.alt_text,
            title: row.title,
            description: row.description,
            width: row.width,
            height: row.height,
            duration: row.duration,
            metadata: row.metadata,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

/// Media service for handling media operations
#[derive(Clone)]
pub struct MediaService {
    pool: PgPool,
    tenant_id: Option<Uuid>,
    base_url: String,
}

impl MediaService {
    /// Create a new media service
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            tenant_id: None,
            base_url: String::new(),
        }
    }

    /// Set the tenant ID for multi-site support
    pub fn with_tenant(mut self, tenant_id: Uuid) -> Self {
        self.tenant_id = Some(tenant_id);
        self
    }

    /// Set the base URL for media URLs
    pub fn with_base_url(mut self, base_url: String) -> Self {
        self.base_url = base_url;
        self
    }

    /// Site condition for queries
    fn site_condition(&self) -> String {
        match self.tenant_id {
            Some(id) => format!("site_id = '{}'", id),
            None => "site_id IS NULL".to_string(),
        }
    }

    /// Upload a new media file
    pub async fn upload_media(
        &self,
        uploader_id: Uuid,
        filename: String,
        original_filename: String,
        mime_type: String,
        file_size: i64,
        storage_path: String,
        metadata: Option<UploadMediaMetadata>,
        dimensions: Option<(i32, i32)>,
        duration: Option<i32>,
    ) -> Result<MediaResponse> {
        let now = Utc::now();
        let media_metadata = metadata.unwrap_or(UploadMediaMetadata {
            alt_text: None,
            title: None,
            description: None,
        });

        let media = MediaRow {
            id: Uuid::now_v7(),
            tenant_id: self.tenant_id,
            uploader_id: Some(uploader_id),
            filename,
            original_filename,
            mime_type,
            file_size,
            storage_path,
            storage_backend: Some("local".to_string()),
            alt_text: media_metadata.alt_text,
            title: media_metadata.title,
            description: media_metadata.description,
            width: dimensions.map(|(w, _)| w),
            height: dimensions.map(|(_, h)| h),
            duration,
            metadata: serde_json::json!({}),
            created_at: now,
            updated_at: now,
            deleted_at: None,
        };

        let created = self.create(&media).await?;
        Ok(MediaResponse::from(created))
    }

    /// List media with pagination and filtering
    pub async fn list_media(&self, params: MediaListParams) -> Result<MediaListResponse> {
        let page = params.page.unwrap_or(1).max(1);
        let per_page = params.per_page.unwrap_or(20).min(100).max(1);

        let sort_order = match params.sort_order.as_deref() {
            Some("asc") => SortOrder::Asc,
            _ => SortOrder::Desc,
        };

        let mut conditions = vec![self.site_condition()];
        conditions.push("deleted_at IS NULL".to_string());

        if let Some(ref mime_type) = params.mime_type {
            conditions.push(format!(
                "mime_type LIKE '{}%'",
                mime_type.replace('\'', "''")
            ));
        }

        if let Some(uploader_id) = params.uploader_id {
            conditions.push(format!("uploader_id = '{}'", uploader_id));
        }

        if let Some(ref search) = params.search {
            let escaped = search.replace('\'', "''");
            conditions.push(format!(
                "(filename ILIKE '%{}%' OR original_filename ILIKE '%{}%' OR title ILIKE '%{}%' OR alt_text ILIKE '%{}%')",
                escaped, escaped, escaped, escaped
            ));
        }

        let where_clause = conditions.join(" AND ");
        let order_by = params.sort_by.as_deref().unwrap_or("created_at");
        let order_dir = if sort_order == SortOrder::Desc {
            "DESC"
        } else {
            "ASC"
        };

        // Count query
        let count_query = format!("SELECT COUNT(*) as count FROM media WHERE {}", where_clause);
        let total: (i64,) = sqlx::query_as(&count_query)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to count media", e))?;

        // Data query
        let offset = (page - 1) * per_page;
        let data_query = format!(
            "SELECT * FROM media WHERE {} ORDER BY {} {} LIMIT {} OFFSET {}",
            where_clause, order_by, order_dir, per_page, offset
        );

        let rows: Vec<MediaRow> = sqlx::query_as(&data_query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to list media", e))?;

        let items: Vec<MediaResponse> = rows.into_iter().map(MediaResponse::from).collect();
        let total_pages = ((total.0 as f64) / (per_page as f64)).ceil() as u64;

        Ok(MediaListResponse {
            items,
            total: total.0 as u64,
            page: page.into(),
            per_page: per_page.into(),
            total_pages,
        })
    }

    /// Get a media item by ID
    pub async fn get_media(&self, id: Uuid) -> Result<Option<MediaResponse>> {
        let media = self.find_by_id(id).await?;
        Ok(media.map(MediaResponse::from))
    }

    /// Update media metadata
    pub async fn update_media(
        &self,
        id: Uuid,
        request: UpdateMediaRequest,
    ) -> Result<MediaResponse> {
        let existing = self
            .find_by_id(id)
            .await?
            .ok_or_else(|| Error::not_found("Media", id.to_string()))?;

        let query = r#"
            UPDATE media SET
                alt_text = $2,
                title = $3,
                description = $4,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        "#;

        let updated: MediaRow = sqlx::query_as(query)
            .bind(id)
            .bind(request.alt_text.or(existing.alt_text))
            .bind(request.title.or(existing.title))
            .bind(request.description.or(existing.description))
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to update media", e))?;

        Ok(MediaResponse::from(updated))
    }

    /// Delete a media item (soft delete)
    pub async fn delete_media(&self, id: Uuid) -> Result<bool> {
        let _ = self
            .find_by_id(id)
            .await?
            .ok_or_else(|| Error::not_found("Media", id.to_string()))?;

        sqlx::query("UPDATE media SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to delete media", e))?;

        Ok(true)
    }

    /// Get media by storage path
    pub async fn get_by_path(&self, path: &str) -> Result<Option<MediaResponse>> {
        let query = format!(
            "SELECT * FROM media WHERE storage_path = $1 AND {} AND deleted_at IS NULL",
            self.site_condition()
        );

        let media: Option<MediaRow> = sqlx::query_as(&query)
            .bind(path)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to find media by path", e))?;

        Ok(media.map(MediaResponse::from))
    }

    /// Get storage stats
    pub async fn get_storage_stats(&self) -> Result<StorageStats> {
        let query = format!(
            r#"
            SELECT
                COUNT(*) as file_count,
                COALESCE(SUM(file_size), 0) as total_size,
                COUNT(DISTINCT mime_type) as mime_type_count
            FROM media
            WHERE {} AND deleted_at IS NULL
            "#,
            self.site_condition()
        );

        let stats: (i64, i64, i64) = sqlx::query_as(&query)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get storage stats", e))?;

        // Get breakdown by mime type
        let breakdown_query = format!(
            r#"
            SELECT
                CASE
                    WHEN mime_type LIKE 'image/%' THEN 'image'
                    WHEN mime_type LIKE 'video/%' THEN 'video'
                    WHEN mime_type LIKE 'audio/%' THEN 'audio'
                    ELSE 'other'
                END as media_type,
                COUNT(*) as count,
                COALESCE(SUM(file_size), 0) as size
            FROM media
            WHERE {} AND deleted_at IS NULL
            GROUP BY 1
            "#,
            self.site_condition()
        );

        let breakdown: Vec<(String, i64, i64)> = sqlx::query_as(&breakdown_query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get storage breakdown", e))?;

        Ok(StorageStats {
            total_files: stats.0 as u64,
            total_size: stats.1 as u64,
            breakdown: breakdown
                .into_iter()
                .map(|(t, c, s)| MediaTypeStats {
                    media_type: t,
                    count: c as u64,
                    size: s as u64,
                })
                .collect(),
        })
    }

    // =====================
    // Database operations
    // =====================

    async fn find_by_id(&self, id: Uuid) -> Result<Option<MediaRow>> {
        let query = format!(
            "SELECT * FROM media WHERE id = $1 AND {} AND deleted_at IS NULL",
            self.site_condition()
        );

        sqlx::query_as::<_, MediaRow>(&query)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to find media", e))
    }

    async fn create(&self, media: &MediaRow) -> Result<MediaRow> {
        sqlx::query_as::<_, MediaRow>(
            r#"
            INSERT INTO media (id, site_id, uploader_id, filename, original_filename, mime_type, file_size, storage_path, storage_backend, alt_text, title, description, width, height, duration, metadata, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
            "#,
        )
        .bind(media.id)
        .bind(media.tenant_id)
        .bind(media.uploader_id)
        .bind(&media.filename)
        .bind(&media.original_filename)
        .bind(&media.mime_type)
        .bind(media.file_size)
        .bind(&media.storage_path)
        .bind(&media.storage_backend)
        .bind(&media.alt_text)
        .bind(&media.title)
        .bind(&media.description)
        .bind(media.width)
        .bind(media.height)
        .bind(media.duration)
        .bind(&media.metadata)
        .bind(media.created_at)
        .bind(media.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| Error::database_with_source("Failed to create media", e))
    }

    // =====================
    // FOLDER OPERATIONS
    // =====================

    /// List all folders with hierarchy
    pub async fn list_folders(&self) -> Result<Vec<MediaFolder>> {
        let query = r#"
            SELECT
                mf.id, mf.name, mf.slug, mf.description, mf.parent_id, mf.user_id,
                mf.color, mf.icon, mf.item_count, mf.total_size, mf.is_system,
                mf.sort_order, mf.created_at, mf.updated_at
            FROM media_folders mf
            WHERE mf.parent_id IS NULL
            ORDER BY mf.sort_order, mf.name
        "#;

        let rows: Vec<FolderRow> = sqlx::query_as(query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to list folders", e))?;

        let mut folders = Vec::new();
        for row in rows {
            let children = self.get_folder_children(row.id).await?;
            folders.push(MediaFolder {
                id: row.id,
                name: row.name,
                slug: row.slug,
                description: row.description,
                parent_id: row.parent_id,
                user_id: row.user_id,
                color: row.color,
                icon: row.icon,
                item_count: row.item_count,
                total_size: row.total_size,
                is_system: row.is_system,
                sort_order: row.sort_order,
                children,
                created_at: row.created_at,
                updated_at: row.updated_at,
            });
        }

        Ok(folders)
    }

    /// Get folder children recursively
    fn get_folder_children(&self, parent_id: Uuid) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<MediaFolder>>> + Send + '_>> {
        Box::pin(async move {
            let query = r#"
                SELECT
                    id, name, slug, description, parent_id, user_id,
                    color, icon, item_count, total_size, is_system,
                    sort_order, created_at, updated_at
                FROM media_folders
                WHERE parent_id = $1
                ORDER BY sort_order, name
            "#;

            let rows: Vec<FolderRow> = sqlx::query_as(query)
                .bind(parent_id)
                .fetch_all(&self.pool)
                .await
                .map_err(|e| Error::database_with_source("Failed to get folder children", e))?;

            let mut folders = Vec::new();
            for row in rows {
                let children = self.get_folder_children(row.id).await?;
                folders.push(MediaFolder {
                    id: row.id,
                    name: row.name,
                    slug: row.slug,
                    description: row.description,
                    parent_id: row.parent_id,
                    user_id: row.user_id,
                    color: row.color,
                    icon: row.icon,
                    item_count: row.item_count,
                    total_size: row.total_size,
                    is_system: row.is_system,
                    sort_order: row.sort_order,
                    children,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                });
            }

            Ok(folders)
        })
    }

    /// Get a single folder by ID
    pub async fn get_folder(&self, id: Uuid) -> Result<Option<MediaFolder>> {
        let query = r#"
            SELECT
                id, name, slug, description, parent_id, user_id,
                color, icon, item_count, total_size, is_system,
                sort_order, created_at, updated_at
            FROM media_folders
            WHERE id = $1
        "#;

        let row: Option<FolderRow> = sqlx::query_as(query)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get folder", e))?;

        match row {
            Some(r) => {
                let children = self.get_folder_children(r.id).await?;
                Ok(Some(MediaFolder {
                    id: r.id,
                    name: r.name,
                    slug: r.slug,
                    description: r.description,
                    parent_id: r.parent_id,
                    user_id: r.user_id,
                    color: r.color,
                    icon: r.icon,
                    item_count: r.item_count,
                    total_size: r.total_size,
                    is_system: r.is_system,
                    sort_order: r.sort_order,
                    children,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                }))
            }
            None => Ok(None),
        }
    }

    /// Create a new folder
    pub async fn create_folder(
        &self,
        user_id: Uuid,
        name: String,
        description: Option<String>,
        parent_id: Option<Uuid>,
        color: Option<String>,
        icon: Option<String>,
    ) -> Result<MediaFolder> {
        let slug = slugify(&name);
        let color = color.unwrap_or_else(|| "#6366f1".to_string());
        let icon = icon.unwrap_or_else(|| "folder".to_string());

        let query = r#"
            INSERT INTO media_folders (name, slug, description, parent_id, user_id, color, icon)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, slug, description, parent_id, user_id, color, icon,
                      item_count, total_size, is_system, sort_order, created_at, updated_at
        "#;

        let row: FolderRow = sqlx::query_as(query)
            .bind(&name)
            .bind(&slug)
            .bind(&description)
            .bind(parent_id)
            .bind(user_id)
            .bind(&color)
            .bind(&icon)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to create folder", e))?;

        Ok(MediaFolder {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            parent_id: row.parent_id,
            user_id: row.user_id,
            color: row.color,
            icon: row.icon,
            item_count: row.item_count,
            total_size: row.total_size,
            is_system: row.is_system,
            sort_order: row.sort_order,
            children: vec![],
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }

    /// Update a folder
    pub async fn update_folder(
        &self,
        id: Uuid,
        name: Option<String>,
        description: Option<String>,
        parent_id: Option<Option<Uuid>>,
        color: Option<String>,
        icon: Option<String>,
        sort_order: Option<i32>,
    ) -> Result<MediaFolder> {
        let existing = self.get_folder(id).await?
            .ok_or_else(|| Error::not_found("Folder", id.to_string()))?;

        if existing.is_system {
            return Err(Error::validation("Cannot modify system folders"));
        }

        let new_name = name.unwrap_or(existing.name);
        let new_slug = slugify(&new_name);

        let query = r#"
            UPDATE media_folders SET
                name = $2,
                slug = $3,
                description = $4,
                parent_id = $5,
                color = $6,
                icon = $7,
                sort_order = $8,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, slug, description, parent_id, user_id, color, icon,
                      item_count, total_size, is_system, sort_order, created_at, updated_at
        "#;

        let row: FolderRow = sqlx::query_as(query)
            .bind(id)
            .bind(&new_name)
            .bind(&new_slug)
            .bind(description.or(existing.description))
            .bind(parent_id.unwrap_or(existing.parent_id))
            .bind(color.unwrap_or(existing.color))
            .bind(icon.unwrap_or(existing.icon))
            .bind(sort_order.unwrap_or(existing.sort_order))
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to update folder", e))?;

        let children = self.get_folder_children(row.id).await?;

        Ok(MediaFolder {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            parent_id: row.parent_id,
            user_id: row.user_id,
            color: row.color,
            icon: row.icon,
            item_count: row.item_count,
            total_size: row.total_size,
            is_system: row.is_system,
            sort_order: row.sort_order,
            children,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }

    /// Delete a folder
    pub async fn delete_folder(&self, id: Uuid, move_contents_to: Option<Uuid>) -> Result<bool> {
        let folder = self.get_folder(id).await?
            .ok_or_else(|| Error::not_found("Folder", id.to_string()))?;

        if folder.is_system {
            return Err(Error::validation("Cannot delete system folders"));
        }

        // Move contents if specified
        if let Some(target_folder) = move_contents_to {
            sqlx::query("UPDATE media SET folder_id = $2 WHERE folder_id = $1")
                .bind(id)
                .bind(target_folder)
                .execute(&self.pool)
                .await
                .map_err(|e| Error::database_with_source("Failed to move folder contents", e))?;
        } else {
            // Remove folder reference from media
            sqlx::query("UPDATE media SET folder_id = NULL WHERE folder_id = $1")
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(|e| Error::database_with_source("Failed to unlink folder contents", e))?;
        }

        // Move child folders to parent
        sqlx::query("UPDATE media_folders SET parent_id = $2 WHERE parent_id = $1")
            .bind(id)
            .bind(folder.parent_id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to reassign child folders", e))?;

        // Delete the folder
        sqlx::query("DELETE FROM media_folders WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to delete folder", e))?;

        Ok(true)
    }

    // =====================
    // BULK OPERATIONS
    // =====================

    /// Move multiple media items to a folder
    pub async fn bulk_move(&self, media_ids: Vec<Uuid>, folder_id: Option<Uuid>) -> Result<usize> {
        if media_ids.is_empty() {
            return Ok(0);
        }

        let query = "UPDATE media SET folder_id = $1, updated_at = NOW() WHERE id = ANY($2)";
        let result = sqlx::query(query)
            .bind(folder_id)
            .bind(&media_ids)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to bulk move media", e))?;

        Ok(result.rows_affected() as usize)
    }

    /// Delete multiple media items
    pub async fn bulk_delete(&self, media_ids: Vec<Uuid>, permanent: bool) -> Result<BulkDeleteResponse> {
        let mut deleted = Vec::new();
        let mut failed = Vec::new();

        for id in media_ids {
            match if permanent {
                self.permanent_delete_media(id).await
            } else {
                self.delete_media(id).await
            } {
                Ok(_) => deleted.push(id),
                Err(e) => failed.push(BulkDeleteError {
                    media_id: id,
                    error: e.to_string(),
                }),
            }
        }

        Ok(BulkDeleteResponse {
            total_deleted: deleted.len(),
            deleted,
            failed,
        })
    }

    /// Permanently delete a media item
    pub async fn permanent_delete_media(&self, id: Uuid) -> Result<bool> {
        // Delete variants first
        sqlx::query("DELETE FROM media_variants WHERE media_id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to delete media variants", e))?;

        // Delete usage records
        sqlx::query("DELETE FROM media_usage WHERE media_id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to delete media usage", e))?;

        // Delete the media record
        sqlx::query("DELETE FROM media WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to permanently delete media", e))?;

        Ok(true)
    }

    /// Add/remove tags from multiple media items
    pub async fn bulk_tag(&self, media_ids: Vec<Uuid>, add_tags: Option<Vec<String>>, remove_tags: Option<Vec<String>>) -> Result<usize> {
        if media_ids.is_empty() {
            return Ok(0);
        }

        let mut affected = 0;

        // Add tags
        if let Some(tags_to_add) = add_tags {
            if !tags_to_add.is_empty() {
                let query = r#"
                    UPDATE media SET
                        tags = array_cat(COALESCE(tags, ARRAY[]::TEXT[]), $1::TEXT[]),
                        updated_at = NOW()
                    WHERE id = ANY($2)
                "#;
                let result = sqlx::query(query)
                    .bind(&tags_to_add)
                    .bind(&media_ids)
                    .execute(&self.pool)
                    .await
                    .map_err(|e| Error::database_with_source("Failed to add tags", e))?;
                affected = result.rows_affected() as usize;
            }
        }

        // Remove tags
        if let Some(tags_to_remove) = remove_tags {
            if !tags_to_remove.is_empty() {
                let query = r#"
                    UPDATE media SET
                        tags = array_remove_all(COALESCE(tags, ARRAY[]::TEXT[]), $1::TEXT[]),
                        updated_at = NOW()
                    WHERE id = ANY($2)
                "#;
                let result = sqlx::query(query)
                    .bind(&tags_to_remove)
                    .bind(&media_ids)
                    .execute(&self.pool)
                    .await
                    .map_err(|e| Error::database_with_source("Failed to remove tags", e))?;
                affected = result.rows_affected() as usize;
            }
        }

        Ok(affected)
    }

    // =====================
    // OPTIMIZATION
    // =====================

    /// Queue media for optimization
    pub async fn queue_optimization(&self, media_id: Uuid, options: OptimizeOptions) -> Result<Uuid> {
        let query = r#"
            INSERT INTO media_optimization_queue (media_id, options)
            VALUES ($1, $2)
            RETURNING id
        "#;

        let (id,): (Uuid,) = sqlx::query_as(query)
            .bind(media_id)
            .bind(serde_json::to_value(&options).unwrap_or_default())
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to queue optimization", e))?;

        Ok(id)
    }

    /// Mark media as optimized
    pub async fn mark_optimized(
        &self,
        media_id: Uuid,
        original_size: i64,
        optimized_url: String,
        blurhash: Option<String>,
        dominant_color: Option<String>,
    ) -> Result<()> {
        let query = r#"
            UPDATE media SET
                is_optimized = TRUE,
                original_size = $2,
                optimized_url = $3,
                blurhash = $4,
                dominant_color = $5,
                updated_at = NOW()
            WHERE id = $1
        "#;

        sqlx::query(query)
            .bind(media_id)
            .bind(original_size)
            .bind(&optimized_url)
            .bind(&blurhash)
            .bind(&dominant_color)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to mark media as optimized", e))?;

        Ok(())
    }

    /// Create a media variant
    pub async fn create_variant(
        &self,
        media_id: Uuid,
        variant_type: String,
        filename: String,
        url: String,
        width: Option<i32>,
        height: Option<i32>,
        file_size: Option<i64>,
        mime_type: String,
    ) -> Result<MediaVariant> {
        let query = r#"
            INSERT INTO media_variants (media_id, variant_type, filename, url, width, height, file_size, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, variant_type, filename, url, width, height, file_size, mime_type
        "#;

        let row: VariantRow = sqlx::query_as(query)
            .bind(media_id)
            .bind(&variant_type)
            .bind(&filename)
            .bind(&url)
            .bind(width)
            .bind(height)
            .bind(file_size)
            .bind(&mime_type)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to create variant", e))?;

        Ok(MediaVariant {
            id: row.id,
            variant_type: row.variant_type,
            filename: row.filename,
            url: row.url,
            width: row.width,
            height: row.height,
            file_size: row.file_size,
            mime_type: row.mime_type,
        })
    }

    /// Get variants for a media item
    pub async fn get_variants(&self, media_id: Uuid) -> Result<Vec<MediaVariant>> {
        let query = r#"
            SELECT id, variant_type, filename, url, width, height, file_size, mime_type
            FROM media_variants
            WHERE media_id = $1
            ORDER BY variant_type
        "#;

        let rows: Vec<VariantRow> = sqlx::query_as(query)
            .bind(media_id)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get variants", e))?;

        Ok(rows.into_iter().map(|r| MediaVariant {
            id: r.id,
            variant_type: r.variant_type,
            filename: r.filename,
            url: r.url,
            width: r.width,
            height: r.height,
            file_size: r.file_size,
            mime_type: r.mime_type,
        }).collect())
    }

    // =====================
    // USAGE TRACKING
    // =====================

    /// Track media usage in content
    pub async fn track_usage(
        &self,
        media_id: Uuid,
        entity_type: String,
        entity_id: Uuid,
        context: Option<String>,
    ) -> Result<()> {
        let query = r#"
            INSERT INTO media_usage (media_id, entity_type, entity_id, context)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (media_id, entity_type, entity_id, context) DO NOTHING
        "#;

        sqlx::query(query)
            .bind(media_id)
            .bind(&entity_type)
            .bind(entity_id)
            .bind(&context)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to track usage", e))?;

        Ok(())
    }

    /// Remove usage tracking
    pub async fn remove_usage(
        &self,
        media_id: Uuid,
        entity_type: String,
        entity_id: Uuid,
    ) -> Result<()> {
        let query = "DELETE FROM media_usage WHERE media_id = $1 AND entity_type = $2 AND entity_id = $3";

        sqlx::query(query)
            .bind(media_id)
            .bind(&entity_type)
            .bind(entity_id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to remove usage", e))?;

        Ok(())
    }

    /// Get usage locations for media
    pub async fn get_usage(&self, media_id: Uuid) -> Result<Vec<MediaUsage>> {
        let query = r#"
            SELECT mu.id, mu.media_id, mu.entity_type, mu.entity_id, mu.context, mu.created_at,
                   CASE
                       WHEN mu.entity_type = 'post' THEN (SELECT title FROM posts WHERE id = mu.entity_id)
                       WHEN mu.entity_type = 'page' THEN (SELECT title FROM pages WHERE id = mu.entity_id)
                       ELSE NULL
                   END as entity_title
            FROM media_usage mu
            WHERE mu.media_id = $1
            ORDER BY mu.created_at DESC
        "#;

        let rows: Vec<UsageRow> = sqlx::query_as(query)
            .bind(media_id)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get usage", e))?;

        Ok(rows.into_iter().map(|r| MediaUsage {
            id: r.id,
            media_id: r.media_id,
            entity_type: r.entity_type,
            entity_id: r.entity_id,
            entity_title: r.entity_title,
            context: r.context,
            created_at: r.created_at,
        }).collect())
    }

    // =====================
    // FAVORITES & PREFERENCES
    // =====================

    /// Toggle favorite status
    pub async fn toggle_favorite(&self, media_id: Uuid) -> Result<bool> {
        let query = r#"
            UPDATE media SET
                is_favorite = NOT COALESCE(is_favorite, FALSE),
                updated_at = NOW()
            WHERE id = $1
            RETURNING is_favorite
        "#;

        let (is_favorite,): (bool,) = sqlx::query_as(query)
            .bind(media_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to toggle favorite", e))?;

        Ok(is_favorite)
    }

    /// Get user preferences
    pub async fn get_user_preferences(&self, user_id: Uuid) -> Result<Option<UserMediaPreferences>> {
        let query = r#"
            SELECT default_folder_id, view_mode, sort_by, sort_order, items_per_page,
                   auto_optimize, default_quality, generate_thumbnails, generate_webp,
                   max_upload_size, allowed_types
            FROM user_media_preferences
            WHERE user_id = $1
        "#;

        let row: Option<PreferencesRow> = sqlx::query_as(query)
            .bind(user_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get preferences", e))?;

        Ok(row.map(|r| UserMediaPreferences {
            default_folder_id: r.default_folder_id,
            view_mode: r.view_mode,
            sort_by: r.sort_by,
            sort_order: r.sort_order,
            items_per_page: r.items_per_page,
            auto_optimize: r.auto_optimize,
            default_quality: r.default_quality,
            generate_thumbnails: r.generate_thumbnails,
            generate_webp: r.generate_webp,
            max_upload_size: r.max_upload_size,
            allowed_types: r.allowed_types,
        }))
    }

    /// Update user preferences
    pub async fn update_user_preferences(
        &self,
        user_id: Uuid,
        prefs: UserMediaPreferences,
    ) -> Result<UserMediaPreferences> {
        let query = r#"
            INSERT INTO user_media_preferences
                (user_id, default_folder_id, view_mode, sort_by, sort_order, items_per_page,
                 auto_optimize, default_quality, generate_thumbnails, generate_webp,
                 max_upload_size, allowed_types)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (user_id) DO UPDATE SET
                default_folder_id = EXCLUDED.default_folder_id,
                view_mode = EXCLUDED.view_mode,
                sort_by = EXCLUDED.sort_by,
                sort_order = EXCLUDED.sort_order,
                items_per_page = EXCLUDED.items_per_page,
                auto_optimize = EXCLUDED.auto_optimize,
                default_quality = EXCLUDED.default_quality,
                generate_thumbnails = EXCLUDED.generate_thumbnails,
                generate_webp = EXCLUDED.generate_webp,
                max_upload_size = EXCLUDED.max_upload_size,
                allowed_types = EXCLUDED.allowed_types,
                updated_at = NOW()
            RETURNING default_folder_id, view_mode, sort_by, sort_order, items_per_page,
                      auto_optimize, default_quality, generate_thumbnails, generate_webp,
                      max_upload_size, allowed_types
        "#;

        let row: PreferencesRow = sqlx::query_as(query)
            .bind(user_id)
            .bind(prefs.default_folder_id)
            .bind(&prefs.view_mode)
            .bind(&prefs.sort_by)
            .bind(&prefs.sort_order)
            .bind(prefs.items_per_page)
            .bind(prefs.auto_optimize)
            .bind(prefs.default_quality)
            .bind(prefs.generate_thumbnails)
            .bind(prefs.generate_webp)
            .bind(prefs.max_upload_size)
            .bind(&prefs.allowed_types)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to update preferences", e))?;

        Ok(UserMediaPreferences {
            default_folder_id: row.default_folder_id,
            view_mode: row.view_mode,
            sort_by: row.sort_by,
            sort_order: row.sort_order,
            items_per_page: row.items_per_page,
            auto_optimize: row.auto_optimize,
            default_quality: row.default_quality,
            generate_thumbnails: row.generate_thumbnails,
            generate_webp: row.generate_webp,
            max_upload_size: row.max_upload_size,
            allowed_types: row.allowed_types,
        })
    }

    // =====================
    // LIBRARY RESPONSE
    // =====================

    /// Get full library response for modal
    pub async fn get_library(&self, user_id: Uuid, params: MediaListParams) -> Result<MediaLibraryResponse> {
        let media = self.list_media(params).await?;
        let folders = self.list_folders().await?;
        let stats = self.get_media_stats().await?;
        let user_preferences = self.get_user_preferences(user_id).await?;

        Ok(MediaLibraryResponse {
            media: PaginatedMediaResponse {
                items: media.items.into_iter().map(|m| self.convert_to_media_item(m)).collect(),
                total: media.total,
                page: media.page,
                per_page: media.per_page,
                total_pages: media.total_pages,
            },
            folders,
            stats,
            user_preferences,
        })
    }

    /// Get media statistics
    pub async fn get_media_stats(&self) -> Result<MediaStats> {
        let query = r#"
            SELECT
                COUNT(*) as total_items,
                COALESCE(SUM(file_size), 0) as total_size,
                COUNT(*) FILTER (WHERE mime_type LIKE 'image/%') as images_count,
                COUNT(*) FILTER (WHERE mime_type LIKE 'video/%') as videos_count,
                COUNT(*) FILTER (WHERE mime_type LIKE 'audio/%') as audio_count,
                COUNT(*) FILTER (WHERE mime_type LIKE 'application/pdf' OR mime_type LIKE '%document%') as documents_count,
                COUNT(*) FILTER (WHERE is_optimized = TRUE) as optimized_count,
                COALESCE(SUM(CASE WHEN is_optimized THEN original_size - file_size ELSE 0 END), 0) as total_savings,
                COUNT(*) FILTER (WHERE is_favorite = TRUE) as favorites_count
            FROM media
            WHERE deleted_at IS NULL
        "#;

        let (total_items, total_size, images_count, videos_count, audio_count, documents_count, optimized_count, total_savings, favorites_count):
            (i64, i64, i64, i64, i64, i64, i64, i64, i64) = sqlx::query_as(query)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to get media stats", e))?;

        Ok(MediaStats {
            total_items,
            total_size,
            images_count,
            videos_count,
            audio_count,
            documents_count,
            optimized_count,
            total_savings,
            favorites_count,
        })
    }

    /// Convert MediaResponse to MediaItem
    fn convert_to_media_item(&self, media: MediaResponse) -> MediaItem {
        MediaItem {
            id: media.id,
            filename: media.filename.clone(),
            original_filename: media.original_filename,
            mime_type: media.mime_type,
            file_size: media.file_size,
            width: media.width,
            height: media.height,
            duration: media.duration,
            url: media.url.unwrap_or_default(),
            thumbnail_url: None,
            alt_text: media.alt_text.unwrap_or_default(),
            caption: media.description.unwrap_or_default(),
            folder_id: None,
            folder_name: None,
            uploaded_by: media.uploader_id.unwrap_or_default(),
            uploader_name: None,
            is_optimized: false,
            original_size: None,
            optimized_url: None,
            blurhash: None,
            dominant_color: None,
            focal_point_x: 50.0,
            focal_point_y: 50.0,
            tags: vec![],
            is_favorite: false,
            view_count: 0,
            download_count: 0,
            variants: vec![],
            usage_count: 0,
            created_at: media.created_at,
            updated_at: media.updated_at,
            meta: media.metadata,
        }
    }

    // =====================
    // ANALYTICS
    // =====================

    /// Increment view count
    pub async fn increment_view(&self, media_id: Uuid) -> Result<()> {
        let query = "UPDATE media SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1";
        sqlx::query(query)
            .bind(media_id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to increment view count", e))?;
        Ok(())
    }

    /// Increment download count
    pub async fn increment_download(&self, media_id: Uuid) -> Result<()> {
        let query = "UPDATE media SET download_count = COALESCE(download_count, 0) + 1 WHERE id = $1";
        sqlx::query(query)
            .bind(media_id)
            .execute(&self.pool)
            .await
            .map_err(|e| Error::database_with_source("Failed to increment download count", e))?;
        Ok(())
    }
}

// =====================
// HELPER TYPES
// =====================

#[derive(Debug, sqlx::FromRow)]
struct FolderRow {
    id: Uuid,
    name: String,
    slug: String,
    description: Option<String>,
    parent_id: Option<Uuid>,
    user_id: Option<Uuid>,
    color: String,
    icon: String,
    item_count: i32,
    total_size: i64,
    is_system: bool,
    sort_order: i32,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
struct VariantRow {
    id: Uuid,
    variant_type: String,
    filename: String,
    url: String,
    width: Option<i32>,
    height: Option<i32>,
    file_size: Option<i64>,
    mime_type: String,
}

#[derive(Debug, sqlx::FromRow)]
struct UsageRow {
    id: Uuid,
    media_id: Uuid,
    entity_type: String,
    entity_id: Uuid,
    context: Option<String>,
    entity_title: Option<String>,
    created_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
struct PreferencesRow {
    default_folder_id: Option<Uuid>,
    view_mode: String,
    sort_by: String,
    sort_order: String,
    items_per_page: i32,
    auto_optimize: bool,
    default_quality: i32,
    generate_thumbnails: bool,
    generate_webp: bool,
    max_upload_size: i64,
    allowed_types: Vec<String>,
}

/// Generate a URL-friendly slug from a string
fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

/// Storage statistics
#[derive(Debug, Clone, Serialize)]
pub struct StorageStats {
    pub total_files: u64,
    pub total_size: u64,
    pub breakdown: Vec<MediaTypeStats>,
}

/// Media type statistics
#[derive(Debug, Clone, Serialize)]
pub struct MediaTypeStats {
    pub media_type: String,
    pub count: u64,
    pub size: u64,
}

impl Default for MediaService {
    fn default() -> Self {
        panic!("MediaService requires a database pool")
    }
}

/// Allowed file extensions
pub fn get_allowed_extensions() -> Vec<&'static str> {
    vec![
        // Images
        "jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp", // Videos
        "mp4", "webm", "ogg", "avi", "mov", "wmv", // Audio
        "mp3", "wav", "ogg", "flac", "aac", // Documents
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", // Archives
        "zip", "rar", "tar", "gz", "7z",
    ]
}

/// Get max file size in bytes (default: 50MB)
pub fn get_max_file_size() -> u64 {
    50 * 1024 * 1024
}

/// Validate file for upload
pub fn validate_upload(filename: &str, file_size: u64) -> Result<()> {
    // Check file size
    if file_size > get_max_file_size() {
        return Err(Error::validation("File size exceeds maximum allowed"));
    }

    // Check extension
    let ext = filename.rsplit('.').next().unwrap_or("").to_lowercase();
    if !get_allowed_extensions().contains(&ext.as_str()) {
        return Err(Error::validation("File type not allowed"));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_media_type_from_mime() {
        assert_eq!(MediaType::from_mime("image/png"), MediaType::Image);
        assert_eq!(MediaType::from_mime("video/mp4"), MediaType::Video);
        assert_eq!(MediaType::from_mime("audio/mpeg"), MediaType::Audio);
        assert_eq!(MediaType::from_mime("application/pdf"), MediaType::Document);
        assert_eq!(MediaType::from_mime("application/zip"), MediaType::Archive);
        assert_eq!(
            MediaType::from_mime("application/octet-stream"),
            MediaType::Other
        );
    }

    #[test]
    fn test_validate_upload() {
        assert!(validate_upload("test.jpg", 1000).is_ok());
        assert!(validate_upload("test.exe", 1000).is_err());
        assert!(validate_upload("test.jpg", 100 * 1024 * 1024).is_err());
    }
}
