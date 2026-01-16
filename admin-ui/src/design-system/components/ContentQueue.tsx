import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type QueueItemStatus = 'queued' | 'processing' | 'published' | 'failed' | 'paused' | 'cancelled';
type ContentType = 'post' | 'page' | 'product' | 'event' | 'newsletter' | 'social';
type Priority = 'urgent' | 'high' | 'normal' | 'low';

interface QueueItem {
  id: string;
  title: string;
  type: ContentType;
  status: QueueItemStatus;
  priority: Priority;
  scheduledDate: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  categories?: string[];
  estimatedReadTime?: number;
  wordCount?: number;
  position: number;
  retryCount?: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QueueStats {
  total: number;
  queued: number;
  processing: number;
  published: number;
  failed: number;
  paused: number;
}

interface QueueFilter {
  status?: QueueItemStatus[];
  types?: ContentType[];
  priority?: Priority[];
  authors?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

interface QueueConfig {
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number;
  autoPublish: boolean;
  notifyOnPublish: boolean;
  notifyOnError: boolean;
  pauseOnError: boolean;
}

interface ContentQueueContextType {
  items: QueueItem[];
  filteredItems: QueueItem[];
  stats: QueueStats;
  filter: QueueFilter;
  config: QueueConfig;
  selectedItems: string[];
  isProcessing: boolean;
  setFilter: (filter: QueueFilter) => void;
  setConfig: (config: Partial<QueueConfig>) => void;
  addItem: (item: Omit<QueueItem, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<QueueItem>) => void;
  reorderItems: (items: QueueItem[]) => void;
  moveToPosition: (id: string, position: number) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  pauseItem: (id: string) => void;
  resumeItem: (id: string) => void;
  retryItem: (id: string) => void;
  cancelItem: (id: string) => void;
  publishNow: (id: string) => void;
  bulkAction: (action: 'pause' | 'resume' | 'cancel' | 'delete' | 'publish', ids: string[]) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ContentQueueContext = createContext<ContentQueueContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ContentQueueProviderProps {
  children: ReactNode;
  initialItems?: QueueItem[];
  initialConfig?: Partial<QueueConfig>;
  onItemPublished?: (item: QueueItem) => void;
  onItemFailed?: (item: QueueItem, error: string) => void;
  onQueueChange?: (items: QueueItem[]) => void;
}

const defaultConfig: QueueConfig = {
  maxConcurrent: 1,
  retryAttempts: 3,
  retryDelay: 5000,
  autoPublish: true,
  notifyOnPublish: true,
  notifyOnError: true,
  pauseOnError: false,
};

export const ContentQueueProvider: React.FC<ContentQueueProviderProps> = ({
  children,
  initialItems = [],
  initialConfig = {},
  onItemPublished,
  onItemFailed,
  onQueueChange,
}) => {
  const [items, setItems] = useState<QueueItem[]>(initialItems);
  const [filter, setFilter] = useState<QueueFilter>({});
  const [config, setConfigState] = useState<QueueConfig>({ ...defaultConfig, ...initialConfig });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.status?.length) {
      result = result.filter(item => filter.status!.includes(item.status));
    }
    if (filter.types?.length) {
      result = result.filter(item => filter.types!.includes(item.type));
    }
    if (filter.priority?.length) {
      result = result.filter(item => filter.priority!.includes(item.priority));
    }
    if (filter.authors?.length) {
      result = result.filter(item => filter.authors!.includes(item.author.id));
    }
    if (filter.dateRange) {
      result = result.filter(item => {
        const date = new Date(item.scheduledDate);
        return date >= filter.dateRange!.start && date <= filter.dateRange!.end;
      });
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.author.name.toLowerCase().includes(search) ||
        item.categories?.some(c => c.toLowerCase().includes(search))
      );
    }

