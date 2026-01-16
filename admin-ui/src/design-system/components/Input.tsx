/**
 * RustPress Input Component
 * Enterprise-grade input with multiple variants and states
 */

import React, { forwardRef, InputHTMLAttributes, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';
import { cn } from '../utils';
import { fadeInUp } from '../animations';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'flushed';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  size?: InputSize;
  variant?: InputVariant;
  isRequired?: boolean;
  isClearable?: boolean;
  onClear?: () => void;
  inputClassName?: string;
}

const sizeStyles: Record<InputSize, { input: string; icon: string; addon: string }> = {
  sm: {
    input: 'h-8 px-3 text-sm',
    icon: 'w-4 h-4',
    addon: 'px-2.5 text-sm',
  },
  md: {
    input: 'h-10 px-4 text-sm',
    icon: 'w-4 h-4',
    addon: 'px-3 text-sm',
  },
  lg: {
    input: 'h-12 px-4 text-base',
    icon: 'w-5 h-5',
    addon: 'px-4 text-base',
  },
};

const variantStyles: Record<InputVariant, { container: string; input: string }> = {
  default: {
    container: 'rounded-lg border-2',
    input: 'bg-transparent',
  },
  filled: {
    container: 'rounded-lg border-2 border-transparent',
    input: 'bg-neutral-100 dark:bg-neutral-800',
  },
  flushed: {
    container: 'border-b-2 rounded-none',
    input: 'bg-transparent px-0',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      size = 'md',
      variant = 'default',
      isRequired = false,
      isClearable = false,
      onClear,
      className,
      inputClassName,
      type = 'text',
      disabled,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const hasValue = value !== undefined && value !== '';

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const sizeConfig = sizeStyles[size];
    const variantConfig = variantStyles[variant];

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              'text-neutral-700 dark:text-neutral-300',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {isRequired && (
              <span className="text-error-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input container */}
        <div className="relative flex">
          {/* Left addon */}
          {leftAddon && (
            <div
              className={cn(
                'flex items-center border-2 border-r-0 rounded-l-lg',
                'bg-neutral-50 dark:bg-neutral-800',
                'text-neutral-600 dark:text-neutral-400',
                'border-neutral-200 dark:border-neutral-700',
                sizeConfig.addon,
                hasError && 'border-error-300 dark:border-error-700',
                hasSuccess && 'border-success-300 dark:border-success-700'
              )}
            >
              {leftAddon}
            </div>
          )}

          {/* Input wrapper */}
          <div
            className={cn(
              'relative flex items-center flex-1',
              'transition-all duration-200',
              variantConfig.container,

              // Border colors
              !hasError && !hasSuccess && [
                'border-neutral-200 dark:border-neutral-700',
                isFocused && 'border-primary-500 dark:border-primary-400',
                'hover:border-neutral-300 dark:hover:border-neutral-600',
              ],
              hasError && 'border-error-500 dark:border-error-400',
              hasSuccess && 'border-success-500 dark:border-success-400',

              // Focus ring
              isFocused && [
                'ring-2 ring-offset-0',
                !hasError && !hasSuccess && 'ring-primary-500/20',
                hasError && 'ring-error-500/20',
                hasSuccess && 'ring-success-500/20',
              ],

              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900',

              // Addon adjustments
              leftAddon && 'rounded-l-none',
              rightAddon && 'rounded-r-none'
            )}
          >
            {/* Left icon */}
            {leftIcon && (
              <span
                className={cn(
                  'absolute left-3 text-neutral-400 pointer-events-none',
                  sizeConfig.icon
                )}
              >
                {leftIcon}
              </span>
            )}

            {/* Input element */}
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              disabled={disabled}
              value={value}
              onChange={onChange}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
              className={cn(
                'w-full outline-none',
                'text-neutral-900 dark:text-neutral-100',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                sizeConfig.input,
                variantConfig.input,
                leftIcon && 'pl-10',
                (rightIcon || isPassword || isClearable || hasError || hasSuccess) && 'pr-10',
                inputClassName
              )}
              {...props}
            />

            {/* Right side icons */}
            <div className="absolute right-3 flex items-center gap-1.5">
              {/* Clear button */}
              {isClearable && hasValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={cn(
                    'p-0.5 rounded-full',
                    'text-neutral-400 hover:text-neutral-600',
                    'dark:text-neutral-500 dark:hover:text-neutral-300',
                    'transition-colors duration-150'
                  )}
                  aria-label="Clear input"
                >
                  <X className={sizeConfig.icon} />
                </button>
              )}

              {/* Password toggle */}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'p-0.5 rounded',
                    'text-neutral-400 hover:text-neutral-600',
                    'dark:text-neutral-500 dark:hover:text-neutral-300',
                    'transition-colors duration-150'
                  )}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className={sizeConfig.icon} />
                  ) : (
                    <Eye className={sizeConfig.icon} />
                  )}
                </button>
              )}

              {/* Status icon */}
              {hasError && !isPassword && (
                <AlertCircle className={cn(sizeConfig.icon, 'text-error-500')} />
              )}
              {hasSuccess && !isPassword && (
                <CheckCircle2 className={cn(sizeConfig.icon, 'text-success-500')} />
              )}

              {/* Custom right icon */}
              {rightIcon && !isPassword && !hasError && !hasSuccess && (
                <span className={cn('text-neutral-400', sizeConfig.icon)}>
                  {rightIcon}
                </span>
              )}
            </div>
          </div>

          {/* Right addon */}
          {rightAddon && (
            <div
              className={cn(
                'flex items-center border-2 border-l-0 rounded-r-lg',
                'bg-neutral-50 dark:bg-neutral-800',
                'text-neutral-600 dark:text-neutral-400',
                'border-neutral-200 dark:border-neutral-700',
                sizeConfig.addon,
                hasError && 'border-error-300 dark:border-error-700',
                hasSuccess && 'border-success-300 dark:border-success-700'
              )}
            >
              {rightAddon}
            </div>
          )}
        </div>

        {/* Helper text / Error message */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.div
              key={error ? 'error' : success ? 'success' : 'helper'}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5"
            >
              {error && (
                <p
                  id={`${inputId}-error`}
                  className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1"
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
              {success && !error && (
                <p className="text-sm text-success-600 dark:text-success-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {success}
                </p>
              )}
              {helperText && !error && !success && (
                <p
                  id={`${inputId}-helper`}
                  className="text-sm text-neutral-500 dark:text-neutral-400"
                >
                  {helperText}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input variant
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, isClearable = true, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search />}
        isClearable={isClearable}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default Input;
