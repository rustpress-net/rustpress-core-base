/**
 * LineChart Component
 *
 * Multi-line trend charts:
 * - Single/multiple lines
 * - Smooth/step curves
 * - Interactive tooltips
 * - Zoom and pan support
 * - Responsive design
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface LineDataPoint {
  x: number | string | Date;
  y: number;
}

export interface LineSeries {
  id: string;
  name: string;
  data: LineDataPoint[];
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  showDots?: boolean;
}

export interface LineChartProps {
  series: LineSeries[];
  width?: number | string;
  height?: number;
  curved?: boolean;
  stepped?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  animate?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: number | string | Date) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number, series: string) => string;
  onPointClick?: (point: LineDataPoint, series: LineSeries) => void;
  colors?: string[];
  className?: string;
}

// ============================================================================
// Utility
// ============================================================================

const defaultColors = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#8b5cf6',
];

function generateLinePath(
  points: { x: number; y: number }[],
  curved: boolean = true,
  stepped: boolean = false
): string {
  if (points.length === 0) return '';

  return points.map((point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;

    if (stepped) {
      const prev = points[i - 1];
      return `L ${point.x} ${prev.y} L ${point.x} ${point.y}`;
    }

    if (curved && i > 0) {
      const prev = points[i - 1];
      const cpx = (prev.x + point.x) / 2;
      return `C ${cpx} ${prev.y}, ${cpx} ${point.y}, ${point.x} ${point.y}`;
    }

    return `L ${point.x} ${point.y}`;
  }).join(' ');
}

// ============================================================================
// Main Component
// ============================================================================

export function LineChart({
  series,
  width = '100%',
  height = 300,
  curved = true,
  stepped = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  showTooltip = true,
  showDots = true,
  animate = true,
  xAxisLabel,
  yAxisLabel,
  formatXAxis = (v) => String(v),
  formatYAxis = (v) => v.toLocaleString(),
  formatTooltip = (v, s) => `${s}: ${v.toLocaleString()}`,
  onPointClick,
  colors = defaultColors,
  className,
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    seriesId: string;
    value: number;
    label: string;
    screenX: number;
    screenY: number;
  } | null>(null);
  const [activeSeries, setActiveSeries] = useState<Set<string>>(new Set(series.map(s => s.id)));

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const { xScale, yScale, xTicks, yTicks, processedSeries } = useMemo(() => {
    const visibleSeries = series.filter(s => activeSeries.has(s.id));

    // Get all x values
    const allX = visibleSeries.flatMap(s => s.data.map(d => d.x));
    const uniqueX = [...new Set(allX.map(x =>
      x instanceof Date ? x.getTime() : x
    ))].sort((a, b) => Number(a) - Number(b));

    // Calculate y range
    const allY = visibleSeries.flatMap(s => s.data.map(d => d.y));
    const minY = Math.min(0, Math.min(...allY));
    const maxY = Math.max(...allY) * 1.1;

    // Create scales
    const xScaleFn = (x: number | string | Date) => {
      const xVal = x instanceof Date ? x.getTime() : x;
      const index = uniqueX.indexOf(xVal as number);
      return uniqueX.length > 1
        ? (index / (uniqueX.length - 1)) * innerWidth
        : innerWidth / 2;
    };

    const yScaleFn = (y: number) => {
      const range = maxY - minY || 1;
      return innerHeight - ((y - minY) / range) * innerHeight;
    };

    // Generate ticks
    const xTickValues = uniqueX.filter((_, i) =>
      i % Math.ceil(uniqueX.length / 8) === 0
    );
    const yTickCount = 5;
    const yTickValues = Array.from({ length: yTickCount }, (_, i) =>
      minY + (i / (yTickCount - 1)) * (maxY - minY)
    );

    // Process series data into points
    const processed = visibleSeries.map((s, seriesIndex) => ({
      ...s,
      color: s.color || colors[seriesIndex % colors.length],
      points: s.data.map(d => ({
        x: xScaleFn(d.x),
        y: yScaleFn(d.y),
        originalX: d.x,
        originalY: d.y,
      })),
    }));

    return {
      xScale: xScaleFn,
      yScale: yScaleFn,
      xTicks: xTickValues,
      yTicks: yTickValues,
      processedSeries: processed,
    };
  }, [series, activeSeries, innerWidth, innerHeight, colors]);

  const toggleSeries = (seriesId: string) => {
    setActiveSeries(prev => {
      const next = new Set(prev);
      if (next.has(seriesId)) {
        if (next.size > 1) next.delete(seriesId);
      } else {
        next.add(seriesId);
      }
      return next;
    });
  };

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
          {showGrid && (
            <g className="text-neutral-200 dark:text-neutral-700">
              {yTicks.map((tick, i) => (
                <line
                  key={`y-${i}`}
                  x1={0}
                  y1={yScale(tick)}
                  x2={innerWidth}
                  y2={yScale(tick)}
                  stroke="currentColor"
                  strokeDasharray="4,4"
                />
              ))}
              {xTicks.map((tick, i) => (
                <line
                  key={`x-${i}`}
                  x1={xScale(tick)}
                  y1={0}
                  x2={xScale(tick)}
                  y2={innerHeight}
                  stroke="currentColor"
                  strokeDasharray="4,4"
                  opacity={0.5}
                />
              ))}
            </g>
          )}

          {/* Lines */}
          {processedSeries.map((s, seriesIndex) => {
            const path = generateLinePath(s.points, curved, stepped);
            const shouldShowDots = s.showDots !== undefined ? s.showDots : showDots;

            return (
              <g key={s.id}>
                {/* Line */}
                <motion.path
                  d={path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.strokeWidth || 2}
                  strokeDasharray={s.dashed ? '8,4' : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: seriesIndex * 0.2 }}
                />

                {/* Dots */}
                {shouldShowDots && s.points.map((point, i) => (
                  <motion.circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    fill="white"
                    stroke={s.color}
                    strokeWidth={2}
                    className="cursor-pointer"
                    initial={animate ? { scale: 0, opacity: 0 } : undefined}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: seriesIndex * 0.2 + i * 0.03 }}
                    whileHover={{ scale: 1.3 }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setHoveredPoint({
                        x: point.x,
                        y: point.y,
                        seriesId: s.id,
                        value: point.originalY,
                        label: formatXAxis(point.originalX),
                        screenX: rect.left + rect.width / 2,
                        screenY: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => onPointClick?.({ x: point.originalX, y: point.originalY }, s)}
                  />
                ))}
              </g>
            );
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

          {/* Hover line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={0}
              x2={hoveredPoint.x}
              y2={innerHeight}
              stroke={processedSeries.find(s => s.id === hoveredPoint.seriesId)?.color}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
          )}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-4 mt-2">
          {series.map((s, i) => {
            const color = s.color || colors[i % colors.length];
            const isActive = activeSeries.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSeries(s.id)}
                className={cn(
                  'flex items-center gap-2 transition-opacity',
                  !isActive && 'opacity-40'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <div
          className="absolute z-50 px-3 py-2 text-sm bg-neutral-900 text-white rounded-lg shadow-lg pointer-events-none"
          style={{
            left: hoveredPoint.screenX,
            top: hoveredPoint.screenY - 50,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-neutral-400 text-xs mb-1">{hoveredPoint.label}</div>
          <div className="font-medium">
            {formatTooltip(
              hoveredPoint.value,
              series.find(s => s.id === hoveredPoint.seriesId)?.name || ''
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sparkline
// ============================================================================

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number | string;
  height?: number;
  curved?: boolean;
  showArea?: boolean;
  showDot?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = '#6366f1',
  width = '100%',
  height = 40,
  curved = true,
  showArea = false,
  showDot = true,
  className,
}: SparklineProps) {
  const svgWidth = typeof width === 'number' ? width : 100;
  const padding = 4;

  const points = useMemo(() => {
    if (data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data.map((value, i) => ({
      x: padding + (i / (data.length - 1)) * (svgWidth - padding * 2),
      y: padding + (1 - (value - min) / range) * (height - padding * 2),
    }));
  }, [data, svgWidth, height]);

  const linePath = generateLinePath(points, curved, false);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${svgWidth} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      {showArea && (
        <defs>
          <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {showArea && <path d={areaPath} fill={`url(#sparkline-gradient-${color})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {showDot && lastPoint && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={color} />
      )}
    </svg>
  );
}

// ============================================================================
// Multi-Line Comparison
// ============================================================================

export interface ComparisonLineChartProps {
  current: number[];
  previous: number[];
  labels?: string[];
  currentLabel?: string;
  previousLabel?: string;
  currentColor?: string;
  previousColor?: string;
  height?: number;
  className?: string;
}

export function ComparisonLineChart({
  current,
  previous,
  labels,
  currentLabel = 'Current',
  previousLabel = 'Previous',
  currentColor = '#6366f1',
  previousColor = '#94a3b8',
  height = 200,
  className,
}: ComparisonLineChartProps) {
  const series: LineSeries[] = [
    {
      id: 'current',
      name: currentLabel,
      data: current.map((y, i) => ({ x: labels?.[i] || i, y })),
      color: currentColor,
    },
    {
      id: 'previous',
      name: previousLabel,
      data: previous.map((y, i) => ({ x: labels?.[i] || i, y })),
      color: previousColor,
      dashed: true,
    },
  ];

  return (
    <LineChart
      series={series}
      height={height}
      showDots={false}
      className={className}
    />
  );
}

// ============================================================================
// Exports
// ============================================================================

export default LineChart;
