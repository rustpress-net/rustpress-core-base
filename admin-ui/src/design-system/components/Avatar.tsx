/**
 * RustPress Avatar Component
 * User profile images with fallback and status
 */

import React, { useState, ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { scaleIn } from '../animations';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  size?: AvatarSize;
  variant?: AvatarVariant;
  name?: string;
  src?: string;
  fallback?: React.ReactNode;
  status?: AvatarStatus;
  showBorder?: boolean;
  isAnimated?: boolean;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-2 h-2 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2.5 h-2.5 border' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-3 h-3 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3.5 h-3.5 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-4 h-4 border-2' },
  '2xl': { container: 'w-20 h-20', text: 'text-xl', status: 'w-5 h-5 border-2' },
};

const variantStyles: Record<AvatarVariant, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded-none',
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success-500',
  offline: 'bg-neutral-400',
  away: 'bg-warning-500',
  busy: 'bg-error-500',
  dnd: 'bg-error-500',
};

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-error-500',
    'bg-info-500',
    'bg-primary-600',
    'bg-accent-600',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({
  size = 'md',
  variant = 'circle',
  name,
  src,
  fallback,
  status,
  showBorder = false,
  isAnimated = false,
  className,
  alt,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = sizeStyles[size];

  const showImage = src && !imageError;
  const showInitials = !showImage && name;
  const showFallback = !showImage && !showInitials;

  const Container = isAnimated ? motion.div : 'div';
  const animationProps = isAnimated
    ? {
        initial: 'initial',
        animate: 'animate',
        variants: scaleIn,
      }
    : {};

  return (
    <Container
      className={cn(
        'relative inline-flex items-center justify-center',
        'flex-shrink-0 overflow-hidden',
        sizeConfig.container,
        variantStyles[variant],
        showBorder && 'ring-2 ring-white dark:ring-neutral-900',
        className
      )}
      {...animationProps}
    >
      {showImage && (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
          {...props}
        />
      )}

      {showInitials && (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            'text-white font-medium',
            sizeConfig.text,
            getAvatarColor(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {showFallback && (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            'bg-neutral-200 dark:bg-neutral-700',
            'text-neutral-500 dark:text-neutral-400'
          )}
        >
          {fallback || (
            <svg
              className={cn('w-1/2 h-1/2')}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0',
            'rounded-full',
            'border-white dark:border-neutral-900',
            sizeConfig.status,
            statusColors[status]
          )}
        />
      )}
    </Container>
  );
}

// Avatar Group
export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  spacing = 'normal',
  className,
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  const spacingStyles = {
    tight: '-space-x-3',
    normal: '-space-x-2',
    loose: '-space-x-1',
  };

  return (
    <div className={cn('flex items-center', spacingStyles[spacing], className)}>
      {visible.map((child, index) =>
        React.cloneElement(child as React.ReactElement<AvatarProps>, {
          size,
          showBorder: true,
          className: cn((child as React.ReactElement).props.className),
          style: { zIndex: visible.length - index },
        })
      )}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center',
            'bg-neutral-200 dark:bg-neutral-700',
            'text-neutral-600 dark:text-neutral-300',
            'font-medium rounded-full',
            'ring-2 ring-white dark:ring-neutral-900',
            sizeStyles[size].container,
            sizeStyles[size].text
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

// Avatar with name
export interface AvatarWithNameProps extends AvatarProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export function AvatarWithName({
  title,
  subtitle,
  action,
  layout = 'horizontal',
  ...avatarProps
}: AvatarWithNameProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        layout === 'vertical' && 'flex-col text-center'
      )}
    >
      <Avatar {...avatarProps} />
      <div className={cn('min-w-0 flex-1', layout === 'vertical' && 'text-center')}>
        {title && (
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {title}
          </p>
        )}
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default Avatar;
