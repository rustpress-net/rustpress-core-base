import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '@api/client';
import { PageWrapper, ErrorState } from '@components/Layout';
import { StatCard, Card, CardHeader } from '@components/common/Card';
import { StatusBadge } from '@components/common/Badge';
import { LoadingSpinner } from '@components/common';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => metricsApi.getDashboard(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Dashboard">
        <ErrorState
          message="Failed to load dashboard metrics"
          retry={refetch}
        />
      </PageWrapper>
    );
  }

  const metrics = data?.data;

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Real-time overview of your queue infrastructure"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Queues"
          value={metrics?.overview.total_queues || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="Messages in Flight"
          value={metrics?.overview.messages_in_flight.toLocaleString() || 0}
          change={{ value: 12, trend: 'up' }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          title="Active Workers"
          value={`${metrics?.overview.active_workers || 0}/${metrics?.overview.total_workers || 0}`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          }
        />
        <StatCard
          title="Throughput"
          value={`${metrics?.overview.messages_per_second.toFixed(1) || 0}/s`}
          change={{ value: 5, trend: 'up' }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput Chart */}
        <Card>
          <CardHeader title="Message Throughput" subtitle="Last 24 hours" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.throughput || []}>
                <defs>
                  <linearGradient id="colorEnqueued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="enqueued"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorEnqueued)"
                  name="Enqueued"
                />
                <Area
                  type="monotone"
                  dataKey="processed"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorProcessed)"
                  name="Processed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Latency Chart */}
        <Card>
          <CardHeader title="Processing Latency" subtitle="Percentiles (ms)" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.latency || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Line type="monotone" dataKey="p50" stroke="#22c55e" name="p50" dot={false} />
                <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="p95" dot={false} />
                <Line type="monotone" dataKey="p99" stroke="#ef4444" name="p99" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Queue Status and Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Queues */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Queue Status"
            action={
              <a href="/queues" className="text-sm text-primary-400 hover:text-primary-300">
                View all
              </a>
            }
          />
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Queue</th>
                  <th>Depth</th>
                  <th>In Flight</th>
                  <th>Rate</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.queues.slice(0, 5).map((queue) => (
                  <tr key={queue.queue_id}>
                    <td className="font-medium text-white">{queue.queue_name}</td>
                    <td>{queue.depth.toLocaleString()}</td>
                    <td>{queue.in_flight}</td>
                    <td>{queue.dequeue_rate.toFixed(1)}/s</td>
                    <td>{queue.average_processing_time_ms.toFixed(0)}ms</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-8">
                      No queues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worker Status */}
        <Card>
          <CardHeader title="Worker Pool" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active</span>
              <span className="font-medium text-success-500">
                {metrics?.workers.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Idle</span>
              <span className="font-medium text-warning-500">
                {metrics?.workers.idle || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Offline</span>
              <span className="font-medium text-danger-500">
                {metrics?.workers.offline || 0}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Utilization</span>
                <span className="text-sm font-medium text-white">
                  {((metrics?.workers.average_utilization || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar-primary"
                  style={{ width: `${(metrics?.workers.average_utilization || 0) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Processed Today</span>
                <span className="text-white">
                  {metrics?.workers.total_processed.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-400">Failed Today</span>
                <span className="text-danger-500">
                  {metrics?.workers.total_failed.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Rate Chart */}
      <Card>
        <CardHeader title="Error Rate" subtitle="Last 24 hours" />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics?.errors || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="count" fill="#ef4444" name="Errors" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </PageWrapper>
  );
}
