/**
 * PanelPresets - Save and restore layout configurations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Layout, Save, Trash2, Check, Edit2, Plus,
  Monitor, Smartphone, Tablet, Columns, Rows
} from 'lucide-react';

export interface PanelLayout {
  id: string;
  name: string;
  description?: string;
  icon?: 'monitor' | 'smartphone' | 'tablet' | 'columns' | 'rows';
  config: {
    sidebarWidth: number;
    rightPanelWidth: number;
    terminalHeight: number;
    showSidebar: boolean;
    showRightPanel: boolean;
    showTerminal: boolean;
    showActivityBar: boolean;
    showStatusBar: boolean;
    splitDirection?: 'horizontal' | 'vertical';
  };
  isBuiltIn?: boolean;
}

interface PanelPresetsProps {
  isOpen: boolean;
  onClose: () => void;
  presets: PanelLayout[];
  currentLayout: PanelLayout['config'];
  onApplyPreset: (preset: PanelLayout) => void;
  onSavePreset: (name: string, config: PanelLayout['config']) => void;
  onDeletePreset: (id: string) => void;
  onUpdatePreset: (id: string, name: string) => void;
}

const iconMap = {
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  columns: Columns,
  rows: Rows
};

const builtInPresets: Omit<PanelLayout, 'id'>[] = [
  {
    name: 'Default',
    description: 'Standard layout with all panels',
    icon: 'monitor',
    isBuiltIn: true,
    config: {
      sidebarWidth: 250,
      rightPanelWidth: 300,
      terminalHeight: 200,
      showSidebar: true,
      showRightPanel: true,
      showTerminal: false,
      showActivityBar: true,
      showStatusBar: true
    }
  },
  {
    name: 'Focus Mode',
    description: 'Editor only, minimal distractions',
    icon: 'smartphone',
    isBuiltIn: true,
    config: {
      sidebarWidth: 0,
      rightPanelWidth: 0,
      terminalHeight: 0,
      showSidebar: false,
      showRightPanel: false,
      showTerminal: false,
      showActivityBar: false,
      showStatusBar: true
    }
  },
  {
    name: 'Split View',
    description: 'Two editors side by side',
    icon: 'columns',
    isBuiltIn: true,
    config: {
      sidebarWidth: 200,
      rightPanelWidth: 0,
      terminalHeight: 0,
      showSidebar: true,
      showRightPanel: false,
      showTerminal: false,
      showActivityBar: true,
      showStatusBar: true,
      splitDirection: 'vertical'
    }
  },
  {
    name: 'Developer',
    description: 'Editor with terminal',
    icon: 'rows',
    isBuiltIn: true,
    config: {
      sidebarWidth: 250,
      rightPanelWidth: 0,
      terminalHeight: 250,
      showSidebar: true,
      showRightPanel: false,
      showTerminal: true,
      showActivityBar: true,
      showStatusBar: true
    }
  }
];

export const PanelPresets: React.FC<PanelPresetsProps> = ({
  isOpen,
  onClose,
  presets,
  currentLayout,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onUpdatePreset
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const allPresets = [
    ...builtInPresets.map((p, i) => ({ ...p, id: `builtin-${i}` })),
    ...(presets || [])
  ];

  const handleSaveNew = () => {
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim(), currentLayout);
    setNewPresetName('');
    setIsCreating(false);
  };

  const handleStartEdit = (preset: PanelLayout) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdatePreset(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-medium text-white">Layout Presets</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Presets List */}
              <div className="max-h-96 overflow-auto">
                {allPresets.map(preset => {
                  const Icon = preset.icon ? iconMap[preset.icon] : Layout;
                  const isEditing = editingId === preset.id;

                  return (
                    <div
                      key={preset.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            onBlur={handleSaveEdit}
                            className="w-full px-2 py-1 bg-gray-800 border border-blue-500 rounded text-sm text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <>
                            <p className="text-sm text-white font-medium">{preset.name}</p>
                            {preset.description && (
                              <p className="text-xs text-gray-500">{preset.description}</p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!preset.isBuiltIn && !isEditing && (
                          <>
                            <button
                              onClick={() => handleStartEdit(preset)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                              title="Rename"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeletePreset(preset.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onApplyPreset(preset)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Create New Preset */}
                {isCreating ? (
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-800/50">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNew()}
                      placeholder="Preset name..."
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveNew}
                      disabled={!newPresetName.trim()}
                      className="p-1.5 text-green-400 hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setIsCreating(false); setNewPresetName(''); }}
                      className="p-1.5 text-gray-400 hover:bg-gray-700 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 border-2 border-dashed border-gray-700 rounded-lg">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm">Save current layout as preset</span>
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                <p className="text-xs text-gray-500 text-center">
                  Save your preferred panel arrangements as presets for quick access
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PanelPresets;
