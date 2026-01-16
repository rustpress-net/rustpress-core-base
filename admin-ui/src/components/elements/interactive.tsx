/**
 * Interactive Components
 * Buttons, toggles, modals, and interactive UI elements
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, ChevronUp, Check, Copy, Eye, EyeOff, Plus, Minus,
  Loader, ExternalLink, Download, Upload, Share2, Heart, Bookmark,
  MoreHorizontal, Settings, Trash2, Edit, ArrowRight, RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. BUTTON
// ============================================

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  onClick,
  type = 'button',
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizes = {
    xs: 'text-xs px-2 py-1 gap-1',
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2',
    xl: 'text-lg px-6 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
    >
      {loading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        icon && iconPosition === 'left' && icon
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}

// ============================================
// 2. ICON BUTTON
// ============================================

export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  label,
  disabled,
  onClick,
}: IconButtonProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400',
    danger: 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
    </button>
  );
}

// ============================================
// 3. TOGGLE SWITCH
// ============================================

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled,
}: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const s = sizes[size];

  return (
    <label className={clsx('flex items-center gap-3', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex shrink-0 rounded-full transition-colors',
          s.track,
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'opacity-50'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform',
            s.thumb,
            'translate-y-0.5 translate-x-0.5',
            checked && s.translate
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
    </label>
  );
}

// ============================================
// 4. CHECKBOX
// ============================================

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  indeterminate?: boolean;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  indeterminate,
  disabled,
}: CheckboxProps) {
  return (
    <label className={clsx('flex items-start gap-3', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={clsx(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            checked || indeterminate
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 dark:border-gray-600',
            disabled && 'opacity-50'
          )}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
          {indeterminate && !checked && <Minus className="w-3 h-3 text-white" />}
        </div>
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
    </label>
  );
}

// ============================================
// 5. RADIO GROUP
// ============================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  variant?: 'default' | 'cards' | 'buttons';
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  variant = 'default',
}: RadioGroupProps) {
  if (variant === 'buttons') {
    return (
      <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && onChange(option.value)}
            disabled={option.disabled}
            className={clsx(
              'px-4 py-2 text-sm font-medium transition-colors border-r last:border-r-0 border-gray-200 dark:border-gray-700',
              option.value === value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={clsx(
              'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors',
              option.value === value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              disabled={option.disabled}
              className="sr-only"
            />
            <div
              className={clsx(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                option.value === value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {option.value === value && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={clsx('flex items-start gap-3', option.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            disabled={option.disabled}
            className="sr-only"
          />
          <div
            className={clsx(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
              option.value === value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600',
              option.disabled && 'opacity-50'
            )}
          >
            {option.value === value && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
            {option.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

// ============================================
// 6. MODAL
// ============================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => closeOnOverlay && onClose()}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={clsx(
              'relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl',
              sizes[size]
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// 7. DRAWER
// ============================================

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
}: DrawerProps) {
  const sizes = {
    sm: 'w-72',
    md: 'w-96',
    lg: 'w-[480px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: position === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: position === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={clsx(
              'absolute top-0 bottom-0 bg-white dark:bg-gray-800 shadow-xl',
              sizes[size],
              position === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-4 overflow-y-auto h-full">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// 8. TOOLTIP
// ============================================

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 200 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={clsx(
              'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap',
              positions[position]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 9. POPOVER
// ============================================

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Popover({ trigger, children, position = 'bottom' }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={clsx(
                'absolute z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700',
                positions[position]
              )}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 10. COPY BUTTON
// ============================================

export interface CopyButtonProps {
  text: string;
  variant?: 'default' | 'icon';
  size?: 'sm' | 'md';
  onCopy?: () => void;
}

export function CopyButton({ text, variant = 'default', size = 'md', onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={clsx(
          'p-1.5 rounded-lg transition-colors',
          copied
            ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
        size === 'sm' && 'text-xs',
        copied
          ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      )}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ============================================
// 11. ACTION MENU
// ============================================

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
}

export function ActionMenu({ items, trigger }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        {trigger || <MoreHorizontal className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
            >
              {items.map((item, idx) =>
                item.divider ? (
                  <div key={idx} className="my-1 border-t border-gray-200 dark:border-gray-700" />
                ) : (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                      item.variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 12. LIKE BUTTON
// ============================================

export interface LikeButtonProps {
  liked: boolean;
  count?: number;
  onChange: (liked: boolean) => void;
  variant?: 'default' | 'compact';
}

export function LikeButton({ liked, count, onChange, variant = 'default' }: LikeButtonProps) {
  if (variant === 'compact') {
    return (
      <button
        onClick={() => onChange(!liked)}
        className={clsx(
          'p-2 rounded-full transition-colors',
          liked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        <Heart className={clsx('w-5 h-5', liked && 'fill-current')} />
      </button>
    );
  }

  return (
    <button
      onClick={() => onChange(!liked)}
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
        liked
          ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
          : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-red-500 hover:text-red-500'
      )}
    >
      <Heart className={clsx('w-4 h-4', liked && 'fill-current')} />
      {count !== undefined && <span className="text-sm">{count}</span>}
    </button>
  );
}

// ============================================
// 13. BOOKMARK BUTTON
// ============================================

export interface BookmarkButtonProps {
  bookmarked: boolean;
  onChange: (bookmarked: boolean) => void;
  variant?: 'default' | 'icon';
}

export function BookmarkButton({ bookmarked, onChange, variant = 'default' }: BookmarkButtonProps) {
  if (variant === 'icon') {
    return (
      <button
        onClick={() => onChange(!bookmarked)}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          bookmarked
            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        <Bookmark className={clsx('w-5 h-5', bookmarked && 'fill-current')} />
      </button>
    );
  }

  return (
    <button
      onClick={() => onChange(!bookmarked)}
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
        bookmarked
          ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-blue-500 hover:text-blue-600'
      )}
    >
      <Bookmark className={clsx('w-4 h-4', bookmarked && 'fill-current')} />
      <span className="text-sm">{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}

// ============================================
// 14. COUNTER INPUT
// ============================================

export interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CounterInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  size = 'md',
}: CounterInputProps) {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(Math.min(max, value + step));

  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
      <button
        onClick={decrease}
        disabled={value <= min}
        className={clsx(
          'flex items-center justify-center rounded-l-lg border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50',
          sizes[size]
        )}
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
        className={clsx('w-16 text-center bg-transparent border-0 focus:ring-0', sizes[size])}
      />
      <button
        onClick={increase}
        disabled={value >= max}
        className={clsx(
          'flex items-center justify-center rounded-r-lg border-l border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50',
          sizes[size]
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================
// 15. PASSWORD VISIBILITY TOGGLE
// ============================================

export interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PasswordInput({ value, onChange, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

// ============================================
// 16. EXPANDABLE SECTION
// ============================================

export interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
  icon,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        <ChevronDown className={clsx('w-5 h-5 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 17. FLOATING ACTION BUTTON
// ============================================

export interface FABProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
  extended?: boolean;
}

export function FAB({
  icon,
  onClick,
  label,
  position = 'bottom-right',
  variant = 'primary',
  extended = false,
}: FABProps) {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
    secondary: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-lg border border-gray-200 dark:border-gray-700',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed z-40 flex items-center justify-center rounded-full transition-all',
        positions[position],
        variants[variant],
        extended ? 'px-6 py-3 gap-2' : 'w-14 h-14'
      )}
    >
      {icon}
      {extended && label && <span className="font-medium">{label}</span>}
    </button>
  );
}

// ============================================
// 18. CHIP / TAG INPUT
// ============================================

export interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function ChipInput({ value, onChange, placeholder, maxTags }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const tag = inputValue.trim();
    if (tag && !value.includes(tag) && (!maxTags || value.length < maxTags)) {
      onChange([...value, tag]);
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm"
        >
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:text-blue-800">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent border-0 focus:ring-0 text-sm"
      />
    </div>
  );
}

// ============================================
// 19. CONFIRMATION DIALOG
// ============================================

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// 20. SPEED DIAL
// ============================================

export interface SpeedDialAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface SpeedDialProps {
  actions: SpeedDialAction[];
  icon?: React.ReactNode;
}

export function SpeedDial({ actions, icon }: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-2">
            {actions.map((action, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-end gap-2"
              >
                <span className="px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {action.icon}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-transform',
          isOpen && 'rotate-45'
        )}
      >
        {icon || <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
