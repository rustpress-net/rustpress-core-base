/**
 * Social Components
 * Social sharing, follow buttons, and social media elements
 */

import React, { useState } from 'react';
import {
  Facebook, Twitter, Linkedin, Instagram, Youtube, Github, MessageCircle,
  Send, Heart, MessageSquare, Share2, Bookmark, Link, Copy, Mail, Check,
  ThumbsUp, ThumbsDown, Eye, Users, AtSign, Hash,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. SOCIAL SHARE BUTTONS
// ============================================

export interface SocialShareButtonsProps {
  url: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'rounded' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  platforms?: Array<'facebook' | 'twitter' | 'linkedin' | 'email' | 'copy'>;
}

export function SocialShareButtons({
  url,
  title = '',
  description = '',
  variant = 'default',
  size = 'md',
  showLabels = false,
  platforms = ['facebook', 'twitter', 'linkedin', 'email', 'copy'],
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };

  const icons = {
    facebook: <Facebook className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />,
    copy: copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />,
  };

  const colors = {
    facebook: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
    twitter: 'bg-[#1DA1F2] hover:bg-[#1A91DA] text-white',
    linkedin: 'bg-[#0A66C2] hover:bg-[#095196] text-white',
    email: 'bg-gray-600 hover:bg-gray-700 text-white',
    copy: copied ? 'bg-green-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white',
  };

  const outlineColors = {
    facebook: 'border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white',
    twitter: 'border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white',
    linkedin: 'border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white',
    email: 'border-gray-400 text-gray-600 hover:bg-gray-600 hover:text-white',
    copy: copied ? 'border-green-500 text-green-600' : 'border-gray-400 text-gray-600 hover:bg-gray-600 hover:text-white',
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const getButtonClass = (platform: string) => {
    if (variant === 'outline') {
      return clsx('border-2', outlineColors[platform as keyof typeof outlineColors]);
    }
    if (variant === 'minimal') {
      return 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
    }
    return colors[platform as keyof typeof colors];
  };

  return (
    <div className="flex items-center gap-2">
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className={clsx(
            'flex items-center gap-2 transition-colors',
            sizes[size],
            variant === 'rounded' ? 'rounded-full' : 'rounded-lg',
            getButtonClass(platform)
          )}
        >
          {icons[platform]}
          {showLabels && (
            <span className="text-sm capitalize">
              {platform === 'copy' ? (copied ? 'Copied!' : 'Copy') : platform}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// 2. FOLLOW BUTTON
// ============================================

export interface FollowButtonProps {
  isFollowing: boolean;
  onChange: (following: boolean) => void;
  followerCount?: number;
  variant?: 'default' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function FollowButton({
  isFollowing,
  onChange,
  followerCount,
  variant = 'default',
  size = 'md',
  showCount = false,
}: FollowButtonProps) {
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const getButtonClass = () => {
    if (variant === 'outline') {
      return isFollowing
        ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-500'
        : 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white';
    }
    if (variant === 'minimal') {
      return isFollowing
        ? 'text-gray-600 dark:text-gray-400 hover:text-red-500'
        : 'text-blue-500 hover:text-blue-600';
    }
    return isFollowing
      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600'
      : 'bg-blue-500 text-white hover:bg-blue-600';
  };

  return (
    <button
      onClick={() => onChange(!isFollowing)}
      className={clsx(
        'font-medium rounded-lg transition-colors',
        sizes[size],
        getButtonClass()
      )}
    >
      {isFollowing ? 'Following' : 'Follow'}
      {showCount && followerCount !== undefined && (
        <span className="ml-2 opacity-70">{followerCount.toLocaleString()}</span>
      )}
    </button>
  );
}

// ============================================
// 3. SOCIAL LINKS
// ============================================

export interface SocialLinksProps {
  links: Array<{
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'website';
    url: string;
  }>;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function SocialLinks({ links, variant = 'default', size = 'md' }: SocialLinksProps) {
  const icons = {
    facebook: <Facebook />,
    twitter: <Twitter />,
    instagram: <Instagram />,
    linkedin: <Linkedin />,
    youtube: <Youtube />,
    github: <Github />,
    website: <Link />,
  };

  const colors = {
    facebook: 'hover:text-[#1877F2]',
    twitter: 'hover:text-[#1DA1F2]',
    instagram: 'hover:text-[#E4405F]',
    linkedin: 'hover:text-[#0A66C2]',
    youtube: 'hover:text-[#FF0000]',
    github: 'hover:text-gray-900 dark:hover:text-white',
    website: 'hover:text-blue-500',
  };

  const filledColors = {
    facebook: 'bg-[#1877F2] text-white',
    twitter: 'bg-[#1DA1F2] text-white',
    instagram: 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F56040] text-white',
    linkedin: 'bg-[#0A66C2] text-white',
    youtube: 'bg-[#FF0000] text-white',
    github: 'bg-gray-900 text-white',
    website: 'bg-blue-500 text-white',
  };

  const sizes = {
    sm: { icon: 'w-4 h-4', button: 'p-1.5' },
    md: { icon: 'w-5 h-5', button: 'p-2' },
    lg: { icon: 'w-6 h-6', button: 'p-2.5' },
  };

  return (
    <div className="flex items-center gap-2">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'rounded-full transition-colors',
            sizes[size].button,
            variant === 'filled'
              ? filledColors[link.platform]
              : variant === 'outline'
              ? 'border border-gray-300 dark:border-gray-600 text-gray-500 hover:border-current'
              : 'text-gray-400',
            variant !== 'filled' && colors[link.platform]
          )}
        >
          <span className={sizes[size].icon}>{icons[link.platform]}</span>
        </a>
      ))}
    </div>
  );
}

// ============================================
// 4. LIKE / REACTION BUTTONS
// ============================================

export interface ReactionButtonsProps {
  likes: number;
  dislikes?: number;
  userReaction?: 'like' | 'dislike' | null;
  onReact: (reaction: 'like' | 'dislike' | null) => void;
  variant?: 'default' | 'minimal' | 'youtube';
}

export function ReactionButtons({
  likes,
  dislikes = 0,
  userReaction,
  onReact,
  variant = 'default',
}: ReactionButtonsProps) {
  const handleReact = (reaction: 'like' | 'dislike') => {
    if (userReaction === reaction) {
      onReact(null);
    } else {
      onReact(reaction);
    }
  };

  if (variant === 'youtube') {
    return (
      <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800">
        <button
          onClick={() => handleReact('like')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-l-full border-r border-gray-200 dark:border-gray-700',
            userReaction === 'like' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          <ThumbsUp className={clsx('w-5 h-5', userReaction === 'like' && 'fill-current')} />
          <span>{likes.toLocaleString()}</span>
        </button>
        <button
          onClick={() => handleReact('dislike')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-r-full',
            userReaction === 'dislike' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          <ThumbsDown className={clsx('w-5 h-5', userReaction === 'dislike' && 'fill-current')} />
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleReact('like')}
          className={clsx(
            'flex items-center gap-1',
            userReaction === 'like' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
          )}
        >
          <ThumbsUp className={clsx('w-4 h-4', userReaction === 'like' && 'fill-current')} />
          <span className="text-sm">{likes}</span>
        </button>
        <button
          onClick={() => handleReact('dislike')}
          className={clsx(
            'flex items-center gap-1',
            userReaction === 'dislike' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
          )}
        >
          <ThumbsDown className={clsx('w-4 h-4', userReaction === 'dislike' && 'fill-current')} />
          <span className="text-sm">{dislikes}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleReact('like')}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
          userReaction === 'like'
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600'
        )}
      >
        <ThumbsUp className={clsx('w-4 h-4', userReaction === 'like' && 'fill-current')} />
        <span className="text-sm">{likes}</span>
      </button>
      <button
        onClick={() => handleReact('dislike')}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
          userReaction === 'dislike'
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-600'
        )}
      >
        <ThumbsDown className={clsx('w-4 h-4', userReaction === 'dislike' && 'fill-current')} />
        <span className="text-sm">{dislikes}</span>
      </button>
    </div>
  );
}

