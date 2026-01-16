/**
 * RustPress Dynamic Form Builder Component
 * JSON schema-based form generation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Settings,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'range'
  | 'color'
  | 'hidden'
  | 'group'
  | 'array'
  | 'richtext';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: (value: unknown, formValues: Record<string, unknown>) => string | null;
}

export interface FieldOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: unknown;
}

export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  validation?: FieldValidation;
  options?: FieldOption[];
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  className?: string;
  // Conditional rendering
  showIf?: ConditionalRule | ConditionalRule[];
  // For group/array types
  fields?: FormField[];
  // For array type
  minItems?: number;
  maxItems?: number;
  itemLabel?: string;
  // For file type
  accept?: string;
  multiple?: boolean;
  // For range type
  step?: number;
  // Layout
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  // Custom render
  render?: (props: FieldRenderProps) => React.ReactNode;
}

export interface FormSchema {
  fields: FormField[];
  layout?: 'single' | 'two-column' | 'three-column' | 'grid';
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
}

export interface FieldRenderProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export interface DynamicFormBuilderProps {
  schema: FormSchema;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  onReset?: () => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
}

// ============================================================================
// Field Components
// ============================================================================

function TextInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  const inputType = field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text';

  return (
    <input
      type={inputType}
      id={field.id}
      name={field.name}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-neutral-900 dark:text-white',
        'bg-white dark:bg-neutral-800',
        'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        error
          ? 'border-error-500 focus:ring-error-500'
          : 'border-neutral-300 dark:border-neutral-600',
        disabled && 'opacity-50 cursor-not-allowed',
        field.className
      )}
    />
  );
}

function NumberInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  return (
    <input
      type="number"
      id={field.id}
      name={field.name}
      value={(value as number) ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      min={field.validation?.min}
      max={field.validation?.max}
      step={field.step}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-neutral-900 dark:text-white',
        'bg-white dark:bg-neutral-800',
        'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        error
          ? 'border-error-500 focus:ring-error-500'
          : 'border-neutral-300 dark:border-neutral-600',
        disabled && 'opacity-50 cursor-not-allowed',
        field.className
      )}
    />
  );
}

function TextareaInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  return (
    <textarea
      id={field.id}
      name={field.name}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      rows={4}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-neutral-900 dark:text-white',
        'bg-white dark:bg-neutral-800',
        'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y',
        error
          ? 'border-error-500 focus:ring-error-500'
          : 'border-neutral-300 dark:border-neutral-600',
        disabled && 'opacity-50 cursor-not-allowed',
        field.className
      )}
    />
  );
}

function SelectInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  return (
    <select
      id={field.id}
      name={field.name}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || field.disabled}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-neutral-900 dark:text-white',
        'bg-white dark:bg-neutral-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        error
          ? 'border-error-500 focus:ring-error-500'
          : 'border-neutral-300 dark:border-neutral-600',
        disabled && 'opacity-50 cursor-not-allowed',
        field.className
      )}
    >
      {field.placeholder && (
        <option value="">{field.placeholder}</option>
      )}
      {field.options?.map((option) => (
        <option
          key={String(option.value)}
          value={String(option.value)}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function MultiSelectInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  const selectedValues = (value as (string | number)[]) || [];

  const toggleValue = (optionValue: string | number | boolean) => {
    const stringValue = String(optionValue);
    if (selectedValues.includes(stringValue)) {
      onChange(selectedValues.filter((v) => v !== stringValue));
    } else {
      onChange([...selectedValues, stringValue]);
    }
  };

  return (
    <div className={cn('space-y-2', field.className)}>
      {field.options?.map((option) => (
        <label
          key={String(option.value)}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(String(option.value))}
            onChange={() => toggleValue(option.value)}
            disabled={disabled || field.disabled || option.disabled}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function CheckboxInput({
  field,
  value,
  onChange,
  disabled,
}: FieldRenderProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="checkbox"
        id={field.id}
        name={field.name}
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled || field.disabled}
        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
      />
      {field.label && (
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {field.label}
        </span>
      )}
    </label>
  );
}

function RadioInput({
  field,
  value,
  onChange,
  disabled,
}: FieldRenderProps) {
  return (
    <div className={cn('space-y-2', field.className)}>
      {field.options?.map((option) => (
        <label
          key={String(option.value)}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="radio"
            name={field.name}
            value={String(option.value)}
            checked={value === option.value || value === String(option.value)}
            onChange={() => onChange(option.value)}
            disabled={disabled || field.disabled || option.disabled}
            className="w-4 h-4 border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function SwitchInput({
  field,
  value,
  onChange,
  disabled,
}: FieldRenderProps) {
  const isChecked = Boolean(value);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={() => !disabled && !field.disabled && onChange(!isChecked)}
      disabled={disabled || field.disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        isChecked
          ? 'bg-primary-600'
          : 'bg-neutral-200 dark:bg-neutral-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          isChecked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

function DateInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  const inputType = field.type === 'datetime' ? 'datetime-local' : field.type === 'time' ? 'time' : 'date';

  return (
    <input
      type={inputType}
      id={field.id}
      name={field.name}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-neutral-900 dark:text-white',
        'bg-white dark:bg-neutral-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        error
          ? 'border-error-500 focus:ring-error-500'
          : 'border-neutral-300 dark:border-neutral-600',
        disabled && 'opacity-50 cursor-not-allowed',
        field.className
      )}
    />
  );
}

function FileInput({
  field,
  onChange,
  error,
  disabled,
}: FieldRenderProps) {
  return (
    <input
      type="file"
      id={field.id}
      name={field.name}
      onChange={(e) => onChange(e.target.files)}
      accept={field.accept}
      multiple={field.multiple}
      disabled={disabled || field.disabled}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-neutral-900 dark:text-white',
        'bg-white dark:bg-neutral-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        'file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0',
        'file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700',
        'dark:file:bg-primary-900/30 dark:file:text-primary-300',
        error
          ? 'border-error-500 focus:ring-error-500'
          : 'border-neutral-300 dark:border-neutral-600',
        disabled && 'opacity-50 cursor-not-allowed',
        field.className
      )}
    />
  );
}

function RangeInput({
  field,
  value,
  onChange,
  disabled,
}: FieldRenderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        id={field.id}
        name={field.name}
        value={(value as number) ?? field.validation?.min ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={field.validation?.min ?? 0}
        max={field.validation?.max ?? 100}
        step={field.step ?? 1}
        disabled={disabled || field.disabled}
        className={cn(
          'flex-1 h-2 rounded-lg appearance-none cursor-pointer',
          'bg-neutral-200 dark:bg-neutral-700',
          disabled && 'opacity-50 cursor-not-allowed',
          field.className
        )}
      />
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[3ch] text-right">
        {value ?? field.validation?.min ?? 0}
      </span>
    </div>
  );
}

function ColorInput({
  field,
  value,
  onChange,
  disabled,
}: FieldRenderProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        id={field.id}
        name={field.name}
        value={(value as string) || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || field.disabled}
        className={cn(
          'w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          field.className
        )}
      />
      <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
        {value || '#000000'}
      </span>
    </div>
  );
}

// ============================================================================
// Array Field Component
// ============================================================================

interface ArrayFieldProps {
  field: FormField;
  value: unknown[];
  onChange: (value: unknown[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  formValues: Record<string, unknown>;
}

function ArrayField({
  field,
  value,
  onChange,
  errors,
  disabled,
  formValues,
}: ArrayFieldProps) {
  const items = value || [];
  const canAddMore = !field.maxItems || items.length < field.maxItems;
  const canRemove = !field.minItems || items.length > field.minItems;

  const addItem = () => {
    if (canAddMore) {
      const defaultItem: Record<string, unknown> = {};
      field.fields?.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaultItem[f.name] = f.defaultValue;
        }
      });
      onChange([...items, defaultItem]);
    }
  };

  const removeItem = (index: number) => {
    if (canRemove) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, itemValue: Record<string, unknown>) => {
    const newItems = [...items];
    newItems[index] = itemValue;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {field.itemLabel || 'Item'} {index + 1}
              </span>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                  className="p-1 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <FormFields
              fields={field.fields || []}
              values={item as Record<string, unknown>}
              onChange={(newValues) => updateItem(index, newValues)}
              errors={errors}
              disabled={disabled}
              formValues={formValues}
              layout="single"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {canAddMore && (
        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg',
            'text-primary-600 dark:text-primary-400',
            'border border-dashed border-primary-300 dark:border-primary-700',
            'hover:bg-primary-50 dark:hover:bg-primary-900/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          Add {field.itemLabel || 'Item'}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Group Field Component
// ============================================================================

interface GroupFieldProps {
  field: FormField;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  formValues: Record<string, unknown>;
}

function GroupField({
  field,
  value,
  onChange,
  errors,
  disabled,
  formValues,
}: GroupFieldProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 text-left"
      >
        <span className="font-medium text-neutral-900 dark:text-white">
          {field.label}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4"
          >
            <FormFields
              fields={field.fields || []}
              values={value || {}}
              onChange={onChange}
              errors={errors}
              disabled={disabled}
              formValues={formValues}
              layout="single"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Field Wrapper Component
// ============================================================================

interface FieldWrapperProps {
  field: FormField;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ field, error, children }: FieldWrapperProps) {
  if (field.type === 'hidden') {
    return <>{children}</>;
  }

  if (field.type === 'checkbox') {
    return (
      <div className={cn('space-y-1', field.className)}>
        {children}
        {error && (
          <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
        )}
        {field.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {field.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', field.className)}>
      {field.label && field.type !== 'checkbox' && (
        <label
          htmlFor={field.id}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {field.label}
          {field.validation?.required && (
            <span className="text-error-500 ml-1">*</span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
      {field.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {field.description}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Conditional Visibility Check
// ============================================================================

function checkCondition(
  rule: ConditionalRule,
  formValues: Record<string, unknown>
): boolean {
  const fieldValue = formValues[rule.field];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;
    case 'not_equals':
      return fieldValue !== rule.value;
    case 'contains':
      return String(fieldValue).includes(String(rule.value));
    case 'greater_than':
      return Number(fieldValue) > Number(rule.value);
    case 'less_than':
      return Number(fieldValue) < Number(rule.value);
    case 'is_empty':
      return fieldValue === undefined || fieldValue === null || fieldValue === '';
    case 'is_not_empty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    default:
      return true;
  }
}

function shouldShowField(
  field: FormField,
  formValues: Record<string, unknown>
): boolean {
  if (field.hidden) return false;
  if (!field.showIf) return true;

  const rules = Array.isArray(field.showIf) ? field.showIf : [field.showIf];
  return rules.every((rule) => checkCondition(rule, formValues));
}

// ============================================================================
// Form Fields Renderer
// ============================================================================

interface FormFieldsProps {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  formValues: Record<string, unknown>;
  layout?: 'single' | 'two-column' | 'three-column' | 'grid';
}

function FormFields({
  fields,
  values,
  onChange,
  errors,
  disabled,
  formValues,
  layout = 'single',
}: FormFieldsProps) {
  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      onChange({ ...values, [name]: value });
    },
    [values, onChange]
  );

  const getFieldComponent = (field: FormField) => {
    const fieldValue = values[field.name];
    const fieldError = errors?.[field.name];
    const renderProps: FieldRenderProps = {
      field,
      value: fieldValue,
      onChange: (val) => handleFieldChange(field.name, val),
      error: fieldError,
      disabled,
    };

    // Custom render
    if (field.render) {
      return field.render(renderProps);
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
        return <TextInput {...renderProps} />;
      case 'number':
        return <NumberInput {...renderProps} />;
      case 'textarea':
      case 'richtext':
        return <TextareaInput {...renderProps} />;
      case 'select':
        return <SelectInput {...renderProps} />;
      case 'multiselect':
        return <MultiSelectInput {...renderProps} />;
      case 'checkbox':
        return <CheckboxInput {...renderProps} />;
      case 'radio':
        return <RadioInput {...renderProps} />;
      case 'switch':
        return <SwitchInput {...renderProps} />;
      case 'date':
      case 'datetime':
      case 'time':
        return <DateInput {...renderProps} />;
      case 'file':
        return <FileInput {...renderProps} />;
      case 'range':
        return <RangeInput {...renderProps} />;
      case 'color':
        return <ColorInput {...renderProps} />;
      case 'hidden':
        return (
          <input type="hidden" name={field.name} value={String(fieldValue ?? '')} />
        );
      case 'group':
        return (
          <GroupField
            field={field}
            value={fieldValue as Record<string, unknown>}
            onChange={(val) => handleFieldChange(field.name, val)}
            errors={errors}
            disabled={disabled}
            formValues={formValues}
          />
        );
      case 'array':
        return (
          <ArrayField
            field={field}
            value={fieldValue as unknown[]}
            onChange={(val) => handleFieldChange(field.name, val)}
            errors={errors}
            disabled={disabled}
            formValues={formValues}
          />
        );
      default:
        return <TextInput {...renderProps} />;
    }
  };

  const gridClasses = {
    single: 'grid-cols-1',
    'two-column': 'grid-cols-1 md:grid-cols-2',
    'three-column': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    grid: 'grid-cols-12',
  };

  const getColSpan = (field: FormField) => {
    if (layout !== 'grid') return '';
    const span = field.colSpan || 12;
    return `col-span-12 md:col-span-${span}`;
  };

  return (
    <div className={cn('grid gap-4', gridClasses[layout])}>
      {fields.map((field) => {
        if (!shouldShowField(field, formValues)) return null;

        return (
          <div key={field.id} className={getColSpan(field)}>
            <FieldWrapper field={field} error={errors?.[field.name]}>
              {getFieldComponent(field)}
            </FieldWrapper>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Validation
// ============================================================================

function validateField(
  field: FormField,
  value: unknown,
  formValues: Record<string, unknown>
): string | null {
  const validation = field.validation;
  if (!validation) return null;

  // Required check
  if (validation.required) {
    if (value === undefined || value === null || value === '') {
      return `${field.label || field.name} is required`;
    }
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const stringValue = String(value);

  // String validations
  if (validation.minLength && stringValue.length < validation.minLength) {
    return `${field.label || field.name} must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && stringValue.length > validation.maxLength) {
    return `${field.label || field.name} must be no more than ${validation.maxLength} characters`;
  }

  // Number validations
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `${field.label || field.name} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${field.label || field.name} must be no more than ${validation.max}`;
    }
  }

  // Pattern validation
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(stringValue)) {
      return validation.patternMessage || `${field.label || field.name} is invalid`;
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value, formValues);
  }

  return null;
}

function validateForm(
  fields: FormField[],
  values: Record<string, unknown>,
  formValues: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};

  function validateFields(fieldList: FormField[], prefix = '') {
    fieldList.forEach((field) => {
      const fullName = prefix ? `${prefix}.${field.name}` : field.name;

      // Skip hidden fields
      if (!shouldShowField(field, formValues)) return;

      if (field.type === 'group' && field.fields) {
        validateFields(
          field.fields,
          fullName
        );
      } else if (field.type === 'array' && field.fields) {
        const arrayValue = (values[field.name] as unknown[]) || [];
        arrayValue.forEach((item, index) => {
          field.fields?.forEach((subField) => {
            const error = validateField(
              subField,
              (item as Record<string, unknown>)[subField.name],
              formValues
            );
            if (error) {
              errors[`${fullName}[${index}].${subField.name}`] = error;
            }
          });
        });
      } else {
        const error = validateField(field, values[field.name], formValues);
        if (error) {
          errors[fullName] = error;
        }
      }
    });
  }

  validateFields(fields);
  return errors;
}

// ============================================================================
// Main Dynamic Form Builder Component
// ============================================================================

export function DynamicFormBuilder({
  schema,
  values: controlledValues,
  onChange,
  onSubmit,
  onReset,
  errors: externalErrors,
  disabled,
  readonly,
  className,
}: DynamicFormBuilderProps) {
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    return defaults;
  });

  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const values = controlledValues ?? internalValues;
  const errors = externalErrors ?? internalErrors;

  const handleChange = useCallback(
    (newValues: Record<string, unknown>) => {
      if (onChange) {
        onChange(newValues);
      } else {
        setInternalValues(newValues);
      }
      // Clear errors for changed fields
      setInternalErrors({});
    },
    [onChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateForm(schema.fields, values, values);
    if (Object.keys(validationErrors).length > 0) {
      setInternalErrors(validationErrors);
      return;
    }

    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    const defaults: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });

    if (onChange) {
      onChange(defaults);
    } else {
      setInternalValues(defaults);
    }
    setInternalErrors({});
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <FormFields
        fields={schema.fields}
        values={values}
        onChange={handleChange}
        errors={errors}
        disabled={disabled || isSubmitting || readonly}
        formValues={values}
        layout={schema.layout}
      />

      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          {isSubmitting ? 'Submitting...' : schema.submitLabel || 'Submit'}
        </button>

        {schema.showReset && (
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled || isSubmitting}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'text-neutral-700 dark:text-neutral-300',
              'bg-neutral-100 dark:bg-neutral-800',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {schema.resetLabel || 'Reset'}
          </button>
        )}
      </div>
    </form>
  );
}

// ============================================================================
// Schema Utilities
// ============================================================================

export function createFormSchema(fields: FormField[], options?: Partial<FormSchema>): FormSchema {
  return {
    fields,
    layout: options?.layout || 'single',
    submitLabel: options?.submitLabel,
    resetLabel: options?.resetLabel,
    showReset: options?.showReset,
  };
}

export function createTextField(
  name: string,
  label: string,
  options?: Partial<FormField>
): FormField {
  return {
    id: name,
    name,
    type: 'text',
    label,
    ...options,
  };
}

export function createSelectField(
  name: string,
  label: string,
  options: FieldOption[],
  fieldOptions?: Partial<FormField>
): FormField {
  return {
    id: name,
    name,
    type: 'select',
    label,
    options,
    ...fieldOptions,
  };
}

export default DynamicFormBuilder;
