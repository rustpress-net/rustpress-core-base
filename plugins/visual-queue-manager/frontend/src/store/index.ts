import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Queue,
  Worker,
  Alert,
  UIPreferences,
  FilterState,
  ThemeMode,
  ViewMode,
} from '@/types';

// ============================================================================
// UI Store
// ============================================================================

interface UIState {
  preferences: UIPreferences;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activeModal: string | null;
  modalData: unknown;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setViewMode: (mode: ViewMode) => void;
  setRefreshInterval: (interval: number) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'dark',
        sidebar_collapsed: false,
        default_view_mode: 'table',
        refresh_interval: 5000,
        notifications_enabled: true,
        sound_enabled: false,
      },
      sidebarOpen: true,
      commandPaletteOpen: false,
      activeModal: null,
      modalData: null,

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      setViewMode: (mode) =>
        set((state) => ({
          preferences: { ...state.preferences, default_view_mode: mode },
        })),

      setRefreshInterval: (interval) =>
        set((state) => ({
          preferences: { ...state.preferences, refresh_interval: interval },
        })),

      toggleNotifications: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications_enabled: !state.preferences.notifications_enabled,
          },
        })),

      toggleSound: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            sound_enabled: !state.preferences.sound_enabled,
          },
        })),

      openModal: (modal, data) => set({ activeModal: modal, modalData: data }),

      closeModal: () => set({ activeModal: null, modalData: null }),

      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),
    }),
    {
      name: 'vqm-ui-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);

// ============================================================================
// Queue Store
// ============================================================================

interface QueueState {
  queues: Queue[];
  selectedQueueId: string | null;
  filters: FilterState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setQueues: (queues: Queue[]) => void;
  addQueue: (queue: Queue) => void;
  updateQueue: (id: string, updates: Partial<Queue>) => void;
  removeQueue: (id: string) => void;
  selectQueue: (id: string | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: FilterState = {
  search: '',
  status: [],
  queue_type: [],
  date_range: null,
  tags: [],
};

export const useQueueStore = create<QueueState>((set) => ({
  queues: [],
  selectedQueueId: null,
  filters: initialFilters,
  isLoading: false,
  error: null,

  setQueues: (queues) => set({ queues, isLoading: false, error: null }),

  addQueue: (queue) =>
    set((state) => ({ queues: [queue, ...state.queues] })),

  updateQueue: (id, updates) =>
    set((state) => ({
      queues: state.queues.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    })),

  removeQueue: (id) =>
    set((state) => ({
      queues: state.queues.filter((q) => q.id !== id),
      selectedQueueId: state.selectedQueueId === id ? null : state.selectedQueueId,
    })),

  selectQueue: (id) => set({ selectedQueueId: id }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// ============================================================================
// Worker Store
// ============================================================================

interface WorkerState {
  workers: Worker[];
  selectedWorkerId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWorkers: (workers: Worker[]) => void;
  addWorker: (worker: Worker) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  removeWorker: (id: string) => void;
  selectWorker: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkerStore = create<WorkerState>((set) => ({
  workers: [],
  selectedWorkerId: null,
  isLoading: false,
  error: null,

  setWorkers: (workers) => set({ workers, isLoading: false, error: null }),

  addWorker: (worker) =>
    set((state) => ({ workers: [worker, ...state.workers] })),

  updateWorker: (id, updates) =>
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  removeWorker: (id) =>
    set((state) => ({
      workers: state.workers.filter((w) => w.id !== id),
      selectedWorkerId: state.selectedWorkerId === id ? null : state.selectedWorkerId,
    })),

  selectWorker: (id) => set({ selectedWorkerId: id }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// ============================================================================
// Alert Store
// ============================================================================

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => a.status === 'active').length,
      isLoading: false,
      error: null,
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: alert.status === 'active' ? state.unreadCount + 1 : state.unreadCount,
    })),

  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' as const } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, status: 'acknowledged' as const })),
      unreadCount: 0,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

// ============================================================================
// WebSocket Store
// ============================================================================

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: unknown;
  reconnectAttempts: number;

  // Actions
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  setLastMessage: (message: unknown) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  connecting: false,
  error: null,
  lastMessage: null,
  reconnectAttempts: 0,

  setConnected: (connected) =>
    set({ connected, connecting: false, error: null }),

  setConnecting: (connecting) => set({ connecting }),

  setError: (error) =>
    set({ error, connected: false, connecting: false }),

  setLastMessage: (lastMessage) => set({ lastMessage }),

  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),

  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));

// ============================================================================
// Selection Store (for bulk operations)
// ============================================================================

interface SelectionState {
  selectedItems: Set<string>;
  selectMode: boolean;

  // Actions
  toggleItem: (id: string) => void;
  selectItems: (ids: string[]) => void;
  deselectItems: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelectMode: () => void;
  setSelectMode: (mode: boolean) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedItems: new Set(),
  selectMode: false,

  toggleItem: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedItems);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedItems: newSelection };
    }),

  selectItems: (ids) =>
    set((state) => {
      const newSelection = new Set(state.selectedItems);
      ids.forEach((id) => newSelection.add(id));
      return { selectedItems: newSelection };
    }),

  deselectItems: (ids) =>
    set((state) => {
      const newSelection = new Set(state.selectedItems);
      ids.forEach((id) => newSelection.delete(id));
      return { selectedItems: newSelection };
    }),

  selectAll: (ids) => set({ selectedItems: new Set(ids) }),

  clearSelection: () => set({ selectedItems: new Set(), selectMode: false }),

  toggleSelectMode: () =>
    set((state) => ({
      selectMode: !state.selectMode,
      selectedItems: state.selectMode ? new Set() : state.selectedItems,
    })),

  setSelectMode: (mode) =>
    set({ selectMode: mode, selectedItems: mode ? new Set() : new Set() }),
}));

// ============================================================================
// Metrics Store
// ============================================================================

interface MetricsState {
  lastUpdated: string | null;
  isLive: boolean;

  // Actions
  setLastUpdated: (timestamp: string) => void;
  toggleLive: () => void;
  setLive: (live: boolean) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  lastUpdated: null,
  isLive: true,

  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),

  toggleLive: () => set((state) => ({ isLive: !state.isLive })),

  setLive: (isLive) => set({ isLive }),
}));
