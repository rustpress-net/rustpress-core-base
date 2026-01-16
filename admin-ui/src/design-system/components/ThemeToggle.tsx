/**
 * ThemeToggle Component (Enhancement #104)
 * Dark/light mode toggle with system preference support
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  systemTheme: ResolvedTheme;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: 'class' | 'data-theme';
  enableSystem?: boolean;
}

export interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'switch' | 'button' | 'pill';
  showLabel?: boolean;
  showSystemOption?: boolean;
  className?: string;
}

export interface ThemeSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export interface ThemeDropdownProps {
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  className?: string;
}

export interface ColorSchemeProps {
  children: React.ReactNode;
  scheme: 'light' | 'dark';
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ============================================================================
// ThemeProvider Component
// ============================================================================

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'rustpress-theme',
  attribute = 'class',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme, attribute]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// ThemeToggle Component (Icon Button)
// ============================================================================

export function ThemeToggle({
  size = 'md',
  variant = 'icon',
  showLabel = false,
  showSystemOption = false,
  className = '',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: { button: 'p-1.5', icon: 'w-4 h-4', text: 'text-xs' },
    md: { button: 'p-2', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { button: 'p-2.5', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  // Simple icon toggle
  if (variant === 'icon') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`
          ${sizes.button}
          rounded-lg
          bg-neutral-100 dark:bg-neutral-800
          hover:bg-neutral-200 dark:hover:bg-neutral-700
          text-neutral-700 dark:text-neutral-300
          transition-colors
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={resolvedTheme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {resolvedTheme === 'light' ? (
              <Moon className={sizes.icon} />
            ) : (
              <Sun className={sizes.icon} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  // Switch toggle
  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center gap-2
          ${className}
        `}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {showLabel && (
          <span className={`text-neutral-600 dark:text-neutral-400 ${sizes.text}`}>
            {resolvedTheme === 'light' ? 'Light' : 'Dark'}
          </span>
        )}
        <div
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            bg-neutral-200 dark:bg-neutral-700
            transition-colors
          `}
        >
          <Sun className="absolute left-1 w-3.5 h-3.5 text-yellow-500" />
          <Moon className="absolute right-1 w-3.5 h-3.5 text-blue-400" />
          <motion.div
            className="h-5 w-5 rounded-full bg-white shadow-sm"
            animate={{ x: resolvedTheme === 'light' ? 2 : 22 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </button>
    );
  }

  // Button with label
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          inline-flex items-center gap-2 ${sizes.button}
          rounded-lg px-3
          bg-neutral-100 dark:bg-neutral-800
          hover:bg-neutral-200 dark:hover:bg-neutral-700
          text-neutral-700 dark:text-neutral-300
          transition-colors
          ${className}
        `}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {resolvedTheme === 'light' ? (
          <Moon className={sizes.icon} />
        ) : (
          <Sun className={sizes.icon} />
        )}
        {showLabel && (
          <span className={sizes.text}>
            {resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </button>
    );
  }

  // Pill toggle with 3 options
  if (variant === 'pill') {
    const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
      { value: 'light', icon: <Sun className={sizes.icon} />, label: 'Light' },
      { value: 'dark', icon: <Moon className={sizes.icon} />, label: 'Dark' },
    ];

    if (showSystemOption) {
      options.push({ value: 'system', icon: <Monitor className={sizes.icon} />, label: 'System' });
    }

    return (
      <div
        className={`
          inline-flex items-center gap-0.5 p-1
          bg-neutral-100 dark:bg-neutral-800 rounded-lg
          ${className}
        `}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              relative ${sizes.button} px-3 rounded-md
              transition-colors
              ${theme === option.value
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }
            `}
            aria-label={`Use ${option.label} theme`}
          >
            <span className="flex items-center gap-1.5">
              {option.icon}
              {showLabel && <span className={sizes.text}>{option.label}</span>}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return null;
}

// ============================================================================
// ThemeSwitcher Component (Three-way toggle)
// ============================================================================

export function ThemeSwitcher({
  size = 'md',
  showLabels = true,
  className = '',
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: { button: 'p-2', icon: 'w-4 h-4', text: 'text-xs' },
    md: { button: 'p-2.5', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { button: 'p-3', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className={sizes.icon} />, label: 'Light' },
    { value: 'dark', icon: <Moon className={sizes.icon} />, label: 'Dark' },
    { value: 'system', icon: <Monitor className={sizes.icon} />, label: 'System' },
  ];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`
            flex items-center gap-3 ${sizes.button} px-4
            rounded-lg transition-colors
            ${theme === option.value
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }
          `}
        >
          {option.icon}
          {showLabels && <span className={sizes.text}>{option.label}</span>}
          {theme === option.value && (
            <Check className="w-4 h-4 ml-auto" />
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// ThemeDropdown Component
// ============================================================================

export function ThemeDropdown({
  size = 'md',
  align = 'right',
  className = '',
}: ThemeDropdownProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: { button: 'p-1.5', icon: 'w-4 h-4', text: 'text-xs' },
    md: { button: 'p-2', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { button: 'p-2.5', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className={sizes.icon} />, label: 'Light' },
    { value: 'dark', icon: <Moon className={sizes.icon} />, label: 'Dark' },
    { value: 'system', icon: <Monitor className={sizes.icon} />, label: 'System' },
  ];

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          ${sizes.button}
          rounded-lg
          bg-neutral-100 dark:bg-neutral-800
          hover:bg-neutral-200 dark:hover:bg-neutral-700
          text-neutral-700 dark:text-neutral-300
          transition-colors
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Theme options"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {resolvedTheme === 'light' ? (
          <Sun className={sizes.icon} />
        ) : (
          <Moon className={sizes.icon} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-2 z-50
              ${align === 'right' ? 'right-0' : 'left-0'}
              min-w-[140px]
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-700
              rounded-lg shadow-lg
              overflow-hidden
            `}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2
                  ${sizes.text}
                  transition-colors
                  ${theme === option.value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                {option.icon}
                <span>{option.label}</span>
                {theme === option.value && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ColorScheme Component (Force theme for children)
// ============================================================================

export function ColorScheme({ children, scheme, className = '' }: ColorSchemeProps) {
  return (
    <div className={`${scheme} ${className}`} data-theme={scheme}>
      {children}
    </div>
  );
}

// ============================================================================
// ThemePreview Component
// ============================================================================

export interface ThemePreviewProps {
  theme: Theme;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function ThemePreview({
  theme,
  onClick,
  selected = false,
  className = '',
}: ThemePreviewProps) {
  const previewTheme = theme === 'system' ? 'light' : theme;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-1 rounded-lg border-2 transition-colors
        ${selected
          ? 'border-primary-500'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
        }
        ${className}
      `}
    >
      <div
        className={`
          w-24 h-16 rounded overflow-hidden
          ${previewTheme === 'light' ? 'bg-white' : 'bg-neutral-900'}
        `}
      >
        {/* Mock UI */}
        <div
          className={`h-3 ${previewTheme === 'light' ? 'bg-neutral-100' : 'bg-neutral-800'}`}
        />
        <div className="p-1.5 flex gap-1">
          <div
            className={`w-4 h-8 rounded ${previewTheme === 'light' ? 'bg-neutral-200' : 'bg-neutral-700'}`}
          />
          <div className="flex-1 space-y-1">
            <div
              className={`h-2 rounded ${previewTheme === 'light' ? 'bg-neutral-200' : 'bg-neutral-700'}`}
            />
            <div
              className={`h-2 w-2/3 rounded ${previewTheme === 'light' ? 'bg-neutral-200' : 'bg-neutral-700'}`}
            />
          </div>
        </div>
      </div>

      {theme === 'system' && (
        <div className="absolute -top-1 -right-1 p-0.5 bg-white dark:bg-neutral-900 rounded-full">
          <Monitor className="w-3 h-3 text-neutral-500" />
        </div>
      )}

      <p className="mt-1 text-xs text-center text-neutral-600 dark:text-neutral-400 capitalize">
        {theme}
      </p>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 p-0.5 bg-primary-500 rounded-full"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </button>
  );
}

