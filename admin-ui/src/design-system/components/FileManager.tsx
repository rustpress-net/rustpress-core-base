/**
 * FileManager Component (20)
 *
 * File attachment manager for posts
 * Features: Document previews, download links, organization, version history
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// Types
export interface FileAttachment {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  extension: string;
  url: string;
  downloadUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  category?: string;
  versions?: FileVersion[];
  metadata?: Record<string, any>;
}

export interface FileVersion {
  id: string;
  version: number;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
  changelog?: string;
}

export interface FileCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface FileManagerConfig {
  maxFileSize: number;
  allowedTypes: string[];
  enableVersioning: boolean;
  enableCategories: boolean;
  enablePreview: boolean;
  showFileInfo: boolean;
}

interface FileManagerContextType {
  files: FileAttachment[];
  selectedFiles: string[];
  categories: FileCategory[];
  viewMode: 'list' | 'grid' | 'compact';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  filterCategory: string | null;
  config: FileManagerConfig;
  addFile: (file: FileAttachment) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileAttachment>) => void;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setViewMode: (mode: 'list' | 'grid' | 'compact') => void;
  setSortBy: (sort: 'name' | 'date' | 'size' | 'type') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;
  reorderFiles: (files: FileAttachment[]) => void;
  downloadFile: (fileId: string) => void;
  downloadSelected: () => void;
  addVersion: (fileId: string, version: FileVersion) => void;
}

const FileManagerContext = createContext<FileManagerContextType | null>(null);

// Provider
interface FileManagerProviderProps {
  children: ReactNode;
  initialFiles?: FileAttachment[];
  config?: Partial<FileManagerConfig>;
  onFilesChange?: (files: FileAttachment[]) => void;
  onDownload?: (file: FileAttachment) => void;
}

const defaultConfig: FileManagerConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['*'],
  enableVersioning: true,
  enableCategories: true,
  enablePreview: true,
  showFileInfo: true,
};

const defaultCategories: FileCategory[] = [
  { id: 'documents', name: 'Documents', icon: '📄', color: '#3B82F6', count: 0 },
  { id: 'spreadsheets', name: 'Spreadsheets', icon: '📊', color: '#10B981', count: 0 },
  { id: 'presentations', name: 'Presentations', icon: '📽️', color: '#F59E0B', count: 0 },
  { id: 'archives', name: 'Archives', icon: '📦', color: '#8B5CF6', count: 0 },
  { id: 'code', name: 'Code', icon: '💻', color: '#EC4899', count: 0 },
  { id: 'other', name: 'Other', icon: '📎', color: '#6B7280', count: 0 },
];

export const FileManagerProvider: React.FC<FileManagerProviderProps> = ({
  children,
  initialFiles = [],
  config: userConfig,
  onFilesChange,
  onDownload,
}) => {
  const [files, setFiles] = useState<FileAttachment[]>(initialFiles);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const config = { ...defaultConfig, ...userConfig };

  // Calculate category counts
  const categories = defaultCategories.map(cat => ({
    ...cat,
    count: files.filter(f => f.category === cat.id).length,
  }));

  const addFile = useCallback((file: FileAttachment) => {
    setFiles(prev => {
      const newFiles = [...prev, file];
      onFilesChange?.(newFiles);
      return newFiles;
    });
  }, [onFilesChange]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      onFilesChange?.(newFiles);
      return newFiles;
    });
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  }, [onFilesChange]);

  const updateFile = useCallback((fileId: string, updates: Partial<FileAttachment>) => {
    setFiles(prev => {
      const newFiles = prev.map(f => f.id === fileId ? { ...f, ...updates } : f);
      onFilesChange?.(newFiles);
      return newFiles;
    });
  }, [onFilesChange]);

  const selectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.includes(fileId) ? prev : [...prev, fileId]);
  }, []);

  const deselectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedFiles(files.map(f => f.id));
  }, [files]);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const reorderFiles = useCallback((newFiles: FileAttachment[]) => {
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  }, [onFilesChange]);

  const downloadFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      onDownload?.(file);
    }
  }, [files, onDownload]);

  const downloadSelected = useCallback(() => {
    selectedFiles.forEach(fileId => downloadFile(fileId));
  }, [selectedFiles, downloadFile]);

  const addVersion = useCallback((fileId: string, version: FileVersion) => {
    setFiles(prev => {
      const newFiles = prev.map(f => {
        if (f.id === fileId) {
          return {
            ...f,
            versions: [...(f.versions || []), version],
          };
        }
        return f;
      });
      onFilesChange?.(newFiles);
      return newFiles;
    });
  }, [onFilesChange]);

  return (
    <FileManagerContext.Provider value={{
      files,
      selectedFiles,
      categories,
      viewMode,
      sortBy,
      sortOrder,
      searchQuery,
      filterCategory,
      config,
      addFile,
      removeFile,
      updateFile,
      selectFile,
      deselectFile,
      selectAll,
      clearSelection,
      setViewMode,
      setSortBy,
      setSortOrder,
      setSearchQuery,
      setFilterCategory,
      reorderFiles,
      downloadFile,
      downloadSelected,
      addVersion,
    }}>
      {children}
    </FileManagerContext.Provider>
  );
};

// Hook
export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within FileManagerProvider');
  }
  return context;
};

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (extension: string): string => {
  const icons: Record<string, string> = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    xls: '📗',
    xlsx: '📗',
    ppt: '📙',
    pptx: '📙',
    txt: '📝',
    csv: '📊',
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    js: '💛',
    ts: '💙',
    py: '🐍',
    json: '📋',
    xml: '📋',
    html: '🌐',
    css: '🎨',
    md: '📝',
  };
  return icons[extension.toLowerCase()] || '📄';
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Sub-components
export const FileToolbar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedFiles, clearSelection, downloadSelected } = useFileManager();

  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
        >
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="size">Size</option>
          <option value="type">Type</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Selection actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.length} selected
            </span>
            <button
              onClick={downloadSelected}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Download
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
        )}

        {/* View mode */}
        <div className="flex bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          {(['list', 'grid', 'compact'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {mode === 'list' ? '☰' : mode === 'grid' ? '⊞' : '▤'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FileCategorySidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { categories, filterCategory, setFilterCategory, files } = useFileManager();

  return (
    <div className={`w-56 p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>

      <div className="space-y-1">
        <button
          onClick={() => setFilterCategory(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            filterCategory === null
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>📁</span>
            <span>All Files</span>
          </span>
          <span className="text-xs text-gray-500">{files.length}</span>
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilterCategory(category.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              filterCategory === category.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </span>
            <span className="text-xs text-gray-500">{category.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const FileCard: React.FC<{
  file: FileAttachment;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDownload: () => void;
  viewMode: 'list' | 'grid' | 'compact';
}> = ({ file, isSelected, onSelect, onRemove, onDownload, viewMode }) => {
  const [showMenu, setShowMenu] = useState(false);

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative p-4 bg-white dark:bg-gray-800 rounded-xl border-2 transition-colors cursor-pointer ${
          isSelected
            ? 'border-blue-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={onSelect}
      >
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            ⋯
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-8 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Download
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <span className="text-4xl">{getFileIcon(file.extension)}</span>
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={onSelect}
      >
        <span>{getFileIcon(file.extension)}</span>
        <span className="flex-1 text-sm truncate text-gray-900 dark:text-white">
          {file.name}
        </span>
        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          ↓
        </button>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 transition-colors ${
        isSelected
          ? 'border-blue-500'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 rounded border-gray-300"
      />

      <span className="text-2xl">{getFileIcon(file.extension)}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {file.extension.toUpperCase()} • {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
        </p>
      </div>

      {file.versions && file.versions.length > 0 && (
        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
          v{file.versions.length + 1}
        </span>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={onDownload}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Download"
        >
          ⬇️
        </button>
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
          title="Remove"
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
};

export const FileList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const {
    files,
    selectedFiles,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    filterCategory,
    selectFile,
    deselectFile,
    removeFile,
    downloadFile,
    reorderFiles,
  } = useFileManager();

  // Filter and sort files
  let filteredFiles = [...files];

  // Apply search
  if (searchQuery) {
    filteredFiles = filteredFiles.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply category filter
  if (filterCategory) {
    filteredFiles = filteredFiles.filter(f => f.category === filterCategory);
  }

  // Apply sort
  filteredFiles.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = a.extension.localeCompare(b.extension);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (filteredFiles.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <span className="text-4xl mb-4">📂</span>
        <p className="text-gray-600 dark:text-gray-400 text-lg">No files found</p>
        <p className="text-gray-500 text-sm mt-1">
          {searchQuery ? 'Try a different search term' : 'Upload files to get started'}
        </p>
      </div>
    );
  }

  const toggleSelect = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      deselectFile(fileId);
    } else {
      selectFile(fileId);
    }
  };

  return (
    <div className={`p-4 ${className}`}>
      <Reorder.Group
        axis="y"
        values={filteredFiles}
        onReorder={reorderFiles}
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-2'
        }
      >
        <AnimatePresence>
          {filteredFiles.map((file) => (
            <Reorder.Item key={file.id} value={file}>
              <FileCard
                file={file}
                isSelected={selectedFiles.includes(file.id)}
                onSelect={() => toggleSelect(file.id)}
                onRemove={() => removeFile(file.id)}
                onDownload={() => downloadFile(file.id)}
                viewMode={viewMode}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};

export const FileUploadArea: React.FC<{
  className?: string;
  onFilesAdded?: (files: File[]) => void;
}> = ({ className = '', onFilesAdded }) => {
  const { config, addFile } = useFileManager();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, []);

  const processFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(f => f.size <= config.maxFileSize);

    validFiles.forEach(file => {
      const ext = file.name.split('.').pop() || '';
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type.split('/')[0] || 'file',
        mimeType: file.type,
        extension: ext,
        url: URL.createObjectURL(file),
        downloadUrl: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadedBy: 'Current User',
        category: getCategoryForFile(ext),
      };
      addFile(attachment);
    });

    onFilesAdded?.(validFiles);
  };

  const getCategoryForFile = (ext: string): string => {
    const categoryMap: Record<string, string> = {
      pdf: 'documents', doc: 'documents', docx: 'documents', txt: 'documents',
      xls: 'spreadsheets', xlsx: 'spreadsheets', csv: 'spreadsheets',
      ppt: 'presentations', pptx: 'presentations',
      zip: 'archives', rar: 'archives', '7z': 'archives', tar: 'archives', gz: 'archives',
      js: 'code', ts: 'code', py: 'code', json: 'code', html: 'code', css: 'code', md: 'code',
    };
    return categoryMap[ext.toLowerCase()] || 'other';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative p-8 border-2 border-dashed rounded-xl transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      } ${className}`}
    >
      <div className="text-center">
        <span className="text-4xl">📎</span>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Drag and drop files here, or{' '}
          <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
            browse
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Max file size: {formatFileSize(config.maxFileSize)}
        </p>
      </div>
    </div>
  );
};

