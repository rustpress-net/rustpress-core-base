// admin-ui/src/api/pageforgeApi.ts
import { apiClient } from './client';

const API_BASE = '/pageforge';

// Types matching PageForge backend models
export interface PageForgeElement {
  id: string;
  type: string;
  settings: {
    content: Record<string, unknown>;
    style: {
      desktop: Record<string, unknown>;
      tablet: Record<string, unknown>;
      mobile: Record<string, unknown>;
    };
    advanced: {
      custom_id?: string;
      custom_classes?: string;
    };
  };
  children?: PageForgeElement[];
}

export interface PageForgePage {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'pending' | 'trash';
  content: { elements: PageForgeElement[] };
  settings: Record<string, unknown>;
  author_id: number;
  parent_id?: number;
  template_id?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreatePageRequest {
  title: string;
  slug?: string;
  status?: 'draft' | 'published' | 'pending';
  content?: { elements: PageForgeElement[] };
  settings?: Record<string, unknown>;
  parent_id?: number;
  template_id?: number;
}

export interface UpdatePageRequest extends Partial<CreatePageRequest> {}

export interface PageListParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  order_by?: string;
  order?: 'asc' | 'desc';
}

export interface PageListResponse {
  pages: PageForgePage[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PageRevision {
  id: number;
  page_id: number;
  content: { elements: PageForgeElement[] };
  created_at: string;
  author_id: number;
}

export interface Template {
  id: number;
  name: string;
  category: string;
  thumbnail?: string;
  content: { elements: PageForgeElement[] };
  created_at: string;
}

export interface Widget {
  type: string;
  name: string;
  icon: string;
  category: string;
  schema: Record<string, unknown>;
}

export interface GlobalWidget {
  id: number;
  name: string;
  content: { elements: PageForgeElement[] };
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: number;
  name: string;
  fields: Record<string, unknown>[];
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: number;
  form_id: number;
  data: Record<string, unknown>;
  submitted_at: string;
}

export interface Popup {
  id: number;
  name: string;
  content: { elements: PageForgeElement[] };
  triggers: Record<string, unknown>;
  settings: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface GlobalStyle {
  id: number;
  name: string;
  type: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const pageforgeApi = {
  // ============ PAGES ============
  pages: {
    list: (params?: PageListParams): Promise<PageListResponse> =>
      apiClient.get(`${API_BASE}/pages`, { params }).then(r => r.data),

    get: (id: number): Promise<PageForgePage> =>
      apiClient.get(`${API_BASE}/pages/${id}`).then(r => r.data),

    create: (data: CreatePageRequest): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/pages`, data).then(r => r.data),

    update: (id: number, data: UpdatePageRequest): Promise<PageForgePage> =>
      apiClient.put(`${API_BASE}/pages/${id}`, data).then(r => r.data),

    updateContent: (id: number, content: { elements: PageForgeElement[] }): Promise<PageForgePage> =>
      apiClient.put(`${API_BASE}/pages/${id}/content`, { content }).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/pages/${id}`).then(() => {}),

    publish: (id: number): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/pages/${id}/publish`).then(r => r.data),

    unpublish: (id: number): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/pages/${id}/unpublish`).then(r => r.data),

    duplicate: (id: number): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/pages/${id}/duplicate`).then(r => r.data),

    restore: (id: number): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/pages/${id}/restore`).then(r => r.data),

    exportJson: (id: number): Promise<Blob> =>
      apiClient.get(`${API_BASE}/pages/${id}/export/json`, { responseType: 'blob' }).then(r => r.data),

    exportHtml: (id: number): Promise<Blob> =>
      apiClient.get(`${API_BASE}/pages/${id}/export/html`, { responseType: 'blob' }).then(r => r.data),

    preview: (id: number): Promise<string> =>
      apiClient.get(`${API_BASE}/pages/${id}/preview`).then(r => r.data),
  },

  // ============ REVISIONS ============
  revisions: {
    list: (pageId: number): Promise<PageRevision[]> =>
      apiClient.get(`${API_BASE}/pages/${pageId}/revisions`).then(r => r.data),

    get: (pageId: number, revisionId: number): Promise<PageRevision> =>
      apiClient.get(`${API_BASE}/pages/${pageId}/revisions/${revisionId}`).then(r => r.data),

    restore: (pageId: number, revisionId: number): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/pages/${pageId}/revisions/${revisionId}/restore`).then(r => r.data),

    delete: (pageId: number, revisionId: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/pages/${pageId}/revisions/${revisionId}`).then(() => {}),
  },

  // ============ ELEMENTS ============
  elements: {
    list: (pageId: number): Promise<PageForgeElement[]> =>
      apiClient.get(`${API_BASE}/pages/${pageId}/elements`).then(r => r.data),

    create: (pageId: number, element: Partial<PageForgeElement>): Promise<PageForgeElement> =>
      apiClient.post(`${API_BASE}/pages/${pageId}/elements`, element).then(r => r.data),

    get: (elementId: string): Promise<PageForgeElement> =>
      apiClient.get(`${API_BASE}/elements/${elementId}`).then(r => r.data),

    update: (elementId: string, data: Partial<PageForgeElement>): Promise<PageForgeElement> =>
      apiClient.put(`${API_BASE}/elements/${elementId}`, data).then(r => r.data),

    delete: (elementId: string): Promise<void> =>
      apiClient.delete(`${API_BASE}/elements/${elementId}`).then(() => {}),

    move: (elementId: string, targetParentId: string, position: number): Promise<void> =>
      apiClient.post(`${API_BASE}/elements/${elementId}/move`, { target_parent_id: targetParentId, position }).then(() => {}),

    duplicate: (elementId: string): Promise<PageForgeElement> =>
      apiClient.post(`${API_BASE}/elements/${elementId}/duplicate`).then(r => r.data),
  },

