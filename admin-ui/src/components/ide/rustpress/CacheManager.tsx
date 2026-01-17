/**
 * CacheManager - Cache management and optimization
 * RustPress-specific caching functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, RefreshCw, Trash2, Clock, HardDrive, Zap,
  Check, AlertCircle, Settings, ChevronDown, ChevronRight,
  FileText, Image, Code, Globe, Server, ToggleLeft, ToggleRight
} from 'lucide-react';

export interface CacheEntry {
  id: string;
  key: string;
  type: 'page' | 'query' | 'object' | 'fragment' | 'asset' | 'api';
  size: number;
  hits: number;
  createdAt: string;
  expiresAt: string;
  tags: string[];
}

export interface CacheStats {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  memoryUsage: number;
  memoryLimit: number;
}

export interface CacheSettings {
  enabled: boolean;
  pageCache: boolean;
  queryCache: boolean;
  objectCache: boolean;
  assetCache: boolean;
  apiCache: boolean;
  defaultTtl: number;
  maxSize: number;
}

interface CacheManagerProps {
  onClear?: (type?: string) => void;
  onPurge?: (keys: string[]) => void;
}

// Mock data
const mockStats: CacheStats = {
  totalSize: 45678912,
  totalEntries: 1234,
  hitRate: 87.5,
  missRate: 12.5,
  memoryUsage: 256000000,
  memoryLimit: 512000000
};

const mockEntries: CacheEntry[] = [
  { id: '1', key: 'page:/home', type: 'page', size: 24576, hits: 1250, createdAt: '2024-01-15T10:00:00Z', expiresAt: '2024-01-15T22:00:00Z', tags: ['homepage', 'public'] },
  { id: '2', key: 'page:/blog', type: 'page', size: 18432, hits: 890, createdAt: '2024-01-15T09:00:00Z', expiresAt: '2024-01-15T21:00:00Z', tags: ['blog', 'public'] },
  { id: '3', key: 'query:posts_recent', type: 'query', size: 8192, hits: 3450, createdAt: '2024-01-15T11:00:00Z', expiresAt: '2024-01-15T12:00:00Z', tags: ['posts'] },
  { id: '4', key: 'query:categories_all', type: 'query', size: 2048, hits: 5670, createdAt: '2024-01-15T10:30:00Z', expiresAt: '2024-01-16T10:30:00Z', tags: ['taxonomy'] },
  { id: '5', key: 'object:user_1', type: 'object', size: 1024, hits: 890, createdAt: '2024-01-15T08:00:00Z', expiresAt: '2024-01-15T20:00:00Z', tags: ['users'] },
  { id: '6', key: 'api:/api/posts', type: 'api', size: 4096, hits: 2340, createdAt: '2024-01-15T11:30:00Z', expiresAt: '2024-01-15T11:35:00Z', tags: ['api', 'posts'] },
  { id: '7', key: 'asset:/css/main.css', type: 'asset', size: 45678, hits: 8900, createdAt: '2024-01-14T00:00:00Z', expiresAt: '2024-01-21T00:00:00Z', tags: ['static', 'css'] },
  { id: '8', key: 'fragment:sidebar_widget', type: 'fragment', size: 3072, hits: 4560, createdAt: '2024-01-15T09:00:00Z', expiresAt: '2024-01-15T15:00:00Z', tags: ['widgets'] }
];

const mockSettings: CacheSettings = {
  enabled: true,
  pageCache: true,
  queryCache: true,
  objectCache: true,
  assetCache: true,
  apiCache: true,
  defaultTtl: 3600,
  maxSize: 512000000
};

export const CacheManager: React.FC<CacheManagerProps> = ({
  onClear,
  onPurge
}) => {
  const [stats] = useState<CacheStats>(mockStats);
  const [entries, setEntries] = useState<CacheEntry[]>(mockEntries);
  const [settings, setSettings] = useState<CacheSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'settings'>('overview');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Expired';
    if (diff < 60000) return `${Math.round(diff / 1000)}s`;
    if (diff < 3600000) return `${Math.round(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h`;
    return `${Math.round(diff / 86400000)}d`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'query': return <Database className="w-4 h-4 text-purple-400" />;
      case 'object': return <Code className="w-4 h-4 text-green-400" />;
      case 'fragment': return <Code className="w-4 h-4 text-cyan-400" />;
      case 'asset': return <Image className="w-4 h-4 text-yellow-400" />;
      case 'api': return <Globe className="w-4 h-4 text-orange-400" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEntries([]);
    setIsClearing(false);
    onClear?.();
  };

  const handleClearType = async (type: string) => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setEntries(entries.filter(e => e.type !== type));
    setIsClearing(false);
    onClear?.(type);
  };

  const handlePurgeSelected = () => {
    const keys = entries.filter(e => selectedEntries.has(e.id)).map(e => e.key);
    setEntries(entries.filter(e => !selectedEntries.has(e.id)));
    setSelectedEntries(new Set());
    onPurge?.(keys);
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeStats = entries.reduce((acc, e) => {
    if (!acc[e.type]) acc[e.type] = { count: 0, size: 0 };
    acc[e.type].count++;
    acc[e.type].size += e.size;
    return acc;
  }, {} as Record<string, { count: number; size: number }>);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Cache Manager
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
            <button
              disabled={isClearing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs text-gray-500">Cache Size</span>
            </div>
            <div className="text-xl font-semibold text-white">{formatBytes(stats.totalSize)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs text-gray-500">Entries</span>
            </div>
            <div className="text-xl font-semibold text-white">{stats.totalEntries.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Check className="w-4 h-4" />
              <span className="text-xs text-gray-500">Hit Rate</span>
            </div>
            <div className="text-xl font-semibold text-white">{stats.hitRate}%</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs text-gray-500">Memory</span>
            </div>
            <div className="text-xl font-semibold text-white">
              {Math.round((stats.memoryUsage / stats.memoryLimit) * 100)}%
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${(stats.memoryUsage / stats.memoryLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(['overview', 'entries', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Cache by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(typeStats).map(([type, data]) => (
                <div key={type} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="text-white font-medium capitalize">{type}</span>
                    </div>
                    <button
                      onClick={() => handleClearType(type)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
                      title={`Clear ${type} cache`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Entries</span>
                      <span className="text-white">{data.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size</span>
                      <span className="text-white">{formatBytes(data.size)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hit/Miss Chart */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Cache Performance</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Hits</span>
                    <span className="text-green-400">{stats.hitRate}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.hitRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Misses</span>
                    <span className="text-red-400">{stats.missRate}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${stats.missRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cache keys..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
              />
              <select
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
              >
                <option value="">All Types</option>
                {Object.keys(typeStats).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {selectedEntries.size > 0 && (
                <button
                  onClick={handlePurgeSelected}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Purge ({selectedEntries.size})
                </button>
              )}
            </div>

            {/* Entries List */}
            <div className="space-y-2">
              {filteredEntries.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`bg-gray-800/50 rounded-lg p-3 ${
                    selectedEntries.has(entry.id) ? 'ring-1 ring-cyan-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEntries.has(entry.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedEntries);
                        if (newSelected.has(entry.id)) {
                          newSelected.delete(entry.id);
                        } else {
                          newSelected.add(entry.id);
                        }
                        setSelectedEntries(newSelected);
                      }}
                      className="rounded border-gray-600 bg-gray-800 text-cyan-600"
                    />
                    {getTypeIcon(entry.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-mono truncate">{entry.key}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{formatBytes(entry.size)}</span>
                        <span>{entry.hits.toLocaleString()} hits</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          TTL: {formatTime(entry.expiresAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium">Cache Enabled</h4>
                  <p className="text-sm text-gray-500">Enable or disable all caching</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.enabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {settings.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                {[
                  { key: 'pageCache', label: 'Page Cache', desc: 'Cache full HTML pages' },
                  { key: 'queryCache', label: 'Query Cache', desc: 'Cache database queries' },
                  { key: 'objectCache', label: 'Object Cache', desc: 'Cache complex objects' },
                  { key: 'assetCache', label: 'Asset Cache', desc: 'Cache static assets' },
                  { key: 'apiCache', label: 'API Cache', desc: 'Cache API responses' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-white">{item.label}</span>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        [item.key]: !settings[item.key as keyof CacheSettings]
                      })}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        settings[item.key as keyof CacheSettings] ? 'bg-cyan-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                        settings[item.key as keyof CacheSettings] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Cache Limits</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Default TTL (seconds)</label>
                  <input
                    type="number"
                    value={settings.defaultTtl}
                    onChange={(e) => setSettings({ ...settings, defaultTtl: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Max Cache Size (bytes)</label>
                  <input
                    type="number"
                    value={settings.maxSize}
                    onChange={(e) => setSettings({ ...settings, maxSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current: {formatBytes(settings.maxSize)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheManager;
