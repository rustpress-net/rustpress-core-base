import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { handlerApi } from '@api/client';
import type { Handler, CreateHandlerRequest, HandlerType } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, LoadingSpinner, Modal, StatusBadge } from '@components/common';
import { SearchInput } from '@components/common/Input';

export default function Handlers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHandler, setSelectedHandler] = useState<Handler | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['handlers', searchQuery],
    queryFn: () => handlerApi.list({ search: searchQuery || undefined }),
    refetchInterval: 10000,
  });

  const deleteMutation = useMutation({
    mutationFn: handlerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handlers'] });
      toast.success('Handler deleted');
    },
    onError: () => toast.error('Failed to delete handler'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      enabled ? handlerApi.enable(id) : handlerApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handlers'] });
      toast.success('Handler updated');
    },
    onError: () => toast.error('Failed to update handler'),
  });

  const resetCircuitMutation = useMutation({
    mutationFn: handlerApi.resetCircuitBreaker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handlers'] });
      toast.success('Circuit breaker reset');
    },
    onError: () => toast.error('Failed to reset circuit breaker'),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => handlerApi.test(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Handler test successful');
      } else {
        toast.error(`Handler test failed: ${result.error}`);
      }
    },
    onError: () => toast.error('Failed to test handler'),
  });

  if (error) {
    return (
      <PageWrapper title="Handlers">
        <ErrorState message="Failed to load handlers" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Handlers"
      subtitle="Configure message handlers and webhooks"
      action={
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Handler
        </Button>
      }
    >
      {/* Filters */}
      <Card padding="sm">
        <SearchInput
          placeholder="Search handlers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
      </Card>

      {/* Handlers List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="No handlers found"
            description="Create a handler to process messages"
            action={<Button onClick={() => setShowCreateModal(true)}>Create Handler</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((handler) => (
            <HandlerCard
              key={handler.id}
              handler={handler}
              onView={() => setSelectedHandler(handler)}
              onToggle={(enabled) => toggleMutation.mutate({ id: handler.id, enabled })}
              onTest={() => testMutation.mutate(handler.id)}
              onResetCircuit={() => resetCircuitMutation.mutate(handler.id)}
              onDelete={() => {
                if (confirm('Delete this handler?')) {
                  deleteMutation.mutate(handler.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateHandlerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedHandler && (
        <HandlerDetailModal
          handler={selectedHandler}
          onClose={() => setSelectedHandler(null)}
        />
      )}
    </PageWrapper>
  );
}

// Handler Card
interface HandlerCardProps {
  handler: Handler;
  onView: () => void;
  onToggle: (enabled: boolean) => void;
  onTest: () => void;
  onResetCircuit: () => void;
  onDelete: () => void;
}

function HandlerCard({ handler, onView, onToggle, onTest, onResetCircuit, onDelete }: HandlerCardProps) {
  const successRate = handler.total_invocations > 0
    ? (handler.successful_invocations / handler.total_invocations) * 100
    : 100;

  return (
    <Card className="hover:border-slate-600 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Handler Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onView} className="text-lg font-semibold text-white hover:text-primary-400">
              {handler.name}
            </button>
            <span className={`badge ${handler.enabled ? 'badge-success' : 'badge-gray'}`}>
              {handler.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <span className="badge-primary">{handler.handler_type}</span>
            <CircuitBadge state={handler.circuit_state} />
          </div>
          <p className="text-sm text-slate-400 truncate">
            {handler.method} {handler.endpoint}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{handler.total_invocations.toLocaleString()}</p>
            <p className="text-slate-400">Invocations</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${successRate >= 99 ? 'text-success-500' : successRate >= 95 ? 'text-warning-500' : 'text-danger-500'}`}>
              {successRate.toFixed(1)}%
            </p>
            <p className="text-slate-400">Success</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{handler.average_latency_ms.toFixed(0)}ms</p>
            <p className="text-slate-400">Latency</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onTest}>
            Test
          </Button>
          {handler.circuit_state === 'open' && (
            <Button variant="secondary" size="sm" onClick={onResetCircuit}>
              Reset Circuit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(!handler.enabled)}
          >
            {handler.enabled ? 'Disable' : 'Enable'}
          </Button>
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

function CircuitBadge({ state }: { state: string }) {
  const variant = state === 'closed' ? 'success' : state === 'half_open' ? 'warning' : 'danger';
  return <StatusBadge status={state} />;
}

// Create Handler Modal
function CreateHandlerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateHandlerRequest>({
    name: '',
    handler_type: 'webhook',
    endpoint: '',
    method: 'POST',
    timeout_ms: 30000,
  });

  const createMutation = useMutation({
    mutationFn: handlerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handlers'] });
      toast.success('Handler created');
      onClose();
    },
    onError: () => toast.error('Failed to create handler'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Handler"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate(formData)} loading={createMutation.isPending}>
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
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
          <select
            className="select"
            value={formData.handler_type}
            onChange={(e) => setFormData({ ...formData, handler_type: e.target.value as HandlerType })}
          >
            <option value="webhook">Webhook</option>
            <option value="http">HTTP</option>
            <option value="lambda">Lambda</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Endpoint URL</label>
          <input
            type="url"
            className="input"
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
            placeholder="https://api.example.com/webhook"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Method</label>
            <select
              className="select"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Timeout (ms)</label>
            <input
              type="number"
              className="input"
              value={formData.timeout_ms}
              onChange={(e) => setFormData({ ...formData, timeout_ms: Number(e.target.value) })}
              min={1000}
              max={300000}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Handler Detail Modal
function HandlerDetailModal({ handler, onClose }: { handler: Handler; onClose: () => void }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Handler Details" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400">ID</label>
            <p className="font-mono text-white">{handler.id}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Type</label>
            <p className="text-white">{handler.handler_type}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Method</label>
            <p className="text-white">{handler.method}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Timeout</label>
            <p className="text-white">{handler.timeout_ms}ms</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400">Endpoint</label>
          <p className="text-white font-mono bg-slate-700/50 p-2 rounded mt-1 break-all">
            {handler.endpoint}
          </p>
        </div>

        <div>
          <label className="text-sm text-slate-400">Retry Policy</label>
          <div className="bg-slate-700/50 p-3 rounded mt-1 space-y-1 text-sm">
            <p><span className="text-slate-400">Strategy:</span> {handler.retry_policy.strategy}</p>
            <p><span className="text-slate-400">Max Attempts:</span> {handler.retry_policy.max_attempts}</p>
            <p><span className="text-slate-400">Initial Delay:</span> {handler.retry_policy.initial_delay_ms}ms</p>
            <p><span className="text-slate-400">Max Delay:</span> {handler.retry_policy.max_delay_ms}ms</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400">Circuit Breaker</label>
          <div className="bg-slate-700/50 p-3 rounded mt-1 space-y-1 text-sm">
            <p><span className="text-slate-400">State:</span> <StatusBadge status={handler.circuit_state} /></p>
            <p><span className="text-slate-400">Enabled:</span> {handler.circuit_breaker.enabled ? 'Yes' : 'No'}</p>
            <p><span className="text-slate-400">Failure Threshold:</span> {handler.circuit_breaker.failure_threshold}</p>
            <p><span className="text-slate-400">Success Threshold:</span> {handler.circuit_breaker.success_threshold}</p>
          </div>
        </div>

        {Object.keys(handler.headers).length > 0 && (
          <div>
            <label className="text-sm text-slate-400">Headers</label>
            <pre className="code-block mt-1">
              {JSON.stringify(handler.headers, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
