import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ScheduledItemStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface ScheduledItem {
  id: string;
  title: string;
  type: 'post' | 'page' | 'newsletter' | 'social' | 'event';
  scheduledDate: Date;
  status: ScheduledItemStatus;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: string;
  color?: string;
  duration?: number; // in minutes
  description?: string;
  thumbnail?: string;
}

export interface CalendarConfig {
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  showWeekNumbers?: boolean;
  minDate?: Date;
  maxDate?: Date;
  workingHoursStart?: number;
  workingHoursEnd?: number;
  defaultView?: CalendarView;
  enableDragDrop?: boolean;
  showTypeFilter?: boolean;
  timeSlotInterval?: number; // in minutes
}

interface ScheduleContextType {
  items: ScheduledItem[];
  setItems: React.Dispatch<React.SetStateAction<ScheduledItem[]>>;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  selectedItem: ScheduledItem | null;
  setSelectedItem: (item: ScheduledItem | null) => void;
  config: CalendarConfig;
  typeFilter: Set<ScheduledItem['type']>;
  setTypeFilter: React.Dispatch<React.SetStateAction<Set<ScheduledItem['type']>>>;
  rescheduleItem: (itemId: string, newDate: Date) => void;
  addItem: (item: Omit<ScheduledItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<ScheduledItem>) => void;
  deleteItem: (id: string) => void;
  getItemsForDate: (date: Date) => ScheduledItem[];
  getItemsForDateRange: (start: Date, end: Date) => ScheduledItem[];
}

// ============================================================================
// CONTEXT
// ============================================================================

const ScheduleContext = createContext<ScheduleContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ScheduleProviderProps {
  children: React.ReactNode;
  initialItems?: ScheduledItem[];
  initialConfig?: CalendarConfig;
  onItemsChange?: (items: ScheduledItem[]) => void;
  onReschedule?: (item: ScheduledItem, oldDate: Date, newDate: Date) => void;
  onItemClick?: (item: ScheduledItem) => void;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({
  children,
  initialItems = [],
  initialConfig = {},
  onItemsChange,
  onReschedule,
}) => {
  const [items, setItems] = useState<ScheduledItem[]>(initialItems);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialConfig.defaultView || 'month');
  const [selectedItem, setSelectedItem] = useState<ScheduledItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<Set<ScheduledItem['type']>>(
    new Set(['post', 'page', 'newsletter', 'social', 'event'])
  );

  const config: CalendarConfig = {
    firstDayOfWeek: 0,
    showWeekNumbers: false,
    workingHoursStart: 9,
    workingHoursEnd: 18,
    enableDragDrop: true,
    showTypeFilter: true,
    timeSlotInterval: 30,
    ...initialConfig,
  };

  const rescheduleItem = useCallback((itemId: string, newDate: Date) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const oldDate = item.scheduledDate;
          const newItem = { ...item, scheduledDate: newDate };
          onReschedule?.(newItem, oldDate, newDate);
          return newItem;
        }
        return item;
      });
      onItemsChange?.(updated);
      return updated;
    });
  }, [onItemsChange, onReschedule]);

  const addItem = useCallback((item: Omit<ScheduledItem, 'id'>) => {
    const newItem: ScheduledItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setItems(prev => {
      const updated = [...prev, newItem];
      onItemsChange?.(updated);
      return updated;
    });
  }, [onItemsChange]);

  const updateItem = useCallback((id: string, updates: Partial<ScheduledItem>) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      onItemsChange?.(updated);
      return updated;
    });
  }, [onItemsChange]);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      onItemsChange?.(updated);
      return updated;
    });
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  }, [onItemsChange, selectedItem]);

  const getItemsForDate = useCallback((date: Date): ScheduledItem[] => {
    return items.filter(item => {
      if (!typeFilter.has(item.type)) return false;
      const itemDate = new Date(item.scheduledDate);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  }, [items, typeFilter]);

  const getItemsForDateRange = useCallback((start: Date, end: Date): ScheduledItem[] => {
    return items.filter(item => {
      if (!typeFilter.has(item.type)) return false;
      const itemDate = new Date(item.scheduledDate);
      return itemDate >= start && itemDate <= end;
    });
  }, [items, typeFilter]);

  return (
    <ScheduleContext.Provider value={{
      items,
      setItems,
      currentDate,
      setCurrentDate,
      view,
      setView,
      selectedItem,
      setSelectedItem,
      config,
      typeFilter,
      setTypeFilter,
      rescheduleItem,
      addItem,
      updateItem,
      deleteItem,
      getItemsForDate,
      getItemsForDateRange,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add days from previous month to fill the first week
  const startOffset = firstDay.getDay();
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Add all days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the last week
  const endOffset = 6 - lastDay.getDay();
  for (let i = 1; i <= endOffset; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

const getWeekDays = (date: Date): Date[] => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), diff + i));
  }

  return days;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isToday = (date: Date): boolean => isSameDay(date, new Date());

const typeColors: Record<ScheduledItem['type'], { bg: string; text: string; border: string }> = {
  post: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-400' },
  page: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-400' },
  newsletter: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-400' },
  social: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300', border: 'border-pink-400' },
  event: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-400' },
};

const typeIcons: Record<ScheduledItem['type'], string> = {
  post: '📝',
  page: '📄',
  newsletter: '📧',
  social: '📱',
  event: '📅',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Calendar Header
export const CalendarHeader: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentDate, setCurrentDate, view, setView } = useSchedule();

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTitle = (): string => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${formatDateShort(start)} - ${formatDateShort(end)}, ${end.getFullYear()}`;
    } else if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    return '';
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={navigatePrev}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ◀
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ▶
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              view === v
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

// Type Filter
export const TypeFilter: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { typeFilter, setTypeFilter, config } = useSchedule();

  if (!config.showTypeFilter) return null;

  const types: ScheduledItem['type'][] = ['post', 'page', 'newsletter', 'social', 'event'];

  const toggleType = (type: ScheduledItem['type']) => {
    setTypeFilter(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {types.map((type) => (
        <button
          key={type}
          onClick={() => toggleType(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            typeFilter.has(type)
              ? `${typeColors[type].bg} ${typeColors[type].text}`
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-50'
          }`}
        >
          <span>{typeIcons[type]}</span>
          <span className="capitalize">{type}</span>
        </button>
      ))}
    </div>
  );
};

