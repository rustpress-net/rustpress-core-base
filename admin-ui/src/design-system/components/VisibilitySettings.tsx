import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type VisibilityLevel = 'public' | 'private' | 'password' | 'members' | 'roles' | 'scheduled';
export type AudienceType = 'everyone' | 'logged_in' | 'subscribers' | 'members' | 'specific_roles';

export interface VisibilityData {
  level: VisibilityLevel;
  password?: string;
  allowedRoles?: string[];
  allowedUsers?: VisibilityUser[];
  membershipLevel?: string;
  scheduledVisibility?: ScheduledVisibility;
  searchEngineVisibility: boolean;
  showInFeeds: boolean;
  showInArchives: boolean;
  allowComments: boolean;
  allowSharing: boolean;
}

export interface ScheduledVisibility {
  makePublicAt?: Date;
  makePrivateAt?: Date;
  timezone: string;
}

export interface VisibilityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface VisibilityRole {
  id: string;
  name: string;
  description?: string;
  userCount?: number;
}

export interface MembershipLevel {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export interface VisibilityConfig {
  allowPassword?: boolean;
  allowMembership?: boolean;
  allowRoleBased?: boolean;
  allowScheduledVisibility?: boolean;
  availableRoles?: VisibilityRole[];
  membershipLevels?: MembershipLevel[];
  defaultVisibility?: VisibilityLevel;
  showSEOSettings?: boolean;
  showSocialSettings?: boolean;
}

interface VisibilityContextType {
  data: VisibilityData;
  setData: React.Dispatch<React.SetStateAction<VisibilityData>>;
  config: VisibilityConfig;
  updateField: <K extends keyof VisibilityData>(field: K, value: VisibilityData[K]) => void;
  addAllowedRole: (roleId: string) => void;
  removeAllowedRole: (roleId: string) => void;
  addAllowedUser: (user: VisibilityUser) => void;
  removeAllowedUser: (userId: string) => void;
  getVisibilityLabel: () => string;
  getVisibilityDescription: () => string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const VisibilityContext = createContext<VisibilityContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface VisibilityProviderProps {
  children: React.ReactNode;
  initialData?: Partial<VisibilityData>;
  initialConfig?: VisibilityConfig;
  onChange?: (data: VisibilityData) => void;
}

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({
  children,
  initialData,
  initialConfig = {},
  onChange,
}) => {
  const [data, setData] = useState<VisibilityData>({
    level: initialConfig.defaultVisibility || 'public',
    searchEngineVisibility: true,
    showInFeeds: true,
    showInArchives: true,
    allowComments: true,
    allowSharing: true,
    allowedRoles: [],
    allowedUsers: [],
    ...initialData,
  });

  const config: VisibilityConfig = {
    allowPassword: true,
    allowMembership: true,
    allowRoleBased: true,
    allowScheduledVisibility: true,
    showSEOSettings: true,
    showSocialSettings: true,
    availableRoles: [
      { id: 'admin', name: 'Administrator', userCount: 2 },
      { id: 'editor', name: 'Editor', userCount: 5 },
      { id: 'author', name: 'Author', userCount: 12 },
      { id: 'contributor', name: 'Contributor', userCount: 25 },
      { id: 'subscriber', name: 'Subscriber', userCount: 150 },
    ],
    membershipLevels: [
      { id: 'free', name: 'Free', memberCount: 500 },
      { id: 'basic', name: 'Basic', memberCount: 150 },
      { id: 'premium', name: 'Premium', memberCount: 75 },
      { id: 'vip', name: 'VIP', memberCount: 20 },
    ],
    ...initialConfig,
  };

  const updateField = useCallback(<K extends keyof VisibilityData>(
    field: K,
    value: VisibilityData[K]
  ) => {
    setData(prev => {
      const updated = { ...prev, [field]: value };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const addAllowedRole = useCallback((roleId: string) => {
    setData(prev => {
      if (prev.allowedRoles?.includes(roleId)) return prev;
      const updated = { ...prev, allowedRoles: [...(prev.allowedRoles || []), roleId] };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const removeAllowedRole = useCallback((roleId: string) => {
    setData(prev => {
      const updated = { ...prev, allowedRoles: prev.allowedRoles?.filter(r => r !== roleId) || [] };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const addAllowedUser = useCallback((user: VisibilityUser) => {
    setData(prev => {
      if (prev.allowedUsers?.some(u => u.id === user.id)) return prev;
      const updated = { ...prev, allowedUsers: [...(prev.allowedUsers || []), user] };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const removeAllowedUser = useCallback((userId: string) => {
    setData(prev => {
      const updated = { ...prev, allowedUsers: prev.allowedUsers?.filter(u => u.id !== userId) || [] };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const getVisibilityLabel = useCallback((): string => {
    switch (data.level) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'password': return 'Password Protected';
      case 'members': return 'Members Only';
      case 'roles': return 'Role-Based Access';
      case 'scheduled': return 'Scheduled Visibility';
      default: return 'Unknown';
    }
  }, [data.level]);

  const getVisibilityDescription = useCallback((): string => {
    switch (data.level) {
      case 'public': return 'Visible to everyone on the internet';
      case 'private': return 'Only visible to site administrators';
      case 'password': return 'Visitors must enter a password to view';
      case 'members': return `Only visible to ${data.membershipLevel || 'members'}`;
      case 'roles': return `Visible to ${data.allowedRoles?.length || 0} selected roles`;
      case 'scheduled': return 'Visibility changes based on schedule';
      default: return '';
    }
  }, [data]);

  return (
    <VisibilityContext.Provider value={{
      data,
      setData,
      config,
      updateField,
      addAllowedRole,
      removeAllowedRole,
      addAllowedUser,
      removeAllowedUser,
      getVisibilityLabel,
      getVisibilityDescription,
    }}>
      {children}
    </VisibilityContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useVisibility = (): VisibilityContextType => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const visibilityOptions: Record<VisibilityLevel, { icon: string; label: string; color: string }> = {
  public: { icon: '🌐', label: 'Public', color: 'green' },
  private: { icon: '🔒', label: 'Private', color: 'red' },
  password: { icon: '🔑', label: 'Password Protected', color: 'yellow' },
  members: { icon: '👥', label: 'Members Only', color: 'purple' },
  roles: { icon: '🎭', label: 'Role-Based Access', color: 'blue' },
  scheduled: { icon: '⏰', label: 'Scheduled', color: 'orange' },
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-400' },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Visibility Level Selector
export const VisibilityLevelSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = useVisibility();
  const [isOpen, setIsOpen] = useState(false);

  const availableLevels: VisibilityLevel[] = [
    'public',
    'private',
    ...(config.allowPassword ? ['password' as VisibilityLevel] : []),
    ...(config.allowMembership ? ['members' as VisibilityLevel] : []),
    ...(config.allowRoleBased ? ['roles' as VisibilityLevel] : []),
    ...(config.allowScheduledVisibility ? ['scheduled' as VisibilityLevel] : []),
  ];

  const currentOption = visibilityOptions[data.level];
  const currentColor = colorClasses[currentOption.color];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Visibility Level
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 ${currentColor.border} ${currentColor.bg}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentOption.icon}</span>
          <div className="text-left">
            <div className={`font-medium ${currentColor.text}`}>{currentOption.label}</div>
          </div>
        </div>
        <span className={currentColor.text}>▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {availableLevels.map((level) => {
              const option = visibilityOptions[level];
              const color = colorClasses[option.color];
              const isSelected = data.level === level;

              return (
                <button
                  key={level}
                  onClick={() => {
                    updateField('level', level);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${
                    isSelected ? color.bg : ''
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <div>
                    <div className={`font-medium ${isSelected ? color.text : 'text-gray-900 dark:text-white'}`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {level === 'public' && 'Visible to everyone on the internet'}
                      {level === 'private' && 'Only visible to site administrators'}
                      {level === 'password' && 'Visitors must enter a password'}
                      {level === 'members' && 'Only visible to logged-in members'}
                      {level === 'roles' && 'Visible to specific user roles'}
                      {level === 'scheduled' && 'Visibility changes on schedule'}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Password Protection Settings
export const PasswordSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = useVisibility();
  const [showPassword, setShowPassword] = useState(false);

  if (data.level !== 'password') return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Access Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={data.password || ''}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="Enter password..."
          className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Visitors will need this password to view the content
      </p>
    </motion.div>
  );
};

// Membership Level Selector
export const MembershipSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = useVisibility();

  if (data.level !== 'members' || !config.membershipLevels?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Minimum Membership Level
      </label>
      <div className="space-y-2">
        {config.membershipLevels.map((level) => (
          <label
            key={level.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              data.membershipLevel === level.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="membershipLevel"
              value={level.id}
              checked={data.membershipLevel === level.id}
              onChange={() => updateField('membershipLevel', level.id)}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">{level.name}</div>
              {level.description && (
                <div className="text-sm text-gray-500">{level.description}</div>
              )}
            </div>
            {level.memberCount !== undefined && (
              <span className="text-sm text-gray-500">
                {level.memberCount} members
              </span>
            )}
            {data.membershipLevel === level.id && (
              <span className="text-purple-600">✓</span>
            )}
          </label>
        ))}
      </div>
    </motion.div>
  );
};

// Role-Based Access Settings
export const RoleSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, config, addAllowedRole, removeAllowedRole } = useVisibility();

  if (data.level !== 'roles' || !config.availableRoles?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Allowed User Roles
      </label>
      <div className="space-y-2">
        {config.availableRoles.map((role) => {
          const isSelected = data.allowedRoles?.includes(role.id);

          return (
            <label
              key={role.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => isSelected ? removeAllowedRole(role.id) : addAllowedRole(role.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{role.name}</div>
                {role.description && (
                  <div className="text-sm text-gray-500">{role.description}</div>
                )}
              </div>
              {role.userCount !== undefined && (
                <span className="text-sm text-gray-500">
                  {role.userCount} users
                </span>
              )}
            </label>
          );
        })}
      </div>
      {(data.allowedRoles?.length || 0) === 0 && (
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
          ⚠️ Select at least one role to allow access
        </p>
      )}
    </motion.div>
  );
};

// Scheduled Visibility Settings
export const ScheduledVisibilitySettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = useVisibility();

  if (data.level !== 'scheduled') return null;

  const handleScheduleChange = (field: keyof ScheduledVisibility, value: any) => {
    updateField('scheduledVisibility', {
      ...data.scheduledVisibility,
      timezone: data.scheduledVisibility?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      [field]: value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`space-y-4 ${className}`}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Make Public At
        </label>
        <input
          type="datetime-local"
          value={data.scheduledVisibility?.makePublicAt
            ? new Date(data.scheduledVisibility.makePublicAt).toISOString().slice(0, 16)
            : ''
          }
          onChange={(e) => handleScheduleChange('makePublicAt', e.target.value ? new Date(e.target.value) : undefined)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Make Private At
        </label>
        <input
          type="datetime-local"
          value={data.scheduledVisibility?.makePrivateAt
            ? new Date(data.scheduledVisibility.makePrivateAt).toISOString().slice(0, 16)
            : ''
          }
          onChange={(e) => handleScheduleChange('makePrivateAt', e.target.value ? new Date(e.target.value) : undefined)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm text-orange-800 dark:text-orange-300">
        <p className="font-medium mb-1">How Scheduled Visibility Works:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Content starts as private until "Make Public At" time</li>
          <li>Content becomes private again at "Make Private At" time</li>
          <li>Leave either field empty to skip that transition</li>
        </ul>
      </div>
    </motion.div>
  );
};

// SEO Visibility Settings
export const SEOVisibilitySettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = useVisibility();

  if (!config.showSEOSettings) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Search Engine Visibility
      </h4>

      <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">Index in Search Engines</div>
          <div className="text-sm text-gray-500">Allow search engines to index this content</div>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={data.searchEngineVisibility}
            onChange={(e) => updateField('searchEngineVisibility', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${
            data.searchEngineVisibility ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              data.searchEngineVisibility ? 'translate-x-4' : ''
            }`} />
          </div>
        </div>
      </label>

      <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">Show in RSS Feeds</div>
          <div className="text-sm text-gray-500">Include in syndication feeds</div>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={data.showInFeeds}
            onChange={(e) => updateField('showInFeeds', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${
            data.showInFeeds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              data.showInFeeds ? 'translate-x-4' : ''
            }`} />
          </div>
        </div>
      </label>

      <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">Show in Archives</div>
          <div className="text-sm text-gray-500">Display in category and date archives</div>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={data.showInArchives}
            onChange={(e) => updateField('showInArchives', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${
            data.showInArchives ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              data.showInArchives ? 'translate-x-4' : ''
            }`} />
          </div>
        </div>
      </label>
    </div>
  );
};

// Social & Interaction Settings
export const SocialSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = useVisibility();

  if (!config.showSocialSettings) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Interactions
      </h4>

      <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">Allow Comments</div>
          <div className="text-sm text-gray-500">Let visitors leave comments</div>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={data.allowComments}
            onChange={(e) => updateField('allowComments', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${
            data.allowComments ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              data.allowComments ? 'translate-x-4' : ''
            }`} />
          </div>
        </div>
      </label>

      <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">Allow Sharing</div>
          <div className="text-sm text-gray-500">Show social sharing buttons</div>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={data.allowSharing}
            onChange={(e) => updateField('allowSharing', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${
            data.allowSharing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              data.allowSharing ? 'translate-x-4' : ''
            }`} />
          </div>
        </div>
      </label>
    </div>
  );
};

// Visibility Summary Badge
export const VisibilitySummaryBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, getVisibilityLabel } = useVisibility();
  const option = visibilityOptions[data.level];
  const color = colorClasses[option.color];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${color.bg} ${color.text} ${className}`}>
      <span>{option.icon}</span>
      <span className="font-medium">{getVisibilityLabel()}</span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VisibilitySettings: React.FC<{
  initialData?: Partial<VisibilityData>;
  initialConfig?: VisibilityConfig;
  onChange?: (data: VisibilityData) => void;
  className?: string;
}> = ({
  initialData,
  initialConfig,
  onChange,
  className = '',
}) => {
  return (
    <VisibilityProvider
      initialData={initialData}
      initialConfig={initialConfig}
      onChange={onChange}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Visibility Settings
            </h3>
            <VisibilitySummaryBadge />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <VisibilityLevelSelector />

          <AnimatePresence mode="wait">
            <PasswordSettings />
            <MembershipSettings />
            <RoleSettings />
            <ScheduledVisibilitySettings />
          </AnimatePresence>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <SEOVisibilitySettings />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <SocialSettings />
          </div>
        </div>
      </div>
    </VisibilityProvider>
  );
};

export default VisibilitySettings;
