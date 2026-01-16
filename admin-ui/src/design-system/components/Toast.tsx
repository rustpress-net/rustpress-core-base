/**
 * RustPress Toast/Notification System
 * Beautiful toast notifications with animations
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '../utils';
import { toastSlideIn } from '../animations';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface ToastState {
  toasts: Toast[];
  position: ToastPosition;
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'UPDATE_TOAST'; payload: Partial<Toast> & { id: string } }
  | { type: 'SET_POSITION'; payload: ToastPosition };

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case 'SET_POSITION':
      return {
        ...state,
        position: action.payload,
      };
    default:
      return state;
  }
};

// Context
interface ToastContextValue {
  toasts: Toast[];
  position: ToastPosition;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  setPosition: (position: ToastPosition) => void;
  // Convenience methods
  success: (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) => string;
  error: (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) => string;
  warning: (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) => string;
  info: (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) => string;
  loading: (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Provider
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position: initialPosition = 'bottom-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, {
    toasts: [],
    position: initialPosition,
  });

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newToast: Toast = {
        id,
        duration: toast.type === 'loading' ? Infinity : 5000,
        dismissible: true,
        ...toast,
      };

      dispatch({ type: 'ADD_TOAST', payload: newToast });

      // Auto dismiss
      if (newToast.duration && newToast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      // Limit max toasts
      if (state.toasts.length >= maxToasts) {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
      }

      return id;
    },
    [state.toasts.length, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    dispatch({ type: 'UPDATE_TOAST', payload: { id, ...updates } });
  }, []);

  const setPosition = useCallback((position: ToastPosition) => {
    dispatch({ type: 'SET_POSITION', payload: position });
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) =>
      addToast({ type: 'success', title, ...options }),
    [addToast]
  );

  const error = useCallback(
    (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) =>
      addToast({ type: 'error', title, duration: 7000, ...options }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) =>
      addToast({ type: 'warning', title, ...options }),
    [addToast]
  );

  const info = useCallback(
    (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) =>
      addToast({ type: 'info', title, ...options }),
    [addToast]
  );

  const loading = useCallback(
    (title: string, options?: Partial<Omit<Toast, 'type' | 'title'>>) =>
      addToast({ type: 'loading', title, dismissible: false, ...options }),
    [addToast]
  );

  const promise = useCallback(
    async <T,>(
      promiseOrFn: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ): Promise<T> => {
      const id = loading(messages.loading);

      try {
        const result = await promiseOrFn;
        updateToast(id, {
          type: 'success',
          title:
            typeof messages.success === 'function'
              ? messages.success(result)
              : messages.success,
          dismissible: true,
          duration: 5000,
        });

        // Auto dismiss
        setTimeout(() => removeToast(id), 5000);

        return result;
      } catch (err) {
        updateToast(id, {
          type: 'error',
          title:
            typeof messages.error === 'function'
              ? messages.error(err as Error)
              : messages.error,
          dismissible: true,
          duration: 7000,
        });

        // Auto dismiss
        setTimeout(() => removeToast(id), 7000);

        throw err;
      }
    },
    [loading, updateToast, removeToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts: state.toasts,
        position: state.position,
        addToast,
        removeToast,
        updateToast,
        setPosition,
        success,
        error,
        warning,
        info,
        loading,
        promise,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Toast container
function ToastContainer() {
  const { toasts, position, removeToast } = useToast();

  const positionStyles: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const isTop = position.startsWith('top');

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed z-toast',
        'flex flex-col gap-3',
        'pointer-events-none',
        'max-w-md w-full',
        positionStyles[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => {
              toast.onDismiss?.();
              removeToast(toast.id);
            }}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

// Individual toast
interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
  position: ToastPosition;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  loading: <Loader2 className="w-5 h-5 animate-spin" />,
};

const iconColors: Record<ToastType, string> = {
  success: 'text-success-500',
  error: 'text-error-500',
  warning: 'text-warning-500',
  info: 'text-info-500',
  loading: 'text-primary-500',
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-success-50 dark:bg-success-900/20',
  error: 'bg-error-50 dark:bg-error-900/20',
  warning: 'bg-warning-50 dark:bg-warning-900/20',
  info: 'bg-info-50 dark:bg-info-900/20',
  loading: 'bg-primary-50 dark:bg-primary-900/20',
};

function ToastItem({ toast, onDismiss, position }: ToastItemProps) {
  const isRight = position.includes('right');
  const isLeft = position.includes('left');

  const slideDirection = isRight ? 100 : isLeft ? -100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: slideDirection, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: slideDirection, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto w-full',
        'rounded-xl shadow-lg',
        'bg-white dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-800',
        'overflow-hidden'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 p-1 rounded-lg',
            bgColors[toast.type]
          )}
        >
          <span className={iconColors[toast.type]}>{icons[toast.type]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={cn(
                'mt-2 text-sm font-medium',
                'text-primary-600 dark:text-primary-400',
                'hover:text-primary-700 dark:hover:text-primary-300',
                'transition-colors'
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {toast.dismissible && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded-lg',
              'text-neutral-400 hover:text-neutral-600',
              'dark:text-neutral-500 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration !== Infinity && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={cn(
            'h-1 origin-left',
            toast.type === 'success' && 'bg-success-500',
            toast.type === 'error' && 'bg-error-500',
            toast.type === 'warning' && 'bg-warning-500',
            toast.type === 'info' && 'bg-info-500',
            toast.type === 'loading' && 'bg-primary-500'
          )}
        />
      )}
    </motion.div>
  );
}

export default ToastProvider;
