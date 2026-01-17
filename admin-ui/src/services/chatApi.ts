/**
 * Chat API client for REST endpoints
 */

import type {
  ChatConversation,
  ChatMessage,
  ChatParticipant,
  ConversationTag,
  CreateConversationRequest,
  UpdateConversationRequest,
  SendMessageRequest,
  EditMessageRequest,
  AddReactionRequest,
  SetReminderRequest,
  AddTagRequest,
  ChatHistoryQuery,
  PaginatedMessagesResponse,
  ConversationsResponse,
} from '../types/chat';

const API_BASE = '/api/v1/chat';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================
// Personal Notes & Online Users
// ============================================

export interface OnlineUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  status: string;
  color: string;
  current_file?: string;
}

export interface PersonalNotesResponse {
  id: string;
  title: string;
  type: string;
  created: boolean;
}

export interface OnlineUsersResponse {
  users: OnlineUser[];
  count: number;
}

export interface CreateGroupChatRequest {
  title: string;
  participant_ids: string[];
}

export interface CreateGroupChatResponse {
  id: string;
  title: string;
  type: string;
  participants: number;
}

export async function getPersonalNotes(): Promise<PersonalNotesResponse> {
  return request<PersonalNotesResponse>('/personal-notes');
}

export async function getOnlineUsers(): Promise<OnlineUsersResponse> {
  return request<OnlineUsersResponse>('/online-users');
}

export async function createGroupChat(
  data: CreateGroupChatRequest
): Promise<CreateGroupChatResponse> {
  return request<CreateGroupChatResponse>('/group', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// Conversations
// ============================================

export async function listConversations(
  limit = 20,
  offset = 0
): Promise<ConversationsResponse> {
  return request<ConversationsResponse>(
    `/conversations?limit=${limit}&offset=${offset}`
  );
}

export async function createConversation(
  data: CreateConversationRequest
): Promise<ChatConversation> {
  return request<ChatConversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getConversation(id: string): Promise<ChatConversation> {
  return request<ChatConversation>(`/conversations/${id}`);
}

export async function updateConversation(
  id: string,
  data: UpdateConversationRequest
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function archiveConversation(id: string): Promise<void> {
  await request<void>(`/conversations/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// Messages
// ============================================

export async function getMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<PaginatedMessagesResponse> {
  return request<PaginatedMessagesResponse>(
    `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
  );
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function editMessage(
  messageId: string,
  data: EditMessageRequest
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMessage(messageId: string): Promise<void> {
  await request<void>(`/messages/${messageId}`, {
    method: 'DELETE',
  });
}

// ============================================
// Reactions
// ============================================

export async function addReaction(
  messageId: string,
  data: AddReactionRequest
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeReaction(
  messageId: string,
  emoji: string
): Promise<void> {
  await request<void>(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
    method: 'DELETE',
  });
}

// ============================================
// Stars
// ============================================

export async function starMessage(messageId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/messages/${messageId}/star`, {
    method: 'POST',
  });
}

export async function unstarMessage(messageId: string): Promise<void> {
  await request<void>(`/messages/${messageId}/star`, {
    method: 'DELETE',
  });
}

// ============================================
// Pins
// ============================================

export async function pinMessage(messageId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/messages/${messageId}/pin`, {
    method: 'POST',
  });
}

export async function unpinMessage(messageId: string): Promise<void> {
  await request<void>(`/messages/${messageId}/pin`, {
    method: 'DELETE',
  });
}

// ============================================
// Reminders
// ============================================

export async function setReminder(
  messageId: string,
  data: SetReminderRequest
): Promise<{ id: string }> {
  return request<{ id: string }>(`/messages/${messageId}/remind`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// Participants
// ============================================

export async function listParticipants(
  conversationId: string
): Promise<{ participants: ChatParticipant[] }> {
  return request<{ participants: ChatParticipant[] }>(
    `/conversations/${conversationId}/participants`
  );
}

export async function addParticipant(
  conversationId: string,
  userId: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/conversations/${conversationId}/participants`,
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }
  );
}

export async function removeParticipant(
  conversationId: string,
  userId: string
): Promise<void> {
  await request<void>(
    `/conversations/${conversationId}/participants/${userId}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================
// Tags
// ============================================

export async function addTag(
  conversationId: string,
  data: AddTagRequest
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/conversations/${conversationId}/tags`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function removeTag(
  conversationId: string,
  tag: string
): Promise<void> {
  await request<void>(
    `/conversations/${conversationId}/tags/${encodeURIComponent(tag)}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================
// History & Search
// ============================================

export async function getChatHistory(
  query: ChatHistoryQuery
): Promise<{ messages: ChatMessage[] }> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.offset) params.set('offset', String(query.offset));

  return request<{ messages: ChatMessage[] }>(`/history?${params.toString()}`);
}

export async function getStarredMessages(
  limit = 50,
  offset = 0
): Promise<{ messages: ChatMessage[] }> {
  return request<{ messages: ChatMessage[] }>(
    `/starred?limit=${limit}&offset=${offset}`
  );
}

// Export all as default object for convenience
export const chatApi = {
  // Personal notes & online users
  getPersonalNotes,
  getOnlineUsers,
  createGroupChat,
  // Conversations
  listConversations,
  createConversation,
  getConversation,
  updateConversation,
  archiveConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  starMessage,
  unstarMessage,
  pinMessage,
  unpinMessage,
  setReminder,
  listParticipants,
  addParticipant,
  removeParticipant,
  addTag,
  removeTag,
  getChatHistory,
  getStarredMessages,
};

export default chatApi;
