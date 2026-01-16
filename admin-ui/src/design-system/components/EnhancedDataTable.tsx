/**
 * RustPress Enhanced Data Table Component
 * Enterprise-grade table combining all advanced features:
 * - Virtual scrolling for 10k+ rows
 * - Column visibility toggle
 * - Saved table views
 * - Bulk actions toolbar
 * - Inline row editing
 * - Export options (CSV, Excel, PDF, JSON)
 * - Advanced filters with AND/OR logic
 * - Column resizing
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Minus,
  Loader2,
  MoreHorizontal,
  Settings2,
} from 'lucide-react';
import { cn } from '../utils';
import { Column, SortState } from './DataTable';
import { VirtualScrollTable } from './VirtualScrollTable';
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle';
import { SavedTableViews } from './SavedTableViews';
import { BulkActionsToolbar, BulkAction, getDefaultBulkActions } from './BulkActionsToolbar';
import { EditableCell, CellEditorConfig } from './InlineRowEditor';
import { ExportOptions, ExportColumn, ExportFormat } from './ExportOptions';
import { AdvancedFiltersPanel, FilterableColumn, QuickFilterChips } from './AdvancedFiltersPanel';
import { ResizableColumnHeader, useResizableColumns, ColumnConfig } from './ColumnResizer';
import {
  useTableStore,
  FilterGroup,
  ColumnVisibility,
  TableView,
  applyFilters,
} from '../../store/tableStore';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';

// Enhanced column definition
export interface EnhancedColumn<T> extends Column<T> {
  // Filtering
  filterable?: boolean;
  filterType?: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  filterOperators?: string[];
  enumOptions?: { value: string | number; label: string }[];

  // Editing
  editable?: boolean;
  editorConfig?: CellEditorConfig;

  // Resizing
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;

  // Export
  exportable?: boolean;
  exportFormat?: (value: unknown) => string;
}

export interface EnhancedDataTableProps<T extends Record<string, unknown>> {
  // Core
  tableId: string;
  data: T[];
  columns: EnhancedColumn<T>[];
  getRowId?: (row: T, index: number) => string | number;

  // Display
  height?: number | string;
  rowHeight?: number;
  striped?: boolean;
  stickyHeader?: boolean;

  // Features
  virtualScrolling?: boolean;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  editable?: boolean;
  exportable?: boolean;

  // Views
  showViewManager?: boolean;
  showColumnToggle?: boolean;

  // Actions
  bulkActions?: BulkAction[];
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;

  // Callbacks
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  onSort?: (state: SortState) => void;
  onFiltersChange?: (filters: FilterGroup) => void;
  onCellSave?: (rowId: string | number, columnKey: string, value: unknown) => void | Promise<void>;
  onExport?: (format: ExportFormat, data: T[]) => void | Promise<void>;

  // Loading
  isLoading?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;

  // Styling
  className?: string;
  toolbarClassName?: string;
}

export function EnhancedDataTable<T extends Record<string, unknown>>({
  tableId,
  data,
  columns,
  getRowId = (row, index) => (row.id as string | number) ?? index,

  height = 600,
  rowHeight = 48,
  striped = false,
  stickyHeader = true,

  virtualScrolling = true,
  selectable = true,
  sortable = true,
  filterable = true,
  resizable = true,
  editable = false,
  exportable = true,

  showViewManager = true,
  showColumnToggle = true,

  bulkActions,
  rowActions,
  onRowClick,

  onSelectionChange,
  onSort,
  onFiltersChange,
  onCellSave,
  onExport,

  isLoading = false,
  loadingMore = false,
  onLoadMore,

  className,
  toolbarClassName,
}: EnhancedDataTableProps<T>) {
  // State
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);

  // Store hooks
  const {
    getColumnVisibility,
    getFilters,
    getColumnOrder,
    setFilters,
  } = useTableStore();

  const columnVisibility = getColumnVisibility(tableId);
  const filters = getFilters(tableId);
  const columnOrder = getColumnOrder(tableId);

  // Column resizing
  const columnConfigs: ColumnConfig[] = useMemo(
    () =>
      columns.map((col) => ({
        key: col.key,
        minWidth: col.minWidth,
        maxWidth: col.maxWidth,
        defaultWidth: col.defaultWidth,
        resizable: col.resizable !== false,
      })),
    [columns]
  );

  const { widths, handleWidthChange, getColumnStyle } = useResizableColumns({
    tableId,
    columns: columnConfigs,
  });

  // Filter data
  const filteredData = useMemo(() => {
    if (!filters) return data;
    return applyFilters(data, filters);
  }, [data, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortState.column!];
      const bVal = b[sortState.column!];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortState]);

  // Visible columns (respecting visibility and order)
  const visibleColumns = useMemo(() => {
    let cols = columns.filter((col) => columnVisibility[col.key] !== false);

    if (columnOrder.length > 0) {
      cols = [...cols].sort((a, b) => {
        const aIndex = columnOrder.indexOf(a.key);
        const bIndex = columnOrder.indexOf(b.key);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return cols;
  }, [columns, columnVisibility, columnOrder]);

  // Filterable columns
  const filterableColumns: FilterableColumn[] = useMemo(
    () =>
      columns
        .filter((col) => col.filterable !== false)
        .map((col) => ({
          key: col.key,
          label: typeof col.header === 'string' ? col.header : col.key,
          type: col.filterType || 'string',
          operators: col.filterOperators as any,
          enumOptions: col.enumOptions,
        })),
    [columns]
  );

  // Export columns
  const exportColumns: ExportColumn[] = useMemo(
    () =>
      columns
        .filter((col) => col.exportable !== false)
        .map((col) => ({
          key: col.key,
          label: typeof col.header === 'string' ? col.header : col.key,
          format: col.exportFormat,
        })),
    [columns]
  );

  // Handlers
  const handleSelectionChange = useCallback(
    (ids: Set<string | number>) => {
      setSelectedIds(ids);
      if (onSelectionChange) {
        onSelectionChange(ids);
      }
    },
    [onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(sortedData.map((row, i) => getRowId(row, i)));
    handleSelectionChange(allIds);
  }, [sortedData, getRowId, handleSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    handleSelectionChange(new Set());
  }, [handleSelectionChange]);

  const handleSort = useCallback(
    (state: SortState) => {
      setSortState(state);
      if (onSort) {
        onSort(state);
      }
    },
    [onSort]
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterGroup) => {
      setFilters(tableId, newFilters);
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    },
    [tableId, setFilters, onFiltersChange]
  );

  const handleApplyView = useCallback(
    (view: TableView) => {
      // Apply view configuration
      if (view.config.sort) {
        setSortState({
          column: view.config.sort.column,
          direction: view.config.sort.direction,
        });
      }
      if (view.config.filters) {
        handleFiltersChange(view.config.filters);
      }
    },
    [handleFiltersChange]
  );

  // Default bulk actions
  const defaultBulkActions = useMemo(
    () =>
      getDefaultBulkActions({
        onDelete: async (ids) => {
          console.log('Delete:', Array.from(ids));
          handleDeselectAll();
        },
        onExport: (ids) => {
          console.log('Export:', Array.from(ids));
        },
      }),
    [handleDeselectAll]
  );

  const effectiveBulkActions = bulkActions || defaultBulkActions;

  // Current view config (for saving)
  const currentConfig = useMemo(
    () => ({
      filters,
      sort: sortState.column
        ? { column: sortState.column, direction: sortState.direction! }
        : undefined,
      columnVisibility,
      columnOrder,
    }),
    [filters, sortState, columnVisibility, columnOrder]
  );

  // Render cell with optional editing
  const renderCell = useCallback(
    (row: T, column: EnhancedColumn<T>, rowIndex: number) => {
      const rowId = getRowId(row, rowIndex);
      const value = row[column.key];

      if (editable && column.editable !== false) {
        return (
          <EditableCell
            rowId={rowId}
            columnKey={column.key}
            value={value}
            displayValue={column.render ? column.render(value, row, rowIndex) : undefined}
            editorConfig={column.editorConfig}
            onSave={onCellSave}
          />
        );
      }

      if (column.render) {
        return column.render(value, row, rowIndex);
      }

      return String(value ?? '');
    },
    [editable, getRowId, onCellSave]
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      <div
        className={cn(
          'flex items-center justify-between gap-4 p-4',
          'bg-white dark:bg-neutral-900',
          'border border-neutral-200 dark:border-neutral-800 rounded-t-xl',
          toolbarClassName
        )}
      >
        {/* Left side: Views & Filters */}
        <div className="flex items-center gap-2">
          {showViewManager && (
            <SavedTableViews
              tableId={tableId}
              currentConfig={currentConfig}
              onApplyView={handleApplyView}
            />
          )}

          {filterable && (
            <Button
              variant={showFilters || (filters && filters.conditions.length > 0) ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Filters
              {filters && filters.conditions.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                  {filters.conditions.length}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Right side: Column toggle, Export */}
        <div className="flex items-center gap-2">
          {showColumnToggle && (
            <ColumnVisibilityToggle
              tableId={tableId}
              columns={columns}
            />
          )}

          {exportable && (
            <ExportOptions
              data={sortedData}
              columns={exportColumns}
              selectedIds={selectedIds}
              getRowId={getRowId}
              filename={`${tableId}-export`}
              onExport={async (config) => {
                if (onExport) {
                  await onExport(config.format, sortedData);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && filterable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-x border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <AdvancedFiltersPanel
                tableId={tableId}
                columns={filterableColumns}
                filters={filters || undefined}
                onFiltersChange={handleFiltersChange}
                variant="panel"
                className="border-0 rounded-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick filter chips (when filters panel is closed) */}
      {!showFilters && filters && filters.conditions.length > 0 && (
        <div className="px-4 py-2 border-x border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <QuickFilterChips
            filters={filters}
            columns={filterableColumns}
            onRemove={(id) => {
              const removeCondition = (group: FilterGroup): FilterGroup => ({
                ...group,
                conditions: group.conditions.filter((c) => c.id !== id),
              });
              handleFiltersChange(removeCondition(filters));
            }}
            onClear={() => handleFiltersChange({ id: '', logic: 'AND', conditions: [] })}
          />
        </div>
      )}

      {/* Table */}
      <div className="border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b-xl overflow-hidden">
        {virtualScrolling ? (
          <VirtualScrollTable
            data={sortedData}
            columns={visibleColumns.map((col) => ({
              ...col,
              width: widths[col.key] || col.width,
              render: (value, row, index) => renderCell(row, col, index),
            }))}
            height={height}
            rowHeight={rowHeight}
            selectable={selectable}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            sortable={sortable}
            sortState={sortState}
            onSort={handleSort}
            onRowClick={onRowClick}
            rowActions={rowActions}
            stickyHeader={stickyHeader}
            striped={striped}
            isLoading={isLoading}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            getRowId={getRowId}
          />
        ) : (
          <StandardTable
            data={sortedData}
            columns={visibleColumns}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            sortState={sortState}
            onSort={handleSort}
            onRowClick={onRowClick}
            rowActions={rowActions}
            getRowId={getRowId}
            widths={widths}
            onWidthChange={handleWidthChange}
            resizable={resizable}
            striped={striped}
            renderCell={renderCell}
            tableId={tableId}
            selectable={selectable}
            sortable={sortable}
          />
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectable && selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedIds={selectedIds}
          totalCount={sortedData.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          actions={effectiveBulkActions}
          position="floating"
        />
      )}
    </div>
  );
}

// Standard (non-virtual) table for smaller datasets
interface StandardTableProps<T> {
  data: T[];
  columns: EnhancedColumn<T>[];
  selectedIds: Set<string | number>;
  onSelectionChange: (ids: Set<string | number>) => void;
  sortState: SortState;
  onSort: (state: SortState) => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  getRowId: (row: T, index: number) => string | number;
  widths: Record<string, number>;
  onWidthChange: (key: string, width: number) => void;
  resizable: boolean;
  striped: boolean;
  renderCell: (row: T, column: EnhancedColumn<T>, index: number) => React.ReactNode;
  tableId: string;
  selectable: boolean;
  sortable: boolean;
}

function StandardTable<T extends Record<string, unknown>>({
  data,
  columns,
  selectedIds,
  onSelectionChange,
  sortState,
  onSort,
  onRowClick,
  rowActions,
  getRowId,
  widths,
  onWidthChange,
  resizable,
  striped,
  renderCell,
  tableId,
  selectable,
  sortable,
}: StandardTableProps<T>) {
  const isAllSelected = data.length > 0 && data.every((row, i) => selectedIds.has(getRowId(row, i)));
  const isSomeSelected = data.some((row, i) => selectedIds.has(getRowId(row, i)));

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row, i) => getRowId(row, i))));
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  const handleSort = (columnKey: string) => {
    let newDirection: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === columnKey) {
      if (sortState.direction === 'asc') {
        newDirection = 'desc';
      } else if (sortState.direction === 'desc') {
        newDirection = null;
      }
    }

    onSort({
      column: newDirection ? columnKey : null,
      direction: newDirection,
    });
  };

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead className="bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10">
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isAllSelected ? true : isSomeSelected ? 'mixed' : false}
                  onClick={handleSelectAll}
                  className={cn(
                    'w-4 h-4 rounded border-2 transition-all duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    isAllSelected || isSomeSelected
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-300 dark:border-neutral-600'
                  )}
                >
                  {isAllSelected && <Check className="w-3 h-3" />}
                  {!isAllSelected && isSomeSelected && <Minus className="w-3 h-3" />}
                </button>
              </th>
            )}

            {columns.map((column) => {
              const isSorted = sortState.column === column.key;

              if (resizable && column.resizable !== false) {
                return (
                  <ResizableColumnHeader
                    key={column.key}
                    columnKey={column.key}
                    tableId={tableId}
                    width={widths[column.key]}
                    onWidthChange={(w) => onWidthChange(column.key, w)}
                    minWidth={column.minWidth}
                    maxWidth={column.maxWidth}
                    className={cn(
                      'px-4 py-3',
                      'text-xs font-semibold uppercase tracking-wider',
                      'text-neutral-500 dark:text-neutral-400',
                      'border-b border-neutral-200 dark:border-neutral-800',
                      sortable && column.sortable !== false && 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    )}
                  >
                    <div
                      className="flex items-center gap-1"
                      onClick={sortable && column.sortable !== false ? () => handleSort(column.key) : undefined}
                    >
                      {column.header}
                      {sortable && column.sortable !== false && (
                        <span className="ml-1">
                          {isSorted ? (
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
                  </ResizableColumnHeader>
                );
              }

              return (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3',
                    'text-xs font-semibold uppercase tracking-wider',
                    'text-neutral-500 dark:text-neutral-400',
                    'border-b border-neutral-200 dark:border-neutral-800',
                    sortable && column.sortable !== false && 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  )}
                  style={{ width: column.width }}
                  onClick={sortable && column.sortable !== false ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {sortable && column.sortable !== false && (
                      <span className="ml-1">
                        {isSorted ? (
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
              );
            })}

            {rowActions && (
              <th className="w-12 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800" />
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
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
                  onRowClick && 'cursor-pointer'
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selectable && (
                  <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => handleSelectRow(rowId)}
                      className={cn(
                        'w-4 h-4 rounded border-2 transition-all duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  </td>
                )}

                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3',
                      'text-sm text-neutral-700 dark:text-neutral-300',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{ width: widths[column.key] || column.width }}
                  >
                    {renderCell(row, column, index)}
                  </td>
                ))}

                {rowActions && (
                  <td className="w-12 px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
          <p className="text-lg font-medium">No data to display</p>
          <p className="text-sm">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
}

export default EnhancedDataTable;
