/**
 * Tooltip Component (Enhancement #89)
 * Rich tooltips with various styles and content support
 */

import React, { useState, useRef, useEffect, useCallback, cloneElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Info, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type TooltipPlacement =
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

export interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  arrow?: boolean;
  maxWidth?: number | string;
  variant?: 'default' | 'light' | 'error' | 'warning' | 'success' | 'info';
  interactive?: boolean;
  trigger?: 'hover' | 'click' | 'focus';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title?: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface InfoTooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted';
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getPlacementStyles = (
  placement: TooltipPlacement,
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  offset: number = 8
): { top: number; left: number } => {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = 0;
  let left = 0;

  // Base positions
  const positions = {
    top: {
      top: triggerRect.top + scrollY - tooltipRect.height - offset,
      left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
    },
    'top-start': {
      top: triggerRect.top + scrollY - tooltipRect.height - offset,
      left: triggerRect.left + scrollX,
    },
    'top-end': {
      top: triggerRect.top + scrollY - tooltipRect.height - offset,
      left: triggerRect.right + scrollX - tooltipRect.width,
    },
    bottom: {
      top: triggerRect.bottom + scrollY + offset,
      left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
    },
    'bottom-start': {
      top: triggerRect.bottom + scrollY + offset,
      left: triggerRect.left + scrollX,
    },
    'bottom-end': {
      top: triggerRect.bottom + scrollY + offset,
      left: triggerRect.right + scrollX - tooltipRect.width,
    },
    left: {
      top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.left + scrollX - tooltipRect.width - offset,
    },
    'left-start': {
      top: triggerRect.top + scrollY,
      left: triggerRect.left + scrollX - tooltipRect.width - offset,
    },
    'left-end': {
      top: triggerRect.bottom + scrollY - tooltipRect.height,
      left: triggerRect.left + scrollX - tooltipRect.width - offset,
    },
    right: {
      top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.right + scrollX + offset,
    },
    'right-start': {
      top: triggerRect.top + scrollY,
      left: triggerRect.right + scrollX + offset,
    },
    'right-end': {
      top: triggerRect.bottom + scrollY - tooltipRect.height,
      left: triggerRect.right + scrollX + offset,
    },
  };

  const pos = positions[placement];
  top = pos.top;
  left = pos.left;

  // Boundary checks
  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Clamp to viewport
  left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding + scrollX));
  top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding + scrollY));

  return { top, left };
};

const getArrowStyles = (placement: TooltipPlacement): string => {
  const base = 'absolute w-2 h-2 rotate-45';
  const positions: Record<string, string> = {
    top: `${base} -bottom-1 left-1/2 -translate-x-1/2`,
    'top-start': `${base} -bottom-1 left-4`,
    'top-end': `${base} -bottom-1 right-4`,
    bottom: `${base} -top-1 left-1/2 -translate-x-1/2`,
    'bottom-start': `${base} -top-1 left-4`,
    'bottom-end': `${base} -top-1 right-4`,
    left: `${base} -right-1 top-1/2 -translate-y-1/2`,
    'left-start': `${base} -right-1 top-3`,
    'left-end': `${base} -right-1 bottom-3`,
    right: `${base} -left-1 top-1/2 -translate-y-1/2`,
    'right-start': `${base} -left-1 top-3`,
    'right-end': `${base} -left-1 bottom-3`,
  };
  return positions[placement] || positions.top;
};

const getVariantStyles = (variant: string) => {
  const variants: Record<string, { bg: string; text: string; arrow: string }> = {
    default: {
      bg: 'bg-neutral-900 dark:bg-neutral-100',
      text: 'text-white dark:text-neutral-900',
      arrow: 'bg-neutral-900 dark:bg-neutral-100',
    },
    light: {
      bg: 'bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700',
      text: 'text-neutral-900 dark:text-white',
      arrow: 'bg-white dark:bg-neutral-800 border-l border-t border-neutral-200 dark:border-neutral-700',
    },
    error: {
      bg: 'bg-error-600',
      text: 'text-white',
      arrow: 'bg-error-600',
    },
    warning: {
      bg: 'bg-warning-500',
      text: 'text-white',
      arrow: 'bg-warning-500',
    },
    success: {
      bg: 'bg-success-600',
      text: 'text-white',
      arrow: 'bg-success-600',
    },
    info: {
      bg: 'bg-blue-600',
      text: 'text-white',
      arrow: 'bg-blue-600',
    },
  };
  return variants[variant] || variants.default;
};

const getAnimationProps = (placement: TooltipPlacement) => {
  const direction = placement.split('-')[0];
  const offset = 4;

  const animations: Record<string, { initial: object; animate: object; exit: object }> = {
    top: {
      initial: { opacity: 0, y: offset },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: offset },
    },
    bottom: {
      initial: { opacity: 0, y: -offset },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -offset },
    },
    left: {
      initial: { opacity: 0, x: offset },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: offset },
    },
    right: {
      initial: { opacity: 0, x: -offset },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -offset },
    },
  };

  return animations[direction] || animations.top;
};

// ============================================================================
// Tooltip Component
// ============================================================================

