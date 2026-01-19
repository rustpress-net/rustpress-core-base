/**
 * DatabaseExplorer - Database browser and SQL runner for the IDE
 * Provides tree-view navigation of databases, tables, columns
 * Supports running SQL queries with password protection for mutations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Table, Columns, Key, Hash, Calendar, Type,
  ChevronRight, ChevronDown, RefreshCw, Play, Lock, Eye,
  Search, Copy, Download, AlertTriangle, CheckCircle,
  XCircle, Loader2, FileCode, ArrowLeft, ArrowRight,
  Filter, SortAsc, MoreHorizontal, Trash2, Edit, Plus
} from 'lucide-react';

// Types
interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimary: boolean;
  isForeign: boolean;
  foreignTable?: string;
  foreignColumn?: string;
}

interface TableInfo {
  name: string;
  schema: string;
  rowCount: number;
  columns: Column[];
  indexes: string[];
}

interface DatabaseInfo {
  name: string;
  tables: TableInfo[];
  size: string;
  encoding: string;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  affectedRows?: number;
  executionTime: number;
  error?: string;
}

interface DatabaseExplorerProps {
  onClose?: () => void;
  activeFile?: { path: string; content: string };
}

// Mock data for development
const mockDatabases: DatabaseInfo[] = [
  {
    name: 'rustpress_main',
    size: '245 MB',
    encoding: 'UTF8',
    tables: [
      {
        name: 'posts',
        schema: 'public',
        rowCount: 1247,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimary: true, isForeign: false },
          { name: 'title', type: 'varchar(255)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'slug', type: 'varchar(255)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'content', type: 'text', nullable: true, default: null, isPrimary: false, isForeign: false },
          { name: 'status', type: 'varchar(20)', nullable: false, default: "'draft'", isPrimary: false, isForeign: false },
          { name: 'author_id', type: 'uuid', nullable: false, default: null, isPrimary: false, isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
        ],
        indexes: ['posts_pkey', 'posts_slug_idx', 'posts_author_idx', 'posts_status_idx'],
      },
      {
        name: 'users',
        schema: 'public',
        rowCount: 156,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimary: true, isForeign: false },
          { name: 'email', type: 'varchar(255)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'username', type: 'varchar(100)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'password_hash', type: 'varchar(255)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'role', type: 'varchar(20)', nullable: false, default: "'subscriber'", isPrimary: false, isForeign: false },
          { name: 'created_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
        ],
        indexes: ['users_pkey', 'users_email_idx', 'users_username_idx'],
      },
      {
        name: 'comments',
        schema: 'public',
        rowCount: 3891,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimary: true, isForeign: false },
          { name: 'post_id', type: 'uuid', nullable: false, default: null, isPrimary: false, isForeign: true, foreignTable: 'posts', foreignColumn: 'id' },
          { name: 'author_id', type: 'uuid', nullable: true, default: null, isPrimary: false, isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
          { name: 'content', type: 'text', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'status', type: 'varchar(20)', nullable: false, default: "'pending'", isPrimary: false, isForeign: false },
          { name: 'created_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
        ],
        indexes: ['comments_pkey', 'comments_post_idx', 'comments_status_idx'],
      },
      {
        name: 'media',
        schema: 'public',
        rowCount: 2847,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimary: true, isForeign: false },
          { name: 'filename', type: 'varchar(255)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'mime_type', type: 'varchar(100)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'size', type: 'bigint', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'storage_path', type: 'text', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'uploaded_by', type: 'uuid', nullable: false, default: null, isPrimary: false, isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
          { name: 'created_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
        ],
        indexes: ['media_pkey', 'media_filename_idx'],
      },
      {
        name: 'settings',
        schema: 'public',
        rowCount: 45,
        columns: [
          { name: 'id', type: 'serial', nullable: false, default: null, isPrimary: true, isForeign: false },
          { name: 'key', type: 'varchar(100)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'value', type: 'jsonb', nullable: true, default: null, isPrimary: false, isForeign: false },
          { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
        ],
        indexes: ['settings_pkey', 'settings_key_idx'],
      },
      {
        name: 'storage_configurations',
        schema: 'public',
        rowCount: 5,
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimary: true, isForeign: false },
          { name: 'category', type: 'varchar(50)', nullable: false, default: null, isPrimary: false, isForeign: false },
          { name: 'provider', type: 'varchar(50)', nullable: false, default: "'local'", isPrimary: false, isForeign: false },
          { name: 'config', type: 'jsonb', nullable: false, default: "'{}'", isPrimary: false, isForeign: false },
          { name: 'is_active', type: 'boolean', nullable: false, default: 'true', isPrimary: false, isForeign: false },
          { name: 'created_at', type: 'timestamptz', nullable: false, default: 'NOW()', isPrimary: false, isForeign: false },
        ],
        indexes: ['storage_configurations_pkey', 'storage_configurations_category_idx'],
      },
    ],
  },
];

// Column type icons
const getColumnIcon = (column: Column) => {
  if (column.isPrimary) return <Key className="w-3.5 h-3.5 text-yellow-400" />;
  if (column.isForeign) return <Key className="w-3.5 h-3.5 text-blue-400" />;
  if (column.type.includes('int') || column.type.includes('serial')) return <Hash className="w-3.5 h-3.5 text-green-400" />;
  if (column.type.includes('timestamp') || column.type.includes('date')) return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
  return <Type className="w-3.5 h-3.5 text-gray-400" />;
};

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ onClose, activeFile }) => {
  const [databases, setDatabases] = useState<DatabaseInfo[]>(mockDatabases);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['rustpress_main']));
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'browser' | 'query'>('browser');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if active file is SQL
  const isSqlFile = activeFile?.path.endsWith('.sql');

  // Load SQL from active file
  useEffect(() => {
    if (isSqlFile && activeFile?.content) {
      setSqlQuery(activeFile.content);
      setActiveTab('query');
    }
  }, [activeFile, isSqlFile]);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Select table and load data
  const selectTable = async (table: TableInfo) => {
    setSelectedTable(table);
    setCurrentPage(1);
    await loadTableData(table, 1);
  };

  // Load table data with pagination
  const loadTableData = async (table: TableInfo, page: number) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock data
    const rows = Array.from({ length: Math.min(pageSize, table.rowCount - (page - 1) * pageSize) }, (_, i) => {
      const row: Record<string, unknown> = {};
      table.columns.forEach(col => {
        if (col.type.includes('uuid')) {
          row[col.name] = `${crypto.randomUUID().slice(0, 8)}...`;
        } else if (col.type.includes('int') || col.type.includes('serial')) {
          row[col.name] = (page - 1) * pageSize + i + 1;
        } else if (col.type.includes('timestamp')) {
          row[col.name] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
        } else if (col.type.includes('bool')) {
          row[col.name] = Math.random() > 0.5;
        } else if (col.type.includes('jsonb')) {
          row[col.name] = '{...}';
        } else if (col.name === 'email') {
          row[col.name] = `user${(page - 1) * pageSize + i + 1}@example.com`;
        } else if (col.name === 'title') {
          row[col.name] = `Sample Post ${(page - 1) * pageSize + i + 1}`;
        } else if (col.name === 'status') {
          row[col.name] = ['draft', 'published', 'pending'][Math.floor(Math.random() * 3)];
        } else {
          row[col.name] = `Value ${i + 1}`;
        }
      });
      return row;
    });

    setTableData({
      columns: table.columns.map(c => c.name),
      rows,
      rowCount: table.rowCount,
      executionTime: Math.random() * 50 + 10,
    });
    setIsLoading(false);
  };

  // Check if query is a mutation (not SELECT)
  const isMutationQuery = (query: string): boolean => {
    const trimmed = query.trim().toUpperCase();
    return !trimmed.startsWith('SELECT') &&
           !trimmed.startsWith('EXPLAIN') &&
           !trimmed.startsWith('SHOW') &&
           !trimmed.startsWith('DESCRIBE');
  };

  // Run SQL query
  const runQuery = async (query: string) => {
    if (!query.trim()) return;

    // Check if mutation query requires password
    if (isMutationQuery(query)) {
      setPendingQuery(query);
      setShowPasswordModal(true);
      return;
    }

    await executeQuery(query);
  };

  // Execute query after password verification
  const executeQuery = async (query: string) => {
    setIsLoading(true);
    setQueryResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock result
    const isSelect = query.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
      setQueryResult({
        columns: ['id', 'title', 'status', 'created_at'],
        rows: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          title: `Result ${i + 1}`,
          status: 'published',
          created_at: new Date().toISOString().slice(0, 19),
        })),
        rowCount: 10,
        executionTime: Math.random() * 100 + 20,
      });
    } else {
      setQueryResult({
        columns: [],
        rows: [],
        rowCount: 0,
        affectedRows: Math.floor(Math.random() * 10) + 1,
        executionTime: Math.random() * 100 + 20,
      });
    }

    setIsLoading(false);
  };

  // Handle password submission
  const handlePasswordSubmit = async () => {
    if (password !== 'admin') { // In production, verify via API
      setPasswordError('Incorrect password');
      return;
    }

    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');

    if (pendingQuery) {
      await executeQuery(pendingQuery);
      setPendingQuery(null);
    }
  };

  // Refresh databases
  const refreshDatabases = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Pagination
  const totalPages = selectedTable ? Math.ceil(selectedTable.rowCount / pageSize) : 0;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Database Explorer</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshDatabases}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('browser')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors ${
            activeTab === 'browser'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Table className="w-4 h-4" />
          Browser
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors ${
            activeTab === 'query'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Query
          {isSqlFile && <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">.sql</span>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'browser' ? (
          <>
            {/* Tree View */}
            <div className="w-64 border-r border-gray-800 overflow-y-auto">
              <div className="p-2">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
                  />
                </div>

                {databases.map(db => (
                  <div key={db.name} className="mb-1">
                    {/* Database node */}
                    <button
                      onClick={() => toggleNode(db.name)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {expandedNodes.has(db.name) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white truncate">{db.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{db.size}</span>
                    </button>

                    {/* Tables */}
                    <AnimatePresence>
                      {expandedNodes.has(db.name) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-4 overflow-hidden"
                        >
                          {db.tables
                            .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(table => (
                              <div key={table.name}>
                                {/* Table node */}
                                <button
                                  onClick={() => {
                                    toggleNode(`${db.name}.${table.name}`);
                                    selectTable(table);
                                  }}
                                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded-lg transition-colors ${
                                    selectedTable?.name === table.name
                                      ? 'bg-cyan-500/20 text-cyan-400'
                                      : 'hover:bg-gray-800 text-gray-300'
                                  }`}
                                >
                                  {expandedNodes.has(`${db.name}.${table.name}`) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  )}
                                  <Table className="w-4 h-4 text-green-400" />
                                  <span className="text-sm truncate">{table.name}</span>
                                  <span className="ml-auto text-xs text-gray-500">{table.rowCount}</span>
                                </button>

                                {/* Columns */}
                                <AnimatePresence>
                                  {expandedNodes.has(`${db.name}.${table.name}`) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="ml-4 overflow-hidden"
                                    >
                                      {table.columns.map(col => (
                                        <div
                                          key={col.name}
                                          className="flex items-center gap-2 px-2 py-1 text-sm text-gray-400 hover:bg-gray-800 rounded"
                                          title={`${col.type}${col.nullable ? '' : ' NOT NULL'}${col.default ? ` DEFAULT ${col.default}` : ''}`}
                                        >
                                          {getColumnIcon(col)}
                                          <span className="truncate">{col.name}</span>
                                          <span className="ml-auto text-xs text-gray-600">{col.type}</span>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Data View */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedTable ? (
                <>
                  {/* Table Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                    <div>
                      <h3 className="text-white font-medium">{selectedTable.name}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedTable.rowCount.toLocaleString()} rows | {selectedTable.columns.length} columns
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                        <Filter className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="flex-1 overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      </div>
                    ) : tableData ? (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-800 sticky top-0">
                          <tr>
                            {tableData.columns.map(col => (
                              <th
                                key={col}
                                className="px-4 py-2 text-left text-gray-400 font-medium border-b border-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  {col}
                                  <SortAsc className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                </div>
                              </th>
                            ))}
                            <th className="px-4 py-2 w-10 border-b border-gray-700"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-gray-800 hover:bg-gray-800/50"
                            >
                              {tableData.columns.map(col => (
                                <td
                                  key={col}
                                  className="px-4 py-2 text-gray-300 truncate max-w-xs"
                                >
                                  {String(row[col] ?? 'NULL')}
                                </td>
                              ))}
                              <td className="px-2 py-2">
                                <button className="p-1 text-gray-500 hover:text-white">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : null}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(parseInt(e.target.value));
                          setCurrentPage(1);
                          if (selectedTable) loadTableData(selectedTable, 1);
                        }}
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                      >
                        {[10, 25, 50, 100].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            if (selectedTable) loadTableData(selectedTable, newPage);
                          }}
                          disabled={currentPage === 1}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            if (selectedTable) loadTableData(selectedTable, newPage);
                          }}
                          disabled={currentPage === totalPages}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <Table className="w-12 h-12 mb-4 opacity-50" />
                  <p>Select a table to view data</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Query Tab */
          <div className="flex-1 flex flex-col">
            {/* Query Editor */}
            <div className="flex-1 p-4">
              <div className="h-full flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">SQL Query</span>
                  <button
                    onClick={() => runQuery(sqlQuery)}
                    disabled={isLoading || !sqlQuery.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Run Query
                  </button>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM posts WHERE status = 'published' LIMIT 10;"
                  className="flex-1 p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Query Result */}
            {queryResult && (
              <div className="h-1/2 border-t border-gray-800">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                  <div className="flex items-center gap-3">
                    {queryResult.error ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-sm text-gray-400">
                      {queryResult.error
                        ? 'Query failed'
                        : queryResult.affectedRows !== undefined
                        ? `${queryResult.affectedRows} rows affected`
                        : `${queryResult.rowCount} rows returned`}
                    </span>
                    <span className="text-xs text-gray-600">
                      {queryResult.executionTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-auto h-full">
                  {queryResult.error ? (
                    <div className="p-4 text-red-400">{queryResult.error}</div>
                  ) : queryResult.columns.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800 sticky top-0">
                        <tr>
                          {queryResult.columns.map(col => (
                            <th
                              key={col}
                              className="px-4 py-2 text-left text-gray-400 font-medium border-b border-gray-700"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-800 hover:bg-gray-800/50"
                          >
                            {queryResult.columns.map(col => (
                              <td key={col} className="px-4 py-2 text-gray-300">
                                {String(row[col] ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Query executed successfully
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Password Required</h3>
                  <p className="text-sm text-gray-400">This query will modify data</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Mutation Query Detected</span>
                </div>
                <code className="text-xs text-gray-400 font-mono line-clamp-3">
                  {pendingQuery}
                </code>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Enter your password to continue
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Password"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-red-400 mt-1">{passwordError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                    setPendingQuery(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors"
                >
                  Execute Query
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatabaseExplorer;
