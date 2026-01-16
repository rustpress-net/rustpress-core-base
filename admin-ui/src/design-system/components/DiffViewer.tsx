/**
 * RustPress Diff Viewer Component
 * Code/text diff comparison with side-by-side and unified views
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Columns,
  Rows,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  FileText,
  GitCompare,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type DiffType = 'add' | 'remove' | 'modify' | 'equal';

export interface DiffLine {
  type: DiffType;
  oldLineNumber?: number;
  newLineNumber?: number;
  oldContent?: string;
  newContent?: string;
  content?: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffViewerProps {
  oldValue: string;
  newValue: string;
  oldTitle?: string;
  newTitle?: string;
  language?: string;
  viewType?: 'split' | 'unified';
  showLineNumbers?: boolean;
  showDiffStats?: boolean;
  highlightInline?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  contextLines?: number;
  className?: string;
}

// ============================================================================
// Diff Algorithm (LCS-based)
// ============================================================================

function computeLCS(oldLines: string[], newLines: string[]): number[][] {
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function backtrackLCS(
  dp: number[][],
  oldLines: string[],
  newLines: string[],
  i: number,
  j: number,
  result: DiffLine[]
): void {
  if (i === 0 && j === 0) return;

  if (i === 0) {
    for (let k = j; k > 0; k--) {
      result.unshift({
        type: 'add',
        newLineNumber: k,
        newContent: newLines[k - 1],
        content: newLines[k - 1],
      });
    }
    return;
  }

  if (j === 0) {
    for (let k = i; k > 0; k--) {
      result.unshift({
        type: 'remove',
        oldLineNumber: k,
        oldContent: oldLines[k - 1],
        content: oldLines[k - 1],
      });
    }
    return;
  }

  if (oldLines[i - 1] === newLines[j - 1]) {
    backtrackLCS(dp, oldLines, newLines, i - 1, j - 1, result);
    result.push({
      type: 'equal',
      oldLineNumber: i,
      newLineNumber: j,
      oldContent: oldLines[i - 1],
      newContent: newLines[j - 1],
      content: oldLines[i - 1],
    });
  } else if (dp[i - 1][j] >= dp[i][j - 1]) {
    backtrackLCS(dp, oldLines, newLines, i - 1, j, result);
    result.push({
      type: 'remove',
      oldLineNumber: i,
      oldContent: oldLines[i - 1],
      content: oldLines[i - 1],
    });
  } else {
    backtrackLCS(dp, oldLines, newLines, i, j - 1, result);
    result.push({
      type: 'add',
      newLineNumber: j,
      newContent: newLines[j - 1],
      content: newLines[j - 1],
    });
  }
}

function computeDiff(oldValue: string, newValue: string): DiffLine[] {
  const oldLines = oldValue.split('\n');
  const newLines = newValue.split('\n');

  const dp = computeLCS(oldLines, newLines);
  const result: DiffLine[] = [];
  backtrackLCS(dp, oldLines, newLines, oldLines.length, newLines.length, result);

  return result;
}

// ============================================================================
// Inline Diff (character-level)
// ============================================================================

interface InlineDiffToken {
  type: 'equal' | 'add' | 'remove';
  value: string;
}

function computeInlineDiff(oldStr: string, newStr: string): InlineDiffToken[] {
  if (!oldStr && !newStr) return [];
  if (!oldStr) return [{ type: 'add', value: newStr }];
  if (!newStr) return [{ type: 'remove', value: oldStr }];

  const tokens: InlineDiffToken[] = [];

  // Simple word-based diff
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);

  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  let i = m;
  let j = n;
  const result: InlineDiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: 'equal', value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', value: newWords[j - 1] });
      j--;
    } else if (i > 0) {
      result.unshift({ type: 'remove', value: oldWords[i - 1] });
      i--;
    }
  }

  // Merge adjacent tokens of same type
  const merged: InlineDiffToken[] = [];
  for (const token of result) {
    if (merged.length > 0 && merged[merged.length - 1].type === token.type) {
      merged[merged.length - 1].value += token.value;
    } else {
      merged.push({ ...token });
    }
  }

  return merged;
}

// ============================================================================
// Diff Stats Component
// ============================================================================

interface DiffStatsProps {
  additions: number;
  deletions: number;
  changes: number;
}

export function DiffStats({ additions, deletions, changes }: DiffStatsProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-500 rounded-sm" />
        <span className="text-green-600 dark:text-green-400">+{additions}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-red-500 rounded-sm" />
        <span className="text-red-600 dark:text-red-400">-{deletions}</span>
      </div>
      {changes > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
          <span className="text-yellow-600 dark:text-yellow-400">~{changes}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Split View Component
// ============================================================================

interface SplitViewProps {
  diffLines: DiffLine[];
  showLineNumbers: boolean;
  highlightInline: boolean;
}

function SplitView({ diffLines, showLineNumbers, highlightInline }: SplitViewProps) {
  // Pair up lines for side-by-side view
  const pairs: { left: DiffLine | null; right: DiffLine | null }[] = [];
  let i = 0;

  while (i < diffLines.length) {
    const line = diffLines[i];

    if (line.type === 'equal') {
      pairs.push({ left: line, right: line });
      i++;
    } else if (line.type === 'remove') {
      // Look ahead for a matching add
      if (i + 1 < diffLines.length && diffLines[i + 1].type === 'add') {
        pairs.push({ left: line, right: diffLines[i + 1] });
        i += 2;
      } else {
        pairs.push({ left: line, right: null });
        i++;
      }
    } else if (line.type === 'add') {
      pairs.push({ left: null, right: line });
      i++;
    } else {
      i++;
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <tbody>
          {pairs.map((pair, idx) => (
            <tr key={idx}>
              {/* Left Side */}
              <td
                className={cn(
                  'align-top border-r border-neutral-300 dark:border-neutral-600',
                  pair.left?.type === 'remove' && 'bg-red-50 dark:bg-red-900/20',
                  pair.left?.type === 'equal' && 'bg-white dark:bg-neutral-900',
                  !pair.left && 'bg-neutral-50 dark:bg-neutral-800'
                )}
              >
                <div className="flex">
                  {showLineNumbers && (
                    <span className="w-12 px-2 py-1 text-right text-neutral-400 select-none flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700">
                      {pair.left?.oldLineNumber || ''}
                    </span>
                  )}
                  <span className="w-6 flex-shrink-0 flex items-center justify-center text-red-500">
                    {pair.left?.type === 'remove' && <Minus className="w-3 h-3" />}
                  </span>
                  <pre className="flex-1 px-2 py-1 whitespace-pre-wrap break-words">
                    {pair.left ? (
                      highlightInline && pair.right && pair.left.type !== 'equal' ? (
                        computeInlineDiff(pair.left.content || '', pair.right.content || '').map(
                          (token, i) =>
                            token.type === 'remove' ? (
                              <span key={i} className="bg-red-200 dark:bg-red-800">
                                {token.value}
                              </span>
                            ) : token.type === 'equal' ? (
                              <span key={i}>{token.value}</span>
                            ) : null
                        )
                      ) : (
                        <span className={pair.left.type === 'remove' ? 'text-red-800 dark:text-red-300' : ''}>
                          {pair.left.content}
                        </span>
                      )
                    ) : (
                      '\u00A0'
                    )}
                  </pre>
                </div>
              </td>

              {/* Right Side */}
              <td
                className={cn(
                  'align-top',
                  pair.right?.type === 'add' && 'bg-green-50 dark:bg-green-900/20',
                  pair.right?.type === 'equal' && 'bg-white dark:bg-neutral-900',
                  !pair.right && 'bg-neutral-50 dark:bg-neutral-800'
                )}
              >
                <div className="flex">
                  {showLineNumbers && (
                    <span className="w-12 px-2 py-1 text-right text-neutral-400 select-none flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700">
                      {pair.right?.newLineNumber || ''}
                    </span>
                  )}
                  <span className="w-6 flex-shrink-0 flex items-center justify-center text-green-500">
                    {pair.right?.type === 'add' && <Plus className="w-3 h-3" />}
                  </span>
                  <pre className="flex-1 px-2 py-1 whitespace-pre-wrap break-words">
                    {pair.right ? (
                      highlightInline && pair.left && pair.right.type !== 'equal' ? (
                        computeInlineDiff(pair.left.content || '', pair.right.content || '').map(
                          (token, i) =>
                            token.type === 'add' ? (
                              <span key={i} className="bg-green-200 dark:bg-green-800">
                                {token.value}
                              </span>
                            ) : token.type === 'equal' ? (
                              <span key={i}>{token.value}</span>
                            ) : null
                        )
                      ) : (
                        <span className={pair.right.type === 'add' ? 'text-green-800 dark:text-green-300' : ''}>
                          {pair.right.content}
                        </span>
                      )
                    ) : (
                      '\u00A0'
                    )}
                  </pre>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Unified View Component
