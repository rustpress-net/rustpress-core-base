/**
 * ScheduledTasks - Cron job and scheduled task management
 * RustPress-specific task scheduling functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Play, Pause, Trash2, Edit2, Plus, RefreshCw,
  Calendar, CheckCircle, XCircle, AlertTriangle, History,
  Settings, Timer, Zap, Database, Mail, FileText
} from 'lucide-react';

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  schedule: string;
  scheduleHuman: string;
  command: string;
  type: 'system' | 'custom' | 'plugin';
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  lastResult?: 'success' | 'failure' | 'running';
  nextRun?: string;
  runCount: number;
  avgDuration: number;
  logs?: TaskLog[];
}

export interface TaskLog {
  id: string;
  timestamp: string;
  result: 'success' | 'failure';
  duration: number;
  message?: string;
}

interface ScheduledTasksProps {
  onRun?: (task: ScheduledTask) => void;
  onSave?: (tasks: ScheduledTask[]) => void;
}

const mockTasks: ScheduledTask[] = [
  {
    id: '1',
    name: 'Database Cleanup',
    description: 'Remove expired sessions and transient data',
    schedule: '0 3 * * *',
    scheduleHuman: 'Daily at 3:00 AM',
    command: 'rustpress db:cleanup',
    type: 'system',
    status: 'active',
    lastRun: '2024-01-16 03:00:00',
    lastResult: 'success',
    nextRun: '2024-01-17 03:00:00',
    runCount: 365,
    avgDuration: 45
  },
  {
    id: '2',
    name: 'Backup Database',
    description: 'Create automated database backup',
    schedule: '0 2 * * *',
    scheduleHuman: 'Daily at 2:00 AM',
    command: 'rustpress backup:database',
    type: 'system',
    status: 'active',
    lastRun: '2024-01-16 02:00:00',
    lastResult: 'success',
    nextRun: '2024-01-17 02:00:00',
    runCount: 365,
    avgDuration: 120
  },
  {
    id: '3',
    name: 'Send Newsletter',
    description: 'Send scheduled newsletter to subscribers',
    schedule: '0 9 * * 1',
    scheduleHuman: 'Every Monday at 9:00 AM',
    command: 'rustpress newsletter:send',
    type: 'plugin',
    status: 'active',
    lastRun: '2024-01-15 09:00:00',
    lastResult: 'success',
    nextRun: '2024-01-22 09:00:00',
    runCount: 52,
    avgDuration: 180
  },
  {
    id: '4',
    name: 'Update Search Index',
    description: 'Rebuild search index for new content',
    schedule: '*/30 * * * *',
    scheduleHuman: 'Every 30 minutes',
    command: 'rustpress search:reindex',
    type: 'system',
    status: 'active',
    lastRun: '2024-01-16 10:00:00',
    lastResult: 'running',
    nextRun: '2024-01-16 10:30:00',
    runCount: 17520,
    avgDuration: 25
  },
  {
    id: '5',
    name: 'Sitemap Generation',
    description: 'Regenerate sitemap.xml for SEO',
    schedule: '0 4 * * *',
    scheduleHuman: 'Daily at 4:00 AM',
    command: 'rustpress seo:sitemap',
    type: 'plugin',
    status: 'active',
    lastRun: '2024-01-16 04:00:00',
    lastResult: 'success',
    nextRun: '2024-01-17 04:00:00',
    runCount: 365,
    avgDuration: 15
  },
  {
    id: '6',
    name: 'Image Optimization',
    description: 'Optimize newly uploaded images',
    schedule: '0 */6 * * *',
    scheduleHuman: 'Every 6 hours',
    command: 'rustpress media:optimize',
    type: 'plugin',
    status: 'paused',
    lastRun: '2024-01-15 18:00:00',
    lastResult: 'failure',
    nextRun: null,
    runCount: 1460,
    avgDuration: 300
  },
  {
    id: '7',
    name: 'Security Scan',
    description: 'Run security vulnerability scan',
    schedule: '0 1 * * 0',
    scheduleHuman: 'Weekly on Sunday at 1:00 AM',
    command: 'rustpress security:scan',
    type: 'system',
    status: 'error',
    lastRun: '2024-01-14 01:00:00',
    lastResult: 'failure',
    nextRun: '2024-01-21 01:00:00',
    runCount: 52,
    avgDuration: 600
  },
];

