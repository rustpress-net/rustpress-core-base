import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// IMAGE OPTIMIZER - Component 16
// Image optimization settings with quality, format, and compression controls
// ============================================================================

// Types
export interface ImageDimensions {
  width: number;
  height: number;
}

export type ImageFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

export interface OptimizationPreset {
  id: string;
  name: string;
  description: string;
  quality: number;
  format: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
}

export interface OptimizationSettings {
  quality: number;
  format: ImageFormat;
  resize: boolean;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  stripMetadata: boolean;
  progressive: boolean;
  lazyLoad: boolean;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  dimensions: ImageDimensions;
  format: ImageFormat;
}

interface ImageOptimizerContextType {
  settings: OptimizationSettings;
  presets: OptimizationPreset[];
  activePreset: string | null;
  isOptimizing: boolean;
  result: OptimizationResult | null;
  updateSettings: (updates: Partial<OptimizationSettings>) => void;
  applyPreset: (presetId: string) => void;
  optimize: () => Promise<OptimizationResult>;
  reset: () => void;
}

const ImageOptimizerContext = createContext<ImageOptimizerContextType | null>(null);

export const useImageOptimizer = () => {
  const context = useContext(ImageOptimizerContext);
  if (!context) {
    throw new Error('useImageOptimizer must be used within ImageOptimizerProvider');
  }
  return context;
};

const defaultSettings: OptimizationSettings = {
  quality: 80,
  format: 'webp',
  resize: false,
  maxWidth: 1920,
  maxHeight: 1080,
  maintainAspectRatio: true,
  stripMetadata: true,
  progressive: true,
  lazyLoad: true,
};

const defaultPresets: OptimizationPreset[] = [
  {
    id: 'web-high',
    name: 'Web High Quality',
    description: 'Best for hero images and galleries',
    quality: 85,
    format: 'webp',
    maxWidth: 1920,
  },
  {
    id: 'web-balanced',
    name: 'Web Balanced',
    description: 'Good quality with smaller file size',
    quality: 75,
    format: 'webp',
    maxWidth: 1200,
  },
  {
    id: 'web-fast',
    name: 'Web Fast Loading',
    description: 'Optimized for speed',
    quality: 60,
    format: 'webp',
    maxWidth: 800,
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail',
    description: 'Small preview images',
    quality: 70,
    format: 'webp',
    maxWidth: 300,
    maxHeight: 300,
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Optimized for sharing',
    quality: 80,
    format: 'jpeg',
    maxWidth: 1200,
    maxHeight: 630,
  },
];

// Provider
export interface ImageOptimizerProviderProps {
  children: React.ReactNode;
  initialSettings?: Partial<OptimizationSettings>;
  presets?: OptimizationPreset[];
  onOptimize?: (result: OptimizationResult) => void;
}

export const ImageOptimizerProvider: React.FC<ImageOptimizerProviderProps> = ({
  children,
  initialSettings = {},
  presets = defaultPresets,
  onOptimize,
}) => {
  const [settings, setSettings] = useState<OptimizationSettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const updateSettings = useCallback((updates: Partial<OptimizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSettings(prev => ({
        ...prev,
        quality: preset.quality,
        format: preset.format,
        resize: !!(preset.maxWidth || preset.maxHeight),
        maxWidth: preset.maxWidth || prev.maxWidth,
        maxHeight: preset.maxHeight || prev.maxHeight,
      }));
      setActivePreset(presetId);
    }
  }, [presets]);

  const optimize = useCallback(async (): Promise<OptimizationResult> => {
    setIsOptimizing(true);

    // Simulate optimization
    await new Promise(resolve => setTimeout(resolve, 1500));

    const simulatedResult: OptimizationResult = {
      originalSize: 2500000,
      optimizedSize: Math.round(2500000 * (100 - settings.quality + 20) / 100),
      savings: 0,
      savingsPercent: 0,
      dimensions: { width: settings.maxWidth, height: settings.maxHeight },
      format: settings.format,
    };
    simulatedResult.savings = simulatedResult.originalSize - simulatedResult.optimizedSize;
    simulatedResult.savingsPercent = Math.round((simulatedResult.savings / simulatedResult.originalSize) * 100);

    setResult(simulatedResult);
    setIsOptimizing(false);
    onOptimize?.(simulatedResult);

    return simulatedResult;
  }, [settings, onOptimize]);

  const reset = useCallback(() => {
    setSettings(defaultSettings);
    setActivePreset(null);
    setResult(null);
  }, []);

  const value: ImageOptimizerContextType = {
    settings,
    presets,
    activePreset,
    isOptimizing,
    result,
    updateSettings,
    applyPreset,
    optimize,
    reset,
  };

  return (
    <ImageOptimizerContext.Provider value={value}>
      {children}
    </ImageOptimizerContext.Provider>
  );
};

