/**
 * RustPress Plugin Reviews & Ratings System
 * Phase 3: Enhancements 21-28
 *
 * Enhancement 21: Star Rating Display
 * Enhancement 22: Review Cards
 * Enhancement 23: Rating Breakdown Chart
 * Enhancement 24: Review Form
 * Enhancement 25: Review Filters
 * Enhancement 26: Helpful Voting
 * Enhancement 27: Developer Response System
 * Enhancement 28: Review Summary
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Flag,
  MoreHorizontal,
  Check,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit3,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  PenTool,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
  reviewCount?: number;
  joinDate?: string;
}

export interface DeveloperResponse {
  id: string;
  content: string;
  date: string;
  authorName: string;
  authorAvatar?: string;
}

export interface PluginReview {
  id: string;
  author: ReviewAuthor;
  rating: number;
  title: string;
  content: string;
  date: string;
  version: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote?: 'helpful' | 'not-helpful' | null;
  response?: DeveloperResponse;
  pros?: string[];
  cons?: string[];
  isVerifiedPurchase?: boolean;
  isEdited?: boolean;
}

export interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown[];
  recommendationRate: number;
  sentimentScore: number; // -100 to 100
}

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' | 'controversial';
export type ReviewFilterOption = 'all' | '5-star' | '4-star' | '3-star' | '2-star' | '1-star' | 'with-response' | 'verified';

// ============================================================================
// Enhancement 21: Star Rating Display
// ============================================================================

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? rating;

  const sizeConfig = {
    xs: { star: 'w-3 h-3', gap: 'gap-0.5', text: 'text-xs' },
    sm: { star: 'w-4 h-4', gap: 'gap-0.5', text: 'text-sm' },
    md: { star: 'w-5 h-5', gap: 'gap-1', text: 'text-base' },
    lg: { star: 'w-6 h-6', gap: 'gap-1', text: 'text-lg' },
  };

  const config = sizeConfig[size];

  const renderStar = (index: number) => {
    const filled = displayRating >= index + 1;
    const halfFilled = displayRating >= index + 0.5 && displayRating < index + 1;

    const starClasses = cn(
      config.star,
      'transition-colors',
      filled || halfFilled ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
    );

    if (halfFilled) {
      return (
        <div key={index} className="relative">
          <Star className={cn(starClasses, 'text-neutral-300 dark:text-neutral-600')} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(starClasses, 'text-yellow-400 fill-yellow-400')} />
          </div>
        </div>
      );
    }

    return (
      <Star
        key={index}
        className={cn(starClasses, filled && 'fill-yellow-400')}
      />
    );
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      <div
        className={cn('flex items-center', config.gap, interactive && 'cursor-pointer')}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, i) => (
          <span
            key={i}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
          >
            {renderStar(i)}
          </span>
        ))}
      </div>
      {showValue && (
        <span className={cn('font-medium text-neutral-900 dark:text-white', config.text)}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Enhancement 22: Review Cards
// ============================================================================

interface ReviewCardProps {
  review: PluginReview;
  onVote?: (reviewId: string, vote: 'helpful' | 'not-helpful') => void;
  onReport?: (reviewId: string) => void;
  showResponse?: boolean;
}

export function ReviewCard({ review, onVote, onReport, showResponse = true }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const needsExpansion = review.content.length > 300;
  const displayContent = needsExpansion && !isExpanded
    ? review.content.slice(0, 300) + '...'
    : review.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-5 rounded-xl',
        'border border-neutral-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900',
        'hover:border-neutral-300 dark:hover:border-neutral-600',
        'transition-colors'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {review.author.avatar ? (
            <img
              src={review.author.avatar}
              alt={review.author.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}

          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 dark:text-white">
                {review.author.name}
              </span>
              {review.author.isVerified && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              )}
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  <Shield className="w-3 h-3" />
                  Purchased
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {review.date}
              </span>
              <span>·</span>
              <span>v{review.version}</span>
              {review.isEdited && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Edited
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-neutral-500">{review.rating}/5</span>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
          {review.title}
        </h4>
      )}

      {/* Content */}
      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
        {displayContent}
      </p>
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Pros & Cons */}
      {(review.pros?.length || review.cons?.length) && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {review.pros && review.pros.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                Pros
              </p>
              <ul className="space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Cons
              </p>
              <ul className="space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <HelpfulVoting
          reviewId={review.id}
          helpfulCount={review.helpfulCount}
          notHelpfulCount={review.notHelpfulCount}
          userVote={review.userVote}
          onVote={onVote}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReport?.(review.id)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg',
              'text-xs text-neutral-500',
              'hover:text-neutral-700 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
          >
            <Flag className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </div>

      {/* Developer Response */}
      {showResponse && review.response && (
        <DeveloperResponseCard response={review.response} />
      )}
    </motion.div>
  );
}

