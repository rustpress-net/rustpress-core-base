import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '@api/client';
import { PageWrapper, ErrorState } from '@components/Layout';
import { Button, Card, CardHeader, LoadingSpinner } from '@components/common';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type TimePeriod = '1h' | '6h' | '24h' | '7d';

export default function Metrics() {
  const [period, setPeriod] = useState<TimePeriod>('24h');

  const dashboardQuery = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => metricsApi.getDashboard(),
    refetchInterval: 5000,
  });

  const throughputQuery = useQuery({
    queryKey: ['throughput', period],
    queryFn: () => metricsApi.getThroughput(period),
    refetchInterval: 10000,
  });

  const latencyQuery = useQuery({
    queryKey: ['latency', period],
    queryFn: () => metricsApi.getLatency(period),
    refetchInterval: 10000,
  });

  const errorsQuery = useQuery({
    queryKey: ['errors', period],
    queryFn: () => metricsApi.getErrors(period),
    refetchInterval: 10000,
  });

  const isLoading = dashboardQuery.isLoading;

  if (dashboardQuery.error) {
    return (
      <PageWrapper title="Metrics">
        <ErrorState message="Failed to load metrics" retry={dashboardQuery.refetch} />
      </PageWrapper>
    );
  }

  const metrics = dashboardQuery.data?.data;

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <PageWrapper
      title="Metrics"
      subtitle="Real-time performance monitoring and analytics"
      action={
        <div className="flex items-center gap-2">
          {(['1h', '6h', '24h', '7d'] as TimePeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-slate-400">Messages/sec</p>
              <p className="text-3xl font-bold text-white mt-1">
                {metrics?.overview.messages_per_second.toFixed(1) || 0}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-400">Avg Latency</p>
              <p className="text-3xl font-bold text-white mt-1">
                {metrics?.overview.average_latency_ms.toFixed(0) || 0}ms
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-400">Error Rate</p>
              <p className={`text-3xl font-bold mt-1 ${
                (metrics?.overview.error_rate || 0) > 5 ? 'text-danger-500' : 'text-success-500'
              }`}>
                {((metrics?.overview.error_rate || 0) * 100).toFixed(2)}%
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-400">Uptime</p>
              <p className="text-3xl font-bold text-success-500 mt-1">
                {formatUptime(metrics?.overview.uptime_seconds || 0)}
              </p>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Throughput Chart */}
            <Card>
              <CardHeader title="Message Throughput" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={throughputQuery.data?.data || []}>
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
                    <XAxis
                      dataKey="timestamp"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="enqueued" stroke="#0ea5e9" fill="url(#colorEnq)" name="Enqueued" />
                    <Area type="monotone" dataKey="processed" stroke="#22c55e" fill="url(#colorProc)" name="Processed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Latency Chart */}
            <Card>
              <CardHeader title="Processing Latency (ms)" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyQuery.data?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="p50" stroke="#22c55e" name="p50" dot={false} />
                    <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="p95" dot={false} />
                    <Line type="monotone" dataKey="p99" stroke="#ef4444" name="p99" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Error Chart */}
            <Card>
              <CardHeader title="Error Rate" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorsQuery.data?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                    />
                    <Bar dataKey="count" fill="#ef4444" name="Errors" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Queue Distribution */}
            <Card>
              <CardHeader title="Queue Distribution" />
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.queues.slice(0, 5).map((q, i) => ({
                        name: q.queue_name,
                        value: q.depth,
                        color: COLORS[i % COLORS.length],
                      })) || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {metrics?.queues.slice(0, 5).map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Queue Metrics Table */}
          <Card>
            <CardHeader title="Queue Metrics" />
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Queue</th>
                    <th>Depth</th>
                    <th>In Flight</th>
                    <th>Enqueue Rate</th>
                    <th>Dequeue Rate</th>
                    <th>p50</th>
                    <th>p95</th>
                    <th>p99</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.queues.map((q) => (
                    <tr key={q.queue_id}>
                      <td className="font-medium text-white">{q.queue_name}</td>
                      <td>{q.depth.toLocaleString()}</td>
                      <td>{q.in_flight}</td>
                      <td>{q.enqueue_rate.toFixed(1)}/s</td>
                      <td>{q.dequeue_rate.toFixed(1)}/s</td>
                      <td>{q.p50_latency_ms.toFixed(0)}ms</td>
                      <td>{q.p95_latency_ms.toFixed(0)}ms</td>
                      <td>{q.p99_latency_ms.toFixed(0)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </PageWrapper>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
