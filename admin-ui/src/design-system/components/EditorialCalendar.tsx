import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type ContentStatus = 'idea' | 'assigned' | 'writing' | 'review' | 'approved' | 'scheduled' | 'published';
export type ContentType = 'post' | 'page' | 'newsletter' | 'social' | 'video' | 'podcast';
export type CalendarView = 'month' | 'week' | 'day' | 'list' | 'timeline';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  color: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  assignee?: TeamMember;
  dueDate: Date;
  publishDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  description?: string;
  wordCount?: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorialCalendarConfig {
  workingDays: number[];
  defaultView: CalendarView;
  showWeekends: boolean;
  firstDayOfWeek: 0 | 1;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface EditorialCalendarContextValue {
  items: ContentItem[];
  teamMembers: TeamMember[];
  selectedDate: Date;
  currentView: CalendarView;
  selectedItem: ContentItem | null;
  filterAssignee: string | null;
  filterStatus: ContentStatus | null;
  filterType: ContentType | null;
  setSelectedDate: (date: Date) => void;
  setCurrentView: (view: CalendarView) => void;
  setSelectedItem: (item: ContentItem | null) => void;
  setFilterAssignee: (id: string | null) => void;
  setFilterStatus: (status: ContentStatus | null) => void;
  setFilterType: (type: ContentType | null) => void;
  createItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<ContentItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newDate: Date) => void;
  assignItem: (id: string, assigneeId: string) => void;
  getItemsForDate: (date: Date) => ContentItem[];
  getItemsForWeek: (startDate: Date) => ContentItem[];
  config: EditorialCalendarConfig;
}

const EditorialCalendarContext = createContext<EditorialCalendarContextValue | null>(null);

export const useEditorialCalendar = () => {
  const context = useContext(EditorialCalendarContext);
  if (!context) {
    throw new Error('useEditorialCalendar must be used within an EditorialCalendarProvider');
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
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navButtons: {
    display: 'flex',
    gap: '0.25rem',
  },
  navButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#3b82f6',
  },
  monthTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  viewTabs: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '0.25rem',
  },
  viewTab: {
    padding: '0.5rem 0.75rem',
    border: 'none',
    background: 'none',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  viewTabActive: {
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  filterButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  },
  weekdayHeader: {
    padding: '0.75rem',
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid #e2e8f0',
  },
  dayCell: {
    minHeight: '120px',
    padding: '0.5rem',
    borderRight: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  dayCellWeekend: {
    backgroundColor: '#fafafa',
  },
  dayCellOtherMonth: {
    backgroundColor: '#f8fafc',
  },
  dayCellToday: {
    backgroundColor: '#eff6ff',
  },
  dayNumber: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  dayNumberOther: {
    color: '#94a3b8',
  },
  dayNumberToday: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  itemCard: {
    padding: '0.375rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  itemDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  moreItems: {
    fontSize: '0.625rem',
    color: '#64748b',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
  },
  sidebar: {
    width: '350px',
    borderLeft: '1px solid #e2e8f0',
    backgroundColor: '#fafafa',
    overflowY: 'auto' as const,
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  closeButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '4px',
  },
  sidebarContent: {
    padding: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#64748b',
    marginBottom: '0.375rem',
    textTransform: 'uppercase' as const,
  },
  input: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0.5rem',
  },
  assigneeSelect: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  assigneeOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  assigneeOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  assigneeAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s',
  },
  listView: {
    padding: '1rem',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  listItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  },
  listItemTitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  listItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#64748b',
    fontSize: '0.75rem',
  },
  teamFilter: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto' as const,
  },
  teamMemberChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  teamMemberChipActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  chipAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
  },
};

const statusColors: Record<ContentStatus, { bg: string; text: string }> = {
  idea: { bg: '#f1f5f9', text: '#64748b' },
  assigned: { bg: '#dbeafe', text: '#1d4ed8' },
  writing: { bg: '#fef3c7', text: '#92400e' },
  review: { bg: '#e0e7ff', text: '#4338ca' },
  approved: { bg: '#d1fae5', text: '#065f46' },
  scheduled: { bg: '#cffafe', text: '#0e7490' },
  published: { bg: '#dcfce7', text: '#166534' },
};

