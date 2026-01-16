/**
 * RustPress Breadcrumbs Component
 * Shows hierarchical navigation path with quick jumps
 */

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  Palette,
  Package,
  Database,
  BarChart3,
  Tag,
  MessageSquare,
  Shield,
  Globe,
  Layout,
  Code,
  Zap,
  TrendingUp,
  Folder,
  Star,
} from 'lucide-react';
import { cn } from '../utils';
import { useNavigationStore } from '../../store/navigationStore';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from './Dropdown';

// Icon mapping for routes
const routeIcons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  posts: FileText,
  pages: Folder,
  media: Image,
  categories: Tag,
  tags: Tag,
  comments: MessageSquare,
  menus: Layout,
  themes: Palette,
  widgets: Layout,
  'theme-editor': Code,
  plugins: Package,
  add: Zap,
  users: Users,
  roles: Shield,
  analytics: BarChart3,
  seo: TrendingUp,
  settings: Settings,
  database: Database,
  api: Globe,
};

// Route labels
const routeLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  posts: 'Posts',
  pages: 'Pages',
  media: 'Media',
  categories: 'Categories',
  tags: 'Tags',
  comments: 'Comments',
  menus: 'Menus',
  themes: 'Themes',
  widgets: 'Widgets',
  'theme-editor': 'Theme Editor',
  plugins: 'Plugins',
  add: 'Add New',
  users: 'Users',
  roles: 'Roles',
  analytics: 'Analytics',
  seo: 'SEO',
  settings: 'Settings',
  database: 'Database',
  api: 'API',
  new: 'New',
  edit: 'Edit',
  profile: 'Profile',
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  showFavoriteToggle?: boolean;
  maxItems?: number;
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  showFavoriteToggle = true,
  maxItems = 4,
}: BreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useNavigationStore();

  // Generate breadcrumbs from current path if items not provided
  const breadcrumbs = useMemo(() => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const Icon = routeIcons[segment];

      crumbs.push({
        label,
        href: index < pathSegments.length - 1 ? currentPath : undefined,
        icon: Icon,
      });
    });

    return crumbs;
  }, [items, location.pathname]);

  // Current page info for favorites
  const currentPage = useMemo(() => {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    return {
      path: location.pathname,
      label: lastCrumb?.label || 'Page',
      icon: lastCrumb?.icon?.name,
    };
  }, [breadcrumbs, location.pathname]);

  const isCurrentFavorite = isFavorite(location.pathname);

  // Truncate breadcrumbs if too many
  const displayedBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length <= maxItems) return breadcrumbs;

    const first = breadcrumbs[0];
    const last = breadcrumbs.slice(-2);
    const middle = breadcrumbs.slice(1, -2);

    return [first, { label: '...', collapsed: middle } as any, ...last];
  }, [breadcrumbs, maxItems]);

  const handleNavigate = (href?: string) => {
    if (href) navigate(href);
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1', className)}
    >
      {/* Home button */}
      {showHome && (
        <>
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'p-1.5 rounded-lg',
              'text-neutral-400 dark:text-neutral-500',
              'hover:text-neutral-600 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </button>
          <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
        </>
      )}

      {/* Breadcrumb items */}
      <ol className="flex items-center gap-1">
        {displayedBreadcrumbs.map((crumb, index) => {
          const isLast = index === displayedBreadcrumbs.length - 1;
          const Icon = crumb.icon;
          const isCollapsed = (crumb as any).collapsed;

          return (
            <li key={index} className="flex items-center gap-1">
              {isCollapsed ? (
                // Collapsed items dropdown
                <Dropdown>
                  <DropdownTrigger asChild>
                    <button
                      className={cn(
                        'px-2 py-1 rounded-lg',
                        'text-sm text-neutral-400 dark:text-neutral-500',
                        'hover:text-neutral-600 dark:hover:text-neutral-300',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        'transition-colors'
                      )}
                    >
                      ...
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    {isCollapsed.map((item: BreadcrumbItem, i: number) => (
                      <DropdownItem
                        key={i}
                        icon={item.icon && <item.icon className="w-4 h-4" />}
                        onClick={() => handleNavigate(item.href)}
                      >
                        {item.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              ) : isLast ? (
                // Current page (not clickable)
                <span
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1',
                    'text-sm font-medium',
                    'text-neutral-900 dark:text-white'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 text-primary-500" />}
                  <span>{crumb.label}</span>
                </span>
              ) : (
                // Clickable breadcrumb
                <button
                  onClick={() => handleNavigate(crumb.href)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-lg',
                    'text-sm',
                    'text-neutral-500 dark:text-neutral-400',
                    'hover:text-neutral-700 dark:hover:text-neutral-200',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'transition-colors'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{crumb.label}</span>
                </button>
              )}

              {/* Separator */}
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Favorite toggle */}
      {showFavoriteToggle && (
        <motion.button
          onClick={() => toggleFavorite(currentPage)}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'ml-2 p-1.5 rounded-lg',
            'transition-colors',
            isCurrentFavorite
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-neutral-300 dark:text-neutral-600 hover:text-yellow-500'
          )}
          aria-label={isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className="w-4 h-4"
            fill={isCurrentFavorite ? 'currentColor' : 'none'}
          />
        </motion.button>
      )}
    </nav>
  );
}

export default Breadcrumbs;
