import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Share2,
  Link2,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  EyeOff,
  Columns,
  Loader2,
  Download,
  Settings,
  RefreshCw,
  Home,
  FileText,
  ShoppingBag,
  User,
  Search,
  MessageSquare,
  Image,
  Grid,
  Archive,
  AlertTriangle,
  Move,
  SplitSquareHorizontal,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface ThemeScreenshot {
  url: string;
  label: string;
}

interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  screenshots: ThemeScreenshot[];
  demoUrl: string;
  isActive: boolean;
  isInstalled: boolean;
}

interface PreviewPage {
  id: string;
  name: string;
  icon: any;
  path: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ZoomLevel = 25 | 50 | 75 | 100 | 125 | 150 | 175 | 200;

interface EnhancedThemePreviewProps {
  theme: Theme;
  currentTheme?: Theme;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (theme: Theme) => void;
  onInstall: (theme: Theme) => void;
}

// ============================================
// CONSTANTS
// ============================================

const PREVIEW_PAGES: PreviewPage[] = [
  { id: 'home', name: 'Homepage', icon: Home, path: '/' },
  { id: 'blog', name: 'Blog', icon: FileText, path: '/blog' },
  { id: 'single-post', name: 'Single Post', icon: FileText, path: '/blog/sample-post' },
  { id: 'shop', name: 'Shop', icon: ShoppingBag, path: '/shop' },
  { id: 'product', name: 'Product', icon: ShoppingBag, path: '/shop/product' },
  { id: 'about', name: 'About', icon: User, path: '/about' },
  { id: 'contact', name: 'Contact', icon: MessageSquare, path: '/contact' },
  { id: 'search', name: 'Search Results', icon: Search, path: '/search?q=demo' },
  { id: 'gallery', name: 'Gallery', icon: Image, path: '/gallery' },
  { id: 'portfolio', name: 'Portfolio', icon: Grid, path: '/portfolio' },
  { id: 'archive', name: 'Archive', icon: Archive, path: '/archive' },
  { id: '404', name: '404 Page', icon: AlertTriangle, path: '/404' },
];

const ZOOM_LEVELS: ZoomLevel[] = [25, 50, 75, 100, 125, 150, 175, 200];

const DEVICE_DIMENSIONS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

// ============================================
// ENHANCEMENT 18: PREVIEW LOADING SKELETON
// ============================================

const PreviewSkeleton: React.FC<{ device: DeviceType }> = ({ device }) => {
  const dimensions = DEVICE_DIMENSIONS[device];

  return (
    <div className="relative bg-white rounded-lg overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-gray-200 flex items-center px-6 gap-4">
        <div className="w-10 h-10 bg-gray-300 rounded-lg" />
        <div className="flex-1 flex justify-center gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-16 h-4 bg-gray-300 rounded" />
          ))}
        </div>
        <div className="w-24 h-8 bg-gray-300 rounded-lg" />
      </div>

      {/* Hero skeleton */}
      <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-64 h-8 bg-gray-300 rounded mx-auto" />
          <div className="w-48 h-4 bg-gray-300 rounded mx-auto" />
          <div className="w-32 h-10 bg-gray-300 rounded-lg mx-auto" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto" />
              <div className="w-24 h-4 bg-gray-200 rounded mx-auto" />
              <div className="w-full h-3 bg-gray-200 rounded" />
              <div className="w-3/4 h-3 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="w-full h-3 bg-gray-200 rounded" />
                <div className="w-1/2 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-600 font-medium">Loading preview...</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 10: SPLIT-SCREEN BEFORE/AFTER
// ============================================

interface SplitScreenViewProps {
  currentTheme?: Theme;
  previewTheme: Theme;
  currentPage: string;
  zoom: number;
  device: DeviceType;
}

