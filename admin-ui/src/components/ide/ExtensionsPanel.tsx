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
  isOpen?: boolean;
  onClose?: () => void;
  extensions: Extension[];
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onToggle: (id: string) => void;
  embedded?: boolean; // When true, renders as sidebar panel instead of modal
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
  isOpen = true,
  onClose,
  extensions,
  onInstall,
  onUninstall,
  onToggle,
  embedded = false
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [view, setView] = useState<'installed' | 'marketplace'>('marketplace');
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

  // Embedded sidebar panel content
  const panelContent = (
    <div className={embedded ? "flex flex-col h-full" : "flex flex-col h-full"}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Extensions</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onClose && !embedded && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search extensions..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setView('marketplace')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            view === 'marketplace'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setView('installed')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            view === 'installed'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Installed ({extensions.filter(e => e.installed).length})
        </button>
      </div>

      {/* Categories */}
      <div className="px-2 py-1.5 border-b border-gray-700 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors ${
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
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Puzzle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">No extensions found</p>
          </div>
        ) : (
          filteredExtensions.map(ext => (
            <div
              key={ext.id}
              className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
            >
              <div
                className="flex items-start gap-2 p-2 cursor-pointer"
                onClick={() => setExpandedId(expandedId === ext.id ? null : ext.id)}
              >
                {/* Icon */}
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                  {ext.icon ? (
                    <img src={ext.icon} alt={ext.name} className="w-6 h-6" />
                  ) : (
                    <Puzzle className="w-4 h-4 text-purple-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-medium text-white truncate">{ext.name}</h4>
                    <span className="text-[10px] text-gray-500">v{ext.version}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{ext.author}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {renderStars(ext.rating)}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {formatDownloads(ext.downloads)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {ext.installed ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggle(ext.id); }}
                      className={`p-1 rounded text-[10px] transition-colors ${
                        ext.enabled
                          ? 'text-green-400'
                          : 'text-gray-500'
                      }`}
                      title={ext.enabled ? 'Disable' : 'Enable'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onInstall(ext.id); }}
                      className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      title="Install"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
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
                    <div className="p-2 bg-gray-800/30">
                      <p className="text-[11px] text-gray-300 mb-2">{ext.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ext.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {ext.installed ? (
                          <button
                            onClick={() => onUninstall(ext.id)}
                            className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 rounded text-[10px] text-red-400 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Uninstall
                          </button>
                        ) : (
                          <button
                            onClick={() => onInstall(ext.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-[10px] text-white transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Install
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // If embedded, return content directly
  if (embedded) {
    return panelContent;
  }

  // Modal version
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
            {panelContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExtensionsPanel;
