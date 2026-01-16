// FunctionsManagement.tsx - Function Management Components (Enhancements 31-40)
// Function List, Details, Triggers, Dependencies, Versioning, Metrics,
// Logs, Scheduling, Secrets, Rate Limiting

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Search,
  Filter,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Copy,
  Play,
  Square,
  RefreshCw,
  Settings,
  Clock,
  Calendar,
  Timer,
  Zap,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  GitBranch,
  GitCommit,
  Tag,
  Package,
  FileCode,
  FileJson,
  Folder,
  Download,
  Upload,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Loader2,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Webhook,
  Database,
  Server,
  Cloud,
  Terminal,
  Hash,
  Braces,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  History,
  Layers,
  Box,
  Inbox,
  Send,
  Bell,
  Sliders,
  ToggleLeft,
  ToggleRight,
  X,
  Percent,
  Users,
  UserCheck,
  Link,
  Unlink,
  Save,
  Star,
  StarOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FunctionItem {
  id: string;
  name: string;
  description?: string;
  runtime: 'node18' | 'node20' | 'python311' | 'rust' | 'deno';
  handler: string;
  status: 'active' | 'inactive' | 'error' | 'deploying';
  lastDeployed?: Date;
  version: string;
  memory: number;
  timeout: number;
  triggers: FunctionTrigger[];
  metrics?: FunctionMetrics;
  tags?: string[];
  starred?: boolean;
}

export interface FunctionTrigger {
  id: string;
  type: 'http' | 'schedule' | 'webhook' | 'event' | 'queue';
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface FunctionDependency {
  name: string;
  version: string;
  type: 'production' | 'development';
  outdated?: boolean;
  latestVersion?: string;
  vulnerable?: boolean;
}

export interface FunctionVersion {
  version: string;
  deployedAt: Date;
  deployedBy: string;
  commitSha?: string;
  branch?: string;
  changelog?: string;
  status: 'current' | 'previous' | 'archived';
  size: number;
}

export interface FunctionMetrics {
  invocations: number;
  errors: number;
  errorRate: number;
  avgDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  coldStarts: number;
  memoryUsage: number;
  timeRange: '1h' | '24h' | '7d' | '30d';
}

export interface FunctionLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  requestId?: string;
  duration?: number;
  memoryUsed?: number;
  metadata?: Record<string, unknown>;
}

export interface CronSchedule {
  expression: string;
  timezone: string;
  enabled: boolean;
  nextRun?: Date;
  lastRun?: Date;
  description?: string;
}

export interface FunctionSecret {
  key: string;
  createdAt: Date;
  updatedAt: Date;
  source: 'manual' | 'env' | 'vault';
  description?: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  perUser: boolean;
  perIp: boolean;
  customKey?: string;
}

// ============================================================================
// ENHANCEMENT 31: Function List with Filtering/Search
// ============================================================================

interface FunctionListProps {
  functions: FunctionItem[];
  selectedFunction?: string;
  onSelect: (fn: FunctionItem) => void;
  onDelete: (fnId: string) => void;
  onToggleStatus: (fnId: string) => void;
  onToggleStar?: (fnId: string) => void;
  onCreate?: () => void;
}

