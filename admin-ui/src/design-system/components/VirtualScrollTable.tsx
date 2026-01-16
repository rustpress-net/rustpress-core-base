/**
 * RustPress Virtual Scroll Table Component
 * High-performance table that handles 10k+ rows without lag
 * Uses windowing/virtualization to only render visible rows
 */

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
} from 'react';
import { cn } from '../utils';
import { Column, SortState } from './DataTable';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Minus,
  Loader2,
} from 'lucide-react';

// Virtual scroll configuration
interface VirtualScrollConfig {
  rowHeight: number;
  overscan: number;
  bufferSize: number;
}

const DEFAULT_CONFIG: VirtualScrollConfig = {
  rowHeight: 48,
  overscan: 5,
  bufferSize: 10,
};

export interface VirtualScrollTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  height?: number | string;
  rowHeight?: number;
  overscan?: number;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  sortable?: boolean;
  sortState?: SortState;
  onSort?: (state: SortState) => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
  striped?: boolean;
  className?: string;
  isLoading?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreThreshold?: number;
  getRowId?: (row: T, index: number) => string | number;
  rowClassName?: (row: T, index: number) => string;
}

// Checkbox component
function Checkbox({
  checked,
  indeterminate,
  onChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-4 h-4 rounded border-2 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        checked || indeterminate
          ? 'bg-primary-600 border-primary-600 text-white'
          : 'border-neutral-300 dark:border-neutral-600'
      )}
    >
      {checked && <Check className="w-3 h-3" />}
      {indeterminate && <Minus className="w-3 h-3" />}
    </button>
  );
}

