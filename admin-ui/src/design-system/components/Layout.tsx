/**
 * RustPress Layout Components
 * Admin layout structure with sidebar and content area
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { pageSlide, pageFade, staggerContainer, staggerItem } from '../animations';

// Main Admin Layout
export interface AdminLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function AdminLayout({
  children,
  sidebar,
  header,
  className,
}: AdminLayoutProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden', className)}>
      {/* Sidebar */}
      {sidebar}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        {header}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-neutral-900">
          {children}
        </main>
      </div>
    </div>
  );
}

// Page container with consistent padding
export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
}

const maxWidthStyles = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1400px]',
  '3xl': 'max-w-[1600px]',
  full: 'max-w-full',
};

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function PageContainer({
  children,
  className,
  maxWidth = '2xl',
  padding = 'md',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthStyles[maxWidth],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Animated page wrapper
export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transition?: 'slide' | 'fade' | 'scale';
}

export function PageTransition({
  children,
  className,
  transition = 'slide',
}: PageTransitionProps) {
  const variants = {
    slide: pageSlide,
    fade: pageFade,
    scale: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[transition]}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page Header with title and actions
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 lg:mb-8', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-neutral-300 dark:text-neutral-600">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-neutral-700 dark:text-neutral-200 font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

// Content section
export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Section({
  children,
  className,
  title,
  description,
  actions,
  padding = 'md',
}: SectionProps) {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <section
      className={cn(
        'bg-white dark:bg-neutral-900',
        'rounded-2xl',
        'border border-neutral-200 dark:border-neutral-800',
        paddingMap[padding],
        className
      )}
    >
      {(title || description || actions) && (
        <div className={cn('flex items-start justify-between gap-4', padding !== 'none' && 'mb-6')}>
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// Grid layout
export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Alias for cols */
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12',
};

const gapStyles = {
  sm: 'gap-3',
  md: 'gap-4 lg:gap-6',
  lg: 'gap-6 lg:gap-8',
};

export function Grid({ children, cols, columns, gap = 'md', className }: GridProps) {
  const columnCount = cols ?? columns ?? 3;
  return (
    <div className={cn('grid', colStyles[columnCount], gapStyles[gap], className)}>
      {children}
    </div>
  );
}

// Animated stagger grid
export function AnimatedGrid({
  children,
  cols,
  columns,
  gap = 'md',
  className,
}: GridProps) {
  const columnCount = cols ?? columns ?? 3;
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('grid', colStyles[columnCount], gapStyles[gap], className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Stack layout (vertical)
export interface StackProps {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const stackGapStyles = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
};

export function Stack({ children, gap = 'md', className }: StackProps) {
  return <div className={cn(stackGapStyles[gap], className)}>{children}</div>;
}

// Flex row layout
export interface FlexProps {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

const flexGapStyles = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export function Flex({
  children,
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        flexGapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

// Divider
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export function Divider({
  orientation = 'horizontal',
  className,
  label,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'w-px self-stretch',
          'bg-neutral-200 dark:bg-neutral-800',
          className
        )}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn('flex items-center gap-4', className)}
        role="separator"
        aria-orientation="horizontal"
      >
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-px w-full',
        'bg-neutral-200 dark:bg-neutral-800',
        className
      )}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}

// Empty state
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default AdminLayout;
