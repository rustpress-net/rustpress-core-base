/**
 * ErrorBoundary Component (Enhancement #98)
 * React error boundary with fallback UI and error recovery
 */

import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
}

export interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  resetError?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
  showStackTrace?: boolean;
  variant?: 'default' | 'minimal' | 'card' | 'fullPage';
  homeLink?: string;
  className?: string;
}

export interface RetryButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  className?: string;
}

export interface ErrorDetailsProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  className?: string;
}

// ============================================================================
// ErrorBoundary Class Component
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, index) => prevProps.resetKeys?.[index] !== key)) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback({
          error,
          errorInfo,
          resetError: this.resetError,
        });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return children;
  }
}

// ============================================================================
// Error Fallback Component
// ============================================================================

export function ErrorFallback({
  error,
  errorInfo,
  resetError,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  showDetails = true,
  showStackTrace = false,
  variant = 'default',
  homeLink = '/',
  className = '',
}: ErrorFallbackProps) {
  const [showError, setShowError] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyError = async () => {
    const errorText = `Error: ${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo?.componentStack || 'N/A'}`;
    await navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'minimal') {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error.message || title}
            </p>
            {resetError && (
              <button
                onClick={resetError}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'fullPage') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950 ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {resetError && (
              <button
                onClick={resetError}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            <a
              href={homeLink}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </a>
          </div>

          {showDetails && (
            <ErrorDetails error={error} errorInfo={errorInfo} />
          )}
        </motion.div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4">
              <button
                onClick={() => setShowError(!showError)}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <Bug className="w-4 h-4" />
                <span>Error details</span>
                {showError ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {showError && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-neutral-500">
                          {error.name}
                        </span>
                        <button
                          onClick={copyError}
                          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
                        {error.message}
                      </pre>
                      {showStackTrace && error.stack && (
                        <pre className="mt-2 text-xs text-neutral-500 whitespace-pre-wrap font-mono max-h-40 overflow-auto">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-3">
          {resetError && (
            <button
              onClick={resetError}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {description}
          </p>

          {showDetails && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                {error.message}
              </p>
            </div>
          )}

          {resetError && (
            <button
              onClick={resetError}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Details Component
// ============================================================================

export function ErrorDetails({
  error,
  errorInfo,
  className = '',
}: ErrorDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyError = async () => {
    const errorText = `Error: ${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo?.componentStack || 'N/A'}`;
    await navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`text-left ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mx-auto"
      >
        <Bug className="w-4 h-4" />
        <span>Technical Details</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {error.name}
                </span>
                <button
                  onClick={copyError}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 rounded"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono mb-4">
                {error.message}
              </pre>

              {error.stack && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-neutral-500 mb-2">Stack Trace:</p>
                  <pre className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-mono max-h-40 overflow-auto p-2 bg-neutral-200 dark:bg-neutral-900 rounded">
                    {error.stack}
                  </pre>
                </div>
              )}

              {errorInfo?.componentStack && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-2">Component Stack:</p>
                  <pre className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-mono max-h-40 overflow-auto p-2 bg-neutral-200 dark:bg-neutral-900 rounded">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Retry Button Component
// ============================================================================

export function RetryButton({
  onClick,
  loading = false,
  label = 'Retry',
  className = '',
}: RetryButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-2 px-4 py-2
        bg-primary-500 text-white rounded-lg
        hover:bg-primary-600 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      <span>{loading ? 'Retrying...' : label}</span>
    </motion.button>
  );
}

// ============================================================================
// useErrorBoundary Hook
// ============================================================================

export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const showBoundary = useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return { resetError, showBoundary };
}

// ============================================================================
// withErrorBoundary HOC
// ============================================================================

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

// ============================================================================
// Suspense Error Boundary
// ============================================================================

export interface SuspenseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function SuspenseErrorBoundary({
  children,
  fallback,
  errorFallback,
  onError,
}: SuspenseErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <React.Suspense fallback={fallback || <DefaultSuspenseFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

function DefaultSuspenseFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

export default ErrorBoundary;
