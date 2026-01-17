/**
 * SEOAnalyzer - On-page SEO analysis and recommendations
 * RustPress-specific SEO optimization functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, AlertCircle, AlertTriangle,
  FileText, Link, Image, Type, Hash, Globe, Clock, Eye,
  RefreshCw, Download, ArrowRight, ChevronDown, ChevronUp,
  Zap, Shield, Share2, BarChart2, Target, MessageSquare
} from 'lucide-react';

export interface SEOIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'title' | 'description' | 'headings' | 'content' | 'images' | 'links' | 'technical' | 'social';
  title: string;
  description: string;
  recommendation?: string;
  impact: 'high' | 'medium' | 'low';
  currentValue?: string;
  recommendedValue?: string;
}

export interface SEOScore {
  overall: number;
  title: number;
  description: number;
  headings: number;
  content: number;
  images: number;
  links: number;
  technical: number;
  social: number;
}

interface SEOAnalyzerProps {
  content?: string;
  url?: string;
  onFix?: (issue: SEOIssue) => void;
}

// Mock SEO analysis data
const mockIssues: SEOIssue[] = [
  {
    id: '1',
    type: 'error',
    category: 'title',
    title: 'Title tag is too short',
    description: 'Your title tag has only 15 characters. Google typically displays 50-60 characters.',
    recommendation: 'Add more descriptive keywords to your title tag.',
    impact: 'high',
    currentValue: 'My Blog Post',
    recommendedValue: 'My Blog Post - Complete Guide to RustPress Development'
  },
  {
    id: '2',
    type: 'warning',
    category: 'description',
    title: 'Meta description is missing',
    description: 'Your page does not have a meta description. This is important for search engine snippets.',
    recommendation: 'Add a compelling meta description between 150-160 characters.',
    impact: 'high'
  },
  {
    id: '3',
    type: 'warning',
    category: 'headings',
    title: 'Multiple H1 tags detected',
    description: 'Your page has 3 H1 tags. Best practice is to have only one H1 per page.',
    recommendation: 'Convert extra H1 tags to H2 or H3 tags.',
    impact: 'medium',
    currentValue: '3 H1 tags'
  },
  {
    id: '4',
    type: 'info',
    category: 'images',
    title: 'Images missing alt attributes',
    description: '5 images are missing alt text. Alt text helps search engines understand image content.',
    recommendation: 'Add descriptive alt text to all images.',
    impact: 'medium',
    currentValue: '5 images without alt'
  },
  {
    id: '5',
    type: 'success',
    category: 'content',
    title: 'Good content length',
    description: 'Your content has 1,250 words which is good for SEO.',
    impact: 'low',
    currentValue: '1,250 words'
  },
  {
    id: '6',
    type: 'warning',
    category: 'links',
    title: 'No internal links found',
    description: 'Your page has no internal links to other pages on your site.',
    recommendation: 'Add 2-5 relevant internal links to improve site structure.',
    impact: 'medium'
  },
  {
    id: '7',
    type: 'info',
    category: 'technical',
    title: 'Page load time could be improved',
    description: 'Your page loads in 3.2 seconds. Aim for under 2 seconds.',
    recommendation: 'Optimize images and enable caching.',
    impact: 'medium',
    currentValue: '3.2s'
  },
  {
    id: '8',
    type: 'error',
    category: 'social',
    title: 'Open Graph tags missing',
    description: 'Your page is missing Open Graph meta tags for social sharing.',
    recommendation: 'Add og:title, og:description, og:image tags.',
    impact: 'medium'
  }
];

const mockScores: SEOScore = {
  overall: 68,
  title: 45,
  description: 0,
  headings: 60,
  content: 85,
  images: 55,
  links: 40,
  technical: 70,
  social: 30
};

const categoryConfig = {
  title: { icon: Type, label: 'Title', color: 'text-blue-400' },
  description: { icon: FileText, label: 'Description', color: 'text-purple-400' },
  headings: { icon: Hash, label: 'Headings', color: 'text-cyan-400' },
  content: { icon: FileText, label: 'Content', color: 'text-green-400' },
  images: { icon: Image, label: 'Images', color: 'text-pink-400' },
  links: { icon: Link, label: 'Links', color: 'text-orange-400' },
  technical: { icon: Zap, label: 'Technical', color: 'text-yellow-400' },
  social: { icon: Share2, label: 'Social', color: 'text-indigo-400' }
};

export const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({
  content,
  url,
  onFix
}) => {
  const [issues, setIssues] = useState<SEOIssue[]>(mockIssues);
  const [scores, setScores] = useState<SEOScore>(mockScores);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'error' | 'warning' | 'info' | 'success'>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'type' | 'category'>('impact');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const toggleIssue = (id: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIssues(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-500/10 text-red-400 border-red-500/20',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const filteredIssues = issues
    .filter(issue => {
      const matchesFilter = filterType === 'all' || issue.type === filterType;
      const matchesCategory = !selectedCategory || issue.category === selectedCategory;
      return matchesFilter && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'impact') {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        return impactOrder[a.impact] - impactOrder[b.impact];
      }
      if (sortBy === 'type') {
        const typeOrder = { error: 0, warning: 1, info: 2, success: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.category.localeCompare(b.category);
    });

  const issueStats = {
    errors: issues.filter(i => i.type === 'error').length,
    warnings: issues.filter(i => i.type === 'warning').length,
    infos: issues.filter(i => i.type === 'info').length,
    passed: issues.filter(i => i.type === 'success').length
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-green-400" />
            SEO Analyzer
          </h2>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Overall Score */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Overall SEO Score</span>
            <span className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
              {scores.overall}%
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores.overall}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(scores.overall)}`}
            />
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const score = scores[key as keyof SEOScore];
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                className={`p-2 rounded-lg text-center transition-colors ${
                  selectedCategory === key ? 'bg-gray-700 ring-1 ring-gray-600' : 'bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon className={`w-3 h-3 ${config.color}`} />
                  <span className="text-xs text-gray-400">{config.label}</span>
                </div>
                <div className={`text-lg font-semibold ${getScoreColor(score)}`}>{score}%</div>
              </button>
            );
          })}
        </div>

        {/* Issue Stats */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-1 ${filterType === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilterType('error')}
            className={`flex items-center gap-1 ${filterType === 'error' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <XCircle className="w-3 h-3" />
            Errors ({issueStats.errors})
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`flex items-center gap-1 ${filterType === 'warning' ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <AlertTriangle className="w-3 h-3" />
            Warnings ({issueStats.warnings})
          </button>
          <button
            onClick={() => setFilterType('success')}
            className={`flex items-center gap-1 ${filterType === 'success' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <CheckCircle className="w-3 h-3" />
            Passed ({issueStats.passed})
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-gray-800/50">
          {filteredIssues.map(issue => {
            const config = categoryConfig[issue.category];
            const CategoryIcon = config.icon;
            const isExpanded = expandedIssues.has(issue.id);

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3"
              >
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => toggleIssue(issue.id)}
                >
                  {getTypeIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{issue.title}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${getImpactBadge(issue.impact)}`}>
                        {issue.impact}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-800 ${config.color}`}>
                        <CategoryIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{issue.description}</p>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 ml-7 overflow-hidden"
                    >
                      <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
                        {issue.currentValue && (
                          <div>
                            <span className="text-xs text-gray-500 uppercase">Current</span>
                            <p className="text-sm text-red-400 font-mono">{issue.currentValue}</p>
                          </div>
                        )}
                        {issue.recommendedValue && (
                          <div>
                            <span className="text-xs text-gray-500 uppercase">Recommended</span>
                            <p className="text-sm text-green-400 font-mono">{issue.recommendedValue}</p>
                          </div>
                        )}
                        {issue.recommendation && (
                          <div>
                            <span className="text-xs text-gray-500 uppercase">How to Fix</span>
                            <p className="text-sm text-gray-300">{issue.recommendation}</p>
                          </div>
                        )}
                        {issue.type !== 'success' && onFix && (
                          <button
                            onClick={() => onFix(issue)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 text-sm rounded-lg hover:bg-green-600/30"
                          >
                            <Zap className="w-4 h-4" />
                            Auto-Fix
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filteredIssues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mb-3 text-green-400 opacity-50" />
            <p className="text-sm">
              {filterType === 'all' ? 'No issues found' : `No ${filterType} issues`}
            </p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last analyzed: {new Date().toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">
            <Eye className="w-4 h-4" />
            Preview SERP
          </button>
        </div>
      </div>
    </div>
  );
};

export default SEOAnalyzer;
