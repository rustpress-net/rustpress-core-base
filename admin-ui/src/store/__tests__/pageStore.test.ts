// admin-ui/src/store/__tests__/pageStore.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePageStore } from '../pageStore';
import { pageforgeApi } from '../../api/pageforgeApi';

// Mock the API
vi.mock('../../api/pageforgeApi', () => ({
  pageforgeApi: {
    pages: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateContent: vi.fn(),
      delete: vi.fn(),
      publish: vi.fn(),
      unpublish: vi.fn(),
      duplicate: vi.fn(),
    },
    revisions: {
      list: vi.fn(),
      restore: vi.fn(),
    },
    templates: {
      list: vi.fn(),
      apply: vi.fn(),
      create: vi.fn(),
    },
    widgets: {
      list: vi.fn(),
    },
  },
}));

const mockPage = {
  id: 1,
  title: 'Test Page',
  slug: 'test-page',
  status: 'draft' as const,
  content: { elements: [] },
  settings: {},
  author_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockElement = {
  id: 'element-1',
  type: 'heading',
  settings: {
    content: { text: 'Hello' },
    style: { desktop: {}, tablet: {}, mobile: {} },
    advanced: {},
  },
};

describe('usePageStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    const { result } = renderHook(() => usePageStore());
    act(() => {
      usePageStore.setState({
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
      });
    });
  });

  describe('fetchPages', () => {
    it('fetches pages successfully', async () => {
      const mockResponse = {
        pages: [mockPage],
        total: 1,
        page: 1,
        per_page: 20,
        total_pages: 1,
      };
      vi.mocked(pageforgeApi.pages.list).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchPages();
      });

      expect(result.current.pages).toEqual([mockPage]);
      expect(result.current.pagination.total).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles fetch error', async () => {
      vi.mocked(pageforgeApi.pages.list).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchPages();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });

    it('sets loading state during fetch', async () => {
      vi.mocked(pageforgeApi.pages.list).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ pages: [], total: 0, page: 1, per_page: 20, total_pages: 0 }), 100))
      );

      const { result } = renderHook(() => usePageStore());

      act(() => {
        result.current.fetchPages();
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('fetchPage', () => {
    it('fetches single page successfully', async () => {
      vi.mocked(pageforgeApi.pages.get).mockResolvedValue(mockPage);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchPage(1);
      });

      expect(result.current.currentPage).toEqual(mockPage);
      expect(result.current.loading).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });

    it('initializes history when fetching page', async () => {
      const pageWithContent = { ...mockPage, content: { elements: [mockElement] } };
      vi.mocked(pageforgeApi.pages.get).mockResolvedValue(pageWithContent);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchPage(1);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.historyIndex).toBe(0);
    });
  });

  describe('createPage', () => {
    it('creates page and adds to list', async () => {
      const newPage = { ...mockPage, id: 2, title: 'New Page' };
      vi.mocked(pageforgeApi.pages.create).mockResolvedValue(newPage);

      const { result } = renderHook(() => usePageStore());

      let createdPage;
      await act(async () => {
        createdPage = await result.current.createPage({ title: 'New Page' });
      });

      expect(createdPage).toEqual(newPage);
      expect(result.current.pages).toContainEqual(newPage);
      expect(result.current.currentPage).toEqual(newPage);
    });

    it('handles create error', async () => {
      vi.mocked(pageforgeApi.pages.create).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => usePageStore());

      try {
        await act(async () => {
          await result.current.createPage({ title: 'New Page' });
        });
      } catch (e) {
        // Expected to throw
      }

      // The store should have set the error
      expect(result.current.loading).toBe(false);
    });
  });

  describe('updatePage', () => {
    it('updates page successfully', async () => {
      const updatedPage = { ...mockPage, title: 'Updated Title' };
      vi.mocked(pageforgeApi.pages.update).mockResolvedValue(updatedPage);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ pages: [mockPage], currentPage: mockPage });
      });

      await act(async () => {
        await result.current.updatePage(1, { title: 'Updated Title' });
      });

      expect(result.current.pages[0].title).toBe('Updated Title');
      expect(result.current.currentPage?.title).toBe('Updated Title');
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('savePage', () => {
    it('saves current page content', async () => {
      vi.mocked(pageforgeApi.pages.updateContent).mockResolvedValue(mockPage);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ currentPage: mockPage, isDirty: true });
      });

      await act(async () => {
        await result.current.savePage();
      });

      expect(pageforgeApi.pages.updateContent).toHaveBeenCalledWith(1, mockPage.content);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.saving).toBe(false);
    });

    it('does nothing if no current page', async () => {
      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.savePage();
      });

      expect(pageforgeApi.pages.updateContent).not.toHaveBeenCalled();
    });
  });

  describe('deletePage', () => {
    it('deletes page and removes from list', async () => {
      vi.mocked(pageforgeApi.pages.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ pages: [mockPage], currentPage: mockPage });
      });

      await act(async () => {
        await result.current.deletePage(1);
      });

      expect(result.current.pages).toHaveLength(0);
      expect(result.current.currentPage).toBeNull();
    });
  });

  describe('publishPage', () => {
    it('publishes page successfully', async () => {
      const publishedPage = { ...mockPage, status: 'published' as const, published_at: '2026-01-01T00:00:00Z' };
      vi.mocked(pageforgeApi.pages.publish).mockResolvedValue(publishedPage);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ pages: [mockPage], currentPage: mockPage });
      });

      await act(async () => {
        await result.current.publishPage(1);
      });

      expect(result.current.currentPage?.status).toBe('published');
    });
  });

  describe('unpublishPage', () => {
    it('unpublishes page successfully', async () => {
      const unpublishedPage = { ...mockPage, status: 'draft' as const };
      vi.mocked(pageforgeApi.pages.unpublish).mockResolvedValue(unpublishedPage);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ pages: [{ ...mockPage, status: 'published' }], currentPage: { ...mockPage, status: 'published' } });
      });

      await act(async () => {
        await result.current.unpublishPage(1);
      });

      expect(result.current.currentPage?.status).toBe('draft');
    });
  });

  describe('duplicatePage', () => {
    it('duplicates page and adds to list', async () => {
      const duplicatedPage = { ...mockPage, id: 2, title: 'Test Page (Copy)' };
      vi.mocked(pageforgeApi.pages.duplicate).mockResolvedValue(duplicatedPage);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ pages: [mockPage] });
      });

      let duplicated;
      await act(async () => {
        duplicated = await result.current.duplicatePage(1);
      });

      expect(duplicated).toEqual(duplicatedPage);
      expect(result.current.pages).toHaveLength(2);
    });
  });

  describe('updateContent', () => {
    it('updates content and marks as dirty', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ currentPage: mockPage });
      });

      const newElements = [mockElement];

      act(() => {
        result.current.updateContent(newElements as any);
      });

      expect(result.current.currentPage?.content.elements).toEqual(newElements);
      expect(result.current.isDirty).toBe(true);
    });

    it('pushes to history after content update', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ currentPage: mockPage, history: [[]], historyIndex: 0 });
      });

      act(() => {
        result.current.updateContent([mockElement] as any);
      });

      expect(result.current.history.length).toBeGreaterThan(1);
    });
  });

  describe('addElement', () => {
    it('adds element to root level', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ currentPage: mockPage });
      });

      act(() => {
        result.current.addElement(mockElement as any);
      });

      expect(result.current.currentPage?.content.elements).toContainEqual(mockElement);
      expect(result.current.isDirty).toBe(true);
    });

    it('adds element to parent', () => {
      const parentElement = { ...mockElement, id: 'parent-1', children: [] };
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [parentElement] } },
        });
      });

      const childElement = { ...mockElement, id: 'child-1' };

      act(() => {
        result.current.addElement(childElement as any, 'parent-1');
      });

      const parent = result.current.currentPage?.content.elements[0];
      expect(parent?.children).toContainEqual(childElement);
    });

    it('adds element at specific position', () => {
      const { result } = renderHook(() => usePageStore());
      const existingElement = { ...mockElement, id: 'existing-1' };

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [existingElement] } },
        });
      });

      const newElement = { ...mockElement, id: 'new-1' };

      act(() => {
        result.current.addElement(newElement as any, undefined, 0);
      });

      expect(result.current.currentPage?.content.elements[0].id).toBe('new-1');
    });
  });

  describe('updateElement', () => {
    it('updates element in tree', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
        });
      });

      act(() => {
        result.current.updateElement('element-1', { settings: { ...mockElement.settings, content: { text: 'Updated' } } } as any);
      });

      expect(result.current.currentPage?.content.elements[0].settings.content).toEqual({ text: 'Updated' });
      expect(result.current.isDirty).toBe(true);
    });

    it('updates nested element', () => {
      const parentElement = { ...mockElement, id: 'parent-1', children: [{ ...mockElement, id: 'child-1' }] };
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [parentElement] } },
        });
      });

      act(() => {
        result.current.updateElement('child-1', { type: 'paragraph' });
      });

      expect(result.current.currentPage?.content.elements[0].children?.[0].type).toBe('paragraph');
    });
  });

  describe('deleteElement', () => {
    it('deletes element from tree', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
        });
      });

      act(() => {
        result.current.deleteElement('element-1');
      });

      expect(result.current.currentPage?.content.elements).toHaveLength(0);
      expect(result.current.isDirty).toBe(true);
    });

    it('clears selected element if deleted', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
          selectedElementId: 'element-1',
        });
      });

      act(() => {
        result.current.deleteElement('element-1');
      });

      expect(result.current.selectedElementId).toBeNull();
    });
  });

  describe('moveElement', () => {
    it('moves element to new parent', () => {
      const parentA = { ...mockElement, id: 'parent-a', children: [{ ...mockElement, id: 'child-1' }] };
      const parentB = { ...mockElement, id: 'parent-b', children: [] };
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [parentA, parentB] } },
        });
      });

      act(() => {
        result.current.moveElement('child-1', 'parent-b', 0);
      });

      const elements = result.current.currentPage?.content.elements;
      expect(elements?.[0].children).toHaveLength(0);
      expect(elements?.[1].children).toHaveLength(1);
    });
  });

  describe('duplicateElement', () => {
    it('duplicates element with new ID', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
        });
      });

      act(() => {
        result.current.duplicateElement('element-1');
      });

      expect(result.current.currentPage?.content.elements).toHaveLength(2);
      expect(result.current.currentPage?.content.elements[1].id).not.toBe('element-1');
    });
  });

  describe('undo/redo', () => {
    it('undoes last change', () => {
      const { result } = renderHook(() => usePageStore());
      const initialElements = [{ ...mockElement, id: 'el-1' }];
      const newElements = [{ ...mockElement, id: 'el-2' }];

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: newElements } },
          history: [initialElements, newElements],
          historyIndex: 1,
        });
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.historyIndex).toBe(0);
      expect(result.current.currentPage?.content.elements).toEqual(initialElements);
      expect(result.current.isDirty).toBe(true);
    });

    it('does not undo if at beginning of history', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
          history: [[mockElement]],
          historyIndex: 0,
        });
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.historyIndex).toBe(0);
    });

    it('redoes undone change', () => {
      const { result } = renderHook(() => usePageStore());
      const initialElements = [{ ...mockElement, id: 'el-1' }];
      const newElements = [{ ...mockElement, id: 'el-2' }];

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: initialElements } },
          history: [initialElements, newElements],
          historyIndex: 0,
        });
      });

      act(() => {
        result.current.redo();
      });

      expect(result.current.historyIndex).toBe(1);
      expect(result.current.currentPage?.content.elements).toEqual(newElements);
    });

    it('does not redo if at end of history', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
          history: [[mockElement]],
          historyIndex: 0,
        });
      });

      act(() => {
        result.current.redo();
      });

      expect(result.current.historyIndex).toBe(0);
    });
  });

  describe('fetchRevisions', () => {
    it('fetches revisions successfully', async () => {
      const mockRevisions = [{ id: 1, page_id: 1, content: { elements: [] }, created_at: '2026-01-01T00:00:00Z', author_id: 1 }];
      vi.mocked(pageforgeApi.revisions.list).mockResolvedValue(mockRevisions);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchRevisions(1);
      });

      expect(result.current.revisions).toEqual(mockRevisions);
    });
  });

  describe('restoreRevision', () => {
    it('restores revision successfully', async () => {
      const restoredPage = { ...mockPage, content: { elements: [mockElement] } };
      vi.mocked(pageforgeApi.revisions.restore).mockResolvedValue(restoredPage);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.restoreRevision(1, 1);
      });

      expect(result.current.currentPage).toEqual(restoredPage);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('fetchTemplates', () => {
    it('fetches templates successfully', async () => {
      const mockTemplates = [{ id: 1, name: 'Template', category: 'basic', content: { elements: [] }, created_at: '2026-01-01T00:00:00Z' }];
      vi.mocked(pageforgeApi.templates.list).mockResolvedValue(mockTemplates);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchTemplates();
      });

      expect(result.current.templates).toEqual(mockTemplates);
    });
  });

  describe('applyTemplate', () => {
    it('applies template successfully', async () => {
      const pageWithTemplate = { ...mockPage, content: { elements: [mockElement] } };
      vi.mocked(pageforgeApi.templates.apply).mockResolvedValue(pageWithTemplate);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ currentPage: mockPage });
      });

      await act(async () => {
        await result.current.applyTemplate(1);
      });

      expect(result.current.currentPage?.content.elements).toHaveLength(1);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('saveAsTemplate', () => {
    it('saves current page as template', async () => {
      const mockTemplate = { id: 1, name: 'My Template', category: 'custom', content: mockPage.content, created_at: '2026-01-01T00:00:00Z' };
      vi.mocked(pageforgeApi.templates.create).mockResolvedValue(mockTemplate);

      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ currentPage: mockPage });
      });

      let template;
      await act(async () => {
        template = await result.current.saveAsTemplate('My Template', 'custom');
      });

      expect(template).toEqual(mockTemplate);
      expect(result.current.templates).toContainEqual(mockTemplate);
    });

    it('throws error if no current page', async () => {
      const { result } = renderHook(() => usePageStore());

      await expect(
        act(async () => {
          await result.current.saveAsTemplate('Template', 'basic');
        })
      ).rejects.toThrow('No page to save as template');
    });
  });

  describe('fetchWidgets', () => {
    it('fetches widgets successfully', async () => {
      const mockWidgets = [{ type: 'heading', name: 'Heading', icon: 'heading', category: 'basic', schema: {} }];
      vi.mocked(pageforgeApi.widgets.list).mockResolvedValue(mockWidgets);

      const { result } = renderHook(() => usePageStore());

      await act(async () => {
        await result.current.fetchWidgets();
      });

      expect(result.current.widgets).toEqual(mockWidgets);
    });
  });

  describe('UI actions', () => {
    it('sets selected element', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        result.current.setSelectedElement('element-1');
      });

      expect(result.current.selectedElementId).toBe('element-1');
    });

    it('sets viewport', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        result.current.setViewport('tablet');
      });

      expect(result.current.viewport).toBe('tablet');
    });

    it('toggles left panel', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        result.current.toggleLeftPanel();
      });

      expect(result.current.leftPanelOpen).toBe(false);

      act(() => {
        result.current.toggleLeftPanel();
      });

      expect(result.current.leftPanelOpen).toBe(true);
    });

    it('toggles right panel', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        result.current.toggleRightPanel();
      });

      expect(result.current.rightPanelOpen).toBe(false);
    });

    it('sets isDirty flag', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        result.current.setIsDirty(true);
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('clears error', () => {
      const { result } = renderHook(() => usePageStore());

      act(() => {
        usePageStore.setState({ error: 'Some error' });
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('history management', () => {
    it('limits history to 50 items', () => {
      const { result } = renderHook(() => usePageStore());

      // Start fresh with current page
      act(() => {
        usePageStore.setState({
          currentPage: { ...mockPage, content: { elements: [mockElement] } },
          history: [],
          historyIndex: -1,
        });
      });

      // Push more than 50 history items
      for (let i = 0; i < 55; i++) {
        act(() => {
          result.current.updateContent([{ ...mockElement, id: `el-${i}` }] as any);
        });
      }

      // History should be limited to at most 50 items
      expect(result.current.history.length).toBeLessThanOrEqual(50);
    });
  });
});
