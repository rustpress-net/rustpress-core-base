/**
 * DiffView - Compare two files side by side
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Equal, ArrowLeftRight } from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  leftLine?: string;
  rightLine?: string;
  leftLineNumber?: number;
  rightLineNumber?: number;
}

interface DiffViewProps {
  isOpen: boolean;
  onClose: () => void;
  leftContent: string;
  rightContent: string;
  leftTitle: string;
  rightTitle: string;
}

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const result: DiffLine[] = [];

  // Simple line-by-line diff (not optimal but works for demo)
  const maxLines = Math.max(leftLines.length, rightLines.length);
  let leftIdx = 0;
  let rightIdx = 0;

  while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
    const leftLine = leftLines[leftIdx];
    const rightLine = rightLines[rightIdx];

    if (leftLine === rightLine) {
      result.push({
        type: 'unchanged',
        leftLine,
        rightLine,
        leftLineNumber: leftIdx + 1,
        rightLineNumber: rightIdx + 1
      });
      leftIdx++;
      rightIdx++;
    } else if (leftIdx >= leftLines.length) {
      result.push({
        type: 'added',
        rightLine,
        rightLineNumber: rightIdx + 1
      });
      rightIdx++;
    } else if (rightIdx >= rightLines.length) {
      result.push({
        type: 'removed',
        leftLine,
        leftLineNumber: leftIdx + 1
      });
      leftIdx++;
    } else {
      // Lines differ - check if it's a modification or add/remove
      const leftExistsLater = rightLines.slice(rightIdx).includes(leftLine);
      const rightExistsLater = leftLines.slice(leftIdx).includes(rightLine);

      if (!leftExistsLater && !rightExistsLater) {
        result.push({
          type: 'modified',
          leftLine,
          rightLine,
          leftLineNumber: leftIdx + 1,
          rightLineNumber: rightIdx + 1
        });
        leftIdx++;
        rightIdx++;
      } else if (leftExistsLater) {
        result.push({
          type: 'added',
          rightLine,
          rightLineNumber: rightIdx + 1
        });
        rightIdx++;
      } else {
        result.push({
          type: 'removed',
          leftLine,
          leftLineNumber: leftIdx + 1
        });
        leftIdx++;
      }
    }
  }

  return result;
}

export const DiffView: React.FC<DiffViewProps> = ({
  isOpen,
  onClose,
  leftContent,
  rightContent,
  leftTitle,
  rightTitle
}) => {
  const diffLines = useMemo(() => {
    return computeDiff(leftContent, rightContent);
  }, [leftContent, rightContent]);

  const stats = useMemo(() => {
    const added = diffLines.filter(l => l.type === 'added').length;
    const removed = diffLines.filter(l => l.type === 'removed').length;
    const modified = diffLines.filter(l => l.type === 'modified').length;
    return { added, removed, modified };
  }, [diffLines]);

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-4">
                <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Compare Files</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-400">
                    <Plus className="w-3 h-3" /> {stats.added}
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <Minus className="w-3 h-3" /> {stats.removed}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Equal className="w-3 h-3" /> {stats.modified}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Headers */}
            <div className="flex border-b border-gray-700">
              <div className="flex-1 px-4 py-2 bg-gray-800/50 border-r border-gray-700">
                <span className="text-xs text-gray-400">{leftTitle}</span>
              </div>
              <div className="flex-1 px-4 py-2 bg-gray-800/50">
                <span className="text-xs text-gray-400">{rightTitle}</span>
              </div>
            </div>

            {/* Diff Content */}
            <div className="flex-1 overflow-auto font-mono text-xs">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex border-b border-gray-800 ${
                    line.type === 'added' ? 'bg-green-900/20' :
                    line.type === 'removed' ? 'bg-red-900/20' :
                    line.type === 'modified' ? 'bg-yellow-900/20' : ''
                  }`}
                >
                  {/* Left Side */}
                  <div className="flex-1 flex border-r border-gray-700">
                    <span className="w-12 px-2 py-1 text-right text-gray-500 bg-gray-800/50 border-r border-gray-700 select-none">
                      {line.leftLineNumber || ''}
                    </span>
                    <span className="w-6 px-1 py-1 text-center select-none">
                      {line.type === 'removed' && <span className="text-red-400">-</span>}
                      {line.type === 'modified' && <span className="text-yellow-400">~</span>}
                    </span>
                    <pre className="flex-1 px-2 py-1 whitespace-pre overflow-x-auto">
                      <code className={
                        line.type === 'removed' ? 'text-red-300' :
                        line.type === 'modified' ? 'text-yellow-300' : 'text-gray-300'
                      }>
                        {line.leftLine ?? ''}
                      </code>
                    </pre>
                  </div>

                  {/* Right Side */}
                  <div className="flex-1 flex">
                    <span className="w-12 px-2 py-1 text-right text-gray-500 bg-gray-800/50 border-r border-gray-700 select-none">
                      {line.rightLineNumber || ''}
                    </span>
                    <span className="w-6 px-1 py-1 text-center select-none">
                      {line.type === 'added' && <span className="text-green-400">+</span>}
                      {line.type === 'modified' && <span className="text-yellow-400">~</span>}
                    </span>
                    <pre className="flex-1 px-2 py-1 whitespace-pre overflow-x-auto">
                      <code className={
                        line.type === 'added' ? 'text-green-300' :
                        line.type === 'modified' ? 'text-yellow-300' : 'text-gray-300'
                      }>
                        {line.rightLine ?? ''}
                      </code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DiffView;
