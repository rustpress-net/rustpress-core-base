/**
 * VisuallyHidden Component (Enhancement #97)
 * Accessibility utilities for screen readers
 */

import React, { forwardRef, useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  focusable?: boolean;
  className?: string;
}

export interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export interface LiveRegionProps {
  children: React.ReactNode;
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer';
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  clearAfter?: number;
  className?: string;
}

export interface AnnouncerProps {
  message: string;
  type?: 'polite' | 'assertive';
  clearAfter?: number;
}

export interface FocusGuardProps {
  onFocus: () => void;
}

export interface AccessibleIconProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export interface SrOnlyProps {
  children: React.ReactNode;
  focusable?: boolean;
}

// ============================================================================
// VisuallyHidden Component
// ============================================================================

export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ children, as: Component = 'span', focusable = false, className = '' }, ref) => {
    const visuallyHiddenStyles: React.CSSProperties = {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    };

    const focusableStyles: React.CSSProperties = focusable
      ? {}
      : visuallyHiddenStyles;

    return (
      <Component
        ref={ref as any}
        style={focusable ? undefined : visuallyHiddenStyles}
        className={className}
        tabIndex={focusable ? 0 : undefined}
      >
        {children}
      </Component>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

// ============================================================================
// Screen Reader Only Component (Alias)
// ============================================================================

export function SrOnly({ children, focusable = false }: SrOnlyProps) {
  return (
    <VisuallyHidden focusable={focusable}>
      {children}
    </VisuallyHidden>
  );
}

// ============================================================================
// Skip Link Component
// ============================================================================

export function SkipLink({
  href,
  children = 'Skip to main content',
  className = '',
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2
        focus:bg-primary-600 focus:text-white
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
        transition-all
        ${className}
      `}
    >
      {children}
    </a>
  );
}

// ============================================================================
// Skip Links Group Component
// ============================================================================

export interface SkipLinksProps {
  links: { href: string; label: string }[];
  className?: string;
}

export function SkipLinks({ links, className = '' }: SkipLinksProps) {
  return (
    <nav aria-label="Skip links" className={className}>
      {links.map((link, index) => (
        <SkipLink key={index} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </nav>
  );
}

// ============================================================================
// Live Region Component
// ============================================================================

export function LiveRegion({
  children,
  role = 'status',
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  'aria-relevant': ariaRelevant,
  clearAfter,
  className = '',
}: LiveRegionProps) {
  const [content, setContent] = useState(children);

  useEffect(() => {
    setContent(children);

    if (clearAfter && children) {
      const timer = setTimeout(() => {
        setContent(null);
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [children, clearAfter]);

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      className={`sr-only ${className}`}
    >
      {content}
    </div>
  );
}

// ============================================================================
// Announcer Component
// ============================================================================

export function Announcer({
  message,
  type = 'polite',
  clearAfter = 5000,
}: AnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      // Clear first to ensure re-announcement of same message
      setAnnouncement('');

      // Set message after a brief delay
      const setTimer = setTimeout(() => {
        setAnnouncement(message);
      }, 50);

      // Clear message after specified duration
      const clearTimer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);

      return () => {
        clearTimeout(setTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

// ============================================================================
// useAnnounce Hook
// ============================================================================

export function useAnnounce() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'polite' | 'assertive'>('polite');

  const announce = (text: string, announcementType: 'polite' | 'assertive' = 'polite') => {
    setType(announcementType);
    setMessage('');
    // Use setTimeout to ensure the message change triggers a new announcement
    setTimeout(() => setMessage(text), 50);
  };

  const AnnouncerComponent = () => (
    <Announcer message={message} type={type} />
  );

  return { announce, Announcer: AnnouncerComponent };
}

// ============================================================================
// Focus Guard Component
// ============================================================================

export function FocusGuard({ onFocus }: FocusGuardProps) {
  return (
    <span
      tabIndex={0}
      onFocus={onFocus}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Accessible Icon Component
// ============================================================================

export function AccessibleIcon({
  icon,
  label,
  className = '',
}: AccessibleIconProps) {
  return (
    <span className={`inline-flex items-center ${className}`} role="img" aria-label={label}>
      <span aria-hidden="true">{icon}</span>
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}

// ============================================================================
// Decorative Icon Component (No accessibility label needed)
// ============================================================================

export interface DecorativeIconProps {
  icon: React.ReactNode;
  className?: string;
}

export function DecorativeIcon({ icon, className = '' }: DecorativeIconProps) {
  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}

// ============================================================================
// Accessible Heading Component
// ============================================================================

export interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function AccessibleHeading({
  level,
  children,
  visualLevel,
  className = '',
}: AccessibleHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const visualStyles: Record<number, string> = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };

  const appliedLevel = visualLevel || level;

  return (
    <Tag className={`${visualStyles[appliedLevel]} ${className}`}>
      {children}
    </Tag>
  );
}

// ============================================================================
// Accessible Description Component
// ============================================================================

export interface AccessibleDescriptionProps {
  id: string;
  children: React.ReactNode;
  hidden?: boolean;
  className?: string;
}

export function AccessibleDescription({
  id,
  children,
  hidden = false,
  className = '',
}: AccessibleDescriptionProps) {
  if (hidden) {
    return (
      <VisuallyHidden id={id}>
        {children}
      </VisuallyHidden>
    );
  }

  return (
    <p id={id} className={`text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>
      {children}
    </p>
  );
}

// ============================================================================
// Accessible Label Component
// ============================================================================

export interface AccessibleLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  hidden?: boolean;
  className?: string;
}

export function AccessibleLabel({
  htmlFor,
  children,
  required = false,
  hidden = false,
  className = '',
}: AccessibleLabelProps) {
  const content = (
    <>
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
      )}
      {required && <VisuallyHidden> (required)</VisuallyHidden>}
    </>
  );

  if (hidden) {
    return (
      <label htmlFor={htmlFor} className="sr-only">
        {content}
      </label>
    );
  }

  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 ${className}`}
    >
      {content}
    </label>
  );
}

// ============================================================================
// Accessible Table Caption Component
// ============================================================================

export interface AccessibleTableCaptionProps {
  children: React.ReactNode;
  hidden?: boolean;
  className?: string;
}

export function AccessibleTableCaption({
  children,
  hidden = false,
  className = '',
}: AccessibleTableCaptionProps) {
  return (
    <caption className={hidden ? 'sr-only' : className}>
      {children}
    </caption>
  );
}

// ============================================================================
// Landmark Components
// ============================================================================

export interface LandmarkProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function MainLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <main aria-label={label} className={className}>
      {children}
    </main>
  );
}

export function NavLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <nav aria-label={label} className={className}>
      {children}
    </nav>
  );
}

export function AsideLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <aside aria-label={label} className={className}>
      {children}
    </aside>
  );
}

export function SectionLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <section aria-label={label} className={className}>
      {children}
    </section>
  );
}

export function FooterLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <footer aria-label={label} className={className}>
      {children}
    </footer>
  );
}

export function HeaderLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <header aria-label={label} className={className}>
      {children}
    </header>
  );
}

// ============================================================================
// Focus Visible Utility
// ============================================================================

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return {
    isFocusVisible: isFocused && isFocusVisible,
    focusProps,
  };
}

// ============================================================================
// Reduced Motion Hook
// ============================================================================

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

// ============================================================================
// High Contrast Hook
// ============================================================================

export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return highContrast;
}

export default VisuallyHidden;