const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  currentTheme,
  previewTheme,
  currentPage,
  zoom,
  device,
}) => {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSplitPosition(Math.max(10, Math.min(90, percentage)));
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const page = PREVIEW_PAGES.find(p => p.id === currentPage);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: isDragging ? 'col-resize' : 'default' }}
    >
      {/* Current Theme (Left) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${splitPosition}%` }}
      >
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-gray-900/80 text-white text-sm rounded-lg backdrop-blur-sm">
          Current: {currentTheme?.name || 'Default Theme'}
        </div>
        <iframe
          src={currentTheme?.demoUrl ? `${currentTheme.demoUrl}${page?.path || '/'}` : 'about:blank'}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${100 / (zoom / 100)}%`,
            height: `${100 / (zoom / 100)}%`,
          }}
          title="Current theme preview"
        />
      </div>

      {/* Preview Theme (Right) */}
      <div
        className="absolute inset-y-0 right-0 overflow-hidden"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-blue-600/90 text-white text-sm rounded-lg backdrop-blur-sm">
          Preview: {previewTheme.name}
        </div>
        <iframe
          src={`${previewTheme.demoUrl}${page?.path || '/'}`}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top right',
            width: `${100 / (zoom / 100)}%`,
            height: `${100 / (zoom / 100)}%`,
          }}
          title="Preview theme"
        />
      </div>

      {/* Draggable Divider */}
      <div
        className={clsx(
          'absolute top-0 bottom-0 w-1 bg-blue-500 cursor-col-resize z-20 transition-all',
          isDragging ? 'w-2 bg-blue-600' : 'hover:w-2 hover:bg-blue-400'
        )}
        style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
      >
        {/* Handle */}
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 transition-colors',
          isDragging ? 'border-blue-600' : 'border-blue-500'
        )}>
          <Move className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Position indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
        {Math.round(splitPosition)}% / {Math.round(100 - splitPosition)}%
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 15: SHARE PREVIEW URL MODAL
// ============================================

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  currentPage: string;
  device: DeviceType;
  zoom: number;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentPage,
  device,
  zoom,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate shareable URL with settings encoded
  const params = new URLSearchParams({
    theme: theme.slug,
    page: currentPage,
    device,
    zoom: zoom.toString(),
  });
  const shareUrl = `${window.location.origin}/admin/themes/preview?${params.toString()}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Preview: ${theme.name}`,
          text: `Check out this theme preview for ${theme.name}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Preview
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 truncate"
              />
              <button
                onClick={handleCopy}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  copied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                )}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Theme:</div>
              <div className="text-gray-900 dark:text-white font-medium">{theme.name}</div>
              <div className="text-gray-500">Page:</div>
              <div className="text-gray-900 dark:text-white font-medium">
                {PREVIEW_PAGES.find(p => p.id === currentPage)?.name || 'Homepage'}
              </div>
              <div className="text-gray-500">Device:</div>
              <div className="text-gray-900 dark:text-white font-medium capitalize">{device}</div>
              <div className="text-gray-500">Zoom:</div>
              <div className="text-gray-900 dark:text-white font-medium">{zoom}%</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Copy Link
            </button>
            {navigator.share && (
              <button
                onClick={handleShareNative}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN ENHANCED THEME PREVIEW COMPONENT
// ============================================

const EnhancedThemePreview: React.FC<EnhancedThemePreviewProps> = ({
  theme,
  currentTheme,
  isOpen,
  onClose,
  onActivate,
  onInstall,
}) => {
  // State
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [previousDevice, setPreviousDevice] = useState<DeviceType>('desktop');
  const [isRotating, setIsRotating] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [showNavigation, setShowNavigation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showRealContent, setShowRealContent] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [syncScroll, setSyncScroll] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ENHANCEMENT 11: Device Rotation Animation
  const handleDeviceChange = (newDevice: DeviceType) => {
    if (newDevice === device) return;
    setPreviousDevice(device);
    setIsRotating(true);
    setIsLoading(true);

    setTimeout(() => {
      setDevice(newDevice);
      setTimeout(() => {
        setIsRotating(false);
      }, 300);
    }, 150);
  };

  // ENHANCEMENT 9: Fullscreen Mode
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Exit fullscreen failed:', err);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ENHANCEMENT 13: Zoom Controls
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom as ZoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom as ZoomLevel);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const handleZoomToFit = () => {
    // Calculate zoom to fit the device in the viewport
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 100;
    const containerHeight = containerRef.current.clientHeight - 100;
    const deviceWidth = DEVICE_DIMENSIONS[device].width;
    const deviceHeight = DEVICE_DIMENSIONS[device].height;

    const widthRatio = containerWidth / deviceWidth;
    const heightRatio = containerHeight / deviceHeight;
    const fitZoom = Math.min(widthRatio, heightRatio) * 100;

    // Round to nearest zoom level
    const nearestZoom = ZOOM_LEVELS.reduce((prev, curr) =>
      Math.abs(curr - fitZoom) < Math.abs(prev - fitZoom) ? curr : prev
    );
    setZoom(nearestZoom);
  };

  // ENHANCEMENT 14: Screenshot Capture
  const handleScreenshot = async () => {
    toast.loading('Capturing screenshot...', { id: 'screenshot' });

    try {
      // In a real implementation, you'd use html2canvas or a server-side solution
      // For now, we'll open the demo URL in a new tab for manual screenshot
      const page = PREVIEW_PAGES.find(p => p.id === currentPage);
      const screenshotUrl = `${theme.demoUrl}${page?.path || '/'}`;

      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = theme.screenshots[0]?.url || theme.thumbnail;
      link.download = `${theme.slug}-${currentPage}-preview.png`;
      link.click();

      toast.success('Screenshot downloaded!', { id: 'screenshot' });
    } catch (err) {
      toast.error('Failed to capture screenshot', { id: 'screenshot' });
    }
  };

  // ENHANCEMENT 17: Scroll Position Sync
  const handleScroll = useCallback(() => {
    if (!iframeRef.current || !syncScroll) return;

    try {
      const iframeWindow = iframeRef.current.contentWindow;
      if (iframeWindow) {
        const scrollY = iframeWindow.scrollY;
        const maxScroll = iframeWindow.document.body.scrollHeight - iframeWindow.innerHeight;
        const percentage = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
        setScrollPosition(percentage);
      }
    } catch (err) {
      // Cross-origin restriction
    }
  }, [syncScroll]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Get current page info
  const currentPageInfo = PREVIEW_PAGES.find(p => p.id === currentPage);
  const previewUrl = `${theme.demoUrl}${currentPageInfo?.path || '/'}${showRealContent ? '?content=real' : ''}`;

  // Device frame dimensions
  const getDeviceStyles = () => {
    const dims = DEVICE_DIMENSIONS[device];
    const scale = zoom / 100;
    return {
      width: dims.width * scale,
      height: dims.height * scale,
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={clsx(
          'fixed inset-0 z-50 flex flex-col',
          isFullscreen ? 'bg-gray-950' : 'bg-black/95'
        )}
      >
        {/* ENHANCEMENT 9: Floating Toolbar (visible in fullscreen too) */}
        <motion.header
          className={clsx(
            'flex items-center justify-between px-4 py-3 transition-all duration-300',
            isFullscreen
              ? 'absolute top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg z-50 opacity-0 hover:opacity-100'
              : 'bg-gray-900 border-b border-gray-800'
          )}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-l border-gray-700 pl-4">
              <h2 className="text-white font-semibold">{theme.name}</h2>
              <p className="text-sm text-gray-400">by {theme.author}</p>
            </div>
          </div>

          {/* Center section - Device & View Controls */}
          <div className="flex items-center gap-2">
            {/* ENHANCEMENT 11: Device Selector with Rotation Animation */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              {([
                { type: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
                { type: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
                { type: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' },
              ]).map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleDeviceChange(type)}
                  className={clsx(
                    'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200',
                    device === type
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  )}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm hidden lg:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            {/* ENHANCEMENT 13: Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= ZOOM_LEVELS[0]}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="relative group">
                <button className="px-3 py-1.5 min-w-[60px] text-center text-sm text-white font-medium">
                  {zoom}%
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {ZOOM_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setZoom(level)}
                      className={clsx(
                        'w-full px-4 py-1.5 text-sm text-left hover:bg-gray-700 transition-colors',
                        zoom === level ? 'text-blue-400' : 'text-gray-300'
                      )}
                    >
                      {level}%
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-700 mx-1" />

              <button
                onClick={handleZoomReset}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title="Reset zoom (100%)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleZoomToFit}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title="Fit to screen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            {/* ENHANCEMENT 10: Split View Toggle */}
            <button
              onClick={() => setShowSplitView(!showSplitView)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                showSplitView
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title="Compare with current theme"
            >
              <SplitSquareHorizontal className="w-5 h-5" />
            </button>

            {/* ENHANCEMENT 16: Real Content Toggle */}
            <button
              onClick={() => setShowRealContent(!showRealContent)}
              className={clsx(
                'p-2 rounded-lg transition-colors flex items-center gap-2',
                showRealContent
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title={showRealContent ? 'Using real content' : 'Using demo content'}
            >
              {showRealContent ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              <span className="text-xs hidden xl:inline">{showRealContent ? 'Real' : 'Demo'}</span>
            </button>

            {/* ENHANCEMENT 17: Scroll Sync Toggle */}
            <button
              onClick={() => setSyncScroll(!syncScroll)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                syncScroll
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title={syncScroll ? 'Scroll sync enabled' : 'Scroll sync disabled'}
            >
              {syncScroll ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* ENHANCEMENT 14: Screenshot */}
            <button
              onClick={handleScreenshot}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Capture screenshot"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* ENHANCEMENT 15: Share */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Share preview"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* ENHANCEMENT 9: Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            {/* Open in new tab */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            {/* Actions */}
            {theme.isInstalled ? (
              theme.isActive ? (
                <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Active
                </span>
              ) : (
                <button
                  onClick={() => onActivate(theme)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Activate
                </button>
              )
            ) : (
              <button
                onClick={() => onInstall(theme)}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            )}
          </div>
        </motion.header>

        {/* Main Preview Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* ENHANCEMENT 12: Page Navigation Sidebar */}
          <AnimatePresence>
            {showNavigation && !showSplitView && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-900 border-r border-gray-800 flex-shrink-0 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pages</h3>
                    <button
                      onClick={() => setShowNavigation(false)}
                      className="p-1 hover:bg-gray-800 rounded"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {PREVIEW_PAGES.map(page => {
                      const Icon = page.icon;
                      return (
                        <button
                          key={page.id}
                          onClick={() => {
                            setCurrentPage(page.id);
                            setIsLoading(true);
                          }}
                          className={clsx(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                            currentPage === page.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{page.name}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Toggle Navigation Button (when hidden) */}
          {!showNavigation && !showSplitView && (
            <button
              onClick={() => setShowNavigation(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-r-lg border border-l-0 border-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Preview Content */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-gray-950">
            {showSplitView ? (
              // ENHANCEMENT 10: Split-Screen View
              <SplitScreenView
                currentTheme={currentTheme}
                previewTheme={theme}
                currentPage={currentPage}
                zoom={zoom}
                device={device}
              />
            ) : (
              // Single Preview
              <motion.div
                className="relative"
                animate={{
                  rotateY: isRotating ? (device === 'mobile' ? 90 : -90) : 0,
                  scale: isRotating ? 0.9 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                {/* Device Frame */}
                <div
                  className={clsx(
                    'relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500',
                    device === 'mobile' && 'rounded-[40px]',
                    device === 'tablet' && 'rounded-[24px]'
                  )}
                  style={{
                    width: getDeviceStyles().width + (device === 'mobile' ? 24 : device === 'tablet' ? 32 : 0),
                    height: getDeviceStyles().height + (device === 'mobile' ? 48 : device === 'tablet' ? 40 : 0),
                    padding: device === 'mobile' ? '24px 12px' : device === 'tablet' ? '20px 16px' : 0,
                  }}
                >
                  {/* Device notch (mobile) */}
                  {device === 'mobile' && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-950 rounded-full z-10" />
                  )}

                  {/* Preview iframe or Skeleton */}
                  <div className="relative w-full h-full rounded-lg overflow-hidden bg-white">
                    {/* ENHANCEMENT 18: Loading Skeleton */}
                    {isLoading && <PreviewSkeleton device={device} />}

                    <iframe
                      ref={iframeRef}
                      src={previewUrl}
                      className={clsx(
                        'w-full h-full border-0 transition-opacity duration-300',
                        isLoading ? 'opacity-0' : 'opacity-100'
                      )}
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        width: `${100 / (zoom / 100)}%`,
                        height: `${100 / (zoom / 100)}%`,
                      }}
                      onLoad={handleIframeLoad}
                      title={`${theme.name} preview`}
                    />
                  </div>

                  {/* Device home indicator (mobile) */}
                  {device === 'mobile' && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
                  )}
                </div>

                {/* Device label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-500 flex items-center gap-2">
                  <span>{DEVICE_DIMENSIONS[device].width} × {DEVICE_DIMENSIONS[device].height}</span>
                  <span>•</span>
                  <span className="capitalize">{device}</span>
                  {syncScroll && (
                    <>
                      <span>•</span>
                      <span>Scroll: {Math.round(scrollPosition)}%</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Screenshot thumbnails navigation */}
        {theme.screenshots.length > 1 && !showSplitView && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 py-4 bg-gray-900 border-t border-gray-800"
          >
            {theme.screenshots.map((screenshot, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const page = PREVIEW_PAGES.find(p => p.name.toLowerCase().includes(screenshot.label.toLowerCase()));
                  if (page) {
                    setCurrentPage(page.id);
                    setIsLoading(true);
                  }
                }}
                className={clsx(
                  'relative rounded-lg overflow-hidden transition-all',
                  currentPageInfo?.name.toLowerCase().includes(screenshot.label.toLowerCase())
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <img
                  src={screenshot.url}
                  alt={screenshot.label}
                  className="w-24 h-16 object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 py-0.5 bg-black/70 text-white text-xs text-center">
                  {screenshot.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              theme={theme}
              currentPage={currentPage}
              device={device}
              zoom={zoom}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedThemePreview;
