/**
 * AvatarStack Component
 *
 * Enterprise-grade avatar stacking and grouping:
 * - Overlapping avatar stacks
 * - Expandable stacks with tooltips
 * - Avatar lists with details
 * - Online status indicators
 * - Add/invite buttons
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreHorizontal,
  Check,
  X,
  User,
  Mail,
  UserPlus,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type AvatarStackSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStackDirection = 'left' | 'right';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'invisible';

export interface StackAvatar {
  id: string;
  name: string;
  src?: string;
  email?: string;
  status?: AvatarStatus;
  role?: string;
  initials?: string;
  color?: string;
}

export interface AvatarStackProps {
  avatars: StackAvatar[];
  max?: number;
  size?: AvatarStackSize;
  direction?: AvatarStackDirection;
  spacing?: 'tight' | 'normal' | 'loose';
  showTooltip?: boolean;
  showStatus?: boolean;
  expandOnHover?: boolean;
  expandable?: boolean;
  onAvatarClick?: (avatar: StackAvatar) => void;
  onMoreClick?: () => void;
  onAddClick?: () => void;
  showAddButton?: boolean;
  className?: string;
}

export interface AvatarListProps {
  avatars: StackAvatar[];
  size?: AvatarStackSize;
  showStatus?: boolean;
  showRole?: boolean;
  showEmail?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onDeselect?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export interface AvatarSelectProps {
  avatars: StackAvatar[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  searchable?: boolean;
  placeholder?: string;
  size?: AvatarStackSize;
  className?: string;
}

export interface PresenceIndicatorProps {
  users: StackAvatar[];
  max?: number;
  size?: AvatarStackSize;
  showNames?: boolean;
  label?: string;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const sizeConfig: Record<AvatarStackSize, {
  avatar: string;
  text: string;
  status: string;
  overlap: string;
  ring: string;
}> = {
  xs: { avatar: 'w-6 h-6', text: 'text-xs', status: 'w-2 h-2', overlap: '-ml-2', ring: 'ring-1' },
  sm: { avatar: 'w-8 h-8', text: 'text-xs', status: 'w-2.5 h-2.5', overlap: '-ml-2', ring: 'ring-2' },
  md: { avatar: 'w-10 h-10', text: 'text-sm', status: 'w-3 h-3', overlap: '-ml-3', ring: 'ring-2' },
  lg: { avatar: 'w-12 h-12', text: 'text-base', status: 'w-3.5 h-3.5', overlap: '-ml-3', ring: 'ring-2' },
  xl: { avatar: 'w-14 h-14', text: 'text-lg', status: 'w-4 h-4', overlap: '-ml-4', ring: 'ring-2' },
};

const spacingConfig = {
  tight: { xs: '-ml-3', sm: '-ml-3', md: '-ml-4', lg: '-ml-5', xl: '-ml-6' },
  normal: { xs: '-ml-2', sm: '-ml-2', md: '-ml-3', lg: '-ml-3', xl: '-ml-4' },
  loose: { xs: '-ml-1', sm: '-ml-1', md: '-ml-2', lg: '-ml-2', xl: '-ml-3' },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-neutral-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  invisible: 'bg-neutral-400 ring-2 ring-white dark:ring-neutral-900',
};

// ============================================================================
// Single Avatar Component
// ============================================================================

interface SingleAvatarProps {
  avatar: StackAvatar;
  size: AvatarStackSize;
  showStatus?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

function SingleAvatar({
  avatar,
  size,
  showStatus = false,
  showTooltip = false,
  onClick,
  className,
}: SingleAvatarProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);
  const config = sizeConfig[size];

  const getInitials = () => {
    if (avatar.initials) return avatar.initials;
    return avatar.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = () => {
    if (avatar.color) return avatar.color;
    // Generate consistent color from name
    const colors = [
      'bg-primary-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500',
    ];
    const index = avatar.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative" onMouseEnter={() => setShowTooltipState(true)} onMouseLeave={() => setShowTooltipState(false)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center',
          config.avatar,
          config.ring,
          'ring-white dark:ring-neutral-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
          !onClick && 'cursor-default',
          className
        )}
      >
        {avatar.src ? (
          <img
            src={avatar.src}
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center text-white font-medium',
              config.text,
              avatar.color ? '' : getBackgroundColor()
            )}
            style={avatar.color ? { backgroundColor: avatar.color } : undefined}
          >
            {getInitials()}
          </div>
        )}
      </button>

      {/* Status indicator */}
      {showStatus && avatar.status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-neutral-900',
            config.status,
            statusColors[avatar.status]
          )}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && showTooltipState && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={cn(
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1',
              'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900',
              'text-xs font-medium rounded shadow-lg whitespace-nowrap z-50'
            )}
          >
            {avatar.name}
            {avatar.status && (
              <span className="ml-1 opacity-70">
                ({avatar.status})
              </span>
            )}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Avatar Stack Component
