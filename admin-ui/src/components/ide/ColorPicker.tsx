/**
 * ColorPicker - Inline color editing for CSS
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Pipette, RefreshCw } from 'lucide-react';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialColor?: string;
  onColorChange: (color: string) => void;
  position?: { x: number; y: number };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16)
  };
}

const presetColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#ffffff', '#000000', '#6b7280', '#374151',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onClose,
  initialColor = '#3b82f6',
  onColorChange,
  position
}) => {
  const [hex, setHex] = useState(initialColor);
  const [hsl, setHsl] = useState(() => hexToHsl(initialColor));
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  useEffect(() => {
    if (initialColor) {
      setHex(initialColor);
      setHsl(hexToHsl(initialColor));
    }
  }, [initialColor]);

  const updateColor = useCallback((newHsl: typeof hsl) => {
    setHsl(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHex(newHex);
    onColorChange(newHex);
  }, [onColorChange]);

  const handleHexChange = (value: string) => {
    if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
      setHex(value);
      if (value.length === 7) {
        setHsl(hexToHsl(value));
        onColorChange(value);
      }
    }
  };

  const colorString = useMemo(() => {
    switch (format) {
      case 'hex': return hex;
      case 'rgb': {
        const { r, g, b } = hexToRgb(hex);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 'hsl': return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
  }, [format, hex, hsl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(colorString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setHex(randomHex);
    setHsl(hexToHsl(randomHex));
    onColorChange(randomHex);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 w-64"
          style={{
            left: position?.x || '50%',
            top: position?.y || '50%',
            transform: position ? 'none' : 'translate(-50%, -50%)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Pipette className="w-4 h-4 text-blue-400" />
              Color Picker
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Color Preview */}
          <div
            className="h-24 rounded-lg mb-4 border border-gray-700"
            style={{ backgroundColor: hex }}
          />

          {/* Sliders */}
          <div className="space-y-4 mb-4">
            {/* Hue */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Hue: {hsl.h}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => updateColor({ ...hsl, h: parseInt(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'
                }}
              />
            </div>

            {/* Saturation */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Saturation: {hsl.s}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => updateColor({ ...hsl, s: parseInt(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
                style={{
                  background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`
                }}
              />
            </div>

            {/* Lightness */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Lightness: {hsl.l}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => updateColor({ ...hsl, l: parseInt(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #000, ${hslToHex(hsl.h, hsl.s, 50)}, #fff)`
                }}
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Presets</label>
            <div className="flex flex-wrap gap-1">
              {presetColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setHex(color);
                    setHsl(hexToHsl(color));
                    onColorChange(color);
                  }}
                  className="w-6 h-6 rounded border border-gray-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Color Value */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
              className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
            <input
              type="text"
              value={format === 'hex' ? hex : colorString}
              onChange={(e) => format === 'hex' && handleHexChange(e.target.value)}
              readOnly={format !== 'hex'}
              className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomColor}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Random
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ColorPicker;
