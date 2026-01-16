import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Publishing & Scheduling components (29-36)
import {
  PublishingProvider,
  PublishingPanel,
} from '../../design-system/components/PublishingPanel';

import {
  ScheduleProvider,
  ScheduleCalendar,
} from '../../design-system/components/ScheduleCalendar';

import {
  WorkflowProvider,
  PublishingWorkflow,
} from '../../design-system/components/PublishingWorkflow';

import {
  RevisionProvider,
  RevisionHistory,
} from '../../design-system/components/RevisionHistory';

import {
  VisibilityProvider,
  VisibilitySettings,
} from '../../design-system/components/VisibilitySettings';

import {
  ExpirationProvider,
  ExpirationManager,
} from '../../design-system/components/ExpirationManager';

import {
  SocialProvider,
  SocialPublishing,
} from '../../design-system/components/SocialPublishing';

import {
  ContentQueueProvider,
  ContentQueue,
} from '../../design-system/components/ContentQueue';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '1.5rem',
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0',
    marginBottom: '2rem',
    overflowX: 'auto' as const,
  },
  tab: {
    padding: '0.75rem 1.25rem',
    border: 'none',
    background: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    marginLeft: '0.5rem',
  },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleAuthors = [
  { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane', email: 'jane@example.com' },
  { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike', email: 'mike@example.com' },
];

const sampleTemplates = [
  { id: 'default', name: 'Default', thumbnail: '' },
  { id: 'full-width', name: 'Full Width', thumbnail: '' },
  { id: 'sidebar-left', name: 'Sidebar Left', thumbnail: '' },
  { id: 'no-sidebar', name: 'No Sidebar', thumbnail: '' },
];

const sampleScheduledItems = [
  {
    id: '1',
    title: 'New Product Launch Announcement',
    type: 'post' as const,
    status: 'scheduled' as const,
    scheduledDate: new Date(Date.now() + 86400000),
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    categories: ['Marketing', 'Products'],
  },
  {
    id: '2',
    title: 'Weekly Newsletter',
    type: 'newsletter' as const,
    status: 'scheduled' as const,
    scheduledDate: new Date(Date.now() + 172800000),
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    categories: ['Newsletter'],
  },
  {
    id: '3',
    title: 'Holiday Sale Event',
    type: 'event' as const,
    status: 'scheduled' as const,
    scheduledDate: new Date(Date.now() + 259200000),
    author: { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
    categories: ['Events', 'Sales'],
  },
  {
    id: '4',
    title: 'Q4 Report Summary',
    type: 'page' as const,
    status: 'draft' as const,
    scheduledDate: new Date(Date.now() + 345600000),
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    categories: ['Reports'],
  },
];

const sampleWorkflowUsers = [
  { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john', role: 'Author' },
  { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane', role: 'Editor' },
  { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike', role: 'Admin' },
];

const sampleRevisions = [
  {
    id: 'rev-1',
    version: 5,
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    createdAt: new Date(),
    type: 'autosave' as const,
    title: 'Understanding React Hooks',
    content: 'React Hooks are a powerful feature that allows you to use state and other React features without writing a class component. They were introduced in React 16.8 and have since become the standard way to write React components.',
    changes: { additions: 25, deletions: 5 },
    isCurrent: true,
  },
  {
    id: 'rev-2',
    version: 4,
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    createdAt: new Date(Date.now() - 3600000),
    type: 'manual' as const,
    title: 'Understanding React Hooks',
    content: 'React Hooks allow you to use state and other React features without writing a class component. They were introduced in React 16.8.',
    changes: { additions: 50, deletions: 20 },
    isCurrent: false,
  },
  {
    id: 'rev-3',
    version: 3,
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    createdAt: new Date(Date.now() - 7200000),
    type: 'autosave' as const,
    title: 'React Hooks Guide',
    content: 'React Hooks allow you to use state without writing a class component.',
    changes: { additions: 100, deletions: 10 },
    isCurrent: false,
  },
];

const sampleRoles = [
  { id: 'admin', name: 'Administrator', count: 3 },
  { id: 'editor', name: 'Editor', count: 8 },
  { id: 'author', name: 'Author', count: 15 },
  { id: 'subscriber', name: 'Subscriber', count: 150 },
];

const sampleSocialAccounts = [
  { id: '1', platform: 'twitter' as const, username: '@rustpress', avatar: '', connected: true, followers: 15200 },
  { id: '2', platform: 'facebook' as const, username: 'RustPress CMS', avatar: '', connected: true, followers: 8500 },
  { id: '3', platform: 'linkedin' as const, username: 'RustPress', avatar: '', connected: true, followers: 3200 },
  { id: '4', platform: 'instagram' as const, username: '@rustpress_official', avatar: '', connected: false, followers: 0 },
];

const sampleQueueItems = [
  {
    id: 'q1',
    title: 'Welcome to Our New Blog',
    type: 'post' as const,
    status: 'queued' as const,
    priority: 'high' as const,
    scheduledDate: new Date(Date.now() + 3600000),
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    categories: ['Announcements'],
    wordCount: 1250,
    position: 0,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
  },
  {
    id: 'q2',
    title: 'Product Feature Update',
    type: 'post' as const,
    status: 'queued' as const,
    priority: 'normal' as const,
    scheduledDate: new Date(Date.now() + 7200000),
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    categories: ['Product'],
    wordCount: 850,
    position: 1,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(),
  },
  {
    id: 'q3',
    title: 'Holiday Promotion',
    type: 'newsletter' as const,
    status: 'paused' as const,
    priority: 'urgent' as const,
    scheduledDate: new Date(Date.now() + 10800000),
    author: { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
    categories: ['Marketing'],
    wordCount: 500,
    position: 2,
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(),
  },
];

// ============================================================================
// TAB CONTENT COMPONENTS
// ============================================================================

const PublishingPanelDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Publishing Panel
      <span style={styles.badge}>Component 29</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Main publishing controls with status, visibility, scheduling, author selection, and permalink management.
    </p>
    <PublishingProvider
      initialData={{
        status: 'draft',
        visibility: 'public',
        author: sampleAuthors[0],
        permalink: 'understanding-react-hooks',
        template: 'default',
      }}
      authors={sampleAuthors}
      templates={sampleTemplates}
      onPublish={(data) => console.log('Published:', data)}
      onSaveDraft={(data) => console.log('Draft saved:', data)}
    >
      <PublishingPanel />
    </PublishingProvider>
  </div>
);

const ScheduleCalendarDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Schedule Calendar
      <span style={styles.badge}>Component 30</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Visual calendar for scheduling posts with month, week, day, and agenda views.
    </p>
    <ScheduleProvider
      initialItems={sampleScheduledItems}
      onItemClick={(item) => console.log('Item clicked:', item)}
      onDateSelect={(date) => console.log('Date selected:', date)}
    >
      <ScheduleCalendar />
    </ScheduleProvider>
  </div>
);

const PublishingWorkflowDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Publishing Workflow
      <span style={styles.badge}>Component 31</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Content workflow management with stages: Draft, Review, Approved, Scheduled, Published.
    </p>
    <WorkflowProvider
      initialState={{
        currentStage: 'review',
        assignedReviewer: sampleWorkflowUsers[1],
        transitions: [
          {
            id: 't1',
            from: 'draft',
            to: 'review',
            user: sampleWorkflowUsers[0],
            timestamp: new Date(Date.now() - 3600000),
            comment: 'Ready for review',
          },
        ],
        comments: [
          {
            id: 'c1',
            user: sampleWorkflowUsers[1],
            content: 'Great work! Just a few minor edits needed.',
            timestamp: new Date(Date.now() - 1800000),
          },
        ],
      }}
      users={sampleWorkflowUsers}
      onStageChange={(stage, comment) => console.log('Stage changed:', stage, comment)}
    >
      <PublishingWorkflow />
    </WorkflowProvider>
  </div>
);

const RevisionHistoryDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Revision History
      <span style={styles.badge}>Component 32</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Version comparison and restore functionality with diff visualization.
    </p>
    <RevisionProvider
      initialRevisions={sampleRevisions}
      onRestore={(revision) => console.log('Restoring revision:', revision)}
      onCompare={(rev1, rev2) => console.log('Comparing:', rev1, rev2)}
    >
      <RevisionHistory />
    </RevisionProvider>
  </div>
);

const VisibilitySettingsDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Visibility Settings
      <span style={styles.badge}>Component 33</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Content visibility controls: Public, Private, Password, Members, Roles, and Scheduled visibility.
    </p>
    <VisibilityProvider
      initialData={{
        level: 'public',
        password: '',
        allowedRoles: [],
        allowedUsers: [],
        scheduledVisibility: undefined,
        searchEngineVisibility: true,
        socialSharing: true,
        rssFeed: true,
      }}
      roles={sampleRoles}
      onChange={(data) => console.log('Visibility changed:', data)}
    >
      <VisibilitySettings />
    </VisibilityProvider>
  </div>
);

const ExpirationManagerDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Expiration Manager
      <span style={styles.badge}>Component 34</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Content expiration and archival settings with scheduled actions.
    </p>
    <ExpirationProvider
      initialData={{
        enabled: false,
        expirationDate: undefined,
        action: 'draft',
        redirectUrl: '',
        customMessage: '',
        notifyBefore: 7,
        notifyEmail: true,
        allowExtension: true,
        extensionDays: 30,
      }}
      onChange={(data) => console.log('Expiration changed:', data)}
    >
      <ExpirationManager />
    </ExpirationProvider>
  </div>
);

const SocialPublishingDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Social Publishing
      <span style={styles.badge}>Component 35</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Auto-publish to social media platforms with message customization and scheduling.
    </p>
    <SocialProvider
      accounts={sampleSocialAccounts}
      onPublish={(data) => console.log('Social publish:', data)}
    >
      <SocialPublishing />
    </SocialProvider>
  </div>
);

const ContentQueueDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Content Queue
      <span style={styles.badge}>Component 36</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Queue management for scheduled content with drag-and-drop reordering and batch operations.
    </p>
    <ContentQueueProvider
      initialItems={sampleQueueItems}
      onItemPublished={(item) => console.log('Item published:', item)}
      onQueueChange={(items) => console.log('Queue changed:', items)}
    >
      <ContentQueue />
    </ContentQueueProvider>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type TabId = 'publishing' | 'calendar' | 'workflow' | 'revisions' | 'visibility' | 'expiration' | 'social' | 'queue';

interface Tab {
  id: TabId;
  label: string;
  component: React.FC;
}

const tabs: Tab[] = [
  { id: 'publishing', label: 'Publishing Panel', component: PublishingPanelDemo },
  { id: 'calendar', label: 'Schedule Calendar', component: ScheduleCalendarDemo },
  { id: 'workflow', label: 'Workflow', component: PublishingWorkflowDemo },
  { id: 'revisions', label: 'Revisions', component: RevisionHistoryDemo },
  { id: 'visibility', label: 'Visibility', component: VisibilitySettingsDemo },
  { id: 'expiration', label: 'Expiration', component: ExpirationManagerDemo },
  { id: 'social', label: 'Social', component: SocialPublishingDemo },
  { id: 'queue', label: 'Content Queue', component: ContentQueueDemo },
];

const PublishingSchedulingDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('publishing');

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PublishingPanelDemo;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>Publishing & Scheduling Components</h1>
          <p style={styles.subtitle}>
            Comprehensive publishing workflow management, scheduling, and content distribution tools (Components 29-36)
          </p>
        </header>

        <nav style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublishingSchedulingDemo;
