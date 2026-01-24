import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { healthApi } from '@api/client';
import { useUIStore } from '@store/index';
import { PageWrapper, ErrorState } from '@components/Layout';
import { Button, Card, CardHeader, LoadingSpinner, StatusBadge } from '@components/common';

export default function Settings() {
  const { preferences, updatePreferences } = useUIStore();
  const [activeTab, setActiveTab] = useState('general');

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => healthApi.check(),
    refetchInterval: 30000,
  });

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'system', label: 'System Status' },
  ];

  return (
    <PageWrapper
      title="Settings"
      subtitle="Configure your queue manager preferences"
    >
      {/* Tabs */}
      <div className="tabs mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'tab-active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Display Preferences" />
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div>
                  <p className="text-white font-medium">Theme</p>
                  <p className="text-sm text-slate-400">Choose your preferred color theme</p>
                </div>
                <select
                  className="select w-40"
                  value={preferences.theme}
                  onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div>
                  <p className="text-white font-medium">Default View</p>
                  <p className="text-sm text-slate-400">Preferred view mode for lists</p>
                </div>
                <select
                  className="select w-40"
                  value={preferences.default_view_mode}
                  onChange={(e) => updatePreferences({ default_view_mode: e.target.value as 'grid' | 'list' | 'table' })}
                >
                  <option value="table">Table</option>
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Auto-refresh Interval</p>
                  <p className="text-sm text-slate-400">How often to refresh data</p>
                </div>
                <select
                  className="select w-40"
                  value={preferences.refresh_interval}
                  onChange={(e) => updatePreferences({ refresh_interval: Number(e.target.value) })}
                >
                  <option value={1000}>1 second</option>
                  <option value={2000}>2 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Notification Settings" />
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div>
                  <p className="text-white font-medium">Enable Notifications</p>
                  <p className="text-sm text-slate-400">Show browser notifications for alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications_enabled}
                    onChange={() => updatePreferences({ notifications_enabled: !preferences.notifications_enabled })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Sound Effects</p>
                  <p className="text-sm text-slate-400">Play sounds for critical alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sound_enabled}
                    onChange={() => updatePreferences({ sound_enabled: !preferences.sound_enabled })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Alert Thresholds" />
            <p className="text-slate-400 text-sm">
              Configure alert notification thresholds in the Alert Rules section.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => window.location.href = '/alerts'}>
                Manage Alert Rules
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="System Health" />
            {healthQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : healthQuery.error ? (
              <ErrorState message="Failed to load health status" retry={healthQuery.refetch} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <p className="text-white font-medium">Overall Status</p>
                  </div>
                  <StatusBadge status={healthQuery.data?.status || 'unknown'} />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <p className="text-white font-medium">Version</p>
                  </div>
                  <span className="text-slate-300 font-mono">{healthQuery.data?.version}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <p className="text-white font-medium">Uptime</p>
                  </div>
                  <span className="text-slate-300">{formatUptime(healthQuery.data?.uptime_seconds || 0)}</span>
                </div>

                <div className="pt-4">
                  <p className="text-sm font-medium text-white mb-3">Components</p>
                  <div className="space-y-2">
                    {Object.entries(healthQuery.data?.components || {}).map(([name, component]) => (
                      <div key={name} className="flex items-center justify-between bg-slate-700/50 rounded p-3">
                        <span className="text-slate-300 capitalize">{name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-sm">{component.latency_ms}ms</span>
                          <StatusBadge status={component.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="About" />
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">
                <span className="text-white">Visual Queue Manager</span> - Enterprise-grade queue management for RustPress
              </p>
              <p className="text-slate-400">
                Built with React, TypeScript, and TailwindCSS
              </p>
              <div className="pt-4 flex items-center gap-4">
                <a
                  href="https://docs.rustpress.dev/plugins/queue-manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Documentation
                </a>
                <a
                  href="https://github.com/rustpress/visual-queue-manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  GitHub
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}
