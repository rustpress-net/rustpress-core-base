import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
  color?: string;
  featured?: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagGroup {
  id: string;
  name: string;
  tags: string[];
  color?: string;
}

export interface TagFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  featured: boolean;
}

export interface TagConfig {
  allowColors: boolean;
  allowDescriptions: boolean;
  allowFeatured: boolean;
  showCounts: boolean;
  confirmDelete: boolean;
  suggestSimilar: boolean;
  maxTagLength: number;
}

export type TagSortOption = 'name' | 'count' | 'created' | 'updated';
export type TagViewMode = 'list' | 'cloud' | 'grid';

interface TagManagerContextType {
  tags: Tag[];
  groups: TagGroup[];
  selectedTags: string[];
  editingTag: Tag | null;
  searchQuery: string;
  sortBy: TagSortOption;
  sortDirection: 'asc' | 'desc';
  viewMode: TagViewMode;
  config: TagConfig;
  filteredTags: Tag[];
  setSelectedTags: (ids: string[]) => void;
  toggleTagSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setEditingTag: (tag: Tag | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: TagSortOption) => void;
  setSortDirection: (dir: 'asc' | 'desc') => void;
  setViewMode: (mode: TagViewMode) => void;
  addTag: (data: TagFormData) => void;
  updateTag: (id: string, data: Partial<TagFormData>) => void;
  deleteTag: (id: string) => void;
  deleteTags: (ids: string[]) => void;
  mergeTags: (sourceIds: string[], targetId: string) => void;
  toggleFeatured: (id: string) => void;
  getSimilarTags: (name: string) => Tag[];
  addGroup: (name: string, tagIds: string[]) => void;
  removeGroup: (id: string) => void;
  addTagToGroup: (tagId: string, groupId: string) => void;
  removeTagFromGroup: (tagId: string, groupId: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const TagManagerContext = createContext<TagManagerContextType | null>(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// ============================================================================
// PROVIDER
// ============================================================================

interface TagManagerProviderProps {
  children: ReactNode;
  initialTags?: Tag[];
  initialGroups?: TagGroup[];
  initialConfig?: Partial<TagConfig>;
  onTagChange?: (tags: Tag[]) => void;
}

const defaultConfig: TagConfig = {
  allowColors: true,
  allowDescriptions: true,
  allowFeatured: true,
  showCounts: true,
  confirmDelete: true,
  suggestSimilar: true,
  maxTagLength: 50,
};

export const TagManagerProvider: React.FC<TagManagerProviderProps> = ({
  children,
  initialTags = [],
  initialGroups = [],
  initialConfig = {},
  onTagChange,
}) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [groups, setGroups] = useState<TagGroup[]>(initialGroups);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TagSortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<TagViewMode>('list');
  const config = { ...defaultConfig, ...initialConfig };

  const filteredTags = useMemo(() => {
    let result = [...tags];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(query) ||
        tag.slug.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tags, searchQuery, sortBy, sortDirection]);

  const toggleTagSelection = useCallback((id: string) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedTags(filteredTags.map(t => t.id));
  }, [filteredTags]);

  const deselectAll = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const addTag = useCallback((data: TagFormData) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name.slice(0, config.maxTagLength),
      slug: data.slug || generateSlug(data.name),
      description: data.description,
      count: 0,
      color: data.color,
      featured: data.featured,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTags(prev => {
      const updated = [...prev, newTag];
      onTagChange?.(updated);
      return updated;
    });
  }, [config.maxTagLength, onTagChange]);

  const updateTag = useCallback((id: string, data: Partial<TagFormData>) => {
    setTags(prev => {
      const updated = prev.map(tag =>
        tag.id === id
          ? {
              ...tag,
              ...data,
              name: data.name ? data.name.slice(0, config.maxTagLength) : tag.name,
              slug: data.slug || (data.name ? generateSlug(data.name) : tag.slug),
              updatedAt: new Date(),
            }
          : tag
      );
      onTagChange?.(updated);
      return updated;
    });
  }, [config.maxTagLength, onTagChange]);

