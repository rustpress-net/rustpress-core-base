/**
 * RustPress Modal Component
 * Accessible modal/dialog with animations and variants
 */

import React, { useEffect, useRef, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils';
import { modalOverlay, modalContent, slideOverContent, transitions } from '../animations';
import { IconButton } from './Button';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
export type ModalVariant = 'default' | 'glass' | 'minimal';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  finalFocus?: React.RefObject<HTMLElement>;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  preventScroll?: boolean;
  centered?: boolean;
  scrollBehavior?: 'inside' | 'outside';
}

const sizeStyles: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

const variantStyles: Record<ModalVariant, string> = {
  default: `
    bg-white dark:bg-neutral-900
    border border-neutral-200 dark:border-neutral-800
    shadow-2xl
  `,
  glass: `
    bg-white/80 dark:bg-neutral-900/80
    backdrop-blur-2xl backdrop-saturate-150
    border border-white/30 dark:border-neutral-700/50
    shadow-2xl
  `,
  minimal: `
    bg-white dark:bg-neutral-900
    shadow-xl
  `,
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocus,
  finalFocus,
  className,
  overlayClassName,
  contentClassName,
  preventScroll = true,
  centered = true,
  scrollBehavior = 'inside',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, preventScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus initial element or modal
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        modalRef.current?.focus();
      }
    } else {
      // Return focus
      if (finalFocus?.current) {
        finalFocus.current.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, initialFocus, finalFocus]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed inset-0 z-modal',
              'bg-black/50 dark:bg-black/70',
              'backdrop-blur-sm',
              overlayClassName
            )}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal container */}
          <div
            className={cn(
              'fixed inset-0 z-modal',
              'flex p-4',
              centered ? 'items-center justify-center' : 'items-start justify-center pt-16',
              scrollBehavior === 'outside' && 'overflow-y-auto'
            )}
            onClick={handleOverlayClick}
          >
            {/* Modal content */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={transitions.spring}
              className={cn(
                'relative w-full',
                'rounded-2xl',
                sizeStyles[size],
                variantStyles[variant],
                scrollBehavior === 'inside' && 'max-h-[calc(100vh-2rem)] flex flex-col',
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              tabIndex={-1}
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div
                  className={cn(
                    'flex items-start justify-between gap-4',
                    'px-6 pt-6',
                    description ? 'pb-2' : 'pb-4'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h2
                        id="modal-title"
                        className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id="modal-description"
                        className="text-sm text-neutral-500 dark:text-neutral-400 mt-1"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <IconButton
                      icon={<X />}
                      aria-label="Close modal"
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="-mt-1 -mr-2"
                    />
                  )}
                </div>
              )}

              {/* Content */}
              <div
                className={cn(
                  'px-6 pb-6',
                  !title && !showCloseButton && 'pt-6',
                  title && 'pt-4',
                  scrollBehavior === 'inside' && 'flex-1 overflow-y-auto',
                  contentClassName
                )}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );

  // Render to portal
  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}

// Modal Footer for action buttons
export interface ModalFooterProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function ModalFooter({ children, align = 'right', className }: ModalFooterProps) {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        'pt-6 mt-6',
        'border-t border-neutral-100 dark:border-neutral-800',
        alignStyles[align],
        className
      )}
    >
      {children}
    </div>
  );
}

// Confirmation Dialog shortcut
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const Button = require('./Button').Button;

  const confirmButtonVariant = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'primary' as const,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      centered
    >
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmButtonVariant[variant]}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Slide Over variant (slides from right)
export interface SlideOverProps extends Omit<ModalProps, 'centered' | 'size'> {
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  side?: 'left' | 'right';
}

export function SlideOver({
  isOpen,
  onClose,
  children,
  title,
  description,
  width = 'md',
  side = 'right',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  overlayClassName,
  className,
}: SlideOverProps) {
  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const slideDirection = side === 'right' ? 'x' : '-x';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed inset-0 z-modal',
              'bg-black/50 dark:bg-black/70',
              overlayClassName
            )}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Slide over panel */}
          <motion.div
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={transitions.smooth}
            className={cn(
              'fixed inset-y-0 z-modal',
              side === 'right' ? 'right-0' : 'left-0',
              'w-full',
              widthStyles[width],
              'bg-white dark:bg-neutral-900',
              'shadow-2xl',
              'flex flex-col',
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton
                    icon={<X />}
                    aria-label="Close"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
