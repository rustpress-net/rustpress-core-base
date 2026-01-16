/**
 * Form Components
 * Input fields, search, and form elements
 */

import React, { useState, useRef } from 'react';
import {
  Search, X, Eye, EyeOff, Calendar, Clock, Upload, ChevronDown,
  Check, AlertCircle, Info, Mail, Lock, User, Phone, Globe,
  MapPin, CreditCard, FileText, Link, Hash, AtSign, Percent,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. TEXT INPUT
// ============================================

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
}

export function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  label,
  helperText,
  error,
  icon,
  iconPosition = 'left',
  size = 'md',
  disabled,
  required,
  clearable,
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const sizes = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-base px-4',
    lg: 'h-12 text-lg px-5',
  };

  const iconPadding = {
    left: { sm: 'pl-9', md: 'pl-10', lg: 'pl-12' },
    right: { sm: 'pr-9', md: 'pr-10', lg: 'pr-12' },
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'w-full border rounded-lg transition-colors',
            sizes[size],
            icon && iconPadding[iconPosition][size],
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
            'bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
          )}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {(helperText || error) && (
        <p className={clsx('mt-1 text-sm', error ? 'text-red-500' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// 2. SEARCH INPUT
// ============================================

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
  loading?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  size = 'md',
  variant = 'default',
  loading,
}: SearchInputProps) {
  const sizes = {
    sm: 'h-8 text-sm pl-8 pr-3',
    md: 'h-10 text-base pl-10 pr-4',
    lg: 'h-12 text-lg pl-12 pr-5',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-2',
    md: 'w-5 h-5 left-3',
    lg: 'w-6 h-6 left-3',
  };

  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
    filled: 'bg-gray-100 dark:bg-gray-700 border-transparent',
    minimal: 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-700',
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative">
      <Search
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 text-gray-400',
          iconSizes[size],
          loading && 'animate-pulse'
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={clsx(
          'w-full rounded-lg transition-colors focus:ring-2 focus:ring-blue-500',
          sizes[size],
          variants[variant]
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// 3. TEXTAREA
// ============================================

export interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  disabled?: boolean;
  required?: boolean;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  label,
  helperText,
  error,
  rows = 4,
  maxLength,
  showCount,
  resize = 'vertical',
  disabled,
  required,
}: TextareaProps) {
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition-colors',
          resizeClasses[resize],
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
          'bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
        )}
      />
      <div className="flex justify-between mt-1">
        {(helperText || error) && (
          <p className={clsx('text-sm', error ? 'text-red-500' : 'text-gray-500')}>
            {error || helperText}
          </p>
        )}
        {showCount && (
          <p className="text-sm text-gray-500">
            {value.length}{maxLength && `/${maxLength}`}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// 4. SELECT
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  helperText,
  error,
  size = 'md',
  disabled,
  required,
}: SelectProps) {
  const sizes = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-base px-4',
    lg: 'h-12 text-lg px-5',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full border rounded-lg transition-colors appearance-none pr-10',
            sizes[size],
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
            'bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
          )}
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
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {(helperText || error) && (
        <p className={clsx('mt-1 text-sm', error ? 'text-red-500' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// 5. FILE UPLOAD
// ============================================

export interface FileUploadProps {
  onUpload: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  label?: string;
  helperText?: string;
  variant?: 'default' | 'dropzone';
}

export function FileUpload({
  onUpload,
  accept,
  multiple,
  maxSize,
  label,
  helperText,
  variant = 'default',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onUpload(e.dataTransfer.files);
    }
  };

  if (variant === 'dropzone') {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          )}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="text-blue-500 font-medium">Click to upload</span> or drag and drop
          </p>
          {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Choose File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        {helperText && <span className="text-sm text-gray-500">{helperText}</span>}
      </div>
    </div>
  );
}

// ============================================
// 6. DATE PICKER (Simple)
// ============================================

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DateInput({
  value,
  onChange,
  label,
  helperText,
  error,
  min,
  max,
  disabled,
  required,
}: DateInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className={clsx(
            'w-full h-10 px-4 border rounded-lg transition-colors',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
            'bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {(helperText || error) && (
        <p className={clsx('mt-1 text-sm', error ? 'text-red-500' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// 7. TIME PICKER (Simple)
// ============================================

export interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function TimeInput({
  value,
  onChange,
  label,
  helperText,
  error,
  disabled,
  required,
}: TimeInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full h-10 px-4 border rounded-lg transition-colors',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
            'bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {(helperText || error) && (
        <p className={clsx('mt-1 text-sm', error ? 'text-red-500' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// 8. SLIDER / RANGE INPUT
// ============================================

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  marks?: Array<{ value: number; label?: string }>;
  disabled?: boolean;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  marks,
  disabled,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-2">
          {label && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          )}
          {showValue && (
            <span className="text-sm text-gray-500">{value}</span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2563eb ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
        />
        {marks && (
          <div className="flex justify-between mt-1">
            {marks.map((mark, idx) => (
              <span key={idx} className="text-xs text-gray-500">
                {mark.label || mark.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 9. COLOR PICKER (Simple)
// ============================================

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  presets?: string[];
  showInput?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  label,
  presets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
  showInput = true,
}: ColorPickerProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer overflow-hidden"
        />
        {showInput && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            placeholder="#000000"
          />
        )}
      </div>
      {presets && (
        <div className="flex gap-2 mt-2">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={clsx(
                'w-6 h-6 rounded-full border-2',
                value === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 10. NEWSLETTER SIGNUP
// ============================================

export interface NewsletterSignupProps {
  onSubmit: (email: string) => void;
  placeholder?: string;
  buttonText?: string;
  variant?: 'default' | 'inline' | 'stacked';
  loading?: boolean;
  success?: boolean;
}

export function NewsletterSignup({
  onSubmit,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  variant = 'default',
  loading,
  success,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onSubmit(email);
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
        <Check className="w-5 h-5" />
        <span>Thanks for subscribing!</span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full h-10 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : buttonText}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={clsx('flex', variant === 'inline' && 'gap-2')}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        className={clsx(
          'flex-1 h-10 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
          variant === 'inline' ? 'rounded-lg' : 'rounded-l-lg border-r-0'
        )}
      />
      <button
        type="submit"
        disabled={loading}
        className={clsx(
          'h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
          variant === 'inline' ? 'rounded-lg' : 'rounded-r-lg'
        )}
      >
        {loading ? 'Subscribing...' : buttonText}
      </button>
    </form>
  );
}

// ============================================
// 11. OTP INPUT
// ============================================

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function OTPInput({ length = 6, value, onChange, onComplete }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newValue = value.split('');
    newValue[index] = char;
    const joined = newValue.join('');
    onChange(joined);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (joined.length === length && onComplete) {
      onComplete(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pasted)) {
      onChange(pasted);
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    }
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ))}
    </div>
  );
}

// ============================================
// 12. INPUT WITH ICON BUTTONS
// ============================================

export interface InputWithActionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  actions: Array<{
    icon: React.ReactNode;
    onClick: () => void;
    label?: string;
  }>;
}

export function InputWithActions({
  value,
  onChange,
  placeholder,
  actions,
}: InputWithActionsProps) {
  return (
    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-10 px-4 bg-transparent border-0 focus:ring-0"
      />
      <div className="flex items-center border-l border-gray-300 dark:border-gray-600">
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            title={action.label}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 13. FORM FIELD WITH VALIDATION
// ============================================

export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
}

export function FormField({ label, children, error, required, hint }: FormFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
          <Info className="w-4 h-4" />
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// 14. PREFIX/SUFFIX INPUT
// ============================================

export interface PrefixSuffixInputProps {
  value: string;
  onChange: (value: string) => void;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  placeholder?: string;
  type?: 'text' | 'number';
}

export function PrefixSuffixInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  type = 'text',
}: PrefixSuffixInputProps) {
  return (
    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {prefix && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 text-gray-500">
          {prefix}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-10 px-3 bg-white dark:bg-gray-800 border-0 focus:ring-0"
      />
      {suffix && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-l border-gray-300 dark:border-gray-600 text-gray-500">
          {suffix}
        </div>
      )}
    </div>
  );
}

// ============================================
// 15. INLINE EDIT
// ============================================

export interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  editOnClick?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit',
  editOnClick = true,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 border border-blue-500 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  return (
    <span
      onClick={() => editOnClick && setIsEditing(true)}
      className={clsx(
        'px-2 py-1 rounded',
        editOnClick && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
        !value && 'text-gray-400 italic'
      )}
    >
      {value || placeholder}
    </span>
  );
}
