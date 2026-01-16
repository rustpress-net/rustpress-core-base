/**
 * RustPress Command Palette Component
 * Global search with fuzzy matching for pages, posts, settings, plugins
 * Triggered by Cmd+K / Ctrl+K
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  Palette,
  Package,
  Database,
  BarChart3,
  Plus,
  ArrowRight,
  Clock,
  Star,
  Hash,
  Folder,
  Globe,
  Shield,
  MessageSquare,
  Tag,
  Layout,
  Code,
  Zap,
  TrendingUp,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '../utils';
import { useNavigationStore } from '../../store/navigationStore';

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
  Plus,
  Clock,
  Star,
  Hash,
  Folder,
  Globe,
  Shield,
  MessageSquare,
  Tag,
  Layout,
  Code,
  Zap,
  TrendingUp,
};

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href?: string;
  action?: () => void;
  category: 'navigation' | 'actions' | 'recent' | 'favorites' | 'search';
  keywords?: string[];
}

// Default navigation items
const defaultNavigationItems: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard', category: 'navigation', keywords: ['home', 'overview'] },
  { id: 'posts', label: 'Posts', icon: 'FileText', href: '/posts', category: 'navigation', keywords: ['articles', 'blog', 'content'] },
  { id: 'pages', label: 'Pages', icon: 'Folder', href: '/pages', category: 'navigation', keywords: ['static', 'content'] },
  { id: 'media', label: 'Media Library', icon: 'Image', href: '/media', category: 'navigation', keywords: ['images', 'files', 'uploads'] },
  { id: 'categories', label: 'Categories', icon: 'Tag', href: '/categories', category: 'navigation', keywords: ['taxonomy'] },
  { id: 'tags', label: 'Tags', icon: 'Hash', href: '/tags', category: 'navigation', keywords: ['taxonomy'] },
  { id: 'comments', label: 'Comments', icon: 'MessageSquare', href: '/comments', category: 'navigation', keywords: ['discussion'] },
  { id: 'menus', label: 'Menus', icon: 'Layout', href: '/menus', category: 'navigation', keywords: ['navigation'] },
  { id: 'themes', label: 'Themes', icon: 'Palette', href: '/themes', category: 'navigation', keywords: ['appearance', 'design'] },
  { id: 'widgets', label: 'Widgets', icon: 'Layout', href: '/widgets', category: 'navigation', keywords: ['sidebar'] },
  { id: 'plugins', label: 'Plugins', icon: 'Package', href: '/plugins', category: 'navigation', keywords: ['extensions', 'addons'] },
  { id: 'users', label: 'Users', icon: 'Users', href: '/users', category: 'navigation', keywords: ['members', 'accounts'] },
  { id: 'roles', label: 'Roles & Permissions', icon: 'Shield', href: '/roles', category: 'navigation', keywords: ['security'] },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', href: '/analytics', category: 'navigation', keywords: ['stats', 'metrics'] },
  { id: 'seo', label: 'SEO', icon: 'TrendingUp', href: '/seo', category: 'navigation', keywords: ['search', 'optimization'] },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings', category: 'navigation', keywords: ['config', 'options'] },
  { id: 'database', label: 'Database', icon: 'Database', href: '/database', category: 'navigation', keywords: ['data', 'backup'] },
  { id: 'api', label: 'API', icon: 'Globe', href: '/api', category: 'navigation', keywords: ['rest', 'endpoints'] },
];

const defaultActionItems: CommandItem[] = [
  { id: 'new-post', label: 'Create New Post', description: 'Start writing a new blog post', icon: 'Plus', category: 'actions', keywords: ['add', 'write'] },
  { id: 'new-page', label: 'Create New Page', description: 'Create a new static page', icon: 'Plus', category: 'actions', keywords: ['add'] },
  { id: 'upload-media', label: 'Upload Media', description: 'Upload images or files', icon: 'Image', category: 'actions', keywords: ['add', 'import'] },
  { id: 'new-user', label: 'Add New User', description: 'Invite a new team member', icon: 'Users', category: 'actions', keywords: ['invite'] },
  { id: 'install-plugin', label: 'Install Plugin', description: 'Browse and install plugins', icon: 'Package', category: 'actions', keywords: ['add', 'extension'] },
];

// Simple fuzzy search
function fuzzyMatch(query: string, text: string): boolean {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerText.includes(lowerQuery)) return true;

  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
}

function searchItems(items: CommandItem[], query: string): CommandItem[] {
  if (!query.trim()) return items;

  return items.filter((item) => {
    const searchText = [
      item.label,
      item.description,
      ...(item.keywords || []),
    ].filter(Boolean).join(' ');

    return fuzzyMatch(query, searchText);
  });
}

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  additionalItems?: CommandItem[];
}

export function CommandPalette({ isOpen: controlledIsOpen, onClose, additionalItems = [] }: CommandPaletteProps) {
  const navigate = useNavigate();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    recentlyVisited,
    favorites,
  } = useNavigationStore();

  const isOpen = controlledIsOpen ?? isCommandPaletteOpen;
  const handleClose = onClose ?? closeCommandPalette;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build all items
  const allItems = useMemo(() => {
    const recentItems: CommandItem[] = recentlyVisited.slice(0, 5).map((page) => ({
      id: `recent-${page.path}`,
      label: page.label,
      icon: page.icon || 'Clock',
      href: page.path,
      category: 'recent' as const,
    }));

    const favoriteItems: CommandItem[] = favorites.map((page) => ({
      id: `fav-${page.path}`,
      label: page.label,
      icon: page.icon || 'Star',
      href: page.path,
      category: 'favorites' as const,
    }));

    return [
      ...recentItems,
      ...favoriteItems,
      ...defaultNavigationItems,
      ...defaultActionItems,
      ...additionalItems,
    ];
  }, [recentlyVisited, favorites, additionalItems]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    return searchItems(allItems, query);
  }, [allItems, query]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const order = ['recent', 'favorites', 'actions', 'navigation', 'search'];
    const items: CommandItem[] = [];
    order.forEach((cat) => {
      if (groupedItems[cat]) {
        items.push(...groupedItems[cat]);
      }
    });
    return items;
  }, [groupedItems]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatItems[selectedIndex]) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, flatItems]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          const selectedItem = flatItems[selectedIndex];
          if (selectedItem) {
            handleItemSelect(selectedItem);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [flatItems, selectedIndex, handleClose]
  );

  // Handle item selection
  const handleItemSelect = useCallback(
    (item: CommandItem) => {
      handleClose();
      if (item.action) {
        item.action();
      } else if (item.href) {
        navigate(item.href);
      }
    },
    [navigate, handleClose]
  );

  // Get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return FileText;
    return iconMap[iconName] || FileText;
  };

  // Category labels
  const categoryLabels: Record<string, string> = {
    recent: 'Recently Visited',
    favorites: 'Favorites',
    navigation: 'Pages',
    actions: 'Quick Actions',
    search: 'Search Results',
  };

  // Category order
  const categoryOrder = ['recent', 'favorites', 'actions', 'navigation', 'search'];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-x-4 top-[15%] z-[101] mx-auto max-w-2xl"
          >
            <div
              className={cn(
                'overflow-hidden rounded-2xl',
                'bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-800',
                'shadow-2xl dark:shadow-neutral-950/50'
              )}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-neutral-200 dark:border-neutral-800">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, actions, settings..."
                  className={cn(
                    'flex-1 h-14 bg-transparent',
                    'text-base text-neutral-900 dark:text-white',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                    'focus:outline-none'
                  )}
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800">
                  <span>Esc</span>
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[400px] overflow-y-auto py-2"
              >
                {flatItems.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      No results found for "{query}"
                    </p>
                  </div>
                ) : (
                  <>
                    {categoryOrder.map((category) => {
                      const items = groupedItems[category];
                      if (!items || items.length === 0) return null;

                      return (
                        <div key={category} className="mb-2">
                          <div className="px-4 py-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                              {categoryLabels[category]}
                            </span>
                          </div>
                          {items.map((item) => {
                            const globalIndex = flatItems.findIndex((i) => i.id === item.id);
                            const isSelected = globalIndex === selectedIndex;
                            const Icon = getIcon(item.icon);

                            return (
                              <button
                                key={item.id}
                                data-index={globalIndex}
                                onClick={() => handleItemSelect(item)}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-2.5',
                                  'text-left transition-colors',
                                  isSelected
                                    ? 'bg-primary-50 dark:bg-primary-900/30'
                                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex-shrink-0 p-2 rounded-lg',
                                    isSelected
                                      ? 'bg-primary-100 dark:bg-primary-900/50'
                                      : 'bg-neutral-100 dark:bg-neutral-800'
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      'w-4 h-4',
                                      isSelected
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-neutral-500 dark:text-neutral-400'
                                    )}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      'text-sm font-medium truncate',
                                      isSelected
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-neutral-700 dark:text-neutral-200'
                                    )}
                                  >
                                    {item.label}
                                  </p>
                                  {item.description && (
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="flex-shrink-0 flex items-center gap-1 text-xs text-neutral-400">
                                    <CornerDownLeft className="w-3 h-3" />
                                    <span>Enter</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    <ArrowDown className="w-3 h-3" />
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="px-1 rounded bg-neutral-200 dark:bg-neutral-700">Esc</span>
                    <span>Close</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <Command className="w-3 h-3" />
                  <span>K to open</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default CommandPalette;
