/**
 * MessageInput - Message composer input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, AtSign, Hash } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const { sendMessage, setTyping } = useChatStore();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  // Handle typing indicator
  const handleTyping = () => {
    setTyping(conversationId, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(conversationId, false);
    }, 2000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(conversationId, false);
    };
  }, [conversationId, setTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) return;

    setIsSending(true);
    setTyping(conversationId, false);

    try {
      await sendMessage(conversationId, trimmedContent);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-800 p-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Input area */}
        <div className="relative flex items-end gap-2 bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm px-4 py-3 resize-none focus:outline-none placeholder-gray-500"
            disabled={isSending}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1 pr-2 pb-2">
            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title="Mention someone"
            >
              <AtSign className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title="Add channel"
            >
              <Hash className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Send button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-gray-600 mt-2 text-center">
        Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};

export default MessageInput;
