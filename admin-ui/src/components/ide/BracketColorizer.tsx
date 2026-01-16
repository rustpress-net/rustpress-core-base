/**
 * BracketColorizer - Settings for colorizing matching brackets
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Eye, EyeOff, Settings, RefreshCw, Check
} from 'lucide-react';

export interface BracketColorizerSettings {
  enabled: boolean;
  colorizeParentheses: boolean;
  colorizeBrackets: boolean;
  colorizeBraces: boolean;
  colorizeAngleBrackets: boolean;
  highlightMatchingBracket: boolean;
  showVerticalGuides: boolean;
  colors: string[];
  independentColorPools: boolean;
  maxNestingLevel: number;
}

interface BracketColorizerProps {
  settings: BracketColorizerSettings;
  onSettingsChange: (settings: BracketColorizerSettings) => void;
  previewCode?: string;
}

const defaultColorPalettes = {
  rainbow: ['#FFD700', '#DA70D6', '#179FFF', '#FFD700', '#DA70D6', '#179FFF'],
  pastel: ['#F9A8D4', '#A5B4FC', '#6EE7B7', '#FDE68A', '#C4B5FD', '#FDBA74'],
  neon: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF6B6B', '#4ECDC4', '#FFE66D'],
  mono: ['#9CA3AF', '#6B7280', '#4B5563', '#9CA3AF', '#6B7280', '#4B5563'],
  ocean: ['#0EA5E9', '#06B6D4', '#14B8A6', '#0EA5E9', '#06B6D4', '#14B8A6'],
};

const bracketTypes = [
  { key: 'colorizeParentheses', label: 'Parentheses', symbol: '( )' },
  { key: 'colorizeBrackets', label: 'Brackets', symbol: '[ ]' },
  { key: 'colorizeBraces', label: 'Braces', symbol: '{ }' },
  { key: 'colorizeAngleBrackets', label: 'Angle Brackets', symbol: '< >' },
] as const;

export const BracketColorizer: React.FC<BracketColorizerProps> = ({
  settings,
  onSettingsChange,
  previewCode = 'function example() {\n  const arr = [1, (2 + 3), [4, 5]];\n  return { data: arr };\n}',
}) => {
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof defaultColorPalettes>('rainbow');
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  const updateSetting = <K extends keyof BracketColorizerSettings>(
    key: K,
    value: BracketColorizerSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const applyPalette = (paletteName: keyof typeof defaultColorPalettes) => {
    setSelectedPalette(paletteName);
    updateSetting('colors', defaultColorPalettes[paletteName]);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...settings.colors];
    newColors[index] = color;
    updateSetting('colors', newColors);
  };

  // Simple bracket colorization for preview
  const renderColorizedPreview = (code: string) => {
    if (!settings.enabled) return <span className="text-gray-300">{code}</span>;

    let depth = 0;
    const result: JSX.Element[] = [];
    let currentText = '';

    const brackets: Record<string, { close: string; enabled: boolean }> = {
      '(': { close: ')', enabled: settings.colorizeParentheses },
      '[': { close: ']', enabled: settings.colorizeBrackets },
      '{': { close: '}', enabled: settings.colorizeBraces },
      '<': { close: '>', enabled: settings.colorizeAngleBrackets },
    };
    const closers = Object.fromEntries(
      Object.entries(brackets).map(([open, { close }]) => [close, open])
    );

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      if (brackets[char] && brackets[char].enabled) {
        if (currentText) {
          result.push(<span key={`text-${i}`} className="text-gray-300">{currentText}</span>);
          currentText = '';
        }
        const color = settings.colors[depth % settings.colors.length];
        result.push(
          <span key={`bracket-${i}`} style={{ color }}>{char}</span>
        );
        depth++;
      } else if (closers[char] && brackets[closers[char]]?.enabled) {
        if (currentText) {
          result.push(<span key={`text-${i}`} className="text-gray-300">{currentText}</span>);
          currentText = '';
        }
        depth = Math.max(0, depth - 1);
        const color = settings.colors[depth % settings.colors.length];
        result.push(
          <span key={`bracket-${i}`} style={{ color }}>{char}</span>
        );
      } else {
        currentText += char;
      }
    }

    if (currentText) {
      result.push(<span key="text-final" className="text-gray-300">{currentText}</span>);
    }

    return result;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Bracket Colorizer
        </h3>
        <button
          onClick={() => updateSetting('enabled', !settings.enabled)}
          className={`p-1 rounded transition-colors ${
            settings.enabled
              ? 'text-blue-400 bg-blue-500/20'
              : 'text-gray-500 hover:text-gray-300'
          }`}
          title={settings.enabled ? 'Disable' : 'Enable'}
        >
          {settings.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Preview */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Preview</label>
          <div className="p-3 bg-gray-950 rounded-lg font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap">{renderColorizedPreview(previewCode)}</pre>
          </div>
        </div>

        {/* Bracket Types */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Bracket Types</label>
          <div className="grid grid-cols-2 gap-2">
            {bracketTypes.map(({ key, label, symbol }) => (
              <label
                key={key}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">{label}</span>
                  <code className="text-xs text-gray-500 bg-gray-700 px-1 rounded">{symbol}</code>
                </div>
                <input
                  type="checkbox"
                  checked={settings[key] as boolean}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Color Palettes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Color Palette</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(defaultColorPalettes) as (keyof typeof defaultColorPalettes)[]).map((palette) => (
              <button
                key={palette}
                onClick={() => applyPalette(palette)}
                className={`p-2 rounded border transition-colors ${
                  selectedPalette === palette
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex gap-1 mb-1">
                  {defaultColorPalettes[palette].slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 capitalize">{palette}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">Custom Colors</label>
            <span className="text-xs text-gray-500">{settings.colors.length} levels</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {settings.colors.map((color, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === index ? null : index)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    showColorPicker === index ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Level ${index + 1}`}
                />
                {showColorPicker === index && (
                  <div className="absolute top-full mt-2 left-0 z-10 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-24 h-24 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Additional Options</label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Highlight matching bracket</span>
            <input
              type="checkbox"
              checked={settings.highlightMatchingBracket}
              onChange={(e) => updateSetting('highlightMatchingBracket', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Show vertical guides</span>
            <input
              type="checkbox"
              checked={settings.showVerticalGuides}
              onChange={(e) => updateSetting('showVerticalGuides', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Independent color pools</span>
            <input
              type="checkbox"
              checked={settings.independentColorPools}
              onChange={(e) => updateSetting('independentColorPools', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>
        </div>

        {/* Max Nesting Level */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-400">Max Nesting Level</label>
            <span className="text-xs text-gray-500">{settings.maxNestingLevel}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={settings.maxNestingLevel}
            onChange={(e) => updateSetting('maxNestingLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        Colors cycle through {settings.colors.length} levels
      </div>
    </div>
  );
};

export default BracketColorizer;
