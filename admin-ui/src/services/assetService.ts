/**
 * Asset Service
 * Handles asset storage (local/remote) with thumbnail optimization
 * Only thumbnails are used in admin UI for better performance
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export type StorageType = 'local' | 's3' | 'cloudflare' | 'gcs' | 'azure';

export interface StorageConfig {
  type: StorageType;
  enabled: boolean;
  // Local storage
  localPath?: string;
  // S3/Compatible
  s3Endpoint?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  // Cloudflare R2
  cfAccountId?: string;
  cfBucket?: string;
  cfAccessKey?: string;
  cfSecretKey?: string;
  // Google Cloud Storage
  gcsProjectId?: string;
  gcsBucket?: string;
  gcsCredentialsJson?: string;
  // Azure Blob
  azureAccountName?: string;
  azureContainerName?: string;
  azureConnectionString?: string;
}

export interface ThumbnailConfig {
  enabled: boolean;
  sizes: ThumbnailSize[];
  format: 'webp' | 'jpeg' | 'png' | 'avif';
  quality: number; // 1-100
  lazyGeneration: boolean; // Generate on first access
}

export interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface Asset {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  storageType: StorageType;
  storagePath: string;
  url: string;
  thumbnails: AssetThumbnail[];
  metadata: AssetMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface AssetThumbnail {
  size: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number; // for video/audio
  alt?: string;
  caption?: string;
  copyright?: string;
  tags?: string[];
  focalPoint?: { x: number; y: number };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  folder?: string;
  generateThumbnails?: boolean;
  thumbnailSizes?: string[];
  metadata?: Partial<AssetMetadata>;
  onProgress?: (progress: UploadProgress) => void;
}

// ============================================
// SETTINGS API
// ============================================

/**
 * Get current storage settings
 */
export async function getStorageSettings(): Promise<{
  primary: StorageConfig;
  fallback?: StorageConfig;
  thumbnails: ThumbnailConfig;
}> {
  try {
    const response = await fetch(`${API_BASE}/settings/storage`);
    if (!response.ok) throw new Error('Failed to fetch storage settings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching storage settings:', error);
    return getDefaultStorageSettings();
  }
}

/**
 * Update storage settings
 */
export async function updateStorageSettings(settings: {
  primary: StorageConfig;
  fallback?: StorageConfig;
  thumbnails: ThumbnailConfig;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/settings/storage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating storage settings:', error);
    return false;
  }
}

/**
 * Test storage connection
 */
export async function testStorageConnection(config: StorageConfig): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  try {
    const response = await fetch(`${API_BASE}/settings/storage/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: String(error),
    };
  }
}

// ============================================
// ASSET API
// ============================================

/**
 * Upload an asset
 */
export async function uploadAsset(
  file: File,
  options: UploadOptions = {}
): Promise<Asset> {
  const formData = new FormData();
  formData.append('file', file);
  if (options.folder) formData.append('folder', options.folder);
  if (options.generateThumbnails !== undefined) {
    formData.append('generateThumbnails', String(options.generateThumbnails));
  }
  if (options.thumbnailSizes) {
    formData.append('thumbnailSizes', options.thumbnailSizes.join(','));
  }
  if (options.metadata) {
    formData.append('metadata', JSON.stringify(options.metadata));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', `${API_BASE}/assets`);
    xhr.send(formData);
  });
}

/**
 * Get asset by ID
 */
export async function getAsset(id: string): Promise<Asset> {
  const response = await fetch(`${API_BASE}/assets/${id}`);
  if (!response.ok) throw new Error('Asset not found');
  return await response.json();
}

/**
 * List assets with pagination and filters
 */
export async function listAssets(options: {
  page?: number;
  limit?: number;
  folder?: string;
  mimeType?: string;
  search?: string;
  sortBy?: 'name' | 'size' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<{
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', String(options.page));
  if (options.limit) params.append('limit', String(options.limit));
  if (options.folder) params.append('folder', options.folder);
  if (options.mimeType) params.append('mimeType', options.mimeType);
  if (options.search) params.append('search', options.search);
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);

  try {
    const response = await fetch(`${API_BASE}/assets?${params}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return await response.json();
  } catch (error) {
    console.error('Error fetching assets:', error);
    return { assets: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

/**
 * Update asset metadata
 */
export async function updateAsset(
  id: string,
  updates: Partial<AssetMetadata>
): Promise<Asset> {
  const response = await fetch(`${API_BASE}/assets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update asset');
  return await response.json();
}

/**
 * Delete asset
 */
export async function deleteAsset(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
}

/**
 * Delete multiple assets
 */
export async function deleteAssets(ids: string[]): Promise<{
  deleted: string[];
  failed: string[];
}> {
  try {
    const response = await fetch(`${API_BASE}/assets/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting assets:', error);
    return { deleted: [], failed: ids };
  }
}

/**
 * Move asset to different folder
 */
export async function moveAsset(id: string, newFolder: string): Promise<Asset> {
  const response = await fetch(`${API_BASE}/assets/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: newFolder }),
  });
  if (!response.ok) throw new Error('Failed to move asset');
  return await response.json();
}

// ============================================
// THUMBNAIL API
// ============================================

/**
 * Get thumbnail URL for an asset
 * Uses lazy loading - generates on first access if not exists
 */
export function getThumbnailUrl(
  asset: Asset,
  size: string = 'medium'
): string {
  const thumbnail = asset.thumbnails.find(t => t.size === size);
  if (thumbnail) return thumbnail.url;

  // Fallback to API endpoint that generates on-demand
  return `${API_BASE}/assets/${asset.id}/thumbnail/${size}`;
}

/**
 * Get all available thumbnail sizes
 */
export async function getThumbnailSizes(): Promise<ThumbnailSize[]> {
  try {
    const settings = await getStorageSettings();
    return settings.thumbnails.sizes;
  } catch {
    return getDefaultThumbnailSizes();
  }
}

/**
 * Regenerate thumbnails for an asset
 */
export async function regenerateThumbnails(
  id: string,
  sizes?: string[]
): Promise<AssetThumbnail[]> {
  const response = await fetch(`${API_BASE}/assets/${id}/thumbnails/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sizes }),
  });
  if (!response.ok) throw new Error('Failed to regenerate thumbnails');
  return await response.json();
}

