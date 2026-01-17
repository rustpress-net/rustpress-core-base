/**
 * DatabaseInspector - View and manage database tables
 * RustPress-specific database inspection functionality
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Table, ChevronRight, ChevronDown, Search, RefreshCw,
  Eye, Edit, Trash2, Plus, Download, Upload, Play, Copy, Code,
  Key, Link, Hash, Type, Calendar, ToggleLeft, Filter, Settings
} from 'lucide-react';

export interface TableSchema {
  name: string;
  engine: string;
  rows: number;
  size: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  foreignKeys: ForeignKeySchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  isForeignKey: boolean;
  foreignKeyRef?: string;
}

export interface IndexSchema {
  name: string;
  type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT';
  columns: string[];
}

export interface ForeignKeySchema {
  name: string;
  column: string;
  refTable: string;
  refColumn: string;
  onDelete: string;
  onUpdate: string;
}

interface DatabaseInspectorProps {
  onExecuteQuery?: (query: string) => void;
}

// Mock data
const mockTables: TableSchema[] = [
  {
    name: 'posts',
    engine: 'InnoDB',
    rows: 156,
    size: '24 KB',
    columns: [
      { name: 'id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: true, isForeignKey: false },
      { name: 'title', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'slug', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'content', type: 'TEXT', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'excerpt', type: 'TEXT', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'status', type: 'ENUM', nullable: false, default: "'draft'", isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'author_id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: true, foreignKeyRef: 'users.id' },
      { name: 'category_id', type: 'BIGINT', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: true, foreignKeyRef: 'categories.id' },
      { name: 'featured_image', type: 'VARCHAR(255)', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'views', type: 'INT', nullable: false, default: '0', isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP ON UPDATE', isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'] },
      { name: 'posts_slug_unique', type: 'UNIQUE', columns: ['slug'] },
      { name: 'posts_author_id_index', type: 'INDEX', columns: ['author_id'] },
      { name: 'posts_status_index', type: 'INDEX', columns: ['status'] }
    ],
    foreignKeys: [
      { name: 'posts_author_id_foreign', column: 'author_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      { name: 'posts_category_id_foreign', column: 'category_id', refTable: 'categories', refColumn: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }
    ]
  },
  {
    name: 'users',
    engine: 'InnoDB',
    rows: 12,
    size: '8 KB',
    columns: [
      { name: 'id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: true, isForeignKey: false },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'password', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'role', type: 'ENUM', nullable: false, default: "'subscriber'", isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'avatar', type: 'VARCHAR(255)', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'] },
      { name: 'users_email_unique', type: 'UNIQUE', columns: ['email'] }
    ],
    foreignKeys: []
  },
  {
    name: 'categories',
    engine: 'InnoDB',
    rows: 8,
    size: '4 KB',
    columns: [
      { name: 'id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: true, isForeignKey: false },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'slug', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'description', type: 'TEXT', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'parent_id', type: 'BIGINT', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: true, foreignKeyRef: 'categories.id' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'] },
      { name: 'categories_slug_unique', type: 'UNIQUE', columns: ['slug'] }
    ],
    foreignKeys: []
  },
  {
    name: 'tags',
    engine: 'InnoDB',
    rows: 24,
    size: '4 KB',
    columns: [
      { name: 'id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: true, isForeignKey: false },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'slug', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'] },
      { name: 'tags_slug_unique', type: 'UNIQUE', columns: ['slug'] }
    ],
    foreignKeys: []
  },
  {
    name: 'post_tags',
    engine: 'InnoDB',
    rows: 89,
    size: '4 KB',
    columns: [
      { name: 'post_id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: false, isForeignKey: true, foreignKeyRef: 'posts.id' },
      { name: 'tag_id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: false, isForeignKey: true, foreignKeyRef: 'tags.id' }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['post_id', 'tag_id'] }
    ],
    foreignKeys: [
      { name: 'post_tags_post_id_foreign', column: 'post_id', refTable: 'posts', refColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      { name: 'post_tags_tag_id_foreign', column: 'tag_id', refTable: 'tags', refColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    ]
  },
  {
    name: 'media',
    engine: 'InnoDB',
    rows: 45,
    size: '12 KB',
    columns: [
      { name: 'id', type: 'BIGINT', nullable: false, default: null, isPrimaryKey: true, isAutoIncrement: true, isForeignKey: false },
      { name: 'filename', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'path', type: 'VARCHAR(255)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'mime_type', type: 'VARCHAR(100)', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'size', type: 'INT', nullable: false, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'alt', type: 'VARCHAR(255)', nullable: true, default: null, isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', isPrimaryKey: false, isAutoIncrement: false, isForeignKey: false }
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY', columns: ['id'] }
    ],
    foreignKeys: []
  }
];

const mockQueryResults = [
  { id: 1, title: 'Getting Started', slug: 'getting-started', status: 'published', views: 1250 },
  { id: 2, title: 'Advanced Topics', slug: 'advanced-topics', status: 'draft', views: 0 },
  { id: 3, title: 'API Reference', slug: 'api-reference', status: 'published', views: 890 }
];

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  onExecuteQuery
}) => {
  const [tables] = useState<TableSchema[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'data' | 'indexes' | 'relations'>('structure');
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setQueryResults(mockQueryResults);
    setIsExecuting(false);
    onExecuteQuery?.(sqlQuery);
  };

  const getTypeIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('INT') || t.includes('DECIMAL') || t.includes('FLOAT')) return <Hash className="w-3 h-3 text-blue-400" />;
    if (t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR')) return <Type className="w-3 h-3 text-green-400" />;
    if (t.includes('DATE') || t.includes('TIME')) return <Calendar className="w-3 h-3 text-purple-400" />;
    if (t.includes('BOOL') || t.includes('ENUM')) return <ToggleLeft className="w-3 h-3 text-yellow-400" />;
    return <Type className="w-3 h-3 text-gray-400" />;
  };

  const generateSelectQuery = (table: TableSchema) => {
    return `SELECT * FROM ${table.name} LIMIT 100;`;
  };

  const toggleTableExpand = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar - Tables List */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-orange-400" />
            Database
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables..."
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-2 text-xs text-gray-500 uppercase tracking-wider">
            Tables ({filteredTables.length})
          </div>
          {filteredTables.map(table => (
            <div key={table.name}>
              <button
                onClick={() => {
                  setSelectedTable(table);
                  toggleTableExpand(table.name);
                }}
                className={`w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                  selectedTable?.name === table.name
                    ? 'bg-orange-900/30 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                {expandedTables.has(table.name) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Table className="w-4 h-4" />
                <span className="flex-1 text-left">{table.name}</span>
                <span className="text-xs text-gray-500">{table.rows}</span>
              </button>
              <AnimatePresence>
                {expandedTables.has(table.name) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden pl-8"
                  >
                    {table.columns.slice(0, 5).map(col => (
                      <div key={col.name} className="px-3 py-1 flex items-center gap-2 text-xs text-gray-500">
                        {col.isPrimaryKey ? <Key className="w-3 h-3 text-yellow-500" /> : getTypeIcon(col.type)}
                        <span>{col.name}</span>
                        {col.isForeignKey && <Link className="w-3 h-3 text-blue-400" />}
                      </div>
                    ))}
                    {table.columns.length > 5 && (
                      <div className="px-3 py-1 text-xs text-gray-600">
                        +{table.columns.length - 5} more columns
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-2">Database Stats</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-orange-400 font-medium">{tables.length}</div>
              <div className="text-gray-500">Tables</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-orange-400 font-medium">{tables.reduce((acc, t) => acc + t.rows, 0)}</div>
              <div className="text-gray-500">Total Rows</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTable ? (
          <>
            {/* Table Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Table className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">{selectedTable.name}</h3>
                  <span className="text-sm text-gray-500">
                    {selectedTable.rows} rows • {selectedTable.size} • {selectedTable.engine}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSqlQuery(generateSelectQuery(selectedTable));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                    Browse
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
                    <Plus className="w-4 h-4" />
                    Insert
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-4">
                {(['structure', 'data', 'indexes', 'relations'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'structure' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-800">
                        <th className="pb-2 pl-2">Column</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Nullable</th>
                        <th className="pb-2">Default</th>
                        <th className="pb-2">Key</th>
                        <th className="pb-2">Extra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.columns.map(col => (
                        <tr key={col.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 pl-2">
                            <span className="flex items-center gap-2">
                              {getTypeIcon(col.type)}
                              <span className="text-white font-mono">{col.name}</span>
                              {col.isPrimaryKey && <Key className="w-3 h-3 text-yellow-500" title="Primary Key" />}
                              {col.isForeignKey && <Link className="w-3 h-3 text-blue-400" title={`FK: ${col.foreignKeyRef}`} />}
                            </span>
                          </td>
                          <td className="py-2 text-gray-400 font-mono">{col.type}</td>
                          <td className="py-2">
                            <span className={col.nullable ? 'text-green-400' : 'text-red-400'}>
                              {col.nullable ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="py-2 text-gray-400 font-mono">{col.default || 'NULL'}</td>
                          <td className="py-2 text-gray-400">
                            {col.isPrimaryKey && 'PRI'}
                            {col.isForeignKey && !col.isPrimaryKey && 'FK'}
                          </td>
                          <td className="py-2 text-gray-400">
                            {col.isAutoIncrement && 'auto_increment'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'indexes' && (
                <div className="space-y-3">
                  {selectedTable.indexes.map(index => (
                    <div key={index.name} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          index.type === 'PRIMARY' ? 'bg-yellow-500/20 text-yellow-400' :
                          index.type === 'UNIQUE' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {index.type}
                        </span>
                        <span className="text-white font-medium">{index.name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Columns: {index.columns.map(c => <code key={c} className="mx-1 px-1 bg-gray-900 rounded">{c}</code>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'relations' && (
                <div className="space-y-3">
                  {selectedTable.foreignKeys.length > 0 ? (
                    selectedTable.foreignKeys.map(fk => (
                      <div key={fk.name} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Link className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">{fk.name}</span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>
                            <code className="px-1 bg-gray-900 rounded">{fk.column}</code>
                            <span className="mx-2">→</span>
                            <code className="px-1 bg-gray-900 rounded">{fk.refTable}.{fk.refColumn}</code>
                          </div>
                          <div className="text-xs">
                            ON DELETE: <span className="text-orange-400">{fk.onDelete}</span>
                            {' | '}
                            ON UPDATE: <span className="text-orange-400">{fk.onUpdate}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No foreign key relationships
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'data' && queryResults && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-800">
                        {Object.keys(queryResults[0] || {}).map(key => (
                          <th key={key} className="pb-2 px-2 whitespace-nowrap">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="py-2 px-2 text-gray-300 font-mono">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Database className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a table</p>
            <p className="text-sm">Choose a table from the sidebar to view its structure</p>
          </div>
        )}

        {/* SQL Query Panel */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">SQL Query</span>
          </div>
          <div className="flex gap-2">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM posts WHERE status = 'published';"
              className="flex-1 h-20 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleExecuteQuery}
              disabled={!sqlQuery || isExecuting}
              className="px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isExecuting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInspector;
