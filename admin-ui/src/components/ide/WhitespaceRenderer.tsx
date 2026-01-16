/**
 * WhitespaceRenderer - Visualize whitespace characters
 */

import React from 'react';
import {
  Space, Eye, EyeOff, Settings
} from 'lucide-react';

export interface WhitespaceSettings {
  enabled: boolean;
  showSpaces: boolean;
  showTabs: boolean;
  showNewlines: boolean;
  showTrailingSpaces: boolean;
  renderMode: 'all' | 'boundary' | 'selection' | 'trailing';
  spaceChar: string;
  tabChar: string;
  newlineChar: string;
  color: string;
  trailingColor: string;
  opacity: number;
}

interface WhitespaceRendererProps {
  settings: WhitespaceSettings;
  onSettingsChange: (settings: WhitespaceSettings) => void;
}

const defaultCharOptions = {
  space: [
    { value: '·', label: 'Middle Dot' },
    { value: '•', label: 'Bullet' },
    { value: '⋅', label: 'Dot Operator' },
    { value: '␣', label: 'Open Box' },
  ],
  tab: [
    { value: '→', label: 'Arrow' },
    { value: '⇥', label: 'Tab Arrow' },
    { value: '│', label: 'Line' },
    { value: '⟶', label: 'Long Arrow' },
  ],
  newline: [
    { value: '↵', label: 'Return' },
    { value: '¶', label: 'Pilcrow' },
    { value: '⏎', label: 'Return Symbol' },
    { value: '↲', label: 'Leftwards Arrow' },
  ],
};

export const WhitespaceRenderer: React.FC<WhitespaceRendererProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof WhitespaceSettings>(
    key: K,
    value: WhitespaceSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  // Preview with whitespace visualization
  const renderPreview = (text: string) => {
    if (!settings.enabled) {
      return <span className="text-gray-300">{text}</span>;
    }

    const result: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === ' ' && settings.showSpaces) {
        result.push(
          <span
            key={key++}
            style={{ color: settings.color, opacity: settings.opacity / 100 }}
          >
            {settings.spaceChar}
          </span>
        );
      } else if (char === '\t' && settings.showTabs) {
        result.push(
          <span
            key={key++}
            style={{ color: settings.color, opacity: settings.opacity / 100 }}
          >
            {settings.tabChar}
          </span>
        );
      } else if (char === '\n' && settings.showNewlines) {
        result.push(
          <span
            key={key++}
            style={{ color: settings.color, opacity: settings.opacity / 100 }}
          >
            {settings.newlineChar}
          </span>
        );
        result.push(<br key={key++} />);
      } else if (char === '\n') {
        result.push(<br key={key++} />);
      } else {
        result.push(<span key={key++} className="text-gray-300">{char}</span>);
      }
    }

    return result;
  };

  const previewCode = "function hello() {\n\tconst msg = \"Hello World\";\n\treturn msg;  \n}";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Space className="w-4 h-4" />
          Whitespace
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
            <pre className="whitespace-pre">{renderPreview(previewCode)}</pre>
          </div>
        </div>

        {/* Render Mode */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Show Whitespace</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'all', label: 'All' },
              { value: 'boundary', label: 'Boundary' },
              { value: 'selection', label: 'Selection' },
              { value: 'trailing', label: 'Trailing Only' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateSetting('renderMode', value)}
                className={`px-3 py-2 rounded text-xs transition-colors ${
                  settings.renderMode === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Character Types */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Character Types</label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Spaces</span>
              <code className="text-xs text-gray-500 bg-gray-700 px-1 rounded">
                {settings.spaceChar}
              </code>
            </div>
            <input
              type="checkbox"
              checked={settings.showSpaces}
              onChange={(e) => updateSetting('showSpaces', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Tabs</span>
              <code className="text-xs text-gray-500 bg-gray-700 px-1 rounded">
                {settings.tabChar}
              </code>
            </div>
            <input
              type="checkbox"
              checked={settings.showTabs}
              onChange={(e) => updateSetting('showTabs', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Newlines</span>
              <code className="text-xs text-gray-500 bg-gray-700 px-1 rounded">
                {settings.newlineChar}
              </code>
            </div>
            <input
              type="checkbox"
              checked={settings.showNewlines}
              onChange={(e) => updateSetting('showNewlines', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Highlight trailing spaces</span>
            <input
              type="checkbox"
              checked={settings.showTrailingSpaces}
              onChange={(e) => updateSetting('showTrailingSpaces', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>
        </div>

        {/* Character Styles */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-400">Character Styles</label>

          {/* Space Character */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">Space Character</span>
            <div className="flex gap-2">
              {defaultCharOptions.space.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('spaceChar', value)}
                  className={`w-10 h-10 rounded border text-lg transition-colors ${
                    settings.spaceChar === value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                  title={label}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Character */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">Tab Character</span>
            <div className="flex gap-2">
              {defaultCharOptions.tab.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('tabChar', value)}
                  className={`w-10 h-10 rounded border text-lg transition-colors ${
                    settings.tabChar === value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                  title={label}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Newline Character */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">Newline Character</span>
            <div className="flex gap-2">
              {defaultCharOptions.newline.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('newlineChar', value)}
                  className={`w-10 h-10 rounded border text-lg transition-colors ${
                    settings.newlineChar === value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                  title={label}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Colors</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Default</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => updateSetting('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={settings.color}
                  onChange={(e) => updateSetting('color', e.target.value)}
                  className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Trailing</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.trailingColor}
                  onChange={(e) => updateSetting('trailingColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={settings.trailingColor}
                  onChange={(e) => updateSetting('trailingColor', e.target.value)}
                  className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
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
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        Visualize invisible characters in code
      </div>
    </div>
  );
};

export default WhitespaceRenderer;
