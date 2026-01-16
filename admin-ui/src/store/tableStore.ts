/**
 * RustPress Table Store
 * Manages table views, filters, column visibility, and state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Filter operators
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty';

export type FilterLogic = 'AND' | 'OR';

// Filter condition
export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number | boolean | (string | number)[];
  secondValue?: string | number; // For 'between' operator
}

// Filter group (for nested AND/OR logic)
export interface FilterGroup {
  id: string;
  logic: FilterLogic;
  conditions: (FilterCondition | FilterGroup)[];
}

// Column visibility state
export interface ColumnVisibility {
  [columnKey: string]: boolean;
}

// Column width state
export interface ColumnWidths {
  [columnKey: string]: number;
}

// Saved table view
export interface TableView {
  id: string;
  name: string;
  tableId: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  config: {
    filters?: FilterGroup;
    sort?: {
      column: string;
      direction: 'asc' | 'desc';
    };
    columnVisibility?: ColumnVisibility;
    columnWidths?: ColumnWidths;
    columnOrder?: string[];
    pageSize?: number;
  };
}

// Inline edit state
export interface EditingCell {
  rowId: string | number;
  columnKey: string;
  originalValue: unknown;
  currentValue: unknown;
}

// Table state interface
interface TableState {
  // Views
  views: TableView[];
  activeViewId: string | null;

  // Column visibility per table
  columnVisibility: Record<string, ColumnVisibility>;

  // Column widths per table
  columnWidths: Record<string, ColumnWidths>;

  // Column order per table
  columnOrder: Record<string, string[]>;

  // Active filters per table
  activeFilters: Record<string, FilterGroup>;

  // Editing state
  editingCells: EditingCell[];

  // Actions - Views
  saveView: (view: Omit<TableView, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateView: (viewId: string, config: Partial<TableView['config']>) => void;
  deleteView: (viewId: string) => void;
  setActiveView: (viewId: string | null) => void;
  getViewsForTable: (tableId: string) => TableView[];

  // Actions - Column Visibility
  setColumnVisibility: (tableId: string, columnKey: string, visible: boolean) => void;
  setAllColumnsVisibility: (tableId: string, visibility: ColumnVisibility) => void;
  resetColumnVisibility: (tableId: string) => void;
  getColumnVisibility: (tableId: string) => ColumnVisibility;

  // Actions - Column Widths
  setColumnWidth: (tableId: string, columnKey: string, width: number) => void;
  resetColumnWidths: (tableId: string) => void;
  getColumnWidths: (tableId: string) => ColumnWidths;

  // Actions - Column Order
  setColumnOrder: (tableId: string, order: string[]) => void;
  getColumnOrder: (tableId: string) => string[];

  // Actions - Filters
  setFilters: (tableId: string, filters: FilterGroup) => void;
  clearFilters: (tableId: string) => void;
  addFilterCondition: (tableId: string, condition: FilterCondition) => void;
  removeFilterCondition: (tableId: string, conditionId: string) => void;
  updateFilterCondition: (tableId: string, conditionId: string, updates: Partial<FilterCondition>) => void;
  getFilters: (tableId: string) => FilterGroup | null;

  // Actions - Editing
  startEditing: (cell: Omit<EditingCell, 'currentValue'>) => void;
  updateEditingValue: (rowId: string | number, columnKey: string, value: unknown) => void;
  cancelEditing: (rowId: string | number, columnKey: string) => void;
  cancelAllEditing: () => void;
  getEditingCell: (rowId: string | number, columnKey: string) => EditingCell | undefined;
  isEditing: (rowId: string | number, columnKey: string) => boolean;
  getEditedCells: () => EditingCell[];
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create default filter group
function createDefaultFilterGroup(): FilterGroup {
  return {
    id: generateId(),
    logic: 'AND',
    conditions: [],
  };
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      // Initial state
      views: [],
      activeViewId: null,
      columnVisibility: {},
      columnWidths: {},
      columnOrder: {},
      activeFilters: {},
      editingCells: [],

      // Views
      saveView: (viewData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const view: TableView = {
          ...viewData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          views: [...state.views, view],
        }));

        return id;
      },

      updateView: (viewId, config) =>
        set((state) => ({
          views: state.views.map((view) =>
            view.id === viewId
              ? {
                  ...view,
                  config: { ...view.config, ...config },
                  updatedAt: new Date().toISOString(),
                }
              : view
          ),
        })),

      deleteView: (viewId) =>
        set((state) => ({
          views: state.views.filter((v) => v.id !== viewId),
          activeViewId: state.activeViewId === viewId ? null : state.activeViewId,
        })),

      setActiveView: (viewId) => set({ activeViewId: viewId }),

      getViewsForTable: (tableId) => {
        return get().views.filter((v) => v.tableId === tableId);
      },

      // Column Visibility
      setColumnVisibility: (tableId, columnKey, visible) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [tableId]: {
              ...state.columnVisibility[tableId],
              [columnKey]: visible,
            },
          },
        })),

      setAllColumnsVisibility: (tableId, visibility) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [tableId]: visibility,
          },
        })),

      resetColumnVisibility: (tableId) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [tableId]: {},
          },
        })),

      getColumnVisibility: (tableId) => {
        return get().columnVisibility[tableId] || {};
      },

      // Column Widths
      setColumnWidth: (tableId, columnKey, width) =>
        set((state) => ({
          columnWidths: {
            ...state.columnWidths,
            [tableId]: {
              ...state.columnWidths[tableId],
              [columnKey]: width,
            },
          },
        })),

      resetColumnWidths: (tableId) =>
        set((state) => ({
          columnWidths: {
            ...state.columnWidths,
            [tableId]: {},
          },
        })),

      getColumnWidths: (tableId) => {
        return get().columnWidths[tableId] || {};
      },

      // Column Order
      setColumnOrder: (tableId, order) =>
        set((state) => ({
          columnOrder: {
            ...state.columnOrder,
            [tableId]: order,
          },
        })),

      getColumnOrder: (tableId) => {
        return get().columnOrder[tableId] || [];
      },

      // Filters
      setFilters: (tableId, filters) =>
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [tableId]: filters,
          },
        })),

      clearFilters: (tableId) =>
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [tableId]: createDefaultFilterGroup(),
          },
        })),

      addFilterCondition: (tableId, condition) =>
        set((state) => {
          const currentFilters = state.activeFilters[tableId] || createDefaultFilterGroup();
          return {
            activeFilters: {
              ...state.activeFilters,
              [tableId]: {
                ...currentFilters,
                conditions: [...currentFilters.conditions, condition],
              },
            },
          };
        }),

      removeFilterCondition: (tableId, conditionId) =>
        set((state) => {
          const currentFilters = state.activeFilters[tableId];
          if (!currentFilters) return state;

          const removeCondition = (
            conditions: (FilterCondition | FilterGroup)[]
          ): (FilterCondition | FilterGroup)[] => {
            return conditions
              .filter((c) => c.id !== conditionId)
              .map((c) => {
                if ('conditions' in c) {
                  return { ...c, conditions: removeCondition(c.conditions) };
                }
                return c;
              });
          };

          return {
            activeFilters: {
              ...state.activeFilters,
              [tableId]: {
                ...currentFilters,
                conditions: removeCondition(currentFilters.conditions),
              },
            },
          };
        }),

      updateFilterCondition: (tableId, conditionId, updates) =>
        set((state) => {
          const currentFilters = state.activeFilters[tableId];
          if (!currentFilters) return state;

          const updateCondition = (
            conditions: (FilterCondition | FilterGroup)[]
          ): (FilterCondition | FilterGroup)[] => {
            return conditions.map((c) => {
              if (c.id === conditionId && !('conditions' in c)) {
                return { ...c, ...updates };
              }
              if ('conditions' in c) {
                return { ...c, conditions: updateCondition(c.conditions) };
              }
              return c;
            });
          };

          return {
            activeFilters: {
              ...state.activeFilters,
              [tableId]: {
                ...currentFilters,
                conditions: updateCondition(currentFilters.conditions),
              },
            },
          };
        }),

      getFilters: (tableId) => {
        return get().activeFilters[tableId] || null;
      },

      // Editing
      startEditing: (cell) =>
        set((state) => ({
          editingCells: [
            ...state.editingCells.filter(
              (c) => !(c.rowId === cell.rowId && c.columnKey === cell.columnKey)
            ),
            { ...cell, currentValue: cell.originalValue },
          ],
        })),

      updateEditingValue: (rowId, columnKey, value) =>
        set((state) => ({
          editingCells: state.editingCells.map((c) =>
            c.rowId === rowId && c.columnKey === columnKey
              ? { ...c, currentValue: value }
              : c
          ),
        })),

      cancelEditing: (rowId, columnKey) =>
        set((state) => ({
          editingCells: state.editingCells.filter(
            (c) => !(c.rowId === rowId && c.columnKey === columnKey)
          ),
        })),

      cancelAllEditing: () => set({ editingCells: [] }),

      getEditingCell: (rowId, columnKey) => {
        return get().editingCells.find(
          (c) => c.rowId === rowId && c.columnKey === columnKey
        );
      },

      isEditing: (rowId, columnKey) => {
        return get().editingCells.some(
          (c) => c.rowId === rowId && c.columnKey === columnKey
        );
      },

      getEditedCells: () => {
        return get().editingCells.filter(
          (c) => c.currentValue !== c.originalValue
        );
      },
    }),
    {
      name: 'rustpress-table',
      partialize: (state) => ({
        views: state.views,
        columnVisibility: state.columnVisibility,
        columnWidths: state.columnWidths,
        columnOrder: state.columnOrder,
      }),
    }
  )
);

// Filter utility functions
export function evaluateFilter<T extends Record<string, unknown>>(
  row: T,
  condition: FilterCondition
): boolean {
  const value = row[condition.column];
  const filterValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return value === filterValue;
    case 'not_equals':
      return value !== filterValue;
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'not_contains':
      return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'starts_with':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'ends_with':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'greater_than':
      return Number(value) > Number(filterValue);
    case 'less_than':
      return Number(value) < Number(filterValue);
    case 'greater_equal':
      return Number(value) >= Number(filterValue);
    case 'less_equal':
      return Number(value) <= Number(filterValue);
    case 'between':
      return (
        Number(value) >= Number(filterValue) &&
        Number(value) <= Number(condition.secondValue)
      );
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(value as string | number);
    case 'not_in':
      return Array.isArray(filterValue) && !filterValue.includes(value as string | number);
    case 'is_empty':
      return value === null || value === undefined || value === '';
    case 'is_not_empty':
      return value !== null && value !== undefined && value !== '';
    default:
      return true;
  }
}

export function evaluateFilterGroup<T extends Record<string, unknown>>(
  row: T,
  group: FilterGroup
): boolean {
  if (group.conditions.length === 0) return true;

  const results = group.conditions.map((condition) => {
    if ('conditions' in condition) {
      return evaluateFilterGroup(row, condition);
    }
    return evaluateFilter(row, condition);
  });

  return group.logic === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterGroup | null
): T[] {
  if (!filters || filters.conditions.length === 0) return data;
  return data.filter((row) => evaluateFilterGroup(row, filters));
}

export default useTableStore;
