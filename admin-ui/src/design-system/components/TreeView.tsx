/**
 * RustPress TreeView Component
 * Hierarchical tree navigation with expand/collapse
 */

import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  GripVertical,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  data?: Record<string, unknown>;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  selectedId?: string | string[];
  expandedIds?: string[];
  onSelect?: (id: string, node: TreeNode) => void;
  onExpand?: (id: string, expanded: boolean) => void;
  onContextMenu?: (id: string, node: TreeNode) => void;
  multiSelect?: boolean;
  showCheckboxes?: boolean;
  showIcons?: boolean;
  showLines?: boolean;
  draggable?: boolean;
  onDragEnd?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  defaultExpandAll?: boolean;
  defaultExpandLevel?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TreeContextType {
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  onSelect: (id: string, node: TreeNode) => void;
  onExpand: (id: string) => void;
  multiSelect: boolean;
  showCheckboxes: boolean;
  showIcons: boolean;
  showLines: boolean;
  draggable: boolean;
  size: 'sm' | 'md' | 'lg';
  level: number;
}

const TreeContext = createContext<TreeContextType | null>(null);

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  sm: { padding: 'py-1 px-2', text: 'text-xs', icon: 'w-3.5 h-3.5', indent: 16 },
  md: { padding: 'py-1.5 px-2', text: 'text-sm', icon: 'w-4 h-4', indent: 20 },
  lg: { padding: 'py-2 px-3', text: 'text-base', icon: 'w-5 h-5', indent: 24 },
};

// ============================================================================
// Tree Node Component
// ============================================================================

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
}