// ============================================================================

interface UnifiedViewProps {
  diffLines: DiffLine[];
  showLineNumbers: boolean;
  highlightInline: boolean;
}

function UnifiedView({ diffLines, showLineNumbers, highlightInline }: UnifiedViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <tbody>
          {diffLines.map((line, idx) => (
            <tr
              key={idx}
              className={cn(
                line.type === 'add' && 'bg-green-50 dark:bg-green-900/20',
                line.type === 'remove' && 'bg-red-50 dark:bg-red-900/20',
                line.type === 'equal' && 'bg-white dark:bg-neutral-900'
              )}
            >
              {showLineNumbers && (
                <>
                  <td className="w-12 px-2 py-1 text-right text-neutral-400 select-none border-r border-neutral-200 dark:border-neutral-700">
                    {line.oldLineNumber || ''}
                  </td>
                  <td className="w-12 px-2 py-1 text-right text-neutral-400 select-none border-r border-neutral-200 dark:border-neutral-700">
                    {line.newLineNumber || ''}
                  </td>
                </>
              )}
              <td className="w-6 text-center">
                {line.type === 'add' && <Plus className="w-3 h-3 mx-auto text-green-500" />}
                {line.type === 'remove' && <Minus className="w-3 h-3 mx-auto text-red-500" />}
              </td>
              <td className="px-2 py-1">
                <pre className="whitespace-pre-wrap break-words">
                  <span
                    className={cn(
                      line.type === 'add' && 'text-green-800 dark:text-green-300',
                      line.type === 'remove' && 'text-red-800 dark:text-red-300'
                    )}
                  >
                    {line.content}
                  </span>
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Main Diff Viewer Component
// ============================================================================

export function DiffViewer({
  oldValue,
  newValue,
  oldTitle = 'Original',
  newTitle = 'Modified',
  language,
  viewType: initialViewType = 'split',
  showLineNumbers = true,
  showDiffStats = true,
  highlightInline = true,
  collapsible = false,
  defaultCollapsed = false,
  contextLines = 3,
  className,
}: DiffViewerProps) {
  const [viewType, setViewType] = useState(initialViewType);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState<'old' | 'new' | null>(null);

  const diffLines = useMemo(() => computeDiff(oldValue, newValue), [oldValue, newValue]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;

    diffLines.forEach((line) => {
      if (line.type === 'add') additions++;
      if (line.type === 'remove') deletions++;
    });

    return { additions, deletions, changes: 0 };
  }, [diffLines]);

  const handleCopy = async (type: 'old' | 'new') => {
    const text = type === 'old' ? oldValue : newValue;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasChanges = stats.additions > 0 || stats.deletions > 0;

  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        'bg-white dark:bg-neutral-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}

          <GitCompare className="w-5 h-5 text-neutral-400" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{oldTitle}</span>
            <span className="text-neutral-400">→</span>
            <span className="text-neutral-600 dark:text-neutral-400">{newTitle}</span>
          </div>

          {showDiffStats && hasChanges && (
            <DiffStats {...stats} />
          )}

          {!hasChanges && (
            <span className="text-sm text-neutral-500">No changes</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Type Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-200 dark:bg-neutral-700 rounded">
            <button
              onClick={() => setViewType('split')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewType === 'split'
                  ? 'bg-white dark:bg-neutral-600 shadow-sm'
                  : 'hover:bg-neutral-300 dark:hover:bg-neutral-600'
              )}
              title="Split view"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('unified')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewType === 'unified'
                  ? 'bg-white dark:bg-neutral-600 shadow-sm'
                  : 'hover:bg-neutral-300 dark:hover:bg-neutral-600'
              )}
              title="Unified view"
            >
              <Rows className="w-4 h-4" />
            </button>
          </div>

          {/* Copy Buttons */}
          <button
            onClick={() => handleCopy('old')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
            title="Copy original"
          >
            {copied === 'old' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* File Headers (for split view) */}
      {!isCollapsed && viewType === 'split' && (
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/10 border-r border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-400">{oldTitle}</span>
              <span className="text-red-500 text-xs">(-{stats.deletions})</span>
            </div>
          </div>
          <div className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900/10">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">{newTitle}</span>
              <span className="text-green-500 text-xs">(+{stats.additions})</span>
            </div>
          </div>
        </div>
      )}

      {/* Diff Content */}
      {!isCollapsed && hasChanges && (
        <div className="overflow-hidden">
          {viewType === 'split' ? (
            <SplitView
              diffLines={diffLines}
              showLineNumbers={showLineNumbers}
              highlightInline={highlightInline}
            />
          ) : (
            <UnifiedView
              diffLines={diffLines}
              showLineNumbers={showLineNumbers}
              highlightInline={highlightInline}
            />
          )}
        </div>
      )}

      {/* No Changes Message */}
      {!isCollapsed && !hasChanges && (
        <div className="py-12 text-center text-neutral-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
          <p>Files are identical</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Text Diff Component
// ============================================================================

export interface TextDiffProps {
  oldText: string;
  newText: string;
  className?: string;
}

export function TextDiff({ oldText, newText, className }: TextDiffProps) {
  const tokens = useMemo(() => computeInlineDiff(oldText, newText), [oldText, newText]);

  return (
    <span className={className}>
      {tokens.map((token, i) => (
        <span
          key={i}
          className={cn(
            token.type === 'add' && 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100',
            token.type === 'remove' && 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 line-through'
          )}
        >
          {token.value}
        </span>
      ))}
    </span>
  );
}

// ============================================================================
// Diff Summary Component
// ============================================================================

export interface DiffFile {
  filename: string;
  additions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldFilename?: string;
}

export interface DiffSummaryProps {
  files: DiffFile[];
  onFileClick?: (file: DiffFile) => void;
  className?: string;
}

export function DiffSummary({ files, onFileClick, className }: DiffSummaryProps) {
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  const statusColors = {
    added: 'text-green-600 dark:text-green-400',
    modified: 'text-yellow-600 dark:text-yellow-400',
    deleted: 'text-red-600 dark:text-red-400',
    renamed: 'text-blue-600 dark:text-blue-400',
  };

  const statusBadges = {
    added: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    modified: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    deleted: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    renamed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {files.length} file{files.length !== 1 ? 's' : ''} changed
        </span>
        <DiffStats additions={totalAdditions} deletions={totalDeletions} changes={0} />
      </div>

      {/* File List */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {files.map((file, i) => (
          <button
            key={i}
            onClick={() => onFileClick?.(file)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left"
          >
            <FileText className={cn('w-4 h-4', statusColors[file.status])} />

            <div className="flex-1 min-w-0">
              <span className="text-sm text-neutral-900 dark:text-white truncate block">
                {file.status === 'renamed' && file.oldFilename
                  ? `${file.oldFilename} → ${file.filename}`
                  : file.filename}
              </span>
            </div>

            <span className={cn('text-xs px-2 py-0.5 rounded', statusBadges[file.status])}>
              {file.status}
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
              <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DiffViewer;
