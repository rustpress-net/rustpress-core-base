/**
 * ConversationView - Shows messages in a conversation
 */

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

interface ConversationViewProps {
  conversationId: string;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversationId,
}) => {
  const {
    messages,
    typingUsers,
    isLoadingMessages,
    loadMessages,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const conversationMessages = messages.get(conversationId) || [];
  const typing = typingUsers.get(conversationId) || [];

  // Load messages when conversation changes
  useEffect(() => {
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {/* Messages are sorted newest first, so reverse for display */}
            {[...conversationMessages].reverse().map((message, index, arr) => {
              const prevMessage = arr[index - 1];
              const showHeader =
                !prevMessage ||
                prevMessage.sender_id !== message.sender_id ||
                new Date(message.created_at).getTime() -
                  new Date(prevMessage.created_at).getTime() >
                  300000; // 5 minutes

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showHeader={showHeader}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator */}
        {typing.length > 0 && <TypingIndicator users={typing} />}
      </div>

      {/* Message Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
};

export default ConversationView;
