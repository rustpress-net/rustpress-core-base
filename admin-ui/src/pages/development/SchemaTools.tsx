import { useState, useEffect } from 'react'
import {
  GitBranch,
  Search,
  Code2,
  FileCode,
  Database,
  Table2,
  ArrowRightLeft,
  Copy,
  Download,
  Eye,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  History,
  Plus,
} from 'lucide-react'
import clsx from 'clsx'

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const DBMANAGER_API = `${API_BASE}/admin/dbmanager/v1`

// Types
interface TableRelationship {
  source_table: string
  source_column: string
  target_table: string
  target_column: string
  constraint_name: string
  on_delete: string
  on_update: string
}

interface SchemaDifference {
  table_name: string
  column_differences: string[]
  index_differences: string[]
  constraint_differences: string[]
}

interface SchemaCompareResult {
  only_in_first: string[]
  only_in_second: string[]
  tables_with_differences: SchemaDifference[]
}

interface SchemaVersion {
  id: string
  version: string
  description: string
  schema_snapshot: unknown
  changes: unknown[]
  created_by: string | null
  created_at: string
}

interface SchemaSearchResult {
  tables: { name: string; schema: string }[]
  columns: { table_name: string; column_name: string; data_type: string }[]
  indexes: { name: string; table_name: string }[]
  constraints: { name: string; table_name: string; constraint_type: string }[]
  functions: { name: string; schema: string }[]
  triggers: { name: string; table_name: string }[]
}

