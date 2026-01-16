import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Upload,
  FileText,
  Table2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  File,
  X,
  ChevronDown,
  Info,
  Database,
  ArrowRight,
} from 'lucide-react'
import clsx from 'clsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

interface ImportResult {
  status: 'success' | 'error' | 'partial'
  message: string
  totalStatements?: number
  successfulStatements?: number
  failedStatements?: number
  errors?: string[]
  rowsImported?: number
}

interface ColumnMapping {
  csvColumn: string
  dbColumn: string
  type: string
}

interface ApiTableInfo {
  name: string
}

interface ApiColumnInfo {
  name: string
  type: string
}

export default function DatabaseImport() {
  const [importType, setImportType] = useState<'sql' | 'csv'>('sql')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<string[][] | null>(null)
  const [selectedTable, setSelectedTable] = useState('')
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [hasHeaders, setHasHeaders] = useState(true)
  const [delimiter, setDelimiter] = useState(',')
  const [encoding, setEncoding] = useState('utf-8')
  const [onError, setOnError] = useState<'stop' | 'skip' | 'ignore'>('stop')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tables, setTables] = useState<string[]>([])
  const [tableColumns, setTableColumns] = useState<Record<string, { name: string; type: string }[]>>({})
  const [isLoadingTables, setIsLoadingTables] = useState(true)

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/tables`, {
        credentials: 'include',
      })

      if (!response.ok) return

      const result = await response.json()

      if (result.success && result.data?.tables) {
        const tableNames = result.data.tables.map((t: ApiTableInfo) => t.name)
        setTables(tableNames)
      }
    } catch {
      // Silently fail - tables will just be empty
    }
  }, [])

  const fetchTableColumns = useCallback(async (tableName: string) => {
    if (tableColumns[tableName]) return tableColumns[tableName]

    try {
      const response = await fetch(`${DBMANAGER_API}/tables/${tableName}/columns`, {
        credentials: 'include',
      })

      if (!response.ok) return []

      const result = await response.json()

      if (result.success && result.data?.columns) {
        const columns = result.data.columns.map((c: ApiColumnInfo) => ({
          name: c.name,
          type: c.type,
        }))
        setTableColumns(prev => ({ ...prev, [tableName]: columns }))
        return columns
      }
    } catch {
      // Silently fail
    }
    return []
  }, [tableColumns])

  useEffect(() => {
    const loadTables = async () => {
      setIsLoadingTables(true)
      await fetchTables()
      setIsLoadingTables(false)
    }
    loadTables()
  }, [fetchTables])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setResult(null)

    if (importType === 'csv') {
      // Preview CSV file
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n').slice(0, 6) // First 5 rows + header
        const data = lines.map(line => line.split(delimiter))
        setPreviewData(data)

        // Auto-create column mappings
        if (hasHeaders && data.length > 0 && selectedTable) {
          const headers = data[0]
          const columns = await fetchTableColumns(selectedTable)
          setColumnMappings(
            headers.map(header => ({
              csvColumn: header,
              dbColumn: columns.find((c: { name: string; type: string }) => c.name.toLowerCase() === header.toLowerCase())?.name || '',
              type: columns.find((c: { name: string; type: string }) => c.name.toLowerCase() === header.toLowerCase())?.type || 'text',
            }))
          )
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      if (importType === 'csv') {
        formData.append('table', selectedTable)
      }

      const endpoint = importType === 'sql' ? '/import/sql' : '/import/csv'

      const response = await fetch(`${DBMANAGER_API}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const apiResult = await response.json()

      if (importType === 'sql') {
        const data = apiResult.data
        if (data.success && data.failed_statements === 0) {
          setResult({
            status: 'success',
            message: 'SQL file imported successfully',
            totalStatements: data.total_statements,
            successfulStatements: data.successful_statements,
            failedStatements: data.failed_statements,
          })
        } else if (data.successful_statements > 0) {
          setResult({
            status: 'partial',
            message: 'SQL import completed with errors',
            totalStatements: data.total_statements,
            successfulStatements: data.successful_statements,
            failedStatements: data.failed_statements,
            errors: data.errors,
          })
        } else {
          setResult({
            status: 'error',
            message: 'SQL import failed',
            totalStatements: data.total_statements,
            successfulStatements: 0,
            failedStatements: data.failed_statements,
            errors: data.errors,
          })
        }
      } else {
        const data = apiResult.data
        if (data.success) {
          setResult({
            status: 'success',
            message: `Data imported into ${selectedTable}`,
            rowsImported: data.rows_imported,
          })
        } else {
          setResult({
            status: data.rows_imported > 0 ? 'partial' : 'error',
            message: data.rows_imported > 0 ? 'CSV import completed with errors' : 'CSV import failed',
            rowsImported: data.rows_imported,
            errors: data.errors,
          })
        }
      }
    } catch (err) {
      setResult({
        status: 'error',
        message: err instanceof Error ? err.message : 'Import failed',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setResult(null)
    setPreviewData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Import Data
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Import SQL files or CSV data into your database
        </p>
      </div>

      {/* Import Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Import Type
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setImportType('sql')
              clearFile()
            }}
            className={clsx(
              'p-4 rounded-lg border-2 text-left transition-all',
              importType === 'sql'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'p-3 rounded-lg',
                importType === 'sql' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SQL File</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Execute SQL statements from a .sql file
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setImportType('csv')
              clearFile()
            }}
            className={clsx(
              'p-4 rounded-lg border-2 text-left transition-all',
              importType === 'csv'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'p-3 rounded-lg',
                importType === 'csv' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                <Table2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">CSV File</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Import data from a CSV file into a table
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* CSV Options */}
      {importType === 'csv' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CSV Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Table
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                disabled={isLoadingTables}
              >
                <option value="">{isLoadingTables ? 'Loading tables...' : 'Select a table...'}</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Encoding
              </label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="utf-8">UTF-8</option>
                <option value="latin1">Latin-1</option>
                <option value="utf-16">UTF-16</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                On Error
              </label>
              <select
                value={onError}
                onChange={(e) => setOnError(e.target.value as 'stop' | 'skip' | 'ignore')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="stop">Stop import</option>
                <option value="skip">Skip row</option>
                <option value="ignore">Ignore errors</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                First row contains column headers
              </span>
            </label>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload File
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept={importType === 'sql' ? '.sql' : '.csv'}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop your {importType.toUpperCase()} file here, or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Maximum file size: 50MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <File className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* CSV Preview */}
      {importType === 'csv' && previewData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Preview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {previewData[0]?.map((header, i) => (
                    <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {hasHeaders ? header : `Column ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.slice(hasHeaders ? 1 : 0).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-gray-900 dark:text-white">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Showing first {Math.min(5, previewData.length - (hasHeaders ? 1 : 0))} rows
          </p>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Important
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Make sure to backup your database before importing data. This operation cannot be undone.
          </p>
        </div>
      </div>

      {/* Import Button */}
      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={!selectedFile || isImporting || (importType === 'csv' && !selectedTable)}
          className="btn btn-primary flex items-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Import Data
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={clsx(
          'rounded-lg p-6',
          result.status === 'success' && 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
          result.status === 'error' && 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
          result.status === 'partial' && 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        )}>
          <div className="flex items-start gap-3">
            {result.status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : result.status === 'error' ? (
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={clsx(
                'font-medium',
                result.status === 'success' && 'text-green-800 dark:text-green-200',
                result.status === 'error' && 'text-red-800 dark:text-red-200',
                result.status === 'partial' && 'text-yellow-800 dark:text-yellow-200'
              )}>
                {result.message}
              </p>

              {result.totalStatements !== undefined && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Total statements: {result.totalStatements}</p>
                  <p className="text-green-600 dark:text-green-400">
                    Successful: {result.successfulStatements}
                  </p>
                  {result.failedStatements !== undefined && result.failedStatements > 0 && (
                    <p className="text-red-600 dark:text-red-400">
                      Failed: {result.failedStatements}
                    </p>
                  )}
                </div>
              )}

              {result.rowsImported !== undefined && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Rows imported: {result.rowsImported}
                </p>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Errors:
                  </p>
                  <pre className="text-sm font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded p-3 overflow-x-auto">
                    {result.errors.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
