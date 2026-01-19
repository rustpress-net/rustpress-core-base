/**
 * Storage Settings - Configure storage backends for different content types
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  Cloud,
  Server,
  FolderOpen,
  Palette,
  Image,
  Zap,
  Puzzle,
  AppWindow,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  Save,
  RefreshCw,
  ArrowRightLeft,
  Download,
  Upload,
  Loader2,
  Info,
} from 'lucide-react';

// Storage provider types
type StorageProvider =
  | 'local' | 's3' | 'ssh' | 'sftp' | 'gcs' | 'azure' | 'ftp'
  | 'cloudflare-r2' | 'digitalocean-spaces' | 'minio' | 'backblaze-b2' | 'wasabi'
  | 'linode' | 'vultr' | 'bunny-storage' | 'imagekit' | 'cloudinary' | 'imgix'
  | 'uploadcare' | 'keycdn' | 'stackpath' | 'fastly' | 'akamai';

interface StorageConfig {
  provider: StorageProvider;
  enabled: boolean;
  // Local
  localPath?: string;
  // S3
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Endpoint?: string; // For S3-compatible services like MinIO
  s3PathStyle?: boolean;
  // SSH/SFTP
  sshHost?: string;
  sshPort?: number;
  sshUsername?: string;
  sshPassword?: string;
  sshPrivateKey?: string;
  sshRemotePath?: string;
  // GCS
  gcsBucket?: string;
  gcsProjectId?: string;
  gcsKeyFile?: string;
  // Azure
  azureContainer?: string;
  azureAccountName?: string;
  azureAccountKey?: string;
  azureCdnEndpoint?: string;
  // FTP
  ftpHost?: string;
  ftpPort?: number;
  ftpUsername?: string;
  ftpPassword?: string;
  ftpRemotePath?: string;
  ftpSecure?: boolean;
  // Cloudflare R2
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2BucketName?: string;
  r2PublicUrl?: string;
  // DigitalOcean Spaces
  doSpacesRegion?: string;
  doSpacesName?: string;
  doSpacesKey?: string;
  doSpacesSecret?: string;
  doSpacesCdnEndpoint?: string;
  // MinIO
  minioEndpoint?: string;
  minioBucket?: string;
  minioAccessKey?: string;
  minioSecretKey?: string;
  minioUseSSL?: boolean;
  // Backblaze B2
  b2ApplicationKeyId?: string;
  b2ApplicationKey?: string;
  b2BucketId?: string;
  b2BucketName?: string;
  b2CdnUrl?: string;
  // Wasabi
  wasabiRegion?: string;
  wasabiBucket?: string;
  wasabiAccessKey?: string;
  wasabiSecretKey?: string;
  // Linode Object Storage
  linodeCluster?: string;
  linodeBucket?: string;
  linodeAccessKey?: string;
  linodeSecretKey?: string;
  // Vultr Object Storage
  vultrHostname?: string;
  vultrBucket?: string;
  vultrAccessKey?: string;
  vultrSecretKey?: string;
  // Bunny Storage
  bunnyStorageZone?: string;
  bunnyApiKey?: string;
  bunnyPullZone?: string;
  bunnyRegion?: string;
  // ImageKit
  imagekitPublicKey?: string;
  imagekitPrivateKey?: string;
  imagekitUrlEndpoint?: string;
  // Cloudinary
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  cloudinaryUploadPreset?: string;
  // imgix
  imgixDomain?: string;
  imgixSecureUrlToken?: string;
  imgixSourceId?: string;
  // Uploadcare
  uploadcarePublicKey?: string;
  uploadcareSecretKey?: string;
  uploadcareCdnBase?: string;
  // KeyCDN
  keycdnZoneId?: string;
  keycdnApiKey?: string;
  keycdnZoneUrl?: string;
  // StackPath
  stackpathStackId?: string;
  stackpathClientId?: string;
  stackpathClientSecret?: string;
  stackpathSiteId?: string;
  // Fastly
  fastlyApiKey?: string;
  fastlyServiceId?: string;
  fastlyDomain?: string;
  // Akamai NetStorage
  akamaiHost?: string;
  akamaiKeyName?: string;
  akamaiKey?: string;
  akamaiCpCode?: string;
  akamaiCdnDomain?: string;
}

interface StorageCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  config: StorageConfig;
}

const defaultConfig: StorageConfig = {
  provider: 'local',
  enabled: true,
  localPath: '',
  sshPort: 22,
  ftpPort: 21,
  ftpSecure: false,
};

// Base storage providers (for themes, functions, plugins, apps)
const baseProviders: { id: StorageProvider; name: string; icon: React.ReactNode; description: string }[] = [
  { id: 'local', name: 'Local Filesystem', icon: <HardDrive className="w-5 h-5" />, description: 'Store files on the local server (default)' },
  { id: 's3', name: 'Amazon S3', icon: <Cloud className="w-5 h-5" />, description: 'AWS S3 or S3-compatible storage' },
  { id: 'gcs', name: 'Google Cloud Storage', icon: <Cloud className="w-5 h-5" />, description: 'Google Cloud Platform storage buckets' },
  { id: 'azure', name: 'Azure Blob Storage', icon: <Cloud className="w-5 h-5" />, description: 'Microsoft Azure blob containers' },
  { id: 'ssh', name: 'SSH/SCP', icon: <Server className="w-5 h-5" />, description: 'Remote server via SSH secure copy' },
  { id: 'sftp', name: 'SFTP', icon: <Server className="w-5 h-5" />, description: 'SSH File Transfer Protocol' },
  { id: 'ftp', name: 'FTP/FTPS', icon: <FolderOpen className="w-5 h-5" />, description: 'File Transfer Protocol (with optional TLS)' },
];

// Extended providers for assets (CDN and cloud storage)
const assetProviders: { id: StorageProvider; name: string; icon: React.ReactNode; description: string }[] = [
  { id: 'local', name: 'Local Filesystem', icon: <HardDrive className="w-5 h-5" />, description: 'Store files on the local server (default)' },
  { id: 's3', name: 'Amazon S3 / CloudFront', icon: <Cloud className="w-5 h-5" />, description: 'AWS S3 with optional CloudFront CDN' },
  { id: 'gcs', name: 'Google Cloud Storage', icon: <Cloud className="w-5 h-5" />, description: 'GCS with Cloud CDN integration' },
  { id: 'azure', name: 'Azure Blob / CDN', icon: <Cloud className="w-5 h-5" />, description: 'Azure Blob Storage with Azure CDN' },
  { id: 'cloudflare-r2', name: 'Cloudflare R2', icon: <Cloud className="w-5 h-5" />, description: 'S3-compatible with zero egress fees' },
  { id: 'digitalocean-spaces', name: 'DigitalOcean Spaces', icon: <Cloud className="w-5 h-5" />, description: 'S3-compatible object storage with built-in CDN' },
  { id: 'minio', name: 'MinIO', icon: <Server className="w-5 h-5" />, description: 'Self-hosted S3-compatible storage' },
  { id: 'backblaze-b2', name: 'Backblaze B2', icon: <Cloud className="w-5 h-5" />, description: 'Affordable cloud storage with CDN partners' },
  { id: 'wasabi', name: 'Wasabi', icon: <Cloud className="w-5 h-5" />, description: 'Hot cloud storage, no egress fees' },
  { id: 'linode', name: 'Linode Object Storage', icon: <Cloud className="w-5 h-5" />, description: 'S3-compatible storage by Akamai' },
  { id: 'vultr', name: 'Vultr Object Storage', icon: <Cloud className="w-5 h-5" />, description: 'S3-compatible cloud storage' },
  { id: 'bunny-storage', name: 'Bunny Storage', icon: <Cloud className="w-5 h-5" />, description: 'Edge storage with global CDN' },
  { id: 'imagekit', name: 'ImageKit', icon: <Image className="w-5 h-5" />, description: 'Image CDN with real-time optimization' },
  { id: 'cloudinary', name: 'Cloudinary', icon: <Image className="w-5 h-5" />, description: 'Media management and delivery platform' },
  { id: 'imgix', name: 'imgix', icon: <Image className="w-5 h-5" />, description: 'Real-time image processing CDN' },
  { id: 'uploadcare', name: 'Uploadcare', icon: <Cloud className="w-5 h-5" />, description: 'File handling and CDN platform' },
  { id: 'keycdn', name: 'KeyCDN', icon: <Cloud className="w-5 h-5" />, description: 'High-performance content delivery' },
  { id: 'stackpath', name: 'StackPath', icon: <Cloud className="w-5 h-5" />, description: 'Edge computing and CDN' },
  { id: 'fastly', name: 'Fastly', icon: <Cloud className="w-5 h-5" />, description: 'Edge cloud platform' },
  { id: 'akamai', name: 'Akamai NetStorage', icon: <Cloud className="w-5 h-5" />, description: 'Enterprise-grade CDN and storage' },
  { id: 'ssh', name: 'SSH/SCP', icon: <Server className="w-5 h-5" />, description: 'Remote server via SSH secure copy' },
  { id: 'sftp', name: 'SFTP', icon: <Server className="w-5 h-5" />, description: 'SSH File Transfer Protocol' },
  { id: 'ftp', name: 'FTP/FTPS', icon: <FolderOpen className="w-5 h-5" />, description: 'File Transfer Protocol (with optional TLS)' },
];

// Helper to get providers for a specific category
const getProvidersForCategory = (categoryId: string) => {
  return categoryId === 'assets' ? assetProviders : baseProviders;
};

// Find provider by ID across all provider lists
const findProvider = (providerId: StorageProvider) => {
  return assetProviders.find(p => p.id === providerId) || baseProviders.find(p => p.id === providerId);
};

// Media Migration Panel Component
interface MediaMigrationPanelProps {
  currentProvider: StorageProvider;
  onMigrate: (direction: 'to-remote' | 'to-local') => void;
}

const MediaMigrationPanel: React.FC<MediaMigrationPanelProps> = ({ currentProvider, onMigrate }) => {
  const [migrating, setMigrating] = useState(false);
  const [migrationDirection, setMigrationDirection] = useState<'to-remote' | 'to-local' | null>(null);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [updateReferences, setUpdateReferences] = useState(true);

  const isRemoteProvider = currentProvider !== 'local';

  const handleMigrate = async (direction: 'to-remote' | 'to-local') => {
    setMigrating(true);
    setMigrationDirection(direction);
    setProgress(0);

    // Simulate migration progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setMigrating(false);
    setMigrationDirection(null);
    setShowConfirm(false);
    onMigrate(direction);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <ArrowRightLeft className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Media Migration</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Transfer assets between local storage and {findProvider(currentProvider)?.name || 'remote provider'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`p-3 rounded-lg ${!isRemoteProvider ? 'bg-green-500/20 ring-2 ring-green-500/50' : 'bg-gray-700/50'}`}>
                <HardDrive className={`w-6 h-6 ${!isRemoteProvider ? 'text-green-400' : 'text-gray-500'}`} />
              </div>
              <span className="text-xs text-gray-400 mt-2 block">Local</span>
            </div>
            <div className="flex-1 max-w-[100px]">
              <div className="h-0.5 bg-gray-700 relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: migrating ? `${progress}%` : '0%' }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className={`p-3 rounded-lg ${isRemoteProvider ? 'bg-blue-500/20 ring-2 ring-blue-500/50' : 'bg-gray-700/50'}`}>
                <Cloud className={`w-6 h-6 ${isRemoteProvider ? 'text-blue-400' : 'text-gray-500'}`} />
              </div>
              <span className="text-xs text-gray-400 mt-2 block">Remote</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {isRemoteProvider ? 'Using Remote Storage' : 'Using Local Storage'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {findProvider(currentProvider)?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Migration Progress */}
      {migrating && (
        <div className="p-6 border-b border-gray-700 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-sm text-white">
              {migrationDirection === 'to-remote' ? 'Uploading to remote storage...' : 'Downloading to local storage...'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{progress}% complete</span>
            <span>Estimated: {Math.ceil((100 - progress) / 10)} seconds remaining</span>
          </div>
        </div>
      )}

      {/* Migration Options */}
      {!migrating && (
        <div className="p-6 space-y-4">
          {/* Asset Type Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Assets to migrate</label>
            <div className="flex gap-2">
              {(['all', 'images', 'videos', 'documents'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedAssets(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedAssets === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Update References Option */}
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              id="updateRefs"
              checked={updateReferences}
              onChange={(e) => setUpdateReferences(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
            />
            <div>
              <label htmlFor="updateRefs" className="text-sm text-white cursor-pointer">
                Update content references automatically
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Replace all asset URLs in posts, pages, and theme files with new storage URLs
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-200/80">
              Migration will transfer all {selectedAssets === 'all' ? 'assets' : selectedAssets} to the {isRemoteProvider ? 'local filesystem' : 'configured remote provider'}.
              {updateReferences && ' All content references will be updated to use the new URLs.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isRemoteProvider ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-white font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                Download All to Local
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload All to Remote
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Migration</h3>
            <p className="text-sm text-gray-400 mb-4">
              You are about to migrate {selectedAssets === 'all' ? 'all assets' : selectedAssets} from{' '}
              <span className="text-white font-medium">{isRemoteProvider ? 'remote' : 'local'}</span> to{' '}
              <span className="text-white font-medium">{isRemoteProvider ? 'local' : 'remote'}</span> storage.
              {updateReferences && ' All content URLs will be updated automatically.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMigrate(isRemoteProvider ? 'to-local' : 'to-remote')}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Start Migration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const StorageSettings: React.FC = () => {
  const [categories, setCategories] = useState<StorageCategory[]>([
    {
      id: 'themes',
      name: 'Themes',
      description: 'Template files, stylesheets, and theme assets',
      icon: <Palette className="w-5 h-5" />,
      config: { ...defaultConfig, localPath: '/var/rustpress/themes' },
    },
    {
      id: 'assets',
      name: 'Assets',
      description: 'Images, fonts, and static media files',
      icon: <Image className="w-5 h-5" />,
      config: { ...defaultConfig, localPath: '/var/rustpress/assets' },
    },
    {
      id: 'functions',
      name: 'Functions',
      description: 'Serverless functions and API endpoints',
      icon: <Zap className="w-5 h-5" />,
      config: { ...defaultConfig, localPath: '/var/rustpress/functions' },
    },
    {
      id: 'plugins',
      name: 'Plugins',
      description: 'Plugin packages and extensions',
      icon: <Puzzle className="w-5 h-5" />,
      config: { ...defaultConfig, localPath: '/var/rustpress/plugins' },
    },
    {
      id: 'apps',
      name: 'Apps',
      description: 'Full application bundles and micro-frontends',
      icon: <AppWindow className="w-5 h-5" />,
      config: { ...defaultConfig, localPath: '/var/rustpress/apps' },
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('themes');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});
  const [saving, setSaving] = useState(false);

  const activeConfig = categories.find(c => c.id === activeCategory);

  const updateConfig = (categoryId: string, updates: Partial<StorageConfig>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, config: { ...cat.config, ...updates } }
          : cat
      )
    );
  };

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const testConnection = async (categoryId: string) => {
    setTestingConnection(categoryId);
    setTestResults(prev => ({ ...prev, [categoryId]: null }));

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random success/failure for demo
    const success = Math.random() > 0.3;
    setTestResults(prev => ({ ...prev, [categoryId]: success ? 'success' : 'error' }));
    setTestingConnection(null);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
  };

  const renderProviderConfig = (config: StorageConfig, categoryId: string) => {
    const inputClass = "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all";
    const labelClass = "block text-sm font-medium text-gray-300 mb-2";

    switch (config.provider) {
      case 'local':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Local Path</label>
              <input
                type="text"
                value={config.localPath || ''}
                onChange={(e) => updateConfig(categoryId, { localPath: e.target.value })}
                placeholder="/var/rustpress/themes"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Absolute path on the server filesystem</p>
            </div>
          </div>
        );

      case 's3':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bucket Name</label>
                <input
                  type="text"
                  value={config.s3Bucket || ''}
                  onChange={(e) => updateConfig(categoryId, { s3Bucket: e.target.value })}
                  placeholder="my-rustpress-bucket"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Region</label>
                <select
                  value={config.s3Region || 'us-east-1'}
                  onChange={(e) => updateConfig(categoryId, { s3Region: e.target.value })}
                  className={inputClass}
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-east-2">US East (Ohio)</option>
                  <option value="us-west-1">US West (N. California)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-west-2">EU (London)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Custom Endpoint (Optional)</label>
              <input
                type="text"
                value={config.s3Endpoint || ''}
                onChange={(e) => updateConfig(categoryId, { s3Endpoint: e.target.value })}
                placeholder="https://minio.example.com"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">For S3-compatible services like MinIO, DigitalOcean Spaces, Backblaze B2</p>
            </div>
            <div>
              <label className={labelClass}>Access Key ID</label>
              <input
                type="text"
                value={config.s3AccessKey || ''}
                onChange={(e) => updateConfig(categoryId, { s3AccessKey: e.target.value })}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Access Key</label>
              <div className="relative">
                <input
                  type={showSecrets['s3SecretKey'] ? 'text' : 'password'}
                  value={config.s3SecretKey || ''}
                  onChange={(e) => updateConfig(categoryId, { s3SecretKey: e.target.value })}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('s3SecretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['s3SecretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'ssh':
      case 'sftp':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Host</label>
                <input
                  type="text"
                  value={config.sshHost || ''}
                  onChange={(e) => updateConfig(categoryId, { sshHost: e.target.value })}
                  placeholder="storage.example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Port</label>
                <input
                  type="number"
                  value={config.sshPort || 22}
                  onChange={(e) => updateConfig(categoryId, { sshPort: parseInt(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={config.sshUsername || ''}
                onChange={(e) => updateConfig(categoryId, { sshUsername: e.target.value })}
                placeholder="rustpress"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Authentication Method</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showSecrets['sshPassword'] ? 'text' : 'password'}
                      value={config.sshPassword || ''}
                      onChange={(e) => updateConfig(categoryId, { sshPassword: e.target.value })}
                      placeholder="Enter password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('sshPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showSecrets['sshPassword'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Or Private Key</label>
                  <textarea
                    value={config.sshPrivateKey || ''}
                    onChange={(e) => updateConfig(categoryId, { sshPrivateKey: e.target.value })}
                    placeholder="-----BEGIN RSA PRIVATE KEY-----"
                    rows={1}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Remote Path</label>
              <input
                type="text"
                value={config.sshRemotePath || ''}
                onChange={(e) => updateConfig(categoryId, { sshRemotePath: e.target.value })}
                placeholder="/home/rustpress/storage"
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'gcs':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bucket Name</label>
                <input
                  type="text"
                  value={config.gcsBucket || ''}
                  onChange={(e) => updateConfig(categoryId, { gcsBucket: e.target.value })}
                  placeholder="my-rustpress-bucket"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Project ID</label>
                <input
                  type="text"
                  value={config.gcsProjectId || ''}
                  onChange={(e) => updateConfig(categoryId, { gcsProjectId: e.target.value })}
                  placeholder="my-gcp-project"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Service Account Key (JSON)</label>
              <textarea
                value={config.gcsKeyFile || ''}
                onChange={(e) => updateConfig(categoryId, { gcsKeyFile: e.target.value })}
                placeholder='{"type": "service_account", ...}'
                rows={4}
                className={`${inputClass} font-mono text-sm`}
              />
              <p className="mt-1.5 text-xs text-gray-500">Paste the contents of your service account JSON key file</p>
            </div>
          </div>
        );

      case 'azure':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Container Name</label>
              <input
                type="text"
                value={config.azureContainer || ''}
                onChange={(e) => updateConfig(categoryId, { azureContainer: e.target.value })}
                placeholder="rustpress-storage"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Storage Account Name</label>
              <input
                type="text"
                value={config.azureAccountName || ''}
                onChange={(e) => updateConfig(categoryId, { azureAccountName: e.target.value })}
                placeholder="myazurestorageaccount"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Account Key</label>
              <div className="relative">
                <input
                  type={showSecrets['azureAccountKey'] ? 'text' : 'password'}
                  value={config.azureAccountKey || ''}
                  onChange={(e) => updateConfig(categoryId, { azureAccountKey: e.target.value })}
                  placeholder="Your Azure storage account key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('azureAccountKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['azureAccountKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'ftp':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Host</label>
                <input
                  type="text"
                  value={config.ftpHost || ''}
                  onChange={(e) => updateConfig(categoryId, { ftpHost: e.target.value })}
                  placeholder="ftp.example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Port</label>
                <input
                  type="number"
                  value={config.ftpPort || 21}
                  onChange={(e) => updateConfig(categoryId, { ftpPort: parseInt(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  value={config.ftpUsername || ''}
                  onChange={(e) => updateConfig(categoryId, { ftpUsername: e.target.value })}
                  placeholder="ftpuser"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showSecrets['ftpPassword'] ? 'text' : 'password'}
                    value={config.ftpPassword || ''}
                    onChange={(e) => updateConfig(categoryId, { ftpPassword: e.target.value })}
                    placeholder="Enter password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('ftpPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showSecrets['ftpPassword'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Remote Path</label>
              <input
                type="text"
                value={config.ftpRemotePath || ''}
                onChange={(e) => updateConfig(categoryId, { ftpRemotePath: e.target.value })}
                placeholder="/public_html/storage"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ftpSecure"
                checked={config.ftpSecure || false}
                onChange={(e) => updateConfig(categoryId, { ftpSecure: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
              />
              <label htmlFor="ftpSecure" className="text-sm text-gray-300">
                Use FTPS (FTP over TLS)
              </label>
            </div>
          </div>
        );

      case 'cloudflare-r2':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Account ID</label>
                <input
                  type="text"
                  value={config.r2AccountId || ''}
                  onChange={(e) => updateConfig(categoryId, { r2AccountId: e.target.value })}
                  placeholder="your-account-id"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-500">Found in Cloudflare dashboard</p>
              </div>
              <div>
                <label className={labelClass}>Bucket Name</label>
                <input
                  type="text"
                  value={config.r2BucketName || ''}
                  onChange={(e) => updateConfig(categoryId, { r2BucketName: e.target.value })}
                  placeholder="my-bucket"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Access Key ID</label>
              <input
                type="text"
                value={config.r2AccessKeyId || ''}
                onChange={(e) => updateConfig(categoryId, { r2AccessKeyId: e.target.value })}
                placeholder="R2 Access Key ID"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Access Key</label>
              <div className="relative">
                <input
                  type={showSecrets['r2SecretAccessKey'] ? 'text' : 'password'}
                  value={config.r2SecretAccessKey || ''}
                  onChange={(e) => updateConfig(categoryId, { r2SecretAccessKey: e.target.value })}
                  placeholder="R2 Secret Access Key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('r2SecretAccessKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['r2SecretAccessKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Public URL (Optional)</label>
              <input
                type="text"
                value={config.r2PublicUrl || ''}
                onChange={(e) => updateConfig(categoryId, { r2PublicUrl: e.target.value })}
                placeholder="https://pub-xxx.r2.dev"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Custom domain or R2 public URL for serving assets</p>
            </div>
          </div>
        );

      case 'digitalocean-spaces':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Space Name</label>
                <input
                  type="text"
                  value={config.doSpacesName || ''}
                  onChange={(e) => updateConfig(categoryId, { doSpacesName: e.target.value })}
                  placeholder="my-space"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Region</label>
                <select
                  value={config.doSpacesRegion || 'nyc3'}
                  onChange={(e) => updateConfig(categoryId, { doSpacesRegion: e.target.value })}
                  className={inputClass}
                >
                  <option value="nyc3">NYC3 (New York)</option>
                  <option value="sfo3">SFO3 (San Francisco)</option>
                  <option value="ams3">AMS3 (Amsterdam)</option>
                  <option value="sgp1">SGP1 (Singapore)</option>
                  <option value="fra1">FRA1 (Frankfurt)</option>
                  <option value="syd1">SYD1 (Sydney)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Spaces Key</label>
              <input
                type="text"
                value={config.doSpacesKey || ''}
                onChange={(e) => updateConfig(categoryId, { doSpacesKey: e.target.value })}
                placeholder="Spaces access key"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Spaces Secret</label>
              <div className="relative">
                <input
                  type={showSecrets['doSpacesSecret'] ? 'text' : 'password'}
                  value={config.doSpacesSecret || ''}
                  onChange={(e) => updateConfig(categoryId, { doSpacesSecret: e.target.value })}
                  placeholder="Spaces secret key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('doSpacesSecret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['doSpacesSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>CDN Endpoint (Optional)</label>
              <input
                type="text"
                value={config.doSpacesCdnEndpoint || ''}
                onChange={(e) => updateConfig(categoryId, { doSpacesCdnEndpoint: e.target.value })}
                placeholder="https://my-space.nyc3.cdn.digitaloceanspaces.com"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Enable CDN in Spaces settings to get the CDN endpoint</p>
            </div>
          </div>
        );

      case 'minio':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Endpoint URL</label>
              <input
                type="text"
                value={config.minioEndpoint || ''}
                onChange={(e) => updateConfig(categoryId, { minioEndpoint: e.target.value })}
                placeholder="https://minio.example.com:9000"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Full URL including port (usually 9000)</p>
            </div>
            <div>
              <label className={labelClass}>Bucket Name</label>
              <input
                type="text"
                value={config.minioBucket || ''}
                onChange={(e) => updateConfig(categoryId, { minioBucket: e.target.value })}
                placeholder="rustpress-assets"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Access Key</label>
              <input
                type="text"
                value={config.minioAccessKey || ''}
                onChange={(e) => updateConfig(categoryId, { minioAccessKey: e.target.value })}
                placeholder="minioadmin"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets['minioSecretKey'] ? 'text' : 'password'}
                  value={config.minioSecretKey || ''}
                  onChange={(e) => updateConfig(categoryId, { minioSecretKey: e.target.value })}
                  placeholder="MinIO secret key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('minioSecretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['minioSecretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="minioUseSSL"
                checked={config.minioUseSSL !== false}
                onChange={(e) => updateConfig(categoryId, { minioUseSSL: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
              />
              <label htmlFor="minioUseSSL" className="text-sm text-gray-300">
                Use SSL/TLS connection
              </label>
            </div>
          </div>
        );

      case 'backblaze-b2':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Application Key ID</label>
                <input
                  type="text"
                  value={config.b2ApplicationKeyId || ''}
                  onChange={(e) => updateConfig(categoryId, { b2ApplicationKeyId: e.target.value })}
                  placeholder="00xxxxxxxxxxxxxxxxxx"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bucket ID</label>
                <input
                  type="text"
                  value={config.b2BucketId || ''}
                  onChange={(e) => updateConfig(categoryId, { b2BucketId: e.target.value })}
                  placeholder="4a48xxxxxxxxxxxxxxxx"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Application Key</label>
              <div className="relative">
                <input
                  type={showSecrets['b2ApplicationKey'] ? 'text' : 'password'}
                  value={config.b2ApplicationKey || ''}
                  onChange={(e) => updateConfig(categoryId, { b2ApplicationKey: e.target.value })}
                  placeholder="B2 application key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('b2ApplicationKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['b2ApplicationKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Bucket Name</label>
              <input
                type="text"
                value={config.b2BucketName || ''}
                onChange={(e) => updateConfig(categoryId, { b2BucketName: e.target.value })}
                placeholder="my-bucket"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CDN URL (Optional)</label>
              <input
                type="text"
                value={config.b2CdnUrl || ''}
                onChange={(e) => updateConfig(categoryId, { b2CdnUrl: e.target.value })}
                placeholder="https://cdn.example.com"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Use with Cloudflare or Bunny.net CDN for best performance</p>
            </div>
          </div>
        );

      case 'wasabi':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bucket Name</label>
                <input
                  type="text"
                  value={config.wasabiBucket || ''}
                  onChange={(e) => updateConfig(categoryId, { wasabiBucket: e.target.value })}
                  placeholder="my-bucket"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Region</label>
                <select
                  value={config.wasabiRegion || 'us-east-1'}
                  onChange={(e) => updateConfig(categoryId, { wasabiRegion: e.target.value })}
                  className={inputClass}
                >
                  <option value="us-east-1">US East 1 (N. Virginia)</option>
                  <option value="us-east-2">US East 2 (N. Virginia)</option>
                  <option value="us-central-1">US Central 1 (Texas)</option>
                  <option value="us-west-1">US West 1 (Oregon)</option>
                  <option value="eu-central-1">EU Central 1 (Amsterdam)</option>
                  <option value="eu-central-2">EU Central 2 (Frankfurt)</option>
                  <option value="eu-west-1">EU West 1 (London)</option>
                  <option value="eu-west-2">EU West 2 (Paris)</option>
                  <option value="ap-northeast-1">AP Northeast 1 (Tokyo)</option>
                  <option value="ap-northeast-2">AP Northeast 2 (Osaka)</option>
                  <option value="ap-southeast-1">AP Southeast 1 (Singapore)</option>
                  <option value="ap-southeast-2">AP Southeast 2 (Sydney)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Access Key</label>
              <input
                type="text"
                value={config.wasabiAccessKey || ''}
                onChange={(e) => updateConfig(categoryId, { wasabiAccessKey: e.target.value })}
                placeholder="Wasabi access key"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets['wasabiSecretKey'] ? 'text' : 'password'}
                  value={config.wasabiSecretKey || ''}
                  onChange={(e) => updateConfig(categoryId, { wasabiSecretKey: e.target.value })}
                  placeholder="Wasabi secret key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('wasabiSecretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['wasabiSecretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'linode':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bucket Name</label>
                <input
                  type="text"
                  value={config.linodeBucket || ''}
                  onChange={(e) => updateConfig(categoryId, { linodeBucket: e.target.value })}
                  placeholder="my-bucket"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Cluster</label>
                <select
                  value={config.linodeCluster || 'us-east-1'}
                  onChange={(e) => updateConfig(categoryId, { linodeCluster: e.target.value })}
                  className={inputClass}
                >
                  <option value="us-east-1">Newark, NJ (us-east-1)</option>
                  <option value="eu-central-1">Frankfurt, DE (eu-central-1)</option>
                  <option value="ap-south-1">Singapore (ap-south-1)</option>
                  <option value="us-southeast-1">Atlanta, GA (us-southeast-1)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Access Key</label>
              <input
                type="text"
                value={config.linodeAccessKey || ''}
                onChange={(e) => updateConfig(categoryId, { linodeAccessKey: e.target.value })}
                placeholder="Linode access key"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets['linodeSecretKey'] ? 'text' : 'password'}
                  value={config.linodeSecretKey || ''}
                  onChange={(e) => updateConfig(categoryId, { linodeSecretKey: e.target.value })}
                  placeholder="Linode secret key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('linodeSecretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['linodeSecretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'vultr':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bucket Name</label>
                <input
                  type="text"
                  value={config.vultrBucket || ''}
                  onChange={(e) => updateConfig(categoryId, { vultrBucket: e.target.value })}
                  placeholder="my-bucket"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hostname</label>
                <input
                  type="text"
                  value={config.vultrHostname || ''}
                  onChange={(e) => updateConfig(categoryId, { vultrHostname: e.target.value })}
                  placeholder="ewr1.vultrobjects.com"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-500">e.g., ewr1, sjc1, ams1, sgp1</p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Access Key</label>
              <input
                type="text"
                value={config.vultrAccessKey || ''}
                onChange={(e) => updateConfig(categoryId, { vultrAccessKey: e.target.value })}
                placeholder="Vultr access key"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets['vultrSecretKey'] ? 'text' : 'password'}
                  value={config.vultrSecretKey || ''}
                  onChange={(e) => updateConfig(categoryId, { vultrSecretKey: e.target.value })}
                  placeholder="Vultr secret key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('vultrSecretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['vultrSecretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'bunny-storage':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Storage Zone Name</label>
                <input
                  type="text"
                  value={config.bunnyStorageZone || ''}
                  onChange={(e) => updateConfig(categoryId, { bunnyStorageZone: e.target.value })}
                  placeholder="my-storage-zone"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Region</label>
                <select
                  value={config.bunnyRegion || 'de'}
                  onChange={(e) => updateConfig(categoryId, { bunnyRegion: e.target.value })}
                  className={inputClass}
                >
                  <option value="de">Frankfurt (DE)</option>
                  <option value="ny">New York (NY)</option>
                  <option value="la">Los Angeles (LA)</option>
                  <option value="sg">Singapore (SG)</option>
                  <option value="syd">Sydney (SYD)</option>
                  <option value="uk">London (UK)</option>
                  <option value="se">Stockholm (SE)</option>
                  <option value="br">Sao Paulo (BR)</option>
                  <option value="jh">Johannesburg (JH)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>API Key (Password)</label>
              <div className="relative">
                <input
                  type={showSecrets['bunnyApiKey'] ? 'text' : 'password'}
                  value={config.bunnyApiKey || ''}
                  onChange={(e) => updateConfig(categoryId, { bunnyApiKey: e.target.value })}
                  placeholder="Storage zone password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('bunnyApiKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['bunnyApiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Found in Storage Zone &gt; FTP & API Access</p>
            </div>
            <div>
              <label className={labelClass}>Pull Zone URL (CDN)</label>
              <input
                type="text"
                value={config.bunnyPullZone || ''}
                onChange={(e) => updateConfig(categoryId, { bunnyPullZone: e.target.value })}
                placeholder="https://my-zone.b-cdn.net"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Connect a Pull Zone to your Storage Zone for CDN delivery</p>
            </div>
          </div>
        );

      case 'imagekit':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>URL Endpoint</label>
              <input
                type="text"
                value={config.imagekitUrlEndpoint || ''}
                onChange={(e) => updateConfig(categoryId, { imagekitUrlEndpoint: e.target.value })}
                placeholder="https://ik.imagekit.io/your_id"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Public Key</label>
              <input
                type="text"
                value={config.imagekitPublicKey || ''}
                onChange={(e) => updateConfig(categoryId, { imagekitPublicKey: e.target.value })}
                placeholder="public_xxxxxxxxxxxxx"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Private Key</label>
              <div className="relative">
                <input
                  type={showSecrets['imagekitPrivateKey'] ? 'text' : 'password'}
                  value={config.imagekitPrivateKey || ''}
                  onChange={(e) => updateConfig(categoryId, { imagekitPrivateKey: e.target.value })}
                  placeholder="private_xxxxxxxxxxxxx"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('imagekitPrivateKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['imagekitPrivateKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-300">
                ImageKit provides real-time image optimization, automatic format conversion, and responsive images with URL-based transformations.
              </p>
            </div>
          </div>
        );

      case 'cloudinary':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Cloud Name</label>
              <input
                type="text"
                value={config.cloudinaryCloudName || ''}
                onChange={(e) => updateConfig(categoryId, { cloudinaryCloudName: e.target.value })}
                placeholder="my-cloud"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <input
                type="text"
                value={config.cloudinaryApiKey || ''}
                onChange={(e) => updateConfig(categoryId, { cloudinaryApiKey: e.target.value })}
                placeholder="123456789012345"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>API Secret</label>
              <div className="relative">
                <input
                  type={showSecrets['cloudinaryApiSecret'] ? 'text' : 'password'}
                  value={config.cloudinaryApiSecret || ''}
                  onChange={(e) => updateConfig(categoryId, { cloudinaryApiSecret: e.target.value })}
                  placeholder="Cloudinary API secret"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('cloudinaryApiSecret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['cloudinaryApiSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Upload Preset (Optional)</label>
              <input
                type="text"
                value={config.cloudinaryUploadPreset || ''}
                onChange={(e) => updateConfig(categoryId, { cloudinaryUploadPreset: e.target.value })}
                placeholder="ml_default"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Create presets in Cloudinary Settings for upload options</p>
            </div>
          </div>
        );

      case 'imgix':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Domain</label>
              <input
                type="text"
                value={config.imgixDomain || ''}
                onChange={(e) => updateConfig(categoryId, { imgixDomain: e.target.value })}
                placeholder="my-source.imgix.net"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Source ID</label>
              <input
                type="text"
                value={config.imgixSourceId || ''}
                onChange={(e) => updateConfig(categoryId, { imgixSourceId: e.target.value })}
                placeholder="xxxxxxxxxxxxx"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secure URL Token (Optional)</label>
              <div className="relative">
                <input
                  type={showSecrets['imgixSecureUrlToken'] ? 'text' : 'password'}
                  value={config.imgixSecureUrlToken || ''}
                  onChange={(e) => updateConfig(categoryId, { imgixSecureUrlToken: e.target.value })}
                  placeholder="Secure URL token for signed URLs"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('imgixSecureUrlToken')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['imgixSecureUrlToken'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Enable URL signing to prevent hotlinking and unauthorized transformations</p>
            </div>
          </div>
        );

      case 'uploadcare':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Public Key</label>
              <input
                type="text"
                value={config.uploadcarePublicKey || ''}
                onChange={(e) => updateConfig(categoryId, { uploadcarePublicKey: e.target.value })}
                placeholder="demopublickey"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets['uploadcareSecretKey'] ? 'text' : 'password'}
                  value={config.uploadcareSecretKey || ''}
                  onChange={(e) => updateConfig(categoryId, { uploadcareSecretKey: e.target.value })}
                  placeholder="Uploadcare secret key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('uploadcareSecretKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['uploadcareSecretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>CDN Base URL (Optional)</label>
              <input
                type="text"
                value={config.uploadcareCdnBase || ''}
                onChange={(e) => updateConfig(categoryId, { uploadcareCdnBase: e.target.value })}
                placeholder="https://ucarecdn.com"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Custom CDN domain if configured</p>
            </div>
          </div>
        );

      case 'keycdn':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Zone ID</label>
              <input
                type="text"
                value={config.keycdnZoneId || ''}
                onChange={(e) => updateConfig(categoryId, { keycdnZoneId: e.target.value })}
                placeholder="12345"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <div className="relative">
                <input
                  type={showSecrets['keycdnApiKey'] ? 'text' : 'password'}
                  value={config.keycdnApiKey || ''}
                  onChange={(e) => updateConfig(categoryId, { keycdnApiKey: e.target.value })}
                  placeholder="KeyCDN API key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('keycdnApiKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['keycdnApiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Zone URL</label>
              <input
                type="text"
                value={config.keycdnZoneUrl || ''}
                onChange={(e) => updateConfig(categoryId, { keycdnZoneUrl: e.target.value })}
                placeholder="https://myzone-xxxx.kxcdn.com"
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'stackpath':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stack ID</label>
                <input
                  type="text"
                  value={config.stackpathStackId || ''}
                  onChange={(e) => updateConfig(categoryId, { stackpathStackId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Site ID</label>
                <input
                  type="text"
                  value={config.stackpathSiteId || ''}
                  onChange={(e) => updateConfig(categoryId, { stackpathSiteId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Client ID</label>
              <input
                type="text"
                value={config.stackpathClientId || ''}
                onChange={(e) => updateConfig(categoryId, { stackpathClientId: e.target.value })}
                placeholder="StackPath client ID"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Client Secret</label>
              <div className="relative">
                <input
                  type={showSecrets['stackpathClientSecret'] ? 'text' : 'password'}
                  value={config.stackpathClientSecret || ''}
                  onChange={(e) => updateConfig(categoryId, { stackpathClientSecret: e.target.value })}
                  placeholder="StackPath client secret"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('stackpathClientSecret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['stackpathClientSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'fastly':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Service ID</label>
              <input
                type="text"
                value={config.fastlyServiceId || ''}
                onChange={(e) => updateConfig(categoryId, { fastlyServiceId: e.target.value })}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <div className="relative">
                <input
                  type={showSecrets['fastlyApiKey'] ? 'text' : 'password'}
                  value={config.fastlyApiKey || ''}
                  onChange={(e) => updateConfig(categoryId, { fastlyApiKey: e.target.value })}
                  placeholder="Fastly API key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('fastlyApiKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['fastlyApiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Domain</label>
              <input
                type="text"
                value={config.fastlyDomain || ''}
                onChange={(e) => updateConfig(categoryId, { fastlyDomain: e.target.value })}
                placeholder="cdn.example.com"
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'akamai':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>NetStorage Host</label>
                <input
                  type="text"
                  value={config.akamaiHost || ''}
                  onChange={(e) => updateConfig(categoryId, { akamaiHost: e.target.value })}
                  placeholder="example-nsu.akamaihd.net"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>CP Code</label>
                <input
                  type="text"
                  value={config.akamaiCpCode || ''}
                  onChange={(e) => updateConfig(categoryId, { akamaiCpCode: e.target.value })}
                  placeholder="123456"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Key Name</label>
              <input
                type="text"
                value={config.akamaiKeyName || ''}
                onChange={(e) => updateConfig(categoryId, { akamaiKeyName: e.target.value })}
                placeholder="upload-key"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Key</label>
              <div className="relative">
                <input
                  type={showSecrets['akamaiKey'] ? 'text' : 'password'}
                  value={config.akamaiKey || ''}
                  onChange={(e) => updateConfig(categoryId, { akamaiKey: e.target.value })}
                  placeholder="Akamai NetStorage key"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('akamaiKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets['akamaiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>CDN Domain</label>
              <input
                type="text"
                value={config.akamaiCdnDomain || ''}
                onChange={(e) => updateConfig(categoryId, { akamaiCdnDomain: e.target.value })}
                placeholder="cdn.example.com"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-500">Your Akamai Edge hostname for content delivery</p>
            </div>
          </div>
        );

      default:
        // For providers without specific config, show a generic message
        return (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-200">
              Configuration for {findProvider(config.provider)?.name} will be available soon.
              Please contact support if you need this provider immediately.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Storage Configuration</h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure where your content is stored. Each category can use a different storage backend.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className={activeCategory === category.id ? 'text-blue-400' : 'text-gray-500'}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{category.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {findProvider(category.config.provider)?.name}
                </div>
              </div>
              {testResults[category.id] === 'success' && (
                <Check className="w-4 h-4 text-green-400" />
              )}
              {testResults[category.id] === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </button>
          ))}
        </div>

        {/* Configuration Panel */}
        {activeConfig && (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Category Header */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-700/50 rounded-lg text-gray-300">
                  {activeConfig.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{activeConfig.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{activeConfig.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Enabled</span>
                  <button
                    onClick={() => updateConfig(activeCategory, { enabled: !activeConfig.config.enabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      activeConfig.config.enabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        activeConfig.config.enabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Selection */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-300">Storage Provider</h4>
                {activeCategory === 'assets' && (
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    20+ CDN providers available
                  </span>
                )}
              </div>
              <div className={`grid gap-3 ${activeCategory === 'assets' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}>
                {getProvidersForCategory(activeCategory).map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => updateConfig(activeCategory, { provider: provider.id })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      activeConfig.config.provider === provider.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    {provider.icon}
                    <span className="text-xs font-medium text-center leading-tight">{provider.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                {findProvider(activeConfig.config.provider)?.description}
              </p>
            </div>

            {/* Provider Configuration */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h4 className="text-sm font-medium text-gray-300 mb-4">
                {findProvider(activeConfig.config.provider)?.name} Configuration
              </h4>
              {renderProviderConfig(activeConfig.config, activeCategory)}
            </div>

            {/* Test Connection */}
            <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                {testResults[activeCategory] === 'success' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Connection successful</span>
                  </div>
                )}
                {testResults[activeCategory] === 'error' && (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connection failed - check your settings</span>
                  </div>
                )}
                {!testResults[activeCategory] && (
                  <span className="text-sm text-gray-400">Test your connection settings before saving</span>
                )}
              </div>
              <button
                onClick={() => testConnection(activeCategory)}
                disabled={testingConnection === activeCategory}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                {testingConnection === activeCategory ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                {testingConnection === activeCategory ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Media Migration - Only for Assets */}
            {activeCategory === 'assets' && (
              <MediaMigrationPanel
                currentProvider={activeConfig.config.provider}
                onMigrate={(direction) => console.log('Migrating:', direction)}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StorageSettings;
