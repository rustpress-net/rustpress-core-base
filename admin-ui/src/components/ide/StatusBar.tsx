/**
 * StatusBar - VS Code-like bottom status bar
 * Shows file info and git status for the RustPress project
 */

import React from 'react';
import {
  GitBranch, AlertCircle, Check, Code,
  Bell, Wifi, WifiOff, Settings, Keyboard
} from 'lucide-react';
import type { OpenFile } from './IDE';
import type { EditorConfig } from './EditorSettings';

// ============================================
// TYPES
// ============================================

interface StatusBarProps {
  activeFile: OpenFile | undefined;
  hasUnsavedChanges: boolean;
  editorConfig?: EditorConfig;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
}

// ============================================
// HELPERS
// ============================================

function getLanguageDisplayName(language: string): string {
  const names: Record<string, string> = {
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'json': 'JSON',
    'markdown': 'Markdown',
    'xml': 'XML',
    'plaintext': 'Plain Text',
    'html-jinja': 'HTML (Jinja)',
  };
  return names[language] || language.toUpperCase();
}

// ============================================
// MAIN COMPONENT
// ============================================

export const StatusBar: React.FC<StatusBarProps> = ({
  activeFile,
  hasUnsavedChanges,
  editorConfig,
  onOpenSettings,
  onOpenShortcuts
}) => {
  const gitBranch = 'main';
  const isConnected = true; // Mock connection status
  const tabSize = editorConfig?.tabSize || 2;

  return (
    <div className="h-6 flex items-center justify-between px-3 bg-blue-600 text-white text-xs select-none">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Git Branch */}
        <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
          <GitBranch className="w-3.5 h-3.5" />
          <span>{gitBranch}</span>
          {hasUnsavedChanges && (
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          )}
        </button>

        {/* Sync Status */}
        <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
          {isConnected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Synced</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
              <span>Offline</span>
            </>
          )}
        </button>

        {/* Problems/Errors */}
        <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>0</span>
          <span className="text-blue-300">|</span>
          <span>0</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {activeFile ? (
          <>
            {/* Cursor Position */}
            <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
              <span>
                Ln {activeFile.cursorPosition.line}, Col {activeFile.cursorPosition.column}
              </span>
            </button>

            {/* Tab Size */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors"
            >
              <span>Spaces: {tabSize}</span>
            </button>

            {/* Encoding */}
            <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
              <span>UTF-8</span>
            </button>

            {/* Line Ending */}
            <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
              <span>LF</span>
            </button>

            {/* Language */}
            <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
              <Code className="w-3.5 h-3.5" />
              <span>{getLanguageDisplayName(activeFile.language)}</span>
            </button>
          </>
        ) : (
          <span className="text-blue-200">No file selected</span>
        )}

        {/* Keyboard Shortcuts */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors"
            title="Editor Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Connection Status */}
        <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-yellow-400" />
          )}
        </button>

        {/* Notifications */}
        <button className="flex items-center gap-1 hover:bg-blue-700 px-1.5 py-0.5 rounded transition-colors">
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
