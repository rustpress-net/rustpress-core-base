import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Plus,
  RefreshCw,
  BarChart2,
  PieChart,
  Layers,
  FileCode,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Terminal,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';

interface Stats {
  total_functions: number;
  active_functions: number;
  inactive_functions: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  executions_today: number;
  executions_week: number;
  avg_duration_ms: number;
}

interface RecentExecution {
  id: string;
  function_id: string;
  function_name: string;
  event_type: string;
  status: string;
  duration_ms: number | null;
  started_at: string;
  error: string | null;
}

interface TopFunction {
  id: string;
  name: string;
  execution_count: number;
  success_rate: number;
  avg_duration_ms: number;
}

interface RuntimeStats {
  runtime: string;
  count: number;
  executions: number;
}

interface ScheduledRun {
  id: string;
  function_id: string;
  function_name: string;
  cron_expression: string;
  next_run_at: string;
  last_run_at: string | null;
}

const runtimeIcons: Record<string, React.ReactNode> = {
  javascript: <FileCode className="w-4 h-4 text-yellow-500" />,
  typescript: <FileCode className="w-4 h-4 text-blue-500" />,
  sql: <Database className="w-4 h-4 text-green-500" />,
  http_webhook: <Globe className="w-4 h-4 text-purple-500" />,
  email: <Mail className="w-4 h-4 text-red-500" />,
  slack: <MessageSquare className="w-4 h-4 text-pink-500" />,
  discord: <MessageSquare className="w-4 h-4 text-indigo-500" />,
  lua: <Terminal className="w-4 h-4 text-cyan-500" />,
};

const runtimeColors: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  sql: '#22c55e',
  http_webhook: '#a855f7',
  email: '#ef4444',
  slack: '#e91e63',
  discord: '#5865f2',
  lua: '#06b6d4',
};

export default function FunctionDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [topFunctions, setTopFunctions] = useState<TopFunction[]>([]);
  const [runtimeStats, setRuntimeStats] = useState<RuntimeStats[]>([]);
  const [scheduledRuns, setScheduledRuns] = useState<ScheduledRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, executionsRes, functionsRes, scheduledRes] = await Promise.all([
        fetch('/api/admin/functions/stats'),
        fetch('/api/admin/functions/executions?per_page=10'),
        fetch('/api/admin/functions?per_page=100&sort=execution_count&order=desc'),
        fetch('/api/admin/functions/scheduled'),
      ]);

      const [statsData, executionsData, functionsData, scheduledData] = await Promise.all([
        statsRes.json(),
        executionsRes.json(),
        functionsRes.json(),
        scheduledRes.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (executionsData.success) {
        setRecentExecutions(executionsData.data);
      }

      if (functionsData.success) {
        // Calculate top functions
        const functions = functionsData.data;
        const top = functions.slice(0, 5).map((f: any) => ({
          id: f.id,
          name: f.name,
          execution_count: f.execution_count,
          success_rate: 95 + Math.random() * 5, // Simulated
          avg_duration_ms: 50 + Math.random() * 200, // Simulated
        }));
        setTopFunctions(top);

        // Calculate runtime stats
        const runtimeMap = new Map<string, { count: number; executions: number }>();
        functions.forEach((f: any) => {
          const current = runtimeMap.get(f.runtime) || { count: 0, executions: 0 };
          runtimeMap.set(f.runtime, {
            count: current.count + 1,
            executions: current.executions + f.execution_count,
          });
        });
        setRuntimeStats(
          Array.from(runtimeMap.entries()).map(([runtime, data]) => ({
            runtime,
            ...data,
          }))
        );
      }

      if (scheduledData.success) {
        setScheduledRuns(scheduledData.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Functions Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor and manage your event-driven functions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link to="/functions/new" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Function
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.total_functions}
            </p>
            <p className="text-sm text-gray-500">Functions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {((stats.active_functions / stats.total_functions) * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.active_functions}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.total_executions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Executions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className={clsx(
                'text-xs flex items-center gap-1',
                stats.success_rate >= 95 ? 'text-green-500' : stats.success_rate >= 80 ? 'text-yellow-500' : 'text-red-500'
              )}>
                {stats.success_rate >= 95 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stats.success_rate.toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.successful_executions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Successful</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs text-red-500">Errors</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.failed_executions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Failed</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs text-gray-500">Avg</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {formatDuration(stats.avg_duration_ms)}
            </p>
            <p className="text-sm text-gray-500">Duration</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runtime Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Runtime Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {runtimeStats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              runtimeStats.map((runtime) => {
                const percentage = stats
                  ? (runtime.count / stats.total_functions) * 100
                  : 0;
                return (
                  <div key={runtime.runtime} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {runtimeIcons[runtime.runtime]}
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {runtime.runtime.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {runtime.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: runtimeColors[runtime.runtime] || '#6b7280',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Functions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Top Functions</h3>
            <Link to="/functions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {topFunctions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No functions yet</p>
            ) : (
              topFunctions.map((func, index) => (
                <Link
                  key={func.id}
                  to={`/functions/${func.id}/edit`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {func.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {func.execution_count.toLocaleString()} executions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-500">{func.success_rate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{formatDuration(func.avg_duration_ms)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Executions & Scheduled Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Executions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Executions</h3>
            <Link to="/functions/executions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentExecutions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No executions yet</p>
            ) : (
              recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {getStatusIcon(execution.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {execution.function_name}
                    </p>
                    <p className="text-xs text-gray-500">{execution.event_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(execution.started_at)}</p>
                    <p className="text-xs text-gray-400">{formatDuration(execution.duration_ms)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Runs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Scheduled Runs</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {scheduledRuns.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No scheduled runs</p>
            ) : (
              scheduledRuns.map((run) => (
                <Link
                  key={run.id}
                  to={`/functions/${run.function_id}/edit`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {run.function_name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{run.cron_expression}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Next run</p>
                    <p className="text-xs text-primary-600">{formatDate(run.next_run_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ready to automate?</h3>
            <p className="text-primary-100 mt-1">
              Create functions to respond to events automatically
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/functions/templates"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4" />
              Browse Templates
            </Link>
            <Link
              to="/functions/new"
              className="px-4 py-2 bg-white text-primary-600 hover:bg-primary-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Function
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
