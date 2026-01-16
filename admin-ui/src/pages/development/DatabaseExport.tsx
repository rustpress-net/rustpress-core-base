import { useState, useEffect, useCallback } from 'react'
import {
  Download,
  Table2,
  FileText,
  CheckCircle2,
  Loader2,
  Database,
  Settings,
  File,
  ChevronDown,
  ChevronRight,
  Info,
  AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

interface TableInfo {
  name: string
  rows: number
  size: string
  selected: boolean
}

interface ApiTableInfo {
  name: string
  rows: number
  size: string
}

type ExportFormat = 'sql' | 'csv' | 'json'
type ExportContent = 'structure' | 'data' | 'both'

export default function DatabaseExport() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('sql')
  const [exportContent, setExportContent] = useState<ExportContent>('both')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const fetchTables = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`${DBMANAGER_API}/tables`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data?.tables) {
        const mappedTables: TableInfo[] = result.data.tables.map((t: ApiTableInfo) => ({
          name: t.name,
          rows: t.rows,
          size: t.size,
          selected: true,
        }))
        setTables(mappedTables)
      } else {
        throw new Error(result.error || 'Failed to fetch tables')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [])

  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true)
      await fetchTables()
      setIsLoading(false)
    }
    loadTables()
  }, [fetchTables])

  // SQL Options
  const [addDropTable, setAddDropTable] = useState(true)
  const [addCreateDatabase, setAddCreateDatabase] = useState(false)
  const [addIfNotExists, setAddIfNotExists] = useState(true)
  const [useExtendedInserts, setUseExtendedInserts] = useState(true)
  const [includeAutoIncrement, setIncludeAutoIncrement] = useState(true)
  const [addLockTables, setAddLockTables] = useState(false)
  const [disableForeignKeyChecks, setDisableForeignKeyChecks] = useState(true)

  // CSV/JSON Options
  const [delimiter, setDelimiter] = useState(',')
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [prettyPrint, setPrettyPrint] = useState(true)

  const selectedTables = tables.filter(t => t.selected)
  const totalRows = selectedTables.reduce((acc, t) => acc + t.rows, 0)
  const totalSize = selectedTables.reduce((acc, t) => {
    const size = parseFloat(t.size) || 0
    return acc + size
  }, 0)

  const toggleTable = (name: string) => {
    setTables(tables.map(t =>
      t.name === name ? { ...t, selected: !t.selected } : t
    ))
  }

  const toggleAllTables = () => {
    const allSelected = tables.every(t => t.selected)
    setTables(tables.map(t => ({ ...t, selected: !allSelected })))
  }

  const handleExport = async () => {
    if (selectedTables.length === 0) return

    setIsExporting(true)
    setExportComplete(false)
    setError(null)

    try {
      const response = await fetch(`${DBMANAGER_API}/export/tables`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tables: selectedTables.map(t => t.name),
          format: exportFormat,
          includeStructure: exportContent === 'structure' || exportContent === 'both',
          includeData: exportContent === 'data' || exportContent === 'both',
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `rustpress_export_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      } else {
        switch (exportFormat) {
          case 'sql':
            filename += '.sql'
            break
          case 'csv':
            filename += '.csv'
            break
          case 'json':
            filename += '.json'
            break
        }
      }

      // Download the file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setExportComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Export Data
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Export your database tables to SQL, CSV, or JSON format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Selection */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Tables
            </h2>
            <button
              onClick={toggleAllTables}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {tables.every(t => t.selected) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-primary-500 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">Loading tables...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && tables.map((table) => (
              <label
                key={table.name}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  table.selected
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={table.selected}
                    onChange={() => toggleTable(table.name)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {table.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{table.rows.toLocaleString()} rows</span>
                  <span>{table.size}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {selectedTables.length} of {tables.length} tables selected
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              ~{totalSize.toFixed(1)} MB, {totalRows.toLocaleString()} rows
            </span>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Export Format
            </h2>
            <div className="space-y-2">
              {[
                { value: 'sql', label: 'SQL', desc: 'PostgreSQL compatible' },
                { value: 'csv', label: 'CSV', desc: 'Comma-separated values' },
                { value: 'json', label: 'JSON', desc: 'JavaScript Object Notation' },
              ].map((format) => (
                <label
                  key={format.value}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    exportFormat === format.value
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportFormat === format.value}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{format.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{format.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Content Type (SQL only) */}
          {exportFormat === 'sql' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content
              </h2>
              <div className="space-y-2">
                {[
                  { value: 'both', label: 'Structure and Data' },
                  { value: 'structure', label: 'Structure Only' },
                  { value: 'data', label: 'Data Only' },
                ].map((content) => (
                  <label
                    key={content.value}
                    className="flex items-center gap-3 p-2"
                  >
                    <input
                      type="radio"
                      name="content"
                      value={content.value}
                      checked={exportContent === content.value}
                      onChange={(e) => setExportContent(e.target.value as ExportContent)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{content.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* SQL Options */}
          {exportFormat === 'sql' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                SQL Options
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addDropTable}
                    onChange={(e) => setAddDropTable(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Add DROP TABLE statements
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addIfNotExists}
                    onChange={(e) => setAddIfNotExists(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Add IF NOT EXISTS
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useExtendedInserts}
                    onChange={(e) => setUseExtendedInserts(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Use extended INSERTs
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={disableForeignKeyChecks}
                    onChange={(e) => setDisableForeignKeyChecks(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Disable FK checks during import
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* CSV Options */}
          {exportFormat === 'csv' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                CSV Options
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delimiter
                  </label>
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include column headers
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* JSON Options */}
          {exportFormat === 'json' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                JSON Options
              </h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prettyPrint}
                  onChange={(e) => setPrettyPrint(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Pretty print (formatted)
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Info className="w-4 h-4" />
          <span>
            Export will include {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''}
            ({totalRows.toLocaleString()} rows, ~{totalSize.toFixed(1)} MB)
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={selectedTables.length === 0 || isExporting}
          className="btn btn-primary flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : exportComplete ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Export Complete
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export
            </>
          )}
        </button>
      </div>
    </div>
  )
}
