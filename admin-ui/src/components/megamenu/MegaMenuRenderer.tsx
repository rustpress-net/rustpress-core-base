import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, X, Menu as MenuIcon } from 'lucide-react';
import clsx from 'clsx';
import type { MegaMenuConfig, MegaMenuColumn } from './MegaMenuBuilder';
import { WidgetRenderer } from './MegaMenuWidgets';
import './megamenu.css';

// ==================== TYPES ====================

interface MegaMenuRendererProps {
  config: MegaMenuConfig;
  menuItem: {
    id: string;
    label: string;
    url?: string;
    icon?: React.ReactNode;
  };
  trigger?: 'hover' | 'click';
  position?: 'left' | 'center' | 'right' | 'full';
  className?: string;
  theme?: 'light' | 'dark';
  onOpen?: () => void;
  onClose?: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

// ==================== HOOKS ====================

const useHoverIntent = (
  onHover: () => void,
  onLeave: () => void,
  delay: number = 100
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isHoveringRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    timeoutRef.current = setTimeout(() => {
      if (isHoveringRef.current) {
        onHover();
      }
    }, delay);
  }, [onHover, delay]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onLeave();
  }, [onLeave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleMouseEnter, handleMouseLeave };
};

const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, containerRef]);
};

// ==================== UTILITY FUNCTIONS ====================

const getBackgroundStyle = (config: MegaMenuConfig): React.CSSProperties => {
  const { background } = config;

  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.color };

    case 'gradient':
      if (background.gradient) {
        const { type, angle, colors } = background.gradient;
        const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');
        return {
          background: type === 'linear'
            ? `linear-gradient(${angle || 90}deg, ${colorStops})`
            : `radial-gradient(circle, ${colorStops})`
        };
      }
      break;

    case 'image':
      if (background.image) {
        const { url, size, position, repeat, attachment, overlay } = background.image;
        return {
          backgroundImage: overlay
            ? `linear-gradient(${overlay.color}${Math.round(overlay.opacity * 255).toString(16)}, ${overlay.color}${Math.round(overlay.opacity * 255).toString(16)}), url(${url})`
            : `url(${url})`,
          backgroundSize: size,
          backgroundPosition: position,
          backgroundRepeat: repeat,
          backgroundAttachment: attachment
        };
      }
      break;
  }

  return { backgroundColor: '#ffffff' };
};

const getEffectsClass = (config: MegaMenuConfig): string => {
  const classes: string[] = [];

  if (config.effects.glassmorphism.enabled) {
    classes.push('mega-menu-glass');
  }
  if (config.effects.noise.enabled) {
    classes.push('noise-overlay');
  }
  if (config.effects.grain.enabled) {
    classes.push('grain-overlay');
  }

  return classes.join(' ');
};

const getAnimationVariants = (config: MegaMenuConfig): any => {
  const { entrance } = config.animation;

  const variants: Record<string, any> = {
    none: { initial: {}, animate: {}, exit: {} },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: {
        opacity: 0,
        y: entrance.direction === 'up' ? 20 : entrance.direction === 'down' ? -20 : 0,
        x: entrance.direction === 'left' ? 20 : entrance.direction === 'right' ? -20 : 0
      },
      animate: { opacity: 1, y: 0, x: 0 },
      exit: { opacity: 0, y: -10 }
    },
    zoom: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 }
    },
    flip: {
      initial: { opacity: 0, rotateX: -10, transformOrigin: 'top' },
      animate: { opacity: 1, rotateX: 0 },
      exit: { opacity: 0, rotateX: -10 }
    },
    bounce: {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 400, damping: 15 }
      },
      exit: { opacity: 0, y: -10 }
    },
    elastic: {
      initial: { opacity: 0, scale: 0.8 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 10 }
      },
      exit: { opacity: 0, scale: 0.9 }
    }
  };

  return variants[entrance.type] || variants.fade;
};

// ==================== MAIN COMPONENT ====================

