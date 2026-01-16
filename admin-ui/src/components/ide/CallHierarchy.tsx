/**
 * CallHierarchy - View incoming and outgoing function calls
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge, ChevronRight, ChevronDown, FileCode,
  ArrowDownRight, ArrowUpRight, RefreshCw, X, Search
} from 'lucide-react';

export interface CallItem {
  id: string;
  name: string;
  kind: 'function' | 'method' | 'constructor' | 'property';
  filePath: string;
  line: number;
  column: number;
  detail?: string;
  children?: CallItem[];
  isLoading?: boolean;
}

interface CallHierarchyProps {
  rootItem?: CallItem;
  mode: 'incoming' | 'outgoing';
  onModeChange: (mode: 'incoming' | 'outgoing') => void;
  onNavigate: (filePath: string, line: number, column: number) => void;
  onExpandItem: (itemId: string) => Promise<CallItem[]>;
  onClose: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const kindColors: Record<CallItem['kind'], string> = {
  function: 'text-purple-400',
  method: 'text-blue-400',
  constructor: 'text-yellow-400',
  property: 'text-green-400',
};

const CallItemRow: React.FC<{
  item: CallItem;
  depth: number;
  mode: 'incoming' | 'outgoing';
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: (filePath: string, line: number, column: number) => void;
  onExpandItem: (itemId: string) => Promise<CallItem[]>;
}> = ({ item, depth, mode, expandedIds, onToggle, onNavigate, onExpandItem }) => {
  const [children, setChildren] = useState<CallItem[]>(item.children || []);
  const [isLoading, setIsLoading] = useState(false);
  const isExpanded = expandedIds.has(item.id);

  const handleToggle = async () => {
    if (!isExpanded && children.length === 0 && !isLoading) {
      setIsLoading(true);
      try {
        const loadedChildren = await onExpandItem(item.id);
        setChildren(loadedChildren);
      } catch (error) {
        console.error('Failed to load children:', error);
      }
      setIsLoading(false);
    }
    onToggle(item.id);
  };

  const getFileName = (path: string) => path.split('/').pop() || path;
  const ArrowIcon = mode === 'incoming' ? ArrowDownRight : ArrowUpRight;

  return (
    <>
      <div
        className="group flex items-center gap-1 px-2 py-1.5 hover:bg-gray-800/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleToggle}
      >
        {/* Expand Icon */}
        <button className="p-0.5 hover:bg-gray-700 rounded">
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 text-gray-500 animate-spin" />
          ) : isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )}
        </button>

        {/* Direction Arrow */}
        <ArrowIcon className={`w-3.5 h-3.5 ${kindColors[item.kind]}`} />

        {/* Name */}
        <span className={`text-sm ${kindColors[item.kind]}`}>{item.name}</span>

        {/* Kind Badge */}
        <span className="text-xs text-gray-600">({item.kind})</span>

        {/* Spacer */}
        <span className="flex-1" />

        {/* File Info */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(item.filePath, item.line, item.column);
          }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FileCode className="w-3 h-3" />
          <span>{getFileName(item.filePath)}</span>
          <span>:{item.line}</span>
        </button>
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {children.map((child) => (
              <CallItemRow
                key={child.id}
                item={child}
                depth={depth + 1}
                mode={mode}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onNavigate={onNavigate}
                onExpandItem={onExpandItem}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const CallHierarchy: React.FC<CallHierarchyProps> = ({
  rootItem,
  mode,
  onModeChange,
  onNavigate,
  onExpandItem,
  onClose,
  onRefresh,
  isLoading = false,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    rootItem ? new Set([rootItem.id]) : new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Call Hierarchy
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => onModeChange('incoming')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              mode === 'incoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Incoming Calls
          </button>
          <button
            onClick={() => onModeChange('outgoing')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              mode === 'outgoing'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Outgoing Calls
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter calls..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <RefreshCw className="w-10 h-10 text-blue-400 mb-3 animate-spin" />
            <p className="text-sm text-gray-400">Loading call hierarchy...</p>
          </div>
        ) : !rootItem ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <GitMerge className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No symbol selected</p>
            <p className="text-xs text-gray-600 mt-1">
              Right-click a function and select "Show Call Hierarchy"
            </p>
          </div>
        ) : (
          <div className="py-1">
            {/* Root Item */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
              <span className={`text-sm font-medium ${kindColors[rootItem.kind]}`}>
                {rootItem.name}
              </span>
              <span className="text-xs text-gray-500">
                {mode === 'incoming' ? 'is called by' : 'calls'}
              </span>
            </div>

            {/* Children */}
            <CallItemRow
              item={rootItem}
              depth={0}
              mode={mode}
              expandedIds={expandedIds}
              onToggle={toggleExpanded}
              onNavigate={onNavigate}
              onExpandItem={onExpandItem}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {mode === 'incoming' ? 'Showing callers' : 'Showing callees'}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              function
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              method
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallHierarchy;
