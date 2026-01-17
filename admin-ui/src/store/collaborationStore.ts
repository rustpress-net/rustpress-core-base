/**
 * Collaboration Store - Manages real-time collaboration state
 */

import { create } from 'zustand';
import type {
  UserPresence,
  UserStatus,
  CursorPosition,
  Selection,
  FileCollaborator,
  ServerMessage,
} from '../types/collaboration';
import { websocketService } from '../services/websocketService';

interface CollaborationState {
  // Connection state
  isConnected: boolean;
  sessionId: string | null;
  userId: string | null;

  // Presence
  onlineUsers: Map<string, UserPresence>;
  myStatus: UserStatus;

  // File collaboration
  fileCollaborators: Map<string, FileCollaborator[]>;
  remoteCursors: Map<string, Map<string, { position: CursorPosition; color: string; username: string }>>;
  remoteSelections: Map<string, Map<string, { selection: Selection | null; color: string; username: string }>>;

  // Actions - Connection
  connect: (token: string) => void;
  disconnect: () => void;

  // Actions - Presence
  updateMyStatus: (status: UserStatus) => void;

  // Actions - File collaboration
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  moveCursor: (filePath: string, position: CursorPosition) => void;
  updateSelection: (filePath: string, selection: Selection | null) => void;

  // Internal actions
  handleMessage: (message: ServerMessage) => void;
  setConnected: (connected: boolean, sessionId?: string, userId?: string) => void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  // Initial state
  isConnected: false,
  sessionId: null,
  userId: null,
  onlineUsers: new Map(),
  myStatus: 'online',
  fileCollaborators: new Map(),
  remoteCursors: new Map(),
  remoteSelections: new Map(),

  // Connection
  connect: (token: string) => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws`;

    websocketService.connect({
      url: wsUrl,
      token,
      onConnect: (sessionId, userId) => {
        get().setConnected(true, sessionId, userId);
      },
      onDisconnect: () => {
        get().setConnected(false);
      },
      onMessage: (message) => {
        get().handleMessage(message);
      },
    });
  },

  disconnect: () => {
    websocketService.disconnect();
    set({
      isConnected: false,
      sessionId: null,
      userId: null,
      onlineUsers: new Map(),
      fileCollaborators: new Map(),
      remoteCursors: new Map(),
      remoteSelections: new Map(),
    });
  },

  // Presence
  updateMyStatus: (status: UserStatus) => {
    set({ myStatus: status });
    websocketService.updateStatus(status);
  },

  // File collaboration
  openFile: (filePath: string) => {
    websocketService.openFile(filePath);
  },

  closeFile: (filePath: string) => {
    websocketService.closeFile(filePath);
    // Clear collaborators for this file
    const fileCollaborators = new Map(get().fileCollaborators);
    fileCollaborators.delete(filePath);
    const remoteCursors = new Map(get().remoteCursors);
    remoteCursors.delete(filePath);
    const remoteSelections = new Map(get().remoteSelections);
    remoteSelections.delete(filePath);
    set({ fileCollaborators, remoteCursors, remoteSelections });
  },

  moveCursor: (filePath: string, position: CursorPosition) => {
    websocketService.moveCursor(filePath, position);
  },

  updateSelection: (filePath: string, selection: Selection | null) => {
    websocketService.updateSelection(filePath, selection);
  },

  // Internal
  setConnected: (connected: boolean, sessionId?: string, userId?: string) => {
    set({
      isConnected: connected,
      sessionId: sessionId ?? null,
      userId: userId ?? null,
    });
  },

  handleMessage: (message: ServerMessage) => {
    switch (message.type) {
      case 'PresenceUpdate': {
        const users = new Map<string, UserPresence>();
        message.payload.users.forEach((user) => {
          users.set(user.user_id, user);
        });
        set({ onlineUsers: users });
        break;
      }

      case 'UserJoined': {
        const onlineUsers = new Map(get().onlineUsers);
        onlineUsers.set(message.payload.user.user_id, message.payload.user);
        set({ onlineUsers });
        break;
      }

      case 'UserLeft': {
        const onlineUsers = new Map(get().onlineUsers);
        onlineUsers.delete(message.payload.user_id);
        set({ onlineUsers });
        break;
      }

      case 'UserStatusChanged': {
        const onlineUsers = new Map(get().onlineUsers);
        const user = onlineUsers.get(message.payload.user_id);
        if (user) {
          onlineUsers.set(message.payload.user_id, { ...user, status: message.payload.status });
          set({ onlineUsers });
        }
        break;
      }

      case 'FileOpened': {
        const { user_id, username, file_path, color } = message.payload;
        const fileCollaborators = new Map(get().fileCollaborators);
        const collaborators = fileCollaborators.get(file_path) || [];
        if (!collaborators.find((c) => c.user_id === user_id)) {
          collaborators.push({
            user_id,
            username,
            display_name: username,
            color,
          });
          fileCollaborators.set(file_path, collaborators);
          set({ fileCollaborators });
        }
        break;
      }

      case 'FileClosed': {
        const { user_id, file_path } = message.payload;
        const fileCollaborators = new Map(get().fileCollaborators);
        const collaborators = (fileCollaborators.get(file_path) || []).filter(
          (c) => c.user_id !== user_id
        );
        if (collaborators.length > 0) {
          fileCollaborators.set(file_path, collaborators);
        } else {
          fileCollaborators.delete(file_path);
        }

        // Remove cursor and selection
        const remoteCursors = new Map(get().remoteCursors);
        const fileCursors = remoteCursors.get(file_path);
        if (fileCursors) {
          fileCursors.delete(user_id);
          if (fileCursors.size === 0) {
            remoteCursors.delete(file_path);
          }
        }

        const remoteSelections = new Map(get().remoteSelections);
        const fileSelections = remoteSelections.get(file_path);
        if (fileSelections) {
          fileSelections.delete(user_id);
          if (fileSelections.size === 0) {
            remoteSelections.delete(file_path);
          }
        }

        set({ fileCollaborators, remoteCursors, remoteSelections });
        break;
      }

      case 'FileCollaborators': {
        const { file_path, collaborators } = message.payload;
        const fileCollaborators = new Map(get().fileCollaborators);
        fileCollaborators.set(file_path, collaborators);
        set({ fileCollaborators });
        break;
      }

      case 'CursorMoved': {
        const { user_id, username, file_path, position, color } = message.payload;
        const remoteCursors = new Map(get().remoteCursors);
        if (!remoteCursors.has(file_path)) {
          remoteCursors.set(file_path, new Map());
        }
        remoteCursors.get(file_path)!.set(user_id, { position, color, username });
        set({ remoteCursors });
        break;
      }

      case 'SelectionChanged': {
        const { user_id, username, file_path, selection, color } = message.payload;
        const remoteSelections = new Map(get().remoteSelections);
        if (!remoteSelections.has(file_path)) {
          remoteSelections.set(file_path, new Map());
        }
        remoteSelections.get(file_path)!.set(user_id, { selection, color, username });
        set({ remoteSelections });
        break;
      }

      default:
        // Chat messages are handled by chatStore
        break;
    }
  },
}));

export default useCollaborationStore;
