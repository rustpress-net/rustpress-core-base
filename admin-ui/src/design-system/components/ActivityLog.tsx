import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type ActivityType =
  | 'content_created' | 'content_updated' | 'content_deleted' | 'content_published'
  | 'content_unpublished' | 'content_scheduled' | 'content_archived'
  | 'media_uploaded' | 'media_deleted' | 'media_edited'
  | 'user_login' | 'user_logout' | 'user_created' | 'user_updated' | 'user_deleted'
  | 'role_assigned' | 'role_removed'
  | 'comment_added' | 'comment_deleted' | 'comment_approved' | 'comment_rejected'
  | 'settings_updated' | 'plugin_installed' | 'plugin_activated' | 'plugin_deactivated'
  | 'theme_changed' | 'backup_created' | 'backup_restored'
  | 'bulk_action' | 'export' | 'import' | 'custom';

export type ActivityCategory = 'content' | 'media' | 'user' | 'comment' | 'system' | 'all';

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface ActivityTarget {
  id: string;
  type: string;
  title: string;
  url?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  user: ActivityUser;
  target?: ActivityTarget;
  description: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  isImportant?: boolean;
}

export interface ActivityFilter {
  category?: ActivityCategory;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: ActivityType;
  search?: string;
}

export interface ActivityLogConfig {
  pageSize: number;
  retentionDays: number;
  showIPAddress: boolean;
  showUserAgent: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ActivityLogContextValue {
  activities: Activity[];
  users: ActivityUser[];
  filter: ActivityFilter;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  setFilter: (filter: ActivityFilter) => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  exportActivities: (format: 'csv' | 'json') => void;
  getActivityIcon: (type: ActivityType) => string;
  getActivityColor: (type: ActivityType) => string;
  config: ActivityLogConfig;
}

const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
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
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  exportButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  toolbar: {
    padding: '1rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#64748b',
  },
  select: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    minWidth: '140px',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  searchInput: {
    padding: '0.5rem 0.75rem 0.5rem 2rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    width: '200px',
  },
  searchWrapper: {
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '0.625rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  clearButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  content: {
    minHeight: '400px',
  },
  activityList: {
    padding: '0',
  },
  activityItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s',
  },
  activityItemImportant: {
    backgroundColor: '#fffbeb',
    borderLeft: '3px solid #f59e0b',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '1.125rem',
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
  },
  activityMain: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '0.375rem',
  },
  activityDescription: {
    fontSize: '0.9375rem',
    color: '#1e293b',
    lineHeight: 1.5,
  },
  activityUser: {
    fontWeight: 600,
    color: '#3b82f6',
  },
  activityTarget: {
    fontWeight: 500,
    color: '#1e293b',
    textDecoration: 'none',
  },
  activityTime: {
    fontSize: '0.8125rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap' as const,
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  categoryBadge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },
  userAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
  },
  detailsExpand: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  expandButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#3b82f6',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    padding: 0,
    marginTop: '0.375rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  paginationButtons: {
    display: 'flex',
    gap: '0.25rem',
  },
  pageButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    color: '#374151',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#ffffff',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  timeline: {
    position: 'relative' as const,
    paddingLeft: '2rem',
  },
  timelineLine: {
    position: 'absolute' as const,
    left: '19px',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: '#e2e8f0',
  },
  timelineDot: {
    position: 'absolute' as const,
    left: '12px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '2px solid',
  },
  dateSeparator: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f1f5f9',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#64748b',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  statCard: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
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
    marginTop: '0.25rem',
  },
};

const categoryColors: Record<ActivityCategory, { bg: string; text: string }> = {
  content: { bg: '#dbeafe', text: '#1d4ed8' },
  media: { bg: '#dcfce7', text: '#166534' },
  user: { bg: '#fce7f3', text: '#be185d' },
  comment: { bg: '#fef3c7', text: '#92400e' },
  system: { bg: '#e0e7ff', text: '#4338ca' },
  all: { bg: '#f1f5f9', text: '#64748b' },
};

