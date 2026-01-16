/**
 * RustPress Tabs Component
 * Animated tabs with multiple variants
 */

import React, { createContext, useContext, useState, useId, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { tabContent } from '../animations';

export type TabsVariant = 'default' | 'pills' | 'underline' | 'enclosed' | 'soft';
export type TabsSize = 'sm' | 'md' | 'lg';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
}

// Main Tabs container
export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ value, onChange: handleChange, variant, size, orientation }}
    >
      <div
        className={cn(
          'w-full',
          orientation === 'vertical' && 'flex gap-4',
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tab List container
export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const { variant, orientation } = useTabs();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // Find active tab and update indicator
  useEffect(() => {
    if (!listRef.current || variant !== 'underline') return;

    const activeTab = listRef.current.querySelector('[data-state="active"]');
    if (activeTab) {
      const tabRect = activeTab.getBoundingClientRect();
      const listRect = listRef.current.getBoundingClientRect();

      setIndicatorStyle({
        width: tabRect.width,
        left: tabRect.left - listRect.left,
      });
    }
  }, [variant]);

  const variantStyles: Record<TabsVariant, string> = {
    default: 'border-b border-neutral-200 dark:border-neutral-800',
    pills: 'bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl',
    underline: 'border-b-2 border-neutral-200 dark:border-neutral-800',
    enclosed:
      'border border-neutral-200 dark:border-neutral-800 rounded-t-xl bg-neutral-50 dark:bg-neutral-900',
    soft: 'gap-1',
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        'relative flex',
        orientation === 'horizontal' && 'flex-row',
        orientation === 'vertical' && 'flex-col',
        variantStyles[variant],
        className
      )}
    >
      {children}
      {/* Animated underline indicator */}
      {variant === 'underline' && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary-500"
          layoutId="tab-indicator"
          style={indicatorStyle}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </div>
  );
}

// Individual Tab trigger
export interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function Tab({
  value: tabValue,
  children,
  disabled = false,
  icon,
  badge,
  className,
}: TabProps) {
  const { value, onChange, variant, size, orientation } = useTabs();
  const id = useId();
  const isActive = value === tabValue;

  const sizeStyles: Record<TabsSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantStyles: Record<TabsVariant, { base: string; active: string; inactive: string }> = {
    default: {
      base: 'border-b-2 -mb-px transition-colors duration-150',
      active: 'border-primary-500 text-primary-600 dark:text-primary-400',
      inactive:
        'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
    },
    pills: {
      base: 'rounded-lg transition-all duration-150',
      active: 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm',
      inactive:
        'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200',
    },
    underline: {
      base: 'transition-colors duration-150 -mb-0.5',
      active: 'text-primary-600 dark:text-primary-400',
      inactive:
        'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
    },
    enclosed: {
      base: 'border-b-2 -mb-px transition-colors duration-150',
      active:
        'border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-t-lg',
      inactive:
        'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
    },
    soft: {
      base: 'rounded-lg transition-all duration-150',
      active:
        'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      inactive:
        'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}-${tabValue}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}-${tabValue}`}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      onClick={() => !disabled && onChange(tabValue)}
      className={cn(
        'relative flex items-center justify-center gap-2',
        'font-medium whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        sizeStyles[size],
        styles.base,
        isActive ? styles.active : styles.inactive,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {badge && <span className="flex-shrink-0">{badge}</span>}

      {/* Pills variant active indicator */}
      {variant === 'pills' && isActive && (
        <motion.div
          layoutId="pills-indicator"
          className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-lg shadow-sm -z-10"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}

// Tab Panel content
export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function TabPanel({
  value: panelValue,
  children,
  className,
  forceMount = false,
}: TabPanelProps) {
  const { value } = useTabs();
  const id = useId();
  const isActive = value === panelValue;

  if (!isActive && !forceMount) return null;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={panelValue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role="tabpanel"
          id={`panel-${id}-${panelValue}`}
          aria-labelledby={`tab-${id}-${panelValue}`}
          tabIndex={0}
          className={cn('focus:outline-none', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Tab Panels container
export interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanels({ children, className }: TabPanelsProps) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

export default Tabs;
