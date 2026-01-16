import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SocialPlatform = 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'pinterest' | 'threads' | 'mastodon' | 'bluesky';
export type PublishStatus = 'pending' | 'scheduled' | 'published' | 'failed' | 'draft';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  name: string;
  handle: string;
  avatar?: string;
  isConnected: boolean;
  followers?: number;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  accountId: string;
  content: string;
  media?: SocialMedia[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: PublishStatus;
  stats?: PostStats;
  error?: string;
  link?: string;
}

export interface SocialMedia {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  altText?: string;
}

export interface PostStats {
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  impressions: number;
}

export interface SocialConfig {
  enabledPlatforms?: SocialPlatform[];
  accounts?: SocialAccount[];
  defaultHashtags?: string[];
  maxMediaPerPlatform?: Record<SocialPlatform, number>;
  characterLimits?: Record<SocialPlatform, number>;
  enableAutoPost?: boolean;
  enableScheduling?: boolean;
}

export interface SocialPublishData {
  selectedAccounts: string[];
  customMessages: Record<string, string>;
  scheduledTime?: Date;
  media: SocialMedia[];
  hashtags: string[];
  autoPost: boolean;
}

interface SocialContextType {
  data: SocialPublishData;
  setData: React.Dispatch<React.SetStateAction<SocialPublishData>>;
  posts: SocialPost[];
  setPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  config: SocialConfig;
  accounts: SocialAccount[];
  updateCustomMessage: (accountId: string, message: string) => void;
  toggleAccount: (accountId: string) => void;
  addMedia: (media: SocialMedia) => void;
  removeMedia: (mediaId: string) => void;
  addHashtag: (tag: string) => void;
  removeHashtag: (tag: string) => void;
  publishNow: () => Promise<void>;
  schedulePost: (time: Date) => void;
  getCharacterCount: (platform: SocialPlatform, content: string) => { count: number; limit: number; isOver: boolean };
}

// ============================================================================
// CONTEXT
// ============================================================================

const SocialContext = createContext<SocialContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface SocialProviderProps {
  children: React.ReactNode;
  initialData?: Partial<SocialPublishData>;
  initialPosts?: SocialPost[];
  initialConfig?: SocialConfig;
  onPublish?: (posts: SocialPost[]) => Promise<void>;
  onSchedule?: (posts: SocialPost[], time: Date) => void;
}

const defaultAccounts: SocialAccount[] = [
  { id: 'tw1', platform: 'twitter', name: 'Company Twitter', handle: '@company', isConnected: true, followers: 15200 },
  { id: 'fb1', platform: 'facebook', name: 'Company Page', handle: 'company', isConnected: true, followers: 45000 },
  { id: 'li1', platform: 'linkedin', name: 'Company LinkedIn', handle: 'company-inc', isConnected: true, followers: 8500 },
  { id: 'ig1', platform: 'instagram', name: 'Company Instagram', handle: '@company.official', isConnected: false, followers: 22000 },
];

const characterLimits: Record<SocialPlatform, number> = {
  twitter: 280,
  facebook: 63206,
  linkedin: 3000,
  instagram: 2200,
  pinterest: 500,
  threads: 500,
  mastodon: 500,
  bluesky: 300,
};

