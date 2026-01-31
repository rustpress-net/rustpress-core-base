// admin-ui/src/api/__tests__/pageforgeApi.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { pageforgeApi } from '../pageforgeApi';

const API_BASE = '/api/pageforge';

// Mock data
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

const mockTemplate = {
  id: 1,
  name: 'Landing Page',
  category: 'marketing',
  thumbnail: '/templates/landing.jpg',
  content: { elements: [] },
  created_at: '2026-01-01T00:00:00Z',
};

const mockWidget = {
  type: 'heading',
  name: 'Heading',
  icon: 'heading',
  category: 'basic',
  schema: {},
};

const mockRevision = {
  id: 1,
  page_id: 1,
  content: { elements: [] },
  created_at: '2026-01-01T00:00:00Z',
  author_id: 1,
};

const mockGlobalWidget = {
  id: 1,
  name: 'Header Widget',
  content: { elements: [] },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockForm = {
  id: 1,
  name: 'Contact Form',
  fields: [],
  settings: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockPopup = {
  id: 1,
  name: 'Welcome Popup',
  content: { elements: [] },
  triggers: {},
  settings: {},
  active: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockAsset = {
  id: 1,
  filename: 'image.jpg',
  url: '/uploads/image.jpg',
  mime_type: 'image/jpeg',
  size: 12345,
  created_at: '2026-01-01T00:00:00Z',
};

const mockGlobalStyle = {
  id: 1,
  name: 'Primary Color',
  type: 'color',
  value: { color: '#3b82f6' },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

// MSW Server setup
const server = setupServer(
  // Pages endpoints
  http.get(`${API_BASE}/pages`, () => {
    return HttpResponse.json({
      pages: [mockPage],
      total: 1,
      page: 1,
      per_page: 20,
      total_pages: 1,
    });
  }),
  http.get(`${API_BASE}/pages/:id`, ({ params }) => {
    return HttpResponse.json({ ...mockPage, id: Number(params.id) });
  }),
  http.post(`${API_BASE}/pages`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPage, ...body }, { status: 201 });
  }),
  http.put(`${API_BASE}/pages/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPage, id: Number(params.id), ...body });
  }),
  http.put(`${API_BASE}/pages/:id/content`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPage, id: Number(params.id), content: body.content });
  }),
  http.delete(`${API_BASE}/pages/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/pages/:id/publish`, ({ params }) => {
    return HttpResponse.json({ ...mockPage, id: Number(params.id), status: 'published', published_at: '2026-01-01T00:00:00Z' });
  }),
  http.post(`${API_BASE}/pages/:id/unpublish`, ({ params }) => {
    return HttpResponse.json({ ...mockPage, id: Number(params.id), status: 'draft', published_at: null });
  }),
  http.post(`${API_BASE}/pages/:id/duplicate`, ({ params }) => {
    return HttpResponse.json({ ...mockPage, id: Number(params.id) + 100, title: 'Test Page (Copy)', slug: 'test-page-copy' });
  }),
  http.post(`${API_BASE}/pages/:id/restore`, ({ params }) => {
    return HttpResponse.json({ ...mockPage, id: Number(params.id), status: 'draft' });
  }),
  http.get(`${API_BASE}/pages/:id/export/json`, () => {
    return HttpResponse.json(mockPage);
  }),
  http.get(`${API_BASE}/pages/:id/export/html`, () => {
    return new HttpResponse('<html></html>', { headers: { 'Content-Type': 'text/html' } });
  }),
  http.get(`${API_BASE}/pages/:id/preview`, () => {
    return HttpResponse.text('<html><body>Preview</body></html>');
  }),

  // Revisions endpoints
  http.get(`${API_BASE}/pages/:pageId/revisions`, () => {
    return HttpResponse.json([mockRevision]);
  }),
  http.get(`${API_BASE}/pages/:pageId/revisions/:revisionId`, ({ params }) => {
    return HttpResponse.json({ ...mockRevision, id: Number(params.revisionId), page_id: Number(params.pageId) });
  }),
  http.post(`${API_BASE}/pages/:pageId/revisions/:revisionId/restore`, ({ params }) => {
    return HttpResponse.json({ ...mockPage, id: Number(params.pageId) });
  }),
  http.delete(`${API_BASE}/pages/:pageId/revisions/:revisionId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Elements endpoints
  http.get(`${API_BASE}/pages/:pageId/elements`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${API_BASE}/pages/:pageId/elements`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 'element-1', type: 'heading', settings: {}, ...body }, { status: 201 });
  }),
  http.get(`${API_BASE}/elements/:elementId`, ({ params }) => {
    return HttpResponse.json({ id: params.elementId, type: 'heading', settings: {} });
  }),
  http.put(`${API_BASE}/elements/:elementId`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: params.elementId, type: 'heading', settings: {}, ...body });
  }),
  http.delete(`${API_BASE}/elements/:elementId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/elements/:elementId/move`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/elements/:elementId/duplicate`, ({ params }) => {
    return HttpResponse.json({ id: `${params.elementId}-copy`, type: 'heading', settings: {} });
  }),

  // Templates endpoints
  http.get(`${API_BASE}/templates`, () => {
    return HttpResponse.json([mockTemplate]);
  }),
  http.get(`${API_BASE}/templates/:id`, ({ params }) => {
    return HttpResponse.json({ ...mockTemplate, id: Number(params.id) });
  }),
  http.post(`${API_BASE}/templates`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockTemplate, ...body }, { status: 201 });
  }),
  http.put(`${API_BASE}/templates/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockTemplate, id: Number(params.id), ...body });
  }),
  http.delete(`${API_BASE}/templates/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/templates/:id/apply`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPage, id: body.page_id as number, template_id: Number(params.id) });
  }),

  // Widgets endpoints
  http.get(`${API_BASE}/widgets`, () => {
    return HttpResponse.json([mockWidget]);
  }),
  http.get(`${API_BASE}/widgets/:type`, () => {
    return HttpResponse.json(mockWidget.schema);
  }),

  // Global Widgets endpoints
  http.get(`${API_BASE}/global-widgets`, () => {
    return HttpResponse.json([mockGlobalWidget]);
  }),
  http.get(`${API_BASE}/global-widgets/:id`, ({ params }) => {
    return HttpResponse.json({ ...mockGlobalWidget, id: Number(params.id) });
  }),
  http.post(`${API_BASE}/global-widgets`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockGlobalWidget, ...body }, { status: 201 });
  }),
  http.put(`${API_BASE}/global-widgets/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockGlobalWidget, id: Number(params.id), ...body });
  }),
  http.delete(`${API_BASE}/global-widgets/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Forms endpoints
  http.get(`${API_BASE}/forms`, () => {
    return HttpResponse.json([mockForm]);
  }),
  http.get(`${API_BASE}/forms/:id`, ({ params }) => {
    return HttpResponse.json({ ...mockForm, id: Number(params.id) });
  }),
  http.post(`${API_BASE}/forms`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockForm, ...body }, { status: 201 });
  }),
  http.put(`${API_BASE}/forms/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockForm, id: Number(params.id), ...body });
  }),
  http.delete(`${API_BASE}/forms/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API_BASE}/forms/:id/submissions`, () => {
    return HttpResponse.json([{ id: 1, form_id: 1, data: {}, submitted_at: '2026-01-01T00:00:00Z' }]);
  }),

  // Popups endpoints
  http.get(`${API_BASE}/popups`, () => {
    return HttpResponse.json([mockPopup]);
  }),
  http.get(`${API_BASE}/popups/:id`, ({ params }) => {
    return HttpResponse.json({ ...mockPopup, id: Number(params.id) });
  }),
  http.post(`${API_BASE}/popups`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPopup, ...body }, { status: 201 });
  }),
  http.put(`${API_BASE}/popups/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPopup, id: Number(params.id), ...body });
  }),
  http.delete(`${API_BASE}/popups/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/popups/:id/activate`, ({ params }) => {
    return HttpResponse.json({ ...mockPopup, id: Number(params.id), active: true });
  }),
  http.post(`${API_BASE}/popups/:id/deactivate`, ({ params }) => {
    return HttpResponse.json({ ...mockPopup, id: Number(params.id), active: false });
  }),

  // Assets endpoints
  http.get(`${API_BASE}/assets`, () => {
    return HttpResponse.json([mockAsset]);
  }),
  http.post(`${API_BASE}/assets/upload`, () => {
    return HttpResponse.json(mockAsset, { status: 201 });
  }),
  http.delete(`${API_BASE}/assets/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Import endpoints
  http.post(`${API_BASE}/import/page`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockPage, ...body }, { status: 201 });
  }),
  http.post(`${API_BASE}/import/template`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockTemplate, ...body }, { status: 201 });
  }),

  // Global Styles endpoints
  http.get(`${API_BASE}/global-styles`, () => {
    return HttpResponse.json([mockGlobalStyle]);
  }),
  http.post(`${API_BASE}/global-styles`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockGlobalStyle, ...body }, { status: 201 });
  }),
  http.put(`${API_BASE}/global-styles/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockGlobalStyle, id: Number(params.id), ...body });
  }),
  http.delete(`${API_BASE}/global-styles/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/global-styles/init`, () => {
    return HttpResponse.json([mockGlobalStyle]);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('pageforgeApi', () => {
  describe('pages', () => {
    it('lists pages', async () => {
      const result = await pageforgeApi.pages.list();
      expect(result.pages).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('lists pages with params', async () => {
      const result = await pageforgeApi.pages.list({ page: 1, per_page: 10, status: 'draft' });
      expect(result.pages).toHaveLength(1);
    });

    it('gets single page', async () => {
      const result = await pageforgeApi.pages.get(1);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Page');
    });

    it('creates page', async () => {
      const result = await pageforgeApi.pages.create({ title: 'New Page' });
      expect(result.title).toBe('New Page');
    });

    it('updates page', async () => {
      const result = await pageforgeApi.pages.update(1, { title: 'Updated Title' });
      expect(result.id).toBe(1);
      expect(result.title).toBe('Updated Title');
    });

    it('updates page content', async () => {
      const newContent = { elements: [{ id: 'el-1', type: 'heading', settings: {} }] };
      const result = await pageforgeApi.pages.updateContent(1, newContent as any);
      expect(result.id).toBe(1);
    });

    it('deletes page', async () => {
      await expect(pageforgeApi.pages.delete(1)).resolves.toBeUndefined();
    });

    it('publishes page', async () => {
      const result = await pageforgeApi.pages.publish(1);
      expect(result.status).toBe('published');
      expect(result.published_at).toBeDefined();
    });

    it('unpublishes page', async () => {
      const result = await pageforgeApi.pages.unpublish(1);
      expect(result.status).toBe('draft');
    });

    it('duplicates page', async () => {
      const result = await pageforgeApi.pages.duplicate(1);
      expect(result.title).toBe('Test Page (Copy)');
      expect(result.id).not.toBe(1);
    });

    it('restores page', async () => {
      const result = await pageforgeApi.pages.restore(1);
      expect(result.status).toBe('draft');
    });

    it('previews page', async () => {
      const result = await pageforgeApi.pages.preview(1);
      expect(result).toContain('Preview');
    });
  });

  describe('revisions', () => {
    it('lists revisions', async () => {
      const result = await pageforgeApi.revisions.list(1);
      expect(result).toHaveLength(1);
      expect(result[0].page_id).toBe(1);
    });

    it('gets single revision', async () => {
      const result = await pageforgeApi.revisions.get(1, 1);
      expect(result.id).toBe(1);
      expect(result.page_id).toBe(1);
    });

    it('restores revision', async () => {
      const result = await pageforgeApi.revisions.restore(1, 1);
      expect(result.id).toBe(1);
    });

    it('deletes revision', async () => {
      await expect(pageforgeApi.revisions.delete(1, 1)).resolves.toBeUndefined();
    });
  });

  describe('elements', () => {
    it('lists elements', async () => {
      const result = await pageforgeApi.elements.list(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('creates element', async () => {
      const result = await pageforgeApi.elements.create(1, { type: 'heading' });
      expect(result.type).toBe('heading');
    });

    it('gets element', async () => {
      const result = await pageforgeApi.elements.get('element-1');
      expect(result.id).toBe('element-1');
    });

    it('updates element', async () => {
      const result = await pageforgeApi.elements.update('element-1', { settings: { text: 'Updated' } });
      expect(result.id).toBe('element-1');
    });

    it('deletes element', async () => {
      await expect(pageforgeApi.elements.delete('element-1')).resolves.toBeUndefined();
    });

    it('moves element', async () => {
      await expect(pageforgeApi.elements.move('element-1', 'parent-1', 0)).resolves.toBeUndefined();
    });

    it('duplicates element', async () => {
      const result = await pageforgeApi.elements.duplicate('element-1');
      expect(result.id).toContain('copy');
    });
  });

  describe('templates', () => {
    it('lists templates', async () => {
      const result = await pageforgeApi.templates.list();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Landing Page');
    });

    it('lists templates with category filter', async () => {
      const result = await pageforgeApi.templates.list({ category: 'marketing' });
      expect(result).toHaveLength(1);
    });

    it('gets single template', async () => {
      const result = await pageforgeApi.templates.get(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Landing Page');
    });

    it('creates template', async () => {
      const result = await pageforgeApi.templates.create({ name: 'New Template', category: 'basic' });
      expect(result.name).toBe('New Template');
    });

    it('updates template', async () => {
      const result = await pageforgeApi.templates.update(1, { name: 'Updated Template' });
      expect(result.name).toBe('Updated Template');
    });

    it('deletes template', async () => {
      await expect(pageforgeApi.templates.delete(1)).resolves.toBeUndefined();
    });

    it('applies template to page', async () => {
      const result = await pageforgeApi.templates.apply(1, 5);
      expect(result.template_id).toBe(1);
    });
  });

  describe('widgets', () => {
    it('lists widgets', async () => {
      const result = await pageforgeApi.widgets.list();
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
    });

    it('gets widget schema', async () => {
      const result = await pageforgeApi.widgets.getSchema('heading');
      expect(result).toBeDefined();
    });
  });

  describe('globalWidgets', () => {
    it('lists global widgets', async () => {
      const result = await pageforgeApi.globalWidgets.list();
      expect(result).toHaveLength(1);
    });

    it('gets global widget', async () => {
      const result = await pageforgeApi.globalWidgets.get(1);
      expect(result.id).toBe(1);
    });

    it('creates global widget', async () => {
      const result = await pageforgeApi.globalWidgets.create({ name: 'Footer Widget' });
      expect(result.name).toBe('Footer Widget');
    });

    it('updates global widget', async () => {
      const result = await pageforgeApi.globalWidgets.update(1, { name: 'Updated Widget' });
      expect(result.name).toBe('Updated Widget');
    });

    it('deletes global widget', async () => {
      await expect(pageforgeApi.globalWidgets.delete(1)).resolves.toBeUndefined();
    });
  });

  describe('forms', () => {
    it('lists forms', async () => {
      const result = await pageforgeApi.forms.list();
      expect(result).toHaveLength(1);
    });

    it('gets form', async () => {
      const result = await pageforgeApi.forms.get(1);
      expect(result.id).toBe(1);
    });

    it('creates form', async () => {
      const result = await pageforgeApi.forms.create({ name: 'Newsletter Form' });
      expect(result.name).toBe('Newsletter Form');
    });

    it('updates form', async () => {
      const result = await pageforgeApi.forms.update(1, { name: 'Updated Form' });
      expect(result.name).toBe('Updated Form');
    });

    it('deletes form', async () => {
      await expect(pageforgeApi.forms.delete(1)).resolves.toBeUndefined();
    });

    it('gets form submissions', async () => {
      const result = await pageforgeApi.forms.getSubmissions(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('popups', () => {
    it('lists popups', async () => {
      const result = await pageforgeApi.popups.list();
      expect(result).toHaveLength(1);
    });

    it('gets popup', async () => {
      const result = await pageforgeApi.popups.get(1);
      expect(result.id).toBe(1);
    });

    it('creates popup', async () => {
      const result = await pageforgeApi.popups.create({ name: 'Exit Intent Popup' });
      expect(result.name).toBe('Exit Intent Popup');
    });

    it('updates popup', async () => {
      const result = await pageforgeApi.popups.update(1, { name: 'Updated Popup' });
      expect(result.name).toBe('Updated Popup');
    });

    it('deletes popup', async () => {
      await expect(pageforgeApi.popups.delete(1)).resolves.toBeUndefined();
    });

    it('activates popup', async () => {
      const result = await pageforgeApi.popups.activate(1);
      expect(result.active).toBe(true);
    });

    it('deactivates popup', async () => {
      const result = await pageforgeApi.popups.deactivate(1);
      expect(result.active).toBe(false);
    });
  });

  describe('assets', () => {
    it('lists assets', async () => {
      const result = await pageforgeApi.assets.list();
      expect(result).toHaveLength(1);
    });

    it('deletes asset', async () => {
      await expect(pageforgeApi.assets.delete(1)).resolves.toBeUndefined();
    });
  });

  describe('import', () => {
    it('imports page', async () => {
      const result = await pageforgeApi.import.page({ title: 'Imported Page' });
      expect(result.title).toBe('Imported Page');
    });

    it('imports template', async () => {
      const result = await pageforgeApi.import.template({ name: 'Imported Template' });
      expect(result.name).toBe('Imported Template');
    });
  });

  describe('globalStyles', () => {
    it('lists global styles', async () => {
      const result = await pageforgeApi.globalStyles.list();
      expect(result).toHaveLength(1);
    });

    it('creates global style', async () => {
      const result = await pageforgeApi.globalStyles.create({ name: 'Secondary Color', type: 'color' });
      expect(result.name).toBe('Secondary Color');
    });

    it('updates global style', async () => {
      const result = await pageforgeApi.globalStyles.update(1, { name: 'Updated Style' });
      expect(result.name).toBe('Updated Style');
    });

    it('deletes global style', async () => {
      await expect(pageforgeApi.globalStyles.delete(1)).resolves.toBeUndefined();
    });

    it('initializes default styles', async () => {
      const result = await pageforgeApi.globalStyles.initDefaults();
      expect(result).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('handles 404 errors', async () => {
      server.use(
        http.get(`${API_BASE}/pages/:id`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(pageforgeApi.pages.get(999)).rejects.toThrow();
    });

    it('handles 500 errors', async () => {
      server.use(
        http.get(`${API_BASE}/pages`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(pageforgeApi.pages.list()).rejects.toThrow();
    });

    it('handles network errors', async () => {
      server.use(
        http.get(`${API_BASE}/pages`, () => {
          return HttpResponse.error();
        })
      );

      await expect(pageforgeApi.pages.list()).rejects.toThrow();
    });
  });
});
