/**
 * RustPress Column Visibility Toggle Component
 * Show/hide columns with dropdown or panel interface
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Columns3,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  RotateCcw,
  Settings2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../utils';
import { Column } from './DataTable';
import { useTableStore, ColumnVisibility } from '../../store/tableStore';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';

export interface ColumnVisibilityToggleProps<T> {
  tableId: string;
  columns: Column<T>[];
  visibility?: ColumnVisibility;
  onVisibilityChange?: (visibility: ColumnVisibility) => void;
  variant?: 'dropdown' | 'panel';
  showReorder?: boolean;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  className?: string;
}

export function ColumnVisibilityToggle<T>({
  tableId,
  columns,
  visibility: controlledVisibility,
  onVisibilityChange,
  variant = 'dropdown',
  showReorder = false,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  className,
}: ColumnVisibilityToggleProps<T>) {
  const {
    getColumnVisibility,
    setColumnVisibility,
    setAllColumnsVisibility,
    resetColumnVisibility,
    getColumnOrder,
    setColumnOrder,
  } = useTableStore();

  // Use controlled or store state
  const storeVisibility = getColumnVisibility(tableId);
  const visibility = controlledVisibility ?? storeVisibility;

  const storeColumnOrder = getColumnOrder(tableId);
  const columnOrder = controlledColumnOrder ?? storeColumnOrder;

  // Build column list with order
  const orderedColumns = useMemo(() => {
    if (columnOrder.length === 0) {
      return columns;
    }
    return [...columns].sort((a, b) => {
      const aIndex = columnOrder.indexOf(a.key);
      const bIndex = columnOrder.indexOf(b.key);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [columns, columnOrder]);

  // Count visible columns
  const visibleCount = columns.filter(
    (col) => visibility[col.key] !== false
  ).length;

  // Handlers
  const handleToggle = (columnKey: string) => {
    const newVisibility = {
      ...visibility,
      [columnKey]: visibility[columnKey] === false,
    };

    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    } else {
      setColumnVisibility(tableId, columnKey, newVisibility[columnKey]);
    }
  };

  const handleShowAll = () => {
    const newVisibility: ColumnVisibility = {};
    columns.forEach((col) => {
      newVisibility[col.key] = true;
    });

    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    } else {
      setAllColumnsVisibility(tableId, newVisibility);
    }
  };

  const handleHideAll = () => {
    const newVisibility: ColumnVisibility = {};
    columns.forEach((col, index) => {
      // Keep at least the first column visible
      newVisibility[col.key] = index === 0;
    });

    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    } else {
      setAllColumnsVisibility(tableId, newVisibility);
    }
  };

  const handleReset = () => {
    if (onVisibilityChange) {
      onVisibilityChange({});
    } else {
      resetColumnVisibility(tableId);
    }

    if (onColumnOrderChange) {
      onColumnOrderChange([]);
    } else {
      setColumnOrder(tableId, []);
    }
  };

  const handleReorder = (newOrder: Column<T>[]) => {
    const order = newOrder.map((col) => col.key);
    if (onColumnOrderChange) {
      onColumnOrderChange(order);
    } else {
      setColumnOrder(tableId, order);
    }
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <Dropdown>
        <DropdownTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={className}
          >
            <Columns3 className="w-4 h-4 mr-2" />
            Columns
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu align="end" className="w-56">
          <DropdownLabel>
            Toggle Columns ({visibleCount}/{columns.length})
          </DropdownLabel>
          <DropdownSeparator />

          {/* Quick actions */}
          <div className="flex items-center gap-1 px-2 py-1.5">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleShowAll}
              className="flex-1"
            >
              Show All
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleHideAll}
              className="flex-1"
            >
              Hide All
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          <DropdownSeparator />

          {/* Column toggles */}
          <div className="max-h-64 overflow-y-auto">
            {orderedColumns.map((column) => {
              const isVisible = visibility[column.key] !== false;
              return (
                <DropdownItem
                  key={column.key}
                  onClick={() => handleToggle(column.key)}
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    {isVisible ? (
                      <Eye className="w-4 h-4 text-success-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-neutral-400" />
                    )}
                    <span className={!isVisible ? 'text-neutral-400' : ''}>
                      {typeof column.header === 'string' ? column.header : column.key}
                    </span>
                  </span>
                  {isVisible && <Check className="w-4 h-4 text-success-500" />}
                </DropdownItem>
              );
            })}
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  }

  // Panel variant (for more control)
  return (
    <div className={cn('p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-neutral-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Column Settings
          </h3>
        </div>
        <span className="text-sm text-neutral-500">
          {visibleCount} of {columns.length} visible
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleShowAll}>
          Show All
        </Button>
        <Button variant="outline" size="sm" onClick={handleHideAll}>
          Hide All
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Column list with optional reorder */}
      {showReorder ? (
        <Reorder.Group
          axis="y"
          values={orderedColumns}
          onReorder={handleReorder}
          className="space-y-1"
        >
          {orderedColumns.map((column) => {
            const isVisible = visibility[column.key] !== false;
            return (
              <Reorder.Item
                key={column.key}
                value={column}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing',
                  'bg-neutral-50 dark:bg-neutral-800/50',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'transition-colors'
                )}
              >
                <GripVertical className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <button
                  onClick={() => handleToggle(column.key)}
                  className="flex items-center gap-2 flex-1"
                >
                  {isVisible ? (
                    <Eye className="w-4 h-4 text-success-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-neutral-400" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      isVisible
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-400'
                    )}
                  >
                    {typeof column.header === 'string' ? column.header : column.key}
                  </span>
                </button>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      ) : (
        <div className="space-y-1">
          {orderedColumns.map((column) => {
            const isVisible = visibility[column.key] !== false;
            return (
              <button
                key={column.key}
                onClick={() => handleToggle(column.key)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'transition-colors'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    isVisible
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-300 dark:border-neutral-600'
                  )}
                >
                  {isVisible && <Check className="w-3 h-3" />}
                </div>
                <span
                  className={cn(
                    'text-sm',
                    isVisible
                      ? 'text-neutral-700 dark:text-neutral-300'
                      : 'text-neutral-400'
                  )}
                >
                  {typeof column.header === 'string' ? column.header : column.key}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Simple toggle button for individual column
export interface ColumnToggleButtonProps {
  visible: boolean;
  label: string;
  onToggle: () => void;
  className?: string;
}

export function ColumnToggleButton({
  visible,
  label,
  onToggle,
  className,
}: ColumnToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
        'transition-colors',
        visible
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
        className
      )}
    >
      {visible ? (
        <Eye className="w-3 h-3" />
      ) : (
        <EyeOff className="w-3 h-3" />
      )}
      {label}
    </button>
  );
}

export default ColumnVisibilityToggle;
