import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  Search,
  Plus,
  ExternalLink,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Info,
  TrendingUp,
  FileText,
  Tag,
  Clock,
  Eye,
  Star,
  Filter,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  url: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishDate: Date;
  views: number;
  relevanceScore: number;
  linkStatus: 'linked' | 'suggested' | 'unlinked';
  anchorText?: string;
}

interface LinkOpportunity {
  id: string;
  keyword: string;
  targetPost: RelatedPost;
  context: string;
  position: number;
  confidence: number;
}

interface InternalLinkingSettings {
  autoSuggest: boolean;
  maxSuggestions: number;
  minRelevanceScore: number;
  includeCategories: boolean;
  includeTags: boolean;
  showOrphanedPosts: boolean;
  prioritizeRecent: boolean;
  showPreview: boolean;
}

interface InternalLinkingProps {
  currentPostId?: string;
  content?: string;
  onAddLink?: (keyword: string, url: string) => void;
  onSettingsChange?: (settings: InternalLinkingSettings) => void;
  className?: string;
}

const mockRelatedPosts: RelatedPost[] = [
  {
    id: 'p1',
    title: 'Getting Started with React Hooks',
    slug: 'react-hooks-guide',
    url: '/blog/react-hooks-guide',
    excerpt: 'Learn how to use React Hooks to manage state and side effects in your components...',
    category: 'React',
    tags: ['react', 'hooks', 'javascript'],
    publishDate: new Date(Date.now() - 86400000 * 5),
    views: 12450,
    relevanceScore: 95,
    linkStatus: 'linked',
    anchorText: 'React Hooks'
  },
  {
    id: 'p2',
    title: 'Understanding useState and useEffect',
    slug: 'usestate-useeffect-deep-dive',
    url: '/blog/usestate-useeffect-deep-dive',
    excerpt: 'A comprehensive guide to the most commonly used React hooks...',
    category: 'React',
    tags: ['react', 'hooks', 'state'],
    publishDate: new Date(Date.now() - 86400000 * 10),
    views: 8920,
    relevanceScore: 88,
    linkStatus: 'suggested'
  },
  {
    id: 'p3',
    title: 'Building Custom React Hooks',
    slug: 'custom-react-hooks',
    url: '/blog/custom-react-hooks',
    excerpt: 'Create reusable logic with custom hooks in React...',
    category: 'React',
    tags: ['react', 'hooks', 'patterns'],
    publishDate: new Date(Date.now() - 86400000 * 15),
    views: 6780,
    relevanceScore: 82,
    linkStatus: 'suggested'
  },
  {
    id: 'p4',
    title: 'React Context API Explained',
    slug: 'react-context-api',
    url: '/blog/react-context-api',
    excerpt: 'How to use Context API for global state management...',
    category: 'React',
    tags: ['react', 'context', 'state'],
    publishDate: new Date(Date.now() - 86400000 * 20),
    views: 5430,
    relevanceScore: 75,
    linkStatus: 'unlinked'
  },
  {
    id: 'p5',
    title: 'TypeScript with React: Best Practices',
    slug: 'typescript-react-practices',
    url: '/blog/typescript-react-practices',
    excerpt: 'Learn how to effectively use TypeScript in your React projects...',
    category: 'TypeScript',
    tags: ['typescript', 'react', 'best-practices'],
    publishDate: new Date(Date.now() - 86400000 * 25),
    views: 9870,
    relevanceScore: 70,
    linkStatus: 'unlinked'
  }
];

const mockOpportunities: LinkOpportunity[] = [
  {
    id: 'o1',
    keyword: 'React Hooks',
    targetPost: mockRelatedPosts[0],
    context: '...when working with React Hooks, you need to understand...',
    position: 234,
    confidence: 95
  },
  {
    id: 'o2',
    keyword: 'useState',
    targetPost: mockRelatedPosts[1],
    context: '...the useState hook allows you to add state to...',
    position: 567,
    confidence: 88
  },
  {
    id: 'o3',
    keyword: 'custom hooks',
    targetPost: mockRelatedPosts[2],
    context: '...you can create custom hooks to share logic between...',
    position: 890,
    confidence: 82
  }
];

