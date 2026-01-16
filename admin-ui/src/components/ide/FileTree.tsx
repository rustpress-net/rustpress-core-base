/**
 * FileTree - VS Code-like file explorer
 * Browses the RustPress project root
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  FileJson, FileCode, FileText, Image, Settings, Database,
  Package, Cog, Terminal, FileType,
  // Parent-specific folder icons
  Palette, PaletteIcon, Brush, // Themes
  Zap, Code2, FunctionSquare, // Functions
  Puzzle, Box, Component, // Plugins
  AppWindow, Layout, LayoutGrid, // Apps
  ImageIcon, FileImage, Film // Assets
} from 'lucide-react';
import { listDirectory, type FileNode } from '../../services/fileSystemService';
import type { OpenFile } from './IDE';

// ============================================
// TYPES
// ============================================

interface FileTreeProps {
  onFileSelect: (path: string, name: string) => void;
  activeFilePath: string | null;
  openFiles: OpenFile[];
  searchQuery: string;
  /** Root path to browse (e.g., 'themes', 'functions', '' for project root) */
  rootPath?: string;
  /** Display label for the root folder */
  rootLabel?: string;
}

// ============================================
// HELPERS
// ============================================

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = "w-4 h-4";

  // Special files
  if (name === 'Cargo.toml' || name === 'package.json') {
    return <Package className={`${iconClass} text-orange-400`} />;
  }
  if (name === 'Cargo.lock' || name === 'package-lock.json') {
    return <FileText className={`${iconClass} text-gray-500`} />;
  }
  if (name.startsWith('.env')) {
    return <Cog className={`${iconClass} text-yellow-500`} />;
  }
  if (name === 'docker-compose.yml' || name === 'Dockerfile') {
    return <Terminal className={`${iconClass} text-blue-400`} />;
  }
  if (name.endsWith('.sql')) {
    return <Database className={`${iconClass} text-blue-500`} />;
  }

  switch (ext) {
    case 'json':
      return <FileJson className={`${iconClass} text-yellow-400`} />;
    case 'html':
    case 'htm':
      return <FileCode className={`${iconClass} text-orange-400`} />;
    case 'css':
    case 'scss':
      return <FileCode className={`${iconClass} text-blue-400`} />;
    case 'js':
    case 'jsx':
      return <FileCode className={`${iconClass} text-yellow-300`} />;
    case 'ts':
    case 'tsx':
      return <FileCode className={`${iconClass} text-blue-300`} />;
    case 'rs':
      return <FileCode className={`${iconClass} text-orange-500`} />;
    case 'toml':
      return <Settings className={`${iconClass} text-gray-400`} />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'gif':
      return <Image className={`${iconClass} text-purple-400`} />;
    case 'md':
      return <FileText className={`${iconClass} text-gray-400`} />;
    case 'yml':
    case 'yaml':
      return <FileType className={`${iconClass} text-red-400`} />;
    default:
      return <File className={`${iconClass} text-gray-400`} />;
  }
}

/**
 * Get folder icon based on the root/parent folder type
 * Subfolders of themes get theme icons, plugins get plugin icons, etc.
 */
