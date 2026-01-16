import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  Move,
  Trash2,
  Plus,
  Edit3,
  Link,
  Image,
  Video,
  FileText,
  Code,
  Quote,
  Table,
  Columns,
  CheckSquare,
  AlertCircle,
  GripVertical,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import clsx from 'clsx';

interface OutlineBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'code' | 'quote' | 'list' | 'table' | 'columns' | 'embed' | 'divider' | 'custom';
  content: string;
  level?: number;
  wordCount: number;
  children?: OutlineBlock[];
  collapsed?: boolean;
  visible: boolean;
  hasIssues?: boolean;
  issueMessage?: string;
}

interface ContentOutlineSettings {
  showWordCount: boolean;
  showBlockType: boolean;
  showHidden: boolean;
  collapsible: boolean;
  enableDragDrop: boolean;
  highlightIssues: boolean;
  groupByHeading: boolean;
}

interface ContentOutlineProps {
  blocks?: OutlineBlock[];
  onBlockClick?: (blockId: string) => void;
  onBlockMove?: (blockId: string, newIndex: number) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockVisibilityToggle?: (blockId: string) => void;
  className?: string;
}

const mockBlocks: OutlineBlock[] = [
  {
    id: 'b1',
    type: 'heading',
    content: 'Introduction to React Hooks',
    level: 1,
    wordCount: 0,
    visible: true,
    children: [
      {
        id: 'b2',
        type: 'paragraph',
        content: 'React Hooks were introduced in React 16.8 as a way to use state and other React features...',
        wordCount: 45,
        visible: true
      },
      {
        id: 'b3',
        type: 'image',
        content: 'react-hooks-diagram.png',
        wordCount: 0,
        visible: true
      }
    ]
  },
  {
    id: 'b4',
    type: 'heading',
    content: 'Understanding useState',
    level: 2,
    wordCount: 0,
    visible: true,
    children: [
      {
        id: 'b5',
        type: 'paragraph',
        content: 'The useState hook allows you to add state to functional components...',
        wordCount: 62,
        visible: true
      },
      {
        id: 'b6',
        type: 'code',
        content: 'const [count, setCount] = useState(0);',
        wordCount: 0,
        visible: true
      },
      {
        id: 'b7',
        type: 'paragraph',
        content: 'This simple example demonstrates how to create a counter...',
        wordCount: 38,
        visible: true,
        hasIssues: true,
        issueMessage: 'Paragraph is too short (min 50 words recommended)'
      }
    ]
  },
  {
    id: 'b8',
    type: 'heading',
    content: 'Working with useEffect',
    level: 2,
    wordCount: 0,
    visible: true,
    children: [
      {
        id: 'b9',
        type: 'paragraph',
        content: 'The useEffect hook lets you perform side effects in your components...',
        wordCount: 78,
        visible: true
      },
      {
        id: 'b10',
        type: 'code',
        content: 'useEffect(() => { document.title = `Count: ${count}`; }, [count]);',
        wordCount: 0,
        visible: true
      },
      {
        id: 'b11',
        type: 'quote',
        content: 'Think of useEffect as componentDidMount, componentDidUpdate, and componentWillUnmount combined.',
        wordCount: 12,
        visible: true
      }
    ]
  },
  {
    id: 'b12',
    type: 'heading',
    content: 'Custom Hooks',
    level: 2,
    wordCount: 0,
    visible: true,
    children: [
      {
        id: 'b13',
        type: 'paragraph',
        content: 'Custom hooks allow you to extract component logic into reusable functions...',
        wordCount: 95,
        visible: true
      },
      {
        id: 'b14',
        type: 'code',
        content: 'function useWindowSize() { ... }',
        wordCount: 0,
        visible: true
      }
    ]
  },
  {
    id: 'b15',
    type: 'heading',
    content: 'Best Practices',
    level: 2,
    wordCount: 0,
    visible: true,
    collapsed: true,
    children: [
      {
        id: 'b16',
        type: 'list',
        content: '1. Always follow the rules of hooks\n2. Use ESLint plugin\n3. Keep hooks at the top level',
        wordCount: 15,
        visible: true
      },
      {
        id: 'b17',
        type: 'table',
        content: 'Comparison table of hooks',
        wordCount: 0,
        visible: false
      }
    ]
  },
  {
    id: 'b18',
    type: 'heading',
    content: 'Conclusion',
    level: 2,
    wordCount: 0,
    visible: true,
    children: [
      {
        id: 'b19',
        type: 'paragraph',
        content: 'React Hooks have transformed how we write React components...',
        wordCount: 52,
        visible: true
      }
    ]
  }
];

