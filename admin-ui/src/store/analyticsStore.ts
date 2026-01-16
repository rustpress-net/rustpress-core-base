/**
 * Analytics Store (Zustand)
 *
 * State management for Google Analytics data.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import * as analyticsApi from '../services/analyticsApi';

// Store State Types
interface AnalyticsState {
  // Data
  overview: analyticsApi.OverviewMetrics | null;
  realtime: analyticsApi.RealtimeOverview | null;
  trafficData: analyticsApi.TrafficDataPoint[];
  trafficSources: analyticsApi.TrafficSource[];
  topPages: analyticsApi.TopPage[];
  geoData: analyticsApi.GeoData[];
  channels: analyticsApi.ChannelData[];
  audience: analyticsApi.AudienceOverview | null;
  acquisition: analyticsApi.AcquisitionOverview | null;
  behavior: analyticsApi.BehaviorOverview | null;
  conversions: analyticsApi.ConversionsOverview | null;
  ecommerce: analyticsApi.EcommerceOverview | null;

  // Settings
  settings: analyticsApi.AnalyticsSettings | null;
  connectionStatus: analyticsApi.ConnectionTestResult | null;
  availableProperties: analyticsApi.PropertyOption[];

  // Reports
  reports: analyticsApi.Report[];
  currentReport: analyticsApi.Report | null;
  reportResult: analyticsApi.ReportResult | null;

  // Sync & Cache
  syncStatus: analyticsApi.SyncStatus | null;
  cacheStats: analyticsApi.CacheStats | null;

  // UI State
  isLoading: boolean;
  isRealtimeLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  dateRange: string;
  startDate: string | null;
  endDate: string | null;
  compareEnabled: boolean;
  activeTab: string;

  // Last update timestamps
  lastOverviewUpdate: string | null;
  lastRealtimeUpdate: string | null;

  // Actions
  setDateRange: (range: string, start?: string, end?: string) => void;
  setCompareEnabled: (enabled: boolean) => void;
  setActiveTab: (tab: string) => void;
  clearError: () => void;

  // Data fetching actions
  fetchOverview: (forceRefresh?: boolean) => Promise<void>;
  fetchRealtime: () => Promise<void>;
  fetchTrafficData: () => Promise<void>;
  fetchTrafficSources: () => Promise<void>;
  fetchTopPages: () => Promise<void>;
  fetchGeoData: () => Promise<void>;
  fetchChannels: () => Promise<void>;
  fetchAudience: () => Promise<void>;
  fetchAcquisition: () => Promise<void>;
  fetchBehavior: () => Promise<void>;
  fetchConversions: () => Promise<void>;
  fetchEcommerce: () => Promise<void>;

  // Settings actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<analyticsApi.AnalyticsSettings>) => Promise<void>;
  testConnection: () => Promise<void>;
  fetchAvailableProperties: () => Promise<void>;

  // Reports actions
  fetchReports: () => Promise<void>;
  fetchReport: (reportId: string) => Promise<void>;
  createReport: (report: Omit<analyticsApi.Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReport: (reportId: string, report: Partial<analyticsApi.Report>) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  runReport: (reportId: string) => Promise<void>;

  // Sync actions
  syncData: () => Promise<void>;
  fetchSyncStatus: () => Promise<void>;
  clearCache: () => Promise<void>;
  fetchCacheStats: () => Promise<void>;

  // Bulk actions
  refreshAllData: () => Promise<void>;
  loadDashboardData: () => Promise<void>;
}

// Helper to build query params
const buildQuery = (state: AnalyticsState): analyticsApi.AnalyticsQuery => ({
  dateRange: state.dateRange,
  startDate: state.startDate || undefined,
  endDate: state.endDate || undefined,
  compare: state.compareEnabled,
});

// Create the store
export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        overview: null,
        realtime: null,
        trafficData: [],
        trafficSources: [],
        topPages: [],
        geoData: [],
        channels: [],
        audience: null,
        acquisition: null,
        behavior: null,
        conversions: null,
        ecommerce: null,
        settings: null,
        connectionStatus: null,
        availableProperties: [],
        reports: [],
        currentReport: null,
        reportResult: null,
        syncStatus: null,
        cacheStats: null,
        isLoading: false,
        isRealtimeLoading: false,
        isSyncing: false,
        error: null,
        dateRange: 'last7days',
        startDate: null,
        endDate: null,
        compareEnabled: false,
        activeTab: 'overview',
        lastOverviewUpdate: null,
        lastRealtimeUpdate: null,

        // UI Actions
        setDateRange: (range, start, end) => {
          set({ dateRange: range, startDate: start || null, endDate: end || null });
          // Refresh data with new date range
          get().refreshAllData();
        },

        setCompareEnabled: (enabled) => {
          set({ compareEnabled: enabled });
          get().fetchOverview(true);
        },

        setActiveTab: (tab) => set({ activeTab: tab }),

        clearError: () => set({ error: null }),

        // Data fetching actions
        fetchOverview: async (forceRefresh = false) => {
          const state = get();

          // Check if we have recent data (within 5 minutes)
          if (!forceRefresh && state.lastOverviewUpdate) {
            const lastUpdate = new Date(state.lastOverviewUpdate);
            const now = new Date();
            if (now.getTime() - lastUpdate.getTime() < 5 * 60 * 1000) {
              return; // Use cached data
            }
          }

          set({ isLoading: true, error: null });
          try {
            const overview = await analyticsApi.getOverview(buildQuery(state));
            set({
              overview,
              lastOverviewUpdate: new Date().toISOString(),
              isLoading: false,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchRealtime: async () => {
          set({ isRealtimeLoading: true });
          try {
            const realtime = await analyticsApi.getRealtime();
            set({
              realtime,
              lastRealtimeUpdate: new Date().toISOString(),
              isRealtimeLoading: false,
            });
          } catch (error) {
            set({ error: (error as Error).message, isRealtimeLoading: false });
          }
        },

        fetchTrafficData: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const trafficData = await analyticsApi.getTrafficData(buildQuery(state));
            set({ trafficData, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchTrafficSources: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const trafficSources = await analyticsApi.getTrafficSources(buildQuery(state));
            set({ trafficSources, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchTopPages: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const topPages = await analyticsApi.getTopPages(buildQuery(state));
            set({ topPages, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchGeoData: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const geoData = await analyticsApi.getGeoData(buildQuery(state));
            set({ geoData, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchChannels: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const channels = await analyticsApi.getChannels(buildQuery(state));
            set({ channels, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchAudience: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const audience = await analyticsApi.getAudienceOverview(buildQuery(state));
            set({ audience, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchAcquisition: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const acquisition = await analyticsApi.getAcquisitionOverview(buildQuery(state));
            set({ acquisition, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchBehavior: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const behavior = await analyticsApi.getBehaviorOverview(buildQuery(state));
            set({ behavior, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchConversions: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const [goals, multiChannel, attribution] = await Promise.all([
              analyticsApi.getGoals(buildQuery(state)),
              analyticsApi.getMultiChannel(buildQuery(state)),
              analyticsApi.getAttribution(buildQuery(state)),
            ]);
            set({
              conversions: {
                goals,
                multiChannel,
                attribution,
                ecommerce: get().ecommerce as analyticsApi.EcommerceOverview,
              },
              isLoading: false,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchEcommerce: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const ecommerce = await analyticsApi.getEcommerceOverview(buildQuery(state));
            set({ ecommerce, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        // Settings actions
        fetchSettings: async () => {
          set({ isLoading: true, error: null });
          try {
            const settings = await analyticsApi.getSettings();
            set({ settings, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        updateSettings: async (newSettings) => {
          set({ isLoading: true, error: null });
          try {
            const settings = await analyticsApi.updateSettings(newSettings);
            set({ settings, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        testConnection: async () => {
          set({ isLoading: true, error: null });
          try {
            const connectionStatus = await analyticsApi.testConnection();
            set({ connectionStatus, isLoading: false });
          } catch (error) {
            set({
              connectionStatus: { success: false, error: (error as Error).message },
              error: (error as Error).message,
              isLoading: false,
            });
          }
        },

        fetchAvailableProperties: async () => {
          set({ isLoading: true, error: null });
          try {
            const availableProperties = await analyticsApi.getAvailableProperties();
            set({ availableProperties, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        // Reports actions
        fetchReports: async () => {
          set({ isLoading: true, error: null });
          try {
            const reports = await analyticsApi.listReports();
            set({ reports, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchReport: async (reportId) => {
          set({ isLoading: true, error: null });
          try {
            const currentReport = await analyticsApi.getReport(reportId);
            set({ currentReport, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        createReport: async (report) => {
          set({ isLoading: true, error: null });
          try {
            const newReport = await analyticsApi.createReport(report);
            set((state) => ({
              reports: [...state.reports, newReport],
              currentReport: newReport,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        updateReport: async (reportId, report) => {
          set({ isLoading: true, error: null });
          try {
            const updatedReport = await analyticsApi.updateReport(reportId, report);
            set((state) => ({
              reports: state.reports.map((r) => r.id === reportId ? updatedReport : r),
              currentReport: updatedReport,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        deleteReport: async (reportId) => {
          set({ isLoading: true, error: null });
          try {
            await analyticsApi.deleteReport(reportId);
            set((state) => ({
              reports: state.reports.filter((r) => r.id !== reportId),
              currentReport: state.currentReport?.id === reportId ? null : state.currentReport,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        runReport: async (reportId) => {
          set({ isLoading: true, error: null });
          try {
            const reportResult = await analyticsApi.runReport(reportId);
            set({ reportResult, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        // Sync actions
        syncData: async () => {
          set({ isSyncing: true, error: null });
          try {
            await analyticsApi.syncData();
            await get().fetchSyncStatus();
            set({ isSyncing: false });
            // Refresh all data after sync
            await get().refreshAllData();
          } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
            throw error;
          }
        },

        fetchSyncStatus: async () => {
          try {
            const syncStatus = await analyticsApi.getSyncStatus();
            set({ syncStatus });
          } catch (error) {
            set({ error: (error as Error).message });
          }
        },

        clearCache: async () => {
          set({ isLoading: true, error: null });
          try {
            await analyticsApi.clearCache();
            set({ isLoading: false });
            // Refresh all data after clearing cache
            await get().refreshAllData();
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        fetchCacheStats: async () => {
          try {
            const cacheStats = await analyticsApi.getCacheStats();
            set({ cacheStats });
          } catch (error) {
            set({ error: (error as Error).message });
          }
        },

        // Bulk actions
        refreshAllData: async () => {
          const state = get();
          set({ isLoading: true, error: null });

          try {
            const query = buildQuery(state);

            const [overview, trafficData, trafficSources, topPages, geoData, channels] = await Promise.all([
              analyticsApi.getOverview(query),
              analyticsApi.getTrafficData(query),
              analyticsApi.getTrafficSources(query),
              analyticsApi.getTopPages(query),
              analyticsApi.getGeoData(query),
              analyticsApi.getChannels(query),
            ]);

            set({
              overview,
              trafficData,
              trafficSources,
              topPages,
              geoData,
              channels,
              lastOverviewUpdate: new Date().toISOString(),
              isLoading: false,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        loadDashboardData: async () => {
          const state = get();
          set({ isLoading: true, error: null });

          try {
            const query = buildQuery(state);

            // Load overview and realtime in parallel
            const [overview, realtime, trafficData, topPages] = await Promise.all([
              analyticsApi.getOverview(query),
              analyticsApi.getRealtime(),
              analyticsApi.getTrafficData(query),
              analyticsApi.getTopPages({ ...query, limit: 10 }),
            ]);

            set({
              overview,
              realtime,
              trafficData,
              topPages,
              lastOverviewUpdate: new Date().toISOString(),
              lastRealtimeUpdate: new Date().toISOString(),
              isLoading: false,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },
      }),
      {
        name: 'rustpress-analytics-store',
        partialize: (state) => ({
          dateRange: state.dateRange,
          compareEnabled: state.compareEnabled,
          activeTab: state.activeTab,
        }),
      }
    ),
    { name: 'AnalyticsStore' }
  )
);

// Selectors
export const selectOverview = (state: AnalyticsState) => state.overview;
export const selectRealtime = (state: AnalyticsState) => state.realtime;
export const selectIsLoading = (state: AnalyticsState) => state.isLoading;
export const selectError = (state: AnalyticsState) => state.error;
export const selectDateRange = (state: AnalyticsState) => state.dateRange;
export const selectSettings = (state: AnalyticsState) => state.settings;
export const selectConnectionStatus = (state: AnalyticsState) => state.connectionStatus;

export default useAnalyticsStore;
