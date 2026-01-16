/**
 * Portal Component (Enhancement #96)
 * Render components outside the normal DOM hierarchy
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface PortalProps {
  children: React.ReactNode;
  container?: Element | null;
  disabled?: boolean;
}

export interface PortalContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export interface FloatingPortalProps {
  children: React.ReactNode;
  id?: string;
}

export interface StackingContextProps {
  children: React.ReactNode;
  zIndex?: number;
}

export interface OverlayPortalProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  backdrop?: boolean | 'blur' | 'dark';
  zIndex?: number;
  className?: string;
}

export interface ModalPortalProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export interface DrawerPortalProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface NotificationPortalProps {
  children: React.ReactNode;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  className?: string;
}

// ============================================================================
// Portal Context
// ============================================================================

interface PortalContextValue {
  container: Element | null;
  setContainer: (container: Element | null) => void;
}

const PortalContext = createContext<PortalContextValue>({
  container: null,
  setContainer: () => {},
});

export function PortalProvider({
  children,
  container,
}: {
  children: React.ReactNode;
  container?: Element | null;
}) {
  const [portalContainer, setPortalContainer] = useState<Element | null>(
    container || null
  );

  useEffect(() => {
    if (container) {
      setPortalContainer(container);
    } else if (typeof document !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, [container]);

  return (
    <PortalContext.Provider
      value={{ container: portalContainer, setContainer: setPortalContainer }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortalContainer() {
  const context = useContext(PortalContext);
  return context.container;
}

// ============================================================================
// Portal Component
// ============================================================================

export function Portal({
  children,
  container: containerProp,
  disabled = false,
}: PortalProps) {
  const contextContainer = usePortalContainer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (disabled || !mounted) {
    return <>{children}</>;
  }

  const container = containerProp || contextContainer || document.body;

  return createPortal(children, container);
}

// ============================================================================
// Portal Container Component
// ============================================================================

export function PortalContainer({
  children,
  id,
  className = '',
}: PortalContainerProps) {
  const generatedId = useId();
  const containerId = id || `portal-container-${generatedId}`;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {children}
      <div
        ref={containerRef}
        id={containerId}
        className={`portal-container ${className}`}
      />
    </>
  );
}

// ============================================================================
// Floating Portal Component
// ============================================================================

export function FloatingPortal({ children, id }: FloatingPortalProps) {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    const containerId = id || 'floating-portal-root';
    let existingContainer = document.getElementById(containerId);

    if (!existingContainer) {
      existingContainer = document.createElement('div');
      existingContainer.id = containerId;
      existingContainer.style.position = 'fixed';
      existingContainer.style.top = '0';
      existingContainer.style.left = '0';
      existingContainer.style.width = '100%';
      existingContainer.style.height = '0';
      existingContainer.style.overflow = 'visible';
      existingContainer.style.zIndex = '9999';
      existingContainer.style.pointerEvents = 'none';
      document.body.appendChild(existingContainer);
    }

    setContainer(existingContainer);

    return () => {
      // Don't remove the container on unmount if other portals might use it
    };
  }, [id]);

  if (!container) return null;

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>{children}</div>,
    container
  );
}

// ============================================================================
// Stacking Context Component
// ============================================================================

export function StackingContext({
  children,
  zIndex = 1,
}: StackingContextProps) {
  return (
    <div style={{ position: 'relative', zIndex }}>
      {children}
    </div>
  );
}

// ============================================================================
// Overlay Portal Component
// ============================================================================

export function OverlayPortal({
  children,
  open,
  onClose,
  closeOnClickOutside = true,
  closeOnEscape = true,
  lockScroll = true,
  backdrop = true,
  zIndex = 50,
  className = '',
}: OverlayPortalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  // Handle scroll lock
  useEffect(() => {
    if (!open || !lockScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [open, lockScroll]);

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnClickOutside && e.target === overlayRef.current) {
        onClose?.();
      }
    },
    [closeOnClickOutside, onClose]
  );

  const backdropClasses = {
    true: 'bg-black/50',
    blur: 'bg-black/30 backdrop-blur-sm',
    dark: 'bg-black/70',
    false: '',
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackdropClick}
            className={`
              fixed inset-0
              flex items-center justify-center
              ${backdropClasses[String(backdrop) as keyof typeof backdropClasses] || backdropClasses.true}
              ${className}
            `}
            style={{ zIndex }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

// ============================================================================
// Modal Portal Component
// ============================================================================

export function ModalPortal({
  children,
  open,
  onClose,
  size = 'md',
  position = 'center',
  closeOnClickOutside = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: ModalPortalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  const positionClasses = {
    center: 'items-center',
    top: 'items-start pt-16',
    bottom: 'items-end pb-16',
  };

  return (
    <OverlayPortal
      open={open}
      onClose={onClose}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      backdrop="blur"
      className={positionClasses[position]}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? -20 : position === 'bottom' ? 20 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white dark:bg-neutral-900
          rounded-lg shadow-xl
          overflow-hidden
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="
              absolute top-4 right-4 z-10
              p-1 rounded-full
              text-neutral-400 hover:text-neutral-600
              dark:text-neutral-500 dark:hover:text-neutral-300
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              transition-colors
            "
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {children}
      </motion.div>
    </OverlayPortal>
  );
}

// ============================================================================
// Drawer Portal Component
// ============================================================================

export function DrawerPortal({
  children,
  open,
  onClose,
  position = 'right',
  size = 'md',
  closeOnClickOutside = true,
  closeOnEscape = true,
  className = '',
}: DrawerPortalProps) {
  const sizeClasses = {
    left: { sm: 'w-64', md: 'w-80', lg: 'w-96', full: 'w-full' },
    right: { sm: 'w-64', md: 'w-80', lg: 'w-96', full: 'w-full' },
    top: { sm: 'h-48', md: 'h-64', lg: 'h-96', full: 'h-full' },
    bottom: { sm: 'h-48', md: 'h-64', lg: 'h-96', full: 'h-full' },
  };

  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  const animations = {
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  };

  return (
    <OverlayPortal
      open={open}
      onClose={onClose}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      backdrop="dark"
      className="!items-stretch !justify-start"
    >
      <motion.div
        {...animations[position]}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`
          fixed
          ${positionClasses[position]}
          ${sizeClasses[position][size]}
          bg-white dark:bg-neutral-900
          shadow-2xl
          overflow-auto
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </OverlayPortal>
  );
}

// ============================================================================
// Notification Portal Component
// ============================================================================

export function NotificationPortal({
  children,
  position = 'top-right',
  className = '',
}: NotificationPortalProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <Portal>
      <div
        className={`
          fixed z-[100]
          ${positionClasses[position]}
          ${className}
        `}
      >
        {children}
      </div>
    </Portal>
  );
}

// ============================================================================
// Focus Trap Component
// ============================================================================

export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
}

export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, returnFocus]);

  return <div ref={containerRef}>{children}</div>;
}

// ============================================================================
// Teleport Component (Alias for Portal with named container)
// ============================================================================

export interface TeleportProps {
  children: React.ReactNode;
  to: string;
  disabled?: boolean;
}

export function Teleport({ children, to, disabled = false }: TeleportProps) {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    const element = document.querySelector(to);
    setContainer(element);
  }, [to]);

  if (disabled || !container) {
    return <>{children}</>;
  }

  return createPortal(children, container);
}

// ============================================================================
// usePortal Hook
// ============================================================================

export function usePortal(id?: string) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const generatedId = useId();
  const containerId = id || `portal-${generatedId}`;

  useEffect(() => {
    let existingContainer = document.getElementById(containerId) as HTMLDivElement;

    if (!existingContainer) {
      existingContainer = document.createElement('div');
      existingContainer.id = containerId;
      document.body.appendChild(existingContainer);
    }

    setContainer(existingContainer);

    return () => {
      // Clean up if no children
      if (existingContainer && existingContainer.childNodes.length === 0) {
        existingContainer.remove();
      }
    };
  }, [containerId]);

  const portalElement = useCallback(
    (children: React.ReactNode) => {
      if (!container) return null;
      return createPortal(children, container);
    },
    [container]
  );

  return { container, portalElement };
}

export default Portal;
