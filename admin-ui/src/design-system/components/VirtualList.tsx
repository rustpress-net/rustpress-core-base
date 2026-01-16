/**
 * VirtualList Component
 *
 * Enterprise-grade virtualized list:
 * - Renders only visible items
 * - Handles thousands of items smoothly
 * - Variable height support
 * - Infinite scroll loading
 * - Grid mode support
 * - Sticky headers
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowUp } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number | ((item: T, index: number) => number);
  overscan?: number;
  className?: string;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  loadingIndicator?: React.ReactNode;
  emptyState?: React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  stickyIndices?: number[];
  renderStickyItem?: (item: T, index: number) => React.ReactNode;
  scrollToIndex?: number;
  onScroll?: (scrollTop: number) => void;
  showScrollToTop?: boolean;
  scrollToTopThreshold?: number;
}

export interface VirtualListRef {
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
  scrollToTop: () => void;
  getScrollTop: () => number;
}

export interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns: number | 'auto';
  itemHeight: number;
  itemWidth?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  loadingIndicator?: React.ReactNode;
  emptyState?: React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

// ============================================================================
// Virtual List Component
// ============================================================================

function VirtualListInner<T>(
  {
    items,
    renderItem,
    itemHeight,
    overscan = 5,
    className,
    onLoadMore,
    hasMore = false,
    loadingIndicator,
    emptyState,
    getItemKey = (_, index) => index,
    stickyIndices = [],
    renderStickyItem,
    scrollToIndex: initialScrollToIndex,
    onScroll,
    showScrollToTop = true,
    scrollToTopThreshold = 500,
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<VirtualListRef>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Calculate item heights
  const itemHeights = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return items.map(() => itemHeight);
    }
    return items.map((item, index) => itemHeight(item, index));
  }, [items, itemHeight]);

  // Calculate cumulative offsets
  const itemOffsets = useMemo(() => {
    const offsets: number[] = [];
    let offset = 0;
    for (const height of itemHeights) {
      offsets.push(offset);
      offset += height;
    }
    return offsets;
  }, [itemHeights]);

  // Total content height
  const totalHeight = useMemo(() => {
    return itemOffsets.length > 0
      ? itemOffsets[itemOffsets.length - 1] + itemHeights[itemHeights.length - 1]
      : 0;
  }, [itemOffsets, itemHeights]);

  // Find visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0, visibleItems: [] };
    }

    // Binary search for start index
    let start = 0;
    let end = items.length - 1;
    while (start < end) {
      const mid = Math.floor((start + end) / 2);
      if (itemOffsets[mid] + itemHeights[mid] < scrollTop) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }
    const startIdx = Math.max(0, start - overscan);

    // Find end index
    const viewportEnd = scrollTop + containerHeight;
    let endIdx = startIdx;
    while (endIdx < items.length && itemOffsets[endIdx] < viewportEnd) {
      endIdx++;
    }
    endIdx = Math.min(items.length - 1, endIdx + overscan);

    // Get visible items
    const visible = items.slice(startIdx, endIdx + 1).map((item, i) => ({
      item,
      index: startIdx + i,
      offset: itemOffsets[startIdx + i],
      height: itemHeights[startIdx + i],
    }));

    return { startIndex: startIdx, endIndex: endIdx, visibleItems: visible };
  }, [items, itemOffsets, itemHeights, scrollTop, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);
    setShowScrollTop(newScrollTop > scrollToTopThreshold);
    onScroll?.(newScrollTop);

    // Check if we need to load more
    if (
      hasMore &&
      !isLoading &&
      onLoadMore &&
      newScrollTop + containerHeight >= totalHeight - 200
    ) {
      setIsLoading(true);
      onLoadMore().finally(() => setIsLoading(false));
    }
  }, [containerHeight, totalHeight, hasMore, isLoading, onLoadMore, onScroll, scrollToTopThreshold]);

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Scroll to index on mount or when prop changes
  useEffect(() => {
    if (initialScrollToIndex !== undefined && containerRef.current) {
      const offset = itemOffsets[initialScrollToIndex] || 0;
      containerRef.current.scrollTop = offset;
    }
  }, [initialScrollToIndex, itemOffsets]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!containerRef.current || index < 0 || index >= items.length) return;

      const itemOffset = itemOffsets[index];
      const itemH = itemHeights[index];

      let scrollPosition: number;
      switch (align) {
        case 'center':
          scrollPosition = itemOffset - (containerHeight - itemH) / 2;
          break;
        case 'end':
          scrollPosition = itemOffset - containerHeight + itemH;
          break;
        default:
          scrollPosition = itemOffset;
      }

      containerRef.current.scrollTop = Math.max(0, scrollPosition);
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    getScrollTop: () => scrollTop,
  }));

  // Scroll to top button
  const handleScrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        {emptyState || (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
            No items to display
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-auto"
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Rendered items */}
          {visibleItems.map(({ item, index, offset, height }) => {
            const isSticky = stickyIndices.includes(index);

            return (
              <div
                key={getItemKey(item, index)}
                style={{
                  position: isSticky ? 'sticky' : 'absolute',
                  top: isSticky ? 0 : offset,
                  left: 0,
                  right: 0,
                  height,
                  zIndex: isSticky ? 10 : undefined,
                }}
              >
                {isSticky && renderStickyItem
                  ? renderStickyItem(item, index)
                  : renderItem(item, index)}
              </div>
            );
          })}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            {loadingIndicator || (
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            )}
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollToTop && showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleScrollToTop}
            className={cn(
              'absolute bottom-4 right-4 p-3',
              'bg-primary-500 hover:bg-primary-600 text-white',
              'rounded-full shadow-lg',
              'transition-colors'
            )}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.ForwardedRef<VirtualListRef> }
) => React.ReactElement;