  const deleteTag = useCallback((id: string) => {
    setTags(prev => {
      const updated = prev.filter(tag => tag.id !== id);
      onTagChange?.(updated);
      return updated;
    });
    setSelectedTags(prev => prev.filter(i => i !== id));
    setGroups(prev =>
      prev.map(g => ({ ...g, tags: g.tags.filter(t => t !== id) }))
    );
  }, [onTagChange]);

  const deleteTags = useCallback((ids: string[]) => {
    setTags(prev => {
      const updated = prev.filter(tag => !ids.includes(tag.id));
      onTagChange?.(updated);
      return updated;
    });
    setSelectedTags([]);
    setGroups(prev =>
      prev.map(g => ({ ...g, tags: g.tags.filter(t => !ids.includes(t)) }))
    );
  }, [onTagChange]);

  const mergeTags = useCallback((sourceIds: string[], targetId: string) => {
    setTags(prev => {
      const sources = prev.filter(t => sourceIds.includes(t.id));
      const totalCount = sources.reduce((sum, t) => sum + t.count, 0);

      const updated = prev
        .filter(tag => !sourceIds.includes(tag.id))
        .map(tag =>
          tag.id === targetId
            ? { ...tag, count: tag.count + totalCount, updatedAt: new Date() }
            : tag
        );

      onTagChange?.(updated);
      return updated;
    });

    setSelectedTags([]);
  }, [onTagChange]);

  const toggleFeatured = useCallback((id: string) => {
    setTags(prev => {
      const updated = prev.map(tag =>
        tag.id === id
          ? { ...tag, featured: !tag.featured, updatedAt: new Date() }
          : tag
      );
      onTagChange?.(updated);
      return updated;
    });
  }, [onTagChange]);

  const getSimilarTags = useCallback((name: string): Tag[] => {
    if (!config.suggestSimilar || name.length < 2) return [];

    const normalized = name.toLowerCase();
    return tags
      .filter(tag => {
        const distance = levenshteinDistance(normalized, tag.name.toLowerCase());
        return distance <= 3 && distance > 0;
      })
      .sort((a, b) => {
        const distA = levenshteinDistance(normalized, a.name.toLowerCase());
        const distB = levenshteinDistance(normalized, b.name.toLowerCase());
        return distA - distB;
      })
      .slice(0, 5);
  }, [tags, config.suggestSimilar]);

  const addGroup = useCallback((name: string, tagIds: string[]) => {
    const newGroup: TagGroup = {
      id: `group-${Date.now()}`,
      name,
      tags: tagIds,
    };
    setGroups(prev => [...prev, newGroup]);
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const addTagToGroup = useCallback((tagId: string, groupId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId && !g.tags.includes(tagId)
          ? { ...g, tags: [...g.tags, tagId] }
          : g
      )
    );
  }, []);

