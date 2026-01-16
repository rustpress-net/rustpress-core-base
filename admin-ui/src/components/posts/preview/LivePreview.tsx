import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Split,
  Maximize2,
  Minimize2,
  Settings,
  Sun,
  Moon,
  Palette,
  Type,
  Layout,
  Zap,
  Clock,
  Wifi,
  WifiOff,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'

interface LivePreviewProps {
  content: string
  title: string
  excerpt?: string
  featuredImage?: string
  author?: {
    name: string
    avatar?: string
  }
  publishDate?: Date
  categories?: string[]
  tags?: string[]
  template?: string
  customCSS?: string
  onClose?: () => void
  onOpenExternal?: () => void
  className?: string
}

interface PreviewSettings {
  device: 'desktop' | 'tablet' | 'mobile'
  orientation: 'portrait' | 'landscape'
  theme: 'light' | 'dark' | 'auto'
  showGrid: boolean
  showRulers: boolean
  simulateSlowConnection: boolean
  zoom: number
  splitView: boolean
  liveReload: boolean
  showMetaInfo: boolean
}

interface DeviceConfig {
  id: string
  name: string
  icon: React.ReactNode
  width: number
  height: number
}

const devices: DeviceConfig[] = [
  { id: 'desktop', name: 'Desktop', icon: <Monitor className="w-4 h-4" />, width: 1920, height: 1080 },
  { id: 'laptop', name: 'Laptop', icon: <Monitor className="w-4 h-4" />, width: 1366, height: 768 },
  { id: 'tablet', name: 'iPad', icon: <Tablet className="w-4 h-4" />, width: 768, height: 1024 },
  { id: 'tablet-landscape', name: 'iPad Landscape', icon: <Tablet className="w-4 h-4 rotate-90" />, width: 1024, height: 768 },
  { id: 'mobile', name: 'iPhone', icon: <Smartphone className="w-4 h-4" />, width: 375, height: 812 },
  { id: 'mobile-plus', name: 'iPhone Plus', icon: <Smartphone className="w-4 h-4" />, width: 414, height: 896 },
  { id: 'android', name: 'Android', icon: <Smartphone className="w-4 h-4" />, width: 360, height: 800 },
]

const themePresets = [
  { id: 'default', name: 'Default Theme', primary: '#3b82f6', background: '#ffffff' },
  { id: 'dark', name: 'Dark Theme', primary: '#60a5fa', background: '#1f2937' },
  { id: 'minimal', name: 'Minimal', primary: '#111827', background: '#fafafa' },
  { id: 'warm', name: 'Warm', primary: '#f59e0b', background: '#fffbeb' },
  { id: 'cool', name: 'Cool', primary: '#06b6d4', background: '#ecfeff' },
]

