/**
 * Types for real-time collaboration
 */

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  status: UserStatus;
  color: string;
  current_file?: string;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface Selection {
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
}

export interface TextChange {
  range_start_line: number;
  range_start_column: number;
  range_end_line: number;
  range_end_column: number;
  text: string;
}

export interface FileCollaborator {
  user_id: string;
  username: string;
  display_name: string;
  color: string;
  cursor?: CursorPosition;
  selection?: Selection;
}

// WebSocket message types (client -> server)
export type ClientMessage =
  | { type: 'Ping' }
  | { type: 'Authenticate'; payload: { token: string } }
  | { type: 'UpdateStatus'; payload: { status: UserStatus } }
  | { type: 'OpenFile'; payload: { file_path: string } }
  | { type: 'CloseFile'; payload: { file_path: string } }
  | { type: 'MoveCursor'; payload: { file_path: string; position: CursorPosition } }
  | { type: 'UpdateSelection'; payload: { file_path: string; selection: Selection | null } }
  | { type: 'ApplyChanges'; payload: { file_path: string; changes: TextChange[] } }
  | { type: 'SendMessage'; payload: { conversation_id: string; content: string; content_type?: string; reply_to_id?: string } }
  | { type: 'EditMessage'; payload: { message_id: string; content: string } }
  | { type: 'DeleteMessage'; payload: { message_id: string } }
  | { type: 'AddReaction'; payload: { message_id: string; emoji: string } }
  | { type: 'RemoveReaction'; payload: { message_id: string; emoji: string } }
  | { type: 'PinMessage'; payload: { message_id: string } }
  | { type: 'UnpinMessage'; payload: { message_id: string } }
  | { type: 'StartTyping'; payload: { conversation_id: string } }
  | { type: 'StopTyping'; payload: { conversation_id: string } }
  | { type: 'MarkRead'; payload: { conversation_id: string; message_id: string } }
  | { type: 'JoinConversation'; payload: { conversation_id: string } }
  | { type: 'LeaveConversation'; payload: { conversation_id: string } };

// WebSocket message types (server -> client)
export type ServerMessage =
  | { type: 'Connected'; payload: { session_id: string; user_id: string } }
  | { type: 'Pong' }
  | { type: 'Error'; payload: { code: string; message: string } }
  | { type: 'UserJoined'; payload: { user: UserPresence } }
  | { type: 'UserLeft'; payload: { user_id: string } }
  | { type: 'PresenceUpdate'; payload: { users: UserPresence[] } }
  | { type: 'UserStatusChanged'; payload: { user_id: string; status: UserStatus } }
  | { type: 'FileOpened'; payload: { user_id: string; username: string; file_path: string; color: string } }
  | { type: 'FileClosed'; payload: { user_id: string; file_path: string } }
  | { type: 'CursorMoved'; payload: { user_id: string; username: string; file_path: string; position: CursorPosition; color: string } }
  | { type: 'SelectionChanged'; payload: { user_id: string; username: string; file_path: string; selection: Selection | null; color: string } }
  | { type: 'TextChanged'; payload: { user_id: string; file_path: string; changes: TextChange[] } }
  | { type: 'FileCollaborators'; payload: { file_path: string; collaborators: FileCollaborator[] } }
  | { type: 'ChatMessage'; payload: { message: ChatMessageDto } }
  | { type: 'ChatMessageEdited'; payload: { message_id: string; content: string; edited_at: string } }
  | { type: 'ChatMessageDeleted'; payload: { message_id: string } }
  | { type: 'ReactionAdded'; payload: { message_id: string; user_id: string; emoji: string } }
  | { type: 'ReactionRemoved'; payload: { message_id: string; user_id: string; emoji: string } }
  | { type: 'MessagePinned'; payload: { message_id: string } }
  | { type: 'MessageUnpinned'; payload: { message_id: string } }
  | { type: 'TypingStarted'; payload: { conversation_id: string; user_id: string; username: string } }
  | { type: 'TypingStopped'; payload: { conversation_id: string; user_id: string } }
  | { type: 'UnreadCount'; payload: { conversation_id: string; count: number } };

// Chat message DTO (matches backend)
export interface ChatMessageDto {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  content_type: string;
  reply_to_id?: string;
  is_pinned: boolean;
  is_edited: boolean;
  reactions: ReactionDto[];
  created_at: string;
}

export interface ReactionDto {
  emoji: string;
  count: number;
  users: string[];
  has_reacted: boolean;
}
