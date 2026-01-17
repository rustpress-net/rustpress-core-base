/**
 * PinnedMessages - Display pinned messages in a conversation
 */

import React from 'react';
import { Pin, X } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import type { ChatMessage } from '../../../types/chat';

interface PinnedMessagesProps {
  conversationId: string;
  onClose: () => void;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  conversationId,
  onClose,
}) => {
  const { messages, togglePin } = useChatStore();

  const conversationMessages = messages.get(conversationId) || [];
  const pinnedMessages = conversationMessages.filter((m) => m.is_pinned);

  const handleUnpin = async (messageId: string) => {
    await togglePin(messageId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Pin className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-medium text-white">Pinned Messages</h2>
          <span className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
            {pinnedMessages.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Pinned messages list */}
      <div className="flex-1 overflow-y-auto p-4">
        {pinnedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Pin className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No pinned messages</p>
            <p className="text-xs mt-1">Pin important messages to find them easily</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pinnedMessages.map((message) => (
              <PinnedMessageItem
                key={message.id}
                message={message}
                formatDate={formatDate}
                onUnpin={() => handleUnpin(message.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface PinnedMessageItemProps {
  message: ChatMessage;
  formatDate: (date: string) => string;
  onUnpin: () => void;
}

const PinnedMessageItem: React.FC<PinnedMessageItemProps> = ({
  message,
  formatDate,
  onUnpin,
}) => {
  return (
    <div className="group relative p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Pin icon */}
      <Pin className="absolute -top-1 -left-1 w-4 h-4 text-yellow-400 fill-yellow-400" />

      {/* Unpin button */}
      <button
        onClick={onUnpin}
        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        title="Unpin message"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Sender info */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-white">
          {message.sender_name || 'Unknown'}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(message.created_at)}
        </span>
      </div>

      {/* Message content */}
      <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
        {message.content}
      </p>

      {/* Reactions summary */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex gap-1 mt-2">
          {Array.from(
            message.reactions.reduce<Map<string, number>>((acc, r) => {
              acc.set(r.emoji, (acc.get(r.emoji) || 0) + 1);
              return acc;
            }, new Map())
          ).map(([emoji, count]) => (
            <span
              key={emoji}
              className="px-1.5 py-0.5 bg-gray-700 rounded text-xs"
            >
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinnedMessages;
