/**
 * RustPress Timeline Component
 * Vertical and horizontal timeline for events and history
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Circle,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type TimelineItemStatus = 'completed' | 'current' | 'upcoming' | 'failed' | 'warning';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: Date;
  status?: TimelineItemStatus;
  icon?: React.ReactNode;
  user?: { name: string; avatar?: string };
  tags?: string[];
  link?: { label: string; href: string; onClick?: () => void };
  metadata?: Record<string, string | number>;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'vertical' | 'horizontal' | 'alternating';
  showConnectors?: boolean;
  showDates?: boolean;
  dateFormat?: 'relative' | 'absolute' | 'both';
  animateOnScroll?: boolean;
  iconPosition?: 'left' | 'center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================================
// Status Configuration
// ============================================================================

const statusConfig: Record<TimelineItemStatus, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
  completed: {
    icon: <CheckCircle className="w-full h-full" />,
    color: 'text-success-600 dark:text-success-400',
    bgColor: 'bg-success-100 dark:bg-success-900/30',
    borderColor: 'border-success-500',
  },
  current: {
    icon: <Circle className="w-full h-full fill-current" />,
    color: 'text-primary-600 dark:text-primary-400',
    bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    borderColor: 'border-primary-500',
  },
  upcoming: {
    icon: <Clock className="w-full h-full" />,
    color: 'text-neutral-400 dark:text-neutral-500',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800',
    borderColor: 'border-neutral-300 dark:border-neutral-600',
  },
  failed: {
    icon: <XCircle className="w-full h-full" />,
    color: 'text-error-600 dark:text-error-400',
    bgColor: 'bg-error-100 dark:bg-error-900/30',
    borderColor: 'border-error-500',
  },
  warning: {
    icon: <AlertCircle className="w-full h-full" />,
    color: 'text-warning-600 dark:text-warning-400',
    bgColor: 'bg-warning-100 dark:bg-warning-900/30',
    borderColor: 'border-warning-500',
  },
};

const sizeConfig = {
  sm: { icon: 'w-6 h-6', text: 'text-sm', spacing: 'gap-3 pb-6' },
  md: { icon: 'w-8 h-8', text: 'text-base', spacing: 'gap-4 pb-8' },
  lg: { icon: 'w-10 h-10', text: 'text-lg', spacing: 'gap-5 pb-10' },
};

// ============================================================================
// Date Formatting
// ============================================================================

function formatDate(date: Date, format: 'relative' | 'absolute' | 'both'): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const relative = (() => {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  })();

  const absolute = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  switch (format) {
    case 'relative':
      return relative;
    case 'absolute':
      return absolute;
    case 'both':
      return `${relative} (${absolute})`;
  }
}

// ============================================================================
// Timeline Icon Component
// ============================================================================

interface TimelineIconProps {
  item: TimelineItem;
  size: 'sm' | 'md' | 'lg';
}

function TimelineIcon({ item, size }: TimelineIconProps) {
  const status = item.status || 'upcoming';
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size].icon;

  return (
    <div
      className={cn(
        'flex-shrink-0 flex items-center justify-center rounded-full',
        sizeClass,
        config.bgColor,
        config.color
      )}
    >
      {item.icon || (
        <div className={cn('w-1/2 h-1/2', config.color)}>
          {config.icon}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Vertical Timeline Item
// ============================================================================

interface VerticalItemProps {
  item: TimelineItem;
  index: number;
  isLast: boolean;
  showConnectors: boolean;
  showDates: boolean;
  dateFormat: 'relative' | 'absolute' | 'both';
  animate: boolean;
  size: 'sm' | 'md' | 'lg';
  alternating?: boolean;
  isEven?: boolean;
}

function VerticalTimelineItem({
  item,
  index,
  isLast,
  showConnectors,
  showDates,
  dateFormat,
  animate,
  size,
  alternating,
  isEven,
}: VerticalItemProps) {
  const config = statusConfig[item.status || 'upcoming'];
  const sizeConf = sizeConfig[size];

  const content = (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h4 className={cn('font-medium text-neutral-900 dark:text-white', sizeConf.text)}>
          {item.title}
        </h4>
        {showDates && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
            {formatDate(item.date, dateFormat)}
          </span>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {item.description}
        </p>
      )}

      {/* User */}
      {item.user && (
        <div className="mt-2 flex items-center gap-2">
          {item.user.avatar ? (
            <img src={item.user.avatar} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <User className="w-4 h-4 text-neutral-400" />
          )}
          <span className="text-xs text-neutral-500">{item.user.name}</span>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
          {Object.entries(item.metadata).map(([key, value]) => (
            <span key={key}>
              <span className="font-medium">{key}:</span> {value}
            </span>
          ))}
        </div>
      )}

      {/* Link */}
      {item.link && (
        <a
          href={item.link.href}
          onClick={item.link.onClick}
          className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {item.link.label}
          <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative flex',
        sizeConf.spacing,
        alternating && 'md:w-1/2',
        alternating && isEven && 'md:ml-auto md:pl-8',
        alternating && !isEven && 'md:pr-8 md:text-right'
      )}
    >
      {/* Connector Line */}
      {showConnectors && !isLast && (
        <div
          className={cn(
            'absolute left-4 top-10 w-0.5 h-full -translate-x-1/2',
            item.status === 'completed'
              ? 'bg-success-300 dark:bg-success-700'
              : 'bg-neutral-200 dark:bg-neutral-700',
            alternating && 'md:left-1/2'
          )}
        />
      )}

      {/* Icon */}
      <div className={cn(alternating && !isEven && 'md:order-last')}>
        <TimelineIcon item={item} size={size} />
      </div>

      {/* Content */}
      {content}
    </motion.div>
  );
}

