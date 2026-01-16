/**
 * CommandPalette - Command palette (Ctrl+Shift+P)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Settings, Save, FolderOpen, GitBranch, Palette,
  Type, ZoomIn, ZoomOut, Columns, FileText, Code, RefreshCw,
  Download, Upload, Trash2, Copy, Scissors, X, Terminal,
  Eye, EyeOff, WrapText, Map, SplitSquareHorizontal, Keyboard
} from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-command-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
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
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
    }
  };

  const handleSelect = (command: Command) => {
    command.action();
    onClose();
  };

  let itemIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <div
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command..."
                  className="w-full px-4 py-3 pl-12 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                />
                <button
                  onClick={onClose}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[400px] overflow-auto border-t border-gray-700"
              >
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No commands found
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-900/50">
                        {category}
                      </div>
                      {cmds.map((cmd) => {
                        itemIndex++;
                        const isSelected = itemIndex === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            data-command-item
                            onClick={() => handleSelect(cmd)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-600/30 text-white'
                                : 'text-gray-300 hover:bg-gray-700/50'
                            }`}
                          >
                            <span className="w-5 h-5 flex items-center justify-center text-gray-400">
                              {cmd.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">{cmd.label}</div>
                              {cmd.description && (
                                <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className="px-2 py-0.5 text-xs bg-gray-700 rounded text-gray-400 font-mono">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
                <span>
                  {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-4">
                  <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">↑↓</kbd> Navigate</span>
                  <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">↵</kbd> Run</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Default commands generator
export const getDefaultCommands = (handlers: {
  onSave: () => void;
  onOpenFile: () => void;
  onGlobalSearch: () => void;
  onGoToLine: () => void;
  onToggleSidebar: () => void;
  onToggleMinimap: () => void;
  onToggleWordWrap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSplitEditor: () => void;
  onToggleGit: () => void;
  onToggleSettings: () => void;
  onFormatDocument: () => void;
  onToggleTheme: () => void;
  onShowKeyboardShortcuts: () => void;
}): Command[] => [
  // File
  {
    id: 'save',
    label: 'Save',
    description: 'Save current file',
    icon: <Save className="w-4 h-4" />,
    shortcut: 'Ctrl+S',
    category: 'File',
    action: handlers.onSave,
  },
  {
    id: 'open-file',
    label: 'Quick Open',
    description: 'Open file by name',
    icon: <FolderOpen className="w-4 h-4" />,
    shortcut: 'Ctrl+P',
    category: 'File',
    action: handlers.onOpenFile,
  },

  // Search
  {
    id: 'global-search',
    label: 'Search in Files',
    description: 'Search across all files',
    icon: <Search className="w-4 h-4" />,
    shortcut: 'Ctrl+Shift+F',
    category: 'Search',
    action: handlers.onGlobalSearch,
  },
  {
    id: 'go-to-line',
    label: 'Go to Line',
    description: 'Jump to specific line',
    icon: <Type className="w-4 h-4" />,
    shortcut: 'Ctrl+G',
    category: 'Search',
    action: handlers.onGoToLine,
  },

  // View
  {
    id: 'toggle-sidebar',
    label: 'Toggle Sidebar',
    description: 'Show/hide file explorer',
    icon: <Columns className="w-4 h-4" />,
    shortcut: 'Ctrl+B',
    category: 'View',
    action: handlers.onToggleSidebar,
  },
  {
    id: 'toggle-minimap',
    label: 'Toggle Minimap',
    description: 'Show/hide code minimap',
    icon: <Map className="w-4 h-4" />,
    category: 'View',
    action: handlers.onToggleMinimap,
  },
  {
    id: 'toggle-word-wrap',
    label: 'Toggle Word Wrap',
    description: 'Enable/disable line wrapping',
    icon: <WrapText className="w-4 h-4" />,
    category: 'View',
    action: handlers.onToggleWordWrap,
  },
  {
    id: 'zoom-in',
    label: 'Zoom In',
    description: 'Increase font size',
    icon: <ZoomIn className="w-4 h-4" />,
    shortcut: 'Ctrl++',
    category: 'View',
    action: handlers.onZoomIn,
  },
  {
    id: 'zoom-out',
    label: 'Zoom Out',
    description: 'Decrease font size',
    icon: <ZoomOut className="w-4 h-4" />,
    shortcut: 'Ctrl+-',
    category: 'View',
    action: handlers.onZoomOut,
  },
  {
    id: 'reset-zoom',
    label: 'Reset Zoom',
    description: 'Reset to default font size',
    icon: <RefreshCw className="w-4 h-4" />,
    shortcut: 'Ctrl+0',
    category: 'View',
    action: handlers.onResetZoom,
  },
  {
    id: 'split-editor',
    label: 'Split Editor',
    description: 'Split view horizontally',
    icon: <SplitSquareHorizontal className="w-4 h-4" />,
    category: 'View',
    action: handlers.onSplitEditor,
  },

  // Editor
  {
    id: 'format-document',
    label: 'Format Document',
    description: 'Auto-format current file',
    icon: <Code className="w-4 h-4" />,
    shortcut: 'Shift+Alt+F',
    category: 'Editor',
    action: handlers.onFormatDocument,
  },

  // Panels
  {
    id: 'toggle-git',
    label: 'Toggle Git Panel',
    description: 'Show/hide git panel',
    icon: <GitBranch className="w-4 h-4" />,
    category: 'Panels',
    action: handlers.onToggleGit,
  },
  {
    id: 'toggle-settings',
    label: 'Toggle Settings',
    description: 'Show/hide settings panel',
    icon: <Settings className="w-4 h-4" />,
    category: 'Panels',
    action: handlers.onToggleSettings,
  },

  // Preferences
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between light/dark theme',
    icon: <Palette className="w-4 h-4" />,
    category: 'Preferences',
    action: handlers.onToggleTheme,
  },
  {
    id: 'keyboard-shortcuts',
    label: 'Keyboard Shortcuts',
    description: 'View all shortcuts',
    icon: <Keyboard className="w-4 h-4" />,
    shortcut: 'Ctrl+K Ctrl+S',
    category: 'Preferences',
    action: handlers.onShowKeyboardShortcuts,
  },
];

export default CommandPalette;
