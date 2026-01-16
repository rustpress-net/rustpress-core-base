/**
 * LinkedEditing - Simultaneous editing of related symbols (like HTML tags)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link, Eye, EyeOff, Settings, Code, RefreshCw,
  AlertCircle, CheckCircle
} from 'lucide-react';

export interface LinkedEditRegion {
  id: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  text: string;
}

export interface LinkedEditGroup {
  id: string;
  type: 'html-tag' | 'variable' | 'parameter' | 'custom';
  regions: LinkedEditRegion[];
  isActive: boolean;
}

export interface LinkedEditingSettings {
  enabled: boolean;
  highlightLinkedRegions: boolean;
  highlightColor: string;
  autoActivate: boolean;
  supportedLanguages: string[];
}

interface LinkedEditingProps {
  groups: LinkedEditGroup[];
  activeGroupId?: string;
  settings: LinkedEditingSettings;
  currentLanguage?: string;
  onSettingsChange: (settings: LinkedEditingSettings) => void;
  onActivateGroup: (groupId: string) => void;
  onDeactivate: () => void;
}

const typeLabels: Record<LinkedEditGroup['type'], string> = {
  'html-tag': 'HTML Tag Pairs',
  variable: 'Variable References',
  parameter: 'Parameter Names',
  custom: 'Custom Links',
};

const typeColors: Record<LinkedEditGroup['type'], string> = {
  'html-tag': 'text-orange-400',
  variable: 'text-blue-400',
  parameter: 'text-green-400',
  custom: 'text-purple-400',
};

const defaultColors = [
  { name: 'Blue', value: 'rgba(59, 130, 246, 0.3)' },
  { name: 'Green', value: 'rgba(34, 197, 94, 0.3)' },
  { name: 'Purple', value: 'rgba(168, 85, 247, 0.3)' },
  { name: 'Orange', value: 'rgba(249, 115, 22, 0.3)' },
  { name: 'Cyan', value: 'rgba(6, 182, 212, 0.3)' },
];

const supportedLanguagesList = [
  { id: 'html', name: 'HTML' },
  { id: 'xml', name: 'XML' },
  { id: 'jsx', name: 'JSX' },
  { id: 'tsx', name: 'TSX' },
  { id: 'vue', name: 'Vue' },
  { id: 'svelte', name: 'Svelte' },
  { id: 'php', name: 'PHP' },
];

export const LinkedEditing: React.FC<LinkedEditingProps> = ({
  groups,
  activeGroupId,
  settings,
  currentLanguage,
  onSettingsChange,
  onActivateGroup,
  onDeactivate,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const isLanguageSupported = currentLanguage
    ? settings.supportedLanguages.includes(currentLanguage)
    : true;

  const updateSetting = <K extends keyof LinkedEditingSettings>(
    key: K,
    value: LinkedEditingSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const toggleLanguage = (langId: string) => {
    const current = settings.supportedLanguages;
    const updated = current.includes(langId)
      ? current.filter((l) => l !== langId)
      : [...current, langId];
    updateSetting('supportedLanguages', updated);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Link className="w-4 h-4" />
          Linked Editing
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateSetting('enabled', !settings.enabled)}
            className={`p-1 rounded transition-colors ${
              settings.enabled
                ? 'text-blue-400 bg-blue-500/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title={settings.enabled ? 'Disable linked editing' : 'Enable linked editing'}
          >
            {settings.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded transition-colors ${
              showSettings ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className={`px-3 py-2 border-b border-gray-700 ${
        settings.enabled && isLanguageSupported ? 'bg-green-500/10' : 'bg-gray-800/50'
      }`}>
        <div className="flex items-center gap-2">
          {settings.enabled && isLanguageSupported ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">
                Linked editing active
                {currentLanguage && ` for ${currentLanguage.toUpperCase()}`}
              </span>
            </>
          ) : !settings.enabled ? (
            <>
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Linked editing disabled</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">
                {currentLanguage?.toUpperCase()} not supported
              </span>
            </>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-b border-gray-700 overflow-hidden"
        >
          <div className="p-3 space-y-4">
            {/* Highlight Settings */}
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Highlight linked regions</span>
                <input
                  type="checkbox"
                  checked={settings.highlightLinkedRegions}
                  onChange={(e) => updateSetting('highlightLinkedRegions', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Auto-activate on cursor</span>
                <input
                  type="checkbox"
                  checked={settings.autoActivate}
                  onChange={(e) => updateSetting('autoActivate', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>
            </div>

            {/* Highlight Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Highlight Color</label>
              <div className="flex gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateSetting('highlightColor', color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      settings.highlightColor === color.value
                        ? 'border-white scale-110'
                        : 'border-transparent hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Supported Languages */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Supported Languages</label>
              <div className="grid grid-cols-2 gap-2">
                {supportedLanguagesList.map((lang) => (
                  <label
                    key={lang.id}
                    className="flex items-center gap-2 p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={settings.supportedLanguages.includes(lang.id)}
                      onChange={() => toggleLanguage(lang.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                    />
                    <Code className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-300">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Group Info */}
      {activeGroup && (
        <div className="px-3 py-2 border-b border-gray-700 bg-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className={`text-sm ${typeColors[activeGroup.type]}`}>
                {typeLabels[activeGroup.type]}
              </span>
            </div>
            <button
              onClick={onDeactivate}
              className="text-xs text-gray-400 hover:text-white"
            >
              Deactivate
            </button>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Editing {activeGroup.regions.length} linked region{activeGroup.regions.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="flex-1 overflow-auto">
        {!settings.enabled ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Link className="w-10 h-10 text-gray-600 mb-3 opacity-50" />
            <p className="text-sm text-gray-400">Linked editing disabled</p>
            <button
              onClick={() => updateSetting('enabled', true)}
              className="mt-2 text-xs text-blue-400 hover:underline"
            >
              Enable linked editing
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Link className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No linked regions found</p>
            <p className="text-xs text-gray-600 mt-1">
              Place cursor inside an HTML tag or symbol
            </p>
          </div>
        ) : (
          <div className="py-1">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onActivateGroup(group.id)}
                className={`w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-800/50 text-left ${
                  group.id === activeGroupId ? 'bg-blue-500/20' : ''
                }`}
              >
                <div className={`p-1 rounded ${typeColors[group.type]} bg-gray-800`}>
                  <Link className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">{typeLabels[group.type]}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {group.regions.length} region{group.regions.length !== 1 ? 's' : ''}
                    </span>
                    {group.regions[0] && (
                      <code className="text-xs text-gray-400 bg-gray-800 px-1 rounded truncate max-w-[100px]">
                        {group.regions[0].text}
                      </code>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{groups.length} linked groups</span>
          <span>Edit one, update all</span>
        </div>
      </div>
    </div>
  );
};

export default LinkedEditing;
