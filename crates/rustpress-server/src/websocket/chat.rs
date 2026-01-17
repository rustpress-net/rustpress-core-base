//! Chat message handling for WebSocket.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use super::message::{ChatMessageDto, ReactionDto};

/// Chat message from database
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ChatMessage {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub content_type: String,
    pub reply_to_id: Option<Uuid>,
    pub is_pinned: bool,
    pub is_edited: bool,
    pub edited_at: Option<DateTime<Utc>>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

/// Chat conversation from database
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ChatConversation {
    pub id: Uuid,
    pub site_id: Option<Uuid>,
    pub title: Option<String>,
    #[sqlx(rename = "type")]
    pub conversation_type: String,
    pub created_by: Uuid,
    pub is_archived: bool,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// User info for chat display
#[derive(Debug, Clone)]
pub struct ChatUser {
    pub id: Uuid,
    pub username: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
}

/// Message DTO row for query
#[derive(sqlx::FromRow)]
struct MessageDtoRow {
    id: Uuid,
    conversation_id: Uuid,
    sender_id: Uuid,
    content: String,
    content_type: String,
    reply_to_id: Option<Uuid>,
    is_pinned: bool,
    is_edited: bool,
    created_at: DateTime<Utc>,
    sender_name: String,
    sender_display_name: Option<String>,
}

/// Chat service for database operations
pub struct ChatService {
    pool: PgPool,
}

impl ChatService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Create a new chat message
    pub async fn create_message(
        &self,
        conversation_id: Uuid,
        sender_id: Uuid,
        content: &str,
        content_type: Option<&str>,
        reply_to_id: Option<Uuid>,
    ) -> Result<ChatMessage, sqlx::Error> {
        let content_type = content_type.unwrap_or("text");

        sqlx::query_as::<_, ChatMessage>(
            r#"
            INSERT INTO chat_messages (conversation_id, sender_id, content, content_type, reply_to_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, conversation_id, sender_id, content, content_type, reply_to_id,
                      is_pinned, is_edited, edited_at, metadata, created_at, deleted_at
            "#
        )
        .bind(conversation_id)
        .bind(sender_id)
        .bind(content)
        .bind(content_type)
        .bind(reply_to_id)
        .fetch_one(&self.pool)
        .await
    }

    /// Edit a message
    pub async fn edit_message(
        &self,
        message_id: Uuid,
        sender_id: Uuid,
        content: &str,
    ) -> Result<ChatMessage, sqlx::Error> {
        sqlx::query_as::<_, ChatMessage>(
            r#"
            UPDATE chat_messages
            SET content = $1, is_edited = true, edited_at = NOW()
            WHERE id = $2 AND sender_id = $3 AND deleted_at IS NULL
            RETURNING id, conversation_id, sender_id, content, content_type, reply_to_id,
                      is_pinned, is_edited, edited_at, metadata, created_at, deleted_at
            "#,
        )
        .bind(content)
        .bind(message_id)
        .bind(sender_id)
        .fetch_one(&self.pool)
        .await
    }

    /// Soft delete a message
    pub async fn delete_message(&self, message_id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE chat_messages
            SET deleted_at = NOW()
            WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL
            "#,
        )
        .bind(message_id)
        .bind(user_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Add a reaction to a message
    pub async fn add_reaction(
        &self,
        message_id: Uuid,
        user_id: Uuid,
        emoji: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO chat_message_reactions (message_id, user_id, emoji)
            VALUES ($1, $2, $3)
            ON CONFLICT (message_id, user_id, emoji) DO NOTHING
            "#,
        )
        .bind(message_id)
        .bind(user_id)
        .bind(emoji)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Remove a reaction from a message
    pub async fn remove_reaction(
        &self,
        message_id: Uuid,
        user_id: Uuid,
        emoji: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            DELETE FROM chat_message_reactions
            WHERE message_id = $1 AND user_id = $2 AND emoji = $3
            "#,
        )
        .bind(message_id)
        .bind(user_id)
        .bind(emoji)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Pin a message
    pub async fn pin_message(&self, message_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(r#"UPDATE chat_messages SET is_pinned = true WHERE id = $1"#)
            .bind(message_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    /// Unpin a message
    pub async fn unpin_message(&self, message_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(r#"UPDATE chat_messages SET is_pinned = false WHERE id = $1"#)
            .bind(message_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    /// Get message with sender info
    pub async fn get_message_dto(
        &self,
        message_id: Uuid,
        current_user_id: Uuid,
    ) -> Result<Option<ChatMessageDto>, sqlx::Error> {
        let row: Option<MessageDtoRow> = sqlx::query_as(
            r#"
            SELECT m.id, m.conversation_id, m.sender_id, m.content, m.content_type,
                   m.reply_to_id, m.is_pinned, m.is_edited, m.created_at,
                   u.username as sender_name, u.display_name as sender_display_name
            FROM chat_messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.id = $1 AND m.deleted_at IS NULL
            "#,
        )
        .bind(message_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let reactions = self
                .get_message_reactions(message_id, current_user_id)
                .await?;

            Ok(Some(ChatMessageDto {
                id: row.id,
                conversation_id: row.conversation_id,
                sender_id: row.sender_id,
                sender_name: row.sender_display_name.unwrap_or(row.sender_name),
                sender_avatar: None,
                content: row.content,
                content_type: row.content_type,
                reply_to_id: row.reply_to_id,
                is_pinned: row.is_pinned,
                is_edited: row.is_edited,
                reactions,
                created_at: row.created_at,
            }))
        } else {
            Ok(None)
        }
    }

    /// Get reactions for a message
    async fn get_message_reactions(
        &self,
        message_id: Uuid,
        current_user_id: Uuid,
    ) -> Result<Vec<ReactionDto>, sqlx::Error> {
        let rows: Vec<(String, Vec<Uuid>, i64, bool)> = sqlx::query_as(
            r#"
            SELECT emoji,
                   array_agg(user_id) as users,
                   COUNT(*) as count,
                   bool_or(user_id = $2) as has_reacted
            FROM chat_message_reactions
            WHERE message_id = $1
            GROUP BY emoji
            "#,
        )
        .bind(message_id)
        .bind(current_user_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|(emoji, users, count, has_reacted)| ReactionDto {
                emoji,
                count: count as u32,
                users,
                has_reacted,
            })
            .collect())
    }

    /// Check if user is participant in conversation
    pub async fn is_participant(
        &self,
        conversation_id: Uuid,
        user_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let result: (bool,) = sqlx::query_as(
            r#"
            SELECT EXISTS(
                SELECT 1 FROM chat_conversation_participants
                WHERE conversation_id = $1 AND user_id = $2
            ) as exists
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(result.0)
    }

    /// Update last read timestamp
    pub async fn mark_read(&self, conversation_id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE chat_conversation_participants
            SET last_read_at = NOW()
            WHERE conversation_id = $1 AND user_id = $2
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Get unread count for a conversation
    pub async fn get_unread_count(
        &self,
        conversation_id: Uuid,
        user_id: Uuid,
    ) -> Result<u32, sqlx::Error> {
        let result: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) as count
            FROM chat_messages m
            JOIN chat_conversation_participants p ON p.conversation_id = m.conversation_id
            WHERE m.conversation_id = $1
              AND p.user_id = $2
              AND m.deleted_at IS NULL
              AND m.created_at > COALESCE(p.last_read_at, '1970-01-01'::timestamptz)
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(result.0 as u32)
    }
}
