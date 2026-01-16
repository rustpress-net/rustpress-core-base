/**
 * RustPress Document Viewer Component
 * PDF and document preview with navigation and zoom
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  Search,
  X,
  FileText,
  File,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface DocumentViewerProps {
  src: string;
  type?: 'pdf' | 'image' | 'office' | 'auto';
  title?: string;
  initialPage?: number;
  initialZoom?: number;
  showToolbar?: boolean;
  showThumbnails?: boolean;
  showSearch?: boolean;
  enableDownload?: boolean;
  enablePrint?: boolean;
  enableFullscreen?: boolean;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  onDownload?: () => void;
  onPrint?: () => void;
  className?: string;
}

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
}

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  rotation: number;
  showThumbnails: boolean;
  isFullscreen: boolean;
  enableDownload: boolean;
  enablePrint: boolean;
  enableFullscreen: boolean;
  showSearch: boolean;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onRotate: () => void;
  onToggleThumbnails: () => void;
  onToggleFullscreen: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

function Toolbar({
  currentPage,
  totalPages,
  zoom,
  rotation,
  showThumbnails,
  isFullscreen,
  enableDownload,
  enablePrint,
  enableFullscreen,
  showSearch,
  searchQuery,
  onPageChange,
  onZoomChange,
  onRotate,
  onToggleThumbnails,
  onToggleFullscreen,
  onDownload,
  onPrint,
  onSearchChange,
  onSearchSubmit,
}: ToolbarProps) {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const zoomLevels = [50, 75, 100, 125, 150, 200, 300];

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Thumbnails Toggle */}
        <button
          onClick={onToggleThumbnails}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showThumbnails
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
              : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
          )}
          title="Toggle thumbnails"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-sm">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => handlePageInputChange(e.target.value)}
              onBlur={handlePageInputSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handlePageInputSubmit()}
              className="w-12 px-2 py-1 text-center bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded"
            />
            <span className="text-neutral-500">/ {totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onZoomChange(Math.max(25, zoom - 25))}
          disabled={zoom <= 25}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <select
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value))}
          className="px-2 py-1 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded"
        >
          {zoomLevels.map((level) => (
            <option key={level} value={level}>
              {level}%
            </option>
          ))}
        </select>

        <button
          onClick={() => onZoomChange(Math.min(500, zoom + 25))}
          disabled={zoom >= 500}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />

        <button
          onClick={onRotate}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch && (
          <AnimatePresence>
            {showSearchInput ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center gap-1 overflow-hidden"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                  placeholder="Search..."
                  className="w-full px-3 py-1 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearchInput(false)}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </AnimatePresence>
        )}

        {enableDownload && (
          <button
            onClick={onDownload}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {enablePrint && (
          <button
            onClick={onPrint}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {enableFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Thumbnail Sidebar Component
// ============================================================================

interface ThumbnailSidebarProps {
  pages: number[];
  currentPage: number;
  onPageSelect: (page: number) => void;
}

function ThumbnailSidebar({ pages, currentPage, onPageSelect }: ThumbnailSidebarProps) {
  return (
    <div className="w-48 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
      <div className="p-2 space-y-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageSelect(page)}
            className={cn(
              'w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors',
              page === currentPage
                ? 'border-primary-500'
                : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
            )}
          >
            <div className="w-full h-full bg-white dark:bg-neutral-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-neutral-300 dark:text-neutral-600">
                {page}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Document Viewer Component
// ============================================================================

export function DocumentViewer({
  src,
  type = 'auto',
  title,
  initialPage = 1,
  initialZoom = 100,
  showToolbar = true,
  showThumbnails: initialShowThumbnails = false,
  showSearch = true,
  enableDownload = true,
  enablePrint = true,
  enableFullscreen = true,
  onPageChange,
  onZoomChange,
  onDownload,
  onPrint,
  className,
}: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(initialZoom);
  const [rotation, setRotation] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(initialShowThumbnails);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Detect document type
  const documentType = type === 'auto' ? detectDocumentType(src) : type;

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(totalPages, page));
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    },
    [totalPages, onPageChange]
  );

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      setZoom(newZoom);
      onZoomChange?.(newZoom);
    },
    [onZoomChange]
  );

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      const a = document.createElement('a');
      a.href = src;
      a.download = title || 'document';
      a.click();
    }
  }, [src, title, onDownload]);

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  }, [onPrint]);

  const handleSearchSubmit = useCallback(() => {
    // Search implementation would go here
    console.log('Search for:', searchQuery);
  }, [searchQuery]);

  // Simulated page count (in real implementation, this would come from PDF.js)
  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setTotalPages(10); // Simulated
      setIsLoading(false);
    }, 500);
  }, [src]);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col bg-neutral-200 dark:bg-neutral-900 rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Toolbar */}
      {showToolbar && (
        <Toolbar
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          rotation={rotation}
          showThumbnails={showThumbnails}
          isFullscreen={isFullscreen}
          enableDownload={enableDownload}
          enablePrint={enablePrint}
          enableFullscreen={enableFullscreen}
          showSearch={showSearch}
          searchQuery={searchQuery}
          onPageChange={handlePageChange}
          onZoomChange={handleZoomChange}
          onRotate={handleRotate}
          onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
          onToggleFullscreen={handleToggleFullscreen}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails Sidebar */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 192, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ThumbnailSidebar
                pages={pages}
                currentPage={currentPage}
                onPageSelect={handlePageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document View */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading document...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Failed to load document
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
              <button
                onClick={() => window.open(src, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
            </div>
          ) : documentType === 'pdf' ? (
            // PDF Viewer (using iframe as fallback)
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
              }}
            >
              <iframe
                src={`${src}#page=${currentPage}`}
                className="w-[800px] h-[1100px] border-0"
                title={title || 'PDF Document'}
              />
            </div>
          ) : documentType === 'image' ? (
            // Image Viewer
            <img
              src={src}
              alt={title || 'Document'}
              className="max-w-full shadow-lg rounded-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            />
          ) : (
            // Office documents via embed
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`}
                className="w-[900px] h-[600px] border-0"
                title={title || 'Office Document'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Page Navigation Footer (Mobile) */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 lg:hidden">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg bg-white dark:bg-neutral-700 disabled:opacity-50"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg bg-white dark:bg-neutral-700 disabled:opacity-50"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function detectDocumentType(src: string): 'pdf' | 'image' | 'office' {
  const url = src.toLowerCase();

  if (url.endsWith('.pdf') || url.includes('pdf')) {
    return 'pdf';
  }

  if (
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.gif') ||
    url.endsWith('.webp') ||
    url.endsWith('.svg')
  ) {
    return 'image';
  }

  return 'office';
}

// ============================================================================
// Document Card Component
// ============================================================================

export interface DocumentCardProps {
  title: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'image';
  size?: number;
  modifiedAt?: Date;
  thumbnail?: string;
  onClick?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function DocumentCard({
  title,
  type,
  size,
  modifiedAt,
  thumbnail,
  onClick,
  onDownload,
  className,
}: DocumentCardProps) {
  const typeColors: Record<string, string> = {
    pdf: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    doc: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    docx: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    xls: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    xlsx: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    ppt: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    pptx: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    txt: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-800',
    image: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-neutral-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900 overflow-hidden transition-shadow',
        'hover:shadow-md cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={cn('p-4 rounded-lg', typeColors[type])}>
            <FileText className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-medium text-neutral-900 dark:text-white truncate text-sm">
          {title}
        </p>
        <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
          <span className="uppercase">{type}</span>
          {size && <span>{formatSize(size)}</span>}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.();
          }}
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Document List Component
// ============================================================================

export interface DocumentListItem {
  id: string;
  title: string;
  type: string;
  size?: number;
  modifiedAt?: Date;
  url: string;
}

export interface DocumentListProps {
  documents: DocumentListItem[];
  onView?: (doc: DocumentListItem) => void;
  onDownload?: (doc: DocumentListItem) => void;
  className?: string;
}

export function DocumentList({ documents, onView, onDownload, className }: DocumentListProps) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className={cn('rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden', className)}>
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wider">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Modified</div>
      </div>

      {/* Items */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer items-center"
            onClick={() => onView?.(doc)}
          >
            <div className="col-span-6 flex items-center gap-3">
              <FileText className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <span className="text-sm text-neutral-900 dark:text-white truncate">
                {doc.title}
              </span>
            </div>
            <div className="col-span-2 text-sm text-neutral-500 uppercase">
              {doc.type}
            </div>
            <div className="col-span-2 text-sm text-neutral-500">
              {formatSize(doc.size)}
            </div>
            <div className="col-span-2 flex items-center justify-between">
              <span className="text-sm text-neutral-500">{formatDate(doc.modifiedAt)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(doc);
                }}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded opacity-0 group-hover:opacity-100"
              >
                <Download className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentViewer;
