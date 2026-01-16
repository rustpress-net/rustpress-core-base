/**
 * KeybindingsEditor - Customize keyboard shortcuts
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard, Search, RotateCcw, Edit2, X, Check,
  Command, AlertCircle, Filter, Download, Upload
} from 'lucide-react';

export interface Keybinding {
  id: string;
  command: string;
  description: string;
  category: string;
  keybinding: string[];
  when?: string;
  isDefault: boolean;
  isConflict?: boolean;
}

interface KeybindingsEditorProps {
  keybindings: Keybinding[];
  onUpdate: (id: string, keys: string[]) => void;
  onReset: (id: string) => void;
  onResetAll: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
}

const categories = [
  'All',
  'Editor',
  'Navigation',
  'View',
  'File',
  'Edit',
  'Debug',
  'Terminal',
  'Git',
];

const formatKey = (key: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifiers: Record<string, string> = isMac
    ? { ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘' }
    : { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Win' };

  return key
    .split('+')
    .map((k) => modifiers[k.toLowerCase()] || k.toUpperCase())
    .join(isMac ? '' : '+');
};

export const KeybindingsEditor: React.FC<KeybindingsEditorProps> = ({
  keybindings,
  onUpdate,
  onReset,
  onResetAll,
  onExport,
  onImport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter keybindings
  const filteredKeybindings = keybindings.filter((kb) => {
    const matchesSearch =
      kb.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.keybinding.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || kb.category === selectedCategory;
    const matchesConflict = !showConflictsOnly || kb.isConflict;
    return matchesSearch && matchesCategory && matchesConflict;
  });

  // Record key presses when editing
  useEffect(() => {
    if (!editingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.metaKey) keys.push('Meta');

      // Don't add modifier keys alone
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(e.key);
      }

      if (keys.length > 0 && keys.some((k) => !['Ctrl', 'Alt', 'Shift', 'Meta'].includes(k))) {
        setRecordedKeys(keys);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId]);

  const startEditing = (id: string) => {
    setEditingId(id);
    setRecordedKeys([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveKeybinding = () => {
    if (editingId && recordedKeys.length > 0) {
      onUpdate(editingId, recordedKeys);
    }
    setEditingId(null);
    setRecordedKeys([]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setRecordedKeys([]);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-blue-400" />
          Keyboard Shortcuts
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Export keybindings"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>
          <button
            onClick={onResetAll}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Reset all to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-3 space-y-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keybindings..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showConflictsOnly}
            onChange={(e) => setShowConflictsOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
          />
          <Filter className="w-3 h-3" />
          Show conflicts only
        </label>
      </div>

      {/* Keybindings List */}
      <div className="flex-1 overflow-auto">
        {filteredKeybindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Keyboard className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No keybindings found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800/50 sticky top-0">
              <tr className="text-xs text-gray-400">
                <th className="px-4 py-2 text-left font-medium">Command</th>
                <th className="px-4 py-2 text-left font-medium">Keybinding</th>
                <th className="px-4 py-2 text-left font-medium">When</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeybindings.map((kb) => (
                <tr
                  key={kb.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {kb.isConflict && (
                        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-white">{kb.command}</p>
                        <p className="text-xs text-gray-500">{kb.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === kb.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={recordedKeys.length > 0 ? formatKey(recordedKeys.join('+')) : ''}
                          readOnly
                          placeholder="Press keys..."
                          className="w-32 px-2 py-1 bg-gray-800 border border-blue-500 rounded text-sm text-white focus:outline-none"
                        />
                        <button
                          onClick={saveKeybinding}
                          disabled={recordedKeys.length === 0}
                          className="p-1 text-green-400 hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {kb.keybinding.length > 0 ? (
                          kb.keybinding.map((key, i) => (
                            <kbd
                              key={i}
                              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 font-mono"
                            >
                              {formatKey(key)}
                            </kbd>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Not set</span>
                        )}
                        {!kb.isDefault && (
                          <span className="ml-1 px-1 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            Modified
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {kb.when && (
                      <span className="text-xs text-gray-500 font-mono">{kb.when}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(kb.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Edit keybinding"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!kb.isDefault && (
                        <button
                          onClick={() => onReset(kb.id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          title="Reset to default"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredKeybindings.length} keybindings</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            Press keys to record
          </span>
        </div>
      </div>
    </div>
  );
};

export default KeybindingsEditor;
