/**
 * CodeActionsPanel - Quick fixes, refactorings, and source actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Lightbulb, Wrench, RefreshCw, Sparkles,
  ChevronRight, Search, Star, Clock, AlertTriangle
} from 'lucide-react';

export type CodeActionKind =
  | 'quickfix'
  | 'refactor'
  | 'refactor.extract'
  | 'refactor.inline'
  | 'refactor.rewrite'
  | 'source'
  | 'source.organizeImports'
  | 'source.fixAll';

export interface CodeAction {
  id: string;
  title: string;
  kind: CodeActionKind;
  description?: string;
  isPreferred?: boolean;
  disabled?: {
    reason: string;
  };
  diagnostics?: {
    message: string;
    severity: 'error' | 'warning' | 'info' | 'hint';
  }[];
}

interface CodeActionsPanelProps {
  actions: CodeAction[];
  position?: { line: number; column: number };
  isLoading?: boolean;
  onApply: (actionId: string) => void;
  onPreview?: (actionId: string) => void;
  recentActions?: string[];
  favoriteActions?: string[];
  onToggleFavorite?: (actionId: string) => void;
}

const kindIcons: Record<CodeActionKind, React.ElementType> = {
  quickfix: Wrench,
  refactor: RefreshCw,
  'refactor.extract': Sparkles,
  'refactor.inline': Wand2,
  'refactor.rewrite': RefreshCw,
  source: Lightbulb,
  'source.organizeImports': RefreshCw,
  'source.fixAll': Wrench,
};

const kindColors: Record<CodeActionKind, string> = {
  quickfix: 'text-yellow-400',
  refactor: 'text-purple-400',
  'refactor.extract': 'text-blue-400',
  'refactor.inline': 'text-green-400',
  'refactor.rewrite': 'text-cyan-400',
  source: 'text-orange-400',
  'source.organizeImports': 'text-pink-400',
  'source.fixAll': 'text-red-400',
};

const kindLabels: Record<CodeActionKind, string> = {
  quickfix: 'Quick Fix',
  refactor: 'Refactor',
  'refactor.extract': 'Extract',
  'refactor.inline': 'Inline',
  'refactor.rewrite': 'Rewrite',
  source: 'Source Action',
  'source.organizeImports': 'Organize Imports',
  'source.fixAll': 'Fix All',
};

export const CodeActionsPanel: React.FC<CodeActionsPanelProps> = ({
  actions,
  position,
  isLoading = false,
  onApply,
  onPreview,
  recentActions = [],
  favoriteActions = [],
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<CodeActionKind | 'all'>('all');
  const [showRecent, setShowRecent] = useState(false);

  // Group actions by kind
  const groupedActions = actions.reduce((acc, action) => {
    const kind = action.kind.split('.')[0] as CodeActionKind;
    if (!acc[kind]) acc[kind] = [];
    acc[kind].push(action);
    return acc;
  }, {} as Record<string, CodeAction[]>);

  // Filter actions
  const filteredActions = actions.filter((action) => {
    const matchesSearch =
      searchQuery === '' ||
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKind =
      selectedKind === 'all' || action.kind.startsWith(selectedKind);
    return matchesSearch && matchesKind;
  });

  // Sort: preferred first, then favorites, then recent
  const sortedActions = [...filteredActions].sort((a, b) => {
    if (a.isPreferred && !b.isPreferred) return -1;
    if (!a.isPreferred && b.isPreferred) return 1;
    if (favoriteActions.includes(a.id) && !favoriteActions.includes(b.id)) return -1;
    if (!favoriteActions.includes(a.id) && favoriteActions.includes(b.id)) return 1;
    return 0;
  });

  const availableKinds = Object.keys(groupedActions) as CodeActionKind[];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Code Actions
          </h3>
          {position && (
            <span className="text-xs text-gray-500">
              Ln {position.line}, Col {position.column}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className={`p-1 rounded transition-colors ${
              showRecent ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Recent actions"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter actions..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Kind Filters */}
      <div className="px-3 py-2 border-b border-gray-700 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setSelectedKind('all')}
          className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
            selectedKind === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({actions.length})
        </button>
        {availableKinds.map((kind) => {
          const Icon = kindIcons[kind] || Lightbulb;
          return (
            <button
              key={kind}
              onClick={() => setSelectedKind(kind)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded whitespace-nowrap ${
                selectedKind === kind
                  ? 'bg-blue-600 text-white'
                  : `bg-gray-800 ${kindColors[kind]} hover:bg-gray-700`
              }`}
            >
              <Icon className="w-3 h-3" />
              {kindLabels[kind]} ({groupedActions[kind]?.length || 0})
            </button>
          );
        })}
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <RefreshCw className="w-10 h-10 text-blue-400 mb-3 animate-spin" />
            <p className="text-sm text-gray-400">Loading code actions...</p>
          </div>
        ) : sortedActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Lightbulb className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No code actions available</p>
            <p className="text-xs text-gray-600 mt-1">
              Place cursor on code to see available actions
            </p>
          </div>
        ) : (
          <div className="py-1">
            {sortedActions.map((action) => {
              const Icon = kindIcons[action.kind] || Lightbulb;
              const isFavorite = favoriteActions.includes(action.id);
              const isDisabled = !!action.disabled;

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`group relative ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <button
                    onClick={() => !isDisabled && onApply(action.id)}
                    disabled={isDisabled}
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-800/50 text-left transition-colors"
                  >
                    {/* Icon */}
                    <div className={`p-1 rounded ${kindColors[action.kind]} bg-gray-800`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{action.title}</span>
                        {action.isPreferred && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            Preferred
                          </span>
                        )}
                      </div>
                      {action.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                      )}
                      {action.disabled && (
                        <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {action.disabled.reason}
                        </p>
                      )}
                      {action.diagnostics && action.diagnostics.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {action.diagnostics.slice(0, 2).map((diag, i) => (
                            <p key={i} className={`text-xs ${
                              diag.severity === 'error' ? 'text-red-400' :
                              diag.severity === 'warning' ? 'text-yellow-400' :
                              'text-gray-500'
                            }`}>
                              {diag.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(action.id);
                          }}
                          className={`p-1 rounded ${
                            isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                          } hover:bg-gray-700`}
                          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      {onPreview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(action.id);
                          }}
                          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          title="Preview changes"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{sortedActions.length} actions available</span>
          <span className="flex items-center gap-1">
            Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">Enter</kbd> to apply
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeActionsPanel;
