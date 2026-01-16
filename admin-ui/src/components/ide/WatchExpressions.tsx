/**
 * WatchExpressions - Monitor variable values during debugging
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Plus, Trash2, Edit2, Check, X, RefreshCw,
  ChevronRight, ChevronDown, Copy, AlertCircle
} from 'lucide-react';

export interface WatchValue {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'undefined' | 'null' | 'error';
  value: string;
  preview?: string;
  children?: Record<string, WatchValue>;
  expandable?: boolean;
}

export interface WatchExpression {
  id: string;
  expression: string;
  result?: WatchValue;
  isEvaluating?: boolean;
  error?: string;
}

interface WatchExpressionsProps {
  expressions: WatchExpression[];
  onAdd: (expression: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, expression: string) => void;
  onRefresh: () => void;
  onRefreshOne: (id: string) => void;
  isDebugging?: boolean;
}

const typeColors: Record<WatchValue['type'], string> = {
  string: 'text-green-400',
  number: 'text-blue-400',
  boolean: 'text-yellow-400',
  object: 'text-purple-400',
  array: 'text-cyan-400',
  function: 'text-orange-400',
  undefined: 'text-gray-500',
  null: 'text-gray-500',
  error: 'text-red-400',
};

const ValueDisplay: React.FC<{
  value: WatchValue;
  depth?: number;
  onCopy?: (text: string) => void;
}> = ({ value, depth = 0, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1);

  const renderValue = () => {
    if (value.type === 'error') {
      return <span className="text-red-400 italic">{value.value}</span>;
    }

    if (value.type === 'string') {
      return <span className={typeColors.string}>"{value.value}"</span>;
    }

    if (value.type === 'undefined' || value.type === 'null') {
      return <span className={typeColors[value.type]}>{value.type}</span>;
    }

    if (value.type === 'function') {
      return <span className={typeColors.function}>ƒ {value.preview || '()'}</span>;
    }

    if (!value.expandable) {
      return <span className={typeColors[value.type]}>{value.value}</span>;
    }

    return (
      <span className={typeColors[value.type]}>
        {value.preview || value.value}
      </span>
    );
  };

  return (
    <div className="font-mono text-xs">
      <div className="flex items-center gap-1">
        {value.expandable && value.children && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
        {renderValue()}
        {onCopy && (
          <button
            onClick={() => onCopy(value.value)}
            className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded"
          >
            <Copy className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {isExpanded && value.children && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-700 pl-2">
          {Object.entries(value.children).map(([key, childValue]) => (
            <div key={key} className="flex items-start gap-1">
              <span className="text-gray-400">{key}:</span>
              <ValueDisplay value={childValue} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WatchExpressions: React.FC<WatchExpressionsProps> = ({
  expressions,
  onAdd,
  onRemove,
  onEdit,
  onRefresh,
  onRefreshOne,
  isDebugging = false,
}) => {
  const [newExpression, setNewExpression] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (newExpression.trim()) {
      onAdd(newExpression.trim());
      setNewExpression('');
      setIsAdding(false);
    }
  };

  const startEdit = (expr: WatchExpression) => {
    setEditingId(expr.id);
    setEditValue(expr.expression);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onEdit(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Watch
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={!isDebugging}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
            title="Refresh all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Add expression"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Expression Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="flex items-center gap-2 p-2">
              <input
                type="text"
                value={newExpression}
                onChange={(e) => setNewExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                placeholder="Expression to watch..."
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!newExpression.trim()}
                className="p-1 text-green-400 hover:bg-gray-700 rounded disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewExpression('');
                }}
                className="p-1 text-gray-400 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expressions List */}
      <div className="flex-1 overflow-auto">
        {expressions.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Eye className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No watch expressions</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-blue-400 hover:underline"
            >
              Add expression
            </button>
          </div>
        ) : (
          expressions.map((expr) => (
            <div
              key={expr.id}
              className="group border-b border-gray-800 hover:bg-gray-800/50"
            >
              {editingId === expr.id ? (
                <div className="flex items-center gap-2 p-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 bg-gray-800 border border-blue-500 rounded text-sm text-white focus:outline-none font-mono"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1 text-green-400 hover:bg-gray-700 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-mono truncate">
                        {expr.expression}
                      </span>
                      {expr.isEvaluating && (
                        <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                      )}
                    </div>
                    <div className="mt-1">
                      {expr.error ? (
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>{expr.error}</span>
                        </div>
                      ) : expr.result ? (
                        <ValueDisplay value={expr.result} onCopy={copyToClipboard} />
                      ) : !isDebugging ? (
                        <span className="text-xs text-gray-500 italic">
                          Not available
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onRefreshOne(expr.id)}
                      disabled={!isDebugging}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(expr)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemove(expr.id)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!isDebugging && expressions.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-700 bg-yellow-500/10">
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Start debugging to evaluate expressions
          </p>
        </div>
      )}
    </div>
  );
};

export default WatchExpressions;
