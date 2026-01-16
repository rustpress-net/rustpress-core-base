import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Video,
  Music,
  FileText,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  FolderOpen,
  Plus,
  X,
  Check,
  Download,
  Trash2,
  Edit3,
  Eye,
  Copy,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronRight,
  HardDrive,
  Clock,
  Tag,
  Star,
  StarOff,
  MoreVertical
} from 'lucide-react';
import clsx from 'clsx';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
  alt?: string;
  caption?: string;
  uploadedAt: Date;
  uploadedBy: string;
  folder?: string;
  tags: string[];
  starred: boolean;
}

interface Folder {
  id: string;
  name: string;
  itemCount: number;
  children?: Folder[];
}

interface MediaLibrarySettings {
  defaultView: 'grid' | 'list';
  gridSize: 'small' | 'medium' | 'large';
  sortBy: 'date' | 'name' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  showFileInfo: boolean;
  enableDragDrop: boolean;
}

interface MediaLibraryPanelProps {
  onSelect?: (items: MediaItem[]) => void;
  onInsert?: (item: MediaItem) => void;
  multiSelect?: boolean;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  className?: string;
}

const mockMedia: MediaItem[] = [
  {
    id: 'm1',
    name: 'hero-banner.jpg',
    type: 'image',
    url: '/uploads/hero-banner.jpg',
    thumbnail: '/thumbnails/hero-banner.jpg',
    size: 245678,
    dimensions: { width: 1920, height: 1080 },
    mimeType: 'image/jpeg',
    alt: 'Hero banner for homepage',
    caption: 'Main hero image',
    uploadedAt: new Date(Date.now() - 86400000),
    uploadedBy: 'admin',
    folder: 'banners',
    tags: ['hero', 'homepage', 'featured'],
    starred: true
  },
  {
    id: 'm2',
    name: 'product-demo.mp4',
    type: 'video',
    url: '/uploads/product-demo.mp4',
    thumbnail: '/thumbnails/product-demo.jpg',
    size: 15678900,
    dimensions: { width: 1920, height: 1080 },
    duration: 120,
    mimeType: 'video/mp4',
    caption: 'Product demonstration video',
    uploadedAt: new Date(Date.now() - 172800000),
    uploadedBy: 'admin',
    folder: 'videos',
    tags: ['product', 'demo', 'tutorial'],
    starred: false
  },
  {
    id: 'm3',
    name: 'podcast-episode-1.mp3',
    type: 'audio',
    url: '/uploads/podcast-episode-1.mp3',
    size: 8765432,
    duration: 1800,
    mimeType: 'audio/mpeg',
    caption: 'Episode 1: Getting Started',
    uploadedAt: new Date(Date.now() - 259200000),
    uploadedBy: 'admin',
    folder: 'podcasts',
    tags: ['podcast', 'episode-1'],
    starred: false
  },
  {
    id: 'm4',
    name: 'whitepaper.pdf',
    type: 'document',
    url: '/uploads/whitepaper.pdf',
    size: 2345678,
    mimeType: 'application/pdf',
    caption: 'Industry whitepaper 2024',
    uploadedAt: new Date(Date.now() - 345600000),
    uploadedBy: 'admin',
    folder: 'documents',
    tags: ['whitepaper', 'research'],
    starred: true
  },
  {
    id: 'm5',
    name: 'team-photo.png',
    type: 'image',
    url: '/uploads/team-photo.png',
    thumbnail: '/thumbnails/team-photo.png',
    size: 567890,
    dimensions: { width: 2400, height: 1600 },
    mimeType: 'image/png',
    alt: 'Our team members',
    caption: 'Team photo 2024',
    uploadedAt: new Date(Date.now() - 432000000),
    uploadedBy: 'admin',
    folder: 'team',
    tags: ['team', 'about'],
    starred: false
  },
  {
    id: 'm6',
    name: 'icon-set.svg',
    type: 'image',
    url: '/uploads/icon-set.svg',
    size: 12345,
    dimensions: { width: 500, height: 500 },
    mimeType: 'image/svg+xml',
    alt: 'Icon collection',
    uploadedAt: new Date(Date.now() - 518400000),
    uploadedBy: 'admin',
    folder: 'icons',
    tags: ['icons', 'svg', 'design'],
    starred: false
  }
];

const mockFolders: Folder[] = [
  { id: 'f1', name: 'banners', itemCount: 12 },
  { id: 'f2', name: 'videos', itemCount: 8 },
  { id: 'f3', name: 'podcasts', itemCount: 24 },
  { id: 'f4', name: 'documents', itemCount: 15 },
  { id: 'f5', name: 'team', itemCount: 6 },
  { id: 'f6', name: 'icons', itemCount: 45 }
];

