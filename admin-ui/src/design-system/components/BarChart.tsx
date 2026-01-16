/**
 * BarChart Component
 *
 * Horizontal and vertical bar charts:
 * - Single/grouped/stacked bars
 * - Horizontal and vertical orientations
 * - Animated transitions
 * - Interactive tooltips
 * - Responsive design
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface BarDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarGroup {
  label: string;
  values: { key: string; value: number; color?: string }[];
}

export interface BarChartProps {
  data: BarDataItem[] | BarGroup[];
  orientation?: 'vertical' | 'horizontal';
  grouped?: boolean;
  stacked?: boolean;
  width?: number | string;
  height?: number;
  barWidth?: number;
  barGap?: number;
  groupGap?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  formatValue?: (value: number) => string;
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
  '#14b8a6',
  '#f97316',
];

// ============================================================================
// Main Component
// ============================================================================

export function BarChart({
  data,
  orientation = 'vertical',
  grouped = false,
  stacked = false,
  width = '100%',
  height = 300,
  barWidth = 32,
  barGap = 4,
  groupGap = 16,
  showGrid = true,
  showLabels = true,
  showValues = true,
  showLegend = false,
  showTooltip = true,
  animate = true,
  formatValue = (v) => v.toLocaleString(),
  colors = defaultColors,
  className,
}: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{
    label: string;
    key?: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const isGroupedData = (d: BarDataItem[] | BarGroup[]): d is BarGroup[] => {
    return d.length > 0 && 'values' in d[0];
  };

  const padding = { top: 20, right: 20, bottom: 50, left: 60 };
  const chartWidth = typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales and bars
  const { bars, maxValue, legendItems } = useMemo(() => {
    const barsResult: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      label: string;
      key?: string;
      value: number;
    }> = [];
    let max = 0;
    const legend: Array<{ key: string; color: string }> = [];

    if (isGroupedData(data)) {
      // Grouped or stacked data
      const keys = new Set<string>();
      data.forEach(group => group.values.forEach(v => keys.add(v.key)));
      const keyArray = Array.from(keys);

      keyArray.forEach((key, i) => {
        legend.push({ key, color: colors[i % colors.length] });
      });

      if (stacked) {
        // Stacked bars
        data.forEach((group, groupIndex) => {
          let cumulative = 0;
          group.values.forEach((item) => {
            max = Math.max(max, cumulative + item.value);
            cumulative += item.value;
          });
        });

        data.forEach((group, groupIndex) => {
          let cumulative = 0;
          const groupX = groupIndex * (barWidth + groupGap);

          group.values.forEach((item, itemIndex) => {
            const color = item.color || colors[keyArray.indexOf(item.key) % colors.length];

            if (orientation === 'vertical') {
              const barHeight = (item.value / max) * innerHeight;
              const y = innerHeight - cumulative / max * innerHeight - barHeight;

              barsResult.push({
                x: groupX,
                y,
                width: barWidth,
                height: barHeight,
                color,
                label: group.label,
                key: item.key,
                value: item.value,
              });
            } else {
              const barW = (item.value / max) * innerWidth;
              const x = cumulative / max * innerWidth;

              barsResult.push({
                x,
                y: groupIndex * (barWidth + groupGap),
                width: barW,
                height: barWidth,
                color,
                label: group.label,
                key: item.key,
                value: item.value,
              });
            }

            cumulative += item.value;
          });
        });
      } else {
        // Grouped bars
        data.forEach(group => {
          group.values.forEach(v => {
            max = Math.max(max, v.value);
          });
        });

        const barsPerGroup = keyArray.length;
        const totalBarWidth = barWidth * barsPerGroup + barGap * (barsPerGroup - 1);

        data.forEach((group, groupIndex) => {
          const groupX = groupIndex * (totalBarWidth + groupGap);

          group.values.forEach((item, itemIndex) => {
            const color = item.color || colors[keyArray.indexOf(item.key) % colors.length];
            const barX = groupX + itemIndex * (barWidth + barGap);

            if (orientation === 'vertical') {
              const barHeight = (item.value / max) * innerHeight;

              barsResult.push({
                x: barX,
                y: innerHeight - barHeight,
                width: barWidth,
                height: barHeight,
                color,
                label: group.label,
                key: item.key,
                value: item.value,
              });
            } else {
              const barW = (item.value / max) * innerWidth;

              barsResult.push({
                x: 0,
                y: barX,
                width: barW,
                height: barWidth,
                color,
                label: group.label,
                key: item.key,
                value: item.value,
              });
            }
          });
        });
      }
    } else {
      // Simple bar data
      data.forEach(item => {
        max = Math.max(max, item.value);
      });

      data.forEach((item, index) => {
        const color = item.color || colors[index % colors.length];

        if (orientation === 'vertical') {
          const barHeight = (item.value / max) * innerHeight;
          const x = index * (barWidth + barGap);

          barsResult.push({
            x,
            y: innerHeight - barHeight,
            width: barWidth,
            height: barHeight,
            color,
            label: item.label,
            value: item.value,
          });
        } else {
          const barW = (item.value / max) * innerWidth;
          const y = index * (barWidth + barGap);

          barsResult.push({
            x: 0,
            y,
            width: barW,
            height: barWidth,
            color,
            label: item.label,
            value: item.value,
          });
        }
      });
    }

    return { bars: barsResult, maxValue: max, legendItems: legend };
  }, [data, orientation, stacked, barWidth, barGap, groupGap, innerWidth, innerHeight, colors]);

  // Generate tick values
  const ticks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, i) => (i / (tickCount - 1)) * maxValue);
  }, [maxValue]);

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid */}
          {showGrid && (
            <g className="text-neutral-200 dark:text-neutral-700">
              {ticks.map((tick, i) => {
                if (orientation === 'vertical') {
                  const y = innerHeight - (tick / maxValue) * innerHeight;
                  return (
                    <line
                      key={i}
                      x1={0}
                      y1={y}
                      x2={innerWidth}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="4,4"
                    />
                  );
                } else {
                  const x = (tick / maxValue) * innerWidth;
                  return (
                    <line
                      key={i}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={innerHeight}
                      stroke="currentColor"
                      strokeDasharray="4,4"
                    />
                  );
                }
              })}
            </g>
          )}

          {/* Bars */}
          {bars.map((bar, index) => (
            <motion.rect
              key={`${bar.label}-${bar.key || index}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={4}
              fill={bar.color}
              initial={animate ? (orientation === 'vertical' ? { height: 0, y: innerHeight } : { width: 0 }) : undefined}
              animate={orientation === 'vertical' ? { height: bar.height, y: bar.y } : { width: bar.width }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onMouseEnter={(e) => {
                const rect = (e.target as SVGElement).getBoundingClientRect();
                setHoveredBar({
                  label: bar.label,
                  key: bar.key,
                  value: bar.value,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredBar(null)}
            />
          ))}

          {/* Value labels */}
          {showValues && bars.map((bar, index) => (
            <motion.text
              key={`value-${bar.label}-${bar.key || index}`}
              x={orientation === 'vertical' ? bar.x + bar.width / 2 : bar.width + 5}
              y={orientation === 'vertical' ? bar.y - 5 : bar.y + bar.height / 2}
              textAnchor={orientation === 'vertical' ? 'middle' : 'start'}
              alignmentBaseline={orientation === 'vertical' ? 'auto' : 'middle'}
              className="text-xs fill-neutral-600 dark:fill-neutral-400"
              initial={animate ? { opacity: 0 } : undefined}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              {formatValue(bar.value)}
            </motion.text>
          ))}

          {/* Axis */}
          {orientation === 'vertical' ? (
            <>
              {/* Y Axis */}
              <g>
                {ticks.map((tick, i) => {
                  const y = innerHeight - (tick / maxValue) * innerHeight;
                  return (
                    <text
                      key={i}
                      x={-10}
                      y={y}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      className="text-xs fill-neutral-500"
                    >
                      {formatValue(tick)}
                    </text>
                  );
                })}
              </g>

              {/* X Axis labels */}
              {showLabels && (
                <g transform={`translate(0, ${innerHeight})`}>
                  {!isGroupedData(data) && data.map((item, i) => (
                    <text
                      key={i}
                      x={i * (barWidth + barGap) + barWidth / 2}
                      y={20}
                      textAnchor="middle"
                      className="text-xs fill-neutral-500"
                    >
                      {item.label}
                    </text>
                  ))}
                  {isGroupedData(data) && data.map((group, i) => {
                    const keysCount = group.values.length;
                    const totalWidth = stacked ? barWidth : barWidth * keysCount + barGap * (keysCount - 1);
                    const x = i * (totalWidth + groupGap) + totalWidth / 2;
                    return (
                      <text
                        key={i}
                        x={x}
                        y={20}
                        textAnchor="middle"
                        className="text-xs fill-neutral-500"
                      >
                        {group.label}
                      </text>
                    );
                  })}
                </g>
              )}
            </>
          ) : (
            <>
              {/* X Axis */}
              <g transform={`translate(0, ${innerHeight})`}>
                {ticks.map((tick, i) => {
                  const x = (tick / maxValue) * innerWidth;
                  return (
                    <text
                      key={i}
                      x={x}
                      y={20}
                      textAnchor="middle"
                      className="text-xs fill-neutral-500"
                    >
                      {formatValue(tick)}
                    </text>
                  );
                })}
              </g>

              {/* Y Axis labels */}
              {showLabels && (
                <g>
                  {!isGroupedData(data) && data.map((item, i) => (
                    <text
                      key={i}
                      x={-10}
                      y={i * (barWidth + barGap) + barWidth / 2}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      className="text-xs fill-neutral-500"
                    >
                      {item.label}
                    </text>
                  ))}
                </g>
              )}
            </>
          )}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && legendItems.length > 0 && (
        <div className="flex justify-center gap-4 mt-2">
          {legendItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {item.key}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredBar && (
        <div
          className="absolute z-50 px-2 py-1 text-xs font-medium bg-neutral-900 text-white rounded shadow-lg pointer-events-none"
          style={{
            left: hoveredBar.x,
            top: hoveredBar.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {hoveredBar.key ? `${hoveredBar.label} - ${hoveredBar.key}: ` : `${hoveredBar.label}: `}
          {formatValue(hoveredBar.value)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Horizontal Bar Chart
// ============================================================================

export interface HorizontalBarChartProps extends Omit<BarChartProps, 'orientation'> {}

export function HorizontalBarChart(props: HorizontalBarChartProps) {
  return <BarChart {...props} orientation="horizontal" />;
}

// ============================================================================
// Progress Bar
// ============================================================================

export interface ProgressBarChartProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  label?: string;
  formatValue?: (value: number, max: number) => string;
  animate?: boolean;
  className?: string;
}

export function ProgressBarChart({
  value,
  max = 100,
  color = '#6366f1',
  height = 24,
  showLabel = true,
  showValue = true,
  label,
  formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
  animate = true,
  className,
}: ProgressBarChartProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || showValue) && (
        <div className="flex justify-between mb-1">
          {showLabel && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-neutral-500">
              {formatValue(value, max)}
            </span>
          )}
        </div>
      )}
      <div
        className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={animate ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Mini Bar Chart
// ============================================================================

export interface MiniBarChartProps {
  data: number[];
  color?: string;
  height?: number;
  barWidth?: number;
  gap?: number;
  className?: string;
}

export function MiniBarChart({
  data,
  color = '#6366f1',
  height = 40,
  barWidth = 8,
  gap = 2,
  className,
}: MiniBarChartProps) {
  const max = Math.max(...data);
  const width = data.length * (barWidth + gap) - gap;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {data.map((value, i) => {
        const barHeight = (value / max) * height;
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill={color}
            opacity={0.6 + (value / max) * 0.4}
          />
        );
      })}
    </svg>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default BarChart;
