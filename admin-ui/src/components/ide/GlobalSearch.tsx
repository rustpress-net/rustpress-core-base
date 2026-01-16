/**
 * GlobalSearch - Search across all files (Ctrl+Shift+F)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ChevronDown, ChevronRight, File,
  Replace, CaseSensitive, Regex, WholeWord, RefreshCw
} from 'lucide-react';

interface SearchResult {
  filePath: string;
  fileName: string;
  matches: {
    line: number;
    column: number;
    text: string;
    matchStart: number;
    matchEnd: number;
  }[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onFileOpen: (path: string, line?: number, column?: number) => void;
  searchInFiles: (query: string, options: SearchOptions) => Promise<SearchResult[]>;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onFileOpen,
  searchInFiles
}) => {
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchInFiles(searchQuery, options);
      setResults(searchResults);
      // Expand all files by default
      setExpandedFiles(new Set(searchResults.map(r => r.filePath)));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchInFiles, options]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, options, performSearch]);

  const toggleFile = (filePath: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toggleOption = (key: keyof SearchOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 350, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-gray-850 border-l border-gray-700 flex flex-col overflow-hidden"
          style={{ backgroundColor: '#1e1e2e' }}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Search</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in files..."
                className="w-full px-3 py-2 pr-24 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => toggleOption('caseSensitive')}
                  className={`p-1 rounded transition-colors ${
                    options.caseSensitive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="Case Sensitive"
                >
                  <CaseSensitive className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleOption('wholeWord')}
                  className={`p-1 rounded transition-colors ${
                    options.wholeWord ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="Whole Word"
                >
                  <WholeWord className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleOption('useRegex')}
                  className={`p-1 rounded transition-colors ${
                    options.useRegex ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="Use Regex"
                >
                  <Regex className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Replace Toggle */}
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {showReplace ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Replace className="w-3 h-3" />
              Replace
            </button>

            {showReplace && (
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Results Summary */}
          {query && (
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700 flex items-center justify-between">
              <span>
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  `${totalMatches} result${totalMatches !== 1 ? 's' : ''} in ${results.length} file${results.length !== 1 ? 's' : ''}`
                )}
              </span>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-auto">
            {results.map(result => (
              <div key={result.filePath} className="border-b border-gray-700/50">
                <button
                  onClick={() => toggleFile(result.filePath)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors"
                >
                  {expandedFiles.has(result.filePath) ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                  <File className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-300 truncate">{result.fileName}</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
                    {result.matches.length}
                  </span>
                </button>

                {expandedFiles.has(result.filePath) && (
                  <div className="bg-gray-900/50">
                    {result.matches.map((match, idx) => (
                      <button
                        key={`${result.filePath}-${idx}`}
                        onClick={() => onFileOpen(result.filePath, match.line, match.column)}
                        className="w-full px-3 py-1.5 pl-10 text-left hover:bg-gray-700/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 min-w-[3rem]">
                            Ln {match.line}
                          </span>
                          <span className="text-xs text-gray-400 truncate font-mono">
                            {match.text.substring(0, match.matchStart)}
                            <span className="bg-yellow-500/30 text-yellow-300">
                              {match.text.substring(match.matchStart, match.matchEnd)}
                            </span>
                            {match.text.substring(match.matchEnd)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!isSearching && query && results.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
