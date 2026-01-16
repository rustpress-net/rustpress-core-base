import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SeriesStatus = 'active' | 'completed' | 'paused' | 'draft';

export interface SeriesPost {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  excerpt?: string;
  thumbnail?: string;
  readTime?: number;
  order: number;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: SeriesStatus;
  coverImage?: string;
  color?: string;
  posts: SeriesPost[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
    nextPostDate?: Date;
    dayOfWeek?: number;
  };
  settings: {
    showTableOfContents: boolean;
    showProgress: boolean;
    showNavigation: boolean;
    allowComments: boolean;
    notifySubscribers: boolean;
  };
  subscribers: number;
  totalViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeriesConfig {
  maxPostsPerSeries: number;
  allowScheduling: boolean;
  allowSubscriptions: boolean;
  showAnalytics: boolean;
}

interface SeriesManagerContextType {
  series: Series[];
  selectedSeries: Series | null;
  editingSeries: Series | null;
  searchQuery: string;
  filterStatus: SeriesStatus | 'all';
  config: SeriesConfig;
  setSelectedSeries: (series: Series | null) => void;
  setEditingSeries: (series: Series | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: SeriesStatus | 'all') => void;
  addSeries: (data: Omit<Series, 'id' | 'posts' | 'subscribers' | 'totalViews' | 'createdAt' | 'updatedAt'>) => void;
  updateSeries: (id: string, updates: Partial<Series>) => void;
  deleteSeries: (id: string) => void;
  addPostToSeries: (seriesId: string, post: Omit<SeriesPost, 'order'>) => void;
  removePostFromSeries: (seriesId: string, postId: string) => void;
  reorderPosts: (seriesId: string, posts: SeriesPost[]) => void;
  updateSeriesSettings: (seriesId: string, settings: Partial<Series['settings']>) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SeriesManagerContext = createContext<SeriesManagerContextType | null>(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// ============================================================================
// PROVIDER
// ============================================================================

interface SeriesManagerProviderProps {
  children: ReactNode;
  initialSeries?: Series[];
  initialConfig?: Partial<SeriesConfig>;
  onSeriesChange?: (series: Series[]) => void;
}

const defaultConfig: SeriesConfig = {
  maxPostsPerSeries: 50,
  allowScheduling: true,
  allowSubscriptions: true,
  showAnalytics: true,
};

export const SeriesManagerProvider: React.FC<SeriesManagerProviderProps> = ({
  children,
  initialSeries = [],
  initialConfig = {},
  onSeriesChange,
}) => {
  const [series, setSeries] = useState<Series[]>(initialSeries);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SeriesStatus | 'all'>('all');
  const config = { ...defaultConfig, ...initialConfig };

  const addSeries = useCallback((data: Omit<Series, 'id' | 'posts' | 'subscribers' | 'totalViews' | 'createdAt' | 'updatedAt'>) => {
    const newSeries: Series = {
      ...data,
      id: `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      posts: [],
      subscribers: 0,
      totalViews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSeries(prev => {
      const updated = [...prev, newSeries];
      onSeriesChange?.(updated);
      return updated;
    });
  }, [onSeriesChange]);

  const updateSeries = useCallback((id: string, updates: Partial<Series>) => {
    setSeries(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      );
      onSeriesChange?.(updated);
      return updated;
    });

    if (selectedSeries?.id === id) {
      setSelectedSeries(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedSeries, onSeriesChange]);

  const deleteSeries = useCallback((id: string) => {
    setSeries(prev => {
      const updated = prev.filter(s => s.id !== id);
      onSeriesChange?.(updated);
      return updated;
    });

    if (selectedSeries?.id === id) {
      setSelectedSeries(null);
    }
  }, [selectedSeries, onSeriesChange]);

  const addPostToSeries = useCallback((seriesId: string, post: Omit<SeriesPost, 'order'>) => {
    setSeries(prev => {
      const updated = prev.map(s => {
        if (s.id !== seriesId) return s;
        if (s.posts.length >= config.maxPostsPerSeries) return s;

        const newPost: SeriesPost = {
          ...post,
          order: s.posts.length,
        };

        return {
          ...s,
          posts: [...s.posts, newPost],
          updatedAt: new Date(),
        };
      });
      onSeriesChange?.(updated);
      return updated;
    });
  }, [config.maxPostsPerSeries, onSeriesChange]);

  const removePostFromSeries = useCallback((seriesId: string, postId: string) => {
    setSeries(prev => {
      const updated = prev.map(s => {
        if (s.id !== seriesId) return s;

        const posts = s.posts
          .filter(p => p.id !== postId)
          .map((p, idx) => ({ ...p, order: idx }));

        return { ...s, posts, updatedAt: new Date() };
      });
      onSeriesChange?.(updated);
      return updated;
    });
  }, [onSeriesChange]);

  const reorderPosts = useCallback((seriesId: string, posts: SeriesPost[]) => {
    setSeries(prev => {
      const updated = prev.map(s => {
        if (s.id !== seriesId) return s;

        const reorderedPosts = posts.map((p, idx) => ({ ...p, order: idx }));
        return { ...s, posts: reorderedPosts, updatedAt: new Date() };
      });
      onSeriesChange?.(updated);
      return updated;
    });
  }, [onSeriesChange]);

  const updateSeriesSettings = useCallback((seriesId: string, settings: Partial<Series['settings']>) => {
    updateSeries(seriesId, {
      settings: {
        ...series.find(s => s.id === seriesId)?.settings!,
        ...settings,
      },
    });
  }, [series, updateSeries]);

  const value: SeriesManagerContextType = {
    series,
    selectedSeries,
    editingSeries,
    searchQuery,
    filterStatus,
    config,
    setSelectedSeries,
    setEditingSeries,
    setSearchQuery,
    setFilterStatus,
    addSeries,
    updateSeries,
    deleteSeries,
    addPostToSeries,
    removePostFromSeries,
    reorderPosts,
    updateSeriesSettings,
  };

  return (
    <SeriesManagerContext.Provider value={value}>
      {children}
    </SeriesManagerContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSeriesManager = (): SeriesManagerContextType => {
  const context = useContext(SeriesManagerContext);
  if (!context) {
    throw new Error('useSeriesManager must be used within SeriesManagerProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    minHeight: '600px',
  },
  sidebar: {
    flex: '0 0 320px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    borderRight: '1px solid #e2e8f0',
    paddingRight: '1.5rem',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    padding: '0.625rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  select: {
    padding: '0.625rem 2rem 0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.875rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  seriesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    flex: 1,
    overflowY: 'auto' as const,
  },
  seriesCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  seriesCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  seriesCover: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    objectFit: 'cover' as const,
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  seriesInfo: {
    flex: 1,
    minWidth: 0,
  },
  seriesTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  seriesMeta: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  statusColors: {
    active: { backgroundColor: '#dcfce7', color: '#16a34a' },
    completed: { backgroundColor: '#dbeafe', color: '#2563eb' },
    paused: { backgroundColor: '#fef3c7', color: '#d97706' },
    draft: { backgroundColor: '#f1f5f9', color: '#64748b' },
  },
  panel: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  textarea: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  postList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  postItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'grab',
  },
  postNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  postInfo: {
    flex: 1,
    minWidth: 0,
  },
  postTitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  postMeta: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  dragHandle: {
    color: '#94a3b8',
    cursor: 'grab',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center' as const,
    color: '#64748b',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  toggle: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleKnob: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  toggleKnobActive: {
    transform: 'translateX(20px)',
  },
};

// ============================================================================
// SERIES LIST
// ============================================================================

export const SeriesList: React.FC = () => {
  const { series, selectedSeries, setSelectedSeries, searchQuery, filterStatus } = useSeriesManager();

  const filteredSeries = useMemo(() => {
    return series.filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [series, searchQuery, filterStatus]);

  return (
    <div style={styles.seriesList}>
      {filteredSeries.length === 0 ? (
        <div style={{ ...styles.emptyState, padding: '2rem' }}>
          <p>No series found</p>
        </div>
      ) : (
        filteredSeries.map(s => {
          const isSelected = selectedSeries?.id === s.id;
          const publishedCount = s.posts.filter(p => p.status === 'published').length;

          return (
            <motion.div
              key={s.id}
              onClick={() => setSelectedSeries(s)}
              style={{
                ...styles.seriesCard,
                ...(isSelected ? styles.seriesCardSelected : {}),
                backgroundColor: isSelected ? '#eff6ff' : 'transparent',
              }}
              whileHover={{ backgroundColor: isSelected ? '#eff6ff' : '#f8fafc' }}
            >
              {s.coverImage ? (
                <img src={s.coverImage} alt="" style={styles.seriesCover as React.CSSProperties} />
              ) : (
                <div style={{ ...styles.seriesCover, backgroundColor: s.color || '#f1f5f9' }}>
                  📚
                </div>
              )}

              <div style={styles.seriesInfo}>
                <div style={styles.seriesTitle}>{s.title}</div>
                <div style={styles.seriesMeta}>
                  <span>{publishedCount}/{s.posts.length} parts</span>
                  <span>•</span>
                  <span>{s.subscribers} subscribers</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${s.posts.length > 0 ? (publishedCount / s.posts.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <span style={{ ...styles.statusBadge, ...styles.statusColors[s.status] }}>
                {s.status}
              </span>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

// ============================================================================
// SERIES FORM
// ============================================================================

interface SeriesFormProps {
  onCancel?: () => void;
}

export const SeriesForm: React.FC<SeriesFormProps> = ({ onCancel }) => {
  const { editingSeries, addSeries, updateSeries, setEditingSeries } = useSeriesManager();

  const [formData, setFormData] = useState({
    title: editingSeries?.title || '',
    slug: editingSeries?.slug || '',
    description: editingSeries?.description || '',
    status: editingSeries?.status || 'draft' as SeriesStatus,
    color: editingSeries?.color || '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const seriesData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      description: formData.description,
      status: formData.status,
      color: formData.color,
      author: editingSeries?.author || { id: 'current', name: 'Current User' },
      settings: editingSeries?.settings || {
        showTableOfContents: true,
        showProgress: true,
        showNavigation: true,
        allowComments: true,
        notifySubscribers: true,
      },
    };

    if (editingSeries) {
      updateSeries(editingSeries.id, seriesData);
    } else {
      addSeries(seriesData);
    }

    setEditingSeries(null);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ ...styles.title, marginBottom: '0.5rem' }}>
        {editingSeries ? 'Edit Series' : 'Create Series'}
      </h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={styles.input}
          placeholder="e.g., Getting Started with React"
          required
        />
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            style={styles.input}
            placeholder={generateSlug(formData.title) || 'auto-generated'}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as SeriesStatus })}
            style={styles.select}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={styles.textarea}
          placeholder="What is this series about?"
        />
      </div>

      <div style={styles.actions}>
        <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
          {editingSeries ? 'Update' : 'Create'} Series
        </button>
        <button type="button" onClick={onCancel} style={{ ...styles.button, ...styles.secondaryButton }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// SERIES POSTS
// ============================================================================

export const SeriesPosts: React.FC = () => {
  const { selectedSeries, reorderPosts, removePostFromSeries } = useSeriesManager();

  if (!selectedSeries || selectedSeries.posts.length === 0) {
    return (
      <div style={{ ...styles.emptyState, padding: '2rem' }}>
        <p>No posts in this series yet</p>
      </div>
    );
  }

  const sortedPosts = [...selectedSeries.posts].sort((a, b) => a.order - b.order);

  return (
    <Reorder.Group
      axis="y"
      values={sortedPosts}
      onReorder={(posts) => reorderPosts(selectedSeries.id, posts)}
      style={styles.postList}
    >
      {sortedPosts.map((post, index) => (
        <Reorder.Item key={post.id} value={post}>
          <motion.div style={styles.postItem}>
            <div style={styles.dragHandle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="8" cy="6" r="2" />
                <circle cx="16" cy="6" r="2" />
                <circle cx="8" cy="12" r="2" />
                <circle cx="16" cy="12" r="2" />
                <circle cx="8" cy="18" r="2" />
                <circle cx="16" cy="18" r="2" />
              </svg>
            </div>

            <div style={styles.postNumber}>{index + 1}</div>

            <div style={styles.postInfo}>
              <div style={styles.postTitle}>{post.title}</div>
              <div style={styles.postMeta}>
                {post.status === 'published' ? (
                  <span>Published {new Date(post.publishedAt!).toLocaleDateString()}</span>
                ) : post.status === 'scheduled' ? (
                  <span>Scheduled for {new Date(post.scheduledAt!).toLocaleDateString()}</span>
                ) : (
                  <span>Draft</span>
                )}
                {post.readTime && <span> • {post.readTime} min read</span>}
              </div>
            </div>

            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: post.status === 'published' ? '#dcfce7' : post.status === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                color: post.status === 'published' ? '#16a34a' : post.status === 'scheduled' ? '#2563eb' : '#64748b',
              }}
            >
              {post.status}
            </span>

            <button
              onClick={() => removePostFromSeries(selectedSeries.id, post.id)}
              style={{ ...styles.iconButton, color: '#dc2626' }}
              title="Remove from series"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

// ============================================================================
// SERIES SETTINGS
// ============================================================================

export const SeriesSettings: React.FC = () => {
  const { selectedSeries, updateSeriesSettings } = useSeriesManager();

  if (!selectedSeries) return null;

  const settings = [
    { key: 'showTableOfContents', label: 'Show Table of Contents' },
    { key: 'showProgress', label: 'Show Progress Indicator' },
    { key: 'showNavigation', label: 'Show Navigation Links' },
    { key: 'allowComments', label: 'Allow Comments' },
    { key: 'notifySubscribers', label: 'Notify Subscribers' },
  ] as const;

  return (
    <div style={styles.settingsGrid}>
      {settings.map(({ key, label }) => (
        <div key={key} style={styles.settingItem}>
          <span style={styles.label}>{label}</span>
          <div
            style={{
              ...styles.toggle,
              ...(selectedSeries.settings[key] ? styles.toggleActive : {}),
            }}
            onClick={() => updateSeriesSettings(selectedSeries.id, { [key]: !selectedSeries.settings[key] })}
          >
            <div
              style={{
                ...styles.toggleKnob,
                ...(selectedSeries.settings[key] ? styles.toggleKnobActive : {}),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SERIES STATS
// ============================================================================

export const SeriesStats: React.FC = () => {
  const { selectedSeries, config } = useSeriesManager();

  if (!selectedSeries || !config.showAnalytics) return null;

  const publishedCount = selectedSeries.posts.filter(p => p.status === 'published').length;
  const completionRate = selectedSeries.posts.length > 0
    ? Math.round((publishedCount / selectedSeries.posts.length) * 100)
    : 0;

  return (
    <div style={styles.stats}>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{selectedSeries.posts.length}</div>
        <div style={styles.statLabel}>Total Parts</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{selectedSeries.subscribers}</div>
        <div style={styles.statLabel}>Subscribers</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{selectedSeries.totalViews.toLocaleString()}</div>
        <div style={styles.statLabel}>Total Views</div>
      </div>
    </div>
  );
};

// ============================================================================
// SERIES DETAILS
// ============================================================================

export const SeriesDetails: React.FC = () => {
  const { selectedSeries, setEditingSeries, deleteSeries } = useSeriesManager();
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');

  if (!selectedSeries) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📚</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Select a Series</h3>
        <p style={{ margin: 0 }}>Choose a series from the list or create a new one</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...styles.header, marginBottom: '1rem' }}>
        <div>
          <h2 style={{ ...styles.title, marginBottom: '0.25rem' }}>{selectedSeries.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            /{selectedSeries.slug}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setEditingSeries(selectedSeries)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Edit
          </button>
          <button
            onClick={() => deleteSeries(selectedSeries.id)}
            style={{ ...styles.button, ...styles.dangerButton }}
          >
            Delete
          </button>
        </div>
      </div>

      <SeriesStats />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            background: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: activeTab === 'posts' ? '#3b82f6' : '#64748b',
            borderBottom: `2px solid ${activeTab === 'posts' ? '#3b82f6' : 'transparent'}`,
            cursor: 'pointer',
          }}
        >
          Posts ({selectedSeries.posts.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            background: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: activeTab === 'settings' ? '#3b82f6' : '#64748b',
            borderBottom: `2px solid ${activeTab === 'settings' ? '#3b82f6' : 'transparent'}`,
            cursor: 'pointer',
          }}
        >
          Settings
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'posts' ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SeriesPosts />
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SeriesSettings />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SeriesManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { editingSeries, setEditingSeries, searchQuery, setSearchQuery, filterStatus, setFilterStatus } = useSeriesManager();

  const handleAddNew = () => {
    setEditingSeries(null);
    setShowForm(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <h2 style={styles.title}>Series</h2>
          <button onClick={handleAddNew} style={{ ...styles.button, ...styles.primaryButton }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </div>

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SeriesStatus | 'all')}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>

        <SeriesList />
      </div>

      <div style={styles.main}>
        <AnimatePresence mode="wait">
          {(showForm || editingSeries) ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={styles.panel}>
                <SeriesForm onCancel={() => { setShowForm(false); setEditingSeries(null); }} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SeriesDetails />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SeriesManager;
