/**
 * TwitterCardPreview Component (24)
 *
 * Twitter Card meta tags editor with live preview
 * Features: Card types, image validation, preview modes
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface TwitterCardData {
  cardType: TwitterCardType;
  site: string;
  creator: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  player?: {
    url: string;
    width: number;
    height: number;
    stream?: string;
  };
  app?: {
    iphone?: { id: string; name: string; url: string };
    ipad?: { id: string; name: string; url: string };
    googleplay?: { id: string; name: string; url: string };
  };
}

export type TwitterCardType =
  | 'summary'
  | 'summary_large_image'
  | 'player'
  | 'app';

export interface TwitterCardConfig {
  defaultCardType: TwitterCardType;
  siteHandle: string;
  titleMaxLength: number;
  descriptionMaxLength: number;
  summaryImageSize: { width: number; height: number };
  largeImageSize: { width: number; height: number };
}

interface TwitterCardContextType {
  cardData: TwitterCardData;
  config: TwitterCardConfig;
  validation: CardValidation;
  updateCardData: (updates: Partial<TwitterCardData>) => void;
  updatePlayerData: (updates: Partial<TwitterCardData['player']>) => void;
  validateCard: () => CardValidation;
  copyToClipboard: () => void;
}

interface CardValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const TwitterCardContext = createContext<TwitterCardContextType | null>(null);

// Default config
const defaultConfig: TwitterCardConfig = {
  defaultCardType: 'summary_large_image',
  siteHandle: '',
  titleMaxLength: 70,
  descriptionMaxLength: 200,
  summaryImageSize: { width: 120, height: 120 },
  largeImageSize: { width: 800, height: 418 },
};

// Provider
interface TwitterCardProviderProps {
  children: ReactNode;
  initialData?: Partial<TwitterCardData>;
  config?: Partial<TwitterCardConfig>;
  onDataChange?: (data: TwitterCardData) => void;
}

export const TwitterCardProvider: React.FC<TwitterCardProviderProps> = ({
  children,
  initialData,
  config: userConfig,
  onDataChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [cardData, setCardData] = useState<TwitterCardData>({
    cardType: initialData?.cardType || config.defaultCardType,
    site: initialData?.site || config.siteHandle,
    creator: initialData?.creator || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    imageAlt: initialData?.imageAlt || '',
    player: initialData?.player,
    app: initialData?.app,
  });

  const [validation, setValidation] = useState<CardValidation>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const validateCard = useCallback((): CardValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!cardData.title) {
      errors.push('Title is required');
    } else if (cardData.title.length > config.titleMaxLength) {
      warnings.push(`Title exceeds ${config.titleMaxLength} characters`);
    }

    if (cardData.description.length > config.descriptionMaxLength) {
      warnings.push(`Description exceeds ${config.descriptionMaxLength} characters`);
    }

    if (!cardData.image && cardData.cardType !== 'app') {
      warnings.push('Image is recommended for better engagement');
    }

    if (cardData.cardType === 'player') {
      if (!cardData.player?.url) {
        errors.push('Player URL is required for player cards');
      }
      if (!cardData.player?.width || !cardData.player?.height) {
        errors.push('Player dimensions are required');
      }
    }

    if (cardData.site && !cardData.site.startsWith('@')) {
      warnings.push('Site handle should start with @');
    }

    if (cardData.creator && !cardData.creator.startsWith('@')) {
      warnings.push('Creator handle should start with @');
    }

    const result = { isValid: errors.length === 0, errors, warnings };
    setValidation(result);
    return result;
  }, [cardData, config]);

  const updateCardData = useCallback((updates: Partial<TwitterCardData>) => {
    setCardData(prev => {
      const newData = { ...prev, ...updates };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const updatePlayerData = useCallback((updates: Partial<TwitterCardData['player']>) => {
    setCardData(prev => {
      const newData = {
        ...prev,
        player: { ...prev.player, ...updates } as TwitterCardData['player'],
      };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const copyToClipboard = useCallback(() => {
    let code = `<meta name="twitter:card" content="${cardData.cardType}">\n`;
    if (cardData.site) code += `<meta name="twitter:site" content="${cardData.site}">\n`;
    if (cardData.creator) code += `<meta name="twitter:creator" content="${cardData.creator}">\n`;
    code += `<meta name="twitter:title" content="${cardData.title}">\n`;
    if (cardData.description) code += `<meta name="twitter:description" content="${cardData.description}">\n`;
    if (cardData.image) {
      code += `<meta name="twitter:image" content="${cardData.image}">\n`;
      if (cardData.imageAlt) code += `<meta name="twitter:image:alt" content="${cardData.imageAlt}">\n`;
    }
    navigator.clipboard.writeText(code);
  }, [cardData]);

  return (
    <TwitterCardContext.Provider value={{
      cardData,
      config,
      validation,
      updateCardData,
      updatePlayerData,
      validateCard,
      copyToClipboard,
    }}>
      {children}
    </TwitterCardContext.Provider>
  );
};

// Hook
export const useTwitterCard = () => {
  const context = useContext(TwitterCardContext);
  if (!context) {
    throw new Error('useTwitterCard must be used within TwitterCardProvider');
  }
  return context;
};

// Sub-components
export const CardTypeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, updateCardData } = useTwitterCard();

  const types: { value: TwitterCardType; label: string; description: string; icon: string }[] = [
    { value: 'summary', label: 'Summary', description: 'Small square image', icon: '📋' },
    { value: 'summary_large_image', label: 'Large Image', description: 'Large rectangle image', icon: '🖼️' },
    { value: 'player', label: 'Player', description: 'Video/audio player', icon: '▶️' },
    { value: 'app', label: 'App', description: 'Mobile app card', icon: '📱' },
  ];

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
        Card Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {types.map(type => (
          <button
            key={type.value}
            onClick={() => updateCardData({ cardType: type.value })}
            className={`p-4 rounded-xl border text-left transition-colors ${
              cardData.cardType === type.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-2xl mb-2 block">{type.icon}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white block">
              {type.label}
            </span>
            <span className="text-xs text-gray-500">{type.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const TwitterHandles: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, updateCardData } = useTwitterCard();

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Site Handle
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={cardData.site.replace('@', '')}
            onChange={(e) => updateCardData({ site: `@${e.target.value.replace('@', '')}` })}
            placeholder="yoursite"
            className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Creator Handle
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={cardData.creator.replace('@', '')}
            onChange={(e) => updateCardData({ creator: `@${e.target.value.replace('@', '')}` })}
            placeholder="author"
            className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export const TwitterTitleInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, config, updateCardData } = useTwitterCard();

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <span className={`text-xs ${
          cardData.title.length > config.titleMaxLength ? 'text-red-500' : 'text-gray-500'
        }`}>
          {cardData.title.length}/{config.titleMaxLength}
        </span>
      </div>
      <input
        type="text"
        value={cardData.title}
        onChange={(e) => updateCardData({ title: e.target.value })}
        placeholder="Card title..."
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export const TwitterDescriptionInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, config, updateCardData } = useTwitterCard();

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <span className={`text-xs ${
          cardData.description.length > config.descriptionMaxLength ? 'text-red-500' : 'text-gray-500'
        }`}>
          {cardData.description.length}/{config.descriptionMaxLength}
        </span>
      </div>
      <textarea
        value={cardData.description}
        onChange={(e) => updateCardData({ description: e.target.value })}
        placeholder="Card description..."
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
};

export const TwitterImageInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, config, updateCardData } = useTwitterCard();

  const imageSize = cardData.cardType === 'summary'
    ? config.summaryImageSize
    : config.largeImageSize;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Image
        </label>
        <span className="text-xs text-gray-500">
          Recommended: {imageSize.width}x{imageSize.height}
        </span>
      </div>

      {cardData.image ? (
        <div className="relative">
          <img
            src={cardData.image}
            alt={cardData.imageAlt || 'Preview'}
            className={`w-full object-cover rounded-lg ${
              cardData.cardType === 'summary' ? 'h-32' : 'h-48'
            }`}
          />
          <button
            onClick={() => updateCardData({ image: '', imageAlt: '' })}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="block p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-400">
          <span className="text-4xl mb-2 block">🐦</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Add image for Twitter card
          </span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      )}

      <input
        type="url"
        value={cardData.image}
        onChange={(e) => updateCardData({ image: e.target.value })}
        placeholder="Or paste image URL..."
        className="w-full mt-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {cardData.image && (
        <input
          type="text"
          value={cardData.imageAlt}
          onChange={(e) => updateCardData({ imageAlt: e.target.value })}
          placeholder="Image alt text for accessibility..."
          className="w-full mt-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};

export const PlayerCardSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, updatePlayerData } = useTwitterCard();

  if (cardData.cardType !== 'player') {
    return null;
  }

  return (
    <div className={`space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Player Settings
      </h4>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Player URL (HTTPS required)</label>
        <input
          type="url"
          value={cardData.player?.url || ''}
          onChange={(e) => updatePlayerData({ url: e.target.value })}
          placeholder="https://example.com/player"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Width (px)</label>
          <input
            type="number"
            value={cardData.player?.width || ''}
            onChange={(e) => updatePlayerData({ width: parseInt(e.target.value) || 0 })}
            placeholder="480"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Height (px)</label>
          <input
            type="number"
            value={cardData.player?.height || ''}
            onChange={(e) => updatePlayerData({ height: parseInt(e.target.value) || 0 })}
            placeholder="270"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Stream URL (optional)</label>
        <input
          type="url"
          value={cardData.player?.stream || ''}
          onChange={(e) => updatePlayerData({ stream: e.target.value })}
          placeholder="https://example.com/stream.mp4"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        />
      </div>
    </div>
  );
};

export const SummaryCardPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData } = useTwitterCard();

  return (
    <div className={`bg-[#15202b] p-4 rounded-lg ${className}`}>
      <div className="flex bg-[#192734] rounded-xl overflow-hidden border border-[#38444d] max-w-[438px]">
        {cardData.image ? (
          <img
            src={cardData.image}
            alt={cardData.imageAlt || 'Preview'}
            className="w-[120px] h-[120px] object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-[120px] h-[120px] bg-[#38444d] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🐦</span>
          </div>
        )}
        <div className="p-3 min-w-0">
          <div className="text-[15px] font-normal text-white truncate">
            {cardData.title || 'Card Title'}
          </div>
          <div className="text-[15px] text-[#8b98a5] line-clamp-2 mt-1">
            {cardData.description || 'Card description...'}
          </div>
          <div className="text-[15px] text-[#8b98a5] mt-1 flex items-center gap-1">
            <span>🔗</span>
            <span>example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LargeImageCardPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData } = useTwitterCard();

  return (
    <div className={`bg-[#15202b] p-4 rounded-lg ${className}`}>
      <div className="bg-[#192734] rounded-xl overflow-hidden border border-[#38444d] max-w-[506px]">
        {cardData.image ? (
          <img
            src={cardData.image}
            alt={cardData.imageAlt || 'Preview'}
            className="w-full h-[252px] object-cover"
          />
        ) : (
          <div className="w-full h-[252px] bg-[#38444d] flex items-center justify-center">
            <span className="text-4xl">🐦</span>
          </div>
        )}
        <div className="p-3">
          <div className="text-[15px] font-normal text-white truncate">
            {cardData.title || 'Card Title'}
          </div>
          <div className="text-[15px] text-[#8b98a5] line-clamp-2 mt-1">
            {cardData.description || 'Card description...'}
          </div>
          <div className="text-[15px] text-[#8b98a5] mt-1 flex items-center gap-1">
            <span>🔗</span>
            <span>example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TwitterCardPreviewDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData } = useTwitterCard();

  return (
    <div className={className}>
      {cardData.cardType === 'summary' && <SummaryCardPreview />}
      {cardData.cardType === 'summary_large_image' && <LargeImageCardPreview />}
      {cardData.cardType === 'player' && <LargeImageCardPreview />}
      {cardData.cardType === 'app' && <SummaryCardPreview />}
    </div>
  );
};

export const TwitterValidation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { validation, validateCard } = useTwitterCard();

  return (
    <div className={className}>
      <button
        onClick={validateCard}
        className="text-sm text-blue-500 hover:text-blue-600 mb-3"
      >
        🔍 Validate Card
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
          <span>Twitter Card is valid</span>
        </div>
      )}
    </div>
  );
};

export const TwitterCodePreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { cardData, copyToClipboard } = useTwitterCard();

  const generateCode = () => {
    let code = `<meta name="twitter:card" content="${cardData.cardType}">\n`;
    if (cardData.site) code += `<meta name="twitter:site" content="${cardData.site}">\n`;
    if (cardData.creator) code += `<meta name="twitter:creator" content="${cardData.creator}">\n`;
    code += `<meta name="twitter:title" content="${cardData.title}">\n`;
    if (cardData.description) code += `<meta name="twitter:description" content="${cardData.description}">\n`;
    if (cardData.image) {
      code += `<meta name="twitter:image" content="${cardData.image}">\n`;
      if (cardData.imageAlt) code += `<meta name="twitter:image:alt" content="${cardData.imageAlt}">\n`;
    }
    if (cardData.cardType === 'player' && cardData.player) {
      code += `<meta name="twitter:player" content="${cardData.player.url}">\n`;
      code += `<meta name="twitter:player:width" content="${cardData.player.width}">\n`;
      code += `<meta name="twitter:player:height" content="${cardData.player.height}">\n`;
      if (cardData.player.stream) {
        code += `<meta name="twitter:player:stream" content="${cardData.player.stream}">\n`;
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
          onClick={copyToClipboard}
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
export const TwitterCardPreview: React.FC<{
  initialData?: Partial<TwitterCardData>;
  config?: Partial<TwitterCardConfig>;
  onDataChange?: (data: TwitterCardData) => void;
  className?: string;
}> = ({ initialData, config, onDataChange, className = '' }) => {
  const [showCode, setShowCode] = useState(false);

  return (
    <TwitterCardProvider initialData={initialData} config={config} onDataChange={onDataChange}>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Twitter Card
            </h2>
            <span className="text-xl">🐦</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Editor */}
          <div className="space-y-6">
            <CardTypeSelector />
            <TwitterHandles />
            <TwitterTitleInput />
            <TwitterDescriptionInput />
            <TwitterImageInput />
            <PlayerCardSettings />
            <TwitterValidation />

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
                  <TwitterCodePreview />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Preview
            </h3>
            <TwitterCardPreviewDisplay />
          </div>
        </div>
      </div>
    </TwitterCardProvider>
  );
};

export default TwitterCardPreview;
