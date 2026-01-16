/**
 * Drawer Component
 *
 * Enterprise-grade slide-out panel system:
 * - Slide from any edge (left, right, top, bottom)
 * - Multiple sizes
 * - Overlay and push modes
 * - Nested drawers support
 * - Focus trapping
 */

import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  overlayClassName?: string;
  lockScroll?: boolean;
  trapFocus?: boolean;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export interface DrawerHeaderProps {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface DrawerContextValue {
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext() {
  return useContext(DrawerContext);
}

// ============================================================================
// Constants
// ============================================================================

const sizeConfig: Record<DrawerSize, Record<DrawerPosition, string>> = {
  sm: {
    left: 'w-72',
    right: 'w-72',
    top: 'h-48',
    bottom: 'h-48',
  },
  md: {
    left: 'w-96',
    right: 'w-96',
    top: 'h-72',
    bottom: 'h-72',
  },
  lg: {
    left: 'w-[480px]',
    right: 'w-[480px]',
    top: 'h-96',
    bottom: 'h-96',
  },
  xl: {
    left: 'w-[640px]',
    right: 'w-[640px]',
    top: 'h-[480px]',
    bottom: 'h-[480px]',
  },
  full: {
    left: 'w-screen',
    right: 'w-screen',
    top: 'h-screen',
    bottom: 'h-screen',
  },
  auto: {
    left: 'w-auto max-w-[90vw]',
    right: 'w-auto max-w-[90vw]',
    top: 'h-auto max-h-[90vh]',
    bottom: 'h-auto max-h-[90vh]',
  },
};

const positionConfig: Record<DrawerPosition, {
  initial: { x?: string | number; y?: string | number };
  animate: { x: number; y: number };
  exit: { x?: string | number; y?: string | number };
  className: string;
}> = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0, y: 0 },
    exit: { x: '-100%' },
    className: 'left-0 top-0 h-full',
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0, y: 0 },
    exit: { x: '100%' },
    className: 'right-0 top-0 h-full',
  },
  top: {
    initial: { y: '-100%' },
    animate: { x: 0, y: 0 },
    exit: { y: '-100%' },
    className: 'top-0 left-0 w-full',
  },
  bottom: {
    initial: { y: '100%' },
    animate: { x: 0, y: 0 },
    exit: { y: '100%' },
    className: 'bottom-0 left-0 w-full',
  },
};

// ============================================================================
// Focus Trap Hook
// ============================================================================

function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
}

// ============================================================================
// Scroll Lock Hook
// ============================================================================

function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}

// ============================================================================
// Drawer Header Component
// ============================================================================

export function DrawerHeader({
  title,
  description,
  showCloseButton = true,
  onClose,
  children,
  className,
}: DrawerHeaderProps) {
  const context = useDrawerContext();

  const handleClose = () => {
    onClose?.();
    context?.close();
  };

  if (children) {
    return (
      <div className={cn('flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-lg transition-colors',
              'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Drawer Body Component
// ============================================================================

export function DrawerBody({ children, className }: DrawerBodyProps) {
  return (
    <div className={cn('flex-1 overflow-auto px-6 py-4', className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Drawer Footer Component
// ============================================================================

export function DrawerFooter({ children, className }: DrawerFooterProps) {
  return (
    <div className={cn('flex-shrink-0 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700', className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Drawer Component
// ============================================================================

export function Drawer({
  open,
  onClose,
  position = 'right',
  size = 'md',
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  overlayClassName,
  lockScroll = true,
  trapFocus = true,
  children,
  header,
  footer,
  className,
  contentClassName,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const posConfig = positionConfig[position];
  const sizeClass = sizeConfig[size][position];

  // Lock scroll when open
  useScrollLock(open && lockScroll);

  // Trap focus when open
  useFocusTrap(drawerRef, open && trapFocus);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  const contextValue: DrawerContextValue = {
    close: onClose,
  };

  const drawerContent = (
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-50', className)}>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute inset-0 bg-black/50',
                overlayClassName
              )}
              onClick={closeOnOverlayClick ? onClose : undefined}
              aria-hidden="true"
            />
          )}

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            initial={posConfig.initial}
            animate={posConfig.animate}
            exit={posConfig.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'absolute flex flex-col',
              'bg-white dark:bg-neutral-900',
              'shadow-2xl',
              posConfig.className,
              sizeClass,
              contentClassName
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
          >
            <DrawerContext.Provider value={contextValue}>
              {/* Header */}
              {(title || header) && (
                header || (
                  <DrawerHeader
                    title={title}
                    description={description}
                    showCloseButton={showCloseButton}
                    onClose={onClose}
                  />
                )
              )}

              {/* Body */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>

              {/* Footer */}
              {footer}
            </DrawerContext.Provider>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
}

// ============================================================================
// Confirmation Drawer Component
// ============================================================================

export interface ConfirmDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
  children?: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
}

export function ConfirmDrawer({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
  children,
  position = 'right',
  size = 'sm',
}: ConfirmDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      position={position}
      size={size}
      title={title}
      description={description}
      footer={
        <DrawerFooter>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                confirmVariant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                  : 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </DrawerFooter>
      }
    >
      <DrawerBody>
        {children}
      </DrawerBody>
    </Drawer>
  );
}

// ============================================================================
// Form Drawer Component
// ============================================================================

export interface FormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
}

export function FormDrawer({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  children,
  position = 'right',
  size = 'md',
}: FormDrawerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position={position}
      size={size}
      title={title}
      description={description}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DrawerBody>
          {children}
        </DrawerBody>

        <DrawerFooter>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
}

// ============================================================================
// Navigation Drawer Component
// ============================================================================

export interface NavDrawerItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: React.ReactNode;
  children?: NavDrawerItem[];
}

export interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavDrawerItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  size?: DrawerSize;
}

export function NavDrawer({
  open,
  onClose,
  items,
  header,
  footer,
  position = 'left',
  size = 'sm',
}: NavDrawerProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderItem = (item: NavDrawerItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.includes(item.id);

    return (
      <div key={item.id}>
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              item.onClick?.();
              if (item.href) {
                onClose();
              }
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            item.active && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
            !item.active && 'text-neutral-700 dark:text-neutral-300',
            level > 0 && 'pl-10'
          )}
        >
          {item.icon && (
            <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
          )}
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex-shrink-0">{item.badge}</span>
          )}
          {hasChildren && (
            <svg
              className={cn(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="bg-neutral-50 dark:bg-neutral-800/50">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position={position}
      size={size}
      showCloseButton={false}
    >
      {header && (
        <div className="px-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
          {header}
        </div>
      )}

      <nav className="flex-1 overflow-auto py-2">
        {items.map((item) => renderItem(item))}
      </nav>

      {footer && (
        <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </Drawer>
  );
}

export default Drawer;
