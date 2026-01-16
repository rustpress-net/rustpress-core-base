/**
 * Google Analytics Settings Page
 *
 * Admin settings for configuring Google Analytics integration.
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Shield,
  Bell,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  Save,
  TestTube,
  Trash2,
  Database,
  Clock,
} from 'lucide-react';
import { useAnalyticsStore } from '../../store/analyticsStore';

interface SettingsFormData {
  // Google Analytics Configuration
  gaPropertyId: string;
  gaMeasurementId: string;
  serviceAccountJson: string;

  // Tracking Options
  enableTracking: boolean;
  trackLoggedInUsers: boolean;
  trackAdminUsers: boolean;
  anonymizeIp: boolean;
  respectDnt: boolean;
  cookieConsentRequired: boolean;
  enhancedLinkAttribution: boolean;
  enhancedEcommerce: boolean;

  // Dashboard Preferences
  defaultDateRange: string;
  showRealtimeWidget: boolean;
  showTrafficWidget: boolean;
  showToppagesWidget: boolean;
  showAcquisitionWidget: boolean;

  // Report Settings
  reportEmailEnabled: boolean;
  reportEmailRecipients: string;
  reportFrequency: string;

  // Privacy & Compliance
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

const GoogleAnalyticsSettings: React.FC = () => {
  const {
    settings,
    connectionStatus,
    syncStatus,
    cacheStats,
    availableProperties,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    testConnection,
    fetchAvailableProperties,
    syncData,
    clearCache,
    fetchSyncStatus,
    fetchCacheStats,
    clearError,
  } = useAnalyticsStore();

  const [formData, setFormData] = useState<SettingsFormData>({
    gaPropertyId: '',
    gaMeasurementId: '',
    serviceAccountJson: '',
    enableTracking: true,
    trackLoggedInUsers: true,
    trackAdminUsers: false,
    anonymizeIp: true,
    respectDnt: true,
    cookieConsentRequired: true,
    enhancedLinkAttribution: false,
    enhancedEcommerce: false,
    defaultDateRange: 'last7days',
    showRealtimeWidget: true,
    showTrafficWidget: true,
    showToppagesWidget: true,
    showAcquisitionWidget: true,
    reportEmailEnabled: false,
    reportEmailRecipients: '',
    reportFrequency: 'weekly',
    gdprCompliant: true,
    ccpaCompliant: false,
  });

  const [activeSection, setActiveSection] = useState('configuration');
  const [showServiceAccountKey, setShowServiceAccountKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchSyncStatus();
    fetchCacheStats();
  }, [fetchSettings, fetchSyncStatus, fetchCacheStats]);

  useEffect(() => {
    if (settings) {
      setFormData({
        gaPropertyId: settings.gaPropertyId || '',
        gaMeasurementId: settings.gaMeasurementId || '',
        serviceAccountJson: settings.serviceAccountJson || '',
        enableTracking: settings.enableTracking ?? true,
        trackLoggedInUsers: settings.trackLoggedInUsers ?? true,
        trackAdminUsers: settings.trackAdminUsers ?? false,
        anonymizeIp: settings.anonymizeIp ?? true,
        respectDnt: settings.respectDnt ?? true,
        cookieConsentRequired: settings.cookieConsentRequired ?? true,
        enhancedLinkAttribution: settings.enhancedLinkAttribution ?? false,
        enhancedEcommerce: settings.enhancedEcommerce ?? false,
        defaultDateRange: settings.defaultDateRange || 'last7days',
        showRealtimeWidget: settings.showRealtimeWidget ?? true,
        showTrafficWidget: settings.showTrafficWidget ?? true,
        showToppagesWidget: settings.showToppagesWidget ?? true,
        showAcquisitionWidget: settings.showAcquisitionWidget ?? true,
        reportEmailEnabled: settings.reportEmailEnabled ?? false,
        reportEmailRecipients: settings.reportEmailRecipients?.join(', ') || '',
        reportFrequency: settings.reportFrequency || 'weekly',
        gdprCompliant: settings.gdprCompliant ?? true,
        ccpaCompliant: settings.ccpaCompliant ?? false,
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof SettingsFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleInputChange('serviceAccountJson', content);
      };
      reader.readAsText(file);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    clearError();
    try {
      await updateSettings({
        gaPropertyId: formData.gaPropertyId,
        gaMeasurementId: formData.gaMeasurementId,
        serviceAccountJson: formData.serviceAccountJson || undefined,
        enableTracking: formData.enableTracking,
        trackLoggedInUsers: formData.trackLoggedInUsers,
        trackAdminUsers: formData.trackAdminUsers,
        anonymizeIp: formData.anonymizeIp,
        respectDnt: formData.respectDnt,
        cookieConsentRequired: formData.cookieConsentRequired,
        enhancedLinkAttribution: formData.enhancedLinkAttribution,
        enhancedEcommerce: formData.enhancedEcommerce,
        defaultDateRange: formData.defaultDateRange,
        showRealtimeWidget: formData.showRealtimeWidget,
        showTrafficWidget: formData.showTrafficWidget,
        showToppagesWidget: formData.showToppagesWidget,
        showAcquisitionWidget: formData.showAcquisitionWidget,
        reportEmailEnabled: formData.reportEmailEnabled,
        reportEmailRecipients: formData.reportEmailRecipients.split(',').map((e) => e.trim()).filter(Boolean),
        reportFrequency: formData.reportFrequency,
        gdprCompliant: formData.gdprCompliant,
        ccpaCompliant: formData.ccpaCompliant,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      await syncData();
    } catch {
      // Error handled by store
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear the analytics cache? This will force a refresh of all data.')) {
      try {
        await clearCache();
      } catch {
        // Error handled by store
      }
    }
  };

  const sections = [
    { id: 'configuration', label: 'Configuration', icon: Key },
    { id: 'tracking', label: 'Tracking', icon: BarChart3 },
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'reports', label: 'Reports', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last14days', label: 'Last 14 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'thisyear', label: 'This Year' },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Google Analytics Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Configure your Google Analytics integration and preferences.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {saveSuccess && (
                <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Saved successfully
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-8">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Configuration Section */}
            {activeSection === 'configuration' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Google Analytics Configuration
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Connect your Google Analytics 4 property to start collecting data.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Property ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GA4 Property ID
                    </label>
                    <input
                      type="text"
                      value={formData.gaPropertyId}
                      onChange={(e) => handleInputChange('gaPropertyId', e.target.value)}
                      placeholder="properties/123456789"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Find this in Google Analytics Admin &gt; Property Settings
                    </p>
                  </div>

                  {/* Measurement ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Measurement ID
                    </label>
                    <input
                      type="text"
                      value={formData.gaMeasurementId}
                      onChange={(e) => handleInputChange('gaMeasurementId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Used for client-side tracking. Find this in Data Streams settings.
                    </p>
                  </div>

                  {/* Service Account JSON */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Account JSON Key
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload JSON File
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.serviceAccountJson && (
                          <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Key uploaded
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <textarea
                          value={formData.serviceAccountJson}
                          onChange={(e) => handleInputChange('serviceAccountJson', e.target.value)}
                          placeholder='{"type": "service_account", ...}'
                          rows={4}
                          className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                            !showServiceAccountKey ? 'text-security-disc' : ''
                          }`}
                          style={!showServiceAccountKey ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : {}}
                        />
                        <button
                          type="button"
                          onClick={() => setShowServiceAccountKey(!showServiceAccountKey)}
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showServiceAccountKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Create a service account in Google Cloud Console and download the JSON key.
                    </p>
                  </div>

                  {/* Property Selection */}
                  {availableProperties.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Property
                      </label>
                      <select
                        value={formData.gaPropertyId}
                        onChange={(e) => handleInputChange('gaPropertyId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a property...</option>
                        {availableProperties.map((prop) => (
                          <option key={prop.propertyId} value={prop.propertyId}>
                            {prop.displayName} ({prop.accountName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Test Connection */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Connection Status
                        </h3>
                        {connectionStatus && (
                          <p className={`text-sm mt-1 ${
                            connectionStatus.success
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {connectionStatus.success
                              ? `Connected to ${connectionStatus.propertyName}`
                              : connectionStatus.error}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleTestConnection}
                        disabled={isTesting || !formData.gaPropertyId}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isTesting ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Section */}
            {activeSection === 'tracking' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tracking Options
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure how visitor data is collected and processed.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Enable Tracking */}
                  <ToggleOption
                    label="Enable Tracking"
                    description="Add Google Analytics tracking code to your site"
                    checked={formData.enableTracking}
                    onChange={(v) => handleInputChange('enableTracking', v)}
                  />

                  {/* Track Logged In Users */}
                  <ToggleOption
                    label="Track Logged-in Users"
                    description="Include logged-in users in analytics data"
                    checked={formData.trackLoggedInUsers}
                    onChange={(v) => handleInputChange('trackLoggedInUsers', v)}
                  />

                  {/* Track Admin Users */}
                  <ToggleOption
                    label="Track Admin Users"
                    description="Include administrator visits in analytics"
                    checked={formData.trackAdminUsers}
                    onChange={(v) => handleInputChange('trackAdminUsers', v)}
                  />

                  {/* Anonymize IP */}
                  <ToggleOption
                    label="Anonymize IP Addresses"
                    description="Remove the last octet of visitor IP addresses"
                    checked={formData.anonymizeIp}
                    onChange={(v) => handleInputChange('anonymizeIp', v)}
                  />

                  {/* Respect DNT */}
                  <ToggleOption
                    label="Respect Do Not Track"
                    description="Honor browser DNT settings and skip tracking"
                    checked={formData.respectDnt}
                    onChange={(v) => handleInputChange('respectDnt', v)}
                  />

                  {/* Cookie Consent */}
                  <ToggleOption
                    label="Require Cookie Consent"
                    description="Wait for user consent before setting cookies"
                    checked={formData.cookieConsentRequired}
                    onChange={(v) => handleInputChange('cookieConsentRequired', v)}
                  />

                  {/* Enhanced Link Attribution */}
                  <ToggleOption
                    label="Enhanced Link Attribution"
                    description="Track clicks on multiple links to the same URL"
                    checked={formData.enhancedLinkAttribution}
                    onChange={(v) => handleInputChange('enhancedLinkAttribution', v)}
                  />

                  {/* Enhanced E-commerce */}
                  <ToggleOption
                    label="Enhanced E-commerce"
                    description="Enable advanced e-commerce tracking features"
                    checked={formData.enhancedEcommerce}
                    onChange={(v) => handleInputChange('enhancedEcommerce', v)}
                  />
                </div>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dashboard Preferences
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Customize your analytics dashboard experience.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Default Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Date Range
                    </label>
                    <select
                      value={formData.defaultDateRange}
                      onChange={(e) => handleInputChange('defaultDateRange', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {dateRangeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Dashboard Widgets
                    </h3>
                    <div className="space-y-4">
                      <ToggleOption
                        label="Real-time Widget"
                        description="Show live visitor count on the dashboard"
                        checked={formData.showRealtimeWidget}
                        onChange={(v) => handleInputChange('showRealtimeWidget', v)}
                      />
                      <ToggleOption
                        label="Traffic Widget"
                        description="Display traffic trends chart"
                        checked={formData.showTrafficWidget}
                        onChange={(v) => handleInputChange('showTrafficWidget', v)}
                      />
                      <ToggleOption
                        label="Top Pages Widget"
                        description="Show most visited pages"
                        checked={formData.showToppagesWidget}
                        onChange={(v) => handleInputChange('showToppagesWidget', v)}
                      />
                      <ToggleOption
                        label="Acquisition Widget"
                        description="Display traffic sources breakdown"
                        checked={formData.showAcquisitionWidget}
                        onChange={(v) => handleInputChange('showAcquisitionWidget', v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Section */}
            {activeSection === 'reports' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Report Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure automated email reports.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Enable Email Reports */}
                  <ToggleOption
                    label="Email Reports"
                    description="Send periodic analytics reports via email"
                    checked={formData.reportEmailEnabled}
                    onChange={(v) => handleInputChange('reportEmailEnabled', v)}
                  />

                  {formData.reportEmailEnabled && (
                    <>
                      {/* Recipients */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Report Recipients
                        </label>
                        <input
                          type="text"
                          value={formData.reportEmailRecipients}
                          onChange={(e) => handleInputChange('reportEmailRecipients', e.target.value)}
                          placeholder="email1@example.com, email2@example.com"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Separate multiple email addresses with commas
                        </p>
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Report Frequency
                        </label>
                        <select
                          value={formData.reportFrequency}
                          onChange={(e) => handleInputChange('reportFrequency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {frequencyOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Privacy & Compliance
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure privacy settings for regulatory compliance.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* GDPR Compliance */}
                  <ToggleOption
                    label="GDPR Compliance Mode"
                    description="Enable features for EU General Data Protection Regulation compliance"
                    checked={formData.gdprCompliant}
                    onChange={(v) => handleInputChange('gdprCompliant', v)}
                  />

                  {/* CCPA Compliance */}
                  <ToggleOption
                    label="CCPA Compliance Mode"
                    description="Enable features for California Consumer Privacy Act compliance"
                    checked={formData.ccpaCompliant}
                    onChange={(v) => handleInputChange('ccpaCompliant', v)}
                  />

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Note:</strong> Enabling compliance modes will automatically configure IP anonymization,
                      cookie consent requirements, and data retention settings to meet regulatory standards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Section */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                {/* Sync Status */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Data Synchronization
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Manage analytics data sync from Google Analytics.
                    </p>
                  </div>

                  <div className="p-6">
                    {syncStatus && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                          <div className={`text-lg font-semibold ${
                            syncStatus.isSyncing
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {syncStatus.isSyncing ? 'Syncing...' : 'Idle'}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Last Sync</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {syncStatus.lastSync
                              ? new Date(syncStatus.lastSync).toLocaleString()
                              : 'Never'}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total Syncs</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {syncStatus.totalSyncs}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Failed Syncs</div>
                          <div className={`text-lg font-semibold ${
                            syncStatus.failedSyncs > 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {syncStatus.failedSyncs}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSync}
                      disabled={isLoading || syncStatus?.isSyncing}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus?.isSyncing ? 'animate-spin' : ''}`} />
                      {syncStatus?.isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                </div>

                {/* Cache Management */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cache Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Manage the analytics data cache.
                    </p>
                  </div>

                  <div className="p-6">
                    {cacheStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Cached Items</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {cacheStats.memoryEntries} / {cacheStats.maxEntries}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Cache Size</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {(cacheStats.memorySizeBytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Expired</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {cacheStats.expiredEntries}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">TTL</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {cacheStats.cacheDurationMinutes} min
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleClearCache}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Option Component
interface ToggleOptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default GoogleAnalyticsSettings;