  const removeTagFromGroup = useCallback((tagId: string, groupId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, tags: g.tags.filter(t => t !== tagId) } : g
      )
    );
  }, []);

  const value: TagManagerContextType = {
    tags,
    groups,
    selectedTags,
    editingTag,
    searchQuery,
    sortBy,
    sortDirection,
    viewMode,
    config,
    filteredTags,
    setSelectedTags,
    toggleTagSelection,
    selectAll,
    deselectAll,
    setEditingTag,
    setSearchQuery,
    setSortBy,
    setSortDirection,
    setViewMode,
    addTag,
    updateTag,
    deleteTag,
    deleteTags,
    mergeTags,
    toggleFeatured,
    getSimilarTags,
    addGroup,
    removeGroup,
    addTagToGroup,
    removeTagFromGroup,
  };

  return (
    <TagManagerContext.Provider value={value}>
      {children}
    </TagManagerContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTagManager = (): TagManagerContextType => {
  const context = useContext(TagManagerContext);
  if (!context) {
    throw new Error('useTagManager must be used within TagManagerProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
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
    padding: '0.625rem 1rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
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
  viewToggle: {
    display: 'flex',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  viewButton: {
    padding: '0.5rem 0.75rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
  },
  selectionCount: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#0369a1',
  },
  tagList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  tagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    transition: 'all 0.15s',
  },
  tagItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    width: '1.125rem',
    height: '1.125rem',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  tagColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  tagName: {
    flex: 1,
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  tagSlug: {
    fontSize: '0.8125rem',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  tagCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  featuredStar: {
    color: '#f59e0b',
    cursor: 'pointer',
  },
  tagCloud: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
    padding: '1rem',
  },
  cloudTag: {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
  },
  cloudTagSelected: {
    borderColor: '#3b82f6',
  },
  tagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  tagCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tagCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
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
  colorPicker: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  colorOption: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s',
  },
  colorOptionSelected: {
    borderColor: '#1e293b',
    transform: 'scale(1.1)',
  },
  similarTags: {
    padding: '0.75rem',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '0.8125rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
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
  mergeModal: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
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
};

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

// ============================================================================
// TAG TOOLBAR
// ============================================================================

export const TagToolbar: React.FC = () => {
  const { searchQuery, setSearchQuery, sortBy, setSortBy, sortDirection, setSortDirection, viewMode, setViewMode } = useTagManager();

  return (
    <div style={styles.toolbar}>
      <input
        type="text"
        placeholder="Search tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as TagSortOption)}
        style={styles.select}
      >
        <option value="name">Sort by Name</option>
        <option value="count">Sort by Count</option>
        <option value="created">Sort by Created</option>
        <option value="updated">Sort by Updated</option>
      </select>

      <button
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        style={{ ...styles.button, ...styles.secondaryButton }}
        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {sortDirection === 'asc' ? (
            <path d="M12 5v14M5 12l7-7 7 7" />
          ) : (
            <path d="M12 5v14M5 12l7 7 7-7" />
          )}
        </svg>
      </button>

      <div style={styles.viewToggle}>
        {(['list', 'cloud', 'grid'] as TagViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              ...styles.viewButton,
              ...(viewMode === mode ? styles.viewButtonActive : {}),
            }}
            title={mode.charAt(0).toUpperCase() + mode.slice(1)}
          >
            {mode === 'list' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            )}
            {mode === 'cloud' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            )}
            {mode === 'grid' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// BULK ACTIONS
// ============================================================================

export const TagBulkActions: React.FC = () => {
  const { selectedTags, selectAll, deselectAll, deleteTags, filteredTags, tags } = useTagManager();
  const [showMergeModal, setShowMergeModal] = useState(false);

  if (selectedTags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={styles.bulkActions}
    >
      <span style={styles.selectionCount}>
        {selectedTags.length} of {filteredTags.length} selected
      </span>

      <button onClick={selectAll} style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}>
        Select All
      </button>

      <button onClick={deselectAll} style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}>
        Clear
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }} />

      {selectedTags.length >= 2 && (
        <button
          onClick={() => setShowMergeModal(true)}
          style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
        >
          Merge Tags
        </button>
      )}

      <button
        onClick={() => deleteTags(selectedTags)}
        style={{ ...styles.button, ...styles.dangerButton, padding: '0.375rem 0.75rem' }}
      >
        Delete Selected
      </button>

      {showMergeModal && (
        <MergeTagsModal
          tagIds={selectedTags}
          onClose={() => setShowMergeModal(false)}
        />
      )}
    </motion.div>
  );
};

// ============================================================================
// MERGE TAGS MODAL
// ============================================================================

interface MergeTagsModalProps {
  tagIds: string[];
  onClose: () => void;
}

