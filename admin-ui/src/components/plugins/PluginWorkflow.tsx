/**
 * RustPress Plugin Workflow & UX Improvements
 * Phase 6: Enhancements 45-50
 *
 * Enhancement 45: Keyboard Shortcuts
 * Enhancement 46: Quick Actions Toolbar
 * Enhancement 47: Undo/Redo System
 * Enhancement 48: Notification Center
 * Enhancement 49: Onboarding Wizard
 * Enhancement 50: Help & Tips System
 */

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  Command,
  Search,
  Settings,
  Download,
  Upload,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Undo2,
  Redo2,
  Bell,
  BellOff,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Video,
  ExternalLink,
  MessageSquare,
  Zap,
  Shield,
  Package,
  Clock,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Star,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  Target,
  Gift,
  Rocket,
  Trophy,
  ThumbsUp,
  Heart,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
  global?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  category?: string;
  disabled?: boolean;
}

export interface UndoableAction {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
  data?: any;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
  video?: string;
}

export interface HelpTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon?: React.ElementType;
  link?: string;
  video?: string;
}

// ============================================================================
// Enhancement 45: Keyboard Shortcuts
// ============================================================================

interface KeyboardShortcutsContextValue {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  defaultShortcuts?: KeyboardShortcut[];
}

export function KeyboardShortcutsProvider({ children, defaultShortcuts = [] }: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(defaultShortcuts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      if (prev.some((s) => s.id === shortcut.id)) {
        return prev.map((s) => (s.id === shortcut.id ? shortcut : s));
      }
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Build key combination string
      const keys: string[] = [];
      if (e.metaKey || e.ctrlKey) keys.push('⌘');
      if (e.altKey) keys.push('⌥');
      if (e.shiftKey) keys.push('⇧');
      keys.push(e.key.toUpperCase());

      const keyCombo = keys.join('+');

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const shortcutCombo = shortcut.keys.join('+');
        return shortcutCombo === keyCombo;
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }

      // Open shortcuts modal with ?
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
      <KeyboardShortcutsModal />
    </KeyboardShortcutsContext.Provider>
  );
}

