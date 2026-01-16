/**
 * RustPress Media Library Component
 * File browser with upload, filtering, and multi-select
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Grid,
  List,
  Search,
  Filter,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Trash2,
  Download,
  Edit3,
  Copy,
  Move,
  Info,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Plus,
  SortAsc,
  SortDesc,
  Calendar,
  HardDrive,
  Eye,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other';

export interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  folderId?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  alt?: string;
  caption?: string;
  metadata?: Record<string, unknown>;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  itemCount?: number;
}

export interface MediaLibraryProps {
  files: MediaFile[];
  folders?: MediaFolder[];
  currentFolderId?: string;
  selectedIds?: string[];
  viewMode?: 'grid' | 'list';
  sortBy?: 'name' | 'date' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
  filterType?: MediaType | 'all';
  searchQuery?: string;
  enableUpload?: boolean;
  enableFolders?: boolean;
  enableMultiSelect?: boolean;
  enablePreview?: boolean;
  acceptedTypes?: string[];
  maxFileSize?: number;
  onSelect?: (ids: string[]) => void;
  onFileClick?: (file: MediaFile) => void;
  onFileDoubleClick?: (file: MediaFile) => void;
  onFolderClick?: (folder: MediaFolder) => void;
  onUpload?: (files: File[]) => void;
  onDelete?: (ids: string[]) => void;
  onRename?: (id: string, newName: string) => void;
  onMove?: (ids: string[], targetFolderId: string) => void;
  onCreateFolder?: (name: string, parentId?: string) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (type: MediaType | 'all') => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getFileIcon(type: MediaType) {
  switch (type) {
    case 'image':
      return FileImage;
    case 'video':
      return FileVideo;
    case 'audio':
      return FileAudio;
    case 'document':
      return FileText;
    case 'archive':
      return FileArchive;
    case 'code':
      return FileCode;
    default:
      return File;
  }
}

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return 'code';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  filterType: MediaType | 'all';
  onFilterChange: (type: MediaType | 'all') => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  selectedCount: number;
  onDeleteSelected?: () => void;
  onUpload?: () => void;
  enableUpload?: boolean;
}

function Toolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearch,
  filterType,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  selectedCount,
  onDeleteSelected,
  onUpload,
  enableUpload,
}: ToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions: { value: MediaType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Files' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Documents' },
    { value: 'archive', label: 'Archives' },
    { value: 'code', label: 'Code' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { value: 'size', label: 'Size' },
    { value: 'type', label: 'Type' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search files..."
          className={cn(
            'w-full pl-9 pr-4 py-2 text-sm rounded-lg border',
            'bg-white dark:bg-neutral-800',
            'border-neutral-300 dark:border-neutral-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
          showFilters
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600'
            : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
        )}
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Sort */}
      <div className="flex items-center gap-1">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, sortOrder)}
          className={cn(
            'px-3 py-2 text-sm rounded-lg border',
            'bg-white dark:bg-neutral-800',
            'border-neutral-300 dark:border-neutral-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'p-2 rounded transition-colors',
            viewMode === 'grid'
              ? 'bg-white dark:bg-neutral-700 shadow-sm'
              : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
          )}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'p-2 rounded transition-colors',
            viewMode === 'list'
              ? 'bg-white dark:bg-neutral-700 shadow-sm'
              : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
          )}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 pl-3 border-l border-neutral-300 dark:border-neutral-600">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {selectedCount} selected
          </span>
          <button
            onClick={onDeleteSelected}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      {enableUpload && (
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-neutral-200 dark:border-neutral-700">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full transition-colors',
                    filterType === option.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// File Grid Item Component
// ============================================================================

interface FileGridItemProps {
  file: MediaFile;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDoubleClick?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
}

function FileGridItem({
  file,
  selected,
  onSelect,
  onClick,
  onDoubleClick,
  onDelete,
  onRename,
}: FileGridItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const FileIcon = getFileIcon(file.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative group rounded-lg overflow-hidden border transition-all cursor-pointer',
        selected
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Selection Checkbox */}
      <div
        className={cn(
          'absolute top-2 left-2 z-10 transition-opacity',
          selected || 'opacity-0 group-hover:opacity-100'
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            selected
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'bg-white/80 border-neutral-300 hover:border-primary-500'
          )}
        >
          {selected && <Check className="w-3 h-3" />}
        </button>
      </div>

      {/* Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 bg-white/80 dark:bg-neutral-800/80 rounded hover:bg-white dark:hover:bg-neutral-800"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename?.();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Copy URL
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Download
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        {file.type === 'image' && file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileIcon className="w-12 h-12 text-neutral-400" />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {formatFileSize(file.size)}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// File List Item Component
// ============================================================================

interface FileListItemProps {
  file: MediaFile;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDoubleClick?: () => void;
  onDelete?: () => void;
}

function FileListItem({
  file,
  selected,
  onSelect,
  onClick,
  onDoubleClick,
  onDelete,
}: FileListItemProps) {
  const FileIcon = getFileIcon(file.type);

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700',
        'cursor-pointer transition-colors',
        selected
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          selected
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500'
        )}
      >
        {selected && <Check className="w-3 h-3" />}
      </button>

      {/* Thumbnail/Icon */}
      <div className="w-10 h-10 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
        {file.type === 'image' && file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <FileIcon className="w-5 h-5 text-neutral-400" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {file.mimeType}
        </p>
      </div>

      {/* Size */}
      <div className="text-sm text-neutral-500 w-24 text-right">
        {formatFileSize(file.size)}
      </div>

      {/* Date */}
      <div className="text-sm text-neutral-500 w-32 text-right">
        {formatDate(file.updatedAt)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Preview
          }}
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Download
          }}
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="p-2 text-neutral-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Folder Item Component
// ============================================================================

interface FolderItemProps {
  folder: MediaFolder;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

function FolderItem({ folder, viewMode, onClick }: FolderItemProps) {
  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-4 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
        onClick={onClick}
      >
        <div className="w-5 h-5" /> {/* Placeholder for checkbox alignment */}
        <div className="w-10 h-10 flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 rounded flex items-center justify-center">
          <Folder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {folder.name}
          </p>
          <p className="text-xs text-neutral-500">
            {folder.itemCount ?? 0} items
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400" />
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer transition-colors overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-square bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
        <Folder className="w-16 h-16 text-primary-500" />
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {folder.name}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {folder.itemCount ?? 0} items
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Upload Dropzone Component
// ============================================================================

interface UploadDropzoneProps {
  onUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

export function UploadDropzone({
  onUpload,
  acceptedTypes,
  maxFileSize,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    onUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpload(files);
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
      <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
        Drag and drop files here
      </p>
      <p className="text-sm text-neutral-500 mb-4">
        or click to browse
      </p>
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
        <Plus className="w-4 h-4" />
        Select Files
        <input
          type="file"
          multiple
          accept={acceptedTypes?.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
      {maxFileSize && (
        <p className="text-xs text-neutral-400 mt-4">
          Max file size: {formatFileSize(maxFileSize)}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

interface BreadcrumbProps {
  folders: MediaFolder[];
  currentFolderId?: string;
  onNavigate: (folderId?: string) => void;
}

function Breadcrumb({ folders, currentFolderId, onNavigate }: BreadcrumbProps) {
  const getBreadcrumbPath = (): MediaFolder[] => {
    if (!currentFolderId) return [];

    const path: MediaFolder[] = [];
    let current = folders.find((f) => f.id === currentFolderId);

    while (current) {
      path.unshift(current);
      current = current.parentId ? folders.find((f) => f.id === current!.parentId) : undefined;
    }

    return path;
  };

  const path = getBreadcrumbPath();

  return (
    <div className="flex items-center gap-1 px-4 py-2 text-sm border-b border-neutral-200 dark:border-neutral-700">
      <button
        onClick={() => onNavigate(undefined)}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800',
          !currentFolderId && 'font-medium text-primary-600'
        )}
      >
        <HardDrive className="w-4 h-4" />
        All Files
      </button>

      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={cn(
              'px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800',
              index === path.length - 1 && 'font-medium text-primary-600'
            )}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================================
// Main Media Library Component
// ============================================================================

export function MediaLibrary({
  files,
  folders = [],
  currentFolderId,
  selectedIds = [],
  viewMode: initialViewMode = 'grid',
  sortBy: initialSortBy = 'date',
  sortOrder: initialSortOrder = 'desc',
  filterType: initialFilterType = 'all',
  searchQuery: initialSearchQuery = '',
  enableUpload = true,
  enableFolders = true,
  enableMultiSelect = true,
  enablePreview = true,
  acceptedTypes,
  maxFileSize,
  onSelect,
  onFileClick,
  onFileDoubleClick,
  onFolderClick,
  onUpload,
  onDelete,
  onRename,
  onMove,
  onCreateFolder,
  onSearch,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  className,
}: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [filterType, setFilterType] = useState(initialFilterType);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = files;

    // Filter by folder
    if (enableFolders) {
      result = result.filter((f) => f.folderId === currentFolderId);
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((f) => f.type === filterType);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(query));
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [files, filterType, searchQuery, sortBy, sortOrder, currentFolderId, enableFolders]);

  // Filter folders for current level
  const currentFolders = useMemo(() => {
    if (!enableFolders) return [];
    return folders.filter((f) => f.parentId === currentFolderId);
  }, [folders, currentFolderId, enableFolders]);

  const handleSelect = (fileId: string) => {
    if (!enableMultiSelect) {
      onSelect?.([fileId]);
      return;
    }

    const newSelected = selectedIds.includes(fileId)
      ? selectedIds.filter((id) => id !== fileId)
      : [...selectedIds, fileId];
    onSelect?.(newSelected);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy as typeof sortBy);
    setSortOrder(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  };

  const handleFilterChange = (type: MediaType | 'all') => {
    setFilterType(type);
    onFilterChange?.(type);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFolderNavigate = (folderId?: string) => {
    const folder = folderId ? folders.find((f) => f.id === folderId) : undefined;
    if (folder) {
      onFolderClick?.(folder);
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        className
      )}
    >
      {/* Toolbar */}
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        selectedCount={selectedIds.length}
        onDeleteSelected={() => onDelete?.(selectedIds)}
        onUpload={() => setShowUploadModal(true)}
        enableUpload={enableUpload}
      />

      {/* Breadcrumb */}
      {enableFolders && (
        <Breadcrumb
          folders={folders}
          currentFolderId={currentFolderId}
          onNavigate={handleFolderNavigate}
        />
      )}

      {/* Content */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Folders */}
            {currentFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                onClick={() => onFolderClick?.(folder)}
              />
            ))}

            {/* Files */}
            {filteredFiles.map((file) => (
              <FileGridItem
                key={file.id}
                file={file}
                selected={selectedIds.includes(file.id)}
                onSelect={() => handleSelect(file.id)}
                onClick={() => onFileClick?.(file)}
                onDoubleClick={() => onFileDoubleClick?.(file)}
                onDelete={() => onDelete?.([file.id])}
                onRename={() => {
                  const newName = prompt('Enter new name:', file.name);
                  if (newName) onRename?.(file.id, newName);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            {/* List Header */}
            <div className="flex items-center gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <div className="w-5" />
              <div className="w-10" />
              <div className="flex-1">Name</div>
              <div className="w-24 text-right">Size</div>
              <div className="w-32 text-right">Modified</div>
              <div className="w-24" />
            </div>

            {/* Folders */}
            {currentFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                onClick={() => onFolderClick?.(folder)}
              />
            ))}

            {/* Files */}
            {filteredFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                selected={selectedIds.includes(file.id)}
                onSelect={() => handleSelect(file.id)}
                onClick={() => onFileClick?.(file)}
                onDoubleClick={() => onFileDoubleClick?.(file)}
                onDelete={() => onDelete?.([file.id])}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredFiles.length === 0 && currentFolders.length === 0 && (
          <div className="py-12 text-center">
            <File className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              {searchQuery ? 'No files match your search' : 'No files in this folder'}
            </p>
            {enableUpload && !searchQuery && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-primary-600 hover:text-primary-700"
              >
                Upload files
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Upload Files
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <UploadDropzone
                  onUpload={(files) => {
                    onUpload?.(files);
                    setShowUploadModal(false);
                  }}
                  acceptedTypes={acceptedTypes}
                  maxFileSize={maxFileSize}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Compact File Picker Component
// ============================================================================

export interface FilePickerProps {
  files: MediaFile[];
  selectedId?: string;
  filterType?: MediaType | 'all';
  onSelect: (file: MediaFile) => void;
  onUpload?: (files: File[]) => void;
  enableUpload?: boolean;
  className?: string;
}

export function FilePicker({
  files,
  selectedId,
  filterType = 'all',
  onSelect,
  onUpload,
  enableUpload = true,
  className,
}: FilePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    let result = files;
    if (filterType !== 'all') {
      result = result.filter((f) => f.type === filterType);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(query));
    }
    return result;
  }, [files, filterType, searchQuery]);

  return (
    <div className={cn('bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700', className)}>
      {/* Search */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className={cn(
              'w-full pl-9 pr-4 py-2 text-sm rounded-lg border',
              'bg-neutral-50 dark:bg-neutral-800',
              'border-neutral-200 dark:border-neutral-700',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 max-h-64 overflow-y-auto">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.type);
          return (
            <button
              key={file.id}
              onClick={() => onSelect(file)}
              className={cn(
                'aspect-square rounded-lg border overflow-hidden transition-all',
                selectedId === file.id
                  ? 'border-primary-500 ring-2 ring-primary-500/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
              )}
            >
              {file.type === 'image' && file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-neutral-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Upload */}
      {enableUpload && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Upload className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Upload new file</span>
            <input
              type="file"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onUpload?.(files);
              }}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;
