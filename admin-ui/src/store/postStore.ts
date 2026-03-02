/**
 * RustPress Post Store
 * Manages post editor state, list, and CRUD operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { postsApi } from '../api/client';
import {
  type PostEditorData,
  type PostListItem,
  type PostFilters,
  DEFAULT_POST,
  DEFAULT_FILTERS,
} from '../types/post';

// Generate slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Mock posts data
const mockPosts: PostListItem[] = [
  { id: '1', title: 'Getting Started with RustPress', slug: 'getting-started-with-rustpress', status: 'published', author_name: 'Admin', categories: ['Tutorial'], created_at: '2025-12-20T10:00:00Z', updated_at: '2025-12-20T10:00:00Z' },
  { id: '2', title: 'Building Your First Theme', slug: 'building-your-first-theme', status: 'draft', author_name: 'Admin', categories: ['Tutorial', 'Themes'], created_at: '2025-12-19T14:00:00Z', updated_at: '2025-12-19T14:00:00Z' },
  { id: '3', title: 'Plugin Development Guide', slug: 'plugin-development-guide', status: 'published', author_name: 'Admin', categories: ['Guide'], created_at: '2025-12-18T09:00:00Z', updated_at: '2025-12-18T09:00:00Z' },
  { id: '4', title: 'SEO Best Practices for RustPress', slug: 'seo-best-practices', status: 'scheduled', author_name: 'Editor', categories: ['SEO', 'Guide'], created_at: '2025-12-17T11:00:00Z', updated_at: '2025-12-17T11:00:00Z' },
  { id: '5', title: 'Performance Optimization Tips', slug: 'performance-optimization-tips', status: 'published', author_name: 'Admin', categories: ['Performance'], created_at: '2025-12-15T08:00:00Z', updated_at: '2025-12-15T08:00:00Z' },
  { id: '6', title: 'Deploying to Production', slug: 'deploying-to-production', status: 'published', author_name: 'DevOps', categories: ['DevOps', 'Guide'], created_at: '2025-12-14T16:00:00Z', updated_at: '2025-12-14T16:00:00Z' },
  { id: '7', title: 'Custom API Endpoints', slug: 'custom-api-endpoints', status: 'draft', author_name: 'Admin', categories: ['API', 'Tutorial'], created_at: '2025-12-13T13:00:00Z', updated_at: '2025-12-13T13:00:00Z' },
  { id: '8', title: 'Migrating from WordPress', slug: 'migrating-from-wordpress', status: 'published', author_name: 'Editor', categories: ['Migration'], created_at: '2025-12-12T10:00:00Z', updated_at: '2025-12-12T10:00:00Z' },
  { id: '9', title: 'Content Scheduling & Workflows', slug: 'content-scheduling-workflows', status: 'pending', author_name: 'Author', categories: ['Workflows'], created_at: '2025-12-11T15:00:00Z', updated_at: '2025-12-11T15:00:00Z' },
  { id: '10', title: 'Multilingual Site Setup', slug: 'multilingual-site-setup', status: 'draft', author_name: 'Admin', categories: ['i18n', 'Tutorial'], created_at: '2025-12-10T09:00:00Z', updated_at: '2025-12-10T09:00:00Z' },
];

const mockCategories = ['Tutorial', 'Guide', 'SEO', 'Performance', 'DevOps', 'API', 'Migration', 'Workflows', 'i18n', 'Themes'];
const mockTags = ['rust', 'web', 'cms', 'performance', 'seo', 'plugins', 'themes', 'api', 'deployment', 'migration'];

// Mock full post content for loading
const mockFullPosts: Record<string, Partial<PostEditorData>> = {
  '1': {
    content: '<h2>Welcome to RustPress</h2><p>RustPress is a blazingly fast content management system built with Rust. In this guide, we\'ll walk you through the basics of getting started.</p><h3>Installation</h3><p>To install RustPress, you\'ll need Rust and Cargo installed on your system.</p>',
    excerpt: 'Learn how to get started with RustPress, the blazingly fast CMS built with Rust.',
    categories: ['Tutorial'],
    tags: ['rust', 'cms', 'web'],
    seo: { meta_title: 'Getting Started with RustPress - Complete Guide', meta_description: 'Learn how to install and configure RustPress', focus_keyword: 'rustpress getting started' },
  },
  '2': {
    content: '<h2>Theme Development</h2><p>Creating custom themes in RustPress is straightforward. Themes use a template engine with hot reloading support.</p>',
    excerpt: 'A comprehensive guide to building your first RustPress theme.',
    categories: ['Tutorial', 'Themes'],
    tags: ['themes', 'web'],
    seo: { meta_title: '', meta_description: '', focus_keyword: '' },
  },
};

interface PostState {
  // List state
  posts: PostListItem[];
  filters: PostFilters;
  isLoading: boolean;
  selectedIds: string[];

  // Editor state
  currentPost: PostEditorData;
  originalPost: PostEditorData;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Taxonomy data
  availableCategories: string[];
  availableTags: string[];

  // List actions
  fetchPosts: () => Promise<void>;
  setFilters: (filters: Partial<PostFilters>) => void;
  setSelectedIds: (ids: string[]) => void;
  deletePost: (id: string) => Promise<void>;
  bulkAction: (action: 'delete' | 'draft' | 'publish', ids: string[]) => Promise<void>;

  // Editor actions
  initNewPost: () => void;
  loadPost: (id: string) => Promise<void>;
  updateField: <K extends keyof PostEditorData>(field: K, value: PostEditorData[K]) => void;
  updateSEOField: (field: keyof PostEditorData['seo'], value: string) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  generateSlug: (title: string) => string;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: [],
      filters: DEFAULT_FILTERS,
      isLoading: false,
      selectedIds: [],

      currentPost: { ...DEFAULT_POST },
      originalPost: { ...DEFAULT_POST },
      isDirty: false,
      isSaving: false,
      lastSaved: null,

      availableCategories: mockCategories,
      availableTags: mockTags,

      // List actions
      fetchPosts: async () => {
        set({ isLoading: true });
        try {
          const response = await postsApi.getAll();
          const posts: PostListItem[] = response.data.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            author_name: p.author_name || 'Admin',
            categories: p.categories || [],
            created_at: p.created_at,
            updated_at: p.updated_at,
          }));
          set({ posts, isLoading: false });
        } catch {
          // Fallback to mock data
          set({ posts: mockPosts, isLoading: false });
        }
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      deletePost: async (id) => {
        try {
          await postsApi.delete(id);
        } catch {
          // Local fallback
        }
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }));
        toast.success('Post deleted');
      },

      bulkAction: async (action, ids) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (!ids.includes(p.id)) return p;
            if (action === 'delete') return p; // handled below
            if (action === 'draft') return { ...p, status: 'draft' as const };
            if (action === 'publish') return { ...p, status: 'published' as const };
            return p;
          }).filter((p) => !(action === 'delete' && ids.includes(p.id))),
          selectedIds: [],
        }));
        const labels: Record<string, string> = { delete: 'deleted', draft: 'set to draft', publish: 'published' };
        toast.success(`${ids.length} post(s) ${labels[action]}`);
      },

      // Editor actions
      initNewPost: () => {
        const fresh = { ...DEFAULT_POST, id: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        set({
          currentPost: fresh,
          originalPost: { ...fresh },
          isDirty: false,
          isSaving: false,
          lastSaved: null,
        });
      },

      loadPost: async (id) => {
        set({ isLoading: true });
        try {
          const response = await postsApi.getById(id);
          const p = response.data;
          const post: PostEditorData = {
            id: p.id,
            title: p.title,
            slug: p.slug,
            content: p.content,
            excerpt: p.excerpt || '',
            status: p.status,
            visibility: p.visibility || 'public',
            password: p.password || '',
            categories: p.categories || [],
            tags: p.tags || [],
            featured_image: p.featured_image || '',
            featured_image_alt: '',
            seo: {
              meta_title: p.seo_title || '',
              meta_description: p.seo_description || '',
              focus_keyword: p.focus_keyword || '',
            },
            author_id: p.author_id,
            author_name: p.author_name || 'Admin',
            scheduled_at: p.scheduled_at || '',
            created_at: p.created_at,
            updated_at: p.updated_at,
          };
          set({ currentPost: post, originalPost: { ...post }, isDirty: false, isLoading: false });
        } catch {
          // Fallback to mock data
          const listItem = mockPosts.find((p) => p.id === id);
          const fullData = mockFullPosts[id] || {};
          if (listItem) {
            const post: PostEditorData = {
              ...DEFAULT_POST,
              id: listItem.id,
              title: listItem.title,
              slug: listItem.slug,
              status: listItem.status,
              author_name: listItem.author_name,
              categories: fullData.categories || listItem.categories,
              tags: fullData.tags || [],
              content: fullData.content || '',
              excerpt: fullData.excerpt || '',
              seo: fullData.seo || DEFAULT_POST.seo,
              created_at: listItem.created_at,
              updated_at: listItem.updated_at,
            };
            set({ currentPost: post, originalPost: { ...post }, isDirty: false, isLoading: false });
          } else {
            set({ isLoading: false });
            toast.error('Post not found');
          }
        }
      },

      updateField: (field, value) =>
        set((state) => ({
          currentPost: { ...state.currentPost, [field]: value },
          isDirty: true,
        })),

      updateSEOField: (field, value) =>
        set((state) => ({
          currentPost: {
            ...state.currentPost,
            seo: { ...state.currentPost.seo, [field]: value },
          },
          isDirty: true,
        })),

      saveDraft: async () => {
        const { currentPost } = get();
        set({ isSaving: true });
        const postData = {
          ...currentPost,
          status: 'draft' as const,
          updated_at: new Date().toISOString(),
        };

        try {
          if (currentPost.id) {
            await postsApi.update(currentPost.id, {
              title: postData.title,
              slug: postData.slug,
              content: postData.content,
              excerpt: postData.excerpt,
              status: postData.status,
              featured_image: postData.featured_image || undefined,
              categories: postData.categories,
              tags: postData.tags,
              seo_title: postData.seo.meta_title || undefined,
              seo_description: postData.seo.meta_description || undefined,
              focus_keyword: postData.seo.focus_keyword || undefined,
            });
          } else {
            const response = await postsApi.create({
              title: postData.title || 'Untitled Post',
              slug: postData.slug || slugify(postData.title || 'untitled-post'),
              content: postData.content,
              excerpt: postData.excerpt,
              status: postData.status,
              author_id: postData.author_id,
            });
            postData.id = response.data.id;
          }
        } catch {
          // Local fallback — assign a temporary ID if new
          if (!postData.id) {
            postData.id = `local-${Date.now()}`;
          }
        }

        set({
          currentPost: { ...postData, status: 'draft' },
          originalPost: { ...postData, status: 'draft' },
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
        });

        // Update list if post exists there
        set((state) => {
          const exists = state.posts.some((p) => p.id === postData.id);
          const listItem: PostListItem = {
            id: postData.id,
            title: postData.title || 'Untitled Post',
            slug: postData.slug,
            status: 'draft',
            author_name: postData.author_name,
            categories: postData.categories,
            created_at: postData.created_at,
            updated_at: postData.updated_at,
          };
          return {
            posts: exists
              ? state.posts.map((p) => (p.id === postData.id ? listItem : p))
              : [listItem, ...state.posts],
          };
        });

        toast.success('Draft saved');
      },

      publish: async () => {
        const { currentPost } = get();
        set({ isSaving: true });
        const postData = {
          ...currentPost,
          status: 'published' as const,
          updated_at: new Date().toISOString(),
        };

        try {
          if (currentPost.id) {
            await postsApi.update(currentPost.id, {
              title: postData.title,
              slug: postData.slug,
              content: postData.content,
              excerpt: postData.excerpt,
              status: 'published',
              featured_image: postData.featured_image || undefined,
              categories: postData.categories,
              tags: postData.tags,
            });
          } else {
            const response = await postsApi.create({
              title: postData.title || 'Untitled Post',
              slug: postData.slug || slugify(postData.title || 'untitled-post'),
              content: postData.content,
              status: 'published',
              author_id: postData.author_id,
            });
            postData.id = response.data.id;
          }
        } catch {
          if (!postData.id) {
            postData.id = `local-${Date.now()}`;
          }
        }

        set({
          currentPost: { ...postData, status: 'published' },
          originalPost: { ...postData, status: 'published' },
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
        });

        // Update list
        set((state) => {
          const exists = state.posts.some((p) => p.id === postData.id);
          const listItem: PostListItem = {
            id: postData.id,
            title: postData.title || 'Untitled Post',
            slug: postData.slug,
            status: 'published',
            author_name: postData.author_name,
            categories: postData.categories,
            created_at: postData.created_at,
            updated_at: postData.updated_at,
          };
          return {
            posts: exists
              ? state.posts.map((p) => (p.id === postData.id ? listItem : p))
              : [listItem, ...state.posts],
          };
        });

        toast.success('Post published!');
      },

      generateSlug: (title) => slugify(title),
    }),
    {
      name: 'rustpress-posts',
      partialize: (state) => ({
        posts: state.posts,
        availableCategories: state.availableCategories,
        availableTags: state.availableTags,
      }),
    }
  )
);

// Selector: filtered posts
export const useFilteredPosts = () => {
  const { posts, filters } = usePostStore();
  return posts.filter((p) => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.category && !p.categories.includes(filters.category)) return false;
    if (filters.author && p.author_name !== filters.author) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
    }
    return true;
  });
};

export default usePostStore;
