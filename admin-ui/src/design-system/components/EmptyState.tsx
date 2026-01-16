/**
 * EmptyState Component (Enhancement #100)
 * Zero state displays for empty data scenarios
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  Search,
  FileX,
  Users,
  FolderOpen,
  ImageOff,
  AlertCircle,
  Wifi,
  Lock,
  Clock,
  Filter,
  Plus,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline' | 'subtle';
  illustration?: React.ReactNode;
  className?: string;
}

export interface NoResultsProps {
  query?: string;
  onClear?: () => void;
  suggestions?: string[];
  className?: string;
}

export interface NoDataProps {
  type?: 'posts' | 'users' | 'files' | 'images' | 'comments' | 'custom';
  onAdd?: () => void;
  addLabel?: string;
  title?: string;
  description?: string;
  className?: string;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  error?: Error;
  variant?: 'default' | 'network' | 'permission' | 'notFound';
  className?: string;
}

export interface ComingSoonProps {
  title?: string;
  description?: string;
  releaseDate?: Date;
  onNotify?: () => void;
  className?: string;
}

export interface MaintenanceProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  className?: string;
}

// ============================================================================
// Empty State Component
// ============================================================================

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'default',
  illustration,
  className = '',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6 px-4',
      icon: 'w-10 h-10',
      iconWrapper: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const variantClasses = {
    default: '',
    card: 'bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700',
    inline: 'bg-neutral-50 dark:bg-neutral-800/50 rounded-lg',
    subtle: '',
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex flex-col items-center justify-center text-center
        ${sizes.container}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : icon ? (
        <div
          className={`
            ${sizes.iconWrapper}
            flex items-center justify-center
            bg-neutral-100 dark:bg-neutral-800
            rounded-full mb-6
          `}
        >
          <div className={`${sizes.icon} text-neutral-400`}>
            {icon}
          </div>
        </div>
      ) : null}

      <h3 className={`font-semibold text-neutral-900 dark:text-white ${sizes.title}`}>
        {title}
      </h3>

      {description && (
        <p className={`mt-2 text-neutral-600 dark:text-neutral-400 max-w-sm ${sizes.description}`}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {action}
          {secondaryAction}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// No Results Component
// ============================================================================

export function NoResults({
  query,
  onClear,
  suggestions,
  className = '',
}: NoResultsProps) {
  return (
    <EmptyState
      icon={<Search className="w-full h-full" />}
      title={query ? `No results for "${query}"` : 'No results found'}
      description="Try adjusting your search or filter criteria"
      action={
        onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Clear search
          </button>
        )
      }
      className={className}
    >
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-500 mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </EmptyState>
  );
}

// ============================================================================
// No Data Component
// ============================================================================

const noDataConfig = {
  posts: {
    icon: <FileX className="w-full h-full" />,
    title: 'No posts yet',
    description: 'Create your first post to get started.',
    addLabel: 'Create Post',
  },
  users: {
    icon: <Users className="w-full h-full" />,
    title: 'No users found',
    description: 'Invite team members to collaborate.',
    addLabel: 'Invite User',
  },
  files: {
    icon: <FolderOpen className="w-full h-full" />,
    title: 'No files uploaded',
    description: 'Upload files to your media library.',
    addLabel: 'Upload File',
  },
  images: {
    icon: <ImageOff className="w-full h-full" />,
    title: 'No images found',
    description: 'Upload images to your gallery.',
    addLabel: 'Upload Image',
  },
  comments: {
    icon: <Inbox className="w-full h-full" />,
    title: 'No comments yet',
    description: 'Be the first to start the conversation.',
    addLabel: 'Add Comment',
  },
  custom: {
    icon: <Inbox className="w-full h-full" />,
    title: 'No items found',
    description: 'There are no items to display.',
    addLabel: 'Add Item',
  },
};

export function NoData({
  type = 'custom',
  onAdd,
  addLabel,
  title,
  description,
  className = '',
}: NoDataProps) {
  const config = noDataConfig[type];

  return (
    <EmptyState
      icon={config.icon}
      title={title || config.title}
      description={description || config.description}
      action={
        onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {addLabel || config.addLabel}
          </button>
        )
      }
      className={className}
    />
  );
}

// ============================================================================
// Error State Component
// ============================================================================

const errorConfig = {
  default: {
    icon: <AlertCircle className="w-full h-full" />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: <Wifi className="w-full h-full" />,
    title: 'Connection error',
    description: 'Please check your internet connection and try again.',
  },
  permission: {
    icon: <Lock className="w-full h-full" />,
    title: 'Access denied',
    description: "You don't have permission to view this content.",
  },
  notFound: {
    icon: <FileX className="w-full h-full" />,
    title: 'Not found',
    description: 'The content you are looking for does not exist.',
  },
};

export function ErrorState({
  title,
  description,
  onRetry,
  error,
  variant = 'default',
  className = '',
}: ErrorStateProps) {
  const config = errorConfig[variant];

  return (
    <EmptyState
      icon={config.icon}
      title={title || config.title}
      description={description || error?.message || config.description}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        )
      }
      variant="card"
      className={className}
    />
  );
}

// ============================================================================
// Coming Soon Component
// ============================================================================

export function ComingSoon({
  title = 'Coming Soon',
  description = 'This feature is currently under development.',
  releaseDate,
  onNotify,
  className = '',
}: ComingSoonProps) {
  return (
    <EmptyState
      icon={<Clock className="w-full h-full" />}
      title={title}
      description={description}
      action={
        onNotify && (
          <button
            onClick={onNotify}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Notify Me
          </button>
        )
      }
      className={className}
    >
      {releaseDate && (
        <p className="mt-4 text-sm text-neutral-500">
          Expected release: {releaseDate.toLocaleDateString()}
        </p>
      )}
    </EmptyState>
  );
}

// ============================================================================
// Maintenance Component
// ============================================================================

export function Maintenance({
  title = 'Under Maintenance',
  description = 'We are performing scheduled maintenance. Please check back soon.',
  estimatedTime,
  className = '',
}: MaintenanceProps) {
  return (
    <div
      className={`
        min-h-screen flex items-center justify-center p-4
        bg-neutral-50 dark:bg-neutral-950
        ${className}
      `}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 mx-auto mb-8"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary-500">
            <path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          {description}
        </p>

        {estimatedTime && (
          <p className="text-sm text-neutral-500">
            Estimated completion: {estimatedTime}
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ============================================================================
// Filtered Empty State
// ============================================================================

export interface FilteredEmptyProps {
  activeFilters: number;
  onClearFilters?: () => void;
  className?: string;
}

export function FilteredEmpty({
  activeFilters,
  onClearFilters,
  className = '',
}: FilteredEmptyProps) {
  return (
    <EmptyState
      icon={<Filter className="w-full h-full" />}
      title="No matching results"
      description={`${activeFilters} filter${activeFilters > 1 ? 's' : ''} applied. Try removing some filters.`}
      action={
        onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            Clear all filters
          </button>
        )
      }
      size="sm"
      variant="inline"
      className={className}
    />
  );
}

// ============================================================================
// Offline State Component
// ============================================================================

export interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}

export function OfflineState({ onRetry, className = '' }: OfflineStateProps) {
  return (
    <EmptyState
      icon={<Wifi className="w-full h-full" />}
      title="You're offline"
      description="Check your internet connection and try again."
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        )
      }
      variant="card"
      className={className}
    />
  );
}

// ============================================================================
// Upload Empty State
// ============================================================================

export interface UploadEmptyProps {
  onUpload?: () => void;
  accept?: string;
  maxSize?: string;
  className?: string;
}

export function UploadEmpty({
  onUpload,
  accept = 'images, documents, videos',
  maxSize = '10MB',
  className = '',
}: UploadEmptyProps) {
  return (
    <div
      className={`
        border-2 border-dashed border-neutral-300 dark:border-neutral-700
        rounded-xl p-8 text-center
        hover:border-primary-400 dark:hover:border-primary-600
        transition-colors cursor-pointer
        ${className}
      `}
      onClick={onUpload}
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
        <Plus className="w-8 h-8 text-neutral-400" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
        Upload files
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Drag and drop or click to browse
      </p>

      <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
        <span>Accepts: {accept}</span>
        <span className="w-1 h-1 bg-neutral-400 rounded-full" />
        <span>Max size: {maxSize}</span>
      </div>
    </div>
  );
}

export default EmptyState;
