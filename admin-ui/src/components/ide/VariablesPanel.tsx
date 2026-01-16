/**
 * VariablesPanel - Display and modify variables during debugging
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Variable, ChevronRight, ChevronDown, Edit2, Check, X,
  Copy, Search, Filter, RefreshCw
} from 'lucide-react';

export type VariableType =
  | 'string' | 'number' | 'boolean' | 'object' | 'array'
  | 'function' | 'undefined' | 'null' | 'symbol' | 'bigint';

export interface VariableItem {
  id: string;
  name: string;
  value: string;
  type: VariableType;
  preview?: string;
  children?: VariableItem[];
  expandable?: boolean;
  editable?: boolean;
  scope?: string;
}

export interface VariableScope {
  id: string;
  name: string;
  variables: VariableItem[];
}

interface VariablesPanelProps {
  scopes: VariableScope[];
  onEdit: (variableId: string, newValue: string) => void;
  onRefresh: () => void;
  isDebugging?: boolean;
}

const typeColors: Record<VariableType, string> = {
  string: 'text-green-400',
  number: 'text-blue-400',
  boolean: 'text-yellow-400',
  object: 'text-purple-400',
  array: 'text-cyan-400',
  function: 'text-orange-400',
  undefined: 'text-gray-500',
  null: 'text-gray-500',
  symbol: 'text-pink-400',
  bigint: 'text-blue-300',
};

const VariableRow: React.FC<{
  variable: VariableItem;
  depth: number;
  onEdit: (id: string, value: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}> = ({ variable, depth, onEdit, expandedIds, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(variable.value);
  const [copied, setCopied] = useState(false);

  const isExpanded = expandedIds.has(variable.id);
  const hasChildren = variable.expandable && variable.children && variable.children.length > 0;

  const handleSave = () => {
    onEdit(variable.id, editValue);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(variable.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatValue = (value: string, type: VariableType) => {
    if (type === 'string') return `"${value}"`;
    return value;
  };

  return (
    <>
      <div
        className="group flex items-center gap-1 px-2 py-1 hover:bg-gray-800/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand Toggle */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(variable.id)}
            className="p-0.5 hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Variable Name */}
        <span className="text-sm text-gray-300 font-mono">{variable.name}</span>
        <span className="text-gray-600">:</span>

        {/* Value */}
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="flex-1 px-1 py-0.5 bg-gray-800 border border-blue-500 rounded text-xs text-white font-mono focus:outline-none"
              autoFocus
            />
            <button onClick={handleSave} className="p-0.5 text-green-400 hover:bg-gray-700 rounded">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-0.5 text-gray-400 hover:bg-gray-700 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <span
              className={`text-sm font-mono flex-1 truncate ${typeColors[variable.type]}`}
              title={variable.value}
            >
              {variable.preview || formatValue(variable.value, variable.type)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {variable.editable && (
                <button
                  onClick={() => {
                    setEditValue(variable.value);
                    setIsEditing(true);
                  }}
                  className="p-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  title="Edit value"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleCopy}
                className="p-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Copy value"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {variable.children!.map((child) => (
              <VariableRow
                key={child.id}
                variable={child}
                depth={depth + 1}
                onEdit={onEdit}
                expandedIds={expandedIds}
                onToggle={onToggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  scopes,
  onEdit,
  onRefresh,
  isDebugging = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedScopes, setExpandedScopes] = useState<Set<string>>(
    new Set(scopes.map((s) => s.id))
  );
  const [typeFilter, setTypeFilter] = useState<VariableType | 'all'>('all');

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleScope = (scopeId: string) => {
    setExpandedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scopeId)) next.delete(scopeId);
      else next.add(scopeId);
      return next;
    });
  };

  const filterVariables = (variables: VariableItem[]): VariableItem[] => {
    return variables.filter((v) => {
      const matchesSearch = searchQuery === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.value.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      return matchesSearch && matchesType;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Variable className="w-4 h-4" />
          Variables
        </h3>
        <button
          onClick={onRefresh}
          disabled={!isDebugging}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="px-3 py-2 border-b border-gray-700 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter variables..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Filter className="w-3 h-3 text-gray-500 flex-shrink-0" />
          {(['all', 'string', 'number', 'boolean', 'object', 'array'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-blue-600 text-white'
                  : `bg-gray-800 ${type !== 'all' ? typeColors[type] : 'text-gray-400'} hover:bg-gray-700`
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Scopes & Variables */}
      <div className="flex-1 overflow-auto">
        {!isDebugging ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Variable className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">Not debugging</p>
            <p className="text-xs text-gray-600 mt-1">
              Start a debug session to inspect variables
            </p>
          </div>
        ) : scopes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Variable className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No variables</p>
          </div>
        ) : (
          scopes.map((scope) => {
            const isExpanded = expandedScopes.has(scope.id);
            const filteredVars = filterVariables(scope.variables);

            return (
              <div key={scope.id} className="border-b border-gray-800">
                <button
                  onClick={() => toggleScope(scope.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-300 font-medium">{scope.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {filteredVars.length} var{filteredVars.length !== 1 ? 's' : ''}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pb-1">
                    {filteredVars.length === 0 ? (
                      <div className="px-6 py-2 text-xs text-gray-500 italic">
                        No matching variables
                      </div>
                    ) : (
                      filteredVars.map((variable) => (
                        <VariableRow
                          key={variable.id}
                          variable={variable}
                          depth={0}
                          onEdit={onEdit}
                          expandedIds={expandedIds}
                          onToggle={toggleExpanded}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        {scopes.reduce((acc, s) => acc + s.variables.length, 0)} variables in {scopes.length} scopes
      </div>
    </div>
  );
};

export default VariablesPanel;
