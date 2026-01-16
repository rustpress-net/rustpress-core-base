/**
 * EditorGroups - Multi-panel code editor with split view support
 * Allows users to work on multiple files side by side
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Columns, Rows, Plus, MoreVertical, ChevronDown, Maximize2, Minimize2, SplitSquareHorizontal, SplitSquareVertical, Grid2X2 } from 'lucide-react';
import { MonacoWrapper } from './MonacoWrapper';
import { ImagePreview } from './ImagePreview';
import type { OpenFile } from './IDE';

export interface EditorGroup {
  id: string;
  files: OpenFile[];
  activeFilePath: string | null;
}

interface EditorGroupsProps {
  groups: EditorGroup[];
  activeGroupId: string;
  onGroupChange: (groups: EditorGroup[]) => void;
  onActiveGroupChange: (groupId: string) => void;
  onFileChange: (groupId: string, path: string, content: string) => void;
  onCursorChange: (groupId: string, path: string, line: number, column: number) => void;
  onCloseFile: (groupId: string, path: string) => void;
  onSelectFile: (groupId: string, path: string) => void;
  onMoveFile?: (fromGroupId: string, toGroupId: string, path: string) => void;
  readOnly?: boolean;
  editorOptions?: Record<string, unknown>;
  renderWelcome?: () => React.ReactNode;
}

type SplitLayout = 'single' | 'vertical-2' | 'horizontal-2' | 'grid-4';

export const EditorGroups: React.FC<EditorGroupsProps> = ({
  groups,
  activeGroupId,
  onGroupChange,
  onActiveGroupChange,
  onFileChange,
  onCursorChange,
  onCloseFile,
  onSelectFile,
  onMoveFile,
  readOnly = false,
  editorOptions,
  renderWelcome
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SplitLayout>('single');
  const [splitRatio, setSplitRatio] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState<'x' | 'y' | null>(null);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [maximizedGroup, setMaximizedGroup] = useState<string | null>(null);
  const [draggedFile, setDraggedFile] = useState<{ groupId: string; path: string } | null>(null);

  // Handle dragging for split resize
  const handleMouseDown = useCallback((direction: 'x' | 'y') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(direction);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging === 'x') {
      const ratio = (e.clientX - rect.left) / rect.width;
      setSplitRatio(prev => ({ ...prev, x: Math.max(0.2, Math.min(0.8, ratio)) }));
    } else {
      const ratio = (e.clientY - rect.top) / rect.height;
      setSplitRatio(prev => ({ ...prev, y: Math.max(0.2, Math.min(0.8, ratio)) }));
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add new group when splitting
  const addGroup = useCallback(() => {
    const newGroup: EditorGroup = {
      id: `group-${Date.now()}`,
      files: [],
      activeFilePath: null
    };
    onGroupChange([...groups, newGroup]);
    return newGroup.id;
  }, [groups, onGroupChange]);

  // Remove a group
  const removeGroup = useCallback((groupId: string) => {
    if (groups.length <= 1) return;

    const groupToRemove = groups.find(g => g.id === groupId);
    const newGroups = groups.filter(g => g.id !== groupId);

    // Move files to another group if needed
    if (groupToRemove && groupToRemove.files.length > 0) {
      const targetGroup = newGroups[0];
      targetGroup.files = [...targetGroup.files, ...groupToRemove.files];
      if (!targetGroup.activeFilePath && groupToRemove.activeFilePath) {
        targetGroup.activeFilePath = groupToRemove.activeFilePath;
      }
    }

    onGroupChange(newGroups);

    // Update layout if needed
    if (newGroups.length === 1) {
      setLayout('single');
    } else if (newGroups.length === 2 && layout === 'grid-4') {
      setLayout('vertical-2');
    }

    // Update active group if current was removed
    if (activeGroupId === groupId) {
      onActiveGroupChange(newGroups[0].id);
    }
  }, [groups, layout, activeGroupId, onGroupChange, onActiveGroupChange]);

  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: SplitLayout) => {
    setLayout(newLayout);
    setShowLayoutMenu(false);

    // Ensure we have enough groups for the layout
    const requiredGroups = newLayout === 'grid-4' ? 4 : newLayout === 'single' ? 1 : 2;
    let newGroups = [...groups];

    while (newGroups.length < requiredGroups) {
      newGroups.push({
        id: `group-${Date.now()}-${newGroups.length}`,
        files: [],
        activeFilePath: null
      });
    }

    if (newGroups.length !== groups.length) {
      onGroupChange(newGroups);
    }
  }, [groups, onGroupChange]);

  // Split current group
  const splitGroup = useCallback((direction: 'horizontal' | 'vertical') => {
    const currentGroup = groups.find(g => g.id === activeGroupId);
    if (!currentGroup || groups.length >= 4) return;

    const newGroupId = addGroup();

    // If current group has more than one file, move half to new group
    if (currentGroup.files.length > 1) {
      const halfIndex = Math.ceil(currentGroup.files.length / 2);
      const filesToMove = currentGroup.files.slice(halfIndex);
      const remainingFiles = currentGroup.files.slice(0, halfIndex);

      onGroupChange(groups.map(g => {
        if (g.id === currentGroup.id) {
          return { ...g, files: remainingFiles, activeFilePath: remainingFiles[0]?.path || null };
        }
        if (g.id === newGroupId) {
          return { ...g, files: filesToMove, activeFilePath: filesToMove[0]?.path || null };
        }
        return g;
      }).concat([{
        id: newGroupId,
        files: filesToMove,
        activeFilePath: filesToMove[0]?.path || null
      }]));
    }

    setLayout(direction === 'vertical' ? 'vertical-2' : 'horizontal-2');
  }, [groups, activeGroupId, addGroup, onGroupChange]);

  // Handle file drag start
  const handleDragStart = useCallback((groupId: string, path: string) => {
    setDraggedFile({ groupId, path });
  }, []);

  // Handle file drop on a group
  const handleDrop = useCallback((targetGroupId: string) => {
    if (!draggedFile || draggedFile.groupId === targetGroupId) {
      setDraggedFile(null);
      return;
    }

    onMoveFile?.(draggedFile.groupId, targetGroupId, draggedFile.path);
    setDraggedFile(null);
  }, [draggedFile, onMoveFile]);

  // Check if file is an image
  const isImageFile = (path: string): boolean => {
    const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
    return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp'].includes(ext);
  };

  // Render a single editor group
  const renderGroup = (group: EditorGroup, index: number) => {
    const isActive = group.id === activeGroupId;
    const isMaximized = maximizedGroup === group.id;
    const activeFile = group.files.find(f => f.path === group.activeFilePath);

    if (maximizedGroup && !isMaximized) return null;

    return (
      <div
        key={group.id}
        className={`flex flex-col h-full overflow-hidden ${
          isActive ? 'ring-1 ring-blue-500/50' : ''
        } ${draggedFile && draggedFile.groupId !== group.id ? 'ring-2 ring-dashed ring-blue-400/50' : ''}`}
        onClick={() => onActiveGroupChange(group.id)}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('bg-blue-500/10');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-blue-500/10');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('bg-blue-500/10');
          handleDrop(group.id);
        }}
      >
        {/* Group Header with Tabs */}
        <div className="flex items-center bg-gray-800 border-b border-gray-700 min-h-[32px]">
          {/* Tabs */}
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {group.files.map(file => (
              <div
                key={file.path}
                draggable
                onDragStart={() => handleDragStart(group.id, file.path)}
                onDragEnd={() => setDraggedFile(null)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-gray-700 cursor-pointer transition-colors whitespace-nowrap ${
                  file.path === group.activeFilePath
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFile(group.id, file.path);
                }}
              >
                <span className={file.isModified ? 'italic' : ''}>
                  {file.name}
                  {file.isModified && <span className="ml-1 text-yellow-400">•</span>}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(group.id, file.path);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-600 rounded transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Group Actions */}
          <div className="flex items-center gap-0.5 px-1">
            {groups.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaximizedGroup(isMaximized ? null : group.id);
                  }}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGroup(group.id);
                  }}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  title="Close group"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          {activeFile ? (
            isImageFile(activeFile.path) ? (
              <ImagePreview
                src={activeFile.path}
                fileName={activeFile.name}
              />
            ) : (
              <MonacoWrapper
                path={activeFile.path}
                content={activeFile.content}
                language={activeFile.language}
                onChange={(content) => onFileChange(group.id, activeFile.path, content)}
                onCursorChange={(line, column) => onCursorChange(group.id, activeFile.path, line, column)}
                readOnly={readOnly}
                editorOptions={editorOptions as any}
              />
            )
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-900">
              {renderWelcome ? (
                renderWelcome()
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm">No file open</p>
                  <p className="text-xs mt-1">Drag a file here or select from the file tree</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render layout menu
  const renderLayoutMenu = () => (
    <AnimatePresence>
      {showLayoutMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-10 right-2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 min-w-[200px]"
        >
          <div className="text-xs text-gray-400 px-2 py-1 mb-1">Editor Layout</div>
          <button
            onClick={() => handleLayoutChange('single')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors ${
              layout === 'single' ? 'bg-blue-600/20 text-blue-400' : 'text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            Single Editor
          </button>
          <button
            onClick={() => handleLayoutChange('vertical-2')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors ${
              layout === 'vertical-2' ? 'bg-blue-600/20 text-blue-400' : 'text-white'
            }`}
          >
            <Columns className="w-4 h-4" />
            Split Vertical
          </button>
          <button
            onClick={() => handleLayoutChange('horizontal-2')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors ${
              layout === 'horizontal-2' ? 'bg-blue-600/20 text-blue-400' : 'text-white'
            }`}
          >
            <Rows className="w-4 h-4" />
            Split Horizontal
          </button>
          <button
            onClick={() => handleLayoutChange('grid-4')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors ${
              layout === 'grid-4' ? 'bg-blue-600/20 text-blue-400' : 'text-white'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            2x2 Grid
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render the layout toolbar
  const renderToolbar = () => (
    <div className="h-8 flex items-center justify-between px-2 bg-gray-850 border-b border-gray-700" style={{ backgroundColor: '#1a1a2e' }}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          {groups.length} panel{groups.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => splitGroup('vertical')}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          title="Split Right"
          disabled={groups.length >= 4}
        >
          <SplitSquareVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => splitGroup('horizontal')}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          title="Split Down"
          disabled={groups.length >= 4}
        >
          <SplitSquareHorizontal className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Editor Layout"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {renderLayoutMenu()}
        </div>
      </div>
    </div>
  );

  // Render based on layout
  const renderLayout = () => {
    const visibleGroups = maximizedGroup
      ? groups.filter(g => g.id === maximizedGroup)
      : groups.slice(0, layout === 'grid-4' ? 4 : layout === 'single' ? 1 : 2);

    switch (layout) {
      case 'single':
        return (
          <div className="flex-1 overflow-hidden">
            {renderGroup(visibleGroups[0], 0)}
          </div>
        );

      case 'vertical-2':
        return (
          <div ref={containerRef} className="flex-1 flex flex-row overflow-hidden">
            <div style={{ width: `${splitRatio.x * 100}%` }} className="overflow-hidden">
              {renderGroup(visibleGroups[0], 0)}
            </div>
            <div
              onMouseDown={handleMouseDown('x')}
              className={`w-1 cursor-col-resize hover:bg-blue-500 bg-gray-700 transition-colors ${
                isDragging === 'x' ? 'bg-blue-500' : ''
              }`}
            />
            <div style={{ width: `${(1 - splitRatio.x) * 100}%` }} className="overflow-hidden">
              {visibleGroups[1] && renderGroup(visibleGroups[1], 1)}
            </div>
          </div>
        );

      case 'horizontal-2':
        return (
          <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
            <div style={{ height: `${splitRatio.y * 100}%` }} className="overflow-hidden">
              {renderGroup(visibleGroups[0], 0)}
            </div>
            <div
              onMouseDown={handleMouseDown('y')}
              className={`h-1 cursor-row-resize hover:bg-blue-500 bg-gray-700 transition-colors ${
                isDragging === 'y' ? 'bg-blue-500' : ''
              }`}
            />
            <div style={{ height: `${(1 - splitRatio.y) * 100}%` }} className="overflow-hidden">
              {visibleGroups[1] && renderGroup(visibleGroups[1], 1)}
            </div>
          </div>
        );

      case 'grid-4':
        return (
          <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
            {/* Top row */}
            <div style={{ height: `${splitRatio.y * 100}%` }} className="flex flex-row overflow-hidden">
              <div style={{ width: `${splitRatio.x * 100}%` }} className="overflow-hidden">
                {renderGroup(visibleGroups[0], 0)}
              </div>
              <div
                onMouseDown={handleMouseDown('x')}
                className={`w-1 cursor-col-resize hover:bg-blue-500 bg-gray-700 transition-colors ${
                  isDragging === 'x' ? 'bg-blue-500' : ''
                }`}
              />
              <div style={{ width: `${(1 - splitRatio.x) * 100}%` }} className="overflow-hidden">
                {visibleGroups[1] && renderGroup(visibleGroups[1], 1)}
              </div>
            </div>
            {/* Horizontal divider */}
            <div
              onMouseDown={handleMouseDown('y')}
              className={`h-1 cursor-row-resize hover:bg-blue-500 bg-gray-700 transition-colors ${
                isDragging === 'y' ? 'bg-blue-500' : ''
              }`}
            />
            {/* Bottom row */}
            <div style={{ height: `${(1 - splitRatio.y) * 100}%` }} className="flex flex-row overflow-hidden">
              <div style={{ width: `${splitRatio.x * 100}%` }} className="overflow-hidden">
                {visibleGroups[2] && renderGroup(visibleGroups[2], 2)}
              </div>
              <div
                onMouseDown={handleMouseDown('x')}
                className={`w-1 cursor-col-resize hover:bg-blue-500 bg-gray-700 transition-colors ${
                  isDragging === 'x' ? 'bg-blue-500' : ''
                }`}
              />
              <div style={{ width: `${(1 - splitRatio.x) * 100}%` }} className="overflow-hidden">
                {visibleGroups[3] && renderGroup(visibleGroups[3], 3)}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
      {groups.length > 0 && groups[0].files.length > 0 && renderToolbar()}
      {renderLayout()}
    </div>
  );
};

export default EditorGroups;
