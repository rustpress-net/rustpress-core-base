/**
 * FormField Component (Enhancement #102)
 * Form field wrappers with labels, validation, and error handling
 */

import React, { forwardRef, createContext, useContext, useId, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  HelpCircle,
  X,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  id?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled';
}

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface CheckboxFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface RadioGroupProps {
  label?: string;
  description?: string;
  error?: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface PasswordFieldProps extends Omit<InputFieldProps, 'type'> {
  showStrength?: boolean;
  strengthValue?: number;
}

export interface FieldGroupProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface FormFieldContextValue {
  id: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  return useContext(FormFieldContext);
}

// ============================================================================
// FormField Component
// ============================================================================

export function FormField({
  label,
  description,
  error,
  success,
  hint,
  required = false,
  optional = false,
  disabled = false,
  children,
  className = '',
  labelClassName = '',
  id: providedId,
  layout = 'vertical',
  size = 'md',
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  const sizeClasses = {
    sm: {
      label: 'text-xs',
      description: 'text-xs',
      message: 'text-xs',
    },
    md: {
      label: 'text-sm',
      description: 'text-xs',
      message: 'text-xs',
    },
    lg: {
      label: 'text-base',
      description: 'text-sm',
      message: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  const layoutClasses = {
    vertical: 'flex flex-col gap-1.5',
    horizontal: 'flex flex-row items-start gap-4',
    inline: 'flex flex-row items-center gap-2',
  };

  return (
    <FormFieldContext.Provider value={{ id, error, disabled, required }}>
      <div className={`${layoutClasses[layout]} ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className={`
              font-medium text-neutral-700 dark:text-neutral-300
              ${sizes.label}
              ${layout === 'horizontal' ? 'min-w-[120px] pt-2' : ''}
              ${disabled ? 'opacity-50' : ''}
              ${labelClassName}
            `}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            )}
            {optional && (
              <span className="text-neutral-400 ml-1 font-normal">(optional)</span>
            )}
          </label>
        )}

        <div className={`flex-1 ${layout === 'horizontal' ? 'flex flex-col gap-1.5' : ''}`}>
          {description && (
            <p className={`text-neutral-500 dark:text-neutral-400 ${sizes.description}`}>
              {description}
            </p>
          )}

          {children}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`flex items-center gap-1.5 text-red-600 dark:text-red-400 ${sizes.message}`}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && !error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`flex items-center gap-1.5 text-green-600 dark:text-green-400 ${sizes.message}`}
              >
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
            {hint && !error && !success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`flex items-center gap-1.5 text-neutral-500 ${sizes.message}`}
              >
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{hint}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FormFieldContext.Provider>
  );
}

// ============================================================================
// InputField Component
// ============================================================================

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      description,
      error,
      success,
      hint,
      required = false,
      optional = false,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      size = 'md',
      variant = 'default',
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const variantClasses = {
      default: `
        border border-neutral-300 dark:border-neutral-600
        rounded-lg bg-white dark:bg-neutral-900
        focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
      `,
      filled: `
        border-0 rounded-lg
        bg-neutral-100 dark:bg-neutral-800
        focus:bg-white dark:focus:bg-neutral-900
        focus:ring-2 focus:ring-primary-500/20
      `,
      flushed: `
        border-0 border-b-2 border-neutral-300 dark:border-neutral-600
        rounded-none bg-transparent
        focus:border-primary-500
        px-0
      `,
      unstyled: 'border-0 bg-transparent focus:ring-0 px-0',
    };

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : '';

    const successClasses = success && !error
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
      : '';

    return (
      <FormField
        label={label}
        description={description}
        error={error}
        success={success}
        hint={hint}
        required={required}
        optional={optional}
        disabled={disabled}
        size={size}
      >
        <div className="relative">
          {leftIcon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 ${iconSizeClasses[size]}`}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={`
              w-full outline-none transition-all
              text-neutral-900 dark:text-white
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${errorClasses}
              ${successClasses}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || clearable ? 'pr-10' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            {...props}
          />

          {(rightIcon || (clearable && props.value)) && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconSizeClasses[size]}`}>
              {clearable && props.value ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-neutral-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

InputField.displayName = 'InputField';

// ============================================================================
// TextareaField Component
// ============================================================================

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      description,
      error,
      success,
      hint,
      required = false,
      optional = false,
      maxLength,
      showCount = false,
      autoResize = false,
      size = 'md',
      disabled,
      className = '',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [textValue, setTextValue] = useState(value || '');

    useEffect(() => {
      if (value !== undefined) {
        setTextValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextValue(e.target.value);
      onChange?.(e);

      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
    };

    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm min-h-[60px]',
      md: 'px-3 py-2 text-sm min-h-[80px]',
      lg: 'px-4 py-2.5 text-base min-h-[100px]',
    };

    const charCount = String(textValue).length;
    const isOverLimit = maxLength ? charCount > maxLength : false;

    return (
      <FormField
        label={label}
        description={description}
        error={error}
        success={success}
        hint={hint}
        required={required}
        optional={optional}
        disabled={disabled}
        size={size}
      >
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            className={`
              w-full outline-none transition-all resize-y
              text-neutral-900 dark:text-white
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              border border-neutral-300 dark:border-neutral-600
              rounded-lg bg-white dark:bg-neutral-900
              focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${success && !error ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''}
              ${sizeClasses[size]}
              ${autoResize ? 'resize-none overflow-hidden' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            {...props}
          />

          {showCount && (
            <div
              className={`
                absolute bottom-2 right-2 text-xs
                ${isOverLimit ? 'text-red-500' : 'text-neutral-400'}
              `}
            >
              {charCount}{maxLength && `/${maxLength}`}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

TextareaField.displayName = 'TextareaField';

// ============================================================================
// SelectField Component
// ============================================================================

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      description,
      error,
      success,
      hint,
      required = false,
      optional = false,
      options,
      placeholder,
      size = 'md',
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    };

    return (
      <FormField
        label={label}
        description={description}
        error={error}
        success={success}
        hint={hint}
        required={required}
        optional={optional}
        disabled={disabled}
        size={size}
      >
        <select
          ref={ref}
          disabled={disabled}
          className={`
            w-full outline-none transition-all appearance-none
            text-neutral-900 dark:text-white
            border border-neutral-300 dark:border-neutral-600
            rounded-lg bg-white dark:bg-neutral-900
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")]
            bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat
            pr-10
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${success && !error ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''}
            ${sizeClasses[size]}
            ${className}
          `}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

SelectField.displayName = 'SelectField';

// ============================================================================
// CheckboxField Component
// ============================================================================

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, description, error, size = 'md', disabled, className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: { checkbox: 'w-3.5 h-3.5', label: 'text-sm', description: 'text-xs' },
      md: { checkbox: 'w-4 h-4', label: 'text-sm', description: 'text-xs' },
      lg: { checkbox: 'w-5 h-5', label: 'text-base', description: 'text-sm' },
    };

    const sizes = sizeClasses[size];

    return (
      <div className={className}>
        <label
          className={`
            flex items-start gap-2.5 cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`
              ${sizes.checkbox}
              rounded border-neutral-300 dark:border-neutral-600
              text-primary-600 focus:ring-primary-500
              dark:bg-neutral-900
              disabled:cursor-not-allowed
              mt-0.5
            `}
            {...props}
          />
          <div>
            <span className={`font-medium text-neutral-700 dark:text-neutral-300 ${sizes.label}`}>
              {label}
            </span>
            {description && (
              <p className={`text-neutral-500 dark:text-neutral-400 ${sizes.description}`}>
                {description}
              </p>
            )}
          </div>
        </label>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

// ============================================================================
// RadioGroup Component
// ============================================================================

export function RadioGroup({
  label,
  description,
  error,
  name,
  value,
  onChange,
  options,
  orientation = 'vertical',
  required = false,
  size = 'md',
  className = '',
}: RadioGroupProps) {
  const sizeClasses = {
    sm: { radio: 'w-3.5 h-3.5', label: 'text-sm', description: 'text-xs' },
    md: { radio: 'w-4 h-4', label: 'text-sm', description: 'text-xs' },
    lg: { radio: 'w-5 h-5', label: 'text-base', description: 'text-sm' },
  };

  const sizes = sizeClasses[size];

  return (
    <fieldset className={className}>
      {label && (
        <legend className={`font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${sizes.label}`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </legend>
      )}
      {description && (
        <p className={`text-neutral-500 dark:text-neutral-400 mb-3 ${sizes.description}`}>
          {description}
        </p>
      )}

      <div className={`flex ${orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-2.5 cursor-pointer
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              disabled={option.disabled}
              className={`
                ${sizes.radio}
                border-neutral-300 dark:border-neutral-600
                text-primary-600 focus:ring-primary-500
                dark:bg-neutral-900
                disabled:cursor-not-allowed
                mt-0.5
              `}
            />
            <div>
              <span className={`font-medium text-neutral-700 dark:text-neutral-300 ${sizes.label}`}>
                {option.label}
              </span>
              {option.description && (
                <p className={`text-neutral-500 dark:text-neutral-400 ${sizes.description}`}>
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ============================================================================
// PasswordField Component
// ============================================================================

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ showStrength = false, strengthValue = 0, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const getStrengthColor = (strength: number) => {
      if (strength < 25) return 'bg-red-500';
      if (strength < 50) return 'bg-orange-500';
      if (strength < 75) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getStrengthLabel = (strength: number) => {
      if (strength < 25) return 'Weak';
      if (strength < 50) return 'Fair';
      if (strength < 75) return 'Good';
      return 'Strong';
    };

    return (
      <div>
        <InputField
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...props}
        />

        {showStrength && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strengthValue}%` }}
                  className={`h-full ${getStrengthColor(strengthValue)} rounded-full`}
                />
              </div>
              <span className="text-xs text-neutral-500 min-w-[50px]">
                {getStrengthLabel(strengthValue)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

// ============================================================================
// FieldGroup Component
// ============================================================================

export function FieldGroup({
  children,
  label,
  description,
  error,
  className = '',
}: FieldGroupProps) {
  return (
    <fieldset
      className={`
        p-4 rounded-lg
        border border-neutral-200 dark:border-neutral-700
        ${error ? 'border-red-300 dark:border-red-700' : ''}
        ${className}
      `}
    >
      {label && (
        <legend className="px-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </legend>
      )}
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {description}
        </p>
      )}
      <div className="space-y-4">{children}</div>
      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ============================================================================
// FieldHint Component
// ============================================================================

export interface FieldHintProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function FieldHint({ children, icon, className = '' }: FieldHintProps) {
  return (
    <div className={`flex items-start gap-1.5 text-xs text-neutral-500 ${className}`}>
      {icon || <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
      <span>{children}</span>
    </div>
  );
}

// ============================================================================
// RequiredIndicator Component
// ============================================================================

export function RequiredIndicator({ className = '' }: { className?: string }) {
  return (
    <span className={`text-red-500 ml-0.5 ${className}`} aria-hidden="true">
      *
    </span>
  );
}

// ============================================================================
// FieldError Component
// ============================================================================

export interface FieldErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldError({ children, className = '' }: FieldErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}

// ============================================================================
// FieldSuccess Component
// ============================================================================

export interface FieldSuccessProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldSuccess({ children, className = '' }: FieldSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 ${className}`}
    >
      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}

// ============================================================================
// SearchField Component
// ============================================================================

export interface SearchFieldProps extends Omit<InputFieldProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ onSearch, debounceMs = 300, onChange, ...props }, ref) => {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      if (onSearch) {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        const timeout = setTimeout(() => {
          onSearch(e.target.value);
        }, debounceMs);
        setSearchTimeout(timeout);
      }
    };

    useEffect(() => {
      return () => {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
      };
    }, [searchTimeout]);

    return (
      <InputField
        ref={ref}
        type="search"
        leftIcon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        clearable
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SearchField.displayName = 'SearchField';

// ============================================================================
// NumberField Component
// ============================================================================

export interface NumberFieldProps extends Omit<InputFieldProps, 'type' | 'leftIcon' | 'rightIcon'> {
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ min, max, step = 1, showControls = false, onChange, value, ...props }, ref) => {
    const [numValue, setNumValue] = useState<number>(Number(value) || 0);

    useEffect(() => {
      if (value !== undefined) {
        setNumValue(Number(value));
      }
    }, [value]);

    const handleIncrement = () => {
      const newValue = max !== undefined ? Math.min(numValue + step, max) : numValue + step;
      setNumValue(newValue);
      const event = { target: { value: String(newValue) } } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    const handleDecrement = () => {
      const newValue = min !== undefined ? Math.max(numValue - step, min) : numValue - step;
      setNumValue(newValue);
      const event = { target: { value: String(newValue) } } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    if (!showControls) {
      return (
        <InputField
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          {...props}
        />
      );
    }

    return (
      <FormField
        label={props.label}
        description={props.description}
        error={props.error}
        success={props.success}
        hint={props.hint}
        required={props.required}
        optional={props.optional}
        disabled={props.disabled}
        size={props.size}
      >
        <div className="flex">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={props.disabled || (min !== undefined && numValue <= min)}
            className="
              px-3 py-2 border border-r-0 border-neutral-300 dark:border-neutral-600
              rounded-l-lg bg-neutral-50 dark:bg-neutral-800
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              disabled:opacity-50 disabled:cursor-not-allowed
              text-neutral-700 dark:text-neutral-300
            "
          >
            −
          </button>
          <input
            ref={ref}
            type="number"
            min={min}
            max={max}
            step={step}
            value={numValue}
            onChange={(e) => {
              setNumValue(Number(e.target.value));
              onChange?.(e);
            }}
            disabled={props.disabled}
            className="
              flex-1 text-center outline-none
              border border-neutral-300 dark:border-neutral-600
              bg-white dark:bg-neutral-900
              text-neutral-900 dark:text-white
              py-2
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            "
          />
          <button
            type="button"
            onClick={handleIncrement}
            disabled={props.disabled || (max !== undefined && numValue >= max)}
            className="
              px-3 py-2 border border-l-0 border-neutral-300 dark:border-neutral-600
              rounded-r-lg bg-neutral-50 dark:bg-neutral-800
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              disabled:opacity-50 disabled:cursor-not-allowed
              text-neutral-700 dark:text-neutral-300
            "
          >
            +
          </button>
        </div>
      </FormField>
    );
  }
);

NumberField.displayName = 'NumberField';

export default FormField;
