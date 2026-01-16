import { useState, useEffect, useCallback } from 'react';
import { postsApi, taxonomiesApi, mediaApi, usersApi, Post, Taxonomy, MediaItem, User } from '../api/client';

// Types for widget data
export interface WidgetDataSource {
  type: 'posts' | 'products' | 'categories' | 'tags' | 'users' | 'media';
  source?: string;
  categoryId?: string;
  tagId?: string;
  ids?: string[];
  count?: number;
  orderBy?: 'recent' | 'popular' | 'title' | 'random';
}

export interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  date: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image?: string;
  rating: number;
  inStock: boolean;
  category?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
  parentId?: string;
  image?: string;
}

export interface TagData {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  email?: string;
  social?: Record<string, string>;
}

// Example/fallback data
const EXAMPLE_POSTS: PostData[] = [
  { id: '1', title: 'Getting Started with RustPress', slug: 'getting-started', excerpt: 'Learn the basics of building your site...', date: '2024-12-20', categories: [{ id: '1', name: 'Tutorials', slug: 'tutorials' }], tags: [] },
  { id: '2', title: 'Advanced Theming Techniques', slug: 'advanced-theming', excerpt: 'Master the art of creating beautiful themes...', date: '2024-12-18', categories: [{ id: '2', name: 'Design', slug: 'design' }], tags: [] },
  { id: '3', title: 'Performance Optimization Guide', slug: 'performance-optimization', excerpt: 'Speed up your site with these tips...', date: '2024-12-15', categories: [{ id: '1', name: 'Tutorials', slug: 'tutorials' }], tags: [] },
  { id: '4', title: 'Building Custom Widgets', slug: 'custom-widgets', excerpt: 'Create powerful custom widgets...', date: '2024-12-12', categories: [{ id: '3', name: 'Development', slug: 'development' }], tags: [] },
];

const EXAMPLE_PRODUCTS: ProductData[] = [
  { id: '1', name: 'Premium Theme Bundle', slug: 'premium-theme', price: 99.00, salePrice: 79.00, rating: 4.8, inStock: true },
  { id: '2', name: 'Developer Toolkit Pro', slug: 'developer-toolkit', price: 149.00, rating: 4.9, inStock: true },
  { id: '3', name: 'SEO Optimization Pack', slug: 'seo-pack', price: 49.00, salePrice: 39.00, rating: 4.5, inStock: true },
  { id: '4', name: 'Security Suite', slug: 'security-suite', price: 79.00, rating: 4.7, inStock: true },
];

const EXAMPLE_CATEGORIES: CategoryData[] = [
  { id: '1', name: 'Technology', slug: 'technology', count: 24 },
  { id: '2', name: 'Design', slug: 'design', count: 18 },
  { id: '3', name: 'Business', slug: 'business', count: 15 },
  { id: '4', name: 'Marketing', slug: 'marketing', count: 12 },
  { id: '5', name: 'Development', slug: 'development', count: 21 },
  { id: '6', name: 'Tutorials', slug: 'tutorials', count: 30 },
];

const EXAMPLE_TAGS: TagData[] = [
  { id: '1', name: 'rust', slug: 'rust', count: 15 },
  { id: '2', name: 'web', slug: 'web', count: 22 },
  { id: '3', name: 'cms', slug: 'cms', count: 18 },
  { id: '4', name: 'frontend', slug: 'frontend', count: 25 },
  { id: '5', name: 'backend', slug: 'backend', count: 20 },
  { id: '6', name: 'api', slug: 'api', count: 14 },
  { id: '7', name: 'design', slug: 'design', count: 16 },
  { id: '8', name: 'ux', slug: 'ux', count: 11 },
];

const EXAMPLE_TEAM: TeamMemberData[] = [
  { id: '1', name: 'Alex Rivera', role: 'Lead Developer', bio: 'Full-stack developer with 10+ years experience', social: { twitter: '#', linkedin: '#', github: '#' } },
  { id: '2', name: 'Emma Wilson', role: 'UI/UX Designer', bio: 'Creating beautiful and intuitive interfaces', social: { twitter: '#', linkedin: '#', dribbble: '#' } },
  { id: '3', name: 'James Chen', role: 'Backend Engineer', bio: 'Rust enthusiast and performance optimizer', social: { twitter: '#', github: '#' } },
];

