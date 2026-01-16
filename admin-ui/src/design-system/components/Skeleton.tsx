/**
 * RustPress Skeleton Component
 * Loading placeholders with shimmer animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animate?: boolean;
  style?: React.CSSProperties;
}

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export function Skeleton({
  className,
  width,
  height,
  rounded = 'md',
  animate = true,
  style,
}: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'bg-neutral-200 dark:bg-neutral-800',
        roundedStyles[rounded],
        animate && 'animate-pulse',
        className
      )}
      style={{ width, height, ...style }}
    />
  );
}

// Shimmer effect skeleton
export function ShimmerSkeleton({
  className,
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-neutral-200 dark:bg-neutral-800',
        roundedStyles[rounded],
        className
      )}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Text skeleton
export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '70%',
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          className={cn(
            i === lines - 1 ? `w-[${lastLineWidth}]` : 'w-full'
          )}
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton className={cn(sizes[size], className)} rounded="full" />;
}

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-6 rounded-xl border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <Skeleton height={20} className="w-32 mb-2" />
          <Skeleton height={14} className="w-24" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-3 mt-4">
        <Skeleton height={36} className="flex-1" rounded="lg" />
        <Skeleton height={36} className="w-36" rounded="lg" />
      </div>
    </div>
  );
}

// Table skeleton
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            height={20}
            className={cn(
              i === 0 ? 'w-12' : 'flex-1',
              i === columns - 1 && 'w-24'
            )}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 p-4 border-b border-neutral-100 dark:border-neutral-800"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              height={16}
              className={cn(
                colIndex === 0 ? 'w-12' : 'flex-1',
                colIndex === columns - 1 && 'w-24'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Dashboard stats skeleton
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton height={14} className="w-20 mb-2" />
              <Skeleton height={32} className="w-28 mb-2" />
              <Skeleton height={12} className="w-16" />
            </div>
            <Skeleton height={48} width={48} rounded="xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Post item skeleton
export function SkeletonPost({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-xl',
        'border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
        className
      )}
    >
      <Skeleton height={80} width={120} rounded="lg" />
      <div className="flex-1">
        <Skeleton height={20} className="w-3/4 mb-2" />
        <Skeleton height={14} className="w-full mb-2" />
        <Skeleton height={14} className="w-1/2 mb-3" />
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <Skeleton height={12} className="w-24" />
          <Skeleton height={12} className="w-16" />
        </div>
      </div>
    </div>
  );
}

// List item skeleton
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3',
        className
      )}
    >
      <SkeletonAvatar size="md" />
      <div className="flex-1">
        <Skeleton height={16} className="w-32 mb-1.5" />
        <Skeleton height={12} className="w-48" />
      </div>
      <Skeleton height={28} width={80} rounded="lg" />
    </div>
  );
}

export default Skeleton;
