/**
 * RustPress Sparkline Chart Component
 * Real-time updating mini-charts with animations
 */

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { cn } from '../utils';
import { Card, CardBody } from './Card';

export interface SparklineChartProps {
  data: number[];
  label?: string;
  value?: number | string;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  height?: number;
  width?: number;
  showArea?: boolean;
  showPoints?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  live?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  className?: string;
}

// Color configurations
const colorConfig = {
  primary: {
    stroke: 'stroke-primary-500',
    fill: 'fill-primary-500/20',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
  },
  success: {
    stroke: 'stroke-success-500',
    fill: 'fill-success-500/20',
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
  },
  warning: {
    stroke: 'stroke-warning-500',
    fill: 'fill-warning-500/20',
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
  },
  error: {
    stroke: 'stroke-error-500',
    fill: 'fill-error-500/20',
    bg: 'bg-error-50 dark:bg-error-900/20',
    text: 'text-error-600 dark:text-error-400',
  },
  accent: {
    stroke: 'stroke-accent-500',
    fill: 'fill-accent-500/20',
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
  },
};

function generatePath(
  data: number[],
  width: number,
  height: number,
  smooth: boolean = true
): string {
  if (data.length < 2) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = height * 0.1;
  const effectiveHeight = height - padding * 2;

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: padding + effectiveHeight - ((value - min) / range) * effectiveHeight,
  }));

  if (!smooth) {
    return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }

  // Smooth curve using cubic bezier
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const prevPrev = points[i - 2];

    const cp1x = prev.x + (curr.x - (prevPrev?.x ?? prev.x)) / 4;
    const cp1y = prev.y + (curr.y - (prevPrev?.y ?? prev.y)) / 4;
    const cp2x = curr.x - (next?.x ?? curr.x - curr.x + prev.x) / 4 + (prev.x - curr.x) / 4;
    const cp2y = curr.y - (next?.y ?? curr.y - curr.y + prev.y) / 4 + (prev.y - curr.y) / 4;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

function generateAreaPath(
  data: number[],
  width: number,
  height: number
): string {
  if (data.length < 2) return '';

  const linePath = generatePath(data, width, height, true);
  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
}

export function SparklineChart({
  data,
  label,
  value,
  change,
  changeLabel,
  color = 'primary',
  height = 60,
  width = 200,
  showArea = true,
  showPoints = false,
  showTooltip = true,
  animated = true,
  live = false,
  refreshInterval = 5000,
  onRefresh,
  className,
}: SparklineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = colorConfig[color];

  // Auto-refresh for live data
  useEffect(() => {
    if (!live || !onRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [live, refreshInterval, onRefresh]);

  // Generate paths
  const linePath = useMemo(() => generatePath(data, width, height), [data, width, height]);
  const areaPath = useMemo(
    () => (showArea ? generateAreaPath(data, width, height) : ''),
    [data, width, height, showArea]
  );

  // Calculate point positions for hover
  const points = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = height * 0.1;
    const effectiveHeight = height - padding * 2;

    return data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: padding + effectiveHeight - ((value - min) / range) * effectiveHeight,
      value,
    }));
  }, [data, width, height]);

  // Change indicator
  const changeDirection = change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : null;
  const ChangeIcon = changeDirection === 'up' ? TrendingUp : changeDirection === 'down' ? TrendingDown : Minus;

  return (
    <Card className={cn('h-full', className)}>
      <CardBody className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            {label && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                {label}
              </p>
            )}
            {value !== undefined && (
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={String(value)}
                  initial={animated ? { opacity: 0, y: -10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-neutral-900 dark:text-white"
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </motion.span>
                {change !== undefined && (
                  <span
                    className={cn(
                      'flex items-center gap-0.5 text-sm font-medium',
                      changeDirection === 'up' && 'text-success-600 dark:text-success-400',
                      changeDirection === 'down' && 'text-error-600 dark:text-error-400',
                      changeDirection === 'neutral' && 'text-neutral-500'
                    )}
                  >
                    <ChangeIcon className="w-3.5 h-3.5" />
                    {Math.abs(change)}%
                    {changeLabel && (
                      <span className="text-neutral-400 ml-1">{changeLabel}</span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Live indicator */}
          {live && (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-success-500"
              />
              <span className="text-xs text-neutral-400">Live</span>
              {isRefreshing && (
                <RefreshCw className="w-3 h-3 text-neutral-400 animate-spin" />
              )}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1 relative">
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" className={colors.text} stopOpacity="0.3" />
                <stop offset="100%" className={colors.text} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            {showArea && areaPath && (
              <motion.path
                d={areaPath}
                fill={`url(#gradient-${color})`}
                initial={animated ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Line */}
            <motion.path
              d={linePath}
              fill="none"
              className={colors.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animated ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Points */}
            {showPoints &&
              points.map((point, index) => (
                <motion.circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === index ? 5 : 3}
                  className={cn(
                    colors.stroke,
                    'fill-white dark:fill-neutral-900',
                    'transition-all duration-150'
                  )}
                  strokeWidth="2"
                  initial={animated ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                />
              ))}

            {/* Hover areas */}
            {showTooltip &&
              points.map((point, index) => (
                <rect
                  key={`hover-${index}`}
                  x={point.x - width / (data.length * 2)}
                  y={0}
                  width={width / data.length}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-crosshair"
                />
              ))}

            {/* Hover point */}
            {hoveredIndex !== null && (
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r={6}
                className={cn(colors.stroke, 'fill-white dark:fill-neutral-900')}
                strokeWidth="2"
              />
            )}
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={cn(
                  'absolute px-2 py-1 rounded-lg',
                  'bg-neutral-900 dark:bg-white',
                  'text-white dark:text-neutral-900',
                  'text-xs font-medium',
                  'shadow-lg',
                  'pointer-events-none'
                )}
                style={{
                  left: Math.min(
                    Math.max(points[hoveredIndex].x - 20, 0),
                    width - 60
                  ),
                  top: points[hoveredIndex].y - 30,
                }}
              >
                {points[hoveredIndex].value.toLocaleString()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardBody>
    </Card>
  );
}

// Mini sparkline (no card wrapper)
export interface MiniSparklineProps {
  data: number[];
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  height?: number;
  width?: number;
  className?: string;
}

export function MiniSparkline({
  data,
  color = 'primary',
  height = 24,
  width = 80,
  className,
}: MiniSparklineProps) {
  const colors = colorConfig[color];
  const linePath = useMemo(() => generatePath(data, width, height, true), [data, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      <motion.path
        d={linePath}
        fill="none"
        className={colors.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </svg>
  );
}

// Sparkline with bar chart variant
export interface SparklineBarProps {
  data: number[];
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  height?: number;
  barWidth?: number;
  gap?: number;
  className?: string;
}

export function SparklineBar({
  data,
  color = 'primary',
  height = 40,
  barWidth = 6,
  gap = 2,
  className,
}: SparklineBarProps) {
  const colors = colorConfig[color];
  const max = Math.max(...data);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn('flex items-end gap-[2px]', className)} style={{ height }}>
      {data.map((value, index) => {
        const barHeight = max > 0 ? (value / max) * height : 0;
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: barHeight }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              'rounded-t transition-colors cursor-pointer',
              hoveredIndex === index
                ? colors.text.replace('text-', 'bg-')
                : 'bg-neutral-200 dark:bg-neutral-700'
            )}
            style={{ width: barWidth }}
            title={`${value}`}
          />
        );
      })}
    </div>
  );
}

export default SparklineChart;
