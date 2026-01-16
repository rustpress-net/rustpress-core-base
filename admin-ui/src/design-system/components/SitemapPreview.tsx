import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapURL {
  id: string;
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFrequency;
  priority?: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
  news?: SitemapNews;
  isIncluded: boolean;
  type: 'page' | 'post' | 'category' | 'tag' | 'author' | 'archive' | 'media' | 'custom';
}

export interface SitemapImage {
  loc: string;
  caption?: string;
  title?: string;
  geoLocation?: string;
  license?: string;
}

export interface SitemapVideo {
  thumbnailLoc: string;
  title: string;
  description: string;
  contentLoc?: string;
  playerLoc?: string;
  duration?: number;
  publicationDate?: string;
}

export interface SitemapNews {
  publicationName: string;
  language: string;
  publicationDate: string;
  title: string;
  keywords?: string[];
}

export interface SitemapIndex {
  name: string;
  loc: string;
  lastmod?: string;
  urlCount: number;
}

export interface SitemapStats {
  totalUrls: number;
  includedUrls: number;
  excludedUrls: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  lastGenerated?: string;
  sizeBytes?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  maxUrlsPerSitemap?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
  includeNews?: boolean;
  defaultPriority?: number;
  defaultChangefreq?: ChangeFrequency;
  excludePatterns?: string[];
  autoGenerate?: boolean;
  pingSearchEngines?: boolean;
}

interface SitemapContextType {
  urls: SitemapURL[];
  setUrls: React.Dispatch<React.SetStateAction<SitemapURL[]>>;
  sitemapIndexes: SitemapIndex[];
  setSitemapIndexes: React.Dispatch<React.SetStateAction<SitemapIndex[]>>;
  stats: SitemapStats;
  config: SitemapConfig;
  setConfig: React.Dispatch<React.SetStateAction<SitemapConfig>>;
  selectedUrls: Set<string>;
  setSelectedUrls: React.Dispatch<React.SetStateAction<Set<string>>>;
  filter: URLFilter;
  setFilter: React.Dispatch<React.SetStateAction<URLFilter>>;
  updateUrl: (id: string, updates: Partial<SitemapURL>) => void;
  bulkUpdate: (ids: string[], updates: Partial<SitemapURL>) => void;
  addUrl: (url: Omit<SitemapURL, 'id'>) => void;
  removeUrl: (id: string) => void;
  generateSitemap: () => string;
  validateSitemap: () => ValidationResult[];
}

interface URLFilter {
  type?: SitemapURL['type'];
  isIncluded?: boolean;
  search?: string;
  priority?: number;
}

interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  urlId?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SitemapContext = createContext<SitemapContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface SitemapProviderProps {
  children: React.ReactNode;
  initialUrls?: SitemapURL[];
  initialConfig?: Partial<SitemapConfig>;
  onUrlsChange?: (urls: SitemapURL[]) => void;
  onConfigChange?: (config: SitemapConfig) => void;
  onGenerate?: (xml: string) => void;
}

