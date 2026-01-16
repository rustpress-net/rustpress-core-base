import { useState, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image,
  Grid,
  LayoutGrid,
  Rows,
  Columns,
  Square,
  Settings,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Share2,
  Heart,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Move,
  Upload,
} from 'lucide-react'
import clsx from 'clsx'

interface GalleryImage {
  id: string
  src: string
  alt?: string
  caption?: string
  width: number
  height: number
}

interface GalleryGridProps {
  images?: GalleryImage[]
  layout?: GalleryLayout
  columns?: number
  gap?: number
  borderRadius?: number
  aspectRatio?: 'original' | 'square' | '4:3' | '16:9' | '3:2'
  showCaptions?: boolean
  enableLightbox?: boolean
  enableHoverEffects?: boolean
  hoverEffect?: 'zoom' | 'fade' | 'slide' | 'blur' | 'none'
  onImageClick?: (image: GalleryImage, index: number) => void
  onImagesChange?: (images: GalleryImage[]) => void
  editable?: boolean
  className?: string
  content?: string
}

type GalleryLayout = 'grid' | 'masonry' | 'justified' | 'mosaic' | 'carousel'

interface GallerySettings {
  layout: GalleryLayout
  columns: number
  gap: number
  borderRadius: number
  aspectRatio: 'original' | 'square' | '4:3' | '16:9' | '3:2'
  showCaptions: boolean
  enableLightbox: boolean
  enableHoverEffects: boolean
  hoverEffect: 'zoom' | 'fade' | 'slide' | 'blur' | 'none'
  lightboxTransition: 'fade' | 'slide' | 'zoom'
}

const defaultSettings: GallerySettings = {
  layout: 'masonry',
  columns: 3,
  gap: 16,
  borderRadius: 8,
  aspectRatio: 'original',
  showCaptions: true,
  enableLightbox: true,
  enableHoverEffects: true,
  hoverEffect: 'zoom',
  lightboxTransition: 'fade',
}

const layoutIcons = {
  grid: <Grid className="w-4 h-4" />,
  masonry: <LayoutGrid className="w-4 h-4" />,
  justified: <Rows className="w-4 h-4" />,
  mosaic: <Square className="w-4 h-4" />,
  carousel: <Columns className="w-4 h-4" />,
}

const defaultImages: GalleryImage[] = [
  { id: '1', src: 'https://via.placeholder.com/400', alt: 'Image 1', width: 400, height: 300 },
  { id: '2', src: 'https://via.placeholder.com/400', alt: 'Image 2', width: 400, height: 300 },
]