// Month View
export const MonthView: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentDate, getItemsForDate, setSelectedItem, setCurrentDate, setView } = useSchedule();
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={className}>
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-gray-200 dark:border-gray-700">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dayItems = getItemsForDate(day);
          const displayItems = dayItems.slice(0, 3);
          const moreCount = dayItems.length - displayItems.length;

          return (
            <div
              key={index}
              className={`min-h-[100px] border-r border-b border-gray-200 dark:border-gray-700 p-1 ${
                !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday(day)
                    ? 'bg-blue-600 text-white'
                    : isCurrentMonth
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-0.5">
                {displayItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate ${typeColors[item.type].bg} ${typeColors[item.type].text}`}
                  >
                    {formatTime(new Date(item.scheduledDate))} {item.title}
                  </motion.button>
                ))}
                {moreCount > 0 && (
                  <button
                    onClick={() => {
                      setCurrentDate(day);
                      setView('day');
                    }}
                    className="w-full text-left px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    +{moreCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View
export const WeekView: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentDate, getItemsForDate, setSelectedItem, config } = useSchedule();
  const days = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={`overflow-auto ${className}`}>
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="w-16" />
          {days.map((day, i) => (
            <div
              key={i}
              className={`py-3 text-center border-l border-gray-200 dark:border-gray-700 ${
                isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${
                isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700/50">
              <div className="w-16 py-4 pr-2 text-right text-xs text-gray-500">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              {days.map((day, i) => {
                const isWorkingHour = hour >= (config.workingHoursStart || 9) && hour < (config.workingHoursEnd || 18);
                return (
                  <div
                    key={i}
                    className={`border-l border-gray-200 dark:border-gray-700 h-12 ${
                      isWorkingHour ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  />
                );
              })}
            </div>
          ))}

          {/* Events overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-8">
              <div className="w-16" />
              {days.map((day, dayIndex) => {
                const dayItems = getItemsForDate(day);
                return (
                  <div key={dayIndex} className="relative border-l border-gray-200 dark:border-gray-700">
                    {dayItems.map((item) => {
                      const itemDate = new Date(item.scheduledDate);
                      const hour = itemDate.getHours();
                      const minutes = itemDate.getMinutes();
                      const top = (hour * 48) + (minutes / 60 * 48);
                      const duration = item.duration || 60;
                      const height = (duration / 60) * 48;

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          whileHover={{ scale: 1.02 }}
                          style={{ top: `${top}px`, height: `${Math.max(height, 24)}px` }}
                          className={`absolute left-1 right-1 pointer-events-auto rounded px-1.5 py-0.5 text-xs overflow-hidden border-l-2 ${typeColors[item.type].bg} ${typeColors[item.type].text} ${typeColors[item.type].border}`}
                        >
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs opacity-75">{formatTime(itemDate)}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Day View
export const DayView: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentDate, getItemsForDate, setSelectedItem, config } = useSchedule();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayItems = getItemsForDate(currentDate);

  return (
    <div className={`overflow-auto ${className}`}>
      <div className="min-w-[300px]">
        {/* Time Grid */}
        <div className="relative">
          {hours.map((hour) => {
            const isWorkingHour = hour >= (config.workingHoursStart || 9) && hour < (config.workingHoursEnd || 18);
            return (
              <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700/50">
                <div className="w-20 py-4 pr-2 text-right text-xs text-gray-500 flex-shrink-0">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className={`flex-1 h-16 border-l border-gray-200 dark:border-gray-700 ${
                  isWorkingHour ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                }`} />
              </div>
            );
          })}

          {/* Events overlay */}
          <div className="absolute inset-0 pointer-events-none pl-20">
            {dayItems.map((item) => {
              const itemDate = new Date(item.scheduledDate);
              const hour = itemDate.getHours();
              const minutes = itemDate.getMinutes();
              const top = (hour * 64) + (minutes / 60 * 64);
              const duration = item.duration || 60;
              const height = (duration / 60) * 64;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.01 }}
                  style={{ top: `${top}px`, height: `${Math.max(height, 32)}px` }}
                  className={`absolute left-2 right-4 pointer-events-auto rounded-lg p-2 text-left border-l-4 shadow-sm ${typeColors[item.type].bg} ${typeColors[item.type].text} ${typeColors[item.type].border}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[item.type]}</span>
                    <span className="font-medium truncate">{item.title}</span>
                  </div>
                  <div className="text-xs opacity-75 mt-0.5">{formatTime(itemDate)}</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Agenda View
export const AgendaView: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { items, setSelectedItem, typeFilter } = useSchedule();

  const upcomingItems = useMemo(() => {
    const now = new Date();
    return items
      .filter(item => typeFilter.has(item.type) && new Date(item.scheduledDate) >= now)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 50);
  }, [items, typeFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, ScheduledItem[]> = {};
    upcomingItems.forEach(item => {
      const dateKey = new Date(item.scheduledDate).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return groups;
  }, [upcomingItems]);

  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(groupedItems).map(([dateKey, items]) => (
        <div key={dateKey}>
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 px-4 -mx-4 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isToday(new Date(dateKey)) ? 'Today' : formatDateShort(new Date(dateKey))}
            </h3>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                whileHover={{ scale: 1.01 }}
                className={`w-full text-left p-4 rounded-lg border-l-4 ${typeColors[item.type].bg} ${typeColors[item.type].border} ${typeColors[item.type].text}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[item.type]}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className="text-sm opacity-75">
                    {formatTime(new Date(item.scheduledDate))}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm opacity-75 mt-1 line-clamp-2">{item.description}</p>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      {upcomingItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>No upcoming scheduled items</p>
        </div>
      )}
    </div>
  );
};