export const MegaMenuRenderer: React.FC<MegaMenuRendererProps> = ({
  config,
  menuItem,
  trigger = 'hover',
  position = 'left',
  className,
  theme = 'light',
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const shouldReduceMotion = useReducedMotion();

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Focus trap for accessibility
  useFocusTrap(isOpen && config.advanced.trapFocus, menuRef);

  // Handle open/close
  const handleOpen = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsOpen(true);
    onOpen?.();

    if (config.advanced.preventBodyScroll) {
      document.body.style.overflow = 'hidden';
    }
  }, [config.advanced.preventBodyScroll, onOpen]);

  const handleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      onClose?.();
      document.body.style.overflow = '';
    }, config.advanced.closeDelay);
  }, [config.advanced.closeDelay, onClose]);

  // Hover intent
  const { handleMouseEnter, handleMouseLeave } = useHoverIntent(
    handleOpen,
    handleClose,
    config.advanced.hoverIntent ? config.advanced.openDelay : 0
  );

  // Click outside handler
  useEffect(() => {
    if (!config.advanced.closeOnOutsideClick || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, config.advanced.closeOnOutsideClick, onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch behavior for mobile
  const handleTouchStart = useCallback(() => {
    if (config.advanced.touchBehavior === 'toggle') {
      setIsOpen(prev => !prev);
    } else if (config.advanced.touchBehavior === 'first-tap-open') {
      if (!isOpen) {
        setIsOpen(true);
      } else if (menuItem.url) {
        window.location.href = menuItem.url;
      }
    }
  }, [config.advanced.touchBehavior, isOpen, menuItem.url]);

  // Toggle accordion section (mobile)
  const toggleSection = (columnId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        if (!config.responsive.mobile.accordion) {
          next.clear();
        }
        next.add(columnId);
      }
      return next;
    });
  };

  // Get responsive columns
  const getResponsiveColumns = (): MegaMenuColumn[] => {
    if (isMobile && config.responsive.mobile.hidden) return [];
    if (!isMobile && config.responsive.tablet.hidden) return [];

    return config.columns;
  };

  const variants = shouldReduceMotion ? {} : getAnimationVariants(config);
  const backgroundStyle = getBackgroundStyle(config);
  const effectsClass = getEffectsClass(config);
  const responsiveColumns = getResponsiveColumns();

  // Position classes
  const positionClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
    full: 'left-0 right-0'
  };

  // Width style
  const getWidthStyle = (): React.CSSProperties => {
    if (position === 'full' || config.width === 'full') {
      return { width: '100vw', left: '50%', transform: 'translateX(-50%)' };
    }
    if (config.width === 'container') {
      return { width: '100%', maxWidth: '1200px' };
    }
    if (config.width === 'auto') {
      return { width: 'auto', minWidth: '600px' };
    }
    if (typeof config.width === 'number') {
      return { width: `${config.width}px` };
    }
    return {};
  };

  // Render mobile accordion
  const renderMobileAccordion = () => (
    <div className="mega-menu-mobile-accordion">
      {responsiveColumns.map((column, idx) => (
        <div
          key={column.id}
          className={clsx(
            'mega-menu-accordion',
            expandedSections.has(column.id) && 'active'
          )}
        >
          <button
            className="mega-menu-accordion-header"
            onClick={() => toggleSection(column.id)}
            aria-expanded={expandedSections.has(column.id)}
          >
            <span>Section {idx + 1}</span>
            <ChevronDown className="mega-menu-accordion-icon w-5 h-5" />
          </button>
          <motion.div
            className="mega-menu-accordion-content"
            initial={false}
            animate={{
              height: expandedSections.has(column.id) ? 'auto' : 0,
              opacity: expandedSections.has(column.id) ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 p-4">
              {column.widgets.map((widget) => (
                <WidgetRenderer key={widget.id} widget={widget} isPreview={false} />
              ))}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );

  // Render desktop layout
  const renderDesktopLayout = () => (
    <div className="mega-menu-columns flex gap-6">
      {responsiveColumns.map((column, colIdx) => (
        <motion.div
          key={column.id}
          className="mega-menu-column"
          style={{
            width: `${column.width}%`,
            alignSelf: column.verticalAlign === 'top'
              ? 'flex-start'
              : column.verticalAlign === 'middle'
                ? 'center'
                : 'flex-end'
          }}
          initial={config.animation.stagger.enabled ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: config.animation.stagger.enabled
              ? colIdx * (config.animation.stagger.delay / 1000)
              : 0
          }}
        >
          <div className="space-y-4">
            {column.widgets.map((widget, widgetIdx) => (
              <motion.div
                key={widget.id}
                initial={config.animation.stagger.enabled ? { opacity: 0, y: 10 } : {}}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: config.animation.stagger.enabled
                    ? ((colIdx * column.widgets.length) + widgetIdx) * (config.animation.stagger.delay / 1000) + 0.05
                    : 0
                }}
              >
                <WidgetRenderer widget={widget} isPreview={false} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={clsx('mega-menu-container relative', className)}
      onMouseEnter={trigger === 'hover' && !isMobile ? handleMouseEnter : undefined}
      onMouseLeave={trigger === 'hover' && !isMobile ? handleMouseLeave : undefined}
    >
      {/* Trigger Button */}
      <button
        className="mega-menu-trigger flex items-center gap-2 px-4 py-2 font-medium transition-colors hover:text-blue-600"
        onClick={trigger === 'click' || isMobile ? () => setIsOpen(!isOpen) : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`mega-menu-${menuItem.id}`}
      >
        {menuItem.icon}
        <span>{menuItem.label}</span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Mega Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsOpen(false)}
              />
            )}

            <motion.div
              ref={menuRef}
              id={config.advanced.customId || `mega-menu-${menuItem.id}`}
              className={clsx(
                'mega-menu-panel',
                isMobile ? 'fixed inset-x-0 bottom-0 top-auto rounded-t-2xl max-h-[80vh] overflow-y-auto z-50' : 'absolute top-full mt-2 z-50',
                !isMobile && positionClasses[position],
                effectsClass,
                theme === 'dark' && 'mega-menu-glass-dark',
                config.advanced.customClass
              )}
              style={{
                ...backgroundStyle,
                ...(!isMobile && getWidthStyle()),
                padding: `${config.padding.top}px ${config.padding.right}px ${config.padding.bottom}px ${config.padding.left}px`,
                ...(config.effects.glassmorphism.enabled && {
                  backdropFilter: `blur(${config.effects.glassmorphism.blur}px)`,
                  backgroundColor: `rgba(255, 255, 255, ${config.effects.glassmorphism.opacity})`
                })
              }}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: shouldReduceMotion ? 0 : config.animation.entrance.duration / 1000,
                ease: config.animation.entrance.easing as any
              }}
              role={config.advanced.ariaBehavior === 'menu' ? 'menu' : 'region'}
              aria-label={`${menuItem.label} mega menu`}
            >
              {/* Mobile close button */}
              {isMobile && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{menuItem.label}</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Content */}
              {isMobile && config.responsive.mobile.accordion
                ? renderMobileAccordion()
                : renderDesktopLayout()
              }
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== NAVIGATION BAR INTEGRATION ====================

interface MegaMenuNavProps {
  items: Array<{
    id: string;
    label: string;
    url?: string;
    icon?: React.ReactNode;
    megaMenu?: MegaMenuConfig;
  }>;
  className?: string;
  theme?: 'light' | 'dark';
  trigger?: 'hover' | 'click';
}

export const MegaMenuNav: React.FC<MegaMenuNavProps> = ({
  items,
  className,
  theme = 'light',
  trigger = 'hover'
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className={clsx('mega-menu-nav flex items-center gap-2', className)}>
      {items.map((item) => (
        item.megaMenu ? (
          <MegaMenuRenderer
            key={item.id}
            config={item.megaMenu}
            menuItem={item}
            trigger={trigger}
            theme={theme}
            onOpen={() => setActiveMenu(item.id)}
            onClose={() => setActiveMenu(null)}
          />
        ) : (
          <a
            key={item.id}
            href={item.url}
            className="flex items-center gap-2 px-4 py-2 font-medium transition-colors hover:text-blue-600"
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        )
      ))}
    </nav>
  );
};

export default MegaMenuRenderer;
