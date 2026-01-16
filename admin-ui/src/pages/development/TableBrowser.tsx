import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Table2,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Download,
  Copy,
  Key,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Columns,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

interface Column {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  isPrimaryKey: boolean
  isForeignKey: boolean
  references?: { table: string; column: string }
}

interface TableData {
  columns: Column[]
  rows: Record<string, unknown>[]
  totalRows: number
  page: number
  pageSize: number
}

const getTypeIcon = (type: string) => {
  if (type.includes('uuid')) return Key
  if (type.includes('int') || type.includes('serial')) return Hash
  if (type.includes('timestamp') || type.includes('date')) return Calendar
  if (type.includes('bool')) return ToggleLeft
  return Type
}

export default function TableBrowser() {
  const { tableName } = useParams<{ tableName: string }>()
  const [columns, setColumns] = useState<Column[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ row: string; column: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set())
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [filterColumn, setFilterColumn] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [primaryKeyColumns, setPrimaryKeyColumns] = useState<string[]>(['id'])
  const [showInsertModal, setShowInsertModal] = useState(false)
  const [newRowData, setNewRowData] = useState<Record<string, string>>({})
  const [isInserting, setIsInserting] = useState(false)

  const totalPages = Math.ceil(totalRows / pageSize)
  const startRow = totalRows > 0 ? (page - 1) * pageSize + 1 : 0
  const endRow = Math.min(page * pageSize, totalRows)

  // Fetch table structure (columns)
  const fetchTableStructure = useCallback(async () => {
    if (!tableName) return
    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${tableName}/structure`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.columns) {
          const cols = result.data.columns.map((col: any) => ({
            name: col.name,
            type: col.data_type || col.type,
            nullable: col.is_nullable === 'YES' || col.nullable === true,
            defaultValue: col.column_default || col.default_value || null,
            isPrimaryKey: col.is_primary_key || false,
            isForeignKey: col.is_foreign_key || false,
            references: col.references || undefined,
          }))
          setColumns(cols)
          setVisibleColumns(new Set(cols.map((c: Column) => c.name)))
        }
      } else {
        setError('Failed to fetch table structure')
      }
    } catch (err) {
      console.error('Failed to fetch table structure:', err)
      setError('Failed to connect to database')
    }
  }, [tableName])

  // Fetch table data (rows)
  const fetchTableData = useCallback(async () => {
    if (!tableName) return
    setIsRefreshing(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      })
      if (sortColumn) {
        params.append('sortColumn', sortColumn)
        params.append('sortOrder', sortOrder)
      }
      if (filterColumn && filterValue) {
        params.append('filterColumn', filterColumn)
        params.append('filterValue', filterValue)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`${DBMANAGER_API}/tables/${tableName}/data?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setRows(result.data.rows || [])
          setTotalRows(result.data.total || result.data.total_count || result.data.rows?.length || 0)
          // Set primary key columns from API response
          if (result.data.primary_key_columns && result.data.primary_key_columns.length > 0) {
            setPrimaryKeyColumns(result.data.primary_key_columns)
          }
        }
      } else {
        setError('Failed to fetch table data')
      }
    } catch (err) {
      console.error('Failed to fetch table data:', err)
      setError('Failed to connect to database')
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }, [tableName, page, pageSize, sortColumn, sortOrder, filterColumn, filterValue, searchQuery])

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    fetchTableStructure()
  }, [fetchTableStructure])

  // Fetch data when structure loads or filters change
  useEffect(() => {
    if (columns.length > 0) {
      fetchTableData()
    }
  }, [columns.length, fetchTableData])

  const handleRefresh = async () => {
    await fetchTableData()
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(rows.map(r => r.id as string)))
    }
  }

  const startEditing = (rowId: string, column: string, value: unknown) => {
    setEditingCell({ row: rowId, column })
    setEditValue(value === null ? '' : String(value))
  }

  const saveEdit = async () => {
    if (editingCell && tableName) {
      try {
        // Use dynamic primary key from API
        const pkName = primaryKeyColumns[0] || 'id'
        const row = rows.find(r => r[pkName] === editingCell.row)
        if (!row) return

        const response = await fetch(`${DBMANAGER_API}/tables/${tableName}/rows/${editingCell.row}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            data: {
              [editingCell.column]: editValue || null,
            },
          }),
        })

        if (response.ok) {
          // Update local state optimistically
          setRows(rows.map(r => {
            if (r[pkName] === editingCell.row) {
              return { ...r, [editingCell.column]: editValue || null }
            }
            return r
          }))
        } else {
          const data = await response.json()
          console.error('Failed to save:', data.error)
        }
      } catch (err) {
        console.error('Failed to save edit:', err)
      }
      setEditingCell(null)
    }
  }

  const deleteSelectedRows = async () => {
    if (selectedRows.size === 0 || !tableName || !confirmDelete) return

    try {
      // Use dynamic primary key from API
      const pkName = primaryKeyColumns[0] || 'id'

      const response = await fetch(`${DBMANAGER_API}/tables/${tableName}/rows/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          ids: Array.from(selectedRows),
        }),
      })

      if (response.ok) {
        setSelectedRows(new Set())
        setConfirmDelete(false)
        await fetchTableData()
      } else {
        const data = await response.json()
        console.error('Failed to delete:', data.error)
      }
    } catch (err) {
      console.error('Failed to delete rows:', err)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleInsertRow = async () => {
    if (!tableName) return

    setIsInserting(true)
    try {
      // Filter out empty values and prepare data
      const dataToInsert: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(newRowData)) {
        if (value !== '') {
          dataToInsert[key] = value
        }
      }

      const response = await fetch(`${DBMANAGER_API}/tables/${tableName}/rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ data: dataToInsert }),
      })

      if (response.ok) {
        setShowInsertModal(false)
        setNewRowData({})
        await fetchTableData()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to insert row')
      }
    } catch (err) {
      console.error('Failed to insert row:', err)
      setError('Failed to insert row')
    } finally {
      setIsInserting(false)
    }
  }

  const formatCellValue = (value: unknown, type: string): string => {
    if (value === null || value === undefined) return '(NULL)'
    if (type.includes('timestamp') || type.includes('date')) {
      return new Date(value as string).toLocaleString()
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    const str = String(value)
    if (str.length > 50) return str.slice(0, 50) + '...'
    return str
  }

  const displayedColumns = columns.filter(c => visibleColumns.has(c.name))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/development/database/tables" className="hover:text-gray-700 dark:hover:text-gray-200">
              Tables
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{tableName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Table2 className="w-6 h-6 text-blue-600" />
            {tableName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {totalRows.toLocaleString()} rows, {columns.length} columns
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
          <button onClick={() => setShowInsertModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Insert Row
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in all columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Filter by column...</option>
              {columns.map(col => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
            {filterColumn && (
              <input
                type="text"
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>

          {/* Column Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Columns className="w-4 h-4" />
              Columns
            </button>
            {showColumnPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColumnPicker(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Visible Columns
                  </p>
                  {columns.map(col => (
                    <label key={col.name} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.name)}
                        onChange={(e) => {
                          const newVisible = new Set(visibleColumns)
                          if (e.target.checked) {
                            newVisible.add(col.name)
                          } else {
                            newVisible.delete(col.name)
                          }
                          setVisibleColumns(newVisible)
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{col.name}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={500}>500 rows</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
            {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Confirm delete
                </span>
              </label>
              <button
                onClick={deleteSelectedRows}
                disabled={!confirmDelete}
                className="btn btn-danger btn-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Loading table data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-red-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>{error}</p>
              <button
                onClick={handleRefresh}
                className="btn btn-primary mt-4"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-12 px-4 py-3 sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === rows.length && rows.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                {displayedColumns.map((col) => {
                  const TypeIcon = getTypeIcon(col.type)
                  return (
                    <th
                      key={col.name}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => handleSort(col.name)}
                    >
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-3 h-3" />
                        <span>{col.name}</span>
                        {col.isPrimaryKey && <Key className="w-3 h-3 text-yellow-500" />}
                        {col.isForeignKey && <Key className="w-3 h-3 text-blue-500" />}
                        {sortColumn === col.name && (
                          <span className="text-primary-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                      <div className="text-[10px] font-normal text-gray-400 mt-0.5">
                        {col.type}
                        {col.nullable && ' | null'}
                      </div>
                    </th>
                  )
                })}
                <th className="w-12 px-4 py-3 sticky right-0 bg-gray-50 dark:bg-gray-700/50 z-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={displayedColumns.length + 2} className="px-4 py-12 text-center text-gray-500">
                    <Table2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No data in this table</p>
                  </td>
                </tr>
              ) : rows.map((row, rowIndex) => {
                // Use dynamic primary key columns from API
                const pkName = primaryKeyColumns[0] || 'id'
                const pkValue = row[pkName] as string || `row-${rowIndex}`
                return (
                <tr
                  key={pkValue}
                  className={clsx(
                    'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    selectedRows.has(pkValue) && 'bg-primary-50 dark:bg-primary-900/10'
                  )}
                >
                  <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(pkValue)}
                      onChange={() => toggleRowSelection(pkValue)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  {displayedColumns.map((col) => {
                    const isEditing = editingCell?.row === pkValue && editingCell?.column === col.name
                    const value = row[col.name]

                    return (
                      <td
                        key={col.name}
                        className="px-4 py-3 text-sm"
                        onDoubleClick={() => !col.isPrimaryKey && startEditing(pkValue, col.name, value)}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-2 py-1 border border-primary-500 rounded focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit()
                                if (e.key === 'Escape') cancelEdit()
                              }}
                            />
                            <button
                              onClick={saveEdit}
                              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={clsx(
                            'font-mono',
                            value === null && 'text-gray-400 italic'
                          )}>
                            {formatCellValue(value, col.type)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 sticky right-0 bg-white dark:bg-gray-800 z-10">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startRow} to {endRow} of {totalRows.toLocaleString()} rows
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Structure Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Table Structure
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Column</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nullable</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Default</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {columns.map((col) => (
                <tr key={col.name}>
                  <td className="px-4 py-2 font-mono text-gray-900 dark:text-white">{col.name}</td>
                  <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">{col.type}</td>
                  <td className="px-4 py-2 text-center">
                    {col.nullable ? (
                      <span className="text-green-600">YES</span>
                    ) : (
                      <span className="text-red-600">NO</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">
                    {col.defaultValue || '-'}
                  </td>
                  <td className="px-4 py-2">
                    {col.isPrimaryKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                        <Key className="w-3 h-3" />
                        PK
                      </span>
                    )}
                    {col.isForeignKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                        <Key className="w-3 h-3" />
                        FK → {col.references?.table}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insert Row Modal */}
      {showInsertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insert New Row
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter values for each column. Leave empty for default/null values.
              </p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {columns.filter(c => !c.isPrimaryKey || !c.type.includes('serial')).map((col) => (
                  <div key={col.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {col.name}
                      <span className="ml-2 text-xs text-gray-400">({col.type})</span>
                      {!col.nullable && <span className="ml-1 text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={newRowData[col.name] || ''}
                      onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                      placeholder={col.defaultValue ? `Default: ${col.defaultValue}` : col.nullable ? 'NULL' : 'Required'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInsertModal(false)
                  setNewRowData({})
                }}
                className="btn btn-secondary"
                disabled={isInserting}
              >
                Cancel
              </button>
              <button
                onClick={handleInsertRow}
                disabled={isInserting}
                className="btn btn-primary flex items-center gap-2"
              >
                {isInserting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Inserting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Insert Row
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
