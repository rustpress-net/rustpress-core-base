/**
 * SiteModeSettings - Configure how RustPress handles frontend vs apps
 *
 * Modes:
 * - Website: Shows frontend, apps not accessible
 * - App: Shows app selector or auto-launches single app
 * - Hybrid: Website main, apps accessible via URL
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, AppWindow, Layers, Check, Save, Info,
  LayoutGrid, List, Image, Type, FileText, ChevronRight,
  Package, Server, Monitor, Shield, Gauge, Link2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { SiteMode, SiteModeSettings as SiteModeSettingsType, AppDeploymentType } from '../../types/app';

interface ModeOption {
  id: SiteMode;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

const modeOptions: ModeOption[] = [
  {
    id: 'website',
    name: 'Website Mode',
    description: 'Traditional CMS website. Users see the frontend, apps are not accessible.',
    icon: Globe,
    features: [
      'Frontend website is the main entry point',
      'Apps are completely disabled',
      'Best for content-focused websites',
      'Standard WordPress-like experience',
    ],
  },
  {
    id: 'app',
    name: 'App Mode',
    description: 'Application-first experience. Users are directed to apps after login.',
    icon: AppWindow,
    features: [
      'Apps are the main entry point',
      'Single app: Auto-launches after login',
      'Multiple apps: Shows app selector page',
      'Best for SaaS and business applications',
    ],
  },
  {
    id: 'hybrid',
    name: 'Hybrid Mode',
    description: 'Best of both worlds. Website is main, apps accessible via direct URL.',
    icon: Layers,
    features: [
      'Website is the main entry point',
      'Apps accessible via /app/{app-slug}',
      'Seamless switching between website and apps',
      'Best for platforms with multiple functions',
    ],
  },
];

const SiteModeSettingsPage: React.FC = () => {
  const {
    siteModeSettings,
    updateSiteModeSettings,
    getActiveApps,
  } = useAppStore();

  const [settings, setSettings] = useState<SiteModeSettingsType>(siteModeSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeApps = getActiveApps();

  const handleModeChange = (mode: SiteMode) => {
    setSettings({ ...settings, mode });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSettingChange = <K extends keyof SiteModeSettingsType>(
    key: K,
    value: SiteModeSettingsType[K]
  ) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    updateSiteModeSettings(settings);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-purple-400" />
              Site Mode Settings
            </h1>
            <p className="text-gray-400 mt-1">
              Configure how your site handles the frontend website and applications
            </p>
          </div>

          {hasChanges && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Settings saved
            </motion.div>
          )}
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Select Site Mode</h2>
          <div className="grid gap-4">
            {modeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = settings.mode === option.id;

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleModeChange(option.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isSelected ? 'bg-purple-500/20' : 'bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected ? 'text-purple-400' : 'text-gray-400'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          {option.name}
                        </h3>
                        {isSelected && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 mt-1">{option.description}</p>

                      <ul className="mt-4 grid grid-cols-2 gap-2">
                        {option.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-300"
                          >
                            <ChevronRight className="w-3 h-3 text-purple-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* App Mode Settings */}
        {settings.mode === 'app' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <AppWindow className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                App Mode Settings
              </h2>
            </div>

            {/* Deployment Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Deployment Type
              </label>
              <p className="text-xs text-gray-500">
                Choose how your application will be deployed and accessed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Fullstack Option */}
                <div
                  onClick={() => handleSettingChange('deploymentType', 'fullstack')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    (settings.deploymentType || 'fullstack') === 'fullstack'
                      ? 'bg-purple-500/10 border-purple-500'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      (settings.deploymentType || 'fullstack') === 'fullstack'
                        ? 'bg-purple-500/20'
                        : 'bg-gray-800'
                    }`}>
                      <Monitor className={`w-5 h-5 ${
                        (settings.deploymentType || 'fullstack') === 'fullstack'
                          ? 'text-purple-400'
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Fullstack</h4>
                    </div>
                    {(settings.deploymentType || 'fullstack') === 'fullstack' && (
                      <Check className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Complete application with React frontend and Rust backend.
                    Includes admin UI, app selector, and full user interface.
                  </p>
                  <ul className="mt-3 space-y-1">
                    <li className="text-xs text-gray-500 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-purple-400" />
                      React frontend included
                    </li>
                    <li className="text-xs text-gray-500 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-purple-400" />
                      Admin dashboard
                    </li>
                    <li className="text-xs text-gray-500 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-purple-400" />
                      App selector page
                    </li>
                  </ul>
                </div>

                {/* Backend Only Option */}
                <div
                  onClick={() => handleSettingChange('deploymentType', 'backend')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.deploymentType === 'backend'
                      ? 'bg-blue-500/10 border-blue-500'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      settings.deploymentType === 'backend'
                        ? 'bg-blue-500/20'
                        : 'bg-gray-800'
                    }`}>
                      <Server className={`w-5 h-5 ${
                        settings.deploymentType === 'backend'
                          ? 'text-blue-400'
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Backend Only</h4>
                    </div>
                    {settings.deploymentType === 'backend' && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    API-only deployment without UI. RustPress acts as a
                    headless backend for external applications.
                  </p>
                  <ul className="mt-3 space-y-1">
                    <li className="text-xs text-gray-500 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                      REST API endpoints
                    </li>
                    <li className="text-xs text-gray-500 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                      External app integration
                    </li>
                    <li className="text-xs text-gray-500 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                      No bundled UI
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Backend Mode Specific Settings */}
            {settings.deploymentType === 'backend' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-gray-700"
              >
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-300 text-sm">
                        Backend mode disables the admin UI and app selector. RustPress will serve
                        only API endpoints for external applications to consume.
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Prefix */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Link2 className="w-4 h-4 inline mr-2" />
                    API Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.backendApiPrefix || '/api'}
                    onChange={(e) =>
                      handleSettingChange('backendApiPrefix', e.target.value)
                    }
                    placeholder="/api"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Base path for all API endpoints (e.g., /api/v1/posts)
                  </p>
                </div>

                {/* CORS Origins */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Allowed CORS Origins
                  </label>
                  <textarea
                    value={(settings.backendCorsOrigins || []).join('\n')}
                    onChange={(e) =>
                      handleSettingChange(
                        'backendCorsOrigins',
                        e.target.value.split('\n').filter(Boolean)
                      )
                    }
                    placeholder="https://example.com&#10;https://app.example.com"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    One origin per line. External domains allowed to make API requests.
                  </p>
                </div>

                {/* Rate Limiting */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Gauge className="w-4 h-4 inline mr-2" />
                    Rate Limit (requests per minute)
                  </label>
                  <input
                    type="number"
                    value={settings.backendRateLimitPerMinute || 60}
                    onChange={(e) =>
                      handleSettingChange('backendRateLimitPerMinute', parseInt(e.target.value) || 60)
                    }
                    min={1}
                    max={10000}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum number of requests per minute per client IP.
                  </p>
                </div>

                {/* Require Authentication */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    checked={settings.backendAuthRequired ?? true}
                    onChange={(e) =>
                      handleSettingChange('backendAuthRequired', e.target.checked)
                    }
                    className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">Require Authentication</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      All API endpoints require a valid JWT token. Disable for public APIs.
                    </p>
                  </div>
                </label>
              </motion.div>
            )}

            {/* Fullstack-specific settings (existing settings) */}
            {(settings.deploymentType || 'fullstack') === 'fullstack' && (
              <>
                {/* Default App Selection */}
                <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Default Application
              </label>
              <p className="text-xs text-gray-500">
                If a user has access to multiple apps, this app will be launched by default.
                If not set, users will see the app selector.
              </p>
              <select
                value={settings.defaultAppId || ''}
                onChange={(e) =>
                  handleSettingChange('defaultAppId', e.target.value || undefined)
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Show App Selector (No Default)</option>
                {activeApps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            {/* App Selector Style */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                App Selector Style
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSettingChange('appSelectorStyle', 'grid')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    settings.appSelectorStyle === 'grid'
                      ? 'bg-purple-500/10 border-purple-500'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <LayoutGrid
                    className={`w-6 h-6 mx-auto mb-2 ${
                      settings.appSelectorStyle === 'grid'
                        ? 'text-purple-400'
                        : 'text-gray-500'
                    }`}
                  />
                  <span className="text-sm text-white">Grid View</span>
                </button>
                <button
                  onClick={() => handleSettingChange('appSelectorStyle', 'list')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    settings.appSelectorStyle === 'list'
                      ? 'bg-purple-500/10 border-purple-500'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <List
                    className={`w-6 h-6 mx-auto mb-2 ${
                      settings.appSelectorStyle === 'list'
                        ? 'text-purple-400'
                        : 'text-gray-500'
                    }`}
                  />
                  <span className="text-sm text-white">List View</span>
                </button>
              </div>
            </div>

            {/* App Selector Customization */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAppSelectorLogo}
                  onChange={(e) =>
                    handleSettingChange('showAppSelectorLogo', e.target.checked)
                  }
                  className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <span className="text-white">Show Logo on App Selector</span>
                  <p className="text-xs text-gray-500">
                    Display your site logo at the top of the app selector page
                  </p>
                </div>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <Type className="w-4 h-4 inline mr-2" />
                  App Selector Title
                </label>
                <input
                  type="text"
                  value={settings.appSelectorTitle || ''}
                  onChange={(e) =>
                    handleSettingChange('appSelectorTitle', e.target.value)
                  }
                  placeholder="Select an Application"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FileText className="w-4 h-4 inline mr-2" />
                  App Selector Description
                </label>
                <textarea
                  value={settings.appSelectorDescription || ''}
                  onChange={(e) =>
                    handleSettingChange('appSelectorDescription', e.target.value)
                  }
                  placeholder="Choose an application to get started"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
              </>
            )}
          </motion.div>
        )}

        {/* Hybrid Mode Settings */}
        {settings.mode === 'hybrid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                Hybrid Mode Settings
              </h2>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm">
                    In hybrid mode, your website is the main entry point. Apps are accessible
                    via direct URLs like <code className="bg-gray-900 px-2 py-0.5 rounded">/app/app-slug</code>.
                    Users must have access to an app to view it.
                  </p>
                </div>
              </div>
            </div>

            {/* Apps accessible in hybrid mode */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                URL-Accessible Apps
              </label>
              <p className="text-xs text-gray-500">
                Select which apps can be accessed via direct URL. Unselected apps will not be reachable.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {activeApps.map((app) => {
                  const isAllowed = settings.allowedAppsInHybrid?.includes(app.id) ?? true;
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        const current = settings.allowedAppsInHybrid || activeApps.map(a => a.id);
                        const updated = isAllowed
                          ? current.filter((id) => id !== app.id)
                          : [...current, app.id];
                        handleSettingChange('allowedAppsInHybrid', updated);
                      }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isAllowed
                          ? 'bg-purple-500/10 border-purple-500'
                          : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className={`w-4 h-4 ${isAllowed ? 'text-purple-400' : 'text-gray-500'}`} />
                          <span className={isAllowed ? 'text-white' : 'text-gray-500'}>
                            {app.name}
                          </span>
                        </div>
                        {isAllowed && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        /app/{app.slug}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Website Mode Info */}
        {settings.mode === 'website' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                Website Mode
              </h2>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 text-sm">
                    In website mode, all apps are disabled. Your site will function as a
                    traditional CMS website. Users will not be able to access any applications,
                    even with direct URLs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Apps Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Active Applications ({activeApps.length})
          </h2>
          {activeApps.length === 0 ? (
            <p className="text-gray-400">
              No active applications. Install apps from the App Store to use App or Hybrid mode.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeApps.map((app) => (
                <span
                  key={app.id}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-2"
                >
                  <Package className="w-3.5 h-3.5" />
                  {app.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteModeSettingsPage;
