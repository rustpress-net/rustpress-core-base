import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ExpirationAction = 'draft' | 'private' | 'delete' | 'archive' | 'redirect' | 'custom';
export type ExpirationStatus = 'active' | 'expiring_soon' | 'expired' | 'never';

export interface ExpirationData {
  enabled: boolean;
  expirationDate?: Date;
  action: ExpirationAction;
  redirectUrl?: string;
  customMessage?: string;
  notifyBeforeDays?: number;
  notifyEmails?: string[];
  extendable?: boolean;
  extensionDays?: number;
}

export interface ExpirationConfig {
  allowDelete?: boolean;
  allowArchive?: boolean;
  allowRedirect?: boolean;
  allowCustomAction?: boolean;
  defaultAction?: ExpirationAction;
  defaultNotifyDays?: number;
  minExpirationDays?: number;
  maxExpirationDays?: number;
  showWarnings?: boolean;
}

export interface ExpiringContent {
  id: string;
  title: string;
  type: 'post' | 'page' | 'product' | 'event';
  expirationDate: Date;
  action: ExpirationAction;
  status: ExpirationStatus;
  daysRemaining: number;
}

interface ExpirationContextType {
  data: ExpirationData;
  setData: React.Dispatch<React.SetStateAction<ExpirationData>>;
  config: ExpirationConfig;
  updateField: <K extends keyof ExpirationData>(field: K, value: ExpirationData[K]) => void;
  getStatus: () => ExpirationStatus;
  getDaysRemaining: () => number | null;
  extendExpiration: (days: number) => void;
  clearExpiration: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ExpirationContext = createContext<ExpirationContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ExpirationProviderProps {
  children: React.ReactNode;
  initialData?: Partial<ExpirationData>;
  initialConfig?: ExpirationConfig;
  onChange?: (data: ExpirationData) => void;
  onExpire?: (action: ExpirationAction) => void;
}

export const ExpirationProvider: React.FC<ExpirationProviderProps> = ({
  children,
  initialData,
  initialConfig = {},
  onChange,
  onExpire,
}) => {
  const [data, setData] = useState<ExpirationData>({
    enabled: false,
    action: initialConfig.defaultAction || 'draft',
    notifyBeforeDays: initialConfig.defaultNotifyDays || 7,
    notifyEmails: [],
    extendable: true,
    extensionDays: 30,
    ...initialData,
  });

  const config: ExpirationConfig = {
    allowDelete: true,
    allowArchive: true,
    allowRedirect: true,
    allowCustomAction: true,
    defaultAction: 'draft',
    defaultNotifyDays: 7,
    minExpirationDays: 1,
    maxExpirationDays: 365,
    showWarnings: true,
    ...initialConfig,
  };

  useEffect(() => {
    onChange?.(data);
  }, [data, onChange]);

  useEffect(() => {
    if (data.enabled && data.expirationDate) {
      const now = new Date();
      if (new Date(data.expirationDate) <= now) {
        onExpire?.(data.action);
      }
    }
  }, [data.enabled, data.expirationDate, data.action, onExpire]);

  const updateField = useCallback(<K extends keyof ExpirationData>(
    field: K,
    value: ExpirationData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const getStatus = useCallback((): ExpirationStatus => {
    if (!data.enabled || !data.expirationDate) return 'never';

    const now = new Date();
    const expDate = new Date(data.expirationDate);
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'expired';
    if (diffDays <= (data.notifyBeforeDays || 7)) return 'expiring_soon';
    return 'active';
  }, [data]);

  const getDaysRemaining = useCallback((): number | null => {
    if (!data.enabled || !data.expirationDate) return null;

    const now = new Date();
    const expDate = new Date(data.expirationDate);
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [data]);

  const extendExpiration = useCallback((days: number) => {
    if (!data.expirationDate) return;

    const currentDate = new Date(data.expirationDate);
    currentDate.setDate(currentDate.getDate() + days);

    setData(prev => ({
      ...prev,
      expirationDate: currentDate,
    }));
  }, [data.expirationDate]);

  const clearExpiration = useCallback(() => {
    setData(prev => ({
      ...prev,
      enabled: false,
      expirationDate: undefined,
    }));
  }, []);

  return (
    <ExpirationContext.Provider value={{
      data,
      setData,
      config,
      updateField,
      getStatus,
      getDaysRemaining,
      extendExpiration,
      clearExpiration,
    }}>
      {children}
    </ExpirationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useExpiration = (): ExpirationContextType => {
  const context = useContext(ExpirationContext);
  if (!context) {
    throw new Error('useExpiration must be used within a ExpirationProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRelativeTime = (days: number): string => {
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.ceil(days / 7)} weeks`;
  if (days < 365) return `In ${Math.ceil(days / 30)} months`;
  return `In ${Math.ceil(days / 365)} years`;
};

const actionDetails: Record<ExpirationAction, { icon: string; label: string; description: string; color: string }> = {
  draft: { icon: '📝', label: 'Revert to Draft', description: 'Content will be unpublished and saved as draft', color: 'gray' },
  private: { icon: '🔒', label: 'Make Private', description: 'Content will only be visible to admins', color: 'purple' },
  delete: { icon: '🗑️', label: 'Move to Trash', description: 'Content will be moved to trash (can be restored)', color: 'red' },
  archive: { icon: '📦', label: 'Archive', description: 'Content will be archived and hidden from listings', color: 'yellow' },
  redirect: { icon: '↪️', label: 'Redirect', description: 'Visitors will be redirected to another URL', color: 'blue' },
  custom: { icon: '⚙️', label: 'Custom Action', description: 'Display a custom message to visitors', color: 'green' },
};

const statusStyles: Record<ExpirationStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-400' },
  expiring_soon: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-400' },
  expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-400' },
  never: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-400' },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Expiration Toggle
export const ExpirationToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = useExpiration();

  return (
    <label className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏰</span>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">Content Expiration</div>
          <div className="text-sm text-gray-500">Automatically change content status after a date</div>
        </div>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => updateField('enabled', e.target.checked)}
          className="sr-only"
        />
        <div className={`w-12 h-7 rounded-full transition-colors ${
          data.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}>
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${
            data.enabled ? 'translate-x-5' : ''
          }`} />
        </div>
      </div>
    </label>
  );
};

// Expiration Date Picker
export const ExpirationDatePicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config, getDaysRemaining, getStatus } = useExpiration();

  if (!data.enabled) return null;

  const daysRemaining = getDaysRemaining();
  const status = getStatus();
  const statusStyle = statusStyles[status];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + (config.minExpirationDays || 1));

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (config.maxExpirationDays || 365));

  const presetDays = [7, 14, 30, 60, 90, 180, 365];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Expiration Date
      </label>

      <div className="flex gap-2 mb-3">
        <input
          type="datetime-local"
          value={data.expirationDate
            ? new Date(data.expirationDate).toISOString().slice(0, 16)
            : ''
          }
          onChange={(e) => updateField('expirationDate', e.target.value ? new Date(e.target.value) : undefined)}
          min={minDate.toISOString().slice(0, 16)}
          max={maxDate.toISOString().slice(0, 16)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Quick Select */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presetDays.map((days) => (
          <button
            key={days}
            onClick={() => {
              const date = new Date();
              date.setDate(date.getDate() + days);
              updateField('expirationDate', date);
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Status Display */}
      {data.expirationDate && (
        <div className={`p-3 rounded-lg ${statusStyle.bg} ${statusStyle.text}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">
                {status === 'expired' ? 'Expired' :
                 status === 'expiring_soon' ? 'Expiring Soon' : 'Expires'}
              </span>
              {' '}
              <span>
                {daysRemaining !== null && formatRelativeTime(daysRemaining)}
              </span>
            </div>
            <span className="text-sm opacity-75">
              {formatDate(new Date(data.expirationDate))}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Expiration Action Selector
export const ExpirationActionSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = useExpiration();

  if (!data.enabled) return null;

  const availableActions: ExpirationAction[] = [
    'draft',
    'private',
    ...(config.allowDelete ? ['delete' as ExpirationAction] : []),
    ...(config.allowArchive ? ['archive' as ExpirationAction] : []),
    ...(config.allowRedirect ? ['redirect' as ExpirationAction] : []),
    ...(config.allowCustomAction ? ['custom' as ExpirationAction] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Action on Expiration
      </label>

      <div className="space-y-2">
        {availableActions.map((action) => {
          const details = actionDetails[action];
          const isSelected = data.action === action;

          return (
            <label
              key={action}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="expirationAction"
                value={action}
                checked={isSelected}
                onChange={() => updateField('action', action)}
                className="sr-only"
              />
              <span className="text-xl">{details.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{details.label}</div>
                <div className="text-sm text-gray-500">{details.description}</div>
              </div>
              {isSelected && <span className="text-blue-600">✓</span>}
            </label>
          );
        })}
      </div>
    </motion.div>
  );
};

// Redirect URL Input
export const RedirectUrlInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = useExpiration();

  if (!data.enabled || data.action !== 'redirect') return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Redirect URL
      </label>
      <input
        type="url"
        value={data.redirectUrl || ''}
        onChange={(e) => updateField('redirectUrl', e.target.value)}
        placeholder="https://example.com/new-page"
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <p className="mt-1 text-xs text-gray-500">
        Visitors will be redirected to this URL after expiration
      </p>
    </motion.div>
  );
};

// Custom Message Input
export const CustomMessageInput: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = useExpiration();

  if (!data.enabled || data.action !== 'custom') return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={className}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Custom Expiration Message
      </label>
      <textarea
        value={data.customMessage || ''}
        onChange={(e) => updateField('customMessage', e.target.value)}
        placeholder="This content is no longer available..."
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
      />
      <p className="mt-1 text-xs text-gray-500">
        This message will be displayed to visitors after expiration
      </p>
    </motion.div>
  );
};

// Notification Settings
export const NotificationSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = useExpiration();
  const [emailInput, setEmailInput] = useState('');

  if (!data.enabled) return null;

  const addEmail = () => {
    if (emailInput && !data.notifyEmails?.includes(emailInput)) {
      updateField('notifyEmails', [...(data.notifyEmails || []), emailInput]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    updateField('notifyEmails', data.notifyEmails?.filter(e => e !== email) || []);
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
          Notify Before Expiration
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.notifyBeforeDays || 7}
            onChange={(e) => updateField('notifyBeforeDays', parseInt(e.target.value) || 7)}
            min={1}
            max={30}
            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-600 dark:text-gray-400">days before expiration</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notification Recipients
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && addEmail()}
          />
          <button
            onClick={addEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        {data.notifyEmails && data.notifyEmails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.notifyEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Extension Settings
export const ExtensionSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, extendExpiration } = useExpiration();

  if (!data.enabled || !data.extendable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Quick Extend</h4>
          <p className="text-sm text-gray-500">Extend the expiration date</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[7, 14, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => extendExpiration(days)}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            +{days} days
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// Expiration Status Badge
export const ExpirationStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, getStatus, getDaysRemaining } = useExpiration();

  if (!data.enabled) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${className}`}>
        <span>∞</span>
        No Expiration
      </span>
    );
  }

  const status = getStatus();
  const daysRemaining = getDaysRemaining();
  const style = statusStyles[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text} ${className}`}>
      <span>⏰</span>
      {status === 'expired'
        ? 'Expired'
        : status === 'expiring_soon'
        ? `Expires in ${daysRemaining} days`
        : `Expires in ${daysRemaining} days`}
    </span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExpirationManager: React.FC<{
  initialData?: Partial<ExpirationData>;
  initialConfig?: ExpirationConfig;
  onChange?: (data: ExpirationData) => void;
  onExpire?: (action: ExpirationAction) => void;
  className?: string;
}> = ({
  initialData,
  initialConfig,
  onChange,
  onExpire,
  className = '',
}) => {
  return (
    <ExpirationProvider
      initialData={initialData}
      initialConfig={initialConfig}
      onChange={onChange}
      onExpire={onExpire}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Content Expiration
            </h3>
            <ExpirationStatusBadge />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <ExpirationToggle />

          <AnimatePresence>
            <ExpirationDatePicker />
            <ExpirationActionSelector />
            <RedirectUrlInput />
            <CustomMessageInput />
            <NotificationSettings />
            <ExtensionSettings />
          </AnimatePresence>
        </div>
      </div>
    </ExpirationProvider>
  );
};

export default ExpirationManager;