function KeyboardShortcutsModal() {
  const { shortcuts, isModalOpen, closeModal } = useKeyboardShortcuts();

  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    shortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
    });
    return groups;
  }, [shortcuts]);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <Keyboard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut) => (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, index) => (
                              <React.Fragment key={index}>
                                <kbd
                                  className={cn(
                                    'px-2 py-1 rounded-lg',
                                    'text-xs font-medium',
                                    'bg-neutral-100 dark:bg-neutral-800',
                                    'text-neutral-700 dark:text-neutral-300',
                                    'border border-neutral-200 dark:border-neutral-700'
                                  )}
                                >
                                  {key}
                                </kbd>
                                {index < shortcut.keys.length - 1 && (
                                  <span className="text-neutral-400">+</span>
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
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <p className="text-xs text-neutral-500 text-center">
                Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">?</kbd> anytime to show this dialog
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Enhancement 46: Quick Actions Toolbar
// ============================================================================

interface QuickActionsToolbarProps {
  actions: QuickAction[];
  position?: 'top' | 'bottom' | 'floating';
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function QuickActionsToolbar({
  actions,
  position = 'floating',
  showSearch = true,
  onSearch,
}: QuickActionsToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return actions;
    const query = searchQuery.toLowerCase();
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(query) ||
        a.category?.toLowerCase().includes(query)
    );
  }, [actions, searchQuery]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, QuickAction[]> = {};
    filteredActions.forEach((action) => {
      const category = action.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(action);
    });
    return groups;
  }, [filteredActions]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const positionClasses = {
    top: 'fixed top-4 left-1/2 -translate-x-1/2',
    bottom: 'fixed bottom-4 left-1/2 -translate-x-1/2',
    floating: 'fixed bottom-6 right-6',
  };

  return (
    <>
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          positionClasses[position],
          'z-40'
        )}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                'flex items-center gap-2 p-2 rounded-2xl',
                'bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-lg'
              )}
            >
              {showSearch && (
                <button
                  onClick={() => setShowCommandPalette(true)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl',
                    'text-sm text-neutral-500',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'transition-colors'
                  )}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden md:inline">Search...</span>
                  <kbd className="hidden md:inline px-1.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800">
                    ⌘K
                  </kbd>
                </button>
              )}

              <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

              {actions.slice(0, 5).map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    disabled={action.disabled}
                    title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
                    className={cn(
                      'p-2 rounded-xl',
                      'text-neutral-600 dark:text-neutral-400',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      'hover:text-neutral-900 dark:hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}

              {actions.length > 5 && (
                <button
                  onClick={() => setShowCommandPalette(true)}
                  className={cn(
                    'p-2 rounded-xl',
                    'text-neutral-600 dark:text-neutral-400',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'transition-colors'
                  )}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setIsExpanded(false)}
                className={cn(
                  'p-2 rounded-xl',
                  'text-neutral-400',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'transition-colors'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className={cn(
                'p-3 rounded-2xl',
                'bg-primary-600 text-white',
                'shadow-lg hover:bg-primary-700',
                'transition-colors'
              )}
            >
              <Zap className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4 bg-black/50"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  autoFocus
                  className={cn(
                    'flex-1 bg-transparent',
                    'text-neutral-900 dark:text-white',
                    'placeholder-neutral-400',
                    'outline-none'
                  )}
                />
                <kbd className="px-2 py-1 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(groupedActions).map(([category, categoryActions]) => (
                  <div key={category} className="mb-2">
                    <p className="px-3 py-1 text-xs font-medium text-neutral-500 uppercase">
                      {category}
                    </p>
                    {categoryActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => {
                            action.action();
                            setShowCommandPalette(false);
                          }}
                          disabled={action.disabled}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-xl',
                            'text-left',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'transition-colors'
                          )}
                        >
                          <Icon className="w-4 h-4 text-neutral-500" />
                          <span className="flex-1 text-sm text-neutral-900 dark:text-white">
                            {action.label}
                          </span>
                          {action.shortcut && (
                            <kbd className="px-1.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              {action.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {filteredActions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-neutral-500">No actions found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Enhancement 47: Undo/Redo System
// ============================================================================

interface UndoRedoContextValue {
  canUndo: boolean;
  canRedo: boolean;
  history: UndoableAction[];
  currentIndex: number;
  addAction: (action: Omit<UndoableAction, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

export function useUndoRedo() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
}

interface UndoRedoProviderProps {
  children: React.ReactNode;
  maxHistory?: number;
}

export function UndoRedoProvider({ children, maxHistory = 50 }: UndoRedoProviderProps) {
  const [history, setHistory] = useState<UndoableAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const addAction = useCallback(
    (action: Omit<UndoableAction, 'id' | 'timestamp'>) => {
      const newAction: UndoableAction = {
        ...action,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        // Remove any future actions if we're not at the end
        const newHistory = prev.slice(0, currentIndex + 1);
        // Add new action
        newHistory.push(newAction);
        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
        }
        return newHistory;
      });
      setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [currentIndex, maxHistory]
  );

  const undo = useCallback(() => {
    if (!canUndo) return;
    const action = history[currentIndex];
    action.undo();
    setCurrentIndex((prev) => prev - 1);
  }, [canUndo, history, currentIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const action = history[currentIndex + 1];
    action.redo();
    setCurrentIndex((prev) => prev + 1);
  }, [canRedo, history, currentIndex]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <UndoRedoContext.Provider
      value={{
        canUndo,
        canRedo,
        history,
        currentIndex,
        addAction,
        undo,
        redo,
        clear,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
}

interface UndoRedoControlsProps {
  showHistory?: boolean;
}

export function UndoRedoControls({ showHistory = false }: UndoRedoControlsProps) {
  const { canUndo, canRedo, history, currentIndex, undo, redo } = useUndoRedo();
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (⌘Z)"
        className={cn(
          'p-2 rounded-lg',
          'text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (⌘⇧Z)"
        className={cn(
          'p-2 rounded-lg',
          'text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
      >
        <Redo2 className="w-4 h-4" />
      </button>

      {showHistory && (
        <div className="relative">
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={cn(
              'p-2 rounded-lg',
              'text-neutral-600 dark:text-neutral-400',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
          >
            <Clock className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showHistoryPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'absolute right-0 top-full mt-2 w-72',
                  'p-3 rounded-xl',
                  'bg-white dark:bg-neutral-900',
                  'border border-neutral-200 dark:border-neutral-700',
                  'shadow-lg z-10'
                )}
              >
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  History
                </h4>
                {history.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {[...history].reverse().map((action, index) => {
                      const realIndex = history.length - 1 - index;
                      const isCurrent = realIndex === currentIndex;
                      const isFuture = realIndex > currentIndex;

                      return (
                        <div
                          key={action.id}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm',
                            isCurrent && 'bg-primary-100 dark:bg-primary-900/30',
                            isFuture && 'opacity-50'
                          )}
                        >
                          {isCurrent && (
                            <ChevronRight className="w-3 h-3 text-primary-600" />
                          )}
                          <span
                            className={cn(
                              'flex-1',
                              isCurrent
                                ? 'text-primary-700 dark:text-primary-300'
                                : 'text-neutral-700 dark:text-neutral-300'
                            )}
                          >
                            {action.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    No history yet
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Enhancement 48: Notification Center
// ============================================================================

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const typeConfig = {
    success: { icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    error: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-xl',
          'text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors'
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute right-0 top-full mt-2 w-96',
              'rounded-2xl overflow-hidden',
              'bg-white dark:bg-neutral-900',
              'border border-neutral-200 dark:border-neutral-700',
              'shadow-xl z-50'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-medium',
                    filter === 'unread'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {filter === 'unread' ? 'Unread' : 'All'}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredNotifications.map((notification) => {
                    const config = typeConfig[notification.type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'flex gap-3 p-4',
                          !notification.read && 'bg-primary-50/50 dark:bg-primary-900/10'
                        )}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                      >
                        <div className={cn('flex-shrink-0 p-2 rounded-xl', config.bgColor)}>
                          <Icon className={cn('w-4 h-4', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(notification.id);
                              }}
                              className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {notification.message && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-neutral-400">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action!.onClick();
                                }}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                              >
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                  <p className="text-sm text-neutral-500">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <button
                  onClick={onClearAll}
                  className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 49: Onboarding Wizard
// ============================================================================

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingWizard({ steps, isOpen, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden"
        >
          {/* Progress */}
          <div className="h-1 bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  {currentStep === 0 && <Rocket className="w-10 h-10 text-primary-600 dark:text-primary-400" />}
                  {currentStep === 1 && <Package className="w-10 h-10 text-primary-600 dark:text-primary-400" />}
                  {currentStep === 2 && <Settings className="w-10 h-10 text-primary-600 dark:text-primary-400" />}
                  {currentStep === 3 && <Trophy className="w-10 h-10 text-primary-600 dark:text-primary-400" />}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                  {step.description}
                </p>

                {/* Media */}
                {step.image && (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="max-w-full h-48 object-contain mx-auto mb-6 rounded-xl"
                  />
                )}
                {step.video && (
                  <div className="aspect-video max-w-md mx-auto mb-6 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <video src={step.video} controls className="w-full h-full" />
                  </div>
                )}

                {/* Action */}
                {step.action && (
                  <button
                    onClick={step.action.onClick}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
                      'text-sm font-medium',
                      'bg-primary-100 dark:bg-primary-900/30',
                      'text-primary-700 dark:text-primary-300',
                      'hover:bg-primary-200 dark:hover:bg-primary-900/50',
                      'transition-colors mb-6'
                    )}
                  >
                    {step.action.label}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentStep
                      ? 'bg-primary-500'
                      : index < currentStep
                      ? 'bg-primary-300'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Skip
              </button>
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium',
                  'text-neutral-700 dark:text-neutral-300',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl',
                  'text-sm font-medium',
                  'bg-primary-600 text-white',
                  'hover:bg-primary-700'
                )}
              >
                {isLast ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Enhancement 50: Help & Tips System
// ============================================================================

interface HelpTipsProps {
  tips: HelpTip[];
  position?: 'sidebar' | 'modal' | 'inline';
}

export function HelpTips({ tips, position = 'sidebar' }: HelpTipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tips.forEach((tip) => cats.add(tip.category));
    return Array.from(cats);
  }, [tips]);

  const filteredTips = useMemo(() => {
    let result = tips;

    if (selectedCategory) {
      result = result.filter((tip) => tip.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tip) =>
          tip.title.toLowerCase().includes(query) ||
          tip.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tips, selectedCategory, searchQuery]);

  const typeIcons = {
    getting_started: Rocket,
    features: Sparkles,
    troubleshooting: Wrench,
    best_practices: Star,
    faq: HelpCircle,
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 p-2 rounded-xl',
          'text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors'
        )}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 w-96 z-50',
              'bg-white dark:bg-neutral-900',
              'border-l border-neutral-200 dark:border-neutral-700',
              'shadow-2xl flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Help & Tips
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search help topics..."
                  className={cn(
                    'w-full pl-9 pr-4 py-2 rounded-xl',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-900 dark:text-white',
                    'placeholder-neutral-400',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  )}
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    !selectedCategory
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  )}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {filteredTips.map((tip) => {
                  const isExpanded = expandedTip === tip.id;
                  const Icon = tip.icon || HelpCircle;

                  return (
                    <motion.div
                      key={tip.id}
                      layout
                      className={cn(
                        'rounded-xl border overflow-hidden',
                        'border-neutral-200 dark:border-neutral-700',
                        isExpanded && 'ring-2 ring-primary-500/20'
                      )}
                    >
                      <button
                        onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                        className={cn(
                          'w-full flex items-start gap-3 p-4',
                          'text-left',
                          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                          'transition-colors'
                        )}
                      >
                        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {tip.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {tip.category}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                                {tip.content}
                              </p>
                              <div className="flex items-center gap-2 mt-4">
                                {tip.link && (
                                  <a
                                    href={tip.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                                      'text-xs font-medium',
                                      'bg-primary-100 dark:bg-primary-900/30',
                                      'text-primary-700 dark:text-primary-300',
                                      'hover:bg-primary-200 dark:hover:bg-primary-900/50'
                                    )}
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    Read more
                                  </a>
                                )}
                                {tip.video && (
                                  <a
                                    href={tip.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                                      'text-xs font-medium',
                                      'bg-red-100 dark:bg-red-900/30',
                                      'text-red-700 dark:text-red-300',
                                      'hover:bg-red-200 dark:hover:bg-red-900/50'
                                    )}
                                  >
                                    <Video className="w-3 h-3" />
                                    Watch video
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {filteredTips.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm text-neutral-500">No tips found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between text-sm">
                <a
                  href="#"
                  className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/20"
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Contextual Tooltip Component
interface ContextualTooltipProps {
  children: React.ReactNode;
  tip: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function ContextualTooltip({ children, tip, position = 'top' }: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'absolute z-50 px-3 py-2 rounded-lg',
              'bg-neutral-900 dark:bg-neutral-700',
              'text-white text-xs',
              'whitespace-nowrap',
              'pointer-events-none',
              positionClasses[position]
            )}
          >
            {tip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

const Wrench = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const sampleShortcuts: KeyboardShortcut[] = [
  { id: '1', keys: ['⌘', 'S'], description: 'Save settings', category: 'General', action: () => console.log('Save') },
  { id: '2', keys: ['⌘', 'Z'], description: 'Undo', category: 'General', action: () => console.log('Undo') },
  { id: '3', keys: ['⌘', '⇧', 'Z'], description: 'Redo', category: 'General', action: () => console.log('Redo') },
  { id: '4', keys: ['⌘', 'K'], description: 'Open command palette', category: 'Navigation', action: () => console.log('Command') },
  { id: '5', keys: ['⌘', 'P'], description: 'Search plugins', category: 'Navigation', action: () => console.log('Search') },
  { id: '6', keys: ['⌘', 'I'], description: 'Install plugin', category: 'Actions', action: () => console.log('Install') },
];

export const sampleQuickActions: QuickAction[] = [
  { id: '1', label: 'Search plugins', icon: Search, action: () => {}, shortcut: '⌘P', category: 'Navigation' },
  { id: '2', label: 'Install plugin', icon: Download, action: () => {}, shortcut: '⌘I', category: 'Actions' },
  { id: '3', label: 'Plugin settings', icon: Settings, action: () => {}, category: 'Navigation' },
  { id: '4', label: 'Check for updates', icon: RefreshCw, action: () => {}, category: 'Actions' },
  { id: '5', label: 'Activate all', icon: Power, action: () => {}, category: 'Bulk Actions' },
  { id: '6', label: 'Deactivate all', icon: PowerOff, action: () => {}, category: 'Bulk Actions' },
];

export const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Plugin installed successfully',
    message: 'RustPress SEO has been installed and activated.',
    timestamp: Date.now() - 300000,
    read: false,
    action: { label: 'Configure', onClick: () => {} },
  },
  {
    id: '2',
    type: 'warning',
    title: 'Updates available',
    message: '3 plugins have updates available.',
    timestamp: Date.now() - 3600000,
    read: false,
    action: { label: 'Update all', onClick: () => {} },
  },
  {
    id: '3',
    type: 'info',
    title: 'New plugin released',
    message: 'Check out the new Analytics Pro plugin.',
    timestamp: Date.now() - 86400000,
    read: true,
  },
];

export const sampleOnboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Welcome to RustPress Plugins',
    description: 'Extend your site with powerful plugins built for performance. Let us show you around.',
  },
  {
    id: '2',
    title: 'Browse the Gallery',
    description: 'Discover hundreds of plugins organized by category. Find exactly what you need.',
    action: { label: 'Browse gallery', onClick: () => {} },
  },
  {
    id: '3',
    title: 'Configure Your Plugins',
    description: 'Each plugin comes with its own settings. Customize them to fit your needs.',
  },
  {
    id: '4',
    title: 'You\'re All Set!',
    description: 'Start exploring and building your perfect site. Need help? Check out our documentation.',
  },
];

export const sampleHelpTips: HelpTip[] = [
  {
    id: '1',
    title: 'Getting started with plugins',
    content: 'Plugins extend the functionality of your RustPress site. Browse the gallery to find plugins that match your needs, then install them with a single click.',
    category: 'Getting Started',
    icon: Rocket,
    link: '#',
  },
  {
    id: '2',
    title: 'Managing plugin updates',
    content: 'Keep your plugins up to date for the best performance and security. You can enable auto-updates or manually update from the Updates tab.',
    category: 'Features',
    icon: RefreshCw,
    link: '#',
  },
  {
    id: '3',
    title: 'Troubleshooting conflicts',
    content: 'If you experience issues after installing a plugin, try deactivating it to see if the problem resolves. You can also enable Safe Mode to disable all third-party plugins.',
    category: 'Troubleshooting',
    icon: Shield,
  },
];

export default KeyboardShortcutsProvider;
