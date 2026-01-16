/**
 * DebugConsole - Interactive debug output and REPL
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Trash2, Filter, Download, ChevronRight,
  AlertCircle, AlertTriangle, Info, Bug, Copy, Check,
  Play, Pause, StopCircle, Search
} from 'lucide-react';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ConsoleEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  line?: number;
  stack?: string;
  data?: unknown;
  count?: number;
}

interface DebugConsoleProps {
  entries: ConsoleEntry[];
  isRunning?: boolean;
  onExecute: (expression: string) => void;
  onClear: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onExport: () => void;
  onSourceClick?: (source: string, line: number) => void;
}

const levelIcons: Record<LogLevel, React.ElementType> = {
  log: Terminal,
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
  debug: Bug,
};

const levelColors: Record<LogLevel, string> = {
  log: 'text-gray-300',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-purple-400',
};

const levelBgColors: Record<LogLevel, string> = {
  log: 'bg-gray-800/50',
  info: 'bg-blue-500/10',
  warn: 'bg-yellow-500/10',
  error: 'bg-red-500/10',
  debug: 'bg-purple-500/10',
};

export const DebugConsole: React.FC<DebugConsoleProps> = ({
  entries,
  isRunning = false,
  onExecute,
  onClear,
  onPause,
  onResume,
  onStop,
  onExport,
  onSourceClick,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [entries]);

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesLevel = filter === 'all' || entry.level === filter;
    const matchesSearch =
      searchQuery === '' ||
      entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.source?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      onExecute(input);
      setHistory((prev) => [...prev, input]);
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const time = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  const formatData = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Debug Console
          </h3>
          {isRunning && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isRunning ? (
            <>
              <button
                onClick={onPause}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={onStop}
                className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                title="Stop"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onResume}
              className="p-1 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onExport}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter logs..."
            className="w-full pl-8 pr-3 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'log', 'info', 'warn', 'error', 'debug'] as const).map((level) => {
            const Icon = level === 'all' ? Filter : levelIcons[level];
            return (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`p-1.5 rounded transition-colors ${
                  filter === level
                    ? 'bg-blue-600 text-white'
                    : `${level !== 'all' ? levelColors[level] : 'text-gray-400'} hover:bg-gray-700`
                }`}
                title={level.charAt(0).toUpperCase() + level.slice(1)}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Console Output */}
      <div ref={consoleRef} className="flex-1 overflow-auto font-mono text-xs">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Terminal className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No console output</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const Icon = levelIcons[entry.level];
            const isExpanded = expandedEntries.has(entry.id);
            const hasExtra = entry.stack || entry.data;

            return (
              <div
                key={entry.id}
                className={`group border-b border-gray-800 ${levelBgColors[entry.level]}`}
              >
                <div
                  className="flex items-start gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-800/50"
                  onClick={() => hasExtra && toggleExpanded(entry.id)}
                >
                  {/* Expand Icon */}
                  {hasExtra && (
                    <ChevronRight
                      className={`w-3 h-3 text-gray-500 mt-0.5 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}

                  {/* Level Icon */}
                  <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${levelColors[entry.level]}`} />

                  {/* Timestamp */}
                  <span className="text-gray-600 flex-shrink-0">
                    {formatTimestamp(entry.timestamp)}
                  </span>

                  {/* Message */}
                  <span className={`flex-1 ${levelColors[entry.level]} whitespace-pre-wrap break-all`}>
                    {entry.message}
                    {entry.count && entry.count > 1 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs">
                        {entry.count}
                      </span>
                    )}
                  </span>

                  {/* Source Link */}
                  {entry.source && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSourceClick?.(entry.source!, entry.line || 1);
                      }}
                      className="text-blue-400 hover:underline flex-shrink-0"
                    >
                      {entry.source}:{entry.line}
                    </button>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(entry.message, entry.id);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white rounded transition-opacity"
                  >
                    {copiedId === entry.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && hasExtra && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-2 ml-8 space-y-2">
                        {entry.data && (
                          <pre className="p-2 bg-gray-800 rounded text-gray-300 overflow-x-auto">
                            {formatData(entry.data)}
                          </pre>
                        )}
                        {entry.stack && (
                          <pre className="p-2 bg-gray-800 rounded text-red-300 overflow-x-auto text-xs">
                            {entry.stack}
                          </pre>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700 bg-gray-800/50">
        <ChevronRight className="w-4 h-4 text-blue-400" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Evaluate expression..."
          className="flex-1 bg-transparent text-white text-xs font-mono placeholder-gray-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default DebugConsole;
