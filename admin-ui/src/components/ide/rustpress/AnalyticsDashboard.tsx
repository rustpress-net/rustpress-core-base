/**
 * AnalyticsDashboard - Site analytics and reporting
 * RustPress-specific analytics functionality
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Eye, Clock,
  Globe, Monitor, Smartphone, Tablet, ArrowUpRight, ArrowDownRight,
  Calendar, Download, RefreshCw, Filter, MapPin, FileText, Link
} from 'lucide-react';

export interface AnalyticsData {
  pageviews: number;
  visitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
}

export interface PageView {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTime: string;
  bounceRate: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  trend: number;
}

export interface DeviceData {
  device: string;
  sessions: number;
  percentage: number;
}

export interface GeoData {
  country: string;
  code: string;
  visitors: number;
  percentage: number;
}

interface AnalyticsDashboardProps {
  onExport?: (format: string) => void;
  onRefresh?: () => void;
}

const mockAnalytics: AnalyticsData = {
  pageviews: 125430,
  visitors: 45230,
  sessions: 52100,
  bounceRate: 42.5,
  avgSessionDuration: 185,
  pagesPerSession: 2.4
};

const mockTrends = {
  pageviews: 12.5,
  visitors: 8.3,
  sessions: 10.2,
  bounceRate: -3.1
};

const mockPageViews: PageView[] = [
  { path: '/', title: 'Home', views: 45230, uniqueViews: 38500, avgTime: '2:45', bounceRate: 35 },
  { path: '/blog', title: 'Blog', views: 28400, uniqueViews: 24300, avgTime: '3:20', bounceRate: 28 },
  { path: '/about', title: 'About Us', views: 15200, uniqueViews: 14100, avgTime: '1:45', bounceRate: 55 },
  { path: '/contact', title: 'Contact', views: 12800, uniqueViews: 11500, avgTime: '2:10', bounceRate: 40 },
  { path: '/products', title: 'Products', views: 10500, uniqueViews: 9200, avgTime: '4:15', bounceRate: 22 },
  { path: '/services', title: 'Services', views: 8400, uniqueViews: 7600, avgTime: '3:05', bounceRate: 30 },
];

const mockTrafficSources: TrafficSource[] = [
  { source: 'Organic Search', visitors: 22500, percentage: 45, trend: 15 },
  { source: 'Direct', visitors: 12000, percentage: 24, trend: 8 },
  { source: 'Social Media', visitors: 8500, percentage: 17, trend: 22 },
  { source: 'Referral', visitors: 5000, percentage: 10, trend: -5 },
  { source: 'Email', visitors: 2000, percentage: 4, trend: 12 },
];

const mockDevices: DeviceData[] = [
  { device: 'Desktop', sessions: 28000, percentage: 54 },
  { device: 'Mobile', sessions: 19500, percentage: 37 },
  { device: 'Tablet', sessions: 4600, percentage: 9 },
];

const mockGeoData: GeoData[] = [
  { country: 'United States', code: 'US', visitors: 18000, percentage: 40 },
  { country: 'United Kingdom', code: 'GB', visitors: 6500, percentage: 14 },
  { country: 'Germany', code: 'DE', visitors: 5200, percentage: 12 },
  { country: 'France', code: 'FR', visitors: 4100, percentage: 9 },
  { country: 'Canada', code: 'CA', visitors: 3800, percentage: 8 },
  { country: 'Australia', code: 'AU', visitors: 2800, percentage: 6 },
  { country: 'Other', code: 'OT', visitors: 4830, percentage: 11 },
];

const timeRanges = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onExport,
  onRefresh
}) => {
  const [analytics] = useState<AnalyticsData>(mockAnalytics);
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onRefresh?.();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop': return <Monitor className="w-4 h-4" />;
      case 'Mobile': return <Smartphone className="w-4 h-4" />;
      case 'Tablet': return <Tablet className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Analytics Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              {timeRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onExport?.('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Page Views', value: analytics.pageviews, trend: mockTrends.pageviews, icon: <Eye className="w-5 h-5" /> },
            { label: 'Visitors', value: analytics.visitors, trend: mockTrends.visitors, icon: <Users className="w-5 h-5" /> },
            { label: 'Sessions', value: analytics.sessions, trend: mockTrends.sessions, icon: <BarChart3 className="w-5 h-5" /> },
            { label: 'Bounce Rate', value: `${analytics.bounceRate}%`, trend: mockTrends.bounceRate, icon: <TrendingDown className="w-5 h-5" />, invertTrend: true },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400">{metric.icon}</span>
                <span className={`flex items-center gap-1 text-xs ${
                  (metric.invertTrend ? metric.trend < 0 : metric.trend > 0) ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(metric.trend)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
              </div>
              <div className="text-sm text-gray-400">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Traffic Chart Placeholder */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Traffic Overview</h3>
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Traffic chart visualization</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-400">Page Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-sm text-gray-400">Visitors</span>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {mockTrafficSources.map(source => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{formatNumber(source.visitors)}</span>
                      <span className={`text-xs ${source.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {source.trend > 0 ? '+' : ''}{source.trend}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Top Pages
            </h3>
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-3">Page</th>
                    <th className="pb-3 text-right">Views</th>
                    <th className="pb-3 text-right">Unique</th>
                    <th className="pb-3 text-right">Avg Time</th>
                    <th className="pb-3 text-right">Bounce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {mockPageViews.map(page => (
                    <tr key={page.path} className="hover:bg-gray-800/50">
                      <td className="py-3">
                        <div className="text-white font-medium">{page.title}</div>
                        <div className="text-xs text-gray-500">{page.path}</div>
                      </td>
                      <td className="py-3 text-right text-gray-300">{formatNumber(page.views)}</td>
                      <td className="py-3 text-right text-gray-300">{formatNumber(page.uniqueViews)}</td>
                      <td className="py-3 text-right text-gray-300">{page.avgTime}</td>
                      <td className="py-3 text-right text-gray-300">{page.bounceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Devices & Geo */}
          <div className="space-y-6">
            {/* Devices */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                Devices
              </h3>
              <div className="space-y-3">
                {mockDevices.map(device => (
                  <div key={device.device} className="flex items-center gap-3">
                    <span className="text-gray-400">{getDeviceIcon(device.device)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{device.device}</span>
                        <span className="text-sm text-gray-400">{device.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Top Countries
              </h3>
              <div className="space-y-2">
                {mockGeoData.slice(0, 5).map(geo => (
                  <div key={geo.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{geo.code === 'OT' ? '🌍' : ''}</span>
                      <span className="text-sm text-white">{geo.country}</span>
                    </div>
                    <div className="text-sm text-gray-400">{geo.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Real-time
            </h3>
            <span className="text-sm text-gray-400">Last updated: Just now</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">156</div>
              <div className="text-sm text-gray-400">Page Views (1h)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2:34</div>
              <div className="text-sm text-gray-400">Avg. Session</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">68%</div>
              <div className="text-sm text-gray-400">New Visitors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
