/**
 * RustPress Auto-Save Form Component
 * Form with automatic periodic saving and status indicators
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Check,
  AlertCircle,
  Loader2,
  Cloud,
  CloudOff,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export interface AutoSaveFormProps<T extends Record<string, unknown>> {
  initialValues: T;
  onSave: (values: T) => Promise<void>;
  saveInterval?: number;
  debounceMs?: number;
  children: React.ReactNode | ((context: AutoSaveContextType<T>) => React.ReactNode);
  showStatusIndicator?: boolean;
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  enableOfflineSupport?: boolean;
  localStorageKey?: string;
  onError?: (error: Error) => void;
  onStatusChange?: (status: SaveStatus) => void;
  className?: string;
}

export interface AutoSaveContextType<T> {
  values: T;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
  saveNow: () => Promise<void>;
  status: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;
  errors: Map<keyof T, string>;
  setFieldError: (field: keyof T, error: string | null) => void;
  clearErrors: () => void;
}

const AutoSaveContext = createContext<AutoSaveContextType<Record<string, unknown>> | null>(null);

export function useAutoSave<T extends Record<string, unknown>>() {
  const context = useContext(AutoSaveContext);
  if (!context) {
    throw new Error('useAutoSave must be used within an AutoSaveForm');
  }
  return context as AutoSaveContextType<T>;
}

// ============================================================================
// Status Indicator Component
// ============================================================================

interface StatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;
  onRetry?: () => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
}

function StatusIndicator({
  status,
  lastSaved,
  isDirty,
  onRetry,
  position,
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-primary-600 dark:text-primary-400',
          bg: 'bg-primary-50 dark:bg-primary-900/20',
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: lastSaved
            ? `Saved ${formatTimeAgo(lastSaved)}`
            : 'Saved',
          color: 'text-success-600 dark:text-success-400',
          bg: 'bg-success-50 dark:bg-success-900/20',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          color: 'text-error-600 dark:text-error-400',
          bg: 'bg-error-50 dark:bg-error-900/20',
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-4 h-4" />,
          text: 'Offline - saved locally',
          color: 'text-warning-600 dark:text-warning-400',
          bg: 'bg-warning-50 dark:bg-warning-900/20',
        };
      default:
        if (isDirty) {
          return {
            icon: <Cloud className="w-4 h-4" />,
            text: 'Unsaved changes',
            color: 'text-neutral-500 dark:text-neutral-400',
            bg: 'bg-neutral-100 dark:bg-neutral-800',
          };
        }
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config) return null;

  const positionClasses = {
    'top-right': 'absolute top-4 right-4',
    'top-left': 'absolute top-4 left-4',
    'bottom-right': 'absolute bottom-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    inline: '',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          config.color,
          config.bg,
          positionClasses[position],
          position !== 'inline' && 'z-10'
        )}
      >
        {config.icon}
        <span>{config.text}</span>
        {status === 'error' && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 p-0.5 hover:bg-error-100 dark:hover:bg-error-800 rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Auto-Save Form Field Components
// ============================================================================

interface AutoSaveFieldProps {
  name: string;
  children: React.ReactElement;
}

export function AutoSaveField({ name, children }: AutoSaveFieldProps) {
  const { values, setFieldValue, errors } = useAutoSave();
  const value = values[name];
  const error = errors.get(name);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setFieldValue(name, newValue);
    },
    [name, setFieldValue]
  );

  return (
    <div className="relative">
      {React.cloneElement(children, {
        value: value ?? '',
        onChange: handleChange,
        'aria-invalid': !!error,
        className: cn(
          children.props.className,
          error && 'border-error-500 focus:ring-error-500'
        ),
      })}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Main Auto-Save Form Component
// ============================================================================

export function AutoSaveForm<T extends Record<string, unknown>>({
  initialValues,
  onSave,
  saveInterval = 30000,
  debounceMs = 1000,
  children,
  showStatusIndicator = true,
  statusPosition = 'top-right',
  enableOfflineSupport = true,
  localStorageKey,
  onError,
  onStatusChange,
  className,
}: AutoSaveFormProps<T>) {
  const [values, setValuesState] = useState<T>(() => {
    // Try to restore from localStorage if available
    if (enableOfflineSupport && localStorageKey) {
      try {
        const stored = localStorage.getItem(localStorageKey);
        if (stored) {
          return JSON.parse(stored) as T;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return initialValues;
  });

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Map<keyof T, string>>(new Map());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const initialValuesRef = useRef(initialValues);
  const debounceTimerRef = useRef<number | null>(null);
  const intervalTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<T | null>(null);

  // Track if form is dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  }, [values]);

  // Update status callback
  const updateStatus = useCallback(
    (newStatus: SaveStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  // Save to localStorage
  const saveToLocalStorage = useCallback(
    (data: T) => {
      if (enableOfflineSupport && localStorageKey) {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(data));
        } catch {
          // Storage full or disabled
        }
      }
    },
    [enableOfflineSupport, localStorageKey]
  );

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    if (localStorageKey) {
      try {
        localStorage.removeItem(localStorageKey);
      } catch {
        // Ignore errors
      }
    }
  }, [localStorageKey]);

  // Perform save
  const performSave = useCallback(
    async (data: T) => {
      if (!isOnline) {
        updateStatus('offline');
        saveToLocalStorage(data);
        return;
      }

      try {
        updateStatus('saving');
        await onSave(data);
        updateStatus('saved');
        setLastSaved(new Date());
        clearLocalStorage();
        initialValuesRef.current = data;
      } catch (error) {
        updateStatus('error');
        saveToLocalStorage(data);
        if (error instanceof Error) {
          onError?.(error);
        }
      }
    },
    [isOnline, onSave, updateStatus, saveToLocalStorage, clearLocalStorage, onError]
  );

  // Debounced save
  const debouncedSave = useCallback(
    (data: T) => {
      pendingSaveRef.current = data;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        if (pendingSaveRef.current) {
          performSave(pendingSaveRef.current);
          pendingSaveRef.current = null;
        }
      }, debounceMs);
    },
    [debounceMs, performSave]
  );

  // Manual save
  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await performSave(values);
  }, [values, performSave]);

  // Set field value
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => {
        const next = { ...prev, [field]: value };
        debouncedSave(next);
        return next;
      });
      // Clear error for this field
      setErrors((prev) => {
        const next = new Map(prev);
        next.delete(field);
        return next;
      });
    },
    [debouncedSave]
  );

  // Set multiple values
  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState((prev) => {
        const next = { ...prev, ...newValues };
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrors(new Map());
    updateStatus('idle');
    clearLocalStorage();
  }, [clearLocalStorage, updateStatus]);

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors((prev) => {
      const next = new Map(prev);
      if (error) {
        next.set(field, error);
      } else {
        next.delete(field);
      }
      return next;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  // Online/offline handling
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Try to save pending changes when back online
      if (pendingSaveRef.current || isDirty) {
        performSave(values);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDirty, values, performSave, updateStatus]);

  // Periodic save interval
  useEffect(() => {
    if (saveInterval > 0) {
      intervalTimerRef.current = window.setInterval(() => {
        if (isDirty && pendingSaveRef.current === null) {
          performSave(values);
        }
      }, saveInterval);

      return () => {
        if (intervalTimerRef.current) {
          clearInterval(intervalTimerRef.current);
        }
      };
    }
  }, [saveInterval, isDirty, values, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
      // Save any pending changes
      if (pendingSaveRef.current) {
        saveToLocalStorage(pendingSaveRef.current);
      }
    };
  }, [saveToLocalStorage]);

  // Warn before unload if dirty
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

  const contextValue = useMemo(
    () => ({
      values,
      setFieldValue,
      setValues,
      resetForm,
      saveNow,
      status,
      lastSaved,
      isDirty,
      errors,
      setFieldError,
      clearErrors,
    }),
    [
      values,
      setFieldValue,
      setValues,
      resetForm,
      saveNow,
      status,
      lastSaved,
      isDirty,
      errors,
      setFieldError,
      clearErrors,
    ]
  );

  return (
    <AutoSaveContext.Provider value={contextValue as AutoSaveContextType<Record<string, unknown>>}>
      <div className={cn('relative', className)}>
        {showStatusIndicator && statusPosition !== 'inline' && (
          <StatusIndicator
            status={status}
            lastSaved={lastSaved}
            isDirty={isDirty}
            onRetry={saveNow}
            position={statusPosition}
          />
        )}

        {typeof children === 'function' ? children(contextValue) : children}
      </div>
    </AutoSaveContext.Provider>
  );
}

// ============================================================================
// Inline Status Indicator (for use within forms)
// ============================================================================

export function AutoSaveStatus() {
  const { status, lastSaved, isDirty, saveNow } = useAutoSave();

  return (
    <StatusIndicator
      status={status}
      lastSaved={lastSaved}
      isDirty={isDirty}
      onRetry={saveNow}
      position="inline"
    />
  );
}

// ============================================================================
// Save Button (manual save trigger)
// ============================================================================

export interface AutoSaveButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function AutoSaveButton({ className, children }: AutoSaveButtonProps) {
  const { saveNow, status, isDirty } = useAutoSave();

  return (
    <button
      type="button"
      onClick={saveNow}
      disabled={status === 'saving' || !isDirty}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
        'bg-primary-600 text-white',
        'hover:bg-primary-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        className
      )}
    >
      {status === 'saving' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {children || 'Save Now'}
    </button>
  );
}

// ============================================================================
// Last Saved Display
// ============================================================================

export function AutoSaveLastSaved({ className }: { className?: string }) {
  const { lastSaved } = useAutoSave();
  const [, forceUpdate] = useState({});

  // Update display every minute
  useEffect(() => {
    const timer = setInterval(() => forceUpdate({}), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!lastSaved) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400',
        className
      )}
    >
      <Clock className="w-4 h-4" />
      Last saved {formatTimeAgo(lastSaved)}
    </span>
  );
}

export default AutoSaveForm;
