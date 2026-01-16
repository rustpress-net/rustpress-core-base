/**
 * Rating Component
 *
 * Enterprise-grade rating components with multiple variants:
 * - Star ratings with half-star support
 * - Thumbs up/down ratings
 * - Emoji ratings
 * - Numeric ratings
 * - Custom icon ratings
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Smile,
  Meh,
  Frown,
  Angry,
  Laugh,
  CircleDot,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type RatingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RatingVariant = 'star' | 'heart' | 'thumbs' | 'emoji' | 'numeric' | 'custom';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: RatingSize;
  variant?: RatingVariant;
  allowHalf?: boolean;
  allowClear?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  label?: string;
  helperText?: string;
  emptyColor?: string;
  fillColor?: string;
  hoverColor?: string;
  customIcon?: LucideIcon;
  customEmptyIcon?: LucideIcon;
  tooltips?: string[];
  className?: string;
}

export interface StarRatingProps extends Omit<RatingProps, 'variant'> {
  precision?: 0.5 | 1;
}

export interface ThumbsRatingProps {
  value: 'up' | 'down' | null;
  onChange?: (value: 'up' | 'down' | null) => void;
  upCount?: number;
  downCount?: number;
  showCounts?: boolean;
  size?: RatingSize;
  readonly?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface EmojiRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: RatingSize;
  readonly?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  labels?: string[];
  className?: string;
}

export interface NumericRatingProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  size?: RatingSize;
  readonly?: boolean;
  disabled?: boolean;
  showScale?: boolean;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
}

export interface RatingBreakdownProps {
  ratings: { stars: number; count: number; percentage: number }[];
  totalRatings: number;
  averageRating: number;
  showPercentages?: boolean;
  onFilterClick?: (stars: number) => void;
  className?: string;
}

export interface RatingSummaryProps {
  average: number;
  total: number;
  distribution?: { [key: number]: number };
  size?: 'sm' | 'md' | 'lg';
  showDistribution?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const sizeClasses: Record<RatingSize, { icon: string; text: string; gap: string }> = {
  xs: { icon: 'w-3 h-3', text: 'text-xs', gap: 'gap-0.5' },
  sm: { icon: 'w-4 h-4', text: 'text-sm', gap: 'gap-1' },
  md: { icon: 'w-5 h-5', text: 'text-base', gap: 'gap-1' },
  lg: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5' },
  xl: { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2' },
};

const emojiIcons = [Angry, Frown, Meh, Smile, Laugh];
const emojiLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
const emojiColors = [
  'text-red-500',
  'text-orange-500',
  'text-yellow-500',
  'text-lime-500',
  'text-green-500',
];

// ============================================================================
// Rating Component
// ============================================================================

export function Rating({
  value,
  onChange,
  max = 5,
  size = 'md',
  variant = 'star',
  allowHalf = false,
  allowClear = true,
  readonly = false,
  disabled = false,
  showValue = false,
  showCount = false,
  count,
  label,
  helperText,
  emptyColor,
  fillColor,
  hoverColor,
  customIcon,
  customEmptyIcon,
  tooltips,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const sizes = sizeClasses[size];

  const Icon = variant === 'heart' ? Heart : (customIcon || Star);
  const EmptyIcon = customEmptyIcon || Icon;

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = useCallback(
    (index: number, isHalf: boolean = false) => {
      if (readonly || disabled || !onChange) return;

      let newValue = isHalf ? index + 0.5 : index + 1;

      // Allow clearing by clicking on the current value
      if (allowClear && newValue === value) {
        newValue = 0;
      }

      onChange(newValue);
    },
    [readonly, disabled, onChange, allowClear, value]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
      if (readonly || disabled) return;

      if (allowHalf) {
        const rect = e.currentTarget.getBoundingClientRect();
        const isHalf = e.clientX - rect.left < rect.width / 2;
        setHoverValue(isHalf ? index + 0.5 : index + 1);
      } else {
        setHoverValue(index + 1);
      }
    },
    [readonly, disabled, allowHalf]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const renderStar = (index: number) => {
    const filled = displayValue >= index + 1;
    const halfFilled = allowHalf && displayValue >= index + 0.5 && displayValue < index + 1;
    const isHovered = hoverValue !== null && hoverValue >= index + 1;
    const isHalfHovered = hoverValue !== null && hoverValue >= index + 0.5 && hoverValue < index + 1;

    const baseColorClass = emptyColor || 'text-neutral-300 dark:text-neutral-600';
    const filledColorClass = fillColor || (variant === 'heart' ? 'text-red-500' : 'text-yellow-400');
    const hoverColorClass = hoverColor || (variant === 'heart' ? 'text-red-400' : 'text-yellow-300');

    return (
      <motion.button
        key={index}
        type="button"
        disabled={disabled || readonly}
        className={cn(
          'relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded',
          !readonly && !disabled && 'cursor-pointer',
          (readonly || disabled) && 'cursor-default'
        )}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
        whileHover={!readonly && !disabled ? { scale: 1.1 } : undefined}
        whileTap={!readonly && !disabled ? { scale: 0.95 } : undefined}
        title={tooltips?.[index]}
      >
        {/* Empty star */}
        <EmptyIcon
          className={cn(
            sizes.icon,
            baseColorClass,
            'transition-colors'
          )}
        />

        {/* Filled overlay */}
        <div
          className={cn(
            'absolute inset-0 overflow-hidden transition-all',
            (filled || halfFilled || isHovered || isHalfHovered) ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            width: halfFilled || isHalfHovered ? '50%' : '100%',
          }}
        >
          <Icon
            className={cn(
              sizes.icon,
              isHovered || isHalfHovered ? hoverColorClass : filledColorClass,
              'fill-current'
            )}
          />
        </div>
      </motion.button>
    );
  };

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {label && (
        <label className={cn('mb-1 font-medium text-neutral-700 dark:text-neutral-300', sizes.text)}>
          {label}
        </label>
      )}

      <div className={cn('flex items-center', sizes.gap)}>
        <div
          className={cn('flex items-center', sizes.gap)}
          onMouseLeave={handleMouseLeave}
        >
          {Array.from({ length: max }, (_, i) => renderStar(i))}
        </div>

        {showValue && (
          <span className={cn('ml-2 font-medium text-neutral-600 dark:text-neutral-400', sizes.text)}>
            {displayValue.toFixed(allowHalf ? 1 : 0)}
          </span>
        )}

        {showCount && count !== undefined && (
          <span className={cn('text-neutral-500 dark:text-neutral-500', sizes.text)}>
            ({count.toLocaleString()})
          </span>
        )}
      </div>

      {helperText && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Star Rating Component
// ============================================================================

export function StarRating({
  precision = 1,
  ...props
}: StarRatingProps) {
  return (
    <Rating
      {...props}
      variant="star"
      allowHalf={precision === 0.5}
    />
  );
}

// ============================================================================
// Heart Rating Component
// ============================================================================

export function HeartRating(props: Omit<RatingProps, 'variant'>) {
  return (
    <Rating
      {...props}
      variant="heart"
      fillColor="text-red-500"
      hoverColor="text-red-400"
    />
  );
}

// ============================================================================
// Thumbs Rating Component
// ============================================================================

export function ThumbsRating({
  value,
  onChange,
  upCount,
  downCount,
  showCounts = true,
  size = 'md',
  readonly = false,
  disabled = false,
  className,
}: ThumbsRatingProps) {
  const sizes = sizeClasses[size];

  const handleClick = (type: 'up' | 'down') => {
    if (readonly || disabled || !onChange) return;
    onChange(value === type ? null : type);
  };

  return (
    <div className={cn('inline-flex items-center', sizes.gap, className)}>
      <motion.button
        type="button"
        disabled={disabled || readonly}
        onClick={() => handleClick('up')}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          value === 'up'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-green-600 dark:hover:text-green-400',
          (readonly || disabled) && 'cursor-default opacity-60'
        )}
        whileHover={!readonly && !disabled ? { scale: 1.05 } : undefined}
        whileTap={!readonly && !disabled ? { scale: 0.95 } : undefined}
      >
        <ThumbsUp className={cn(sizes.icon, value === 'up' && 'fill-current')} />
        {showCounts && upCount !== undefined && (
          <span className={sizes.text}>{upCount.toLocaleString()}</span>
        )}
      </motion.button>

      <motion.button
        type="button"
        disabled={disabled || readonly}
        onClick={() => handleClick('down')}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          value === 'down'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-600 dark:hover:text-red-400',
          (readonly || disabled) && 'cursor-default opacity-60'
        )}
        whileHover={!readonly && !disabled ? { scale: 1.05 } : undefined}
        whileTap={!readonly && !disabled ? { scale: 0.95 } : undefined}
      >
        <ThumbsDown className={cn(sizes.icon, value === 'down' && 'fill-current')} />
        {showCounts && downCount !== undefined && (
          <span className={sizes.text}>{downCount.toLocaleString()}</span>
        )}
      </motion.button>
    </div>
  );
}