export const InternalLinking: React.FC<InternalLinkingProps> = ({
  currentPostId,
  content,
  onAddLink,
  onSettingsChange,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'opportunities' | 'all'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [settings, setSettings] = useState<InternalLinkingSettings>({
    autoSuggest: true,
    maxSuggestions: 10,
    minRelevanceScore: 60,
    includeCategories: true,
    includeTags: true,
    showOrphanedPosts: true,
    prioritizeRecent: true,
    showPreview: true
  });

  const categories = useMemo(() => {
    const cats = new Set(mockRelatedPosts.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredPosts = useMemo(() => {
    return mockRelatedPosts.filter(post => {
      if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
      if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (post.relevanceScore < settings.minRelevanceScore) return false;
      return true;
    });
  }, [searchQuery, selectedCategory, settings.minRelevanceScore]);

  const stats = {
    linked: mockRelatedPosts.filter(p => p.linkStatus === 'linked').length,
    suggested: mockRelatedPosts.filter(p => p.linkStatus === 'suggested').length,
    unlinked: mockRelatedPosts.filter(p => p.linkStatus === 'unlinked').length,
    opportunities: mockOpportunities.length
  };

  const handleAddLink = (post: RelatedPost, keyword?: string) => {
    if (onAddLink) {
      onAddLink(keyword || post.title, post.url);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', count: stats.suggested },
    { id: 'opportunities', label: 'Opportunities', count: stats.opportunities },
    { id: 'all', label: 'All Posts', count: mockRelatedPosts.length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Link size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Internal Linking</h2>
            <p className="text-sm text-gray-500">Boost SEO with relevant internal links</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-green-100 text-green-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 divide-x border-b">
        {[
          { label: 'Linked', value: stats.linked, color: 'green' },
          { label: 'Suggested', value: stats.suggested, color: 'blue' },
          { label: 'Unlinked', value: stats.unlinked, color: 'gray' },
          { label: 'Opportunities', value: stats.opportunities, color: 'purple' }
        ].map(stat => (
          <div key={stat.label} className="p-3 text-center">
            <div className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSuggest}
                  onChange={(e) => setSettings({ ...settings, autoSuggest: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Auto Suggest</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPreview}
                  onChange={(e) => setSettings({ ...settings, showPreview: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Previews</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.prioritizeRecent}
                  onChange={(e) => setSettings({ ...settings, prioritizeRecent: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Prioritize Recent</span>
              </label>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Min Relevance</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.minRelevanceScore}
                  onChange={(e) => setSettings({ ...settings, minRelevanceScore: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{settings.minRelevanceScore}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="p-4 border-b">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search related posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {tab.label}
            <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'opportunities' && (
          <div className="p-4 space-y-3">
            {mockOpportunities.map((opp, idx) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 border rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-purple-500" />
                      <span className="font-medium">"{opp.keyword}"</span>
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded-full',
                        opp.confidence >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {opp.confidence}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 italic">{opp.context}</p>
                  </div>
                  <button
                    onClick={() => handleAddLink(opp.targetPost, opp.keyword)}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Link
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <ArrowRight size={14} />
                  <span>Links to:</span>
                  <a href={opp.targetPost.url} className="text-blue-600 hover:underline flex items-center gap-1">
                    {opp.targetPost.title}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {(activeTab === 'suggestions' || activeTab === 'all') && (
          <div className="divide-y">
            {filteredPosts
              .filter(p => activeTab === 'all' || p.linkStatus === 'suggested')
              .map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {post.linkStatus === 'linked' && (
                          <Check size={16} className="text-green-500" />
                        )}
                        <h4 className="font-medium hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h4>
                        <span className={clsx(
                          'px-2 py-0.5 text-xs rounded-full',
                          getRelevanceColor(post.relevanceScore)
                        )}>
                          {post.relevanceScore}% relevant
                        </span>
                      </div>

                      {settings.showPreview && expandedPost === post.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-sm text-gray-600 mb-2"
                        >
                          {post.excerpt}
                        </motion.p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(post.publishDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {post.views.toLocaleString()} views
                        </span>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        {expandedPost === post.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {post.linkStatus === 'linked' ? (
                        <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg flex items-center gap-1">
                          <Check size={14} />
                          Linked
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddLink(post)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add Link
                        </button>
                      )}
                    </div>
                  </div>

                  {post.linkStatus === 'linked' && post.anchorText && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-sm">
                      <Link size={14} className="text-green-600" />
                      <span className="text-gray-600">Linked with anchor text:</span>
                      <span className="font-medium text-green-700">"{post.anchorText}"</span>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 border-t bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Pro Tips:</strong> Adding 3-5 internal links per post can improve SEO by up to 40%.
            Focus on linking to posts with high relevance scores for best results.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InternalLinking;
