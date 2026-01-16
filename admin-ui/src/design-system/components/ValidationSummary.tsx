/**
 * RustPress Validation Summary Component
 * Displays form validation errors with navigation to fields
 */

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  id: string;
  field: string;
  fieldLabel?: string;
  message: string;
  severity?: ValidationSeverity;
  code?: string;
}

export interface ValidationSummaryProps {
  errors: ValidationError[];
  variant?: 'list' | 'inline' | 'toast' | 'banner';
  title?: string;
  showFieldLabels?: boolean;
  showErrorCodes?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  onErrorClick?: (error: ValidationError) => void;
  groupByField?: boolean;
  maxVisibleErrors?: number;
  className?: string;
}

// ============================================================================
// Severity Icon Component
// ============================================================================

function SeverityIcon({
  severity,
  className,
}: {
  severity: ValidationSeverity;
  className?: string;
}) {
  const icons = {
    error: <XCircle className={cn('w-4 h-4', className)} />,
    warning: <AlertTriangle className={cn('w-4 h-4', className)} />,
    info: <Info className={cn('w-4 h-4', className)} />,
  };

  return icons[severity] || icons.error;
}

// ============================================================================
// Error Item Component
// ============================================================================

interface ErrorItemProps {
  error: ValidationError;
  showFieldLabel?: boolean;
  showCode?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

function ErrorItem({
  error,
  showFieldLabel = true,
  showCode = false,
  onClick,
  compact = false,
}: ErrorItemProps) {
  const severity = error.severity || 'error';

  const severityColors = {
    error: 'text-error-600 dark:text-error-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-primary-600 dark:text-primary-400',
  };

  const bgColors = {
    error: 'hover:bg-error-50 dark:hover:bg-error-900/20',
    warning: 'hover:bg-warning-50 dark:hover:bg-warning-900/20',
    info: 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        'w-full flex items-start gap-2 text-left rounded-lg transition-colors',
        onClick && 'cursor-pointer',
        onClick && bgColors[severity],
        compact ? 'py-1.5 px-2' : 'py-2 px-3'
      )}
    >
      <SeverityIcon severity={severity} className={cn('mt-0.5 flex-shrink-0', severityColors[severity])} />

      <div className="flex-1 min-w-0">
        {showFieldLabel && error.fieldLabel && (
          <span className="font-medium text-neutral-900 dark:text-white">
            {error.fieldLabel}:{' '}
          </span>
        )}
        <span className="text-neutral-700 dark:text-neutral-300">{error.message}</span>
        {showCode && error.code && (
          <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-500">
            ({error.code})
          </span>
        )}
      </div>

      {onClick && (
        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
      )}
    </motion.button>
  );
}

// ============================================================================
// Grouped Errors Component
// ============================================================================

interface GroupedErrorsProps {
  field: string;
  fieldLabel?: string;
  errors: ValidationError[];
  showCode?: boolean;
  onClick?: (error: ValidationError) => void;
}

