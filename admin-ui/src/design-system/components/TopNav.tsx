/**
 * RustPress Top Navigation Component
 * Header bar with search, notifications, and user menu
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  ChevronDown,
  Command,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../utils';
import { useTheme } from '../ThemeProvider';
import { Avatar, AvatarWithName } from './Avatar';
import { Badge, CountBadge } from './Badge';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator, DropdownLabel } from './Dropdown';
import { SidebarMobileTrigger } from './Sidebar';
import { fadeInDown } from '../animations';
import { PluginsMegaMenu } from './PluginsMegaMenu';

export interface TopNavProps {
  className?: string;
  showMobileMenuTrigger?: boolean;
  showSearch?: boolean;
  showThemeToggle?: boolean;
  showNotifications?: boolean;
  showPluginsMegaMenu?: boolean;
  notifications?: Array<{
    id: string;
    title: string;
    description?: string;
    time: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  customContent?: React.ReactNode;
}

export function TopNav({
  className,
  showMobileMenuTrigger = true,
  showSearch = true,
  showThemeToggle = true,
  showNotifications = true,
  showPluginsMegaMenu = true,
  notifications = [],
  user,
  onSearch,
  onLogout,
  onProfileClick,
  onSettingsClick,
  customContent,
}: TopNavProps) {
  const { mode, setMode, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky',
        'h-16 flex items-center justify-between gap-4',
        'px-4 lg:px-6',
        'bg-white/80 dark:bg-neutral-950/80',
        'backdrop-blur-xl backdrop-saturate-150',
        'border-b border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {showMobileMenuTrigger && <SidebarMobileTrigger />}

        {/* Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div
              className={cn(
                'relative flex items-center',
                'w-64 lg:w-80',
                'transition-all duration-200',
                isSearchFocused && 'w-72 lg:w-96'
              )}
            >
              <Search
                className={cn(
                  'absolute left-3 w-4 h-4',
                  'text-neutral-400 dark:text-neutral-500',
                  'transition-colors duration-150',
                  isSearchFocused && 'text-primary-500'
                )}
              />
              <input
                type="search"
                placeholder="Search... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  'w-full h-10 pl-10 pr-4',
                  'text-sm',
                  'bg-neutral-100 dark:bg-neutral-900',
                  'border border-transparent',
                  'rounded-xl',
                  'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                  'focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-neutral-900',
                  'focus:ring-2 focus:ring-primary-500/20',
                  'transition-all duration-200'
                )}
              />
              <kbd
                className={cn(
                  'absolute right-3',
                  'hidden lg:flex items-center gap-1',
                  'text-xs text-neutral-400 dark:text-neutral-500',
                  'px-1.5 py-0.5 rounded',
                  'bg-neutral-200 dark:bg-neutral-800',
                  isSearchFocused && 'opacity-0'
                )}
              >
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </div>
          </form>
        )}
      </div>

      {/* Center custom content */}
      {customContent && (
        <div className="flex-1 flex items-center justify-center">
          {customContent}
        </div>
      )}

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Plugins MegaMenu */}
        {showPluginsMegaMenu && <PluginsMegaMenu />}

        {/* Theme Toggle */}
        {showThemeToggle && (
          <Dropdown>
            <DropdownTrigger asChild>
              <button
                className={cn(
                  'p-2 rounded-xl',
                  'text-neutral-500 dark:text-neutral-400',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'hover:text-neutral-700 dark:hover:text-neutral-200',
                  'transition-colors duration-150'
                )}
                aria-label="Toggle theme"
              >
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </motion.div>
              </button>
            </DropdownTrigger>
            <DropdownMenu align="end">
              <DropdownItem
                icon={<Sun className="w-4 h-4" />}
                onClick={() => setMode('light')}
                isSelected={mode === 'light'}
              >
                Light
              </DropdownItem>
              <DropdownItem
                icon={<Moon className="w-4 h-4" />}
                onClick={() => setMode('dark')}
                isSelected={mode === 'dark'}
              >
                Dark
              </DropdownItem>
              <DropdownItem
                icon={<Monitor className="w-4 h-4" />}
                onClick={() => setMode('system')}
                isSelected={mode === 'system'}
              >
                System
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        {/* Help */}
        <button
          className={cn(
            'p-2 rounded-xl',
            'text-neutral-500 dark:text-neutral-400',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'hover:text-neutral-700 dark:hover:text-neutral-200',
            'transition-colors duration-150'
          )}
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        {showNotifications && (
          <Dropdown>
            <DropdownTrigger asChild>
              <button
                className={cn(
                  'relative p-2 rounded-xl',
                  'text-neutral-500 dark:text-neutral-400',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'hover:text-neutral-700 dark:hover:text-neutral-200',
                  'transition-colors duration-150'
                )}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'absolute -top-0.5 -right-0.5',
                      'w-4 h-4 flex items-center justify-center',
                      'text-[10px] font-bold text-white',
                      'bg-error-500 rounded-full'
                    )}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
            </DropdownTrigger>
            <DropdownMenu align="end" className="w-80">
              <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <Badge variant="primary" size="xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3',
                        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                        'cursor-pointer transition-colors',
                        !notification.read && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            'flex-shrink-0 w-2 h-2 mt-1.5 rounded-full',
                            notification.type === 'success' && 'bg-success-500',
                            notification.type === 'warning' && 'bg-warning-500',
                            notification.type === 'error' && 'bg-error-500',
                            (!notification.type || notification.type === 'info') && 'bg-info-500'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          {notification.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                          )}
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <DropdownSeparator />
              <div className="px-4 py-2">
                <button className="w-full text-sm text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  View all notifications
                </button>
              </div>
            </DropdownMenu>
          </Dropdown>
        )}

        {/* User Menu */}
        {user && (
          <Dropdown>
            <DropdownTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-3',
                  'px-2 py-1.5 rounded-xl',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'transition-colors duration-150'
                )}
              >
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="sm"
                  status="online"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user.role || 'User'}
                  </p>
                </div>
                <ChevronDown className="hidden lg:block w-4 h-4 text-neutral-400" />
              </button>
            </DropdownTrigger>
            <DropdownMenu align="end" width={200}>
              <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 lg:hidden">
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </p>
              </div>

              <DropdownItem
                icon={<User className="w-4 h-4" />}
                onClick={onProfileClick}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                icon={<Settings className="w-4 h-4" />}
                onClick={onSettingsClick}
              >
                Settings
              </DropdownItem>

              <DropdownSeparator />

              <DropdownItem
                icon={<LogOut className="w-4 h-4" />}
                onClick={onLogout}
                isDestructive
              >
                Sign out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </header>
  );
}

export default TopNav;
