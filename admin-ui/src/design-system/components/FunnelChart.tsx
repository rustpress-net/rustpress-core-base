/**
 * FunnelChart Component
 *
 * Conversion funnel visualization:
 * - Horizontal and vertical funnels
 * - Animated transitions
 * - Conversion rates
 * - Interactive segments
 * - Comparison funnels
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  orientation?: 'horizontal' | 'vertical';
  width?: number | string;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  showConversionRates?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  formatValue?: (value: number) => string;
  formatPercentage?: (percentage: number) => string;
  onStageClick?: (stage: FunnelStage) => void;
  colors?: string[];
  className?: string;
}

export interface ComparisonFunnelProps {
  current: FunnelStage[];
  previous: FunnelStage[];
  currentLabel?: string;
  previousLabel?: string;
  width?: number | string;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  showChange?: boolean;
  animate?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

// ============================================================================
// Utility
// ============================================================================

const defaultColors = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#c084fc',
  '#d8b4fe',
  '#e9d5ff',
];

// ============================================================================
// Funnel Chart Component
// ============================================================================

export function FunnelChart({
  stages,
  orientation = 'vertical',
  width = '100%',
  height = 400,
  showLabels = true,
  showValues = true,
  showPercentages = true,
  showConversionRates = true,
  showTooltip = true,
  animate = true,
  formatValue = (v) => v.toLocaleString(),
  formatPercentage = (p) => `${p.toFixed(1)}%`,
  onStageClick,
  colors = defaultColors,
  className,
}: FunnelChartProps) {
  const [hoveredStage, setHoveredStage] = useState<FunnelStage | null>(null);

  const maxValue = stages.length > 0 ? stages[0].value : 0;

  const processedStages = useMemo(() => {
    return stages.map((stage, i) => {
      const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
      const conversionRate = i > 0 && stages[i - 1].value > 0
        ? (stage.value / stages[i - 1].value) * 100
        : 100;
      const dropOff = i > 0 ? stages[i - 1].value - stage.value : 0;

      return {
        ...stage,
        color: stage.color || colors[i % colors.length],
        percentage,
        conversionRate,
        dropOff,
      };
    });
  }, [stages, maxValue, colors]);

  if (orientation === 'horizontal') {
    return (
      <div className={cn('w-full', className)} style={{ width }}>
        <div className="flex items-stretch" style={{ height }}>
          {processedStages.map((stage, i) => {
            const widthPercent = stage.percentage;

            return (
              <React.Fragment key={stage.id}>
                <motion.div
                  className={cn(
                    'relative flex flex-col justify-center items-center',
                    'cursor-pointer transition-opacity',
                    hoveredStage && hoveredStage.id !== stage.id && 'opacity-60'
                  )}
                  style={{
                    width: `${widthPercent}%`,
                    minWidth: 80,
                    backgroundColor: stage.color,
                  }}
                  initial={animate ? { scaleX: 0, opacity: 0 } : undefined}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onMouseEnter={() => setHoveredStage(stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                  onClick={() => onStageClick?.(stage)}
                >
                  {showLabels && (
                    <div className="text-sm font-medium text-white text-center px-2">
                      {stage.label}
                    </div>
                  )}
                  {showValues && (
                    <div className="text-lg font-bold text-white">
                      {formatValue(stage.value)}
                    </div>
                  )}
                  {showPercentages && (
                    <div className="text-xs text-white/80">
                      {formatPercentage(stage.percentage)}
                    </div>
                  )}
                </motion.div>

                {/* Conversion arrow */}
                {i < processedStages.length - 1 && showConversionRates && (
                  <div className="flex flex-col items-center justify-center px-2 bg-white dark:bg-neutral-900">
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {formatPercentage(processedStages[i + 1].conversionRate)}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical funnel
  return (
    <div className={cn('w-full', className)} style={{ width }}>
      <div className="space-y-2" style={{ maxHeight: height }}>
        {processedStages.map((stage, i) => {
          const widthPercent = stage.percentage;

          return (
            <React.Fragment key={stage.id}>
              <motion.div
                className={cn(
                  'relative mx-auto rounded-lg overflow-hidden cursor-pointer transition-opacity',
                  hoveredStage && hoveredStage.id !== stage.id && 'opacity-60'
                )}
                style={{
                  width: `${Math.max(widthPercent, 30)}%`,
                  backgroundColor: stage.color,
                }}
                initial={animate ? { scaleY: 0, opacity: 0 } : undefined}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredStage(stage)}
                onMouseLeave={() => setHoveredStage(null)}
                onClick={() => onStageClick?.(stage)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {stage.icon && (
                      <div className="text-white/80">{stage.icon}</div>
                    )}
                    <div>
                      {showLabels && (
                        <div className="text-sm font-medium text-white">
                          {stage.label}
                        </div>
                      )}
                      {showValues && (
                        <div className="text-lg font-bold text-white">
                          {formatValue(stage.value)}
                        </div>
                      )}
                    </div>
                  </div>

                  {showPercentages && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {formatPercentage(stage.percentage)}
                      </div>
                      {i > 0 && (
                        <div className="text-xs text-white/70">
                          -{formatValue(stage.dropOff)} lost
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Conversion indicator */}
              {i < processedStages.length - 1 && showConversionRates && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <ArrowDown className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-500">
                    {formatPercentage(processedStages[i + 1].conversionRate)} conversion
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Tooltip */}
      {showTooltip && hoveredStage && (
        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{hoveredStage.label}</span>
            <span className="text-lg font-bold">{formatValue(hoveredStage.value)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Of total:</span>
              <span className="ml-2 font-medium">{formatPercentage(hoveredStage.percentage)}</span>
            </div>
            <div>
              <span className="text-neutral-500">Conversion:</span>
              <span className="ml-2 font-medium">{formatPercentage(hoveredStage.conversionRate)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Comparison Funnel
// ============================================================================

export function ComparisonFunnel({
  current,
  previous,
  currentLabel = 'Current',
  previousLabel = 'Previous',
  width = '100%',
  height = 400,
  showLabels = true,
  showValues = true,
  showChange = true,
  animate = true,
  formatValue = (v) => v.toLocaleString(),
  className,
}: ComparisonFunnelProps) {
  const maxValue = Math.max(
    current.length > 0 ? current[0].value : 0,
    previous.length > 0 ? previous[0].value : 0
  );

  return (
    <div className={cn('w-full', className)} style={{ width }}>
      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">{currentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-neutral-300 dark:bg-neutral-600" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">{previousLabel}</span>
        </div>
      </div>

      <div className="space-y-3">
        {current.map((stage, i) => {
          const prevStage = previous[i];
          const currentPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const prevPercent = prevStage && maxValue > 0 ? (prevStage.value / maxValue) * 100 : 0;
          const change = prevStage ? ((stage.value - prevStage.value) / prevStage.value) * 100 : 0;

          return (
            <div key={stage.id} className="space-y-1">
              {showLabels && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {stage.label}
                  </span>
                  {showChange && prevStage && (
                    <div className={cn(
                      'flex items-center gap-1 text-xs',
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(change).toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              <div className="relative h-10">
                {/* Previous bar (background) */}
                {prevStage && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-neutral-200 dark:bg-neutral-700 rounded"
                    style={{ width: `${prevPercent}%` }}
                    initial={animate ? { width: 0 } : undefined}
                    animate={{ width: `${prevPercent}%` }}
                    transition={{ delay: i * 0.1 }}
                  />
                )}

                {/* Current bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary-500 rounded flex items-center justify-end pr-3"
                  style={{ width: `${currentPercent}%` }}
                  initial={animate ? { width: 0 } : undefined}
                  animate={{ width: `${currentPercent}%` }}
                  transition={{ delay: i * 0.1 + 0.05 }}
                >
                  {showValues && currentPercent > 20 && (
                    <span className="text-sm font-medium text-white">
                      {formatValue(stage.value)}
                    </span>
                  )}
                </motion.div>

                {/* Value label outside bar if needed */}
                {showValues && currentPercent <= 20 && (
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    style={{ left: `${currentPercent + 2}%` }}
                  >
                    {formatValue(stage.value)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Simple Funnel Steps
// ============================================================================

export interface FunnelStepsProps {
  stages: Array<{
    label: string;
    value: number;
    sublabel?: string;
  }>;
  showConnectors?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function FunnelSteps({
  stages,
  showConnectors = true,
  formatValue = (v) => v.toLocaleString(),
  className,
}: FunnelStepsProps) {
  const maxValue = stages.length > 0 ? stages[0].value : 0;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {stages.map((stage, i) => {
        const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
        const conversionRate = i > 0 && stages[i - 1].value > 0
          ? (stage.value / stages[i - 1].value) * 100
          : 100;

        return (
          <React.Fragment key={i}>
            <div className="flex-1 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatValue(stage.value)}
                </div>
                <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {stage.label}
                </div>
                {stage.sublabel && (
                  <div className="text-xs text-neutral-500">
                    {stage.sublabel}
                  </div>
                )}
                <div className="text-xs text-neutral-400 mt-1">
                  {percentage.toFixed(1)}% of total
                </div>
              </div>
            </div>

            {/* Connector */}
            {showConnectors && i < stages.length - 1 && (
              <div className="flex flex-col items-center px-4">
                <ArrowRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                <span className="text-xs text-neutral-500 mt-1">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// Mini Funnel
// ============================================================================

export interface MiniFunnelProps {
  stages: Array<{ value: number; color?: string }>;
  width?: number;
  height?: number;
  className?: string;
}

export function MiniFunnel({
  stages,
  width = 100,
  height = 60,
  className,
}: MiniFunnelProps) {
  const maxValue = stages.length > 0 ? stages[0].value : 1;
  const stageHeight = height / stages.length;

  return (
    <svg width={width} height={height} className={className}>
      {stages.map((stage, i) => {
        const widthPercent = (stage.value / maxValue) * 100;
        const barWidth = (widthPercent / 100) * width;
        const x = (width - barWidth) / 2;
        const color = stage.color || defaultColors[i % defaultColors.length];

        return (
          <rect
            key={i}
            x={x}
            y={i * stageHeight}
            width={barWidth}
            height={stageHeight - 2}
            rx={2}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default FunnelChart;
