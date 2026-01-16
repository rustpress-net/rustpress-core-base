/**
 * AutoSaveEditor Component (Post Enhancement #1)
 * Auto-save with version history for content editing
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Clock,
  History,
  Check,
  AlertCircle,
  Loader2,
  RotateCcw,
  ChevronDown,
  Eye,
  Trash2,
  X,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ContentVersion {
  id: string;
  content: string;
  title?: string;
  timestamp: Date;
  type: 'auto' | 'manual' | 'published';
  wordCount: number;
  label?: string;
}

export interface AutoSaveConfig {
  interval: number;
  maxVersions: number;
  debounceMs: number;
  enabled: boolean;
}

export interface AutoSaveEditorProps {
  content: string;
  title?: string;
  onChange: (content: string) => void;
  onSave?: (content: string, type: 'auto' | 'manual') => Promise<void>;
  onRestore?: (version: ContentVersion) => void;
  config?: Partial<AutoSaveConfig>;
  children: React.ReactNode;
  className?: string;
}

export interface AutoSaveStatusProps {
  size?: 'sm' | 'md' | 'lg';
  showLastSaved?: boolean;
  className?: string;
}

export interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: ContentVersion) => void;
  onPreview?: (version: ContentVersion) => void;
  onDelete?: (versionId: string) => void;
  className?: string;
}

export interface VersionListItemProps {
  version: ContentVersion;
  isSelected?: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
}

export interface SaveButtonProps {
  onSave: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  showShortcut?: boolean;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface AutoSaveContextValue {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  versions: ContentVersion[];
  isDirty: boolean;
  save: (type?: 'auto' | 'manual') => Promise<void>;
  restore: (version: ContentVersion) => void;
  config: AutoSaveConfig;
}

const AutoSaveContext = createContext<AutoSaveContextValue | null>(null);

export function useAutoSaveEditor() {
  const context = useContext(AutoSaveContext);
  if (!context) {
    throw new Error('useAutoSaveEditor must be used within AutoSaveEditor');
  }
  return context;
}

// ============================================================================
// Default Config
// ============================================================================

const defaultConfig: AutoSaveConfig = {
  interval: 30000, // 30 seconds
  maxVersions: 50,
  debounceMs: 1000,
  enabled: true,
};

// ============================================================================
// AutoSaveEditor Component
// ============================================================================

export function AutoSaveEditor({
  content,
  title,
  onChange,
  onSave,
  onRestore,
  config: userConfig,
  children,
  className = '',
}: AutoSaveEditorProps) {
  const config = { ...defaultConfig, ...userConfig };

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const lastContentRef = useRef(content);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track content changes
  useEffect(() => {
    if (content !== lastContentRef.current) {
      setIsDirty(true);
      lastContentRef.current = content;

      // Debounced auto-save
      if (config.enabled && saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (config.enabled) {
        saveTimeoutRef.current = setTimeout(() => {
          save('auto');
        }, config.debounceMs);
      }
    }
  }, [content, config.enabled, config.debounceMs]);

  // Periodic auto-save
  useEffect(() => {
    if (config.enabled) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (isDirty) {
          save('auto');
        }
      }, config.interval);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [config.enabled, config.interval, isDirty]);

  // Keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save('manual');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const save = useCallback(async (type: 'auto' | 'manual' = 'auto') => {
    if (!isDirty && type === 'auto') return;

    setStatus('saving');

    try {
      if (onSave) {
        await onSave(content, type);
      }

      // Create version
      const newVersion: ContentVersion = {
        id: `v_${Date.now()}`,
        content,
        title,
        timestamp: new Date(),
        type,
        wordCount: content.split(/\s+/).filter(Boolean).length,
      };

      setVersions((prev) => {
        const updated = [newVersion, ...prev];
        return updated.slice(0, config.maxVersions);
      });

      setLastSaved(new Date());
      setIsDirty(false);
      setStatus('saved');

      // Reset to idle after a moment
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      console.error('Auto-save failed:', error);
    }
  }, [content, title, isDirty, onSave, config.maxVersions]);

  const restore = useCallback((version: ContentVersion) => {
    onChange(version.content);
    onRestore?.(version);
    setIsDirty(true);
  }, [onChange, onRestore]);

  const contextValue: AutoSaveContextValue = {
    status,
    lastSaved,
    versions,
    isDirty,
    save,
    restore,
    config,
  };

  return (
    <AutoSaveContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </AutoSaveContext.Provider>
  );
}

// ============================================================================
// AutoSaveStatus Component
// ============================================================================

export function AutoSaveStatus({
  size = 'md',
  showLastSaved = true,
  className = '',
}: AutoSaveStatusProps) {
  const { status, lastSaved, isDirty } = useAutoSaveEditor();

  const sizeClasses = {
    sm: { icon: 'w-3 h-3', text: 'text-xs' },
    md: { icon: 'w-4 h-4', text: 'text-sm' },
    lg: { icon: 'w-5 h-5', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className={`${sizes.icon} animate-spin`} />,
          text: 'Saving...',
          color: 'text-blue-500',
        };
      case 'saved':
        return {
          icon: <Check className={sizes.icon} />,
          text: 'Saved',
          color: 'text-green-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className={sizes.icon} />,
          text: 'Save failed',
          color: 'text-red-500',
        };
      default:
        if (isDirty) {
          return {
            icon: <Clock className={sizes.icon} />,
            text: 'Unsaved changes',
            color: 'text-yellow-500',
          };
        }
        return {
          icon: <Check className={sizes.icon} />,
          text: lastSaved ? `Saved ${formatTime(lastSaved)}` : 'All changes saved',
          color: 'text-neutral-500',
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className={`inline-flex items-center gap-1.5 ${display.color} ${className}`}>
      {display.icon}
      <span className={sizes.text}>{display.text}</span>
    </div>
  );
}

// ============================================================================
// VersionHistory Component
// ============================================================================

export function VersionHistory({
  isOpen,
  onClose,
  onRestore,
  onPreview,
  onDelete,
  className = '',
}: VersionHistoryProps) {
  const { versions } = useAutoSaveEditor();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const selectedVersion = versions.find((v) => v.id === selectedId);

  const handlePreview = (version: ContentVersion) => {
    setSelectedId(version.id);
    setPreviewContent(version.content);
    onPreview?.(version);
  };

  const handleRestore = (version: ContentVersion) => {
    onRestore(version);
    onClose();
  };

  const groupVersionsByDate = (versions: ContentVersion[]) => {
    const groups: { [key: string]: ContentVersion[] } = {};

    versions.forEach((version) => {
      const date = version.timestamp.toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(version);
    });

    return groups;
  };

  const groupedVersions = groupVersionsByDate(versions);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          relative ml-auto w-full max-w-2xl h-full
          bg-white dark:bg-neutral-900
          border-l border-neutral-200 dark:border-neutral-700
          flex flex-col
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Version History
            </h2>
            <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">
              {versions.length} versions
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Version list */}
          <div className="w-1/2 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
            {Object.entries(groupedVersions).map(([date, dateVersions]) => (
              <div key={date}>
                <div className="sticky top-0 px-4 py-2 text-xs font-medium text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50">
                  {date === new Date().toLocaleDateString() ? 'Today' : date}
                </div>
                {dateVersions.map((version) => (
                  <VersionListItem
                    key={version.id}
                    version={version}
                    isSelected={selectedId === version.id}
                    onSelect={() => handlePreview(version)}
                    onRestore={() => handleRestore(version)}
                    onPreview={() => handlePreview(version)}
                    onDelete={onDelete ? () => onDelete(version.id) : undefined}
                  />
                ))}
              </div>
            ))}

            {versions.length === 0 && (
              <div className="p-8 text-center text-neutral-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No versions yet</p>
                <p className="text-sm">Versions are saved automatically as you edit</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="w-1/2 overflow-y-auto">
            {selectedVersion ? (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {selectedVersion.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {selectedVersion.wordCount} words
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(selectedVersion)}
                    className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Restore this version
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <pre className="whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                    {previewContent}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// VersionListItem Component
// ============================================================================

export function VersionListItem({
  version,
  isSelected,
  onSelect,
  onRestore,
  onPreview,
  onDelete,
}: VersionListItemProps) {
  const getTypeLabel = (type: ContentVersion['type']) => {
    switch (type) {
      case 'auto':
        return { label: 'Auto-saved', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'manual':
        return { label: 'Saved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
      case 'published':
        return { label: 'Published', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    }
  };

  const typeInfo = getTypeLabel(version.type);

  return (
    <div
      onClick={onSelect}
      className={`
        px-4 py-3 cursor-pointer border-b border-neutral-100 dark:border-neutral-800
        hover:bg-neutral-50 dark:hover:bg-neutral-800/50
        ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {version.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={`px-1.5 py-0.5 text-xs rounded ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {version.wordCount} words
            {version.label && ` • ${version.label}`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
            title="Restore"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SaveButton Component
// ============================================================================

export function SaveButton({
  onSave,
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  showShortcut = true,
  className = '',
}: SaveButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600',
    ghost: 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
  };

  return (
    <motion.button
      onClick={onSave}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      <span>Save</span>
      {showShortcut && (
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-black/10 dark:bg-white/10 rounded">
          ⌘S
        </kbd>
      )}
    </motion.button>
  );
}

// ============================================================================
// VersionDropdown Component
// ============================================================================

export interface VersionDropdownProps {
  onOpenHistory: () => void;
  className?: string;
}

export function VersionDropdown({ onOpenHistory, className = '' }: VersionDropdownProps) {
  const { versions, restore } = useAutoSaveEditor();
  const [isOpen, setIsOpen] = useState(false);

  const recentVersions = versions.slice(0, 5);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
      >
        <History className="w-4 h-4" />
        <span>Versions</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
          >
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 uppercase">Recent Versions</p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {recentVersions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => {
                    restore(version);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <p className="text-sm text-neutral-900 dark:text-white">
                    {version.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {version.wordCount} words • {version.type}
                  </p>
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenHistory();
                }}
                className="w-full px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
              >
                View all versions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// UnsavedChangesWarning Component
// ============================================================================

export interface UnsavedChangesWarningProps {
  className?: string;
}

export function UnsavedChangesWarning({ className = '' }: UnsavedChangesWarningProps) {
  const { isDirty, save } = useAutoSaveEditor();

  if (!isDirty) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        flex items-center gap-3 px-4 py-2
        bg-yellow-50 dark:bg-yellow-900/20
        border border-yellow-200 dark:border-yellow-800
        rounded-lg
        ${className}
      `}
    >
      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      <span className="text-sm text-yellow-800 dark:text-yellow-200">
        You have unsaved changes
      </span>
      <button
        onClick={() => save('manual')}
        className="ml-auto text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
      >
        Save now
      </button>
    </motion.div>
  );
}

export default AutoSaveEditor;
