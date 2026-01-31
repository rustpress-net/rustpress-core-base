// admin-ui/src/store/pageStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { pageforgeApi, PageForgePage, PageForgeElement, PageRevision, Template, Widget } from '../api/pageforgeApi';

interface PageState {
  // Page state
  pages: PageForgePage[];
  currentPage: PageForgePage | null;
  revisions: PageRevision[];
  templates: Template[];
  widgets: Widget[];

  // UI state
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDirty: boolean;
  selectedElementId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;

  // Pagination
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };

  // History for undo/redo
  history: PageForgeElement[][];
  historyIndex: number;

  // Actions - Pages
  fetchPages: (params?: Record<string, unknown>) => Promise<void>;
  fetchPage: (id: number) => Promise<void>;
  createPage: (data: { title: string; [key: string]: unknown }) => Promise<PageForgePage>;
  updatePage: (id: number, data: Record<string, unknown>) => Promise<void>;
  savePage: () => Promise<void>;
  deletePage: (id: number) => Promise<void>;
  publishPage: (id: number) => Promise<void>;
  unpublishPage: (id: number) => Promise<void>;
  duplicatePage: (id: number) => Promise<PageForgePage>;

  // Actions - Content
  updateContent: (elements: PageForgeElement[]) => void;
  addElement: (element: PageForgeElement, parentId?: string, position?: number) => void;
  updateElement: (elementId: string, updates: Partial<PageForgeElement>) => void;
  deleteElement: (elementId: string) => void;
  moveElement: (elementId: string, targetParentId: string, position: number) => void;
  duplicateElement: (elementId: string) => void;

  // Actions - Revisions
  fetchRevisions: (pageId: number) => Promise<void>;
  restoreRevision: (pageId: number, revisionId: number) => Promise<void>;

  // Actions - Templates
  fetchTemplates: () => Promise<void>;
  applyTemplate: (templateId: number) => Promise<void>;
  saveAsTemplate: (name: string, category: string) => Promise<Template>;

  // Actions - Widgets
  fetchWidgets: () => Promise<void>;

  // Actions - UI
  setSelectedElement: (id: string | null) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setIsDirty: (dirty: boolean) => void;
  clearError: () => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
}

// Helper to find and update element in tree
const updateElementInTree = (
  elements: PageForgeElement[],
  elementId: string,
  updates: Partial<PageForgeElement>
): PageForgeElement[] => {
  return elements.map(el => {
    if (el.id === elementId) {
      return { ...el, ...updates };
    }
    if (el.children) {
      return { ...el, children: updateElementInTree(el.children, elementId, updates) };
    }
    return el;
  });
};

// Helper to delete element from tree
const deleteElementFromTree = (
  elements: PageForgeElement[],
  elementId: string
): PageForgeElement[] => {
  return elements
    .filter(el => el.id !== elementId)
    .map(el => ({
      ...el,
      children: el.children ? deleteElementFromTree(el.children, elementId) : undefined,
    }));
};

// Helper to add element to tree
const addElementToTree = (
  elements: PageForgeElement[],
  element: PageForgeElement,
  parentId?: string,
  position?: number
): PageForgeElement[] => {
  if (!parentId) {
    const pos = position ?? elements.length;
    return [...elements.slice(0, pos), element, ...elements.slice(pos)];
  }

  return elements.map(el => {
    if (el.id === parentId) {
      const children = el.children || [];
      const pos = position ?? children.length;
      return {
        ...el,
        children: [...children.slice(0, pos), element, ...children.slice(pos)],
      };
    }
    if (el.children) {
      return { ...el, children: addElementToTree(el.children, element, parentId, position) };
    }
    return el;
  });
};

