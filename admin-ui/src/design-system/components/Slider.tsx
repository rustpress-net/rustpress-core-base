/**
 * Slider Component (Enhancement #81)
 * Range and value slider inputs with various styles
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  showTooltip?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'segments';
  color?: 'primary' | 'success' | 'warning' | 'error';
  formatValue?: (value: number) => string;
  marks?: { value: number; label: string }[];
  className?: string;
}

export interface RangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValues?: boolean;
  showTooltip?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  formatValue?: (value: number) => string;
  minDistance?: number;
  className?: string;
}

export interface VerticalSliderProps extends Omit<SliderProps, 'className'> {
  height?: number;
  className?: string;
}

export interface SteppedSliderProps {
  value: number;
  onChange: (value: number) => void;
  steps: { value: number; label: string; description?: string }[];
  disabled?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const roundToStep = (value: number, step: number, min: number): number => {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
};

const getColorClasses = (color: string) => {
  const colors: Record<string, { track: string; thumb: string; gradient: string }> = {
    primary: {
      track: 'bg-primary-500',
      thumb: 'bg-primary-500 border-primary-600 hover:bg-primary-600',
      gradient: 'from-primary-400 to-primary-600',
    },
    success: {
      track: 'bg-success-500',
      thumb: 'bg-success-500 border-success-600 hover:bg-success-600',
      gradient: 'from-success-400 to-success-600',
    },
    warning: {
      track: 'bg-warning-500',
      thumb: 'bg-warning-500 border-warning-600 hover:bg-warning-600',
      gradient: 'from-warning-400 to-warning-600',
    },
    error: {
      track: 'bg-error-500',
      thumb: 'bg-error-500 border-error-600 hover:bg-error-600',
      gradient: 'from-error-400 to-error-600',
    },
  };
  return colors[color] || colors.primary;
};

const getSizeClasses = (size: string) => {
  const sizes: Record<string, { track: string; thumb: string; label: string }> = {
    sm: { track: 'h-1', thumb: 'w-3 h-3', label: 'text-xs' },
    md: { track: 'h-2', thumb: 'w-4 h-4', label: 'text-sm' },
    lg: { track: 'h-3', thumb: 'w-5 h-5', label: 'text-base' },
  };
  return sizes[size] || sizes.md;
};

// ============================================================================
// Slider Component
// ============================================================================

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  showTooltip = false,
  showTicks = false,
  tickCount = 5,
  label,
  size = 'md',
  variant = 'default',
  color = 'primary',
  formatValue = (v) => v.toString(),
  marks,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + percent * (max - min);
      const steppedValue = roundToStep(rawValue, step, min);
      const clampedValue = clamp(steppedValue, min, max);

      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    },
    [disabled, min, max, step, value, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      updateValue(e.clientX);
    },
    [disabled, updateValue]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      let newValue = value;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = clamp(value + step, min, max);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = clamp(value - step, min, max);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [disabled, value, step, min, max, onChange]
  );

  const ticks = showTicks
    ? Array.from({ length: tickCount }, (_, i) => (i / (tickCount - 1)) * 100)
    : [];

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className={`font-medium text-neutral-700 dark:text-neutral-300 ${sizeClasses.label}`}>
              {label}
            </label>
          )}
          {showValue && (
            <span className={`font-mono text-neutral-600 dark:text-neutral-400 ${sizeClasses.label}`}>
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      {/* Slider Track */}
      <div
        ref={trackRef}
        className={`
          relative w-full rounded-full cursor-pointer
          bg-neutral-200 dark:bg-neutral-700
          ${sizeClasses.track}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* Filled Track */}
        <div
          className={`
            absolute left-0 top-0 h-full rounded-full transition-all
            ${variant === 'gradient' ? `bg-gradient-to-r ${colorClasses.gradient}` : colorClasses.track}
          `}
          style={{ width: `${percentage}%` }}
        />

        {/* Ticks */}
        {showTicks && (
          <div className="absolute inset-0 flex justify-between px-1">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className={`
                  w-0.5 h-full rounded-full
                  ${tick <= percentage ? 'bg-white/50' : 'bg-neutral-400 dark:bg-neutral-500'}
                `}
              />
            ))}
          </div>
        )}

        {/* Thumb */}
        <motion.div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            rounded-full border-2 shadow-md
            transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            ${sizeClasses.thumb}
            ${colorClasses.thumb}
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
          `}
          style={{ left: `${percentage}%` }}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowTooltipState(true)}
          onBlur={() => setShowTooltipState(false)}
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => !isDragging && setShowTooltipState(false)}
          whileTap={{ scale: disabled ? 1 : 1.2 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (showTooltipState || isDragging) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded whitespace-nowrap"
              >
                {formatValue(value)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Marks */}
      {marks && marks.length > 0 && (
        <div className="relative mt-2">
          {marks.map((mark) => {
            const markPercent = ((mark.value - min) / (max - min)) * 100;
            return (
              <button
                key={mark.value}
                type="button"
                className={`
                  absolute -translate-x-1/2 text-xs
                  ${mark.value === value ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-500'}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-primary-500'}
                `}
                style={{ left: `${markPercent}%` }}
                onClick={() => !disabled && onChange(mark.value)}
                disabled={disabled}
              >
                {mark.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Range Slider Component
// ============================================================================

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValues = false,
  showTooltip = false,
  label,
  size = 'md',
  color = 'primary',
  formatValue = (v) => v.toString(),
  minDistance = 0,
  className = '',
}: RangeSliderProps) {
  const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const [startValue, endValue] = value;
  const startPercent = ((startValue - min) / (max - min)) * 100;
  const endPercent = ((endValue - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientX: number, thumbIndex: 0 | 1) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + percent * (max - min);
      const steppedValue = roundToStep(rawValue, step, min);

      const newValue: [number, number] = [...value] as [number, number];

      if (thumbIndex === 0) {
        newValue[0] = clamp(steppedValue, min, value[1] - minDistance);
      } else {
        newValue[1] = clamp(steppedValue, value[0] + minDistance, max);
      }

      if (newValue[0] !== value[0] || newValue[1] !== value[1]) {
        onChange(newValue);
      }
    },
    [disabled, min, max, step, value, minDistance, onChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (activeThumb !== null) {
        updateValue(e.clientX, activeThumb);
      }
    },
    [activeThumb, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setActiveThumb(null);
  }, []);

  useEffect(() => {
    if (activeThumb !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeThumb, handleMouseMove, handleMouseUp]);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const clickValue = min + percent * (max - min);

      // Determine which thumb is closer
      const distToStart = Math.abs(clickValue - startValue);
      const distToEnd = Math.abs(clickValue - endValue);

      if (distToStart <= distToEnd) {
        updateValue(e.clientX, 0);
      } else {
        updateValue(e.clientX, 1);
      }
    },
    [disabled, min, max, startValue, endValue, updateValue]
  );

  const renderThumb = (thumbIndex: 0 | 1, percent: number, thumbValue: number) => (
    <motion.div
      key={thumbIndex}
      className={`
        absolute top-1/2 -translate-y-1/2 -translate-x-1/2
        rounded-full border-2 shadow-md z-10
        transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizeClasses.thumb}
        ${colorClasses.thumb}
        ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
      `}
      style={{ left: `${percent}%` }}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (!disabled) setActiveThumb(thumbIndex);
      }}
      whileTap={{ scale: disabled ? 1 : 1.2 }}
    >
      <AnimatePresence>
        {showTooltip && activeThumb === thumbIndex && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded whitespace-nowrap"
          >
            {formatValue(thumbValue)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Values */}
      {(label || showValues) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className={`font-medium text-neutral-700 dark:text-neutral-300 ${sizeClasses.label}`}>
              {label}
            </label>
          )}
          {showValues && (
            <span className={`font-mono text-neutral-600 dark:text-neutral-400 ${sizeClasses.label}`}>
              {formatValue(startValue)} - {formatValue(endValue)}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className={`
          relative w-full rounded-full cursor-pointer
          bg-neutral-200 dark:bg-neutral-700
          ${sizeClasses.track}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleTrackClick}
      >
        {/* Filled Range */}
        <div
          className={`absolute top-0 h-full rounded-full ${colorClasses.track}`}
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Thumbs */}
        {renderThumb(0, startPercent, startValue)}
        {renderThumb(1, endPercent, endValue)}
      </div>
    </div>
  );
}

// ============================================================================
// Vertical Slider Component
// ============================================================================

export function VerticalSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  showTooltip = false,
  label,
  size = 'md',
  color = 'primary',
  formatValue = (v) => v.toString(),
  height = 200,
  className = '',
}: VerticalSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientY: number) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
      const rawValue = min + percent * (max - min);
      const steppedValue = roundToStep(rawValue, step, min);
      const clampedValue = clamp(steppedValue, min, max);

      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    },
    [disabled, min, max, step, value, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      updateValue(e.clientY);
    },
    [disabled, updateValue]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientY);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const trackWidth = size === 'sm' ? 'w-1' : size === 'lg' ? 'w-3' : 'w-2';

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {label && (
        <label className={`font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${sizeClasses.label}`}>
          {label}
        </label>
      )}

      <div
        ref={trackRef}
        className={`
          relative rounded-full cursor-pointer
          bg-neutral-200 dark:bg-neutral-700
          ${trackWidth}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ height }}
        onMouseDown={handleMouseDown}
      >
        {/* Filled Track */}
        <div
          className={`absolute bottom-0 left-0 w-full rounded-full ${colorClasses.track}`}
          style={{ height: `${percentage}%` }}
        />

        {/* Thumb */}
        <motion.div
          className={`
            absolute left-1/2 -translate-x-1/2 translate-y-1/2
            rounded-full border-2 shadow-md
            ${sizeClasses.thumb}
            ${colorClasses.thumb}
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
          `}
          style={{ bottom: `${percentage}%` }}
          whileTap={{ scale: disabled ? 1 : 1.2 }}
        >
          <AnimatePresence>
            {showTooltip && isDragging && (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded whitespace-nowrap"
              >
                {formatValue(value)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {showValue && (
        <span className={`font-mono text-neutral-600 dark:text-neutral-400 mt-2 ${sizeClasses.label}`}>
          {formatValue(value)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Stepped Slider Component
// ============================================================================

export function SteppedSlider({
  value,
  onChange,
  steps,
  disabled = false,
  showLabels = true,
  size = 'md',
  color = 'primary',
  className = '',
}: SteppedSliderProps) {
  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const currentIndex = steps.findIndex((s) => s.value === value);
  const percentage = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Track */}
      <div
        className={`
          relative w-full rounded-full
          bg-neutral-200 dark:bg-neutral-700
          ${sizeClasses.track}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {/* Filled Track */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${colorClasses.track}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Step Points */}
        {steps.map((step, index) => {
          const stepPercent = (index / (steps.length - 1)) * 100;
          const isActive = index <= currentIndex;
          const isCurrent = step.value === value;

          return (
            <button
              key={step.value}
              type="button"
              className={`
                absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                rounded-full border-2 transition-all
                ${isCurrent ? sizeClasses.thumb : 'w-3 h-3'}
                ${isActive ? `${colorClasses.thumb}` : 'bg-neutral-300 dark:bg-neutral-600 border-neutral-400 dark:border-neutral-500'}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
              `}
              style={{ left: `${stepPercent}%` }}
              onClick={() => !disabled && onChange(step.value)}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="relative mt-4">
          {steps.map((step, index) => {
            const stepPercent = (index / (steps.length - 1)) * 100;
            const isCurrent = step.value === value;

            return (
              <div
                key={step.value}
                className="absolute -translate-x-1/2 text-center"
                style={{ left: `${stepPercent}%` }}
              >
                <button
                  type="button"
                  className={`
                    text-xs font-medium
                    ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}
                    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-primary-500'}
                  `}
                  onClick={() => !disabled && onChange(step.value)}
                  disabled={disabled}
                >
                  {step.label}
                </button>
                {step.description && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 whitespace-nowrap">
                    {step.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Slider;
