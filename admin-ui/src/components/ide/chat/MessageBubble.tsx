/**
 * MessageBubble - Individual chat message display
 */

import React, { useState } from 'react';
import {
  MoreHorizontal,
  Reply,
  Star,
  Pin,
  Clock,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import type { ChatMessage } from '../../../types/chat';
import { MessageReactions } from './MessageReactions';

interface MessageBubbleProps {
  message: ChatMessage;
  showHeader: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showHeader,
}) => {
  const {
    currentUserId,
    editMessage,
    deleteMessage,
    toggleStar,
    togglePin,
  } = useChatStore();

  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwn = message.sender_id === currentUserId;
  const isDeleted = !!message.deleted_at;

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this message?')) {
      await deleteMessage(message.id);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isDeleted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-gray-500 text-sm italic">
        <Trash2 className="w-4 h-4" />
        <span>This message was deleted</span>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header with sender info */}
      {showHeader && !isOwn && (
        <div className="flex items-center gap-2 mb-1 ml-1">
          <span className="text-sm font-medium text-white">
            {message.sender_name || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-800 text-white rounded-bl-md'
        }`}
      >
        {/* Pin indicator */}
        {message.is_pinned && (
          <div className="absolute -top-2 -left-2">
            <Pin className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </div>
        )}

        {/* Edit mode */}
        {isEditing ? (
          <div className="min-w-[200px]">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-900 text-white rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-1 text-green-400 hover:text-green-300"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            {message.is_edited && (
              <span className="text-xs opacity-60 ml-2">(edited)</span>
            )}
          </>
        )}

        {/* Time for own messages */}
        {isOwn && showHeader && !isEditing && (
          <div className="text-xs opacity-60 text-right mt-1">
            {formatTime(message.created_at)}
          </div>
        )}
      </div>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`mt-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>
          <MessageReactions
            messageId={message.id}
            reactions={message.reactions}
          />
        </div>
      )}

      {/* Action buttons */}
      {showActions && !isEditing && (
        <div
          className={`absolute top-0 flex items-center gap-1 p-1 bg-gray-900 rounded-lg shadow-lg border border-gray-700 ${
            isOwn ? 'right-full mr-2' : 'left-full ml-2'
          }`}
        >
          <ActionButton
            icon={<Reply className="w-3.5 h-3.5" />}
            label="Reply"
            onClick={() => {/* TODO: Implement reply */}}
          />
          <ActionButton
            icon={<Star className={`w-3.5 h-3.5 ${message.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />}
            label={message.is_starred ? 'Unstar' : 'Star'}
            onClick={() => toggleStar(message.id)}
          />
          {isOwn && (
            <>
              <ActionButton
                icon={<Edit2 className="w-3.5 h-3.5" />}
                label="Edit"
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
              />
              <ActionButton
                icon={<Trash2 className="w-3.5 h-3.5" />}
                label="Delete"
                onClick={handleDelete}
              />
            </>
          )}
          <ActionButton
            icon={<Pin className={`w-3.5 h-3.5 ${message.is_pinned ? 'fill-yellow-400 text-yellow-400' : ''}`} />}
            label={message.is_pinned ? 'Unpin' : 'Pin'}
            onClick={() => togglePin(message.id)}
          />
          <ActionButton
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Remind"
            onClick={() => {/* TODO: Implement reminder */}}
          />
        </div>
      )}
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
    title={label}
  >
    {icon}
  </button>
);

export default MessageBubble;