// ============================================
// 5. COMMENT INPUT
// ============================================

export interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  avatar?: string;
  loading?: boolean;
}

export function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Write a comment...',
  avatar,
  loading,
}: CommentInputProps) {
  return (
    <div className="flex gap-3">
      {avatar && (
        <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
      )}
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// 6. COMMENT ITEM
// ============================================

export interface CommentItemProps {
  author: { name: string; avatar?: string };
  content: string;
  date: string;
  likes?: number;
  liked?: boolean;
  onLike?: () => void;
  onReply?: () => void;
  replies?: React.ReactNode;
}

export function CommentItem({
  author,
  content,
  date,
  likes = 0,
  liked = false,
  onLike,
  onReply,
  replies,
}: CommentItemProps) {
  return (
    <div className="flex gap-3">
      {author.avatar ? (
        <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
          {author.name.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white">{author.name}</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          <button
            onClick={onLike}
            className={clsx(
              'flex items-center gap-1 text-xs',
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            )}
          >
            <Heart className={clsx('w-3.5 h-3.5', liked && 'fill-current')} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reply
          </button>
        </div>
        {replies && <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">{replies}</div>}
      </div>
    </div>
  );
}

// ============================================
// 7. SHARE MODAL
// ============================================

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function ShareModal({ isOpen, onClose, url, title = 'Share' }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>

        <div className="flex justify-center gap-4 mb-6">
          <SocialShareButtons url={url} platforms={['facebook', 'twitter', 'linkedin', 'email']} />
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 focus:outline-none"
          />
          <button
            onClick={copyLink}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              copied
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
      </div>
    </div>
  );
}

// ============================================
// 8. SOCIAL STATS
// ============================================

export interface SocialStatsProps {
  stats: Array<{
    label: string;
    value: number;
    icon?: React.ReactNode;
  }>;
  variant?: 'default' | 'compact' | 'cards';
}

export function SocialStats({ stats, variant = 'default' }: SocialStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
            {stat.icon && <div className="text-blue-500 mb-2 flex justify-center">{stat.icon}</div>}
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stat.value)}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            {stat.icon}
            <span className="font-medium">{formatNumber(stat.value)}</span>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700">
      {stats.map((stat, idx) => (
        <div key={idx} className="px-4 first:pl-0 last:pr-0 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stat.value)}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 9. HASHTAG
// ============================================

export interface HashtagProps {
  tag: string;
  href?: string;
  count?: number;
  trending?: boolean;
  onClick?: () => void;
}

export function Hashtag({ tag, href, count, trending, onClick }: HashtagProps) {
  const content = (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <Hash className="w-4 h-4" />
      <span className="font-medium">{tag}</span>
      {count !== undefined && <span className="text-gray-500 text-sm">({count})</span>}
      {trending && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-1.5 py-0.5 rounded">🔥</span>}
    </span>
  );

  return href ? <a href={href}>{content}</a> : content;
}

// ============================================
// 10. MENTION
// ============================================

export interface MentionProps {
  username: string;
  href?: string;
  avatar?: string;
  onClick?: () => void;
}

export function Mention({ username, href, avatar, onClick }: MentionProps) {
  const content = (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {avatar && <img src={avatar} alt="" className="w-4 h-4 rounded-full" />}
      <AtSign className="w-3.5 h-3.5" />
      {username}
    </span>
  );

  return href ? <a href={href}>{content}</a> : content;
}

// ============================================
// 11. ENGAGEMENT BAR
// ============================================

export interface EngagementBarProps {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export function EngagementBar({
  likes,
  comments,
  shares,
  views,
  isLiked,
  isBookmarked,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: EngagementBarProps) {
  return (
    <div className="flex items-center justify-between py-3 border-t border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-6">
        <button
          onClick={onLike}
          className={clsx(
            'flex items-center gap-2 transition-colors',
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          )}
        >
          <Heart className={clsx('w-5 h-5', isLiked && 'fill-current')} />
          <span className="text-sm">{likes}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">{comments}</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm">{shares}</span>
        </button>
        {views !== undefined && (
          <span className="flex items-center gap-2 text-gray-500">
            <Eye className="w-5 h-5" />
            <span className="text-sm">{views}</span>
          </span>
        )}
      </div>
      <button
        onClick={onBookmark}
        className={clsx(
          'transition-colors',
          isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
        )}
      >
        <Bookmark className={clsx('w-5 h-5', isBookmarked && 'fill-current')} />
      </button>
    </div>
  );
}

// ============================================
// 12. FOLLOWER/FOLLOWING COUNT
// ============================================

export interface FollowerCountProps {
  followers: number;
  following: number;
  posts?: number;
  variant?: 'default' | 'compact';
}

export function FollowerCount({ followers, following, posts, variant = 'default' }: FollowerCountProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span><strong>{formatNumber(followers)}</strong> followers</span>
        <span><strong>{formatNumber(following)}</strong> following</span>
        {posts !== undefined && <span><strong>{formatNumber(posts)}</strong> posts</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <button className="text-center hover:opacity-80">
        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(followers)}</p>
        <p className="text-sm text-gray-500">Followers</p>
      </button>
      <button className="text-center hover:opacity-80">
        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(following)}</p>
        <p className="text-sm text-gray-500">Following</p>
      </button>
      {posts !== undefined && (
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(posts)}</p>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
      )}
    </div>
  );
}
