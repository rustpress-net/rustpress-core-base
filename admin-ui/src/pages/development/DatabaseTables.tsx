import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Table2,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ChevronRight,
  Database,
  Key,
  Hash,
  Calendar,
  Filter,
  MoreVertical,
  Download,
  Copy,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import clsx from 'clsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

interface TableInfo {
  name: string
  schema: string
  rows: number
  size: string
  indexSize: string
  hasRelations: boolean
  lastModified: string
  type: 'table' | 'view' | 'materialized_view'
}

interface ApiTableInfo {
  name: string
  schema: string
  rows: number
  size: string
  index_size: string
  has_relations: boolean
  last_modified: string
  type: string
}

type SortField = 'name' | 'rows' | 'size' | 'lastModified'
type SortOrder = 'asc' | 'desc'

export default function DatabaseTables() {
  const navigate = useNavigate()
  const [tables, setTables] = useState<TableInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set())
  const [showSystemTables, setShowSystemTables] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'table' | 'view'>('all')
  const [contextMenu, setContextMenu] = useState<{ table: string; x: number; y: number } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchTables = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (showSystemTables) {
        params.append('showSystem', 'true')
      }

      const response = await fetch(`${DBMANAGER_API}/tables?${params}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data?.tables) {
        const mappedTables: TableInfo[] = result.data.tables.map((t: ApiTableInfo) => ({
          name: t.name,
          schema: t.schema,
          rows: t.rows,
          size: t.size,
          indexSize: t.index_size,
          hasRelations: t.has_relations,
          lastModified: t.last_modified || '-',
          type: t.type === 'view' ? 'view' : t.type === 'materialized_view' ? 'materialized_view' : 'table',
        }))
        setTables(mappedTables)
      } else {
        throw new Error(result.error || 'Failed to fetch tables')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [showSystemTables])

  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true)
      await fetchTables()
      setIsLoading(false)
    }
    loadTables()
  }, [fetchTables])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchTables()
    setIsRefreshing(false)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`${DBMANAGER_API}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newTableName.trim(),
          columns: [
            { name: 'id', type: 'SERIAL', primaryKey: true },
            { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create table')
      }

      setShowCreateModal(false)
      setNewTableName('')
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create table')
    } finally {
      setIsCreating(false)
    }
  }

  const toggleTableSelection = (tableName: string) => {
    const newSelection = new Set(selectedTables)
    if (newSelection.has(tableName)) {
      newSelection.delete(tableName)
    } else {
      newSelection.add(tableName)
    }
    setSelectedTables(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedTables.size === filteredTables.length) {
      setSelectedTables(new Set())
    } else {
      setSelectedTables(new Set(filteredTables.map(t => t.name)))
    }
  }

  const filteredTables = tables
    .filter(table => {
      if (!showSystemTables && table.name.startsWith('pg_')) return false
      if (filterType !== 'all' && table.type !== filterType) return false
      if (searchQuery && !table.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rows':
          comparison = a.rows - b.rows
          break
        case 'size':
          comparison = parseFloat(a.size) - parseFloat(b.size)
          break
        case 'lastModified':
          comparison = a.lastModified.localeCompare(b.lastModified)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const totalSize = tables.reduce((acc, t) => {
    const size = parseFloat(t.size) || 0
    return acc + size
  }, 0)

  const totalRows = tables.reduce((acc, t) => acc + t.rows, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Database Tables
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {tables.length} tables, {totalRows.toLocaleString()} total rows, ~{totalSize.toFixed(1)} MB
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={clsx('w-4 h-4', isRefreshing && 'animate-spin')} />
            Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Table
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'table' | 'view')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="table">Tables</option>
              <option value="view">Views</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showSystemTables}
                onChange={(e) => setShowSystemTables(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Show system tables
            </label>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTables.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
            {selectedTables.size} table{selectedTables.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="btn btn-danger btn-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Drop
            </button>
          </div>
        </div>
      )}

      {/* Tables List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTables.size === filteredTables.length && filteredTables.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Table Name
                    {sortField === 'name' && (
                      <span className="text-primary-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('rows')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Rows
                    {sortField === 'rows' && (
                      <span className="text-primary-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Size
                    {sortField === 'size' && (
                      <span className="text-primary-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Index Size
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('lastModified')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Last Modified
                    {sortField === 'lastModified' && (
                      <span className="text-primary-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {!isLoading && !error && filteredTables.map((table) => (
                <tr
                  key={table.name}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => navigate(`/development/database/tables/${table.name}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedTables.has(table.name)}
                      onChange={() => toggleTableSelection(table.name)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'p-2 rounded-lg',
                        table.type === 'table' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        table.type === 'view' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      )}>
                        <Table2 className={clsx(
                          'w-4 h-4',
                          table.type === 'table' ? 'text-blue-600 dark:text-blue-400' :
                          table.type === 'view' ? 'text-purple-600 dark:text-purple-400' :
                          'text-orange-600 dark:text-orange-400'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {table.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {table.schema}
                        </p>
                      </div>
                      {table.hasRelations && (
                        <span title="Has foreign keys">
                          <Key className="w-3 h-3 text-gray-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      table.type === 'table' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      table.type === 'view' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    )}>
                      {table.type === 'materialized_view' ? 'mat. view' : table.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                    {table.rows.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                    {table.size}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-gray-500 dark:text-gray-400">
                    {table.indexSize}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                    {table.lastModified}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        setContextMenu({
                          table: table.name,
                          x: e.clientX,
                          y: e.clientY,
                        })
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">
              Loading tables...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="btn btn-secondary"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No tables found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                navigate(`/development/database/tables/${contextMenu.table}`)
                setContextMenu(null)
              }}
            >
              <Eye className="w-4 h-4" />
              Browse Data
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setContextMenu(null)}
            >
              <Edit3 className="w-4 h-4" />
              Edit Structure
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setContextMenu(null)}
            >
              <Copy className="w-4 h-4" />
              Copy Name
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setContextMenu(null)}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              className="w-full px-4 py-2 text-left text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setContextMenu(null)}
            >
              <AlertTriangle className="w-4 h-4" />
              Truncate
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setContextMenu(null)}
            >
              <Trash2 className="w-4 h-4" />
              Drop Table
            </button>
          </div>
        </>
      )}

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Table
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="my_new_table"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A new table will be created with default columns (id, created_at). You can add more columns after creation.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewTableName('')
                }}
                className="btn btn-secondary"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                disabled={isCreating || !newTableName.trim()}
                className="btn btn-primary flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Table
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
