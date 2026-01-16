/**
 * Specialized UI Components Demo Page
 * Showcasing components 97-106
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  // VisuallyHidden
  VisuallyHidden,
  SkipLink,
  LiveRegion,
  AccessibleIcon,
  AccessibleHeading,
  // ErrorBoundary
  ErrorBoundary,
  ErrorFallback,
  // LoadingSpinner
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  SkeletonLoader,
  ProgressLoader,
  InlineLoader,
  // EmptyState
  EmptyStateComponent,
  NoResults,
  NoData,
  ErrorState,
  ComingSoon,
  FilteredEmpty,
  OfflineState,
  // ConfirmDialog
  ConfirmDialogComponent,
  DeleteConfirm,
  PromptDialog,
  ChoiceDialog,
  // FormField
  FormField,
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioGroup,
  PasswordField,
  SearchField,
  NumberField,
  // ResponsiveContainer
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ShowAt,
  HideAt,
  Spacer,
  Center,
  MobileOnly,
  DesktopOnly,
  // ThemeToggle
  ThemeToggle,
  ThemeSwitcher,
  ThemeDropdown,
  ThemeSelector,
  AnimatedThemeIcon,
  // CountdownTimer
  CountdownTimer,
  TimeDisplay,
  Stopwatch,
  Timer,
  Clock,
  RelativeTime,
  // StatusIndicator
  StatusIndicator,
  ConnectionIndicator,
  OnlineStatus,
  PresenceIndicator,
  HealthIndicator,
  ServerStatus,
  SignalStrength,
  LiveIndicator,
  PowerStatus,
  ActivityStatus,
} from '../../design-system/components';
import {
  Search,
  User,
  FileText,
  Settings,
  Bell,
  Mail,
} from 'lucide-react';

export default function SpecializedComponentsDemo() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    role: '',
    newsletter: false,
    notifications: 'email',
  });
  const [powerOn, setPowerOn] = useState(true);

  // Future date for countdown
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  futureDate.setHours(futureDate.getHours() + 5);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <ResponsiveContainer maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Specialized UI Components (97-106)
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Accessibility utilities, error handling, loading states, forms, theming, and status indicators
          </p>

          {/* VisuallyHidden (97) */}
          <Section title="VisuallyHidden (97)" description="Accessibility utilities for screen readers">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <SkipLink href="#main-content">Skip to main content</SkipLink>
                <p className="text-sm text-neutral-500">(Focus to see skip link)</p>
              </div>

              <div className="flex items-center gap-4">
                <AccessibleIcon icon={<Search className="w-5 h-5" />} label="Search" />
                <AccessibleIcon icon={<User className="w-5 h-5" />} label="User profile" />
                <AccessibleIcon icon={<Settings className="w-5 h-5" />} label="Settings" />
                <span className="text-sm text-neutral-500">Accessible icons with labels</span>
              </div>

              <AccessibleHeading level={3} visualLevel={5}>
                This is an h3 styled as h5
              </AccessibleHeading>

              <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg">
                <p className="text-sm">
                  <VisuallyHidden>This text is only for screen readers</VisuallyHidden>
                  Visible content with hidden accessibility text
                </p>
              </div>

              <LiveRegion aria-live="polite" role="status">
                Status updates will be announced here
              </LiveRegion>
            </div>
          </Section>

          {/* ErrorBoundary (98) */}
          <Section title="ErrorBoundary (98)" description="Error handling with fallback UI">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ErrorFallback
                error={new Error('Something went wrong!')}
                resetErrorBoundary={() => console.log('Reset')}
                variant="default"
              />
              <ErrorFallback
                error={new Error('Network error')}
                resetErrorBoundary={() => console.log('Reset')}
                variant="minimal"
              />
              <div className="md:col-span-2">
                <ErrorFallback
                  error={new Error('Page not found')}
                  resetErrorBoundary={() => console.log('Reset')}
                  variant="card"
                  title="Custom Error Title"
                  description="This is a custom error description"
                />
              </div>
            </div>
          </Section>

          {/* LoadingSpinner (99) */}
          <Section title="LoadingSpinner (99)" description="Various loading indicators">
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <LoadingSpinner variant="spinner" size="sm" />
                <LoadingSpinner variant="spinner" size="md" />
                <LoadingSpinner variant="spinner" size="lg" />
                <LoadingSpinner variant="dots" size="md" />
                <LoadingSpinner variant="pulse" size="md" />
                <LoadingSpinner variant="bars" size="md" />
                <LoadingSpinner variant="ring" size="md" />
              </div>

              <div className="flex items-center gap-4">
                <LoadingButton
                  loading={loadingBtn}
                  onClick={() => {
                    setLoadingBtn(true);
                    setTimeout(() => setLoadingBtn(false), 2000);
                  }}
                >
                  {loadingBtn ? 'Saving...' : 'Save Changes'}
                </LoadingButton>

                <InlineLoader text="Processing" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkeletonLoader variant="text" lines={3} />
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="avatar" />
              </div>

              <ProgressLoader progress={65} label="Uploading files..." />
            </div>
          </Section>

          {/* EmptyState (100) */}
          <Section title="EmptyState (100)" description="Zero state displays for empty data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NoResults
                query="search term"
                onClear={() => console.log('Clear')}
              />
              <NoData
                type="posts"
                onAdd={() => console.log('Add')}
              />
              <ErrorState
                variant="network"
                onRetry={() => console.log('Retry')}
              />
              <ComingSoon
                title="Analytics Dashboard"
                description="Advanced analytics coming in v2.0"
                onNotify={() => console.log('Notify')}
              />
              <FilteredEmpty
                activeFilters={3}
                onClearFilters={() => console.log('Clear filters')}
              />
              <OfflineState onRetry={() => console.log('Retry')} />
            </div>
          </Section>

          {/* ConfirmDialog (101) */}
          <Section title="ConfirmDialog (101)" description="Confirmation dialogs and action modals">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setConfirmOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
              >
                Confirm Dialog
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete Confirm
              </button>
              <button
                onClick={() => setPromptOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Prompt Dialog
              </button>
              <button
                onClick={() => setChoiceOpen(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Choice Dialog
              </button>

              <ConfirmDialogComponent
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                  console.log('Confirmed');
                  setConfirmOpen(false);
                }}
                title="Confirm Action"
                description="Are you sure you want to proceed with this action?"
              />

              <DeleteConfirm
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={() => {
                  console.log('Deleted');
                  setDeleteOpen(false);
                }}
                itemName="this post"
              />

              <PromptDialog
                isOpen={promptOpen}
                onClose={() => setPromptOpen(false)}
                onConfirm={(value) => {
                  console.log('Input:', value);
                  setPromptOpen(false);
                }}
                title="Enter Project Name"
                description="Please enter a name for your new project"
                placeholder="My Project"
              />

              <ChoiceDialog
                isOpen={choiceOpen}
                onClose={() => setChoiceOpen(false)}
                onSelect={(choice) => {
                  console.log('Selected:', choice);
                  setChoiceOpen(false);
                }}
                title="Choose Export Format"
                description="Select the format for your export"
                options={[
                  { value: 'pdf', label: 'PDF Document', description: 'Best for printing' },
                  { value: 'csv', label: 'CSV File', description: 'Best for spreadsheets' },
                  { value: 'json', label: 'JSON Data', description: 'Best for developers' },
                ]}
              />
            </div>
          </Section>

          {/* FormField (102) */}
          <Section title="FormField (102)" description="Form field wrappers with validation">
            <div className="max-w-xl space-y-4">
              <InputField
                label="Full Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                hint="Your display name"
              />

              <InputField
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                error={formData.email && !formData.email.includes('@') ? 'Invalid email' : undefined}
                success={formData.email && formData.email.includes('@') ? 'Valid email' : undefined}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <PasswordField
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                showStrength
                strengthValue={formData.password.length * 10}
              />

              <TextareaField
                label="Bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={200}
                showCount
                autoResize
              />

              <SelectField
                label="Role"
                placeholder="Select a role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'admin', label: 'Administrator' },
                  { value: 'editor', label: 'Editor' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
              />

              <CheckboxField
                label="Subscribe to newsletter"
                description="Get updates about new features"
                checked={formData.newsletter}
                onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
              />

              <RadioGroup
                label="Notification Preference"
                name="notifications"
                value={formData.notifications}
                onChange={(value) => setFormData({ ...formData, notifications: value })}
                options={[
                  { value: 'email', label: 'Email', description: 'Get notified via email' },
                  { value: 'push', label: 'Push', description: 'Browser notifications' },
                  { value: 'none', label: 'None', description: 'No notifications' },
                ]}
              />

              <div className="flex gap-4">
                <SearchField
                  placeholder="Search..."
                  onSearch={(value) => console.log('Search:', value)}
                />
                <NumberField
                  label="Quantity"
                  value={1}
                  min={0}
                  max={10}
                  showControls
                />
              </div>
            </div>
          </Section>

          {/* ResponsiveContainer (103) */}
          <Section title="ResponsiveContainer (103)" description="Responsive layout helpers">
            <div className="space-y-6">
              <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-white dark:bg-neutral-800 rounded-lg text-center">
                    Item {i}
                  </div>
                ))}
              </ResponsiveGrid>

              <ResponsiveFlex
                direction={{ xs: 'col', md: 'row' }}
                gap="md"
                align="center"
                justify="between"
              >
                <div className="p-4 bg-primary-100 dark:bg-primary-900/20 rounded-lg">Flex Item 1</div>
                <div className="p-4 bg-primary-100 dark:bg-primary-900/20 rounded-lg">Flex Item 2</div>
                <div className="p-4 bg-primary-100 dark:bg-primary-900/20 rounded-lg">Flex Item 3</div>
              </ResponsiveFlex>

              <div className="flex gap-4 items-center">
                <MobileOnly>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Mobile Only</span>
                </MobileOnly>
                <DesktopOnly>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Desktop Only</span>
                </DesktopOnly>
                <ShowAt breakpoint="lg" above>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Large+ Only</span>
                </ShowAt>
              </div>

              <Center className="p-8 bg-white dark:bg-neutral-800 rounded-lg">
                <p className="text-neutral-600 dark:text-neutral-400">Centered Content</p>
              </Center>
            </div>
          </Section>

          {/* ThemeToggle (104) */}
          <Section title="ThemeToggle (104)" description="Dark/light mode toggle">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <ThemeToggle variant="icon" />
                <ThemeToggle variant="switch" showLabel />
                <ThemeToggle variant="button" showLabel />
                <ThemeDropdown />
              </div>

              <ThemeToggle variant="pill" showLabel showSystemOption />

              <ThemeSwitcher />

              <ThemeSelector />

              <div className="flex items-center gap-4">
                <AnimatedThemeIcon size="sm" />
                <AnimatedThemeIcon size="md" />
                <AnimatedThemeIcon size="lg" />
              </div>
            </div>
          </Section>

          {/* CountdownTimer (105) */}
          <Section title="CountdownTimer (105)" description="Timer displays and countdowns">
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Countdown Timer</h4>
                <CountdownTimer
                  targetDate={futureDate}
                  format="full"
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Compact Format</h4>
                  <CountdownTimer
                    targetDate={futureDate}
                    format="compact"
                    size="md"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Digital Format</h4>
                  <CountdownTimer
                    targetDate={futureDate}
                    format="digital"
                    size="sm"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Minimal Format</h4>
                  <CountdownTimer
                    targetDate={futureDate}
                    format="minimal"
                    size="md"
                    showLabels={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">Stopwatch</h4>
                  <Stopwatch showControls showLaps />
                </div>
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">Timer (5 min)</h4>
                  <Timer
                    duration={300000}
                    format="circular"
                    size="lg"
                    showControls
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">Digital Clock (12h)</h4>
                  <Clock format="12h" showSeconds showDate size="md" />
                </div>
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">Analog Clock</h4>
                  <Clock variant="analog" showSeconds size="lg" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-neutral-600 dark:text-neutral-400">Posted:</span>
                <RelativeTime date={new Date(Date.now() - 1000 * 60 * 5)} />
                <RelativeTime date={new Date(Date.now() - 1000 * 60 * 60 * 3)} />
                <RelativeTime date={new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)} />
              </div>
            </div>
          </Section>

          {/* StatusIndicator (106) */}
          <Section title="StatusIndicator (106)" description="Online/offline status displays">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">User Status</h4>
                <div className="flex items-center gap-6">
                  <StatusIndicator status="online" showLabel />
                  <StatusIndicator status="away" showLabel />
                  <StatusIndicator status="busy" showLabel />
                  <StatusIndicator status="dnd" showLabel />
                  <StatusIndicator status="offline" showLabel />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Connection Status</h4>
                <div className="flex flex-wrap gap-4">
                  <ConnectionIndicator status="connected" />
                  <ConnectionIndicator status="connecting" />
                  <ConnectionIndicator status="reconnecting" />
                  <ConnectionIndicator status="disconnected" onReconnect={() => {}} />
                  <ConnectionIndicator status="error" onReconnect={() => {}} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Presence Indicators</h4>
                <div className="flex gap-6">
                  <PresenceIndicator status="online" name="John Doe" />
                  <PresenceIndicator
                    status="offline"
                    name="Jane Smith"
                    lastSeen={new Date(Date.now() - 1000 * 60 * 30)}
                    showLastSeen
                  />
                  <PresenceIndicator status="busy" name="Bob Wilson" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Health Indicators</h4>
                <div className="flex flex-wrap gap-4">
                  <HealthIndicator status="healthy" variant="badge" />
                  <HealthIndicator status="degraded" variant="badge" />
                  <HealthIndicator status="unhealthy" variant="badge" />
                  <HealthIndicator status="unknown" variant="badge" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Server Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ServerStatus name="API Server" status="operational" variant="detailed" uptime={99.98} />
                  <ServerStatus name="Database" status="maintenance" variant="detailed" />
                  <ServerStatus name="CDN" status="incident" variant="compact" />
                  <ServerStatus name="Auth Service" status="operational" variant="compact" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">Signal & Live Indicators</h4>
                <div className="flex items-center gap-6">
                  <SignalStrength strength={90} showLabel />
                  <SignalStrength strength={60} showLabel />
                  <SignalStrength strength={30} showLabel />
                  <SignalStrength strength={10} showLabel />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <LiveIndicator isLive variant="badge" />
                <LiveIndicator isLive variant="pulse" />
                <LiveIndicator isLive variant="dot" />
                <LiveIndicator isLive={false} />
              </div>

              <div className="flex items-center gap-6">
                <OnlineStatus showLabel showIcon />
                <PowerStatus isOn={powerOn} onToggle={() => setPowerOn(!powerOn)} label="Server" />
                <ActivityStatus isActive={true} />
                <ActivityStatus isActive={false} lastActivity={new Date(Date.now() - 1000 * 60 * 45)} showTime />
              </div>
            </div>
          </Section>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}

// Section wrapper component
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
        {title}
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        {description}
      </p>
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        {children}
      </div>
    </section>
  );
}
