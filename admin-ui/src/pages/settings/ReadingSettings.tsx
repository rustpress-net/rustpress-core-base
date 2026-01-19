/**
 * ReadingSettings - Configure how content is displayed to visitors
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Home, FileText, Layout, Calendar, Clock,
  List, Grid, Rss, Eye, Save, RefreshCw, Globe, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReadingConfig {
  // Homepage display
  frontPageDisplays: 'latest' | 'static';
  frontPage: string;
  postsPage: string;

  // Blog display
  postsPerPage: number;
  postsPerFeed: number;
  feedDisplays: 'full' | 'summary';

  // Archive display
  archiveLayout: 'list' | 'grid' | 'masonry';
  showExcerpts: boolean;
  excerptLength: number;
  showReadMore: boolean;
  readMoreText: string;

  // Date & Time
  showPublishDate: boolean;
  showModifiedDate: boolean;
  dateFormat: string;
  timeFormat: string;

  // Search
  searchIncludes: ('posts' | 'pages' | 'media' | 'comments')[];
  highlightSearchTerms: boolean;

  // Visibility
  searchEngineVisibility: boolean;
  showInFeeds: boolean;
  feedUpdatePeriod: 'hourly' | 'daily' | 'weekly';
}

const defaultConfig: ReadingConfig = {
  frontPageDisplays: 'latest',
  frontPage: '',
  postsPage: '',
  postsPerPage: 10,
  postsPerFeed: 10,
  feedDisplays: 'summary',
  archiveLayout: 'list',
  showExcerpts: true,
  excerptLength: 55,
  showReadMore: true,
  readMoreText: 'Continue reading...',
  showPublishDate: true,
  showModifiedDate: false,
  dateFormat: 'F j, Y',
  timeFormat: 'g:i a',
  searchIncludes: ['posts', 'pages'],
  highlightSearchTerms: true,
  searchEngineVisibility: true,
  showInFeeds: true,
  feedUpdatePeriod: 'hourly'
};

const dateFormats = [
  { value: 'F j, Y', label: 'January 17, 2026' },
  { value: 'Y-m-d', label: '2026-01-17' },
  { value: 'm/d/Y', label: '01/17/2026' },
  { value: 'd/m/Y', label: '17/01/2026' },
  { value: 'j M Y', label: '17 Jan 2026' }
];

const timeFormats = [
  { value: 'g:i a', label: '9:30 am' },
  { value: 'g:i A', label: '9:30 AM' },
  { value: 'H:i', label: '09:30' },
  { value: 'H:i:s', label: '09:30:00' }
];

// Mock pages for selection
const mockPages = [
  { id: '1', title: 'Home' },
  { id: '2', title: 'About Us' },
  { id: '3', title: 'Contact' },
  { id: '4', title: 'Blog' },
  { id: '5', title: 'Services' }
];

export const ReadingSettings: React.FC = () => {
  const [config, setConfig] = useState<ReadingConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = (key: keyof ReadingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleSearchInclude = (type: 'posts' | 'pages' | 'media' | 'comments') => {
    const current = config.searchIncludes;
    if (current.includes(type)) {
      updateConfig('searchIncludes', current.filter(t => t !== type));
    } else {
      updateConfig('searchIncludes', [...current, type]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Reading settings saved');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-orange-500" />
              Reading Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure how content is displayed to visitors</p>
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
          {/* Homepage Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-400" />
              Your Homepage Displays
            </h2>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="frontPage"
                    checked={config.frontPageDisplays === 'latest'}
                    onChange={() => updateConfig('frontPageDisplays', 'latest')}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium">Your latest posts</div>
                    <div className="text-sm text-gray-500">Display recent blog posts on the homepage</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="frontPage"
                    checked={config.frontPageDisplays === 'static'}
                    onChange={() => updateConfig('frontPageDisplays', 'static')}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium">A static page</div>
                    <div className="text-sm text-gray-500">Choose specific pages for home and blog</div>
                  </div>
                </label>
              </div>

              {config.frontPageDisplays === 'static' && (
                <div className="grid grid-cols-2 gap-4 pl-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Homepage</label>
                    <select
                      value={config.frontPage}
                      onChange={(e) => updateConfig('frontPage', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">-- Select --</option>
                      {mockPages.map(page => (
                        <option key={page.id} value={page.id}>{page.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Posts page</label>
                    <select
                      value={config.postsPage}
                      onChange={(e) => updateConfig('postsPage', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">-- Select --</option>
                      {mockPages.map(page => (
                        <option key={page.id} value={page.id}>{page.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Blog Pages Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-green-400" />
              Blog Pages Display
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Posts per page</label>
                  <input
                    type="number"
                    value={config.postsPerPage}
                    onChange={(e) => updateConfig('postsPerPage', parseInt(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Archive Layout</label>
                  <div className="flex gap-2">
                    {['list', 'grid', 'masonry'].map(layout => (
                      <button
                        key={layout}
                        onClick={() => updateConfig('archiveLayout', layout)}
                        className={`flex-1 p-2 rounded-lg border transition-all capitalize ${
                          config.archiveLayout === layout
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {layout === 'list' && <List className="w-4 h-4 mx-auto mb-1" />}
                        {layout === 'grid' && <Grid className="w-4 h-4 mx-auto mb-1" />}
                        {layout === 'masonry' && <Layout className="w-4 h-4 mx-auto mb-1" />}
                        <div className="text-xs">{layout}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Show Excerpts</div>
                    <div className="text-xs text-gray-500">Display post summaries</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showExcerpts}
                    onChange={(e) => updateConfig('showExcerpts', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <div className="p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Excerpt Length (words)</label>
                  <input
                    type="number"
                    value={config.excerptLength}
                    onChange={(e) => updateConfig('excerptLength', parseInt(e.target.value))}
                    min={10}
                    max={200}
                    disabled={!config.showExcerpts}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Show Read More</div>
                    <div className="text-xs text-gray-500">Display continue reading link</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showReadMore}
                    onChange={(e) => updateConfig('showReadMore', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <div className="p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Read More Text</label>
                  <input
                    type="text"
                    value={config.readMoreText}
                    onChange={(e) => updateConfig('readMoreText', e.target.value)}
                    disabled={!config.showReadMore}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Date & Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Date & Time Display
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Show Publish Date</div>
                    <div className="text-xs text-gray-500">Display when post was published</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showPublishDate}
                    onChange={(e) => updateConfig('showPublishDate', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Show Modified Date</div>
                    <div className="text-xs text-gray-500">Display last update time</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showModifiedDate}
                    onChange={(e) => updateConfig('showModifiedDate', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                  <select
                    value={config.dateFormat}
                    onChange={(e) => updateConfig('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {dateFormats.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Format</label>
                  <select
                    value={config.timeFormat}
                    onChange={(e) => updateConfig('timeFormat', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {timeFormats.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Search Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Includes</label>
                <div className="flex flex-wrap gap-2">
                  {(['posts', 'pages', 'media', 'comments'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => toggleSearchInclude(type)}
                      className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-all ${
                        config.searchIncludes.includes(type)
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-gray-700 hover:border-gray-600 text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Highlight Search Terms</div>
                  <div className="text-xs text-gray-500">Highlight matching words in results</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.highlightSearchTerms}
                  onChange={(e) => updateConfig('highlightSearchTerms', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Feed Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Rss className="w-5 h-5 text-orange-400" />
              RSS Feed Settings
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Posts per feed</label>
                  <input
                    type="number"
                    value={config.postsPerFeed}
                    onChange={(e) => updateConfig('postsPerFeed', parseInt(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Feed displays</label>
                  <select
                    value={config.feedDisplays}
                    onChange={(e) => updateConfig('feedDisplays', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="full">Full text</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Feed Update Period</label>
                <div className="flex gap-3">
                  {(['hourly', 'daily', 'weekly'] as const).map(period => (
                    <label key={period} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="feedPeriod"
                        checked={config.feedUpdatePeriod === period}
                        onChange={() => updateConfig('feedUpdatePeriod', period)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{period}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search Engine Visibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Search Engine Visibility
            </h2>

            <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={!config.searchEngineVisibility}
                onChange={(e) => updateConfig('searchEngineVisibility', !e.target.checked)}
                className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
              />
              <div>
                <div className="font-medium">Discourage search engines from indexing this site</div>
                <div className="text-sm text-gray-500">
                  It is up to search engines to honor this request. This does not block access to your site.
                </div>
              </div>
            </label>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReadingSettings;
