/**
 * MergeConflicts - Git merge conflict resolution UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge, ChevronDown, ChevronRight, Check, X, AlertTriangle,
  FileCode, ArrowLeft, ArrowRight, ArrowLeftRight, Eye, RefreshCw
} from 'lucide-react';

export interface ConflictHunk {
  id: string;
  startLine: number;
  endLine: number;
  currentContent: string;
  incomingContent: string;
  baseContent?: string;
  resolution?: 'current' | 'incoming' | 'both' | 'custom';
  customContent?: string;
}

export interface ConflictFile {
  id: string;
  path: string;
  hunks: ConflictHunk[];
  status: 'unresolved' | 'partial' | 'resolved';
}

interface MergeConflictsProps {
  files: ConflictFile[];
  currentBranch: string;
  incomingBranch: string;
  onResolveHunk: (fileId: string, hunkId: string, resolution: ConflictHunk['resolution'], customContent?: string) => void;
  onResolveFile: (fileId: string, resolution: 'current' | 'incoming') => void;
  onOpenFile: (fileId: string, line?: number) => void;
  onRefresh: () => void;
  onAcceptAll: (resolution: 'current' | 'incoming') => void;
  onComplete: () => void;
  isResolving?: boolean;
}

const resolutionColors = {
  current: 'bg-blue-500/20 border-blue-500',
  incoming: 'bg-green-500/20 border-green-500',
  both: 'bg-purple-500/20 border-purple-500',
  custom: 'bg-yellow-500/20 border-yellow-500',
};

export const MergeConflicts: React.FC<MergeConflictsProps> = ({
  files,
  currentBranch,
  incomingBranch,
  onResolveHunk,
  onResolveFile,
  onOpenFile,
  onRefresh,
  onAcceptAll,
  onComplete,
  isResolving = false,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(files.map((f) => f.id)));
  const [selectedHunk, setSelectedHunk] = useState<{ fileId: string; hunkId: string } | null>(null);
  const [editingCustom, setEditingCustom] = useState<string | null>(null);
  const [customContent, setCustomContent] = useState('');

  const toggleFile = (fileId: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleCustomEdit = (fileId: string, hunk: ConflictHunk) => {
    setEditingCustom(hunk.id);
    setCustomContent(hunk.customContent || `${hunk.currentContent}\n${hunk.incomingContent}`);
  };

  const saveCustomEdit = (fileId: string, hunkId: string) => {
    onResolveHunk(fileId, hunkId, 'custom', customContent);
    setEditingCustom(null);
    setCustomContent('');
  };

  const stats = {
    total: files.length,
    resolved: files.filter((f) => f.status === 'resolved').length,
    unresolved: files.filter((f) => f.status === 'unresolved').length,
    partial: files.filter((f) => f.status === 'partial').length,
  };

  const totalHunks = files.reduce((acc, f) => acc + f.hunks.length, 0);
  const resolvedHunks = files.reduce(
    (acc, f) => acc + f.hunks.filter((h) => h.resolution).length,
    0
  );

  const getFileName = (path: string) => path.split('/').pop() || path;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-orange-400" />
          Merge Conflicts
        </h3>
        <button
          onClick={onRefresh}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isResolving ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Branch Info */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded">
            <ArrowLeft className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400 font-mono">{currentBranch}</span>
          </div>
          <GitMerge className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded">
            <span className="text-green-400 font-mono">{incomingBranch}</span>
            <ArrowRight className="w-3 h-3 text-green-400" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Resolution Progress</span>
          <span>
            {resolvedHunks} / {totalHunks} conflicts
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${(resolvedHunks / totalHunks) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 px-3 py-2 border-b border-gray-700">
        <button
          onClick={() => onAcceptAll('current')}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 rounded text-xs text-blue-400"
        >
          <ArrowLeft className="w-3 h-3" />
          Accept All Current
        </button>
        <button
          onClick={() => onAcceptAll('incoming')}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 rounded text-xs text-green-400"
        >
          Accept All Incoming
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Conflict Files List */}
      <div className="flex-1 overflow-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Check className="w-12 h-12 mb-2 text-green-500" />
            <span className="text-sm">No merge conflicts</span>
          </div>
        ) : (
          files.map((file) => {
            const isExpanded = expandedFiles.has(file.id);
            const unresolvedCount = file.hunks.filter((h) => !h.resolution).length;

            return (
              <div key={file.id} className="border-b border-gray-800">
                {/* File Header */}
                <div
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => toggleFile(file.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <FileCode className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-300 truncate">
                    {getFileName(file.path)}
                  </span>
                  {file.status === 'resolved' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <span className="px-1.5 py-0.5 bg-orange-500/20 rounded text-xs text-orange-400">
                      {unresolvedCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFile(file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>

                {/* Hunks */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {file.hunks.map((hunk) => (
                        <div
                          key={hunk.id}
                          className={`mx-3 mb-2 rounded border ${
                            hunk.resolution
                              ? resolutionColors[hunk.resolution]
                              : 'bg-gray-800 border-gray-700'
                          }`}
                        >
                          {/* Hunk Header */}
                          <div className="flex items-center justify-between px-2 py-1 border-b border-gray-700/50">
                            <span className="text-xs text-gray-500">
                              Lines {hunk.startLine}-{hunk.endLine}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onResolveHunk(file.id, hunk.id, 'current')}
                                className={`p-1 rounded text-xs ${
                                  hunk.resolution === 'current'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-blue-400 hover:bg-blue-500/20'
                                }`}
                                title="Accept current"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onResolveHunk(file.id, hunk.id, 'incoming')}
                                className={`p-1 rounded text-xs ${
                                  hunk.resolution === 'incoming'
                                    ? 'bg-green-500 text-white'
                                    : 'text-green-400 hover:bg-green-500/20'
                                }`}
                                title="Accept incoming"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onResolveHunk(file.id, hunk.id, 'both')}
                                className={`p-1 rounded text-xs ${
                                  hunk.resolution === 'both'
                                    ? 'bg-purple-500 text-white'
                                    : 'text-purple-400 hover:bg-purple-500/20'
                                }`}
                                title="Accept both"
                              >
                                <ArrowLeftRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleCustomEdit(file.id, hunk)}
                                className={`p-1 rounded text-xs ${
                                  hunk.resolution === 'custom'
                                    ? 'bg-yellow-500 text-white'
                                    : 'text-yellow-400 hover:bg-yellow-500/20'
                                }`}
                                title="Custom edit"
                              >
                                <FileCode className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Conflict Content */}
                          {editingCustom === hunk.id ? (
                            <div className="p-2">
                              <textarea
                                value={customContent}
                                onChange={(e) => setCustomContent(e.target.value)}
                                className="w-full h-32 p-2 bg-gray-900 border border-gray-600 rounded font-mono text-xs text-white resize-none focus:outline-none focus:border-blue-500"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => setEditingCustom(null)}
                                  className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => saveCustomEdit(file.id, hunk.id)}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-700/50">
                              {/* Current */}
                              <div className="p-2">
                                <div className="flex items-center gap-1 mb-1 text-xs text-blue-400">
                                  <ArrowLeft className="w-3 h-3" />
                                  Current ({currentBranch})
                                </div>
                                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap bg-blue-500/10 rounded p-2">
                                  {hunk.currentContent}
                                </pre>
                              </div>

                              {/* Incoming */}
                              <div className="p-2">
                                <div className="flex items-center gap-1 mb-1 text-xs text-green-400">
                                  <ArrowRight className="w-3 h-3" />
                                  Incoming ({incomingBranch})
                                </div>
                                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap bg-green-500/10 rounded p-2">
                                  {hunk.incomingContent}
                                </pre>
                              </div>
                            </div>
                          )}
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
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-400" />
              {stats.resolved} resolved
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              {stats.unresolved} unresolved
            </span>
          </div>
        </div>
        <button
          onClick={onComplete}
          disabled={stats.unresolved > 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm text-white transition-colors"
        >
          <GitMerge className="w-4 h-4" />
          Complete Merge
        </button>
      </div>
    </div>
  );
};

export default MergeConflicts;
