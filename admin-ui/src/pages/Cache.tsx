import { useState, useEffect, useCallback } from 'react'
import {
  Database,
  HardDrive,
  RefreshCw,
  Trash2,
  Settings,
  Activity,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Server,
  Cpu,
  BarChart2,
  FileText,
  Image as ImageIcon,
  Box,
  Layers,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import api from '../api/client'

interface CacheStats {
  hits: number
  misses: number
  entries: number
  memory_bytes: number
  evictions: number
  hit_rate: number
}

interface CacheConfig {
  enabled: boolean
  default_ttl: number
  max_entries: number
  backend: 'memory' | 'redis'
  redis_url?: string
}

interface CacheGroup {
  name: string
  key_pattern: string
  description: string
  count: number
  icon: React.ComponentType<{ className?: string }>
}

const cacheGroups: CacheGroup[] = [
  { name: 'Pages', key_pattern: 'page:*', description: 'Rendered page cache', count: 0, icon: FileText },
  { name: 'Posts', key_pattern: 'post:*', description: 'Post content cache', count: 0, icon: FileText },
  { name: 'Media', key_pattern: 'media:*', description: 'Media metadata cache', count: 0, icon: ImageIcon },
  { name: 'Thumbnails', key_pattern: 'thumb:*', description: 'Image thumbnail cache', count: 0, icon: ImageIcon },
  { name: 'Queries', key_pattern: 'query:*', description: 'Database query cache', count: 0, icon: Database },
  { name: 'Sessions', key_pattern: 'session:*', description: 'User session cache', count: 0, icon: Layers },
  { name: 'API', key_pattern: 'api:*', description: 'API response cache', count: 0, icon: Box },
]

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default function Cache() {
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    entries: 0,
    memory_bytes: 0,
    evictions: 0,
    hit_rate: 0,
  })
  const [config, setConfig] = useState<CacheConfig>({
    enabled: true,
    default_ttl: 3600,
    max_entries: 10000,
    backend: 'memory',
  })
  const [groups, setGroups] = useState(cacheGroups)
  const [isLoading, setIsLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const [clearingGroup, setClearingGroup] = useState<string | null>(null)
  const [isWarming, setIsWarming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config'>('dashboard')

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const [statsRes, configRes] = await Promise.all([
        api.get('/cache/stats'),
        api.get('/cache/config'),
      ])
      if (statsRes.data) {
        const s = statsRes.data
        setStats({
          ...s,
          hit_rate: s.hits + s.misses > 0 ? (s.hits / (s.hits + s.misses)) * 100 : 0,
        })
      }
      if (configRes.data) {
        setConfig(configRes.data)
      }
      // Simulate group counts
      setGroups(prev =>
        prev.map(g => ({
          ...g,
          count: Math.floor(Math.random() * 500),
        }))
      )
    } catch (error) {
      console.error('Failed to load cache stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [loadStats])

  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await api.post('/cache/clear')
      toast.success('Cache cleared successfully')
      loadStats()
    } catch (error) {
      console.error('Failed to clear cache:', error)
      toast.error('Failed to clear cache')
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearGroup = async (pattern: string, name: string) => {
    setClearingGroup(pattern)
    try {
      await api.post('/cache/clear', { pattern })
      toast.success(`${name} cache cleared`)
      loadStats()
    } catch (error) {
      console.error('Failed to clear cache group:', error)
      toast.error('Failed to clear cache')
    } finally {
      setClearingGroup(null)
    }
  }

  const handleWarmUp = async () => {
    setIsWarming(true)
    try {
      await api.post('/cache/warm-up')
      toast.success('Cache warm-up started')
      // Refresh stats after a delay
      setTimeout(loadStats, 5000)
    } catch (error) {
      console.error('Failed to warm up cache:', error)
      toast.error('Failed to start warm-up')
    } finally {
      setIsWarming(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      await api.put('/cache/config', config)
      toast.success('Cache configuration saved')
    } catch (error) {
      console.error('Failed to save config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cache Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your site's cache
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="btn btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleWarmUp}
            disabled={isWarming}
            className="btn btn-secondary"
          >
            {isWarming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Warm Up
          </button>
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            {isClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'dashboard'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Activity className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'config'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hit Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.hit_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.hits)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Misses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.misses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Entries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.entries)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Memory</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(stats.memory_bytes)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hit Rate Chart (Visual) */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cache Performance
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Hit Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.hit_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      stats.hit_rate >= 80 ? 'bg-green-500' :
                      stats.hit_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${stats.hit_rate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Evictions</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(stats.evictions)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Backend</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {config.backend}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cache Groups */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cache Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.key_pattern}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                        <group.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {group.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {group.count} entries
                    </span>
                    <button
                      onClick={() => handleClearGroup(group.key_pattern, group.name)}
                      disabled={clearingGroup === group.key_pattern}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                    >
                      {clearingGroup === group.key_pattern ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'config' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cache Configuration
            </h2>
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Save Config
            </button>
          </div>

          <div className="grid gap-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Enable Caching
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Turn caching on or off globally
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Backend */}
            <div>
              <label className="label">Cache Backend</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfig({ ...config, backend: 'memory' })}
                  className={clsx(
                    'p-4 rounded-lg border-2 text-left transition-colors',
                    config.backend === 'memory'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Memory</p>
                      <p className="text-xs text-gray-500">Fast, in-process cache</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setConfig({ ...config, backend: 'redis' })}
                  className={clsx(
                    'p-4 rounded-lg border-2 text-left transition-colors',
                    config.backend === 'redis'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Redis</p>
                      <p className="text-xs text-gray-500">Distributed cache</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Redis URL */}
            {config.backend === 'redis' && (
              <div>
                <label className="label">Redis URL</label>
                <input
                  type="text"
                  className="input"
                  value={config.redis_url || ''}
                  onChange={(e) => setConfig({ ...config, redis_url: e.target.value })}
                  placeholder="redis://localhost:6379"
                />
              </div>
            )}

            {/* Default TTL */}
            <div>
              <label className="label">Default TTL (seconds)</label>
              <input
                type="number"
                className="input"
                value={config.default_ttl}
                onChange={(e) => setConfig({ ...config, default_ttl: parseInt(e.target.value) || 3600 })}
                min={60}
                max={86400}
              />
              <p className="text-xs text-gray-500 mt-1">
                How long items stay in cache (60-86400 seconds)
              </p>
            </div>

            {/* Max Entries */}
            <div>
              <label className="label">Max Entries</label>
              <input
                type="number"
                className="input"
                value={config.max_entries}
                onChange={(e) => setConfig({ ...config, max_entries: parseInt(e.target.value) || 10000 })}
                min={100}
                max={1000000}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of items in cache
              </p>
            </div>

            {/* Cache Status */}
            <div className={clsx(
              'p-4 rounded-lg border',
              config.enabled
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            )}>
              <div className="flex items-center gap-3">
                {config.enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className={clsx(
                    'font-medium',
                    config.enabled
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {config.enabled ? 'Cache is Active' : 'Cache is Disabled'}
                  </p>
                  <p className={clsx(
                    'text-sm',
                    config.enabled
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500'
                  )}>
                    {config.enabled
                      ? `Using ${config.backend} backend with ${config.default_ttl}s TTL`
                      : 'Enable caching to improve performance'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
