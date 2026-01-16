/**
 * RustPress Advanced Dashboard
 * Showcases all advanced dashboard widgets with customizable grid
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Eye,
  MessageSquare,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  StaticDashboardGrid,
  GridItem,
  SparklineChart,
  QuickStatsComparison,
  ActivityTimeline,
  SystemHealthMonitor,
  UptimeStatusIndicator,
  ScheduledPostsCalendar,
  ContentPerformanceHeatmap,
  CompactStatsComparison,
  staggerContainer,
  fadeInUp,
} from '../../design-system';
import { useDashboardStore } from '../../store/dashboardStore';

export function AdvancedDashboard() {
  const {
    systemMetrics,
    uptimeStatus,
    scheduledPosts,
    activityEvents,
    heatmapData,
    sparklineData,
    statsComparison,
    updateSystemMetrics,
  } = useDashboardStore();

  // Simulate real-time system metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      updateSystemMetrics({
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 50,
        disk: Math.floor(Math.random() * 20) + 60,
        network: Math.floor(Math.random() * 100),
        timestamp: Date.now(),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateSystemMetrics]);

  // Get latest system metrics
  const latestMetrics = systemMetrics[systemMetrics.length - 1];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Advanced Dashboard"
        description="Enterprise-grade analytics and real-time monitoring"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
            <Link to="/posts/new">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                New Post
              </Button>
            </Link>
          </div>
        }
      />

      {/* Sparkline Charts Row */}
      <motion.div variants={fadeInUp}>
        <StaticDashboardGrid columns={4}>
          <SparklineChart
            data={sparklineData.views || []}
            label="Page Views"
            value={statsComparison.thisWeek.views}
            change={Math.round(
              ((statsComparison.thisWeek.views - statsComparison.lastWeek.views) /
                statsComparison.lastWeek.views) *
                100
            )}
            changeLabel="vs last week"
            color="primary"
            showArea
            animated
          />
          <SparklineChart
            data={sparklineData.visitors || []}
            label="Visitors"
            value={statsComparison.thisWeek.visitors}
            change={Math.round(
              ((statsComparison.thisWeek.visitors - statsComparison.lastWeek.visitors) /
                statsComparison.lastWeek.visitors) *
                100
            )}
            changeLabel="vs last week"
            color="success"
            showArea
            animated
          />
          <SparklineChart
            data={sparklineData.comments || []}
            label="Comments"
            value={statsComparison.thisWeek.comments}
            change={Math.round(
              ((statsComparison.thisWeek.comments - statsComparison.lastWeek.comments) /
                statsComparison.lastWeek.comments) *
                100
            )}
            changeLabel="vs last week"
            color="warning"
            showArea
            animated
          />
          <SparklineChart
            data={sparklineData.posts || []}
            label="New Posts"
            value={statsComparison.thisWeek.posts}
            change={Math.round(
              ((statsComparison.thisWeek.posts - statsComparison.lastWeek.posts) /
                statsComparison.lastWeek.posts) *
                100
            )}
            changeLabel="vs last week"
            color="accent"
            showArea
            animated
          />
        </StaticDashboardGrid>
      </motion.div>

      {/* Main Content Row */}
      <motion.div variants={fadeInUp}>
        <StaticDashboardGrid columns={4}>
          {/* Quick Stats Comparison - 2 columns */}
          <GridItem colSpan={2} rowSpan={2}>
            <QuickStatsComparison
              thisWeek={statsComparison.thisWeek}
              lastWeek={statsComparison.lastWeek}
              stats={[
                {
                  key: 'views',
                  label: 'Page Views',
                  icon: Eye,
                  format: (v) => v.toLocaleString(),
                  color: 'primary',
                },
                {
                  key: 'visitors',
                  label: 'Visitors',
                  icon: Users,
                  format: (v) => v.toLocaleString(),
                  color: 'success',
                },
                {
                  key: 'comments',
                  label: 'Comments',
                  icon: MessageSquare,
                  format: (v) => v.toLocaleString(),
                  color: 'warning',
                },
                {
                  key: 'posts',
                  label: 'New Posts',
                  icon: FileText,
                  format: (v) => v.toLocaleString(),
                  color: 'accent',
                },
              ]}
            />
          </GridItem>

          {/* Activity Timeline - 2 columns */}
          <GridItem colSpan={2} rowSpan={2}>
            <ActivityTimeline
              events={activityEvents}
              maxEvents={8}
              showFilter
              showRefresh
              onRefresh={() => console.log('Refreshing activity...')}
            />
          </GridItem>
        </StaticDashboardGrid>
      </motion.div>

      {/* System Monitoring Row */}
      <motion.div variants={fadeInUp}>
        <StaticDashboardGrid columns={4}>
          {/* System Health Monitor - 2 columns */}
          <GridItem colSpan={2}>
            <SystemHealthMonitor
              metrics={latestMetrics}
              variant="circular"
              showOverallStatus
            />
          </GridItem>

          {/* Uptime Status - 2 columns */}
          <GridItem colSpan={2}>
            <UptimeStatusIndicator
              status={uptimeStatus}
              showUptimeBar
              showResponseTime
              showLastIncident
              onRefresh={() => console.log('Refreshing status...')}
              onViewStatusPage={() => window.open('/status', '_blank')}
            />
          </GridItem>
        </StaticDashboardGrid>
      </motion.div>

      {/* Content Planning Row */}
      <motion.div variants={fadeInUp}>
        <StaticDashboardGrid columns={4}>
          {/* Scheduled Posts Calendar - 2 columns */}
          <GridItem colSpan={2} rowSpan={2}>
            <ScheduledPostsCalendar
              posts={scheduledPosts}
              onAddPost={() => console.log('Add post...')}
              onEditPost={(post) => console.log('Edit post:', post)}
              onPreviewPost={(post) => console.log('Preview post:', post)}
            />
          </GridItem>

          {/* Content Performance Heatmap - 2 columns */}
          <GridItem colSpan={2} rowSpan={2}>
            <ContentPerformanceHeatmap
              data={heatmapData}
              showLegend
              showBestTimes
              metric="engagements"
            />
          </GridItem>
        </StaticDashboardGrid>
      </motion.div>

      {/* Compact Stats Footer */}
      <motion.div variants={fadeInUp}>
        <CompactStatsComparison
          thisWeek={statsComparison.thisWeek}
          lastWeek={statsComparison.lastWeek}
        />
      </motion.div>
    </motion.div>
  );
}

export default AdvancedDashboard;
