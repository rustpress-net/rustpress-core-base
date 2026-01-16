/**
 * RustPress Plugins MegaMenu Component
 * Top navigation megamenu for quick access to plugins
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Puzzle,
  ChevronDown,
  Users,
  BarChart3,
  Globe,
  ShoppingCart,
  Search,
  Mail,
  Zap,
  Box,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  Shield,
  Database,
  Image,
  FileText,
  MessageSquare,
  CreditCard,
  Layers,
  Palette,
} from 'lucide-react';
import { cn } from '../utils';
import { usePluginStore, InstalledPlugin } from '../../store/pluginStore';
import { Badge } from './Badge';

// Icon mapping for plugins
const iconMap: Record<string, React.ElementType> = {
  Users,
  BarChart: BarChart3,
  BarChart3,
  Globe,
  ShoppingCart,
  Search,
  Mail,
  Zap,
  Box,
  Settings,
  Shield,
  Database,
  Image,
  FileText,
  MessageSquare,
  CreditCard,
  Layers,
  Palette,
  Puzzle,
};

// Category configuration
const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  utility: { label: 'Utility', icon: Zap, color: 'text-blue-500' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-purple-500' },
  content: { label: 'Content', icon: FileText, color: 'text-green-500' },
  ecommerce: { label: 'E-Commerce', icon: ShoppingCart, color: 'text-orange-500' },
  seo: { label: 'SEO', icon: Search, color: 'text-cyan-500' },
  forms: { label: 'Forms', icon: MessageSquare, color: 'text-pink-500' },
  security: { label: 'Security', icon: Shield, color: 'text-red-500' },
  media: { label: 'Media', icon: Image, color: 'text-yellow-500' },
};

export interface PluginsMegaMenuProps {
  className?: string;
}

export function PluginsMegaMenu({ className }: PluginsMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { installedPlugins, getActivePlugins } = usePluginStore();
  const activePlugins = useMemo(() => getActivePlugins(), [installedPlugins]);

  // Group plugins by category
  const pluginsByCategory = useMemo(() => {
    const grouped: Record<string, InstalledPlugin[]> = {};
    activePlugins.forEach((plugin) => {
      const category = plugin.category || 'utility';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(plugin);
    });
    return grouped;
  }, [activePlugins]);

  const categories = Object.keys(pluginsByCategory);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  const handlePluginClick = useCallback(
    (plugin: InstalledPlugin) => {
      setIsOpen(false);
      if (plugin.menuHref) {
        navigate(plugin.menuHref);
      } else {
        navigate(`/plugins/${plugin.slug}`);
      }
    },
    [navigate]
  );

  const handleViewAll = useCallback(() => {
    setIsOpen(false);
    navigate('/plugins');
  }, [navigate]);

  const handleAddNew = useCallback(() => {
    setIsOpen(false);
    navigate('/plugins/add');
  }, [navigate]);

  const getPluginIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Puzzle;
    return IconComponent;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2',
          'px-3 py-2 rounded-xl',
          'text-sm font-medium',
          'text-neutral-600 dark:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'hover:text-neutral-900 dark:hover:text-white',
          'transition-colors duration-150',
          isOpen && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Puzzle className="w-4 h-4" />
        <span className="hidden md:inline">Plugins</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        {activePlugins.length > 0 && (
          <Badge variant="primary" size="xs" className="hidden sm:flex">
            {activePlugins.length}
          </Badge>
        )}
      </button>

      {/* Megamenu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'fixed top-16 left-0 right-0 mt-0',
              'lg:left-[280px]', // Account for sidebar width
              'max-h-[calc(100vh-5rem)]',
              'p-6 rounded-b-2xl lg:rounded-2xl lg:mt-2 lg:mr-4',
              'bg-white dark:bg-neutral-900',
              'border-x border-b lg:border border-neutral-200 dark:border-neutral-800',
              'shadow-2xl dark:shadow-neutral-950/50',
              'z-megamenu',
              'overflow-y-auto scrollbar-glow'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Plugins
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {activePlugins.length} active plugins
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddNew}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    'text-sm font-medium',
                    'text-primary-600 dark:text-primary-400',
                    'bg-primary-50 dark:bg-primary-900/20',
                    'hover:bg-primary-100 dark:hover:bg-primary-900/30',
                    'transition-colors'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
            </div>

            {/* Categories Grid */}
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {categories.map((category) => {
                  const config = categoryConfig[category] || {
                    label: category.charAt(0).toUpperCase() + category.slice(1),
                    icon: Puzzle,
                    color: 'text-neutral-500',
                  };
                  const CategoryIcon = config.icon;
                  const plugins = pluginsByCategory[category];

                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className={cn('w-4 h-4', config.color)} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          {config.label}
                        </span>
                        <span className="text-xs text-neutral-300 dark:text-neutral-600">
                          ({plugins.length})
                        </span>
                      </div>

                      {/* Plugin Items */}
                      <div className="space-y-1">
                        {plugins.map((plugin) => {
                          const PluginIcon = getPluginIcon(plugin.icon);
                          return (
                            <motion.button
                              key={plugin.id}
                              onClick={() => handlePluginClick(plugin)}
                              whileHover={{ x: 4 }}
                              className={cn(
                                'w-full flex items-center gap-3 p-2 rounded-lg',
                                'text-left',
                                'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                                'transition-colors group'
                              )}
                            >
                              <div
                                className={cn(
                                  'flex-shrink-0 p-1.5 rounded-lg',
                                  plugin.isRustPlugin
                                    ? 'bg-orange-100 dark:bg-orange-900/30'
                                    : 'bg-neutral-100 dark:bg-neutral-800'
                                )}
                              >
                                <PluginIcon
                                  className={cn(
                                    'w-4 h-4',
                                    plugin.isRustPlugin
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : 'text-neutral-600 dark:text-neutral-400'
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate group-hover:text-neutral-900 dark:group-hover:text-white">
                                    {plugin.menuLabel || plugin.name}
                                  </p>
                                  {plugin.isRustPlugin && (
                                    <Badge
                                      variant="warning"
                                      size="xs"
                                      className="flex-shrink-0"
                                    >
                                      Rust
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                                  v{plugin.version}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-8">
                <Puzzle className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  No Active Plugins
                </h4>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">
                  Install and activate plugins to see them here
                </p>
                <button
                  onClick={handleAddNew}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                    'text-sm font-medium',
                    'text-white bg-primary-600',
                    'hover:bg-primary-700',
                    'transition-colors'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Browse Plugins
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleViewAll}
                  className={cn(
                    'flex items-center gap-2',
                    'text-sm font-medium',
                    'text-neutral-600 dark:text-neutral-400',
                    'hover:text-neutral-900 dark:hover:text-white',
                    'transition-colors'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  Manage All Plugins
                </button>
                <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Rust Plugins: {activePlugins.filter((p) => p.isRustPlugin).length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    Third-party: {activePlugins.filter((p) => !p.isRustPlugin).length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PluginsMegaMenu;
