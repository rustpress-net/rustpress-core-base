/**
 * RustPress Dashboard Widgets
 * Data visualization and analytics components
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Users,
  FileText,
  DollarSign,
  Activity,
  Calendar,
  Clock,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';
import { staggerContainer, staggerItem, fadeInUp } from '../animations';

// ============================================
// METRIC CARD
// ============================================

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  sparkline?: number[];
  isLoading?: boolean;
  className?: string;
}

const iconColors = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  error: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
  info: 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400',
};

export function MetricCard({
  title,
  value,
  change,
  icon,
  iconColor = 'primary',
  sparkline,
  isLoading,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton height={14} className="w-20 mb-2" />
            <Skeleton height={32} className="w-28 mb-2" />
            <Skeleton height={12} className="w-16" />
          </div>
          <Skeleton height={48} width={48} rounded="xl" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
    >
      <Card variant="default" padding="lg" isHoverable className={cn('relative overflow-hidden', className)}>
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-primary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10 rounded-full blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>

            {change && (
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-sm font-medium',
                    change.trend === 'up' && 'text-success-600 dark:text-success-400',
                    change.trend === 'down' && 'text-error-600 dark:text-error-400',
                    change.trend === 'neutral' && 'text-neutral-500 dark:text-neutral-400'
                  )}
                >
                  {change.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                  {change.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                  {change.trend === 'neutral' && <Minus className="w-4 h-4" />}
                  {change.value > 0 ? '+' : ''}
                  {change.value}%
                </span>
                {change.label && (
                  <span className="text-sm text-neutral-400 dark:text-neutral-500">
                    {change.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {icon && (
            <div className={cn('p-3 rounded-xl', iconColors[iconColor])}>
              {icon}
            </div>
          )}
        </div>

        {/* Mini sparkline */}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-4 h-8">
            <Sparkline data={sparkline} />
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Simple sparkline component
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn('w-full h-full', className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary-500"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ============================================
// CHART CARD (Wrapper for charts)
// ============================================

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  actions,
  isLoading,
  className,
}: ChartCardProps) {
  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-neutral-300 dark:text-neutral-600 animate-spin" />
        </div>
      ) : (
        children
      )}
    </Card>
  );
}

// ============================================
// ACTIVITY FEED
// ============================================

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'publish' | 'comment' | 'user';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  link?: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  className?: string;
  onViewAll?: () => void;
}

const activityIcons = {
  create: FileText,
  update: RefreshCw,
  delete: FileText,
  publish: Eye,
  comment: FileText,
  user: Users,
};

const activityColors = {
  create: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  update: 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400',
  delete: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
  publish: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  comment: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  user: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
};