const activityIcons: Record<ActivityType, { icon: string; bg: string }> = {
  content_created: { icon: '📝', bg: '#dcfce7' },
  content_updated: { icon: '✏️', bg: '#dbeafe' },
  content_deleted: { icon: '🗑️', bg: '#fee2e2' },
  content_published: { icon: '🚀', bg: '#dcfce7' },
  content_unpublished: { icon: '📤', bg: '#fef3c7' },
  content_scheduled: { icon: '📅', bg: '#e0e7ff' },
  content_archived: { icon: '📦', bg: '#f1f5f9' },
  media_uploaded: { icon: '📷', bg: '#dcfce7' },
  media_deleted: { icon: '🗑️', bg: '#fee2e2' },
  media_edited: { icon: '🖼️', bg: '#dbeafe' },
  user_login: { icon: '🔓', bg: '#dcfce7' },
  user_logout: { icon: '🔒', bg: '#f1f5f9' },
  user_created: { icon: '👤', bg: '#dcfce7' },
  user_updated: { icon: '👤', bg: '#dbeafe' },
  user_deleted: { icon: '👤', bg: '#fee2e2' },
  role_assigned: { icon: '🏷️', bg: '#e0e7ff' },
  role_removed: { icon: '🏷️', bg: '#fef3c7' },
  comment_added: { icon: '💬', bg: '#dcfce7' },
  comment_deleted: { icon: '💬', bg: '#fee2e2' },
  comment_approved: { icon: '✅', bg: '#dcfce7' },
  comment_rejected: { icon: '❌', bg: '#fee2e2' },
  settings_updated: { icon: '⚙️', bg: '#f1f5f9' },
  plugin_installed: { icon: '🧩', bg: '#dcfce7' },
  plugin_activated: { icon: '🧩', bg: '#dcfce7' },
  plugin_deactivated: { icon: '🧩', bg: '#fef3c7' },
  theme_changed: { icon: '🎨', bg: '#e0e7ff' },
  backup_created: { icon: '💾', bg: '#dcfce7' },
  backup_restored: { icon: '💾', bg: '#dbeafe' },
  bulk_action: { icon: '📋', bg: '#f1f5f9' },
  export: { icon: '📤', bg: '#dbeafe' },
  import: { icon: '📥', bg: '#dcfce7' },
  custom: { icon: '⭐', bg: '#fef3c7' },
};

// ============================================================================
// PROVIDER
// ============================================================================

interface ActivityLogProviderProps {
  children: React.ReactNode;
  initialActivities?: Activity[];
  users?: ActivityUser[];
  config?: Partial<ActivityLogConfig>;
  onExport?: (format: 'csv' | 'json', activities: Activity[]) => void;
}

export const ActivityLogProvider: React.FC<ActivityLogProviderProps> = ({
  children,
  initialActivities = [],
  users = [],
  config: configOverrides = {},
  onExport,
}) => {
  const [activities] = useState<Activity[]>(initialActivities);
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);

  const config: ActivityLogConfig = {
    pageSize: 20,
    retentionDays: 90,
    showIPAddress: false,
    showUserAgent: false,
    ...configOverrides,
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (filter.category && filter.category !== 'all' && activity.category !== filter.category) return false;
      if (filter.userId && activity.user.id !== filter.userId) return false;
      if (filter.type && activity.type !== filter.type) return false;
      if (filter.dateFrom && new Date(activity.createdAt) < filter.dateFrom) return false;
      if (filter.dateTo && new Date(activity.createdAt) > filter.dateTo) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return activity.description.toLowerCase().includes(searchLower) ||
          activity.user.name.toLowerCase().includes(searchLower) ||
          activity.target?.title.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [activities, filter]);

  const totalPages = Math.ceil(filteredActivities.length / config.pageSize);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * config.pageSize;
    return filteredActivities.slice(start, start + config.pageSize);
  }, [filteredActivities, currentPage, config.pageSize]);

  const clearFilters = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  const exportActivities = useCallback((format: 'csv' | 'json') => {
    onExport?.(format, filteredActivities);
  }, [filteredActivities, onExport]);

  const getActivityIcon = useCallback((type: ActivityType) => {
    return activityIcons[type]?.icon || '📌';
  }, []);

  const getActivityColor = useCallback((type: ActivityType) => {
    return activityIcons[type]?.bg || '#f1f5f9';
  }, []);

  const value: ActivityLogContextValue = {
    activities: paginatedActivities,
    users,
    filter,
    currentPage,
    totalPages,
    isLoading,
    setFilter: (newFilter) => {
      setFilter(newFilter);
      setCurrentPage(1);
    },
    setCurrentPage,
    clearFilters,
    exportActivities,
    getActivityIcon,
    getActivityColor,
    config,
  };

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const ActivityStats: React.FC = () => {
  const { activities } = useActivityLog();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = activities.filter(a => new Date(a.createdAt) >= today).length;
    const contentCount = activities.filter(a => a.category === 'content').length;
    const userCount = activities.filter(a => a.category === 'user').length;
    const systemCount = activities.filter(a => a.category === 'system').length;

    return { todayCount, contentCount, userCount, systemCount };
  }, [activities]);

  return (
    <div style={styles.stats}>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{stats.todayCount}</div>
        <div style={styles.statLabel}>Today</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{stats.contentCount}</div>
        <div style={styles.statLabel}>Content</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{stats.userCount}</div>
        <div style={styles.statLabel}>User</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statValue}>{stats.systemCount}</div>
        <div style={styles.statLabel}>System</div>
      </div>
    </div>
  );
};

