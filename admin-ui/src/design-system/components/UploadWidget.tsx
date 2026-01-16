import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// UPLOAD WIDGET - Component 13
// Drag & drop file upload with progress tracking, previews, and validation
// ============================================================================

// Types
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  previewUrl?: string;
  uploadedUrl?: string;
}

export interface UploadWidgetConfig {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  showPreviews?: boolean;
  autoUpload?: boolean;
  simultaneousUploads?: number;
  chunkSize?: number;
}

interface UploadWidgetContextType {
  files: UploadFile[];
  config: UploadWidgetConfig;
  isDragging: boolean;
  isUploading: boolean;
  totalProgress: number;
  addFiles: (fileList: FileList | File[]) => void;
  removeFile: (id: string) => void;
  retryFile: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startUpload: () => void;
  pauseUpload: () => void;
  setIsDragging: (dragging: boolean) => void;
}

const UploadWidgetContext = createContext<UploadWidgetContextType | null>(null);

export const useUploadWidget = () => {
  const context = useContext(UploadWidgetContext);
  if (!context) {
    throw new Error('useUploadWidget must be used within UploadWidgetProvider');
  }
  return context;
};

const defaultConfig: UploadWidgetConfig = {
  maxFiles: 10,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  acceptedTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  showPreviews: true,
  autoUpload: false,
  simultaneousUploads: 3,
};

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const getFileTypeIcon = (type: string): React.ReactNode => {
  if (type.startsWith('image/')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    );
  }
  if (type.startsWith('video/')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23,7 16,12 23,17 23,7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    );
  }
  if (type.startsWith('audio/')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  );
};

// Provider
export interface UploadWidgetProviderProps {
  children: React.ReactNode;
  config?: Partial<UploadWidgetConfig>;
  onUpload?: (file: UploadFile) => Promise<string>;
  onComplete?: (files: UploadFile[]) => void;
}

export const UploadWidgetProvider: React.FC<UploadWidgetProviderProps> = ({
  children,
  config: userConfig = {},
  onUpload,
  onComplete,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const totalProgress = files.length > 0
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
    : 0;

  const validateFile = useCallback((file: File): string | null => {
    if (config.maxFileSize && file.size > config.maxFileSize) {
      return `File size exceeds ${formatFileSize(config.maxFileSize)}`;
    }

    if (config.acceptedTypes && config.acceptedTypes.length > 0) {
      const isAccepted = config.acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.replace('/*', '');
          return file.type.startsWith(category);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return 'File type not accepted';
      }
    }

    return null;
  }, [config]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadFile[] = [];
    const fileArray = Array.from(fileList);

    // Check max files limit
    const remainingSlots = (config.maxFiles || 10) - files.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      const error = validateFile(file);
      const uploadFile: UploadFile = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };
      newFiles.push(uploadFile);
    }

    setFiles(prev => [...prev, ...newFiles]);

    if (config.autoUpload) {
      // Trigger upload after files are added
      setTimeout(() => startUpload(), 0);
    }
  }, [files.length, config, validateFile]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const retryFile = useCallback((id: string) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'pending', progress: 0, error: undefined } : f
    ));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
  }, [files]);

  const simulateUpload = useCallback(async (file: UploadFile): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress: 100, status: 'success' as UploadStatus } : f
          ));
          resolve();
        } else {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress, status: 'uploading' as UploadStatus } : f
          ));
        }
      }, 200);
    });
  }, []);

  const startUpload = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    for (const file of pendingFiles) {
      try {
        if (onUpload) {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, status: 'uploading' } : f
          ));
          const url = await onUpload(file);
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, status: 'success', uploadedUrl: url, progress: 100 } : f
          ));
        } else {
          await simulateUpload(file);
        }
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'error', error: 'Upload failed' } : f
        ));
      }
    }

    setIsUploading(false);
    onComplete?.(files);
  }, [files, onUpload, onComplete, simulateUpload]);

  const pauseUpload = useCallback(() => {
    setIsUploading(false);
    // In a real implementation, this would cancel ongoing requests
  }, []);

  const value: UploadWidgetContextType = {
    files,
    config,
    isDragging,
    isUploading,
    totalProgress,
    addFiles,
    removeFile,
    retryFile,
    clearCompleted,
    clearAll,
    startUpload,
    pauseUpload,
    setIsDragging,
  };

  return (
    <UploadWidgetContext.Provider value={value}>
      {children}
    </UploadWidgetContext.Provider>
  );
};