// ============================================================================
// Emoji Rating Component
// ============================================================================

export function EmojiRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  disabled = false,
  showLabel = true,
  labels = emojiLabels,
  className,
}: EmojiRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const sizes = sizeClasses[size];
  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className={cn('flex items-center', sizes.gap)}>
        {emojiIcons.map((Icon, index) => {
          const isSelected = displayValue === index + 1;
          const isActive = displayValue >= index + 1;

          return (
            <motion.button
              key={index}
              type="button"
              disabled={disabled || readonly}
              onClick={() => !readonly && !disabled && onChange?.(index + 1)}
              onMouseEnter={() => !readonly && !disabled && setHoverValue(index + 1)}
              onMouseLeave={() => setHoverValue(null)}
              className={cn(
                'p-1 rounded-full transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isSelected
                  ? cn('bg-neutral-100 dark:bg-neutral-800', emojiColors[index])
                  : 'text-neutral-400 dark:text-neutral-600',
                !readonly && !disabled && 'cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-400',
                (readonly || disabled) && 'cursor-default'
              )}
              whileHover={!readonly && !disabled ? { scale: 1.2 } : undefined}
              whileTap={!readonly && !disabled ? { scale: 0.9 } : undefined}
            >
              <Icon className={cn(sizes.icon, isSelected && 'fill-current')} />
            </motion.button>
          );
        })}
      </div>

      {showLabel && displayValue > 0 && (
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mt-2 font-medium', sizes.text, emojiColors[displayValue - 1])}
        >
          {labels[displayValue - 1]}
        </motion.span>
      )}
    </div>
  );
}

