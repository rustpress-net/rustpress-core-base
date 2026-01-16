import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Save,
  History,
  Bookmark,
  Download,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  FileText,
  Zap,
  RotateCcw,
  Settings,
  Table2,
} from 'lucide-react'
import clsx from 'clsx'

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTime: number
  status: 'success' | 'error'
  error?: string
  affectedRows?: number
}

interface SavedQuery {
  id: string
  name: string
  query: string
  createdAt: string
}

interface QueryHistoryItem {
  id: string
  query: string
  executionTime: number
  status: 'success' | 'error'
  timestamp: string
  rowCount?: number
}

// SQL keywords for syntax highlighting
const sqlKeywords = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER',
  'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'JOIN', 'LEFT',
  'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'AS', 'ORDER', 'BY',
  'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'NULL',
  'IS', 'TRUE', 'FALSE', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE', 'CASCADE', 'RESTRICT', 'TRUNCATE',
  'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'EXPLAIN', 'ANALYZE', 'WITH',
  'RETURNING', 'COALESCE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'NOW', 'CURRENT_TIMESTAMP', 'EXISTS',
  'ANY', 'SOME', 'IF', 'ELSE', 'ISNULL', 'IFNULL', 'NULLIF', 'GREATEST', 'LEAST',
])

// SQL functions for highlighting
const sqlFunctions = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'NOW', 'CURRENT_TIMESTAMP', 'COALESCE',
  'NULLIF', 'CAST', 'CONVERT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH',
  'CONCAT', 'REPLACE', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'DATE', 'TIME',
  'TIMESTAMP', 'EXTRACT', 'DATE_PART', 'DATE_TRUNC', 'TO_CHAR', 'TO_DATE',
  'STRING_AGG', 'ARRAY_AGG', 'JSON_AGG', 'JSONB_AGG', 'ROW_NUMBER', 'RANK',
  'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTILE',
])

// SQL data types for highlighting
const sqlTypes = new Set([
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
  'FLOAT', 'REAL', 'DOUBLE', 'VARCHAR', 'CHAR', 'TEXT', 'BOOLEAN', 'BOOL',
  'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL', 'UUID', 'JSON',
  'JSONB', 'ARRAY', 'BYTEA', 'SERIAL', 'BIGSERIAL', 'MONEY',
])

// Syntax highlighter for SQL
const highlightSQL = (sql: string): React.ReactNode[] => {
  const tokens: React.ReactNode[] = []
  let i = 0
  let tokenIndex = 0

  while (i < sql.length) {
    // Single-line comment
    if (sql.slice(i, i + 2) === '--') {
      let end = i + 2
      while (end < sql.length && sql[end] !== '\n') end++
      tokens.push(<span key={tokenIndex++} className="text-gray-500">{sql.slice(i, end)}</span>)
      i = end
      continue
    }

    // Multi-line comment
    if (sql.slice(i, i + 2) === '/*') {
      let end = sql.indexOf('*/', i + 2)
      if (end === -1) end = sql.length
      else end += 2
      tokens.push(<span key={tokenIndex++} className="text-gray-500">{sql.slice(i, end)}</span>)
      i = end
      continue
    }

    // String (single quotes)
    if (sql[i] === "'") {
      let end = i + 1
      while (end < sql.length) {
        if (sql[end] === "'" && sql[end + 1] === "'") {
          end += 2 // Escaped quote
          continue
        }
        if (sql[end] === "'") {
          end++
          break
        }
        end++
      }
      tokens.push(<span key={tokenIndex++} className="text-green-400">{sql.slice(i, end)}</span>)
      i = end
      continue
    }

    // String (double quotes - identifier)
    if (sql[i] === '"') {
      let end = i + 1
      while (end < sql.length && sql[end] !== '"') end++
      if (end < sql.length) end++
      tokens.push(<span key={tokenIndex++} className="text-yellow-400">{sql.slice(i, end)}</span>)
      i = end
      continue
    }

    // Number
    if (/\d/.test(sql[i]) || (sql[i] === '.' && /\d/.test(sql[i + 1] || ''))) {
      let end = i
      let hasDot = false
      while (end < sql.length && (/\d/.test(sql[end]) || (sql[end] === '.' && !hasDot))) {
        if (sql[end] === '.') hasDot = true
        end++
      }
      tokens.push(<span key={tokenIndex++} className="text-purple-400">{sql.slice(i, end)}</span>)
      i = end
      continue
    }

    // Identifier/keyword/function
    if (/[a-zA-Z_]/.test(sql[i])) {
      let end = i
      while (end < sql.length && /[a-zA-Z0-9_]/.test(sql[end])) end++
      const word = sql.slice(i, end)
      const upperWord = word.toUpperCase()

      if (sqlKeywords.has(upperWord)) {
        tokens.push(<span key={tokenIndex++} className="text-blue-400 font-semibold">{word}</span>)
      } else if (sqlFunctions.has(upperWord)) {
        tokens.push(<span key={tokenIndex++} className="text-cyan-400">{word}</span>)
      } else if (sqlTypes.has(upperWord)) {
        tokens.push(<span key={tokenIndex++} className="text-orange-400">{word}</span>)
      } else {
        tokens.push(<span key={tokenIndex++} className="text-gray-100">{word}</span>)
      }
      i = end
      continue
    }

    // Operators and punctuation
    if (/[=<>!+\-*/%&|^~]/.test(sql[i])) {
      let end = i + 1
      // Handle multi-char operators like !=, >=, <=, <>, ||, etc.
      while (end < sql.length && /[=<>!]/.test(sql[end])) end++
      tokens.push(<span key={tokenIndex++} className="text-pink-400">{sql.slice(i, end)}</span>)
      i = end
      continue
    }

    // Parentheses, brackets, semicolons
    if (/[(),;.]/.test(sql[i])) {
      tokens.push(<span key={tokenIndex++} className="text-gray-400">{sql[i]}</span>)
      i++
      continue
    }

    // Whitespace and everything else
    tokens.push(<span key={tokenIndex++}>{sql[i]}</span>)
    i++
  }

  return tokens
}

