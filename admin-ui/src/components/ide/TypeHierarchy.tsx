/**
 * TypeHierarchy - View class inheritance and type relationships
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, ChevronRight, ChevronDown, FileCode,
  ArrowDown, ArrowUp, RefreshCw, X, Search, Box
} from 'lucide-react';

export interface TypeItem {
  id: string;
  name: string;
  kind: 'class' | 'interface' | 'type' | 'enum';
  filePath: string;
  line: number;
  column: number;
  modifiers?: string[];
  children?: TypeItem[];
  isLoading?: boolean;
}

interface TypeHierarchyProps {
  rootItem?: TypeItem;
  mode: 'supertypes' | 'subtypes';
  onModeChange: (mode: 'supertypes' | 'subtypes') => void;
  onNavigate: (filePath: string, line: number, column: number) => void;
  onExpandItem: (itemId: string) => Promise<TypeItem[]>;
  onClose: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const kindColors: Record<TypeItem['kind'], string> = {
  class: 'text-yellow-400',
  interface: 'text-green-400',
  type: 'text-cyan-400',
  enum: 'text-purple-400',
};

const kindIcons: Record<TypeItem['kind'], string> = {
  class: 'C',
  interface: 'I',
  type: 'T',
  enum: 'E',
};

const TypeItemRow: React.FC<{
  item: TypeItem;
  depth: number;
  mode: 'supertypes' | 'subtypes';
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: (filePath: string, line: number, column: number) => void;
  onExpandItem: (itemId: string) => Promise<TypeItem[]>;
}> = ({ item, depth, mode, expandedIds, onToggle, onNavigate, onExpandItem }) => {
  const [children, setChildren] = useState<TypeItem[]>(item.children || []);
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
  const ArrowIcon = mode === 'supertypes' ? ArrowUp : ArrowDown;

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

        {/* Kind Badge */}
        <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded ${
          item.kind === 'class' ? 'bg-yellow-500/20 text-yellow-400' :
          item.kind === 'interface' ? 'bg-green-500/20 text-green-400' :
          item.kind === 'type' ? 'bg-cyan-500/20 text-cyan-400' :
          'bg-purple-500/20 text-purple-400'
        }`}>
          {kindIcons[item.kind]}
        </span>

        {/* Name */}
        <span className={`text-sm ${kindColors[item.kind]}`}>{item.name}</span>

        {/* Modifiers */}
        {item.modifiers && item.modifiers.length > 0 && (
          <div className="flex items-center gap-1">
            {item.modifiers.map((mod) => (
              <span key={mod} className="text-xs text-gray-600 italic">
                {mod}
              </span>
            ))}
          </div>
        )}

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
              <TypeItemRow
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

export const TypeHierarchy: React.FC<TypeHierarchyProps> = ({
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
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Type Hierarchy
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
            onClick={() => onModeChange('supertypes')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              mode === 'supertypes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Supertypes
          </button>
          <button
            onClick={() => onModeChange('subtypes')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              mode === 'subtypes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Subtypes
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
            placeholder="Filter types..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <RefreshCw className="w-10 h-10 text-blue-400 mb-3 animate-spin" />
            <p className="text-sm text-gray-400">Loading type hierarchy...</p>
          </div>
        ) : !rootItem ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Box className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No type selected</p>
            <p className="text-xs text-gray-600 mt-1">
              Right-click a class or interface and select "Show Type Hierarchy"
            </p>
          </div>
        ) : (
          <div className="py-1">
            {/* Root Item */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
              <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded ${
                rootItem.kind === 'class' ? 'bg-yellow-500/20 text-yellow-400' :
                rootItem.kind === 'interface' ? 'bg-green-500/20 text-green-400' :
                rootItem.kind === 'type' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {kindIcons[rootItem.kind]}
              </span>
              <span className={`text-sm font-medium ${kindColors[rootItem.kind]}`}>
                {rootItem.name}
              </span>
              <span className="text-xs text-gray-500">
                {mode === 'supertypes' ? 'extends / implements' : 'is extended by'}
              </span>
            </div>

            {/* Children */}
            <TypeItemRow
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

      {/* Footer - Legend */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {mode === 'supertypes' ? 'Showing parent types' : 'Showing child types'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 flex items-center justify-center bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">C</span>
              class
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 flex items-center justify-center bg-green-500/20 text-green-400 rounded text-xs font-bold">I</span>
              interface
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold">T</span>
              type
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeHierarchy;
