//! WebSocket connection hub for managing all active connections.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc, RwLock};
use uuid::Uuid;

use super::message::{ServerMessage, UserPresence, UserStatus, CursorPosition, Selection};
use super::presence::PresenceTracker;
use super::collaboration::CollaborationState;

/// Message sender for a single connection
pub type ConnectionSender = mpsc::UnboundedSender<ServerMessage>;

/// A single WebSocket connection
#[derive(Debug)]
pub struct Connection {
    pub session_id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub color: String,
    pub sender: ConnectionSender,
    pub subscribed_conversations: HashSet<Uuid>,
}

/// WebSocket hub that manages all active connections
#[derive(Debug)]
pub struct WebSocketHub {
    /// All active connections indexed by session_id
    connections: RwLock<HashMap<Uuid, Connection>>,
    /// User to sessions mapping (a user can have multiple sessions)
    user_sessions: RwLock<HashMap<Uuid, HashSet<Uuid>>>,
    /// Presence tracker for online users
    presence: RwLock<PresenceTracker>,
    /// Collaboration state for file editing
    collaboration: RwLock<CollaborationState>,
    /// Broadcast channel for global events
    broadcast_tx: broadcast::Sender<ServerMessage>,
}

impl WebSocketHub {
    /// Create a new WebSocket hub
    pub fn new() -> Arc<Self> {
        let (broadcast_tx, _) = broadcast::channel(1024);

        Arc::new(Self {
            connections: RwLock::new(HashMap::new()),
            user_sessions: RwLock::new(HashMap::new()),
            presence: RwLock::new(PresenceTracker::new()),
            collaboration: RwLock::new(CollaborationState::new()),
            broadcast_tx,
        })
    }

    /// Register a new connection
    pub async fn register(
        &self,
        session_id: Uuid,
        user_id: Uuid,
        username: String,
        display_name: String,
        avatar_url: Option<String>,
        sender: ConnectionSender,
    ) {
        let color = generate_user_color(&user_id);

        let connection = Connection {
            session_id,
            user_id,
            username: username.clone(),
            display_name: display_name.clone(),
            avatar_url: avatar_url.clone(),
            color: color.clone(),
            sender,
            subscribed_conversations: HashSet::new(),
        };

        // Add connection
        {
            let mut connections = self.connections.write().await;
            connections.insert(session_id, connection);
        }

        // Track user session
        {
            let mut user_sessions = self.user_sessions.write().await;
            user_sessions
                .entry(user_id)
                .or_insert_with(HashSet::new)
                .insert(session_id);
        }

        // Update presence
        {
            let mut presence = self.presence.write().await;
            presence.user_online(user_id, username.clone(), display_name.clone(), avatar_url, color);
        }

        // Notify others that user joined
        let user_presence = UserPresence {
            user_id,
            username,
            display_name,
            avatar_url: None,
            status: UserStatus::Online,
            color: generate_user_color(&user_id),
            current_file: None,
        };

        self.broadcast_except(session_id, ServerMessage::UserJoined { user: user_presence }).await;
    }

    /// Unregister a connection
    pub async fn unregister(&self, session_id: Uuid) {
        let connection = {
            let mut connections = self.connections.write().await;
            connections.remove(&session_id)
        };

        if let Some(conn) = connection {
            // Remove from user sessions
            let should_notify_offline = {
                let mut user_sessions = self.user_sessions.write().await;
                if let Some(sessions) = user_sessions.get_mut(&conn.user_id) {
                    sessions.remove(&session_id);
                    sessions.is_empty()
                } else {
                    false
                }
            };

            // Close all files this session had open
            {
                let mut collab = self.collaboration.write().await;
                collab.session_disconnected(session_id);
            }

            // If user has no more sessions, mark as offline
            if should_notify_offline {
                {
                    let mut presence = self.presence.write().await;
                    presence.user_offline(conn.user_id);
                }

                self.broadcast(ServerMessage::UserLeft { user_id: conn.user_id }).await;
            }
        }
    }

    /// Send message to a specific session
    pub async fn send_to_session(&self, session_id: Uuid, message: ServerMessage) {
        let connections = self.connections.read().await;
        if let Some(conn) = connections.get(&session_id) {
            let _ = conn.sender.send(message);
        }
    }

    /// Send message to a specific user (all their sessions)
    pub async fn send_to_user(&self, user_id: Uuid, message: ServerMessage) {
        let user_sessions = self.user_sessions.read().await;
        if let Some(sessions) = user_sessions.get(&user_id) {
            let connections = self.connections.read().await;
            for session_id in sessions {
                if let Some(conn) = connections.get(session_id) {
                    let _ = conn.sender.send(message.clone());
                }
            }
        }
    }

    /// Broadcast message to all connections
    pub async fn broadcast(&self, message: ServerMessage) {
        let connections = self.connections.read().await;
        for conn in connections.values() {
            let _ = conn.sender.send(message.clone());
        }
    }

    /// Broadcast message to all connections except one
    pub async fn broadcast_except(&self, except_session: Uuid, message: ServerMessage) {
        let connections = self.connections.read().await;
        for (session_id, conn) in connections.iter() {
            if *session_id != except_session {
                let _ = conn.sender.send(message.clone());
            }
        }
    }

    /// Broadcast message to all users viewing a specific file
    pub async fn broadcast_to_file(&self, file_path: &str, message: ServerMessage, except_session: Option<Uuid>) {
        let collab = self.collaboration.read().await;
        let sessions = collab.get_file_sessions(file_path);

        let connections = self.connections.read().await;
        for session_id in sessions {
            if except_session.map_or(true, |e| e != session_id) {
                if let Some(conn) = connections.get(&session_id) {
                    let _ = conn.sender.send(message.clone());
                }
            }
        }
    }

