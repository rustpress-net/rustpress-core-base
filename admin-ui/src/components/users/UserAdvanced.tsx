/**
 * RustPress User Advanced Features
 * Phase 4: Enhancements 17-20
 *
 * Enhancement 17: Login History
 * Enhancement 18: Account Deletion/Deactivation Flow
 * Enhancement 19: User Statistics Cards
 * Enhancement 20: User Export/Import Functionality
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Check,
  Trash2,
  UserX,
  UserMinus,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  Activity,
  Eye,
  FileText,
  MessageSquare,
  Heart,
  Shield,
  Lock,
  Mail,
  Zap,
  Award,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface LoginRecord {
  id: string;
  timestamp: string;
  ip: string;
  location?: {
    city?: string;
    country?: string;
    countryCode?: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  status: 'success' | 'failed' | 'blocked';
  failReason?: string;
}

export interface UserStatistic {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
  format?: 'number' | 'percentage' | 'currency';
}

export interface ExportOptions {
  format: 'json' | 'csv';
  includeFields: string[];
  dateRange?: { from?: string; to?: string };
  filters?: Record<string, any>;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

// ============================================================================
// Enhancement 17: Login History
// ============================================================================

interface LoginHistoryProps {
  records: LoginRecord[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  showFilters?: boolean;
}

export function LoginHistory({
  records,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  showFilters = true,
}: LoginHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'blocked'>('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter((r) => r.status === filter);
  }, [records, filter]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, LoginRecord[]> = {};

    filteredRecords.forEach((record) => {
      const date = new Date(record.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });

    return groups;
  }, [filteredRecords]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Successful',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Failed',
    },
    blocked: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Blocked',
    },
  };

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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <History className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Login History
            </h3>
            <p className="text-sm text-neutral-500">
              {records.length} login attempts recorded
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            {(['all', 'success', 'failed', 'blocked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  filter === status
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Records */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dateRecords]) => (
          <div key={date}>
            <h4 className="text-sm font-medium text-neutral-500 mb-3">{date}</h4>
            <div className="space-y-2">
              {dateRecords.map((record) => {
                const status = statusConfig[record.status];
                const StatusIcon = status.icon;
                const DeviceIcon = getDeviceIcon(record.device.type);
                const isExpanded = expandedRecord === record.id;

                return (
                  <div
                    key={record.id}
                    className={cn(
                      'rounded-xl border overflow-hidden transition-colors',
                      record.status === 'success'
                        ? 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                        : record.status === 'failed'
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                        : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                    )}
                  >
                    <button
                      onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <div className={cn('p-2 rounded-lg', status.bgColor)}>
                        <StatusIcon className={cn('w-4 h-4', status.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="w-4 h-4 text-neutral-500" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {record.device.browser} on {record.device.os}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              status.bgColor,
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(record.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {record.ip}
                          </span>
                          {record.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {record.location.city}, {record.location.country}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        className={cn(
                          'w-4 h-4 text-neutral-400 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-neutral-500">IP Address</p>
                                <p className="font-mono text-neutral-900 dark:text-white">
                                  {record.ip}
                                </p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Device Type</p>
                                <p className="text-neutral-900 dark:text-white capitalize">
                                  {record.device.type}
                                </p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Operating System</p>
                                <p className="text-neutral-900 dark:text-white">
                                  {record.device.os}
                                </p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Browser</p>
                                <p className="text-neutral-900 dark:text-white">
                                  {record.device.browser}
                                </p>
                              </div>
                              {record.location && (
                                <div className="col-span-2">
                                  <p className="text-neutral-500">Location</p>
                                  <p className="text-neutral-900 dark:text-white">
                                    {record.location.city}, {record.location.country}
                                  </p>
                                </div>
                              )}
                              {record.failReason && (
                                <div className="col-span-2">
                                  <p className="text-neutral-500">Failure Reason</p>
                                  <p className="text-red-600 dark:text-red-400">
                                    {record.failReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500">No login records found</p>
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
// Enhancement 18: Account Deletion/Deactivation Flow
// ============================================================================

interface AccountDeletionFlowProps {
  userName: string;
  onDeactivate: () => Promise<void>;
  onDelete: (password: string) => Promise<void>;
  onCancel: () => void;
}

export function AccountDeletionFlow({
  userName,
  onDeactivate,
  onDelete,
  onCancel,
}: AccountDeletionFlowProps) {
  const [step, setStep] = useState<'choose' | 'deactivate' | 'delete' | 'confirm'>('choose');
  const [action, setAction] = useState<'deactivate' | 'delete' | null>(null);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeactivate = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onDeactivate();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onDelete(password);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Account Settings
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Choose what you'd like to do with your account
              </p>
            </div>

            <div className="space-y-3">
              {/* Deactivate Option */}
              <button
                onClick={() => {
                  setAction('deactivate');
                  setStep('deactivate');
                }}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl',
                  'border border-neutral-200 dark:border-neutral-700',
                  'bg-white dark:bg-neutral-900',
                  'hover:border-yellow-300 dark:hover:border-yellow-700',
                  'text-left transition-colors'
                )}
              >
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <UserMinus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Deactivate Account
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Temporarily disable your account. You can reactivate it anytime by logging in.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 ml-auto mt-1" />
              </button>

              {/* Delete Option */}
              <button
                onClick={() => {
                  setAction('delete');
                  setStep('delete');
                }}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl',
                  'border border-neutral-200 dark:border-neutral-700',
                  'bg-white dark:bg-neutral-900',
                  'hover:border-red-300 dark:hover:border-red-700',
                  'text-left transition-colors'
                )}
              >
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Delete Account Permanently
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 ml-auto mt-1" />
              </button>
            </div>

            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {step === 'deactivate' && (
          <motion.div
            key="deactivate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <UserMinus className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Deactivate Account
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Your account will be temporarily disabled
              </p>
            </div>

            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                What happens when you deactivate:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Your profile will be hidden
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Your posts will remain visible
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  You can reactivate anytime
                </li>
              </ul>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Back
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isLoading}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl',
                  'text-sm font-medium',
                  'bg-yellow-600 text-white',
                  'hover:bg-yellow-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Deactivate Account'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'delete' && (
          <motion.div
            key="delete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Delete Account Permanently
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                This action cannot be undone
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                This will permanently delete:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Your profile and all personal data
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  All your posts and comments
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  All your uploaded media
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-900 dark:text-white font-mono',
                    'focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Enter your password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-900 dark:text-white',
                    'focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  )}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Back
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading || confirmText !== 'DELETE' || !password}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl',
                  'text-sm font-medium',
                  'bg-red-600 text-white',
                  'hover:bg-red-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account Forever'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 19: User Statistics Cards
// ============================================================================

interface UserStatisticsCardsProps {
  statistics: UserStatistic[];
  timeRange?: '7d' | '30d' | '90d' | 'all';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void;
}

export function UserStatisticsCards({
  statistics,
  timeRange = '30d',
  onTimeRangeChange,
}: UserStatisticsCardsProps) {
  const formatValue = (stat: UserStatistic) => {
    const { value, format } = stat;
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(value);
      default:
        return new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 0,
        }).format(value);
    }
  };

  const formatChange = (stat: UserStatistic) => {
    if (stat.change === undefined) return null;
    const sign = stat.change >= 0 ? '+' : '';
    return `${sign}${stat.change}%`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {onTimeRangeChange && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            User Statistics
          </h3>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                )}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statistics.map((stat) => {
          const Icon = stat.icon;
          const change = formatChange(stat);

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                {change && (
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      stat.changeType === 'increase'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : stat.changeType === 'decrease'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    )}
                  >
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    {change}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                {formatValue(stat)}
              </p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 20: User Export/Import Functionality
// ============================================================================

interface UserExportImportProps {
  onExport: (options: ExportOptions) => Promise<void>;
  onImport: (file: File, options: { updateExisting: boolean }) => Promise<ImportResult>;
  availableFields: { id: string; label: string; required?: boolean }[];
}

export function UserExportImport({
  onExport,
  onImport,
  availableFields,
}: UserExportImportProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('csv');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(availableFields.filter((f) => f.required).map((f) => f.id))
  );
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onExport({
        format: exportFormat,
        includeFields: Array.from(selectedFields),
        dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError('');
    setImportResult(null);
    try {
      const result = await onImport(importFile, { updateExisting });
      setImportResult(result);
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.csv'))) {
      setImportFile(file);
    }
  };

  const toggleField = (fieldId: string) => {
    const field = availableFields.find((f) => f.id === fieldId);
    if (field?.required) return;

    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 w-fit">
        <button
          onClick={() => setActiveTab('export')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'export'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'import'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Export Format
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={cn(
                    'flex items-center gap-3 flex-1 p-4 rounded-xl border transition-colors',
                    exportFormat === 'csv'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  )}
                >
                  <FileSpreadsheet
                    className={cn(
                      'w-6 h-6',
                      exportFormat === 'csv'
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-500'
                    )}
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      CSV
                    </p>
                    <p className="text-xs text-neutral-500">
                      Spreadsheet compatible
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setExportFormat('json')}
                  className={cn(
                    'flex items-center gap-3 flex-1 p-4 rounded-xl border transition-colors',
                    exportFormat === 'json'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  )}
                >
                  <FileJson
                    className={cn(
                      'w-6 h-6',
                      exportFormat === 'json'
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-500'
                    )}
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      JSON
                    </p>
                    <p className="text-xs text-neutral-500">
                      Developer friendly
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Fields to Export
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableFields.map((field) => (
                  <label
                    key={field.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                      field.required
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.has(field.id)}
                      onChange={() => toggleField(field.id)}
                      disabled={field.required}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {field.label}
                      {field.required && (
                        <span className="text-neutral-400 ml-1">(required)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Date Range (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateRange.from || ''}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className={cn(
                    'px-3 py-2 rounded-lg',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-sm text-neutral-900 dark:text-white'
                  )}
                />
                <span className="text-neutral-400">to</span>
                <input
                  type="date"
                  value={dateRange.to || ''}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className={cn(
                    'px-3 py-2 rounded-lg',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-sm text-neutral-900 dark:text-white'
                  )}
                />
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isLoading || selectedFields.size === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                'text-sm font-medium',
                'bg-primary-600 text-white',
                'hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Users
                </>
              )}
            </button>
          </motion.div>
        )}

        {activeTab === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* File Upload */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={cn(
                'p-8 rounded-xl border-2 border-dashed transition-colors text-center',
                importFile
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
              )}
            >
              {importFile ? (
                <div className="flex items-center justify-center gap-3">
                  {importFile.name.endsWith('.json') ? (
                    <FileJson className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <FileSpreadsheet className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {importFile.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setImportFile(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    Drop a file here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-neutral-400">
                    Supports CSV and JSON files
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            {/* Import Options */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Update existing users
                </p>
                <p className="text-xs text-neutral-500">
                  If a user with the same email exists, update their data
                </p>
              </div>
            </label>

            {/* Import Result */}
            {importResult && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Import completed
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      {importResult.total}
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">Total</p>
                  </div>
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      {importResult.created}
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">Created</p>
                  </div>
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      {importResult.updated}
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">Updated</p>
                  </div>
                  <div>
                    <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                      {importResult.skipped}
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">Skipped</p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                      {importResult.errors.length} error(s):
                    </p>
                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      {importResult.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>Row {err.row}: {err.message}</li>
                      ))}
                      {importResult.errors.length > 3 && (
                        <li>...and {importResult.errors.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={isLoading || !importFile}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                'text-sm font-medium',
                'bg-primary-600 text-white',
                'hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Users
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

export const sampleLoginHistory: LoginRecord[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    ip: '192.168.1.100',
    location: { city: 'San Francisco', country: 'United States', countryCode: 'US' },
    device: { type: 'desktop', os: 'macOS', browser: 'Chrome' },
    status: 'success',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: '192.168.1.101',
    location: { city: 'San Francisco', country: 'United States', countryCode: 'US' },
    device: { type: 'mobile', os: 'iOS', browser: 'Safari' },
    status: 'success',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip: '10.0.0.50',
    location: { city: 'New York', country: 'United States', countryCode: 'US' },
    device: { type: 'desktop', os: 'Windows', browser: 'Firefox' },
    status: 'failed',
    failReason: 'Invalid password',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    ip: '45.33.32.156',
    location: { city: 'Unknown', country: 'Unknown' },
    device: { type: 'desktop', os: 'Linux', browser: 'Unknown' },
    status: 'blocked',
    failReason: 'Suspicious IP address',
  },
];

export const sampleUserStatistics: UserStatistic[] = [
  {
    id: '1',
    label: 'Total Users',
    value: 1247,
    previousValue: 1180,
    change: 5.7,
    changeType: 'increase',
    icon: Users,
    color: '#8B5CF6',
  },
  {
    id: '2',
    label: 'New Users',
    value: 89,
    previousValue: 67,
    change: 32.8,
    changeType: 'increase',
    icon: UserPlus,
    color: '#22C55E',
  },
  {
    id: '3',
    label: 'Active Users',
    value: 892,
    previousValue: 923,
    change: -3.4,
    changeType: 'decrease',
    icon: Activity,
    color: '#3B82F6',
  },
  {
    id: '4',
    label: '2FA Enabled',
    value: 45,
    change: 8,
    changeType: 'increase',
    icon: Shield,
    color: '#F59E0B',
    format: 'percentage',
  },
];

export const sampleExportFields = [
  { id: 'id', label: 'ID', required: true },
  { id: 'email', label: 'Email', required: true },
  { id: 'username', label: 'Username' },
  { id: 'displayName', label: 'Display Name' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'role', label: 'Role' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'lastLogin', label: 'Last Login' },
  { id: 'phone', label: 'Phone' },
  { id: 'location', label: 'Location' },
];

export default LoginHistory;
