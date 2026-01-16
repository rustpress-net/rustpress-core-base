/**
 * RustPress Uptime Status Indicator Component
 * Green/yellow/red site status with uptime percentage and response time
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Clock,
  Activity,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../utils';
import { Card, CardHeader, CardBody } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { UptimeStatus } from '../../store/dashboardStore';

// Status configuration
interface StatusConfig {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pulseColor: string;
}

const statusConfigs: Record<UptimeStatus['status'], StatusConfig> = {
  operational: {
    icon: CheckCircle2,
    label: 'Operational',
    description: 'All systems are running normally',
    color: 'text-success-500',
    bgColor: 'bg-success-50 dark:bg-success-900/20',
    borderColor: 'border-success-200 dark:border-success-800',
    pulseColor: 'bg-success-500',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Degraded',
    description: 'Some systems experiencing issues',
    color: 'text-warning-500',
    bgColor: 'bg-warning-50 dark:bg-warning-900/20',
    borderColor: 'border-warning-200 dark:border-warning-800',
    pulseColor: 'bg-warning-500',
  },
  down: {
    icon: XCircle,
    label: 'Down',
    description: 'Major outage in progress',
    color: 'text-error-500',
    bgColor: 'bg-error-50 dark:bg-error-900/20',
    borderColor: 'border-error-200 dark:border-error-800',
    pulseColor: 'bg-error-500',
  },
};

// Uptime bar showing recent status
interface UptimeBarProps {
  uptime: number;
  days?: number;
}

function UptimeBar({ uptime, days = 30 }: UptimeBarProps) {
  // Generate mock daily uptime data
  const dailyUptime = Array.from({ length: days }, (_, i) => {
    const baseUptime = uptime;
    const variance = Math.random() * 2 - 1; // -1 to 1
    return Math.max(0, Math.min(100, baseUptime + variance));
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>{days} days ago</span>
        <span>Today</span>
      </div>

      <div className="flex gap-0.5 h-8">
        {dailyUptime.map((dayUptime, index) => {
          let color = 'bg-success-400 dark:bg-success-500';
          if (dayUptime < 99) color = 'bg-warning-400 dark:bg-warning-500';
          if (dayUptime < 95) color = 'bg-error-400 dark:bg-error-500';

          return (
            <motion.div
              key={index}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                'flex-1 rounded-sm origin-bottom cursor-pointer',
                'hover:opacity-80 transition-opacity',
                color
              )}
              title={`${dayUptime.toFixed(2)}% uptime`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-success-400" />
          <span className="text-neutral-500 dark:text-neutral-400">{'≥99%'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-warning-400" />
          <span className="text-neutral-500 dark:text-neutral-400">{'≥95%'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-error-400" />
          <span className="text-neutral-500 dark:text-neutral-400">{'<95%'}</span>
        </div>
      </div>
    </div>
  );
}

// Response time indicator
interface ResponseTimeProps {
  responseTime: number;
}

function ResponseTimeIndicator({ responseTime }: ResponseTimeProps) {
  let status: 'fast' | 'normal' | 'slow' = 'fast';
  if (responseTime > 500) status = 'slow';
  else if (responseTime > 200) status = 'normal';

  const statusColors = {
    fast: 'text-success-500',
    normal: 'text-warning-500',
    slow: 'text-error-500',
  };

  const statusLabels = {
    fast: 'Excellent',
    normal: 'Good',
    slow: 'Slow',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-neutral-400" />
        <span className="text-sm text-neutral-600 dark:text-neutral-300">Response Time</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-lg font-bold', statusColors[status])}>
          {responseTime}ms
        </span>
        <Badge variant={status === 'fast' ? 'success' : status === 'normal' ? 'warning' : 'error'} size="xs">
          {statusLabels[status]}
        </Badge>
      </div>
    </div>
  );
}

// Main UptimeStatusIndicator component
export interface UptimeStatusIndicatorProps {
  status: UptimeStatus;
  title?: string;
  showUptimeBar?: boolean;
  showResponseTime?: boolean;
  showLastIncident?: boolean;
  onRefresh?: () => void;
  onViewStatusPage?: () => void;
  className?: string;
}

export function UptimeStatusIndicator({
  status,
  title = 'Site Status',
  showUptimeBar = true,
  showResponseTime = true,
  showLastIncident = true,
  onRefresh,
  onViewStatusPage,
  className,
}: UptimeStatusIndicatorProps) {
  const config = statusConfigs[status.status];
  const Icon = config.icon;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Activity className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {status.uptime.toFixed(2)}% uptime
              </p>
            </div>
          </div>

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-neutral-500"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Status banner */}
        <div
          className={cn(
            'relative p-4 rounded-xl border-2',
            config.bgColor,
            config.borderColor
          )}
        >
          <div className="flex items-center gap-4">
            {/* Pulsing indicator */}
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={cn(
                  'absolute inset-0 rounded-full',
                  config.pulseColor,
                  'opacity-30'
                )}
              />
              <div className={cn('relative p-3 rounded-full', config.bgColor)}>
                <Icon className={cn('w-6 h-6', config.color)} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={cn('text-lg font-bold', config.color)}>
                  {config.label}
                </h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Response time */}
        {showResponseTime && (
          <ResponseTimeIndicator responseTime={status.responseTime} />
        )}

        {/* Last incident */}
        {showLastIncident && status.lastIncident && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                Last Incident
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {status.lastIncident}
            </span>
          </div>
        )}

        {/* Uptime bar */}
        {showUptimeBar && (
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Uptime History
            </h4>
            <UptimeBar uptime={status.uptime} />
          </div>
        )}

        {/* View status page link */}
        {onViewStatusPage && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewStatusPage}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Status Page
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

// Compact status badge
export interface StatusBadgeCompactProps {
  status: UptimeStatus['status'];
  uptime?: number;
  showLabel?: boolean;
  className?: string;
}

export function StatusBadgeCompact({
  status,
  uptime,
  showLabel = true,
  className,
}: StatusBadgeCompactProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        config.bgColor,
        className
      )}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className={cn('w-2 h-2 rounded-full', config.pulseColor)}
      />
      {showLabel && (
        <span className={cn('text-sm font-medium', config.color)}>
          {config.label}
        </span>
      )}
      {uptime !== undefined && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {uptime.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// Mini status indicator for headers/navbars
export interface MiniStatusIndicatorProps {
  status: UptimeStatus['status'];
  className?: string;
}

export function MiniStatusIndicator({
  status,
  className,
}: MiniStatusIndicatorProps) {
  const config = statusConfigs[status];

  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
      className={cn('w-2.5 h-2.5 rounded-full', config.pulseColor, className)}
      title={config.label}
    />
  );
}

export default UptimeStatusIndicator;
