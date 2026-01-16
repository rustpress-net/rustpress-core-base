/**
 * User/Profile Components
 * User cards, profiles, author boxes, and user-related elements
 */

import React from 'react';
import {
  Mail, Phone, MapPin, Calendar, Link as LinkIcon, Twitter, Linkedin, Github,
  MoreHorizontal, Edit, Settings, LogOut, Shield, Award, Star, Clock,
  Check, X, MessageSquare, Users, FileText, Heart, Bookmark,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. USER CARD
// ============================================

export interface UserCardProps {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  variant?: 'default' | 'compact' | 'horizontal';
  actions?: React.ReactNode;
  onClick?: () => void;
}

export function UserCard({
  name,
  email,
  avatar,
  role,
  status,
  variant = 'default',
  actions,
  onClick,
}: UserCardProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  if (variant === 'compact') {
    return (
      <div
        className={clsx('flex items-center gap-3 p-2 rounded-lg', onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700')}
        onClick={onClick}
      >
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
              {name.charAt(0)}
            </div>
          )}
          {status && (
            <span className={clsx('absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-800', statusColors[status])} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
          {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
        </div>
        {actions}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-medium">
              {name.charAt(0)}
            </div>
          )}
          {status && (
            <span className={clsx('absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800', statusColors[status])} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          {role && <p className="text-sm text-gray-500">{role}</p>}
          {email && <p className="text-sm text-gray-400">{email}</p>}
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
      <div className="relative inline-block">
        {avatar ? (
          <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-medium mx-auto">
            {name.charAt(0)}
          </div>
        )}
        {status && (
          <span className={clsx('absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800', statusColors[status])} />
        )}
      </div>
      <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{name}</h3>
      {role && <p className="text-sm text-gray-500">{role}</p>}
      {email && <p className="text-sm text-gray-400 mt-1">{email}</p>}
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}

// ============================================
// 2. AUTHOR BOX
// ============================================

export interface AuthorBoxProps {
  name: string;
  bio?: string;
  avatar?: string;
  role?: string;
  socialLinks?: Array<{ platform: 'twitter' | 'linkedin' | 'github' | 'website'; url: string }>;
  stats?: { posts?: number; followers?: number };
  variant?: 'default' | 'compact' | 'featured';
}

export function AuthorBox({
  name,
  bio,
  avatar,
  role,
  socialLinks,
  stats,
  variant = 'default',
}: AuthorBoxProps) {
  const socialIcons = {
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    github: <Github className="w-4 h-4" />,
    website: <LinkIcon className="w-4 h-4" />,
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {avatar ? (
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-medium">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
          {role && <p className="text-sm text-gray-500">{role}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
        <div className="flex items-start gap-4">
          {avatar ? (
            <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-medium">
              {name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{name}</h3>
            {role && <p className="text-white/80">{role}</p>}
          </div>
        </div>
        {bio && <p className="mt-4 text-white/90">{bio}</p>}
        {stats && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
            {stats.posts !== undefined && (
              <div>
                <p className="text-xl font-bold">{stats.posts}</p>
                <p className="text-sm text-white/70">Posts</p>
              </div>
            )}
            {stats.followers !== undefined && (
              <div>
                <p className="text-xl font-bold">{stats.followers}</p>
                <p className="text-sm text-white/70">Followers</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {avatar ? (
          <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-medium">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          {role && <p className="text-gray-500">{role}</p>}
          {socialLinks && (
            <div className="flex gap-2 mt-2">
              {socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {socialIcons[link.platform]}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      {bio && <p className="mt-4 text-gray-600 dark:text-gray-400">{bio}</p>}
    </div>
  );
}

// ============================================
// 3. PROFILE HEADER
// ============================================

export interface ProfileHeaderProps {
  name: string;
  username?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  verified?: boolean;
  stats?: Array<{ label: string; value: number }>;
  actions?: React.ReactNode;
}

export function ProfileHeader({
  name,
  username,
  avatar,
  coverImage,
  bio,
  verified,
  stats,
  actions,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        {coverImage && <img src={coverImage} alt="" className="w-full h-full object-cover" />}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex items-end -mt-12 mb-4">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-gray-800">
                {name.charAt(0)}
              </div>
            )}
            {verified && (
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1" />
          {actions}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h1>
            {verified && <Shield className="w-5 h-5 text-blue-500" />}
          </div>
          {username && <p className="text-gray-500">@{username}</p>}
          {bio && <p className="mt-2 text-gray-600 dark:text-gray-400">{bio}</p>}
        </div>

        {stats && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 4. USER LIST ITEM
// ============================================

export interface UserListItemProps {
  name: string;
  avatar?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function UserListItem({
  name,
  avatar,
  subtitle,
  badge,
  meta,
  actions,
  selected,
  onClick,
}: UserListItemProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
          {name.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white truncate">{name}</p>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
      </div>
      {meta && <div className="text-sm text-gray-500">{meta}</div>}
      {actions}
    </div>
  );
}

// ============================================
// 5. TEAM MEMBER CARD
// ============================================

export interface TeamMemberCardProps {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  phone?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  variant?: 'default' | 'minimal';
}

export function TeamMemberCard({
  name,
  role,
  avatar,
  email,
  phone,
  socialLinks,
  variant = 'default',
}: TeamMemberCardProps) {
  if (variant === 'minimal') {
    return (
      <div className="text-center">
        {avatar ? (
          <img src={avatar} alt={name} className="w-24 h-24 rounded-full object-cover mx-auto" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-medium mx-auto">
            {name.charAt(0)}
          </div>
        )}
        <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{name}</h3>
        <p className="text-gray-500">{role}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
      {avatar ? (
        <img src={avatar} alt={name} className="w-24 h-24 rounded-full object-cover mx-auto" />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-medium mx-auto">
          {name.charAt(0)}
        </div>
      )}
      <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{name}</h3>
      <p className="text-gray-500">{role}</p>
      {(email || phone) && (
        <div className="mt-4 space-y-2">
          {email && (
            <a href={`mailto:${email}`} className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">
              <Mail className="w-4 h-4" />
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">
              <Phone className="w-4 h-4" />
              {phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 6. USER BADGE
// ============================================

export interface UserBadgeProps {
  type: 'admin' | 'moderator' | 'verified' | 'premium' | 'new' | 'contributor';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function UserBadge({ type, size = 'sm', showLabel = true }: UserBadgeProps) {
  const badges = {
    admin: { icon: <Shield />, label: 'Admin', color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    moderator: { icon: <Shield />, label: 'Mod', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    verified: { icon: <Check />, label: 'Verified', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    premium: { icon: <Star />, label: 'Premium', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' },
    new: { icon: <Clock />, label: 'New', color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    contributor: { icon: <Award />, label: 'Contributor', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
  };

  const badge = badges[type];
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium',
        badge.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      <span className={iconSize}>{badge.icon}</span>
      {showLabel && badge.label}
    </span>
  );
}

// ============================================
// 7. ACTIVITY ITEM
// ============================================

export interface ActivityItemProps {
  user: { name: string; avatar?: string };
  action: string;
  target?: string;
  time: string;
  icon?: React.ReactNode;
  type?: 'default' | 'success' | 'warning' | 'error';
}

export function ActivityItem({
  user,
  action,
  target,
  time,
  icon,
  type = 'default',
}: ActivityItemProps) {
  const typeColors = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  };

  return (
    <div className="flex gap-3">
      <div className="relative">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
            {user.name.charAt(0)}
          </div>
        )}
        {icon && (
          <div className={clsx('absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center', typeColors[type])}>
            <span className="w-3 h-3">{icon}</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
          {' '}<span className="text-gray-600 dark:text-gray-400">{action}</span>
          {target && <span className="font-medium text-gray-900 dark:text-white"> {target}</span>}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// ============================================
// 8. CONTACT CARD
// ============================================

export interface ContactCardProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  company?: string;
  actions?: React.ReactNode;
}

export function ContactCard({
  name,
  email,
  phone,
  address,
  avatar,
  company,
  actions,
}: ContactCardProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {avatar ? (
          <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-medium">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          {company && <p className="text-sm text-gray-500">{company}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-4 space-y-2">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">
            <Mail className="w-4 h-4" />
            {email}
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">
            <Phone className="w-4 h-4" />
            {phone}
          </a>
        )}
        {address && (
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            {address}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// 9. USER MENU
// ============================================

export interface UserMenuProps {
  user: { name: string; email?: string; avatar?: string };
  items: Array<{
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
    divider?: boolean;
    danger?: boolean;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

export function UserMenu({ user, items, isOpen, onClose }: UserMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2">
        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
              {user.email && <p className="text-sm text-gray-500 truncate">{user.email}</p>}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          {items.map((item, idx) =>
            item.divider ? (
              <div key={idx} className="my-1 border-t border-gray-200 dark:border-gray-700" />
            ) : (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  onClose();
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                  item.danger
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// 10. ONLINE USERS LIST
// ============================================

export interface OnlineUsersListProps {
  users: Array<{ name: string; avatar?: string; status: 'online' | 'away' | 'busy' }>;
  maxDisplay?: number;
  title?: string;
}

export function OnlineUsersList({ users, maxDisplay = 5, title = 'Online Now' }: OnlineUsersListProps) {
  const displayed = users.slice(0, maxDisplay);
  const remaining = users.length - maxDisplay;

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
        <span className="text-xs text-gray-500">{users.length} online</span>
      </div>
      <div className="space-y-2">
        {displayed.map((user, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className={clsx('absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-800', statusColors[user.status])} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.name}</span>
          </div>
        ))}
        {remaining > 0 && (
          <p className="text-xs text-gray-500 pt-1">+{remaining} more online</p>
        )}
      </div>
    </div>
  );
}
