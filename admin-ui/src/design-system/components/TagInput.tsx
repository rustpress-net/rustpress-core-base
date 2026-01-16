/**
 * TagInput Component
 *
 * Enterprise-grade tag input and management:
 * - Tag input with autocomplete
 * - Drag & drop reordering
 * - Color-coded tags
 * - Tag groups and categories
 * - Read-only tag display
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  X,
  Plus,
  Tag as TagIcon,
  Hash,
  Check,
  ChevronDown,
  Search,
  Palette,
  GripVertical,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface Tag {
  id: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export type TagSize = 'xs' | 'sm' | 'md' | 'lg';
export type TagVariant = 'solid' | 'outline' | 'soft' | 'dot';

export interface TagProps {
  tag: Tag;
  size?: TagSize;
  variant?: TagVariant;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface TagInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  suggestions?: Tag[];
  placeholder?: string;
  maxTags?: number;
  minTags?: number;
  allowCreate?: boolean;
  allowDuplicates?: boolean;
  validateTag?: (tag: string) => boolean | string;
  createTag?: (input: string) => Tag;
  size?: TagSize;
  variant?: TagVariant;
  disabled?: boolean;
  readonly?: boolean;
  sortable?: boolean;
  showCount?: boolean;
  delimiter?: string | string[];
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
}

export interface TagGroupProps {
  title?: string;
  tags: Tag[];
  selectedTags?: string[];
  onSelect?: (tagId: string) => void;
  onDeselect?: (tagId: string) => void;
  multiSelect?: boolean;
  size?: TagSize;
  variant?: TagVariant;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export interface TagCloudProps {
  tags: (Tag & { weight?: number })[];
  minFontSize?: number;
  maxFontSize?: number;
  onClick?: (tag: Tag) => void;
  className?: string;
}

export interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
  multiSelect?: boolean;
  showCounts?: boolean;
  searchable?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const sizeClasses: Record<TagSize, { tag: string; text: string; icon: string; input: string }> = {
  xs: { tag: 'px-1.5 py-0.5', text: 'text-xs', icon: 'w-3 h-3', input: 'text-xs' },
  sm: { tag: 'px-2 py-0.5', text: 'text-sm', icon: 'w-3.5 h-3.5', input: 'text-sm' },
  md: { tag: 'px-2.5 py-1', text: 'text-sm', icon: 'w-4 h-4', input: 'text-base' },
  lg: { tag: 'px-3 py-1.5', text: 'text-base', icon: 'w-5 h-5', input: 'text-lg' },
};

const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

// ============================================================================
// Tag Component
// ============================================================================

export function TagBadge({
  tag,
  size = 'md',
  variant = 'soft',
  removable = false,
  onClick,
  onRemove,
  selected = false,
  disabled = false,
  className,
}: TagProps) {
  const sizes = sizeClasses[size];
  const color = tag.color || '#6B7280';

  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: color,
          color: 'white',
          borderColor: color,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: color,
          borderColor: color,
          borderWidth: '1px',
        };
      case 'dot':
        return {};
      case 'soft':
      default:
        return {
          backgroundColor: `${color}20`,
          color: color,
        };
    }
  };

  const styles = variant !== 'dot' ? getVariantStyles() : {};

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all',
        sizes.tag,
        sizes.text,
        onClick && !disabled && 'cursor-pointer hover:opacity-80',
        selected && 'ring-2 ring-primary-500 ring-offset-1',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'dot' && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
        className
      )}
      style={styles}
      onClick={() => !disabled && onClick?.()}
    >
      {variant === 'dot' && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}

      {tag.icon && (
        <span className={cn('flex-shrink-0', sizes.icon)}>
          {tag.icon}
        </span>
      )}

      <span className="truncate max-w-[150px]">{tag.label}</span>

      {tag.count !== undefined && (
        <span className="opacity-70">({tag.count})</span>
      )}

      {removable && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'flex-shrink-0 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 -mr-1',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-current'
          )}
        >
          <X className={sizes.icon} />
        </button>
      )}
    </motion.span>
  );
}

// ============================================================================
// Tag Input Component
// ============================================================================

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add tags...',
  maxTags,
  minTags,
  allowCreate = true,
  allowDuplicates = false,
  validateTag,
  createTag,
  size = 'md',
  variant = 'soft',
  disabled = false,
  readonly = false,
  sortable = false,
  showCount = false,
  delimiter = [',', 'Enter', 'Tab'],
  label,
  helperText,
  error,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizes = sizeClasses[size];
  const delimiters = Array.isArray(delimiter) ? delimiter : [delimiter];

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return suggestions;

    const search = inputValue.toLowerCase();
    return suggestions.filter(
      (s) =>
        s.label.toLowerCase().includes(search) &&
        (allowDuplicates || !value.some((t) => t.id === s.id))
    );
  }, [inputValue, suggestions, value, allowDuplicates]);

  // Add a tag
  const addTag = useCallback(
    (input: string | Tag) => {
      if (disabled || readonly) return;
      if (maxTags && value.length >= maxTags) return;

      let newTag: Tag;

      if (typeof input === 'string') {
        const trimmed = input.trim();
        if (!trimmed) return;

        // Validate
        if (validateTag) {
          const result = validateTag(trimmed);
          if (result !== true) return;
        }

        // Check duplicates
        if (!allowDuplicates && value.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) {
          return;
        }

        // Create tag
        newTag = createTag
          ? createTag(trimmed)
          : { id: `tag-${Date.now()}`, label: trimmed };
      } else {
        if (!allowDuplicates && value.some((t) => t.id === input.id)) {
          return;
        }
        newTag = input;
      }

      onChange([...value, newTag]);
      setInputValue('');
      setShowSuggestions(false);
      setFocusedIndex(-1);
    },
    [disabled, readonly, maxTags, value, validateTag, allowDuplicates, createTag, onChange]
  );

  // Remove a tag
  const removeTag = useCallback(
    (tagId: string) => {
      if (disabled || readonly) return;
      if (minTags && value.length <= minTags) return;

      onChange(value.filter((t) => t.id !== tagId));
    },
    [disabled, readonly, minTags, value, onChange]
  );

  // Handle input key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;

    // Check if key is a delimiter
    if (delimiters.includes(key) && inputValue.trim()) {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredSuggestions[focusedIndex]) {
        addTag(filteredSuggestions[focusedIndex]);
      } else if (allowCreate) {
        addTag(inputValue);
      }
      return;
    }

    // Navigate suggestions
    if (key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }

    // Remove last tag on backspace
    if (key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1].id);
    }

    // Close suggestions on escape
    if (key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Check for delimiter in pasted content
    for (const d of delimiters) {
      if (d !== 'Enter' && d !== 'Tab' && newValue.includes(d)) {
        const parts = newValue.split(d);
        parts.forEach((part) => {
          if (part.trim()) {
            addTag(part.trim());
          }
        });
        return;
      }
    }

    setInputValue(newValue);
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle tag reorder
  const handleReorder = (newOrder: Tag[]) => {
    onChange(newOrder);
  };

  const canAddMore = !maxTags || value.length < maxTags;

  return (
    <div className={cn('flex flex-col gap-1', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {showCount && maxTags && (
            <span className="ml-2 text-neutral-500">
              ({value.length}/{maxTags})
            </span>
          )}
        </label>
      )}

      <div
        className={cn(
          'flex flex-wrap items-center gap-2 p-2 rounded-lg border transition-colors',
          'bg-white dark:bg-neutral-900',
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
            : 'border-neutral-300 dark:border-neutral-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
          disabled && 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {sortable ? (
          <Reorder.Group
            axis="x"
            values={value}
            onReorder={handleReorder}
            className="flex flex-wrap items-center gap-2"
          >
            <AnimatePresence mode="popLayout">
              {value.map((tag) => (
                <Reorder.Item key={tag.id} value={tag} className="cursor-grab active:cursor-grabbing">
                  <TagBadge
                    tag={tag}
                    size={size}
                    variant={variant}
                    removable={!readonly && !disabled}
                    onRemove={() => removeTag(tag.id)}
                    disabled={tag.disabled}
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        ) : (
          <AnimatePresence mode="popLayout">
            {value.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                size={size}
                variant={variant}
                removable={!readonly && !disabled}
                onRemove={() => removeTag(tag.id)}
                disabled={tag.disabled}
              />
            ))}
          </AnimatePresence>
        )}

        {!readonly && canAddMore && (
          <div className="relative flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled}
              className={cn(
                'w-full bg-transparent outline-none',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                'text-neutral-900 dark:text-white',
                sizes.input,
                disabled && 'cursor-not-allowed'
              )}
            />

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && (filteredSuggestions.length > 0 || (allowCreate && inputValue.trim())) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'absolute left-0 top-full mt-1 w-full min-w-[200px] max-h-48 overflow-auto',
                    'bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700',
                    'z-50'
                  )}
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        focusedIndex === index && 'bg-neutral-100 dark:bg-neutral-800',
                        sizes.text
                      )}
                    >
                      {suggestion.color && (
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: suggestion.color }}
                        />
                      )}
                      <span className="text-neutral-900 dark:text-white">{suggestion.label}</span>
                      {suggestion.count !== undefined && (
                        <span className="text-neutral-500 ml-auto">({suggestion.count})</span>
                      )}
                    </button>
                  ))}

                  {allowCreate && inputValue.trim() && !filteredSuggestions.some(
                    (s) => s.label.toLowerCase() === inputValue.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={() => addTag(inputValue)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700',
                        focusedIndex === filteredSuggestions.length && 'bg-neutral-100 dark:bg-neutral-800',
                        sizes.text
                      )}
                    >
                      <Plus className={sizes.icon} />
                      <span>Create "{inputValue}"</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {(helperText || error) && (
        <p className={cn('text-sm', error ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Tag Group Component
// ============================================================================

export function TagGroup({
  title,
  tags,
  selectedTags = [],
  onSelect,
  onDeselect,
  multiSelect = true,
  size = 'md',
  variant = 'soft',
  collapsible = false,
  defaultExpanded = true,
  className,
}: TagGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleTagClick = (tag: Tag) => {
    if (tag.disabled) return;

    const isSelected = selectedTags.includes(tag.id);

    if (isSelected) {
      onDeselect?.(tag.id);
    } else {
      if (!multiSelect && selectedTags.length > 0) {
        // Deselect current selection first
        selectedTags.forEach((id) => onDeselect?.(id));
      }
      onSelect?.(tag.id);
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {title && (
        <button
          type="button"
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2',
            collapsible && 'cursor-pointer hover:text-neutral-900 dark:hover:text-white'
          )}
        >
          {collapsible && (
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
          )}
          {title}
          <span className="text-neutral-500">({tags.length})</span>
        </button>
      )}

      <AnimatePresence>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {tags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                size={size}
                variant={variant}
                selected={selectedTags.includes(tag.id)}
                onClick={() => handleTagClick(tag)}
                disabled={tag.disabled}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Tag Cloud Component
// ============================================================================

export function TagCloud({
  tags,
  minFontSize = 12,
  maxFontSize = 32,
  onClick,
  className,
}: TagCloudProps) {
  const weights = tags.map((t) => t.weight || t.count || 1);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  const getFontSize = (weight: number) => {
    if (maxWeight === minWeight) return (minFontSize + maxFontSize) / 2;
    const normalized = (weight - minWeight) / (maxWeight - minWeight);
    return minFontSize + normalized * (maxFontSize - minFontSize);
  };

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3 p-4', className)}>
      {tags.map((tag) => {
        const fontSize = getFontSize(tag.weight || tag.count || 1);

        return (
          <motion.button
            key={tag.id}
            type="button"
            onClick={() => onClick?.(tag)}
            className={cn(
              'text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400',
              'transition-colors cursor-pointer'
            )}
            style={{
              fontSize: `${fontSize}px`,
              color: tag.color,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {tag.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Tag Filter Component
// ============================================================================

export function TagFilter({
  tags,
  selectedTags,
  onChange,
  multiSelect = true,
  showCounts = true,
  searchable = false,
  className,
}: TagFilterProps) {
  const [search, setSearch] = useState('');

  const filteredTags = useMemo(() => {
    if (!search) return tags;
    return tags.filter((t) =>
      t.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [tags, search]);

  const handleToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      if (multiSelect) {
        onChange([...selectedTags, tagId]);
      } else {
        onChange([tagId]);
      }
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className={cn(
              'w-full pl-9 pr-3 py-2 rounded-lg border',
              'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700',
              'text-sm text-neutral-900 dark:text-white',
              'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            )}
          />
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            {selectedTags.length} selected
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filteredTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggle(tag.id)}
              disabled={tag.disabled}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isSelected
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600',
                tag.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tag.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
              )}
              {tag.label}
              {showCounts && tag.count !== undefined && (
                <span className="text-neutral-500">({tag.count})</span>
              )}
              {isSelected && (
                <Check className="w-3.5 h-3.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Tag Color Picker Component
// ============================================================================

export interface TagColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  colors?: string[];
  allowCustom?: boolean;
  className?: string;
}

export function TagColorPicker({
  value,
  onChange,
  colors = defaultColors,
  allowCustom = true,
  className,
}: TagColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'w-6 h-6 rounded-full transition-transform hover:scale-110',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
            value === color && 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white'
          )}
          style={{ backgroundColor: color }}
        />
      ))}

      {allowCustom && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              'w-6 h-6 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600',
              'flex items-center justify-center hover:border-neutral-400 dark:hover:border-neutral-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500'
            )}
          >
            <Palette className="w-3 h-3 text-neutral-400" />
          </button>

          {showCustom && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-10">
              <input
                type="color"
                value={value || '#6B7280'}
                onChange={(e) => onChange(e.target.value)}
                className="w-20 h-8 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Tag List (Read-only)
// ============================================================================

export interface TagListProps {
  tags: Tag[];
  size?: TagSize;
  variant?: TagVariant;
  max?: number;
  onClick?: (tag: Tag) => void;
  className?: string;
}

export function TagList({
  tags,
  size = 'sm',
  variant = 'soft',
  max,
  onClick,
  className,
}: TagListProps) {
  const displayTags = max ? tags.slice(0, max) : tags;
  const remainingCount = max ? tags.length - max : 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {displayTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          size={size}
          variant={variant}
          onClick={onClick ? () => onClick(tag) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span className={cn(
          'text-neutral-500 dark:text-neutral-400',
          sizeClasses[size].text
        )}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

export default TagInput;
