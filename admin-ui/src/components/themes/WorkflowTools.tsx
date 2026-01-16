import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo2,
  Redo2,
  Save,
  History,
  Clock,
  Keyboard,
  Command,
  Zap,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Copy,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Type,
  Layout,
  Grid,
  Smartphone,
  Monitor,
  RefreshCw,
  Star,
  Bookmark,
  BookmarkCheck,
  Info,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Columns,
  SplitSquareVertical,
  Maximize,
  Minimize,
  ArrowLeftRight,
  Lightbulb,
  MousePointer,
  Target,
  Sparkles,
  Wand2,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  FileText,
  Share2,
  ExternalLink,
  Lock,
  Unlock,
  Loader2,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

interface HistoryEntry<T> {
  id: string;
  timestamp: number;
  label: string;
  state: T;
  type: 'manual' | 'auto';
}

interface ShortcutAction {
  id: string;
  label: string;
  description: string;
  keys: string[];
  category: string;
  action: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.FC<any>;
  action: () => void;
  color?: string;
  shortcut?: string;
}

interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface TooltipData {
  id: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface ThemeForComparison {
  id: string;
  name: string;
  thumbnail: string;
  colors: Record<string, string>;
  typography: Record<string, any>;
  features: string[];
}

interface WorkflowContextType {
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushState: <T>(label: string, state: T) => void;

  // Auto-save
  isSaving: boolean;
  lastSaved: Date | null;
  versions: HistoryEntry<any>[];
  saveNow: () => void;
  restoreVersion: (id: string) => void;

  // Shortcuts
  shortcuts: ShortcutAction[];
  registerShortcut: (shortcut: ShortcutAction) => void;

  // Quick Actions
  quickActions: QuickAction[];

  // Onboarding
  isOnboarding: boolean;
  currentStep: number;
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;

  // Tooltips
  showTooltip: (id: string, content: string, position?: 'top' | 'bottom' | 'left' | 'right') => void;
  hideTooltip: (id: string) => void;
}

// ============================================
// WORKFLOW CONTEXT
// ============================================

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

// ============================================
// ENHANCEMENT 45: UNDO/REDO SYSTEM
// ============================================

interface UndoRedoProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyLength: number;
  currentIndex: number;
}

const UndoRedoControls: React.FC<UndoRedoProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyLength,
  currentIndex,
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={clsx(
          'p-2 rounded-md transition-all flex items-center gap-1',
          canUndo
            ? 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        )}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Undo</span>
      </button>

      <div className="px-2 text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
        {currentIndex + 1}/{historyLength}
      </div>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={clsx(
          'p-2 rounded-md transition-all flex items-center gap-1',
          canRedo
            ? 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        )}
        title="Redo (Ctrl+Y)"
      >
        <span className="text-xs hidden sm:inline">Redo</span>
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Hook for managing undo/redo history
export function useUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    {
      id: Date.now().toString(),
      timestamp: Date.now(),
      label: 'Initial state',
      state: initialState,
      type: 'auto',
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentState = history[currentIndex]?.state ?? initialState;

  const pushState = useCallback((label: string, state: T, type: 'manual' | 'auto' = 'manual') => {
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);

      // Add the new state
      const entry: HistoryEntry<T> = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label,
        state,
        type,
      };

      newHistory.push(entry);

      // Trim history if it exceeds max
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }

      return newHistory;
    });
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
      toast.success('Undone: ' + history[currentIndex - 1]?.label);
    }
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
      toast.success('Redone: ' + history[currentIndex + 1]?.label);
    }
  }, [canRedo, currentIndex, history]);

  const reset = useCallback(() => {
    setHistory([history[0]]);
    setCurrentIndex(0);
  }, [history]);

  return {
    state: currentState,
    history,
    currentIndex,
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    reset,
  };
}

// ============================================
// ENHANCEMENT 46: AUTO-SAVE WITH VERSION HISTORY
// ============================================

interface AutoSaveProps {
  isSaving: boolean;
  lastSaved: Date | null;
  versions: HistoryEntry<any>[];
  onSaveNow: () => void;
  onRestoreVersion: (id: string) => void;
  onDeleteVersion: (id: string) => void;
}

