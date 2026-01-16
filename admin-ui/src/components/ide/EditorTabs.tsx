/**
 * EditorTabs - Multi-tab file management like VS Code
 * Features: Pin tabs, drag-and-drop reorder, middle-click close, branch labels, detachable tabs
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Pin, GitBranch, ExternalLink, Copy, Scissors, XCircle, PinOff, SplitSquareHorizontal } from 'lucide-react';
import type { OpenFile } from './IDE';

// ============================================
// TYPES
// ============================================

interface TabContextMenu {
  x: number;
  y: number;
  file: OpenFile;
}

interface EditorTabsProps {
  files: OpenFile[];
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onCloseFile: (path: string) => void;
  onPinFile?: (path: string) => void;
  onReorderFiles?: (files: OpenFile[]) => void;
  folderBranches?: Record<string, string>;
  showBranchLabels?: boolean;
  onBranchClick?: (projectPath: string, event: React.MouseEvent) => void;
  onDetachTab?: (file: OpenFile) => void;
  onCloseOthers?: (path: string) => void;
  onCloseAll?: () => void;
  onCloseSaved?: () => void;
  onCopyPath?: (path: string) => void;
  onSplitRight?: (file: OpenFile) => void;
}

// ============================================
// HELPERS
// ============================================

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json': return 'text-yellow-400';
    case 'html': case 'htm': return 'text-orange-400';
    case 'css': case 'scss': return 'text-blue-400';
    case 'js': case 'ts': return 'text-yellow-300';
    default: return 'text-gray-400';
  }
}

// Extract project path from file path (e.g., "themes/starter" from "themes/starter/src/index.ts")
function getProjectPath(path: string): string {
  const parts = path.split('/');
  // Return first two parts as project path (e.g., "themes/my-theme")
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0] || 'root';
}

// Extract folder name from file path (for backward compatibility)
function getFolderFromPath(path: string): string {
  const parts = path.split('/');
  if (parts.length > 0) {
    const folder = parts[0].toLowerCase();
    if (['themes', 'functions', 'plugins', 'apps', 'assets'].includes(folder)) {
      return folder;
    }
  }
  return 'root';
}

// Get branch color based on name
function getBranchColor(branch: string): string {
  const prodBranches = ['main', 'master', 'release', 'production', 'prod'];
  const devBranches = ['dev', 'develop', 'development', 'test', 'testing', 'stage', 'staging'];

  const branchLower = branch.toLowerCase();
  if (prodBranches.some(b => branchLower === b || branchLower.startsWith(b + '/'))) {
    return 'text-red-400 bg-red-500/20';
  }
  if (devBranches.some(b => branchLower === b || branchLower.startsWith(b + '/') || branchLower.startsWith(b + '-'))) {
    return 'text-green-400 bg-green-500/20';
  }
  return 'text-blue-400 bg-blue-500/20';
}

// ============================================
// MAIN COMPONENT
// ============================================

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCloseFile,
  onPinFile,
  onReorderFiles,
  folderBranches = {},
  showBranchLabels = true,
  onBranchClick,
  onDetachTab,
  onCloseOthers,
  onCloseAll,
  onCloseSaved,
  onCopyPath,
  onSplitRight
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<TabContextMenu | null>(null);
  const [isDraggingOutside, setIsDraggingOutside] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  // Check for overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
      }
    };

    checkOverflow();
    const container = containerRef.current;
    container?.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);

    return () => {
      container?.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [files]);

  // Scroll to active tab
  useEffect(() => {
    if (activeFilePath && containerRef.current) {
      const activeTab = containerRef.current.querySelector(`[data-path="${activeFilePath}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeFilePath]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 200;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMiddleClick = (e: React.MouseEvent, path: string) => {
    if (e.button === 1) {
      e.preventDefault();
      onCloseFile(path);
    }
  };

  const handleDragStart = (e: React.DragEvent, path: string) => {
    setDraggedTab(path);
    setIsDraggingOutside(false);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', path);

    // Add custom drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = files.find(f => f.path === path)?.name || 'File';
    dragImage.style.cssText = 'padding: 8px 12px; background: #374151; color: white; border-radius: 4px; font-size: 12px; position: absolute; left: -1000px;';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent, path: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== path) {
      setDragOverTab(path);
    }
  };

  const handleDragLeave = () => {
    setDragOverTab(null);
  };

  const handleDrop = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    if (!draggedTab || draggedTab === targetPath || !onReorderFiles) {
      setDraggedTab(null);
      setDragOverTab(null);
      return;
    }

    const draggedFile = files.find(f => f.path === draggedTab);
    const targetFile = files.find(f => f.path === targetPath);

    if (!draggedFile || !targetFile) {
      setDraggedTab(null);
      setDragOverTab(null);
      return;
    }

    // Don't allow moving unpinned tabs before pinned tabs
    if (targetFile.isPinned && !draggedFile.isPinned) {
      setDraggedTab(null);
      setDragOverTab(null);
      return;
    }

    const newFiles = [...files];
    const draggedIndex = newFiles.findIndex(f => f.path === draggedTab);
    const targetIndex = newFiles.findIndex(f => f.path === targetPath);

    newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, draggedFile);

    onReorderFiles(newFiles);
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Check if dropped outside the container - detach the tab
    if (draggedTab && onDetachTab && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const dropX = e.clientX;
      const dropY = e.clientY;

      // Check if drop position is outside the tab bar (with some margin)
      const isOutsideVertically = dropY < containerRect.top - 50 || dropY > containerRect.bottom + 50;
      const isOutsideHorizontally = dropX < containerRect.left - 100 || dropX > containerRect.right + 100;

      if (isOutsideVertically || isOutsideHorizontally) {
        const fileToDetach = files.find(f => f.path === draggedTab);
        if (fileToDetach) {
          onDetachTab(fileToDetach);
        }
      }
    }

    setDraggedTab(null);
    setDragOverTab(null);
    setIsDraggingOutside(false);
    dragStartPos.current = null;
  };

  // Track drag position for detach visual feedback
  useEffect(() => {
    if (!draggedTab) return;

    const handleGlobalDrag = (e: DragEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const isOutsideVertically = e.clientY < containerRect.top - 30 || e.clientY > containerRect.bottom + 30;
      const isOutsideHorizontally = e.clientX < containerRect.left - 50 || e.clientX > containerRect.right + 50;
      setIsDraggingOutside(isOutsideVertically || isOutsideHorizontally);
    };

    document.addEventListener('drag', handleGlobalDrag);
    return () => document.removeEventListener('drag', handleGlobalDrag);
  }, [draggedTab]);

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent, file: OpenFile) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate position, ensuring menu stays in viewport
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 300);

    setContextMenu({ x, y, file });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', closeContextMenu, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', closeContextMenu, true);
    };
  }, [contextMenu, closeContextMenu]);

  // Context menu action handlers
  const handleDetach = useCallback(() => {
    if (contextMenu?.file && onDetachTab) {
      onDetachTab(contextMenu.file);
    }
    closeContextMenu();
  }, [contextMenu, onDetachTab, closeContextMenu]);

  const handleCloseOthers = useCallback(() => {
    if (contextMenu?.file && onCloseOthers) {
      onCloseOthers(contextMenu.file.path);
    }
    closeContextMenu();
  }, [contextMenu, onCloseOthers, closeContextMenu]);

  const handleCloseAll = useCallback(() => {
    if (onCloseAll) {
      onCloseAll();
    }
    closeContextMenu();
  }, [onCloseAll, closeContextMenu]);

  const handleCloseSaved = useCallback(() => {
    if (onCloseSaved) {
      onCloseSaved();
    }
    closeContextMenu();
  }, [onCloseSaved, closeContextMenu]);

  const handleCopyPath = useCallback(() => {
    if (contextMenu?.file) {
      if (onCopyPath) {
        onCopyPath(contextMenu.file.path);
      } else {
        navigator.clipboard.writeText(contextMenu.file.path);
      }
    }
    closeContextMenu();
  }, [contextMenu, onCopyPath, closeContextMenu]);

  const handleSplitRight = useCallback(() => {
    if (contextMenu?.file && onSplitRight) {
      onSplitRight(contextMenu.file);
    }
    closeContextMenu();
  }, [contextMenu, onSplitRight, closeContextMenu]);

  const handlePin = useCallback(() => {
    if (contextMenu?.file && onPinFile) {
      onPinFile(contextMenu.file.path);
    }
    closeContextMenu();
  }, [contextMenu, onPinFile, closeContextMenu]);

  const handleClose = useCallback(() => {
    if (contextMenu?.file) {
      onCloseFile(contextMenu.file.path);
    }
    closeContextMenu();
  }, [contextMenu, onCloseFile, closeContextMenu]);

  if (files.length === 0) {
    return (
      <div className="h-9 bg-gray-800 border-b border-gray-700" />
    );
  }

  return (
    <div className="h-9 bg-gray-800 border-b border-gray-700 flex items-center relative">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full px-1 bg-gray-800 hover:bg-gray-700 border-r border-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {files.map(file => {
          const isActive = file.path === activeFilePath;
          const iconColor = getFileIcon(file.name);
          const isDragging = file.path === draggedTab;
          const isDragOver = file.path === dragOverTab;

          // Get branch for this file's project (e.g., "themes/starter")
          const projectPath = getProjectPath(file.path);
          const fileBranch = folderBranches[projectPath] || 'main';
          const branchColor = getBranchColor(fileBranch);

          return (
            <div
              key={file.path}
              data-path={file.path}
              draggable
              onDragStart={(e) => handleDragStart(e, file.path)}
              onDragOver={(e) => handleDragOver(e, file.path)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, file.path)}
              onDragEnd={handleDragEnd}
              onMouseDown={(e) => handleMiddleClick(e, file.path)}
              onClick={() => onSelectFile(file.path)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className={`group flex items-center gap-2 px-3 h-9 text-xs font-medium cursor-pointer border-r border-gray-700 min-w-0 transition-all ${
                isActive
                  ? 'bg-gray-900 text-white border-t-2 border-t-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              } ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'border-l-2 border-l-blue-400' : ''}`}
              style={{ backgroundColor: isActive ? '#1e1e2e' : undefined }}
            >
              {/* Pin indicator */}
              {file.isPinned && (
                <Pin className="w-3 h-3 text-blue-400 flex-shrink-0 rotate-45" />
              )}

              {/* Modified indicator or file icon dot */}
              {!file.isPinned && (
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  file.isModified ? 'bg-yellow-500' : iconColor.replace('text-', 'bg-')
                }`} />
              )}

              {/* File name */}
              <span className="truncate max-w-32">{file.name}</span>

              {/* Branch label - clickable to open branch menu */}
              {showBranchLabels && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onBranchClick) {
                      onBranchClick(projectPath, e);
                    }
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded flex items-center gap-1 flex-shrink-0 ${branchColor} hover:ring-1 hover:ring-current transition-all cursor-pointer`}
                  title={`Branch: ${fileBranch} - Click to switch branch`}
                >
                  <GitBranch className="w-2.5 h-2.5" />
                  <span className="max-w-12 truncate">{fileBranch}</span>
                </button>
              )}

              {/* Pin button (on hover) */}
              {onPinFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinFile(file.path);
                  }}
                  className={`p-0.5 rounded hover:bg-gray-600 transition-colors ${
                    file.isPinned ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title={file.isPinned ? 'Unpin tab' : 'Pin tab'}
                >
                  <Pin className="w-3 h-3" />
                </button>
              )}

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseFile(file.path);
                }}
                className={`p-0.5 rounded hover:bg-gray-600 transition-colors ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full px-1 bg-gray-800 hover:bg-gray-700 border-l border-gray-700"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 z-[100] min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {/* File name header */}
          <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-700 truncate">
            {contextMenu.file.name}
          </div>

          {/* Detach tab */}
          {onDetachTab && (
            <button
              onClick={handleDetach}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
            >
              <ExternalLink className="w-4 h-4" />
              Detach Tab
            </button>
          )}

          {/* Split right */}
          {onSplitRight && (
            <button
              onClick={handleSplitRight}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              Split Right
            </button>
          )}

          <div className="h-px bg-gray-700 my-1" />

          {/* Pin/Unpin */}
          {onPinFile && (
            <button
              onClick={handlePin}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
            >
              {contextMenu.file.isPinned ? (
                <>
                  <PinOff className="w-4 h-4" />
                  Unpin Tab
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4" />
                  Pin Tab
                </>
              )}
            </button>
          )}

          {/* Copy path */}
          <button
            onClick={handleCopyPath}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
          >
            <Copy className="w-4 h-4" />
            Copy Path
          </button>

          <div className="h-px bg-gray-700 my-1" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
          >
            <X className="w-4 h-4" />
            Close
          </button>

          {/* Close others */}
          {onCloseOthers && files.length > 1 && (
            <button
              onClick={handleCloseOthers}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
            >
              <Scissors className="w-4 h-4" />
              Close Others
            </button>
          )}

          {/* Close saved */}
          {onCloseSaved && files.some(f => !f.isModified && f.path !== contextMenu.file.path) && (
            <button
              onClick={handleCloseSaved}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
            >
              <XCircle className="w-4 h-4" />
              Close Saved
            </button>
          )}

          {/* Close all */}
          {onCloseAll && (
            <button
              onClick={handleCloseAll}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 text-left"
            >
              <XCircle className="w-4 h-4" />
              Close All
            </button>
          )}
        </div>
      )}

      {/* Detach indicator - shown when dragging outside the tab bar */}
      {isDraggingOutside && draggedTab && onDetachTab && (
        <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-pulse">
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium">Release to open in new window</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorTabs;
