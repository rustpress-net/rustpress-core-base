/**
 * RustPress Advanced Interactive Components Demo
 * Showcases enhancements 33-40: Interactive & Data Visualization components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  Trello,
  GitBranch,
  FolderTree,
  ChevronDown,
  BarChart3,
  LayoutGrid,
  Settings,
  Users,
  FileText,
  Image,
  Calendar,
  Heart,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Import all interactive components
import {
  NotificationCenter,
  NotificationToast,
  NotificationsList,
} from '../../design-system/components/NotificationCenter';
import type { Notification } from '../../design-system/components/NotificationCenter';

import {
  CommentsThread,
} from '../../design-system/components/CommentsThread';
import type { Comment } from '../../design-system/components/CommentsThread';

import {
  KanbanBoard,
  CompactKanban,
} from '../../design-system/components/KanbanBoard';
import type { KanbanColumn, KanbanCard } from '../../design-system/components/KanbanBoard';

import {
  Timeline,
  HorizontalTimeline,
  SimpleTimeline,
  ActivityTimelineList,
} from '../../design-system/components/Timeline';
import type { TimelineItem } from '../../design-system/components/Timeline';

import {
  TreeView,
  FileTree,
  ExpandableList,
} from '../../design-system/components/TreeView';
import type { TreeNode } from '../../design-system/components/TreeView';

import {
  Accordion,
  FAQAccordion,
  CollapsibleCard,
  NestedAccordion,
} from '../../design-system/components/Accordion';
import type { AccordionItem, FAQItem, NestedAccordionItem } from '../../design-system/components/Accordion';

import {
  StatsOverview,
  QuickStatsBar,
  ComparisonStats,
} from '../../design-system/components/StatsOverview';
import type { StatItem } from '../../design-system/components/StatsOverview';

import {
  DataCards,
} from '../../design-system/components/DataCards';

// ============================================================================
// Demo Section Component
// ============================================================================

interface DemoSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function DemoSection({ title, description, icon, children }: DemoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-neutral-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-neutral-200 dark:border-neutral-700 p-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

// Notifications
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Post Published',
    message: 'Your article "Getting Started with RustPress" is now live.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    action: { label: 'View Post', href: '#' },
  },
  {
    id: '2',
    type: 'info',
    title: 'New Comment',
    message: 'John Doe commented on your post.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    avatar: 'https://i.pravatar.cc/150?u=john',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Plugin Update Available',
    message: 'SEO Plugin v2.1.0 is ready to install.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    action: { label: 'Update Now', onClick: () => console.log('Update clicked') },
  },
  {
    id: '4',
    type: 'error',
    title: 'Backup Failed',
    message: 'Automatic backup could not complete. Check your storage settings.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

// Comments
const sampleComments: Comment[] = [
  {
    id: '1',
    content: 'Great article! Really helped me understand the architecture of RustPress.',
    author: {
      id: 'user1',
      name: 'Alice Johnson',
      avatar: 'https://i.pravatar.cc/150?u=alice',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reactions: [
      { emoji: '👍', count: 5, userReacted: true },
      { emoji: '❤️', count: 2, userReacted: false },
    ],
    replies: [
      {
        id: '1-1',
        content: 'Thanks Alice! Glad you found it helpful.',
        author: {
          id: 'author',
          name: 'RustPress Team',
          avatar: 'https://i.pravatar.cc/150?u=rustpress',
          isAuthor: true,
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '2',
    content: 'Could you write a follow-up article about plugin development? That would be amazing!',
    author: {
      id: 'user2',
      name: 'Bob Smith',
      avatar: 'https://i.pravatar.cc/150?u=bob',
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reactions: [
      { emoji: '👍', count: 12, userReacted: false },
      { emoji: '🎉', count: 3, userReacted: true },
    ],
    isPinned: true,
  },
];

// Kanban Data
const sampleKanbanColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', color: 'neutral', limit: 10 },
  { id: 'todo', title: 'To Do', color: 'blue' },
  { id: 'in-progress', title: 'In Progress', color: 'yellow', limit: 3 },
  { id: 'review', title: 'Review', color: 'purple' },
  { id: 'done', title: 'Done', color: 'green' },
];

const sampleKanbanCards: KanbanCard[] = [
  {
    id: 'card1',
    title: 'Implement user authentication',
    description: 'Add OAuth2 support for Google and GitHub',
    columnId: 'in-progress',
    order: 0,
    priority: 'high',
    labels: [
      { id: 'l1', name: 'Feature', color: '#3B82F6' },
      { id: 'l2', name: 'Security', color: '#EF4444' },
    ],
    assignees: [
      { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
    ],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'card2',
    title: 'Design system documentation',
    columnId: 'review',
    order: 0,
    labels: [{ id: 'l3', name: 'Docs', color: '#10B981' }],
  },
  {
    id: 'card3',
    title: 'Performance optimization',
    description: 'Optimize database queries and add caching',
    columnId: 'todo',
    order: 0,
    priority: 'medium',
  },
  {
    id: 'card4',
    title: 'Mobile responsive design',
    columnId: 'backlog',
    order: 0,
  },
  {
    id: 'card5',
    title: 'API rate limiting',
    columnId: 'done',
    order: 0,
    priority: 'high',
  },
];

// Timeline Items
const sampleTimelineItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Project Started',
    description: 'Initial project setup and repository creation',
    date: new Date('2024-01-15'),
    status: 'completed',
    icon: <CheckCircle className="w-4 h-4" />,
    user: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=alice' },
  },
  {
    id: '2',
    title: 'Core Architecture',
    description: 'Designed and implemented the core system architecture',
    date: new Date('2024-02-01'),
    status: 'completed',
    tags: ['Architecture', 'Backend'],
  },
  {
    id: '3',
    title: 'UI Components',
    description: 'Building the design system and component library',
    date: new Date('2024-03-15'),
    status: 'current',
    icon: <Settings className="w-4 h-4" />,
  },
  {
    id: '4',
    title: 'Beta Release',
    description: 'Planned beta release for early adopters',
    date: new Date('2024-04-01'),
    status: 'upcoming',
    tags: ['Release', 'Milestone'],
  },
  {
    id: '5',
    title: 'Public Launch',
    description: 'Official public release of RustPress 1.0',
    date: new Date('2024-05-15'),
    status: 'upcoming',
  },
];

// Tree Data
const sampleTreeData: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: <FolderTree className="w-4 h-4" />,
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'Button.tsx', label: 'Button.tsx', icon: <FileText className="w-4 h-4 text-blue-500" /> },
          { id: 'Card.tsx', label: 'Card.tsx', icon: <FileText className="w-4 h-4 text-blue-500" /> },
          { id: 'Modal.tsx', label: 'Modal.tsx', icon: <FileText className="w-4 h-4 text-blue-500" /> },
        ],
      },
      {
        id: 'pages',
        label: 'pages',
        children: [
          { id: 'Dashboard.tsx', label: 'Dashboard.tsx', icon: <FileText className="w-4 h-4 text-blue-500" /> },
          { id: 'Settings.tsx', label: 'Settings.tsx', icon: <FileText className="w-4 h-4 text-blue-500" /> },
        ],
      },
      {
        id: 'utils',
        label: 'utils',
        children: [
          { id: 'cn.ts', label: 'cn.ts', icon: <FileText className="w-4 h-4 text-yellow-500" /> },
          { id: 'api.ts', label: 'api.ts', icon: <FileText className="w-4 h-4 text-yellow-500" /> },
        ],
      },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon.ico', label: 'favicon.ico', icon: <Image className="w-4 h-4 text-purple-500" /> },
      { id: 'logo.svg', label: 'logo.svg', icon: <Image className="w-4 h-4 text-purple-500" /> },
    ],
  },
];

// Accordion Items
const sampleAccordionItems: AccordionItem[] = [
  {
    id: 'installation',
    title: 'Installation',
    icon: <Settings className="w-5 h-5" />,
    content: (
      <div className="space-y-2">
        <p>To install RustPress, run the following command:</p>
        <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-sm">
          cargo install rustpress
        </pre>
      </div>
    ),
  },
  {
    id: 'configuration',
    title: 'Configuration',
    icon: <FileText className="w-5 h-5" />,
    content: (
      <div className="space-y-2">
        <p>Configure your site by editing the <code>rustpress.toml</code> file:</p>
        <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-sm">
{`[site]
name = "My Blog"
url = "https://example.com"

[database]
url = "postgres://localhost/rustpress"`}
        </pre>
      </div>
    ),
  },
  {
    id: 'themes',
    title: 'Themes',
    icon: <LayoutGrid className="w-5 h-5" />,
    content: 'RustPress supports custom themes through a flexible templating system. You can create themes using HTML, CSS, and our template language.',
  },
  {
    id: 'plugins',
    title: 'Plugins',
    icon: <Settings className="w-5 h-5" />,
    badge: <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs rounded-full">New</span>,
    content: 'Extend RustPress functionality with plugins. Our plugin system allows you to add new features, modify existing behavior, and integrate with external services.',
  },
];

// FAQ Items
const sampleFAQItems: FAQItem[] = [
  {
    id: 'what-is',
    question: 'What is RustPress?',
    answer: 'RustPress is a modern, high-performance content management system built with Rust. It offers blazing-fast performance, security by default, and a great developer experience.',
    category: 'General',
  },
  {
    id: 'why-rust',
    question: 'Why is RustPress built with Rust?',
    answer: 'Rust provides memory safety without garbage collection, resulting in predictable performance and excellent resource efficiency. This makes RustPress incredibly fast and secure.',
    category: 'Technical',
  },
  {
    id: 'migration',
    question: 'Can I migrate from WordPress?',
    answer: 'Yes! RustPress includes migration tools for WordPress. You can import your posts, pages, users, and media files with a single command.',
    category: 'Migration',
  },
  {
    id: 'hosting',
    question: 'Where can I host RustPress?',
    answer: 'RustPress can be deployed anywhere that supports Docker or binary executables. We recommend platforms like Fly.io, Railway, or your own VPS.',
    category: 'Hosting',
  },
];

// Stats Data
const sampleStats: StatItem[] = [
  {
    id: 'visitors',
    label: 'Total Visitors',
    value: 125420,
    previousValue: 98500,
    change: 27.3,
    changeType: 'increase',
    icon: <Users className="w-5 h-5" />,
    color: 'primary',
    sparklineData: [45, 52, 38, 65, 78, 92, 85, 95, 110, 125],
  },
  {
    id: 'posts',
    label: 'Published Posts',
    value: 248,
    previousValue: 215,
    change: 15.3,
    changeType: 'increase',
    icon: <FileText className="w-5 h-5" />,
    color: 'success',
  },
  {
    id: 'engagement',
    label: 'Engagement Rate',
    value: '4.8%',
    change: -0.3,
    changeType: 'decrease',
    icon: <Heart className="w-5 h-5" />,
    color: 'warning',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$12,450',
    previousValue: '$10,200',
    change: 22.1,
    changeType: 'increase',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'success',
    sparklineData: [80, 92, 78, 95, 88, 102, 115, 108, 120, 124],
  },
];

// ============================================================================
// Main Demo Component
// ============================================================================

export default function AdvancedInteractive() {
  // Notification state
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [showToast, setShowToast] = useState(false);

  // Kanban state
  const [kanbanCards, setKanbanCards] = useState(sampleKanbanCards);

  // Tree state
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Comments state
  const [comments, setComments] = useState(sampleComments);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Advanced Interactive Components
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enterprise-grade interactive and data visualization components (Enhancements 33-40)
          </p>
        </div>

        {/* 33. Notification Center */}
        <DemoSection
          title="33. Notification Center"
          description="Bell icon with dropdown notifications panel, toast alerts, and notification lists"
          icon={<Bell className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Notification Center Demo */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Notification Center (Click the bell)
              </h3>
              <div className="flex items-center gap-4">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={(id) => {
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                    );
                  }}
                  onMarkAllAsRead={() => {
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, read: true }))
                    );
                  }}
                  onDismiss={(id) => {
                    setNotifications((prev) => prev.filter((n) => n.id !== id));
                  }}
                />
                <span className="text-sm text-neutral-500">
                  {notifications.filter((n) => !n.read).length} unread notifications
                </span>
              </div>
            </div>

            {/* Toast Demo */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Notification Toast
              </h3>
              <button
                onClick={() => setShowToast(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Show Toast Notification
              </button>
              {showToast && (
                <NotificationToast
                  notification={{
                    id: 'toast-demo',
                    type: 'success',
                    title: 'Action Completed',
                    message: 'Your changes have been saved successfully.',
                    timestamp: new Date(),
                    read: false,
                  }}
                  onDismiss={() => setShowToast(false)}
                  autoHideDuration={5000}
                />
              )}
            </div>

            {/* Notifications List */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Notifications List (Full Page View)
              </h3>
              <div className="max-h-64 overflow-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <NotificationsList
                  notifications={notifications}
                  onMarkAsRead={(id) => {
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                    );
                  }}
                  onDismiss={(id) => {
                    setNotifications((prev) => prev.filter((n) => n.id !== id));
                  }}
                />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 34. Comments Thread */}
        <DemoSection
          title="34. Comments Thread"
          description="Discussion thread with nested replies, reactions, and rich interactions"
          icon={<MessageSquare className="w-5 h-5" />}
        >
          <CommentsThread
            comments={comments}
            currentUser={{
              id: 'current-user',
              name: 'Current User',
              avatar: 'https://i.pravatar.cc/150?u=current',
            }}
            onAddComment={(content, parentId) => {
              const newComment: Comment = {
                id: `comment-${Date.now()}`,
                content,
                author: {
                  id: 'current-user',
                  name: 'Current User',
                  avatar: 'https://i.pravatar.cc/150?u=current',
                },
                createdAt: new Date(),
              };

              if (parentId) {
                setComments((prev) =>
                  prev.map((c) => {
                    if (c.id === parentId) {
                      return {
                        ...c,
                        replies: [...(c.replies || []), newComment],
                      };
                    }
                    return c;
                  })
                );
              } else {
                setComments((prev) => [...prev, newComment]);
              }
            }}
            onReact={(commentId, emoji) => {
              console.log('React:', commentId, emoji);
            }}
            onEdit={(commentId, content) => {
              console.log('Edit:', commentId, content);
            }}
            onDelete={(commentId) => {
              setComments((prev) => prev.filter((c) => c.id !== commentId));
            }}
          />
        </DemoSection>

        {/* 35. Kanban Board */}
        <DemoSection
          title="35. Kanban Board"
          description="Drag & drop kanban columns with cards, priorities, and labels"
          icon={<Trello className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Full Kanban */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Full Kanban Board
              </h3>
              <div className="overflow-x-auto">
                <KanbanBoard
                  columns={sampleKanbanColumns}
                  cards={kanbanCards}
                  onCardMove={(cardId, toColumnId, toIndex) => {
                    setKanbanCards((prev) =>
                      prev.map((card) =>
                        card.id === cardId
                          ? { ...card, columnId: toColumnId, order: toIndex }
                          : card
                      )
                    );
                  }}
                  onCardAdd={(columnId, title) => {
                    const newCard: KanbanCard = {
                      id: `card-${Date.now()}`,
                      title,
                      columnId,
                      order: kanbanCards.filter((c) => c.columnId === columnId).length,
                    };
                    setKanbanCards((prev) => [...prev, newCard]);
                  }}
                  onCardEdit={(cardId, updates) => {
                    setKanbanCards((prev) =>
                      prev.map((card) =>
                        card.id === cardId ? { ...card, ...updates } : card
                      )
                    );
                  }}
                  onCardDelete={(cardId) => {
                    setKanbanCards((prev) => prev.filter((c) => c.id !== cardId));
                  }}
                />
              </div>
            </div>

            {/* Compact Kanban */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Compact Kanban (Simplified)
              </h3>
              <CompactKanban
                columns={sampleKanbanColumns.slice(0, 3)}
                cards={kanbanCards.filter((c) =>
                  ['backlog', 'todo', 'in-progress'].includes(c.columnId)
                )}
              />
            </div>
          </div>
        </DemoSection>

        {/* 36. Timeline */}
        <DemoSection
          title="36. Timeline"
          description="Vertical, horizontal, and alternating timeline variants with status indicators"
          icon={<GitBranch className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vertical Timeline */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Vertical Timeline
              </h3>
              <Timeline items={sampleTimelineItems} variant="vertical" />
            </div>

            {/* Simple Timeline */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Simple Timeline
              </h3>
              <SimpleTimeline
                items={sampleTimelineItems.map((item) => ({
                  id: item.id,
                  title: item.title,
                  date: item.date,
                  status: item.status,
                }))}
              />
            </div>
          </div>

          {/* Horizontal Timeline */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Horizontal Timeline
            </h3>
            <HorizontalTimeline
              items={sampleTimelineItems.slice(0, 4)}
            />
          </div>

          {/* Activity Timeline */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Activity Timeline
            </h3>
            <ActivityTimelineList
              items={[
                {
                  id: '1',
                  title: 'Published new post',
                  timestamp: new Date(Date.now() - 5 * 60 * 1000),
                  user: { name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
                  type: 'create',
                },
                {
                  id: '2',
                  title: 'Updated settings',
                  timestamp: new Date(Date.now() - 30 * 60 * 1000),
                  user: { name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' },
                  type: 'update',
                },
                {
                  id: '3',
                  title: 'Deleted draft',
                  timestamp: new Date(Date.now() - 60 * 60 * 1000),
                  user: { name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' },
                  type: 'delete',
                },
              ]}
            />
          </div>
        </DemoSection>

        {/* 37. Tree View */}
        <DemoSection
          title="37. Tree View"
          description="Hierarchical tree navigation with expand/collapse, checkboxes, and file tree variant"
          icon={<FolderTree className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Tree */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tree View with Checkboxes
              </h3>
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <TreeView
                  nodes={sampleTreeData}
                  selectable
                  multiSelect
                  showCheckboxes
                  selectedIds={selectedNodes}
                  onSelect={(ids) => setSelectedNodes(ids)}
                />
              </div>
              {selectedNodes.length > 0 && (
                <p className="mt-2 text-sm text-neutral-500">
                  Selected: {selectedNodes.join(', ')}
                </p>
              )}
            </div>

            {/* File Tree */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                File Tree Variant
              </h3>
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <FileTree
                  nodes={[
                    {
                      id: 'project',
                      name: 'rustpress',
                      type: 'folder',
                      children: [
                        {
                          id: 'src',
                          name: 'src',
                          type: 'folder',
                          children: [
                            { id: 'main.rs', name: 'main.rs', type: 'file' },
                            { id: 'lib.rs', name: 'lib.rs', type: 'file' },
                          ],
                        },
                        { id: 'Cargo.toml', name: 'Cargo.toml', type: 'file' },
                        { id: 'README.md', name: 'README.md', type: 'file' },
                      ],
                    },
                  ]}
                  onFileSelect={(file) => console.log('Selected file:', file)}
                />
              </div>
            </div>
          </div>

          {/* Expandable List */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Expandable List (Simple Variant)
            </h3>
            <ExpandableList
              items={[
                {
                  id: 'getting-started',
                  title: 'Getting Started',
                  content: 'Learn the basics of RustPress and set up your first site.',
                },
                {
                  id: 'advanced',
                  title: 'Advanced Topics',
                  content: 'Dive deep into plugins, themes, and API development.',
                },
                {
                  id: 'deployment',
                  title: 'Deployment',
                  content: 'Deploy your RustPress site to production.',
                },
              ]}
            />
          </div>
        </DemoSection>

        {/* 38. Accordion */}
        <DemoSection
          title="38. Accordion"
          description="Collapsible sections with multiple variants, FAQ support, and nested accordions"
          icon={<ChevronDown className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Default Accordion */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Default Variant
              </h3>
              <Accordion items={sampleAccordionItems} />
            </div>

            {/* Bordered Accordion */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Bordered Variant
              </h3>
              <Accordion items={sampleAccordionItems} variant="bordered" />
            </div>
          </div>

          {/* Separated Accordion */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Separated Variant (Allow Multiple)
            </h3>
            <Accordion
              items={sampleAccordionItems}
              variant="separated"
              allowMultiple
              iconPosition="left"
              expandIcon="plus"
            />
          </div>

          {/* FAQ Accordion */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              FAQ Accordion with Search & Categories
            </h3>
            <FAQAccordion
              items={sampleFAQItems}
              showCategories
              searchable
            />
          </div>

          {/* Collapsible Card */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Collapsible Card
            </h3>
            <CollapsibleCard
              title="Advanced Settings"
              icon={<Settings className="w-5 h-5" />}
              badge={<span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Beta</span>}
              defaultOpen
              actions={
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  Reset
                </button>
              }
            >
              <div className="space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400">
                  These settings are experimental and may change in future versions.
                </p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable experimental features</span>
                </label>
              </div>
            </CollapsibleCard>
          </div>
        </DemoSection>

        {/* 39. Stats Overview */}
        <DemoSection
          title="39. Stats Overview"
          description="Statistics display with trends, sparklines, and comparison views"
          icon={<BarChart3 className="w-5 h-5" />}
        >
          {/* Cards Variant */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Stats Cards
            </h3>
            <StatsOverview stats={sampleStats} variant="cards" />
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Quick Stats Bar
            </h3>
            <QuickStatsBar
              stats={sampleStats.map((s) => ({
                id: s.id,
                label: s.label,
                value: s.value,
                change: s.change,
                changeType: s.changeType,
              }))}
            />
          </div>

          {/* Comparison Stats */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Comparison Stats
            </h3>
            <ComparisonStats
              title="This Week vs Last Week"
              stats={[
                { label: 'Visitors', current: 12500, previous: 10200 },
                { label: 'Page Views', current: 45000, previous: 48000 },
                { label: 'Conversions', current: 320, previous: 280 },
                { label: 'Revenue', current: 5400, previous: 4800 },
              ]}
            />
          </div>

          {/* Compact Variant */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
              Compact Variant
            </h3>
            <StatsOverview stats={sampleStats} variant="compact" />
          </div>
        </DemoSection>

        {/* 40. Data Cards */}
        <DemoSection
          title="40. Data Cards"
          description="Specialized cards for profiles, content, pricing, reviews, and events"
          icon={<LayoutGrid className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Profile Card
              </h3>
              <DataCards.Profile
                name="Alice Johnson"
                role="Senior Developer"
                avatar="https://i.pravatar.cc/150?u=alice"
                coverImage="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400"
                status="online"
                stats={[
                  { label: 'Posts', value: 124 },
                  { label: 'Followers', value: '2.5k' },
                  { label: 'Following', value: 380 },
                ]}
                socialLinks={[
                  { platform: 'twitter', url: '#' },
                  { platform: 'github', url: '#' },
                  { platform: 'linkedin', url: '#' },
                ]}
                onMessage={() => console.log('Message clicked')}
                onFollow={() => console.log('Follow clicked')}
              />
            </div>

            {/* Content Card */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Content Card
              </h3>
              <DataCards.Content
                title="Getting Started with RustPress"
                excerpt="Learn how to set up and configure your first RustPress site in minutes..."
                image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400"
                author={{
                  name: 'Alice Johnson',
                  avatar: 'https://i.pravatar.cc/150?u=alice',
                }}
                publishedAt={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
                readTime={5}
                category="Tutorial"
                tags={['Rust', 'CMS', 'Getting Started']}
                stats={{
                  views: 1234,
                  likes: 89,
                  comments: 23,
                }}
                onBookmark={() => console.log('Bookmark clicked')}
                onClick={() => console.log('Card clicked')}
              />
            </div>

            {/* Pricing Card */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Pricing Card
              </h3>
              <DataCards.Pricing
                name="Pro"
                description="For growing businesses"
                price={29}
                currency="$"
                period="month"
                features={[
                  { text: 'Unlimited posts', included: true },
                  { text: 'Custom domain', included: true },
                  { text: 'Analytics dashboard', included: true },
                  { text: 'Priority support', included: true },
                  { text: 'White-label', included: false },
                ]}
                highlighted
                badge="Popular"
                ctaText="Start Free Trial"
                onSelect={() => console.log('Plan selected')}
              />
            </div>

            {/* Review Card */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Review Card
              </h3>
              <DataCards.Review
                author={{
                  name: 'Bob Smith',
                  avatar: 'https://i.pravatar.cc/150?u=bob',
                }}
                rating={5}
                title="Excellent CMS!"
                content="RustPress has completely transformed how we manage our content. The performance is incredible and the admin UI is a joy to use."
                date={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                verified
                helpfulCount={42}
                onHelpful={() => console.log('Helpful clicked')}
              />
            </div>

            {/* Event Card */}
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Event Card
              </h3>
              <DataCards.Event
                title="RustPress Community Meetup"
                description="Join us for our monthly community meetup where we discuss new features and best practices."
                startDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)}
                location="Virtual (Zoom)"
                image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
                attendees={[
                  { id: '1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
                  { id: '2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' },
                  { id: '3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' },
                ]}
                totalAttendees={128}
                isOnline
                onRegister={() => console.log('Register clicked')}
                onShare={() => console.log('Share clicked')}
              />
            </div>
          </div>
        </DemoSection>

        {/* Footer */}
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <p>RustPress Design System - Interactive Components (33-40)</p>
        </div>
      </div>
    </div>
  );
}