const typeColors: Record<ContentType, string> = {
  post: '#3b82f6',
  page: '#10b981',
  newsletter: '#f59e0b',
  social: '#ec4899',
  video: '#ef4444',
  podcast: '#8b5cf6',
};

const priorityColors: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
};

// ============================================================================
// PROVIDER
// ============================================================================

interface EditorialCalendarProviderProps {
  children: React.ReactNode;
  initialItems?: ContentItem[];
  teamMembers?: TeamMember[];
  config?: Partial<EditorialCalendarConfig>;
  onItemCreate?: (item: ContentItem) => void;
  onItemUpdate?: (item: ContentItem) => void;
  onItemDelete?: (id: string) => void;
  onItemMove?: (id: string, newDate: Date) => void;
}

export const EditorialCalendarProvider: React.FC<EditorialCalendarProviderProps> = ({
  children,
  initialItems = [],
  teamMembers = [],
  config: configOverrides = {},
  onItemCreate,
  onItemUpdate,
  onItemDelete,
  onItemMove,
}) => {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContentStatus | null>(null);
  const [filterType, setFilterType] = useState<ContentType | null>(null);

  const config: EditorialCalendarConfig = {
    workingDays: [1, 2, 3, 4, 5],
    defaultView: 'month',
    showWeekends: true,
    firstDayOfWeek: 0,
    ...configOverrides,
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterAssignee && item.assignee?.id !== filterAssignee) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterType && item.type !== filterType) return false;
      return true;
    });
  }, [items, filterAssignee, filterStatus, filterType]);

  const getItemsForDate = useCallback((date: Date) => {
    return filteredItems.filter(item => {
      const itemDate = new Date(item.dueDate);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  }, [filteredItems]);

  const getItemsForWeek = useCallback((startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    return filteredItems.filter(item => {
      const itemDate = new Date(item.dueDate);
      return itemDate >= startDate && itemDate < endDate;
    });
  }, [filteredItems]);

  const createItem = useCallback((data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ContentItem = {
      ...data,
      id: `item-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => [...prev, newItem]);
    onItemCreate?.(newItem);
  }, [onItemCreate]);

  const updateItem = useCallback((id: string, updates: Partial<ContentItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates, updatedAt: new Date() };
        onItemUpdate?.(updated);
        return updated;
      }
      return item;
    }));
  }, [onItemUpdate]);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
    onItemDelete?.(id);
  }, [selectedItem, onItemDelete]);

  const moveItem = useCallback((id: string, newDate: Date) => {
    updateItem(id, { dueDate: newDate });
    onItemMove?.(id, newDate);
  }, [updateItem, onItemMove]);

  const assignItem = useCallback((id: string, assigneeId: string) => {
    const assignee = teamMembers.find(m => m.id === assigneeId);
    if (assignee) {
      updateItem(id, { assignee, status: 'assigned' });
    }
  }, [teamMembers, updateItem]);

  const value: EditorialCalendarContextValue = {
    items: filteredItems,
    teamMembers,
    selectedDate,
    currentView,
    selectedItem,
    filterAssignee,
    filterStatus,
    filterType,
    setSelectedDate,
    setCurrentView,
    setSelectedItem,
    setFilterAssignee,
    setFilterStatus,
    setFilterType,
    createItem,
    updateItem,
    deleteItem,
    moveItem,
    assignItem,
    getItemsForDate,
    getItemsForWeek,
    config,
  };

  return (
    <EditorialCalendarContext.Provider value={value}>
      {children}
    </EditorialCalendarContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const CalendarHeader: React.FC = () => {
  const { selectedDate, setSelectedDate, currentView, setCurrentView } = useEditorialCalendar();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const navigatePrev = () => {
    const newDate = new Date(selectedDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  const views: CalendarView[] = ['month', 'week', 'day', 'list'];

  return (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <div style={styles.navButtons}>
          <button style={styles.navButton} onClick={navigatePrev}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button style={styles.navButton} onClick={navigateNext}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <button style={styles.todayButton} onClick={goToToday}>Today</button>
        <h2 style={styles.monthTitle}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
      </div>
      <div style={styles.headerRight}>
        <div style={styles.viewTabs}>
          {views.map(view => (
            <button
              key={view}
              style={{
                ...styles.viewTab,
                ...(currentView === view ? styles.viewTabActive : {}),
              }}
              onClick={() => setCurrentView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TeamFilter: React.FC = () => {
  const { teamMembers, filterAssignee, setFilterAssignee } = useEditorialCalendar();

  return (
    <div style={styles.teamFilter}>
      <div
        style={{
          ...styles.teamMemberChip,
          ...(filterAssignee === null ? styles.teamMemberChipActive : {}),
        }}
        onClick={() => setFilterAssignee(null)}
      >
        All Team
      </div>
      {teamMembers.map(member => (
        <div
          key={member.id}
          style={{
            ...styles.teamMemberChip,
            ...(filterAssignee === member.id ? styles.teamMemberChipActive : {}),
          }}
          onClick={() => setFilterAssignee(filterAssignee === member.id ? null : member.id)}
        >
          <img
            src={member.avatar}
            alt={member.name}
            style={styles.chipAvatar}
          />
          {member.name}
        </div>
      ))}
    </div>
  );
};

export const ContentItemCard: React.FC<{
  item: ContentItem;
  compact?: boolean;
  onClick?: () => void;
}> = ({ item, compact, onClick }) => {
  const colors = statusColors[item.status];

  if (compact) {
    return (
      <motion.div
        style={{
          ...styles.itemCard,
          backgroundColor: colors.bg,
          color: colors.text,
        }}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <div style={{ ...styles.itemDot, backgroundColor: typeColors[item.type] }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={styles.listItem}
      onClick={onClick}
      whileHover={{ backgroundColor: '#f8fafc' }}
      layout
    >
      <div style={styles.listItemLeft}>
        <div style={{ ...styles.priorityDot, backgroundColor: priorityColors[item.priority] }} />
        <div style={{ ...styles.itemDot, backgroundColor: typeColors[item.type], width: '10px', height: '10px' }} />
        <span style={styles.listItemTitle}>{item.title}</span>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {item.status}
        </span>
      </div>
      <div style={styles.listItemMeta}>
        {item.assignee && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <img
              src={item.assignee.avatar}
              alt={item.assignee.name}
              style={{ width: '20px', height: '20px', borderRadius: '50%' }}
            />
            <span>{item.assignee.name}</span>
          </div>
        )}
        <span>
          {new Date(item.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </motion.div>
  );
};

export const DayCell: React.FC<{
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}> = ({ date, isCurrentMonth, isToday, isWeekend }) => {
  const { getItemsForDate, setSelectedItem, setSelectedDate, setCurrentView } = useEditorialCalendar();
  const items = getItemsForDate(date);
  const maxVisible = 3;
  const hiddenCount = Math.max(0, items.length - maxVisible);

  return (
    <motion.div
      style={{
        ...styles.dayCell,
        ...(isWeekend ? styles.dayCellWeekend : {}),
        ...(!isCurrentMonth ? styles.dayCellOtherMonth : {}),
        ...(isToday ? styles.dayCellToday : {}),
      }}
      onClick={() => {
        setSelectedDate(date);
        setCurrentView('day');
      }}
      whileHover={{ backgroundColor: '#f1f5f9' }}
    >
      <div
        style={{
          ...styles.dayNumber,
          ...(!isCurrentMonth ? styles.dayNumberOther : {}),
        }}
      >
        {isToday ? (
          <span style={styles.dayNumberToday}>{date.getDate()}</span>
        ) : (
          date.getDate()
        )}
      </div>
      <div style={styles.itemsContainer}>
        {items.slice(0, maxVisible).map(item => (
          <ContentItemCard
            key={item.id}
            item={item}
            compact
            onClick={(e: React.MouseEvent) => {
              e?.stopPropagation?.();
              setSelectedItem(item);
            }}
          />
        ))}
        {hiddenCount > 0 && (
          <div style={styles.moreItems}>+{hiddenCount} more</div>
        )}
      </div>
    </motion.div>
  );
};

export const MonthView: React.FC = () => {
  const { selectedDate, config } = useEditorialCalendar();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push(day);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <div style={styles.calendarGrid}>
      {weekdays.map(day => (
        <div key={day} style={styles.weekdayHeader}>{day}</div>
      ))}
      {days.map((date, index) => (
        <DayCell
          key={index}
          date={date}
          isCurrentMonth={date.getMonth() === selectedDate.getMonth()}
          isToday={
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          }
          isWeekend={date.getDay() === 0 || date.getDay() === 6}
        />
      ))}
    </div>
  );
};

export const ListView: React.FC = () => {
  const { items, setSelectedItem } = useEditorialCalendar();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [items]);

  return (
    <div style={styles.listView}>
      {sortedItems.map(item => (
        <ContentItemCard
          key={item.id}
          item={item}
          onClick={() => setSelectedItem(item)}
        />
      ))}
      {sortedItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No content items found
        </div>
      )}
    </div>
  );
};

export const ItemDetailSidebar: React.FC = () => {
  const { selectedItem, setSelectedItem, updateItem, deleteItem, teamMembers } = useEditorialCalendar();

  if (!selectedItem) return null;

  const statusOptions: ContentStatus[] = ['idea', 'assigned', 'writing', 'review', 'approved', 'scheduled', 'published'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const typeOptions: ContentType[] = ['post', 'page', 'newsletter', 'social', 'video', 'podcast'];

  return (
    <motion.div
      initial={{ x: 350 }}
      animate={{ x: 0 }}
      exit={{ x: 350 }}
      style={styles.sidebar}
    >
      <div style={styles.sidebarHeader}>
        <h3 style={styles.sidebarTitle}>Content Details</h3>
        <button style={styles.closeButton} onClick={() => setSelectedItem(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div style={styles.sidebarContent}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            value={selectedItem.title}
            onChange={(e) => updateItem(selectedItem.id, { title: e.target.value })}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Type</label>
          <select
            value={selectedItem.type}
            onChange={(e) => updateItem(selectedItem.id, { type: e.target.value as ContentType })}
            style={styles.select}
          >
            {typeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            value={selectedItem.status}
            onChange={(e) => updateItem(selectedItem.id, { status: e.target.value as ContentStatus })}
            style={styles.select}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Priority</label>
          <select
            value={selectedItem.priority}
            onChange={(e) => updateItem(selectedItem.id, { priority: e.target.value as ContentItem['priority'] })}
            style={styles.select}
          >
            {priorityOptions.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Due Date</label>
          <input
            type="date"
            value={new Date(selectedItem.dueDate).toISOString().split('T')[0]}
            onChange={(e) => updateItem(selectedItem.id, { dueDate: new Date(e.target.value) })}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Assignee</label>
          <div style={styles.assigneeSelect}>
            {teamMembers.map(member => (
              <div
                key={member.id}
                style={{
                  ...styles.assigneeOption,
                  ...(selectedItem.assignee?.id === member.id ? styles.assigneeOptionSelected : {}),
                }}
                onClick={() => updateItem(selectedItem.id, { assignee: member })}
              >
                <img src={member.avatar} alt={member.name} style={styles.assigneeAvatar} />
                <span style={{ fontSize: '0.75rem' }}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Progress ({selectedItem.progress}%)</label>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${selectedItem.progress}%`,
                backgroundColor: selectedItem.progress === 100 ? '#10b981' : '#3b82f6',
              }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedItem.progress}
            onChange={(e) => updateItem(selectedItem.id, { progress: parseInt(e.target.value) })}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            value={selectedItem.description || ''}
            onChange={(e) => updateItem(selectedItem.id, { description: e.target.value })}
            style={styles.textarea}
            placeholder="Add a description..."
          />
        </div>

        <button
          style={{
            ...styles.addButton,
            backgroundColor: '#ef4444',
            width: '100%',
            marginTop: '1rem',
          }}
          onClick={() => {
            if (window.confirm('Delete this item?')) {
              deleteItem(selectedItem.id);
            }
          }}
        >
          Delete Item
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EditorialCalendar: React.FC = () => {
  const { currentView, selectedItem } = useEditorialCalendar();

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ ...styles.container, flex: 1 }}>
        <CalendarHeader />
        <TeamFilter />
        <AnimatePresence mode="wait">
          {currentView === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MonthView />
            </motion.div>
          )}
          {(currentView === 'list' || currentView === 'week' || currentView === 'day') && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ListView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {selectedItem && <ItemDetailSidebar />}
      </AnimatePresence>
    </div>
  );
};

export default EditorialCalendar;
