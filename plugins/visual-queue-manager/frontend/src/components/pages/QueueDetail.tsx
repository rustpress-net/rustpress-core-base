import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queueApi } from '@api/client';
import { PageWrapper, ErrorState } from '@components/Layout';
import { Button, Card, CardHeader, LoadingSpinner, StatusBadge } from '@components/common';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function QueueDetail() {
  const { queueId } = useParams<{ queueId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['queue', queueId],
    queryFn: () => queueApi.get(queueId!),
    enabled: !!queueId,
    refetchInterval: 5000,
  });

  const pauseMutation = useMutation({
    mutationFn: () => queueApi.pause(queueId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', queueId] });
      toast.success('Queue paused');
    },
    onError: () => toast.error('Failed to pause queue'),
  });

  const resumeMutation = useMutation({
    mutationFn: () => queueApi.resume(queueId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', queueId] });
      toast.success('Queue resumed');
    },
    onError: () => toast.error('Failed to resume queue'),
  });

  const purgeMutation = useMutation({
    mutationFn: () => queueApi.purge(queueId!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['queue', queueId] });
      toast.success(`Purged ${result.purged_count} messages`);
    },
    onError: () => toast.error('Failed to purge queue'),
  });

  if (isLoading) {
    return (
      <PageWrapper title="Queue Details">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !data?.data) {
    return (
      <PageWrapper title="Queue Details">
        <ErrorState message="Failed to load queue details" retry={refetch} />
      </PageWrapper>
    );
  }

  const queue = data.data;

  return (
    <PageWrapper
      title={queue.name}
      subtitle={queue.description || 'Queue details and statistics'}
      action={
        <div className="flex items-center gap-3">
          <Link to={`/queues/${queueId}/messages`}>
            <Button variant="secondary">Browse Messages</Button>
          </Link>
          {queue.enable_dlq && (
            <Link to={`/queues/${queueId}/dlq`}>
              <Button variant="secondary">View DLQ</Button>
            </Link>
          )}
          {queue.status === 'active' ? (
            <Button variant="secondary" onClick={() => pauseMutation.mutate()} loading={pauseMutation.isPending}>
              Pause
            </Button>
          ) : (
            <Button variant="success" onClick={() => resumeMutation.mutate()} loading={resumeMutation.isPending}>
              Resume
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to purge all messages?')) {
                purgeMutation.mutate();
              }
            }}
            loading={purgeMutation.isPending}
          >
            Purge
          </Button>
        </div>
      }
    >
      {/* Status Bar */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <StatusBadge status={queue.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Type:</span>
            <span className="badge-gray">{queue.queue_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Delivery:</span>
            <span className="text-slate-200">{queue.delivery_mode.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Created:</span>
            <span className="text-slate-200">{new Date(queue.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <p className="text-sm text-slate-400">Total Messages</p>
          <p className="text-2xl font-bold text-white mt-1">
            {queue.stats?.total_messages.toLocaleString() || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Visible</p>
          <p className="text-2xl font-bold text-success-500 mt-1">
            {queue.stats?.visible_messages.toLocaleString() || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">In Flight</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">
            {queue.stats?.in_flight_messages || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Delayed</p>
          <p className="text-2xl font-bold text-warning-500 mt-1">
            {queue.stats?.delayed_messages || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">DLQ</p>
          <p className="text-2xl font-bold text-danger-500 mt-1">
            {queue.stats?.dlq_messages || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Avg Processing</p>
          <p className="text-2xl font-bold text-white mt-1">
            {queue.stats?.average_processing_time_ms.toFixed(0) || 0}ms
          </p>
        </Card>
      </div>

      {/* Throughput Chart */}
      <Card>
        <CardHeader title="Message Throughput" subtitle="Last 24 hours" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                // Mock data - would come from API
                { time: '00:00', enqueued: 120, processed: 115 },
                { time: '04:00', enqueued: 80, processed: 78 },
                { time: '08:00', enqueued: 250, processed: 245 },
                { time: '12:00', enqueued: 320, processed: 310 },
                { time: '16:00', enqueued: 280, processed: 275 },
                { time: '20:00', enqueued: 180, processed: 178 },
              ]}
            >
              <defs>
                <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem',
                }}
              />
              <Area type="monotone" dataKey="enqueued" stroke="#0ea5e9" fill="url(#colorEnq)" />
              <Area type="monotone" dataKey="processed" stroke="#22c55e" fill="url(#colorProc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Queue Configuration" />
          <div className="space-y-3">
            <ConfigRow label="Max Queue Size" value={queue.max_size?.toLocaleString() || 'Unlimited'} />
            <ConfigRow label="Max Message Size" value={`${queue.max_message_size.toLocaleString()} bytes`} />
            <ConfigRow label="Visibility Timeout" value={`${queue.default_visibility_timeout} seconds`} />
            <ConfigRow label="Message Retention" value={`${queue.message_retention_seconds / 86400} days`} />
            <ConfigRow label="Deduplication" value={queue.enable_deduplication ? 'Enabled' : 'Disabled'} />
            {queue.enable_deduplication && (
              <ConfigRow label="Dedup Window" value={`${queue.deduplication_window_seconds} seconds`} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Dead Letter Queue" />
          <div className="space-y-3">
            <ConfigRow label="DLQ Enabled" value={queue.enable_dlq ? 'Yes' : 'No'} />
            {queue.enable_dlq && (
              <>
                <ConfigRow label="Max Receive Count" value={queue.max_receive_count.toString()} />
                {queue.dlq_queue_id && (
                  <ConfigRow label="Target DLQ" value={queue.dlq_queue_id} />
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Tags */}
      {Object.keys(queue.tags).length > 0 && (
        <Card>
          <CardHeader title="Tags" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(queue.tags).map(([key, value]) => (
              <span key={key} className="badge-gray">
                {key}: {value}
              </span>
            ))}
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
