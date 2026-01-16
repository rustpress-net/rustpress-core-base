/**
 * RustPress Accordion Component
 * Collapsible sections with smooth animations
 */

import React, { useState, useCallback, createContext, useContext, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  onChange?: (openIds: string[]) => void;
  variant?: 'default' | 'bordered' | 'separated' | 'ghost';
  iconPosition?: 'left' | 'right';
  expandIcon?: 'chevron' | 'plus' | 'custom';
  customExpandIcon?: (isOpen: boolean) => React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface AccordionContextType {
  openIds: Set<string>;
  toggle: (id: string) => void;
  variant: 'default' | 'bordered' | 'separated' | 'ghost';
  iconPosition: 'left' | 'right';
  expandIcon: 'chevron' | 'plus' | 'custom';
  customExpandIcon?: (isOpen: boolean) => React.ReactNode;
  size: 'sm' | 'md' | 'lg';
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  sm: {
    header: 'px-3 py-2',
    headerText: 'text-sm',
    content: 'px-3 pb-3',
    contentText: 'text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    header: 'px-4 py-3',
    headerText: 'text-base',
    content: 'px-4 pb-4',
    contentText: 'text-sm',
    icon: 'w-5 h-5',
  },
  lg: {
    header: 'px-5 py-4',
    headerText: 'text-lg',
    content: 'px-5 pb-5',
    contentText: 'text-base',
    icon: 'w-6 h-6',
  },
};

// ============================================================================
// Expand Icon Component
// ============================================================================

interface ExpandIconProps {
  isOpen: boolean;
  type: 'chevron' | 'plus' | 'custom';
  customIcon?: (isOpen: boolean) => React.ReactNode;
  className?: string;
}

function ExpandIcon({ isOpen, type, customIcon, className }: ExpandIconProps) {
  if (type === 'custom' && customIcon) {
    return <>{customIcon(isOpen)}</>;
  }

  if (type === 'plus') {
    return isOpen ? (
      <Minus className={cn('transition-transform', className)} />
    ) : (
      <Plus className={cn('transition-transform', className)} />
    );
  }

  return (
    <ChevronDown
      className={cn(
        'transition-transform duration-200',
        isOpen && 'rotate-180',
        className
      )}
    />
  );
}

// ============================================================================
// Accordion Item Component
// ============================================================================

interface AccordionItemComponentProps {
  item: AccordionItem;
  isFirst: boolean;
  isLast: boolean;
}

function AccordionItemComponent({ item, isFirst, isLast }: AccordionItemComponentProps) {
  const context = useContext(AccordionContext);
  if (!context) return null;

  const { openIds, toggle, variant, iconPosition, expandIcon, customExpandIcon, size } = context;
  const config = sizeConfig[size];
  const isOpen = openIds.has(item.id);
  const headerId = `accordion-header-${item.id}`;
  const contentId = `accordion-content-${item.id}`;

  const variantStyles = {
    default: cn(
      'border-b border-neutral-200 dark:border-neutral-700',
      isFirst && 'border-t',
      'bg-white dark:bg-neutral-900'
    ),
    bordered: cn(
      'border border-neutral-200 dark:border-neutral-700',
      !isFirst && '-mt-px',
      isFirst && 'rounded-t-lg',
      isLast && !isOpen && 'rounded-b-lg',
      isOpen && isLast && 'rounded-b-none',
      'bg-white dark:bg-neutral-900'
    ),
    separated: cn(
      'border border-neutral-200 dark:border-neutral-700 rounded-lg',
      'bg-white dark:bg-neutral-900'
    ),
    ghost: '',
  };

  const headerHoverStyles = {
    default: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
    bordered: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
    separated: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg',
  };

  return (
    <div className={variantStyles[variant]}>
      {/* Header */}
      <button
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={item.disabled}
        onClick={() => toggle(item.id)}
        className={cn(
          'w-full flex items-center gap-3 text-left transition-colors',
          config.header,
          headerHoverStyles[variant],
          item.disabled && 'opacity-50 cursor-not-allowed',
          variant === 'bordered' && isFirst && 'rounded-t-lg',
          variant === 'bordered' && isLast && !isOpen && 'rounded-b-lg'
        )}
      >
        {/* Left Icon */}
        {iconPosition === 'left' && (
          <ExpandIcon
            isOpen={isOpen}
            type={expandIcon}
            customIcon={customExpandIcon}
            className={cn(config.icon, 'flex-shrink-0 text-neutral-400')}
          />
        )}

        {/* Item Icon */}
        {item.icon && (
          <span className={cn('flex-shrink-0', isOpen ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400')}>
            {item.icon}
          </span>
        )}

        {/* Title */}
        <span className={cn('flex-1 font-medium text-neutral-900 dark:text-white', config.headerText)}>
          {item.title}
        </span>

        {/* Badge */}
        {item.badge && (
          <span className="flex-shrink-0">
            {item.badge}
          </span>
        )}

        {/* Right Icon */}
        {iconPosition === 'right' && (
          <ExpandIcon
            isOpen={isOpen}
            type={expandIcon}
            customIcon={customExpandIcon}
            className={cn(config.icon, 'flex-shrink-0 text-neutral-400')}
          />
        )}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn(config.content, config.contentText, 'text-neutral-600 dark:text-neutral-400')}>
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Accordion Component
// ============================================================================

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  onChange,
  variant = 'default',
  iconPosition = 'right',
  expandIcon = 'chevron',
  customExpandIcon,
  size = 'md',
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set(defaultOpenIds);
    items.forEach((item) => {
      if (item.defaultOpen) {
        initial.add(item.id);
      }
    });
    return initial;
  });

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(prev);

        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!allowMultiple) {
            next.clear();
          }
          next.add(id);
        }

        onChange?.(Array.from(next));
        return next;
      });
    },
    [allowMultiple, onChange]
  );

  const contextValue: AccordionContextType = {
    openIds,
    toggle,
    variant,
    iconPosition,
    expandIcon,
    customExpandIcon,
    size,
  };

  const containerClass = variant === 'separated' ? 'space-y-2' : '';

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn(containerClass, className)}>
        {items.map((item, index) => (
          <AccordionItemComponent
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === items.length - 1}
          />
        ))}
      </div>
    </AccordionContext.Provider>
  );
}

