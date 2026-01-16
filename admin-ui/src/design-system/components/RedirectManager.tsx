/**
 * RedirectManager Component (27)
 *
 * 301/302 redirect management
 * Features: Redirect rules, bulk import, chain detection, testing
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface Redirect {
  id: string;
  source: string;
  destination: string;
  type: RedirectType;
  isRegex: boolean;
  isEnabled: boolean;
  hits: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export type RedirectType = '301' | '302' | '307' | '308';

export interface RedirectChain {
  redirects: Redirect[];
  finalDestination: string;
  chainLength: number;
}

export interface RedirectTest {
  source: string;
  matchedRedirect: Redirect | null;
  finalDestination: string | null;
  status: 'success' | 'no-match' | 'chain' | 'loop';
  chain?: RedirectChain;
}

export interface RedirectConfig {
  maxChainLength: number;
  enableRegex: boolean;
  defaultType: RedirectType;
  preserveQueryString: boolean;
}

interface RedirectContextType {
  redirects: Redirect[];
  selectedRedirects: string[];
  searchQuery: string;
  filterType: RedirectType | 'all';
  sortBy: 'source' | 'destination' | 'hits' | 'date';
  sortOrder: 'asc' | 'desc';
  config: RedirectConfig;
  addRedirect: (redirect: Omit<Redirect, 'id' | 'hits' | 'createdAt' | 'updatedAt'>) => void;
  updateRedirect: (id: string, updates: Partial<Redirect>) => void;
  deleteRedirect: (id: string) => void;
  deleteSelected: () => void;
  toggleRedirect: (id: string) => void;
  selectRedirect: (id: string) => void;
  deselectRedirect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: RedirectType | 'all') => void;
  setSortBy: (sort: 'source' | 'destination' | 'hits' | 'date') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  testRedirect: (source: string) => RedirectTest;
  detectChains: () => RedirectChain[];
  importRedirects: (data: string, format: 'csv' | 'json') => number;
  exportRedirects: (format: 'csv' | 'json') => string;
}

const RedirectContext = createContext<RedirectContextType | null>(null);

// Default config
const defaultConfig: RedirectConfig = {
  maxChainLength: 3,
  enableRegex: true,
  defaultType: '301',
  preserveQueryString: true,
};

// Provider
interface RedirectProviderProps {
  children: ReactNode;
  initialRedirects?: Redirect[];
  config?: Partial<RedirectConfig>;
  onRedirectsChange?: (redirects: Redirect[]) => void;
}

export const RedirectProvider: React.FC<RedirectProviderProps> = ({
  children,
  initialRedirects = [],
  config: userConfig,
  onRedirectsChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [selectedRedirects, setSelectedRedirects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<RedirectType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'source' | 'destination' | 'hits' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const addRedirect = useCallback((redirect: Omit<Redirect, 'id' | 'hits' | 'createdAt' | 'updatedAt'>) => {
    const newRedirect: Redirect = {
      ...redirect,
      id: `redirect-${Date.now()}`,
      hits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRedirects(prev => {
      const newRedirects = [...prev, newRedirect];
      onRedirectsChange?.(newRedirects);
      return newRedirects;
    });
  }, [onRedirectsChange]);

  const updateRedirect = useCallback((id: string, updates: Partial<Redirect>) => {
    setRedirects(prev => {
      const newRedirects = prev.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      );
      onRedirectsChange?.(newRedirects);
      return newRedirects;
    });
  }, [onRedirectsChange]);

  const deleteRedirect = useCallback((id: string) => {
    setRedirects(prev => {
      const newRedirects = prev.filter(r => r.id !== id);
      onRedirectsChange?.(newRedirects);
      return newRedirects;
    });
    setSelectedRedirects(prev => prev.filter(i => i !== id));
  }, [onRedirectsChange]);

  const deleteSelected = useCallback(() => {
    setRedirects(prev => {
      const newRedirects = prev.filter(r => !selectedRedirects.includes(r.id));
      onRedirectsChange?.(newRedirects);
      return newRedirects;
    });
    setSelectedRedirects([]);
  }, [selectedRedirects, onRedirectsChange]);

  const toggleRedirect = useCallback((id: string) => {
    updateRedirect(id, { isEnabled: !redirects.find(r => r.id === id)?.isEnabled });
  }, [redirects, updateRedirect]);

  const selectRedirect = useCallback((id: string) => {
    setSelectedRedirects(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const deselectRedirect = useCallback((id: string) => {
    setSelectedRedirects(prev => prev.filter(i => i !== id));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedRedirects(redirects.map(r => r.id));
  }, [redirects]);

  const clearSelection = useCallback(() => {
    setSelectedRedirects([]);
  }, []);

  const testRedirect = useCallback((source: string): RedirectTest => {
    const visited = new Set<string>();
    let currentSource = source;
    const chain: Redirect[] = [];

    while (true) {
      if (visited.has(currentSource)) {
        return {
          source,
          matchedRedirect: chain[0] || null,
          finalDestination: null,
          status: 'loop',
          chain: { redirects: chain, finalDestination: '', chainLength: chain.length },
        };
      }
      visited.add(currentSource);

      const match = redirects.find(r => {
        if (!r.isEnabled) return false;
        if (r.isRegex) {
          try {
            return new RegExp(r.source).test(currentSource);
          } catch {
            return false;
          }
        }
        return r.source === currentSource;
      });

      if (!match) {
        if (chain.length === 0) {
          return { source, matchedRedirect: null, finalDestination: null, status: 'no-match' };
        }
        return {
          source,
          matchedRedirect: chain[0],
          finalDestination: currentSource,
          status: chain.length > 1 ? 'chain' : 'success',
          chain: chain.length > 1
            ? { redirects: chain, finalDestination: currentSource, chainLength: chain.length }
            : undefined,
        };
      }

      chain.push(match);
      currentSource = match.destination;

      if (chain.length > config.maxChainLength) {
        return {
          source,
          matchedRedirect: chain[0],
          finalDestination: currentSource,
          status: 'chain',
          chain: { redirects: chain, finalDestination: currentSource, chainLength: chain.length },
        };
      }
    }
  }, [redirects, config.maxChainLength]);

  const detectChains = useCallback((): RedirectChain[] => {
    const chains: RedirectChain[] = [];

    redirects.forEach(redirect => {
      if (!redirect.isEnabled) return;

      const result = testRedirect(redirect.source);
      if (result.chain && result.chain.chainLength > 1) {
        // Check if this chain is already detected
        const exists = chains.some(c =>
          c.redirects[0].id === result.chain!.redirects[0].id
        );
        if (!exists) {
          chains.push(result.chain);
        }
      }
    });

    return chains;
  }, [redirects, testRedirect]);

  const importRedirects = useCallback((data: string, format: 'csv' | 'json'): number => {
    try {
      let imported: Omit<Redirect, 'id' | 'hits' | 'createdAt' | 'updatedAt'>[] = [];

      if (format === 'json') {
        const parsed = JSON.parse(data);
        imported = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        const lines = data.split('\n').filter(line => line.trim());
        imported = lines.map(line => {
          const [source, destination, type = '301'] = line.split(',').map(s => s.trim());
          return {
            source,
            destination,
            type: type as RedirectType,
            isRegex: false,
            isEnabled: true,
          };
        });
      }

      imported.forEach(r => addRedirect(r));
      return imported.length;
    } catch {
      return 0;
    }
  }, [addRedirect]);

  const exportRedirects = useCallback((format: 'csv' | 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(redirects, null, 2);
    }
    return redirects
      .map(r => `${r.source},${r.destination},${r.type}`)
      .join('\n');
  }, [redirects]);

  return (
    <RedirectContext.Provider value={{
      redirects,
      selectedRedirects,
      searchQuery,
      filterType,
      sortBy,
      sortOrder,
      config,
      addRedirect,
      updateRedirect,
      deleteRedirect,
      deleteSelected,
      toggleRedirect,
      selectRedirect,
      deselectRedirect,
      selectAll,
      clearSelection,
      setSearchQuery,
      setFilterType,
      setSortBy,
      setSortOrder,
      testRedirect,
      detectChains,
      importRedirects,
      exportRedirects,
    }}>
      {children}
    </RedirectContext.Provider>
  );
};

// Hook
export const useRedirects = () => {
  const context = useContext(RedirectContext);
  if (!context) {
    throw new Error('useRedirects must be used within RedirectProvider');
  }
  return context;
};

// Sub-components
export const RedirectToolbar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { searchQuery, setSearchQuery, filterType, setFilterType, sortBy, setSortBy, sortOrder, setSortOrder, selectedRedirects, clearSelection, deleteSelected } = useRedirects();

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search redirects..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="301">301 Permanent</option>
          <option value="302">302 Temporary</option>
          <option value="307">307 Temporary</option>
          <option value="308">308 Permanent</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        >
          <option value="source">Source</option>
          <option value="destination">Destination</option>
          <option value="hits">Hits</option>
          <option value="date">Date</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {selectedRedirects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedRedirects.length} selected
          </span>
          <button
            onClick={deleteSelected}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export const AddRedirectForm: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { addRedirect, config } = useRedirects();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [type, setType] = useState<RedirectType>(config.defaultType);
  const [isRegex, setIsRegex] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && destination) {
      addRedirect({ source, destination, type, isRegex, isEnabled: true });
      setSource('');
      setDestination('');
      setType(config.defaultType);
      setIsRegex(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Add New Redirect
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="/old-path"
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="/new-path"
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RedirectType)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        >
          <option value="301">301 Permanent</option>
          <option value="302">302 Temporary</option>
          <option value="307">307 Temporary</option>
          <option value="308">308 Permanent</option>
        </select>
        <div className="flex items-center gap-2">
          {config.enableRegex && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-xs text-gray-500">Regex</span>
            </label>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
};

export const RedirectRow: React.FC<{
  redirect: Redirect;
  isSelected: boolean;
  onToggleSelect: () => void;
}> = ({ redirect, isSelected, onToggleSelect }) => {
  const { updateRedirect, deleteRedirect, toggleRedirect } = useRedirects();
  const [isEditing, setIsEditing] = useState(false);
  const [editSource, setEditSource] = useState(redirect.source);
  const [editDestination, setEditDestination] = useState(redirect.destination);

  const handleSave = () => {
    updateRedirect(redirect.id, { source: editSource, destination: editDestination });
    setIsEditing(false);
  };

  const typeColors = {
    '301': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    '302': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    '307': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    '308': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <motion.div
      layout
      className={`flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 ${
        !redirect.isEnabled ? 'opacity-50' : ''
      } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-4 h-4 rounded border-gray-300"
      />

      <button
        onClick={() => toggleRedirect(redirect.id)}
        className={`w-8 h-4 rounded-full transition-colors ${
          redirect.isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
          redirect.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
        }`} />
      </button>

      <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColors[redirect.type]}`}>
        {redirect.type}
      </span>

      {redirect.isRegex && (
        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded">
          Regex
        </span>
      )}

      {isEditing ? (
        <>
          <input
            type="text"
            value={editSource}
            onChange={(e) => setEditSource(e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm"
          />
          <span className="text-gray-400">→</span>
          <input
            type="text"
            value={editDestination}
            onChange={(e) => setEditDestination(e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm"
          />
          <button onClick={handleSave} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded">
            ✓
          </button>
          <button onClick={() => setIsEditing(false)} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            ✕
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-900 dark:text-white font-mono truncate">
            {redirect.source}
          </span>
          <span className="text-gray-400">→</span>
          <span className="flex-1 text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
            {redirect.destination}
          </span>
          <span className="text-xs text-gray-500 w-16 text-right">
            {redirect.hits} hits
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✏️
          </button>
          <button
            onClick={() => deleteRedirect(redirect.id)}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            🗑️
          </button>
        </>
      )}
    </motion.div>
  );
};

export const RedirectList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { redirects, searchQuery, filterType, sortBy, sortOrder, selectedRedirects, selectRedirect, deselectRedirect } = useRedirects();

  let filtered = [...redirects];

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.source.toLowerCase().includes(query) ||
      r.destination.toLowerCase().includes(query)
    );
  }

  // Apply filter
  if (filterType !== 'all') {
    filtered = filtered.filter(r => r.type === filterType);
  }

  // Apply sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'source':
        comparison = a.source.localeCompare(b.source);
        break;
      case 'destination':
        comparison = a.destination.localeCompare(b.destination);
        break;
      case 'hits':
        comparison = a.hits - b.hits;
        break;
      case 'date':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (filtered.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <span className="text-4xl mb-4 block">↔️</span>
        <p className="text-gray-600 dark:text-gray-400">No redirects found</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {filtered.map(redirect => (
          <RedirectRow
            key={redirect.id}
            redirect={redirect}
            isSelected={selectedRedirects.includes(redirect.id)}
            onToggleSelect={() => {
              if (selectedRedirects.includes(redirect.id)) {
                deselectRedirect(redirect.id);
              } else {
                selectRedirect(redirect.id);
              }
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const RedirectTester: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { testRedirect } = useRedirects();
  const [testUrl, setTestUrl] = useState('');
  const [result, setResult] = useState<RedirectTest | null>(null);

  const handleTest = () => {
    if (testUrl) {
      setResult(testRedirect(testUrl));
    }
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Test Redirect
      </h4>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleTest()}
          placeholder="/test-path"
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
        <button
          onClick={handleTest}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          Test
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${
          result.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
          result.status === 'no-match' ? 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600' :
          result.status === 'chain' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
          'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {result.status === 'success' && (
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">
                <strong>{result.source}</strong> → <strong>{result.finalDestination}</strong>
              </span>
            </div>
          )}
          {result.status === 'no-match' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">○</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                No matching redirect found
              </span>
            </div>
          )}
          {result.status === 'chain' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500">⚠️</span>
                <span className="text-sm text-yellow-700 dark:text-yellow-400">
                  Redirect chain detected ({result.chain?.chainLength} redirects)
                </span>
              </div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {result.chain?.redirects.map((r, i) => (
                  <div key={i}>{r.source} → {r.destination}</div>
                ))}
              </div>
            </div>
          )}
          {result.status === 'loop' && (
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              <span className="text-sm text-red-600 dark:text-red-400">
                Redirect loop detected!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ChainDetector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { detectChains } = useRedirects();
  const [chains, setChains] = useState<RedirectChain[]>([]);
  const [hasDetected, setHasDetected] = useState(false);

  const handleDetect = () => {
    setChains(detectChains());
    setHasDetected(true);
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Chain Detection
        </h4>
        <button
          onClick={handleDetect}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          🔍 Detect Chains
        </button>
      </div>

      {hasDetected && (
        <>
          {chains.length === 0 ? (
            <p className="text-sm text-green-600">✅ No redirect chains found</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-yellow-600">
                ⚠️ {chains.length} redirect chain(s) found
              </p>
              {chains.map((chain, i) => (
                <div key={i} className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">
                    Chain of {chain.chainLength} redirects
                  </p>
                  <div className="text-xs font-mono space-y-1">
                    {chain.redirects.map((r, j) => (
                      <div key={j} className="text-gray-600 dark:text-gray-400">
                        {j === 0 ? r.source : ''} → {r.destination}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ImportExport: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { importRedirects, exportRedirects } = useRedirects();
  const [importData, setImportData] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const handleImport = () => {
    const count = importRedirects(importData, format);
    if (count > 0) {
      setImportData('');
      alert(`Imported ${count} redirects`);
    }
  };

  const handleExport = () => {
    const data = exportRedirects(format);
    navigator.clipboard.writeText(data);
    alert('Exported to clipboard');
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Import / Export
      </h4>
      <div className="flex gap-2 mb-3">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as any)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
        >
          Export
        </button>
      </div>
      <textarea
        value={importData}
        onChange={(e) => setImportData(e.target.value)}
        placeholder={format === 'csv' ? '/old,/new,301\n/another,/path,302' : '[{"source": "/old", "destination": "/new"}]'}
        rows={4}
        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono resize-none mb-2"
      />
      <button
        onClick={handleImport}
        disabled={!importData}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
      >
        Import
      </button>
    </div>
  );
};

// Main Component
export const RedirectManager: React.FC<{
  initialRedirects?: Redirect[];
  config?: Partial<RedirectConfig>;
  onRedirectsChange?: (redirects: Redirect[]) => void;
  className?: string;
}> = ({ initialRedirects, config, onRedirectsChange, className = '' }) => {
  return (
    <RedirectProvider initialRedirects={initialRedirects} config={config} onRedirectsChange={onRedirectsChange}>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Redirects
          </h2>
        </div>

        <RedirectToolbar />
        <AddRedirectForm className="m-4" />
        <RedirectList />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <RedirectTester />
          <ChainDetector />
        </div>

        <ImportExport className="m-4" />
      </div>
    </RedirectProvider>
  );
};

export default RedirectManager;
