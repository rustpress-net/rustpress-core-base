/**
 * MessageReactions - Display and manage message reactions
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import type { MessageReaction } from '../../../types/chat';

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
}

// Common emoji reactions
const QUICK_REACTIONS = ['👍', '👎', '❤️', '😄', '😢', '🎉', '🚀', '👀'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
}) => {
  const { currentUserId, addReaction, removeReaction } = useChatStore();
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by emoji - reactions are already grouped
  const groupedReactions = reactions.reduce<Record<string, { count: number; users: string[]; hasOwn: boolean }>>(
    (acc, reaction) => {
      acc[reaction.emoji] = {
        count: reaction.count,
        users: reaction.users,
        hasOwn: reaction.has_reacted || reaction.users.includes(currentUserId || ''),
      };
      return acc;
    },
    {}
  );

  const handleReactionClick = async (emoji: string) => {
    const group = groupedReactions[emoji];
    if (group?.hasOwn) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    await addReaction(messageId, emoji);
    setShowPicker(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {Object.entries(groupedReactions).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
            data.hasOwn
              ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
              : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
          title={data.users.join(', ')}
        >
          <span>{emoji}</span>
          <span>{data.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Add reaction"
        >
          <Plus className="w-3 h-3" />
        </button>

        {/* Emoji picker */}
        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-20">
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
