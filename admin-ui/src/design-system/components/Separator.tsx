/**
 * Separator Component (Enhancement #91)
 * Visual dividers and section separators
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  size?: 'thin' | 'default' | 'thick';
  color?: 'default' | 'muted' | 'primary' | 'accent';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface LabeledSeparatorProps {
  label: string;
  labelPosition?: 'left' | 'center' | 'right';
  variant?: 'solid' | 'dashed' | 'dotted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface IconSeparatorProps {
  icon: React.ReactNode;
  variant?: 'solid' | 'dashed' | 'dotted';
  className?: string;
}

export interface FadeSeparatorProps {
  direction?: 'both' | 'left' | 'right';
  color?: 'default' | 'primary' | 'accent';
  className?: string;
}

export interface SectionSeparatorProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'prominent' | 'subtle';
  className?: string;
}

export interface StepSeparatorProps {
  active?: boolean;
  completed?: boolean;
  animated?: boolean;
  className?: string;
}

export interface DecorativeSeparatorProps {
  pattern?: 'dots' | 'diamonds' | 'waves' | 'zigzag' | 'stars';
  color?: 'default' | 'primary' | 'accent';
  className?: string;
}

// ============================================================================
// Separator Component
// ============================================================================

export function Separator({
  orientation = 'horizontal',
  variant = 'solid',
  size = 'default',
  color = 'default',
  spacing = 'md',
  className = '',
}: SeparatorProps) {
  const sizeClasses = {
    horizontal: {
      thin: 'h-px',
      default: 'h-[2px]',
      thick: 'h-1',
    },
    vertical: {
      thin: 'w-px',
      default: 'w-[2px]',
      thick: 'w-1',
    },
  };

  const colorClasses = {
    default: 'bg-neutral-200 dark:bg-neutral-700',
    muted: 'bg-neutral-100 dark:bg-neutral-800',
    primary: 'bg-primary-500',
    accent: 'bg-accent-500',
  };

  const variantClasses = {
    solid: '',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    gradient: '',
  };

  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    xl: orientation === 'horizontal' ? 'my-8' : 'mx-8',
  };

  if (variant === 'dashed' || variant === 'dotted') {
    const borderSize = size === 'thin' ? 'border' : size === 'thick' ? 'border-2' : 'border';
    const borderColor = {
      default: 'border-neutral-200 dark:border-neutral-700',
      muted: 'border-neutral-100 dark:border-neutral-800',
      primary: 'border-primary-500',
      accent: 'border-accent-500',
    };

    return (
      <div
        role="separator"
        aria-orientation={orientation}
        className={`
          ${orientation === 'horizontal' ? `w-full ${borderSize} border-t-0 border-l-0 border-r-0` : `h-full ${borderSize} border-t-0 border-b-0 border-r-0`}
          ${borderColor[color]}
          ${variantClasses[variant]}
          ${spacingClasses[spacing]}
          ${className}
        `}
      />
    );
  }

  if (variant === 'gradient') {
    const gradientColors = {
      default: 'from-transparent via-neutral-300 dark:via-neutral-600 to-transparent',
      muted: 'from-transparent via-neutral-200 dark:via-neutral-700 to-transparent',
      primary: 'from-transparent via-primary-500 to-transparent',
      accent: 'from-transparent via-accent-500 to-transparent',
    };

    return (
      <div
        role="separator"
        aria-orientation={orientation}
        className={`
          ${orientation === 'horizontal' ? 'w-full bg-gradient-to-r' : 'h-full bg-gradient-to-b'}
          ${sizeClasses[orientation][size]}
          ${gradientColors[color]}
          ${spacingClasses[spacing]}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`
        ${orientation === 'horizontal' ? 'w-full' : 'h-full'}
        ${sizeClasses[orientation][size]}
        ${colorClasses[color]}
        ${spacingClasses[spacing]}
        ${className}
      `}
    />
  );
}

// ============================================================================
// Labeled Separator Component
// ============================================================================

export function LabeledSeparator({
  label,
  labelPosition = 'center',
  variant = 'solid',
  size = 'md',
  className = '',
}: LabeledSeparatorProps) {
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const lineClasses = {
    solid: 'bg-neutral-200 dark:bg-neutral-700',
    dashed: 'border-t border-dashed border-neutral-200 dark:border-neutral-700 bg-transparent',
    dotted: 'border-t border-dotted border-neutral-200 dark:border-neutral-700 bg-transparent',
  };

  const Line = () => (
    <div
      className={`
        flex-1 h-px
        ${lineClasses[variant]}
      `}
    />
  );

  return (
    <div
      role="separator"
      className={`flex items-center gap-4 ${className}`}
    >
      {labelPosition !== 'left' && <Line />}
      <span
        className={`
          ${textSizes[size]}
          font-medium
          text-neutral-500 dark:text-neutral-400
          whitespace-nowrap
        `}
      >
        {label}
      </span>
      {labelPosition !== 'right' && <Line />}
    </div>
  );
}

// ============================================================================
// Icon Separator Component
// ============================================================================

export function IconSeparator({
  icon,
  variant = 'solid',
  className = '',
}: IconSeparatorProps) {
  const lineClasses = {
    solid: 'bg-neutral-200 dark:bg-neutral-700',
    dashed: 'border-t border-dashed border-neutral-200 dark:border-neutral-700 bg-transparent',
    dotted: 'border-t border-dotted border-neutral-200 dark:border-neutral-700 bg-transparent',
  };

  return (
    <div
      role="separator"
      className={`flex items-center gap-4 ${className}`}
    >
      <div className={`flex-1 h-px ${lineClasses[variant]}`} />
      <div className="text-neutral-400 dark:text-neutral-500">
        {icon}
      </div>
      <div className={`flex-1 h-px ${lineClasses[variant]}`} />
    </div>
  );
}

// ============================================================================
// Fade Separator Component
// ============================================================================

export function FadeSeparator({
  direction = 'both',
  color = 'default',
  className = '',
}: FadeSeparatorProps) {
  const gradients = {
    both: {
      default: 'from-transparent via-neutral-300 dark:via-neutral-600 to-transparent',
      primary: 'from-transparent via-primary-500 to-transparent',
      accent: 'from-transparent via-accent-500 to-transparent',
    },
    left: {
      default: 'from-transparent to-neutral-300 dark:to-neutral-600',
      primary: 'from-transparent to-primary-500',
      accent: 'from-transparent to-accent-500',
    },
    right: {
      default: 'from-neutral-300 dark:from-neutral-600 to-transparent',
      primary: 'from-primary-500 to-transparent',
      accent: 'from-accent-500 to-transparent',
    },
  };

  return (
    <div
      role="separator"
      className={`
        w-full h-px
        bg-gradient-to-r
        ${gradients[direction][color]}
        ${className}
      `}
    />
  );
}

// ============================================================================
// Section Separator Component
// ============================================================================

export function SectionSeparator({
  title,
  subtitle,
  action,
  variant = 'default',
  className = '',
}: SectionSeparatorProps) {
  const variantStyles = {
    default: '',
    prominent: 'py-6',
    subtle: 'py-2',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {variant === 'prominent' && (
        <Separator variant="gradient" spacing="none" className="mb-4" />
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {title && (
            <h3 className={`
              font-semibold text-neutral-900 dark:text-white
              ${variant === 'prominent' ? 'text-lg' : 'text-sm'}
            `}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {variant === 'default' && (
        <Separator spacing="sm" />
      )}

      {variant === 'prominent' && (
        <Separator variant="gradient" spacing="none" className="mt-4" />
      )}
    </div>
  );
}

// ============================================================================
// Step Separator Component
// ============================================================================

export function StepSeparator({
  active = false,
  completed = false,
  animated = true,
  className = '',
}: StepSeparatorProps) {
  return (
    <div className={`flex-1 h-0.5 mx-2 ${className}`}>
      <motion.div
        className={`
          h-full rounded-full
          ${completed
            ? 'bg-primary-500'
            : active
              ? 'bg-primary-300 dark:bg-primary-700'
              : 'bg-neutral-200 dark:bg-neutral-700'
          }
        `}
        initial={animated ? { scaleX: 0 } : { scaleX: 1 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}

// ============================================================================
// Decorative Separator Component
// ============================================================================

export function DecorativeSeparator({
  pattern = 'dots',
  color = 'default',
  className = '',
}: DecorativeSeparatorProps) {
  const colorClasses = {
    default: 'text-neutral-300 dark:text-neutral-600',
    primary: 'text-primary-400',
    accent: 'text-accent-400',
  };

  const patterns = {
    dots: (
      <div className="flex items-center justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-current ${colorClasses[color]}`}
          />
        ))}
      </div>
    ),
    diamonds: (
      <div className="flex items-center justify-center gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rotate-45 bg-current ${colorClasses[color]}`}
          />
        ))}
      </div>
    ),
    waves: (
      <svg
        className={`w-24 h-4 ${colorClasses[color]}`}
        viewBox="0 0 96 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M0 8 Q12 0, 24 8 T48 8 T72 8 T96 8" />
      </svg>
    ),
    zigzag: (
      <svg
        className={`w-24 h-4 ${colorClasses[color]}`}
        viewBox="0 0 96 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M0 12 L12 4 L24 12 L36 4 L48 12 L60 4 L72 12 L84 4 L96 12" />
      </svg>
    ),
    stars: (
      <div className="flex items-center justify-center gap-3">
        {[...Array(3)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${colorClasses[color]}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    ),
  };

  return (
    <div
      role="separator"
      className={`
        flex items-center justify-center
        py-4
        ${className}
      `}
    >
      <div className={`flex-1 h-px bg-neutral-200 dark:bg-neutral-700`} />
      <div className="px-4">
        {patterns[pattern]}
      </div>
      <div className={`flex-1 h-px bg-neutral-200 dark:bg-neutral-700`} />
    </div>
  );
}

// ============================================================================
// Vertical Separator Component
// ============================================================================

export interface VerticalSeparatorProps {
  height?: string | number;
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  color?: 'default' | 'muted' | 'primary' | 'accent';
  className?: string;
}

export function VerticalSeparator({
  height = '100%',
  variant = 'solid',
  color = 'default',
  className = '',
}: VerticalSeparatorProps) {
  return (
    <Separator
      orientation="vertical"
      variant={variant}
      color={color}
      spacing="none"
      className={className}
      style={{ height: typeof height === 'number' ? `${height}px` : height } as any}
    />
  );
}

// ============================================================================
// Spacing Separator Component
// ============================================================================

export interface SpacingSeparatorProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  visible?: boolean;
  className?: string;
}

export function SpacingSeparator({
  size = 'md',
  visible = false,
  className = '',
}: SpacingSeparatorProps) {
  const sizeClasses = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16',
  };

  return (
    <div
      role="separator"
      className={`
        w-full
        ${sizeClasses[size]}
        ${visible ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
        ${className}
      `}
    />
  );
}

export default Separator;