// ============================================================================

export function AvatarStack({
  avatars,
  max = 5,
  size = 'md',
  direction = 'right',
  spacing = 'normal',
  showTooltip = true,
  showStatus = false,
  expandOnHover = false,
  expandable = false,
  onAvatarClick,
  onMoreClick,
  onAddClick,
  showAddButton = false,
  className,
}: AvatarStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = sizeConfig[size];

  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;
  const hasMore = remainingCount > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOverlap = () => {
    if (expandOnHover && isExpanded) return 'ml-1';
    return spacingConfig[spacing][size];
  };

  return (
    <div
      className={cn('inline-flex items-center', className)}
      onMouseEnter={() => expandOnHover && setIsExpanded(true)}
      onMouseLeave={() => expandOnHover && setIsExpanded(false)}
    >
      <div
        className={cn(
          'flex items-center',
          direction === 'left' && 'flex-row-reverse'
        )}
      >
        {displayAvatars.map((avatar, index) => (
          <motion.div
            key={avatar.id}
            className={cn(index !== 0 && getOverlap())}
            style={{ zIndex: direction === 'right' ? displayAvatars.length - index : index }}
            animate={{
              marginLeft: expandOnHover && isExpanded && index !== 0 ? 4 : undefined,
            }}
            transition={{ duration: 0.2 }}
          >
            <SingleAvatar
              avatar={avatar}
              size={size}
              showStatus={showStatus}
              showTooltip={showTooltip}
              onClick={onAvatarClick ? () => onAvatarClick(avatar) : undefined}
            />
          </motion.div>
        ))}

        {/* More indicator */}
        {hasMore && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (expandable) {
                  setShowDropdown(!showDropdown);
                } else {
                  onMoreClick?.();
                }
              }}
              className={cn(
                'flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800',
                'text-neutral-600 dark:text-neutral-400 font-medium',
                config.avatar,
                config.text,
                config.ring,
                'ring-white dark:ring-neutral-900',
                getOverlap(),
                'hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
              style={{ zIndex: 0 }}
            >
              +{remainingCount}
            </button>

            {/* Expandable dropdown */}
            <AnimatePresence>
              {expandable && showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    'absolute top-full right-0 mt-2 py-2 min-w-[200px]',
                    'bg-white dark:bg-neutral-900 rounded-lg shadow-lg',
                    'border border-neutral-200 dark:border-neutral-700 z-50'
                  )}
                >
                  {avatars.slice(max).map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        onAvatarClick?.(avatar);
                        setShowDropdown(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2',
                        'hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors'
                      )}
                    >
                      <SingleAvatar avatar={avatar} size="sm" showStatus={showStatus} />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {avatar.name}
                        </div>
                        {avatar.role && (
                          <div className="text-xs text-neutral-500">{avatar.role}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Add button */}
        {showAddButton && (
          <button
            type="button"
            onClick={onAddClick}
            className={cn(
              'flex items-center justify-center rounded-full border-2 border-dashed',
              'border-neutral-300 dark:border-neutral-600 text-neutral-400',
              'hover:border-primary-500 hover:text-primary-500 transition-colors',
              config.avatar,
              hasMore || displayAvatars.length > 0 ? getOverlap() : '',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
            style={{ zIndex: 0 }}
          >
            <Plus className={cn(size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Avatar List Component
// ============================================================================

export function AvatarList({
  avatars,
  size = 'md',
  showStatus = true,
  showRole = true,
  showEmail = false,
  selectable = false,
  selectedIds = [],
  onSelect,
  onDeselect,
  onRemove,
  className,
}: AvatarListProps) {
  const config = sizeConfig[size];

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onDeselect?.(id);
    } else {
      onSelect?.(id);
    }
  };

  return (
    <div className={cn('flex flex-col divide-y divide-neutral-200 dark:divide-neutral-700', className)}>
      {avatars.map((avatar) => {
        const isSelected = selectedIds.includes(avatar.id);

        return (
          <div
            key={avatar.id}
            className={cn(
              'flex items-center gap-3 py-3 px-2',
              selectable && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg -mx-2',
              isSelected && 'bg-primary-50 dark:bg-primary-900/20'
            )}
            onClick={selectable ? () => handleToggle(avatar.id) : undefined}
          >
            {selectable && (
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-neutral-300 dark:border-neutral-600'
                )}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            )}

            <SingleAvatar avatar={avatar} size={size} showStatus={showStatus} />

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {avatar.name}
              </div>
              {showRole && avatar.role && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {avatar.role}
                </div>
              )}
              {showEmail && avatar.email && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {avatar.email}
                </div>
              )}
            </div>

            {avatar.status && showStatus && (
              <span
                className={cn(
                  'text-xs capitalize px-2 py-0.5 rounded-full',
                  avatar.status === 'online' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  avatar.status === 'away' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                  avatar.status === 'busy' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  avatar.status === 'offline' && 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                )}
              >
                {avatar.status}
              </span>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(avatar.id);
                }}
                className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Avatar Select Component
// ============================================================================

export function AvatarSelect({
  avatars,
  selectedIds,
  onChange,
  max,
  searchable = true,
  placeholder = 'Search people...',
  size = 'md',
  className,
}: AvatarSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredAvatars = avatars.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAvatars = avatars.filter((a) => selectedIds.includes(a.id));
  const canSelectMore = !max || selectedIds.length < max;

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else if (canSelectMore) {
      onChange([...selectedIds, id]);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Selected avatars */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 p-2 rounded-lg border cursor-text',
          'bg-white dark:bg-neutral-900',
          'border-neutral-300 dark:border-neutral-700',
          isOpen && 'border-primary-500 ring-2 ring-primary-500/20'
        )}
        onClick={() => setIsOpen(true)}
      >
        {selectedAvatars.map((avatar) => (
          <div
            key={avatar.id}
            className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full"
          >
            <SingleAvatar avatar={avatar} size="xs" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{avatar.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(avatar.id);
              }}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {searchable && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedAvatars.length === 0 ? placeholder : ''}
            className={cn(
              'flex-1 min-w-[100px] bg-transparent outline-none text-sm',
              'text-neutral-900 dark:text-white placeholder-neutral-400'
            )}
          />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-1 py-1',
              'bg-white dark:bg-neutral-900 rounded-lg shadow-lg',
              'border border-neutral-200 dark:border-neutral-700 z-50',
              'max-h-60 overflow-auto'
            )}
          >
            {filteredAvatars.length === 0 ? (
              <div className="px-3 py-4 text-sm text-neutral-500 text-center">
                No results found
              </div>
            ) : (
              filteredAvatars.map((avatar) => {
                const isSelected = selectedIds.includes(avatar.id);
                const isDisabled = !isSelected && !canSelectMore;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => !isDisabled && handleToggle(avatar.id)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left',
                      'hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors',
                      isSelected && 'bg-primary-50 dark:bg-primary-900/20',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <SingleAvatar avatar={avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {avatar.name}
                      </div>
                      {avatar.email && (
                        <div className="text-xs text-neutral-500 truncate">{avatar.email}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Presence Indicator Component
// ============================================================================

export function PresenceIndicator({
  users,
  max = 3,
  size = 'sm',
  showNames = true,
  label = 'Online',
  className,
}: PresenceIndicatorProps) {
  const onlineUsers = users.filter((u) => u.status === 'online');
  const displayUsers = onlineUsers.slice(0, max);
  const remainingCount = onlineUsers.length - max;

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>

      <AvatarStack
        avatars={displayUsers}
        max={max}
        size={size}
        spacing="tight"
        showStatus={false}
      />

      {showNames && (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {displayUsers.map((u) => u.name.split(' ')[0]).join(', ')}
          {remainingCount > 0 && ` +${remainingCount}`}
          {label && ` ${label.toLowerCase()}`}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Avatar Invite Component
// ============================================================================

export interface AvatarInviteProps {
  onInvite: (email: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export function AvatarInvite({
  onInvite,
  placeholder = 'Enter email address',
  buttonText = 'Invite',
  className,
}: AvatarInviteProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim());
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-3 py-2 rounded-lg border',
            'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700',
            'text-sm text-neutral-900 dark:text-white',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          )}
        />
      </div>
      <button
        type="submit"
        disabled={!email.trim()}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          'bg-primary-600 text-white hover:bg-primary-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {buttonText}
      </button>
    </form>
  );
}

export default AvatarStack;
