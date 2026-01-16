import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Settings,
  BarChart2,
  Target,
  Zap,
  Info,
  Plus,
  X,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react';
import clsx from 'clsx';

interface KeywordInfo {
  keyword: string;
  count: number;
  density: number;
  status: 'optimal' | 'low' | 'high' | 'stuffed';
  positions: number[];
  inTitle: boolean;
  inHeadings: boolean;
  inFirstParagraph: boolean;
  inMetaDescription: boolean;
  inUrl: boolean;
}

interface KeywordDensitySettings {
  minDensity: number;
  maxDensity: number;
  optimalDensity: number;
  showPositions: boolean;
  trackPhrases: boolean;
  maxKeywordLength: number;
  excludeStopWords: boolean;
  caseSensitive: boolean;
}

interface KeywordDensityProps {
  content?: string;
  title?: string;
  metaDescription?: string;
  url?: string;
  focusKeywords?: string[];
  onAddKeyword?: (keyword: string) => void;
  onRemoveKeyword?: (keyword: string) => void;
  className?: string;
}

const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its'];

const mockContent = `React Hooks have revolutionized how we write React components. With React Hooks,
developers can now use state and other React features without writing a class. The useState hook
is one of the most commonly used React Hooks. It allows you to add state to functional components.
Another popular hook is useEffect, which lets you perform side effects in React components.
Custom hooks are also a powerful feature of React Hooks, enabling code reuse across components.
When using React Hooks, always remember to follow the rules of hooks: only call hooks at the top level
and only call hooks from React functions. React Hooks have made React development more intuitive and efficient.`;

