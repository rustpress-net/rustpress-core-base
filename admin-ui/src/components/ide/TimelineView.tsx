/**
 * TimelineView - Visual history of file changes over time
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, GitCommit, Save, RefreshCw, ChevronDown, ChevronRight,
  FileCode, User, Calendar, RotateCcw, Eye, Diff
} from 'lucide-react';

export interface TimelineEntry {
  id: string;
  type: 'save' | 'commit' | 'autosave' | 'external';
  timestamp: string;
  label: string;
  author?: string;
  message?: string;
  filePath: string;
  changes?: {
    additions: number;
    deletions: number;
  };
  canRestore: boolean;
}

interface TimelineViewProps {
  entries: TimelineEntry[];
  currentFile?: string;
  onRestore: (entryId: string) => void;
  onPreview: (entryId: string) => void;
  onCompare: (entryId: string, compareWith: 'current' | 'previous') => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const typeIcons = {
  save: Save,
  commit: GitCommit,
  autosave: RefreshCw,
  external: FileCode,
};

const typeColors = {
  save: 'text-blue-400',
  commit: 'text-green-400',
  autosave: 'text-yellow-400',
  external: 'text-purple-400',
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  entries,
  currentFile,
  onRestore,
  onPreview,
  onCompare,
  onRefresh,
  isLoading = false,
}) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'save' | 'commit' | 'autosave'>('all');

  const filteredEntries = entries.filter(
    (entry) => filter === 'all' || entry.type === filter
  );

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupEntriesByDate = (entries: TimelineEntry[]) => {
    const groups: Record<string, TimelineEntry[]> = {};
    entries.forEach((entry) => {
      const date = new Date(entry.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  };

  const groupedEntries = groupEntriesByDate(filteredEntries);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50"
          title="Refresh timeline"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex gap-1">
          {(['all', 'save', 'commit', 'autosave'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current File */}
      {currentFile && (
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileCode className="w-3 h-3" />
            <span className="truncate">{currentFile.split('/').pop()}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Clock className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No history available</p>
            <p className="text-xs text-gray-600 mt-1">
              Save changes to start tracking history
            </p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date}>
              <div className="px-3 py-1.5 bg-gray-800/30 border-y border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{date}</span>
                </div>
              </div>

              {dateEntries.map((entry, index) => {
                const Icon = typeIcons[entry.type];
                const isExpanded = expandedEntries.has(entry.id);

                return (
                  <div key={entry.id} className="relative">
                    {/* Timeline line */}
                    {index < dateEntries.length - 1 && (
                      <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-700" />
                    )}

                    <div
                      className="group flex items-start gap-3 px-3 py-2 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => toggleEntry(entry.id)}
                    >
                      {/* Icon */}
                      <div className={`p-1.5 bg-gray-800 rounded-full z-10 ${typeColors[entry.type]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-500" />
                          )}
                          <span className="text-sm text-white truncate">{entry.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <span>{formatTime(entry.timestamp)}</span>
                          {entry.author && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {entry.author}
                              </span>
                            </>
                          )}
                          {entry.changes && (
                            <>
                              <span>•</span>
                              <span className="text-green-400">+{entry.changes.additions}</span>
                              <span className="text-red-400">-{entry.changes.deletions}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-10 mr-3 mb-2 p-2 bg-gray-800/50 rounded space-y-2">
                            {entry.message && (
                              <p className="text-xs text-gray-400">{entry.message}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPreview(entry.id);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCompare(entry.id, 'current');
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                              >
                                <Diff className="w-3 h-3" />
                                Compare
                              </button>
                              {entry.canRestore && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRestore(entry.id);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Restore
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        {filteredEntries.length} entries
        {filter !== 'all' && ` (${filter})`}
      </div>
    </div>
  );
};

export default TimelineView;
