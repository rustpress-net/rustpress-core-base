/**
 * RustPress User Activity & Security Components
 * Phase 2: Enhancements 7-10
 *
 * Enhancement 7: User Activity Timeline
 * Enhancement 8: Notification Preferences
 * Enhancement 9: User Roles & Permissions Display
 * Enhancement 10: Account Security Overview Dashboard
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Bell,
  BellOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Key,
  Smartphone,
  Mail,
  MessageSquare,
  FileText,
  Edit3,
  Trash2,
  Upload,
  Download,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  Eye,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Globe,
  Zap,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Award,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export type ActivityEventType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'profile_update'
  | 'post_create'
  | 'post_update'
  | 'post_delete'
  | 'comment_create'
  | 'file_upload'
  | 'settings_change'
  | 'security_alert'
  | '2fa_enable'
  | '2fa_disable'
  | 'session_revoke';

export interface NotificationPreference {
  id: string;
  category: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isDefault?: boolean;
  userCount?: number;
}

export interface SecurityCheck {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'failed';
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Enhancement 7: User Activity Timeline
// ============================================================================

interface UserActivityTimelineProps {
  activities: ActivityEvent[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function UserActivityTimeline({
  activities,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: UserActivityTimelineProps) {
  const [filter, setFilter] = useState<ActivityEventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const eventConfig: Record<ActivityEventType, { icon: React.ElementType; color: string; bgColor: string }> = {
    login: { icon: LogIn, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    logout: { icon: LogOut, color: 'text-neutral-500', bgColor: 'bg-neutral-100 dark:bg-neutral-800' },
    password_change: { icon: Key, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    profile_update: { icon: Edit3, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    post_create: { icon: FileText, color: 'text-primary-500', bgColor: 'bg-primary-100 dark:bg-primary-900/30' },
    post_update: { icon: Edit3, color: 'text-primary-500', bgColor: 'bg-primary-100 dark:bg-primary-900/30' },
    post_delete: { icon: Trash2, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    comment_create: { icon: MessageCircle, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    file_upload: { icon: Upload, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    settings_change: { icon: Settings, color: 'text-neutral-500', bgColor: 'bg-neutral-100 dark:bg-neutral-800' },
    security_alert: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    '2fa_enable': { icon: ShieldCheck, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    '2fa_disable': { icon: ShieldX, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    session_revoke: { icon: LogOut, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  };

  const filteredActivities = useMemo(() => {
    let result = activities;

    if (filter !== 'all') {
      result = result.filter((a) => a.type === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [activities, filter, searchQuery]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, ActivityEvent[]> = {};

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Activity History
        </h3>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className={cn(
                'w-48 pl-9 pr-4 py-2 rounded-xl',
                'border border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-sm text-neutral-900 dark:text-white',
                'placeholder-neutral-400',
                'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityEventType | 'all')}
            className={cn(
              'px-3 py-2 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-sm text-neutral-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          >
            <option value="all">All Activities</option>
            <option value="login">Logins</option>
            <option value="profile_update">Profile Updates</option>
            <option value="post_create">Posts</option>
            <option value="security_alert">Security</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dateActivities]) => (
          <div key={date}>
            <h4 className="text-sm font-medium text-neutral-500 mb-3">{date}</h4>
            <div className="space-y-3">
              {dateActivities.map((activity, index) => {
                const config = eventConfig[activity.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={cn('p-2 rounded-xl flex-shrink-0', config.bgColor)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {activity.title}
                        </p>
                        <span className="text-xs text-neutral-500">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      {activity.ip && (
                        <p className="text-xs text-neutral-400 mt-1">
                          IP: {activity.ip}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500">No activities found</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 mx-auto rounded-xl',
              'text-sm font-medium',
              'text-primary-600 dark:text-primary-400',
              'hover:bg-primary-50 dark:hover:bg-primary-900/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Enhancement 8: Notification Preferences Panel
// ============================================================================

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreference[];
  onChange: (id: string, channel: 'email' | 'push' | 'inApp', value: boolean) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function NotificationPreferencesPanel({
  preferences,
  onChange,
  onSave,
  isSaving = false,
}: NotificationPreferencesPanelProps) {
  const groupedPreferences = useMemo(() => {
    const groups: Record<string, NotificationPreference[]> = {};
    preferences.forEach((pref) => {
      if (!groups[pref.category]) {
        groups[pref.category] = [];
      }
      groups[pref.category].push(pref);
    });
    return groups;
  }, [preferences]);

  const toggleAll = (channel: 'email' | 'push' | 'inApp', value: boolean) => {
    preferences.forEach((pref) => {
      onChange(pref.id, channel, value);
    });
  };

  const allEnabled = (channel: 'email' | 'push' | 'inApp') => {
    return preferences.every((pref) => pref[channel]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Notification Preferences
            </h3>
            <p className="text-sm text-neutral-500">
              Choose how you want to receive notifications
            </p>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'text-sm font-medium',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Channel Headers */}
      <div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 items-center px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Notification Type
        </span>
        <div className="w-20 text-center">
          <button
            onClick={() => toggleAll('email', !allEnabled('email'))}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Mail className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-xs text-neutral-500">Email</span>
          </button>
        </div>
        <div className="w-20 text-center">
          <button
            onClick={() => toggleAll('push', !allEnabled('push'))}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-xs text-neutral-500">Push</span>
          </button>
        </div>
        <div className="w-20 text-center">
          <button
            onClick={() => toggleAll('inApp', !allEnabled('inApp'))}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-xs text-neutral-500">In-App</span>
          </button>
        </div>
      </div>

      {/* Preferences by Category */}
      <div className="space-y-6">
        {Object.entries(groupedPreferences).map(([category, categoryPrefs]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              {category}
            </h4>
            <div className="space-y-2">
              {categoryPrefs.map((pref) => (
                <div
                  key={pref.id}
                  className="grid grid-cols-[1fr,auto,auto,auto] gap-4 items-center p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {pref.label}
                    </p>
                    <p className="text-xs text-neutral-500">{pref.description}</p>
                  </div>
                  <div className="w-20 flex justify-center">
                    <ToggleSwitch
                      checked={pref.email}
                      onChange={(value) => onChange(pref.id, 'email', value)}
                    />
                  </div>
                  <div className="w-20 flex justify-center">
                    <ToggleSwitch
                      checked={pref.push}
                      onChange={(value) => onChange(pref.id, 'push', value)}
                    />
                  </div>
                  <div className="w-20 flex justify-center">
                    <ToggleSwitch
                      checked={pref.inApp}
                      onChange={(value) => onChange(pref.id, 'inApp', value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full',
        'transition-colors',
        checked ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm',
          'transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

// ============================================================================
// Enhancement 9: User Roles & Permissions Display
// ============================================================================

interface RolesPermissionsDisplayProps {
  currentRole: Role;
  allPermissions: Permission[];
  showInherited?: boolean;
}

export function RolesPermissionsDisplay({
  currentRole,
  allPermissions,
  showInherited = true,
}: RolesPermissionsDisplayProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach((perm) => {
      if (!groups[perm.category]) {
        groups[perm.category] = [];
      }
      groups[perm.category].push(perm);
    });
    return groups;
  }, [allPermissions]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const hasPermission = (permissionId: string) => {
    return (
      currentRole.permissions.includes('all') ||
      currentRole.permissions.includes(permissionId)
    );
  };

  const categoryStats = (category: string) => {
    const perms = groupedPermissions[category] || [];
    const granted = perms.filter((p) => hasPermission(p.id)).length;
    return { granted, total: perms.length };
  };

  return (
    <div className="space-y-6">
      {/* Current Role */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${currentRole.color}20` }}
          >
            <Award className="w-6 h-6" style={{ color: currentRole.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {currentRole.name}
              </h3>
              {currentRole.isDefault && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentRole.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {currentRole.permissions.includes('all')
                ? allPermissions.length
                : currentRole.permissions.length}
            </p>
            <p className="text-xs text-neutral-500">permissions</p>
          </div>
        </div>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-3">
        {Object.entries(groupedPermissions).map(([category, perms]) => {
          const isExpanded = expandedCategories.has(category);
          const stats = categoryStats(category);

          return (
            <div
              key={category}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 text-neutral-400 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {stats.granted}/{stats.total}
                  </span>
                  <div className="w-16 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{
                        width: `${(stats.granted / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="px-4 pb-4 space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      {perms.map((permission) => {
                        const granted = hasPermission(permission.id);

                        return (
                          <div
                            key={permission.id}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg',
                              granted
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-neutral-50 dark:bg-neutral-800/50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {granted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-neutral-400" />
                              )}
                              <div>
                                <p
                                  className={cn(
                                    'text-sm font-medium',
                                    granted
                                      ? 'text-green-700 dark:text-green-300'
                                      : 'text-neutral-500'
                                  )}
                                >
                                  {permission.name}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 10: Account Security Overview Dashboard
// ============================================================================

interface SecurityOverviewDashboardProps {
  securityScore: number;
  checks: SecurityCheck[];
  lastSecurityReview?: string;
  onRunCheck?: () => void;
}

export function SecurityOverviewDashboard({
  securityScore,
  checks,
  lastSecurityReview,
  onRunCheck,
}: SecurityOverviewDashboardProps) {
  const scoreColor = useMemo(() => {
    if (securityScore >= 80) return 'text-green-500';
    if (securityScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  }, [securityScore]);

  const scoreLabel = useMemo(() => {
    if (securityScore >= 80) return 'Excellent';
    if (securityScore >= 60) return 'Good';
    if (securityScore >= 40) return 'Fair';
    return 'Poor';
  }, [securityScore]);

  const passedChecks = checks.filter((c) => c.status === 'passed').length;
  const warningChecks = checks.filter((c) => c.status === 'warning').length;
  const failedChecks = checks.filter((c) => c.status === 'failed').length;

  const statusConfig = {
    passed: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Security Overview</h3>
          </div>
          {onRunCheck && (
            <button
              onClick={onRunCheck}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Run Check
            </button>
          )}
        </div>

        <div className="flex items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(securityScore / 100) * 352} 352`}
                strokeLinecap="round"
                className={scoreColor}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{securityScore}</span>
              <span className="text-xs text-neutral-400">{scoreLabel}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-400" />
              <p className="text-2xl font-bold">{passedChecks}</p>
              <p className="text-xs text-neutral-400">Passed</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <p className="text-2xl font-bold">{warningChecks}</p>
              <p className="text-xs text-neutral-400">Warnings</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-400" />
              <p className="text-2xl font-bold">{failedChecks}</p>
              <p className="text-xs text-neutral-400">Failed</p>
            </div>
          </div>
        </div>

        {lastSecurityReview && (
          <p className="text-xs text-neutral-400 mt-4">
            Last reviewed:{' '}
            {new Date(lastSecurityReview).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Security Checks */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Security Checks
        </h4>
        {checks.map((check) => {
          const config = statusConfig[check.status];
          const Icon = config.icon;

          return (
            <div
              key={check.id}
              className={cn(
                'p-4 rounded-xl border',
                config.borderColor,
                'bg-white dark:bg-neutral-900'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', config.bgColor)}>
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {check.label}
                    </p>
                    {check.action && (
                      <button
                        onClick={check.action.onClick}
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {check.action.label}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {check.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {failedChecks > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Security Recommendations
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {failedChecks} security issue{failedChecks !== 1 ? 's' : ''} need
                your attention. Address these to improve your account security.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

export const sampleActivities: ActivityEvent[] = [
  {
    id: '1',
    type: 'login',
    title: 'Signed in',
    description: 'Chrome on macOS',
    timestamp: new Date().toISOString(),
    ip: '192.168.1.100',
  },
  {
    id: '2',
    type: 'post_create',
    title: 'Created a new post',
    description: '"Getting Started with RustPress"',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'profile_update',
    title: 'Updated profile',
    description: 'Changed bio and location',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    type: '2fa_enable',
    title: 'Enabled two-factor authentication',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    type: 'password_change',
    title: 'Changed password',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    ip: '192.168.1.100',
  },
];

export const sampleNotificationPreferences: NotificationPreference[] = [
  {
    id: '1',
    category: 'Content',
    label: 'New comments',
    description: 'When someone comments on your posts',
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: '2',
    category: 'Content',
    label: 'Post likes',
    description: 'When someone likes your posts',
    email: false,
    push: true,
    inApp: true,
  },
  {
    id: '3',
    category: 'Social',
    label: 'New followers',
    description: 'When someone follows you',
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: '4',
    category: 'Social',
    label: 'Mentions',
    description: 'When someone mentions you',
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: '5',
    category: 'Security',
    label: 'Login alerts',
    description: 'When a new device signs in',
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: '6',
    category: 'Security',
    label: 'Password changes',
    description: 'When your password is changed',
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: '7',
    category: 'Updates',
    label: 'Product updates',
    description: 'New features and improvements',
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: '8',
    category: 'Updates',
    label: 'Newsletter',
    description: 'Weekly digest and tips',
    email: true,
    push: false,
    inApp: false,
  },
];

export const sampleRole: Role = {
  id: 'editor',
  name: 'Editor',
  description: 'Can manage and publish content, but cannot change site settings',
  color: '#8B5CF6',
  permissions: [
    'posts.create',
    'posts.edit',
    'posts.delete',
    'posts.publish',
    'media.upload',
    'media.delete',
    'comments.moderate',
  ],
  userCount: 12,
};

export const samplePermissions: Permission[] = [
  { id: 'posts.create', name: 'Create Posts', description: 'Create new posts', category: 'Content' },
  { id: 'posts.edit', name: 'Edit Posts', description: 'Edit existing posts', category: 'Content' },
  { id: 'posts.delete', name: 'Delete Posts', description: 'Delete posts', category: 'Content' },
  { id: 'posts.publish', name: 'Publish Posts', description: 'Publish posts', category: 'Content' },
  { id: 'media.upload', name: 'Upload Media', description: 'Upload media files', category: 'Media' },
  { id: 'media.delete', name: 'Delete Media', description: 'Delete media files', category: 'Media' },
  { id: 'comments.moderate', name: 'Moderate Comments', description: 'Approve or reject comments', category: 'Comments' },
  { id: 'users.view', name: 'View Users', description: 'View user list', category: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user profiles', category: 'Users' },
  { id: 'settings.view', name: 'View Settings', description: 'View site settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify site settings', category: 'Settings' },
];

export const sampleSecurityChecks: SecurityCheck[] = [
  {
    id: '1',
    label: 'Two-Factor Authentication',
    status: 'passed',
    description: '2FA is enabled for your account',
  },
  {
    id: '2',
    label: 'Strong Password',
    status: 'passed',
    description: 'Your password meets security requirements',
  },
  {
    id: '3',
    label: 'Email Verification',
    status: 'passed',
    description: 'Your email address is verified',
  },
  {
    id: '4',
    label: 'Recovery Email',
    status: 'warning',
    description: 'No recovery email configured',
    action: { label: 'Add recovery email', onClick: () => {} },
  },
  {
    id: '5',
    label: 'Active Sessions',
    status: 'warning',
    description: '3 active sessions detected',
    action: { label: 'Review sessions', onClick: () => {} },
  },
  {
    id: '6',
    label: 'Password Age',
    status: 'failed',
    description: 'Password not changed in 90+ days',
    action: { label: 'Change password', onClick: () => {} },
  },
];

export default UserActivityTimeline;
