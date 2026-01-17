/**
 * Types for the chat system
 */

export type ConversationType = 'direct' | 'group' | 'channel';

export interface ChatConversation {
  id: string;
  site_id?: string;
  title?: string;
  type: ConversationType;
  created_by: string;
  is_archived: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Computed fields
  participants?: ChatParticipant[];
  tags?: ConversationTag[];
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  is_muted: boolean;
  // Joined user info
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface ConversationTag {
  id: string;
  conversation_id: string;
  tag: string;
  color?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_type: 'text' | 'code' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  is_pinned: boolean;
  is_edited: boolean;
  edited_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  deleted_at?: string;
  // Joined fields
  sender_name?: string;
  sender_avatar?: string;
  reactions?: MessageReaction[];
  reply_to?: ChatMessage;
  is_starred?: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  has_reacted: boolean;
}

export interface ChatMessageReminder {
  id: string;
  message_id: string;
  user_id: string;
  remind_at: string;
  is_sent: boolean;
  created_at: string;
}

// API request/response types

export interface CreateConversationRequest {
  title?: string;
  type?: ConversationType;
  participant_ids: string[];
}

export interface UpdateConversationRequest {
  title?: string;
}

export interface SendMessageRequest {
  content: string;
  content_type?: string;
  reply_to_id?: string;
}

export interface EditMessageRequest {
  content: string;
}

export interface AddReactionRequest {
  emoji: string;
}

export interface SetReminderRequest {
  remind_at: string;
}

export interface AddTagRequest {
  tag: string;
  color?: string;
}

export interface ChatHistoryQuery {
  conversation_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  sender_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedMessagesResponse {
  messages: ChatMessage[];
  total?: number;
  has_more?: boolean;
}

export interface ConversationsResponse {
  conversations: ChatConversation[];
}

// Typing indicator state
export interface TypingUser {
  user_id: string;
  username: string;
  display_name?: string;
  started_at: number;
}