function GroupedErrors({
  field,
  fieldLabel,
  errors,
  showCode,
  onClick,
}: GroupedErrorsProps) {
  const highestSeverity = errors.reduce<ValidationSeverity>((acc, err) => {
    const severity = err.severity || 'error';
    if (severity === 'error') return 'error';
    if (severity === 'warning' && acc !== 'error') return 'warning';
    return acc;
  }, 'info');

  const severityColors = {
    error: 'border-error-200 dark:border-error-800',
    warning: 'border-warning-200 dark:border-warning-800',
    info: 'border-primary-200 dark:border-primary-800',
  };

  return (
    <div
      className={cn(
        'border-l-2 pl-3 py-1',
        severityColors[highestSeverity]
      )}
    >
      <h4 className="font-medium text-sm text-neutral-900 dark:text-white mb-1">
        {fieldLabel || field}
      </h4>
      <ul className="space-y-1">
        {errors.map((error) => (
          <li key={error.id}>
            <ErrorItem
              error={error}
              showFieldLabel={false}
              showCode={showCode}
              onClick={onClick ? () => onClick(error) : undefined}
              compact
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// List Variant
// ============================================================================

function ListVariant({
  errors,
  title,
  showFieldLabels,
  showErrorCodes,
  collapsible,
  defaultCollapsed,
  dismissible,
  onDismiss,
  onErrorClick,
  groupByField,
  maxVisibleErrors,
  className,
}: ValidationSummaryProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [showAll, setShowAll] = React.useState(false);

  const visibleErrors = useMemo(() => {
    if (!maxVisibleErrors || showAll) return errors;
    return errors.slice(0, maxVisibleErrors);
  }, [errors, maxVisibleErrors, showAll]);

  const groupedErrors = useMemo(() => {
    if (!groupByField) return null;

    const groups = new Map<string, ValidationError[]>();
    errors.forEach((error) => {
      const existing = groups.get(error.field) || [];
      groups.set(error.field, [...existing, error]);
    });
    return groups;
  }, [errors, groupByField]);

  const errorCount = errors.filter((e) => e.severity !== 'warning' && e.severity !== 'info').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;
  const infoCount = errors.filter((e) => e.severity === 'info').length;

  if (errors.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 border border-error-200 dark:border-error-800 rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 bg-error-50 dark:bg-error-900/20',
          collapsible && 'cursor-pointer'
        )}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
          <div>
            <h3 className="font-semibold text-error-900 dark:text-error-100">
              {title || 'Please fix the following errors'}
            </h3>
            <p className="text-sm text-error-700 dark:text-error-300">
              {errorCount > 0 && `${errorCount} error${errorCount > 1 ? 's' : ''}`}
              {warningCount > 0 && `${errorCount > 0 ? ', ' : ''}${warningCount} warning${warningCount > 1 ? 's' : ''}`}
              {infoCount > 0 && `${errorCount > 0 || warningCount > 0 ? ', ' : ''}${infoCount} info`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {collapsible && (
            <motion.button
              type="button"
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              className="p-1 text-error-600 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-800/50 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
          {dismissible && onDismiss && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1 text-error-600 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-800/50 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error list */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {groupByField && groupedErrors ? (
                Array.from(groupedErrors.entries()).map(([field, fieldErrors]) => (
                  <GroupedErrors
                    key={field}
                    field={field}
                    fieldLabel={fieldErrors[0].fieldLabel}
                    errors={fieldErrors}
                    showCode={showErrorCodes}
                    onClick={onErrorClick}
                  />
                ))
              ) : (
                visibleErrors.map((error) => (
                  <ErrorItem
                    key={error.id}
                    error={error}
                    showFieldLabel={showFieldLabels}
                    showCode={showErrorCodes}
                    onClick={onErrorClick ? () => onErrorClick(error) : undefined}
                  />
                ))
              )}

              {maxVisibleErrors && errors.length > maxVisibleErrors && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:underline py-2"
                >
                  Show {errors.length - maxVisibleErrors} more errors
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Inline Variant
// ============================================================================

function InlineVariant({
  errors,
  showFieldLabels,
  onErrorClick,
  className,
}: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {errors.map((error) => {
        const severity = error.severity || 'error';
        const bgColors = {
          error: 'bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300 border-error-200 dark:border-error-700',
          warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-700',
          info: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-700',
        };

        return (
          <button
            key={error.id}
            type="button"
            onClick={() => onErrorClick?.(error)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-full border',
              bgColors[severity],
              onErrorClick && 'hover:opacity-80 cursor-pointer'
            )}
          >
            <SeverityIcon severity={severity} className="w-3.5 h-3.5" />
            {showFieldLabels && error.fieldLabel && (
              <span className="font-medium">{error.fieldLabel}:</span>
            )}
            <span>{error.message}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Toast Variant
// ============================================================================

function ToastVariant({
  errors,
  title,
  dismissible,
  onDismiss,
  onErrorClick,
  maxVisibleErrors = 3,
  className,
}: ValidationSummaryProps) {
  const visibleErrors = errors.slice(0, maxVisibleErrors);
  const remainingCount = errors.length - maxVisibleErrors;

  if (errors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className={cn(
        'fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)]',
        'bg-white dark:bg-neutral-900 rounded-lg shadow-xl',
        'border border-error-200 dark:border-error-700',
        'z-50',
        className
      )}
    >
      <div className="flex items-start justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {title || `${errors.length} validation error${errors.length > 1 ? 's' : ''}`}
          </h3>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-2 max-h-64 overflow-y-auto">
        {visibleErrors.map((error) => (
          <ErrorItem
            key={error.id}
            error={error}
            showFieldLabel
            onClick={onErrorClick ? () => onErrorClick(error) : undefined}
            compact
          />
        ))}
        {remainingCount > 0 && (
          <p className="px-3 py-2 text-sm text-neutral-500">
            +{remainingCount} more error{remainingCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Banner Variant
// ============================================================================

function BannerVariant({
  errors,
  title,
  dismissible,
  onDismiss,
  onErrorClick,
  className,
}: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  const severity = errors.some((e) => e.severity === 'error' || !e.severity)
    ? 'error'
    : errors.some((e) => e.severity === 'warning')
    ? 'warning'
    : 'info';

  const bgColors = {
    error: 'bg-error-50 dark:bg-error-900/30 border-error-200 dark:border-error-700',
    warning: 'bg-warning-50 dark:bg-warning-900/30 border-warning-200 dark:border-warning-700',
    info: 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700',
  };

  const textColors = {
    error: 'text-error-800 dark:text-error-200',
    warning: 'text-warning-800 dark:text-warning-200',
    info: 'text-primary-800 dark:text-primary-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'border-b',
        bgColors[severity],
        className
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SeverityIcon severity={severity} className={textColors[severity]} />
          <span className={cn('text-sm font-medium', textColors[severity])}>
            {title || `${errors.length} issue${errors.length > 1 ? 's' : ''} found`}
          </span>
          <span className={cn('text-sm', textColors[severity])}>
            {errors.map((e, i) => (
              <React.Fragment key={e.id}>
                {i > 0 && ' • '}
                <button
                  type="button"
                  onClick={() => onErrorClick?.(e)}
                  className="hover:underline"
                >
                  {e.fieldLabel || e.field}: {e.message}
                </button>
              </React.Fragment>
            ))}
          </span>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn('p-1 rounded hover:bg-white/50 dark:hover:bg-black/20', textColors[severity])}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Validation Summary Component
// ============================================================================

export function ValidationSummary(props: ValidationSummaryProps) {
  const { variant = 'list' } = props;

  const handleErrorClick = useCallback(
    (error: ValidationError) => {
      // Try to focus the field
      const field = document.querySelector(
        `[name="${error.field}"], #${error.field}, [data-field="${error.field}"]`
      ) as HTMLElement | null;

      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      props.onErrorClick?.(error);
    },
    [props]
  );

  const propsWithClick = { ...props, onErrorClick: handleErrorClick };

  switch (variant) {
    case 'inline':
      return <InlineVariant {...propsWithClick} />;
    case 'toast':
      return <ToastVariant {...propsWithClick} />;
    case 'banner':
      return <BannerVariant {...propsWithClick} />;
    default:
      return <ListVariant {...propsWithClick} />;
  }
}

// ============================================================================
// Field Error Component (for individual fields)
// ============================================================================

export interface FieldErrorProps {
  error?: string | null;
  severity?: ValidationSeverity;
  className?: string;
}

export function FieldError({ error, severity = 'error', className }: FieldErrorProps) {
  if (!error) return null;

  const colors = {
    error: 'text-error-600 dark:text-error-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-primary-600 dark:text-primary-400',
  };

  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn('flex items-center gap-1 text-sm mt-1', colors[severity], className)}
    >
      <SeverityIcon severity={severity} className="w-3.5 h-3.5" />
      {error}
    </motion.p>
  );
}

// ============================================================================
// Utility: Create validation errors from object
// ============================================================================

export function createValidationErrors(
  errors: Record<string, string | string[]>,
  fieldLabels?: Record<string, string>
): ValidationError[] {
  const result: ValidationError[] = [];
  let counter = 0;

  Object.entries(errors).forEach(([field, messages]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    messageArray.forEach((message) => {
      result.push({
        id: `${field}-${counter++}`,
        field,
        fieldLabel: fieldLabels?.[field] || field,
        message,
        severity: 'error',
      });
    });
  });

  return result;
}

export default ValidationSummary;
