import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LockStatus = 'locked' | 'unlocked' | 'pending' | 'expired';
export type ContentType = 'post' | 'page' | 'media' | 'template' | 'menu' | 'widget';
export type LockAction = 'acquire' | 'release' | 'takeover' | 'extend' | 'expired';

export interface LockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface ContentLock {
  id: string;
  contentId: string;
  contentType: ContentType;
  contentTitle: string;
  status: LockStatus;
  lockedBy: LockUser;
  lockedAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  sessionId: string;
  isHeartbeatActive: boolean;
}

export interface LockHistory {
  id: string;
  lockId: string;
  action: LockAction;
  performedBy: LockUser;
  performedAt: Date;
  details?: string;
}

export interface LockConflict {
  id: string;
  contentId: string;
  contentTitle: string;
  currentLock: ContentLock;
  requestedBy: LockUser;
  requestedAt: Date;
  resolved: boolean;
  resolution?: 'takeover' | 'wait' | 'dismissed';
}

export interface ContentLockingConfig {
  lockDurationMinutes: number;
  heartbeatIntervalSeconds: number;
  warningThresholdMinutes: number;
  allowTakeover: boolean;
  requireConfirmation: boolean;
  autoReleaseOnIdle: boolean;
  idleTimeoutMinutes: number;
  showPresenceIndicators: boolean;
  notifyOnConflict: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ContentLockingContextType {
  locks: ContentLock[];
  myLocks: ContentLock[];
  conflicts: LockConflict[];
  history: LockHistory[];
  config: ContentLockingConfig;
  currentUser: LockUser | null;
  acquireLock: (contentId: string, contentType: ContentType, contentTitle: string) => Promise<ContentLock | null>;
  releaseLock: (lockId: string) => void;
  extendLock: (lockId: string) => void;
  takeoverLock: (lockId: string) => void;
  checkLock: (contentId: string) => ContentLock | null;
  resolveConflict: (conflictId: string, resolution: 'takeover' | 'wait' | 'dismissed') => void;
  updateConfig: (updates: Partial<ContentLockingConfig>) => void;
  setCurrentUser: (user: LockUser) => void;
}

const ContentLockingContext = createContext<ContentLockingContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface ContentLockingProviderProps {
  children: ReactNode;
  initialLocks?: ContentLock[];
  initialConfig?: Partial<ContentLockingConfig>;
  initialUser?: LockUser;
}

export const ContentLockingProvider: React.FC<ContentLockingProviderProps> = ({
  children,
  initialLocks = [],
  initialConfig = {},
  initialUser,
}) => {
  const [locks, setLocks] = useState<ContentLock[]>(initialLocks);
  const [conflicts, setConflicts] = useState<LockConflict[]>([]);
  const [history, setHistory] = useState<LockHistory[]>([]);
  const [currentUser, setCurrentUser] = useState<LockUser | null>(initialUser || null);
  const [config, setConfig] = useState<ContentLockingConfig>({
    lockDurationMinutes: 15,
    heartbeatIntervalSeconds: 30,
    warningThresholdMinutes: 2,
    allowTakeover: true,
    requireConfirmation: true,
    autoReleaseOnIdle: true,
    idleTimeoutMinutes: 10,
    showPresenceIndicators: true,
    notifyOnConflict: true,
    ...initialConfig,
  });

  const myLocks = locks.filter(lock => lock.lockedBy.id === currentUser?.id);

  const addHistoryEntry = useCallback((lockId: string, action: LockAction, details?: string) => {
    if (!currentUser) return;
    const entry: LockHistory = {
      id: `history-${Date.now()}`,
      lockId,
      action,
      performedBy: currentUser,
      performedAt: new Date(),
      details,
    };
    setHistory(prev => [entry, ...prev]);
  }, [currentUser]);

  const acquireLock = useCallback(async (
    contentId: string,
    contentType: ContentType,
    contentTitle: string
  ): Promise<ContentLock | null> => {
    if (!currentUser) return null;

    const existingLock = locks.find(l => l.contentId === contentId && l.status === 'locked');

    if (existingLock) {
      // Create conflict
      const conflict: LockConflict = {
        id: `conflict-${Date.now()}`,
        contentId,
        contentTitle,
        currentLock: existingLock,
        requestedBy: currentUser,
        requestedAt: new Date(),
        resolved: false,
      };
      setConflicts(prev => [...prev, conflict]);
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.lockDurationMinutes * 60 * 1000);

    const newLock: ContentLock = {
      id: `lock-${Date.now()}`,
      contentId,
      contentType,
      contentTitle,
      status: 'locked',
      lockedBy: currentUser,
      lockedAt: now,
      expiresAt,
      lastActivity: now,
      sessionId: `session-${Date.now()}`,
      isHeartbeatActive: true,
    };

    setLocks(prev => [...prev, newLock]);
    addHistoryEntry(newLock.id, 'acquire', `Acquired lock on "${contentTitle}"`);
    return newLock;
  }, [locks, currentUser, config.lockDurationMinutes, addHistoryEntry]);

  const releaseLock = useCallback((lockId: string) => {
    setLocks(prev => prev.map(lock =>
      lock.id === lockId
        ? { ...lock, status: 'unlocked' as LockStatus, isHeartbeatActive: false }
        : lock
    ));
    addHistoryEntry(lockId, 'release', 'Lock released');
  }, [addHistoryEntry]);

  const extendLock = useCallback((lockId: string) => {
    const now = new Date();
    const newExpiry = new Date(now.getTime() + config.lockDurationMinutes * 60 * 1000);

    setLocks(prev => prev.map(lock =>
      lock.id === lockId
        ? { ...lock, expiresAt: newExpiry, lastActivity: now }
        : lock
    ));
    addHistoryEntry(lockId, 'extend', `Lock extended for ${config.lockDurationMinutes} minutes`);
  }, [config.lockDurationMinutes, addHistoryEntry]);

  const takeoverLock = useCallback((lockId: string) => {
    if (!currentUser || !config.allowTakeover) return;

    const lock = locks.find(l => l.id === lockId);
    if (!lock) return;

    const now = new Date();
    const newExpiry = new Date(now.getTime() + config.lockDurationMinutes * 60 * 1000);

    setLocks(prev => prev.map(l =>
      l.id === lockId
        ? {
            ...l,
            lockedBy: currentUser,
            lockedAt: now,
            expiresAt: newExpiry,
            lastActivity: now,
            sessionId: `session-${Date.now()}`,
          }
        : l
    ));
    addHistoryEntry(lockId, 'takeover', `Lock taken over from ${lock.lockedBy.name}`);
  }, [locks, currentUser, config.allowTakeover, config.lockDurationMinutes, addHistoryEntry]);

  const checkLock = useCallback((contentId: string): ContentLock | null => {
    return locks.find(l => l.contentId === contentId && l.status === 'locked') || null;
  }, [locks]);

  const resolveConflict = useCallback((conflictId: string, resolution: 'takeover' | 'wait' | 'dismissed') => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    if (resolution === 'takeover') {
      takeoverLock(conflict.currentLock.id);
    }

    setConflicts(prev => prev.map(c =>
      c.id === conflictId
        ? { ...c, resolved: true, resolution }
        : c
    ));
  }, [conflicts, takeoverLock]);

