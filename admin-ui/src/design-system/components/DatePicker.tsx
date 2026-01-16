/**
 * DatePicker Component
 *
 * Date selection with calendar:
 * - Single date selection
 * - Month/year navigation
 * - Min/max date constraints
 * - Disabled dates
 * - Inline and popup modes
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  format?: string;
  showWeekNumbers?: boolean;
  showTodayButton?: boolean;
  showClearButton?: boolean;
  inline?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  inputClassName?: string;
  calendarClassName?: string;
}

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekNumbers?: boolean;
  showTodayButton?: boolean;
  highlightedDates?: Date[];
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date | null | undefined, date2: Date | null | undefined): boolean => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isDateDisabled = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[],
  disabledDaysOfWeek?: number[]
): boolean => {
  if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
  if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
  if (disabledDaysOfWeek?.includes(date.getDay())) return true;
  if (disabledDates?.some(d => isSameDay(d, date))) return true;
  return false;
};

const formatDate = (date: Date | null, format: string = 'MM/dd/yyyy', locale: string = 'en-US'): string => {
  if (!date) return '';

  const options: Intl.DateTimeFormatOptions = {};

  if (format.includes('yyyy')) options.year = 'numeric';
  else if (format.includes('yy')) options.year = '2-digit';

  if (format.includes('MMMM')) options.month = 'long';
  else if (format.includes('MMM')) options.month = 'short';
  else if (format.includes('MM')) options.month = '2-digit';
  else if (format.includes('M')) options.month = 'numeric';

  if (format.includes('dd')) options.day = '2-digit';
  else if (format.includes('d')) options.day = 'numeric';

  return date.toLocaleDateString(locale, options);
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// ============================================================================
// Calendar Component
// ============================================================================

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates,
  disabledDaysOfWeek,
  locale = 'en-US',
  firstDayOfWeek = 0,
  showWeekNumbers = false,
  showTodayButton = true,
  highlightedDates,
  className,
}: CalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(value || today);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Adjust for first day of week
  const adjustedFirstDay = (firstDay - firstDayOfWeek + 7) % 7;

  // Day names
  const dayNames = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7;
      const date = new Date(2024, 0, dayIndex); // Jan 2024 starts on Monday
      days.push(date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2));
    }
    return days;
  }, [locale, firstDayOfWeek]);

  // Month names
  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2024, i, 1).toLocaleDateString(locale, { month: 'long' })
    );
  }, [locale]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(year - 1, month, 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(year + 1, month, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    if (!isDateDisabled(newDate, minDate, maxDate, disabledDates, disabledDaysOfWeek)) {
      onChange?.(newDate);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(year, monthIndex, 1));
    setViewMode('days');
  };

  const handleYearSelect = (selectedYear: number) => {
    setViewDate(new Date(selectedYear, month, 1));
    setViewMode('months');
  };

  const handleTodayClick = () => {
    setViewDate(today);
    onChange?.(today);
  };

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length; // 6 rows × 7 days

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, adjustedFirstDay, daysInMonth]);

  // Generate years for year picker
  const yearRange = useMemo(() => {
    const startYear = Math.floor(year / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [year]);

  return (
    <div className={cn('w-72 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border dark:border-neutral-700 p-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevYear}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            <ChevronsLeft className="w-4 h-4 text-neutral-500" />
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
            className="px-2 py-1 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            {monthNames[month]}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
            className="px-2 py-1 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            {year}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>
          <button
            onClick={handleNextYear}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            <ChevronsRight className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'days' && (
          <motion.div
            key="days"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* Day names */}
            <div className={cn('grid gap-1 mb-1', showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7')}>
              {showWeekNumbers && (
                <div className="text-xs text-neutral-400 text-center py-1">W</div>
              )}
              {dayNames.map((day, i) => (
                <div key={i} className="text-xs text-neutral-500 text-center py-1 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className={cn('grid gap-1', showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7')}>
              {calendarDays.map((day, i) => {
                const date = new Date(day.year, day.month, day.day);
                const isDisabled = isDateDisabled(date, minDate, maxDate, disabledDates, disabledDaysOfWeek);
                const isSelected = isSameDay(date, value);
                const isToday = isSameDay(date, today);
                const isHighlighted = highlightedDates?.some(d => isSameDay(d, date));
                const showWeekNum = showWeekNumbers && i % 7 === 0;

                return (
                  <React.Fragment key={i}>
                    {showWeekNum && (
                      <div className="text-xs text-neutral-400 text-center py-1">
                        {getWeekNumber(date)}
                      </div>
                    )}
                    <button
                      onClick={() => day.isCurrentMonth && handleDateClick(day.day)}
                      disabled={isDisabled || !day.isCurrentMonth}
                      className={cn(
                        'w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors',
                        day.isCurrentMonth ? 'text-neutral-900 dark:text-white' : 'text-neutral-300 dark:text-neutral-600',
                        isDisabled && 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed',
                        !isDisabled && day.isCurrentMonth && 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        isSelected && 'bg-primary-500 text-white hover:bg-primary-600',
                        isToday && !isSelected && 'ring-1 ring-primary-500',
                        isHighlighted && !isSelected && 'bg-primary-100 dark:bg-primary-900/30'
                      )}
                    >
                      {day.day}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === 'months' && (
          <motion.div
            key="months"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-3 gap-2"
          >
            {monthNames.map((monthName, i) => (
              <button
                key={i}
                onClick={() => handleMonthSelect(i)}
                className={cn(
                  'py-2 text-sm rounded-lg transition-colors',
                  i === month ? 'bg-primary-500 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                {monthName.slice(0, 3)}
              </button>
            ))}
          </motion.div>
        )}

        {viewMode === 'years' && (
          <motion.div
            key="years"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-3 gap-2"
          >
            {yearRange.map((y) => (
              <button
                key={y}
                onClick={() => handleYearSelect(y)}
                className={cn(
                  'py-2 text-sm rounded-lg transition-colors',
                  y === year ? 'bg-primary-500 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                {y}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {showTodayButton && (
        <div className="mt-3 pt-3 border-t dark:border-neutral-700">
          <button
            onClick={handleTodayClick}
            className="w-full py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DatePicker Component
// ============================================================================

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabledDates,
  disabledDaysOfWeek,
  locale = 'en-US',
  firstDayOfWeek = 0,
  format = 'MM/dd/yyyy',
  showWeekNumbers = false,
  showTodayButton = true,
  showClearButton = true,
  inline = false,
  disabled = false,
  readOnly = false,
  error = false,
  errorMessage,
  className,
  inputClassName,
  calendarClassName,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (date: Date) => {
    onChange?.(date);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  if (inline) {
    return (
      <Calendar
        value={value}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        disabledDaysOfWeek={disabledDaysOfWeek}
        locale={locale}
        firstDayOfWeek={firstDayOfWeek}
        showWeekNumbers={showWeekNumbers}
        showTodayButton={showTodayButton}
        className={calendarClassName}
      />
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input */}
      <div
        onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors',
          'bg-white dark:bg-neutral-900',
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
            : 'border-neutral-300 dark:border-neutral-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
          disabled && 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800',
          inputClassName
        )}
      >
        <CalendarIcon className="w-4 h-4 text-neutral-400" />
        <span className={cn(
          'flex-1',
          value ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
        )}>
          {value ? formatDate(value, format, locale) : placeholder}
        </span>
        {showClearButton && value && !disabled && !readOnly && (
          <button
            onClick={handleClear}
            className="p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}

      {/* Calendar dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1"
          >
            <Calendar
              value={value}
              onChange={handleDateChange}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              disabledDaysOfWeek={disabledDaysOfWeek}
              locale={locale}
              firstDayOfWeek={firstDayOfWeek}
              showWeekNumbers={showWeekNumbers}
              showTodayButton={showTodayButton}
              className={calendarClassName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Mini Calendar
// ============================================================================

export interface MiniCalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  className?: string;
}

export function MiniCalendar({ value, onChange, className }: MiniCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(value || today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    return result;
  }, [firstDay, daysInMonth]);

  return (
    <div className={cn('w-48 p-2 bg-white dark:bg-neutral-900 rounded-lg border dark:border-neutral-700', className)}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-xs font-medium">
          {viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] text-neutral-400 py-0.5">{d}</div>
        ))}
        {days.map((day, i) => {
          const date = day ? new Date(year, month, day) : null;
          const isSelected = date && isSameDay(date, value);
          const isToday = date && isSameDay(date, today);

          return (
            <button
              key={i}
              onClick={() => day && onChange?.(new Date(year, month, day))}
              disabled={!day}
              className={cn(
                'w-5 h-5 text-[10px] rounded-full flex items-center justify-center',
                !day && 'invisible',
                day && 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                isSelected && 'bg-primary-500 text-white',
                isToday && !isSelected && 'ring-1 ring-primary-500'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default DatePicker;
