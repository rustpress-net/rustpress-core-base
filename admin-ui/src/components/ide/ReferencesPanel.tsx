/**
 * ReferencesPanel - Find and navigate to all references of a symbol
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Search, FileCode, ChevronDown, ChevronRight,
  Filter, X, RefreshCw, ExternalLink
} from 'lucide-react';

export interface Reference {
  id: string;
  filePath: string;
  line: number;
  column: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
  isDefinition?: boolean;
  isWrite?: boolean;
}

export interface ReferenceGroup {
  filePath: string;
  references: Reference[];
}

interface ReferencesPanelProps {
  symbolName?: string;
  groups: ReferenceGroup[];
  totalCount: number;
  isSearching?: boolean;
  onNavigate: (filePath: string, line: number, column: number) => void;
  onClose: () => void;
  onRefresh: () => void;
  filter?: {
    includeDefinition: boolean;
    includeReads: boolean;
    includeWrites: boolean;
  };
  onFilterChange?: (filter: ReferencesPanelProps['filter']) => void;
}

export const ReferencesPanel: React.FC<ReferencesPanelProps> = ({
  symbolName,
  groups,
  totalCount,
  isSearching = false,
  onNavigate,
  onClose,
  onRefresh,
  filter = { includeDefinition: true, includeReads: true, includeWrites: true },
  onFilterChange,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(groups.map((g) => g.filePath))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const toggleFile = (filePath: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) next.delete(filePath);
      else next.add(filePath);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFiles(new Set(groups.map((g) => g.filePath)));
  };

  const collapseAll = () => {
    setExpandedFiles(new Set());
  };

  const getFileName = (path: string) => path.split('/').pop() || path;

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      references: group.references.filter((ref) => {
        const matchesSearch =
          searchQuery === '' ||
          ref.lineContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.filePath.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          (filter.includeDefinition || !ref.isDefinition) &&
          (filter.includeWrites || !ref.isWrite) &&
          (filter.includeReads || ref.isDefinition || ref.isWrite);
        return matchesSearch && matchesFilter;
      }),
    }))
    .filter((group) => group.references.length > 0);

  const highlightMatch = (text: string, start: number, end: number) => {
    if (start < 0 || end <= start) return text;
    return (
      <>
        <span>{text.slice(0, start)}</span>
        <span className="bg-yellow-500/30 text-yellow-300">{text.slice(start, end)}</span>
        <span>{text.slice(end)}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            References
          </h3>
          {symbolName && (
            <span className="text-sm text-white font-mono">"{symbolName}"</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={isSearching}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-3 py-2 border-b border-gray-700 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter references..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded transition-colors ${
              showFilters ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && onFilterChange && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.includeDefinition}
                  onChange={(e) =>
                    onFilterChange({ ...filter, includeDefinition: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
                Definitions
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.includeReads}
                  onChange={(e) =>
                    onFilterChange({ ...filter, includeReads: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
                Reads
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.includeWrites}
                  onChange={(e) =>
                    onFilterChange({ ...filter, includeWrites: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
                Writes
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand/Collapse */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {filteredGroups.reduce((acc, g) => acc + g.references.length, 0)} references in{' '}
            {filteredGroups.length} files
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-gray-400 hover:text-white"
            >
              Expand All
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={collapseAll}
              className="text-gray-400 hover:text-white"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* References List */}
      <div className="flex-1 overflow-auto">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <RefreshCw className="w-10 h-10 text-blue-400 mb-3 animate-spin" />
            <p className="text-sm text-gray-400">Searching for references...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Link2 className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No references found</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedFiles.has(group.filePath);

            return (
              <div key={group.filePath} className="border-b border-gray-800">
                <button
                  onClick={() => toggleFile(group.filePath)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300 flex-1 truncate">
                    {getFileName(group.filePath)}
                  </span>
                  <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-800 rounded">
                    {group.references.length}
                  </span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {group.references.map((ref) => (
                        <div
                          key={ref.id}
                          onClick={() => onNavigate(ref.filePath, ref.line, ref.column)}
                          className="group flex items-start gap-2 px-3 py-1.5 pl-10 cursor-pointer hover:bg-gray-800/50"
                        >
                          <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
                            {ref.line}
                          </span>
                          <code className="text-xs text-gray-300 font-mono truncate flex-1">
                            {highlightMatch(
                              ref.lineContent.trim(),
                              ref.matchStart - (ref.lineContent.length - ref.lineContent.trimStart().length),
                              ref.matchEnd - (ref.lineContent.length - ref.lineContent.trimStart().length)
                            )}
                          </code>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {ref.isDefinition && (
                              <span className="px-1 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                def
                              </span>
                            )}
                            {ref.isWrite && !ref.isDefinition && (
                              <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                write
                              </span>
                            )}
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        {totalCount} total references
      </div>
    </div>
  );
};

export default ReferencesPanel;
