/**
 * Pagination Component (Enhancement #87)
 * Page navigation with various styles and options
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'simple' | 'minimal';
  shape?: 'rounded' | 'square' | 'circle';
  disabled?: boolean;
  className?: string;
}

export interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}

export interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  label?: string;
  className?: string;
}

export interface CursorPaginationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface LoadMorePaginationProps {
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  loadedCount: number;
  totalCount?: number;
  className?: string;
}

export interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const getSizeClasses = (size: string) => {
  const sizes: Record<string, { button: string; icon: string; text: string }> = {
    sm: { button: 'h-7 min-w-7 px-2 text-xs', icon: 'w-3.5 h-3.5', text: 'text-xs' },
    md: { button: 'h-9 min-w-9 px-3 text-sm', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { button: 'h-11 min-w-11 px-4 text-base', icon: 'w-5 h-5', text: 'text-base' },
  };
  return sizes[size] || sizes.md;
};

// ============================================================================
// Pagination Component
// ============================================================================

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  variant = 'default',
  shape = 'rounded',
  disabled = false,
  className = '',
}: PaginationProps) {
  const sizeClasses = getSizeClasses(size);

  // Calculate page numbers to display
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - boundaryCount
    );

    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), 'dots', ...range(totalPages - boundaryCount + 1, totalPages)];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [...range(1, boundaryCount), 'dots', ...range(totalPages - rightItemCount + 1, totalPages)];
    }

    return [
      ...range(1, boundaryCount),
      'dots',
      ...range(leftSiblingIndex, rightSiblingIndex),
      'dots',
      ...range(totalPages - boundaryCount + 1, totalPages),
    ];
  }, [totalPages, siblingCount, boundaryCount, currentPage]);

  const shapeClasses = {
    rounded: 'rounded-lg',
    square: 'rounded-none',
    circle: 'rounded-full',
  };

  const getButtonClasses = (isActive: boolean, isDisabled: boolean) => {
    const base = `
      inline-flex items-center justify-center font-medium
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500/50
      ${sizeClasses.button}
      ${shapeClasses[shape]}
    `;

    if (isDisabled) {
      return `${base} opacity-50 cursor-not-allowed`;
    }

    if (variant === 'outlined') {
      return isActive
        ? `${base} bg-primary-500 text-white border border-primary-500`
        : `${base} bg-transparent text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800`;
    }

    if (variant === 'simple') {
      return isActive
        ? `${base} text-primary-600 dark:text-primary-400 font-semibold`
        : `${base} text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400`;
    }

    if (variant === 'minimal') {
      return isActive
        ? `${base} text-primary-600 dark:text-primary-400 underline underline-offset-4`
        : `${base} text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300`;
    }

    // Default variant
    return isActive
      ? `${base} bg-primary-500 text-white shadow-sm`
      : `${base} bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700`;
  };

  const renderPageButton = (page: number | string, index: number) => {
    if (page === 'dots') {
      return (
        <span
          key={`dots-${index}`}
          className={`inline-flex items-center justify-center text-neutral-400 ${sizeClasses.button}`}
        >
          <MoreHorizontal className={sizeClasses.icon} />
        </span>
      );
    }

    const pageNumber = page as number;
    const isActive = pageNumber === currentPage;

    return (
      <motion.button
        key={pageNumber}
        type="button"
        onClick={() => !disabled && !isActive && onPageChange(pageNumber)}
        disabled={disabled}
        className={getButtonClasses(isActive, disabled)}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNumber}
      </motion.button>
    );
  };

  return (
    <nav
      className={`flex items-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      {/* First Page */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => !disabled && currentPage > 1 && onPageChange(1)}
          disabled={disabled || currentPage === 1}
          className={getButtonClasses(false, disabled || currentPage === 1)}
          aria-label="Go to first page"
        >
          <ChevronsLeft className={sizeClasses.icon} />
        </button>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => !disabled && currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={getButtonClasses(false, disabled || currentPage === 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className={sizeClasses.icon} />
        </button>
      )}

      {/* Page Numbers */}
      {paginationRange.map((page, index) => renderPageButton(page, index))}

      {/* Next Page */}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => !disabled && currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={getButtonClasses(false, disabled || currentPage === totalPages)}
          aria-label="Go to next page"
        >
          <ChevronRight className={sizeClasses.icon} />
        </button>
      )}

      {/* Last Page */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => !disabled && currentPage < totalPages && onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={getButtonClasses(false, disabled || currentPage === totalPages)}
          aria-label="Go to last page"
        >
          <ChevronsRight className={sizeClasses.icon} />
        </button>
      )}
    </nav>
  );
}

