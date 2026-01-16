/**
 * RustPress Favorites Component
 * Let users pin frequently used sections
 */

import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star,
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
  X,
  GripVertical,
  Plus,
} from 'lucide-react';
import { cn } from '../utils';
import { useNavigationStore, NavigationPage } from '../../store/navigationStore';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
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
};

// Suggested pages to add as favorites
const suggestedPages: NavigationPage[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/posts', label: 'Posts', icon: 'FileText' },
  { path: '/media', label: 'Media', icon: 'Image' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
];

export interface FavoritesProps {
  className?: string;
  variant?: 'dropdown' | 'inline';
}

export function Favorites({
  className,
  variant = 'dropdown',
}: FavoritesProps) {
  const navigate = useNavigate();
  const { favorites, removeFavorite, addFavorite, isFavorite } = useNavigationStore();

  const getIcon = (iconName?: string) => {
    if (!iconName) return Star;
    return iconMap[iconName] || Star;
  };

  const availableSuggestions = suggestedPages.filter(
    (page) => !isFavorite(page.path)
  );

  // Inline variant (horizontal bar)
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <AnimatePresence mode="popLayout">
          {favorites.map((page) => {
            const Icon = getIcon(page.icon);
            return (
              <motion.button
                key={page.path}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => navigate(page.path)}
                className={cn(
                  'group relative flex items-center gap-1.5',
                  'px-2.5 py-1.5 rounded-lg',
                  'text-sm',
                  'text-neutral-600 dark:text-neutral-300',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'transition-colors'
                )}
                title={page.label}
              >
                <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline max-w-[100px] truncate">
                  {page.label}
                </span>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(page.path);
                  }}
                  className={cn(
                    'absolute -top-1 -right-1',
                    'w-4 h-4 rounded-full',
                    'flex items-center justify-center',
                    'bg-neutral-200 dark:bg-neutral-700',
                    'text-neutral-500 dark:text-neutral-400',
                    'opacity-0 group-hover:opacity-100',
                    'hover:bg-error-500 hover:text-white',
                    'transition-all'
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {favorites.length === 0 && (
          <span className="text-sm text-neutral-400 dark:text-neutral-500 italic">
            No favorites yet
          </span>
        )}
      </div>
    );
  }

  // Dropdown variant
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2',
            'px-3 py-2 rounded-xl',
            'text-sm font-medium',
            'text-neutral-600 dark:text-neutral-300',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'hover:text-neutral-900 dark:hover:text-white',
            'transition-colors duration-150',
            className
          )}
        >
          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
          <span className="hidden md:inline">Favorites</span>
          {favorites.length > 0 && (
            <span className="hidden sm:flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              {favorites.length}
            </span>
          )}
        </button>
      </DropdownTrigger>

      <DropdownMenu align="start" className="w-72">
        <DropdownLabel>Favorites</DropdownLabel>
        <DropdownSeparator />

        {favorites.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No favorites yet
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Star pages to add them here
            </p>
          </div>
        ) : (
          <div className="max-h-[200px] overflow-y-auto">
            {favorites.map((page) => {
              const Icon = getIcon(page.icon);
              return (
                <div
                  key={page.path}
                  className="group flex items-center"
                >
                  <DropdownItem
                    icon={<Icon className="w-4 h-4" />}
                    onClick={() => navigate(page.path)}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate">{page.label}</span>
                      <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    </div>
                  </DropdownItem>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(page.path);
                    }}
                    className={cn(
                      'mr-2 p-1 rounded',
                      'text-neutral-400 hover:text-error-500',
                      'opacity-0 group-hover:opacity-100',
                      'transition-all'
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggestions */}
        {availableSuggestions.length > 0 && (
          <>
            <DropdownSeparator />
            <DropdownLabel>Suggestions</DropdownLabel>
            {availableSuggestions.slice(0, 3).map((page) => {
              const Icon = getIcon(page.icon);
              return (
                <DropdownItem
                  key={page.path}
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => addFavorite(page)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <span>{page.label}</span>
                  </div>
                </DropdownItem>
              );
            })}
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

export default Favorites;