  const updateConfig = useCallback((updates: Partial<ContentLockingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Check for expired locks
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLocks(prev => prev.map(lock => {
        if (lock.status === 'locked' && lock.expiresAt < now) {
          addHistoryEntry(lock.id, 'expired', 'Lock expired automatically');
          return { ...lock, status: 'expired' as LockStatus, isHeartbeatActive: false };
        }
        return lock;
      }));
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [addHistoryEntry]);

  return (
    <ContentLockingContext.Provider
      value={{
        locks,
        myLocks,
        conflicts,
        history,
        config,
        currentUser,
        acquireLock,
        releaseLock,
        extendLock,
        takeoverLock,
        checkLock,
        resolveConflict,
        updateConfig,
        setCurrentUser,
      }}
    >
      {children}
    </ContentLockingContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentLocking = (): ContentLockingContextType => {
  const context = useContext(ContentLockingContext);
  if (!context) {
    throw new Error('useContentLocking must be used within ContentLockingProvider');
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
  stats: {
    display: 'flex',
    gap: '24px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  lockList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  lockCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  lockIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  lockInfo: {
    flex: 1,
  },
  lockTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  lockMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
    fontSize: '13px',
    color: '#64748b',
  },
  lockUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
  lockActions: {
    display: 'flex',
    gap: '8px',
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
  warningButton: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  conflictCard: {
    padding: '20px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #fcd34d',
  },
  conflictHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  conflictIcon: {
    fontSize: '24px',
  },
  conflictTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#92400e',
  },
  conflictDetails: {
    fontSize: '14px',
    color: '#78350f',
    lineHeight: '1.6',
  },
  conflictActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  historyIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  historyMeta: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
  },
  settingsCard: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
  input: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '80px',
    textAlign: 'right' as const,
  },
  presenceIndicator: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#92400e',
  },
  presenceDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    animation: 'pulse 2s infinite',
  },
  expiryWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#fef2f2',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#dc2626',
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const getStatusColor = (status: LockStatus): string => {
  switch (status) {
    case 'locked': return '#22c55e';
    case 'unlocked': return '#64748b';
    case 'pending': return '#f59e0b';
    case 'expired': return '#ef4444';
    default: return '#64748b';
  }
};

