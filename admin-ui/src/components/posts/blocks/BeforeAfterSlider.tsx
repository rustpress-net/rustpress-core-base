import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Image,
  Settings,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  ArrowUpDown,
  Play,
  Pause,
  RotateCcw,
  Download,
  Maximize2,
  X,
  Upload,
} from 'lucide-react'
import clsx from 'clsx'

interface BeforeAfterSliderProps {
  beforeImage?: string
  afterImage?: string
  beforeLabel?: string
  afterLabel?: string
  beforeAlt?: string
  afterAlt?: string
  orientation?: 'horizontal' | 'vertical'
  initialPosition?: number
  showLabels?: boolean
  showHandle?: boolean
  autoPlay?: boolean
  autoPlaySpeed?: number
  onSettingsChange?: (settings: SliderSettings) => void
  editable?: boolean
  className?: string
  content?: string
}

interface SliderSettings {
  orientation: 'horizontal' | 'vertical'
  initialPosition: number
  showLabels: boolean
  showHandle: boolean
  handleStyle: 'line' | 'circle' | 'arrows'
  handleColor: string
  labelPosition: 'top' | 'bottom' | 'overlay'
  animateOnHover: boolean
  autoPlay: boolean
  autoPlaySpeed: number
}

const defaultSettings: SliderSettings = {
  orientation: 'horizontal',
  initialPosition: 50,
  showLabels: true,
  showHandle: true,
  handleStyle: 'circle',
  handleColor: '#ffffff',
  labelPosition: 'overlay',
  animateOnHover: false,
  autoPlay: false,
  autoPlaySpeed: 3,
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeAlt = 'Before image',
  afterAlt = 'After image',
  orientation: propOrientation,
  initialPosition: propInitialPosition,
  showLabels: propShowLabels,
  showHandle: propShowHandle,
  autoPlay: propAutoPlay,
  autoPlaySpeed: propAutoPlaySpeed,
  onSettingsChange,
  editable = false,
  className,
}: BeforeAfterSliderProps) {
  const [settings, setSettings] = useState<SliderSettings>({
    ...defaultSettings,
    orientation: propOrientation || defaultSettings.orientation,
    initialPosition: propInitialPosition || defaultSettings.initialPosition,
    showLabels: propShowLabels ?? defaultSettings.showLabels,
    showHandle: propShowHandle ?? defaultSettings.showHandle,
    autoPlay: propAutoPlay ?? defaultSettings.autoPlay,
    autoPlaySpeed: propAutoPlaySpeed || defaultSettings.autoPlaySpeed,
  })

  const [position, setPosition] = useState(settings.initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isPlaying, setIsPlaying] = useState(settings.autoPlay)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const playDirectionRef = useRef<'forward' | 'backward'>('forward')

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && !isDragging) {
      const speed = 100 / (settings.autoPlaySpeed * 60) // Convert seconds to frame movement

      const animate = () => {
        setPosition(prev => {
          if (playDirectionRef.current === 'forward') {
            if (prev >= 100) {
              playDirectionRef.current = 'backward'
              return prev - speed
            }
            return prev + speed
          } else {
            if (prev <= 0) {
              playDirectionRef.current = 'forward'
              return prev + speed
            }
            return prev - speed
          }
        })
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [isPlaying, isDragging, settings.autoPlaySpeed])

  // Mouse/Touch handlers
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !isDragging) return

    const rect = containerRef.current.getBoundingClientRect()
    let newPosition: number

    if (settings.orientation === 'horizontal') {
      newPosition = ((clientX - rect.left) / rect.width) * 100
    } else {
      newPosition = ((clientY - rect.top) / rect.height) * 100
    }

    setPosition(Math.max(0, Math.min(100, newPosition)))
  }, [isDragging, settings.orientation])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }, [handleMove])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }, [handleMove])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd])

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsPlaying(false)

    if ('touches' in e) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    } else {
      handleMove(e.clientX, e.clientY)
    }
  }

  const handleSettingChange = <K extends keyof SliderSettings>(key: K, value: SliderSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)

    if (key === 'initialPosition') {
      setPosition(value as number)
    }
  }

  const handleReset = () => {
    setPosition(settings.initialPosition)
    playDirectionRef.current = 'forward'
  }

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const isHorizontal = settings.orientation === 'horizontal'

  const renderHandle = () => {
    const handleStyles = {
      line: (
        <div
          className={clsx(
            'absolute bg-white shadow-lg',
            isHorizontal ? 'w-0.5 h-full' : 'w-full h-0.5'
          )}
          style={{ backgroundColor: settings.handleColor }}
        />
      ),
      circle: (
        <div
          className={clsx(
            'absolute w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center',
            isHorizontal ? '-translate-x-1/2' : '-translate-y-1/2'
          )}
          style={{ backgroundColor: settings.handleColor }}
        >
          {isHorizontal ? (
            <ArrowLeftRight className="w-6 h-6 text-gray-700" />
          ) : (
            <ArrowUpDown className="w-6 h-6 text-gray-700" />
          )}
        </div>
      ),
      arrows: (
        <div
          className={clsx(
            'absolute flex items-center gap-0 bg-white rounded-full shadow-lg',
            isHorizontal ? 'flex-row px-1 py-2 -translate-x-1/2' : 'flex-col py-1 px-2 -translate-y-1/2'
          )}
          style={{ backgroundColor: settings.handleColor }}
        >
          {isHorizontal ? (
            <>
              <ChevronLeft className="w-4 h-4 text-gray-700" />
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-gray-700 rotate-90" />
              <ChevronRight className="w-4 h-4 text-gray-700 rotate-90" />
            </>
          )}
        </div>
      ),
    }

    return handleStyles[settings.handleStyle]
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Main Slider */}
      <div
        ref={containerRef}
        className={clsx(
          'relative overflow-hidden rounded-lg select-none',
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-[16/9]'
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ cursor: isDragging ? 'grabbing' : 'ew-resize' }}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt={afterAlt}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            isHorizontal
              ? { clipPath: `inset(0 ${100 - position}% 0 0)` }
              : { clipPath: `inset(0 0 ${100 - position}% 0)` }
          }
        >
          <img
            src={beforeImage}
            alt={beforeAlt}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Divider Line */}
        {settings.showHandle && (
          <div
            className={clsx(
              'absolute pointer-events-none',
              isHorizontal
                ? 'top-0 bottom-0 w-0.5 bg-white/80'
                : 'left-0 right-0 h-0.5 bg-white/80'
            )}
            style={
              isHorizontal
                ? { left: `${position}%`, transform: 'translateX(-50%)' }
                : { top: `${position}%`, transform: 'translateY(-50%)' }
            }
          />
        )}

        {/* Handle */}
        {settings.showHandle && (
          <div
            className={clsx(
              'absolute flex items-center justify-center pointer-events-none',
              isHorizontal
                ? 'top-1/2 -translate-y-1/2'
                : 'left-1/2 -translate-x-1/2'
            )}
            style={
              isHorizontal
                ? { left: `${position}%` }
                : { top: `${position}%` }
            }
          >
            {renderHandle()}
          </div>
        )}

        {/* Labels */}
        {settings.showLabels && (
          <>
            <div
              className={clsx(
                'absolute px-3 py-1 bg-black/50 text-white text-sm rounded',
                settings.labelPosition === 'overlay' && 'left-4 top-1/2 -translate-y-1/2',
                settings.labelPosition === 'top' && 'left-4 top-4',
                settings.labelPosition === 'bottom' && 'left-4 bottom-4'
              )}
              style={{
                opacity: position > 10 ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              {beforeLabel}
            </div>
            <div
              className={clsx(
                'absolute px-3 py-1 bg-black/50 text-white text-sm rounded',
                settings.labelPosition === 'overlay' && 'right-4 top-1/2 -translate-y-1/2',
                settings.labelPosition === 'top' && 'right-4 top-4',
                settings.labelPosition === 'bottom' && 'right-4 bottom-4'
              )}
              style={{
                opacity: position < 90 ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              {afterLabel}
            </div>
          </>
        )}

        {/* Controls (visible on hover or always in edit mode) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: editable || isHovering ? 1 : 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/60 rounded-full"
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {editable && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                'p-1.5 rounded-full transition-colors',
                showSettings ? 'bg-white/30 text-white' : 'text-white hover:bg-white/20'
              )}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Fullscreen close button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Settings Panel (Edit Mode) */}
      {editable && showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden"
        >
          <h4 className="font-medium mb-4">Slider Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium mb-1">Orientation</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSettingChange('orientation', 'horizontal')}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                    settings.orientation === 'horizontal'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                  )}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Horizontal
                </button>
                <button
                  onClick={() => handleSettingChange('orientation', 'vertical')}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                    settings.orientation === 'vertical'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                  )}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Vertical
                </button>
              </div>
            </div>

            {/* Initial Position */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Initial Position: {settings.initialPosition}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.initialPosition}
                onChange={e => handleSettingChange('initialPosition', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Handle Style */}
            <div>
              <label className="block text-sm font-medium mb-1">Handle Style</label>
              <select
                value={settings.handleStyle}
                onChange={e => handleSettingChange('handleStyle', e.target.value as SliderSettings['handleStyle'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="circle">Circle</option>
                <option value="arrows">Arrows</option>
                <option value="line">Line Only</option>
              </select>
            </div>

            {/* Handle Color */}
            <div>
              <label className="block text-sm font-medium mb-1">Handle Color</label>
              <input
                type="color"
                value={settings.handleColor}
                onChange={e => handleSettingChange('handleColor', e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Label Position */}
            <div>
              <label className="block text-sm font-medium mb-1">Label Position</label>
              <select
                value={settings.labelPosition}
                onChange={e => handleSettingChange('labelPosition', e.target.value as SliderSettings['labelPosition'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="overlay">Overlay (Center)</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Auto-play Speed */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Auto-play Speed: {settings.autoPlaySpeed}s
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.autoPlaySpeed}
                onChange={e => handleSettingChange('autoPlaySpeed', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Toggles */}
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showLabels}
                  onChange={e => handleSettingChange('showLabels', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Labels</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showHandle}
                  onChange={e => handleSettingChange('showHandle', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Handle</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoPlay}
                  onChange={e => {
                    handleSettingChange('autoPlay', e.target.checked)
                    setIsPlaying(e.target.checked)
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Auto-play</span>
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
