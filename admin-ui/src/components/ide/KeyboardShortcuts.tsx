/**
 * KeyboardShortcuts - Keyboard shortcuts reference modal
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'File Operations',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save File' },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Save All Files' },
      { keys: ['Ctrl', 'N'], description: 'New File' },
      { keys: ['Ctrl', 'Shift', 'N'], description: 'New Folder' },
      { keys: ['Ctrl', 'W'], description: 'Close File' },
      { keys: ['Ctrl', 'Shift', 'W'], description: 'Close All Files' },
    ],
  },
  {
    name: 'Search & Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'P'], description: 'Quick Open File' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Command Palette' },
      { keys: ['Ctrl', 'F'], description: 'Find in File' },
      { keys: ['Ctrl', 'H'], description: 'Find and Replace' },
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Global Search' },
      { keys: ['Ctrl', 'G'], description: 'Go to Line' },
      { keys: ['Ctrl', 'Shift', 'O'], description: 'Go to Symbol' },
    ],
  },
  {
    name: 'Tab Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'Tab'], description: 'Next Tab' },
      { keys: ['Ctrl', 'Shift', 'Tab'], description: 'Previous Tab' },
      { keys: ['Ctrl', '1-9'], description: 'Go to Tab #' },
      { keys: ['Alt', '←'], description: 'Navigate Back' },
      { keys: ['Alt', '→'], description: 'Navigate Forward' },
    ],
  },
  {
    name: 'View & Panels',
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Toggle Sidebar' },
      { keys: ['Ctrl', 'J'], description: 'Toggle Bottom Panel' },
      { keys: ['Ctrl', '`'], description: 'Toggle Terminal' },
      { keys: ['Ctrl', 'Shift', 'M'], description: 'Toggle Problems' },
      { keys: ['Ctrl', '\\'], description: 'Split Editor' },
      { keys: ['Ctrl', ','], description: 'Open Settings' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Focus Explorer' },
      { keys: ['Ctrl', 'Shift', 'G'], description: 'Focus Git' },
      { keys: ['Ctrl', 'Shift', 'X'], description: 'Focus Extensions' },
    ],
  },
  {
    name: 'Editor Zoom',
    shortcuts: [
      { keys: ['Ctrl', '+'], description: 'Zoom In' },
      { keys: ['Ctrl', '-'], description: 'Zoom Out' },
      { keys: ['Ctrl', '0'], description: 'Reset Zoom' },
    ],
  },
  {
    name: 'Zen Mode',
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Toggle Zen Mode' },
      { keys: ['F11'], description: 'Toggle Fullscreen' },
      { keys: ['Esc'], description: 'Exit Zen Mode' },
    ],
  },
  {
    name: 'Debugging',
    shortcuts: [
      { keys: ['F5'], description: 'Start Debugging' },
      { keys: ['Shift', 'F5'], description: 'Stop Debugging' },
      { keys: ['F9'], description: 'Toggle Breakpoint' },
      { keys: ['F10'], description: 'Step Over' },
      { keys: ['Shift', 'F11'], description: 'Step Out' },
    ],
  },
  {
    name: 'Editor',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'C'], description: 'Copy' },
      { keys: ['Ctrl', 'X'], description: 'Cut' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Ctrl', 'A'], description: 'Select All' },
      { keys: ['Ctrl', 'D'], description: 'Select Next Occurrence' },
      { keys: ['Ctrl', '/'], description: 'Toggle Comment' },
      { keys: ['Shift', 'Alt', 'F'], description: 'Format Document' },
    ],
  },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose
}) => {
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[80vh] overflow-hidden"
          >
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-medium text-white">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-auto max-h-[calc(80vh-60px)]">
                <div className="grid grid-cols-2 gap-6">
                  {shortcutCategories.map(category => (
                    <div key={category.name}>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                        {category.name}
                      </h4>
                      <div className="space-y-2">
                        {category.shortcuts.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-sm text-gray-300">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIdx) => (
                                <React.Fragment key={keyIdx}>
                                  <kbd className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300 font-mono min-w-[24px] text-center">
                                    {key}
                                  </kbd>
                                  {keyIdx < shortcut.keys.length - 1 && (
                                    <span className="text-gray-500 text-xs">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">Esc</kbd> to close
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcuts;
