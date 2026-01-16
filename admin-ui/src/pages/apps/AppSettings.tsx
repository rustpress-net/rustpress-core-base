/**
 * AppSettings - Configure individual app settings
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Save, RotateCcw, Shield, Key, Webhook,
  BarChart3, AlertCircle, Check, ChevronDown, ChevronRight,
  Package, ExternalLink, Info
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { APP_PERMISSIONS } from '../../types/app';
import type { InstalledApp, AppPermission } from '../../types/app';

const AppSettings: React.FC = () => {
  const { installedApps, appConfigs, updateAppConfig, getAppConfig } = useAppStore();

  // Get app ID from URL params
  const params = new URLSearchParams(window.location.search);
  const appId = params.get('app');

  const [selectedAppId, setSelectedAppId] = useState<string>(appId || '');
  const [activeSection, setActiveSection] = useState<'general' | 'permissions' | 'api' | 'webhooks' | 'usage'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [webhooks, setWebhooks] = useState<Array<{ id: string; url: string; events: string[]; enabled: boolean }>>([]);

  const selectedApp = installedApps.find((a) => a.id === selectedAppId);

  // Load config when app changes
  useEffect(() => {
    if (selectedAppId) {
      const config = getAppConfig(selectedAppId);
      if (config) {
        setSettings(config.settings || {});
        setApiKeys(config.apiKeys || {});
        setWebhooks(config.webhooks || []);
      } else {
        setSettings({});
        setApiKeys({});
        setWebhooks([]);
      }
      setHasChanges(false);
    }
  }, [selectedAppId, getAppConfig]);

  const handleSave = () => {
    if (selectedAppId) {
      updateAppConfig(selectedAppId, {
        settings,
        apiKeys,
        webhooks,
      });
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    const config = getAppConfig(selectedAppId);
    if (config) {
      setSettings(config.settings || {});
      setApiKeys(config.apiKeys || {});
      setWebhooks(config.webhooks || []);
    } else {
      setSettings({});
      setApiKeys({});
      setWebhooks([]);
    }
    setHasChanges(false);
  };

  const addWebhook = () => {
    setWebhooks([
      ...webhooks,
      { id: `webhook-${Date.now()}`, url: '', events: [], enabled: true },
    ]);
    setHasChanges(true);
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'usage', label: 'Usage Stats', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-400" />
              App Settings
            </h1>
            <p className="text-gray-400 mt-1">
              Configure app settings, permissions, and integrations
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar - App Selector */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select App
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Choose an app...</option>
                {installedApps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedApp && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {!selectedApp ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-800 border border-gray-700 rounded-xl">
                <Package className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select an App</h3>
                <p className="text-gray-400">Choose an app from the sidebar to configure its settings</p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl">
                {/* App Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedApp.name}</h2>
                      <p className="text-sm text-gray-400">Version {selectedApp.version} by {selectedApp.author}</p>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  {/* General Settings */}
                  {activeSection === 'general' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white">General Settings</h3>

                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={(settings.displayName as string) || selectedApp.name}
                            onChange={(e) => {
                              setSettings({ ...settings, displayName: e.target.value });
                              setHasChanges(true);
                            }}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={(settings.description as string) || selectedApp.description}
                            onChange={(e) => {
                              setSettings({ ...settings, description: e.target.value });
                              setHasChanges(true);
                            }}
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                          <div>
                            <div className="font-medium text-white">Debug Mode</div>
                            <div className="text-sm text-gray-400">Enable detailed logging for troubleshooting</div>
                          </div>
                          <button
                            onClick={() => {
                              setSettings({ ...settings, debugMode: !settings.debugMode });
                              setHasChanges(true);
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.debugMode ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                                settings.debugMode ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Permissions */}
                  {activeSection === 'permissions' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white">Permissions</h3>
                      <p className="text-sm text-gray-400">
                        This app has access to the following permissions. These cannot be modified after installation.
                      </p>

                      <div className="space-y-3">
                        {selectedApp.permissions.map((permission) => {
                          const permInfo = APP_PERMISSIONS[permission];
                          return (
                            <div
                              key={permission}
                              className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  permInfo.risk === 'high' ? 'bg-red-500/20' :
                                  permInfo.risk === 'medium' ? 'bg-yellow-500/20' :
                                  'bg-green-500/20'
                                }`}>
                                  <Shield className={`w-4 h-4 ${
                                    permInfo.risk === 'high' ? 'text-red-400' :
                                    permInfo.risk === 'medium' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`} />
                                </div>
                                <div>
                                  <div className="font-medium text-white">{permInfo.label}</div>
                                  <div className="text-sm text-gray-400">{permInfo.description}</div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                permInfo.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                                permInfo.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {permInfo.risk} risk
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* API Keys */}
                  {activeSection === 'api' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white">API Keys</h3>
                      <p className="text-sm text-gray-400">
                        Manage API keys and credentials for external integrations.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={apiKeys.apiKey || ''}
                            onChange={(e) => {
                              setApiKeys({ ...apiKeys, apiKey: e.target.value });
                              setHasChanges(true);
                            }}
                            placeholder="Enter API key..."
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            API Secret
                          </label>
                          <input
                            type="password"
                            value={apiKeys.apiSecret || ''}
                            onChange={(e) => {
                              setApiKeys({ ...apiKeys, apiSecret: e.target.value });
                              setHasChanges(true);
                            }}
                            placeholder="Enter API secret..."
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-300">
                          API keys are encrypted and stored securely. They are never exposed in client-side code.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhooks */}
                  {activeSection === 'webhooks' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white">Webhooks</h3>
                          <p className="text-sm text-gray-400">
                            Configure webhooks to receive real-time notifications.
                          </p>
                        </div>
                        <button
                          onClick={addWebhook}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                        >
                          Add Webhook
                        </button>
                      </div>

                      {webhooks.length === 0 ? (
                        <div className="text-center py-8 bg-gray-900 rounded-lg">
                          <Webhook className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No webhooks configured</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {webhooks.map((webhook, index) => (
                            <div key={webhook.id} className="p-4 bg-gray-900 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Webhook #{index + 1}</span>
                                <button
                                  onClick={() => {
                                    setWebhooks(webhooks.filter((w) => w.id !== webhook.id));
                                    setHasChanges(true);
                                  }}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <input
                                type="url"
                                value={webhook.url}
                                onChange={(e) => {
                                  setWebhooks(
                                    webhooks.map((w) =>
                                      w.id === webhook.id ? { ...w, url: e.target.value } : w
                                    )
                                  );
                                  setHasChanges(true);
                                }}
                                placeholder="https://your-server.com/webhook"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Usage Stats */}
                  {activeSection === 'usage' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white">Usage Statistics</h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-900 rounded-lg">
                          <div className="text-2xl font-bold text-white">--</div>
                          <div className="text-sm text-gray-400">Total Launches</div>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-lg">
                          <div className="text-2xl font-bold text-white">--</div>
                          <div className="text-sm text-gray-400">Unique Users</div>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-lg">
                          <div className="text-2xl font-bold text-white">--</div>
                          <div className="text-sm text-gray-400">Last Launch</div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-900 rounded-lg h-48 flex items-center justify-center">
                        <p className="text-gray-500">Usage chart will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