export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 200,
  hideDelay = 0,
  disabled = false,
  arrow = true,
  maxWidth = 250,
  variant = 'default',
  interactive = false,
  trigger = 'hover',
  open: controlledOpen,
  onOpenChange,
  className = '',
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange]
  );

  const show = useCallback(() => {
    if (disabled) return;
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setOpen(true), delay);
  }, [delay, disabled, setOpen]);

  const hide = useCallback(() => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setOpen(false), hideDelay);
  }, [hideDelay, setOpen]);

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen(!isOpen);
  }, [disabled, isOpen, setOpen]);

  // Update position
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      setPosition(getPlacementStyles(placement, triggerRect, tooltipRect));
    };

    // Initial position
    requestAnimationFrame(updatePosition);

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, placement]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Build trigger props
  const triggerProps: Record<string, any> = {
    ref: triggerRef,
  };

  if (trigger === 'hover') {
    triggerProps.onMouseEnter = show;
    triggerProps.onMouseLeave = hide;
    triggerProps.onFocus = show;
    triggerProps.onBlur = hide;
  } else if (trigger === 'click') {
    triggerProps.onClick = toggle;
  } else if (trigger === 'focus') {
    triggerProps.onFocus = show;
    triggerProps.onBlur = hide;
  }

  const variantStyles = getVariantStyles(variant);
  const animation = getAnimationProps(placement);

  const tooltipElement = (
    <AnimatePresence>
      {isOpen && content && (
        <motion.div
          ref={tooltipRef}
          {...animation}
          transition={{ duration: 0.15 }}
          className={`
            fixed z-[9999] px-3 py-2 rounded-lg text-sm
            ${variantStyles.bg}
            ${variantStyles.text}
            ${className}
          `}
          style={{
            top: position.top,
            left: position.left,
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          }}
          onMouseEnter={interactive ? () => clearTimeout(hideTimeoutRef.current) : undefined}
          onMouseLeave={interactive ? hide : undefined}
        >
          {content}
          {arrow && (
            <div className={`${getArrowStyles(placement)} ${variantStyles.arrow}`} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {cloneElement(children, triggerProps)}
      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </>
  );
}

// ============================================================================
// Rich Tooltip Component
// ============================================================================

export function RichTooltip({
  children,
  title,
  content,
  actions,
  icon,
  dismissible = false,
  onDismiss,
  placement = 'top',
  ...props
}: RichTooltipProps) {
  const tooltipContent = (
    <div className="min-w-[200px]">
      <div className="flex items-start gap-3">
        {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          <div className="text-sm opacity-90">{content}</div>
          {actions && (
            <div className="mt-3 flex items-center gap-2">{actions}</div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 -mr-1 -mt-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      placement={placement}
      variant="light"
      interactive
      maxWidth={320}
      {...props}
    >
      {children}
    </Tooltip>
  );
}

// ============================================================================
// Info Tooltip Component
// ============================================================================

export function InfoTooltip({
  content,
  placement = 'top',
  size = 'md',
  variant = 'default',
  className = '',
}: InfoTooltipProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    default: 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300',
    muted: 'text-neutral-300 dark:text-neutral-600',
  };

  return (
    <Tooltip content={content} placement={placement}>
      <button
        type="button"
        className={`inline-flex items-center justify-center ${variantClasses[variant]} ${className}`}
      >
        <Info className={sizeClasses[size]} />
      </button>
    </Tooltip>
  );
}

// ============================================================================
// Help Tooltip Component
// ============================================================================

export interface HelpTooltipProps extends Omit<InfoTooltipProps, 'variant'> {
  title?: string;
  learnMoreUrl?: string;
}

export function HelpTooltip({
  content,
  title,
  learnMoreUrl,
  placement = 'top',
  size = 'md',
  className = '',
}: HelpTooltipProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const tooltipContent = (
    <div>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{content}</div>
      {learnMoreUrl && (
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-primary-400 hover:underline"
        >
          Learn more →
        </a>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement={placement} interactive maxWidth={280}>
      <button
        type="button"
        className={`inline-flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 ${className}`}
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>
    </Tooltip>
  );
}

// ============================================================================
// Status Tooltip Component
// ============================================================================

export interface StatusTooltipProps {
  children: React.ReactElement;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  placement?: TooltipPlacement;
}

export function StatusTooltip({
  children,
  status,
  message,
  placement = 'top',
}: StatusTooltipProps) {
  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  };

  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          {icons[status]}
          <span>{message}</span>
        </div>
      }
      placement={placement}
      variant={status}
    >
      {children}
    </Tooltip>
  );
}

// ============================================================================
// Truncate with Tooltip Component
// ============================================================================

export interface TruncateWithTooltipProps {
  text: string;
  maxLength?: number;
  placement?: TooltipPlacement;
  className?: string;
}

export function TruncateWithTooltip({
  text,
  maxLength = 50,
  placement = 'top',
  className = '',
}: TruncateWithTooltipProps) {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <Tooltip content={text} placement={placement} maxWidth={400}>
      <span className={`cursor-help ${className}`}>{displayText}</span>
    </Tooltip>
  );
}

export default Tooltip;
