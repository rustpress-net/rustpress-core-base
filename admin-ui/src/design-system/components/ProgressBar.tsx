/**
 * ProgressBar Component (Enhancement #83)
 * Linear and circular progress indicators
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped' | 'animated';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  formatValue?: (value: number, max: number) => string;
  className?: string;
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  formatValue?: (value: number) => string;
  children?: React.ReactNode;
  className?: string;
}

export interface IndeterminateProgressProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  variant?: 'bar' | 'dots' | 'pulse';
  label?: string;
  className?: string;
}

export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showNumbers?: boolean;
  className?: string;
}

export interface UploadProgressProps {
  progress: number;
  fileName?: string;
  fileSize?: string;
  status?: 'uploading' | 'complete' | 'error' | 'paused';
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

export interface MultiProgressProps {
  segments: { value: number; color: string; label?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getColorClasses = (color: string) => {
  const colors: Record<string, { bar: string; gradient: string; text: string }> = {
    primary: {
      bar: 'bg-primary-500',
      gradient: 'from-primary-400 to-primary-600',
      text: 'text-primary-600 dark:text-primary-400',
    },
    success: {
      bar: 'bg-success-500',
      gradient: 'from-success-400 to-success-600',
      text: 'text-success-600 dark:text-success-400',
    },
    warning: {
      bar: 'bg-warning-500',
      gradient: 'from-warning-400 to-warning-600',
      text: 'text-warning-600 dark:text-warning-400',
    },
    error: {
      bar: 'bg-error-500',
      gradient: 'from-error-400 to-error-600',
      text: 'text-error-600 dark:text-error-400',
    },
    neutral: {
      bar: 'bg-neutral-500',
      gradient: 'from-neutral-400 to-neutral-600',
      text: 'text-neutral-600 dark:text-neutral-400',
    },
  };
  return colors[color] || colors.primary;
};

const getSizeClasses = (size: string) => {
  const sizes: Record<string, { height: string; text: string }> = {
    xs: { height: 'h-1', text: 'text-xs' },
    sm: { height: 'h-2', text: 'text-xs' },
    md: { height: 'h-3', text: 'text-sm' },
    lg: { height: 'h-4', text: 'text-sm' },
  };
  return sizes[size] || sizes.md;
};

// ============================================================================
// ProgressBar Component
// ============================================================================

export function ProgressBar({
  value,
  max = 100,
  showValue = false,
  showLabel = false,
  label,
  size = 'md',
  variant = 'default',
  color = 'primary',
  formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const getBarClasses = () => {
    const base = 'h-full rounded-full transition-all duration-500';

    switch (variant) {
      case 'gradient':
        return `${base} bg-gradient-to-r ${colorClasses.gradient}`;
      case 'striped':
        return `${base} ${colorClasses.bar} bg-stripes`;
      case 'animated':
        return `${base} ${colorClasses.bar} bg-stripes animate-stripes`;
      default:
        return `${base} ${colorClasses.bar}`;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Value Row */}
      {(showLabel || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {showLabel && label && (
            <span className={`font-medium text-neutral-700 dark:text-neutral-300 ${sizeClasses.text}`}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={`font-mono ${colorClasses.text} ${sizeClasses.text}`}>
              {formatValue(value, max)}
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div
        className={`
          w-full rounded-full overflow-hidden
          bg-neutral-200 dark:bg-neutral-700
          ${sizeClasses.height}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={getBarClasses()}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Circular Progress Component
// ============================================================================

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  color = 'primary',
  formatValue = (v) => `${Math.round(v)}%`,
  children,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = getColorClasses(color);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-200 dark:text-neutral-700"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClasses.text}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className={`font-semibold ${colorClasses.text} ${size < 80 ? 'text-sm' : size < 120 ? 'text-lg' : 'text-2xl'}`}>
            {formatValue(percentage)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Indeterminate Progress Component
// ============================================================================

export function IndeterminateProgress({
  size = 'md',
  color = 'primary',
  variant = 'bar',
  label,
  className = '',
}: IndeterminateProgressProps) {
  const sizeClasses = getSizeClasses(size);
  const colorClasses = getColorClasses(color);

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full ${colorClasses.bar} ${size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {label && (
          <span className={`ml-2 text-neutral-600 dark:text-neutral-400 ${sizeClasses.text}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          className={`rounded-full ${colorClasses.bar} ${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {label && (
          <span className={`text-neutral-600 dark:text-neutral-400 ${sizeClasses.text}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Default bar variant
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <span className={`block mb-1.5 text-neutral-600 dark:text-neutral-400 ${sizeClasses.text}`}>
          {label}
        </span>
      )}
      <div
        className={`
          w-full rounded-full overflow-hidden
          bg-neutral-200 dark:bg-neutral-700
          ${sizeClasses.height}
        `}
      >
        <motion.div
          className={`h-full rounded-full ${colorClasses.bar}`}
          initial={{ x: '-100%', width: '30%' }}
          animate={{ x: '400%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Step Progress Component
// ============================================================================

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  size = 'md',
  color = 'primary',
  showNumbers = true,
  className = '',
}: StepProgressProps) {
  const colorClasses = getColorClasses(color);
  const stepSize = size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
  const lineHeight = size === 'sm' ? 'h-0.5' : size === 'lg' ? 'h-1' : 'h-0.5';

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={i}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`
                    flex items-center justify-center rounded-full font-medium
                    ${stepSize}
                    ${isCompleted ? `${colorClasses.bar} text-white` : ''}
                    ${isCurrent ? `ring-2 ring-offset-2 ${colorClasses.bar} text-white` : ''}
                    ${isUpcoming ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500' : ''}
                  `}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : showNumbers ? (
                    stepNumber
                  ) : null}
                </motion.div>
                {/* Label */}
                {labels && labels[i] && (
                  <span
                    className={`
                      mt-2 text-center whitespace-nowrap
                      ${size === 'sm' ? 'text-xs' : 'text-sm'}
                      ${isCurrent ? colorClasses.text + ' font-medium' : 'text-neutral-500'}
                    `}
                  >
                    {labels[i]}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {i < totalSteps - 1 && (
                <div className={`flex-1 mx-2 ${lineHeight} bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden`}>
                  <motion.div
                    className={`h-full ${colorClasses.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Upload Progress Component
// ============================================================================

export function UploadProgress({
  progress,
  fileName,
  fileSize,
  status = 'uploading',
  onCancel,
  onRetry,
  className = '',
}: UploadProgressProps) {
  const statusConfig = {
    uploading: { color: 'primary', icon: null, text: `Uploading... ${progress}%` },
    complete: { color: 'success', icon: <Check className="w-4 h-4" />, text: 'Complete' },
    error: { color: 'error', icon: <X className="w-4 h-4" />, text: 'Failed' },
    paused: { color: 'warning', icon: null, text: 'Paused' },
  };

  const config = statusConfig[status];
  const colorClasses = getColorClasses(config.color);

  return (
    <div className={`p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {config.icon && (
            <span className={colorClasses.text}>{config.icon}</span>
          )}
          {status === 'uploading' && (
            <Loader2 className={`w-4 h-4 animate-spin ${colorClasses.text}`} />
          )}
          <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
            {fileName || 'File'}
          </span>
          {fileSize && (
            <span className="text-xs text-neutral-500">{fileSize}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${colorClasses.text}`}>{config.text}</span>
          {status === 'uploading' && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {status === 'error' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Retry
            </button>
          )}
        </div>
      </div>
      <ProgressBar
        value={status === 'complete' ? 100 : progress}
        size="sm"
        color={config.color as any}
        variant={status === 'uploading' ? 'animated' : 'default'}
      />
    </div>
  );
}

// ============================================================================
// Multi-Segment Progress Component
// ============================================================================

export function MultiProgress({
  segments,
  max = 100,
  size = 'md',
  showLegend = false,
  className = '',
}: MultiProgressProps) {
  const sizeClasses = getSizeClasses(size);
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={className}>
      {/* Progress Bar */}
      <div
        className={`
          w-full rounded-full overflow-hidden flex
          bg-neutral-200 dark:bg-neutral-700
          ${sizeClasses.height}
        `}
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {segments.map((segment, i) => {
          const percentage = (segment.value / max) * 100;
          return (
            <motion.div
              key={i}
              className="h-full"
              style={{ backgroundColor: segment.color }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-3">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className={`text-neutral-600 dark:text-neutral-400 ${sizeClasses.text}`}>
                {segment.label || `Segment ${i + 1}`}: {segment.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Animated Counter (for progress values)
// ============================================================================

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  formatValue = (v) => Math.round(v).toString(),
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatValue(displayValue)}</span>;
}

export default ProgressBar;
