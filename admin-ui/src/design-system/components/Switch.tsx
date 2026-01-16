/**
 * Switch Component (Enhancement #82)
 * Enhanced toggle switches with various styles
 */

import React, { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sun, Moon, Volume2, VolumeX } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill' | 'square' | 'ios';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showIcons?: boolean;
  onIcon?: React.ReactNode;
  offIcon?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  loading?: boolean;
  className?: string;
}

export interface SwitchGroupProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export interface LabeledSwitchProps extends SwitchProps {
  required?: boolean;
  error?: string;
  hint?: string;
}

export interface ThemeSwitchProps {
  isDark: boolean;
  onChange: (isDark: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ToggleButtonProps {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export interface ToggleButtonGroupProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  children: React.ReactNode;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getColorClasses = (color: string, checked: boolean) => {
  if (!checked) {
    return 'bg-neutral-300 dark:bg-neutral-600';
  }

  const colors: Record<string, string> = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return colors[color] || colors.primary;
};

const getSizeClasses = (size: string) => {
  const sizes: Record<string, { track: string; thumb: string; icon: string }> = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', icon: 'w-2 h-2' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', icon: 'w-3 h-3' },
    lg: { track: 'w-14 h-8', thumb: 'w-7 h-7', icon: 'w-4 h-4' },
  };
  return sizes[size] || sizes.md;
};

const getThumbPosition = (size: string, checked: boolean) => {
  const positions: Record<string, { on: number; off: number }> = {
    sm: { on: 18, off: 2 },
    md: { on: 22, off: 2 },
    lg: { on: 26, off: 2 },
  };
  const pos = positions[size] || positions.md;
  return checked ? pos.on : pos.off;
};

// ============================================================================
// Switch Component
// ============================================================================

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  variant = 'default',
  color = 'primary',
  showIcons = false,
  onIcon,
  offIcon,
  labelPosition = 'right',
  loading = false,
  className = '',
}: SwitchProps) {
  const id = useId();
  const sizeClasses = getSizeClasses(size);
  const colorClass = getColorClasses(color, checked);
  const thumbX = getThumbPosition(size, checked);

  const handleChange = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChange();
    }
  };

  const borderRadius = variant === 'square' ? 'rounded-md' : 'rounded-full';

  const renderSwitch = () => (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-disabled={disabled || loading}
      className={`
        relative inline-flex items-center shrink-0
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizeClasses.track}
        ${borderRadius}
        ${colorClass}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
    >
      {/* Icons in track */}
      {showIcons && (
        <>
          <span
            className={`
              absolute left-1 flex items-center justify-center
              text-white transition-opacity
              ${sizeClasses.icon}
              ${checked ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {onIcon || <Check className={sizeClasses.icon} />}
          </span>
          <span
            className={`
              absolute right-1 flex items-center justify-center
              text-neutral-500 transition-opacity
              ${sizeClasses.icon}
              ${!checked ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {offIcon || <X className={sizeClasses.icon} />}
          </span>
        </>
      )}

      {/* Thumb */}
      <motion.span
        className={`
          inline-block bg-white shadow-md
          ${sizeClasses.thumb}
          ${borderRadius}
        `}
        animate={{ x: thumbX }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`border-2 border-neutral-300 border-t-primary-500 rounded-full ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </span>
        )}
      </motion.span>
    </button>
  );

  if (!label && !description) {
    return <div className={className}>{renderSwitch()}</div>;
  }

  return (
    <div className={`flex items-start gap-3 ${labelPosition === 'left' ? 'flex-row-reverse' : ''} ${className}`}>
      {renderSwitch()}
      <div className="flex-1">
        {label && (
          <label
            htmlFor={id}
            className={`
              block font-medium text-neutral-900 dark:text-white
              ${disabled ? 'opacity-50' : 'cursor-pointer'}
              ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}
            `}
          >
            {label}
          </label>
        )}
        {description && (
          <p className={`text-neutral-500 dark:text-neutral-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Switch Group Component
// ============================================================================

export function SwitchGroup({
  children,
  label,
  description,
  orientation = 'vertical',
  className = '',
}: SwitchGroupProps) {
  return (
    <fieldset className={className}>
      {(label || description) && (
        <div className="mb-3">
          {label && (
            <legend className="text-sm font-semibold text-neutral-900 dark:text-white">
              {label}
            </legend>
          )}
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
      )}
      <div
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
        `}
      >
        {children}
      </div>
    </fieldset>
  );
}

// ============================================================================
// Labeled Switch Component
// ============================================================================

export function LabeledSwitch({
  required,
  error,
  hint,
  ...props
}: LabeledSwitchProps) {
  return (
    <div>
      <Switch {...props} />
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Theme Switch Component
// ============================================================================

export function ThemeSwitch({
  isDark,
  onChange,
  size = 'md',
  className = '',
}: ThemeSwitchProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative inline-flex items-center shrink-0 rounded-full
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizeClasses.track}
        ${isDark ? 'bg-indigo-600' : 'bg-amber-400'}
        ${className}
      `}
      onClick={() => onChange(!isDark)}
    >
      {/* Sun icon */}
      <motion.span
        className="absolute left-1 text-amber-100"
        animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.5 : 1 }}
      >
        <Sun className={sizeClasses.icon} />
      </motion.span>

      {/* Moon icon */}
      <motion.span
        className="absolute right-1 text-indigo-100"
        animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.5 }}
      >
        <Moon className={sizeClasses.icon} />
      </motion.span>

      {/* Thumb */}
      <motion.span
        className={`
          inline-block rounded-full shadow-md
          ${sizeClasses.thumb}
          ${isDark ? 'bg-indigo-200' : 'bg-white'}
        `}
        animate={{ x: getThumbPosition(size, isDark) }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ============================================================================
// Toggle Button Component
// ============================================================================

export function ToggleButton({
  pressed,
  onChange,
  children,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
}: ToggleButtonProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    default: pressed
      ? 'bg-primary-500 text-white border-primary-500'
      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700',
    outline: pressed
      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-500'
      : 'bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400',
    ghost: pressed
      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
      : 'bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-pressed={pressed}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${variant === 'ghost' ? 'border-transparent' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={() => !disabled && onChange(!pressed)}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Toggle Button Group Component
// ============================================================================

export function ToggleButtonGroup({
  value,
  onChange,
  children,
  multiple = false,
  size = 'md',
  className = '',
}: ToggleButtonGroupProps) {
  const handleToggle = (itemValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(itemValue)
        ? currentValues.filter((v) => v !== itemValue)
        : [...currentValues, itemValue];
      onChange(newValues);
    } else {
      onChange(itemValue === value ? '' : itemValue);
    }
  };

  return (
    <div
      className={`inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}
      role="group"
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        const itemValue = child.props.value;
        const isPressed = multiple
          ? (Array.isArray(value) ? value : []).includes(itemValue)
          : value === itemValue;

        return React.cloneElement(child as React.ReactElement<any>, {
          pressed: isPressed,
          onChange: () => handleToggle(itemValue),
          size,
          className: `rounded-none border-0 border-r border-neutral-200 dark:border-neutral-700 last:border-r-0 ${child.props.className || ''}`,
        });
      })}
    </div>
  );
}