  // ============ TEMPLATES ============
  templates: {
    list: (params?: { category?: string }): Promise<Template[]> =>
      apiClient.get(`${API_BASE}/templates`, { params }).then(r => r.data),

    get: (id: number): Promise<Template> =>
      apiClient.get(`${API_BASE}/templates/${id}`).then(r => r.data),

    create: (data: Partial<Template>): Promise<Template> =>
      apiClient.post(`${API_BASE}/templates`, data).then(r => r.data),

    update: (id: number, data: Partial<Template>): Promise<Template> =>
      apiClient.put(`${API_BASE}/templates/${id}`, data).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/templates/${id}`).then(() => {}),

    apply: (id: number, pageId: number): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/templates/${id}/apply`, { page_id: pageId }).then(r => r.data),
  },

  // ============ WIDGETS ============
  widgets: {
    list: (): Promise<Widget[]> =>
      apiClient.get(`${API_BASE}/widgets`).then(r => r.data),

    getSchema: (type: string): Promise<Record<string, unknown>> =>
      apiClient.get(`${API_BASE}/widgets/${type}`).then(r => r.data),
  },

  // ============ GLOBAL WIDGETS ============
  globalWidgets: {
    list: (): Promise<GlobalWidget[]> =>
      apiClient.get(`${API_BASE}/global-widgets`).then(r => r.data),

    get: (id: number): Promise<GlobalWidget> =>
      apiClient.get(`${API_BASE}/global-widgets/${id}`).then(r => r.data),

    create: (data: Partial<GlobalWidget>): Promise<GlobalWidget> =>
      apiClient.post(`${API_BASE}/global-widgets`, data).then(r => r.data),

    update: (id: number, data: Partial<GlobalWidget>): Promise<GlobalWidget> =>
      apiClient.put(`${API_BASE}/global-widgets/${id}`, data).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/global-widgets/${id}`).then(() => {}),
  },

  // ============ FORMS ============
  forms: {
    list: (): Promise<Form[]> =>
      apiClient.get(`${API_BASE}/forms`).then(r => r.data),

    get: (id: number): Promise<Form> =>
      apiClient.get(`${API_BASE}/forms/${id}`).then(r => r.data),

    create: (data: Partial<Form>): Promise<Form> =>
      apiClient.post(`${API_BASE}/forms`, data).then(r => r.data),

    update: (id: number, data: Partial<Form>): Promise<Form> =>
      apiClient.put(`${API_BASE}/forms/${id}`, data).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/forms/${id}`).then(() => {}),

    getSubmissions: (id: number): Promise<FormSubmission[]> =>
      apiClient.get(`${API_BASE}/forms/${id}/submissions`).then(r => r.data),
  },

  // ============ POPUPS ============
  popups: {
    list: (): Promise<Popup[]> =>
      apiClient.get(`${API_BASE}/popups`).then(r => r.data),

    get: (id: number): Promise<Popup> =>
      apiClient.get(`${API_BASE}/popups/${id}`).then(r => r.data),

    create: (data: Partial<Popup>): Promise<Popup> =>
      apiClient.post(`${API_BASE}/popups`, data).then(r => r.data),

    update: (id: number, data: Partial<Popup>): Promise<Popup> =>
      apiClient.put(`${API_BASE}/popups/${id}`, data).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/popups/${id}`).then(() => {}),

    activate: (id: number): Promise<Popup> =>
      apiClient.post(`${API_BASE}/popups/${id}/activate`).then(r => r.data),

    deactivate: (id: number): Promise<Popup> =>
      apiClient.post(`${API_BASE}/popups/${id}/deactivate`).then(r => r.data),
  },

  // ============ ASSETS ============
  assets: {
    upload: (file: File): Promise<Asset> => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post(`${API_BASE}/assets/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },

    list: (): Promise<Asset[]> =>
      apiClient.get(`${API_BASE}/assets`).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/assets/${id}`).then(() => {}),
  },

  // ============ IMPORT ============
  import: {
    page: (data: Record<string, unknown>): Promise<PageForgePage> =>
      apiClient.post(`${API_BASE}/import/page`, data).then(r => r.data),

    template: (data: Record<string, unknown>): Promise<Template> =>
      apiClient.post(`${API_BASE}/import/template`, data).then(r => r.data),
  },

  // ============ GLOBAL STYLES ============
  globalStyles: {
    list: (): Promise<GlobalStyle[]> =>
      apiClient.get(`${API_BASE}/global-styles`).then(r => r.data),

    create: (data: Partial<GlobalStyle>): Promise<GlobalStyle> =>
      apiClient.post(`${API_BASE}/global-styles`, data).then(r => r.data),

    update: (id: number, data: Partial<GlobalStyle>): Promise<GlobalStyle> =>
      apiClient.put(`${API_BASE}/global-styles/${id}`, data).then(r => r.data),

    delete: (id: number): Promise<void> =>
      apiClient.delete(`${API_BASE}/global-styles/${id}`).then(() => {}),

    initDefaults: (): Promise<GlobalStyle[]> =>
      apiClient.post(`${API_BASE}/global-styles/init`).then(r => r.data),
  },
};

export default pageforgeApi;
