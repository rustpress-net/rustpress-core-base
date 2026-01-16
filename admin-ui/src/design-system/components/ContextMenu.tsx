/**
 * ContextMenu Component
 *
 * Enterprise-grade context menu system:
 * - Right-click context menus
 * - Nested submenus
 * - Keyboard navigation
 * - Icons, shortcuts, and separators
 * - Checkbox and radio items
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronRight,
  Circle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type ContextMenuItemType = 'item' | 'checkbox' | 'radio' | 'separator' | 'label' | 'submenu';

export interface ContextMenuItem {
  id: string;
  type?: ContextMenuItemType;
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  value?: string;
  items?: ContextMenuItem[];
  onSelect?: () => void;
}

export interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  onSelect?: (item: ContextMenuItem) => void;
  disabled?: boolean;
  className?: string;
}

export interface ContextMenuTriggerProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  onSelect?: (item: ContextMenuItem) => void;
  trigger?: 'contextmenu' | 'click' | 'both';
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onSelect?: (item: ContextMenuItem) => void;
}

interface ContextMenuContextValue {
  state: ContextMenuState;
  open: (position: { x: number; y: number }, items: ContextMenuItem[], onSelect?: (item: ContextMenuItem) => void) => void;
  close: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider');
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: [],
  });

  const open = useCallback(
    (position: { x: number; y: number }, items: ContextMenuItem[], onSelect?: (item: ContextMenuItem) => void) => {
      setState({ isOpen: true, position, items, onSelect });
    },
    []
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ContextMenuContext.Provider value={{ state, open, close }}>
      {children}
      <ContextMenuPortal />
    </ContextMenuContext.Provider>
  );
}

// ============================================================================
// Menu Item Component
// ============================================================================

interface MenuItemProps {
  item: ContextMenuItem;
  onSelect: (item: ContextMenuItem) => void;
  onClose: () => void;
  focusedIndex: number;
  index: number;
  onFocusChange: (index: number) => void;
  radioGroup?: string;
  radioValue?: string;
}

function MenuItem({
  item,
  onSelect,
  onClose,
  focusedIndex,
  index,
  onFocusChange,
  radioGroup,
  radioValue,
}: MenuItemProps) {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout>();

  const isFocused = focusedIndex === index;

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.focus();
    }
  }, [isFocused]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  if (item.type === 'separator') {
    return <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />;
  }

  if (item.type === 'label') {
    return (
      <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        {item.label}
      </div>
    );
  }

  const handleClick = () => {
    if (item.disabled) return;

    if (item.type === 'submenu' && item.items) {
      setShowSubmenu(true);
      return;
    }

    onSelect(item);
    onClose();
  };

  const handleMouseEnter = () => {
    onFocusChange(index);
    if (item.type === 'submenu' && item.items) {
      submenuTimeoutRef.current = setTimeout(() => setShowSubmenu(true), 200);
    }
  };

  const handleMouseLeave = () => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    if (item.type === 'submenu') {
      submenuTimeoutRef.current = setTimeout(() => setShowSubmenu(false), 100);
    }
  };

  const isChecked = item.type === 'radio'
    ? radioValue === item.value
    : item.checked;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={itemRef}
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left',
          'transition-colors outline-none',
          isFocused && 'bg-neutral-100 dark:bg-neutral-800',
          item.disabled && 'opacity-50 cursor-not-allowed',
          item.danger && 'text-red-600 dark:text-red-400',
          !item.disabled && !item.danger && 'text-neutral-700 dark:text-neutral-300'
        )}
      >
        {/* Checkbox/Radio indicator */}
        <span className="w-4 flex-shrink-0">
          {item.type === 'checkbox' && isChecked && (
            <Check className="w-4 h-4" />
          )}
          {item.type === 'radio' && isChecked && (
            <Circle className="w-3 h-3 fill-current" />
          )}
          {item.icon && item.type !== 'checkbox' && item.type !== 'radio' && (
            <span className="w-4 h-4">{item.icon}</span>
          )}
        </span>

        {/* Label */}
        <span className="flex-1 truncate">{item.label}</span>

        {/* Shortcut or submenu indicator */}
        {item.shortcut && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-4">
            {item.shortcut}
          </span>
        )}
        {item.type === 'submenu' && (
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        )}
      </button>

      {/* Submenu */}
      {item.type === 'submenu' && item.items && showSubmenu && (
        <div
          className="absolute left-full top-0 -mt-1"
          onMouseEnter={() => {
            if (submenuTimeoutRef.current) {
              clearTimeout(submenuTimeoutRef.current);
            }
            setShowSubmenu(true);
          }}
          onMouseLeave={() => setShowSubmenu(false)}
        >
          <ContextMenuContent
            items={item.items}
            onSelect={onSelect}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Menu Content Component
// ============================================================================

interface ContextMenuContentProps {
  items: ContextMenuItem[];
  onSelect: (item: ContextMenuItem) => void;
  onClose: () => void;
  className?: string;
}

function ContextMenuContent({
  items,
  onSelect,
  onClose,
  className,
}: ContextMenuContentProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get selectable items (not separators or labels)
  const selectableItems = items.filter(
    (item) => item.type !== 'separator' && item.type !== 'label'
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < selectableItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : selectableItems.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && selectableItems[focusedIndex]) {
            const item = selectableItems[focusedIndex];
            if (!item.disabled && item.type !== 'submenu') {
              onSelect(item);
              onClose();
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, selectableItems, onSelect, onClose]);

  // Map focusedIndex to actual item index
  let selectableIndex = -1;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'min-w-[180px] max-w-[300px] py-1',
        'bg-white dark:bg-neutral-900 rounded-lg shadow-lg',
        'border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      {items.map((item, index) => {
        const isSelectable = item.type !== 'separator' && item.type !== 'label';
        if (isSelectable) {
          selectableIndex++;
        }

        return (
          <MenuItem
            key={item.id}
            item={item}
            index={isSelectable ? selectableIndex : -1}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            onSelect={onSelect}
            onClose={onClose}
          />
        );
      })}
    </motion.div>
  );
}