// Transform API response to widget data format
const transformPost = (post: Post): PostData => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  featuredImage: post.featured_image,
  date: post.created_at,
  author: undefined, // Author needs separate fetch - simplified for now
  categories: [], // Categories need separate fetch - simplified for now
  tags: [], // Tags need separate fetch - simplified for now
});

const transformCategory = (category: Taxonomy): CategoryData => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  count: category.count,
  parentId: category.parent_id,
});

const transformTag = (tag: Taxonomy): TagData => ({
  id: tag.id,
  name: tag.name,
  slug: tag.slug,
  count: tag.count,
});

const transformUser = (user: User): TeamMemberData => ({
  id: user.id,
  name: user.display_name,
  role: user.role,
  avatar: user.avatar,
  bio: undefined, // Bio not available in User type
  email: user.email,
});

// Hook to fetch posts for widgets
export function usePosts(config: {
  source?: 'recent' | 'popular' | 'category' | 'tag' | 'custom';
  categoryId?: string;
  tagId?: string;
  postIds?: string[];
  count?: number;
  enabled?: boolean;
}) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    if (config.enabled === false) {
      setPosts(EXAMPLE_POSTS.slice(0, config.count || 3));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        per_page: config.count || 5,
        status: 'published',
      };

      // Handle different sources
      // Note: category/tag filtering would need backend support
      // For now, we fetch recent posts and filter client-side if needed

      const response = await postsApi.getAll();
      const transformedPosts = response.data.map(transformPost);

      if (transformedPosts.length > 0) {
        setPosts(transformedPosts.slice(0, config.count || 5));
      } else {
        // Use example data if no posts found
        setPosts(EXAMPLE_POSTS.slice(0, config.count || 3));
      }
    } catch (err) {
      setError(err as Error);
      // Fallback to example data on error
      setPosts(EXAMPLE_POSTS.slice(0, config.count || 3));
    } finally {
      setIsLoading(false);
    }
  }, [config.source, config.categoryId, config.tagId, config.count, config.enabled]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, isLoading, error, refetch: fetchPosts };
}

// Hook to fetch categories for widgets
export function useCategories(config: {
  source?: 'all' | 'parent' | 'specific';
  ids?: string[];
  limit?: number;
  enabled?: boolean;
}) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    if (config.enabled === false) {
      setCategories(EXAMPLE_CATEGORIES.slice(0, config.limit || 6));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        per_page: config.limit || 10,
      };

      if (config.source === 'parent') {
        params.parent_id = null; // Only top-level categories
      }

      const response = await taxonomiesApi.getCategories();
      const transformedCategories = response.data.map(transformCategory);

      if (transformedCategories.length > 0) {
        setCategories(transformedCategories.slice(0, config.limit || 6));
      } else {
        setCategories(EXAMPLE_CATEGORIES.slice(0, config.limit || 6));
      }
    } catch (err) {
      setError(err as Error);
      setCategories(EXAMPLE_CATEGORIES.slice(0, config.limit || 6));
    } finally {
      setIsLoading(false);
    }
  }, [config.source, config.ids, config.limit, config.enabled]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}

// Hook to fetch tags for widgets
export function useTags(config: {
  source?: 'all' | 'popular' | 'specific';
  ids?: string[];
  limit?: number;
  enabled?: boolean;
}) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    if (config.enabled === false) {
      setTags(EXAMPLE_TAGS.slice(0, config.limit || 8));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        per_page: config.limit || 20,
      };

      const response = await taxonomiesApi.getTags();
      const transformedTags = response.data.map(transformTag);

      if (transformedTags.length > 0) {
        // Sort by count for "popular" source
        const sortedTags = config.source === 'popular'
          ? transformedTags.sort((a: TagData, b: TagData) => b.count - a.count)
          : transformedTags;
        setTags(sortedTags.slice(0, config.limit || 8));
      } else {
        setTags(EXAMPLE_TAGS.slice(0, config.limit || 8));
      }
    } catch (err) {
      setError(err as Error);
      setTags(EXAMPLE_TAGS.slice(0, config.limit || 8));
    } finally {
      setIsLoading(false);
    }
  }, [config.source, config.ids, config.limit, config.enabled]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, isLoading, error, refetch: fetchTags };
}

