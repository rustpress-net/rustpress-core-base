/**
 * SettingsPanel - General site settings management
 * RustPress-specific settings functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Globe, Mail, Lock, Bell, Palette, Database,
  Server, Shield, Zap, Users, FileText, Image, Code,
  Save, RotateCcw, ChevronRight, Check, AlertTriangle,
  Eye, EyeOff, Copy, ExternalLink
} from 'lucide-react';

export interface SettingsSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  settings: Setting[];
}

export interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'toggle' | 'select' | 'password' | 'color';
  value: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

interface SettingsPanelProps {
  onSave?: (settings: Record<string, any>) => void;
}

const mockSections: SettingsSection[] = [
  {
    id: 'general',
    name: 'General',
    icon: <Globe className="w-4 h-4" />,
    settings: [
      { id: 'site_title', label: 'Site Title', type: 'text', value: 'My RustPress Site', required: true },
      { id: 'tagline', label: 'Tagline', type: 'text', value: 'Just another RustPress site', description: 'A short description of your site' },
      { id: 'site_url', label: 'Site URL', type: 'url', value: 'https://example.com', required: true },
      { id: 'admin_email', label: 'Admin Email', type: 'email', value: 'admin@example.com', required: true },
      { id: 'timezone', label: 'Timezone', type: 'select', value: 'UTC', options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
      ]},
      { id: 'date_format', label: 'Date Format', type: 'select', value: 'Y-m-d', options: [
        { value: 'Y-m-d', label: '2024-01-15' },
        { value: 'm/d/Y', label: '01/15/2024' },
        { value: 'd/m/Y', label: '15/01/2024' },
        { value: 'F j, Y', label: 'January 15, 2024' },
      ]},
      { id: 'language', label: 'Site Language', type: 'select', value: 'en', options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'ja', label: 'Japanese' },
        { value: 'zh', label: 'Chinese' },
      ]},
    ]
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: <FileText className="w-4 h-4" />,
    settings: [
      { id: 'posts_per_page', label: 'Posts per Page', type: 'number', value: 10, description: 'Number of posts to show on blog pages' },
      { id: 'homepage_display', label: 'Homepage Display', type: 'select', value: 'latest', options: [
        { value: 'latest', label: 'Latest Posts' },
        { value: 'static', label: 'Static Page' },
      ]},
      { id: 'excerpt_length', label: 'Excerpt Length', type: 'number', value: 55, description: 'Number of words in post excerpts' },
      { id: 'show_full_posts', label: 'Show Full Posts on Archive', type: 'toggle', value: false },
      { id: 'search_engine_visibility', label: 'Discourage Search Engines', type: 'toggle', value: false, description: 'Ask search engines not to index this site' },
    ]
  },
  {
    id: 'writing',
    name: 'Writing',
    icon: <Code className="w-4 h-4" />,
    settings: [
      { id: 'default_category', label: 'Default Category', type: 'select', value: 'uncategorized', options: [
        { value: 'uncategorized', label: 'Uncategorized' },
        { value: 'news', label: 'News' },
        { value: 'blog', label: 'Blog' },
      ]},
      { id: 'default_post_format', label: 'Default Post Format', type: 'select', value: 'standard', options: [
        { value: 'standard', label: 'Standard' },
        { value: 'aside', label: 'Aside' },
        { value: 'gallery', label: 'Gallery' },
        { value: 'video', label: 'Video' },
        { value: 'quote', label: 'Quote' },
      ]},
      { id: 'enable_markdown', label: 'Enable Markdown', type: 'toggle', value: true },
      { id: 'auto_save_interval', label: 'Auto-save Interval (seconds)', type: 'number', value: 60 },
    ]
  },
  {
    id: 'media',
    name: 'Media',
    icon: <Image className="w-4 h-4" />,
    settings: [
      { id: 'thumbnail_size', label: 'Thumbnail Size', type: 'text', value: '150x150', description: 'Width x Height in pixels' },
      { id: 'medium_size', label: 'Medium Size', type: 'text', value: '300x300' },
      { id: 'large_size', label: 'Large Size', type: 'text', value: '1024x1024' },
      { id: 'upload_organize', label: 'Organize Uploads by Date', type: 'toggle', value: true },
      { id: 'max_upload_size', label: 'Max Upload Size (MB)', type: 'number', value: 64 },
      { id: 'allowed_types', label: 'Allowed File Types', type: 'text', value: 'jpg,jpeg,png,gif,webp,svg,pdf,doc,docx' },
    ]
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: <Zap className="w-4 h-4" />,
    settings: [
      { id: 'enable_caching', label: 'Enable Page Caching', type: 'toggle', value: true },
      { id: 'cache_lifetime', label: 'Cache Lifetime (hours)', type: 'number', value: 24 },
      { id: 'minify_html', label: 'Minify HTML', type: 'toggle', value: true },
      { id: 'minify_css', label: 'Minify CSS', type: 'toggle', value: true },
      { id: 'minify_js', label: 'Minify JavaScript', type: 'toggle', value: true },
      { id: 'lazy_load_images', label: 'Lazy Load Images', type: 'toggle', value: true },
      { id: 'enable_gzip', label: 'Enable GZIP Compression', type: 'toggle', value: true },
    ]
  },
  {
    id: 'security',
    name: 'Security',
    icon: <Shield className="w-4 h-4" />,
    settings: [
      { id: 'force_ssl', label: 'Force SSL/HTTPS', type: 'toggle', value: true },
      { id: 'login_attempts', label: 'Max Login Attempts', type: 'number', value: 5 },
      { id: 'lockout_duration', label: 'Lockout Duration (minutes)', type: 'number', value: 30 },
      { id: 'two_factor_auth', label: 'Enable Two-Factor Auth', type: 'toggle', value: false },
      { id: 'api_rate_limit', label: 'API Rate Limit (req/min)', type: 'number', value: 100 },
      { id: 'security_headers', label: 'Enable Security Headers', type: 'toggle', value: true },
    ]
  },
  {
    id: 'mail',
    name: 'Mail',
    icon: <Mail className="w-4 h-4" />,
    settings: [
      { id: 'mail_from_name', label: 'From Name', type: 'text', value: 'RustPress' },
      { id: 'mail_from_email', label: 'From Email', type: 'email', value: 'noreply@example.com' },
      { id: 'smtp_host', label: 'SMTP Host', type: 'text', value: 'smtp.example.com' },
      { id: 'smtp_port', label: 'SMTP Port', type: 'number', value: 587 },
      { id: 'smtp_username', label: 'SMTP Username', type: 'text', value: '' },
      { id: 'smtp_password', label: 'SMTP Password', type: 'password', value: '' },
      { id: 'smtp_encryption', label: 'Encryption', type: 'select', value: 'tls', options: [
        { value: 'none', label: 'None' },
        { value: 'ssl', label: 'SSL' },
        { value: 'tls', label: 'TLS' },
      ]},
    ]
  },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onSave
}) => {
  const [sections, setSections] = useState<SettingsSection[]>(mockSections);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [savedNotification, setSavedNotification] = useState(false);

  const updateSetting = (sectionId: string, settingId: string, value: any) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          settings: section.settings.map(s =>
            s.id === settingId ? { ...s, value } : s
          )
        };
      }
      return section;
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const allSettings = sections.reduce((acc, section) => {
      section.settings.forEach(s => {
        acc[s.id] = s.value;
      });
      return acc;
    }, {} as Record<string, any>);

    onSave?.(allSettings);
    setHasChanges(false);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleReset = () => {
    setSections(mockSections);
    setHasChanges(false);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar */}
      <div className="w-56 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Settings
          </h2>
        </div>

        <div className="flex-1 overflow-auto py-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {section.icon}
              <span className="font-medium">{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{currentSection?.name}</h3>
            <p className="text-sm text-gray-400">Configure {currentSection?.name.toLowerCase()} settings</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Saved Notification */}
        <AnimatePresence>
          {savedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400"
            >
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Form */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl space-y-6">
            {currentSection?.settings.map(setting => (
              <div key={setting.id} className="space-y-2">
                <label className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {setting.label}
                    {setting.required && <span className="text-red-400">*</span>}
                  </span>
                </label>

                {setting.type === 'toggle' ? (
                  <button
                    onClick={() => updateSetting(activeSection, setting.id, !setting.value)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      setting.value ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        setting.value ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                ) : setting.type === 'select' ? (
                  <select
                    value={setting.value}
                    onChange={(e) => updateSetting(activeSection, setting.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {setting.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : setting.type === 'textarea' ? (
                  <textarea
                    value={setting.value}
                    onChange={(e) => updateSetting(activeSection, setting.id, e.target.value)}
                    placeholder={setting.placeholder}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    rows={4}
                  />
                ) : setting.type === 'password' ? (
                  <div className="relative">
                    <input
                      type={showPassword[setting.id] ? 'text' : 'password'}
                      value={setting.value}
                      onChange={(e) => updateSetting(activeSection, setting.id, e.target.value)}
                      placeholder={setting.placeholder}
                      className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <button
                      onClick={() => togglePasswordVisibility(setting.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword[setting.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                ) : setting.type === 'color' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={setting.value}
                      onChange={(e) => updateSetting(activeSection, setting.id, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border border-gray-700"
                    />
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => updateSetting(activeSection, setting.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono"
                    />
                  </div>
                ) : (
                  <input
                    type={setting.type}
                    value={setting.value}
                    onChange={(e) => updateSetting(activeSection, setting.id,
                      setting.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                    )}
                    placeholder={setting.placeholder}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                )}

                {setting.description && (
                  <p className="text-xs text-gray-500">{setting.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
