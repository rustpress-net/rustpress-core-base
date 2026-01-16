/**
 * StatusIndicator Component (Enhancement #106)
 * Online/offline status displays and connection indicators
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Check,
  X,
  AlertCircle,
  Clock,
  Loader2,
  Circle,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Zap,
  Power,
  Activity,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type Status = 'online' | 'offline' | 'busy' | 'away' | 'dnd' | 'invisible';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export type ServerStatus = 'operational' | 'maintenance' | 'incident' | 'outage';

export interface StatusIndicatorProps {
  status: Status;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  showLabel?: boolean;
  className?: string;
}

export interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onReconnect?: () => void;
  className?: string;
}

export interface OnlineStatusProps {
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onStatusChange?: (online: boolean) => void;
  className?: string;
}

export interface PresenceIndicatorProps {
  status: Status;
  avatar?: React.ReactNode;
  name?: string;
  lastSeen?: Date;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface HealthIndicatorProps {
  status: HealthStatus;
  label?: string;
  details?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge' | 'card';
  className?: string;
}

export interface ServerStatusProps {
  status: ServerStatus;
  name: string;
  lastChecked?: Date;
  uptime?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'detailed';
  className?: string;
}

export interface SignalStrengthProps {
  strength: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export interface LiveIndicatorProps {
  isLive?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge' | 'pulse';
  className?: string;
}

// ============================================================================
// Context for Online Status
// ============================================================================

interface OnlineContextValue {
  isOnline: boolean;
  wasOffline: boolean;
}

const OnlineContext = createContext<OnlineContextValue>({
  isOnline: true,
  wasOffline: false,
});

export function useOnlineStatus() {
  return useContext(OnlineContext);
}

export function OnlineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return (
    <OnlineContext.Provider value={{ isOnline, wasOffline }}>
      {children}
    </OnlineContext.Provider>
  );
}

// ============================================================================
// StatusIndicator Component
// ============================================================================

export function StatusIndicator({
  status,
  size = 'md',
  showPulse = true,
  showLabel = false,
  className = '',
}: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-neutral-400', label: 'Offline' },
    busy: { color: 'bg-red-500', label: 'Busy' },
    away: { color: 'bg-yellow-500', label: 'Away' },
    dnd: { color: 'bg-red-600', label: 'Do Not Disturb' },
    invisible: { color: 'bg-neutral-300', label: 'Invisible' },
  };

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex">
        <span className={`${sizeClasses[size]} ${config.color} rounded-full`} />
        {showPulse && status === 'online' && (
          <motion.span
            className={`absolute inset-0 ${config.color} rounded-full`}
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.7, 0, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </span>
      {showLabel && (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {config.label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// ConnectionIndicator Component
// ============================================================================

export function ConnectionIndicator({
  status,
  size = 'md',
  showLabel = true,
  onReconnect,
  className = '',
}: ConnectionIndicatorProps) {
  const statusConfig = {
    connected: {
      icon: <Wifi />,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      label: 'Connected',
    },
    connecting: {
      icon: <Loader2 className="animate-spin" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      label: 'Connecting...',
    },
    disconnected: {
      icon: <WifiOff />,
      color: 'text-neutral-500',
      bgColor: 'bg-neutral-100 dark:bg-neutral-800',
      label: 'Disconnected',
    },
    error: {
      icon: <AlertCircle />,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      label: 'Connection Error',
    },
    reconnecting: {
      icon: <RefreshCw className="animate-spin" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      label: 'Reconnecting...',
    },
  };

  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1' },
    md: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5' },
    lg: { icon: 'w-6 h-6', text: 'text-base', padding: 'px-4 py-2' },
  };

  const config = statusConfig[status];
  const sizes = sizeClasses[size];

  return (
    <div
      className={`
        inline-flex items-center gap-2
        ${sizes.padding} rounded-full
        ${config.bgColor}
        ${className}
      `}
    >
      <span className={`${sizes.icon} ${config.color}`}>
        {config.icon}
      </span>
      {showLabel && (
        <span className={`${sizes.text} ${config.color} font-medium`}>
          {config.label}
        </span>
      )}
      {(status === 'disconnected' || status === 'error') && onReconnect && (
        <button
          onClick={onReconnect}
          className={`${sizes.text} text-primary-500 hover:text-primary-600 font-medium ml-1`}
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ============================================================================
// OnlineStatus Component
// ============================================================================

export function OnlineStatus({
  showLabel = true,
  showIcon = true,
  size = 'md',
  onStatusChange,
  className = '',
}: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onStatusChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      onStatusChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);

  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-xs' },
    md: { icon: 'w-5 h-5', text: 'text-sm' },
    lg: { icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isOnline ? 'online' : 'offline'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`
          inline-flex items-center gap-2
          ${isOnline ? 'text-green-500' : 'text-red-500'}
          ${className}
        `}
      >
        {showIcon && (
          <span className={sizes.icon}>
            {isOnline ? <Wifi /> : <WifiOff />}
          </span>
        )}
        {showLabel && (
          <span className={`${sizes.text} font-medium`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// PresenceIndicator Component
// ============================================================================

export function PresenceIndicator({
  status,
  avatar,
  name,
  lastSeen,
  showLastSeen = false,
  size = 'md',
  className = '',
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: { avatar: 'w-8 h-8', indicator: 'w-2.5 h-2.5', text: 'text-sm' },
    md: { avatar: 'w-10 h-10', indicator: 'w-3 h-3', text: 'text-base' },
    lg: { avatar: 'w-12 h-12', indicator: 'w-3.5 h-3.5', text: 'text-lg' },
  };

  const sizes = sizeClasses[size];

  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {avatar || (
          <div
            className={`
              ${sizes.avatar} rounded-full
              bg-neutral-200 dark:bg-neutral-700
              flex items-center justify-center
              text-neutral-500 dark:text-neutral-400
            `}
          >
            {name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span
          className={`
            absolute -bottom-0.5 -right-0.5
            ${sizes.indicator}
            rounded-full border-2 border-white dark:border-neutral-900
            ${status === 'online' ? 'bg-green-500' : ''}
            ${status === 'offline' ? 'bg-neutral-400' : ''}
            ${status === 'busy' ? 'bg-red-500' : ''}
            ${status === 'away' ? 'bg-yellow-500' : ''}
            ${status === 'dnd' ? 'bg-red-600' : ''}
            ${status === 'invisible' ? 'bg-neutral-300' : ''}
          `}
        />
      </div>

      {(name || (showLastSeen && lastSeen)) && (
        <div>
          {name && (
            <p className={`font-medium text-neutral-900 dark:text-white ${sizes.text}`}>
              {name}
            </p>
          )}
          {showLastSeen && lastSeen && status === 'offline' && (
            <p className="text-xs text-neutral-500">
              Last seen {getRelativeTime(lastSeen)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HealthIndicator Component
// ============================================================================

export function HealthIndicator({
  status,
  label,
  details,
  size = 'md',
  variant = 'badge',
  className = '',
}: HealthIndicatorProps) {
  const statusConfig = {
    healthy: {
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: <Check className="w-4 h-4" />,
      label: 'Healthy',
    },
    degraded: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Degraded',
    },
    unhealthy: {
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: <X className="w-4 h-4" />,
      label: 'Unhealthy',
    },
    unknown: {
      color: 'bg-neutral-400',
      textColor: 'text-neutral-600 dark:text-neutral-400',
      bgColor: 'bg-neutral-100 dark:bg-neutral-800',
      icon: <Circle className="w-4 h-4" />,
      label: 'Unknown',
    },
  };

  const sizeClasses = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', padding: 'px-2 py-0.5' },
    md: { dot: 'w-2.5 h-2.5', text: 'text-sm', padding: 'px-2.5 py-1' },
    lg: { dot: 'w-3 h-3', text: 'text-base', padding: 'px-3 py-1.5' },
  };

  const config = statusConfig[status];
  const sizes = sizeClasses[size];

  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className={`${sizes.dot} ${config.color} rounded-full`} />
        {label && <span className={`${sizes.text} ${config.textColor}`}>{label}</span>}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`
          p-4 rounded-lg border
          ${config.bgColor}
          border-${status === 'healthy' ? 'green' : status === 'degraded' ? 'yellow' : status === 'unhealthy' ? 'red' : 'neutral'}-200
          dark:border-${status === 'healthy' ? 'green' : status === 'degraded' ? 'yellow' : status === 'unhealthy' ? 'red' : 'neutral'}-800
          ${className}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={config.textColor}>{config.icon}</span>
          <span className={`font-medium ${config.textColor}`}>
            {label || config.label}
          </span>
        </div>
        {details && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {details}
          </p>
        )}
      </div>
    );
  }

  // Badge variant
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizes.padding} ${sizes.text}
        ${config.bgColor} ${config.textColor}
        rounded-full font-medium
        ${className}
      `}
    >
      <span className={`${sizes.dot} ${config.color} rounded-full`} />
      {label || config.label}
    </span>
  );
}

// ============================================================================
// ServerStatus Component
// ============================================================================

export function ServerStatus({
  status,
  name,
  lastChecked,
  uptime,
  size = 'md',
  variant = 'compact',
  className = '',
}: ServerStatusProps) {
  const statusConfig = {
    operational: {
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      label: 'Operational',
    },
    maintenance: {
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      label: 'Maintenance',
    },
    incident: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      label: 'Incident',
    },
    outage: {
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      label: 'Outage',
    },
  };

  const sizeClasses = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', name: 'text-sm' },
    md: { dot: 'w-2.5 h-2.5', text: 'text-sm', name: 'text-base' },
    lg: { dot: 'w-3 h-3', text: 'text-base', name: 'text-lg' },
  };

  const config = statusConfig[status];
  const sizes = sizeClasses[size];

  if (variant === 'detailed') {
    return (
      <div
        className={`
          p-4 rounded-lg
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-700
          ${className}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium text-neutral-900 dark:text-white ${sizes.name}`}>
            {name}
          </span>
          <span
            className={`
              inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
              ${config.textColor} bg-opacity-10
            `}
          >
            <span className={`${sizes.dot} ${config.color} rounded-full`} />
            <span className={sizes.text}>{config.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
          {uptime !== undefined && (
            <span className={sizes.text}>
              <Activity className="inline w-4 h-4 mr-1" />
              {uptime.toFixed(2)}% uptime
            </span>
          )}
          {lastChecked && (
            <span className={sizes.text}>
              <Clock className="inline w-4 h-4 mr-1" />
              Checked {new Date(lastChecked).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className={`text-neutral-700 dark:text-neutral-300 ${sizes.name}`}>
        {name}
      </span>
      <span className={`inline-flex items-center gap-1.5 ${config.textColor}`}>
        <span className={`${sizes.dot} ${config.color} rounded-full`} />
        <span className={sizes.text}>{config.label}</span>
      </span>
    </div>
  );
}

// ============================================================================
// SignalStrength Component
// ============================================================================

export function SignalStrength({
  strength,
  size = 'md',
  showLabel = false,
  className = '',
}: SignalStrengthProps) {
  const getStrengthConfig = (value: number) => {
    if (value >= 75) return { icon: <SignalHigh />, label: 'Excellent', color: 'text-green-500' };
    if (value >= 50) return { icon: <SignalMedium />, label: 'Good', color: 'text-yellow-500' };
    if (value >= 25) return { icon: <SignalLow />, label: 'Fair', color: 'text-orange-500' };
    return { icon: <Signal />, label: 'Poor', color: 'text-red-500' };
  };

  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-xs' },
    md: { icon: 'w-5 h-5', text: 'text-sm' },
    lg: { icon: 'w-6 h-6', text: 'text-base' },
  };

  const config = getStrengthConfig(strength);
  const sizes = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`${sizes.icon} ${config.color}`}>
        {config.icon}
      </span>
      {showLabel && (
        <span className={`${sizes.text} ${config.color}`}>
          {config.label} ({strength}%)
        </span>
      )}
    </div>
  );
}

// ============================================================================
// LiveIndicator Component
// ============================================================================

export function LiveIndicator({
  isLive = true,
  label = 'LIVE',
  size = 'md',
  variant = 'badge',
  className = '',
}: LiveIndicatorProps) {
  const sizeClasses = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', padding: 'px-1.5 py-0.5' },
    md: { dot: 'w-2.5 h-2.5', text: 'text-sm', padding: 'px-2 py-1' },
    lg: { dot: 'w-3 h-3', text: 'text-base', padding: 'px-3 py-1.5' },
  };

  const sizes = sizeClasses[size];

  if (!isLive) {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5
          ${sizes.padding} rounded-full
          bg-neutral-200 dark:bg-neutral-700
          text-neutral-500 dark:text-neutral-400
          ${sizes.text} font-medium uppercase
          ${className}
        `}
      >
        <span className={`${sizes.dot} bg-neutral-400 rounded-full`} />
        Offline
      </span>
    );
  }

  if (variant === 'dot') {
    return (
      <span className="relative inline-flex">
        <span className={`${sizes.dot} bg-red-500 rounded-full`} />
        <motion.span
          className={`absolute inset-0 bg-red-500 rounded-full`}
          animate={{ scale: [1, 1.5, 1.5], opacity: [0.7, 0, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </span>
    );
  }

  if (variant === 'pulse') {
    return (
      <span className={`relative inline-flex items-center gap-1.5 ${className}`}>
        <motion.span
          className={`${sizes.dot} bg-red-500 rounded-full`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className={`${sizes.text} text-red-500 font-bold uppercase`}>
          {label}
        </span>
      </span>
    );
  }

  // Badge variant
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizes.padding} rounded-full
        bg-red-100 dark:bg-red-900/30
        text-red-600 dark:text-red-400
        ${sizes.text} font-bold uppercase
        ${className}
      `}
    >
      <span className="relative inline-flex">
        <span className={`${sizes.dot} bg-red-500 rounded-full`} />
        <motion.span
          className={`absolute inset-0 bg-red-500 rounded-full`}
          animate={{ scale: [1, 1.5, 1.5], opacity: [0.7, 0, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </span>
      {label}
    </span>
  );
}

// ============================================================================
// PowerStatus Component
// ============================================================================

export interface PowerStatusProps {
  isOn: boolean;
  onToggle?: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PowerStatus({
  isOn,
  onToggle,
  label,
  size = 'md',
  className = '',
}: PowerStatusProps) {
  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-xs', button: 'p-1.5' },
    md: { icon: 'w-5 h-5', text: 'text-sm', button: 'p-2' },
    lg: { icon: 'w-6 h-6', text: 'text-base', button: 'p-3' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.button
        onClick={onToggle}
        className={`
          ${sizes.button} rounded-full
          ${isOn
            ? 'bg-green-500 text-white'
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
          }
          transition-colors
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!onToggle}
      >
        <Power className={sizes.icon} />
      </motion.button>
      {label && (
        <span className={`${sizes.text} text-neutral-700 dark:text-neutral-300`}>
          {label}: {isOn ? 'On' : 'Off'}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// ActivityStatus Component
// ============================================================================

export interface ActivityStatusProps {
  isActive: boolean;
  lastActivity?: Date;
  size?: 'sm' | 'md' | 'lg';
  showTime?: boolean;
  className?: string;
}

export function ActivityStatus({
  isActive,
  lastActivity,
  size = 'md',
  showTime = true,
  className = '',
}: ActivityStatusProps) {
  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-xs' },
    md: { icon: 'w-5 h-5', text: 'text-sm' },
    lg: { icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  const getTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.span
        className={`
          ${sizes.icon}
          ${isActive ? 'text-green-500' : 'text-neutral-400'}
        `}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap />
      </motion.span>
      <span className={`${sizes.text} text-neutral-600 dark:text-neutral-400`}>
        {isActive ? 'Active' : showTime && lastActivity ? getTimeAgo(lastActivity) : 'Inactive'}
      </span>
    </div>
  );
}

export default StatusIndicator;
