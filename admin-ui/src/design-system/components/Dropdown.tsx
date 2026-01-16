/**
 * RustPress Dropdown Component
 * Accessible dropdown menu with keyboard navigation
 */

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { dropdownMenu, menuItem as menuItemAnimation } from '../animations';

// Context for dropdown state
interface DropdownContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

// Main Dropdown container
export interface DropdownProps {
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dropdown({ children, onOpenChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
    setActiveIndex(-1);
  }, [onOpenChange]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        close();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, close]);

  return (
    <DropdownContext.Provider
      value={{ isOpen, toggle, close, activeIndex, setActiveIndex, triggerRef }}
    >
      <div className="relative inline-block" data-dropdown>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Trigger button
export interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { toggle, isOpen, triggerRef } = useDropdown();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        toggle();
        children.props.onClick?.(e);
      },
      'aria-expanded': isOpen,
      'aria-haspopup': 'menu',
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      className={className}
    >
      {children}
    </button>
  );
}

// Menu content
export interface DropdownMenuProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  sideOffset?: number;
  className?: string;
  width?: 'auto' | 'trigger' | number;
}

export function DropdownMenu({
  children,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  className,
  width = 'auto',
}: DropdownMenuProps) {
  const { isOpen, triggerRef, close, activeIndex, setActiveIndex } = useDropdown();
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement[]>([]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = itemsRef.current.filter(Boolean);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeIndex >= 0) {
            items[activeIndex]?.click();
          }
          break;
      }
    },
    [activeIndex, setActiveIndex]
  );

  // Focus active item
  useEffect(() => {
    if (activeIndex >= 0) {
      itemsRef.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  // Position calculations
  const getPositionStyles = () => {
    const styles: React.CSSProperties = {
      position: 'absolute',
    };

    if (side === 'bottom') {
      styles.top = `calc(100% + ${sideOffset}px)`;
    } else {
      styles.bottom = `calc(100% + ${sideOffset}px)`;
    }

    if (align === 'start') {
      styles.left = 0;
    } else if (align === 'end') {
      styles.right = 0;
    } else {
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
    }

    if (width === 'trigger' && triggerRef.current) {
      styles.width = triggerRef.current.offsetWidth;
    } else if (typeof width === 'number') {
      styles.width = width;
    }

    return styles;
  };

  // Clone children to add refs
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === DropdownItem) {
      return React.cloneElement(child as React.ReactElement<any>, {
        ref: (el: HTMLElement) => {
          itemsRef.current[index] = el;
        },
        isActive: index === activeIndex,
      });
    }
    return child;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -5 : 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -5 : 5 }}
          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          style={getPositionStyles()}
          className={cn(
            'z-dropdown min-w-[180px]',
            'py-1.5 rounded-xl',
            'bg-white dark:bg-neutral-900',
            'border border-neutral-200 dark:border-neutral-800',
            'shadow-lg dark:shadow-2xl',
            'focus:outline-none',
            className
          )}
          role="menu"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {enhancedChildren}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Menu item
export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  shortcut?: string;
  isActive?: boolean;
  isDestructive?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  (
    {
      children,
      icon,
      shortcut,
      isActive,
      isDestructive,
      isSelected,
      disabled,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const { close } = useDropdown();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onClick?.(e);
        close();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2',
          'text-sm text-left',
          'transition-colors duration-100',
          'focus:outline-none',

          // Default state
          !isDestructive && [
            'text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'focus:bg-neutral-100 dark:focus:bg-neutral-800',
          ],

          // Destructive
          isDestructive && [
            'text-error-600 dark:text-error-400',
            'hover:bg-error-50 dark:hover:bg-error-900/20',
            'focus:bg-error-50 dark:focus:bg-error-900/20',
          ],

          // Active (keyboard navigation)
          isActive && 'bg-neutral-100 dark:bg-neutral-800',

          // Disabled
          disabled && 'opacity-50 cursor-not-allowed',

          className
        )}
        {...props}
      >
        {icon && (
          <span
            className={cn(
              'flex-shrink-0 w-4 h-4',
              isDestructive
                ? 'text-error-500'
                : 'text-neutral-400 dark:text-neutral-500'
            )}
          >
            {icon}
          </span>
        )}
        <span className="flex-1 truncate">{children}</span>
        {isSelected && (
          <Check className="flex-shrink-0 w-4 h-4 text-primary-600 dark:text-primary-400" />
        )}
        {shortcut && (
          <kbd
            className={cn(
              'ml-auto flex-shrink-0',
              'text-xs text-neutral-400 dark:text-neutral-500',
              'bg-neutral-100 dark:bg-neutral-800',
              'px-1.5 py-0.5 rounded'
            )}
          >
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

// Separator
export function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'my-1.5 h-px',
        'bg-neutral-200 dark:bg-neutral-800',
        className
      )}
      role="separator"
    />
  );
}

// Label/Header
export function DropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-3 py-1.5',
        'text-xs font-semibold uppercase tracking-wider',
        'text-neutral-400 dark:text-neutral-500',
        className
      )}
    >
      {children}
    </div>
  );
}

// Sub-menu
export interface DropdownSubMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function DropdownSubMenu({ trigger, children, icon }: DropdownSubMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 100);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2',
          'text-sm text-left',
          'text-neutral-700 dark:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors duration-100'
        )}
      >
        {icon && (
          <span className="flex-shrink-0 w-4 h-4 text-neutral-400">{icon}</span>
        )}
        <span className="flex-1">{trigger}</span>
        <ChevronRight className="w-4 h-4 text-neutral-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute left-full top-0 ml-1',
              'min-w-[160px] py-1.5 rounded-xl',
              'bg-white dark:bg-neutral-900',
              'border border-neutral-200 dark:border-neutral-800',
              'shadow-lg'
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
