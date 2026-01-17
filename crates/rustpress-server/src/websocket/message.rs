//! WebSocket message types for real-time collaboration and chat.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// User presence information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPresence {
    pub user_id: Uuid,
    pub username: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,
    pub color: String,
    pub current_file: Option<String>,
}

/// User online status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UserStatus {
    Online,
    Away,
    Busy,
    Offline,
}

impl Default for UserStatus {
    fn default() -> Self {
        Self::Online
    }
}

/// Cursor position in a file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPosition {
    pub line: u32,
    pub column: u32,
}

/// Text selection range
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Selection {
    pub start_line: u32,
    pub start_column: u32,
    pub end_line: u32,
    pub end_column: u32,
}

/// Text change operation for collaborative editing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextChange {
    pub range_start_line: u32,
    pub range_start_column: u32,
    pub range_end_line: u32,
    pub range_end_column: u32,
    pub text: String,
}

/// Chat message DTO for WebSocket transport
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessageDto {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub sender_name: String,
    pub sender_avatar: Option<String>,
    pub content: String,
    pub content_type: String,
    pub reply_to_id: Option<Uuid>,
    pub is_pinned: bool,
    pub is_edited: bool,
    pub reactions: Vec<ReactionDto>,
    pub created_at: DateTime<Utc>,
}

/// Reaction DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReactionDto {
    pub emoji: String,
    pub count: u32,
    pub users: Vec<Uuid>,
    pub has_reacted: bool,
}

/// Inbound WebSocket messages (from client)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum ClientMessage {
    // Connection
    Ping,
    Authenticate { token: String },

    // Presence
    UpdateStatus { status: UserStatus },

    // File Collaboration
    OpenFile { file_path: String },
    CloseFile { file_path: String },
    MoveCursor { file_path: String, position: CursorPosition },
    UpdateSelection { file_path: String, selection: Option<Selection> },
    ApplyChanges { file_path: String, changes: Vec<TextChange> },

    // Chat
    SendMessage { conversation_id: Uuid, content: String, content_type: Option<String>, reply_to_id: Option<Uuid> },
    EditMessage { message_id: Uuid, content: String },
    DeleteMessage { message_id: Uuid },
    AddReaction { message_id: Uuid, emoji: String },
    RemoveReaction { message_id: Uuid, emoji: String },
    PinMessage { message_id: Uuid },
    UnpinMessage { message_id: Uuid },
    StartTyping { conversation_id: Uuid },
    StopTyping { conversation_id: Uuid },
    MarkRead { conversation_id: Uuid, message_id: Uuid },

    // Subscriptions
    JoinConversation { conversation_id: Uuid },
    LeaveConversation { conversation_id: Uuid },
}

/// Outbound WebSocket messages (to client)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum ServerMessage {
    // Connection
    Connected { session_id: Uuid, user_id: Uuid },
    Pong,
    Error { code: String, message: String },

    // Presence
    UserJoined { user: UserPresence },
    UserLeft { user_id: Uuid },
    PresenceUpdate { users: Vec<UserPresence> },
    UserStatusChanged { user_id: Uuid, status: UserStatus },

    // File Collaboration
    FileOpened { user_id: Uuid, username: String, file_path: String, color: String },
    FileClosed { user_id: Uuid, file_path: String },
    CursorMoved { user_id: Uuid, username: String, file_path: String, position: CursorPosition, color: String },
    SelectionChanged { user_id: Uuid, username: String, file_path: String, selection: Option<Selection>, color: String },
    TextChanged { user_id: Uuid, file_path: String, changes: Vec<TextChange> },
    FileCollaborators { file_path: String, collaborators: Vec<FileCollaborator> },

    // Chat
    ChatMessage { message: ChatMessageDto },
    ChatMessageEdited { message_id: Uuid, content: String, edited_at: DateTime<Utc> },
    ChatMessageDeleted { message_id: Uuid },
    ReactionAdded { message_id: Uuid, user_id: Uuid, emoji: String },
    ReactionRemoved { message_id: Uuid, user_id: Uuid, emoji: String },
    MessagePinned { message_id: Uuid },
    MessageUnpinned { message_id: Uuid },
    TypingStarted { conversation_id: Uuid, user_id: Uuid, username: String },
    TypingStopped { conversation_id: Uuid, user_id: Uuid },
    UnreadCount { conversation_id: Uuid, count: u32 },
}

/// Collaborator information for a file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileCollaborator {
    pub user_id: Uuid,
    pub username: String,
    pub display_name: String,
    pub color: String,
    pub cursor: Option<CursorPosition>,
    pub selection: Option<Selection>,
}

impl ServerMessage {
    /// Create an error message
    pub fn error(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::Error {
            code: code.into(),
            message: message.into(),
        }
    }
}
