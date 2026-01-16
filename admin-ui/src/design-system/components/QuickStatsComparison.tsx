/**
 * RustPress Quick Stats Comparison Component
 * Compare metrics between two time periods (e.g., this week vs last week)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  MessageSquare,
  FileText,
  MousePointer,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';

// Stat configuration
interface StatConfig {
  key: string;
  label: string;
  icon: React.ElementType;
  format?: (value: number) => string;
  color: string;
}

const defaultStats: StatConfig[] = [
  {
    key: 'views',
    label: 'Page Views',
    icon: Eye,
    format: (v) => v.toLocaleString(),
    color: 'primary',
  },
  {
    key: 'visitors',
    label: 'Visitors',
    icon: Users,
    format: (v) => v.toLocaleString(),
    color: 'success',
  },
  {
    key: 'comments',
    label: 'Comments',
    icon: MessageSquare,
    format: (v) => v.toLocaleString(),
    color: 'warning',
  },
  {
    key: 'posts',
    label: 'New Posts',
    icon: FileText,
    format: (v) => v.toLocaleString(),
    color: 'accent',
  },
];

export interface QuickStatsComparisonProps {
  thisWeek: Record<string, number>;
  lastWeek: Record<string, number>;
  stats?: StatConfig[];
  title?: string;
  thisWeekLabel?: string;
  lastWeekLabel?: string;
  className?: string;
}

// Color classes mapping
const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-600 dark:text-primary-400',
    icon: 'text-primary-500',
  },
  success: {
    bg: 'bg-success-100 dark:bg-success-900/30',
    text: 'text-success-600 dark:text-success-400',
    icon: 'text-success-500',
  },
  warning: {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    text: 'text-warning-600 dark:text-warning-400',
    icon: 'text-warning-500',
  },
  error: {
    bg: 'bg-error-100 dark:bg-error-900/30',
    text: 'text-error-600 dark:text-error-400',
    icon: 'text-error-500',
  },
  accent: {
    bg: 'bg-accent-100 dark:bg-accent-900/30',
    text: 'text-accent-600 dark:text-accent-400',
    icon: 'text-accent-500',
  },
};

// Calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Stat comparison row
interface StatRowProps {
  stat: StatConfig;
  currentValue: number;
  previousValue: number;
  index: number;
}

function StatRow({ stat, currentValue, previousValue, index }: StatRowProps) {
  const change = calculateChange(currentValue, previousValue);
  const changeDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const ChangeIcon = changeDirection === 'up' ? TrendingUp : changeDirection === 'down' ? TrendingDown : Minus;
  const colors = colorClasses[stat.color] || colorClasses.primary;
  const Icon = stat.icon;
  const format = stat.format || ((v: number) => v.toString());

  // Progress bar width (relative to current value)
  const maxValue = Math.max(currentValue, previousValue);
  const currentWidth = maxValue > 0 ? (currentValue / maxValue) * 100 : 0;
  const previousWidth = maxValue > 0 ? (previousValue / maxValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <Icon className={cn('w-4 h-4', colors.icon)} />
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {stat.label}
          </span>
        </div>

        {/* Change badge */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            changeDirection === 'up' && 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
            changeDirection === 'down' && 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
            changeDirection === 'neutral' && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          )}
        >
          <ChangeIcon className="w-3 h-3" />
          {change > 0 && '+'}
          {change}%
        </div>
      </div>

      {/* Comparison bars */}
      <div className="space-y-2">
        {/* This week */}
        <div className="flex items-center gap-3">
          <div className="w-16 text-xs text-neutral-500 dark:text-neutral-400">This week</div>
          <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentWidth}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className={cn('h-full rounded-full', colors.text.replace('text-', 'bg-'))}
            />
          </div>
          <div className="w-16 text-right text-sm font-semibold text-neutral-900 dark:text-white">
            {format(currentValue)}
          </div>
        </div>

        {/* Last week */}
        <div className="flex items-center gap-3">
          <div className="w-16 text-xs text-neutral-500 dark:text-neutral-400">Last week</div>
          <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${previousWidth}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="h-full rounded-full bg-neutral-300 dark:bg-neutral-600"
            />
          </div>
          <div className="w-16 text-right text-sm text-neutral-500 dark:text-neutral-400">
            {format(previousValue)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function QuickStatsComparison({
  thisWeek,
  lastWeek,
  stats = defaultStats,
  title = 'Week over Week',
  thisWeekLabel = 'This Week',
  lastWeekLabel = 'Last Week',
  className,
}: QuickStatsComparisonProps) {
  // Calculate overall change
  const totalThisWeek = Object.values(thisWeek).reduce((a, b) => a + b, 0);
  const totalLastWeek = Object.values(lastWeek).reduce((a, b) => a + b, 0);
  const overallChange = calculateChange(totalThisWeek, totalLastWeek);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {thisWeekLabel} vs {lastWeekLabel}
            </p>
          </div>

          {/* Overall trend indicator */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl',
              overallChange >= 0
                ? 'bg-success-50 dark:bg-success-900/20'
                : 'bg-error-50 dark:bg-error-900/20'
            )}
          >
            {overallChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-error-500" />
            )}
            <span
              className={cn(
                'text-sm font-semibold',
                overallChange >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              )}
            >
              {overallChange > 0 && '+'}
              {overallChange}%
            </span>
            <span className="text-xs text-neutral-500">overall</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {stats.map((stat, index) => (
          <StatRow
            key={stat.key}
            stat={stat}
            currentValue={thisWeek[stat.key] || 0}
            previousValue={lastWeek[stat.key] || 0}
            index={index}
          />
        ))}
      </CardBody>
    </Card>
  );
}

// Compact version for smaller spaces
export interface CompactStatsComparisonProps {
  thisWeek: Record<string, number>;
  lastWeek: Record<string, number>;
  stats?: StatConfig[];
  className?: string;
}

export function CompactStatsComparison({
  thisWeek,
  lastWeek,
  stats = defaultStats,
  className,
}: CompactStatsComparisonProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {stats.map((stat, index) => {
        const currentValue = thisWeek[stat.key] || 0;
        const previousValue = lastWeek[stat.key] || 0;
        const change = calculateChange(currentValue, previousValue);
        const changeDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
        const ChangeIcon = changeDirection === 'up' ? TrendingUp : changeDirection === 'down' ? TrendingDown : Minus;
        const Icon = stat.icon;
        const colors = colorClasses[stat.color] || colorClasses.primary;
        const format = stat.format || ((v: number) => v.toString());

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'p-4 rounded-xl',
              'bg-neutral-50 dark:bg-neutral-800/50',
              'border border-neutral-100 dark:border-neutral-700'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn('w-4 h-4', colors.icon)} />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                {format(currentValue)}
              </span>

              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs',
                  changeDirection === 'up' && 'text-success-600 dark:text-success-400',
                  changeDirection === 'down' && 'text-error-600 dark:text-error-400',
                  changeDirection === 'neutral' && 'text-neutral-500'
                )}
              >
                <ChangeIcon className="w-3 h-3" />
                {change > 0 && '+'}
                {change}%
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default QuickStatsComparison;
