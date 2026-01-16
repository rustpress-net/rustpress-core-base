/**
 * WorkspaceSettings - Project-specific editor settings
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Folder, FileCode, Search, Save, RotateCcw,
  ChevronDown, ChevronRight, Check, AlertCircle, Download, Upload
} from 'lucide-react';

export interface WorkspaceSetting {
  id: string;
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'number' | 'string' | 'select' | 'array';
  value: unknown;
  defaultValue: unknown;
  options?: { value: string; label: string }[];
  scope: 'user' | 'workspace' | 'folder';
  category: string;
  isModified?: boolean;
}

interface WorkspaceSettingsProps {
  settings: WorkspaceSetting[];
  workspacePath?: string;
  onSettingChange: (settingId: string, value: unknown) => void;
  onResetSetting: (settingId: string) => void;
  onResetAll: () => void;
  onSave: () => void;
  onImport: (config: string) => void;
  onExport: () => string;
  isDirty?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  editor: FileCode,
  files: Folder,
  general: Settings,
};

export const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({
  settings,
  workspacePath,
  onSettingChange,
  onResetSetting,
  onResetAll,
  onSave,
  onImport,
  onExport,
  isDirty = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['editor', 'files', 'general']));
  const [scope, setScope] = useState<'user' | 'workspace'>('workspace');
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, WorkspaceSetting[]>);

  // Filter settings
  const filterSettings = (categorySettings: WorkspaceSetting[]) => {
    return categorySettings.filter((setting) => {
      const matchesSearch =
        searchQuery === '' ||
        setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScope = setting.scope === scope || setting.scope === 'folder';
      const matchesModified = !showModifiedOnly || setting.isModified;
      return matchesSearch && matchesScope && matchesModified;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImport(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const config = onExport();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
  };

  const renderSettingInput = (setting: WorkspaceSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={setting.value as boolean}
            onChange={(e) => onSettingChange(setting.id, e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => onSettingChange(setting.id, parseInt(e.target.value) || 0)}
            className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white text-center"
          />
        );
      case 'string':
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => onSettingChange(setting.id, e.target.value)}
            className="flex-1 max-w-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
          />
        );
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => onSettingChange(setting.id, e.target.value)}
            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'array':
        return (
          <input
            type="text"
            value={(setting.value as string[]).join(', ')}
            onChange={(e) =>
              onSettingChange(
                setting.id,
                e.target.value.split(',').map((s) => s.trim())
              )
            }
            placeholder="value1, value2, ..."
            className="flex-1 max-w-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
          />
        );
      default:
        return null;
    }
  };

  const modifiedCount = settings.filter((s) => s.isModified).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
          {isDirty && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
        </h3>
        <div className="flex items-center gap-1">
          <label className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>
          <button
            onClick={handleExport}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Export settings"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onResetAll}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Reset all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scope Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setScope('user')}
          className={`flex-1 px-3 py-2 text-xs transition-colors ${
            scope === 'user'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          User Settings
        </button>
        <button
          onClick={() => setScope('workspace')}
          className={`flex-1 px-3 py-2 text-xs transition-colors ${
            scope === 'workspace'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Workspace
        </button>
      </div>

      {/* Workspace Path */}
      {scope === 'workspace' && workspacePath && (
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Folder className="w-3.5 h-3.5" />
            <span className="truncate">{workspacePath}</span>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="px-3 py-2 border-b border-gray-700 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showModifiedOnly}
            onChange={(e) => setShowModifiedOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
          />
          Show modified only ({modifiedCount})
        </label>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => {
          const filtered = filterSettings(categorySettings);
          if (filtered.length === 0) return null;

          const Icon = categoryIcons[category] || Settings;
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border-b border-gray-800">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300 font-medium capitalize flex-1">
                  {category}
                </span>
                <span className="text-xs text-gray-500">{filtered.length}</span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {filtered.map((setting) => (
                      <div
                        key={setting.id}
                        className="group px-3 py-2 pl-10 hover:bg-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white">{setting.label}</span>
                              {setting.isModified && (
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              )}
                            </div>
                            {setting.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                            )}
                            <code className="text-xs text-gray-600 font-mono">{setting.key}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderSettingInput(setting)}
                            {setting.isModified && (
                              <button
                                onClick={() => onResetSetting(setting.id)}
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Reset to default"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer - Save Button */}
      {isDirty && (
        <div className="px-3 py-2 border-t border-gray-700 bg-yellow-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span>You have unsaved changes</span>
            </div>
            <button
              onClick={onSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSettings;
