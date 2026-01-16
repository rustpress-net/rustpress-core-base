/**
 * RustPress File Upload Component
 * Drag & drop file upload with progress and previews
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  X,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { cn } from '../utils';
import { Button, IconButton } from './Button';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  preview?: string;
}

export interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  minSize?: number;
  disabled?: boolean;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
  variant?: 'dropzone' | 'button' | 'compact';
  className?: string;
}

// File type icons
const fileTypeIcons: Record<string, React.ElementType> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  application: FileArchive,
  text: FileText,
  code: FileCode,
};

function getFileIcon(type: string): React.ElementType {
  const category = type.split('/')[0];
  return fileTypeIcons[category] || File;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function FileUpload({
  value = [],
  onChange,
  onUpload,
  accept,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  minSize = 0,
  disabled = false,
  showPreview = true,
  previewSize = 'md',
  variant = 'dropzone',
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File too large. Max size: ${formatFileSize(maxSize)}`;
    }
    if (file.size < minSize) {
      return `File too small. Min size: ${formatFileSize(minSize)}`;
    }
    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });
      if (!isAccepted) {
        return `File type not accepted. Allowed: ${accept}`;
      }
    }
    return null;
  };

  // Process files
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const availableSlots = maxFiles - value.length;

    if (availableSlots <= 0) {
      return;
    }

    const filesToProcess = fileArray.slice(0, availableSlots);

    const newFiles: UploadedFile[] = filesToProcess.map((file) => {
      const error = validateFile(file);
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      return {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: error ? 'error' : 'pending',
        error,
        preview,
      };
    });

    const updatedFiles = [...value, ...newFiles];
    onChange?.(updatedFiles);

    // Upload files
    if (onUpload) {
      for (const uploadFile of newFiles) {
        if (uploadFile.status === 'error') continue;

        // Set to uploading
        const updatingFiles = updatedFiles.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' as const } : f
        );
        onChange?.(updatingFiles);

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            onChange?.((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          const url = await onUpload(uploadFile.file);

          clearInterval(progressInterval);

          // Set to success
          onChange?.((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'success', progress: 100, url }
                : f
            )
          );
        } catch (error) {
          // Set to error
          onChange?.((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : f
            )
          );
        }
      }
    } else {
      // No upload handler, mark as success immediately
      onChange?.(
        updatedFiles.map((f) =>
          f.status === 'pending' ? { ...f, status: 'success', progress: 100 } : f
        )
      );
    }
  };

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    const file = value.find((f) => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onChange?.(value.filter((f) => f.id !== id));
  };

  // Retry upload
  const retryFile = (id: string) => {
    const file = value.find((f) => f.id === id);
    if (file) {
      const updated = value.map((f) =>
        f.id === id ? { ...f, status: 'pending' as const, error: undefined, progress: 0 } : f
      );
      onChange?.(updated);

      if (onUpload) {
        processFiles([file.file]);
      }
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  // Preview sizes
  const previewSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  // Dropzone variant
  if (variant === 'dropzone') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Drop zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
            'transition-all duration-200',
            disabled
              ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800'
              : isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />

          <Upload
            className={cn(
              'w-12 h-12 mx-auto mb-4',
              isDragging ? 'text-primary-500' : 'text-neutral-400'
            )}
          />

          <p className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-neutral-500 mb-3">
            or click to browse
          </p>

          <div className="text-xs text-neutral-400 space-y-1">
            {accept && <p>Accepted: {accept}</p>}
            <p>Max size: {formatFileSize(maxSize)}</p>
            {multiple && <p>Max files: {maxFiles}</p>}
          </div>
        </div>

        {/* File list */}
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                showPreview={showPreview}
                previewSize={previewSize}
                onRemove={() => removeFile(file.id)}
                onRetry={() => retryFile(file.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={openFileDialog}
            disabled={disabled || value.length >= maxFiles}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          {value.length > 0 && (
            <span className="text-sm text-neutral-500">
              {value.length} file{value.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {/* File list */}
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                showPreview={showPreview}
                previewSize={previewSize}
                onRemove={() => removeFile(file.id)}
                onRetry={() => retryFile(file.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Compact variant (grid of previews)
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-3">
        {/* Existing files */}
        {value.map((file) => (
          <CompactFileItem
            key={file.id}
            file={file}
            size={previewSize}
            onRemove={() => removeFile(file.id)}
            onRetry={() => retryFile(file.id)}
          />
        ))}

        {/* Add button */}
        {value.length < maxFiles && (
          <button
            onClick={openFileDialog}
            disabled={disabled}
            className={cn(
              previewSizes[previewSize],
              'flex items-center justify-center',
              'border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg',
              'hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
              'transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Plus className="w-6 h-6 text-neutral-400" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}

// File item component
interface FileItemProps {
  file: UploadedFile;
  showPreview: boolean;
  previewSize: 'sm' | 'md' | 'lg';
  onRemove: () => void;
  onRetry: () => void;
}

function FileItem({
  file,
  showPreview,
  previewSize,
  onRemove,
  onRetry,
}: FileItemProps) {
  const Icon = getFileIcon(file.type);
  const previewSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-neutral-50 dark:bg-neutral-800/50',
        'border border-neutral-200 dark:border-neutral-700'
      )}
    >
      {/* Preview or icon */}
      {showPreview && file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className={cn(previewSizes[previewSize], 'rounded-lg object-cover')}
        />
      ) : (
        <div
          className={cn(
            previewSizes[previewSize],
            'flex items-center justify-center',
            'bg-neutral-100 dark:bg-neutral-700 rounded-lg'
          )}
        >
          <Icon className="w-6 h-6 text-neutral-400" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-sm text-neutral-500">
          {formatFileSize(file.size)}
        </p>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}

        {/* Error message */}
        {file.status === 'error' && file.error && (
          <p className="text-xs text-error-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {file.error}
          </p>
        )}
      </div>

      {/* Status & actions */}
      <div className="flex items-center gap-1">
        {file.status === 'uploading' && (
          <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
        )}
        {file.status === 'success' && (
          <Check className="w-5 h-5 text-success-500" />
        )}
        {file.status === 'error' && (
          <IconButton variant="ghost" size="sm" onClick={onRetry}>
            <RotateCcw className="w-4 h-4" />
          </IconButton>
        )}
        <IconButton variant="ghost" size="sm" onClick={onRemove}>
          <X className="w-4 h-4" />
        </IconButton>
      </div>
    </motion.div>
  );
}

// Compact file item
interface CompactFileItemProps {
  file: UploadedFile;
  size: 'sm' | 'md' | 'lg';
  onRemove: () => void;
  onRetry: () => void;
}

function CompactFileItem({ file, size, onRemove, onRetry }: CompactFileItemProps) {
  const Icon = getFileIcon(file.type);
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={cn(sizes[size], 'relative group')}>
      {/* Preview */}
      {file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className="w-full h-full rounded-lg object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>
      )}

      {/* Status overlay */}
      {file.status === 'uploading' && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
      {file.status === 'error' && (
        <div className="absolute inset-0 bg-error-500/80 rounded-lg flex items-center justify-center">
          <button onClick={onRetry}>
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={onRemove}
        className={cn(
          'absolute -top-2 -right-2 p-1 rounded-full',
          'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'shadow-lg'
        )}
      >
        <X className="w-3 h-3" />
      </button>

      {/* Success indicator */}
      {file.status === 'success' && (
        <div className="absolute bottom-1 right-1 p-0.5 rounded-full bg-success-500">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

// Single file upload
export interface SingleFileUploadProps {
  value?: UploadedFile | null;
  onChange?: (file: UploadedFile | null) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  className?: string;
}

export function SingleFileUpload({
  value,
  onChange,
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  placeholder = 'Click to upload',
  className,
}: SingleFileUploadProps) {
  const handleChange = (files: UploadedFile[]) => {
    onChange?.(files[0] || null);
  };

  return (
    <FileUpload
      value={value ? [value] : []}
      onChange={handleChange}
      onUpload={onUpload}
      accept={accept}
      maxSize={maxSize}
      multiple={false}
      maxFiles={1}
      variant="compact"
      previewSize="lg"
      className={className}
    />
  );
}

export default FileUpload;
