import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Users,
  Share2,
  MessageSquare,
  Heart,
  Bookmark,
  ExternalLink,
  Calendar,
  Target,
  Zap,
  Award,
  ChevronDown,
  RefreshCw,
  Download,
  Settings,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus as MinusIcon
} from 'lucide-react';
import clsx from 'clsx';

interface AnalyticsMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface EngagementData {
  date: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  shares: number;
  comments: number;
}

interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
  color: string;
}

interface TopReferrer {
  url: string;
  visits: number;
  percentage: number;
}

interface ContentAnalyticsSettings {
  showRealTimeData: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showPredictions: boolean;
  compareWithPrevious: boolean;
  dateRange: '7d' | '30d' | '90d' | '1y' | 'all';
  metricsToShow: string[];
}

interface ContentAnalyticsProps {
  postId?: string;
  onSettingsChange?: (settings: ContentAnalyticsSettings) => void;
  className?: string;
}

const mockMetrics: AnalyticsMetric[] = [
  { id: 'views', label: 'Total Views', value: 12847, previousValue: 11234, unit: '', icon: Eye, color: 'blue', trend: 'up' },
  { id: 'visitors', label: 'Unique Visitors', value: 8932, previousValue: 8156, unit: '', icon: Users, color: 'green', trend: 'up' },
  { id: 'avgTime', label: 'Avg. Time on Page', value: 245, previousValue: 198, unit: 's', icon: Clock, color: 'purple', trend: 'up' },
  { id: 'bounceRate', label: 'Bounce Rate', value: 34.2, previousValue: 38.5, unit: '%', icon: TrendingDown, color: 'amber', trend: 'down' },
  { id: 'shares', label: 'Social Shares', value: 487, previousValue: 412, unit: '', icon: Share2, color: 'pink', trend: 'up' },
  { id: 'comments', label: 'Comments', value: 56, previousValue: 48, unit: '', icon: MessageSquare, color: 'indigo', trend: 'up' },
  { id: 'likes', label: 'Likes', value: 892, previousValue: 756, unit: '', icon: Heart, color: 'red', trend: 'up' },
  { id: 'bookmarks', label: 'Bookmarks', value: 234, previousValue: 198, unit: '', icon: Bookmark, color: 'yellow', trend: 'up' }
];

const mockEngagementData: EngagementData[] = [
  { date: '2024-01-14', views: 1234, uniqueVisitors: 876, avgTimeOnPage: 198, bounceRate: 42, shares: 45, comments: 8 },
  { date: '2024-01-15', views: 1456, uniqueVisitors: 1023, avgTimeOnPage: 212, bounceRate: 38, shares: 52, comments: 12 },
  { date: '2024-01-16', views: 1789, uniqueVisitors: 1245, avgTimeOnPage: 234, bounceRate: 35, shares: 67, comments: 15 },
  { date: '2024-01-17', views: 2134, uniqueVisitors: 1567, avgTimeOnPage: 256, bounceRate: 32, shares: 89, comments: 18 },
  { date: '2024-01-18', views: 1876, uniqueVisitors: 1298, avgTimeOnPage: 245, bounceRate: 34, shares: 78, comments: 14 },
  { date: '2024-01-19', views: 1654, uniqueVisitors: 1156, avgTimeOnPage: 238, bounceRate: 36, shares: 65, comments: 11 },
  { date: '2024-01-20', views: 2345, uniqueVisitors: 1678, avgTimeOnPage: 267, bounceRate: 30, shares: 98, comments: 22 }
];

const mockTrafficSources: TrafficSource[] = [
  { source: 'Organic Search', visits: 4523, percentage: 35.2, color: '#3B82F6' },
  { source: 'Direct', visits: 2987, percentage: 23.3, color: '#10B981' },
  { source: 'Social Media', visits: 2345, percentage: 18.3, color: '#F59E0B' },
  { source: 'Referral', visits: 1876, percentage: 14.6, color: '#8B5CF6' },
  { source: 'Email', visits: 789, percentage: 6.1, color: '#EF4444' },
  { source: 'Other', visits: 327, percentage: 2.5, color: '#6B7280' }
];

const mockReferrers: TopReferrer[] = [
  { url: 'google.com', visits: 3245, percentage: 25.3 },
  { url: 'twitter.com', visits: 1234, percentage: 9.6 },
  { url: 'facebook.com', visits: 987, percentage: 7.7 },
  { url: 'linkedin.com', visits: 756, percentage: 5.9 },
  { url: 'reddit.com', visits: 543, percentage: 4.2 }
];

