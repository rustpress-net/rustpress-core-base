import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Settings,
  Image,
  Type,
  Video,
  Maximize2,
  Grid3X3,
  Layers,
  X,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Copy,
  Edit3,
  Link,
  ArrowUpDown,
} from 'lucide-react'
import clsx from 'clsx'

// Carousel slide types
export type SlideType = 'image' | 'video' | 'content' | 'testimonial' | 'product' | 'custom'

export interface CarouselSlide {
  id: string
  type: SlideType
  title?: string
  subtitle?: string
  description?: string
  image?: string
  video?: string
  link?: string
  linkText?: string
  backgroundColor?: string
  textColor?: string
  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
  alignment?: 'left' | 'center' | 'right'
  customContent?: React.ReactNode
  // Testimonial specific
  author?: string
  authorImage?: string
  authorTitle?: string
  rating?: number
  // Product specific
  price?: string
  originalPrice?: string
  badge?: string
}

export interface CarouselSettings {
  // Layout
  style: 'default' | 'cards' | 'fullwidth' | 'centered' | 'coverflow' | 'cube'
  slidesPerView: number
  slidesPerGroup: number
  spaceBetween: number
  height: 'auto' | 'fixed' | 'ratio'
  fixedHeight: number
  aspectRatio: string
  // Navigation
  showArrows: boolean
  arrowStyle: 'default' | 'circle' | 'square' | 'minimal'
  arrowPosition: 'inside' | 'outside' | 'bottom'
  showDots: boolean
  dotStyle: 'default' | 'line' | 'number' | 'thumbnail'
  dotPosition: 'bottom' | 'top' | 'left' | 'right'
  // Autoplay
  autoplay: boolean
  autoplaySpeed: number
  pauseOnHover: boolean
  // Animation
  effect: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'creative'
  speed: number
  easing: string
  // Behavior
  loop: boolean
  rewind: boolean
  draggable: boolean
  keyboard: boolean
  mousewheel: boolean
  // Responsive
  breakpoints: {
    mobile: { slidesPerView: number; spaceBetween: number }
    tablet: { slidesPerView: number; spaceBetween: number }
    desktop: { slidesPerView: number; spaceBetween: number }
  }
}

interface ContentCarouselProps {
  slides?: CarouselSlide[]
  settings?: Partial<CarouselSettings>
  onSlidesChange?: (slides: CarouselSlide[]) => void
  onSettingsChange?: (settings: CarouselSettings) => void
  isEditing?: boolean
  className?: string
  content?: string
}

const defaultSettings: CarouselSettings = {
  style: 'default',
  slidesPerView: 1,
  slidesPerGroup: 1,
  spaceBetween: 20,
  height: 'ratio',
  fixedHeight: 400,
  aspectRatio: '16/9',
  showArrows: true,
  arrowStyle: 'default',
  arrowPosition: 'inside',
  showDots: true,
  dotStyle: 'default',
  dotPosition: 'bottom',
  autoplay: false,
  autoplaySpeed: 5000,
  pauseOnHover: true,
  effect: 'slide',
  speed: 500,
  easing: 'ease-out',
  loop: true,
  rewind: false,
  draggable: true,
  keyboard: true,
  mousewheel: false,
  breakpoints: {
    mobile: { slidesPerView: 1, spaceBetween: 10 },
    tablet: { slidesPerView: 2, spaceBetween: 15 },
    desktop: { slidesPerView: 3, spaceBetween: 20 },
  },
}

