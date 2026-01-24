import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { messageApi, dlqApi, queueApi } from '@api/client';
import type { Message, EnqueueMessageRequest } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, LoadingSpinner, Modal, StatusBadge } from '@components/common';
import { SearchInput } from '@components/common/Input';

interface MessagesProps {
  isDLQ?: boolean;
}

export default function Messages({ isDLQ = false }: MessagesProps) {
  const { queueId } = useParams<{ queueId: string }>();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showEnqueueModal, setShowEnqueueModal] = useState(false);
  const page = Number(searchParams.get('page') || '1');

  const queueQuery = useQuery({
    queryKey: ['queue', queueId],
    queryFn: () => queueApi.get(queueId!),
    enabled: !!queueId,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [isDLQ ? 'dlq-messages' : 'messages', queueId, page, statusFilter],
    queryFn: () =>
      isDLQ
        ? dlqApi.list(queueId!, { page, per_page: 20 })
        : messageApi.list(queueId!, { page, per_page: 20, status: statusFilter || undefined }),
    enabled: !!queueId,
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => messageApi.delete(queueId!, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', queueId] });
      toast.success('Message deleted');
    },
    onError: () => toast.error('Failed to delete message'),
  });

  const retryMutation = useMutation({
    mutationFn: (messageId: string) =>
      isDLQ ? dlqApi.retry(queueId!, messageId) : messageApi.retry(queueId!, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isDLQ ? 'dlq-messages' : 'messages', queueId] });
      toast.success('Message queued for retry');
    },
    onError: () => toast.error('Failed to retry message'),
  });

  const retryAllMutation = useMutation({
    mutationFn: () => dlqApi.retryAll(queueId!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dlq-messages', queueId] });
      toast.success(`Retried ${result.retried_count} messages`);
    },
    onError: () => toast.error('Failed to retry messages'),
  });

  const purgeDlqMutation = useMutation({
    mutationFn: () => dlqApi.purge(queueId!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dlq-messages', queueId] });
      toast.success(`Purged ${result.purged_count} messages`);
    },
    onError: () => toast.error('Failed to purge DLQ'),
  });

  const queueName = queueQuery.data?.data.name || 'Queue';

  if (error) {
    return (
      <PageWrapper title={isDLQ ? 'Dead Letter Queue' : 'Messages'}>
        <ErrorState message="Failed to load messages" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={isDLQ ? `Dead Letter Queue - ${queueName}` : `Messages - ${queueName}`}
      subtitle={isDLQ ? 'Messages that failed processing' : 'Browse and manage queue messages'}
      action={
        <div className="flex items-center gap-3">
          {isDLQ ? (
            <>
              <Button
                variant="secondary"
                onClick={() => retryAllMutation.mutate()}
                loading={retryAllMutation.isPending}
              >
                Retry All
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Purge all messages from DLQ?')) {
                    purgeDlqMutation.mutate();
                  }
                }}
                loading={purgeDlqMutation.isPending}
              >
                Purge DLQ
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowEnqueueModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Enqueue Message
            </Button>
          )}
        </div>
      }
    >
      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          {!isDLQ && (
            <select
              className="select w-full sm:w-40"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSearchParams({ status: e.target.value, page: '1' });
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          )}
        </div>
      </Card>

      {/* Messages Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
            title={isDLQ ? 'No dead letter messages' : 'No messages found'}
            description={isDLQ ? 'All messages are processing successfully' : 'Messages will appear here when enqueued'}
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Attempts</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((message) => (
                  <tr key={message.id}>
                    <td>
                      <button
                        onClick={() => setSelectedMessage(message)}
                        className="font-mono text-primary-400 hover:text-primary-300"
                      >
                        {message.id.slice(0, 8)}...
                      </button>
                    </td>
                    <td>
                      <StatusBadge status={message.status} />
                    </td>
                    <td>{message.priority}</td>
                    <td>
                      {message.attempts}/{message.max_attempts}
                    </td>
                    <td className="text-slate-400">
                      {new Date(message.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryMutation.mutate(message.id)}
                          loading={retryMutation.isPending}
                        >
                          Retry
                        </Button>
                        {!isDLQ && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(message.id)}
                          >
                            <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Page {data.meta.page} of {data.meta.total_pages} ({data.meta.total_items} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.meta.has_prev}
                  onClick={() => setSearchParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.meta.has_next}
                  onClick={() => setSearchParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}

      {/* Enqueue Modal */}
      {showEnqueueModal && (
        <EnqueueMessageModal
          queueId={queueId!}
          isOpen={showEnqueueModal}
          onClose={() => setShowEnqueueModal(false)}
        />
      )}
    </PageWrapper>
  );
}

// Message Detail Modal
function MessageDetailModal({ message, onClose }: { message: Message; onClose: () => void }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Message Details" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400">ID</label>
            <p className="font-mono text-white">{message.id}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Status</label>
            <p><StatusBadge status={message.status} /></p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Priority</label>
            <p className="text-white">{message.priority}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Attempts</label>
            <p className="text-white">{message.attempts}/{message.max_attempts}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Content Type</label>
            <p className="text-white">{message.content_type}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Created</label>
            <p className="text-white">{new Date(message.created_at).toLocaleString()}</p>
          </div>
        </div>

        {message.error_message && (
          <div>
            <label className="text-sm text-slate-400">Error</label>
            <p className="text-danger-500 bg-danger-500/10 p-3 rounded-lg mt-1">
              {message.error_message}
            </p>
          </div>
        )}

        <div>
          <label className="text-sm text-slate-400">Body</label>
          <pre className="code-block mt-1 max-h-64 overflow-auto">
            {typeof message.body === 'string'
              ? message.body.startsWith('{') || message.body.startsWith('[')
                ? JSON.stringify(JSON.parse(message.body), null, 2)
                : message.body
              : JSON.stringify(message.body, null, 2)}
          </pre>
        </div>

        {Object.keys(message.headers).length > 0 && (
          <div>
            <label className="text-sm text-slate-400">Headers</label>
            <pre className="code-block mt-1">
              {JSON.stringify(message.headers, null, 2)}
            </pre>
          </div>
        )}

        {Object.keys(message.attributes).length > 0 && (
          <div>
            <label className="text-sm text-slate-400">Attributes</label>
            <pre className="code-block mt-1">
              {JSON.stringify(message.attributes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Enqueue Message Modal
function EnqueueMessageModal({
  queueId,
  isOpen,
  onClose,
}: {
  queueId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<EnqueueMessageRequest>({
    body: '',
    content_type: 'application/json',
    priority: 0,
    delay_seconds: 0,
  });

  const enqueueMutation = useMutation({
    mutationFn: (data: EnqueueMessageRequest) => messageApi.enqueue(queueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', queueId] });
      toast.success('Message enqueued');
      onClose();
    },
    onError: () => toast.error('Failed to enqueue message'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enqueueMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enqueue Message"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={enqueueMutation.isPending}>
            Enqueue
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Message Body
          </label>
          <textarea
            className="input min-h-[160px] font-mono"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder='{"key": "value"}'
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Content Type
            </label>
            <select
              className="select"
              value={formData.content_type}
              onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
            >
              <option value="application/json">application/json</option>
              <option value="text/plain">text/plain</option>
              <option value="application/xml">application/xml</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Priority
            </label>
            <input
              type="number"
              className="input"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              min={0}
              max={10}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Delay (seconds)
          </label>
          <input
            type="number"
            className="input"
            value={formData.delay_seconds}
            onChange={(e) => setFormData({ ...formData, delay_seconds: Number(e.target.value) })}
            min={0}
          />
        </div>
      </form>
    </Modal>
  );
}