function getFolderIcon(folderPath: string, isExpanded: boolean): React.ReactNode {
  const iconClass = "w-4 h-4";
  const parts = folderPath.split('/');
  const rootFolder = parts[0]?.toLowerCase();

  // For root folders (first level), use specific icons
  if (parts.length === 1) {
    switch (rootFolder) {
      case 'themes':
        return isExpanded
          ? <Palette className={`${iconClass} text-purple-400`} />
          : <Palette className={`${iconClass} text-purple-500`} />;
      case 'functions':
        return isExpanded
          ? <Zap className={`${iconClass} text-yellow-400`} />
          : <Zap className={`${iconClass} text-yellow-500`} />;
      case 'plugins':
        return isExpanded
          ? <Puzzle className={`${iconClass} text-blue-400`} />
          : <Puzzle className={`${iconClass} text-blue-500`} />;
      case 'apps':
        return isExpanded
          ? <AppWindow className={`${iconClass} text-green-400`} />
          : <AppWindow className={`${iconClass} text-green-500`} />;
      case 'assets':
        return isExpanded
          ? <ImageIcon className={`${iconClass} text-pink-400`} />
          : <ImageIcon className={`${iconClass} text-pink-500`} />;
      default:
        return isExpanded
          ? <FolderOpen className={`${iconClass} text-yellow-500`} />
          : <Folder className={`${iconClass} text-yellow-500`} />;
    }
  }

  // For subfolders, use themed icons based on root folder
  switch (rootFolder) {
    case 'themes':
      // Theme project folders get brush/palette icons
      if (parts.length === 2) {
        // Direct theme project folder (e.g., themes/starter)
        return isExpanded
          ? <Brush className={`${iconClass} text-purple-400`} />
          : <Brush className={`${iconClass} text-purple-500`} />;
      }
      // Deeper folders get palette accent
      return isExpanded
        ? <FolderOpen className={`${iconClass} text-purple-400`} />
        : <Folder className={`${iconClass} text-purple-400`} />;

    case 'functions':
      // Function project folders get code/function icons
      if (parts.length === 2) {
        return isExpanded
          ? <Code2 className={`${iconClass} text-yellow-400`} />
          : <Code2 className={`${iconClass} text-yellow-500`} />;
      }
      return isExpanded
        ? <FolderOpen className={`${iconClass} text-yellow-400`} />
        : <Folder className={`${iconClass} text-yellow-400`} />;

    case 'plugins':
      // Plugin project folders get component/box icons
      if (parts.length === 2) {
        return isExpanded
          ? <Box className={`${iconClass} text-blue-400`} />
          : <Box className={`${iconClass} text-blue-500`} />;
      }
      return isExpanded
        ? <FolderOpen className={`${iconClass} text-blue-400`} />
        : <Folder className={`${iconClass} text-blue-400`} />;

    case 'apps':
      // App project folders get layout icons
      if (parts.length === 2) {
        return isExpanded
          ? <Layout className={`${iconClass} text-green-400`} />
          : <Layout className={`${iconClass} text-green-500`} />;
      }
      return isExpanded
        ? <FolderOpen className={`${iconClass} text-green-400`} />
        : <Folder className={`${iconClass} text-green-400`} />;

    case 'assets':
      // Assets folders get file/media icons
      if (parts.length === 2) {
        return isExpanded
          ? <Film className={`${iconClass} text-pink-400`} />
          : <Film className={`${iconClass} text-pink-500`} />;
      }
      return isExpanded
        ? <FolderOpen className={`${iconClass} text-pink-400`} />
        : <Folder className={`${iconClass} text-pink-400`} />;

    default:
      return isExpanded
        ? <FolderOpen className={`${iconClass} text-yellow-500`} />
        : <Folder className={`${iconClass} text-yellow-500`} />;
  }
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  if (!query) return nodes;

  const lowerQuery = query.toLowerCase();

  return nodes.reduce<FileNode[]>((acc, node) => {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(lowerQuery)) {
        acc.push(node);
      }
    } else if (node.children) {
      const filteredChildren = filterTree(node.children, query);
      if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
    }
    return acc;
  }, []);
}

// ============================================
// TREE NODE COMPONENT
// ============================================

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  onFileSelect: (path: string, name: string) => void;
  activeFilePath: string | null;
  openFiles: OpenFile[];
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  onFileSelect,
  activeFilePath,
  openFiles,
  expandedFolders,
  toggleFolder
}) => {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.id);
  const isActive = node.path === activeFilePath;
  const isOpen = openFiles.some(f => f.path === node.path);
  const isModified = openFiles.find(f => f.path === node.path)?.isModified;

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(node.id);
    } else {
      onFileSelect(node.path, node.name);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-left text-sm hover:bg-gray-700/50 transition-colors ${
          isActive ? 'bg-blue-600/30 text-blue-300' : isOpen ? 'text-white' : 'text-gray-400'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/Collapse for folders */}
        {isFolder ? (
          isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )
        ) : (
          <span className="w-3.5" />
        )}

        {/* Icon - uses parent-aware icons for folders */}
        {isFolder ? (
          getFolderIcon(node.path, isExpanded)
        ) : (
          getFileIcon(node.name)
        )}

        {/* Name */}
        <span className="flex-1 truncate">{node.name}</span>

        {/* Modified indicator */}
        {isModified && (
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
        )}
      </button>

      {/* Children */}
      {isFolder && isExpanded && node.children && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                onFileSelect={onFileSelect}
                activeFilePath={activeFilePath}
                openFiles={openFiles}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const FileTree: React.FC<FileTreeProps> = ({
  onFileSelect,
  activeFilePath,
  openFiles,
  searchQuery,
  rootPath = '',
  rootLabel = 'RustPress'
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['crates', 'themes', 'config', 'admin-ui', 'admin-ui/src', 'src'])
  );

  // Load file tree on mount or when rootPath changes
  useEffect(() => {
    async function loadFileTree() {
      setLoading(true);
      try {
        const tree = await listDirectory(rootPath);
        setFileTree(tree);
      } catch (error) {
        console.error('Error loading file tree:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFileTree();
  }, [rootPath]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredTree = useMemo(() => filterTree(fileTree, searchQuery), [fileTree, searchQuery]);

  if (loading) {
    return (
      <div className="py-4 px-3 text-sm text-gray-500 text-center">
        Loading files...
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {rootLabel}
      </div>
      {filteredTree.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          onFileSelect={onFileSelect}
          activeFilePath={activeFilePath}
          openFiles={openFiles}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
        />
      ))}
      {filteredTree.length === 0 && searchQuery && (
        <div className="px-3 py-4 text-sm text-gray-500 text-center">
          No files match "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default FileTree;
