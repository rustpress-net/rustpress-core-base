/**
 * RustPress Date Range Picker Component
 * Calendar with presets and range selection
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { cn } from '../utils';
import { Button } from './Button';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  label: string;
  getValue: () => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: DateRangePreset[];
  showPresets?: boolean;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  numberOfMonths?: 1 | 2;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dateFormat?: (date: Date) => string;
  className?: string;
  label?: string;
  error?: string;
}

// Default presets
const defaultPresets: DateRangePreset[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return { start: today, end: today };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      return { start: yesterday, end: yesterday };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: 'This month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    },
  },
  {
    label: 'Last month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    },
  },
  {
    label: 'This year',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start, end };
    },
  },
];

// Default date format
const defaultDateFormat = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Calendar month component
interface CalendarMonthProps {
  month: Date;
  selectedRange: DateRange;
  hoverDate: Date | null;
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn: number;
}

function CalendarMonth({
  month,
  selectedRange,
  hoverDate,
  onDateClick,
  onDateHover,
  minDate,
  maxDate,
  weekStartsOn,
}: CalendarMonthProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const reorderedDays = [
    ...weekDays.slice(weekStartsOn),
    ...weekDays.slice(0, weekStartsOn),
  ];

  // Get days in month
  const getDaysInMonth = () => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    const days: (Date | null)[] = [];

    // Add empty slots for days before first day
    const firstDayOfWeek = (firstDay.getDay() - weekStartsOn + 7) % 7;
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, monthIndex, day));
    }

    return days;
  };

  const days = getDaysInMonth();

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (!selectedRange.start) return false;

    const rangeEnd = selectedRange.end || hoverDate;
    if (!rangeEnd) return false;

    const start = selectedRange.start < rangeEnd ? selectedRange.start : rangeEnd;
    const end = selectedRange.start < rangeEnd ? rangeEnd : selectedRange.start;

    return date >= start && date <= end;
  };

  // Check if date is start or end
  const isRangeStart = (date: Date) =>
    selectedRange.start && date.getTime() === selectedRange.start.getTime();

  const isRangeEnd = (date: Date) => {
    const end = selectedRange.end || (selectedRange.start && hoverDate);
    return end && date.getTime() === end.getTime();
  };

  // Check if date is disabled
  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div>
      {/* Month header */}
      <div className="text-center font-semibold text-neutral-900 dark:text-white mb-4">
        {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {reorderedDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-neutral-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }

          const disabled = isDisabled(date);
          const inRange = isInRange(date);
          const rangeStart = isRangeStart(date);
          const rangeEnd = isRangeEnd(date);
          const today = isToday(date);

          return (
            <button
              key={date.getTime()}
              type="button"
              disabled={disabled}
              onClick={() => onDateClick(date)}
              onMouseEnter={() => onDateHover(date)}
              onMouseLeave={() => onDateHover(null)}
              className={cn(
                'h-9 text-sm rounded-lg transition-colors relative',
                disabled
                  ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                inRange && 'bg-primary-100 dark:bg-primary-900/30',
                (rangeStart || rangeEnd) &&
                  'bg-primary-500 text-white hover:bg-primary-600',
                today && !rangeStart && !rangeEnd && 'font-bold text-primary-600'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  minDate,
  maxDate,
  presets = defaultPresets,
  showPresets = true,
  placeholder = 'Select date range',
  disabled = false,
  clearable = true,
  numberOfMonths = 2,
  weekStartsOn = 0,
  dateFormat = defaultDateFormat,
  className,
  label,
  error,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value.start) {
      return new Date(value.start.getFullYear(), value.start.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Second month (for two-month view)
  const secondMonth = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }, [currentMonth]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSelectionStart(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (!selectionStart) {
      // First click - start selection
      setSelectionStart(date);
      onChange?.({ start: date, end: null });
    } else {
      // Second click - complete selection
      const start = date < selectionStart ? date : selectionStart;
      const end = date < selectionStart ? selectionStart : date;
      onChange?.({ start, end });
      setSelectionStart(null);
      setIsOpen(false);
    }
  };

  // Handle preset click
  const handlePresetClick = (preset: DateRangePreset) => {
    const range = preset.getValue();
    onChange?.(range);
    setIsOpen(false);
    setSelectionStart(null);
  };

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.({ start: null, end: null });
    setSelectionStart(null);
  };

  // Format display value
  const displayValue = useMemo(() => {
    if (!value.start) return '';
    if (!value.end) return dateFormat(value.start);
    return `${dateFormat(value.start)} - ${dateFormat(value.end)}`;
  }, [value, dateFormat]);

  return (
    <div className={cn('space-y-1', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-left',
            'rounded-lg border transition-all',
            disabled
              ? 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-50'
              : isOpen
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : error
              ? 'border-error-500'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400',
            'bg-white dark:bg-neutral-900'
          )}
        >
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span
            className={cn(
              'flex-1',
              !displayValue && 'text-neutral-400'
            )}
          >
            {displayValue || placeholder}
          </span>
          {clearable && value.start && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-error-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 mt-1',
                'bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-700',
                'rounded-xl shadow-xl overflow-hidden'
              )}
            >
              <div className="flex">
                {/* Presets sidebar */}
                {showPresets && presets.length > 0 && (
                  <div className="w-40 border-r border-neutral-200 dark:border-neutral-700 p-2">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1 mb-1">
                      Quick Select
                    </div>
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className={cn(
                          'w-full text-left px-2 py-1.5 text-sm rounded-md',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                          'transition-colors'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Calendar section */}
                <div className="p-4">
                  {/* Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Calendars */}
                  <div className={cn('flex gap-8', numberOfMonths === 1 && 'gap-0')}>
                    <CalendarMonth
                      month={currentMonth}
                      selectedRange={value}
                      hoverDate={selectionStart ? hoverDate : null}
                      onDateClick={handleDateClick}
                      onDateHover={setHoverDate}
                      minDate={minDate}
                      maxDate={maxDate}
                      weekStartsOn={weekStartsOn}
                    />

                    {numberOfMonths === 2 && (
                      <CalendarMonth
                        month={secondMonth}
                        selectedRange={value}
                        hoverDate={selectionStart ? hoverDate : null}
                        onDateClick={handleDateClick}
                        onDateHover={setHoverDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        weekStartsOn={weekStartsOn}
                      />
                    )}
                  </div>

                  {/* Selection hint */}
                  {selectionStart && (
                    <div className="mt-4 text-sm text-neutral-500 text-center">
                      Click another date to complete the range
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}

// Single date picker
export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dateFormat?: (date: Date) => string;
  className?: string;
  label?: string;
  error?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  disabled = false,
  clearable = true,
  weekStartsOn = 0,
  dateFormat = defaultDateFormat,
  className,
  label,
  error,
}: DatePickerProps) {
  const handleChange = (range: DateRange) => {
    onChange?.(range.start);
  };

  return (
    <DateRangePicker
      value={{ start: value || null, end: value || null }}
      onChange={handleChange}
      minDate={minDate}
      maxDate={maxDate}
      placeholder={placeholder}
      disabled={disabled}
      clearable={clearable}
      numberOfMonths={1}
      weekStartsOn={weekStartsOn}
      dateFormat={dateFormat}
      showPresets={false}
      className={className}
      label={label}
      error={error}
    />
  );
}

// Date time picker
export interface DateTimePickerProps extends DatePickerProps {
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
}

export function DateTimePicker({
  value,
  onChange,
  showTime = true,
  timeFormat = '12h',
  ...props
}: DateTimePickerProps) {
  const [time, setTime] = useState({
    hours: value ? value.getHours() : 12,
    minutes: value ? value.getMinutes() : 0,
  });

  const handleDateChange = (date: Date | null) => {
    if (date) {
      date.setHours(time.hours, time.minutes);
    }
    onChange?.(date);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setTime({ hours, minutes });
    if (value) {
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange?.(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <DatePicker {...props} value={value} onChange={handleDateChange} />

      {showTime && (
        <div className="flex items-center gap-2">
          <select
            value={time.hours}
            onChange={(e) => handleTimeChange(Number(e.target.value), time.minutes)}
            className={cn(
              'px-3 py-2 rounded-lg border',
              'border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-900'
            )}
          >
            {Array.from({ length: timeFormat === '24h' ? 24 : 12 }, (_, i) =>
              timeFormat === '24h' ? i : i + 1
            ).map((hour) => (
              <option key={hour} value={timeFormat === '24h' ? hour : hour % 12 || 12}>
                {hour.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <span className="text-neutral-500">:</span>
          <select
            value={time.minutes}
            onChange={(e) => handleTimeChange(time.hours, Number(e.target.value))}
            className={cn(
              'px-3 py-2 rounded-lg border',
              'border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-900'
            )}
          >
            {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
              <option key={minute} value={minute}>
                {minute.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          {timeFormat === '12h' && (
            <select
              value={time.hours >= 12 ? 'PM' : 'AM'}
              onChange={(e) => {
                const isPM = e.target.value === 'PM';
                const hour = time.hours % 12;
                handleTimeChange(isPM ? hour + 12 : hour, time.minutes);
              }}
              className={cn(
                'px-3 py-2 rounded-lg border',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-900'
              )}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
