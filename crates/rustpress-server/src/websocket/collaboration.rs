//! File collaboration state for real-time editing.

use std::collections::{HashMap, HashSet};
use uuid::Uuid;

use super::message::{CursorPosition, FileCollaborator, Selection};

/// Tracks which files are being edited and by whom
#[derive(Debug, Default)]
pub struct CollaborationState {
    /// Files being edited, indexed by file path
    files: HashMap<String, FileState>,
    /// Which files each session has open
    session_files: HashMap<Uuid, HashSet<String>>,
}

/// State for a single file being edited
#[derive(Debug, Default)]
struct FileState {
    /// Users editing this file
    editors: HashMap<Uuid, EditorInfo>,
}

/// Information about an editor in a file
#[derive(Debug, Clone)]
struct EditorInfo {
    session_id: Uuid,
    user_id: Uuid,
    color: String,
    cursor: Option<CursorPosition>,
    selection: Option<Selection>,
}

impl CollaborationState {
    /// Create a new collaboration state
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
            session_files: HashMap::new(),
        }
    }

    /// Open a file for editing
    pub fn open_file(&mut self, session_id: Uuid, user_id: Uuid, file_path: &str, color: &str) {
        // Add to file state
        let file_state = self.files.entry(file_path.to_string()).or_default();
        file_state.editors.insert(session_id, EditorInfo {
            session_id,
            user_id,
            color: color.to_string(),
            cursor: None,
            selection: None,
        });

        // Track which files the session has open
        self.session_files
            .entry(session_id)
            .or_default()
            .insert(file_path.to_string());
    }

    /// Close a file
    pub fn close_file(&mut self, session_id: Uuid, file_path: &str) {
        // Remove from file state
        if let Some(file_state) = self.files.get_mut(file_path) {
            file_state.editors.remove(&session_id);

            // Remove file entry if no editors left
            if file_state.editors.is_empty() {
                self.files.remove(file_path);
            }
        }

        // Remove from session tracking
        if let Some(files) = self.session_files.get_mut(&session_id) {
            files.remove(file_path);
        }
    }

    /// Handle session disconnection - close all files
    pub fn session_disconnected(&mut self, session_id: Uuid) {
        if let Some(files) = self.session_files.remove(&session_id) {
            for file_path in files {
                if let Some(file_state) = self.files.get_mut(&file_path) {
                    file_state.editors.remove(&session_id);

                    if file_state.editors.is_empty() {
                        self.files.remove(&file_path);
                    }
                }
            }
        }
    }

    /// Update cursor position for a session in a file
    pub fn update_cursor(&mut self, session_id: Uuid, file_path: &str, position: CursorPosition) {
        if let Some(file_state) = self.files.get_mut(file_path) {
            if let Some(editor) = file_state.editors.get_mut(&session_id) {
                editor.cursor = Some(position);
            }
        }
    }

    /// Update selection for a session in a file
    pub fn update_selection(&mut self, session_id: Uuid, file_path: &str, selection: Option<Selection>) {
        if let Some(file_state) = self.files.get_mut(file_path) {
            if let Some(editor) = file_state.editors.get_mut(&session_id) {
                editor.selection = selection;
            }
        }
    }

    /// Get all sessions editing a file
    pub fn get_file_sessions(&self, file_path: &str) -> Vec<Uuid> {
        self.files
            .get(file_path)
            .map(|f| f.editors.keys().copied().collect())
            .unwrap_or_default()
    }

    /// Get collaborator info for a file (for display)
    pub fn get_file_collaborators(&self, file_path: &str) -> Vec<FileCollaborator> {
        self.files
            .get(file_path)
            .map(|f| {
                f.editors
                    .values()
                    .map(|e| FileCollaborator {
                        user_id: e.user_id,
                        username: String::new(), // Will be filled in by hub
                        display_name: String::new(),
                        color: e.color.clone(),
                        cursor: e.cursor.clone(),
                        selection: e.selection.clone(),
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Get all files a session has open
    pub fn get_session_files(&self, session_id: Uuid) -> Vec<String> {
        self.session_files
            .get(&session_id)
            .map(|f| f.iter().cloned().collect())
            .unwrap_or_default()
    }

    /// Check if anyone is editing a file
    pub fn is_file_active(&self, file_path: &str) -> bool {
        self.files
            .get(file_path)
            .map(|f| !f.editors.is_empty())
            .unwrap_or(false)
    }

    /// Get count of editors for a file
    pub fn file_editor_count(&self, file_path: &str) -> usize {
        self.files
            .get(file_path)
            .map(|f| f.editors.len())
            .unwrap_or(0)
    }
}
