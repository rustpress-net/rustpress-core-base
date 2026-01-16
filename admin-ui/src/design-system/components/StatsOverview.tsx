/**
 * RustPress Stats Overview Component
 * Comprehensive statistics display with trends and comparisons
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Info,
  MoreHorizontal,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  sparklineData?: number[];
  link?: { label: string; href: string; onClick?: () => void };
}

export interface StatsOverviewProps {
  stats: StatItem[];
  title?: string;
  subtitle?: string;
  dateRange?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  variant?: 'cards' | 'inline' | 'compact' | 'detailed';
  showTrends?: boolean;
  showSparklines?: boolean;
  animateValues?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Color Configuration
// ============================================================================

const colorConfig = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    icon: 'text-primary-500',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    icon: 'text-success-500',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    icon: 'text-warning-500',
  },
  error: {
    bg: 'bg-error-50 dark:bg-error-900/20',
    text: 'text-error-600 dark:text-error-400',
    icon: 'text-error-500',
  },
  neutral: {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-600 dark:text-neutral-400',
    icon: 'text-neutral-500',
  },
};

// ============================================================================
// Number Formatting
// ============================================================================

function formatNumber(value: number | string, prefix?: string, suffix?: string): string {
  if (typeof value === 'string') return `${prefix || ''}${value}${suffix || ''}`;

  let formatted: string;
  if (Math.abs(value) >= 1000000) {
    formatted = `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    formatted = `${(value / 1000).toFixed(1)}K`;
  } else if (Number.isInteger(value)) {
    formatted = value.toLocaleString();
  } else {
    formatted = value.toFixed(2);
  }

  return `${prefix || ''}${formatted}${suffix || ''}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

// ============================================================================
// Mini Sparkline
// ============================================================================

interface MiniSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

function MiniSparkline({ data, color = '#6366f1', width = 60, height = 20 }: MiniSparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Trend Indicator
// ============================================================================

interface TrendIndicatorProps {
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  showValue?: boolean;
}

function TrendIndicator({ change, changeType, showValue = true }: TrendIndicatorProps) {
  const type = changeType || (change !== undefined ? (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral') : 'neutral');

  const config = {
    increase: {
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-success-600 dark:text-success-400',
      bg: 'bg-success-50 dark:bg-success-900/20',
    },
    decrease: {
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-error-600 dark:text-error-400',
      bg: 'bg-error-50 dark:bg-error-900/20',
    },
    neutral: {
      icon: <Minus className="w-4 h-4" />,
      color: 'text-neutral-500 dark:text-neutral-400',
      bg: 'bg-neutral-100 dark:bg-neutral-800',
    },
  };

  const { icon, color, bg } = config[type];

  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium', bg, color)}>
      {icon}
      {showValue && change !== undefined && formatChange(change)}
    </span>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  stat: StatItem;
  showTrend?: boolean;
  showSparkline?: boolean;
  animate?: boolean;
  variant: 'cards' | 'inline' | 'compact' | 'detailed';
}

function StatCard({ stat, showTrend, showSparkline, animate, variant }: StatCardProps) {
  const colors = colorConfig[stat.color || 'neutral'];

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {stat.icon && (
            <span className={colors.icon}>{stat.icon}</span>
          )}
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {stat.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {formatNumber(stat.value, stat.prefix, stat.suffix)}
          </span>
          {showTrend && stat.change !== undefined && (
            <TrendIndicator change={stat.change} changeType={stat.changeType} showValue={false} />
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4 py-3">
        {stat.icon && (
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <span className={colors.icon}>{stat.icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              {formatNumber(stat.value, stat.prefix, stat.suffix)}
            </p>
            {showTrend && stat.change !== undefined && (
              <TrendIndicator change={stat.change} changeType={stat.changeType} />
            )}
          </div>
        </div>
        {showSparkline && stat.sparklineData && (
          <MiniSparkline data={stat.sparklineData} color={stat.changeType === 'decrease' ? '#ef4444' : '#22c55e'} />
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 20 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        className={cn(
          'p-5 rounded-xl',
          'bg-white dark:bg-neutral-900',
          'border border-neutral-200 dark:border-neutral-800'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {stat.icon && (
              <div className={cn('p-2.5 rounded-xl', colors.bg)}>
                <span className={colors.icon}>{stat.icon}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </p>
              {stat.description && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {stat.description}
                </p>
              )}
            </div>
          </div>
          <button className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {formatNumber(stat.value, stat.prefix, stat.suffix)}
            </p>
            {stat.unit && (
              <p className="text-xs text-neutral-500 mt-1">{stat.unit}</p>
            )}
          </div>

          <div className="text-right">
            {showTrend && stat.change !== undefined && (
              <TrendIndicator change={stat.change} changeType={stat.changeType} />
            )}
            {stat.previousValue !== undefined && (
              <p className="text-xs text-neutral-400 mt-1">
                vs {formatNumber(stat.previousValue, stat.prefix, stat.suffix)}
              </p>
            )}
          </div>
        </div>

        {showSparkline && stat.sparklineData && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <MiniSparkline
              data={stat.sparklineData}
              width={200}
              height={40}
              color={stat.changeType === 'decrease' ? '#ef4444' : '#22c55e'}
            />
          </div>
        )}

        {stat.link && (
          <a
            href={stat.link.href}
            onClick={stat.link.onClick}
            className="mt-4 flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {stat.link.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </motion.div>
    );
  }

  // Default: cards variant
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      className={cn(
        'p-4 rounded-xl',
        'bg-white dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-800'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {stat.label}
        </p>
        {stat.icon && (
          <span className={colors.icon}>{stat.icon}</span>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatNumber(stat.value, stat.prefix, stat.suffix)}
          </p>
          {stat.unit && (
            <p className="text-xs text-neutral-400 mt-0.5">{stat.unit}</p>
          )}
        </div>

        {showTrend && stat.change !== undefined && (
          <TrendIndicator change={stat.change} changeType={stat.changeType} />
        )}
      </div>

      {showSparkline && stat.sparklineData && (
        <div className="mt-3">
          <MiniSparkline
            data={stat.sparklineData}
            width={120}
            height={24}
            color={stat.changeType === 'decrease' ? '#ef4444' : '#22c55e'}
          />
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Stats Overview Component
// ============================================================================

export function StatsOverview({
  stats,
  title,
  subtitle,
  dateRange,
  columns = 4,
  variant = 'cards',
  showTrends = true,
  showSparklines = false,
  animateValues = true,
  onRefresh,
  onExport,
  isLoading = false,
  className,
}: StatsOverviewProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const containerClass = variant === 'compact' || variant === 'inline'
    ? 'divide-y divide-neutral-200 dark:divide-neutral-700'
    : cn('grid gap-4', gridCols[columns]);

  return (
    <div className={className}>
      {/* Header */}
      {(title || onRefresh || onExport) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dateRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400">
                <Calendar className="w-4 h-4" />
                {dateRange}
              </span>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={cn(
                  'p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  isLoading && 'animate-spin'
                )}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className={cn(
                  'p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {variant === 'compact' || variant === 'inline' ? (
        <div className={cn(
          'rounded-xl',
          'bg-white dark:bg-neutral-900',
          'border border-neutral-200 dark:border-neutral-800',
          'px-4'
        )}>
          <div className={containerClass}>
            {stats.map((stat, index) => (
              <StatCard
                key={stat.id}
                stat={stat}
                showTrend={showTrends}
                showSparkline={showSparklines}
                animate={animateValues}
                variant={variant}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={containerClass}>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              showTrend={showTrends}
              showSparkline={showSparklines}
              animate={animateValues}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Quick Stats Bar (horizontal inline stats)
// ============================================================================

export interface QuickStatsBarProps {
  stats: { label: string; value: string | number; change?: number }[];
  className?: string;
}

export function QuickStatsBar({ stats, className }: QuickStatsBarProps) {
  return (
    <div className={cn('flex items-center gap-6 py-2', className)}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 && (
            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {stat.label}:
            </span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </span>
            {stat.change !== undefined && (
              <TrendIndicator change={stat.change} showValue />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================================
// Comparison Stats (before/after)
// ============================================================================

export interface ComparisonStatsProps {
  current: { label: string; value: number; prefix?: string; suffix?: string };
  previous: { label: string; value: number; prefix?: string; suffix?: string };
  title?: string;
  className?: string;
}

export function ComparisonStats({ current, previous, title, className }: ComparisonStatsProps) {
  const change = previous.value !== 0
    ? ((current.value - previous.value) / previous.value) * 100
    : 0;

  return (
    <div className={cn('p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800', className)}>
      {title && (
        <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
          {title}
        </h3>
      )}

      <div className="flex items-center justify-between gap-6">
        <div className="text-center flex-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            {previous.label}
          </p>
          <p className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">
            {formatNumber(previous.value, previous.prefix, previous.suffix)}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <ArrowRight className="w-5 h-5 text-neutral-300" />
          <TrendIndicator change={change} />
        </div>

        <div className="text-center flex-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            {current.label}
          </p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">
            {formatNumber(current.value, current.prefix, current.suffix)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatsOverview;
