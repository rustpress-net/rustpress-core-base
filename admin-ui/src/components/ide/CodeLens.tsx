/**
 * CodeLens - Inline code actions and information displays
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, GitBranch, Users, TestTube, Bug, Play,
  FileCode, History, RefreshCw, Settings
} from 'lucide-react';

export interface CodeLensItem {
  id: string;
  line: number;
  column?: number;
  type: 'references' | 'implementations' | 'test' | 'debug' | 'run' | 'history' | 'authors' | 'custom';
  label: string;
  detail?: string;
  command?: string;
  arguments?: unknown[];
  tooltip?: string;
}

export interface CodeLensSettings {
  enabled: boolean;
  showReferences: boolean;
  showImplementations: boolean;
  showTests: boolean;
  showDebug: boolean;
  showHistory: boolean;
  showAuthors: boolean;
  fontSize: number;
  fontFamily: 'editor' | 'ui';
}

interface CodeLensProps {
  items: CodeLensItem[];
  settings: CodeLensSettings;
  onCommand: (item: CodeLensItem) => void;
  onSettingsChange: (settings: CodeLensSettings) => void;
  showSettingsPanel?: boolean;
  onToggleSettings?: () => void;
}

const typeIcons: Record<CodeLensItem['type'], React.ElementType> = {
  references: Eye,
  implementations: FileCode,
  test: TestTube,
  debug: Bug,
  run: Play,
  history: History,
  authors: Users,
  custom: GitBranch,
};

const typeColors: Record<CodeLensItem['type'], string> = {
  references: 'text-blue-400',
  implementations: 'text-purple-400',
  test: 'text-green-400',
  debug: 'text-red-400',
  run: 'text-yellow-400',
  history: 'text-cyan-400',
  authors: 'text-orange-400',
  custom: 'text-gray-400',
};

// CodeLens Decoration Component (to be placed above code lines)
export const CodeLensDecoration: React.FC<{
  items: CodeLensItem[];
  onCommand: (item: CodeLensItem) => void;
  fontSize?: number;
}> = ({ items, onCommand, fontSize = 11 }) => {
  if (items.length === 0) return null;

  return (
    <div
      className="flex items-center gap-3 px-2 py-0.5 text-gray-500"
      style={{ fontSize: `${fontSize}px` }}
    >
      {items.map((item, index) => {
        const Icon = typeIcons[item.type];
        return (
          <React.Fragment key={item.id}>
            {index > 0 && <span className="text-gray-700">|</span>}
            <button
              onClick={() => onCommand(item)}
              className={`flex items-center gap-1 hover:${typeColors[item.type]} transition-colors`}
              title={item.tooltip}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
              {item.detail && (
                <span className="text-gray-600">({item.detail})</span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// CodeLens Settings Panel
export const CodeLensPanel: React.FC<CodeLensProps> = ({
  items,
  settings,
  onCommand,
  onSettingsChange,
  showSettingsPanel = false,
  onToggleSettings,
}) => {
  const groupedByLine = items.reduce((acc, item) => {
    if (!acc[item.line]) acc[item.line] = [];
    acc[item.line].push(item);
    return acc;
  }, {} as Record<number, CodeLensItem[]>);

  const updateSetting = <K extends keyof CodeLensSettings>(
    key: K,
    value: CodeLensSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4" />
          CodeLens
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateSetting('enabled', !settings.enabled)}
            className={`p-1 rounded transition-colors ${
              settings.enabled
                ? 'text-blue-400 bg-blue-500/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title={settings.enabled ? 'Disable CodeLens' : 'Enable CodeLens'}
          >
            <Eye className="w-4 h-4" />
          </button>
          {onToggleSettings && (
            <button
              onClick={onToggleSettings}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="p-3 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Show Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'showReferences', label: 'References', icon: Eye },
                    { key: 'showImplementations', label: 'Implementations', icon: FileCode },
                    { key: 'showTests', label: 'Tests', icon: TestTube },
                    { key: 'showDebug', label: 'Debug', icon: Bug },
                    { key: 'showHistory', label: 'History', icon: History },
                    { key: 'showAuthors', label: 'Authors', icon: Users },
                  ].map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={settings[key as keyof CodeLensSettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof CodeLensSettings, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                      />
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-gray-400">Font Size</label>
                  <span className="text-xs text-gray-500">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="9"
                  max="14"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Font Family</label>
                <div className="flex gap-2">
                  {(['editor', 'ui'] as const).map((family) => (
                    <button
                      key={family}
                      onClick={() => updateSetting('fontFamily', family)}
                      className={`flex-1 px-3 py-1.5 rounded text-xs transition-colors ${
                        settings.fontFamily === family
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {family === 'editor' ? 'Monospace' : 'UI Font'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CodeLens Items */}
      <div className="flex-1 overflow-auto">
        {!settings.enabled ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Eye className="w-10 h-10 text-gray-600 mb-3 opacity-50" />
            <p className="text-sm text-gray-400">CodeLens disabled</p>
            <button
              onClick={() => updateSetting('enabled', true)}
              className="mt-2 text-xs text-blue-400 hover:underline"
            >
              Enable CodeLens
            </button>
          </div>
        ) : Object.keys(groupedByLine).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Eye className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No CodeLens items</p>
            <p className="text-xs text-gray-600 mt-1">
              Open a file to see inline code information
            </p>
          </div>
        ) : (
          Object.entries(groupedByLine).map(([line, lineItems]) => (
            <div key={line} className="border-b border-gray-800">
              <div className="px-3 py-1.5 bg-gray-800/30 flex items-center gap-2">
                <span className="text-xs text-gray-500">Line {line}</span>
              </div>
              <div className="px-3 py-2">
                <CodeLensDecoration
                  items={lineItems}
                  onCommand={onCommand}
                  fontSize={settings.fontSize}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
        <span>{items.length} CodeLens items</span>
        <button
          onClick={() => onSettingsChange({ ...settings })}
          className="flex items-center gap-1 text-gray-400 hover:text-white"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default CodeLensPanel;
