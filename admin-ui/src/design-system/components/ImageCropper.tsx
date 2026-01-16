import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// IMAGE CROPPER - Component 12
// Advanced image editing with crop, resize, rotate, and filter controls
// ============================================================================

// Types
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageTransform {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

export interface AspectRatioPreset {
  label: string;
  value: number | null; // null = freeform
  icon?: React.ReactNode;
}

export interface ImageCropperConfig {
  aspectRatios?: AspectRatioPreset[];
  enableRotation?: boolean;
  enableFilters?: boolean;
  enableFlip?: boolean;
  enableZoom?: boolean;
  minCropWidth?: number;
  minCropHeight?: number;
  outputFormat?: 'jpeg' | 'png' | 'webp';
  outputQuality?: number;
}

interface ImageCropperContextType {
  imageUrl: string | null;
  originalDimensions: { width: number; height: number } | null;
  cropArea: CropArea;
  aspectRatio: number | null;
  transform: ImageTransform;
  zoom: number;
  isEditing: boolean;
  config: ImageCropperConfig;
  setImageUrl: (url: string) => void;
  setCropArea: (area: Partial<CropArea>) => void;
  setAspectRatio: (ratio: number | null) => void;
  setTransform: (transform: Partial<ImageTransform>) => void;
  setZoom: (zoom: number) => void;
  rotate: (degrees: number) => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  resetTransform: () => void;
  resetCrop: () => void;
  applyChanges: () => Promise<string>;
}

const ImageCropperContext = createContext<ImageCropperContextType | null>(null);

export const useImageCropper = () => {
  const context = useContext(ImageCropperContext);
  if (!context) {
    throw new Error('useImageCropper must be used within ImageCropperProvider');
  }
  return context;
};

// Default aspect ratio presets
const defaultAspectRatios: AspectRatioPreset[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
];

const defaultConfig: ImageCropperConfig = {
  aspectRatios: defaultAspectRatios,
  enableRotation: true,
  enableFilters: true,
  enableFlip: true,
  enableZoom: true,
  minCropWidth: 50,
  minCropHeight: 50,
  outputFormat: 'jpeg',
  outputQuality: 0.9,
};

const defaultTransform: ImageTransform = {
  rotation: 0,
  flipH: false,
  flipV: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};

// Provider
export interface ImageCropperProviderProps {
  children: React.ReactNode;
  initialImage?: string;
  config?: Partial<ImageCropperConfig>;
  onSave?: (dataUrl: string) => void;
}

export const ImageCropperProvider: React.FC<ImageCropperProviderProps> = ({
  children,
  initialImage,
  config: userConfig = {},
  onSave,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cropArea, setCropAreaState] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [transform, setTransformState] = useState<ImageTransform>(defaultTransform);
  const [zoom, setZoom] = useState(1);
  const [isEditing] = useState(true);

  // Load image dimensions
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setCropAreaState({ x: 0, y: 0, width: img.width, height: img.height });
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const setCropArea = useCallback((area: Partial<CropArea>) => {
    setCropAreaState(prev => ({ ...prev, ...area }));
  }, []);

  const setTransform = useCallback((newTransform: Partial<ImageTransform>) => {
    setTransformState(prev => ({ ...prev, ...newTransform }));
  }, []);

  const rotate = useCallback((degrees: number) => {
    setTransformState(prev => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360,
    }));
  }, []);

  const flipHorizontal = useCallback(() => {
    setTransformState(prev => ({ ...prev, flipH: !prev.flipH }));
  }, []);

  const flipVertical = useCallback(() => {
    setTransformState(prev => ({ ...prev, flipV: !prev.flipV }));
  }, []);

  const resetTransform = useCallback(() => {
    setTransformState(defaultTransform);
  }, []);

  const resetCrop = useCallback(() => {
    if (originalDimensions) {
      setCropAreaState({ x: 0, y: 0, width: originalDimensions.width, height: originalDimensions.height });
    }
    setZoom(1);
    setAspectRatio(null);
  }, [originalDimensions]);

  const applyChanges = useCallback(async (): Promise<string> => {
    // In a real implementation, this would use canvas to apply transformations
    // For demo purposes, return the original URL
    return imageUrl || '';
  }, [imageUrl]);

  const value: ImageCropperContextType = {
    imageUrl,
    originalDimensions,
    cropArea,
    aspectRatio,
    transform,
    zoom,
    isEditing,
    config,
    setImageUrl,
    setCropArea,
    setAspectRatio,
    setTransform,
    setZoom,
    rotate,
    flipHorizontal,
    flipVertical,
    resetTransform,
    resetCrop,
    applyChanges,
  };

  return (
    <ImageCropperContext.Provider value={value}>
      {children}
    </ImageCropperContext.Provider>
  );
};

