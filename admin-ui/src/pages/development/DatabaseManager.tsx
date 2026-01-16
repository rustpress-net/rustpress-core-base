import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Database,
  Server,
  HardDrive,
  Activity,
  Table2,
  Terminal,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  AlertTriangle,
  Info,
  Settings,
  Play,
} from 'lucide-react'
import clsx from 'clsx'

// API base URL - adjust based on your setup
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

interface DatabaseStatus {
  connected: boolean
  type: string
  version: string
  host: string
  port: number
  database: string
  user: string
  ssl: boolean
  uptime: string
  poolSize: number
  activeConnections: number
  idleConnections: number
}

interface DatabaseStats {
  totalTables: number
  totalRows: number
  databaseSize: string
  indexSize: string
  cacheHitRatio: number
  avgQueryTime: number
  queriesPerSecond: number
  slowQueries: number
}

interface RecentQuery {
  id: string
  query: string
  executionTime: number
  rowCount: number | null
  timestamp: string
  status: 'success' | 'error'
}

// Default values for when API is unavailable
const defaultStatus: DatabaseStatus = {
  connected: false,
  type: 'PostgreSQL',
  version: 'Unknown',
  host: 'localhost',
  port: 5432,
  database: 'rustpress',
  user: 'unknown',
  ssl: false,
  uptime: 'Unknown',
  poolSize: 0,
  activeConnections: 0,
  idleConnections: 0,
}

const defaultStats: DatabaseStats = {
  totalTables: 0,
  totalRows: 0,
  databaseSize: '0 MB',
  indexSize: '0 MB',
  cacheHitRatio: 0,
  avgQueryTime: 0,
  queriesPerSecond: 0,
  slowQueries: 0,
}

const quickActions = [
  {
    name: 'Browse Tables',
    description: 'View and manage database tables',
    href: '/database/tables',
    icon: Table2,
    color: 'bg-blue-500',
  },
  {
    name: 'SQL Query',
    description: 'Execute custom SQL queries',
    href: '/database/sql',
    icon: Terminal,
    color: 'bg-purple-500',
  },
  {
    name: 'Import Data',
    description: 'Import SQL or CSV files',
    href: '/database/import',
    icon: Upload,
    color: 'bg-green-500',
  },
  {
    name: 'Export Data',
    description: 'Export tables or query results',
    href: '/database/export',
    icon: Download,
    color: 'bg-orange-500',
  },
]

export default function DatabaseManager() {
  const [status, setStatus] = useState<DatabaseStatus>(defaultStatus)
  const [stats, setStats] = useState<DatabaseStats>(defaultStats)
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [readOnlyMode, setReadOnlyMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch database status from API
  const fetchDatabaseStatus = useCallback(async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          setStatus({
            connected: data.connected,
            type: data.db_type || 'PostgreSQL',
            version: data.version,
            host: data.host,
            port: data.port,
            database: data.database,
            user: data.user,
            ssl: data.ssl,
            uptime: data.uptime,
            poolSize: data.pool_size,
            activeConnections: data.active_connections,
            idleConnections: data.idle_connections,
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch database status:', err)
    }
  }, [])

  // Fetch database statistics from API
  const fetchDatabaseStats = useCallback(async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          setStats({
            totalTables: data.total_tables,
            totalRows: data.total_rows,
            databaseSize: data.database_size,
            indexSize: data.index_size,
            cacheHitRatio: data.cache_hit_ratio,
            avgQueryTime: data.avg_query_time,
            queriesPerSecond: data.queries_per_second,
            slowQueries: data.slow_queries,
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch database stats:', err)
    }
  }, [])

  // Fetch recent query history from API
  const fetchRecentQueries = useCallback(async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/query/history?limit=10`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.history) {
          const history = result.data.history.map((item: any) => ({
            id: item.id,
            query: item.query,
            executionTime: item.execution_time,
            rowCount: item.row_count,
            timestamp: formatTimestamp(item.timestamp),
            status: item.status as 'success' | 'error',
          }))
          setRecentQueries(history)
        }
      }
    } catch (err) {
      console.error('Failed to fetch query history:', err)
    }
  }, [])

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      await Promise.all([
        fetchDatabaseStatus(),
        fetchDatabaseStats(),
        fetchRecentQueries(),
      ])
    } catch (err) {
      setError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Fetch initial data from API
    fetchDatabaseStatus()
    fetchDatabaseStats()
    fetchRecentQueries()
  }, [fetchDatabaseStatus, fetchDatabaseStats, fetchRecentQueries])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Database Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your database tables, execute queries, and monitor performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={readOnlyMode}
              onChange={(e) => setReadOnlyMode(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Read-only mode
          </label>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={clsx('w-4 h-4', isRefreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Read-only mode warning */}
      {readOnlyMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Read-only mode is enabled
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              All write operations (INSERT, UPDATE, DELETE, DROP, etc.) are disabled. Only SELECT queries are allowed.
            </p>
          </div>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-500" />
            Connection Status
          </h2>
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
            status.connected
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          )}>
            {status.connected ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Disconnected
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Database Type</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {status.type} {status.version}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Host</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {status.host}:{status.port}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Database</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {status.database}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Uptime</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {status.uptime}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Connection Pool</span>
            <span className="text-gray-900 dark:text-white">
              <span className="text-green-600 dark:text-green-400">{status.activeConnections} active</span>
              {' / '}
              <span className="text-gray-500">{status.idleConnections} idle</span>
              {' / '}
              <span className="font-medium">{status.poolSize} max</span>
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(status.activeConnections / status.poolSize) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Table2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTables}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tables</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.databaseSize}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Database Size</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cacheHitRatio}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cache Hit Ratio</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgQueryTime}ms</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Query Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={clsx('p-3 rounded-lg', action.color)}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {action.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Queries */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Queries
          </h2>
          <Link
            to="/database/sql"
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1"
          >
            View all
            <Play className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentQueries.map((query) => (
            <div
              key={query.id}
              className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className={clsx(
                'p-2 rounded-lg flex-shrink-0',
                query.status === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              )}>
                {query.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <pre className="text-sm font-mono text-gray-900 dark:text-white truncate">
                  {query.query}
                </pre>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {query.executionTime}ms
                  </span>
                  <span>{query.rowCount ?? 0} rows</span>
                  <span>{query.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      {stats.slowQueries > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Performance Notice
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You have {stats.slowQueries} slow queries in the last 24 hours. Consider optimizing these queries or adding indexes.
              </p>
              <Link
                to="/database/sql?tab=slow-queries"
                className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 mt-2"
              >
                View slow queries
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