// Hook to fetch products for widgets (uses example data since product API may not exist yet)
export function useProducts(config: {
  source?: 'featured' | 'sale' | 'new' | 'bestseller' | 'category' | 'custom';
  categoryId?: string;
  productIds?: string[];
  count?: number;
  enabled?: boolean;
}) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    // For now, use example data since products API may not be implemented
    // This can be replaced with actual API call when available
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      let filteredProducts = [...EXAMPLE_PRODUCTS];

      // Filter based on source
      if (config.source === 'sale') {
        filteredProducts = filteredProducts.filter(p => p.salePrice);
      }

      setProducts(filteredProducts.slice(0, config.count || 4));
    } catch (err) {
      setError(err as Error);
      setProducts(EXAMPLE_PRODUCTS.slice(0, config.count || 4));
    } finally {
      setIsLoading(false);
    }
  }, [config.source, config.categoryId, config.productIds, config.count, config.enabled]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

// Hook to fetch team members for widgets
export function useTeamMembers(config: {
  role?: string;
  ids?: string[];
  count?: number;
  enabled?: boolean;
}) {
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (config.enabled === false) {
      setMembers(EXAMPLE_TEAM.slice(0, config.count || 3));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        per_page: config.count || 10,
        status: 'active',
      };

      if (config.role) {
        params.role = config.role;
      }

      const response = await usersApi.getAll();
      const transformedUsers = response.data.map(transformUser);

      if (transformedUsers.length > 0) {
        setMembers(transformedUsers.slice(0, config.count || 3));
      } else {
        setMembers(EXAMPLE_TEAM.slice(0, config.count || 3));
      }
    } catch (err) {
      setError(err as Error);
      setMembers(EXAMPLE_TEAM.slice(0, config.count || 3));
    } finally {
      setIsLoading(false);
    }
  }, [config.role, config.ids, config.count, config.enabled]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, isLoading, error, refetch: fetchMembers };
}

// Combined hook for fetching all mega menu data at once
export function useMegaMenuWidgetData(widgets: Array<{ type: string; config: any }>) {
  const [data, setData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const newData: Record<string, any> = {};

      // Identify unique data requirements
      const needsPosts = widgets.some(w => w.type === 'posts');
      const needsProducts = widgets.some(w => w.type === 'products');
      const needsCategories = widgets.some(w => w.type === 'categories');
      const needsTags = widgets.some(w => w.type === 'tags');

      const promises: Promise<void>[] = [];

      if (needsPosts) {
        promises.push(
          postsApi.getAll()
            .then((res: { data: Post[] }) => {
              newData.posts = res.data.map(transformPost);
            })
            .catch(() => {
              newData.posts = EXAMPLE_POSTS;
            })
        );
      }

      if (needsCategories) {
        promises.push(
          taxonomiesApi.getCategories()
            .then((res: { data: Taxonomy[] }) => {
              newData.categories = res.data.map(transformCategory);
            })
            .catch(() => {
              newData.categories = EXAMPLE_CATEGORIES;
            })
        );
      }

      if (needsTags) {
        promises.push(
          taxonomiesApi.getTags()
            .then((res: { data: Taxonomy[] }) => {
              newData.tags = res.data.map(transformTag);
            })
            .catch(() => {
              newData.tags = EXAMPLE_TAGS;
            })
        );
      }

      if (needsProducts) {
        // Use example data for products
        newData.products = EXAMPLE_PRODUCTS;
      }

      await Promise.all(promises);
      setData(newData);
      setIsLoading(false);
    };

    if (widgets.length > 0) {
      fetchAllData();
    }
  }, [widgets]);

  return { data, isLoading };
}

// Export example data for use in preview when no real data
export const FALLBACK_DATA = {
  posts: EXAMPLE_POSTS,
  products: EXAMPLE_PRODUCTS,
  categories: EXAMPLE_CATEGORIES,
  tags: EXAMPLE_TAGS,
  team: EXAMPLE_TEAM,
};
