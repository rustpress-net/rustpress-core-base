/**
 * OpenGraphPreview Component (23)
 *
 * Open Graph meta tags editor with Facebook/LinkedIn previews
 * Features: Live preview, image cropping, validation, templates
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
  type: OGType;
  siteName: string;
  locale: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export type OGType =
  | 'website'
  | 'article'
  | 'blog'
  | 'product'
  | 'profile'
  | 'video.movie'
  | 'video.episode'
  | 'music.song';

export interface OpenGraphConfig {
  defaultType: OGType;
  defaultLocale: string;
  siteName: string;
  idealImageSize: { width: number; height: number };
  titleMaxLength: number;
  descriptionMaxLength: number;
}

interface OpenGraphContextType {
  ogData: OpenGraphData;
  config: OpenGraphConfig;
  validation: ValidationResult;
  activePreview: 'facebook' | 'linkedin' | 'discord';
  updateOGData: (updates: Partial<OpenGraphData>) => void;
  updateArticleData: (updates: Partial<OpenGraphData['article']>) => void;
  setActivePreview: (preview: 'facebook' | 'linkedin' | 'discord') => void;
  validateData: () => ValidationResult;
  generateFromContent: (title: string, description: string, image?: string) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const OpenGraphContext = createContext<OpenGraphContextType | null>(null);

// Default config
const defaultConfig: OpenGraphConfig = {
  defaultType: 'article',
  defaultLocale: 'en_US',
  siteName: 'RustPress',
  idealImageSize: { width: 1200, height: 630 },
  titleMaxLength: 60,
  descriptionMaxLength: 200,
};

// Provider
interface OpenGraphProviderProps {
  children: ReactNode;
  initialData?: Partial<OpenGraphData>;
  config?: Partial<OpenGraphConfig>;
  onDataChange?: (data: OpenGraphData) => void;
}

export const OpenGraphProvider: React.FC<OpenGraphProviderProps> = ({
  children,
  initialData,
  config: userConfig,
  onDataChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [ogData, setOGData] = useState<OpenGraphData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    imageAlt: initialData?.imageAlt || '',
    url: initialData?.url || '',
    type: initialData?.type || config.defaultType,
    siteName: initialData?.siteName || config.siteName,
    locale: initialData?.locale || config.defaultLocale,
    article: initialData?.article,
  });

  const [activePreview, setActivePreview] = useState<'facebook' | 'linkedin' | 'discord'>('facebook');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });

  const validateData = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!ogData.title) {
      errors.push('Title is required');
    } else if (ogData.title.length > config.titleMaxLength) {
      warnings.push(`Title exceeds ${config.titleMaxLength} characters`);
    }

    if (!ogData.description) {
      warnings.push('Description is recommended');
    } else if (ogData.description.length > config.descriptionMaxLength) {
      warnings.push(`Description exceeds ${config.descriptionMaxLength} characters`);
    }

    if (!ogData.image) {
      warnings.push('Image is recommended for better engagement');
    }

    if (!ogData.url) {
      errors.push('URL is required');
    } else if (!ogData.url.startsWith('http')) {
      errors.push('URL must be a valid absolute URL');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
    setValidation(result);
    return result;
  }, [ogData, config]);

  const updateOGData = useCallback((updates: Partial<OpenGraphData>) => {
    setOGData(prev => {
      const newData = { ...prev, ...updates };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const updateArticleData = useCallback((updates: Partial<OpenGraphData['article']>) => {
    setOGData(prev => {
      const newData = {
        ...prev,
        article: { ...prev.article, ...updates },
      };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const generateFromContent = useCallback((title: string, description: string, image?: string) => {
    updateOGData({
      title: title.slice(0, config.titleMaxLength),
      description: description.slice(0, config.descriptionMaxLength),
      image: image || ogData.image,
    });
  }, [config, ogData.image, updateOGData]);

  return (
    <OpenGraphContext.Provider value={{
      ogData,
      config,
      validation,
      activePreview,
      updateOGData,
      updateArticleData,
      setActivePreview,
      validateData,
      generateFromContent,
    }}>
      {children}
    </OpenGraphContext.Provider>
  );
};

// Hook
export const useOpenGraph = () => {
  const context = useContext(OpenGraphContext);
  if (!context) {
    throw new Error('useOpenGraph must be used within OpenGraphProvider');
  }
  return context;
};

// Sub-components
export const OGTitleInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData, config, updateOGData } = useOpenGraph();

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          og:title
        </label>
        <span className={`text-xs ${
          ogData.title.length > config.titleMaxLength ? 'text-red-500' : 'text-gray-500'
        }`}>
          {ogData.title.length}/{config.titleMaxLength}
        </span>
      </div>
      <input
        type="text"
        value={ogData.title}
        onChange={(e) => updateOGData({ title: e.target.value })}
        placeholder="Page title for social sharing..."
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export const OGDescriptionInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData, config, updateOGData } = useOpenGraph();

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          og:description
        </label>
        <span className={`text-xs ${
          ogData.description.length > config.descriptionMaxLength ? 'text-red-500' : 'text-gray-500'
        }`}>
          {ogData.description.length}/{config.descriptionMaxLength}
        </span>
      </div>
      <textarea
        value={ogData.description}
        onChange={(e) => updateOGData({ description: e.target.value })}
        placeholder="Description for social sharing..."
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
};

export const OGImageInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData, config, updateOGData } = useOpenGraph();

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          og:image
        </label>
        <span className="text-xs text-gray-500">
          Recommended: {config.idealImageSize.width}x{config.idealImageSize.height}
        </span>
      </div>

      {ogData.image ? (
        <div className="relative">
          <img
            src={ogData.image}
            alt={ogData.imageAlt || 'OG Image'}
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => updateOGData({ image: '', imageAlt: '' })}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="block p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
          <span className="text-4xl mb-2 block">🖼️</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Click to add image or paste URL
          </span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      )}

      <input
        type="url"
        value={ogData.image}
        onChange={(e) => updateOGData({ image: e.target.value })}
        placeholder="Or paste image URL..."
        className="w-full mt-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {ogData.image && (
        <input
          type="text"
          value={ogData.imageAlt}
          onChange={(e) => updateOGData({ imageAlt: e.target.value })}
          placeholder="Image alt text..."
          className="w-full mt-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};

export const OGTypeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData, updateOGData } = useOpenGraph();

  const types: { value: OGType; label: string; icon: string }[] = [
    { value: 'website', label: 'Website', icon: '🌐' },
    { value: 'article', label: 'Article', icon: '📰' },
    { value: 'blog', label: 'Blog', icon: '✍️' },
    { value: 'product', label: 'Product', icon: '🛍️' },
    { value: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        og:type
      </label>
      <div className="grid grid-cols-5 gap-2">
        {types.map(type => (
          <button
            key={type.value}
            onClick={() => updateOGData({ type: type.value })}
            className={`p-3 rounded-lg border text-center transition-colors ${
              ogData.type === type.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-xl block">{type.icon}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ArticleMetadata: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData, updateArticleData } = useOpenGraph();

  if (ogData.type !== 'article' && ogData.type !== 'blog') {
    return null;
  }

  return (
    <div className={`space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Article Metadata
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Published Time</label>
          <input
            type="datetime-local"
            value={ogData.article?.publishedTime || ''}
            onChange={(e) => updateArticleData({ publishedTime: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Modified Time</label>
          <input
            type="datetime-local"
            value={ogData.article?.modifiedTime || ''}
            onChange={(e) => updateArticleData({ modifiedTime: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Author</label>
        <input
          type="text"
          value={ogData.article?.author || ''}
          onChange={(e) => updateArticleData({ author: e.target.value })}
          placeholder="Author name or profile URL"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Section</label>
        <input
          type="text"
          value={ogData.article?.section || ''}
          onChange={(e) => updateArticleData({ section: e.target.value })}
          placeholder="e.g., Technology, News, Sports"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
      </div>
    </div>
  );
};

export const FacebookPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData } = useOpenGraph();

  return (
    <div className={`bg-[#f0f2f5] p-4 rounded-lg ${className}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm max-w-[500px]">
        {ogData.image ? (
          <img
            src={ogData.image}
            alt={ogData.imageAlt || 'Preview'}
            className="w-full h-[261px] object-cover"
          />
        ) : (
          <div className="w-full h-[261px] bg-gray-200 flex items-center justify-center">
            <span className="text-4xl">🖼️</span>
          </div>
        )}
        <div className="p-3 bg-[#f0f2f5] border-t">
          <div className="text-[11px] text-gray-500 uppercase mb-1">
            {ogData.siteName || 'example.com'}
          </div>
          <div className="text-[16px] font-semibold text-[#1d2129] leading-tight mb-1">
            {ogData.title || 'Page Title'}
          </div>
          <div className="text-[14px] text-gray-600 line-clamp-2">
            {ogData.description || 'Description will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LinkedInPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData } = useOpenGraph();

  return (
    <div className={`bg-[#f3f2ef] p-4 rounded-lg ${className}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm max-w-[552px]">
        {ogData.image ? (
          <img
            src={ogData.image}
            alt={ogData.imageAlt || 'Preview'}
            className="w-full h-[288px] object-cover"
          />
        ) : (
          <div className="w-full h-[288px] bg-gray-200 flex items-center justify-center">
            <span className="text-4xl">🖼️</span>
          </div>
        )}
        <div className="p-4">
          <div className="text-[16px] font-semibold text-[#000000e6] leading-tight mb-1">
            {ogData.title || 'Page Title'}
          </div>
          <div className="text-[12px] text-[#00000099]">
            {ogData.siteName || 'example.com'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiscordPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData } = useOpenGraph();

  return (
    <div className={`bg-[#36393f] p-4 rounded-lg ${className}`}>
      <div className="border-l-4 border-[#202225] bg-[#2f3136] rounded-r max-w-[520px]">
        <div className="p-4">
          <div className="text-[12px] text-gray-400 mb-1">
            {ogData.siteName || 'example.com'}
          </div>
          <div className="text-[16px] font-semibold text-[#00b0f4] hover:underline cursor-pointer mb-2">
            {ogData.title || 'Page Title'}
          </div>
          <div className="text-[14px] text-[#dcddde] mb-4 line-clamp-3">
            {ogData.description || 'Description will appear here...'}
          </div>
          {ogData.image && (
            <img
              src={ogData.image}
              alt={ogData.imageAlt || 'Preview'}
              className="max-w-full max-h-[300px] rounded object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewTabs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { activePreview, setActivePreview } = useOpenGraph();

  const tabs = [
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'discord', label: 'Discord', icon: '🎮' },
  ] as const;

  return (
    <div className={`flex gap-2 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => setActivePreview(tab.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activePreview === tab.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span>{tab.icon}</span>
          <span className="text-sm font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export const ValidationStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { validation, validateData } = useOpenGraph();

  return (
    <div className={className}>
      <button
        onClick={validateData}
        className="text-sm text-blue-500 hover:text-blue-600 mb-3"
      >
        🔍 Validate
      </button>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-600">
              <span>❌</span>
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-yellow-600">
              <span>⚠️</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {validation.isValid && validation.errors.length === 0 && validation.warnings.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <span>✅</span>
          <span>All Open Graph tags are valid</span>
        </div>
      )}
    </div>
  );
};

export const OGCodePreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ogData } = useOpenGraph();

  const generateCode = () => {
    let code = '';
    code += `<meta property="og:title" content="${ogData.title}">\n`;
    code += `<meta property="og:description" content="${ogData.description}">\n`;
    code += `<meta property="og:type" content="${ogData.type}">\n`;
    code += `<meta property="og:url" content="${ogData.url}">\n`;
    if (ogData.image) {
      code += `<meta property="og:image" content="${ogData.image}">\n`;
      if (ogData.imageAlt) {
        code += `<meta property="og:image:alt" content="${ogData.imageAlt}">\n`;
      }
    }
    code += `<meta property="og:site_name" content="${ogData.siteName}">\n`;
    code += `<meta property="og:locale" content="${ogData.locale}">\n`;

    if (ogData.article && (ogData.type === 'article' || ogData.type === 'blog')) {
      if (ogData.article.publishedTime) {
        code += `<meta property="article:published_time" content="${ogData.article.publishedTime}">\n`;
      }
      if (ogData.article.modifiedTime) {
        code += `<meta property="article:modified_time" content="${ogData.article.modifiedTime}">\n`;
      }
      if (ogData.article.author) {
        code += `<meta property="article:author" content="${ogData.article.author}">\n`;
      }
      if (ogData.article.section) {
        code += `<meta property="article:section" content="${ogData.article.section}">\n`;
      }
    }

    return code;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generated Tags
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
export const OpenGraphPreview: React.FC<{
  initialData?: Partial<OpenGraphData>;
  config?: Partial<OpenGraphConfig>;
  onDataChange?: (data: OpenGraphData) => void;
  className?: string;
}> = ({ initialData, config, onDataChange, className = '' }) => {
  const [showCode, setShowCode] = useState(false);

  return (
    <OpenGraphProvider initialData={initialData} config={config} onDataChange={onDataChange}>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Open Graph
            </h2>
            <span className="text-xs text-gray-500">
              Facebook • LinkedIn • Discord
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Editor */}
          <div className="space-y-6">
            <OGTitleInput />
            <OGDescriptionInput />
            <OGImageInput />
            <OGTypeSelector />
            <ArticleMetadata />
            <ValidationStatus />

            <button
              onClick={() => setShowCode(!showCode)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {showCode ? 'Hide' : 'Show'} generated code
            </button>

            <AnimatePresence>
              {showCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <OGCodePreview />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview */}
          <div>
            <PreviewTabs className="mb-4" />
            <OpenGraphPreviewContent />
          </div>
        </div>
      </div>
    </OpenGraphProvider>
  );
};

const OpenGraphPreviewContent: React.FC = () => {
  const { activePreview } = useOpenGraph();

  return (
    <>
      {activePreview === 'facebook' && <FacebookPreview />}
      {activePreview === 'linkedin' && <LinkedInPreview />}
      {activePreview === 'discord' && <DiscordPreview />}
    </>
  );
};

export default OpenGraphPreview;