// ============================================================================
// Horizontal Timeline
// ============================================================================

interface HorizontalTimelineProps {
  items: TimelineItem[];
  showDates: boolean;
  dateFormat: 'relative' | 'absolute' | 'both';
  animate: boolean;
  size: 'sm' | 'md' | 'lg';
}

function HorizontalTimeline({
  items,
  showDates,
  dateFormat,
  animate,
  size,
}: HorizontalTimelineProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-start min-w-max">
        {items.map((item, index) => {
          const config = statusConfig[item.status || 'upcoming'];
          const isLast = index === items.length - 1;

          return (
            <motion.div
              key={item.id}
              initial={animate ? { opacity: 0, x: -20 } : undefined}
              whileInView={animate ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Top Content */}
              <div className="w-40 text-center px-2 pb-3">
                {showDates && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    {formatDate(item.date, dateFormat)}
                  </p>
                )}
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                  {item.title}
                </h4>
              </div>

              {/* Icon and Connector */}
              <div className="flex items-center">
                <TimelineIcon item={item} size={size} />
                {!isLast && (
                  <div
                    className={cn(
                      'w-20 h-0.5',
                      item.status === 'completed'
                        ? 'bg-success-300 dark:bg-success-700'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    )}
                  />
                )}
              </div>

              {/* Bottom Content */}
              {item.description && (
                <div className="w-40 text-center px-2 pt-3">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main Timeline Component
// ============================================================================

export function Timeline({
  items,
  variant = 'vertical',
  showConnectors = true,
  showDates = true,
  dateFormat = 'relative',
  animateOnScroll = true,
  iconPosition = 'left',
  size = 'md',
  className,
}: TimelineProps) {
  if (variant === 'horizontal') {
    return (
      <div className={className}>
        <HorizontalTimeline
          items={items}
          showDates={showDates}
          dateFormat={dateFormat}
          animate={animateOnScroll}
          size={size}
        />
      </div>
    );
  }

  const isAlternating = variant === 'alternating';

  return (
    <div className={cn('relative', isAlternating && 'md:flex md:flex-col md:items-center', className)}>
      {/* Center line for alternating */}
      {isAlternating && showConnectors && (
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700 -translate-x-1/2" />
      )}

      {items.map((item, index) => (
        <VerticalTimelineItem
          key={item.id}
          item={item}
          index={index}
          isLast={index === items.length - 1}
          showConnectors={showConnectors}
          showDates={showDates}
          dateFormat={dateFormat}
          animate={animateOnScroll}
          size={size}
          alternating={isAlternating}
          isEven={index % 2 === 0}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Simple Timeline (compact version)
// ============================================================================

export interface SimpleTimelineProps {
  items: { id: string; title: string; date: Date; status?: TimelineItemStatus }[];
  className?: string;
}

export function SimpleTimeline({ items, className }: SimpleTimelineProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => {
        const config = statusConfig[item.status || 'upcoming'];
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex items-start gap-3">
            {/* Icon and line */}
            <div className="relative flex flex-col items-center">
              <div className={cn('w-2 h-2 rounded-full', config.bgColor, config.borderColor, 'border-2')} />
              {!isLast && (
                <div className="w-0.5 h-6 bg-neutral-200 dark:bg-neutral-700 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 -mt-0.5">
              <p className="text-sm text-neutral-900 dark:text-white">
                {item.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDate(item.date, 'relative')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Activity Timeline (for activity feeds)
// ============================================================================

export interface ActivityTimelineItemProps {
  id: string;
  action: string;
  target?: string;
  user: { name: string; avatar?: string };
  timestamp: Date;
  icon?: React.ReactNode;
  iconColor?: string;
}

export interface ActivityTimelineListProps {
  items: ActivityTimelineItemProps[];
  className?: string;
}

export function ActivityTimelineList({ items, className }: ActivityTimelineListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          {/* User avatar */}
          <div className="relative">
            {item.user.avatar ? (
              <img src={item.user.avatar} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  {item.user.name.charAt(0)}
                </span>
              </div>
            )}
            {item.icon && (
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700',
                  item.iconColor || 'text-neutral-500'
                )}
              >
                {item.icon}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              <span className="font-medium text-neutral-900 dark:text-white">
                {item.user.name}
              </span>{' '}
              {item.action}
              {item.target && (
                <>
                  {' '}
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {item.target}
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {formatDate(item.timestamp, 'relative')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
