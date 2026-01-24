import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workerApi } from '@api/client';
import type { Worker } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, CardHeader, LoadingSpinner, Modal, StatusBadge } from '@components/common';
import { SearchInput } from '@components/common/Input';

export default function Workers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workers', searchQuery, statusFilter],
    queryFn: () => workerApi.list({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    }),
    refetchInterval: 5000,
  });

  const drainMutation = useMutation({
    mutationFn: workerApi.drain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker draining started');
    },
    onError: () => toast.error('Failed to drain worker'),
  });

  const deregisterMutation = useMutation({
    mutationFn: workerApi.deregister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker deregistered');
    },
    onError: () => toast.error('Failed to deregister worker'),
  });

  const filteredWorkers = data?.data || [];

  // Group workers by status
  const workersByStatus = {
    active: filteredWorkers.filter(w => w.status === 'active'),
    idle: filteredWorkers.filter(w => w.status === 'idle'),
    draining: filteredWorkers.filter(w => w.status === 'draining'),
    offline: filteredWorkers.filter(w => w.status === 'offline'),
  };

  if (error) {
    return (
      <PageWrapper title="Workers">
        <ErrorState message="Failed to load workers" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Workers"
      subtitle="Monitor and manage worker instances"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-500/10 rounded-lg">
              <span className="w-3 h-3 bg-success-500 rounded-full block animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{workersByStatus.active.length}</p>
              <p className="text-sm text-slate-400">Active</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-500/10 rounded-lg">
              <span className="w-3 h-3 bg-warning-500 rounded-full block" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{workersByStatus.idle.length}</p>
              <p className="text-sm text-slate-400">Idle</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <span className="w-3 h-3 bg-primary-500 rounded-full block" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{workersByStatus.draining.length}</p>
              <p className="text-sm text-slate-400">Draining</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-500/10 rounded-lg">
              <span className="w-3 h-3 bg-danger-500 rounded-full block" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{workersByStatus.offline.length}</p>
              <p className="text-sm text-slate-400">Offline</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <select
            className="select w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="draining">Draining</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </Card>

      {/* Workers List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredWorkers.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
            title="No workers found"
            description="Workers will appear here when they connect"
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onView={() => setSelectedWorker(worker)}
              onDrain={() => drainMutation.mutate(worker.id)}
              onDeregister={() => {
                if (confirm('Are you sure you want to deregister this worker?')) {
                  deregisterMutation.mutate(worker.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <WorkerDetailModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </PageWrapper>
  );
}

// Worker Card Component
interface WorkerCardProps {
  worker: Worker;
  onView: () => void;
  onDrain: () => void;
  onDeregister: () => void;
}

function WorkerCard({ worker, onView, onDrain, onDeregister }: WorkerCardProps) {
  const utilization = worker.concurrency > 0
    ? (worker.active_jobs / worker.concurrency) * 100
    : 0;

  return (
    <Card className="hover:border-slate-600 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onView}
              className="text-lg font-semibold text-white hover:text-primary-400"
            >
              {worker.name}
            </button>
            <StatusBadge status={worker.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              {worker.hostname}
            </span>
            <span>PID: {worker.process_id}</span>
            <span>v{worker.version}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {worker.active_jobs}/{worker.concurrency}
            </p>
            <p className="text-slate-400">Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-500">
              {worker.total_processed.toLocaleString()}
            </p>
            <p className="text-slate-400">Processed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-500">
              {worker.total_failed.toLocaleString()}
            </p>
            <p className="text-slate-400">Failed</p>
          </div>
          <div className="w-24">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Util.</span>
              <span className="text-white">{utilization.toFixed(0)}%</span>
            </div>
            <div className="progress h-1.5">
              <div
                className={`progress-bar ${
                  utilization > 80 ? 'bg-danger-500' : utilization > 60 ? 'bg-warning-500' : 'bg-success-500'
                }`}
                style={{ width: `${utilization}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            View
          </Button>
          {worker.status === 'active' && (
            <Button variant="secondary" size="sm" onClick={onDrain}>
              Drain
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDeregister}>
            <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Queues */}
      {worker.queues.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Processing Queues</p>
          <div className="flex flex-wrap gap-2">
            {worker.queues.map((queue) => (
              <span key={queue} className="badge-gray">{queue}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Worker Detail Modal
function WorkerDetailModal({ worker, onClose }: { worker: Worker; onClose: () => void }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Worker Details" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400">ID</label>
            <p className="font-mono text-white">{worker.id}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Status</label>
            <p><StatusBadge status={worker.status} /></p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Name</label>
            <p className="text-white">{worker.name}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Version</label>
            <p className="text-white">{worker.version}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Hostname</label>
            <p className="text-white">{worker.hostname}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Process ID</label>
            <p className="text-white">{worker.process_id}</p>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Concurrency</p>
              <p className="text-xl font-bold text-white">{worker.concurrency}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Active Jobs</p>
              <p className="text-xl font-bold text-primary-400">{worker.active_jobs}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Total Processed</p>
              <p className="text-xl font-bold text-success-500">{worker.total_processed.toLocaleString()}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Total Failed</p>
              <p className="text-xl font-bold text-danger-500">{worker.total_failed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Resources</h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-white">{worker.memory_usage_mb} MB</span>
              </div>
              <div className="progress">
                <div className="progress-bar-primary" style={{ width: `${Math.min(worker.memory_usage_mb / 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-white">{worker.cpu_usage_percent.toFixed(1)}%</span>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar ${worker.cpu_usage_percent > 80 ? 'bg-danger-500' : worker.cpu_usage_percent > 60 ? 'bg-warning-500' : 'bg-success-500'}`}
                  style={{ width: `${worker.cpu_usage_percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-400">Started</label>
            <p className="text-white">{new Date(worker.started_at).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-slate-400">Last Heartbeat</label>
            <p className="text-white">{new Date(worker.last_heartbeat).toLocaleString()}</p>
          </div>
        </div>

        {/* Queues */}
        {worker.queues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Processing Queues</h4>
            <div className="flex flex-wrap gap-2">
              {worker.queues.map((queue) => (
                <span key={queue} className="badge-primary">{queue}</span>
              ))}
            </div>
          </div>
        )}

        {/* Capabilities */}
        {worker.capabilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {worker.capabilities.map((cap) => (
                <span key={cap} className="badge-gray">{cap}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {Object.keys(worker.tags).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(worker.tags).map(([key, value]) => (
                <span key={key} className="badge-gray">{key}: {value}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
