/**
 * Resizable Component
 *
 * Enterprise-grade resizable panels:
 * - Horizontal and vertical resizing
 * - Min/max size constraints
 * - Collapsible panels
 * - Snap to sizes
 * - Persist sizes to localStorage
 * - Keyboard support
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { motion } from 'framer-motion';
import { GripVertical, GripHorizontal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface ResizablePanelConfig {
  id: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
}

export interface ResizableProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  panels: ResizablePanelConfig[];
  onResize?: (sizes: number[]) => void;
  persistKey?: string;
  className?: string;
}

export interface ResizablePanelProps {
  children: React.ReactNode;
  className?: string;
}

export interface ResizableHandleProps {
  className?: string;
  showGrip?: boolean;
}

// ============================================================================
// Context
// ============================================================================

interface ResizableContextValue {
  direction: 'horizontal' | 'vertical';
  sizes: number[];
  panels: ResizablePanelConfig[];
  containerRef: React.RefObject<HTMLDivElement>;
  startResize: (index: number, e: React.MouseEvent | React.TouchEvent) => void;
  toggleCollapse: (index: number) => void;
  collapsedPanels: Set<number>;
}

const ResizableContext = createContext<ResizableContextValue | null>(null);

function useResizable() {
  const context = useContext(ResizableContext);
  if (!context) {
    throw new Error('useResizable must be used within Resizable');
  }
  return context;
}

// ============================================================================
// Main Component
// ============================================================================

export function Resizable({
  children,
  direction = 'horizontal',
  panels,
  onResize,
  persistKey,
  className,
}: ResizableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsedPanels, setCollapsedPanels] = useState<Set<number>>(new Set());

  // Initialize sizes from localStorage or defaults
  const [sizes, setSizes] = useState<number[]>(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`resizable-${persistKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Calculate default sizes
    const totalDefaultSize = panels.reduce((acc, p) => acc + (p.defaultSize || 0), 0);
    const panelsWithoutDefault = panels.filter(p => !p.defaultSize).length;
    const remainingSize = 100 - totalDefaultSize;
    const defaultPerPanel = panelsWithoutDefault > 0 ? remainingSize / panelsWithoutDefault : 0;

    return panels.map(p => p.defaultSize || defaultPerPanel);
  });

  // Persist sizes
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(`resizable-${persistKey}`, JSON.stringify(sizes));
    }
  }, [sizes, persistKey]);

  // Resize handler
  const startResize = useCallback((handleIndex: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerSize = direction === 'horizontal' ? containerRect.width : containerRect.height;

    const startPos = 'touches' in e
      ? (direction === 'horizontal' ? e.touches[0].clientX : e.touches[0].clientY)
      : (direction === 'horizontal' ? e.clientX : e.clientY);

    const startSizes = [...sizes];

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentPos = 'touches' in moveEvent
        ? (direction === 'horizontal' ? moveEvent.touches[0].clientX : moveEvent.touches[0].clientY)
        : (direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY);

      const delta = currentPos - startPos;
      const deltaPercent = (delta / containerSize) * 100;

      const newSizes = [...startSizes];

      // Adjust the two adjacent panels
      const leftPanel = panels[handleIndex];
      const rightPanel = panels[handleIndex + 1];

      let leftSize = startSizes[handleIndex] + deltaPercent;
      let rightSize = startSizes[handleIndex + 1] - deltaPercent;

      // Apply constraints
      const leftMin = leftPanel.minSize || 0;
      const leftMax = leftPanel.maxSize || 100;
      const rightMin = rightPanel.minSize || 0;
      const rightMax = rightPanel.maxSize || 100;

      // Enforce minimum sizes
      if (leftSize < leftMin) {
        const overflow = leftMin - leftSize;
        leftSize = leftMin;
        rightSize += overflow;
      }
      if (rightSize < rightMin) {
        const overflow = rightMin - rightSize;
        rightSize = rightMin;
        leftSize += overflow;
      }

      // Enforce maximum sizes
      if (leftSize > leftMax) {
        const overflow = leftSize - leftMax;
        leftSize = leftMax;
        rightSize -= overflow;
      }
      if (rightSize > rightMax) {
        const overflow = rightSize - rightMax;
        rightSize = rightMax;
        leftSize -= overflow;
      }

      newSizes[handleIndex] = leftSize;
      newSizes[handleIndex + 1] = rightSize;

      setSizes(newSizes);
      onResize?.(newSizes);
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [sizes, panels, direction, onResize]);

  // Toggle collapse
  const toggleCollapse = useCallback((index: number) => {
    const panel = panels[index];
    if (!panel.collapsible) return;

    setCollapsedPanels(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, [panels]);

  // Get effective sizes (accounting for collapsed panels)
  const effectiveSizes = useMemo(() => {
    return sizes.map((size, index) => {
      if (collapsedPanels.has(index)) {
        return panels[index].collapsedSize || 0;
      }
      return size;
    });
  }, [sizes, collapsedPanels, panels]);

  return (
    <ResizableContext.Provider
      value={{
        direction,
        sizes: effectiveSizes,
        panels,
        containerRef,
        startResize,
        toggleCollapse,
        collapsedPanels,
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          'flex',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          'h-full w-full',
          className
        )}
      >
        {children}
      </div>
    </ResizableContext.Provider>
  );
}

// ============================================================================
// Panel Component
// ============================================================================

interface ResizablePanelInternalProps extends ResizablePanelProps {
  index?: number;
}

export function ResizablePanel({ children, className, index = 0 }: ResizablePanelInternalProps) {
  const { direction, sizes, collapsedPanels, panels } = useResizable();

  const size = sizes[index] || 0;
  const isCollapsed = collapsedPanels.has(index);
  const panel = panels[index];

  return (
    <motion.div
      animate={{
        [direction === 'horizontal' ? 'width' : 'height']: `${size}%`,
      }}
      transition={{ duration: isCollapsed ? 0.2 : 0 }}
      className={cn(
        'overflow-hidden',
        isCollapsed && 'opacity-0',
        className
      )}
      style={{
        [direction === 'horizontal' ? 'minWidth' : 'minHeight']: panel?.minSize ? `${panel.minSize}%` : undefined,
        [direction === 'horizontal' ? 'maxWidth' : 'maxHeight']: panel?.maxSize ? `${panel.maxSize}%` : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Handle Component
// ============================================================================

interface ResizableHandleInternalProps extends ResizableHandleProps {
  index?: number;
}

export function ResizableHandle({ className, showGrip = true, index = 0 }: ResizableHandleInternalProps) {
  const { direction, startResize, toggleCollapse, collapsedPanels, panels } = useResizable();

  const isLeftCollapsed = collapsedPanels.has(index);
  const isRightCollapsed = collapsedPanels.has(index + 1);
  const leftPanel = panels[index];
  const rightPanel = panels[index + 1];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Toggle the collapsible panel
      if (leftPanel?.collapsible && !isLeftCollapsed) {
        toggleCollapse(index);
      } else if (rightPanel?.collapsible && !isRightCollapsed) {
        toggleCollapse(index + 1);
      } else if (leftPanel?.collapsible && isLeftCollapsed) {
        toggleCollapse(index);
      } else if (rightPanel?.collapsible && isRightCollapsed) {
        toggleCollapse(index + 1);
      }
    }
  };

  const CollapseIcon = direction === 'horizontal'
    ? (isLeftCollapsed ? ChevronRight : isRightCollapsed ? ChevronLeft : null)
    : (isLeftCollapsed ? ChevronDown : isRightCollapsed ? ChevronUp : null);

  return (
    <div
      role="separator"
      tabIndex={0}
      onMouseDown={(e) => startResize(index, e)}
      onTouchStart={(e) => startResize(index, e)}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => {
        if (leftPanel?.collapsible) toggleCollapse(index);
        else if (rightPanel?.collapsible) toggleCollapse(index + 1);
      }}
      className={cn(
        'flex-shrink-0 flex items-center justify-center',
        'bg-neutral-100 dark:bg-neutral-800',
        'hover:bg-neutral-200 dark:hover:bg-neutral-700',
        'active:bg-primary-100 dark:active:bg-primary-900/30',
        'transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
        direction === 'horizontal'
          ? 'w-1.5 cursor-col-resize hover:w-2'
          : 'h-1.5 cursor-row-resize hover:h-2',
        className
      )}
    >
      {showGrip && (
        <div className={cn(
          'text-neutral-400',
          direction === 'horizontal' ? 'rotate-0' : 'rotate-90'
        )}>
          {CollapseIcon ? (
            <CollapseIcon className="w-3 h-3" />
          ) : direction === 'horizontal' ? (
            <GripVertical className="w-3 h-3" />
          ) : (
            <GripHorizontal className="w-3 h-3" />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Prebuilt Layouts
// ============================================================================

export interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftMinSize?: number;
  leftMaxSize?: number;
  rightMinSize?: number;
  rightMaxSize?: number;
  defaultLeftSize?: number;
  leftCollapsible?: boolean;
  rightCollapsible?: boolean;
  persistKey?: string;
  className?: string;
}

export function TwoColumnLayout({
  left,
  right,
  leftMinSize = 10,
  leftMaxSize = 90,
  rightMinSize = 10,
  rightMaxSize = 90,
  defaultLeftSize = 30,
  leftCollapsible = false,
  rightCollapsible = false,
  persistKey,
  className,
}: TwoColumnLayoutProps) {
  return (
    <Resizable
      direction="horizontal"
      panels={[
        { id: 'left', defaultSize: defaultLeftSize, minSize: leftMinSize, maxSize: leftMaxSize, collapsible: leftCollapsible },
        { id: 'right', defaultSize: 100 - defaultLeftSize, minSize: rightMinSize, maxSize: rightMaxSize, collapsible: rightCollapsible },
      ]}
      persistKey={persistKey}
      className={className}
    >
      <ResizablePanel index={0}>{left}</ResizablePanel>
      <ResizableHandle index={0} />
      <ResizablePanel index={1}>{right}</ResizablePanel>
    </Resizable>
  );
}

export interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  leftSize?: number;
  rightSize?: number;
  leftCollapsible?: boolean;
  rightCollapsible?: boolean;
  persistKey?: string;
  className?: string;
}

export function ThreeColumnLayout({
  left,
  center,
  right,
  leftSize = 20,
  rightSize = 20,
  leftCollapsible = true,
  rightCollapsible = true,
  persistKey,
  className,
}: ThreeColumnLayoutProps) {
  return (
    <Resizable
      direction="horizontal"
      panels={[
        { id: 'left', defaultSize: leftSize, minSize: 10, maxSize: 40, collapsible: leftCollapsible, collapsedSize: 0 },
        { id: 'center', defaultSize: 100 - leftSize - rightSize, minSize: 30 },
        { id: 'right', defaultSize: rightSize, minSize: 10, maxSize: 40, collapsible: rightCollapsible, collapsedSize: 0 },
      ]}
      persistKey={persistKey}
      className={className}
    >
      <ResizablePanel index={0}>{left}</ResizablePanel>
      <ResizableHandle index={0} />
      <ResizablePanel index={1}>{center}</ResizablePanel>
      <ResizableHandle index={1} />
      <ResizablePanel index={2}>{right}</ResizablePanel>
    </Resizable>
  );
}

export interface TopBottomLayoutProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  topSize?: number;
  topCollapsible?: boolean;
  bottomCollapsible?: boolean;
  persistKey?: string;
  className?: string;
}

export function TopBottomLayout({
  top,
  bottom,
  topSize = 50,
  topCollapsible = false,
  bottomCollapsible = false,
  persistKey,
  className,
}: TopBottomLayoutProps) {
  return (
    <Resizable
      direction="vertical"
      panels={[
        { id: 'top', defaultSize: topSize, minSize: 10, maxSize: 90, collapsible: topCollapsible },
        { id: 'bottom', defaultSize: 100 - topSize, minSize: 10, maxSize: 90, collapsible: bottomCollapsible },
      ]}
      persistKey={persistKey}
      className={className}
    >
      <ResizablePanel index={0}>{top}</ResizablePanel>
      <ResizableHandle index={0} />
      <ResizablePanel index={1}>{bottom}</ResizablePanel>
    </Resizable>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Resizable;
