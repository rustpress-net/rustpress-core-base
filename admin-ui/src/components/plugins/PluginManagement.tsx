/**
 * RustPress Plugin Installation & Management System
 * Phase 4: Enhancements 29-38
 *
 * Enhancement 29: Installation Progress UI
 * Enhancement 30: Dependency Resolver
 * Enhancement 31: Bulk Actions Toolbar
 * Enhancement 32: Update Manager
 * Enhancement 33: Rollback System
 * Enhancement 34: License Management
 * Enhancement 35: Plugin Health Monitor
 * Enhancement 36: Conflict Detection
 * Enhancement 37: Safe Mode Toggle
 * Enhancement 38: Plugin Import/Export
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Power,
  PowerOff,
  Upload,
  FileDown,
  FileUp,
  Shield,
  Key,
  Activity,
  Heart,
  Cpu,
  Database,
  HardDrive,
  Clock,
  Calendar,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  X,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  Zap,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  GitBranch,
  History,
  Archive,
  Box,
  Layers,
  Link,
  Unlink,
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ServerCrash,
  Bug,
  Wrench,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface InstallationStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  progress?: number;
  message?: string;
  duration?: number;
}

export interface PluginDependency {
  id: string;
  name: string;
  version: string;
  requiredVersion: string;
  type: 'required' | 'optional' | 'dev';
  status: 'installed' | 'missing' | 'outdated' | 'incompatible';
  size?: string;
}

export interface PluginUpdate {
  pluginId: string;
  pluginName: string;
  currentVersion: string;
  newVersion: string;
  releaseDate: string;
  changelogUrl?: string;
  isBreaking?: boolean;
  isSecurity?: boolean;
  size: string;
}

export interface PluginVersion {
  version: string;
  date: string;
  isActive: boolean;
  size: string;
  isCurrent?: boolean;
}

export interface PluginLicense {
  id: string;
  key: string;
  status: 'active' | 'expired' | 'invalid' | 'trial';
  type: 'personal' | 'business' | 'enterprise' | 'lifetime';
  expiresAt?: string;
  activationsUsed: number;
  activationsLimit: number;
  features: string[];
}

export interface PluginHealthStatus {
  pluginId: string;
  pluginName: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    uptime: number;
  };
  lastChecked: string;
  issues: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation?: string;
  }[];
}

export interface PluginConflict {
  id: string;
  type: 'version' | 'resource' | 'hook' | 'api' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  plugins: { id: string; name: string }[];
  description: string;
  resolution?: string;
  autoResolvable: boolean;
}

export interface InstalledPluginBasic {
  id: string;
  name: string;
  slug: string;
  version: string;
  active: boolean;
  hasUpdate?: boolean;
}

// ============================================================================
// Enhancement 29: Installation Progress UI
// ============================================================================

interface InstallationProgressProps {
  pluginName: string;
  steps: InstallationStep[];
  isComplete: boolean;
  isFailed: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
}

export function InstallationProgress({
  pluginName,
  steps,
  isComplete,
  isFailed,
  onCancel,
  onRetry,
  onClose,
}: InstallationProgressProps) {
  const currentStep = steps.find((s) => s.status === 'in-progress');
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const totalProgress = Math.round((completedSteps / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'p-6 rounded-2xl',
        'bg-white dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-700',
        'shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-3 rounded-xl',
              isComplete
                ? 'bg-green-100 dark:bg-green-900/30'
                : isFailed
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-primary-100 dark:bg-primary-900/30'
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : isFailed ? (
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {isComplete
                ? 'Installation Complete'
                : isFailed
                ? 'Installation Failed'
                : `Installing ${pluginName}`}
            </h3>
            <p className="text-sm text-neutral-500">
              {isComplete
                ? 'Plugin is ready to use'
                : isFailed
                ? 'An error occurred during installation'
                : currentStep?.label || 'Preparing...'}
            </p>
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="text-right">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
            {totalProgress}%
          </span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isComplete
                ? 'bg-green-500'
                : isFailed
                ? 'bg-red-500'
                : 'bg-primary-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              step.status === 'in-progress' && 'bg-primary-50 dark:bg-primary-900/20',
              step.status === 'failed' && 'bg-red-50 dark:bg-red-900/20'
            )}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0">
              {step.status === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {step.status === 'in-progress' && (
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
              )}
              {step.status === 'failed' && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {step.status === 'skipped' && (
                <Minus className="w-5 h-5 text-neutral-400" />
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.status === 'completed' && 'text-green-700 dark:text-green-300',
                  step.status === 'in-progress' && 'text-primary-700 dark:text-primary-300',
                  step.status === 'failed' && 'text-red-700 dark:text-red-300',
                  step.status === 'pending' && 'text-neutral-500',
                  step.status === 'skipped' && 'text-neutral-400'
                )}
              >
                {step.label}
              </p>
              {step.message && (
                <p className="text-xs text-neutral-500 mt-0.5">{step.message}</p>
              )}
              {step.status === 'in-progress' && step.progress !== undefined && (
                <div className="mt-2 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${step.progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            {step.duration !== undefined && step.status === 'completed' && (
              <span className="text-xs text-neutral-400">{step.duration}s</span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {!isComplete && !isFailed && onCancel && (
          <button
            onClick={onCancel}
            className={cn(
              'px-4 py-2 rounded-xl',
              'text-sm font-medium',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors'
            )}
          >
            Cancel
          </button>
        )}
        {isFailed && onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'text-sm font-medium',
              'bg-primary-600 text-white',
              'hover:bg-primary-700',
              'transition-colors'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
        {(isComplete || isFailed) && onClose && (
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-xl',
              'text-sm font-medium',
              isComplete
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600',
              'transition-colors'
            )}
          >
            {isComplete ? 'Done' : 'Close'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Enhancement 30: Dependency Resolver
// ============================================================================

interface DependencyResolverProps {
  dependencies: PluginDependency[];
  onResolve: (dependencies: PluginDependency[]) => void;
  onSkip?: () => void;
}

export function DependencyResolver({ dependencies, onResolve, onSkip }: DependencyResolverProps) {
  const [selectedDeps, setSelectedDeps] = useState<Set<string>>(
    new Set(dependencies.filter((d) => d.type === 'required' && d.status !== 'installed').map((d) => d.id))
  );

  const requiredDeps = dependencies.filter((d) => d.type === 'required');
  const optionalDeps = dependencies.filter((d) => d.type === 'optional');
  const devDeps = dependencies.filter((d) => d.type === 'dev');

  const missingRequired = requiredDeps.filter((d) => d.status !== 'installed');
  const canProceed = missingRequired.every((d) => selectedDeps.has(d.id));

  const toggleDep = (id: string) => {
    const dep = dependencies.find((d) => d.id === id);
    if (dep?.type === 'required' && dep.status !== 'installed') return; // Can't unselect required missing deps

    setSelectedDeps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleResolve = () => {
    const depsToInstall = dependencies.filter((d) => selectedDeps.has(d.id));
    onResolve(depsToInstall);
  };

  const getStatusBadge = (dep: PluginDependency) => {
    const config = {
      installed: { label: 'Installed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      missing: { label: 'Missing', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
      outdated: { label: 'Outdated', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
      incompatible: { label: 'Incompatible', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    }[dep.status];

    return (
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', config.color)}>
        {config.label}
      </span>
    );
  };

  const renderDepList = (deps: PluginDependency[], title: string, icon: React.ElementType) => {
    if (deps.length === 0) return null;
    const Icon = icon;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <Icon className="w-4 h-4" />
          {title}
        </div>
        <div className="space-y-1">
          {deps.map((dep) => (
            <label
              key={dep.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
                'border border-neutral-200 dark:border-neutral-700',
                'hover:border-neutral-300 dark:hover:border-neutral-600',
                'transition-colors',
                selectedDeps.has(dep.id) && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              )}
            >
              <input
                type="checkbox"
                checked={selectedDeps.has(dep.id) || dep.status === 'installed'}
                onChange={() => toggleDep(dep.id)}
                disabled={dep.status === 'installed' || dep.type === 'required'}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {dep.name}
                  </span>
                  {getStatusBadge(dep)}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                  <span>Required: {dep.requiredVersion}</span>
                  {dep.version && <span>· Current: {dep.version}</span>}
                  {dep.size && <span>· {dep.size}</span>}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
          <Link className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Resolve Dependencies
          </h3>
          <p className="text-sm text-neutral-500">
            The following dependencies need to be resolved before installation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {renderDepList(requiredDeps, 'Required Dependencies', Package)}
        {renderDepList(optionalDeps, 'Optional Dependencies', Layers)}
        {renderDepList(devDeps, 'Development Dependencies', Wrench)}
      </div>

      {!canProceed && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              All required dependencies must be selected to continue with the installation.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {onSkip && (
          <button
            onClick={onSkip}
            className={cn(
              'px-4 py-2 rounded-xl',
              'text-sm font-medium',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            Skip
          </button>
        )}
        <button
          onClick={handleResolve}
          disabled={!canProceed}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'text-sm font-medium',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Download className="w-4 h-4" />
          Install Selected ({selectedDeps.size})
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 31: Bulk Actions Toolbar
// ============================================================================

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  hasUpdates?: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onActivate,
  onDeactivate,
  onUpdate,
  onDelete,
  hasUpdates = false,
}: BulkActionsToolbarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'flex items-center justify-between p-4 rounded-xl',
            'bg-primary-50 dark:bg-primary-900/20',
            'border border-primary-200 dark:border-primary-800'
          )}
        >
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300"
            >
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center',
                  allSelected
                    ? 'bg-primary-600 border-primary-600'
                    : someSelected
                    ? 'border-primary-600'
                    : 'border-neutral-300 dark:border-neutral-600'
                )}
              >
                {allSelected && <Check className="w-3 h-3 text-white" />}
                {someSelected && <Minus className="w-3 h-3 text-primary-600" />}
              </div>
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {selectedCount} of {totalCount} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onActivate}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'text-sm font-medium',
                'text-green-700 dark:text-green-300',
                'bg-green-100 dark:bg-green-900/30',
                'hover:bg-green-200 dark:hover:bg-green-900/50',
                'transition-colors'
              )}
            >
              <Power className="w-4 h-4" />
              Activate
            </button>
            <button
              onClick={onDeactivate}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'text-sm font-medium',
                'text-yellow-700 dark:text-yellow-300',
                'bg-yellow-100 dark:bg-yellow-900/30',
                'hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
                'transition-colors'
              )}
            >
              <PowerOff className="w-4 h-4" />
              Deactivate
            </button>
            {hasUpdates && (
              <button
                onClick={onUpdate}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  'text-sm font-medium',
                  'text-blue-700 dark:text-blue-300',
                  'bg-blue-100 dark:bg-blue-900/30',
                  'hover:bg-blue-200 dark:hover:bg-blue-900/50',
                  'transition-colors'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Update
              </button>
            )}
            <button
              onClick={onDelete}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'text-sm font-medium',
                'text-red-700 dark:text-red-300',
                'bg-red-100 dark:bg-red-900/30',
                'hover:bg-red-200 dark:hover:bg-red-900/50',
                'transition-colors'
              )}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Enhancement 32: Update Manager
// ============================================================================

interface UpdateManagerProps {
  updates: PluginUpdate[];
  onUpdateSingle: (pluginId: string) => void;
  onUpdateAll: () => void;
  onViewChangelog: (url: string) => void;
  isUpdating?: boolean;
}

export function UpdateManager({
  updates,
  onUpdateSingle,
  onUpdateAll,
  onViewChangelog,
  isUpdating = false,
}: UpdateManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const securityUpdates = updates.filter((u) => u.isSecurity);
  const breakingUpdates = updates.filter((u) => u.isBreaking);

  if (updates.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
          All plugins are up to date
        </h4>
        <p className="text-sm text-neutral-500">
          Last checked: just now
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {updates.length} Updates Available
            </h3>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              {securityUpdates.length > 0 && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Shield className="w-3 h-3" />
                  {securityUpdates.length} security
                </span>
              )}
              {breakingUpdates.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="w-3 h-3" />
                  {breakingUpdates.length} breaking
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onUpdateAll}
          disabled={isUpdating}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'text-sm font-medium',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Update All
            </>
          )}
        </button>
      </div>

      {/* Security Warning */}
      {securityUpdates.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                Security Updates Available
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {securityUpdates.length} plugin(s) have security updates. We recommend updating immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-3">
        {updates.map((update) => (
          <div
            key={update.pluginId}
            className={cn(
              'rounded-xl border overflow-hidden',
              update.isSecurity
                ? 'border-red-200 dark:border-red-800'
                : update.isBreaking
                ? 'border-yellow-200 dark:border-yellow-800'
                : 'border-neutral-200 dark:border-neutral-700'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between p-4 cursor-pointer',
                'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                'transition-colors'
              )}
              onClick={() => setExpandedId(expandedId === update.pluginId ? null : update.pluginId)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    update.isSecurity
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : update.isBreaking
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  )}
                >
                  <Package
                    className={cn(
                      'w-5 h-5',
                      update.isSecurity
                        ? 'text-red-600 dark:text-red-400'
                        : update.isBreaking
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-neutral-600 dark:text-neutral-400'
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {update.pluginName}
                    </span>
                    {update.isSecurity && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Security
                      </span>
                    )}
                    {update.isBreaking && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Breaking
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mt-0.5">
                    <span>{update.currentVersion}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {update.newVersion}
                    </span>
                    <span>· {update.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateSingle(update.pluginId);
                  }}
                  disabled={isUpdating}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    'text-sm font-medium',
                    'bg-primary-100 dark:bg-primary-900/30',
                    'text-primary-700 dark:text-primary-300',
                    'hover:bg-primary-200 dark:hover:bg-primary-900/50',
                    'disabled:opacity-50',
                    'transition-colors'
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  Update
                </button>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-neutral-400 transition-transform',
                    expandedId === update.pluginId && 'rotate-180'
                  )}
                />
              </div>
            </div>

            <AnimatePresence>
              {expandedId === update.pluginId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">
                        Released: {update.releaseDate}
                      </span>
                      {update.changelogUrl && (
                        <button
                          onClick={() => onViewChangelog(update.changelogUrl!)}
                          className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <GitBranch className="w-3 h-3" />
                          View Changelog
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 33: Rollback System
// ============================================================================

interface RollbackSystemProps {
  pluginName: string;
  currentVersion: string;
  versions: PluginVersion[];
  onRollback: (version: string) => void;
  isRollingBack?: boolean;
}

export function RollbackSystem({
  pluginName,
  currentVersion,
  versions,
  onRollback,
  isRollingBack = false,
}: RollbackSystemProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [confirmRollback, setConfirmRollback] = useState(false);

  const handleRollback = () => {
    if (selectedVersion) {
      onRollback(selectedVersion);
      setConfirmRollback(false);
      setSelectedVersion(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
          <History className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Version Rollback
          </h3>
          <p className="text-sm text-neutral-500">
            Restore {pluginName} to a previous version
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              Caution
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Rolling back may cause compatibility issues with your current content and settings.
              We recommend backing up your data before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Version List */}
      <div className="space-y-2">
        {versions.map((version) => (
          <button
            key={version.version}
            onClick={() => !version.isCurrent && setSelectedVersion(version.version)}
            disabled={version.isCurrent}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-xl',
              'text-left transition-colors',
              'border',
              version.isCurrent
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                : selectedVersion === version.version
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  version.isCurrent
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : selectedVersion === version.version
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                )}
              >
                {version.isCurrent ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Archive className="w-5 h-5 text-neutral-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    v{version.version}
                  </span>
                  {version.isCurrent && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {version.date}
                  <span>· {version.size}</span>
                </div>
              </div>
            </div>
            {!version.isCurrent && (
              <RotateCcw
                className={cn(
                  'w-5 h-5',
                  selectedVersion === version.version
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400'
                )}
              />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {selectedVersion && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setSelectedVersion(null)}
            className={cn(
              'px-4 py-2 rounded-xl',
              'text-sm font-medium',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmRollback(true)}
            disabled={isRollingBack}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'text-sm font-medium',
              'bg-orange-600 text-white',
              'hover:bg-orange-700',
              'disabled:opacity-50',
              'transition-colors'
            )}
          >
            <RotateCcw className="w-4 h-4" />
            Rollback to v{selectedVersion}
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmRollback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
            >
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Confirm Rollback
              </h4>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Are you sure you want to rollback {pluginName} to version {selectedVersion}?
                This action cannot be easily undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setConfirmRollback(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRollback}
                  disabled={isRollingBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {isRollingBack ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rolling back...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Confirm Rollback
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 34: License Management
// ============================================================================

interface LicenseManagementProps {
  license: PluginLicense | null;
  pluginName: string;
  onActivate: (key: string) => void;
  onDeactivate: () => void;
  onRefresh: () => void;
}

export function LicenseManagement({
  license,
  pluginName,
  onActivate,
  onDeactivate,
  onRefresh,
}: LicenseManagementProps) {
  const [newKey, setNewKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(!license);
  const [copied, setCopied] = useState(false);

  const handleCopyKey = async () => {
    if (license?.key) {
      await navigator.clipboard.writeText(license.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleActivate = () => {
    if (newKey.trim()) {
      onActivate(newKey.trim());
      setNewKey('');
      setShowKeyInput(false);
    }
  };

  const statusConfig = {
    active: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Active',
    },
    expired: {
      icon: Clock,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Expired',
    },
    invalid: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Invalid',
    },
    trial: {
      icon: Timer,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Trial',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            License Management
          </h3>
          <p className="text-sm text-neutral-500">
            Manage your {pluginName} license
          </p>
        </div>
      </div>

      {license ? (
        <div className="space-y-4">
          {/* License Status Card */}
          <div className={cn(
            'p-6 rounded-xl border',
            license.status === 'active' || license.status === 'trial'
              ? 'border-neutral-200 dark:border-neutral-700'
              : 'border-red-200 dark:border-red-800'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(statusConfig[license.status].icon, {
                  className: cn('w-8 h-8', statusConfig[license.status].color),
                })}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white capitalize">
                      {license.type} License
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      statusConfig[license.status].bgColor,
                      statusConfig[license.status].color
                    )}>
                      {statusConfig[license.status].label}
                    </span>
                  </div>
                  {license.expiresAt && (
                    <p className="text-sm text-neutral-500 mt-1">
                      {license.status === 'expired' ? 'Expired on' : 'Expires on'}: {license.expiresAt}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Refresh license"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* License Key */}
            <div className="mt-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {license.key.slice(0, 4)}****-****-****-{license.key.slice(-4)}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Activations */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-neutral-500">Activations</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {license.activationsUsed} / {license.activationsLimit}
              </span>
            </div>
            <div className="mt-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  license.activationsUsed >= license.activationsLimit
                    ? 'bg-red-500'
                    : 'bg-green-500'
                )}
                style={{ width: `${(license.activationsUsed / license.activationsLimit) * 100}%` }}
              />
            </div>

            {/* Features */}
            {license.features.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Included Features
                </p>
                <div className="flex flex-wrap gap-2">
                  {license.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyInput(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'text-sm font-medium',
                'border border-neutral-300 dark:border-neutral-600',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <Key className="w-4 h-4" />
              Change Key
            </button>
            <button
              onClick={onDeactivate}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'text-sm font-medium',
                'text-red-700 dark:text-red-300',
                'hover:bg-red-100 dark:hover:bg-red-900/20'
              )}
            >
              <Unlock className="w-4 h-4" />
              Deactivate
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
              No License Activated
            </h4>
            <p className="text-sm text-neutral-500 mb-4">
              Enter your license key to unlock all premium features
            </p>
          </div>
        </div>
      )}

      {/* Key Input */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                License Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className={cn(
                    'flex-1 px-4 py-2 rounded-xl',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-900 dark:text-white',
                    'font-mono uppercase',
                    'placeholder-neutral-400'
                  )}
                />
                <button
                  onClick={handleActivate}
                  disabled={!newKey.trim()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                    'text-sm font-medium',
                    'bg-primary-600 text-white',
                    'hover:bg-primary-700',
                    'disabled:opacity-50'
                  )}
                >
                  <Key className="w-4 h-4" />
                  Activate
                </button>
              </div>
              {license && (
                <button
                  onClick={() => setShowKeyInput(false)}
                  className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 35: Plugin Health Monitor
// ============================================================================

interface PluginHealthMonitorProps {
  healthData: PluginHealthStatus[];
  onRefresh: () => void;
  onViewDetails: (pluginId: string) => void;
}

export function PluginHealthMonitor({ healthData, onRefresh, onViewDetails }: PluginHealthMonitorProps) {
  const overallHealth = useMemo(() => {
    const critical = healthData.filter((h) => h.status === 'critical').length;
    const warning = healthData.filter((h) => h.status === 'warning').length;
    const healthy = healthData.filter((h) => h.status === 'healthy').length;

    if (critical > 0) return 'critical';
    if (warning > 0) return 'warning';
    if (healthy === healthData.length) return 'healthy';
    return 'unknown';
  }, [healthData]);

  const HelpCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );

  const statusConfig = {
    healthy: { icon: Heart, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Healthy' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Warning' },
    critical: { icon: ServerCrash, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Critical' },
    unknown: { icon: HelpCircleIcon, color: 'text-neutral-500', bgColor: 'bg-neutral-100 dark:bg-neutral-800', label: 'Unknown' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl', statusConfig[overallHealth].bgColor)}>
            <Activity className={cn('w-5 h-5', statusConfig[overallHealth].color)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Plugin Health Monitor
            </h3>
            <p className="text-sm text-neutral-500">
              System status: <span className={cn('font-medium', statusConfig[overallHealth].color)}>
                {statusConfig[overallHealth].label}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'text-sm font-medium',
            'text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthData.map((health) => {
          const config = statusConfig[health.status];
          const Icon = config.icon;

          return (
            <motion.button
              key={health.pluginId}
              onClick={() => onViewDetails(health.pluginId)}
              whileHover={{ scale: 1.01 }}
              className={cn(
                'p-4 rounded-xl border text-left',
                'hover:shadow-md transition-shadow',
                health.status === 'critical'
                  ? 'border-red-200 dark:border-red-800'
                  : health.status === 'warning'
                  ? 'border-yellow-200 dark:border-yellow-800'
                  : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', config.bgColor)}>
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {health.pluginName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Last checked: {health.lastChecked}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Response</p>
                  <p className={cn(
                    'text-sm font-medium',
                    health.metrics.responseTime > 500 ? 'text-red-600' :
                    health.metrics.responseTime > 200 ? 'text-yellow-600' :
                    'text-green-600'
                  )}>
                    {health.metrics.responseTime}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Memory</p>
                  <p className={cn(
                    'text-sm font-medium',
                    health.metrics.memoryUsage > 80 ? 'text-red-600' :
                    health.metrics.memoryUsage > 60 ? 'text-yellow-600' :
                    'text-green-600'
                  )}>
                    {health.metrics.memoryUsage}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">CPU</p>
                  <p className={cn(
                    'text-sm font-medium',
                    health.metrics.cpuUsage > 80 ? 'text-red-600' :
                    health.metrics.cpuUsage > 60 ? 'text-yellow-600' :
                    'text-green-600'
                  )}>
                    {health.metrics.cpuUsage}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Errors</p>
                  <p className={cn(
                    'text-sm font-medium',
                    health.metrics.errorRate > 5 ? 'text-red-600' :
                    health.metrics.errorRate > 1 ? 'text-yellow-600' :
                    'text-green-600'
                  )}>
                    {health.metrics.errorRate}%
                  </p>
                </div>
              </div>

              {/* Issues */}
              {health.issues.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 mb-1">
                    {health.issues.length} issue(s) detected
                  </p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 36: Conflict Detection
// ============================================================================

interface ConflictDetectionProps {
  conflicts: PluginConflict[];
  onResolve: (conflictId: string) => void;
  onIgnore: (conflictId: string) => void;
}

export function ConflictDetection({ conflicts, onResolve, onIgnore }: ConflictDetectionProps) {
  const severityConfig = {
    low: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: Info },
    medium: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', icon: AlertTriangle },
    high: { color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30', icon: AlertCircle },
    critical: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: ShieldAlert },
  };

  if (conflicts.length === 0) {
    return (
      <div className="text-center py-12">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
          No Conflicts Detected
        </h4>
        <p className="text-sm text-neutral-500">
          All plugins are working together harmoniously
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
          <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {conflicts.length} Conflict(s) Detected
          </h3>
          <p className="text-sm text-neutral-500">
            Some plugins may not work properly together
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict) => {
          const config = severityConfig[conflict.severity];
          const Icon = config.icon;

          return (
            <div
              key={conflict.id}
              className={cn(
                'p-4 rounded-xl border',
                conflict.severity === 'critical' || conflict.severity === 'high'
                  ? 'border-red-200 dark:border-red-800'
                  : conflict.severity === 'medium'
                  ? 'border-yellow-200 dark:border-yellow-800'
                  : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg flex-shrink-0', config.bgColor)}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full uppercase', config.bgColor, config.color)}>
                      {conflict.severity}
                    </span>
                    <span className="text-xs text-neutral-500 capitalize">
                      {conflict.type} conflict
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                    {conflict.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                    <span>Affected:</span>
                    {conflict.plugins.map((p, i) => (
                      <span key={p.id}>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {p.name}
                        </span>
                        {i < conflict.plugins.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  {conflict.resolution && (
                    <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                      <strong>Resolution:</strong> {conflict.resolution}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => onIgnore(conflict.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg',
                    'text-sm font-medium',
                    'text-neutral-600 dark:text-neutral-400',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  Ignore
                </button>
                {conflict.autoResolvable && (
                  <button
                    onClick={() => onResolve(conflict.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                      'text-sm font-medium',
                      'bg-primary-600 text-white',
                      'hover:bg-primary-700'
                    )}
                  >
                    <Zap className="w-4 h-4" />
                    Auto-resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 37: Safe Mode Toggle
// ============================================================================

interface SafeModeToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabledPlugins?: InstalledPluginBasic[];
}

export function SafeModeToggle({ isEnabled, onToggle, disabledPlugins = [] }: SafeModeToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (!isEnabled) {
      setShowConfirm(true);
    } else {
      onToggle(false);
    }
  };

  const handleConfirm = () => {
    onToggle(true);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'p-6 rounded-2xl border',
          isEnabled
            ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-neutral-200 dark:border-neutral-700'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              isEnabled
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : 'bg-neutral-100 dark:bg-neutral-800'
            )}>
              <Shield className={cn(
                'w-6 h-6',
                isEnabled
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-neutral-600 dark:text-neutral-400'
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Safe Mode
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                {isEnabled
                  ? 'Safe mode is active. All third-party plugins are disabled.'
                  : 'Enable safe mode to disable all third-party plugins'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            className={cn(
              'relative inline-flex h-7 w-12 items-center rounded-full',
              'transition-colors',
              isEnabled ? 'bg-yellow-500' : 'bg-neutral-300 dark:bg-neutral-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow-md',
                'transition-transform',
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {isEnabled && disabledPlugins.length > 0 && (
          <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Disabled Plugins ({disabledPlugins.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {disabledPlugins.map((plugin) => (
                <span
                  key={plugin.id}
                  className="px-2 py-1 text-xs rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                >
                  {plugin.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                  <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Enable Safe Mode?
                </h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                This will temporarily disable all third-party plugins. Only official plugins will remain active.
                This is useful for troubleshooting plugin-related issues.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  <Shield className="w-4 h-4" />
                  Enable Safe Mode
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 38: Plugin Import/Export
// ============================================================================

interface PluginImportExportProps {
  installedPlugins: InstalledPluginBasic[];
  onExport: (pluginIds: string[], includeSettings: boolean) => void;
  onImport: (file: File) => void;
}

export function PluginImportExport({ installedPlugins, onExport, onImport }: PluginImportExportProps) {
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [selectedPlugins, setSelectedPlugins] = useState<Set<string>>(new Set());
  const [includeSettings, setIncludeSettings] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const togglePlugin = (id: string) => {
    setSelectedPlugins((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPlugins.size === installedPlugins.length) {
      setSelectedPlugins(new Set());
    } else {
      setSelectedPlugins(new Set(installedPlugins.map((p) => p.id)));
    }
  };

  const handleExport = () => {
    onExport(Array.from(selectedPlugins), includeSettings);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImport(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <button
          onClick={() => setMode('export')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-medium transition-colors',
            mode === 'export'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          <FileDown className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={() => setMode('import')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-medium transition-colors',
            mode === 'import'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          <FileUp className="w-4 h-4" />
          Import
        </button>
      </div>

      {mode === 'export' ? (
        <div className="space-y-4">
          {/* Plugin Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Select Plugins to Export
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedPlugins.size === installedPlugins.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
              {installedPlugins.map((plugin) => (
                <label
                  key={plugin.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                    selectedPlugins.has(plugin.id) && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlugins.has(plugin.id)}
                    onChange={() => togglePlugin(plugin.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex-1 text-sm text-neutral-900 dark:text-white">
                    {plugin.name}
                  </span>
                  <span className="text-xs text-neutral-500">v{plugin.version}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSettings}
              onChange={(e) => setIncludeSettings(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Include Settings
              </p>
              <p className="text-xs text-neutral-500">
                Export plugin configurations along with the plugin list
              </p>
            </div>
          </label>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={selectedPlugins.size === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
              'text-sm font-medium',
              'bg-primary-600 text-white',
              'hover:bg-primary-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <FileDown className="w-4 h-4" />
            Export {selectedPlugins.size} Plugin(s)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed',
              'cursor-pointer transition-colors',
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
            )}
          >
            <Upload className={cn(
              'w-12 h-12 mb-4',
              dragActive ? 'text-primary-500' : 'text-neutral-400'
            )} />
            <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
              {dragActive ? 'Drop file here' : 'Drag and drop your export file'}
            </p>
            <p className="text-xs text-neutral-500">
              or click to browse (accepts .json files)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Import Information</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                  <li>Existing plugins with the same ID will be skipped</li>
                  <li>Settings will be merged if included in the export</li>
                  <li>You'll be prompted before any changes are made</li>
                </ul>
              </div>
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

export const sampleInstallationSteps: InstallationStep[] = [
  { id: '1', label: 'Downloading package', status: 'completed', duration: 2.3 },
  { id: '2', label: 'Verifying integrity', status: 'completed', duration: 0.5 },
  { id: '3', label: 'Resolving dependencies', status: 'completed', duration: 1.2 },
  { id: '4', label: 'Installing files', status: 'in-progress', progress: 65, message: 'Copying assets...' },
  { id: '5', label: 'Running migrations', status: 'pending' },
  { id: '6', label: 'Activating plugin', status: 'pending' },
];

export const sampleDependencies: PluginDependency[] = [
  { id: 'dep1', name: 'RustPress Core', version: '1.2.0', requiredVersion: '>=1.0.0', type: 'required', status: 'installed', size: '2.5 MB' },
  { id: 'dep2', name: 'Analytics API', version: '', requiredVersion: '>=2.0.0', type: 'required', status: 'missing', size: '1.2 MB' },
  { id: 'dep3', name: 'Cache Manager', version: '1.5.0', requiredVersion: '>=2.0.0', type: 'required', status: 'outdated', size: '800 KB' },
  { id: 'dep4', name: 'Image Optimizer', version: '', requiredVersion: '>=1.0.0', type: 'optional', status: 'missing', size: '3.1 MB' },
];

export const sampleUpdates: PluginUpdate[] = [
  {
    pluginId: '1',
    pluginName: 'RustPress SEO',
    currentVersion: '2.4.0',
    newVersion: '2.5.0',
    releaseDate: 'January 15, 2024',
    changelogUrl: '#',
    isSecurity: true,
    size: '2.3 MB',
  },
  {
    pluginId: '2',
    pluginName: 'Analytics Pro',
    currentVersion: '3.1.0',
    newVersion: '4.0.0',
    releaseDate: 'January 10, 2024',
    changelogUrl: '#',
    isBreaking: true,
    size: '4.5 MB',
  },
  {
    pluginId: '3',
    pluginName: 'Form Builder',
    currentVersion: '1.8.0',
    newVersion: '1.8.5',
    releaseDate: 'January 8, 2024',
    size: '1.1 MB',
  },
];

export default InstallationProgress;
