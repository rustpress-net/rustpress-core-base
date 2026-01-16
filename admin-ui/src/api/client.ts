import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled';
  author_id: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  type: 'category' | 'tag';
  description?: string;
  parent_id?: string;
  count: number;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  alt_text?: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: string;
  avatar?: string;
  created_at: string;
}

export interface DatabaseStatus {
  connected: boolean;
  version: string;
  uptime: number;
}

export interface DatabaseStats {
  total_tables: number;
  total_rows: number;
  database_size: string;
}

export interface TableInfo {
  name: string;
  rows: number;
  size: string;
  engine?: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default_value?: string;
  primary_key: boolean;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  affected_rows: number;
  execution_time: number;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  created_at: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  executed_at: string;
  execution_time: number;
  success: boolean;
}

// API modules
export const api = apiClient;

export const postsApi = {
  getAll: () => apiClient.get<Post[]>('/posts'),
  getById: (id: string) => apiClient.get<Post>(`/posts/${id}`),
  create: (data: Partial<Post>) => apiClient.post<Post>('/posts', data),
  update: (id: string, data: Partial<Post>) => apiClient.put<Post>(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};

export const taxonomiesApi = {
  getCategories: () => apiClient.get<Taxonomy[]>('/taxonomies/categories'),
  getTags: () => apiClient.get<Taxonomy[]>('/taxonomies/tags'),
  create: (data: Partial<Taxonomy>) => apiClient.post<Taxonomy>('/taxonomies', data),
  update: (id: string, data: Partial<Taxonomy>) => apiClient.put<Taxonomy>(`/taxonomies/${id}`, data),
  delete: (id: string) => apiClient.delete(`/taxonomies/${id}`),
};

export const mediaApi = {
  getAll: () => apiClient.get<MediaItem[]>('/media'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<MediaItem>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => apiClient.delete(`/media/${id}`),
};

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => apiClient.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => apiClient.put<User>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export const databaseApi = {
  getStatus: () => apiClient.get<DatabaseStatus>('/database/status'),
  getStats: () => apiClient.get<DatabaseStats>('/database/stats'),
  getTables: () => apiClient.get<TableInfo[]>('/database/tables'),
  getTableColumns: (table: string) => apiClient.get<ColumnInfo[]>(`/database/tables/${table}/columns`),
  executeQuery: (query: string) => apiClient.post<QueryResult>('/database/query', { query }),
  getSavedQueries: () => apiClient.get<SavedQuery[]>('/database/queries'),
  saveQuery: (name: string, query: string) => apiClient.post<SavedQuery>('/database/queries', { name, query }),
  getHistory: () => apiClient.get<QueryHistoryItem[]>('/database/history'),
};

export default apiClient;