// Dropzone Component
export const UploadDropzone: React.FC<{
  compact?: boolean;
  className?: string;
}> = ({ compact = false, className }) => {
  const { addFiles, isDragging, setIsDragging, config } = useUploadWidget();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles, setIsDragging]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  }, [addFiles]);

  const acceptedTypes = config.acceptedTypes?.join(',');

  if (compact) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: '1px dashed #d1d5db',
            borderRadius: '6px',
            backgroundColor: '#fff',
            fontSize: '14px',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Files
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <motion.div
        animate={{
          borderColor: isDragging ? '#3b82f6' : '#d1d5db',
          backgroundColor: isDragging ? '#eff6ff' : '#fafafa',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            backgroundColor: isDragging ? '#dbeafe' : '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragging ? '#3b82f6' : '#9ca3af'}
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </motion.div>

        <p style={{ fontSize: '16px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          or click to browse
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          Max {config.maxFiles} files, up to {formatFileSize(config.maxFileSize || 0)} each
        </p>
      </motion.div>
    </div>
  );
};

// File List Item
const FileListItem: React.FC<{ file: UploadFile }> = ({ file }) => {
  const { removeFile, retryFile, config } = useUploadWidget();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* Preview / Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '6px',
          backgroundColor: '#f3f4f6',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {config.showPreviews && file.previewUrl ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, #10b98133, #10b98155)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        ) : (
          <span style={{ color: '#6b7280' }}>{getFileTypeIcon(file.type)}</span>
        )}
      </div>

      {/* File Info */}
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
          {file.name}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          {formatFileSize(file.size)}
          {file.status === 'uploading' && ` • ${Math.round(file.progress)}%`}
          {file.status === 'error' && (
            <span style={{ color: '#dc2626' }}> • {file.error}</span>
          )}
        </div>

        {/* Progress Bar */}
        {file.status === 'uploading' && (
          <div
            style={{
              marginTop: '6px',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
              }}
            />
          </div>
        )}
      </div>

      {/* Status / Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {file.status === 'success' && (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
        )}

        {file.status === 'error' && (
          <button
            onClick={() => retryFile(file.id)}
            style={{
              padding: '6px 10px',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              backgroundColor: '#fef2f2',
              fontSize: '12px',
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        )}

        <button
          onClick={() => removeFile(file.id)}
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// File List
export const UploadFileList: React.FC = () => {
  const { files } = useUploadWidget();

  if (files.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AnimatePresence>
        {files.map(file => (
          <FileListItem key={file.id} file={file} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Upload Progress Summary
export const UploadProgress: React.FC = () => {
  const { files, totalProgress, isUploading } = useUploadWidget();

  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    success: files.filter(f => f.status === 'success').length,
    error: files.filter(f => f.status === 'error').length,
  };

  if (files.length === 0) return null;

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
          {isUploading ? 'Uploading...' : 'Upload Progress'}
        </span>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          {stats.success}/{stats.total} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${totalProgress}%` }}
          style={{
            height: '100%',
            backgroundColor: stats.error > 0 ? '#f59e0b' : '#3b82f6',
            borderRadius: '3px',
          }}
        />
      </div>

      {/* Status Summary */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
        {stats.pending > 0 && (
          <span style={{ color: '#6b7280' }}>{stats.pending} pending</span>
        )}
        {stats.uploading > 0 && (
          <span style={{ color: '#3b82f6' }}>{stats.uploading} uploading</span>
        )}
        {stats.success > 0 && (
          <span style={{ color: '#16a34a' }}>{stats.success} complete</span>
        )}
        {stats.error > 0 && (
          <span style={{ color: '#dc2626' }}>{stats.error} failed</span>
        )}
      </div>
    </div>
  );
};

// Upload Actions Toolbar
export const UploadActions: React.FC = () => {
  const { files, isUploading, startUpload, clearCompleted, clearAll } = useUploadWidget();

  const hasPending = files.some(f => f.status === 'pending');
  const hasCompleted = files.some(f => f.status === 'success');

  if (files.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {hasCompleted && (
          <button
            onClick={clearCompleted}
            style={{
              padding: '8px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#fff',
              fontSize: '13px',
              color: '#6b7280',
              cursor: 'pointer',
            }}
          >
            Clear Completed
          </button>
        )}
        <button
          onClick={clearAll}
          style={{
            padding: '8px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#fff',
            fontSize: '13px',
            color: '#6b7280',
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>

      {hasPending && (
        <button
          onClick={startUpload}
          disabled={isUploading}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: isUploading ? '#93c5fd' : '#3b82f6',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isUploading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
              </motion.div>
              Uploading...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload All
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Inline Upload Button
export const InlineUploadButton: React.FC<{
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}> = ({ onFilesSelected, accept = 'image/*', multiple = true, label = 'Upload' }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          backgroundColor: '#fff',
          fontSize: '14px',
          color: '#374151',
          cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {label}
      </button>
    </>
  );
};

// Main Upload Widget Component
export const UploadWidget: React.FC<{
  compact?: boolean;
  showProgress?: boolean;
}> = ({ compact = false, showProgress = true }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <UploadDropzone compact={compact} />
      {showProgress && <UploadProgress />}
      <UploadFileList />
      <UploadActions />
    </div>
  );
};

export default UploadWidget;
