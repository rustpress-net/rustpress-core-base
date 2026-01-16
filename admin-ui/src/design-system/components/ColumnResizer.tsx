/**
 * RustPress Column Resizer Component
 * Draggable column width resizing for tables
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { cn } from '../utils';
import { useTableStore, ColumnWidths } from '../../store/tableStore';

export interface ColumnConfig {
  key: string;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  resizable?: boolean;
}

export interface ResizableColumnHeaderProps {
  columnKey: string;
  tableId: string;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  onWidthChange?: (width: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function ResizableColumnHeader({
  columnKey,
  tableId,
  minWidth = 50,
  maxWidth = 500,
  width: controlledWidth,
  onWidthChange,
  children,
  className,
}: ResizableColumnHeaderProps) {
  const { getColumnWidths, setColumnWidth } = useTableStore();
  const storeWidths = getColumnWidths(tableId);
  const width = controlledWidth ?? storeWidths[columnKey];

  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const headerRef = useRef<HTMLTableCellElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setStartX(e.clientX);
      setStartWidth(width || headerRef.current?.offsetWidth || 100);
    },
    [width]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));

      if (onWidthChange) {
        onWidthChange(newWidth);
      } else {
        setColumnWidth(tableId, columnKey, newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, minWidth, maxWidth, tableId, columnKey, onWidthChange, setColumnWidth]);

  return (
    <th
      ref={headerRef}
      className={cn('relative', className)}
      style={{ width: width || 'auto' }}
    >
      {children}

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize',
          'hover:bg-primary-500/50 transition-colors',
          'group',
          isResizing && 'bg-primary-500'
        )}
      >
        {/* Visual indicator */}
        <div
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4',
            'bg-neutral-300 dark:bg-neutral-600 rounded',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isResizing && 'opacity-100 bg-primary-500'
          )}
        />
      </div>
    </th>
  );
}

// Hook for managing resizable columns
export interface UseResizableColumnsOptions {
  tableId: string;
  columns: ColumnConfig[];
  persistWidths?: boolean;
}

export function useResizableColumns({
  tableId,
  columns,
  persistWidths = true,
}: UseResizableColumnsOptions) {
  const { getColumnWidths, setColumnWidth, resetColumnWidths } = useTableStore();
  const [localWidths, setLocalWidths] = useState<ColumnWidths>({});

  const storeWidths = getColumnWidths(tableId);
  const widths = persistWidths ? storeWidths : localWidths;

  // Initialize with default widths
  useEffect(() => {
    const defaultWidths: ColumnWidths = {};
    columns.forEach((col) => {
      if (col.defaultWidth && !widths[col.key]) {
        defaultWidths[col.key] = col.defaultWidth;
      }
    });

    if (Object.keys(defaultWidths).length > 0) {
      if (persistWidths) {
        Object.entries(defaultWidths).forEach(([key, width]) => {
          setColumnWidth(tableId, key, width);
        });
      } else {
        setLocalWidths((prev) => ({ ...prev, ...defaultWidths }));
      }
    }
  }, [columns, tableId, persistWidths, setColumnWidth, widths]);

  const handleWidthChange = useCallback(
    (columnKey: string, width: number) => {
      if (persistWidths) {
        setColumnWidth(tableId, columnKey, width);
      } else {
        setLocalWidths((prev) => ({ ...prev, [columnKey]: width }));
      }
    },
    [tableId, persistWidths, setColumnWidth]
  );

  const resetWidths = useCallback(() => {
    if (persistWidths) {
      resetColumnWidths(tableId);
    } else {
      setLocalWidths({});
    }
  }, [tableId, persistWidths, resetColumnWidths]);

  const getColumnStyle = useCallback(
    (columnKey: string): React.CSSProperties => {
      const width = widths[columnKey];
      if (!width) return {};
      return { width, minWidth: width, maxWidth: width };
    },
    [widths]
  );

  return {
    widths,
    handleWidthChange,
    resetWidths,
    getColumnStyle,
  };
}

// Resizable table wrapper
export interface ResizableTableProps {
  tableId: string;
  children: React.ReactNode;
  className?: string;
}

export function ResizableTable({
  tableId,
  children,
  className,
}: ResizableTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse table-fixed">
        {children}
      </table>
    </div>
  );
}

// Column resize indicator (shows during resize)
export interface ColumnResizeIndicatorProps {
  isResizing: boolean;
  position: number;
}

