/**
 * FindReplace - In-file find and replace (Ctrl+F / Ctrl+H)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ChevronUp, ChevronDown, Replace,
  CaseSensitive, Regex, WholeWord, ReplaceAll
} from 'lucide-react';

interface FindReplaceProps {
  isOpen: boolean;
  showReplace?: boolean;
  onClose: () => void;
  onFind: (query: string, options: FindOptions) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onReplace: (replaceWith: string) => void;
  onReplaceAll: (replaceWith: string) => void;
  matchCount?: number;
  currentMatch?: number;
}

interface FindOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export const FindReplace: React.FC<FindReplaceProps> = ({
  isOpen,
  showReplace: initialShowReplace = false,
  onClose,
  onFind,
  onFindNext,
  onFindPrevious,
  onReplace,
  onReplaceAll,
  matchCount = 0,
  currentMatch = 0
}) => {
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(initialShowReplace);
  const [options, setOptions] = useState<FindOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowReplace(initialShowReplace);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialShowReplace]);

  useEffect(() => {
    if (query) {
      onFind(query, options);
    }
  }, [query, options, onFind]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onFindPrevious();
      } else {
        onFindNext();
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrevious();
      } else {
        onFindNext();
      }
    }
  };

  const toggleOption = (key: keyof FindOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="absolute top-0 right-4 z-20 bg-gray-800 border border-gray-700 rounded-b-lg shadow-xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <div className="p-2">
            {/* Find Row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReplace(!showReplace)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Toggle Replace"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showReplace ? 'rotate-0' : '-rotate-90'}`} />
              </button>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find"
                  className="w-64 px-3 py-1.5 pr-20 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button
                    onClick={() => toggleOption('caseSensitive')}
                    className={`p-1 rounded transition-colors ${
                      options.caseSensitive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Case Sensitive (Alt+C)"
                  >
                    <CaseSensitive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleOption('wholeWord')}
                    className={`p-1 rounded transition-colors ${
                      options.wholeWord ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Whole Word (Alt+W)"
                  >
                    <WholeWord className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleOption('useRegex')}
                    className={`p-1 rounded transition-colors ${
                      options.useRegex ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Use Regex (Alt+R)"
                  >
                    <Regex className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="text-xs text-gray-400 min-w-[60px] text-center">
                {query ? `${currentMatch} of ${matchCount}` : 'No results'}
              </span>

              <button
                onClick={onFindPrevious}
                disabled={matchCount === 0}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Match (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              <button
                onClick={onFindNext}
                disabled={matchCount === 0}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Match (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Close (Escape)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Replace Row */}
            {showReplace && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 mt-2"
              >
                <div className="w-6" /> {/* Spacer */}

                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="Replace"
                  className="w-64 px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />

                <button
                  onClick={() => onReplace(replaceQuery)}
                  disabled={matchCount === 0}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Replace (Ctrl+Shift+1)"
                >
                  <Replace className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onReplaceAll(replaceQuery)}
                  disabled={matchCount === 0}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Replace All (Ctrl+Shift+Enter)"
                >
                  <ReplaceAll className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FindReplace;