export function FunctionList({
  functions,
  selectedFunction,
  onSelect,
  onDelete,
  onToggleStatus,
  onToggleStar,
  onCreate
}: FunctionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FunctionItem['status'] | 'all'>('all');
  const [runtimeFilter, setRuntimeFilter] = useState<FunctionItem['runtime'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastDeployed' | 'invocations'>('name');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const filteredFunctions = useMemo(() => {
    return functions
      .filter(fn => {
        const matchesSearch = fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fn.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || fn.status === statusFilter;
        const matchesRuntime = runtimeFilter === 'all' || fn.runtime === runtimeFilter;
        const matchesStarred = !showStarredOnly || fn.starred;
        return matchesSearch && matchesStatus && matchesRuntime && matchesStarred;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'lastDeployed':
            return (b.lastDeployed?.getTime() || 0) - (a.lastDeployed?.getTime() || 0);
          case 'invocations':
            return (b.metrics?.invocations || 0) - (a.metrics?.invocations || 0);
          default:
            return 0;
        }
      });
  }, [functions, searchQuery, statusFilter, runtimeFilter, sortBy, showStarredOnly]);

  const getStatusIcon = (status: FunctionItem['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive': return <Square className="w-4 h-4 text-gray-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'deploying': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    }
  };

  const getRuntimeColor = (runtime: FunctionItem['runtime']) => {
    switch (runtime) {
      case 'node18':
      case 'node20': return 'text-green-400 bg-green-400/10';
      case 'python311': return 'text-blue-400 bg-blue-400/10';
      case 'rust': return 'text-orange-400 bg-orange-400/10';
      case 'deno': return 'text-purple-400 bg-purple-400/10';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Functions</h3>
          <span className="text-xs text-gray-500">({filteredFunctions.length})</span>
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
            className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Function
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-[#3c3c3c] space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-2 py-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-xs text-gray-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">Error</option>
            <option value="deploying">Deploying</option>
          </select>
          <select
            value={runtimeFilter}
            onChange={(e) => setRuntimeFilter(e.target.value as typeof runtimeFilter)}
            className="px-2 py-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-xs text-gray-300"
          >
            <option value="all">All Runtimes</option>
            <option value="node18">Node 18</option>
            <option value="node20">Node 20</option>
            <option value="python311">Python 3.11</option>
            <option value="rust">Rust</option>
            <option value="deno">Deno</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 py-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-xs text-gray-300"
          >
            <option value="name">Sort: Name</option>
            <option value="lastDeployed">Sort: Last Deployed</option>
            <option value="invocations">Sort: Invocations</option>
          </select>
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={cn(
              "p-1.5 rounded",
              showStarredOnly ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
            title="Show starred only"
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Function List */}
      <div className="flex-1 overflow-auto">
        {filteredFunctions.map(fn => (
          <div
            key={fn.id}
            className={cn(
              "flex items-center gap-3 p-4 border-b border-[#3c3c3c] hover:bg-[#2a2d2e] cursor-pointer",
              selectedFunction === fn.id && 'bg-[#094771]'
            )}
            onClick={() => onSelect(fn)}
          >
            {getStatusIcon(fn.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{fn.name}</span>
                {fn.starred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
              </div>
              {fn.description && (
                <p className="text-xs text-gray-500 truncate">{fn.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-xs px-1.5 py-0.5 rounded", getRuntimeColor(fn.runtime))}>
                  {fn.runtime}
                </span>
                <span className="text-xs text-gray-500">v{fn.version}</span>
                {fn.triggers.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {fn.triggers.length} trigger{fn.triggers.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {fn.metrics && (
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {fn.metrics.invocations.toLocaleString()}
                </span>
              )}
              <div className="flex items-center gap-1">
                {onToggleStar && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleStar(fn.id); }}
                    className="p-1 hover:bg-[#3c3c3c] rounded"
                  >
                    {fn.starred ? (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleStatus(fn.id); }}
                  className="p-1 hover:bg-[#3c3c3c] rounded"
                >
                  {fn.status === 'active' ? (
                    <ToggleRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(fn.id); }}
                  className="p-1 hover:bg-red-500/10 rounded text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredFunctions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Code className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No functions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 32: Function Details Card
// ============================================================================

interface FunctionDetailsProps {
  fn: FunctionItem;
  onEdit: () => void;
  onDeploy: () => void;
  onTest: () => void;
  onViewLogs: () => void;
}

export function FunctionDetails({
  fn,
  onEdit,
  onDeploy,
  onTest,
  onViewLogs
}: FunctionDetailsProps) {
  const getRuntimeIcon = (runtime: FunctionItem['runtime']) => {
    switch (runtime) {
      case 'node18':
      case 'node20':
        return <FileCode className="w-5 h-5 text-green-400" />;
      case 'python311':
        return <Hash className="w-5 h-5 text-blue-400" />;
      case 'rust':
        return <Braces className="w-5 h-5 text-orange-400" />;
      case 'deno':
        return <FileCode className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#3c3c3c]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getRuntimeIcon(fn.runtime)}
            <div>
              <h2 className="text-lg font-medium text-white">{fn.name}</h2>
              {fn.description && (
                <p className="text-sm text-gray-400 mt-1">{fn.description}</p>
              )}
            </div>
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            fn.status === 'active' && 'bg-green-400/10 text-green-400',
            fn.status === 'inactive' && 'bg-gray-400/10 text-gray-400',
            fn.status === 'error' && 'bg-red-400/10 text-red-400',
            fn.status === 'deploying' && 'bg-blue-400/10 text-blue-400'
          )}>
            {fn.status}
          </div>
        </div>

        {/* Tags */}
        {fn.tags && fn.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {fn.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-[#3c3c3c] rounded text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#3c3c3c]">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {fn.metrics?.invocations.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-500">Invocations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {fn.metrics?.avgDuration || 0}ms
          </div>
          <div className="text-xs text-gray-500">Avg Duration</div>
        </div>
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold",
            (fn.metrics?.errorRate || 0) > 5 ? 'text-red-400' : 'text-white'
          )}>
            {fn.metrics?.errorRate?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-gray-500">Error Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {fn.metrics?.memoryUsage || 0}MB
          </div>
          <div className="text-xs text-gray-500">Memory</div>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Handler</span>
          <code className="text-white bg-[#1e1e1e] px-2 py-0.5 rounded">{fn.handler}</code>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Runtime</span>
          <span className="text-white">{fn.runtime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Memory</span>
          <span className="text-white">{fn.memory} MB</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Timeout</span>
          <span className="text-white">{fn.timeout}s</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Version</span>
          <span className="text-white">v{fn.version}</span>
        </div>
        {fn.lastDeployed && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Deployed</span>
            <span className="text-white">{fn.lastDeployed.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 border-t border-[#3c3c3c]">
        <button
          onClick={onDeploy}
          className="flex-1 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Deploy
        </button>
        <button
          onClick={onTest}
          className="flex-1 px-4 py-2 bg-[#1e1e1e] hover:bg-[#3c3c3c] text-white rounded text-sm font-medium flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Test
        </button>
        <button
          onClick={onViewLogs}
          className="px-4 py-2 bg-[#1e1e1e] hover:bg-[#3c3c3c] text-white rounded text-sm font-medium flex items-center justify-center gap-2"
        >
          <Terminal className="w-4 h-4" />
          Logs
        </button>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 33: Function Triggers Configuration
// ============================================================================

interface TriggerConfigProps {
  triggers: FunctionTrigger[];
  onAdd: (trigger: Omit<FunctionTrigger, 'id'>) => void;
  onUpdate: (triggerId: string, updates: Partial<FunctionTrigger>) => void;
  onDelete: (triggerId: string) => void;
  onToggle: (triggerId: string) => void;
}

export function TriggerConfig({
  triggers,
  onAdd,
  onUpdate,
  onDelete,
  onToggle
}: TriggerConfigProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTriggerType, setNewTriggerType] = useState<FunctionTrigger['type']>('http');
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);

  const getTriggerIcon = (type: FunctionTrigger['type']) => {
    switch (type) {
      case 'http': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'schedule': return <Clock className="w-4 h-4 text-purple-400" />;
      case 'webhook': return <Webhook className="w-4 h-4 text-green-400" />;
      case 'event': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'queue': return <Inbox className="w-4 h-4 text-orange-400" />;
    }
  };

  const handleAdd = () => {
    onAdd({
      type: newTriggerType,
      config: getDefaultConfig(newTriggerType),
      enabled: true
    });
    setShowAddForm(false);
  };

  const getDefaultConfig = (type: FunctionTrigger['type']): Record<string, unknown> => {
    switch (type) {
      case 'http':
        return { path: '/api/function', methods: ['GET', 'POST'], cors: true, auth: false };
      case 'schedule':
        return { cron: '0 * * * *', timezone: 'UTC' };
      case 'webhook':
        return { secret: '', events: [] };
      case 'event':
        return { source: '', eventType: '' };
      case 'queue':
        return { queueName: '', batchSize: 10 };
    }
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Triggers</h3>
          <span className="text-xs text-gray-500">({triggers.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Trigger
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-b border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Trigger Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['http', 'schedule', 'webhook', 'event', 'queue'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewTriggerType(type)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded border",
                        newTriggerType === type
                          ? 'border-[#007acc] bg-[#094771]/20'
                          : 'border-[#3c3c3c] hover:border-[#007acc]/50'
                      )}
                    >
                      {getTriggerIcon(type)}
                      <span className="text-xs text-gray-300 capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium"
                >
                  Add Trigger
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Triggers List */}
      <div className="divide-y divide-[#3c3c3c]">
        {triggers.map(trigger => (
          <div key={trigger.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedTrigger(
                    expandedTrigger === trigger.id ? null : trigger.id
                  )}
                  className="p-1 hover:bg-[#3c3c3c] rounded"
                >
                  <ChevronRight className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    expandedTrigger === trigger.id && "rotate-90"
                  )} />
                </button>
                {getTriggerIcon(trigger.type)}
                <div>
                  <span className="text-sm font-medium text-white capitalize">{trigger.type}</span>
                  {trigger.type === 'http' && trigger.config.path && (
                    <span className="text-xs text-gray-500 ml-2">{trigger.config.path as string}</span>
                  )}
                  {trigger.type === 'schedule' && trigger.config.cron && (
                    <span className="text-xs text-gray-500 ml-2">{trigger.config.cron as string}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggle(trigger.id)}
                  className={cn(
                    "px-2 py-1 rounded text-xs",
                    trigger.enabled
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-gray-400/10 text-gray-400'
                  )}
                >
                  {trigger.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => onDelete(trigger.id)}
                  className="p-1 hover:bg-red-500/10 rounded text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Config */}
            <AnimatePresence>
              {expandedTrigger === trigger.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="mt-3 ml-8 overflow-hidden"
                >
                  <div className="p-3 bg-[#1e1e1e] rounded space-y-2">
                    {Object.entries(trigger.config).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-24">{key}:</span>
                        <span className="text-gray-300 font-mono">
                          {typeof value === 'boolean'
                            ? value ? 'true' : 'false'
                            : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {triggers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Zap className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No triggers configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 34: Function Dependencies Manager
// ============================================================================

interface DependenciesManagerProps {
  dependencies: FunctionDependency[];
  onAdd: (name: string, version: string, type: FunctionDependency['type']) => void;
  onUpdate: (name: string, version: string) => void;
  onRemove: (name: string) => void;
  onCheckUpdates: () => void;
}

export function DependenciesManager({
  dependencies,
  onAdd,
  onUpdate,
  onRemove,
  onCheckUpdates
}: DependenciesManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepName, setNewDepName] = useState('');
  const [newDepVersion, setNewDepVersion] = useState('');
  const [newDepType, setNewDepType] = useState<FunctionDependency['type']>('production');

  const prodDeps = dependencies.filter(d => d.type === 'production');
  const devDeps = dependencies.filter(d => d.type === 'development');
  const outdatedCount = dependencies.filter(d => d.outdated).length;
  const vulnerableCount = dependencies.filter(d => d.vulnerable).length;

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Dependencies</h3>
          <span className="text-xs text-gray-500">({dependencies.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {outdatedCount > 0 && (
            <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 text-xs rounded">
              {outdatedCount} outdated
            </span>
          )}
          {vulnerableCount > 0 && (
            <span className="px-2 py-0.5 bg-red-400/10 text-red-400 text-xs rounded">
              {vulnerableCount} vulnerable
            </span>
          )}
          <button
            onClick={onCheckUpdates}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
            title="Check for updates"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-b border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Package name"
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Version"
                  value={newDepVersion}
                  onChange={(e) => setNewDepVersion(e.target.value)}
                  className="w-24 px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500"
                />
                <select
                  value={newDepType}
                  onChange={(e) => setNewDepType(e.target.value as FunctionDependency['type'])}
                  className="px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-gray-300"
                >
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAdd(newDepName, newDepVersion || 'latest', newDepType);
                    setNewDepName('');
                    setNewDepVersion('');
                    setShowAddForm(false);
                  }}
                  disabled={!newDepName}
                  className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm font-medium"
                >
                  Add Dependency
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dependencies List */}
      <div className="max-h-[400px] overflow-auto">
        {/* Production Dependencies */}
        {prodDeps.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-[#1e1e1e] text-xs text-gray-500 uppercase tracking-wider">
              Production ({prodDeps.length})
            </div>
            {prodDeps.map(dep => (
              <div
                key={dep.name}
                className="flex items-center justify-between px-4 py-2 hover:bg-[#2a2d2e]"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">{dep.name}</span>
                  {dep.vulnerable && (
                    <AlertTriangle className="w-4 h-4 text-red-400" title="Vulnerable" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{dep.version}</span>
                  {dep.outdated && dep.latestVersion && (
                    <button
                      onClick={() => onUpdate(dep.name, dep.latestVersion!)}
                      className="text-xs px-2 py-0.5 bg-yellow-400/10 text-yellow-400 rounded hover:bg-yellow-400/20"
                    >
                      {dep.latestVersion} available
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(dep.name)}
                    className="p-1 hover:bg-red-500/10 rounded text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Development Dependencies */}
        {devDeps.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-[#1e1e1e] text-xs text-gray-500 uppercase tracking-wider">
              Development ({devDeps.length})
            </div>
            {devDeps.map(dep => (
              <div
                key={dep.name}
                className="flex items-center justify-between px-4 py-2 hover:bg-[#2a2d2e]"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">{dep.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{dep.version}</span>
                  <button
                    onClick={() => onRemove(dep.name)}
                    className="p-1 hover:bg-red-500/10 rounded text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {dependencies.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No dependencies</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 35: Function Versioning Panel
// ============================================================================

interface VersioningPanelProps {
  versions: FunctionVersion[];
  currentVersion: string;
  onRollback: (version: string) => void;
  onPromote: (version: string) => void;
  onViewDiff: (v1: string, v2: string) => void;
}

export function VersioningPanel({
  versions,
  currentVersion,
  onRollback,
  onPromote,
  onViewDiff
}: VersioningPanelProps) {
  const [compareFrom, setCompareFrom] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Version History</h3>
        </div>
        <span className="text-xs text-gray-500">
          Current: <span className="text-white">v{currentVersion}</span>
        </span>
      </div>

      {/* Versions List */}
      <div className="max-h-[400px] overflow-auto">
        {versions.map((version, index) => (
          <div
            key={version.version}
            className={cn(
              "p-4 border-b border-[#3c3c3c] hover:bg-[#2a2d2e]",
              version.status === 'current' && 'bg-[#094771]/20'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">v{version.version}</span>
                {version.status === 'current' && (
                  <span className="px-2 py-0.5 bg-green-400/10 text-green-400 text-xs rounded">
                    Current
                  </span>
                )}
                {version.status === 'archived' && (
                  <span className="px-2 py-0.5 bg-gray-400/10 text-gray-400 text-xs rounded">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {version.status !== 'current' && (
                  <button
                    onClick={() => onRollback(version.version)}
                    className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-400/10 rounded"
                  >
                    Rollback
                  </button>
                )}
                {compareFrom === null ? (
                  <button
                    onClick={() => setCompareFrom(version.version)}
                    className="px-2 py-1 text-xs text-gray-400 hover:bg-[#3c3c3c] rounded"
                  >
                    Compare
                  </button>
                ) : compareFrom !== version.version && (
                  <button
                    onClick={() => {
                      onViewDiff(compareFrom, version.version);
                      setCompareFrom(null);
                    }}
                    className="px-2 py-1 text-xs text-green-400 hover:bg-green-400/10 rounded"
                  >
                    Compare with {compareFrom}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {version.deployedAt.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {version.deployedBy}
              </span>
              <span>{formatSize(version.size)}</span>
              {version.commitSha && (
                <span className="font-mono text-blue-400">{version.commitSha.substring(0, 7)}</span>
              )}
              {version.branch && (
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {version.branch}
                </span>
              )}
            </div>
            {version.changelog && (
              <p className="mt-2 text-xs text-gray-400">{version.changelog}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 36: Function Metrics Dashboard
// ============================================================================

interface MetricsDashboardProps {
  metrics: FunctionMetrics;
  timeSeriesData: { timestamp: Date; value: number }[];
  onTimeRangeChange: (range: FunctionMetrics['timeRange']) => void;
}

export function MetricsDashboard({
  metrics,
  timeSeriesData,
  onTimeRangeChange
}: MetricsDashboardProps) {
  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Metrics</h3>
        </div>
        <div className="flex items-center gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={cn(
                "px-2 py-1 text-xs rounded",
                metrics.timeRange === range
                  ? 'bg-[#094771] text-white'
                  : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 p-4">
        <div className="p-4 bg-[#1e1e1e] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Invocations</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.invocations.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-[#1e1e1e] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-500">Errors</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.errors}</div>
          <div className={cn(
            "text-xs mt-1",
            metrics.errorRate > 5 ? 'text-red-400' : 'text-green-400'
          )}>
            {metrics.errorRate.toFixed(2)}% error rate
          </div>
        </div>

        <div className="p-4 bg-[#1e1e1e] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-500">Avg Duration</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.avgDuration}ms</div>
          <div className="text-xs text-gray-500 mt-1">
            p95: {metrics.p95Duration}ms
          </div>
        </div>

        <div className="p-4 bg-[#1e1e1e] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">Memory Usage</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.memoryUsage}MB</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.coldStarts} cold starts
          </div>
        </div>
      </div>

      {/* Duration Percentiles */}
      <div className="px-4 pb-4">
        <h4 className="text-xs text-gray-500 mb-2">Duration Percentiles</h4>
        <div className="flex items-end gap-2 h-24 bg-[#1e1e1e] rounded-lg p-4">
          {[
            { label: 'p50', value: metrics.p50Duration, max: metrics.p99Duration },
            { label: 'p95', value: metrics.p95Duration, max: metrics.p99Duration },
            { label: 'p99', value: metrics.p99Duration, max: metrics.p99Duration }
          ].map(({ label, value, max }) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(value / max) * 100}%` }}
              />
              <span className="text-xs text-gray-400 mt-1">{label}</span>
              <span className="text-xs text-white">{value}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Timeline */}
      <div className="px-4 pb-4">
        <h4 className="text-xs text-gray-500 mb-2">Invocations Over Time</h4>
        <div className="flex items-end gap-0.5 h-16 bg-[#1e1e1e] rounded-lg p-2">
          {timeSeriesData.slice(-50).map((point, index) => {
            const max = Math.max(...timeSeriesData.map(p => p.value));
            return (
              <div
                key={index}
                className="flex-1 bg-blue-500/50 hover:bg-blue-500 rounded-t transition-colors"
                style={{ height: `${(point.value / max) * 100}%` }}
                title={`${point.value} invocations`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 37: Function Logs Viewer with Filtering
// ============================================================================

interface LogsViewerProps {
  logs: FunctionLog[];
  onRefresh: () => void;
  onExport: () => void;
  isLive?: boolean;
  onToggleLive?: () => void;
}

export function LogsViewer({
  logs,
  onRefresh,
  onExport,
  isLive,
  onToggleLive
}: LogsViewerProps) {
  const [filter, setFilter] = useState<FunctionLog['level'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<FunctionLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filter === 'all' || log.level === filter;
    const matchesSearch = !searchQuery ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId?.includes(searchQuery);
    return matchesLevel && matchesSearch;
  });

  const getLogColor = (level: FunctionLog['level']) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'warn': return 'text-yellow-400 bg-yellow-400/10';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Logs</h3>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleLive && (
            <button
              onClick={onToggleLive}
              className={cn(
                "px-2 py-1 text-xs rounded flex items-center gap-1",
                isLive ? 'bg-green-400/10 text-green-400' : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
            >
              {isLive ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isLive ? 'Stop' : 'Live'}
            </button>
          )}
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onExport}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-3 border-b border-[#3c3c3c]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'error', 'warn', 'info', 'debug'] as const).map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={cn(
                "px-2 py-1 text-xs rounded capitalize",
                filter === level ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className={cn(
              "flex items-start gap-3 px-4 py-2 hover:bg-[#2a2d2e] cursor-pointer border-b border-[#3c3c3c]",
              getLogColor(log.level)
            )}
            onClick={() => setSelectedLog(log)}
          >
            <span className="text-gray-500 flex-shrink-0">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className={cn(
              "w-12 uppercase text-center py-0.5 rounded",
              getLogColor(log.level)
            )}>
              {log.level}
            </span>
            <span className="flex-1 break-all">{log.message}</span>
            {log.duration && (
              <span className="text-gray-500 flex-shrink-0">{log.duration}ms</span>
            )}
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Terminal className="w-8 h-8 mx-auto mb-2" />
            <p>No logs found</p>
          </div>
        )}
      </div>

      {/* Log Details */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 bg-[#1e1e1e]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Log Details</span>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 hover:bg-[#3c3c3c] rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                {selectedLog.requestId && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24">Request ID:</span>
                    <span className="text-white font-mono">{selectedLog.requestId}</span>
                  </div>
                )}
                {selectedLog.duration && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24">Duration:</span>
                    <span className="text-white">{selectedLog.duration}ms</span>
                  </div>
                )}
                {selectedLog.memoryUsed && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24">Memory:</span>
                    <span className="text-white">{selectedLog.memoryUsed}MB</span>
                  </div>
                )}
                {selectedLog.metadata && (
                  <div>
                    <span className="text-gray-500">Metadata:</span>
                    <pre className="mt-1 p-2 bg-[#252526] rounded text-gray-300 overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 38: Function Scheduling (Cron) Editor
// ============================================================================

interface CronEditorProps {
  schedule: CronSchedule;
  onUpdate: (schedule: CronSchedule) => void;
  onTest?: () => void;
}

export function CronEditor({
  schedule,
  onUpdate,
  onTest
}: CronEditorProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [cronParts, setCronParts] = useState({
    minute: schedule.expression.split(' ')[0] || '*',
    hour: schedule.expression.split(' ')[1] || '*',
    dayOfMonth: schedule.expression.split(' ')[2] || '*',
    month: schedule.expression.split(' ')[3] || '*',
    dayOfWeek: schedule.expression.split(' ')[4] || '*'
  });

  const presets = [
    { label: 'Every minute', cron: '* * * * *' },
    { label: 'Every hour', cron: '0 * * * *' },
    { label: 'Every day at midnight', cron: '0 0 * * *' },
    { label: 'Every Monday at 9am', cron: '0 9 * * 1' },
    { label: 'Every month on 1st', cron: '0 0 1 * *' }
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ];

  const updateExpression = () => {
    const expression = `${cronParts.minute} ${cronParts.hour} ${cronParts.dayOfMonth} ${cronParts.month} ${cronParts.dayOfWeek}`;
    onUpdate({ ...schedule, expression });
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Schedule</h3>
        </div>
        <button
          onClick={() => onUpdate({ ...schedule, enabled: !schedule.enabled })}
          className={cn(
            "px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1",
            schedule.enabled
              ? 'bg-green-400/10 text-green-400'
              : 'bg-gray-400/10 text-gray-400'
          )}
        >
          {schedule.enabled ? (
            <><ToggleRight className="w-4 h-4" /> Enabled</>
          ) : (
            <><ToggleLeft className="w-4 h-4" /> Disabled</>
          )}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Presets */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
              <button
                key={preset.cron}
                onClick={() => onUpdate({ ...schedule, expression: preset.cron })}
                className={cn(
                  "px-3 py-1.5 text-xs rounded border",
                  schedule.expression === preset.cron
                    ? 'border-[#007acc] bg-[#094771]/20 text-white'
                    : 'border-[#3c3c3c] text-gray-400 hover:border-[#007acc]/50'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cron Expression */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500">Cron Expression</label>
            <button
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="text-xs text-blue-400 hover:underline"
            >
              {isAdvanced ? 'Simple mode' : 'Advanced mode'}
            </button>
          </div>
          {isAdvanced ? (
            <input
              type="text"
              value={schedule.expression}
              onChange={(e) => onUpdate({ ...schedule, expression: e.target.value })}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white font-mono"
              placeholder="* * * * *"
            />
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(cronParts).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setCronParts(p => ({ ...p, [key]: e.target.value }));
                    }}
                    onBlur={updateExpression}
                    className="w-full px-2 py-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white font-mono text-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Timezone</label>
          <select
            value={schedule.timezone}
            onChange={(e) => onUpdate({ ...schedule, timezone: e.target.value })}
            className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Next/Last Run */}
        <div className="grid grid-cols-2 gap-4">
          {schedule.nextRun && (
            <div className="p-3 bg-[#1e1e1e] rounded">
              <span className="text-xs text-gray-500 block mb-1">Next Run</span>
              <span className="text-sm text-white">{schedule.nextRun.toLocaleString()}</span>
            </div>
          )}
          {schedule.lastRun && (
            <div className="p-3 bg-[#1e1e1e] rounded">
              <span className="text-xs text-gray-500 block mb-1">Last Run</span>
              <span className="text-sm text-white">{schedule.lastRun.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Test Button */}
        {onTest && (
          <button
            onClick={onTest}
            className="w-full py-2 bg-[#1e1e1e] hover:bg-[#3c3c3c] text-white rounded text-sm font-medium flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Test Run Now
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 39: Function Secrets Manager
// ============================================================================

interface SecretsManagerProps {
  secrets: FunctionSecret[];
  onAdd: (key: string, value: string, description?: string) => void;
  onUpdate: (key: string, value: string) => void;
  onDelete: (key: string) => void;
  onRotate?: (key: string) => void;
}

export function SecretsManager({
  secrets,
  onAdd,
  onUpdate,
  onDelete,
  onRotate
}: SecretsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showValues, setShowValues] = useState<Set<string>>(new Set());

  const toggleShowValue = (key: string) => {
    const newShow = new Set(showValues);
    if (newShow.has(key)) {
      newShow.delete(key);
    } else {
      newShow.add(key);
    }
    setShowValues(newShow);
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Secrets</h3>
          <span className="text-xs text-gray-500">({secrets.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Secret
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-b border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="SECRET_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white font-mono placeholder-gray-500"
              />
              <input
                type="password"
                placeholder="Secret value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAdd(newKey, newValue, newDescription || undefined);
                    setNewKey('');
                    setNewValue('');
                    setNewDescription('');
                    setShowAddForm(false);
                  }}
                  disabled={!newKey || !newValue}
                  className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm font-medium"
                >
                  Add Secret
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secrets List */}
      <div className="divide-y divide-[#3c3c3c]">
        {secrets.map(secret => (
          <div key={secret.key} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-yellow-400" />
                <div>
                  <span className="text-sm font-medium text-white font-mono">{secret.key}</span>
                  {secret.description && (
                    <p className="text-xs text-gray-500">{secret.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  secret.source === 'vault' && 'bg-purple-400/10 text-purple-400',
                  secret.source === 'env' && 'bg-blue-400/10 text-blue-400',
                  secret.source === 'manual' && 'bg-gray-400/10 text-gray-400'
                )}>
                  {secret.source}
                </span>
                <button
                  onClick={() => toggleShowValue(secret.key)}
                  className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                >
                  {showValues.has(secret.key) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {onRotate && (
                  <button
                    onClick={() => onRotate(secret.key)}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                    title="Rotate secret"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingKey(secret.key);
                    setEditValue('');
                  }}
                  className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(secret.key)}
                  className="p-1.5 hover:bg-red-500/10 rounded text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Edit Form */}
            <AnimatePresence>
              {editingKey === secret.key && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="New value"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        onUpdate(secret.key, editValue);
                        setEditingKey(null);
                        setEditValue('');
                      }}
                      disabled={!editValue}
                      className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Last Updated */}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>Updated: {secret.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {secrets.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Key className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No secrets configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 40: Function Rate Limiting Config
// ============================================================================

interface RateLimitingConfigProps {
  config: RateLimitConfig;
  onUpdate: (config: RateLimitConfig) => void;
}

export function RateLimitingConfig({
  config,
  onUpdate
}: RateLimitingConfigProps) {
  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Rate Limiting</h3>
        </div>
        <button
          onClick={() => onUpdate({ ...config, enabled: !config.enabled })}
          className={cn(
            "px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1",
            config.enabled
              ? 'bg-green-400/10 text-green-400'
              : 'bg-gray-400/10 text-gray-400'
          )}
        >
          {config.enabled ? (
            <><ShieldCheck className="w-4 h-4" /> Enabled</>
          ) : (
            <><Shield className="w-4 h-4" /> Disabled</>
          )}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Rate Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Requests per Second</label>
            <input
              type="number"
              value={config.requestsPerSecond}
              onChange={(e) => onUpdate({ ...config, requestsPerSecond: parseInt(e.target.value) || 0 })}
              disabled={!config.enabled}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2">Requests per Minute</label>
            <input
              type="number"
              value={config.requestsPerMinute}
              onChange={(e) => onUpdate({ ...config, requestsPerMinute: parseInt(e.target.value) || 0 })}
              disabled={!config.enabled}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2">Requests per Hour</label>
            <input
              type="number"
              value={config.requestsPerHour}
              onChange={(e) => onUpdate({ ...config, requestsPerHour: parseInt(e.target.value) || 0 })}
              disabled={!config.enabled}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2">Burst Limit</label>
            <input
              type="number"
              value={config.burstLimit}
              onChange={(e) => onUpdate({ ...config, burstLimit: parseInt(e.target.value) || 0 })}
              disabled={!config.enabled}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white disabled:opacity-50"
            />
          </div>
        </div>

        {/* Rate Limit By */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Rate Limit By</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.perIp}
                onChange={(e) => onUpdate({ ...config, perIp: e.target.checked })}
                disabled={!config.enabled}
                className="rounded bg-[#1e1e1e] border-[#3c3c3c]"
              />
              <span className="text-sm text-gray-300">Per IP Address</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.perUser}
                onChange={(e) => onUpdate({ ...config, perUser: e.target.checked })}
                disabled={!config.enabled}
                className="rounded bg-[#1e1e1e] border-[#3c3c3c]"
              />
              <span className="text-sm text-gray-300">Per User</span>
            </label>
          </div>
        </div>

        {/* Custom Key */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Custom Rate Limit Key (optional)</label>
          <input
            type="text"
            value={config.customKey || ''}
            onChange={(e) => onUpdate({ ...config, customKey: e.target.value })}
            disabled={!config.enabled}
            placeholder="e.g., headers.x-api-key"
            className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 disabled:opacity-50"
          />
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-gray-500 p-3 bg-[#1e1e1e] rounded">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Rate limiting helps protect your function from abuse and ensures fair usage.
            Requests exceeding the limit will receive a 429 Too Many Requests response.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleFunctions: FunctionItem[] = [
  {
    id: '1',
    name: 'auth-handler',
    description: 'Handles user authentication and session management',
    runtime: 'node20',
    handler: 'src/auth/handler.main',
    status: 'active',
    lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    version: '1.2.3',
    memory: 256,
    timeout: 30,
    triggers: [
      { id: '1', type: 'http', config: { path: '/api/auth', methods: ['POST'] }, enabled: true }
    ],
    metrics: {
      invocations: 125000,
      errors: 125,
      errorRate: 0.1,
      avgDuration: 45,
      p50Duration: 32,
      p95Duration: 120,
      p99Duration: 250,
      coldStarts: 50,
      memoryUsage: 128,
      timeRange: '24h'
    },
    tags: ['auth', 'security'],
    starred: true
  },
  {
    id: '2',
    name: 'email-sender',
    description: 'Sends transactional emails via queue',
    runtime: 'python311',
    handler: 'functions/email.send',
    status: 'active',
    lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24),
    version: '2.0.1',
    memory: 128,
    timeout: 60,
    triggers: [
      { id: '2', type: 'queue', config: { queueName: 'emails', batchSize: 10 }, enabled: true }
    ],
    metrics: {
      invocations: 45000,
      errors: 45,
      errorRate: 0.1,
      avgDuration: 200,
      p50Duration: 150,
      p95Duration: 450,
      p99Duration: 800,
      coldStarts: 20,
      memoryUsage: 64,
      timeRange: '24h'
    },
    tags: ['email', 'queue']
  },
  {
    id: '3',
    name: 'data-processor',
    description: 'Processes and transforms uploaded data files',
    runtime: 'rust',
    handler: 'processor::handle',
    status: 'error',
    lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 48),
    version: '0.9.5',
    memory: 512,
    timeout: 300,
    triggers: [
      { id: '3', type: 'event', config: { source: 's3', eventType: 'object.created' }, enabled: true }
    ],
    metrics: {
      invocations: 1200,
      errors: 150,
      errorRate: 12.5,
      avgDuration: 1500,
      p50Duration: 1200,
      p95Duration: 3500,
      p99Duration: 5000,
      coldStarts: 100,
      memoryUsage: 400,
      timeRange: '24h'
    },
    tags: ['data', 'processing']
  }
];

export const sampleDependencies: FunctionDependency[] = [
  { name: 'express', version: '4.18.2', type: 'production' },
  { name: 'jsonwebtoken', version: '9.0.0', type: 'production', outdated: true, latestVersion: '9.0.2' },
  { name: 'bcrypt', version: '5.1.0', type: 'production' },
  { name: 'lodash', version: '4.17.20', type: 'production', vulnerable: true, latestVersion: '4.17.21' },
  { name: 'typescript', version: '5.0.0', type: 'development' },
  { name: 'jest', version: '29.5.0', type: 'development' }
];

export const sampleVersions: FunctionVersion[] = [
  {
    version: '1.2.3',
    deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    deployedBy: 'john@example.com',
    commitSha: 'abc123def',
    branch: 'main',
    changelog: 'Added rate limiting and improved error handling',
    status: 'current',
    size: 256000
  },
  {
    version: '1.2.2',
    deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    deployedBy: 'jane@example.com',
    commitSha: 'def456ghi',
    branch: 'main',
    changelog: 'Fixed memory leak in session handler',
    status: 'previous',
    size: 248000
  },
  {
    version: '1.2.1',
    deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    deployedBy: 'john@example.com',
    commitSha: 'ghi789jkl',
    branch: 'hotfix/auth',
    changelog: 'Patched security vulnerability',
    status: 'archived',
    size: 245000
  }
];

export const sampleLogs: FunctionLog[] = [
  { id: '1', timestamp: new Date(), level: 'info', message: 'Function started', requestId: 'req-123' },
  { id: '2', timestamp: new Date(), level: 'debug', message: 'Processing request body', requestId: 'req-123' },
  { id: '3', timestamp: new Date(), level: 'info', message: 'User authenticated successfully', requestId: 'req-123', duration: 45 },
  { id: '4', timestamp: new Date(), level: 'warn', message: 'Rate limit threshold approaching', requestId: 'req-124' },
  { id: '5', timestamp: new Date(), level: 'error', message: 'Database connection timeout', requestId: 'req-125', duration: 30000 }
];

export const sampleSecrets: FunctionSecret[] = [
  { key: 'DATABASE_URL', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), source: 'vault', description: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), source: 'manual', description: 'JWT signing secret' },
  { key: 'SMTP_PASSWORD', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), source: 'env', description: 'SMTP server password' }
];
