/**
 * Heatmap Component
 *
 * Color-coded data grids:
 * - Calendar heatmaps (GitHub style)
 * - Matrix heatmaps
 * - Interactive cells
 * - Custom color scales
 * - Tooltips and legends
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface HeatmapCell {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
}

export interface HeatmapProps {
  data: HeatmapCell[];
  xLabels?: string[];
  yLabels?: string[];
  width?: number | string;
  height?: number;
  cellSize?: number;
  cellGap?: number;
  cellRadius?: number;
  showXLabels?: boolean;
  showYLabels?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  colorScale?: string[];
  minColor?: string;
  maxColor?: string;
  emptyColor?: string;
  formatValue?: (value: number) => string;
  formatTooltip?: (cell: HeatmapCell) => string;
  onCellClick?: (cell: HeatmapCell) => void;
  animate?: boolean;
  className?: string;
}

export interface CalendarHeatmapProps {
  data: Array<{ date: Date | string; value: number }>;
  startDate?: Date;
  endDate?: Date;
  cellSize?: number;
  cellGap?: number;
  colorScale?: string[];
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  formatTooltip?: (date: Date, value: number) => string;
  onCellClick?: (date: Date, value: number) => void;
  animate?: boolean;
  className?: string;
}

// ============================================================================
// Utility
// ============================================================================

function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getColorFromScale(value: number, min: number, max: number, colorScale: string[]): string {
  if (colorScale.length === 0) return '#e5e7eb';
  if (colorScale.length === 1) return colorScale[0];
  if (max === min) return colorScale[Math.floor(colorScale.length / 2)];

  const normalizedValue = (value - min) / (max - min);
  const scaledIndex = normalizedValue * (colorScale.length - 1);
  const lowerIndex = Math.floor(scaledIndex);
  const upperIndex = Math.min(lowerIndex + 1, colorScale.length - 1);
  const factor = scaledIndex - lowerIndex;

  return interpolateColor(colorScale[lowerIndex], colorScale[upperIndex], factor);
}

const defaultColorScale = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

// ============================================================================
// Matrix Heatmap Component
// ============================================================================

export function Heatmap({
  data,
  xLabels,
  yLabels,
  width = '100%',
  height,
  cellSize = 40,
  cellGap = 2,
  cellRadius = 4,
  showXLabels = true,
  showYLabels = true,
  showValues = false,
  showLegend = true,
  showTooltip = true,
  colorScale = defaultColorScale,
  emptyColor = '#f3f4f6',
  formatValue = (v) => v.toLocaleString(),
  formatTooltip = (cell) => `${cell.x}, ${cell.y}: ${cell.value}`,
  onCellClick,
  animate = true,
  className,
}: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  // Calculate dimensions
  const { cells, uniqueX, uniqueY, minValue, maxValue } = useMemo(() => {
    const xSet = new Set<string | number>();
    const ySet = new Set<string | number>();
    let min = Infinity;
    let max = -Infinity;

    data.forEach(cell => {
      xSet.add(cell.x);
      ySet.add(cell.y);
      min = Math.min(min, cell.value);
      max = Math.max(max, cell.value);
    });

    const sortedX = xLabels || Array.from(xSet);
    const sortedY = yLabels || Array.from(ySet);

    const cellMap = new Map<string, HeatmapCell>();
    data.forEach(cell => {
      cellMap.set(`${cell.x}-${cell.y}`, cell);
    });

    const processedCells: Array<HeatmapCell & { xIndex: number; yIndex: number; color: string }> = [];
    sortedY.forEach((y, yIndex) => {
      sortedX.forEach((x, xIndex) => {
        const cell = cellMap.get(`${x}-${y}`);
        const value = cell?.value ?? 0;
        const color = value === 0 ? emptyColor : getColorFromScale(value, min, max, colorScale);

        processedCells.push({
          x,
          y,
          value,
          label: cell?.label,
          xIndex,
          yIndex,
          color,
        });
      });
    });

    return {
      cells: processedCells,
      uniqueX: sortedX,
      uniqueY: sortedY,
      minValue: min === Infinity ? 0 : min,
      maxValue: max === -Infinity ? 0 : max,
    };
  }, [data, xLabels, yLabels, colorScale, emptyColor]);

  const labelPadding = { x: showYLabels ? 60 : 0, y: showXLabels ? 30 : 0 };
  const gridWidth = uniqueX.length * (cellSize + cellGap) - cellGap;
  const gridHeight = uniqueY.length * (cellSize + cellGap) - cellGap;
  const svgWidth = gridWidth + labelPadding.x + 20;
  const svgHeight = gridHeight + labelPadding.y + 20;

  return (
    <div className={cn('relative', className)} style={{ width }}>
      <svg
        width="100%"
        height={height || svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y Labels */}
        {showYLabels && uniqueY.map((label, i) => (
          <text
            key={`y-${i}`}
            x={labelPadding.x - 5}
            y={10 + i * (cellSize + cellGap) + cellSize / 2}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-neutral-500"
          >
            {label}
          </text>
        ))}

        {/* X Labels */}
        {showXLabels && uniqueX.map((label, i) => (
          <text
            key={`x-${i}`}
            x={labelPadding.x + i * (cellSize + cellGap) + cellSize / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            className="text-xs fill-neutral-500"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((cell, i) => (
          <motion.rect
            key={`${cell.x}-${cell.y}`}
            x={labelPadding.x + cell.xIndex * (cellSize + cellGap)}
            y={10 + cell.yIndex * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            rx={cellRadius}
            fill={cell.color}
            className="cursor-pointer"
            initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={(e) => {
              const rect = (e.target as SVGElement).getBoundingClientRect();
              setHoveredCell({
                cell,
                x: rect.left + rect.width / 2,
                y: rect.top,
              });
            }}
            onMouseLeave={() => setHoveredCell(null)}
            onClick={() => onCellClick?.(cell)}
          />
        ))}

        {/* Values on cells */}
        {showValues && cells.map((cell) => (
          <text
            key={`val-${cell.x}-${cell.y}`}
            x={labelPadding.x + cell.xIndex * (cellSize + cellGap) + cellSize / 2}
            y={10 + cell.yIndex * (cellSize + cellGap) + cellSize / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-xs font-medium fill-white pointer-events-none"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            {formatValue(cell.value)}
          </text>
        ))}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-xs text-neutral-500">Less</span>
          <div className="flex gap-1">
            {colorScale.map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-500">More</span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredCell && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-neutral-900 text-white rounded shadow-lg pointer-events-none"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {formatTooltip(hoveredCell.cell)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Calendar Heatmap (GitHub-style)
// ============================================================================

export function CalendarHeatmap({
  data,
  startDate: startDateProp,
  endDate: endDateProp,
  cellSize = 12,
  cellGap = 3,
  colorScale = defaultColorScale,
  showMonthLabels = true,
  showWeekdayLabels = true,
  showLegend = true,
  showTooltip = true,
  formatTooltip = (date, value) => `${date.toLocaleDateString()}: ${value} contributions`,
  onCellClick,
  animate = true,
  className,
}: CalendarHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    date: Date;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Process data
  const { cells, weeks, months, minValue, maxValue } = useMemo(() => {
    const endDate = endDateProp || new Date();
    const startDate = startDateProp || new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Create value map
    const valueMap = new Map<string, number>();
    data.forEach(item => {
      const date = typeof item.date === 'string' ? new Date(item.date) : item.date;
      const key = date.toISOString().split('T')[0];
      valueMap.set(key, (valueMap.get(key) || 0) + item.value);
    });

    // Calculate min/max
    const values = Array.from(valueMap.values());
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    // Generate cells
    const cellData: Array<{ date: Date; value: number; week: number; day: number }> = [];
    const monthLabels: Array<{ label: string; week: number }> = [];

    let currentDate = new Date(startDate);
    let currentWeek = 0;
    let lastMonth = -1;

    // Align to start of week
    const startDayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - startDayOfWeek);

    while (currentDate <= endDate) {
      const month = currentDate.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          week: currentWeek,
        });
        lastMonth = month;
      }

      for (let day = 0; day < 7; day++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const value = valueMap.get(dateKey) || 0;

        if (currentDate >= startDate && currentDate <= endDate) {
          cellData.push({
            date: new Date(currentDate),
            value,
            week: currentWeek,
            day,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      currentWeek++;
    }

    return {
      cells: cellData,
      weeks: currentWeek,
      months: monthLabels,
      minValue: min,
      maxValue: max,
    };
  }, [data, startDateProp, endDateProp]);

  const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const labelPadding = { x: showWeekdayLabels ? 30 : 0, y: showMonthLabels ? 20 : 0 };
  const svgWidth = weeks * (cellSize + cellGap) + labelPadding.x;
  const svgHeight = 7 * (cellSize + cellGap) + labelPadding.y;

  return (
    <div className={cn('relative', className)}>
      <svg width={svgWidth} height={svgHeight}>
        {/* Month labels */}
        {showMonthLabels && months.map((month, i) => (
          <text
            key={i}
            x={labelPadding.x + month.week * (cellSize + cellGap)}
            y={12}
            className="text-xs fill-neutral-500"
          >
            {month.label}
          </text>
        ))}

        {/* Weekday labels */}
        {showWeekdayLabels && weekdayLabels.map((label, i) => (
          <text
            key={i}
            x={labelPadding.x - 5}
            y={labelPadding.y + i * (cellSize + cellGap) + cellSize / 2}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-neutral-500"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((cell, i) => {
          const color = cell.value === 0
            ? colorScale[0]
            : getColorFromScale(cell.value, 0, maxValue, colorScale);

          return (
            <motion.rect
              key={`${cell.week}-${cell.day}`}
              x={labelPadding.x + cell.week * (cellSize + cellGap)}
              y={labelPadding.y + cell.day * (cellSize + cellGap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={color}
              className="cursor-pointer"
              initial={animate ? { opacity: 0 } : undefined}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.002 }}
              onMouseEnter={(e) => {
                const rect = (e.target as SVGElement).getBoundingClientRect();
                setHoveredCell({
                  date: cell.date,
                  value: cell.value,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => onCellClick?.(cell.date, cell.value)}
            />
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-xs text-neutral-500">Less</span>
          <div className="flex gap-1">
            {colorScale.map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-500">More</span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredCell && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-neutral-900 text-white rounded shadow-lg pointer-events-none"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {formatTooltip(hoveredCell.date, hoveredCell.value)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Heatmap Row
// ============================================================================

export interface HeatmapRowProps {
  data: number[];
  labels?: string[];
  colorScale?: string[];
  cellSize?: number;
  cellGap?: number;
  showValues?: boolean;
  className?: string;
}

export function HeatmapRow({
  data,
  labels,
  colorScale = defaultColorScale,
  cellSize = 32,
  cellGap = 2,
  showValues = false,
  className,
}: HeatmapRowProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);

  return (
    <div className={cn('flex gap-0.5', className)}>
      {data.map((value, i) => {
        const color = getColorFromScale(value, min, max, colorScale);
        return (
          <div
            key={i}
            className="flex items-center justify-center rounded text-xs font-medium"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: color,
              color: value > (max - min) / 2 ? 'white' : 'inherit',
            }}
            title={labels?.[i]}
          >
            {showValues && value}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Heatmap;
