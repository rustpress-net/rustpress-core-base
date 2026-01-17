/**
 * RustPress Sidebar Component
 * Collapsible navigation sidebar with animations and search filter
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Menu, X, Search } from 'lucide-react';
import { cn } from '../utils';
import { slideInFromLeft, fadeIn, staggerContainer, staggerItem } from '../animations';
import { useNavigationStore } from '../../store/navigationStore';

// Sidebar Context
interface SidebarContextValue {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar components must be used within a SidebarProvider');
  }
  return context;
}

// Provider
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const collapse = useCallback(() => setIsCollapsed(true), []);
  const expand = useCallback(() => setIsCollapsed(false), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((prev) => !prev), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggle,
        collapse,
        expand,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Mobile trigger button
export function SidebarMobileTrigger({ className }: { className?: string }) {
  const { toggleMobile, isMobileOpen } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleMobile}
      className={cn(
        'lg:hidden p-2 rounded-lg',
        'text-neutral-600 dark:text-neutral-400',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'transition-colors duration-150',
        className
      )}
      aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
    >
      {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

// Main Sidebar component
export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  width?: number;
  collapsedWidth?: number;
}

export function Sidebar({
  children,
  className,
  width = 410,
  collapsedWidth = 72,
}: SidebarProps) {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-sidebar bg-black/50 lg:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? collapsedWidth : width,
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          // Base styles
          'fixed lg:relative z-sidebar',
          'h-screen flex flex-col',
          'bg-white dark:bg-neutral-950',
          'border-r border-neutral-200 dark:border-neutral-800',
          'transition-transform duration-200 lg:transition-none',

          // Mobile positioning
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',

          className
        )}
        style={{ width: isCollapsed ? collapsedWidth : width }}
      >
        {children}
      </motion.aside>
    </>
  );
}

// Sidebar Header
export interface SidebarHeaderProps {
  logo?: React.ReactNode;
  title?: string;
  className?: string;
}

export function SidebarHeader({ logo, title, className }: SidebarHeaderProps) {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'h-16 px-4',
        'border-b border-neutral-100 dark:border-neutral-800',
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {logo && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {logo}
          </div>
        )}
        <AnimatePresence>
          {!isCollapsed && title && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-lg text-neutral-900 dark:text-white truncate"
            >
              {title}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle - hidden on mobile */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'hidden lg:flex p-1.5 rounded-lg',
          'text-neutral-400 hover:text-neutral-600',
          'dark:hover:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors duration-150'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.div>
      </button>
    </div>
  );
}

// Sidebar Search Filter
export interface SidebarSearchProps {
  className?: string;
  placeholder?: string;
}

export function SidebarSearch({ className, placeholder = 'Search...' }: SidebarSearchProps) {
  const { isCollapsed } = useSidebar();
  const { sidebarSearchQuery, setSidebarSearchQuery } = useNavigationStore();

  if (isCollapsed) {
    return (
      <div className={cn('px-2 py-2', className)}>
        <button
          className={cn(
            'w-full p-2 rounded-lg',
            'text-neutral-400 hover:text-neutral-600',
            'dark:hover:text-neutral-300',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'transition-colors'
          )}
          onClick={() => {/* Could expand sidebar on click */}}
        >
          <Search className="w-5 h-5 mx-auto" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('px-3 py-2', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={sidebarSearchQuery}
          onChange={(e) => setSidebarSearchQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-9 pl-9 pr-3 rounded-lg',
            'text-sm',
            'bg-neutral-100 dark:bg-neutral-800',
            'text-neutral-900 dark:text-white',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'border border-transparent',
            'focus:outline-none focus:border-primary-500',
            'focus:ring-2 focus:ring-primary-500/20',
            'transition-all'
          )}
        />
        {sidebarSearchQuery && (
          <button
            onClick={() => setSidebarSearchQuery('')}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'p-1 rounded',
              'text-neutral-400 hover:text-neutral-600',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'transition-colors'
            )}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// Sidebar Content (scrollable)
export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        'py-4 px-3',
        // Hide scrollbars while maintaining scroll functionality
        '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        className
      )}
    >
      {children}
    </div>
  );
}

