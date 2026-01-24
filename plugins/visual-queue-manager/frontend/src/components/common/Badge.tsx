import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  gray: 'badge-gray',
};

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  gray: 'bg-slate-500',
};

export default function Badge({
  variant = 'gray',
  children,
  className = '',
  dot = false,
  pulse = false,
}: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotClasses[variant]} ${
            pulse ? 'animate-pulse' : ''
          }`}
        />
      )}
      {children}
    </span>
  );
}

// Convenience components for common statuses
export function StatusBadge({
  status,
  className = '',
}: {
  status: string;
  className?: string;
}) {
  const getVariant = (): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'healthy':
      case 'completed':
      case 'success':
      case 'closed':
        return 'success';
      case 'paused':
      case 'idle':
      case 'pending':
      case 'half_open':
        return 'warning';
      case 'failed':
      case 'error':
      case 'unhealthy':
      case 'dead_letter':
      case 'open':
      case 'critical':
        return 'danger';
      case 'draining':
      case 'processing':
        return 'primary';
      default:
        return 'gray';
    }
  };

  const showDot = ['active', 'processing', 'healthy'].includes(status.toLowerCase());
  const showPulse = ['active', 'processing'].includes(status.toLowerCase());

  return (
    <Badge variant={getVariant()} dot={showDot} pulse={showPulse} className={className}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
