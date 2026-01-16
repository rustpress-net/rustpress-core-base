/**
 * BookmarksManager - Save and navigate to code bookmarks
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, BookmarkPlus, Trash2, Edit2, Check, X,
  FileCode, ChevronDown, ChevronRight, Folder, Star
} from 'lucide-react';

export interface CodeBookmark {
  id: string;
  name: string;
  filePath: string;
  line: number;
  column: number;
  preview: string;
  category?: string;
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
  createdAt: string;
}

interface BookmarksManagerProps {
  bookmarks: CodeBookmark[];
  currentFile?: string;
  currentLine?: number;
  onNavigate: (filePath: string, line: number, column: number) => void;
  onAdd: (bookmark: Omit<CodeBookmark, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CodeBookmark>) => void;
}

const colorClasses = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

export const BookmarksManager: React.FC<BookmarksManagerProps> = ({
  bookmarks,
  currentFile,
  currentLine,
  onNavigate,
  onAdd,
  onDelete,
  onUpdate,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['default']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ name: '', category: '' });

  // Group bookmarks by category
  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || 'default';
    if (!acc[category]) acc[category] = [];
    acc[category].push(bookmark);
    return acc;
  }, {} as Record<string, CodeBookmark[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleAddBookmark = () => {
    if (!currentFile || currentLine === undefined) return;
    onAdd({
      name: newBookmark.name || `Line ${currentLine}`,
      filePath: currentFile,
      line: currentLine,
      column: 1,
      preview: '',
      category: newBookmark.category || undefined,
    });
    setNewBookmark({ name: '', category: '' });
    setShowAddForm(false);
  };

  const startEdit = (bookmark: CodeBookmark) => {
    setEditingId(bookmark.id);
    setEditName(bookmark.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdate(id, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          Bookmarks
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={!currentFile}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50"
          title="Add bookmark at current position"
        >
          <BookmarkPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="p-3 space-y-2">
              <input
                type="text"
                value={newBookmark.name}
                onChange={(e) => setNewBookmark({ ...newBookmark, name: e.target.value })}
                placeholder="Bookmark name..."
                className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <input
                type="text"
                value={newBookmark.category}
                onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
                placeholder="Category (optional)..."
                className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBookmark}
                  className="flex-1 px-2 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Add Bookmark
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-2 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedBookmarks).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Star className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No bookmarks yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Press Ctrl+Shift+B to add one
            </p>
          </div>
        ) : (
          Object.entries(groupedBookmarks).map(([category, items]) => (
            <div key={category} className="border-b border-gray-800">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left"
              >
                {expandedCategories.has(category) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Folder className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300 flex-1">{category}</span>
                <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-800 rounded">
                  {items.length}
                </span>
              </button>

              {expandedCategories.has(category) && (
                <div className="pb-1">
                  {items.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group flex items-start gap-2 px-3 py-2 hover:bg-gray-800/50 cursor-pointer ml-4"
                      onClick={() => onNavigate(bookmark.filePath, bookmark.line, bookmark.column)}
                    >
                      {bookmark.color && (
                        <span className={`w-2 h-2 rounded-full mt-1.5 ${colorClasses[bookmark.color]}`} />
                      )}
                      <Bookmark className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {editingId === bookmark.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-1 py-0.5 text-sm bg-gray-800 border border-blue-500 rounded focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(bookmark.id)}
                            />
                            <button onClick={() => saveEdit(bookmark.id)} className="p-0.5 text-green-400">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-0.5 text-gray-400">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-white truncate">{bookmark.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FileCode className="w-3 h-3" />
                              <span className="truncate">{bookmark.filePath.split('/').pop()}</span>
                              <span>:{bookmark.line}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(bookmark); }}
                          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} in{' '}
        {Object.keys(groupedBookmarks).length} categor{Object.keys(groupedBookmarks).length !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
};

export default BookmarksManager;
