/**
 * NavigationMenu Component
 *
 * Enterprise-grade navigation with mega menus:
 * - Multi-column dropdown menus
 * - Featured content sections
 * - Icons and descriptions
 * - Keyboard navigation
 * - Mobile responsive
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
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface NavMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  description?: string;
  external?: boolean;
  disabled?: boolean;
  badge?: string;
  featured?: boolean;
  items?: NavMenuItem[];
  columns?: NavMenuColumn[];
  featuredContent?: React.ReactNode;
}

export interface NavMenuColumn {
  id: string;
  title?: string;
  items: NavMenuItem[];
}

export interface NavigationMenuProps {
  items: NavMenuItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'underline' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemClick?: (item: NavMenuItem) => void;
}

// ============================================================================
// Context
// ============================================================================

interface NavigationMenuContextValue {
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  orientation: 'horizontal' | 'vertical';
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);

function useNavigationMenu() {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    throw new Error('useNavigationMenu must be used within NavigationMenu');
  }
  return context;
}

// ============================================================================
// Menu Item Component
// ============================================================================

interface MenuItemProps {
  item: NavMenuItem;
  variant: 'default' | 'underline' | 'pill';
  size: 'sm' | 'md' | 'lg';
  onItemClick?: (item: NavMenuItem) => void;
}

function MenuItem({ item, variant, size, onItemClick }: MenuItemProps) {
  const { openMenuId, setOpenMenuId, orientation } = useNavigationMenu();
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = openMenuId === item.id;
  const hasDropdown = item.items || item.columns || item.featuredContent;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasDropdown) {
      setOpenMenuId(item.id);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenuId(null);
      setIsHovered(false);
    }, 150);
  };

  const handleClick = () => {
    if (hasDropdown) {
      setOpenMenuId(isOpen ? null : item.id);
    } else if (item.href) {
      onItemClick?.(item);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    default: cn(
      'rounded-lg',
      isOpen || isHovered
        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
    ),
    underline: cn(
      'border-b-2',
      isOpen || isHovered
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600'
    ),
    pill: cn(
      'rounded-full',
      isOpen || isHovered
        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
    ),
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          'flex items-center gap-1.5 font-medium transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {item.icon && <span className="w-4 h-4">{item.icon}</span>}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
            {item.badge}
          </span>
        )}
        {hasDropdown && (
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
        {item.external && <ExternalLink className="w-3 h-3" />}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && hasDropdown && (
          <motion.div
            initial={{ opacity: 0, y: orientation === 'horizontal' ? -10 : 0, x: orientation === 'vertical' ? -10 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: orientation === 'horizontal' ? -10 : 0, x: orientation === 'vertical' ? -10 : 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50',
              orientation === 'horizontal' ? 'top-full left-0 pt-2' : 'top-0 left-full pl-2'
            )}
          >
            <div
              className={cn(
                'bg-white dark:bg-neutral-900 rounded-xl shadow-xl',
                'border border-neutral-200 dark:border-neutral-700',
                'overflow-hidden'
              )}
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            >
              {/* Multi-column layout */}
              {item.columns ? (
                <div className="flex p-4 gap-8">
                  {item.columns.map((column) => (
                    <div key={column.id} className="min-w-[200px]">
                      {column.title && (
                        <div className="px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          {column.title}
                        </div>
                      )}
                      <div className="space-y-1">
                        {column.items.map((subItem) => (
                          <DropdownItem key={subItem.id} item={subItem} onItemClick={onItemClick} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {item.featuredContent && (
                    <div className="min-w-[250px] pl-8 border-l border-neutral-200 dark:border-neutral-700">
                      {item.featuredContent}
                    </div>
                  )}
                </div>
              ) : item.items ? (
                <div className="py-2 min-w-[200px]">
                  {item.items.map((subItem) => (
                    <DropdownItem key={subItem.id} item={subItem} onItemClick={onItemClick} />
                  ))}
                </div>
              ) : item.featuredContent ? (
                <div className="p-4">{item.featuredContent}</div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Dropdown Item Component
// ============================================================================

interface DropdownItemProps {
  item: NavMenuItem;
  onItemClick?: (item: NavMenuItem) => void;
}

function DropdownItem({ item, onItemClick }: DropdownItemProps) {
  const [showSubmenu, setShowSubmenu] = useState(false);

  if (item.items) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setShowSubmenu(true)}
        onMouseLeave={() => setShowSubmenu(false)}
      >
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
            'text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'transition-colors'
          )}
        >
          {item.icon && <span className="w-5 h-5 text-neutral-500">{item.icon}</span>}
          <div className="flex-1">
            <div className="font-medium">{item.label}</div>
            {item.description && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {item.description}
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <AnimatePresence>
          {showSubmenu && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute top-0 left-full pl-2"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-2 min-w-[180px]">
                {item.items.map((subItem) => (
                  <DropdownItem key={subItem.id} item={subItem} onItemClick={onItemClick} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const Component = item.href ? 'a' : 'button';

  return (
    <Component
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      onClick={() => onItemClick?.(item)}
      disabled={item.disabled}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
        'text-neutral-700 dark:text-neutral-300',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'transition-colors',
        item.disabled && 'opacity-50 cursor-not-allowed',
        item.featured && 'bg-primary-50 dark:bg-primary-900/20'
      )}
    >
      {item.icon && <span className="w-5 h-5 text-neutral-500">{item.icon}</span>}
      <div className="flex-1">
        <div className="font-medium flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
              {item.badge}
            </span>
          )}
        </div>
        {item.description && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {item.description}
          </div>
        )}
      </div>
      {item.external && <ExternalLink className="w-3 h-3 text-neutral-400" />}
    </Component>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NavigationMenu({
  items,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className,
  onItemClick,
}: NavigationMenuProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <NavigationMenuContext.Provider value={{ openMenuId, setOpenMenuId, orientation }}>
      <nav
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row items-center gap-1' : 'flex-col gap-1',
          className
        )}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            variant={variant}
            size={size}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </NavigationMenuContext.Provider>
  );
}

// ============================================================================
// Mega Menu Component
// ============================================================================

export interface MegaMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function MegaMenu({ trigger, children, className }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute top-full left-0 pt-2 z-50',
              className
            )}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Breadcrumb Navigation
// ============================================================================

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  onItemClick?: (item: BreadcrumbItem) => void;
}

export function BreadcrumbNav({
  items,
  separator = <ChevronRight className="w-4 h-4 text-neutral-400" />,
  className,
  onItemClick,
}: BreadcrumbNavProps) {
  return (
    <nav className={cn('flex items-center gap-2', className)}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && separator}
          {item.href && index < items.length - 1 ? (
            <a
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                onItemClick?.(item);
              }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-white">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================================================
// Tab Navigation
// ============================================================================

export interface TabNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabNavProps {
  items: TabNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill' | 'boxed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function TabNav({
  items,
  activeId,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className,
}: TabNavProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div
      className={cn(
        'flex',
        variant === 'underline' && 'border-b border-neutral-200 dark:border-neutral-700',
        variant === 'boxed' && 'bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1',
        fullWidth && 'w-full',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            onClick={() => !item.disabled && onChange(item.id)}
            disabled={item.disabled}
            className={cn(
              'flex items-center justify-center gap-2 font-medium transition-colors',
              sizeClasses[size],
              fullWidth && 'flex-1',
              item.disabled && 'opacity-50 cursor-not-allowed',
              variant === 'underline' && cn(
                '-mb-px border-b-2',
                isActive
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
              ),
              variant === 'pill' && cn(
                'rounded-full',
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              ),
              variant === 'boxed' && cn(
                'rounded-md',
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              )
            )}
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs font-medium rounded',
                  isActive
                    ? 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default NavigationMenu;
