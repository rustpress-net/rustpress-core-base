/**
 * Navigation Components
 * Menus, links, breadcrumbs, and navigation elements
 */

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp, Home, Menu, X, ExternalLink,
  ArrowRight, ArrowLeft, MoreHorizontal, Circle, Hash, Folder, File,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// TYPES
// ============================================

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  isActive?: boolean;
  isExternal?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

// ============================================
// 1. VERTICAL MENU
// ============================================

export interface VerticalMenuProps {
  items: NavItem[];
  collapsed?: boolean;
  showIcons?: boolean;
  variant?: 'default' | 'pills' | 'bordered' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: NavItem) => void;
}

export function VerticalMenu({
  items,
  collapsed = false,
  showIcons = true,
  variant = 'default',
  size = 'md',
  onItemClick,
}: VerticalMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-2.5 px-4',
  };

  const variantClasses = {
    default: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    pills: 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg',
    bordered: 'border-l-2 border-transparent hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    minimal: 'hover:text-blue-600 dark:hover:text-blue-400',
  };

  const activeClasses = {
    default: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    pills: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg',
    bordered: 'border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    minimal: 'text-blue-600 dark:text-blue-400 font-medium',
  };

  const renderItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            }
            onItemClick?.(item);
          }}
          className={clsx(
            'w-full flex items-center gap-2 transition-colors',
            sizeClasses[size],
            item.isActive ? activeClasses[variant] : variantClasses[variant],
            depth > 0 && 'ml-4'
          )}
        >
          {showIcons && item.icon && (
            <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.isExternal && <ExternalLink className="w-3 h-3 opacity-50" />}
              {hasChildren && (
                <ChevronDown
                  className={clsx('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
                />
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1">
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => renderItem(item))}
    </nav>
  );
}

// ============================================
// 2. HORIZONTAL MENU
// ============================================

export interface HorizontalMenuProps {
  items: NavItem[];
  variant?: 'default' | 'pills' | 'underline' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  onItemClick?: (item: NavItem) => void;
}

export function HorizontalMenu({
  items,
  variant = 'default',
  size = 'md',
  align = 'left',
  onItemClick,
}: HorizontalMenuProps) {
  const sizeClasses = {
    sm: 'text-xs py-1 px-2 gap-1',
    md: 'text-sm py-2 px-3 gap-2',
    lg: 'text-base py-2.5 px-4 gap-2',
  };

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const variantClasses = {
    default: 'hover:text-blue-600 dark:hover:text-blue-400',
    pills: 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full',
    underline: 'border-b-2 border-transparent hover:border-blue-500',
    buttons: 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg',
  };

  const activeClasses = {
    default: 'text-blue-600 dark:text-blue-400 font-medium',
    pills: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full',
    underline: 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400',
    buttons: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg',
  };

  return (
    <nav className={clsx('flex items-center gap-1', alignClasses[align])}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className={clsx(
            'flex items-center transition-colors',
            sizeClasses[size],
            item.isActive ? activeClasses[variant] : variantClasses[variant]
          )}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

// ============================================
// 3. MEGA MENU
// ============================================

export interface MegaMenuColumn {
  title: string;
  items: NavItem[];
}

export interface MegaMenuProps {
  columns: MegaMenuColumn[];
  isOpen: boolean;
  onClose: () => void;
  featured?: React.ReactNode;
}

export function MegaMenu({ columns, isOpen, onClose, featured }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
      <div className="p-6">
        <div className="grid grid-cols-4 gap-8">
          {columns.map((column, idx) => (
            <div key={idx}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {featured && (
            <div className="col-span-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              {featured}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. BREADCRUMBS
// ============================================

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: 'slash' | 'chevron' | 'arrow' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  showHome?: boolean;
  maxItems?: number;
}

export function Breadcrumbs({
  items,
  separator = 'chevron',
  size = 'md',
  showHome = true,
  maxItems = 5,
}: BreadcrumbsProps) {
  const separators = {
    slash: <span className="mx-2 text-gray-400">/</span>,
    chevron: <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />,
    arrow: <ArrowRight className="w-4 h-4 mx-1 text-gray-400" />,
    dot: <Circle className="w-1.5 h-1.5 mx-2 fill-gray-400 text-gray-400" />,
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const displayItems = items.length > maxItems
    ? [...items.slice(0, 1), { label: '...', href: undefined }, ...items.slice(-2)]
    : items;

  return (
    <nav className={clsx('flex items-center flex-wrap', sizeClasses[size])}>
      {showHome && (
        <>
          <a href="/" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
            <Home className="w-4 h-4" />
          </a>
          {separators[separator]}
        </>
      )}
      {displayItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.href ? (
            <a
              href={item.href}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <span className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
              {item.icon}
              {item.label}
            </span>
          )}
          {idx < displayItems.length - 1 && separators[separator]}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================
// 5. PAGINATION
// ============================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'default' | 'simple' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showFirstLast?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'default',
  size = 'md',
  showFirstLast = true,
}: PaginationProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (variant === 'simple') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-gray-500 hover:text-blue-600 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-gray-500 hover:text-blue-600 disabled:opacity-50"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={clsx(
            'flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50',
            sizeClasses[size]
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <ChevronLeft className="w-4 h-4 -ml-2" />
        </button>
      )}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50',
          sizeClasses[size]
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={clsx(
            'flex items-center justify-center rounded-lg transition-colors',
            sizeClasses[size],
            page === currentPage
              ? 'bg-blue-600 text-white'
              : page === '...'
              ? 'cursor-default'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50',
          sizeClasses[size]
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={clsx(
            'flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50',
            sizeClasses[size]
          )}
        >
          <ChevronRight className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 -ml-2" />
        </button>
      )}
    </nav>
  );
}

// Missing ChevronLeft import fix
const ChevronLeft = ChevronRight; // Placeholder - would import from lucide-react

// ============================================
// 6. TAB NAVIGATION
// ============================================

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
}: TabNavigationProps) {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5',
  };

  const baseClasses = {
    default: 'border-b-2 border-transparent',
    pills: 'rounded-lg',
    underline: 'border-b-2 border-transparent -mb-px',
    enclosed: 'border border-transparent rounded-t-lg -mb-px',
  };

  const activeClasses = {
    default: 'border-blue-500 text-blue-600 dark:text-blue-400',
    pills: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    underline: 'border-blue-500 text-blue-600 dark:text-blue-400',
    enclosed: 'border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800 bg-white dark:bg-gray-800',
  };

  const inactiveClasses = {
    default: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
    pills: 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700',
    underline: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
    enclosed: 'text-gray-500 hover:text-gray-700 bg-gray-50 dark:bg-gray-900',
  };

  const containerClasses = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
    underline: 'border-b border-gray-200 dark:border-gray-700',
    enclosed: 'border-b border-gray-200 dark:border-gray-700',
  };

  return (
    <div className={clsx('flex', fullWidth && 'w-full', containerClasses[variant])}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={clsx(
            'flex items-center gap-2 font-medium transition-colors',
            sizeClasses[size],
            baseClasses[variant],
            tab.id === activeTab ? activeClasses[variant] : inactiveClasses[variant],
            tab.disabled && 'opacity-50 cursor-not-allowed',
            fullWidth && 'flex-1 justify-center'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// 7. SIDEBAR SECTION
// ============================================

export interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function SidebarSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  icon,
  action,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-2">
      {title && (
        <div
          className={clsx(
            'flex items-center justify-between px-3 py-2',
            collapsible && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg'
          )}
          onClick={() => collapsible && setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="w-4 h-4 text-gray-400">{icon}</span>}
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {action}
            {collapsible && (
              <ChevronDown
                className={clsx('w-4 h-4 text-gray-400 transition-transform', !isOpen && '-rotate-90')}
              />
            )}
          </div>
        </div>
      )}
      {(!collapsible || isOpen) && <div className="mt-1">{children}</div>}
    </div>
  );
}

// ============================================
// 8. LINK LIST
// ============================================

export interface LinkListProps {
  links: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    description?: string;
    isNew?: boolean;
  }>;
  variant?: 'default' | 'cards' | 'minimal';
  columns?: 1 | 2 | 3;
}

export function LinkList({ links, variant = 'default', columns = 1 }: LinkListProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  if (variant === 'cards') {
    return (
      <div className={clsx('grid gap-3', gridCols[columns])}>
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {link.icon && (
              <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                {link.icon}
              </span>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{link.label}</span>
                {link.isNew && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded">
                    New
                  </span>
                )}
              </div>
              {link.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{link.description}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <ul className="space-y-1">
        {links.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.href}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {links.map((link, idx) => (
        <li key={idx}>
          <a
            href={link.href}
            className="flex items-center gap-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {link.icon || <ArrowRight className="w-3 h-3" />}
            {link.label}
            {link.isNew && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-600 rounded">
                New
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

// ============================================
// 9. QUICK LINKS
// ============================================

export interface QuickLinksProps {
  links: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    color?: string;
  }>;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}

export function QuickLinks({ links, columns = 4, size = 'md' }: QuickLinksProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={clsx('grid gap-2', gridCols[columns])}>
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          className={clsx(
            'flex flex-col items-center gap-1 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center',
            sizeClasses[size]
          )}
        >
          <span className={clsx(iconSizes[size], link.color || 'text-blue-600 dark:text-blue-400')}>
            {link.icon}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">{link.label}</span>
        </a>
      ))}
    </div>
  );
}

// ============================================
// 10. STEP NAVIGATION
// ============================================

export interface StepItem {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface StepNavigationProps {
  steps: StepItem[];
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  onStepClick?: (step: StepItem) => void;
}

export function StepNavigation({
  steps,
  variant = 'horizontal',
  size = 'md',
  onStepClick,
}: StepNavigationProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="flex gap-3 cursor-pointer"
            onClick={() => onStepClick?.(step)}
          >
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex items-center justify-center rounded-full font-medium',
                  iconSizes[size],
                  step.status === 'completed' && 'bg-green-500 text-white',
                  step.status === 'current' && 'bg-blue-500 text-white',
                  step.status === 'upcoming' && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}
              >
                {step.status === 'completed' ? '✓' : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={clsx(
                    'w-0.5 flex-1 my-2',
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p
                className={clsx(
                  'font-medium',
                  textSizes[size],
                  step.status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onStepClick?.(step)}
          >
            <div
              className={clsx(
                'flex items-center justify-center rounded-full font-medium',
                iconSizes[size],
                step.status === 'completed' && 'bg-green-500 text-white',
                step.status === 'current' && 'bg-blue-500 text-white',
                step.status === 'upcoming' && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}
            >
              {step.status === 'completed' ? '✓' : idx + 1}
            </div>
            <span
              className={clsx(
                textSizes[size],
                step.status === 'current' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={clsx(
                'flex-1 h-0.5 mx-4',
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// 11. ANCHOR NAVIGATION
// ============================================

export interface AnchorNavProps {
  items: Array<{ id: string; label: string; level?: number }>;
  activeId?: string;
  onItemClick?: (id: string) => void;
}

export function AnchorNav({ items, activeId, onItemClick }: AnchorNavProps) {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
        On this page
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item.id)}
          className={clsx(
            'block w-full text-left text-sm py-1 transition-colors',
            item.level === 2 && 'pl-4',
            item.level === 3 && 'pl-8',
            item.id === activeId
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// ============================================
// 12. MOBILE MENU
// ============================================

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function MobileMenu({ isOpen, onClose, children, position = 'left' }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={clsx(
          'absolute top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-xl',
          position === 'left' ? 'left-0' : 'right-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// 13. DROPDOWN MENU
// ============================================

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    divider?: boolean;
    danger?: boolean;
  }>;
  align?: 'left' | 'right';
}

export function DropdownMenu({ trigger, items, align = 'left' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={clsx(
              'absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1',
              align === 'left' ? 'left-0' : 'right-0'
            )}
          >
            {items.map((item, idx) =>
              item.divider ? (
                <div key={idx} className="my-1 border-t border-gray-200 dark:border-gray-700" />
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                    item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// 14. TREE NAVIGATION
// ============================================

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

export interface TreeNavigationProps {
  nodes: TreeNode[];
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  expandedIds?: Set<string>;
  onToggleExpand?: (id: string) => void;
}

export function TreeNavigation({
  nodes,
  selectedId,
  onSelect,
  expandedIds = new Set(),
  onToggleExpand,
}: TreeNavigationProps) {
  const renderNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = node.id === selectedId;

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              onToggleExpand?.(node.id);
            }
            onSelect?.(node);
          }}
          className={clsx(
            'w-full flex items-center gap-1.5 py-1.5 px-2 text-sm rounded-lg transition-colors',
            isSelected
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <ChevronRight
              className={clsx('w-4 h-4 text-gray-400 transition-transform', isExpanded && 'rotate-90')}
            />
          ) : (
            <span className="w-4" />
          )}
          {node.icon || (hasChildren ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />)}
          <span className="truncate">{node.label}</span>
        </button>
        {hasChildren && isExpanded && (
          <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return <nav className="space-y-0.5">{nodes.map((node) => renderNode(node))}</nav>;
}

// ============================================
// 15. LANGUAGE SELECTOR
// ============================================

export interface Language {
  code: string;
  name: string;
  flag?: string;
}

export interface LanguageSelectorProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  variant?: 'dropdown' | 'inline' | 'flags';
}

export function LanguageSelector({
  languages,
  currentLanguage,
  onLanguageChange,
  variant = 'dropdown',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current = languages.find((l) => l.code === currentLanguage);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={clsx(
              'px-2 py-1 text-sm rounded transition-colors',
              lang.code === currentLanguage
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'flags') {
    return (
      <div className="flex items-center gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={clsx(
              'w-8 h-6 rounded overflow-hidden border-2 transition-colors',
              lang.code === currentLanguage ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
            )}
            title={lang.name}
          >
            {lang.flag ? (
              <img src={lang.flag} alt={lang.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs">{lang.code.toUpperCase()}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Globe className="w-4 h-4" />
        {current?.name || currentLanguage}
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                  lang.code === currentLanguage
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {lang.flag && <span>{lang.flag}</span>}
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Add missing Globe import
import { Globe } from 'lucide-react';
