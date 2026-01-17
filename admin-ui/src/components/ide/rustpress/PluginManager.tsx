/**
 * PluginManager - Plugin installation and management
 * RustPress-specific plugin functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle, Power, Settings, Trash2, Download, Upload, RefreshCw,
  Star, Shield, Clock, ExternalLink, Search, Filter, Grid, List,
  CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, Code
} from 'lucide-react';

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string;
  icon?: string;
  status: 'active' | 'inactive' | 'update-available' | 'incompatible';
  rating: number;
  downloads: number;
  lastUpdated: string;
  requires: string;
  testedUpTo: string;
  category: string;
  settings?: boolean;
}

interface PluginManagerProps {
  onActivate?: (plugin: Plugin) => void;
  onDeactivate?: (plugin: Plugin) => void;
  onDelete?: (plugin: Plugin) => void;
  onUpdate?: (plugin: Plugin) => void;
}

const mockPlugins: Plugin[] = [
  {
    id: '1',
    name: 'SEO Optimizer Pro',
    slug: 'seo-optimizer-pro',
    description: 'Advanced SEO tools for RustPress including meta tags, sitemaps, and schema markup.',
    version: '2.5.1',
    author: 'RustPress Team',
    authorUrl: 'https://rustpress.io',
    status: 'active',
    rating: 4.8,
    downloads: 150000,
    lastUpdated: '2024-01-15',
    requires: '1.0.0',
    testedUpTo: '2.0.0',
    category: 'SEO',
    settings: true
  },
  {
    id: '2',
    name: 'Contact Forms',
    slug: 'contact-forms',
    description: 'Create beautiful contact forms with drag-and-drop builder and spam protection.',
    version: '3.2.0',
    author: 'FormWizard',
    status: 'active',
    rating: 4.6,
    downloads: 280000,
    lastUpdated: '2024-01-10',
    requires: '1.0.0',
    testedUpTo: '2.0.0',
    category: 'Forms',
    settings: true
  },
  {
    id: '3',
    name: 'WooCommerce Integration',
    slug: 'woocommerce-integration',
    description: 'Full e-commerce functionality with products, cart, and checkout.',
    version: '4.1.2',
    author: 'Commerce Labs',
    status: 'update-available',
    rating: 4.9,
    downloads: 520000,
    lastUpdated: '2024-01-05',
    requires: '1.0.0',
    testedUpTo: '2.0.0',
    category: 'E-Commerce',
    settings: true
  },
  {
    id: '4',
    name: 'Social Share Buttons',
    slug: 'social-share',
    description: 'Add social sharing buttons to your posts and pages.',
    version: '1.8.5',
    author: 'Social Tools',
    status: 'inactive',
    rating: 4.3,
    downloads: 95000,
    lastUpdated: '2023-12-20',
    requires: '1.0.0',
    testedUpTo: '1.9.0',
    category: 'Social',
    settings: true
  },
  {
    id: '5',
    name: 'Cache Optimizer',
    slug: 'cache-optimizer',
    description: 'Speed up your site with advanced caching mechanisms.',
    version: '2.0.0',
    author: 'SpeedFreak',
    status: 'active',
    rating: 4.7,
    downloads: 320000,
    lastUpdated: '2024-01-12',
    requires: '1.0.0',
    testedUpTo: '2.0.0',
    category: 'Performance',
    settings: true
  },
  {
    id: '6',
    name: 'Backup Master',
    slug: 'backup-master',
    description: 'Automated backups to cloud storage with one-click restore.',
    version: '1.5.3',
    author: 'SafeData',
    status: 'inactive',
    rating: 4.5,
    downloads: 180000,
    lastUpdated: '2023-12-28',
    requires: '1.0.0',
    testedUpTo: '2.0.0',
    category: 'Backup',
    settings: true
  },
  {
    id: '7',
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Comprehensive analytics with real-time visitor tracking.',
    version: '3.0.1',
    author: 'DataViz Inc',
    status: 'active',
    rating: 4.4,
    downloads: 210000,
    lastUpdated: '2024-01-08',
    requires: '1.0.0',
    testedUpTo: '2.0.0',
    category: 'Analytics',
    settings: true
  },
  {
    id: '8',
    name: 'Security Shield',
    slug: 'security-shield',
    description: 'Protect your site from hackers with firewall and malware scanning.',
    version: '2.2.0',
    author: 'SecurePress',
    status: 'incompatible',
    rating: 4.9,
    downloads: 450000,
    lastUpdated: '2023-11-15',
    requires: '0.9.0',
    testedUpTo: '1.5.0',
    category: 'Security',
    settings: true
  }
];

const categories = ['All', 'SEO', 'Forms', 'E-Commerce', 'Social', 'Performance', 'Backup', 'Analytics', 'Security'];

export const PluginManager: React.FC<PluginManagerProps> = ({
  onActivate,
  onDeactivate,
  onDelete,
  onUpdate
}) => {
  const [plugins, setPlugins] = useState<Plugin[]>(mockPlugins);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleTogglePlugin = (plugin: Plugin) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === plugin.id) {
        const newStatus = p.status === 'active' ? 'inactive' : 'active';
        if (newStatus === 'active') {
          onActivate?.(p);
        } else {
          onDeactivate?.(p);
        }
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleDeletePlugin = (plugin: Plugin) => {
    setPlugins(prev => prev.filter(p => p.id !== plugin.id));
    onDelete?.(plugin);
    if (selectedPlugin?.id === plugin.id) setSelectedPlugin(null);
  };

  const handleUpdatePlugin = (plugin: Plugin) => {
    setPlugins(prev => prev.map(p =>
      p.id === plugin.id ? { ...p, status: 'active' } : p
    ));
    onUpdate?.(plugin);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'inactive': return 'text-gray-400 bg-gray-500/10';
      case 'update-available': return 'text-yellow-400 bg-yellow-500/10';
      case 'incompatible': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'update-available': return <AlertTriangle className="w-4 h-4" />;
      case 'incompatible': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    if (searchQuery && !plugin.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'All' && plugin.category !== selectedCategory) return false;
    if (statusFilter && plugin.status !== statusFilter) return false;
    return true;
  });

  const statusCounts = plugins.reduce((acc, plugin) => {
    acc[plugin.status] = (acc[plugin.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-purple-400" />
            Plugin Manager
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg">
              <Upload className="w-4 h-4" />
              Upload Plugin
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">
              <Download className="w-4 h-4" />
              Browse Plugins
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plugins..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1 text-xs rounded-full ${
              !statusFilter ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All ({plugins.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 text-xs rounded-full ${
              statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Active ({statusCounts.active || 0})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 text-xs rounded-full ${
              statusFilter === 'inactive' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Inactive ({statusCounts.inactive || 0})
          </button>
          <button
            onClick={() => setStatusFilter('update-available')}
            className={`px-3 py-1 text-xs rounded-full ${
              statusFilter === 'update-available' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Updates ({statusCounts['update-available'] || 0})
          </button>
        </div>
      </div>

      {/* Plugin List */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredPlugins.map(plugin => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Puzzle className="w-6 h-6 text-purple-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{plugin.name}</h3>
                      <span className="text-xs text-gray-500">v{plugin.version}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${getStatusColor(plugin.status)}`}>
                        {getStatusIcon(plugin.status)}
                        {plugin.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{plugin.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>By {plugin.author}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {plugin.rating}
                      </span>
                      <span>{plugin.downloads.toLocaleString()} downloads</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {plugin.lastUpdated}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {plugin.status === 'update-available' && (
                      <button
                        onClick={() => handleUpdatePlugin(plugin)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-600/30"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Update
                      </button>
                    )}
                    {plugin.settings && plugin.status === 'active' && (
                      <button className="p-2 hover:bg-gray-700 rounded-lg">
                        <Settings className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleTogglePlugin(plugin)}
                      disabled={plugin.status === 'incompatible'}
                      className={`p-2 rounded-lg transition-colors ${
                        plugin.status === 'active'
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : plugin.status === 'incompatible'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlugin(plugin)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {plugin.status === 'incompatible' && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    This plugin is incompatible with your version of RustPress (requires {plugin.requires} - {plugin.testedUpTo})
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlugins.map(plugin => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Puzzle className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(plugin.status)}`}>
                    {plugin.status.replace('-', ' ')}
                  </span>
                </div>

                <h3 className="text-white font-medium mb-1">{plugin.name}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">{plugin.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {plugin.rating}
                  </span>
                  <span>v{plugin.version}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePlugin(plugin)}
                    disabled={plugin.status === 'incompatible'}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      plugin.status === 'active'
                        ? 'bg-green-600/20 text-green-400'
                        : plugin.status === 'incompatible'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    {plugin.status === 'active' ? 'Active' : 'Activate'}
                  </button>
                  {plugin.settings && plugin.status === 'active' && (
                    <button className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredPlugins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Puzzle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No plugins found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManager;
