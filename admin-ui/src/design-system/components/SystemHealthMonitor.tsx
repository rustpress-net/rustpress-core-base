/**
 * RustPress System Health Monitor Component
 * CPU, memory, disk, and network usage gauges with animations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Server,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';
import { Badge } from './Badge';
import { SystemMetrics } from '../../store/dashboardStore';

// Gauge configuration
interface GaugeConfig {
  icon: React.ElementType;
  label: string;
  unit: string;
  thresholds: {
    warning: number;
    critical: number;
  };
}

const gaugeConfigs: Record<keyof Omit<SystemMetrics, 'timestamp'>, GaugeConfig> = {
  cpu: {
    icon: Cpu,
    label: 'CPU',
    unit: '%',
    thresholds: { warning: 70, critical: 90 },
  },
  memory: {
    icon: MemoryStick,
    label: 'Memory',
    unit: '%',
    thresholds: { warning: 75, critical: 90 },
  },
  disk: {
    icon: HardDrive,
    label: 'Disk',
    unit: '%',
    thresholds: { warning: 80, critical: 95 },
  },
  network: {
    icon: Network,
    label: 'Network',
    unit: 'Mb/s',
    thresholds: { warning: 80, critical: 95 },
  },
};

// Get status color based on value and thresholds
function getStatusColor(value: number, thresholds: { warning: number; critical: number }) {
  if (value >= thresholds.critical) return 'error';
  if (value >= thresholds.warning) return 'warning';
  return 'success';
}

// Circular gauge component
interface CircularGaugeProps {
  value: number;
  config: GaugeConfig;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

function CircularGauge({
  value,
  config,
  size = 'md',
  animated = true,
}: CircularGaugeProps) {
  const status = getStatusColor(value, config.thresholds);
  const Icon = config.icon;

  const sizes = {
    sm: { container: 80, stroke: 6, icon: 16, text: 'text-sm', label: 'text-xs' },
    md: { container: 100, stroke: 8, icon: 20, text: 'text-lg', label: 'text-xs' },
    lg: { container: 140, stroke: 10, icon: 28, text: 'text-2xl', label: 'text-sm' },
  };

  const s = sizes[size];
  const radius = (s.container - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colorClasses = {
    success: {
      stroke: 'stroke-success-500',
      text: 'text-success-600 dark:text-success-400',
      bg: 'bg-success-100 dark:bg-success-900/30',
    },
    warning: {
      stroke: 'stroke-warning-500',
      text: 'text-warning-600 dark:text-warning-400',
      bg: 'bg-warning-100 dark:bg-warning-900/30',
    },
    error: {
      stroke: 'stroke-error-500',
      text: 'text-error-600 dark:text-error-400',
      bg: 'bg-error-100 dark:bg-error-900/30',
    },
  };

  const colors = colorClasses[status];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: s.container, height: s.container }}>
        <svg
          width={s.container}
          height={s.container}
          viewBox={`0 0 ${s.container} ${s.container}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={s.container / 2}
            cy={s.container / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-neutral-200 dark:text-neutral-700"
          />

          {/* Progress circle */}
          <motion.circle
            cx={s.container / 2}
            cy={s.container / 2}
            r={radius}
            fill="none"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            className={colors.stroke}
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={cn('mb-1', colors.text)} style={{ width: s.icon, height: s.icon }} />
          <span className={cn('font-bold', s.text, colors.text)}>
            {value}
            <span className="text-xs font-normal ml-0.5">{config.unit}</span>
          </span>
        </div>
      </div>

      <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', s.label)}>
        {config.label}
      </span>
    </div>
  );
}

// Linear gauge/bar component
interface LinearGaugeProps {
  value: number;
  config: GaugeConfig;
  showLabel?: boolean;
}

function LinearGauge({ value, config, showLabel = true }: LinearGaugeProps) {
  const status = getStatusColor(value, config.thresholds);
  const Icon = config.icon;

  const colorClasses = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          {showLabel && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {config.label}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
          {value}{config.unit}
        </span>
      </div>

      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colorClasses[status])}
        />
      </div>
    </div>
  );
}

// Main System Health Monitor component
export interface SystemHealthMonitorProps {
  metrics: SystemMetrics;
  variant?: 'circular' | 'linear' | 'compact';
  title?: string;
  showOverallStatus?: boolean;
  className?: string;
}

export function SystemHealthMonitor({
  metrics,
  variant = 'circular',
  title = 'System Health',
  showOverallStatus = true,
  className,
}: SystemHealthMonitorProps) {
  // Calculate overall system health
  const overallHealth = useMemo(() => {
    const avgUsage = (metrics.cpu + metrics.memory + metrics.disk) / 3;
    if (avgUsage >= 90) return { status: 'critical', label: 'Critical', color: 'error' };
    if (avgUsage >= 70) return { status: 'warning', label: 'Warning', color: 'warning' };
    return { status: 'healthy', label: 'Healthy', color: 'success' };
  }, [metrics]);

  const StatusIcon = overallHealth.status === 'critical'
    ? AlertTriangle
    : overallHealth.status === 'warning'
      ? AlertTriangle
      : CheckCircle2;

  const statusColors = {
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
  };

  const statusBgColors = {
    success: 'bg-success-50 dark:bg-success-900/20',
    warning: 'bg-warning-50 dark:bg-warning-900/20',
    error: 'bg-error-50 dark:bg-error-900/20',
  };

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-4 gap-3', className)}>
        {Object.entries(gaugeConfigs).map(([key, config]) => {
          const value = metrics[key as keyof Omit<SystemMetrics, 'timestamp'>];
          const status = getStatusColor(value, config.thresholds);
          const Icon = config.icon;

          return (
            <div
              key={key}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-xl',
                'bg-neutral-50 dark:bg-neutral-800/50'
              )}
            >
              <Icon className={cn('w-5 h-5', statusColors[status])} />
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {value}
                <span className="text-xs text-neutral-500">{config.unit}</span>
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Server className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Server performance metrics
              </p>
            </div>
          </div>

          {/* Overall status badge */}
          {showOverallStatus && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl',
                statusBgColors[overallHealth.color as keyof typeof statusBgColors]
              )}
            >
              <StatusIcon
                className={cn(
                  'w-4 h-4',
                  statusColors[overallHealth.color as keyof typeof statusColors]
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  statusColors[overallHealth.color as keyof typeof statusColors]
                )}
              >
                {overallHealth.label}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {variant === 'circular' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {Object.entries(gaugeConfigs).map(([key, config]) => (
              <CircularGauge
                key={key}
                value={metrics[key as keyof Omit<SystemMetrics, 'timestamp'>]}
                config={config}
                size="md"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(gaugeConfigs).map(([key, config]) => (
              <LinearGauge
                key={key}
                value={metrics[key as keyof Omit<SystemMetrics, 'timestamp'>]}
                config={config}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Simple gauge for embedding in other components
export interface SimpleGaugeProps {
  value: number;
  label: string;
  icon?: React.ElementType;
  thresholds?: { warning: number; critical: number };
  className?: string;
}

export function SimpleGauge({
  value,
  label,
  icon: Icon = Activity,
  thresholds = { warning: 70, critical: 90 },
  className,
}: SimpleGaugeProps) {
  const status = getStatusColor(value, thresholds);

  const colorClasses = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  const textColors = {
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  };

  return (
    <div className={cn('p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </span>
        </div>
        <span className={cn('text-lg font-bold', textColors[status])}>
          {value}%
        </span>
      </div>

      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className={cn('h-full rounded-full', colorClasses[status])}
        />
      </div>
    </div>
  );
}

export default SystemHealthMonitor;