export const SitemapProvider: React.FC<SitemapProviderProps> = ({
  children,
  initialUrls = [],
  initialConfig = {},
  onUrlsChange,
  onConfigChange,
  onGenerate,
}) => {
  const [urls, setUrls] = useState<SitemapURL[]>(initialUrls);
  const [sitemapIndexes, setSitemapIndexes] = useState<SitemapIndex[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<URLFilter>({});
  const [config, setConfig] = useState<SitemapConfig>({
    baseUrl: 'https://example.com',
    maxUrlsPerSitemap: 50000,
    includeImages: true,
    includeVideos: false,
    includeNews: false,
    defaultPriority: 0.5,
    defaultChangefreq: 'weekly',
    excludePatterns: [],
    autoGenerate: true,
    pingSearchEngines: true,
    ...initialConfig,
  });

  const stats = useMemo<SitemapStats>(() => {
    const included = urls.filter(u => u.isIncluded);
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    urls.forEach(url => {
      byType[url.type] = (byType[url.type] || 0) + 1;
      const priorityKey = String(url.priority ?? config.defaultPriority);
      byPriority[priorityKey] = (byPriority[priorityKey] || 0) + 1;
    });

    return {
      totalUrls: urls.length,
      includedUrls: included.length,
      excludedUrls: urls.length - included.length,
      byType,
      byPriority,
    };
  }, [urls, config.defaultPriority]);

  useEffect(() => {
    onUrlsChange?.(urls);
  }, [urls, onUrlsChange]);

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const updateUrl = useCallback((id: string, updates: Partial<SitemapURL>) => {
    setUrls(prev => prev.map(url =>
      url.id === id ? { ...url, ...updates } : url
    ));
  }, []);

  const bulkUpdate = useCallback((ids: string[], updates: Partial<SitemapURL>) => {
    const idSet = new Set(ids);
    setUrls(prev => prev.map(url =>
      idSet.has(url.id) ? { ...url, ...updates } : url
    ));
  }, []);

  const addUrl = useCallback((url: Omit<SitemapURL, 'id'>) => {
    const newUrl: SitemapURL = {
      ...url,
      id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setUrls(prev => [...prev, newUrl]);
  }, []);

  const removeUrl = useCallback((id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id));
    setSelectedUrls(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const generateSitemap = useCallback((): string => {
    const includedUrls = urls.filter(u => u.isIncluded);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

    if (config.includeImages) {
      xml += '\n  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
    }
    if (config.includeVideos) {
      xml += '\n  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
    }
    if (config.includeNews) {
      xml += '\n  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"';
    }
    xml += '>\n';

    includedUrls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;

      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      if (url.priority !== undefined) {
        xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }

      // Images
      if (config.includeImages && url.images) {
        url.images.forEach(img => {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
          if (img.caption) xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
          if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
          xml += '    </image:image>\n';
        });
      }

      // Videos
      if (config.includeVideos && url.videos) {
        url.videos.forEach(video => {
          xml += '    <video:video>\n';
          xml += `      <video:thumbnail_loc>${escapeXml(video.thumbnailLoc)}</video:thumbnail_loc>\n`;
          xml += `      <video:title>${escapeXml(video.title)}</video:title>\n`;
          xml += `      <video:description>${escapeXml(video.description)}</video:description>\n`;
          if (video.contentLoc) xml += `      <video:content_loc>${escapeXml(video.contentLoc)}</video:content_loc>\n`;
          if (video.duration) xml += `      <video:duration>${video.duration}</video:duration>\n`;
          xml += '    </video:video>\n';
        });
      }

      // News
      if (config.includeNews && url.news) {
        xml += '    <news:news>\n';
        xml += '      <news:publication>\n';
        xml += `        <news:name>${escapeXml(url.news.publicationName)}</news:name>\n`;
        xml += `        <news:language>${url.news.language}</news:language>\n`;
        xml += '      </news:publication>\n';
        xml += `      <news:publication_date>${url.news.publicationDate}</news:publication_date>\n`;
        xml += `      <news:title>${escapeXml(url.news.title)}</news:title>\n`;
        xml += '    </news:news>\n';
      }

      xml += '  </url>\n';
    });

    xml += '</urlset>';

    onGenerate?.(xml);
    return xml;
  }, [urls, config, onGenerate]);

  const validateSitemap = useCallback((): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const includedUrls = urls.filter(u => u.isIncluded);

    // Check URL count
    if (includedUrls.length > (config.maxUrlsPerSitemap ?? 50000)) {
      results.push({
        type: 'error',
        message: `Sitemap exceeds maximum URL limit of ${config.maxUrlsPerSitemap}. Consider using sitemap index.`,
      });
    }

    // Check for duplicate URLs
    const urlSet = new Set<string>();
    includedUrls.forEach(url => {
      if (urlSet.has(url.loc)) {
        results.push({
          type: 'error',
          message: `Duplicate URL found: ${url.loc}`,
          urlId: url.id,
        });
      }
      urlSet.add(url.loc);
    });

    // Check URL format
    includedUrls.forEach(url => {
      try {
        new URL(url.loc);
      } catch {
        results.push({
          type: 'error',
          message: `Invalid URL format: ${url.loc}`,
          urlId: url.id,
        });
      }

      // Check if URL starts with base URL
      if (!url.loc.startsWith(config.baseUrl)) {
        results.push({
          type: 'warning',
          message: `URL does not match base URL: ${url.loc}`,
          urlId: url.id,
        });
      }

      // Check priority range
      if (url.priority !== undefined && (url.priority < 0 || url.priority > 1)) {
        results.push({
          type: 'error',
          message: `Invalid priority value (must be 0.0-1.0): ${url.priority}`,
          urlId: url.id,
        });
      }

      // Check lastmod format
      if (url.lastmod && !/^\d{4}-\d{2}-\d{2}/.test(url.lastmod)) {
        results.push({
          type: 'warning',
          message: `Invalid lastmod format (should be ISO 8601): ${url.lastmod}`,
          urlId: url.id,
        });
      }
    });

    // Check for low priority home page
    const homePage = includedUrls.find(u => u.loc === config.baseUrl || u.loc === `${config.baseUrl}/`);
    if (homePage && (homePage.priority ?? 0.5) < 1.0) {
      results.push({
        type: 'info',
        message: 'Consider setting home page priority to 1.0',
        urlId: homePage.id,
      });
    }

    if (results.length === 0) {
      results.push({
        type: 'info',
        message: 'Sitemap is valid with no issues detected.',
      });
    }

    return results;
  }, [urls, config]);

  return (
    <SitemapContext.Provider value={{
      urls,
      setUrls,
      sitemapIndexes,
      setSitemapIndexes,
      stats,
      config,
      setConfig,
      selectedUrls,
      setSelectedUrls,
      filter,
      setFilter,
      updateUrl,
      bulkUpdate,
      addUrl,
      removeUrl,
      generateSitemap,
      validateSitemap,
    }}>
      {children}
    </SitemapContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSitemap = (): SitemapContextType => {
  const context = useContext(SitemapContext);
  if (!context) {
    throw new Error('useSitemap must be used within a SitemapProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Stats Overview
export const SitemapStatsOverview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { stats, urls, config } = useSitemap();

  const typeIcons: Record<string, string> = {
    page: '📄',
    post: '📝',
    category: '📁',
    tag: '🏷️',
    author: '👤',
    archive: '📚',
    media: '🖼️',
    custom: '⚙️',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sitemap Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalUrls}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total URLs</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.includedUrls}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Included</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.excludedUrls}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Excluded</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {config.maxUrlsPerSitemap ? Math.ceil(stats.includedUrls / config.maxUrlsPerSitemap) : 1}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sitemaps</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URLs by Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div
              key={type}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
            >
              <span>{typeIcons[type] || '📄'}</span>
              <span className="capitalize">{type}</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">({count})</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Priority Distribution
        </h4>
        <div className="flex gap-1 h-6">
          {[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map(priority => {
            const count = stats.byPriority[String(priority)] || 0;
            const percentage = stats.totalUrls > 0 ? (count / stats.totalUrls) * 100 : 0;
            return (
              <div
                key={priority}
                className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded overflow-hidden"
                title={`Priority ${priority}: ${count} URLs`}
              >
                <div
                  className="h-full bg-blue-500"
                  style={{ height: `${percentage}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1.0</span>
          <span>0.5</span>
          <span>0.1</span>
        </div>
      </div>
    </div>
  );
};

// URL Filter Bar
export const URLFilterBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { filter, setFilter } = useSitemap();

  const typeOptions: { value: SitemapURL['type'] | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'page', label: 'Pages' },
    { value: 'post', label: 'Posts' },
    { value: 'category', label: 'Categories' },
    { value: 'tag', label: 'Tags' },
    { value: 'author', label: 'Authors' },
    { value: 'archive', label: 'Archives' },
    { value: 'media', label: 'Media' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={filter.search || ''}
          onChange={(e) => setFilter(f => ({ ...f, search: e.target.value || undefined }))}
          placeholder="Search URLs..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <select
        value={filter.type || ''}
        onChange={(e) => setFilter(f => ({ ...f, type: (e.target.value as SitemapURL['type']) || undefined }))}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {typeOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={filter.isIncluded === undefined ? '' : String(filter.isIncluded)}
        onChange={(e) => setFilter(f => ({
          ...f,
          isIncluded: e.target.value === '' ? undefined : e.target.value === 'true'
        }))}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="">All URLs</option>
        <option value="true">Included Only</option>
        <option value="false">Excluded Only</option>
      </select>

      {(filter.search || filter.type || filter.isIncluded !== undefined) && (
        <button
          onClick={() => setFilter({})}
          className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Clear
        </button>
      )}
    </div>
  );
};

// URL List Item
export const URLListItem: React.FC<{
  url: SitemapURL;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}> = ({ url, isSelected, onSelect, className = '' }) => {
  const { updateUrl, removeUrl, config } = useSitemap();
  const [isExpanded, setIsExpanded] = useState(false);

  const typeColors: Record<string, string> = {
    page: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    post: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    category: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    tag: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    author: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    archive: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    media: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  };

  const displayUrl = url.loc.replace(config.baseUrl, '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
        !url.isIncluded ? 'opacity-60' : ''
      } ${className}`}
    >
      <div className="flex items-center p-3 bg-white dark:bg-gray-800">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 mr-3"
        />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="block"
          >
            ▶
          </motion.span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded capitalize ${typeColors[url.type]}`}>
              {url.type}
            </span>
            <span className="font-mono text-sm text-gray-900 dark:text-white truncate">
              {displayUrl || '/'}
            </span>
          </div>
          {url.lastmod && (
            <div className="text-xs text-gray-500 mt-1">
              Last modified: {url.lastmod}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Priority:</span>
            <input
              type="number"
              value={url.priority ?? config.defaultPriority ?? 0.5}
              onChange={(e) => updateUrl(url.id, { priority: parseFloat(e.target.value) })}
              min="0"
              max="1"
              step="0.1"
              className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => updateUrl(url.id, { isIncluded: !url.isIncluded })}
            className={`px-2 py-1 text-xs rounded ${
              url.isIncluded
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {url.isIncluded ? 'Included' : 'Excluded'}
          </button>

          <button
            onClick={() => removeUrl(url.id)}
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
            title="Remove URL"
          >
            ×
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full URL
                  </label>
                  <input
                    type="text"
                    value={url.loc}
                    onChange={(e) => updateUrl(url.id, { loc: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Change Frequency
                  </label>
                  <select
                    value={url.changefreq || config.defaultChangefreq || 'weekly'}
                    onChange={(e) => updateUrl(url.id, { changefreq: e.target.value as ChangeFrequency })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Modified
                  </label>
                  <input
                    type="date"
                    value={url.lastmod ? url.lastmod.split('T')[0] : ''}
                    onChange={(e) => updateUrl(url.id, { lastmod: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={url.type}
                    onChange={(e) => updateUrl(url.id, { type: e.target.value as SitemapURL['type'] })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="page">Page</option>
                    <option value="post">Post</option>
                    <option value="category">Category</option>
                    <option value="tag">Tag</option>
                    <option value="author">Author</option>
                    <option value="archive">Archive</option>
                    <option value="media">Media</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {url.images && url.images.length > 0 && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Images ({url.images.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {url.images.map((img, i) => (
                      <div key={i} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {img.title || img.loc.split('/').pop()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// URL List
export const URLList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { urls, filter, selectedUrls, setSelectedUrls } = useSitemap();

  const filteredUrls = useMemo(() => {
    return urls.filter(url => {
      if (filter.type && url.type !== filter.type) return false;
      if (filter.isIncluded !== undefined && url.isIncluded !== filter.isIncluded) return false;
      if (filter.search && !url.loc.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }, [urls, filter]);

  const toggleSelectAll = () => {
    if (selectedUrls.size === filteredUrls.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(filteredUrls.map(u => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedUrls(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedUrls.size === filteredUrls.length && filteredUrls.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedUrls.size > 0
              ? `${selectedUrls.size} selected`
              : `${filteredUrls.length} URLs`}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {filteredUrls.map(url => (
            <URLListItem
              key={url.id}
              url={url}
              isSelected={selectedUrls.has(url.id)}
              onSelect={() => toggleSelect(url.id)}
            />
          ))}
        </AnimatePresence>
        {filteredUrls.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No URLs match the current filter
          </div>
        )}
      </div>
    </div>
  );
};

// Bulk Actions
export const BulkActions: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedUrls, bulkUpdate, setSelectedUrls, config } = useSitemap();

  if (selectedUrls.size === 0) return null;

  const ids = Array.from(selectedUrls);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-4 ${className}`}
    >
      <span className="text-sm">{selectedUrls.size} selected</span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => { bulkUpdate(ids, { isIncluded: true }); setSelectedUrls(new Set()); }}
          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded"
        >
          Include
        </button>
        <button
          onClick={() => { bulkUpdate(ids, { isIncluded: false }); setSelectedUrls(new Set()); }}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded"
        >
          Exclude
        </button>
        <select
          onChange={(e) => {
            if (e.target.value) {
              bulkUpdate(ids, { priority: parseFloat(e.target.value) });
            }
          }}
          className="px-2 py-1 text-sm bg-gray-800 rounded border border-gray-700"
          defaultValue=""
        >
          <option value="" disabled>Set Priority</option>
          {[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map(p => (
            <option key={p} value={p}>{p.toFixed(1)}</option>
          ))}
        </select>
        <select
          onChange={(e) => {
            if (e.target.value) {
              bulkUpdate(ids, { changefreq: e.target.value as ChangeFrequency });
            }
          }}
          className="px-2 py-1 text-sm bg-gray-800 rounded border border-gray-700"
          defaultValue=""
        >
          <option value="" disabled>Set Frequency</option>
          <option value="always">Always</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="never">Never</option>
        </select>
      </div>

      <button
        onClick={() => setSelectedUrls(new Set())}
        className="p-1 hover:bg-gray-800 rounded"
      >
        ×
      </button>
    </motion.div>
  );
};

// Add URL Form
export const AddURLForm: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { addUrl, config } = useSitemap();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    loc: '',
    type: 'page' as SitemapURL['type'],
    priority: 0.5,
    changefreq: 'weekly' as ChangeFrequency,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loc) return;

    const fullUrl = formData.loc.startsWith('http')
      ? formData.loc
      : `${config.baseUrl}${formData.loc.startsWith('/') ? '' : '/'}${formData.loc}`;

    addUrl({
      loc: fullUrl,
      type: formData.type,
      priority: formData.priority,
      changefreq: formData.changefreq,
      isIncluded: true,
    });

    setFormData({ loc: '', type: 'page', priority: 0.5, changefreq: 'weekly' });
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>+</span> Add URL
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL Path
              </label>
              <div className="flex">
                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-sm text-gray-500">
                  {config.baseUrl}
                </span>
                <input
                  type="text"
                  value={formData.loc}
                  onChange={(e) => setFormData(f => ({ ...f, loc: e.target.value }))}
                  placeholder="/your-page-path"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(f => ({ ...f, type: e.target.value as SitemapURL['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="page">Page</option>
                <option value="post">Post</option>
                <option value="category">Category</option>
                <option value="tag">Tag</option>
                <option value="author">Author</option>
                <option value="archive">Archive</option>
                <option value="media">Media</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <input
                type="range"
                value={formData.priority}
                onChange={(e) => setFormData(f => ({ ...f, priority: parseFloat(e.target.value) }))}
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <div className="text-center text-sm text-gray-500">{formData.priority.toFixed(1)}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add URL
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
};

// Validation Panel
export const ValidationPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { validateSitemap } = useSitemap();
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = () => {
    setIsValidating(true);
    setTimeout(() => {
      setResults(validateSitemap());
      setIsValidating(false);
    }, 500);
  };

  const typeStyles = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
  };

  const typeIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Validation
        </h3>
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : 'Validate Sitemap'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-2 p-3 rounded-lg border ${typeStyles[result.type]}`}
            >
              <span>{typeIcons[result.type]}</span>
              <span className="text-sm">{result.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {results.length === 0 && !isValidating && (
        <div className="text-center text-gray-500 py-4">
          Click "Validate Sitemap" to check for issues
        </div>
      )}
    </div>
  );
};

// XML Preview
export const XMLPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { generateSitemap, stats } = useSitemap();
  const [xml, setXml] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setXml(generateSitemap());
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          XML Preview
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate XML
          </button>
          {xml && (
            <>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download
              </button>
            </>
          )}
        </div>
      </div>

      {xml ? (
        <div className="relative">
          <div className="absolute top-2 right-2 text-xs text-gray-500">
            {formatBytes(new Blob([xml]).size)} • {stats.includedUrls} URLs
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[400px] overflow-y-auto">
            {xml}
          </pre>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          Click "Generate XML" to preview your sitemap
        </div>
      )}
    </div>
  );
};

// Config Panel
export const ConfigPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config, setConfig } = useSitemap();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sitemap Configuration
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Base URL
          </label>
          <input
            type="url"
            value={config.baseUrl}
            onChange={(e) => setConfig(c => ({ ...c, baseUrl: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max URLs per Sitemap
            </label>
            <input
              type="number"
              value={config.maxUrlsPerSitemap}
              onChange={(e) => setConfig(c => ({ ...c, maxUrlsPerSitemap: parseInt(e.target.value) }))}
              max={50000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Priority
            </label>
            <input
              type="number"
              value={config.defaultPriority}
              onChange={(e) => setConfig(c => ({ ...c, defaultPriority: parseFloat(e.target.value) }))}
              min={0}
              max={1}
              step={0.1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Change Frequency
          </label>
          <select
            value={config.defaultChangefreq}
            onChange={(e) => setConfig(c => ({ ...c, defaultChangefreq: e.target.value as ChangeFrequency }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="always">Always</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.includeImages}
              onChange={(e) => setConfig(c => ({ ...c, includeImages: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Include image sitemaps</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.includeVideos}
              onChange={(e) => setConfig(c => ({ ...c, includeVideos: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Include video sitemaps</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.includeNews}
              onChange={(e) => setConfig(c => ({ ...c, includeNews: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Include news sitemaps</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.pingSearchEngines}
              onChange={(e) => setConfig(c => ({ ...c, pingSearchEngines: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Ping search engines on update</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Sitemap Index View
export const SitemapIndexView: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { sitemapIndexes, config, stats } = useSitemap();

  const estimatedSitemaps = config.maxUrlsPerSitemap
    ? Math.ceil(stats.includedUrls / config.maxUrlsPerSitemap)
    : 1;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sitemap Index
      </h3>

      {estimatedSitemaps > 1 ? (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your sitemap will be split into {estimatedSitemaps} files with a sitemap index.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-2xl">📋</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  sitemap-index.xml
                </div>
                <div className="text-sm text-gray-500">
                  Index file containing {estimatedSitemaps} sitemap references
                </div>
              </div>
            </div>

            {Array.from({ length: estimatedSitemaps }, (_, i) => {
              const startUrl = i * (config.maxUrlsPerSitemap ?? 50000) + 1;
              const endUrl = Math.min((i + 1) * (config.maxUrlsPerSitemap ?? 50000), stats.includedUrls);
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      sitemap-{i + 1}.xml
                    </div>
                    <div className="text-sm text-gray-500">
                      URLs {startUrl} - {endUrl}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p>With {stats.includedUrls} URLs, your sitemap fits in a single file.</p>
          <p className="text-sm mt-1">
            A sitemap index is only needed when exceeding {config.maxUrlsPerSitemap?.toLocaleString()} URLs.
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SitemapPreview: React.FC<{
  initialUrls?: SitemapURL[];
  initialConfig?: Partial<SitemapConfig>;
  onUrlsChange?: (urls: SitemapURL[]) => void;
  onConfigChange?: (config: SitemapConfig) => void;
  onGenerate?: (xml: string) => void;
  className?: string;
}> = ({
  initialUrls,
  initialConfig,
  onUrlsChange,
  onConfigChange,
  onGenerate,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'urls' | 'preview' | 'config'>('urls');

  const tabs = [
    { id: 'urls', label: 'URLs', icon: '🔗' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'config', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <SitemapProvider
      initialUrls={initialUrls}
      initialConfig={initialConfig}
      onUrlsChange={onUrlsChange}
      onConfigChange={onConfigChange}
      onGenerate={onGenerate}
    >
      <div className={`bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🗺️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sitemap Manager
                </h2>
                <p className="text-sm text-gray-500">
                  Configure and generate your XML sitemap
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4">
          <SitemapStatsOverview />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'urls' && (
              <motion.div
                key="urls"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <URLFilterBar />
                  <AddURLForm />
                </div>
                <URLList />
                <BulkActions />
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ValidationPanel />
                  <SitemapIndexView />
                </div>
                <XMLPreview />
              </motion.div>
            )}

            {activeTab === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ConfigPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SitemapProvider>
  );
};

export default SitemapPreview;
