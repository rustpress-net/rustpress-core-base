/**
 * RustPress Draggable Dashboard Grid
 * Drag-and-drop widget arrangement with responsive grid layout
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  GripVertical,
  Settings,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Plus,
  Layout,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '../utils';
import {
  useDashboardStore,
  useActiveLayout,
  useVisibleWidgets,
  WidgetConfig,
  WidgetType,
} from '../../store/dashboardStore';
import { Card, CardHeader, CardBody } from './Card';
import { Button, IconButton } from './Button';
import { Badge } from './Badge';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';

// Widget size presets
const widthClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

const heightClasses: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

// Widget component wrapper
interface WidgetWrapperProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  isEditMode: boolean;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onResize: (width: 1 | 2 | 3 | 4, height: 1 | 2 | 3) => void;
}

function WidgetWrapper({
  widget,
  children,
  isEditMode,
  onRemove,
  onToggleVisibility,
  onResize,
}: WidgetWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        widthClasses[widget.width],
        heightClasses[widget.height],
        'relative group min-h-[200px]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit mode overlay */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'absolute inset-0 z-10',
            'border-2 border-dashed rounded-xl',
            'border-primary-400 dark:border-primary-500',
            'bg-primary-50/50 dark:bg-primary-900/20',
            'cursor-move'
          )}
        >
          {/* Drag handle */}
          <div className="absolute top-2 left-2 p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-md">
            <GripVertical className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Widget controls */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {/* Resize dropdown */}
            <Dropdown>
              <DropdownTrigger asChild>
                <button className="p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  <Maximize2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                </button>
              </DropdownTrigger>
              <DropdownMenu align="end">
                <DropdownLabel>Widget Size</DropdownLabel>
                <DropdownSeparator />
                <DropdownItem onClick={() => onResize(1, 1)}>Small (1x1)</DropdownItem>
                <DropdownItem onClick={() => onResize(2, 1)}>Wide (2x1)</DropdownItem>
                <DropdownItem onClick={() => onResize(2, 2)}>Medium (2x2)</DropdownItem>
                <DropdownItem onClick={() => onResize(3, 2)}>Large (3x2)</DropdownItem>
                <DropdownItem onClick={() => onResize(4, 1)}>Full Width (4x1)</DropdownItem>
                <DropdownItem onClick={() => onResize(4, 2)}>Full Wide (4x2)</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* Hide button */}
            <button
              onClick={onToggleVisibility}
              className="p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <EyeOff className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>

            {/* Remove button */}
            <button
              onClick={onRemove}
              className="p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-md hover:bg-error-50 dark:hover:bg-error-900/30 transition-colors"
            >
              <X className="w-4 h-4 text-error-500" />
            </button>
          </div>

          {/* Widget title badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="primary" size="sm">
              {widget.title}
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Widget content */}
      <div className={cn('h-full', isEditMode && 'pointer-events-none')}>
        {children}
      </div>
    </motion.div>
  );
}

// Hidden widgets panel
interface HiddenWidgetsPanelProps {
  hiddenWidgets: WidgetConfig[];
  onShow: (widgetId: string) => void;
}

function HiddenWidgetsPanel({ hiddenWidgets, onShow }: HiddenWidgetsPanelProps) {
  if (hiddenWidgets.length === 0) return null;

  return (
    <div className="mt-6 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-3 flex items-center gap-2">
        <EyeOff className="w-4 h-4" />
        Hidden Widgets ({hiddenWidgets.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {hiddenWidgets.map((widget) => (
          <button
            key={widget.id}
            onClick={() => onShow(widget.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-200 dark:border-neutral-700',
              'text-sm text-neutral-600 dark:text-neutral-300',
              'hover:border-primary-500 hover:text-primary-600',
              'dark:hover:text-primary-400',
              'transition-colors'
            )}
          >
            <Eye className="w-4 h-4" />
            {widget.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// Main grid component
export interface DraggableDashboardGridProps {
  children: (widget: WidgetConfig) => React.ReactNode;
  className?: string;
}

export function DraggableDashboardGrid({
  children,
  className,
}: DraggableDashboardGridProps) {
  const {
    isEditMode,
    setEditMode,
    updateWidgetConfig,
    toggleWidget,
    removeWidget,
    reorderWidgets,
    resetToDefault,
  } = useDashboardStore();

  const layout = useActiveLayout();
  const visibleWidgets = useVisibleWidgets();
  const hiddenWidgets = layout.widgets.filter((w) => !w.visible);

  const handleReorder = (newOrder: WidgetConfig[]) => {
    reorderWidgets(newOrder.map((w) => w.id));
  };

  const handleResize = (widgetId: string, width: 1 | 2 | 3 | 4, height: 1 | 2 | 3) => {
    updateWidgetConfig(widgetId, { width, height });
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Dashboard
          </h2>
          {isEditMode && (
            <Badge variant="warning" size="sm">
              Edit Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="text-neutral-600 dark:text-neutral-400"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditMode(false)}
              >
                <Save className="w-4 h-4 mr-2" />
                Done
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Layout className="w-4 h-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min',
          isEditMode && 'min-h-[400px]'
        )}
      >
        <Reorder.Group
          axis="y"
          values={visibleWidgets}
          onReorder={handleReorder}
          className="contents"
        >
          <AnimatePresence mode="popLayout">
            {visibleWidgets.map((widget) => (
              <Reorder.Item
                key={widget.id}
                value={widget}
                dragListener={isEditMode}
                className={cn(
                  widthClasses[widget.width],
                  heightClasses[widget.height]
                )}
              >
                <WidgetWrapper
                  widget={widget}
                  isEditMode={isEditMode}
                  onRemove={() => removeWidget(widget.id)}
                  onToggleVisibility={() => toggleWidget(widget.id)}
                  onResize={(width, height) => handleResize(widget.id, width, height)}
                >
                  {children(widget)}
                </WidgetWrapper>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      {/* Hidden widgets panel */}
      {isEditMode && (
        <HiddenWidgetsPanel
          hiddenWidgets={hiddenWidgets}
          onShow={toggleWidget}
        />
      )}
    </div>
  );
}

// Simple grid without drag-and-drop (for static layouts)
export interface StaticDashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function StaticDashboardGrid({
  children,
  className,
  columns = 4,
}: StaticDashboardGridProps) {
  const columnClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4 auto-rows-min',
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

// Grid item for static grid
export interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}

export function GridItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: GridItemProps) {
  return (
    <div
      className={cn(
        widthClasses[colSpan],
        heightClasses[rowSpan],
        'min-h-[200px]',
        className
      )}
    >
      {children}
    </div>
  );
}

export default DraggableDashboardGrid;
