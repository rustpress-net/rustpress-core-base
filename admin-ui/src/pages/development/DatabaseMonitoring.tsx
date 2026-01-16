import { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  Database,
  Clock,
  Lock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  FileText,
  BarChart2,
  Eye,
  Copy,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

// Types
interface ConnectionPoolStats {
  pool_size: number
  active_connections: number
  idle_connections: number
  waiting_requests: number
  max_connections: number
  connections_by_state: Record<string, number>
  connections_by_application: Record<string, number>
  oldest_connection_seconds: number
  average_query_time_ms: number
}

interface SlowQueryEntry {
  id: string
  query: string
  execution_time_ms: number
  rows_affected: number | null
  plan: unknown | null
  logged_at: string
}

interface LockInfo {
  pid: number
  lock_type: string
  database: string | null
  relation: string | null
  mode: string
  granted: boolean
  wait_start: string | null
  query: string
  application_name: string | null
  blocking_pids: number[]
}

interface AuditDashboard {
  total_queries_today: number
  total_queries_week: number
  queries_by_type: Record<string, number>
  queries_by_hour: { hour: number; count: number }[]
  top_tables_accessed: { table: string; count: number }[]
  avg_query_time_today: number
  slow_queries_today: number
  error_rate_today: number
}

export default function DatabaseMonitoring() {
  const [activeTab, setActiveTab] = useState<'pool' | 'slow' | 'locks' | 'audit'>('pool')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Pool stats state
  const [poolStats, setPoolStats] = useState<ConnectionPoolStats | null>(null)

  // Slow queries state
  const [slowQueries, setSlowQueries] = useState<SlowQueryEntry[]>([])
  const [minExecutionTime, setMinExecutionTime] = useState(1000)
  const [slowQueryLimit, setSlowQueryLimit] = useState(50)

  // Locks state
  const [locks, setLocks] = useState<LockInfo[]>([])
  const [showOnlyBlocking, setShowOnlyBlocking] = useState(false)

  // Audit dashboard state
  const [auditData, setAuditData] = useState<AuditDashboard | null>(null)

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshCurrentTab()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, activeTab])

  const refreshCurrentTab = useCallback(() => {
    switch (activeTab) {
      case 'pool':
        fetchPoolStats()
        break
      case 'slow':
        fetchSlowQueries()
        break
      case 'locks':
        fetchLocks()
        break
      case 'audit':
        fetchAuditDashboard()
        break
    }
  }, [activeTab])

  // Fetch pool stats
  const fetchPoolStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/pool/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setPoolStats(data.data)
      } else {
        setError(data.error || 'Failed to fetch pool stats')
      }
    } catch (err) {
      setError('Failed to fetch connection pool stats')
    } finally {
      setLoading(false)
    }
  }

  // Fetch slow queries
  const fetchSlowQueries = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${DBMANAGER_API}/query/slow?min_execution_time_ms=${minExecutionTime}&limit=${slowQueryLimit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )
      const data = await response.json()
      if (data.success) {
        setSlowQueries(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch slow queries')
      }
    } catch (err) {
      setError('Failed to fetch slow queries')
    } finally {
      setLoading(false)
    }
  }

  // Fetch locks
  const fetchLocks = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/locks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setLocks(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch locks')
      }
    } catch (err) {
      setError('Failed to fetch locks')
    } finally {
      setLoading(false)
    }
  }

  // Fetch audit dashboard
  const fetchAuditDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/audit/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setAuditData(data.data)
      } else {
        setError(data.error || 'Failed to fetch audit data')
      }
    } catch (err) {
      setError('Failed to fetch audit dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
    return `${(ms / 60000).toFixed(2)}min`
  }

  // Render pool stats
  const renderPoolStats = () => {
    if (!poolStats) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click Refresh to load connection pool statistics</p>
        </div>
      )
    }

    const connectionUsage = (poolStats.active_connections / poolStats.max_connections) * 100

    return (
      <div className="space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Connections</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{poolStats.active_connections}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={clsx(
                    'h-2 rounded-full transition-all',
                    connectionUsage > 80 ? 'bg-red-500' : connectionUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                  style={{ width: `${Math.min(connectionUsage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{connectionUsage.toFixed(1)}% of max ({poolStats.max_connections})</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Idle Connections</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{poolStats.idle_connections}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pool Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{poolStats.pool_size}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Query Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(poolStats.average_query_time_ms)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Connections by state */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Connections by State</h3>
            <div className="space-y-2">
              {Object.entries(poolStats.connections_by_state).map(([state, count]) => (
                <div key={state} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{state}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Connections by Application</h3>
            <div className="space-y-2">
              {Object.entries(poolStats.connections_by_application).length === 0 ? (
                <p className="text-sm text-gray-500">No application data available</p>
              ) : (
                Object.entries(poolStats.connections_by_application).map(([app, count]) => (
                  <div key={app} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{app || 'Unknown'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render slow queries
  const renderSlowQueries = () => (
    <div className="space-y-4">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Execution Time (ms)
          </label>
          <input
            type="number"
            value={minExecutionTime}
            onChange={(e) => setMinExecutionTime(parseInt(e.target.value) || 0)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limit</label>
          <select
            value={slowQueryLimit}
            onChange={(e) => setSlowQueryLimit(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
        <button onClick={fetchSlowQueries} disabled={loading} className="btn btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Fetch Slow Queries
        </button>
      </div>

      {slowQueries.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No slow queries found</p>
          <p className="text-sm">Queries taking longer than {minExecutionTime}ms will appear here</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Slow Queries ({slowQueries.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-auto">
            {slowQueries.map((query) => (
              <div key={query.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                      {query.query}
                    </pre>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className={clsx(
                        'px-2 py-0.5 rounded',
                        query.execution_time_ms > 5000
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : query.execution_time_ms > 2000
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {formatDuration(query.execution_time_ms)}
                      </span>
                      {query.rows_affected !== null && (
                        <span>{query.rows_affected} rows</span>
                      )}
                      <span>{new Date(query.logged_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(query.query)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Render locks
  const renderLocks = () => {
    const displayLocks = showOnlyBlocking
      ? locks.filter(l => !l.granted || l.blocking_pids.length > 0)
      : locks

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={fetchLocks} disabled={loading} className="btn btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Locks
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyBlocking}
              onChange={(e) => setShowOnlyBlocking(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show only blocking/waiting</span>
          </label>
        </div>

        {displayLocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>No locks detected</p>
            <p className="text-sm">Database is operating normally</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Active Locks ({displayLocks.length})
              </h3>
              {locks.some(l => !l.granted) && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Waiting locks detected
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">PID</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Type</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Relation</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Mode</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Query</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Blocking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayLocks.map((lock, idx) => (
                    <tr key={idx} className={clsx(
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      !lock.granted && 'bg-red-50 dark:bg-red-900/10'
                    )}>
                      <td className="px-4 py-2 font-mono">{lock.pid}</td>
                      <td className="px-4 py-2">{lock.lock_type}</td>
                      <td className="px-4 py-2">{lock.relation || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs',
                          lock.mode.includes('Exclusive')
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>
                          {lock.mode}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {lock.granted ? (
                          <span className="text-green-600 dark:text-green-400">Granted</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">Waiting</span>
                        )}
                      </td>
                      <td className="px-4 py-2 max-w-xs truncate" title={lock.query}>
                        {lock.query || '-'}
                      </td>
                      <td className="px-4 py-2">
                        {lock.blocking_pids.length > 0
                          ? lock.blocking_pids.join(', ')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render audit dashboard
  const renderAuditDashboard = () => {
    if (!auditData) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click Refresh to load audit analytics</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Queries Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditData.total_queries_today.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Query Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(auditData.avg_query_time_today)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Slow Queries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditData.slow_queries_today}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditData.error_rate_today.toFixed(2)}%</p>
              </div>
              <div className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center',
                auditData.error_rate_today > 5
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              )}>
                {auditData.error_rate_today > 5 ? (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Queries by type and top tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Queries by Type</h3>
            <div className="space-y-3">
              {Object.entries(auditData.queries_by_type).map(([type, count]) => {
                const total = Object.values(auditData.queries_by_type).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{type}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={clsx(
                          'h-2 rounded-full',
                          type === 'SELECT' ? 'bg-blue-500' :
                          type === 'INSERT' ? 'bg-green-500' :
                          type === 'UPDATE' ? 'bg-yellow-500' :
                          type === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Top Tables Accessed</h3>
            <div className="space-y-2">
              {auditData.top_tables_accessed.slice(0, 10).map((item, idx) => (
                <div key={item.table} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{idx + 1}.</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.table}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Queries by hour (simple bar representation) */}
        {auditData.queries_by_hour.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Queries by Hour (Today)</h3>
            <div className="flex items-end gap-1 h-32">
              {auditData.queries_by_hour.map((item) => {
                const maxCount = Math.max(...auditData.queries_by_hour.map(h => h.count))
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${item.hour}:00 - ${item.count} queries`}
                    />
                    <span className="text-xs text-gray-400 mt-1">{item.hour}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor connections, performance, and database activity
          </p>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh (5s)</span>
        </label>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'pool', label: 'Connection Pool', icon: Database },
              { id: 'slow', label: 'Slow Queries', icon: Clock },
              { id: 'locks', label: 'Locks', icon: Lock },
              { id: 'audit', label: 'Audit Dashboard', icon: BarChart2 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab)
                }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          )}
          {!loading && activeTab === 'pool' && renderPoolStats()}
          {!loading && activeTab === 'slow' && renderSlowQueries()}
          {!loading && activeTab === 'locks' && renderLocks()}
          {!loading && activeTab === 'audit' && renderAuditDashboard()}

          {/* Refresh button */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={refreshCurrentTab} disabled={loading} className="btn btn-secondary">
              <RefreshCw className={clsx('w-4 h-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