export default function GalleryGrid({
  images: propImages,
  layout: propLayout,
  columns: propColumns,
  gap: propGap,
  borderRadius: propBorderRadius,
  aspectRatio: propAspectRatio,
  showCaptions: propShowCaptions,
  enableLightbox: propEnableLightbox,
  enableHoverEffects: propEnableHoverEffects,
  hoverEffect: propHoverEffect,
  onImageClick,
  onImagesChange,
  editable = false,
  className,
}: GalleryGridProps) {
  const images = propImages ?? defaultImages
  const [settings, setSettings] = useState<GallerySettings>({
    ...defaultSettings,
    layout: propLayout || defaultSettings.layout,
    columns: propColumns || defaultSettings.columns,
    gap: propGap ?? defaultSettings.gap,
    borderRadius: propBorderRadius ?? defaultSettings.borderRadius,
    aspectRatio: propAspectRatio || defaultSettings.aspectRatio,
    showCaptions: propShowCaptions ?? defaultSettings.showCaptions,
    enableLightbox: propEnableLightbox ?? defaultSettings.enableLightbox,
    enableHoverEffects: propEnableHoverEffects ?? defaultSettings.enableHoverEffects,
    hoverEffect: propHoverEffect || defaultSettings.hoverEffect,
  })

  const [showSettings, setShowSettings] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate masonry layout
  const masonryColumns = useMemo(() => {
    if (settings.layout !== 'masonry') return null

    const cols: GalleryImage[][] = Array.from({ length: settings.columns }, () => [])
    const colHeights = Array(settings.columns).fill(0)

    images.forEach(image => {
      const shortestCol = colHeights.indexOf(Math.min(...colHeights))
      cols[shortestCol].push(image)
      colHeights[shortestCol] += image.height / image.width
    })

    return cols
  }, [images, settings.columns, settings.layout])

  // Calculate mosaic layout
  const mosaicLayout = useMemo(() => {
    if (settings.layout !== 'mosaic') return null

    const patterns = [
      [{ cols: 2, rows: 2 }, { cols: 1, rows: 1 }, { cols: 1, rows: 1 }],
      [{ cols: 1, rows: 1 }, { cols: 1, rows: 1 }, { cols: 2, rows: 2 }],
      [{ cols: 1, rows: 2 }, { cols: 1, rows: 1 }, { cols: 1, rows: 1 }],
    ]

    return images.map((_, index) => {
      const patternIndex = Math.floor(index / 4) % patterns.length
      const positionIndex = index % 4
      const pattern = patterns[patternIndex]

      if (positionIndex < pattern.length) {
        return pattern[positionIndex]
      }
      return { cols: 1, rows: 1 }
    })
  }, [images, settings.layout])

  const getAspectRatioClass = () => {
    if (settings.aspectRatio === 'original') return ''
    const ratioMap = {
      square: 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '16:9': 'aspect-[16/9]',
      '3:2': 'aspect-[3/2]',
    }
    return ratioMap[settings.aspectRatio] || ''
  }

  const getHoverEffectClass = () => {
    if (!settings.enableHoverEffects || settings.hoverEffect === 'none') return ''

    const effectMap = {
      zoom: 'group-hover:scale-110',
      fade: 'group-hover:opacity-80',
      slide: 'group-hover:translate-y-[-4px]',
      blur: 'group-hover:blur-sm',
    }
    return effectMap[settings.hoverEffect] || ''
  }

  const handleImageClick = (image: GalleryImage, index: number) => {
    if (settings.enableLightbox) {
      setLightboxIndex(index)
    }
    onImageClick?.(image, index)
  }

  const handleDragStart = (index: number) => {
    if (!editable) return
    setIsDragging(true)
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!editable || dragIndex === null) return
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!editable || dragIndex === null) return
    e.preventDefault()

    const newImages = [...images]
    const [draggedImage] = newImages.splice(dragIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    onImagesChange?.(newImages)
    setIsDragging(false)
    setDragIndex(null)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange?.(newImages)
  }

  const renderImage = (image: GalleryImage, index: number, style?: React.CSSProperties) => (
    <motion.div
      key={image.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={clsx(
        'group relative overflow-hidden cursor-pointer',
        getAspectRatioClass()
      )}
      style={{
        borderRadius: settings.borderRadius,
        ...style,
      }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={() => handleImageClick(image, index)}
      draggable={editable}
      onDragStart={() => handleDragStart(index)}
      onDragOver={e => handleDragOver(e, index)}
      onDrop={e => handleDrop(e, index)}
    >
      <img
        src={image.src}
        alt={image.alt || `Gallery image ${index + 1}`}
        className={clsx(
          'w-full h-full object-cover transition-all duration-300',
          getHoverEffectClass()
        )}
        loading="lazy"
      />

      {/* Hover Overlay */}
      {settings.enableHoverEffects && hoveredIndex === index && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            {settings.showCaptions && image.caption && (
              <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <Eye className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Caption */}
      {settings.showCaptions && image.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white text-sm">{image.caption}</p>
        </div>
      )}

      {/* Edit Mode Controls */}
      {editable && hoveredIndex === index && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={e => {
              e.stopPropagation()
              handleRemoveImage(index)
            }}
            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            className="p-1.5 bg-white/80 text-gray-700 rounded-full hover:bg-white cursor-move"
          >
            <Move className="w-3 h-3" />
          </button>
        </div>
      )}
    </motion.div>
  )

  const renderGallery = () => {
    switch (settings.layout) {
      case 'grid':
        return (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${settings.columns}, 1fr)`,
              gap: settings.gap,
            }}
          >
            {images.map((image, index) => renderImage(image, index))}
          </div>
        )

      case 'masonry':
        return (
          <div
            className="flex"
            style={{ gap: settings.gap }}
          >
            {masonryColumns?.map((col, colIndex) => (
              <div
                key={colIndex}
                className="flex-1 flex flex-col"
                style={{ gap: settings.gap }}
              >
                {col.map((image, index) => {
                  const globalIndex = images.findIndex(img => img.id === image.id)
                  return renderImage(image, globalIndex)
                })}
              </div>
            ))}
          </div>
        )

      case 'mosaic':
        return (
          <div
            className="grid grid-cols-4"
            style={{ gap: settings.gap }}
          >
            {images.map((image, index) => {
              const layout = mosaicLayout?.[index] || { cols: 1, rows: 1 }
              return renderImage(image, index, {
                gridColumn: `span ${layout.cols}`,
                gridRow: `span ${layout.rows}`,
              })
            })}
          </div>
        )

      case 'justified':
        return (
          <div className="flex flex-wrap" style={{ gap: settings.gap }}>
            {images.map((image, index) => {
              const aspectRatio = image.width / image.height
              const height = 200
              const width = height * aspectRatio

              return (
                <div
                  key={image.id}
                  style={{
                    width,
                    height,
                    flexGrow: aspectRatio,
                  }}
                >
                  {renderImage(image, index)}
                </div>
              )
            })}
          </div>
        )

      case 'carousel':
        return (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{ gap: settings.gap }}
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="flex-shrink-0"
                  style={{ width: `calc((100% - ${settings.gap * (settings.columns - 1)}px) / ${settings.columns})` }}
                >
                  {renderImage(image, index)}
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Toolbar */}
      {editable && (
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{images.length} images</span>

            {/* Layout Selector */}
            <div className="flex items-center gap-1 ml-4">
              {(Object.keys(layoutIcons) as GalleryLayout[]).map(layout => (
                <button
                  key={layout}
                  onClick={() => setSettings(s => ({ ...s, layout }))}
                  className={clsx(
                    'p-2 rounded transition-colors',
                    settings.layout === layout
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                  title={layout.charAt(0).toUpperCase() + layout.slice(1)}
                >
                  {layoutIcons[layout]}
                </button>
              ))}
            </div>

            {/* Columns */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-gray-500">Columns:</span>
              <input
                type="range"
                min="2"
                max="6"
                value={settings.columns}
                onChange={e => setSettings(s => ({ ...s, columns: parseInt(e.target.value) }))}
                className="w-20"
              />
              <span className="text-sm">{settings.columns}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                'p-2 rounded transition-colors',
                showSettings
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              Add Images
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {editable && showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Gap */}
            <div>
              <label className="block text-sm font-medium mb-1">Gap: {settings.gap}px</label>
              <input
                type="range"
                min="0"
                max="32"
                value={settings.gap}
                onChange={e => setSettings(s => ({ ...s, gap: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium mb-1">Border Radius: {settings.borderRadius}px</label>
              <input
                type="range"
                min="0"
                max="24"
                value={settings.borderRadius}
                onChange={e => setSettings(s => ({ ...s, borderRadius: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
              <select
                value={settings.aspectRatio}
                onChange={e => setSettings(s => ({ ...s, aspectRatio: e.target.value as GallerySettings['aspectRatio'] }))}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="original">Original</option>
                <option value="square">Square (1:1)</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
                <option value="3:2">3:2</option>
              </select>
            </div>

            {/* Hover Effect */}
            <div>
              <label className="block text-sm font-medium mb-1">Hover Effect</label>
              <select
                value={settings.hoverEffect}
                onChange={e => setSettings(s => ({ ...s, hoverEffect: e.target.value as GallerySettings['hoverEffect'] }))}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="none">None</option>
                <option value="zoom">Zoom</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide Up</option>
                <option value="blur">Blur</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showCaptions}
                  onChange={e => setSettings(s => ({ ...s, showCaptions: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Captions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableLightbox}
                  onChange={e => setSettings(s => ({ ...s, enableLightbox: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Enable Lightbox</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableHoverEffects}
                  onChange={e => setSettings(s => ({ ...s, enableHoverEffects: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Hover Effects</span>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gallery */}
      <div ref={containerRef}>
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Image className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No images yet</p>
            {editable && (
              <button className="flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Upload className="w-4 h-4" />
                Upload Images
              </button>
            )}
          </div>
        ) : (
          renderGallery()
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={e => {
                e.stopPropagation()
                setLightboxIndex(prev => (prev! > 0 ? prev! - 1 : images.length - 1))
              }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                setLightboxIndex(prev => (prev! < images.length - 1 ? prev! + 1 : 0))
              }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={e => e.stopPropagation()}
            />

            {/* Caption */}
            {images[lightboxIndex].caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/50 text-white rounded-lg">
                {images[lightboxIndex].caption}
              </div>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 right-4 text-white/70 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