// ============================================================================
// Numeric Rating Component (NPS Style)
// ============================================================================

export function NumericRating({
  value,
  onChange,
  min = 0,
  max = 10,
  size = 'md',
  readonly = false,
  disabled = false,
  showScale = true,
  lowLabel = 'Not likely',
  highLabel = 'Very likely',
  className,
}: NumericRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const sizes = sizeClasses[size];
  const displayValue = hoverValue !== null ? hoverValue : value;

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const getColor = (num: number) => {
    const percentage = (num - min) / (max - min);
    if (percentage <= 0.3) return 'bg-red-500 text-white';
    if (percentage <= 0.6) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <div className={cn('flex items-center', sizes.gap)}>
        {numbers.map((num) => {
          const isSelected = value === num;
          const isHovered = hoverValue === num;

          return (
            <motion.button
              key={num}
              type="button"
              disabled={disabled || readonly}
              onClick={() => !readonly && !disabled && onChange?.(num)}
              onMouseEnter={() => !readonly && !disabled && setHoverValue(num)}
              onMouseLeave={() => setHoverValue(null)}
              className={cn(
                'w-8 h-8 rounded-lg font-medium transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isSelected || isHovered
                  ? getColor(num)
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
                !readonly && !disabled && 'cursor-pointer hover:opacity-80',
                (readonly || disabled) && 'cursor-default opacity-60',
                sizes.text
              )}
              whileHover={!readonly && !disabled ? { scale: 1.1 } : undefined}
              whileTap={!readonly && !disabled ? { scale: 0.95 } : undefined}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {showScale && (
        <div className="flex justify-between mt-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{lowLabel}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{highLabel}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Rating Breakdown Component
// ============================================================================

export function RatingBreakdown({
  ratings,
  totalRatings,
  averageRating,
  showPercentages = true,
  onFilterClick,
  className,
}: RatingBreakdownProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-6', className)}>
      {/* Average Rating */}
      <div className="flex flex-col items-center justify-center px-6">
        <div className="text-4xl font-bold text-neutral-900 dark:text-white">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i < Math.round(averageRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-neutral-300 dark:text-neutral-600'
              )}
            />
          ))}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {totalRatings.toLocaleString()} ratings
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="flex-1 space-y-2">
        {ratings.map(({ stars, count, percentage }) => (
          <button
            key={stars}
            onClick={() => onFilterClick?.(stars)}
            className={cn(
              'w-full flex items-center gap-3 group',
              onFilterClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 -mx-2 px-2 py-1 rounded'
            )}
          >
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{stars}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>

            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-yellow-400 rounded-full"
              />
            </div>

            {showPercentages && (
              <span className="w-12 text-right text-sm text-neutral-500 dark:text-neutral-400">
                {percentage}%
              </span>
            )}

            <span className="w-16 text-right text-sm text-neutral-500 dark:text-neutral-400">
              ({count.toLocaleString()})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Rating Summary Component
// ============================================================================

export function RatingSummary({
  average,
  total,
  distribution,
  size = 'md',
  showDistribution = true,
  className,
}: RatingSummaryProps) {
  const sizeStyles = {
    sm: { rating: 'text-2xl', stars: 'w-3 h-3' },
    md: { rating: 'text-3xl', stars: 'w-4 h-4' },
    lg: { rating: 'text-4xl', stars: 'w-5 h-5' },
  };

  const styles = sizeStyles[size];
  const maxCount = distribution ? Math.max(...Object.values(distribution)) : 0;

  return (
    <div className={cn('inline-flex items-center gap-4', className)}>
      <div className="flex flex-col items-center">
        <span className={cn('font-bold text-neutral-900 dark:text-white', styles.rating)}>
          {average.toFixed(1)}
        </span>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn(
                styles.stars,
                i < Math.round(average)
                  ? 'text-yellow-400 fill-current'
                  : 'text-neutral-300 dark:text-neutral-600'
              )}
            />
          ))}
        </div>
        <span className="text-xs text-neutral-500 mt-1">
          {total.toLocaleString()} reviews
        </span>
      </div>

      {showDistribution && distribution && (
        <div className="flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-3">{stars}</span>
                <div className="w-20 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Inline Rating Display Component
// ============================================================================

export interface InlineRatingProps {
  value: number;
  max?: number;
  size?: RatingSize;
  showValue?: boolean;
  showMax?: boolean;
  count?: number;
  className?: string;
}

export function InlineRating({
  value,
  max = 5,
  size = 'sm',
  showValue = true,
  showMax = false,
  count,
  className,
}: InlineRatingProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn('inline-flex items-center', sizes.gap, className)}>
      <Star className={cn(sizes.icon, 'text-yellow-400 fill-current')} />
      {showValue && (
        <span className={cn('font-medium text-neutral-900 dark:text-white', sizes.text)}>
          {value.toFixed(1)}
          {showMax && <span className="text-neutral-400">/{max}</span>}
        </span>
      )}
      {count !== undefined && (
        <span className={cn('text-neutral-500 dark:text-neutral-400', sizes.text)}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Rating Input with Label Component
// ============================================================================

export interface RatingFieldProps extends RatingProps {
  error?: string;
  required?: boolean;
}

export function RatingField({
  label,
  error,
  required,
  helperText,
  ...props
}: RatingFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Rating {...props} />

      {(helperText || error) && (
        <p className={cn('text-sm', error ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default Rating;
