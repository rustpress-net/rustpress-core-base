/**
 * IndentGuides - Visual indentation guides and settings
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlignLeft, Eye, EyeOff, Palette
} from 'lucide-react';

export interface IndentGuidesSettings {
  enabled: boolean;
  showActiveGuide: boolean;
  highlightActiveIndent: boolean;
  colorMode: 'mono' | 'rainbow' | 'scope';
  monoColor: string;
  rainbowColors: string[];
  opacity: number;
  lineWidth: number;
  style: 'solid' | 'dashed' | 'dotted';
}

interface IndentGuidesProps {
  settings: IndentGuidesSettings;
  onSettingsChange: (settings: IndentGuidesSettings) => void;
}

const defaultRainbowColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

const styleOptions = [
  { value: 'solid', label: 'Solid', preview: '│' },
  { value: 'dashed', label: 'Dashed', preview: '¦' },
  { value: 'dotted', label: 'Dotted', preview: '┊' },
] as const;

export const IndentGuides: React.FC<IndentGuidesProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof IndentGuidesSettings>(
    key: K,
    value: IndentGuidesSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateRainbowColor = (index: number, color: string) => {
    const newColors = [...settings.rainbowColors];
    newColors[index] = color;
    updateSetting('rainbowColors', newColors);
  };

  // Preview component
  const PreviewGuides = () => {
    const getGuideStyle = (level: number) => {
      let color = settings.monoColor;
      if (settings.colorMode === 'rainbow') {
        color = settings.rainbowColors[level % settings.rainbowColors.length];
      } else if (settings.colorMode === 'scope') {
        const scopeColors = ['#3B82F6', '#10B981', '#F59E0B'];
        color = scopeColors[level % scopeColors.length];
      }

      return {
        borderLeft: `${settings.lineWidth}px ${settings.style} ${color}`,
        opacity: settings.opacity / 100,
      };
    };

    const previewLines = [
      { level: 0, text: 'function example() {' },
      { level: 1, text: '  const data = {' },
      { level: 2, text: '    items: [' },
      { level: 3, text: '      { id: 1 },' },
      { level: 3, text: '      { id: 2 }' },
      { level: 2, text: '    ]' },
      { level: 1, text: '  };' },
      { level: 1, text: '  return data;' },
      { level: 0, text: '}' },
    ];

    if (!settings.enabled) {
      return (
        <div className="font-mono text-xs text-gray-400">
          {previewLines.map((line, i) => (
            <div key={i} className="py-0.5">{line.text}</div>
          ))}
        </div>
      );
    }

    return (
      <div className="font-mono text-xs">
        {previewLines.map((line, i) => (
          <div key={i} className="flex">
            {/* Indent guides */}
            {Array.from({ length: line.level }).map((_, guideIndex) => (
              <div
                key={guideIndex}
                className="w-4 flex-shrink-0"
                style={getGuideStyle(guideIndex)}
              />
            ))}
            {/* Code text */}
            <span className="text-gray-300 py-0.5">{line.text.trim()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <AlignLeft className="w-4 h-4" />
          Indent Guides
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
          <div className="p-3 bg-gray-950 rounded-lg overflow-x-auto">
            <PreviewGuides />
          </div>
        </div>

        {/* Color Mode */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Color Mode</label>
          <div className="flex gap-2">
            {(['mono', 'rainbow', 'scope'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateSetting('colorMode', mode)}
                className={`flex-1 px-3 py-2 rounded text-xs transition-colors ${
                  settings.colorMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Mono Color */}
        {settings.colorMode === 'mono' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Guide Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.monoColor}
                onChange={(e) => updateSetting('monoColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={settings.monoColor}
                onChange={(e) => updateSetting('monoColor', e.target.value)}
                className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* Rainbow Colors */}
        {settings.colorMode === 'rainbow' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Rainbow Colors</label>
            <div className="flex gap-2 flex-wrap">
              {settings.rainbowColors.map((color, index) => (
                <div key={index} className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateRainbowColor(index, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                    title={`Level ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Line Style */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Line Style</label>
          <div className="grid grid-cols-3 gap-2">
            {styleOptions.map(({ value, label, preview }) => (
              <button
                key={value}
                onClick={() => updateSetting('style', value)}
                className={`p-2 rounded border transition-colors ${
                  settings.style === value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-2xl text-gray-400 mb-1 font-mono">{preview}</div>
                <span className="text-xs text-gray-400">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Line Width */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-400">Line Width</label>
            <span className="text-xs text-gray-500">{settings.lineWidth}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            value={settings.lineWidth}
            onChange={(e) => updateSetting('lineWidth', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-400">Opacity</label>
            <span className="text-xs text-gray-500">{settings.opacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={settings.opacity}
            onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Additional Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Options</label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Show active guide</span>
            <input
              type="checkbox"
              checked={settings.showActiveGuide}
              onChange={(e) => updateSetting('showActiveGuide', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Highlight active indent</span>
            <input
              type="checkbox"
              checked={settings.highlightActiveIndent}
              onChange={(e) => updateSetting('highlightActiveIndent', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        Visual guides help track code structure
      </div>
    </div>
  );
};

export default IndentGuides;
