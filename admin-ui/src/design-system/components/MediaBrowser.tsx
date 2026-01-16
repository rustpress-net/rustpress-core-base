import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// MEDIA BROWSER - Component 11
// Enhanced media browser for post editor with selection, filtering, and preview
// ============================================================================

// Types
export interface BrowserMediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive';
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
  alt?: string;
  caption?: string;
  uploadedAt: Date;
  uploadedBy: string;
  tags: string[];
  folder?: string;
  favorite?: boolean;
}

export interface MediaBrowserConfig {
  allowMultiple?: boolean;
  allowedTypes?: BrowserMediaItem['type'][];
  maxSelection?: number;
  showFolders?: boolean;
  showDetails?: boolean;
  defaultView?: 'grid' | 'list';
  gridColumns?: number;
}

interface MediaBrowserContextType {
  items: BrowserMediaItem[];
  selectedItems: string[];
  config: MediaBrowserConfig;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  typeFilter: BrowserMediaItem['type'] | 'all';
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
  previewItem: BrowserMediaItem | null;
  setItems: (items: BrowserMediaItem[]) => void;
  selectItem: (id: string, multi?: boolean) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  toggleFavorite: (id: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: BrowserMediaItem['type'] | 'all') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'size') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPreviewItem: (item: BrowserMediaItem | null) => void;
  getFilteredItems: () => BrowserMediaItem[];
  getSelectedMediaItems: () => BrowserMediaItem[];
}

const MediaBrowserContext = createContext<MediaBrowserContextType | null>(null);

export const useMediaBrowser = () => {
  const context = useContext(MediaBrowserContext);
  if (!context) {
    throw new Error('useMediaBrowser must be used within MediaBrowserProvider');
  }
  return context;
};

// Sample data
const sampleItems: BrowserMediaItem[] = [
  {
    id: '1',
    name: 'hero-image.jpg',
    type: 'image',
    url: '/media/hero-image.jpg',
    thumbnailUrl: '/media/thumbnails/hero-image.jpg',
    size: 245000,
    dimensions: { width: 1920, height: 1080 },
    mimeType: 'image/jpeg',
    alt: 'Hero banner',
    uploadedAt: new Date('2024-01-15'),
    uploadedBy: 'Admin',
    tags: ['hero', 'banner'],
    favorite: true,
  },
  {
    id: '2',
    name: 'product-photo.png',
    type: 'image',
    url: '/media/product.png',
    thumbnailUrl: '/media/thumbnails/product.png',
    size: 189000,
    dimensions: { width: 800, height: 600 },
    mimeType: 'image/png',
    alt: 'Product',
    uploadedAt: new Date('2024-01-20'),
    uploadedBy: 'Editor',
    tags: ['product'],
  },
  {
    id: '3',
    name: 'background-pattern.svg',
    type: 'image',
    url: '/media/pattern.svg',
    size: 12000,
    mimeType: 'image/svg+xml',
    uploadedAt: new Date('2024-01-22'),
    uploadedBy: 'Designer',
    tags: ['pattern', 'background'],
  },
  {
    id: '4',
    name: 'promo-video.mp4',
    type: 'video',
    url: '/media/promo.mp4',
    thumbnailUrl: '/media/thumbnails/promo.jpg',
    size: 15000000,
    dimensions: { width: 1920, height: 1080 },
    duration: 120,
    mimeType: 'video/mp4',
    uploadedAt: new Date('2024-01-25'),
    uploadedBy: 'Admin',
    tags: ['promo', 'video'],
  },
  {
    id: '5',
    name: 'podcast-ep1.mp3',
    type: 'audio',
    url: '/media/podcast1.mp3',
    size: 8500000,
    duration: 1800,
    mimeType: 'audio/mpeg',
    uploadedAt: new Date('2024-02-01'),
    uploadedBy: 'Podcaster',
    tags: ['podcast'],
  },
  {
    id: '6',
    name: 'whitepaper.pdf',
    type: 'document',
    url: '/media/whitepaper.pdf',
    size: 2500000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-02-10'),
    uploadedBy: 'Marketing',
    tags: ['document', 'whitepaper'],
  },
];

const defaultConfig: MediaBrowserConfig = {
  allowMultiple: false,
  allowedTypes: ['image', 'video', 'audio', 'document', 'archive'],
  maxSelection: 1,
  showFolders: true,
  showDetails: true,
  defaultView: 'grid',
  gridColumns: 4,
};

// Provider
export interface MediaBrowserProviderProps {
  children: React.ReactNode;
  initialItems?: BrowserMediaItem[];
  config?: Partial<MediaBrowserConfig>;
  onSelectionChange?: (items: BrowserMediaItem[]) => void;
}