// ============================================================================
// FAQ Accordion (specialized for FAQs)
// ============================================================================

export interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  showCategories?: boolean;
  searchable?: boolean;
  className?: string;
}

export function FAQAccordion({
  items,
  showCategories = false,
  searchable = false,
  className,
}: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof item.answer === 'string' &&
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items;

  const groupedItems = showCategories
    ? filteredItems.reduce((acc, item) => {
        const category = item.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, FAQItem[]>)
    : { All: filteredItems };

  const accordionItems = Object.entries(groupedItems).map(([category, categoryItems]) => ({
    category,
    items: categoryItems.map((item) => ({
      id: item.id,
      title: item.question,
      content: item.answer,
      icon: <HelpCircle className="w-5 h-5" />,
    })),
  }));

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className={cn(
              'w-full px-4 py-2 text-sm rounded-lg border',
              'bg-white dark:bg-neutral-800',
              'border-neutral-300 dark:border-neutral-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'placeholder:text-neutral-400'
            )}
          />
        </div>
      )}

      {showCategories ? (
        <div className="space-y-6">
          {accordionItems.map(({ category, items: categoryAccordionItems }) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <Accordion
                items={categoryAccordionItems}
                variant="separated"
              />
            </div>
          ))}
        </div>
      ) : (
        <Accordion
          items={accordionItems[0]?.items || []}
          variant="separated"
        />
      )}

      {filteredItems.length === 0 && (
        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
          No FAQs found matching your search.
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Collapsible Card (single accordion item)
// ============================================================================

export interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'bordered';
  className?: string;
}

export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
  actions,
  variant = 'default',
  className,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div
      className={cn(
        'rounded-lg',
        variant === 'bordered'
          ? 'border border-neutral-200 dark:border-neutral-700'
          : 'bg-white dark:bg-neutral-900 shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <ChevronDown
            className={cn(
              'w-5 h-5 text-neutral-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
          {icon && (
            <span className="text-neutral-400">
              {icon}
            </span>
          )}
          <span className="font-medium text-neutral-900 dark:text-white">
            {title}
          </span>
          {badge && <span>{badge}</span>}
        </button>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Nested Accordion (for multi-level content)
// ============================================================================

export interface NestedAccordionItem {
  id: string;
  title: string;
  content?: React.ReactNode;
  children?: NestedAccordionItem[];
}

export interface NestedAccordionProps {
  items: NestedAccordionItem[];
  className?: string;
}

function NestedAccordionNode({
  item,
  level,
}: {
  item: NestedAccordionItem;
  level: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className={cn(level > 0 && 'ml-4 border-l border-neutral-200 dark:border-neutral-700 pl-4')}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2 py-2 text-left',
          'hover:text-primary-600 dark:hover:text-primary-400',
          'transition-colors'
        )}
      >
        {hasChildren && (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-neutral-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="font-medium text-neutral-900 dark:text-white">
          {item.title}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {item.content && (
              <div className="py-2 text-sm text-neutral-600 dark:text-neutral-400 ml-6">
                {item.content}
              </div>
            )}

            {hasChildren && (
              <div className="pb-2">
                {item.children!.map((child) => (
                  <NestedAccordionNode
                    key={child.id}
                    item={child}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NestedAccordion({ items, className }: NestedAccordionProps) {
  return (
    <div className={className}>
      {items.map((item) => (
        <NestedAccordionNode key={item.id} item={item} level={0} />
      ))}
    </div>
  );
}

export default Accordion;
