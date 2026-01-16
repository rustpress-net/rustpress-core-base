import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  App,
  InstalledApp,
  AppConfig,
  UserAppAccess,
  AppStoreFilters,
  AppCategory,
  AppUsageStats,
  AppNotification
} from '../types/app';

interface AppState {
  // Installed apps
  installedApps: InstalledApp[];
  activeApp: InstalledApp | null;
  launchedAppId: string | null;

  // User app access
  userAppAccess: Record<string, UserAppAccess>;
  defaultAppId: string | null;

  // Store
  availableApps: App[];
  storeFilters: AppStoreFilters;
  isLoadingStore: boolean;

  // Configs
  appConfigs: Record<string, AppConfig>;

  // Stats
  appStats: Record<string, AppUsageStats>;

  // Notifications
  notifications: AppNotification[];

  // Actions - Installation
  installApp: (app: App, license?: string) => void;
  uninstallApp: (appId: string) => void;
  activateApp: (appId: string) => void;
  deactivateApp: (appId: string) => void;

  // Actions - Launching
  launchApp: (appId: string) => void;
  closeLaunchedApp: () => void;
  setActiveApp: (app: InstalledApp | null) => void;

  // Actions - User Access
  setUserAccess: (userId: string, access: UserAppAccess) => void;
  removeUserAccess: (userId: string) => void;
  getUserApps: (userId: string) => InstalledApp[];
  setDefaultApp: (appId: string | null) => void;

  // Actions - Config
  updateAppConfig: (appId: string, config: Partial<AppConfig>) => void;
  getAppConfig: (appId: string) => AppConfig | undefined;

  // Actions - Store
  setAvailableApps: (apps: App[]) => void;
  setStoreFilters: (filters: AppStoreFilters) => void;
  setLoadingStore: (loading: boolean) => void;

  // Actions - Stats
  recordAppLaunch: (appId: string, userId: string) => void;
  getAppStats: (appId: string) => AppUsageStats | undefined;

  // Actions - Notifications
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Getters
  getInstalledApp: (appId: string) => InstalledApp | undefined;
  getActiveApps: () => InstalledApp[];
  getAppsByCategory: (category: AppCategory) => InstalledApp[];
  hasAccess: (userId: string, appId: string) => boolean;
}

// Default installed apps (demo)
const defaultApps: InstalledApp[] = [
  {
    id: 'inventory-manager',
    name: 'Inventory Manager',
    slug: 'inventory-manager',
    description: 'Complete inventory management system with stock tracking, barcode scanning, and automated reorder points.',
    shortDescription: 'Track and manage your inventory',
    version: '2.1.0',
    author: 'RustPress Team',
    icon: 'Package',
    category: 'productivity',
    tags: ['inventory', 'stock', 'warehouse'],
    pricing: { type: 'free' },
    status: 'active',
    installDate: new Date().toISOString(),
    installedVersion: '2.1.0',
    permissions: ['read:content', 'write:content', 'storage:files'],
    entryPoint: '/apps/inventory-manager',
    rating: 4.8,
    downloadCount: 15420,
    verified: true,
  },
  {
    id: 'customer-portal',
    name: 'Customer Portal',
    slug: 'customer-portal',
    description: 'Self-service customer portal with ticket management, knowledge base, and account management.',
    shortDescription: 'Customer self-service portal',
    version: '1.5.2',
    author: 'RustPress Team',
    icon: 'Users',
    category: 'communication',
    tags: ['customers', 'support', 'portal'],
    pricing: { type: 'membership', price: 29, currency: 'USD', billingPeriod: 'monthly' },
    status: 'active',
    installDate: new Date().toISOString(),
    installedVersion: '1.5.2',
    permissions: ['read:users', 'write:users', 'read:content'],
    entryPoint: '/apps/customer-portal',
    rating: 4.6,
    downloadCount: 8930,
    verified: true,
    license: {
      key: 'CP-DEMO-LICENSE-KEY',
      type: 'membership',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true,
    },
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Real-time analytics dashboard with customizable widgets, reports, and data visualization.',
    shortDescription: 'Real-time analytics and insights',
    version: '3.0.0',
    author: 'DataViz Labs',
    icon: 'BarChart3',
    category: 'analytics',
    tags: ['analytics', 'dashboard', 'reports'],
    pricing: { type: 'one-time', price: 149, currency: 'USD' },
    status: 'active',
    installDate: new Date().toISOString(),
    installedVersion: '3.0.0',
    permissions: ['read:users', 'read:content', 'api:external'],
    entryPoint: '/apps/analytics-dashboard',
    rating: 4.9,
    downloadCount: 23150,
    verified: true,
    featured: true,
    license: {
      key: 'AD-PERPETUAL-LICENSE',
      type: 'one-time',
      isValid: true,
    },
  },
];