const MergeTagsModal: React.FC<MergeTagsModalProps> = ({ tagIds, onClose }) => {
  const { tags, mergeTags } = useTagManager();
  const [targetId, setTargetId] = useState(tagIds[0]);

  const selectedTags = tags.filter(t => tagIds.includes(t.id));

  const handleMerge = () => {
    const sourceIds = tagIds.filter(id => id !== targetId);
    mergeTags(sourceIds, targetId);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        ...styles.mergeModal,
      }}
    >
      <h3 style={{ ...styles.title, marginBottom: '1rem' }}>Merge Tags</h3>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Select the target tag. All other selected tags will be merged into it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {selectedTags.map(tag => (
          <label
            key={tag.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: targetId === tag.id ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${targetId === tag.id ? '#3b82f6' : '#e2e8f0'}`,
            }}
          >
            <input
              type="radio"
              name="targetTag"
              value={tag.id}
              checked={targetId === tag.id}
              onChange={() => setTargetId(tag.id)}
            />
            <span style={styles.tagName}>{tag.name}</span>
            <span style={styles.tagCount}>{tag.count} posts</span>
          </label>
        ))}
      </div>

      <div style={styles.actions}>
        <button onClick={handleMerge} style={{ ...styles.button, ...styles.primaryButton }}>
          Merge Tags
        </button>
        <button onClick={onClose} style={{ ...styles.button, ...styles.secondaryButton }}>
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TAG LIST VIEW
// ============================================================================

export const TagListView: React.FC = () => {
  const { filteredTags, selectedTags, toggleTagSelection, toggleFeatured, setEditingTag, deleteTag, config } = useTagManager();

  if (filteredTags.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🏷️</div>
        <p>No tags found</p>
      </div>
    );
  }

  return (
    <div style={styles.tagList}>
      {filteredTags.map(tag => {
        const isSelected = selectedTags.includes(tag.id);

        return (
          <motion.div
            key={tag.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              ...styles.tagItem,
              ...(isSelected ? styles.tagItemSelected : {}),
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleTagSelection(tag.id)}
              style={styles.checkbox}
            />

            {tag.color && <div style={{ ...styles.tagColor, backgroundColor: tag.color }} />}

            <span style={styles.tagName}>{tag.name}</span>
            <span style={styles.tagSlug}>/{tag.slug}</span>

            {config.allowFeatured && (
              <button
                onClick={() => toggleFeatured(tag.id)}
                style={{ ...styles.iconButton, ...styles.featuredStar }}
                title={tag.featured ? 'Remove from featured' : 'Mark as featured'}
              >
                {tag.featured ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                )}
              </button>
            )}

            {config.showCounts && (
              <span style={styles.tagCount}>{tag.count}</span>
            )}

            <button
              onClick={() => setEditingTag(tag)}
              style={styles.iconButton}
              title="Edit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            <button
              onClick={() => deleteTag(tag.id)}
              style={{ ...styles.iconButton, color: '#dc2626' }}
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================================
// TAG CLOUD VIEW
// ============================================================================

export const TagCloudView: React.FC = () => {
  const { filteredTags, selectedTags, toggleTagSelection, tags } = useTagManager();

  const maxCount = Math.max(...tags.map(t => t.count), 1);
  const minCount = Math.min(...tags.map(t => t.count), 0);

  const getSize = (count: number): number => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    return 0.75 + ratio * 1;
  };

  if (filteredTags.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🏷️</div>
        <p>No tags found</p>
      </div>
    );
  }

  return (
    <div style={styles.tagCloud}>
      {filteredTags.map(tag => {
        const isSelected = selectedTags.includes(tag.id);
        const size = getSize(tag.count);

        return (
          <motion.button
            key={tag.id}
            onClick={() => toggleTagSelection(tag.id)}
            style={{
              ...styles.cloudTag,
              ...(isSelected ? styles.cloudTagSelected : {}),
              backgroundColor: tag.color || '#e2e8f0',
              color: tag.color ? '#ffffff' : '#475569',
              fontSize: `${size}rem`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tag.name}
            <span style={{ marginLeft: '0.25rem', opacity: 0.7 }}>({tag.count})</span>
          </motion.button>
        );
      })}
    </div>
  );
};

// ============================================================================
// TAG GRID VIEW
// ============================================================================

export const TagGridView: React.FC = () => {
  const { filteredTags, selectedTags, toggleTagSelection, config } = useTagManager();

  if (filteredTags.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🏷️</div>
        <p>No tags found</p>
      </div>
    );
  }

  return (
    <div style={styles.tagGrid}>
      {filteredTags.map(tag => {
        const isSelected = selectedTags.includes(tag.id);

        return (
          <motion.div
            key={tag.id}
            onClick={() => toggleTagSelection(tag.id)}
            style={{
              ...styles.tagCard,
              ...(isSelected ? styles.tagCardSelected : {}),
              borderTopColor: tag.color || '#e2e8f0',
              borderTopWidth: '3px',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={styles.tagName}>{tag.name}</span>
              {tag.featured && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              )}
            </div>
            <span style={styles.tagSlug}>/{tag.slug}</span>
            {config.showCounts && (
              <span style={{ ...styles.tagCount, marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                {tag.count} posts
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================================
// TAG FORM
// ============================================================================

interface TagFormProps {
  onCancel?: () => void;
}

export const TagForm: React.FC<TagFormProps> = ({ onCancel }) => {
  const { editingTag, addTag, updateTag, setEditingTag, getSimilarTags, config } = useTagManager();

  const [formData, setFormData] = useState<TagFormData>({
    name: editingTag?.name || '',
    slug: editingTag?.slug || '',
    description: editingTag?.description || '',
    color: editingTag?.color || colors[0],
    featured: editingTag?.featured || false,
  });

  const similarTags = getSimilarTags(formData.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTag) {
      updateTag(editingTag.id, formData);
    } else {
      addTag(formData);
    }

    setEditingTag(null);
    onCancel?.();
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: colors[0],
      featured: false,
    });
  };

  const handleCancel = () => {
    setEditingTag(null);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ ...styles.title, marginBottom: '0.5rem' }}>
        {editingTag ? 'Edit Tag' : 'Add Tag'}
      </h3>

      <div style={styles.formRow}>
        <div style={{ ...styles.formGroup, flex: 1 }}>
          <label style={styles.label}>Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.input}
            placeholder="Tag name"
            maxLength={config.maxTagLength}
            required
          />
        </div>

        <div style={{ ...styles.formGroup, flex: 1 }}>
          <label style={styles.label}>Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            style={styles.input}
            placeholder={generateSlug(formData.name) || 'auto-generated'}
          />
        </div>
      </div>

      {similarTags.length > 0 && !editingTag && (
        <div style={styles.similarTags}>
          <strong>Similar tags exist:</strong> {similarTags.map(t => t.name).join(', ')}
        </div>
      )}

      {config.allowDescriptions && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={styles.textarea}
            placeholder="Optional description"
          />
        </div>
      )}

      {config.allowColors && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Color</label>
          <div style={styles.colorPicker}>
            {colors.map(color => (
              <div
                key={color}
                style={{
                  ...styles.colorOption,
                  backgroundColor: color,
                  ...(formData.color === color ? styles.colorOptionSelected : {}),
                }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </div>
        </div>
      )}

      {config.allowFeatured && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          />
          <span style={styles.label}>Featured tag</span>
        </label>
      )}

      <div style={styles.actions}>
        <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
          {editingTag ? 'Update' : 'Add'} Tag
        </button>
        <button type="button" onClick={handleCancel} style={{ ...styles.button, ...styles.secondaryButton }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TagManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { viewMode, editingTag, setEditingTag } = useTagManager();

  const handleAddNew = () => {
    setEditingTag(null);
    setShowForm(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tags</h2>
        <button onClick={handleAddNew} style={{ ...styles.button, ...styles.primaryButton }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Tag
        </button>
      </div>

      <TagToolbar />

      <TagBulkActions />

      <AnimatePresence mode="wait">
        {(showForm || editingTag) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TagForm onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'list' && <TagListView />}
      {viewMode === 'cloud' && <TagCloudView />}
      {viewMode === 'grid' && <TagGridView />}
    </div>
  );
};

export default TagManager;
