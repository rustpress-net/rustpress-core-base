/**
 * AppWizard - Step-by-step wizard for creating new RustPress apps
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, AppWindow, Layout,
  Database, Globe, Shield, FileCode, FolderPlus, Server,
  Eye, Sparkles, Key, Palette, Settings, Package,
  Briefcase, BarChart3, ShoppingCart, MessageSquare,
  Workflow, Wrench, Users, Lock
} from 'lucide-react';
import type { AppCategory, AppPermission } from '../../../types/app';

interface AppConfig {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  author: string;
  authorUrl: string;
  version: string;
  category: AppCategory;
  icon: string;
  pricing: {
    type: 'free' | 'membership' | 'one-time';
    price?: number;
  };
  permissions: AppPermission[];
  framework: 'react' | 'vue' | 'svelte' | 'vanilla';
  hasRustBackend: boolean;
  hasDatabaseTables: boolean;
  includeAuth: boolean;
  includeSettings: boolean;
  features: string[];
}

interface AppWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: AppConfig) => void;
}

const categories: { id: AppCategory; name: string; icon: React.ElementType; color: string }[] = [
  { id: 'productivity', name: 'Productivity', icon: Briefcase, color: 'text-blue-400' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-green-400' },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingCart, color: 'text-purple-400' },
  { id: 'communication', name: 'Communication', icon: MessageSquare, color: 'text-pink-400' },
  { id: 'automation', name: 'Automation', icon: Workflow, color: 'text-orange-400' },
  { id: 'security', name: 'Security', icon: Shield, color: 'text-red-400' },
  { id: 'utilities', name: 'Utilities', icon: Wrench, color: 'text-gray-400' },
];

const frameworks = [
  { id: 'react', name: 'React', icon: '⚛️', description: 'Popular UI library with hooks' },
  { id: 'vue', name: 'Vue', icon: '💚', description: 'Progressive JavaScript framework' },
  { id: 'svelte', name: 'Svelte', icon: '🔥', description: 'Compile-time framework' },
  { id: 'vanilla', name: 'Vanilla JS', icon: '📜', description: 'No framework, just JavaScript' },
];

const permissionOptions: { id: AppPermission; name: string; description: string; risk: 'low' | 'medium' | 'high' }[] = [
  { id: 'read:users', name: 'Read Users', description: 'Access user profile information', risk: 'low' },
  { id: 'write:users', name: 'Modify Users', description: 'Create, update, or delete users', risk: 'high' },
  { id: 'read:content', name: 'Read Content', description: 'Access posts, pages, and media', risk: 'low' },
  { id: 'write:content', name: 'Modify Content', description: 'Create, update, or delete content', risk: 'medium' },
  { id: 'api:external', name: 'External API', description: 'Make requests to external services', risk: 'medium' },
  { id: 'storage:files', name: 'File Storage', description: 'Read and write files', risk: 'medium' },
];

const featureOptions = [
  { id: 'dashboard', label: 'Dashboard Widget', description: 'Show on main dashboard' },
  { id: 'sidebar', label: 'Sidebar Navigation', description: 'Add to admin sidebar' },
  { id: 'notifications', label: 'Notifications', description: 'Push notifications support' },
  { id: 'dark-mode', label: 'Dark Mode', description: 'Theme switching support' },
  { id: 'responsive', label: 'Mobile Responsive', description: 'Works on all devices' },
  { id: 'offline', label: 'Offline Support', description: 'Works without internet' },
  { id: 'i18n', label: 'Internationalization', description: 'Multi-language support' },
];

const iconOptions = [
  '📊', '📈', '📉', '💼', '🛒', '💬', '🔔', '⚙️',
  '🎨', '📁', '📝', '🔍', '🔐', '👥', '📅', '🚀',
];

export const AppWizard: React.FC<AppWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<AppConfig>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    author: '',
    authorUrl: '',
    version: '1.0.0',
    category: 'productivity',
    icon: '📊',
    pricing: { type: 'free' },
    permissions: ['read:content'],
    framework: 'react',
    hasRustBackend: true,
    hasDatabaseTables: false,
    includeAuth: true,
    includeSettings: true,
    features: ['dashboard', 'sidebar', 'dark-mode', 'responsive'],
  });

  const steps = [
    { id: 'info', title: 'App Info', icon: AppWindow },
    { id: 'category', title: 'Category & Icon', icon: Palette },
    { id: 'framework', title: 'Framework', icon: Package },
    { id: 'permissions', title: 'Permissions', icon: Shield },
    { id: 'features', title: 'Features', icon: Settings },
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

  const togglePermission = (permId: AppPermission) => {
    setConfig(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
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
      case 1: return config.category && config.icon;
      case 2: return config.framework;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // App Info
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">App Name *</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="My Awesome App"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">App Slug</label>
              <input
                type="text"
                value={config.slug}
                onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-awesome-app"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
              <input
                type="text"
                value={config.shortDescription}
                onChange={(e) => setConfig(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="A brief one-liner about your app"
                maxLength={100}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{config.shortDescription.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what your app does..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                <input
                  type="text"
                  value={config.version}
                  onChange={(e) => setConfig(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Category & Icon
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = config.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setConfig(prev => ({ ...prev, category: cat.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-cyan-400' : cat.color}`} />
                      <h3 className="text-white font-medium">{cat.name}</h3>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">App Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {iconOptions.map(icon => {
                  const isSelected = config.icon === icon;
                  return (
                    <button
                      key={icon}
                      onClick={() => setConfig(prev => ({ ...prev, icon }))}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                      }`}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Pricing</label>
              <div className="flex gap-3">
                {(['free', 'membership', 'one-time'] as const).map(priceType => (
                  <button
                    key={priceType}
                    onClick={() => setConfig(prev => ({ ...prev, pricing: { ...prev.pricing, type: priceType } }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      config.pricing.type === priceType
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {priceType === 'free' && 'Free'}
                    {priceType === 'membership' && 'Subscription'}
                    {priceType === 'one-time' && 'One-Time'}
                  </button>
                ))}
              </div>
              {config.pricing.type !== 'free' && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-2">
                    Price (USD) {config.pricing.type === 'membership' && '/ month'}
                  </label>
                  <input
                    type="number"
                    value={config.pricing.price || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, price: parseFloat(e.target.value) || undefined }
                    }))}
                    placeholder="9.99"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Framework
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Frontend Framework</label>
              <div className="grid grid-cols-2 gap-4">
                {frameworks.map(fw => {
                  const isSelected = config.framework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      onClick={() => setConfig(prev => ({ ...prev, framework: fw.id as AppConfig['framework'] }))}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{fw.icon}</div>
                      <h3 className="text-white font-medium">{fw.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{fw.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={config.hasRustBackend}
                  onChange={(e) => setConfig(prev => ({ ...prev, hasRustBackend: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">Include Rust Backend</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Add Rust API endpoints for high-performance operations</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={config.hasDatabaseTables}
                  onChange={(e) => setConfig(prev => ({ ...prev, hasDatabaseTables: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Custom Database Tables</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Create app-specific database schema</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeAuth}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeAuth: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Authentication Integration</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Use RustPress authentication system</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeSettings}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeSettings: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">Settings Page</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Add a configuration page for the app</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 3: // Permissions
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">
              Select the permissions your app needs. Users will see these when installing.
            </p>
            {permissionOptions.map(perm => {
              const isSelected = config.permissions.includes(perm.id);
              return (
                <button
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{perm.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(perm.risk)} bg-gray-800`}>
                        {perm.risk} risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{perm.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 4: // Features
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
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600'
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

      case 5: // Review
        const selectedCategory = categories.find(c => c.id === config.category);
        const CategoryIcon = selectedCategory?.icon || AppWindow;
        const selectedFramework = frameworks.find(f => f.id === config.framework);

        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500 text-3xl">
                  {config.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{config.name || 'Untitled App'}</h3>
                  <p className="text-gray-400">v{config.version} by {config.author}</p>
                  {config.shortDescription && (
                    <p className="text-sm text-gray-500 mt-1">{config.shortDescription}</p>
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
                <h4 className="text-sm font-medium text-gray-400 mb-2">Framework</h4>
                <p className="text-white">{selectedFramework?.icon} {selectedFramework?.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Pricing</h4>
                <p className="text-white capitalize">
                  {config.pricing.type === 'free' ? 'Free' : `$${config.pricing.price || 0}`}
                  {config.pricing.type === 'membership' && '/mo'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Configuration</h4>
              <div className="flex flex-wrap gap-2">
                {config.hasRustBackend && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">Rust Backend</span>
                )}
                {config.hasDatabaseTables && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Database</span>
                )}
                {config.includeAuth && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Auth</span>
                )}
                {config.includeSettings && (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">Settings</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Permissions ({config.permissions.length})</h4>
              <div className="flex flex-wrap gap-2">
                {config.permissions.map(p => {
                  const perm = permissionOptions.find(po => po.id === p);
                  return (
                    <span key={p} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                      {perm?.name || p}
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
                  apps/{config.slug}/
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  app.json
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FolderPlus className="w-4 h-4 text-cyan-500" />
                  frontend/
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-10">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  {config.framework === 'react' ? 'App.tsx' : config.framework === 'vue' ? 'App.vue' : 'App.svelte'}
                </div>
                {config.hasRustBackend && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FolderPlus className="w-4 h-4 text-orange-500" />
                      backend/
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-10">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      src/lib.rs
                    </div>
                  </>
                )}
                {config.hasDatabaseTables && (
                  <div className="flex items-center gap-2 text-gray-400 pl-6">
                    <FolderPlus className="w-4 h-4 text-green-500" />
                    migrations/
                  </div>
                )}
                {config.includeSettings && (
                  <div className="flex items-center gap-2 text-gray-400 pl-6">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    Settings.tsx
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
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <AppWindow className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Create New App</h2>
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
                      idx === step ? 'text-cyan-400' : idx < step ? 'text-cyan-400' : 'text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      idx === step
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : idx < step
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-600'
                    }`}>
                      {idx < step ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <s.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-xs hidden lg:block ${idx === step ? 'text-white' : ''}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${idx < step ? 'bg-cyan-500' : 'bg-gray-700'}`} />
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
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create App
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

export default AppWizard;
