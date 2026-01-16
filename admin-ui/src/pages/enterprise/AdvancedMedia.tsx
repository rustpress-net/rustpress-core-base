/**
 * RustPress Advanced Media & Content Components Demo
 * Showcases enhancements 41-48: Media & Content components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Music,
  FolderOpen,
  Code2,
  FileText,
  GitCompare,
  FileSearch,
  ChevronDown,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Import all media components
import {
  ImageGallery,
  Lightbox,
  SimpleImageGrid,
  ImageCarousel,
} from '../../design-system/components/ImageGallery';
import type { GalleryImage } from '../../design-system/components/ImageGallery';

import {
  VideoPlayer,
  VideoThumbnail,
  VideoEmbed,
} from '../../design-system/components/VideoPlayer';

import {
  AudioPlayer,
  PlaylistPlayer,
  MiniPlayer,
} from '../../design-system/components/AudioPlayer';
import type { AudioTrack } from '../../design-system/components/AudioPlayer';

import {
  MediaLibrary,
  UploadDropzone,
  FilePicker,
} from '../../design-system/components/MediaLibrary';
import type { MediaFile, MediaFolder } from '../../design-system/components/MediaLibrary';

import {
  CodeBlock,
  InlineCode,
  CodeGroup,
  Terminal,
  CollapsibleCodeBlock,
} from '../../design-system/components/CodeBlock';

import {
  MarkdownPreview,
  MarkdownEditor,
  TableOfContents,
} from '../../design-system/components/MarkdownPreview';

import {
  DiffViewer,
  DiffStats,
  TextDiff,
  FileDiff,
} from '../../design-system/components/DiffViewer';

import {
  DocumentViewer,
  DocumentCard,
  DocumentList,
} from '../../design-system/components/DocumentViewer';

// ============================================================================
// Demo Section Component
// ============================================================================

interface DemoSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function DemoSection({ title, description, icon, children }: DemoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-neutral-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-neutral-200 dark:border-neutral-700 p-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

// Gallery Images
const sampleGalleryImages: GalleryImage[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200',
    alt: 'Mountain landscape',
    title: 'Mountain Vista',
    description: 'Beautiful mountain landscape at sunset',
    width: 1920,
    height: 1080,
    tags: ['nature', 'landscape'],
    favorite: true,
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
    alt: 'Alpine lake',
    title: 'Alpine Lake',
    description: 'Crystal clear alpine lake surrounded by mountains',
    width: 1920,
    height: 1280,
    tags: ['nature', 'water'],
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200',
    alt: 'Forest path',
    title: 'Forest Path',
    description: 'Misty morning in the forest',
    width: 1920,
    height: 1280,
    tags: ['nature', 'forest'],
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
    alt: 'Sunlight through trees',
    title: 'Golden Hour',
    description: 'Sunlight streaming through the trees',
    width: 1920,
    height: 1280,
    tags: ['nature', 'light'],
    favorite: true,
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200',
    alt: 'Foggy hills',
    title: 'Misty Mountains',
    description: 'Fog rolling over the hills at dawn',
    width: 1920,
    height: 1280,
    tags: ['nature', 'fog'],
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200',
    alt: 'River valley',
    title: 'River Valley',
    description: 'Winding river through a green valley',
    width: 1920,
    height: 1280,
    tags: ['nature', 'river'],
  },
];

// Audio Tracks
const sampleAudioTracks: AudioTrack[] = [
  {
    id: '1',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Ambient Journey',
    artist: 'RustPress Audio',
    album: 'Demo Tracks',
    duration: 210,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
    favorite: true,
  },
  {
    id: '2',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'Electronic Dreams',
    artist: 'RustPress Audio',
    album: 'Demo Tracks',
    duration: 185,
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
  },
  {
    id: '3',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    title: 'Sunset Vibes',
    artist: 'RustPress Audio',
    album: 'Demo Tracks',
    duration: 240,
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200',
  },
];

// Media Library Files
const sampleMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'hero-banner.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 245000,
    url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'product-demo.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 15000000,
    url: '#',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'presentation.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 3500000,
    url: '#',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    name: 'background-music.mp3',
    type: 'audio',
    mimeType: 'audio/mpeg',
    size: 4500000,
    url: '#',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    name: 'config.json',
    type: 'code',
    mimeType: 'application/json',
    size: 2500,
    url: '#',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    name: 'assets.zip',
    type: 'archive',
    mimeType: 'application/zip',
    size: 25000000,
    url: '#',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

const sampleMediaFolders: MediaFolder[] = [
  { id: 'images', name: 'Images', parentId: undefined, fileCount: 24 },
  { id: 'videos', name: 'Videos', parentId: undefined, fileCount: 8 },
  { id: 'documents', name: 'Documents', parentId: undefined, fileCount: 15 },
  { id: 'uploads-2024', name: '2024 Uploads', parentId: 'images', fileCount: 12 },
];

// Code Samples
const rustCode = `use axum::{routing::get, Router};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Build our application with routes
    let app = Router::new()
        .route("/", get(|| async { "Hello, RustPress!" }))
        .route("/api/posts", get(list_posts))
        .route("/api/posts/:id", get(get_post));

    // Run the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}`;

const typescriptCode = `interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
  tags: string[];
}

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch('/api/posts');
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  return (
    <div className="grid gap-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};`;

// Markdown Sample
const markdownSample = `# RustPress Documentation

Welcome to **RustPress**, the modern CMS built with Rust.

## Getting Started

To install RustPress, run:

\`\`\`bash
cargo install rustpress
rustpress init my-blog
\`\`\`

### Features

- **Blazing fast** performance
- **Secure** by default
- **Easy to use** admin interface

## Configuration

Edit \`rustpress.toml\`:

| Option | Description | Default |
|--------|-------------|---------|
| port | Server port | 3000 |
| debug | Debug mode | false |
| theme | Active theme | default |

> Note: Changes require a server restart.

## Links

- [Documentation](https://rustpress.dev/docs)
- [GitHub](https://github.com/rustpress)
`;

// Diff Sample
const oldCode = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

function formatPrice(price) {
  return '$' + price.toFixed(2);
}`;

const newCode = `function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

function calculateTax(total, rate = 0.08) {
  return total * rate;
}`;

// Documents
const sampleDocuments = [
  {
    id: '1',
    title: 'RustPress User Guide',
    type: 'pdf' as const,
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200',
    size: 2500000,
    pages: 45,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'API Documentation',
    type: 'pdf' as const,
    url: '#',
    size: 1200000,
    pages: 28,
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Release Notes v2.0',
    type: 'pdf' as const,
    url: '#',
    size: 450000,
    pages: 12,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ============================================================================
// Main Demo Component
// ============================================================================

export default function AdvancedMedia() {
  // Gallery state
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] = useState(sampleGalleryImages);

  // Audio state
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);

  // Media Library state
  const [mediaFiles, setMediaFiles] = useState(sampleMediaFiles);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Markdown state
  const [markdown, setMarkdown] = useState(markdownSample);

  // Document state
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Advanced Media & Content Components
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enterprise-grade media and content display components (Enhancements 41-48)
          </p>
        </div>

        {/* 41. Image Gallery */}
        <DemoSection
          title="41. Image Gallery"
          description="Grid/masonry layouts with lightbox, zoom, pan, and thumbnail navigation"
          icon={<ImageIcon className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Full Gallery */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Full Gallery with Lightbox
              </h3>
              <ImageGallery
                images={galleryImages}
                layout="grid"
                columns={3}
                gap={4}
                enableLightbox
                enableFavorite
                enableDownload
                onImageClick={(image) => setSelectedImage(image)}
                onFavorite={(id) => {
                  setGalleryImages((prev) =>
                    prev.map((img) =>
                      img.id === id ? { ...img, favorite: !img.favorite } : img
                    )
                  );
                }}
              />
            </div>

            {/* Simple Grid */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Simple Image Grid
              </h3>
              <SimpleImageGrid
                images={galleryImages.slice(0, 4)}
                columns={4}
                aspectRatio="square"
                rounded="lg"
              />
            </div>

            {/* Carousel */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Image Carousel
              </h3>
              <div className="max-w-2xl">
                <ImageCarousel
                  images={galleryImages}
                  autoPlay
                  autoPlayInterval={4000}
                  showThumbnails
                  showArrows
                  showDots
                />
              </div>
            </div>
          </div>

          {/* Lightbox */}
          {selectedImage && (
            <Lightbox
              images={galleryImages}
              currentImage={selectedImage}
              onClose={() => setSelectedImage(null)}
              onNavigate={(image) => setSelectedImage(image)}
              enableZoom
              enableDownload
            />
          )}
        </DemoSection>

        {/* 42. Video Player */}
        <DemoSection
          title="42. Video Player"
          description="Custom video player with controls, picture-in-picture, captions, and embeds"
          icon={<Video className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Main Video Player */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Full Video Player
              </h3>
              <div className="max-w-3xl">
                <VideoPlayer
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"
                  title="Big Buck Bunny"
                  showPlaybackSpeed
                  showPiP
                  aspectRatio="16:9"
                />
              </div>
            </div>

            {/* Video Thumbnails */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Video Thumbnails
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <VideoThumbnail
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"
                  title="Big Buck Bunny"
                  duration={596}
                  onClick={() => console.log('Video clicked')}
                />
                <VideoThumbnail
                  src="#"
                  poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400"
                  title="Behind the Scenes"
                  duration={245}
                  views={12500}
                  onClick={() => console.log('Video clicked')}
                />
                <VideoThumbnail
                  src="#"
                  poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400"
                  title="Product Demo"
                  duration={180}
                  isLive
                  onClick={() => console.log('Video clicked')}
                />
                <VideoThumbnail
                  src="#"
                  poster="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400"
                  title="Tutorial Video"
                  duration={420}
                  progress={65}
                  onClick={() => console.log('Video clicked')}
                />
              </div>
            </div>

            {/* Video Embed */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Video Embed (YouTube)
              </h3>
              <div className="max-w-2xl">
                <VideoEmbed
                  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  title="YouTube Video"
                  aspectRatio="16:9"
                />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 43. Audio Player */}
        <DemoSection
          title="43. Audio Player"
          description="Audio playback with waveform visualization, playlists, and mini player"
          icon={<Music className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Default Audio Player */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Default Audio Player
              </h3>
              <div className="max-w-xl">
                <AudioPlayer
                  track={sampleAudioTracks[0]}
                  variant="default"
                  showWaveform
                  onPlay={() => setCurrentTrack(sampleAudioTracks[0])}
                />
              </div>
            </div>

            {/* Card Variant */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Card Variant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleAudioTracks.map((track) => (
                  <AudioPlayer
                    key={track.id}
                    track={track}
                    variant="card"
                    onPlay={() => setCurrentTrack(track)}
                  />
                ))}
              </div>
            </div>

            {/* Playlist Player */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Playlist Player
              </h3>
              <div className="max-w-2xl">
                <PlaylistPlayer
                  tracks={sampleAudioTracks}
                  title="Demo Playlist"
                  showCover
                  enableShuffle
                  enableRepeat
                />
              </div>
            </div>

            {/* Mini Player */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Mini Player (Fixed Position Preview)
              </h3>
              <div className="relative h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <div className="absolute bottom-0 left-0 right-0">
                  <MiniPlayer
                    track={currentTrack || sampleAudioTracks[0]}
                    isPlaying={false}
                    onPlayPause={() => console.log('Play/Pause')}
                    onNext={() => console.log('Next')}
                    onPrevious={() => console.log('Previous')}
                  />
                </div>
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 44. Media Library */}
        <DemoSection
          title="44. Media Library"
          description="File browser with upload, folders, filtering, and multiple view modes"
          icon={<FolderOpen className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Full Media Library */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Media Library Browser
              </h3>
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <MediaLibrary
                  files={mediaFiles}
                  folders={sampleMediaFolders}
                  selectedFiles={selectedFiles}
                  onSelect={(ids) => setSelectedFiles(ids)}
                  onUpload={(files) => {
                    console.log('Upload files:', files);
                  }}
                  onDelete={(ids) => {
                    setMediaFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
                    setSelectedFiles([]);
                  }}
                  onMove={(fileIds, folderId) => {
                    console.log('Move files:', fileIds, 'to folder:', folderId);
                  }}
                  onCreateFolder={(name, parentId) => {
                    console.log('Create folder:', name, 'in:', parentId);
                  }}
                  enableMultiSelect
                />
              </div>
            </div>

            {/* Upload Dropzone */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Upload Dropzone
              </h3>
              <UploadDropzone
                onUpload={(files) => console.log('Uploaded:', files)}
                accept={['image/*', 'video/*', 'audio/*', '.pdf']}
                maxSize={50 * 1024 * 1024}
                maxFiles={10}
              />
            </div>

            {/* File Picker */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                File Picker (Compact)
              </h3>
              <FilePicker
                files={mediaFiles.filter((f) => f.type === 'image')}
                onSelect={(file) => console.log('Selected file:', file)}
                filterType="image"
              />
            </div>
          </div>
        </DemoSection>

        {/* 45. Code Block */}
        <DemoSection
          title="45. Code Block"
          description="Syntax highlighted code display with line numbers, copy, and terminal variant"
          icon={<Code2 className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Rust Code */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Rust Code with Line Numbers
              </h3>
              <CodeBlock
                code={rustCode}
                language="rust"
                showLineNumbers
                highlightLines={[8, 9, 10]}
                filename="src/main.rs"
              />
            </div>

            {/* TypeScript Code */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                TypeScript Code
              </h3>
              <CodeBlock
                code={typescriptCode}
                language="typescript"
                showLineNumbers
                theme="dark"
                filename="PostList.tsx"
              />
            </div>

            {/* Code Group */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Code Group (Tabbed)
              </h3>
              <CodeGroup
                tabs={[
                  { id: 'rust', label: 'Rust', code: rustCode, language: 'rust' },
                  { id: 'ts', label: 'TypeScript', code: typescriptCode, language: 'typescript' },
                  { id: 'json', label: 'Config', code: '{\n  "name": "rustpress",\n  "version": "1.0.0"\n}', language: 'json' },
                ]}
              />
            </div>

            {/* Terminal */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Terminal
              </h3>
              <Terminal
                lines={[
                  { content: '$ cargo build --release', type: 'command' },
                  { content: '   Compiling rustpress v1.0.0', type: 'output' },
                  { content: '   Compiling rustpress-core v0.1.0', type: 'output' },
                  { content: '    Finished release [optimized] target(s) in 2.34s', type: 'success' },
                  { content: '$ ./target/release/rustpress serve', type: 'command' },
                  { content: 'Server running on http://localhost:3000', type: 'success' },
                  { content: 'Warning: Debug mode is enabled', type: 'warning' },
                ]}
                title="Terminal"
              />
            </div>

            {/* Inline Code */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Inline Code
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Use the <InlineCode>cargo run</InlineCode> command to start the development server.
                You can also pass <InlineCode>--release</InlineCode> for optimized builds.
              </p>
            </div>

            {/* Collapsible Code */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Collapsible Code Block
              </h3>
              <CollapsibleCodeBlock
                code={rustCode}
                language="rust"
                title="Click to expand code"
                previewLines={5}
              />
            </div>
          </div>
        </DemoSection>

        {/* 46. Markdown Preview */}
        <DemoSection
          title="46. Markdown Preview"
          description="Live markdown rendering with editor, toolbar, and table of contents"
          icon={<FileText className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Markdown Preview */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Markdown Preview
              </h3>
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                <MarkdownPreview content={markdownSample} />
              </div>
            </div>

            {/* Markdown Editor */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Markdown Editor with Live Preview
              </h3>
              <MarkdownEditor
                value={markdown}
                onChange={setMarkdown}
                showToolbar
                showPreview
                minHeight={300}
              />
            </div>

            {/* Table of Contents */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Table of Contents
              </h3>
              <div className="max-w-xs">
                <TableOfContents
                  content={markdownSample}
                  maxDepth={3}
                />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 47. Diff Viewer */}
        <DemoSection
          title="47. Diff Viewer"
          description="Code/text diff comparison with split and unified views"
          icon={<GitCompare className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Split View */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Split View (Side by Side)
              </h3>
              <DiffViewer
                oldValue={oldCode}
                newValue={newCode}
                oldTitle="Original"
                newTitle="Modified"
                mode="split"
                language="javascript"
                showLineNumbers
              />
            </div>

            {/* Unified View */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Unified View
              </h3>
              <DiffViewer
                oldValue={oldCode}
                newValue={newCode}
                mode="unified"
                language="javascript"
                showLineNumbers
              />
            </div>

            {/* Diff Stats */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Diff Statistics
              </h3>
              <div className="flex items-center gap-4">
                <DiffStats
                  additions={12}
                  deletions={5}
                  modifications={3}
                />
              </div>
            </div>

            {/* Text Diff */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Simple Text Diff
              </h3>
              <TextDiff
                oldText="The quick brown fox jumps over the lazy dog."
                newText="The fast brown fox leaps over the sleepy dog."
              />
            </div>

            {/* File Diff */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                File Diff Header
              </h3>
              <FileDiff
                file={{
                  path: 'src/utils/calculate.js',
                  additions: 12,
                  deletions: 5,
                  status: 'modified',
                }}
                oldValue={oldCode}
                newValue={newCode}
                defaultExpanded
              />
            </div>
          </div>
        </DemoSection>

        {/* 48. Document Viewer */}
        <DemoSection
          title="48. Document Viewer"
          description="PDF and document preview with navigation, zoom, and thumbnails"
          icon={<FileSearch className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Document Viewer */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                PDF Document Viewer
              </h3>
              <div className="h-[500px] border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <DocumentViewer
                  src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
                  type="pdf"
                  title="Sample PDF Document"
                  showToolbar
                  showThumbnails
                  enableDownload
                  enablePrint
                  enableFullscreen
                />
              </div>
            </div>

            {/* Document Cards */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Document Cards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onClick={() => setSelectedDocument(doc.url)}
                    onDownload={() => console.log('Download:', doc.title)}
                  />
                ))}
              </div>
            </div>

            {/* Document List */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Document List
              </h3>
              <DocumentList
                documents={sampleDocuments}
                onSelect={(doc) => setSelectedDocument(doc.url)}
                onDownload={(doc) => console.log('Download:', doc.title)}
                onDelete={(doc) => console.log('Delete:', doc.title)}
              />
            </div>
          </div>
        </DemoSection>

        {/* Footer */}
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <p>RustPress Design System - Media & Content Components (41-48)</p>
        </div>
      </div>
    </div>
  );
}
