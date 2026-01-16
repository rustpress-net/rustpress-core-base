/**
 * ScatterPlot Component
 *
 * Data point visualization:
 * - Multiple data series
 * - Point sizing by value
 * - Trend lines
 * - Quadrant divisions
 * - Interactive tooltips
 * - Zoom support
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface ScatterDataPoint {
  x: number;
  y: number;
  size?: number;
  label?: string;
  color?: string;
}

export interface ScatterSeries {
  id: string;
  name: string;
  data: ScatterDataPoint[];
  color?: string;
  shape?: 'circle' | 'square' | 'triangle' | 'diamond';
}

export interface ScatterPlotProps {
  series: ScatterSeries[];
  width?: number | string;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showTrendLine?: boolean;
  showQuadrants?: boolean;
  animate?: boolean;
  minPointSize?: number;
  maxPointSize?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: number) => string;
  formatYAxis?: (value: number) => string;
  quadrantLabels?: { q1?: string; q2?: string; q3?: string; q4?: string };
  onPointClick?: (point: ScatterDataPoint, series: ScatterSeries) => void;
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

function getShapePath(
  shape: 'circle' | 'square' | 'triangle' | 'diamond',
  x: number,
  y: number,
  size: number
): string {
  const half = size / 2;
  switch (shape) {
    case 'square':
      return `M ${x - half} ${y - half} h ${size} v ${size} h ${-size} Z`;
    case 'triangle':
      return `M ${x} ${y - half} L ${x + half} ${y + half} L ${x - half} ${y + half} Z`;
    case 'diamond':
      return `M ${x} ${y - half} L ${x + half} ${y} L ${x} ${y + half} L ${x - half} ${y} Z`;
    default:
      return '';
  }
}

function calculateTrendLine(points: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;

  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  points.forEach(point => {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  if (!isFinite(slope) || !isFinite(intercept)) return null;

  return { slope, intercept };
}

// ============================================================================
// Main Component
// ============================================================================

export function ScatterPlot({
  series,
  width = '100%',
  height = 400,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  showTooltip = true,
  showTrendLine = false,
  showQuadrants = false,
  animate = true,
  minPointSize = 6,
  maxPointSize = 20,
  xAxisLabel,
  yAxisLabel,
  formatXAxis = (v) => v.toLocaleString(),
  formatYAxis = (v) => v.toLocaleString(),
  quadrantLabels,
  onPointClick,
  colors = defaultColors,
  className,
}: ScatterPlotProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: ScatterDataPoint;
    series: ScatterSeries;
    screenX: number;
    screenY: number;
  } | null>(null);
  const [activeSeries, setActiveSeries] = useState<Set<string>>(new Set(series.map(s => s.id)));

  const padding = { top: 20, right: 20, bottom: 50, left: 60 };
  const chartWidth = typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const { xScale, yScale, sizeScale, xTicks, yTicks, processedSeries, xMid, yMid } = useMemo(() => {
    const visibleSeries = series.filter(s => activeSeries.has(s.id));
    const allPoints = visibleSeries.flatMap(s => s.data);

    if (allPoints.length === 0) {
      return {
        xScale: () => 0,
        yScale: () => 0,
        sizeScale: () => minPointSize,
        xTicks: [],
        yTicks: [],
        processedSeries: [],
        xMid: 0,
        yMid: 0,
      };
    }

    // Calculate ranges
    const xValues = allPoints.map(p => p.x);
    const yValues = allPoints.map(p => p.y);
    const sizeValues = allPoints.filter(p => p.size !== undefined).map(p => p.size!);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const sizeMin = sizeValues.length > 0 ? Math.min(...sizeValues) : 1;
    const sizeMax = sizeValues.length > 0 ? Math.max(...sizeValues) : 1;

    // Add padding to ranges
    const xPad = (xMax - xMin) * 0.1 || 1;
    const yPad = (yMax - yMin) * 0.1 || 1;

    const xScaleFn = (x: number) => ((x - (xMin - xPad)) / (xMax - xMin + xPad * 2)) * innerWidth;
    const yScaleFn = (y: number) => innerHeight - ((y - (yMin - yPad)) / (yMax - yMin + yPad * 2)) * innerHeight;
    const sizeScaleFn = (size: number) => {
      if (sizeMax === sizeMin) return (minPointSize + maxPointSize) / 2;
      return minPointSize + ((size - sizeMin) / (sizeMax - sizeMin)) * (maxPointSize - minPointSize);
    };

    // Generate ticks
    const xTickCount = 6;
    const yTickCount = 6;
    const xTickStep = (xMax - xMin + xPad * 2) / (xTickCount - 1);
    const yTickStep = (yMax - yMin + yPad * 2) / (yTickCount - 1);

    const xTickValues = Array.from({ length: xTickCount }, (_, i) => xMin - xPad + i * xTickStep);
    const yTickValues = Array.from({ length: yTickCount }, (_, i) => yMin - yPad + i * yTickStep);

    // Process series
    const processed = visibleSeries.map((s, i) => ({
      ...s,
      color: s.color || colors[i % colors.length],
      shape: s.shape || 'circle',
      processedPoints: s.data.map(p => ({
        ...p,
        scaledX: xScaleFn(p.x),
        scaledY: yScaleFn(p.y),
        scaledSize: p.size !== undefined ? sizeScaleFn(p.size) : (minPointSize + maxPointSize) / 2,
      })),
    }));

    return {
      xScale: xScaleFn,
      yScale: yScaleFn,
      sizeScale: sizeScaleFn,
      xTicks: xTickValues,
      yTicks: yTickValues,
      processedSeries: processed,
      xMid: xScaleFn((xMin + xMax) / 2),
      yMid: yScaleFn((yMin + yMax) / 2),
    };
  }, [series, activeSeries, innerWidth, innerHeight, minPointSize, maxPointSize, colors]);

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
                />
              ))}
            </g>
          )}

          {/* Quadrants */}
          {showQuadrants && (
            <>
              <line
                x1={xMid}
                y1={0}
                x2={xMid}
                y2={innerHeight}
                stroke="currentColor"
                strokeWidth={2}
                className="text-neutral-300 dark:text-neutral-600"
              />
              <line
                x1={0}
                y1={yMid}
                x2={innerWidth}
                y2={yMid}
                stroke="currentColor"
                strokeWidth={2}
                className="text-neutral-300 dark:text-neutral-600"
              />
              {quadrantLabels && (
                <>
                  {quadrantLabels.q1 && (
                    <text x={xMid + (innerWidth - xMid) / 2} y={yMid / 2} textAnchor="middle" className="text-xs fill-neutral-400">
                      {quadrantLabels.q1}
                    </text>
                  )}
                  {quadrantLabels.q2 && (
                    <text x={xMid / 2} y={yMid / 2} textAnchor="middle" className="text-xs fill-neutral-400">
                      {quadrantLabels.q2}
                    </text>
                  )}
                  {quadrantLabels.q3 && (
                    <text x={xMid / 2} y={yMid + (innerHeight - yMid) / 2} textAnchor="middle" className="text-xs fill-neutral-400">
                      {quadrantLabels.q3}
                    </text>
                  )}
                  {quadrantLabels.q4 && (
                    <text x={xMid + (innerWidth - xMid) / 2} y={yMid + (innerHeight - yMid) / 2} textAnchor="middle" className="text-xs fill-neutral-400">
                      {quadrantLabels.q4}
                    </text>
                  )}
                </>
              )}
            </>
          )}

          {/* Trend lines */}
          {showTrendLine && processedSeries.map((s) => {
            const trendLine = calculateTrendLine(s.processedPoints.map(p => ({ x: p.x, y: p.y })));
            if (!trendLine) return null;

            const x1 = 0;
            const x2 = innerWidth;
            // We need to convert back from scaled x to actual x for trend line calculation
            const actualX1 = xTicks[0];
            const actualX2 = xTicks[xTicks.length - 1];
            const y1 = yScale(trendLine.slope * actualX1 + trendLine.intercept);
            const y2 = yScale(trendLine.slope * actualX2 + trendLine.intercept);

            return (
              <line
                key={`trend-${s.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray="8,4"
                opacity={0.5}
              />
            );
          })}

          {/* Points */}
          {processedSeries.map((s, seriesIndex) => (
            <g key={s.id}>
              {s.processedPoints.map((point, pointIndex) => {
                const isHovered = hoveredPoint?.point === s.data[pointIndex] && hoveredPoint?.series.id === s.id;

                if (s.shape === 'circle') {
                  return (
                    <motion.circle
                      key={pointIndex}
                      cx={point.scaledX}
                      cy={point.scaledY}
                      r={point.scaledSize / 2}
                      fill={point.color || s.color}
                      opacity={isHovered ? 1 : 0.8}
                      stroke="white"
                      strokeWidth={isHovered ? 2 : 1}
                      className="cursor-pointer"
                      initial={animate ? { scale: 0, opacity: 0 } : undefined}
                      animate={{ scale: 1, opacity: 0.8 }}
                      whileHover={{ scale: 1.2, opacity: 1 }}
                      transition={{ delay: seriesIndex * 0.1 + pointIndex * 0.02 }}
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGElement).getBoundingClientRect();
                        setHoveredPoint({
                          point: s.data[pointIndex],
                          series: s,
                          screenX: rect.left + rect.width / 2,
                          screenY: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => onPointClick?.(s.data[pointIndex], s)}
                    />
                  );
                }

                return (
                  <motion.path
                    key={pointIndex}
                    d={getShapePath(s.shape, point.scaledX, point.scaledY, point.scaledSize)}
                    fill={point.color || s.color}
                    opacity={isHovered ? 1 : 0.8}
                    stroke="white"
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer"
                    initial={animate ? { scale: 0, opacity: 0 } : undefined}
                    animate={{ scale: 1, opacity: 0.8 }}
                    whileHover={{ scale: 1.2, opacity: 1 }}
                    transition={{ delay: seriesIndex * 0.1 + pointIndex * 0.02 }}
                    style={{ transformOrigin: `${point.scaledX}px ${point.scaledY}px` }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setHoveredPoint({
                        point: s.data[pointIndex],
                        series: s,
                        screenX: rect.left + rect.width / 2,
                        screenY: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => onPointClick?.(s.data[pointIndex], s)}
                  />
                );
              })}
            </g>
          ))}

          {/* X Axis */}
          {showXAxis && (
            <g transform={`translate(0, ${innerHeight})`}>
              <line x1={0} y1={0} x2={innerWidth} y2={0} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
              {xTicks.map((tick, i) => (
                <g key={i} transform={`translate(${xScale(tick)}, 0)`}>
                  <line y1={0} y2={6} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
                  <text y={20} textAnchor="middle" className="text-xs fill-neutral-500">
                    {formatXAxis(tick)}
                  </text>
                </g>
              ))}
              {xAxisLabel && (
                <text x={innerWidth / 2} y={40} textAnchor="middle" className="text-xs fill-neutral-500">
                  {xAxisLabel}
                </text>
              )}
            </g>
          )}

          {/* Y Axis */}
          {showYAxis && (
            <g>
              <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
              {yTicks.map((tick, i) => (
                <g key={i} transform={`translate(0, ${yScale(tick)})`}>
                  <line x1={-6} x2={0} stroke="currentColor" className="text-neutral-300 dark:text-neutral-600" />
                  <text x={-10} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-neutral-500">
                    {formatYAxis(tick)}
                  </text>
                </g>
              ))}
              {yAxisLabel && (
                <text transform={`translate(-45, ${innerHeight / 2}) rotate(-90)`} textAnchor="middle" className="text-xs fill-neutral-500">
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
            const color = s.color || colors[i % colors.length];
            const isActive = activeSeries.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSeries(s.id)}
                className={cn('flex items-center gap-2 transition-opacity', !isActive && 'opacity-40')}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{s.name}</span>
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
            top: hoveredPoint.screenY - 60,
            transform: 'translateX(-50%)',
          }}
        >
          {hoveredPoint.point.label && (
            <div className="font-medium mb-1">{hoveredPoint.point.label}</div>
          )}
          <div className="text-neutral-300">
            X: {formatXAxis(hoveredPoint.point.x)}
          </div>
          <div className="text-neutral-300">
            Y: {formatYAxis(hoveredPoint.point.y)}
          </div>
          {hoveredPoint.point.size !== undefined && (
            <div className="text-neutral-300">
              Size: {hoveredPoint.point.size}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Bubble Chart (Scatter with sized points)
// ============================================================================

export interface BubbleChartProps extends Omit<ScatterPlotProps, 'minPointSize' | 'maxPointSize'> {
  minRadius?: number;
  maxRadius?: number;
}

export function BubbleChart({
  minRadius = 10,
  maxRadius = 50,
  ...props
}: BubbleChartProps) {
  return <ScatterPlot {...props} minPointSize={minRadius} maxPointSize={maxRadius} />;
}

// ============================================================================
// Exports
// ============================================================================

export default ScatterPlot;