    return result.sort((a, b) => a.position - b.position);
  }, [items, filter]);

  const stats: QueueStats = useMemo(() => ({
    total: items.length,
    queued: items.filter(i => i.status === 'queued').length,
    processing: items.filter(i => i.status === 'processing').length,
    published: items.filter(i => i.status === 'published').length,
    failed: items.filter(i => i.status === 'failed').length,
    paused: items.filter(i => i.status === 'paused').length,
  }), [items]);

  const setConfig = useCallback((updates: Partial<QueueConfig>) => {
    setConfigState(prev => ({ ...prev, ...updates }));
  }, []);

  const addItem = useCallback((item: Omit<QueueItem, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => {
    const newItem: QueueItem = {
      ...item,
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: items.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => {
      const updated = [...prev, newItem];
      onQueueChange?.(updated);
      return updated;
    });
  }, [items.length, onQueueChange]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id).map((item, idx) => ({ ...item, position: idx }));
      onQueueChange?.(updated);
      return updated;
    });
    setSelectedItems(prev => prev.filter(i => i !== id));
  }, [onQueueChange]);

  const updateItem = useCallback((id: string, updates: Partial<QueueItem>) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      );
      onQueueChange?.(updated);
      return updated;
    });
  }, [onQueueChange]);

  const reorderItems = useCallback((reordered: QueueItem[]) => {
    const updated = reordered.map((item, idx) => ({ ...item, position: idx }));
    setItems(updated);
    onQueueChange?.(updated);
  }, [onQueueChange]);

  const moveToPosition = useCallback((id: string, position: number) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;

      const others = prev.filter(i => i.id !== id);
      const clamped = Math.max(0, Math.min(position, others.length));
      others.splice(clamped, 0, item);

      const updated = others.map((item, idx) => ({ ...item, position: idx }));
      onQueueChange?.(updated);
      return updated;
    });
  }, [onQueueChange]);

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

  const pauseItem = useCallback((id: string) => {
    updateItem(id, { status: 'paused' });
  }, [updateItem]);

  const resumeItem = useCallback((id: string) => {
    updateItem(id, { status: 'queued' });
  }, [updateItem]);

  const retryItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateItem(id, {
        status: 'queued',
        retryCount: (item.retryCount || 0) + 1,
        lastError: undefined
      });
    }
  }, [items, updateItem]);

  const cancelItem = useCallback((id: string) => {
    updateItem(id, { status: 'cancelled' });
  }, [updateItem]);

  const publishNow = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateItem(id, { status: 'published' });
      onItemPublished?.(item);
    }
  }, [items, updateItem, onItemPublished]);

  const bulkAction = useCallback((action: 'pause' | 'resume' | 'cancel' | 'delete' | 'publish', ids: string[]) => {
    ids.forEach(id => {
      switch (action) {
        case 'pause':
          pauseItem(id);
          break;
        case 'resume':
          resumeItem(id);
          break;
        case 'cancel':
          cancelItem(id);
          break;
        case 'delete':
          removeItem(id);
          break;
        case 'publish':
          publishNow(id);
          break;
      }
    });
    if (action === 'delete') {
      setSelectedItems([]);
    }
  }, [pauseItem, resumeItem, cancelItem, removeItem, publishNow]);

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
  }, []);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const value: ContentQueueContextType = {
    items,
    filteredItems,
    stats,
    filter,
    config,
    selectedItems,
    isProcessing,
    setFilter,
    setConfig,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    moveToPosition,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    pauseItem,
    resumeItem,
    retryItem,
    cancelItem,
    publishNow,
    bulkAction,
    startProcessing,
    stopProcessing,
  };

  return (
    <ContentQueueContext.Provider value={value}>
      {children}
    </ContentQueueContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentQueue = (): ContentQueueContextType => {
  const context = useContext(ContentQueueContext);
  if (!context) {
    throw new Error('useContentQueue must be used within ContentQueueProvider');
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
  statsRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '1rem 1.5rem',
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
    letterSpacing: '0.05em',
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
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  filterSelect: {
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
  queueList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    minHeight: '200px',
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'grab',
    transition: 'all 0.2s',
  },
  queueItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    width: '1.125rem',
    height: '1.125rem',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  dragHandle: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    padding: '0.25rem',
    color: '#94a3b8',
    cursor: 'grab',
  },
  thumbnail: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    backgroundColor: '#f1f5f9',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '0.25rem',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  priorityBadge: {
    urgent: { backgroundColor: '#fee2e2', color: '#dc2626' },
    high: { backgroundColor: '#ffedd5', color: '#ea580c' },
    normal: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
    low: { backgroundColor: '#f1f5f9', color: '#64748b' },
  },
  statusBadge: {
    queued: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
    processing: { backgroundColor: '#fef3c7', color: '#d97706' },
    published: { backgroundColor: '#dcfce7', color: '#16a34a' },
    failed: { backgroundColor: '#fee2e2', color: '#dc2626' },
    paused: { backgroundColor: '#f1f5f9', color: '#64748b' },
    cancelled: { backgroundColor: '#fef2f2', color: '#991b1b' },
  },
  typeBadge: {
    post: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    page: { backgroundColor: '#f3e8ff', color: '#7c3aed' },
    product: { backgroundColor: '#dcfce7', color: '#16a34a' },
    event: { backgroundColor: '#fce7f3', color: '#be185d' },
    newsletter: { backgroundColor: '#ffedd5', color: '#ea580c' },
    social: { backgroundColor: '#cffafe', color: '#0891b2' },
  },
  itemActions: {
    display: 'flex',
    gap: '0.5rem',
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
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#64748b',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  processingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#d97706',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #fbbf24',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  configPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  configItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  configLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#475569',
  },
  configInput: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  toggleSwitch: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toggleSwitchActive: {
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
// QUEUE STATS OVERVIEW
// ============================================================================

export const QueueStatsOverview: React.FC = () => {
  const { stats, isProcessing } = useContentQueue();

  const statItems = [
    { label: 'Total', value: stats.total, color: '#1e293b' },
    { label: 'Queued', value: stats.queued, color: '#4f46e5' },
    { label: 'Processing', value: stats.processing, color: '#d97706' },
    { label: 'Published', value: stats.published, color: '#16a34a' },
    { label: 'Failed', value: stats.failed, color: '#dc2626' },
    { label: 'Paused', value: stats.paused, color: '#64748b' },
  ];

  return (
    <div style={styles.statsRow}>
      {statItems.map(stat => (
        <motion.div
          key={stat.label}
          style={styles.statCard}
          whileHover={{ scale: 1.02 }}
        >
          <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
          <span style={styles.statLabel}>{stat.label}</span>
        </motion.div>
      ))}
      {isProcessing && (
        <div style={styles.processingIndicator}>
          <div style={styles.spinner} />
          Processing...
        </div>
      )}
    </div>
  );
};

// ============================================================================
// QUEUE TOOLBAR
// ============================================================================

export const QueueToolbar: React.FC = () => {
  const { filter, setFilter, isProcessing, startProcessing, stopProcessing } = useContentQueue();

  return (
    <div style={styles.toolbar}>
      <input
        type="text"
        placeholder="Search queue..."
        value={filter.search || ''}
        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        style={styles.searchInput}
      />

      <select
        value={filter.status?.[0] || ''}
        onChange={(e) => setFilter({ ...filter, status: e.target.value ? [e.target.value as QueueItemStatus] : undefined })}
        style={styles.filterSelect}
      >
        <option value="">All Status</option>
        <option value="queued">Queued</option>
        <option value="processing">Processing</option>
        <option value="published">Published</option>
        <option value="failed">Failed</option>
        <option value="paused">Paused</option>
      </select>

      <select
        value={filter.types?.[0] || ''}
        onChange={(e) => setFilter({ ...filter, types: e.target.value ? [e.target.value as ContentType] : undefined })}
        style={styles.filterSelect}
      >
        <option value="">All Types</option>
        <option value="post">Posts</option>
        <option value="page">Pages</option>
        <option value="product">Products</option>
        <option value="event">Events</option>
        <option value="newsletter">Newsletters</option>
        <option value="social">Social</option>
      </select>

      <select
        value={filter.priority?.[0] || ''}
        onChange={(e) => setFilter({ ...filter, priority: e.target.value ? [e.target.value as Priority] : undefined })}
        style={styles.filterSelect}
      >
        <option value="">All Priority</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
        <option value="low">Low</option>
      </select>

      <button
        onClick={isProcessing ? stopProcessing : startProcessing}
        style={{
          ...styles.button,
          ...(isProcessing ? styles.dangerButton : styles.primaryButton),
        }}
      >
        {isProcessing ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Queue
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Start Queue
          </>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// BULK ACTIONS BAR
// ============================================================================

export const BulkActionsBar: React.FC = () => {
  const { selectedItems, selectAll, deselectAll, bulkAction, filteredItems } = useContentQueue();

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={styles.bulkActions}
    >
      <span style={styles.selectionCount}>
        {selectedItems.length} of {filteredItems.length} selected
      </span>

      <button
        onClick={selectAll}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Select All
      </button>

      <button
        onClick={deselectAll}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Clear
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }} />

      <button
        onClick={() => bulkAction('pause', selectedItems)}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Pause
      </button>

      <button
        onClick={() => bulkAction('resume', selectedItems)}
        style={{ ...styles.button, ...styles.secondaryButton, padding: '0.375rem 0.75rem' }}
      >
        Resume
      </button>

      <button
        onClick={() => bulkAction('publish', selectedItems)}
        style={{ ...styles.button, ...styles.primaryButton, padding: '0.375rem 0.75rem' }}
      >
        Publish Now
      </button>

      <button
        onClick={() => bulkAction('delete', selectedItems)}
        style={{ ...styles.button, ...styles.dangerButton, padding: '0.375rem 0.75rem' }}
      >
        Delete
      </button>
    </motion.div>
  );
};

// ============================================================================
// QUEUE ITEM
// ============================================================================

interface QueueItemRowProps {
  item: QueueItem;
}

export const QueueItemRow: React.FC<QueueItemRowProps> = ({ item }) => {
  const { selectedItems, selectItem, deselectItem, pauseItem, resumeItem, retryItem, cancelItem, publishNow, removeItem } = useContentQueue();

  const isSelected = selectedItems.includes(item.id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        ...styles.queueItem,
        ...(isSelected ? styles.queueItemSelected : {}),
      }}
      whileHover={{ backgroundColor: isSelected ? '#eff6ff' : '#f8fafc' }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        style={styles.checkbox}
      />

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

      {item.thumbnail ? (
        <img src={item.thumbnail} alt="" style={styles.thumbnail} />
      ) : (
        <div style={{ ...styles.thumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
      )}

      <div style={styles.itemContent}>
        <div style={styles.itemTitle}>{item.title}</div>
        <div style={styles.itemMeta}>
          <span>{item.author.name}</span>
          <span>•</span>
          <span>{formatDate(item.scheduledDate)}</span>
          {item.wordCount && (
            <>
              <span>•</span>
              <span>{item.wordCount.toLocaleString()} words</span>
            </>
          )}
        </div>
      </div>

      <span style={{ ...styles.badge, ...styles.typeBadge[item.type] }}>
        {item.type}
      </span>

      <span style={{ ...styles.badge, ...styles.priorityBadge[item.priority] }}>
        {item.priority}
      </span>

      <span style={{ ...styles.badge, ...styles.statusBadge[item.status] }}>
        {item.status}
      </span>

      <div style={styles.itemActions}>
        {item.status === 'queued' && (
          <button
            onClick={() => pauseItem(item.id)}
            style={styles.iconButton}
            title="Pause"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
        )}
        {item.status === 'paused' && (
          <button
            onClick={() => resumeItem(item.id)}
            style={styles.iconButton}
            title="Resume"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </button>
        )}
        {item.status === 'failed' && (
          <button
            onClick={() => retryItem(item.id)}
            style={styles.iconButton}
            title="Retry"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
        )}
        {(item.status === 'queued' || item.status === 'paused') && (
          <button
            onClick={() => publishNow(item.id)}
            style={{ ...styles.iconButton, color: '#16a34a' }}
            title="Publish Now"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        )}
        {item.status !== 'published' && item.status !== 'cancelled' && (
          <button
            onClick={() => cancelItem(item.id)}
            style={styles.iconButton}
            title="Cancel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        )}
        <button
          onClick={() => removeItem(item.id)}
          style={{ ...styles.iconButton, color: '#dc2626' }}
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// QUEUE LIST
// ============================================================================

export const QueueList: React.FC = () => {
  const { filteredItems, reorderItems } = useContentQueue();

  if (filteredItems.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📭</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Queue is Empty</h3>
        <p style={{ margin: 0 }}>No content items in the publishing queue</p>
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={filteredItems}
      onReorder={reorderItems}
      style={styles.queueList}
    >
      <AnimatePresence>
        {filteredItems.map((item) => (
          <Reorder.Item key={item.id} value={item}>
            <QueueItemRow item={item} />
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};

// ============================================================================
// QUEUE CONFIG PANEL
// ============================================================================

export const QueueConfigPanel: React.FC = () => {
  const { config, setConfig } = useContentQueue();

  return (
    <div style={styles.configPanel}>
      <div style={styles.configItem}>
        <label style={styles.configLabel}>Max Concurrent</label>
        <input
          type="number"
          min="1"
          max="10"
          value={config.maxConcurrent}
          onChange={(e) => setConfig({ maxConcurrent: parseInt(e.target.value) || 1 })}
          style={styles.configInput}
        />
      </div>

      <div style={styles.configItem}>
        <label style={styles.configLabel}>Retry Attempts</label>
        <input
          type="number"
          min="0"
          max="10"
          value={config.retryAttempts}
          onChange={(e) => setConfig({ retryAttempts: parseInt(e.target.value) || 0 })}
          style={styles.configInput}
        />
      </div>

      <div style={styles.configItem}>
        <label style={styles.configLabel}>Retry Delay (ms)</label>
        <input
          type="number"
          min="1000"
          max="60000"
          step="1000"
          value={config.retryDelay}
          onChange={(e) => setConfig({ retryDelay: parseInt(e.target.value) || 5000 })}
          style={styles.configInput}
        />
      </div>

      <div style={styles.configItem}>
        <div style={styles.toggle}>
          <div
            style={{
              ...styles.toggleSwitch,
              ...(config.autoPublish ? styles.toggleSwitchActive : {}),
            }}
            onClick={() => setConfig({ autoPublish: !config.autoPublish })}
          >
            <div
              style={{
                ...styles.toggleKnob,
                ...(config.autoPublish ? styles.toggleKnobActive : {}),
              }}
            />
          </div>
          <span style={styles.configLabel}>Auto Publish</span>
        </div>
      </div>

      <div style={styles.configItem}>
        <div style={styles.toggle}>
          <div
            style={{
              ...styles.toggleSwitch,
              ...(config.notifyOnPublish ? styles.toggleSwitchActive : {}),
            }}
            onClick={() => setConfig({ notifyOnPublish: !config.notifyOnPublish })}
          >
            <div
              style={{
                ...styles.toggleKnob,
                ...(config.notifyOnPublish ? styles.toggleKnobActive : {}),
              }}
            />
          </div>
          <span style={styles.configLabel}>Notify on Publish</span>
        </div>
      </div>

      <div style={styles.configItem}>
        <div style={styles.toggle}>
          <div
            style={{
              ...styles.toggleSwitch,
              ...(config.notifyOnError ? styles.toggleSwitchActive : {}),
            }}
            onClick={() => setConfig({ notifyOnError: !config.notifyOnError })}
          >
            <div
              style={{
                ...styles.toggleKnob,
                ...(config.notifyOnError ? styles.toggleKnobActive : {}),
              }}
            />
          </div>
          <span style={styles.configLabel}>Notify on Error</span>
        </div>
      </div>

      <div style={styles.configItem}>
        <div style={styles.toggle}>
          <div
            style={{
              ...styles.toggleSwitch,
              ...(config.pauseOnError ? styles.toggleSwitchActive : {}),
            }}
            onClick={() => setConfig({ pauseOnError: !config.pauseOnError })}
          >
            <div
              style={{
                ...styles.toggleKnob,
                ...(config.pauseOnError ? styles.toggleKnobActive : {}),
              }}
            />
          </div>
          <span style={styles.configLabel}>Pause on Error</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADD TO QUEUE FORM
// ============================================================================

interface AddToQueueFormProps {
  onAdd?: (item: QueueItem) => void;
}

export const AddToQueueForm: React.FC<AddToQueueFormProps> = ({ onAdd }) => {
  const { addItem } = useContentQueue();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('post');
  const [priority, setPriority] = useState<Priority>('normal');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const item = {
      title: title.trim(),
      type,
      status: 'queued' as QueueItemStatus,
      priority,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      author: {
        id: 'current-user',
        name: 'Current User',
      },
    };

    addItem(item);
    onAdd?.({ ...item, id: '', position: 0, createdAt: new Date(), updatedAt: new Date() });

    setTitle('');
    setType('post');
    setPriority('normal');
    setScheduledDate('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Content title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ ...styles.searchInput, flex: 2, minWidth: '200px' }}
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as ContentType)}
        style={styles.filterSelect}
      >
        <option value="post">Post</option>
        <option value="page">Page</option>
        <option value="product">Product</option>
        <option value="event">Event</option>
        <option value="newsletter">Newsletter</option>
        <option value="social">Social</option>
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        style={styles.filterSelect}
      >
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
        <option value="low">Low</option>
      </select>

      <input
        type="datetime-local"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        style={styles.configInput}
      />

      <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add to Queue
      </button>
    </form>
  );
};

// ============================================================================
// UPCOMING ITEMS WIDGET
// ============================================================================

export const UpcomingItems: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const { items } = useContentQueue();

  const upcomingItems = useMemo(() => {
    const now = new Date();
    return items
      .filter(item => item.status === 'queued' && new Date(item.scheduledDate) > now)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, limit);
  }, [items, limit]);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days}d`;
    if (hours > 0) return `in ${hours}h`;
    return 'soon';
  };

  if (upcomingItems.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
        No upcoming items scheduled
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {upcomingItems.map(item => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
          }}
        >
          <span style={{ ...styles.badge, ...styles.typeBadge[item.type] }}>{item.type}</span>
          <span style={{ flex: 1, fontSize: '0.875rem', color: '#1e293b' }}>{item.title}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(item.scheduledDate)}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ContentQueueProps {
  showStats?: boolean;
  showToolbar?: boolean;
  showConfig?: boolean;
  showAddForm?: boolean;
}

export const ContentQueue: React.FC<ContentQueueProps> = ({
  showStats = true,
  showToolbar = true,
  showConfig = false,
  showAddForm = true,
}) => {
  const [showConfigPanel, setShowConfigPanel] = useState(showConfig);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Content Queue</h2>
        <button
          onClick={() => setShowConfigPanel(!showConfigPanel)}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
      </div>

      {showStats && <QueueStatsOverview />}

      <AnimatePresence>
        {showConfigPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <QueueConfigPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {showToolbar && <QueueToolbar />}

      {showAddForm && <AddToQueueForm />}

      <BulkActionsBar />

      <QueueList />
    </div>
  );
};

export default ContentQueue;
