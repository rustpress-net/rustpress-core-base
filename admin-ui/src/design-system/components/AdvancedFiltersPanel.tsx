/**
 * RustPress Advanced Filters Panel Component
 * Multi-field filters with AND/OR logic
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Save,
  RotateCcw,
  Copy,
} from 'lucide-react';
import { cn } from '../utils';
import {
  FilterOperator,
  FilterCondition,
  FilterGroup,
  FilterLogic,
  useTableStore,
} from '../../store/tableStore';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from './Dropdown';

export interface FilterableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  operators?: FilterOperator[];
  enumOptions?: { value: string | number; label: string }[];
}

export interface AdvancedFiltersPanelProps {
  tableId: string;
  columns: FilterableColumn[];
  filters?: FilterGroup;
  onFiltersChange?: (filters: FilterGroup) => void;
  variant?: 'inline' | 'panel' | 'modal';
  showSaveOption?: boolean;
  className?: string;
}

// Default operators by type
const defaultOperators: Record<FilterableColumn['type'], FilterOperator[]> = {
  string: ['contains', 'not_contains', 'equals', 'not_equals', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_empty', 'is_not_empty'],
  date: ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'],
  boolean: ['equals'],
  enum: ['equals', 'not_equals', 'in', 'not_in'],
};

const operatorLabels: Record<FilterOperator, string> = {
  equals: 'Equals',
  not_equals: 'Does not equal',
  contains: 'Contains',
  not_contains: 'Does not contain',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
  greater_than: 'Greater than',
  less_than: 'Less than',
  greater_equal: 'Greater or equal',
  less_equal: 'Less or equal',
  between: 'Between',
  in: 'Is one of',
  not_in: 'Is not one of',
  is_empty: 'Is empty',
  is_not_empty: 'Is not empty',
};

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function AdvancedFiltersPanel({
  tableId,
  columns,
  filters: controlledFilters,
  onFiltersChange,
  variant = 'panel',
  showSaveOption = true,
  className,
}: AdvancedFiltersPanelProps) {
  const {
    getFilters,
    setFilters,
    addFilterCondition,
    removeFilterCondition,
    updateFilterCondition,
    clearFilters,
  } = useTableStore();

  // Use controlled or store filters
  const storeFilters = getFilters(tableId);
  const filters = controlledFilters ?? storeFilters ?? {
    id: generateId(),
    logic: 'AND' as FilterLogic,
    conditions: [],
  };

  const [isExpanded, setIsExpanded] = useState(true);

  // Update filters
  const updateFilters = (newFilters: FilterGroup) => {
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    } else {
      setFilters(tableId, newFilters);
    }
  };

  // Add new condition
  const handleAddCondition = () => {
    const defaultColumn = columns[0];
    const operators = defaultColumn.operators || defaultOperators[defaultColumn.type];

    const newCondition: FilterCondition = {
      id: generateId(),
      column: defaultColumn.key,
      operator: operators[0],
      value: '',
    };

    const newFilters: FilterGroup = {
      ...filters,
      conditions: [...filters.conditions, newCondition],
    };

    updateFilters(newFilters);
  };

  // Add filter group
  const handleAddGroup = () => {
    const newGroup: FilterGroup = {
      id: generateId(),
      logic: 'OR',
      conditions: [],
    };

    const newFilters: FilterGroup = {
      ...filters,
      conditions: [...filters.conditions, newGroup],
    };

    updateFilters(newFilters);
  };

  // Remove condition
  const handleRemoveCondition = (conditionId: string) => {
    const removeFromGroup = (group: FilterGroup): FilterGroup => ({
      ...group,
      conditions: group.conditions
        .filter((c) => c.id !== conditionId)
        .map((c) => ('conditions' in c ? removeFromGroup(c) : c)),
    });

    updateFilters(removeFromGroup(filters));
  };

  // Update condition
  const handleUpdateCondition = (conditionId: string, updates: Partial<FilterCondition>) => {
    const updateInGroup = (group: FilterGroup): FilterGroup => ({
      ...group,
      conditions: group.conditions.map((c) => {
        if (c.id === conditionId && !('conditions' in c)) {
          return { ...c, ...updates } as FilterCondition;
        }
        if ('conditions' in c) {
          return updateInGroup(c);
        }
        return c;
      }),
    });

    updateFilters(updateInGroup(filters));
  };

  // Toggle logic
  const handleToggleLogic = (groupId?: string) => {
    const toggleInGroup = (group: FilterGroup): FilterGroup => {
      if (!groupId || group.id === groupId) {
        return {
          ...group,
          logic: group.logic === 'AND' ? 'OR' : 'AND',
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((c) =>
          'conditions' in c ? toggleInGroup(c) : c
        ),
      };
    };

    updateFilters(toggleInGroup(filters));
  };

  // Clear all
  const handleClear = () => {
    updateFilters({
      id: generateId(),
      logic: 'AND',
      conditions: [],
    });
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    const countConditions = (group: FilterGroup): number => {
      return group.conditions.reduce((count, c) => {
        if ('conditions' in c) {
          return count + countConditions(c);
        }
        return count + 1;
      }, 0);
    };
    return countConditions(filters);
  }, [filters]);

  // Inline variant (compact filter bar)
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        {filters.conditions.length === 0 ? (
          <Button variant="ghost" size="sm" onClick={handleAddCondition}>
            <Filter className="w-4 h-4 mr-2" />
            Add Filter
          </Button>
        ) : (
          <>
            {filters.conditions.map((condition, index) => {
              if ('conditions' in condition) return null;
              const column = columns.find((c) => c.key === condition.column);

              return (
                <motion.div
                  key={condition.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
                >
                  {index > 0 && (
                    <button
                      onClick={() => handleToggleLogic()}
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 px-1"
                    >
                      {filters.logic}
                    </button>
                  )}
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {column?.label}
                  </span>
                  <span className="text-xs text-primary-500">
                    {operatorLabels[condition.operator]}
                  </span>
                  <span className="text-sm text-primary-700 dark:text-primary-300">
                    "{String(condition.value)}"
                  </span>
                  <button
                    onClick={() => handleRemoveCondition(condition.id)}
                    className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
            <Button variant="ghost" size="xs" onClick={handleAddCondition}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button variant="ghost" size="xs" onClick={handleClear}>
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </>
        )}
      </div>
    );
  }

  // Panel variant
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          'border-b border-neutral-200 dark:border-neutral-800'
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-neutral-900 dark:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Filter className="w-4 h-4" />
          <span className="font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="xs" onClick={handleClear}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Root logic toggle */}
              {filters.conditions.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-neutral-500">Match</span>
                  <button
                    onClick={() => handleToggleLogic()}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                      'border-2',
                      filters.logic === 'AND'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-300 dark:border-neutral-600'
                    )}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => handleToggleLogic()}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                      'border-2',
                      filters.logic === 'OR'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-300 dark:border-neutral-600'
                    )}
                  >
                    ANY
                  </button>
                  <span className="text-sm text-neutral-500">conditions</span>
                </div>
              )}

              {/* Filter conditions */}
              <AnimatePresence>
                {filters.conditions.map((condition, index) => {
                  if ('conditions' in condition) {
                    // Nested group
                    return (
                      <FilterGroupComponent
                        key={condition.id}
                        group={condition}
                        columns={columns}
                        onUpdate={(updates) => {
                          const updateGroup = (g: FilterGroup): FilterGroup => ({
                            ...g,
                            conditions: g.conditions.map((c) =>
                              c.id === condition.id ? { ...condition, ...updates } : c
                            ),
                          });
                          updateFilters(updateGroup(filters));
                        }}
                        onRemove={() => handleRemoveCondition(condition.id)}
                        onRemoveCondition={handleRemoveCondition}
                        onUpdateCondition={handleUpdateCondition}
                      />
                    );
                  }

                  return (
                    <FilterConditionRow
                      key={condition.id}
                      condition={condition}
                      columns={columns}
                      showLogic={index > 0}
                      logic={filters.logic}
                      onUpdate={(updates) => handleUpdateCondition(condition.id, updates)}
                      onRemove={() => handleRemoveCondition(condition.id)}
                    />
                  );
                })}
              </AnimatePresence>

              {/* Empty state */}
              {filters.conditions.length === 0 && (
                <div className="text-center py-6 text-neutral-500">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No filters applied</p>
                  <p className="text-xs">Add conditions to filter your data</p>
                </div>
              )}

              {/* Add buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleAddCondition}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAddGroup}>
                  <Copy className="w-4 h-4 mr-1" />
                  Add Group
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter condition row
interface FilterConditionRowProps {
  condition: FilterCondition;
  columns: FilterableColumn[];
  showLogic?: boolean;
  logic?: FilterLogic;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}

function FilterConditionRow({
  condition,
  columns,
  showLogic,
  logic,
  onUpdate,
  onRemove,
}: FilterConditionRowProps) {
  const column = columns.find((c) => c.key === condition.column) || columns[0];
  const operators = column.operators || defaultOperators[column.type];

  const handleColumnChange = (columnKey: string) => {
    const newColumn = columns.find((c) => c.key === columnKey) || columns[0];
    const newOperators = newColumn.operators || defaultOperators[newColumn.type];

    onUpdate({
      column: columnKey,
      operator: newOperators[0],
      value: '',
    });
  };

  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
  const needsSecondValue = condition.operator === 'between';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-2"
    >
      {/* Logic indicator */}
      {showLogic && (
        <span className="w-12 text-center text-xs font-medium text-neutral-500">
          {logic}
        </span>
      )}
      {!showLogic && <span className="w-12" />}

      {/* Column select */}
      <select
        value={condition.column}
        onChange={(e) => handleColumnChange(e.target.value)}
        className={cn(
          'px-3 py-2 rounded-lg border text-sm',
          'border-neutral-300 dark:border-neutral-600',
          'bg-white dark:bg-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
      >
        {columns.map((col) => (
          <option key={col.key} value={col.key}>
            {col.label}
          </option>
        ))}
      </select>

      {/* Operator select */}
      <select
        value={condition.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as FilterOperator })}
        className={cn(
          'px-3 py-2 rounded-lg border text-sm',
          'border-neutral-300 dark:border-neutral-600',
          'bg-white dark:bg-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {operatorLabels[op]}
          </option>
        ))}
      </select>

      {/* Value input */}
      {needsValue && (
        <>
          {column.type === 'boolean' ? (
            <select
              value={String(condition.value)}
              onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : column.type === 'enum' && column.enumOptions ? (
            <select
              value={String(condition.value)}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              <option value="">Select...</option>
              {column.enumOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : column.type === 'date' ? (
            <input
              type="date"
              value={String(condition.value || '')}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          ) : column.type === 'number' ? (
            <input
              type="number"
              value={String(condition.value || '')}
              onChange={(e) => onUpdate({ value: e.target.valueAsNumber || '' })}
              placeholder="Value"
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          ) : (
            <input
              type="text"
              value={String(condition.value || '')}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="Value"
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          )}

          {/* Second value for between */}
          {needsSecondValue && (
            <>
              <span className="text-sm text-neutral-500">and</span>
              <input
                type={column.type === 'date' ? 'date' : 'number'}
                value={String(condition.secondValue || '')}
                onChange={(e) =>
                  onUpdate({
                    secondValue:
                      column.type === 'number' ? e.target.valueAsNumber : e.target.value,
                  })
                }
                placeholder="Value"
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border text-sm',
                  'border-neutral-300 dark:border-neutral-600',
                  'bg-white dark:bg-neutral-800',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
              />
            </>
          )}
        </>
      )}

      {/* Remove button */}
      <IconButton
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-neutral-400 hover:text-error-500"
      >
        <Trash2 className="w-4 h-4" />
      </IconButton>
    </motion.div>
  );
}

// Filter group component
interface FilterGroupComponentProps {
  group: FilterGroup;
  columns: FilterableColumn[];
  onUpdate: (updates: Partial<FilterGroup>) => void;
  onRemove: () => void;
  onRemoveCondition: (id: string) => void;
  onUpdateCondition: (id: string, updates: Partial<FilterCondition>) => void;
}

function FilterGroupComponent({
  group,
  columns,
  onUpdate,
  onRemove,
  onRemoveCondition,
  onUpdateCondition,
}: FilterGroupComponentProps) {
  const handleAddCondition = () => {
    const defaultColumn = columns[0];
    const operators = defaultColumn.operators || defaultOperators[defaultColumn.type];

    const newCondition: FilterCondition = {
      id: generateId(),
      column: defaultColumn.key,
      operator: operators[0],
      value: '',
    };

    onUpdate({
      conditions: [...group.conditions, newCondition],
    });
  };

  const handleToggleLogic = () => {
    onUpdate({
      logic: group.logic === 'AND' ? 'OR' : 'AND',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="ml-8 p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Match</span>
          <button
            onClick={handleToggleLogic}
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              'bg-neutral-100 dark:bg-neutral-800',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {group.logic}
          </button>
        </div>
        <IconButton variant="ghost" size="xs" onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </IconButton>
      </div>

      <div className="space-y-2">
        {group.conditions.map((condition, index) => {
          if ('conditions' in condition) return null;
          return (
            <FilterConditionRow
              key={condition.id}
              condition={condition}
              columns={columns}
              showLogic={index > 0}
              logic={group.logic}
              onUpdate={(updates) => onUpdateCondition(condition.id, updates)}
              onRemove={() => onRemoveCondition(condition.id)}
            />
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="xs"
        onClick={handleAddCondition}
        className="mt-2"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add to group
      </Button>
    </motion.div>
  );
}

// Quick filter chips
export interface QuickFilterChipsProps {
  filters: FilterGroup;
  columns: FilterableColumn[];
  onRemove: (conditionId: string) => void;
  onClear: () => void;
  className?: string;
}

export function QuickFilterChips({
  filters,
  columns,
  onRemove,
  onClear,
  className,
}: QuickFilterChipsProps) {
  const flatConditions = useMemo(() => {
    const flatten = (group: FilterGroup): FilterCondition[] => {
      return group.conditions.flatMap((c) =>
        'conditions' in c ? flatten(c) : [c]
      );
    };
    return flatten(filters);
  }, [filters]);

  if (flatConditions.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {flatConditions.map((condition) => {
        const column = columns.find((c) => c.key === condition.column);
        return (
          <motion.div
            key={condition.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-sm"
          >
            <span className="font-medium text-primary-700 dark:text-primary-300">
              {column?.label}
            </span>
            <span className="text-primary-500 text-xs">
              {operatorLabels[condition.operator]}
            </span>
            {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
              <span className="text-primary-700 dark:text-primary-300">
                {String(condition.value)}
              </span>
            )}
            <button
              onClick={() => onRemove(condition.id)}
              className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full"
            >
              <X className="w-3 h-3 text-primary-600" />
            </button>
          </motion.div>
        );
      })}
      <button
        onClick={onClear}
        className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        Clear all
      </button>
    </div>
  );
}

export default AdvancedFiltersPanel;
