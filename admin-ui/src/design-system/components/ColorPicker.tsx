/**
 * ColorPicker Component
 *
 * Color selection tool:
 * - Color spectrum picker
 * - Hue/saturation/lightness sliders
 * - Preset color swatches
 * - Hex/RGB/HSL input
 * - Opacity support
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, X, Check, Copy } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  alpha: number;
}

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  format?: 'hex' | 'rgb' | 'hsl';
  showAlpha?: boolean;
  presetColors?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  inline?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface ColorSpectrumProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (s: number, l: number) => void;
  className?: string;
}

export interface HueSliderProps {
  value: number;
  onChange: (hue: number) => void;
  className?: string;
}

export interface AlphaSliderProps {
  value: number;
  color: string;
  onChange: (alpha: number) => void;
  className?: string;
}

// ============================================================================
// Color Utilities
// ============================================================================

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const parseColor = (color: string): ColorValue => {
  let hex = '#000000';
  let rgb = { r: 0, g: 0, b: 0 };
  let hsl = { h: 0, s: 0, l: 0 };
  let alpha = 1;

  // Parse hex
  if (color.startsWith('#')) {
    hex = color.length === 4
      ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      : color.slice(0, 7);
    const parsed = hexToRgb(hex);
    if (parsed) {
      rgb = parsed;
      hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    }
    if (color.length === 9) {
      alpha = parseInt(color.slice(7, 9), 16) / 255;
    }
  }
  // Parse rgb/rgba
  else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      alpha = match[4] ? parseFloat(match[4]) : 1;
      hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    }
  }
  // Parse hsl/hsla
  else if (color.startsWith('hsl')) {
    const match = color.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*([\d.]+))?\)/);
    if (match) {
      hsl = { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
      alpha = match[4] ? parseFloat(match[4]) : 1;
      rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  }

  return { hex, rgb, hsl, alpha };
};

const formatColor = (color: ColorValue, format: 'hex' | 'rgb' | 'hsl', includeAlpha: boolean): string => {
  const alpha = includeAlpha ? color.alpha : 1;

  switch (format) {
    case 'hex':
      if (alpha < 1) {
        return color.hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
      }
      return color.hex;
    case 'rgb':
      if (alpha < 1) {
        return `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`;
      }
      return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    case 'hsl':
      if (alpha < 1) {
        return `hsla(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%, ${alpha})`;
      }
      return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    default:
      return color.hex;
  }
};

// Default preset colors
const defaultPresets = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#000000', '#525252', '#ffffff',
];

// ============================================================================
// Color Spectrum Component
// ============================================================================

export function ColorSpectrum({
  hue,
  saturation,
  lightness,
  onChange,
  className,
}: ColorSpectrumProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // x = saturation (0-100), y = lightness (100-0)
    onChange(Math.round(x * 100), Math.round((1 - y) * 100));
  }, [onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleInteraction(e);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-40 rounded-lg cursor-crosshair', className)}
      style={{
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
        `,
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleInteraction(e);
      }}
    >
      {/* Picker indicator */}
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `${saturation}%`,
          top: `${100 - lightness}%`,
          backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        }}
      />
    </div>
  );
}

// ============================================================================
// Hue Slider Component
// ============================================================================

export function HueSlider({ value, onChange, className }: HueSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 360));
  }, [onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleInteraction(e);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  return (
    <div
      ref={sliderRef}
      className={cn('relative w-full h-3 rounded-full cursor-pointer', className)}
      style={{
        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleInteraction(e);
      }}
    >
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 top-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `${(value / 360) * 100}%`,
          backgroundColor: `hsl(${value}, 100%, 50%)`,
        }}
      />
    </div>
  );
}

// ============================================================================
// Alpha Slider Component
// ============================================================================

export function AlphaSlider({ value, color, onChange, className }: AlphaSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 100) / 100);
  }, [onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleInteraction(e);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  return (
    <div
      ref={sliderRef}
      className={cn('relative w-full h-3 rounded-full cursor-pointer', className)}
      style={{
        background: `
          linear-gradient(to right, transparent, ${color}),
          repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 50% / 8px 8px
        `,
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleInteraction(e);
      }}
    >
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 top-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `${value * 100}%`,
          backgroundColor: color,
          opacity: value,
        }}
      />
    </div>
  );
}