// ============================================================================
// Virtual Grid Component
// ============================================================================

export function VirtualGrid<T>({
  items,
  renderItem,
  columns,
  itemHeight,
  itemWidth,
  gap = 16,
  overscan = 3,
  className,
  onLoadMore,
  hasMore = false,
  loadingIndicator,
  emptyState,
  getItemKey = (_, index) => index,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate actual columns
  const actualColumns = useMemo(() => {
    if (columns === 'auto') {
      if (!itemWidth || containerWidth === 0) return 1;
      return Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
    }
    return columns;
  }, [columns, containerWidth, itemWidth, gap]);

  // Calculate row dimensions
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / actualColumns);
  const totalHeight = totalRows * rowHeight - gap;

  // Visible row range
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  // Visible items
  const visibleItems = useMemo(() => {
    const visible: Array<{ item: T; index: number; row: number; col: number }> = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < actualColumns; col++) {
        const index = row * actualColumns + col;
        if (index < items.length) {
          visible.push({ item: items[index], index, row, col });
        }
      }
    }

    return visible;
  }, [items, startRow, endRow, actualColumns]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);

    // Check if we need to load more
    if (
      hasMore &&
      !isLoading &&
      onLoadMore &&
      target.scrollTop + containerHeight >= totalHeight - 200
    ) {
      setIsLoading(true);
      onLoadMore().finally(() => setIsLoading(false));
    }
  }, [containerHeight, totalHeight, hasMore, isLoading, onLoadMore]);

  // Update dimensions on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerWidth(container.clientWidth);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Calculate item dimensions
  const calculatedItemWidth = useMemo(() => {
    if (itemWidth) return itemWidth;
    return (containerWidth - gap * (actualColumns - 1)) / actualColumns;
  }, [containerWidth, actualColumns, gap, itemWidth]);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        {emptyState || (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
            No items to display
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('h-full overflow-auto', className)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={getItemKey(item, index)}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (calculatedItemWidth + gap),
              width: calculatedItemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          {loadingIndicator || (
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Infinite Scroll Wrapper
// ============================================================================

export interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
  loadingIndicator?: React.ReactNode;
  className?: string;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  threshold = 200,
  loadingIndicator,
  className,
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setIsLoading(true);
      onLoadMore().finally(() => setIsLoading(false));
    }
  }, [isLoading, hasMore, threshold, onLoadMore]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto', className)}
    >
      {children}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          {loadingIndicator || (
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default VirtualList;
