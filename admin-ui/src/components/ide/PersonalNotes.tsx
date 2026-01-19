/**
 * PersonalNotes - Private notes and conversation panel for the IDE
 * Allows developers to take notes, have conversations with themselves,
 * and keep track of thoughts while coding
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Plus, Trash2, Edit2, Save, X,
  Clock, Tag, Search, Pin, PinOff, Smile, Bold, Italic,
  List, Code, Link2, MoreVertical, Download, Upload,
  ChevronDown, ChevronRight, Folder, FileText, Star,
  Bookmark, Hash, AtSign, Lightbulb, Bug, CheckSquare
} from 'lucide-react';

// Types
interface Note {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
  isPinned: boolean;
  isEditing?: boolean;
  category?: 'thought' | 'todo' | 'bug' | 'idea' | 'bookmark';
}

interface Conversation {
  id: string;
  title: string;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

interface PersonalNotesProps {
  currentFilePath?: string;
}

// Quick tags
const quickTags = [
  { id: 'todo', label: 'TODO', icon: CheckSquare, color: 'text-green-400 bg-green-500/20' },
  { id: 'bug', label: 'BUG', icon: Bug, color: 'text-red-400 bg-red-500/20' },
  { id: 'idea', label: 'IDEA', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/20' },
  { id: 'note', label: 'NOTE', icon: FileText, color: 'text-blue-400 bg-blue-500/20' },
  { id: 'bookmark', label: 'BOOKMARK', icon: Bookmark, color: 'text-purple-400 bg-purple-500/20' },
];

// Storage key
const STORAGE_KEY = 'rustpress-personal-notes';

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ currentFilePath }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Convert date strings back to Date objects
        const loaded = data.map((conv: Conversation) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          notes: conv.notes.map((note: Note) => ({
            ...note,
            timestamp: new Date(note.timestamp),
          })),
        }));
        setConversations(loaded);
        // Set active to first pinned or most recent
        const pinned = loaded.find((c: Conversation) => c.isPinned);
        if (pinned) {
          setActiveConversation(pinned);
        } else if (loaded.length > 0) {
          setActiveConversation(loaded[0]);
        }
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll to bottom when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.notes.length]);

  // Create new conversation
  const createConversation = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: `Notes ${new Date().toLocaleDateString()}`,
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv);
  };

  // Delete conversation
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation?.id === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversation(remaining[0] || null);
    }
  };

  // Toggle pin conversation
  const togglePinConversation = (id: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, isPinned: !c.isPinned } : c
    ));
    if (activeConversation?.id === id) {
      setActiveConversation(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
    }
  };

  // Add note to conversation
  const addNote = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: newMessage.trim(),
      timestamp: new Date(),
      tags: selectedTags,
      isPinned: false,
      category: selectedTags.includes('todo') ? 'todo' :
                selectedTags.includes('bug') ? 'bug' :
                selectedTags.includes('idea') ? 'idea' :
                selectedTags.includes('bookmark') ? 'bookmark' : 'thought',
    };

    const updatedConv = {
      ...activeConversation,
      notes: [...activeConversation.notes, newNote],
      updatedAt: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === activeConversation.id ? updatedConv : c
    ));
    setActiveConversation(updatedConv);
    setNewMessage('');
    setSelectedTags([]);
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    if (!activeConversation) return;

    const updatedConv = {
      ...activeConversation,
      notes: activeConversation.notes.filter(n => n.id !== noteId),
      updatedAt: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === activeConversation.id ? updatedConv : c
    ));
    setActiveConversation(updatedConv);
  };

  // Update note
  const updateNote = (noteId: string) => {
    if (!activeConversation || !editContent.trim()) return;

    const updatedConv = {
      ...activeConversation,
      notes: activeConversation.notes.map(n =>
        n.id === noteId ? { ...n, content: editContent.trim() } : n
      ),
      updatedAt: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === activeConversation.id ? updatedConv : c
    ));
    setActiveConversation(updatedConv);
    setEditingNoteId(null);
    setEditContent('');
  };

  // Toggle pin note
  const togglePinNote = (noteId: string) => {
    if (!activeConversation) return;

    const updatedConv = {
      ...activeConversation,
      notes: activeConversation.notes.map(n =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
      ),
      updatedAt: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === activeConversation.id ? updatedConv : c
    ));
    setActiveConversation(updatedConv);
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  // Filter notes by search
  const filteredNotes = activeConversation?.notes.filter(note => {
    if (!searchQuery) return true;
    return note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Sort notes (pinned first, then by date)
  const sortedNotes = filteredNotes?.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  }).reverse();

  // Export notes
  const exportNotes = () => {
    const data = JSON.stringify(conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rustpress-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Conversation List */}
      <AnimatePresence>
        {showConversationList && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-gray-800 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  My Notes
                </h3>
                <button
                  onClick={createConversation}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Pinned conversations */}
              {conversations.filter(c => c.isPinned).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 px-2 mb-1 flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </p>
                  {conversations.filter(c => c.isPinned).map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversation?.id === conv.id}
                      onSelect={() => setActiveConversation(conv)}
                      onDelete={() => deleteConversation(conv.id)}
                      onTogglePin={() => togglePinConversation(conv.id)}
                    />
                  ))}
                </div>
              )}

              {/* Other conversations */}
              {conversations.filter(c => !c.isPinned).map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversation?.id === conv.id}
                  onSelect={() => setActiveConversation(conv)}
                  onDelete={() => deleteConversation(conv.id)}
                  onTogglePin={() => togglePinConversation(conv.id)}
                />
              ))}

              {conversations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes yet</p>
                  <button
                    onClick={createConversation}
                    className="mt-2 text-xs text-cyan-400 hover:underline"
                  >
                    Start your first note
                  </button>
                </div>
              )}
            </div>

            {/* Export button */}
            <div className="p-2 border-t border-gray-800">
              <button
                onClick={exportNotes}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Notes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConversationList(!showConversationList)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg lg:hidden"
            >
              {showConversationList ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {activeConversation ? (
              <div>
                <h2 className="text-white font-medium">{activeConversation.title}</h2>
                <p className="text-xs text-gray-500">
                  {activeConversation.notes.length} notes | Updated {formatTime(activeConversation.updatedAt)}
                </p>
              </div>
            ) : (
              <h2 className="text-gray-500">Select or create a conversation</h2>
            )}
          </div>

          {currentFilePath && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">{currentFilePath}</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedNotes?.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative ${note.isPinned ? 'border-l-2 border-cyan-500 pl-3' : ''}`}
            >
              <div className="bg-gray-800 rounded-xl p-4">
                {/* Note header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {note.tags.map(tag => {
                      const tagInfo = quickTags.find(t => t.id === tag);
                      const Icon = tagInfo?.icon || Hash;
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${tagInfo?.color || 'text-gray-400 bg-gray-700'}`}
                        >
                          <Icon className="w-3 h-3" />
                          {tagInfo?.label || tag}
                        </span>
                      );
                    })}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(note.timestamp)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className="p-1.5 text-gray-500 hover:text-cyan-400 rounded"
                    >
                      {note.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditContent(note.content);
                      }}
                      className="p-1.5 text-gray-500 hover:text-white rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note content */}
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateNote(note.id)}
                        className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {activeConversation?.notes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-1">Start a conversation with yourself</p>
              <p className="text-xs">Jot down ideas, bugs, todos, or anything on your mind</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeConversation && (
          <div className="p-4 border-t border-gray-800">
            {/* Quick tags */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
              {quickTags.map(tag => {
                const Icon = tag.icon;
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                      isSelected
                        ? tag.color
                        : 'text-gray-400 bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {/* Text input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind? (Shift+Enter for new line)"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={addNote}
                disabled={!newMessage.trim()}
                className="px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Conversation list item component
const ConversationItem: React.FC<{
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}> = ({ conversation, isActive, onSelect, onDelete, onTogglePin }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative mb-1 rounded-lg transition-colors ${
        isActive ? 'bg-cyan-500/20' : 'hover:bg-gray-800'
      }`}
    >
      <button
        onClick={onSelect}
        className="w-full px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
          <span className={`text-sm truncate ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>
            {conversation.title}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 pl-6">
          {conversation.notes.length} notes
        </p>
      </button>

      {/* Menu */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 text-gray-500 hover:text-white rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1 min-w-[120px]"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                {conversation.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                {conversation.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PersonalNotes;
