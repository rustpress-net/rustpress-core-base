/**
 * SEOScorePanel Component (21)
 *
 * Real-time SEO analysis panel for post editor
 * Features: Score display, issue detection, recommendations, keyword analysis
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface SEOIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  category: SEOCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  howToFix?: string;
  isFixed?: boolean;
}

export type SEOCategory =
  | 'title'
  | 'meta'
  | 'content'
  | 'headings'
  | 'images'
  | 'links'
  | 'keywords'
  | 'readability'
  | 'technical';

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number;
  inTitle: boolean;
  inMeta: boolean;
  inHeadings: boolean;
  inFirstParagraph: boolean;
  status: 'optimal' | 'low' | 'high';
}

export interface SEOScoreData {
  overall: number;
  categories: {
    [key in SEOCategory]?: number;
  };
  issues: SEOIssue[];
  keywords: KeywordAnalysis[];
  wordCount: number;
  readingTime: number;
  readabilityScore: number;
}

export interface SEOScoreConfig {
  targetKeywords: string[];
  minWordCount: number;
  maxWordCount: number;
  idealTitleLength: { min: number; max: number };
  idealMetaLength: { min: number; max: number };
  enableRealTimeAnalysis: boolean;
  analysisDelay: number;
}

interface SEOScoreContextType {
  scoreData: SEOScoreData;
  config: SEOScoreConfig;
  isAnalyzing: boolean;
  expandedCategory: SEOCategory | null;
  analyze: (content: SEOContent) => void;
  setTargetKeywords: (keywords: string[]) => void;
  markIssueFixed: (issueId: string) => void;
  setExpandedCategory: (category: SEOCategory | null) => void;
  refreshAnalysis: () => void;
}

export interface SEOContent {
  title: string;
  metaDescription: string;
  content: string;
  slug: string;
  headings: { level: number; text: string }[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string; isExternal: boolean }[];
}

const SEOScoreContext = createContext<SEOScoreContextType | null>(null);

// Default config
const defaultConfig: SEOScoreConfig = {
  targetKeywords: [],
  minWordCount: 300,
  maxWordCount: 3000,
  idealTitleLength: { min: 50, max: 60 },
  idealMetaLength: { min: 120, max: 160 },
  enableRealTimeAnalysis: true,
  analysisDelay: 1000,
};

// Provider
interface SEOScoreProviderProps {
  children: ReactNode;
  config?: Partial<SEOScoreConfig>;
  initialContent?: SEOContent;
  onScoreChange?: (score: SEOScoreData) => void;
}

export const SEOScoreProvider: React.FC<SEOScoreProviderProps> = ({
  children,
  config: userConfig,
  initialContent,
  onScoreChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [scoreData, setScoreData] = useState<SEOScoreData>({
    overall: 0,
    categories: {},
    issues: [],
    keywords: [],
    wordCount: 0,
    readingTime: 0,
    readabilityScore: 0,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<SEOCategory | null>(null);
  const [currentContent, setCurrentContent] = useState<SEOContent | null>(initialContent || null);

  const analyzeContent = useCallback((content: SEOContent): SEOScoreData => {
    const issues: SEOIssue[] = [];
    const categories: { [key in SEOCategory]?: number } = {};

    // Word count
    const words = content.content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200);

    // Title analysis
    let titleScore = 100;
    if (!content.title) {
      issues.push({
        id: 'title-missing',
        type: 'error',
        category: 'title',
        title: 'Missing page title',
        description: 'Your page doesn\'t have a title tag.',
        impact: 'high',
        howToFix: 'Add a descriptive title between 50-60 characters.',
      });
      titleScore = 0;
    } else {
      if (content.title.length < config.idealTitleLength.min) {
        issues.push({
          id: 'title-short',
          type: 'warning',
          category: 'title',
          title: 'Title is too short',
          description: `Your title is ${content.title.length} characters. Aim for ${config.idealTitleLength.min}-${config.idealTitleLength.max} characters.`,
          impact: 'medium',
          howToFix: 'Expand your title to include more relevant keywords.',
        });
        titleScore -= 20;
      }
      if (content.title.length > config.idealTitleLength.max) {
        issues.push({
          id: 'title-long',
          type: 'warning',
          category: 'title',
          title: 'Title is too long',
          description: `Your title is ${content.title.length} characters and may be truncated in search results.`,
          impact: 'medium',
          howToFix: 'Shorten your title to under 60 characters.',
        });
        titleScore -= 15;
      }
    }
    categories.title = Math.max(0, titleScore);

    // Meta description analysis
    let metaScore = 100;
    if (!content.metaDescription) {
      issues.push({
        id: 'meta-missing',
        type: 'error',
        category: 'meta',
        title: 'Missing meta description',
        description: 'Your page doesn\'t have a meta description.',
        impact: 'high',
        howToFix: 'Add a compelling meta description between 120-160 characters.',
      });
      metaScore = 0;
    } else {
      if (content.metaDescription.length < config.idealMetaLength.min) {
        issues.push({
          id: 'meta-short',
          type: 'warning',
          category: 'meta',
          title: 'Meta description is too short',
          description: `Your meta description is ${content.metaDescription.length} characters.`,
          impact: 'medium',
          howToFix: 'Expand your meta description to be more descriptive.',
        });
        metaScore -= 20;
      }
      if (content.metaDescription.length > config.idealMetaLength.max) {
        issues.push({
          id: 'meta-long',
          type: 'warning',
          category: 'meta',
          title: 'Meta description is too long',
          description: `Your meta description may be truncated in search results.`,
          impact: 'low',
          howToFix: 'Shorten your meta description to under 160 characters.',
        });
        metaScore -= 10;
      }
    }
    categories.meta = Math.max(0, metaScore);

    // Content analysis
    let contentScore = 100;
    if (wordCount < config.minWordCount) {
      issues.push({
        id: 'content-short',
        type: 'warning',
        category: 'content',
        title: 'Content is too short',
        description: `Your content has ${wordCount} words. Aim for at least ${config.minWordCount} words.`,
        impact: 'high',
        howToFix: 'Add more valuable content to improve SEO.',
      });
      contentScore -= 30;
    }
    if (wordCount > config.maxWordCount) {
      issues.push({
        id: 'content-long',
        type: 'suggestion',
        category: 'content',
        title: 'Content is very long',
        description: 'Consider breaking this into multiple pages or adding a table of contents.',
        impact: 'low',
      });
      contentScore -= 5;
    }
    categories.content = Math.max(0, contentScore);

    // Headings analysis
    let headingsScore = 100;
    const h1Count = content.headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({
        id: 'h1-missing',
        type: 'error',
        category: 'headings',
        title: 'Missing H1 heading',
        description: 'Your page should have exactly one H1 heading.',
        impact: 'high',
        howToFix: 'Add an H1 heading that includes your main keyword.',
      });
      headingsScore -= 40;
    } else if (h1Count > 1) {
      issues.push({
        id: 'h1-multiple',
        type: 'warning',
        category: 'headings',
        title: 'Multiple H1 headings',
        description: `Found ${h1Count} H1 headings. Use only one per page.`,
        impact: 'medium',
        howToFix: 'Change extra H1 headings to H2 or lower.',
      });
      headingsScore -= 20;
    }
    if (content.headings.length < 3 && wordCount > 500) {
      issues.push({
        id: 'headings-few',
        type: 'suggestion',
        category: 'headings',
        title: 'Add more headings',
        description: 'Use more headings to structure your content.',
        impact: 'low',
        howToFix: 'Break up content with H2 and H3 subheadings.',
      });
      headingsScore -= 10;
    }
    categories.headings = Math.max(0, headingsScore);

    // Images analysis
    let imagesScore = 100;
    const imagesWithoutAlt = content.images.filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        id: 'images-no-alt',
        type: 'error',
        category: 'images',
        title: 'Images missing alt text',
        description: `${imagesWithoutAlt.length} image(s) are missing alt text.`,
        impact: 'high',
        howToFix: 'Add descriptive alt text to all images.',
      });
      imagesScore -= imagesWithoutAlt.length * 15;
    }
    if (content.images.length === 0 && wordCount > 300) {
      issues.push({
        id: 'images-none',
        type: 'suggestion',
        category: 'images',
        title: 'No images found',
        description: 'Adding images can improve engagement and SEO.',
        impact: 'low',
        howToFix: 'Add relevant images to your content.',
      });
      imagesScore -= 10;
    }
    categories.images = Math.max(0, imagesScore);

    // Links analysis
    let linksScore = 100;
    const internalLinks = content.links.filter(l => !l.isExternal);
    const externalLinks = content.links.filter(l => l.isExternal);
    if (internalLinks.length === 0 && wordCount > 300) {
      issues.push({
        id: 'links-no-internal',
        type: 'suggestion',
        category: 'links',
        title: 'No internal links',
        description: 'Internal links help with site navigation and SEO.',
        impact: 'medium',
        howToFix: 'Add links to related content on your site.',
      });
      linksScore -= 15;
    }
    if (externalLinks.length === 0 && wordCount > 500) {
      issues.push({
        id: 'links-no-external',
        type: 'suggestion',
        category: 'links',
        title: 'No external links',
        description: 'Linking to authoritative sources can improve credibility.',
        impact: 'low',
        howToFix: 'Add links to relevant external resources.',
      });
      linksScore -= 5;
    }
    categories.links = Math.max(0, linksScore);

    // Keyword analysis
    const keywords: KeywordAnalysis[] = config.targetKeywords.map(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.content.match(regex) || [];
      const count = matches.length;
      const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
      const inTitle = content.title.toLowerCase().includes(keyword.toLowerCase());
      const inMeta = content.metaDescription.toLowerCase().includes(keyword.toLowerCase());
      const inHeadings = content.headings.some(h =>
        h.text.toLowerCase().includes(keyword.toLowerCase())
      );
      const firstParagraph = content.content.split('\n')[0] || '';
      const inFirstParagraph = firstParagraph.toLowerCase().includes(keyword.toLowerCase());

      let status: 'optimal' | 'low' | 'high' = 'optimal';
      if (density < 0.5) status = 'low';
      if (density > 2.5) status = 'high';

      return {
        keyword,
        count,
        density,
        inTitle,
        inMeta,
        inHeadings,
        inFirstParagraph,
        status,
      };
    });

    let keywordsScore = 100;
    keywords.forEach(kw => {
      if (kw.status === 'low') keywordsScore -= 10;
      if (kw.status === 'high') keywordsScore -= 5;
      if (!kw.inTitle) keywordsScore -= 5;
      if (!kw.inMeta) keywordsScore -= 5;
    });
    categories.keywords = Math.max(0, keywordsScore);

    // Calculate readability score (simplified Flesch-Kincaid)
    const sentences = content.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 3));
    categories.readability = readabilityScore;

    if (avgWordsPerSentence > 25) {
      issues.push({
        id: 'readability-sentences',
        type: 'suggestion',
        category: 'readability',
        title: 'Sentences are too long',
        description: 'Average sentence length is high. Break up long sentences.',
        impact: 'low',
        howToFix: 'Aim for an average of 15-20 words per sentence.',
      });
    }

    // Technical
    let technicalScore = 100;
    if (!content.slug) {
      issues.push({
        id: 'slug-missing',
        type: 'warning',
        category: 'technical',
        title: 'Missing URL slug',
        description: 'Your page needs a URL slug.',
        impact: 'high',
        howToFix: 'Set a descriptive, keyword-rich URL slug.',
      });
      technicalScore -= 30;
    } else if (content.slug.includes(' ') || content.slug !== content.slug.toLowerCase()) {
      issues.push({
        id: 'slug-format',
        type: 'warning',
        category: 'technical',
        title: 'URL slug format issue',
        description: 'Slug should be lowercase with hyphens instead of spaces.',
        impact: 'medium',
        howToFix: 'Use lowercase letters and hyphens in your slug.',
      });
      technicalScore -= 15;
    }
    categories.technical = Math.max(0, technicalScore);

    // Calculate overall score
    const categoryScores = Object.values(categories);
    const overall = categoryScores.length > 0
      ? Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length)
      : 0;

    return {
      overall,
      categories,
      issues: issues.sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        return impactOrder[a.impact] - impactOrder[b.impact];
      }),
      keywords,
      wordCount,
      readingTime,
      readabilityScore,
    };
  }, [config]);

  const analyze = useCallback((content: SEOContent) => {
    setCurrentContent(content);
    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const result = analyzeContent(content);
      setScoreData(result);
      setIsAnalyzing(false);
      onScoreChange?.(result);
    }, 500);
  }, [analyzeContent, onScoreChange]);

  const setTargetKeywords = useCallback((keywords: string[]) => {
    config.targetKeywords = keywords;
    if (currentContent) {
      analyze(currentContent);
    }
  }, [config, currentContent, analyze]);

  const markIssueFixed = useCallback((issueId: string) => {
    setScoreData(prev => ({
      ...prev,
      issues: prev.issues.map(issue =>
        issue.id === issueId ? { ...issue, isFixed: true } : issue
      ),
    }));
  }, []);

  const refreshAnalysis = useCallback(() => {
    if (currentContent) {
      analyze(currentContent);
    }
  }, [currentContent, analyze]);

  return (
    <SEOScoreContext.Provider value={{
      scoreData,
      config,
      isAnalyzing,
      expandedCategory,
      analyze,
      setTargetKeywords,
      markIssueFixed,
      setExpandedCategory,
      refreshAnalysis,
    }}>
      {children}
    </SEOScoreContext.Provider>
  );
};

// Hook
export const useSEOScore = () => {
  const context = useContext(SEOScoreContext);
  if (!context) {
    throw new Error('useSEOScore must be used within SEOScoreProvider');
  }
  return context;
};

// Utility functions
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Work';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

const categoryLabels: Record<SEOCategory, { label: string; icon: string }> = {
  title: { label: 'Title', icon: '📝' },
  meta: { label: 'Meta Description', icon: '📋' },
  content: { label: 'Content', icon: '📄' },
  headings: { label: 'Headings', icon: '📑' },
  images: { label: 'Images', icon: '🖼️' },
  links: { label: 'Links', icon: '🔗' },
  keywords: { label: 'Keywords', icon: '🎯' },
  readability: { label: 'Readability', icon: '👁️' },
  technical: { label: 'Technical', icon: '⚙️' },
};

// Sub-components
export const OverallScore: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { scoreData, isAnalyzing } = useSEOScore();

  return (
    <div className={`text-center ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={getScoreColor(scoreData.overall)}
            initial={{ strokeDasharray: '0 352' }}
            animate={{
              strokeDasharray: `${(scoreData.overall / 100) * 352} 352`
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isAnalyzing ? (
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <>
              <span className={`text-3xl font-bold ${getScoreColor(scoreData.overall)}`}>
                {scoreData.overall}
              </span>
              <span className="text-xs text-gray-500 uppercase">
                {getScoreLabel(scoreData.overall)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const CategoryScores: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { scoreData, expandedCategory, setExpandedCategory } = useSEOScore();

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(scoreData.categories).map(([category, score]) => {
        const catInfo = categoryLabels[category as SEOCategory];
        const isExpanded = expandedCategory === category;
        const issues = scoreData.issues.filter(i => i.category === category);

        return (
          <div key={category}>
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category as SEOCategory)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span>{catInfo.icon}</span>
              <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">
                {catInfo.label}
              </span>
              <div className="flex items-center gap-2">
                {issues.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">
                    {issues.length}
                  </span>
                )}
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={getScoreBgColor(score || 0)}
                    initial={{ width: 0 }}
                    animate={{ width: `${score || 0}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%' }}
                  />
                </div>
                <span className={`text-sm font-medium w-8 ${getScoreColor(score || 0)}`}>
                  {score || 0}
                </span>
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && issues.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-2">
                    {issues.map(issue => (
                      <IssueCard key={issue.id} issue={issue} compact />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export const IssueCard: React.FC<{
  issue: SEOIssue;
  compact?: boolean;
  className?: string;
}> = ({ issue, compact = false, className = '' }) => {
  const { markIssueFixed } = useSEOScore();
  const [showFix, setShowFix] = useState(false);

  const typeStyles = {
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    suggestion: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
  };

  const typeIcons = {
    error: '❌',
    warning: '⚠️',
    suggestion: '💡',
  };

  if (compact) {
    return (
      <div className={`flex items-start gap-2 p-2 rounded-lg ${typeStyles[issue.type]} ${className}`}>
        <span className="text-sm">{typeIcons[issue.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {issue.title}
          </p>
          {issue.howToFix && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {issue.howToFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={`border rounded-xl overflow-hidden ${typeStyles[issue.type]} ${
        issue.isFixed ? 'opacity-50' : ''
      } ${className}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">{typeIcons[issue.type]}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {issue.title}
              </h4>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                issue.impact === 'high' ? 'bg-red-200 text-red-800' :
                issue.impact === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {issue.impact} impact
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {issue.description}
            </p>

            {issue.howToFix && (
              <button
                onClick={() => setShowFix(!showFix)}
                className="text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
              >
                {showFix ? 'Hide fix' : 'How to fix'}
              </button>
            )}

            <AnimatePresence>
              {showFix && issue.howToFix && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  {issue.howToFix}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!issue.isFixed && (
            <button
              onClick={() => markIssueFixed(issue.id)}
              className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Mark as fixed"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const IssuesList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { scoreData } = useSEOScore();
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'suggestion'>('all');

  const filteredIssues = scoreData.issues.filter(issue =>
    filter === 'all' || issue.type === filter
  );

  const unfixedIssues = filteredIssues.filter(i => !i.isFixed);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'error', 'warning', 'suggestion'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === type
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}s
            {type === 'all' && ` (${scoreData.issues.length})`}
          </button>
        ))}
      </div>

      {unfixedIssues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🎉</span>
          <p>No issues found!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unfixedIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};

export const KeywordAnalysisList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { scoreData, config, setTargetKeywords } = useSEOScore();
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setTargetKeywords([...config.targetKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setTargetKeywords(config.targetKeywords.filter(k => k !== keyword));
  };

  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
          placeholder="Add target keyword..."
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddKeyword}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add
        </button>
      </div>

      {scoreData.keywords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🎯</span>
          <p>Add target keywords to analyze</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scoreData.keywords.map(kw => (
            <div
              key={kw.keyword}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 dark:text-white">
                  "{kw.keyword}"
                </span>
                <button
                  onClick={() => handleRemoveKeyword(kw.keyword)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={kw.count > 0 ? 'text-green-500' : 'text-red-500'}>
                    {kw.count > 0 ? '✓' : '✕'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {kw.count} occurrences ({kw.density.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={kw.inTitle ? 'text-green-500' : 'text-red-500'}>
                    {kw.inTitle ? '✓' : '✕'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">In title</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={kw.inMeta ? 'text-green-500' : 'text-red-500'}>
                    {kw.inMeta ? '✓' : '✕'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">In meta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={kw.inHeadings ? 'text-green-500' : 'text-red-500'}>
                    {kw.inHeadings ? '✓' : '✕'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">In headings</span>
                </div>
              </div>

              <div className="mt-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  kw.status === 'optimal' ? 'bg-green-100 text-green-700' :
                  kw.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {kw.status === 'optimal' ? 'Optimal density' :
                   kw.status === 'low' ? 'Low density - use more' :
                   'High density - reduce usage'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ContentStats: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { scoreData } = useSEOScore();

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {scoreData.wordCount}
        </div>
        <div className="text-xs text-gray-500 uppercase">Words</div>
      </div>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {scoreData.readingTime}
        </div>
        <div className="text-xs text-gray-500 uppercase">Min Read</div>
      </div>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className={`text-2xl font-bold ${getScoreColor(scoreData.readabilityScore)}`}>
          {scoreData.readabilityScore}
        </div>
        <div className="text-xs text-gray-500 uppercase">Readability</div>
      </div>
    </div>
  );
};

export const RefreshButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { refreshAnalysis, isAnalyzing } = useSEOScore();

  return (
    <button
      onClick={refreshAnalysis}
      disabled={isAnalyzing}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 ${className}`}
    >
      <span className={isAnalyzing ? 'animate-spin' : ''}>🔄</span>
      <span>{isAnalyzing ? 'Analyzing...' : 'Refresh'}</span>
    </button>
  );
};

// Main Component
export const SEOScorePanel: React.FC<{
  content?: SEOContent;
  config?: Partial<SEOScoreConfig>;
  onScoreChange?: (score: SEOScoreData) => void;
  className?: string;
}> = ({ content, config, onScoreChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'keywords'>('overview');

  return (
    <SEOScoreProvider config={config} initialContent={content} onScoreChange={onScoreChange}>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              SEO Analysis
            </h2>
            <RefreshButton />
          </div>
        </div>

        <div className="p-4">
          <OverallScore className="mb-6" />
          <ContentStats className="mb-6" />

          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {(['overview', 'issues', 'keywords'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <CategoryScores />}
          {activeTab === 'issues' && <IssuesList />}
          {activeTab === 'keywords' && <KeywordAnalysisList />}
        </div>
      </div>
    </SEOScoreProvider>
  );
};

export default SEOScorePanel;
