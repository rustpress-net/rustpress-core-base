/**
 * DistractionFreeMode Component (Post Enhancement #2)
 * Full-screen editor with minimal UI for focused writing
 */

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Minimize2,
  X,
  Moon,
  Sun,
  Type,
  AlignLeft,
  AlignCenter,
  Settings,
  Volume2,
  VolumeX,
  Music,
  Clock,
  Target,
  Check,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface DistractionFreeModeProps {
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  settings?: DistractionFreeSettings;
  onSettingsChange?: (settings: DistractionFreeSettings) => void;
  className?: string;
}

export interface DistractionFreeSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  fontFamily: 'sans' | 'serif' | 'mono';
  width: 'narrow' | 'medium' | 'wide';
  alignment: 'left' | 'center';
  ambientSound: 'none' | 'rain' | 'cafe' | 'forest' | 'ocean';
  typewriterMode: boolean;
  focusMode: boolean;
  showWordCount: boolean;
  showTimer: boolean;
  targetWords?: number;
}

export interface DistractionFreeToggleProps {
  isActive: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export interface FocusModeOverlayProps {
  activeLineIndex: number;
  totalLines: number;
  className?: string;
}

export interface WritingSessionProps {
  startTime: Date;
  wordsWritten: number;
  targetWords?: number;
  className?: string;
}

export interface AmbientSoundPlayerProps {
  sound: DistractionFreeSettings['ambientSound'];
  volume?: number;
  onSoundChange: (sound: DistractionFreeSettings['ambientSound']) => void;
  className?: string;
}

// ============================================================================
// Default Settings
// ============================================================================

export const defaultSettings: DistractionFreeSettings = {
  theme: 'dark',
  fontSize: 'medium',
  lineHeight: 'relaxed',
  fontFamily: 'serif',
  width: 'medium',
  alignment: 'left',
  ambientSound: 'none',
  typewriterMode: false,
  focusMode: false,
  showWordCount: true,
  showTimer: true,
};

// ============================================================================
// Context
// ============================================================================

interface DistractionFreeContextValue {
  isActive: boolean;
  settings: DistractionFreeSettings;
  updateSettings: (updates: Partial<DistractionFreeSettings>) => void;
  exit: () => void;
}

const DistractionFreeContext = createContext<DistractionFreeContextValue | null>(null);

export function useDistractionFree() {
  const context = useContext(DistractionFreeContext);
  if (!context) {
    throw new Error('useDistractionFree must be used within DistractionFreeMode');
  }
  return context;
}

// ============================================================================
// DistractionFreeMode Component
// ============================================================================

export function DistractionFreeMode({
  isActive,
  onToggle,
  children,
  settings: userSettings,
  onSettingsChange,
  className = '',
}: DistractionFreeModeProps) {
  const [settings, setSettings] = useState<DistractionFreeSettings>({
    ...defaultSettings,
    ...userSettings,
  });
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateSettings = useCallback((updates: Partial<DistractionFreeSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  }, [settings, onSettingsChange]);

  // Show controls on mouse movement near top
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.clientY < 60) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettings) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [showSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onToggle]);

  // Lock body scroll when active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-white text-neutral-900';
      case 'sepia':
        return 'bg-amber-50 text-amber-900';
      case 'dark':
      default:
        return 'bg-neutral-950 text-neutral-100';
    }
  };

  const getFontSizeClasses = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-base';
      case 'large':
        return 'text-xl';
      case 'xlarge':
        return 'text-2xl';
      case 'medium':
      default:
        return 'text-lg';
    }
  };

  const getLineHeightClasses = () => {
    switch (settings.lineHeight) {
      case 'compact':
        return 'leading-normal';
      case 'relaxed':
        return 'leading-loose';
      case 'normal':
      default:
        return 'leading-relaxed';
    }
  };

  const getFontFamilyClasses = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getWidthClasses = () => {
    switch (settings.width) {
      case 'narrow':
        return 'max-w-xl';
      case 'wide':
        return 'max-w-4xl';
      case 'medium':
      default:
        return 'max-w-2xl';
    }
  };

  const contextValue: DistractionFreeContextValue = {
    isActive,
    settings,
    updateSettings,
    exit: onToggle,
  };

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <DistractionFreeContext.Provider value={contextValue}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        className={`
          fixed inset-0 z-50
          ${getThemeClasses()}
          ${className}
        `}
      >
        {/* Top Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/30 to-transparent">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggle}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span className="text-sm">Exit</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded">Esc</kbd>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <DistractionFreeSettingsPanel
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="h-full overflow-y-auto">
          <div
            className={`
              mx-auto px-6 py-24
              ${getWidthClasses()}
              ${getFontSizeClasses()}
              ${getLineHeightClasses()}
              ${getFontFamilyClasses()}
              ${settings.alignment === 'center' ? 'text-center' : 'text-left'}
            `}
          >
            {children}
          </div>
        </div>

        {/* Bottom Stats */}
        {(settings.showWordCount || settings.showTimer) && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.5 }}
              whileHover={{ opacity: 1 }}
              className="flex items-center gap-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
            >
              {settings.showWordCount && (
                <WritingProgress targetWords={settings.targetWords} />
              )}
              {settings.showTimer && <SessionTimer />}
            </motion.div>
          </div>
        )}

        {/* Ambient Sound */}
        {settings.ambientSound !== 'none' && (
          <AmbientSoundIndicator sound={settings.ambientSound} />
        )}
      </motion.div>
    </DistractionFreeContext.Provider>
  );
}

