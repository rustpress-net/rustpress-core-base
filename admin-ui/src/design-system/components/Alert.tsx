/**
 * Alert Component (Enhancement #84)
 * Inline alerts, banners, and notification messages
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  ChevronRight,
  ExternalLink,
  Bell,
  Megaphone,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode | false;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface AlertBannerProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  icon?: React.ReactNode | false;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  sticky?: boolean;
  className?: string;
}

export interface AlertInlineProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export interface AlertToastProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface CalloutProps {
  variant?: AlertVariant | 'note' | 'tip' | 'caution';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export interface AnnouncementProps {
  title: string;
  message: string;
  variant?: 'default' | 'promotional' | 'update' | 'urgent';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getVariantConfig = (variant: AlertVariant) => {
  const configs: Record<AlertVariant, {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
  }> = {
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800 dark:text-blue-200',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-success-50 dark:bg-success-900/20',
      borderColor: 'border-success-200 dark:border-success-800',
      iconColor: 'text-success-500',
      titleColor: 'text-success-800 dark:text-success-200',
      textColor: 'text-success-700 dark:text-success-300',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
      borderColor: 'border-warning-200 dark:border-warning-800',
      iconColor: 'text-warning-500',
      titleColor: 'text-warning-800 dark:text-warning-200',
      textColor: 'text-warning-700 dark:text-warning-300',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-error-50 dark:bg-error-900/20',
      borderColor: 'border-error-200 dark:border-error-800',
      iconColor: 'text-error-500',
      titleColor: 'text-error-800 dark:text-error-200',
      textColor: 'text-error-700 dark:text-error-300',
    },
  };
  return configs[variant];
};

// ============================================================================
// Alert Component
// ============================================================================

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = getVariantConfig(variant);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            rounded-lg border p-4
            ${config.bgColor}
            ${config.borderColor}
            ${className}
          `}
          role="alert"
        >
          <div className="flex">
            {/* Icon */}
            {icon !== false && (
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                {icon || config.icon}
              </div>
            )}

            {/* Content */}
            <div className={`flex-1 ${icon !== false ? 'ml-3' : ''}`}>
              {title && (
                <h3 className={`text-sm font-semibold ${config.titleColor}`}>
                  {title}
                </h3>
              )}
              <div className={`${title ? 'mt-1' : ''} text-sm ${config.textColor}`}>
                {children}
              </div>

              {/* Action */}
              {action && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={action.onClick}
                    className={`
                      text-sm font-medium underline-offset-2 hover:underline
                      ${config.titleColor}
                    `}
                  >
                    {action.label}
                    <ChevronRight className="inline-block w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {dismissible && (
              <div className="flex-shrink-0 ml-4">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className={`
                    rounded-md p-1.5 inline-flex
                    hover:bg-black/5 dark:hover:bg-white/5
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${config.iconColor}
                  `}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Alert Banner Component
// ============================================================================

export function AlertBanner({
  variant = 'info',
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  sticky = false,
  className = '',
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = getVariantConfig(variant);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`
            ${config.bgColor}
            ${sticky ? 'sticky top-0 z-50' : ''}
            ${className}
          `}
          role="alert"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center flex-1 min-w-0">
                {icon !== false && (
                  <span className={`flex-shrink-0 ${config.iconColor}`}>
                    {icon || config.icon}
                  </span>
                )}
                <p className={`ml-3 text-sm font-medium truncate ${config.textColor}`}>
                  {children}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {action && (
                  action.href ? (
                    <a
                      href={action.href}
                      className={`
                        flex items-center px-3 py-1.5 rounded-md text-sm font-medium
                        bg-white/20 hover:bg-white/30
                        ${config.textColor}
                      `}
                    >
                      {action.label}
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={action.onClick}
                      className={`
                        flex items-center px-3 py-1.5 rounded-md text-sm font-medium
                        bg-white/20 hover:bg-white/30
                        ${config.textColor}
                      `}
                    >
                      {action.label}
                    </button>
                  )
                )}

                {dismissible && (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className={`
                      p-1.5 rounded-md hover:bg-white/20
                      ${config.iconColor}
                    `}
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Alert Inline Component
// ============================================================================

export function AlertInline({
  variant = 'info',
  children,
  size = 'sm',
  className = '',
}: AlertInlineProps) {
  const config = getVariantConfig(variant);

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        ${config.textColor}
        ${size === 'sm' ? 'text-xs' : 'text-sm'}
        ${className}
      `}
      role="alert"
    >
      <span className={config.iconColor}>
        {React.cloneElement(config.icon as React.ReactElement, {
          className: size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
        })}
      </span>
      <span>{children}</span>
    </div>
  );
}

// ============================================================================
// Alert Toast Component
// ============================================================================

export function AlertToast({
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
  className = '',
}: AlertToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const config = getVariantConfig(variant);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev - (100 / (duration / 100));
          if (next <= 0) {
            clearInterval(interval);
            setIsVisible(false);
            onClose?.();
          }
          return next;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className={`
            w-80 rounded-lg shadow-lg overflow-hidden
            bg-white dark:bg-neutral-800
            border ${config.borderColor}
            ${className}
          `}
          role="alert"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                {config.icon}
              </div>
              <div className="ml-3 flex-1">
                {title && (
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {title}
                  </p>
                )}
                <p className={`${title ? 'mt-1' : ''} text-sm text-neutral-600 dark:text-neutral-400`}>
                  {message}
                </p>
                {action && (
                  <button
                    type="button"
                    onClick={action.onClick}
                    className={`mt-2 text-sm font-medium ${config.titleColor} hover:underline`}
                  >
                    {action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex-shrink-0 ml-2 text-neutral-400 hover:text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {duration > 0 && (
            <div className="h-1 bg-neutral-100 dark:bg-neutral-700">
              <motion.div
                className={`h-full ${config.bgColor.replace('bg-', 'bg-').replace('/20', '')}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Callout Component
// ============================================================================

export function Callout({
  variant = 'note',
  title,
  children,
  icon,
  collapsible = false,
  defaultExpanded = true,
  className = '',
}: CalloutProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const variantConfig: Record<string, {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
  }> = {
    note: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-neutral-50 dark:bg-neutral-900',
      borderColor: 'border-neutral-200 dark:border-neutral-700',
      iconColor: 'text-neutral-500',
      titleColor: 'text-neutral-900 dark:text-white',
    },
    tip: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-success-50 dark:bg-success-900/20',
      borderColor: 'border-success-200 dark:border-success-800',
      iconColor: 'text-success-500',
      titleColor: 'text-success-800 dark:text-success-200',
    },
    caution: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-warning-50 dark:bg-warning-900/20',
      borderColor: 'border-warning-200 dark:border-warning-800',
      iconColor: 'text-warning-500',
      titleColor: 'text-warning-800 dark:text-warning-200',
    },
    info: getVariantConfig('info'),
    success: getVariantConfig('success'),
    warning: getVariantConfig('warning'),
    error: getVariantConfig('error'),
  };

  const config = variantConfig[variant] || variantConfig.note;

  return (
    <div
      className={`
        rounded-lg border-l-4 p-4
        ${config.bgColor}
        ${config.borderColor}
        ${className}
      `}
    >
      <div
        className={`flex items-start ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <span className={`flex-shrink-0 ${config.iconColor}`}>
          {icon || config.icon}
        </span>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className={`text-sm font-semibold ${config.titleColor}`}>
              {title}
            </h4>
          )}
        </div>
        {collapsible && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-neutral-400"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-8 text-sm text-neutral-600 dark:text-neutral-400">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Announcement Component
// ============================================================================

export function Announcement({
  title,
  message,
  variant = 'default',
  dismissible = true,
  onDismiss,
  action,
  className = '',
}: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(true);

  const variantConfig = {
    default: {
      bg: 'bg-neutral-900 dark:bg-neutral-100',
      text: 'text-white dark:text-neutral-900',
      icon: <Bell className="w-5 h-5" />,
    },
    promotional: {
      bg: 'bg-gradient-to-r from-primary-600 to-purple-600',
      text: 'text-white',
      icon: <Megaphone className="w-5 h-5" />,
    },
    update: {
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: <Info className="w-5 h-5" />,
    },
    urgent: {
      bg: 'bg-error-600',
      text: 'text-white',
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const config = variantConfig[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`
            rounded-lg p-4 ${config.bg} ${config.text}
            ${className}
          `}
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 opacity-80">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{title}</h4>
              <p className="mt-1 text-sm opacity-90">{message}</p>
              {action && (
                <div className="mt-3">
                  {action.href ? (
                    <a
                      href={action.href}
                      className="inline-flex items-center text-sm font-medium underline underline-offset-2 hover:opacity-80"
                    >
                      {action.label}
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={action.onClick}
                      className="text-sm font-medium underline underline-offset-2 hover:opacity-80"
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Alert;
