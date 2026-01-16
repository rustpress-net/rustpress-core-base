import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserRolesProvider,
  UserRoles,
  EditorialCalendarProvider,
  EditorialCalendar,
  AssignmentManagerProvider,
  AssignmentManager,
  ApprovalWorkflowProvider,
  ApprovalWorkflow,
  TeamChatProvider,
  TeamChat,
  ActivityLogProvider,
  ActivityLog,
  ContentLockingProvider,
  ContentLocking,
  NotificationPreferencesProvider,
  NotificationPreferences,
} from '../../design-system/components';
import type {
  Role,
  EditorialContentItem,
  EditorialTeamMember,
  Assignment,
  AssignmentTeamMember,
  ApprovalRequest,
  Channel,
  Message,
  ChatTeamMember,
  Activity,
  ContentLock,
  LockUser,
} from '../../design-system/components';

// ============================================================================
// SAMPLE DATA
// ============================================================================

// Sample Roles
const sampleRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    color: '#dc2626',
    isSystem: true,
    userCount: 2,
    permissions: {
      content: {
        create: true,
        read: true,
        update: true,
        delete: true,
        publish: true,
        unpublish: true,
        schedule: true,
        archive: true,
      },
      media: {
        upload: true,
        read: true,
        update: true,
        delete: true,
        organize: true,
      },
      users: {
        create: true,
        read: true,
        update: true,
        delete: true,
        assignRoles: true,
      },
      settings: {
        view: true,
        update: true,
        manageSite: true,
      },
      plugins: {
        view: true,
        install: true,
        activate: true,
        configure: true,
        delete: true,
      },
      themes: {
        view: true,
        install: true,
        activate: true,
        customize: true,
        delete: true,
      },
      system: {
        viewLogs: true,
        manageBackups: true,
        updateSystem: true,
        manageIntegrations: true,
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can manage and publish content',
    color: '#3b82f6',
    isSystem: true,
    userCount: 5,
    permissions: {
      content: {
        create: true,
        read: true,
        update: true,
        delete: true,
        publish: true,
        unpublish: true,
        schedule: true,
        archive: true,
      },
      media: {
        upload: true,
        read: true,
        update: true,
        delete: false,
        organize: true,
      },
      users: {
        create: false,
        read: true,
        update: false,
        delete: false,
        assignRoles: false,
      },
      settings: {
        view: true,
        update: false,
        manageSite: false,
      },
      plugins: {
        view: true,
        install: false,
        activate: false,
        configure: false,
        delete: false,
      },
      themes: {
        view: true,
        install: false,
        activate: false,
        customize: true,
        delete: false,
      },
      system: {
        viewLogs: false,
        manageBackups: false,
        updateSystem: false,
        manageIntegrations: false,
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: 'author',
    name: 'Author',
    description: 'Can write and manage own content',
    color: '#22c55e',
    isSystem: true,
    userCount: 12,
    permissions: {
      content: {
        create: true,
        read: true,
        update: true,
        delete: false,
        publish: false,
        unpublish: false,
        schedule: true,
        archive: false,
      },
      media: {
        upload: true,
        read: true,
        update: true,
        delete: false,
        organize: false,
      },
      users: {
        create: false,
        read: true,
        update: false,
        delete: false,
        assignRoles: false,
      },
      settings: {
        view: false,
        update: false,
        manageSite: false,
      },
      plugins: {
        view: false,
        install: false,
        activate: false,
        configure: false,
        delete: false,
      },
      themes: {
        view: false,
        install: false,
        activate: false,
        customize: false,
        delete: false,
      },
      system: {
        viewLogs: false,
        manageBackups: false,
        updateSystem: false,
        manageIntegrations: false,
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-20'),
  },
];

// Sample Team Members
const sampleTeamMembers: EditorialTeamMember[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: undefined, role: 'Editor' },
  { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com', avatar: undefined, role: 'Author' },
  { id: 'user-3', name: 'Carol Williams', email: 'carol@example.com', avatar: undefined, role: 'Author' },
  { id: 'user-4', name: 'David Brown', email: 'david@example.com', avatar: undefined, role: 'Contributor' },
];

// Sample Calendar Items
const sampleCalendarItems: EditorialContentItem[] = [
  {
    id: 'item-1',
    title: 'Getting Started with RustPress',
    type: 'post',
    status: 'published',
    author: sampleTeamMembers[0],
    scheduledDate: new Date(),
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-27'),
  },
  {
    id: 'item-2',
    title: 'Advanced Theme Customization',
    type: 'post',
    status: 'scheduled',
    author: sampleTeamMembers[1],
    scheduledDate: new Date(Date.now() + 86400000 * 2),
    createdAt: new Date('2024-12-22'),
    updatedAt: new Date('2024-12-26'),
  },
  {
    id: 'item-3',
    title: 'Plugin Development Guide',
    type: 'page',
    status: 'draft',
    author: sampleTeamMembers[2],
    scheduledDate: new Date(Date.now() + 86400000 * 5),
    createdAt: new Date('2024-12-24'),
    updatedAt: new Date('2024-12-27'),
  },
  {
    id: 'item-4',
    title: 'Performance Optimization Tips',
    type: 'post',
    status: 'review',
    author: sampleTeamMembers[0],
    scheduledDate: new Date(Date.now() + 86400000 * 3),
    createdAt: new Date('2024-12-25'),
    updatedAt: new Date('2024-12-27'),
  },
];

// Sample Assignments
const assignmentTeamMembers: AssignmentTeamMember[] = sampleTeamMembers.map(m => ({
  ...m,
  workload: Math.floor(Math.random() * 5) + 1,
  capacity: 8,
}));

const sampleAssignments: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Write Q1 Product Roadmap',
    description: 'Create detailed roadmap for Q1 2025 product features',
    contentType: 'post',
    status: 'in_progress',
    priority: 'high',
    assignee: assignmentTeamMembers[0],
    assignedBy: assignmentTeamMembers[1],
    dueDate: new Date(Date.now() + 86400000 * 3),
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-27'),
  },
  {
    id: 'assign-2',
    title: 'Update Documentation',
    description: 'Refresh API documentation with new endpoints',
    contentType: 'page',
    status: 'pending',
    priority: 'medium',
    assignee: assignmentTeamMembers[1],
    assignedBy: assignmentTeamMembers[0],
    dueDate: new Date(Date.now() + 86400000 * 7),
    createdAt: new Date('2024-12-22'),
    updatedAt: new Date('2024-12-26'),
  },
  {
    id: 'assign-3',
    title: 'Security Audit Report',
    description: 'Complete security audit and write summary',
    contentType: 'post',
    status: 'review',
    priority: 'critical',
    assignee: assignmentTeamMembers[2],
    assignedBy: assignmentTeamMembers[0],
    dueDate: new Date(Date.now() + 86400000),
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-27'),
  },
];

// Sample Approval Requests
const sampleApprovalRequests: ApprovalRequest[] = [
  {
    id: 'approval-1',
    contentId: 'content-1',
    contentTitle: 'RustPress 2.0 Announcement',
    contentType: 'post',
    author: {
      id: 'user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Author',
    },
    status: 'in_progress',
    currentStepIndex: 1,
    steps: [
      {
        id: 'step-1',
        type: 'review',
        name: 'Editorial Review',
        description: 'Review content for accuracy and style',
        status: 'approved',
        reviewer: { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
        completedAt: new Date('2024-12-26'),
      },
      {
        id: 'step-2',
        type: 'approval',
        name: 'Manager Approval',
        description: 'Final approval from content manager',
        status: 'pending',
        reviewer: { id: 'user-3', name: 'Carol Williams', email: 'carol@example.com', role: 'Manager' },
      },
      {
        id: 'step-3',
        type: 'publish',
        name: 'Publish',
        description: 'Publish content to live site',
        status: 'pending',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        stepId: 'step-1',
        author: { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
        content: 'Looks great! Just made some minor style adjustments.',
        createdAt: new Date('2024-12-26'),
      },
    ],
    submittedAt: new Date('2024-12-25'),
    updatedAt: new Date('2024-12-27'),
  },
];

// Sample Chat Data
const chatTeamMembers: ChatTeamMember[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', status: 'online', role: 'Editor' },
  { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com', status: 'online', role: 'Author' },
  { id: 'user-3', name: 'Carol Williams', email: 'carol@example.com', status: 'away', role: 'Author' },
  { id: 'user-4', name: 'David Brown', email: 'david@example.com', status: 'offline', role: 'Contributor' },
];

const sampleChannels: Channel[] = [
  { id: 'ch-1', name: 'general', type: 'public', unreadCount: 3, memberCount: 4, createdAt: new Date('2024-01-01') },
  { id: 'ch-2', name: 'content-team', type: 'public', unreadCount: 1, memberCount: 3, createdAt: new Date('2024-02-15') },
  { id: 'ch-3', name: 'announcements', type: 'public', unreadCount: 0, memberCount: 4, createdAt: new Date('2024-01-01') },
];

const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    channelId: 'ch-1',
    type: 'text',
    content: 'Hey team! Just finished the new blog post draft.',
    author: chatTeamMembers[0],
    createdAt: new Date(Date.now() - 3600000 * 2),
    reactions: [{ emoji: '👍', count: 2, users: ['user-2', 'user-3'] }],
  },
  {
    id: 'msg-2',
    channelId: 'ch-1',
    type: 'text',
    content: 'Awesome! I\'ll take a look at it now.',
    author: chatTeamMembers[1],
    createdAt: new Date(Date.now() - 3600000),
    reactions: [],
  },
  {
    id: 'msg-3',
    channelId: 'ch-1',
    type: 'text',
    content: 'Don\'t forget we have the content review meeting at 3pm.',
    author: chatTeamMembers[2],
    createdAt: new Date(Date.now() - 1800000),
    reactions: [{ emoji: '✅', count: 3, users: ['user-1', 'user-2', 'user-4'] }],
  },
];

// Sample Activity Log
const sampleActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'content_created',
    category: 'content',
    description: 'Created new post "Getting Started Guide"',
    user: { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: undefined },
    target: { id: 'post-1', type: 'post', title: 'Getting Started Guide' },
    metadata: { wordCount: 1500 },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'act-2',
    type: 'content_published',
    category: 'content',
    description: 'Published post "RustPress Features"',
    user: { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com', avatar: undefined },
    target: { id: 'post-2', type: 'post', title: 'RustPress Features' },
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 'act-3',
    type: 'user_login',
    category: 'auth',
    description: 'User logged in',
    user: { id: 'user-3', name: 'Carol Williams', email: 'carol@example.com', avatar: undefined },
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 10800000),
  },
  {
    id: 'act-4',
    type: 'media_uploaded',
    category: 'media',
    description: 'Uploaded image "hero-banner.png"',
    user: { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: undefined },
    target: { id: 'media-1', type: 'media', title: 'hero-banner.png' },
    metadata: { fileSize: 2500000, mimeType: 'image/png' },
    timestamp: new Date(Date.now() - 14400000),
  },
  {
    id: 'act-5',
    type: 'settings_updated',
    category: 'settings',
    description: 'Updated site settings',
    user: { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: undefined },
    target: { id: 'settings', type: 'settings', title: 'General Settings' },
    metadata: { changed: ['siteName', 'timezone'] },
    timestamp: new Date(Date.now() - 86400000),
  },
];

// Sample Content Locks
const lockUser: LockUser = {
  id: 'user-1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'Editor',
};

const sampleLocks: ContentLock[] = [
  {
    id: 'lock-1',
    contentId: 'post-1',
    contentType: 'post',
    contentTitle: 'Getting Started with RustPress',
    status: 'locked',
    lockedBy: lockUser,
    lockedAt: new Date(Date.now() - 600000),
    expiresAt: new Date(Date.now() + 600000),
    lastActivity: new Date(Date.now() - 60000),
    sessionId: 'session-123',
    isHeartbeatActive: true,
  },
  {
    id: 'lock-2',
    contentId: 'page-1',
    contentType: 'page',
    contentTitle: 'About Us',
    status: 'locked',
    lockedBy: { ...lockUser, id: 'user-2', name: 'Bob Smith', email: 'bob@example.com' },
    lockedAt: new Date(Date.now() - 300000),
    expiresAt: new Date(Date.now() + 600000),
    lastActivity: new Date(Date.now() - 30000),
    sessionId: 'session-456',
    isHeartbeatActive: true,
  },
];

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: '32px 48px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginTop: '8px',
    maxWidth: '600px',
    lineHeight: '1.6',
  },
  navigation: {
    display: 'flex',
    gap: '8px',
    padding: '16px 48px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto' as const,
  },
  navButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  navButtonInactive: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  content: {
    padding: '0',
  },
  componentWrapper: {
    minHeight: 'calc(100vh - 200px)',
  },
};

