/**
 * RustPress Scheduled Posts Calendar Component
 * Visual calendar widget showing scheduled posts
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  User,
  Folder,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';
import { Badge } from './Badge';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from './Dropdown';
import { ScheduledPost } from '../../store/dashboardStore';

// Day names
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Status colors
const statusColors: Record<ScheduledPost['status'], { bg: string; text: string; badge: 'primary' | 'warning' | 'secondary' }> = {
  scheduled: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-600 dark:text-primary-400',
    badge: 'primary',
  },
  draft: {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-600 dark:text-neutral-400',
    badge: 'secondary',
  },
  'pending-review': {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    text: 'text-warning-600 dark:text-warning-400',
    badge: 'warning',
  },
};

// Get days in month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Format time
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Calendar day cell
interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  posts: ScheduledPost[];
  onSelect: () => void;
  onPostClick: (post: ScheduledPost) => void;
}

function DayCell({
  day,
  isToday,
  isSelected,
  posts,
  onSelect,
  onPostClick,
}: DayCellProps) {
  if (day === null) {
    return <div className="h-24 bg-neutral-50 dark:bg-neutral-900/50" />;
  }

  const hasPosts = posts.length > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={cn(
        'h-24 p-1 border-b border-r border-neutral-200 dark:border-neutral-700',
        'cursor-pointer transition-colors',
        isSelected && 'bg-primary-50 dark:bg-primary-900/20',
        isToday && !isSelected && 'bg-accent-50 dark:bg-accent-900/20',
        !isSelected && !isToday && 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
            isToday && 'bg-accent-500 text-white',
            isSelected && !isToday && 'bg-primary-500 text-white',
            !isToday && !isSelected && 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          {day}
        </span>
        {posts.length > 2 && (
          <Badge variant="secondary" size="xs">
            +{posts.length - 2}
          </Badge>
        )}
      </div>

      {/* Posts preview */}
      <div className="space-y-0.5">
        {posts.slice(0, 2).map((post) => (
          <button
            key={post.id}
            onClick={(e) => {
              e.stopPropagation();
              onPostClick(post);
            }}
            className={cn(
              'w-full text-left px-1.5 py-0.5 rounded text-xs truncate',
              statusColors[post.status].bg,
              statusColors[post.status].text,
              'hover:opacity-80 transition-opacity'
            )}
            title={post.title}
          >
            {formatTime(post.scheduledDate)} {post.title}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Post detail panel
interface PostDetailPanelProps {
  post: ScheduledPost;
  onEdit?: (post: ScheduledPost) => void;
  onPreview?: (post: ScheduledPost) => void;
  onClose: () => void;
}

function PostDetailPanel({
  post,
  onEdit,
  onPreview,
  onClose,
}: PostDetailPanelProps) {
  const statusConfig = statusColors[post.status];
  const date = new Date(post.scheduledDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        'p-4 rounded-xl border-l-4',
        'bg-neutral-50 dark:bg-neutral-800/50',
        statusConfig.text.includes('primary')
          ? 'border-l-primary-500'
          : statusConfig.text.includes('warning')
            ? 'border-l-warning-500'
            : 'border-l-neutral-400'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
            {post.title}
          </h4>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {date.toLocaleDateString()} at {formatTime(post.scheduledDate)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{post.author}</span>
            </div>
            {post.category && (
              <div className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                <span>{post.category}</span>
              </div>
            )}
          </div>
        </div>

        <Badge variant={statusConfig.badge} size="xs">
          {post.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {onEdit && (
          <Button
            variant="outline"
            size="xs"
            onClick={() => onEdit(post)}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        )}
        {onPreview && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onPreview(post)}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Main ScheduledPostsCalendar component
export interface ScheduledPostsCalendarProps {
  posts: ScheduledPost[];
  title?: string;
  onAddPost?: () => void;
  onEditPost?: (post: ScheduledPost) => void;
  onPreviewPost?: (post: ScheduledPost) => void;
  className?: string;
}

export function ScheduledPostsCalendar({
  posts,
  title = 'Scheduled Posts',
  onAddPost,
  onEditPost,
  onPreviewPost,
  className,
}: ScheduledPostsCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  // Get calendar data
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear]);

  // Get posts for each day
  const postsByDay = useMemo(() => {
    const byDay: Record<number, ScheduledPost[]> = {};

    posts.forEach((post) => {
      const postDate = new Date(post.scheduledDate);
      if (
        postDate.getMonth() === currentMonth &&
        postDate.getFullYear() === currentYear
      ) {
        const day = postDate.getDate();
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(post);
      }
    });

    return byDay;
  }, [posts, currentMonth, currentYear]);

  // Get selected day posts
  const selectedDayPosts = selectedDay ? postsByDay[selectedDay] || [] : [];

  // Navigation handlers
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
    setSelectedPost(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
    setSelectedPost(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
    setSelectedPost(null);
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Calendar className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {posts.length} scheduled posts
              </p>
            </div>
          </div>

          {onAddPost && (
            <Button variant="primary" size="sm" onClick={onAddPost}>
              <Plus className="w-4 h-4 mr-1" />
              Schedule
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconButton variant="ghost" size="sm" onClick={goToPrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </IconButton>
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white min-w-[160px] text-center">
              {MONTHS[currentMonth]} {currentYear}
            </h4>
            <IconButton variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </IconButton>
          </div>

          <Button variant="ghost" size="xs" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-t border-l border-neutral-200 dark:border-neutral-700">
            {DAYS.map((day) => (
              <div
                key={day}
                className={cn(
                  'py-2 text-center text-xs font-semibold uppercase',
                  'text-neutral-500 dark:text-neutral-400',
                  'bg-neutral-50 dark:bg-neutral-900/50',
                  'border-b border-r border-neutral-200 dark:border-neutral-700'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 border-l border-neutral-200 dark:border-neutral-700">
            {calendarData.map((day, index) => (
              <DayCell
                key={index}
                day={day}
                isToday={
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear()
                }
                isSelected={day === selectedDay}
                posts={day ? postsByDay[day] || [] : []}
                onSelect={() => {
                  setSelectedDay(day);
                  setSelectedPost(null);
                }}
                onPostClick={setSelectedPost}
              />
            ))}
          </div>
        </div>

        {/* Selected day posts */}
        <AnimatePresence>
          {selectedDayPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-2"
            >
              <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Posts on {MONTHS[currentMonth]} {selectedDay}
              </h5>
              {selectedDayPosts.map((post) => (
                <PostDetailPanel
                  key={post.id}
                  post={post}
                  onEdit={onEditPost}
                  onPreview={onPreviewPost}
                  onClose={() => setSelectedPost(null)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

// Compact list view
export interface ScheduledPostsListProps {
  posts: ScheduledPost[];
  maxPosts?: number;
  onEditPost?: (post: ScheduledPost) => void;
  className?: string;
}

export function ScheduledPostsList({
  posts,
  maxPosts = 5,
  onEditPost,
  className,
}: ScheduledPostsListProps) {
  const sortedPosts = [...posts]
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, maxPosts);

  return (
    <div className={cn('space-y-3', className)}>
      {sortedPosts.map((post, index) => {
        const statusConfig = statusColors[post.status];
        const date = new Date(post.scheduledDate);

        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              'bg-neutral-50 dark:bg-neutral-800/50',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors cursor-pointer'
            )}
            onClick={() => onEditPost?.(post)}
          >
            <div className={cn('p-2 rounded-lg', statusConfig.bg)}>
              <FileText className={cn('w-4 h-4', statusConfig.text)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {post.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {date.toLocaleDateString()} at {formatTime(post.scheduledDate)}
              </p>
            </div>

            <Badge variant={statusConfig.badge} size="xs">
              {post.status.replace('-', ' ')}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ScheduledPostsCalendar;
