import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PublishStatus = 'draft' | 'pending' | 'scheduled' | 'published' | 'private' | 'trash';
export type Visibility = 'public' | 'private' | 'password';

export interface PublishingData {
  status: PublishStatus;
  visibility: Visibility;
  password?: string;
  publishDate?: Date;
  scheduledDate?: Date;
  author: Author;
  slug: string;
  template?: string;
  sticky?: boolean;
  pendingReview?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface PublishingConfig {
  allowScheduling?: boolean;
  allowPasswordProtection?: boolean;
  allowPrivate?: boolean;
  allowSticky?: boolean;
  templates?: Template[];
  authors?: Author[];
  minScheduleDate?: Date;
  defaultStatus?: PublishStatus;
  showPermalink?: boolean;
  baseUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
}

interface PublishingContextType {
  data: PublishingData;
  setData: React.Dispatch<React.SetStateAction<PublishingData>>;
  config: PublishingConfig;
  updateField: <K extends keyof PublishingData>(field: K, value: PublishingData[K]) => void;
  publish: () => void;
  saveDraft: () => void;
  schedule: (date: Date) => void;
  unpublish: () => void;
  moveToTrash: () => void;
  isPublishing: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
  validationErrors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const PublishingContext = createContext<PublishingContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface PublishingProviderProps {
  children: React.ReactNode;
  initialData?: Partial<PublishingData>;
  initialConfig?: PublishingConfig;
  onPublish?: (data: PublishingData) => Promise<void>;
  onSaveDraft?: (data: PublishingData) => Promise<void>;
  onSchedule?: (data: PublishingData, date: Date) => Promise<void>;
  onStatusChange?: (status: PublishStatus) => void;
  onChange?: (data: PublishingData) => void;
}

export const PublishingProvider: React.FC<PublishingProviderProps> = ({
  children,
  initialData,
  initialConfig = {},
  onPublish,
  onSaveDraft,
  onSchedule,
  onStatusChange,
  onChange,
}) => {
  const [data, setData] = useState<PublishingData>({
    status: initialConfig.defaultStatus || 'draft',
    visibility: 'public',
    author: { id: '1', name: 'Current User' },
    slug: '',
    ...initialData,
  });

  const [config] = useState<PublishingConfig>({
    allowScheduling: true,
    allowPasswordProtection: true,
    allowPrivate: true,
    allowSticky: true,
    showPermalink: true,
    baseUrl: 'https://example.com',
    templates: [
      { id: 'default', name: 'Default Template' },
      { id: 'full-width', name: 'Full Width' },
      { id: 'sidebar', name: 'With Sidebar' },
    ],
    authors: [
      { id: '1', name: 'Current User', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
    ],
    ...initialConfig,
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    onChange?.(data);
  }, [data, onChange]);

  useEffect(() => {
    onStatusChange?.(data.status);
  }, [data.status, onStatusChange]);

  const updateField = useCallback(<K extends keyof PublishingData>(
    field: K,
    value: PublishingData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const validate = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    if (!data.slug) {
      errors.push({ field: 'slug', message: 'Permalink is required' });
    }

    if (data.visibility === 'password' && !data.password) {
      errors.push({ field: 'password', message: 'Password is required for password-protected posts' });
    }

    if (data.status === 'scheduled' && !data.scheduledDate) {
      errors.push({ field: 'scheduledDate', message: 'Scheduled date is required' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [data]);

  const publish = useCallback(async () => {
    if (!validate()) return;

    setIsPublishing(true);
    try {
      const publishData = { ...data, status: 'published' as PublishStatus, publishDate: new Date() };
      await onPublish?.(publishData);
      setData(publishData);
      setHasChanges(false);
      setLastSaved(new Date());
    } finally {
      setIsPublishing(false);
    }
  }, [data, validate, onPublish]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSaveDraft?.(data);
      setHasChanges(false);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [data, onSaveDraft]);

  const schedule = useCallback(async (date: Date) => {
    if (!validate()) return;

    setIsPublishing(true);
    try {
      const scheduleData = { ...data, status: 'scheduled' as PublishStatus, scheduledDate: date };
      await onSchedule?.(scheduleData, date);
      setData(scheduleData);
      setHasChanges(false);
      setLastSaved(new Date());
    } finally {
      setIsPublishing(false);
    }
  }, [data, validate, onSchedule]);

  const unpublish = useCallback(() => {
    setData(prev => ({ ...prev, status: 'draft' }));
    setHasChanges(true);
  }, []);

  const moveToTrash = useCallback(() => {
    setData(prev => ({ ...prev, status: 'trash' }));
    setHasChanges(true);
  }, []);

  return (
    <PublishingContext.Provider value={{
      data,
      setData,
      config,
      updateField,
      publish,
      saveDraft,
      schedule,
      unpublish,
      moveToTrash,
      isPublishing,
      isSaving,
      lastSaved,
      hasChanges,
      setHasChanges,
      validationErrors,
    }}>
      {children}
    </PublishingContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const usePublishing = (): PublishingContextType => {
  const context = useContext(PublishingContext);
  if (!context) {
    throw new Error('usePublishing must be used within a PublishingProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Status Badge
export const StatusBadge: React.FC<{ status: PublishStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const statusConfig: Record<PublishStatus, { label: string; color: string; icon: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: '📝' },
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⏳' },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: '📅' },
    published: { label: 'Published', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '✅' },
    private: { label: 'Private', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: '🔒' },
    trash: { label: 'Trashed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '🗑️' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${config.color} ${className}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

// Status Selector
export const StatusSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = usePublishing();
  const [isOpen, setIsOpen] = useState(false);

  const statuses: { value: PublishStatus; label: string; description: string }[] = [
    { value: 'draft', label: 'Draft', description: 'Save as a draft, not visible to the public' },
    { value: 'pending', label: 'Pending Review', description: 'Submit for editorial review' },
    { value: 'published', label: 'Published', description: 'Make visible to the public' },
  ];

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left"
      >
        <StatusBadge status={data.status} />
        <span className="text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  updateField('status', status.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  data.status === status.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">{status.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{status.description}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Visibility Selector
export const VisibilitySelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = usePublishing();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState(data.password || '');

  const visibilityOptions: { value: Visibility; label: string; icon: string; description: string }[] = [
    { value: 'public', label: 'Public', icon: '🌐', description: 'Visible to everyone' },
    ...(config.allowPrivate ? [{ value: 'private' as Visibility, label: 'Private', icon: '🔒', description: 'Only visible to site admins and editors' }] : []),
    ...(config.allowPasswordProtection ? [{ value: 'password' as Visibility, label: 'Password Protected', icon: '🔑', description: 'Protected with a password' }] : []),
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Visibility
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <span>{visibilityOptions.find(v => v.value === data.visibility)?.icon}</span>
          <span className="text-gray-900 dark:text-white">
            {visibilityOptions.find(v => v.value === data.visibility)?.label}
          </span>
        </div>
        <span className="text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {visibilityOptions.map((option) => (
              <div key={option.value}>
                <button
                  onClick={() => {
                    updateField('visibility', option.value);
                    if (option.value !== 'password') {
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 ${
                    data.visibility === option.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                  </div>
                </button>

                {option.value === 'password' && data.visibility === 'password' && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        updateField('password', e.target.value);
                      }}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Publish Date Selector
export const PublishDateSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = usePublishing();
  const [isOpen, setIsOpen] = useState(false);
  const [dateMode, setDateMode] = useState<'immediately' | 'schedule'>('immediately');
  const [selectedDate, setSelectedDate] = useState<string>(
    data.scheduledDate ? data.scheduledDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    data.scheduledDate ? data.scheduledDate.toTimeString().slice(0, 5) : '12:00'
  );

  if (!config.allowScheduling) return null;

  const handleSchedule = () => {
    const date = new Date(`${selectedDate}T${selectedTime}`);
    updateField('scheduledDate', date);
    updateField('status', 'scheduled');
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Publish
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <span>{data.status === 'scheduled' ? '📅' : '⏰'}</span>
          <span className="text-gray-900 dark:text-white">
            {data.status === 'scheduled' && data.scheduledDate
              ? formatDateTime(data.scheduledDate)
              : data.status === 'published' && data.publishDate
              ? `Published ${formatDateTime(data.publishDate)}`
              : 'Immediately'}
          </span>
        </div>
        <span className="text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setDateMode('immediately')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    dateMode === 'immediately'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Immediately
                </button>
                <button
                  onClick={() => setDateMode('schedule')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    dateMode === 'schedule'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Schedule
                </button>
              </div>

              {dateMode === 'schedule' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={config.minScheduleDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSchedule}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                </div>
              )}

              {dateMode === 'immediately' && (
                <button
                  onClick={() => {
                    updateField('scheduledDate', undefined);
                    if (data.status === 'scheduled') {
                      updateField('status', 'draft');
                    }
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Publish Immediately
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Author Selector
export const AuthorSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = usePublishing();
  const [isOpen, setIsOpen] = useState(false);

  if (!config.authors || config.authors.length <= 1) return null;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Author
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          {data.author.avatar ? (
            <img src={data.author.avatar} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
              {data.author.name[0]}
            </div>
          )}
          <span className="text-gray-900 dark:text-white">{data.author.name}</span>
        </div>
        <span className="text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {config.authors?.map((author) => (
              <button
                key={author.id}
                onClick={() => {
                  updateField('author', author);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${
                  data.author.id === author.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {author.avatar ? (
                  <img src={author.avatar} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {author.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{author.name}</div>
                  {author.email && (
                    <div className="text-sm text-gray-500">{author.email}</div>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Permalink Editor
export const PermalinkEditor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config, validationErrors } = usePublishing();
  const [isEditing, setIsEditing] = useState(false);
  const [slug, setSlug] = useState(data.slug);

  const error = validationErrors.find(e => e.field === 'slug');

  if (!config.showPermalink) return null;

  const handleSave = () => {
    const normalizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    updateField('slug', normalizedSlug);
    setSlug(normalizedSlug);
    setIsEditing(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Permalink
      </label>
      {isEditing ? (
        <div className="flex gap-2">
          <div className="flex-1 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
            <span className="px-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600">
              {config.baseUrl}/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent text-gray-900 dark:text-white outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => { setSlug(data.slug); setIsEditing(false); }}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={`w-full text-left px-3 py-2 border rounded-lg ${
            error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          }`}
        >
          <span className="text-gray-500 text-sm">{config.baseUrl}/</span>
          <span className="text-blue-600 dark:text-blue-400">
            {data.slug || 'add-permalink'}
          </span>
        </button>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

// Template Selector
export const TemplateSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = usePublishing();

  if (!config.templates || config.templates.length === 0) return null;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Template
      </label>
      <select
        value={data.template || ''}
        onChange={(e) => updateField('template', e.target.value || undefined)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="">Default Template</option>
        {config.templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Sticky Post Toggle
export const StickyToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField, config } = usePublishing();

  if (!config.allowSticky) return null;

  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={data.sticky || false}
          onChange={(e) => updateField('sticky', e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${
          data.sticky ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            data.sticky ? 'translate-x-4' : ''
          }`} />
        </div>
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Stick to top of blog
        </span>
        <p className="text-xs text-gray-500">
          Featured posts appear at the top of the blog page
        </p>
      </div>
    </label>
  );
};

// Pending Review Toggle
export const PendingReviewToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, updateField } = usePublishing();

  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={data.pendingReview || false}
        onChange={(e) => updateField('pendingReview', e.target.checked)}
        className="w-4 h-4 text-blue-600 rounded border-gray-300"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Pending review
      </span>
    </label>
  );
};

// Publish Actions
export const PublishActions: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data, publish, saveDraft, isPublishing, isSaving, hasChanges, lastSaved } = usePublishing();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary Action */}
      {data.status === 'published' ? (
        <button
          onClick={saveDraft}
          disabled={isSaving || !hasChanges}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? 'Updating...' : 'Update'}
        </button>
      ) : data.status === 'scheduled' ? (
        <button
          onClick={saveDraft}
          disabled={isSaving || !hasChanges}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? 'Updating...' : 'Update Schedule'}
        </button>
      ) : (
        <button
          onClick={publish}
          disabled={isPublishing}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>
      )}

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <button
          onClick={saveDraft}
          disabled={isSaving || !hasChanges}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          Preview
        </button>
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && (
        <p className="text-center text-xs text-gray-500">
          Last saved {formatDateTime(lastSaved)}
        </p>
      )}

      {hasChanges && (
        <p className="text-center text-xs text-yellow-600 dark:text-yellow-400">
          You have unsaved changes
        </p>
      )}
    </div>
  );
};

// Trash Action
export const TrashAction: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { moveToTrash, data } = usePublishing();
  const [showConfirm, setShowConfirm] = useState(false);

  if (data.status === 'trash') return null;

  return (
    <div className={className}>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
        >
          Move to Trash
        </button>
      ) : (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200 mb-2">
            Are you sure you want to move this to trash?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { moveToTrash(); setShowConfirm(false); }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Move to Trash
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 py-1.5 border border-red-300 text-red-700 dark:text-red-400 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PublishingPanel: React.FC<{
  initialData?: Partial<PublishingData>;
  initialConfig?: PublishingConfig;
  onPublish?: (data: PublishingData) => Promise<void>;
  onSaveDraft?: (data: PublishingData) => Promise<void>;
  onSchedule?: (data: PublishingData, date: Date) => Promise<void>;
  onStatusChange?: (status: PublishStatus) => void;
  onChange?: (data: PublishingData) => void;
  className?: string;
}> = ({
  initialData,
  initialConfig,
  onPublish,
  onSaveDraft,
  onSchedule,
  onStatusChange,
  onChange,
  className = '',
}) => {
  return (
    <PublishingProvider
      initialData={initialData}
      initialConfig={initialConfig}
      onPublish={onPublish}
      onSaveDraft={onSaveDraft}
      onSchedule={onSchedule}
      onStatusChange={onStatusChange}
      onChange={onChange}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Publish
            </h3>
            <PublishingStatusBadge />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <StatusSelector />
          <VisibilitySelector />
          <PublishDateSelector />
          <AuthorSelector />
          <PermalinkEditor />
          <TemplateSelector />
          <StickyToggle />
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <PublishActions />
          <TrashAction className="mt-4" />
        </div>
      </div>
    </PublishingProvider>
  );
};

// Status Badge within panel
const PublishingStatusBadge: React.FC = () => {
  const { data } = usePublishing();
  return <StatusBadge status={data.status} />;
};

export default PublishingPanel;
