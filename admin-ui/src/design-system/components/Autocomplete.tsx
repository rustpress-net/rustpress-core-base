/**
 * Autocomplete Component (Enhancement #86)
 * Search input with suggestions and auto-completion
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ChevronRight, Clock, TrendingUp, Star, AlertCircle } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface AutocompleteOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  disabled?: boolean;
  group?: string;
  meta?: Record<string, any>;
}

export interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  options?: AutocompleteOption[];
  loadOptions?: (query: string) => Promise<AutocompleteOption[]>;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  minChars?: number;
  debounceMs?: number;
  maxResults?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
  showRecentSearches?: boolean;
  recentSearches?: string[];
  onRecentSearchSelect?: (query: string) => void;
  emptyMessage?: string;
  noResultsMessage?: string;
  highlightMatch?: boolean;
  groupBy?: boolean;
  className?: string;
}

export interface SearchAutocompleteProps extends Omit<AutocompleteProps, 'variant'> {
  onSearch?: (query: string) => void;
  showTrending?: boolean;
  trendingItems?: { label: string; count?: number }[];
  hotkey?: string;
}

export interface CommandAutocompleteProps {
  commands: {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action: () => void;
    group?: string;
  }[];
  placeholder?: string;
  onClose?: () => void;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary-200 dark:bg-primary-800 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const getSizeClasses = (size: string) => {
  const sizes: Record<string, { input: string; icon: string; option: string }> = {
    sm: { input: 'h-8 px-3 text-sm', icon: 'w-4 h-4', option: 'py-1.5 px-3 text-sm' },
    md: { input: 'h-10 px-4 text-base', icon: 'w-5 h-5', option: 'py-2 px-4' },
    lg: { input: 'h-12 px-5 text-lg', icon: 'w-6 h-6', option: 'py-3 px-5 text-lg' },
  };
  return sizes[size] || sizes.md;
};

// ============================================================================
// Autocomplete Component
// ============================================================================

export function Autocomplete({
  value,
  onChange,
  onSelect,
  options: staticOptions,
  loadOptions,
  placeholder = 'Search...',
  label,
  hint,
  error,
  disabled = false,
  loading: externalLoading = false,
  clearable = true,
  minChars = 1,
  debounceMs = 300,
  maxResults = 10,
  size = 'md',
  variant = 'default',
  showRecentSearches = false,
  recentSearches = [],
  onRecentSearchSelect,
  emptyMessage = 'Start typing to search',
  noResultsMessage = 'No results found',
  highlightMatch = true,
  groupBy = false,
  className = '',
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const loading = externalLoading || internalLoading;
  const sizeClasses = getSizeClasses(size);

  // Combine static and async options
  const allOptions = loadOptions ? asyncOptions : (staticOptions || []);

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!value.trim() || value.length < minChars) {
      return [];
    }

    const query = value.toLowerCase();
    return allOptions
      .filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          opt.description?.toLowerCase().includes(query)
      )
      .slice(0, maxResults);
  }, [allOptions, value, minChars, maxResults]);

  // Group options if needed
  const groupedOptions = useMemo(() => {
    if (!groupBy) return { '': filteredOptions };

    return filteredOptions.reduce((groups, option) => {
      const group = option.group || '';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
      return groups;
    }, {} as Record<string, AutocompleteOption[]>);
  }, [filteredOptions, groupBy]);

  // Load async options
  useEffect(() => {
    if (!loadOptions || value.length < minChars) {
      setAsyncOptions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setInternalLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await loadOptions(value);
        setAsyncOptions(results);
      } catch (err) {
        console.error('Autocomplete load error:', err);
        setAsyncOptions([]);
      } finally {
        setInternalLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, loadOptions, minChars, debounceMs]);

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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          setIsOpen(true);
        }
        return;
      }

      const flatOptions = Object.values(groupedOptions).flat();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < flatOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : flatOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
            handleSelectOption(flatOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, groupedOptions, highlightedIndex]
  );

  const handleSelectOption = (option: AutocompleteOption) => {
    if (option.disabled) return;
    onChange(option.label);
    onSelect?.(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const variantClasses = {
    default: `
      border border-neutral-300 dark:border-neutral-600
      bg-white dark:bg-neutral-800
      focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20
    `,
    filled: `
      bg-neutral-100 dark:bg-neutral-800
      border-2 border-transparent
      focus-within:bg-white dark:focus-within:bg-neutral-900
      focus-within:border-primary-500
    `,
    ghost: `
      bg-transparent
      border-b-2 border-neutral-200 dark:border-neutral-700
      rounded-none
      focus-within:border-primary-500
    `,
  };

  const showDropdown =
    isOpen &&
    (filteredOptions.length > 0 ||
      (showRecentSearches && recentSearches.length > 0 && !value) ||
      value.length >= minChars);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Input Container */}
      <div
        className={`
          relative flex items-center rounded-lg transition-all
          ${variantClasses[variant]}
          ${error ? 'border-error-500 focus-within:border-error-500 focus-within:ring-error-500/20' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Search Icon */}
        <Search className={`absolute left-3 text-neutral-400 ${sizeClasses.icon}`} />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full bg-transparent outline-none
            pl-10 pr-10
            text-neutral-900 dark:text-white
            placeholder-neutral-400
            ${sizeClasses.input}
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        />

        {/* Loading / Clear */}
        <div className="absolute right-3 flex items-center gap-1">
          {loading && (
            <Loader2 className={`${sizeClasses.icon} text-neutral-400 animate-spin`} />
          )}
          {clearable && value && !loading && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
            >
              <X className={sizeClasses.icon} />
            </button>
          )}
        </div>
      </div>

      {/* Hint / Error */}
      {(hint || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}>
          {error || hint}
        </p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <ul ref={listRef} className="max-h-80 overflow-y-auto py-1" role="listbox">
              {/* Recent Searches */}
              {showRecentSearches && recentSearches.length > 0 && !value && (
                <>
                  <li className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Recent Searches
                  </li>
                  {recentSearches.slice(0, 5).map((query, i) => (
                    <li
                      key={`recent-${i}`}
                      onClick={() => {
                        onChange(query);
                        onRecentSearchSelect?.(query);
                      }}
                      className={`
                        flex items-center gap-2 cursor-pointer
                        ${sizeClasses.option}
                        hover:bg-neutral-100 dark:hover:bg-neutral-700
                        text-neutral-700 dark:text-neutral-300
                      `}
                    >
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>{query}</span>
                    </li>
                  ))}
                  {filteredOptions.length > 0 && (
                    <li className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                  )}
                </>
              )}

              {/* Options */}
              {filteredOptions.length === 0 && value.length >= minChars && !loading ? (
                <li className={`${sizeClasses.option} text-neutral-500 text-center`}>
                  {noResultsMessage}
                </li>
              ) : (
                Object.entries(groupedOptions).map(([group, options]) => (
                  <React.Fragment key={group || 'default'}>
                    {group && groupBy && (
                      <li className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-900">
                        {group}
                      </li>
                    )}
                    {options.map((option, i) => {
                      const flatIndex = Object.values(groupedOptions)
                        .flat()
                        .findIndex((o) => o.value === option.value);
                      const isHighlighted = flatIndex === highlightedIndex;

                      return (
                        <li
                          key={option.value}
                          onClick={() => handleSelectOption(option)}
                          className={`
                            flex items-center gap-3 cursor-pointer
                            ${sizeClasses.option}
                            ${isHighlighted ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'}
                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          {option.image && (
                            <img
                              src={option.image}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          {option.icon && !option.image && (
                            <span className="text-neutral-400">{option.icon}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-neutral-900 dark:text-white truncate">
                              {highlightMatch ? highlightText(option.label, value) : option.label}
                            </div>
                            {option.description && (
                              <div className="text-sm text-neutral-500 truncate">
                                {highlightMatch
                                  ? highlightText(option.description, value)
                                  : option.description}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        </li>
                      );
                    })}
                  </React.Fragment>
                ))
              )}

              {/* Empty state */}
              {filteredOptions.length === 0 && value.length < minChars && !showRecentSearches && (
                <li className={`${sizeClasses.option} text-neutral-500 text-center`}>
                  {emptyMessage}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Search Autocomplete Component
// ============================================================================

export function SearchAutocomplete({
  onSearch,
  showTrending = false,
  trendingItems = [],
  hotkey,
  ...props
}: SearchAutocompleteProps) {
  const [value, setValue] = useState(props.value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Hotkey support
  useEffect(() => {
    if (!hotkey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === hotkey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hotkey]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim()) {
      onSearch?.(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Autocomplete
        {...props}
        value={value}
        onChange={(v) => {
          setValue(v);
          props.onChange?.(v);
        }}
        showRecentSearches={props.showRecentSearches ?? true}
      />
      {showTrending && trendingItems.length > 0 && !value && (
        <div className="mt-3">
          <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trending</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingItems.slice(0, 5).map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setValue(item.label);
                  onSearch?.(item.label);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-xs text-neutral-400">{item.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}

// ============================================================================
// Command Autocomplete Component
// ============================================================================

export function CommandAutocomplete({
  commands,
  placeholder = 'Type a command...',
  onClose,
  className = '',
}: CommandAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter and group commands
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((groups, cmd) => {
      const group = cmd.group || 'Commands';
      if (!groups[group]) groups[group] = [];
      groups[group].push(cmd);
      return groups;
    }, {} as Record<string, typeof commands>);
  }, [filteredCommands]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[highlightedIndex]) {
          filteredCommands[highlightedIndex].action();
          onClose?.();
        }
        break;
      case 'Escape':
        onClose?.();
        break;
    }
  };

  let currentIndex = 0;

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <Search className="w-5 h-5 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto">
        {filteredCommands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>No commands found</p>
          </div>
        ) : (
          Object.entries(groupedCommands).map(([group, cmds]) => (
            <div key={group}>
              <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-900">
                {group}
              </div>
              {cmds.map((cmd) => {
                const index = currentIndex++;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => {
                      cmd.action();
                      onClose?.();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left
                      ${isHighlighted ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}
                    `}
                  >
                    {cmd.icon && (
                      <span className="text-neutral-400">{cmd.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {cmd.label}
                      </div>
                      {cmd.description && (
                        <div className="text-sm text-neutral-500 truncate">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Autocomplete;
