import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// GALLERY BLOCK - Component 14
// Gallery creator for posts with layout options, captions, and lightbox
// ============================================================================

// Types
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export type GalleryLayout = 'grid' | 'masonry' | 'carousel' | 'columns' | 'tiled';

export interface GalleryConfig {
  layout: GalleryLayout;
  columns: number;
  gap: number;
  cropImages: boolean;
  showCaptions: boolean;
  enableLightbox: boolean;
  aspectRatio?: number;
  linkTo: 'none' | 'media' | 'attachment' | 'custom';
}

interface GalleryBlockContextType {
  images: GalleryImage[];
  config: GalleryConfig;
  selectedImageId: string | null;
  lightboxIndex: number | null;
  addImages: (images: GalleryImage[]) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<GalleryImage>) => void;
  reorderImages: (images: GalleryImage[]) => void;
  setConfig: (config: Partial<GalleryConfig>) => void;
  selectImage: (id: string | null) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
}

const GalleryBlockContext = createContext<GalleryBlockContextType | null>(null);

export const useGalleryBlock = () => {
  const context = useContext(GalleryBlockContext);
  if (!context) {
    throw new Error('useGalleryBlock must be used within GalleryBlockProvider');
  }
  return context;
};

// Sample images
const sampleImages: GalleryImage[] = [
  { id: '1', url: '/images/1.jpg', alt: 'Mountain landscape', caption: 'Beautiful mountain view' },
  { id: '2', url: '/images/2.jpg', alt: 'Ocean sunset', caption: 'Sunset over the ocean' },
  { id: '3', url: '/images/3.jpg', alt: 'Forest path', caption: 'A peaceful forest trail' },
  { id: '4', url: '/images/4.jpg', alt: 'City skyline', caption: 'Downtown at night' },
];

const defaultConfig: GalleryConfig = {
  layout: 'grid',
  columns: 3,
  gap: 8,
  cropImages: true,
  showCaptions: true,
  enableLightbox: true,
  linkTo: 'media',
};

// Provider
export interface GalleryBlockProviderProps {
  children: React.ReactNode;
  initialImages?: GalleryImage[];
  initialConfig?: Partial<GalleryConfig>;
  onChange?: (images: GalleryImage[], config: GalleryConfig) => void;
}

export const GalleryBlockProvider: React.FC<GalleryBlockProviderProps> = ({
  children,
  initialImages = sampleImages,
  initialConfig = {},
  onChange,
}) => {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [config, setConfigState] = useState<GalleryConfig>({ ...defaultConfig, ...initialConfig });
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const addImages = useCallback((newImages: GalleryImage[]) => {
    setImages(prev => {
      const updated = [...prev, ...newImages];
      onChange?.(updated, config);
      return updated;
    });
  }, [config, onChange]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      onChange?.(updated, config);
      return updated;
    });
  }, [config, onChange]);

  const updateImage = useCallback((id: string, updates: Partial<GalleryImage>) => {
    setImages(prev => {
      const updated = prev.map(img => img.id === id ? { ...img, ...updates } : img);
      onChange?.(updated, config);
      return updated;
    });
  }, [config, onChange]);

  const reorderImages = useCallback((newOrder: GalleryImage[]) => {
    setImages(newOrder);
    onChange?.(newOrder, config);
  }, [config, onChange]);

  const setConfig = useCallback((updates: Partial<GalleryConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...updates };
      onChange?.(images, updated);
      return updated;
    });
  }, [images, onChange]);

  const selectImage = useCallback((id: string | null) => {
    setSelectedImageId(id);
  }, []);

  const openLightbox = useCallback((index: number) => {
    if (config.enableLightbox) {
      setLightboxIndex(index);
    }
  }, [config.enableLightbox]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const value: GalleryBlockContextType = {
    images,
    config,
    selectedImageId,
    lightboxIndex,
    addImages,
    removeImage,
    updateImage,
    reorderImages,
    setConfig,
    selectImage,
    openLightbox,
    closeLightbox,
  };

  return (
    <GalleryBlockContext.Provider value={value}>
      {children}
    </GalleryBlockContext.Provider>
  );
};

