/**
 * RustPress User Management Components
 * Phase 3: Enhancements 11-16
 *
 * Enhancement 11: User Search & Filter
 * Enhancement 12: User List Table
 * Enhancement 13: User Quick Actions Menu
 * Enhancement 14: Bulk User Operations Toolbar
 * Enhancement 15: User Invite Modal
 * Enhancement 16: User Role Editor
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  Users,
  Mail,
  Send,
  Trash2,
  Edit3,
  Eye,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
  Copy,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Settings,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import type { UserProfile, UserRole } from './UserProfile';

// ============================================================================
// Types
// ============================================================================

export interface UserFilters {
  search: string;
  status: string[];
  roles: string[];
  dateRange: { from?: string; to?: string };
  verified: 'all' | 'verified' | 'unverified';
  twoFactor: 'all' | 'enabled' | 'disabled';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  variant?: 'default' | 'danger';
  requiresConfirmation?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// ============================================================================
// Enhancement 11: User Search & Filter
// ============================================================================

interface UserSearchFilterProps {
  filters: UserFilters;
  onFilterChange: (filters: UserFilters) => void;
  availableRoles: UserRole[];
  onClearFilters: () => void;
}

export function UserSearchFilter({
  filters,
  onFilterChange,
  availableRoles,
  onClearFilters,
}: UserSearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.roles.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.verified !== 'all') count++;
    if (filters.twoFactor !== 'all') count++;
    return count;
  }, [filters]);

  const updateFilter = <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: 'status' | 'roles',
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search users by name, email, or username..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white',
              'placeholder-neutral-400',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'border transition-colors',
            showAdvanced || activeFilterCount > 0
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
              : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-500 text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {['active', 'inactive', 'pending', 'suspended'].map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleArrayFilter('status', status)}
                          className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Role
                  </label>
                  <div className="space-y-2">
                    {availableRoles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.roles.includes(role.id)}
                          onChange={() => toggleArrayFilter('roles', role.id)}
                          className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: role.color }}
                        >
                          {role.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Email Verified
                  </label>
                  <div className="space-y-2">
                    {(['all', 'verified', 'unverified'] as const).map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="verified"
                          checked={filters.verified === option}
                          onChange={() => updateFilter('verified', option)}
                          className="w-4 h-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">
                          {option === 'all' ? 'All' : option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2FA Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Two-Factor Auth
                  </label>
                  <div className="space-y-2">
                    {(['all', 'enabled', 'disabled'] as const).map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="twoFactor"
                          checked={filters.twoFactor === option}
                          onChange={() => updateFilter('twoFactor', option)}
                          className="w-4 h-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">
                          {option === 'all' ? 'All' : option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Registration Date
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={filters.dateRange.from || ''}
                    onChange={(e) =>
                      updateFilter('dateRange', {
                        ...filters.dateRange,
                        from: e.target.value,
                      })
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
                    value={filters.dateRange.to || ''}
                    onChange={(e) =>
                      updateFilter('dateRange', {
                        ...filters.dateRange,
                        to: e.target.value,
                      })
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

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClearFilters}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 12: User List Table
// ============================================================================

interface UserListTableProps {
  users: UserProfile[];
  selectedUsers: Set<string>;
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  sort: SortConfig;
  onSort: (field: string) => void;
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  onUserClick: (user: UserProfile) => void;
  isLoading?: boolean;
}

export function UserListTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  sort,
  onSort,
  pagination,
  onPageChange,
  onUserClick,
  isLoading = false,
}: UserListTableProps) {
  const allSelected = users.length > 0 && users.every((u) => selectedUsers.has(u.id));
  const someSelected = users.some((u) => selectedUsers.has(u.id)) && !allSelected;

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    inactive: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    suspended: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-neutral-400" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-primary-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary-500" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('displayName')}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  User
                  <SortIcon field="displayName" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('role')}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Role
                  <SortIcon field="role" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('status')}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Security
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('createdAt')}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Joined
                  <SortIcon field="createdAt" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('lastLogin')}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Last Login
                  <SortIcon field="lastLogin" />
                </button>
              </th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary-500 animate-spin" />
                  <p className="text-sm text-neutral-500">Loading users...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                  <p className="text-sm text-neutral-500">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
                    selectedUsers.has(user.id) && 'bg-primary-50 dark:bg-primary-900/10'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => onSelectUser(user.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onUserClick(user)}
                      className="flex items-center gap-3 text-left"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${user.role.color}20`,
                        color: user.role.color,
                      }}
                    >
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        statusColors[user.status]
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.emailVerified && (
                        <span
                          className="p-1 rounded-lg bg-green-100 dark:bg-green-900/30"
                          title="Email verified"
                        >
                          <Mail className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </span>
                      )}
                      {user.twoFactorEnabled && (
                        <span
                          className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30"
                          title="2FA enabled"
                        >
                          <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <UserQuickActionsMenu
                      user={user}
                      onEdit={() => {}}
                      onView={() => onUserClick(user)}
                      onSuspend={() => {}}
                      onDelete={() => {}}
                      onResetPassword={() => {}}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing{' '}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={cn(
                'p-2 rounded-lg',
                'text-neutral-600 dark:text-neutral-400',
                'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium',
                    pagination.page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className={cn(
                'p-2 rounded-lg',
                'text-neutral-600 dark:text-neutral-400',
                'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Enhancement 13: User Quick Actions Menu
// ============================================================================

interface UserQuickActionsMenuProps {
  user: UserProfile;
  onView: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
}

export function UserQuickActionsMenu({
  user,
  onView,
  onEdit,
  onSuspend,
  onDelete,
  onResetPassword,
}: UserQuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const actions = [
    { id: 'view', label: 'View Profile', icon: Eye, onClick: onView },
    { id: 'edit', label: 'Edit User', icon: Edit3, onClick: onEdit },
    { id: 'reset', label: 'Reset Password', icon: Lock, onClick: onResetPassword },
    { id: 'divider' },
    {
      id: 'suspend',
      label: user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User',
      icon: user.status === 'suspended' ? UserCheck : UserX,
      onClick: onSuspend,
      variant: user.status === 'suspended' ? 'default' : 'warning',
    },
    { id: 'delete', label: 'Delete User', icon: Trash2, onClick: onDelete, variant: 'danger' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 rounded-lg',
          'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors'
        )}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={cn(
                'absolute right-0 top-full mt-1 w-48 z-20',
                'py-2 rounded-xl',
                'bg-white dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-lg'
              )}
            >
              {actions.map((action) => {
                if (action.id === 'divider') {
                  return (
                    <div
                      key={action.id}
                      className="my-2 border-t border-neutral-100 dark:border-neutral-800"
                    />
                  );
                }

                const Icon = action.icon!;
                const variant = action.variant || 'default';

                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2',
                      'text-sm text-left',
                      'transition-colors',
                      variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : variant === 'warning'
                        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 14: Bulk User Operations Toolbar
// ============================================================================

interface BulkOperationsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (actionId: string) => void;
  actions: BulkAction[];
}

export function BulkOperationsToolbar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  actions,
}: BulkOperationsToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-3 rounded-2xl',
          'bg-neutral-900 dark:bg-neutral-800',
          'border border-neutral-700',
          'shadow-2xl'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-primary-500 text-white text-sm font-medium">
            {selectedCount}
          </span>
          <span className="text-sm text-neutral-300">selected</span>
        </div>

        <div className="h-6 w-px bg-neutral-700" />

        <div className="flex items-center gap-2">
          {actions.map((action) => {
            const Icon = action.icon;

            if (action.requiresConfirmation && confirmAction === action.id) {
              return (
                <div key={action.id} className="flex items-center gap-2">
                  <span className="text-sm text-neutral-300">Confirm?</span>
                  <button
                    onClick={() => {
                      onBulkAction(action.id);
                      setConfirmAction(null);
                    }}
                    className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="p-2 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={action.id}
                onClick={() =>
                  action.requiresConfirmation
                    ? setConfirmAction(action.id)
                    : onBulkAction(action.id)
                }
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'text-sm font-medium',
                  'transition-colors',
                  action.variant === 'danger'
                    ? 'text-red-400 hover:bg-red-900/30'
                    : 'text-neutral-300 hover:bg-neutral-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-neutral-700" />

        <button
          onClick={onClearSelection}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Enhancement 15: User Invite Modal
// ============================================================================

interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; role: string; message?: string }) => Promise<void>;
  availableRoles: UserRole[];
}

export function UserInviteModal({
  isOpen,
  onClose,
  onInvite,
  availableRoles,
}: UserInviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(availableRoles[0]?.id || '');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    if (!role) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite({ email, role, message: message || undefined });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole(availableRoles[0]?.id || '');
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
          >
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Invitation Sent!
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  An invitation email has been sent to {email}
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                      <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Invite User
                    </h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className={cn(
                        'w-full px-4 py-2.5 rounded-xl',
                        'border border-neutral-300 dark:border-neutral-600',
                        'bg-white dark:bg-neutral-800',
                        'text-neutral-900 dark:text-white',
                        'placeholder-neutral-400',
                        'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Role *
                    </label>
                    <div className="space-y-2">
                      {availableRoles.map((r) => (
                        <label
                          key={r.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
                            'border transition-colors',
                            role === r.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                          )}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={r.id}
                            checked={role === r.id}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-4 h-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p
                              className="text-sm font-medium"
                              style={{ color: r.color }}
                            >
                              {r.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {r.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message to the invitation..."
                      rows={3}
                      className={cn(
                        'w-full px-4 py-2.5 rounded-xl',
                        'border border-neutral-300 dark:border-neutral-600',
                        'bg-white dark:bg-neutral-800',
                        'text-neutral-900 dark:text-white',
                        'placeholder-neutral-400 resize-none',
                        'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      )}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl',
                        'text-sm font-medium',
                        'bg-primary-600 text-white',
                        'hover:bg-primary-700',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Invitation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Enhancement 16: User Role Editor
// ============================================================================

interface RoleEditorProps {
  role?: UserRole;
  allPermissions: Permission[];
  onSave: (role: Omit<UserRole, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleEditor({
  role,
  allPermissions,
  onSave,
  onCancel,
  isLoading = false,
}: RoleEditorProps) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [color, setColor] = useState(role?.color || '#8B5CF6');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role?.permissions || [])
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    const categoryPerms = groupedPermissions[category]?.map((p) => p.id) || [];
    const allSelected = categoryPerms.every((id) => selectedPermissions.has(id));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      categoryPerms.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Role name is required';
    }
    if (selectedPermissions.size === 0) {
      newErrors.permissions = 'Select at least one permission';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: role?.id,
      name,
      description,
      color,
      permissions: Array.from(selectedPermissions),
    });
  };

  const presetColors = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Role Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Editor, Moderator"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'border transition-colors',
                errors.name
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-transform',
                      color === c && 'ring-2 ring-offset-2 ring-neutral-400 scale-110'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this role can do..."
            rows={2}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white',
              'placeholder-neutral-400 resize-none',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Permissions
          </h3>
          <span className="text-sm text-neutral-500">
            {selectedPermissions.size} of {allPermissions.length} selected
          </span>
        </div>

        {errors.permissions && (
          <p className="text-sm text-red-600">{errors.permissions}</p>
        )}

        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, perms]) => {
            const allSelected = perms.every((p) => selectedPermissions.has(p.id));
            const someSelected = perms.some((p) => selectedPermissions.has(p.id)) && !allSelected;

            return (
              <div
                key={category}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {category}
                  </span>
                </div>
                <div className="p-3 space-y-2 bg-white dark:bg-neutral-900">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.has(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {perm.name}
                        </p>
                        <p className="text-xs text-neutral-500">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'text-sm font-medium',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {role ? 'Update Role' : 'Create Role'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

export const sampleUsers: UserProfile[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    role: { id: 'admin', name: 'Administrator', color: '#8B5CF6', permissions: ['all'] },
    status: 'active',
    createdAt: '2023-06-15T10:30:00Z',
    lastLogin: '2024-01-15T14:22:00Z',
    twoFactorEnabled: true,
    emailVerified: true,
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    displayName: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: { id: 'editor', name: 'Editor', color: '#3B82F6', permissions: ['posts.create', 'posts.edit'] },
    status: 'active',
    createdAt: '2023-08-22T09:15:00Z',
    lastLogin: '2024-01-14T11:45:00Z',
    twoFactorEnabled: false,
    emailVerified: true,
  },
  {
    id: '3',
    email: 'bob.wilson@example.com',
    username: 'bobwilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    displayName: 'Bob Wilson',
    role: { id: 'author', name: 'Author', color: '#22C55E', permissions: ['posts.create'] },
    status: 'pending',
    createdAt: '2024-01-10T16:00:00Z',
    twoFactorEnabled: false,
    emailVerified: false,
  },
  {
    id: '4',
    email: 'alice.johnson@example.com',
    username: 'alicejohnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    displayName: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    role: { id: 'moderator', name: 'Moderator', color: '#F59E0B', permissions: ['comments.moderate'] },
    status: 'suspended',
    createdAt: '2023-09-05T13:30:00Z',
    lastLogin: '2023-12-20T08:00:00Z',
    twoFactorEnabled: true,
    emailVerified: true,
  },
];

export const sampleRoles: UserRole[] = [
  { id: 'admin', name: 'Administrator', description: 'Full access to all features', color: '#8B5CF6', permissions: ['all'] },
  { id: 'editor', name: 'Editor', description: 'Can manage and publish content', color: '#3B82F6', permissions: ['posts.create', 'posts.edit', 'posts.delete', 'posts.publish'] },
  { id: 'author', name: 'Author', description: 'Can create and edit own content', color: '#22C55E', permissions: ['posts.create', 'posts.edit'] },
  { id: 'moderator', name: 'Moderator', description: 'Can moderate comments', color: '#F59E0B', permissions: ['comments.moderate'] },
  { id: 'subscriber', name: 'Subscriber', description: 'Basic read access', color: '#6B7280', permissions: ['posts.read'] },
];

export const sampleBulkActions: BulkAction[] = [
  { id: 'activate', label: 'Activate', icon: UserCheck },
  { id: 'deactivate', label: 'Deactivate', icon: UserMinus },
  { id: 'change-role', label: 'Change Role', icon: Award },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'delete', label: 'Delete', icon: Trash2, variant: 'danger', requiresConfirmation: true },
];

export default UserListTable;
