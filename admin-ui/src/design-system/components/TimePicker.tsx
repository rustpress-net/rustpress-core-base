/**
 * TimePicker Component
 *
 * Time selection component:
 * - 12/24 hour formats
 * - Hour/minute/second selection
 * - AM/PM toggle
 * - Scroll-based selection
 * - Keyboard navigation
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface TimePickerProps {
  value?: TimeValue | null;
  onChange?: (time: TimeValue | null) => void;
  placeholder?: string;
  format?: '12h' | '24h';
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  inline?: boolean;
  showClearButton?: boolean;
  className?: string;
}

export interface TimeInputProps {
  value?: TimeValue | null;
  onChange?: (time: TimeValue) => void;
  format?: '12h' | '24h';
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  className?: string;
}

export interface TimeSpinnerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  padZero?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatTimeValue = (time: TimeValue | null, format: '12h' | '24h', showSeconds: boolean): string => {
  if (!time) return '';

  let hours = time.hours;
  let period = '';

  if (format === '12h') {
    period = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  const parts = [
    hours.toString().padStart(2, '0'),
    time.minutes.toString().padStart(2, '0'),
  ];

  if (showSeconds && time.seconds !== undefined) {
    parts.push(time.seconds.toString().padStart(2, '0'));
  }

  return parts.join(':') + period;
};

const parseTimeString = (str: string, format: '12h' | '24h'): TimeValue | null => {
  const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const period = match[4]?.toUpperCase();

  if (format === '12h' && period) {
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  return { hours, minutes, seconds };
};

// ============================================================================
// TimeSpinner Component
// ============================================================================

export function TimeSpinner({
  value,
  onChange,
  min,
  max,
  step = 1,
  padZero = true,
  className,
}: TimeSpinnerProps) {
  const increment = () => {
    const newValue = value + step;
    onChange(newValue > max ? min : newValue);
  };

  const decrement = () => {
    const newValue = value - step;
    onChange(newValue < min ? max : newValue);
  };

  const displayValue = padZero ? value.toString().padStart(2, '0') : value.toString();

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <button
        type="button"
        onClick={increment}
        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
      >
        <ChevronUp className="w-4 h-4 text-neutral-500" />
      </button>
      <div className="w-10 h-10 flex items-center justify-center text-lg font-medium">
        {displayValue}
      </div>
      <button
        type="button"
        onClick={decrement}
        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
      >
        <ChevronDown className="w-4 h-4 text-neutral-500" />
      </button>
    </div>
  );
}

// ============================================================================
// TimeInput Component (Inline picker)
// ============================================================================

export function TimeInput({
  value,
  onChange,
  format = '24h',
  showSeconds = false,
  minuteStep = 1,
  secondStep = 1,
  className,
}: TimeInputProps) {
  const [localValue, setLocalValue] = useState<TimeValue>(
    value || { hours: 0, minutes: 0, seconds: 0 }
  );
  const [period, setPeriod] = useState<'AM' | 'PM'>(
    value && value.hours >= 12 ? 'PM' : 'AM'
  );

  useEffect(() => {
    if (value) {
      setLocalValue(value);
      setPeriod(value.hours >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  const handleHoursChange = (hours: number) => {
    let actualHours = hours;
    if (format === '12h') {
      if (period === 'PM' && hours !== 12) actualHours = hours + 12;
      if (period === 'AM' && hours === 12) actualHours = 0;
    }
    const newValue = { ...localValue, hours: actualHours };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleMinutesChange = (minutes: number) => {
    const newValue = { ...localValue, minutes };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleSecondsChange = (seconds: number) => {
    const newValue = { ...localValue, seconds };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    let hours = localValue.hours;
    if (newPeriod === 'PM' && hours < 12) hours += 12;
    if (newPeriod === 'AM' && hours >= 12) hours -= 12;
    const newValue = { ...localValue, hours };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const displayHours = format === '12h'
    ? (localValue.hours % 12) || 12
    : localValue.hours;

  return (
    <div className={cn('flex items-center gap-1 p-3 bg-white dark:bg-neutral-900 rounded-lg border dark:border-neutral-700', className)}>
      <TimeSpinner
        value={displayHours}
        onChange={handleHoursChange}
        min={format === '12h' ? 1 : 0}
        max={format === '12h' ? 12 : 23}
      />
      <span className="text-xl font-medium text-neutral-400">:</span>
      <TimeSpinner
        value={localValue.minutes}
        onChange={handleMinutesChange}
        min={0}
        max={59}
        step={minuteStep}
      />
      {showSeconds && (
        <>
          <span className="text-xl font-medium text-neutral-400">:</span>
          <TimeSpinner
            value={localValue.seconds || 0}
            onChange={handleSecondsChange}
            min={0}
            max={59}
            step={secondStep}
          />
        </>
      )}
      {format === '12h' && (
        <div className="flex flex-col ml-2">
          <button
            type="button"
            onClick={() => handlePeriodChange('AM')}
            className={cn(
              'px-2 py-1 text-xs font-medium rounded transition-colors',
              period === 'AM'
                ? 'bg-primary-500 text-white'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange('PM')}
            className={cn(
              'px-2 py-1 text-xs font-medium rounded transition-colors',
              period === 'PM'
                ? 'bg-primary-500 text-white'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            PM
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TimePicker Component
// ============================================================================

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  format = '24h',
  showSeconds = false,
  minuteStep = 1,
  secondStep = 1,
  minTime,
  maxTime,
  disabled = false,
  readOnly = false,
  error = false,
  errorMessage,
  inline = false,
  showClearButton = true,
  className,
}: TimePickerProps) {
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

  const handleTimeChange = (time: TimeValue) => {
    onChange?.(time);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  if (inline) {
    return (
      <TimeInput
        value={value}
        onChange={handleTimeChange}
        format={format}
        showSeconds={showSeconds}
        minuteStep={minuteStep}
        secondStep={secondStep}
        className={className}
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
          disabled && 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800'
        )}
      >
        <Clock className="w-4 h-4 text-neutral-400" />
        <span className={cn(
          'flex-1',
          value ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
        )}>
          {value ? formatTimeValue(value, format, showSeconds) : placeholder}
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

      {/* Time picker dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1"
          >
            <TimeInput
              value={value}
              onChange={handleTimeChange}
              format={format}
              showSeconds={showSeconds}
              minuteStep={minuteStep}
              secondStep={secondStep}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// TimeSlots Component
// ============================================================================

export interface TimeSlotsProps {
  slots: string[];
  value?: string;
  onChange?: (slot: string) => void;
  disabled?: string[];
  columns?: number;
  className?: string;
}

export function TimeSlots({
  slots,
  value,
  onChange,
  disabled = [],
  columns = 4,
  className,
}: TimeSlotsProps) {
  return (
    <div
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {slots.map((slot) => {
        const isDisabled = disabled.includes(slot);
        const isSelected = slot === value;

        return (
          <button
            key={slot}
            onClick={() => !isDisabled && onChange?.(slot)}
            disabled={isDisabled}
            className={cn(
              'px-3 py-2 text-sm rounded-lg border transition-colors',
              isDisabled && 'opacity-50 cursor-not-allowed',
              isSelected
                ? 'bg-primary-500 text-white border-primary-500'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Clock Face Component
// ============================================================================

export interface ClockFaceProps {
  value?: TimeValue | null;
  onChange?: (time: TimeValue) => void;
  mode?: 'hours' | 'minutes';
  format?: '12h' | '24h';
  size?: number;
  className?: string;
}

export function ClockFace({
  value,
  onChange,
  mode = 'hours',
  format = '12h',
  size = 200,
  className,
}: ClockFaceProps) {
  const [selecting, setSelecting] = useState(false);

  const numbers = useMemo(() => {
    if (mode === 'hours') {
      return format === '12h'
        ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    }
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }, [mode, format]);

  const currentValue = mode === 'hours' ? value?.hours : value?.minutes;
  const displayValue = mode === 'hours' && format === '12h'
    ? ((currentValue || 0) % 12) || 12
    : currentValue || 0;

  const handleClick = (num: number) => {
    if (mode === 'hours') {
      let hours = num;
      if (format === '12h' && value) {
        const isPM = value.hours >= 12;
        if (isPM && num !== 12) hours = num + 12;
        if (!isPM && num === 12) hours = 0;
      }
      onChange?.({ hours, minutes: value?.minutes || 0, seconds: value?.seconds || 0 });
    } else {
      onChange?.({ hours: value?.hours || 0, minutes: num, seconds: value?.seconds || 0 });
    }
  };

  const radius = size / 2 - 20;
  const innerRadius = format === '24h' && mode === 'hours' ? radius - 30 : radius;

  return (
    <div
      className={cn('relative rounded-full bg-neutral-100 dark:bg-neutral-800', className)}
      style={{ width: size, height: size }}
    >
      {numbers.map((num, i) => {
        const isInner = format === '24h' && mode === 'hours' && num >= 12;
        const r = isInner ? innerRadius - 10 : radius;
        const displayNum = format === '24h' && mode === 'hours' ? num : num;
        const index = isInner ? i - 12 : i;
        const angle = ((index * 30) - 90) * (Math.PI / 180);
        const x = size / 2 + r * Math.cos(angle);
        const y = size / 2 + r * Math.sin(angle);
        const isSelected = displayValue === num;

        return (
          <button
            key={num}
            onClick={() => handleClick(num)}
            className={cn(
              'absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              isSelected
                ? 'bg-primary-500 text-white'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              isInner && 'text-xs'
            )}
            style={{ left: x, top: y }}
          >
            {num.toString().padStart(2, '0')}
          </button>
        );
      })}

      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary-500" />

      {/* Hand */}
      {currentValue !== undefined && (
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-primary-500"
          style={{
            width: 2,
            height: radius - 10,
            transform: `translateX(-50%) rotate(${(displayValue * (mode === 'hours' ? 30 : 6)) - 180}deg)`,
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default TimePicker;
