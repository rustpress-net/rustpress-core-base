import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Zap,
  Play,
  ChevronDown,
  FileCode,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Terminal,
  Shield,
  BarChart2,
  Bell,
  ShoppingCart,
  Settings,
  Users,
  Image,
  MessageCircle,
  RefreshCw,
  Archive,
  Clock,
  Check,
} from 'lucide-react';
import clsx from 'clsx';

interface Template {
  slug: string;
  name: string;
  description: string;
  category: string;
  runtime: string;
  trigger_events: string[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  content: <FileCode className="w-5 h-5" />,
  seo: <BarChart2 className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  comments: <MessageCircle className="w-5 h-5" />,
  media: <Image className="w-5 h-5" />,
  backup: <Archive className="w-5 h-5" />,
  maintenance: <Settings className="w-5 h-5" />,
  performance: <Zap className="w-5 h-5" />,
  analytics: <BarChart2 className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  integrations: <Globe className="w-5 h-5" />,
  notifications: <Bell className="w-5 h-5" />,
  ecommerce: <ShoppingCart className="w-5 h-5" />,
  scheduler: <Clock className="w-5 h-5" />,
};

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

const categoryColors: Record<string, string> = {
  content: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  seo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  users: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  comments: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  media: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  backup: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  performance: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  analytics: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  security: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  integrations: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  notifications: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ecommerce: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  scheduler: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function FunctionTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [runtimeFilter, setRuntimeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [usingTemplate, setUsingTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/functions/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (slug: string) => {
    setUsingTemplate(slug);
    try {
      const response = await fetch(`/api/admin/functions/templates/${slug}/use`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/functions/${data.data.id}/edit`);
      } else {
        alert(data.error || 'Failed to use template');
      }
    } catch (error) {
      console.error('Failed to use template:', error);
      alert('Failed to use template');
    } finally {
      setUsingTemplate(null);
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category))).sort();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    const matchesRuntime = !runtimeFilter || template.runtime === runtimeFilter;
    return matchesSearch && matchesCategory && matchesRuntime;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

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
        <div className="flex items-center gap-4">
          <Link
            to="/functions"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Function Templates
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {templates.length} ready-to-use templates
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
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
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
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
                setCategoryFilter('');
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

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('')}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-lg transition-colors',
            !categoryFilter
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
              cat === categoryFilter
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {categoryIcons[cat]}
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Zap className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No templates found
          </h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).sort().map(([category, categoryTemplates]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <span className={clsx('p-2 rounded-lg', categoryColors[category])}>
                  {categoryIcons[category]}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {category}
                </h2>
                <span className="text-sm text-gray-500">
                  ({categoryTemplates.length} templates)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map((template) => (
                  <div
                    key={template.slug}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {runtimeIcons[template.runtime]}
                      <span className="text-xs text-gray-500 capitalize">
                        {template.runtime.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.trigger_events.slice(0, 2).map((event) => (
                        <span
                          key={event}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {event}
                        </span>
                      ))}
                      {template.trigger_events.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{template.trigger_events.length - 2} more
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => useTemplate(template.slug)}
                      disabled={usingTemplate === template.slug}
                      className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                    >
                      {usingTemplate === template.slug ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Use Template
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {templates.length}
            </p>
            <p className="text-sm text-gray-500">Total Templates</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {categories.length}
            </p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {new Set(templates.map(t => t.runtime)).size}
            </p>
            <p className="text-sm text-gray-500">Runtimes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {templates.reduce((acc, t) => acc + t.trigger_events.length, 0)}
            </p>
            <p className="text-sm text-gray-500">Event Triggers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
