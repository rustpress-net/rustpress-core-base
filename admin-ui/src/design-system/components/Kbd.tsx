/**
 * Kbd Component (Enhancement #90)
 * Keyboard shortcut display and key combinations
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface KbdProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'subtle' | 'solid';
  className?: string;
}

export interface KeyComboProps {
  keys: string[];
  separator?: 'plus' | 'arrow' | 'then' | 'none';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'subtle' | 'solid';
  className?: string;
}

export interface ShortcutProps {
  shortcut: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'subtle' | 'solid';
  showSymbols?: boolean;
  className?: string;
}

export interface ShortcutLabelProps {
  label: string;
  shortcut: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md';
  className?: string;
}

export interface HotkeyProps {
  keys: string | string[];
  onActivate: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
  description?: string;
}

export interface HotkeyDisplayProps {
  hotkeys: { keys: string; description: string; category?: string }[];
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getSizeClasses = (size: string) => {
  const sizes: Record<string, string> = {
    xs: 'h-4 min-w-4 px-1 text-[10px]',
    sm: 'h-5 min-w-5 px-1.5 text-xs',
    md: 'h-6 min-w-6 px-2 text-sm',
    lg: 'h-8 min-w-8 px-2.5 text-base',
  };
  return sizes[size] || sizes.md;
};

const getVariantClasses = (variant: string) => {
  const variants: Record<string, string> = {
    default: `
      bg-neutral-100 dark:bg-neutral-800
      border border-neutral-200 dark:border-neutral-700
      border-b-2 border-b-neutral-300 dark:border-b-neutral-600
      text-neutral-700 dark:text-neutral-300
    `,
    outline: `
      bg-transparent
      border border-neutral-300 dark:border-neutral-600
      text-neutral-600 dark:text-neutral-400
    `,
    subtle: `
      bg-neutral-50 dark:bg-neutral-900
      text-neutral-500 dark:text-neutral-400
    `,
    solid: `
      bg-neutral-800 dark:bg-neutral-200
      text-white dark:text-neutral-900
    `,
  };
  return variants[variant] || variants.default;
};

// Platform detection
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// Key symbol mapping
const keySymbols: Record<string, { symbol: string; name: string }> = {
  mod: { symbol: isMac ? '⌘' : 'Ctrl', name: isMac ? 'Command' : 'Control' },
  ctrl: { symbol: isMac ? '⌃' : 'Ctrl', name: 'Control' },
  control: { symbol: isMac ? '⌃' : 'Ctrl', name: 'Control' },
  alt: { symbol: isMac ? '⌥' : 'Alt', name: isMac ? 'Option' : 'Alt' },
  option: { symbol: '⌥', name: 'Option' },
  shift: { symbol: '⇧', name: 'Shift' },
  meta: { symbol: isMac ? '⌘' : '⊞', name: isMac ? 'Command' : 'Windows' },
  cmd: { symbol: '⌘', name: 'Command' },
  command: { symbol: '⌘', name: 'Command' },
  enter: { symbol: '↵', name: 'Enter' },
  return: { symbol: '↵', name: 'Return' },
  tab: { symbol: '⇥', name: 'Tab' },
  space: { symbol: '␣', name: 'Space' },
  backspace: { symbol: '⌫', name: 'Backspace' },
  delete: { symbol: '⌦', name: 'Delete' },
  escape: { symbol: 'Esc', name: 'Escape' },
  esc: { symbol: 'Esc', name: 'Escape' },
  up: { symbol: '↑', name: 'Up Arrow' },
  down: { symbol: '↓', name: 'Down Arrow' },
  left: { symbol: '←', name: 'Left Arrow' },
  right: { symbol: '→', name: 'Right Arrow' },
  arrowup: { symbol: '↑', name: 'Up Arrow' },
  arrowdown: { symbol: '↓', name: 'Down Arrow' },
  arrowleft: { symbol: '←', name: 'Left Arrow' },
  arrowright: { symbol: '→', name: 'Right Arrow' },
  pageup: { symbol: '⇞', name: 'Page Up' },
  pagedown: { symbol: '⇟', name: 'Page Down' },
  home: { symbol: '↖', name: 'Home' },
  end: { symbol: '↘', name: 'End' },
  capslock: { symbol: '⇪', name: 'Caps Lock' },
};

const getKeyDisplay = (key: string, showSymbols: boolean): string => {
  const lowerKey = key.toLowerCase();
  const mapping = keySymbols[lowerKey];

  if (mapping) {
    return showSymbols ? mapping.symbol : mapping.name;
  }

  // Single character keys - uppercase
  if (key.length === 1) {
    return key.toUpperCase();
  }

  // Capitalize first letter
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const parseShortcut = (shortcut: string): string[] => {
  // Handle different separators: +, -, space
  return shortcut
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s*-\s*/g, '+')
    .split('+')
    .map((key) => key.trim())
    .filter(Boolean);
};

