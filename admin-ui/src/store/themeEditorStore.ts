/**
 * Theme Editor Store
 * Manages theme state from theme.json and persists changes
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeData, ThemeManifest, ThemeAsset, ThemeTemplate, ThemePartial } from '../services/themeService';
import { getEmbeddedThemeData } from '../data/embeddedThemeData';

// ============================================
// TYPES
// ============================================

export interface ThemeEditorState {
  // Current theme data loaded from filesystem
  currentTheme: ThemeData | null;
  isLoading: boolean;
  error: string | null;

  // Unsaved changes tracking
  hasUnsavedChanges: boolean;
  modifiedFiles: Set<string>;

  // Staging/production mode
  editorMode: 'staging' | 'production';

  // Git state
  gitBranch: string;
  gitIsDirty: boolean;

  // History for undo/redo
  history: ThemeManifest[];
  historyIndex: number;

  // Actions
  loadTheme: (slug: string) => Promise<void>;
  loadActiveTheme: () => Promise<void>;

  // Manifest updates (colors, fonts, features, etc.)
  updateManifest: (updates: Partial<ThemeManifest>) => void;
  updateColors: (colors: Partial<ThemeManifest['colors']>) => void;
  updateFonts: (fonts: Partial<ThemeManifest['fonts']>) => void;
  updateFeatures: (features: Partial<ThemeManifest['features']>) => void;
  updateAnimations: (animations: Partial<ThemeManifest['animations']>) => void;

  // Asset updates
  updateAsset: (path: string, content: string) => void;

  // Template updates
  updateTemplate: (id: string, content: string) => void;
  updatePartial: (id: string, content: string) => void;
  updateLayout: (id: string, content: string) => void;

  // Persistence
  saveChanges: () => Promise<boolean>;
  discardChanges: () => void;

  // Git operations
  commitChanges: (message: string) => Promise<boolean>;
  pushChanges: () => Promise<boolean>;
  pullChanges: () => Promise<boolean>;
  switchBranch: (branch: string) => Promise<boolean>;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Mode
  setEditorMode: (mode: 'staging' | 'production') => void;
}

// ============================================
// API CALLS (would connect to Rust backend)
// ============================================

const API_BASE = '/api/v1';

async function fetchTheme(slug: string): Promise<ThemeData> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('API not available, using localStorage fallback');
  }

  // Fallback to localStorage
  return getThemeFromLocalStorage(slug);
}

async function fetchActiveTheme(): Promise<ThemeData> {
  try {
    const response = await fetch(`${API_BASE}/themes/active`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('API not available, using localStorage fallback');
  }

  // Fallback - get active theme from localStorage
  const activeSlug = localStorage.getItem('rustpress_active_theme') || 'rustpress-enterprise';
  return getThemeFromLocalStorage(activeSlug);
}

async function saveThemeToBackend(theme: ThemeData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${theme.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.log('API not available, saving to localStorage');
  }

  // Fallback to localStorage
  saveThemeToLocalStorage(theme);
  return true;
}

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

function getThemeFromLocalStorage(slug: string): ThemeData {
  // First get the embedded theme data as base
  const embeddedTheme = getEmbeddedThemeData(slug);

  // Check if there are modifications in localStorage
  const storedModifications = localStorage.getItem(`rustpress_theme_modifications_${slug}`);
  if (storedModifications) {
    try {
      const modifications = JSON.parse(storedModifications);
      // Merge modifications with embedded theme
      return mergeThemeModifications(embeddedTheme, modifications);
    } catch (e) {
      console.error('Failed to parse theme modifications:', e);
    }
  }

  return embeddedTheme;
}

function mergeThemeModifications(base: ThemeData, mods: Partial<ThemeData>): ThemeData {
  return {
    ...base,
    manifest: mods.manifest ? { ...base.manifest, ...mods.manifest } : base.manifest,
    assets: mods.assets ? {
      css: mods.assets.css || base.assets.css,
      js: mods.assets.js || base.assets.js,
    } : base.assets,
    templates: mods.templates || base.templates,
    partials: mods.partials || base.partials,
    layouts: mods.layouts || base.layouts,
    gitInfo: mods.gitInfo || base.gitInfo,
  };
}

function saveThemeToLocalStorage(theme: ThemeData): void {
  // Save only the modifications, not the full theme
  localStorage.setItem(`rustpress_theme_modifications_${theme.slug}`, JSON.stringify({
    manifest: theme.manifest,
    assets: theme.assets,
    templates: theme.templates,
    partials: theme.partials,
    layouts: theme.layouts,
    gitInfo: theme.gitInfo,
  }));
  localStorage.setItem(`rustpress_theme_data_${theme.slug}_lastSaved`, new Date().toISOString());
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useThemeEditorStore = create<ThemeEditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTheme: null,
      isLoading: false,
      error: null,
      hasUnsavedChanges: false,
      modifiedFiles: new Set(),
      editorMode: 'staging',
      gitBranch: 'main',
      gitIsDirty: false,
      history: [],
      historyIndex: -1,

      // Load theme by slug
      loadTheme: async (slug: string) => {
        set({ isLoading: true, error: null });
        try {
          const theme = await fetchTheme(slug);
          set({
            currentTheme: theme,
            isLoading: false,
            history: [theme.manifest],
            historyIndex: 0,
            gitBranch: theme.gitInfo?.branch || 'main',
            gitIsDirty: theme.gitInfo?.isDirty || false,
          });
        } catch (error) {
          set({ error: String(error), isLoading: false });
        }
      },

      // Load active theme
      loadActiveTheme: async () => {
        set({ isLoading: true, error: null });
        try {
          const theme = await fetchActiveTheme();
          set({
            currentTheme: theme,
            isLoading: false,
            history: [theme.manifest],
            historyIndex: 0,
            gitBranch: theme.gitInfo?.branch || 'main',
            gitIsDirty: theme.gitInfo?.isDirty || false,
          });
        } catch (error) {
          set({ error: String(error), isLoading: false });
        }
      },

      // Update manifest
      updateManifest: (updates: Partial<ThemeManifest>) => {
        const { currentTheme, history, historyIndex } = get();
        if (!currentTheme) return;

        const newManifest = { ...currentTheme.manifest, ...updates };
        const newTheme = { ...currentTheme, manifest: newManifest };

        // Add to history (truncate any redo history)
        const newHistory = [...history.slice(0, historyIndex + 1), newManifest];

        set({
          currentTheme: newTheme,
          hasUnsavedChanges: true,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          gitIsDirty: true,
        });
      },

      // Update colors
      updateColors: (colors: Partial<ThemeManifest['colors']>) => {
        const { currentTheme } = get();
        if (!currentTheme) return;

        get().updateManifest({
          colors: { ...currentTheme.manifest.colors, ...colors },
        });
      },

      // Update fonts
      updateFonts: (fonts: Partial<ThemeManifest['fonts']>) => {
        const { currentTheme } = get();
        if (!currentTheme) return;

        get().updateManifest({
          fonts: { ...currentTheme.manifest.fonts, ...fonts },
        });
      },

      // Update features
      updateFeatures: (features: Partial<ThemeManifest['features']>) => {
        const { currentTheme } = get();
        if (!currentTheme) return;

        get().updateManifest({
          features: { ...currentTheme.manifest.features, ...features },
        });
      },

      // Update animations
      updateAnimations: (animations: Partial<ThemeManifest['animations']>) => {
        const { currentTheme } = get();
        if (!currentTheme) return;

        get().updateManifest({
          animations: { ...currentTheme.manifest.animations, ...animations },
        });
      },

      // Update asset
      updateAsset: (path: string, content: string) => {
        const { currentTheme, modifiedFiles } = get();
        if (!currentTheme) return;

        const newAssets = { ...currentTheme.assets };
        const cssIndex = newAssets.css.findIndex((a) => a.path === path);
        if (cssIndex >= 0) {
          newAssets.css = [...newAssets.css];
          newAssets.css[cssIndex] = { ...newAssets.css[cssIndex], content, isModified: true };
        }

        const jsIndex = newAssets.js.findIndex((a) => a.path === path);
        if (jsIndex >= 0) {
          newAssets.js = [...newAssets.js];
          newAssets.js[jsIndex] = { ...newAssets.js[jsIndex], content, isModified: true };
        }

        const newModified = new Set(modifiedFiles);
        newModified.add(path);

        set({
          currentTheme: { ...currentTheme, assets: newAssets },
          hasUnsavedChanges: true,
          modifiedFiles: newModified,
          gitIsDirty: true,
        });
      },

      // Update template
      updateTemplate: (id: string, content: string) => {
        const { currentTheme, modifiedFiles } = get();
        if (!currentTheme) return;

        const newTemplates = currentTheme.templates.map((t) =>
          t.id === id ? { ...t, content, isModified: true } : t
        );

        const newModified = new Set(modifiedFiles);
        newModified.add(`templates/${id}.html`);

        set({
          currentTheme: { ...currentTheme, templates: newTemplates },
          hasUnsavedChanges: true,
          modifiedFiles: newModified,
          gitIsDirty: true,
        });
      },

      // Update partial
      updatePartial: (id: string, content: string) => {
        const { currentTheme, modifiedFiles } = get();
        if (!currentTheme) return;

        const newPartials = currentTheme.partials.map((p) =>
          p.id === id ? { ...p, content, isModified: true } : p
        );

        const newModified = new Set(modifiedFiles);
        newModified.add(`partials/${id}.html`);

        set({
          currentTheme: { ...currentTheme, partials: newPartials },
          hasUnsavedChanges: true,
          modifiedFiles: newModified,
          gitIsDirty: true,
        });
      },

      // Update layout
      updateLayout: (id: string, content: string) => {
        const { currentTheme, modifiedFiles } = get();
        if (!currentTheme) return;

        const newLayouts = currentTheme.layouts.map((l) =>
          l.id === id ? { ...l, content, isModified: true } : l
        );

        const newModified = new Set(modifiedFiles);
        newModified.add(`layouts/${id}.html`);

        set({
          currentTheme: { ...currentTheme, layouts: newLayouts },
          hasUnsavedChanges: true,
          modifiedFiles: newModified,
          gitIsDirty: true,
        });
      },

      // Save changes
      saveChanges: async () => {
        const { currentTheme } = get();
        if (!currentTheme) return false;

        try {
          const success = await saveThemeToBackend(currentTheme);
          if (success) {
            // Reset modified flags
            const resetTheme = {
              ...currentTheme,
              assets: {
                css: currentTheme.assets.css.map((a) => ({ ...a, isModified: false })),
                js: currentTheme.assets.js.map((a) => ({ ...a, isModified: false })),
              },
              templates: currentTheme.templates.map((t) => ({ ...t, isModified: false })),
              partials: currentTheme.partials.map((p) => ({ ...p, isModified: false })),
              layouts: currentTheme.layouts.map((l) => ({ ...l, isModified: false })),
              lastModified: new Date().toISOString(),
            };

            set({
              currentTheme: resetTheme,
              hasUnsavedChanges: false,
              modifiedFiles: new Set(),
            });
          }
          return success;
        } catch (error) {
          set({ error: String(error) });
          return false;
        }
      },

      // Discard changes
      discardChanges: () => {
        const { history } = get();
        if (history.length > 0) {
          const originalManifest = history[0];
          const { currentTheme } = get();
          if (currentTheme) {
            set({
              currentTheme: { ...currentTheme, manifest: originalManifest },
              hasUnsavedChanges: false,
              modifiedFiles: new Set(),
              historyIndex: 0,
            });
          }
        }
      },

      // Git operations
      commitChanges: async (message: string) => {
        const { currentTheme } = get();
        if (!currentTheme) return false;

        try {
          const response = await fetch(`${API_BASE}/themes/${currentTheme.slug}/commit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
          });

          if (response.ok) {
            set({ gitIsDirty: false });
            return true;
          }
        } catch (error) {
          console.log('Git commit not available via API');
        }

        // Simulate commit in localStorage
        const commits = JSON.parse(localStorage.getItem(`rustpress_commits_${currentTheme.slug}`) || '[]');
        commits.push({
          message,
          timestamp: new Date().toISOString(),
          hash: Math.random().toString(36).substring(7),
        });
        localStorage.setItem(`rustpress_commits_${currentTheme.slug}`, JSON.stringify(commits));
        set({ gitIsDirty: false });
        return true;
      },

      pushChanges: async () => {
        // Would call API
        return true;
      },

      pullChanges: async () => {
        const slug = get().currentTheme?.slug;
        if (slug) {
          await get().loadTheme(slug);
        }
        return true;
      },

      switchBranch: async (branch: string) => {
        set({ gitBranch: branch });
        // Would reload theme from that branch
        return true;
      },

      // Undo/Redo
      undo: () => {
        const { history, historyIndex, currentTheme } = get();
        if (historyIndex > 0 && currentTheme) {
          const newIndex = historyIndex - 1;
          set({
            currentTheme: { ...currentTheme, manifest: history[newIndex] },
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      redo: () => {
        const { history, historyIndex, currentTheme } = get();
        if (historyIndex < history.length - 1 && currentTheme) {
          const newIndex = historyIndex + 1;
          set({
            currentTheme: { ...currentTheme, manifest: history[newIndex] },
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Editor mode
      setEditorMode: (mode: 'staging' | 'production') => {
        set({ editorMode: mode });
      },
    }),
    {
      name: 'rustpress-theme-editor',
      partialize: (state) => ({
        // Only persist certain state
        editorMode: state.editorMode,
        gitBranch: state.gitBranch,
      }),
    }
  )
);

export default useThemeEditorStore;
