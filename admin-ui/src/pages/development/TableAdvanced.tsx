import { useState, useEffect } from 'react'
import {
  Table2,
  Copy,
  BarChart2,
  Zap,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  HardDrive,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react'
import clsx from 'clsx'

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

// Types
interface TableStatistics {
  table_name: string
  total_rows: number
  live_rows: number
  dead_rows: number
  table_size: string
  index_size: string
  total_size: string
  bloat_ratio: number
  last_vacuum: string | null
  last_autovacuum: string | null
  last_analyze: string | null
  last_autoanalyze: string | null
  seq_scan: number
  seq_tup_read: number
  idx_scan: number
  idx_tup_fetch: number
  n_tup_ins: number
  n_tup_upd: number
  n_tup_del: number
}

interface IndexRecommendation {
  table_name: string
  column_name: string
  recommendation: string
  reason: string
  estimated_improvement: string
  create_statement: string
}

interface PartitionInfo {
  partition_name: string
  parent_table: string
  partition_expression: string
  partition_strategy: string
  num_partitions: number
  partition_bounds: { name: string; bounds: string }[]
}

interface TableInfo {
  name: string
  schema: string
  rows: number
  size: string
}

export default function TableAdvanced() {
  const [activeTab, setActiveTab] = useState<'statistics' | 'indexes' | 'clone' | 'partitions'>('statistics')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Available tables
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState('')

  // Statistics state
  const [statistics, setStatistics] = useState<TableStatistics | null>(null)

  // Index recommendations state
  const [recommendations, setRecommendations] = useState<IndexRecommendation[]>([])

  // Clone state
  const [cloneTarget, setCloneTarget] = useState('')
  const [cloneOptions, setCloneOptions] = useState({
    include_data: true,
    include_indexes: true,
    include_constraints: true,
    include_triggers: false,
  })

  // Partitions state
  const [partitionInfo, setPartitionInfo] = useState<PartitionInfo | null>(null)
  const [newPartition, setNewPartition] = useState({
    strategy: 'RANGE',
    column: '',
    partitions: [{ name: '', bounds: '' }],
  })

  // Fetch tables on mount
  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/tables`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setTables(data.data)
          if (data.data.length > 0 && !selectedTable) {
            setSelectedTable(data.data[0].name)
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err)
    }
  }

  // Fetch table statistics
  const fetchStatistics = async () => {
    if (!selectedTable) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${selectedTable}/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setStatistics(data.data)
      } else {
        setError(data.error || 'Failed to fetch statistics')
      }
    } catch (err) {
      setError('Failed to fetch table statistics')
    } finally {
      setLoading(false)
    }
  }

  // Fetch index recommendations
  const fetchRecommendations = async () => {
    if (!selectedTable) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${selectedTable}/index-recommendations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setRecommendations(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch recommendations')
      }
    } catch (err) {
      setError('Failed to fetch index recommendations')
    } finally {
      setLoading(false)
    }
  }

  // Clone table
  const cloneTable = async () => {
    if (!selectedTable || !cloneTarget.trim()) {
      setError('Please enter a target table name')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${selectedTable}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          target_table: cloneTarget,
          ...cloneOptions,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSuccess(`Table "${selectedTable}" cloned to "${cloneTarget}" successfully!`)
        setCloneTarget('')
        await fetchTables()
      } else {
        setError(data.error || 'Failed to clone table')
      }
    } catch (err) {
      setError('Failed to clone table')
    } finally {
      setLoading(false)
    }
  }

  // Fetch partition info
  const fetchPartitionInfo = async () => {
    if (!selectedTable) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${selectedTable}/partitions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setPartitionInfo(data.data)
      } else {
        setError(data.error || 'Failed to fetch partition info')
      }
    } catch (err) {
      setError('Failed to fetch partition info')
    } finally {
      setLoading(false)
    }
  }

  // Create partitions
  const createPartitions = async () => {
    if (!selectedTable || !newPartition.column) {
      setError('Please fill in all partition details')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${selectedTable}/partitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          strategy: newPartition.strategy,
          partition_column: newPartition.column,
          partitions: newPartition.partitions.filter(p => p.name && p.bounds),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSuccess('Partitions created successfully!')
        await fetchPartitionInfo()
      } else {
        setError(data.error || 'Failed to create partitions')
      }
    } catch (err) {
      setError('Failed to create partitions')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Format number
  const formatNumber = (num: number) => num.toLocaleString()

  // Render statistics
  const renderStatistics = () => {
    if (!statistics) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a table and click Refresh to view statistics</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Size overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Table Size</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{statistics.table_size}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Index Size</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{statistics.index_size}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{statistics.total_size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Row Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Rows</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(statistics.total_rows)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Live Rows</p>
              <p className="text-xl font-semibold text-green-600">{formatNumber(statistics.live_rows)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dead Rows</p>
              <p className={clsx(
                'text-xl font-semibold',
                statistics.dead_rows > statistics.live_rows * 0.1 ? 'text-red-600' : 'text-gray-900 dark:text-white'
              )}>{formatNumber(statistics.dead_rows)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bloat Ratio</p>
              <p className={clsx(
                'text-xl font-semibold',
                statistics.bloat_ratio > 20 ? 'text-red-600' :
                statistics.bloat_ratio > 10 ? 'text-yellow-600' : 'text-green-600'
              )}>{statistics.bloat_ratio.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Scan statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Scan Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sequential Scans</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(statistics.seq_scan)}</p>
              <p className="text-xs text-gray-400">{formatNumber(statistics.seq_tup_read)} rows read</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Index Scans</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(statistics.idx_scan)}</p>
              <p className="text-xs text-gray-400">{formatNumber(statistics.idx_tup_fetch)} rows fetched</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Index Usage</p>
              <p className={clsx(
                'text-xl font-semibold',
                statistics.idx_scan > statistics.seq_scan ? 'text-green-600' :
                statistics.idx_scan > 0 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {statistics.seq_scan + statistics.idx_scan > 0
                  ? ((statistics.idx_scan / (statistics.seq_scan + statistics.idx_scan)) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">DML Operations</p>
              <p className="text-xs text-gray-400">
                INS: {formatNumber(statistics.n_tup_ins)} |
                UPD: {formatNumber(statistics.n_tup_upd)} |
                DEL: {formatNumber(statistics.n_tup_del)}
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            <Clock className="w-4 h-4 inline mr-2" />
            Maintenance History
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Vacuum</p>
              <p className="text-gray-900 dark:text-white">
                {statistics.last_vacuum ? new Date(statistics.last_vacuum).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Autovacuum</p>
              <p className="text-gray-900 dark:text-white">
                {statistics.last_autovacuum ? new Date(statistics.last_autovacuum).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Analyze</p>
              <p className="text-gray-900 dark:text-white">
                {statistics.last_analyze ? new Date(statistics.last_analyze).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Autoanalyze</p>
              <p className="text-gray-900 dark:text-white">
                {statistics.last_autoanalyze ? new Date(statistics.last_autoanalyze).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render index recommendations
  const renderRecommendations = () => (
    <div className="space-y-4">
      <button onClick={fetchRecommendations} disabled={loading || !selectedTable} className="btn btn-primary">
        <Zap className="w-4 h-4 mr-2" />
        Analyze Indexes
      </button>

      {recommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <p>No index recommendations</p>
          <p className="text-sm">Your table indexes appear to be optimized</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      rec.estimated_improvement === 'Significant'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : rec.estimated_improvement === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}>
                      {rec.estimated_improvement} Impact
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {rec.recommendation}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.reason}</p>
                  {rec.column_name && (
                    <p className="text-xs text-gray-500">Column: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{rec.column_name}</code></p>
                  )}
                  {rec.create_statement && (
                    <pre className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-700/50 p-2 rounded overflow-x-auto">
                      {rec.create_statement}
                    </pre>
                  )}
                </div>
                {rec.create_statement && (
                  <button
                    onClick={() => copyToClipboard(rec.create_statement)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render clone
  const renderClone = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Clone Table</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source Table
            </label>
            <p className="text-lg font-semibold text-primary-600">{selectedTable || 'No table selected'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Table Name
            </label>
            <input
              type="text"
              value={cloneTarget}
              onChange={(e) => setCloneTarget(e.target.value)}
              placeholder={`${selectedTable}_copy`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cloneOptions.include_data}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, include_data: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Data</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cloneOptions.include_indexes}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, include_indexes: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Indexes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cloneOptions.include_constraints}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, include_constraints: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Constraints</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cloneOptions.include_triggers}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, include_triggers: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Triggers</span>
              </label>
            </div>
          </div>

          <button
            onClick={cloneTable}
            disabled={loading || !selectedTable || !cloneTarget.trim()}
            className="btn btn-primary"
          >
            <Copy className="w-4 h-4 mr-2" />
            Clone Table
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">About Table Cloning</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-blue-600 dark:text-blue-400">
              <li>Creates an exact copy of the table structure</li>
              <li>Optionally copies all data to the new table</li>
              <li>Can include or exclude indexes, constraints, and triggers</li>
              <li>The new table will have a separate OID and storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // Render partitions
  const renderPartitions = () => (
    <div className="space-y-4">
      <button onClick={fetchPartitionInfo} disabled={loading || !selectedTable} className="btn btn-secondary">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Partition Info
      </button>

      {partitionInfo ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            <Layers className="w-4 h-4 inline mr-2" />
            Partition Information
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Strategy:</span> <span className="font-medium">{partitionInfo.partition_strategy}</span></p>
            <p><span className="text-gray-500">Expression:</span> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{partitionInfo.partition_expression}</code></p>
            <p><span className="text-gray-500">Partitions:</span> <span className="font-medium">{partitionInfo.num_partitions}</span></p>
          </div>

          {partitionInfo.partition_bounds.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Partition Bounds</h4>
              <div className="space-y-1">
                {partitionInfo.partition_bounds.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                    <span className="font-mono">{p.name}</span>
                    <span className="text-gray-500">{p.bounds}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Create Partitioned Table</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Partition Strategy
                </label>
                <select
                  value={newPartition.strategy}
                  onChange={(e) => setNewPartition({ ...newPartition, strategy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="RANGE">RANGE</option>
                  <option value="LIST">LIST</option>
                  <option value="HASH">HASH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Partition Column
                </label>
                <input
                  type="text"
                  value={newPartition.column}
                  onChange={(e) => setNewPartition({ ...newPartition, column: e.target.value })}
                  placeholder="e.g., created_at"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Partitions
              </label>
              <div className="space-y-2">
                {newPartition.partitions.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...newPartition.partitions]
                        updated[idx].name = e.target.value
                        setNewPartition({ ...newPartition, partitions: updated })
                      }}
                      placeholder="Partition name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={p.bounds}
                      onChange={(e) => {
                        const updated = [...newPartition.partitions]
                        updated[idx].bounds = e.target.value
                        setNewPartition({ ...newPartition, partitions: updated })
                      }}
                      placeholder="Bounds (e.g., FROM ('2024-01-01') TO ('2024-02-01'))"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        const updated = newPartition.partitions.filter((_, i) => i !== idx)
                        setNewPartition({ ...newPartition, partitions: updated })
                      }}
                      className="btn btn-danger btn-sm"
                      disabled={newPartition.partitions.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewPartition({
                    ...newPartition,
                    partitions: [...newPartition.partitions, { name: '', bounds: '' }]
                  })}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Partition
                </button>
              </div>
            </div>

            <button
              onClick={createPartitions}
              disabled={loading || !selectedTable || !newPartition.column}
              className="btn btn-primary"
            >
              <Layers className="w-4 h-4 mr-2" />
              Create Partitions
            </button>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">Important Notes</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-yellow-600 dark:text-yellow-400">
              <li>Partitioning requires PostgreSQL 10+</li>
              <li>Existing data must be migrated manually</li>
              <li>The partition column cannot be changed after creation</li>
              <li>Consider your query patterns when choosing a partition strategy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Table Advanced Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Statistics, index optimization, cloning, and partitioning
        </p>
      </div>

      {/* Table selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Table</label>
        <select
          value={selectedTable}
          onChange={(e) => {
            setSelectedTable(e.target.value)
            setStatistics(null)
            setRecommendations([])
            setPartitionInfo(null)
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select a table...</option>
          {tables.map(t => (
            <option key={t.name} value={t.name}>{t.name} ({t.rows} rows, {t.size})</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-green-700 dark:text-green-300">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'statistics', label: 'Statistics', icon: BarChart2 },
              { id: 'indexes', label: 'Index Recommendations', icon: Zap },
              { id: 'clone', label: 'Clone Table', icon: Copy },
              { id: 'partitions', label: 'Partitions', icon: Layers },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
          {!loading && activeTab === 'statistics' && renderStatistics()}
          {!loading && activeTab === 'indexes' && renderRecommendations()}
          {!loading && activeTab === 'clone' && renderClone()}
          {!loading && activeTab === 'partitions' && renderPartitions()}

          {/* Refresh button for statistics */}
          {activeTab === 'statistics' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={fetchStatistics} disabled={loading || !selectedTable} className="btn btn-secondary">
                <RefreshCw className={clsx('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Refresh Statistics
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