// Toolbar Button Component
const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width: '36px',
      height: '36px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: active ? '#3b82f6' : 'transparent',
      color: active ? '#fff' : disabled ? '#d1d5db' : '#6b7280',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s',
    }}
  >
    {children}
  </button>
);

// Crop Canvas
export const CropCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const { imageUrl, cropArea, transform, zoom, setCropArea } = useImageCropper();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'move' | 'resize') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragType) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (dragType === 'move') {
      setCropArea({
        x: Math.max(0, cropArea.x + dx),
        y: Math.max(0, cropArea.y + dy),
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragType, dragStart, cropArea, setCropArea]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const imageFilter = `
    brightness(${transform.brightness}%)
    contrast(${transform.contrast}%)
    saturate(${transform.saturation}%)
    blur(${transform.blur}px)
  `;

  const imageTransform = `
    rotate(${transform.rotation}deg)
    scaleX(${transform.flipH ? -1 : 1})
    scaleY(${transform.flipV ? -1 : 1})
    scale(${zoom})
  `;

  if (!imageUrl) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          minHeight: '300px',
          color: '#9ca3af',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
          <p style={{ marginTop: '12px', fontSize: '14px' }}>No image loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image (dimmed) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.3,
        }}
      >
        <div
          style={{
            width: '80%',
            height: '80%',
            background: 'linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151), linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '60%',
              aspectRatio: '16/9',
              backgroundColor: '#4b5563',
              borderRadius: '4px',
              transform: imageTransform,
              filter: imageFilter,
            }}
          />
        </div>
      </div>

      {/* Crop Region */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        style={{
          position: 'relative',
          width: '60%',
          aspectRatio: '16/9',
          border: '2px solid #fff',
          borderRadius: '4px',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#4b5563',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          transform: imageTransform,
          filter: imageFilter,
        }}
      >
        {/* Corner Handles */}
        {['nw', 'ne', 'sw', 'se'].map((pos) => (
          <div
            key={pos}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              backgroundColor: '#fff',
              borderRadius: '2px',
              ...(pos.includes('n') ? { top: '-6px' } : { bottom: '-6px' }),
              ...(pos.includes('w') ? { left: '-6px' } : { right: '-6px' }),
              cursor: `${pos}-resize`,
            }}
          />
        ))}

        {/* Grid Lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Zoom Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          padding: '6px 12px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '13px',
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

// Aspect Ratio Selector
export const AspectRatioSelector: React.FC = () => {
  const { aspectRatio, setAspectRatio, config } = useImageCropper();
  const ratios = config.aspectRatios || defaultAspectRatios;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {ratios.map((preset) => (
        <button
          key={preset.label}
          onClick={() => setAspectRatio(preset.value)}
          style={{
            padding: '8px 14px',
            border: '1px solid',
            borderColor: aspectRatio === preset.value ? '#3b82f6' : '#e5e7eb',
            borderRadius: '6px',
            backgroundColor: aspectRatio === preset.value ? '#eff6ff' : '#fff',
            color: aspectRatio === preset.value ? '#3b82f6' : '#374151',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

// Transform Controls
export const TransformControls: React.FC = () => {
  const { rotate, flipHorizontal, flipVertical, resetTransform, config } = useImageCropper();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {config.enableRotation && (
        <>
          <ToolbarButton onClick={() => rotate(-90)} title="Rotate Left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 2v6h6" />
              <path d="M2.5 8C5 3 11 1 16.5 3.5S23 13 20.5 18.5 11 25 5.5 22.5" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => rotate(90)} title="Rotate Right">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6" />
              <path d="M21.5 8C19 3 13 1 7.5 3.5S1 13 3.5 18.5 13 25 18.5 22.5" />
            </svg>
          </ToolbarButton>
        </>
      )}

      {config.enableFlip && (
        <>
          <ToolbarButton onClick={flipHorizontal} title="Flip Horizontal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18" />
              <path d="M8 7l-4 5 4 5V7z" />
              <path d="M16 7l4 5-4 5V7z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={flipVertical} title="Flip Vertical">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18" />
              <path d="M7 8L12 4l5 4H7z" />
              <path d="M7 16l5 4 5-4H7z" />
            </svg>
          </ToolbarButton>
        </>
      )}

      <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />

      <ToolbarButton onClick={resetTransform} title="Reset">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </ToolbarButton>
    </div>
  );
};

// Filter Slider
const FilterSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, defaultValue, onChange }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontSize: '13px', color: '#374151' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#6b7280' }}>{value}%</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          height: '4px',
          borderRadius: '2px',
          appearance: 'none',
          backgroundColor: '#e5e7eb',
          cursor: 'pointer',
        }}
      />
      <button
        onClick={() => onChange(defaultValue)}
        style={{
          padding: '4px 8px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: value === defaultValue ? '#f3f4f6' : '#fff',
          fontSize: '11px',
          color: '#6b7280',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
    </div>
  </div>
);

// Filter Controls Panel
export const FilterControls: React.FC = () => {
  const { transform, setTransform, config } = useImageCropper();

  if (!config.enableFilters) return null;

  return (
    <div style={{ padding: '16px' }}>
      <FilterSlider
        label="Brightness"
        value={transform.brightness}
        min={0}
        max={200}
        defaultValue={100}
        onChange={(brightness) => setTransform({ brightness })}
      />
      <FilterSlider
        label="Contrast"
        value={transform.contrast}
        min={0}
        max={200}
        defaultValue={100}
        onChange={(contrast) => setTransform({ contrast })}
      />
      <FilterSlider
        label="Saturation"
        value={transform.saturation}
        min={0}
        max={200}
        defaultValue={100}
        onChange={(saturation) => setTransform({ saturation })}
      />
      <FilterSlider
        label="Blur"
        value={transform.blur}
        min={0}
        max={20}
        defaultValue={0}
        onChange={(blur) => setTransform({ blur })}
      />
    </div>
  );
};

// Zoom Controls
export const ZoomControls: React.FC = () => {
  const { zoom, setZoom, config } = useImageCropper();

  if (!config.enableZoom) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
        disabled={zoom <= 0.5}
        style={{
          width: '28px',
          height: '28px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: '#fff',
          cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <input
        type="range"
        min={0.5}
        max={3}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        style={{ width: '120px', cursor: 'pointer' }}
      />

      <button
        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
        disabled={zoom >= 3}
        style={{
          width: '28px',
          height: '28px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: '#fff',
          cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '45px', textAlign: 'center' }}>
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
};

// Main Editor Toolbar
export const CropperToolbar: React.FC = () => {
  const { resetCrop, resetTransform } = useImageCropper();

  return (
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <TransformControls />
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
        <ZoomControls />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => {
            resetCrop();
            resetTransform();
          }}
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
          Reset All
        </button>
      </div>
    </div>
  );
};

// Sidebar Panel
export const CropperSidebar: React.FC<{ activeTab?: 'crop' | 'adjust' }> = ({
  activeTab: initialTab = 'crop',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div
      style={{
        width: '280px',
        borderLeft: '1px solid #e5e7eb',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {[
          { id: 'crop', label: 'Crop' },
          { id: 'adjust', label: 'Adjust' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'crop' | 'adjust')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              backgroundColor: 'transparent',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'crop' && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
                Aspect Ratio
              </div>
              <AspectRatioSelector />
            </div>
          </div>
        )}

        {activeTab === 'adjust' && <FilterControls />}
      </div>
    </div>
  );
};

// Quick Crop Button (for inline use)
export const QuickCropButton: React.FC<{
  imageUrl: string;
  onSave: (dataUrl: string) => void;
}> = ({ imageUrl, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: '#fff',
          fontSize: '13px',
          color: '#6b7280',
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
          <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
        </svg>
        Crop
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
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
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'hidden',
              }}
            >
              <ImageCropperProvider initialImage={imageUrl} onSave={onSave}>
                <ImageCropper onSave={(url) => { onSave(url); setIsOpen(false); }} onCancel={() => setIsOpen(false)} />
              </ImageCropperProvider>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Main Image Cropper Component
export const ImageCropper: React.FC<{
  onSave?: (dataUrl: string) => void;
  onCancel?: () => void;
}> = ({ onSave, onCancel }) => {
  const { applyChanges } = useImageCropper();

  const handleSave = async () => {
    const result = await applyChanges();
    onSave?.(result);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fff',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
            <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
          </svg>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
            Edit Image
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onCancel && (
            <button
              onClick={onCancel}
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
          )}
          <button
            onClick={handleSave}
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
            Apply Changes
          </button>
        </div>
      </div>

      <CropperToolbar />

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '24px' }}>
          <CropCanvas />
        </div>
        <CropperSidebar />
      </div>
    </div>
  );
};

export default ImageCropper;
