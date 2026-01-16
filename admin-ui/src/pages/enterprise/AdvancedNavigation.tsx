/**
 * Advanced Navigation & Layout Demo Page
 *
 * Showcases components 57-64:
 * - CommandPalette (57)
 * - NavigationMenu (58)
 * - Resizable (59)
 * - VirtualList (60)
 * - Dock (61)
 * - FloatingToolbar (62)
 * - SplitView (63)
 * - PinnableSidebar (64)
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Home,
  FileText,
  Settings,
  Users,
  BarChart3,
  Mail,
  Calendar,
  Image,
  Film,
  Folder,
  Star,
  Trash,
  Archive,
  Send,
  Inbox,
  Tag,
  Clock,
  Globe,
  Code,
  Terminal,
  Database,
  Server,
  Shield,
  Key,
  Bell,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import {
  PageContainer,
  Section,
  Card,
  CardBody,
  Button,
  Badge,
} from '../../design-system/components';
import { CommandPalette } from '../../design-system/components/CommandPalette';
import { NavigationMenu, MegaMenu, BreadcrumbNav, TabNav } from '../../design-system/components/NavigationMenu';
import { TwoColumnLayout, ThreeColumnLayout } from '../../design-system/components/Resizable';
import { VirtualList, VirtualGrid } from '../../design-system/components/VirtualList';
import { Dock, MiniDock, AppLauncher } from '../../design-system/components/Dock';
import { FloatingToolbar, TextEditorToolbar } from '../../design-system/components/FloatingToolbar';
import { SplitView, MasterPanel, DetailPanel, ListItem, CollapsibleSplitView } from '../../design-system/components/SplitView';
import { PinnableSidebar, IconSidebar } from '../../design-system/components/PinnableSidebar';
import { cn } from '../../utils/cn';

// Demo data generators
const generateListItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
    date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
    status: ['Active', 'Pending', 'Complete'][Math.floor(Math.random() * 3)],
  }));
};

const emailItems = [
  { id: '1', from: 'John Doe', subject: 'Project Update', preview: 'Hey, just wanted to give you an update on...', time: '10:30 AM', unread: true },
  { id: '2', from: 'Jane Smith', subject: 'Meeting Tomorrow', preview: 'Can we reschedule our meeting to...', time: '9:15 AM', unread: true },
  { id: '3', from: 'Mike Johnson', subject: 'RE: Design Review', preview: 'I looked at the designs and I think...', time: 'Yesterday', unread: false },
  { id: '4', from: 'Sarah Wilson', subject: 'Quarterly Report', preview: 'Please find attached the quarterly...', time: 'Yesterday', unread: false },
  { id: '5', from: 'Team Lead', subject: 'Sprint Planning', preview: 'Reminder: Sprint planning is scheduled for...', time: '2 days ago', unread: false },
];

export default function AdvancedNavigation() {
  // Command Palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState('overview');

  // SplitView state
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Virtual list data
  const [listItems] = useState(() => generateListItems(1000));

  // Dock items
  const dockItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" />, isActive: true },
    { id: 'files', label: 'Files', icon: <FileText className="w-6 h-6" />, badge: 3 },
    { id: 'users', label: 'Users', icon: <Users className="w-6 h-6" /> },
    { id: 'sep1', label: '', icon: null, separator: true },
    { id: 'mail', label: 'Mail', icon: <Mail className="w-6 h-6" />, badge: 12 },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-6 h-6" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-6 h-6" /> },
    { id: 'sep2', label: '', icon: null, separator: true },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> },
  ];

  // Navigation menu items
  const navMenuItems = [
    {
      id: 'products',
      label: 'Products',
      children: [
        { id: 'cms', label: 'Content Management', icon: <FileText className="w-4 h-4" />, description: 'Manage your content' },
        { id: 'ecommerce', label: 'E-commerce', icon: <Globe className="w-4 h-4" />, description: 'Online store' },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, description: 'Track performance' },
      ],
    },
    {
      id: 'solutions',
      label: 'Solutions',
      children: [
        { id: 'enterprise', label: 'Enterprise', icon: <Database className="w-4 h-4" />, description: 'Large scale solutions' },
        { id: 'startup', label: 'Startups', icon: <Code className="w-4 h-4" />, description: 'Quick deployment' },
        { id: 'agency', label: 'Agencies', icon: <Users className="w-4 h-4" />, description: 'Multi-client management' },
      ],
    },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'docs', label: 'Documentation', href: '#docs' },
  ];

  // Command palette items
  const commandItems = [
    { id: 'new-post', label: 'New Post', shortcut: '⌘N', icon: <FileText className="w-4 h-4" />, group: 'Actions' },
    { id: 'new-page', label: 'New Page', icon: <FileText className="w-4 h-4" />, group: 'Actions' },
    { id: 'upload', label: 'Upload Media', shortcut: '⌘U', icon: <Image className="w-4 h-4" />, group: 'Actions' },
    { id: 'search', label: 'Search Content', shortcut: '/', icon: <Search className="w-4 h-4" />, group: 'Navigation' },
    { id: 'settings', label: 'Settings', shortcut: '⌘,', icon: <Settings className="w-4 h-4" />, group: 'Navigation' },
    { id: 'users', label: 'Manage Users', icon: <Users className="w-4 h-4" />, group: 'Navigation' },
    { id: 'analytics', label: 'View Analytics', icon: <BarChart3 className="w-4 h-4" />, group: 'Navigation' },
    { id: 'terminal', label: 'Open Terminal', shortcut: '⌘T', icon: <Terminal className="w-4 h-4" />, group: 'Tools' },
  ];

  // Tab navigation items
  const tabNavItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // Sidebar items
  const sidebarItems = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-5 h-5" />, badge: 24, isActive: true },
    { id: 'sent', label: 'Sent', icon: <Send className="w-5 h-5" /> },
    { id: 'drafts', label: 'Drafts', icon: <FileText className="w-5 h-5" />, badge: 3 },
    { id: 'starred', label: 'Starred', icon: <Star className="w-5 h-5" /> },
    { id: 'archive', label: 'Archive', icon: <Archive className="w-5 h-5" /> },
    { id: 'trash', label: 'Trash', icon: <Trash className="w-5 h-5" /> },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { id: 'home', label: 'Home', href: '#' },
    { id: 'components', label: 'Components', href: '#' },
    { id: 'navigation', label: 'Navigation', href: '#' },
    { id: 'demo', label: 'Demo' },
  ];

  // App launcher items
  const appLauncherItems = [
    { id: 'posts', icon: <FileText className="w-6 h-6" />, label: 'Posts', color: '#6366f1' },
    { id: 'media', icon: <Image className="w-6 h-6" />, label: 'Media', color: '#ec4899' },
    { id: 'users', icon: <Users className="w-6 h-6" />, label: 'Users', color: '#10b981' },
    { id: 'analytics', icon: <BarChart3 className="w-6 h-6" />, label: 'Analytics', color: '#f59e0b' },
    { id: 'mail', icon: <Mail className="w-6 h-6" />, label: 'Mail', color: '#3b82f6' },
    { id: 'calendar', icon: <Calendar className="w-6 h-6" />, label: 'Calendar', color: '#8b5cf6' },
    { id: 'settings', icon: <Settings className="w-6 h-6" />, label: 'Settings', color: '#64748b' },
    { id: 'security', icon: <Shield className="w-6 h-6" />, label: 'Security', color: '#ef4444' },
  ];

  const selectedEmailData = emailItems.find(e => e.id === selectedEmail);

  return (
    <PageContainer
      title="Advanced Navigation & Layout"
      description="Showcasing Navigation & Layout components (57-64)"
    >
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        items={commandItems}
        onItemSelect={(item) => {
          console.log('Selected:', item);
          setCommandPaletteOpen(false);
        }}
      />

      {/* Quick Access Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setCommandPaletteOpen(true)}
          className="shadow-lg"
        >
          <Search className="w-4 h-4 mr-2" />
          Command Palette (⌘K)
        </Button>
      </div>

      <div className="space-y-8">
        {/* Section 1: Command Palette & Navigation Menu */}
        <Section title="Command Palette & Navigation Menu" description="Quick command access and mega menus">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Command Palette Demo */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Command Palette (57)</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">⌘K</kbd> or click the button to open the command palette.
                </p>
                <Button onClick={() => setCommandPaletteOpen(true)}>
                  Open Command Palette
                </Button>
              </CardBody>
            </Card>

            {/* Navigation Menu Demo */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Navigation Menu (58)</h3>
                <NavigationMenu items={navMenuItems} className="mb-4" />
                <BreadcrumbNav items={breadcrumbItems} />
              </CardBody>
            </Card>
          </div>

          {/* Tab Navigation */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Tab Navigation</h3>
              <TabNav
                items={tabNavItems}
                activeId={activeTab}
                onTabChange={setActiveTab}
              />
              <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Content for: <strong>{activeTab}</strong>
                </p>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Section 2: Resizable Panels */}
        <Section title="Resizable Panels" description="Draggable resizable layouts">
          <Card>
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">Two Column Layout (59)</h3>
              <div className="h-[300px]">
                <TwoColumnLayout
                  left={
                    <div className="p-4 h-full bg-neutral-50 dark:bg-neutral-800">
                      <h4 className="font-medium mb-2">Left Panel</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Drag the divider to resize
                      </p>
                    </div>
                  }
                  right={
                    <div className="p-4 h-full">
                      <h4 className="font-medium mb-2">Right Panel</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Both panels resize dynamically
                      </p>
                    </div>
                  }
                />
              </div>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">Three Column Layout</h3>
              <div className="h-[300px]">
                <ThreeColumnLayout
                  left={
                    <div className="p-4 h-full bg-neutral-50 dark:bg-neutral-800">
                      <h4 className="font-medium text-sm">Sidebar</h4>
                    </div>
                  }
                  center={
                    <div className="p-4 h-full">
                      <h4 className="font-medium">Main Content</h4>
                      <p className="text-sm text-neutral-500 mt-2">Primary content area</p>
                    </div>
                  }
                  right={
                    <div className="p-4 h-full bg-neutral-50 dark:bg-neutral-800">
                      <h4 className="font-medium text-sm">Details</h4>
                    </div>
                  }
                />
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Section 3: Virtual List */}
        <Section title="Virtual List" description="Efficient rendering of large lists">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">
                  Virtual List (60) - 1000 items
                </h3>
                <div className="h-[400px]">
                  <VirtualList
                    items={listItems}
                    itemHeight={72}
                    renderItem={(item) => (
                      <div className="px-4 py-3 border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">{item.title}</h4>
                            <p className="text-sm text-neutral-500">{item.description}</p>
                          </div>
                          <Badge variant={item.status === 'Active' ? 'success' : item.status === 'Pending' ? 'warning' : 'default'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                    getItemKey={(item) => item.id}
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">
                  Virtual Grid - 1000 items
                </h3>
                <div className="h-[400px]">
                  <VirtualGrid
                    items={listItems}
                    columns={3}
                    itemHeight={100}
                    gap={8}
                    className="p-2"
                    renderItem={(item) => (
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg h-full">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-neutral-500 mt-1">{item.date}</p>
                      </div>
                    )}
                    getItemKey={(item) => item.id}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* Section 4: Dock */}
        <Section title="Dock" description="macOS-style application dock">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">App Dock (61)</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Hover over the dock items below to see the magnification effect.
              </p>

              <div className="relative h-[200px] bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 rounded-xl overflow-hidden">
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <MiniDock items={dockItems.filter(d => !d.separator).slice(0, 5)} />
                </div>
              </div>

              <h4 className="text-md font-semibold mt-8 mb-4">App Launcher Grid</h4>
              <AppLauncher items={appLauncherItems} columns={4} />
            </CardBody>
          </Card>
        </Section>

        {/* Section 5: Floating Toolbar */}
        <Section title="Floating Toolbar" description="Contextual floating actions">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Text Editor Toolbar (62)</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Select any text in the editor below to see the floating toolbar.
              </p>

              <div className="relative">
                <TextEditorToolbar
                  onBold={() => console.log('Bold')}
                  onItalic={() => console.log('Italic')}
                  onUnderline={() => console.log('Underline')}
                  onLink={() => console.log('Link')}
                  onCode={() => console.log('Code')}
                />

                <div
                  contentEditable
                  className="min-h-[200px] p-4 border dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  suppressContentEditableWarning
                >
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    This is an editable text area. Select some text to see the floating toolbar appear with formatting options.
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    The toolbar automatically positions itself above your selection and provides quick access to text formatting tools like bold, italic, underline, and more.
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Try selecting different parts of this text to see how the toolbar follows your selection!
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Section 6: Split View */}
        <Section title="Split View" description="Master-detail layouts">
          <Card>
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">Email Client Layout (63)</h3>
              <div className="h-[400px]">
                <SplitView defaultSplit={280}>
                  <MasterPanel
                    header={
                      <div className="p-3">
                        <h4 className="font-semibold">Inbox</h4>
                        <p className="text-sm text-neutral-500">5 messages</p>
                      </div>
                    }
                  >
                    {emailItems.map((email) => (
                      <ListItem
                        key={email.id}
                        id={email.id}
                        onClick={() => setSelectedEmail(email.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2',
                            email.unread ? 'bg-primary-500' : 'bg-transparent'
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h4 className={cn(
                                'truncate',
                                email.unread ? 'font-semibold' : 'font-medium'
                              )}>
                                {email.from}
                              </h4>
                              <span className="text-xs text-neutral-500 ml-2">{email.time}</span>
                            </div>
                            <p className="text-sm font-medium truncate">{email.subject}</p>
                            <p className="text-sm text-neutral-500 truncate">{email.preview}</p>
                          </div>
                        </div>
                      </ListItem>
                    ))}
                  </MasterPanel>

                  <DetailPanel
                    header={selectedEmailData && (
                      <div className="p-3 flex-1">
                        <h4 className="font-semibold">{selectedEmailData.subject}</h4>
                        <p className="text-sm text-neutral-500">From: {selectedEmailData.from}</p>
                      </div>
                    )}
                    emptyState={
                      <div className="flex items-center justify-center h-full text-neutral-500">
                        <div className="text-center">
                          <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Select an email to read</p>
                        </div>
                      </div>
                    }
                  >
                    {selectedEmailData && (
                      <div className="p-4">
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {selectedEmailData.preview}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-4">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                      </div>
                    )}
                  </DetailPanel>
                </SplitView>
              </div>
            </CardBody>
          </Card>

          {/* Collapsible Split View */}
          <Card className="mt-6">
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">Collapsible Split View</h3>
              <div className="h-[300px]">
                <CollapsibleSplitView
                  master={
                    <div className="p-4 h-full">
                      <h4 className="font-medium mb-2">Collapsible Panel</h4>
                      <p className="text-sm text-neutral-500">
                        Click the arrow button to collapse this panel
                      </p>
                    </div>
                  }
                  detail={
                    <div className="p-4 h-full">
                      <h4 className="font-medium mb-2">Main Content</h4>
                      <p className="text-sm text-neutral-500">
                        This area expands when the side panel is collapsed
                      </p>
                    </div>
                  }
                />
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Section 7: Pinnable Sidebar */}
        <Section title="Pinnable Sidebar" description="Collapsible pinnable sidebars">
          <Card>
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">Pinnable Sidebar (64)</h3>
              <div className="flex h-[400px]">
                <PinnableSidebar
                  items={sidebarItems}
                  header={
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary-500" />
                      <span className="font-semibold">Mail</span>
                    </div>
                  }
                  footer={
                    <div className="text-sm text-neutral-500">
                      Storage: 2.4 GB / 15 GB
                    </div>
                  }
                  position="left"
                  defaultPinned={false}
                  persistKey="demo-sidebar"
                />

                <div className="flex-1 p-6">
                  <h4 className="font-medium mb-2">Main Content Area</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Hover over the sidebar to expand it. Click the pin icon to keep it expanded.
                    The sidebar state persists to localStorage.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Icon Sidebar */}
          <Card className="mt-6">
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold p-4 border-b dark:border-neutral-700">Icon Sidebar</h3>
              <div className="flex h-[300px]">
                <IconSidebar
                  items={[
                    { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Home', isActive: true },
                    { id: 'files', icon: <FileText className="w-5 h-5" />, label: 'Files', badge: 5 },
                    { id: 'users', icon: <Users className="w-5 h-5" />, label: 'Users' },
                    { id: 'analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
                    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
                  ]}
                  position="left"
                />

                <div className="flex-1 p-6">
                  <h4 className="font-medium mb-2">Minimal Icon Sidebar</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    A compact sidebar that shows only icons with tooltips on hover.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Summary */}
        <Section title="Component Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: 57, name: 'CommandPalette', desc: 'Cmd+K spotlight search' },
              { num: 58, name: 'NavigationMenu', desc: 'Mega menus & tabs' },
              { num: 59, name: 'Resizable', desc: 'Draggable panels' },
              { num: 60, name: 'VirtualList', desc: 'Virtualized scrolling' },
              { num: 61, name: 'Dock', desc: 'macOS-style dock' },
              { num: 62, name: 'FloatingToolbar', desc: 'Contextual toolbars' },
              { num: 63, name: 'SplitView', desc: 'Master-detail layouts' },
              { num: 64, name: 'PinnableSidebar', desc: 'Pin/unpin sidebars' },
            ].map((component) => (
              <Card key={component.num} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <Badge className="mb-2">#{component.num}</Badge>
                  <h4 className="font-semibold">{component.name}</h4>
                  <p className="text-sm text-neutral-500 mt-1">{component.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* Fixed Dock at bottom */}
      <Dock
        items={dockItems}
        position="bottom"
        magnification={true}
        magnificationScale={1.4}
        showLabels={true}
        size="md"
      />
    </PageContainer>
  );
}