// ============================================================================
// Kbd Component
// ============================================================================

export function Kbd({
  children,
  size = 'md',
  variant = 'default',
  className = '',
}: KbdProps) {
  return (
    <kbd
      className={`
        inline-flex items-center justify-center
        font-mono font-medium
        rounded
        select-none
        ${getSizeClasses(size)}
        ${getVariantClasses(variant)}
        ${className}
      `}
    >
      {children}
    </kbd>
  );
}

// ============================================================================
// Key Combo Component
// ============================================================================

export function KeyCombo({
  keys,
  separator = 'plus',
  size = 'md',
  variant = 'default',
  className = '',
}: KeyComboProps) {
  const separatorElements: Record<string, React.ReactNode> = {
    plus: <span className="mx-0.5 text-neutral-400">+</span>,
    arrow: <span className="mx-1 text-neutral-400">→</span>,
    then: <span className="mx-1 text-neutral-400 text-xs">then</span>,
    none: null,
  };

  return (
    <span className={`inline-flex items-center ${className}`}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Kbd size={size} variant={variant}>
            {key}
          </Kbd>
          {index < keys.length - 1 && separatorElements[separator]}
        </React.Fragment>
      ))}
    </span>
  );
}

// ============================================================================
// Shortcut Component
// ============================================================================

export function Shortcut({
  shortcut,
  size = 'md',
  variant = 'default',
  showSymbols = true,
  className = '',
}: ShortcutProps) {
  const keys = parseShortcut(shortcut);
  const displayKeys = keys.map((key) => getKeyDisplay(key, showSymbols));

  return (
    <KeyCombo
      keys={displayKeys}
      size={size}
      variant={variant}
      className={className}
    />
  );
}

// ============================================================================
// Shortcut Label Component
// ============================================================================

export function ShortcutLabel({
  label,
  shortcut,
  position = 'right',
  size = 'md',
  className = '',
}: ShortcutLabelProps) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {position === 'left' && (
        <Shortcut shortcut={shortcut} size={size === 'sm' ? 'xs' : 'sm'} />
      )}
      <span className={`${textSize} text-neutral-700 dark:text-neutral-300`}>
        {label}
      </span>
      {position === 'right' && (
        <Shortcut shortcut={shortcut} size={size === 'sm' ? 'xs' : 'sm'} />
      )}
    </span>
  );
}

// ============================================================================
// Hotkey Hook
// ============================================================================

