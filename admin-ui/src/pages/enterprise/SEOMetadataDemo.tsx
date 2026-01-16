import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import SEO & Metadata Components (21-28)
import {
  // 21. SEO Score Panel
  SEOScoreProvider,
  SEOScorePanel,
  OverallScore,
  CategoryScores,
  IssuesList,
  KeywordAnalysisList,
  ContentStats,

  // 22. Meta Tags Editor
  MetaTagsProvider,
  MetaTagsEditor,
  TitleEditor,
  DescriptionEditor,
  KeywordsEditor,
  RobotsEditor,
  MetaPreview,

  // 23. Open Graph Preview
  OpenGraphProvider,
  OpenGraphPreview,
  FacebookPreview,
  LinkedInPreview,
  DiscordPreview,
  OGCodePreview,

  // 24. Twitter Card Preview
  TwitterCardProvider,
  TwitterCardPreview,
  CardTypeSelector,
  SummaryCardPreview,
  LargeImageCardPreview,
  TwitterCodePreview,

  // 25. Schema Markup Editor
  SchemaMarkupProvider,
  SchemaMarkupEditor,
  SchemaTypeSelector,
  SchemaPropertiesForm,
  SchemaCodePreview,

  // 26. Canonical URL Manager
  CanonicalProvider,
  CanonicalURLManager,
  CanonicalUrlInput,
  DuplicateDetector,
  CanonicalCodePreview,

  // 27. Redirect Manager
  RedirectProvider,
  RedirectManager,
  RedirectToolbar,
  RedirectList,
  RedirectTester,
  ChainDetector,

  // 28. Sitemap Preview
  SitemapProvider,
  SitemapPreview,
  SitemapStatsOverview,
  URLList,
  XMLPreview,
  ConfigPanel,
} from '../../design-system/components';

// Sample Data
const sampleSEOContent = {
  title: 'Complete Guide to Modern SEO Optimization in 2024',
  content: `
    Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search engine results pages.
    This comprehensive guide covers everything you need to know about modern SEO strategies.

    Understanding SEO fundamentals is crucial for any website owner or digital marketer. From keyword research to
    technical optimization, there are many factors that influence your site's visibility. Content quality remains
    the most important factor for ranking well in search results.

    Modern SEO goes beyond traditional keyword stuffing. Today's search engines use sophisticated algorithms that
    consider user intent, content relevance, and overall user experience. Mobile-first indexing means your site
    must be optimized for mobile devices to rank well.

    Link building remains an essential part of any SEO strategy. Quality backlinks from authoritative sites signal
    to search engines that your content is valuable and trustworthy. However, focus on earning links naturally
    through high-quality content rather than manipulative tactics.
  `,
  url: 'https://example.com/blog/seo-guide-2024',
  keywords: ['SEO', 'search engine optimization', 'digital marketing', 'content strategy'],
  images: [{ url: 'https://example.com/images/seo-guide-cover.jpg', alt: 'SEO Guide Cover' }],
};

const sampleMetaTags = {
  title: 'Complete Guide to Modern SEO Optimization | Example Blog',
  description: 'Learn everything about SEO optimization in 2024. This comprehensive guide covers keyword research, technical SEO, content optimization, and link building strategies.',
  keywords: ['SEO', 'search engine optimization', 'digital marketing', 'SEO guide', 'content strategy'],
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
  },
  canonical: 'https://example.com/blog/seo-guide-2024',
};

const sampleOpenGraph = {
  title: 'Complete Guide to Modern SEO Optimization',
  description: 'Learn everything about SEO optimization in 2024. Comprehensive guide covering all aspects of search engine optimization.',
  image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630',
  url: 'https://example.com/blog/seo-guide-2024',
  type: 'article' as const,
  siteName: 'Example Blog',
  locale: 'en_US',
  article: {
    publishedTime: '2024-01-15T10:00:00Z',
    modifiedTime: '2024-01-20T14:30:00Z',
    author: 'Jane Smith',
    section: 'Technology',
    tags: ['SEO', 'Digital Marketing'],
  },
};

const sampleTwitterCard = {
  cardType: 'summary_large_image' as const,
  title: 'Complete Guide to Modern SEO Optimization',
  description: 'Learn everything about SEO optimization in 2024. Comprehensive guide covering all aspects of search engine optimization.',
  image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600',
  site: '@exampleblog',
  creator: '@janesmith',
};

