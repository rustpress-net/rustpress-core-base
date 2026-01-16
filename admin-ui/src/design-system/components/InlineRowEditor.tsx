/**
 * RustPress Inline Row Editor Component
 * Edit cells directly in the table with various input types
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Edit2,
  Loader2,
  AlertCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../utils';
import { useTableStore, EditingCell } from '../../store/tableStore';
import { IconButton } from './Button';

export type CellEditorType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'email'
  | 'url'
  | 'custom';

export interface CellEditorConfig {
  type: CellEditorType;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  validate?: (value: unknown) => string | null;
  format?: (value: unknown) => string;
  parse?: (value: string) => unknown;
  customEditor?: React.ComponentType<CustomEditorProps>;
}

export interface CustomEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface InlineCellEditorProps {
  rowId: string | number;
  columnKey: string;
  value: unknown;
  config?: CellEditorConfig;
  onSave?: (rowId: string | number, columnKey: string, value: unknown) => void | Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function InlineCellEditor({
  rowId,
  columnKey,
  value: initialValue,
  config = { type: 'text' },
  onSave,
  onCancel,
  autoFocus = true,
  className,
}: InlineCellEditorProps) {
  const {
    startEditing,
    updateEditingValue,
    cancelEditing,
    getEditingCell,
    isEditing,
  } = useTableStore();

  const [localValue, setLocalValue] = useState<unknown>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // Initialize editing state
  useEffect(() => {
    startEditing({ rowId, columnKey, originalValue: initialValue });
    return () => {
      cancelEditing(rowId, columnKey);
    };
  }, [rowId, columnKey, initialValue, startEditing, cancelEditing]);

  // Focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current && config.type !== 'select') {
        inputRef.current.select();
      }
    }
  }, [autoFocus, config.type]);

  const handleChange = useCallback(
    (newValue: unknown) => {
      setLocalValue(newValue);
      updateEditingValue(rowId, columnKey, newValue);

      // Validate
      if (config.validate) {
        const validationError = config.validate(newValue);
        setError(validationError);
      } else {
        setError(null);
      }
    },
    [rowId, columnKey, config, updateEditingValue]
  );

  const handleSave = async () => {
    if (error) return;

    const finalValue = config.parse ? config.parse(String(localValue)) : localValue;

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(rowId, columnKey, finalValue);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed');
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }

    cancelEditing(rowId, columnKey);
  };

  const handleCancel = () => {
    cancelEditing(rowId, columnKey);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && config.type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Custom editor
  if (config.type === 'custom' && config.customEditor) {
    const CustomEditor = config.customEditor;
    return (
      <CustomEditor
        value={localValue}
        onChange={handleChange}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Render editor based on type
  const renderEditor = () => {
    const baseInputClass = cn(
      'w-full px-2 py-1 text-sm rounded border',
      'bg-white dark:bg-neutral-800',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      error
        ? 'border-error-500 focus:ring-error-500'
        : 'border-neutral-300 dark:border-neutral-600'
    );

    switch (config.type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            className={cn(baseInputClass, 'resize-none')}
            rows={3}
          />
        );

      case 'select':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
          >
            {config.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <button
            onClick={() => handleChange(!localValue)}
            onKeyDown={handleKeyDown}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              localValue
                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            )}
          >
            {localValue ? 'Yes' : 'No'}
          </button>
        );

      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.valueAsNumber || null)}
            onKeyDown={handleKeyDown}
            min={config.min}
            max={config.max}
            step={config.step}
            placeholder={config.placeholder}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
          />
        );

      case 'datetime':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="datetime-local"
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
          />
        );

      case 'email':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="email"
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder || 'email@example.com'}
            className={baseInputClass}
          />
        );

      case 'url':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="url"
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder || 'https://'}
            className={baseInputClass}
          />
        );

      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={String(localValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex-1 min-w-0">
        {renderEditor()}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-error-500 mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <IconButton
          variant="ghost"
          size="xs"
          onClick={handleSave}
          disabled={!!error || isSaving}
          className="text-success-600 hover:bg-success-100 dark:hover:bg-success-900/30"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </IconButton>
        <IconButton
          variant="ghost"
          size="xs"
          onClick={handleCancel}
          disabled={isSaving}
          className="text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </div>
  );
}

// Editable cell wrapper
export interface EditableCellProps {
  rowId: string | number;
  columnKey: string;
  value: unknown;
  displayValue?: React.ReactNode;
  editorConfig?: CellEditorConfig;
  editable?: boolean;
  onSave?: (rowId: string | number, columnKey: string, value: unknown) => void | Promise<void>;
  className?: string;
}

export function EditableCell({
  rowId,
  columnKey,
  value,
  displayValue,
  editorConfig = { type: 'text' },
  editable = true,
  onSave,
  className,
}: EditableCellProps) {
  const { isEditing: checkIsEditing, startEditing } = useTableStore();
  const [isHovering, setIsHovering] = useState(false);
  const [localEditing, setLocalEditing] = useState(false);

  const isEditingCell = checkIsEditing(rowId, columnKey) || localEditing;

  const handleStartEdit = () => {
    if (!editable) return;
    setLocalEditing(true);
  };

  const handleSaveComplete = async (id: string | number, key: string, newValue: unknown) => {
    if (onSave) {
      await onSave(id, key, newValue);
    }
    setLocalEditing(false);
  };

  const handleCancel = () => {
    setLocalEditing(false);
  };

  if (isEditingCell) {
    return (
      <InlineCellEditor
        rowId={rowId}
        columnKey={columnKey}
        value={value}
        config={editorConfig}
        onSave={handleSaveComplete}
        onCancel={handleCancel}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2 min-h-[28px]',
        editable && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleStartEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartEdit();
        }
      }}
      tabIndex={editable ? 0 : undefined}
      role={editable ? 'button' : undefined}
    >
      <span className="flex-1 truncate">
        {displayValue ?? (editorConfig.format ? editorConfig.format(value) : String(value ?? ''))}
      </span>
      {editable && isHovering && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-neutral-400"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </motion.span>
      )}
    </div>
  );
}

// Row editor component (for editing entire row)
export interface InlineRowEditorProps<T> {
  row: T;
  rowId: string | number;
  columns: {
    key: keyof T;
    label: string;
    editorConfig?: CellEditorConfig;
    editable?: boolean;
  }[];
  onSave?: (rowId: string | number, changes: Partial<T>) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function InlineRowEditor<T extends Record<string, unknown>>({
  row,
  rowId,
  columns,
  onSave,
  onCancel,
  className,
}: InlineRowEditorProps<T>) {
  const [changes, setChanges] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (key: keyof T, value: unknown) => {
    setChanges((prev) => ({ ...prev, [key]: value }));

    // Validate
    const column = columns.find((c) => c.key === key);
    if (column?.editorConfig?.validate) {
      const error = column.editorConfig.validate(value);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[key as string] = error;
        } else {
          delete next[key as string];
        }
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(rowId, changes);
      } catch (e) {
        // Handle error
      }
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg',
        'border-2 border-primary-200 dark:border-primary-800',
        className
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          if (column.editable === false) return null;

          const currentValue = changes[column.key] ?? row[column.key];
          const config = column.editorConfig || { type: 'text' as const };

          return (
            <div key={String(column.key)}>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                {column.label}
              </label>
              <InlineCellEditor
                rowId={rowId}
                columnKey={String(column.key)}
                value={currentValue}
                config={config}
                onSave={(_, __, value) => handleFieldChange(column.key, value)}
                autoFocus={false}
              />
              {errors[column.key as string] && (
                <p className="text-xs text-error-500 mt-1">
                  {errors[column.key as string]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || Object.keys(errors).length > 0 || isSaving}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin inline" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1 inline" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default InlineCellEditor;
