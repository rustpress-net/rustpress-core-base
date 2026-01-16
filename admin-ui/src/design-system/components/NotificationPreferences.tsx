import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationChannel = 'email' | 'push' | 'inApp' | 'slack' | 'sms';
export type NotificationCategory = 'content' | 'comments' | 'assignments' | 'approvals' | 'system' | 'security' | 'marketing' | 'social';
export type NotificationFrequency = 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
export type DigestTime = 'morning' | 'afternoon' | 'evening';

export interface NotificationType {
  id: string;
  category: NotificationCategory;
  name: string;
  description: string;
  channels: NotificationChannel[];
  defaultEnabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChannelSettings {
  channel: NotificationChannel;
  enabled: boolean;
  frequency: NotificationFrequency;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface NotificationPreference {
  typeId: string;
  channels: {
    [key in NotificationChannel]?: {
      enabled: boolean;
      frequency?: NotificationFrequency;
    };
  };
}

export interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  dayOfWeek: number;
  time: DigestTime;
  includeCategories: NotificationCategory[];
}

export interface NotificationPreferencesConfig {
  globalEnabled: boolean;
  channelSettings: ChannelSettings[];
  preferences: NotificationPreference[];
  digestSettings: DigestSettings;
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    allowCritical: boolean;
  };
  emailSettings: {
    address: string;
    verified: boolean;
    unsubscribeToken?: string;
  };
  pushSettings: {
    enabled: boolean;
    browserSupported: boolean;
    subscribed: boolean;
  };
  slackSettings: {
    connected: boolean;
    workspace?: string;
    channel?: string;
  };
}

// ============================================================================
// CONTEXT
// ============================================================================

interface NotificationPreferencesContextType {
  config: NotificationPreferencesConfig;
  notificationTypes: NotificationType[];
  updateGlobalEnabled: (enabled: boolean) => void;
  updateChannelSettings: (channel: NotificationChannel, settings: Partial<ChannelSettings>) => void;
  updatePreference: (typeId: string, channel: NotificationChannel, settings: { enabled?: boolean; frequency?: NotificationFrequency }) => void;
  updateDigestSettings: (settings: Partial<DigestSettings>) => void;
  updateDoNotDisturb: (settings: Partial<NotificationPreferencesConfig['doNotDisturb']>) => void;
  enableAllForCategory: (category: NotificationCategory, channel: NotificationChannel) => void;
  disableAllForCategory: (category: NotificationCategory, channel: NotificationChannel) => void;
  resetToDefaults: () => void;
  testNotification: (channel: NotificationChannel) => void;
}

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined);

// ============================================================================
// DEFAULT DATA
// ============================================================================

