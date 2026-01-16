import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Code,
  Mail,
  MessageSquare,
  Globe,
  Database,
  Terminal,
  ChevronDown,
  Activity,
  FileCode,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';

interface FunctionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  runtime: string;
  status: string;
  trigger_events: string[];
  execution_count: number;
  last_executed_at: string | null;
  last_error: string | null;
  created_at: string;
}

interface Stats {
  total_functions: number;
  active_functions: number;
  inactive_functions: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
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

export default function FunctionsManager() {
  const navigate = useNavigate();
  const [functions, setFunctions] = useState<FunctionItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [runtimeFilter, setRuntimeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchFunctions();
    fetchStats();
  }, [search, statusFilter, runtimeFilter]);

  const fetchFunctions = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (runtimeFilter) params.append('runtime', runtimeFilter);
      params.append('is_template', 'false');

      const response = await fetch(`/api/admin/functions?${params}`);
      const data = await response.json();
      if (data.success) {
        setFunctions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch functions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/functions/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/functions/${id}/toggle`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setFunctions(functions.map(f =>
          f.id === id ? { ...f, status: data.data.status } : f
        ));
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const duplicateFunction = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/functions/${id}/duplicate`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/functions/${data.data.id}/edit`);
      }
    } catch (error) {
      console.error('Failed to duplicate function:', error);
    }
  };

  const deleteFunction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this function?')) return;

    try {
      const response = await fetch(`/api/admin/functions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setFunctions(functions.filter(f => f.id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete function:', error);
    }
  };

  const executeFunction = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/functions/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'manual_trigger',
          event_data: { triggered_by: 'admin' },
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Execution ${data.data.status}! Duration: ${data.data.duration_ms}ms`);
        fetchFunctions();
        fetchStats();
      } else {
        alert(`Execution failed: ${data.data?.error || data.error}`);
      }
    } catch (error) {
      console.error('Failed to execute function:', error);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Functions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create and manage event-driven functions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/functions/templates"
            className="btn btn-secondary flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Templates
          </Link>
          <Link
            to="/functions/executions"
            className="btn btn-secondary flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Executions
          </Link>
          <Link
            to="/functions/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Function
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Zap className="w-4 h-4" />
              Total
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total_functions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              Active
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.active_functions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Pause className="w-4 h-4" />
              Inactive
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.inactive_functions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-500 text-sm">
              <Play className="w-4 h-4" />
              Executions
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total_executions.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              Success
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.successful_executions.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <XCircle className="w-4 h-4" />
              Failed
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.failed_executions.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-500 text-sm">
              <Activity className="w-4 h-4" />
              Success Rate
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.success_rate.toFixed(1)}%
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
              placeholder="Search functions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <button
            onClick={() => fetchFunctions()}
            className="btn btn-secondary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="error">Error</option>
            </select>
            <select
              value={runtimeFilter}
              onChange={(e) => setRuntimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Runtimes</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="sql">SQL</option>
              <option value="http_webhook">HTTP Webhook</option>
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
            </select>
            <button
              onClick={() => {
                setStatusFilter('');
                setRuntimeFilter('');
                setSearch('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Functions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading functions...</p>
          </div>
        ) : functions.length === 0 ? (
          <div className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No functions yet
            </h3>
            <p className="mt-2 text-gray-500">
              Create your first function or start from a template.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link to="/functions/new" className="btn btn-primary">
                Create Function
              </Link>
              <Link to="/functions/templates" className="btn btn-secondary">
                Browse Templates
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Function
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Runtime
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Triggers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Executions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Run
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {functions.map((func) => (
                <tr key={func.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/functions/${func.id}/edit`}
                      className="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                    >
                      {func.name}
                    </Link>
                    {func.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {func.description}
                      </p>
                    )}
                    {func.last_error && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        {func.last_error.substring(0, 50)}...
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {runtimeIcons[func.runtime] || <Code className="w-4 h-4" />}
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {func.runtime.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {func.trigger_events.slice(0, 2).map((event) => (
                        <span
                          key={event}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          {event}
                        </span>
                      ))}
                      {func.trigger_events.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                          +{func.trigger_events.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {func.execution_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(func.last_executed_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(func.id)}
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        func.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : func.status === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}
                    >
                      {func.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => executeFunction(func.id)}
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Execute"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === func.id ? null : func.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === func.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenu(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                              <Link
                                to={`/functions/${func.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  duplicateFunction(func.id);
                                  setOpenMenu(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                              >
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </button>
                              <hr className="my-1 border-gray-200 dark:border-gray-700" />
                              <button
                                onClick={() => {
                                  deleteFunction(func.id);
                                  setOpenMenu(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
