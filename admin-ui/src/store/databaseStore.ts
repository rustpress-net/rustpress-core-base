import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  databaseApi,
  DatabaseStatus,
  DatabaseStats,
  TableInfo,
  ColumnInfo,
  QueryResult,
  SavedQuery,
  QueryHistoryItem,
} from '../api/client'

interface DatabaseState {
  // Connection status
  status: DatabaseStatus | null
  stats: DatabaseStats | null
  isConnected: boolean
  isLoading: boolean
  error: string | null

  // Tables
  tables: TableInfo[]
  selectedTable: string | null
  tableColumns: Record<string, ColumnInfo[]>

  // Query
  currentQuery: string
  queryResult: QueryResult | null
  isExecuting: boolean
  queryHistory: QueryHistoryItem[]
  savedQueries: SavedQuery[]

  // Settings
  readOnlyMode: boolean
  showSystemTables: boolean
  pageSize: number
  editorTheme: 'dark' | 'light'

  // Actions
  fetchStatus: () => Promise<void>
  fetchStats: () => Promise<void>
  fetchTables: () => Promise<void>
  fetchTableColumns: (tableName: string) => Promise<void>
  setSelectedTable: (tableName: string | null) => void

  executeQuery: (query: string) => Promise<QueryResult | null>
  setCurrentQuery: (query: string) => void
  clearQueryResult: () => void

  saveQuery: (name: string, query: string) => Promise<void>
  deleteSavedQuery: (id: string) => Promise<void>
  fetchSavedQueries: () => Promise<void>
  fetchQueryHistory: () => Promise<void>
  loadQueryFromHistory: (query: string) => void

  setReadOnlyMode: (enabled: boolean) => void
  setShowSystemTables: (show: boolean) => void
  setPageSize: (size: number) => void
  setEditorTheme: (theme: 'dark' | 'light') => void

  reset: () => void
}

const initialState = {
  status: null,
  stats: null,
  isConnected: false,
  isLoading: false,
  error: null,
  tables: [],
  selectedTable: null,
  tableColumns: {},
  currentQuery: '',
  queryResult: null,
  isExecuting: false,
  queryHistory: [],
  savedQueries: [],
  readOnlyMode: false,
  showSystemTables: false,
  pageSize: 50,
  editorTheme: 'dark' as const,
}

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchStatus: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await databaseApi.getStatus()
          set({
            status: response.data,
            isConnected: response.data.connected,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch database status',
            isConnected: false,
            isLoading: false,
          })
        }
      },

      fetchStats: async () => {
        try {
          const response = await databaseApi.getStats()
          set({ stats: response.data })
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch database stats' })
        }
      },

      fetchTables: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await databaseApi.getTables()
          set({ tables: response.data, isLoading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch tables',
            isLoading: false,
          })
        }
      },

      fetchTableColumns: async (tableName: string) => {
        try {
          const response = await databaseApi.getTableColumns(tableName)
          set((state) => ({
            tableColumns: {
              ...state.tableColumns,
              [tableName]: response.data,
            },
          }))
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch table columns' })
        }
      },

      setSelectedTable: (tableName: string | null) => {
        set({ selectedTable: tableName })
        if (tableName) {
          get().fetchTableColumns(tableName)
        }
      },

      executeQuery: async (query: string) => {
        const { readOnlyMode } = get()

        // Check for write operations in read-only mode
        if (readOnlyMode) {
          const writePatterns = /^\s*(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE)/i
          if (writePatterns.test(query)) {
            set({
              queryResult: {
                columns: [],
                rows: [],
                affected_rows: 0,
                execution_time: 0,
              },
              error: 'Write operations are disabled in read-only mode',
            })
            return null
          }
        }

        set({ isExecuting: true, queryResult: null, error: null })

        try {
          const response = await databaseApi.executeQuery(query)
          const result = response.data

          set({
            queryResult: result,
            isExecuting: false,
            currentQuery: query,
          })

          // Update history locally
          const historyItem: QueryHistoryItem = {
            id: Date.now().toString(),
            query: query.slice(0, 200),
            execution_time: result.execution_time,
            success: true,
            executed_at: new Date().toISOString(),
          }

          set((state) => ({
            queryHistory: [historyItem, ...state.queryHistory.slice(0, 99)],
          }))

          return result
        } catch (error: any) {
          const errorResult: QueryResult = {
            columns: [],
            rows: [],
            affected_rows: 0,
            execution_time: 0,
          }

          set({
            queryResult: errorResult,
            isExecuting: false,
            error: error.response?.data?.message || error.message || 'Query execution failed',
          })

          return errorResult
        }
      },

      setCurrentQuery: (query: string) => {
        set({ currentQuery: query })
      },

      clearQueryResult: () => {
        set({ queryResult: null })
      },

      saveQuery: async (name: string, query: string) => {
        try {
          const response = await databaseApi.saveQuery(name, query)
          set((state) => ({
            savedQueries: [response.data, ...state.savedQueries],
          }))
        } catch (error: any) {
          set({ error: error.message || 'Failed to save query' })
        }
      },

      deleteSavedQuery: async (id: string) => {
        // Note: API doesn't have delete endpoint yet - just remove locally
        set((state) => ({
          savedQueries: state.savedQueries.filter((q) => q.id !== id),
        }))
      },

      fetchSavedQueries: async () => {
        try {
          const response = await databaseApi.getSavedQueries()
          set({ savedQueries: response.data })
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch saved queries' })
        }
      },

      fetchQueryHistory: async () => {
        try {
          const response = await databaseApi.getHistory()
          set({ queryHistory: response.data })
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch query history' })
        }
      },

      loadQueryFromHistory: (query: string) => {
        set({ currentQuery: query })
      },

      setReadOnlyMode: (enabled: boolean) => {
        set({ readOnlyMode: enabled })
      },

      setShowSystemTables: (show: boolean) => {
        set({ showSystemTables: show })
        get().fetchTables()
      },

      setPageSize: (size: number) => {
        set({ pageSize: size })
      },

      setEditorTheme: (theme: 'dark' | 'light') => {
        set({ editorTheme: theme })
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'database-manager-storage',
      partialize: (state) => ({
        readOnlyMode: state.readOnlyMode,
        showSystemTables: state.showSystemTables,
        pageSize: state.pageSize,
        editorTheme: state.editorTheme,
        savedQueries: state.savedQueries,
        queryHistory: state.queryHistory.slice(0, 50), // Keep last 50 in storage
      }),
    }
  )
)

export default useDatabaseStore
