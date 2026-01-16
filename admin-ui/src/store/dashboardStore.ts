/**
 * RustPress Dashboard Store
 * Manages widget arrangement, preferences, and real-time data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Widget types
export type WidgetType =
  | 'metrics'
  | 'sparkline'
  | 'stats-comparison'
  | 'activity-timeline'
  | 'system-health'
  | 'uptime-status'
  | 'scheduled-posts'
  | 'performance-heatmap'
  | 'quick-stats'
  | 'top-content'
  | 'notifications';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  gridArea?: string;
  width: 1 | 2 | 3 | 4; // Grid columns (out of 4)
  height: 1 | 2 | 3; // Grid rows
  visible: boolean;
  order: number;
  settings?: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault?: boolean;
}

// Real-time data types
export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: number;
}

export interface UptimeStatus {
  status: 'operational' | 'degraded' | 'down';
  uptime: number; // percentage
  lastIncident?: string;
  responseTime: number; // ms
}

export interface ScheduledPost {
  id: string;
  title: string;
  scheduledDate: string;
  author: string;
  status: 'scheduled' | 'draft' | 'pending-review';
  category?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'post' | 'comment' | 'user' | 'plugin' | 'media' | 'setting';
  action: 'create' | 'update' | 'delete' | 'publish' | 'login' | 'logout';
  title: string;
  description?: string;
  user: string;
  userAvatar?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
}

interface DashboardState {
  // Layout management
  layouts: DashboardLayout[];
  activeLayoutId: string;
  isEditMode: boolean;

  // Real-time data
  systemMetrics: SystemMetrics[];
  uptimeStatus: UptimeStatus;
  scheduledPosts: ScheduledPost[];
  activityEvents: ActivityEvent[];
  heatmapData: HeatmapData[];

  // Sparkline data
  sparklineData: Record<string, number[]>;

  // Stats comparison
  statsComparison: {
    thisWeek: Record<string, number>;
    lastWeek: Record<string, number>;
  };

  // Actions
  setActiveLayout: (layoutId: string) => void;
  updateWidgetConfig: (widgetId: string, config: Partial<WidgetConfig>) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  toggleWidget: (widgetId: string) => void;
  addWidget: (widget: WidgetConfig) => void;
  removeWidget: (widgetId: string) => void;
  setEditMode: (isEdit: boolean) => void;
  saveLayout: (layout: DashboardLayout) => void;
  deleteLayout: (layoutId: string) => void;
  resetToDefault: () => void;

  // Data updates
  updateSystemMetrics: (metrics: SystemMetrics) => void;
  updateUptimeStatus: (status: UptimeStatus) => void;
  setScheduledPosts: (posts: ScheduledPost[]) => void;
  addActivityEvent: (event: ActivityEvent) => void;
  setHeatmapData: (data: HeatmapData[]) => void;
  updateSparklineData: (key: string, data: number[]) => void;
  updateStatsComparison: (thisWeek: Record<string, number>, lastWeek: Record<string, number>) => void;
}

// Default widget configuration
const defaultWidgets: WidgetConfig[] = [
  { id: 'quick-stats', type: 'quick-stats', title: 'Quick Stats', width: 4, height: 1, visible: true, order: 0 },
  { id: 'sparkline-views', type: 'sparkline', title: 'Page Views', width: 1, height: 1, visible: true, order: 1 },
  { id: 'sparkline-visitors', type: 'sparkline', title: 'Visitors', width: 1, height: 1, visible: true, order: 2 },
  { id: 'sparkline-comments', type: 'sparkline', title: 'Comments', width: 1, height: 1, visible: true, order: 3 },
  { id: 'sparkline-posts', type: 'sparkline', title: 'New Posts', width: 1, height: 1, visible: true, order: 4 },
  { id: 'stats-comparison', type: 'stats-comparison', title: 'This Week vs Last Week', width: 2, height: 2, visible: true, order: 5 },
  { id: 'activity-timeline', type: 'activity-timeline', title: 'Activity Timeline', width: 2, height: 2, visible: true, order: 6 },
  { id: 'system-health', type: 'system-health', title: 'System Health', width: 2, height: 1, visible: true, order: 7 },
  { id: 'uptime-status', type: 'uptime-status', title: 'Uptime Status', width: 2, height: 1, visible: true, order: 8 },
  { id: 'scheduled-posts', type: 'scheduled-posts', title: 'Scheduled Posts', width: 2, height: 2, visible: true, order: 9 },
  { id: 'performance-heatmap', type: 'performance-heatmap', title: 'Best Posting Times', width: 2, height: 2, visible: true, order: 10 },
];

const defaultLayout: DashboardLayout = {
  id: 'default',
  name: 'Default Layout',
  widgets: defaultWidgets,
  isDefault: true,
};

// Sample data generators
const generateSampleMetrics = (): SystemMetrics => ({
  cpu: Math.floor(Math.random() * 40) + 20,
  memory: Math.floor(Math.random() * 30) + 50,
  disk: Math.floor(Math.random() * 20) + 60,
  network: Math.floor(Math.random() * 100),
  timestamp: Date.now(),
});

const generateSampleSparkline = (): number[] => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 100) + 50);
};

const sampleUptimeStatus: UptimeStatus = {
  status: 'operational',
  uptime: 99.98,
  responseTime: 142,
  lastIncident: '3 days ago',
};

const sampleScheduledPosts: ScheduledPost[] = [
  { id: '1', title: 'Getting Started with Rust', scheduledDate: '2025-12-28T10:00:00Z', author: 'John', status: 'scheduled', category: 'Tutorial' },
  { id: '2', title: 'Performance Optimization Tips', scheduledDate: '2025-12-29T14:00:00Z', author: 'Jane', status: 'scheduled', category: 'Guide' },
  { id: '3', title: 'New Feature Announcement', scheduledDate: '2025-12-30T09:00:00Z', author: 'Admin', status: 'pending-review', category: 'News' },
  { id: '4', title: 'Year in Review 2025', scheduledDate: '2025-12-31T18:00:00Z', author: 'Team', status: 'draft', category: 'Blog' },
];

const sampleActivityEvents: ActivityEvent[] = [
  { id: '1', type: 'post', action: 'publish', title: 'Published "Introduction to RustPress"', user: 'John Developer', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', type: 'comment', action: 'create', title: 'New comment on "Getting Started"', user: 'Jane User', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: '3', type: 'user', action: 'login', title: 'User login', user: 'Admin', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '4', type: 'plugin', action: 'update', title: 'Updated SEO plugin to v2.0', user: 'System', timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: '5', type: 'media', action: 'create', title: 'Uploaded 5 new images', user: 'Jane User', timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
];

const generateHeatmapData = (): HeatmapData[] => {
  const data: HeatmapData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Simulate higher engagement during business hours on weekdays
      let baseValue = Math.random() * 30;
      if (day < 5 && hour >= 9 && hour <= 17) {
        baseValue += 50 + Math.random() * 20;
      }
      if (hour >= 12 && hour <= 14) {
        baseValue += 20;
      }
      data.push({ day, hour, value: Math.floor(baseValue) });
    }
  }
  return data;
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      layouts: [defaultLayout],
      activeLayoutId: 'default',
      isEditMode: false,
      systemMetrics: [generateSampleMetrics()],
      uptimeStatus: sampleUptimeStatus,
      scheduledPosts: sampleScheduledPosts,
      activityEvents: sampleActivityEvents,
      heatmapData: generateHeatmapData(),
      sparklineData: {
        views: generateSampleSparkline(),
        visitors: generateSampleSparkline(),
        comments: generateSampleSparkline(),
        posts: generateSampleSparkline(),
      },
      statsComparison: {
        thisWeek: { views: 12453, visitors: 3421, comments: 89, posts: 12 },
        lastWeek: { views: 10234, visitors: 2987, comments: 76, posts: 8 },
      },

      // Layout actions
      setActiveLayout: (layoutId) => set({ activeLayoutId: layoutId }),

      updateWidgetConfig: (widgetId, config) =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === state.activeLayoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map((widget) =>
                    widget.id === widgetId ? { ...widget, ...config } : widget
                  ),
                }
              : layout
          ),
        })),

      reorderWidgets: (widgetIds) =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === state.activeLayoutId
              ? {
                  ...layout,
                  widgets: widgetIds.map((id, index) => {
                    const widget = layout.widgets.find((w) => w.id === id);
                    return widget ? { ...widget, order: index } : null;
                  }).filter(Boolean) as WidgetConfig[],
                }
              : layout
          ),
        })),

      toggleWidget: (widgetId) =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === state.activeLayoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map((widget) =>
                    widget.id === widgetId
                      ? { ...widget, visible: !widget.visible }
                      : widget
                  ),
                }
              : layout
          ),
        })),

      addWidget: (widget) =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === state.activeLayoutId
              ? { ...layout, widgets: [...layout.widgets, widget] }
              : layout
          ),
        })),

      removeWidget: (widgetId) =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === state.activeLayoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.filter((w) => w.id !== widgetId),
                }
              : layout
          ),
        })),

      setEditMode: (isEdit) => set({ isEditMode: isEdit }),

      saveLayout: (layout) =>
        set((state) => ({
          layouts: state.layouts.some((l) => l.id === layout.id)
            ? state.layouts.map((l) => (l.id === layout.id ? layout : l))
            : [...state.layouts, layout],
        })),

      deleteLayout: (layoutId) =>
        set((state) => ({
          layouts: state.layouts.filter((l) => l.id !== layoutId),
          activeLayoutId:
            state.activeLayoutId === layoutId ? 'default' : state.activeLayoutId,
        })),

      resetToDefault: () =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === state.activeLayoutId
              ? { ...layout, widgets: defaultWidgets }
              : layout
          ),
        })),

      // Data update actions
      updateSystemMetrics: (metrics) =>
        set((state) => ({
          systemMetrics: [...state.systemMetrics.slice(-59), metrics],
        })),

      updateUptimeStatus: (status) => set({ uptimeStatus: status }),

      setScheduledPosts: (posts) => set({ scheduledPosts: posts }),

      addActivityEvent: (event) =>
        set((state) => ({
          activityEvents: [event, ...state.activityEvents].slice(0, 50),
        })),

      setHeatmapData: (data) => set({ heatmapData: data }),

      updateSparklineData: (key, data) =>
        set((state) => ({
          sparklineData: { ...state.sparklineData, [key]: data },
        })),

      updateStatsComparison: (thisWeek, lastWeek) =>
        set({ statsComparison: { thisWeek, lastWeek } }),
    }),
    {
      name: 'rustpress-dashboard',
      partialize: (state) => ({
        layouts: state.layouts,
        activeLayoutId: state.activeLayoutId,
      }),
    }
  )
);

// Selector hooks for specific data
export const useActiveLayout = () => {
  const { layouts, activeLayoutId } = useDashboardStore();
  return layouts.find((l) => l.id === activeLayoutId) || layouts[0];
};

export const useVisibleWidgets = () => {
  const layout = useActiveLayout();
  return layout.widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);
};

export default useDashboardStore;
