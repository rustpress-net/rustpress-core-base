/**
 * CopyButton Component (Enhancement #94)
 * Clipboard copy functionality with visual feedback
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Clipboard, ClipboardCheck, Link, ExternalLink } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface CopyButtonProps {
  text: string;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  copiedLabel?: string;
  timeout?: number;
  disabled?: boolean;
  className?: string;
}

export interface CopyToClipboardProps {
  children: (props: {
    copy: () => void;
    copied: boolean;
    error: Error | null;
  }) => React.ReactNode;
  text: string;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export interface CopyFieldProps {
  value: string;
  label?: string;
  showCopyButton?: boolean;
  selectOnFocus?: boolean;
  maskValue?: boolean;
  showToggle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface CopyLinkProps {
  url: string;
  label?: string;
  showIcon?: boolean;
  truncate?: boolean;
  maxLength?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface CopyCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string | number;
  className?: string;
}

export interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================================
// Utility Hook
// ============================================================================

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        // Try using the Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-HTTPS
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          textArea.style.top = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (!successful) {
            throw new Error('Copy command failed');
          }
        }

        setCopied(true);
        setError(null);

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        setError(error);
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, copied, error, reset: () => setCopied(false) };
}

// ============================================================================
// CopyButton Component
// ============================================================================

export function CopyButton({
  text,
  onCopy,
  onError,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label = 'Copy',
  copiedLabel = 'Copied!',
  timeout = 2000,
  disabled = false,
  className = '',
}: CopyButtonProps) {
  const { copy, copied, error } = useCopyToClipboard(timeout);

  const handleClick = async () => {
    const success = await copy(text);
    if (success) {
      onCopy?.(text);
    } else if (error) {
      onError?.(error);
    }
  };

  const sizeClasses = {
    xs: 'h-6 px-2 text-xs',
    sm: 'h-8 px-2.5 text-sm',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    default: `
      bg-neutral-100 dark:bg-neutral-800
      hover:bg-neutral-200 dark:hover:bg-neutral-700
      text-neutral-700 dark:text-neutral-300
      border border-neutral-200 dark:border-neutral-700
    `,
    outline: `
      bg-transparent
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      text-neutral-600 dark:text-neutral-400
      border border-neutral-300 dark:border-neutral-600
    `,
    ghost: `
      bg-transparent
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      text-neutral-600 dark:text-neutral-400
    `,
    subtle: `
      bg-neutral-50 dark:bg-neutral-900
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      text-neutral-500 dark:text-neutral-400
    `,
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled || copied}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center justify-center gap-1.5
        rounded-md font-medium
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-1.5 text-green-600 dark:text-green-400"
          >
            <Check className={iconSizes[size]} />
            {showLabel && <span>{copiedLabel}</span>}
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <Copy className={iconSizes[size]} />
            {showLabel && <span>{label}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ============================================================================
// CopyToClipboard Component (Render Props)
// ============================================================================

export function CopyToClipboard({
  children,
  text,
  onCopy,
  onError,
  timeout = 2000,
}: CopyToClipboardProps) {
  const { copy, copied, error } = useCopyToClipboard(timeout);

  const handleCopy = async () => {
    const success = await copy(text);
    if (success) {
      onCopy?.(text);
    } else if (error) {
      onError?.(error);
    }
  };

  return <>{children({ copy: handleCopy, copied, error })}</>;
}

// ============================================================================
// CopyField Component
// ============================================================================

export function CopyField({
  value,
  label,
  showCopyButton = true,
  selectOnFocus = true,
  maskValue = false,
  showToggle = false,
  size = 'md',
  className = '',
}: CopyFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(!maskValue);
  const { copy, copied } = useCopyToClipboard();

  const handleFocus = () => {
    if (selectOnFocus && inputRef.current) {
      inputRef.current.select();
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  const displayValue = isVisible ? value : value.replace(/./g, '\u2022');

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          readOnly
          onFocus={handleFocus}
          className={`
            flex-1
            px-3 rounded-l-md
            bg-neutral-50 dark:bg-neutral-800
            border border-r-0 border-neutral-200 dark:border-neutral-700
            text-neutral-900 dark:text-white
            font-mono
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${sizeClasses[size]}
          `}
        />

        {showToggle && maskValue && (
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className={`
              px-3
              bg-neutral-100 dark:bg-neutral-700
              border-y border-neutral-200 dark:border-neutral-700
              text-neutral-600 dark:text-neutral-400
              hover:bg-neutral-200 dark:hover:bg-neutral-600
              transition-colors
              ${sizeClasses[size]}
            `}
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
        )}

        {showCopyButton && (
          <button
            type="button"
            onClick={() => copy(value)}
            className={`
              px-3 rounded-r-md
              bg-neutral-100 dark:bg-neutral-700
              border border-neutral-200 dark:border-neutral-700
              text-neutral-600 dark:text-neutral-400
              hover:bg-neutral-200 dark:hover:bg-neutral-600
              transition-colors
              ${sizeClasses[size]}
            `}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <ClipboardCheck className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Clipboard className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CopyLink Component
// ============================================================================

export function CopyLink({
  url,
  label,
  showIcon = true,
  truncate = true,
  maxLength = 40,
  size = 'md',
  className = '',
}: CopyLinkProps) {
  const { copy, copied } = useCopyToClipboard();

  const displayUrl = truncate && url.length > maxLength
    ? url.substring(0, maxLength) + '...'
    : url;

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-2.5 px-5',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          flex-1 flex items-center gap-2
          bg-neutral-50 dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          rounded-lg
          ${sizeClasses[size]}
        `}
      >
        {showIcon && <Link className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
        <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate">
          {label || displayUrl}
        </span>
      </div>

      <CopyButton text={url} size={size === 'lg' ? 'md' : size} />

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          inline-flex items-center justify-center
          bg-neutral-100 dark:bg-neutral-800
          hover:bg-neutral-200 dark:hover:bg-neutral-700
          text-neutral-600 dark:text-neutral-400
          border border-neutral-200 dark:border-neutral-700
          rounded-md transition-colors
          ${size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-10 w-10' : 'h-9 w-9'}
        `}
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ============================================================================
// CopyCodeBlock Component
// ============================================================================

export function CopyCodeBlock({
  code,
  language = 'text',
  showLineNumbers = false,
  highlightLines = [],
  maxHeight,
  className = '',
}: CopyCodeBlockProps) {
  const { copy, copied } = useCopyToClipboard();
  const lines = code.split('\n');

  return (
    <div
      className={`
        relative group
        bg-neutral-900 dark:bg-neutral-950
        rounded-lg overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 dark:bg-neutral-900 border-b border-neutral-700">
        <span className="text-xs font-medium text-neutral-400 uppercase">
          {language}
        </span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-400 hover:text-white transition-colors rounded"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1 text-green-400"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Code */}
      <div
        className="overflow-auto"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <pre className="p-4 text-sm font-mono">
          <code>
            {lines.map((line, index) => (
              <div
                key={index}
                className={`
                  ${highlightLines.includes(index + 1)
                    ? 'bg-primary-500/20 -mx-4 px-4'
                    : ''
                  }
                `}
              >
                {showLineNumbers && (
                  <span className="inline-block w-8 text-neutral-500 select-none mr-4 text-right">
                    {index + 1}
                  </span>
                )}
                <span className="text-neutral-100">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// ShareButton Component
// ============================================================================

export function ShareButton({
  url,
  title,
  text,
  variant = 'default',
  size = 'md',
  className = '',
}: ShareButtonProps) {
  const { copy, copied } = useCopyToClipboard();
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url, title, text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          // Fallback to copy
          copy(url);
        }
      }
    } else {
      // Fallback to copy
      copy(url);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-base',
  };

  const variantClasses = {
    default: `
      bg-primary-500 hover:bg-primary-600
      text-white
    `,
    outline: `
      bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20
      text-primary-600 dark:text-primary-400
      border border-primary-300 dark:border-primary-700
    `,
    ghost: `
      bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20
      text-primary-600 dark:text-primary-400
    `,
  };

  return (
    <motion.button
      type="button"
      onClick={handleShare}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-md font-medium
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {shared || copied ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{shared ? 'Shared!' : 'Link Copied!'}</span>
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Share</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ============================================================================
// Inline Copy Component
// ============================================================================

export interface InlineCopyProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
}

export function InlineCopy({
  text,
  children,
  className = '',
}: InlineCopyProps) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`
        inline-flex items-center gap-1
        text-primary-600 dark:text-primary-400
        hover:text-primary-700 dark:hover:text-primary-300
        underline underline-offset-2
        transition-colors
        ${className}
      `}
    >
      <span>{children || text}</span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Check className="w-3.5 h-3.5 text-green-500" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default CopyButton;
