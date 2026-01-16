import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  FileText,
  Clock,
  User,
  Settings,
  X,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Code,
  Type,
  Image,
  Link,
  List
} from 'lucide-react';
import clsx from 'clsx';

interface Version {
  id: string;
  number: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
  wordCount: number;
  changes: {
    additions: number;
    deletions: number;
    modifications: number;
  };
  metadata: {
    blocks: number;
    images: number;
    links: number;
    headings: number;
  };
}

interface DiffBlock {
  id: string;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  blockType: 'paragraph' | 'heading' | 'image' | 'list' | 'code' | 'quote' | 'table';
  leftContent?: string;
  rightContent?: string;
  lineNumbers: {
    left?: number;
    right?: number;
  };
}

interface VersionCompareSettings {
  showLineNumbers: boolean;
  highlightChanges: boolean;
  sideBySide: boolean;
  showMetadata: boolean;
  showUnchanged: boolean;
  wordLevelDiff: boolean;
  syntaxHighlighting: boolean;
  theme: 'light' | 'dark' | 'github' | 'monokai';
}

interface VersionCompareProps {
  versions?: Version[];
  currentVersionId?: string;
  onRestore?: (versionId: string) => void;
  onClose?: () => void;
  className?: string;
  content?: string;
}

const mockVersions: Version[] = [
  {
    id: 'v1',
    number: 1,
    title: 'Initial Draft',
    content: 'First version of the article with basic content.',
    author: { name: 'John Doe', avatar: '/avatars/john.jpg' },
    createdAt: new Date(Date.now() - 86400000 * 7),
    wordCount: 450,
    changes: { additions: 450, deletions: 0, modifications: 0 },
    metadata: { blocks: 8, images: 2, links: 3, headings: 4 }
  },
  {
    id: 'v2',
    number: 2,
    title: 'Added Introduction',
    content: 'Added new introduction section with improved hook.',
    author: { name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
    createdAt: new Date(Date.now() - 86400000 * 5),
    wordCount: 620,
    changes: { additions: 200, deletions: 30, modifications: 15 },
    metadata: { blocks: 12, images: 3, links: 5, headings: 5 }
  },
  {
    id: 'v3',
    number: 3,
    title: 'SEO Optimization',
    content: 'Optimized for search engines, added keywords.',
    author: { name: 'John Doe', avatar: '/avatars/john.jpg' },
    createdAt: new Date(Date.now() - 86400000 * 3),
    wordCount: 680,
    changes: { additions: 80, deletions: 20, modifications: 45 },
    metadata: { blocks: 14, images: 4, links: 8, headings: 6 }
  },
  {
    id: 'v4',
    number: 4,
    title: 'Final Review',
    content: 'Final edits and proofreading completed.',
    author: { name: 'Editor', avatar: '/avatars/editor.jpg' },
    createdAt: new Date(Date.now() - 86400000),
    wordCount: 720,
    changes: { additions: 50, deletions: 10, modifications: 25 },
    metadata: { blocks: 15, images: 4, links: 10, headings: 6 }
  }
];

const mockDiffBlocks: DiffBlock[] = [
  {
    id: 'd1',
    type: 'unchanged',
    blockType: 'heading',
    leftContent: '# Introduction to Modern Web Development',
    rightContent: '# Introduction to Modern Web Development',
    lineNumbers: { left: 1, right: 1 }
  },
  {
    id: 'd2',
    type: 'modified',
    blockType: 'paragraph',
    leftContent: 'Web development has evolved significantly over the past decade.',
    rightContent: 'Web development has evolved dramatically over the past decade, transforming how we build applications.',
    lineNumbers: { left: 3, right: 3 }
  },
  {
    id: 'd3',
    type: 'removed',
    blockType: 'paragraph',
    leftContent: 'This paragraph was removed in the newer version.',
    lineNumbers: { left: 5 }
  },
  {
    id: 'd4',
    type: 'added',
    blockType: 'paragraph',
    rightContent: 'New technologies like React, Vue, and Angular have revolutionized frontend development.',
    lineNumbers: { right: 5 }
  },
  {
    id: 'd5',
    type: 'unchanged',
    blockType: 'heading',
    leftContent: '## Key Technologies',
    rightContent: '## Key Technologies',
    lineNumbers: { left: 7, right: 7 }
  },
  {
    id: 'd6',
    type: 'modified',
    blockType: 'list',
    leftContent: '- HTML5\n- CSS3\n- JavaScript',
    rightContent: '- HTML5 & Semantic Markup\n- CSS3 & Modern Layout\n- JavaScript ES2024\n- TypeScript',
    lineNumbers: { left: 9, right: 9 }
  },
  {
    id: 'd7',
    type: 'added',
    blockType: 'code',
    rightContent: 'const greeting = "Hello, World!";\nconsole.log(greeting);',
    lineNumbers: { right: 15 }
  },
  {
    id: 'd8',
    type: 'unchanged',
    blockType: 'paragraph',
    leftContent: 'Understanding these fundamentals is crucial for any developer.',
    rightContent: 'Understanding these fundamentals is crucial for any developer.',
    lineNumbers: { left: 12, right: 18 }
  }
];

export const VersionCompare: React.FC<VersionCompareProps> = ({
  versions = mockVersions,
  currentVersionId = 'v4',
  onRestore,
  onClose,
  className
}) => {
  const [leftVersion, setLeftVersion] = useState<string>(versions[versions.length - 2]?.id || '');
  const [rightVersion, setRightVersion] = useState<string>(currentVersionId);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<VersionCompareSettings>({
    showLineNumbers: true,
    highlightChanges: true,
    sideBySide: true,
    showMetadata: true,
    showUnchanged: true,
    wordLevelDiff: true,
    syntaxHighlighting: true,
    theme: 'light'
  });

  const leftVersionData = versions.find(v => v.id === leftVersion);
  const rightVersionData = versions.find(v => v.id === rightVersion);

  const getBlockIcon = (blockType: DiffBlock['blockType']) => {
    switch (blockType) {
      case 'heading': return Type;
      case 'image': return Image;
      case 'list': return List;
      case 'code': return Code;
      case 'quote': return FileText;
      default: return FileText;
    }
  };

  const getDiffStats = () => {
    const stats = {
      added: mockDiffBlocks.filter(b => b.type === 'added').length,
      removed: mockDiffBlocks.filter(b => b.type === 'removed').length,
      modified: mockDiffBlocks.filter(b => b.type === 'modified').length,
      unchanged: mockDiffBlocks.filter(b => b.type === 'unchanged').length
    };
    return stats;
  };

  const stats = getDiffStats();

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const swapVersions = () => {
    const temp = leftVersion;
    setLeftVersion(rightVersion);
    setRightVersion(temp);
  };

  const renderWordDiff = (left: string, right: string) => {
    if (!settings.wordLevelDiff) {
      return { left: <span>{left}</span>, right: <span>{right}</span> };
    }

    const leftWords = left?.split(' ') || [];
    const rightWords = right?.split(' ') || [];

    return {
      left: (
        <span>
          {leftWords.map((word, i) => {
            const isRemoved = !rightWords.includes(word);
            return (
              <span
                key={i}
                className={clsx(
                  isRemoved && 'bg-red-200 dark:bg-red-900/50 line-through'
                )}
              >
                {word}{' '}
              </span>
            );
          })}
        </span>
      ),
      right: (
        <span>
          {rightWords.map((word, i) => {
            const isAdded = !leftWords.includes(word);
            return (
              <span
                key={i}
                className={clsx(
                  isAdded && 'bg-green-200 dark:bg-green-900/50'
                )}
              >
                {word}{' '}
              </span>
            );
          })}
        </span>
      )
    };
  };

  const renderDiffBlock = (block: DiffBlock) => {
    const BlockIcon = getBlockIcon(block.blockType);
    const isExpanded = expandedBlocks.has(block.id);
    const wordDiff = block.type === 'modified'
      ? renderWordDiff(block.leftContent || '', block.rightContent || '')
      : null;

    if (!settings.showUnchanged && block.type === 'unchanged') {
      return null;
    }

    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'border rounded-lg overflow-hidden',
          block.type === 'added' && 'border-green-300 bg-green-50 dark:bg-green-900/20',
          block.type === 'removed' && 'border-red-300 bg-red-50 dark:bg-red-900/20',
          block.type === 'modified' && 'border-amber-300 bg-amber-50 dark:bg-amber-900/20',
          block.type === 'unchanged' && 'border-gray-200 dark:border-gray-700'
        )}
      >
        <div
          className="flex items-center justify-between p-2 cursor-pointer hover:bg-black/5"
          onClick={() => toggleBlock(block.id)}
        >
          <div className="flex items-center gap-2">
            <BlockIcon size={16} className="text-gray-500" />
            <span className="text-sm font-medium capitalize">{block.blockType}</span>
            <span className={clsx(
              'px-2 py-0.5 text-xs rounded-full',
              block.type === 'added' && 'bg-green-200 text-green-800',
              block.type === 'removed' && 'bg-red-200 text-red-800',
              block.type === 'modified' && 'bg-amber-200 text-amber-800',
              block.type === 'unchanged' && 'bg-gray-200 text-gray-800'
            )}>
              {block.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {settings.showLineNumbers && (
              <span className="text-xs text-gray-500">
                L{block.lineNumbers.left || '-'} → L{block.lineNumbers.right || '-'}
              </span>
            )}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t"
            >
              {settings.sideBySide ? (
                <div className="grid grid-cols-2 divide-x">
                  <div className={clsx(
                    'p-3 text-sm',
                    block.type === 'removed' && 'bg-red-100 dark:bg-red-900/30',
                    block.type === 'modified' && 'bg-red-50 dark:bg-red-900/20'
                  )}>
                    {block.leftContent ? (
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {wordDiff ? wordDiff.left : block.leftContent}
                      </pre>
                    ) : (
                      <span className="text-gray-400 italic">No content</span>
                    )}
                  </div>
                  <div className={clsx(
                    'p-3 text-sm',
                    block.type === 'added' && 'bg-green-100 dark:bg-green-900/30',
                    block.type === 'modified' && 'bg-green-50 dark:bg-green-900/20'
                  )}>
                    {block.rightContent ? (
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {wordDiff ? wordDiff.right : block.rightContent}
                      </pre>
                    ) : (
                      <span className="text-gray-400 italic">No content</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {block.leftContent && block.type !== 'added' && (
                    <div className="flex gap-2">
                      <Minus size={14} className="text-red-500 mt-1 flex-shrink-0" />
                      <pre className="whitespace-pre-wrap font-mono text-xs text-red-700 dark:text-red-300 line-through">
                        {block.leftContent}
                      </pre>
                    </div>
                  )}
                  {block.rightContent && block.type !== 'removed' && (
                    <div className="flex gap-2">
                      <Plus size={14} className="text-green-500 mt-1 flex-shrink-0" />
                      <pre className="whitespace-pre-wrap font-mono text-xs text-green-700 dark:text-green-300">
                        {block.rightContent}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <GitCompare size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Version Compare</h2>
            <p className="text-sm text-gray-500">Compare changes between versions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
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
                { key: 'showLineNumbers', label: 'Line Numbers' },
                { key: 'highlightChanges', label: 'Highlight Changes' },
                { key: 'sideBySide', label: 'Side by Side' },
                { key: 'showMetadata', label: 'Show Metadata' },
                { key: 'showUnchanged', label: 'Show Unchanged' },
                { key: 'wordLevelDiff', label: 'Word-level Diff' },
                { key: 'syntaxHighlighting', label: 'Syntax Highlighting' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof VersionCompareSettings] as boolean}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="github">GitHub</option>
                  <option value="monokai">Monokai</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Selectors */}
      <div className="p-4 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Older Version</label>
            <select
              value={leftVersion}
              onChange={(e) => setLeftVersion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.number} - {v.title} ({new Date(v.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapVersions}
            className="p-2 mt-4 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            title="Swap versions"
          >
            <ArrowLeft size={16} className="inline" />
            <ArrowRight size={16} className="inline" />
          </button>

          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Newer Version</label>
            <select
              value={rightVersion}
              onChange={(e) => setRightVersion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.number} - {v.title} ({new Date(v.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Version Metadata */}
      {settings.showMetadata && leftVersionData && rightVersionData && (
        <div className="grid grid-cols-2 divide-x border-b">
          {[leftVersionData, rightVersionData].map((version, idx) => (
            <div key={version.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={version.author.avatar}
                  alt={version.author.name}
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
                <div>
                  <div className="font-medium text-sm">{version.author.name}</div>
                  <div className="text-xs text-gray-500">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(version.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold">{version.wordCount}</div>
                  <div className="text-xs text-gray-500">Words</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold">{version.metadata.blocks}</div>
                  <div className="text-xs text-gray-500">Blocks</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold">{version.metadata.images}</div>
                  <div className="text-xs text-gray-500">Images</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold">{version.metadata.links}</div>
                  <div className="text-xs text-gray-500">Links</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diff Stats */}
      <div className="flex items-center gap-4 p-4 border-b bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 text-green-600">
          <Plus size={16} />
          <span className="font-medium">{stats.added} added</span>
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <Minus size={16} />
          <span className="font-medium">{stats.removed} removed</span>
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle size={16} />
          <span className="font-medium">{stats.modified} modified</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Info size={16} />
          <span className="font-medium">{stats.unchanged} unchanged</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setExpandedBlocks(new Set(mockDiffBlocks.map(b => b.id)))}
          className="text-sm text-blue-600 hover:underline"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpandedBlocks(new Set())}
          className="text-sm text-blue-600 hover:underline"
        >
          Collapse All
        </button>
      </div>

      {/* Diff Content */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {mockDiffBlocks.map(renderDiffBlock)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
            <Copy size={14} />
            Copy Diff
          </button>
          <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
            <FileText size={14} />
            Export
          </button>
        </div>
        <div className="flex items-center gap-2">
          {leftVersionData && onRestore && (
            <button
              onClick={() => onRestore(leftVersion)}
              className="px-4 py-2 text-sm border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Restore v{leftVersionData.number}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Check size={14} />
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VersionCompare;
