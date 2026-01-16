import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List,
  Type,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Plus,
  MoveUp,
  MoveDown,
  Anchor,
  Copy,
  ExternalLink,
  Info,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import clsx from 'clsx';

interface Heading {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  slug: string;
  position: number;
  wordCount: number;
  issues: HeadingIssue[];
}

interface HeadingIssue {
  type: 'missing-h1' | 'multiple-h1' | 'skipped-level' | 'too-long' | 'too-short' | 'duplicate' | 'no-keywords';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

interface HeadingStructureSettings {
  showPreview: boolean;
  showIssues: boolean;
  showWordCount: boolean;
  showAnchors: boolean;
  maxH1Count: number;
  maxHeadingLength: number;
  minHeadingLength: number;
  enforceHierarchy: boolean;
}

interface HeadingStructureProps {
  content?: string;
  focusKeyword?: string;
  onHeadingClick?: (headingId: string) => void;
  onHeadingUpdate?: (headingId: string, newText: string) => void;
  onSettingsChange?: (settings: HeadingStructureSettings) => void;
  className?: string;
}

const mockHeadings: Heading[] = [
  {
    id: 'h1',
    level: 1,
    text: 'Complete Guide to React Hooks in 2024',
    slug: 'complete-guide-to-react-hooks-in-2024',
    position: 0,
    wordCount: 0,
    issues: []
  },
  {
    id: 'h2-1',
    level: 2,
    text: 'What are React Hooks?',
    slug: 'what-are-react-hooks',
    position: 1,
    wordCount: 150,
    issues: []
  },
  {
    id: 'h3-1',
    level: 3,
    text: 'The useState Hook',
    slug: 'the-usestate-hook',
    position: 2,
    wordCount: 200,
    issues: []
  },
  {
    id: 'h3-2',
    level: 3,
    text: 'The useEffect Hook',
    slug: 'the-useeffect-hook',
    position: 3,
    wordCount: 180,
    issues: []
  },
  {
    id: 'h2-2',
    level: 2,
    text: 'Advanced Hooks',
    slug: 'advanced-hooks',
    position: 4,
    wordCount: 100,
    issues: []
  },
  {
    id: 'h4-1',
    level: 4,
    text: 'Custom Hooks Pattern',
    slug: 'custom-hooks-pattern',
    position: 5,
    wordCount: 250,
    issues: [{ type: 'skipped-level', severity: 'warning', message: 'Skipped H3 level - consider restructuring for better hierarchy' }]
  },
  {
    id: 'h3-3',
    level: 3,
    text: 'useCallback and useMemo',
    slug: 'usecallback-and-usememo',
    position: 6,
    wordCount: 220,
    issues: []
  },
  {
    id: 'h2-3',
    level: 2,
    text: 'Best Practices',
    slug: 'best-practices',
    position: 7,
    wordCount: 300,
    issues: [{ type: 'too-short', severity: 'info', message: 'Heading could be more descriptive' }]
  },
  {
    id: 'h3-4',
    level: 3,
    text: 'This is a very long heading that might be difficult to read and could cause issues with SEO and accessibility',
    slug: 'this-is-a-very-long-heading',
    position: 8,
    wordCount: 180,
    issues: [{ type: 'too-long', severity: 'warning', message: 'Heading exceeds recommended 60 character limit' }]
  },
  {
    id: 'h2-4',
    level: 2,
    text: 'Conclusion',
    slug: 'conclusion',
    position: 9,
    wordCount: 100,
    issues: []
  }
];

export const HeadingStructure: React.FC<HeadingStructureProps> = ({
  content,
  focusKeyword = 'React Hooks',
  onHeadingClick,
  onHeadingUpdate,
  onSettingsChange,
  className
}) => {
  const [expandedHeadings, setExpandedHeadings] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [editingHeading, setEditingHeading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'outline' | 'flat'>('tree');
  const [settings, setSettings] = useState<HeadingStructureSettings>({
    showPreview: true,
    showIssues: true,
    showWordCount: true,
    showAnchors: true,
    maxH1Count: 1,
    maxHeadingLength: 60,
    minHeadingLength: 10,
    enforceHierarchy: true
  });

  const analysis = useMemo(() => {
    const h1Count = mockHeadings.filter(h => h.level === 1).length;
    const totalIssues = mockHeadings.reduce((acc, h) => acc + h.issues.length, 0);
    const errors = mockHeadings.reduce((acc, h) => acc + h.issues.filter(i => i.severity === 'error').length, 0);
    const warnings = mockHeadings.reduce((acc, h) => acc + h.issues.filter(i => i.severity === 'warning').length, 0);
    const hasKeywordInH1 = mockHeadings.some(h => h.level === 1 && h.text.toLowerCase().includes(focusKeyword.toLowerCase()));
    const score = Math.max(0, 100 - (errors * 20) - (warnings * 5) - (!hasKeywordInH1 ? 10 : 0));

    return { h1Count, totalIssues, errors, warnings, hasKeywordInH1, score };
  }, [focusKeyword]);

  const headingsByLevel = useMemo(() => {
    return mockHeadings.reduce((acc, h) => {
      acc[h.level] = (acc[h.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }, []);

  const toggleHeading = (id: string) => {
    const newExpanded = new Set(expandedHeadings);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedHeadings(newExpanded);
  };

  const getIndentLevel = (level: number) => {
    return (level - 1) * 24;
  };

  const copyAnchorLink = (slug: string) => {
    navigator.clipboard.writeText(`#${slug}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const renderHeading = (heading: Heading, index: number) => {
    const isExpanded = expandedHeadings.has(heading.id);
    const isEditing = editingHeading === heading.id;

    return (
      <motion.div
        key={heading.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={clsx(
          'border-l-2 transition-colors',
          heading.level === 1 && 'border-blue-500',
          heading.level === 2 && 'border-green-500',
          heading.level === 3 && 'border-purple-500',
          heading.level === 4 && 'border-amber-500',
          heading.level === 5 && 'border-pink-500',
          heading.level === 6 && 'border-gray-500'
        )}
        style={{ marginLeft: viewMode === 'tree' ? getIndentLevel(heading.level) : 0 }}
      >
        <div
          className={clsx(
            'flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer',
            heading.issues.length > 0 && 'bg-amber-50/50 dark:bg-amber-900/10'
          )}
          onClick={() => toggleHeading(heading.id)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={clsx(
              'px-1.5 py-0.5 text-xs font-bold rounded',
              heading.level === 1 && 'bg-blue-100 text-blue-700',
              heading.level === 2 && 'bg-green-100 text-green-700',
              heading.level === 3 && 'bg-purple-100 text-purple-700',
              heading.level === 4 && 'bg-amber-100 text-amber-700',
              heading.level === 5 && 'bg-pink-100 text-pink-700',
              heading.level === 6 && 'bg-gray-100 text-gray-700'
            )}>
              H{heading.level}
            </span>

            {isEditing ? (
              <input
                type="text"
                defaultValue={heading.text}
                className="flex-1 px-2 py-1 border rounded"
                autoFocus
                onBlur={(e) => {
                  setEditingHeading(null);
                  if (onHeadingUpdate) {
                    onHeadingUpdate(heading.id, e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingHeading(null);
                    if (onHeadingUpdate) {
                      onHeadingUpdate(heading.id, e.currentTarget.value);
                    }
                  }
                  if (e.key === 'Escape') {
                    setEditingHeading(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm font-medium truncate" title={heading.text}>
                {heading.text}
              </span>
            )}

            {heading.text.toLowerCase().includes(focusKeyword.toLowerCase()) && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                Keyword
              </span>
            )}

            {heading.issues.length > 0 && (
              <span className={clsx(
                'px-1.5 py-0.5 text-xs rounded flex items-center gap-1',
                heading.issues.some(i => i.severity === 'error') && 'bg-red-100 text-red-700',
                !heading.issues.some(i => i.severity === 'error') && heading.issues.some(i => i.severity === 'warning') && 'bg-amber-100 text-amber-700',
                heading.issues.every(i => i.severity === 'info') && 'bg-blue-100 text-blue-700'
              )}>
                <AlertTriangle size={12} />
                {heading.issues.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {settings.showWordCount && (
              <span className="text-xs text-gray-500">{heading.wordCount} words</span>
            )}
            {settings.showAnchors && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyAnchorLink(heading.slug);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Copy anchor link"
              >
                <Anchor size={14} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingHeading(heading.id);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <Edit3 size={14} />
            </button>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
            >
              <div className="p-3 space-y-3">
                {/* Anchor Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Anchor size={14} className="text-gray-500" />
                  <code className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                    #{heading.slug}
                  </code>
                  <button
                    onClick={() => copyAnchorLink(heading.slug)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </div>

                {/* Issues */}
                {settings.showIssues && heading.issues.length > 0 && (
                  <div className="space-y-2">
                    {heading.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          'flex items-start gap-2 p-2 rounded text-sm',
                          issue.severity === 'error' && 'bg-red-100 text-red-800',
                          issue.severity === 'warning' && 'bg-amber-100 text-amber-800',
                          issue.severity === 'info' && 'bg-blue-100 text-blue-800'
                        )}
                      >
                        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onHeadingClick?.(heading.id)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Jump to heading
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <List size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Heading Structure</h2>
            <p className="text-sm text-gray-500">Analyze and optimize your headings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={clsx(
            'px-3 py-1 rounded-full font-medium',
            getScoreColor(analysis.score)
          )}>
            {analysis.score}/100
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-purple-100 text-purple-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'showIssues', label: 'Show Issues' },
                { key: 'showWordCount', label: 'Word Count' },
                { key: 'showAnchors', label: 'Anchor Links' },
                { key: 'enforceHierarchy', label: 'Enforce Hierarchy' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof HeadingStructureSettings] as boolean}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 divide-x border-b">
        <div className="p-3 text-center">
          <div className="text-xl font-bold text-gray-900 dark:text-white">{mockHeadings.length}</div>
          <div className="text-xs text-gray-500">Total Headings</div>
        </div>
        <div className="p-3 text-center">
          <div className={clsx(
            'text-xl font-bold',
            analysis.h1Count === 1 ? 'text-green-600' : 'text-red-600'
          )}>
            {analysis.h1Count}
          </div>
          <div className="text-xs text-gray-500">H1 Tags</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xl font-bold text-amber-600">{analysis.warnings}</div>
          <div className="text-xs text-gray-500">Warnings</div>
        </div>
        <div className="p-3 text-center">
          <div className={clsx(
            'text-xl font-bold',
            analysis.hasKeywordInH1 ? 'text-green-600' : 'text-red-600'
          )}>
            {analysis.hasKeywordInH1 ? <CheckCircle size={24} className="inline" /> : <AlertTriangle size={24} className="inline" />}
          </div>
          <div className="text-xs text-gray-500">Keyword in H1</div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50 dark:bg-gray-800">
        <span className="text-sm text-gray-600">View:</span>
        {['tree', 'outline', 'flat'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            className={clsx(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              viewMode === mode ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-100'
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {[1, 2, 3, 4, 5, 6].map(level => (
            <span
              key={level}
              className={clsx(
                'px-2 py-0.5 rounded',
                headingsByLevel[level] ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 text-gray-400'
              )}
            >
              H{level}: {headingsByLevel[level] || 0}
            </span>
          ))}
        </div>
      </div>

      {/* Headings List */}
      <div className="max-h-[400px] overflow-y-auto p-2">
        {mockHeadings.map((heading, idx) => renderHeading(heading, idx))}
      </div>

      {/* Tips */}
      <div className="p-4 border-t bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Best Practices:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Use exactly one H1 tag per page</li>
              <li>Include your focus keyword in the H1</li>
              <li>Maintain proper heading hierarchy (don't skip levels)</li>
              <li>Keep headings under 60 characters for SEO</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeadingStructure;