const getStatusBg = (status: LockStatus): string => {
  switch (status) {
    case 'locked': return '#dcfce7';
    case 'unlocked': return '#f1f5f9';
    case 'pending': return '#fef3c7';
    case 'expired': return '#fef2f2';
    default: return '#f1f5f9';
  }
};

const getContentTypeIcon = (type: ContentType): string => {
  switch (type) {
    case 'post': return '📝';
    case 'page': return '📄';
    case 'media': return '🖼️';
    case 'template': return '🎨';
    case 'menu': return '📋';
    case 'widget': return '🧩';
    default: return '📄';
  }
};

const getActionIcon = (action: LockAction): string => {
  switch (action) {
    case 'acquire': return '🔒';
    case 'release': return '🔓';
    case 'takeover': return '⚡';
    case 'extend': return '⏱️';
    case 'expired': return '⏰';
    default: return '📋';
  }
};

const getActionColor = (action: LockAction): string => {
  switch (action) {
    case 'acquire': return '#22c55e';
    case 'release': return '#64748b';
    case 'takeover': return '#f59e0b';
    case 'extend': return '#3b82f6';
    case 'expired': return '#ef4444';
    default: return '#64748b';
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

const formatTimeRemaining = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (diff <= 0) return 'Expired';
  if (minutes < 1) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

// Lock Stats Component
export const LockStats: React.FC = () => {
  const { locks, myLocks, conflicts } = useContentLocking();

  const activeLocks = locks.filter(l => l.status === 'locked').length;
  const expiredLocks = locks.filter(l => l.status === 'expired').length;
  const activeConflicts = conflicts.filter(c => !c.resolved).length;

  return (
    <div style={styles.stats}>
      <div style={styles.statCard}>
        <span style={{ ...styles.statValue, color: '#22c55e' }}>{activeLocks}</span>
        <span style={styles.statLabel}>Active Locks</span>
      </div>
      <div style={styles.statCard}>
        <span style={{ ...styles.statValue, color: '#3b82f6' }}>{myLocks.length}</span>
        <span style={styles.statLabel}>My Locks</span>
      </div>
      <div style={styles.statCard}>
        <span style={{ ...styles.statValue, color: '#f59e0b' }}>{activeConflicts}</span>
        <span style={styles.statLabel}>Conflicts</span>
      </div>
      <div style={styles.statCard}>
        <span style={{ ...styles.statValue, color: '#ef4444' }}>{expiredLocks}</span>
        <span style={styles.statLabel}>Expired</span>
      </div>
    </div>
  );
};

// Lock Card Component
export const LockCard: React.FC<{ lock: ContentLock }> = ({ lock }) => {
  const { releaseLock, extendLock, takeoverLock, currentUser, config } = useContentLocking();
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(lock.expiresAt));

  const isOwner = lock.lockedBy.id === currentUser?.id;
  const isExpiringSoon = lock.expiresAt.getTime() - Date.now() < config.warningThresholdMinutes * 60 * 1000;

  useEffect(() => {
    if (lock.status !== 'locked') return;
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(lock.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [lock.expiresAt, lock.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.lockCard}
    >
      <div
        style={{
          ...styles.lockIcon,
          backgroundColor: getStatusBg(lock.status),
        }}
      >
        {getContentTypeIcon(lock.contentType)}
      </div>

      <div style={styles.lockInfo}>
        <div style={styles.lockTitle}>{lock.contentTitle}</div>
        <div style={styles.lockMeta}>
          <div style={styles.lockUser}>
            <div style={styles.avatar}>
              {lock.lockedBy.avatar ? (
                <img src={lock.lockedBy.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                lock.lockedBy.name.charAt(0).toUpperCase()
              )}
            </div>
            <span>{lock.lockedBy.name}</span>
          </div>
          <span>•</span>
          <span>{lock.contentType}</span>
          <span>•</span>
          <span>Locked {formatTimeAgo(lock.lockedAt)}</span>
        </div>

        {lock.status === 'locked' && isExpiringSoon && (
          <div style={{ ...styles.expiryWarning, marginTop: '8px' }}>
            <span>⚠️</span>
            <span>Expires in {timeRemaining}</span>
          </div>
        )}
      </div>

      <span
        style={{
          ...styles.badge,
          backgroundColor: getStatusBg(lock.status),
          color: getStatusColor(lock.status),
        }}
      >
        {lock.status}
      </span>

      {lock.status === 'locked' && (
        <div style={styles.lockActions}>
          {isOwner ? (
            <>
              <button
                onClick={() => extendLock(lock.id)}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Extend
              </button>
              <button
                onClick={() => releaseLock(lock.id)}
                style={{ ...styles.button, ...styles.dangerButton }}
              >
                Release
              </button>
            </>
          ) : config.allowTakeover && (
            <button
              onClick={() => takeoverLock(lock.id)}
              style={{ ...styles.button, ...styles.warningButton }}
            >
              Take Over
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Lock List Component
export const LockList: React.FC<{ filter?: 'all' | 'mine' | 'others' }> = ({ filter = 'all' }) => {
  const { locks, myLocks, currentUser } = useContentLocking();

  const filteredLocks = filter === 'mine'
    ? myLocks
    : filter === 'others'
      ? locks.filter(l => l.lockedBy.id !== currentUser?.id && l.status === 'locked')
      : locks.filter(l => l.status === 'locked');

  if (filteredLocks.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🔓</div>
        <div style={styles.emptyText}>No active locks</div>
      </div>
    );
  }

  return (
    <div style={styles.lockList}>
      <AnimatePresence>
        {filteredLocks.map(lock => (
          <LockCard key={lock.id} lock={lock} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Conflict Card Component
export const ConflictCard: React.FC<{ conflict: LockConflict }> = ({ conflict }) => {
  const { resolveConflict, config } = useContentLocking();

  if (conflict.resolved) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.conflictCard}
    >
      <div style={styles.conflictHeader}>
        <span style={styles.conflictIcon}>⚠️</span>
        <span style={styles.conflictTitle}>Lock Conflict</span>
      </div>

      <div style={styles.conflictDetails}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>{conflict.currentLock.lockedBy.name}</strong> is currently editing{' '}
          <strong>"{conflict.contentTitle}"</strong>
        </p>
        <p style={{ margin: 0 }}>
          Lock expires in {formatTimeRemaining(conflict.currentLock.expiresAt)}
        </p>
      </div>

      <div style={styles.conflictActions}>
        {config.allowTakeover && (
          <button
            onClick={() => resolveConflict(conflict.id, 'takeover')}
            style={{ ...styles.button, ...styles.warningButton }}
          >
            Take Over Lock
          </button>
        )}
        <button
          onClick={() => resolveConflict(conflict.id, 'wait')}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Wait for Release
        </button>
        <button
          onClick={() => resolveConflict(conflict.id, 'dismissed')}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
};

// Conflict List Component
export const ConflictList: React.FC = () => {
  const { conflicts } = useContentLocking();
  const activeConflicts = conflicts.filter(c => !c.resolved);

  if (activeConflicts.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>✅</div>
        <div style={styles.emptyText}>No lock conflicts</div>
      </div>
    );
  }

  return (
    <div style={styles.lockList}>
      <AnimatePresence>
        {activeConflicts.map(conflict => (
          <ConflictCard key={conflict.id} conflict={conflict} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// History Item Component
export const HistoryItem: React.FC<{ entry: LockHistory }> = ({ entry }) => {
  return (
    <div style={styles.historyItem}>
      <div
        style={{
          ...styles.historyIcon,
          backgroundColor: `${getActionColor(entry.action)}20`,
          color: getActionColor(entry.action),
        }}
      >
        {getActionIcon(entry.action)}
      </div>

      <div style={styles.historyContent}>
        <div style={styles.historyAction}>
          {entry.performedBy.name} - {entry.details || entry.action}
        </div>
        <div style={styles.historyMeta}>
          {formatTimeAgo(entry.performedAt)}
        </div>
      </div>
    </div>
  );
};

// History List Component
export const HistoryList: React.FC = () => {
  const { history } = useContentLocking();

  if (history.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📋</div>
        <div style={styles.emptyText}>No lock history</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px' }}>
      {history.slice(0, 20).map(entry => (
        <HistoryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

// Settings Toggle Component
const SettingToggle: React.FC<{
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, value, onChange }) => {
  return (
    <div style={styles.settingRow}>
      <div style={styles.settingInfo}>
        <div style={styles.settingLabel}>{label}</div>
        <div style={styles.settingDescription}>{description}</div>
      </div>
      <div
        style={{ ...styles.toggle, ...(value ? styles.toggleActive : {}) }}
        onClick={() => onChange(!value)}
      >
        <div style={{ ...styles.toggleKnob, ...(value ? styles.toggleKnobActive : {}) }} />
      </div>
    </div>
  );
};

// Settings Number Input Component
const SettingNumber: React.FC<{
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
}> = ({ label, description, value, onChange, unit }) => {
  return (
    <div style={styles.settingRow}>
      <div style={styles.settingInfo}>
        <div style={styles.settingLabel}>{label}</div>
        <div style={styles.settingDescription}>{description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          style={styles.input}
          min={1}
        />
        <span style={{ fontSize: '13px', color: '#64748b' }}>{unit}</span>
      </div>
    </div>
  );
};

// Lock Settings Component
export const LockSettings: React.FC = () => {
  const { config, updateConfig } = useContentLocking();

  return (
    <div style={styles.settingsCard}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
        Lock Settings
      </h3>

      <SettingNumber
        label="Lock Duration"
        description="How long content stays locked before automatic expiration"
        value={config.lockDurationMinutes}
        onChange={(value) => updateConfig({ lockDurationMinutes: value })}
        unit="minutes"
      />

      <SettingNumber
        label="Heartbeat Interval"
        description="How often to send keep-alive signals"
        value={config.heartbeatIntervalSeconds}
        onChange={(value) => updateConfig({ heartbeatIntervalSeconds: value })}
        unit="seconds"
      />

      <SettingNumber
        label="Warning Threshold"
        description="Show warning when lock is about to expire"
        value={config.warningThresholdMinutes}
        onChange={(value) => updateConfig({ warningThresholdMinutes: value })}
        unit="minutes"
      />

      <SettingToggle
        label="Allow Lock Takeover"
        description="Allow users to take over locks from others"
        value={config.allowTakeover}
        onChange={(value) => updateConfig({ allowTakeover: value })}
      />

      <SettingToggle
        label="Require Confirmation"
        description="Require confirmation before taking over locks"
        value={config.requireConfirmation}
        onChange={(value) => updateConfig({ requireConfirmation: value })}
      />

      <SettingToggle
        label="Auto-release on Idle"
        description="Automatically release locks when user is idle"
        value={config.autoReleaseOnIdle}
        onChange={(value) => updateConfig({ autoReleaseOnIdle: value })}
      />

      {config.autoReleaseOnIdle && (
        <SettingNumber
          label="Idle Timeout"
          description="Time of inactivity before lock is released"
          value={config.idleTimeoutMinutes}
          onChange={(value) => updateConfig({ idleTimeoutMinutes: value })}
          unit="minutes"
        />
      )}

      <SettingToggle
        label="Show Presence Indicators"
        description="Display real-time editing indicators"
        value={config.showPresenceIndicators}
        onChange={(value) => updateConfig({ showPresenceIndicators: value })}
      />

      <SettingToggle
        label="Notify on Conflict"
        description="Send notifications when lock conflicts occur"
        value={config.notifyOnConflict}
        onChange={(value) => updateConfig({ notifyOnConflict: value })}
      />
    </div>
  );
};

// Presence Indicator Component
export const PresenceIndicator: React.FC<{ lock: ContentLock }> = ({ lock }) => {
  if (lock.status !== 'locked') return null;

  return (
    <div style={styles.presenceIndicator}>
      <div style={styles.presenceDot} />
      <span>
        {lock.lockedBy.name} is editing
      </span>
    </div>
  );
};

// Quick Lock Button Component
export const QuickLockButton: React.FC<{
  contentId: string;
  contentType: ContentType;
  contentTitle: string;
}> = ({ contentId, contentType, contentTitle }) => {
  const { acquireLock, releaseLock, checkLock, currentUser } = useContentLocking();
  const [isLoading, setIsLoading] = useState(false);

  const currentLock = checkLock(contentId);
  const isOwner = currentLock?.lockedBy.id === currentUser?.id;
  const isLocked = currentLock !== null && currentLock.status === 'locked';

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isLocked && isOwner) {
        releaseLock(currentLock.id);
      } else if (!isLocked) {
        await acquireLock(contentId, contentType, contentTitle);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLocked && !isOwner) {
    return (
      <PresenceIndicator lock={currentLock} />
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        ...styles.button,
        ...(isLocked ? styles.dangerButton : styles.primaryButton),
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? '...' : isLocked ? '🔓 Release Lock' : '🔒 Lock for Editing'}
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type TabType = 'active' | 'mine' | 'conflicts' | 'history' | 'settings';

export const ContentLocking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { locks, myLocks, conflicts } = useContentLocking();

  const activeLocks = locks.filter(l => l.status === 'locked').length;
  const activeConflicts = conflicts.filter(c => !c.resolved).length;

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'active', label: 'Active Locks', count: activeLocks },
    { id: 'mine', label: 'My Locks', count: myLocks.length },
    { id: 'conflicts', label: 'Conflicts', count: activeConflicts },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Content Locking</h1>
          <p style={styles.subtitle}>Manage concurrent editing and prevent conflicts</p>
        </div>
        <LockStats />
      </div>

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
            {tab.count !== undefined && tab.count > 0 && (
              <span
                style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  fontSize: '11px',
                }}
              >
                {tab.count}
              </span>
            )}
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
            {activeTab === 'active' && <LockList filter="all" />}
            {activeTab === 'mine' && <LockList filter="mine" />}
            {activeTab === 'conflicts' && <ConflictList />}
            {activeTab === 'history' && <HistoryList />}
            {activeTab === 'settings' && <LockSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentLocking;
