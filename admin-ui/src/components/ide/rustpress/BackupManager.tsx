/**
 * BackupManager - Create, restore, and manage backups
 * RustPress-specific backup functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Download, Upload, Trash2, Clock, HardDrive,
  CheckCircle, AlertCircle, RefreshCw, Calendar, Database,
  FileText, Image, Settings, Cloud, FolderArchive, Play
} from 'lucide-react';

export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'database' | 'files' | 'media' | 'config';
  size: number;
  createdAt: string;
  status: 'completed' | 'in_progress' | 'failed';
  storage: 'local' | 'cloud';
  includes: string[];
  downloadUrl?: string;
}

export interface BackupSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retainCount: number;
  type: 'full' | 'database';
}

interface BackupManagerProps {
  onCreateBackup?: (type: string) => void;
  onRestoreBackup?: (backup: Backup) => void;
  onDeleteBackup?: (backup: Backup) => void;
}

// Mock data
const mockBackups: Backup[] = [
  {
    id: '1',
    name: 'Full Backup - Jan 15, 2024',
    type: 'full',
    size: 256000000,
    createdAt: '2024-01-15T03:00:00Z',
    status: 'completed',
    storage: 'local',
    includes: ['database', 'uploads', 'themes', 'plugins', 'config'],
    downloadUrl: '/backups/full-2024-01-15.zip'
  },
  {
    id: '2',
    name: 'Database Backup - Jan 15, 2024',
    type: 'database',
    size: 12500000,
    createdAt: '2024-01-15T12:00:00Z',
    status: 'completed',
    storage: 'cloud',
    includes: ['database'],
    downloadUrl: '/backups/db-2024-01-15.sql'
  },
  {
    id: '3',
    name: 'Media Backup - Jan 14, 2024',
    type: 'media',
    size: 185000000,
    createdAt: '2024-01-14T03:00:00Z',
    status: 'completed',
    storage: 'local',
    includes: ['uploads', 'media'],
    downloadUrl: '/backups/media-2024-01-14.zip'
  },
  {
    id: '4',
    name: 'Full Backup - Jan 8, 2024',
    type: 'full',
    size: 245000000,
    createdAt: '2024-01-08T03:00:00Z',
    status: 'completed',
    storage: 'cloud',
    includes: ['database', 'uploads', 'themes', 'plugins', 'config']
  },
  {
    id: '5',
    name: 'Backup in Progress',
    type: 'full',
    size: 0,
    createdAt: new Date().toISOString(),
    status: 'in_progress',
    storage: 'local',
    includes: ['database', 'uploads', 'themes', 'plugins', 'config']
  }
];

const mockSchedule: BackupSchedule = {
  enabled: true,
  frequency: 'daily',
  time: '03:00',
  retainCount: 7,
  type: 'full'
};

export const BackupManager: React.FC<BackupManagerProps> = ({
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup
}) => {
  const [backups, setBackups] = useState<Backup[]>(mockBackups);
  const [schedule, setSchedule] = useState<BackupSchedule>(mockSchedule);
  const [activeTab, setActiveTab] = useState<'backups' | 'schedule' | 'restore'>('backups');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'full' | 'database' | 'files' | 'media'>('full');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Archive className="w-4 h-4 text-blue-400" />;
      case 'database': return <Database className="w-4 h-4 text-green-400" />;
      case 'files': return <FileText className="w-4 h-4 text-yellow-400" />;
      case 'media': return <Image className="w-4 h-4 text-purple-400" />;
      case 'config': return <Settings className="w-4 h-4 text-orange-400" />;
      default: return <Archive className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    setShowCreateModal(false);

    const newBackup: Backup = {
      id: Date.now().toString(),
      name: `${createType.charAt(0).toUpperCase() + createType.slice(1)} Backup - ${new Date().toLocaleDateString()}`,
      type: createType,
      size: 0,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      storage: 'local',
      includes: createType === 'full'
        ? ['database', 'uploads', 'themes', 'plugins', 'config']
        : [createType]
    };

    setBackups([newBackup, ...backups]);

    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setBackups(prev => prev.map(b =>
      b.id === newBackup.id
        ? { ...b, status: 'completed' as const, size: Math.random() * 200000000 + 50000000 }
        : b
    ));

    setIsCreating(false);
    onCreateBackup?.(createType);
  };

  const handleRestore = (backup: Backup) => {
    setSelectedBackup(backup);
    onRestoreBackup?.(backup);
  };

  const handleDelete = (backup: Backup) => {
    setBackups(backups.filter(b => b.id !== backup.id));
    onDeleteBackup?.(backup);
  };

  const totalSize = backups.reduce((acc, b) => acc + b.size, 0);
  const completedBackups = backups.filter(b => b.status === 'completed').length;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-green-400" />
            Backup Manager
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <Archive className="w-4 h-4" />
            Create Backup
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Archive className="w-4 h-4" />
              <span className="text-xs text-gray-500">Total Backups</span>
            </div>
            <div className="text-xl font-semibold text-white">{completedBackups}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs text-gray-500">Total Size</span>
            </div>
            <div className="text-xl font-semibold text-white">{formatBytes(totalSize)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs text-gray-500">Last Backup</span>
            </div>
            <div className="text-sm font-medium text-white">
              {backups[0] ? formatDate(backups[0].createdAt).split(',')[0] : 'Never'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs text-gray-500">Schedule</span>
            </div>
            <div className="text-sm font-medium text-white">
              {schedule.enabled ? `${schedule.frequency} @ ${schedule.time}` : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(['backups', 'schedule', 'restore'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'backups' && (
          <div className="space-y-3">
            {backups.map(backup => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(backup.type)}
                    <div>
                      <h3 className="text-white font-medium">{backup.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatDate(backup.createdAt)}</span>
                        <span>{formatBytes(backup.size)}</span>
                        <span className="flex items-center gap-1">
                          {backup.storage === 'cloud' ? (
                            <Cloud className="w-3 h-3" />
                          ) : (
                            <HardDrive className="w-3 h-3" />
                          )}
                          {backup.storage}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {backup.includes.map(item => (
                          <span key={item} className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {backup.status === 'completed' && (
                      <>
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                        <button
                          onClick={() => handleRestore(backup)}
                          className="p-2 text-gray-400 hover:text-blue-400 rounded hover:bg-gray-700"
                          title="Restore"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        {backup.downloadUrl && (
                          <a
                            href={backup.downloadUrl}
                            className="p-2 text-gray-400 hover:text-green-400 rounded hover:bg-gray-700"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(backup)}
                          className="p-2 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {backup.status === 'in_progress' && (
                      <span className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        In Progress
                      </span>
                    )}
                    {backup.status === 'failed' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">Automatic Backups</h3>
                  <p className="text-sm text-gray-500">Configure scheduled backup settings</p>
                </div>
                <button
                  onClick={() => setSchedule({ ...schedule, enabled: !schedule.enabled })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    schedule.enabled
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Frequency</label>
                  <select
                    value={schedule.frequency}
                    onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Time</label>
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Backup Type</label>
                  <select
                    value={schedule.type}
                    onChange={(e) => setSchedule({ ...schedule, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="full">Full Backup</option>
                    <option value="database">Database Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Retain Last</label>
                  <input
                    type="number"
                    value={schedule.retainCount}
                    onChange={(e) => setSchedule({ ...schedule, retainCount: parseInt(e.target.value) })}
                    min={1}
                    max={30}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Older backups will be automatically deleted
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restore' && (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-medium">Warning</h4>
                  <p className="text-sm text-yellow-400/80 mt-1">
                    Restoring a backup will overwrite your current data. Make sure to create a backup of your current state before proceeding.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {backups.filter(b => b.status === 'completed').map(backup => (
                <div key={backup.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(backup.type)}
                    <div>
                      <h3 className="text-white font-medium">{backup.name}</h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(backup.createdAt)} • {formatBytes(backup.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(backup)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Backup Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-xl p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create New Backup</h3>
              <div className="space-y-3 mb-6">
                {[
                  { type: 'full', label: 'Full Backup', desc: 'Database, files, themes, plugins, config' },
                  { type: 'database', label: 'Database Only', desc: 'Just the database' },
                  { type: 'files', label: 'Files Only', desc: 'Themes, plugins, and uploads' },
                  { type: 'media', label: 'Media Only', desc: 'Uploaded media files' }
                ].map(option => (
                  <button
                    key={option.type}
                    onClick={() => setCreateType(option.type as any)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      createType === option.type
                        ? 'bg-green-600/20 border border-green-500'
                        : 'bg-gray-800 border border-transparent hover:border-gray-700'
                    }`}
                  >
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBackup}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackupManager;
