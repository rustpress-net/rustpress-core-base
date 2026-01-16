/**
 * CompareFiles - Side-by-side file comparison
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare, ChevronUp, ChevronDown, Copy, Check,
  ArrowLeftRight, FileCode, X, Maximize2, Minimize2
} from 'lucide-react';

export interface DiffLine {
  lineNumber: { left?: number; right?: number };
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  content: { left?: string; right?: string };
}

export interface CompareFile {
  path: string;
  content: string;
  label?: string;
}

interface CompareFilesProps {
  leftFile?: CompareFile;
  rightFile?: CompareFile;
  diffLines: DiffLine[];
  currentDiffIndex?: number;
  totalDiffs: number;
  onNavigateDiff: (direction: 'prev' | 'next') => void;
  onSwapFiles: () => void;
  onClose: () => void;
  onCopyLine?: (content: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const lineTypeColors = {
  unchanged: '',
  added: 'bg-green-500/10',
  removed: 'bg-red-500/10',
  modified: 'bg-yellow-500/10',
};

const lineTypeTextColors = {
  unchanged: 'text-gray-300',
  added: 'text-green-400',
  removed: 'text-red-400',
  modified: 'text-yellow-400',
};

const lineTypeIndicators = {
  unchanged: ' ',
  added: '+',
  removed: '-',
  modified: '~',
};

export const CompareFiles: React.FC<CompareFilesProps> = ({
  leftFile,
  rightFile,
  diffLines,
  currentDiffIndex = 0,
  totalDiffs,
  onNavigateDiff,
  onSwapFiles,
  onClose,
  onCopyLine,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [syncScroll, setSyncScroll] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Sync scroll between panels
  useEffect(() => {
    if (!syncScroll) return;

    const handleLeftScroll = () => {
      if (isScrolling.current) return;
      isScrolling.current = true;
      if (rightRef.current && leftRef.current) {
        rightRef.current.scrollTop = leftRef.current.scrollTop;
      }
      setTimeout(() => (isScrolling.current = false), 50);
    };

    const handleRightScroll = () => {
      if (isScrolling.current) return;
      isScrolling.current = true;
      if (leftRef.current && rightRef.current) {
        leftRef.current.scrollTop = rightRef.current.scrollTop;
      }
      setTimeout(() => (isScrolling.current = false), 50);
    };

    const left = leftRef.current;
    const right = rightRef.current;

    left?.addEventListener('scroll', handleLeftScroll);
    right?.addEventListener('scroll', handleRightScroll);

    return () => {
      left?.removeEventListener('scroll', handleLeftScroll);
      right?.removeEventListener('scroll', handleRightScroll);
    };
  }, [syncScroll]);

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedLine(index);
    setTimeout(() => setCopiedLine(null), 2000);
    onCopyLine?.(content);
  };

  const getFileName = (path?: string) => path?.split('/').pop() || 'Untitled';

  const stats = {
    added: diffLines.filter((l) => l.type === 'added').length,
    removed: diffLines.filter((l) => l.type === 'removed').length,
    modified: diffLines.filter((l) => l.type === 'modified').length,
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gray-900`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Compare Files
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Diff Navigation */}
          {totalDiffs > 0 && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => onNavigateDiff('prev')}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Previous difference"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 min-w-[60px] text-center">
                {currentDiffIndex + 1} of {totalDiffs}
              </span>
              <button
                onClick={() => onNavigateDiff('next')}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Next difference"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Options */}
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            Sync
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            Lines
          </label>

          <button
            onClick={onSwapFiles}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Swap files"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Headers */}
      <div className="flex border-b border-gray-700">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-red-500/5 border-r border-gray-700">
          <FileCode className="w-4 h-4 text-red-400" />
          <span className="text-sm text-gray-300 truncate">
            {leftFile?.label || getFileName(leftFile?.path)}
          </span>
          <span className="text-xs text-red-400">(-{stats.removed})</span>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-500/5">
          <FileCode className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300 truncate">
            {rightFile?.label || getFileName(rightFile?.path)}
          </span>
          <span className="text-xs text-green-400">(+{stats.added})</span>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div
          ref={leftRef}
          className="flex-1 overflow-auto border-r border-gray-700 font-mono text-xs"
        >
          {diffLines.map((line, index) => (
            <div
              key={`left-${index}`}
              className={`group flex ${lineTypeColors[line.type]} ${
                line.type === 'added' ? 'opacity-30' : ''
              }`}
            >
              {showLineNumbers && (
                <span className="w-12 px-2 py-0.5 text-gray-600 text-right select-none border-r border-gray-800">
                  {line.lineNumber.left || ''}
                </span>
              )}
              <span className="w-4 px-1 py-0.5 text-center select-none text-gray-500">
                {line.type !== 'added' ? lineTypeIndicators[line.type] : ''}
              </span>
              <pre className={`flex-1 px-2 py-0.5 whitespace-pre-wrap ${lineTypeTextColors[line.type]}`}>
                {line.content.left || ''}
              </pre>
              {line.content.left && onCopyLine && (
                <button
                  onClick={() => handleCopy(line.content.left!, index)}
                  className="px-2 py-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
                >
                  {copiedLine === index ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div
          ref={rightRef}
          className="flex-1 overflow-auto font-mono text-xs"
        >
          {diffLines.map((line, index) => (
            <div
              key={`right-${index}`}
              className={`group flex ${lineTypeColors[line.type]} ${
                line.type === 'removed' ? 'opacity-30' : ''
              }`}
            >
              {showLineNumbers && (
                <span className="w-12 px-2 py-0.5 text-gray-600 text-right select-none border-r border-gray-800">
                  {line.lineNumber.right || ''}
                </span>
              )}
              <span className="w-4 px-1 py-0.5 text-center select-none text-gray-500">
                {line.type !== 'removed' ? lineTypeIndicators[line.type] : ''}
              </span>
              <pre className={`flex-1 px-2 py-0.5 whitespace-pre-wrap ${lineTypeTextColors[line.type]}`}>
                {line.content.right || ''}
              </pre>
              {line.content.right && onCopyLine && (
                <button
                  onClick={() => handleCopy(line.content.right!, index + 10000)}
                  className="px-2 py-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
                >
                  {copiedLine === index + 10000 ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded" />
              {stats.added} additions
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded" />
              {stats.removed} deletions
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded" />
              {stats.modified} modifications
            </span>
          </div>
          <span>{diffLines.length} lines</span>
        </div>
      </div>
    </div>
  );
};

export default CompareFiles;
