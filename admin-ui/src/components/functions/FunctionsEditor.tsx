// FunctionsEditor.tsx - VS Code-like Code Editor Components (Enhancements 1-10)
// Monaco Editor, Multi-tab, File Explorer, Minimap, Breadcrumbs, Command Palette,
// Search/Replace, Problems Panel, Output Panel, Terminal

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  Replace,
  Terminal as TerminalIcon,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Play,
  Square,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Command,
  Code,
  FileCode,
  FileJson,
  FileText,
  Braces,
  Hash,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Split,
  PanelLeft,
  PanelBottom,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  CaseSensitive,
  Regex,
  WholeWord,
  Clock,
  Zap,
  Bug,
  GitBranch,
  Save,
  Undo,
  Redo,
  Indent,
  WrapText,
  Keyboard,
  Palette,
  Moon,
  Sun,
  Monitor,
  Circle,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isDirty: boolean;
  isReadOnly?: boolean;
}

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  language?: string;
  children?: FileTreeNode[];
  isExpanded?: boolean;
}

export interface EditorTab {
  id: string;
  file: EditorFile;
  isActive: boolean;
  isPinned?: boolean;
  isPreview?: boolean;
}

export interface DiagnosticItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  file: string;
  line: number;
  column: number;
  source?: string;
  code?: string;
}

export interface OutputLine {
  id: string;
  timestamp: Date;
  type: 'info' | 'warn' | 'error' | 'debug' | 'success';
  message: string;
  source?: string;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export interface EditorTheme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    lineNumber: string;
    selection: string;
    cursor: string;
    activeLine: string;
  };
}

// ============================================================================
// ENHANCEMENT 1: Monaco Editor Integration with Syntax Highlighting
// ============================================================================

