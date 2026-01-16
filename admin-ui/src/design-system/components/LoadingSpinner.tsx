/**
 * LoadingSpinner Component (Enhancement #99)
 * Various loading indicators and spinners
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  blur?: boolean;
  spinnerSize?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  spinnerPosition?: 'left' | 'right';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export interface ProgressLoaderProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  variant?: 'linear' | 'circular';
  className?: string;
}

export interface InlineLoaderProps {
  text?: string;
  className?: string;
}

// ============================================================================
// Size and Color Configurations
// ============================================================================

const sizeConfig = {
  xs: { spinner: 'w-3 h-3', text: 'text-xs' },
  sm: { spinner: 'w-4 h-4', text: 'text-sm' },
  md: { spinner: 'w-6 h-6', text: 'text-base' },
  lg: { spinner: 'w-8 h-8', text: 'text-lg' },
  xl: { spinner: 'w-12 h-12', text: 'text-xl' },
};

const colorConfig = {
  primary: 'border-primary-500 text-primary-500',
  secondary: 'border-neutral-500 text-neutral-500',
  white: 'border-white text-white',
  current: 'border-current text-current',
};

// ============================================================================
// Loading Spinner Component
// ============================================================================

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  variant = 'spinner',
  label = 'Loading...',
  showLabel = false,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = sizeConfig[size];

  // Spinner variant
  if (variant === 'spinner') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-label={label}>
        <div
          className={`
            ${sizeClasses.spinner}
            border-2 rounded-full
            border-neutral-200 dark:border-neutral-700
            ${color === 'primary' ? 'border-t-primary-500' : ''}
            ${color === 'secondary' ? 'border-t-neutral-500' : ''}
            ${color === 'white' ? 'border-t-white' : ''}
            ${color === 'current' ? 'border-t-current' : ''}
            animate-spin
          `}
        />
        {showLabel && (
          <span className={`${sizeClasses.text} text-neutral-600 dark:text-neutral-400`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    const dotSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : size === 'xl' ? 'w-4 h-4' : 'w-2 h-2';
    const dotColor = color === 'primary' ? 'bg-primary-500' : color === 'white' ? 'bg-white' : 'bg-neutral-500';

    return (
      <div className={`inline-flex items-center gap-1 ${className}`} role="status" aria-label={label}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSize} ${dotColor} rounded-full`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {showLabel && (
          <span className={`ml-2 ${sizeClasses.text} text-neutral-600 dark:text-neutral-400`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    const pulseColor = color === 'primary' ? 'bg-primary-500' : color === 'white' ? 'bg-white' : 'bg-neutral-500';

    return (
      <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-label={label}>
        <motion.div
          className={`${sizeClasses.spinner} ${pulseColor} rounded-full`}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {showLabel && (
          <span className={`${sizeClasses.text} text-neutral-600 dark:text-neutral-400`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Bars variant
  if (variant === 'bars') {
    const barHeight = size === 'xs' ? 'h-3' : size === 'sm' ? 'h-4' : size === 'lg' ? 'h-6' : size === 'xl' ? 'h-8' : 'h-5';
    const barColor = color === 'primary' ? 'bg-primary-500' : color === 'white' ? 'bg-white' : 'bg-neutral-500';

    return (
      <div className={`inline-flex items-end gap-0.5 ${className}`} role="status" aria-label={label}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-1 ${barHeight} ${barColor} rounded-sm`}
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            style={{ transformOrigin: 'bottom' }}
          />
        ))}
        {showLabel && (
          <span className={`ml-2 ${sizeClasses.text} text-neutral-600 dark:text-neutral-400`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Ring variant
  if (variant === 'ring') {
    const ringColor = color === 'primary' ? 'stroke-primary-500' : color === 'white' ? 'stroke-white' : 'stroke-neutral-500';
    const ringSize = size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'lg' ? 32 : size === 'xl' ? 48 : 24;

    return (
      <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-label={label}>
        <svg
          width={ringSize}
          height={ringSize}
          viewBox="0 0 24 24"
          fill="none"
          className="animate-spin"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeWidth="2"
            className="stroke-neutral-200 dark:stroke-neutral-700"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            strokeWidth="2"
            strokeLinecap="round"
            className={ringColor}
          />
        </svg>
        {showLabel && (
          <span className={`${sizeClasses.text} text-neutral-600 dark:text-neutral-400`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return null;
}

// ============================================================================
// Loading Overlay Component
// ============================================================================

export function LoadingOverlay({
  loading,
  children,
  blur = true,
  spinnerSize = 'md',
  message,
  className = '',
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            absolute inset-0 z-50
            flex flex-col items-center justify-center
            bg-white/80 dark:bg-neutral-900/80
            ${blur ? 'backdrop-blur-sm' : ''}
          `}
        >
          <LoadingSpinner size={spinnerSize} />
          {message && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Loading Button Component
// ============================================================================

export function LoadingButton({
  loading,
  children,
  loadingText,
  spinnerPosition = 'left',
  disabled,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
}: LoadingButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 disabled:bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:border-neutral-200 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
  };

  const spinnerColor = variant === 'primary' ? 'white' : 'current';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-colors
        disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading && spinnerPosition === 'left' && (
        <LoadingSpinner size="sm" color={spinnerColor as any} />
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
      {loading && spinnerPosition === 'right' && (
        <LoadingSpinner size="sm" color={spinnerColor as any} />
      )}
    </button>
  );
}

// ============================================================================
// Skeleton Loader Component
// ============================================================================

export function SkeletonLoader({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'pulse',
  className = '',
}: SkeletonLoaderProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'circular') {
    style.width = style.height;
  }

  return (
    <div
      className={`
        bg-neutral-200 dark:bg-neutral-700
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
      role="status"
      aria-label="Loading"
    />
  );
}

// ============================================================================
// Progress Loader Component
// ============================================================================

export function ProgressLoader({
  progress,
  size = 'md',
  showPercentage = true,
  color = 'primary',
  variant = 'linear',
  className = '',
}: ProgressLoaderProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const sizeClasses = {
    sm: variant === 'linear' ? 'h-1' : 'w-16 h-16',
    md: variant === 'linear' ? 'h-2' : 'w-24 h-24',
    lg: variant === 'linear' ? 'h-3' : 'w-32 h-32',
  };

  if (variant === 'circular') {
    const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
    const radius = 45 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedProgress / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-neutral-200 dark:stroke-neutral-700"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colorClasses[color].replace('bg-', 'stroke-')}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            style={{
              strokeDasharray: circumference,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        {showPercentage && (
          <span className="absolute text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full ${colorClasses[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 text-right">
          {Math.round(clampedProgress)}%
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Inline Loader Component
// ============================================================================

export function InlineLoader({
  text = 'Loading',
  className = '',
}: InlineLoaderProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{text}</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      >
        .
      </motion.span>
    </span>
  );
}

// ============================================================================
// Full Page Loader Component
// ============================================================================

export interface FullPageLoaderProps {
  message?: string;
  showLogo?: boolean;
  logo?: React.ReactNode;
  className?: string;
}

export function FullPageLoader({
  message = 'Loading...',
  showLogo = false,
  logo,
  className = '',
}: FullPageLoaderProps) {
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex flex-col items-center justify-center
        bg-white dark:bg-neutral-950
        ${className}
      `}
    >
      {showLogo && logo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          {logo}
        </motion.div>
      )}

      <LoadingSpinner size="lg" />

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-neutral-600 dark:text-neutral-400"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// Content Loader Component
// ============================================================================

export interface ContentLoaderProps {
  loading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  errorFallback?: React.ReactNode;
  minHeight?: string | number;
  className?: string;
}

export function ContentLoader({
  loading,
  error,
  children,
  skeleton,
  errorFallback,
  minHeight = '200px',
  className = '',
}: ContentLoaderProps) {
  const style: React.CSSProperties = {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
  };

  if (error) {
    return (
      <div className={className} style={style}>
        {errorFallback || (
          <div className="flex items-center justify-center h-full text-red-500">
            Error loading content
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className} style={style}>
        {skeleton || (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export default LoadingSpinner;
