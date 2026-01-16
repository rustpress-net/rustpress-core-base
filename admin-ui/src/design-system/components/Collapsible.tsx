/**
 * Collapsible Component (Enhancement #93)
 * Expandable/collapsible content sections
 */

import React, { useState, useCallback, createContext, useContext, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface CollapsibleTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export interface CollapsibleContentProps {
  children: React.ReactNode;
  forceMount?: boolean;
  className?: string;
}

export interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
  icon?: 'chevron' | 'plus' | 'arrow' | 'none';
  iconPosition?: 'left' | 'right';
  className?: string;
}

export interface AccordionContentProps {
  children: React.ReactNode;
  forceMount?: boolean;
  className?: string;
}

export interface ExpandableSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface ExpandableCardProps {
  header: React.ReactNode;
  children: React.ReactNode;
  preview?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// ============================================================================
// Collapsible Context
// ============================================================================

interface CollapsibleContextValue {
  isOpen: boolean;
  toggle: () => void;
  disabled: boolean;
  contentId: string;
  triggerId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

const useCollapsible = () => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible components must be used within a Collapsible');
  }
  return context;
};

// ============================================================================
// Collapsible Component
// ============================================================================

export function Collapsible({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className = '',
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const id = useId();
  const contentId = `collapsible-content-${id}`;
  const triggerId = `collapsible-trigger-${id}`;

  const toggle = useCallback(() => {
    if (disabled) return;

    if (isControlled) {
      onOpenChange?.(!isOpen);
    } else {
      setUncontrolledOpen(!isOpen);
      onOpenChange?.(!isOpen);
    }
  }, [disabled, isControlled, isOpen, onOpenChange]);

  return (
    <CollapsibleContext.Provider
      value={{ isOpen, toggle, disabled, contentId, triggerId }}
    >
      <div data-state={isOpen ? 'open' : 'closed'} className={className}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

// ============================================================================
// Collapsible Trigger Component
// ============================================================================

export function CollapsibleTrigger({
  children,
  asChild = false,
  className = '',
}: CollapsibleTriggerProps) {
  const { isOpen, toggle, disabled, contentId, triggerId } = useCollapsible();

  const props = {
    id: triggerId,
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    'data-state': isOpen ? 'open' : 'closed',
    'data-disabled': disabled || undefined,
    disabled,
    onClick: toggle,
    className,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }

  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

// ============================================================================
// Collapsible Content Component
// ============================================================================

export function CollapsibleContent({
  children,
  forceMount = false,
  className = '',
}: CollapsibleContentProps) {
  const { isOpen, contentId, triggerId } = useCollapsible();

  if (!forceMount && !isOpen) {
    return null;
  }

  return (
    <AnimatePresence initial={false}>
      {(isOpen || forceMount) && (
        <motion.div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          data-state={isOpen ? 'open' : 'closed'}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={`overflow-hidden ${className}`}
          style={{ display: isOpen || forceMount ? undefined : 'none' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Accordion Context
// ============================================================================

interface AccordionContextValue {
  value: string[];
  toggle: (itemValue: string) => void;
  type: 'single' | 'multiple';
  collapsible: boolean;
  disabled: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  contentId: string;
  triggerId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem components must be used within an AccordionItem');
  }
  return context;
};

// ============================================================================
// Accordion Component
// ============================================================================

export function Accordion({
  children,
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = false,
  disabled = false,
  className = '',
}: AccordionProps) {
  const getDefaultValue = (): string[] => {
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  };

  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(getDefaultValue);
  const isControlled = controlledValue !== undefined;

  const value = isControlled
    ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue])
    : uncontrolledValue;

  const toggle = useCallback(
    (itemValue: string) => {
      if (disabled) return;

      let newValue: string[];

      if (type === 'single') {
        if (value.includes(itemValue)) {
          newValue = collapsible ? [] : value;
        } else {
          newValue = [itemValue];
        }
      } else {
        if (value.includes(itemValue)) {
          newValue = value.filter((v) => v !== itemValue);
        } else {
          newValue = [...value, itemValue];
        }
      }

      if (isControlled) {
        onValueChange?.(type === 'single' ? (newValue[0] || '') : newValue);
      } else {
        setUncontrolledValue(newValue);
        onValueChange?.(type === 'single' ? (newValue[0] || '') : newValue);
      }
    },
    [disabled, type, value, collapsible, isControlled, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ value, toggle, type, collapsible, disabled }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

// ============================================================================
// Accordion Item Component
// ============================================================================

export function AccordionItem({
  children,
  value,
  disabled: itemDisabled = false,
  className = '',
}: AccordionItemProps) {
  const accordion = useAccordion();
  const id = useId();

  const isOpen = accordion.value.includes(value);
  const disabled = accordion.disabled || itemDisabled;
  const contentId = `accordion-content-${id}`;
  const triggerId = `accordion-trigger-${id}`;

  return (
    <AccordionItemContext.Provider
      value={{ value, isOpen, disabled, contentId, triggerId }}
    >
      <div
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        className={className}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// ============================================================================
// Accordion Trigger Component
// ============================================================================

export function AccordionTrigger({
  children,
  icon = 'chevron',
  iconPosition = 'right',
  className = '',
}: AccordionTriggerProps) {
  const accordion = useAccordion();
  const item = useAccordionItem();

  const handleClick = () => {
    if (!item.disabled) {
      accordion.toggle(item.value);
    }
  };

  const IconComponent = () => {
    if (icon === 'none') return null;

    const iconClass = 'w-4 h-4 transition-transform duration-200';

    switch (icon) {
      case 'plus':
        return item.isOpen ? (
          <Minus className={iconClass} />
        ) : (
          <Plus className={iconClass} />
        );
      case 'arrow':
        return (
          <ChevronRight
            className={`${iconClass} ${item.isOpen ? 'rotate-90' : ''}`}
          />
        );
      case 'chevron':
      default:
        return (
          <ChevronDown
            className={`${iconClass} ${item.isOpen ? 'rotate-180' : ''}`}
          />
        );
    }
  };

  return (
    <button
      type="button"
      id={item.triggerId}
      aria-expanded={item.isOpen}
      aria-controls={item.contentId}
      data-state={item.isOpen ? 'open' : 'closed'}
      data-disabled={item.disabled || undefined}
      disabled={item.disabled}
      onClick={handleClick}
      className={`
        flex items-center w-full text-left
        ${iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse justify-between'}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <IconComponent />
      <span className={iconPosition === 'left' ? 'ml-2' : 'mr-2'}>{children}</span>
    </button>
  );
}

// ============================================================================
// Accordion Content Component
// ============================================================================

export function AccordionContent({
  children,
  forceMount = false,
  className = '',
}: AccordionContentProps) {
  const item = useAccordionItem();

  return (
    <AnimatePresence initial={false}>
      {(item.isOpen || forceMount) && (
        <motion.div
          id={item.contentId}
          role="region"
          aria-labelledby={item.triggerId}
          data-state={item.isOpen ? 'open' : 'closed'}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Expandable Section Component
// ============================================================================

export function ExpandableSection({
  title,
  subtitle,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  variant = 'default',
  size = 'md',
  icon,
  badge,
  disabled = false,
  className = '',
}: ExpandableSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const toggle = () => {
    if (disabled) return;

    if (isControlled) {
      onOpenChange?.(!isOpen);
    } else {
      setInternalOpen(!isOpen);
      onOpenChange?.(!isOpen);
    }
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-5 text-lg',
  };

  const variantClasses = {
    default: '',
    bordered: 'border border-neutral-200 dark:border-neutral-700 rounded-lg',
    filled: 'bg-neutral-50 dark:bg-neutral-800/50 rounded-lg',
    ghost: '',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}
          ${variant === 'bordered' || variant === 'filled' ? 'rounded-t-lg' : ''}
          transition-colors
        `}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-neutral-500">{icon}</div>}
          <div className="text-left">
            <div className="font-medium text-neutral-900 dark:text-white">
              {title}
            </div>
            {subtitle && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </div>
            )}
          </div>
          {badge && <div>{badge}</div>}
        </div>
        <ChevronDown
          className={`
            w-5 h-5 text-neutral-400
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={sizeClasses[size]}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Expandable Card Component
// ============================================================================

export function ExpandableCard({
  header,
  children,
  preview,
  defaultOpen = false,
  onOpenChange,
  className = '',
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    setIsOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  return (
    <div
      className={`
        bg-white dark:bg-neutral-900
        border border-neutral-200 dark:border-neutral-700
        rounded-lg shadow-sm
        ${className}
      `}
    >
      <div
        onClick={toggle}
        className="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">{header}</div>
          <ChevronDown
            className={`
              w-5 h-5 text-neutral-400 ml-4
              transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
          />
        </div>

        {preview && !isOpen && (
          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {preview}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-neutral-100 dark:border-neutral-800">
              <div className="pt-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Details Summary Component (Native HTML-like)
// ============================================================================

export interface DetailsSummaryProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function DetailsSummary({
  summary,
  children,
  defaultOpen = false,
  className = '',
}: DetailsSummaryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left w-full"
      >
        <ChevronRight
          className={`
            w-4 h-4 text-neutral-400
            transition-transform duration-200
            ${isOpen ? 'rotate-90' : ''}
          `}
        />
        <span className="font-medium text-neutral-900 dark:text-white">
          {summary}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden pl-6 mt-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Collapsible;
