/**
 * ProblemsPanel - Errors and warnings list
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronRight,
  Filter, RefreshCw, File
} from 'lucide-react';

export interface Problem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
  source?: string;
  code?: string;
}

interface ProblemsPanelProps {
  problems: Problem[];
  onNavigate: (file: string, line: number, column: number) => void;
  onRefresh?: () => void;
}

export const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
  problems,
  onNavigate,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings' | 'info'>('all');
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (filter === 'errors' && p.type !== 'error') return false;
      if (filter === 'warnings' && p.type !== 'warning') return false;
      if (filter === 'info' && p.type !== 'info') return false;
      if (search && !p.message.toLowerCase().includes(search.toLowerCase()) &&
          !p.file.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [problems, filter, search]);

  const groupedProblems = useMemo(() => {
    const groups: Record<string, Problem[]> = {};
    filteredProblems.forEach(p => {
      if (!groups[p.file]) groups[p.file] = [];
      groups[p.file].push(p);
    });
    return groups;
  }, [filteredProblems]);

  const stats = useMemo(() => ({
    errors: problems.filter(p => p.type === 'error').length,
    warnings: problems.filter(p => p.type === 'warning').length,
    info: problems.filter(p => p.type === 'info').length
  }), [problems]);

  const toggleFile = (file: string) => {
    const newSet = new Set(expandedFiles);
    if (newSet.has(file)) {
      newSet.delete(file);
    } else {
      newSet.add(file);
    }
    setExpandedFiles(newSet);
  };

  const getIcon = (type: Problem['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-medium text-white">Problems</h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              All ({problems.length})
            </button>
            <button
              onClick={() => setFilter('errors')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded ${filter === 'errors' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlertCircle className="w-3 h-3 text-red-400" />
              {stats.errors}
            </button>
            <button
              onClick={() => setFilter('warnings')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded ${filter === 'warnings' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              {stats.warnings}
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded ${filter === 'info' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Info className="w-3 h-3 text-blue-400" />
              {stats.info}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter problems..."
            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-40"
          />
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedProblems).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No problems detected</p>
          </div>
        ) : (
          Object.entries(groupedProblems).map(([file, fileProblems]) => (
            <div key={file} className="border-b border-gray-800">
              <button
                onClick={() => toggleFile(file)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 transition-colors text-left"
              >
                {expandedFiles.has(file) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <File className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-300 truncate flex-1">{file}</span>
                <span className="text-xs text-gray-500">{fileProblems.length}</span>
              </button>

              <AnimatePresence>
                {expandedFiles.has(file) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {fileProblems.map(problem => (
                      <button
                        key={problem.id}
                        onClick={() => onNavigate(problem.file, problem.line, problem.column)}
                        className="w-full flex items-start gap-2 px-3 py-2 pl-10 hover:bg-gray-800 transition-colors text-left"
                      >
                        {getIcon(problem.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300">{problem.message}</p>
                          <p className="text-[10px] text-gray-500">
                            [{problem.line}:{problem.column}]
                            {problem.source && ` • ${problem.source}`}
                            {problem.code && ` (${problem.code})`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProblemsPanel;
