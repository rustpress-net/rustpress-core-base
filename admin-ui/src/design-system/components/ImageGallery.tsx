/**
 * RustPress Image Gallery Component
 * Grid/masonry layouts with lightbox, zoom, and navigation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Grid,
  LayoutGrid,
  Maximize2,
  RotateCw,
  Info,
  Heart,
  Trash2,
  Edit3,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface GalleryImage {
  id: string;
  src: string;
  thumbnail?: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  tags?: string[];
  metadata?: Record<string, string>;
  favorite?: boolean;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'justified';
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  enableLightbox?: boolean;
  enableZoom?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  enableFavorite?: boolean;
  enableDelete?: boolean;
  enableEdit?: boolean;
  showTitles?: boolean;
  showOverlayOnHover?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  onImageClick?: (image: GalleryImage, index: number) => void;
  onFavorite?: (image: GalleryImage) => void;
  onDelete?: (image: GalleryImage) => void;
  onEdit?: (image: GalleryImage) => void;
  onDownload?: (image: GalleryImage) => void;
  onShare?: (image: GalleryImage) => void;
  className?: string;
}

export interface LightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  enableZoom?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  onDownload?: (image: GalleryImage) => void;
  onShare?: (image: GalleryImage) => void;
}

// ============================================================================
// Lightbox Component
// ============================================================================

export function Lightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  enableZoom = true,
  enableDownload = true,
  enableShare = true,
  onDownload,
  onShare,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
          handleRotate();
          break;
        case 'i':
          setShowInfo((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, zoom]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetTransform();
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetTransform();
  }, [images.length]);

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (enableZoom) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-75">
              {currentIndex + 1} / {images.length}
            </span>
            {currentImage.title && (
              <span className="font-medium">{currentImage.title}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {enableZoom && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={handleRotate}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Rotate (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                'p-2 hover:bg-white/10 rounded-lg transition-colors',
                showInfo && 'bg-white/20'
              )}
              title="Info (I)"
            >
              <Info className="w-5 h-5" />
            </button>

            {enableDownload && (
              <button
                onClick={() => onDownload?.(currentImage)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {enableShare && (
              <button
                onClick={() => onShare?.(currentImage)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Area */}
        <div
          ref={imageRef}
          className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <motion.img
            key={currentImage.id}
            src={currentImage.src}
            alt={currentImage.alt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-h-full max-w-full object-contain select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
            draggable={false}
          />

          {/* Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-4 top-4 bottom-4 w-80 bg-black/80 backdrop-blur-sm rounded-lg p-4 overflow-auto"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {currentImage.title || 'Image Details'}
                </h3>

                {currentImage.description && (
                  <p className="text-sm text-neutral-300 mb-4">
                    {currentImage.description}
                  </p>
                )}

                <div className="space-y-3 text-sm">
                  {currentImage.width && currentImage.height && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Dimensions</span>
                      <span className="text-white">
                        {currentImage.width} x {currentImage.height}
                      </span>
                    </div>
                  )}

                  {currentImage.tags && currentImage.tags.length > 0 && (
                    <div>
                      <span className="text-neutral-400 block mb-2">Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {currentImage.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-white/10 rounded text-xs text-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentImage.metadata &&
                    Object.entries(currentImage.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-neutral-400 capitalize">{key}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    resetTransform();
                  }}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all',
                    index === currentIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  )}
                >
                  <img
                    src={image.thumbnail || image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Gallery Image Item Component
// ============================================================================

interface GalleryItemProps {
  image: GalleryImage;
  index: number;
  aspectRatio: 'square' | 'video' | 'portrait' | 'auto';
  showTitle?: boolean;
  showOverlayOnHover?: boolean;
  selectable?: boolean;
  selected?: boolean;
  enableFavorite?: boolean;
  enableDelete?: boolean;
  enableEdit?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  onFavorite?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

function GalleryItem({
  image,
  aspectRatio,
  showTitle,
  showOverlayOnHover = true,
  selectable,
  selected,
  enableFavorite,
  enableDelete,
  enableEdit,
  onClick,
  onSelect,
  onFavorite,
  onDelete,
  onEdit,
}: GalleryItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative group rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800',
        aspectRatioClasses[aspectRatio],
        selected && 'ring-2 ring-primary-500'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <img
        src={image.thumbnail || image.src}
        alt={image.alt}
        className={cn(
          'w-full h-full object-cover transition-all duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          isHovered && 'scale-105'
        )}
        onLoad={() => setIsLoaded(true)}
        onClick={onClick}
      />

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
      )}

      {/* Selection Checkbox */}
      {selectable && (
        <div
          className={cn(
            'absolute top-2 left-2 z-10 transition-opacity',
            isHovered || selected ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
              selected
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'bg-white/80 border-neutral-300 hover:border-primary-500'
            )}
          >
            {selected && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Hover Overlay */}
      {showOverlayOnHover && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
            'transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Actions */}
          <div className="absolute top-2 right-2 flex gap-1">
            {enableFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.();
                }}
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  image.favorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-neutral-700 hover:bg-white'
                )}
              >
                <Heart className={cn('w-4 h-4', image.favorite && 'fill-current')} />
              </button>
            )}

            {enableEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1.5 rounded-full bg-white/80 text-neutral-700 hover:bg-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {enableDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 rounded-full bg-white/80 text-neutral-700 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Title & Expand */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
            {showTitle && image.title && (
              <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                {image.title}
              </span>
            )}
            <button
              onClick={onClick}
              className="p-1.5 rounded-full bg-white/80 text-neutral-700 hover:bg-white transition-colors flex-shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Image Gallery Component
// ============================================================================

export function ImageGallery({
  images,
  layout = 'grid',
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 4,
  aspectRatio = 'square',
  enableLightbox = true,
  enableZoom = true,
  enableDownload = true,
  enableShare = true,
  enableFavorite = false,
  enableDelete = false,
  enableEdit = false,
  showTitles = false,
  showOverlayOnHover = true,
  selectable = false,
  selectedIds = [],
  onSelect,
  onImageClick,
  onFavorite,
  onDelete,
  onEdit,
  onDownload,
  onShare,
  className,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (image: GalleryImage, index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
    onImageClick?.(image, index);
  };

  const handleSelect = (imageId: string) => {
    if (onSelect) {
      const newSelected = selectedIds.includes(imageId)
        ? selectedIds.filter((id) => id !== imageId)
        : [...selectedIds, imageId];
      onSelect(newSelected);
    }
  };

  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, minmax(0, 1fr))`;
    }
    return undefined;
  };

  const getGridClasses = () => {
    if (typeof columns === 'object') {
      const { sm = 2, md = 3, lg = 4, xl = 5 } = columns;
      return `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`;
    }
    return '';
  };

  const renderGrid = () => (
    <div
      className={cn('grid', getGridClasses(), className)}
      style={{
        gridTemplateColumns: getGridColumns(),
        gap: `${gap * 4}px`,
      }}
    >
      {images.map((image, index) => (
        <GalleryItem
          key={image.id}
          image={image}
          index={index}
          aspectRatio={aspectRatio}
          showTitle={showTitles}
          showOverlayOnHover={showOverlayOnHover}
          selectable={selectable}
          selected={selectedIds.includes(image.id)}
          enableFavorite={enableFavorite}
          enableDelete={enableDelete}
          enableEdit={enableEdit}
          onClick={() => handleImageClick(image, index)}
          onSelect={() => handleSelect(image.id)}
          onFavorite={() => onFavorite?.(image)}
          onDelete={() => onDelete?.(image)}
          onEdit={() => onEdit?.(image)}
        />
      ))}
    </div>
  );

  const renderMasonry = () => {
    const cols = typeof columns === 'number' ? columns : columns.lg || 4;
    const columnArrays: GalleryImage[][] = Array.from({ length: cols }, () => []);

    images.forEach((image, index) => {
      columnArrays[index % cols].push(image);
    });

    return (
      <div
        className={cn('flex', className)}
        style={{ gap: `${gap * 4}px` }}
      >
        {columnArrays.map((columnImages, colIndex) => (
          <div
            key={colIndex}
            className="flex-1 flex flex-col"
            style={{ gap: `${gap * 4}px` }}
          >
            {columnImages.map((image) => {
              const originalIndex = images.findIndex((img) => img.id === image.id);
              return (
                <GalleryItem
                  key={image.id}
                  image={image}
                  index={originalIndex}
                  aspectRatio="auto"
                  showTitle={showTitles}
                  showOverlayOnHover={showOverlayOnHover}
                  selectable={selectable}
                  selected={selectedIds.includes(image.id)}
                  enableFavorite={enableFavorite}
                  enableDelete={enableDelete}
                  enableEdit={enableEdit}
                  onClick={() => handleImageClick(image, originalIndex)}
                  onSelect={() => handleSelect(image.id)}
                  onFavorite={() => onFavorite?.(image)}
                  onDelete={() => onDelete?.(image)}
                  onEdit={() => onEdit?.(image)}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {layout === 'masonry' ? renderMasonry() : renderGrid()}

      {enableLightbox && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          enableZoom={enableZoom}
          enableDownload={enableDownload}
          enableShare={enableShare}
          onDownload={onDownload}
          onShare={onShare}
        />
      )}
    </>
  );
}

// ============================================================================
// Gallery Toolbar Component
// ============================================================================

export interface GalleryToolbarProps {
  layout: 'grid' | 'masonry' | 'justified';
  onLayoutChange: (layout: 'grid' | 'masonry' | 'justified') => void;
  selectedCount?: number;
  totalCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onDeleteSelected?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function GalleryToolbar({
  layout,
  onLayoutChange,
  selectedCount = 0,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  children,
  className,
}: GalleryToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 bg-white dark:bg-neutral-900',
        'border-b border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Layout Toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => onLayoutChange('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              layout === 'grid'
                ? 'bg-white dark:bg-neutral-700 shadow-sm'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutChange('masonry')}
            className={cn(
              'p-2 rounded transition-colors',
              layout === 'masonry'
                ? 'bg-white dark:bg-neutral-700 shadow-sm'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
            title="Masonry View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Count */}
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} images`}
        </span>

        {/* Selection Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onDeselectAll}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Deselect all
            </button>
            {onDeleteSelected && (
              <button
                onClick={onDeleteSelected}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete selected
              </button>
            )}
          </div>
        )}

        {selectedCount === 0 && onSelectAll && (
          <button
            onClick={onSelectAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Select all
          </button>
        )}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ============================================================================
// Simple Image Grid (simplified version)
// ============================================================================

export interface SimpleImageGridProps {
  images: Array<{ src: string; alt: string }>;
  columns?: number;
  gap?: number;
  onClick?: (index: number) => void;
  className?: string;
}

export function SimpleImageGrid({
  images,
  columns = 3,
  gap = 2,
  onClick,
  className,
}: SimpleImageGridProps) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`,
      }}
    >
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onClick?.(index)}
          className="relative aspect-square rounded-lg overflow-hidden group"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </button>
      ))}
    </div>
  );
}

export default ImageGallery;
