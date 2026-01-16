/**
 * RustPress Button Component
 * Enterprise-grade button with multiple variants, sizes, and states
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { buttonTap, buttonHover } from '../animations';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
  rounded?: 'default' | 'full' | 'none';
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-600 text-white
    hover:bg-primary-700
    active:bg-primary-800
    focus-visible:ring-primary-500/50
    dark:bg-primary-500 dark:hover:bg-primary-400 dark:active:bg-primary-300
    shadow-sm hover:shadow-md
  `,
  secondary: `
    bg-neutral-100 text-neutral-900
    hover:bg-neutral-200
    active:bg-neutral-300
    focus-visible:ring-neutral-400/50
    dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-600
  `,
  outline: `
    border-2 border-neutral-300 text-neutral-700 bg-transparent
    hover:bg-neutral-50 hover:border-neutral-400
    active:bg-neutral-100
    focus-visible:ring-neutral-400/50
    dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-500
  `,
  ghost: `
    text-neutral-700 bg-transparent
    hover:bg-neutral-100
    active:bg-neutral-200
    focus-visible:ring-neutral-400/50
    dark:text-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700
  `,
  danger: `
    bg-error-600 text-white
    hover:bg-error-700
    active:bg-error-800
    focus-visible:ring-error-500/50
    dark:bg-error-500 dark:hover:bg-error-400
    shadow-sm hover:shadow-md
  `,
  success: `
    bg-success-600 text-white
    hover:bg-success-700
    active:bg-success-800
    focus-visible:ring-success-500/50
    dark:bg-success-500 dark:hover:bg-success-400
    shadow-sm hover:shadow-md
  `,
  warning: `
    bg-warning-500 text-neutral-900
    hover:bg-warning-600
    active:bg-warning-700
    focus-visible:ring-warning-500/50
    shadow-sm hover:shadow-md
  `,
  link: `
    text-primary-600 bg-transparent underline-offset-4
    hover:underline hover:text-primary-700
    active:text-primary-800
    focus-visible:ring-primary-500/50
    dark:text-primary-400 dark:hover:text-primary-300
    p-0 h-auto
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-2',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2.5',
  xl: 'h-12 px-6 text-base gap-3',
};

const iconOnlyStyles: Record<ButtonSize, string> = {
  xs: 'h-7 w-7 p-0',
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-11 w-11 p-0',
  xl: 'h-12 w-12 p-0',
};

const roundedStyles = {
  default: 'rounded-lg',
  full: 'rounded-full',
  none: 'rounded-none',
};

const iconSizes: Record<ButtonSize, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-5 h-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      fullWidth = false,
      rounded = 'default',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = isDisabled || disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        disabled={isButtonDisabled}
        whileTap={isButtonDisabled ? undefined : buttonTap}
        whileHover={isButtonDisabled ? undefined : buttonHover}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

          // Variant styles
          variantStyles[variant],

          // Size styles
          iconOnly ? iconOnlyStyles[size] : sizeStyles[size],

          // Rounded styles
          roundedStyles[rounded],

          // Full width
          fullWidth && 'w-full',

          // Loading state
          isLoading && 'cursor-wait',

          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className={cn('animate-spin', iconSizes[size])} />
          </motion.span>
        )}

        {/* Content container */}
        <span
          className={cn(
            'inline-flex items-center justify-center gap-inherit',
            isLoading && 'invisible'
          )}
        >
          {/* Left icon */}
          {leftIcon && (
            <span className={cn('flex-shrink-0', iconSizes[size])}>
              {leftIcon}
            </span>
          )}

          {/* Children */}
          {children}

          {/* Right icon */}
          {rightIcon && (
            <span className={cn('flex-shrink-0', iconSizes[size])}>
              {rightIcon}
            </span>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant for convenience
export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'leftIcon' | 'rightIcon'> {
  icon?: React.ReactNode;
  'aria-label': string;
  children?: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, children, size = 'md', ...props }, ref) => {
    const iconContent = icon || children;
    return (
      <Button ref={ref} size={size} iconOnly {...props}>
        <span className={iconSizes[size]}>{iconContent}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button Group for related actions
export interface ButtonGroupProps {
  children: React.ReactNode;
  attached?: boolean;
  className?: string;
}

export function ButtonGroup({ children, attached = false, className }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'inline-flex',
        attached && [
          '[&>button]:rounded-none',
          '[&>button:first-child]:rounded-l-lg',
          '[&>button:last-child]:rounded-r-lg',
          '[&>button:not(:last-child)]:border-r-0',
        ],
        !attached && 'gap-2',
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}

export default Button;
