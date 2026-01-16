/**
 * DetachedTabWindow - Standalone window for a detached IDE tab
 * Communicates with main IDE via BroadcastChannel
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Save, X, ArrowLeft, GitBranch, Lock, Unlock, Maximize2, Minimize2 } from 'lucide-react';
import { MonacoWrapper } from './MonacoWrapper';
import { StatusBar } from './StatusBar';
import { HtmlCssPreview } from './HtmlCssPreview';
import { windowSyncService, type FileContentPayload, type DetachPayload } from '../../services/windowSyncService';
import type { OpenFile } from './IDE';

// ============================================
// HELPER FUNCTIONS
// ============================================

const HTML_EXTENSIONS = ['.html', '.htm', '.xhtml'];
const CSS_EXTENSIONS = ['.css', '.scss', '.sass', '.less'];
const SVG_EXTENSIONS = ['.svg'];

const isHtmlFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return HTML_EXTENSIONS.includes(ext);
};

const isCssFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return CSS_EXTENSIONS.includes(ext);
};

const isSvgFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return SVG_EXTENSIONS.includes(ext);
};

const isPreviewableFile = (path: string): boolean => {
  return isHtmlFile(path) || isCssFile(path) || isSvgFile(path);
};

const getPreviewLanguage = (path: string): 'html' | 'css' | 'svg' => {
  if (isHtmlFile(path)) return 'html';
  if (isCssFile(path)) return 'css';
  return 'svg';
};

// ============================================
// COMPONENT
// ============================================

export const DetachedTabWindow: React.FC = () => {
  const [file, setFile] = useState<OpenFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(400);

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const windowId = urlParams.get('windowId') || '';
  const filePath = urlParams.get('filePath') || '';
  const fileName = urlParams.get('fileName') || '';

  // Request file data on mount
  useEffect(() => {
    // Request file data from main window
    windowSyncService.requestFileData(filePath);

    // Set up listeners
    const unsubTabDetached = windowSyncService.on('tab-detached', (payload) => {
      const data = payload as DetachPayload;
      if (data.windowId === windowId) {
        setFile(data.file);
        setIsLoading(false);
      }
    });

    const unsubFileData = windowSyncService.on('file-data', (payload) => {
      const data = payload as { file: OpenFile; targetWindowId: string };
      if (data.targetWindowId === windowId) {
        setFile(data.file);
        setIsLoading(false);
      }
    });

    const unsubContentChanged = windowSyncService.on('file-content-changed', (payload) => {
      const data = payload as FileContentPayload;
      if (data.path === filePath) {
        setFile(prev => prev ? { ...prev, content: data.content, isModified: true } : null);
      }
    });

    const unsubFileSaved = windowSyncService.on('file-saved', (payload) => {
      const data = payload as FileContentPayload;
      if (data.path === filePath) {
        setFile(prev => prev ? {
          ...prev,
          content: data.content,
          originalContent: data.content,
          isModified: false
        } : null);
      }
    });

    // Send ping to request state sync
    windowSyncService.sendMessage('ping', { windowId, filePath });

    return () => {
      unsubTabDetached();
      unsubFileData();
      unsubContentChanged();
      unsubFileSaved();
    };
  }, [windowId, filePath]);

  // Update window title
  useEffect(() => {
    if (file) {
      document.title = `${file.name}${file.isModified ? ' *' : ''} - RustPress IDE`;
    }
  }, [file?.name, file?.isModified]);

  const handleContentChange = useCallback((content: string) => {
    if (!file) return;

    setFile(prev => prev ? {
      ...prev,
      content,
      isModified: content !== prev.originalContent
    } : null);

    // Notify main window of change
    windowSyncService.notifyContentChanged(file.path, content);
  }, [file?.path]);

  const handleCursorChange = useCallback((line: number, column: number) => {
    if (!file) return;

    setFile(prev => prev ? {
      ...prev,
      cursorPosition: { line, column }
    } : null);

    windowSyncService.notifyCursorChanged(file.path, line, column);
  }, [file?.path]);

  const handleSave = useCallback(async () => {
    if (!file || isSaving) return;

    setIsSaving(true);
    try {
      // Notify main window to save
      windowSyncService.notifyFileSaved(file.path, file.content);
      setFile(prev => prev ? {
        ...prev,
        originalContent: file.content,
        isModified: false
      } : null);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [file, isSaving]);

  const handleReattach = useCallback(() => {
    if (!file) return;
    windowSyncService.reattachTab(windowId, file);
    window.close();
  }, [file, windowId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading {fileName}...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load file</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const canPreview = isPreviewableFile(file.path);

  return (
    <div className="h-screen bg-gray-900 flex flex-col text-white">
      {/* Toolbar */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          {/* Reattach button */}
          <button
            onClick={handleReattach}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Reattach to main window"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Reattach
          </button>

          {/* File info */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${file.isModified ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-gray-500">{file.path}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle for HTML/CSS/SVG */}
          {canPreview && (
            <button
              onClick={() => setShowPreview(prev => !prev)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                showPreview ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}

          {/* Lock/Unlock */}
          <button
            onClick={() => setIsLocked(prev => !prev)}
            className={`p-1.5 rounded transition-colors ${
              isLocked ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={isLocked ? 'Unlock editor' : 'Lock editor'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!file.isModified || isSaving}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              file.isModified
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          {/* Close */}
          <button
            onClick={() => window.close()}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Close window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code editor */}
        <div className={`flex-1 overflow-hidden ${showPreview && canPreview ? '' : 'w-full'}`}>
          <MonacoWrapper
            path={file.path}
            content={file.content}
            language={file.language}
            onChange={handleContentChange}
            onCursorChange={handleCursorChange}
            readOnly={isLocked}
          />
        </div>

        {/* Preview panel with resize */}
        {showPreview && canPreview && (
          <>
            {/* Resize handle */}
            <div
              className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 group relative"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = previewWidth;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const delta = startX - moveEvent.clientX;
                  const newWidth = Math.max(200, Math.min(600, startWidth + delta));
                  setPreviewWidth(newWidth);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.cursor = '';
                  document.body.style.userSelect = '';
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
              }}
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
            </div>

            {/* Preview */}
            <div style={{ width: previewWidth }} className="flex-shrink-0 overflow-hidden">
              <HtmlCssPreview
                content={file.content}
                language={getPreviewLanguage(file.path)}
                filePath={file.path}
              />
            </div>
          </>
        )}
      </div>

      {/* Status bar */}
      <StatusBar
        branch="detached"
        language={file.language}
        cursorPosition={file.cursorPosition}
        fileStatus={file.isModified ? 'modified' : 'saved'}
        encoding="UTF-8"
      />
    </div>
  );
};

export default DetachedTabWindow;
