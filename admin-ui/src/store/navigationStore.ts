/**
 * RustPress Navigation Store
 * Manages recently visited pages, favorites, sidebar state, and keyboard shortcuts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavigationPage {
  path: string;
  label: string;
  icon?: string;
  timestamp?: number;
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

interface NavigationState {
  // Recently visited
  recentlyVisited: NavigationPage[];
  maxRecentItems: number;
  addRecentPage: (page: NavigationPage) => void;
  clearRecentPages: () => void;

  // Favorites
  favorites: NavigationPage[];
  addFavorite: (page: NavigationPage) => void;
  removeFavorite: (path: string) => void;
  isFavorite: (path: string) => boolean;
  toggleFavorite: (page: NavigationPage) => void;

  // Sidebar collapse state per group
  collapsedGroups: Record<string, boolean>;
  setGroupCollapsed: (groupId: string, collapsed: boolean) => void;
  toggleGroupCollapsed: (groupId: string) => void;
  isGroupCollapsed: (groupId: string) => boolean;

  // Command palette
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Keyboard shortcuts panel
  isShortcutsPanelOpen: boolean;
  openShortcutsPanel: () => void;
  closeShortcutsPanel: () => void;
  toggleShortcutsPanel: () => void;

  // Quick actions
  isQuickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;

  // Sidebar search
  sidebarSearchQuery: string;
  setSidebarSearchQuery: (query: string) => void;
}

// Default keyboard shortcuts
export const defaultKeyboardShortcuts: KeyboardShortcut[] = [
  // Navigation
  { id: 'cmd-palette', keys: ['Cmd', 'K'], description: 'Open command palette', category: 'Navigation' },
  { id: 'shortcuts', keys: ['?'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { id: 'go-dashboard', keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { id: 'go-posts', keys: ['G', 'P'], description: 'Go to Posts', category: 'Navigation' },
  { id: 'go-media', keys: ['G', 'M'], description: 'Go to Media', category: 'Navigation' },
  { id: 'go-settings', keys: ['G', 'S'], description: 'Go to Settings', category: 'Navigation' },

  // Actions
  { id: 'new-post', keys: ['N', 'P'], description: 'Create new post', category: 'Actions' },
  { id: 'new-page', keys: ['N', 'A'], description: 'Create new page', category: 'Actions' },
  { id: 'save', keys: ['Cmd', 'S'], description: 'Save changes', category: 'Actions' },
  { id: 'search', keys: ['Cmd', 'F'], description: 'Focus search', category: 'Actions' },

  // Interface
  { id: 'toggle-sidebar', keys: ['Cmd', 'B'], description: 'Toggle sidebar', category: 'Interface' },
  { id: 'toggle-theme', keys: ['Cmd', 'Shift', 'T'], description: 'Toggle dark mode', category: 'Interface' },
  { id: 'escape', keys: ['Esc'], description: 'Close modal/panel', category: 'Interface' },

  // Editor
  { id: 'bold', keys: ['Cmd', 'B'], description: 'Bold text', category: 'Editor' },
  { id: 'italic', keys: ['Cmd', 'I'], description: 'Italic text', category: 'Editor' },
  { id: 'link', keys: ['Cmd', 'K'], description: 'Insert link', category: 'Editor' },
  { id: 'undo', keys: ['Cmd', 'Z'], description: 'Undo', category: 'Editor' },
  { id: 'redo', keys: ['Cmd', 'Shift', 'Z'], description: 'Redo', category: 'Editor' },
];

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Recently visited
      recentlyVisited: [],
      maxRecentItems: 10,

      addRecentPage: (page) => {
        set((state) => {
          const filtered = state.recentlyVisited.filter((p) => p.path !== page.path);
          const newPage = { ...page, timestamp: Date.now() };
          const updated = [newPage, ...filtered].slice(0, state.maxRecentItems);
          return { recentlyVisited: updated };
        });
      },

      clearRecentPages: () => set({ recentlyVisited: [] }),

      // Favorites
      favorites: [],

      addFavorite: (page) => {
        set((state) => {
          if (state.favorites.some((f) => f.path === page.path)) {
            return state;
          }
          return { favorites: [...state.favorites, page] };
        });
      },

      removeFavorite: (path) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.path !== path),
        }));
      },

      isFavorite: (path) => {
        return get().favorites.some((f) => f.path === path);
      },

      toggleFavorite: (page) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(page.path)) {
          removeFavorite(page.path);
        } else {
          addFavorite(page);
        }
      },

      // Sidebar collapse state
      collapsedGroups: {},

      setGroupCollapsed: (groupId, collapsed) => {
        set((state) => ({
          collapsedGroups: { ...state.collapsedGroups, [groupId]: collapsed },
        }));
      },

      toggleGroupCollapsed: (groupId) => {
        set((state) => ({
          collapsedGroups: {
            ...state.collapsedGroups,
            [groupId]: !state.collapsedGroups[groupId],
          },
        }));
      },

      isGroupCollapsed: (groupId) => {
        return get().collapsedGroups[groupId] ?? false;
      },

      // Command palette
      isCommandPaletteOpen: false,
      openCommandPalette: () => set({ isCommandPaletteOpen: true }),
      closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
      toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

      // Keyboard shortcuts panel
      isShortcutsPanelOpen: false,
      openShortcutsPanel: () => set({ isShortcutsPanelOpen: true }),
      closeShortcutsPanel: () => set({ isShortcutsPanelOpen: false }),
      toggleShortcutsPanel: () => set((state) => ({ isShortcutsPanelOpen: !state.isShortcutsPanelOpen })),

      // Quick actions
      isQuickActionsOpen: false,
      setQuickActionsOpen: (open) => set({ isQuickActionsOpen: open }),

      // Sidebar search
      sidebarSearchQuery: '',
      setSidebarSearchQuery: (query) => set({ sidebarSearchQuery: query }),
    }),
    {
      name: 'rustpress-navigation',
      partialize: (state) => ({
        recentlyVisited: state.recentlyVisited,
        favorites: state.favorites,
        collapsedGroups: state.collapsedGroups,
      }),
    }
  )
);
