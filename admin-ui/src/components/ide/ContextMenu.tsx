/**
 * ContextMenu - Right-click context menu for file tree
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus, FolderPlus, Trash2, Pencil, Copy, Clipboard,
  FileCode, ExternalLink, RefreshCw
} from 'lucide-react';

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  actions: ContextMenuAction[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isOpen,
  onClose,
  actions
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [isOpen, x, y]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 overflow-hidden"
          style={{ left: x, top: y }}
        >
          {actions.map((action, index) => (
            <React.Fragment key={action.id}>
              {action.divider && index > 0 && (
                <div className="h-px bg-gray-700 my-1" />
              )}
              <button
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                disabled={action.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  action.disabled
                    ? 'text-gray-500 cursor-not-allowed'
                    : action.danger
                    ? 'text-red-400 hover:bg-red-500/20'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="w-4 h-4">{action.icon}</span>
                <span className="flex-1 text-left">{action.label}</span>
                {action.shortcut && (
                  <span className="text-xs text-gray-500">{action.shortcut}</span>
                )}
              </button>
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pre-built action generators
export const getFileActions = (
  filePath: string,
  fileName: string,
  handlers: {
    onRename: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onCopyPath: () => void;
    onOpenInNewTab?: () => void;
  }
): ContextMenuAction[] => [
  {
    id: 'rename',
    label: 'Rename',
    icon: <Pencil className="w-4 h-4" />,
    shortcut: 'F2',
    onClick: handlers.onRename,
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy className="w-4 h-4" />,
    onClick: handlers.onDuplicate,
  },
  {
    id: 'copyPath',
    label: 'Copy Path',
    icon: <Clipboard className="w-4 h-4" />,
    onClick: handlers.onCopyPath,
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    danger: true,
    divider: true,
    onClick: handlers.onDelete,
  },
];

export const getFolderActions = (
  folderPath: string,
  handlers: {
    onNewFile: () => void;
    onNewFolder: () => void;
    onRename: () => void;
    onDelete: () => void;
    onRefresh: () => void;
    onCopyPath: () => void;
  }
): ContextMenuAction[] => [
  {
    id: 'newFile',
    label: 'New File',
    icon: <FilePlus className="w-4 h-4" />,
    onClick: handlers.onNewFile,
  },
  {
    id: 'newFolder',
    label: 'New Folder',
    icon: <FolderPlus className="w-4 h-4" />,
    onClick: handlers.onNewFolder,
  },
  {
    id: 'refresh',
    label: 'Refresh',
    icon: <RefreshCw className="w-4 h-4" />,
    divider: true,
    onClick: handlers.onRefresh,
  },
  {
    id: 'rename',
    label: 'Rename',
    icon: <Pencil className="w-4 h-4" />,
    shortcut: 'F2',
    onClick: handlers.onRename,
  },
  {
    id: 'copyPath',
    label: 'Copy Path',
    icon: <Clipboard className="w-4 h-4" />,
    onClick: handlers.onCopyPath,
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    danger: true,
    divider: true,
    onClick: handlers.onDelete,
  },
];

export default ContextMenu;
