/**
 * Chat Store - Manages chat state and real-time messaging
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChatConversation,
  ChatMessage,
  TypingUser,
} from '../types/chat';
import type { ServerMessage, ChatMessageDto } from '../types/collaboration';
import { websocketService } from '../services/websocketService';
import { chatApi } from '../services/chatApi';

interface ChatState {
  // UI state
  isOpen: boolean;
  activeConversationId: string | null;
  currentUserId: string | null;

  // Data
  conversations: ChatConversation[];
  messages: Map<string, ChatMessage[]>;
  typingUsers: Map<string, TypingUser[]>;
  unreadCounts: Map<string, number>;

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Actions - UI
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setActiveConversation: (id: string | null) => void;
  setCurrentUserId: (userId: string) => void;

  // Actions - Conversations
  loadConversations: () => Promise<void>;
  createConversation: (title?: string, participantIds?: string[]) => Promise<string>;

  // Actions - Messages
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Actions - Reactions
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;

  // Actions - Starring/Pinning
  starMessage: (messageId: string) => Promise<void>;
  unstarMessage: (messageId: string) => Promise<void>;
  pinMessage: (messageId: string) => Promise<void>;
  unpinMessage: (messageId: string) => Promise<void>;
  toggleStar: (messageId: string) => Promise<void>;
  togglePin: (messageId: string) => Promise<void>;

  // Actions - Typing
  startTyping: () => void;
  stopTyping: () => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;

  // Actions - Tags
  addTag: (conversationId: string, tag: string, color?: string) => Promise<void>;
  removeTag: (conversationId: string, tag: string) => Promise<void>;

  // Actions - Reminders
  setReminder: (messageId: string, remindAt: string) => Promise<void>;

  // Internal
  handleMessage: (message: ServerMessage) => void;
  addMessageToConversation: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
}

// Convert DTO to ChatMessage
function dtoToMessage(dto: ChatMessageDto): ChatMessage {
  return {
    id: dto.id,
    conversation_id: dto.conversation_id,
    sender_id: dto.sender_id,
    content: dto.content,
    content_type: dto.content_type as ChatMessage['content_type'],
    reply_to_id: dto.reply_to_id,
    is_pinned: dto.is_pinned,
    is_edited: dto.is_edited,
    created_at: dto.created_at,
    sender_name: dto.sender_name,
    sender_avatar: dto.sender_avatar,
    reactions: dto.reactions,
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      activeConversationId: null,
      currentUserId: null,
      conversations: [],
      messages: new Map(),
      typingUsers: new Map(),
      unreadCounts: new Map(),
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSending: false,

      // UI Actions
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setCurrentUserId: (userId: string) => set({ currentUserId: userId }),

      setActiveConversation: (id: string | null) => {
        const prevId = get().activeConversationId;

        // Leave previous conversation
        if (prevId) {
          websocketService.leaveConversation(prevId);
        }

        // Join new conversation
        if (id) {
          websocketService.joinConversation(id);
          // Load messages if not already loaded
          if (!get().messages.has(id)) {
            get().loadMessages(id);
          }
        }

        set({ activeConversationId: id });
      },

      // Conversation Actions
      loadConversations: async () => {
        set({ isLoadingConversations: true });
        try {
          const response = await chatApi.listConversations();
          set({ conversations: response.conversations });
        } catch (error) {
          console.error('Failed to load conversations:', error);
        } finally {
          set({ isLoadingConversations: false });
        }
      },

      createConversation: async (title?: string, participantIds: string[] = []) => {
        const response = await chatApi.createConversation({
          title,
          participant_ids: participantIds,
        });
        // Reload conversations to get the new one
        await get().loadConversations();
        return response.id;
      },

      // Message Actions
      loadMessages: async (conversationId: string) => {
        set({ isLoadingMessages: true });
        try {
          const response = await chatApi.getMessages(conversationId);
          const messages = new Map(get().messages);
          messages.set(conversationId, response.messages);
          set({ messages });
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          set({ isLoadingMessages: false });
        }
      },

      sendMessage: async (conversationId: string, content: string, replyToId?: string) => {
        if (!conversationId) return;

        set({ isSending: true });
        try {
          // Use WebSocket for real-time delivery
          websocketService.sendMessage(conversationId, content, 'text', replyToId);
        } catch (error) {
          console.error('Failed to send message:', error);
        } finally {
          set({ isSending: false });
        }
      },

      editMessage: async (messageId: string, content: string) => {
        try {
          websocketService.editMessage(messageId, content);
        } catch (error) {
          console.error('Failed to edit message:', error);
        }
      },

      deleteMessage: async (messageId: string) => {
        try {
          websocketService.deleteMessage(messageId);
        } catch (error) {
          console.error('Failed to delete message:', error);
        }
      },

      // Reaction Actions
      addReaction: async (messageId: string, emoji: string) => {
        websocketService.addReaction(messageId, emoji);
      },

      removeReaction: async (messageId: string, emoji: string) => {
        websocketService.removeReaction(messageId, emoji);
      },

      // Star/Pin Actions
      starMessage: async (messageId: string) => {
        await chatApi.starMessage(messageId);
      },

      unstarMessage: async (messageId: string) => {
        await chatApi.unstarMessage(messageId);
      },

      pinMessage: async (messageId: string) => {
        websocketService.pinMessage(messageId);
      },

      unpinMessage: async (messageId: string) => {
        websocketService.unpinMessage(messageId);
      },

      // Typing Actions
      startTyping: () => {
        const conversationId = get().activeConversationId;
        if (conversationId) {
          websocketService.startTyping(conversationId);
        }
      },

      stopTyping: () => {
        const conversationId = get().activeConversationId;
        if (conversationId) {
          websocketService.stopTyping(conversationId);
        }
      },

      setTyping: (conversationId: string, isTyping: boolean) => {
        if (isTyping) {
          websocketService.startTyping(conversationId);
        } else {
          websocketService.stopTyping(conversationId);
        }
      },

      // Toggle Actions
      toggleStar: async (messageId: string) => {
        // Find the message to check current state
        const messages = get().messages;
        let isStarred = false;
        for (const [, msgs] of messages) {
          const msg = msgs.find((m) => m.id === messageId);
          if (msg) {
            isStarred = msg.is_starred || false;
            break;
          }
        }
        if (isStarred) {
          await chatApi.unstarMessage(messageId);
        } else {
          await chatApi.starMessage(messageId);
        }
        // Update local state
        for (const [convId, msgs] of messages) {
          if (msgs.some((m) => m.id === messageId)) {
            get().updateMessage(convId, messageId, { is_starred: !isStarred });
            break;
          }
        }
      },

      togglePin: async (messageId: string) => {
        // Find the message to check current state
        const messages = get().messages;
        let isPinned = false;
        for (const [, msgs] of messages) {
          const msg = msgs.find((m) => m.id === messageId);
          if (msg) {
            isPinned = msg.is_pinned || false;
            break;
          }
        }
        if (isPinned) {
          websocketService.unpinMessage(messageId);
        } else {
          websocketService.pinMessage(messageId);
        }
      },

      // Tag Actions
      addTag: async (conversationId: string, tag: string, color?: string) => {
        await chatApi.addTag(conversationId, { tag, color });
        // Reload conversations to get updated tags
        await get().loadConversations();
      },

      removeTag: async (conversationId: string, tag: string) => {
        await chatApi.removeTag(conversationId, tag);
        // Reload conversations to get updated tags
        await get().loadConversations();
      },

      // Reminder Actions
      setReminder: async (messageId: string, remindAt: string) => {
        await chatApi.setReminder(messageId, { remind_at: remindAt });
      },

      // Internal message handling
      handleMessage: (message: ServerMessage) => {
        switch (message.type) {
          case 'ChatMessage': {
            const msg = dtoToMessage(message.payload.message);
            get().addMessageToConversation(msg.conversation_id, msg);
            break;
          }

          case 'ChatMessageEdited': {
            const { message_id, content, edited_at } = message.payload;
            // Find which conversation this message belongs to
            const messages = get().messages;
            for (const [convId, msgs] of messages) {
              const msgIndex = msgs.findIndex((m) => m.id === message_id);
              if (msgIndex !== -1) {
                get().updateMessage(convId, message_id, {
                  content,
                  is_edited: true,
                  edited_at,
                });
                break;
              }
            }
            break;
          }

          case 'ChatMessageDeleted': {
            const { message_id } = message.payload;
            const messages = get().messages;
            for (const [convId, msgs] of messages) {
              if (msgs.some((m) => m.id === message_id)) {
                get().removeMessage(convId, message_id);
                break;
              }
            }
            break;
          }

          case 'ReactionAdded': {
            const { message_id, user_id, emoji } = message.payload;
            const messages = get().messages;
            for (const [convId, msgs] of messages) {
              const msg = msgs.find((m) => m.id === message_id);
              if (msg) {
                const reactions = [...(msg.reactions || [])];
                const existingReaction = reactions.find((r) => r.emoji === emoji);
                if (existingReaction) {
                  existingReaction.count++;
                  if (!existingReaction.users.includes(user_id)) {
                    existingReaction.users.push(user_id);
                  }
                } else {
                  reactions.push({ emoji, count: 1, users: [user_id], has_reacted: false });
                }
                get().updateMessage(convId, message_id, { reactions });
                break;
              }
            }
            break;
          }

          case 'ReactionRemoved': {
            const { message_id, user_id, emoji } = message.payload;
            const messages = get().messages;
            for (const [convId, msgs] of messages) {
              const msg = msgs.find((m) => m.id === message_id);
              if (msg) {
                const reactions = (msg.reactions || [])
                  .map((r) => {
                    if (r.emoji === emoji) {
                      return {
                        ...r,
                        count: r.count - 1,
                        users: r.users.filter((u) => u !== user_id),
                      };
                    }
                    return r;
                  })
                  .filter((r) => r.count > 0);
                get().updateMessage(convId, message_id, { reactions });
                break;
              }
            }
            break;
          }

          case 'MessagePinned': {
            const { message_id } = message.payload;
            const messages = get().messages;
            for (const [convId, msgs] of messages) {
              if (msgs.some((m) => m.id === message_id)) {
                get().updateMessage(convId, message_id, { is_pinned: true });
                break;
              }
            }
            break;
          }

          case 'MessageUnpinned': {
            const { message_id } = message.payload;
            const messages = get().messages;
            for (const [convId, msgs] of messages) {
              if (msgs.some((m) => m.id === message_id)) {
                get().updateMessage(convId, message_id, { is_pinned: false });
                break;
              }
            }
            break;
          }

          case 'TypingStarted': {
            const { conversation_id, user_id, username } = message.payload;
            const typingUsers = new Map(get().typingUsers);
            const users = typingUsers.get(conversation_id) || [];
            if (!users.find((u) => u.user_id === user_id)) {
              users.push({ user_id, username, started_at: Date.now() });
              typingUsers.set(conversation_id, users);
              set({ typingUsers });
            }
            break;
          }

          case 'TypingStopped': {
            const { conversation_id, user_id } = message.payload;
            const typingUsers = new Map(get().typingUsers);
            const users = (typingUsers.get(conversation_id) || []).filter(
              (u) => u.user_id !== user_id
            );
            if (users.length > 0) {
              typingUsers.set(conversation_id, users);
            } else {
              typingUsers.delete(conversation_id);
            }
            set({ typingUsers });
            break;
          }

          case 'UnreadCount': {
            const { conversation_id, count } = message.payload;
            const unreadCounts = new Map(get().unreadCounts);
            unreadCounts.set(conversation_id, count);
            set({ unreadCounts });
            break;
          }
        }
      },

      addMessageToConversation: (conversationId: string, message: ChatMessage) => {
        const messages = new Map(get().messages);
        const convMessages = [...(messages.get(conversationId) || [])];
        // Add at the beginning (messages are sorted newest first from API)
        convMessages.unshift(message);
        messages.set(conversationId, convMessages);
        set({ messages });
      },

      updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
        const messages = new Map(get().messages);
        const convMessages = messages.get(conversationId);
        if (convMessages) {
          const updated = convMessages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          );
          messages.set(conversationId, updated);
          set({ messages });
        }
      },

      removeMessage: (conversationId: string, messageId: string) => {
        const messages = new Map(get().messages);
        const convMessages = messages.get(conversationId);
        if (convMessages) {
          const filtered = convMessages.filter((m) => m.id !== messageId);
          messages.set(conversationId, filtered);
          set({ messages });
        }
      },
    }),
    {
      name: 'rustpress-chat',
      partialize: (state) => ({
        // Only persist UI preferences, not message data
        isOpen: state.isOpen,
      }),
    }
  )
);

// Subscribe to WebSocket messages for chat
websocketService.addMessageHandler((message) => {
  useChatStore.getState().handleMessage(message);
});

export default useChatStore;