const schedulePresets = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 3 AM', value: '0 3 * * *' },
  { label: 'Weekly on Sunday', value: '0 0 * * 0' },
  { label: 'Monthly on 1st', value: '0 0 1 * *' },
];

export const ScheduledTasks: React.FC<ScheduledTasksProps> = ({
  onRun,
  onSave
}) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'active' ? 'paused' : 'active' };
      }
      return t;
    }));
  };

  const handleRunNow = (task: ScheduledTask) => {
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, lastResult: 'running' } : t
    ));
    onRun?.(task);
    // Simulate completion
    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === task.id ? {
          ...t,
          lastResult: 'success',
          lastRun: new Date().toISOString(),
          runCount: t.runCount + 1
        } : t
      ));
    }, 2000);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10';
      case 'error': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getResultIcon = (result?: string) => {
    switch (result) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Database className="w-4 h-4" />;
      case 'plugin': return <Zap className="w-4 h-4" />;
      case 'custom': return <FileText className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const filteredTasks = tasks.filter(task =>
    !statusFilter || task.status === statusFilter
  );

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Scheduled Tasks
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{tasks.length}</div>
              <div className="text-xs text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{tasks.filter(t => t.status === 'active').length}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.lastResult === 'running').length}</div>
              <div className="text-xs text-gray-400">Running</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{tasks.filter(t => t.status === 'error' || t.lastResult === 'failure').length}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                !statusFilter ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                statusFilter === 'paused' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setStatusFilter('error')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                statusFilter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Errors
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTask(task)}
                className={`bg-gray-800/50 rounded-lg p-4 cursor-pointer border-2 transition-colors ${
                  selectedTask?.id === task.id ? 'border-purple-500' : 'border-transparent hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <span className="text-purple-400">{getTypeIcon(task.type)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{task.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.scheduleHuman}
                      </span>
                      <span className="flex items-center gap-1">
                        <History className="w-3 h-3" />
                        {task.runCount} runs
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        ~{formatDuration(task.avgDuration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getResultIcon(task.lastResult)}
                      <span className="text-xs text-gray-400">
                        {task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRunNow(task); }}
                        disabled={task.lastResult === 'running'}
                        className="p-1.5 hover:bg-gray-700 rounded disabled:opacity-50"
                        title="Run now"
                      >
                        <Play className="w-4 h-4 text-green-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id); }}
                        className="p-1.5 hover:bg-gray-700 rounded"
                        title={task.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {task.status === 'active' ? (
                          <Pause className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        className="p-1.5 hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm">Create a scheduled task to automate operations</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Task Details */}
      {selectedTask && (
        <div className="w-80 border-l border-gray-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-white">Task Details</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Command</label>
              <code className="block p-2 bg-gray-800 rounded text-sm text-cyan-400 font-mono">
                {selectedTask.command}
              </code>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Cron Expression</label>
              <code className="block p-2 bg-gray-800 rounded text-sm text-purple-400 font-mono">
                {selectedTask.schedule}
              </code>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Next Run</label>
              <p className="text-white">
                {selectedTask.nextRun ? new Date(selectedTask.nextRun).toLocaleString() : 'Not scheduled'}
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Statistics</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded p-2">
                  <div className="text-lg font-bold text-white">{selectedTask.runCount}</div>
                  <div className="text-xs text-gray-500">Total runs</div>
                </div>
                <div className="bg-gray-800 rounded p-2">
                  <div className="text-lg font-bold text-white">{formatDuration(selectedTask.avgDuration)}</div>
                  <div className="text-xs text-gray-500">Avg duration</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Recent Logs</label>
              <div className="space-y-1 max-h-48 overflow-auto">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-800/50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-gray-400">Jan {16 - i}, 2024</span>
                    </div>
                    <span className="text-gray-500">{Math.floor(Math.random() * 60) + 10}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledTasks;
