import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Zap,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Eye,
  Crop,
  Maximize2,
  FileImage,
  HardDrive,
  Palette,
  Sliders,
  Copy,
  ExternalLink,
  Info,
  TrendingDown,
  Layers
} from 'lucide-react';
import clsx from 'clsx';

interface ImageInfo {
  id: string;
  src: string;
  alt: string;
  title?: string;
  originalSize: number;
  optimizedSize?: number;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'gif' | 'webp' | 'avif' | 'svg';
  status: 'optimized' | 'unoptimized' | 'processing' | 'error';
  issues: ImageIssue[];
  lazyLoad: boolean;
  responsive: boolean;
  srcset?: string[];
}

interface ImageIssue {
  type: 'no-alt' | 'large-size' | 'wrong-format' | 'oversized' | 'no-dimensions' | 'not-responsive' | 'no-lazy';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface OptimizationSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'original' | 'webp' | 'avif' | 'auto';
  generateSrcset: boolean;
  lazyLoadAll: boolean;
  preserveMetadata: boolean;
  autoOptimize: boolean;
}

interface ImageOptimizerProps {
  images?: ImageInfo[];
  content?: string; // HTML content to extract images from
  onOptimize?: (imageId: string, settings: OptimizationSettings) => void;
  onUpdateAlt?: (imageId: string, alt: string) => void;
  onUpdateImage?: (imageId: string, updates: Partial<ImageInfo>) => void;
  className?: string;
}

// Function to extract images from HTML content
function extractImagesFromContent(html: string): ImageInfo[] {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imgElements = doc.querySelectorAll('img');

  const images: ImageInfo[] = [];

  imgElements.forEach((img, index) => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    const title = img.getAttribute('title') || undefined;
    const width = parseInt(img.getAttribute('width') || '0') || 800;
    const height = parseInt(img.getAttribute('height') || '0') || 600;
    const srcset = img.getAttribute('srcset');
    const loading = img.getAttribute('loading');

    // Determine format from src
    const extension = src.split('.').pop()?.toLowerCase().split('?')[0] || 'jpeg';
    const format = (['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(extension)
      ? (extension === 'jpg' ? 'jpeg' : extension)
      : 'jpeg') as ImageInfo['format'];

    // Estimate size based on dimensions and format
    const estimatedSize = width * height * (format === 'png' ? 4 : format === 'gif' ? 3 : 0.3);

    // Detect issues
    const issues: ImageIssue[] = [];

    if (!alt) {
      issues.push({
        type: 'no-alt',
        severity: 'error',
        message: 'Missing alt text for accessibility',
        suggestion: 'Add descriptive alt text to improve accessibility and SEO'
      });
    }

    if (estimatedSize > 500000) {
      issues.push({
        type: 'large-size',
        severity: 'warning',
        message: `Image may be large (~${(estimatedSize / 1024 / 1024).toFixed(1)}MB)`,
        suggestion: 'Consider compressing or resizing the image'
      });
    }

    if (format === 'png' && !src.includes('logo') && !src.includes('icon')) {
      issues.push({
        type: 'wrong-format',
        severity: 'info',
        message: 'PNG could be converted to WebP for smaller size',
        suggestion: 'Convert to WebP for 25-35% smaller file size'
      });
    }

    if (loading !== 'lazy' && index > 0) {
      issues.push({
        type: 'no-lazy',
        severity: 'info',
        message: 'Lazy loading not enabled',
        suggestion: 'Enable lazy loading for below-fold images'
      });
    }

    if (!srcset && width > 600) {
      issues.push({
        type: 'not-responsive',
        severity: 'warning',
        message: 'No responsive srcset defined',
        suggestion: 'Add srcset for better mobile performance'
      });
    }

    images.push({
      id: `img-${index}-${Date.now()}`,
      src,
      alt,
      title,
      originalSize: Math.round(estimatedSize),
      width,
      height,
      format,
      status: issues.some(i => i.severity === 'error') ? 'unoptimized' : 'optimized',
      issues,
      lazyLoad: loading === 'lazy',
      responsive: !!srcset,
      srcset: srcset ? srcset.split(',').map(s => s.trim().split(' ')[1] || '') : undefined
    });
  });

  return images;
}

