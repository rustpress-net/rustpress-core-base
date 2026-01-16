/**
 * MetaTagsEditor Component (22)
 *
 * Editor for SEO meta tags including title, description, and keywords
 * Features: Character counts, previews, templates, AI suggestions
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  robots: RobotsDirective[];
  canonical?: string;
  author?: string;
  language?: string;
  customTags: CustomMetaTag[];
}

export type RobotsDirective =
  | 'index'
  | 'noindex'
  | 'follow'
  | 'nofollow'
  | 'noarchive'
  | 'nosnippet'
  | 'noimageindex';

export interface CustomMetaTag {
  id: string;
  name: string;
  content: string;
  type: 'name' | 'property' | 'http-equiv';
}

export interface MetaTagsConfig {
  titleMaxLength: number;
  titleMinLength: number;
  descriptionMaxLength: number;
  descriptionMinLength: number;
  maxKeywords: number;
  enableAISuggestions: boolean;
  defaultRobots: RobotsDirective[];
}

interface MetaTagsContextType {
  metaTags: MetaTags;
  config: MetaTagsConfig;
  activeField: string | null;
  suggestions: MetaSuggestion[];
  isGenerating: boolean;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  toggleRobotsDirective: (directive: RobotsDirective) => void;
  updateCanonical: (url: string) => void;
  addCustomTag: (tag: Omit<CustomMetaTag, 'id'>) => void;
  removeCustomTag: (id: string) => void;
  updateCustomTag: (id: string, updates: Partial<CustomMetaTag>) => void;
  setActiveField: (field: string | null) => void;
  generateSuggestions: (field: string) => void;
  applySuggestion: (suggestion: MetaSuggestion) => void;
}

export interface MetaSuggestion {
  id: string;
  field: 'title' | 'description' | 'keywords';
  content: string;
  reason: string;
  score: number;
}

const MetaTagsContext = createContext<MetaTagsContextType | null>(null);

// Default config
const defaultConfig: MetaTagsConfig = {
  titleMaxLength: 60,
  titleMinLength: 30,
  descriptionMaxLength: 160,
  descriptionMinLength: 120,
  maxKeywords: 10,
  enableAISuggestions: true,
  defaultRobots: ['index', 'follow'],
};

// Provider
interface MetaTagsProviderProps {
  children: ReactNode;
  initialTags?: Partial<MetaTags>;
  config?: Partial<MetaTagsConfig>;
  onTagsChange?: (tags: MetaTags) => void;
}

export const MetaTagsProvider: React.FC<MetaTagsProviderProps> = ({
  children,
  initialTags,
  config: userConfig,
  onTagsChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [metaTags, setMetaTags] = useState<MetaTags>({
    title: initialTags?.title || '',
    description: initialTags?.description || '',
    keywords: initialTags?.keywords || [],
    robots: initialTags?.robots || config.defaultRobots,
    canonical: initialTags?.canonical,
    author: initialTags?.author,
    language: initialTags?.language || 'en',
    customTags: initialTags?.customTags || [],
  });

  const [activeField, setActiveField] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MetaSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateTags = useCallback((updates: Partial<MetaTags>) => {
    setMetaTags(prev => {
      const newTags = { ...prev, ...updates };
      onTagsChange?.(newTags);
      return newTags;
    });
  }, [onTagsChange]);

  const updateTitle = useCallback((title: string) => {
    updateTags({ title });
  }, [updateTags]);

  const updateDescription = useCallback((description: string) => {
    updateTags({ description });
  }, [updateTags]);

  const addKeyword = useCallback((keyword: string) => {
    if (metaTags.keywords.length < config.maxKeywords && !metaTags.keywords.includes(keyword)) {
      updateTags({ keywords: [...metaTags.keywords, keyword] });
    }
  }, [metaTags.keywords, config.maxKeywords, updateTags]);

  const removeKeyword = useCallback((keyword: string) => {
    updateTags({ keywords: metaTags.keywords.filter(k => k !== keyword) });
  }, [metaTags.keywords, updateTags]);

  const toggleRobotsDirective = useCallback((directive: RobotsDirective) => {
    const newRobots = metaTags.robots.includes(directive)
      ? metaTags.robots.filter(d => d !== directive)
      : [...metaTags.robots, directive];
    updateTags({ robots: newRobots });
  }, [metaTags.robots, updateTags]);

  const updateCanonical = useCallback((url: string) => {
    updateTags({ canonical: url });
  }, [updateTags]);

  const addCustomTag = useCallback((tag: Omit<CustomMetaTag, 'id'>) => {
    const newTag: CustomMetaTag = {
      ...tag,
      id: `custom-${Date.now()}`,
    };
    updateTags({ customTags: [...metaTags.customTags, newTag] });
  }, [metaTags.customTags, updateTags]);

  const removeCustomTag = useCallback((id: string) => {
    updateTags({ customTags: metaTags.customTags.filter(t => t.id !== id) });
  }, [metaTags.customTags, updateTags]);

  const updateCustomTag = useCallback((id: string, updates: Partial<CustomMetaTag>) => {
    updateTags({
      customTags: metaTags.customTags.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  }, [metaTags.customTags, updateTags]);

  const generateSuggestions = useCallback((field: string) => {
    if (!config.enableAISuggestions) return;

    setIsGenerating(true);

    // Simulate AI suggestions
    setTimeout(() => {
      const mockSuggestions: MetaSuggestion[] = [];

      if (field === 'title') {
        mockSuggestions.push(
          {
            id: 's1',
            field: 'title',
            content: 'Ultimate Guide to Modern Web Development | 2024',
            reason: 'Includes power words and year for relevance',
            score: 95,
          },
          {
            id: 's2',
            field: 'title',
            content: 'Web Development Best Practices & Tutorials',
            reason: 'Clear, descriptive, and keyword-rich',
            score: 88,
          }
        );
      } else if (field === 'description') {
        mockSuggestions.push(
          {
            id: 's3',
            field: 'description',
            content: 'Learn modern web development techniques with our comprehensive guide. Discover best practices, tools, and frameworks used by professional developers in 2024.',
            reason: 'Includes call-to-action and specific benefits',
            score: 92,
          },
          {
            id: 's4',
            field: 'description',
            content: 'Master web development with step-by-step tutorials covering HTML, CSS, JavaScript, React, and more. Start your coding journey today.',
            reason: 'Lists specific technologies and has clear CTA',
            score: 85,
          }
        );
      }

      setSuggestions(mockSuggestions);
      setIsGenerating(false);
    }, 1000);
  }, [config.enableAISuggestions]);

  const applySuggestion = useCallback((suggestion: MetaSuggestion) => {
    if (suggestion.field === 'title') {
      updateTitle(suggestion.content);
    } else if (suggestion.field === 'description') {
      updateDescription(suggestion.content);
    }
    setSuggestions([]);
  }, [updateTitle, updateDescription]);

  return (
    <MetaTagsContext.Provider value={{
      metaTags,
      config,
      activeField,
      suggestions,
      isGenerating,
      updateTitle,
      updateDescription,
      addKeyword,
      removeKeyword,
      toggleRobotsDirective,
      updateCanonical,
      addCustomTag,
      removeCustomTag,
      updateCustomTag,
      setActiveField,
      generateSuggestions,
      applySuggestion,
    }}>
      {children}
    </MetaTagsContext.Provider>
  );
};

// Hook
export const useMetaTags = () => {
  const context = useContext(MetaTagsContext);
  if (!context) {
    throw new Error('useMetaTags must be used within MetaTagsProvider');
  }
  return context;
};

// Utility functions
const getCharacterCountStatus = (length: number, min: number, max: number): 'short' | 'optimal' | 'long' => {
  if (length < min) return 'short';
  if (length > max) return 'long';
  return 'optimal';
};

const getStatusColor = (status: 'short' | 'optimal' | 'long'): string => {
  switch (status) {
    case 'short': return 'text-yellow-500';
    case 'optimal': return 'text-green-500';
    case 'long': return 'text-red-500';
  }
};

// Sub-components
export const TitleEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags, config, updateTitle, setActiveField, generateSuggestions } = useMetaTags();
  const status = getCharacterCountStatus(
    metaTags.title.length,
    config.titleMinLength,
    config.titleMaxLength
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Page Title
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateSuggestions('title')}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            ✨ Generate
          </button>
          <span className={`text-xs ${getStatusColor(status)}`}>
            {metaTags.title.length}/{config.titleMaxLength}
          </span>
        </div>
      </div>
      <input
        type="text"
        value={metaTags.title}
        onChange={(e) => updateTitle(e.target.value)}
        onFocus={() => setActiveField('title')}
        onBlur={() => setActiveField(null)}
        placeholder="Enter page title..."
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            status === 'optimal' ? 'bg-green-500' :
            status === 'short' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (metaTags.title.length / config.titleMaxLength) * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {status === 'short' && `Add ${config.titleMinLength - metaTags.title.length} more characters for better SEO`}
        {status === 'optimal' && '✓ Title length is optimal'}
        {status === 'long' && `Remove ${metaTags.title.length - config.titleMaxLength} characters to avoid truncation`}
      </p>
    </div>
  );
};

export const DescriptionEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags, config, updateDescription, setActiveField, generateSuggestions } = useMetaTags();
  const status = getCharacterCountStatus(
    metaTags.description.length,
    config.descriptionMinLength,
    config.descriptionMaxLength
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Meta Description
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateSuggestions('description')}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            ✨ Generate
          </button>
          <span className={`text-xs ${getStatusColor(status)}`}>
            {metaTags.description.length}/{config.descriptionMaxLength}
          </span>
        </div>
      </div>
      <textarea
        value={metaTags.description}
        onChange={(e) => updateDescription(e.target.value)}
        onFocus={() => setActiveField('description')}
        onBlur={() => setActiveField(null)}
        placeholder="Enter meta description..."
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            status === 'optimal' ? 'bg-green-500' :
            status === 'short' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (metaTags.description.length / config.descriptionMaxLength) * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {status === 'short' && `Add ${config.descriptionMinLength - metaTags.description.length} more characters`}
        {status === 'optimal' && '✓ Description length is optimal'}
        {status === 'long' && `Remove ${metaTags.description.length - config.descriptionMaxLength} characters`}
      </p>
    </div>
  );
};

export const KeywordsEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags, config, addKeyword, removeKeyword } = useMetaTags();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      addKeyword(input.trim());
      setInput('');
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Focus Keywords
        </label>
        <span className="text-xs text-gray-500">
          {metaTags.keywords.length}/{config.maxKeywords}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add keyword..."
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          disabled={metaTags.keywords.length >= config.maxKeywords}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {metaTags.keywords.map(keyword => (
            <motion.span
              key={keyword}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
              >
                ✕
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const RobotsEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags, toggleRobotsDirective } = useMetaTags();

  const directives: { value: RobotsDirective; label: string; description: string }[] = [
    { value: 'index', label: 'Index', description: 'Allow search engines to index this page' },
    { value: 'noindex', label: 'No Index', description: 'Prevent search engines from indexing' },
    { value: 'follow', label: 'Follow', description: 'Allow crawling links on this page' },
    { value: 'nofollow', label: 'No Follow', description: 'Prevent crawling links' },
    { value: 'noarchive', label: 'No Archive', description: 'Prevent cached copies' },
    { value: 'nosnippet', label: 'No Snippet', description: 'Prevent text snippets' },
    { value: 'noimageindex', label: 'No Image Index', description: 'Prevent image indexing' },
  ];

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
        Robots Directives
      </label>
      <div className="grid grid-cols-2 gap-2">
        {directives.map(directive => (
          <label
            key={directive.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              metaTags.robots.includes(directive.value)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="checkbox"
              checked={metaTags.robots.includes(directive.value)}
              onChange={() => toggleRobotsDirective(directive.value)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {directive.label}
              </span>
              <p className="text-xs text-gray-500">{directive.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export const CanonicalEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags, updateCanonical } = useMetaTags();

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        Canonical URL
      </label>
      <input
        type="url"
        value={metaTags.canonical || ''}
        onChange={(e) => updateCanonical(e.target.value)}
        placeholder="https://example.com/page"
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="mt-1 text-xs text-gray-500">
        Specify the preferred URL if this content exists at multiple URLs
      </p>
    </div>
  );
};

export const CustomTagsEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags, addCustomTag, removeCustomTag, updateCustomTag } = useMetaTags();
  const [showForm, setShowForm] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', content: '', type: 'name' as const });

  const handleAdd = () => {
    if (newTag.name && newTag.content) {
      addCustomTag(newTag);
      setNewTag({ name: '', content: '', type: 'name' });
      setShowForm(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom Meta Tags
        </label>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          + Add Tag
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="grid grid-cols-3 gap-3 mb-3">
              <select
                value={newTag.type}
                onChange={(e) => setNewTag({ ...newTag, type: e.target.value as any })}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="name">name</option>
                <option value="property">property</option>
                <option value="http-equiv">http-equiv</option>
              </select>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Tag name..."
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
              />
              <input
                type="text"
                value={newTag.content}
                onChange={(e) => setNewTag({ ...newTag, content: e.target.value })}
                placeholder="Content..."
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {metaTags.customTags.map(tag => (
          <div
            key={tag.id}
            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <code className="text-xs text-gray-500">{tag.type}=</code>
            <code className="text-xs font-medium text-gray-900 dark:text-white">
              {tag.name}
            </code>
            <span className="text-gray-400">→</span>
            <code className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
              {tag.content}
            </code>
            <button
              onClick={() => removeCustomTag(tag.id)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SuggestionsList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { suggestions, isGenerating, applySuggestion } = useMetaTags();

  if (isGenerating) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
          Generating suggestions...
        </span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        AI Suggestions
      </h4>
      {suggestions.map(suggestion => (
        <motion.div
          key={suggestion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
        >
          <p className="text-sm text-gray-900 dark:text-white mb-2">
            {suggestion.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {suggestion.reason}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-green-600">
                {suggestion.score}% match
              </span>
              <button
                onClick={() => applySuggestion(suggestion)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const MetaPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags } = useMetaTags();

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Search Preview
      </h4>
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
          {metaTags.title || 'Page Title'}
        </div>
        <div className="text-green-700 dark:text-green-500 text-sm mt-1">
          https://example.com/page-slug
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
          {metaTags.description || 'Meta description will appear here...'}
        </div>
      </div>
    </div>
  );
};

export const MetaCodePreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metaTags } = useMetaTags();

  const generateCode = () => {
    let code = '';
    if (metaTags.title) {
      code += `<title>${metaTags.title}</title>\n`;
    }
    if (metaTags.description) {
      code += `<meta name="description" content="${metaTags.description}">\n`;
    }
    if (metaTags.keywords.length > 0) {
      code += `<meta name="keywords" content="${metaTags.keywords.join(', ')}">\n`;
    }
    if (metaTags.robots.length > 0) {
      code += `<meta name="robots" content="${metaTags.robots.join(', ')}">\n`;
    }
    if (metaTags.canonical) {
      code += `<link rel="canonical" href="${metaTags.canonical}">\n`;
    }
    metaTags.customTags.forEach(tag => {
      code += `<meta ${tag.type}="${tag.name}" content="${tag.content}">\n`;
    });
    return code;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generated HTML
        </h4>
        <button
          onClick={() => navigator.clipboard.writeText(generateCode())}
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
        <code>{generateCode()}</code>
      </pre>
    </div>
  );
};

// Main Component
export const MetaTagsEditor: React.FC<{
  initialTags?: Partial<MetaTags>;
  config?: Partial<MetaTagsConfig>;
  onTagsChange?: (tags: MetaTags) => void;
  className?: string;
}> = ({ initialTags, config, onTagsChange, className = '' }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <MetaTagsProvider initialTags={initialTags} config={config} onTagsChange={onTagsChange}>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Meta Tags
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <MetaPreview />
          <TitleEditor />
          <DescriptionEditor />
          <SuggestionsList />
          <KeywordsEditor />

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
              ▶
            </span>
            Advanced Options
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <RobotsEditor />
                <CanonicalEditor />
                <CustomTagsEditor />
                <MetaCodePreview />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MetaTagsProvider>
  );
};

export default MetaTagsEditor;