// ============================================================================
// Pagination Info Component
// ============================================================================

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className = '',
}: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>
      Showing <span className="font-medium text-neutral-900 dark:text-white">{start}</span>
      {' '}-{' '}
      <span className="font-medium text-neutral-900 dark:text-white">{end}</span>
      {' '}of{' '}
      <span className="font-medium text-neutral-900 dark:text-white">{totalItems}</span>
      {' '}results
    </p>
  );
}

// ============================================================================
// Page Size Selector Component
// ============================================================================

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  label = 'Show',
  className = '',
}: PageSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-neutral-600 dark:text-neutral-400">{label}</label>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-9 px-3 pr-8 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span className="text-sm text-neutral-600 dark:text-neutral-400">per page</span>
    </div>
  );
}

// ============================================================================
// Cursor Pagination Component
// ============================================================================

export function CursorPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  loading = false,
  size = 'md',
  className = '',
}: CursorPaginationProps) {
  const sizeClasses = getSizeClasses(size);

  const buttonClasses = (disabled: boolean) => `
    inline-flex items-center gap-2 font-medium
    ${sizeClasses.button}
    rounded-lg
    transition-all duration-200
    ${disabled || loading
      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
    }
  `;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious || loading}
        className={buttonClasses(!hasPrevious)}
      >
        <ChevronLeft className={sizeClasses.icon} />
        <span>Previous</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext || loading}
        className={buttonClasses(!hasNext)}
      >
        <span>Next</span>
        <ChevronRight className={sizeClasses.icon} />
      </button>
    </div>
  );
}

// ============================================================================
// Load More Pagination Component
// ============================================================================

export function LoadMorePagination({
  hasMore,
  onLoadMore,
  loading = false,
  loadedCount,
  totalCount,
  className = '',
}: LoadMorePaginationProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {totalCount !== undefined && (
        <p className="text-sm text-neutral-500">
          Showing {loadedCount} of {totalCount} items
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          className={`
            inline-flex items-center justify-center gap-2
            h-10 px-6 font-medium rounded-lg
            transition-all duration-200
            ${loading
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }
          `}
        >
          {loading ? (
            <>
              <motion.span
                className="w-4 h-4 border-2 border-neutral-300 border-t-primary-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Loading...</span>
            </>
          ) : (
            'Load More'
          )}
        </button>
      )}
      {!hasMore && loadedCount > 0 && (
        <p className="text-sm text-neutral-500">All items loaded</p>
      )}
    </div>
  );
}

// ============================================================================
// Compact Pagination Component
// ============================================================================

export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = '',
}: CompactPaginationProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className={`
          p-2 rounded-lg transition-colors
          ${disabled || currentPage === 1
            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        <input
          type="number"
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              onPageChange(page);
            }
          }}
          min={1}
          max={totalPages}
          disabled={disabled}
          className="w-12 h-8 text-center text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <span className="text-sm text-neutral-500">of {totalPages}</span>
      </div>

      <button
        type="button"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className={`
          p-2 rounded-lg transition-colors
          ${disabled || currentPage === totalPages
            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }
        `}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ============================================================================
// Full Pagination Bar Component
// ============================================================================

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showPageSize?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showInfo = true,
  showPageSize = true,
  size = 'md',
  className = '',
}: PaginationBarProps) {
  return (
    <div
      className={`
        flex flex-col sm:flex-row items-center justify-between gap-4
        ${className}
      `}
    >
      {/* Left: Info and Page Size */}
      <div className="flex items-center gap-4">
        {showInfo && (
          <PaginationInfo
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        )}
        {showPageSize && onPageSizeChange && (
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            options={pageSizeOptions}
          />
        )}
      </div>

      {/* Right: Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        size={size}
      />
    </div>
  );
}

export default Pagination;
