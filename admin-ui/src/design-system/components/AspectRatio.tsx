/**
 * AspectRatio Component (Enhancement #92)
 * Maintains consistent aspect ratios for responsive content
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface AspectRatioProps {
  ratio?: number | string;
  children: React.ReactNode;
  className?: string;
}

export interface ResponsiveAspectRatioProps {
  ratios: {
    default: number | string;
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
  };
  children: React.ReactNode;
  className?: string;
}

export interface ImageAspectRatioProps {
  src: string;
  alt: string;
  ratio?: number | string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export interface VideoAspectRatioProps {
  src: string;
  ratio?: number | string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
}

export interface IframeAspectRatioProps {
  src: string;
  title: string;
  ratio?: number | string;
  allowFullScreen?: boolean;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export interface PlaceholderAspectRatioProps {
  ratio?: number | string;
  animate?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const parseRatio = (ratio: number | string): number => {
  if (typeof ratio === 'number') return ratio;

  // Handle common ratio strings like "16/9", "4:3", "16x9"
  const separators = ['/', ':', 'x', '-'];
  for (const sep of separators) {
    if (ratio.includes(sep)) {
      const [width, height] = ratio.split(sep).map(Number);
      if (width && height) return width / height;
    }
  }

  // Handle named ratios
  const namedRatios: Record<string, number> = {
    square: 1,
    portrait: 3 / 4,
    landscape: 4 / 3,
    video: 16 / 9,
    cinema: 21 / 9,
    ultrawide: 32 / 9,
    golden: 1.618,
    a4: 1 / 1.414,
  };

  return namedRatios[ratio.toLowerCase()] || 1;
};

const calculatePaddingBottom = (ratio: number | string): string => {
  const numericRatio = parseRatio(ratio);
  return `${(1 / numericRatio) * 100}%`;
};

// ============================================================================
// AspectRatio Component
// ============================================================================

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, children, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative w-full ${className}`}
        style={{ paddingBottom: calculatePaddingBottom(ratio) }}
      >
        <div className="absolute inset-0">
          {children}
        </div>
      </div>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';

// ============================================================================
// Responsive AspectRatio Component
// ============================================================================

export function ResponsiveAspectRatio({
  ratios,
  children,
  className = '',
}: ResponsiveAspectRatioProps) {
  // Generate CSS custom properties for each breakpoint
  const style: React.CSSProperties & { [key: string]: string } = {
    '--aspect-ratio-default': calculatePaddingBottom(ratios.default),
  };

  if (ratios.sm) style['--aspect-ratio-sm'] = calculatePaddingBottom(ratios.sm);
  if (ratios.md) style['--aspect-ratio-md'] = calculatePaddingBottom(ratios.md);
  if (ratios.lg) style['--aspect-ratio-lg'] = calculatePaddingBottom(ratios.lg);
  if (ratios.xl) style['--aspect-ratio-xl'] = calculatePaddingBottom(ratios.xl);

  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        ...style,
        paddingBottom: 'var(--aspect-ratio-default)',
      }}
    >
      <style>{`
        @media (min-width: 640px) {
          .responsive-aspect-ratio { padding-bottom: var(--aspect-ratio-sm, var(--aspect-ratio-default)) !important; }
        }
        @media (min-width: 768px) {
          .responsive-aspect-ratio { padding-bottom: var(--aspect-ratio-md, var(--aspect-ratio-sm, var(--aspect-ratio-default))) !important; }
        }
        @media (min-width: 1024px) {
          .responsive-aspect-ratio { padding-bottom: var(--aspect-ratio-lg, var(--aspect-ratio-md, var(--aspect-ratio-sm, var(--aspect-ratio-default)))) !important; }
        }
        @media (min-width: 1280px) {
          .responsive-aspect-ratio { padding-bottom: var(--aspect-ratio-xl, var(--aspect-ratio-lg, var(--aspect-ratio-md, var(--aspect-ratio-sm, var(--aspect-ratio-default))))) !important; }
        }
      `}</style>
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Image AspectRatio Component
// ============================================================================

export function ImageAspectRatio({
  src,
  alt,
  ratio = '16/9',
  objectFit = 'cover',
  objectPosition = 'center',
  fallback,
  onLoad,
  onError,
  className = '',
}: ImageAspectRatioProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  return (
    <AspectRatio ratio={ratio} className={className}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      )}

      {hasError ? (
        fallback || (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            absolute inset-0 w-full h-full
            transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          style={{
            objectFit,
            objectPosition,
          }}
        />
      )}
    </AspectRatio>
  );
}

// ============================================================================
// Video AspectRatio Component
// ============================================================================

export function VideoAspectRatio({
  src,
  ratio = '16/9',
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  className = '',
}: VideoAspectRatioProps) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
      />
    </AspectRatio>
  );
}

// ============================================================================
// Iframe AspectRatio Component
// ============================================================================

export function IframeAspectRatio({
  src,
  title,
  ratio = '16/9',
  allowFullScreen = true,
  loading = 'lazy',
  className = '',
}: IframeAspectRatioProps) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <iframe
        src={src}
        title={title}
        allowFullScreen={allowFullScreen}
        loading={loading}
        className="absolute inset-0 w-full h-full border-0"
      />
    </AspectRatio>
  );
}

// ============================================================================
// Placeholder AspectRatio Component
// ============================================================================

export function PlaceholderAspectRatio({
  ratio = '16/9',
  animate = true,
  className = '',
}: PlaceholderAspectRatioProps) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <motion.div
        className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700"
        animate={animate ? {
          opacity: [0.5, 1, 0.5],
        } : undefined}
        transition={animate ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : undefined}
      />
    </AspectRatio>
  );
}

// ============================================================================
// Common Ratio Presets
// ============================================================================

export const AspectRatioPresets = {
  // Common video ratios
  video: 16 / 9,
  cinema: 21 / 9,
  widescreen: 16 / 10,
  standard: 4 / 3,

  // Photo ratios
  photo35mm: 3 / 2,
  photoSquare: 1,
  photoPortrait: 4 / 5,

  // Social media
  instagramSquare: 1,
  instagramPortrait: 4 / 5,
  instagramLandscape: 1.91,
  twitterCard: 1200 / 628,
  facebookPost: 1200 / 630,
  youtubeThumb: 16 / 9,

  // Print
  a4Portrait: 1 / 1.414,
  a4Landscape: 1.414,
  letterPortrait: 8.5 / 11,
  letterLandscape: 11 / 8.5,

  // Special
  golden: 1.618,
  ultrawide: 32 / 9,
  superUltrawide: 32 / 10,
};

// ============================================================================
// Constrained AspectRatio Component
// ============================================================================

export interface ConstrainedAspectRatioProps extends AspectRatioProps {
  maxWidth?: string | number;
  maxHeight?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
}

export function ConstrainedAspectRatio({
  ratio = 1,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  children,
  className = '',
}: ConstrainedAspectRatioProps) {
  const style: React.CSSProperties = {};

  if (maxWidth) style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  if (maxHeight) style.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  if (minWidth) style.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
  if (minHeight) style.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  return (
    <div style={style} className="w-full">
      <AspectRatio ratio={ratio} className={className}>
        {children}
      </AspectRatio>
    </div>
  );
}

// ============================================================================
// Gallery AspectRatio Component
// ============================================================================

export interface GalleryItem {
  src: string;
  alt: string;
  ratio?: number | string;
}

export interface GalleryAspectRatioProps {
  items: GalleryItem[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  defaultRatio?: number | string;
  className?: string;
}

export function GalleryAspectRatio({
  items,
  columns = 3,
  gap = 'md',
  defaultRatio = '1/1',
  className = '',
}: GalleryAspectRatioProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {items.map((item, index) => (
        <ImageAspectRatio
          key={index}
          src={item.src}
          alt={item.alt}
          ratio={item.ratio || defaultRatio}
          className="rounded-lg overflow-hidden"
        />
      ))}
    </div>
  );
}

export default AspectRatio;