const mockImages: ImageInfo[] = [
  {
    id: 'img1',
    src: '/uploads/hero-banner.jpg',
    alt: 'Modern web development workspace',
    title: 'Hero Banner',
    originalSize: 2456789,
    optimizedSize: 345678,
    width: 1920,
    height: 1080,
    format: 'jpeg',
    status: 'optimized',
    issues: [],
    lazyLoad: true,
    responsive: true,
    srcset: ['480w', '768w', '1024w', '1920w']
  },
  {
    id: 'img2',
    src: '/uploads/screenshot-large.png',
    alt: '',
    originalSize: 4567890,
    width: 2560,
    height: 1440,
    format: 'png',
    status: 'unoptimized',
    issues: [
      { type: 'no-alt', severity: 'error', message: 'Missing alt text', suggestion: 'Add descriptive alt text for accessibility' },
      { type: 'large-size', severity: 'warning', message: 'Image is 4.4MB, exceeds 500KB limit', suggestion: 'Compress or resize the image' },
      { type: 'wrong-format', severity: 'info', message: 'PNG could be converted to WebP for 60% smaller size', suggestion: 'Convert to WebP format' }
    ],
    lazyLoad: false,
    responsive: false
  },
  {
    id: 'img3',
    src: '/uploads/icon-set.svg',
    alt: 'Application icons',
    originalSize: 45678,
    width: 200,
    height: 200,
    format: 'svg',
    status: 'optimized',
    issues: [],
    lazyLoad: false,
    responsive: true
  },
  {
    id: 'img4',
    src: '/uploads/product-photo.jpeg',
    alt: 'Product showcase image',
    originalSize: 1234567,
    optimizedSize: 234567,
    width: 1200,
    height: 800,
    format: 'jpeg',
    status: 'optimized',
    issues: [
      { type: 'no-lazy', severity: 'info', message: 'Lazy loading not enabled', suggestion: 'Enable lazy loading for below-fold images' }
    ],
    lazyLoad: false,
    responsive: true,
    srcset: ['400w', '800w', '1200w']
  },
  {
    id: 'img5',
    src: '/uploads/animated-banner.gif',
    alt: 'Animated feature demonstration',
    originalSize: 5678901,
    width: 800,
    height: 600,
    format: 'gif',
    status: 'unoptimized',
    issues: [
      { type: 'large-size', severity: 'error', message: 'GIF is 5.4MB - extremely large', suggestion: 'Convert to video or WebP animation' },
      { type: 'wrong-format', severity: 'warning', message: 'GIF is inefficient for animations', suggestion: 'Use MP4/WebM video or animated WebP' }
    ],
    lazyLoad: true,
    responsive: false
  }
];

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  images: providedImages,
  content,
  onOptimize,
  onUpdateAlt,
  onUpdateImage,
  className
}) => {
  // Extract images from content if provided, otherwise use provided images or mock
  const images = useMemo(() => {
    if (content) {
      const extracted = extractImagesFromContent(content);
      return extracted.length > 0 ? extracted : mockImages;
    }
    return providedImages || mockImages;
  }, [content, providedImages]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [settings, setSettings] = useState<OptimizationSettings>({
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'auto',
    generateSrcset: true,
    lazyLoadAll: true,
    preserveMetadata: false,
    autoOptimize: true
  });

  const stats = useMemo(() => {
    const totalOriginal = images.reduce((acc, img) => acc + img.originalSize, 0);
    const totalOptimized = images.reduce((acc, img) => acc + (img.optimizedSize || img.originalSize), 0);
    const savings = totalOriginal - totalOptimized;
    const savingsPercent = totalOriginal > 0 ? ((savings / totalOriginal) * 100).toFixed(1) : 0;
    const issueCount = images.reduce((acc, img) => acc + img.issues.length, 0);
    const optimizedCount = images.filter(img => img.status === 'optimized').length;

    return { totalOriginal, totalOptimized, savings, savingsPercent, issueCount, optimizedCount };
  }, [images]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOptimizeAll = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
  };

  const getFormatColor = (format: ImageInfo['format']) => {
    switch (format) {
      case 'jpeg': return 'bg-orange-100 text-orange-700';
      case 'png': return 'bg-blue-100 text-blue-700';
      case 'gif': return 'bg-purple-100 text-purple-700';
      case 'webp': return 'bg-green-100 text-green-700';
      case 'avif': return 'bg-cyan-100 text-cyan-700';
      case 'svg': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <Image size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Image Optimizer</h2>
            <p className="text-sm text-gray-500">Optimize images for better performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOptimizeAll}
            disabled={isOptimizing}
            className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Zap size={14} className={clsx(isOptimizing && 'animate-pulse')} />
            {isOptimizing ? 'Optimizing...' : 'Optimize All'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-amber-100 text-amber-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 divide-x border-b bg-gray-50 dark:bg-gray-800/50">
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{images.length}</div>
          <div className="text-xs text-gray-500">Images</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold text-green-600">{stats.optimizedCount}</div>
          <div className="text-xs text-gray-500">Optimized</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold">{formatBytes(stats.totalOriginal)}</div>
          <div className="text-xs text-gray-500">Original</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold text-green-600">{formatBytes(stats.savings)}</div>
          <div className="text-xs text-gray-500">Saved ({stats.savingsPercent}%)</div>
        </div>
        <div className="p-3 text-center">
          <div className={clsx('text-lg font-bold', stats.issueCount > 0 ? 'text-amber-600' : 'text-green-600')}>
            {stats.issueCount}
          </div>
          <div className="text-xs text-gray-500">Issues</div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Quality</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.quality}
                      onChange={(e) => setSettings({ ...settings, quality: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{settings.quality}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Max Width</label>
                  <input
                    type="number"
                    value={settings.maxWidth}
                    onChange={(e) => setSettings({ ...settings, maxWidth: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Max Height</label>
                  <input
                    type="number"
                    value={settings.maxHeight}
                    onChange={(e) => setSettings({ ...settings, maxHeight: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Output Format</label>
                  <select
                    value={settings.format}
                    onChange={(e) => setSettings({ ...settings, format: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="original">Original</option>
                    <option value="webp">WebP</option>
                    <option value="avif">AVIF</option>
                    <option value="auto">Auto (Best)</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.generateSrcset}
                    onChange={(e) => setSettings({ ...settings, generateSrcset: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Generate srcset</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lazyLoadAll}
                    onChange={(e) => setSettings({ ...settings, lazyLoadAll: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Enable lazy loading</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoOptimize}
                    onChange={(e) => setSettings({ ...settings, autoOptimize: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Auto-optimize on upload</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Images List */}
      <div className="max-h-[400px] overflow-y-auto divide-y">
        {images.map((image, idx) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={clsx(
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              image.issues.length > 0 && 'bg-amber-50/50 dark:bg-amber-900/10'
            )}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id)}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage size={24} className="text-gray-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate" title={image.src}>
                      {image.src.split('/').pop()}
                    </span>
                    <span className={clsx('px-2 py-0.5 text-xs rounded uppercase', getFormatColor(image.format))}>
                      {image.format}
                    </span>
                    {image.status === 'optimized' && (
                      <CheckCircle size={14} className="text-green-500" />
                    )}
                    {image.status === 'processing' && (
                      <RefreshCw size={14} className="text-blue-500 animate-spin" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Maximize2 size={12} />
                      {image.width} x {image.height}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} />
                      {formatBytes(image.originalSize)}
                      {image.optimizedSize && (
                        <span className="text-green-600">
                          → {formatBytes(image.optimizedSize)}
                          <TrendingDown size={12} className="inline ml-1" />
                        </span>
                      )}
                    </span>
                    {image.responsive && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Layers size={12} />
                        Responsive
                      </span>
                    )}
                  </div>

                  {/* Alt Text */}
                  {editingAlt === image.id ? (
                    <input
                      type="text"
                      defaultValue={image.alt}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                      onBlur={(e) => {
                        setEditingAlt(null);
                        onUpdateAlt?.(image.id, e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingAlt(null);
                          onUpdateAlt?.(image.id, e.currentTarget.value);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className={clsx(
                        'text-xs',
                        image.alt ? 'text-gray-600' : 'text-red-500 italic'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAlt(image.id);
                      }}
                    >
                      Alt: {image.alt || 'Missing - click to add'}
                    </div>
                  )}

                  {/* Issues */}
                  {image.issues.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {image.issues.map((issue, i) => (
                        <span
                          key={i}
                          className={clsx(
                            'px-2 py-0.5 text-xs rounded',
                            issue.severity === 'error' && 'bg-red-100 text-red-700',
                            issue.severity === 'warning' && 'bg-amber-100 text-amber-700',
                            issue.severity === 'info' && 'bg-blue-100 text-blue-700'
                          )}
                          title={issue.message}
                        >
                          {issue.type.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOptimize?.(image.id, settings);
                    }}
                    className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center gap-1"
                    disabled={image.status === 'optimized'}
                  >
                    <Zap size={12} />
                    Optimize
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedImage === image.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {/* Srcset */}
                    {image.srcset && image.srcset.length > 0 && (
                      <div>
                        <label className="text-xs text-gray-600 block mb-2">Responsive Sizes (srcset)</label>
                        <div className="flex flex-wrap gap-2">
                          {image.srcset.map((size, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Issues Detail */}
                    {image.issues.length > 0 && (
                      <div className="space-y-2">
                        {image.issues.map((issue, i) => (
                          <div
                            key={i}
                            className={clsx(
                              'p-3 rounded-lg text-sm',
                              issue.severity === 'error' && 'bg-red-100 dark:bg-red-900/20',
                              issue.severity === 'warning' && 'bg-amber-100 dark:bg-amber-900/20',
                              issue.severity === 'info' && 'bg-blue-100 dark:bg-blue-900/20'
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium">
                              <AlertTriangle size={14} />
                              {issue.message}
                            </div>
                            {issue.suggestion && (
                              <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
                                <Zap size={12} />
                                {issue.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 flex items-center gap-1">
                        <Crop size={12} />
                        Crop
                      </button>
                      <button className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 flex items-center gap-1">
                        <Sliders size={12} />
                        Adjust
                      </button>
                      <button className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 flex items-center gap-1">
                        <Download size={12} />
                        Download
                      </button>
                      <button className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 flex items-center gap-1">
                        <Copy size={12} />
                        Copy URL
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="p-4 border-t bg-green-50 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-200">
            <strong>Optimization Tips:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Use WebP format for 25-35% smaller file sizes</li>
              <li>Always add descriptive alt text for accessibility</li>
              <li>Enable lazy loading for images below the fold</li>
              <li>Use srcset for responsive images on different devices</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageOptimizer;