/**
 * Batch regenerate thumbnails for multiple assets
 */
export async function batchRegenerateThumbnails(
  ids: string[],
  sizes?: string[]
): Promise<{ processed: number; failed: number }> {
  const response = await fetch(`${API_BASE}/assets/thumbnails/batch-regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, sizes }),
  });
  if (!response.ok) throw new Error('Failed to regenerate thumbnails');
  return await response.json();
}

// ============================================
// FOLDER API
// ============================================

/**
 * List folders
 */
export async function listFolders(parentPath?: string): Promise<string[]> {
  const params = parentPath ? `?parent=${encodeURIComponent(parentPath)}` : '';
  try {
    const response = await fetch(`${API_BASE}/assets/folders${params}`);
    if (!response.ok) throw new Error('Failed to fetch folders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
}

/**
 * Create folder
 */
export async function createFolder(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/assets/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating folder:', error);
    return false;
  }
}

/**
 * Delete folder (must be empty)
 */
export async function deleteFolder(path: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/assets/folders/${encodeURIComponent(path)}`,
      { method: 'DELETE' }
    );
    return response.ok;
  } catch (error) {
    console.error('Error deleting folder:', error);
    return false;
  }
}

// ============================================
// STORAGE MIGRATION
// ============================================

/**
 * Migrate assets from one storage to another
 */
export async function migrateStorage(
  sourceType: StorageType,
  targetType: StorageType,
  options: {
    includeThumbnails?: boolean;
    deleteFromSource?: boolean;
    onProgress?: (processed: number, total: number) => void;
  } = {}
): Promise<{
  migrated: number;
  failed: number;
  errors: string[];
}> {
  // This would be a long-running operation, likely using SSE or WebSocket
  const response = await fetch(`${API_BASE}/assets/migrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceType,
      targetType,
      ...options,
    }),
  });

  if (!response.ok) throw new Error('Migration failed to start');
  return await response.json();
}

// ============================================
// DEFAULTS
// ============================================

function getDefaultStorageSettings() {
  return {
    primary: {
      type: 'local' as StorageType,
      enabled: true,
      localPath: 'uploads',
    },
    thumbnails: {
      enabled: true,
      sizes: getDefaultThumbnailSizes(),
      format: 'webp' as const,
      quality: 80,
      lazyGeneration: true,
    },
  };
}

function getDefaultThumbnailSizes(): ThumbnailSize[] {
  return [
    { name: 'icon', width: 64, height: 64, fit: 'cover' },
    { name: 'small', width: 150, height: 150, fit: 'cover' },
    { name: 'medium', width: 300, height: 300, fit: 'cover' },
    { name: 'large', width: 600, height: 600, fit: 'inside' },
    { name: 'preview', width: 1200, height: 800, fit: 'inside' },
  ];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if a file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if a file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get appropriate thumbnail size for display context
 */
export function getOptimalThumbnailSize(
  displayWidth: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): string {
  const targetWidth = displayWidth * devicePixelRatio;

  if (targetWidth <= 64) return 'icon';
  if (targetWidth <= 150) return 'small';
  if (targetWidth <= 300) return 'medium';
  if (targetWidth <= 600) return 'large';
  return 'preview';
}

export default {
  // Settings
  getStorageSettings,
  updateStorageSettings,
  testStorageConnection,
  // Assets
  uploadAsset,
  getAsset,
  listAssets,
  updateAsset,
  deleteAsset,
  deleteAssets,
  moveAsset,
  // Thumbnails
  getThumbnailUrl,
  getThumbnailSizes,
  regenerateThumbnails,
  batchRegenerateThumbnails,
  // Folders
  listFolders,
  createFolder,
  deleteFolder,
  // Migration
  migrateStorage,
  // Utilities
  isImageFile,
  isVideoFile,
  formatFileSize,
  getFileExtension,
  getOptimalThumbnailSize,
};
