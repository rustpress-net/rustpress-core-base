/**
 * ExtensionsPanel - Browse and manage IDE extensions
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, Puzzle, Download, Check, Star, ExternalLink,
  Settings, Trash2, RefreshCw, ChevronDown, ChevronRight
} from 'lucide-react';

export interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  icon?: string;
  rating: number;
  downloads: number;
  installed: boolean;
  enabled: boolean;
  category: string;
  tags: string[];
}

interface ExtensionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  extensions: Extension[];
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onToggle: (id: string) => void;
}

const categories = [
  'All',
  'Themes',
  'Languages',
  'Linters',
  'Formatters',
  'Git',
  'Snippets',
  'Other'
];

export const ExtensionsPanel: React.FC<ExtensionsPanelProps> = ({
  isOpen,
  onClose,
  extensions,
  onInstall,
  onUninstall,
  onToggle
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [view, setView] = useState<'installed' | 'marketplace'>('installed');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExtensions = useMemo(() => {
    return extensions.filter(ext => {
      if (view === 'installed' && !ext.installed) return false;
      if (view === 'marketplace' && ext.installed) return false;
      if (selectedCategory !== 'All' && ext.category !== selectedCategory) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return ext.name.toLowerCase().includes(searchLower) ||
               ext.description.toLowerCase().includes(searchLower) ||
               ext.author.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [extensions, view, selectedCategory, search]);

  const formatDownloads = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
      />
    ));
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
            className="fixed top-0 right-0 bottom-0 w-[450px] z-50 bg-gray-900 border-l border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Puzzle className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Extensions</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setView('installed')}
                className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                  view === 'installed'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Installed ({extensions.filter(e => e.installed).length})
              </button>
              <button
                onClick={() => setView('marketplace')}
                className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                  view === 'marketplace'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Marketplace
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search extensions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Extensions List */}
            <div className="flex-1 overflow-auto">
              {filteredExtensions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Puzzle className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No extensions found</p>
                </div>
              ) : (
                filteredExtensions.map(ext => (
                  <div
                    key={ext.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === ext.id ? null : ext.id)}
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {ext.icon ? (
                          <img src={ext.icon} alt={ext.name} className="w-8 h-8" />
                        ) : (
                          <Puzzle className="w-6 h-6 text-purple-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate">{ext.name}</h4>
                          <span className="text-xs text-gray-500">v{ext.version}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{ext.author}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ext.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-0.5">
                            {renderStars(ext.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            <Download className="w-3 h-3 inline mr-1" />
                            {formatDownloads(ext.downloads)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {ext.installed ? (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggle(ext.id); }}
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                ext.enabled
                                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              }`}
                            >
                              {ext.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onUninstall(ext.id); }}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                              title="Uninstall"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onInstall(ext.id); }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Install
                          </button>
                        )}
                        {expandedId === ext.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === ext.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-800"
                        >
                          <div className="p-4 bg-gray-800/30">
                            <p className="text-sm text-gray-300 mb-3">{ext.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {ext.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Category: {ext.category}</span>
                              <span>Version: {ext.version}</span>
                            </div>
                          </div>
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

export default ExtensionsPanel;