function TreeNodeItem({ node, level }: TreeNodeItemProps) {
  const context = useContext(TreeContext);
  if (!context) return null;

  const {
    selectedIds,
    expandedIds,
    onSelect,
    onExpand,
    multiSelect,
    showCheckboxes,
    showIcons,
    showLines,
    size,
  } = context;

  const config = sizeConfig[size];
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedIds.has(node.id);
  const isExpandable = node.expandable !== false && hasChildren;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.disabled) {
      if (isExpandable) {
        onExpand(node.id);
      }
      if (node.selectable !== false) {
        onSelect(node.id, node);
      }
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpandable) {
      onExpand(node.id);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!node.disabled && node.selectable !== false) {
      onSelect(node.id, node);
    }
  };

  // Default icons
  const defaultIcon = hasChildren
    ? isExpanded
      ? <FolderOpen className={config.icon} />
      : <Folder className={config.icon} />
    : <File className={config.icon} />;

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'group flex items-center gap-1 rounded-md cursor-pointer transition-colors',
          config.padding,
          isSelected
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          node.disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ paddingLeft: level * config.indent + 8 }}
      >
        {/* Expand/Collapse Arrow */}
        <button
          onClick={handleExpandClick}
          className={cn(
            'flex-shrink-0 p-0.5 rounded transition-transform',
            isExpandable ? 'visible' : 'invisible',
            isExpanded && 'transform rotate-90'
          )}
        >
          <ChevronRight className={cn(config.icon, 'text-neutral-400')} />
        </button>

        {/* Checkbox */}
        {showCheckboxes && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            disabled={node.disabled || node.selectable === false}
            className="flex-shrink-0 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
          />
        )}

        {/* Icon */}
        {showIcons && (
          <span className={cn('flex-shrink-0', isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400')}>
            {node.icon || defaultIcon}
          </span>
        )}

        {/* Label */}
        <span className={cn('flex-1 truncate', config.text)}>
          {node.label}
        </span>
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {showLines && (
              <div
                className="absolute border-l border-neutral-200 dark:border-neutral-700"
                style={{
                  left: level * config.indent + 16,
                  top: 0,
                  bottom: 0,
                }}
              />
            )}
            {node.children!.map((child) => (
              <TreeNodeItem key={child.id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Search Component
// ============================================================================

interface TreeSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TreeSearch({ value, onChange, placeholder }: TreeSearchProps) {
  return (
    <div className="relative mb-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border',
          'bg-white dark:bg-neutral-800',
          'border-neutral-300 dark:border-neutral-600',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'placeholder:text-neutral-400'
        )}
      />
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAllNodeIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const traverse = (nodeList: TreeNode[]) => {
    nodeList.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return ids;
}

function getExpandedToLevel(nodes: TreeNode[], level: number, currentLevel = 0): string[] {
  if (currentLevel >= level) return [];

  const ids: string[] = [];
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      ids.push(node.id);
      ids.push(...getExpandedToLevel(node.children, level, currentLevel + 1));
    }
  });
  return ids;
}

function filterNodes(nodes: TreeNode[], search: string): TreeNode[] {
  const searchLower = search.toLowerCase();

  const filter = (nodeList: TreeNode[]): TreeNode[] => {
    return nodeList
      .map((node) => {
        const matchesSearch = node.label.toLowerCase().includes(searchLower);
        const filteredChildren = node.children ? filter(node.children) : [];

        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          };
        }
        return null;
      })
      .filter((node): node is TreeNode => node !== null);
  };

  return filter(nodes);
}

// ============================================================================
// Main TreeView Component
// ============================================================================

export function TreeView({
  nodes,
  selectedId,
  expandedIds: controlledExpandedIds,
  onSelect,
  onExpand,
  onContextMenu,
  multiSelect = false,
  showCheckboxes = false,
  showIcons = true,
  showLines = false,
  draggable = false,
  onDragEnd,
  defaultExpandAll = false,
  defaultExpandLevel,
  searchable = false,
  searchPlaceholder,
  emptyMessage = 'No items',
  size = 'md',
  className,
}: TreeViewProps) {
  // Initialize expanded state
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(() => {
    if (defaultExpandAll) {
      return new Set(getAllNodeIds(nodes));
    }
    if (defaultExpandLevel !== undefined) {
      return new Set(getExpandedToLevel(nodes, defaultExpandLevel));
    }
    return new Set();
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Determine selected IDs
  const selectedIds = useMemo(() => {
    if (Array.isArray(selectedId)) {
      return new Set(selectedId);
    }
    return selectedId ? new Set([selectedId]) : new Set<string>();
  }, [selectedId]);

  // Determine expanded IDs
  const expandedIds = controlledExpandedIds
    ? new Set(controlledExpandedIds)
    : internalExpandedIds;

  // Filter nodes based on search
  const filteredNodes = searchQuery
    ? filterNodes(nodes, searchQuery)
    : nodes;

  // Handle selection
  const handleSelect = useCallback(
    (id: string, node: TreeNode) => {
      onSelect?.(id, node);
    },
    [onSelect]
  );

  // Handle expand/collapse
  const handleExpand = useCallback(
    (id: string) => {
      if (controlledExpandedIds) {
        onExpand?.(id, !expandedIds.has(id));
      } else {
        setInternalExpandedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
        onExpand?.(id, !expandedIds.has(id));
      }
    },
    [controlledExpandedIds, expandedIds, onExpand]
  );

  const contextValue: TreeContextType = {
    selectedIds,
    expandedIds,
    onSelect: handleSelect,
    onExpand: handleExpand,
    multiSelect,
    showCheckboxes,
    showIcons,
    showLines,
    draggable,
    size,
    level: 0,
  };

  return (
    <TreeContext.Provider value={contextValue}>
      <div className={cn('', className)}>
        {searchable && (
          <TreeSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        )}

        {filteredNodes.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {searchQuery ? 'No matching items' : emptyMessage}
          </div>
        ) : (
          <div className="relative">
            {filteredNodes.map((node) => (
              <TreeNodeItem key={node.id} node={node} level={0} />
            ))}
          </div>
        )}
      </div>
    </TreeContext.Provider>
  );
}

// ============================================================================
// File Tree (specialized for file system)
// ============================================================================

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  modifiedAt?: Date;
  children?: FileTreeNode[];
}

export interface FileTreeProps {
  files: FileTreeNode[];
  selectedId?: string;
  onSelect?: (file: FileTreeNode) => void;
  onContextMenu?: (file: FileTreeNode, event: React.MouseEvent) => void;
  showFileSize?: boolean;
  className?: string;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  js: <span className="text-yellow-500">JS</span>,
  ts: <span className="text-blue-500">TS</span>,
  tsx: <span className="text-blue-400">TSX</span>,
  jsx: <span className="text-yellow-400">JSX</span>,
  json: <span className="text-yellow-600">{'{}'}</span>,
  md: <span className="text-neutral-400">MD</span>,
  css: <span className="text-purple-500">CSS</span>,
  html: <span className="text-orange-500">HTML</span>,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function convertToTreeNodes(files: FileTreeNode[]): TreeNode[] {
  return files.map((file) => ({
    id: file.id,
    label: file.name,
    icon: file.type === 'folder'
      ? undefined
      : file.extension && fileTypeIcons[file.extension]
        ? fileTypeIcons[file.extension]
        : <File className="w-4 h-4" />,
    children: file.children ? convertToTreeNodes(file.children) : undefined,
    data: {
      type: file.type,
      extension: file.extension,
      size: file.size,
      modifiedAt: file.modifiedAt,
    },
  }));
}

export function FileTree({
  files,
  selectedId,
  onSelect,
  onContextMenu,
  showFileSize = false,
  className,
}: FileTreeProps) {
  const treeNodes = useMemo(() => convertToTreeNodes(files), [files]);

  const handleSelect = useCallback(
    (id: string, node: TreeNode) => {
      const findFile = (fileList: FileTreeNode[]): FileTreeNode | undefined => {
        for (const file of fileList) {
          if (file.id === id) return file;
          if (file.children) {
            const found = findFile(file.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const file = findFile(files);
      if (file) {
        onSelect?.(file);
      }
    },
    [files, onSelect]
  );

  return (
    <TreeView
      nodes={treeNodes}
      selectedId={selectedId}
      onSelect={handleSelect}
      showIcons
      size="sm"
      className={className}
    />
  );
}

// ============================================================================
// Expandable List (simple nested list)
// ============================================================================

export interface ExpandableListItem {
  id: string;
  label: string;
  badge?: string | number;
  children?: ExpandableListItem[];
}

export interface ExpandableListProps {
  items: ExpandableListItem[];
  selectedId?: string;
  onSelect?: (item: ExpandableListItem) => void;
  className?: string;
}

export function ExpandableList({
  items,
  selectedId,
  onSelect,
  className,
}: ExpandableListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderItem = (item: ExpandableListItem, level: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isSelected = item.id === selectedId;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            }
            onSelect?.(item);
          }}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg',
            isSelected
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'transition-colors'
          )}
          style={{ paddingLeft: level * 16 + 12 }}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <ChevronRight
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
            <span>{item.label}</span>
          </div>
          {item.badge !== undefined && (
            <span className="px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
              {item.badge}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {item.children!.map((child) => renderItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={cn('space-y-0.5', className)}>
      {items.map((item) => renderItem(item, 0))}
    </div>
  );
}

export default TreeView;
