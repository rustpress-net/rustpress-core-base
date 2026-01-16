/**
 * RustPress Kanban Board Component
 * Drag & drop board for managing cards across columns
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  X,
  Edit2,
  Trash2,
  Copy,
  Archive,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Paperclip,
  CheckSquare,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  labels?: KanbanLabel[];
  assignees?: { id: string; name: string; avatar?: string }[];
  dueDate?: Date;
  attachmentCount?: number;
  commentCount?: number;
  checklistProgress?: { completed: number; total: number };
  coverImage?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  color?: string;
  limit?: number;
  cards: KanbanCard[];
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) => void;
  onColumnMove?: (columnId: string, newOrder: number) => void;
  onCardAdd?: (columnId: string, title: string) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onColumnAdd?: (title: string) => void;
  onColumnEdit?: (columnId: string, title: string) => void;
  onColumnDelete?: (columnId: string) => void;
  allowAddCard?: boolean;
  allowAddColumn?: boolean;
  allowReorder?: boolean;
  showCardCount?: boolean;
  compactMode?: boolean;
  className?: string;
}

// ============================================================================
// Priority Badge
// ============================================================================

const priorityConfig = {
  low: { label: 'Low', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' },
  medium: { label: 'Medium', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
  high: { label: 'High', color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' },
  urgent: { label: 'Urgent', color: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' },
};

// ============================================================================
// Add Card Form
// ============================================================================

interface AddCardFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <textarea
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        rows={3}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border resize-none',
          'bg-white dark:bg-neutral-800',
          'border-neutral-300 dark:border-neutral-600',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'placeholder:text-neutral-400'
        )}
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Add Card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Kanban Card Component
// ============================================================================

interface KanbanCardItemProps {
  card: KanbanCard;
  isDragging?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

function KanbanCardItem({
  card,
  isDragging,
  onClick,
  onEdit,
  onDelete,
  compact,
}: KanbanCardItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isOverdue = card.dueDate && card.dueDate < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'group bg-white dark:bg-neutral-800 rounded-lg shadow-sm',
        'border border-neutral-200 dark:border-neutral-700',
        'hover:shadow-md transition-shadow cursor-pointer',
        isDragging && 'shadow-lg ring-2 ring-primary-500'
      )}
      onClick={onClick}
    >
      {/* Cover Image */}
      {card.coverImage && !compact && (
        <img
          src={card.coverImage}
          alt=""
          className="w-full h-32 object-cover rounded-t-lg"
        />
      )}

      <div className="p-3">
        {/* Labels */}
        {card.labels && card.labels.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs font-medium rounded"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
            {card.title}
          </h4>

          {/* Menu */}
          <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-20 w-36 py-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onEdit?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={() => {
                      onDelete?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-error-600 dark:text-error-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description preview */}
        {card.description && !compact && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {/* Priority */}
          {card.priority && (
            <span className={cn('px-1.5 py-0.5 text-xs font-medium rounded', priorityConfig[card.priority].color)}>
              {priorityConfig[card.priority].label}
            </span>
          )}

          {/* Due date */}
          {card.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                isOverdue ? 'text-error-600 dark:text-error-400' : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              <Calendar className="w-3 h-3" />
              {card.dueDate.toLocaleDateString()}
            </span>
          )}

          {/* Checklist progress */}
          {card.checklistProgress && (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <CheckSquare className="w-3 h-3" />
              {card.checklistProgress.completed}/{card.checklistProgress.total}
            </span>
          )}

          {/* Comments */}
          {card.commentCount !== undefined && card.commentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <MessageSquare className="w-3 h-3" />
              {card.commentCount}
            </span>
          )}

          {/* Attachments */}
          {card.attachmentCount !== undefined && card.attachmentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Paperclip className="w-3 h-3" />
              {card.attachmentCount}
            </span>
          )}
        </div>

        {/* Assignees */}
        {card.assignees && card.assignees.length > 0 && !compact && (
          <div className="flex items-center justify-end mt-3 -space-x-2">
            {card.assignees.slice(0, 3).map((assignee) => (
              <div
                key={assignee.id}
                className="relative"
                title={assignee.name}
              >
                {assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      {assignee.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {card.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  +{card.assignees.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Kanban Column Component
// ============================================================================

interface KanbanColumnProps {
  column: KanbanColumn;
  onCardAdd?: (title: string) => void;
  onCardMove?: (cardId: string, toColumnId: string, newOrder: number) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
  onColumnEdit?: (title: string) => void;
  onColumnDelete?: () => void;
  allowAddCard?: boolean;
  showCardCount?: boolean;
  compact?: boolean;
}

function KanbanColumnComponent({
  column,
  onCardAdd,
  onCardClick,
  onCardEdit,
  onCardDelete,
  onColumnEdit,
  onColumnDelete,
  allowAddCard = true,
  showCardCount = true,
  compact = false,
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isOverLimit = column.limit && column.cards.length >= column.limit;

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    if (title.trim() && title !== column.title) {
      onColumnEdit?.(title.trim());
    } else {
      setTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddCard = (cardTitle: string) => {
    onCardAdd?.(cardTitle);
    setIsAddingCard(false);
  };

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl',
        'flex flex-col max-h-full'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {column.color && (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color }}
            />
          )}

          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitle(column.title);
                  setIsEditingTitle(false);
                }
              }}
              className={cn(
                'flex-1 px-1 py-0.5 text-sm font-semibold rounded',
                'bg-white dark:bg-neutral-800',
                'border border-primary-500',
                'focus:outline-none'
              )}
            />
          ) : (
            <h3
              className="text-sm font-semibold text-neutral-900 dark:text-white truncate cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </h3>
          )}

          {showCardCount && (
            <span
              className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded',
                isOverLimit
                  ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                  : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
              )}
            >
              {column.cards.length}
              {column.limit && `/${column.limit}`}
            </span>
          )}
        </div>

        {/* Column Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 z-20 w-40 py-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    setIsAddingCard(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                <button
                  onClick={() => {
                    onColumnDelete?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-error-600 dark:text-error-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[100px]">
        <AnimatePresence>
          {column.cards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <KanbanCardItem
                key={card.id}
                card={card}
                onClick={() => onCardClick?.(card)}
                onEdit={() => onCardEdit?.(card)}
                onDelete={() => onCardDelete?.(card.id)}
                compact={compact}
              />
            ))}
        </AnimatePresence>

        {/* Add card form */}
        {isAddingCard && (
          <AddCardForm
            onSubmit={handleAddCard}
            onCancel={() => setIsAddingCard(false)}
          />
        )}
      </div>

      {/* Add Card Button */}
      {allowAddCard && !isAddingCard && !isOverLimit && (
        <button
          onClick={() => setIsAddingCard(true)}
          className={cn(
            'flex items-center gap-1 w-full px-3 py-2 text-sm text-neutral-500',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700/50',
            'rounded-b-xl transition-colors'
          )}
        >
          <Plus className="w-4 h-4" />
          Add a card
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Add Column Form
// ============================================================================

interface AddColumnFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

function AddColumnForm({ onSubmit, onCancel }: AddColumnFormProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="flex-shrink-0 w-72 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-3">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onCancel()}
          placeholder="Enter column title..."
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border',
            'bg-white dark:bg-neutral-800',
            'border-neutral-300 dark:border-neutral-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            'placeholder:text-neutral-400'
          )}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded',
              'bg-primary-600 text-white',
              'hover:bg-primary-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Add Column
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// Main Kanban Board Component
// ============================================================================

export function KanbanBoard({
  columns,
  onCardMove,
  onColumnMove,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  onCardClick,
  onColumnAdd,
  onColumnEdit,
  onColumnDelete,
  allowAddCard = true,
  allowAddColumn = true,
  allowReorder = true,
  showCardCount = true,
  compactMode = false,
  className,
}: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div
      className={cn(
        'flex gap-4 overflow-x-auto pb-4',
        'min-h-[400px]',
        className
      )}
    >
      {sortedColumns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          onCardAdd={onCardAdd ? (title) => onCardAdd(column.id, title) : undefined}
          onCardClick={onCardClick}
          onCardEdit={onCardEdit}
          onCardDelete={onCardDelete}
          onColumnEdit={onColumnEdit ? (title) => onColumnEdit(column.id, title) : undefined}
          onColumnDelete={onColumnDelete ? () => onColumnDelete(column.id) : undefined}
          allowAddCard={allowAddCard}
          showCardCount={showCardCount}
          compact={compactMode}
        />
      ))}

      {/* Add Column */}
      {allowAddColumn && (
        isAddingColumn ? (
          <AddColumnForm
            onSubmit={(title) => {
              onColumnAdd?.(title);
              setIsAddingColumn(false);
            }}
            onCancel={() => setIsAddingColumn(false)}
          />
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className={cn(
              'flex-shrink-0 w-72 h-12 flex items-center justify-center gap-2',
              'bg-neutral-100 dark:bg-neutral-800/30 rounded-xl',
              'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
              'hover:bg-neutral-200 dark:hover:bg-neutral-800/50',
              'border-2 border-dashed border-neutral-300 dark:border-neutral-700',
              'transition-colors'
            )}
          >
            <Plus className="w-5 h-5" />
            Add Column
          </button>
        )
      )}
    </div>
  );
}

// ============================================================================
// Compact Kanban (for smaller spaces)
// ============================================================================

export interface CompactKanbanProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard) => void;
  className?: string;
}

export function CompactKanban({ columns, onCardClick, className }: CompactKanbanProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {columns.map((column) => (
        <div key={column.id} className="space-y-2">
          <div className="flex items-center gap-2">
            {column.color && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
            )}
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
              {column.title}
            </h4>
            <span className="text-xs text-neutral-500">
              ({column.cards.length})
            </span>
          </div>
          <div className="space-y-1">
            {column.cards.slice(0, 3).map((card) => (
              <button
                key={card.id}
                onClick={() => onCardClick?.(card)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-lg',
                  'bg-neutral-100 dark:bg-neutral-800',
                  'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                  'transition-colors'
                )}
              >
                {card.title}
              </button>
            ))}
            {column.cards.length > 3 && (
              <p className="text-xs text-neutral-500 px-3">
                +{column.cards.length - 3} more
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard;
