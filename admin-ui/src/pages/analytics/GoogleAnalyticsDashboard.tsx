/**
 * Enterprise Google Analytics Dashboard
 *
 * Comprehensive analytics dashboard with real-time data, audience insights,
 * acquisition analysis, behavior tracking, conversions, and e-commerce metrics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Treemap,
} from 'recharts';
import {
  Activity,
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Download,
  Calendar,
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ShoppingCart,
  DollarSign,
  MousePointer,
  ExternalLink,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  MapPin,
  Layers,
  PieChart as PieChartIcon,
  BarChart2,
  Share2,
} from 'lucide-react';

// Types
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
}

interface DateRange {
  label: string;
  value: string;
  startDate: string;
  endDate: string;
}

interface AnalyticsData {
  overview: OverviewMetrics;
  realtime: RealtimeData;
  audience: AudienceData;
  acquisition: AcquisitionData;
  behavior: BehaviorData;
  conversions: ConversionsData;
  ecommerce: EcommerceData;
}

interface OverviewMetrics {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  pagesPerSession: number;
  avgSessionDuration: number;
  bounceRate: number;
  goalConversionRate: number;
  revenue: number;
  transactions: number;
}

interface RealtimeData {
  activeUsers: number;
  activeUsers1Min: number;
  activeUsers5Min: number;
  activeUsers30Min: number;
  topPages: { path: string; title: string; users: number }[];
  topLocations: { country: string; city: string; users: number }[];
  topSources: { source: string; medium: string; users: number }[];
  devices: { desktop: number; mobile: number; tablet: number };
}

interface AudienceData {
  demographics: { ageGroup: string; users: number }[];
  gender: { male: number; female: number };
  interests: { category: string; users: number }[];
  geo: { country: string; users: number; sessions: number }[];
  technology: { browser: string; users: number }[];
  devices: { category: string; users: number; sessions: number }[];
}

interface AcquisitionData {
  channels: { channel: string; sessions: number; users: number; conversions: number; revenue: number }[];
  sources: { source: string; medium: string; sessions: number; users: number }[];
  campaigns: { campaign: string; sessions: number; conversions: number; revenue: number }[];
  referrals: { referrer: string; sessions: number; users: number }[];
}

interface BehaviorData {
  topPages: { path: string; title: string; pageviews: number; avgTime: number; bounceRate: number }[];
  landingPages: { path: string; sessions: number; bounceRate: number; conversions: number }[];
  exitPages: { path: string; exits: number; exitRate: number }[];
  siteSpeed: { avgLoadTime: number; avgServerResponse: number; pageLoadSample: number };
  events: { category: string; action: string; count: number; value: number }[];
}

interface ConversionsData {
  goals: { name: string; completions: number; value: number; conversionRate: number }[];
  funnels: { step: string; users: number; dropOff: number }[];
  attribution: { channel: string; firstTouch: number; lastTouch: number; linear: number }[];
}

interface EcommerceData {
  revenue: number;
  transactions: number;
  avgOrderValue: number;
  conversionRate: number;
  products: { name: string; revenue: number; quantity: number }[];
  categories: { category: string; revenue: number; transactions: number }[];
}

// Color palette
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#8B5CF6',
  quaternary: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F97316',
  info: '#06B6D4',
  gray: '#6B7280',
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16'];

// Date range options
const DATE_RANGES: DateRange[] = [
  { label: 'Today', value: 'today', startDate: 'today', endDate: 'today' },
  { label: 'Yesterday', value: 'yesterday', startDate: 'yesterday', endDate: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7days', startDate: '7daysAgo', endDate: 'today' },
  { label: 'Last 14 Days', value: 'last14days', startDate: '14daysAgo', endDate: 'today' },
  { label: 'Last 28 Days', value: 'last28days', startDate: '28daysAgo', endDate: 'today' },
  { label: 'Last 30 Days', value: 'last30days', startDate: '30daysAgo', endDate: 'today' },
  { label: 'Last 90 Days', value: 'last90days', startDate: '90daysAgo', endDate: 'today' },
  { label: 'This Month', value: 'thisMonth', startDate: 'firstDayOfMonth', endDate: 'today' },
  { label: 'Last Month', value: 'lastMonth', startDate: 'firstDayOfLastMonth', endDate: 'lastDayOfLastMonth' },
  { label: 'This Year', value: 'thisYear', startDate: 'firstDayOfYear', endDate: 'today' },
];

// Tabs configuration
const TABS = [
  { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
  { id: 'realtime', label: 'Real-Time', icon: <Activity className="w-4 h-4" /> },
  { id: 'audience', label: 'Audience', icon: <Users className="w-4 h-4" /> },
  { id: 'acquisition', label: 'Acquisition', icon: <Share2 className="w-4 h-4" /> },
  { id: 'behavior', label: 'Behavior', icon: <MousePointer className="w-4 h-4" /> },
  { id: 'conversions', label: 'Conversions', icon: <Target className="w-4 h-4" /> },
  { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart className="w-4 h-4" /> },
];

// Mock data generator
const generateMockData = (): AnalyticsData => ({
  overview: {
    sessions: 125847,
    users: 89432,
    newUsers: 45621,
    pageviews: 387654,
    pagesPerSession: 3.08,
    avgSessionDuration: 245,
    bounceRate: 42.3,
    goalConversionRate: 4.7,
    revenue: 156789.45,
    transactions: 2847,
  },
  realtime: {
    activeUsers: 847,
    activeUsers1Min: 234,
    activeUsers5Min: 512,
    activeUsers30Min: 847,
    topPages: [
      { path: '/', title: 'Home', users: 234 },
      { path: '/products', title: 'Products', users: 156 },
      { path: '/blog', title: 'Blog', users: 89 },
      { path: '/about', title: 'About Us', users: 67 },
      { path: '/contact', title: 'Contact', users: 45 },
    ],
    topLocations: [
      { country: 'United States', city: 'New York', users: 156 },
      { country: 'United Kingdom', city: 'London', users: 98 },
      { country: 'Germany', city: 'Berlin', users: 76 },
      { country: 'France', city: 'Paris', users: 54 },
      { country: 'Canada', city: 'Toronto', users: 43 },
    ],
    topSources: [
      { source: 'google', medium: 'organic', users: 312 },
      { source: '(direct)', medium: '(none)', users: 234 },
      { source: 'facebook', medium: 'referral', users: 123 },
      { source: 'twitter', medium: 'social', users: 89 },
      { source: 'linkedin', medium: 'social', users: 56 },
    ],
    devices: { desktop: 456, mobile: 312, tablet: 79 },
  },
  audience: {
    demographics: [
      { ageGroup: '18-24', users: 12453 },
      { ageGroup: '25-34', users: 28764 },
      { ageGroup: '35-44', users: 23456 },
      { ageGroup: '45-54', users: 15678 },
      { ageGroup: '55-64', users: 6543 },
      { ageGroup: '65+', users: 2538 },
    ],
    gender: { male: 52.3, female: 47.7 },
    interests: [
      { category: 'Technology', users: 34567 },
      { category: 'Business', users: 28976 },
      { category: 'Entertainment', users: 19876 },
      { category: 'Sports', users: 12345 },
      { category: 'Travel', users: 9876 },
    ],
    geo: [
      { country: 'United States', users: 45678, sessions: 67890 },
      { country: 'United Kingdom', users: 12345, sessions: 18765 },
      { country: 'Germany', users: 8976, sessions: 12345 },
      { country: 'Canada', users: 7654, sessions: 9876 },
      { country: 'Australia', users: 5432, sessions: 7654 },
    ],
    technology: [
      { browser: 'Chrome', users: 56789 },
      { browser: 'Safari', users: 18765 },
      { browser: 'Firefox', users: 8976 },
      { browser: 'Edge', users: 4567 },
      { browser: 'Other', users: 1335 },
    ],
    devices: [
      { category: 'Desktop', users: 45678, sessions: 67890 },
      { category: 'Mobile', users: 34567, sessions: 45678 },
      { category: 'Tablet', users: 9187, sessions: 12086 },
    ],
  },
  acquisition: {
    channels: [
      { channel: 'Organic Search', sessions: 45678, users: 34567, conversions: 2345, revenue: 45678.90 },
      { channel: 'Direct', sessions: 34567, users: 28976, conversions: 1876, revenue: 34567.80 },
      { channel: 'Social', sessions: 23456, users: 19876, conversions: 987, revenue: 19876.50 },
      { channel: 'Referral', sessions: 12345, users: 9876, conversions: 567, revenue: 12345.60 },
      { channel: 'Email', sessions: 8976, users: 7654, conversions: 456, revenue: 9876.40 },
      { channel: 'Paid Search', sessions: 5678, users: 4567, conversions: 345, revenue: 7654.30 },
    ],
    sources: [
      { source: 'google', medium: 'organic', sessions: 45678, users: 34567 },
      { source: '(direct)', medium: '(none)', sessions: 34567, users: 28976 },
      { source: 'facebook', medium: 'referral', sessions: 12345, users: 9876 },
      { source: 'twitter', medium: 'social', sessions: 8976, users: 7654 },
      { source: 'linkedin', medium: 'social', sessions: 5678, users: 4567 },
    ],
    campaigns: [
      { campaign: 'Summer Sale', sessions: 12345, conversions: 567, revenue: 23456.78 },
      { campaign: 'Black Friday', sessions: 9876, conversions: 456, revenue: 18765.43 },
      { campaign: 'Newsletter', sessions: 7654, conversions: 345, revenue: 12345.67 },
      { campaign: 'Social Promo', sessions: 5432, conversions: 234, revenue: 8765.43 },
    ],
    referrals: [
      { referrer: 'facebook.com', sessions: 8976, users: 7654 },
      { referrer: 'twitter.com', sessions: 5678, users: 4567 },
      { referrer: 'linkedin.com', sessions: 4567, users: 3456 },
      { referrer: 'reddit.com', sessions: 2345, users: 1987 },
    ],
  },
  behavior: {
    topPages: [
      { path: '/', title: 'Home', pageviews: 45678, avgTime: 45, bounceRate: 35.2 },
      { path: '/products', title: 'Products', pageviews: 34567, avgTime: 120, bounceRate: 28.5 },
      { path: '/blog', title: 'Blog', pageviews: 23456, avgTime: 180, bounceRate: 42.1 },
      { path: '/pricing', title: 'Pricing', pageviews: 18765, avgTime: 90, bounceRate: 38.7 },
      { path: '/about', title: 'About', pageviews: 12345, avgTime: 60, bounceRate: 45.3 },
    ],
    landingPages: [
      { path: '/', sessions: 45678, bounceRate: 35.2, conversions: 1234 },
      { path: '/products', sessions: 23456, bounceRate: 28.5, conversions: 876 },
      { path: '/blog/article-1', sessions: 12345, bounceRate: 52.3, conversions: 234 },
      { path: '/pricing', sessions: 9876, bounceRate: 38.7, conversions: 567 },
    ],
    exitPages: [
      { path: '/checkout/thank-you', exits: 2345, exitRate: 95.2 },
      { path: '/blog', exits: 8976, exitRate: 45.3 },
      { path: '/contact', exits: 5678, exitRate: 62.1 },
    ],
    siteSpeed: { avgLoadTime: 2.4, avgServerResponse: 0.45, pageLoadSample: 45678 },
    events: [
      { category: 'Button', action: 'Click', count: 23456, value: 0 },
      { category: 'Form', action: 'Submit', count: 8976, value: 0 },
      { category: 'Video', action: 'Play', count: 5678, value: 0 },
      { category: 'Download', action: 'PDF', count: 2345, value: 0 },
    ],
  },
  conversions: {
    goals: [
      { name: 'Newsletter Signup', completions: 2345, value: 4690, conversionRate: 2.8 },
      { name: 'Contact Form', completions: 1234, value: 0, conversionRate: 1.5 },
      { name: 'Product Purchase', completions: 876, value: 45678.90, conversionRate: 1.0 },
      { name: 'Free Trial', completions: 567, value: 11340, conversionRate: 0.7 },
    ],
    funnels: [
      { step: 'Landing Page', users: 45678, dropOff: 0 },
      { step: 'Product View', users: 23456, dropOff: 48.6 },
      { step: 'Add to Cart', users: 8976, dropOff: 61.7 },
      { step: 'Checkout', users: 4567, dropOff: 49.1 },
      { step: 'Purchase', users: 2847, dropOff: 37.6 },
    ],
    attribution: [
      { channel: 'Organic Search', firstTouch: 35.2, lastTouch: 28.4, linear: 31.8 },
      { channel: 'Direct', firstTouch: 25.6, lastTouch: 32.1, linear: 28.8 },
      { channel: 'Social', firstTouch: 18.4, lastTouch: 12.3, linear: 15.4 },
      { channel: 'Email', firstTouch: 12.3, lastTouch: 18.7, linear: 15.5 },
      { channel: 'Referral', firstTouch: 8.5, lastTouch: 8.5, linear: 8.5 },
    ],
  },
  ecommerce: {
    revenue: 156789.45,
    transactions: 2847,
    avgOrderValue: 55.08,
    conversionRate: 2.26,
    products: [
      { name: 'Premium Plan', revenue: 45678.90, quantity: 456 },
      { name: 'Pro Plan', revenue: 34567.80, quantity: 567 },
      { name: 'Starter Plan', revenue: 23456.70, quantity: 876 },
      { name: 'Enterprise Plan', revenue: 18765.40, quantity: 123 },
      { name: 'Add-on Package', revenue: 12345.60, quantity: 345 },
    ],
    categories: [
      { category: 'Subscriptions', revenue: 98765.40, transactions: 1876 },
      { category: 'One-time', revenue: 34567.80, transactions: 654 },
      { category: 'Add-ons', revenue: 23456.25, transactions: 317 },
    ],
  },
});

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

// Component: Metric Card
const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, change, icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      {change !== undefined && (
        <div
          className={`flex items-center text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    {subtitle && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    )}
  </div>
);

// Component: Real-time Pulse
const RealtimePulse: React.FC<{ value: number }> = ({ value }) => (
  <div className="relative flex items-center">
    <div className="absolute w-3 h-3 bg-green-500 rounded-full animate-ping" />
    <div className="relative w-3 h-3 bg-green-500 rounded-full" />
    <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
  </div>
);

// Component: Progress Bar
const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({
  value,
  max,
  color = 'bg-blue-500',
}) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
    <div
      className={`h-2 rounded-full ${color}`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// Main Component
const GoogleAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange>(DATE_RANGES[5]); // Last 30 Days
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(generateMockData());
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Auto-refresh for realtime tab
  useEffect(() => {
    fetchData();

    if (activeTab === 'realtime') {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchData]);

  // Generate chart data for overview
  const generateTrafficChartData = () => {
    const days = 30;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      sessions: Math.floor(3000 + Math.random() * 2000),
      users: Math.floor(2000 + Math.random() * 1500),
      pageviews: Math.floor(8000 + Math.random() * 5000),
    }));
  };

  const trafficChartData = generateTrafficChartData();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Google Analytics Not Connected
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
          Connect your Google Analytics account to view comprehensive analytics data.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Configure Google Analytics
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart2 className="w-7 h-7 mr-3 text-blue-600" />
                Google Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enterprise analytics and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <div className="relative">
                <select
                  value={dateRange.value}
                  onChange={(e) => {
                    const selected = DATE_RANGES.find((r) => r.value === e.target.value);
                    if (selected) setDateRange(selected);
                  }}
                  className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DATE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Export Button */}
              <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Settings Button */}
              <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : data ? (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <MetricCard
                    title="Sessions"
                    value={formatNumber(data.overview.sessions)}
                    change={12.5}
                    icon={<Activity className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                  />
                  <MetricCard
                    title="Users"
                    value={formatNumber(data.overview.users)}
                    change={8.3}
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                  />
                  <MetricCard
                    title="Pageviews"
                    value={formatNumber(data.overview.pageviews)}
                    change={15.7}
                    icon={<Eye className="w-6 h-6 text-white" />}
                    color="bg-purple-500"
                  />
                  <MetricCard
                    title="Avg. Duration"
                    value={formatDuration(data.overview.avgSessionDuration)}
                    change={-2.1}
                    icon={<Clock className="w-6 h-6 text-white" />}
                    color="bg-orange-500"
                  />
                  <MetricCard
                    title="Revenue"
                    value={formatCurrency(data.overview.revenue)}
                    change={23.4}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    color="bg-emerald-500"
                  />
                </div>

                {/* Traffic Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Traffic Overview
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficChartData}>
                        <defs>
                          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Legend formatter={(value) => <span className="text-gray-600 dark:text-gray-300">{value}</span>} />
                        <Area
                          type="monotone"
                          dataKey="sessions"
                          stroke="#3B82F6"
                          fillOpacity={1}
                          fill="url(#colorSessions)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stroke="#10B981"
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Traffic Sources */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Traffic Sources
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.acquisition.channels}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="sessions"
                            nameKey="channel"
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                              `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {data.acquisition.channels.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Pages */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Top Pages
                    </h3>
                    <div className="space-y-4">
                      {data.behavior.topPages.slice(0, 5).map((page, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {page.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {page.path}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatNumber(page.pageviews)}
                              </p>
                              <p className="text-xs text-gray-500">views</p>
                            </div>
                            <div className="w-24">
                              <ProgressBar
                                value={page.pageviews}
                                max={data.behavior.topPages[0].pageviews}
                                color={CHART_COLORS[index % CHART_COLORS.length].replace('#', 'bg-[')}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Geographic Distribution
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.audience.geo} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                          <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="country"
                            stroke="#9CA3AF"
                            fontSize={12}
                            width={100}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                          />
                          <Bar dataKey="users" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {data.audience.geo.map((country, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center">
                            <Globe className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {country.country}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatNumber(country.users)} users
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatNumber(country.sessions)} sessions
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-Time Tab */}
            {activeTab === 'realtime' && (
              <div className="space-y-6">
                {/* Real-time header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-2">
                        Active Users Right Now
                      </p>
                      <RealtimePulse value={data.realtime.activeUsers} />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-green-100 text-xs">Last 1 min</p>
                          <p className="text-2xl font-bold">{data.realtime.activeUsers1Min}</p>
                        </div>
                        <div>
                          <p className="text-green-100 text-xs">Last 5 min</p>
                          <p className="text-2xl font-bold">{data.realtime.activeUsers5Min}</p>
                        </div>
                        <div>
                          <p className="text-green-100 text-xs">Last 30 min</p>
                          <p className="text-2xl font-bold">{data.realtime.activeUsers30Min}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Monitor className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Desktop</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data.realtime.devices.desktop}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-blue-500">
                        {((data.realtime.devices.desktop / data.realtime.activeUsers) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Smartphone className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data.realtime.devices.mobile}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-green-500">
                        {((data.realtime.devices.mobile / data.realtime.activeUsers) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tablet className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Tablet</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data.realtime.devices.tablet}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-purple-500">
                        {((data.realtime.devices.tablet / data.realtime.activeUsers) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Active Pages */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-500" />
                      Active Pages
                    </h3>
                    <div className="space-y-3">
                      {data.realtime.topPages.map((page, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {page.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {page.path}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {page.users}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-500" />
                      Top Locations
                    </h3>
                    <div className="space-y-3">
                      {data.realtime.topLocations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {location.city}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {location.country}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {location.users}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Traffic Sources */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Share2 className="w-5 h-5 mr-2 text-purple-500" />
                      Traffic Sources
                    </h3>
                    <div className="space-y-3">
                      {data.realtime.topSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {source.source}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {source.medium}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {source.users}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audience Tab */}
            {activeTab === 'audience' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Demographics */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Age Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.audience.demographics}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                          <XAxis dataKey="ageGroup" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                          />
                          <Bar dataKey="users" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Gender Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Male', value: data.audience.gender.male },
                              { name: 'Female', value: data.audience.gender.female },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#3B82F6" />
                            <Cell fill="#EC4899" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Devices */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Device Categories
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.audience.devices}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="users"
                            nameKey="category"
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                              `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                            }
                          >
                            {data.audience.devices.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Browsers */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Browser Usage
                    </h3>
                    <div className="space-y-4">
                      {data.audience.technology.map((browser, index) => {
                        const total = data.audience.technology.reduce((sum, b) => sum + b.users, 0);
                        const percent = (browser.users / total) * 100;
                        return (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {browser.browser}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {formatNumber(browser.users)} ({percent.toFixed(1)}%)
                              </span>
                            </div>
                            <ProgressBar value={percent} max={100} color="bg-blue-500" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acquisition Tab */}
            {activeTab === 'acquisition' && (
              <div className="space-y-6">
                {/* Channels */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Acquisition Channels
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Channel
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Sessions
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Users
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Conversions
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.acquisition.channels.map((channel, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-3"
                                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {channel.channel}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                              {formatNumber(channel.sessions)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                              {formatNumber(channel.users)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                              {formatNumber(channel.conversions)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(channel.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Source/Medium Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Source / Medium
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.acquisition.sources}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis
                          dataKey="source"
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={(value, index) =>
                            `${value} / ${data.acquisition.sources[index]?.medium || ''}`
                          }
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Legend formatter={(value) => <span className="text-gray-600 dark:text-gray-300">{value}</span>} />
                        <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="users" fill="#10B981" name="Users" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Behavior Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-6">
                {/* Site Speed */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Avg. Page Load Time"
                    value={`${data.behavior.siteSpeed.avgLoadTime.toFixed(2)}s`}
                    icon={<Zap className="w-6 h-6 text-white" />}
                    color="bg-yellow-500"
                  />
                  <MetricCard
                    title="Avg. Server Response"
                    value={`${data.behavior.siteSpeed.avgServerResponse.toFixed(2)}s`}
                    icon={<Activity className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                  />
                  <MetricCard
                    title="Page Load Sample"
                    value={formatNumber(data.behavior.siteSpeed.pageLoadSample)}
                    icon={<Eye className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                  />
                </div>

                {/* Top Pages Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    All Pages
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Page
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Pageviews
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Avg. Time
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Bounce Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.behavior.topPages.map((page, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="py-3 px-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {page.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{page.path}</p>
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                              {formatNumber(page.pageviews)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                              {formatDuration(page.avgTime)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                              {page.bounceRate.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Events */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top Events
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.behavior.events} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                        <YAxis
                          type="category"
                          dataKey="action"
                          stroke="#9CA3AF"
                          fontSize={12}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Conversions Tab */}
            {activeTab === 'conversions' && (
              <div className="space-y-6">
                {/* Goals Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.conversions.goals.map((goal, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Target className="w-8 h-8 text-green-500" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {goal.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <h4 className="text-sm text-gray-500 dark:text-gray-400">{goal.name}</h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatNumber(goal.completions)}
                      </p>
                      {goal.value > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Value: {formatCurrency(goal.value)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Funnel Visualization */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Conversion Funnel
                  </h3>
                  <div className="space-y-4">
                    {data.conversions.funnels.map((step, index) => {
                      const width = (step.users / data.conversions.funnels[0].users) * 100;
                      return (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {step.step}
                            </span>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {formatNumber(step.users)} users
                              </span>
                              {step.dropOff > 0 && (
                                <span className="text-sm text-red-500">
                                  -{step.dropOff.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-center"
                              style={{ width: `${width}%` }}
                            >
                              <span className="text-xs font-medium text-white">
                                {width.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Attribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Attribution Comparison
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.conversions.attribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="channel" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Legend formatter={(value) => <span className="text-gray-600 dark:text-gray-300">{value}</span>} />
                        <Bar dataKey="firstTouch" fill="#3B82F6" name="First Touch" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="lastTouch" fill="#10B981" name="Last Touch" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="linear" fill="#8B5CF6" name="Linear" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* E-commerce Tab */}
            {activeTab === 'ecommerce' && (
              <div className="space-y-6">
                {/* E-commerce Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Revenue"
                    value={formatCurrency(data.ecommerce.revenue)}
                    change={18.5}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                  />
                  <MetricCard
                    title="Transactions"
                    value={formatNumber(data.ecommerce.transactions)}
                    change={12.3}
                    icon={<ShoppingCart className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                  />
                  <MetricCard
                    title="Avg. Order Value"
                    value={formatCurrency(data.ecommerce.avgOrderValue)}
                    change={5.7}
                    icon={<TrendingUp className="w-6 h-6 text-white" />}
                    color="bg-purple-500"
                  />
                  <MetricCard
                    title="Conversion Rate"
                    value={`${data.ecommerce.conversionRate.toFixed(2)}%`}
                    change={-0.8}
                    icon={<Target className="w-6 h-6 text-white" />}
                    color="bg-orange-500"
                  />
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top Products
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Product
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Revenue
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Quantity
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.ecommerce.products.map((product, index) => {
                          const percent = (product.revenue / data.ecommerce.revenue) * 100;
                          return (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </span>
                              </td>
                              <td className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(product.revenue)}
                              </td>
                              <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                                {formatNumber(product.quantity)}
                              </td>
                              <td className="text-right py-3 px-4">
                                <div className="flex items-center justify-end space-x-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {percent.toFixed(1)}%
                                  </span>
                                  <div className="w-16">
                                    <ProgressBar value={percent} max={100} color="bg-green-500" />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Revenue by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Revenue by Category
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.ecommerce.categories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="revenue"
                            nameKey="category"
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                              `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                            }
                          >
                            {data.ecommerce.categories.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Category Performance
                    </h3>
                    <div className="space-y-4">
                      {data.ecommerce.categories.map((category, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.category}
                            </span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(category.revenue)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatNumber(category.transactions)} transactions</span>
                            <span>
                              Avg: {formatCurrency(category.revenue / category.transactions)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAnalyticsDashboard;
