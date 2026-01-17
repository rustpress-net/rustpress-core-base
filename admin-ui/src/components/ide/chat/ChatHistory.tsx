/**
 * ChatHistory - Browse chat history with search and filters
 */

import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Filter, Loader2, ArrowLeft } from 'lucide-react';
import { chatApi } from '../../../services/chatApi';
import type { ChatMessage } from '../../../types/chat';
import { MessageBubble } from './MessageBubble';

interface ChatHistoryProps {
  conversationId?: string;
  onClose: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversationId,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [senderId, setSenderId] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadHistory = async (reset = false) => {
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const response = await chatApi.getChatHistory({
        conversation_id: conversationId,
        search: searchQuery || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sender_id: senderId || undefined,
        page: currentPage,
        limit: 50,
      });

      if (reset) {
        setMessages(response.messages);
        setPage(1);
      } else {
        setMessages((prev) => [...prev, ...response.messages]);
      }
      setHasMore(response.messages.length === 50);
      if (!reset) {
        setPage((p) => p + 1);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial history
  useEffect(() => {
    loadHistory(true);
  }, [conversationId]);

  const handleSearch = () => {
    loadHistory(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadHistory(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-medium text-white">Chat History</h2>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Date filters */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No messages found</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showHeader =
                !prevMessage ||
                prevMessage.sender_id !== message.sender_id ||
                new Date(message.created_at).getTime() -
                  new Date(prevMessage.created_at).getTime() >
                  300000;

              return (
                <div key={message.id} className="space-y-1">
                  {/* Date separator */}
                  {(!prevMessage ||
                    new Date(message.created_at).toDateString() !==
                      new Date(prevMessage.created_at).toDateString()) && (
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px bg-gray-800" />
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString([], {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex-1 h-px bg-gray-800" />
                    </div>
                  )}
                  <MessageBubble message={message} showHeader={showHeader} />
                </div>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Load more'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