export function VirtualScrollTable<T extends Record<string, any>>({
  data,
  columns,
  height = 600,
  rowHeight = DEFAULT_CONFIG.rowHeight,
  overscan = DEFAULT_CONFIG.overscan,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortable = false,
  sortState,
  onSort,
  onRowClick,
  rowActions,
  stickyHeader = true,
  striped = false,
  className,
  isLoading = false,
  loadingMore = false,
  onLoadMore,
  loadMoreThreshold = 100,
  getRowId = (row, index) => row.id ?? row.key ?? index,
  rowClassName,
}: VirtualScrollTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [internalSortState, setInternalSortState] = useState<SortState>({
    column: null,
    direction: null,
  });

  const currentSortState = sortState ?? internalSortState;

  // Calculate visible range
  const totalHeight = data.length * rowHeight;
  const containerHeight = typeof height === 'number' ? height : 600;

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(
      data.length,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    return { start, end };
  }, [scrollTop, rowHeight, containerHeight, data.length, overscan]);

  // Visible rows
  const visibleRows = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end).map((row, i) => ({
      row,
      index: visibleRange.start + i,
    }));
  }, [data, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // Load more trigger
      if (onLoadMore && !loadingMore) {
        const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
        if (scrollBottom < loadMoreThreshold) {
          onLoadMore();
        }
      }
    },
    [onLoadMore, loadingMore, loadMoreThreshold]
  );

  // Selection handlers
  const isAllSelected = data.length > 0 && data.every((row, i) => selectedIds.has(getRowId(row, i)));
  const isSomeSelected = data.some((row, i) => selectedIds.has(getRowId(row, i)));

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row, i) => getRowId(row, i))));
    }
  }, [data, isAllSelected, onSelectionChange, getRowId]);

  const handleSelectRow = useCallback(
    (id: string | number) => {
      if (!onSelectionChange) return;

      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      onSelectionChange(newSelected);
    },
    [selectedIds, onSelectionChange]
  );

  // Sort handler
  const handleSort = useCallback(
    (columnId: string) => {
      let newDirection: 'asc' | 'desc' | null = 'asc';

      if (currentSortState.column === columnId) {
        if (currentSortState.direction === 'asc') {
          newDirection = 'desc';
        } else if (currentSortState.direction === 'desc') {
          newDirection = null;
        }
      }

      const newState: SortState = {
        column: newDirection ? columnId : null,
        direction: newDirection,
      };

      if (onSort) {
        onSort(newState);
      } else {
        setInternalSortState(newState);
      }
    },
    [currentSortState, onSort]
  );

  // Cell value getter
  const getCellValue = useCallback(
    (row: T, column: Column<T>, rowIndex: number) => {
      const value = row[column.key];
      if (column.render) {
        return column.render(value, row, rowIndex);
      }
      return value as React.ReactNode;
    },
    []
  );

  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-neutral-200 dark:border-neutral-800',
          'bg-white dark:bg-neutral-900',
          'flex items-center justify-center',
          className
        )}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
        'overflow-hidden',
        className
      )}
    >
      {/* Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-auto"
        style={{ height, maxHeight: height }}
      >
        <table className="w-full border-collapse table-fixed">
          {/* Header */}
          <thead
            className={cn(
              'bg-neutral-50 dark:bg-neutral-800/50',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {/* Checkbox column */}
              {selectable && (
                <th className="w-12 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={!isAllSelected && isSomeSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3',
                    'text-xs font-semibold uppercase tracking-wider',
                    'text-neutral-500 dark:text-neutral-400',
                    'border-b border-neutral-200 dark:border-neutral-800',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    sortable && column.sortable !== false && 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  )}
                  style={{ width: column.width }}
                  onClick={
                    sortable && column.sortable !== false
                      ? () => handleSort(column.key)
                      : undefined
                  }
                >
                  <div
                    className={cn(
                      'inline-flex items-center gap-1',
                      column.align === 'center' && 'justify-center w-full',
                      column.align === 'right' && 'justify-end w-full'
                    )}
                  >
                    {column.header}
                    {sortable && column.sortable !== false && (
                      <span className="ml-1">
                        {currentSortState.column === column.key ? (
                          currentSortState.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {rowActions && (
                <th className="w-12 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800" />
              )}
            </tr>
          </thead>

          {/* Body with virtual scrolling */}
          <tbody>
            {/* Top spacer */}
            {visibleRange.start > 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  style={{ height: visibleRange.start * rowHeight }}
                />
              </tr>
            )}

            {/* Visible rows */}
            {visibleRows.map(({ row, index }) => {
              const rowId = getRowId(row, index);
              const isSelected = selectedIds.has(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'transition-colors duration-150',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                    striped && index % 2 === 1 && 'bg-neutral-50/50 dark:bg-neutral-800/30',
                    isSelected && 'bg-primary-50/50 dark:bg-primary-900/20',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row, index)
                  )}
                  style={{ height: rowHeight }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {/* Checkbox */}
                  {selectable && (
                    <td
                      className="w-12 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4',
                        'text-sm text-neutral-700 dark:text-neutral-300',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        'truncate'
                      )}
                    >
                      {getCellValue(row, column, index)}
                    </td>
                  ))}

                  {/* Actions */}
                  {rowActions && (
                    <td
                      className="w-12 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Bottom spacer */}
            {visibleRange.end < data.length && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  style={{ height: (data.length - visibleRange.end) * rowHeight }}
                />
              </tr>
            )}
          </tbody>
        </table>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin mr-2" />
            <span className="text-sm text-neutral-500">Loading more...</span>
          </div>
        )}
      </div>

      {/* Footer with row count */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500">
        {selectedIds.size > 0 ? (
          <span className="text-primary-600 dark:text-primary-400 font-medium">
            {selectedIds.size} of {data.length.toLocaleString()} rows selected
          </span>
        ) : (
          <span>{data.length.toLocaleString()} total rows</span>
        )}
      </div>
    </div>
  );
}

// Hook for managing virtual scroll state externally
export function useVirtualScroll<T>(
  data: T[],
  options: {
    rowHeight?: number;
    containerHeight?: number;
    overscan?: number;
  } = {}
) {
  const {
    rowHeight = DEFAULT_CONFIG.rowHeight,
    containerHeight = 600,
    overscan = DEFAULT_CONFIG.overscan,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(
      data.length,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    return { start, end };
  }, [scrollTop, rowHeight, containerHeight, data.length, overscan]);

  const visibleData = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange]);

  const totalHeight = data.length * rowHeight;
  const offsetTop = visibleRange.start * rowHeight;
  const offsetBottom = (data.length - visibleRange.end) * rowHeight;

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    visibleData,
    totalHeight,
    offsetTop,
    offsetBottom,
  };
}

export default VirtualScrollTable;
