/**
 * Media & Assets Demo Page
 *
 * Showcases all Media & Assets enhancement components (11-20)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Import all Media & Assets components
import {
  MediaBrowserProvider,
  MediaBrowser,
  useMediaBrowser,
  BrowserToolbar,
  BrowserGrid,
  QuickInsertButton,
} from '../../design-system/components/MediaBrowser';

import {
  ImageCropperProvider,
  ImageCropper,
  useImageCropper,
  AspectRatioSelector,
  TransformControls,
  FilterControls,
  QuickCropButton,
} from '../../design-system/components/ImageCropper';

import {
  UploadWidgetProvider,
  UploadWidget,
  useUploadWidget,
  UploadDropzone,
  UploadFileList,
  InlineUploadButton,
} from '../../design-system/components/UploadWidget';

import {
  GalleryBlockProvider,
  GalleryBlock,
  useGalleryBlock,
  LayoutSelector,
  GallerySettings,
  AddImagesButton,
} from '../../design-system/components/GalleryBlock';

import {
  FeaturedImageProvider,
  FeaturedImage,
  useFeaturedImage,
  SocialPreviews,
  FeaturedImageWidget,
} from '../../design-system/components/FeaturedImage';

import {
  ImageOptimizerProvider,
  ImageOptimizer,
  useImageOptimizer,
  PresetSelector,
  QualitySlider,
  FormatSelector,
  OptimizeButton,
} from '../../design-system/components/ImageOptimizer';

import {
  AltTextAIProvider,
  AltTextAI,
  useAltTextAI,
  GenerateButton,
  SuggestionsList,
  AnalysisDisplay,
} from '../../design-system/components/AltTextAI';

import {
  MediaTagsProvider,
  MediaTags,
  useMediaTags,
  SelectedTags,
  CollectionsList,
  CreateCollectionForm,
} from '../../design-system/components/MediaTags';

import {
  EmbedManagerProvider,
  EmbedManager,
  useEmbedManager,
  EmbedUrlInput,
  ProviderSelector,
  EmbedsList,
} from '../../design-system/components/EmbedManager';

import {
  FileManagerProvider,
  FileManager,
  useFileManager,
  FileToolbar,
  FileList,
  FileUploadArea,
} from '../../design-system/components/FileManager';

// Demo Section Component
const DemoSection: React.FC<{
  title: string;
  description: string;
  componentNumber: number;
  children: React.ReactNode;
}> = ({ title, description, componentNumber, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: componentNumber * 0.05 }}
    className="mb-12"
  >
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white text-sm font-bold rounded-full">
        {componentNumber}
      </span>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {children}
    </div>
  </motion.section>
);

// Sample data
const sampleMediaItems = [
  {
    id: '1',
    name: 'hero-image.jpg',
    type: 'image' as const,
    url: 'https://picsum.photos/800/600?random=1',
    thumbnail: 'https://picsum.photos/200/150?random=1',
    size: 245000,
    dimensions: { width: 800, height: 600 },
    uploadedAt: new Date('2024-01-15'),
    uploadedBy: 'John Doe',
    alt: 'Hero image for blog post',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'product-photo.png',
    type: 'image' as const,
    url: 'https://picsum.photos/1200/800?random=2',
    thumbnail: 'https://picsum.photos/200/133?random=2',
    size: 512000,
    dimensions: { width: 1200, height: 800 },
    uploadedAt: new Date('2024-01-14'),
    uploadedBy: 'Jane Smith',
    alt: 'Product showcase',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'team-photo.jpg',
    type: 'image' as const,
    url: 'https://picsum.photos/1000/667?random=3',
    thumbnail: 'https://picsum.photos/200/133?random=3',
    size: 380000,
    dimensions: { width: 1000, height: 667 },
    uploadedAt: new Date('2024-01-13'),
    uploadedBy: 'Mike Johnson',
    alt: 'Team photo',
    isFavorite: true,
  },
];

const sampleGalleryImages = [
  {
    id: '1',
    src: 'https://picsum.photos/800/600?random=10',
    alt: 'Gallery image 1',
    caption: 'Beautiful landscape view',
  },
  {
    id: '2',
    src: 'https://picsum.photos/800/600?random=11',
    alt: 'Gallery image 2',
    caption: 'Urban architecture',
  },
  {
    id: '3',
    src: 'https://picsum.photos/800/600?random=12',
    alt: 'Gallery image 3',
    caption: 'Nature close-up',
  },
  {
    id: '4',
    src: 'https://picsum.photos/800/600?random=13',
    alt: 'Gallery image 4',
    caption: 'Sunset over the ocean',
  },
];

const sampleFileAttachments = [
  {
    id: '1',
    name: 'project-proposal.pdf',
    originalName: 'project-proposal.pdf',
    size: 2500000,
    type: 'document',
    mimeType: 'application/pdf',
    extension: 'pdf',
    url: '#',
    downloadUrl: '#',
    uploadedAt: new Date('2024-01-15'),
    uploadedBy: 'John Doe',
    category: 'documents',
    description: 'Q1 2024 project proposal document',
  },
  {
    id: '2',
    name: 'budget-2024.xlsx',
    originalName: 'budget-2024.xlsx',
    size: 150000,
    type: 'spreadsheet',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    url: '#',
    downloadUrl: '#',
    uploadedAt: new Date('2024-01-14'),
    uploadedBy: 'Jane Smith',
    category: 'spreadsheets',
  },
  {
    id: '3',
    name: 'presentation.pptx',
    originalName: 'presentation.pptx',
    size: 5200000,
    type: 'presentation',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: 'pptx',
    url: '#',
    downloadUrl: '#',
    uploadedAt: new Date('2024-01-13'),
    uploadedBy: 'Mike Johnson',
    category: 'presentations',
  },
];

// Individual Demo Components
const MediaBrowserDemo: React.FC = () => {
  return (
    <MediaBrowserProvider
      initialMedia={sampleMediaItems}
      onMediaSelect={(items) => console.log('Selected:', items)}
    >
      <div className="h-96">
        <MediaBrowser />
      </div>
    </MediaBrowserProvider>
  );
};

const ImageCropperDemo: React.FC = () => {
  return (
    <ImageCropperProvider
      initialImage="https://picsum.photos/800/600?random=20"
      onCropComplete={(crop) => console.log('Crop complete:', crop)}
    >
      <div className="h-96">
        <ImageCropper />
      </div>
    </ImageCropperProvider>
  );
};

const UploadWidgetDemo: React.FC = () => {
  return (
    <UploadWidgetProvider
      onFilesAdded={(files) => console.log('Files added:', files)}
      onUploadComplete={(files) => console.log('Upload complete:', files)}
      config={{ maxFileSize: 10 * 1024 * 1024 }}
    >
      <div className="p-6">
        <UploadWidget />
      </div>
    </UploadWidgetProvider>
  );
};

const GalleryBlockDemo: React.FC = () => {
  return (
    <GalleryBlockProvider
      initialImages={sampleGalleryImages}
      onGalleryChange={(images) => console.log('Gallery changed:', images)}
    >
      <div className="p-6">
        <GalleryBlock />
      </div>
    </GalleryBlockProvider>
  );
};

const FeaturedImageDemo: React.FC = () => {
  return (
    <FeaturedImageProvider
      initialImage={{
        id: '1',
        src: 'https://picsum.photos/1200/630?random=30',
        alt: 'Featured blog post image',
        focalPoint: { x: 50, y: 50 },
      }}
      onImageChange={(image) => console.log('Featured image changed:', image)}
    >
      <div className="p-6">
        <FeaturedImage />
      </div>
    </FeaturedImageProvider>
  );
};

const ImageOptimizerDemo: React.FC = () => {
  return (
    <ImageOptimizerProvider
      initialImage={{
        src: 'https://picsum.photos/1920/1080?random=40',
        width: 1920,
        height: 1080,
        size: 2500000,
        format: 'jpeg',
      }}
      onOptimize={(result) => console.log('Optimization result:', result)}
    >
      <div className="p-6">
        <ImageOptimizer />
      </div>
    </ImageOptimizerProvider>
  );
};

const AltTextAIDemo: React.FC = () => {
  return (
    <AltTextAIProvider
      initialImage={{
        src: 'https://picsum.photos/800/600?random=50',
        currentAlt: '',
      }}
      onAltTextChange={(altText) => console.log('Alt text changed:', altText)}
    >
      <div className="p-6">
        <AltTextAI />
      </div>
    </AltTextAIProvider>
  );
};

const MediaTagsDemo: React.FC = () => {
  return (
    <MediaTagsProvider
      initialTags={[
        { id: '1', name: 'Marketing', color: '#3B82F6', count: 24 },
        { id: '2', name: 'Product', color: '#10B981', count: 18 },
        { id: '3', name: 'Blog', color: '#F59E0B', count: 35 },
      ]}
      initialCollections={[
        { id: '1', name: 'Brand Assets', description: 'Official brand images', itemCount: 45, coverImage: 'https://picsum.photos/200/150?random=60' },
        { id: '2', name: 'Product Photos', description: 'Product showcase images', itemCount: 128, coverImage: 'https://picsum.photos/200/150?random=61' },
      ]}
      onTagsChange={(tags) => console.log('Tags changed:', tags)}
    >
      <div className="p-6">
        <MediaTags />
      </div>
    </MediaTagsProvider>
  );
};

const EmbedManagerDemo: React.FC = () => {
  return (
    <EmbedManagerProvider
      initialEmbeds={[
        {
          id: '1',
          provider: 'youtube',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Sample YouTube Video',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        },
        {
          id: '2',
          provider: 'twitter',
          url: 'https://twitter.com/example/status/123456789',
          title: 'Sample Tweet',
        },
      ]}
      onEmbedsChange={(embeds) => console.log('Embeds changed:', embeds)}
    >
      <div className="p-6">
        <EmbedManager />
      </div>
    </EmbedManagerProvider>
  );
};

const FileManagerDemo: React.FC = () => {
  return (
    <FileManagerProvider
      initialFiles={sampleFileAttachments}
      onFilesChange={(files) => console.log('Files changed:', files)}
      onDownload={(file) => console.log('Download:', file)}
    >
      <div className="h-96">
        <FileManager />
      </div>
    </FileManagerProvider>
  );
};

// Compact Demos for Overview
const CompactMediaBrowser: React.FC = () => (
  <MediaBrowserProvider initialMedia={sampleMediaItems.slice(0, 2)}>
    <div className="p-4">
      <BrowserToolbar />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {sampleMediaItems.slice(0, 2).map((item) => (
          <div key={item.id} className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img src={item.thumbnail} alt={item.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <QuickInsertButton />
      </div>
    </div>
  </MediaBrowserProvider>
);

const CompactImageCropper: React.FC = () => (
  <ImageCropperProvider initialImage="https://picsum.photos/400/300?random=100">
    <div className="p-4">
      <AspectRatioSelector className="mb-4" />
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
        <img src="https://picsum.photos/400/300?random=100" alt="Sample" className="w-full h-full object-cover" />
      </div>
      <div className="flex gap-2">
        <QuickCropButton />
      </div>
    </div>
  </ImageCropperProvider>
);

const CompactUploadWidget: React.FC = () => (
  <UploadWidgetProvider>
    <div className="p-4">
      <UploadDropzone className="h-32" />
      <div className="mt-4">
        <InlineUploadButton />
      </div>
    </div>
  </UploadWidgetProvider>
);

const CompactGalleryBlock: React.FC = () => (
  <GalleryBlockProvider initialImages={sampleGalleryImages.slice(0, 3)}>
    <div className="p-4">
      <LayoutSelector className="mb-4" />
      <div className="grid grid-cols-3 gap-2">
        {sampleGalleryImages.slice(0, 3).map((img) => (
          <div key={img.id} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <AddImagesButton />
      </div>
    </div>
  </GalleryBlockProvider>
);

const CompactFeaturedImage: React.FC = () => (
  <FeaturedImageProvider
    initialImage={{
      id: '1',
      src: 'https://picsum.photos/600/315?random=110',
      alt: 'Featured image',
      focalPoint: { x: 50, y: 50 },
    }}
  >
    <div className="p-4">
      <FeaturedImageWidget />
    </div>
  </FeaturedImageProvider>
);

const CompactImageOptimizer: React.FC = () => (
  <ImageOptimizerProvider
    initialImage={{
      src: 'https://picsum.photos/800/600?random=120',
      width: 800,
      height: 600,
      size: 500000,
      format: 'jpeg',
    }}
  >
    <div className="p-4">
      <PresetSelector className="mb-4" />
      <QualitySlider className="mb-4" />
      <FormatSelector className="mb-4" />
      <OptimizeButton className="w-full" />
    </div>
  </ImageOptimizerProvider>
);

const CompactAltTextAI: React.FC = () => (
  <AltTextAIProvider
    initialImage={{
      src: 'https://picsum.photos/400/300?random=130',
      currentAlt: '',
    }}
  >
    <div className="p-4">
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
        <img src="https://picsum.photos/400/300?random=130" alt="Sample" className="w-full h-full object-cover" />
      </div>
      <GenerateButton className="w-full mb-4" />
      <SuggestionsList />
    </div>
  </AltTextAIProvider>
);

const CompactMediaTags: React.FC = () => (
  <MediaTagsProvider
    initialTags={[
      { id: '1', name: 'Marketing', color: '#3B82F6', count: 24 },
      { id: '2', name: 'Product', color: '#10B981', count: 18 },
    ]}
    initialCollections={[
      { id: '1', name: 'Brand Assets', itemCount: 45, coverImage: 'https://picsum.photos/200/150?random=140' },
    ]}
  >
    <div className="p-4">
      <SelectedTags className="mb-4" />
      <CollectionsList />
    </div>
  </MediaTagsProvider>
);

const CompactEmbedManager: React.FC = () => (
  <EmbedManagerProvider>
    <div className="p-4">
      <EmbedUrlInput className="mb-4" />
      <ProviderSelector className="mb-4" />
      <EmbedsList />
    </div>
  </EmbedManagerProvider>
);

const CompactFileManager: React.FC = () => (
  <FileManagerProvider initialFiles={sampleFileAttachments.slice(0, 2)}>
    <div className="p-4">
      <FileUploadArea className="mb-4" />
      <FileList />
    </div>
  </FileManagerProvider>
);

// Main Demo Page
export const MediaAssetsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                Components 11-20
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Media & Assets Enhancements</h1>
            <p className="text-xl text-purple-100 max-w-2xl">
              A comprehensive suite of media management components for the post editor,
              including image editing, galleries, uploads, and file attachments.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'detailed'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Detailed Demos
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'overview' ? (
          <>
            {/* Component Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* 11. Media Browser */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">11</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Media Browser</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enhanced media browser for post editor
                  </p>
                </div>
                <CompactMediaBrowser />
              </motion.div>

              {/* 12. Image Cropper */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">12</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Image Cropper</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Crop, resize, rotate, and filter controls
                  </p>
                </div>
                <CompactImageCropper />
              </motion.div>

              {/* 13. Upload Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">13</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Upload Widget</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Drag & drop upload with progress tracking
                  </p>
                </div>
                <CompactUploadWidget />
              </motion.div>

              {/* 14. Gallery Block */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">14</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Gallery Block</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Gallery creator with layout options
                  </p>
                </div>
                <CompactGalleryBlock />
              </motion.div>

              {/* 15. Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">15</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Featured Image</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Featured image picker with focal point
                  </p>
                </div>
                <CompactFeaturedImage />
              </motion.div>

              {/* 16. Image Optimizer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">16</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Image Optimizer</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Quality, format, and compression controls
                  </p>
                </div>
                <CompactImageOptimizer />
              </motion.div>

              {/* 17. Alt Text AI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">17</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Alt Text AI</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    AI-powered alt text suggestions
                  </p>
                </div>
                <CompactAltTextAI />
              </motion.div>

              {/* 18. Media Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">18</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Media Tags</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Tagging and collections system
                  </p>
                </div>
                <CompactMediaTags />
              </motion.div>

              {/* 19. Embed Manager */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">19</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Embed Manager</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    YouTube, Twitter, Instagram embeds
                  </p>
                </div>
                <CompactEmbedManager />
              </motion.div>

              {/* 20. File Manager */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">20</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">File Manager</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    File attachments with version history
                  </p>
                </div>
                <CompactFileManager />
              </motion.div>
            </div>

            {/* Feature Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Key Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Media Management</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>- Grid & list view modes</li>
                    <li>- Multi-select with bulk actions</li>
                    <li>- Search and filtering</li>
                    <li>- Favorites system</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Image Editing</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>- Crop with aspect ratios</li>
                    <li>- Rotate and flip</li>
                    <li>- Filter adjustments</li>
                    <li>- Quality optimization</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>- Auto alt text generation</li>
                    <li>- Image analysis</li>
                    <li>- Smart suggestions</li>
                    <li>- SEO optimization</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <DemoSection
              componentNumber={11}
              title="Media Browser"
              description="Enhanced media browser for the post editor with grid/list views, filtering, sorting, and multi-select support."
            >
              <MediaBrowserDemo />
            </DemoSection>

            <DemoSection
              componentNumber={12}
              title="Image Cropper"
              description="Full-featured image editor with crop, resize, rotate, flip, and filter capabilities."
            >
              <ImageCropperDemo />
            </DemoSection>

            <DemoSection
              componentNumber={13}
              title="Upload Widget"
              description="Drag & drop file upload with progress tracking, file validation, and retry support."
            >
              <UploadWidgetDemo />
            </DemoSection>

            <DemoSection
              componentNumber={14}
              title="Gallery Block"
              description="Gallery creator with grid, masonry, and carousel layouts, plus drag-to-reorder functionality."
            >
              <GalleryBlockDemo />
            </DemoSection>

            <DemoSection
              componentNumber={15}
              title="Featured Image"
              description="Featured image picker with focal point selection and social media preview cards."
            >
              <FeaturedImageDemo />
            </DemoSection>

            <DemoSection
              componentNumber={16}
              title="Image Optimizer"
              description="Image optimization settings with quality presets, format conversion, and resize controls."
            >
              <ImageOptimizerDemo />
            </DemoSection>

            <DemoSection
              componentNumber={17}
              title="Alt Text AI"
              description="AI-powered alt text generation with image analysis and multiple suggestion styles."
            >
              <AltTextAIDemo />
            </DemoSection>

            <DemoSection
              componentNumber={18}
              title="Media Tags"
              description="Media categorization with tags, collections, and organization features."
            >
              <MediaTagsDemo />
            </DemoSection>

            <DemoSection
              componentNumber={19}
              title="Embed Manager"
              description="Embed picker for external content from YouTube, Twitter, Instagram, Spotify, and more."
            >
              <EmbedManagerDemo />
            </DemoSection>

            <DemoSection
              componentNumber={20}
              title="File Manager"
              description="File attachment manager with document previews, download links, and version history."
            >
              <FileManagerDemo />
            </DemoSection>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaAssetsDemo;
