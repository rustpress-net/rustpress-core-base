/**
 * ChatSidebar - Main chat container that slides in from the right
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ArrowLeft } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import { ConversationList } from './ConversationList';
import { ConversationView } from './ConversationView';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeConversationId,
    setActiveConversation,
    loadConversations,
  } = useChatStore();

  // Load conversations when opened
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-800 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                {activeConversationId && (
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">
                  {activeConversationId ? 'Conversation' : 'Chat'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeConversationId ? (
                <ConversationView conversationId={activeConversationId} />
              ) : (
                <ConversationList />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
