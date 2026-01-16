/**
 * Gauge Component
 *
 * Circular progress and gauge meters:
 * - Progress rings
 * - Speedometer gauges
 * - Multi-segment gauges
 * - Animated transitions
 * - Customizable colors and ranges
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  showValue?: boolean;
  showLabels?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  backgroundColor?: string;
  formatValue?: (value: number) => string;
  animate?: boolean;
  className?: string;
}

export interface MultiGaugeSegment {
  value: number;
  color: string;
  label?: string;
}

export interface MultiGaugeProps {
  segments: MultiGaugeSegment[];
  size?: number;
  thickness?: number;
  gap?: number;
  showLabels?: boolean;
  centerContent?: React.ReactNode;
  animate?: boolean;
  className?: string;
}

export interface SpeedometerProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  ranges?: Array<{ min: number; max: number; color: string; label?: string }>;
  showValue?: boolean;
  showRangeLabels?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
  animate?: boolean;
  className?: string;
}

// ============================================================================
// Utility
// ============================================================================

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
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

// ============================================================================
// Main Gauge Component
// ============================================================================

export function Gauge({
  value,
  min = 0,
  max = 100,
  size = 200,
  thickness = 20,
  startAngle = -135,
  endAngle = 135,
  showValue = true,
  showLabels = true,
  showTicks = false,
  tickCount = 5,
  label,
  sublabel,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  formatValue = (v) => Math.round(v).toString(),
  animate = true,
  className,
}: GaugeProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - thickness) / 2;

  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + percentage * totalAngle;

  const backgroundPath = describeArc(centerX, centerY, radius, startAngle, endAngle);
  const valuePath = describeArc(centerX, centerY, radius, startAngle, valueAngle);

  // Calculate tick positions
  const ticks = useMemo(() => {
    if (!showTicks) return [];
    return Array.from({ length: tickCount }, (_, i) => {
      const tickValue = min + (i / (tickCount - 1)) * (max - min);
      const tickAngle = startAngle + (i / (tickCount - 1)) * totalAngle;
      const innerPoint = polarToCartesian(centerX, centerY, radius - thickness / 2 - 5, tickAngle);
      const outerPoint = polarToCartesian(centerX, centerY, radius - thickness / 2 - 15, tickAngle);
      const labelPoint = polarToCartesian(centerX, centerY, radius - thickness / 2 - 25, tickAngle);
      return { value: tickValue, innerPoint, outerPoint, labelPoint, angle: tickAngle };
    });
  }, [showTicks, tickCount, min, max, startAngle, totalAngle, centerX, centerY, radius, thickness]);

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <path
          d={backgroundPath}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          className="dark:opacity-30"
        />

        {/* Value arc */}
        <motion.path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : undefined}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Ticks */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.innerPoint.x}
              y1={tick.innerPoint.y}
              x2={tick.outerPoint.x}
              y2={tick.outerPoint.y}
              stroke="currentColor"
              strokeWidth={2}
              className="text-neutral-400 dark:text-neutral-500"
            />
            {showLabels && (
              <text
                x={tick.labelPoint.x}
                y={tick.labelPoint.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-xs fill-neutral-500"
              >
                {formatValue(tick.value)}
              </text>
            )}
          </g>
        ))}

        {/* Center content */}
        {showValue && (
          <g>
            <text
              x={centerX}
              y={centerY - (sublabel ? 10 : 0)}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="text-3xl font-bold fill-neutral-900 dark:fill-white"
            >
              {formatValue(value)}
            </text>
            {sublabel && (
              <text
                x={centerX}
                y={centerY + 20}
                textAnchor="middle"
                className="text-sm fill-neutral-500"
              >
                {sublabel}
              </text>
            )}
          </g>
        )}

        {/* Min/Max labels */}
        {showLabels && !showTicks && (
          <>
            <text
              x={polarToCartesian(centerX, centerY, radius + 15, startAngle).x}
              y={polarToCartesian(centerX, centerY, radius + 15, startAngle).y}
              textAnchor="middle"
              className="text-xs fill-neutral-500"
            >
              {formatValue(min)}
            </text>
            <text
              x={polarToCartesian(centerX, centerY, radius + 15, endAngle).x}
              y={polarToCartesian(centerX, centerY, radius + 15, endAngle).y}
              textAnchor="middle"
              className="text-xs fill-neutral-500"
            >
              {formatValue(max)}
            </text>
          </>
        )}
      </svg>

      {label && (
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-2">
          {label}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Progress Ring
// ============================================================================

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  formatValue?: (value: number, max: number) => string;
  animate?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  thickness = 10,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  showValue = true,
  label,
  formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
  animate = true,
  className,
}: ProgressRingProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
          className="dark:opacity-30"
        />

        {/* Progress circle */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${centerX} ${centerY})`}
          initial={animate ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Center text */}
        {showValue && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-xl font-bold fill-neutral-900 dark:fill-white"
          >
            {formatValue(value, max)}
          </text>
        )}
      </svg>

      {label && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          {label}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Multi-segment Gauge
// ============================================================================

export function MultiGauge({
  segments,
  size = 200,
  thickness = 20,
  gap = 4,
  showLabels = true,
  centerContent,
  animate = true,
  className,
}: MultiGaugeProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let currentOffset = 0;

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, i) => {
            const segmentLength = (segment.value / total) * circumference;
            const gapLength = gap;
            const dashArray = `${segmentLength - gapLength} ${circumference - segmentLength + gapLength}`;
            const offset = currentOffset;
            currentOffset += segmentLength;

            return (
              <motion.circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={thickness}
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${centerX} ${centerY})`}
                initial={animate ? { opacity: 0 } : undefined}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {centerContent || (
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {total}
              </div>
              <div className="text-sm text-neutral-500">Total</div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {segment.label || `${Math.round((segment.value / total) * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Speedometer
// ============================================================================

export function Speedometer({
  value,
  min = 0,
  max = 100,
  size = 250,
  ranges = [
    { min: 0, max: 33, color: '#10b981', label: 'Low' },
    { min: 33, max: 66, color: '#f59e0b', label: 'Medium' },
    { min: 66, max: 100, color: '#ef4444', label: 'High' },
  ],
  showValue = true,
  showRangeLabels = true,
  label,
  formatValue = (v) => Math.round(v).toString(),
  animate = true,
  className,
}: SpeedometerProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;
  const thickness = 20;

  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;

  // Calculate needle angle
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const needleAngle = startAngle + percentage * totalAngle;

  // Needle points
  const needleLength = radius - 30;
  const needleTip = polarToCartesian(centerX, centerY, needleLength, needleAngle);
  const needleBase1 = polarToCartesian(centerX, centerY, 10, needleAngle - 90);
  const needleBase2 = polarToCartesian(centerX, centerY, 10, needleAngle + 90);

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Range arcs */}
        {ranges.map((range, i) => {
          const rangeStart = startAngle + ((range.min - min) / (max - min)) * totalAngle;
          const rangeEnd = startAngle + ((range.max - min) / (max - min)) * totalAngle;
          const path = describeArc(centerX, centerY, radius, rangeStart, rangeEnd);

          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={range.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              opacity={0.3}
            />
          );
        })}

        {/* Ticks */}
        {Array.from({ length: 11 }, (_, i) => {
          const tickAngle = startAngle + (i / 10) * totalAngle;
          const innerPoint = polarToCartesian(centerX, centerY, radius - thickness / 2 - 5, tickAngle);
          const outerPoint = polarToCartesian(centerX, centerY, radius - thickness / 2 - 15, tickAngle);
          const labelPoint = polarToCartesian(centerX, centerY, radius - thickness / 2 - 28, tickAngle);
          const tickValue = min + (i / 10) * (max - min);

          return (
            <g key={i}>
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 2 : 1}
                className="text-neutral-400"
              />
              {i % 5 === 0 && (
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-xs fill-neutral-500"
                >
                  {formatValue(tickValue)}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle */}
        <motion.g
          initial={animate ? { rotate: startAngle } : undefined}
          animate={{ rotate: needleAngle }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        >
          <polygon
            points={`${centerX},${centerY - needleLength} ${centerX - 6},${centerY} ${centerX + 6},${centerY}`}
            fill="currentColor"
            className="text-neutral-800 dark:text-white"
          />
        </motion.g>

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={15}
          fill="currentColor"
          className="text-neutral-700 dark:text-neutral-300"
        />

        {/* Value display */}
        {showValue && (
          <text
            x={centerX}
            y={centerY + 50}
            textAnchor="middle"
            className="text-2xl font-bold fill-neutral-900 dark:fill-white"
          >
            {formatValue(value)}
          </text>
        )}
      </svg>

      {/* Range labels */}
      {showRangeLabels && (
        <div className="flex justify-center gap-4 mt-2">
          {ranges.map((range, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: range.color }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {range.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {label && (
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-2">
          {label}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mini Gauge
// ============================================================================

export interface MiniGaugeProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  showValue?: boolean;
  className?: string;
}

export function MiniGauge({
  value,
  max = 100,
  size = 48,
  color = '#6366f1',
  showValue = true,
  className,
}: MiniGaugeProps) {
  const percentage = Math.min(value / max, 1);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-neutral-200 dark:text-neutral-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {Math.round(percentage * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Gauge;