// Slide editor component
function SlideEditor({
  slide,
  onChange,
  onClose,
}: {
  slide: CarouselSlide
  onChange: (slide: CarouselSlide) => void
  onClose: () => void
}) {
  const [localSlide, setLocalSlide] = useState(slide)

  const updateSlide = (updates: Partial<CarouselSlide>) => {
    setLocalSlide(prev => ({ ...prev, ...updates }))
  }

  const handleSave = () => {
    onChange(localSlide)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Slide</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Slide Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slide Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['image', 'video', 'content', 'testimonial', 'product'] as SlideType[]).map(type => (
                <button
                  key={type}
                  onClick={() => updateSlide({ type })}
                  className={clsx(
                    'p-3 rounded-lg border text-sm capitalize flex flex-col items-center gap-1',
                    localSlide.type === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {type === 'image' && <Image className="w-5 h-5" />}
                  {type === 'video' && <Video className="w-5 h-5" />}
                  {type === 'content' && <Type className="w-5 h-5" />}
                  {type === 'testimonial' && <Type className="w-5 h-5" />}
                  {type === 'product' && <Grid3X3 className="w-5 h-5" />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={localSlide.title || ''}
                onChange={e => updateSlide({ title: e.target.value })}
                className="input w-full"
                placeholder="Slide title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={localSlide.subtitle || ''}
                onChange={e => updateSlide({ subtitle: e.target.value })}
                className="input w-full"
                placeholder="Slide subtitle"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={localSlide.description || ''}
              onChange={e => updateSlide({ description: e.target.value })}
              className="input w-full"
              rows={3}
              placeholder="Slide description"
            />
          </div>

          {/* Media Fields */}
          {(localSlide.type === 'image' || localSlide.type === 'content' || localSlide.type === 'testimonial' || localSlide.type === 'product') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={localSlide.image || ''}
                onChange={e => updateSlide({ image: e.target.value })}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
          )}

          {localSlide.type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={localSlide.video || ''}
                onChange={e => updateSlide({ video: e.target.value })}
                className="input w-full"
                placeholder="YouTube, Vimeo, or direct URL"
              />
            </div>
          )}

          {/* Link Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link URL
              </label>
              <input
                type="url"
                value={localSlide.link || ''}
                onChange={e => updateSlide({ link: e.target.value })}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link Text
              </label>
              <input
                type="text"
                value={localSlide.linkText || ''}
                onChange={e => updateSlide({ linkText: e.target.value })}
                className="input w-full"
                placeholder="Learn More"
              />
            </div>
          </div>

          {/* Testimonial Fields */}
          {localSlide.type === 'testimonial' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Testimonial Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={localSlide.author || ''}
                    onChange={e => updateSlide({ author: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Author Title</label>
                  <input
                    type="text"
                    value={localSlide.authorTitle || ''}
                    onChange={e => updateSlide({ authorTitle: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={localSlide.rating || 5}
                  onChange={e => updateSlide({ rating: parseInt(e.target.value) })}
                  className="input w-24"
                />
              </div>
            </div>
          )}

          {/* Product Fields */}
          {localSlide.type === 'product' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Product Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Price</label>
                  <input
                    type="text"
                    value={localSlide.price || ''}
                    onChange={e => updateSlide({ price: e.target.value })}
                    className="input w-full"
                    placeholder="$99.99"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Original Price</label>
                  <input
                    type="text"
                    value={localSlide.originalPrice || ''}
                    onChange={e => updateSlide({ originalPrice: e.target.value })}
                    className="input w-full"
                    placeholder="$149.99"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Badge</label>
                  <input
                    type="text"
                    value={localSlide.badge || ''}
                    onChange={e => updateSlide({ badge: e.target.value })}
                    className="input w-full"
                    placeholder="Sale"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Style Fields */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Styling</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Background</label>
                <input
                  type="color"
                  value={localSlide.backgroundColor || '#ffffff'}
                  onChange={e => updateSlide({ backgroundColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={localSlide.textColor || '#000000'}
                  onChange={e => updateSlide({ textColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Alignment</label>
                <select
                  value={localSlide.alignment || 'center'}
                  onChange={e => updateSlide({ alignment: e.target.value as 'left' | 'center' | 'right' })}
                  className="input w-full"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSlide.overlay || false}
                onChange={e => updateSlide({ overlay: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Add Overlay</span>
            </label>

            {localSlide.overlay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Overlay Color</label>
                  <input
                    type="color"
                    value={localSlide.overlayColor || '#000000'}
                    onChange={e => updateSlide({ overlayColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Overlay Opacity ({(localSlide.overlayOpacity || 0.5) * 100}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={localSlide.overlayOpacity || 0.5}
                    onChange={e => updateSlide({ overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Slide</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Carousel settings panel
function CarouselSettingsPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: CarouselSettings
  onChange: (settings: CarouselSettings) => void
  onClose: () => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [activeTab, setActiveTab] = useState<'layout' | 'navigation' | 'animation' | 'behavior'>('layout')

  const updateSettings = (updates: Partial<CarouselSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }))
  }

  const handleSave = () => {
    onChange(localSettings)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Carousel Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['layout', 'navigation', 'animation', 'behavior'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px',
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['default', 'cards', 'fullwidth', 'centered', 'coverflow', 'cube'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => updateSettings({ style })}
                      className={clsx(
                        'p-3 rounded-lg border text-sm capitalize',
                        localSettings.style === style
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slides Per View
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={localSettings.slidesPerView}
                    onChange={e => updateSettings({ slidesPerView: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slides Per Group
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={localSettings.slidesPerGroup}
                    onChange={e => updateSettings({ slidesPerGroup: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Space Between (px)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={localSettings.spaceBetween}
                    onChange={e => updateSettings({ spaceBetween: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height</label>
                <div className="flex gap-2 mb-2">
                  {(['auto', 'fixed', 'ratio'] as const).map(h => (
                    <button
                      key={h}
                      onClick={() => updateSettings({ height: h })}
                      className={clsx(
                        'px-3 py-1.5 rounded text-sm capitalize',
                        localSettings.height === h
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {localSettings.height === 'fixed' && (
                  <input
                    type="number"
                    min={100}
                    max={1000}
                    value={localSettings.fixedHeight}
                    onChange={e => updateSettings({ fixedHeight: parseInt(e.target.value) })}
                    className="input w-full"
                    placeholder="Height in pixels"
                  />
                )}
                {localSettings.height === 'ratio' && (
                  <select
                    value={localSettings.aspectRatio}
                    onChange={e => updateSettings({ aspectRatio: e.target.value })}
                    className="input w-full"
                  >
                    <option value="16/9">16:9 (Widescreen)</option>
                    <option value="4/3">4:3 (Standard)</option>
                    <option value="1/1">1:1 (Square)</option>
                    <option value="21/9">21:9 (Ultrawide)</option>
                    <option value="9/16">9:16 (Portrait)</option>
                  </select>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Responsive Breakpoints</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mobile</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.breakpoints.mobile.slidesPerView}
                      onChange={e => updateSettings({
                        breakpoints: {
                          ...localSettings.breakpoints,
                          mobile: { ...localSettings.breakpoints.mobile, slidesPerView: parseInt(e.target.value) },
                        },
                      })}
                      className="input w-full"
                      placeholder="Slides"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tablet</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.breakpoints.tablet.slidesPerView}
                      onChange={e => updateSettings({
                        breakpoints: {
                          ...localSettings.breakpoints,
                          tablet: { ...localSettings.breakpoints.tablet, slidesPerView: parseInt(e.target.value) },
                        },
                      })}
                      className="input w-full"
                      placeholder="Slides"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Desktop</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.breakpoints.desktop.slidesPerView}
                      onChange={e => updateSettings({
                        breakpoints: {
                          ...localSettings.breakpoints,
                          desktop: { ...localSettings.breakpoints.desktop, slidesPerView: parseInt(e.target.value) },
                        },
                      })}
                      className="input w-full"
                      placeholder="Slides"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={localSettings.showArrows}
                    onChange={e => updateSettings({ showArrows: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Arrows</span>
                </label>
                {localSettings.showArrows && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Arrow Style</label>
                      <select
                        value={localSettings.arrowStyle}
                        onChange={e => updateSettings({ arrowStyle: e.target.value as CarouselSettings['arrowStyle'] })}
                        className="input w-full"
                      >
                        <option value="default">Default</option>
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Arrow Position</label>
                      <select
                        value={localSettings.arrowPosition}
                        onChange={e => updateSettings({ arrowPosition: e.target.value as CarouselSettings['arrowPosition'] })}
                        className="input w-full"
                      >
                        <option value="inside">Inside</option>
                        <option value="outside">Outside</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={localSettings.showDots}
                    onChange={e => updateSettings({ showDots: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Dots</span>
                </label>
                {localSettings.showDots && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Dot Style</label>
                      <select
                        value={localSettings.dotStyle}
                        onChange={e => updateSettings({ dotStyle: e.target.value as CarouselSettings['dotStyle'] })}
                        className="input w-full"
                      >
                        <option value="default">Default</option>
                        <option value="line">Line</option>
                        <option value="number">Number</option>
                        <option value="thumbnail">Thumbnail</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Dot Position</label>
                      <select
                        value={localSettings.dotPosition}
                        onChange={e => updateSettings({ dotPosition: e.target.value as CarouselSettings['dotPosition'] })}
                        className="input w-full"
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'animation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Effect</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['slide', 'fade', 'cube', 'coverflow', 'flip', 'creative'] as const).map(effect => (
                    <button
                      key={effect}
                      onClick={() => updateSettings({ effect })}
                      className={clsx(
                        'p-3 rounded-lg border text-sm capitalize',
                        localSettings.effect === effect
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Speed</span>
                  <span className="font-mono">{localSettings.speed}ms</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={localSettings.speed}
                  onChange={e => updateSettings({ speed: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Easing</label>
                <select
                  value={localSettings.easing}
                  onChange={e => updateSettings({ easing: e.target.value })}
                  className="input w-full"
                >
                  <option value="linear">Linear</option>
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={localSettings.autoplay}
                    onChange={e => updateSettings({ autoplay: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Autoplay</span>
                </label>
                {localSettings.autoplay && (
                  <div className="space-y-3 ml-6">
                    <div>
                      <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Interval</span>
                        <span className="font-mono">{localSettings.autoplaySpeed}ms</span>
                      </label>
                      <input
                        type="range"
                        min={1000}
                        max={10000}
                        step={500}
                        value={localSettings.autoplaySpeed}
                        onChange={e => updateSettings({ autoplaySpeed: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={localSettings.pauseOnHover}
                        onChange={e => updateSettings({ pauseOnHover: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pause on Hover</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.loop}
                  onChange={e => updateSettings({ loop: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Infinite Loop</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.rewind}
                  onChange={e => updateSettings({ rewind: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rewind (go to first after last)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.draggable}
                  onChange={e => updateSettings({ draggable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Draggable</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.keyboard}
                  onChange={e => updateSettings({ keyboard: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard Navigation</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.mousewheel}
                  onChange={e => updateSettings({ mousewheel: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mousewheel Control</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Settings</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Default slides for demo
const defaultSlides: CarouselSlide[] = [
  { id: '1', type: 'image', title: 'Slide 1', image: 'https://via.placeholder.com/800x400' },
  { id: '2', type: 'image', title: 'Slide 2', image: 'https://via.placeholder.com/800x400' },
]

// Main carousel component
export default function ContentCarousel({
  slides: propSlides,
  settings: propSettings,
  onSlidesChange,
  onSettingsChange,
  isEditing = false,
  className,
}: ContentCarouselProps) {
  const slides = propSlides ?? defaultSlides
  const settings = { ...defaultSettings, ...propSettings }
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(settings.autoplay)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout>()

  const totalSlides = slides.length
  const maxIndex = Math.max(0, totalSlides - settings.slidesPerView)

  // Autoplay
  useEffect(() => {
    if (isPlaying && settings.autoplay && !isEditing) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (settings.loop) {
            return (prev + settings.slidesPerGroup) % totalSlides
          }
          return prev >= maxIndex ? 0 : prev + settings.slidesPerGroup
        })
      }, settings.autoplaySpeed)
    }

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [isPlaying, settings.autoplay, settings.autoplaySpeed, settings.loop, settings.slidesPerGroup, totalSlides, maxIndex, isEditing])

  const goToSlide = (index: number) => {
    if (settings.loop) {
      setCurrentIndex((index + totalSlides) % totalSlides)
    } else {
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
    }
  }

  const goToPrev = () => goToSlide(currentIndex - settings.slidesPerGroup)
  const goToNext = () => goToSlide(currentIndex + settings.slidesPerGroup)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      if (info.offset.x > 0) {
        goToPrev()
      } else {
        goToNext()
      }
    }
  }

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      type: 'image',
      title: 'New Slide',
      description: 'Add your content here',
    }
    onSlidesChange?.([...slides, newSlide])
  }

  const handleUpdateSlide = (updatedSlide: CarouselSlide) => {
    onSlidesChange?.(slides.map(s => s.id === updatedSlide.id ? updatedSlide : s))
  }

  const handleDeleteSlide = (slideId: string) => {
    onSlidesChange?.(slides.filter(s => s.id !== slideId))
  }

  const handleReorderSlides = (fromIndex: number, toIndex: number) => {
    const newSlides = [...slides]
    const [removed] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, removed)
    onSlidesChange?.(newSlides)
  }

  // Render individual slide
  const renderSlide = (slide: CarouselSlide, index: number) => {
    const content = (
      <div
        className={clsx(
          'relative h-full overflow-hidden rounded-lg',
          isEditing && 'cursor-pointer group'
        )}
        style={{
          backgroundColor: slide.backgroundColor || '#f3f4f6',
          color: slide.textColor || '#1f2937',
        }}
      >
        {/* Background Image/Video */}
        {slide.image && (
          <img
            src={slide.image}
            alt={slide.title || ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {slide.video && (
          <video
            src={slide.video}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        {/* Overlay */}
        {slide.overlay && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: slide.overlayColor || '#000',
              opacity: slide.overlayOpacity || 0.5,
            }}
          />
        )}

        {/* Content */}
        <div
          className={clsx(
            'relative z-10 h-full flex flex-col justify-center p-6',
            slide.alignment === 'left' && 'items-start text-left',
            slide.alignment === 'center' && 'items-center text-center',
            slide.alignment === 'right' && 'items-end text-right'
          )}
        >
          {slide.badge && (
            <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full mb-3">
              {slide.badge}
            </span>
          )}

          {slide.title && (
            <h3 className="text-2xl md:text-3xl font-bold mb-2">{slide.title}</h3>
          )}

          {slide.subtitle && (
            <p className="text-lg opacity-80 mb-2">{slide.subtitle}</p>
          )}

          {slide.description && (
            <p className="max-w-xl opacity-70 mb-4">{slide.description}</p>
          )}

          {/* Testimonial specific */}
          {slide.type === 'testimonial' && (
            <div className="flex items-center gap-3 mt-4">
              {slide.authorImage && (
                <img src={slide.authorImage} alt={slide.author} className="w-12 h-12 rounded-full object-cover" />
              )}
              <div>
                {slide.author && <p className="font-semibold">{slide.author}</p>}
                {slide.authorTitle && <p className="text-sm opacity-70">{slide.authorTitle}</p>}
              </div>
              {slide.rating && (
                <div className="flex gap-1 ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < slide.rating! ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product specific */}
          {slide.type === 'product' && (
            <div className="flex items-center gap-3 mt-4">
              {slide.price && (
                <span className="text-2xl font-bold text-primary-500">{slide.price}</span>
              )}
              {slide.originalPrice && (
                <span className="text-lg line-through opacity-50">{slide.originalPrice}</span>
              )}
            </div>
          )}

          {slide.link && slide.linkText && (
            <a
              href={slide.link}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mt-4"
            >
              {slide.linkText}
              <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Edit overlay */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSlide(slide)}
                className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteSlide(slide.id)}
                className="p-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    )

    return content
  }

  const slideWidth = 100 / settings.slidesPerView

  return (
    <div className={clsx('relative', className)}>
      {/* Editor toolbar */}
      {isEditing && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSlide}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-4 h-4" />
              Add Slide
            </button>
            <span className="text-sm text-gray-500">{slides.length} slides</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      )}

      {/* Main carousel container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl"
        style={{
          aspectRatio: settings.height === 'ratio' ? settings.aspectRatio : undefined,
          height: settings.height === 'fixed' ? settings.fixedHeight : undefined,
        }}
        onMouseEnter={() => settings.pauseOnHover && setIsPlaying(false)}
        onMouseLeave={() => settings.pauseOnHover && settings.autoplay && setIsPlaying(true)}
      >
        {/* Slides track */}
        <motion.div
          className="flex h-full"
          animate={{ x: `${-currentIndex * slideWidth}%` }}
          transition={{ duration: settings.speed / 1000, ease: settings.easing as any }}
          drag={settings.draggable ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex-shrink-0 h-full"
              style={{
                width: `${slideWidth}%`,
                paddingLeft: index > 0 ? settings.spaceBetween / 2 : 0,
                paddingRight: index < slides.length - 1 ? settings.spaceBetween / 2 : 0,
              }}
            >
              {renderSlide(slide, index)}
            </div>
          ))}
        </motion.div>

        {/* Navigation Arrows */}
        {settings.showArrows && slides.length > settings.slidesPerView && (
          <>
            <button
              onClick={goToPrev}
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-lg transition-all',
                settings.arrowStyle === 'circle' && 'rounded-full',
                settings.arrowStyle === 'square' && 'rounded-lg',
                settings.arrowStyle === 'default' && 'rounded-lg',
                settings.arrowStyle === 'minimal' && 'bg-transparent hover:bg-white/50 shadow-none',
                settings.arrowPosition === 'inside' && 'left-4',
                settings.arrowPosition === 'outside' && '-left-12',
                settings.arrowPosition === 'bottom' && 'bottom-4 left-4 top-auto translate-y-0'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-lg transition-all',
                settings.arrowStyle === 'circle' && 'rounded-full',
                settings.arrowStyle === 'square' && 'rounded-lg',
                settings.arrowStyle === 'default' && 'rounded-lg',
                settings.arrowStyle === 'minimal' && 'bg-transparent hover:bg-white/50 shadow-none',
                settings.arrowPosition === 'inside' && 'right-4',
                settings.arrowPosition === 'outside' && '-right-12',
                settings.arrowPosition === 'bottom' && 'bottom-4 right-4 top-auto translate-y-0'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots/Pagination */}
        {settings.showDots && slides.length > 1 && (
          <div
            className={clsx(
              'absolute z-10 flex gap-2',
              settings.dotPosition === 'bottom' && 'bottom-4 left-1/2 -translate-x-1/2',
              settings.dotPosition === 'top' && 'top-4 left-1/2 -translate-x-1/2',
              settings.dotPosition === 'left' && 'left-4 top-1/2 -translate-y-1/2 flex-col',
              settings.dotPosition === 'right' && 'right-4 top-1/2 -translate-y-1/2 flex-col'
            )}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={clsx(
                  'transition-all',
                  settings.dotStyle === 'default' && clsx(
                    'w-2.5 h-2.5 rounded-full',
                    currentIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  ),
                  settings.dotStyle === 'line' && clsx(
                    'h-1 rounded-full',
                    currentIndex === index ? 'w-8 bg-white' : 'w-4 bg-white/50 hover:bg-white/75'
                  ),
                  settings.dotStyle === 'number' && clsx(
                    'w-6 h-6 rounded-full text-xs flex items-center justify-center',
                    currentIndex === index ? 'bg-white text-gray-900' : 'bg-white/30 text-white hover:bg-white/50'
                  )
                )}
              >
                {settings.dotStyle === 'number' && index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Autoplay indicator */}
        {settings.autoplay && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Slide editor modal */}
      <AnimatePresence>
        {editingSlide && (
          <SlideEditor
            slide={editingSlide}
            onChange={handleUpdateSlide}
            onClose={() => setEditingSlide(null)}
          />
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && onSettingsChange && (
          <CarouselSettingsPanel
            settings={settings}
            onChange={onSettingsChange}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export { defaultSettings as defaultCarouselSettings }