export const ContentOutline: React.FC<ContentOutlineProps> = ({
  blocks = mockBlocks,
  onBlockClick,
  onBlockMove,
  onBlockDelete,
  onBlockVisibilityToggle,
  className
}) => {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(blocks.map(b => b.id)));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [settings, setSettings] = useState<ContentOutlineSettings>({
    showWordCount: true,
    showBlockType: true,
    showHidden: true,
    collapsible: true,
    enableDragDrop: true,
    highlightIssues: true,
    groupByHeading: true
  });

  const stats = useMemo(() => {
    let totalWords = 0;
    let totalBlocks = 0;
    let issues = 0;
    let hidden = 0;

    const countBlocks = (items: OutlineBlock[]) => {
      items.forEach(block => {
        totalBlocks++;
        totalWords += block.wordCount;
        if (block.hasIssues) issues++;
        if (!block.visible) hidden++;
        if (block.children) countBlocks(block.children);
      });
    };

    countBlocks(blocks);
    return { totalWords, totalBlocks, issues, hidden };
  }, [blocks]);

  const getBlockIcon = (type: OutlineBlock['type']) => {
    switch (type) {
      case 'heading': return FileText;
      case 'paragraph': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'code': return Code;
      case 'quote': return Quote;
      case 'list': return List;
      case 'table': return Table;
      case 'columns': return Columns;
      case 'embed': return Link;
      default: return FileText;
    }
  };

  const toggleExpand = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const addIds = (items: OutlineBlock[]) => {
      items.forEach(block => {
        allIds.add(block.id);
        if (block.children) addIds(block.children);
      });
    };
    addIds(blocks);
    setExpandedBlocks(allIds);
  };

  const collapseAll = () => {
    setExpandedBlocks(new Set());
  };

  const filterBlocks = (items: OutlineBlock[]): OutlineBlock[] => {
    return items.filter(block => {
      if (!settings.showHidden && !block.visible) return false;
      if (filterType !== 'all' && block.type !== filterType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return block.content.toLowerCase().includes(query);
      }
      return true;
    }).map(block => ({
      ...block,
      children: block.children ? filterBlocks(block.children) : undefined
    }));
  };

  const filteredBlocks = useMemo(() => filterBlocks(blocks), [blocks, settings.showHidden, filterType, searchQuery]);

  const renderBlock = (block: OutlineBlock, depth: number = 0) => {
    const Icon = getBlockIcon(block.type);
    const isExpanded = expandedBlocks.has(block.id);
    const hasChildren = block.children && block.children.length > 0;
    const isSelected = selectedBlock === block.id;

    return (
      <div key={block.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={clsx(
            'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors group',
            isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            !block.visible && 'opacity-50',
            block.hasIssues && settings.highlightIssues && 'border-l-4 border-amber-500'
          )}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          onClick={() => {
            setSelectedBlock(block.id);
            onBlockClick?.(block.id);
          }}
        >
          {/* Drag Handle */}
          {settings.enableDragDrop && (
            <GripVertical size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab" />
          )}

          {/* Expand/Collapse */}
          {hasChildren && settings.collapsible ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(block.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Block Type Icon */}
          <Icon size={16} className={clsx(
            'flex-shrink-0',
            block.type === 'heading' && 'text-blue-600',
            block.type === 'paragraph' && 'text-gray-500',
            block.type === 'image' && 'text-green-600',
            block.type === 'video' && 'text-purple-600',
            block.type === 'code' && 'text-orange-600',
            block.type === 'quote' && 'text-pink-600'
          )} />

          {/* Block Type Badge */}
          {settings.showBlockType && (
            <span className={clsx(
              'px-1.5 py-0.5 text-xs rounded',
              block.type === 'heading' && `bg-blue-100 text-blue-700`,
              block.type !== 'heading' && 'bg-gray-100 text-gray-600'
            )}>
              {block.type === 'heading' ? `H${block.level}` : block.type}
            </span>
          )}

          {/* Content */}
          <span className={clsx(
            'flex-1 truncate text-sm',
            block.type === 'heading' && 'font-medium'
          )}>
            {block.content}
          </span>

          {/* Word Count */}
          {settings.showWordCount && block.wordCount > 0 && (
            <span className="text-xs text-gray-400">{block.wordCount}w</span>
          )}

          {/* Issue Indicator */}
          {block.hasIssues && settings.highlightIssues && (
            <span title={block.issueMessage}>
              <AlertCircle size={14} className="text-amber-500" />
            </span>
          )}

          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBlockVisibilityToggle?.(block.id);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {block.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-400" />}
          </button>

          {/* Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBlockDelete?.(block.id);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded"
          >
            <Trash2 size={14} />
          </button>
        </motion.div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {block.children!.map(child => renderBlock(child, depth + 1))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  };

  const blockTypes = ['heading', 'paragraph', 'image', 'video', 'code', 'quote', 'list', 'table'];

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
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <Layers size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Content Outline</h2>
            <p className="text-sm text-gray-500">Navigate and organize your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg"
            title="Expand all"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={collapseAll}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg"
            title="Collapse all"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-slate-100 text-slate-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 divide-x border-b">
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{stats.totalBlocks}</div>
          <div className="text-xs text-gray-500">Blocks</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{stats.totalWords}</div>
          <div className="text-xs text-gray-500">Words</div>
        </div>
        <div className="p-3 text-center">
          <div className={clsx('text-lg font-bold', stats.issues > 0 ? 'text-amber-600' : 'text-green-600')}>
            {stats.issues}
          </div>
          <div className="text-xs text-gray-500">Issues</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold text-gray-400">{stats.hidden}</div>
          <div className="text-xs text-gray-500">Hidden</div>
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
            <div className="p-4 grid grid-cols-3 gap-4">
              {[
                { key: 'showWordCount', label: 'Word Count' },
                { key: 'showBlockType', label: 'Block Types' },
                { key: 'showHidden', label: 'Hidden Blocks' },
                { key: 'collapsible', label: 'Collapsible' },
                { key: 'enableDragDrop', label: 'Drag & Drop' },
                { key: 'highlightIssues', label: 'Highlight Issues' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof ContentOutlineSettings] as boolean}
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

      {/* Search and Filter */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Types</option>
          {blockTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Outline Content */}
      <div className="max-h-[400px] overflow-y-auto p-2">
        {filteredBlocks.map(block => renderBlock(block))}

        {filteredBlocks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Layers size={32} className="mx-auto mb-2 opacity-50" />
            <p>No blocks found</p>
          </div>
        )}
      </div>

      {/* Quick Jump */}
      <div className="p-3 border-t bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 mb-2">Quick Jump</p>
        <div className="flex flex-wrap gap-1">
          {blocks.filter(b => b.type === 'heading').map(heading => (
            <button
              key={heading.id}
              onClick={() => {
                setSelectedBlock(heading.id);
                onBlockClick?.(heading.id);
              }}
              className={clsx(
                'px-2 py-1 text-xs rounded-full transition-colors',
                selectedBlock === heading.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 hover:bg-blue-100'
              )}
            >
              {heading.content.slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentOutline;
