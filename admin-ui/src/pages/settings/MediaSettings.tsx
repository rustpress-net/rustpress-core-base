/**
 * Media Settings - Configure media handling and image processing
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image, Upload, Folder, Settings, Save, RefreshCw,
  Maximize, FileImage, Trash2, HardDrive, Zap, Shield
} from 'lucide-react';

interface MediaConfig {
  // Upload settings
  maxUploadSize: number;
  allowedTypes: string[];
  uploadPath: string;
  organizeByDate: boolean;

  // Image processing
  generateThumbnails: boolean;
  thumbnailSizes: { name: string; width: number; height: number; crop: boolean }[];
  imageQuality: number;
  convertToWebP: boolean;
  stripMetadata: boolean;
  lazyLoading: boolean;

  // Media library
  itemsPerPage: number;
  defaultView: 'grid' | 'list';
  showFileSizes: boolean;

  // Cleanup
  deleteUnusedMedia: boolean;
  unusedMediaDays: number;
}

const defaultConfig: MediaConfig = {
  maxUploadSize: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf'],
  uploadPath: '/wp-content/uploads',
  organizeByDate: true,
  generateThumbnails: true,
  thumbnailSizes: [
    { name: 'thumbnail', width: 150, height: 150, crop: true },
    { name: 'medium', width: 300, height: 300, crop: false },
    { name: 'medium_large', width: 768, height: 0, crop: false },
    { name: 'large', width: 1024, height: 1024, crop: false },
  ],
  imageQuality: 82,
  convertToWebP: true,
  stripMetadata: true,
  lazyLoading: true,
  itemsPerPage: 40,
  defaultView: 'grid',
  showFileSizes: true,
  deleteUnusedMedia: false,
  unusedMediaDays: 30,
};

const fileTypes = [
  { type: 'image/jpeg', label: 'JPEG Images', ext: '.jpg, .jpeg' },
  { type: 'image/png', label: 'PNG Images', ext: '.png' },
  { type: 'image/gif', label: 'GIF Images', ext: '.gif' },
  { type: 'image/webp', label: 'WebP Images', ext: '.webp' },
  { type: 'image/svg+xml', label: 'SVG Images', ext: '.svg' },
  { type: 'video/mp4', label: 'MP4 Videos', ext: '.mp4' },
  { type: 'video/webm', label: 'WebM Videos', ext: '.webm' },
  { type: 'application/pdf', label: 'PDF Documents', ext: '.pdf' },
  { type: 'audio/mpeg', label: 'MP3 Audio', ext: '.mp3' },
  { type: 'audio/wav', label: 'WAV Audio', ext: '.wav' },
];

export const MediaSettings: React.FC = () => {
  const [config, setConfig] = useState<MediaConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'images' | 'library' | 'cleanup'>('upload');

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const toggleFileType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      allowedTypes: prev.allowedTypes.includes(type)
        ? prev.allowedTypes.filter(t => t !== type)
        : [...prev.allowedTypes, type]
    }));
  };

  const updateThumbnailSize = (index: number, field: keyof typeof config.thumbnailSizes[0], value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      thumbnailSizes: prev.thumbnailSizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const addThumbnailSize = () => {
    setConfig(prev => ({
      ...prev,
      thumbnailSizes: [...prev.thumbnailSizes, { name: 'custom', width: 500, height: 500, crop: false }]
    }));
  };

  const removeThumbnailSize = (index: number) => {
    setConfig(prev => ({
      ...prev,
      thumbnailSizes: prev.thumbnailSizes.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'upload', label: 'Upload Settings', icon: Upload },
    { id: 'images', label: 'Image Processing', icon: FileImage },
    { id: 'library', label: 'Media Library', icon: Folder },
    { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Image className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Media Settings</h1>
            <p className="text-gray-400">Configure media uploads and image processing</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg text-white transition-colors"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Upload Settings */}
      {activeTab === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Upload Size (MB)
                </label>
                <input
                  type="number"
                  value={config.maxUploadSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxUploadSize: parseInt(e.target.value) || 0 }))}
                  min={1}
                  max={100}
                  className="w-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Server limit may override this value. Check your PHP/server configuration.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Path
                </label>
                <input
                  type="text"
                  value={config.uploadPath}
                  onChange={(e) => setConfig(prev => ({ ...prev, uploadPath: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.organizeByDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, organizeByDate: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500"
                />
                <div>
                  <span className="text-white font-medium">Organize uploads by date</span>
                  <p className="text-xs text-gray-400">Store files in year/month subdirectories</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Allowed File Types
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {fileTypes.map(ft => (
                <label
                  key={ft.type}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    config.allowedTypes.includes(ft.type)
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config.allowedTypes.includes(ft.type)}
                    onChange={() => toggleFileType(ft.type)}
                    className="sr-only"
                  />
                  <div>
                    <p className={`text-sm font-medium ${
                      config.allowedTypes.includes(ft.type) ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      {ft.label}
                    </p>
                    <p className="text-xs text-gray-500">{ft.ext}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Processing */}
      {activeTab === 'images' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Processing Options
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <span className="text-white font-medium">Convert to WebP</span>
                  <p className="text-xs text-gray-400">Automatically convert images to WebP format for better compression</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.convertToWebP}
                  onChange={(e) => setConfig(prev => ({ ...prev, convertToWebP: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <span className="text-white font-medium">Strip EXIF Metadata</span>
                  <p className="text-xs text-gray-400">Remove location and camera data from uploaded images</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.stripMetadata}
                  onChange={(e) => setConfig(prev => ({ ...prev, stripMetadata: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <span className="text-white font-medium">Lazy Loading</span>
                  <p className="text-xs text-gray-400">Add loading="lazy" attribute to images</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.lazyLoading}
                  onChange={(e) => setConfig(prev => ({ ...prev, lazyLoading: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500"
                />
              </label>

              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-medium">Image Quality</span>
                    <p className="text-xs text-gray-400">JPEG/WebP compression quality (1-100)</p>
                  </div>
                  <span className="text-xl font-bold text-orange-400">{config.imageQuality}%</span>
                </div>
                <input
                  type="range"
                  value={config.imageQuality}
                  onChange={(e) => setConfig(prev => ({ ...prev, imageQuality: parseInt(e.target.value) }))}
                  min={1}
                  max={100}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Smaller files</span>
                  <span>Better quality</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Maximize className="w-5 h-5 text-blue-400" />
                Thumbnail Sizes
              </h2>
              <button
                onClick={addThumbnailSize}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
              >
                Add Size
              </button>
            </div>

            <div className="space-y-3">
              {config.thumbnailSizes.map((size, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                >
                  <input
                    type="text"
                    value={size.name}
                    onChange={(e) => updateThumbnailSize(index, 'name', e.target.value)}
                    className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    placeholder="Name"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={size.width}
                      onChange={(e) => updateThumbnailSize(index, 'width', parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm text-center"
                      placeholder="Width"
                    />
                    <span className="text-gray-500">x</span>
                    <input
                      type="number"
                      value={size.height}
                      onChange={(e) => updateThumbnailSize(index, 'height', parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm text-center"
                      placeholder="Height"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={size.crop}
                      onChange={(e) => updateThumbnailSize(index, 'crop', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500"
                    />
                    <span className="text-sm text-gray-300">Crop</span>
                  </label>
                  <button
                    onClick={() => removeThumbnailSize(index)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Set height to 0 for proportional scaling. Crop will center-crop the image to exact dimensions.
            </p>
          </div>
        </motion.div>
      )}

      {/* Media Library */}
      {activeTab === 'library' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-yellow-400" />
              Library Display
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Items Per Page
                </label>
                <select
                  value={config.itemsPerPage}
                  onChange={(e) => setConfig(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                  className="w-48 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  {[20, 40, 60, 80, 100].map(n => (
                    <option key={n} value={n}>{n} items</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Default View
                </label>
                <div className="flex gap-3">
                  {['grid', 'list'].map(view => (
                    <button
                      key={view}
                      onClick={() => setConfig(prev => ({ ...prev, defaultView: view as 'grid' | 'list' }))}
                      className={`px-6 py-3 rounded-lg capitalize transition-colors ${
                        config.defaultView === view
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {view} View
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showFileSizes}
                  onChange={(e) => setConfig(prev => ({ ...prev, showFileSizes: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500"
                />
                <div>
                  <span className="text-white font-medium">Show file sizes</span>
                  <p className="text-xs text-gray-400">Display file size in media library grid</p>
                </div>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cleanup */}
      {activeTab === 'cleanup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Automatic Cleanup
            </h2>

            <div className="space-y-6">
              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <span className="text-white font-medium">Delete Unused Media</span>
                  <p className="text-xs text-gray-400">Automatically remove media files not attached to any content</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.deleteUnusedMedia}
                  onChange={(e) => setConfig(prev => ({ ...prev, deleteUnusedMedia: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500"
                />
              </label>

              {config.deleteUnusedMedia && (
                <div className="pl-4 border-l-2 border-orange-500/30">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delete after (days)
                  </label>
                  <input
                    type="number"
                    value={config.unusedMediaDays}
                    onChange={(e) => setConfig(prev => ({ ...prev, unusedMediaDays: parseInt(e.target.value) || 30 }))}
                    min={7}
                    max={365}
                    className="w-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Files unused for this many days will be permanently deleted
                  </p>
                </div>
              )}

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium">Storage Usage</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Total media: <span className="text-white">2,847 files</span> using <span className="text-white">4.2 GB</span>
                    </p>
                    <button className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm text-white transition-colors">
                      Scan for Unused Media
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MediaSettings;
