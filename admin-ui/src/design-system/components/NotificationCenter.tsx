/**
 * RustPress Notification Center Component
 * Bell icon with dropdown notifications panel
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  MessageSquare,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  User,
  FileText,
  ShoppingCart,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  metadata?: Record<string, unknown>;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  maxVisible?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

// ============================================================================
// Notification Type Icons & Colors
// ============================================================================

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  info: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-primary-600 dark:text-primary-400',
    bgColor: 'bg-primary-100 dark:bg-primary-900/30',
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-success-600 dark:text-success-400',
    bgColor: 'bg-success-100 dark:bg-success-900/30',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-warning-600 dark:text-warning-400',
    bgColor: 'bg-warning-100 dark:bg-warning-900/30',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-error-600 dark:text-error-400',
    bgColor: 'bg-error-100 dark:bg-error-900/30',
  },
  message: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-neutral-600 dark:text-neutral-400',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800',
  },
  system: {
    icon: <Settings className="w-4 h-4" />,
    color: 'text-neutral-600 dark:text-neutral-400',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800',
  },
};

// ============================================================================
// Time Formatting
// ============================================================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Notification Item Component
// ============================================================================

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = typeConfig[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      className={cn(
        'group relative px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0',
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
        !notification.read && 'bg-primary-50/50 dark:bg-primary-900/10',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex gap-3">
        {/* Icon or Avatar */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                config.bgColor,
                config.color
              )}
            >
              {notification.icon || config.icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm font-medium text-neutral-900 dark:text-white',
                !notification.read && 'font-semibold'
              )}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary-500" />
            )}
          </div>

          {notification.message && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
              {notification.message}
            </p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {formatTimeAgo(notification.timestamp)}
            </span>

            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action?.onClick?.();
                }}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {notification.action.label}
                {notification.action.href && (
                  <ExternalLink className="inline w-3 h-3 ml-1" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && onMarkAsRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="p-1 text-neutral-400 hover:text-error-600 dark:hover:text-error-400 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyNotifications() {
  return (
    <div className="py-12 text-center">
      <Bell className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        No notifications
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        You're all caught up!
      </p>
    </div>
  );
}

// ============================================================================
// Main Notification Center Component
// ============================================================================

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick,
  onSettingsClick,
  maxVisible = 5,
  showViewAll = true,
  onViewAll,
  position = 'bottom-right',
  className,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);
  const hasMore = notifications.length > maxVisible;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const positionClasses = {
    'bottom-right': 'right-0',
    'bottom-left': 'left-0',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          isOpen && 'bg-neutral-100 dark:bg-neutral-800'
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 flex items-center justify-center',
              'min-w-[18px] h-[18px] px-1 text-xs font-bold',
              'bg-error-500 text-white rounded-full'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full mt-2 z-50',
              'w-96 max-w-[calc(100vw-2rem)]',
              'bg-white dark:bg-neutral-900 rounded-xl shadow-xl',
              'border border-neutral-200 dark:border-neutral-700',
              'overflow-hidden',
              positionClasses[position]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {onSettingsClick && (
                  <button
                    onClick={onSettingsClick}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
                    title="Notification settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyNotifications />
              ) : (
                <AnimatePresence>
                  {visibleNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                      onClick={onNotificationClick}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {(hasMore || onClearAll) && notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                {showViewAll && hasMore && (
                  <button
                    onClick={() => {
                      onViewAll?.();
                      setIsOpen(false);
                    }}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    View all ({notifications.length})
                  </button>
                )}
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-neutral-500 hover:text-error-600 dark:hover:text-error-400"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Notification Badge (standalone)
// ============================================================================

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  className,
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[20px] h-5 px-1.5 text-xs font-bold',
        'bg-error-500 text-white rounded-full',
        className
      )}
    >
      {displayCount}
    </span>
  );
}

// ============================================================================
// Notification Toast (for in-app notifications)
// ============================================================================

export interface NotificationToastProps {
  notification: Notification;
  onClose?: () => void;
  onAction?: () => void;
  autoClose?: number;
  className?: string;
}

export function NotificationToast({
  notification,
  onClose,
  onAction,
  autoClose = 5000,
  className,
}: NotificationToastProps) {
  const config = typeConfig[notification.type];

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className={cn(
        'flex items-start gap-3 p-4 max-w-sm',
        'bg-white dark:bg-neutral-900 rounded-lg shadow-xl',
        'border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          config.bgColor,
          config.color
        )}
      >
        {notification.icon || config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {notification.title}
        </p>
        {notification.message && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {notification.message}
          </p>
        )}
        {notification.action && (
          <button
            onClick={onAction || notification.action.onClick}
            className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// ============================================================================
// Notifications List (full page view)
// ============================================================================

export interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  groupByDate?: boolean;
  className?: string;
}

export function NotificationsList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  groupByDate = true,
  className,
}: NotificationsListProps) {
  const groupedNotifications = groupByDate
    ? notifications.reduce((groups, notification) => {
        const date = notification.timestamp.toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
      }, {} as Record<string, Notification[]>)
    : { All: notifications };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn('bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Notifications
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Grouped List */}
      {Object.entries(groupedNotifications).map(([date, items]) => (
        <div key={date}>
          {groupByDate && (
            <div className="px-6 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                {date === new Date().toDateString() ? 'Today' : date}
              </span>
            </div>
          )}
          <AnimatePresence>
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onClick={onNotificationClick}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}

      {notifications.length === 0 && <EmptyNotifications />}
    </div>
  );
}

export default NotificationCenter;
