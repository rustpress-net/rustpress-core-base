/**
 * RustPress Badge Component
 * Status indicators and labels
 */

import React, { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { popIn } from '../animations';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  isAnimated?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-neutral-100 text-neutral-700
    dark:bg-neutral-800 dark:text-neutral-300
  `,
  primary: `
    bg-primary-100 text-primary-700
    dark:bg-primary-900/30 dark:text-primary-400
  `,
  secondary: `
    bg-accent-100 text-accent-700
    dark:bg-accent-900/30 dark:text-accent-400
  `,
  success: `
    bg-success-100 text-success-700
    dark:bg-success-900/30 dark:text-success-400
  `,
  warning: `
    bg-warning-100 text-warning-800
    dark:bg-warning-900/30 dark:text-warning-400
  `,
  error: `
    bg-error-100 text-error-700
    dark:bg-error-900/30 dark:text-error-400
  `,
  info: `
    bg-info-100 text-info-700
    dark:bg-info-900/30 dark:text-info-400
  `,
  outline: `
    bg-transparent border-2 border-neutral-300 text-neutral-700
    dark:border-neutral-600 dark:text-neutral-300
  `,
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-neutral-500',
  primary: 'bg-primary-500',
  secondary: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  outline: 'bg-neutral-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const dotSizes: Record<BadgeSize, string> = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2 h-2',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  removable = false,
  onRemove,
  isAnimated = false,
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center gap-1.5',
    'font-medium rounded-full',
    'whitespace-nowrap',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const content = (
    <>
      {dot && (
        <span
          className={cn('rounded-full flex-shrink-0', dotSizes[size], dotColors[variant])}
        />
      )}
      {icon && <span className="flex-shrink-0 -ml-0.5">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            '-mr-1 p-0.5 rounded-full',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors duration-150'
          )}
          aria-label="Remove"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  );

  if (isAnimated) {
    return (
      <motion.span
        className={baseClasses}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={popIn}
      >
        {content}
      </motion.span>
    );
  }

  return (
    <span className={baseClasses} {...props}>
      {content}
    </span>
  );
}

// Status Badge with pulsing indicator
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'dot'> {
  status: 'online' | 'offline' | 'away' | 'busy' | 'dnd';
}

const statusConfig = {
  online: { variant: 'success' as const, label: 'Online', pulse: true },
  offline: { variant: 'default' as const, label: 'Offline', pulse: false },
  away: { variant: 'warning' as const, label: 'Away', pulse: false },
  busy: { variant: 'error' as const, label: 'Busy', pulse: false },
  dnd: { variant: 'error' as const, label: 'Do Not Disturb', pulse: false },
};

export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className} {...props}>
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[config.variant]
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            dotColors[config.variant]
          )}
        />
      </span>
      {children || config.label}
    </Badge>
  );
}

// Count Badge (for notifications, etc.)
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  showZero?: boolean;
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  variant = 'error',
  showZero = false,
  className,
}: CountBadgeProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant={variant}
      size="xs"
      className={cn('min-w-[1.25rem] justify-center', className)}
    >
      {displayCount}
    </Badge>
  );
}

// Badge Group
export interface BadgeGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export function BadgeGroup({ children, max, className }: BadgeGroupProps) {
  const childArray = React.Children.toArray(children);
  const visible = max ? childArray.slice(0, max) : childArray;
  const remaining = max ? childArray.length - max : 0;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visible}
      {remaining > 0 && (
        <Badge variant="outline" size="sm">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

export default Badge;