export const SocialProvider: React.FC<SocialProviderProps> = ({
  children,
  initialData,
  initialPosts = [],
  initialConfig = {},
  onPublish,
  onSchedule,
}) => {
  const [data, setData] = useState<SocialPublishData>({
    selectedAccounts: [],
    customMessages: {},
    media: [],
    hashtags: [],
    autoPost: false,
    ...initialData,
  });

  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);

  const config: SocialConfig = {
    enabledPlatforms: ['twitter', 'facebook', 'linkedin', 'instagram'],
    accounts: defaultAccounts,
    defaultHashtags: [],
    characterLimits,
    enableAutoPost: true,
    enableScheduling: true,
    maxMediaPerPlatform: {
      twitter: 4,
      facebook: 10,
      linkedin: 9,
      instagram: 10,
      pinterest: 1,
      threads: 10,
      mastodon: 4,
      bluesky: 4,
    },
    ...initialConfig,
  };

  const accounts = config.accounts || defaultAccounts;

  const updateCustomMessage = useCallback((accountId: string, message: string) => {
    setData(prev => ({
      ...prev,
      customMessages: { ...prev.customMessages, [accountId]: message },
    }));
  }, []);

  const toggleAccount = useCallback((accountId: string) => {
    setData(prev => ({
      ...prev,
      selectedAccounts: prev.selectedAccounts.includes(accountId)
        ? prev.selectedAccounts.filter(id => id !== accountId)
        : [...prev.selectedAccounts, accountId],
    }));
  }, []);

  const addMedia = useCallback((media: SocialMedia) => {
    setData(prev => ({
      ...prev,
      media: [...prev.media, media],
    }));
  }, []);

  const removeMedia = useCallback((mediaId: string) => {
    setData(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== mediaId),
    }));
  }, []);

  const addHashtag = useCallback((tag: string) => {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    setData(prev => ({
      ...prev,
      hashtags: prev.hashtags.includes(normalizedTag)
        ? prev.hashtags
        : [...prev.hashtags, normalizedTag],
    }));
  }, []);

  const removeHashtag = useCallback((tag: string) => {
    setData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag),
    }));
  }, []);

  const getCharacterCount = useCallback((platform: SocialPlatform, content: string) => {
    const limit = config.characterLimits?.[platform] || characterLimits[platform];
    const count = content.length;
    return { count, limit, isOver: count > limit };
  }, [config.characterLimits]);

  const publishNow = useCallback(async () => {
    const newPosts: SocialPost[] = data.selectedAccounts.map(accountId => {
      const account = accounts.find(a => a.id === accountId);
      if (!account) throw new Error(`Account ${accountId} not found`);

      return {
        id: `post-${Date.now()}-${accountId}`,
        platform: account.platform,
        accountId,
        content: data.customMessages[accountId] || '',
        media: data.media,
        status: 'pending' as PublishStatus,
      };
    });

    await onPublish?.(newPosts);

    setPosts(prev => [
      ...newPosts.map(p => ({ ...p, status: 'published' as PublishStatus, publishedAt: new Date() })),
      ...prev,
    ]);
  }, [data, accounts, onPublish]);

  const schedulePost = useCallback((time: Date) => {
    const newPosts: SocialPost[] = data.selectedAccounts.map(accountId => {
      const account = accounts.find(a => a.id === accountId);
      if (!account) throw new Error(`Account ${accountId} not found`);

      return {
        id: `post-${Date.now()}-${accountId}`,
        platform: account.platform,
        accountId,
        content: data.customMessages[accountId] || '',
        media: data.media,
        scheduledAt: time,
        status: 'scheduled' as PublishStatus,
      };
    });

    onSchedule?.(newPosts, time);
    setPosts(prev => [...newPosts, ...prev]);
  }, [data, accounts, onSchedule]);

  return (
    <SocialContext.Provider value={{
      data,
      setData,
      posts,
      setPosts,
      config,
      accounts,
      updateCustomMessage,
      toggleAccount,
      addMedia,
      removeMedia,
      addHashtag,
      removeHashtag,
      publishNow,
      schedulePost,
      getCharacterCount,
    }}>
      {children}
    </SocialContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSocialPublishing = (): SocialContextType => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocialPublishing must be used within a SocialProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const platformConfig: Record<SocialPlatform, { icon: string; label: string; color: string; bgColor: string }> = {
  twitter: { icon: '𝕏', label: 'X (Twitter)', color: 'text-black dark:text-white', bgColor: 'bg-black' },
  facebook: { icon: 'f', label: 'Facebook', color: 'text-blue-600', bgColor: 'bg-blue-600' },
  linkedin: { icon: 'in', label: 'LinkedIn', color: 'text-blue-700', bgColor: 'bg-blue-700' },
  instagram: { icon: '📷', label: 'Instagram', color: 'text-pink-600', bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500' },
  pinterest: { icon: 'P', label: 'Pinterest', color: 'text-red-600', bgColor: 'bg-red-600' },
  threads: { icon: '@', label: 'Threads', color: 'text-black dark:text-white', bgColor: 'bg-black' },
  mastodon: { icon: '🦣', label: 'Mastodon', color: 'text-purple-600', bgColor: 'bg-purple-600' },
  bluesky: { icon: '🦋', label: 'Bluesky', color: 'text-blue-500', bgColor: 'bg-blue-500' },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Platform Account Selector
export const AccountSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { accounts, data, toggleAccount, config } = useSocialPublishing();

  const enabledAccounts = accounts.filter(
    a => a.isConnected && config.enabledPlatforms?.includes(a.platform)
  );

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Select Accounts
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {enabledAccounts.map((account) => {
          const platform = platformConfig[account.platform];
          const isSelected = data.selectedAccounts.includes(account.id);

          return (
            <motion.button
              key={account.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAccount(account.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${platform.bgColor}`}>
                {platform.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white">{account.name}</div>
                <div className="text-sm text-gray-500">{account.handle}</div>
              </div>
              {account.followers && (
                <div className="text-sm text-gray-500">
                  {formatNumber(account.followers)}
                </div>
              )}
              {isSelected && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {enabledAccounts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">🔗</div>
          <p>No social accounts connected</p>
          <button className="mt-2 text-blue-600 hover:text-blue-700">
            Connect an account
          </button>
        </div>
      )}
    </div>
  );
};

// Message Composer
export const MessageComposer: React.FC<{
  accountId: string;
  baseContent?: string;
  className?: string;
}> = ({ accountId, baseContent = '', className = '' }) => {
  const { data, updateCustomMessage, getCharacterCount, accounts } = useSocialPublishing();

  const account = accounts.find(a => a.id === accountId);
  if (!account) return null;

  const content = data.customMessages[accountId] ?? baseContent;
  const platform = platformConfig[account.platform];
  const { count, limit, isOver } = getCharacterCount(account.platform, content);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${platform.bgColor}`}>
          {platform.icon}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => updateCustomMessage(accountId, e.target.value)}
        placeholder={`Write your ${platform.label} post...`}
        rows={4}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none border-0 focus:ring-0"
      />

      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Add emoji">
            😊
          </button>
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Add media">
            📷
          </button>
        </div>
        <span className={`text-sm ${isOver ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          {count}/{limit}
        </span>
      </div>
    </div>
  );
};

// Hashtag Manager
export const HashtagManager: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, addHashtag, removeHashtag, config } = useSocialPublishing();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      addHashtag(input.trim());
      setInput('');
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Hashtags
      </label>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add hashtag..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.hashtags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => removeHashtag(tag)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              ×
            </button>
          </span>
        ))}

        {config.defaultHashtags?.map((tag) => (
          !data.hashtags.includes(tag) && (
            <button
              key={tag}
              onClick={() => addHashtag(tag)}
              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              + {tag}
            </button>
          )
        ))}
      </div>
    </div>
  );
};

// Media Attachments
export const MediaAttachments: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, removeMedia } = useSocialPublishing();

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Media
      </label>

      {data.media.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {data.media.map((media) => (
            <div key={media.id} className="relative group">
              <img
                src={media.thumbnail || media.url}
                alt={media.altText || 'Attached media'}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                onClick={() => removeMedia(media.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
              {media.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                    ▶
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">📷</div>
          <p className="text-gray-500 text-sm">No media attached</p>
          <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
            Add media
          </button>
        </div>
      )}
    </div>
  );
};

// Schedule Picker
export const SchedulePicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, setData, schedulePost, config } = useSocialPublishing();
  const [isOpen, setIsOpen] = useState(false);

  if (!config.enableScheduling) return null;

  const presetTimes = [
    { label: 'In 1 hour', hours: 1 },
    { label: 'In 3 hours', hours: 3 },
    { label: 'Tomorrow 9 AM', hours: 24 },
    { label: 'Next week', hours: 168 },
  ];

  const handleSchedule = (hours?: number) => {
    let scheduledTime: Date;

    if (hours) {
      scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + hours);
    } else if (data.scheduledTime) {
      scheduledTime = data.scheduledTime;
    } else {
      return;
    }

    schedulePost(scheduledTime);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span>📅</span>
        Schedule Post
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {presetTimes.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSchedule(preset.hours)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Or select:</span>
              </div>

              <input
                type="datetime-local"
                value={data.scheduledTime ? data.scheduledTime.toISOString().slice(0, 16) : ''}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  scheduledTime: e.target.value ? new Date(e.target.value) : undefined,
                }))}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <button
                onClick={() => handleSchedule()}
                disabled={!data.scheduledTime}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Publish Actions
export const PublishActions: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, publishNow } = useSocialPublishing();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishNow();
    } finally {
      setIsPublishing(false);
    }
  };

  const isDisabled = data.selectedAccounts.length === 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handlePublish}
        disabled={isDisabled || isPublishing}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        {isPublishing ? (
          <>
            <span className="animate-spin">⏳</span>
            Publishing...
          </>
        ) : (
          <>
            <span>🚀</span>
            Publish to {data.selectedAccounts.length} Account{data.selectedAccounts.length !== 1 ? 's' : ''}
          </>
        )}
      </button>

      <SchedulePicker />
    </div>
  );
};

// Recent Posts
export const RecentPosts: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { posts, accounts } = useSocialPublishing();

  const recentPosts = posts.slice(0, 5);

  if (recentPosts.length === 0) return null;

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Recent Posts
      </h4>
      <div className="space-y-2">
        {recentPosts.map((post) => {
          const account = accounts.find(a => a.id === post.accountId);
          const platform = platformConfig[post.platform];

          return (
            <div
              key={post.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${platform.bgColor}`}>
                {platform.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {account?.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : post.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : post.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {post.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {post.publishedAt
                    ? formatRelativeTime(post.publishedAt)
                    : post.scheduledAt
                    ? `Scheduled for ${post.scheduledAt.toLocaleDateString()}`
                    : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SocialPublishing: React.FC<{
  initialData?: Partial<SocialPublishData>;
  initialPosts?: SocialPost[];
  initialConfig?: SocialConfig;
  baseContent?: string;
  onPublish?: (posts: SocialPost[]) => Promise<void>;
  onSchedule?: (posts: SocialPost[], time: Date) => void;
  className?: string;
}> = ({
  initialData,
  initialPosts,
  initialConfig,
  baseContent,
  onPublish,
  onSchedule,
  className = '',
}) => {
  return (
    <SocialProvider
      initialData={initialData}
      initialPosts={initialPosts}
      initialConfig={initialConfig}
      onPublish={onPublish}
      onSchedule={onSchedule}
    >
      <SocialPublishingContent baseContent={baseContent} className={className} />
    </SocialProvider>
  );
};

const SocialPublishingContent: React.FC<{ baseContent?: string; className?: string }> = ({
  baseContent,
  className = '',
}) => {
  const { data } = useSocialPublishing();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">📢</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Social Publishing
            </h3>
            <p className="text-sm text-gray-500">
              Share to your social media accounts
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <AccountSelector />

        {data.selectedAccounts.length > 0 && (
          <>
            <div className="space-y-4">
              {data.selectedAccounts.map((accountId) => (
                <MessageComposer
                  key={accountId}
                  accountId={accountId}
                  baseContent={baseContent}
                />
              ))}
            </div>

            <HashtagManager />
            <MediaAttachments />
          </>
        )}
      </div>

      {/* Actions */}
      {data.selectedAccounts.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <PublishActions />
        </div>
      )}

      {/* Recent Posts */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <RecentPosts />
      </div>
    </div>
  );
};

export default SocialPublishing;
