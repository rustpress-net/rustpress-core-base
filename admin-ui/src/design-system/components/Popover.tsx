/**
 * Popover Component
 *
 * Enterprise-grade popover and tooltip system:
 * - Multiple trigger modes (click, hover, focus)
 * - Smart positioning with collision detection
 * - Rich content support
 * - Tooltip variant for simple text
 * - Controlled and uncontrolled modes
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  trigger?: PopoverTrigger | PopoverTrigger[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  offset?: number;
  delay?: number | { open: number; close: number };
  arrow?: boolean;
  arrowSize?: number;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  closeOnContentClick?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  portalContainer?: HTMLElement;
}

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  delay?: number;
  disabled?: boolean;
  arrow?: boolean;
  maxWidth?: number;
  className?: string;
}

export interface HoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  className?: string;
}

export interface PopoverContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface PopoverContextValue {
  close: () => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
  return useContext(PopoverContext);
}

// ============================================================================
// Position Calculation
// ============================================================================

interface Position {
  top: number;
  left: number;
  actualPlacement: PopoverPlacement;
}

function calculatePosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  placement: PopoverPlacement,
  offset: number,
  arrowSize: number
): Position {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const totalOffset = offset + (arrowSize > 0 ? arrowSize / 2 : 0);

  // Calculate initial position based on placement
  const positions: Record<PopoverPlacement, { top: number; left: number }> = {
    'top': {
      top: triggerRect.top + scrollY - contentRect.height - totalOffset,
      left: triggerRect.left + scrollX + (triggerRect.width - contentRect.width) / 2,
    },
    'top-start': {
      top: triggerRect.top + scrollY - contentRect.height - totalOffset,
      left: triggerRect.left + scrollX,
    },
    'top-end': {
      top: triggerRect.top + scrollY - contentRect.height - totalOffset,
      left: triggerRect.right + scrollX - contentRect.width,
    },
    'bottom': {
      top: triggerRect.bottom + scrollY + totalOffset,
      left: triggerRect.left + scrollX + (triggerRect.width - contentRect.width) / 2,
    },
    'bottom-start': {
      top: triggerRect.bottom + scrollY + totalOffset,
      left: triggerRect.left + scrollX,
    },
    'bottom-end': {
      top: triggerRect.bottom + scrollY + totalOffset,
      left: triggerRect.right + scrollX - contentRect.width,
    },
    'left': {
      top: triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2,
      left: triggerRect.left + scrollX - contentRect.width - totalOffset,
    },
    'left-start': {
      top: triggerRect.top + scrollY,
      left: triggerRect.left + scrollX - contentRect.width - totalOffset,
    },
    'left-end': {
      top: triggerRect.bottom + scrollY - contentRect.height,
      left: triggerRect.left + scrollX - contentRect.width - totalOffset,
    },
    'right': {
      top: triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2,
      left: triggerRect.right + scrollX + totalOffset,
    },
    'right-start': {
      top: triggerRect.top + scrollY,
      left: triggerRect.right + scrollX + totalOffset,
    },
    'right-end': {
      top: triggerRect.bottom + scrollY - contentRect.height,
      left: triggerRect.right + scrollX + totalOffset,
    },
  };

  let pos = positions[placement];
  let actualPlacement = placement;

  // Collision detection and flipping
  const margin = 8;

  // Check horizontal overflow
  if (pos.left < margin) {
    pos.left = margin;
  } else if (pos.left + contentRect.width > viewportWidth + scrollX - margin) {
    pos.left = viewportWidth + scrollX - contentRect.width - margin;
  }

  // Check vertical overflow and flip if needed
  if (placement.startsWith('top') && pos.top < scrollY + margin) {
    // Flip to bottom
    actualPlacement = placement.replace('top', 'bottom') as PopoverPlacement;
    pos = positions[actualPlacement];
  } else if (placement.startsWith('bottom') && pos.top + contentRect.height > viewportHeight + scrollY - margin) {
    // Flip to top
    actualPlacement = placement.replace('bottom', 'top') as PopoverPlacement;
    pos = positions[actualPlacement];
  }

  // Check horizontal flip for left/right
  if (placement.startsWith('left') && pos.left < scrollX + margin) {
    actualPlacement = placement.replace('left', 'right') as PopoverPlacement;
    pos = positions[actualPlacement];
  } else if (placement.startsWith('right') && pos.left + contentRect.width > viewportWidth + scrollX - margin) {
    actualPlacement = placement.replace('right', 'left') as PopoverPlacement;
    pos = positions[actualPlacement];
  }

  return { ...pos, actualPlacement };
}

// ============================================================================
// Arrow Component
// ============================================================================

function PopoverArrow({
  placement,
  size,
  className,
}: {
  placement: PopoverPlacement;
  size: number;
  className?: string;
}) {
  const getArrowStyles = (): React.CSSProperties => {
    const base = {
      width: size,
      height: size,
      position: 'absolute' as const,
    };

    if (placement.startsWith('top')) {
      return {
        ...base,
        bottom: -size / 2,
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      };
    }
    if (placement.startsWith('bottom')) {
      return {
        ...base,
        top: -size / 2,
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      };
    }
    if (placement.startsWith('left')) {
      return {
        ...base,
        right: -size / 2,
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
      };
    }
    if (placement.startsWith('right')) {
      return {
        ...base,
        left: -size / 2,
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
      };
    }
    return base;
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
        placement.startsWith('top') && 'border-t-0 border-l-0',
        placement.startsWith('bottom') && 'border-b-0 border-r-0',
        placement.startsWith('left') && 'border-l-0 border-b-0',
        placement.startsWith('right') && 'border-r-0 border-t-0',
        className
      )}
      style={getArrowStyles()}
    />
  );
}

// ============================================================================
// Popover Component
// ============================================================================

export function Popover({
  children,
  content,
  placement = 'bottom',
  trigger = 'click',
  open: controlledOpen,
  onOpenChange,
  offset = 8,
  delay = 0,
  arrow = false,
  arrowSize = 8,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnContentClick = false,
  disabled = false,
  className,
  contentClassName,
  portalContainer,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const openDelay = typeof delay === 'number' ? delay : delay.open;
  const closeDelay = typeof delay === 'number' ? delay : delay.close;

  const setOpen = useCallback(
    (open: boolean) => {
      if (disabled) return;

      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [disabled, isControlled, onOpenChange]
  );

  const handleOpen = useCallback(() => {
    clearTimeout(closeTimeoutRef.current);
    if (openDelay > 0) {
      openTimeoutRef.current = setTimeout(() => setOpen(true), openDelay);
    } else {
      setOpen(true);
    }
  }, [openDelay, setOpen]);

  const handleClose = useCallback(() => {
    clearTimeout(openTimeoutRef.current);
    if (closeDelay > 0) {
      closeTimeoutRef.current = setTimeout(() => setOpen(false), closeDelay);
    } else {
      setOpen(false);
    }
  }, [closeDelay, setOpen]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleOpen, handleClose]);

  // Update position when open
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      const pos = calculatePosition(triggerRect, contentRect, placement, offset, arrow ? arrowSize : 0);
      setPosition(pos);
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, placement, offset, arrow, arrowSize]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      handleClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, handleClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, handleClose]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(openTimeoutRef.current);
      clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Event handlers for trigger
  const triggerEvents = useMemo(() => {
    const events: Record<string, () => void> = {};

    if (triggers.includes('click')) {
      events.onClick = handleToggle;
    }
    if (triggers.includes('hover')) {
      events.onMouseEnter = handleOpen;
      events.onMouseLeave = handleClose;
    }
    if (triggers.includes('focus')) {
      events.onFocus = handleOpen;
      events.onBlur = handleClose;
    }

    return events;
  }, [triggers, handleToggle, handleOpen, handleClose]);

  // Event handlers for content (hover trigger)
  const contentEvents = useMemo(() => {
    if (!triggers.includes('hover')) return {};
    return {
      onMouseEnter: handleOpen,
      onMouseLeave: handleClose,
    };
  }, [triggers, handleOpen, handleClose]);

  const contextValue: PopoverContextValue = {
    close: handleClose,
  };

  const getAnimationOrigin = () => {
    if (placement.startsWith('top')) return { originY: 1 };
    if (placement.startsWith('bottom')) return { originY: 0 };
    if (placement.startsWith('left')) return { originX: 1 };
    if (placement.startsWith('right')) return { originX: 0 };
    return {};
  };

  const portalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.95, ...getAnimationOrigin() }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'fixed z-50',
            'bg-white dark:bg-neutral-800 rounded-lg shadow-lg',
            'border border-neutral-200 dark:border-neutral-700',
            contentClassName
          )}
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            visibility: position ? 'visible' : 'hidden',
          }}
          onClick={closeOnContentClick ? handleClose : undefined}
          {...contentEvents}
        >
          <PopoverContext.Provider value={contextValue}>
            {content}
          </PopoverContext.Provider>
          {arrow && position && (
            <PopoverArrow placement={position.actualPlacement} size={arrowSize} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        {...triggerEvents}
      >
        {children}
      </div>
      {createPortal(portalContent, portalContainer || document.body)}
    </>
  );
}

// ============================================================================
// Popover Content Component
// ============================================================================

export function PopoverContent({
  children,
  title,
  description,
  showCloseButton = false,
  onClose,
  footer,
  className,
}: PopoverContentProps) {
  const context = usePopoverContext();

  const handleClose = () => {
    onClose?.();
    context?.close();
  };

  return (
    <div className={cn('p-4 min-w-[200px] max-w-sm', className)}>
      {(title || showCloseButton) && (
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            {title && (
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 -mt-1 -mr-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="text-sm text-neutral-700 dark:text-neutral-300">
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tooltip Component
// ============================================================================

export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 200,
  disabled = false,
  arrow = true,
  maxWidth = 250,
  className,
}: TooltipProps) {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <Popover
      content={
        <div
          className="px-2 py-1 text-xs text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded"
          style={{ maxWidth }}
        >
          {content}
        </div>
      }
      placement={placement}
      trigger="hover"
      delay={{ open: delay, close: 0 }}
      arrow={arrow}
      arrowSize={6}
      offset={6}
      className={className}
      contentClassName="!bg-neutral-900 dark:!bg-white !border-0 !shadow-md"
    >
      {children}
    </Popover>
  );
}

// ============================================================================
// Hover Card Component
// ============================================================================

export function HoverCard({
  children,
  content,
  placement = 'bottom',
  openDelay = 300,
  closeDelay = 200,
  disabled = false,
  className,
}: HoverCardProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Popover
      content={content}
      placement={placement}
      trigger="hover"
      delay={{ open: openDelay, close: closeDelay }}
      className={className}
    >
      {children}
    </Popover>
  );
}

// ============================================================================
// Confirm Popover Component
// ============================================================================

export interface ConfirmPopoverProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmVariant?: 'primary' | 'danger';
  placement?: PopoverPlacement;
  disabled?: boolean;
  className?: string;
}

export function ConfirmPopover({
  children,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  placement = 'top',
  disabled = false,
  className,
}: ConfirmPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      disabled={disabled}
      className={className}
      content={
        <PopoverContent
          title={title}
          description={description}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                )}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  confirmVariant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                )}
              >
                {confirmLabel}
              </button>
            </div>
          }
        />
      }
    >
      {children}
    </Popover>
  );
}

// ============================================================================
// Info Popover Component
// ============================================================================

export interface InfoPopoverProps {
  content: React.ReactNode;
  title?: string;
  placement?: PopoverPlacement;
  iconClassName?: string;
  className?: string;
}

export function InfoPopover({
  content,
  title,
  placement = 'top',
  iconClassName,
  className,
}: InfoPopoverProps) {
  return (
    <Popover
      placement={placement}
      trigger={['hover', 'focus']}
      delay={{ open: 200, close: 100 }}
      className={className}
      content={
        <PopoverContent title={title}>
          {content}
        </PopoverContent>
      }
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full',
          'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400',
          'hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          iconClassName
        )}
      >
        <span className="text-xs font-medium">?</span>
      </button>
    </Popover>
  );
}

export default Popover;