export const KeywordDensity: React.FC<KeywordDensityProps> = ({
  content = mockContent,
  title = 'Complete Guide to React Hooks',
  metaDescription = 'Learn how to use React Hooks effectively in your React applications',
  url = '/blog/react-hooks-guide',
  focusKeywords = ['React Hooks', 'useState', 'useEffect', 'custom hooks'],
  onAddKeyword,
  onRemoveKeyword,
  className
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'focus' | 'all' | 'suggestions'>('focus');
  const [settings, setSettings] = useState<KeywordDensitySettings>({
    minDensity: 0.5,
    maxDensity: 2.5,
    optimalDensity: 1.5,
    showPositions: true,
    trackPhrases: true,
    maxKeywordLength: 3,
    excludeStopWords: true,
    caseSensitive: false
  });

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).length;
  }, [content]);

  const analyzeKeyword = (keyword: string): KeywordInfo => {
    const searchTerm = settings.caseSensitive ? keyword : keyword.toLowerCase();
    const searchContent = settings.caseSensitive ? content : content.toLowerCase();
    const searchTitle = settings.caseSensitive ? title : title.toLowerCase();
    const searchMeta = settings.caseSensitive ? metaDescription : metaDescription.toLowerCase();
    const searchUrl = settings.caseSensitive ? url : url.toLowerCase();

    let count = 0;
    const positions: number[] = [];
    let pos = 0;

    while ((pos = searchContent.indexOf(searchTerm, pos)) !== -1) {
      count++;
      positions.push(pos);
      pos += searchTerm.length;
    }

    const density = (count / wordCount) * 100;

    let status: KeywordInfo['status'] = 'optimal';
    if (density < settings.minDensity) status = 'low';
    else if (density > settings.maxDensity && density <= 4) status = 'high';
    else if (density > 4) status = 'stuffed';

    const firstParagraph = content.split('\n')[0] || '';
    const headings = content.match(/^#+\s.+$/gm) || [];

    return {
      keyword,
      count,
      density,
      status,
      positions,
      inTitle: searchTitle.includes(searchTerm),
      inHeadings: headings.some(h => (settings.caseSensitive ? h : h.toLowerCase()).includes(searchTerm)),
      inFirstParagraph: (settings.caseSensitive ? firstParagraph : firstParagraph.toLowerCase()).includes(searchTerm),
      inMetaDescription: searchMeta.includes(searchTerm),
      inUrl: searchUrl.includes(searchTerm.replace(/\s+/g, '-'))
    };
  };

  const keywordAnalysis = useMemo(() => {
    return focusKeywords.map(analyzeKeyword);
  }, [focusKeywords, content, settings]);

  const allKeywords = useMemo(() => {
    const words = content.toLowerCase().split(/\s+/);
    const frequency: Record<string, number> = {};

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 2 && (!settings.excludeStopWords || !stopWords.includes(cleanWord))) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .map(([word, count]) => ({
        keyword: word,
        count,
        density: (count / wordCount) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [content, settings.excludeStopWords, wordCount]);

  const suggestions = useMemo(() => {
    return allKeywords
      .filter(k => !focusKeywords.some(fk => fk.toLowerCase() === k.keyword))
      .filter(k => k.density >= 0.5 && k.density <= 3)
      .slice(0, 10);
  }, [allKeywords, focusKeywords]);

  const overallScore = useMemo(() => {
    if (keywordAnalysis.length === 0) return 0;

    let score = 100;
    keywordAnalysis.forEach(k => {
      if (k.status === 'low') score -= 10;
      if (k.status === 'high') score -= 15;
      if (k.status === 'stuffed') score -= 25;
      if (!k.inTitle) score -= 5;
      if (!k.inFirstParagraph) score -= 5;
      if (!k.inMetaDescription) score -= 5;
    });
    return Math.max(0, score);
  }, [keywordAnalysis]);

  const getStatusColor = (status: KeywordInfo['status']) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'low': return 'text-amber-600 bg-amber-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'stuffed': return 'text-red-600 bg-red-100';
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && onAddKeyword) {
      onAddKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

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
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Hash size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Keyword Density</h2>
            <p className="text-sm text-gray-500">Analyze keyword usage and optimization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={clsx(
            'px-3 py-1 rounded-full font-medium text-sm',
            overallScore >= 80 ? 'bg-green-100 text-green-700' :
            overallScore >= 60 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          )}>
            Score: {overallScore}/100
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 divide-x border-b">
        <div className="p-3 text-center">
          <div className="text-xl font-bold">{wordCount}</div>
          <div className="text-xs text-gray-500">Total Words</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xl font-bold">{focusKeywords.length}</div>
          <div className="text-xs text-gray-500">Focus Keywords</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xl font-bold text-green-600">
            {keywordAnalysis.filter(k => k.status === 'optimal').length}
          </div>
          <div className="text-xs text-gray-500">Optimal</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xl font-bold text-amber-600">
            {keywordAnalysis.filter(k => k.status !== 'optimal').length}
          </div>
          <div className="text-xs text-gray-500">Need Work</div>
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Min Density (%)</label>
                <input
                  type="number"
                  value={settings.minDensity}
                  onChange={(e) => setSettings({ ...settings, minDensity: parseFloat(e.target.value) })}
                  step="0.1"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Max Density (%)</label>
                <input
                  type="number"
                  value={settings.maxDensity}
                  onChange={(e) => setSettings({ ...settings, maxDensity: parseFloat(e.target.value) })}
                  step="0.1"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.excludeStopWords}
                  onChange={(e) => setSettings({ ...settings, excludeStopWords: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Exclude Stop Words</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPositions}
                  onChange={(e) => setSettings({ ...settings, showPositions: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Show Positions</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Keyword */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add focus keyword..."
            className="flex-1 px-3 py-2 border rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
          />
          <button
            onClick={handleAddKeyword}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'focus', label: 'Focus Keywords', count: focusKeywords.length },
          { id: 'all', label: 'All Keywords', count: allKeywords.length },
          { id: 'suggestions', label: 'Suggestions', count: suggestions.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {tab.label}
            <span className="px-2 py-0.5 text-xs bg-gray-200 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'focus' && (
          <div className="divide-y">
            {keywordAnalysis.map((kw, idx) => (
              <motion.div
                key={kw.keyword}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{kw.keyword}</span>
                    <span className={clsx('px-2 py-0.5 text-xs rounded-full', getStatusColor(kw.status))}>
                      {kw.status}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveKeyword?.(kw.keyword)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">{kw.count}</div>
                    <div className="text-xs text-gray-500">Occurrences</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">{kw.density.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500">Density</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">
                      {settings.minDensity}-{settings.maxDensity}%
                    </div>
                    <div className="text-xs text-gray-500">Target</div>
                  </div>
                </div>

                {/* Density Bar */}
                <div className="mb-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all',
                        kw.status === 'optimal' && 'bg-green-500',
                        kw.status === 'low' && 'bg-amber-500',
                        kw.status === 'high' && 'bg-orange-500',
                        kw.status === 'stuffed' && 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(kw.density * 20, 100)}%` }}
                    />
                    {/* Optimal range markers */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                      style={{ left: `${settings.minDensity * 20}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                      style={{ left: `${settings.maxDensity * 20}%` }}
                    />
                  </div>
                </div>

                {/* Placement Checklist */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Title', check: kw.inTitle },
                    { label: 'Headings', check: kw.inHeadings },
                    { label: 'First Paragraph', check: kw.inFirstParagraph },
                    { label: 'Meta Description', check: kw.inMetaDescription },
                    { label: 'URL', check: kw.inUrl }
                  ].map(item => (
                    <span
                      key={item.label}
                      className={clsx(
                        'px-2 py-1 text-xs rounded-full flex items-center gap-1',
                        item.check
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {item.check ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                      {item.label}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {keywordAnalysis.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Hash size={32} className="mx-auto mb-2 opacity-50" />
                <p>No focus keywords added yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="p-4">
            <div className="space-y-2">
              {allKeywords.map((kw, idx) => (
                <div
                  key={kw.keyword}
                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-sm font-medium w-8 text-gray-400">#{idx + 1}</span>
                  <span className="flex-1 font-medium">{kw.keyword}</span>
                  <span className="text-sm text-gray-500">{kw.count}x</span>
                  <span className="text-sm text-indigo-600">{kw.density.toFixed(2)}%</span>
                  <button
                    onClick={() => onAddKeyword?.(kw.keyword)}
                    className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                    title="Add as focus keyword"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Info size={16} className="text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                These keywords appear frequently in your content but aren't tracked as focus keywords.
              </p>
            </div>
            {suggestions.map((kw, idx) => (
              <motion.div
                key={kw.keyword}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <span className="font-medium">{kw.keyword}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {kw.count} occurrences • {kw.density.toFixed(2)}%
                  </span>
                </div>
                <button
                  onClick={() => onAddKeyword?.(kw.keyword)}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add
                </button>
              </motion.div>
            ))}

            {suggestions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Zap size={32} className="mx-auto mb-2 opacity-50" />
                <p>No suggestions available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 border-t bg-indigo-50 dark:bg-indigo-900/20">
        <div className="flex items-start gap-3">
          <Target size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-indigo-800 dark:text-indigo-200">
            <strong>Best Practices:</strong> Keep keyword density between {settings.minDensity}% and {settings.maxDensity}%.
            Include focus keywords in title, first paragraph, and meta description for optimal SEO.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KeywordDensity;
