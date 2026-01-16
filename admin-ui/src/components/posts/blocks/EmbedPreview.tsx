import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Youtube,
  Twitter,
  Instagram,
  Music,
  Code,
  Map,
  FileText,
  ExternalLink,
  RefreshCw,
  Settings,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Link,
  Globe,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

interface EmbedInfo {
  id: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'spotify' | 'soundcloud' | 'codepen' | 'codesandbox' | 'gist' | 'maps' | 'pdf' | 'figma' | 'loom' | 'custom';
  title?: string;
  thumbnail?: string;
  author?: string;
  duration?: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  lazyLoad: boolean;
  status: 'valid' | 'loading' | 'error' | 'blocked';
  errorMessage?: string;
}

interface EmbedPreviewSettings {
  defaultAspectRatio: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
  lazyLoadAll: boolean;
  showThumbnails: boolean;
  autoDetectType: boolean;
  enablePrivacyMode: boolean;
  maxWidth: number;
}

interface EmbedPreviewProps {
  embeds?: EmbedInfo[];
  onUpdate?: (embedId: string, updates: Partial<EmbedInfo>) => void;
  onRemove?: (embedId: string) => void;
  onAdd?: (url: string) => void;
  className?: string;
}

const embedTypes = [
  { type: 'youtube', icon: Youtube, color: 'red', patterns: ['youtube.com', 'youtu.be'] },
  { type: 'vimeo', icon: Play, color: 'blue', patterns: ['vimeo.com'] },
  { type: 'twitter', icon: Twitter, color: 'sky', patterns: ['twitter.com', 'x.com'] },
  { type: 'instagram', icon: Instagram, color: 'pink', patterns: ['instagram.com'] },
  { type: 'spotify', icon: Music, color: 'green', patterns: ['spotify.com'] },
  { type: 'soundcloud', icon: Music, color: 'orange', patterns: ['soundcloud.com'] },
  { type: 'codepen', icon: Code, color: 'gray', patterns: ['codepen.io'] },
  { type: 'codesandbox', icon: Code, color: 'indigo', patterns: ['codesandbox.io'] },
  { type: 'gist', icon: Code, color: 'purple', patterns: ['gist.github.com'] },
  { type: 'maps', icon: Map, color: 'emerald', patterns: ['google.com/maps', 'maps.google.com'] },
  { type: 'figma', icon: Sparkles, color: 'violet', patterns: ['figma.com'] },
  { type: 'loom', icon: Play, color: 'purple', patterns: ['loom.com'] }
];

const mockEmbeds: EmbedInfo[] = [
  {
    id: 'e1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'youtube',
    title: 'Getting Started with React',
    thumbnail: '/thumbnails/youtube-1.jpg',
    author: 'React Tutorial',
    duration: '12:34',
    aspectRatio: '16:9',
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    lazyLoad: true,
    status: 'valid'
  },
  {
    id: 'e2',
    url: 'https://twitter.com/reactjs/status/1234567890',
    type: 'twitter',
    title: 'React 19 announcement',
    author: '@reactjs',
    aspectRatio: 'auto',
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    lazyLoad: true,
    status: 'valid'
  },
  {
    id: 'e3',
    url: 'https://codepen.io/example/pen/AbCdEf',
    type: 'codepen',
    title: 'CSS Animation Demo',
    author: 'CodePen User',
    aspectRatio: '16:9',
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    lazyLoad: true,
    status: 'valid'
  },
  {
    id: 'e4',
    url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    type: 'spotify',
    title: 'Coding Playlist',
    author: 'Spotify',
    aspectRatio: 'auto',
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    lazyLoad: true,
    status: 'valid'
  },
  {
    id: 'e5',
    url: 'https://www.youtube.com/watch?v=invalid123',
    type: 'youtube',
    title: 'Unknown Video',
    aspectRatio: '16:9',
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    lazyLoad: true,
    status: 'error',
    errorMessage: 'Video unavailable or private'
  }
];

