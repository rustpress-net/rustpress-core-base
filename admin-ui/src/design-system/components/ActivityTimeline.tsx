/**
 * RustPress Activity Timeline Component
 * Visual timeline showing recent actions and events
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  Users,
  Package,
  Image,
  Settings,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Send,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';
import { ActivityEvent } from '../../store/dashboardStore';

// Event type configuration
interface EventTypeConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}

const eventTypes: Record<string, EventTypeConfig> = {
  post: {
    icon: FileText,
    color: 'text-primary-500',
    bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    label: 'Post',
  },
  comment: {
    icon: MessageSquare,
    color: 'text-success-500',
    bgColor: 'bg-success-100 dark:bg-success-900/30',
    label: 'Comment',
  },
  user: {
    icon: Users,
    color: 'text-accent-500',
    bgColor: 'bg-accent-100 dark:bg-accent-900/30',
    label: 'User',
  },
  plugin: {
    icon: Package,
    color: 'text-warning-500',
    bgColor: 'bg-warning-100 dark:bg-warning-900/30',
    label: 'Plugin',
  },
  media: {
    icon: Image,
    color: 'text-info-500',
    bgColor: 'bg-info-100 dark:bg-info-900/30',
    label: 'Media',
  },
  setting: {
    icon: Settings,
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800',
    label: 'Settings',
  },
};

// Action icons
const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  publish: Send,
  login: LogIn,
  logout: LogOut,
};

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Group events by date
function groupEventsByDate(events: ActivityEvent[]): Record<string, ActivityEvent[]> {
  const groups: Record<string, ActivityEvent[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  events.forEach((event) => {
    const eventDate = new Date(event.timestamp).toDateString();
    let groupKey: string;

    if (eventDate === today) {
      groupKey = 'Today';
    } else if (eventDate === yesterday) {
      groupKey = 'Yesterday';
    } else {
      groupKey = new Date(event.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(event);
  });

  return groups;
}

// Single timeline event
interface TimelineEventProps {
  event: ActivityEvent;
  isLast: boolean;
  index: number;
}

function TimelineEvent({ event, isLast, index }: TimelineEventProps) {
  const typeConfig = eventTypes[event.type] || eventTypes.setting;
  const Icon = typeConfig.icon;
  const ActionIcon = actionIcons[event.action] || Edit;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex gap-4 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700"
        />
      )}

      {/* Event icon */}
      <div className={cn('relative z-10 p-2 rounded-xl', typeConfig.bgColor)}>
        <Icon className={cn('w-5 h-5', typeConfig.color)} />
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {event.title}
            </p>
            {event.description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
              {formatRelativeTime(event.timestamp)}
            </span>
          </div>
        </div>

        {/* Event meta */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            <Avatar name={event.user} size="xs" />
            <span className="text-xs text-neutral-600 dark:text-neutral-300">
              {event.user}
            </span>
          </div>

          <Badge variant="secondary" size="xs">
            <ActionIcon className="w-3 h-3 mr-1" />
            {event.action}
          </Badge>

          <Badge variant="secondary" size="xs" className={typeConfig.color}>
            {typeConfig.label}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

// Main ActivityTimeline component
export interface ActivityTimelineProps {
  events: ActivityEvent[];
  title?: string;
  maxEvents?: number;
  showFilter?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
  groupByDate?: boolean;
  className?: string;
}

export function ActivityTimeline({
  events,
  title = 'Activity Timeline',
  maxEvents = 10,
  showFilter = true,
  showRefresh = true,
  onRefresh,
  groupByDate = true,
  className,
}: ActivityTimelineProps) {
  const [filter, setFilter] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Filter events
  const filteredEvents = filter
    ? events.filter((e) => e.type === filter)
    : events;

  const displayedEvents = filteredEvents.slice(0, maxEvents);

  // Group by date if enabled
  const groupedEvents = groupByDate
    ? groupEventsByDate(displayedEvents)
    : { 'Recent Activity': displayedEvents };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Clock className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {filteredEvents.length} events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            {showFilter && (
              <Dropdown>
                <DropdownTrigger asChild>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className={filter ? 'text-primary-500' : ''}
                  >
                    <Filter className="w-4 h-4" />
                  </IconButton>
                </DropdownTrigger>
                <DropdownMenu align="end">
                  <DropdownLabel>Filter by type</DropdownLabel>
                  <DropdownSeparator />
                  <DropdownItem
                    onClick={() => setFilter(null)}
                    className={!filter ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
                  >
                    All Events
                  </DropdownItem>
                  {Object.entries(eventTypes).map(([type, config]) => (
                    <DropdownItem
                      key={type}
                      icon={<config.icon className={cn('w-4 h-4', config.color)} />}
                      onClick={() => setFilter(type)}
                      className={filter === type ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
                    >
                      {config.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}

            {/* Refresh button */}
            {showRefresh && onRefresh && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
                />
              </IconButton>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="flex-1 overflow-y-auto">
        {displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Clock className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No activity to show
            </p>
            {filter && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setFilter(null)}
                className="mt-2"
              >
                Clear filter
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                {groupByDate && (
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4">
                    {date}
                  </h4>
                )}
                <div>
                  {dateEvents.map((event, index) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isLast={index === dateEvents.length - 1}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {/* View all link */}
      {filteredEvents.length > maxEvents && (
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary-600 dark:text-primary-400"
          >
            View all {filteredEvents.length} events
          </Button>
        </div>
      )}
    </Card>
  );
}

// Compact timeline for smaller spaces
export interface CompactTimelineProps {
  events: ActivityEvent[];
  maxEvents?: number;
  className?: string;
}

export function CompactTimeline({
  events,
  maxEvents = 5,
  className,
}: CompactTimelineProps) {
  const displayedEvents = events.slice(0, maxEvents);

  return (
    <div className={cn('space-y-3', className)}>
      {displayedEvents.map((event, index) => {
        const typeConfig = eventTypes[event.type] || eventTypes.setting;
        const Icon = typeConfig.icon;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              'bg-neutral-50 dark:bg-neutral-800/50',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors cursor-pointer'
            )}
          >
            <div className={cn('p-2 rounded-lg', typeConfig.bgColor)}>
              <Icon className={cn('w-4 h-4', typeConfig.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {event.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {event.user} · {formatRelativeTime(event.timestamp)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ActivityTimeline;
