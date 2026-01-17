/**
 * MediaLibrary - Upload and manage media files
 * RustPress-specific media management functionality
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Upload, Folder, Grid, List, Search, Filter, Trash2,
  Download, Copy, ExternalLink, X, Plus, File, Film, Music,
  FileText, MoreVertical, Check, FolderPlus, Eye, Info, Edit2
} from 'lucide-react';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  alt?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  path: string;
  itemCount: number;
}

interface MediaLibraryProps {
  onSelect?: (item: MediaItem) => void;
  onInsert?: (items: MediaItem[]) => void;
  selectionMode?: 'single' | 'multiple' | 'none';
}

// Mock data
const mockFolders: MediaFolder[] = [
  { id: '1', name: 'Images', path: '/images', itemCount: 24 },
  { id: '2', name: 'Videos', path: '/videos', itemCount: 8 },
  { id: '3', name: 'Documents', path: '/documents', itemCount: 15 },
  { id: '4', name: 'Uploads', path: '/uploads', itemCount: 42 },
];

const mockMedia: MediaItem[] = [
  {
    id: '1',
    name: 'hero-banner.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://picsum.photos/seed/hero/1920/1080',
    thumbnailUrl: 'https://picsum.photos/seed/hero/300/200',
    size: 245760,
    width: 1920,
    height: 1080,
    folder: '/images',
    alt: 'Hero banner image',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'product-showcase.png',
    type: 'image',
    mimeType: 'image/png',
    url: 'https://picsum.photos/seed/product/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/product/300/200',
    size: 156000,
    width: 800,
    height: 600,
    folder: '/images',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    name: 'team-photo.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://picsum.photos/seed/team/1200/800',
    thumbnailUrl: 'https://picsum.photos/seed/team/300/200',
    size: 198000,
    width: 1200,
    height: 800,
    folder: '/images',
    alt: 'Our team',
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-13T09:00:00Z'
  },
  {
    id: '4',
    name: 'intro-video.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    url: '/media/intro-video.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video/300/200',
    size: 15728640,
    width: 1920,
    height: 1080,
    duration: 120,
    folder: '/videos',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z'
  },
  {
    id: '5',
    name: 'documentation.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    url: '/media/documentation.pdf',
    size: 524288,
    folder: '/documents',
    createdAt: '2024-01-11T16:00:00Z',
    updatedAt: '2024-01-11T16:00:00Z'
  },
  {
    id: '6',
    name: 'background-music.mp3',
    type: 'audio',
    mimeType: 'audio/mpeg',
    url: '/media/background-music.mp3',
    size: 3145728,
    duration: 180,
    folder: '/uploads',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  }
];

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onSelect,
  onInsert,
  selectionMode = 'none'
}) => {
  const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [folders, setFolders] = useState<MediaFolder[]>(mockFolders);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !currentFolder || item.folder === currentFolder;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFolder && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Film className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (selectionMode === 'single') {
      setSelectedItems(new Set([item.id]));
      onSelect?.(item);
    } else if (selectionMode === 'multiple') {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
      setSelectedItems(newSelected);
    }
  };

  const handleInsert = () => {
    const selectedMedia = media.filter(m => selectedItems.has(m.id));
    onInsert?.(selectedMedia);
  };

  const handleDelete = (itemId: string) => {
    setMedia(media.filter(m => m.id !== itemId));
    selectedItems.delete(itemId);
    setSelectedItems(new Set(selectedItems));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    // Handle file upload
    console.log('Files to upload:', files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const totalSize = media.reduce((acc, item) => acc + item.size, 0);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-purple-400" />
            Media Library
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => console.log('Files:', e.target.files)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { label: 'Total Files', value: media.length, color: 'text-gray-400' },
            { label: 'Images', value: media.filter(m => m.type === 'image').length, color: 'text-purple-400' },
            { label: 'Videos', value: media.filter(m => m.type === 'video').length, color: 'text-blue-400' },
            { label: 'Documents', value: media.filter(m => m.type === 'document').length, color: 'text-green-400' },
            { label: 'Total Size', value: formatFileSize(totalSize), color: 'text-yellow-400' }
          ].map(stat => (
            <div key={stat.label} className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className={`text-lg font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media..."
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>
          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Row */}
      <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setCurrentFolder(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
            !currentFolder ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Folder className="w-4 h-4" />
          All Files
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setCurrentFolder(folder.path)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              currentFolder === folder.path ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            {folder.name}
            <span className="ml-1 text-xs opacity-60">({folder.itemCount})</span>
          </button>
        ))}
      </div>

      {/* Selection Bar */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-purple-900/30 border-b border-purple-800/50 flex items-center justify-between"
          >
            <span className="text-sm text-purple-400">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              {selectionMode === 'multiple' && (
                <button
                  onClick={handleInsert}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Insert Selected
                </button>
              )}
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Grid/List */}
      <div
        className={`flex-1 overflow-auto p-4 ${isDragging ? 'bg-purple-900/10' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20 border-2 border-dashed border-purple-500 rounded-lg z-10">
            <div className="text-center">
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-400 font-medium">Drop files to upload</p>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-purple-500 ${
                  selectedItems.has(item.id) ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => setPreviewItem(item)}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-900 flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      {getTypeIcon(item.type)}
                      <span className="text-xs mt-1">{item.mimeType.split('/')[1]}</span>
                    </div>
                  )}
                </div>

                {/* Selection Checkbox */}
                {selectionMode !== 'none' && (
                  <div className={`absolute top-2 left-2 transition-opacity ${
                    selectedItems.has(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedItems.has(item.id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-gray-900/50 border-gray-400'
                    }`}>
                      {selectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                    className="p-1.5 bg-gray-900/80 text-white rounded hover:bg-gray-800"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                    className="p-1.5 bg-gray-900/80 text-white rounded hover:bg-gray-800"
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-sm text-white truncate" title={item.name}>{item.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                </div>

                {/* Type Badge */}
                <div className="absolute bottom-12 right-2">
                  <span className="px-1.5 py-0.5 bg-gray-900/80 text-gray-300 text-[10px] rounded uppercase">
                    {item.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMedia.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-800 ${
                  selectedItems.has(item.id) ? 'bg-purple-900/30' : ''
                }`}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => setPreviewItem(item)}
              >
                {selectionMode !== 'none' && (
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedItems.has(item.id)
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-gray-800 border-gray-600'
                  }`}>
                    {selectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.thumbnailUrl || item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {getTypeIcon(item.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.type} • {formatFileSize(item.size)}
                    {item.width && item.height && ` • ${item.width}x${item.height}`}
                    {item.duration && ` • ${formatDuration(item.duration)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredMedia.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Image className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No media found</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
            >
              Upload your first file
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-semibold text-white">{previewItem.name}</h3>
                  <p className="text-sm text-gray-500">
                    {previewItem.type} • {formatFileSize(previewItem.size)}
                    {previewItem.width && previewItem.height && ` • ${previewItem.width}x${previewItem.height}`}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-auto">
                {previewItem.type === 'image' ? (
                  <img src={previewItem.url} alt={previewItem.name} className="max-w-full max-h-full mx-auto" />
                ) : previewItem.type === 'video' ? (
                  <video src={previewItem.url} controls className="max-w-full max-h-full mx-auto" />
                ) : previewItem.type === 'audio' ? (
                  <audio src={previewItem.url} controls className="w-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    {getTypeIcon(previewItem.type)}
                    <p className="mt-2">Preview not available</p>
                    <a
                      href={previewItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </a>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(previewItem.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </button>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>
                <button
                  onClick={() => { handleSelect(previewItem); setPreviewItem(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                >
                  <Check className="w-4 h-4" />
                  Select
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLibrary;