// ============================================================================
// Color Swatches Component
// ============================================================================

export interface ColorSwatchesProps {
  colors: string[];
  value?: string;
  onChange?: (color: string) => void;
  columns?: number;
  className?: string;
}

export function ColorSwatches({
  colors,
  value,
  onChange,
  columns = 10,
  className,
}: ColorSwatchesProps) {
  return (
    <div
      className={cn('grid gap-1', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange?.(color)}
          className={cn(
            'w-6 h-6 rounded border transition-transform hover:scale-110',
            value?.toLowerCase() === color.toLowerCase()
              ? 'ring-2 ring-primary-500 ring-offset-2'
              : 'border-neutral-200 dark:border-neutral-700'
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Color Picker Component
// ============================================================================

export function ColorPicker({
  value = '#000000',
  onChange,
  format = 'hex',
  showAlpha = false,
  presetColors = defaultPresets,
  showInput = true,
  showPresets = true,
  inline = false,
  disabled = false,
  placeholder = 'Select color',
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState<ColorValue>(() => parseColor(value));
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = parseColor(value);
    setColor(parsed);
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = useCallback((newColor: Partial<ColorValue>) => {
    const updated = { ...color, ...newColor };

    // If HSL changed, update RGB and Hex
    if (newColor.hsl) {
      const rgb = hslToRgb(newColor.hsl.h, newColor.hsl.s, newColor.hsl.l);
      updated.rgb = rgb;
      updated.hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    // If RGB changed, update HSL and Hex
    else if (newColor.rgb) {
      updated.hsl = rgbToHsl(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
      updated.hex = rgbToHex(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
    }

    setColor(updated);
    const formatted = formatColor(updated, format, showAlpha);
    setInputValue(formatted);
    onChange?.(formatted);
  }, [color, format, showAlpha, onChange]);

  const handleSpectrumChange = (s: number, l: number) => {
    handleColorChange({ hsl: { ...color.hsl, s, l } });
  };

  const handleHueChange = (h: number) => {
    handleColorChange({ hsl: { ...color.hsl, h } });
  };

  const handleAlphaChange = (alpha: number) => {
    handleColorChange({ alpha });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the color
    try {
      const parsed = parseColor(newValue);
      if (parsed.hex !== '#000000' || newValue.toLowerCase() === '#000000' || newValue.toLowerCase() === 'black') {
        setColor(parsed);
        onChange?.(formatColor(parsed, format, showAlpha));
      }
    } catch {
      // Invalid color, don't update
    }
  };

  const handlePresetClick = (presetColor: string) => {
    const parsed = parseColor(presetColor);
    setColor(parsed);
    const formatted = formatColor(parsed, format, showAlpha);
    setInputValue(formatted);
    onChange?.(formatted);
  };

  const handleCopyColor = () => {
    navigator.clipboard.writeText(formatColor(color, format, showAlpha));
  };

  const pickerContent = (
    <div className={cn('bg-white dark:bg-neutral-900 rounded-lg shadow-lg border dark:border-neutral-700 p-4 w-64', !inline && 'absolute z-50 mt-1')}>
      {/* Color Spectrum */}
      <ColorSpectrum
        hue={color.hsl.h}
        saturation={color.hsl.s}
        lightness={color.hsl.l}
        onChange={handleSpectrumChange}
        className="mb-3"
      />

      {/* Hue Slider */}
      <HueSlider
        value={color.hsl.h}
        onChange={handleHueChange}
        className="mb-3"
      />

      {/* Alpha Slider */}
      {showAlpha && (
        <AlphaSlider
          value={color.alpha}
          color={color.hex}
          onChange={handleAlphaChange}
          className="mb-3"
        />
      )}

      {/* Input */}
      {showInput && (
        <div className="flex gap-2 mb-3">
          <div
            className="w-10 h-10 rounded border dark:border-neutral-700"
            style={{
              backgroundColor: color.hex,
              opacity: color.alpha,
            }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full px-2 py-1 text-sm border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
            />
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-neutral-500">
                RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopyColor}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          >
            <Copy className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div>
          <div className="text-xs text-neutral-500 mb-2">Preset Colors</div>
          <ColorSwatches
            colors={presetColors}
            value={color.hex}
            onChange={handlePresetClick}
            columns={10}
          />
        </div>
      )}
    </div>
  );

  if (inline) {
    return pickerContent;
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors',
          'bg-white dark:bg-neutral-900',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-neutral-400 dark:hover:border-neutral-600',
          'border-neutral-300 dark:border-neutral-700'
        )}
      >
        <div
          className="w-6 h-6 rounded border dark:border-neutral-600"
          style={{
            backgroundColor: color.hex,
            opacity: color.alpha,
          }}
        />
        <span className="text-sm">{inputValue || placeholder}</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {pickerContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Gradient Picker Component
// ============================================================================

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientPickerProps {
  value?: GradientStop[];
  onChange?: (stops: GradientStop[]) => void;
  direction?: number;
  onDirectionChange?: (direction: number) => void;
  className?: string;
}

export function GradientPicker({
  value = [
    { color: '#6366f1', position: 0 },
    { color: '#ec4899', position: 100 },
  ],
  onChange,
  direction = 90,
  onDirectionChange,
  className,
}: GradientPickerProps) {
  const [selectedStop, setSelectedStop] = useState(0);

  const gradientStyle = useMemo(() => {
    const stops = [...value].sort((a, b) => a.position - b.position);
    const gradientStops = stops.map(s => `${s.color} ${s.position}%`).join(', ');
    return `linear-gradient(${direction}deg, ${gradientStops})`;
  }, [value, direction]);

  const handleStopChange = (index: number, color: string) => {
    const newStops = [...value];
    newStops[index] = { ...newStops[index], color };
    onChange?.(newStops);
  };

  const handlePositionChange = (index: number, position: number) => {
    const newStops = [...value];
    newStops[index] = { ...newStops[index], position };
    onChange?.(newStops);
  };

  const addStop = () => {
    const newPosition = 50;
    onChange?.([...value, { color: '#ffffff', position: newPosition }]);
  };

  const removeStop = (index: number) => {
    if (value.length > 2) {
      onChange?.(value.filter((_, i) => i !== index));
    }
  };

  return (
    <div className={cn('bg-white dark:bg-neutral-900 rounded-lg border dark:border-neutral-700 p-4', className)}>
      {/* Preview */}
      <div
        className="h-16 rounded-lg mb-4"
        style={{ background: gradientStyle }}
      />

      {/* Direction */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-neutral-500">Direction:</span>
        <input
          type="range"
          min={0}
          max={360}
          value={direction}
          onChange={(e) => onDirectionChange?.(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm w-12">{direction}°</span>
      </div>

      {/* Stops */}
      <div className="space-y-3">
        {value.map((stop, i) => (
          <div key={i} className="flex items-center gap-3">
            <button
              onClick={() => setSelectedStop(i)}
              className={cn(
                'w-8 h-8 rounded border-2 transition-all',
                selectedStop === i ? 'ring-2 ring-primary-500' : 'border-neutral-200 dark:border-neutral-700'
              )}
              style={{ backgroundColor: stop.color }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={stop.position}
              onChange={(e) => handlePositionChange(i, Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-12">{stop.position}%</span>
            {value.length > 2 && (
              <button
                onClick={() => removeStop(i)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Color picker for selected stop */}
      {value[selectedStop] && (
        <div className="mt-4 pt-4 border-t dark:border-neutral-700">
          <ColorPicker
            value={value[selectedStop].color}
            onChange={(color) => handleStopChange(selectedStop, color)}
            inline
            showPresets={false}
          />
        </div>
      )}

      {/* Add stop button */}
      <button
        onClick={addStop}
        className="mt-4 w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
      >
        + Add Color Stop
      </button>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default ColorPicker;
