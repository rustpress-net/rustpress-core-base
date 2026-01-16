/**
 * QuickOpen - Quick file picker (Ctrl+P)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, File, Folder, Clock, Star, X,
  FileCode, FileJson, FileText, Image, Settings
} from 'lucide-react';
import type { FileNode } from '../../services/fileSystemService';

interface QuickOpenProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (path: string, name: string) => void;
  files: FileNode[];
  recentFiles?: string[];
}

interface FlatFile {
  path: string;
  name: string;
  type: 'file' | 'folder';
  depth: number;
}

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = "w-4 h-4";

  switch (ext) {
    case 'json':
      return <FileJson className={`${iconClass} text-yellow-400`} />;
    case 'html':
    case 'htm':
      return <FileCode className={`${iconClass} text-orange-400`} />;
    case 'css':
    case 'scss':
      return <FileCode className={`${iconClass} text-blue-400`} />;
    case 'js':
    case 'jsx':
      return <FileCode className={`${iconClass} text-yellow-300`} />;
    case 'ts':
    case 'tsx':
      return <FileCode className={`${iconClass} text-blue-300`} />;
    case 'rs':
      return <FileCode className={`${iconClass} text-orange-500`} />;
    case 'toml':
      return <Settings className={`${iconClass} text-gray-400`} />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'gif':
      return <Image className={`${iconClass} text-purple-400`} />;
    case 'md':
      return <FileText className={`${iconClass} text-gray-400`} />;
    default:
      return <File className={`${iconClass} text-gray-400`} />;
  }
}

function flattenFiles(nodes: FileNode[], depth = 0): FlatFile[] {
  const result: FlatFile[] = [];

  for (const node of nodes) {
    if (node.type === 'file') {
      result.push({
        path: node.path,
        name: node.name,
        type: node.type,
        depth,
      });
    }
    if (node.children) {
      result.push(...flattenFiles(node.children, depth + 1));
    }
  }

  return result;
}

function fuzzyMatch(query: string, text: string): { match: boolean; score: number } {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  if (!query) return { match: true, score: 0 };

  // Exact match gets highest score
  if (lowerText === lowerQuery) return { match: true, score: 1000 };

  // Contains match
  if (lowerText.includes(lowerQuery)) {
    const index = lowerText.indexOf(lowerQuery);
    return { match: true, score: 500 - index };
  }

  // Fuzzy match
  let queryIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      score += 10 + consecutiveMatches * 5;
      consecutiveMatches++;
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
  }

  if (queryIndex === query.length) {
    return { match: true, score };
  }

  return { match: false, score: 0 };
}

export const QuickOpen: React.FC<QuickOpenProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  files,
  recentFiles = []
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Flatten file tree
  const flatFiles = useMemo(() => flattenFiles(files), [files]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    if (!query) {
      // Show recent files first when no query
      const recent = recentFiles
        .map(path => flatFiles.find(f => f.path === path))
        .filter(Boolean) as FlatFile[];
      const others = flatFiles.filter(f => !recentFiles.includes(f.path));
      return [...recent.slice(0, 5), ...others].slice(0, 50);
    }

    return flatFiles
      .map(file => ({
        ...file,
        ...fuzzyMatch(query, file.name),
        pathMatch: fuzzyMatch(query, file.path),
      }))
      .filter(f => f.match || f.pathMatch.match)
      .sort((a, b) => {
        const scoreA = Math.max(a.score, a.pathMatch.score);
        const scoreB = Math.max(b.score, b.pathMatch.score);
        return scoreB - scoreA;
      })
      .slice(0, 50);
  }, [flatFiles, query, recentFiles]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-quick-open-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredFiles.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredFiles[selectedIndex]) {
          const file = filteredFiles[selectedIndex];
          onFileSelect(file.path, file.name);
          onClose();
        }
        break;
    }
  };

  const handleSelect = (file: FlatFile) => {
    onFileSelect(file.path, file.name);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <div
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search files by name..."
                  className="w-full px-4 py-3 pl-12 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                />
                <button
                  onClick={onClose}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[400px] overflow-auto border-t border-gray-700"
              >
                {filteredFiles.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No files found
                  </div>
                ) : (
                  filteredFiles.map((file, index) => {
                    const isRecent = !query && recentFiles.includes(file.path);
                    return (
                      <button
                        key={file.path}
                        data-quick-open-item
                        onClick={() => handleSelect(file)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-blue-600/30 text-white'
                            : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        {getFileIcon(file.name)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{file.name}</div>
                          <div className="text-xs text-gray-500 truncate">{file.path}</div>
                        </div>
                        {isRecent && (
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
                <span>
                  {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-4">
                  <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">↑↓</kbd> Navigate</span>
                  <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">↵</kbd> Open</span>
                  <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">Esc</kbd> Close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickOpen;
