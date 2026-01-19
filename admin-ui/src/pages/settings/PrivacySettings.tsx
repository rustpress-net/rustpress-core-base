/**
 * PrivacySettings - Configure privacy and GDPR compliance options
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Cookie, Eye, FileText, Users, Database, Lock,
  Save, RefreshCw, AlertTriangle, CheckCircle, Download,
  Trash2, Clock, Globe, Mail, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PrivacyConfig {
  // Privacy Policy
  privacyPolicyPage: string;
  termsOfServicePage: string;
  cookiePolicyPage: string;

  // Cookie Consent
  enableCookieConsent: boolean;
  cookieConsentStyle: 'banner' | 'popup' | 'floating';
  cookieConsentPosition: 'top' | 'bottom';
  cookieConsentText: string;
  acceptButtonText: string;
  declineButtonText: string;
  cookieCategories: {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };

  // Data Retention
  dataRetentionDays: number;
  deleteInactiveUsers: boolean;
  inactiveUserDays: number;
  anonymizeOldComments: boolean;
  commentAnonymizeDays: number;

  // User Data Rights (GDPR)
  enableDataExport: boolean;
  enableDataDeletion: boolean;
  enableConsentManagement: boolean;
  requireExplicitConsent: boolean;

  // Tracking
  enableAnalytics: boolean;
  anonymizeIpAddresses: boolean;
  respectDoNotTrack: boolean;

  // Third Party
  enableSocialSharing: boolean;
  enableEmbeds: boolean;
  embedsRequireConsent: boolean;

  // Logs
  logUserActivity: boolean;
  logRetentionDays: number;
  logIpAddresses: boolean;
}

const defaultConfig: PrivacyConfig = {
  privacyPolicyPage: '',
  termsOfServicePage: '',
  cookiePolicyPage: '',
  enableCookieConsent: true,
  cookieConsentStyle: 'banner',
  cookieConsentPosition: 'bottom',
  cookieConsentText: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
  acceptButtonText: 'Accept All',
  declineButtonText: 'Decline',
  cookieCategories: {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false
  },
  dataRetentionDays: 365,
  deleteInactiveUsers: false,
  inactiveUserDays: 730,
  anonymizeOldComments: false,
  commentAnonymizeDays: 365,
  enableDataExport: true,
  enableDataDeletion: true,
  enableConsentManagement: true,
  requireExplicitConsent: true,
  enableAnalytics: true,
  anonymizeIpAddresses: true,
  respectDoNotTrack: true,
  enableSocialSharing: true,
  enableEmbeds: true,
  embedsRequireConsent: true,
  logUserActivity: true,
  logRetentionDays: 90,
  logIpAddresses: false
};

// Mock pages for selection
const mockPages = [
  { id: '1', title: 'Privacy Policy' },
  { id: '2', title: 'Terms of Service' },
  { id: '3', title: 'Cookie Policy' },
  { id: '4', title: 'GDPR Information' }
];

export const PrivacySettings: React.FC = () => {
  const [config, setConfig] = useState<PrivacyConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'cookies' | 'gdpr' | 'tracking'>('general');

  const updateConfig = (key: keyof PrivacyConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateCookieCategory = (category: keyof typeof config.cookieCategories, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      cookieCategories: { ...prev.cookieCategories, [category]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Privacy settings saved');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Shield },
    { id: 'cookies', label: 'Cookies', icon: Cookie },
    { id: 'gdpr', label: 'GDPR', icon: Users },
    { id: 'tracking', label: 'Tracking', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="w-7 h-7 text-orange-500" />
              Privacy Settings
            </h1>
            <p className="text-gray-400 mt-1">Manage privacy, cookies, and GDPR compliance</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-lg">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Legal Pages
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Privacy Policy Page</label>
                    <select
                      value={config.privacyPolicyPage}
                      onChange={(e) => updateConfig('privacyPolicyPage', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">-- Select a page --</option>
                      {mockPages.map(page => (
                        <option key={page.id} value={page.id}>{page.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Terms of Service Page</label>
                    <select
                      value={config.termsOfServicePage}
                      onChange={(e) => updateConfig('termsOfServicePage', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">-- Select a page --</option>
                      {mockPages.map(page => (
                        <option key={page.id} value={page.id}>{page.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cookie Policy Page</label>
                    <select
                      value={config.cookiePolicyPage}
                      onChange={(e) => updateConfig('cookiePolicyPage', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">-- Select a page --</option>
                      {mockPages.map(page => (
                        <option key={page.id} value={page.id}>{page.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-400 font-medium">Legal Notice</p>
                      <p className="text-gray-400 mt-1">
                        Ensure your privacy policy complies with applicable laws (GDPR, CCPA, etc.) in your jurisdiction.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-400" />
                  Data Retention
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data Retention Period (days)
                    </label>
                    <input
                      type="number"
                      value={config.dataRetentionDays}
                      onChange={(e) => updateConfig('dataRetentionDays', parseInt(e.target.value))}
                      min={30}
                      className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">How long to keep user data before automatic deletion</p>
                  </div>

                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Delete Inactive Users</div>
                      <div className="text-xs text-gray-500">Remove accounts that haven't logged in</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.deleteInactiveUsers}
                      onChange={(e) => updateConfig('deleteInactiveUsers', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  {config.deleteInactiveUsers && (
                    <div className="pl-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Inactive Period (days)</label>
                      <input
                        type="number"
                        value={config.inactiveUserDays}
                        onChange={(e) => updateConfig('inactiveUserDays', parseInt(e.target.value))}
                        min={90}
                        className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Anonymize Old Comments</div>
                      <div className="text-xs text-gray-500">Remove personal info from old comments</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.anonymizeOldComments}
                      onChange={(e) => updateConfig('anonymizeOldComments', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                </div>
              </motion.div>
            </>
          )}

          {/* Cookies Tab */}
          {activeTab === 'cookies' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-yellow-400" />
                  Cookie Consent Banner
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Enable Cookie Consent</div>
                      <div className="text-xs text-gray-500">Show cookie consent banner to visitors</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableCookieConsent}
                      onChange={(e) => updateConfig('enableCookieConsent', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  {config.enableCookieConsent && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Banner Style</label>
                          <select
                            value={config.cookieConsentStyle}
                            onChange={(e) => updateConfig('cookieConsentStyle', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          >
                            <option value="banner">Full-width Banner</option>
                            <option value="popup">Center Popup</option>
                            <option value="floating">Floating Box</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                          <select
                            value={config.cookieConsentPosition}
                            onChange={(e) => updateConfig('cookieConsentPosition', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          >
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Consent Message</label>
                        <textarea
                          value={config.cookieConsentText}
                          onChange={(e) => updateConfig('cookieConsentText', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Accept Button Text</label>
                          <input
                            type="text"
                            value={config.acceptButtonText}
                            onChange={(e) => updateConfig('acceptButtonText', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Decline Button Text</label>
                          <input
                            type="text"
                            value={config.declineButtonText}
                            onChange={(e) => updateConfig('declineButtonText', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {config.enableCookieConsent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 rounded-xl border border-gray-800 p-6"
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ToggleRight className="w-5 h-5 text-purple-400" />
                    Cookie Categories
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Necessary Cookies</div>
                        <div className="text-xs text-gray-500">Required for basic site functionality</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-400">Always enabled</span>
                        <Lock className="w-4 h-4 text-green-400" />
                      </div>
                    </div>

                    <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                      <div>
                        <div className="font-medium text-sm">Functional Cookies</div>
                        <div className="text-xs text-gray-500">Enable enhanced features and preferences</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.cookieCategories.functional}
                        onChange={(e) => updateCookieCategory('functional', e.target.checked)}
                        className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                      <div>
                        <div className="font-medium text-sm">Analytics Cookies</div>
                        <div className="text-xs text-gray-500">Help understand how visitors use the site</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.cookieCategories.analytics}
                        onChange={(e) => updateCookieCategory('analytics', e.target.checked)}
                        className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                      <div>
                        <div className="font-medium text-sm">Marketing Cookies</div>
                        <div className="text-xs text-gray-500">Used for advertising and remarketing</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.cookieCategories.marketing}
                        onChange={(e) => updateCookieCategory('marketing', e.target.checked)}
                        className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                      />
                    </label>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* GDPR Tab */}
          {activeTab === 'gdpr' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-800 p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Data Rights (GDPR)
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-green-400" />
                      Enable Data Export
                    </div>
                    <div className="text-xs text-gray-500">Allow users to download their personal data</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableDataExport}
                    onChange={(e) => updateConfig('enableDataExport', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-400" />
                      Enable Data Deletion
                    </div>
                    <div className="text-xs text-gray-500">Allow users to request account deletion</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableDataDeletion}
                    onChange={(e) => updateConfig('enableDataDeletion', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <ToggleLeft className="w-4 h-4 text-purple-400" />
                      Enable Consent Management
                    </div>
                    <div className="text-xs text-gray-500">Allow users to manage their data preferences</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableConsentManagement}
                    onChange={(e) => updateConfig('enableConsentManagement', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      Require Explicit Consent
                    </div>
                    <div className="text-xs text-gray-500">Users must actively opt-in (not pre-checked)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.requireExplicitConsent}
                    onChange={(e) => updateConfig('requireExplicitConsent', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>
              </div>

              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-green-400 font-medium">GDPR Compliance</p>
                    <p className="text-gray-400 mt-1">
                      These settings help ensure compliance with GDPR and similar privacy regulations.
                      Consult with a legal professional for full compliance.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  Tracking & Analytics
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Enable Analytics</div>
                      <div className="text-xs text-gray-500">Collect anonymous usage statistics</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableAnalytics}
                      onChange={(e) => updateConfig('enableAnalytics', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Anonymize IP Addresses</div>
                      <div className="text-xs text-gray-500">Mask visitor IP addresses in analytics</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.anonymizeIpAddresses}
                      onChange={(e) => updateConfig('anonymizeIpAddresses', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Respect Do Not Track</div>
                      <div className="text-xs text-gray-500">Honor browser DNT signals</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.respectDoNotTrack}
                      onChange={(e) => updateConfig('respectDoNotTrack', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Third-Party Content
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Enable Social Sharing</div>
                      <div className="text-xs text-gray-500">Allow social media share buttons</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableSocialSharing}
                      onChange={(e) => updateConfig('enableSocialSharing', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Enable Embeds</div>
                      <div className="text-xs text-gray-500">Allow YouTube, Twitter, etc. embeds</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableEmbeds}
                      onChange={(e) => updateConfig('enableEmbeds', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  {config.enableEmbeds && (
                    <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer ml-4">
                      <div>
                        <div className="font-medium text-sm">Require Consent for Embeds</div>
                        <div className="text-xs text-gray-500">Show placeholder until user consents</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.embedsRequireConsent}
                        onChange={(e) => updateConfig('embedsRequireConsent', e.target.checked)}
                        className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                      />
                    </label>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Activity Logs
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium text-sm">Log User Activity</div>
                      <div className="text-xs text-gray-500">Track logins, page views, actions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.logUserActivity}
                      onChange={(e) => updateConfig('logUserActivity', e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  {config.logUserActivity && (
                    <>
                      <div className="pl-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Log Retention (days)</label>
                        <input
                          type="number"
                          value={config.logRetentionDays}
                          onChange={(e) => updateConfig('logRetentionDays', parseInt(e.target.value))}
                          min={7}
                          max={365}
                          className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                      </div>

                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer ml-4">
                        <div>
                          <div className="font-medium text-sm">Log IP Addresses</div>
                          <div className="text-xs text-gray-500">Store visitor IPs in activity logs</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.logIpAddresses}
                          onChange={(e) => updateConfig('logIpAddresses', e.target.checked)}
                          className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                        />
                      </label>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
