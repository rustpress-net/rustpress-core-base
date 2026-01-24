import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '@components/Layout';
import LoadingSpinner from '@components/common/LoadingSpinner';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('@components/pages/Dashboard'));
const Queues = lazy(() => import('@components/pages/Queues'));
const QueueDetail = lazy(() => import('@components/pages/QueueDetail'));
const Messages = lazy(() => import('@components/pages/Messages'));
const Workers = lazy(() => import('@components/pages/Workers'));
const Handlers = lazy(() => import('@components/pages/Handlers'));
const Subscriptions = lazy(() => import('@components/pages/Subscriptions'));
const ScheduledJobs = lazy(() => import('@components/pages/ScheduledJobs'));
const Alerts = lazy(() => import('@components/pages/Alerts'));
const Metrics = lazy(() => import('@components/pages/Metrics'));
const AuditLogs = lazy(() => import('@components/pages/AuditLogs'));
const Settings = lazy(() => import('@components/pages/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Queue Management */}
          <Route path="/queues" element={<Queues />} />
          <Route path="/queues/:queueId" element={<QueueDetail />} />
          <Route path="/queues/:queueId/messages" element={<Messages />} />
          <Route path="/queues/:queueId/dlq" element={<Messages isDLQ />} />

          {/* Worker Management */}
          <Route path="/workers" element={<Workers />} />

          {/* Handler & Subscription Management */}
          <Route path="/handlers" element={<Handlers />} />
          <Route path="/subscriptions" element={<Subscriptions />} />

          {/* Scheduled Jobs */}
          <Route path="/jobs" element={<ScheduledJobs />} />

          {/* Monitoring */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/audit" element={<AuditLogs />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
