/**
 * RustPress Bulk Actions Toolbar Component
 * Floating toolbar that appears when rows are selected
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Edit2,
  Copy,
  Archive,
  Download,
  Tag,
  FolderInput,
  MoreHorizontal,
  X,
  CheckSquare,
  Square,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '../utils';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from './Dropdown';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  requiresConfirmation?: boolean;
  confirmMessage?: string;
  disabled?: boolean;
  onClick: (selectedIds: Set<string | number>) => void | Promise<void>;
}

export interface BulkActionsToolbarProps {
  selectedIds: Set<string | number>;
  totalCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  actions?: BulkAction[];
  position?: 'top' | 'bottom' | 'floating';
  showSelectAll?: boolean;
  isProcessing?: boolean;
  processingAction?: string;
  className?: string;
}

export function BulkActionsToolbar({
  selectedIds,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions = [],
  position = 'floating',
  showSelectAll = true,
  isProcessing = false,
  processingAction,
  className,
}: BulkActionsToolbarProps) {
  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isSomeSelected = selectedCount > 0 && selectedCount < totalCount;

  // Split actions into primary (shown) and secondary (in dropdown)
  const { primaryActions, secondaryActions } = useMemo(() => {
    const primary = actions.slice(0, 4);
    const secondary = actions.slice(4);
    return { primaryActions: primary, secondaryActions: secondary };
  }, [actions]);

  // Confirmation state
  const [confirmingAction, setConfirmingAction] = React.useState<BulkAction | null>(null);

  const handleActionClick = async (action: BulkAction) => {
    if (action.requiresConfirmation && !confirmingAction) {
      setConfirmingAction(action);
      return;
    }

    setConfirmingAction(null);
    await action.onClick(selectedIds);
  };

  const cancelConfirmation = () => {
    setConfirmingAction(null);
  };

  if (selectedCount === 0) return null;

  const toolbarContent = (
    <>
      {/* Selection info */}
      <div className="flex items-center gap-3">
        {showSelectAll && (
          <button
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="w-5 h-5" />
            ) : isSomeSelected ? (
              <Square className="w-5 h-5 [&>path:first-child]:fill-current opacity-50" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}
        <span className="font-medium">
          {selectedCount.toLocaleString()} selected
          {totalCount > 0 && (
            <span className="opacity-75 ml-1">
              of {totalCount.toLocaleString()}
            </span>
          )}
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/20" />

      {/* Actions */}
      {confirmingAction ? (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-400" />
          <span className="text-sm">
            {confirmingAction.confirmMessage || `${confirmingAction.label} ${selectedCount} items?`}
          </span>
          <Button
            variant="primary"
            size="xs"
            onClick={() => handleActionClick(confirmingAction)}
            className="bg-white/20 hover:bg-white/30"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Confirm
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={cancelConfirmation}
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {primaryActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || isProcessing}
              className={cn(
                'text-white hover:bg-white/10',
                action.variant === 'danger' && 'hover:bg-error-500/30 text-error-300',
                action.variant === 'warning' && 'hover:bg-warning-500/30 text-warning-300',
                action.variant === 'success' && 'hover:bg-success-500/30 text-success-300'
              )}
            >
              {isProcessing && processingAction === action.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : action.icon ? (
                <span className="mr-2">{action.icon}</span>
              ) : null}
              {action.label}
            </Button>
          ))}

          {/* More actions dropdown */}
          {secondaryActions.length > 0 && (
            <Dropdown>
              <DropdownTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  disabled={isProcessing}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </IconButton>
              </DropdownTrigger>
              <DropdownMenu>
                {secondaryActions.map((action) => (
                  <DropdownItem
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                    className={cn(
                      action.variant === 'danger' && 'text-error-600'
                    )}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      )}

      {/* Close button */}
      <div className="ml-auto">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="text-white hover:bg-white/10"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>
    </>
  );

  // Floating position (fixed at bottom)
  if (position === 'floating') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-4 px-4 py-3',
            'bg-neutral-900 dark:bg-neutral-800 text-white',
            'rounded-xl shadow-2xl',
            'border border-neutral-700',
            className
          )}
        >
          {toolbarContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Top or bottom position (inline)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          'overflow-hidden',
          position === 'top' && 'border-b',
          position === 'bottom' && 'border-t',
          'border-neutral-200 dark:border-neutral-700',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center gap-4 px-4 py-3',
            'bg-neutral-900 dark:bg-neutral-800 text-white'
          )}
        >
          {toolbarContent}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Default bulk actions preset
export function getDefaultBulkActions(handlers: {
  onDelete?: (ids: Set<string | number>) => void | Promise<void>;
  onEdit?: (ids: Set<string | number>) => void;
  onDuplicate?: (ids: Set<string | number>) => void | Promise<void>;
  onArchive?: (ids: Set<string | number>) => void | Promise<void>;
  onExport?: (ids: Set<string | number>) => void;
  onTag?: (ids: Set<string | number>) => void;
  onMove?: (ids: Set<string | number>) => void;
}): BulkAction[] {
  const actions: BulkAction[] = [];

  if (handlers.onEdit) {
    actions.push({
      id: 'edit',
      label: 'Edit',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: handlers.onEdit,
    });
  }

  if (handlers.onDuplicate) {
    actions.push({
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: handlers.onDuplicate,
    });
  }

  if (handlers.onArchive) {
    actions.push({
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      variant: 'warning',
      onClick: handlers.onArchive,
    });
  }

  if (handlers.onExport) {
    actions.push({
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      onClick: handlers.onExport,
    });
  }

  if (handlers.onTag) {
    actions.push({
      id: 'tag',
      label: 'Add Tags',
      icon: <Tag className="w-4 h-4" />,
      onClick: handlers.onTag,
    });
  }

  if (handlers.onMove) {
    actions.push({
      id: 'move',
      label: 'Move',
      icon: <FolderInput className="w-4 h-4" />,
      onClick: handlers.onMove,
    });
  }

  if (handlers.onDelete) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage: 'Are you sure you want to delete the selected items?',
      onClick: handlers.onDelete,
    });
  }

  return actions;
}

// Compact variant for tight spaces
export interface CompactBulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  className?: string;
}

export function CompactBulkActions({
  selectedCount,
  onClear,
  actions,
  className,
}: CompactBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5',
      'bg-primary-100 dark:bg-primary-900/30 rounded-full',
      'text-primary-700 dark:text-primary-300',
      className
    )}>
      <span className="text-sm font-medium">{selectedCount}</span>
      {actions.slice(0, 3).map((action) => (
        <button
          key={action.id}
          onClick={() => action.onClick(new Set())}
          disabled={action.disabled}
          className={cn(
            'p-1 rounded-full transition-colors',
            'hover:bg-primary-200 dark:hover:bg-primary-800',
            action.variant === 'danger' && 'hover:bg-error-200 dark:hover:bg-error-900/50 text-error-600'
          )}
        >
          {action.icon}
        </button>
      ))}
      <button
        onClick={onClear}
        className="p-1 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default BulkActionsToolbar;
