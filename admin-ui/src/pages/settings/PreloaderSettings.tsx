/**
 * Preloader Settings - Customize loading animations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, RefreshCw, Eye, Palette, Clock, Sparkles } from 'lucide-react';

// Preloader variants
export type PreloaderVariant =
  | 'rustCrab'
  | 'spinningRings'
  | 'pulsingDots'
  | 'morphingSquare'
  | 'waveBars'
  | 'orbitingDots'
  | 'typingDots'
  | 'bouncingBalls'
  | 'gradient'
  | 'minimal';

interface PreloaderConfig {
  variant: PreloaderVariant;
  showBrand: boolean;
  showProgress: boolean;
  showMessage: boolean;
  customMessage: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  animationSpeed: 'slow' | 'normal' | 'fast';
  minimumDisplayTime: number;
}

const defaultConfig: PreloaderConfig = {
  variant: 'rustCrab',
  showBrand: true,
  showProgress: true,
  showMessage: true,
  customMessage: 'Loading',
  backgroundColor: '#0f0f0f',
  primaryColor: '#f97316',
  secondaryColor: '#eab308',
  animationSpeed: 'normal',
  minimumDisplayTime: 500,
};

const preloaderVariants: { id: PreloaderVariant; name: string; description: string }[] = [
  { id: 'rustCrab', name: 'Rust Crab', description: 'Animated crab with spinning rings' },
  { id: 'spinningRings', name: 'Spinning Rings', description: 'Concentric rotating rings' },
  { id: 'pulsingDots', name: 'Pulsing Dots', description: 'Three dots with pulse effect' },
  { id: 'morphingSquare', name: 'Morphing Square', description: 'Shape-shifting square animation' },
  { id: 'waveBars', name: 'Wave Bars', description: 'Equalizer-style wave bars' },
  { id: 'orbitingDots', name: 'Orbiting Dots', description: 'Dots orbiting a center point' },
  { id: 'typingDots', name: 'Typing Dots', description: 'Classic typing indicator' },
  { id: 'bouncingBalls', name: 'Bouncing Balls', description: 'Playful bouncing animation' },
  { id: 'gradient', name: 'Gradient Spinner', description: 'Smooth gradient rotation' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, elegant spinner' },
];

const colorPresets = [
  { name: 'RustPress Orange', primary: '#f97316', secondary: '#eab308' },
  { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#06b6d4' },
  { name: 'Forest Green', primary: '#22c55e', secondary: '#84cc16' },
  { name: 'Royal Purple', primary: '#a855f7', secondary: '#ec4899' },
  { name: 'Sunset Red', primary: '#ef4444', secondary: '#f97316' },
  { name: 'Monochrome', primary: '#ffffff', secondary: '#a3a3a3' },
];

// Preview components for each variant
const PreloaderPreview: React.FC<{ config: PreloaderConfig }> = ({ config }) => {
  const speed = config.animationSpeed === 'slow' ? 2 : config.animationSpeed === 'fast' ? 0.5 : 1;

  const renderVariant = () => {
    switch (config.variant) {
      case 'rustCrab':
        return (
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 border-2 border-transparent rounded-full"
              style={{ borderTopColor: config.primaryColor, borderRightColor: config.secondaryColor }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5 * speed, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 border border-transparent rounded-full"
              style={{ borderBottomColor: config.primaryColor, borderLeftColor: config.secondaryColor }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1 * speed, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2 * speed, repeat: Infinity }}
            >
              🦀
            </motion.div>
          </div>
        );

      case 'spinningRings':
        return (
          <div className="relative w-16 h-16">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-transparent"
                style={{
                  inset: `${i * 6}px`,
                  borderTopColor: i % 2 === 0 ? config.primaryColor : config.secondaryColor,
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: (1 + i * 0.3) * speed, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        );

      case 'pulsingDots':
        return (
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: i === 1 ? config.secondaryColor : config.primaryColor }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1 * speed, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        );

      case 'morphingSquare':
        return (
          <motion.div
            className="w-12 h-12"
            style={{ backgroundColor: config.primaryColor }}
            animate={{
              borderRadius: ['20%', '50%', '20%'],
              rotate: [0, 180, 360],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 2 * speed, repeat: Infinity, ease: 'easeInOut' }}
          />
        );

      case 'waveBars':
        return (
          <div className="flex items-end gap-1 h-12">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="w-2 rounded-full"
                style={{ backgroundColor: i % 2 === 0 ? config.primaryColor : config.secondaryColor }}
                animate={{ height: ['12px', '48px', '12px'] }}
                transition={{ duration: 0.8 * speed, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );

      case 'orbitingDots':
        return (
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: config.secondaryColor }}
            />
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: (2 + i * 0.5) * speed, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: config.primaryColor,
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
              </motion.div>
            ))}
          </div>
        );

      case 'typingDots':
        return (
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: config.primaryColor }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6 * speed, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        );

      case 'bouncingBalls':
        return (
          <div className="flex gap-2 items-end h-12">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: i === 1 ? config.secondaryColor : config.primaryColor }}
                animate={{ y: [0, -24, 0] }}
                transition={{
                  duration: 0.5 * speed,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        );

      case 'gradient':
        return (
          <motion.div
            className="w-14 h-14 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${config.primaryColor}, ${config.secondaryColor}, transparent)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1 * speed, repeat: Infinity, ease: 'linear' }}
          />
        );

      case 'minimal':
        return (
          <motion.div
            className="w-10 h-10 border-2 border-transparent rounded-full"
            style={{ borderTopColor: config.primaryColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8 * speed, repeat: Infinity, ease: 'linear' }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl min-h-[200px]"
      style={{ backgroundColor: config.backgroundColor }}
    >
      {renderVariant()}

      {config.showBrand && (
        <div className="flex items-center gap-1 text-lg font-bold">
          <span style={{ color: config.primaryColor }}>Rust</span>
          <span className="text-gray-200">Press</span>
        </div>
      )}

      {config.showProgress && (
        <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${config.primaryColor}, ${config.secondaryColor})` }}
            animate={{ width: ['0%', '70%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )}

      {config.showMessage && (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <span>{config.customMessage}</span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: config.primaryColor }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

export const PreloaderSettings: React.FC = () => {
  const [config, setConfig] = useState<PreloaderConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Load saved config
  useEffect(() => {
    const saved = localStorage.getItem('rustpress-preloader-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        // Use defaults
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('rustpress-preloader-config', JSON.stringify(config));
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const refreshPreview = () => {
    setPreviewKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Loader2 className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Preloader Settings</h1>
            <p className="text-gray-400">Customize the loading animation for your site</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg text-white transition-colors"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Live Preview
            </h2>
            <button
              onClick={refreshPreview}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <PreloaderPreview key={previewKey} config={config} />
        </div>

        {/* Variant Selection */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Animation Style
          </h2>
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {preloaderVariants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setConfig(prev => ({ ...prev, variant: variant.id }))}
                className={`p-3 rounded-lg text-left transition-all ${
                  config.variant === variant.id
                    ? 'bg-orange-500/20 border-2 border-orange-500'
                    : 'bg-gray-800 border-2 border-transparent hover:border-gray-700'
                }`}
              >
                <p className={`font-medium text-sm ${
                  config.variant === variant.id ? 'text-orange-400' : 'text-white'
                }`}>
                  {variant.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{variant.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Options */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Display Options</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Show Brand Name</span>
              <input
                type="checkbox"
                checked={config.showBrand}
                onChange={(e) => setConfig(prev => ({ ...prev, showBrand: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Show Progress Bar</span>
              <input
                type="checkbox"
                checked={config.showProgress}
                onChange={(e) => setConfig(prev => ({ ...prev, showProgress: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Show Loading Message</span>
              <input
                type="checkbox"
                checked={config.showMessage}
                onChange={(e) => setConfig(prev => ({ ...prev, showMessage: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500"
              />
            </label>
            {config.showMessage && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Custom Message</label>
                <input
                  type="text"
                  value={config.customMessage}
                  onChange={(e) => setConfig(prev => ({ ...prev, customMessage: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Loading..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            Colors
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {colorPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary,
                  }))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-400" />
          Animation Timing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-3">Animation Speed</label>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map(speed => (
                <button
                  key={speed}
                  onClick={() => setConfig(prev => ({ ...prev, animationSpeed: speed }))}
                  className={`flex-1 px-4 py-2 rounded-lg capitalize transition-colors ${
                    config.animationSpeed === speed
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Minimum Display Time (ms)
            </label>
            <input
              type="number"
              value={config.minimumDisplayTime}
              onChange={(e) => setConfig(prev => ({ ...prev, minimumDisplayTime: parseInt(e.target.value) || 0 }))}
              min={0}
              max={5000}
              step={100}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Preloader stays visible for at least this long, even if content loads faster
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreloaderSettings;