export const ActivityToolbar: React.FC = () => {
  const { filter, setFilter, clearFilters, users, exportActivities } = useActivityLog();

  const categories: ActivityCategory[] = ['all', 'content', 'media', 'user', 'comment', 'system'];

  return (
    <div style={styles.toolbar}>
      <div style={styles.filterGroup}>
        <label style={styles.label}>Category:</label>
        <select
          value={filter.category || 'all'}
          onChange={(e) => setFilter({ ...filter, category: e.target.value as ActivityCategory })}
          style={styles.select}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>User:</label>
        <select
          value={filter.userId || ''}
          onChange={(e) => setFilter({ ...filter, userId: e.target.value || undefined })}
          style={styles.select}
        >
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>From:</label>
        <input
          type="date"
          value={filter.dateFrom?.toISOString().split('T')[0] || ''}
          onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
          style={styles.input}
        />
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>To:</label>
        <input
          type="date"
          value={filter.dateTo?.toISOString().split('T')[0] || ''}
          onChange={(e) => setFilter({ ...filter, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
          style={styles.input}
        />
      </div>

      <div style={styles.searchWrapper}>
        <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={filter.search || ''}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          style={styles.searchInput}
        />
      </div>

      {(filter.category || filter.userId || filter.dateFrom || filter.dateTo || filter.search) && (
        <button style={styles.clearButton} onClick={clearFilters}>
          Clear Filters
        </button>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button style={styles.exportButton} onClick={() => exportActivities('csv')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>
    </div>
  );
};

export const ActivityItem: React.FC<{
  activity: Activity;
  showDetails?: boolean;
}> = ({ activity, showDetails = false }) => {
  const { getActivityIcon, getActivityColor, config } = useActivityLog();
  const [expanded, setExpanded] = useState(false);

  const iconStyle = activityIcons[activity.type];
  const catStyle = categoryColors[activity.category];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      style={{
        ...styles.activityItem,
        ...(activity.isImportant ? styles.activityItemImportant : {}),
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: '#f8fafc' }}
    >
      <div
        style={{
          ...styles.iconContainer,
          backgroundColor: iconStyle?.bg || '#f1f5f9',
        }}
      >
        {iconStyle?.icon || '📌'}
      </div>

      <div style={styles.activityContent}>
        <div style={styles.activityMain}>
          <div>
            <p style={styles.activityDescription}>
              <span style={styles.activityUser}>{activity.user.name}</span>
              {' '}{activity.description}
              {activity.target && (
                <>
                  {' '}
                  <a href={activity.target.url} style={styles.activityTarget}>
                    "{activity.target.title}"
                  </a>
                </>
              )}
            </p>
          </div>
          <span style={styles.activityTime}>{formatTime(activity.createdAt)}</span>
        </div>

        <div style={styles.activityMeta}>
          <span
            style={{
              ...styles.categoryBadge,
              backgroundColor: catStyle.bg,
              color: catStyle.text,
            }}
          >
            {activity.category}
          </span>
          <span style={styles.metaItem}>
            <img src={activity.user.avatar} alt="" style={styles.userAvatar} />
            {activity.user.role}
          </span>
          {config.showIPAddress && activity.ipAddress && (
            <span style={styles.metaItem}>IP: {activity.ipAddress}</span>
          )}
        </div>

        {activity.details && Object.keys(activity.details).length > 0 && (
          <>
            <button
              style={styles.expandButton}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide details' : 'Show details'}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={styles.detailsExpand}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(activity.details, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const ActivityList: React.FC = () => {
  const { activities, isLoading } = useActivityLog();

  if (isLoading) {
    return (
      <div style={styles.emptyState}>
        <p>Loading activities...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📋</div>
        <p>No activities found</p>
      </div>
    );
  }

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: { date: string; activities: Activity[] }[] = [];
    let currentDate = '';

    activities.forEach(activity => {
      const actDate = new Date(activity.createdAt).toDateString();
      if (actDate !== currentDate) {
        currentDate = actDate;
        groups.push({ date: actDate, activities: [activity] });
      } else {
        groups[groups.length - 1].activities.push(activity);
      }
    });

    return groups;
  }, [activities]);

  return (
    <div style={styles.activityList}>
      {groupedActivities.map(group => (
        <div key={group.date}>
          <div style={styles.dateSeparator}>
            {group.date === new Date().toDateString() ? 'Today' :
              group.date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' :
                group.date}
          </div>
          {group.activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ActivityPagination: React.FC = () => {
  const { currentPage, totalPages, setCurrentPage, activities } = useActivityLog();

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div style={styles.pagination}>
      <span style={styles.paginationInfo}>
        Showing {activities.length} activities
      </span>
      <div style={styles.paginationButtons}>
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
          }}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pages.map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              style={{
                ...styles.pageButton,
                ...(currentPage === page ? styles.pageButtonActive : {}),
              }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ) : (
            <span key={idx} style={{ padding: '0.5rem' }}>...</span>
          )
        ))}
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
          }}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ActivityLog: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Activity Log</h2>
      </div>
      <ActivityStats />
      <ActivityToolbar />
      <div style={styles.content}>
        <ActivityList />
      </div>
      <ActivityPagination />
    </div>
  );
};

export default ActivityLog;
