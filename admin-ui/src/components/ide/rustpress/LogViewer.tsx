/**
 * LogViewer - View and analyze system logs
 * RustPress-specific logging functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Filter, Download, Trash2, RefreshCw,
  AlertCircle, AlertTriangle, Info, Bug, CheckCircle, Clock,
  ChevronDown, ChevronUp, Play, Pause, Copy, X, Terminal
} from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

export interface LogFilter {
  levels: string[];
  sources: string[];
  search: string;
  startDate?: string;
  endDate?: string;
}

interface LogViewerProps {
  onExport?: (logs: LogEntry[]) => void;
  onClear?: () => void;
}

// Mock log data
const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '2024-01-15T14:30:45.123Z', level: 'info', source: 'system', message: 'Application started successfully' },
  { id: '2', timestamp: '2024-01-15T14:30:46.456Z', level: 'debug', source: 'router', message: 'Route registered: GET /api/posts' },
  { id: '3', timestamp: '2024-01-15T14:30:47.789Z', level: 'info', source: 'database', message: 'Database connection established' },
  { id: '4', timestamp: '2024-01-15T14:31:12.234Z', level: 'warning', source: 'cache', message: 'Cache miss for key: posts_recent', context: { key: 'posts_recent', ttl: 300 } },
  { id: '5', timestamp: '2024-01-15T14:32:15.567Z', level: 'error', source: 'api', message: 'Failed to fetch external resource', context: { url: 'https://api.example.com/data', status: 503 }, stack: 'Error: Request failed\n  at fetch (/app/src/api.rs:45)\n  at handler (/app/src/handlers.rs:123)' },
  { id: '6', timestamp: '2024-01-15T14:33:00.890Z', level: 'info', source: 'auth', message: 'User login successful', context: { userId: 1, email: 'admin@example.com' } },
  { id: '7', timestamp: '2024-01-15T14:33:45.123Z', level: 'debug', source: 'query', message: 'SQL query executed in 12ms', context: { query: 'SELECT * FROM posts LIMIT 10', duration: 12 } },
  { id: '8', timestamp: '2024-01-15T14:34:20.456Z', level: 'warning', source: 'security', message: 'Rate limit exceeded for IP', context: { ip: '192.168.1.100', limit: 100, current: 105 } },
  { id: '9', timestamp: '2024-01-15T14:35:00.789Z', level: 'critical', source: 'system', message: 'Memory usage critical', context: { used: '3.8GB', total: '4GB', percentage: 95 } },
  { id: '10', timestamp: '2024-01-15T14:35:30.012Z', level: 'info', source: 'cron', message: 'Scheduled task completed: cleanup_sessions' }
];

const levelConfig = {
  debug: { icon: Bug, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-600/20', border: 'border-red-600/30' }
};

export const LogViewer: React.FC<LogViewerProps> = ({
  onExport,
  onClear
}) => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [filter, setFilter] = useState<LogFilter>({
    levels: [],
    sources: [],
    search: ''
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Simulate streaming logs
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: ['debug', 'info', 'warning', 'error'][Math.floor(Math.random() * 4)] as any,
        source: ['system', 'api', 'database', 'cache', 'auth'][Math.floor(Math.random() * 5)],
        message: `Log message #${Date.now()}`
      };
      setLogs(prev => [...prev.slice(-999), newLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const handleCopyLog = (log: LogEntry) => {
    const text = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(text);
  };

  const handleExport = () => {
    onExport?.(filteredLogs);
  };

  const handleClear = () => {
    setLogs([]);
    onClear?.();
  };

  const filteredLogs = logs.filter(log => {
    if (filter.levels.length > 0 && !filter.levels.includes(log.level)) return false;
    if (filter.sources.length > 0 && !filter.sources.includes(log.source)) return false;
    if (filter.search && !log.message.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const sources = [...new Set(logs.map(l => l.source))];
  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Log Viewer
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isStreaming
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Stream
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search logs..."
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-cyan-600"
            />
            Auto-scroll
          </label>
        </div>

        {/* Level Pills */}
        <div className="flex items-center gap-2">
          {(['debug', 'info', 'warning', 'error', 'critical'] as const).map(level => {
            const config = levelConfig[level];
            const count = levelCounts[level] || 0;
            const isActive = filter.levels.includes(level);

            return (
              <button
                key={level}
                onClick={() => {
                  const newLevels = isActive
                    ? filter.levels.filter(l => l !== level)
                    : [...filter.levels, level];
                  setFilter({ ...filter, levels: newLevels });
                }}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-full border transition-colors ${
                  isActive ? `${config.bg} ${config.color} ${config.border}` : 'bg-gray-800 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <config.icon className="w-3 h-3" />
                {level}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Source:</span>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !filter.sources.includes(e.target.value)) {
                        setFilter({ ...filter, sources: [...filter.sources, e.target.value] });
                      }
                    }}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="">All Sources</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                {filter.sources.length > 0 && (
                  <div className="flex items-center gap-1">
                    {filter.sources.map(source => (
                      <span
                        key={source}
                        className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-xs rounded"
                      >
                        {source}
                        <button
                          onClick={() => setFilter({
                            ...filter,
                            sources: filter.sources.filter(s => s !== source)
                          })}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Log Entries */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-auto font-mono text-sm"
      >
        {filteredLogs.map(log => {
          const config = levelConfig[log.level];
          const Icon = config.icon;
          const isExpanded = expandedLogs.has(log.id);

          return (
            <div
              key={log.id}
              className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${
                log.level === 'critical' ? 'bg-red-900/10' : ''
              }`}
            >
              <div
                className="flex items-start gap-2 px-4 py-2 cursor-pointer"
                onClick={() => toggleExpand(log.id)}
              >
                <span className="text-gray-500 text-xs whitespace-nowrap mt-0.5">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${config.bg} ${config.color}`}>
                  {log.level.toUpperCase().padEnd(8)}
                </span>
                <span className="text-purple-400 text-xs whitespace-nowrap">
                  [{log.source}]
                </span>
                <span className="text-gray-300 flex-1 break-all">
                  {log.message}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyLog(log); }}
                    className="p-1 text-gray-500 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {(log.context || log.stack) && (
                    isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (log.context || log.stack) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-1 ml-32">
                      {log.context && (
                        <div className="bg-gray-800 rounded p-2 mb-2">
                          <pre className="text-xs text-gray-400">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.stack && (
                        <div className="bg-red-900/20 rounded p-2">
                          <pre className="text-xs text-red-400 whitespace-pre-wrap">
                            {log.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No logs found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing {filteredLogs.length} of {logs.length} entries
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live streaming
          </span>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