// ============================================================================
// Settings Panel Component
// ============================================================================

interface SettingsPanelProps {
  settings: DistractionFreeSettings;
  onUpdate: (updates: Partial<DistractionFreeSettings>) => void;
  onClose: () => void;
}

function DistractionFreeSettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-neutral-900 shadow-2xl z-20 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Settings</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme */}
        <SettingSection title="Theme">
          <div className="flex gap-2">
            {(['light', 'dark', 'sepia'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => onUpdate({ theme })}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm capitalize
                  ${settings.theme === theme
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }
                `}
              >
                {theme === 'light' && <Sun className="w-4 h-4 mx-auto mb-1" />}
                {theme === 'dark' && <Moon className="w-4 h-4 mx-auto mb-1" />}
                {theme === 'sepia' && <span className="block text-lg mb-1">📜</span>}
                {theme}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Font Size */}
        <SettingSection title="Font Size">
          <div className="flex gap-1">
            {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onUpdate({ fontSize: size })}
                className={`
                  flex-1 px-2 py-1.5 rounded text-xs
                  ${settings.fontSize === size
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                  }
                `}
              >
                {size === 'small' && 'A'}
                {size === 'medium' && 'A'}
                {size === 'large' && 'A'}
                {size === 'xlarge' && 'A'}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Font Family */}
        <SettingSection title="Font">
          <div className="flex gap-2">
            {(['sans', 'serif', 'mono'] as const).map((font) => (
              <button
                key={font}
                onClick={() => onUpdate({ fontFamily: font })}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm
                  ${font === 'sans' ? 'font-sans' : font === 'serif' ? 'font-serif' : 'font-mono'}
                  ${settings.fontFamily === font
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                  }
                `}
              >
                Aa
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Width */}
        <SettingSection title="Editor Width">
          <div className="flex gap-2">
            {(['narrow', 'medium', 'wide'] as const).map((width) => (
              <button
                key={width}
                onClick={() => onUpdate({ width })}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm capitalize
                  ${settings.width === width
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                  }
                `}
              >
                {width}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Alignment */}
        <SettingSection title="Alignment">
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ alignment: 'left' })}
              className={`
                flex-1 px-3 py-2 rounded-lg
                ${settings.alignment === 'left'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800'
                }
              `}
            >
              <AlignLeft className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => onUpdate({ alignment: 'center' })}
              className={`
                flex-1 px-3 py-2 rounded-lg
                ${settings.alignment === 'center'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800'
                }
              `}
            >
              <AlignCenter className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </SettingSection>

        {/* Ambient Sound */}
        <SettingSection title="Ambient Sound">
          <div className="grid grid-cols-3 gap-2">
            {(['none', 'rain', 'cafe', 'forest', 'ocean'] as const).map((sound) => (
              <button
                key={sound}
                onClick={() => onUpdate({ ambientSound: sound })}
                className={`
                  px-3 py-2 rounded-lg text-sm capitalize
                  ${settings.ambientSound === sound
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                  }
                `}
              >
                {sound === 'none' && <VolumeX className="w-4 h-4 mx-auto mb-1" />}
                {sound === 'rain' && '🌧️'}
                {sound === 'cafe' && '☕'}
                {sound === 'forest' && '🌲'}
                {sound === 'ocean' && '🌊'}
                <span className="block text-xs">{sound}</span>
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Toggles */}
        <SettingSection title="Features">
          <div className="space-y-3">
            <ToggleSetting
              label="Typewriter Mode"
              description="Keep cursor centered"
              checked={settings.typewriterMode}
              onChange={(v) => onUpdate({ typewriterMode: v })}
            />
            <ToggleSetting
              label="Focus Mode"
              description="Fade non-active paragraphs"
              checked={settings.focusMode}
              onChange={(v) => onUpdate({ focusMode: v })}
            />
            <ToggleSetting
              label="Show Word Count"
              checked={settings.showWordCount}
              onChange={(v) => onUpdate({ showWordCount: v })}
            />
            <ToggleSetting
              label="Show Timer"
              checked={settings.showTimer}
              onChange={(v) => onUpdate({ showTimer: v })}
            />
          </div>
        </SettingSection>

        {/* Word Goal */}
        <SettingSection title="Word Goal">
          <input
            type="number"
            value={settings.targetWords || ''}
            onChange={(e) => onUpdate({ targetWords: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 1000"
            className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm"
          />
        </SettingSection>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <span className="text-sm text-neutral-900 dark:text-white">{label}</span>
        {description && (
          <p className="text-xs text-neutral-500">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          w-10 h-6 rounded-full transition-colors
          ${checked ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'}
        `}
      >
        <motion.div
          animate={{ x: checked ? 18 : 2 }}
          className="w-5 h-5 bg-white rounded-full shadow"
        />
      </button>
    </label>
  );
}

