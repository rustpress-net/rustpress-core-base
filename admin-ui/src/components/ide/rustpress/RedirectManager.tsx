/**
 * RedirectManager - URL redirect management
 * RustPress-specific redirect functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Plus, Trash2, Edit2, Save, X, Search,
  Filter, Download, Upload, Check, AlertTriangle,
  ExternalLink, RefreshCw, Link2, ArrowRightLeft
} from 'lucide-react';

export interface Redirect {
  id: string;
  source: string;
  destination: string;
  type: '301' | '302' | '307' | '308';
  enabled: boolean;
  hits: number;
  createdAt: string;
  lastHit?: string;
  regex?: boolean;
  notes?: string;
}

interface RedirectManagerProps {
  onSave?: (redirects: Redirect[]) => void;
  onTest?: (url: string) => void;
}

const mockRedirects: Redirect[] = [
  { id: '1', source: '/old-page', destination: '/new-page', type: '301', enabled: true, hits: 1245, createdAt: '2024-01-01', lastHit: '2024-01-16' },
  { id: '2', source: '/blog/old-post', destination: '/articles/new-post', type: '301', enabled: true, hits: 892, createdAt: '2024-01-05', lastHit: '2024-01-15' },
  { id: '3', source: '/products/*', destination: '/shop/$1', type: '301', enabled: true, hits: 3420, createdAt: '2023-12-15', lastHit: '2024-01-16', regex: true },
  { id: '4', source: '/temporary-promo', destination: '/sale', type: '302', enabled: true, hits: 567, createdAt: '2024-01-10', lastHit: '2024-01-16' },
  { id: '5', source: '/legacy-api/*', destination: '/api/v2/$1', type: '308', enabled: false, hits: 0, createdAt: '2024-01-12', regex: true, notes: 'Waiting for v2 API launch' },
];

const redirectTypes = [
  { value: '301', label: '301 - Permanent', description: 'Page has moved permanently' },
  { value: '302', label: '302 - Temporary', description: 'Page is temporarily moved' },
  { value: '307', label: '307 - Temporary (Strict)', description: 'Temporary redirect, preserves method' },
  { value: '308', label: '308 - Permanent (Strict)', description: 'Permanent redirect, preserves method' },
];

export const RedirectManager: React.FC<RedirectManagerProps> = ({
  onSave,
  onTest
}) => {
  const [redirects, setRedirects] = useState<Redirect[]>(mockRedirects);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRedirect, setNewRedirect] = useState<Partial<Redirect>>({
    source: '',
    destination: '',
    type: '301',
    enabled: true,
    regex: false
  });

  const handleAdd = () => {
    if (!newRedirect.source || !newRedirect.destination) return;
    const redirect: Redirect = {
      id: `redirect-${Date.now()}`,
      source: newRedirect.source!,
      destination: newRedirect.destination!,
      type: newRedirect.type as Redirect['type'] || '301',
      enabled: newRedirect.enabled ?? true,
      hits: 0,
      createdAt: new Date().toISOString().split('T')[0],
      regex: newRedirect.regex,
      notes: newRedirect.notes
    };
    setRedirects([...redirects, redirect]);
    setNewRedirect({ source: '', destination: '', type: '301', enabled: true, regex: false });
    setShowAddForm(false);
  };

  const handleUpdate = (id: string, updates: Partial<Redirect>) => {
    setRedirects(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDelete = (id: string) => {
    setRedirects(prev => prev.filter(r => r.id !== id));
  };

  const toggleEnabled = (id: string) => {
    setRedirects(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const exportRedirects = () => {
    const data = redirects.map(r => `${r.source},${r.destination},${r.type}`).join('\n');
    const blob = new Blob([`source,destination,type\n${data}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'redirects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRedirects = redirects.filter(redirect => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!redirect.source.toLowerCase().includes(query) &&
          !redirect.destination.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (typeFilter && redirect.type !== typeFilter) return false;
    return true;
  });

  const totalHits = redirects.reduce((sum, r) => sum + r.hits, 0);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-400" />
            Redirect Manager
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportRedirects}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Redirect
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{redirects.length}</div>
            <div className="text-xs text-gray-400">Total Redirects</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{redirects.filter(r => r.enabled).length}</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{totalHits.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Hits</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{redirects.filter(r => r.regex).length}</div>
            <div className="text-xs text-gray-400">Regex Rules</div>
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
              placeholder="Search URLs..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {['301', '302', '307', '308'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  typeFilter === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-800 overflow-hidden"
          >
            <div className="p-4 bg-gray-800/30">
              <h3 className="text-sm font-medium text-white mb-3">Add New Redirect</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Source URL</label>
                  <input
                    type="text"
                    value={newRedirect.source}
                    onChange={(e) => setNewRedirect({ ...newRedirect, source: e.target.value })}
                    placeholder="/old-path"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={newRedirect.destination}
                    onChange={(e) => setNewRedirect({ ...newRedirect, destination: e.target.value })}
                    placeholder="/new-path or https://..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Type</label>
                  <select
                    value={newRedirect.type}
                    onChange={(e) => setNewRedirect({ ...newRedirect, type: e.target.value as Redirect['type'] })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    {redirectTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newRedirect.regex}
                    onChange={(e) => setNewRedirect({ ...newRedirect, regex: e.target.checked })}
                    className="rounded bg-gray-800 border-gray-600 text-purple-600"
                  />
                  <span className="text-sm text-gray-400">Use regex pattern</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newRedirect.source || !newRedirect.destination}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg"
                  >
                    Add Redirect
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redirects List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Source</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase w-16">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Destination</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-20">Hits</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase w-20">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredRedirects.map(redirect => (
              <tr key={redirect.id} className={`hover:bg-gray-800/30 ${!redirect.enabled ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-purple-400 text-sm">{redirect.source}</code>
                    {redirect.regex && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">regex</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    redirect.type === '301' ? 'bg-green-500/20 text-green-400' :
                    redirect.type === '302' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {redirect.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <code className="text-cyan-400 text-sm">{redirect.destination}</code>
                    {redirect.destination.startsWith('http') && (
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-400 text-sm">
                  {redirect.hits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleEnabled(redirect.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      redirect.enabled ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      redirect.enabled ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onTest?.(redirect.source)}
                      className="p-1.5 hover:bg-gray-700 rounded"
                      title="Test redirect"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => setEditingId(redirect.id)}
                      className="p-1.5 hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(redirect.id)}
                      className="p-1.5 hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRedirects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Link2 className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No redirects found</p>
            <p className="text-sm">Create your first redirect rule</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => onSave?.(redirects)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default RedirectManager;
