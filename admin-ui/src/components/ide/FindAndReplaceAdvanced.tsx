/**
 * FindAndReplaceAdvanced - Advanced search and replace with regex support
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Replace, FileCode, FolderOpen, ChevronDown, ChevronRight,
  X, Check, AlertCircle, RefreshCw, Settings, Filter, Eye, EyeOff,
  CaseSensitive, Regex, WholeWord, ArrowUp, ArrowDown
} from 'lucide-react';

export interface SearchResult {
  id: string;
  file: string;
  line: number;
  column: number;
  matchStart: number;
  matchEnd: number;
  lineContent: string;
  previewBefore?: string;
  previewAfter?: string;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  includePattern: string;
  excludePattern: string;
  searchInFiles: boolean;
  preserveCase: boolean;
}

interface FindAndReplaceAdvancedProps {
  results: SearchResult[];
  totalMatches: number;
  searchQuery: string;
  replaceQuery: string;
  options: SearchOptions;
  isSearching?: boolean;
  currentResultIndex?: number;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (resultId: string, replacement: string) => void;
  onReplaceAll: (replacement: string) => void;
  onReplaceInFile: (file: string, replacement: string) => void;
  onNavigateResult: (direction: 'prev' | 'next') => void;
  onOpenResult: (result: SearchResult) => void;
  onOptionsChange: (options: SearchOptions) => void;
  onQueryChange: (query: string) => void;
  onReplaceQueryChange: (query: string) => void;
  onClose?: () => void;
}

export const FindAndReplaceAdvanced: React.FC<FindAndReplaceAdvancedProps> = ({
  results,
  totalMatches,
  searchQuery,
  replaceQuery,
  options,
  isSearching = false,
  currentResultIndex = 0,
  onSearch,
  onReplace,
  onReplaceAll,
  onReplaceInFile,
  onNavigateResult,
  onOpenResult,
  onOptionsChange,
  onQueryChange,
  onReplaceQueryChange,
  onClose,
}) => {
  const [showReplace, setShowReplace] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [previewReplace, setPreviewReplace] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Group results by file
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.file]) acc[result.file] = [];
    acc[result.file].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  useEffect(() => {
    // Auto-expand all files when searching
    setExpandedFiles(new Set(Object.keys(groupedResults)));
  }, [results]);

  useEffect(() => {
    // Focus search input on mount
    searchInputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, options);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onNavigateResult('prev');
      } else if (e.ctrlKey || e.metaKey) {
        handleSearch();
      } else {
        onNavigateResult('next');
      }
    } else if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const toggleFile = (file: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      return next;
    });
  };

  const updateOption = <K extends keyof SearchOptions>(key: K, value: SearchOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const getFileName = (path: string) => path.split('/').pop() || path;

  const highlightMatch = (content: string, result: SearchResult) => {
    const before = content.slice(0, result.matchStart);
    const match = content.slice(result.matchStart, result.matchEnd);
    const after = content.slice(result.matchEnd);
    return (
      <>
        <span className="text-gray-400">{before}</span>
        <span className="bg-yellow-500/40 text-yellow-200 rounded px-0.5">{match}</span>
        <span className="text-gray-400">{after}</span>
      </>
    );
  };

  const previewReplacement = (content: string, result: SearchResult) => {
    const before = content.slice(0, result.matchStart);
    const after = content.slice(result.matchEnd);
    return (
      <>
        <span className="text-gray-400">{before}</span>
        <span className="bg-green-500/40 text-green-200 rounded px-0.5">{replaceQuery}</span>
        <span className="text-gray-400">{after}</span>
      </>
    );
  };

  const fileCount = Object.keys(groupedResults).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4" />
          Find and Replace
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`p-1 rounded ${showReplace ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Toggle replace"
          >
            <Replace className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b border-gray-700 space-y-2">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full px-3 py-2 pr-24 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => updateOption('caseSensitive', !options.caseSensitive)}
                className={`p-1 rounded ${options.caseSensitive ? 'text-blue-400 bg-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                title="Case sensitive"
              >
                <CaseSensitive className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateOption('wholeWord', !options.wholeWord)}
                className={`p-1 rounded ${options.wholeWord ? 'text-blue-400 bg-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                title="Whole word"
              >
                <WholeWord className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateOption('useRegex', !options.useRegex)}
                className={`p-1 rounded ${options.useRegex ? 'text-blue-400 bg-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                title="Use regex"
              >
                <Regex className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded"
          >
            {isSearching ? (
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Replace Input */}
        <AnimatePresence>
          {showReplace && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={replaceQuery}
                    onChange={(e) => onReplaceQueryChange(e.target.value)}
                    placeholder="Replace with..."
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => setPreviewReplace(!previewReplace)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${previewReplace ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Preview replacement"
                  >
                    {previewReplace ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => onReplaceAll(replaceQuery)}
                  disabled={totalMatches === 0}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 rounded text-xs text-white whitespace-nowrap"
                >
                  Replace All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
        >
          <Filter className="w-3 h-3" />
          <span>Files to include/exclude</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <input
                type="text"
                value={options.includePattern}
                onChange={(e) => updateOption('includePattern', e.target.value)}
                placeholder="Files to include (e.g., *.tsx, src/**)"
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500"
              />
              <input
                type="text"
                value={options.excludePattern}
                onChange={(e) => updateOption('excludePattern', e.target.value)}
                placeholder="Files to exclude (e.g., node_modules/**)"
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>
            {totalMatches} results in {fileCount} files
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigateResult('prev')}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Previous result (Shift+Enter)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[50px] text-center">
            {totalMatches > 0 ? `${currentResultIndex + 1}/${totalMatches}` : '-'}
          </span>
          <button
            onClick={() => onNavigateResult('next')}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Next result (Enter)"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedResults).map(([file, fileResults]) => (
          <div key={file} className="border-b border-gray-800">
            {/* File Header */}
            <div
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 cursor-pointer"
              onClick={() => toggleFile(file)}
            >
              {expandedFiles.has(file) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <FileCode className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-sm text-gray-300 truncate">
                {getFileName(file)}
              </span>
              <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
                {fileResults.length}
              </span>
              {showReplace && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplaceInFile(file, replaceQuery);
                  }}
                  className="p-1 text-gray-400 hover:text-orange-400 hover:bg-orange-500/20 rounded"
                  title="Replace all in file"
                >
                  <Replace className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* File Results */}
            <AnimatePresence>
              {expandedFiles.has(file) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {fileResults.map((result) => (
                    <div
                      key={result.id}
                      className="group flex items-start gap-2 px-3 py-1.5 pl-10 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => onOpenResult(result)}
                    >
                      <span className="text-xs text-gray-600 font-mono w-8 text-right flex-shrink-0">
                        {result.line}
                      </span>
                      <pre className="flex-1 text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                        {previewReplace && replaceQuery
                          ? previewReplacement(result.lineContent, result)
                          : highlightMatch(result.lineContent, result)}
                      </pre>
                      {showReplace && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReplace(result.id, replaceQuery);
                          }}
                          className="p-1 text-gray-400 hover:text-orange-400 hover:bg-orange-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Replace"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {results.length === 0 && searchQuery && !isSearching && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span className="text-sm">No results found</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Enter to navigate • Ctrl+Enter to search</span>
          {options.useRegex && (
            <span className="flex items-center gap-1 text-blue-400">
              <Regex className="w-3 h-3" />
              Regex mode
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindAndReplaceAdvanced;