const defaultNotificationTypes: NotificationType[] = [
  // Content
  { id: 'content-published', category: 'content', name: 'Content Published', description: 'When your content is published', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'medium' },
  { id: 'content-updated', category: 'content', name: 'Content Updated', description: 'When content you follow is updated', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'low' },
  { id: 'content-scheduled', category: 'content', name: 'Content Scheduled', description: 'Reminders for scheduled content', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'medium' },
  { id: 'content-failed', category: 'content', name: 'Publish Failed', description: 'When content fails to publish', channels: ['email', 'push', 'inApp', 'slack'], defaultEnabled: true, priority: 'high' },

  // Comments
  { id: 'comment-new', category: 'comments', name: 'New Comment', description: 'When someone comments on your content', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'medium' },
  { id: 'comment-reply', category: 'comments', name: 'Comment Reply', description: 'When someone replies to your comment', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'medium' },
  { id: 'comment-mention', category: 'comments', name: 'Comment Mention', description: 'When you are mentioned in a comment', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'high' },
  { id: 'comment-moderation', category: 'comments', name: 'Moderation Required', description: 'When comments need moderation', channels: ['email', 'inApp'], defaultEnabled: true, priority: 'medium' },

  // Assignments
  { id: 'assignment-new', category: 'assignments', name: 'New Assignment', description: 'When you are assigned content', channels: ['email', 'push', 'inApp', 'slack'], defaultEnabled: true, priority: 'high' },
  { id: 'assignment-due', category: 'assignments', name: 'Due Date Reminder', description: 'When assignment is due soon', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'high' },
  { id: 'assignment-overdue', category: 'assignments', name: 'Overdue Notice', description: 'When assignment is overdue', channels: ['email', 'push', 'inApp', 'slack'], defaultEnabled: true, priority: 'critical' },
  { id: 'assignment-completed', category: 'assignments', name: 'Assignment Completed', description: 'When assigned content is completed', channels: ['email', 'inApp'], defaultEnabled: true, priority: 'low' },

  // Approvals
  { id: 'approval-requested', category: 'approvals', name: 'Approval Requested', description: 'When your approval is needed', channels: ['email', 'push', 'inApp', 'slack'], defaultEnabled: true, priority: 'high' },
  { id: 'approval-approved', category: 'approvals', name: 'Content Approved', description: 'When your content is approved', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'medium' },
  { id: 'approval-rejected', category: 'approvals', name: 'Content Rejected', description: 'When your content is rejected', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'high' },
  { id: 'approval-changes', category: 'approvals', name: 'Changes Requested', description: 'When changes are requested', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'high' },

  // System
  { id: 'system-update', category: 'system', name: 'System Updates', description: 'Important system announcements', channels: ['email', 'inApp'], defaultEnabled: true, priority: 'medium' },
  { id: 'system-maintenance', category: 'system', name: 'Maintenance Notice', description: 'Scheduled maintenance alerts', channels: ['email', 'inApp'], defaultEnabled: true, priority: 'high' },
  { id: 'system-backup', category: 'system', name: 'Backup Status', description: 'Backup completion notifications', channels: ['email'], defaultEnabled: false, priority: 'low' },

  // Security
  { id: 'security-login', category: 'security', name: 'New Login', description: 'When your account is accessed', channels: ['email', 'push'], defaultEnabled: true, priority: 'high' },
  { id: 'security-password', category: 'security', name: 'Password Changed', description: 'When your password is changed', channels: ['email'], defaultEnabled: true, priority: 'critical' },
  { id: 'security-2fa', category: 'security', name: '2FA Activity', description: 'Two-factor authentication events', channels: ['email'], defaultEnabled: true, priority: 'critical' },
  { id: 'security-suspicious', category: 'security', name: 'Suspicious Activity', description: 'Unusual account activity detected', channels: ['email', 'push', 'sms'], defaultEnabled: true, priority: 'critical' },

  // Marketing
  { id: 'marketing-newsletter', category: 'marketing', name: 'Newsletter', description: 'Product news and updates', channels: ['email'], defaultEnabled: false, priority: 'low' },
  { id: 'marketing-tips', category: 'marketing', name: 'Tips & Tricks', description: 'Usage tips and best practices', channels: ['email'], defaultEnabled: false, priority: 'low' },
  { id: 'marketing-features', category: 'marketing', name: 'New Features', description: 'New feature announcements', channels: ['email', 'inApp'], defaultEnabled: true, priority: 'low' },

  // Social
  { id: 'social-follow', category: 'social', name: 'New Follower', description: 'When someone follows you', channels: ['email', 'push', 'inApp'], defaultEnabled: true, priority: 'low' },
  { id: 'social-like', category: 'social', name: 'Content Liked', description: 'When your content is liked', channels: ['inApp'], defaultEnabled: true, priority: 'low' },
  { id: 'social-share', category: 'social', name: 'Content Shared', description: 'When your content is shared', channels: ['email', 'inApp'], defaultEnabled: true, priority: 'medium' },
];

