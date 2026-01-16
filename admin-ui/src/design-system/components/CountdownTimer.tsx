/**
 * CountdownTimer Component (Enhancement #105)
 * Timer displays with various formats and styles
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock as ClockIcon, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  onTick?: (timeLeft: TimeLeft) => void;
  format?: 'full' | 'compact' | 'minimal' | 'digital';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  showLabels?: boolean;
  completedMessage?: string;
  className?: string;
}

export interface StopwatchProps {
  autoStart?: boolean;
  onTick?: (elapsed: number) => void;
  onLap?: (laps: number[]) => void;
  format?: 'full' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
  showLaps?: boolean;
  className?: string;
}

export interface TimerProps {
  duration: number;
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  format?: 'full' | 'compact' | 'circular';
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
  allowReset?: boolean;
  className?: string;
}

export interface ClockProps {
  timezone?: string;
  format?: '12h' | '24h';
  showSeconds?: boolean;
  showDate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'digital' | 'analog';
  className?: string;
}

export interface TimeDisplayProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padZeros?: boolean;
  animate?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

function formatTime(ms: number): { hours: number; minutes: number; seconds: number; centiseconds: number } {
  return {
    hours: Math.floor(ms / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
    centiseconds: Math.floor((ms % 1000) / 10),
  };
}

function padNumber(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
}

// ============================================================================
// TimeDisplay Component
// ============================================================================

export function TimeDisplay({
  value,
  label,
  size = 'md',
  padZeros = true,
  animate = true,
  className = '',
}: TimeDisplayProps) {
  const sizeClasses = {
    sm: { value: 'text-xl', label: 'text-xs' },
    md: { value: 'text-3xl', label: 'text-xs' },
    lg: { value: 'text-5xl', label: 'text-sm' },
    xl: { value: 'text-7xl', label: 'text-base' },
  };

  const sizes = sizeClasses[size];
  const displayValue = padZeros ? padNumber(value) : value.toString();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={animate ? { y: -20, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={animate ? { y: 20, opacity: 0 } : undefined}
          transition={{ duration: 0.2 }}
          className={`font-mono font-bold text-neutral-900 dark:text-white ${sizes.value}`}
        >
          {displayValue}
        </motion.div>
      </AnimatePresence>
      {label && (
        <span className={`text-neutral-500 dark:text-neutral-400 uppercase tracking-wider ${sizes.label}`}>
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// CountdownTimer Component
// ============================================================================

export function CountdownTimer({
  targetDate,
  onComplete,
  onTick,
  format = 'full',
  size = 'md',
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  showLabels = true,
  completedMessage = 'Time\'s up!',
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);
      onTick?.(newTimeLeft);

      if (newTimeLeft.total <= 0 && !completed) {
        setCompleted(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete, onTick, completed]);

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
          <AlertCircle className="w-6 h-6" />
          <span className="text-xl font-semibold">{completedMessage}</span>
        </div>
      </motion.div>
    );
  }

  const sizeClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  // Digital format (00:00:00:00)
  if (format === 'digital') {
    const parts = [];
    if (showDays && timeLeft.days > 0) parts.push(padNumber(timeLeft.days));
    if (showHours) parts.push(padNumber(timeLeft.hours));
    if (showMinutes) parts.push(padNumber(timeLeft.minutes));
    if (showSeconds) parts.push(padNumber(timeLeft.seconds));

    const fontSizes = {
      sm: 'text-2xl',
      md: 'text-4xl',
      lg: 'text-6xl',
      xl: 'text-8xl',
    };

    return (
      <div className={`font-mono font-bold text-neutral-900 dark:text-white ${fontSizes[size]} ${className}`}>
        {parts.join(':')}
      </div>
    );
  }

  // Minimal format (just numbers)
  if (format === 'minimal') {
    return (
      <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
        {showDays && <TimeDisplay value={timeLeft.days} size={size} />}
        {showHours && <TimeDisplay value={timeLeft.hours} size={size} />}
        {showMinutes && <TimeDisplay value={timeLeft.minutes} size={size} />}
        {showSeconds && <TimeDisplay value={timeLeft.seconds} size={size} />}
      </div>
    );
  }

  // Compact format (with labels in row)
  if (format === 'compact') {
    const items = [];
    if (showDays && timeLeft.days > 0) items.push({ value: timeLeft.days, label: 'd' });
    if (showHours) items.push({ value: timeLeft.hours, label: 'h' });
    if (showMinutes) items.push({ value: timeLeft.minutes, label: 'm' });
    if (showSeconds) items.push({ value: timeLeft.seconds, label: 's' });

    const fontSizes = {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
      xl: 'text-5xl',
    };

    return (
      <div className={`flex items-baseline gap-1 ${className}`}>
        {items.map((item, index) => (
          <span key={index} className={`font-mono font-bold text-neutral-900 dark:text-white ${fontSizes[size]}`}>
            {padNumber(item.value)}
            <span className="text-neutral-400 dark:text-neutral-500 text-[0.5em]">{item.label}</span>
          </span>
        ))}
      </div>
    );
  }

  // Full format (with card-like boxes)
  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {showDays && (timeLeft.days > 0 || !showHours) && (
        <>
          <TimeDisplay
            value={timeLeft.days}
            label={showLabels ? 'Days' : undefined}
            size={size}
          />
          <span className="text-neutral-300 dark:text-neutral-600 text-2xl">:</span>
        </>
      )}
      {showHours && (
        <>
          <TimeDisplay
            value={timeLeft.hours}
            label={showLabels ? 'Hours' : undefined}
            size={size}
          />
          <span className="text-neutral-300 dark:text-neutral-600 text-2xl">:</span>
        </>
      )}
      {showMinutes && (
        <>
          <TimeDisplay
            value={timeLeft.minutes}
            label={showLabels ? 'Minutes' : undefined}
            size={size}
          />
          {showSeconds && <span className="text-neutral-300 dark:text-neutral-600 text-2xl">:</span>}
        </>
      )}
      {showSeconds && (
        <TimeDisplay
          value={timeLeft.seconds}
          label={showLabels ? 'Seconds' : undefined}
          size={size}
        />
      )}
    </div>
  );
}

// ============================================================================
// Stopwatch Component
// ============================================================================

export function Stopwatch({
  autoStart = false,
  onTick,
  onLap,
  format = 'full',
  size = 'md',
  showControls = true,
  showLaps = true,
  className = '',
}: StopwatchProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        const newElapsed = Date.now() - startTimeRef.current;
        setElapsed(newElapsed);
        onTick?.(newElapsed);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsed, onTick]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const handleLap = () => {
    const newLaps = [...laps, elapsed];
    setLaps(newLaps);
    onLap?.(newLaps);
  };

  const time = formatTime(elapsed);

  const sizeClasses = {
    sm: { time: 'text-2xl', button: 'p-2', icon: 'w-4 h-4' },
    md: { time: 'text-4xl', button: 'p-3', icon: 'w-5 h-5' },
    lg: { time: 'text-6xl', button: 'p-4', icon: 'w-6 h-6' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`font-mono font-bold text-neutral-900 dark:text-white ${sizes.time}`}>
        {format === 'full' ? (
          <>
            {time.hours > 0 && `${padNumber(time.hours)}:`}
            {padNumber(time.minutes)}:{padNumber(time.seconds)}
            <span className="text-[0.5em] text-neutral-400">.{padNumber(time.centiseconds)}</span>
          </>
        ) : (
          <>
            {padNumber(time.minutes)}:{padNumber(time.seconds)}
          </>
        )}
      </div>

      {showControls && (
        <div className="flex items-center gap-2 mt-4">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className={`${sizes.button} rounded-full bg-green-500 text-white hover:bg-green-600`}
            >
              <Play className={sizes.icon} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className={`${sizes.button} rounded-full bg-yellow-500 text-white hover:bg-yellow-600`}
            >
              <Pause className={sizes.icon} />
            </motion.button>
          )}

          {isRunning && showLaps && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLap}
              className={`${sizes.button} rounded-full bg-blue-500 text-white hover:bg-blue-600`}
            >
              <ClockIcon className={sizes.icon} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className={`${sizes.button} rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300`}
          >
            <RotateCcw className={sizes.icon} />
          </motion.button>
        </div>
      )}

      {showLaps && laps.length > 0 && (
        <div className="mt-4 w-full max-w-xs">
          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Laps</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {laps.map((lap, index) => {
              const lapTime = formatTime(index === 0 ? lap : lap - laps[index - 1]);
              return (
                <div
                  key={index}
                  className="flex justify-between text-sm px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded"
                >
                  <span className="text-neutral-500">Lap {index + 1}</span>
                  <span className="font-mono">
                    {padNumber(lapTime.minutes)}:{padNumber(lapTime.seconds)}.{padNumber(lapTime.centiseconds)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Timer Component (Countdown from duration)
// ============================================================================

export function Timer({
  duration,
  autoStart = false,
  onComplete,
  onTick,
  format = 'full',
  size = 'md',
  showControls = true,
  allowReset = true,
  className = '',
}: TimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          const newRemaining = prev - 1000;
          onTick?.(newRemaining);

          if (newRemaining <= 0) {
            setIsRunning(false);
            setCompleted(true);
            onComplete?.();
            return 0;
          }
          return newRemaining;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remaining, onComplete, onTick]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setRemaining(duration);
    setCompleted(false);
  };

  const time = formatTime(remaining);
  const progress = ((duration - remaining) / duration) * 100;

  const sizeClasses = {
    sm: { time: 'text-2xl', button: 'p-2', icon: 'w-4 h-4', circle: 120 },
    md: { time: 'text-4xl', button: 'p-3', icon: 'w-5 h-5', circle: 160 },
    lg: { time: 'text-6xl', button: 'p-4', icon: 'w-6 h-6', circle: 200 },
  };

  const sizes = sizeClasses[size];

  if (format === 'circular') {
    const circumference = (sizes.circle - 8) * Math.PI;
    const strokeDashoffset = circumference * (1 - progress / 100);

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="relative" style={{ width: sizes.circle, height: sizes.circle }}>
          <svg className="w-full h-full -rotate-90">
            <circle
              cx={sizes.circle / 2}
              cy={sizes.circle / 2}
              r={(sizes.circle - 8) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <motion.circle
              cx={sizes.circle / 2}
              cy={sizes.circle / 2}
              r={(sizes.circle - 8) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              className={completed ? 'text-red-500' : 'text-primary-500'}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono font-bold ${sizes.time}`}>
              {padNumber(time.minutes)}:{padNumber(time.seconds)}
            </span>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-2 mt-4">
            {!isRunning && !completed ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className={`${sizes.button} rounded-full bg-green-500 text-white`}
              >
                <Play className={sizes.icon} />
              </motion.button>
            ) : !completed ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className={`${sizes.button} rounded-full bg-yellow-500 text-white`}
              >
                <Pause className={sizes.icon} />
              </motion.button>
            ) : null}

            {allowReset && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className={`${sizes.button} rounded-full bg-neutral-200 dark:bg-neutral-700`}
              >
                <RotateCcw className={sizes.icon} />
              </motion.button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`font-mono font-bold text-neutral-900 dark:text-white ${sizes.time}`}>
        {format === 'full' && time.hours > 0 && `${padNumber(time.hours)}:`}
        {padNumber(time.minutes)}:{padNumber(time.seconds)}
      </div>

      {showControls && (
        <div className="flex items-center gap-2 mt-4">
          {!isRunning && !completed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className={`${sizes.button} rounded-full bg-green-500 text-white`}
            >
              <Play className={sizes.icon} />
            </motion.button>
          ) : !completed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className={`${sizes.button} rounded-full bg-yellow-500 text-white`}
            >
              <Pause className={sizes.icon} />
            </motion.button>
          ) : null}

          {allowReset && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className={`${sizes.button} rounded-full bg-neutral-200 dark:bg-neutral-700`}
            >
              <RotateCcw className={sizes.icon} />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Clock Component (Real-time clock)
// ============================================================================

export function Clock({
  timezone,
  format: timeFormat = '12h',
  showSeconds = true,
  showDate = false,
  size = 'md',
  variant = 'digital',
  className = '',
}: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = useCallback(() => {
    if (timezone) {
      return new Date(time.toLocaleString('en-US', { timeZone: timezone }));
    }
    return time;
  }, [time, timezone]);

  const currentTime = getTimeInTimezone();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  const displayHours = timeFormat === '12h' ? hours % 12 || 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const sizeClasses = {
    sm: { time: 'text-2xl', date: 'text-sm', analog: 80 },
    md: { time: 'text-4xl', date: 'text-base', analog: 120 },
    lg: { time: 'text-6xl', date: 'text-lg', analog: 160 },
  };

  const sizes = sizeClasses[size];

  if (variant === 'analog') {
    const hourRotation = (hours % 12) * 30 + minutes * 0.5;
    const minuteRotation = minutes * 6;
    const secondRotation = seconds * 6;

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div
          className="relative rounded-full bg-white dark:bg-neutral-800 border-4 border-neutral-300 dark:border-neutral-600"
          style={{ width: sizes.analog, height: sizes.analog }}
        >
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-2 bg-neutral-400"
              style={{
                left: '50%',
                top: '4px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
                transformOrigin: `center ${sizes.analog / 2 - 4}px`,
              }}
            />
          ))}

          {/* Hour hand */}
          <motion.div
            className="absolute w-1 bg-neutral-900 dark:bg-white rounded-full"
            style={{
              height: sizes.analog * 0.25,
              left: '50%',
              bottom: '50%',
              transformOrigin: 'bottom center',
            }}
            animate={{ rotate: hourRotation }}
          />

          {/* Minute hand */}
          <motion.div
            className="absolute w-0.5 bg-neutral-700 dark:bg-neutral-300 rounded-full"
            style={{
              height: sizes.analog * 0.35,
              left: '50%',
              bottom: '50%',
              transformOrigin: 'bottom center',
            }}
            animate={{ rotate: minuteRotation }}
          />

          {/* Second hand */}
          {showSeconds && (
            <motion.div
              className="absolute w-px bg-red-500 rounded-full"
              style={{
                height: sizes.analog * 0.4,
                left: '50%',
                bottom: '50%',
                transformOrigin: 'bottom center',
              }}
              animate={{ rotate: secondRotation }}
              transition={{ type: 'tween', duration: 0.1 }}
            />
          )}

          {/* Center dot */}
          <div
            className="absolute w-2 h-2 bg-neutral-900 dark:bg-white rounded-full"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {showDate && (
          <p className={`mt-2 text-neutral-600 dark:text-neutral-400 ${sizes.date}`}>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`font-mono font-bold text-neutral-900 dark:text-white ${sizes.time}`}>
        {padNumber(displayHours)}:{padNumber(minutes)}
        {showSeconds && <span>:{padNumber(seconds)}</span>}
        {timeFormat === '12h' && (
          <span className="text-[0.4em] ml-1 text-neutral-500">{ampm}</span>
        )}
      </div>

      {showDate && (
        <p className={`text-neutral-600 dark:text-neutral-400 ${sizes.date}`}>
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// RelativeTime Component
// ============================================================================

export interface RelativeTimeProps {
  date: Date;
  updateInterval?: number;
  className?: string;
}

export function RelativeTime({
  date,
  updateInterval = 60000,
  className = '',
}: RelativeTimeProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), updateInterval);
    return () => clearInterval(timer);
  }, [updateInterval]);

  const getRelativeTime = () => {
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <time dateTime={date.toISOString()} className={className}>
      {getRelativeTime()}
    </time>
  );
}

// ============================================================================
// useCountdown Hook
// ============================================================================

export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// ============================================================================
// useStopwatch Hook
// ============================================================================

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed;
    setIsRunning(true);
  }, [elapsed]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return { elapsed, isRunning, start, pause, reset, ...formatTime(elapsed) };
}

export default CountdownTimer;
