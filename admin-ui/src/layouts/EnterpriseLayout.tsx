/**
 * RustPress Enterprise Admin Layout
 * Main application layout with sidebar, header, and content area
 * Enhanced with Command Palette, Breadcrumbs, Quick Actions, and more
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Palette,
  Settings,
  Database,
  BarChart3,
  Menu as MenuIcon,
  MessageSquare,
  Tag,
  Globe,
  Shield,
  Zap,
  Package,
  Code,
  Megaphone,
  TrendingUp,
  BookOpen,
  Layout,
  Folders,
  Clock,
  PanelLeft,
  LayoutTemplate,
  PaintBucket,
  Code2,
  AppWindow,
  Store,
  UserCog,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  ThemeProvider,
  ToastProvider,
  AdminLayout,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarDivider,
  SidebarSearch,
  TopNav,
  PageContainer,
  PageTransition,
  Avatar,
  Badge,
  CommandPalette,
  Breadcrumbs,
  QuickActionsBar,
  RecentlyVisited,
  Favorites,
  KeyboardShortcutsPanel,
} from '../design-system';
import { useNavigationStore } from '../store/navigationStore';
import { useAppStore } from '../store/appStore';
import { useChatStore } from '../store/chatStore';
import { ChatSidebar } from '../components/ide/chat';

// Logo component
function RustPressLogo() {
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">R</span>
    </div>
  );
}

// Navigation structure with icon names for tracking
const navigation = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { icon: LayoutDashboard, iconName: 'LayoutDashboard', label: 'Dashboard', href: '/dashboard' },
      { icon: FileText, iconName: 'FileText', label: 'Posts', href: '/posts', badge: '12' },
      { icon: Folders, iconName: 'Folder', label: 'Pages', href: '/pages' },
      { icon: Image, iconName: 'Image', label: 'Media', href: '/media' },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    items: [
      { icon: Tag, iconName: 'Tag', label: 'Categories', href: '/categories' },
      { icon: Tag, iconName: 'Tag', label: 'Tags', href: '/tags' },
      { icon: MessageSquare, iconName: 'MessageSquare', label: 'Comments', href: '/comments', badge: '5' },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    items: [
      { icon: Palette, iconName: 'Palette', label: 'Themes', href: '/themes' },
      { icon: LayoutTemplate, iconName: 'LayoutTemplate', label: 'Header', href: '/appearance/header' },
      { icon: Layout, iconName: 'Layout', label: 'Footer', href: '/appearance/footer' },
      { icon: PanelLeft, iconName: 'PanelLeft', label: 'Sidebar', href: '/appearance/sidebar' },
      { icon: PaintBucket, iconName: 'PaintBucket', label: 'Design', href: '/appearance/design' },
    ],
  },
  {
    id: 'development',
    title: 'Development',
    items: [
      { icon: Code2, iconName: 'Code2', label: 'IDE', href: '/ide' },
      { icon: Code, iconName: 'Code', label: 'Functions', href: '/functions' },
      { icon: Database, iconName: 'Database', label: 'Database', href: '/database' },
      { icon: AppWindow, iconName: 'AppWindow', label: 'Apps', href: '/apps' },
    ],
  },
  {
    id: 'plugins',
    title: 'Plugins',
    items: [
      { icon: Store, iconName: 'Store', label: 'Marketplace', href: '/plugins' },
      { icon: Package, iconName: 'Package', label: 'Installed', href: '/plugins?tab=installed' },
    ],
  },
  {
    id: 'users',
    title: 'Users',
    items: [
      { icon: Users, iconName: 'Users', label: 'All Users', href: '/users' },
      { icon: Shield, iconName: 'Shield', label: 'Roles', href: '/roles' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    items: [
      { icon: BarChart3, iconName: 'BarChart3', label: 'Overview', href: '/analytics' },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { icon: Settings, iconName: 'Settings', label: 'Settings', href: '/settings' },
      { icon: Layers, iconName: 'Layers', label: 'Site Mode', href: '/settings/site-mode' },
      { icon: Zap, iconName: 'Zap', label: 'Cache', href: '/cache' },
    ],
  },
];

// Sample user data
const currentUser = {
  name: 'John Developer',
  email: 'john@rustpress.dev',
  role: 'Administrator',
  avatar: undefined, // Will use initials
};

// Sample notifications
const notifications = [
  {
    id: '1',
    title: 'New comment on "Getting Started"',
    description: 'A user left a comment on your post',
    time: '5 minutes ago',
    read: false,
    type: 'info' as const,
  },
  {
    id: '2',
    title: 'Post published successfully',
    description: 'Your article is now live',
    time: '1 hour ago',
    read: false,
    type: 'success' as const,
  },
  {
    id: '3',
    title: 'Security update available',
    description: 'Update to the latest version',
    time: '2 hours ago',
    read: true,
    type: 'warning' as const,
  },
];

export function EnterpriseLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    addRecentPage,
    openCommandPalette,
    openShortcutsPanel,
    sidebarSearchQuery,
  } = useNavigationStore();
  const { siteModeSettings } = useAppStore();
  const { unreadCounts } = useChatStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Calculate total unread count
  const totalUnreadCount = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);

  // Track recently visited pages
  useEffect(() => {
    // Find the current page label from navigation
    let pageLabel = 'Page';
    let pageIcon = '';
    for (const group of navigation) {
      const item = group.items.find((i) => location.pathname.startsWith(i.href));
      if (item) {
        pageLabel = item.label;
        pageIcon = item.iconName;
        break;
      }
    }

    addRecentPage({
      path: location.pathname,
      label: pageLabel,
      icon: pageIcon,
    });
  }, [location.pathname, addRecentPage]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }

      // ? for Keyboard Shortcuts Panel (when not in input)
      if (
        e.key === '?' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        openShortcutsPanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette, openShortcutsPanel]);

  const handleLogout = () => {
    // Handle logout logic
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const handleSearch = (query: string) => {
    // Open command palette for search
    openCommandPalette();
  };

  // Filter navigation items based on sidebar search
  const filteredNavigation = navigation.map((group) => ({
    ...group,
    items: sidebarSearchQuery
      ? group.items.filter((item) =>
          item.label.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
        )
      : group.items,
  })).filter((group) => group.items.length > 0);

  return (
    <ThemeProvider defaultMode="system">
      <ToastProvider position="bottom-right">
        <SidebarProvider>
          <AdminLayout
            sidebar={
              <Sidebar>
                {/* Header with logo */}
                <SidebarHeader
                  logo={<RustPressLogo />}
                  title="RustPress"
                />

                {/* Search filter */}
                <SidebarSearch placeholder="Filter menu..." />

                {/* Navigation */}
                <SidebarContent>
                  {filteredNavigation.map((group) => (
                    <SidebarGroup
                      key={group.id}
                      id={group.id}
                      title={group.title}
                      collapsible
                      defaultOpen
                    >
                      {group.items.map((item) => (
                        <SidebarItem
                          key={item.href}
                          icon={<item.icon className="w-5 h-5" />}
                          label={item.label}
                          href={item.href}
                          isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
                          badge={
                            item.badge ? (
                              <Badge variant="primary" size="xs">
                                {item.badge}
                              </Badge>
                            ) : undefined
                          }
                          onClick={() => navigate(item.href)}
                        />
                      ))}
                    </SidebarGroup>
                  ))}
                </SidebarContent>

                {/* Footer with user info */}
                <SidebarFooter>
                  <SidebarDivider />
                  <div className="flex items-center gap-3 px-2">
                    <Avatar
                      name={currentUser.name}
                      size="sm"
                      status="online"
                    />
                    <div className="flex-1 min-w-0 hidden lg:block">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                </SidebarFooter>
              </Sidebar>
            }
            header={
              <TopNav
                user={currentUser}
                notifications={notifications}
                onSearch={handleSearch}
                onLogout={handleLogout}
                onProfileClick={() => navigate('/profile')}
                onSettingsClick={() => navigate('/settings')}
                customContent={
                  <div className="flex items-center gap-2">
                    {/* View Website/App Button */}
                    <button
                      onClick={() => {
                        if (siteModeSettings.mode === 'app') {
                          navigate('/app-selector');
                        } else {
                          // Open frontend in new tab (website/hybrid mode)
                          window.open('/', '_blank');
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {siteModeSettings.mode === 'app' ? 'View App' : 'View Website'}
                    </button>
                    {/* Chat Button */}
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                      {totalUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </button>
                    <RecentlyVisited />
                    <Favorites />
                  </div>
                }
              />
            }
          >
            <PageContainer>
              {/* Breadcrumb Navigation */}
              <div className="mb-4">
                <Breadcrumbs showHome showFavoriteToggle />
              </div>

              <PageTransition>
                <Outlet />
              </PageTransition>
            </PageContainer>

            {/* Quick Actions FAB */}
            <QuickActionsBar />

            {/* Command Palette (triggered by Cmd+K) */}
            <CommandPalette />

            {/* Keyboard Shortcuts Panel (triggered by ?) */}
            <KeyboardShortcutsPanel />

            {/* Chat Sidebar */}
            <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </AdminLayout>
        </SidebarProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default EnterpriseLayout;