// ============================================================================
// COMPONENT TABS
// ============================================================================

type TabId = 'roles' | 'calendar' | 'assignments' | 'approvals' | 'chat' | 'activity' | 'locking' | 'notifications';

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

const tabs: TabConfig[] = [
  { id: 'roles', label: 'User Roles', icon: '👥', description: 'Role & permission management' },
  { id: 'calendar', label: 'Editorial Calendar', icon: '📅', description: 'Team content scheduling' },
  { id: 'assignments', label: 'Assignments', icon: '📋', description: 'Content assignment tracking' },
  { id: 'approvals', label: 'Approvals', icon: '✅', description: 'Multi-step approval workflow' },
  { id: 'chat', label: 'Team Chat', icon: '💬', description: 'Team communication' },
  { id: 'activity', label: 'Activity Log', icon: '📊', description: 'Activity tracking & audit' },
  { id: 'locking', label: 'Content Locking', icon: '🔒', description: 'Concurrent editing locks' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Notification preferences' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CollaborationWorkflowDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('roles');

  const renderComponent = () => {
    switch (activeTab) {
      case 'roles':
        return (
          <UserRolesProvider initialRoles={sampleRoles}>
            <UserRoles />
          </UserRolesProvider>
        );
      case 'calendar':
        return (
          <EditorialCalendarProvider
            initialItems={sampleCalendarItems}
            initialTeamMembers={sampleTeamMembers}
          >
            <EditorialCalendar />
          </EditorialCalendarProvider>
        );
      case 'assignments':
        return (
          <AssignmentManagerProvider
            initialAssignments={sampleAssignments}
            initialTeamMembers={assignmentTeamMembers}
          >
            <AssignmentManager />
          </AssignmentManagerProvider>
        );
      case 'approvals':
        return (
          <ApprovalWorkflowProvider
            initialRequests={sampleApprovalRequests}
            currentUser={{ id: 'user-3', name: 'Carol Williams', email: 'carol@example.com', role: 'Manager' }}
          >
            <ApprovalWorkflow />
          </ApprovalWorkflowProvider>
        );
      case 'chat':
        return (
          <TeamChatProvider
            initialChannels={sampleChannels}
            initialMessages={sampleMessages}
            initialMembers={chatTeamMembers}
            currentUser={chatTeamMembers[0]}
          >
            <TeamChat />
          </TeamChatProvider>
        );
      case 'activity':
        return (
          <ActivityLogProvider initialActivities={sampleActivities}>
            <ActivityLog />
          </ActivityLogProvider>
        );
      case 'locking':
        return (
          <ContentLockingProvider
            initialLocks={sampleLocks}
            initialUser={lockUser}
          >
            <ContentLocking />
          </ContentLockingProvider>
        );
      case 'notifications':
        return (
          <NotificationPreferencesProvider>
            <NotificationPreferences />
          </NotificationPreferencesProvider>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Collaboration & Workflow</h1>
        <p style={styles.subtitle}>
          Enterprise collaboration tools for team content management,
          editorial workflows, and real-time communication.
        </p>
      </header>

      <nav style={styles.navigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.navButton,
              ...(activeTab === tab.id ? styles.navButtonActive : styles.navButtonInactive),
            }}
            title={tab.description}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={styles.componentWrapper}
          >
            {renderComponent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CollaborationWorkflowDemo;