// Demo available apps in store
const demoStoreApps: App[] = [
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    slug: 'project-tracker',
    description: 'Comprehensive project management with Kanban boards, Gantt charts, time tracking, and team collaboration features.',
    shortDescription: 'Complete project management',
    version: '4.2.1',
    author: 'ProductivityPro',
    icon: 'FolderKanban',
    category: 'productivity',
    tags: ['projects', 'kanban', 'gantt', 'collaboration'],
    pricing: { type: 'membership', price: 19, currency: 'USD', billingPeriod: 'monthly' },
    status: 'active',
    permissions: ['read:users', 'write:content', 'storage:files'],
    entryPoint: '/apps/project-tracker',
    rating: 4.7,
    downloadCount: 45200,
    verified: true,
    featured: true,
  },
  {
    id: 'email-campaigns',
    name: 'Email Campaigns',
    slug: 'email-campaigns',
    description: 'Create and send email campaigns with templates, automation, A/B testing, and detailed analytics.',
    shortDescription: 'Email marketing automation',
    version: '2.8.0',
    author: 'MailMaster',
    icon: 'Mail',
    category: 'communication',
    tags: ['email', 'marketing', 'automation'],
    pricing: { type: 'membership', price: 49, currency: 'USD', billingPeriod: 'monthly' },
    status: 'active',
    permissions: ['read:users', 'api:external'],
    entryPoint: '/apps/email-campaigns',
    rating: 4.5,
    downloadCount: 31800,
    verified: true,
  },
  {
    id: 'pos-system',
    name: 'POS System',
    slug: 'pos-system',
    description: 'Point of sale system with inventory sync, payment processing, receipts, and sales reporting.',
    shortDescription: 'Point of sale solution',
    version: '5.1.0',
    author: 'RetailTech',
    icon: 'CreditCard',
    category: 'ecommerce',
    tags: ['pos', 'payments', 'retail'],
    pricing: { type: 'one-time', price: 299, currency: 'USD' },
    status: 'active',
    permissions: ['read:content', 'write:content', 'api:external', 'storage:files'],
    entryPoint: '/apps/pos-system',
    rating: 4.8,
    downloadCount: 18700,
    verified: true,
  },
  {
    id: 'backup-manager',
    name: 'Backup Manager',
    slug: 'backup-manager',
    description: 'Automated backup solution with scheduled backups, cloud storage integration, and one-click restore.',
    shortDescription: 'Automated backups',
    version: '1.9.3',
    author: 'SecureData',
    icon: 'HardDrive',
    category: 'security',
    tags: ['backup', 'restore', 'cloud'],
    pricing: { type: 'free' },
    status: 'active',
    permissions: ['storage:files', 'api:external'],
    entryPoint: '/apps/backup-manager',
    rating: 4.6,
    downloadCount: 52400,
    verified: true,
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    slug: 'workflow-automation',
    description: 'Visual workflow builder with triggers, conditions, actions, and integrations to automate any process.',
    shortDescription: 'Automate your workflows',
    version: '3.4.0',
    author: 'AutomateIt',
    icon: 'Workflow',
    category: 'automation',
    tags: ['workflow', 'automation', 'triggers'],
    pricing: { type: 'membership', price: 39, currency: 'USD', billingPeriod: 'monthly' },
    status: 'active',
    permissions: ['read:users', 'read:content', 'write:content', 'api:external'],
    entryPoint: '/apps/workflow-automation',
    rating: 4.9,
    downloadCount: 28900,
    verified: true,
    featured: true,
  },
  {
    id: 'file-manager-pro',
    name: 'File Manager Pro',
    slug: 'file-manager-pro',
    description: 'Advanced file manager with cloud storage support, file sharing, version history, and collaboration.',
    shortDescription: 'Advanced file management',
    version: '2.2.1',
    author: 'FileSystems Inc',
    icon: 'FolderOpen',
    category: 'utilities',
    tags: ['files', 'storage', 'sharing'],
    pricing: { type: 'one-time', price: 79, currency: 'USD' },
    status: 'active',
    permissions: ['storage:files', 'read:users'],
    entryPoint: '/apps/file-manager-pro',
    rating: 4.4,
    downloadCount: 41200,
    verified: true,
  },
];