interface MonacoEditorProps {
  file: EditorFile;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black';
  fontSize?: number;
  showMinimap?: boolean;
  wordWrap?: 'on' | 'off' | 'wordWrapColumn';
  lineNumbers?: 'on' | 'off' | 'relative';
  onChange?: (content: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

export function MonacoEditor({
  file,
  theme = 'vs-dark',
  fontSize = 14,
  showMinimap = true,
  wordWrap = 'on',
  lineNumbers = 'on',
  onChange,
  onSave,
  readOnly = false
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState<string | null>(null);
  const [content, setContent] = useState(file.content);
  const lineCount = content.split('\n').length;

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'javascript':
      case 'typescript':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-500" />;
      case 'rust':
        return <Braces className="w-4 h-4 text-orange-400" />;
      case 'python':
        return <Hash className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const syntaxHighlight = (code: string, language: string): React.ReactNode[] => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      // Simple syntax highlighting patterns
      let highlighted = line;

      // Keywords
      const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'interface', 'type', 'enum', 'fn', 'pub', 'mod', 'use', 'struct', 'impl', 'trait', 'where', 'match', 'def', 'self'];

      return (
        <div key={index} className="flex">
          {lineNumbers !== 'off' && (
            <span className="select-none text-right pr-4 text-gray-500 w-12 flex-shrink-0">
              {lineNumbers === 'relative' ? Math.abs(index + 1 - cursorPosition.line) || index + 1 : index + 1}
            </span>
          )}
          <span className="flex-1">
            {line.split(/(\s+)/).map((part, i) => {
              if (keywords.includes(part)) {
                return <span key={i} className="text-purple-400">{part}</span>;
              }
              if (part.match(/^["'`].*["'`]$/)) {
                return <span key={i} className="text-green-400">{part}</span>;
              }
              if (part.match(/^\d+$/)) {
                return <span key={i} className="text-orange-400">{part}</span>;
              }
              if (part.match(/^\/\/.*/)) {
                return <span key={i} className="text-gray-500 italic">{part}</span>;
              }
              return <span key={i}>{part}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      theme === 'vs-dark' ? 'bg-[#1e1e1e]' : 'bg-white'
    )}>
      {/* Editor Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        theme === 'vs-dark' ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-gray-100 border-gray-200'
      )}>
        <div className="flex items-center gap-2">
          {getLanguageIcon(file.language)}
          <span className={cn(
            "text-sm",
            theme === 'vs-dark' ? 'text-gray-300' : 'text-gray-700'
          )}>
            {file.name}
            {file.isDirty && <span className="text-orange-400 ml-1">●</span>}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{file.language.toUpperCase()}</span>
          <span>|</span>
          <span>UTF-8</span>
          <span>|</span>
          <span>LF</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div
          ref={editorRef}
          className={cn(
            "flex-1 overflow-auto font-mono text-sm p-4",
            theme === 'vs-dark' ? 'text-gray-300' : 'text-gray-800'
          )}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <pre className="leading-6">
            {syntaxHighlight(content, file.language)}
          </pre>
        </div>

        {/* Minimap */}
        {showMinimap && (
          <div className={cn(
            "w-24 border-l overflow-hidden",
            theme === 'vs-dark' ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="p-1 transform scale-[0.15] origin-top-left w-[600px]">
              <pre className={cn(
                "text-[10px] leading-[2px]",
                theme === 'vs-dark' ? 'text-gray-500' : 'text-gray-400'
              )}>
                {content}
              </pre>
            </div>
            {/* Viewport indicator */}
            <div className={cn(
              "absolute top-2 right-2 w-20 h-16 border rounded opacity-30",
              theme === 'vs-dark' ? 'bg-blue-500 border-blue-400' : 'bg-blue-200 border-blue-300'
            )} />
          </div>
        )}
      </div>

      {/* Editor Footer / Status Bar */}
      <div className={cn(
        "flex items-center justify-between px-4 py-1 text-xs border-t",
        theme === 'vs-dark' ? 'bg-[#007acc] text-white' : 'bg-blue-500 text-white'
      )}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            main
          </span>
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{selection ? `${selection.length} selected` : ''}</span>
          <span>Spaces: 2</span>
          <span>{file.language}</span>
          {readOnly && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Read Only</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 2: Multi-tab Editor with Drag & Drop Reordering
// ============================================================================

interface MultiTabEditorProps {
  tabs: EditorTab[];
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (tabs: EditorTab[]) => void;
  onTabPin?: (tabId: string) => void;
  onSplitRight?: (tabId: string) => void;
}

export function MultiTabEditor({
  tabs,
  onTabSelect,
  onTabClose,
  onTabReorder,
  onTabPin,
  onSplitRight
}: MultiTabEditorProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);

  const getFileIcon = (language: string) => {
    const icons: Record<string, React.ReactNode> = {
      javascript: <FileCode className="w-4 h-4 text-yellow-400" />,
      typescript: <FileCode className="w-4 h-4 text-blue-400" />,
      json: <FileJson className="w-4 h-4 text-yellow-500" />,
      rust: <Braces className="w-4 h-4 text-orange-400" />,
      python: <Hash className="w-4 h-4 text-green-400" />,
      html: <Code className="w-4 h-4 text-orange-500" />,
      css: <Palette className="w-4 h-4 text-blue-500" />,
    };
    return icons[language] || <FileText className="w-4 h-4 text-gray-400" />;
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Tab Bar */}
      <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto">
        <Reorder.Group
          axis="x"
          values={tabs}
          onReorder={onTabReorder}
          className="flex items-center"
        >
          {tabs.map((tab) => (
            <Reorder.Item
              key={tab.id}
              value={tab}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-[#3c3c3c] min-w-[120px] max-w-[200px] group",
                tab.isActive
                  ? 'bg-[#1e1e1e] text-white'
                  : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a]',
                tab.isPreview && 'italic'
              )}
              onClick={() => onTabSelect(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
            >
              {tab.isPinned && <Circle className="w-2 h-2 fill-current text-blue-400" />}
              {getFileIcon(tab.file.language)}
              <span className="truncate flex-1 text-sm">{tab.file.name}</span>
              {tab.file.isDirty && <span className="text-orange-400">●</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* New Tab Button */}
        <button className="p-2 hover:bg-[#3c3c3c] text-gray-400">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.find(t => t.isActive) && (
          <MonacoEditor
            file={tabs.find(t => t.isActive)!.file}
            theme="vs-dark"
          />
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 min-w-[180px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onTabClose(contextMenu.tabId);
                  setContextMenu(null);
                }}
              >
                <X className="w-4 h-4" /> Close
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  tabs.filter(t => t.id !== contextMenu.tabId).forEach(t => onTabClose(t.id));
                  setContextMenu(null);
                }}
              >
                <X className="w-4 h-4" /> Close Others
              </button>
              <div className="border-t border-[#3c3c3c] my-1" />
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onTabPin?.(contextMenu.tabId);
                  setContextMenu(null);
                }}
              >
                <Circle className="w-4 h-4" /> Pin Tab
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onSplitRight?.(contextMenu.tabId);
                  setContextMenu(null);
                }}
              >
                <Split className="w-4 h-4" /> Split Right
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 3: File Explorer Sidebar with Tree View
// ============================================================================

interface FileExplorerProps {
  tree: FileTreeNode[];
  selectedFile?: string;
  onFileSelect: (file: FileTreeNode) => void;
  onFolderToggle: (folderId: string) => void;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
  onRename?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export function FileExplorer({
  tree,
  selectedFile,
  onFileSelect,
  onFolderToggle,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileTreeNode } | null>(null);

  const getFileIcon = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      return node.isExpanded
        ? <FolderOpen className="w-4 h-4 text-yellow-400" />
        : <Folder className="w-4 h-4 text-yellow-400" />;
    }

    const ext = node.name.split('.').pop()?.toLowerCase();
    const icons: Record<string, React.ReactNode> = {
      js: <FileCode className="w-4 h-4 text-yellow-400" />,
      jsx: <FileCode className="w-4 h-4 text-yellow-400" />,
      ts: <FileCode className="w-4 h-4 text-blue-400" />,
      tsx: <FileCode className="w-4 h-4 text-blue-400" />,
      json: <FileJson className="w-4 h-4 text-yellow-500" />,
      rs: <Braces className="w-4 h-4 text-orange-400" />,
      py: <Hash className="w-4 h-4 text-green-400" />,
      md: <FileText className="w-4 h-4 text-blue-300" />,
      html: <Code className="w-4 h-4 text-orange-500" />,
      css: <Palette className="w-4 h-4 text-blue-500" />,
    };
    return icons[ext || ''] || <File className="w-4 h-4 text-gray-400" />;
  };

  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[#2a2d2e] group",
            isSelected && 'bg-[#094771]'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              onFolderToggle(node.id);
            } else {
              onFileSelect(node);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node });
          }}
        >
          {node.type === 'folder' && (
            <span className="text-gray-500">
              {node.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
          {node.type === 'file' && <span className="w-4" />}
          {getFileIcon(node)}
          <span className={cn(
            "text-sm truncate flex-1",
            isSelected ? 'text-white' : 'text-gray-300'
          )}>
            {node.name}
          </span>
        </div>

        <AnimatePresence>
          {node.type === 'folder' && node.isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {node.children.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-gray-400 border-b border-[#3c3c3c]">
        <span>Explorer</span>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#3c3c3c] rounded" onClick={() => onNewFile?.('')}>
            <File className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-[#3c3c3c] rounded" onClick={() => onNewFolder?.('')}>
            <Folder className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-[#3c3c3c] rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {tree.map(node => renderNode(node))}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onNewFile?.(contextMenu.node.path);
                  setContextMenu(null);
                }}
              >
                <File className="w-4 h-4" /> New File
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onNewFolder?.(contextMenu.node.path);
                  setContextMenu(null);
                }}
              >
                <Folder className="w-4 h-4" /> New Folder
              </button>
              <div className="border-t border-[#3c3c3c] my-1" />
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-gray-300 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onRename?.(contextMenu.node.id);
                  setContextMenu(null);
                }}
              >
                <Settings className="w-4 h-4" /> Rename
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-red-400 hover:bg-[#094771] flex items-center gap-2"
                onClick={() => {
                  onDelete?.(contextMenu.node.id);
                  setContextMenu(null);
                }}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 4: Minimap Preview Panel
// ============================================================================

interface MinimapProps {
  content: string;
  viewportStart: number;
  viewportEnd: number;
  totalLines: number;
  highlightedLines?: number[];
  onNavigate?: (line: number) => void;
}

export function Minimap({
  content,
  viewportStart,
  viewportEnd,
  totalLines,
  highlightedLines = [],
  onNavigate
}: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const viewportHeight = ((viewportEnd - viewportStart) / totalLines) * 100;
  const viewportTop = (viewportStart / totalLines) * 100;

  const handleClick = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / rect.height;
    const line = Math.floor(percentage * totalLines);
    onNavigate?.(line);
  };

  return (
    <div
      ref={minimapRef}
      className="relative w-24 h-full bg-[#1e1e1e] border-l border-[#3c3c3c] cursor-pointer"
      onClick={handleClick}
    >
      {/* Code Preview */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div
          className="transform scale-[0.1] origin-top-left"
          style={{ width: '1000px' }}
        >
          {content.split('\n').map((line, i) => (
            <div
              key={i}
              className={cn(
                "h-[10px] text-[8px] font-mono whitespace-nowrap overflow-hidden",
                highlightedLines.includes(i) ? 'bg-yellow-500/30' : ''
              )}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Viewport Slider */}
      <div
        className="absolute left-0 right-0 bg-gray-500/20 border border-gray-500/30 cursor-grab active:cursor-grabbing"
        style={{
          top: `${viewportTop}%`,
          height: `${Math.max(viewportHeight, 5)}%`
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      />

      {/* Error/Warning Markers */}
      {highlightedLines.map((line, i) => (
        <div
          key={i}
          className="absolute right-1 w-2 h-1 bg-red-500 rounded"
          style={{ top: `${(line / totalLines) * 100}%` }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 5: Breadcrumb Navigation Bar
// ============================================================================

interface BreadcrumbItem {
  id: string;
  label: string;
  type: 'folder' | 'file' | 'symbol';
  icon?: React.ReactNode;
  children?: BreadcrumbItem[];
}

interface BreadcrumbNavProps {
  path: BreadcrumbItem[];
  symbols?: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
}

export function BreadcrumbNav({ path, symbols, onNavigate }: BreadcrumbNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-1 px-4 py-1 bg-[#252526] border-b border-[#3c3c3c] text-sm overflow-x-auto">
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
          <div className="relative">
            <button
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#3c3c3c] text-gray-300",
                item.children && "pr-1"
              )}
              onClick={() => {
                if (item.children) {
                  setDropdownOpen(dropdownOpen === item.id ? null : item.id);
                } else {
                  onNavigate(item);
                }
              }}
            >
              {item.icon || (
                item.type === 'folder'
                  ? <Folder className="w-4 h-4 text-yellow-400" />
                  : item.type === 'file'
                    ? <File className="w-4 h-4 text-gray-400" />
                    : <Code className="w-4 h-4 text-purple-400" />
              )}
              <span>{item.label}</span>
              {item.children && <ChevronDown className="w-3 h-3 text-gray-500" />}
            </button>

            <AnimatePresence>
              {dropdownOpen === item.id && item.children && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-auto"
                >
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#094771]"
                      onClick={() => {
                        onNavigate(child);
                        setDropdownOpen(null);
                      }}
                    >
                      {child.icon || (
                        child.type === 'folder'
                          ? <Folder className="w-4 h-4 text-yellow-400" />
                          : <File className="w-4 h-4 text-gray-400" />
                      )}
                      <span>{child.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </React.Fragment>
      ))}

      {/* Symbol Navigation */}
      {symbols && symbols.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="relative">
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#3c3c3c] text-gray-300"
              onClick={() => setDropdownOpen(dropdownOpen === 'symbols' ? null : 'symbols')}
            >
              <Code className="w-4 h-4 text-purple-400" />
              <span>{symbols[0].label}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            <AnimatePresence>
              {dropdownOpen === 'symbols' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-auto"
                >
                  {symbols.map(symbol => (
                    <button
                      key={symbol.id}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#094771]"
                      onClick={() => {
                        onNavigate(symbol);
                        setDropdownOpen(null);
                      }}
                    >
                      <Code className="w-4 h-4 text-purple-400" />
                      <span>{symbol.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 6: Command Palette (Ctrl+Shift+P)
// ============================================================================

interface CommandPaletteProps {
  isOpen: boolean;
  commands: CommandItem[];
  recentCommands?: CommandItem[];
  onClose: () => void;
  onExecute: (command: CommandItem) => void;
}

export function CommandPalette({
  isOpen,
  commands,
  recentCommands = [],
  onClose,
  onExecute
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = query
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category?.toLowerCase().includes(query.toLowerCase())
      )
    : recentCommands.length > 0 ? recentCommands : commands;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onExecute(filteredCommands[selectedIndex]);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="w-[600px] bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3c3c3c]">
            <Command className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
            <span className="text-xs text-gray-500 bg-[#3c3c3c] px-2 py-0.5 rounded">ESC</span>
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-auto">
            {query === '' && recentCommands.length > 0 && (
              <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                Recently Used
              </div>
            )}
            {filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-left",
                  index === selectedIndex
                    ? 'bg-[#094771] text-white'
                    : 'text-gray-300 hover:bg-[#2a2d2e]'
                )}
                onClick={() => {
                  onExecute(cmd);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {cmd.icon || <Command className="w-4 h-4 text-gray-400" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{cmd.label}</span>
                    {cmd.category && (
                      <span className="text-xs text-gray-500">{cmd.category}</span>
                    )}
                  </div>
                  {cmd.description && (
                    <div className="text-xs text-gray-500">{cmd.description}</div>
                  )}
                </div>
                {cmd.shortcut && (
                  <span className="text-xs text-gray-500 bg-[#3c3c3c] px-2 py-0.5 rounded">
                    {cmd.shortcut}
                  </span>
                )}
              </button>
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// ENHANCEMENT 7: Search & Replace Panel with Regex Support
// ============================================================================

interface SearchReplacePanelProps {
  isOpen: boolean;
  results: SearchResult[];
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (replacement: string, replaceAll: boolean) => void;
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  includePattern?: string;
  excludePattern?: string;
}

export function SearchReplacePanel({
  isOpen,
  results,
  onSearch,
  onReplace,
  onResultClick,
  onClose
}: SearchReplacePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    regex: false
  });
  const [includePattern, setIncludePattern] = useState('');
  const [excludePattern, setExcludePattern] = useState('');

  useEffect(() => {
    if (searchQuery) {
      onSearch(searchQuery, { ...options, includePattern, excludePattern });
    }
  }, [searchQuery, options, includePattern, excludePattern]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Search</span>
          {results.length > 0 && (
            <span className="text-xs text-gray-500">
              {results.length} results
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 space-y-2">
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-[#3c3c3c] rounded"
            onClick={() => setShowReplace(!showReplace)}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", showReplace && "rotate-90")} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-sm focus:outline-none focus:border-[#007acc]"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                className={cn(
                  "p-1 rounded",
                  options.caseSensitive ? 'bg-[#094771] text-white' : 'hover:bg-[#4c4c4c]'
                )}
                onClick={() => setOptions(o => ({ ...o, caseSensitive: !o.caseSensitive }))}
                title="Match Case"
              >
                <CaseSensitive className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  "p-1 rounded",
                  options.wholeWord ? 'bg-[#094771] text-white' : 'hover:bg-[#4c4c4c]'
                )}
                onClick={() => setOptions(o => ({ ...o, wholeWord: !o.wholeWord }))}
                title="Match Whole Word"
              >
                <WholeWord className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  "p-1 rounded",
                  options.regex ? 'bg-[#094771] text-white' : 'hover:bg-[#4c4c4c]'
                )}
                onClick={() => setOptions(o => ({ ...o, regex: !o.regex }))}
                title="Use Regular Expression"
              >
                <Regex className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Replace Input */}
        <AnimatePresence>
          {showReplace && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <span className="w-6" />
              <input
                type="text"
                placeholder="Replace"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-sm focus:outline-none focus:border-[#007acc]"
              />
              <button
                className="p-1.5 hover:bg-[#3c3c3c] rounded"
                onClick={() => onReplace(replaceQuery, false)}
                title="Replace"
              >
                <Replace className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 hover:bg-[#3c3c3c] rounded"
                onClick={() => onReplace(replaceQuery, true)}
                title="Replace All"
              >
                <span className="text-xs">All</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Filters */}
        <div className="space-y-1 text-xs">
          <input
            type="text"
            placeholder="files to include (e.g. *.ts, src/**)"
            value={includePattern}
            onChange={(e) => setIncludePattern(e.target.value)}
            className="w-full px-3 py-1 bg-[#3c3c3c] border border-[#3c3c3c] rounded focus:outline-none focus:border-[#007acc]"
          />
          <input
            type="text"
            placeholder="files to exclude (e.g. node_modules)"
            value={excludePattern}
            onChange={(e) => setExcludePattern(e.target.value)}
            className="w-full px-3 py-1 bg-[#3c3c3c] border border-[#3c3c3c] rounded focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {results.map((result, index) => (
          <button
            key={index}
            className="w-full flex items-start gap-2 px-4 py-2 text-left hover:bg-[#2a2d2e] border-b border-[#3c3c3c]"
            onClick={() => onResultClick(result)}
          >
            <File className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-300 truncate">{result.file}</div>
              <div className="text-xs text-gray-500">
                Line {result.line}, Column {result.column}
              </div>
              <div className="text-xs font-mono text-gray-400 truncate">
                {result.context.substring(0, result.column - 1)}
                <span className="bg-yellow-500/30 text-yellow-200">{result.match}</span>
                {result.context.substring(result.column - 1 + result.match.length)}
              </div>
            </div>
          </button>
        ))}
        {searchQuery && results.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 8: Problems/Errors Panel with Diagnostics
// ============================================================================

interface ProblemsPanelProps {
  diagnostics: DiagnosticItem[];
  filter?: 'all' | 'errors' | 'warnings' | 'info';
  onDiagnosticClick: (diagnostic: DiagnosticItem) => void;
  onFilterChange: (filter: 'all' | 'errors' | 'warnings' | 'info') => void;
}

export function ProblemsPanel({
  diagnostics,
  filter = 'all',
  onDiagnosticClick,
  onFilterChange
}: ProblemsPanelProps) {
  const counts = {
    errors: diagnostics.filter(d => d.type === 'error').length,
    warnings: diagnostics.filter(d => d.type === 'warning').length,
    info: diagnostics.filter(d => d.type === 'info').length
  };

  const filtered = filter === 'all'
    ? diagnostics
    : diagnostics.filter(d => d.type === filter.slice(0, -1) as DiagnosticItem['type']);

  const getIcon = (type: DiagnosticItem['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'hint':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Header with Filters */}
      <div className="flex items-center gap-4 px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <span className="text-sm font-medium">Problems</span>
        <div className="flex items-center gap-2 text-xs">
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded",
              filter === 'all' ? 'bg-[#094771]' : 'hover:bg-[#3c3c3c]'
            )}
            onClick={() => onFilterChange('all')}
          >
            All ({diagnostics.length})
          </button>
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded",
              filter === 'errors' ? 'bg-[#094771]' : 'hover:bg-[#3c3c3c]'
            )}
            onClick={() => onFilterChange('errors')}
          >
            <AlertCircle className="w-3 h-3 text-red-400" />
            {counts.errors}
          </button>
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded",
              filter === 'warnings' ? 'bg-[#094771]' : 'hover:bg-[#3c3c3c]'
            )}
            onClick={() => onFilterChange('warnings')}
          >
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            {counts.warnings}
          </button>
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded",
              filter === 'info' ? 'bg-[#094771]' : 'hover:bg-[#3c3c3c]'
            )}
            onClick={() => onFilterChange('info')}
          >
            <Info className="w-3 h-3 text-blue-400" />
            {counts.info}
          </button>
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 overflow-auto">
        {filtered.map(diagnostic => (
          <button
            key={diagnostic.id}
            className="w-full flex items-start gap-3 px-4 py-2 text-left hover:bg-[#2a2d2e] border-b border-[#3c3c3c]"
            onClick={() => onDiagnosticClick(diagnostic)}
          >
            {getIcon(diagnostic.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm">{diagnostic.message}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{diagnostic.file}</span>
                <span>({diagnostic.line}:{diagnostic.column})</span>
                {diagnostic.source && <span>[{diagnostic.source}]</span>}
                {diagnostic.code && <span className="text-gray-600">{diagnostic.code}</span>}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            No problems detected
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 9: Output/Console Panel with Logs
// ============================================================================

interface OutputPanelProps {
  outputs: OutputLine[];
  channels?: string[];
  selectedChannel?: string;
  onChannelChange?: (channel: string) => void;
  onClear?: () => void;
}

export function OutputPanel({
  outputs,
  channels = ['Output', 'Debug Console', 'Terminal'],
  selectedChannel = 'Output',
  onChannelChange,
  onClear
}: OutputPanelProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<OutputLine['type'] | 'all'>('all');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs, autoScroll]);

  const filteredOutputs = filter === 'all'
    ? outputs
    : outputs.filter(o => o.type === filter);

  const getTypeStyles = (type: OutputLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          {channels.map(channel => (
            <button
              key={channel}
              className={cn(
                "px-3 py-1 text-sm rounded",
                selectedChannel === channel
                  ? 'bg-[#094771] text-white'
                  : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
              onClick={() => onChannelChange?.(channel)}
            >
              {channel}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-2 py-1 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-xs focus:outline-none"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
            <option value="debug">Debug</option>
          </select>
          <button
            className={cn(
              "p-1.5 rounded",
              autoScroll ? 'bg-[#094771] text-white' : 'hover:bg-[#3c3c3c]'
            )}
            onClick={() => setAutoScroll(!autoScroll)}
            title="Auto-scroll"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 hover:bg-[#3c3c3c] rounded"
            onClick={onClear}
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto font-mono text-sm p-4"
      >
        {filteredOutputs.map(output => (
          <div
            key={output.id}
            className={cn("flex items-start gap-2 py-0.5", getTypeStyles(output.type))}
          >
            <span className="text-gray-600 text-xs flex-shrink-0">
              [{output.timestamp.toLocaleTimeString()}]
            </span>
            {output.source && (
              <span className="text-purple-400 text-xs flex-shrink-0">
                [{output.source}]
              </span>
            )}
            <span className="flex-1 whitespace-pre-wrap break-all">{output.message}</span>
          </div>
        ))}
        {filteredOutputs.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No output
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 10: Terminal Integration Panel
// ============================================================================

interface TerminalPanelProps {
  terminals: TerminalInstance[];
  activeTerminalId?: string;
  onTerminalSelect: (id: string) => void;
  onNewTerminal: () => void;
  onCloseTerminal: (id: string) => void;
  onCommand: (terminalId: string, command: string) => void;
}

interface TerminalInstance {
  id: string;
  name: string;
  type: 'bash' | 'powershell' | 'cmd' | 'zsh';
  history: TerminalLine[];
  cwd: string;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export function TerminalPanel({
  terminals,
  activeTerminalId,
  onTerminalSelect,
  onNewTerminal,
  onCloseTerminal,
  onCommand
}: TerminalPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTerminal?.history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && activeTerminalId) {
      onCommand(activeTerminalId, inputValue);
      setCommandHistory(prev => [...prev, inputValue]);
      setInputValue('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const getShellIcon = (type: TerminalInstance['type']) => {
    switch (type) {
      case 'bash':
      case 'zsh':
        return <TerminalIcon className="w-4 h-4 text-green-400" />;
      case 'powershell':
        return <TerminalIcon className="w-4 h-4 text-blue-400" />;
      case 'cmd':
        return <TerminalIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Terminal Tabs */}
      <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center flex-1 overflow-x-auto">
          {terminals.map(terminal => (
            <button
              key={terminal.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-r border-[#3c3c3c] min-w-[120px] group",
                terminal.id === activeTerminalId
                  ? 'bg-[#1e1e1e] text-white'
                  : 'text-gray-400 hover:bg-[#2a2d2e]'
              )}
              onClick={() => onTerminalSelect(terminal.id)}
            >
              {getShellIcon(terminal.type)}
              <span className="truncate text-sm">{terminal.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTerminal(terminal.id);
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 px-2">
          <button
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
            onClick={onNewTerminal}
            title="New Terminal"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400" title="Split Terminal">
            <Split className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400" title="Maximize">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {activeTerminal && (
        <>
          <div
            ref={terminalRef}
            className="flex-1 overflow-auto font-mono text-sm p-4 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {activeTerminal.history.map(line => (
              <div
                key={line.id}
                className={cn(
                  "py-0.5",
                  line.type === 'input' && 'text-green-400',
                  line.type === 'output' && 'text-gray-300',
                  line.type === 'error' && 'text-red-400'
                )}
              >
                {line.type === 'input' && (
                  <span className="text-blue-400">{activeTerminal.cwd} $ </span>
                )}
                <span className="whitespace-pre-wrap">{line.content}</span>
              </div>
            ))}
          </div>

          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center px-4 py-2 bg-[#1e1e1e] border-t border-[#3c3c3c]">
            <span className="text-blue-400 font-mono text-sm mr-2">
              {activeTerminal.cwd} $
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-green-400 font-mono text-sm focus:outline-none"
              autoFocus
            />
          </form>
        </>
      )}
    </div>
  );
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleFileTree: FileTreeNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    isExpanded: true,
    children: [
      {
        id: '2',
        name: 'functions',
        type: 'folder',
        path: '/src/functions',
        isExpanded: true,
        children: [
          { id: '3', name: 'auth.ts', type: 'file', path: '/src/functions/auth.ts', language: 'typescript' },
          { id: '4', name: 'api.ts', type: 'file', path: '/src/functions/api.ts', language: 'typescript' },
          { id: '5', name: 'database.ts', type: 'file', path: '/src/functions/database.ts', language: 'typescript' },
        ]
      },
      {
        id: '6',
        name: 'utils',
        type: 'folder',
        path: '/src/utils',
        children: [
          { id: '7', name: 'helpers.ts', type: 'file', path: '/src/utils/helpers.ts', language: 'typescript' },
        ]
      },
      { id: '8', name: 'index.ts', type: 'file', path: '/src/index.ts', language: 'typescript' },
    ]
  },
  { id: '9', name: 'package.json', type: 'file', path: '/package.json', language: 'json' },
  { id: '10', name: 'README.md', type: 'file', path: '/README.md', language: 'markdown' },
];

export const sampleEditorFile: EditorFile = {
  id: '1',
  name: 'auth.ts',
  path: '/src/functions/auth.ts',
  language: 'typescript',
  isDirty: false,
  content: `import { User, Session } from './types';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function login(email: string, password: string): Promise<Session> {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

  return {
    user,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
}

export async function register(email: string, password: string): Promise<User> {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new Error('User already exists');
  }

  const passwordHash = await hash(password, 10);

  return createUser({
    email,
    passwordHash,
    createdAt: new Date()
  });
}

export function validateToken(token: string): { userId: string } {
  return verify(token, JWT_SECRET) as { userId: string };
}
`
};

export const sampleDiagnostics: DiagnosticItem[] = [
  {
    id: '1',
    type: 'error',
    message: "Cannot find name 'findUserByEmail'.",
    file: 'src/functions/auth.ts',
    line: 8,
    column: 16,
    source: 'ts',
    code: '2304'
  },
  {
    id: '2',
    type: 'warning',
    message: "'JWT_SECRET' is declared but its value is never read.",
    file: 'src/functions/auth.ts',
    line: 5,
    column: 7,
    source: 'ts',
    code: '6133'
  },
  {
    id: '3',
    type: 'info',
    message: "This async function does not need 'await'.",
    file: 'src/functions/api.ts',
    line: 42,
    column: 3,
    source: 'eslint'
  }
];

export const sampleOutputs: OutputLine[] = [
  { id: '1', timestamp: new Date(), type: 'info', message: 'Starting development server...', source: 'webpack' },
  { id: '2', timestamp: new Date(), type: 'success', message: 'Compiled successfully in 1.2s', source: 'webpack' },
  { id: '3', timestamp: new Date(), type: 'info', message: 'Listening on http://localhost:3000', source: 'server' },
  { id: '4', timestamp: new Date(), type: 'warn', message: 'Deprecation warning: Buffer() is deprecated', source: 'node' },
  { id: '5', timestamp: new Date(), type: 'error', message: 'Failed to connect to database', source: 'database' },
  { id: '6', timestamp: new Date(), type: 'debug', message: 'Processing request: GET /api/users', source: 'router' },
];

export const sampleCommands: CommandItem[] = [
  { id: '1', label: 'Go to File', shortcut: 'Ctrl+P', category: 'Navigation', icon: <File className="w-4 h-4" />, action: () => {} },
  { id: '2', label: 'Go to Symbol', shortcut: 'Ctrl+Shift+O', category: 'Navigation', icon: <Code className="w-4 h-4" />, action: () => {} },
  { id: '3', label: 'Run Task', shortcut: 'Ctrl+Shift+B', category: 'Tasks', icon: <Play className="w-4 h-4" />, action: () => {} },
  { id: '4', label: 'Git: Commit', category: 'Git', icon: <GitBranch className="w-4 h-4" />, action: () => {} },
  { id: '5', label: 'Format Document', shortcut: 'Shift+Alt+F', category: 'Editor', icon: <Indent className="w-4 h-4" />, action: () => {} },
  { id: '6', label: 'Toggle Word Wrap', category: 'View', icon: <WrapText className="w-4 h-4" />, action: () => {} },
  { id: '7', label: 'Change Theme', category: 'Preferences', icon: <Palette className="w-4 h-4" />, action: () => {} },
  { id: '8', label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', category: 'Preferences', icon: <Keyboard className="w-4 h-4" />, action: () => {} },
];

export const sampleTerminals: TerminalInstance[] = [
  {
    id: '1',
    name: 'bash',
    type: 'bash',
    cwd: '~/projects/rustpress',
    history: [
      { id: '1', type: 'input', content: 'npm install', timestamp: new Date() },
      { id: '2', type: 'output', content: 'added 1234 packages in 12s', timestamp: new Date() },
      { id: '3', type: 'input', content: 'npm run dev', timestamp: new Date() },
      { id: '4', type: 'output', content: '> rustpress@1.0.0 dev\n> vite\n\nVITE v4.4.9 ready in 342 ms\n\n➜  Local:   http://localhost:5173/', timestamp: new Date() },
    ]
  },
  {
    id: '2',
    name: 'cargo',
    type: 'bash',
    cwd: '~/projects/rustpress',
    history: [
      { id: '1', type: 'input', content: 'cargo build --release', timestamp: new Date() },
      { id: '2', type: 'output', content: '   Compiling rustpress v0.1.0\n    Finished release [optimized] target(s) in 32.45s', timestamp: new Date() },
    ]
  }
];
