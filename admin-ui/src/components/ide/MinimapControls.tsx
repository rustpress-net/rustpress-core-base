/**
 * MinimapControls - Toggle and configure the code minimap
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Map, Eye, EyeOff, Maximize2, Minimize2,
  AlignLeft, AlignRight, Layers, Settings
} from 'lucide-react';

export interface MinimapSettings {
  enabled: boolean;
  side: 'left' | 'right';
  showSlider: boolean;
  renderCharacters: boolean;
  maxColumn: number;
  scale: number;
  showDecorations: boolean;
  autohide: boolean;
}

interface MinimapControlsProps {
  settings: MinimapSettings;
  onSettingsChange: (settings: MinimapSettings) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const defaultSettings: MinimapSettings = {
  enabled: true,
  side: 'right',
  showSlider: true,
  renderCharacters: true,
  maxColumn: 120,
  scale: 1,
  showDecorations: true,
  autohide: false,
};

export const MinimapControls: React.FC<MinimapControlsProps> = ({
  settings = defaultSettings,
  onSettingsChange,
  isExpanded = false,
  onToggleExpand,
}) => {
  const updateSetting = <K extends keyof MinimapSettings>(
    key: K,
    value: MinimapSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Map className="w-4 h-4" />
          Minimap
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateSetting('enabled', !settings.enabled)}
            className={`p-1 rounded transition-colors ${
              settings.enabled
                ? 'text-blue-400 bg-blue-500/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title={settings.enabled ? 'Disable minimap' : 'Enable minimap'}
          >
            {settings.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Position */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Position</label>
          <div className="flex gap-2">
            <button
              onClick={() => updateSetting('side', 'left')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                settings.side === 'left'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              <span className="text-sm">Left</span>
            </button>
            <button
              onClick={() => updateSetting('side', 'right')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                settings.side === 'right'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <AlignRight className="w-4 h-4" />
              <span className="text-sm">Right</span>
            </button>
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-400">Scale</label>
            <span className="text-xs text-gray-500">{settings.scale}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={settings.scale}
            onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Max Column */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-400">Max Column</label>
            <span className="text-xs text-gray-500">{settings.maxColumn}</span>
          </div>
          <input
            type="range"
            min="40"
            max="300"
            step="10"
            value={settings.maxColumn}
            onChange={(e) => updateSetting('maxColumn', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Toggle Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Options</label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Show Slider</span>
            <input
              type="checkbox"
              checked={settings.showSlider}
              onChange={(e) => updateSetting('showSlider', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Render Characters</span>
            <input
              type="checkbox"
              checked={settings.renderCharacters}
              onChange={(e) => updateSetting('renderCharacters', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Show Decorations</span>
            <input
              type="checkbox"
              checked={settings.showDecorations}
              onChange={(e) => updateSetting('showDecorations', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Auto Hide</span>
            <input
              type="checkbox"
              checked={settings.autohide}
              onChange={(e) => updateSetting('autohide', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Preview
          </span>
          <motion.div
            animate={{ opacity: settings.enabled ? 1 : 0.3 }}
            className={`w-8 h-16 rounded ${
              settings.side === 'left' ? 'ml-0 mr-auto' : 'ml-auto mr-0'
            }`}
            style={{
              background: 'linear-gradient(to bottom, #3b82f6 10%, #6b7280 30%, #3b82f6 50%, #6b7280 70%, #3b82f6 90%)',
              transform: `scale(${Math.min(settings.scale, 2) / 2})`,
              transformOrigin: settings.side === 'left' ? 'left center' : 'right center',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MinimapControls;