function WritingProgress({ targetWords }: { targetWords?: number }) {
  // This would get real word count from context
  const wordCount = 1247;
  const progress = targetWords ? (wordCount / targetWords) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Type className="w-4 h-4" />
      <span>{wordCount.toLocaleString()} words</span>
      {targetWords && (
        <>
          <span className="text-white/50">/ {targetWords.toLocaleString()}</span>
          {progress >= 100 && <Check className="w-4 h-4 text-green-400" />}
        </>
      )}
    </div>
  );
}

function SessionTimer() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4" />
      <span>{formatTime(elapsed)}</span>
    </div>
  );
}

function AmbientSoundIndicator({ sound }: { sound: DistractionFreeSettings['ambientSound'] }) {
  const icons: Record<string, string> = {
    rain: '🌧️',
    cafe: '☕',
    forest: '🌲',
    ocean: '🌊',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm"
    >
      <Volume2 className="w-4 h-4" />
      <span>{icons[sound] || sound}</span>
    </motion.div>
  );
}

// ============================================================================
// DistractionFreeToggle Component
// ============================================================================

export function DistractionFreeToggle({
  isActive,
  onToggle,
  size = 'md',
  showLabel = true,
  className = '',
}: DistractionFreeToggleProps) {
  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-2 py-1' },
    md: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-2' },
    lg: { icon: 'w-6 h-6', text: 'text-base', padding: 'px-4 py-2.5' },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.button
      onClick={onToggle}
      className={`
        inline-flex items-center gap-2 rounded-lg
        ${sizes.padding}
        ${isActive
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        }
        transition-colors
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive ? (
        <Minimize2 className={sizes.icon} />
      ) : (
        <Maximize2 className={sizes.icon} />
      )}
      {showLabel && (
        <span className={sizes.text}>
          {isActive ? 'Exit Focus' : 'Focus Mode'}
        </span>
      )}
    </motion.button>
  );
}

// ============================================================================
// Typewriter Mode Wrapper
// ============================================================================

export interface TypewriterModeProps {
  enabled: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TypewriterMode({ enabled, children, className = '' }: TypewriterModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleInput = () => {
      const selection = window.getSelection();
      if (selection && selection.focusNode) {
        const element = selection.focusNode.parentElement;
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const targetY = viewportHeight / 2;
          const currentY = rect.top + rect.height / 2;
          const scrollAmount = currentY - targetY;

          if (Math.abs(scrollAmount) > 50) {
            window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          }
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('input', handleInput);
    return () => container.removeEventListener('input', handleInput);
  }, [enabled]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// ============================================================================
// Focus Mode Paragraph Wrapper
// ============================================================================

export interface FocusModeParagraphProps {
  isFocused: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FocusModeParagraph({ isFocused, children, className = '' }: FocusModeParagraphProps) {
  return (
    <motion.div
      animate={{ opacity: isFocused ? 1 : 0.3 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default DistractionFreeMode;
