/**
 * RustPress DataTable Component
 * Enterprise-grade data table with sorting, selection, and animations
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Minus,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../utils';
import { tableRow, fadeInUp } from '../animations';
import { SkeletonTable } from './Skeleton';

// Types
export interface Column<T> {
  /** Column key - used for data access and identification */
  key: string;
  /** Column header text */
  header: string | React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string | number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  sortable?: boolean;
  onSort?: (state: SortState) => void;
  pagination?: boolean | {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  pageSize?: number;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
  hoverable?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortable = false,
  onSort,
  pagination,
  pageSize: defaultPageSize = 10,
  onRowClick,
  rowActions,
  emptyState,
  className,
  stickyHeader = false,
  striped = false,
  compact = false,
  hoverable = true,
}: DataTableProps<T>) {
  // Internal pagination state when pagination is boolean
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(defaultPageSize);

  // Get row ID helper
  const getRowId = (row: T, index: number): string | number => {
    return row.id ?? row.key ?? index;
  };
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return data;

    if (pagination === true) {
      const start = (currentPage - 1) * currentPageSize;
      return data.slice(start, start + currentPageSize);
    }
    return data;
  }, [data, pagination, currentPage, currentPageSize]);

  // Selection handlers
  const isAllSelected = paginatedData.length > 0 && paginatedData.every((row, i) => selectedIds.has(getRowId(row, i)));
  const isSomeSelected = paginatedData.some((row, i) => selectedIds.has(getRowId(row, i)));

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(paginatedData.map((row, i) => getRowId(row, i))));
    }
  }, [paginatedData, isAllSelected, onSelectionChange]);

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

  // Sorting handler
  const handleSort = useCallback(
    (columnId: string) => {
      let newDirection: SortDirection = 'asc';

      if (sortState.column === columnId) {
        if (sortState.direction === 'asc') {
          newDirection = 'desc';
        } else if (sortState.direction === 'desc') {
          newDirection = null;
        }
      }

      const newState = {
        column: newDirection ? columnId : null,
        direction: newDirection,
      };

      setSortState(newState);
      onSort?.(newState);
    },
    [sortState, onSort]
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

  // Pagination config
  const paginationConfig = useMemo(() => {
    if (!pagination) return null;

    if (pagination === true) {
      return {
        page: currentPage,
        pageSize: currentPageSize,
        total: data.length,
        onPageChange: setCurrentPage,
        onPageSizeChange: setCurrentPageSize,
      };
    }
    return pagination;
  }, [pagination, currentPage, currentPageSize, data.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden', className)}>
        <SkeletonTable rows={paginationConfig?.pageSize || 5} columns={columns.length} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-neutral-200 dark:border-neutral-800',
          'bg-white dark:bg-neutral-900',
          'p-12 text-center',
          className
        )}
      >
        {emptyState || (
          <div>
            <Search className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">No data found</p>
          </div>
        )}
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
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead
            className={cn(
              'bg-neutral-50 dark:bg-neutral-800/50',
              'border-b border-neutral-200 dark:border-neutral-800',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {/* Checkbox column */}
              {selectable && (
                <th className="w-12 px-4 py-3">
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
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    sortable && column.sortable !== false && 'cursor-pointer select-none',
                    compact ? 'py-2' : 'py-3'
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
                        {sortState.column === column.key ? (
                          sortState.direction === 'asc' ? (
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
              {rowActions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((row, rowIndex) => {
                const rowId = getRowId(row, rowIndex);
                return (
                  <motion.tr
                    key={rowId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                    className={cn(
                      'transition-colors duration-150',
                      hoverable && 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                      striped && rowIndex % 2 === 1 && 'bg-neutral-50/50 dark:bg-neutral-800/30',
                      selectedIds.has(rowId) && 'bg-primary-50/50 dark:bg-primary-900/20',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {/* Checkbox */}
                    {selectable && (
                      <td className="w-12 px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(rowId)}
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
                          compact ? 'py-2' : 'py-3'
                        )}
                      >
                        {getCellValue(row, column, rowIndex)}
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
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginationConfig && (
        <TablePagination
          page={paginationConfig.page}
          pageSize={paginationConfig.pageSize}
          total={paginationConfig.total}
          onPageChange={paginationConfig.onPageChange}
          onPageSizeChange={paginationConfig.onPageSizeChange}
          selectedCount={selectedIds.size}
        />
      )}
    </div>
  );
}

// Checkbox component
interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  'aria-label'?: string;
}

function Checkbox({ checked, indeterminate, onChange, 'aria-label': ariaLabel }: CheckboxProps) {
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

// Pagination component
interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  selectedCount?: number;
}

function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
}: TablePaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const pageSizes = [10, 25, 50, 100];

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4',
        'px-4 py-3',
        'border-t border-neutral-200 dark:border-neutral-800',
        'text-sm'
      )}
    >
      {/* Left side - info */}
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <span className="text-primary-600 dark:text-primary-400 font-medium">
            {selectedCount} selected
          </span>
        )}
        <span className="text-neutral-500 dark:text-neutral-400">
          Showing {startItem} to {endItem} of {total} results
        </span>
      </div>

      {/* Right side - controls */}
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400">Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(
                'h-8 px-2 rounded-lg',
                'bg-neutral-100 dark:bg-neutral-800',
                'border-0',
                'text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <PaginationButton
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </PaginationButton>
          <PaginationButton
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </PaginationButton>

          <span className="px-3 text-neutral-700 dark:text-neutral-300">
            Page {page} of {totalPages}
          </span>

          <PaginationButton
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </PaginationButton>
          <PaginationButton
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'p-1.5 rounded-lg',
        'text-neutral-500 dark:text-neutral-400',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-150'
      )}
    >
      {children}
    </button>
  );
}

export default DataTable;
