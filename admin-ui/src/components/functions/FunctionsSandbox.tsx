// FunctionsSandbox.tsx - Sandbox Environment Components (Enhancements 21-30)
// Container Manager, Environment Variables, Console, Test Runner, Resource Monitor,
// Snapshot Manager, Network Inspector, Mock Data, Sandbox Compare, Deploy Button
// WITH ERROR HANDLING & ADMIN NOTIFICATIONS

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Play,
  Square,
  RefreshCw,
  Terminal,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Database,
  Cloud,
  CloudOff,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Save,
  RotateCcw,
  Camera,
  History,
  Activity,
  Zap,
  Bug,
  TestTube,
  Beaker,
  Network,
  Globe,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Filter,
  Search,
  MoreHorizontal,
  Loader2,
  Bell,
  BellRing,
  Mail,
  Smartphone,
  MessageSquare,
  Send,
  X,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Server,
  Container,
  Layers,
  GitBranch,
  Code,
  FileJson,
  Braces,
  Hash,
  Timer,
  Gauge,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SandboxContainer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error' | 'creating';
  environment: 'development' | 'staging' | 'testing';
  createdAt: Date;
  lastActivity: Date;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
  functionId?: string;
  version?: string;
  error?: SandboxError;
}

export interface SandboxError {
  id: string;
  type: 'runtime' | 'syntax' | 'timeout' | 'memory' | 'network' | 'permission' | 'dependency';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: Date;
  severity: 'critical' | 'error' | 'warning';
  resolved: boolean;
  notificationSent: boolean;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
  source: 'local' | 'inherited' | 'production';
  description?: string;
}

export interface ConsoleLog {
  id: string;
  timestamp: Date;
  type: 'log' | 'info' | 'warn' | 'error' | 'debug' | 'system';
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface TestResult {
  id: string;
  name: string;
  suite?: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: string;
  assertions?: number;
  logs?: string[];
}

export interface ResourceMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  size: number;
  containerId: string;
  status: 'ready' | 'creating' | 'restoring';
}

export interface NetworkRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status?: number;
  duration?: number;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  error?: string;
  timestamp: Date;
}

export interface MockDataTemplate {
  id: string;
  name: string;
  type: 'json' | 'csv' | 'xml';
  schema: Record<string, unknown>;
  sampleCount: number;
}

export interface AdminNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  source: 'sandbox' | 'function' | 'deployment' | 'security';
  error?: SandboxError;
}

export interface NotificationSettings {
  email: boolean;
  emailAddress?: string;
  slack: boolean;
  slackWebhook?: string;
  browser: boolean;
  sms: boolean;
  phoneNumber?: string;
  severityFilter: ('critical' | 'error' | 'warning')[];
}

// ============================================================================
// ERROR NOTIFICATION SYSTEM
// ============================================================================

interface ErrorNotificationBannerProps {
  error: SandboxError;
  onDismiss: () => void;
  onViewDetails: () => void;
  onNotifyAdmin?: () => void;
}

