//! User presence tracking for real-time collaboration.

use std::collections::HashMap;
use uuid::Uuid;

use super::message::{UserPresence, UserStatus};

/// Tracks online users and their presence information
#[derive(Debug, Default)]
pub struct PresenceTracker {
    /// Online users indexed by user_id
    users: HashMap<Uuid, PresenceInfo>,
}

#[derive(Debug, Clone)]
struct PresenceInfo {
    username: String,
    display_name: String,
    avatar_url: Option<String>,
    status: UserStatus,
    color: String,
    current_file: Option<String>,
}

impl PresenceTracker {
    /// Create a new presence tracker
    pub fn new() -> Self {
        Self {
            users: HashMap::new(),
        }
    }

    /// Mark a user as online
    pub fn user_online(
        &mut self,
        user_id: Uuid,
        username: String,
        display_name: String,
        avatar_url: Option<String>,
        color: String,
    ) {
        self.users.insert(user_id, PresenceInfo {
            username,
            display_name,
            avatar_url,
            status: UserStatus::Online,
            color,
            current_file: None,
        });
    }

    /// Mark a user as offline
    pub fn user_offline(&mut self, user_id: Uuid) {
        self.users.remove(&user_id);
    }

    /// Update user status
    pub fn update_status(&mut self, user_id: Uuid, status: UserStatus) {
        if let Some(info) = self.users.get_mut(&user_id) {
            info.status = status;
        }
    }

    /// Update current file for a user
    pub fn update_current_file(&mut self, user_id: Uuid, file_path: Option<String>) {
        if let Some(info) = self.users.get_mut(&user_id) {
            info.current_file = file_path;
        }
    }

    /// Get all online users
    pub fn get_all_users(&self) -> Vec<UserPresence> {
        self.users
            .iter()
            .map(|(user_id, info)| UserPresence {
                user_id: *user_id,
                username: info.username.clone(),
                display_name: info.display_name.clone(),
                avatar_url: info.avatar_url.clone(),
                status: info.status.clone(),
                color: info.color.clone(),
                current_file: info.current_file.clone(),
            })
            .collect()
    }

    /// Get a specific user's presence
    pub fn get_user(&self, user_id: Uuid) -> Option<UserPresence> {
        self.users.get(&user_id).map(|info| UserPresence {
            user_id,
            username: info.username.clone(),
            display_name: info.display_name.clone(),
            avatar_url: info.avatar_url.clone(),
            status: info.status.clone(),
            color: info.color.clone(),
            current_file: info.current_file.clone(),
        })
    }

    /// Check if a user is online
    pub fn is_online(&self, user_id: Uuid) -> bool {
        self.users.contains_key(&user_id)
    }

    /// Get count of online users
    pub fn online_count(&self) -> usize {
        self.users.len()
    }
}