export const EmbedPreview: React.FC<EmbedPreviewProps> = ({
  embeds = mockEmbeds,
  onUpdate,
  onRemove,
  onAdd,
  className
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEmbed, setSelectedEmbed] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [isAddingEmbed, setIsAddingEmbed] = useState(false);
  const [previewMode, setPreviewMode] = useState<'list' | 'grid'>('list');
  const [expandedEmbed, setExpandedEmbed] = useState<string | null>(null);
  const [settings, setSettings] = useState<EmbedPreviewSettings>({
    defaultAspectRatio: '16:9',
    lazyLoadAll: true,
    showThumbnails: true,
    autoDetectType: true,
    enablePrivacyMode: false,
    maxWidth: 640
  });

  const stats = useMemo(() => ({
    total: embeds.length,
    valid: embeds.filter(e => e.status === 'valid').length,
    errors: embeds.filter(e => e.status === 'error').length,
    byType: embedTypes.reduce((acc, type) => {
      acc[type.type] = embeds.filter(e => e.type === type.type).length;
      return acc;
    }, {} as Record<string, number>)
  }), [embeds]);

  const getEmbedTypeInfo = (type: EmbedInfo['type']) => {
    return embedTypes.find(t => t.type === type) || { icon: Globe, color: 'gray' };
  };

  const detectEmbedType = (url: string): EmbedInfo['type'] => {
    for (const type of embedTypes) {
      if (type.patterns.some(pattern => url.includes(pattern))) {
        return type.type as EmbedInfo['type'];
      }
    }
    return 'custom';
  };

  const handleAddEmbed = () => {
    if (newUrl && onAdd) {
      onAdd(newUrl);
      setNewUrl('');
      setIsAddingEmbed(false);
    }
  };

  const copyEmbedCode = (embed: EmbedInfo) => {
    const code = `<iframe src="${embed.url}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(code);
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
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
            <Play size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Embed Preview</h2>
            <p className="text-sm text-gray-500">Manage embedded media from external sources</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingEmbed(!isAddingEmbed)}
            className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Add Embed
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-violet-100 text-violet-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Add Embed Form */}
      <AnimatePresence>
        {isAddingEmbed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-violet-50 dark:bg-violet-900/20 overflow-hidden"
          >
            <div className="p-4">
              <label className="text-sm font-medium block mb-2">Paste embed URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAddEmbed}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-gray-500">Supported:</span>
                {embedTypes.slice(0, 8).map(type => {
                  const Icon = type.icon;
                  return (
                    <span
                      key={type.type}
                      className={`px-2 py-1 text-xs rounded flex items-center gap-1 bg-${type.color}-100 text-${type.color}-700`}
                    >
                      <Icon size={12} />
                      {type.type}
                    </span>
                  );
                })}
                <span className="text-xs text-gray-400">+{embedTypes.length - 8} more</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div>
                <label className="text-xs text-gray-600 block mb-1">Default Aspect Ratio</label>
                <select
                  value={settings.defaultAspectRatio}
                  onChange={(e) => setSettings({ ...settings, defaultAspectRatio: e.target.value as any })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="9:16">9:16 (Vertical)</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Max Width</label>
                <input
                  type="number"
                  value={settings.maxWidth}
                  onChange={(e) => setSettings({ ...settings, maxWidth: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lazyLoadAll}
                  onChange={(e) => setSettings({ ...settings, lazyLoadAll: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Lazy load embeds</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enablePrivacyMode}
                  onChange={(e) => setSettings({ ...settings, enablePrivacyMode: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Privacy mode</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="flex items-center gap-4 p-3 border-b bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
        <span className="text-sm text-gray-600">{stats.total} embeds</span>
        <span className="text-sm text-green-600">{stats.valid} valid</span>
        {stats.errors > 0 && (
          <span className="text-sm text-red-600">{stats.errors} errors</span>
        )}
        <div className="flex-1" />
        <div className="flex gap-2">
          {embedTypes.filter(t => stats.byType[t.type] > 0).map(type => {
            const Icon = type.icon;
            return (
              <span
                key={type.type}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 bg-${type.color}-100 text-${type.color}-700`}
              >
                <Icon size={12} />
                {stats.byType[type.type]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Embeds List */}
      <div className="max-h-[400px] overflow-y-auto divide-y">
        {embeds.map((embed, idx) => {
          const typeInfo = getEmbedTypeInfo(embed.type);
          const Icon = typeInfo.icon;
          const isExpanded = expandedEmbed === embed.id;

          return (
            <motion.div
              key={embed.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={clsx(
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                embed.status === 'error' && 'bg-red-50/50 dark:bg-red-900/10'
              )}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail/Icon */}
                  <div className={clsx(
                    'w-24 h-16 rounded-lg flex items-center justify-center flex-shrink-0',
                    `bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30`
                  )}>
                    {embed.thumbnail && settings.showThumbnails ? (
                      <div className="w-full h-full bg-gray-300 rounded-lg" />
                    ) : (
                      <Icon size={24} className={`text-${typeInfo.color}-600`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded capitalize',
                        `bg-${typeInfo.color}-100 text-${typeInfo.color}-700`
                      )}>
                        {embed.type}
                      </span>
                      {embed.status === 'valid' && (
                        <Check size={14} className="text-green-500" />
                      )}
                      {embed.status === 'error' && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                      {embed.duration && (
                        <span className="text-xs text-gray-500">{embed.duration}</span>
                      )}
                    </div>

                    <div className="font-medium text-sm truncate">
                      {embed.title || 'Untitled Embed'}
                    </div>

                    {embed.author && (
                      <div className="text-xs text-gray-500">{embed.author}</div>
                    )}

                    <div className="text-xs text-blue-600 truncate mt-1">
                      {embed.url}
                    </div>

                    {embed.status === 'error' && embed.errorMessage && (
                      <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {embed.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedEmbed(isExpanded ? null : embed.id)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                      {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                      onClick={() => copyEmbedCode(embed)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      title="Copy embed code"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => window.open(embed.url, '_blank')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Preview & Settings */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Preview Placeholder */}
                      <div
                        className="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                        style={{
                          aspectRatio: embed.aspectRatio === 'auto' ? undefined : embed.aspectRatio.replace(':', '/'),
                          maxWidth: settings.maxWidth,
                          height: embed.aspectRatio === 'auto' ? 300 : undefined
                        }}
                      >
                        <div className="text-center">
                          <Icon size={48} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Embed Preview</p>
                          <p className="text-xs text-gray-400">{embed.aspectRatio} aspect ratio</p>
                        </div>
                      </div>

                      {/* Embed Settings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={embed.autoplay}
                            onChange={(e) => onUpdate?.(embed.id, { autoplay: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Autoplay</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={embed.loop}
                            onChange={(e) => onUpdate?.(embed.id, { loop: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Loop</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={embed.muted}
                            onChange={(e) => onUpdate?.(embed.id, { muted: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Muted</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={embed.showControls}
                            onChange={(e) => onUpdate?.(embed.id, { showControls: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Show Controls</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={embed.aspectRatio}
                          onChange={(e) => onUpdate?.(embed.id, { aspectRatio: e.target.value as any })}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="16:9">16:9</option>
                          <option value="4:3">4:3</option>
                          <option value="1:1">1:1</option>
                          <option value="9:16">9:16</option>
                          <option value="auto">Auto</option>
                        </select>
                        <button
                          onClick={() => onRemove?.(embed.id)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Remove Embed
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {embeds.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Play size={32} className="mx-auto mb-2 opacity-50" />
          <p>No embeds found</p>
          <button
            onClick={() => setIsAddingEmbed(true)}
            className="mt-2 text-violet-600 hover:underline"
          >
            Add your first embed
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default EmbedPreview;