const fontPresets = [
  { id: 'system', name: 'System Default', family: 'system-ui, -apple-system, sans-serif' },
  { id: 'serif', name: 'Serif', family: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', name: 'Monospace', family: 'ui-monospace, Consolas, monospace' },
  { id: 'modern', name: 'Modern Sans', family: '"Inter", "Helvetica Neue", sans-serif' },
]

export default function LivePreview({
  content,
  title,
  excerpt,
  featuredImage,
  author,
  publishDate,
  categories = [],
  tags = [],
  template = 'default',
  customCSS = '',
  onClose,
  onOpenExternal,
  className,
}: LivePreviewProps) {
  const [settings, setSettings] = useState<PreviewSettings>({
    device: 'desktop',
    orientation: 'portrait',
    theme: 'light',
    showGrid: false,
    showRulers: false,
    simulateSlowConnection: false,
    zoom: 100,
    splitView: false,
    liveReload: true,
    showMetaInfo: true,
  })

  const [selectedDevice, setSelectedDevice] = useState(devices[0])
  const [selectedTheme, setSelectedTheme] = useState(themePresets[0])
  const [selectedFont, setSelectedFont] = useState(fontPresets[0])
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false)

  const previewRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate preview HTML
  const previewHTML = useMemo(() => {
    const themeStyles = `
      :root {
        --primary-color: ${selectedTheme.primary};
        --background-color: ${selectedTheme.background};
        --text-color: ${settings.theme === 'dark' ? '#f3f4f6' : '#1f2937'};
        --font-family: ${selectedFont.family};
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: var(--font-family);
        background-color: ${settings.theme === 'dark' ? '#111827' : 'var(--background-color)'};
        color: var(--text-color);
        line-height: 1.6;
      }

      .preview-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .post-header {
        margin-bottom: 2rem;
      }

      .post-categories {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .category-tag {
        padding: 0.25rem 0.75rem;
        background: var(--primary-color);
        color: white;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      .post-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 1rem;
        line-height: 1.2;
      }

      .post-excerpt {
        font-size: 1.25rem;
        color: ${settings.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        margin-bottom: 1.5rem;
      }

      .post-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.875rem;
        color: ${settings.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      }

      .author-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .author-avatar {
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        object-fit: cover;
      }

      .featured-image {
        width: 100%;
        max-height: 400px;
        object-fit: cover;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
      }

      .post-content {
        font-size: 1.125rem;
      }

      .post-content h1, .post-content h2, .post-content h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
      }

      .post-content p {
        margin-bottom: 1.5rem;
      }

      .post-content img {
        max-width: 100%;
        border-radius: 0.5rem;
      }

      .post-content blockquote {
        border-left: 4px solid var(--primary-color);
        padding-left: 1rem;
        margin: 1.5rem 0;
        font-style: italic;
        color: ${settings.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      }

      .post-content code {
        background: ${settings.theme === 'dark' ? '#374151' : '#f3f4f6'};
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-size: 0.875em;
      }

      .post-content pre {
        background: ${settings.theme === 'dark' ? '#374151' : '#1f2937'};
        color: #f3f4f6;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
      }

      .post-content pre code {
        background: none;
        padding: 0;
      }

      .post-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid ${settings.theme === 'dark' ? '#374151' : '#e5e7eb'};
      }

      .tag {
        padding: 0.25rem 0.75rem;
        background: ${settings.theme === 'dark' ? '#374151' : '#f3f4f6'};
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }

      ${settings.showGrid ? `
        body {
          background-image:
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      ` : ''}

      ${customCSS}
    `

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>${themeStyles}</style>
      </head>
      <body>
        <div class="preview-container">
          <article class="post">
            <header class="post-header">
              ${categories.length > 0 ? `
                <div class="post-categories">
                  ${categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                </div>
              ` : ''}
              <h1 class="post-title">${title || 'Untitled Post'}</h1>
              ${excerpt ? `<p class="post-excerpt">${excerpt}</p>` : ''}
              ${settings.showMetaInfo ? `
                <div class="post-meta">
                  ${author ? `
                    <div class="author-info">
                      ${author.avatar ? `<img src="${author.avatar}" alt="${author.name}" class="author-avatar">` : ''}
                      <span>${author.name}</span>
                    </div>
                  ` : ''}
                  ${publishDate ? `<span>${publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>` : ''}
                </div>
              ` : ''}
            </header>

            ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="featured-image">` : ''}

            <div class="post-content">
              ${content}
            </div>

            ${tags.length > 0 ? `
              <footer class="post-tags">
                ${tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
              </footer>
            ` : ''}
          </article>
        </div>
      </body>
      </html>
    `
  }, [content, title, excerpt, featuredImage, author, publishDate, categories, tags, settings, selectedTheme, selectedFont, customCSS])

  // Update preview when content changes
  useEffect(() => {
    if (settings.liveReload && previewRef.current) {
      const doc = previewRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(previewHTML)
        doc.close()
        setLastUpdate(new Date())
      }
    }
  }, [previewHTML, settings.liveReload])

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(previewHTML)
        doc.close()
        setLastUpdate(new Date())
      }
    }
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const getPreviewDimensions = () => {
    const { width, height } = selectedDevice
    const scale = settings.zoom / 100
    const orientation = settings.orientation

    if (orientation === 'landscape' && height > width) {
      return { width: height * scale, height: width * scale }
    }
    return { width: width * scale, height: height * scale }
  }

  const dimensions = getPreviewDimensions()

  return (
    <div
      ref={containerRef}
      className={clsx(
        'flex flex-col bg-gray-100 dark:bg-gray-900',
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary-600" />
          <span className="font-medium">Live Preview</span>

          {/* Device Selector */}
          <div className="relative ml-4">
            <button
              onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {selectedDevice.icon}
              <span className="text-sm">{selectedDevice.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showDeviceDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10"
                >
                  {devices.map(device => (
                    <button
                      key={device.id}
                      onClick={() => {
                        setSelectedDevice(device)
                        setShowDeviceDropdown(false)
                      }}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg',
                        selectedDevice.id === device.id && 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      )}
                    >
                      {device.icon}
                      <span className="text-sm">{device.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{device.width}x{device.height}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Device Buttons */}
          <div className="flex items-center gap-1 ml-2">
            {[devices[0], devices[2], devices[4]].map(device => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  selectedDevice.id === device.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                title={device.name}
              >
                {device.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setSettings(s => ({
              ...s,
              theme: s.theme === 'light' ? 'dark' : 'light'
            }))}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Zoom */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setSettings(s => ({ ...s, zoom: Math.max(25, s.zoom - 25) }))}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              -
            </button>
            <span className="text-sm w-12 text-center">{settings.zoom}%</span>
            <button
              onClick={() => setSettings(s => ({ ...s, zoom: Math.min(200, s.zoom + 25) }))}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              +
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setSettings(s => ({ ...s, showGrid: !s.showGrid }))}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              settings.showGrid
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="Toggle grid"
          >
            <Layout className="w-4 h-4" />
          </button>

          {/* Live Reload Toggle */}
          <button
            onClick={() => setSettings(s => ({ ...s, liveReload: !s.liveReload }))}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              settings.liveReload
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title={settings.liveReload ? 'Live reload on' : 'Live reload off'}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className={clsx('w-4 h-4', isRefreshing && 'animate-spin')} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="Preview settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* External Link */}
          {onOpenExternal && (
            <button
              onClick={onOpenExternal}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 grid grid-cols-4 gap-4">
              {/* Theme Presets */}
              <div>
                <label className="block text-sm font-medium mb-2">Theme Preset</label>
                <div className="flex flex-wrap gap-2">
                  {themePresets.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
                        selectedTheme.id === theme.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-sm">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Presets */}
              <div>
                <label className="block text-sm font-medium mb-2">Typography</label>
                <div className="flex flex-wrap gap-2">
                  {fontPresets.map(font => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg border transition-colors text-sm',
                        selectedFont.id === font.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      )}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Options */}
              <div>
                <label className="block text-sm font-medium mb-2">Display Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.showMetaInfo}
                      onChange={e => setSettings(s => ({ ...s, showMetaInfo: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Show meta info</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.showRulers}
                      onChange={e => setSettings(s => ({ ...s, showRulers: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Show rulers</span>
                  </label>
                </div>
              </div>

              {/* Simulation */}
              <div>
                <label className="block text-sm font-medium mb-2">Simulation</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.simulateSlowConnection}
                      onChange={e => setSettings(s => ({ ...s, simulateSlowConnection: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Slow connection</span>
                    {settings.simulateSlowConnection ? (
                      <WifiOff className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Wifi className="w-4 h-4 text-green-500" />
                    )}
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{selectedDevice.width} × {selectedDevice.height}</span>
          <span>Zoom: {settings.zoom}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          {settings.liveReload && (
            <span className="flex items-center gap-1 text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
        {settings.showRulers && (
          <>
            {/* Horizontal Ruler */}
            <div className="absolute top-0 left-16 right-0 h-6 bg-gray-200 dark:bg-gray-700 flex items-end">
              {Array.from({ length: Math.ceil(dimensions.width / 100) }, (_, i) => (
                <div key={i} className="relative" style={{ width: 100 * (settings.zoom / 100) }}>
                  <span className="absolute left-0 text-[10px] text-gray-500">{i * 100}</span>
                </div>
              ))}
            </div>
            {/* Vertical Ruler */}
            <div className="absolute top-6 left-0 w-6 h-full bg-gray-200 dark:bg-gray-700 flex flex-col">
              {Array.from({ length: Math.ceil(dimensions.height / 100) }, (_, i) => (
                <div key={i} className="relative" style={{ height: 100 * (settings.zoom / 100) }}>
                  <span className="absolute top-0 left-1 text-[10px] text-gray-500 -rotate-90 origin-left">{i * 100}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Device Frame */}
        <motion.div
          layout
          className="relative bg-gray-900 rounded-3xl p-3 shadow-2xl"
          style={{
            width: dimensions.width + 24,
            height: dimensions.height + 24,
          }}
        >
          {/* Device Notch (for mobile) */}
          {selectedDevice.id.includes('mobile') && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-b-xl z-10" />
          )}

          <iframe
            ref={previewRef}
            srcDoc={previewHTML}
            className="w-full h-full bg-white rounded-2xl"
            style={{
              width: dimensions.width,
              height: dimensions.height,
            }}
            title="Live Preview"
          />

          {/* Device Home Button (for some devices) */}
          {(selectedDevice.id === 'tablet' || selectedDevice.id === 'tablet-landscape') && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-800 rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  )
}
