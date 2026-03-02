/**
 * Post type definitions for the RustPress post editor and list
 */

export interface PostSEOData {
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
}

export interface PostEditorData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'pending';
  visibility: 'public' | 'private' | 'password';
  password: string;
  categories: string[];
  tags: string[];
  featured_image: string;
  featured_image_alt: string;
  seo: PostSEOData;
  author_id: string;
  author_name: string;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'pending';
  author_name: string;
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface PostFilters {
  search: string;
  status: 'all' | 'draft' | 'published' | 'scheduled' | 'pending';
  category: string;
  author: string;
}

export const DEFAULT_POST: PostEditorData = {
  id: '',
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  status: 'draft',
  visibility: 'public',
  password: '',
  categories: [],
  tags: [],
  featured_image: '',
  featured_image_alt: '',
  seo: {
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
  },
  author_id: '1',
  author_name: 'Admin',
  scheduled_at: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_FILTERS: PostFilters = {
  search: '',
  status: 'all',
  category: '',
  author: '',
};
