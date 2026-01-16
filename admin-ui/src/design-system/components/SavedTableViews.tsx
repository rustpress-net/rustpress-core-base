/**
 * RustPress Saved Table Views Component
 * Save and restore filter/sort/visibility configurations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Bookmark,
  BookmarkCheck,
  Star,
  StarOff,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  ChevronDown,
  LayoutGrid,
  Clock,
  Filter,
  SortAsc,
  Columns3,
} from 'lucide-react';
import { cn } from '../utils';
import { useTableStore, TableView, FilterGroup, ColumnVisibility } from '../../store/tableStore';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';
import { Modal, ModalFooter } from './Modal';
import { Input } from './Input';

export interface SavedTableViewsProps {
  tableId: string;
  currentConfig?: {
    filters?: FilterGroup;
    sort?: { column: string; direction: 'asc' | 'desc' };
    columnVisibility?: ColumnVisibility;
    columnOrder?: string[];
    pageSize?: number;
  };
  onApplyView?: (view: TableView) => void;
  variant?: 'dropdown' | 'tabs' | 'sidebar';
  className?: string;
}

export function SavedTableViews({
  tableId,
  currentConfig,
  onApplyView,
  variant = 'dropdown',
  className,
}: SavedTableViewsProps) {
  const {
    getViewsForTable,
    saveView,
    updateView,
    deleteView,
    activeViewId,
    setActiveView,
  } = useTableStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingView, setEditingView] = useState<TableView | null>(null);
  const [viewName, setViewName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const views = getViewsForTable(tableId);
  const activeView = views.find((v) => v.id === activeViewId);

  // Count active config items
  const getConfigSummary = (config: TableView['config']) => {
    const items: string[] = [];
    if (config.filters && config.filters.conditions.length > 0) {
      items.push(`${config.filters.conditions.length} filter${config.filters.conditions.length > 1 ? 's' : ''}`);
    }
    if (config.sort) {
      items.push('sorted');
    }
    if (config.columnVisibility && Object.keys(config.columnVisibility).length > 0) {
      const hiddenCount = Object.values(config.columnVisibility).filter((v) => !v).length;
      if (hiddenCount > 0) {
        items.push(`${hiddenCount} hidden`);
      }
    }
    return items.length > 0 ? items.join(', ') : 'No config';
  };

  const handleSaveView = () => {
    if (!viewName.trim()) return;

    if (editingView) {
      updateView(editingView.id, currentConfig || {});
    } else {
      const viewId = saveView({
        name: viewName,
        tableId,
        isDefault,
        config: currentConfig || {},
      });

      if (isDefault) {
        setActiveView(viewId);
      }
    }

    setShowSaveModal(false);
    setViewName('');
    setIsDefault(false);
    setEditingView(null);
  };

  const handleApplyView = (view: TableView) => {
    setActiveView(view.id);
    if (onApplyView) {
      onApplyView(view);
    }
  };

  const handleDeleteView = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteView(viewId);
  };

  const handleEditView = (view: TableView, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingView(view);
    setViewName(view.name);
    setIsDefault(view.isDefault || false);
    setShowSaveModal(true);
  };

  const handleSetDefault = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update all views to remove default, then set this one
    views.forEach((v) => {
      if (v.isDefault) {
        updateView(v.id, { ...v.config });
      }
    });
    updateView(viewId, {});
    setActiveView(viewId);
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <>
        <Dropdown>
          <DropdownTrigger asChild>
            <Button
              variant={activeView ? 'primary' : 'outline'}
              size="sm"
              className={className}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {activeView ? activeView.name : 'Views'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownTrigger>

          <DropdownMenu align="end" className="w-72">
            <DropdownLabel>Saved Views</DropdownLabel>
            <DropdownSeparator />

            {/* Save current view */}
            <DropdownItem onClick={() => setShowSaveModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Save Current View
            </DropdownItem>

            {views.length > 0 && <DropdownSeparator />}

            {/* View list */}
            <div className="max-h-64 overflow-y-auto">
              {views.map((view) => (
                <DropdownItem
                  key={view.id}
                  onClick={() => handleApplyView(view)}
                  className={cn(
                    'group justify-between',
                    view.id === activeViewId && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {view.id === activeViewId ? (
                      <BookmarkCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-medium">{view.name}</span>
                        {view.isDefault && (
                          <Star className="w-3 h-3 text-warning-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 truncate block">
                        {getConfigSummary(view.config)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditView(view, e)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteView(view.id, e)}
                      className="p-1 hover:bg-error-100 dark:hover:bg-error-900/30 text-error-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </DropdownItem>
              ))}
            </div>

            {activeViewId && (
              <>
                <DropdownSeparator />
                <DropdownItem onClick={() => setActiveView(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Active View
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        </Dropdown>

        {/* Save/Edit Modal */}
        <SaveViewModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setEditingView(null);
            setViewName('');
            setIsDefault(false);
          }}
          viewName={viewName}
          setViewName={setViewName}
          isDefault={isDefault}
          setIsDefault={setIsDefault}
          isEditing={!!editingView}
          onSave={handleSaveView}
          currentConfig={currentConfig}
        />
      </>
    );
  }

  // Tabs variant
  if (variant === 'tabs') {
    return (
      <>
        <div className={cn('flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800', className)}>
          <button
            onClick={() => setActiveView(null)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              !activeViewId
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            )}
          >
            All
          </button>

          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => handleApplyView(view)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5',
                view.id === activeViewId
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              {view.name}
              {view.isDefault && <Star className="w-3 h-3 text-warning-500" />}
            </button>
          ))}

          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <SaveViewModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setEditingView(null);
            setViewName('');
            setIsDefault(false);
          }}
          viewName={viewName}
          setViewName={setViewName}
          isDefault={isDefault}
          setIsDefault={setIsDefault}
          isEditing={!!editingView}
          onSave={handleSaveView}
          currentConfig={currentConfig}
        />
      </>
    );
  }

  // Sidebar variant
  return (
    <>
      <div className={cn('p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Saved Views
          </h3>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => setShowSaveModal(true)}
            aria-label="Add view"
          >
            <Plus className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="space-y-2">
          {/* Default "All" view */}
          <button
            onClick={() => setActiveView(null)}
            className={cn(
              'w-full p-3 rounded-lg text-left transition-all',
              !activeViewId
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-transparent'
            )}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className={cn(
                'w-4 h-4',
                !activeViewId ? 'text-primary-500' : 'text-neutral-400'
              )} />
              <span className={cn(
                'font-medium',
                !activeViewId
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-neutral-700 dark:text-neutral-300'
              )}>
                All Items
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 ml-6">Default view</p>
          </button>

          {/* Saved views */}
          <AnimatePresence>
            {views.map((view) => (
              <motion.div
                key={view.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  onClick={() => handleApplyView(view)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-all group',
                    view.id === activeViewId
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-transparent'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Bookmark className={cn(
                        'w-4 h-4 flex-shrink-0',
                        view.id === activeViewId ? 'text-primary-500' : 'text-neutral-400'
                      )} />
                      <span className={cn(
                        'font-medium truncate',
                        view.id === activeViewId
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-neutral-700 dark:text-neutral-300'
                      )}>
                        {view.name}
                      </span>
                      {view.isDefault && (
                        <Star className="w-3.5 h-3.5 text-warning-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleSetDefault(view.id, e)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                        title={view.isDefault ? 'Remove default' : 'Set as default'}
                      >
                        {view.isDefault ? (
                          <StarOff className="w-3.5 h-3.5 text-warning-500" />
                        ) : (
                          <Star className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleEditView(view, e)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteView(view.id, e)}
                        className="p-1 hover:bg-error-100 dark:hover:bg-error-900/30 text-error-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Config summary */}
                  <div className="flex items-center gap-3 mt-2 ml-6 text-xs text-neutral-500">
                    {view.config.filters && view.config.filters.conditions.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        {view.config.filters.conditions.length}
                      </span>
                    )}
                    {view.config.sort && (
                      <span className="flex items-center gap-1">
                        <SortAsc className="w-3 h-3" />
                        {view.config.sort.column}
                      </span>
                    )}
                    {view.config.columnVisibility && (
                      <span className="flex items-center gap-1">
                        <Columns3 className="w-3 h-3" />
                        columns
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(view.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {views.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-4">
              No saved views yet. Save your current configuration to quick access later.
            </p>
          )}
        </div>
      </div>

      <SaveViewModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setEditingView(null);
          setViewName('');
          setIsDefault(false);
        }}
        viewName={viewName}
        setViewName={setViewName}
        isDefault={isDefault}
        setIsDefault={setIsDefault}
        isEditing={!!editingView}
        onSave={handleSaveView}
        currentConfig={currentConfig}
      />
    </>
  );
}

// Save View Modal
interface SaveViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewName: string;
  setViewName: (name: string) => void;
  isDefault: boolean;
  setIsDefault: (isDefault: boolean) => void;
  isEditing: boolean;
  onSave: () => void;
  currentConfig?: SavedTableViewsProps['currentConfig'];
}

function SaveViewModal({
  isOpen,
  onClose,
  viewName,
  setViewName,
  isDefault,
  setIsDefault,
  isEditing,
  onSave,
  currentConfig,
}: SaveViewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit View' : 'Save View'}
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="View Name"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          placeholder="e.g., Published Posts, Draft Articles"
          autoFocus
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Set as default view
          </span>
        </label>

        {/* Config preview */}
        {currentConfig && !isEditing && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <p className="text-xs font-medium text-neutral-500 mb-2">
              This view will save:
            </p>
            <div className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              {currentConfig.filters && currentConfig.filters.conditions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  {currentConfig.filters.conditions.length} filter(s)
                </div>
              )}
              {currentConfig.sort && (
                <div className="flex items-center gap-2">
                  <SortAsc className="w-3.5 h-3.5 text-neutral-400" />
                  Sort by {currentConfig.sort.column} ({currentConfig.sort.direction})
                </div>
              )}
              {currentConfig.columnVisibility && Object.keys(currentConfig.columnVisibility).length > 0 && (
                <div className="flex items-center gap-2">
                  <Columns3 className="w-3.5 h-3.5 text-neutral-400" />
                  Column visibility settings
                </div>
              )}
              {currentConfig.columnOrder && currentConfig.columnOrder.length > 0 && (
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-neutral-400" />
                  Column order settings
                </div>
              )}
              {!currentConfig.filters?.conditions.length &&
                !currentConfig.sort &&
                !currentConfig.columnVisibility &&
                !currentConfig.columnOrder && (
                  <span className="text-neutral-500">No configuration to save</span>
                )}
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!viewName.trim()}
          leftIcon={isEditing ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {isEditing ? 'Update View' : 'Save View'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Quick save button
export interface QuickSaveViewButtonProps {
  tableId: string;
  currentConfig?: SavedTableViewsProps['currentConfig'];
  className?: string;
}

export function QuickSaveViewButton({
  tableId,
  currentConfig,
  className,
}: QuickSaveViewButtonProps) {
  const { saveView } = useTableStore();
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    saveView({
      name,
      tableId,
      config: currentConfig || {},
    });
    setName('');
    setShowInput(false);
  };

  if (showInput) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Input
          size="sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="View name..."
          className="w-40"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setShowInput(false);
              setName('');
            }
          }}
        />
        <IconButton variant="primary" size="sm" onClick={handleSave}>
          <Check className="w-4 h-4" />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowInput(false);
            setName('');
          }}
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowInput(true)}
      className={className}
    >
      <Save className="w-4 h-4 mr-2" />
      Save View
    </Button>
  );
}

export default SavedTableViews;
