/**
 * RustPress Keyboard Shortcuts Panel Component
 * Shows all available keyboard shortcuts
 * Triggered by pressing ?
 */

import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import { cn } from '../utils';
import { useNavigationStore, defaultKeyboardShortcuts, KeyboardShortcut } from '../../store/navigationStore';

// Detect OS for key labels
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Convert key names to display format
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    Cmd: isMac ? '⌘' : 'Ctrl',
    Ctrl: isMac ? '⌃' : 'Ctrl',
    Alt: isMac ? '⌥' : 'Alt',
    Shift: isMac ? '⇧' : 'Shift',
    Enter: '↵',
    Esc: 'Esc',
    Tab: '⇥',
    Backspace: '⌫',
    Delete: '⌦',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
  };

  return keyMap[key] || key;
}

export interface KeyboardShortcutsPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  shortcuts?: KeyboardShortcut[];
}

export function KeyboardShortcutsPanel({
  isOpen: controlledIsOpen,
  onClose,
  shortcuts = defaultKeyboardShortcuts,
}: KeyboardShortcutsPanelProps) {
  const { isShortcutsPanelOpen, closeShortcutsPanel } = useNavigationStore();

  const isOpen = controlledIsOpen ?? isShortcutsPanelOpen;
  const handleClose = onClose ?? closeShortcutsPanel;

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    shortcuts.forEach((shortcut) => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = [];
      }
      groups[shortcut.category].push(shortcut);
    });
    return groups;
  }, [shortcuts]);

  const categories = Object.keys(groupedShortcuts);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] z-[101] mx-auto max-w-3xl overflow-hidden"
          >
            <div
              className={cn(
                'h-full flex flex-col',
                'rounded-2xl',
                'bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-800',
                'shadow-2xl dark:shadow-neutral-950/50'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Keyboard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">?</kbd> anytime to show this panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className={cn(
                    'p-2 rounded-xl',
                    'text-neutral-400 hover:text-neutral-600',
                    'dark:hover:text-neutral-300',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'transition-colors'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4">
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {groupedShortcuts[category].map((shortcut) => (
                          <div
                            key={shortcut.id}
                            className="flex items-center justify-between group"
                          >
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, index) => (
                                <React.Fragment key={index}>
                                  {index > 0 && (
                                    <span className="text-xs text-neutral-400">+</span>
                                  )}
                                  <kbd
                                    className={cn(
                                      'min-w-[24px] h-6 px-1.5',
                                      'flex items-center justify-center',
                                      'text-xs font-medium',
                                      'rounded-md',
                                      'bg-neutral-100 dark:bg-neutral-800',
                                      'text-neutral-600 dark:text-neutral-300',
                                      'border border-neutral-200 dark:border-neutral-700',
                                      'shadow-sm'
                                    )}
                                  >
                                    {formatKey(key)}
                                  </kbd>
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
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Command className="w-4 h-4" />
                      <span>{isMac ? 'Command' : 'Ctrl'} for most shortcuts</span>
                    </span>
                  </div>
                  <span>
                    Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-xs">Esc</kbd> to close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default KeyboardShortcutsPanel;
