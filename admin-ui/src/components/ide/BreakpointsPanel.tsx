/**
 * BreakpointsPanel - Manage code breakpoints for debugging
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Circle, CircleDot, Trash2, Edit2, Check, X,
  FileCode, MoreVertical, ToggleLeft, ToggleRight,
  AlertCircle, Zap, Filter
} from 'lucide-react';

export type BreakpointType = 'line' | 'conditional' | 'logpoint' | 'exception';

export interface Breakpoint {
  id: string;
  type: BreakpointType;
  filePath: string;
  line: number;
  column?: number;
  enabled: boolean;
  condition?: string;
  hitCount?: number;
  logMessage?: string;
  verified: boolean;
}

interface BreakpointsPanelProps {
  breakpoints: Breakpoint[];
  onNavigate: (filePath: string, line: number) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onEdit: (id: string, updates: Partial<Breakpoint>) => void;
  onToggleAll: (enabled: boolean) => void;
}

const typeIcons: Record<BreakpointType, React.ElementType> = {
  line: CircleDot,
  conditional: AlertCircle,
  logpoint: Zap,
  exception: AlertCircle,
};

const typeColors: Record<BreakpointType, string> = {
  line: 'text-red-400',
  conditional: 'text-yellow-400',
  logpoint: 'text-blue-400',
  exception: 'text-purple-400',
};

export const BreakpointsPanel: React.FC<BreakpointsPanelProps> = ({
  breakpoints,
  onNavigate,
  onToggle,
  onDelete,
  onDeleteAll,
  onEdit,
  onToggleAll,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCondition, setEditCondition] = useState('');
  const [filter, setFilter] = useState<BreakpointType | 'all'>('all');
  const [showMenu, setShowMenu] = useState(false);

  const filteredBreakpoints = breakpoints.filter(
    (bp) => filter === 'all' || bp.type === filter
  );

  const groupedBreakpoints = filteredBreakpoints.reduce((acc, bp) => {
    if (!acc[bp.filePath]) acc[bp.filePath] = [];
    acc[bp.filePath].push(bp);
    return acc;
  }, {} as Record<string, Breakpoint[]>);

  const allEnabled = breakpoints.every((bp) => bp.enabled);
  const someEnabled = breakpoints.some((bp) => bp.enabled);

  const startEdit = (bp: Breakpoint) => {
    setEditingId(bp.id);
    setEditCondition(bp.condition || '');
  };

  const saveEdit = (id: string) => {
    onEdit(id, { condition: editCondition || undefined });
    setEditingId(null);
    setEditCondition('');
  };

  const getFileName = (path: string) => path.split('/').pop() || path;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-red-400" />
          Breakpoints
          <span className="text-xs text-gray-500 normal-case">
            ({breakpoints.length})
          </span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleAll(!allEnabled)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title={allEnabled ? 'Disable all' : 'Enable all'}
          >
            {allEnabled || someEnabled ? (
              <ToggleRight className="w-4 h-4 text-blue-400" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    onDeleteAll();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex gap-1">
          {(['all', 'line', 'conditional', 'logpoint'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Breakpoints List */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedBreakpoints).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Circle className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No breakpoints set</p>
            <p className="text-xs text-gray-600 mt-1">
              Click in the gutter to add one
            </p>
          </div>
        ) : (
          Object.entries(groupedBreakpoints).map(([filePath, bps]) => (
            <div key={filePath} className="border-b border-gray-800">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/30">
                <FileCode className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400 truncate flex-1">
                  {getFileName(filePath)}
                </span>
                <span className="text-xs text-gray-600">{bps.length}</span>
              </div>

              {bps.map((bp) => {
                const Icon = typeIcons[bp.type];
                const isEditing = editingId === bp.id;

                return (
                  <div
                    key={bp.id}
                    className={`group flex items-start gap-2 px-3 py-2 hover:bg-gray-800/50 cursor-pointer ${
                      !bp.enabled ? 'opacity-50' : ''
                    }`}
                    onClick={() => onNavigate(bp.filePath, bp.line)}
                  >
                    {/* Toggle & Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(bp.id);
                      }}
                      className={`mt-0.5 ${typeColors[bp.type]}`}
                    >
                      <Icon className={`w-4 h-4 ${!bp.verified ? 'opacity-50' : ''}`} />
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">Line {bp.line}</span>
                        {bp.hitCount !== undefined && bp.hitCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                            Hit: {bp.hitCount}
                          </span>
                        )}
                        {!bp.verified && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Unverified
                          </span>
                        )}
                      </div>

                      {/* Condition Editor */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            value={editCondition}
                            onChange={(e) => setEditCondition(e.target.value)}
                            placeholder="Condition..."
                            className="flex-1 px-2 py-1 bg-gray-800 border border-blue-500 rounded text-xs text-white focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(bp.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEdit(bp.id);
                            }}
                            className="p-1 text-green-400 hover:bg-gray-700 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {bp.condition && (
                            <p className="text-xs text-yellow-400 mt-0.5 font-mono truncate">
                              if: {bp.condition}
                            </p>
                          )}
                          {bp.logMessage && (
                            <p className="text-xs text-blue-400 mt-0.5 font-mono truncate">
                              log: {bp.logMessage}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(bp);
                          }}
                          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          title="Edit condition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(bp.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                          title="Remove breakpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {breakpoints.filter((bp) => bp.enabled).length} of {breakpoints.length} enabled
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <CircleDot className="w-3 h-3 text-red-400" /> Line
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-400" /> Conditional
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" /> Logpoint
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakpointsPanel;
