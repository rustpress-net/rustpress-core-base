/**
 * PluginWizard - Step-by-step wizard for creating new plugins
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, Puzzle, Settings,
  Code, Database, Globe, Shield, FileCode, FolderPlus,
  Zap, Terminal, Eye, Sparkles, Lock, Webhook
} from 'lucide-react';

interface HookConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PluginConfig {
  name: string;
  slug: string;
  description: string;
  author: string;
  authorUri: string;
  version: string;
  license: 'MIT' | 'GPL-2.0' | 'GPL-3.0' | 'Apache-2.0' | 'proprietary';
  category: 'seo' | 'security' | 'performance' | 'content' | 'ecommerce' | 'social' | 'utilities' | 'analytics';
  minRustPressVersion: string;
  hasSettings: boolean;
  hasAdminPage: boolean;
  language: 'rust' | 'typescript' | 'both';
  hooks: string[];
  features: string[];
  apiEndpoints: boolean;
  databaseTables: boolean;
  cronJobs: boolean;
}

interface PluginWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: PluginConfig) => void;
}

const categories = [
  { id: 'seo', name: 'SEO', icon: Globe, color: 'text-green-400' },
  { id: 'security', name: 'Security', icon: Shield, color: 'text-red-400' },
  { id: 'performance', name: 'Performance', icon: Zap, color: 'text-yellow-400' },
  { id: 'content', name: 'Content', icon: FileCode, color: 'text-blue-400' },
  { id: 'ecommerce', name: 'E-Commerce', icon: Database, color: 'text-purple-400' },
  { id: 'social', name: 'Social', icon: Globe, color: 'text-pink-400' },
  { id: 'utilities', name: 'Utilities', icon: Settings, color: 'text-gray-400' },
  { id: 'analytics', name: 'Analytics', icon: Terminal, color: 'text-cyan-400' },
];

const licenses = [
  { id: 'MIT', name: 'MIT License', description: 'Permissive, minimal restrictions' },
  { id: 'GPL-2.0', name: 'GPL 2.0', description: 'Copyleft, share-alike' },
  { id: 'GPL-3.0', name: 'GPL 3.0', description: 'Copyleft with patent protection' },
  { id: 'Apache-2.0', name: 'Apache 2.0', description: 'Permissive with patent grant' },
  { id: 'proprietary', name: 'Proprietary', description: 'All rights reserved' },
];

const availableHooks: HookConfig[] = [
  { id: 'init', name: 'Plugin Init', description: 'Called when plugin is loaded', enabled: true },
  { id: 'activate', name: 'Activation', description: 'Called when plugin is activated', enabled: true },
  { id: 'deactivate', name: 'Deactivation', description: 'Called when plugin is deactivated', enabled: false },
  { id: 'content_save', name: 'Content Save', description: 'Before/after content is saved', enabled: false },
  { id: 'content_render', name: 'Content Render', description: 'Before content is rendered', enabled: false },
  { id: 'user_login', name: 'User Login', description: 'After user logs in', enabled: false },
  { id: 'api_request', name: 'API Request', description: 'Before/after API requests', enabled: false },
  { id: 'admin_menu', name: 'Admin Menu', description: 'Modify admin navigation', enabled: false },
];

const featureOptions = [
  { id: 'settings', label: 'Settings Page', description: 'Add a configuration UI for users' },
  { id: 'admin-page', label: 'Admin Page', description: 'Full admin panel section' },
  { id: 'api', label: 'REST API Endpoints', description: 'Custom API routes' },
  { id: 'database', label: 'Database Tables', description: 'Custom database schema' },
  { id: 'cron', label: 'Scheduled Tasks', description: 'Background cron jobs' },
  { id: 'widgets', label: 'Widgets', description: 'Embeddable UI components' },
  { id: 'shortcodes', label: 'Shortcodes', description: 'Content shortcode tags' },
  { id: 'webhooks', label: 'Webhooks', description: 'External webhook integration' },
];

export const PluginWizard: React.FC<PluginWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<PluginConfig>({
    name: '',
    slug: '',
    description: '',
    author: '',
    authorUri: '',
    version: '1.0.0',
    license: 'MIT',
    category: 'utilities',
    minRustPressVersion: '1.0.0',
    hasSettings: true,
    hasAdminPage: false,
    language: 'rust',
    hooks: ['init', 'activate'],
    features: ['settings'],
    apiEndpoints: false,
    databaseTables: false,
    cronJobs: false,
  });

  const steps = [
    { id: 'info', title: 'Plugin Info', icon: Puzzle },
    { id: 'category', title: 'Category', icon: FolderPlus },
    { id: 'language', title: 'Language & Hooks', icon: Code },
    { id: 'features', title: 'Features', icon: Zap },
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

  const toggleHook = (hookId: string) => {
    setConfig(prev => ({
      ...prev,
      hooks: prev.hooks.includes(hookId)
        ? prev.hooks.filter(h => h !== hookId)
        : [...prev.hooks, hookId]
    }));
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
      case 1: return config.category !== null;
      case 2: return config.language !== null && config.hooks.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // Plugin Info
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plugin Name *</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="My Awesome Plugin"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plugin Slug</label>
              <input
                type="text"
                value={config.slug}
                onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-awesome-plugin"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does your plugin do?"
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author *</label>
                <input
                  type="text"
                  value={config.author}
                  onChange={(e) => setConfig(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Your name or company"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author Website</label>
                <input
                  type="text"
                  value={config.authorUri}
                  onChange={(e) => setConfig(prev => ({ ...prev, authorUri: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                <input
                  type="text"
                  value={config.version}
                  onChange={(e) => setConfig(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">License</label>
                <select
                  value={config.license}
                  onChange={(e) => setConfig(prev => ({ ...prev, license: e.target.value as PluginConfig['license'] }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  {licenses.map(lic => (
                    <option key={lic.id} value={lic.id}>{lic.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Category
        return (
          <div className="grid grid-cols-2 gap-4">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = config.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setConfig(prev => ({ ...prev, category: cat.id as PluginConfig['category'] }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-green-500/20' : 'bg-gray-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-green-400' : cat.color}`} />
                  </div>
                  <h3 className="text-white font-medium">{cat.name}</h3>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
                      <Check className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 2: // Language & Hooks
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Primary Language</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'rust', name: 'Rust', desc: 'Backend logic & performance' },
                  { id: 'typescript', name: 'TypeScript', desc: 'Frontend components' },
                  { id: 'both', name: 'Full Stack', desc: 'Rust + TypeScript' },
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setConfig(prev => ({ ...prev, language: lang.id as PluginConfig['language'] }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      config.language === lang.id
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Code className={`w-5 h-5 mb-2 ${config.language === lang.id ? 'text-green-400' : 'text-gray-400'}`} />
                    <h4 className="text-white font-medium">{lang.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{lang.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Lifecycle Hooks</label>
              <div className="grid grid-cols-2 gap-3">
                {availableHooks.map(hook => {
                  const isSelected = config.hooks.includes(hook.id);
                  return (
                    <button
                      key={hook.id}
                      onClick={() => toggleHook(hook.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-white text-sm font-medium">{hook.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 pl-7">{hook.description}</p>
                    </button>
                  );
                })}
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
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    isSelected ? 'border-green-500 bg-green-500' : 'border-gray-600'
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
          </div>
        );

      case 4: // Review
        const selectedCategory = categories.find(c => c.id === config.category);
        const CategoryIcon = selectedCategory?.icon || Puzzle;

        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500">
                  <Puzzle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{config.name || 'Untitled Plugin'}</h3>
                  <p className="text-gray-400">v{config.version} by {config.author}</p>
                  {config.description && (
                    <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`w-4 h-4 ${selectedCategory?.color}`} />
                  <span className="text-white">{selectedCategory?.name}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Language</h4>
                <p className="text-white capitalize">{config.language === 'both' ? 'Full Stack' : config.language}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">License</h4>
                <p className="text-white">{licenses.find(l => l.id === config.license)?.name}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Hooks ({config.hooks.length})</h4>
              <div className="flex flex-wrap gap-2">
                {config.hooks.map(h => {
                  const hook = availableHooks.find(ah => ah.id === h);
                  return (
                    <span key={h} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      {hook?.name || h}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Features ({config.features.length})</h4>
              <div className="flex flex-wrap gap-2">
                {config.features.map(f => {
                  const feature = featureOptions.find(fo => fo.id === f);
                  return (
                    <span key={f} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
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
                  plugins/{config.slug}/
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  plugin.json
                </div>
                {(config.language === 'rust' || config.language === 'both') && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      src/lib.rs
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      Cargo.toml
                    </div>
                  </>
                )}
                {(config.language === 'typescript' || config.language === 'both') && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      src/index.tsx
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      package.json
                    </div>
                  </>
                )}
                {config.features.includes('settings') && (
                  <div className="flex items-center gap-2 text-gray-400 pl-6">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    settings.tsx
                  </div>
                )}
                {config.features.includes('database') && (
                  <div className="flex items-center gap-2 text-gray-400 pl-6">
                    <FileCode className="w-4 h-4 text-green-400" />
                    migrations/
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
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Puzzle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Plugin</h2>
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
                      idx === step ? 'text-green-400' : idx < step ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      idx === step
                        ? 'border-green-500 bg-green-500/20'
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
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Plugin
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

export default PluginWizard;
