/**
 * EditorSettings - IDE settings panel with theme and editor options
 */

import React from 'react';
import {
  Sun, Moon, Monitor, Type, ZoomIn, ZoomOut,
  WrapText, Map, Save, Clock, Keyboard
} from 'lucide-react';

export interface EditorConfig {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  formatOnSave: boolean;
  lineNumbers: boolean;
  bracketMatching: boolean;
  indentGuides: boolean;
}

interface EditorSettingsProps {
  config: EditorConfig;
  onChange: (config: Partial<EditorConfig>) => void;
}

export const defaultEditorConfig: EditorConfig = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  autoSave: false,
  autoSaveDelay: 1000,
  formatOnSave: false,
  lineNumbers: true,
  bracketMatching: true,
  indentGuides: true,
};

export const EditorSettings: React.FC<EditorSettingsProps> = ({
  config,
  onChange
}) => {
  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  const fontSizes = [10, 12, 13, 14, 15, 16, 18, 20, 22, 24];
  const tabSizes = [2, 4, 8];
  const fonts = [
    { id: 'JetBrains Mono, Menlo, Monaco, monospace', label: 'JetBrains Mono' },
    { id: 'Fira Code, Menlo, Monaco, monospace', label: 'Fira Code' },
    { id: 'Monaco, Menlo, monospace', label: 'Monaco' },
    { id: 'Consolas, monospace', label: 'Consolas' },
    { id: 'Source Code Pro, monospace', label: 'Source Code Pro' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Theme */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Theme</h3>
        <div className="flex gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChange({ theme: id })}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                config.theme === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Settings */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Font</h3>

        <div className="space-y-3">
          {/* Font Family */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Family</label>
            <select
              value={config.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {fonts.map(font => (
                <option key={font.id} value={font.id}>{font.label}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange({ fontSize: Math.max(10, config.fontSize - 1) })}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-gray-400" />
              </button>
              <select
                value={config.fontSize}
                onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white text-center focus:outline-none focus:border-blue-500"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
              <button
                onClick={() => onChange({ fontSize: Math.min(24, config.fontSize + 1) })}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tab Size */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tab Size</label>
            <div className="flex gap-2">
              {tabSizes.map(size => (
                <button
                  key={size}
                  onClick={() => onChange({ tabSize: size })}
                  className={`flex-1 px-3 py-2 rounded transition-colors ${
                    config.tabSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Options */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Editor</h3>

        <div className="space-y-2">
          <ToggleOption
            icon={<WrapText className="w-4 h-4" />}
            label="Word Wrap"
            description="Wrap long lines"
            checked={config.wordWrap}
            onChange={(checked) => onChange({ wordWrap: checked })}
          />

          <ToggleOption
            icon={<Map className="w-4 h-4" />}
            label="Minimap"
            description="Show code minimap"
            checked={config.minimap}
            onChange={(checked) => onChange({ minimap: checked })}
          />

          <ToggleOption
            icon={<Type className="w-4 h-4" />}
            label="Line Numbers"
            description="Show line numbers"
            checked={config.lineNumbers}
            onChange={(checked) => onChange({ lineNumbers: checked })}
          />

          <ToggleOption
            icon={<Keyboard className="w-4 h-4" />}
            label="Bracket Matching"
            description="Highlight matching brackets"
            checked={config.bracketMatching}
            onChange={(checked) => onChange({ bracketMatching: checked })}
          />

          <ToggleOption
            label="Indent Guides"
            description="Show indentation lines"
            checked={config.indentGuides}
            onChange={(checked) => onChange({ indentGuides: checked })}
          />
        </div>
      </div>

      {/* Auto Save */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Saving</h3>

        <div className="space-y-2">
          <ToggleOption
            icon={<Save className="w-4 h-4" />}
            label="Auto Save"
            description="Save files automatically"
            checked={config.autoSave}
            onChange={(checked) => onChange({ autoSave: checked })}
          />

          {config.autoSave && (
            <div className="pl-6">
              <label className="text-xs text-gray-500 mb-1 block">Delay (ms)</label>
              <input
                type="number"
                value={config.autoSaveDelay}
                onChange={(e) => onChange({ autoSaveDelay: parseInt(e.target.value) || 1000 })}
                min={500}
                max={10000}
                step={500}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <ToggleOption
            label="Format on Save"
            description="Auto-format when saving"
            checked={config.formatOnSave}
            onChange={(checked) => onChange({ formatOnSave: checked })}
          />
        </div>
      </div>
    </div>
  );
};

interface ToggleOptionProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({
  icon,
  label,
  description,
  checked,
  onChange
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
  >
    {icon && <span className="text-gray-400">{icon}</span>}
    <div className="flex-1">
      <div className="text-sm text-white">{label}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
    <div
      className={`w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-700'
      }`}
    >
      <div
        className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </div>
  </button>
);

export default EditorSettings;
