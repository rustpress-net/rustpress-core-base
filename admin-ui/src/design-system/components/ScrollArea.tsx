/**
 * ScrollArea Component (Enhancement #88)
 * Custom scrollable containers with styled scrollbars
 */

import React, { useRef, useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowUp } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string | number;
  scrollbarSize?: 'thin' | 'default' | 'thick';
  scrollbarVariant?: 'default' | 'overlay' | 'minimal' | 'hidden';
  showShadows?: boolean;
  onScroll?: (scrollInfo: ScrollInfo) => void;
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollBehavior?: 'auto' | 'smooth';
}

export interface ScrollInfo {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  isAtLeft: boolean;
  isAtRight: boolean;
  scrollPercentageY: number;
  scrollPercentageX: number;
}

export interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
  position?: 'left' | 'right';
  className?: string;
}

export interface InfiniteScrollAreaProps extends Omit<ScrollAreaProps, 'onScroll'> {
  loadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
}

export interface VirtualScrollAreaProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
  maxHeight: string | number;
  className?: string;
}

export interface HorizontalScrollAreaProps {
  children: React.ReactNode;
  showArrows?: boolean;
  scrollAmount?: number;
  className?: string;
}

// ============================================================================
// ScrollArea Component
// ============================================================================

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      children,
      className = '',
      maxHeight,
      scrollbarSize = 'default',
      scrollbarVariant = 'default',
      showShadows = false,
      onScroll,
      orientation = 'vertical',
      scrollBehavior = 'auto',
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const scrollRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 0,
      scrollWidth: 0,
      clientHeight: 0,
      clientWidth: 0,
      isAtTop: true,
      isAtBottom: false,
      isAtLeft: true,
      isAtRight: false,
      scrollPercentageY: 0,
      scrollPercentageX: 0,
    });

    const handleScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const info: ScrollInfo = {
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
        scrollHeight: el.scrollHeight,
        scrollWidth: el.scrollWidth,
        clientHeight: el.clientHeight,
        clientWidth: el.clientWidth,
        isAtTop: el.scrollTop === 0,
        isAtBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1,
        isAtLeft: el.scrollLeft === 0,
        isAtRight: Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 1,
        scrollPercentageY:
          el.scrollHeight === el.clientHeight
            ? 0
            : (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100,
        scrollPercentageX:
          el.scrollWidth === el.clientWidth
            ? 0
            : (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100,
      };

      setScrollInfo(info);
      onScroll?.(info);
    }, [onScroll, scrollRef]);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      el.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll();

      return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll, scrollRef]);

    const scrollbarSizeClasses = {
      thin: 'scrollbar-thin',
      default: 'scrollbar-default',
      thick: 'scrollbar-thick',
    };

    const scrollbarVariantClasses = {
      default: 'scrollbar-default-variant',
      overlay: 'scrollbar-overlay',
      minimal: 'scrollbar-minimal',
      hidden: 'scrollbar-hide',
    };

    const overflowClasses = {
      vertical: 'overflow-y-auto overflow-x-hidden',
      horizontal: 'overflow-x-auto overflow-y-hidden',
      both: 'overflow-auto',
    };

    return (
      <div className={`relative ${className}`}>
        {/* Top Shadow */}
        {showShadows && !scrollInfo.isAtTop && (
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-10" />
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className={`
            ${overflowClasses[orientation]}
            ${scrollbarSizeClasses[scrollbarSize]}
            ${scrollbarVariantClasses[scrollbarVariant]}
            scroll-${scrollBehavior}
          `}
          style={{
            maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          }}
        >
          {children}
        </div>

        {/* Bottom Shadow */}
        {showShadows && !scrollInfo.isAtBottom && (
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-10" />
        )}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

// ============================================================================
// Scroll To Top Button Component
// ============================================================================

export function ScrollToTopButton({
  show,
  onClick,
  position = 'right',
  className = '',
}: ScrollToTopButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`
            fixed bottom-6 z-50
            p-3 rounded-full shadow-lg
            bg-primary-500 text-white
            hover:bg-primary-600
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            transition-colors
            ${position === 'left' ? 'left-6' : 'right-6'}
            ${className}
          `}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Infinite Scroll Area Component
// ============================================================================

export function InfiniteScrollArea({
  children,
  loadMore,
  hasMore,
  loading = false,
  threshold = 100,
  loader,
  endMessage,
  ...scrollAreaProps
}: InfiniteScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(
    async (info: ScrollInfo) => {
      const el = scrollRef.current;
      if (!el || !hasMore || loading || loadingRef.current) return;

      const remainingScroll = el.scrollHeight - el.scrollTop - el.clientHeight;

      if (remainingScroll <= threshold) {
        loadingRef.current = true;
        try {
          await loadMore();
        } finally {
          loadingRef.current = false;
        }
      }
    },
    [hasMore, loading, loadMore, threshold]
  );

  return (
    <ScrollArea
      {...scrollAreaProps}
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {children}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          {loader || (
            <motion.div
              className="w-6 h-6 border-2 border-neutral-300 border-t-primary-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && !loading && endMessage && (
        <div className="flex items-center justify-center py-4 text-sm text-neutral-500">
          {endMessage}
        </div>
      )}
    </ScrollArea>
  );
}

// ============================================================================
// Virtual Scroll Area Component
// ============================================================================

export function VirtualScrollArea({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  maxHeight,
  className = '',
}: VirtualScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const containerHeight = typeof maxHeight === 'number' ? maxHeight : parseInt(maxHeight);
  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      item: items[i],
      index: i,
      style: {
        position: 'absolute' as const,
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    });
  }

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ maxHeight }}
    >
      <div className="relative" style={{ height: totalHeight }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Horizontal Scroll Area Component
// ============================================================================

export function HorizontalScrollArea({
  children,
  showArrows = true,
  scrollAmount = 200,
  className = '',
}: HorizontalScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollability);
    checkScrollability();

    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
    };
  }, [checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = direction === 'left' ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Left Arrow */}
      {showArrows && (
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="
                absolute left-0 top-1/2 -translate-y-1/2 z-10
                p-2 rounded-full shadow-lg
                bg-white dark:bg-neutral-800
                text-neutral-700 dark:text-neutral-300
                hover:bg-neutral-50 dark:hover:bg-neutral-700
                focus:outline-none focus:ring-2 focus:ring-primary-500
                opacity-0 group-hover:opacity-100 transition-opacity
              "
              aria-label="Scroll left"
            >
              <ChevronUp className="w-5 h-5 -rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {children}
      </div>

      {/* Right Arrow */}
      {showArrows && (
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="
                absolute right-0 top-1/2 -translate-y-1/2 z-10
                p-2 rounded-full shadow-lg
                bg-white dark:bg-neutral-800
                text-neutral-700 dark:text-neutral-300
                hover:bg-neutral-50 dark:hover:bg-neutral-700
                focus:outline-none focus:ring-2 focus:ring-primary-500
                opacity-0 group-hover:opacity-100 transition-opacity
              "
              aria-label="Scroll right"
            >
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Gradient Indicators */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-neutral-900 to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-neutral-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

// ============================================================================
// Scrollbar Styles (to be added to global CSS)
// ============================================================================

/*
Add these styles to your global CSS file:

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-default::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.scrollbar-thick::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

.scrollbar-default-variant::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-default-variant::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.scrollbar-default-variant::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

.scrollbar-overlay::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-overlay::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-overlay::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 9999px;
}

.scrollbar-minimal::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollbar-minimal::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-minimal::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 9999px;
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scroll-smooth {
  scroll-behavior: smooth;
}

.scroll-auto {
  scroll-behavior: auto;
}
*/

export default ScrollArea;