// Layout Selector
export const LayoutSelector: React.FC = () => {
  const { config, setConfig } = useGalleryBlock();

  const layouts: { value: GalleryLayout; label: string; icon: React.ReactNode }[] = [
    {
      value: 'grid',
      label: 'Grid',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      value: 'masonry',
      label: 'Masonry',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="10" />
          <rect x="14" y="3" width="7" height="6" />
          <rect x="3" y="16" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
        </svg>
      ),
    },
    {
      value: 'columns',
      label: 'Columns',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="5" height="18" />
          <rect x="10" y="3" width="5" height="18" />
          <rect x="17" y="3" width="5" height="18" />
        </svg>
      ),
    },
    {
      value: 'carousel',
      label: 'Carousel',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <path d="M2 8v8" />
          <path d="M22 8v8" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {layouts.map((layout) => (
        <button
          key={layout.value}
          onClick={() => setConfig({ layout: layout.value })}
          title={layout.label}
          style={{
            width: '40px',
            height: '40px',
            border: '1px solid',
            borderColor: config.layout === layout.value ? '#3b82f6' : '#e5e7eb',
            borderRadius: '8px',
            backgroundColor: config.layout === layout.value ? '#eff6ff' : '#fff',
            color: config.layout === layout.value ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {layout.icon}
        </button>
      ))}
    </div>
  );
};

// Gallery Settings
export const GallerySettings: React.FC = () => {
  const { config, setConfig } = useGalleryBlock();

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Layout
        </label>
        <LayoutSelector />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Columns: {config.columns}
        </label>
        <input
          type="range"
          min={1}
          max={6}
          value={config.columns}
          onChange={(e) => setConfig({ columns: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Gap: {config.gap}px
        </label>
        <input
          type="range"
          min={0}
          max={24}
          step={2}
          value={config.gap}
          onChange={(e) => setConfig({ gap: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.cropImages}
            onChange={(e) => setConfig({ cropImages: e.target.checked })}
          />
          Crop images to fit
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.showCaptions}
            onChange={(e) => setConfig({ showCaptions: e.target.checked })}
          />
          Show captions
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.enableLightbox}
            onChange={(e) => setConfig({ enableLightbox: e.target.checked })}
          />
          Enable lightbox
        </label>
      </div>
    </div>
  );
};

// Gallery Image Item
const GalleryItem: React.FC<{ image: GalleryImage; index: number }> = ({ image, index }) => {
  const { config, selectedImageId, selectImage, removeImage, openLightbox } = useGalleryBlock();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => selectImage(image.id)}
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: selectedImageId === image.id ? '3px solid #3b82f6' : '3px solid transparent',
        aspectRatio: config.cropImages ? '1' : 'auto',
      }}
    >
      {/* Image Placeholder */}
      <div
        style={{
          width: '100%',
          height: config.cropImages ? '100%' : '150px',
          background: `linear-gradient(135deg, #e5e7eb, #d1d5db)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onDoubleClick={() => openLightbox(index)}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      </div>

      {/* Caption */}
      {config.showCaptions && image.caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: '#fff',
            fontSize: '12px',
          }}
        >
          {image.caption}
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeImage(image.id);
        }}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Drag Handle */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="6" r="1" />
          <circle cx="15" cy="6" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="9" cy="18" r="1" />
          <circle cx="15" cy="18" r="1" />
        </svg>
      </div>
    </motion.div>
  );
};

// Gallery Grid
export const GalleryGrid: React.FC = () => {
  const { images, config, reorderImages } = useGalleryBlock();

  if (images.length === 0) {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #e5e7eb',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
          No images in gallery
        </p>
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>
          Click "Add Images" to get started
        </p>
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="x"
      values={images}
      onReorder={reorderImages}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
        gap: `${config.gap}px`,
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <AnimatePresence>
        {images.map((image, index) => (
          <Reorder.Item key={image.id} value={image} style={{ listStyle: 'none' }}>
            <GalleryItem image={image} index={index} />
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};

// Image Editor Sidebar
export const ImageEditor: React.FC = () => {
  const { images, selectedImageId, updateImage, selectImage } = useGalleryBlock();
  const selectedImage = images.find(img => img.id === selectedImageId);

  if (!selectedImage) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#6b7280',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <p style={{ marginTop: '12px', fontSize: '13px' }}>
          Select an image to edit
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
          Edit Image
        </span>
        <button
          onClick={() => selectImage(null)}
          style={{
            width: '24px',
            height: '24px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      </div>

      {/* Alt Text */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px' }}>
          Alt Text
        </label>
        <input
          type="text"
          value={selectedImage.alt || ''}
          onChange={(e) => updateImage(selectedImage.id, { alt: e.target.value })}
          placeholder="Describe this image..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Caption */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px' }}>
          Caption
        </label>
        <textarea
          value={selectedImage.caption || ''}
          onChange={(e) => updateImage(selectedImage.id, { caption: e.target.value })}
          placeholder="Add a caption..."
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
};

// Lightbox
export const GalleryLightbox: React.FC = () => {
  const { images, lightboxIndex, closeLightbox, config } = useGalleryBlock();

  if (lightboxIndex === null || !config.enableLightbox) return null;

  const currentImage = images[lightboxIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeLightbox}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '600px',
            height: '400px',
            background: 'linear-gradient(135deg, #374151, #4b5563)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>
      </motion.div>

      {/* Close Button */}
      <button
        onClick={closeLightbox}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          border: 'none',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Caption */}
      {config.showCaptions && currentImage?.caption && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {currentImage.caption}
        </div>
      )}

      {/* Navigation */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: '#fff',
          fontSize: '13px',
        }}
      >
        {lightboxIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
};

// Add Images Button
export const AddImagesButton: React.FC<{ onAddImages?: () => void }> = ({ onAddImages }) => {
  const { addImages } = useGalleryBlock();

  const handleClick = () => {
    if (onAddImages) {
      onAddImages();
    } else {
      // Demo: add sample images
      addImages([{
        id: `new-${Date.now()}`,
        url: '/images/new.jpg',
        alt: 'New image',
        caption: 'Newly added image',
      }]);
    }
  };

  return (
    <button
      onClick={handleClick}
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
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add Images
    </button>
  );
};

// Main Gallery Block Component
export const GalleryBlock: React.FC<{
  editable?: boolean;
  onAddImages?: () => void;
}> = ({ editable = true, onAddImages }) => {
  const { lightboxIndex } = useGalleryBlock();

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      {editable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Gallery</span>
          </div>
          <AddImagesButton onAddImages={onAddImages} />
        </div>
      )}

      <div style={{ display: 'flex' }}>
        {/* Gallery */}
        <div style={{ flex: 1, padding: '16px' }}>
          <GalleryGrid />
        </div>

        {/* Sidebar */}
        {editable && (
          <div style={{ width: '280px', borderLeft: '1px solid #e5e7eb' }}>
            <ImageEditor />
            <GallerySettings />
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && <GalleryLightbox />}
      </AnimatePresence>
    </div>
  );
};

export default GalleryBlock;