export function useHotkey({
  keys,
  onActivate,
  enabled = true,
  preventDefault = true,
}: HotkeyProps) {
  useEffect(() => {
    if (!enabled) return;

    const keyArray = Array.isArray(keys) ? keys : [keys];

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const keyCombo of keyArray) {
        const requiredKeys = parseShortcut(keyCombo);
        const modifiers = {
          ctrl: event.ctrlKey,
          control: event.ctrlKey,
          alt: event.altKey,
          option: event.altKey,
          shift: event.shiftKey,
          meta: event.metaKey,
          cmd: event.metaKey,
          command: event.metaKey,
          mod: isMac ? event.metaKey : event.ctrlKey,
        };

        let allMatch = true;

        for (const key of requiredKeys) {
          const lowerKey = key.toLowerCase();

          if (lowerKey in modifiers) {
            if (!modifiers[lowerKey as keyof typeof modifiers]) {
              allMatch = false;
              break;
            }
          } else {
            // Regular key
            const pressedKey = event.key.toLowerCase();
            const expectedKey = lowerKey;

            if (pressedKey !== expectedKey && event.code.toLowerCase() !== expectedKey) {
              allMatch = false;
              break;
            }
          }
        }

        // Check no extra modifiers are pressed
        const expectedModifiers = requiredKeys.map((k) => k.toLowerCase());
        if (!expectedModifiers.includes('ctrl') && !expectedModifiers.includes('control') && !expectedModifiers.includes('mod') && event.ctrlKey && !isMac) {
          allMatch = false;
        }
        if (!expectedModifiers.includes('alt') && !expectedModifiers.includes('option') && event.altKey) {
          allMatch = false;
        }
        if (!expectedModifiers.includes('shift') && event.shiftKey) {
          allMatch = false;
        }
        if (!expectedModifiers.includes('meta') && !expectedModifiers.includes('cmd') && !expectedModifiers.includes('command') && !expectedModifiers.includes('mod') && event.metaKey && isMac) {
          allMatch = false;
        }

        if (allMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          onActivate();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, onActivate, enabled, preventDefault]);
}

// ============================================================================
// Hotkey Provider Component
// ============================================================================

interface HotkeyRegistration {
  id: string;
  keys: string;
  description: string;
  category?: string;
}

const HotkeyContext = React.createContext<{
  register: (hotkey: HotkeyRegistration) => void;
  unregister: (id: string) => void;
  hotkeys: HotkeyRegistration[];
}>({
  register: () => {},
  unregister: () => {},
  hotkeys: [],
});

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const [hotkeys, setHotkeys] = useState<HotkeyRegistration[]>([]);

  const register = useCallback((hotkey: HotkeyRegistration) => {
    setHotkeys((prev) => [...prev.filter((h) => h.id !== hotkey.id), hotkey]);
  }, []);

  const unregister = useCallback((id: string) => {
    setHotkeys((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return (
    <HotkeyContext.Provider value={{ register, unregister, hotkeys }}>
      {children}
    </HotkeyContext.Provider>
  );
}

export function useHotkeyContext() {
  return React.useContext(HotkeyContext);
}

// ============================================================================
// Hotkey Display Component
// ============================================================================

export function HotkeyDisplay({
  hotkeys,
  className = '',
}: HotkeyDisplayProps) {
  // Group by category
  const grouped = hotkeys.reduce((acc, hotkey) => {
    const category = hotkey.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(hotkey);
    return acc;
  }, {} as Record<string, typeof hotkeys>);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            {category}
          </h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </span>
                <Shortcut shortcut={item.keys} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Animated Key Press Component
// ============================================================================

export interface AnimatedKeyProps {
  keyName: string;
  pressed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedKey({
  keyName,
  pressed = false,
  size = 'md',
}: AnimatedKeyProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <motion.div
      animate={{
        scale: pressed ? 0.95 : 1,
        y: pressed ? 2 : 0,
      }}
      transition={{ duration: 0.1 }}
      className={`
        inline-flex items-center justify-center
        font-mono font-semibold
        rounded-lg
        bg-gradient-to-b
        ${pressed
          ? 'from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700'
          : 'from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800'
        }
        border border-neutral-300 dark:border-neutral-600
        shadow-[0_2px_0_0_rgba(0,0,0,0.1)]
        ${pressed ? 'shadow-none' : ''}
        text-neutral-800 dark:text-neutral-200
        ${sizeClasses[size]}
      `}
    >
      {getKeyDisplay(keyName, true)}
    </motion.div>
  );
}

// ============================================================================
// Key Listener Display Component
// ============================================================================

export function KeyListenerDisplay({ className = '' }: { className?: string }) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => new Set([...prev, e.key]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const displayKeys = Array.from(pressedKeys);

  return (
    <div className={`flex items-center gap-2 min-h-[48px] ${className}`}>
      {displayKeys.length === 0 ? (
        <span className="text-sm text-neutral-400">Press any key...</span>
      ) : (
        displayKeys.map((key, index) => (
          <AnimatedKey key={`${key}-${index}`} keyName={key} pressed />
        ))
      )}
    </div>
  );
}

export default Kbd;