// Sidebar Footer
export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex-shrink-0',
        'px-3 py-4',
        'border-t border-neutral-100 dark:border-neutral-800',
        className
      )}
    >
      {children}
    </div>
  );
}

// Navigation group
export interface SidebarGroupProps {
  id?: string; // Used to persist collapse state
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function SidebarGroup({
  id,
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}: SidebarGroupProps) {
  const { isCollapsed: sidebarCollapsed } = useSidebar();
  const { isGroupCollapsed, toggleGroupCollapsed } = useNavigationStore();

  // Use persisted state if id is provided, otherwise use local state
  const [localIsOpen, setLocalIsOpen] = useState(defaultOpen);

  const groupId = id || title || 'default';
  const isPersisted = !!id;
  const isOpen = isPersisted ? !isGroupCollapsed(groupId) : localIsOpen;

  const handleToggle = () => {
    if (isPersisted) {
      toggleGroupCollapsed(groupId);
    } else {
      setLocalIsOpen(!localIsOpen);
    }
  };

  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <button
          type="button"
          onClick={collapsible ? handleToggle : undefined}
          disabled={!collapsible}
          className={cn(
            'w-full flex items-center justify-between',
            'px-3 mb-2',
            'text-xs font-semibold uppercase tracking-wider',
            'text-neutral-400 dark:text-neutral-500',
            collapsible && 'cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {title}
              </motion.span>
            )}
          </AnimatePresence>
          {collapsible && !sidebarCollapsed && (
            <motion.div
              animate={{ rotate: isOpen ? 0 : -90 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </button>
      )}
      <AnimatePresence>
        {(!collapsible || isOpen) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Navigation item
export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SidebarItem({
  icon,
  label,
  href,
  onClick,
  isActive = false,
  badge,
  children,
  className,
}: SidebarItemProps) {
  const { isCollapsed, closeMobile } = useSidebar();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const hasSubMenu = !!children;

  const handleClick = () => {
    if (hasSubMenu) {
      setIsSubMenuOpen(!isSubMenuOpen);
    } else {
      onClick?.();
      closeMobile();
    }
  };

  const isLink = href && !hasSubMenu;

  const itemClasses = cn(
    'w-full flex items-center gap-3',
    'px-3 py-2.5 rounded-xl',
    'text-sm font-medium',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',

    // Active state
    isActive
      ? [
          'bg-primary-50 dark:bg-primary-900/30',
          'text-primary-700 dark:text-primary-300',
        ]
      : [
          'text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'hover:text-neutral-900 dark:hover:text-white',
        ],

    isCollapsed && 'justify-center px-2',
    className
  );

  const itemContent = (
    <>
      {icon && (
        <span
          className={cn(
            'flex-shrink-0 w-5 h-5',
            isActive && 'text-primary-600 dark:text-primary-400'
          )}
        >
          {icon}
        </span>
      )}

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 text-left truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {!isCollapsed && badge && (
        <span className="flex-shrink-0">{badge}</span>
      )}

      {!isCollapsed && hasSubMenu && (
        <motion.div
          animate={{ rotate: isSubMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </motion.div>
      )}
    </>
  );

  return (
    <div>
      {isLink ? (
        <Link
          to={href}
          onClick={handleClick}
          className={itemClasses}
        >
          {itemContent}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={itemClasses}
        >
          {itemContent}
        </button>
      )}

      {/* Submenu */}
      {hasSubMenu && !isCollapsed && (
        <AnimatePresence>
          {isSubMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-8 mt-1 space-y-1">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Sidebar divider
export function SidebarDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'my-4 h-px',
        'bg-neutral-200 dark:bg-neutral-800',
        className
      )}
    />
  );
}


export default Sidebar;
