/**
 * SymbolSearch - Search symbols across workspace (Ctrl+T)
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, Hash, Box, FunctionSquare, Variable,
  Braces, Tag, Type, FileCode, ChevronRight
} from 'lucide-react';

export interface WorkspaceSymbol {
  name: string;
  kind: 'function' | 'class' | 'variable' | 'property' | 'method' | 'interface' | 'tag' | 'type';
  file: string;
  line: number;
  column: number;
  containerName?: string;
}

interface SymbolSearchProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: WorkspaceSymbol[];
  onNavigate: (file: string, line: number, column: number) => void;
}

const symbolIcons: Record<WorkspaceSymbol['kind'], { icon: React.ElementType; color: string }> = {
  function: { icon: FunctionSquare, color: 'text-purple-400' },
  class: { icon: Box, color: 'text-yellow-400' },
  variable: { icon: Variable, color: 'text-blue-400' },
  property: { icon: Braces, color: 'text-green-400' },
  method: { icon: FunctionSquare, color: 'text-purple-300' },
  interface: { icon: Type, color: 'text-cyan-400' },
  tag: { icon: Tag, color: 'text-orange-400' },
  type: { icon: Type, color: 'text-pink-400' }
};

export const SymbolSearch: React.FC<SymbolSearchProps> = ({
  isOpen,
  onClose,
  symbols,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredSymbols = useMemo(() => {
    const symbolList = symbols || [];
    if (!query.trim()) return symbolList.slice(0, 50);

    const searchTerms = query.toLowerCase().split(/\s+/);
    return symbolList
      .filter(symbol => {
        const searchString = `${symbol.name} ${symbol.containerName || ''} ${symbol.kind}`.toLowerCase();
        return searchTerms.every(term => searchString.includes(term));
      })
      .slice(0, 50);
  }, [symbols, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredSymbols.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSymbols[selectedIndex]) {
          const symbol = filteredSymbols[selectedIndex];
          onNavigate(symbol.file, symbol.line, symbol.column);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredSymbols, selectedIndex, onNavigate, onClose]);

  const handleSelect = (symbol: WorkspaceSymbol) => {
    onNavigate(symbol.file, symbol.line, symbol.column);
    onClose();
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center px-4 py-3 border-b border-gray-700">
                <Hash className="w-5 h-5 text-blue-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search symbols by name..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Type to search</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Esc</kbd>
                </div>
              </div>

              {/* Symbol Kind Filter Pills */}
              <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-gray-500">Filter:</span>
                {Object.entries(symbolIcons).map(([kind, { icon: Icon, color }]) => (
                  <button
                    key={kind}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:bg-gray-800 transition-colors"
                    onClick={() => setQuery(prev => `${prev} ${kind}`.trim())}
                  >
                    <Icon className={`w-3 h-3 ${color}`} />
                    {kind}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-96 overflow-auto">
                {filteredSymbols.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No symbols found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  filteredSymbols.map((symbol, index) => {
                    const { icon: Icon, color } = symbolIcons[symbol.kind];
                    const isSelected = index === selectedIndex;

                    return (
                      <button
                        key={`${symbol.file}-${symbol.name}-${symbol.line}`}
                        onClick={() => handleSelect(symbol)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          isSelected ? 'bg-blue-600/20' : 'hover:bg-gray-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-medium truncate">
                              {symbol.name}
                            </span>
                            {symbol.containerName && (
                              <>
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                                <span className="text-xs text-gray-500 truncate">
                                  {symbol.containerName}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FileCode className="w-3 h-3" />
                            <span className="truncate">{symbol.file}</span>
                            <span>:{symbol.line}</span>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${color} bg-gray-800`}>
                          {symbol.kind}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {filteredSymbols.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                  <span>{filteredSymbols.length} symbol{filteredSymbols.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-4">
                    <span><kbd className="px-1 bg-gray-700 rounded">↑↓</kbd> navigate</span>
                    <span><kbd className="px-1 bg-gray-700 rounded">Enter</kbd> go to</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SymbolSearch;