export function ActivityFeed({
  activities,
  isLoading,
  maxItems = 5,
  className,
  onViewAll,
}: ActivityFeedProps) {
  const displayItems = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <CardHeader title="Recent Activity" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton height={40} width={40} rounded="full" />
              <div className="flex-1">
                <Skeleton height={16} className="w-3/4 mb-1" />
                <Skeleton height={12} className="w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className={className}>
      <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Activity
          </h3>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </button>
          )}
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="px-6 py-4"
      >
        {displayItems.map((activity, index) => {
          const Icon = activityIcons[activity.type];

          return (
            <motion.div
              key={activity.id}
              variants={staggerItem}
              className={cn(
                'flex gap-3 py-3',
                index !== displayItems.length - 1 && 'border-b border-neutral-100 dark:border-neutral-800'
              )}
            >
              <div className={cn('p-2 rounded-full flex-shrink-0', activityColors[activity.type])}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </Card>
  );
}

// ============================================
// QUICK STATS ROW
// ============================================

export interface QuickStat {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export interface QuickStatsRowProps {
  stats: QuickStat[];
  isLoading?: boolean;
  className?: string;
}

export function QuickStatsRow({ stats, isLoading, className }: QuickStatsRowProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800"
          >
            <Skeleton height={12} className="w-16 mb-2" />
            <Skeleton height={24} className="w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          className={cn(
            'p-4 rounded-xl',
            'bg-white dark:bg-neutral-900',
            'border border-neutral-200 dark:border-neutral-800',
            'transition-all duration-200',
            'hover:shadow-md hover:-translate-y-0.5'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {stat.icon && (
              <span className="text-neutral-400 dark:text-neutral-500">
                {stat.icon}
              </span>
            )}
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </span>
            {stat.trend && stat.trendValue !== undefined && (
              <span
                className={cn(
                  'text-xs font-medium mb-1',
                  stat.trend === 'up' && 'text-success-600',
                  stat.trend === 'down' && 'text-error-600',
                  stat.trend === 'neutral' && 'text-neutral-500'
                )}
              >
                {stat.trendValue > 0 ? '+' : ''}
                {stat.trendValue}%
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// PROGRESS CARD
// ============================================

export interface ProgressItem {
  label: string;
  value: number;
  max: number;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface ProgressCardProps {
  title: string;
  items: ProgressItem[];
  className?: string;
}

const progressColors = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
};

export function ProgressCard({ title, items, className }: ProgressCardProps) {
  return (
    <Card variant="default" padding="lg" className={className}>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = Math.min((item.value / item.max) * 100, 100);

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {item.label}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {item.value.toLocaleString()} / {item.max.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                  className={cn('h-full rounded-full', progressColors[item.color || 'primary'])}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================
// UPCOMING SCHEDULE
// ============================================

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  date?: string;
  type?: 'meeting' | 'task' | 'reminder' | 'event';
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export interface ScheduleWidgetProps {
  items: ScheduleItem[];
  isLoading?: boolean;
  className?: string;
  onItemClick?: (item: ScheduleItem) => void;
}

export function ScheduleWidget({
  items,
  isLoading,
  className,
  onItemClick,
}: ScheduleWidgetProps) {
  const statusColors = {
    upcoming: 'border-l-primary-500',
    ongoing: 'border-l-success-500',
    completed: 'border-l-neutral-300 dark:border-l-neutral-600',
  };

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <CardHeader title="Upcoming" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <Skeleton height={16} width={16} />
              <div className="flex-1">
                <Skeleton height={16} className="w-3/4 mb-1" />
                <Skeleton height={12} className="w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className={className}>
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Upcoming
        </h3>
      </div>

      <div className="px-4 pb-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              'w-full flex items-start gap-3 p-3 rounded-lg text-left',
              'border-l-4',
              statusColors[item.status || 'upcoming'],
              'bg-neutral-50 dark:bg-neutral-800/50',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors duration-150',
              'mb-2 last:mb-0'
            )}
          >
            <Clock className="w-4 h-4 text-neutral-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {item.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {item.time}
                {item.date && ` - ${item.date}`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ============================================
// REAL-TIME VISITORS WIDGET
// ============================================

export interface RealTimeWidgetProps {
  currentVisitors: number;
  peakToday?: number;
  trend?: 'up' | 'down' | 'stable';
  isLoading?: boolean;
  className?: string;
}

export function RealTimeWidget({
  currentVisitors,
  peakToday = 0,
  trend = 'stable',
  isLoading,
  className,
}: RealTimeWidgetProps) {
  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Skeleton height={20} className="w-32 mb-4" />
        <Skeleton height={48} className="w-24" />
      </Card>
    );
  }

  return (
    <Card
      variant="gradient"
      padding="lg"
      className={cn('relative overflow-hidden', className)}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500" />
          </span>
          <span className="text-sm font-medium text-white/80">
            Real-time visitors
          </span>
        </div>

        <div className="flex items-end gap-4">
          <span className="text-5xl font-bold text-white">
            {currentVisitors.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 pb-2">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-success-300" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-error-300" />}
            {trend === 'stable' && <Minus className="w-4 h-4 text-neutral-300" />}
          </div>
        </div>

        {peakToday > 0 && (
          <p className="text-sm text-white/60 mt-2">
            Peak today: {peakToday.toLocaleString()} visitors
          </p>
        )}
      </div>

      {/* Animated background circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent-500/20 rounded-full blur-xl" />
    </Card>
  );
}

// ============================================
// PERFORMANCE SCORE WIDGET
// ============================================

export interface PerformanceScoreProps {
  score: number;
  maxScore?: number;
  label?: string;
  breakdown?: Array<{
    label: string;
    score: number;
    maxScore: number;
  }>;
  isLoading?: boolean;
  className?: string;
}

export function PerformanceScore({
  score,
  maxScore = 100,
  label = 'Performance Score',
  breakdown,
  isLoading,
  className,
}: PerformanceScoreProps) {
  const percentage = (score / maxScore) * 100;
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray * (1 - percentage / 100);

  const getScoreColor = (pct: number) => {
    if (pct >= 90) return 'text-success-500 stroke-success-500';
    if (pct >= 70) return 'text-warning-500 stroke-warning-500';
    return 'text-error-500 stroke-error-500';
  };

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex flex-col items-center">
          <Skeleton height={120} width={120} rounded="full" />
          <Skeleton height={16} className="w-32 mt-4" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex flex-col items-center">
        {/* Circular progress */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              className="stroke-neutral-100 dark:stroke-neutral-800"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={getScoreColor(percentage)}
              initial={{ strokeDashoffset: strokeDasharray }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ strokeDasharray }}
            />
          </svg>
          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-3xl font-bold', getScoreColor(percentage).split(' ')[0])}>
              {score}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              /{maxScore}
            </span>
          </div>
        </div>

        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mt-4">
          {label}
        </p>

        {/* Breakdown */}
        {breakdown && breakdown.length > 0 && (
          <div className="w-full mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">{item.label}</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {item.score}/{item.maxScore}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// TOP CONTENT WIDGET
// ============================================

export interface TopContentItem {
  id: string;
  title: string;
  views: number;
  change?: number;
  image?: string;
}

export interface TopContentWidgetProps {
  items: TopContentItem[];
  title?: string;
  isLoading?: boolean;
  className?: string;
  onItemClick?: (item: TopContentItem) => void;
}

export function TopContentWidget({
  items,
  title = 'Top Content',
  isLoading,
  className,
  onItemClick,
}: TopContentWidgetProps) {
  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Skeleton height={20} className="w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton height={20} width={20} />
            <Skeleton height={16} className="flex-1" />
            <Skeleton height={14} width={60} />
          </div>
        ))}
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className={className}>
      <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="px-4 py-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg text-left',
              'hover:bg-neutral-50 dark:hover:bg-neutral-800',
              'transition-colors duration-150'
            )}
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {item.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.views.toLocaleString()} views
              </span>
              {item.change !== undefined && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    item.change > 0 && 'text-success-600',
                    item.change < 0 && 'text-error-600',
                    item.change === 0 && 'text-neutral-500'
                  )}
                >
                  {item.change > 0 ? '+' : ''}
                  {item.change}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ============================================
// NOTIFICATION WIDGET
// ============================================

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read?: boolean;
  actionUrl?: string;
}

export interface NotificationWidgetProps {
  notifications: NotificationItem[];
  isLoading?: boolean;
  className?: string;
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllRead?: () => void;
}

const notificationTypeStyles = {
  info: 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400',
  success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  error: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
};

export function NotificationWidget({
  notifications,
  isLoading,
  className,
  onNotificationClick,
  onMarkAllRead,
}: NotificationWidgetProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Skeleton height={20} className="w-32 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-3">
            <Skeleton height={32} width={32} rounded="full" />
            <div className="flex-1">
              <Skeleton height={14} className="w-3/4 mb-1" />
              <Skeleton height={12} className="w-1/2" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className={className}>
      <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="error" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
          {onMarkAllRead && unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No notifications
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => onNotificationClick?.(notification)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left',
                'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                'transition-colors duration-150',
                !notification.read && 'bg-primary-50/50 dark:bg-primary-900/10'
              )}
            >
              <div className={cn('p-2 rounded-full', notificationTypeStyles[notification.type])}>
                {notification.type === 'info' && <Activity className="w-4 h-4" />}
                {notification.type === 'success' && <TrendingUp className="w-4 h-4" />}
                {notification.type === 'warning' && <Clock className="w-4 h-4" />}
                {notification.type === 'error' && <TrendingDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm text-neutral-900 dark:text-white truncate',
                  !notification.read && 'font-medium'
                )}>
                  {notification.title}
                </p>
                {notification.description && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {notification.description}
                  </p>
                )}
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  {notification.timestamp}
                </p>
              </div>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
              )}
            </button>
          ))
        )}
      </div>
    </Card>
  );
}