const defaultConfig: NotificationPreferencesConfig = {
  globalEnabled: true,
  channelSettings: [
    { channel: 'email', enabled: true, frequency: 'instant', quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '08:00' },
    { channel: 'push', enabled: true, frequency: 'instant', quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '08:00' },
    { channel: 'inApp', enabled: true, frequency: 'instant', quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '08:00' },
    { channel: 'slack', enabled: false, frequency: 'instant', quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '08:00' },
    { channel: 'sms', enabled: false, frequency: 'instant', quietHoursEnabled: true, quietHoursStart: '21:00', quietHoursEnd: '09:00' },
  ],
  preferences: [],
  digestSettings: {
    enabled: false,
    frequency: 'daily',
    dayOfWeek: 1,
    time: 'morning',
    includeCategories: ['content', 'comments', 'assignments'],
  },
  doNotDisturb: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    allowCritical: true,
  },
  emailSettings: {
    address: 'user@example.com',
    verified: true,
  },
  pushSettings: {
    enabled: true,
    browserSupported: true,
    subscribed: true,
  },
  slackSettings: {
    connected: false,
  },
};

// ============================================================================
// PROVIDER
// ============================================================================

interface NotificationPreferencesProviderProps {
  children: ReactNode;
  initialConfig?: Partial<NotificationPreferencesConfig>;
  customTypes?: NotificationType[];
}

export const NotificationPreferencesProvider: React.FC<NotificationPreferencesProviderProps> = ({
  children,
  initialConfig = {},
  customTypes = [],
}) => {
  const [config, setConfig] = useState<NotificationPreferencesConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const notificationTypes = [...defaultNotificationTypes, ...customTypes];

  const updateGlobalEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, globalEnabled: enabled }));
  }, []);

  const updateChannelSettings = useCallback((channel: NotificationChannel, settings: Partial<ChannelSettings>) => {
    setConfig(prev => ({
      ...prev,
      channelSettings: prev.channelSettings.map(cs =>
        cs.channel === channel ? { ...cs, ...settings } : cs
      ),
    }));
  }, []);

  const updatePreference = useCallback((
    typeId: string,
    channel: NotificationChannel,
    settings: { enabled?: boolean; frequency?: NotificationFrequency }
  ) => {
    setConfig(prev => {
      const existingPref = prev.preferences.find(p => p.typeId === typeId);

      if (existingPref) {
        return {
          ...prev,
          preferences: prev.preferences.map(p =>
            p.typeId === typeId
              ? {
                  ...p,
                  channels: {
                    ...p.channels,
                    [channel]: { ...p.channels[channel], ...settings },
                  },
                }
              : p
          ),
        };
      }

      return {
        ...prev,
        preferences: [
          ...prev.preferences,
          {
            typeId,
            channels: { [channel]: settings },
          },
        ],
      };
    });
  }, []);

  const updateDigestSettings = useCallback((settings: Partial<DigestSettings>) => {
    setConfig(prev => ({
      ...prev,
      digestSettings: { ...prev.digestSettings, ...settings },
    }));
  }, []);

  const updateDoNotDisturb = useCallback((settings: Partial<NotificationPreferencesConfig['doNotDisturb']>) => {
    setConfig(prev => ({
      ...prev,
      doNotDisturb: { ...prev.doNotDisturb, ...settings },
    }));
  }, []);

  const enableAllForCategory = useCallback((category: NotificationCategory, channel: NotificationChannel) => {
    const typesInCategory = notificationTypes.filter(t => t.category === category);
    typesInCategory.forEach(type => {
      updatePreference(type.id, channel, { enabled: true });
    });
  }, [notificationTypes, updatePreference]);

  const disableAllForCategory = useCallback((category: NotificationCategory, channel: NotificationChannel) => {
    const typesInCategory = notificationTypes.filter(t => t.category === category);
    typesInCategory.forEach(type => {
      updatePreference(type.id, channel, { enabled: false });
    });
  }, [notificationTypes, updatePreference]);

  const resetToDefaults = useCallback(() => {
    setConfig({ ...defaultConfig, preferences: [] });
  }, []);

  const testNotification = useCallback((channel: NotificationChannel) => {
    console.log(`Sending test notification to ${channel}`);
    // Would trigger actual test notification in production
  }, []);

  return (
    <NotificationPreferencesContext.Provider
      value={{
        config,
        notificationTypes,
        updateGlobalEnabled,
        updateChannelSettings,
        updatePreference,
        updateDigestSettings,
        updateDoNotDisturb,
        enableAllForCategory,
        disableAllForCategory,
        resetToDefaults,
        testNotification,
      }}
    >
      {children}
    </NotificationPreferencesContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useNotificationPreferences = (): NotificationPreferencesContextType => {
  const context = useContext(NotificationPreferencesContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within NotificationPreferencesProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  globalToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  globalLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
    overflowX: 'auto' as const,
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  tabInactive: {
    backgroundColor: '#fff',
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  card: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  channelCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  channelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  channelIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  channelName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  channelStatus: {
    fontSize: '12px',
    color: '#64748b',
  },
  toggle: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleKnob: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleKnobActive: {
    transform: 'translateX(20px)',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#1e293b',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  categorySection: {
    marginBottom: '24px',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
  },
  categoryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  categoryActions: {
    display: 'flex',
    gap: '8px',
  },
  linkButton: {
    padding: '4px 8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    fontSize: '12px',
    cursor: 'pointer',
  },
  notificationRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    gap: '16px',
  },
  notificationInfo: {
    flex: 1,
    minWidth: '200px',
  },
  notificationName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  notificationDesc: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  channelToggles: {
    display: 'flex',
    gap: '24px',
  },
  channelToggle: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  channelToggleLabel: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase' as const,
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff',
  },
  checkboxDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  settingDescription: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
  },
  timeInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100px',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
  priorityBadge: {
    low: { backgroundColor: '#f1f5f9', color: '#64748b' },
    medium: { backgroundColor: '#dbeafe', color: '#3b82f6' },
    high: { backgroundColor: '#fef3c7', color: '#d97706' },
    critical: { backgroundColor: '#fef2f2', color: '#dc2626' },
  },
  integrationCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  integrationIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  integrationStatus: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  digestPreview: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginTop: '16px',
  },
  digestTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  digestInfo: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.6',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getChannelIcon = (channel: NotificationChannel): string => {
  switch (channel) {
    case 'email': return '📧';
    case 'push': return '🔔';
    case 'inApp': return '💬';
    case 'slack': return '💼';
    case 'sms': return '📱';
    default: return '📢';
  }
};

