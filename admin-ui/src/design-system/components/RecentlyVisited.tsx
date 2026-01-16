/**
 * RustPress Recently Visited Component
 * Dropdown showing last 5-10 visited pages
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
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
  Trash2,
} from 'lucide-react';
import { cn } from '../utils';
import { useNavigationStore } from '../../store/navigationStore';
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
  Clock,
};

export interface RecentlyVisitedProps {
  className?: string;
  maxItems?: number;
  showClearButton?: boolean;
}

export function RecentlyVisited({
  className,
  maxItems = 8,
  showClearButton = true,
}: RecentlyVisitedProps) {
  const navigate = useNavigate();
  const { recentlyVisited, clearRecentPages } = useNavigationStore();

  const displayedItems = recentlyVisited.slice(0, maxItems);

  const getIcon = (iconName?: string) => {
    if (!iconName) return Clock;
    return iconMap[iconName] || Clock;
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

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
          <Clock className="w-4 h-4" />
          <span className="hidden md:inline">Recent</span>
          {displayedItems.length > 0 && (
            <span className="hidden sm:flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
              {displayedItems.length}
            </span>
          )}
        </button>
      </DropdownTrigger>

      <DropdownMenu align="start" className="w-72">
        <div className="px-3 py-2 flex items-center justify-between">
          <DropdownLabel className="px-0 py-0">Recently Visited</DropdownLabel>
          {showClearButton && displayedItems.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearRecentPages();
              }}
              className={cn(
                'p-1 rounded',
                'text-neutral-400 hover:text-neutral-600',
                'dark:hover:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'transition-colors'
              )}
              title="Clear history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <DropdownSeparator />

        {displayedItems.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No recent pages
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Pages you visit will appear here
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {displayedItems.map((page, index) => {
              const Icon = getIcon(page.icon);
              return (
                <DropdownItem
                  key={`${page.path}-${index}`}
                  icon={<Icon className="w-4 h-4" />}
                  onClick={() => navigate(page.path)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{page.label}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {formatTime(page.timestamp)}
                    </p>
                  </div>
                </DropdownItem>
              );
            })}
          </div>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

export default RecentlyVisited;
