/**
 * PinnableSidebar Component
 *
 * Collapsible pinnable sidebars:
 * - Pin/unpin functionality
 * - Hover to expand (when unpinned)
 * - Smooth animations
 * - Icon-only collapsed state
 * - Persist state to localStorage
 */

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  isActive?: boolean;
  children?: SidebarItem[];
}

export interface PinnableSidebarProps {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  expandedWidth?: number;
  collapsedWidth?: number;
  defaultPinned?: boolean;
  defaultExpanded?: boolean;
  persistKey?: string;
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface SidebarContextValue {
  isExpanded: boolean;
  isPinned: boolean;
  position: 'left' | 'right';
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within PinnableSidebar');
  }
  return context;
}

// ============================================================================
// Sidebar Item Component
// ============================================================================

interface SidebarItemComponentProps {
  item: SidebarItem;
  depth?: number;
  onItemClick?: (item: SidebarItem) => void;
}

function SidebarItemComponent({
  item,
  depth = 0,
  onItemClick,
}: SidebarItemComponentProps) {
  const { isExpanded, position } = useSidebar();
  const [isChildrenOpen, setIsChildrenOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsChildrenOpen(!isChildrenOpen);
    } else {
      item.onClick?.();
      onItemClick?.(item);
    }
  };

  const Component = item.href && !hasChildren ? 'a' : 'button';

  return (
    <div>
      <Component
        href={item.href}
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
          'transition-colors',
          item.isActive
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
          depth > 0 && 'ml-4'
        )}
        title={!isExpanded ? item.label : undefined}
      >
        <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>

        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 text-sm font-medium truncate text-left"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {isExpanded && item.badge !== undefined && (
          <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 rounded">
            {item.badge}
          </span>
        )}

        {isExpanded && hasChildren && (
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isChildrenOpen && 'rotate-90'
            )}
          />
        )}
      </Component>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && isChildrenOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {item.children!.map((child) => (
              <SidebarItemComponent
                key={child.id}
                item={child}
                depth={depth + 1}
                onItemClick={onItemClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PinnableSidebar({
  items,
  header,
  footer,
  position = 'left',
  expandedWidth = 260,
  collapsedWidth = 64,
  defaultPinned = true,
  defaultExpanded = true,
  persistKey,
  onItemClick,
  className,
}: PinnableSidebarProps) {
  // Load persisted state
  const [isPinned, setIsPinned] = useState(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`sidebar-pinned-${persistKey}`);
      if (saved !== null) return saved === 'true';
    }
    return defaultPinned;
  });

  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  // Persist pinned state
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(`sidebar-pinned-${persistKey}`, isPinned.toString());
    }
  }, [isPinned, persistKey]);

  const togglePin = useCallback(() => {
    setIsPinned(!isPinned);
  }, [isPinned]);

  return (
    <SidebarContext.Provider value={{ isExpanded, isPinned, position }}>
      <motion.aside
        animate={{ width: isExpanded ? expandedWidth : collapsedWidth }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        className={cn(
          'flex flex-col h-full',
          'bg-white dark:bg-neutral-900',
          'border-neutral-200 dark:border-neutral-700',
          position === 'left' ? 'border-r' : 'border-l',
          className
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-3">
          <div className="flex items-center justify-between">
            {isExpanded ? (
              <div className="flex-1">{header}</div>
            ) : (
              <div className="w-full flex justify-center">
                <Menu className="w-5 h-5 text-neutral-400" />
              </div>
            )}

            {isExpanded && (
              <button
                onClick={togglePin}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isPinned
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              >
                {isPinned ? (
                  <Pin className="w-4 h-4" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-3 border-t border-neutral-200 dark:border-neutral-700">
            {isExpanded ? footer : null}
          </div>
        )}
      </motion.aside>
    </SidebarContext.Provider>
  );
}

// ============================================================================
// Mobile Sidebar with Overlay
// ============================================================================

export interface MobileSidebarProps {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: number;
  onItemClick?: (item: SidebarItem) => void;
}

export function MobileSidebar({
  items,
  header,
  footer,
  isOpen,
  onClose,
  position = 'left',
  width = 280,
  onItemClick,
}: MobileSidebarProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: position === 'left' ? -width : width }}
            animate={{ x: 0 }}
            exit={{ x: position === 'left' ? -width : width }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ width }}
            className={cn(
              'fixed top-0 bottom-0 z-50',
              'flex flex-col',
              'bg-white dark:bg-neutral-900',
              position === 'left' ? 'left-0' : 'right-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex-1">{header}</div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <SidebarContext.Provider value={{ isExpanded: true, isPinned: true, position }}>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {items.map((item) => (
                  <SidebarItemComponent
                    key={item.id}
                    item={item}
                    onItemClick={(clickedItem) => {
                      onItemClick?.(clickedItem);
                      if (!clickedItem.children?.length) {
                        onClose();
                      }
                    }}
                  />
                ))}
              </nav>
            </SidebarContext.Provider>

            {/* Footer */}
            {footer && (
              <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Sidebar Toggle Button
// ============================================================================

export interface SidebarToggleProps {
  isOpen?: boolean;
  onClick: () => void;
  className?: string;
}

export function SidebarToggle({ isOpen, onClick, className }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        className
      )}
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
}

// ============================================================================
// Dual Sidebar Layout
// ============================================================================

export interface DualSidebarLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  leftWidth?: number;
  rightWidth?: number;
  className?: string;
}

export function DualSidebarLayout({
  leftSidebar,
  rightSidebar,
  children,
  leftWidth = 64,
  rightWidth = 300,
  className,
}: DualSidebarLayoutProps) {
  return (
    <div className={cn('flex h-full', className)}>
      {/* Left Sidebar */}
      {leftSidebar && (
        <div
          style={{ width: leftWidth }}
          className="flex-shrink-0 h-full border-r border-neutral-200 dark:border-neutral-700"
        >
          {leftSidebar}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 h-full overflow-hidden">{children}</div>

      {/* Right Sidebar */}
      {rightSidebar && (
        <div
          style={{ width: rightWidth }}
          className="flex-shrink-0 h-full border-l border-neutral-200 dark:border-neutral-700"
        >
          {rightSidebar}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icon Sidebar (Minimal)
// ============================================================================

export interface IconSidebarProps {
  items: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
    badge?: number;
  }>;
  position?: 'left' | 'right';
  className?: string;
}

export function IconSidebar({ items, position = 'left', className }: IconSidebarProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center py-4 gap-2',
        'bg-white dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-700',
        position === 'left' ? 'border-r' : 'border-l',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          title={item.label}
          className={cn(
            'relative p-2.5 rounded-xl transition-colors',
            item.isActive
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200'
          )}
        >
          {item.icon}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default PinnableSidebar;
