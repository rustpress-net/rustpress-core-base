/**
 * RustPress Card Component
 * Versatile card with glassmorphism and elevation options
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils';
import { scaleIn, fadeInUp } from '../animations';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: CardPadding;
  isHoverable?: boolean;
  isClickable?: boolean;
  isAnimated?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-white dark:bg-neutral-900
    border border-neutral-200 dark:border-neutral-800
  `,
  elevated: `
    bg-white dark:bg-neutral-900
    shadow-lg dark:shadow-2xl
    border border-neutral-100 dark:border-neutral-800
  `,
  outlined: `
    bg-transparent
    border-2 border-neutral-200 dark:border-neutral-700
  `,
  glass: `
    bg-white/70 dark:bg-neutral-900/70
    backdrop-blur-xl backdrop-saturate-150
    border border-white/20 dark:border-neutral-700/50
    shadow-lg
  `,
  gradient: `
    bg-gradient-to-br from-white via-neutral-50 to-neutral-100
    dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-800
    border border-neutral-200 dark:border-neutral-700
    shadow-md
  `,
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      isHoverable = false,
      isClickable = false,
      isAnimated = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={isAnimated ? 'initial' : undefined}
        animate={isAnimated ? 'animate' : undefined}
        variants={isAnimated ? fadeInUp : undefined}
        whileHover={
          isHoverable
            ? {
                y: -4,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                transition: { duration: 0.2 },
              }
            : undefined
        }
        whileTap={
          isClickable
            ? {
                scale: 0.98,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        className={cn(
          'rounded-xl',
          'transition-all duration-200',
          variantStyles[variant],
          paddingStyles[padding],
          isClickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        'pb-4 mb-4',
        'border-b border-neutral-100 dark:border-neutral-800',
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Card Body
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export function CardBody({ padding, children, className, ...props }: CardBodyProps) {
  return (
    <div
      className={cn(
        'text-neutral-700 dark:text-neutral-300',
        padding && paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Footer
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export function CardFooter({
  align = 'right',
  children,
  className,
  ...props
}: CardFooterProps) {
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
        'pt-4 mt-4',
        'border-t border-neutral-100 dark:border-neutral-800',
        alignStyles[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Stat Card for dashboards
export interface StatCardProps extends CardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  label,
  value,
  change,
  icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      variant="elevated"
      padding="lg"
      isHoverable
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 dark:bg-primary-500/10 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent-500/5 dark:bg-accent-500/10 rounded-full" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {value}
          </p>
          {change && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium mt-2',
                change.type === 'increase' && 'text-success-600 dark:text-success-400',
                change.type === 'decrease' && 'text-error-600 dark:text-error-400'
              )}
            >
              <span>{change.type === 'increase' ? '+' : ''}{change.value}%</span>
              <span className="text-neutral-400">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-3 rounded-xl',
              'bg-primary-50 dark:bg-primary-900/30',
              'text-primary-600 dark:text-primary-400'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Feature Card with icon
export interface FeatureCardProps extends CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <Card
      variant="default"
      padding="lg"
      isHoverable
      className={cn('text-center', className)}
      {...props}
    >
      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 mb-4">
        <span className="text-primary-600 dark:text-primary-400 w-8 h-8">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </Card>
  );
}

export default Card;
