import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// EMBED MANAGER - Component 19
// Embed picker for YouTube, Twitter, Instagram, and other external content
// ============================================================================

// Types
export type EmbedProvider = 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'spotify' | 'soundcloud' | 'codepen' | 'github' | 'custom';

export interface EmbedData {
  id: string;
  provider: EmbedProvider;
  url: string;
  embedUrl?: string;
  title?: string;
  thumbnail?: string;
  author?: string;
  html?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export interface EmbedProviderConfig {
  id: EmbedProvider;
  name: string;
  icon: React.ReactNode;
  urlPattern: RegExp;
  embedUrlTemplate?: string;
  color: string;
}

interface EmbedManagerContextType {
  embeds: EmbedData[];
  selectedEmbed: EmbedData | null;
  isLoading: boolean;
  providers: EmbedProviderConfig[];
  addEmbed: (url: string) => Promise<EmbedData | null>;
  removeEmbed: (id: string) => void;
  updateEmbed: (id: string, updates: Partial<EmbedData>) => void;
  selectEmbed: (embed: EmbedData | null) => void;
  detectProvider: (url: string) => EmbedProvider | null;
  getEmbedHtml: (embed: EmbedData) => string;
}

const EmbedManagerContext = createContext<EmbedManagerContextType | null>(null);

export const useEmbedManager = () => {
  const context = useContext(EmbedManagerContext);
  if (!context) {
    throw new Error('useEmbedManager must be used within EmbedManagerProvider');
  }
  return context;
};

// Provider configurations
const defaultProviders: EmbedProviderConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    urlPattern: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    embedUrlTemplate: 'https://www.youtube.com/embed/{id}',
    color: '#ff0000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    urlPattern: /vimeo\.com\/(\d+)/,
    embedUrlTemplate: 'https://player.vimeo.com/video/{id}',
    color: '#1ab7ea',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    urlPattern: /(?:twitter|x)\.com\/\w+\/status\/(\d+)/,
    color: '#1da1f2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    urlPattern: /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
    color: '#e4405f',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    id: 'spotify',
    name: 'Spotify',
    urlPattern: /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/,
    color: '#1db954',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  {
    id: 'codepen',
    name: 'CodePen',
    urlPattern: /codepen\.io\/([^\/]+)\/pen\/([a-zA-Z0-9]+)/,
    color: '#000000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.144 13.067v-2.134L16.55 12zm1.715 1.135l-1.136.934v-1.868zM11.56 2.406L2.783 8.468l3.475 2.286 5.302-3.531zM5.84 12l-2.472 1.648 2.472 1.649zm.316 2.286L2.783 16.532l8.777 6.062v-4.179zm5.844 2.065l5.302 3.531 3.475-2.286-8.777-5.776zm5.719-2.351l2.472-1.648-2.472-1.649zM12 9.583L7.635 12 12 14.417 16.365 12zm6.144-1.517l-5.302-3.531v4.179l5.302-3.531zm-11.872 0v4.179L1.1 9.579l5.172 2.487zM12 2.262l8.857 5.802v7.872L12 21.738l-8.857-5.802V8.064z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub Gist',
    urlPattern: /gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/,
    color: '#333333',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
];

// Provider
export interface EmbedManagerProviderProps {
  children: React.ReactNode;
  initialEmbeds?: EmbedData[];
  providers?: EmbedProviderConfig[];
  onEmbed?: (embed: EmbedData) => void;
}

export const EmbedManagerProvider: React.FC<EmbedManagerProviderProps> = ({
  children,
  initialEmbeds = [],
  providers = defaultProviders,
  onEmbed,
}) => {
  const [embeds, setEmbeds] = useState<EmbedData[]>(initialEmbeds);
  const [selectedEmbed, setSelectedEmbed] = useState<EmbedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const detectProvider = useCallback((url: string): EmbedProvider | null => {
    for (const provider of providers) {
      if (provider.urlPattern.test(url)) {
        return provider.id;
      }
    }
    return null;
  }, [providers]);

  const addEmbed = useCallback(async (url: string): Promise<EmbedData | null> => {
    setIsLoading(true);

    // Simulate fetching embed data
    await new Promise(resolve => setTimeout(resolve, 1000));

    const provider = detectProvider(url);
    if (!provider) {
      setIsLoading(false);
      return null;
    }

    const providerConfig = providers.find(p => p.id === provider);
    const match = url.match(providerConfig?.urlPattern || /./);
    const contentId = match?.[1] || '';

    const embedData: EmbedData = {
      id: generateId(),
      provider,
      url,
      embedUrl: providerConfig?.embedUrlTemplate?.replace('{id}', contentId),
      title: `${providerConfig?.name} Content`,
      aspectRatio: provider === 'youtube' || provider === 'vimeo' ? 16/9 : undefined,
    };

    setEmbeds(prev => [...prev, embedData]);
    setIsLoading(false);
    onEmbed?.(embedData);

    return embedData;
  }, [detectProvider, providers, onEmbed]);

  const removeEmbed = useCallback((id: string) => {
    setEmbeds(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateEmbed = useCallback((id: string, updates: Partial<EmbedData>) => {
    setEmbeds(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const selectEmbed = useCallback((embed: EmbedData | null) => {
    setSelectedEmbed(embed);
  }, []);

  const getEmbedHtml = useCallback((embed: EmbedData): string => {
    if (embed.html) return embed.html;

    if (embed.provider === 'youtube' || embed.provider === 'vimeo') {
      return `<iframe src="${embed.embedUrl}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
    }

    return `<a href="${embed.url}" target="_blank">${embed.url}</a>`;
  }, []);

  const value: EmbedManagerContextType = {
    embeds,
    selectedEmbed,
    isLoading,
    providers,
    addEmbed,
    removeEmbed,
    updateEmbed,
    selectEmbed,
    detectProvider,
    getEmbedHtml,
  };

  return (
    <EmbedManagerContext.Provider value={value}>
      {children}
    </EmbedManagerContext.Provider>
  );
};

// Provider Icon
const ProviderIcon: React.FC<{ provider: EmbedProviderConfig }> = ({ provider }) => (
  <div
    style={{
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      backgroundColor: `${provider.color}15`,
      color: provider.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {provider.icon}
  </div>
);

// URL Input
export const EmbedUrlInput: React.FC<{ onEmbed?: (embed: EmbedData) => void }> = ({ onEmbed }) => {
  const { addEmbed, isLoading, detectProvider, providers } = useEmbedManager();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const detectedProvider = url ? providers.find(p => p.id === detectProvider(url)) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    const embed = await addEmbed(url);

    if (embed) {
      onEmbed?.(embed);
      setUrl('');
    } else {
      setError('Unable to embed this URL. Please check the URL and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ position: 'relative' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="Paste a URL to embed (YouTube, Twitter, etc.)"
          style={{
            width: '100%',
            padding: '12px 48px 12px 16px',
            border: '1px solid',
            borderColor: error ? '#dc2626' : detectedProvider ? '#10b981' : '#e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
        {detectedProvider && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: detectedProvider.color,
            }}
          >
            {detectedProvider.icon}
          </div>
        )}
      </div>

      {error && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#dc2626' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!url.trim() || isLoading}
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: isLoading || !url.trim() ? '#93c5fd' : '#3b82f6',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 500,
          cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            </motion.div>
            Embedding...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Embed
          </>
        )}
      </button>
    </form>
  );
};

// Provider Selector
export const ProviderSelector: React.FC = () => {
  const { providers } = useEmbedManager();

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', marginBottom: '12px' }}>
        Supported Platforms
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {providers.map(provider => (
          <div
            key={provider.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <ProviderIcon provider={provider} />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>{provider.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Embed Preview Card
export const EmbedPreview: React.FC<{ embed: EmbedData; onRemove?: () => void }> = ({
  embed,
  onRemove,
}) => {
  const { providers } = useEmbedManager();
  const provider = providers.find(p => p.id === embed.provider);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Embed Container */}
      <div
        style={{
          aspectRatio: embed.aspectRatio ? `${embed.aspectRatio}` : '16/9',
          backgroundColor: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: provider?.color || '#6b7280' }}>
          {provider?.icon}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                backgroundColor: `${provider?.color}15`,
                color: provider?.color,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {provider?.name}
            </span>
            <span style={{ fontSize: '13px', color: '#374151' }}>{embed.title}</span>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {embed.url}
        </p>
      </div>
    </motion.div>
  );
};

// Embeds List
export const EmbedsList: React.FC = () => {
  const { embeds, removeEmbed } = useEmbedManager();

  if (embeds.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
        Embedded Content ({embeds.length})
      </div>
      <AnimatePresence>
        {embeds.map(embed => (
          <EmbedPreview
            key={embed.id}
            embed={embed}
            onRemove={() => removeEmbed(embed.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Main Component
export const EmbedManager: React.FC<{ onEmbed?: (embed: EmbedData) => void }> = ({ onEmbed }) => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
          Embed Content
        </span>
      </div>

      <EmbedUrlInput onEmbed={onEmbed} />

      <div style={{ marginTop: '20px' }}>
        <ProviderSelector />
      </div>

      <EmbedsList />
    </div>
  );
};

export default EmbedManager;
