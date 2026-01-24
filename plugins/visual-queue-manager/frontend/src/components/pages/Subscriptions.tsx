import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subscriptionApi, queueApi, handlerApi } from '@api/client';
import type { Subscription, CreateSubscriptionRequest } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, LoadingSpinner, Modal, StatusBadge } from '@components/common';
import { SearchInput } from '@components/common/Input';

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscriptions', searchQuery],
    queryFn: () => subscriptionApi.list({ search: searchQuery || undefined }),
    refetchInterval: 10000,
  });

  const deleteMutation = useMutation({
    mutationFn: subscriptionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription deleted');
    },
    onError: () => toast.error('Failed to delete subscription'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      enabled ? subscriptionApi.enable(id) : subscriptionApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription updated');
    },
    onError: () => toast.error('Failed to update subscription'),
  });

  if (error) {
    return (
      <PageWrapper title="Subscriptions">
        <ErrorState message="Failed to load subscriptions" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Subscriptions"
      subtitle="Route messages from queues to handlers"
      action={
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Subscription
        </Button>
      }
    >
      {/* Filters */}
      <Card padding="sm">
        <SearchInput
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
      </Card>

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title="No subscriptions found"
            description="Create a subscription to connect queues with handlers"
            action={<Button onClick={() => setShowCreateModal(true)}>Create Subscription</Button>}
          />
        </Card>
      ) : (
        <Card padding="none">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Queue</th>
                <th>Handler</th>
                <th>Priority</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((sub) => (
                <tr key={sub.id}>
                  <td className="font-medium text-white">{sub.name}</td>
                  <td>
                    <span className="badge-primary">{sub.queue?.name || sub.queue_id.slice(0, 8)}</span>
                  </td>
                  <td>
                    <span className="badge-gray">{sub.handler?.name || sub.handler_id.slice(0, 8)}</span>
                  </td>
                  <td>{sub.priority}</td>
                  <td>{sub.batch_size}</td>
                  <td>
                    <StatusBadge status={sub.enabled ? 'active' : 'disabled'} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: sub.id, enabled: !sub.enabled })}
                      >
                        {sub.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this subscription?')) {
                            deleteMutation.mutate(sub.id);
                          }
                        }}
                      >
                        <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSubscriptionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </PageWrapper>
  );
}

// Create Subscription Modal
function CreateSubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateSubscriptionRequest>({
    name: '',
    queue_id: '',
    handler_id: '',
    priority: 0,
    batch_size: 1,
    batch_timeout_ms: 5000,
  });

  const queuesQuery = useQuery({
    queryKey: ['queues-list'],
    queryFn: () => queueApi.list({ per_page: 100 }),
  });

  const handlersQuery = useQuery({
    queryKey: ['handlers-list'],
    queryFn: () => handlerApi.list({ per_page: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription created');
      onClose();
    },
    onError: () => toast.error('Failed to create subscription'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Subscription"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => createMutation.mutate(formData)}
            loading={createMutation.isPending}
            disabled={!formData.name || !formData.queue_id || !formData.handler_id}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-subscription"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Queue</label>
          <select
            className="select"
            value={formData.queue_id}
            onChange={(e) => setFormData({ ...formData, queue_id: e.target.value })}
            required
          >
            <option value="">Select a queue</option>
            {queuesQuery.data?.data.map((queue) => (
              <option key={queue.id} value={queue.id}>{queue.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Handler</label>
          <select
            className="select"
            value={formData.handler_id}
            onChange={(e) => setFormData({ ...formData, handler_id: e.target.value })}
            required
          >
            <option value="">Select a handler</option>
            {handlersQuery.data?.data.map((handler) => (
              <option key={handler.id} value={handler.id}>{handler.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
            <input
              type="number"
              className="input"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              min={0}
              max={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Batch Size</label>
            <input
              type="number"
              className="input"
              value={formData.batch_size}
              onChange={(e) => setFormData({ ...formData, batch_size: Number(e.target.value) })}
              min={1}
              max={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Batch Timeout</label>
            <input
              type="number"
              className="input"
              value={formData.batch_timeout_ms}
              onChange={(e) => setFormData({ ...formData, batch_timeout_ms: Number(e.target.value) })}
              min={100}
              max={60000}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Filter Expression (optional)</label>
          <input
            type="text"
            className="input font-mono"
            value={formData.filter_expression || ''}
            onChange={(e) => setFormData({ ...formData, filter_expression: e.target.value || undefined })}
            placeholder="$.type == 'order'"
          />
          <p className="text-xs text-slate-400 mt-1">JSONPath expression to filter messages</p>
        </div>
      </div>
    </Modal>
  );
}
