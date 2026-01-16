/**
 * FloatingToolbar Component
 *
 * Contextual floating action toolbar:
 * - Appears on text selection
 * - Follows cursor/selection
 * - Rich text formatting actions
 * - Custom action support
 * - Keyboard shortcuts
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  MoreHorizontal,
  Copy,
  Scissors,
  Share,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface ToolbarAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

export interface FloatingToolbarProps {
  actions: ToolbarAction[];
  position?: { x: number; y: number } | null;
  isVisible?: boolean;
  offset?: { x: number; y: number };
  className?: string;
}

export interface SelectionToolbarProps {
  actions: ToolbarAction[];
  containerRef?: React.RefObject<HTMLElement>;
  onSelectionChange?: (selection: Selection | null) => void;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function FloatingToolbar({
  actions,
  position,
  isVisible = true,
  offset = { x: 0, y: -10 },
  className,
}: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!position || !toolbarRef.current) {
      setAdjustedPosition(null);
      return;
    }

    const rect = toolbarRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x + offset.x;
    let y = position.y + offset.y;

    // Center horizontally on position
    x -= rect.width / 2;

    // Keep within horizontal bounds
    if (x < 8) x = 8;
    if (x + rect.width > viewportWidth - 8) x = viewportWidth - rect.width - 8;

    // Keep within vertical bounds
    if (y < 8) {
      // Flip to below if too close to top
      y = position.y + 20;
    }
    if (y + rect.height > viewportHeight - 8) {
      y = viewportHeight - rect.height - 8;
    }

    setAdjustedPosition({ x, y });
  }, [position, offset]);

  if (!position) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'fixed z-[9999]',
            'flex items-center gap-0.5 p-1',
            'bg-white dark:bg-neutral-900 rounded-lg',
            'border border-neutral-200 dark:border-neutral-700',
            'shadow-xl',
            className
          )}
          style={{
            top: adjustedPosition?.y ?? position.y + offset.y,
            left: adjustedPosition?.x ?? position.x + offset.x,
          }}
        >
          {actions.map((action, index) => {
            if (action.separator) {
              return (
                <div
                  key={`sep-${index}`}
                  className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"
                />
              );
            }

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  action.isActive
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {action.icon}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ============================================================================
// Selection Toolbar Component
// ============================================================================

export function SelectionToolbar({
  actions,
  containerRef,
  onSelectionChange,
  className,
}: SelectionToolbarProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setIsVisible(false);
      onSelectionChange?.(null);
      return;
    }

    // Check if selection is within container
    if (containerRef?.current) {
      const range = selection.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setIsVisible(false);
        return;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setIsVisible(true);
    onSelectionChange?.(selection);
  }, [containerRef, onSelectionChange]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Hide on scroll
  useEffect(() => {
    const handleScroll = () => setIsVisible(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  return (
    <FloatingToolbar
      actions={actions}
      position={position}
      isVisible={isVisible}
      className={className}
    />
  );
}

// ============================================================================
// Text Editor Toolbar
// ============================================================================

export interface TextEditorToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onStrikethrough?: () => void;
  onLink?: () => void;
  onCode?: () => void;
  onHighlight?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onQuote?: () => void;
  onHeading1?: () => void;
  onHeading2?: () => void;
  activeFormats?: string[];
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export function TextEditorToolbar({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onLink,
  onCode,
  onHighlight,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onBulletList,
  onNumberedList,
  onQuote,
  onHeading1,
  onHeading2,
  activeFormats = [],
  containerRef,
  className,
}: TextEditorToolbarProps) {
  const actions: ToolbarAction[] = [
    {
      id: 'bold',
      icon: <Bold className="w-4 h-4" />,
      label: 'Bold',
      shortcut: '⌘B',
      onClick: () => onBold?.(),
      isActive: activeFormats.includes('bold'),
    },
    {
      id: 'italic',
      icon: <Italic className="w-4 h-4" />,
      label: 'Italic',
      shortcut: '⌘I',
      onClick: () => onItalic?.(),
      isActive: activeFormats.includes('italic'),
    },
    {
      id: 'underline',
      icon: <Underline className="w-4 h-4" />,
      label: 'Underline',
      shortcut: '⌘U',
      onClick: () => onUnderline?.(),
      isActive: activeFormats.includes('underline'),
    },
    {
      id: 'strikethrough',
      icon: <Strikethrough className="w-4 h-4" />,
      label: 'Strikethrough',
      onClick: () => onStrikethrough?.(),
      isActive: activeFormats.includes('strikethrough'),
    },
    { id: 'sep1', separator: true, icon: null, label: '', onClick: () => {} },
    {
      id: 'link',
      icon: <Link className="w-4 h-4" />,
      label: 'Add Link',
      shortcut: '⌘K',
      onClick: () => onLink?.(),
      isActive: activeFormats.includes('link'),
    },
    {
      id: 'code',
      icon: <Code className="w-4 h-4" />,
      label: 'Code',
      onClick: () => onCode?.(),
      isActive: activeFormats.includes('code'),
    },
    {
      id: 'highlight',
      icon: <Highlighter className="w-4 h-4" />,
      label: 'Highlight',
      onClick: () => onHighlight?.(),
      isActive: activeFormats.includes('highlight'),
    },
    { id: 'sep2', separator: true, icon: null, label: '', onClick: () => {} },
    {
      id: 'h1',
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Heading 1',
      onClick: () => onHeading1?.(),
      isActive: activeFormats.includes('h1'),
    },
    {
      id: 'h2',
      icon: <Heading2 className="w-4 h-4" />,
      label: 'Heading 2',
      onClick: () => onHeading2?.(),
      isActive: activeFormats.includes('h2'),
    },
    { id: 'sep3', separator: true, icon: null, label: '', onClick: () => {} },
    {
      id: 'alignLeft',
      icon: <AlignLeft className="w-4 h-4" />,
      label: 'Align Left',
      onClick: () => onAlignLeft?.(),
      isActive: activeFormats.includes('alignLeft'),
    },
    {
      id: 'alignCenter',
      icon: <AlignCenter className="w-4 h-4" />,
      label: 'Align Center',
      onClick: () => onAlignCenter?.(),
      isActive: activeFormats.includes('alignCenter'),
    },
    {
      id: 'alignRight',
      icon: <AlignRight className="w-4 h-4" />,
      label: 'Align Right',
      onClick: () => onAlignRight?.(),
      isActive: activeFormats.includes('alignRight'),
    },
    { id: 'sep4', separator: true, icon: null, label: '', onClick: () => {} },
    {
      id: 'bulletList',
      icon: <List className="w-4 h-4" />,
      label: 'Bullet List',
      onClick: () => onBulletList?.(),
      isActive: activeFormats.includes('bulletList'),
    },
    {
      id: 'numberedList',
      icon: <ListOrdered className="w-4 h-4" />,
      label: 'Numbered List',
      onClick: () => onNumberedList?.(),
      isActive: activeFormats.includes('numberedList'),
    },
    {
      id: 'quote',
      icon: <Quote className="w-4 h-4" />,
      label: 'Quote',
      onClick: () => onQuote?.(),
      isActive: activeFormats.includes('quote'),
    },
  ].filter(a => a.separator || (a.onClick && typeof a.onClick === 'function'));

  return (
    <SelectionToolbar
      actions={actions}
      containerRef={containerRef}
      className={className}
    />
  );
}

// ============================================================================
// Quick Actions Toolbar
// ============================================================================

export interface QuickActionsToolbarProps {
  onCopy?: () => void;
  onCut?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onMore?: () => void;
  additionalActions?: ToolbarAction[];
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export function QuickActionsToolbar({
  onCopy,
  onCut,
  onShare,
  onComment,
  onMore,
  additionalActions = [],
  containerRef,
  className,
}: QuickActionsToolbarProps) {
  const actions: ToolbarAction[] = [
    {
      id: 'copy',
      icon: <Copy className="w-4 h-4" />,
      label: 'Copy',
      shortcut: '⌘C',
      onClick: () => onCopy?.(),
    },
    {
      id: 'cut',
      icon: <Scissors className="w-4 h-4" />,
      label: 'Cut',
      shortcut: '⌘X',
      onClick: () => onCut?.(),
    },
    { id: 'sep1', separator: true, icon: null, label: '', onClick: () => {} },
    {
      id: 'share',
      icon: <Share className="w-4 h-4" />,
      label: 'Share',
      onClick: () => onShare?.(),
    },
    {
      id: 'comment',
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'Add Comment',
      onClick: () => onComment?.(),
    },
    ...additionalActions,
    { id: 'sep2', separator: true, icon: null, label: '', onClick: () => {} },
    {
      id: 'more',
      icon: <MoreHorizontal className="w-4 h-4" />,
      label: 'More Options',
      onClick: () => onMore?.(),
    },
  ].filter(a => a.separator || a.onClick);

  return (
    <SelectionToolbar
      actions={actions}
      containerRef={containerRef}
      className={className}
    />
  );
}

// ============================================================================
// Fixed Position Toolbar
// ============================================================================

export interface FixedToolbarProps {
  actions: ToolbarAction[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'start' | 'center' | 'end';
  className?: string;
}

export function FixedToolbar({
  actions,
  position = 'bottom',
  alignment = 'center',
  className,
}: FixedToolbarProps) {
  return (
    <div
      className={cn(
        'fixed z-50',
        position === 'top' && 'top-4 left-0 right-0',
        position === 'bottom' && 'bottom-4 left-0 right-0',
        position === 'left' && 'left-4 top-0 bottom-0',
        position === 'right' && 'right-4 top-0 bottom-0',
        (position === 'top' || position === 'bottom') && 'flex',
        (position === 'left' || position === 'right') && 'flex flex-col',
        alignment === 'start' && 'justify-start',
        alignment === 'center' && 'justify-center',
        alignment === 'end' && 'justify-end',
        className
      )}
    >
      <div
        className={cn(
          'flex gap-1 p-1.5',
          (position === 'left' || position === 'right') && 'flex-col',
          'bg-white dark:bg-neutral-900 rounded-xl',
          'border border-neutral-200 dark:border-neutral-700',
          'shadow-xl'
        )}
      >
        {actions.map((action, index) => {
          if (action.separator) {
            return (
              <div
                key={`sep-${index}`}
                className={cn(
                  'bg-neutral-200 dark:bg-neutral-700',
                  (position === 'top' || position === 'bottom') ? 'w-px h-6 mx-1' : 'h-px w-6 my-1'
                )}
              />
            );
          }

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
              className={cn(
                'p-2 rounded-lg transition-colors',
                action.isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                action.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {action.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default FloatingToolbar;
