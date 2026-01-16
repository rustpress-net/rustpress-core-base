/**
 * RustPress Quick Actions Bar Component
 * Floating action button with context-aware shortcuts
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  X,
  FileText,
  Folder,
  Image,
  Users,
  Package,
  MessageSquare,
  Settings,
  Upload,
  Palette,
  BarChart3,
  Command,
  Zap,
} from 'lucide-react';
import { cn } from '../utils';
import { useNavigationStore } from '../../store/navigationStore';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  href?: string;
  color?: string;
  contexts?: string[]; // Show only in these route contexts
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-post',
    label: 'New Post',
    icon: FileText,
    href: '/posts/new',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'new-page',
    label: 'New Page',
    icon: Folder,
    href: '/pages/new',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'upload-media',
    label: 'Upload Media',
    icon: Upload,
    href: '/media/upload',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    id: 'add-user',
    label: 'Add User',
    icon: Users,
    href: '/users/new',
    color: 'bg-orange-500 hover:bg-orange-600',
    contexts: ['users', 'roles'],
  },
  {
    id: 'install-plugin',
    label: 'Install Plugin',
    icon: Package,
    href: '/plugins/add',
    color: 'bg-pink-500 hover:bg-pink-600',
    contexts: ['plugins'],
  },
  {
    id: 'cmd-palette',
    label: 'Command Palette',
    icon: Command,
    color: 'bg-neutral-700 hover:bg-neutral-800',
  },
];

export interface QuickActionsBarProps {
  actions?: QuickAction[];
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function QuickActionsBar({
  actions = defaultActions,
  className,
  position = 'bottom-right',
}: QuickActionsBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { openCommandPalette } = useNavigationStore();

  // Filter actions based on current context
  const contextualActions = actions.filter((action) => {
    if (!action.contexts || action.contexts.length === 0) return true;
    return action.contexts.some((ctx) => location.pathname.includes(ctx));
  });

  const handleActionClick = useCallback(
    (action: QuickAction) => {
      setIsOpen(false);

      if (action.id === 'cmd-palette') {
        openCommandPalette();
        return;
      }

      if (action.onClick) {
        action.onClick();
      } else if (action.href) {
        navigate(action.href);
      }
    },
    [navigate, openCommandPalette]
  );

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-40',
        positionClasses[position],
        className
      )}
    >
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 mb-2"
          >
            {contextualActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg',
                      'text-sm font-medium text-white',
                      'bg-neutral-900/90 dark:bg-neutral-800/90',
                      'backdrop-blur-sm',
                      'whitespace-nowrap',
                      'shadow-lg'
                    )}
                  >
                    {action.label}
                  </motion.span>

                  {/* Button */}
                  <motion.button
                    onClick={() => handleActionClick(action)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'w-12 h-12 rounded-full',
                      'flex items-center justify-center',
                      'text-white shadow-lg',
                      'transition-colors',
                      action.color || 'bg-primary-500 hover:bg-primary-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'w-14 h-14 rounded-full',
          'flex items-center justify-center',
          'text-white shadow-xl',
          'transition-all duration-200',
          isOpen
            ? 'bg-neutral-800 dark:bg-neutral-700'
            : 'bg-primary-600 hover:bg-primary-700'
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </motion.div>
      </motion.button>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary-500"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}
    </div>
  );
}

export default QuickActionsBar;
