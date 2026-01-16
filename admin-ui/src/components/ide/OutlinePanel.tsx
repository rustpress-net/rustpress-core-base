/**
 * OutlinePanel - File symbols/structure navigator
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight, ChevronDown, Code, Hash, Box,
  FunctionSquare, Variable, Braces, Tag, AtSign,
  Type, FileCode, Heading1, Heading2, Heading3
} from 'lucide-react';

interface Symbol {
  name: string;
  kind: 'function' | 'class' | 'variable' | 'property' | 'method' | 'interface' | 'tag' | 'id' | 'heading' | 'block';
  line: number;
  column: number;
  children?: Symbol[];
}

interface OutlinePanelProps {
  content: string;
  language: string;
  onNavigate: (line: number, column: number) => void;
}

function parseSymbols(content: string, language: string): Symbol[] {
  const lines = content.split('\n');
  const symbols: Symbol[] = [];

  if (language === 'html' || language === 'html-jinja') {
    // Parse HTML structure
    const tagRegex = /<(\w+)[^>]*(?:id=["']([^"']+)["'])?[^>]*(?:class=["']([^"']+)["'])?[^>]*>/g;
    const blockRegex = /\{%\s*block\s+(\w+)\s*%\}/g;

    lines.forEach((line, idx) => {
      let match;

      // Find block tags (Jinja)
      while ((match = blockRegex.exec(line)) !== null) {
        symbols.push({
          name: match[1],
          kind: 'block',
          line: idx + 1,
          column: match.index + 1
        });
      }

      // Find elements with IDs
      while ((match = tagRegex.exec(line)) !== null) {
        if (match[2]) {
          symbols.push({
            name: `#${match[2]}`,
            kind: 'id',
            line: idx + 1,
            column: match.index + 1
          });
        }
      }
    });
  } else if (language === 'css' || language === 'scss') {
    // Parse CSS selectors
    const selectorRegex = /^([.#]?[\w-]+(?:\s*[,>+~]\s*[.#]?[\w-]+)*)\s*\{/gm;

    lines.forEach((line, idx) => {
      const match = selectorRegex.exec(line);
      if (match) {
        symbols.push({
          name: match[1].trim(),
          kind: match[1].startsWith('#') ? 'id' : match[1].startsWith('.') ? 'property' : 'tag',
          line: idx + 1,
          column: 1
        });
      }
      selectorRegex.lastIndex = 0;
    });
  } else if (language === 'javascript' || language === 'typescript') {
    // Parse JS/TS
    const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*:\s*\(|(\w+)\s*\([^)]*\)\s*\{)/g;
    const classRegex = /class\s+(\w+)/g;
    const constRegex = /(?:const|let|var)\s+(\w+)\s*=/g;

    lines.forEach((line, idx) => {
      let match;

      while ((match = classRegex.exec(line)) !== null) {
        symbols.push({
          name: match[1],
          kind: 'class',
          line: idx + 1,
          column: match.index + 1
        });
      }

      while ((match = functionRegex.exec(line)) !== null) {
        const name = match[1] || match[2] || match[3] || match[4];
        if (name) {
          symbols.push({
            name,
            kind: 'function',
            line: idx + 1,
            column: match.index + 1
          });
        }
      }
    });
  } else if (language === 'json') {
    // Parse JSON keys
    const keyRegex = /"([^"]+)":/g;
    let depth = 0;

    lines.forEach((line, idx) => {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      depth += openBraces - closeBraces;

      let match;
      while ((match = keyRegex.exec(line)) !== null) {
        if (depth <= 2) {
          symbols.push({
            name: match[1],
            kind: 'property',
            line: idx + 1,
            column: match.index + 1
          });
        }
      }
    });
  } else if (language === 'markdown') {
    // Parse Markdown headings
    const headingRegex = /^(#{1,6})\s+(.+)$/;

    lines.forEach((line, idx) => {
      const match = headingRegex.exec(line);
      if (match) {
        symbols.push({
          name: match[2],
          kind: 'heading',
          line: idx + 1,
          column: 1
        });
      }
    });
  }

  return symbols;
}

const symbolIcons: Record<Symbol['kind'], React.ElementType> = {
  function: FunctionSquare,
  class: Box,
  variable: Variable,
  property: Braces,
  method: Code,
  interface: Type,
  tag: Tag,
  id: AtSign,
  heading: Heading1,
  block: FileCode
};

interface SymbolItemProps {
  symbol: Symbol;
  onNavigate: (line: number, column: number) => void;
  depth?: number;
}

const SymbolItem: React.FC<SymbolItemProps> = ({ symbol, onNavigate, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = symbol.children && symbol.children.length > 0;
  const Icon = symbolIcons[symbol.kind] || Code;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNavigate(symbol.line, symbol.column);
        }}
        className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-gray-800 rounded transition-colors text-left"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )
        ) : (
          <span className="w-3" />
        )}
        <Icon className={`w-4 h-4 ${
          symbol.kind === 'function' ? 'text-purple-400' :
          symbol.kind === 'class' ? 'text-yellow-400' :
          symbol.kind === 'variable' ? 'text-blue-400' :
          symbol.kind === 'property' ? 'text-green-400' :
          symbol.kind === 'id' ? 'text-orange-400' :
          symbol.kind === 'block' ? 'text-pink-400' :
          'text-gray-400'
        }`} />
        <span className="text-gray-300 truncate">{symbol.name}</span>
        <span className="ml-auto text-gray-500 text-[10px]">:{symbol.line}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {symbol.children!.map((child, idx) => (
            <SymbolItem
              key={`${child.name}-${idx}`}
              symbol={child}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OutlinePanel: React.FC<OutlinePanelProps> = ({
  content,
  language,
  onNavigate
}) => {
  const [filter, setFilter] = useState('');

  const symbols = useMemo(() => {
    return parseSymbols(content, language);
  }, [content, language]);

  const filteredSymbols = useMemo(() => {
    if (!filter) return symbols;
    return symbols.filter(s =>
      s.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [symbols, filter]);

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-2 border-b border-gray-700">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter symbols..."
          className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Symbols List */}
      <div className="flex-1 overflow-auto py-2">
        {filteredSymbols.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-xs">
            No symbols found
          </div>
        ) : (
          filteredSymbols.map((symbol, idx) => (
            <SymbolItem
              key={`${symbol.name}-${idx}`}
              symbol={symbol}
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-[10px] text-gray-500">
        {symbols.length} symbol{symbols.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default OutlinePanel;
