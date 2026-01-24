import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { queueApi } from '@api/client';
import type { Queue, CreateQueueRequest, QueueType } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, LoadingSpinner, Modal, StatusBadge } from '@components/common';
import { SearchInput } from '@components/common/Input';

export default function Queues() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['queues', searchQuery, statusFilter, typeFilter],
    queryFn: () => queueApi.list({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    }),
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: queueApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Queue deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete queue');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => queueApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Queue paused');
    },
    onError: () => {
      toast.error('Failed to pause queue');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => queueApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Queue resumed');
    },
    onError: () => {
      toast.error('Failed to resume queue');
    },
  });

  const filteredQueues = data?.data.filter((queue) => {
    if (typeFilter && queue.queue_type !== typeFilter) return false;
    return true;
  }) || [];

  if (error) {
    return (
      <PageWrapper title="Queues">
        <ErrorState message="Failed to load queues" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Queues"
      subtitle="Manage your message queues"
      action={
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Queue
        </Button>
      }
    >
      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search queues..."
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
            <option value="paused">Paused</option>
            <option value="draining">Draining</option>
          </select>
          <select
            className="select w-full sm:w-40"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="standard">Standard</option>
            <option value="fifo">FIFO</option>
            <option value="priority">Priority</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </Card>

      {/* Queue List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredQueues.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="No queues found"
            description={searchQuery || statusFilter || typeFilter
              ? "Try adjusting your filters"
              : "Create your first queue to get started"
            }
            action={
              !searchQuery && !statusFilter && !typeFilter && (
                <Button onClick={() => setShowCreateModal(true)}>Create Queue</Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQueues.map((queue) => (
            <QueueCard
              key={queue.id}
              queue={queue}
              onPause={() => pauseMutation.mutate(queue.id)}
              onResume={() => resumeMutation.mutate(queue.id)}
              onDelete={() => {
                if (confirm('Are you sure you want to delete this queue?')) {
                  deleteMutation.mutate(queue.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateQueueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </PageWrapper>
  );
}

// Queue Card Component
interface QueueCardProps {
  queue: Queue;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
}

function QueueCard({ queue, onPause, onResume, onDelete }: QueueCardProps) {
  return (
    <Card className="hover:border-slate-600 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Queue Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/queues/${queue.id}`}
              className="text-lg font-semibold text-white hover:text-primary-400 truncate"
            >
              {queue.name}
            </Link>
            <StatusBadge status={queue.status} />
            <span className="badge-gray">{queue.queue_type}</span>
          </div>
          {queue.description && (
            <p className="text-sm text-slate-400 truncate">{queue.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {queue.stats?.total_messages.toLocaleString() || 0}
            </p>
            <p className="text-slate-400">Messages</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-400">
              {queue.stats?.in_flight_messages || 0}
            </p>
            <p className="text-slate-400">In Flight</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-500">
              {queue.stats?.dlq_messages || 0}
            </p>
            <p className="text-slate-400">DLQ</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to={`/queues/${queue.id}/messages`}>
            <Button variant="secondary" size="sm">
              Browse
            </Button>
          </Link>
          {queue.status === 'active' ? (
            <Button variant="ghost" size="sm" onClick={onPause}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onResume}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Create Queue Modal
interface CreateQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateQueueModal({ isOpen, onClose }: CreateQueueModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateQueueRequest>({
    name: '',
    description: '',
    queue_type: 'standard',
    max_size: undefined,
    enable_dlq: true,
    max_receive_count: 3,
  });

  const createMutation = useMutation({
    mutationFn: queueApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Queue created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create queue');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Queue"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending}>
            Create Queue
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Queue Name
          </label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-queue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            className="input min-h-[80px]"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Queue Type
          </label>
          <select
            className="select"
            value={formData.queue_type}
            onChange={(e) => setFormData({ ...formData, queue_type: e.target.value as QueueType })}
          >
            <option value="standard">Standard</option>
            <option value="fifo">FIFO (First In, First Out)</option>
            <option value="priority">Priority</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Max Queue Size (optional)
          </label>
          <input
            type="number"
            className="input"
            value={formData.max_size || ''}
            onChange={(e) => setFormData({ ...formData, max_size: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Unlimited"
            min={1}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enable_dlq"
            checked={formData.enable_dlq}
            onChange={(e) => setFormData({ ...formData, enable_dlq: e.target.checked })}
            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="enable_dlq" className="text-sm text-slate-300">
            Enable Dead Letter Queue
          </label>
        </div>

        {formData.enable_dlq && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Max Receive Count
            </label>
            <input
              type="number"
              className="input"
              value={formData.max_receive_count}
              onChange={(e) => setFormData({ ...formData, max_receive_count: Number(e.target.value) })}
              min={1}
              max={100}
            />
            <p className="text-xs text-slate-400 mt-1">
              Number of times a message can be received before moving to DLQ
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