export const MediaLibraryPanel: React.FC<MediaLibraryPanelProps> = ({
  onSelect,
  onInsert,
  multiSelect = false,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<MediaLibrarySettings>({
    defaultView: 'grid',
    gridSize: 'medium',
    sortBy: 'date',
    sortOrder: 'desc',
    showFileInfo: true,
    enableDragDrop: true
  });

  const filteredMedia = useMemo(() => {
    return mockMedia.filter(item => {
      if (!allowedTypes.includes(item.type)) return false;
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (selectedFolder && item.folder !== selectedFolder) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) ||
               item.tags.some(t => t.toLowerCase().includes(query)) ||
               item.caption?.toLowerCase().includes(query);
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      switch (settings.sortBy) {
        case 'date':
          comparison = b.uploadedAt.getTime() - a.uploadedAt.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return settings.sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [searchQuery, filterType, selectedFolder, settings, allowedTypes]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (!multiSelect) newSelected.clear();
      newSelected.add(id);
    }
    setSelectedItems(newSelected);

    if (onSelect) {
      onSelect(mockMedia.filter(m => newSelected.has(m.id)));
    }
  };

  const handleInsert = (item: MediaItem) => {
    if (onInsert) {
      onInsert(item);
    }
  };

  const gridSizeClass = {
    small: 'grid-cols-6',
    medium: 'grid-cols-4',
    large: 'grid-cols-3'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col',
        className
      )}
      style={{ height: '600px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
            <FolderOpen size={20} className="text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Media Library</h2>
            <p className="text-sm text-gray-500">{filteredMedia.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
          >
            <Upload size={14} />
            Upload
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-pink-100 text-pink-600' : 'hover:bg-white/50'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b bg-gray-50 dark:bg-gray-800/50">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          {allowedTypes.includes('image') && <option value="image">Images</option>}
          {allowedTypes.includes('video') && <option value="video">Videos</option>}
          {allowedTypes.includes('audio') && <option value="audio">Audio</option>}
          {allowedTypes.includes('document') && <option value="document">Documents</option>}
        </select>
        <select
          value={settings.sortBy}
          onChange={(e) => setSettings({ ...settings, sortBy: e.target.value as any })}
          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
          <option value="type">Type</option>
        </select>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2',
              viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'
            )}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2',
              viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Folders */}
        <div className="w-48 border-r bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
          <div className="p-3">
            <button
              onClick={() => setSelectedFolder(null)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                !selectedFolder ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'
              )}
            >
              <FolderOpen size={16} />
              All Media
            </button>
            <button
              onClick={() => setSelectedFolder('starred')}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mt-1',
                selectedFolder === 'starred' ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'
              )}
            >
              <Star size={16} />
              Starred
            </button>
          </div>
          <div className="border-t p-3">
            <p className="text-xs text-gray-500 uppercase mb-2">Folders</p>
            {mockFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.name)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                  selectedFolder === folder.name ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'
                )}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen size={14} />
                  {folder.name}
                </span>
                <span className="text-xs text-gray-400">{folder.itemCount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className={clsx('grid gap-4', gridSizeClass[settings.gridSize])}>
              {filteredMedia.map((item, idx) => {
                const Icon = getTypeIcon(item.type);
                const isSelected = selectedItems.has(item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className={clsx(
                      'relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                      isSelected ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => toggleSelect(item.id)}
                    onDoubleClick={() => handleInsert(item)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {item.thumbnail || item.type === 'image' ? (
                        <div className="w-full h-full bg-gray-200" />
                      ) : (
                        <Icon size={32} className="text-gray-400" />
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}

                    {/* Star */}
                    {item.starred && (
                      <div className="absolute top-2 left-2">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                      </div>
                    )}

                    {/* Duration for video/audio */}
                    {item.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(item);
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInsert(item);
                        }}
                        className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* File Info */}
                    {settings.showFileInfo && (
                      <div className="p-2 bg-white dark:bg-gray-900">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{formatSize(item.size)}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((item, idx) => {
                const Icon = getTypeIcon(item.type);
                const isSelected = selectedItems.has(item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={clsx(
                      'flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'
                    )}
                    onClick={() => toggleSelect(item.id)}
                    onDoubleClick={() => handleInsert(item)}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatSize(item.size)}</span>
                        {item.dimensions && (
                          <span>{item.dimensions.width} × {item.dimensions.height}</span>
                        )}
                        {item.duration && (
                          <span>{formatDuration(item.duration)}</span>
                        )}
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {item.starred && (
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsert(item);
                      }}
                      className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                      Insert
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredMedia.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FolderOpen size={48} className="mb-4 opacity-50" />
              <p>No media found</p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 text-pink-600 hover:underline"
              >
                Upload new files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between p-4 border-t bg-pink-50 dark:bg-pink-900/20">
          <span className="text-sm text-gray-600">
            {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-3 py-1.5 text-sm border rounded hover:bg-white"
            >
              Clear
            </button>
            <button
              onClick={() => {
                const items = mockMedia.filter(m => selectedItems.has(m.id));
                items.forEach(handleInsert);
              }}
              className="px-4 py-1.5 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Insert Selected
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">{previewItem.name}</h3>
                <button onClick={() => setPreviewItem(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex gap-6">
                <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center h-80">
                  {previewItem.type === 'image' ? (
                    <Image size={64} className="text-gray-400" />
                  ) : (
                    React.createElement(getTypeIcon(previewItem.type), { size: 64, className: "text-gray-400" })
                  )}
                </div>
                <div className="w-64 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">File Name</label>
                    <p className="font-medium">{previewItem.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Size</label>
                    <p>{formatSize(previewItem.size)}</p>
                  </div>
                  {previewItem.dimensions && (
                    <div>
                      <label className="text-xs text-gray-500">Dimensions</label>
                      <p>{previewItem.dimensions.width} × {previewItem.dimensions.height}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500">Uploaded</label>
                    <p>{new Date(previewItem.uploadedAt).toLocaleString()}</p>
                  </div>
                  {previewItem.alt && (
                    <div>
                      <label className="text-xs text-gray-500">Alt Text</label>
                      <p>{previewItem.alt}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {previewItem.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleInsert(previewItem);
                      setPreviewItem(null);
                    }}
                    className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    Insert
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MediaLibraryPanel;
