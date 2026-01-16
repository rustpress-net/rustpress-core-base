/**
 * RustPress Enterprise Dashboard
 * Modern dashboard with metrics, charts, and activity feeds
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
  Image,
  Settings,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  PageHeader,
  Grid,
  AnimatedGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Avatar,
  MetricCard,
  ActivityFeed,
  QuickStatsRow,
  ProgressCard,
  ScheduleWidget,
  RealTimeWidget,
  PerformanceScore,
  TopContentWidget,
  NotificationWidget,
  StatComparison,
  staggerContainer,
  staggerItem,
  fadeInUp,
} from '../../design-system';

// Sample metrics data
const metrics = [
  {
    title: 'Total Posts',
    value: 247,
    change: { value: 12.5, trend: 'up' as const, label: 'vs last month' },
    icon: <FileText className="w-5 h-5" />,
    iconColor: 'primary' as const,
    sparkline: [45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 82, 88],
  },
  {
    title: 'Page Views',
    value: 48592,
    change: { value: 8.3, trend: 'up' as const, label: 'vs last month' },
    icon: <Eye className="w-5 h-5" />,
    iconColor: 'success' as const,
    sparkline: [3200, 3500, 3100, 3800, 4200, 3900, 4500, 4100, 4800, 5200, 4900, 5500],
  },
  {
    title: 'Active Users',
    value: 1284,
    change: { value: -2.4, trend: 'down' as const, label: 'vs last month' },
    icon: <Users className="w-5 h-5" />,
    iconColor: 'warning' as const,
    sparkline: [1400, 1350, 1300, 1380, 1320, 1290, 1340, 1280, 1250, 1300, 1260, 1284],
  },
  {
    title: 'Comments',
    value: 892,
    change: { value: 15.2, trend: 'up' as const, label: 'vs last month' },
    icon: <MessageSquare className="w-5 h-5" />,
    iconColor: 'info' as const,
    sparkline: [650, 680, 720, 695, 750, 780, 820, 790, 850, 880, 860, 892],
  },
];

// Quick stats
const quickStats = [
  { label: 'Draft Posts', value: 12, icon: <FileText className="w-4 h-4" />, color: 'warning' as const },
  { label: 'Scheduled', value: 5, icon: <Clock className="w-4 h-4" />, color: 'info' as const },
  { label: 'Published Today', value: 3, icon: <CheckCircle className="w-4 h-4" />, color: 'success' as const },
  { label: 'Pending Review', value: 8, icon: <AlertCircle className="w-4 h-4" />, color: 'danger' as const },
];

// Activity items
const activityItems = [
  {
    id: '1',
    type: 'publish' as const,
    title: 'Getting Started with RustPress',
    description: 'Published by John Developer',
    timestamp: '15 minutes ago',
    user: { name: 'John Developer' },
  },
  {
    id: '2',
    type: 'comment' as const,
    title: 'New comment on Plugin Development Guide',
    description: 'Sarah Editor commented',
    timestamp: '45 minutes ago',
    user: { name: 'Sarah Editor' },
  },
  {
    id: '3',
    type: 'update' as const,
    title: 'Site Settings updated',
    description: 'Mike Admin made changes',
    timestamp: '2 hours ago',
    user: { name: 'Mike Admin' },
  },
  {
    id: '4',
    type: 'create' as const,
    title: 'SEO Best Practices',
    description: 'New post created by Emily Writer',
    timestamp: '3 hours ago',
    user: { name: 'Emily Writer' },
  },
  {
    id: '5',
    type: 'create' as const,
    title: '15 new images uploaded',
    description: 'Alex Designer uploaded new media',
    timestamp: '4 hours ago',
    user: { name: 'Alex Designer' },
  },
];

// Progress items
const progressItems = [
  { label: 'Storage Used', value: 65, max: 100, color: 'primary' as const },
  { label: 'API Quota', value: 8420, max: 10000, color: 'success' as const },
  { label: 'CDN Bandwidth', value: 75, max: 100, color: 'warning' as const },
];

// Schedule items
const scheduleItems = [
  {
    id: '1',
    title: 'Weekly Newsletter',
    time: '10:00 AM',
    type: 'task' as const,
  },
  {
    id: '2',
    title: 'Database Backup',
    time: '2:00 PM',
    type: 'reminder' as const,
  },
  {
    id: '3',
    title: 'Team Meeting',
    time: '4:00 PM',
    type: 'meeting' as const,
  },
];

// Quick action links
const quickActions = [
  { label: 'New Post', href: '/posts/new', icon: <FileText className="w-5 h-5" />, color: 'bg-primary-500' },
  { label: 'Upload Media', href: '/media', icon: <Image className="w-5 h-5" />, color: 'bg-accent-500' },
  { label: 'Add User', href: '/users', icon: <Users className="w-5 h-5" />, color: 'bg-success-500' },
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" />, color: 'bg-warning-500' },
];

// Recent posts
const recentPosts = [
  { title: 'Getting Started with RustPress', status: 'published', views: 1234, date: '2 hours ago' },
  { title: 'Building Custom Themes', status: 'draft', views: 0, date: '5 hours ago' },
  { title: 'Plugin Development Guide', status: 'published', views: 856, date: '1 day ago' },
  { title: 'SEO Best Practices', status: 'scheduled', views: 0, date: 'Tomorrow' },
  { title: 'Performance Optimization', status: 'published', views: 2341, date: '3 days ago' },
];

// Top content items
const topContentItems = [
  { id: '1', title: 'Getting Started with RustPress', views: 12543, change: 24 },
  { id: '2', title: 'Performance Optimization Guide', views: 8721, change: 12 },
  { id: '3', title: 'Building Custom Themes', views: 6234, change: -5 },
  { id: '4', title: 'Plugin Development Best Practices', views: 5892, change: 18 },
  { id: '5', title: 'SEO Optimization Tips', views: 4231, change: 8 },
];

// Notifications
const notifications = [
  { id: '1', title: 'New comment pending review', description: 'On "Getting Started with RustPress"', type: 'info' as const, timestamp: '5 min ago', read: false },
  { id: '2', title: 'Backup completed successfully', description: 'Database backup finished', type: 'success' as const, timestamp: '1 hour ago', read: false },
  { id: '3', title: 'Storage usage at 85%', description: 'Consider upgrading your plan', type: 'warning' as const, timestamp: '3 hours ago', read: true },
  { id: '4', title: 'API rate limit warning', description: '90% of daily quota used', type: 'error' as const, timestamp: '5 hours ago', read: true },
];

// Performance breakdown
const performanceBreakdown = [
  { label: 'Speed Index', score: 92, maxScore: 100 },
  { label: 'First Contentful Paint', score: 88, maxScore: 100 },
  { label: 'Time to Interactive', score: 85, maxScore: 100 },
  { label: 'Cumulative Layout Shift', score: 95, maxScore: 100 },
];

export function Dashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your site."
        actions={
          <Link to="/posts/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Post
            </Button>
          </Link>
        }
      />

      {/* Metrics Grid */}
      <AnimatedGrid columns={4} gap="md">
        {metrics.map((metric, index) => (
          <motion.div key={metric.title} variants={staggerItem}>
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </AnimatedGrid>

      {/* Real-time and Quick Stats Row */}
      <Grid columns={4} gap="md">
        <motion.div variants={fadeInUp}>
          <RealTimeWidget
            currentVisitors={247}
            peakToday={412}
            trend="up"
          />
        </motion.div>
        <motion.div variants={fadeInUp} className="col-span-3">
          <QuickStatsRow stats={quickStats} />
        </motion.div>
      </Grid>

      {/* Main Content Grid */}
      <Grid columns={3} gap="md">
        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Quick Actions
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <span className="font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Posts */}
        <motion.div variants={fadeInUp} className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Recent Posts
                </h3>
                <Link to="/posts">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody padding="none">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.title}
                    className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {post.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {post.views > 0 && (
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {post.views.toLocaleString()} views
                        </span>
                      )}
                      <Badge
                        variant={
                          post.status === 'published'
                            ? 'success'
                            : post.status === 'draft'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {post.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </Grid>

      {/* Analytics Row */}
      <Grid columns={4} gap="md">
        {/* Top Content */}
        <motion.div variants={fadeInUp} className="col-span-2">
          <TopContentWidget
            items={topContentItems}
            title="Top Performing Content"
          />
        </motion.div>

        {/* Performance Score */}
        <motion.div variants={fadeInUp}>
          <PerformanceScore
            score={89}
            label="Site Performance"
            breakdown={performanceBreakdown}
          />
        </motion.div>

        {/* Notifications */}
        <motion.div variants={fadeInUp}>
          <NotificationWidget
            notifications={notifications}
            onMarkAllRead={() => console.log('Mark all read')}
          />
        </motion.div>
      </Grid>

      {/* Bottom Row */}
      <Grid columns={3} gap="md">
        {/* Activity Feed */}
        <motion.div variants={fadeInUp} className="col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Recent Activity
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ActivityFeed
                activities={activityItems}
                maxItems={5}
              />
            </CardBody>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Progress Card */}
          <ProgressCard
            title="Resource Usage"
            items={progressItems}
          />

          {/* Schedule Widget */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Today's Schedule
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ScheduleWidget items={scheduleItems} />
            </CardBody>
          </Card>
        </motion.div>
      </Grid>

      {/* Stats Comparison Row */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Month-over-Month Comparison
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatComparison
                title="Total Revenue"
                currentValue={48592}
                previousValue={42341}
                format="currency"
                period="vs last month"
              />
              <StatComparison
                title="New Subscribers"
                currentValue={1284}
                previousValue={1156}
                format="number"
                period="vs last month"
              />
              <StatComparison
                title="Conversion Rate"
                currentValue={3.8}
                previousValue={3.2}
                format="percentage"
                period="vs last month"
              />
              <StatComparison
                title="Avg. Session"
                currentValue={4.2}
                previousValue={3.9}
                format="number"
                period="vs last month"
              />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* System Status */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              System Status
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Database', status: 'online', latency: '12ms' },
                { label: 'Cache', status: 'online', latency: '2ms' },
                { label: 'CDN', status: 'online', latency: '45ms' },
                { label: 'Search', status: 'indexing', latency: '156ms' },
              ].map((service) => (
                <div
                  key={service.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        service.status === 'online'
                          ? 'bg-success-500 animate-pulse'
                          : 'bg-warning-500 animate-pulse'
                      }`}
                    />
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      {service.label}
                    </span>
                  </div>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {service.latency}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