export default function SchemaTools() {
  const [activeTab, setActiveTab] = useState<'diagram' | 'compare' | 'search' | 'ddl' | 'versions'>('diagram')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ER Diagram state
  const [relationships, setRelationships] = useState<TableRelationship[]>([])
  const [diagramFormat, setDiagramFormat] = useState<'mermaid' | 'dot'>('mermaid')
  const [diagramCode, setDiagramCode] = useState('')

  // Schema Compare state
  const [schema1, setSchema1] = useState('public')
  const [schema2, setSchema2] = useState('')
  const [compareResult, setCompareResult] = useState<SchemaCompareResult | null>(null)

  // Schema Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SchemaSearchResult | null>(null)

  // DDL Generator state
  const [ddlType, setDdlType] = useState<'table' | 'index' | 'constraint' | 'view'>('table')
  const [ddlObject, setDdlObject] = useState('')
  const [ddlOptions, setDdlOptions] = useState({
    include_indexes: true,
    include_constraints: true,
    include_triggers: false,
    if_not_exists: true,
  })
  const [generatedDDL, setGeneratedDDL] = useState('')

  // Schema Versions state
  const [schemaVersions, setSchemaVersions] = useState<SchemaVersion[]>([])
  const [newVersionName, setNewVersionName] = useState('')
  const [newVersionDesc, setNewVersionDesc] = useState('')
  const [viewingVersion, setViewingVersion] = useState<SchemaVersion | null>(null)

  // Available tables and schemas
  const [tables, setTables] = useState<string[]>([])
  const [schemas, setSchemas] = useState<string[]>(['public'])

  // Fetch tables on mount
  useEffect(() => {
    fetchTables()
    fetchSchemas()
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
          setTables(data.data.map((t: { name: string }) => t.name))
        }
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err)
    }
  }

  const fetchSchemas = async () => {
    // For now, use default schemas
    setSchemas(['public', 'information_schema', 'pg_catalog'])
  }

  // ER Diagram functions
  const fetchRelationships = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/relationships`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setRelationships(data.data.relationships || [])
        setDiagramCode(data.data.diagram || '')
      } else {
        setError(data.error || 'Failed to fetch relationships')
      }
    } catch (err) {
      setError('Failed to fetch relationships')
    } finally {
      setLoading(false)
    }
  }

  const generateERDiagram = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/er-diagram?format=${diagramFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setDiagramCode(data.data.diagram || '')
        setRelationships(data.data.tables || [])
      } else {
        setError(data.error || 'Failed to generate diagram')
      }
    } catch (err) {
      setError('Failed to generate ER diagram')
    } finally {
      setLoading(false)
    }
  }

  // Schema Compare functions
  const compareSchemas = async () => {
    if (!schema1 || !schema2) {
      setError('Please select two schemas to compare')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ schema1, schema2 }),
      })
      const data = await response.json()
      if (data.success) {
        setCompareResult(data.data)
      } else {
        setError(data.error || 'Failed to compare schemas')
      }
    } catch (err) {
      setError('Failed to compare schemas')
    } finally {
      setLoading(false)
    }
  }

  // Schema Search functions
  const searchSchema = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          search_tables: true,
          search_columns: true,
          search_indexes: true,
          search_constraints: true,
          search_functions: true,
          search_triggers: true,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.data)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  // DDL Generator functions
  const generateDDL = async () => {
    if (!ddlObject) {
      setError('Please select an object')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/ddl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          object_type: ddlType,
          object_name: ddlObject,
          ...ddlOptions,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setGeneratedDDL(data.data.ddl || '')
      } else {
        setError(data.error || 'Failed to generate DDL')
      }
    } catch (err) {
      setError('Failed to generate DDL')
    } finally {
      setLoading(false)
    }
  }

  // Schema Versions functions
  const fetchSchemaVersions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/versions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setSchemaVersions(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch schema versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSchemaVersion = async () => {
    if (!newVersionName.trim()) {
      setError('Please enter a version name')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DBMANAGER_API}/schema/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          version: newVersionName,
          description: newVersionDesc,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setNewVersionName('')
        setNewVersionDesc('')
        await fetchSchemaVersions()
      } else {
        setError(data.error || 'Failed to create version')
      }
    } catch (err) {
      setError('Failed to create schema version')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'diagram':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Format:</label>
                <select
                  value={diagramFormat}
                  onChange={(e) => setDiagramFormat(e.target.value as 'mermaid' | 'dot')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="mermaid">Mermaid</option>
                  <option value="dot">GraphViz DOT</option>
                </select>
              </div>
              <button onClick={generateERDiagram} disabled={loading} className="btn btn-primary">
                <GitBranch className="w-4 h-4 mr-2" />
                Generate ER Diagram
              </button>
              <button onClick={fetchRelationships} disabled={loading} className="btn btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Relationships
              </button>
            </div>

            {diagramCode && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generated {diagramFormat === 'mermaid' ? 'Mermaid' : 'DOT'} Code
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(diagramCode)} className="btn btn-secondary btn-sm">
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([diagramCode], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `er-diagram.${diagramFormat === 'mermaid' ? 'mmd' : 'dot'}`
                        a.click()
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </button>
                  </div>
                </div>
                <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                  {diagramCode}
                </pre>
              </div>
            )}

            {relationships.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">Relationships ({relationships.length})</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-auto">
                  {relationships.map((rel, idx) => (
                    <div key={idx} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-primary-600">{rel.source_table}</span>
                        <span className="text-gray-500">.{rel.source_column}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-green-600">{rel.target_table}</span>
                        <span className="text-gray-500">.{rel.target_column}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {rel.constraint_name} | ON DELETE {rel.on_delete} | ON UPDATE {rel.on_update}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'compare':
        return (
          <div className="space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schema 1</label>
                <select
                  value={schema1}
                  onChange={(e) => setSchema1(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {schemas.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="text-gray-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schema 2</label>
                <select
                  value={schema2}
                  onChange={(e) => setSchema2(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select schema...</option>
                  {schemas.filter(s => s !== schema1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={compareSchemas} disabled={loading || !schema2} className="btn btn-primary">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Compare Schemas
              </button>
            </div>

            {compareResult && (
              <div className="space-y-4">
                {compareResult.only_in_first.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Only in {schema1} ({compareResult.only_in_first.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {compareResult.only_in_first.map(t => (
                        <span key={t} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {compareResult.only_in_second.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Only in {schema2} ({compareResult.only_in_second.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {compareResult.only_in_second.map(t => (
                        <span key={t} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded text-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {compareResult.tables_with_differences.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Tables with Differences ({compareResult.tables_with_differences.length})
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {compareResult.tables_with_differences.map((diff, idx) => (
                        <div key={idx} className="p-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">{diff.table_name}</h5>
                          {diff.column_differences.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Columns:</span>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                {diff.column_differences.map((d, i) => <li key={i}>{d}</li>)}
                              </ul>
                            </div>
                          )}
                          {diff.index_differences.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Indexes:</span>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                {diff.index_differences.map((d, i) => <li key={i}>{d}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {compareResult.only_in_first.length === 0 &&
                  compareResult.only_in_second.length === 0 &&
                  compareResult.tables_with_differences.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="font-medium">Schemas are identical!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'search':
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSchema()}
                  placeholder="Search tables, columns, indexes, functions..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button onClick={searchSchema} disabled={loading || !searchQuery.trim()} className="btn btn-primary">
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>

            {searchResults && (
              <div className="space-y-4">
                {searchResults.tables.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      <Table2 className="w-4 h-4 inline mr-2" />
                      Tables ({searchResults.tables.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.tables.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          {t.schema}.{t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.columns.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Columns ({searchResults.columns.length})
                    </h4>
                    <div className="space-y-1">
                      {searchResults.columns.slice(0, 20).map((c, i) => (
                        <div key={i} className="text-sm">
                          <span className="text-primary-600">{c.table_name}</span>
                          <span className="text-gray-500">.{c.column_name}</span>
                          <span className="text-gray-400 ml-2">({c.data_type})</span>
                        </div>
                      ))}
                      {searchResults.columns.length > 20 && (
                        <p className="text-sm text-gray-500">...and {searchResults.columns.length - 20} more</p>
                      )}
                    </div>
                  </div>
                )}

                {searchResults.indexes.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Indexes ({searchResults.indexes.length})
                    </h4>
                    <div className="space-y-1">
                      {searchResults.indexes.map((idx, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{idx.name}</span>
                          <span className="text-gray-500 ml-2">on {idx.table_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.functions.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Functions ({searchResults.functions.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.functions.map((f, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded text-sm">
                          {f.schema}.{f.name}()
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'ddl':
        return (
          <div className="space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Object Type</label>
                <select
                  value={ddlType}
                  onChange={(e) => setDdlType(e.target.value as typeof ddlType)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="table">Table</option>
                  <option value="index">Index</option>
                  <option value="constraint">Constraint</option>
                  <option value="view">View</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Object Name</label>
                {ddlType === 'table' ? (
                  <select
                    value={ddlObject}
                    onChange={(e) => setDdlObject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select table...</option>
                    {tables.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={ddlObject}
                    onChange={(e) => setDdlObject(e.target.value)}
                    placeholder="Enter object name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>
            </div>

            {ddlType === 'table' && (
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ddlOptions.include_indexes}
                    onChange={(e) => setDdlOptions({ ...ddlOptions, include_indexes: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Indexes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ddlOptions.include_constraints}
                    onChange={(e) => setDdlOptions({ ...ddlOptions, include_constraints: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Constraints</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ddlOptions.include_triggers}
                    onChange={(e) => setDdlOptions({ ...ddlOptions, include_triggers: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Triggers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ddlOptions.if_not_exists}
                    onChange={(e) => setDdlOptions({ ...ddlOptions, if_not_exists: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">IF NOT EXISTS</span>
                </label>
              </div>
            )}

            <button onClick={generateDDL} disabled={loading || !ddlObject} className="btn btn-primary">
              <Code2 className="w-4 h-4 mr-2" />
              Generate DDL
            </button>

            {generatedDDL && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated DDL</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(generatedDDL)} className="btn btn-secondary btn-sm">
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedDDL], { type: 'text/sql' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${ddlObject}.sql`
                        a.click()
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </button>
                  </div>
                </div>
                <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                  {generatedDDL}
                </pre>
              </div>
            )}
          </div>
        )

      case 'versions':
        return (
          <div className="space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version Name</label>
                <input
                  type="text"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="e.g., v1.0.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button onClick={createSchemaVersion} disabled={loading || !newVersionName.trim()} className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Snapshot
              </button>
              <button onClick={fetchSchemaVersions} disabled={loading} className="btn btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  <History className="w-4 h-4 inline mr-2" />
                  Schema Versions ({schemaVersions.length})
                </h3>
              </div>
              {schemaVersions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No schema versions yet</p>
                  <p className="text-sm">Create a snapshot to track schema changes</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-auto">
                  {schemaVersions.map((version) => (
                    <div key={version.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{version.version}</p>
                          {version.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{version.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Created: {new Date(version.created_at).toLocaleString()}
                            {version.created_by && ` by ${version.created_by}`}
                          </p>
                        </div>
                        <button onClick={() => setViewingVersion(version)} className="btn btn-secondary btn-sm">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schema Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Explore and manage your database schema
        </p>
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
              { id: 'diagram', label: 'ER Diagram', icon: GitBranch },
              { id: 'compare', label: 'Compare', icon: ArrowRightLeft },
              { id: 'search', label: 'Search', icon: Search },
              { id: 'ddl', label: 'DDL Generator', icon: Code2 },
              { id: 'versions', label: 'Versions', icon: History },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab)
                  if (tab.id === 'versions' && schemaVersions.length === 0) {
                    fetchSchemaVersions()
                  }
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
          {!loading && renderTabContent()}
        </div>
      </div>

      {/* View Version Modal */}
      {viewingVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Schema Version: {viewingVersion.version}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {viewingVersion.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => setViewingVersion(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Version ID:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{viewingVersion.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(viewingVersion.created_at).toLocaleString()}</span>
                    </div>
                    {viewingVersion.created_by && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                        <span className="text-gray-900 dark:text-white">{viewingVersion.created_by}</span>
                      </div>
                    )}
                  </div>
                </div>
                {viewingVersion.changes && Array.isArray(viewingVersion.changes) && viewingVersion.changes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Changes</h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(viewingVersion.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {viewingVersion.schema_snapshot !== null && viewingVersion.schema_snapshot !== undefined && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schema Snapshot</h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-64 overflow-auto">
                      <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(viewingVersion.schema_snapshot, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setViewingVersion(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