    /// Broadcast message to all users in a conversation
    pub async fn broadcast_to_conversation(&self, conversation_id: Uuid, message: ServerMessage, except_session: Option<Uuid>) {
        let connections = self.connections.read().await;
        for (session_id, conn) in connections.iter() {
            if conn.subscribed_conversations.contains(&conversation_id) {
                if except_session.map_or(true, |e| e != *session_id) {
                    let _ = conn.sender.send(message.clone());
                }
            }
        }
    }

    /// Subscribe a session to a conversation
    pub async fn subscribe_to_conversation(&self, session_id: Uuid, conversation_id: Uuid) {
        let mut connections = self.connections.write().await;
        if let Some(conn) = connections.get_mut(&session_id) {
            conn.subscribed_conversations.insert(conversation_id);
        }
    }

    /// Unsubscribe a session from a conversation
    pub async fn unsubscribe_from_conversation(&self, session_id: Uuid, conversation_id: Uuid) {
        let mut connections = self.connections.write().await;
        if let Some(conn) = connections.get_mut(&session_id) {
            conn.subscribed_conversations.remove(&conversation_id);
        }
    }

    /// Get all online users
    pub async fn get_online_users(&self) -> Vec<UserPresence> {
        let presence = self.presence.read().await;
        presence.get_all_users()
    }

    /// Get connection info
    pub async fn get_connection(&self, session_id: Uuid) -> Option<(Uuid, String, String, String)> {
        let connections = self.connections.read().await;
        connections.get(&session_id).map(|c| {
            (c.user_id, c.username.clone(), c.display_name.clone(), c.color.clone())
        })
    }

    /// Open a file for collaboration
    pub async fn open_file(&self, session_id: Uuid, file_path: &str) {
        if let Some((user_id, username, _, color)) = self.get_connection(session_id).await {
            {
                let mut collab = self.collaboration.write().await;
                collab.open_file(session_id, user_id, file_path, &color);
            }

            // Notify others
            self.broadcast_to_file(
                file_path,
                ServerMessage::FileOpened {
                    user_id,
                    username,
                    file_path: file_path.to_string(),
                    color,
                },
                Some(session_id),
            ).await;

            // Send current collaborators to the new user
            let collaborators = {
                let collab = self.collaboration.read().await;
                collab.get_file_collaborators(file_path)
            };

            self.send_to_session(
                session_id,
                ServerMessage::FileCollaborators {
                    file_path: file_path.to_string(),
                    collaborators,
                },
            ).await;
        }
    }

    /// Close a file for collaboration
    pub async fn close_file(&self, session_id: Uuid, file_path: &str) {
        if let Some((user_id, _, _, _)) = self.get_connection(session_id).await {
            {
                let mut collab = self.collaboration.write().await;
                collab.close_file(session_id, file_path);
            }

            self.broadcast_to_file(
                file_path,
                ServerMessage::FileClosed {
                    user_id,
                    file_path: file_path.to_string(),
                },
                Some(session_id),
            ).await;
        }
    }

    /// Update cursor position
    pub async fn move_cursor(&self, session_id: Uuid, file_path: &str, position: CursorPosition) {
        if let Some((user_id, username, _, color)) = self.get_connection(session_id).await {
            {
                let mut collab = self.collaboration.write().await;
                collab.update_cursor(session_id, file_path, position.clone());
            }

            self.broadcast_to_file(
                file_path,
                ServerMessage::CursorMoved {
                    user_id,
                    username,
                    file_path: file_path.to_string(),
                    position,
                    color,
                },
                Some(session_id),
            ).await;
        }
    }

    /// Update selection
    pub async fn update_selection(&self, session_id: Uuid, file_path: &str, selection: Option<Selection>) {
        if let Some((user_id, username, _, color)) = self.get_connection(session_id).await {
            {
                let mut collab = self.collaboration.write().await;
                collab.update_selection(session_id, file_path, selection.clone());
            }

            self.broadcast_to_file(
                file_path,
                ServerMessage::SelectionChanged {
                    user_id,
                    username,
                    file_path: file_path.to_string(),
                    selection,
                    color,
                },
                Some(session_id),
            ).await;
        }
    }

    /// Get number of active connections
    pub async fn connection_count(&self) -> usize {
        self.connections.read().await.len()
    }
}

impl Default for WebSocketHub {
    fn default() -> Self {
        let (broadcast_tx, _) = broadcast::channel(1024);
        Self {
            connections: RwLock::new(HashMap::new()),
            user_sessions: RwLock::new(HashMap::new()),
            presence: RwLock::new(PresenceTracker::new()),
            collaboration: RwLock::new(CollaborationState::new()),
            broadcast_tx,
        }
    }
}

/// Generate a consistent color for a user based on their ID
fn generate_user_color(user_id: &Uuid) -> String {
    let colors = [
        "#FF6B6B", // Red
        "#4ECDC4", // Teal
        "#45B7D1", // Sky Blue
        "#96CEB4", // Sage
        "#FFEAA7", // Yellow
        "#DDA0DD", // Plum
        "#98D8C8", // Mint
        "#F7DC6F", // Gold
        "#BB8FCE", // Purple
        "#85C1E9", // Light Blue
        "#F8B500", // Orange
        "#00CED1", // Dark Turquoise
    ];

    let bytes = user_id.as_bytes();
    let index = (bytes[0] as usize + bytes[1] as usize) % colors.len();
    colors[index].to_string()
}
