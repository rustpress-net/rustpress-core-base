import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// FEATURED IMAGE - Component 15
// Featured image picker with preview, focal point, and social previews
// ============================================================================

// Types
export interface FeaturedImageData {
  id?: string;
  url: string;
  alt?: string;
  caption?: string;
  focalPoint?: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface FeaturedImageConfig {
  showFocalPoint?: boolean;
  showSocialPreviews?: boolean;
  showAltInput?: boolean;
  showCaption?: boolean;
  aspectRatio?: number;
  recommendedSize?: { width: number; height: number };
}

interface FeaturedImageContextType {
  image: FeaturedImageData | null;
  config: FeaturedImageConfig;
  isPickerOpen: boolean;
  isFocalPointMode: boolean;
  setImage: (image: FeaturedImageData | null) => void;
  updateImage: (updates: Partial<FeaturedImageData>) => void;
  setFocalPoint: (point: { x: number; y: number }) => void;
  openPicker: () => void;
  closePicker: () => void;
  toggleFocalPointMode: () => void;
  clearImage: () => void;
}

const FeaturedImageContext = createContext<FeaturedImageContextType | null>(null);

export const useFeaturedImage = () => {
  const context = useContext(FeaturedImageContext);
  if (!context) {
    throw new Error('useFeaturedImage must be used within FeaturedImageProvider');
  }
  return context;
};

const defaultConfig: FeaturedImageConfig = {
  showFocalPoint: true,
  showSocialPreviews: true,
  showAltInput: true,
  showCaption: true,
  recommendedSize: { width: 1200, height: 630 },
};

// Provider
export interface FeaturedImageProviderProps {
  children: React.ReactNode;
  initialImage?: FeaturedImageData | null;
  config?: Partial<FeaturedImageConfig>;
  onChange?: (image: FeaturedImageData | null) => void;
}

export const FeaturedImageProvider: React.FC<FeaturedImageProviderProps> = ({
  children,
  initialImage = null,
  config: userConfig = {},
  onChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const [image, setImageState] = useState<FeaturedImageData | null>(initialImage);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFocalPointMode, setIsFocalPointMode] = useState(false);

  const setImage = useCallback((newImage: FeaturedImageData | null) => {
    setImageState(newImage);
    onChange?.(newImage);
  }, [onChange]);

  const updateImage = useCallback((updates: Partial<FeaturedImageData>) => {
    setImageState(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const setFocalPoint = useCallback((point: { x: number; y: number }) => {
    updateImage({ focalPoint: point });
  }, [updateImage]);

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);
  const toggleFocalPointMode = useCallback(() => setIsFocalPointMode(prev => !prev), []);

  const clearImage = useCallback(() => {
    setImage(null);
    setIsFocalPointMode(false);
  }, [setImage]);

  const value: FeaturedImageContextType = {
    image,
    config,
    isPickerOpen,
    isFocalPointMode,
    setImage,
    updateImage,
    setFocalPoint,
    openPicker,
    closePicker,
    toggleFocalPointMode,
    clearImage,
  };

  return (
    <FeaturedImageContext.Provider value={value}>
      {children}
    </FeaturedImageContext.Provider>
  );
};

// Empty State / Upload Trigger
const EmptyState: React.FC = () => {
  const { openPicker, config } = useFeaturedImage();

  return (
    <motion.div
      whileHover={{ borderColor: '#3b82f6', backgroundColor: '#f0f9ff' }}
      onClick={openPicker}
      style={{
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 12px',
          borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
        Set Featured Image
      </p>
      <p style={{ fontSize: '12px', color: '#6b7280' }}>
        Recommended: {config.recommendedSize?.width}×{config.recommendedSize?.height}px
      </p>
    </motion.div>
  );
};

// Image Preview with Actions
export const ImagePreview: React.FC = () => {
  const { image, isFocalPointMode, setFocalPoint, toggleFocalPointMode, clearImage, openPicker, config } = useFeaturedImage();

  if (!image) return <EmptyState />;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFocalPointMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setFocalPoint({ x, y });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Image Container */}
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: isFocalPointMode ? 'crosshair' : 'default',
        }}
      >
        {/* Placeholder Image */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #4b5563, #374151)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>

        {/* Focal Point Indicator */}
        {config.showFocalPoint && image.focalPoint && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              left: `${image.focalPoint.x}%`,
              top: `${image.focalPoint.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '3px solid #fff',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Focal Point Mode Overlay */}
        {isFocalPointMode && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
              Click to set focal point
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '6px',
        }}
      >
        {config.showFocalPoint && (
          <button
            onClick={toggleFocalPointMode}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isFocalPointMode ? '#3b82f6' : 'rgba(0,0,0,0.6)',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Focal Point
          </button>
        )}
        <button
          onClick={openPicker}
          style={{
            padding: '6px 10px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Replace
        </button>
        <button
          onClick={clearImage}
          style={{
            padding: '6px 10px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'rgba(220, 38, 38, 0.8)',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

// Alt Text Input
export const AltTextInput: React.FC = () => {
  const { image, updateImage, config } = useFeaturedImage();

  if (!config.showAltInput || !image) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px' }}>
        Alt Text
      </label>
      <input
        type="text"
        value={image.alt || ''}
        onChange={(e) => updateImage({ alt: e.target.value })}
        placeholder="Describe this image for accessibility..."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '14px',
        }}
      />
    </div>
  );
};

// Social Preview Cards
export const SocialPreviews: React.FC = () => {
  const { image, config } = useFeaturedImage();

  if (!config.showSocialPreviews || !image) return null;

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '12px' }}>
        Social Media Preview
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Twitter Preview */}
        <div
          style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100px',
              backgroundColor: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <div style={{ padding: '8px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>example.com</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Post Title</div>
          </div>
        </div>

        {/* Facebook Preview */}
        <div
          style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100px',
              backgroundColor: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#f3f4f6' }}>
            <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>example.com</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Post Title</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Picker Modal
export const ImagePickerModal: React.FC<{
  onSelect?: (image: FeaturedImageData) => void;
}> = ({ onSelect }) => {
  const { isPickerOpen, closePicker, setImage } = useFeaturedImage();

  if (!isPickerOpen) return null;

  const handleSelect = () => {
    const selectedImage: FeaturedImageData = {
      id: 'selected-1',
      url: '/images/featured.jpg',
      alt: 'Selected featured image',
      focalPoint: { x: 50, y: 50 },
    };
    setImage(selectedImage);
    onSelect?.(selectedImage);
    closePicker();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closePicker}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
            Select Featured Image
          </span>
          <button
            onClick={closePicker}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              onClick={handleSelect}
              style={{
                aspectRatio: '16/9',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={closePicker}
            style={{
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Select Image
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Compact Featured Image Widget (for sidebar)
export const FeaturedImageWidget: React.FC = () => {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
          Featured Image
        </span>
      </div>
      <ImagePreview />
      <AltTextInput />
    </div>
  );
};

// Main Featured Image Component
export const FeaturedImage: React.FC<{
  showSocialPreviews?: boolean;
  onSelect?: (image: FeaturedImageData) => void;
}> = ({ showSocialPreviews = true, onSelect }) => {
  const { isPickerOpen } = useFeaturedImage();

  return (
    <div>
      <ImagePreview />
      <AltTextInput />
      {showSocialPreviews && <SocialPreviews />}

      <AnimatePresence>
        {isPickerOpen && <ImagePickerModal onSelect={onSelect} />}
      </AnimatePresence>
    </div>
  );
};

export default FeaturedImage;
