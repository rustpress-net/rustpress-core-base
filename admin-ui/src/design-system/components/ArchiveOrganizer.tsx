import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ArchiveGroupBy = 'year' | 'month' | 'category' | 'author' | 'type';
export type ArchiveViewMode = 'list' | 'grid' | 'timeline';
export type ContentStatus = 'published' | 'draft' | 'pending' | 'private' | 'trash';
export type ContentType = 'post' | 'page' | 'product' | 'event' | 'media';

export interface ArchiveItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  date: Date;
  modifiedDate: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories: string[];
  tags: string[];
  thumbnail?: string;
  excerpt?: string;
  wordCount?: number;
  views?: number;
  comments?: number;
}

export interface ArchiveGroup {
  id: string;
  label: string;
  count: number;
  items: ArchiveItem[];
  expanded: boolean;
}

export interface ArchiveStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  private: number;
  trash: number;
  byYear: { year: number; count: number }[];
  byType: { type: ContentType; count: number }[];
  byAuthor: { authorId: string; authorName: string; count: number }[];
}

export interface ArchiveConfig {
  groupBy: ArchiveGroupBy;
  viewMode: ArchiveViewMode;
  showStats: boolean;
  showFilters: boolean;
  itemsPerPage: number;
  allowBulkOperations: boolean;
}