export const MediaBrowserProvider: React.FC<MediaBrowserProviderProps> = ({
  children,
  initialItems = sampleItems,
  config: userConfig = {},
  onSelectionChange,
}) => {
  const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);
  const [items, setItems] = useState<BrowserMediaItem[]>(initialItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(config.defaultView || 'grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<BrowserMediaItem['type'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [previewItem, setPreviewItem] = useState<BrowserMediaItem | null>(null);

  const selectItem = useCallback((id: string, multi = false) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Check if type is allowed
    if (config.allowedTypes && !config.allowedTypes.includes(item.type)) {
      return;
    }

    setSelectedItems(prev => {
      if (config.allowMultiple || multi) {
        if (prev.includes(id)) {
          return prev.filter(i => i !== id);
        }
        if (config.maxSelection && prev.length >= config.maxSelection) {
          return prev;
        }
        return [...prev, id];
      }
      return [id];
    });
  }, [items, config]);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(i => i !== id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  }, []);

  const getFilteredItems = useCallback(() => {
    let filtered = [...items];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Filter by allowed types
    if (config.allowedTypes) {
      filtered = filtered.filter(item => config.allowedTypes!.includes(item.type));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, typeFilter, searchQuery, sortBy, sortOrder, config.allowedTypes]);

  const getSelectedMediaItems = useCallback(() => {
    return items.filter(item => selectedItems.includes(item.id));
  }, [items, selectedItems]);

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(getSelectedMediaItems());
    }
  }, [selectedItems, getSelectedMediaItems, onSelectionChange]);

  const value: MediaBrowserContextType = {
    items,
    selectedItems,
    config,
    viewMode,
    searchQuery,
    typeFilter,
    sortBy,
    sortOrder,
    previewItem,
    setItems,
    selectItem,
    deselectItem,
    clearSelection,
    toggleFavorite,
    setViewMode,
    setSearchQuery,
    setTypeFilter,
    setSortBy,
    setSortOrder,
    setPreviewItem,
    getFilteredItems,
    getSelectedMediaItems,
  };

  return (
    <MediaBrowserContext.Provider value={value}>
      {children}
    </MediaBrowserContext.Provider>
  );
};

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getTypeColor = (type: BrowserMediaItem['type']): string => {
  const colors: Record<BrowserMediaItem['type'], string> = {
    image: '#10b981',
    video: '#8b5cf6',
    audio: '#f59e0b',
    document: '#3b82f6',
    archive: '#6b7280',
  };
  return colors[type];
};

// Media Type Icon
const MediaTypeIcon: React.FC<{ type: BrowserMediaItem['type']; size?: number }> = ({
  type,
  size = 24,
}) => {
  const icons: Record<BrowserMediaItem['type'], React.ReactNode> = {
    image: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
    video: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23,7 16,12 23,17 23,7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    audio: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    document: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    archive: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="21,8 21,21 3,21 3,8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
  };

  return <span style={{ color: getTypeColor(type) }}>{icons[type]}</span>;
};

// Browser Toolbar
export const BrowserToolbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    selectedItems,
    clearSelection,
  } = useMediaBrowser();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fff',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as BrowserMediaItem['type'] | 'all')}
          style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="document">Documents</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newOrder] = e.target.value.split('-');
            setSortBy(newSortBy as 'name' | 'date' | 'size');
            setSortOrder(newOrder as 'asc' | 'desc');
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
          <option value="name-asc">A-Z</option>
          <option value="name-desc">Z-A</option>
          <option value="size-desc">Largest</option>
          <option value="size-asc">Smallest</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {selectedItems.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {selectedItems.length} selected
            </span>
            <button
              onClick={clearSelection}
              style={{
                padding: '6px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                backgroundColor: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* View Toggle */}
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 10px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#f3f4f6' : '#fff',
              cursor: 'pointer',
              borderRadius: '5px 0 0 5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? '#3b82f6' : '#6b7280'} strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderLeft: '1px solid #e5e7eb',
              backgroundColor: viewMode === 'list' ? '#f3f4f6' : '#fff',
              cursor: 'pointer',
              borderRadius: '0 5px 5px 0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'list' ? '#3b82f6' : '#6b7280'} strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Grid Item
const BrowserGridItem: React.FC<{ item: BrowserMediaItem }> = ({ item }) => {
  const { selectedItems, selectItem, toggleFavorite, setPreviewItem } = useMediaBrowser();
  const isSelected = selectedItems.includes(item.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      onClick={(e) => selectItem(item.id, e.ctrlKey || e.metaKey)}
      onDoubleClick={() => setPreviewItem(item)}
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        border: isSelected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        backgroundColor: '#fff',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          background: item.type === 'image'
            ? `linear-gradient(135deg, ${getTypeColor(item.type)}15, ${getTypeColor(item.type)}30)`
            : '#f9fafb',
        }}
      >
        <MediaTypeIcon type={item.type} size={40} />
      </div>

      {/* Selection Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          backgroundColor: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.9)',
          border: isSelected ? 'none' : '2px solid #d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.9)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={item.favorite ? '#f59e0b' : 'none'}
          stroke={item.favorite ? '#f59e0b' : '#9ca3af'}
          strokeWidth="2"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      </button>

      {/* Type Badge */}
      {item.duration && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '8px',
            padding: '2px 6px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#fff',
          }}
        >
          {formatDuration(item.duration)}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '10px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#1f2937',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          {formatFileSize(item.size)}
          {item.dimensions && ` • ${item.dimensions.width}×${item.dimensions.height}`}
        </div>
      </div>
    </motion.div>
  );
};