const getChannelColor = (channel: NotificationChannel): string => {
  switch (channel) {
    case 'email': return '#3b82f6';
    case 'push': return '#f59e0b';
    case 'inApp': return '#22c55e';
    case 'slack': return '#611f69';
    case 'sms': return '#06b6d4';
    default: return '#64748b';
  }
};

const getCategoryIcon = (category: NotificationCategory): string => {
  switch (category) {
    case 'content': return '📝';
    case 'comments': return '💬';
    case 'assignments': return '📋';
    case 'approvals': return '✅';
    case 'system': return '⚙️';
    case 'security': return '🔐';
    case 'marketing': return '📢';
    case 'social': return '👥';
    default: return '📢';
  }
};

const getCategoryLabel = (category: NotificationCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Toggle Component
const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }> = ({
  enabled,
  onChange,
  disabled = false,
}) => (
  <div
    style={{
      ...styles.toggle,
      ...(enabled ? styles.toggleActive : {}),
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    onClick={() => !disabled && onChange(!enabled)}
  >
    <div style={{ ...styles.toggleKnob, ...(enabled ? styles.toggleKnobActive : {}) }} />
  </div>
);

// Checkbox Component
const Checkbox: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({
  checked,
  onChange,
  disabled = false,
}) => (
  <div
    style={{
      ...styles.checkbox,
      ...(checked ? styles.checkboxChecked : {}),
      ...(disabled ? styles.checkboxDisabled : {}),
    }}
    onClick={() => !disabled && onChange(!checked)}
  >
    {checked && <span style={{ fontSize: '12px' }}>✓</span>}
  </div>
);

// Global Toggle Component
export const GlobalToggle: React.FC = () => {
  const { config, updateGlobalEnabled } = useNotificationPreferences();

  return (
    <div style={styles.globalToggle}>
      <span style={styles.globalLabel}>Notifications</span>
      <Toggle enabled={config.globalEnabled} onChange={updateGlobalEnabled} />
    </div>
  );
};

// Channel Card Component
export const ChannelCard: React.FC<{ channel: NotificationChannel }> = ({ channel }) => {
  const { config, updateChannelSettings, testNotification } = useNotificationPreferences();
  const settings = config.channelSettings.find(cs => cs.channel === channel);

  if (!settings) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.channelCard}
    >
      <div style={styles.channelHeader}>
        <div style={styles.channelInfo}>
          <div
            style={{
              ...styles.channelIcon,
              backgroundColor: `${getChannelColor(channel)}20`,
            }}
          >
            {getChannelIcon(channel)}
          </div>
          <div>
            <div style={styles.channelName}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </div>
            <div style={styles.channelStatus}>
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
        <Toggle
          enabled={settings.enabled}
          onChange={(enabled) => updateChannelSettings(channel, { enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Frequency:</span>
            <select
              value={settings.frequency}
              onChange={(e) => updateChannelSettings(channel, { frequency: e.target.value as NotificationFrequency })}
              style={styles.select}
            >
              <option value="instant">Instant</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Checkbox
              checked={settings.quietHoursEnabled}
              onChange={(enabled) => updateChannelSettings(channel, { quietHoursEnabled: enabled })}
            />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Quiet hours</span>
            {settings.quietHoursEnabled && (
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {settings.quietHoursStart} - {settings.quietHoursEnd}
              </span>
            )}
          </div>

          <button
            onClick={() => testNotification(channel)}
            style={{ ...styles.button, ...styles.secondaryButton, alignSelf: 'flex-start' }}
          >
            Send Test
          </button>
        </>
      )}
    </motion.div>
  );
};

// Channel Settings Grid
export const ChannelSettingsGrid: React.FC = () => {
  const { config } = useNotificationPreferences();

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        <span>📢</span> Notification Channels
      </h3>
      <div style={styles.channelGrid}>
        {config.channelSettings.map(cs => (
          <ChannelCard key={cs.channel} channel={cs.channel} />
        ))}
      </div>
    </div>
  );
};

