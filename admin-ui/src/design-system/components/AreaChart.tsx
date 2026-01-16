/**
 * AreaChart Component
 *
 * Stacked and filled area charts:
 * - Single/multiple series
 * - Stacked areas
 * - Gradient fills
 * - Interactive tooltips
 * - Responsive design
 * - Smooth animations
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface AreaDataPoint {
  x: number | string | Date;
  y: number;
}

export interface AreaSeries {
  id: string;
  name: string;
  data: AreaDataPoint[];
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface AreaChartProps {
  series: AreaSeries[];
  width?: number | string;
  height?: number;
  stacked?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  curved?: boolean;
  animate?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: number | string | Date) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number, series: string) => string;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const defaultColors = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
];

function generatePath(
  points: { x: number; y: number }[],
  width: number,
  height: number,
  curved: boolean = true
): string {
  if (points.length === 0) return '';

  const path = points.map((point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;

    if (curved && i > 0) {
      const prev = points[i - 1];
      const cpx = (prev.x + point.x) / 2;
      return `C ${cpx} ${prev.y}, ${cpx} ${point.y}, ${point.x} ${point.y}`;
    }

    return `L ${point.x} ${point.y}`;
  }).join(' ');

  return path;
}

function generateAreaPath(
  points: { x: number; y: number }[],
  baseY: number,
  curved: boolean = true
): string {
  if (points.length === 0) return '';

  const linePath = generatePath(points, 0, 0, curved);
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;

  return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

// ============================================================================
// Main Component
// ============================================================================

export function AreaChart({
  series,
  width = '100%',
  height = 300,
  stacked = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  showTooltip = true,
  showDots = false,
  curved = true,
  animate = true,
  xAxisLabel,
  yAxisLabel,
  formatXAxis = (v) => String(v),
  formatYAxis = (v) => v.toLocaleString(),
  formatTooltip = (v, s) => `${s}: ${v.toLocaleString()}`,
  className,
}: AreaChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    seriesId: string;
    value: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const { xScale, yScale, xTicks, yTicks, stackedData } = useMemo(() => {
    // Get all x values
    const allX = series.flatMap(s => s.data.map(d => d.x));
    const uniqueX = [...new Set(allX.map(x =>
      x instanceof Date ? x.getTime() : x
    ))].sort((a, b) => Number(a) - Number(b));

    // Calculate y range
    let minY = 0;
    let maxY = 0;

    if (stacked) {
      // For stacked, calculate cumulative max
      uniqueX.forEach((x) => {
        let sum = 0;
        series.forEach(s => {
          const point = s.data.find(d =>
            (d.x instanceof Date ? d.x.getTime() : d.x) === x
          );
          if (point) sum += point.y;
        });
        maxY = Math.max(maxY, sum);
      });
    } else {
      const allY = series.flatMap(s => s.data.map(d => d.y));
      maxY = Math.max(...allY);
      minY = Math.min(0, Math.min(...allY));
    }

    // Add padding to max
    maxY = maxY * 1.1;

    // Create scales
    const xScaleFn = (x: number | string | Date) => {
      const xVal = x instanceof Date ? x.getTime() : x;
      const index = uniqueX.indexOf(xVal as number);
      return (index / (uniqueX.length - 1)) * innerWidth;
    };

    const yScaleFn = (y: number) => {
      return innerHeight - ((y - minY) / (maxY - minY)) * innerHeight;
    };

    // Generate ticks
    const xTickValues = uniqueX.filter((_, i) =>
      i % Math.ceil(uniqueX.length / 6) === 0
    );
    const yTickCount = 5;
    const yTickValues = Array.from({ length: yTickCount }, (_, i) =>
      minY + (i / (yTickCount - 1)) * (maxY - minY)
    );

    // Calculate stacked data
    const stacked: Map<string, { x: number | string | Date; y0: number; y1: number }[]> = new Map();

    if (stacked) {
      series.forEach((s, seriesIndex) => {
        const points = s.data.map(d => {
          const xVal = d.x instanceof Date ? d.x.getTime() : d.x;
          let y0 = 0;

          // Sum previous series at this x
          for (let i = 0; i < seriesIndex; i++) {
            const prevPoint = series[i].data.find(pd =>
              (pd.x instanceof Date ? pd.x.getTime() : pd.x) === xVal
            );
            if (prevPoint) y0 += prevPoint.y;
          }

          return { x: d.x, y0, y1: y0 + d.y };
        });
        stacked.set(s.id, points);
      });
    }

    return {
      xScale: xScaleFn,
      yScale: yScaleFn,
      xTicks: xTickValues,
      yTicks: yTickValues,
      stackedData: stacked,
    };
  }, [series, innerWidth, innerHeight, stacked]);

  // Generate gradient IDs
  const gradientIds = useMemo(() => {
    return series.reduce((acc, s, i) => {
      acc[s.id] = `area-gradient-${s.id}-${i}`;
      return acc;
    }, {} as Record<string, string>);
  }, [series]);

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Gradients */}
        <defs>
          {series.map((s, i) => {
            const color = s.color || defaultColors[i % defaultColors.length];
            return (
              <linearGradient
                key={gradientIds[s.id]}
                id={gradientIds[s.id]}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={s.gradientFrom || color}
                  stopOpacity={0.6}
                />
                <stop
                  offset="100%"
                  stopColor={s.gradientTo || color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            );
          })}
        </defs>

        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
          {showGrid && (
            <g className="text-neutral-200 dark:text-neutral-700">
              {yTicks.map((tick, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={yScale(tick)}
                  x2={innerWidth}
                  y2={yScale(tick)}
                  stroke="currentColor"
                  strokeDasharray="4,4"
                />
              ))}
            </g>
          )}

          {/* Areas */}
          {series.map((s, seriesIndex) => {
            const color = s.color || defaultColors[seriesIndex % defaultColors.length];
            let points: { x: number; y: number }[];

            if (stacked && stackedData.has(s.id)) {
              const data = stackedData.get(s.id)!;
              points = data.map(d => ({
                x: xScale(d.x),
                y: yScale(d.y1),
              }));

              // Create area with bottom from previous series
              const bottomPoints = [...data].reverse().map(d => ({
                x: xScale(d.x),
                y: yScale(d.y0),
              }));

              const topPath = generatePath(points, innerWidth, innerHeight, curved);
              const bottomPath = points.length > 0
                ? bottomPoints.map((p, i) =>
                    i === 0 ? `L ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                  ).join(' ')
                : '';

              return (
                <g key={s.id}>
                  <motion.path
                    d={`${topPath} ${bottomPath} Z`}
                    fill={`url(#${gradientIds[s.id]})`}
                    initial={animate ? { opacity: 0 } : undefined}
                    animate={{ opacity: 1 }}
                    transition={{ delay: seriesIndex * 0.1 }}
                  />
                  <motion.path
                    d={topPath}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    initial={animate ? { pathLength: 0 } : undefined}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: seriesIndex * 0.1 }}
                  />
                </g>
              );
            } else {
              points = s.data.map(d => ({
                x: xScale(d.x),
                y: yScale(d.y),
              }));

              const linePath = generatePath(points, innerWidth, innerHeight, curved);
              const areaPath = generateAreaPath(points, innerHeight, curved);

              return (
                <g key={s.id}>
                  <motion.path
                    d={areaPath}
                    fill={`url(#${gradientIds[s.id]})`}
                    initial={animate ? { opacity: 0 } : undefined}
                    animate={{ opacity: 1 }}
                    transition={{ delay: seriesIndex * 0.1 }}
                  />
                  <motion.path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    initial={animate ? { pathLength: 0 } : undefined}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: seriesIndex * 0.1 }}
                  />
                  {showDots && points.map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={4}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                      initial={animate ? { scale: 0 } : undefined}
                      animate={{ scale: 1 }}
                      transition={{ delay: seriesIndex * 0.1 + i * 0.02 }}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGElement).getBoundingClientRect();
                        setHoveredPoint({
                          x: i,
                          seriesId: s.id,
                          value: s.data[i].y,
                          screenX: rect.left + rect.width / 2,
                          screenY: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </g>
              );
            }
          })}

          {/* X Axis */}
          {showXAxis && (
            <g transform={`translate(0, ${innerHeight})`}>
              <line x1={0} y1={0} x2={innerWidth} y2={0} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
              {xTicks.map((tick, i) => {
                const x = xScale(tick);
                return (
                  <g key={i} transform={`translate(${x}, 0)`}>
                    <line y1={0} y2={6} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
                    <text
                      y={20}
                      textAnchor="middle"
                      className="text-xs fill-neutral-500"
                    >
                      {formatXAxis(tick)}
                    </text>
                  </g>
                );
              })}
              {xAxisLabel && (
                <text
                  x={innerWidth / 2}
                  y={35}
                  textAnchor="middle"
                  className="text-xs fill-neutral-500"
                >
                  {xAxisLabel}
                </text>
              )}
            </g>
          )}

          {/* Y Axis */}
          {showYAxis && (
            <g>
              <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
              {yTicks.map((tick, i) => {
                const y = yScale(tick);
                return (
                  <g key={i} transform={`translate(0, ${y})`}>
                    <line x1={-6} x2={0} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
                    <text
                      x={-10}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      className="text-xs fill-neutral-500"
                    >
                      {formatYAxis(tick)}
                    </text>
                  </g>
                );
              })}
              {yAxisLabel && (
                <text
                  transform={`translate(-35, ${innerHeight / 2}) rotate(-90)`}
                  textAnchor="middle"
                  className="text-xs fill-neutral-500"
                >
                  {yAxisLabel}
                </text>
              )}
            </g>
          )}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-4 mt-2">
          {series.map((s, i) => {
            const color = s.color || defaultColors[i % defaultColors.length];
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <div
          className="absolute z-50 px-2 py-1 text-xs font-medium bg-neutral-900 text-white rounded shadow-lg pointer-events-none"
          style={{
            left: hoveredPoint.screenX,
            top: hoveredPoint.screenY - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {formatTooltip(
            hoveredPoint.value,
            series.find(s => s.id === hoveredPoint.seriesId)?.name || ''
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Area Chart
// ============================================================================

export interface SimpleAreaChartProps {
  data: number[];
  color?: string;
  height?: number;
  showFill?: boolean;
  className?: string;
}

export function SimpleAreaChart({
  data,
  color = '#6366f1',
  height = 60,
  showFill = true,
  className,
}: SimpleAreaChartProps) {
  const width = 200;
  const padding = 2;

  const points = useMemo(() => {
    if (data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data.map((value, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: padding + (1 - (value - min) / range) * (height - padding * 2),
    }));
  }, [data, width, height]);

  const linePath = generatePath(points, width, height, true);
  const areaPath = generateAreaPath(points, height - padding, true);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        <linearGradient id={`simple-area-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {showFill && (
        <path d={areaPath} fill={`url(#simple-area-${color})`} />
      )}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

// ============================================================================
// Stacked Area Chart
// ============================================================================

export interface StackedAreaChartProps extends Omit<AreaChartProps, 'stacked'> {}

export function StackedAreaChart(props: StackedAreaChartProps) {
  return <AreaChart {...props} stacked />;
}

// ============================================================================
// Exports
// ============================================================================

export default AreaChart;