export default function SqlEditor() {
  const [query, setQuery] = useState("SELECT * FROM posts\nWHERE status = 'published'\nORDER BY created_at DESC\nLIMIT 10;")
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'result' | 'history' | 'saved'>('result')
  const [showExplain, setShowExplain] = useState(false)
  const [explainPlan, setExplainPlan] = useState<string | null>(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainError, setExplainError] = useState<string | null>(null)
  const [saveQueryName, setSaveQueryName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [confirmDestructive, setConfirmDestructive] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const explainDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Fetch saved queries from API
  const fetchSavedQueries = useCallback(async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/query/saved`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.queries) {
          const queries = result.data.queries.map((q: any) => ({
            id: q.id,
            name: q.name,
            query: q.query,
            createdAt: new Date(q.created_at).toLocaleDateString(),
          }))
          setSavedQueries(queries)
        }
      }
    } catch (err) {
      console.error('Failed to fetch saved queries:', err)
    }
  }, [])

  // Fetch query history from API
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${DBMANAGER_API}/query/history?limit=50`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.history) {
          const historyItems = result.data.history.map((item: any) => ({
            id: item.id,
            query: item.query,
            executionTime: item.execution_time,
            status: item.status as 'success' | 'error',
            timestamp: formatTimestamp(item.timestamp),
            rowCount: item.row_count,
          }))
          setHistory(historyItems)
        }
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }, [])

  // Fetch query explain plan
  const fetchExplainPlan = useCallback(async (sql: string) => {
    if (!sql.trim()) {
      setExplainPlan(null)
      setExplainError(null)
      return
    }

    // Only explain SELECT queries for real-time preview (to avoid executing mutations)
    const upperSql = sql.trim().toUpperCase()
    if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('WITH')) {
      setExplainPlan(null)
      setExplainError('Real-time explain is only available for SELECT/WITH queries')
      return
    }

    setExplainLoading(true)
    setExplainError(null)

    try {
      const response = await fetch(`${DBMANAGER_API}/query/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ query: sql }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setExplainPlan(data.data.plan)
        setExplainError(null)
      } else {
        setExplainPlan(null)
        setExplainError(data.error || 'Failed to get explain plan')
      }
    } catch (err) {
      setExplainPlan(null)
      setExplainError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    setExplainLoading(false)
  }, [])

  // Debounced explain plan update when query changes and explain is shown
  useEffect(() => {
    if (!showExplain) {
      return
    }

    // Clear previous timeout
    if (explainDebounceRef.current) {
      clearTimeout(explainDebounceRef.current)
    }

    // Debounce the explain request by 500ms
    explainDebounceRef.current = setTimeout(() => {
      fetchExplainPlan(query)
    }, 500)

    return () => {
      if (explainDebounceRef.current) {
        clearTimeout(explainDebounceRef.current)
      }
    }
  }, [query, showExplain, fetchExplainPlan])

  // Load initial data
  useEffect(() => {
    fetchSavedQueries()
    fetchHistory()
  }, [fetchSavedQueries, fetchHistory])

  // Check if query is destructive
  const isDestructiveQuery = (sql: string): boolean => {
    const upper = sql.toUpperCase()
    return ['DROP', 'TRUNCATE', 'DELETE'].some(cmd => upper.includes(cmd))
  }

  const executeQuery = async () => {
    if (!query.trim()) return

    // Check for destructive operations
    if (isDestructiveQuery(query) && !confirmDestructive) {
      setResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        status: 'error',
        error: 'This query contains a destructive operation (DROP, TRUNCATE, or DELETE). Check the "Confirm destructive" checkbox to execute.',
      })
      return
    }

    setIsExecuting(true)
    setResult(null)

    try {
      const response = await fetch(`${DBMANAGER_API}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          query: query,
          confirm: confirmDestructive,
        }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        const queryData = data.data
        setResult({
          columns: queryData.columns || [],
          rows: queryData.rows || [],
          rowCount: queryData.row_count || 0,
          executionTime: queryData.execution_time || 0,
          status: queryData.status === 'success' ? 'success' : 'error',
          error: queryData.error,
          affectedRows: queryData.affected_rows,
        })
      } else {
        setResult({
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: 0,
          status: 'error',
          error: data.error || 'Query execution failed',
        })
      }

      // Refresh history after query execution
      await fetchHistory()
    } catch (err) {
      setResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        status: 'error',
        error: `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
    }

    setIsExecuting(false)
    setActiveTab('result')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      executeQuery()
    }
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newValue = query.slice(0, start) + '  ' + query.slice(end)
        setQuery(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  // Synchronize scroll between textarea and highlight overlay
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  const saveQuery = async () => {
    if (!saveQueryName.trim() || !query.trim()) return

    try {
      const response = await fetch(`${DBMANAGER_API}/query/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          name: saveQueryName,
          query: query,
        }),
      })

      if (response.ok) {
        // Refresh saved queries list from API
        await fetchSavedQueries()
        setShowSaveDialog(false)
        setSaveQueryName('')
      } else {
        const data = await response.json()
        console.error('Failed to save query:', data.error)
      }
    } catch (err) {
      console.error('Failed to save query:', err)
    }
  }

  const loadQuery = (q: string) => {
    setQuery(q)
  }

  const exportResults = (format: 'csv' | 'json' | 'sql') => {
    if (!result || result.status === 'error') return

    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'csv':
        content = [
          result.columns.join(','),
          ...result.rows.map(row =>
            result.columns.map(col => JSON.stringify(row[col] ?? '')).join(',')
          ),
        ].join('\n')
        filename = 'query_result.csv'
        mimeType = 'text/csv'
        break
      case 'json':
        content = JSON.stringify(result.rows, null, 2)
        filename = 'query_result.json'
        mimeType = 'application/json'
        break
      case 'sql':
        // Generate INSERT statements
        content = result.rows.map(row => {
          const values = result.columns.map(col => {
            const val = row[col]
            if (val === null) return 'NULL'
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
            return String(val)
          })
          return `INSERT INTO table_name (${result.columns.join(', ')}) VALUES (${values.join(', ')});`
        }).join('\n')
        filename = 'query_result.sql'
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyResults = () => {
    if (!result || result.status === 'error') return

    const text = [
      result.columns.join('\t'),
      ...result.rows.map(row =>
        result.columns.map(col => String(row[col] ?? '')).join('\t')
      ),
    ].join('\n')

    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SQL Query Editor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Execute SQL queries and browse results
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
          <span>to execute</span>
        </div>
      </div>

      {/* Editor Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-2">
            <button
              onClick={executeQuery}
              disabled={isExecuting || !query.trim()}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute
            </button>
            <button
              onClick={() => setShowExplain(!showExplain)}
              className={clsx(
                'btn btn-sm flex items-center gap-2',
                showExplain ? 'btn-secondary bg-yellow-100 dark:bg-yellow-900/30' : 'btn-secondary'
              )}
            >
              <Zap className="w-4 h-4" />
              Explain
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={!query.trim()}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={confirmDestructive}
                onChange={(e) => setConfirmDestructive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                Confirm destructive
              </span>
            </label>
            <button
              onClick={() => setQuery('')}
              disabled={!query}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Query Editor with Syntax Highlighting */}
        <div className="relative h-48 overflow-hidden">
          {/* Syntax-highlighted overlay (behind textarea) */}
          <pre
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 p-4 font-mono text-sm bg-gray-900 overflow-auto pointer-events-none whitespace-pre-wrap break-words"
            style={{
              margin: 0,
              border: 'none',
              resize: 'none',
              lineHeight: '1.5',
            }}
          >
            {highlightSQL(query)}
            {/* Add a trailing space to match textarea behavior */}
            <span> </span>
          </pre>
          {/* Transparent textarea on top for editing */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder="Enter your SQL query here..."
            className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-white resize-none focus:outline-none"
            style={{
              caretColor: '#fff',
              lineHeight: '1.5',
            }}
            spellCheck={false}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-900/80 px-1 rounded z-10">
            {query.length} characters
          </div>
        </div>
      </div>

      {/* Real-time Explain Preview Panel */}
      {showExplain && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Query Explain Plan
              </span>
              {explainLoading && (
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
              <Info className="w-3 h-3" />
              <span>Updates as you type (SELECT/WITH only)</span>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {explainError ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{explainError}</span>
                </div>
              </div>
            ) : explainPlan ? (
              <pre className="p-4 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {explainPlan.split('\n').map((line, idx) => {
                  // Highlight expensive operations
                  const isExpensive = /cost=\d+\.\d+\.\.\d+\.\d+/.test(line) &&
                    parseFloat(line.match(/cost=(\d+\.\d+)/)?.[1] || '0') > 1000
                  const hasSeqScan = line.includes('Seq Scan')
                  const hasNestedLoop = line.includes('Nested Loop')

                  return (
                    <div
                      key={idx}
                      className={clsx(
                        'leading-relaxed',
                        isExpensive && 'text-red-600 dark:text-red-400 font-semibold',
                        hasSeqScan && 'text-orange-600 dark:text-orange-400',
                        hasNestedLoop && 'text-yellow-600 dark:text-yellow-400'
                      )}
                    >
                      {line}
                    </div>
                  )
                })}
              </pre>
            ) : (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                {query.trim() ? 'Analyzing query...' : 'Enter a SELECT or WITH query to see the explain plan'}
              </div>
            )}
          </div>
          {explainPlan && (
            <div className="px-4 py-2 border-t border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">High cost (&gt;1000)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">Sequential scan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">Nested loop</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('result')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'result'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            Result
            {result && result.status === 'success' && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                {result.rowCount}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
              {history.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'saved'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Saved Queries
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
              {savedQueries.length}
            </span>
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {activeTab === 'result' && (
          <>
            {isExecuting ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span>Executing query...</span>
                </div>
              </div>
            ) : result ? (
              <>
                {/* Result Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    {result.status === 'success' ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Query executed successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Query failed</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {result.executionTime.toFixed(2)}ms
                    </span>
                    {result.rowCount > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} returned
                      </span>
                    )}
                    {result.affectedRows !== undefined && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {result.affectedRows} row{result.affectedRows !== 1 ? 's' : ''} affected
                      </span>
                    )}
                  </div>
                  {result.status === 'success' && result.rows.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyResults}
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <div className="relative group">
                        <button className="btn btn-secondary btn-sm flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] hidden group-hover:block z-10">
                          <button
                            onClick={() => exportResults('csv')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Export as CSV
                          </button>
                          <button
                            onClick={() => exportResults('json')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Export as JSON
                          </button>
                          <button
                            onClick={() => exportResults('sql')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Export as SQL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Result Content */}
                {result.status === 'error' ? (
                  <div className="p-4">
                    <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                      {result.error}
                    </pre>
                  </div>
                ) : result.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          {result.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {result.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {result.columns.map((col) => (
                              <td
                                key={col}
                                className="px-4 py-2 text-sm font-mono text-gray-900 dark:text-white whitespace-nowrap"
                              >
                                {row[col] === null ? (
                                  <span className="text-gray-400 italic">(NULL)</span>
                                ) : (
                                  String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Query executed successfully. No rows returned.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Execute a query to see results</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No query history yet</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => loadQuery(item.query)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <pre className="text-sm font-mono text-gray-900 dark:text-white truncate">
                        {item.query}
                      </pre>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={clsx(
                          'flex items-center gap-1',
                          item.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {item.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {item.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.executionTime}ms
                        </span>
                        {item.rowCount !== undefined && (
                          <span>{item.rowCount} rows</span>
                        )}
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        loadQuery(item.query)
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {savedQueries.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved queries yet</p>
              </div>
            ) : (
              savedQueries.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => loadQuery(item.query)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <pre className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate mt-1">
                        {item.query}
                      </pre>
                      <p className="text-xs text-gray-400 mt-2">
                        Saved on {item.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadQuery(item.query)
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Load
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            const response = await fetch(`${DBMANAGER_API}/query/saved/${item.id}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                              },
                            })
                            if (response.ok) {
                              await fetchSavedQueries()
                            }
                          } catch (err) {
                            console.error('Failed to delete query:', err)
                          }
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSaveDialog(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Save Query
              </h3>
              <input
                type="text"
                placeholder="Query name..."
                value={saveQueryName}
                onChange={(e) => setSaveQueryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 mb-4"
                autoFocus
              />
              <pre className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4 max-h-32 overflow-auto">
                {query}
              </pre>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuery}
                  disabled={!saveQueryName.trim()}
                  className="btn btn-primary"
                >
                  Save Query
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
