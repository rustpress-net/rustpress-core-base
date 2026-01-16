import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronDown,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import clsx from 'clsx';
import type { MegaMenuConfig, MegaMenuColumn, MegaMenuWidget } from './MegaMenuBuilder';
import { WidgetRenderer } from './MegaMenuWidgets';

// ==================== TYPES ====================

interface MegaMenuPreviewProps {
  config: MegaMenuConfig;
  menuItemLabel: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface PreviewDevice {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  width: number;
  height: number;
}

// ==================== CONSTANTS ====================

const PREVIEW_DEVICES: PreviewDevice[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: 1200, height: 800 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 375, height: 667 }
];

// ==================== UTILITIES ====================

const getBackgroundStyle = (config: MegaMenuConfig): React.CSSProperties => {
  const { background } = config;

  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.color };

    case 'gradient':
      if (background.gradient) {
        const { type, angle, colors } = background.gradient;
        const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');

        if (type === 'linear') {
          return { background: `linear-gradient(${angle || 90}deg, ${colorStops})` };
        } else {
          return { background: `radial-gradient(circle, ${colorStops})` };
        }
      }
      break;

    case 'image':
      if (background.image) {
        const { url, size, position, repeat, attachment, overlay } = background.image;
        const overlayStyle = overlay
          ? `linear-gradient(${overlay.color}${Math.round(overlay.opacity * 255).toString(16).padStart(2, '0')}, ${overlay.color}${Math.round(overlay.opacity * 255).toString(16).padStart(2, '0')}), `
          : '';

        return {
          background: `${overlayStyle}url(${url})`,
          backgroundSize: size,
          backgroundPosition: position,
          backgroundRepeat: repeat,
          backgroundAttachment: attachment
        };
      }
      break;

    case 'pattern':
      if (background.pattern) {
        const { type, color, opacity, size } = background.pattern;
        // Create SVG patterns
        const patterns: Record<string, string> = {
          dots: `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='2' fill='${encodeURIComponent(color)}' fill-opacity='${opacity}'/%3E%3C/svg%3E")`,
          lines: `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='${size}' x2='${size}' y2='0' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`,
          grid: `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M ${size} 0 L 0 0 0 ${size}' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`,
          diagonal: `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-${size/4},${size/4} l${size/2},-${size/2} M0,${size} l${size},-${size} M${size*0.75},${size*1.25} l${size/2},-${size/2}' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`
        };

        return {
          backgroundColor: '#ffffff',
          backgroundImage: patterns[type] || patterns.dots
        };
      }
      break;
  }

  return { backgroundColor: '#ffffff' };
};

const getAnimationVariants = (config: MegaMenuConfig): any => {
  const { entrance, stagger } = config.animation;

  const baseVariants: Record<string, any> = {
    none: { initial: {}, animate: {} },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    slide: {
      initial: {
        opacity: 0,
        y: entrance.direction === 'up' ? 20 : entrance.direction === 'down' ? -20 : 0,
        x: entrance.direction === 'left' ? 20 : entrance.direction === 'right' ? -20 : 0
      },
      animate: { opacity: 1, y: 0, x: 0 }
    },
    zoom: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 }
    },
    flip: {
      initial: { opacity: 0, rotateX: -90 },
      animate: { opacity: 1, rotateX: 0 }
    },
    bounce: {
      initial: { opacity: 0, y: 30 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring' as const,
          stiffness: 400,
          damping: 10
        }
      }
    },
    elastic: {
      initial: { opacity: 0, scale: 0.5 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 8
        }
      }
    }
  };

  return baseVariants[entrance.type] || baseVariants.fade;
};

const getEffectsStyle = (config: MegaMenuConfig): React.CSSProperties => {
  const { effects } = config;
  const styles: React.CSSProperties = {};

  if (effects.glassmorphism.enabled) {
    styles.backdropFilter = `blur(${effects.glassmorphism.blur}px)`;
    styles.backgroundColor = `rgba(255, 255, 255, ${effects.glassmorphism.opacity})`;
    styles.border = `1px solid rgba(255, 255, 255, ${effects.glassmorphism.borderOpacity})`;
  }

  if (effects.blur.enabled) {
    styles.backdropFilter = (styles.backdropFilter || '') + ` blur(${effects.blur.amount}px)`;
  }

  return styles;
};

