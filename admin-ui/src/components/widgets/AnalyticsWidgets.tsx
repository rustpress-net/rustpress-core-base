/**
 * Analytics Dashboard Widgets
 *
 * Reusable widgets for displaying Google Analytics data on dashboards.
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Activity,
  BarChart3,
  FileText,
  Share2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Link } from 'react-router-dom';

// Types
interface RealtimeData {
  activeUsers: number;
  activeUsersPerMinute: number[];
  topActivePages: { pagePath: string; pageTitle: string; activeUsers: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
}

interface TrafficDataPoint {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
}

interface TopPage {
  pagePath: string;
  pageTitle: string;
  pageviews: number;
  uniquePageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface ChannelData {
  channel: string;
  sessions: number;
  users: number;
  bounceRate: number;
  conversionRate: number;
}

interface OverviewMetrics {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  comparison?: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
  };
}

// Color palette
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const DEVICE_COLORS = { desktop: '#3B82F6', mobile: '#10B981', tablet: '#F59E0B' };

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatPercentChange = (current: number, previous: number): { value: string; isPositive: boolean } => {
  if (previous === 0) return { value: '0%', isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    isPositive: change >= 0,
  };
};

// ===============================
// Realtime Widget
// ===============================
interface RealtimeWidgetProps {
  data?: RealtimeData;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const RealtimeWidget: React.FC<RealtimeWidgetProps> = ({
  data,
  isLoading = false,
  onRefresh,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh) onRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const deviceData = data?.deviceBreakdown
    ? [
        { name: 'Desktop', value: data.deviceBreakdown.desktop, icon: Monitor, color: DEVICE_COLORS.desktop },
        { name: 'Mobile', value: data.deviceBreakdown.mobile, icon: Smartphone, color: DEVICE_COLORS.mobile },
        { name: 'Tablet', value: data.deviceBreakdown.tablet, icon: Tablet, color: DEVICE_COLORS.tablet },
      ]
    : [];

  const totalDevices = deviceData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Real-Time</h3>
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Active Users Count */}
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {data?.activeUsers || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Active users right now
              </div>
            </div>

            {/* Mini Sparkline */}
            {data?.activeUsersPerMinute && data.activeUsersPerMinute.length > 0 && (
              <div className="h-12 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.activeUsersPerMinute.slice(-30).map((v, i) => ({ value: v, min: i }))}>
                    <defs>
                      <linearGradient id="realtimeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="url(#realtimeGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Device Breakdown */}
            <div className="space-y-2">
              {deviceData.map((device) => {
                const Icon = device.icon;
                const percentage = ((device.value / totalDevices) * 100).toFixed(0);
                return (
                  <div key={device.name} className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" style={{ color: device.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{device.name}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: device.color }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {device.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Top Active Pages */}
            {data?.topActivePages && data.topActivePages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Active Pages
                </div>
                {data.topActivePages.slice(0, 3).map((page, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                      {page.pageTitle || page.pagePath}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {page.activeUsers}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/analytics?tab=realtime"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          View realtime report
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

// ===============================
// Traffic Overview Widget
// ===============================
interface TrafficWidgetProps {
  data?: TrafficDataPoint[];
  metrics?: OverviewMetrics;
  isLoading?: boolean;
  dateRange?: string;
  className?: string;
}

export const TrafficWidget: React.FC<TrafficWidgetProps> = ({
  data = [],
  metrics,
  isLoading = false,
  dateRange = 'Last 7 days',
  className = '',
}) => {
  const metricCards = metrics
    ? [
        {
          label: 'Sessions',
          value: formatNumber(metrics.sessions),
          change: metrics.comparison
            ? formatPercentChange(metrics.sessions, metrics.comparison.sessions)
            : null,
          icon: Users,
        },
        {
          label: 'Users',
          value: formatNumber(metrics.users),
          change: metrics.comparison
            ? formatPercentChange(metrics.users, metrics.comparison.users)
            : null,
          icon: Eye,
        },
        {
          label: 'Pageviews',
          value: formatNumber(metrics.pageviews),
          change: metrics.comparison
            ? formatPercentChange(metrics.pageviews, metrics.comparison.pageviews)
            : null,
          icon: FileText,
        },
        {
          label: 'Bounce Rate',
          value: `${metrics.bounceRate.toFixed(1)}%`,
          change: metrics.comparison
            ? formatPercentChange(metrics.bounceRate, metrics.comparison.bounceRate)
            : null,
          icon: TrendingDown,
          invertChange: true,
        },
      ]
    : [];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Traffic Overview</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{dateRange}</span>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {metricCards.map((metric) => {
                const Icon = metric.icon;
                const isPositive = metric.invertChange
                  ? !metric.change?.isPositive
                  : metric.change?.isPositive;
                return (
                  <div key={metric.label} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                      <Icon className="w-4 h-4 mr-1" />
                      <span className="text-xs">{metric.label}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metric.value}
                    </div>
                    {metric.change && (
                      <div className={`text-xs flex items-center ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {metric.change.value}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            {data.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#3B82F6"
                      fill="url(#trafficGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/analytics"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          View full analytics
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

// ===============================
// Top Pages Widget
// ===============================
interface TopPagesWidgetProps {
  data?: TopPage[];
  isLoading?: boolean;
  limit?: number;
  className?: string;
}

export const TopPagesWidget: React.FC<TopPagesWidgetProps> = ({
  data = [],
  isLoading = false,
  limit = 5,
  className = '',
}) => {
  const pages = data.slice(0, limit);
  const maxPageviews = Math.max(...pages.map((p) => p.pageviews), 1);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Top Pages</h3>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No page data available
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                    {page.pageTitle || page.pagePath}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(page.pageviews)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(page.pageviews / maxPageviews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/analytics?tab=behavior"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          View all pages
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

// ===============================
// Acquisition Widget
// ===============================
interface AcquisitionWidgetProps {
  data?: ChannelData[];
  isLoading?: boolean;
  className?: string;
}

export const AcquisitionWidget: React.FC<AcquisitionWidgetProps> = ({
  data = [],
  isLoading = false,
  className = '',
}) => {
  const chartData = data.slice(0, 6).map((c, i) => ({
    name: c.channel,
    sessions: c.sessions,
    color: COLORS[i % COLORS.length],
  }));

  const totalSessions = chartData.reduce((sum, c) => sum + c.sessions, 0) || 1;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <Share2 className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Traffic Sources</h3>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No acquisition data available
          </div>
        ) : (
          <div className="flex items-center">
            {/* Pie Chart */}
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="sessions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 ml-4 space-y-2">
              {chartData.map((channel, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {channel.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {((channel.sessions / totalSessions) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/analytics?tab=acquisition"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          View acquisition report
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

// ===============================
// Metrics Card Widget
// ===============================
interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: { value: string; isPositive: boolean };
  icon: React.ElementType;
  iconColor?: string;
  subtitle?: string;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-500',
  subtitle,
  className = '',
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {change && (
          <div className={`text-sm flex items-center mt-1 ${
            change.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change.value}
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 bg-gray-100 dark:bg-gray-700 rounded-lg ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// ===============================
// Session Duration Widget
// ===============================
interface SessionDurationWidgetProps {
  avgDuration: number;
  change?: { value: string; isPositive: boolean };
  className?: string;
}

export const SessionDurationWidget: React.FC<SessionDurationWidgetProps> = ({
  avgDuration,
  change,
  className = '',
}) => (
  <MetricsCard
    title="Avg. Session Duration"
    value={formatDuration(avgDuration)}
    change={change}
    icon={Clock}
    iconColor="text-amber-500"
    className={className}
  />
);

// ===============================
// Geographic Widget (Compact)
// ===============================
interface GeoWidgetProps {
  data?: { country: string; countryCode: string; sessions: number }[];
  isLoading?: boolean;
  limit?: number;
  className?: string;
}

export const GeoWidget: React.FC<GeoWidgetProps> = ({
  data = [],
  isLoading = false,
  limit = 5,
  className = '',
}) => {
  const countries = data.slice(0, limit);
  const maxSessions = Math.max(...countries.map((c) => c.sessions), 1);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Globe className="w-5 h-5 text-indigo-500 mr-2" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Top Countries</h3>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No geographic data available
          </div>
        ) : (
          <div className="space-y-3">
            {countries.map((country, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {country.country}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(country.sessions)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(country.sessions / maxSessions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/analytics?tab=audience"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          View audience report
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default {
  RealtimeWidget,
  TrafficWidget,
  TopPagesWidget,
  AcquisitionWidget,
  MetricsCard,
  SessionDurationWidget,
  GeoWidget,
};
