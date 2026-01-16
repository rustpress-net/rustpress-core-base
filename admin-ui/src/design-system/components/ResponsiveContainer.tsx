/**
 * ResponsiveContainer Component (Enhancement #103)
 * Responsive layout helpers and container utilities
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
  className?: string;
}

export interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | { xs?: 'row' | 'col'; sm?: 'row' | 'col'; md?: 'row' | 'col'; lg?: 'row' | 'col' };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
}

export interface ShowAtProps {
  children: React.ReactNode;
  breakpoint: Breakpoint;
  above?: boolean;
  below?: boolean;
  className?: string;
}

export interface HideAtProps {
  children: React.ReactNode;
  breakpoint: Breakpoint;
  above?: boolean;
  below?: boolean;
  className?: string;
}

export interface StackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  divider?: React.ReactNode;
  className?: string;
}

export interface ContainerQueryProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
  className?: string;
}

// ============================================================================
// Breakpoint Constants
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ============================================================================
// Context
// ============================================================================

interface BreakpointContextValue {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isAbove: (bp: Breakpoint) => boolean;
  isBelow: (bp: Breakpoint) => boolean;
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
}

const BreakpointContext = createContext<BreakpointContextValue>({
  breakpoint: 'md',
  width: 1024,
  height: 768,
  isAbove: () => true,
  isBelow: () => false,
  isBetween: () => true,
});

export function useBreakpoint() {
  return useContext(BreakpointContext);
}

// ============================================================================
// BreakpointProvider Component
// ============================================================================

export function BreakpointProvider({ children }: { children: React.ReactNode }) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, []);

  const isAbove = useCallback(
    (bp: Breakpoint) => windowSize.width >= breakpoints[bp],
    [windowSize.width]
  );

  const isBelow = useCallback(
    (bp: Breakpoint) => windowSize.width < breakpoints[bp],
    [windowSize.width]
  );

  const isBetween = useCallback(
    (min: Breakpoint, max: Breakpoint) =>
      windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max],
    [windowSize.width]
  );

  const value: BreakpointContextValue = {
    breakpoint: getBreakpoint(windowSize.width),
    width: windowSize.width,
    height: windowSize.height,
    isAbove,
    isBelow,
    isBetween,
  };

  return (
    <BreakpointContext.Provider value={value}>
      {children}
    </BreakpointContext.Provider>
  );
}

// ============================================================================
// useMediaQuery Hook
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ============================================================================
// useResponsiveValue Hook
// ============================================================================

export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const { breakpoint } = useBreakpoint();

  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Find the closest matching value for current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }

  return defaultValue;
}

// ============================================================================
// ResponsiveContainer Component
// ============================================================================

export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  padding = 'md',
  centered = true,
  className = '',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
    prose: 'max-w-prose',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
  };

  return (
    <div
      className={`
        w-full
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses[padding]}
        ${centered ? 'mx-auto' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ResponsiveGrid Component
// ============================================================================

export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, lg: 3 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const getColsClasses = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`;
    }

    const colClasses = [];
    if (cols.xs) colClasses.push(`grid-cols-${cols.xs}`);
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    return colClasses.join(' ');
  };

  return (
    <div className={`grid ${getColsClasses()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// ResponsiveFlex Component
// ============================================================================

export function ResponsiveFlex({
  children,
  direction = 'row',
  gap = 'md',
  wrap = false,
  align = 'stretch',
  justify = 'start',
  className = '',
}: ResponsiveFlexProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const getDirectionClasses = () => {
    if (typeof direction === 'string') {
      return direction === 'row' ? 'flex-row' : 'flex-col';
    }

    const dirClasses = [];
    if (direction.xs) dirClasses.push(direction.xs === 'row' ? 'flex-row' : 'flex-col');
    if (direction.sm) dirClasses.push(direction.sm === 'row' ? 'sm:flex-row' : 'sm:flex-col');
    if (direction.md) dirClasses.push(direction.md === 'row' ? 'md:flex-row' : 'md:flex-col');
    if (direction.lg) dirClasses.push(direction.lg === 'row' ? 'lg:flex-row' : 'lg:flex-col');
    return dirClasses.join(' ');
  };

  return (
    <div
      className={`
        flex
        ${getDirectionClasses()}
        ${gapClasses[gap]}
        ${wrap ? 'flex-wrap' : ''}
        ${alignClasses[align]}
        ${justifyClasses[justify]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ShowAt Component
// ============================================================================

export function ShowAt({
  children,
  breakpoint,
  above = false,
  below = false,
  className = '',
}: ShowAtProps) {
  const getVisibilityClasses = () => {
    if (above) {
      return `hidden ${breakpoint}:block`;
    }
    if (below) {
      return `${breakpoint}:hidden`;
    }
    // Show only at this breakpoint
    const bpOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const idx = bpOrder.indexOf(breakpoint);
    const nextBp = bpOrder[idx + 1];

    if (idx === 0) {
      return nextBp ? `block ${nextBp}:hidden` : 'block';
    }
    return nextBp ? `hidden ${breakpoint}:block ${nextBp}:hidden` : `hidden ${breakpoint}:block`;
  };

  return (
    <div className={`${getVisibilityClasses()} ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// HideAt Component
// ============================================================================

export function HideAt({
  children,
  breakpoint,
  above = false,
  below = false,
  className = '',
}: HideAtProps) {
  const getVisibilityClasses = () => {
    if (above) {
      return `block ${breakpoint}:hidden`;
    }
    if (below) {
      return `hidden ${breakpoint}:block`;
    }
    // Hide only at this breakpoint
    const bpOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const idx = bpOrder.indexOf(breakpoint);
    const nextBp = bpOrder[idx + 1];

    if (idx === 0) {
      return nextBp ? `hidden ${nextBp}:block` : 'hidden';
    }
    return nextBp ? `block ${breakpoint}:hidden ${nextBp}:block` : `block ${breakpoint}:hidden`;
  };

  return (
    <div className={`${getVisibilityClasses()} ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// Stack Component
// ============================================================================

export function Stack({
  children,
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  divider,
  className = '',
}: StackProps) {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const alignClasses = {
    start: direction === 'vertical' ? 'items-start' : 'items-start',
    center: 'items-center',
    end: direction === 'vertical' ? 'items-end' : 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <div
      className={`
        flex
        ${direction === 'vertical' ? 'flex-col' : 'flex-row'}
        ${divider ? '' : gapClasses[gap]}
        ${alignClasses[align]}
        ${justifyClasses[justify]}
        ${wrap ? 'flex-wrap' : ''}
        ${className}
      `}
    >
      {divider
        ? childArray.map((child, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className={`${gapClasses[gap].replace('gap-', 'py-')}`}>
                  {divider}
                </div>
              )}
              {child}
            </React.Fragment>
          ))
        : children}
    </div>
  );
}

// ============================================================================
// ContainerQuery Component
// ============================================================================

export function ContainerQuery({ children, className = '' }: ContainerQueryProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children(size)}
    </div>
  );
}

// ============================================================================
// AspectRatioBox Component
// ============================================================================

export interface AspectRatioBoxProps {
  children: React.ReactNode;
  ratio?: number;
  className?: string;
}

export function AspectRatioBox({
  children,
  ratio = 16 / 9,
  className = '',
}: AspectRatioBoxProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

// ============================================================================
// Spacer Component
// ============================================================================

export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'horizontal' | 'vertical';
  className?: string;
}

export function Spacer({ size = 'md', axis = 'vertical', className = '' }: SpacerProps) {
  const sizeClasses = {
    xs: axis === 'vertical' ? 'h-1' : 'w-1',
    sm: axis === 'vertical' ? 'h-2' : 'w-2',
    md: axis === 'vertical' ? 'h-4' : 'w-4',
    lg: axis === 'vertical' ? 'h-6' : 'w-6',
    xl: axis === 'vertical' ? 'h-8' : 'w-8',
    '2xl': axis === 'vertical' ? 'h-12' : 'w-12',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${axis === 'vertical' ? 'w-full' : 'h-full'} ${className}`}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Center Component
// ============================================================================

export interface CenterProps {
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
}

export function Center({ children, inline = false, className = '' }: CenterProps) {
  return (
    <div
      className={`
        flex items-center justify-center
        ${inline ? 'inline-flex' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MobileOnly Component
// ============================================================================

export function MobileOnly({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`block md:hidden ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// DesktopOnly Component
// ============================================================================

export function DesktopOnly({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`hidden md:block ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// TabletOnly Component
// ============================================================================

export function TabletOnly({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`hidden sm:block lg:hidden ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// Fluid Container Component
// ============================================================================

export interface FluidContainerProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export function FluidContainer({
  children,
  minWidth = 320,
  maxWidth = 1280,
  className = '',
}: FluidContainerProps) {
  return (
    <div
      className={`w-full mx-auto ${className}`}
      style={{
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Sidebar Layout Component
// ============================================================================

export interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
  sidebarPosition?: 'left' | 'right';
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = '256px',
  sidebarPosition = 'left',
  collapsible = false,
  collapsed = false,
  onCollapse,
  className = '',
}: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <div className={`flex h-full ${sidebarPosition === 'right' ? 'flex-row-reverse' : ''} ${className}`}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '64px' : sidebarWidth }}
        className="flex-shrink-0 overflow-hidden border-r border-neutral-200 dark:border-neutral-700"
      >
        <div className="h-full overflow-y-auto">
          {sidebar}
        </div>
        {collapsible && (
          <button
            onClick={handleToggle}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </motion.aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// ============================================================================
// Split View Component
// ============================================================================

export interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: number;
  minRatio?: number;
  maxRatio?: number;
  resizable?: boolean;
  vertical?: boolean;
  className?: string;
}

export function SplitView({
  left,
  right,
  ratio = 0.5,
  vertical = false,
  className = '',
}: SplitViewProps) {
  const [splitRatio] = useState(ratio);

  return (
    <div
      className={`flex h-full ${vertical ? 'flex-col' : 'flex-row'} ${className}`}
    >
      <div
        style={{
          [vertical ? 'height' : 'width']: `${splitRatio * 100}%`,
        }}
        className="overflow-auto"
      >
        {left}
      </div>
      <div className={`${vertical ? 'h-px' : 'w-px'} bg-neutral-200 dark:bg-neutral-700`} />
      <div
        style={{
          [vertical ? 'height' : 'width']: `${(1 - splitRatio) * 100}%`,
        }}
        className="overflow-auto"
      >
        {right}
      </div>
    </div>
  );
}

export default ResponsiveContainer;
