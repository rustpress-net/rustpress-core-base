/**
 * RustPress Plugin Details & Preview Components
 * Phase 2: Enhancements 11-20
 *
 * Enhancement 11: Plugin Details Modal
 * Enhancement 12: Screenshot/Media Gallery
 * Enhancement 13: Live Demo Preview
 * Enhancement 14: Feature Comparison Table
 * Enhancement 15: Changelog/Version History
 * Enhancement 16: Requirements & Compatibility Info
 * Enhancement 17: Related Plugins Section
 * Enhancement 18: FAQ Accordion
 * Enhancement 19: Documentation Links
 * Enhancement 20: Support/Contact Info
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Play,
  Pause,
  ExternalLink,
  Download,
  Star,
  Calendar,
  Clock,
  Users,
  Shield,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Book,
  FileText,
  Video,
  MessageCircle,
  Mail,
  Github,
  Globe,
  HelpCircle,
  Package,
  Cpu,
  Database,
  Server,
  RefreshCw,
  GitBranch,
  Tag,
  ArrowRight,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  Copy,
  CheckCircle2,
  XCircle,
  Minus,
  Puzzle,
  Zap,
  Image as ImageIcon,
  Code,
  Settings,
  Layers,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface PluginScreenshot {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  type: 'image' | 'video';
}

export interface PluginVersion {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed' | 'security';
    description: string;
  }[];
  isBreaking?: boolean;
}

export interface PluginRequirement {
  name: string;
  required: string;
  current: string;
  status: 'compatible' | 'warning' | 'incompatible';
}

export interface PluginFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PluginDoc {
  id: string;
  title: string;
  type: 'guide' | 'api' | 'tutorial' | 'video';
  url: string;
  description?: string;
}

export interface PluginSupport {
  email?: string;
  website?: string;
  github?: string;
  discord?: string;
  forum?: string;
  responseTime?: string;
}

export interface PluginFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  tier?: 'free' | 'pro' | 'enterprise';
}

export interface PluginDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  version: string;
  author: {
    name: string;
    url?: string;
    avatar?: string;
    verified?: boolean;
  };
  rating: number;
  reviewCount: number;
  downloads: number;
  lastUpdated: string;
  category: string;
  tags: string[];
  isOfficial?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isRustPlugin?: boolean;
  price?: string;
  screenshots: PluginScreenshot[];
  versions: PluginVersion[];
  requirements: PluginRequirement[];
  features: PluginFeature[];
  faqs: PluginFAQ[];
  docs: PluginDoc[];
  support: PluginSupport;
  relatedPlugins: string[];
  demoUrl?: string;
}

// ============================================================================
// Enhancement 11: Plugin Details Modal
// ============================================================================

interface PluginDetailsModalProps {
  plugin: PluginDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall?: (plugin: PluginDetailData) => void;
  relatedPluginsData?: PluginDetailData[];
}

export function PluginDetailsModal({
  plugin,
  isOpen,
  onClose,
  onInstall,
  relatedPluginsData = [],
}: PluginDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'changelog' | 'faq' | 'support'>('overview');
  const [isInstalling, setIsInstalling] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab('overview');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleInstall = useCallback(async () => {
    if (!plugin || isInstalling) return;
    setIsInstalling(true);
    try {
      await onInstall?.(plugin);
    } finally {
      setIsInstalling(false);
    }
  }, [plugin, isInstalling, onInstall]);

  if (!plugin) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'screenshots', label: 'Screenshots', icon: ImageIcon, count: plugin.screenshots.length },
    { id: 'changelog', label: 'Changelog', icon: GitBranch, count: plugin.versions.length },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, count: plugin.faqs.length },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full max-w-5xl max-h-[90vh]',
              'bg-white dark:bg-neutral-900',
              'rounded-2xl shadow-2xl',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-4 p-6">
                {/* Plugin Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center',
                    plugin.isRustPlugin
                      ? 'bg-gradient-to-br from-orange-500 to-red-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  )}
                >
                  <Puzzle className="w-8 h-8 text-white" />
                </div>

                {/* Plugin Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {plugin.name}
                    </h2>
                    {plugin.isOfficial && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                        Official
                      </span>
                    )}
                    {plugin.isVerified && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {plugin.isRustPlugin && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                        Rust
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {plugin.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {plugin.rating.toFixed(1)}
                      </span>
                      <span className="text-neutral-500">({plugin.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Download className="w-4 h-4" />
                      <span>{plugin.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Calendar className="w-4 h-4" />
                      <span>v{plugin.version}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl',
                      'text-sm font-medium',
                      'bg-primary-600 hover:bg-primary-700',
                      'text-white',
                      'transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {isInstalling ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {plugin.isPremium ? plugin.price : 'Install'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className={cn(
                      'p-2 rounded-xl',
                      'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      'transition-colors'
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-6 -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium',
                        'border-b-2 transition-colors',
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {'count' in tab && tab.count > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-neutral-200 dark:bg-neutral-700">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {/* Long Description */}
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                        {plugin.longDescription}
                      </p>
                    </div>

                    {/* Features */}
                    <FeatureComparisonTable features={plugin.features} />

                    {/* Requirements */}
                    <RequirementsInfo requirements={plugin.requirements} />

                    {/* Related Plugins */}
                    {relatedPluginsData.length > 0 && (
                      <RelatedPlugins
                        plugins={relatedPluginsData}
                        onSelect={(p) => console.log('Selected related plugin:', p.id)}
                      />
                    )}

                    {/* Documentation Links */}
                    <DocumentationLinks docs={plugin.docs} />
                  </motion.div>
                )}

                {activeTab === 'screenshots' && (
                  <motion.div
                    key="screenshots"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ScreenshotGallery screenshots={plugin.screenshots} />
                    {plugin.demoUrl && <LiveDemoPreview demoUrl={plugin.demoUrl} pluginName={plugin.name} />}
                  </motion.div>
                )}

                {activeTab === 'changelog' && (
                  <motion.div
                    key="changelog"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ChangelogHistory versions={plugin.versions} />
                  </motion.div>
                )}

                {activeTab === 'faq' && (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <FAQAccordion faqs={plugin.faqs} />
                  </motion.div>
                )}

                {activeTab === 'support' && (
                  <motion.div
                    key="support"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <SupportContactInfo
                      support={plugin.support}
                      author={plugin.author}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Enhancement 12: Screenshot/Media Gallery
// ============================================================================

interface ScreenshotGalleryProps {
  screenshots: PluginScreenshot[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeScreenshot = screenshots[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
        <p className="text-neutral-500">No screenshots available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Screenshots & Media
      </h3>

      {/* Main Preview */}
      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden group">
        {activeScreenshot.type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={activeScreenshot.url}
              className="w-full h-full object-contain"
              controls={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-neutral-900 ml-1" />
                </div>
              </button>
            )}
          </div>
        ) : (
          <img
            src={activeScreenshot.url}
            alt={activeScreenshot.caption}
            className="w-full h-full object-contain"
          />
        )}

        {/* Navigation Arrows */}
        {screenshots.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2',
                'w-10 h-10 rounded-full',
                'bg-white/90 dark:bg-neutral-800/90',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity shadow-lg'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2',
                'w-10 h-10 rounded-full',
                'bg-white/90 dark:bg-neutral-800/90',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity shadow-lg'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className={cn(
            'absolute top-4 right-4',
            'w-10 h-10 rounded-full',
            'bg-white/90 dark:bg-neutral-800/90',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity shadow-lg'
          )}
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Caption */}
        {activeScreenshot.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white text-sm">{activeScreenshot.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {screenshots.map((screenshot, index) => (
          <button
            key={screenshot.id}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden',
              'border-2 transition-colors',
              index === activeIndex
                ? 'border-primary-500'
                : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
            )}
          >
            <img
              src={screenshot.thumbnail}
              alt={screenshot.caption}
              className="w-full h-full object-cover"
            />
            {screenshot.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:text-neutral-300"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 p-2 text-white hover:text-neutral-300"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={activeScreenshot.url}
              alt={activeScreenshot.caption}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 p-2 text-white hover:text-neutral-300"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === activeIndex ? 'bg-white' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 13: Live Demo Preview
// ============================================================================

interface LiveDemoPreviewProps {
  demoUrl: string;
  pluginName: string;
}

export function LiveDemoPreview({ demoUrl, pluginName }: LiveDemoPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = demoUrl;
    }
  };

  const handleOpenExternal = () => {
    window.open(demoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <Play className="w-5 h-5" />
          Live Demo
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={cn(
              'p-2 rounded-lg',
              'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
            title="Refresh demo"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'p-2 rounded-lg',
              'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleOpenExternal}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              'text-sm font-medium',
              'text-neutral-600 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </button>
        </div>
      </div>

      <div
        className={cn(
          'relative rounded-xl overflow-hidden',
          'border border-neutral-200 dark:border-neutral-700',
          'bg-neutral-100 dark:bg-neutral-800',
          isExpanded ? 'h-[600px]' : 'h-[400px]',
          'transition-all duration-300'
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 z-10">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
              <p className="text-sm text-neutral-500">Loading demo...</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={demoUrl}
          onLoad={handleLoad}
          title={`${pluginName} Demo`}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
        <Info className="w-3 h-3" />
        This demo runs in a sandboxed environment. Some features may be limited.
      </p>
    </div>
  );
}

// ============================================================================
// Enhancement 14: Feature Comparison Table
// ============================================================================

interface FeatureComparisonTableProps {
  features: PluginFeature[];
  comparePlugins?: { name: string; features: PluginFeature[] }[];
}

export function FeatureComparisonTable({ features, comparePlugins }: FeatureComparisonTableProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const displayedFeatures = showAllFeatures ? features : features.slice(0, 6);

  const tierColors = {
    free: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    pro: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    enterprise: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <Layers className="w-5 h-5" />
        Features
      </h3>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600 dark:text-neutral-300">
                Feature
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-300 w-24">
                Included
              </th>
              {comparePlugins?.map((plugin) => (
                <th
                  key={plugin.name}
                  className="px-4 py-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-300 w-24"
                >
                  {plugin.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {displayedFeatures.map((feature) => (
              <tr key={feature.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {feature.name}
                    </span>
                    {feature.tier && (
                      <span className={cn('px-1.5 py-0.5 text-xs rounded-full', tierColors[feature.tier])}>
                        {feature.tier}
                      </span>
                    )}
                  </div>
                  {feature.description && (
                    <p className="text-xs text-neutral-500 mt-0.5">{feature.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {feature.included ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 mx-auto" />
                  )}
                </td>
                {comparePlugins?.map((plugin) => {
                  const matchingFeature = plugin.features.find((f) => f.id === feature.id);
                  return (
                    <td key={plugin.name} className="px-4 py-3 text-center">
                      {matchingFeature?.included ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {features.length > 6 && (
        <button
          onClick={() => setShowAllFeatures(!showAllFeatures)}
          className={cn(
            'flex items-center gap-2 mx-auto',
            'text-sm font-medium text-primary-600 dark:text-primary-400',
            'hover:text-primary-700 dark:hover:text-primary-300'
          )}
        >
          {showAllFeatures ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all {features.length} features
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Enhancement 15: Changelog/Version History
// ============================================================================

interface ChangelogHistoryProps {
  versions: PluginVersion[];
}

export function ChangelogHistory({ versions }: ChangelogHistoryProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([versions[0]?.version]));

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );

  const changeTypeConfig = {
    added: { label: 'Added', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30', icon: PlusIcon },
    changed: { label: 'Changed', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30', icon: RefreshCw },
    fixed: { label: 'Fixed', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30', icon: Zap },
    removed: { label: 'Removed', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30', icon: Minus },
    security: { label: 'Security', color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30', icon: Shield },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        Version History
      </h3>

      <div className="space-y-3">
        {versions.map((version, index) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = index === 0;

          return (
            <div
              key={version.version}
              className={cn(
                'rounded-xl border overflow-hidden',
                version.isBreaking
                  ? 'border-red-200 dark:border-red-900/50'
                  : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              <button
                onClick={() => toggleVersion(version.version)}
                className={cn(
                  'w-full flex items-center justify-between p-4',
                  'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                  'transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono font-medium text-neutral-900 dark:text-white">
                      v{version.version}
                    </span>
                  </div>
                  {isLatest && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                      Latest
                    </span>
                  )}
                  {version.isBreaking && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Breaking
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500">{version.date}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      {version.changes.map((change, changeIndex) => {
                        const config = changeTypeConfig[change.type];
                        const Icon = config.icon;
                        return (
                          <div key={changeIndex} className="flex items-start gap-3">
                            <span
                              className={cn(
                                'flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full',
                                config.color
                              )}
                            >
                              {config.label}
                            </span>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              {change.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 16: Requirements & Compatibility Info
// ============================================================================

interface RequirementsInfoProps {
  requirements: PluginRequirement[];
}

export function RequirementsInfo({ requirements }: RequirementsInfoProps) {
  const statusConfig = {
    compatible: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    incompatible: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  };

  const allCompatible = requirements.every((r) => r.status === 'compatible');
  const hasIncompatible = requirements.some((r) => r.status === 'incompatible');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <Server className="w-5 h-5" />
          Requirements
        </h3>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
            allCompatible
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : hasIncompatible
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
          )}
        >
          {allCompatible ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              All requirements met
            </>
          ) : hasIncompatible ? (
            <>
              <XCircle className="w-4 h-4" />
              Incompatible
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              Some warnings
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {requirements.map((req) => {
          const config = statusConfig[req.status];
          const Icon = config.icon;

          return (
            <div
              key={req.name}
              className={cn(
                'flex items-center justify-between p-4 rounded-xl border',
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-5 h-5', config.color)} />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{req.name}</p>
                  <p className="text-xs text-neutral-500">Required: {req.required}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{req.current}</p>
                <p className="text-xs text-neutral-500">Installed</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 17: Related Plugins Section
// ============================================================================

interface RelatedPluginsProps {
  plugins: PluginDetailData[];
  onSelect: (plugin: PluginDetailData) => void;
}

export function RelatedPlugins({ plugins, onSelect }: RelatedPluginsProps) {
  if (plugins.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <Puzzle className="w-5 h-5" />
        Related Plugins
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.slice(0, 3).map((plugin) => (
          <motion.button
            key={plugin.id}
            onClick={() => onSelect(plugin)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl',
              'text-left',
              'border border-neutral-200 dark:border-neutral-700',
              'hover:border-primary-300 dark:hover:border-primary-700',
              'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              'transition-all'
            )}
          >
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                plugin.isRustPlugin
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-primary-100 dark:bg-primary-900/30'
              )}
            >
              <Puzzle
                className={cn(
                  'w-5 h-5',
                  plugin.isRustPlugin
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-primary-600 dark:text-primary-400'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {plugin.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {plugin.rating.toFixed(1)}
                </div>
                <span className="text-neutral-300 dark:text-neutral-600">·</span>
                <span className="text-xs text-neutral-500">
                  {plugin.downloads.toLocaleString()} downloads
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-1" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 18: FAQ Accordion
// ============================================================================

interface FAQAccordionProps {
  faqs: PluginFAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
        <p className="text-neutral-500">No FAQs available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <HelpCircle className="w-5 h-5" />
        Frequently Asked Questions
      </h3>

      <div className="space-y-2">
        {faqs.map((faq) => {
          const isOpen = openIds.has(faq.id);

          return (
            <div
              key={faq.id}
              className={cn(
                'rounded-xl border overflow-hidden',
                'border-neutral-200 dark:border-neutral-700',
                isOpen && 'ring-2 ring-primary-500/20'
              )}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className={cn(
                  'w-full flex items-center justify-between p-4',
                  'text-left',
                  'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                  'transition-colors'
                )}
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 19: Documentation Links
// ============================================================================

interface DocumentationLinksProps {
  docs: PluginDoc[];
}

export function DocumentationLinks({ docs }: DocumentationLinksProps) {
  const docTypeConfig = {
    guide: { icon: Book, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    api: { icon: Code, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
    tutorial: { icon: FileText, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
    video: { icon: Video, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
  };

  if (docs.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <Book className="w-5 h-5" />
        Documentation
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docs.map((doc) => {
          const config = docTypeConfig[doc.type];
          const Icon = config.icon;

          return (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl',
                'border border-neutral-200 dark:border-neutral-700',
                'hover:border-primary-300 dark:hover:border-primary-700',
                'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                'transition-all group'
              )}
            >
              <div className={cn('flex-shrink-0 p-2 rounded-lg', config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {doc.title}
                  </p>
                  <ExternalLink className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {doc.description && (
                  <p className="text-xs text-neutral-500 mt-1">{doc.description}</p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 20: Support/Contact Info
// ============================================================================

interface SupportContactInfoProps {
  support: PluginSupport;
  author: PluginDetailData['author'];
}

export function SupportContactInfo({ support, author }: SupportContactInfoProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    if (support.email) {
      await navigator.clipboard.writeText(support.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const supportChannels = [
    support.email && {
      type: 'email',
      icon: Mail,
      label: 'Email Support',
      value: support.email,
      action: handleCopyEmail,
      actionIcon: copiedEmail ? Check : Copy,
      actionLabel: copiedEmail ? 'Copied!' : 'Copy',
    },
    support.website && {
      type: 'website',
      icon: Globe,
      label: 'Support Website',
      value: support.website,
      href: support.website,
    },
    support.github && {
      type: 'github',
      icon: Github,
      label: 'GitHub Issues',
      value: support.github,
      href: support.github,
    },
    support.discord && {
      type: 'discord',
      icon: MessageCircle,
      label: 'Discord Community',
      value: 'Join Discord',
      href: support.discord,
    },
    support.forum && {
      type: 'forum',
      icon: Users,
      label: 'Community Forum',
      value: 'Visit Forum',
      href: support.forum,
    },
  ].filter(Boolean) as Array<{
    type: string;
    icon: React.ElementType;
    label: string;
    value: string;
    href?: string;
    action?: () => void;
    actionIcon?: React.ElementType;
    actionLabel?: string;
  }>;

  return (
    <div className="space-y-6">
      {/* Author Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Developer
        </h3>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {author.name}
              </p>
              {author.verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            {author.url && (
              <a
                href={author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mt-1"
              >
                <Globe className="w-3 h-3" />
                Visit website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Support Channels
        </h3>

        {support.responseTime && (
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4" />
            Average response time: <span className="font-medium">{support.responseTime}</span>
          </div>
        )}

        <div className="space-y-2">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;

            if (channel.href) {
              return (
                <a
                  key={channel.type}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl',
                    'border border-neutral-200 dark:border-neutral-700',
                    'hover:border-primary-300 dark:hover:border-primary-700',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                    'transition-all group'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {channel.label}
                      </p>
                      <p className="text-xs text-neutral-500">{channel.value}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                </a>
              );
            }

            const ActionIcon = channel.actionIcon;

            return (
              <div
                key={channel.type}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl',
                  'border border-neutral-200 dark:border-neutral-700'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {channel.label}
                    </p>
                    <p className="text-xs text-neutral-500">{channel.value}</p>
                  </div>
                </div>
                {channel.action && ActionIcon && (
                  <button
                    onClick={channel.action}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                      'text-sm font-medium',
                      'text-neutral-600 dark:text-neutral-300',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      'transition-colors'
                    )}
                  >
                    <ActionIcon className="w-4 h-4" />
                    {channel.actionLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Help */}
      <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
              Need Help?
            </p>
            <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
              Check the documentation first for common issues. If you're still stuck, reach out through any of the support channels above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sample Data for Testing
// ============================================================================

export const samplePluginDetail: PluginDetailData = {
  id: 'yoast-seo-clone',
  name: 'RustPress SEO',
  slug: 'rustpress-seo',
  description: 'Complete SEO solution for RustPress with real-time analysis',
  longDescription: `RustPress SEO is a comprehensive search engine optimization plugin that helps you improve your website's visibility in search results.

Key Features:
• Real-time content analysis with readability scoring
• XML sitemap generation with automatic updates
• Meta title and description optimization
• Social media preview cards (Open Graph & Twitter)
• Schema.org structured data support
• Breadcrumb navigation
• Canonical URL management
• Redirect manager for 301/302 redirects
• Integration with Google Search Console
• Performance-optimized for minimal overhead

Whether you're a beginner or an SEO expert, RustPress SEO provides all the tools you need to optimize your content and improve your search rankings.`,
  version: '2.5.0',
  author: {
    name: 'RustPress Team',
    url: 'https://rustpress.dev',
    avatar: '/avatars/rustpress-team.png',
    verified: true,
  },
  rating: 4.8,
  reviewCount: 2547,
  downloads: 156000,
  lastUpdated: '2024-01-15',
  category: 'seo',
  tags: ['seo', 'optimization', 'sitemap', 'meta', 'schema'],
  isOfficial: true,
  isVerified: true,
  isRustPlugin: true,
  screenshots: [
    {
      id: '1',
      url: '/screenshots/seo-dashboard.png',
      thumbnail: '/screenshots/seo-dashboard-thumb.png',
      caption: 'SEO Dashboard with real-time analysis',
      type: 'image',
    },
    {
      id: '2',
      url: '/screenshots/seo-editor.png',
      thumbnail: '/screenshots/seo-editor-thumb.png',
      caption: 'Content editor with SEO suggestions',
      type: 'image',
    },
    {
      id: '3',
      url: '/screenshots/seo-sitemap.png',
      thumbnail: '/screenshots/seo-sitemap-thumb.png',
      caption: 'Automatic XML sitemap generation',
      type: 'image',
    },
    {
      id: '4',
      url: '/videos/seo-demo.mp4',
      thumbnail: '/screenshots/seo-video-thumb.png',
      caption: 'Watch the full feature demo',
      type: 'video',
    },
  ],
  versions: [
    {
      version: '2.5.0',
      date: 'January 15, 2024',
      changes: [
        { type: 'added', description: 'AI-powered content suggestions for better SEO' },
        { type: 'added', description: 'Google Search Console integration' },
        { type: 'changed', description: 'Improved readability analysis algorithm' },
        { type: 'fixed', description: 'Sitemap generation for large sites (10k+ pages)' },
        { type: 'security', description: 'Updated dependencies to patch CVE-2024-1234' },
      ],
    },
    {
      version: '2.4.0',
      date: 'December 1, 2023',
      changes: [
        { type: 'added', description: 'Schema.org Recipe and FAQ markup' },
        { type: 'changed', description: 'Redesigned settings interface' },
        { type: 'fixed', description: 'Meta description truncation issue' },
      ],
    },
    {
      version: '2.3.0',
      date: 'October 15, 2023',
      isBreaking: true,
      changes: [
        { type: 'changed', description: 'BREAKING: New database schema requires migration' },
        { type: 'added', description: 'Redirect manager with bulk import' },
        { type: 'removed', description: 'Deprecated legacy sitemap format' },
      ],
    },
  ],
  requirements: [
    { name: 'RustPress', required: '>=1.0.0', current: '1.2.0', status: 'compatible' },
    { name: 'Rust', required: '>=1.70', current: '1.75', status: 'compatible' },
    { name: 'Database', required: 'PostgreSQL 14+', current: 'PostgreSQL 15', status: 'compatible' },
    { name: 'Memory', required: '256MB', current: '512MB', status: 'compatible' },
  ],
  features: [
    { id: 'analysis', name: 'Content Analysis', description: 'Real-time SEO and readability analysis', included: true, tier: 'free' },
    { id: 'sitemap', name: 'XML Sitemaps', description: 'Automatic sitemap generation', included: true, tier: 'free' },
    { id: 'meta', name: 'Meta Optimization', description: 'Title and description management', included: true, tier: 'free' },
    { id: 'social', name: 'Social Cards', description: 'Open Graph and Twitter cards', included: true, tier: 'free' },
    { id: 'schema', name: 'Schema Markup', description: 'Structured data support', included: true, tier: 'pro' },
    { id: 'redirects', name: 'Redirect Manager', description: '301/302 redirect management', included: true, tier: 'pro' },
    { id: 'ai', name: 'AI Suggestions', description: 'AI-powered content recommendations', included: true, tier: 'enterprise' },
    { id: 'gsc', name: 'Search Console', description: 'Google Search Console integration', included: true, tier: 'enterprise' },
  ],
  faqs: [
    {
      id: '1',
      question: 'How do I configure the XML sitemap?',
      answer: 'Go to RustPress SEO > Sitemaps in your admin panel. You can configure which post types and taxonomies to include, set the priority and change frequency for each, and exclude specific pages if needed.',
    },
    {
      id: '2',
      question: 'Will this plugin slow down my site?',
      answer: 'No! RustPress SEO is written in Rust and optimized for performance. The analysis happens asynchronously and sitemaps are cached. Most operations complete in under 10ms.',
    },
    {
      id: '3',
      question: 'Can I use this with other SEO plugins?',
      answer: 'We recommend using only one SEO plugin at a time to avoid conflicts. However, RustPress SEO can import settings from other popular SEO plugins during setup.',
    },
    {
      id: '4',
      question: 'How do I set up redirects?',
      answer: 'Navigate to RustPress SEO > Redirects. Click "Add Redirect" and enter the source URL and destination URL. You can choose between 301 (permanent) and 302 (temporary) redirects.',
    },
  ],
  docs: [
    { id: '1', title: 'Getting Started Guide', type: 'guide', url: '#', description: 'Complete setup and configuration walkthrough' },
    { id: '2', title: 'API Reference', type: 'api', url: '#', description: 'Hooks, filters, and REST API documentation' },
    { id: '3', title: 'Video Tutorial Series', type: 'video', url: '#', description: 'Step-by-step video guides for all features' },
    { id: '4', title: 'Schema Markup Tutorial', type: 'tutorial', url: '#', description: 'How to implement structured data' },
  ],
  support: {
    email: 'support@rustpress.dev',
    website: 'https://rustpress.dev/support',
    github: 'https://github.com/rustpress/seo/issues',
    discord: 'https://discord.gg/rustpress',
    forum: 'https://community.rustpress.dev',
    responseTime: '24-48 hours',
  },
  relatedPlugins: ['analytics-pro', 'cache-master', 'security-shield'],
  demoUrl: 'https://demo.rustpress.dev/seo',
};

export default PluginDetailsModal;