// ============================================================================
// ThemeSelector Component (Visual theme picker)
// ============================================================================

export interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const themes: Theme[] = ['light', 'dark', 'system'];

  return (
    <div className={`flex gap-3 ${className}`}>
      {themes.map((t) => (
        <ThemePreview
          key={t}
          theme={t}
          selected={theme === t}
          onClick={() => setTheme(t)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// DarkModeWarning Component
// ============================================================================

export interface DarkModeWarningProps {
  message?: string;
  className?: string;
}

export function DarkModeWarning({
  message = 'This content is optimized for light mode.',
  className = '',
}: DarkModeWarningProps) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'light') return null;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2
        bg-yellow-50 dark:bg-yellow-900/20
        border border-yellow-200 dark:border-yellow-800
        rounded-lg text-sm text-yellow-800 dark:text-yellow-200
        ${className}
      `}
    >
      <Sun className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}

// ============================================================================
// usePrefersDark Hook
// ============================================================================

export function usePrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersDark;
}

// ============================================================================
// Animated Theme Icon
// ============================================================================

export interface AnimatedThemeIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedThemeIcon({ size = 'md', className = '' }: AnimatedThemeIconProps) {
  const { resolvedTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <AnimatePresence mode="wait">
        {resolvedTheme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Sun className="w-full h-full text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Moon className="w-full h-full text-blue-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeToggle;
