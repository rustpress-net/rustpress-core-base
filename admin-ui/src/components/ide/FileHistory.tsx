/**
 * FileHistory - View file change history
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, GitCommit, User, ChevronDown, ChevronRight,
  Eye, ArrowLeftRight, RotateCcw, Copy, Check
} from 'lucide-react';

export interface FileCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: Date;
  changes: {
    additions: number;
    deletions: number;
  };
  diff?: string;
}

interface FileHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  commits: FileCommit[];
  onViewVersion: (commit: FileCommit) => void;
  onCompare: (commit1: FileCommit, commit2: FileCommit) => void;
  onRestore: (commit: FileCommit) => void;
}

export const FileHistory: React.FC<FileHistoryProps> = ({
  isOpen,
  onClose,
  fileName,
  commits,
  onViewVersion,
  onCompare,
  onRestore
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<FileCommit | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleCompare = (commit: FileCommit) => {
    if (!selectedForCompare) {
      setSelectedForCompare(commit);
    } else if (selectedForCompare.id !== commit.id) {
      onCompare(selectedForCompare, commit);
      setSelectedForCompare(null);
    }
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
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[450px] z-50 bg-gray-900 border-l border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-medium text-white">File History</h3>
                  <p className="text-xs text-gray-400">{fileName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compare Mode Banner */}
            {selectedForCompare && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2 bg-blue-600/20 border-b border-blue-500/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-400">
                    Select another commit to compare with "{selectedForCompare.message.slice(0, 30)}..."
                  </p>
                  <button
                    onClick={() => setSelectedForCompare(null)}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Commits List */}
            <div className="flex-1 overflow-auto">
              {commits.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Clock className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No history available</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-7 top-0 bottom-0 w-px bg-gray-700" />

                  {commits.map((commit, index) => (
                    <div key={commit.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute left-6 w-3 h-3 rounded-full border-2 z-10 mt-5 ${
                        index === 0 ? 'bg-blue-500 border-blue-400' : 'bg-gray-800 border-gray-600'
                      }`} />

                      <div
                        className={`ml-12 border-b border-gray-800 ${
                          selectedForCompare?.id === commit.id ? 'bg-blue-600/10' : 'hover:bg-gray-800/50'
                        } transition-colors`}
                      >
                        <button
                          onClick={() => setExpandedId(expandedId === commit.id ? null : commit.id)}
                          className="w-full text-left p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate pr-4">
                                {commit.message}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {commit.author}
                                </span>
                                <span>{formatDate(commit.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-green-400">+{commit.changes.additions}</span>
                                <span className="text-xs text-red-400">-{commit.changes.deletions}</span>
                              </div>
                            </div>
                            {expandedId === commit.id ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Actions */}
                        <AnimatePresence>
                          {expandedId === commit.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-3">
                                {/* Commit Hash */}
                                <div className="flex items-center gap-2">
                                  <GitCommit className="w-4 h-4 text-gray-400" />
                                  <code className="text-xs text-gray-400 font-mono">
                                    {commit.hash.slice(0, 8)}
                                  </code>
                                  <button
                                    onClick={() => handleCopyHash(commit.hash)}
                                    className="p-1 text-gray-500 hover:text-white transition-colors"
                                    title="Copy full hash"
                                  >
                                    {copiedHash === commit.hash ? (
                                      <Check className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onViewVersion(commit)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleCompare(commit)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                                      selectedForCompare?.id === commit.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                    Compare
                                  </button>
                                  <button
                                    onClick={() => onRestore(commit)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-colors"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Restore
                                  </button>
                                </div>

                                {/* Diff Preview */}
                                {commit.diff && (
                                  <div className="bg-gray-800 rounded-lg p-3 max-h-40 overflow-auto">
                                    <pre className="text-xs font-mono">
                                      {commit.diff.split('\n').map((line, i) => (
                                        <div
                                          key={i}
                                          className={
                                            line.startsWith('+') ? 'text-green-400' :
                                            line.startsWith('-') ? 'text-red-400' :
                                            'text-gray-400'
                                          }
                                        >
                                          {line}
                                        </div>
                                      ))}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileHistory;
