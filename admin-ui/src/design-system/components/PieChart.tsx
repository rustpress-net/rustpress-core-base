/**
 * PieChart Component
 *
 * Pie and donut charts:
 * - Standard pie chart
 * - Donut chart with center content
 * - Interactive segments
 * - Animated transitions
 * - Legends and tooltips
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface PieDataItem {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieDataItem[];
  size?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showPercentages?: boolean;
  centerContent?: React.ReactNode;
  animate?: boolean;
  startAngle?: number;
  formatValue?: (value: number, total: number) => string;
  formatPercentage?: (percentage: number) => string;
  onSegmentClick?: (item: PieDataItem) => void;
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
  '#84cc16',
  '#06b6d4',
];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z',
  ].join(' ');
}

function describeDonutArc(
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(x, y, outerRadius, endAngle);
  const outerEnd = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, startAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', outerStart.x, outerStart.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    'L', innerStart.x, innerStart.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
    'Z',
  ].join(' ');
}

// ============================================================================
// Main Component
// ============================================================================

export function PieChart({
  data,
  size = 200,
  donut = false,
  donutWidth = 40,
  showLabels = false,
  showLegend = true,
  showTooltip = true,
  showPercentages = false,
  centerContent,
  animate = true,
  startAngle = 0,
  formatValue = (v) => v.toLocaleString(),
  formatPercentage = (p) => `${p.toFixed(1)}%`,
  onSegmentClick,
  colors = defaultColors,
  className,
}: PieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<PieDataItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 20) / 2;
  const innerRadius = donut ? radius - donutWidth : 0;

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const segments = useMemo(() => {
    let currentAngle = startAngle;

    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const segmentStartAngle = currentAngle;
      const segmentEndAngle = currentAngle + angle;

      // Calculate label position
      const midAngle = segmentStartAngle + angle / 2;
      const labelRadius = radius * 0.7;
      const labelPos = polarToCartesian(centerX, centerY, labelRadius, midAngle);

      currentAngle = segmentEndAngle;

      return {
        ...item,
        color: item.color || colors[index % colors.length],
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        percentage,
        labelX: labelPos.x,
        labelY: labelPos.y,
        path: donut
          ? describeDonutArc(centerX, centerY, radius, innerRadius, segmentStartAngle, segmentEndAngle)
          : describeArc(centerX, centerY, radius, segmentStartAngle, segmentEndAngle),
      };
    });
  }, [data, total, startAngle, centerX, centerY, radius, innerRadius, donut, colors]);

  const handleMouseMove = (e: React.MouseEvent, segment: typeof segments[0]) => {
    const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40,
      });
    }
    setHoveredSegment(segment);
  };

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, index) => (
            <motion.path
              key={segment.id}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth={2}
              className={cn(
                'cursor-pointer transition-opacity',
                hoveredSegment && hoveredSegment.id !== segment.id && 'opacity-60'
              )}
              initial={animate ? { scale: 0, opacity: 0 } : undefined}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              onMouseMove={(e) => handleMouseMove(e, segment)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => onSegmentClick?.(segment)}
            />
          ))}

          {/* Labels on segments */}
          {showLabels && segments.map((segment) => (
            segment.percentage > 5 && (
              <text
                key={`label-${segment.id}`}
                x={segment.labelX}
                y={segment.labelY}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-xs font-medium fill-white pointer-events-none"
              >
                {showPercentages ? formatPercentage(segment.percentage) : segment.label}
              </text>
            )
          ))}
        </svg>

        {/* Center content for donut */}
        {donut && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              padding: donutWidth + 10,
            }}
          >
            {centerContent || (
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {total.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-500">Total</div>
              </div>
            )}
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && hoveredSegment && (
          <div
            className="absolute z-50 px-3 py-2 text-sm bg-neutral-900 text-white rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-medium">{hoveredSegment.label}</div>
            <div className="flex items-center gap-2 mt-1">
              <span>{formatValue(hoveredSegment.value, total)}</span>
              <span className="text-neutral-400">
                ({formatPercentage((hoveredSegment.value / total) * 100)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={cn(
                'flex items-center gap-2 cursor-pointer transition-opacity',
                hoveredSegment && hoveredSegment.id !== segment.id && 'opacity-60'
              )}
              onMouseEnter={() => setHoveredSegment(segment)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => onSegmentClick?.(segment)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {segment.label}
              </span>
              {showPercentages && (
                <span className="text-xs text-neutral-400">
                  {formatPercentage(segment.percentage)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Donut Chart
// ============================================================================

export interface DonutChartProps extends Omit<PieChartProps, 'donut'> {
  thickness?: number;
}

export function DonutChart({ thickness = 40, ...props }: DonutChartProps) {
  return <PieChart {...props} donut donutWidth={thickness} />;
}

// ============================================================================
// Half Donut / Gauge Style
// ============================================================================

export interface HalfDonutProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  formatValue?: (value: number) => string;
  animate?: boolean;
  className?: string;
}

export function HalfDonut({
  value,
  max = 100,
  size = 200,
  thickness = 20,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  label,
  formatValue = (v) => v.toString(),
  animate = true,
  className,
}: HalfDonutProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - thickness) / 2;
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180;

  const backgroundPath = describeDonutArc(centerX, centerY, radius, radius - thickness, -90, 90);
  const valuePath = describeDonutArc(centerX, centerY, radius, radius - thickness, -90, -90 + angle);

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Background arc */}
        <path d={backgroundPath} fill={backgroundColor} className="dark:opacity-30" />

        {/* Value arc */}
        <motion.path
          d={valuePath}
          fill={color}
          initial={animate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          className="text-2xl font-bold fill-neutral-900 dark:fill-white"
        >
          {formatValue(value)}
        </text>
        {label && (
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            className="text-sm fill-neutral-500"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// Mini Pie
// ============================================================================

export interface MiniPieProps {
  data: Array<{ value: number; color?: string }>;
  size?: number;
  className?: string;
}

export function MiniPie({
  data,
  size = 40,
  className,
}: MiniPieProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 4) / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      path: describeArc(centerX, centerY, radius, startAngle, endAngle),
      color: item.color || defaultColors[index % defaultColors.length],
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      {segments.map((segment, i) => (
        <path key={i} d={segment.path} fill={segment.color} />
      ))}
    </svg>
  );
}

// ============================================================================
// Pie Chart with External Labels
// ============================================================================

export interface LabeledPieChartProps extends PieChartProps {
  labelLineLength?: number;
}

export function LabeledPieChart({
  labelLineLength = 30,
  ...props
}: LabeledPieChartProps) {
  return <PieChart {...props} showLabels showPercentages />;
}

// ============================================================================
// Exports
// ============================================================================

export default PieChart;