// ============================================================================
// Toggle Button Item (for use with ToggleButtonGroup)
// ============================================================================

export interface ToggleButtonItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  pressed?: boolean;
  onChange?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToggleButtonItem({
  value,
  children,
  disabled = false,
  pressed = false,
  onChange,
  size = 'md',
  className = '',
}: ToggleButtonItemProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={pressed}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500
        ${sizeClasses[size]}
        ${
          pressed
            ? 'bg-primary-500 text-white'
            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={() => !disabled && onChange?.()}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Mute Switch (Specialized)
// ============================================================================

export interface MuteSwitchProps {
  muted: boolean;
  onChange: (muted: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MuteSwitch({
  muted,
  onChange,
  size = 'md',
  className = '',
}: MuteSwitchProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!muted}
      aria-label={muted ? 'Unmute' : 'Mute'}
      className={`
        relative inline-flex items-center shrink-0 rounded-full
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizeClasses.track}
        ${muted ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-success-500'}
        ${className}
      `}
      onClick={() => onChange(!muted)}
    >
      {/* Volume icon */}
      <motion.span
        className="absolute left-1 text-white"
        animate={{ opacity: muted ? 0 : 1 }}
      >
        <Volume2 className={sizeClasses.icon} />
      </motion.span>

      {/* Muted icon */}
      <motion.span
        className="absolute right-1 text-neutral-600"
        animate={{ opacity: muted ? 1 : 0 }}
      >
        <VolumeX className={sizeClasses.icon} />
      </motion.span>

      {/* Thumb */}
      <motion.span
        className={`
          inline-block rounded-full shadow-md bg-white
          ${sizeClasses.thumb}
        `}
        animate={{ x: getThumbPosition(size, !muted) }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default Switch;