export function ErrorNotificationBanner({
  error,
  onDismiss,
  onViewDetails,
  onNotifyAdmin
}: ErrorNotificationBannerProps) {
  const getSeverityStyles = () => {
    switch (error.severity) {
      case 'critical':
        return 'bg-red-900/50 border-red-500 text-red-100';
      case 'error':
        return 'bg-red-800/30 border-red-600 text-red-200';
      case 'warning':
        return 'bg-yellow-900/30 border-yellow-600 text-yellow-200';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border-l-4",
        getSeverityStyles()
      )}
    >
      {getSeverityIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize">{error.severity} Error</span>
          <span className="text-xs opacity-75">{error.type}</span>
        </div>
        <p className="text-sm mt-1 opacity-90">{error.message}</p>
        {error.file && (
          <p className="text-xs mt-1 opacity-75 font-mono">
            {error.file}:{error.line}:{error.column}
          </p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onViewDetails}
            className="text-xs hover:underline flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
          {!error.notificationSent && onNotifyAdmin && (
            <button
              onClick={onNotifyAdmin}
              className="text-xs hover:underline flex items-center gap-1"
            >
              <Bell className="w-3 h-3" />
              Notify Admin
            </button>
          )}
          {error.notificationSent && (
            <span className="text-xs flex items-center gap-1 text-green-400">
              <CheckCircle className="w-3 h-3" />
              Admin Notified
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-white/10 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// ADMIN NOTIFICATION CENTER
// ============================================================================

interface AdminNotificationCenterProps {
  notifications: AdminNotification[];
  settings: NotificationSettings;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: (id: string) => void;
  onClearAll: () => void;
  onUpdateSettings: (settings: NotificationSettings) => void;
  onNavigate?: (url: string) => void;
}

export function AdminNotificationCenter({
  notifications,
  settings,
  onMarkRead,
  onMarkAllRead,
  onClear,
  onClearAll,
  onUpdateSettings,
  onNavigate
}: AdminNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setShowSettings(false);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#3c3c3c] rounded-lg text-gray-400 hover:text-white"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
                <h3 className="text-sm font-medium text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-b border-[#3c3c3c] overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider">Notification Channels</h4>

                      {/* Email */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">Email</span>
                        </div>
                        <button
                          onClick={() => setLocalSettings(s => ({ ...s, email: !s.email }))}
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors",
                            localSettings.email ? 'bg-green-500' : 'bg-gray-600'
                          )}
                        >
                          <motion.div
                            animate={{ x: localSettings.email ? 20 : 2 }}
                            className="w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>
                      {localSettings.email && (
                        <input
                          type="email"
                          placeholder="admin@example.com"
                          value={localSettings.emailAddress || ''}
                          onChange={(e) => setLocalSettings(s => ({ ...s, emailAddress: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500"
                        />
                      )}

                      {/* Slack */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">Slack</span>
                        </div>
                        <button
                          onClick={() => setLocalSettings(s => ({ ...s, slack: !s.slack }))}
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors",
                            localSettings.slack ? 'bg-green-500' : 'bg-gray-600'
                          )}
                        >
                          <motion.div
                            animate={{ x: localSettings.slack ? 20 : 2 }}
                            className="w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      {/* Browser */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">Browser Push</span>
                        </div>
                        <button
                          onClick={() => setLocalSettings(s => ({ ...s, browser: !s.browser }))}
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors",
                            localSettings.browser ? 'bg-green-500' : 'bg-gray-600'
                          )}
                        >
                          <motion.div
                            animate={{ x: localSettings.browser ? 20 : 2 }}
                            className="w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      {/* Severity Filter */}
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Notify on:</label>
                        <div className="flex gap-2">
                          {(['critical', 'error', 'warning'] as const).map(severity => (
                            <button
                              key={severity}
                              onClick={() => {
                                setLocalSettings(s => ({
                                  ...s,
                                  severityFilter: s.severityFilter.includes(severity)
                                    ? s.severityFilter.filter(sev => sev !== severity)
                                    : [...s.severityFilter, severity]
                                }));
                              }}
                              className={cn(
                                "px-2 py-1 text-xs rounded capitalize",
                                localSettings.severityFilter.includes(severity)
                                  ? severity === 'critical'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500'
                                    : severity === 'error'
                                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                                  : 'bg-[#3c3c3c] text-gray-400'
                              )}
                            >
                              {severity}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleSaveSettings}
                        className="w-full py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium"
                      >
                        Save Settings
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-4 border-b border-[#3c3c3c] hover:bg-[#2a2d2e] cursor-pointer",
                        !notification.read && 'bg-[#094771]/20'
                      )}
                      onClick={() => {
                        onMarkRead(notification.id);
                        if (notification.actionUrl) {
                          onNavigate?.(notification.actionUrl);
                        }
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{notification.title}</span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp.toLocaleString()}
                          <span className="px-1.5 py-0.5 bg-[#3c3c3c] rounded capitalize">
                            {notification.source}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClear(notification.id);
                        }}
                        className="p-1 hover:bg-[#3c3c3c] rounded text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2 border-t border-[#3c3c3c]">
                  <button
                    onClick={onClearAll}
                    className="w-full py-2 text-xs text-gray-400 hover:text-white hover:bg-[#3c3c3c] rounded"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 21: Sandbox Container Manager
// ============================================================================

interface SandboxContainerManagerProps {
  containers: SandboxContainer[];
  onStart: (containerId: string) => void;
  onStop: (containerId: string) => void;
  onRestart: (containerId: string) => void;
  onCreate: (name: string, environment: SandboxContainer['environment']) => void;
  onDelete: (containerId: string) => void;
  onSelect: (container: SandboxContainer) => void;
  selectedContainer?: string;
}

export function SandboxContainerManager({
  containers,
  onStart,
  onStop,
  onRestart,
  onCreate,
  onDelete,
  onSelect,
  selectedContainer
}: SandboxContainerManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [newContainerEnv, setNewContainerEnv] = useState<SandboxContainer['environment']>('development');

  const getStatusColor = (status: SandboxContainer['status']) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'stopped': return 'text-gray-400';
      case 'starting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'creating': return 'text-blue-400';
    }
  };

  const getStatusIcon = (status: SandboxContainer['status']) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <Square className="w-4 h-4" />;
      case 'starting': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'creating': return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Container className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Sandbox Containers</h3>
          <span className="text-xs text-gray-500">
            ({containers.filter(c => c.status === 'running').length}/{containers.length} running)
          </span>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New Sandbox
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-b border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Container name"
                value={newContainerName}
                onChange={(e) => setNewContainerName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                autoFocus
              />
              <select
                value={newContainerEnv}
                onChange={(e) => setNewContainerEnv(e.target.value as SandboxContainer['environment'])}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white focus:outline-none focus:border-[#007acc]"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="testing">Testing</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onCreate(newContainerName, newContainerEnv);
                    setNewContainerName('');
                    setShowCreateForm(false);
                  }}
                  disabled={!newContainerName}
                  className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container List */}
      <div className="divide-y divide-[#3c3c3c]">
        {containers.map(container => (
          <div
            key={container.id}
            className={cn(
              "p-4 hover:bg-[#2a2d2e] cursor-pointer",
              selectedContainer === container.id && 'bg-[#094771]',
              container.error && 'border-l-4 border-red-500'
            )}
            onClick={() => onSelect(container)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={getStatusColor(container.status)}>
                  {getStatusIcon(container.status)}
                </span>
                <span className="text-sm font-medium text-white">{container.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  container.environment === 'development' && 'bg-blue-500/20 text-blue-400',
                  container.environment === 'staging' && 'bg-yellow-500/20 text-yellow-400',
                  container.environment === 'testing' && 'bg-purple-500/20 text-purple-400'
                )}>
                  {container.environment}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {container.status === 'running' ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRestart(container.id); }}
                      className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                      title="Restart"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onStop(container.id); }}
                      className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                      title="Stop"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </>
                ) : container.status === 'stopped' || container.status === 'error' ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStart(container.id); }}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-green-400"
                    title="Start"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(container.id); }}
                  className="p-1.5 hover:bg-red-500/10 rounded text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Display */}
            {container.error && (
              <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-medium">{container.error.type} error</span>
                </div>
                <p className="text-xs text-red-300 mt-1">{container.error.message}</p>
              </div>
            )}

            {/* Resource Usage */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {container.resources.cpu}%
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {container.resources.memory} MB
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {container.lastActivity.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {containers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Container className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No sandbox containers</p>
            <p className="text-xs mt-1">Create one to start testing safely</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 22: Environment Variables Editor
// ============================================================================

interface EnvironmentEditorProps {
  variables: EnvironmentVariable[];
  onChange: (variables: EnvironmentVariable[]) => void;
  onImportFromProduction?: () => void;
}

export function EnvironmentEditor({
  variables,
  onChange,
  onImportFromProduction
}: EnvironmentEditorProps) {
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVariables = variables.filter(v =>
    v.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleShowValue = (key: string) => {
    const newShow = new Set(showValues);
    if (newShow.has(key)) {
      newShow.delete(key);
    } else {
      newShow.add(key);
    }
    setShowValues(newShow);
  };

  const addVariable = () => {
    onChange([
      ...variables,
      { key: '', value: '', isSecret: false, source: 'local' }
    ]);
  };

  const updateVariable = (index: number, updates: Partial<EnvironmentVariable>) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], ...updates };
    onChange(newVariables);
  };

  const removeVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Environment Variables</h3>
        </div>
        <div className="flex items-center gap-2">
          {onImportFromProduction && (
            <button
              onClick={onImportFromProduction}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#3c3c3c] rounded flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Import from Prod
            </button>
          )}
          <button
            onClick={addVariable}
            className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#3c3c3c]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* Variables List */}
      <div className="max-h-[400px] overflow-auto">
        {filteredVariables.map((variable, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 border-b border-[#3c3c3c] hover:bg-[#2a2d2e]"
          >
            <input
              type="text"
              placeholder="KEY"
              value={variable.key}
              onChange={(e) => updateVariable(index, { key: e.target.value.toUpperCase() })}
              className="w-1/3 px-3 py-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
            />
            <span className="text-gray-500">=</span>
            <div className="flex-1 relative">
              <input
                type={variable.isSecret && !showValues.has(variable.key) ? 'password' : 'text'}
                placeholder="value"
                value={variable.value}
                onChange={(e) => updateVariable(index, { value: e.target.value })}
                className="w-full px-3 py-1.5 pr-8 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
              />
              {variable.isSecret && (
                <button
                  onClick={() => toggleShowValue(variable.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showValues.has(variable.key) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <button
              onClick={() => updateVariable(index, { isSecret: !variable.isSecret })}
              className={cn(
                "p-1.5 rounded",
                variable.isSecret ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
              title={variable.isSecret ? 'Secret' : 'Not secret'}
            >
              {variable.isSecret ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              variable.source === 'production' && 'bg-red-500/20 text-red-400',
              variable.source === 'inherited' && 'bg-blue-500/20 text-blue-400',
              variable.source === 'local' && 'bg-gray-500/20 text-gray-400'
            )}>
              {variable.source}
            </span>
            <button
              onClick={() => removeVariable(index)}
              className="p-1.5 hover:bg-red-500/10 rounded text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredVariables.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No environment variables</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 23: Sandbox Console with Real-time Logs
// ============================================================================

interface SandboxConsoleProps {
  logs: ConsoleLog[];
  isConnected: boolean;
  onCommand?: (command: string) => void;
  onClear: () => void;
  onExport?: () => void;
}

export function SandboxConsole({
  logs,
  isConnected,
  onCommand,
  onClear,
  onExport
}: SandboxConsoleProps) {
  const [command, setCommand] = useState('');
  const [filter, setFilter] = useState<ConsoleLog['type'] | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  const getLogStyles = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-gray-500';
      case 'system': return 'text-purple-400 italic';
      default: return 'text-gray-300';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && onCommand) {
      onCommand(command);
      setCommand('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Console</h3>
          <span className={cn(
            "flex items-center gap-1 text-xs",
            isConnected ? 'text-green-400' : 'text-red-400'
          )}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-2 py-1 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-xs text-gray-300"
          >
            <option value="all">All</option>
            <option value="log">Log</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "p-1.5 rounded",
              autoScroll ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
            title="Auto-scroll"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
              title="Export logs"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div
        ref={consoleRef}
        className="flex-1 overflow-auto font-mono text-sm p-3 space-y-1"
      >
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className={cn("px-2 py-1 rounded", getLogStyles(log.type))}
          >
            <span className="text-gray-600 text-xs mr-2">
              [{log.timestamp.toLocaleTimeString()}]
            </span>
            {log.source && (
              <span className="text-purple-400 text-xs mr-2">[{log.source}]</span>
            )}
            <span className="whitespace-pre-wrap">{log.message}</span>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No logs to display</p>
          </div>
        )}
      </div>

      {/* Command Input */}
      {onCommand && (
        <form onSubmit={handleSubmit} className="flex items-center border-t border-[#3c3c3c]">
          <span className="px-3 text-green-400 font-mono">&gt;</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 px-2 py-3 bg-transparent text-white font-mono text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={!command.trim()}
            className="px-4 py-3 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 24: Test Runner Panel with Results
// ============================================================================

interface TestRunnerPanelProps {
  tests: TestResult[];
  isRunning: boolean;
  onRun: (testIds?: string[]) => void;
  onStop: () => void;
  onTestClick: (test: TestResult) => void;
}

export function TestRunnerPanel({
  tests,
  isRunning,
  onRun,
  onStop,
  onTestClick
}: TestRunnerPanelProps) {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'skipped'>('all');
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());

  const stats = {
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    skipped: tests.filter(t => t.status === 'skipped').length,
    pending: tests.filter(t => t.status === 'pending').length,
    total: tests.length,
    duration: tests.reduce((sum, t) => sum + t.duration, 0)
  };

  const filteredTests = filter === 'all'
    ? tests
    : tests.filter(t => t.status === filter);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'skipped': return <Minus className="w-4 h-4 text-yellow-400" />;
      case 'pending': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    }
  };

  const toggleTestSelection = (testId: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedTests(newSelected);
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Test Runner</h3>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={onStop}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium flex items-center gap-1"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={() => onRun(selectedTests.size > 0 ? Array.from(selectedTests) : undefined)}
              className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
            >
              <Play className="w-4 h-4" />
              {selectedTests.size > 0 ? `Run Selected (${selectedTests.size})` : 'Run All'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#3c3c3c] text-xs">
        <span className="text-green-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> {stats.passed} passed
        </span>
        <span className="text-red-400 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> {stats.failed} failed
        </span>
        <span className="text-yellow-400 flex items-center gap-1">
          <Minus className="w-3 h-3" /> {stats.skipped} skipped
        </span>
        <span className="text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {stats.duration}ms
        </span>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#3c3c3c]">
        {(['all', 'passed', 'failed', 'skipped'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2 py-1 text-xs rounded capitalize",
              filter === f ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tests List */}
      <div className="flex-1 overflow-auto">
        {filteredTests.map(test => (
          <div
            key={test.id}
            className={cn(
              "flex items-start gap-3 p-3 border-b border-[#3c3c3c] hover:bg-[#2a2d2e] cursor-pointer",
              test.status === 'failed' && 'bg-red-900/10'
            )}
            onClick={() => onTestClick(test)}
          >
            <input
              type="checkbox"
              checked={selectedTests.has(test.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleTestSelection(test.id);
              }}
              className="mt-1"
            />
            {getStatusIcon(test.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">{test.name}</span>
                <span className="text-xs text-gray-500">{test.duration}ms</span>
              </div>
              {test.suite && (
                <span className="text-xs text-gray-500">{test.suite}</span>
              )}
              {test.error && (
                <div className="mt-2 p-2 bg-red-900/20 rounded text-xs text-red-300 font-mono">
                  {test.error}
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredTests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <TestTube className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No tests to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 25: Sandbox Resource Monitor (CPU/Memory)
// ============================================================================

interface ResourceMonitorProps {
  currentMetrics: ResourceMetrics;
  history: ResourceMetrics[];
  limits: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export function ResourceMonitor({
  currentMetrics,
  history,
  limits
}: ResourceMonitorProps) {
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h'>('5m');

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Resource Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          {(['1m', '5m', '15m', '1h'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-2 py-1 text-xs rounded",
                timeRange === range ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">CPU</span>
            </div>
            <span className={cn("text-sm font-medium", getUsageColor(currentMetrics.cpu, limits.cpu))}>
              {currentMetrics.cpu}%
            </span>
          </div>
          <div className="h-2 bg-[#3c3c3c] rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", getProgressColor(currentMetrics.cpu, limits.cpu))}
              initial={{ width: 0 }}
              animate={{ width: `${(currentMetrics.cpu / limits.cpu) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">Limit: {limits.cpu}%</span>
        </div>

        {/* Memory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Memory</span>
            </div>
            <span className={cn("text-sm font-medium", getUsageColor(currentMetrics.memory, limits.memory))}>
              {currentMetrics.memory} MB
            </span>
          </div>
          <div className="h-2 bg-[#3c3c3c] rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", getProgressColor(currentMetrics.memory, limits.memory))}
              initial={{ width: 0 }}
              animate={{ width: `${(currentMetrics.memory / limits.memory) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">Limit: {limits.memory} MB</span>
        </div>

        {/* Disk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Disk</span>
            </div>
            <span className={cn("text-sm font-medium", getUsageColor(currentMetrics.disk, limits.disk))}>
              {currentMetrics.disk} MB
            </span>
          </div>
          <div className="h-2 bg-[#3c3c3c] rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", getProgressColor(currentMetrics.disk, limits.disk))}
              initial={{ width: 0 }}
              animate={{ width: `${(currentMetrics.disk / limits.disk) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">Limit: {limits.disk} MB</span>
        </div>
      </div>

      {/* Network Stats */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 p-3 bg-[#1e1e1e] rounded">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Network</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TrendingDown className="w-3 h-3 text-green-400" />
            <span className="text-green-400">{(currentMetrics.network.bytesIn / 1024).toFixed(1)} KB/s</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400">{(currentMetrics.network.bytesOut / 1024).toFixed(1)} KB/s</span>
          </div>
        </div>
      </div>

      {/* Mini Chart (simplified) */}
      <div className="px-4 pb-4">
        <div className="h-16 bg-[#1e1e1e] rounded flex items-end gap-0.5 p-2">
          {history.slice(-30).map((metric, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500/50 rounded-t"
              style={{ height: `${(metric.cpu / limits.cpu) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 26: Snapshot & Restore Manager
// ============================================================================

interface SnapshotManagerProps {
  snapshots: Snapshot[];
  onCreateSnapshot: (name: string, description?: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  onDownloadSnapshot?: (snapshotId: string) => void;
}

export function SnapshotManager({
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onDownloadSnapshot
}: SnapshotManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('');

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
          <Camera className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Snapshots</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <Camera className="w-4 h-4" />
          Create Snapshot
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-b border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Snapshot name"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={newSnapshotDesc}
                onChange={(e) => setNewSnapshotDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc] resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onCreateSnapshot(newSnapshotName, newSnapshotDesc || undefined);
                    setNewSnapshotName('');
                    setNewSnapshotDesc('');
                    setShowCreateForm(false);
                  }}
                  disabled={!newSnapshotName}
                  className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snapshots List */}
      <div className="max-h-[300px] overflow-auto">
        {snapshots.map(snapshot => (
          <div
            key={snapshot.id}
            className="flex items-center justify-between p-4 border-b border-[#3c3c3c] hover:bg-[#2a2d2e]"
          >
            <div className="flex items-center gap-3">
              {snapshot.status === 'creating' || snapshot.status === 'restoring' ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <span className="text-sm font-medium text-white">{snapshot.name}</span>
                {snapshot.description && (
                  <p className="text-xs text-gray-500">{snapshot.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{snapshot.createdAt.toLocaleString()}</span>
                  <span>{formatSize(snapshot.size)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRestoreSnapshot(snapshot.id)}
                disabled={snapshot.status !== 'ready'}
                className="p-1.5 hover:bg-[#3c3c3c] rounded text-green-400 disabled:opacity-50"
                title="Restore"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {onDownloadSnapshot && (
                <button
                  onClick={() => onDownloadSnapshot(snapshot.id)}
                  disabled={snapshot.status !== 'ready'}
                  className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400 disabled:opacity-50"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDeleteSnapshot(snapshot.id)}
                className="p-1.5 hover:bg-red-500/10 rounded text-red-400"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {snapshots.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No snapshots yet</p>
            <p className="text-xs mt-1">Create a snapshot to save your sandbox state</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 27: Sandbox Network Inspector
// ============================================================================

interface NetworkInspectorProps {
  requests: NetworkRequest[];
  onRequestSelect: (request: NetworkRequest) => void;
  selectedRequest?: NetworkRequest;
  onClear: () => void;
}

export function NetworkInspector({
  requests,
  onRequestSelect,
  selectedRequest,
  onClear
}: NetworkInspectorProps) {
  const [filter, setFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState<string | 'all'>('all');

  const filteredRequests = requests.filter(req => {
    const matchesUrl = req.url.toLowerCase().includes(filter.toLowerCase());
    const matchesMethod = methodFilter === 'all' || req.method === methodFilter;
    return matchesUrl && matchesMethod;
  });

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-400';
    if (status >= 500) return 'text-red-400';
    if (status >= 400) return 'text-yellow-400';
    if (status >= 300) return 'text-blue-400';
    return 'text-green-400';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-400';
      case 'POST': return 'text-blue-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      case 'PATCH': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Network Inspector</h3>
          <span className="text-xs text-gray-500">({requests.length} requests)</span>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-3 border-b border-[#3c3c3c]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filter URLs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-gray-300 focus:outline-none"
        >
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-auto">
        {filteredRequests.map(request => (
          <button
            key={request.id}
            onClick={() => onRequestSelect(request)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-left border-b border-[#3c3c3c] hover:bg-[#2a2d2e]",
              selectedRequest?.id === request.id && 'bg-[#094771]',
              request.error && 'bg-red-900/10'
            )}
          >
            <span className={cn("text-xs font-mono w-12", getMethodColor(request.method))}>
              {request.method}
            </span>
            <span className={cn("text-sm w-12 text-center", getStatusColor(request.status))}>
              {request.status || '--'}
            </span>
            <span className="flex-1 text-sm text-gray-300 truncate font-mono">
              {request.url}
            </span>
            <span className="text-xs text-gray-500">
              {request.duration ? `${request.duration}ms` : '--'}
            </span>
          </button>
        ))}
        {filteredRequests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Network className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No network requests</p>
          </div>
        )}
      </div>

      {/* Request Details */}
      {selectedRequest && (
        <div className="border-t border-[#3c3c3c] max-h-[200px] overflow-auto">
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Request Headers</h4>
              <pre className="text-xs text-gray-300 bg-[#1e1e1e] p-2 rounded overflow-auto">
                {JSON.stringify(selectedRequest.requestHeaders, null, 2)}
              </pre>
            </div>
            {selectedRequest.requestBody && (
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Request Body</h4>
                <pre className="text-xs text-gray-300 bg-[#1e1e1e] p-2 rounded overflow-auto">
                  {selectedRequest.requestBody}
                </pre>
              </div>
            )}
            {selectedRequest.responseBody && (
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Response Body</h4>
                <pre className="text-xs text-gray-300 bg-[#1e1e1e] p-2 rounded overflow-auto max-h-[100px]">
                  {selectedRequest.responseBody}
                </pre>
              </div>
            )}
            {selectedRequest.error && (
              <div className="p-2 bg-red-900/20 rounded border border-red-500/30">
                <span className="text-xs text-red-400">{selectedRequest.error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 28: Mock Data Generator
// ============================================================================

interface MockDataGeneratorProps {
  templates: MockDataTemplate[];
  onGenerate: (templateId: string, count: number) => void;
  onCreateTemplate: (template: Omit<MockDataTemplate, 'id'>) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export function MockDataGenerator({
  templates,
  onGenerate,
  onCreateTemplate,
  onDeleteTemplate
}: MockDataGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [count, setCount] = useState(10);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<'json' | 'csv' | 'xml'>('json');

  const dataTypes = [
    { name: 'id', icon: <Hash className="w-3 h-3" /> },
    { name: 'name', icon: <Code className="w-3 h-3" /> },
    { name: 'email', icon: <Mail className="w-3 h-3" /> },
    { name: 'date', icon: <Clock className="w-3 h-3" /> },
    { name: 'number', icon: <Braces className="w-3 h-3" /> },
    { name: 'boolean', icon: <CheckCircle className="w-3 h-3" /> },
  ];

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Mock Data Generator</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Templates */}
      <div className="p-4 space-y-4">
        {templates.map(template => (
          <div
            key={template.id}
            className={cn(
              "p-4 border rounded-lg cursor-pointer transition-colors",
              selectedTemplate === template.id
                ? 'border-[#007acc] bg-[#094771]/20'
                : 'border-[#3c3c3c] hover:border-[#007acc]/50'
            )}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">{template.name}</span>
                <span className="text-xs px-2 py-0.5 bg-[#3c3c3c] rounded uppercase">
                  {template.type}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTemplate(template.id);
                }}
                className="p-1 hover:bg-red-500/10 rounded text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(template.schema).map(field => (
                <span key={field} className="text-xs px-2 py-1 bg-[#1e1e1e] rounded text-gray-400">
                  {field}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Generate Controls */}
        {selectedTemplate && (
          <div className="flex items-center gap-3 pt-4 border-t border-[#3c3c3c]">
            <label className="text-sm text-gray-400">Count:</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white focus:outline-none focus:border-[#007acc]"
            />
            <button
              onClick={() => onGenerate(selectedTemplate, count)}
              className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Generate {count} Records
            </button>
          </div>
        )}

        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Beaker className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No templates yet</p>
            <p className="text-xs mt-1">Create a template to generate mock data</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 29: Sandbox Comparison (Prod vs Test)
// ============================================================================

interface SandboxComparisonProps {
  productionData: Record<string, unknown>;
  sandboxData: Record<string, unknown>;
  differences: ComparisonDiff[];
}

interface ComparisonDiff {
  path: string;
  type: 'added' | 'removed' | 'changed';
  productionValue?: unknown;
  sandboxValue?: unknown;
}

export function SandboxComparison({
  productionData,
  sandboxData,
  differences
}: SandboxComparisonProps) {
  const [viewMode, setViewMode] = useState<'diff' | 'side-by-side'>('diff');

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Environment Comparison</h3>
          <span className="text-xs text-gray-500">({differences.length} differences)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('diff')}
            className={cn(
              "px-3 py-1 text-xs rounded",
              viewMode === 'diff' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
          >
            Diff
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={cn(
              "px-3 py-1 text-xs rounded",
              viewMode === 'side-by-side' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Comparison View */}
      <div className="max-h-[400px] overflow-auto">
        {viewMode === 'diff' ? (
          <div className="divide-y divide-[#3c3c3c]">
            {differences.map((diff, index) => (
              <div key={index} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {diff.type === 'added' && <Plus className="w-4 h-4 text-green-400" />}
                  {diff.type === 'removed' && <Minus className="w-4 h-4 text-red-400" />}
                  {diff.type === 'changed' && <Edit3 className="w-4 h-4 text-yellow-400" />}
                  <span className="text-sm text-gray-300 font-mono">{diff.path}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {diff.productionValue !== undefined && (
                    <div className="p-2 bg-red-900/20 rounded">
                      <span className="text-gray-500">Production: </span>
                      <span className="text-red-300">{JSON.stringify(diff.productionValue)}</span>
                    </div>
                  )}
                  {diff.sandboxValue !== undefined && (
                    <div className="p-2 bg-green-900/20 rounded">
                      <span className="text-gray-500">Sandbox: </span>
                      <span className="text-green-300">{JSON.stringify(diff.sandboxValue)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {differences.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">Environments are identical</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex">
            <div className="flex-1 border-r border-[#3c3c3c]">
              <div className="p-3 bg-[#1e1e1e] border-b border-[#3c3c3c] text-xs text-gray-500 uppercase tracking-wider">
                Production
              </div>
              <pre className="p-4 text-xs text-gray-300 font-mono">
                {JSON.stringify(productionData, null, 2)}
              </pre>
            </div>
            <div className="flex-1">
              <div className="p-3 bg-[#1e1e1e] border-b border-[#3c3c3c] text-xs text-gray-500 uppercase tracking-wider">
                Sandbox
              </div>
              <pre className="p-4 text-xs text-gray-300 font-mono">
                {JSON.stringify(sandboxData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 30: One-Click Deploy to Sandbox
// ============================================================================

interface DeployToSandboxProps {
  functionName: string;
  version?: string;
  branch?: string;
  commit?: string;
  sandboxes: SandboxContainer[];
  onDeploy: (sandboxId: string, options: DeployOptions) => void;
  isDeploying?: boolean;
  deploymentStatus?: DeploymentStatus;
}

interface DeployOptions {
  skipTests: boolean;
  hotReload: boolean;
  preserveState: boolean;
}

interface DeploymentStatus {
  stage: 'preparing' | 'building' | 'testing' | 'deploying' | 'verifying' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: SandboxError;
}

export function DeployToSandbox({
  functionName,
  version,
  branch,
  commit,
  sandboxes,
  onDeploy,
  isDeploying,
  deploymentStatus
}: DeployToSandboxProps) {
  const [selectedSandbox, setSelectedSandbox] = useState<string>('');
  const [options, setOptions] = useState<DeployOptions>({
    skipTests: false,
    hotReload: true,
    preserveState: true
  });

  const runningSandboxes = sandboxes.filter(s => s.status === 'running');

  const getStageIcon = (stage: DeploymentStatus['stage']) => {
    switch (stage) {
      case 'preparing': return <Settings className="w-4 h-4" />;
      case 'building': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'testing': return <TestTube className="w-4 h-4" />;
      case 'deploying': return <Upload className="w-4 h-4" />;
      case 'verifying': return <Shield className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-medium text-white">Deploy to Sandbox</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Function Info */}
        <div className="p-3 bg-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">{functionName}</span>
            </div>
            {version && (
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                v{version}
              </span>
            )}
          </div>
          {(branch || commit) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {branch && (
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {branch}
                </span>
              )}
              {commit && (
                <span className="font-mono">{commit.substring(0, 7)}</span>
              )}
            </div>
          )}
        </div>

        {/* Sandbox Selection */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Target Sandbox</label>
          <select
            value={selectedSandbox}
            onChange={(e) => setSelectedSandbox(e.target.value)}
            className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white focus:outline-none focus:border-[#007acc]"
          >
            <option value="">Select a sandbox...</option>
            {runningSandboxes.map(sandbox => (
              <option key={sandbox.id} value={sandbox.id}>
                {sandbox.name} ({sandbox.environment})
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="block text-xs text-gray-500 mb-2">Deployment Options</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.hotReload}
                onChange={(e) => setOptions(o => ({ ...o, hotReload: e.target.checked }))}
                className="rounded bg-[#1e1e1e] border-[#3c3c3c]"
              />
              <span className="text-sm text-gray-300">Hot Reload (no restart)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.preserveState}
                onChange={(e) => setOptions(o => ({ ...o, preserveState: e.target.checked }))}
                className="rounded bg-[#1e1e1e] border-[#3c3c3c]"
              />
              <span className="text-sm text-gray-300">Preserve sandbox state</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.skipTests}
                onChange={(e) => setOptions(o => ({ ...o, skipTests: e.target.checked }))}
                className="rounded bg-[#1e1e1e] border-[#3c3c3c]"
              />
              <span className="text-sm text-gray-300">Skip tests (faster)</span>
            </label>
          </div>
        </div>

        {/* Deployment Status */}
        {deploymentStatus && (
          <div className={cn(
            "p-4 rounded-lg border",
            deploymentStatus.stage === 'failed'
              ? 'bg-red-900/20 border-red-500/50'
              : deploymentStatus.stage === 'completed'
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-[#1e1e1e] border-[#3c3c3c]'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {getStageIcon(deploymentStatus.stage)}
              <span className="text-sm font-medium text-white capitalize">
                {deploymentStatus.stage}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{deploymentStatus.message}</p>
            <div className="h-2 bg-[#3c3c3c] rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  deploymentStatus.stage === 'failed' ? 'bg-red-500' :
                  deploymentStatus.stage === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${deploymentStatus.progress}%` }}
              />
            </div>
            {deploymentStatus.error && (
              <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-500/30">
                <p className="text-xs text-red-400">{deploymentStatus.error.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Deploy Button */}
        <button
          onClick={() => selectedSandbox && onDeploy(selectedSandbox, options)}
          disabled={!selectedSandbox || isDeploying}
          className={cn(
            "w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            isDeploying
              ? 'bg-blue-600 text-white cursor-wait'
              : selectedSandbox
                ? 'bg-[#238636] hover:bg-[#2ea043] text-white'
                : 'bg-[#3c3c3c] text-gray-500 cursor-not-allowed'
          )}
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Deploy to Sandbox
            </>
          )}
        </button>

        {/* Warning */}
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Deploying to sandbox will not affect production. Test thoroughly before promoting to production.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleSandboxContainers: SandboxContainer[] = [
  {
    id: '1',
    name: 'dev-sandbox-1',
    status: 'running',
    environment: 'development',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
    resources: { cpu: 45, memory: 256, disk: 128 }
  },
  {
    id: '2',
    name: 'staging-sandbox',
    status: 'running',
    environment: 'staging',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    resources: { cpu: 12, memory: 128, disk: 64 }
  },
  {
    id: '3',
    name: 'test-sandbox',
    status: 'error',
    environment: 'testing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    lastActivity: new Date(Date.now() - 1000 * 60 * 60),
    resources: { cpu: 0, memory: 0, disk: 32 },
    error: {
      id: 'err-1',
      type: 'runtime',
      message: 'Function exceeded memory limit of 256MB',
      severity: 'error',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      resolved: false,
      notificationSent: false
    }
  }
];

export const sampleConsoleLogs: ConsoleLog[] = [
  { id: '1', timestamp: new Date(), type: 'system', message: 'Sandbox container started' },
  { id: '2', timestamp: new Date(), type: 'info', message: 'Function loaded successfully', source: 'runtime' },
  { id: '3', timestamp: new Date(), type: 'log', message: 'Processing request...' },
  { id: '4', timestamp: new Date(), type: 'debug', message: 'Input validation passed', source: 'validator' },
  { id: '5', timestamp: new Date(), type: 'warn', message: 'Deprecated API call detected' },
  { id: '6', timestamp: new Date(), type: 'error', message: 'Failed to connect to database: Connection timeout', source: 'database' },
];

export const sampleTestResults: TestResult[] = [
  { id: '1', name: 'should authenticate user', suite: 'Auth', status: 'passed', duration: 45, assertions: 3 },
  { id: '2', name: 'should reject invalid password', suite: 'Auth', status: 'passed', duration: 32, assertions: 2 },
  { id: '3', name: 'should handle database errors', suite: 'Database', status: 'failed', duration: 156, error: 'Expected error to be thrown but resolved successfully' },
  { id: '4', name: 'should cache responses', suite: 'Cache', status: 'passed', duration: 12, assertions: 1 },
  { id: '5', name: 'should rate limit requests', suite: 'Security', status: 'skipped', duration: 0 },
];

export const sampleNotifications: AdminNotification[] = [
  {
    id: '1',
    type: 'error',
    title: 'Sandbox Error',
    message: 'Function exceeded memory limit in test-sandbox',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    source: 'sandbox',
    actionUrl: '/sandbox/test-sandbox'
  },
  {
    id: '2',
    type: 'warning',
    title: 'High CPU Usage',
    message: 'dev-sandbox-1 is using 85% CPU for over 5 minutes',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    source: 'sandbox'
  },
  {
    id: '3',
    type: 'success',
    title: 'Deployment Successful',
    message: 'Function auth-handler deployed to staging-sandbox',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: true,
    source: 'deployment'
  }
];

export const sampleNotificationSettings: NotificationSettings = {
  email: true,
  emailAddress: 'admin@rustpress.io',
  slack: true,
  slackWebhook: 'https://hooks.slack.com/services/...',
  browser: true,
  sms: false,
  severityFilter: ['critical', 'error']
};
