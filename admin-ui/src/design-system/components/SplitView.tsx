/**
 * SplitView Component
 *
 * Master-detail layout patterns:
 * - Responsive split layouts
 * - List-detail pattern
 * - Collapsible panels
 * - Mobile-first responsive
 * - Animated transitions
 */

import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Menu } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface SplitViewProps {
  children: React.ReactNode;
  defaultSplit?: number;
  minMasterWidth?: number;
  maxMasterWidth?: number;
  breakpoint?: number;
  persistKey?: string;
  className?: string;
}

export interface MasterPanelProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface DetailPanelProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  showBackButton?: boolean;
}

// ============================================================================
// Context
// ============================================================================

interface SplitViewContextValue {
  isMobile: boolean;
  showDetail: boolean;
  setShowDetail: (show: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  masterWidth: number;
}

const SplitViewContext = createContext<SplitViewContextValue | null>(null);

export function useSplitView() {
  const context = useContext(SplitViewContext);
  if (!context) {
    throw new Error('useSplitView must be used within SplitView');
  }
  return context;
}

// ============================================================================
// Main Component
// ============================================================================

export function SplitView({
  children,
  defaultSplit = 320,
  minMasterWidth = 240,
  maxMasterWidth = 480,
  breakpoint = 768,
  persistKey,
  className,
}: SplitViewProps) {
  const [masterWidth, setMasterWidth] = useState(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`splitview-${persistKey}`);
      if (saved) return parseInt(saved, 10);
    }
    return defaultSplit;
  });
  const [showDetail, setShowDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  // Persist width
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(`splitview-${persistKey}`, masterWidth.toString());
    }
  }, [masterWidth, persistKey]);

  // Auto-show detail when item selected on mobile
  useEffect(() => {
    if (selectedId && isMobile) {
      setShowDetail(true);
    }
  }, [selectedId, isMobile]);

  return (
    <SplitViewContext.Provider
      value={{
        isMobile,
        showDetail,
        setShowDetail,
        selectedId,
        setSelectedId,
        masterWidth,
      }}
    >
      <div className={cn('flex h-full overflow-hidden', className)}>
        {children}
      </div>
    </SplitViewContext.Provider>
  );
}

// ============================================================================
// Master Panel Component
// ============================================================================

export function MasterPanel({
  children,
  className,
  header,
  footer,
}: MasterPanelProps) {
  const { isMobile, showDetail, masterWidth } = useSplitView();

  // On mobile, hide master when detail is shown
  if (isMobile && showDetail) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-white dark:bg-neutral-900',
        'border-r border-neutral-200 dark:border-neutral-700',
        isMobile && 'w-full',
        className
      )}
      style={isMobile ? undefined : { width: masterWidth }}
    >
      {header && (
        <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-700">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      {footer && (
        <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Detail Panel Component
// ============================================================================

export function DetailPanel({
  children,
  className,
  header,
  footer,
  emptyState,
  showBackButton = true,
}: DetailPanelProps) {
  const { isMobile, showDetail, setShowDetail, selectedId } = useSplitView();

  const handleBack = () => {
    setShowDetail(false);
  };

  // On mobile, animate the detail panel
  if (isMobile) {
    return (
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed inset-0 z-50',
              'flex flex-col',
              'bg-white dark:bg-neutral-900',
              className
            )}
          >
            {showBackButton && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={handleBack}
                  className="p-1 -ml-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {header}
              </div>
            )}
            <div className="flex-1 overflow-auto">
              {selectedId ? children : (emptyState || <DefaultEmptyState />)}
            </div>
            {footer && (
              <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700">
                {footer}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop layout
  return (
    <div className={cn('flex-1 flex flex-col h-full overflow-hidden', className)}>
      {header && (
        <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-700">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {selectedId ? children : (emptyState || <DefaultEmptyState />)}
      </div>
      {footer && (
        <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Default Empty State
// ============================================================================

function DefaultEmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-neutral-500 dark:text-neutral-400">
        <div className="text-lg font-medium mb-1">No item selected</div>
        <p className="text-sm">Select an item from the list to view details</p>
      </div>
    </div>
  );
}

// ============================================================================
// List Item Component
// ============================================================================

export interface ListItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ListItem({ id, children, className, onClick }: ListItemProps) {
  const { selectedId, setSelectedId, setShowDetail, isMobile } = useSplitView();
  const isSelected = selectedId === id;

  const handleClick = () => {
    setSelectedId(id);
    if (isMobile) {
      setShowDetail(true);
    }
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left p-3 transition-colors',
        'border-b border-neutral-100 dark:border-neutral-800',
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
        className
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Collapsible Split View
// ============================================================================

export interface CollapsibleSplitViewProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  masterWidth?: number;
  collapsedWidth?: number;
  defaultCollapsed?: boolean;
  position?: 'left' | 'right';
  className?: string;
}

export function CollapsibleSplitView({
  master,
  detail,
  masterWidth = 300,
  collapsedWidth = 48,
  defaultCollapsed = false,
  position = 'left',
  className,
}: CollapsibleSplitViewProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const sidePanel = (
    <motion.div
      animate={{ width: isCollapsed ? collapsedWidth : masterWidth }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex-shrink-0 h-full overflow-hidden',
        'bg-white dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-700',
        position === 'left' ? 'border-r' : 'border-l'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className={cn(
          'absolute top-4 z-10 p-1',
          'bg-white dark:bg-neutral-800 rounded-full',
          'border border-neutral-200 dark:border-neutral-700',
          'shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-700',
          'transition-colors',
          position === 'left' ? '-right-3' : '-left-3'
        )}
      >
        {position === 'left' ? (
          isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )
        ) : isCollapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Content */}
      <div className={cn('h-full', isCollapsed && 'opacity-0 pointer-events-none')}>
        {master}
      </div>
    </motion.div>
  );

  return (
    <div className={cn('flex h-full', className)}>
      {position === 'left' && sidePanel}
      <div className="flex-1 h-full overflow-hidden">{detail}</div>
      {position === 'right' && sidePanel}
    </div>
  );
}

// ============================================================================
// Mobile Split View with Sheet
// ============================================================================

export interface SheetSplitViewProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  detailTitle?: string;
  isDetailOpen: boolean;
  onDetailClose: () => void;
  className?: string;
}

export function SheetSplitView({
  master,
  detail,
  detailTitle,
  isDetailOpen,
  onDetailClose,
  className,
}: SheetSplitViewProps) {
  return (
    <div className={cn('relative h-full', className)}>
      {/* Master (always visible) */}
      <div className="h-full">{master}</div>

      {/* Detail Sheet */}
      <AnimatePresence>
        {isDetailOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onDetailClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed inset-x-0 bottom-0 z-50',
                'bg-white dark:bg-neutral-900',
                'rounded-t-2xl shadow-2xl',
                'max-h-[90vh] overflow-hidden'
              )}
            >
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="font-semibold text-neutral-900 dark:text-white">
                  {detailTitle || 'Details'}
                </h2>
                <button
                  onClick={onDetailClose}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-auto max-h-[calc(90vh-100px)]">{detail}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Responsive Layout Hook
// ============================================================================

export function useResponsiveLayout(breakpoint: number = 768) {
  const [layout, setLayout] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    const checkLayout = () => {
      setLayout(window.innerWidth < breakpoint ? 'mobile' : 'desktop');
    };
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, [breakpoint]);

  return layout;
}

// ============================================================================
// Exports
// ============================================================================

export default SplitView;