export const usePageStore = create<PageState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        pages: [],
        currentPage: null,
        revisions: [],
        templates: [],
        widgets: [],
        loading: false,
        saving: false,
        error: null,
        isDirty: false,
        selectedElementId: null,
        viewport: 'desktop',
        leftPanelOpen: true,
        rightPanelOpen: true,
        pagination: { total: 0, page: 1, perPage: 20, totalPages: 0 },
        history: [],
        historyIndex: -1,

        // Page actions
        fetchPages: async (params) => {
          set({ loading: true, error: null });
          try {
            const response = await pageforgeApi.pages.list(params);
            set({
              pages: response.pages,
              pagination: {
                total: response.total,
                page: response.page,
                perPage: response.per_page,
                totalPages: response.total_pages,
              },
              loading: false,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch pages';
            set({ error: message, loading: false });
          }
        },

        fetchPage: async (id) => {
          set({ loading: true, error: null });
          try {
            const page = await pageforgeApi.pages.get(id);
            set({
              currentPage: page,
              loading: false,
              isDirty: false,
              history: [page.content?.elements || []],
              historyIndex: 0,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch page';
            set({ error: message, loading: false });
          }
        },

        createPage: async (data) => {
          set({ loading: true, error: null });
          try {
            const page = await pageforgeApi.pages.create(data);
            set(state => ({
              pages: [page, ...state.pages],
              currentPage: page,
              loading: false,
              isDirty: false,
            }));
            return page;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create page';
            set({ error: message, loading: false });
            throw err;
          }
        },

        updatePage: async (id, data) => {
          set({ saving: true, error: null });
          try {
            const page = await pageforgeApi.pages.update(id, data);
            set(state => ({
              pages: state.pages.map(p => p.id === id ? page : p),
              currentPage: state.currentPage?.id === id ? page : state.currentPage,
              saving: false,
              isDirty: false,
            }));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update page';
            set({ error: message, saving: false });
            throw err;
          }
        },

        savePage: async () => {
          const { currentPage } = get();
          if (!currentPage) return;

          set({ saving: true, error: null });
          try {
            await pageforgeApi.pages.updateContent(currentPage.id, currentPage.content);
            set({ saving: false, isDirty: false });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save page';
            set({ error: message, saving: false });
            throw err;
          }
        },

        deletePage: async (id) => {
          set({ loading: true, error: null });
          try {
            await pageforgeApi.pages.delete(id);
            set(state => ({
              pages: state.pages.filter(p => p.id !== id),
              currentPage: state.currentPage?.id === id ? null : state.currentPage,
              loading: false,
            }));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete page';
            set({ error: message, loading: false });
            throw err;
          }
        },

        publishPage: async (id) => {
          set({ saving: true, error: null });
          try {
            const page = await pageforgeApi.pages.publish(id);
            set(state => ({
              pages: state.pages.map(p => p.id === id ? page : p),
              currentPage: state.currentPage?.id === id ? page : state.currentPage,
              saving: false,
            }));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to publish page';
            set({ error: message, saving: false });
            throw err;
          }
        },

        unpublishPage: async (id) => {
          set({ saving: true, error: null });
          try {
            const page = await pageforgeApi.pages.unpublish(id);
            set(state => ({
              pages: state.pages.map(p => p.id === id ? page : p),
              currentPage: state.currentPage?.id === id ? page : state.currentPage,
              saving: false,
            }));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to unpublish page';
            set({ error: message, saving: false });
            throw err;
          }
        },

        duplicatePage: async (id) => {
          set({ loading: true, error: null });
          try {
            const page = await pageforgeApi.pages.duplicate(id);
            set(state => ({
              pages: [page, ...state.pages],
              loading: false,
            }));
            return page;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to duplicate page';
            set({ error: message, loading: false });
            throw err;
          }
        },

        // Content actions
        updateContent: (elements) => {
          set(state => {
            if (!state.currentPage) return state;
            return {
              currentPage: {
                ...state.currentPage,
                content: { elements },
              },
              isDirty: true,
            };
          });
          get().pushToHistory();
        },

        addElement: (element, parentId, position) => {
          set(state => {
            if (!state.currentPage) return state;
            const elements = state.currentPage.content?.elements || [];
            const newElements = addElementToTree(elements, element, parentId, position);
            return {
              currentPage: {
                ...state.currentPage,
                content: { elements: newElements },
              },
              isDirty: true,
            };
          });
          get().pushToHistory();
        },

        updateElement: (elementId, updates) => {
          set(state => {
            if (!state.currentPage) return state;
            const elements = state.currentPage.content?.elements || [];
            const newElements = updateElementInTree(elements, elementId, updates);
            return {
              currentPage: {
                ...state.currentPage,
                content: { elements: newElements },
              },
              isDirty: true,
            };
          });
          get().pushToHistory();
        },

        deleteElement: (elementId) => {
          set(state => {
            if (!state.currentPage) return state;
            const elements = state.currentPage.content?.elements || [];
            const newElements = deleteElementFromTree(elements, elementId);
            return {
              currentPage: {
                ...state.currentPage,
                content: { elements: newElements },
              },
              isDirty: true,
              selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
            };
          });
          get().pushToHistory();
        },

        moveElement: (elementId, targetParentId, position) => {
          set(state => {
            if (!state.currentPage) return state;
            const elements = state.currentPage.content?.elements || [];
            // Find element
            let elementToMove: PageForgeElement | null = null;
            const findElement = (els: PageForgeElement[]): boolean => {
              for (const el of els) {
                if (el.id === elementId) {
                  elementToMove = { ...el };
                  return true;
                }
                if (el.children && findElement(el.children)) return true;
              }
              return false;
            };
            findElement(elements);
            if (!elementToMove) return state;

            // Remove from current position
            let newElements = deleteElementFromTree(elements, elementId);
            // Add to new position
            newElements = addElementToTree(newElements, elementToMove, targetParentId, position);

            return {
              currentPage: {
                ...state.currentPage,
                content: { elements: newElements },
              },
              isDirty: true,
            };
          });
          get().pushToHistory();
        },

        duplicateElement: (elementId) => {
          set(state => {
            if (!state.currentPage) return state;
            const elements = state.currentPage.content?.elements || [];

            // Find element and its parent
            let elementToDuplicate: PageForgeElement | null = null;
            let parentId: string | undefined;
            let position: number = 0;

            const findElement = (els: PageForgeElement[], parent?: string): boolean => {
              for (let i = 0; i < els.length; i++) {
                if (els[i].id === elementId) {
                  elementToDuplicate = JSON.parse(JSON.stringify(els[i]));
                  parentId = parent;
                  position = i + 1;
                  return true;
                }
                if (els[i].children && findElement(els[i].children, els[i].id)) return true;
              }
              return false;
            };
            findElement(elements);

            if (!elementToDuplicate) return state;

            // Generate new IDs
            const regenerateIds = (el: PageForgeElement): PageForgeElement => ({
              ...el,
              id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              children: el.children?.map(regenerateIds),
            });

            const duplicated = regenerateIds(elementToDuplicate);
            const newElements = addElementToTree(elements, duplicated, parentId, position);

            return {
              currentPage: {
                ...state.currentPage,
                content: { elements: newElements },
              },
              isDirty: true,
            };
          });
          get().pushToHistory();
        },

        // Revision actions
        fetchRevisions: async (pageId) => {
          try {
            const revisions = await pageforgeApi.revisions.list(pageId);
            set({ revisions });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch revisions';
            set({ error: message });
          }
        },

        restoreRevision: async (pageId, revisionId) => {
          set({ loading: true, error: null });
          try {
            const page = await pageforgeApi.revisions.restore(pageId, revisionId);
            set({
              currentPage: page,
              loading: false,
              isDirty: false,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to restore revision';
            set({ error: message, loading: false });
            throw err;
          }
        },

        // Template actions
        fetchTemplates: async () => {
          try {
            const templates = await pageforgeApi.templates.list();
            set({ templates });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch templates';
            set({ error: message });
          }
        },

        applyTemplate: async (templateId) => {
          const { currentPage } = get();
          if (!currentPage) return;

          set({ loading: true, error: null });
          try {
            const page = await pageforgeApi.templates.apply(templateId, currentPage.id);
            set({
              currentPage: page,
              loading: false,
              isDirty: false,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to apply template';
            set({ error: message, loading: false });
            throw err;
          }
        },

        saveAsTemplate: async (name, category) => {
          const { currentPage } = get();
          if (!currentPage) throw new Error('No page to save as template');

          try {
            const template = await pageforgeApi.templates.create({
              name,
              category,
              content: currentPage.content,
            });
            set(state => ({ templates: [template, ...state.templates] }));
            return template;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save template';
            set({ error: message });
            throw err;
          }
        },

        // Widget actions
        fetchWidgets: async () => {
          try {
            const widgets = await pageforgeApi.widgets.list();
            set({ widgets });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch widgets';
            set({ error: message });
          }
        },

        // UI actions
        setSelectedElement: (id) => set({ selectedElementId: id }),
        setViewport: (viewport) => set({ viewport }),
        toggleLeftPanel: () => set(state => ({ leftPanelOpen: !state.leftPanelOpen })),
        toggleRightPanel: () => set(state => ({ rightPanelOpen: !state.rightPanelOpen })),
        setIsDirty: (dirty) => set({ isDirty: dirty }),
        clearError: () => set({ error: null }),

        // History actions
        undo: () => {
          set(state => {
            if (state.historyIndex <= 0 || !state.currentPage) return state;
            const newIndex = state.historyIndex - 1;
            return {
              historyIndex: newIndex,
              currentPage: {
                ...state.currentPage,
                content: { elements: state.history[newIndex] },
              },
              isDirty: true,
            };
          });
        },

        redo: () => {
          set(state => {
            if (state.historyIndex >= state.history.length - 1 || !state.currentPage) return state;
            const newIndex = state.historyIndex + 1;
            return {
              historyIndex: newIndex,
              currentPage: {
                ...state.currentPage,
                content: { elements: state.history[newIndex] },
              },
              isDirty: true,
            };
          });
        },

        pushToHistory: () => {
          set(state => {
            if (!state.currentPage) return state;
            const elements = state.currentPage.content?.elements || [];
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(elements)));
            // Limit history to 50 items
            if (newHistory.length > 50) newHistory.shift();
            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          });
        },
      }),
      {
        name: 'pageforge-store',
        partialize: (state) => ({
          viewport: state.viewport,
          leftPanelOpen: state.leftPanelOpen,
          rightPanelOpen: state.rightPanelOpen,
        }),
      }
    ),
    { name: 'pageforge' }
  )
);

export default usePageStore;
