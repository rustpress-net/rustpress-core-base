/**
 * ConversationList - Shows list of chat conversations
 * Includes personal notes and group chat creation
 */

import React, { useState, useEffect } from 'react';
import {
  Plus, Users, User, Hash, MessageSquare, Search, Loader2,
  StickyNote, UserPlus, X, Check
} from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import { chatApi, OnlineUser } from '../../../services/chatApi';
import type { ChatConversation } from '../../../types/chat';

export const ConversationList: React.FC = () => {
  const {
    conversations,
    isLoadingConversations,
    unreadCounts,
    setActiveConversation,
    loadConversations,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [personalNotesId, setPersonalNotesId] = useState<string | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const filteredConversations = conversations.filter((conv) =>
    (conv.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load personal notes on mount
  useEffect(() => {
    loadPersonalNotes();
  }, []);

  const loadPersonalNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const response = await chatApi.getPersonalNotes();
      setPersonalNotesId(response.id);
    } catch (error) {
      console.error('Failed to load personal notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleOpenPersonalNotes = async () => {
    if (personalNotesId) {
      setActiveConversation(personalNotesId);
    } else {
      await loadPersonalNotes();
      if (personalNotesId) {
        setActiveConversation(personalNotesId);
      }
    }
  };

  const handleCreateConversation = async () => {
    setIsCreating(true);
    try {
      const response = await chatApi.createConversation({ title: 'New Conversation' });
      await loadConversations();
      setActiveConversation(response.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-800 space-y-2">
        {/* Personal Notes Button */}
        <button
          onClick={handleOpenPersonalNotes}
          disabled={isLoadingNotes}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-amber-900/30 to-orange-900/30 hover:from-amber-900/50 hover:to-orange-900/50 border border-amber-700/50 rounded-lg text-sm font-medium text-amber-200 transition-all"
        >
          {isLoadingNotes ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <StickyNote className="w-5 h-5" />
          )}
          <span className="flex-1 text-left">Personal Notes</span>
          <span className="text-xs text-amber-400/70">Private</span>
        </button>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          <button
            onClick={handleCreateConversation}
            disabled={isCreating}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Direct
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Group Chat
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                unreadCount={unreadCounts.get(conversation.id) || 0}
                onClick={() => setActiveConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Group Chat Modal */}
      {showGroupModal && (
        <CreateGroupChatModal
          onClose={() => setShowGroupModal(false)}
          onCreated={(id) => {
            setShowGroupModal(false);
            loadConversations();
            setActiveConversation(id);
          }}
        />
      )}
    </div>
  );
};

interface ConversationItemProps {
  conversation: ChatConversation;
  unreadCount: number;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  unreadCount,
  onClick,
}) => {
  const getIcon = () => {
    switch (conversation.type) {
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'channel':
        return <Hash className="w-4 h-4" />;
      case 'personal':
        return <StickyNote className="w-4 h-4 text-amber-400" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        conversation.type === 'personal'
          ? 'bg-amber-900/30 text-amber-400'
          : conversation.type === 'group'
          ? 'bg-purple-900/30 text-purple-400'
          : 'bg-gray-700 text-gray-400'
      }`}>
        {getIcon()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white truncate">
            {conversation.title || 'Untitled'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(conversation.updated_at)}
          </span>
        </div>
        {conversation.last_message && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {conversation.last_message.content}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </button>
  );
};

// ============================================
// Create Group Chat Modal
// ============================================

interface CreateGroupChatModalProps {
  onClose: () => void;
  onCreated: (id: string) => void;
}

const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOnlineUsers();
  }, []);

  const loadOnlineUsers = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getOnlineUsers();
      setOnlineUsers(response.users);
    } catch (error) {
      console.error('Failed to load online users:', error);
      setError('Failed to load online users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedUsers.size === 0) {
      setError('Please select at least one participant');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const response = await chatApi.createGroupChat({
        title: title.trim(),
        participant_ids: Array.from(selectedUsers),
      });
      onCreated(response.id);
    } catch (error) {
      console.error('Failed to create group chat:', error);
      setError('Failed to create group chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Create Group Chat</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Online Users */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Select Participants ({onlineUsers.length} online)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : onlineUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No other users online</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {onlineUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        selectedUsers.has(user.id)
                          ? 'bg-purple-900/30'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">
                          {user.display_name}
                        </p>
                        {user.current_file && (
                          <p className="text-xs text-gray-500 truncate">
                            Editing: {user.current_file}
                          </p>
                        )}
                      </div>

                      {/* Check */}
                      {selectedUsers.has(user.id) && (
                        <Check className="w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !title.trim() || selectedUsers.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            Create Group ({selectedUsers.size + 1} members)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