// Notification Row Component
export const NotificationRow: React.FC<{ type: NotificationType }> = ({ type }) => {
  const { config, updatePreference } = useNotificationPreferences();
  const preference = config.preferences.find(p => p.typeId === type.id);

  const isChannelEnabled = (channel: NotificationChannel): boolean => {
    if (!type.channels.includes(channel)) return false;
    const channelSetting = config.channelSettings.find(cs => cs.channel === channel);
    if (!channelSetting?.enabled) return false;
    const pref = preference?.channels[channel];
    return pref?.enabled ?? type.defaultEnabled;
  };

  const isChannelAvailable = (channel: NotificationChannel): boolean => {
    if (!type.channels.includes(channel)) return false;
    const channelSetting = config.channelSettings.find(cs => cs.channel === channel);
    return channelSetting?.enabled ?? false;
  };

  return (
    <div style={styles.notificationRow}>
      <div style={styles.notificationInfo}>
        <div style={styles.notificationName}>{type.name}</div>
        <div style={styles.notificationDesc}>{type.description}</div>
      </div>

      <span
        style={{
          ...styles.badge,
          ...styles.priorityBadge[type.priority],
        }}
      >
        {type.priority}
      </span>

      <div style={styles.channelToggles}>
        {(['email', 'push', 'inApp', 'slack', 'sms'] as NotificationChannel[]).map(channel => (
          <div key={channel} style={styles.channelToggle}>
            <span style={styles.channelToggleLabel}>{channel}</span>
            <Checkbox
              checked={isChannelEnabled(channel)}
              onChange={(enabled) => updatePreference(type.id, channel, { enabled })}
              disabled={!isChannelAvailable(channel)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Category Section Component
export const CategorySection: React.FC<{ category: NotificationCategory }> = ({ category }) => {
  const { notificationTypes, enableAllForCategory, disableAllForCategory } = useNotificationPreferences();
  const typesInCategory = notificationTypes.filter(t => t.category === category);

  if (typesInCategory.length === 0) return null;

  return (
    <div style={styles.categorySection}>
      <div style={styles.categoryHeader}>
        <h4 style={styles.categoryTitle}>
          <span>{getCategoryIcon(category)}</span>
          {getCategoryLabel(category)}
        </h4>
        <div style={styles.categoryActions}>
          <button
            onClick={() => enableAllForCategory(category, 'email')}
            style={styles.linkButton}
          >
            Enable All
          </button>
          <button
            onClick={() => disableAllForCategory(category, 'email')}
            style={styles.linkButton}
          >
            Disable All
          </button>
        </div>
      </div>

      {typesInCategory.map(type => (
        <NotificationRow key={type.id} type={type} />
      ))}
    </div>
  );
};

// Notification Types List
export const NotificationTypesList: React.FC = () => {
  const categories: NotificationCategory[] = [
    'content', 'comments', 'assignments', 'approvals',
    'system', 'security', 'marketing', 'social'
  ];

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        <span>🔔</span> Notification Types
      </h3>

      {categories.map(category => (
        <CategorySection key={category} category={category} />
      ))}
    </div>
  );
};

// Do Not Disturb Settings
export const DoNotDisturbSettings: React.FC = () => {
  const { config, updateDoNotDisturb } = useNotificationPreferences();
  const { doNotDisturb } = config;

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        <span>🌙</span> Do Not Disturb
      </h3>

      <div style={styles.settingRow}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Enable Do Not Disturb</div>
          <div style={styles.settingDescription}>
            Silence all notifications during specified hours
          </div>
        </div>
        <Toggle
          enabled={doNotDisturb.enabled}
          onChange={(enabled) => updateDoNotDisturb({ enabled })}
        />
      </div>

      {doNotDisturb.enabled && (
        <>
          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Quiet Hours</div>
              <div style={styles.settingDescription}>
                Set the time range for do not disturb
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="time"
                value={doNotDisturb.startTime}
                onChange={(e) => updateDoNotDisturb({ startTime: e.target.value })}
                style={styles.timeInput}
              />
              <span style={{ color: '#64748b' }}>to</span>
              <input
                type="time"
                value={doNotDisturb.endTime}
                onChange={(e) => updateDoNotDisturb({ endTime: e.target.value })}
                style={styles.timeInput}
              />
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Allow Critical Alerts</div>
              <div style={styles.settingDescription}>
                Critical security and system alerts will still be delivered
              </div>
            </div>
            <Toggle
              enabled={doNotDisturb.allowCritical}
              onChange={(enabled) => updateDoNotDisturb({ allowCritical: enabled })}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Digest Settings Component
export const DigestSettingsPanel: React.FC = () => {
  const { config, updateDigestSettings } = useNotificationPreferences();
  const { digestSettings } = config;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        <span>📬</span> Email Digest
      </h3>

      <div style={styles.settingRow}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Enable Email Digest</div>
          <div style={styles.settingDescription}>
            Receive a summary of notifications instead of individual emails
          </div>
        </div>
        <Toggle
          enabled={digestSettings.enabled}
          onChange={(enabled) => updateDigestSettings({ enabled })}
        />
      </div>

      {digestSettings.enabled && (
        <>
          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Frequency</div>
            </div>
            <select
              value={digestSettings.frequency}
              onChange={(e) => updateDigestSettings({ frequency: e.target.value as 'daily' | 'weekly' })}
              style={styles.select}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {digestSettings.frequency === 'weekly' && (
            <div style={styles.settingRow}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Day of Week</div>
              </div>
              <select
                value={digestSettings.dayOfWeek}
                onChange={(e) => updateDigestSettings({ dayOfWeek: parseInt(e.target.value) })}
                style={styles.select}
              >
                {days.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingLabel}>Delivery Time</div>
            </div>
            <select
              value={digestSettings.time}
              onChange={(e) => updateDigestSettings({ time: e.target.value as DigestTime })}
              style={styles.select}
            >
              <option value="morning">Morning (8:00 AM)</option>
              <option value="afternoon">Afternoon (1:00 PM)</option>
              <option value="evening">Evening (6:00 PM)</option>
            </select>
          </div>

          <div style={styles.digestPreview}>
            <div style={styles.digestTitle}>Digest Preview</div>
            <div style={styles.digestInfo}>
              You'll receive your digest{' '}
              {digestSettings.frequency === 'daily'
                ? 'every day'
                : `every ${days[digestSettings.dayOfWeek]}`}{' '}
              in the {digestSettings.time}.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Integrations Panel
export const IntegrationsPanel: React.FC = () => {
  const { config } = useNotificationPreferences();

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        <span>🔗</span> Integrations
      </h3>

      <div style={styles.integrationCard}>
        <div
          style={{
            ...styles.integrationIcon,
            backgroundColor: '#dbeafe',
          }}
        >
          📧
        </div>
        <div style={styles.integrationInfo}>
          <div style={styles.integrationName}>Email</div>
          <div style={styles.integrationStatus}>
            {config.emailSettings.address}
            {config.emailSettings.verified && (
              <span style={{ color: '#22c55e', marginLeft: '8px' }}>✓ Verified</span>
            )}
          </div>
        </div>
        <button style={{ ...styles.button, ...styles.secondaryButton }}>
          Change
        </button>
      </div>

      <div style={styles.integrationCard}>
        <div
          style={{
            ...styles.integrationIcon,
            backgroundColor: '#fef3c7',
          }}
        >
          🔔
        </div>
        <div style={styles.integrationInfo}>
          <div style={styles.integrationName}>Push Notifications</div>
          <div style={styles.integrationStatus}>
            {config.pushSettings.subscribed ? 'Subscribed' : 'Not subscribed'}
          </div>
        </div>
        <button style={{ ...styles.button, ...styles.secondaryButton }}>
          {config.pushSettings.subscribed ? 'Manage' : 'Enable'}
        </button>
      </div>

      <div style={styles.integrationCard}>
        <div
          style={{
            ...styles.integrationIcon,
            backgroundColor: '#f3e8ff',
          }}
        >
          💼
        </div>
        <div style={styles.integrationInfo}>
          <div style={styles.integrationName}>Slack</div>
          <div style={styles.integrationStatus}>
            {config.slackSettings.connected
              ? `Connected to ${config.slackSettings.workspace}`
              : 'Not connected'}
          </div>
        </div>
        <button style={{ ...styles.button, ...styles.primaryButton }}>
          {config.slackSettings.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
};

// Reset Button
export const ResetButton: React.FC = () => {
  const { resetToDefaults } = useNotificationPreferences();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => {
            resetToDefaults();
            setConfirming(false);
          }}
          style={{ ...styles.button, ...styles.dangerButton }}
        >
          Confirm Reset
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ ...styles.button, ...styles.secondaryButton }}
    >
      Reset to Defaults
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type TabType = 'channels' | 'types' | 'schedule' | 'integrations';

export const NotificationPreferences: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('channels');
  const { config } = useNotificationPreferences();

  const tabs: { id: TabType; label: string }[] = [
    { id: 'channels', label: 'Channels' },
    { id: 'types', label: 'Notification Types' },
    { id: 'schedule', label: 'Schedule & Digest' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notification Preferences</h1>
          <p style={styles.subtitle}>Customize how and when you receive notifications</p>
        </div>
        <div style={styles.headerActions}>
          <ResetButton />
          <GlobalToggle />
        </div>
      </div>

      {!config.globalEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span>All notifications are currently disabled. Enable notifications to receive updates.</span>
        </motion.div>
      )}

      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'channels' && <ChannelSettingsGrid />}
            {activeTab === 'types' && <NotificationTypesList />}
            {activeTab === 'schedule' && (
              <>
                <DoNotDisturbSettings />
                <DigestSettingsPanel />
              </>
            )}
            {activeTab === 'integrations' && <IntegrationsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationPreferences;
