/**
 * RustPress Advanced UI & Utility Components Demo
 * Showcases enhancements 49-56: Advanced UI Components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Tags,
  ListOrdered,
  Users,
  MessageSquare,
  MoreHorizontal,
  PanelRight,
  Sparkles,
  ChevronDown,
  Copy,
  Trash2,
  Edit,
  Archive,
  Download,
  Share2,
  Heart,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  User,
  HelpCircle,
  FileText,
  Folder,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Import all UI components
import {
  Rating,
  StarRating,
  HeartRating,
  ThumbsRating,
  EmojiRating,
  NumericRating,
  RatingBreakdown,
  RatingSummary,
  InlineRating,
} from '../../design-system/components/Rating';

import {
  TagInput,
  TagBadge,
  TagGroup,
  TagCloud,
  TagFilter,
  TagList,
} from '../../design-system/components/TagInput';

import {
  Stepper,
  StepContent,
  StepActions,
  ProgressStepper,
  BreadcrumbStepper,
  MiniProgress,
} from '../../design-system/components/Stepper';

import {
  AvatarStack,
  AvatarList,
  AvatarSelect,
  PresenceIndicator,
  AvatarInvite,
} from '../../design-system/components/AvatarStack';

import {
  Popover,
  PopoverContent,
  Tooltip,
  HoverCard,
  ConfirmPopover,
  InfoPopover,
} from '../../design-system/components/Popover';

import {
  ContextMenu,
  ContextMenuProvider,
  ContextMenuTrigger,
  createMenuItem,
  createSeparator,
  createLabel,
  createCheckboxItem,
  createSubmenu,
} from '../../design-system/components/ContextMenu';

import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  ConfirmDrawer,
  FormDrawer,
  NavDrawer,
} from '../../design-system/components/Drawer';

import {
  SpotlightTour,
  Spotlight,
  FeatureHighlight,
  AnnouncementBanner,
} from '../../design-system/components/SpotlightTour';

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

// Sample users for avatars
const sampleUsers = [
  { id: '1', name: 'Alice Johnson', src: 'https://i.pravatar.cc/150?u=alice', status: 'online' as const },
  { id: '2', name: 'Bob Smith', src: 'https://i.pravatar.cc/150?u=bob', status: 'away' as const },
  { id: '3', name: 'Carol White', src: 'https://i.pravatar.cc/150?u=carol', status: 'busy' as const },
  { id: '4', name: 'David Brown', src: 'https://i.pravatar.cc/150?u=david', status: 'offline' as const },
  { id: '5', name: 'Eve Davis', src: 'https://i.pravatar.cc/150?u=eve', status: 'online' as const },
  { id: '6', name: 'Frank Miller', src: 'https://i.pravatar.cc/150?u=frank', status: 'online' as const },
  { id: '7', name: 'Grace Lee', src: 'https://i.pravatar.cc/150?u=grace', status: 'away' as const },
];

// Sample tags
const sampleTags = [
  { id: '1', label: 'React', color: '#61dafb' },
  { id: '2', label: 'TypeScript', color: '#3178c6' },
  { id: '3', label: 'Rust', color: '#dea584' },
  { id: '4', label: 'JavaScript', color: '#f7df1e' },
  { id: '5', label: 'Python', color: '#3776ab' },
];

// Tag suggestions
const tagSuggestions = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Testing',
  'Documentation',
  'Bug',
  'Feature',
  'Enhancement',
  'Performance',
];

// Rating breakdown
const ratingBreakdown = [
  { stars: 5, count: 245, percentage: 65 },
  { stars: 4, count: 89, percentage: 24 },
  { stars: 3, count: 28, percentage: 7 },
  { stars: 2, count: 10, percentage: 3 },
  { stars: 1, count: 5, percentage: 1 },
];

// Context menu items
const contextMenuItems = [
  createLabel('context-label', 'Actions'),
  createMenuItem('edit', 'Edit', { icon: <Edit className="w-4 h-4" /> }),
  createMenuItem('copy', 'Copy', { icon: <Copy className="w-4 h-4" />, shortcut: '⌘C' }),
  createMenuItem('duplicate', 'Duplicate', { icon: <Copy className="w-4 h-4" />, shortcut: '⌘D' }),
  createSeparator('sep1'),
  createSubmenu('move', 'Move to', [
    createMenuItem('folder1', 'Documents', { icon: <Folder className="w-4 h-4" /> }),
    createMenuItem('folder2', 'Images', { icon: <ImageIcon className="w-4 h-4" /> }),
    createMenuItem('folder3', 'Archive', { icon: <Archive className="w-4 h-4" /> }),
  ], { icon: <Folder className="w-4 h-4" /> }),
  createSeparator('sep2'),
  createCheckboxItem('favorite', 'Add to Favorites', false, { icon: <Heart className="w-4 h-4" /> }),
  createCheckboxItem('bookmark', 'Bookmark', true, { icon: <Bookmark className="w-4 h-4" /> }),
  createSeparator('sep3'),
  createMenuItem('share', 'Share', { icon: <Share2 className="w-4 h-4" /> }),
  createMenuItem('download', 'Download', { icon: <Download className="w-4 h-4" />, shortcut: '⌘S' }),
  createSeparator('sep4'),
  createMenuItem('delete', 'Delete', { icon: <Trash2 className="w-4 h-4" />, danger: true, shortcut: '⌫' }),
];

// Navigation items for drawer
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FileText className="w-5 h-5" />, href: '#' },
  { id: 'posts', label: 'Posts', icon: <FileText className="w-5 h-5" />, href: '#', badge: '12' },
  { id: 'media', label: 'Media', icon: <ImageIcon className="w-5 h-5" />, href: '#' },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" />, href: '#' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, href: '#' },
];

// Tour steps
const tourSteps = [
  {
    id: 'welcome',
    target: '#tour-welcome',
    title: 'Welcome to RustPress',
    content: 'This is your new admin dashboard. Let us show you around!',
    position: 'bottom' as const,
  },
  {
    id: 'navigation',
    target: '#tour-navigation',
    title: 'Navigation',
    content: 'Use the sidebar to navigate between different sections of your CMS.',
    position: 'right' as const,
  },
  {
    id: 'actions',
    target: '#tour-actions',
    title: 'Quick Actions',
    content: 'Access frequently used actions quickly from here.',
    position: 'bottom' as const,
  },
];

// ============================================================================
// Main Demo Component
// ============================================================================

export default function AdvancedUI() {
  // Rating state
  const [rating, setRating] = useState(4);
  const [emojiRating, setEmojiRating] = useState(3);
  const [npsRating, setNpsRating] = useState(8);

  // Tag state
  const [tags, setTags] = useState(sampleTags.slice(0, 3));
  const [selectedTags, setSelectedTags] = useState<string[]>(['React', 'TypeScript']);

  // Stepper state
  const [activeStep, setActiveStep] = useState(1);

  // Avatar selection
  const [selectedUsers, setSelectedUsers] = useState<string[]>(['1', '2']);

  // Popover state
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSide, setDrawerSide] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Announcement Banner */}
        {showBanner && (
          <AnnouncementBanner
            title="New Features Available!"
            description="Check out our latest UI components including ratings, tags, and more."
            variant="info"
            action={{
              label: 'Learn More',
              onClick: () => console.log('Learn more clicked'),
            }}
            onDismiss={() => setShowBanner(false)}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 id="tour-welcome" className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Advanced UI & Utility Components
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enterprise-grade UI components for building rich interfaces (Enhancements 49-56)
          </p>
        </div>

        {/* 49. Rating */}
        <DemoSection
          title="49. Rating"
          description="Star/thumbs/emoji ratings with breakdown and summary displays"
          icon={<Star className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Star Rating */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Star Rating
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Default</p>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">With Half Stars</p>
                  <StarRating value={3.5} allowHalf onChange={setRating} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Read Only</p>
                  <StarRating value={4.5} readOnly showValue />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Large</p>
                  <StarRating value={rating} size="lg" onChange={setRating} />
                </div>
              </div>
            </div>

            {/* Heart Rating */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Heart Rating
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <HeartRating value={3} maxValue={5} onChange={(v) => console.log('Heart:', v)} />
                <HeartRating value={4} maxValue={5} readOnly showValue />
              </div>
            </div>

            {/* Thumbs Rating */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Thumbs Rating
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <ThumbsRating onRate={(value) => console.log('Thumbs:', value)} />
                <ThumbsRating
                  upCount={124}
                  downCount={12}
                  onRate={(value) => console.log('Thumbs:', value)}
                />
              </div>
            </div>

            {/* Emoji Rating */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Emoji Rating
              </h3>
              <EmojiRating value={emojiRating} onChange={setEmojiRating} showLabels />
            </div>

            {/* Numeric (NPS) Rating */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                NPS Rating (0-10)
              </h3>
              <NumericRating value={npsRating} onChange={setNpsRating} showLabels />
            </div>

            {/* Rating Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Rating Breakdown
              </h3>
              <div className="max-w-md">
                <RatingBreakdown ratings={ratingBreakdown} totalReviews={377} />
              </div>
            </div>

            {/* Rating Summary */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Rating Summary Card
              </h3>
              <div className="max-w-sm">
                <RatingSummary
                  average={4.3}
                  total={377}
                  ratings={ratingBreakdown}
                  onRateClick={() => console.log('Rate clicked')}
                />
              </div>
            </div>

            {/* Inline Rating */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Inline Rating
              </h3>
              <div className="flex flex-wrap gap-4">
                <InlineRating value={4.5} reviewCount={128} />
                <InlineRating value={3.8} reviewCount={42} size="sm" />
                <InlineRating value={5.0} reviewCount={256} showReviewLink />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 50. TagInput */}
        <DemoSection
          title="50. Tag Input"
          description="Interactive tag input with autocomplete, colors, and tag clouds"
          icon={<Tags className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Basic Tag Input */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tag Input with Autocomplete
              </h3>
              <div className="max-w-md">
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  suggestions={tagSuggestions}
                  placeholder="Add tags..."
                  maxTags={10}
                />
              </div>
            </div>

            {/* Tag Badges */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tag Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {sampleTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    label={tag.label}
                    color={tag.color}
                    removable
                    onRemove={() => console.log('Remove:', tag.label)}
                  />
                ))}
                <TagBadge label="Disabled" variant="outline" disabled />
              </div>
            </div>

            {/* Tag Variants */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tag Variants
              </h3>
              <div className="flex flex-wrap gap-2">
                <TagBadge label="Solid" variant="solid" />
                <TagBadge label="Soft" variant="soft" />
                <TagBadge label="Outline" variant="outline" />
                <TagBadge label="With Dot" variant="solid" showDot />
                <TagBadge label="Small" size="sm" />
                <TagBadge label="Large" size="lg" />
              </div>
            </div>

            {/* Tag Cloud */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tag Cloud
              </h3>
              <TagCloud
                tags={[
                  { id: '1', label: 'React', count: 156 },
                  { id: '2', label: 'TypeScript', count: 124 },
                  { id: '3', label: 'JavaScript', count: 89 },
                  { id: '4', label: 'Rust', count: 67 },
                  { id: '5', label: 'Python', count: 45 },
                  { id: '6', label: 'Go', count: 34 },
                  { id: '7', label: 'CSS', count: 78 },
                  { id: '8', label: 'HTML', count: 56 },
                  { id: '9', label: 'Node.js', count: 98 },
                  { id: '10', label: 'GraphQL', count: 23 },
                ]}
                onTagClick={(tag) => console.log('Clicked:', tag)}
              />
            </div>

            {/* Tag Filter */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tag Filter
              </h3>
              <TagFilter
                tags={tagSuggestions}
                selected={selectedTags}
                onChange={setSelectedTags}
                label="Filter by tags"
              />
            </div>

            {/* Tag Group */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tag Groups
              </h3>
              <div className="space-y-4">
                <TagGroup
                  title="Languages"
                  tags={[
                    { id: '1', label: 'React' },
                    { id: '2', label: 'TypeScript' },
                    { id: '3', label: 'Rust' },
                  ]}
                  color="#3b82f6"
                />
                <TagGroup
                  title="Status"
                  tags={[
                    { id: '1', label: 'In Progress' },
                    { id: '2', label: 'Review' },
                    { id: '3', label: 'Done' },
                  ]}
                  color="#10b981"
                />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 51. Stepper */}
        <DemoSection
          title="51. Stepper"
          description="Multi-step progress indicators with various layouts"
          icon={<ListOrdered className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Horizontal Stepper */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Horizontal Stepper
              </h3>
              <Stepper
                steps={[
                  { id: '1', label: 'Account', description: 'Create your account' },
                  { id: '2', label: 'Profile', description: 'Setup your profile' },
                  { id: '3', label: 'Settings', description: 'Configure preferences' },
                  { id: '4', label: 'Complete', description: 'Finish setup' },
                ]}
                activeStep={activeStep}
                onStepClick={setActiveStep}
              />
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                  disabled={activeStep === 0}
                  className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveStep((s) => Math.min(3, s + 1))}
                  disabled={activeStep === 3}
                  className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Vertical Stepper */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Vertical Stepper
              </h3>
              <div className="max-w-md">
                <Stepper
                  steps={[
                    { id: '1', label: 'Order Placed', description: 'Dec 25, 2024' },
                    { id: '2', label: 'Processing', description: 'Dec 26, 2024' },
                    { id: '3', label: 'Shipped', description: 'Dec 27, 2024' },
                    { id: '4', label: 'Delivered', description: 'Expected Dec 30' },
                  ]}
                  activeStep={2}
                  orientation="vertical"
                  variant="outlined"
                />
              </div>
            </div>

            {/* Progress Stepper */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Progress Stepper
              </h3>
              <ProgressStepper
                steps={['Cart', 'Shipping', 'Payment', 'Confirm']}
                currentStep={2}
                showLabels
              />
            </div>

            {/* Breadcrumb Stepper */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Breadcrumb Stepper
              </h3>
              <BreadcrumbStepper
                steps={[
                  { id: '1', label: 'Home', href: '#' },
                  { id: '2', label: 'Products', href: '#' },
                  { id: '3', label: 'Electronics', href: '#' },
                  { id: '4', label: 'Laptops' },
                ]}
              />
            </div>

            {/* Mini Progress */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Mini Progress Indicators
              </h3>
              <div className="flex items-center gap-8">
                <MiniProgress current={2} total={5} />
                <MiniProgress current={3} total={4} showLabel />
                <MiniProgress current={5} total={5} variant="success" />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 52. AvatarStack */}
        <DemoSection
          title="52. Avatar Stack"
          description="Overlapping avatars with tooltips and presence indicators"
          icon={<Users className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Basic Avatar Stack */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Avatar Stack
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Small (max 3)</p>
                  <AvatarStack
                    avatars={sampleUsers}
                    max={3}
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Medium (max 5)</p>
                  <AvatarStack
                    avatars={sampleUsers}
                    max={5}
                    size="md"
                  />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Large (max 4)</p>
                  <AvatarStack
                    avatars={sampleUsers}
                    max={4}
                    size="lg"
                  />
                </div>
              </div>
            </div>

            {/* With Presence */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                With Presence Indicators
              </h3>
              <AvatarStack
                avatars={sampleUsers}
                max={5}
                showPresence
              />
            </div>

            {/* Avatar List */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Avatar List
              </h3>
              <div className="max-w-md">
                <AvatarList
                  avatars={sampleUsers.slice(0, 5)}
                  showPresence
                  onAvatarClick={(user) => console.log('Clicked:', user.name)}
                />
              </div>
            </div>

            {/* Avatar Select */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Avatar Select (Multi)
              </h3>
              <AvatarSelect
                avatars={sampleUsers}
                selected={selectedUsers}
                onChange={setSelectedUsers}
                multiple
                label="Assign team members"
              />
            </div>

            {/* Presence Indicators */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Presence Indicators
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <PresenceIndicator status="online" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <PresenceIndicator status="away" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Away</span>
                </div>
                <div className="flex items-center gap-2">
                  <PresenceIndicator status="busy" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Busy</span>
                </div>
                <div className="flex items-center gap-2">
                  <PresenceIndicator status="offline" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Offline</span>
                </div>
              </div>
            </div>

            {/* Avatar Invite */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Avatar with Invite
              </h3>
              <div className="flex items-center">
                <AvatarStack avatars={sampleUsers.slice(0, 3)} max={3} />
                <AvatarInvite
                  onInvite={() => console.log('Invite clicked')}
                  tooltip="Invite team member"
                />
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 53. Popover */}
        <DemoSection
          title="53. Popover"
          description="Advanced tooltips and popovers with smart positioning"
          icon={<MessageSquare className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Tooltips */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Tooltips
              </h3>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="This is a tooltip">
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    Hover me
                  </button>
                </Tooltip>
                <Tooltip content="Top tooltip" side="top">
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    Top
                  </button>
                </Tooltip>
                <Tooltip content="Right tooltip" side="right">
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    Right
                  </button>
                </Tooltip>
                <Tooltip content="Left tooltip" side="left">
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    Left
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Basic Popover */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Basic Popover
              </h3>
              <Popover
                open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                trigger={
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg">
                    Open Popover
                  </button>
                }
              >
                <PopoverContent>
                  <div className="p-4 w-64">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                      Popover Content
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      This is a popover with custom content. It can contain any React elements.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Hover Card */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Hover Card
              </h3>
              <HoverCard
                trigger={
                  <span className="text-primary-500 cursor-pointer underline">
                    @alice
                  </span>
                }
              >
                <div className="p-4 w-72">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://i.pravatar.cc/150?u=alice"
                      alt="Alice"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        Alice Johnson
                      </div>
                      <div className="text-sm text-neutral-500">@alice</div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Senior Software Engineer at RustPress. Building great things.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>256</strong> following</span>
                    <span><strong>1.2K</strong> followers</span>
                  </div>
                </div>
              </HoverCard>
            </div>

            {/* Confirm Popover */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Confirm Popover
              </h3>
              <ConfirmPopover
                title="Delete item?"
                description="This action cannot be undone. Are you sure you want to continue?"
                confirmLabel="Delete"
                variant="danger"
                onConfirm={() => console.log('Confirmed!')}
              >
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
                  Delete Item
                </button>
              </ConfirmPopover>
            </div>

            {/* Info Popover */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Info Popover
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-neutral-600 dark:text-neutral-400">API Rate Limit</span>
                <InfoPopover>
                  <div className="text-sm space-y-2">
                    <p>Rate limits help protect our API from abuse.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Free tier: 100 requests/hour</li>
                      <li>Pro tier: 1,000 requests/hour</li>
                      <li>Enterprise: Unlimited</li>
                    </ul>
                  </div>
                </InfoPopover>
              </div>
            </div>
          </div>
        </DemoSection>

        {/* 54. Context Menu */}
        <DemoSection
          title="54. Context Menu"
          description="Right-click context menus with nested submenus"
          icon={<MoreHorizontal className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Basic Context Menu */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Right-Click Context Menu
              </h3>
              <ContextMenu
                items={contextMenuItems}
                onSelect={(item) => console.log('Selected:', item)}
              >
                <div className="p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-center cursor-context-menu">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Right-click anywhere in this box to see the context menu
                  </p>
                </div>
              </ContextMenu>
            </div>

            {/* File Context Menu */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                File Item with Context Menu
              </h3>
              <ContextMenuProvider>
                <div className="grid grid-cols-3 gap-4">
                  {['Document.pdf', 'Image.png', 'Spreadsheet.xlsx'].map((file) => (
                    <ContextMenuTrigger
                      key={file}
                      items={contextMenuItems}
                      onSelect={(item) => console.log('Action:', item.id, 'on', file)}
                    >
                      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center gap-3 cursor-context-menu hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                        <FileText className="w-8 h-8 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {file}
                        </span>
                      </div>
                    </ContextMenuTrigger>
                  ))}
                </div>
              </ContextMenuProvider>
            </div>
          </div>
        </DemoSection>

        {/* 55. Drawer */}
        <DemoSection
          title="55. Drawer"
          description="Slide-out panels from any edge of the screen"
          icon={<PanelRight className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Drawer Directions */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Drawer Directions
              </h3>
              <div className="flex flex-wrap gap-4">
                {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => {
                      setDrawerSide(side);
                      setIsDrawerOpen(true);
                    }}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg capitalize hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav Drawer */}
            <div id="tour-navigation">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Navigation Drawer
              </h3>
              <button
                onClick={() => setIsNavDrawerOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
              >
                Open Nav Drawer
              </button>
            </div>

            {/* Confirm Drawer */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Confirm Drawer
              </h3>
              <button
                onClick={() => setIsConfirmDrawerOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Basic Drawer */}
          <Drawer
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            side={drawerSide}
            size="md"
          >
            <DrawerHeader
              title="Drawer Title"
              description="This is a drawer description"
              onClose={() => setIsDrawerOpen(false)}
            />
            <DrawerBody>
              <div className="space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400">
                  This drawer slides in from the {drawerSide}. It can contain any content you need.
                </p>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <h4 className="font-medium mb-2">Drawer Features</h4>
                  <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                    <li>- Focus trapping</li>
                    <li>- Scroll locking</li>
                    <li>- Click outside to close</li>
                    <li>- Escape key to close</li>
                    <li>- Smooth animations</li>
                  </ul>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
              >
                Save
              </button>
            </DrawerFooter>
          </Drawer>

          {/* Nav Drawer */}
          <NavDrawer
            open={isNavDrawerOpen}
            onClose={() => setIsNavDrawerOpen(false)}
            items={navItems}
            header={
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
                  R
                </div>
                <span className="font-semibold">RustPress</span>
              </div>
            }
            footer={
              <button className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            }
          />

          {/* Confirm Drawer */}
          <ConfirmDrawer
            open={isConfirmDrawerOpen}
            onClose={() => setIsConfirmDrawerOpen(false)}
            title="Delete Account"
            description="This will permanently delete your account and all associated data. This action cannot be undone."
            confirmLabel="Delete Account"
            variant="danger"
            onConfirm={() => {
              console.log('Account deleted');
              setIsConfirmDrawerOpen(false);
            }}
          />
        </DemoSection>

        {/* 56. Spotlight Tour */}
        <DemoSection
          title="56. Spotlight Tour"
          description="Feature spotlight and guided tours for onboarding"
          icon={<Sparkles className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* Tour Controls */}
            <div id="tour-actions">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Product Tour
              </h3>
              <button
                onClick={() => setIsTourOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
              >
                Start Tour
              </button>
            </div>

            {/* Feature Highlight */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Feature Highlight
              </h3>
              <div className="flex gap-4">
                <FeatureHighlight
                  title="New Feature"
                  content="Check out our new context menu system with nested submenus!"
                  position="bottom"
                >
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                </FeatureHighlight>
              </div>
            </div>

            {/* Spotlight Demo */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                Spotlight Component
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                The Spotlight component creates a visual highlight around an element to draw attention.
                Start the tour above to see it in action.
              </p>
            </div>
          </div>

          {/* Spotlight Tour */}
          <SpotlightTour
            steps={tourSteps}
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
            onComplete={() => {
              console.log('Tour completed!');
              setIsTourOpen(false);
            }}
          />
        </DemoSection>

        {/* Footer */}
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <p>RustPress Design System - Advanced UI Components (49-56)</p>
        </div>
      </div>
    </div>
  );
}