// List Item
const BrowserListItem: React.FC<{ item: BrowserMediaItem }> = ({ item }) => {
  const { selectedItems, selectItem, toggleFavorite, setPreviewItem } = useMediaBrowser();
  const isSelected = selectedItems.includes(item.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={(e) => selectItem(item.id, e.ctrlKey || e.metaKey)}
      onDoubleClick={() => setPreviewItem(item)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        backgroundColor: isSelected ? '#eff6ff' : '#fff',
        borderBottom: '1px solid #f3f4f6',
        cursor: 'pointer',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          backgroundColor: isSelected ? '#3b82f6' : '#fff',
          border: isSelected ? 'none' : '2px solid #d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          backgroundColor: `${getTypeColor(item.type)}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MediaTypeIcon type={item.type} size={18} />
      </div>

      {/* Name & Tags */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#1f2937',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </div>
        {item.tags.length > 0 && (
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>
            {item.tags.slice(0, 3).join(', ')}
          </div>
        )}
      </div>

      {/* Size */}
      <div style={{ width: '70px', fontSize: '13px', color: '#6b7280', textAlign: 'right' }}>
        {formatFileSize(item.size)}
      </div>

      {/* Date */}
      <div style={{ width: '90px', fontSize: '13px', color: '#6b7280', textAlign: 'right' }}>
        {item.uploadedAt.toLocaleDateString()}
      </div>

      {/* Favorite */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
        style={{
          width: '28px',
          height: '28px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={item.favorite ? '#f59e0b' : 'none'}
          stroke={item.favorite ? '#f59e0b' : '#d1d5db'}
          strokeWidth="2"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      </button>
    </motion.div>
  );
};

// Media Grid/List
export const BrowserGrid: React.FC = () => {
  const { getFilteredItems, viewMode, config } = useMediaBrowser();
  const items = getFilteredItems();

  if (items.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          color: '#6b7280',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <p style={{ marginTop: '12px', fontSize: '14px' }}>No media found</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AnimatePresence>
          {items.map(item => (
            <BrowserListItem key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: `repeat(${config.gridColumns || 4}, 1fr)`,
        gap: '16px',
        alignContent: 'start',
      }}
    >
      <AnimatePresence>
        {items.map(item => (
          <BrowserGridItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Preview Modal
export const BrowserPreviewModal: React.FC = () => {
  const { previewItem, setPreviewItem, selectItem, selectedItems } = useMediaBrowser();
  const isSelected = previewItem ? selectedItems.includes(previewItem.id) : false;

  if (!previewItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setPreviewItem(null)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MediaTypeIcon type={previewItem.type} size={24} />
            <div>
              <div style={{ fontWeight: 600, color: '#1f2937' }}>{previewItem.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {formatFileSize(previewItem.size)}
                {previewItem.dimensions && ` • ${previewItem.dimensions.width}×${previewItem.dimensions.height}`}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPreviewItem(null)}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: '#f9fafb',
            minHeight: '300px',
          }}
        >
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '12px',
              backgroundColor: `${getTypeColor(previewItem.type)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MediaTypeIcon type={previewItem.type} size={80} />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => setPreviewItem(null)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              selectItem(previewItem.id);
              setPreviewItem(null);
            }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: isSelected ? '#dc2626' : '#3b82f6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {isSelected ? 'Deselect' : 'Select'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Selection Summary
export const SelectionSummary: React.FC<{ onInsert?: (items: BrowserMediaItem[]) => void }> = ({
  onInsert,
}) => {
  const { getSelectedMediaItems, clearSelection } = useMediaBrowser();
  const selectedMedia = getSelectedMediaItems();

  if (selectedMedia.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#374151' }}>
          {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={clearSelection}
          style={{
            padding: '4px 8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6b7280',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Clear
        </button>
      </div>

      {onInsert && (
        <button
          onClick={() => onInsert(selectedMedia)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Insert Media
        </button>
      )}
    </div>
  );
};

// Quick Insert Button (for toolbar)
export const QuickInsertButton: React.FC<{
  onClick?: () => void;
  label?: string;
}> = ({ onClick, label = 'Add Media' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        border: '1px dashed #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#fff',
        fontSize: '14px',
        color: '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.color = '#3b82f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.color = '#6b7280';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
      {label}
    </button>
  );
};

// Main Media Browser Component
export const MediaBrowser: React.FC<{
  onInsert?: (items: BrowserMediaItem[]) => void;
  showToolbar?: boolean;
}> = ({ onInsert, showToolbar = true }) => {
  const { previewItem } = useMediaBrowser();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    >
      {showToolbar && <BrowserToolbar />}
      <BrowserGrid />
      <SelectionSummary onInsert={onInsert} />
      <AnimatePresence>
        {previewItem && <BrowserPreviewModal />}
      </AnimatePresence>
    </div>
  );
};

export default MediaBrowser;