const AutoSaveIndicator: React.FC<{ isSaving: boolean; lastSaved: Date | null }> = ({
  isSaving,
  lastSaved,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {isSaving ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-4 h-4 text-blue-500" />
        </motion.div>
      ) : (
        <CheckCircle className="w-4 h-4 text-green-500" />
      )}
      <span className="text-gray-500 dark:text-gray-400">
        {isSaving ? 'Saving...' : lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Not saved'}
      </span>
    </div>
  );
};

const VersionHistoryPanel: React.FC<AutoSaveProps> = ({
  isSaving,
  lastSaved,
  versions,
  onSaveNow,
  onRestoreVersion,
  onDeleteVersion,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <History className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700 dark:text-gray-300">History</span>
        <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
          {versions.length}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Version History
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {versions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No versions yet</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {versions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={clsx(
                        'p-3 rounded-lg cursor-pointer transition-colors group',
                        selectedVersion === version.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                      onClick={() => setSelectedVersion(version.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {version.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(version.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {version.type === 'auto' && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                              Auto
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreVersion(version.id);
                              toast.success('Version restored');
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVersion(version.id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Delete this version"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onSaveNow();
                  toast.success('Version saved');
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Current Version
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ENHANCEMENT 47: KEYBOARD SHORTCUTS
// ============================================

interface KeyboardShortcutsProps {
  shortcuts: ShortcutAction[];
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsProps> = ({
  shortcuts,
  isOpen,
  onClose,
}) => {
  const categories = useMemo(() => {
    const cats = new Map<string, ShortcutAction[]>();
    shortcuts.forEach(s => {
      if (!cats.has(s.category)) {
        cats.set(s.category, []);
      }
      cats.get(s.category)!.push(s);
    });
    return cats;
  }, [shortcuts]);

  const renderKey = (key: string) => {
    const keyMap: Record<string, string> = {
      'ctrl': '⌃',
      'alt': '⌥',
      'shift': '⇧',
      'cmd': '⌘',
      'enter': '↵',
      'esc': 'Esc',
      'space': '␣',
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→',
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Keyboard className="w-6 h-6 text-blue-600" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {Array.from(categories.entries()).map(([category, actions]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {actions.map(action => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {action.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {action.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {action.keys.map((key, i) => (
                              <React.Fragment key={i}>
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                                  {renderKey(key)}
                                </kbd>
                                {i < action.keys.length - 1 && (
                                  <span className="text-gray-400 text-xs">+</span>
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

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">?</kbd> anytime to show this menu
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map(k => k.toLowerCase());
        const pressedKeys: string[] = [];

        if (e.ctrlKey || e.metaKey) pressedKeys.push('ctrl');
        if (e.altKey) pressedKeys.push('alt');
        if (e.shiftKey) pressedKeys.push('shift');
        pressedKeys.push(e.key.toLowerCase());

        if (
          keys.length === pressedKeys.length &&
          keys.every(k => pressedKeys.includes(k))
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// ============================================
// ENHANCEMENT 48: QUICK ACTIONS TOOLBAR
// ============================================

interface QuickActionsToolbarProps {
  actions: QuickAction[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  isExpanded?: boolean;
  onToggle?: () => void;
}

const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  actions,
  position = 'right',
  isExpanded = true,
  onToggle,
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2 flex-row',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-row',
    left: 'left-4 top-1/2 -translate-y-1/2 flex-col',
    right: 'right-4 top-1/2 -translate-y-1/2 flex-col',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'fixed z-40 flex gap-1 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700',
        positionClasses[position]
      )}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        const isHovered = hoveredAction === action.id;

        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={action.action}
            className={clsx(
              'relative p-3 rounded-xl transition-all',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              action.color || 'text-gray-600 dark:text-gray-400'
            )}
            title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
          >
            <Icon className="w-5 h-5" />

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={clsx(
                    'absolute whitespace-nowrap bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg',
                    position === 'right' && 'right-full mr-2 top-1/2 -translate-y-1/2',
                    position === 'left' && 'left-full ml-2 top-1/2 -translate-y-1/2',
                    position === 'top' && 'top-full mt-2 left-1/2 -translate-x-1/2',
                    position === 'bottom' && 'bottom-full mb-2 left-1/2 -translate-x-1/2'
                  )}
                >
                  {action.label}
                  {action.shortcut && (
                    <span className="ml-2 text-gray-400">{action.shortcut}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}

      {onToggle && (
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

// ============================================
// ENHANCEMENT 49: ONBOARDING/TOOLTIPS SYSTEM
// ============================================

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  currentStep: number;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  steps,
  currentStep,
  isActive,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}) => {
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  if (!isActive || !step) return null;

  const positionClasses = {
    top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
    left: 'right-full mr-4 top-1/2 -translate-y-1/2',
    right: 'left-full ml-4 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white dark:border-t-gray-800',
    bottom: 'top-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white dark:border-b-gray-800',
    left: 'right-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white dark:border-l-gray-800',
    right: 'left-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white dark:border-r-gray-800',
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onSkip}
      />

      {/* Tooltip */}
      <motion.div
        key={step.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={clsx(
          'fixed z-[60] w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden',
          // Position would be calculated based on target element
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
      >
        {/* Progress */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {step.content}
          </p>

          {step.action && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {step.action}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={isLastStep ? onComplete : onNext}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                {isLastStep ? (
                  <>
                    Finish
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Contextual Tooltip component
interface ContextualTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  showIcon?: boolean;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  content,
  position = 'top',
  children,
  showIcon = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      {children}
      {showIcon && (
        <button
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onClick={() => setIsVisible(!isVisible)}
          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={clsx(
              'absolute z-50 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg',
              positionClasses[position]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ENHANCEMENT 50: THEME COMPARISON MODE
// ============================================

interface ThemeComparisonProps {
  themes: ThemeForComparison[];
  selectedThemes: [string, string];
  onSelectTheme: (position: 0 | 1, themeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ThemeComparisonMode: React.FC<ThemeComparisonProps> = ({
  themes,
  selectedThemes,
  onSelectTheme,
  isOpen,
  onClose,
}) => {
  const [syncScroll, setSyncScroll] = useState(true);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const theme1 = themes.find(t => t.id === selectedThemes[0]);
  const theme2 = themes.find(t => t.id === selectedThemes[1]);

  // Sync scroll between panels
  useEffect(() => {
    if (!syncScroll) return;

    const handleScroll = (source: 'left' | 'right') => (e: Event) => {
      const target = e.target as HTMLDivElement;
      const other = source === 'left' ? rightRef.current : leftRef.current;
      if (other) {
        other.scrollTop = target.scrollTop;
      }
    };

    const leftEl = leftRef.current;
    const rightEl = rightRef.current;

    if (leftEl && rightEl) {
      leftEl.addEventListener('scroll', handleScroll('left'));
      rightEl.addEventListener('scroll', handleScroll('right'));

      return () => {
        leftEl.removeEventListener('scroll', handleScroll('left'));
        rightEl.removeEventListener('scroll', handleScroll('right'));
      };
    }
  }, [syncScroll]);

  const renderColorPalette = (colors: Record<string, string>) => (
    <div className="flex flex-wrap gap-2">
      {Object.entries(colors).map(([name, color]) => (
        <div key={name} className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-500 mt-1 capitalize">{name}</span>
        </div>
      ))}
    </div>
  );

  const renderFeatureComparison = () => {
    if (!theme1 || !theme2) return null;

    const allFeatures = new Set([...theme1.features, ...theme2.features]);

    return (
      <div className="space-y-2">
        {Array.from(allFeatures).map(feature => {
          const hasTheme1 = theme1.features.includes(feature);
          const hasTheme2 = theme2.features.includes(feature);

          return (
            <div key={feature} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-1/3">
                {hasTheme1 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 text-center">
                {feature}
              </span>
              <div className="w-1/3 text-right">
                {hasTheme2 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                ) : (
                  <X className="w-4 h-4 text-gray-300 ml-auto" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <SplitSquareVertical className="w-6 h-6 text-blue-600" />
                Compare Themes
              </h2>
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={clsx(
                      'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                      viewMode === 'side-by-side'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500'
                    )}
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('overlay')}
                    className={clsx(
                      'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                      viewMode === 'overlay'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500'
                    )}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>

                {/* Sync Scroll Toggle */}
                <button
                  onClick={() => setSyncScroll(!syncScroll)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    syncScroll
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  )}
                >
                  {syncScroll ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  Sync scroll
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Theme Selectors */}
            <div className="grid grid-cols-2 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
              {[0, 1].map((pos) => (
                <div key={pos}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme {pos + 1}
                  </label>
                  <select
                    value={selectedThemes[pos as 0 | 1]}
                    onChange={(e) => onSelectTheme(pos as 0 | 1, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  >
                    <option value="">Select a theme...</option>
                    {themes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Comparison Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'side-by-side' ? (
                <div className="grid grid-cols-2 h-full divide-x divide-gray-200 dark:divide-gray-700">
                  {[theme1, theme2].map((theme, i) => (
                    <div
                      key={i}
                      ref={i === 0 ? leftRef : rightRef}
                      className="overflow-y-auto p-6"
                    >
                      {theme ? (
                        <div className="space-y-6">
                          {/* Thumbnail */}
                          <div className="rounded-xl overflow-hidden shadow-lg">
                            <img
                              src={theme.thumbnail}
                              alt={theme.name}
                              className="w-full h-48 object-cover"
                            />
                          </div>

                          {/* Name */}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {theme.name}
                          </h3>

                          {/* Colors */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Color Palette</h4>
                            {renderColorPalette(theme.colors)}
                          </div>

                          {/* Typography */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Typography</h4>
                            <div className="space-y-2">
                              {Object.entries(theme.typography).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-500 capitalize">{key}</span>
                                  <span className="text-gray-900 dark:text-white">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Features */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {theme.features.map(feature => (
                                <span
                                  key={feature}
                                  className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Select a theme to compare</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative h-full p-6">
                  {/* Overlay Mode */}
                  <div className="relative rounded-xl overflow-hidden shadow-lg h-full">
                    {theme1 && (
                      <img
                        src={theme1.thumbnail}
                        alt={theme1.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    {theme2 && (
                      <img
                        src={theme2.thumbnail}
                        alt={theme2.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: overlayOpacity / 100 }}
                      />
                    )}
                  </div>

                  {/* Opacity Slider */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg flex items-center gap-3">
                    <span className="text-sm text-gray-500">{theme1?.name || 'Theme 1'}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">{theme2?.name || 'Theme 2'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Comparison Table */}
            {theme1 && theme2 && viewMode === 'side-by-side' && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Feature Comparison
                </h4>
                {renderFeatureComparison()}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MAIN WORKFLOW TOOLS COMPONENT
// ============================================

interface WorkflowToolsProps {
  children: React.ReactNode;
  initialState?: any;
  onStateChange?: (state: any) => void;
  themes?: ThemeForComparison[];
}

const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '.theme-gallery',
    title: 'Welcome to Theme Customizer',
    content: 'This is your central hub for customizing your site\'s appearance. Let\'s take a quick tour!',
    position: 'bottom',
  },
  {
    id: 'gallery',
    target: '.theme-gallery',
    title: 'Theme Gallery',
    content: 'Browse and install beautiful themes. Use filters to find the perfect match for your site.',
    position: 'right',
    action: 'Click on any theme to see its details',
  },
  {
    id: 'preview',
    target: '.preview-button',
    title: 'Live Preview',
    content: 'Preview themes in real-time before activating them. Test on different devices too!',
    position: 'bottom',
    action: 'Click the Preview button on any theme',
  },
  {
    id: 'customizer',
    target: '.customizer-buttons',
    title: 'Theme Customization',
    content: 'Fine-tune colors, typography, and layout to match your brand perfectly.',
    position: 'bottom',
    action: 'Try the Colors, Typography, or Layout buttons',
  },
  {
    id: 'shortcuts',
    target: '.shortcuts-button',
    title: 'Keyboard Shortcuts',
    content: 'Power users love shortcuts! Press ? anytime to see all available keyboard shortcuts.',
    position: 'left',
  },
  {
    id: 'history',
    target: '.history-button',
    title: 'Version History',
    content: 'Every change is saved. You can restore any previous version with a single click.',
    position: 'left',
  },
];

const defaultShortcuts: ShortcutAction[] = [
  { id: 'undo', label: 'Undo', description: 'Undo the last change', keys: ['ctrl', 'z'], category: 'General', action: () => {} },
  { id: 'redo', label: 'Redo', description: 'Redo the last undone change', keys: ['ctrl', 'y'], category: 'General', action: () => {} },
  { id: 'save', label: 'Save', description: 'Save current state', keys: ['ctrl', 's'], category: 'General', action: () => {} },
  { id: 'preview', label: 'Toggle Preview', description: 'Show/hide preview panel', keys: ['ctrl', 'p'], category: 'View', action: () => {} },
  { id: 'colors', label: 'Open Colors', description: 'Open color customizer', keys: ['ctrl', 'shift', 'c'], category: 'Customization', action: () => {} },
  { id: 'typography', label: 'Open Typography', description: 'Open typography customizer', keys: ['ctrl', 'shift', 't'], category: 'Customization', action: () => {} },
  { id: 'layout', label: 'Open Layout', description: 'Open layout builder', keys: ['ctrl', 'shift', 'l'], category: 'Customization', action: () => {} },
  { id: 'help', label: 'Show Shortcuts', description: 'Show this shortcuts modal', keys: ['?'], category: 'Help', action: () => {} },
  { id: 'escape', label: 'Close Modal', description: 'Close any open modal', keys: ['esc'], category: 'Navigation', action: () => {} },
];

const WorkflowTools: React.FC<WorkflowToolsProps> = ({
  children,
  initialState = {},
  onStateChange,
  themes = [],
}) => {
  // Undo/Redo state
  const {
    state: currentState,
    history,
    currentIndex,
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
  } = useUndoRedo(initialState);

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [versions, setVersions] = useState<HistoryEntry<any>[]>([]);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Shortcuts state
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutAction[]>(defaultShortcuts);

  // Onboarding state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-onboarding-complete') === 'true';
    }
    return false;
  });

  // Comparison state
  const [showComparison, setShowComparison] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<[string, string]>(['', '']);

  // Quick actions
  const quickActions: QuickAction[] = [
    { id: 'undo', label: 'Undo', icon: Undo2, action: undo, shortcut: '⌃Z', color: canUndo ? 'text-gray-600' : 'text-gray-300' },
    { id: 'redo', label: 'Redo', icon: Redo2, action: redo, shortcut: '⌃Y', color: canRedo ? 'text-gray-600' : 'text-gray-300' },
    { id: 'save', label: 'Save', icon: Save, action: () => saveNow(), shortcut: '⌃S', color: 'text-blue-600' },
    { id: 'colors', label: 'Colors', icon: Palette, action: () => toast('Open Colors'), color: 'text-pink-600' },
    { id: 'typography', label: 'Typography', icon: Type, action: () => toast('Open Typography'), color: 'text-purple-600' },
    { id: 'layout', label: 'Layout', icon: Layout, action: () => toast('Open Layout'), color: 'text-cyan-600' },
    { id: 'compare', label: 'Compare', icon: SplitSquareVertical, action: () => setShowComparison(true), color: 'text-green-600' },
    { id: 'help', label: 'Shortcuts', icon: Keyboard, action: () => setShowShortcuts(true), shortcut: '?' },
  ];

  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      autoSave();
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [currentState]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(currentState);
  }, [currentState, onStateChange]);

  const autoSave = useCallback(() => {
    setIsSaving(true);

    // Simulate save delay
    setTimeout(() => {
      const entry: HistoryEntry<any> = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: 'Auto-save',
        state: currentState,
        type: 'auto',
      };
      setVersions(prev => [entry, ...prev].slice(0, 20)); // Keep last 20 versions
      setLastSaved(new Date());
      setIsSaving(false);
    }, 500);
  }, [currentState]);

  const saveNow = useCallback(() => {
    setIsSaving(true);

    setTimeout(() => {
      const entry: HistoryEntry<any> = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: 'Manual save',
        state: currentState,
        type: 'manual',
      };
      setVersions(prev => [entry, ...prev].slice(0, 20));
      setLastSaved(new Date());
      setIsSaving(false);
      toast.success('Saved!');
    }, 300);
  }, [currentState]);

  const restoreVersion = useCallback((id: string) => {
    const version = versions.find(v => v.id === id);
    if (version) {
      pushState(`Restored: ${version.label}`, version.state);
    }
  }, [versions, pushState]);

  const deleteVersion = useCallback((id: string) => {
    setVersions(prev => prev.filter(v => v.id !== id));
    toast.success('Version deleted');
  }, []);

  // Register shortcuts with actions
  useEffect(() => {
    const updatedShortcuts = shortcuts.map(s => {
      switch (s.id) {
        case 'undo': return { ...s, action: undo };
        case 'redo': return { ...s, action: redo };
        case 'save': return { ...s, action: saveNow };
        case 'help': return { ...s, action: () => setShowShortcuts(true) };
        case 'escape': return { ...s, action: () => setShowShortcuts(false) };
        default: return s;
      }
    });
    setShortcuts(updatedShortcuts);
  }, [undo, redo, saveNow]);

  // Use keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  // Onboarding handlers
  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem('theme-onboarding-complete', 'true');
    setHasSeenOnboarding(true);
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem('theme-onboarding-complete', 'true');
    setHasSeenOnboarding(true);
    toast.success('Tour complete! You\'re ready to go.');
  };

  const nextStep = () => {
    if (currentStep < defaultOnboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Show onboarding on first visit
  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setIsOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  return (
    <div className="relative">
      {/* Toolbar Header */}
      <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <UndoRedoControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            historyLength={history.length}
            currentIndex={currentIndex}
          />

          {/* Auto-save Status */}
          <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={() => saveNow()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Save</span>
          </button>

          {/* Version History */}
          <div className="history-button">
            <VersionHistoryPanel
              isSaving={isSaving}
              lastSaved={lastSaved}
              versions={versions}
              onSaveNow={saveNow}
              onRestoreVersion={restoreVersion}
              onDeleteVersion={deleteVersion}
            />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          {/* Colors Button */}
          <button
            onClick={() => toast('Open Colors from main panel')}
            className="flex items-center gap-2 px-3 py-2 bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 text-pink-600 rounded-lg transition-colors"
            title="Colors"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Colors</span>
          </button>

          {/* Typography Button */}
          <button
            onClick={() => toast('Open Typography from main panel')}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 rounded-lg transition-colors"
            title="Typography"
          >
            <Type className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Typography</span>
          </button>

          {/* Layout Button */}
          <button
            onClick={() => toast('Open Layout from main panel')}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 text-cyan-600 rounded-lg transition-colors"
            title="Layout"
          >
            <Layout className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Layout</span>
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          {/* Compare Button */}
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 rounded-lg transition-colors"
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">Compare</span>
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="shortcuts-button flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:inline">Shortcuts</span>
          </button>

          {/* Help/Onboarding */}
          <button
            onClick={startOnboarding}
            className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 rounded-lg transition-colors"
            title="Start tour"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        shortcuts={shortcuts}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Theme Comparison Modal */}
      <ThemeComparisonMode
        themes={themes}
        selectedThemes={selectedThemes}
        onSelectTheme={(pos, id) => {
          const newSelection = [...selectedThemes] as [string, string];
          newSelection[pos] = id;
          setSelectedThemes(newSelection);
        }}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {isOnboarding && (
          <OnboardingOverlay
            steps={defaultOnboardingSteps}
            currentStep={currentStep}
            isActive={isOnboarding}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipOnboarding}
            onComplete={completeOnboarding}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowTools;
export {
  UndoRedoControls,
  VersionHistoryPanel,
  AutoSaveIndicator,
  KeyboardShortcutsModal,
  QuickActionsToolbar,
  OnboardingOverlay,
  ThemeComparisonMode,
};
