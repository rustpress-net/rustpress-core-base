/**
 * CanonicalURLManager Component (26)
 *
 * Canonical URL management for SEO
 * Features: URL suggestions, validation, duplicate detection
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface CanonicalURL {
  url: string;
  isDefault: boolean;
  source: 'auto' | 'manual' | 'inherited';
}

export interface URLVariant {
  url: string;
  type: 'www' | 'non-www' | 'http' | 'https' | 'trailing-slash' | 'query-params';
  isCanonical: boolean;
}

export interface CanonicalConfig {
  siteUrl: string;
  forceHttps: boolean;
  preferWww: boolean;
  removeTrailingSlash: boolean;
  stripQueryParams: string[];
  enableAutoDetection: boolean;
}

interface CanonicalContextType {
  canonical: CanonicalURL;
  variants: URLVariant[];
  suggestions: string[];
  validation: URLValidation;
  config: CanonicalConfig;
  setCanonicalUrl: (url: string) => void;
  setSource: (source: 'auto' | 'manual' | 'inherited') => void;
  generateSuggestions: (currentPath: string) => void;
  validateUrl: (url: string) => URLValidation;
  normalizeUrl: (url: string) => string;
  detectDuplicates: () => URLVariant[];
}

interface URLValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const CanonicalContext = createContext<CanonicalContextType | null>(null);

// Default config
const defaultConfig: CanonicalConfig = {
  siteUrl: 'https://example.com',
  forceHttps: true,
  preferWww: false,
  removeTrailingSlash: true,
  stripQueryParams: ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'ref'],
  enableAutoDetection: true,
};

// Provider
interface CanonicalProviderProps {
  children: ReactNode;
  initialUrl?: string;
  currentPath?: string;
  config?: Partial<CanonicalConfig>;
  onUrlChange?: (url: CanonicalURL) => void;
}

export const CanonicalProvider: React.FC<CanonicalProviderProps> = ({
  children,
  initialUrl,
  currentPath = '',
  config: userConfig,
  onUrlChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [canonical, setCanonical] = useState<CanonicalURL>({
    url: initialUrl || `${config.siteUrl}${currentPath}`,
    isDefault: !initialUrl,
    source: initialUrl ? 'manual' : 'auto',
  });

  const [variants, setVariants] = useState<URLVariant[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validation, setValidation] = useState<URLValidation>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const normalizeUrl = useCallback((url: string): string => {
    try {
      let normalized = url.trim();

      // Ensure protocol
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = `https://${normalized}`;
      }

      const urlObj = new URL(normalized);

      // Force HTTPS
      if (config.forceHttps && urlObj.protocol === 'http:') {
        urlObj.protocol = 'https:';
      }

      // Handle www preference
      if (config.preferWww && !urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = `www.${urlObj.hostname}`;
      } else if (!config.preferWww && urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = urlObj.hostname.replace('www.', '');
      }

      // Handle trailing slash
      if (config.removeTrailingSlash && urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }

      // Strip tracking params
      config.stripQueryParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch {
      return url;
    }
  }, [config]);

  const validateUrl = useCallback((url: string): URLValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!url) {
      errors.push('URL is required');
      return { isValid: false, errors, warnings };
    }

    try {
      const urlObj = new URL(url);

      // Check protocol
      if (urlObj.protocol !== 'https:' && config.forceHttps) {
        warnings.push('URL should use HTTPS');
      }

      // Check for tracking params
      config.stripQueryParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          warnings.push(`URL contains tracking parameter: ${param}`);
        }
      });

      // Check trailing slash
      if (config.removeTrailingSlash && urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
        warnings.push('URL has trailing slash');
      }

      // Check for duplicate content indicators
      if (urlObj.pathname.includes('//')) {
        errors.push('URL contains double slashes');
      }

      // Check domain matches site URL
      const siteUrlObj = new URL(config.siteUrl);
      if (urlObj.hostname !== siteUrlObj.hostname &&
          urlObj.hostname !== `www.${siteUrlObj.hostname}` &&
          `www.${urlObj.hostname}` !== siteUrlObj.hostname) {
        warnings.push('URL domain differs from site domain');
      }
    } catch {
      errors.push('Invalid URL format');
    }

    const result = { isValid: errors.length === 0, errors, warnings };
    setValidation(result);
    return result;
  }, [config]);

  const setCanonicalUrl = useCallback((url: string) => {
    const normalizedUrl = normalizeUrl(url);
    const newCanonical: CanonicalURL = {
      url: normalizedUrl,
      isDefault: false,
      source: 'manual',
    };
    setCanonical(newCanonical);
    validateUrl(normalizedUrl);
    onUrlChange?.(newCanonical);
  }, [normalizeUrl, validateUrl, onUrlChange]);

  const setSource = useCallback((source: 'auto' | 'manual' | 'inherited') => {
    setCanonical(prev => {
      const newCanonical = { ...prev, source };
      onUrlChange?.(newCanonical);
      return newCanonical;
    });
  }, [onUrlChange]);

  const generateSuggestions = useCallback((currentPath: string) => {
    const baseSuggestions: string[] = [];
    const baseUrl = config.siteUrl;

    // Current path
    baseSuggestions.push(`${baseUrl}${currentPath}`);

    // Without query params
    if (currentPath.includes('?')) {
      baseSuggestions.push(`${baseUrl}${currentPath.split('?')[0]}`);
    }

    // Without trailing slash
    if (currentPath.endsWith('/') && currentPath !== '/') {
      baseSuggestions.push(`${baseUrl}${currentPath.slice(0, -1)}`);
    }

    // With trailing slash
    if (!currentPath.endsWith('/')) {
      baseSuggestions.push(`${baseUrl}${currentPath}/`);
    }

    setSuggestions([...new Set(baseSuggestions)]);
  }, [config.siteUrl]);

  const detectDuplicates = useCallback((): URLVariant[] => {
    const baseUrl = canonical.url;
    const detected: URLVariant[] = [];

    try {
      const urlObj = new URL(baseUrl);

      // WWW variant
      if (urlObj.hostname.startsWith('www.')) {
        const nonWww = baseUrl.replace('www.', '');
        detected.push({
          url: nonWww,
          type: 'non-www',
          isCanonical: false,
        });
      } else {
        const withWww = baseUrl.replace(urlObj.hostname, `www.${urlObj.hostname}`);
        detected.push({
          url: withWww,
          type: 'www',
          isCanonical: false,
        });
      }

      // HTTP variant
      if (urlObj.protocol === 'https:') {
        detected.push({
          url: baseUrl.replace('https://', 'http://'),
          type: 'http',
          isCanonical: false,
        });
      }

      // Trailing slash variant
      if (urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
        detected.push({
          url: baseUrl.slice(0, -1),
          type: 'trailing-slash',
          isCanonical: false,
        });
      } else if (!urlObj.pathname.endsWith('/')) {
        detected.push({
          url: `${baseUrl}/`,
          type: 'trailing-slash',
          isCanonical: false,
        });
      }

      setVariants(detected);
      return detected;
    } catch {
      return [];
    }
  }, [canonical.url]);

  return (
    <CanonicalContext.Provider value={{
      canonical,
      variants,
      suggestions,
      validation,
      config,
      setCanonicalUrl,
      setSource,
      generateSuggestions,
      validateUrl,
      normalizeUrl,
      detectDuplicates,
    }}>
      {children}
    </CanonicalContext.Provider>
  );
};

// Hook
export const useCanonical = () => {
  const context = useContext(CanonicalContext);
  if (!context) {
    throw new Error('useCanonical must be used within CanonicalProvider');
  }
  return context;
};

// Sub-components
export const CanonicalUrlInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canonical, setCanonicalUrl, validation } = useCanonical();

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        Canonical URL
      </label>
      <div className="relative">
        <input
          type="url"
          value={canonical.url}
          onChange={(e) => setCanonicalUrl(e.target.value)}
          placeholder="https://example.com/page"
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validation.isValid
              ? 'border-gray-200 dark:border-gray-700'
              : 'border-red-500'
          }`}
        />
        {validation.isValid && canonical.url && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            ✓
          </span>
        )}
      </div>
      {!validation.isValid && (
        <div className="mt-2 space-y-1">
          {validation.errors.map((error, i) => (
            <p key={i} className="text-sm text-red-600">❌ {error}</p>
          ))}
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {validation.warnings.map((warning, i) => (
            <p key={i} className="text-sm text-yellow-600">⚠️ {warning}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export const SourceSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canonical, setSource } = useCanonical();

  const sources = [
    { value: 'auto', label: 'Auto-detect', icon: '🤖', description: 'Use current page URL' },
    { value: 'manual', label: 'Manual', icon: '✏️', description: 'Set custom URL' },
    { value: 'inherited', label: 'Inherited', icon: '📥', description: 'From parent page' },
  ] as const;

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
        URL Source
      </label>
      <div className="grid grid-cols-3 gap-3">
        {sources.map(source => (
          <button
            key={source.value}
            onClick={() => setSource(source.value)}
            className={`p-4 rounded-xl border text-center transition-colors ${
              canonical.source === source.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-2xl mb-2 block">{source.icon}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white block">
              {source.label}
            </span>
            <span className="text-xs text-gray-500">{source.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SuggestionsList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { suggestions, setCanonicalUrl, canonical } = useCanonical();

  if (suggestions.length === 0) return null;

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
        Suggestions
      </label>
      <div className="space-y-2">
        {suggestions.map((url, index) => (
          <button
            key={index}
            onClick={() => setCanonicalUrl(url)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
              canonical.url === url
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-sm text-gray-900 dark:text-white truncate">
              {url}
            </span>
            {canonical.url === url && (
              <span className="text-green-500 flex-shrink-0 ml-2">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const DuplicateDetector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { variants, detectDuplicates, canonical } = useCanonical();
  const [hasDetected, setHasDetected] = useState(false);

  const handleDetect = () => {
    detectDuplicates();
    setHasDetected(true);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Duplicate URL Detection
        </label>
        <button
          onClick={handleDetect}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          🔍 Detect
        </button>
      </div>

      {hasDetected && (
        <div className="space-y-2">
          {variants.length === 0 ? (
            <p className="text-sm text-green-600">✅ No potential duplicates found</p>
          ) : (
            <>
              <p className="text-sm text-yellow-600 mb-3">
                ⚠️ {variants.length} potential duplicate URL(s) found
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300 truncate">
                    {canonical.url}
                  </span>
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded ml-auto">
                    Canonical
                  </span>
                </div>
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {variant.url}
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded ml-auto">
                      {variant.type}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These URLs should 301 redirect to the canonical URL
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const NormalizationSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config } = useCanonical();

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Normalization Settings
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={config.forceHttps ? 'text-green-500' : 'text-gray-400'}>
            {config.forceHttps ? '✓' : '○'}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Force HTTPS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={config.preferWww ? 'text-green-500' : 'text-gray-400'}>
            {config.preferWww ? '✓' : '○'}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Prefer www</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={config.removeTrailingSlash ? 'text-green-500' : 'text-gray-400'}>
            {config.removeTrailingSlash ? '✓' : '○'}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Remove trailing slash</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500">✓</span>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Strip params: </span>
            <span className="text-xs text-gray-500">
              {config.stripQueryParams.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CanonicalCodePreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canonical } = useCanonical();

  const code = `<link rel="canonical" href="${canonical.url}">`;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          HTML Tag
        </h4>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Main Component
export const CanonicalURLManager: React.FC<{
  initialUrl?: string;
  currentPath?: string;
  config?: Partial<CanonicalConfig>;
  onUrlChange?: (url: CanonicalURL) => void;
  className?: string;
}> = ({ initialUrl, currentPath, config, onUrlChange, className = '' }) => {
  return (
    <CanonicalProvider
      initialUrl={initialUrl}
      currentPath={currentPath}
      config={config}
      onUrlChange={onUrlChange}
    >
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Canonical URL
            </h2>
            <span className="text-xs text-gray-500">rel="canonical"</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <SourceSelector />
          <CanonicalUrlInput />
          <SuggestionsList />
          <DuplicateDetector />
          <NormalizationSettings />
          <CanonicalCodePreview />
        </div>
      </div>
    </CanonicalProvider>
  );
};

export default CanonicalURLManager;
