/**
 * Media Components
 * Images, videos, galleries, and media display elements
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Download, Share2, Heart, RotateCw, Image as ImageIcon,
  Film, Music, FileText, File, Loader, AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. RESPONSIVE IMAGE
// ============================================

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  aspectRatio = 'auto',
  fit = 'cover',
  rounded = 'md',
  fallback,
  loading = 'lazy',
  onClick,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatios = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]',
    'auto': '',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const fitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  if (hasError) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800',
          aspectRatios[aspectRatio],
          roundedClasses[rounded]
        )}
        style={{ width, height }}
      >
        {fallback || (
          <div className="text-center text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Failed to load image</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        aspectRatios[aspectRatio],
        roundedClasses[rounded],
        onClick && 'cursor-pointer'
      )}
      style={{ width, height }}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={clsx('w-full h-full transition-opacity', fitClasses[fit], isLoading && 'opacity-0')}
      />
    </div>
  );
}

// ============================================
// 2. AVATAR
// ============================================

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  badge?: React.ReactNode;
  onClick?: () => void;
}

export function Avatar({ src, name, size = 'md', status, badge, onClick }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={clsx('relative inline-flex', onClick && 'cursor-pointer')} onClick={onClick}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} className={clsx('rounded-full object-cover', sizes[size])} />
      ) : (
        <div
          className={clsx(
            'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium',
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
      {badge && (
        <span className="absolute -top-1 -right-1">{badge}</span>
      )}
    </div>
  );
}

// ============================================
// 3. AVATAR GROUP
// ============================================

export interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapClasses = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div className="flex items-center">
      {displayed.map((avatar, idx) => (
        <div key={idx} className={clsx(idx > 0 && overlapClasses[size])}>
          <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={clsx(
            'rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center font-medium text-sm',
            size === 'sm' && 'w-8 h-8 -ml-2',
            size === 'md' && 'w-10 h-10 -ml-3',
            size === 'lg' && 'w-12 h-12 -ml-4'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ============================================
// 4. IMAGE GALLERY
// ============================================

export interface ImageGalleryProps {
  images: Array<{ src: string; alt?: string; caption?: string }>;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  lightbox?: boolean;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 'md',
  lightbox = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <>
      <div className={clsx('grid', gridCols[columns], gapClasses[gap])}>
        {images.map((image, idx) => (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => lightbox && setSelectedIndex(idx)}
          >
            <img
              src={image.src}
              alt={image.alt || ''}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-sm text-white truncate">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(Math.max(0, selectedIndex - 1));
              }}
              disabled={selectedIndex === 0}
              className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(Math.min(images.length - 1, selectedIndex + 1));
              }}
              disabled={selectedIndex === images.length - 1}
              className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt || ''}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images[selectedIndex].caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-lg">
                <p className="text-white text-center">{images[selectedIndex].caption}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// 5. VIDEO PLAYER
// ============================================

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  aspectRatio = '16:9',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const aspectRatios = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  return (
    <div
      className={clsx('relative bg-black rounded-xl overflow-hidden group', aspectRatios[aspectRatio])}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(!isPlaying)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain"
      />

      {controls && (
        <div
          className={clsx(
            'absolute inset-0 flex flex-col justify-end transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Center play button */}
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </button>

          {/* Bottom controls */}
          <div className="bg-gradient-to-t from-black/70 to-transparent p-4">
            {/* Progress bar */}
            <div
              className="h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-white/80">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={toggleMute} className="text-white hover:text-white/80">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="text-white hover:text-white/80"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 6. AUDIO PLAYER
// ============================================

export interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  cover?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export function AudioPlayer({
  src,
  title,
  artist,
  cover,
  variant = 'default',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer" onClick={handleSeek}>
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {cover && <img src={cover} alt="" className="w-12 h-12 rounded object-cover" />}
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium text-gray-900 dark:text-white truncate">{title}</p>}
          {artist && <p className="text-sm text-gray-500 truncate">{artist}</p>}
        </div>
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="flex items-center gap-4">
        {cover && <img src={cover} alt="" className="w-16 h-16 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium text-gray-900 dark:text-white">{title}</p>}
          {artist && <p className="text-sm text-gray-500">{artist}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{formatTime(duration)}</span>
          </div>
        </div>
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

// ============================================
// 7. FILE PREVIEW
// ============================================

export interface FilePreviewProps {
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size?: string;
  preview?: string;
  onRemove?: () => void;
  onDownload?: () => void;
}

export function FilePreview({
  name,
  type,
  size,
  preview,
  onRemove,
  onDownload,
}: FilePreviewProps) {
  const icons = {
    image: <ImageIcon className="w-6 h-6" />,
    video: <Film className="w-6 h-6" />,
    audio: <Music className="w-6 h-6" />,
    document: <FileText className="w-6 h-6" />,
    other: <File className="w-6 h-6" />,
  };

  const colors = {
    image: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    video: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    audio: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    document: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    other: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {preview && type === 'image' ? (
        <img src={preview} alt="" className="w-12 h-12 rounded object-cover" />
      ) : (
        <div className={clsx('w-12 h-12 rounded flex items-center justify-center', colors[type])}>
          {icons[type]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{name}</p>
        {size && <p className="text-sm text-gray-500">{size}</p>}
      </div>
      <div className="flex items-center gap-1">
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// 8. IMAGE WITH ZOOM
// ============================================

export interface ZoomableImageProps {
  src: string;
  alt: string;
  maxZoom?: number;
}

export function ZoomableImage({ src, alt, maxZoom = 3 }: ZoomableImageProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(maxZoom, Math.max(1, prev + delta)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoom > 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * (zoom - 1) * -100;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * (zoom - 1) * -100;
      setPosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg cursor-zoom-in"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto transition-transform"
        style={{
          transform: `scale(${zoom}) translate(${position.x}%, ${position.y}%)`,
        }}
      />
      {zoom > 1 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
          <ZoomIn className="w-3 h-3" />
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}

// ============================================
// 9. CAROUSEL
// ============================================

export interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function Carousel({
  items,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {items.map((item, idx) => (
          <div key={idx} className="w-full flex-shrink-0">
            {item}
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors',
                idx === current ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 10. LOGO
// ============================================

export interface LogoProps {
  src?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export function Logo({ src, text, size = 'md', href }: LogoProps) {
  const sizes = {
    sm: { img: 'h-6', text: 'text-lg' },
    md: { img: 'h-8', text: 'text-xl' },
    lg: { img: 'h-10', text: 'text-2xl' },
    xl: { img: 'h-12', text: 'text-3xl' },
  };

  const content = (
    <div className="flex items-center gap-2">
      {src && <img src={src} alt="" className={clsx(sizes[size].img, 'w-auto')} />}
      {text && (
        <span className={clsx('font-bold text-gray-900 dark:text-white', sizes[size].text)}>
          {text}
        </span>
      )}
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}

// ============================================
// 11. ICON BOX
// ============================================

export interface IconBoxProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  rounded?: 'md' | 'lg' | 'xl' | 'full';
}

export function IconBox({ icon, size = 'md', variant = 'default', rounded = 'lg' }: IconBoxProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    secondary: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400',
  };

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-center',
        sizes[size],
        variants[variant],
        roundedClasses[rounded]
      )}
    >
      {icon}
    </div>
  );
}

// ============================================
// 12. THUMBNAIL
// ============================================

export interface ThumbnailProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  badge?: React.ReactNode;
  playButton?: boolean;
  onClick?: () => void;
}

export function Thumbnail({
  src,
  alt,
  size = 'md',
  badge,
  playButton,
  onClick,
}: ThumbnailProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={clsx(
        'relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800',
        sizes[size],
        onClick && 'cursor-pointer group'
      )}
      onClick={onClick}
    >
      <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
      {playButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 text-gray-900 ml-0.5" />
          </div>
        </div>
      )}
      {badge && (
        <div className="absolute top-1 right-1">{badge}</div>
      )}
    </div>
  );
}
