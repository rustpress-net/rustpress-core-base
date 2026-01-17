/**
 * WebhookManager - Configure and manage webhooks
 * RustPress-specific webhook management functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook, Plus, Edit, Trash2, Play, Copy, Check, X,
  Clock, AlertCircle, CheckCircle, RefreshCw, Settings,
  ChevronDown, ChevronUp, Globe, Lock, Eye, EyeOff
} from 'lucide-react';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retryCount: number;
  timeout: number;
  createdAt: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failure' | 'pending';
  statusCode?: number;
  duration?: number;
  timestamp: string;
  payload?: any;
  response?: any;
}

interface WebhookManagerProps {
  onSave?: (webhook: WebhookConfig) => void;
  onDelete?: (id: string) => void;
  onTest?: (webhook: WebhookConfig) => void;
}

// Available webhook events
const availableEvents = [
  { group: 'Content', events: ['post.created', 'post.updated', 'post.deleted', 'post.published'] },
  { group: 'Users', events: ['user.registered', 'user.login', 'user.logout', 'user.updated'] },
  { group: 'Comments', events: ['comment.created', 'comment.approved', 'comment.spam'] },
  { group: 'Orders', events: ['order.created', 'order.paid', 'order.shipped', 'order.completed'] },
  { group: 'Media', events: ['media.uploaded', 'media.deleted'] },
  { group: 'System', events: ['backup.completed', 'cache.cleared', 'deploy.success'] }
];

// Mock data
const mockWebhooks: WebhookConfig[] = [
  {
    id: '1',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
    events: ['post.published', 'comment.created'],
    active: true,
    retryCount: 3,
    timeout: 30,
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T14:30:00Z',
    successCount: 156,
    failureCount: 2
  },
  {
    id: '2',
    name: 'Analytics Sync',
    url: 'https://api.analytics.com/webhook',
    events: ['user.login', 'user.registered'],
    active: true,
    secret: 'whsec_xxxxxxxxxxxxx',
    retryCount: 5,
    timeout: 60,
    createdAt: '2024-01-05T08:00:00Z',
    lastTriggered: '2024-01-15T12:00:00Z',
    successCount: 1250,
    failureCount: 8
  },
  {
    id: '3',
    name: 'Order Processing',
    url: 'https://erp.company.com/api/orders',
    events: ['order.created', 'order.paid'],
    active: false,
    retryCount: 3,
    timeout: 30,
    createdAt: '2024-01-01T00:00:00Z',
    successCount: 45,
    failureCount: 0
  }
];

const mockLogs: WebhookLog[] = [
  { id: '1', webhookId: '1', event: 'post.published', status: 'success', statusCode: 200, duration: 234, timestamp: '2024-01-15T14:30:00Z' },
  { id: '2', webhookId: '1', event: 'comment.created', status: 'success', statusCode: 200, duration: 189, timestamp: '2024-01-15T14:25:00Z' },
  { id: '3', webhookId: '2', event: 'user.login', status: 'failure', statusCode: 500, duration: 30000, timestamp: '2024-01-15T14:20:00Z' },
  { id: '4', webhookId: '2', event: 'user.registered', status: 'success', statusCode: 201, duration: 456, timestamp: '2024-01-15T14:15:00Z' }
];

export const WebhookManager: React.FC<WebhookManagerProps> = ({
  onSave,
  onDelete,
  onTest
}) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [logs] = useState<WebhookLog[]>(mockLogs);
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs'>('webhooks');
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const handleToggleActive = (id: string) => {
    setWebhooks(webhooks.map(w =>
      w.id === id ? { ...w, active: !w.active } : w
    ));
  };

  const handleTest = async (webhook: WebhookConfig) => {
    setIsTesting(webhook.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTesting(null);
    onTest?.(webhook);
  };

  const handleDelete = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    onDelete?.(id);
  };

  const handleSave = (webhook: WebhookConfig) => {
    if (webhook.id) {
      setWebhooks(webhooks.map(w => w.id === webhook.id ? webhook : w));
    } else {
      setWebhooks([...webhooks, { ...webhook, id: Date.now().toString() }]);
    }
    setEditingWebhook(null);
    onSave?.(webhook);
  };

  const toggleSecret = (id: string) => {
    const newSet = new Set(showSecrets);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowSecrets(newSet);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-pink-400" />
            Webhook Manager
          </h2>
          <button
            onClick={() => setEditingWebhook({
              id: '',
              name: '',
              url: '',
              events: [],
              active: true,
              retryCount: 3,
              timeout: 30,
              createdAt: new Date().toISOString(),
              successCount: 0,
              failureCount: 0
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Webhook
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-pink-400 text-lg font-semibold">{webhooks.length}</div>
            <div className="text-xs text-gray-500">Total Webhooks</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-green-400 text-lg font-semibold">{webhooks.filter(w => w.active).length}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-blue-400 text-lg font-semibold">{webhooks.reduce((acc, w) => acc + w.successCount, 0)}</div>
            <div className="text-xs text-gray-500">Total Deliveries</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-red-400 text-lg font-semibold">{webhooks.reduce((acc, w) => acc + w.failureCount, 0)}</div>
            <div className="text-xs text-gray-500">Failures</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(['webhooks', 'logs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'webhooks' && (
          <div className="space-y-3">
            {webhooks.map(webhook => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${webhook.active ? 'bg-green-500/10' : 'bg-gray-700'}`}>
                        <Webhook className={`w-5 h-5 ${webhook.active ? 'text-green-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{webhook.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-gray-400 bg-gray-900 px-2 py-0.5 rounded truncate max-w-xs">
                            {webhook.url}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(webhook.url)}
                            className="text-gray-500 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {webhook.events.slice(0, 3).map(event => (
                            <span key={event} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                              {event}
                            </span>
                          ))}
                          {webhook.events.length > 3 && (
                            <span className="text-xs text-gray-500">+{webhook.events.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs text-gray-500 mr-2">
                        <div className="text-green-400">{webhook.successCount} success</div>
                        <div className="text-red-400">{webhook.failureCount} failed</div>
                      </div>
                      <button
                        onClick={() => handleTest(webhook)}
                        disabled={isTesting === webhook.id}
                        className="p-2 text-gray-400 hover:text-blue-400 rounded hover:bg-gray-700"
                        title="Test"
                      >
                        {isTesting === webhook.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingWebhook(webhook)}
                        className="p-2 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(webhook.id)}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          webhook.active
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {webhook.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleDelete(webhook.id)}
                        className="p-2 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {webhook.lastTriggered && (
                  <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-800 text-xs text-gray-500">
                    Last triggered: {formatDate(webhook.lastTriggered)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            {logs.map(log => {
              const webhook = webhooks.find(w => w.id === log.webhookId);
              return (
                <div key={log.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
                  {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {log.status === 'failure' && <AlertCircle className="w-4 h-4 text-red-400" />}
                  {log.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{webhook?.name || 'Unknown'}</span>
                      <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">{log.event}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    {log.statusCode && (
                      <span className={`text-sm font-mono ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {log.statusCode}
                      </span>
                    )}
                    {log.duration && (
                      <div className="text-xs text-gray-500">{log.duration}ms</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingWebhook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingWebhook(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingWebhook.id ? 'Edit Webhook' : 'New Webhook'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Name</label>
                  <input
                    type="text"
                    value={editingWebhook.name}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="My Webhook"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">URL</label>
                  <input
                    type="url"
                    value={editingWebhook.url}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="https://example.com/webhook"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Secret (optional)</label>
                  <input
                    type="text"
                    value={editingWebhook.secret || ''}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, secret: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="whsec_..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Events</label>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {availableEvents.map(group => (
                      <div key={group.group}>
                        <div className="text-xs text-gray-500 mb-1">{group.group}</div>
                        <div className="flex flex-wrap gap-1">
                          {group.events.map(event => (
                            <button
                              key={event}
                              onClick={() => {
                                const events = editingWebhook.events.includes(event)
                                  ? editingWebhook.events.filter(e => e !== event)
                                  : [...editingWebhook.events, event];
                                setEditingWebhook({ ...editingWebhook, events });
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                editingWebhook.events.includes(event)
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:text-white'
                              }`}
                            >
                              {event}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Retry Count</label>
                    <input
                      type="number"
                      value={editingWebhook.retryCount}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, retryCount: parseInt(e.target.value) })}
                      min={0}
                      max={10}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Timeout (seconds)</label>
                    <input
                      type="number"
                      value={editingWebhook.timeout}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, timeout: parseInt(e.target.value) })}
                      min={5}
                      max={300}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setEditingWebhook(null)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingWebhook)}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebhookManager;