export function ColumnResizeIndicator({
  isResizing,
  position,
}: ColumnResizeIndicatorProps) {
  if (!isResizing) return null;

  return (
    <div
      className="fixed top-0 bottom-0 w-0.5 bg-primary-500 z-50 pointer-events-none"
      style={{ left: position }}
    />
  );
}

// Auto-fit column width
export function useAutoFitColumn(
  tableId: string,
  columnKey: string,
  cellSelector: string
) {
  const { setColumnWidth } = useTableStore();

  const autoFit = useCallback(() => {
    const cells = document.querySelectorAll(cellSelector);
    let maxWidth = 0;

    cells.forEach((cell) => {
      const contentWidth = cell.scrollWidth;
      if (contentWidth > maxWidth) {
        maxWidth = contentWidth;
      }
    });

    if (maxWidth > 0) {
      setColumnWidth(tableId, columnKey, maxWidth + 20); // Add padding
    }
  }, [tableId, columnKey, cellSelector, setColumnWidth]);

  return autoFit;
}

// Double-click to auto-fit
export interface AutoFitResizerProps {
  tableId: string;
  columnKey: string;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
}

export function AutoFitResizer({
  tableId,
  columnKey,
  minWidth = 50,
  maxWidth = 500,
  onWidthChange,
}: AutoFitResizerProps) {
  const { setColumnWidth } = useTableStore();
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = useCallback(() => {
    // Auto-fit to content
    const header = resizerRef.current?.parentElement;
    if (!header) return;

    const table = header.closest('table');
    if (!table) return;

    const columnIndex = Array.from(header.parentElement?.children || []).indexOf(header);
    const cells = table.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);

    let maxWidth = header.scrollWidth;
    cells.forEach((cell) => {
      const width = cell.scrollWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });

    const finalWidth = Math.min(500, Math.max(minWidth, maxWidth + 20));

    if (onWidthChange) {
      onWidthChange(finalWidth);
    } else {
      setColumnWidth(tableId, columnKey, finalWidth);
    }
  }, [tableId, columnKey, minWidth, onWidthChange, setColumnWidth]);

  return (
    <div
      ref={resizerRef}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'absolute right-0 top-0 bottom-0 w-2 cursor-col-resize',
        'hover:bg-primary-500/30 transition-colors',
        isResizing && 'bg-primary-500/50'
      )}
      title="Drag to resize, double-click to auto-fit"
    >
      <div
        className={cn(
          'absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4',
          'bg-neutral-300 dark:bg-neutral-600 rounded'
        )}
      />
    </div>
  );
}

// Preset column width options
export interface ColumnWidthPreset {
  label: string;
  width: number | 'auto' | 'fit-content';
}

export const defaultColumnWidthPresets: ColumnWidthPreset[] = [
  { label: 'Extra Small', width: 80 },
  { label: 'Small', width: 120 },
  { label: 'Medium', width: 180 },
  { label: 'Large', width: 250 },
  { label: 'Extra Large', width: 350 },
  { label: 'Auto', width: 'auto' },
];

export interface ColumnWidthMenuProps {
  tableId: string;
  columnKey: string;
  presets?: ColumnWidthPreset[];
  onSelect?: (width: number | 'auto') => void;
  className?: string;
}

export function ColumnWidthMenu({
  tableId,
  columnKey,
  presets = defaultColumnWidthPresets,
  onSelect,
  className,
}: ColumnWidthMenuProps) {
  const { setColumnWidth, getColumnWidths } = useTableStore();
  const currentWidth = getColumnWidths(tableId)[columnKey];

  const handleSelect = (width: number | 'auto' | 'fit-content') => {
    if (width === 'auto' || width === 'fit-content') {
      // Reset to auto
      setColumnWidth(tableId, columnKey, 0);
      if (onSelect) onSelect('auto');
    } else {
      setColumnWidth(tableId, columnKey, width);
      if (onSelect) onSelect(width);
    }
  };

  return (
    <div className={cn('py-1', className)}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => handleSelect(preset.width)}
          className={cn(
            'w-full px-3 py-1.5 text-left text-sm',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'flex items-center justify-between',
            currentWidth === preset.width && 'bg-primary-50 dark:bg-primary-900/20'
          )}
        >
          <span>{preset.label}</span>
          {typeof preset.width === 'number' && (
            <span className="text-xs text-neutral-500">{preset.width}px</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default ResizableColumnHeader;
