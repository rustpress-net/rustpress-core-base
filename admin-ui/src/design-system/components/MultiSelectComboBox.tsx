/**
 * RustPress Multi-Select Combo Box Component
 * Searchable multi-select with tags, async loading, and create option
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  X,
  Check,
  Search,
  Loader2,
  Plus,
  Tag,
} from 'lucide-react';
import { cn } from '../utils';

export interface ComboBoxOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface MultiSelectComboBoxProps {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  options?: ComboBoxOption[];
  loadOptions?: (search: string) => Promise<ComboBoxOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  createOption?: boolean;
  onCreate?: (value: string) => void | ComboBoxOption | Promise<ComboBoxOption>;
  createLabel?: (value: string) => string;
  maxItems?: number;
  minItems?: number;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  closeOnSelect?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'tags' | 'pills';
  className?: string;
  error?: string;
  label?: string;
  hint?: string;
}

export function MultiSelectComboBox({
  value = [],
  onChange,
  options: staticOptions = [],
  loadOptions,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  noOptionsMessage = 'No options found',
  loadingMessage = 'Loading...',
  createOption = false,
  onCreate,
  createLabel = (v) => `Create "${v}"`,
  maxItems,
  minItems,
  disabled = false,
  clearable = true,
  searchable = true,
  closeOnSelect = false,
  size = 'md',
  variant = 'default',
  className,
  error,
  label,
  hint,
}: MultiSelectComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<ComboBoxOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Combined options
  const allOptions = loadOptions ? asyncOptions : staticOptions;

  // Filtered options
  const filteredOptions = useMemo(() => {
    if (!search) return allOptions;
    const searchLower = search.toLowerCase();
    return allOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.description?.toLowerCase().includes(searchLower)
    );
  }, [allOptions, search]);

  // Grouped options
  const groupedOptions = useMemo(() => {
    const groups: Record<string, ComboBoxOption[]> = { '': [] };

    filteredOptions.forEach((opt) => {
      const group = opt.group || '';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(opt);
    });

    return groups;
  }, [filteredOptions]);

  // Selected options (for display)
  const selectedOptions = useMemo(() => {
    return value
      .map((v) => allOptions.find((opt) => opt.value === v))
      .filter(Boolean) as ComboBoxOption[];
  }, [value, allOptions]);

  // Check if can create new option
  const canCreate =
    createOption &&
    search.trim() &&
    !allOptions.some(
      (opt) => opt.label.toLowerCase() === search.toLowerCase()
    );

  // Load async options
  useEffect(() => {
    if (!loadOptions || !isOpen) return;

    const loadAsync = async () => {
      setIsLoading(true);
      try {
        const options = await loadOptions(search);
        setAsyncOptions(options);
      } catch (error) {
        console.error('Failed to load options:', error);
        setAsyncOptions([]);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(loadAsync, 300);
    return () => clearTimeout(debounce);
  }, [loadOptions, search, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && searchable) {
      inputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlighted index on options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Select option
  const selectOption = useCallback(
    (option: ComboBoxOption) => {
      if (option.disabled) return;

      const isSelected = value.includes(option.value);

      if (isSelected) {
        if (!minItems || value.length > minItems) {
          onChange?.(value.filter((v) => v !== option.value));
        }
      } else {
        if (!maxItems || value.length < maxItems) {
          onChange?.([...value, option.value]);
        }
      }

      if (closeOnSelect) {
        setIsOpen(false);
      }

      setSearch('');
    },
    [value, onChange, maxItems, minItems, closeOnSelect]
  );

  // Remove option
  const removeOption = useCallback(
    (optionValue: string | number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!minItems || value.length > minItems) {
        onChange?.(value.filter((v) => v !== optionValue));
      }
    },
    [value, onChange, minItems]
  );

  // Clear all
  const clearAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!minItems) {
        onChange?.([]);
      }
    },
    [onChange, minItems]
  );

  // Create new option
  const handleCreate = useCallback(async () => {
    if (!search.trim() || !onCreate) return;

    const result = await onCreate(search.trim());
    if (result && typeof result === 'object') {
      setAsyncOptions((prev) => [...prev, result]);
      onChange?.([...value, result.value]);
    }

    setSearch('');
    if (closeOnSelect) {
      setIsOpen(false);
    }
  }, [search, onCreate, value, onChange, closeOnSelect]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            Math.min(prev + 1, filteredOptions.length - 1 + (canCreate ? 1 : 0))
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen) {
          if (canCreate && highlightedIndex === filteredOptions.length) {
            handleCreate();
          } else if (filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Backspace':
        if (!search && value.length > 0) {
          removeOption(value[value.length - 1]);
        }
        break;
    }
  };

  // Sizes
  const sizes = {
    sm: {
      container: 'min-h-8 text-sm',
      tag: 'text-xs px-1.5 py-0.5',
      input: 'text-sm',
    },
    md: {
      container: 'min-h-10',
      tag: 'text-sm px-2 py-0.5',
      input: 'text-sm',
    },
    lg: {
      container: 'min-h-12 text-lg',
      tag: 'text-base px-2.5 py-1',
      input: 'text-base',
    },
  };

  // Tag variants
  const tagVariants = {
    default: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    tags: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
    pills: 'bg-primary-500 text-white',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      {/* Main container */}
      <div ref={containerRef} className="relative">
        {/* Input container */}
        <div
          onClick={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            'flex flex-wrap items-center gap-1.5 px-3 py-1.5',
            'rounded-lg border cursor-pointer',
            'transition-all duration-150',
            sizes[size].container,
            disabled
              ? 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-50'
              : isOpen
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : error
              ? 'border-error-500'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400',
            'bg-white dark:bg-neutral-900'
          )}
        >
          {/* Selected tags */}
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className={cn(
                'inline-flex items-center gap-1 rounded',
                sizes[size].tag,
                tagVariants[variant]
              )}
            >
              {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
              <span className="truncate max-w-32">{opt.label}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => removeOption(opt.value, e)}
                  className="flex-shrink-0 hover:text-error-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}

          {/* Search input */}
          {searchable && (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={selectedOptions.length === 0 ? placeholder : ''}
              disabled={disabled}
              className={cn(
                'flex-1 min-w-20 bg-transparent outline-none',
                'placeholder:text-neutral-400',
                sizes[size].input
              )}
            />
          )}

          {/* Placeholder when not searchable */}
          {!searchable && selectedOptions.length === 0 && (
            <span className="text-neutral-400">{placeholder}</span>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Clear button */}
            {clearable && value.length > 0 && !disabled && (
              <button
                type="button"
                onClick={clearAll}
                className="p-0.5 hover:text-error-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown indicator */}
            <ChevronDown
              className={cn(
                'w-4 h-4 text-neutral-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              ref={listRef}
              className={cn(
                'absolute z-50 w-full mt-1',
                'bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-700',
                'rounded-lg shadow-lg overflow-hidden'
              )}
            >
              {/* Search in dropdown (for non-inline search) */}
              {!searchable && (
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={searchPlaceholder}
                      className={cn(
                        'w-full pl-9 pr-3 py-2 rounded-md',
                        'bg-neutral-50 dark:bg-neutral-800',
                        'border border-neutral-200 dark:border-neutral-700',
                        'outline-none focus:ring-2 focus:ring-primary-500'
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Options list */}
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingMessage}</span>
                  </div>
                ) : filteredOptions.length === 0 && !canCreate ? (
                  <div className="py-8 text-center text-neutral-500">
                    {noOptionsMessage}
                  </div>
                ) : (
                  <>
                    {Object.entries(groupedOptions).map(([group, options]) => (
                      <div key={group || 'default'}>
                        {group && (
                          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-800">
                            {group}
                          </div>
                        )}
                        {options.map((option, index) => {
                          const isSelected = value.includes(option.value);
                          const flatIndex = filteredOptions.indexOf(option);
                          const isHighlighted = highlightedIndex === flatIndex;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => selectOption(option)}
                              disabled={option.disabled}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-left',
                                'transition-colors',
                                isHighlighted && 'bg-neutral-100 dark:bg-neutral-800',
                                isSelected && 'bg-primary-50 dark:bg-primary-900/20',
                                option.disabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              )}
                            >
                              {/* Checkbox indicator */}
                              <div
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center',
                                  isSelected
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-neutral-300 dark:border-neutral-600'
                                )}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>

                              {/* Icon */}
                              {option.icon && (
                                <span className="flex-shrink-0 text-neutral-400">
                                  {option.icon}
                                </span>
                              )}

                              {/* Label & description */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-neutral-900 dark:text-white">
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-sm text-neutral-500 truncate">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}

                    {/* Create option */}
                    {canCreate && (
                      <button
                        type="button"
                        onClick={handleCreate}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-left',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                          highlightedIndex === filteredOptions.length &&
                            'bg-neutral-100 dark:bg-neutral-800'
                        )}
                      >
                        <Plus className="w-4 h-4 text-primary-500" />
                        <span className="text-primary-600 dark:text-primary-400">
                          {createLabel(search)}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Footer with count */}
              {value.length > 0 && (
                <div className="px-3 py-2 text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                  {value.length} selected
                  {maxItems && ` (max ${maxItems})`}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-error-500">{error}</p>}

      {/* Hint */}
      {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}

// Single select variant
export interface SingleSelectComboBoxProps
  extends Omit<MultiSelectComboBoxProps, 'value' | 'onChange' | 'maxItems' | 'minItems'> {
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
}

export function SingleSelectComboBox({
  value,
  onChange,
  ...props
}: SingleSelectComboBoxProps) {
  const handleChange = (values: (string | number)[]) => {
    onChange?.(values[values.length - 1] ?? null);
  };

  return (
    <MultiSelectComboBox
      {...props}
      value={value ? [value] : []}
      onChange={handleChange}
      maxItems={1}
      closeOnSelect={true}
    />
  );
}

// Tag input (simple text tags)
export interface TagInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags,
  allowDuplicates = false,
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = input.trim();

      if (tag) {
        if (allowDuplicates || !value.includes(tag)) {
          if (!maxTags || value.length < maxTags) {
            onChange?.([...value, tag]);
          }
        }
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange?.(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 px-3 py-2',
        'rounded-lg border border-neutral-300 dark:border-neutral-600',
        'bg-white dark:bg-neutral-900',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500',
        className
      )}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-sm"
        >
          <Tag className="w-3 h-3 text-neutral-400" />
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:text-error-500"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-20 bg-transparent outline-none text-sm"
      />
    </div>
  );
}

export default MultiSelectComboBox;
