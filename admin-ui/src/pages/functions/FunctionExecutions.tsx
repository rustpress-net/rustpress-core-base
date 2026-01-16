import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Eye,
  X,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

interface Execution {
  id: string;
  function_id: string;
  function_name: string;
  event_type: string;
  status: string;
  duration_ms: number | null;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  retry_count: number;
  started_at: string;
  completed_at: string | null;
}

interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  avg_duration_ms: number;
}

export default function FunctionExecutions() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchExecutions();
    fetchStats();
  }, [search, statusFilter, page]);

  const fetchExecutions = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('per_page', '50');

      const response = await fetch(`/api/admin/functions/executions?${params}`);
      const data = await response.json();
      if (data.success) {
        if (page === 1) {
          setExecutions(data.data);
        } else {
          setExecutions([...executions, ...data.data]);
        }
        setHasMore(data.data.length === 50);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/functions/stats/executions');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const retryExecution = async (id: string) => {
    setRetrying(id);
    try {
      const response = await fetch(`/api/admin/functions/executions/${id}/retry`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setPage(1);
        fetchExecutions();
        fetchStats();
      } else {
        alert(data.error || 'Failed to retry execution');
      }
    } catch (error) {
      console.error('Failed to retry execution:', error);
    } finally {
      setRetrying(null);
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
      case 'running':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/functions"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Function Executions
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor function execution history
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setPage(1);
            fetchExecutions();
            fetchStats();
          }}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Zap className="w-4 h-4" />
              Total
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              Success
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.success.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <XCircle className="w-4 h-4" />
              Failed
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.failed.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-yellow-500 text-sm">
              <Clock className="w-4 h-4" />
              Pending
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.pending.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-500 text-sm">
              <Play className="w-4 h-4" />
              Avg Duration
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatDuration(stats.avg_duration_ms)}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by function name or event..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn btn-secondary flex items-center gap-2',
              showFilters && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
            </select>
            <button
              onClick={() => {
                setStatusFilter('');
                setSearch('');
                setPage(1);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Executions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading executions...</p>
          </div>
        ) : executions.length === 0 ? (
          <div className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No executions yet
            </h3>
            <p className="mt-2 text-gray-500">
              Function executions will appear here.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Function
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Started
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {executions.map((execution) => (
                  <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/functions/${execution.function_id}/edit`}
                        className="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                      >
                        {execution.function_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                        {execution.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                        getStatusColor(execution.status)
                      )}>
                        {getStatusIcon(execution.status)}
                        {execution.status}
                      </span>
                      {execution.retry_count > 0 && (
                        <span className="ml-1 text-xs text-gray-400">
                          (retry {execution.retry_count})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatDuration(execution.duration_ms)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(execution.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedExecution(execution)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {execution.status === 'failed' && (
                          <button
                            onClick={() => retryExecution(execution.id)}
                            disabled={retrying === execution.id}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Retry"
                          >
                            {retrying === execution.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPage(page + 1)}
                  className="btn btn-secondary"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Execution Details
              </h3>
              <button
                onClick={() => setSelectedExecution(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className={clsx(
                  'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full',
                  getStatusColor(selectedExecution.status)
                )}>
                  {getStatusIcon(selectedExecution.status)}
                  {selectedExecution.status}
                </span>
                <span className="text-gray-500">
                  Duration: {formatDuration(selectedExecution.duration_ms)}
                </span>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Function</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedExecution.function_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedExecution.event_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Started</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedExecution.started_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedExecution.completed_at ? formatDate(selectedExecution.completed_at) : '-'}
                  </p>
                </div>
              </div>

              {/* Error */}
              {selectedExecution.error && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Error</p>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                      {selectedExecution.error}
                    </pre>
                  </div>
                </div>
              )}

              {/* Input */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Input</p>
                <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedExecution.input, null, 2)}
                </pre>
              </div>

              {/* Output */}
              {selectedExecution.output && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Output</p>
                  <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedExecution.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              {selectedExecution.status === 'failed' && (
                <button
                  onClick={() => {
                    retryExecution(selectedExecution.id);
                    setSelectedExecution(null);
                  }}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              )}
              <button
                onClick={() => setSelectedExecution(null)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