// Helper function
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Preset Selector
export const PresetSelector: React.FC = () => {
  const { presets, activePreset, applyPreset } = useImageOptimizer();

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>
        Quick Presets
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            style={{
              padding: '8px 14px',
              border: '1px solid',
              borderColor: activePreset === preset.id ? '#3b82f6' : '#e5e7eb',
              borderRadius: '6px',
              backgroundColor: activePreset === preset.id ? '#eff6ff' : '#fff',
              color: activePreset === preset.id ? '#3b82f6' : '#374151',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Quality Slider
export const QualitySlider: React.FC = () => {
  const { settings, updateSettings } = useImageOptimizer();

  const getQualityLabel = (quality: number): string => {
    if (quality >= 90) return 'Maximum';
    if (quality >= 75) return 'High';
    if (quality >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Quality</span>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          {settings.quality}% ({getQualityLabel(settings.quality)})
        </span>
      </div>
      <input
        type="range"
        min={10}
        max={100}
        value={settings.quality}
        onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
        style={{ width: '100%', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
        <span>Smaller file</span>
        <span>Better quality</span>
      </div>
    </div>
  );
};

// Format Selector
export const FormatSelector: React.FC = () => {
  const { settings, updateSettings } = useImageOptimizer();

  const formats: { value: ImageFormat; label: string; description: string }[] = [
    { value: 'original', label: 'Original', description: 'Keep original format' },
    { value: 'webp', label: 'WebP', description: 'Best compression, modern browsers' },
    { value: 'jpeg', label: 'JPEG', description: 'Universal compatibility' },
    { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
    { value: 'avif', label: 'AVIF', description: 'Next-gen, smallest files' },
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>
        Output Format
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {formats.map(format => (
          <button
            key={format.value}
            onClick={() => updateSettings({ format: format.value })}
            style={{
              padding: '10px',
              border: '1px solid',
              borderColor: settings.format === format.value ? '#3b82f6' : '#e5e7eb',
              borderRadius: '6px',
              backgroundColor: settings.format === format.value ? '#eff6ff' : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 500, color: settings.format === format.value ? '#3b82f6' : '#374151' }}>
              {format.label}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              {format.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Resize Controls
export const ResizeControls: React.FC = () => {
  const { settings, updateSettings } = useImageOptimizer();

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer', marginBottom: '12px' }}>
        <input
          type="checkbox"
          checked={settings.resize}
          onChange={(e) => updateSettings({ resize: e.target.checked })}
        />
        Resize image
      </label>

      {settings.resize && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Max Width
              </label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={(e) => updateSettings({ maxWidth: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Max Height
              </label>
              <input
                type="number"
                value={settings.maxHeight}
                onChange={(e) => updateSettings({ maxHeight: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.maintainAspectRatio}
              onChange={(e) => updateSettings({ maintainAspectRatio: e.target.checked })}
            />
            Maintain aspect ratio
          </label>
        </motion.div>
      )}
    </div>
  );
};

// Advanced Options
export const AdvancedOptions: React.FC = () => {
  const { settings, updateSettings } = useImageOptimizer();

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>
        Advanced Options
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.stripMetadata}
            onChange={(e) => updateSettings({ stripMetadata: e.target.checked })}
          />
          Strip EXIF metadata
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.progressive}
            onChange={(e) => updateSettings({ progressive: e.target.checked })}
          />
          Progressive loading
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.lazyLoad}
            onChange={(e) => updateSettings({ lazyLoad: e.target.checked })}
          />
          Enable lazy loading
        </label>
      </div>
    </div>
  );
};

// Optimization Result
export const OptimizationResult: React.FC = () => {
  const { result, isOptimizing } = useImageOptimizer();

  if (!result && !isOptimizing) return null;

  if (isOptimizing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '32px', height: '32px', margin: '0 auto 12px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
        </motion.div>
        <p style={{ fontSize: '14px', color: '#3b82f6' }}>Optimizing image...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '16px',
        backgroundColor: '#ecfdf5',
        borderRadius: '8px',
        border: '1px solid #a7f3d0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <polyline points="20,6 9,17 4,12" />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#065f46' }}>
          Optimization Complete
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Original</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
            {formatFileSize(result!.originalSize)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Optimized</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#10b981' }}>
            {formatFileSize(result!.optimizedSize)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Saved</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#10b981' }}>
            {result!.savingsPercent}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Optimize Button
export const OptimizeButton: React.FC = () => {
  const { optimize, isOptimizing, reset } = useImageOptimizer();

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={reset}
        style={{
          padding: '10px 16px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          backgroundColor: '#fff',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
      <button
        onClick={optimize}
        disabled={isOptimizing}
        style={{
          flex: 1,
          padding: '10px 16px',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: isOptimizing ? '#93c5fd' : '#3b82f6',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 500,
          cursor: isOptimizing ? 'not-allowed' : 'pointer',
        }}
      >
        {isOptimizing ? 'Optimizing...' : 'Optimize Image'}
      </button>
    </div>
  );
};

// Main Component
export const ImageOptimizer: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <PresetSelector />
      <QualitySlider />
      <FormatSelector />
      <ResizeControls />
      <AdvancedOptions />
      <OptimizationResult />
      <div style={{ marginTop: '20px' }}>
        <OptimizeButton />
      </div>
    </div>
  );
};

export default ImageOptimizer;
