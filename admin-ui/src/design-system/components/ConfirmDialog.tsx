/**
 * ConfirmDialog Component (Enhancement #101)
 * Confirmation dialogs and action modals
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  Trash2,
  LogOut,
  RefreshCw,
  X,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  confirmDisabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  itemType?: string;
  count?: number;
  loading?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
  className?: string;
}

export interface ActionConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  action: string;
  description?: string;
  variant?: 'default' | 'danger' | 'warning';
  loading?: boolean;
  className?: string;
}

export interface LogoutConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  username?: string;
  loading?: boolean;
  className?: string;
}

export interface PromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  inputLabel?: string;
  submitLabel?: string;
  cancelLabel?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
  loading?: boolean;
  className?: string;
}

export interface ChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: string) => void;
  title: string;
  description?: string;
  choices: { value: string; label: string; description?: string; icon?: React.ReactNode }[];
  className?: string;
}

// ============================================================================
// Confirm Context for useConfirm hook
// ============================================================================

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// ============================================================================
// Confirm Dialog Component
// ============================================================================

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  loading = false,
  size = 'md',
  confirmDisabled = false,
  children,
  className = '',
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const variantConfig = {
    default: {
      icon: <HelpCircle className="w-6 h-6" />,
      iconBg: 'bg-neutral-100 dark:bg-neutral-800',
      iconColor: 'text-neutral-600 dark:text-neutral-400',
      buttonBg: 'bg-primary-500 hover:bg-primary-600',
    },
    danger: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-500',
      buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-500 hover:bg-blue-600',
    },
    success: {
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      buttonBg: 'bg-green-500 hover:bg-green-600',
    },
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const config = variantConfig[variant];

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`
                relative w-full ${sizeClasses[size]}
                bg-white dark:bg-neutral-900
                rounded-xl shadow-xl
                ${className}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center mb-4`}>
                  {icon || config.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {title}
                </h3>

                {/* Description */}
                {description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {description}
                  </p>
                )}

                {/* Custom content */}
                {children && <div className="mb-4">{children}</div>}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    disabled={loading || isConfirming}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading || isConfirming || confirmDisabled}
                    className={`
                      px-4 py-2 text-sm font-medium text-white rounded-lg
                      transition-colors disabled:opacity-50
                      flex items-center gap-2
                      ${config.buttonBg}
                    `}
                  >
                    {(loading || isConfirming) && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Delete Confirm Component
// ============================================================================

export function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  count = 1,
  loading = false,
  requireConfirmation = false,
  confirmationText = 'DELETE',
  className = '',
}: DeleteConfirmProps) {
  const [inputValue, setInputValue] = useState('');
  const isConfirmEnabled = !requireConfirmation || inputValue === confirmationText;

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const title = count > 1
    ? `Delete ${count} ${itemType}s?`
    : `Delete ${itemType}?`;

  const description = count > 1
    ? `Are you sure you want to delete ${count} ${itemType}s? This action cannot be undone.`
    : itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmLabel="Delete"
      variant="danger"
      icon={<Trash2 className="w-6 h-6" />}
      loading={loading}
      confirmDisabled={!isConfirmEnabled}
      className={className}
    >
      {requireConfirmation && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Type <span className="font-mono font-bold">{confirmationText}</span> to confirm:
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={confirmationText}
          />
        </div>
      )}
    </ConfirmDialog>
  );
}

// ============================================================================
// Action Confirm Component
// ============================================================================

export function ActionConfirm({
  open,
  onClose,
  onConfirm,
  action,
  description,
  variant = 'default',
  loading = false,
  className = '',
}: ActionConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`${action}?`}
      description={description || `Are you sure you want to ${action.toLowerCase()}?`}
      confirmLabel={action}
      variant={variant}
      loading={loading}
      className={className}
    />
  );
}

// ============================================================================
// Logout Confirm Component
// ============================================================================

export function LogoutConfirm({
  open,
  onClose,
  onConfirm,
  username,
  loading = false,
  className = '',
}: LogoutConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign out?"
      description={username ? `Are you sure you want to sign out of ${username}?` : 'Are you sure you want to sign out?'}
      confirmLabel="Sign Out"
      icon={<LogOut className="w-6 h-6" />}
      loading={loading}
      className={className}
    />
  );
}

// ============================================================================
// Prompt Dialog Component
// ============================================================================

export function PromptDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  placeholder,
  defaultValue = '',
  inputLabel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  required = true,
  validation,
  loading = false,
  className = '',
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (required && !value.trim()) {
      setError('This field is required');
      return;
    }

    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(value);
      setValue('');
      setError(null);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setValue(defaultValue);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`
                relative w-full max-w-md
                bg-white dark:bg-neutral-900
                rounded-xl shadow-xl p-6
                ${className}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {title}
              </h3>

              {description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {description}
                </p>
              )}

              <div className="mb-4">
                {inputLabel && (
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {inputLabel}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError(null);
                  }}
                  placeholder={placeholder}
                  className={`
                    w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-neutral-800
                    text-neutral-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                  `}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {(loading || isSubmitting) && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  {submitLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Choice Dialog Component
// ============================================================================

export function ChoiceDialog({
  open,
  onClose,
  onSelect,
  title,
  description,
  choices,
  className = '',
}: ChoiceDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`
                relative w-full max-w-md
                bg-white dark:bg-neutral-900
                rounded-xl shadow-xl p-6
                ${className}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {title}
              </h3>

              {description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {description}
                </p>
              )}

              <div className="space-y-2">
                {choices.map((choice) => (
                  <button
                    key={choice.value}
                    onClick={() => {
                      onSelect(choice.value);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    {choice.icon && (
                      <div className="flex-shrink-0 text-neutral-500">
                        {choice.icon}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {choice.label}
                      </p>
                      {choice.description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {choice.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Confirm Provider Component
// ============================================================================

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ open: true, options, resolve });
    });
  }, []);

  const handleClose = () => {
    if (dialog) {
      dialog.resolve(false);
      setDialog(null);
    }
  };

  const handleConfirm = () => {
    if (dialog) {
      dialog.resolve(true);
      setDialog(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <ConfirmDialog
          open={dialog.open}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={dialog.options.title}
          description={dialog.options.description}
          confirmLabel={dialog.options.confirmLabel}
          cancelLabel={dialog.options.cancelLabel}
          variant={dialog.options.variant}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}

export default ConfirmDialog;
