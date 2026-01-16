/**
 * RustPress Data Cards Component
 * Collection of specialized data display cards
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  MoreHorizontal,
  Clock,
  User,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Profile Card
// ============================================================================

export interface ProfileCardProps {
  name: string;
  role?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  stats?: { label: string; value: number | string }[];
  status?: 'online' | 'offline' | 'busy' | 'away';
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const statusColors = {
  online: 'bg-success-500',
  offline: 'bg-neutral-400',
  busy: 'bg-error-500',
  away: 'bg-warning-500',
};

export function ProfileCard({
  name,
  role,
  avatar,
  email,
  phone,
  location,
  website,
  stats,
  status,
  actions,
  onClick,
  className,
}: ProfileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
        'overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow',
        className
      )}
    >
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-to-r from-primary-500 to-primary-600" />

      {/* Avatar */}
      <div className="relative px-4 -mt-10">
        <div className="relative inline-block">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-full border-4 border-white dark:border-neutral-900 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-neutral-900 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {name.charAt(0)}
              </span>
            </div>
          )}
          {status && (
            <span
              className={cn(
                'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900',
                statusColors[status]
              )}
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pt-2">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {name}
        </h3>
        {role && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{role}</p>
        )}

        {/* Contact info */}
        <div className="mt-3 space-y-1.5">
          {email && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
              <Globe className="w-4 h-4" />
              <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-around">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="mt-4 flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Content Card (for articles/posts)
// ============================================================================

export interface ContentCardProps {
  title: string;
  excerpt?: string;
  image?: string;
  author?: { name: string; avatar?: string };
  date?: Date;
  category?: string;
  tags?: string[];
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  featured?: boolean;
  status?: 'published' | 'draft' | 'scheduled';
  onClick?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  className?: string;
}

export function ContentCard({
  title,
  excerpt,
  image,
  author,
  date,
  category,
  tags,
  stats,
  featured,
  status,
  onClick,
  onBookmark,
  isBookmarked,
  className,
}: ContentCardProps) {
  const statusConfig = {
    published: { label: 'Published', color: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' },
    draft: { label: 'Draft', color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' },
    scheduled: { label: 'Scheduled', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
        'overflow-hidden group',
        onClick && 'cursor-pointer',
        featured && 'ring-2 ring-primary-500',
        className
      )}
    >
      {/* Image */}
      {image && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {featured && (
            <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded">
              Featured
            </span>
          )}
          {status && (
            <span className={cn('absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded', statusConfig[status].color)}>
              {statusConfig[status].label}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Category */}
        {category && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded mb-2">
            {category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-neutral-500">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Author & Date */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {author && (
              <>
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <User className="w-3 h-3 text-neutral-500" />
                  </div>
                )}
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {author.name}
                </span>
              </>
            )}
            {date && (
              <span className="text-sm text-neutral-500 dark:text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {date.toLocaleDateString()}
              </span>
            )}
          </div>

          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isBookmarked
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              )}
            >
              <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-4 text-xs text-neutral-500">
            {stats.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {stats.views.toLocaleString()}
              </span>
            )}
            {stats.likes !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {stats.likes.toLocaleString()}
              </span>
            )}
            {stats.comments !== undefined && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {stats.comments.toLocaleString()}
              </span>
            )}
            {stats.shares !== undefined && (
              <span className="flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                {stats.shares.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Pricing Card
// ============================================================================

export interface PricingCardProps {
  name: string;
  price: number | string;
  period?: string;
  description?: string;
  features: { text: string; included: boolean }[];
  badge?: string;
  highlighted?: boolean;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period = '/month',
  description,
  features,
  badge,
  highlighted,
  ctaLabel = 'Get Started',
  onCtaClick,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white dark:bg-neutral-900 rounded-xl border overflow-hidden',
        highlighted
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {badge && (
        <div className="absolute top-0 right-0">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-500 text-white rounded-bl-lg">
            {badge}
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {name}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mt-4">
          <span className="text-4xl font-bold text-neutral-900 dark:text-white">
            {typeof price === 'number' ? `$${price}` : price}
          </span>
          {period && (
            <span className="text-neutral-500 dark:text-neutral-400">
              {period}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onCtaClick}
          className={cn(
            'w-full mt-6 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
            highlighted
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
          )}
        >
          {ctaLabel}
        </button>

        {/* Features */}
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              {feature.included ? (
                <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
              )}
              <span
                className={cn(
                  'text-sm',
                  feature.included
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : 'text-neutral-400 dark:text-neutral-500 line-through'
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Review Card
// ============================================================================

export interface ReviewCardProps {
  author: { name: string; avatar?: string; title?: string };
  rating: number;
  maxRating?: number;
  content: string;
  date?: Date;
  helpful?: { count: number; voted?: boolean };
  onHelpful?: () => void;
  verified?: boolean;
  className?: string;
}

export function ReviewCard({
  author,
  rating,
  maxRating = 5,
  content,
  date,
  helpful,
  onHelpful,
  verified,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {author.avatar ? (
            <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {author.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 dark:text-white">
                {author.name}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            {author.title && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {author.title}
              </p>
            )}
          </div>
        </div>

        {date && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {date.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: maxRating }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'w-4 h-4',
              index < rating
                ? 'text-warning-500 fill-warning-500'
                : 'text-neutral-300 dark:text-neutral-600'
            )}
          />
        ))}
        <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
          {rating}/{maxRating}
        </span>
      </div>

      {/* Content */}
      <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
        {content}
      </p>

      {/* Helpful */}
      {helpful && (
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <button
            onClick={onHelpful}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs',
              helpful.voted
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            <svg className="w-4 h-4" fill={helpful.voted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Helpful ({helpful.count})
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Event Card
// ============================================================================

export interface EventCardProps {
  title: string;
  description?: string;
  image?: string;
  date: Date;
  endDate?: Date;
  location?: string;
  isVirtual?: boolean;
  attendees?: { count: number; avatars?: string[] };
  category?: string;
  price?: string;
  status?: 'upcoming' | 'live' | 'ended';
  onClick?: () => void;
  className?: string;
}

export function EventCard({
  title,
  description,
  image,
  date,
  endDate,
  location,
  isVirtual,
  attendees,
  category,
  price,
  status = 'upcoming',
  onClick,
  className,
}: EventCardProps) {
  const statusConfig = {
    upcoming: { label: 'Upcoming', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
    live: { label: 'Live Now', color: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' },
    ended: { label: 'Ended', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' },
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
        'overflow-hidden group',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Image */}
      {image && (
        <div className="relative aspect-[2/1] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className={cn('absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded', statusConfig[status].color)}>
            {statusConfig[status].label}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Date badge */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 text-center">
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">
              {date.toLocaleDateString('en-US', { month: 'short' })}
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {date.getDate()}
            </p>
          </div>

          <div className="flex-1 min-w-0">
            {category && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded mb-1">
                {category}
              </span>
            )}
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        {description && (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {description}
          </p>
        )}

        {/* Time & Location */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>
              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {endDate && ` - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
            </span>
          </div>
          {(location || isVirtual) && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              {isVirtual ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Virtual Event</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          {attendees && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {attendees.avatars?.slice(0, 3).map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-900"
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500">
                {attendees.count}+ attending
              </span>
            </div>
          )}
          {price && (
            <span className="font-semibold text-neutral-900 dark:text-white">
              {price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Export all cards
// ============================================================================

export const DataCards = {
  Profile: ProfileCard,
  Content: ContentCard,
  Pricing: PricingCard,
  Review: ReviewCard,
  Event: EventCard,
};

export default DataCards;