// Item Detail Modal
export const ItemDetailModal: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedItem, setSelectedItem, deleteItem, updateItem } = useSchedule();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  if (!selectedItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedItem(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden ${className}`}
        >
          {/* Header */}
          <div className={`p-4 ${typeColors[selectedItem.type].bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeIcons[selectedItem.type]}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${typeColors[selectedItem.type].text}`}>
                  {selectedItem.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-black/10 rounded"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-lg font-semibold px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedItem.title}
              </h3>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>📅 {formatDateShort(new Date(selectedItem.scheduledDate))}</span>
              <span>⏰ {formatTime(new Date(selectedItem.scheduledDate))}</span>
            </div>

            {selectedItem.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {selectedItem.description}
              </p>
            )}

            {selectedItem.author && (
              <div className="flex items-center gap-2">
                {selectedItem.author.avatar ? (
                  <img src={selectedItem.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                    {selectedItem.author.name[0]}
                  </div>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItem.author.name}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedItem.status === 'scheduled'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : selectedItem.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : selectedItem.status === 'failed'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    updateItem(selectedItem.id, { title: editedTitle });
                    setIsEditing(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setEditedTitle(selectedItem.title); setIsEditing(true); }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => { deleteItem(selectedItem.id); setSelectedItem(null); }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ScheduleCalendar: React.FC<{
  initialItems?: ScheduledItem[];
  initialConfig?: CalendarConfig;
  onItemsChange?: (items: ScheduledItem[]) => void;
  onReschedule?: (item: ScheduledItem, oldDate: Date, newDate: Date) => void;
  onItemClick?: (item: ScheduledItem) => void;
  className?: string;
}> = ({
  initialItems,
  initialConfig,
  onItemsChange,
  onReschedule,
  onItemClick,
  className = '',
}) => {
  return (
    <ScheduleProvider
      initialItems={initialItems}
      initialConfig={initialConfig}
      onItemsChange={onItemsChange}
      onReschedule={onReschedule}
      onItemClick={onItemClick}
    >
      <ScheduleCalendarContent className={className} />
    </ScheduleProvider>
  );
};

const ScheduleCalendarContent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { view } = useSchedule();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <CalendarHeader />
        <TypeFilter className="mt-4" />
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {view === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MonthView />
            </motion.div>
          )}
          {view === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[600px]"
            >
              <WeekView />
            </motion.div>
          )}
          {view === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[600px]"
            >
              <DayView />
            </motion.div>
          )}
          {view === 'agenda' && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[600px] overflow-auto"
            >
              <AgendaView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ItemDetailModal />
    </div>
  );
};

export default ScheduleCalendar;