export const FileVersionHistory: React.FC<{
  file: FileAttachment;
  className?: string;
}> = ({ file, className = '' }) => {
  if (!file.versions || file.versions.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No version history available
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Version History
      </h4>

      {/* Current version */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
          Current
        </span>
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-white">
            v{(file.versions?.length || 0) + 1}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(file.uploadedAt)} by {file.uploadedBy}
          </p>
        </div>
        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
      </div>

      {/* Previous versions */}
      {file.versions.slice().reverse().map((version, index) => (
        <div
          key={version.id}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded">
            v{file.versions!.length - index}
          </span>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">
              {version.changelog || `Version ${file.versions!.length - index}`}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(version.uploadedAt)} by {version.uploadedBy}
            </p>
          </div>
          <span className="text-xs text-gray-500">{formatFileSize(version.size)}</span>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Download this version"
          >
            ⬇️
          </button>
        </div>
      ))}
    </div>
  );
};

export const FileInfoPanel: React.FC<{
  file: FileAttachment;
  onClose: () => void;
  className?: string;
}> = ({ file, onClose, className = '' }) => {
  const { updateFile, config } = useFileManager();
  const [description, setDescription] = useState(file.description || '');
  const [showVersions, setShowVersions] = useState(false);

  const handleSaveDescription = () => {
    updateFile(file.id, { description });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`w-80 p-4 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          File Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          ✕
        </button>
      </div>

      <div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4">
        <span className="text-5xl">{getFileIcon(file.extension)}</span>
        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
          {file.name}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Type</label>
          <p className="text-sm text-gray-900 dark:text-white">
            {file.extension.toUpperCase()} File ({file.mimeType})
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Size</label>
          <p className="text-sm text-gray-900 dark:text-white">{formatFileSize(file.size)}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Uploaded</label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatDate(file.uploadedAt)} by {file.uploadedBy}
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSaveDescription}
            placeholder="Add a description..."
            className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
            rows={3}
          />
        </div>

        {config.enableVersioning && (
          <div>
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Version History
              </span>
              <span className="text-xs text-gray-500">
                {(file.versions?.length || 0) + 1} versions
              </span>
            </button>

            {showVersions && (
              <FileVersionHistory file={file} className="mt-2" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const QuickAttachButton: React.FC<{
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}> = ({ className = '', variant = 'secondary' }) => {
  const { files } = useFileManager();

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
  };

  return (
    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${variants[variant]} ${className}`}>
      <span>📎</span>
      <span>Attach Files</span>
      {files.length > 0 && (
        <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
          {files.length}
        </span>
      )}
      <input type="file" multiple className="hidden" />
    </label>
  );
};

// Main Component
export const FileManager: React.FC<{
  initialFiles?: FileAttachment[];
  config?: Partial<FileManagerConfig>;
  onFilesChange?: (files: FileAttachment[]) => void;
  onDownload?: (file: FileAttachment) => void;
  showSidebar?: boolean;
  className?: string;
}> = ({
  initialFiles,
  config,
  onFilesChange,
  onDownload,
  showSidebar = true,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);

  return (
    <FileManagerProvider
      initialFiles={initialFiles}
      config={config}
      onFilesChange={onFilesChange}
      onDownload={onDownload}
    >
      <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <FileToolbar />

        <div className="flex flex-1 overflow-hidden">
          {showSidebar && <FileCategorySidebar />}

          <div className="flex-1 overflow-auto">
            <FileUploadArea className="m-4" />
            <FileList />
          </div>

          <AnimatePresence>
            {selectedFile && (
              <FileInfoPanel
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </FileManagerProvider>
  );
};

export default FileManager;