const sampleSchema = {
  type: 'Article' as const,
  properties: {
    headline: 'Complete Guide to Modern SEO Optimization',
    description: 'Learn everything about SEO optimization in 2024.',
    author: {
      '@type': 'Person',
      name: 'Jane Smith',
      url: 'https://example.com/author/jane-smith',
    },
    datePublished: '2024-01-15',
    dateModified: '2024-01-20',
    publisher: {
      '@type': 'Organization',
      name: 'Example Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
    image: 'https://example.com/images/seo-guide-cover.jpg',
    mainEntityOfPage: 'https://example.com/blog/seo-guide-2024',
  },
};

const sampleRedirects = [
  {
    id: 'r1',
    source: '/old-seo-guide',
    target: '/blog/seo-guide-2024',
    type: '301' as const,
    hits: 1250,
    lastHit: '2024-01-20T15:30:00Z',
    isActive: true,
  },
  {
    id: 'r2',
    source: '/seo-tips',
    target: '/blog/seo-guide-2024',
    type: '301' as const,
    hits: 890,
    lastHit: '2024-01-19T10:15:00Z',
    isActive: true,
  },
  {
    id: 'r3',
    source: '/search-optimization',
    target: '/blog/seo-guide-2024',
    type: '302' as const,
    hits: 320,
    lastHit: '2024-01-18T08:45:00Z',
    isActive: true,
  },
];

const sampleSitemapUrls = [
  { id: 'u1', loc: 'https://example.com/', lastmod: '2024-01-20', changefreq: 'daily' as const, priority: 1.0, isIncluded: true, type: 'page' as const },
  { id: 'u2', loc: 'https://example.com/blog', lastmod: '2024-01-20', changefreq: 'daily' as const, priority: 0.9, isIncluded: true, type: 'page' as const },
  { id: 'u3', loc: 'https://example.com/blog/seo-guide-2024', lastmod: '2024-01-20', changefreq: 'weekly' as const, priority: 0.8, isIncluded: true, type: 'post' as const },
  { id: 'u4', loc: 'https://example.com/blog/web-design-tips', lastmod: '2024-01-18', changefreq: 'weekly' as const, priority: 0.8, isIncluded: true, type: 'post' as const },
  { id: 'u5', loc: 'https://example.com/blog/content-marketing', lastmod: '2024-01-15', changefreq: 'weekly' as const, priority: 0.8, isIncluded: true, type: 'post' as const },
  { id: 'u6', loc: 'https://example.com/category/seo', lastmod: '2024-01-20', changefreq: 'weekly' as const, priority: 0.6, isIncluded: true, type: 'category' as const },
  { id: 'u7', loc: 'https://example.com/category/marketing', lastmod: '2024-01-18', changefreq: 'weekly' as const, priority: 0.6, isIncluded: true, type: 'category' as const },
  { id: 'u8', loc: 'https://example.com/author/jane-smith', lastmod: '2024-01-20', changefreq: 'monthly' as const, priority: 0.5, isIncluded: true, type: 'author' as const },
  { id: 'u9', loc: 'https://example.com/old-page', lastmod: '2023-06-15', changefreq: 'yearly' as const, priority: 0.3, isIncluded: false, type: 'page' as const },
];

// Component sections
const sections = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'seo-score', label: 'SEO Score', icon: '🎯' },
  { id: 'meta-tags', label: 'Meta Tags', icon: '🏷️' },
  { id: 'open-graph', label: 'Open Graph', icon: '📘' },
  { id: 'twitter-card', label: 'Twitter Card', icon: '🐦' },
  { id: 'schema', label: 'Schema Markup', icon: '📋' },
  { id: 'canonical', label: 'Canonical URL', icon: '🔗' },
  { id: 'redirects', label: 'Redirects', icon: '↪️' },
  { id: 'sitemap', label: 'Sitemap', icon: '🗺️' },
];

const SEOMetadataDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">🔍</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">SEO & Metadata Components</h1>
              <p className="text-emerald-100 mt-1">
                Complete toolkit for search engine optimization and metadata management
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {['SEO Analysis', 'Meta Tags', 'Open Graph', 'Twitter Cards', 'Schema.org', 'Redirects', 'Sitemaps'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Section Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{section.icon}</span>
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  SEO & Metadata Enhancement Suite
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  A comprehensive collection of 8 components designed to help you optimize your content
                  for search engines and social media platforms.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sections.slice(1).map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setActiveSection(section.id)}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{section.icon}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {section.label}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getComponentDescription(section.id)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
                  <p className="text-blue-100 text-sm">
                    Get instant feedback on your SEO performance with comprehensive scoring and actionable recommendations.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-3">👀</div>
                  <h3 className="text-lg font-semibold mb-2">Social Previews</h3>
                  <p className="text-purple-100 text-sm">
                    Preview how your content will appear on Facebook, Twitter, LinkedIn, and Discord before publishing.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-3">🔧</div>
                  <h3 className="text-lg font-semibold mb-2">Technical SEO</h3>
                  <p className="text-emerald-100 text-sm">
                    Manage redirects, canonical URLs, schema markup, and sitemaps with intuitive visual interfaces.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SEO Score Section */}
          {activeSection === 'seo-score' && (
            <motion.div
              key="seo-score"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  21. SEO Score Panel
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Real-time SEO analysis with comprehensive scoring, issue detection, and keyword optimization insights.
                </p>
              </div>

              <SEOScorePanel
                initialContent={sampleSEOContent}
                initialConfig={{
                  targetKeyword: 'SEO optimization',
                  enableKeywordDensity: true,
                  enableReadabilityCheck: true,
                  enableLinkAnalysis: true,
                }}
              />
            </motion.div>
          )}

          {/* Meta Tags Section */}
          {activeSection === 'meta-tags' && (
            <motion.div
              key="meta-tags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  22. Meta Tags Editor
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Comprehensive meta tags editor with title, description, keywords, robots directives, and custom tags.
                </p>
              </div>

              <MetaTagsEditor
                initialData={sampleMetaTags}
                initialConfig={{
                  maxTitleLength: 60,
                  maxDescriptionLength: 160,
                  maxKeywords: 10,
                  showSuggestions: true,
                }}
              />
            </motion.div>
          )}

          {/* Open Graph Section */}
          {activeSection === 'open-graph' && (
            <motion.div
              key="open-graph"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  23. Open Graph Preview
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Configure Open Graph meta tags with live previews for Facebook, LinkedIn, and Discord sharing.
                </p>
              </div>

              <OpenGraphPreview
                initialData={sampleOpenGraph}
                initialConfig={{
                  enableFacebookPreview: true,
                  enableLinkedInPreview: true,
                  enableDiscordPreview: true,
                  showCodePreview: true,
                }}
              />
            </motion.div>
          )}

          {/* Twitter Card Section */}
          {activeSection === 'twitter-card' && (
            <motion.div
              key="twitter-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  24. Twitter Card Preview
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Design and preview Twitter Cards with support for summary, large image, and player card types.
                </p>
              </div>

              <TwitterCardPreview
                initialData={sampleTwitterCard}
                initialConfig={{
                  showValidation: true,
                  showCodePreview: true,
                }}
              />
            </motion.div>
          )}

          {/* Schema Markup Section */}
          {activeSection === 'schema' && (
            <motion.div
              key="schema"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  25. Schema Markup Editor
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Visual editor for JSON-LD structured data with support for Article, Product, LocalBusiness, FAQ, and more schema types.
                </p>
              </div>

              <SchemaMarkupEditor
                initialData={sampleSchema}
                initialConfig={{
                  enableValidation: true,
                  showPreview: true,
                  autoGenerateId: true,
                }}
              />
            </motion.div>
          )}

          {/* Canonical URL Section */}
          {activeSection === 'canonical' && (
            <motion.div
              key="canonical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  26. Canonical URL Manager
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage canonical URLs with duplicate detection, URL normalization, and variant tracking.
                </p>
              </div>

              <CanonicalURLManager
                initialData={{
                  url: 'https://example.com/blog/seo-guide-2024',
                  source: 'manual',
                  variants: [
                    { url: 'https://example.com/blog/seo-guide-2024?utm_source=twitter', normalized: 'https://example.com/blog/seo-guide-2024', status: 'duplicate' },
                    { url: 'https://www.example.com/blog/seo-guide-2024', normalized: 'https://example.com/blog/seo-guide-2024', status: 'duplicate' },
                    { url: 'http://example.com/blog/seo-guide-2024', normalized: 'https://example.com/blog/seo-guide-2024', status: 'duplicate' },
                  ],
                  isValid: true,
                  lastChecked: '2024-01-20T15:00:00Z',
                }}
                initialConfig={{
                  baseUrl: 'https://example.com',
                  autoNormalize: true,
                  removeTrailingSlash: true,
                  forceHttps: true,
                  removeWww: true,
                  removeQueryParams: ['utm_source', 'utm_medium', 'utm_campaign'],
                }}
              />
            </motion.div>
          )}

          {/* Redirects Section */}
          {activeSection === 'redirects' && (
            <motion.div
              key="redirects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  27. Redirect Manager
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage 301/302/307/308 redirects with chain detection, hit tracking, and import/export capabilities.
                </p>
              </div>

              <RedirectManager
                initialRedirects={sampleRedirects}
                initialConfig={{
                  baseUrl: 'https://example.com',
                  maxChainLength: 3,
                  allowRegex: true,
                  trackHits: true,
                }}
              />
            </motion.div>
          )}

          {/* Sitemap Section */}
          {activeSection === 'sitemap' && (
            <motion.div
              key="sitemap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  28. Sitemap Preview
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Generate and manage XML sitemaps with URL prioritization, change frequency settings, and validation.
                </p>
              </div>

              <SitemapPreview
                initialUrls={sampleSitemapUrls}
                initialConfig={{
                  baseUrl: 'https://example.com',
                  maxUrlsPerSitemap: 50000,
                  includeImages: true,
                  includeVideos: false,
                  includeNews: false,
                  defaultPriority: 0.5,
                  defaultChangefreq: 'weekly',
                  autoGenerate: true,
                  pingSearchEngines: true,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper function for component descriptions
function getComponentDescription(id: string): string {
  const descriptions: Record<string, string> = {
    'seo-score': 'Real-time SEO analysis with scoring and recommendations',
    'meta-tags': 'Title, description, and robots meta tag management',
    'open-graph': 'Facebook, LinkedIn, and Discord sharing previews',
    'twitter-card': 'Twitter Card configuration and preview',
    'schema': 'JSON-LD structured data editor for rich results',
    'canonical': 'Canonical URL management and duplicate detection',
    'redirects': '301/302 redirect management with chain detection',
    'sitemap': 'XML sitemap generation and URL management',
  };
  return descriptions[id] || '';
}

export default SEOMetadataDemo;