// ============================================================================
// Enhancement 23: Rating Breakdown Chart
// ============================================================================

interface RatingBreakdownChartProps {
  stats: ReviewStats;
  onFilterClick?: (stars: number) => void;
}

export function RatingBreakdownChart({ stats, onFilterClick }: RatingBreakdownChartProps) {
  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-neutral-900 dark:text-white">
            {stats.averageRating.toFixed(1)}
          </div>
          <StarRating rating={stats.averageRating} size="sm" />
          <p className="text-xs text-neutral-500 mt-1">
            {stats.totalReviews.toLocaleString()} reviews
          </p>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2">
          {stats.breakdown.map((item) => (
            <button
              key={item.stars}
              onClick={() => onFilterClick?.(item.stars)}
              className={cn(
                'w-full flex items-center gap-2 group',
                'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                'rounded-lg p-1 -mx-1',
                'transition-colors'
              )}
            >
              <span className="w-12 text-xs text-neutral-600 dark:text-neutral-400 text-right">
                {item.stars} star
              </span>
              <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    item.stars >= 4 ? 'bg-green-500' :
                    item.stars === 3 ? 'bg-yellow-500' :
                    'bg-red-500'
                  )}
                />
              </div>
              <span className="w-10 text-xs text-neutral-500 text-right">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-semibold text-neutral-900 dark:text-white">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            {stats.recommendationRate}%
          </div>
          <p className="text-xs text-neutral-500">Would recommend</p>
        </div>
        <div className="text-center">
          <div className={cn(
            'flex items-center justify-center gap-1 text-lg font-semibold',
            stats.sentimentScore >= 50 ? 'text-green-600 dark:text-green-400' :
            stats.sentimentScore >= 0 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          )}>
            {stats.sentimentScore >= 50 ? (
              <TrendingUp className="w-4 h-4" />
            ) : stats.sentimentScore >= 0 ? (
              <Minus className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {stats.sentimentScore > 0 ? '+' : ''}{stats.sentimentScore}
          </div>
          <p className="text-xs text-neutral-500">Sentiment score</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 24: Review Form
// ============================================================================

interface ReviewFormProps {
  pluginId: string;
  pluginName: string;
  existingReview?: PluginReview;
  onSubmit: (review: Omit<PluginReview, 'id' | 'date' | 'helpfulCount' | 'notHelpfulCount' | 'userVote'>) => void;
  onCancel?: () => void;
}

export function ReviewForm({ pluginId, pluginName, existingReview, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? '');
  const [content, setContent] = useState(existingReview?.content ?? '');
  const [pros, setPros] = useState<string[]>(existingReview?.pros ?? []);
  const [cons, setCons] = useState<string[]>(existingReview?.cons ?? []);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = rating > 0 && content.trim().length >= 10;

  const handleAddPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const handleAddCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        author: {
          id: 'current-user',
          name: 'You',
          isVerified: true,
        },
        rating,
        title,
        content,
        version: '2.5.0', // Would come from plugin data
        pros: pros.length > 0 ? pros : undefined,
        cons: cons.length > 0 ? cons : undefined,
        isVerifiedPurchase: true,
        isEdited: !!existingReview,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Rating Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          <span className="text-sm text-neutral-500">
            {rating === 0 && 'Click to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="review-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          maxLength={100}
          className={cn(
            'w-full px-4 py-2 rounded-xl',
            'border border-neutral-300 dark:border-neutral-600',
            'bg-white dark:bg-neutral-800',
            'text-neutral-900 dark:text-white',
            'placeholder-neutral-400',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors'
          )}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label htmlFor="review-content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you like or dislike about this plugin?"
          rows={5}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'border border-neutral-300 dark:border-neutral-600',
            'bg-white dark:bg-neutral-800',
            'text-neutral-900 dark:text-white',
            'placeholder-neutral-400',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'resize-none transition-colors'
          )}
        />
        <p className="text-xs text-neutral-500">
          {content.length}/1000 characters (minimum 10)
        </p>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pros */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-green-600 dark:text-green-400">
            Pros (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
              placeholder="Add a pro..."
              className={cn(
                'flex-1 px-3 py-1.5 rounded-lg text-sm',
                'border border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'placeholder-neutral-400'
              )}
            />
            <button
              type="button"
              onClick={handleAddPro}
              disabled={!newPro.trim() || pros.length >= 5}
              className={cn(
                'px-3 py-1.5 rounded-lg',
                'bg-green-100 dark:bg-green-900/30',
                'text-green-700 dark:text-green-300',
                'hover:bg-green-200 dark:hover:bg-green-900/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Add
            </button>
          </div>
          <ul className="space-y-1">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="flex-1 text-neutral-700 dark:text-neutral-300">{pro}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePro(index)}
                  className="p-1 text-neutral-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-red-600 dark:text-red-400">
            Cons (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
              placeholder="Add a con..."
              className={cn(
                'flex-1 px-3 py-1.5 rounded-lg text-sm',
                'border border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'placeholder-neutral-400'
              )}
            />
            <button
              type="button"
              onClick={handleAddCon}
              disabled={!newCon.trim() || cons.length >= 5}
              className={cn(
                'px-3 py-1.5 rounded-lg',
                'bg-red-100 dark:bg-red-900/30',
                'text-red-700 dark:text-red-300',
                'hover:bg-red-200 dark:hover:bg-red-900/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Add
            </button>
          </div>
          <ul className="space-y-1">
            {cons.map((con, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="flex-1 text-neutral-700 dark:text-neutral-300">{con}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCon(index)}
                  className="p-1 text-neutral-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-xs text-neutral-500">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Your review will be visible after moderation
        </p>
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                'px-4 py-2 rounded-xl',
                'text-sm font-medium',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'transition-colors'
              )}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'text-sm font-medium',
              'bg-primary-600 hover:bg-primary-700',
              'text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// Enhancement 25: Review Filters
// ============================================================================

interface ReviewFiltersProps {
  sort: ReviewSortOption;
  filter: ReviewFilterOption;
  totalReviews: number;
  filteredCount: number;
  onSortChange: (sort: ReviewSortOption) => void;
  onFilterChange: (filter: ReviewFilterOption) => void;
}

export function ReviewFilters({
  sort,
  filter,
  totalReviews,
  filteredCount,
  onSortChange,
  onFilterChange,
}: ReviewFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions: { value: ReviewSortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'controversial', label: 'Most Controversial' },
  ];

  const filterOptions: { value: ReviewFilterOption; label: string; icon?: React.ElementType }[] = [
    { value: 'all', label: 'All Reviews' },
    { value: '5-star', label: '5 Stars' },
    { value: '4-star', label: '4 Stars' },
    { value: '3-star', label: '3 Stars' },
    { value: '2-star', label: '2 Stars' },
    { value: '1-star', label: '1 Star' },
    { value: 'with-response', label: 'With Response', icon: MessageSquare },
    { value: 'verified', label: 'Verified Purchase', icon: Shield },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span className="font-medium">{filteredCount}</span> of{' '}
          <span className="font-medium">{totalReviews}</span> reviews
        </p>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as ReviewSortOption)}
              className={cn(
                'appearance-none pl-3 pr-8 py-1.5 rounded-lg',
                'text-sm font-medium',
                'border border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'cursor-pointer'
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              'text-sm font-medium',
              'border transition-colors',
              showFilters || filter !== 'all'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {filter !== 'all' && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = filter === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                      'text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    )}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 26: Helpful Voting
// ============================================================================

interface HelpfulVotingProps {
  reviewId: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote?: 'helpful' | 'not-helpful' | null;
  onVote?: (reviewId: string, vote: 'helpful' | 'not-helpful') => void;
}

export function HelpfulVoting({
  reviewId,
  helpfulCount,
  notHelpfulCount,
  userVote,
  onVote,
}: HelpfulVotingProps) {
  const handleVote = (vote: 'helpful' | 'not-helpful') => {
    onVote?.(reviewId, vote);
  };

  const totalVotes = helpfulCount + notHelpfulCount;
  const helpfulPercentage = totalVotes > 0 ? Math.round((helpfulCount / totalVotes) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500">Was this helpful?</span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote('helpful')}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg',
            'text-sm transition-colors',
            userVote === 'helpful'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          )}
        >
          <ThumbsUp className={cn('w-4 h-4', userVote === 'helpful' && 'fill-current')} />
          <span>{helpfulCount}</span>
        </button>

        <button
          onClick={() => handleVote('not-helpful')}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg',
            'text-sm transition-colors',
            userVote === 'not-helpful'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          )}
        >
          <ThumbsDown className={cn('w-4 h-4', userVote === 'not-helpful' && 'fill-current')} />
          <span>{notHelpfulCount}</span>
        </button>
      </div>

      {totalVotes >= 5 && (
        <span className="text-xs text-neutral-400">
          {helpfulPercentage}% found helpful
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Enhancement 27: Developer Response System
// ============================================================================

interface DeveloperResponseCardProps {
  response: DeveloperResponse;
}

export function DeveloperResponseCard({ response }: DeveloperResponseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const needsExpansion = response.content.length > 200;
  const displayContent = needsExpansion && !isExpanded
    ? response.content.slice(0, 200) + '...'
    : response.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mt-4 p-4 rounded-xl',
        'bg-primary-50 dark:bg-primary-900/20',
        'border border-primary-200 dark:border-primary-800'
      )}
    >
      <div className="flex items-start gap-3">
        {response.authorAvatar ? (
          <img
            src={response.authorAvatar}
            alt={response.authorName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-900 dark:text-primary-100">
              {response.authorName}
            </span>
            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full">
              Developer
            </span>
            <span className="text-xs text-neutral-500">· {response.date}</span>
          </div>

          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
            {displayContent}
          </p>
          {needsExpansion && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface DeveloperResponseFormProps {
  reviewId: string;
  onSubmit: (reviewId: string, content: string) => void;
  onCancel?: () => void;
}

export function DeveloperResponseForm({ reviewId, onSubmit, onCancel }: DeveloperResponseFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) return;

    setIsSubmitting(true);
    try {
      await onSubmit(reviewId, content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your response to this review..."
        rows={3}
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'border border-primary-300 dark:border-primary-700',
          'bg-primary-50 dark:bg-primary-900/20',
          'text-neutral-900 dark:text-white',
          'placeholder-neutral-400',
          'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'resize-none transition-colors'
        )}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'px-3 py-1.5 rounded-lg',
              'text-sm font-medium',
              'text-neutral-600 dark:text-neutral-400',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={content.trim().length < 10 || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'text-sm font-medium',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Posting...' : 'Post Response'}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Enhancement 28: Review Summary
// ============================================================================

interface ReviewSummaryProps {
  stats: ReviewStats;
  highlights?: {
    mostMentionedPros: string[];
    mostMentionedCons: string[];
    commonPhrases: string[];
  };
}

export function ReviewSummary({ stats, highlights }: ReviewSummaryProps) {
  const ratingLabel = useMemo(() => {
    if (stats.averageRating >= 4.5) return 'Exceptional';
    if (stats.averageRating >= 4.0) return 'Very Good';
    if (stats.averageRating >= 3.5) return 'Good';
    if (stats.averageRating >= 3.0) return 'Average';
    if (stats.averageRating >= 2.0) return 'Below Average';
    return 'Poor';
  }, [stats.averageRating]);

  const ratingColor = useMemo(() => {
    if (stats.averageRating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (stats.averageRating >= 4.0) return 'text-green-600 dark:text-green-400';
    if (stats.averageRating >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
    if (stats.averageRating >= 3.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }, [stats.averageRating]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Review Summary
        </h3>
      </div>

      {/* Main Summary Card */}
      <div className={cn(
        'p-6 rounded-2xl',
        'bg-gradient-to-br from-neutral-50 to-neutral-100',
        'dark:from-neutral-800 dark:to-neutral-900',
        'border border-neutral-200 dark:border-neutral-700'
      )}>
        <div className="flex items-start gap-6">
          {/* Rating Circle */}
          <div className="flex-shrink-0 text-center">
            <div className={cn(
              'w-24 h-24 rounded-2xl flex flex-col items-center justify-center',
              'bg-white dark:bg-neutral-800',
              'border-2 border-neutral-200 dark:border-neutral-600'
            )}>
              <span className={cn('text-3xl font-bold', ratingColor)}>
                {stats.averageRating.toFixed(1)}
              </span>
              <StarRating rating={stats.averageRating} size="xs" />
            </div>
            <p className={cn('mt-2 text-sm font-semibold', ratingColor)}>
              {ratingLabel}
            </p>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.totalReviews.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.recommendationRate}%
                </p>
                <p className="text-xs text-neutral-500">Recommend</p>
              </div>
              <div className="text-center">
                <p className={cn(
                  'text-2xl font-bold',
                  stats.sentimentScore >= 50 ? 'text-green-600 dark:text-green-400' :
                  stats.sentimentScore >= 0 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                )}>
                  {stats.sentimentScore > 0 ? '+' : ''}{stats.sentimentScore}
                </p>
                <p className="text-xs text-neutral-500">Sentiment</p>
              </div>
            </div>

            {/* Mini Breakdown */}
            <div className="space-y-1.5">
              {stats.breakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-neutral-500 text-right">{item.stars}★</span>
                  <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        item.stars >= 4 ? 'bg-green-500' :
                        item.stars === 3 ? 'bg-yellow-500' :
                        'bg-red-500'
                      )}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-neutral-400">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Highlights */}
      {highlights && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              AI-Generated Highlights
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Most Mentioned Pros */}
            {highlights.mostMentionedPros.length > 0 && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-2">
                  What Users Love
                </p>
                <ul className="space-y-1">
                  {highlights.mostMentionedPros.slice(0, 3).map((pro, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Most Mentioned Cons */}
            {highlights.mostMentionedCons.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase mb-2">
                  Areas for Improvement
                </p>
                <ul className="space-y-1">
                  {highlights.mostMentionedCons.slice(0, 3).map((con, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Common Phrases */}
          {highlights.commonPhrases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {highlights.commonPhrases.map((phrase, index) => (
                <span
                  key={index}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm',
                    'bg-neutral-100 dark:bg-neutral-800',
                    'text-neutral-700 dark:text-neutral-300'
                  )}
                >
                  "{phrase}"
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Reviews Section Component
// ============================================================================

interface PluginReviewsSectionProps {
  pluginId: string;
  pluginName: string;
  reviews: PluginReview[];
  stats: ReviewStats;
  highlights?: ReviewSummaryProps['highlights'];
  onWriteReview?: () => void;
  onVote?: (reviewId: string, vote: 'helpful' | 'not-helpful') => void;
  onReport?: (reviewId: string) => void;
}

export function PluginReviewsSection({
  pluginId,
  pluginName,
  reviews,
  stats,
  highlights,
  onWriteReview,
  onVote,
  onReport,
}: PluginReviewsSectionProps) {
  const [sort, setSort] = useState<ReviewSortOption>('newest');
  const [filter, setFilter] = useState<ReviewFilterOption>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Apply filter
    switch (filter) {
      case '5-star':
        result = result.filter((r) => r.rating === 5);
        break;
      case '4-star':
        result = result.filter((r) => r.rating === 4);
        break;
      case '3-star':
        result = result.filter((r) => r.rating === 3);
        break;
      case '2-star':
        result = result.filter((r) => r.rating === 2);
        break;
      case '1-star':
        result = result.filter((r) => r.rating === 1);
        break;
      case 'with-response':
        result = result.filter((r) => r.response);
        break;
      case 'verified':
        result = result.filter((r) => r.isVerifiedPurchase);
        break;
    }

    // Apply sort
    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        result.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'controversial':
        result.sort((a, b) => {
          const aScore = Math.min(a.helpfulCount, a.notHelpfulCount);
          const bScore = Math.min(b.helpfulCount, b.notHelpfulCount);
          return bScore - aScore;
        });
        break;
    }

    return result;
  }, [reviews, sort, filter]);

  const handleSubmitReview = async (review: any) => {
    console.log('Submitting review:', review);
    setShowReviewForm(false);
    // Would actually submit to API
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <ReviewSummary stats={stats} highlights={highlights} />

      {/* Rating Breakdown */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
        <RatingBreakdownChart
          stats={stats}
          onFilterClick={(stars) => setFilter(`${stars}-star` as ReviewFilterOption)}
        />
      </div>

      {/* Write Review Button / Form */}
      {showReviewForm ? (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <ReviewForm
            pluginId={pluginId}
            pluginName={pluginName}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowReviewForm(true)}
          className={cn(
            'w-full flex items-center justify-center gap-2 p-4 rounded-xl',
            'border-2 border-dashed border-neutral-300 dark:border-neutral-600',
            'text-neutral-600 dark:text-neutral-400',
            'hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400',
            'transition-colors'
          )}
        >
          <PenTool className="w-5 h-5" />
          Write a Review
        </button>
      )}

      {/* Filters */}
      <ReviewFilters
        sort={sort}
        filter={filter}
        totalReviews={reviews.length}
        filteredCount={filteredReviews.length}
        onSortChange={setSort}
        onFilterChange={setFilter}
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onVote={onVote}
              onReport={onReport}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <p className="text-neutral-500">No reviews match your filters</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sample Data for Testing
// ============================================================================

export const sampleReviewStats: ReviewStats = {
  averageRating: 4.6,
  totalReviews: 2547,
  breakdown: [
    { stars: 5, count: 1820, percentage: 71 },
    { stars: 4, count: 458, percentage: 18 },
    { stars: 3, count: 178, percentage: 7 },
    { stars: 2, count: 64, percentage: 3 },
    { stars: 1, count: 27, percentage: 1 },
  ],
  recommendationRate: 94,
  sentimentScore: 72,
};

export const sampleReviews: PluginReview[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'John Developer',
      avatar: '/avatars/user1.png',
      isVerified: true,
      reviewCount: 23,
      joinDate: '2022-03-15',
    },
    rating: 5,
    title: 'The best SEO plugin for RustPress',
    content: 'I\'ve been using this plugin for 6 months now and it has completely transformed my site\'s SEO. The real-time analysis is incredibly helpful, and the sitemap generation is flawless. The Rust integration makes it blazing fast - no noticeable performance impact at all.',
    date: 'January 10, 2024',
    version: '2.5.0',
    helpfulCount: 145,
    notHelpfulCount: 3,
    userVote: null,
    pros: ['Lightning fast performance', 'Excellent real-time analysis', 'Great documentation'],
    cons: ['Learning curve for beginners'],
    isVerifiedPurchase: true,
    response: {
      id: 'r1',
      content: 'Thank you so much for the kind words, John! We\'re thrilled to hear the plugin has helped your site\'s SEO. We\'re constantly working to make the learning curve easier - stay tuned for our upcoming onboarding improvements!',
      date: 'January 11, 2024',
      authorName: 'RustPress Team',
      authorAvatar: '/avatars/rustpress.png',
    },
  },
  {
    id: '2',
    author: {
      id: 'user2',
      name: 'Sarah Marketing',
      isVerified: false,
      reviewCount: 8,
    },
    rating: 4,
    title: 'Great plugin with room for improvement',
    content: 'Overall a solid SEO solution. The meta tag management and sitemap features work great. Would love to see more social media preview options and better integration with Google Analytics.',
    date: 'January 8, 2024',
    version: '2.4.0',
    helpfulCount: 52,
    notHelpfulCount: 5,
    userVote: 'helpful',
    pros: ['Easy to configure', 'Good sitemap generation'],
    cons: ['Limited social features', 'Could use better analytics'],
    isVerifiedPurchase: true,
  },
  {
    id: '3',
    author: {
      id: 'user3',
      name: 'Mike Builder',
      avatar: '/avatars/user3.png',
      isVerified: true,
      reviewCount: 156,
    },
    rating: 5,
    title: 'A must-have for any RustPress site',
    content: 'After trying several SEO plugins, this one stands out for its performance and comprehensive feature set. The schema markup support is excellent, and the redirect manager has saved me countless hours.',
    date: 'January 5, 2024',
    version: '2.5.0',
    helpfulCount: 89,
    notHelpfulCount: 2,
    userVote: null,
    isVerifiedPurchase: true,
    isEdited: true,
  },
];

export const sampleHighlights = {
  mostMentionedPros: [
    'Fast performance',
    'Easy to use',
    'Comprehensive features',
    'Great support',
  ],
  mostMentionedCons: [
    'Learning curve',
    'Limited free version',
    'Documentation could be better',
  ],
  commonPhrases: [
    'blazing fast',
    'must-have',
    'highly recommend',
    'great value',
  ],
};

export default PluginReviewsSection;
