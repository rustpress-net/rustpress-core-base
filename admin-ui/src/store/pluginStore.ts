import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface InstalledPlugin {
  id: string
  name: string
  slug: string
  description: string
  version: string
  author: string
  active: boolean
  icon: string
  category: string
  isRustPlugin?: boolean
  // Settings
  showInMenu: boolean
  menuLabel?: string
  menuHref?: string
  settings: Record<string, unknown>
  installedAt: string
  updatedAt: string
}

interface PluginState {
  installedPlugins: InstalledPlugin[]

  // Plugin management
  installPlugin: (plugin: Omit<InstalledPlugin, 'installedAt' | 'updatedAt' | 'showInMenu' | 'settings'>) => void
  uninstallPlugin: (id: string) => void
  activatePlugin: (id: string) => void
  deactivatePlugin: (id: string) => void
  updatePluginSettings: (id: string, settings: Partial<InstalledPlugin>) => void

  // Menu visibility
  setShowInMenu: (id: string, show: boolean) => void
  setMenuLabel: (id: string, label: string) => void

  // Getters
  getActivePlugins: () => InstalledPlugin[]
  getPluginsForMenu: () => InstalledPlugin[]
  getPluginById: (id: string) => InstalledPlugin | undefined
}

// Default installed plugins (for demo)
const defaultPlugins: InstalledPlugin[] = [
  {
    id: 'rust-users',
    name: 'RustUsers',
    slug: 'rust-users',
    description: 'Advanced user management with roles, permissions, and activity tracking',
    version: '1.0.0',
    author: 'RustPress Team',
    active: true,
    icon: 'Users',
    category: 'utility',
    isRustPlugin: true,
    showInMenu: true,
    menuLabel: 'RustUsers',
    menuHref: '/plugins/rust-users',
    settings: {},
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rust-analytics',
    name: 'RustAnalytics',
    slug: 'rust-analytics',
    description: 'Comprehensive analytics and insights for your site',
    version: '1.0.0',
    author: 'RustPress Team',
    active: true,
    icon: 'BarChart',
    category: 'analytics',
    isRustPlugin: true,
    showInMenu: true,
    menuLabel: 'RustAnalytics',
    menuHref: '/plugins/rust-analytics',
    settings: {},
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rust-multilang',
    name: 'RustMultilang',
    slug: 'rust-multilang',
    description: 'Multi-language support with translation management',
    version: '1.0.0',
    author: 'RustPress Team',
    active: true,
    icon: 'Globe',
    category: 'content',
    isRustPlugin: true,
    showInMenu: true,
    menuLabel: 'RustMultilang',
    menuHref: '/plugins/rust-multilang',
    settings: {},
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rust-commerce',
    name: 'RustCommerce',
    slug: 'rust-commerce',
    description: 'E-commerce functionality with products, orders, and payments',
    version: '1.0.0',
    author: 'RustPress Team',
    active: true,
    icon: 'ShoppingCart',
    category: 'ecommerce',
    isRustPlugin: true,
    showInMenu: true,
    menuLabel: 'RustCommerce',
    menuHref: '/plugins/rust-commerce',
    settings: {},
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    slug: 'seo-optimizer',
    description: 'Optimize your site for search engines',
    version: '2.1.0',
    author: 'SEO Masters',
    active: true,
    icon: 'Search',
    category: 'seo',
    isRustPlugin: false,
    showInMenu: false,
    menuLabel: 'SEO Optimizer',
    menuHref: '/plugins/seo-optimizer',
    settings: {},
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contact-form-pro',
    name: 'Contact Form Pro',
    slug: 'contact-form-pro',
    description: 'Advanced contact forms with drag & drop builder',
    version: '3.0.2',
    author: 'FormBuilders Inc',
    active: true,
    icon: 'Mail',
    category: 'forms',
    isRustPlugin: false,
    showInMenu: false,
    menuLabel: 'Contact Forms',
    menuHref: '/plugins/contact-form-pro',
    settings: {},
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const usePluginStore = create<PluginState>()(
  persist(
    (set, get) => ({
      installedPlugins: defaultPlugins,

      installPlugin: (plugin) => {
        const newPlugin: InstalledPlugin = {
          ...plugin,
          showInMenu: false,
          settings: {},
          installedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          installedPlugins: [...state.installedPlugins, newPlugin],
        }))
      },

      uninstallPlugin: (id) => {
        set((state) => ({
          installedPlugins: state.installedPlugins.filter((p) => p.id !== id),
        }))
      },

      activatePlugin: (id) => {
        set((state) => ({
          installedPlugins: state.installedPlugins.map((p) =>
            p.id === id ? { ...p, active: true, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deactivatePlugin: (id) => {
        set((state) => ({
          installedPlugins: state.installedPlugins.map((p) =>
            p.id === id ? { ...p, active: false, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      updatePluginSettings: (id, settings) => {
        set((state) => ({
          installedPlugins: state.installedPlugins.map((p) =>
            p.id === id ? { ...p, ...settings, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      setShowInMenu: (id, show) => {
        set((state) => ({
          installedPlugins: state.installedPlugins.map((p) =>
            p.id === id ? { ...p, showInMenu: show, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      setMenuLabel: (id, label) => {
        set((state) => ({
          installedPlugins: state.installedPlugins.map((p) =>
            p.id === id ? { ...p, menuLabel: label, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      getActivePlugins: () => {
        return get().installedPlugins.filter((p) => p.active)
      },

      getPluginsForMenu: () => {
        return get().installedPlugins.filter((p) => p.active && p.showInMenu)
      },

      getPluginById: (id) => {
        return get().installedPlugins.find((p) => p.id === id)
      },
    }),
    {
      name: 'rustpress-plugins',
    }
  )
)