// Default user access (demo)
const defaultUserAccess: Record<string, UserAppAccess> = {
  'user-1': {
    userId: 'user-1',
    appIds: ['inventory-manager', 'customer-portal', 'analytics-dashboard'],
    defaultAppId: 'analytics-dashboard',
  },
  'user-2': {
    userId: 'user-2',
    appIds: ['inventory-manager'],
    defaultAppId: 'inventory-manager',
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      installedApps: defaultApps,
      activeApp: null,
      launchedAppId: null,
      userAppAccess: defaultUserAccess,
      defaultAppId: null,
      availableApps: demoStoreApps,
      storeFilters: {},
      isLoadingStore: false,
      appConfigs: {},
      appStats: {},
      notifications: [],

      // Installation
      installApp: (app, license) => {
        const installedApp: InstalledApp = {
          ...app,
          installDate: new Date().toISOString(),
          installedVersion: app.version,
          license: license
            ? {
                key: license,
                type: app.pricing.type,
                expiresAt: app.pricing.type === 'membership'
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  : undefined,
                isValid: true,
              }
            : undefined,
        };
        set((state) => ({
          installedApps: [...state.installedApps, installedApp],
        }));
        get().addNotification({
          appId: app.id,
          type: 'info',
          title: 'App Installed',
          message: `${app.name} has been installed successfully.`,
        });
      },

      uninstallApp: (appId) => {
        const app = get().getInstalledApp(appId);
        set((state) => ({
          installedApps: state.installedApps.filter((a) => a.id !== appId),
          appConfigs: Object.fromEntries(
            Object.entries(state.appConfigs).filter(([id]) => id !== appId)
          ),
        }));
        if (app) {
          get().addNotification({
            appId,
            type: 'info',
            title: 'App Uninstalled',
            message: `${app.name} has been uninstalled.`,
          });
        }
      },

      activateApp: (appId) => {
        set((state) => ({
          installedApps: state.installedApps.map((a) =>
            a.id === appId ? { ...a, status: 'active' as const } : a
          ),
        }));
      },

      deactivateApp: (appId) => {
        set((state) => ({
          installedApps: state.installedApps.map((a) =>
            a.id === appId ? { ...a, status: 'inactive' as const } : a
          ),
        }));
      },

      // Launching
      launchApp: (appId) => {
        const app = get().getInstalledApp(appId);
        if (app && app.status === 'active') {
          set({ launchedAppId: appId, activeApp: app });
          get().recordAppLaunch(appId, 'current-user');
        }
      },

      closeLaunchedApp: () => {
        set({ launchedAppId: null, activeApp: null });
      },

      setActiveApp: (app) => {
        set({ activeApp: app });
      },

      // User Access
      setUserAccess: (userId, access) => {
        set((state) => ({
          userAppAccess: {
            ...state.userAppAccess,
            [userId]: access,
          },
        }));
      },

      removeUserAccess: (userId) => {
        set((state) => {
          const { [userId]: _, ...rest } = state.userAppAccess;
          return { userAppAccess: rest };
        });
      },

      getUserApps: (userId) => {
        const access = get().userAppAccess[userId];
        if (!access) return [];
        return get().installedApps.filter(
          (app) => access.appIds.includes(app.id) && app.status === 'active'
        );
      },

      setDefaultApp: (appId) => {
        set({ defaultAppId: appId });
      },

      // Config
      updateAppConfig: (appId, config) => {
        set((state) => ({
          appConfigs: {
            ...state.appConfigs,
            [appId]: {
              ...state.appConfigs[appId],
              appId,
              settings: {},
              ...config,
            },
          },
        }));
      },

      getAppConfig: (appId) => {
        return get().appConfigs[appId];
      },

      // Store
      setAvailableApps: (apps) => {
        set({ availableApps: apps });
      },

      setStoreFilters: (filters) => {
        set({ storeFilters: filters });
      },

      setLoadingStore: (loading) => {
        set({ isLoadingStore: loading });
      },

      // Stats
      recordAppLaunch: (appId, userId) => {
        set((state) => {
          const existing = state.appStats[appId] || {
            appId,
            totalLaunches: 0,
            uniqueUsers: 0,
            dailyStats: [],
          };
          const today = new Date().toISOString().split('T')[0];
          const todayStats = existing.dailyStats?.find((s) => s.date === today);

          return {
            appStats: {
              ...state.appStats,
              [appId]: {
                ...existing,
                totalLaunches: existing.totalLaunches + 1,
                uniqueUsers: existing.uniqueUsers + (todayStats ? 0 : 1),
                lastLaunch: new Date().toISOString(),
                dailyStats: todayStats
                  ? existing.dailyStats?.map((s) =>
                      s.date === today
                        ? { ...s, launches: s.launches + 1 }
                        : s
                    )
                  : [
                      ...(existing.dailyStats || []),
                      { date: today, launches: 1, users: 1 },
                    ],
              },
            },
          };
        });
      },

      getAppStats: (appId) => {
        return get().appStats[appId];
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: AppNotification = {
          ...notification,
          id: `notif-${Date.now()}`,
          date: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Getters
      getInstalledApp: (appId) => {
        return get().installedApps.find((a) => a.id === appId);
      },

      getActiveApps: () => {
        return get().installedApps.filter((a) => a.status === 'active');
      },

      getAppsByCategory: (category) => {
        return get().installedApps.filter((a) => a.category === category);
      },

      hasAccess: (userId, appId) => {
        const access = get().userAppAccess[userId];
        return access?.appIds.includes(appId) ?? false;
      },
    }),
    {
      name: 'rustpress-apps',
    }
  )
);
