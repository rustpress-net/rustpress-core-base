/**
 * RustPress Admin Application
 * Enterprise-grade admin interface with modern design system
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EnterpriseLayout } from './layouts/EnterpriseLayout';
import { Skeleton, SkeletonStats, SkeletonTable } from './design-system';

// Lazy load all pages for code splitting
// Enterprise Pages
const EnterpriseDashboard = lazy(() => import('./pages/enterprise/Dashboard'));

// Existing Pages
const Menus = lazy(() => import('./pages/Menus'));
const Appearance = lazy(() => import('./pages/Appearance'));
const Sidebars = lazy(() => import('./pages/Sidebars'));
const SEO = lazy(() => import('./pages/SEO'));
const Cache = lazy(() => import('./pages/Cache'));
const ThemePreview = lazy(() => import('./pages/ThemePreview'));
const Themes = lazy(() => import('./pages/Themes'));
const GoogleAnalyticsDashboard = lazy(() => import('./pages/analytics/GoogleAnalyticsDashboard'));
const GoogleAnalyticsSettings = lazy(() => import('./pages/analytics/GoogleAnalyticsSettings'));
const FunctionsManager = lazy(() => import('./pages/functions/FunctionsManager'));
const FunctionDashboard = lazy(() => import('./pages/functions/FunctionDashboard'));
const FunctionEditor = lazy(() => import('./pages/functions/FunctionEditor'));
const FunctionTemplates = lazy(() => import('./pages/functions/FunctionTemplates'));
const FunctionExecutions = lazy(() => import('./pages/functions/FunctionExecutions'));
const FunctionsPage = lazy(() => import('./pages/FunctionsPage'));
const DatabaseManager = lazy(() => import('./pages/development/DatabaseManager'));
const DatabaseTables = lazy(() => import('./pages/development/DatabaseTables'));
const TableBrowser = lazy(() => import('./pages/development/TableBrowser'));
const SqlEditor = lazy(() => import('./pages/development/SqlEditor'));
const DatabaseMonitoring = lazy(() => import('./pages/development/DatabaseMonitoring'));
const DatabaseExport = lazy(() => import('./pages/development/DatabaseExport'));
const DatabaseImport = lazy(() => import('./pages/development/DatabaseImport'));
const SchemaTools = lazy(() => import('./pages/development/SchemaTools'));
const TableAdvanced = lazy(() => import('./pages/development/TableAdvanced'));

// Component imports
const PostEditor = lazy(() => import('./components/posts/PostEditor'));
const ThemeLayoutManager = lazy(() => import('./components/themes/ThemeLayoutManager'));
const HeaderManager = lazy(() => import('./components/themes/HeaderManager'));
const FooterManager = lazy(() => import('./components/themes/FooterManager'));
const SidebarManagerComponent = lazy(() => import('./components/themes/SidebarManager'));
const MenuManager = lazy(() => import('./components/themes/MenuManager'));
const PageTemplateSelector = lazy(() => import('./components/themes/PageTemplateSelector'));
const ThemeEditorFull = lazy(() => import('./pages/ThemeEditor'));
const IDEOverview = lazy(() => import('./pages/IDEOverview'));
const Plugins = lazy(() => import('./pages/Plugins'));
const DetachedTabWindow = lazy(() => import('./components/ide/DetachedTabWindow'));

// Appearance Pages
const AppearanceHeaderManager = lazy(() => import('./pages/appearance/HeaderManager'));
const AppearanceFooterManager = lazy(() => import('./pages/appearance/FooterManager'));
const AppearanceSidebarManager = lazy(() => import('./pages/appearance/SidebarManager'));
const AppearanceDesign = lazy(() => import('./pages/appearance/Design'));

// Apps Pages
const AppsManagement = lazy(() => import('./pages/apps/AppsManagement'));
const AppStorePage = lazy(() => import('./pages/apps/AppStore'));
const AppSettings = lazy(() => import('./pages/apps/AppSettings'));
const UserAppAccess = lazy(() => import('./pages/apps/UserAppAccess'));
const AppSelectionPage = lazy(() => import('./pages/apps/AppSelectionPage'));

// Settings Pages
const SiteModeSettings = lazy(() => import('./pages/settings/SiteModeSettings'));
const StorageSettings = lazy(() => import('./pages/settings/StorageSettings'));
const MediaSettings = lazy(() => import('./pages/settings/MediaSettings'));
const PreloaderSettings = lazy(() => import('./pages/settings/PreloaderSettings'));
const WritingSettings = lazy(() => import('./pages/settings/WritingSettings'));
const ReadingSettings = lazy(() => import('./pages/settings/ReadingSettings'));
const DiscussionSettings = lazy(() => import('./pages/settings/DiscussionSettings'));
const PermalinksSettings = lazy(() => import('./pages/settings/PermalinksSettings'));
const PrivacySettings = lazy(() => import('./pages/settings/PrivacySettings'));
const SubscriptionSettings = lazy(() => import('./pages/settings/SubscriptionSettings'));

// App Components (for Site Mode)
const TaskManagerApp = lazy(() => import('./apps/TaskManagerApp'));
const NotesApp = lazy(() => import('./apps/NotesApp'));
const CalendarApp = lazy(() => import('./apps/CalendarApp'));

// API Management
const ApiManagement = lazy(() => import('./pages/api/ApiManagement'));

// Placeholder pages using new design system (these can be enhanced later)
import { PageHeader, Card, CardBody, Button, DataTable, Badge, EmptyState, Grid } from './design-system';
import { FileText, Folders, Image, MessageSquare, Palette, Package, Users, Settings, Plus, Upload, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from './design-system';
import { Link } from 'react-router-dom';
import { useAppStore } from './store/appStore';

// Loading component with skeleton
const PageLoader = () => (
  <div className="space-y-6">
    <SkeletonStats count={4} />
    <SkeletonTable rows={5} columns={5} />
  </div>
);

// Smart redirect based on site mode
const SiteModeRedirect = () => {
  const { siteModeSettings } = useAppStore();

  // In app mode, redirect to app selector (which handles single vs multiple apps)
  if (siteModeSettings.mode === 'app') {
    return <Navigate to="/app-selector" replace />;
  }

  // In website or hybrid mode, go to dashboard
  return <Navigate to="/dashboard" replace />;
};

// Posts List Page - Using new design system
const PostsList = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Posts"
      description="Manage your blog posts and articles"
      actions={
        <Link to="/posts/new">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Post
          </Button>
        </Link>
      }
    />
    <motion.div variants={fadeInUp}>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', sortable: true },
          { key: 'author', header: 'Author', sortable: true },
          {
            key: 'status',
            header: 'Status',
            render: (value) => (
              <Badge variant={value === 'published' ? 'success' : value === 'draft' ? 'warning' : 'info'} size="sm">
                {value}
              </Badge>
            )
          },
          { key: 'date', header: 'Date', sortable: true },
          {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
              <Link to={`/posts/${row.id}/edit`}>
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
            )
          }
        ]}
        data={[
          { id: 1, title: 'Getting Started with RustPress', author: 'Admin', status: 'published', date: '2024-12-20' },
          { id: 2, title: 'Building Your First Theme', author: 'Admin', status: 'draft', date: '2024-12-19' },
          { id: 3, title: 'Plugin Development Guide', author: 'Admin', status: 'published', date: '2024-12-18' },
          { id: 4, title: 'SEO Best Practices', author: 'Editor', status: 'scheduled', date: '2024-12-25' },
          { id: 5, title: 'Performance Optimization', author: 'Admin', status: 'published', date: '2024-12-15' },
        ]}
        selectable
        pagination
        pageSize={10}
      />
    </motion.div>
  </motion.div>
);

// Pages List
const PagesList = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Pages"
      description="Manage your static pages"
      actions={
        <Link to="/pages/new">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Page
          </Button>
        </Link>
      }
    />
    <motion.div variants={fadeInUp}>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', sortable: true },
          { key: 'template', header: 'Template' },
          {
            key: 'status',
            header: 'Status',
            render: (value) => (
              <Badge variant={value === 'published' ? 'success' : 'warning'} size="sm">
                {value}
              </Badge>
            )
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
              <Link to={`/pages/${row.id}/edit`}>
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
            )
          }
        ]}
        data={[
          { id: 1, title: 'Home', template: 'Homepage', status: 'published' },
          { id: 2, title: 'About Us', template: 'Default', status: 'published' },
          { id: 3, title: 'Contact', template: 'Contact', status: 'published' },
          { id: 4, title: 'Privacy Policy', template: 'Legal', status: 'draft' },
        ]}
        selectable
      />
    </motion.div>
  </motion.div>
);

// Media Library
const MediaLibrary = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Media Library"
      description="Manage your images, videos, and documents"
      actions={
        <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />}>
          Upload Files
        </Button>
      }
    />
    <motion.div variants={fadeInUp}>
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all group"
                whileHover={{ scale: 1.02 }}
              >
                <Image className="w-8 h-8 text-neutral-400 group-hover:text-primary-500 transition-colors" />
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  </motion.div>
);

// Comments Page
const CommentsPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Comments"
      description="Manage user comments and discussions"
    />
    <motion.div variants={fadeInUp}>
      <Card>
        <CardBody padding="none">
          <div className="flex gap-2 p-4 border-b border-neutral-200 dark:border-neutral-700">
            <Button variant="primary" size="sm">All (24)</Button>
            <Button variant="ghost" size="sm">Pending (5)</Button>
            <Button variant="ghost" size="sm">Approved (19)</Button>
            <Button variant="ghost" size="sm">Spam (0)</Button>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {[
              { author: 'John Doe', comment: 'Great article! Very helpful.', post: 'Getting Started', status: 'approved' },
              { author: 'Jane Smith', comment: 'Could you explain more about plugins?', post: 'Plugin Guide', status: 'pending' },
            ].map((comment, i) => (
              <div key={i} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                    {comment.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900 dark:text-white">{comment.author}</span>
                      <span className="text-sm text-neutral-500">on {comment.post}</span>
                      <Badge variant={comment.status === 'approved' ? 'success' : 'warning'} size="xs">
                        {comment.status}
                      </Badge>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300">{comment.comment}</p>
                    <div className="mt-2 flex gap-4">
                      <Button variant="ghost" size="xs">Approve</Button>
                      <Button variant="ghost" size="xs">Spam</Button>
                      <Button variant="ghost" size="xs">Reply</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  </motion.div>
);

// Themes Page
const ThemesPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Themes"
      description="Customize your site appearance"
    />
    <Grid columns={3} gap="md">
      {[
        { name: 'RustPress Enterprise', active: true, version: '2.0.0' },
        { name: 'Developer Developer', active: false, version: '1.5.0' },
        { name: 'Business Elite', active: false, version: '1.2.0' },
        { name: 'Portfolio Creative', active: false, version: '1.0.0' },
      ].map((theme, i) => (
        <motion.div key={i} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
          <Card className={theme.active ? 'ring-2 ring-primary-500' : ''}>
            <CardBody padding="none">
              <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Palette className="w-12 h-12 text-neutral-400" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{theme.name}</h3>
                  {theme.active && <Badge variant="primary" size="xs">Active</Badge>}
                </div>
                <p className="text-sm text-neutral-500 mb-4">Version {theme.version}</p>
                <div className="flex gap-2">
                  {theme.active ? (
                    <Link to="/appearance" className="flex-1">
                      <Button variant="secondary" className="w-full">Customize</Button>
                    </Link>
                  ) : (
                    <Button variant="primary" className="flex-1">Activate</Button>
                  )}
                  <Link to="/themes/preview">
                    <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />}>Preview</Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </Grid>
  </motion.div>
);

// Users Page
const UsersListPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Users"
      description="Manage user accounts and permissions"
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Add New User
        </Button>
      }
    />
    <motion.div variants={fadeInUp}>
      <DataTable
        columns={[
          {
            key: 'name',
            header: 'User',
            render: (value) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                  {value[0]}
                </div>
                <span className="font-medium">{value}</span>
              </div>
            )
          },
          { key: 'email', header: 'Email' },
          {
            key: 'role',
            header: 'Role',
            render: (value) => (
              <Badge variant="info" size="sm">{value}</Badge>
            )
          },
          { key: 'posts', header: 'Posts' },
          {
            key: 'actions',
            header: 'Actions',
            render: () => <Button variant="ghost" size="sm">Edit</Button>
          }
        ]}
        data={[
          { id: 1, name: 'Admin', email: 'admin@rustpress.com', role: 'Administrator', posts: 24 },
          { id: 2, name: 'Editor', email: 'editor@rustpress.com', role: 'Editor', posts: 12 },
          { id: 3, name: 'Author', email: 'author@rustpress.com', role: 'Author', posts: 5 },
        ]}
        selectable
      />
    </motion.div>
  </motion.div>
);

// Settings menu items with routes
const settingsMenuItems = [
  { name: 'General', path: '/settings', icon: '⚙️' },
  { name: 'Writing', path: '/settings/writing', icon: '✍️' },
  { name: 'Reading', path: '/settings/reading', icon: '📖' },
  { name: 'Discussion', path: '/settings/discussion', icon: '💬' },
  { name: 'Media', path: '/settings/media', icon: '🖼️' },
  { name: 'Permalinks', path: '/settings/permalinks', icon: '🔗' },
  { name: 'Privacy', path: '/settings/privacy', icon: '🔒' },
  { name: 'Storage', path: '/settings/storage', icon: '💾' },
  { name: 'Preloader', path: '/settings/preloader', icon: '⏳' },
  { name: 'Subscription', path: '/settings/subscription', icon: '💳' },
];

// Settings Page
const SettingsListPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Settings"
      description="Configure your site preferences"
    />
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <motion.div variants={fadeInUp}>
        <Card>
          <CardBody className="space-y-1">
            {settingsMenuItems.map((item, i) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg transition-all ${
                  i === 0
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </CardBody>
        </Card>
      </motion.div>
      <motion.div variants={fadeInUp} className="lg:col-span-3">
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">General Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Site Title</label>
                <input
                  type="text"
                  defaultValue="RustPress"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tagline</label>
                <input
                  type="text"
                  defaultValue="Just another RustPress site"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Site URL</label>
                <input
                  type="text"
                  defaultValue="https://example.com"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Admin Email</label>
                <input
                  type="email"
                  defaultValue="admin@rustpress.com"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <Button variant="primary">Save Changes</Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// Categories Page
const CategoriesPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Categories"
      description="Organize your content with categories"
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      }
    />
    <motion.div variants={fadeInUp}>
      <EmptyState
        icon={<Folders className="w-12 h-12" />}
        title="No categories yet"
        description="Create your first category to organize your posts."
        action={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add Category
          </Button>
        }
      />
    </motion.div>
  </motion.div>
);

// Tags Page
const TagsPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Tags"
      description="Add tags to your content"
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Add Tag
        </Button>
      }
    />
    <motion.div variants={fadeInUp}>
      <EmptyState
        icon={<Folders className="w-12 h-12" />}
        title="No tags yet"
        description="Create your first tag to label your posts."
        action={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add Tag
          </Button>
        }
      />
    </motion.div>
  </motion.div>
);

// Widgets Page
const WidgetsPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Widgets"
      description="Manage sidebar and footer widgets"
    />
    <motion.div variants={fadeInUp}>
      <EmptyState
        icon={<Package className="w-12 h-12" />}
        title="Widget management coming soon"
        description="This feature is under development."
      />
    </motion.div>
  </motion.div>
);

// Theme Editor Page
const ThemeEditorPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Theme Editor"
      description="Edit theme files directly"
    />
    <motion.div variants={fadeInUp}>
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="Theme editor coming soon"
        description="This feature is under development."
      />
    </motion.div>
  </motion.div>
);

// Roles Page
const RolesPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <PageHeader
      title="Roles & Permissions"
      description="Manage user roles and access levels"
      actions={
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Add Role
        </Button>
      }
    />
    <motion.div variants={fadeInUp}>
      <DataTable
        columns={[
          { key: 'name', header: 'Role', sortable: true },
          { key: 'users', header: 'Users' },
          { key: 'permissions', header: 'Permissions' },
          {
            key: 'actions',
            header: 'Actions',
            render: () => <Button variant="ghost" size="sm">Edit</Button>
          }
        ]}
        data={[
          { id: 1, name: 'Administrator', users: 2, permissions: 'Full Access' },
          { id: 2, name: 'Editor', users: 5, permissions: 'Edit Posts, Manage Comments' },
          { id: 3, name: 'Author', users: 10, permissions: 'Create Posts' },
          { id: 4, name: 'Contributor', users: 15, permissions: 'Submit Posts for Review' },
        ]}
      />
    </motion.div>
  </motion.div>
);


function App() {
  return (
    <Routes>
      {/* IDE - Full IDE directly */}
      <Route path="/ide" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading IDE...</div>
          </div>
        }>
          <ThemeEditorFull />
        </Suspense>
      } />

      {/* IDE Overview - Optional landing page */}
      <Route path="/ide/overview" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <IDEOverview />
        </Suspense>
      } />

      {/* Detached IDE Tab - Opens in separate window */}
      <Route path="/ide/detached" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <DetachedTabWindow />
        </Suspense>
      } />

      {/* App routes - Full page apps without layout */}
      <Route path="/app/task-manager" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading Task Manager...</div>
          </div>
        }>
          <TaskManagerApp />
        </Suspense>
      } />
      <Route path="/app/notes" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading Notes...</div>
          </div>
        }>
          <NotesApp />
        </Suspense>
      } />
      <Route path="/app/calendar" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading Calendar...</div>
          </div>
        }>
          <CalendarApp />
        </Suspense>
      } />

      {/* App Selector - Full page without layout */}
      <Route path="/app-selector" element={
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <AppSelectionPage />
        </Suspense>
      } />

      {/* Admin routes with EnterpriseLayout */}
      <Route path="/" element={<EnterpriseLayout />}>
        {/* Smart redirect based on site mode */}
        <Route index element={<SiteModeRedirect />} />
        <Route path="dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <EnterpriseDashboard />
          </Suspense>
        } />

        {/* Posts */}
        <Route path="posts" element={<PostsList />} />
        <Route path="posts/new" element={
          <Suspense fallback={<PageLoader />}>
            <PostEditor />
          </Suspense>
        } />
        <Route path="posts/:id/edit" element={
          <Suspense fallback={<PageLoader />}>
            <PostEditor />
          </Suspense>
        } />

        {/* Pages */}
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/new" element={
          <Suspense fallback={<PageLoader />}>
            <PostEditor />
          </Suspense>
        } />
        <Route path="pages/:id/edit" element={
          <Suspense fallback={<PageLoader />}>
            <PostEditor />
          </Suspense>
        } />

        {/* Media */}
        <Route path="media" element={<MediaLibrary />} />

        {/* Content */}
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="comments" element={<CommentsPage />} />
        <Route path="menus" element={
          <Suspense fallback={<PageLoader />}>
            <Menus />
          </Suspense>
        } />

        {/* Appearance */}
        <Route path="themes" element={
          <Suspense fallback={<PageLoader />}>
            <Themes />
          </Suspense>
        } />
        <Route path="themes/preview" element={
          <Suspense fallback={<PageLoader />}>
            <ThemePreview />
          </Suspense>
        } />
        <Route path="widgets" element={<WidgetsPage />} />
        <Route path="appearance" element={<Navigate to="/appearance/header" replace />} />
        <Route path="appearance/header" element={
          <Suspense fallback={<PageLoader />}>
            <AppearanceHeaderManager />
          </Suspense>
        } />
        <Route path="appearance/footer" element={
          <Suspense fallback={<PageLoader />}>
            <AppearanceFooterManager />
          </Suspense>
        } />
        <Route path="appearance/sidebar" element={
          <Suspense fallback={<PageLoader />}>
            <AppearanceSidebarManager />
          </Suspense>
        } />
        <Route path="appearance/design" element={
          <Suspense fallback={<PageLoader />}>
            <AppearanceDesign />
          </Suspense>
        } />
        <Route path="sidebars" element={
          <Suspense fallback={<PageLoader />}>
            <Sidebars />
          </Suspense>
        } />
        <Route path="theme-layout" element={
          <Suspense fallback={<PageLoader />}>
            <ThemeLayoutManager />
          </Suspense>
        } />
        <Route path="header-manager" element={
          <Suspense fallback={<PageLoader />}>
            <HeaderManager />
          </Suspense>
        } />
        <Route path="footer-manager" element={
          <Suspense fallback={<PageLoader />}>
            <FooterManager />
          </Suspense>
        } />
        <Route path="sidebar-manager" element={
          <Suspense fallback={<PageLoader />}>
            <SidebarManagerComponent />
          </Suspense>
        } />
        <Route path="menu-manager" element={
          <Suspense fallback={<PageLoader />}>
            <MenuManager />
          </Suspense>
        } />
        <Route path="templates" element={
          <Suspense fallback={<PageLoader />}>
            <PageTemplateSelector />
          </Suspense>
        } />

        {/* Plugins */}
        <Route path="plugins" element={<Plugins />} />

        {/* Apps */}
        <Route path="apps" element={
          <Suspense fallback={<PageLoader />}>
            <AppsManagement />
          </Suspense>
        } />
        <Route path="apps/store" element={
          <Suspense fallback={<PageLoader />}>
            <AppStorePage />
          </Suspense>
        } />
        <Route path="apps/settings" element={
          <Suspense fallback={<PageLoader />}>
            <AppSettings />
          </Suspense>
        } />
        <Route path="apps/access" element={
          <Suspense fallback={<PageLoader />}>
            <UserAppAccess />
          </Suspense>
        } />

        {/* Users */}
        <Route path="users" element={<UsersListPage />} />
        <Route path="roles" element={<RolesPage />} />

        {/* Analytics */}
        <Route path="analytics" element={
          <Suspense fallback={<PageLoader />}>
            <GoogleAnalyticsDashboard />
          </Suspense>
        } />
        <Route path="analytics/settings" element={
          <Suspense fallback={<PageLoader />}>
            <GoogleAnalyticsSettings />
          </Suspense>
        } />
        <Route path="seo" element={
          <Suspense fallback={<PageLoader />}>
            <SEO />
          </Suspense>
        } />

        {/* System */}
        <Route path="settings" element={<SettingsListPage />} />
        <Route path="settings/site-mode" element={
          <Suspense fallback={<PageLoader />}>
            <SiteModeSettings />
          </Suspense>
        } />
        <Route path="settings/storage" element={
          <Suspense fallback={<PageLoader />}>
            <StorageSettings />
          </Suspense>
        } />
        <Route path="settings/media" element={
          <Suspense fallback={<PageLoader />}>
            <MediaSettings />
          </Suspense>
        } />
        <Route path="settings/preloader" element={
          <Suspense fallback={<PageLoader />}>
            <PreloaderSettings />
          </Suspense>
        } />
        <Route path="settings/writing" element={
          <Suspense fallback={<PageLoader />}>
            <WritingSettings />
          </Suspense>
        } />
        <Route path="settings/reading" element={
          <Suspense fallback={<PageLoader />}>
            <ReadingSettings />
          </Suspense>
        } />
        <Route path="settings/discussion" element={
          <Suspense fallback={<PageLoader />}>
            <DiscussionSettings />
          </Suspense>
        } />
        <Route path="settings/permalinks" element={
          <Suspense fallback={<PageLoader />}>
            <PermalinksSettings />
          </Suspense>
        } />
        <Route path="settings/privacy" element={
          <Suspense fallback={<PageLoader />}>
            <PrivacySettings />
          </Suspense>
        } />
        <Route path="settings/subscription" element={
          <Suspense fallback={<PageLoader />}>
            <SubscriptionSettings />
          </Suspense>
        } />
        <Route path="cache" element={
          <Suspense fallback={<PageLoader />}>
            <Cache />
          </Suspense>
        } />
        <Route path="api" element={
          <Suspense fallback={<PageLoader />}>
            <ApiManagement />
          </Suspense>
        } />

        {/* Database */}
        <Route path="database" element={
          <Suspense fallback={<PageLoader />}>
            <DatabaseManager />
          </Suspense>
        } />
        <Route path="database/tables" element={
          <Suspense fallback={<PageLoader />}>
            <DatabaseTables />
          </Suspense>
        } />
        <Route path="database/tables/:tableName" element={
          <Suspense fallback={<PageLoader />}>
            <TableBrowser />
          </Suspense>
        } />
        <Route path="database/sql" element={
          <Suspense fallback={<PageLoader />}>
            <SqlEditor />
          </Suspense>
        } />
        <Route path="database/monitoring" element={
          <Suspense fallback={<PageLoader />}>
            <DatabaseMonitoring />
          </Suspense>
        } />
        <Route path="database/export" element={
          <Suspense fallback={<PageLoader />}>
            <DatabaseExport />
          </Suspense>
        } />
        <Route path="database/import" element={
          <Suspense fallback={<PageLoader />}>
            <DatabaseImport />
          </Suspense>
        } />
        <Route path="database/schema" element={
          <Suspense fallback={<PageLoader />}>
            <SchemaTools />
          </Suspense>
        } />
        <Route path="database/advanced" element={
          <Suspense fallback={<PageLoader />}>
            <TableAdvanced />
          </Suspense>
        } />

        {/* Functions */}
        <Route path="functions" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionDashboard />
          </Suspense>
        } />
        <Route path="functions/manage" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionsManager />
          </Suspense>
        } />
        <Route path="functions/new" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionEditor />
          </Suspense>
        } />
        <Route path="functions/templates" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionTemplates />
          </Suspense>
        } />
        <Route path="functions/ide" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionsPage />
          </Suspense>
        } />
        <Route path="functions/executions" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionExecutions />
          </Suspense>
        } />
        <Route path="functions/:id/edit" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionEditor />
          </Suspense>
        } />

        {/* Profile */}
        <Route path="profile" element={<SettingsListPage />} />
      </Route>

      {/* Login route */}
      <Route path="login" element={<div>Login Page</div>} />
    </Routes>
  );
}

export default App;
