/**
 * Dock Component
 *
 * macOS-style application dock:
 * - Magnification effect on hover
 * - Smooth animations
 * - Tooltip labels
 * - Badge notifications
 * - Separator support
 * - Auto-hide functionality
 */

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  isActive?: boolean;
  separator?: boolean;
}

export interface DockProps {
  items: DockItem[];
  position?: 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  magnification?: boolean;
  magnificationScale?: number;
  magnificationRange?: number;
  showLabels?: boolean;
  autoHide?: boolean;
  className?: string;
}

// ============================================================================
// Dock Item Component
// ============================================================================

interface DockItemComponentProps {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue>;
  baseSize: number;
  magnificationScale: number;
  magnificationRange: number;
  magnification: boolean;
  position: 'bottom' | 'left' | 'right';
  showLabels: boolean;
}

function DockItemComponent({
  item,
  mouseX,
  baseSize,
  magnificationScale,
  magnificationRange,
  magnification,
  position,
  showLabels,
}: DockItemComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate distance from mouse
  const distance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;

    if (position === 'bottom') {
      return val - (rect.left + rect.width / 2);
    } else {
      return val - (rect.top + rect.height / 2);
    }
  });

  // Calculate size based on distance
  const sizeValue = useTransform(distance, [-magnificationRange, 0, magnificationRange], [
    baseSize,
    magnification ? baseSize * magnificationScale : baseSize,
    baseSize,
  ]);

  const size = useSpring(sizeValue, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  if (item.separator) {
    return (
      <div
        className={cn(
          'bg-neutral-300 dark:bg-neutral-600',
          position === 'bottom' ? 'w-px h-8 mx-2' : 'h-px w-8 my-2'
        )}
      />
    );
  }

  const Component = item.href ? 'a' : 'button';

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      {showLabels && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 10 : 0, x: position !== 'bottom' ? 10 : 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          className={cn(
            'absolute z-50 px-2 py-1',
            'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900',
            'text-xs font-medium rounded-md whitespace-nowrap',
            'shadow-lg',
            position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            position === 'left' && 'left-full top-1/2 -translate-y-1/2 ml-2',
            position === 'right' && 'right-full top-1/2 -translate-y-1/2 mr-2'
          )}
        >
          {item.label}
        </motion.div>
      )}

      {/* Dock Item */}
      <Component
        href={item.href}
        onClick={item.onClick}
        className="relative flex items-center justify-center outline-none focus:ring-2 focus:ring-primary-500 rounded-xl"
      >
        <motion.div
          style={{
            width: size,
            height: size,
          }}
          className={cn(
            'flex items-center justify-center rounded-xl',
            'bg-neutral-100 dark:bg-neutral-800',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700',
            'transition-colors',
            'shadow-md',
            item.isActive && 'ring-2 ring-primary-500'
          )}
        >
          <div className="text-neutral-700 dark:text-neutral-200">
            {item.icon}
          </div>
        </motion.div>

        {/* Badge */}
        {item.badge !== undefined && item.badge !== 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
              'flex items-center justify-center',
              'bg-red-500 text-white text-xs font-bold',
              'rounded-full px-1',
              'border-2 border-white dark:border-neutral-900'
            )}
          >
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </span>
        )}

        {/* Active indicator */}
        {item.isActive && (
          <div
            className={cn(
              'absolute rounded-full bg-primary-500',
              position === 'bottom' && '-bottom-1 left-1/2 -translate-x-1/2 w-1 h-1',
              position === 'left' && 'left-0 top-1/2 -translate-y-1/2 w-1 h-1',
              position === 'right' && 'right-0 top-1/2 -translate-y-1/2 w-1 h-1'
            )}
          />
        )}
      </Component>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Dock({
  items,
  position = 'bottom',
  size = 'md',
  magnification = true,
  magnificationScale = 1.5,
  magnificationRange = 150,
  showLabels = true,
  autoHide = false,
  className,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const [isVisible, setIsVisible] = useState(!autoHide);

  const baseSize = useMemo(() => {
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 64;
      default: return 52;
    }
  }, [size]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (position === 'bottom') {
      mouseX.set(e.clientX);
    } else {
      mouseX.set(e.clientY);
    }
  }, [position, mouseX]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(Infinity);
  }, [mouseX]);

  // Auto-hide trigger zone
  const handleTriggerEnter = useCallback(() => {
    if (autoHide) {
      setIsVisible(true);
    }
  }, [autoHide]);

  const handleDockLeave = useCallback(() => {
    if (autoHide) {
      setIsVisible(false);
    }
    handleMouseLeave();
  }, [autoHide, handleMouseLeave]);

  return (
    <>
      {/* Trigger zone for auto-hide */}
      {autoHide && !isVisible && (
        <div
          onMouseEnter={handleTriggerEnter}
          className={cn(
            'fixed z-40',
            position === 'bottom' && 'bottom-0 left-0 right-0 h-2',
            position === 'left' && 'left-0 top-0 bottom-0 w-2',
            position === 'right' && 'right-0 top-0 bottom-0 w-2'
          )}
        />
      )}

      {/* Dock */}
      <motion.div
        initial={autoHide ? { opacity: 0, y: position === 'bottom' ? 100 : 0, x: position === 'left' ? -100 : position === 'right' ? 100 : 0 } : false}
        animate={isVisible ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: position === 'bottom' ? 100 : 0, x: position === 'left' ? -100 : position === 'right' ? 100 : 0 }}
        transition={{ duration: 0.3 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleDockLeave}
        className={cn(
          'fixed z-50',
          position === 'bottom' && 'bottom-4 left-1/2 -translate-x-1/2',
          position === 'left' && 'left-4 top-1/2 -translate-y-1/2',
          position === 'right' && 'right-4 top-1/2 -translate-y-1/2',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center',
            position === 'bottom' && 'flex-row gap-2 px-4 py-2',
            position === 'left' && 'flex-col gap-2 px-2 py-4',
            position === 'right' && 'flex-col gap-2 px-2 py-4',
            'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
            'rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50',
            'shadow-2xl'
          )}
        >
          {items.map((item) => (
            <DockItemComponent
              key={item.id}
              item={item}
              mouseX={mouseX}
              baseSize={baseSize}
              magnificationScale={magnificationScale}
              magnificationRange={magnificationRange}
              magnification={magnification}
              position={position}
              showLabels={showLabels}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ============================================================================
// Mini Dock (Simpler version)
// ============================================================================

export interface MiniDockProps {
  items: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
  }>;
  position?: 'bottom' | 'left' | 'right';
  className?: string;
}

export function MiniDock({ items, position = 'bottom', className }: MiniDockProps) {
  return (
    <div
      className={cn(
        'flex',
        position === 'bottom' && 'flex-row gap-1',
        position === 'left' && 'flex-col gap-1',
        position === 'right' && 'flex-col gap-1',
        'p-1.5 bg-white dark:bg-neutral-900',
        'rounded-xl border border-neutral-200 dark:border-neutral-700',
        'shadow-lg',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          title={item.label}
          className={cn(
            'p-2 rounded-lg transition-colors',
            item.isActive
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// App Launcher Grid
// ============================================================================

export interface AppLauncherItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  color?: string;
}

export interface AppLauncherProps {
  items: AppLauncherItem[];
  columns?: number;
  className?: string;
}

export function AppLauncher({ items, columns = 4, className }: AppLauncherProps) {
  return (
    <div
      className={cn(
        'grid gap-4 p-4',
        'bg-white dark:bg-neutral-900 rounded-xl',
        'border border-neutral-200 dark:border-neutral-700',
        'shadow-xl',
        className
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item) => {
        const Component = item.href ? 'a' : 'button';
        return (
          <Component
            key={item.id}
            href={item.href}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors text-center',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                'text-white shadow-md'
              )}
              style={{ backgroundColor: item.color || '#6366f1' }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-900 dark:text-white">
                {item.label}
              </div>
              {item.description && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </div>
              )}
            </div>
          </Component>
        );
      })}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Dock;