// ============================================
// MINI DONUT CHART
// ============================================

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export interface MiniDonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MiniDonutChart({
  data,
  size = 80,
  strokeWidth = 8,
  className,
}: MiniDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-neutral-100 dark:stroke-neutral-800"
      />
      {data.map((item, index) => {
        const percentage = item.value / total;
        const strokeDasharray = circumference * percentage;
        const strokeDashoffset = -currentOffset;
        currentOffset += circumference * percentage;

        return (
          <motion.circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke={item.color}
            strokeLinecap="round"
            strokeDasharray={`${strokeDasharray} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="-rotate-90 origin-center"
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          />
        );
      })}
    </svg>
  );
}

// ============================================
// STATS COMPARISON WIDGET
// ============================================

export interface StatComparisonProps {
  title: string;
  currentValue: number;
  previousValue: number;
  format?: 'number' | 'currency' | 'percentage';
  period?: string;
  className?: string;
}

export function StatComparison({
  title,
  currentValue,
  previousValue,
  format = 'number',
  period = 'vs last period',
  className,
}: StatComparisonProps) {
  const change = previousValue !== 0
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;
  const isPositive = change >= 0;

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className={cn('p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800', className)}>
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
        {title}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
          {formatValue(currentValue)}
        </p>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-success-600' : 'text-error-600'
            )}
          >
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-success-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-error-600" />
          )}
        </div>
      </div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
        {period}
      </p>
    </div>
  );
}

export default {
  MetricCard,
  ChartCard,
  ActivityFeed,
  QuickStatsRow,
  ProgressCard,
  ScheduleWidget,
  RealTimeWidget,
  PerformanceScore,
  TopContentWidget,
  NotificationWidget,
  MiniDonutChart,
  StatComparison,
};