interface ArchiveFilter {
  status?: ContentStatus[];
  types?: ContentType[];
  authors?: string[];
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

interface ArchiveOrganizerContextType {
  items: ArchiveItem[];
  groups: ArchiveGroup[];
  stats: ArchiveStats;
  filter: ArchiveFilter;
  config: ArchiveConfig;
  selectedItems: string[];
  currentPage: number;
  totalPages: number;
  setFilter: (filter: ArchiveFilter) => void;
  setConfig: (config: Partial<ArchiveConfig>) => void;
  toggleGroupExpanded: (groupId: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setCurrentPage: (page: number) => void;
  bulkUpdateStatus: (ids: string[], status: ContentStatus) => void;
  bulkDelete: (ids: string[]) => void;
  bulkRestore: (ids: string[]) => void;
  exportArchive: (format: 'json' | 'csv') => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ArchiveOrganizerContext = createContext<ArchiveOrganizerContextType | null>(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const groupItems = (items: ArchiveItem[], groupBy: ArchiveGroupBy): ArchiveGroup[] => {
  const groups: Map<string, ArchiveItem[]> = new Map();

  items.forEach(item => {
    let key: string;
    let label: string;

    switch (groupBy) {
      case 'year':
        const year = new Date(item.date).getFullYear();
        key = year.toString();
        label = year.toString();
        break;
      case 'month':
        const date = new Date(item.date);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        break;
      case 'category':
        key = item.categories[0] || 'uncategorized';
        label = item.categories[0] || 'Uncategorized';
        break;
      case 'author':
        key = item.author.id;
        label = item.author.name;
        break;
      case 'type':
        key = item.type;
        label = item.type.charAt(0).toUpperCase() + item.type.slice(1) + 's';
        break;
      default:
        key = 'all';
        label = 'All Items';
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  return Array.from(groups.entries())
    .map(([id, items]) => ({
      id,
      label: items[0] ? getGroupLabel(items[0], groupBy) : id,
      count: items.length,
      items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      expanded: true,
    }))
    .sort((a, b) => b.id.localeCompare(a.id));
};

const getGroupLabel = (item: ArchiveItem, groupBy: ArchiveGroupBy): string => {
  switch (groupBy) {
    case 'year':
      return new Date(item.date).getFullYear().toString();
    case 'month':
      return new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    case 'category':
      return item.categories[0] || 'Uncategorized';
    case 'author':
      return item.author.name;
    case 'type':
      return item.type.charAt(0).toUpperCase() + item.type.slice(1) + 's';
    default:
      return 'All Items';
  }
};

// ============================================================================
// PROVIDER
// ============================================================================

interface ArchiveOrganizerProviderProps {
  children: ReactNode;
  initialItems?: ArchiveItem[];
  initialConfig?: Partial<ArchiveConfig>;
  onItemsChange?: (items: ArchiveItem[]) => void;
  onExport?: (data: string, format: 'json' | 'csv') => void;
}

const defaultConfig: ArchiveConfig = {
  groupBy: 'year',
  viewMode: 'list',
  showStats: true,
  showFilters: true,
  itemsPerPage: 20,
  allowBulkOperations: true,
};

export const ArchiveOrganizerProvider: React.FC<ArchiveOrganizerProviderProps> = ({
  children,
  initialItems = [],
  initialConfig = {},
  onItemsChange,
  onExport,
}) => {
  const [items, setItems] = useState<ArchiveItem[]>(initialItems);
  const [filter, setFilter] = useState<ArchiveFilter>({});
  const [config, setConfigState] = useState<ArchiveConfig>({ ...defaultConfig, ...initialConfig });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.status?.length) {
      result = result.filter(item => filter.status!.includes(item.status));
    }
    if (filter.types?.length) {
      result = result.filter(item => filter.types!.includes(item.type));
    }
    if (filter.authors?.length) {
      result = result.filter(item => filter.authors!.includes(item.author.id));
    }
    if (filter.categories?.length) {
      result = result.filter(item =>
        item.categories.some(c => filter.categories!.includes(c))
      );
    }
    if (filter.dateRange) {
      result = result.filter(item => {
        const date = new Date(item.date);
        return date >= filter.dateRange!.start && date <= filter.dateRange!.end;
      });
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.excerpt?.toLowerCase().includes(search) ||
        item.author.name.toLowerCase().includes(search)
      );
    }

    return result;
  }, [items, filter]);

  const groups = useMemo(() => {
    const grouped = groupItems(filteredItems, config.groupBy);
    return grouped.map(g => ({
      ...g,
      expanded: !expandedGroups.has(g.id) || expandedGroups.has(g.id),
    }));
  }, [filteredItems, config.groupBy, expandedGroups]);

  const stats: ArchiveStats = useMemo(() => {
    const byYear = new Map<number, number>();
    const byType = new Map<ContentType, number>();
    const byAuthor = new Map<string, { name: string; count: number }>();

    items.forEach(item => {
      const year = new Date(item.date).getFullYear();
      byYear.set(year, (byYear.get(year) || 0) + 1);
      byType.set(item.type, (byType.get(item.type) || 0) + 1);

      const author = byAuthor.get(item.author.id);
      if (author) {
        author.count++;
      } else {
        byAuthor.set(item.author.id, { name: item.author.name, count: 1 });
      }
    });

    return {
      total: items.length,
      published: items.filter(i => i.status === 'published').length,
      draft: items.filter(i => i.status === 'draft').length,
      pending: items.filter(i => i.status === 'pending').length,
      private: items.filter(i => i.status === 'private').length,
      trash: items.filter(i => i.status === 'trash').length,
      byYear: Array.from(byYear.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => b.year - a.year),
      byType: Array.from(byType.entries())
        .map(([type, count]) => ({ type, count })),
      byAuthor: Array.from(byAuthor.entries())
        .map(([authorId, { name, count }]) => ({ authorId, authorName: name, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [items]);

  const totalPages = Math.ceil(filteredItems.length / config.itemsPerPage);

  const setConfig = useCallback((updates: Partial<ArchiveConfig>) => {
    setConfigState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleGroupExpanded = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const expandAllGroups = useCallback(() => {
    setExpandedGroups(new Set(groups.map(g => g.id)));
  }, [groups]);

  const collapseAllGroups = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(i => i !== id));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(filteredItems.map(i => i.id));
  }, [filteredItems]);

  const deselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const bulkUpdateStatus = useCallback((ids: string[], status: ContentStatus) => {
    setItems(prev => {
      const updated = prev.map(item =>
        ids.includes(item.id) ? { ...item, status } : item
      );
      onItemsChange?.(updated);
      return updated;
    });
    setSelectedItems([]);
  }, [onItemsChange]);

  const bulkDelete = useCallback((ids: string[]) => {
    setItems(prev => {
      const updated = prev.map(item =>
        ids.includes(item.id) ? { ...item, status: 'trash' as ContentStatus } : item
      );
      onItemsChange?.(updated);
      return updated;
    });
    setSelectedItems([]);
  }, [onItemsChange]);

  const bulkRestore = useCallback((ids: string[]) => {
    setItems(prev => {
      const updated = prev.map(item =>
        ids.includes(item.id) ? { ...item, status: 'draft' as ContentStatus } : item
      );
      onItemsChange?.(updated);
      return updated;
    });
    setSelectedItems([]);
  }, [onItemsChange]);

  const exportArchive = useCallback((format: 'json' | 'csv') => {
    const exportItems = selectedItems.length > 0
      ? filteredItems.filter(i => selectedItems.includes(i.id))
      : filteredItems;

    let data: string;
    if (format === 'json') {
      data = JSON.stringify(exportItems, null, 2);
    } else {
      const headers = ['id', 'title', 'type', 'status', 'date', 'author', 'categories', 'tags'];
      const rows = exportItems.map(item => [
        item.id,
        item.title,
        item.type,
        item.status,
        new Date(item.date).toISOString(),
        item.author.name,
        item.categories.join(';'),
        item.tags.join(';'),
      ]);
      data = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    }

    onExport?.(data, format);
  }, [filteredItems, selectedItems, onExport]);

  const value: ArchiveOrganizerContextType = {
    items: filteredItems,
    groups,
    stats,
    filter,
    config,
    selectedItems,
    currentPage,
    totalPages,
    setFilter,
    setConfig,
    toggleGroupExpanded,
    expandAllGroups,
    collapseAllGroups,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    setCurrentPage,
    bulkUpdateStatus,
    bulkDelete,
    bulkRestore,
    exportArchive,
  };

  return (
    <ArchiveOrganizerContext.Provider value={value}>
      {children}
    </ArchiveOrganizerContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useArchiveOrganizer = (): ArchiveOrganizerContextType => {
  const context = useContext(ArchiveOrganizerContext);
  if (!context) {
    throw new Error('useArchiveOrganizer must be used within ArchiveOrganizerProvider');
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
  statsRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    flex: '1 1 100px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    minWidth: '100px',
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
  groupContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  expandIcon: {
    transition: 'transform 0.2s',
  },
  groupLabel: {
    flex: 1,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  groupCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    paddingLeft: '1rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    transition: 'all 0.15s',
  },
  itemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    width: '1.125rem',
    height: '1.125rem',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  thumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
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
    published: { backgroundColor: '#dcfce7', color: '#16a34a' },
    draft: { backgroundColor: '#fef3c7', color: '#d97706' },
    pending: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
    private: { backgroundColor: '#f1f5f9', color: '#64748b' },
    trash: { backgroundColor: '#fee2e2', color: '#dc2626' },
  },
  typeIcon: {
    post: '📝',
    page: '📄',
    product: '🛍️',
    event: '📅',
    media: '🖼️',
  },
  timelineView: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
    position: 'relative' as const,
    paddingLeft: '2rem',
  },
  timelineLine: {
    position: 'absolute' as const,
    left: '0.5rem',
    top: '0',
    bottom: '0',
    width: '2px',
    backgroundColor: '#e2e8f0',
  },
  timelineItem: {
    position: 'relative' as const,
    paddingBottom: '1.5rem',
  },
  timelineDot: {
    position: 'absolute' as const,
    left: '-1.75rem',
    top: '0.5rem',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '2px solid #ffffff',
    boxShadow: '0 0 0 2px #e2e8f0',
  },
  gridView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  gridCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  pageButton: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#ffffff',
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

// ============================================================================
// ARCHIVE STATS
// ============================================================================

export const ArchiveStats: React.FC = () => {
  const { stats, config } = useArchiveOrganizer();

  if (!config.showStats) return null;

  const statItems = [
    { label: 'Total', value: stats.total, color: '#1e293b' },
    { label: 'Published', value: stats.published, color: '#16a34a' },
    { label: 'Drafts', value: stats.draft, color: '#d97706' },
    { label: 'Pending', value: stats.pending, color: '#4f46e5' },
    { label: 'Private', value: stats.private, color: '#64748b' },
    { label: 'Trash', value: stats.trash, color: '#dc2626' },
  ];

  return (
    <div style={styles.statsRow}>
      {statItems.map(stat => (
        <div key={stat.label} style={styles.statCard}>
          <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
          <span style={styles.statLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ARCHIVE TOOLBAR
// ============================================================================

export const ArchiveToolbar: React.FC = () => {
  const { filter, setFilter, config, setConfig, expandAllGroups, collapseAllGroups, exportArchive } = useArchiveOrganizer();

  return (
    <div style={styles.toolbar}>
      <input
        type="text"
        placeholder="Search archive..."
        value={filter.search || ''}
        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        style={styles.searchInput}
      />

      <select
        value={filter.status?.[0] || ''}
        onChange={(e) => setFilter({ ...filter, status: e.target.value ? [e.target.value as ContentStatus] : undefined })}
        style={styles.select}
      >
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending</option>
        <option value="private">Private</option>
        <option value="trash">Trash</option>
      </select>

      <select
        value={config.groupBy}
        onChange={(e) => setConfig({ groupBy: e.target.value as ArchiveGroupBy })}
        style={styles.select}
      >
        <option value="year">Group by Year</option>
        <option value="month">Group by Month</option>
        <option value="category">Group by Category</option>
        <option value="author">Group by Author</option>
        <option value="type">Group by Type</option>
      </select>

      <div style={styles.viewToggle}>
        {(['list', 'grid', 'timeline'] as ArchiveViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setConfig({ viewMode: mode })}
            style={{
              ...styles.viewButton,
              ...(config.viewMode === mode ? styles.viewButtonActive : {}),
            }}
          >
            {mode === 'list' && '☰'}
            {mode === 'grid' && '⊞'}
            {mode === 'timeline' && '⏱'}
          </button>
        ))}
      </div>

      <button onClick={expandAllGroups} style={{ ...styles.button, ...styles.secondaryButton }}>
        Expand All
      </button>

      <button onClick={collapseAllGroups} style={{ ...styles.button, ...styles.secondaryButton }}>
        Collapse All
      </button>

      <button onClick={() => exportArchive('csv')} style={{ ...styles.button, ...styles.secondaryButton }}>
        Export CSV
      </button>
    </div>
  );
};

// ============================================================================
// BULK ACTIONS
// ============================================================================

export const ArchiveBulkActions: React.FC = () => {
  const { selectedItems, selectAll, deselectAll, bulkUpdateStatus, bulkDelete, bulkRestore, items } = useArchiveOrganizer();

  if (selectedItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={styles.bulkActions}
    >
      <span style={styles.selectionCount}>
        {selectedItems.length} of {items.length} selected
      </span>

      <button onClick={selectAll} style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}>
        Select All
      </button>

      <button onClick={deselectAll} style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}>
        Clear
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }} />

      <button
        onClick={() => bulkUpdateStatus(selectedItems, 'published')}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Publish
      </button>

      <button
        onClick={() => bulkUpdateStatus(selectedItems, 'draft')}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Unpublish
      </button>

      <button
        onClick={() => bulkRestore(selectedItems)}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Restore
      </button>

      <button
        onClick={() => bulkDelete(selectedItems)}
        style={{ ...styles.button, ...styles.dangerButton, padding: '0.375rem 0.75rem' }}
      >
        Move to Trash
      </button>
    </motion.div>
  );
};

// ============================================================================
// ARCHIVE ITEM
// ============================================================================

interface ArchiveItemRowProps {
  item: ArchiveItem;
}

export const ArchiveItemRow: React.FC<ArchiveItemRowProps> = ({ item }) => {
  const { selectedItems, selectItem, deselectItem } = useArchiveOrganizer();
  const isSelected = selectedItems.includes(item.id);

  const handleCheckboxChange = () => {
    if (isSelected) {
      deselectItem(item.id);
    } else {
      selectItem(item.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        ...styles.item,
        ...(isSelected ? styles.itemSelected : {}),
      }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        style={styles.checkbox}
      />

      {item.thumbnail ? (
        <img src={item.thumbnail} alt="" style={styles.thumbnail as React.CSSProperties} />
      ) : (
        <div style={styles.thumbnail}>
          {styles.typeIcon[item.type]}
        </div>
      )}

      <div style={styles.itemInfo}>
        <div style={styles.itemTitle}>{item.title}</div>
        <div style={styles.itemMeta}>
          <span>{item.author.name}</span>
          <span>•</span>
          <span>{new Date(item.date).toLocaleDateString()}</span>
          {item.views !== undefined && (
            <>
              <span>•</span>
              <span>{item.views} views</span>
            </>
          )}
        </div>
      </div>

      <span style={{ ...styles.statusBadge, ...styles.statusColors[item.status] }}>
        {item.status}
      </span>
    </motion.div>
  );
};

// ============================================================================
// ARCHIVE GROUP
// ============================================================================

interface ArchiveGroupComponentProps {
  group: ArchiveGroup;
}

export const ArchiveGroupComponent: React.FC<ArchiveGroupComponentProps> = ({ group }) => {
  const { toggleGroupExpanded, config } = useArchiveOrganizer();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    toggleGroupExpanded(group.id);
  };

  return (
    <div style={styles.groupContainer}>
      <div
        style={styles.groupHeader}
        onClick={handleToggle}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            ...styles.expandIcon,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>

        <span style={styles.groupLabel}>{group.label}</span>
        <span style={styles.groupCount}>{group.count}</span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.itemList}
          >
            {config.viewMode === 'list' && group.items.map(item => (
              <ArchiveItemRow key={item.id} item={item} />
            ))}

            {config.viewMode === 'grid' && (
              <div style={styles.gridView}>
                {group.items.map(item => (
                  <ArchiveItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {config.viewMode === 'timeline' && (
              <div style={styles.timelineView}>
                <div style={styles.timelineLine} />
                {group.items.map(item => (
                  <div key={item.id} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <ArchiveItemRow item={item} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// ARCHIVE ITEM CARD (Grid View)
// ============================================================================

interface ArchiveItemCardProps {
  item: ArchiveItem;
}

export const ArchiveItemCard: React.FC<ArchiveItemCardProps> = ({ item }) => {
  const { selectedItems, selectItem, deselectItem } = useArchiveOrganizer();
  const isSelected = selectedItems.includes(item.id);

  return (
    <motion.div
      style={{
        ...styles.gridCard,
        ...(isSelected ? styles.itemSelected : {}),
      }}
      onClick={() => isSelected ? deselectItem(item.id) : selectItem(item.id)}
      whileHover={{ scale: 1.02 }}
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.75rem' }}
        />
      )}

      <div style={styles.itemTitle}>{item.title}</div>

      <div style={{ ...styles.itemMeta, marginTop: '0.5rem' }}>
        <span>{item.author.name}</span>
        <span>•</span>
        <span>{new Date(item.date).toLocaleDateString()}</span>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...styles.statusBadge, ...styles.statusColors[item.status] }}>
          {item.status}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {styles.typeIcon[item.type]} {item.type}
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ARCHIVE LIST
// ============================================================================

export const ArchiveList: React.FC = () => {
  const { groups } = useArchiveOrganizer();

  if (groups.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📁</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>No Content Found</h3>
        <p style={{ margin: 0 }}>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {groups.map(group => (
        <ArchiveGroupComponent key={group.id} group={group} />
      ))}
    </div>
  );
};

// ============================================================================
// PAGINATION
// ============================================================================

export const ArchivePagination: React.FC = () => {
  const { currentPage, totalPages, setCurrentPage } = useArchiveOrganizer();

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1);
    }
  }

  return (
    <div style={styles.pagination}>
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ ...styles.pageButton, opacity: currentPage === 1 ? 0.5 : 1 }}
      >
        Previous
      </button>

      {pages.map((page, idx) =>
        page === -1 ? (
          <span key={idx} style={{ padding: '0 0.5rem', color: '#64748b' }}>...</span>
        ) : (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              ...styles.pageButton,
              ...(currentPage === page ? styles.pageButtonActive : {}),
            }}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ ...styles.pageButton, opacity: currentPage === totalPages ? 0.5 : 1 }}
      >
        Next
      </button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ArchiveOrganizer: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Content Archive</h2>
      </div>

      <ArchiveStats />

      <ArchiveToolbar />

      <ArchiveBulkActions />

      <ArchiveList />

      <ArchivePagination />
    </div>
  );
};

export default ArchiveOrganizer;