// ============================================================================
// Portal Component
// ============================================================================

function ContextMenuPortal() {
  const { state, close } = useContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(state.position);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!state.isOpen || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = state.position;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 8) {
      x = viewportWidth - rect.width - 8;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 8) {
      y = viewportHeight - rect.height - 8;
    }

    setAdjustedPosition({ x: Math.max(8, x), y: Math.max(8, y) });
  }, [state.isOpen, state.position]);

  // Close on click outside
  useEffect(() => {
    if (!state.isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [state.isOpen, close]);

  // Close on scroll
  useEffect(() => {
    if (!state.isOpen) return;

    const handleScroll = () => close();
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [state.isOpen, close]);

  const handleSelect = (item: ContextMenuItem) => {
    item.onSelect?.();
    state.onSelect?.(item);
  };

  return createPortal(
    <AnimatePresence>
      {state.isOpen && (
        <div
          ref={menuRef}
          className="fixed z-[9999]"
          style={{
            top: adjustedPosition.y,
            left: adjustedPosition.x,
          }}
        >
          <ContextMenuContent
            items={state.items}
            onSelect={handleSelect}
            onClose={close}
          />
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ============================================================================
// Trigger Component
// ============================================================================

export function ContextMenuTrigger({
  children,
  items,
  onSelect,
  trigger = 'contextmenu',
  disabled = false,
  className,
}: ContextMenuTriggerProps) {
  const { open } = useContextMenu();

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    if (trigger === 'contextmenu' || trigger === 'both') {
      e.preventDefault();
      open({ x: e.clientX, y: e.clientY }, items, onSelect);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (trigger === 'click' || trigger === 'both') {
      e.preventDefault();
      open({ x: e.clientX, y: e.clientY }, items, onSelect);
    }
  };

  return (
    <div
      className={className}
      onContextMenu={handleContextMenu}
      onClick={trigger === 'click' || trigger === 'both' ? handleClick : undefined}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Standalone Context Menu Component
// ============================================================================

export function ContextMenu({
  children,
  items,
  onSelect,
  disabled = false,
  className,
}: ContextMenuProps) {
  return (
    <ContextMenuProvider>
      <ContextMenuTrigger
        items={items}
        onSelect={onSelect}
        disabled={disabled}
        className={className}
      >
        {children}
      </ContextMenuTrigger>
    </ContextMenuProvider>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createMenuItem(
  id: string,
  label: string,
  options?: Partial<Omit<ContextMenuItem, 'id' | 'label'>>
): ContextMenuItem {
  return { id, label, type: 'item', ...options };
}

export function createSeparator(id: string): ContextMenuItem {
  return { id, type: 'separator' };
}

export function createLabel(id: string, label: string): ContextMenuItem {
  return { id, label, type: 'label' };
}

export function createCheckboxItem(
  id: string,
  label: string,
  checked: boolean,
  options?: Partial<Omit<ContextMenuItem, 'id' | 'label' | 'type' | 'checked'>>
): ContextMenuItem {
  return { id, label, type: 'checkbox', checked, ...options };
}

export function createRadioItem(
  id: string,
  label: string,
  value: string,
  options?: Partial<Omit<ContextMenuItem, 'id' | 'label' | 'type' | 'value'>>
): ContextMenuItem {
  return { id, label, type: 'radio', value, ...options };
}

export function createSubmenu(
  id: string,
  label: string,
  items: ContextMenuItem[],
  options?: Partial<Omit<ContextMenuItem, 'id' | 'label' | 'type' | 'items'>>
): ContextMenuItem {
  return { id, label, type: 'submenu', items, ...options };
}

export default ContextMenu;
