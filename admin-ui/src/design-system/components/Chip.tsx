/**
 * Chip Component (Enhancement #85)
 * Compact elements for tags, filters, and selections
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, Plus } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ChipProps {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'soft';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  avatar?: string | React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
}

export interface ChipGroupProps {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  wrap?: boolean;
  className?: string;
}

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onChange?: (selected: boolean) => void;
  disabled?: boolean;
  count?: number;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface InputChipProps {
  value: string;
  onRemove: () => void;
  editable?: boolean;
  onEdit?: (newValue: string) => void;
  icon?: React.ReactNode;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export interface ChoiceChipGroupProps {
  options: { value: string; label: string; icon?: React.ReactNode; disabled?: boolean }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ActionChipProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface StatusChipProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'pending' | 'active' | 'inactive';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getColorClasses = (color: string, variant: string) => {
  const colors: Record<string, Record<string, string>> = {
    default: {
      filled: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200',
      outlined: 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300',
      soft: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    },
    primary: {
      filled: 'bg-primary-500 text-white',
      outlined: 'border-primary-500 text-primary-600 dark:text-primary-400',
      soft: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    },
    success: {
      filled: 'bg-success-500 text-white',
      outlined: 'border-success-500 text-success-600 dark:text-success-400',
      soft: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
    },
    warning: {
      filled: 'bg-warning-500 text-white',
      outlined: 'border-warning-500 text-warning-600 dark:text-warning-400',
      soft: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
    },
    error: {
      filled: 'bg-error-500 text-white',
      outlined: 'border-error-500 text-error-600 dark:text-error-400',
      soft: 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300',
    },
    info: {
      filled: 'bg-blue-500 text-white',
      outlined: 'border-blue-500 text-blue-600 dark:text-blue-400',
      soft: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
  };
  return colors[color]?.[variant] || colors.default[variant];
};

const getSizeClasses = (size: string) => {
  const sizes: Record<string, { chip: string; icon: string; avatar: string }> = {
    sm: { chip: 'h-6 px-2 text-xs gap-1', icon: 'w-3 h-3', avatar: 'w-4 h-4' },
    md: { chip: 'h-8 px-3 text-sm gap-1.5', icon: 'w-4 h-4', avatar: 'w-5 h-5' },
    lg: { chip: 'h-10 px-4 text-base gap-2', icon: 'w-5 h-5', avatar: 'w-6 h-6' },
  };
  return sizes[size] || sizes.md;
};

// ============================================================================
// Chip Component
// ============================================================================

export function Chip({
  children,
  variant = 'filled',
  color = 'default',
  size = 'md',
  icon,
  avatar,
  removable = false,
  onRemove,
  onClick,
  disabled = false,
  selected = false,
  className = '',
}: ChipProps) {
  const colorClasses = getColorClasses(color, variant);
  const sizeClasses = getSizeClasses(size);

  const isInteractive = !!onClick;

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses.chip}
        ${colorClasses}
        ${variant === 'outlined' ? 'border' : ''}
        ${isInteractive && !disabled ? 'cursor-pointer hover:opacity-80' : ''}
        ${selected ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={!disabled ? onClick : undefined}
      whileTap={isInteractive && !disabled ? { scale: 0.95 } : undefined}
    >
      {/* Avatar */}
      {avatar && (
        typeof avatar === 'string' ? (
          <img
            src={avatar}
            alt=""
            className={`rounded-full object-cover -ml-1 ${sizeClasses.avatar}`}
          />
        ) : (
          <span className={`-ml-1 ${sizeClasses.avatar}`}>{avatar}</span>
        )
      )}

      {/* Icon */}
      {icon && !avatar && (
        <span className={sizeClasses.icon}>{icon}</span>
      )}

      {/* Content */}
      <span className="truncate">{children}</span>

      {/* Remove Button */}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onRemove?.();
          }}
          disabled={disabled}
          className={`
            -mr-1 p-0.5 rounded-full
            hover:bg-black/10 dark:hover:bg-white/10
            focus:outline-none focus:ring-1 focus:ring-current
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        >
          <X className={sizeClasses.icon} />
        </button>
      )}
    </motion.span>
  );
}

// ============================================================================
// Chip Group Component
// ============================================================================

export function ChipGroup({
  children,
  spacing = 'normal',
  wrap = true,
  className = '',
}: ChipGroupProps) {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  };

  return (
    <div
      className={`
        flex items-center
        ${spacingClasses[spacing]}
        ${wrap ? 'flex-wrap' : 'overflow-x-auto'}
        ${className}
      `}
    >
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  );
}

// ============================================================================
// Filter Chip Component
// ============================================================================

export function FilterChip({
  label,
  selected = false,
  onChange,
  disabled = false,
  count,
  icon,
  size = 'md',
  className = '',
}: FilterChipProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!selected)}
      disabled={disabled}
      className={`
        inline-flex items-center font-medium rounded-full
        transition-all duration-200
        ${sizeClasses.chip}
        ${selected
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {selected && <Check className={sizeClasses.icon} />}
      {icon && !selected && <span className={sizeClasses.icon}>{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`
            ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold
            ${selected
              ? 'bg-white/20 text-white'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Input Chip Component
// ============================================================================

export function InputChip({
  value,
  onRemove,
  editable = false,
  onEdit,
  icon,
  avatar,
  size = 'md',
  disabled = false,
  className = '',
}: InputChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const sizeClasses = getSizeClasses(size);

  const handleSubmitEdit = () => {
    if (editValue.trim() && editValue !== value) {
      onEdit?.(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitEdit();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  return (
    <motion.span
      layout
      className={`
        inline-flex items-center font-medium rounded-full
        bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200
        ${sizeClasses.chip}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {avatar && (
        <img
          src={avatar}
          alt=""
          className={`rounded-full object-cover -ml-1 ${sizeClasses.avatar}`}
        />
      )}
      {icon && !avatar && <span className={sizeClasses.icon}>{icon}</span>}

      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmitEdit}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none min-w-[60px] max-w-[150px]"
          autoFocus
        />
      ) : (
        <span
          className={editable && !disabled ? 'cursor-text' : ''}
          onClick={() => editable && !disabled && setIsEditing(true)}
        >
          {value}
        </span>
      )}

      <button
        type="button"
        onClick={() => !disabled && onRemove()}
        disabled={disabled}
        className={`
          -mr-1 p-0.5 rounded-full
          hover:bg-black/10 dark:hover:bg-white/10
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        <X className={sizeClasses.icon} />
      </button>
    </motion.span>
  );
}

// ============================================================================
// Choice Chip Group Component
// ============================================================================

export function ChoiceChipGroup({
  options,
  value,
  onChange,
  multiple = false,
  size = 'md',
  className = '',
}: ChoiceChipGroupProps) {
  const sizeClasses = getSizeClasses(size);

  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue === value ? '' : optionValue);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && handleSelect(option.value)}
            disabled={option.disabled}
            className={`
              inline-flex items-center font-medium rounded-full
              transition-all duration-200
              ${sizeClasses.chip}
              ${selected
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
              }
              ${selected ? '' : 'hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'}
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {selected && <Check className={sizeClasses.icon} />}
            {option.icon && !selected && <span className={sizeClasses.icon}>{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Action Chip Component
// ============================================================================

export function ActionChip({
  label,
  icon,
  onClick,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: ActionChipProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      type="button"
      onClick={() => !disabled && !loading && onClick()}
      disabled={disabled || loading}
      className={`
        inline-flex items-center font-medium rounded-full
        transition-all duration-200
        ${sizeClasses.chip}
        ${variant === 'filled'
          ? 'bg-primary-500 text-white hover:bg-primary-600'
          : 'border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
        }
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <motion.span
          className={sizeClasses.icon}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        </motion.span>
      ) : icon ? (
        <span className={sizeClasses.icon}>{icon}</span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}

// ============================================================================
// Status Chip Component
// ============================================================================

export function StatusChip({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}: StatusChipProps) {
  const sizeClasses = getSizeClasses(size);

  const statusConfig: Record<string, { color: string; dot: string; defaultLabel: string }> = {
    online: {
      color: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
      dot: 'bg-success-500',
      defaultLabel: 'Online',
    },
    offline: {
      color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
      dot: 'bg-neutral-400',
      defaultLabel: 'Offline',
    },
    away: {
      color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
      dot: 'bg-warning-500',
      defaultLabel: 'Away',
    },
    busy: {
      color: 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300',
      dot: 'bg-error-500',
      defaultLabel: 'Busy',
    },
    pending: {
      color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
      dot: 'bg-warning-500',
      defaultLabel: 'Pending',
    },
    active: {
      color: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
      dot: 'bg-success-500',
      defaultLabel: 'Active',
    },
    inactive: {
      color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
      dot: 'bg-neutral-400',
      defaultLabel: 'Inactive',
    },
  };

  const config = statusConfig[status] || statusConfig.offline;
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses.chip}
        ${config.color}
        ${className}
      `}
    >
      {showDot && (
        <span className={`rounded-full ${dotSize} ${config.dot}`} />
      )}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
}

// ============================================================================
// Add Chip Component
// ============================================================================

export interface AddChipProps {
  onAdd: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function AddChip({
  onAdd,
  label = 'Add',
  size = 'md',
  disabled = false,
  className = '',
}: AddChipProps) {
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      type="button"
      onClick={() => !disabled && onAdd()}
      disabled={disabled}
      className={`
        inline-flex items-center font-medium rounded-full
        border-2 border-dashed border-neutral-300 dark:border-neutral-600
        text-neutral-500 dark:text-neutral-400
        hover:border-primary-400 hover:text-primary-500
        transition-colors duration-200
        ${sizeClasses.chip}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <Plus className={sizeClasses.icon} />
      <span>{label}</span>
    </button>
  );
}

export default Chip;