export const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({
  postId,
  onSettingsChange,
  className
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'traffic' | 'predictions'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState<ContentAnalyticsSettings>({
    showRealTimeData: true,
    autoRefresh: true,
    refreshInterval: 30,
    showPredictions: true,
    compareWithPrevious: true,
    dateRange: '7d',
    metricsToShow: ['views', 'visitors', 'avgTime', 'bounceRate', 'shares', 'comments']
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatValue = (value: number, unit: string) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K${unit}`;
    return `${value}${unit}`;
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const getMaxValue = (data: EngagementData[], key: keyof EngagementData) => {
    return Math.max(...data.map(d => d[key] as number));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: TrendingUp },
    { id: 'traffic', label: 'Traffic Sources', icon: Share2 },
    { id: 'predictions', label: 'Predictions', icon: Zap }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Content Analytics</h2>
            <p className="text-sm text-gray-500">Track performance and engagement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={settings.dateRange}
            onChange={(e) => setSettings({ ...settings, dateRange: e.target.value as any })}
            className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700"
          >
            <RefreshCw size={18} className={clsx(isRefreshing && 'animate-spin')} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-blue-100 text-blue-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showRealTimeData}
                  onChange={(e) => setSettings({ ...settings, showRealTimeData: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Real-time Data</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Auto Refresh</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPredictions}
                  onChange={(e) => setSettings({ ...settings, showPredictions: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Predictions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compareWithPrevious}
                  onChange={(e) => setSettings({ ...settings, compareWithPrevious: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Compare with Previous</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockMetrics.slice(0, 8).map((metric) => {
                const Icon = metric.icon;
                const change = calculateChange(metric.value, metric.previousValue);
                const isPositive = metric.trend === 'up' || (metric.trend === 'down' && metric.id === 'bounceRate');

                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={18} className={`text-${metric.color}-500`} />
                      <div className={clsx(
                        'flex items-center gap-1 text-xs font-medium',
                        isPositive ? 'text-green-600' : 'text-red-600'
                      )}>
                        {metric.trend === 'up' ? <ArrowUp size={12} /> :
                         metric.trend === 'down' ? <ArrowDown size={12} /> :
                         <MinusIcon size={12} />}
                        {change}%
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mini Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-medium mb-4">Views Over Time</h3>
              <div className="h-40 flex items-end gap-2">
                {mockEngagementData.map((day, idx) => {
                  const maxViews = getMaxValue(mockEngagementData, 'views');
                  const height = (day.views / maxViews) * 100;
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.views.toLocaleString()} views
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {mockEngagementData.map(day => (
                  <span key={day.date}>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {['shares', 'comments', 'likes', 'bookmarks'].map(metricId => {
                const metric = mockMetrics.find(m => m.id === metricId)!;
                const Icon = metric.icon;
                return (
                  <div key={metricId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-900/30 rounded-lg`}>
                        <Icon size={24} className={`text-${metric.color}-600`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{metric.label}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((metric.value / 1000) * 100, 100)}%` }}
                        className={`h-full bg-${metric.color}-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Engagement Timeline */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-medium mb-4">Engagement Timeline</h3>
              <div className="space-y-4">
                {mockEngagementData.slice(-5).map((day, idx) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 w-20">
                      {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 h-4 bg-blue-200 rounded" style={{ width: `${(day.shares / 100) * 100}%` }} title={`${day.shares} shares`} />
                      <div className="flex-1 h-4 bg-green-200 rounded" style={{ width: `${(day.comments / 25) * 100}%` }} title={`${day.comments} comments`} />
                    </div>
                    <div className="text-sm font-medium w-24 text-right">
                      {day.shares + day.comments} actions
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 rounded" /> Shares
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-200 rounded" /> Comments
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="space-y-6">
            {/* Traffic Sources Pie Chart Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-medium mb-4">Traffic Sources</h3>
                <div className="space-y-3">
                  {mockTrafficSources.map((source, idx) => (
                    <motion.div
                      key={source.source}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{source.source}</span>
                          <span className="text-gray-500">{source.percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${source.percentage}%` }}
                            transition={{ delay: idx * 0.1 + 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium w-16 text-right">
                        {source.visits.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-medium mb-4">Top Referrers</h3>
                <div className="space-y-3">
                  {mockReferrers.map((referrer, idx) => (
                    <motion.div
                      key={referrer.url}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-300">#{idx + 1}</div>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {referrer.url}
                            <ExternalLink size={12} className="text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-500">{referrer.percentage}% of traffic</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{referrer.visits.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">visits</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && settings.showPredictions && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Zap size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Predictions</h3>
                  <p className="text-sm text-gray-600">Based on current trends and historical data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Target size={16} />
                    <span className="text-sm font-medium">Projected Views (30 days)</span>
                  </div>
                  <div className="text-3xl font-bold">38,420</div>
                  <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <ArrowUp size={14} />
                    +23% from current pace
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-pink-600 mb-2">
                    <Award size={16} />
                    <span className="text-sm font-medium">Viral Potential</span>
                  </div>
                  <div className="text-3xl font-bold">72%</div>
                  <div className="text-sm text-gray-500 mt-1">High likelihood of trending</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">Best Posting Time</span>
                  </div>
                  <div className="text-3xl font-bold">Tue 10AM</div>
                  <div className="text-sm text-gray-500 mt-1">For maximum engagement</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-medium mb-4">Optimization Recommendations</h3>
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, text: 'Add more internal links to increase time on site', priority: 'high' },
                  { icon: Share2, text: 'Include share buttons at the end of content', priority: 'medium' },
                  { icon: MessageSquare, text: 'Add a call-to-action for comments', priority: 'medium' },
                  { icon: Eye, text: 'Improve meta description for better CTR', priority: 'low' }
                ].map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg"
                  >
                    <rec.icon size={18} className="text-blue-500" />
                    <span className="flex-1 text-sm">{rec.text}</span>
                    <span className={clsx(
                      'px-2 py-1 text-xs rounded-full',
                      rec.priority === 'high' && 'bg-red-100 text-red-700',
                      rec.priority === 'medium' && 'bg-amber-100 text-amber-700',
                      rec.priority === 'low' && 'bg-green-100 text-green-700'
                    )}>
                      {rec.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
          {settings.autoRefresh && ` • Auto-refresh in ${settings.refreshInterval}s`}
        </div>
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download size={14} />
          Export Report
        </button>
      </div>
    </motion.div>
  );
};

export default ContentAnalytics;
