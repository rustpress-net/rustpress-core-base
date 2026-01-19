/**
 * PermalinksSettings - Configure URL structure
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2, FileText, Tag, FolderOpen, Calendar, Hash,
  Save, RefreshCw, AlertCircle, CheckCircle, Eye, Code
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PermalinksConfig {
  // Structure
  structure: 'plain' | 'day-name' | 'month-name' | 'numeric' | 'post-name' | 'custom';
  customStructure: string;

  // Optional bases
  categoryBase: string;
  tagBase: string;
  authorBase: string;
  searchBase: string;
  pageBase: string;

  // Trailing slashes
  trailingSlash: boolean;

  // File extensions
  addExtension: boolean;
  extension: string;

  // Redirects
  redirectOldSlugs: boolean;
  forceHttps: boolean;
  removeWww: boolean;
  lowercaseUrls: boolean;

  // Advanced
  enablePrettyUrls: boolean;
  stripCategoryBase: boolean;
  stripTagBase: boolean;
}

const defaultConfig: PermalinksConfig = {
  structure: 'post-name',
  customStructure: '/%postname%/',
  categoryBase: 'category',
  tagBase: 'tag',
  authorBase: 'author',
  searchBase: 'search',
  pageBase: 'page',
  trailingSlash: true,
  addExtension: false,
  extension: '.html',
  redirectOldSlugs: true,
  forceHttps: true,
  removeWww: false,
  lowercaseUrls: true,
  enablePrettyUrls: true,
  stripCategoryBase: false,
  stripTagBase: false
};

const structureOptions = [
  {
    id: 'plain',
    label: 'Plain',
    example: '?p=123',
    description: 'Default query string format'
  },
  {
    id: 'day-name',
    label: 'Day and name',
    example: '/2026/01/17/sample-post/',
    description: 'Date-based with post name'
  },
  {
    id: 'month-name',
    label: 'Month and name',
    example: '/2026/01/sample-post/',
    description: 'Month-based with post name'
  },
  {
    id: 'numeric',
    label: 'Numeric',
    example: '/archives/123',
    description: 'Numeric post ID'
  },
  {
    id: 'post-name',
    label: 'Post name',
    example: '/sample-post/',
    description: 'Clean URL with just post name'
  },
  {
    id: 'custom',
    label: 'Custom Structure',
    example: 'Define your own',
    description: 'Use available tags below'
  }
];

const availableTags = [
  { tag: '%year%', description: 'The year of the post (4 digits)' },
  { tag: '%monthnum%', description: 'Month of the post (2 digits)' },
  { tag: '%day%', description: 'Day of the post (2 digits)' },
  { tag: '%hour%', description: 'Hour of the post (2 digits)' },
  { tag: '%minute%', description: 'Minute of the post (2 digits)' },
  { tag: '%second%', description: 'Second of the post (2 digits)' },
  { tag: '%post_id%', description: 'The unique ID of the post' },
  { tag: '%postname%', description: 'The sanitized post title (slug)' },
  { tag: '%category%', description: 'The post category' },
  { tag: '%author%', description: 'The post author' }
];

export const PermalinksSettings: React.FC = () => {
  const [config, setConfig] = useState<PermalinksConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = (key: keyof PermalinksConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Permalink settings saved');
  };

  const getExampleUrl = () => {
    const base = 'https://example.com';
    let path = '';

    switch (config.structure) {
      case 'plain':
        return `${base}/?p=123`;
      case 'day-name':
        path = '/2026/01/17/sample-post';
        break;
      case 'month-name':
        path = '/2026/01/sample-post';
        break;
      case 'numeric':
        path = '/archives/123';
        break;
      case 'post-name':
        path = '/sample-post';
        break;
      case 'custom':
        path = config.customStructure
          .replace('%year%', '2026')
          .replace('%monthnum%', '01')
          .replace('%day%', '17')
          .replace('%hour%', '14')
          .replace('%minute%', '30')
          .replace('%second%', '00')
          .replace('%post_id%', '123')
          .replace('%postname%', 'sample-post')
          .replace('%category%', 'news')
          .replace('%author%', 'admin');
        break;
    }

    if (config.trailingSlash && !path.endsWith('/')) {
      path += '/';
    } else if (!config.trailingSlash && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    if (config.addExtension) {
      path = path.replace(/\/$/, '') + config.extension;
    }

    return base + path;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Link2 className="w-7 h-7 text-orange-500" />
              Permalink Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure your URL structure</p>
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

        <div className="space-y-6">
          {/* URL Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Preview</span>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 font-mono text-sm">
              <span className="text-gray-500">Your URLs will look like:</span>
              <div className="text-green-400 mt-1 break-all">{getExampleUrl()}</div>
            </div>
          </motion.div>

          {/* Common Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Common Settings
            </h2>

            <div className="space-y-3">
              {structureOptions.map(option => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                    config.structure === option.id
                      ? 'bg-orange-500/10 border border-orange-500/50'
                      : 'bg-gray-800 border border-transparent hover:border-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="structure"
                    checked={config.structure === option.id}
                    onChange={() => updateConfig('structure', option.id)}
                    className="mt-1 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                    <code className="text-xs bg-gray-900 px-2 py-0.5 rounded text-green-400 mt-1 inline-block">
                      {option.example}
                    </code>
                  </div>
                </label>
              ))}
            </div>

            {config.structure === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Custom Structure</label>
                <input
                  type="text"
                  value={config.customStructure}
                  onChange={(e) => updateConfig('customStructure', e.target.value)}
                  placeholder="/%category%/%postname%/"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono"
                />

                <div className="mt-3">
                  <div className="text-sm text-gray-400 mb-2">Available tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag.tag}
                        onClick={() => updateConfig('customStructure', config.customStructure + tag.tag)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-mono text-cyan-400 transition-colors"
                        title={tag.description}
                      >
                        {tag.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Optional Bases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-green-400" />
              Optional Bases
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              These settings customize the base path for archives. Leave empty for defaults.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category Base
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
                  <input
                    type="text"
                    value={config.categoryBase}
                    onChange={(e) => updateConfig('categoryBase', e.target.value)}
                    placeholder="category"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <span className="text-gray-500 ml-1">/</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: /category/news/</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Tag Base
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
                  <input
                    type="text"
                    value={config.tagBase}
                    onChange={(e) => updateConfig('tagBase', e.target.value)}
                    placeholder="tag"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <span className="text-gray-500 ml-1">/</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: /tag/featured/</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author Base</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
                  <input
                    type="text"
                    value={config.authorBase}
                    onChange={(e) => updateConfig('authorBase', e.target.value)}
                    placeholder="author"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <span className="text-gray-500 ml-1">/</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Base</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
                  <input
                    type="text"
                    value={config.searchBase}
                    onChange={(e) => updateConfig('searchBase', e.target.value)}
                    placeholder="search"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <span className="text-gray-500 ml-1">/</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Strip Category Base</div>
                  <div className="text-xs text-gray-500">Remove 'category' from category URLs</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.stripCategoryBase}
                  onChange={(e) => updateConfig('stripCategoryBase', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Strip Tag Base</div>
                  <div className="text-xs text-gray-500">Remove 'tag' from tag URLs</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.stripTagBase}
                  onChange={(e) => updateConfig('stripTagBase', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>
            </div>
          </motion.div>

          {/* URL Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-400" />
              URL Options
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Trailing Slash</div>
                  <div className="text-xs text-gray-500">Add / at end of URLs</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.trailingSlash}
                  onChange={(e) => updateConfig('trailingSlash', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Lowercase URLs</div>
                  <div className="text-xs text-gray-500">Convert URLs to lowercase</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.lowercaseUrls}
                  onChange={(e) => updateConfig('lowercaseUrls', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Force HTTPS</div>
                  <div className="text-xs text-gray-500">Redirect HTTP to HTTPS</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.forceHttps}
                  onChange={(e) => updateConfig('forceHttps', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Remove www</div>
                  <div className="text-xs text-gray-500">Redirect www to non-www</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.removeWww}
                  onChange={(e) => updateConfig('removeWww', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Add File Extension</div>
                  <div className="text-xs text-gray-500">Append extension to URLs (e.g., .html)</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.addExtension}
                  onChange={(e) => updateConfig('addExtension', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              {config.addExtension && (
                <div className="mt-2 pl-4">
                  <input
                    type="text"
                    value={config.extension}
                    onChange={(e) => updateConfig('extension', e.target.value)}
                    placeholder=".html"
                    className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Redirects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Redirects
            </h2>

            <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-sm">Redirect Old Slugs</div>
                <div className="text-xs text-gray-500">Automatically redirect when post slug changes</div>
              </div>
              <input
                type="checkbox"
                checked={config.redirectOldSlugs}
                onChange={(e) => updateConfig('redirectOldSlugs', e.target.checked)}
                className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
              />
            </label>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium">Important Note</p>
                  <p className="text-gray-400 mt-1">
                    Changing permalink structure may break existing links. Consider setting up redirects for old URLs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PermalinksSettings;