// ==================== PREVIEW COMPONENT ====================

export const MegaMenuPreview: React.FC<MegaMenuPreviewProps> = ({
  config,
  menuItemLabel,
  isOpen = true,
  onToggle
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDevice = PREVIEW_DEVICES.find(d => d.id === device)!;

  const handleReplay = () => {
    setKey(prev => prev + 1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const variants = getAnimationVariants(config);
  const backgroundStyle = getBackgroundStyle(config);
  const effectsStyle = getEffectsStyle(config);

  // Calculate responsive columns
  const getResponsiveColumns = (): MegaMenuColumn[] => {
    if (device === 'mobile' && config.responsive.mobile.hidden) return [];
    if (device === 'tablet' && config.responsive.tablet.hidden) return [];

    if (device === 'mobile' && config.responsive.mobile.columns !== 'inherit') {
      const numCols = config.responsive.mobile.columns as number;
      const equalWidth = 100 / numCols;
      return config.columns.map((col, idx) => ({
        ...col,
        width: idx < numCols ? equalWidth : 0
      })).filter(col => col.width > 0);
    }

    if (device === 'tablet' && config.responsive.tablet.columns !== 'inherit') {
      const numCols = config.responsive.tablet.columns as number;
      const equalWidth = 100 / numCols;
      return config.columns.map((col, idx) => ({
        ...col,
        width: idx < numCols ? equalWidth : 0
      })).filter(col => col.width > 0);
    }

    return config.columns;
  };

  const responsiveColumns = getResponsiveColumns();

  // Render mobile accordion layout
  const renderMobileAccordion = () => {
    return (
      <div className="space-y-2">
        {config.columns.map((column, colIdx) => (
          <div key={column.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Column {colIdx + 1}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            <div className="p-4 space-y-4">
              {column.widgets.map((widget) => (
                <WidgetRenderer key={widget.id} widget={widget} isPreview />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mega-menu-preview-container bg-gray-100 rounded-xl overflow-hidden">
      {/* Preview Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {PREVIEW_DEVICES.map(d => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                device === d.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              )}
              title={d.label}
            >
              <d.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 min-w-[40px] text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-2" />
          <button
            onClick={handleReplay}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Replay animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div
        ref={containerRef}
        className="p-8 flex justify-center items-start overflow-auto"
        style={{ minHeight: '500px' }}
      >
        <div
          className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: `${currentDevice.width * (zoom / 100)}px`,
            maxWidth: '100%'
          }}
        >
          {/* Simulated Header */}
          <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg" />
              <span className="font-semibold">Site Logo</span>
            </div>

            {device === 'mobile' ? (
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <MenuIcon className="w-5 h-5" />
              </button>
            ) : (
              <nav className="flex items-center gap-6">
                <a href="#" className="text-gray-300 hover:text-white">Home</a>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-white font-medium">
                    {menuItemLabel}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <a href="#" className="text-gray-300 hover:text-white">About</a>
                <a href="#" className="text-gray-300 hover:text-white">Contact</a>
              </nav>
            )}
          </div>

          {/* Mega Menu */}
          <AnimatePresence>
            {isOpen && isPlaying && (
              <motion.div
                key={key}
                variants={variants}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: config.animation.entrance.duration / 1000,
                  delay: config.animation.entrance.delay / 1000,
                  ease: config.animation.entrance.easing as any
                }}
                className={clsx(
                  'mega-menu-panel border-t border-gray-200',
                  config.effects.noise.enabled && 'noise-overlay',
                  config.effects.grain.enabled && 'grain-overlay'
                )}
                style={{
                  ...backgroundStyle,
                  ...effectsStyle,
                  padding: `${config.padding.top}px ${config.padding.right}px ${config.padding.bottom}px ${config.padding.left}px`,
                  width: config.width === 'full'
                    ? '100%'
                    : config.width === 'container'
                      ? '100%'
                      : config.width === 'auto'
                        ? 'auto'
                        : `${config.width}px`
                }}
              >
                {/* Mobile Accordion */}
                {device === 'mobile' && config.responsive.mobile.accordion ? (
                  renderMobileAccordion()
                ) : (
                  /* Regular Column Layout */
                  <div className="flex gap-6">
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
                            ? (config.animation.stagger.from === 'start'
                                ? colIdx
                                : config.animation.stagger.from === 'end'
                                  ? responsiveColumns.length - 1 - colIdx
                                  : Math.abs(colIdx - Math.floor(responsiveColumns.length / 2))
                              ) * (config.animation.stagger.delay / 1000)
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
                                  ? ((colIdx * column.widgets.length) + widgetIdx) * (config.animation.stagger.delay / 1000) + 0.1
                                  : 0
                              }}
                            >
                              <WidgetRenderer widget={widget} isPreview />
                            </motion.div>
                          ))}

                          {column.widgets.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                              No widgets
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulated Content */}
          <div className="p-8 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-500">
              Preview: <span className="font-medium text-gray-700">{currentDevice.label}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">
              {currentDevice.width} × {currentDevice.height}px
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500">
              Columns: <span className="font-medium text-gray-700">{responsiveColumns.length}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">
              Widgets: <span className="font-medium text-gray-700">
                {config.columns.reduce((sum, col) => sum + col.widgets.length, 0)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== LIVE PREVIEW COMPONENT (For Theme Frontend) ====================

interface MegaMenuLiveProps {
  config: MegaMenuConfig;
  trigger: React.ReactNode;
  position?: 'left' | 'center' | 'right';
  className?: string;
}

export const MegaMenuLive: React.FC<MegaMenuLiveProps> = ({
  config,
  trigger,
  position = 'left',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (config.advanced.hoverIntent) {
      timeoutRef.current = setTimeout(() => {
        setIsHovering(true);
        setIsOpen(true);
      }, config.advanced.openDelay);
    } else {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsOpen(false);
    }, config.advanced.closeDelay);
  };

  const handleClick = () => {
    if (config.advanced.closeOnClick) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!config.advanced.closeOnOutsideClick) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [config.advanced.closeOnOutsideClick]);

  useEffect(() => {
    if (isOpen && config.advanced.preventBodyScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, config.advanced.preventBodyScroll]);

  const variants = getAnimationVariants(config);
  const backgroundStyle = getBackgroundStyle(config);
  const effectsStyle = getEffectsStyle(config);

  const positionClass = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0'
  }[position];

  return (
    <div
      ref={menuRef}
      className={clsx('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={config.advanced.ariaBehavior === 'menu' ? 'menubar' : 'navigation'}
    >
      {/* Trigger */}
      <div
        className="mega-menu-trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>

      {/* Mega Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: config.animation.entrance.duration / 1000,
              delay: config.animation.entrance.delay / 1000
            }}
            className={clsx(
              'absolute top-full mt-1 z-50 shadow-2xl rounded-xl overflow-hidden',
              positionClass,
              config.advanced.customClass
            )}
            id={config.advanced.customId}
            style={{
              ...backgroundStyle,
              ...effectsStyle,
              padding: `${config.padding.top}px ${config.padding.right}px ${config.padding.bottom}px ${config.padding.left}px`,
              width: config.width === 'full'
                ? '100vw'
                : config.width === 'container'
                  ? '1200px'
                  : config.width === 'auto'
                    ? 'auto'
                    : `${config.width}px`,
              maxWidth: '100vw'
            }}
            onClick={handleClick}
            role={config.advanced.ariaBehavior === 'menu' ? 'menu' : undefined}
          >
            <div className="flex gap-6">
              {config.columns.map((column, colIdx) => (
                <motion.div
                  key={column.id}
                  className="mega-menu-column"
                  style={{ width: `${column.width}%` }}
                  initial={config.animation.stagger.enabled ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: config.animation.stagger.enabled
                      ? colIdx * (config.animation.stagger.delay / 1000)
                      : 0
                  }}
                >
                  <div className="space-y-4">
                    {column.widgets.map((widget) => (
                      <WidgetRenderer key={widget.id} widget={widget} isPreview={false} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaMenuPreview;
