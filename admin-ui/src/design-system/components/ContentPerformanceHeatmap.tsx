/**
 * RustPress Content Performance Heatmap Component
 * Shows best performing content times across days and hours
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  TrendingUp,
  Calendar,
  Info,
  Flame,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';
import { Badge } from './Badge';
import { HeatmapData } from '../../store/dashboardStore';

// Day and hour labels
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12am';
  if (i === 12) return '12pm';
  if (i < 12) return `${i}am`;
  return `${i - 12}pm`;
});

// Color scale for heatmap
function getHeatColor(value: number, max: number): string {
  const intensity = max > 0 ? value / max : 0;

  if (intensity < 0.2) return 'bg-neutral-100 dark:bg-neutral-800';
  if (intensity < 0.4) return 'bg-success-100 dark:bg-success-900/30';
  if (intensity < 0.6) return 'bg-success-300 dark:bg-success-700/50';
  if (intensity < 0.8) return 'bg-success-500 dark:bg-success-600';
  return 'bg-success-600 dark:bg-success-500';
}

// Get text color based on background intensity
function getTextColor(value: number, max: number): string {
  const intensity = max > 0 ? value / max : 0;
  if (intensity >= 0.6) return 'text-white';
  return 'text-neutral-600 dark:text-neutral-400';
}

// Single heatmap cell
interface HeatmapCellProps {
  value: number;
  max: number;
  day: number;
  hour: number;
  onHover: (data: { day: number; hour: number; value: number } | null) => void;
  isHovered: boolean;
}

function HeatmapCell({
  value,
  max,
  day,
  hour,
  onHover,
  isHovered,
}: HeatmapCellProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: (day * 24 + hour) * 0.002 }}
      onMouseEnter={() => onHover({ day, hour, value })}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'aspect-square rounded-sm cursor-pointer transition-all duration-150',
        getHeatColor(value, max),
        isHovered && 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-neutral-900'
      )}
    />
  );
}

// Legend component
interface HeatmapLegendProps {
  min: number;
  max: number;
}

function HeatmapLegend({ min, max }: HeatmapLegendProps) {
  const steps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">Less</span>
      <div className="flex gap-0.5">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'w-4 h-4 rounded-sm',
              getHeatColor(step * max, max)
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">More</span>
    </div>
  );
}

// Best times summary
interface BestTimesSummaryProps {
  data: HeatmapData[];
}

function BestTimesSummary({ data }: BestTimesSummaryProps) {
  // Find top 3 best times
  const topTimes = useMemo(() => {
    return [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [data]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
        <Flame className="w-4 h-4 text-warning-500" />
        Best Posting Times
      </h4>
      <div className="flex flex-wrap gap-2">
        {topTimes.map((time, index) => (
          <Badge
            key={`${time.day}-${time.hour}`}
            variant={index === 0 ? 'primary' : 'secondary'}
            size="sm"
          >
            {DAYS[time.day]} {HOURS[time.hour]}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Main ContentPerformanceHeatmap component
export interface ContentPerformanceHeatmapProps {
  data: HeatmapData[];
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showBestTimes?: boolean;
  showHourLabels?: boolean;
  metric?: string;
  className?: string;
}

export function ContentPerformanceHeatmap({
  data,
  title = 'Best Posting Times',
  subtitle = 'Engagement by day and hour',
  showLegend = true,
  showBestTimes = true,
  showHourLabels = true,
  metric = 'engagements',
  className,
}: ContentPerformanceHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: number;
    hour: number;
    value: number;
  } | null>(null);

  // Calculate min/max values
  const { min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data]);

  // Convert data to 2D grid
  const grid = useMemo(() => {
    const result: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    );
    data.forEach(({ day, hour, value }) => {
      result[day][hour] = value;
    });
    return result;
  }, [data]);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Clock className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            </div>
          </div>

          {showLegend && <HeatmapLegend min={min} max={max} />}
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            {showHourLabels && (
              <div className="flex ml-10 mb-1">
                {HOURS.filter((_, i) => i % 3 === 0).map((hour, index) => (
                  <div
                    key={hour}
                    className="text-xs text-neutral-400 dark:text-neutral-500"
                    style={{ width: `${(100 / 8)}%` }}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="space-y-1">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-2">
                  {/* Day label */}
                  <div className="w-8 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {day}
                  </div>

                  {/* Hour cells */}
                  <div className="flex-1 grid grid-cols-24 gap-0.5">
                    {grid[dayIndex].map((value, hourIndex) => (
                      <HeatmapCell
                        key={`${dayIndex}-${hourIndex}`}
                        value={value}
                        max={max}
                        day={dayIndex}
                        hour={hourIndex}
                        onHover={setHoveredCell}
                        isHovered={
                          hoveredCell?.day === dayIndex &&
                          hoveredCell?.hour === hourIndex
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={cn(
                'p-3 rounded-xl',
                'bg-neutral-50 dark:bg-neutral-800/50',
                'border border-neutral-200 dark:border-neutral-700'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {DAYS[hoveredCell.day]} at {HOURS[hoveredCell.hour]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-success-500" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {hoveredCell.value}
                  </span>
                  <span className="text-xs text-neutral-500">{metric}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Best times summary */}
        {showBestTimes && <BestTimesSummary data={data} />}
      </CardBody>
    </Card>
  );
}

// Compact version for smaller spaces
export interface CompactHeatmapProps {
  data: HeatmapData[];
  className?: string;
}

export function CompactHeatmap({ data, className }: CompactHeatmapProps) {
  const max = Math.max(...data.map((d) => d.value));

  // Convert to grid
  const grid = useMemo(() => {
    const result: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    );
    data.forEach(({ day, hour, value }) => {
      result[day][hour] = value;
    });
    return result;
  }, [data]);

  return (
    <div className={cn('space-y-1', className)}>
      {DAYS.map((day, dayIndex) => (
        <div key={day} className="flex items-center gap-1">
          <span className="w-6 text-[10px] text-neutral-400">{day.slice(0, 1)}</span>
          <div className="flex-1 grid grid-cols-24 gap-px">
            {grid[dayIndex].map((value, hourIndex) => (
              <div
                key={`${dayIndex}-${hourIndex}`}
                className={cn(
                  'aspect-square rounded-[2px]',
                  getHeatColor(value, max)
                )}
                title={`${day} ${HOURS[hourIndex]}: ${value}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Week view heatmap (single row)
export interface WeekViewHeatmapProps {
  data: HeatmapData[];
  className?: string;
}

export function WeekViewHeatmap({ data, className }: WeekViewHeatmapProps) {
  // Aggregate by day
  const dayTotals = useMemo(() => {
    const totals = Array(7).fill(0);
    data.forEach(({ day, value }) => {
      totals[day] += value;
    });
    return totals;
  }, [data]);

  const max = Math.max(...dayTotals);

  return (
    <div className={cn('flex gap-1', className)}>
      {DAYS.map((day, index) => (
        <div key={day} className="flex-1 text-center">
          <div
            className={cn(
              'h-8 rounded mb-1',
              getHeatColor(dayTotals[index], max)
            )}
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {day}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ContentPerformanceHeatmap;
