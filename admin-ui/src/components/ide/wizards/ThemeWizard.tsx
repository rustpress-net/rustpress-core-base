/**
 * ThemeWizard - Step-by-step wizard for creating new themes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, Palette, Layout,
  Type, Image, Code, Sparkles, FileCode, Eye, FolderPlus,
  Monitor, Smartphone, Grid, Layers, Paintbrush, Wand2
} from 'lucide-react';

interface ThemeConfig {
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  template: 'blank' | 'starter' | 'blog' | 'portfolio' | 'landing' | 'ecommerce';
  colorScheme: 'light' | 'dark' | 'both';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  features: string[];
  responsive: boolean;
  includeAssets: boolean;
}

interface ThemeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: ThemeConfig) => void;
}

const templates = [
  { id: 'blank', name: 'Blank', description: 'Start from scratch', icon: FileCode },
  { id: 'starter', name: 'Starter', description: 'Basic layout with header and footer', icon: Layout },
  { id: 'blog', name: 'Blog', description: 'Perfect for blogs and articles', icon: Type },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work', icon: Image },
  { id: 'landing', name: 'Landing Page', description: 'Single-page marketing site', icon: Monitor },
  { id: 'ecommerce', name: 'E-Commerce', description: 'Online store ready', icon: Grid },
];

const fonts = [
  'Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat',
  'Lato', 'Playfair Display', 'Source Sans Pro', 'Raleway', 'Nunito'
];

const featureOptions = [
  { id: 'dark-mode', label: 'Dark Mode Toggle', description: 'Built-in theme switcher' },
  { id: 'animations', label: 'Animations', description: 'CSS/Framer Motion animations' },
  { id: 'responsive', label: 'Mobile-First', description: 'Responsive breakpoints' },
  { id: 'seo', label: 'SEO Ready', description: 'Meta tags and schema markup' },
  { id: 'accessibility', label: 'Accessibility', description: 'WCAG compliant components' },
  { id: 'rtl', label: 'RTL Support', description: 'Right-to-left language support' },
];

export const ThemeWizard: React.FC<ThemeWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<ThemeConfig>({
    name: '',
    slug: '',
    description: '',
    author: '',
    version: '1.0.0',
    template: 'starter',
    colorScheme: 'both',
    primaryColor: '#8B5CF6',
    secondaryColor: '#06B6D4',
    fontFamily: 'Inter',
    features: ['responsive', 'seo'],
    responsive: true,
    includeAssets: true,
  });

  const steps = [
    { id: 'info', title: 'Theme Info', icon: Sparkles },
    { id: 'template', title: 'Template', icon: Layout },
    { id: 'colors', title: 'Colors & Fonts', icon: Palette },
    { id: 'features', title: 'Features', icon: Wand2 },
    { id: 'review', title: 'Review', icon: Eye },
  ];

  const currentStep = steps[step];
  const isFirstStep = step === 0;
  const isLastStep = step === steps.length - 1;

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNext = () => {
    if (isLastStep) {
      onCreate(config);
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setStep(s => s - 1);
    }
  };

  const toggleFeature = (featureId: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return config.name.trim().length >= 2 && config.author.trim().length >= 2;
      case 1: return config.template !== null;
      case 2: return config.primaryColor && config.fontFamily;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // Theme Info
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme Name *</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="My Awesome Theme"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={config.slug}
                onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-awesome-theme"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A brief description of your theme..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author *</label>
                <input
                  type="text"
                  value={config.author}
                  onChange={(e) => setConfig(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                <input
                  type="text"
                  value={config.version}
                  onChange={(e) => setConfig(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Template
        return (
          <div className="grid grid-cols-2 gap-4">
            {templates.map(template => {
              const Icon = template.icon;
              const isSelected = config.template === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setConfig(prev => ({ ...prev, template: template.id as ThemeConfig['template'] }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-medium mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-400">{template.description}</p>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-purple-400 text-sm">
                      <Check className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 2: // Colors & Fonts
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Color Scheme</label>
              <div className="flex gap-3">
                {(['light', 'dark', 'both'] as const).map(scheme => (
                  <button
                    key={scheme}
                    onClick={() => setConfig(prev => ({ ...prev, colorScheme: scheme }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      config.colorScheme === scheme
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {scheme === 'light' && 'Light Only'}
                    {scheme === 'dark' && 'Dark Only'}
                    {scheme === 'both' && 'Light & Dark'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-gray-700"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-gray-700"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {fonts.map(font => (
                  <button
                    key={font}
                    onClick={() => setConfig(prev => ({ ...prev, fontFamily: font }))}
                    className={`px-4 py-2.5 rounded-lg text-left transition-all ${
                      config.fontFamily === font
                        ? 'bg-purple-500/20 border-2 border-purple-500 text-white'
                        : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <p className="text-xs text-gray-500 mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <button
                  style={{ backgroundColor: config.primaryColor }}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                >
                  Primary Button
                </button>
                <button
                  style={{ backgroundColor: config.secondaryColor }}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                >
                  Secondary
                </button>
                <span style={{ fontFamily: config.fontFamily }} className="text-gray-300">
                  Sample Text
                </span>
              </div>
            </div>
          </div>
        );

      case 3: // Features
        return (
          <div className="space-y-3">
            {featureOptions.map(feature => {
              const isSelected = config.features.includes(feature.id);
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{feature.label}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </button>
              );
            })}

            <div className="pt-4 border-t border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeAssets}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeAssets: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Include sample assets</span>
                  <p className="text-sm text-gray-400">Add placeholder images and icons</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-500">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{config.name || 'Untitled Theme'}</h3>
                  <p className="text-gray-400">v{config.version} by {config.author}</p>
                  {config.description && (
                    <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Template</h4>
                <p className="text-white capitalize">{config.template}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Color Scheme</h4>
                <p className="text-white capitalize">{config.colorScheme}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Colors & Typography</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: config.primaryColor }} />
                  <span className="text-sm text-gray-300">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: config.secondaryColor }} />
                  <span className="text-sm text-gray-300">Secondary</span>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-300" style={{ fontFamily: config.fontFamily }}>
                    {config.fontFamily}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Features ({config.features.length})</h4>
              <div className="flex flex-wrap gap-2">
                {config.features.map(f => {
                  const feature = featureOptions.find(fo => fo.id === f);
                  return (
                    <span key={f} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {feature?.label || f}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Files to be created</h4>
              <div className="space-y-1.5 text-sm font-mono">
                <div className="flex items-center gap-2 text-gray-300">
                  <FolderPlus className="w-4 h-4 text-yellow-500" />
                  themes/{config.slug}/
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  index.html
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  style.css
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-yellow-400" />
                  theme.json
                </div>
                {config.includeAssets && (
                  <div className="flex items-center gap-2 text-gray-400 pl-6">
                    <FolderPlus className="w-4 h-4 text-green-500" />
                    assets/
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl mx-4"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Theme</h2>
                <p className="text-sm text-gray-400">{currentStep.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-3 bg-gray-800/50 border-b border-gray-800">
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div
                    className={`flex items-center gap-2 ${
                      idx === step ? 'text-purple-400' : idx < step ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      idx === step
                        ? 'border-purple-500 bg-purple-500/20'
                        : idx < step
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-600'
                    }`}>
                      {idx < step ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <s.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm hidden md:block ${idx === step ? 'text-white' : ''}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${idx < step ? 'bg-green-500' : 'bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-800/30">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Theme
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeWizard;
