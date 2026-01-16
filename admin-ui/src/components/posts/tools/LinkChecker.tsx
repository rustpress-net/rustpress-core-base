import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Globe,
  FileText,
  Anchor,
  ArrowUpRight,
  Shield,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

interface LinkInfo {
  id: string;
  url: string;
  text: string;
  type: 'internal' | 'external' | 'anchor' | 'mailto' | 'tel';
  status: 'valid' | 'broken' | 'redirect' | 'timeout' | 'pending' | 'unknown';
  statusCode?: number;
  redirectUrl?: string;
  responseTime?: number;
  position: number;
  attributes: {
    rel?: string;
    target?: string;
    title?: string;
  };
  issues: LinkIssue[];
  lastChecked?: Date;
}

interface LinkIssue {
  type: 'no-text' | 'generic-text' | 'too-long' | 'no-https' | 'no-rel' | 'orphan' | 'duplicate';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface LinkCheckerSettings {
  autoCheck: boolean;
  checkInterval: number;
  timeout: number;
  followRedirects: boolean;
  checkExternal: boolean;
  showPreview: boolean;
  groupByType: boolean;
  showIssuesOnly: boolean;
}

interface LinkCheckerProps {
  content?: string;
  onLinkClick?: (linkId: string) => void;
  onLinkUpdate?: (linkId: string, newUrl: string) => void;
  onLinkRemove?: (linkId: string) => void;
  className?: string;
}

const mockLinks: LinkInfo[] = [
  {
    id: 'l1',
    url: 'https://example.com/guide',
    text: 'Complete Guide',
    type: 'external',
    status: 'valid',
    statusCode: 200,
    responseTime: 145,
    position: 1,
    attributes: { rel: 'noopener noreferrer', target: '_blank' },
    issues: [],
    lastChecked: new Date(Date.now() - 60000)
  },
  {
    id: 'l2',
    url: 'https://broken-link.example.com/page',
    text: 'Click here',
    type: 'external',
    status: 'broken',
    statusCode: 404,
    responseTime: 89,
    position: 2,
    attributes: { target: '_blank' },
    issues: [
      { type: 'generic-text', severity: 'warning', message: 'Generic anchor text "Click here" is not descriptive', suggestion: 'Use descriptive anchor text that explains where the link leads' },
      { type: 'no-rel', severity: 'warning', message: 'External link missing rel="noopener noreferrer"', suggestion: 'Add rel="noopener noreferrer" for security' }
    ],
    lastChecked: new Date(Date.now() - 120000)
  },
  {
    id: 'l3',
    url: '/blog/react-hooks',
    text: 'React Hooks Tutorial',
    type: 'internal',
    status: 'valid',
    statusCode: 200,
    responseTime: 23,
    position: 3,
    attributes: {},
    issues: [],
    lastChecked: new Date(Date.now() - 180000)
  },
  {
    id: 'l4',
    url: 'http://insecure-site.com/resource',
    text: 'Resource Link',
    type: 'external',
    status: 'redirect',
    statusCode: 301,
    redirectUrl: 'https://insecure-site.com/resource',
    responseTime: 234,
    position: 4,
    attributes: {},
    issues: [
      { type: 'no-https', severity: 'error', message: 'Link uses insecure HTTP protocol', suggestion: 'Update to HTTPS for security' }
    ],
    lastChecked: new Date(Date.now() - 240000)
  },
  {
    id: 'l5',
    url: '#section-one',
    text: 'Jump to Section One',
    type: 'anchor',
    status: 'valid',
    position: 5,
    attributes: {},
    issues: [],
    lastChecked: new Date(Date.now() - 300000)
  },
  {
    id: 'l6',
    url: 'https://slow-server.example.com/api',
    text: 'API Documentation',
    type: 'external',
    status: 'timeout',
    responseTime: 30000,
    position: 6,
    attributes: { rel: 'noopener', target: '_blank' },
    issues: [],
    lastChecked: new Date(Date.now() - 360000)
  },
  {
    id: 'l7',
    url: 'mailto:contact@example.com',
    text: 'Contact Us',
    type: 'mailto',
    status: 'valid',
    position: 7,
    attributes: {},
    issues: [],
    lastChecked: new Date(Date.now() - 420000)
  },
  {
    id: 'l8',
    url: '/blog/old-post',
    text: '',
    type: 'internal',
    status: 'broken',
    statusCode: 404,
    responseTime: 45,
    position: 8,
    attributes: {},
    issues: [
      { type: 'no-text', severity: 'error', message: 'Link has no anchor text', suggestion: 'Add descriptive text between the anchor tags' }
    ],
    lastChecked: new Date(Date.now() - 480000)
  }
];

export const LinkChecker: React.FC<LinkCheckerProps> = ({
  content,
  onLinkClick,
  onLinkUpdate,
  onLinkRemove,
  className
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const [settings, setSettings] = useState<LinkCheckerSettings>({
    autoCheck: true,
    checkInterval: 300,
    timeout: 10000,
    followRedirects: true,
    checkExternal: true,
    showPreview: true,
    groupByType: false,
    showIssuesOnly: false
  });

  const stats = useMemo(() => {
    return {
      total: mockLinks.length,
      valid: mockLinks.filter(l => l.status === 'valid').length,
      broken: mockLinks.filter(l => l.status === 'broken').length,
      redirects: mockLinks.filter(l => l.status === 'redirect').length,
      timeout: mockLinks.filter(l => l.status === 'timeout').length,
      issues: mockLinks.reduce((acc, l) => acc + l.issues.length, 0),
      internal: mockLinks.filter(l => l.type === 'internal').length,
      external: mockLinks.filter(l => l.type === 'external').length
    };
  }, []);

  const filteredLinks = useMemo(() => {
    return mockLinks.filter(link => {
      if (searchQuery && !link.url.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !link.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all' && link.type !== filterType) return false;
      if (filterStatus !== 'all' && link.status !== filterStatus) return false;
      if (settings.showIssuesOnly && link.issues.length === 0) return false;
      return true;
    });
  }, [searchQuery, filterType, filterStatus, settings.showIssuesOnly]);

  const handleCheckAll = async () => {
    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsChecking(false);
  };

  const getStatusIcon = (status: LinkInfo['status']) => {
    switch (status) {
      case 'valid': return <CheckCircle size={16} className="text-green-500" />;
      case 'broken': return <XCircle size={16} className="text-red-500" />;
      case 'redirect': return <ArrowUpRight size={16} className="text-amber-500" />;
      case 'timeout': return <Clock size={16} className="text-orange-500" />;
      case 'pending': return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      default: return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const getTypeIcon = (type: LinkInfo['type']) => {
    switch (type) {
      case 'external': return <ExternalLink size={14} />;
      case 'internal': return <FileText size={14} />;
      case 'anchor': return <Anchor size={14} />;
      case 'mailto': return <Globe size={14} />;
      case 'tel': return <Globe size={14} />;
      default: return <Link2 size={14} />;
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
            <Link2 size={20} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Link Checker</h2>
            <p className="text-sm text-gray-500">Validate all links in your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckAll}
            disabled={isChecking}
            className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={clsx(isChecking && 'animate-spin')} />
            {isChecking ? 'Checking...' : 'Check All'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 divide-x border-b">
        {[
          { label: 'Total', value: stats.total, color: 'gray' },
          { label: 'Valid', value: stats.valid, color: 'green' },
          { label: 'Broken', value: stats.broken, color: 'red' },
          { label: 'Redirects', value: stats.redirects, color: 'amber' },
          { label: 'Issues', value: stats.issues, color: 'orange' }
        ].map(stat => (
          <div key={stat.label} className="p-3 text-center">
            <div className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoCheck}
                  onChange={(e) => setSettings({ ...settings, autoCheck: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto Check</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.checkExternal}
                  onChange={(e) => setSettings({ ...settings, checkExternal: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Check External</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.followRedirects}
                  onChange={(e) => setSettings({ ...settings, followRedirects: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Follow Redirects</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showIssuesOnly}
                  onChange={(e) => setSettings({ ...settings, showIssuesOnly: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Issues Only</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="p-4 border-b flex gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="internal">Internal ({stats.internal})</option>
          <option value="external">External ({stats.external})</option>
          <option value="anchor">Anchors</option>
          <option value="mailto">Email</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="broken">Broken</option>
          <option value="redirect">Redirect</option>
          <option value="timeout">Timeout</option>
        </select>
      </div>

      {/* Links List */}
      <div className="max-h-[400px] overflow-y-auto divide-y">
        {filteredLinks.map((link, idx) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={clsx(
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              link.status === 'broken' && 'bg-red-50/50 dark:bg-red-900/10'
            )}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedLink(expandedLink === link.id ? null : link.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(link.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      'px-2 py-0.5 text-xs rounded flex items-center gap-1',
                      link.type === 'external' && 'bg-blue-100 text-blue-700',
                      link.type === 'internal' && 'bg-green-100 text-green-700',
                      link.type === 'anchor' && 'bg-purple-100 text-purple-700',
                      link.type === 'mailto' && 'bg-amber-100 text-amber-700'
                    )}>
                      {getTypeIcon(link.type)}
                      {link.type}
                    </span>
                    {link.statusCode && (
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded',
                        link.statusCode >= 200 && link.statusCode < 300 && 'bg-green-100 text-green-700',
                        link.statusCode >= 300 && link.statusCode < 400 && 'bg-amber-100 text-amber-700',
                        link.statusCode >= 400 && 'bg-red-100 text-red-700'
                      )}>
                        {link.statusCode}
                      </span>
                    )}
                    {link.responseTime && (
                      <span className="text-xs text-gray-500">{link.responseTime}ms</span>
                    )}
                    {link.issues.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {link.issues.length}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-blue-600 truncate" title={link.url}>
                    {link.url}
                  </div>

                  {link.text ? (
                    <div className="text-xs text-gray-500 mt-1">
                      Anchor: "{link.text}"
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 mt-1">
                      No anchor text
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(link.url);
                    }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Copy link"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link.url, '_blank');
                    }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Open link"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedLink === link.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Redirect Info */}
                    {link.status === 'redirect' && link.redirectUrl && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                        <ArrowUpRight size={16} className="text-amber-600" />
                        <span>Redirects to: </span>
                        <a href={link.redirectUrl} className="text-blue-600 hover:underline">{link.redirectUrl}</a>
                      </div>
                    )}

                    {/* Attributes */}
                    {Object.keys(link.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {link.attributes.rel && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-1">
                            <Shield size={12} />
                            rel="{link.attributes.rel}"
                          </span>
                        )}
                        {link.attributes.target && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                            target="{link.attributes.target}"
                          </span>
                        )}
                      </div>
                    )}

                    {/* Issues */}
                    {link.issues.length > 0 && (
                      <div className="space-y-2">
                        {link.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className={clsx(
                              'p-3 rounded-lg text-sm',
                              issue.severity === 'error' && 'bg-red-100 dark:bg-red-900/20',
                              issue.severity === 'warning' && 'bg-amber-100 dark:bg-amber-900/20',
                              issue.severity === 'info' && 'bg-blue-100 dark:bg-blue-900/20'
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium">
                              <AlertTriangle size={14} />
                              {issue.message}
                            </div>
                            {issue.suggestion && (
                              <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
                                <Zap size={12} />
                                {issue.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLinkClick?.(link.id)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Jump to link
                      </button>
                      <button
                        onClick={() => onLinkUpdate?.(link.id, link.url)}
                        className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => onLinkRemove?.(link.id)}
                        className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last checked: {link.lastChecked?.toLocaleString() || 'Never'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Link2 size={32} className="mx-auto mb-2 opacity-50" />
          <p>No links found matching your criteria</p>
        </div>
      )}
    </motion.div>
  );
};

export default LinkChecker;
