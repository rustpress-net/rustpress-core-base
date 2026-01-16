/**
 * SnippetsManager - Create and manage code snippets
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Search, Code, Trash2, Edit2, Copy, Check,
  ChevronDown, ChevronRight, Tag, FileCode, Braces
} from 'lucide-react';

export interface Snippet {
  id: string;
  name: string;
  prefix: string;
  description: string;
  body: string;
  language: string;
  category: string;
}

interface SnippetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: Snippet[];
  onAdd: (snippet: Omit<Snippet, 'id'>) => void;
  onEdit: (id: string, snippet: Partial<Snippet>) => void;
  onDelete: (id: string) => void;
  onInsert: (snippet: Snippet) => void;
}

const defaultCategories = ['HTML', 'CSS', 'JavaScript', 'Jinja2', 'Custom'];
const defaultLanguages = ['html', 'css', 'javascript', 'typescript', 'json'];

export const SnippetsManager: React.FC<SnippetsManagerProps> = ({
  isOpen,
  onClose,
  snippets,
  onAdd,
  onEdit,
  onDelete,
  onInsert
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(defaultCategories));

  const [newSnippet, setNewSnippet] = useState<Omit<Snippet, 'id'>>({
    name: '',
    prefix: '',
    description: '',
    body: '',
    language: 'html',
    category: 'Custom'
  });

  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      if (selectedCategory && s.category !== selectedCategory) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return s.name.toLowerCase().includes(searchLower) ||
               s.prefix.toLowerCase().includes(searchLower) ||
               s.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [snippets, selectedCategory, search]);

  const groupedSnippets = useMemo(() => {
    const groups: Record<string, Snippet[]> = {};
    filteredSnippets.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSnippets]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const handleAddSnippet = () => {
    if (!newSnippet.name || !newSnippet.prefix || !newSnippet.body) return;
    onAdd(newSnippet);
    setNewSnippet({
      name: '',
      prefix: '',
      description: '',
      body: '',
      language: 'html',
      category: 'Custom'
    });
    setIsAddingNew(false);
  };

  const handleCopy = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.body);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[500px] z-50 bg-gray-900 border-l border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Code Snippets</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Snippet
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search snippets..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Add New Snippet Form */}
            <AnimatePresence>
              {isAddingNew && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-700 overflow-hidden"
                >
                  <div className="p-4 space-y-3 bg-gray-800/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Name</label>
                        <input
                          type="text"
                          value={newSnippet.name}
                          onChange={(e) => setNewSnippet(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="My Snippet"
                          className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Prefix (trigger)</label>
                        <input
                          type="text"
                          value={newSnippet.prefix}
                          onChange={(e) => setNewSnippet(prev => ({ ...prev, prefix: e.target.value }))}
                          placeholder="mysnip"
                          className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Description</label>
                      <input
                        type="text"
                        value={newSnippet.description}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What this snippet does"
                        className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Language</label>
                        <select
                          value={newSnippet.language}
                          onChange={(e) => setNewSnippet(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          {defaultLanguages.map(lang => (
                            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Category</label>
                        <select
                          value={newSnippet.category}
                          onChange={(e) => setNewSnippet(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          {defaultCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Body (use $1, $2 for tab stops)</label>
                      <textarea
                        value={newSnippet.body}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="<div class='$1'>$2</div>"
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddSnippet}
                        disabled={!newSnippet.name || !newSnippet.prefix || !newSnippet.body}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-white transition-colors"
                      >
                        Add Snippet
                      </button>
                      <button
                        onClick={() => setIsAddingNew(false)}
                        className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Snippets List */}
            <div className="flex-1 overflow-auto">
              {Object.keys(groupedSnippets).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Braces className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No snippets found</p>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="mt-3 text-blue-400 text-sm hover:underline"
                  >
                    Create your first snippet
                  </button>
                </div>
              ) : (
                Object.entries(groupedSnippets).map(([category, categorySnippets]) => (
                  <div key={category} className="border-b border-gray-800">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors text-left"
                    >
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <Tag className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white flex-1">{category}</span>
                      <span className="text-xs text-gray-500">{categorySnippets.length}</span>
                    </button>

                    <AnimatePresence>
                      {expandedCategories.has(category) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {categorySnippets.map(snippet => (
                            <div
                              key={snippet.id}
                              className="px-4 py-3 pl-10 hover:bg-gray-800/50 transition-colors border-t border-gray-800/50 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileCode className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-white font-medium">{snippet.name}</span>
                                    <code className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-blue-400">
                                      {snippet.prefix}
                                    </code>
                                  </div>
                                  {snippet.description && (
                                    <p className="text-xs text-gray-500 mb-2">{snippet.description}</p>
                                  )}
                                  <pre className="text-xs text-gray-400 font-mono bg-gray-800 rounded p-2 overflow-x-auto">
                                    {snippet.body.length > 100 ? snippet.body.slice(0, 100) + '...' : snippet.body}
                                  </pre>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                  <button
                                    onClick={() => onInsert(snippet)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                    title="Insert"
                                  >
                                    <Code className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCopy(snippet)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                    title="Copy"
                                  >
                                    {copiedId === snippet.id ? (
                                      <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onDelete(snippet.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SnippetsManager;
