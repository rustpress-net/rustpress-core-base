/**
 * RustPress Utility Components Demo
 * Showcases utility and feedback components (81-88)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  ToggleLeft,
  Loader,
  AlertCircle,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  User,
  Mail,
  Settings,
  Home,
  FileText,
  Image,
  Star,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Slider,
  RangeSlider,
  VerticalSlider,
  SteppedSlider,
  Switch,
  SwitchGroup,
  ThemeSwitch,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonItem,
  ProgressBar,
  CircularProgress,
  IndeterminateProgress,
  StepProgress,
  MultiProgress,
  Alert,
  AlertBanner,
  Callout,
  Announcement,
  Chip,
  ChipGroup,
  FilterChip,
  ChoiceChipGroup,
  StatusChip,
  ActionChip,
  Autocomplete,
  SearchAutocomplete,
  Pagination,
  PaginationBar,
  CompactPagination,
  CursorPagination,
  LoadMorePagination,
  ScrollArea,
  HorizontalScrollArea,
  staggerContainer,
  fadeInUp,
} from '../../design-system';

// ============================================================================
// Slider Demo (81)
// ============================================================================

function SliderDemo() {
  const [value, setValue] = useState(50);
  const [range, setRange] = useState<[number, number]>([25, 75]);
  const [volume, setVolume] = useState(70);
  const [step, setStep] = useState(2);

  const steps = [
    { value: 1, label: 'Basic', description: '$9/mo' },
    { value: 2, label: 'Pro', description: '$29/mo' },
    { value: 3, label: 'Business', description: '$99/mo' },
    { value: 4, label: 'Enterprise', description: 'Custom' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Basic Slider</h4>
        <Slider
          value={value}
          onChange={setValue}
          label="Brightness"
          showValue
          showTooltip
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Range Slider</h4>
        <RangeSlider
          value={range}
          onChange={setRange}
          label="Price Range"
          showValues
          showTooltip
          formatValue={(v) => `$${v}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Gradient Variant</h4>
          <Slider
            value={volume}
            onChange={setVolume}
            variant="gradient"
            color="success"
            showValue
            label="Volume"
          />
        </div>
        <div className="flex justify-center">
          <VerticalSlider
            value={volume}
            onChange={setVolume}
            label="Level"
            showValue
            showTooltip
            height={150}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Stepped Slider</h4>
        <SteppedSlider
          value={step}
          onChange={setStep}
          steps={steps}
          color="primary"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Switch Demo (82)
// ============================================================================

function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState('grid');

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Basic Switch</h4>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          label="Enable feature"
          description="Turn this on to enable the new experimental feature"
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Switch Group</h4>
        <SwitchGroup label="Notification Preferences" description="Choose what updates you receive">
          <Switch
            checked={notifications}
            onChange={setNotifications}
            label="Push notifications"
            showIcons
          />
          <Switch
            checked={marketing}
            onChange={setMarketing}
            label="Marketing emails"
            color="success"
          />
        </SwitchGroup>
      </div>

      <div className="flex items-center gap-8">
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Theme Switch</h4>
          <ThemeSwitch isDark={isDark} onChange={setIsDark} size="lg" />
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Toggle Buttons</h4>
          <ToggleButtonGroup value={view} onChange={(v) => setView(v as string)}>
            <ToggleButtonItem value="grid">Grid</ToggleButtonItem>
            <ToggleButtonItem value="list">List</ToggleButtonItem>
            <ToggleButtonItem value="table">Table</ToggleButtonItem>
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ProgressBar Demo (83)
// ============================================================================

function ProgressBarDemo() {
  const [progress, setProgress] = useState(65);
  const [currentStep, setCurrentStep] = useState(2);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Linear Progress</h4>
          <div className="space-y-4">
            <ProgressBar value={progress} showValue showLabel label="Upload Progress" />
            <ProgressBar value={45} variant="gradient" color="success" showValue />
            <ProgressBar value={80} variant="striped" color="warning" size="lg" />
            <ProgressBar value={30} variant="animated" color="primary" />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Circular Progress</h4>
          <div className="flex items-center gap-6">
            <CircularProgress value={progress} size={100} color="primary" />
            <CircularProgress value={85} size={80} color="success" strokeWidth={6} />
            <CircularProgress value={45} size={60} color="warning" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Indeterminate Progress</h4>
        <div className="flex items-center gap-8">
          <IndeterminateProgress variant="bar" label="Loading..." />
          <IndeterminateProgress variant="dots" label="Processing" />
          <IndeterminateProgress variant="pulse" />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Step Progress</h4>
        <StepProgress
          currentStep={currentStep}
          totalSteps={4}
          labels={['Account', 'Profile', 'Settings', 'Review']}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 rounded"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            className="px-3 py-1 text-sm bg-primary-500 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Multi-Segment Progress</h4>
        <MultiProgress
          segments={[
            { value: 30, color: '#3b82f6', label: 'Images' },
            { value: 20, color: '#22c55e', label: 'Documents' },
            { value: 15, color: '#eab308', label: 'Videos' },
            { value: 10, color: '#ef4444', label: 'Other' },
          ]}
          showLegend
        />
      </div>
    </div>
  );
}

// ============================================================================
// Alert Demo (84)
// ============================================================================

function AlertDemo() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-neutral-900 dark:text-white">Alert Variants</h4>
        <Alert variant="info" title="Information">
          This is an informational message to help guide users.
        </Alert>
        <Alert variant="success" title="Success!" dismissible>
          Your changes have been saved successfully.
        </Alert>
        <Alert variant="warning" title="Warning">
          Please review your settings before proceeding.
        </Alert>
        <Alert
          variant="error"
          title="Error"
          action={{ label: 'Try again', onClick: () => alert('Retrying...') }}
        >
          Something went wrong. Please try again.
        </Alert>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Alert Banner</h4>
        <AlertBanner
          variant="info"
          action={{ label: 'Learn more', onClick: () => {} }}
          dismissible
        >
          New features are now available! Check out the latest updates.
        </AlertBanner>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-neutral-900 dark:text-white">Callouts</h4>
        <Callout variant="note" title="Note">
          This is additional context that users might find helpful.
        </Callout>
        <Callout variant="tip" title="Pro Tip" collapsible>
          You can use keyboard shortcuts to navigate faster.
        </Callout>
        <Callout variant="caution" title="Caution">
          This action cannot be undone. Please proceed carefully.
        </Callout>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Announcement</h4>
        <Announcement
          title="RustPress 2.0 is here!"
          message="Experience the fastest CMS ever built. Upgrade now to get access to all new features."
          variant="promotional"
          action={{ label: 'Upgrade Now', onClick: () => {} }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Chip Demo (85)
// ============================================================================

function ChipDemo() {
  const [selectedFilters, setSelectedFilters] = useState(['react', 'typescript']);
  const [selectedChoice, setSelectedChoice] = useState('medium');

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Basic Chips</h4>
        <ChipGroup>
          <Chip>Default</Chip>
          <Chip color="primary">Primary</Chip>
          <Chip color="success" icon={<Star className="w-3 h-3" />}>Featured</Chip>
          <Chip color="warning" removable onRemove={() => {}}>Removable</Chip>
          <Chip avatar="https://i.pravatar.cc/100?u=1">John Doe</Chip>
        </ChipGroup>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Filter Chips</h4>
        <ChipGroup>
          {['react', 'typescript', 'rust', 'nodejs', 'python'].map((tech) => (
            <FilterChip
              key={tech}
              label={tech}
              selected={selectedFilters.includes(tech)}
              onChange={() => toggleFilter(tech)}
              count={Math.floor(Math.random() * 100)}
            />
          ))}
        </ChipGroup>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Choice Chips</h4>
        <ChoiceChipGroup
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'xl', label: 'Extra Large' },
          ]}
          value={selectedChoice}
          onChange={(v) => setSelectedChoice(v as string)}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Status Chips</h4>
        <ChipGroup>
          <StatusChip status="online" />
          <StatusChip status="away" />
          <StatusChip status="busy" />
          <StatusChip status="offline" />
          <StatusChip status="pending" label="In Review" />
          <StatusChip status="active" label="Published" />
        </ChipGroup>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Action Chips</h4>
        <ChipGroup>
          <ActionChip label="Add to favorites" icon={<Star className="w-3.5 h-3.5" />} onClick={() => {}} />
          <ActionChip label="Share" onClick={() => {}} variant="filled" />
          <ActionChip label="Loading..." onClick={() => {}} loading />
        </ChipGroup>
      </div>
    </div>
  );
}

// ============================================================================
// Autocomplete Demo (86)
// ============================================================================

function AutocompleteDemo() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const options = [
    { value: 1, label: 'John Doe', description: 'john@example.com', image: 'https://i.pravatar.cc/100?u=1' },
    { value: 2, label: 'Jane Smith', description: 'jane@example.com', image: 'https://i.pravatar.cc/100?u=2' },
    { value: 3, label: 'Bob Wilson', description: 'bob@example.com', image: 'https://i.pravatar.cc/100?u=3' },
    { value: 4, label: 'Alice Brown', description: 'alice@example.com', image: 'https://i.pravatar.cc/100?u=4' },
    { value: 5, label: 'Charlie Davis', description: 'charlie@example.com', image: 'https://i.pravatar.cc/100?u=5' },
  ];

  const trendingItems = [
    { label: 'RustPress tutorials', count: 1234 },
    { label: 'API documentation', count: 890 },
    { label: 'Theme customization', count: 567 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Basic Autocomplete</h4>
        <Autocomplete
          value={query}
          onChange={setQuery}
          options={options}
          placeholder="Search users..."
          label="Assign to"
          highlightMatch
          onSelect={(opt) => console.log('Selected:', opt)}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Search Autocomplete</h4>
        <SearchAutocomplete
          value={searchQuery}
          onChange={setSearchQuery}
          options={[
            { value: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" /> },
            { value: 'pages', label: 'Pages', icon: <FileText className="w-4 h-4" /> },
            { value: 'media', label: 'Media', icon: <Image className="w-4 h-4" /> },
            { value: 'users', label: 'Users', icon: <User className="w-4 h-4" /> },
          ]}
          placeholder="Search everything..."
          showRecentSearches
          recentSearches={['dashboard settings', 'user permissions', 'theme editor']}
          showTrending
          trendingItems={trendingItems}
          onSearch={(q) => console.log('Search:', q)}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">With Groups</h4>
        <Autocomplete
          value={query}
          onChange={setQuery}
          options={[
            { value: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, group: 'Navigation' },
            { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, group: 'Navigation' },
            { value: 'profile', label: 'Profile', icon: <User className="w-4 h-4" />, group: 'Account' },
            { value: 'email', label: 'Email Settings', icon: <Mail className="w-4 h-4" />, group: 'Account' },
          ]}
          placeholder="Jump to..."
          groupBy
        />
      </div>
    </div>
  );
}

// ============================================================================
// Pagination Demo (87)
// ============================================================================

function PaginationDemo() {
  const [page, setPage] = useState(5);
  const [pageSize, setPageSize] = useState(10);
  const [loadedItems, setLoadedItems] = useState(20);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Default Pagination</h4>
        <Pagination
          currentPage={page}
          totalPages={20}
          onPageChange={setPage}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Pagination Variants</h4>
        <div className="space-y-4">
          <Pagination currentPage={page} totalPages={20} onPageChange={setPage} variant="outlined" />
          <Pagination currentPage={page} totalPages={20} onPageChange={setPage} variant="simple" />
          <Pagination currentPage={page} totalPages={20} onPageChange={setPage} variant="minimal" />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Full Pagination Bar</h4>
        <PaginationBar
          currentPage={page}
          totalPages={20}
          totalItems={200}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Compact Pagination</h4>
          <CompactPagination currentPage={page} totalPages={20} onPageChange={setPage} />
        </div>
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Cursor Pagination</h4>
          <CursorPagination
            hasPrevious={page > 1}
            hasNext={page < 20}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Load More</h4>
        <LoadMorePagination
          hasMore={loadedItems < 100}
          onLoadMore={() => setLoadedItems((c) => c + 20)}
          loadedCount={loadedItems}
          totalCount={100}
        />
      </div>
    </div>
  );
}

// ============================================================================
// ScrollArea Demo (88)
// ============================================================================

function ScrollAreaDemo() {
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }));

  const horizontalItems = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    color: `hsl(${(i * 18) % 360}, 70%, 60%)`,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Vertical Scroll Area</h4>
        <ScrollArea maxHeight={300} showShadows className="border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <div className="p-4 space-y-2">
            {items.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="font-medium text-neutral-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-neutral-500">{item.description}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Horizontal Scroll Area</h4>
        <HorizontalScrollArea showArrows>
          <div className="flex gap-4 p-4">
            {horizontalItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-48 h-32 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: item.color }}
              >
                {item.title}
              </div>
            ))}
          </div>
        </HorizontalScrollArea>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-4">Scrollbar Variants</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-neutral-500 mb-2">Thin</p>
            <ScrollArea maxHeight={150} scrollbarSize="thin" className="border border-neutral-200 dark:border-neutral-700 rounded">
              <div className="p-2 space-y-1">
                {items.slice(0, 10).map((item) => (
                  <div key={item.id} className="p-2 text-sm">{item.title}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">Default</p>
            <ScrollArea maxHeight={150} className="border border-neutral-200 dark:border-neutral-700 rounded">
              <div className="p-2 space-y-1">
                {items.slice(0, 10).map((item) => (
                  <div key={item.id} className="p-2 text-sm">{item.title}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">Hidden</p>
            <ScrollArea maxHeight={150} scrollbarVariant="hidden" className="border border-neutral-200 dark:border-neutral-700 rounded">
              <div className="p-2 space-y-1">
                {items.slice(0, 10).map((item) => (
                  <div key={item.id} className="p-2 text-sm">{item.title}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export function UtilityComponents() {
  const components = [
    { id: 'slider', label: 'Slider', icon: Sliders, number: 81 },
    { id: 'switch', label: 'Switch', icon: ToggleLeft, number: 82 },
    { id: 'progress', label: 'Progress', icon: Loader, number: 83 },
    { id: 'alert', label: 'Alert', icon: AlertCircle, number: 84 },
    { id: 'chip', label: 'Chip', icon: Tag, number: 85 },
    { id: 'autocomplete', label: 'Autocomplete', icon: Search, number: 86 },
    { id: 'pagination', label: 'Pagination', icon: ChevronRight, number: 87 },
    { id: 'scroll', label: 'ScrollArea', icon: Maximize2, number: 88 },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Utility Components Demo"
        description="Core utility and feedback components for building rich interfaces (81-88)"
      />

      {/* Feature highlights */}
      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Slider', desc: 'Range inputs', num: 81 },
          { label: 'Switch', desc: 'Toggle controls', num: 82 },
          { label: 'Progress', desc: 'Loading states', num: 83 },
          { label: 'Chips', desc: 'Compact tags', num: 85 },
        ].map((feature) => (
          <div
            key={feature.label}
            className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {feature.label}
              </h3>
              <Badge variant="secondary" size="sm">#{feature.num}</Badge>
            </div>
            <p className="text-sm text-neutral-500">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabbed demos */}
      <motion.div variants={fadeInUp}>
        <Card>
          <Tabs defaultValue="slider">
            <CardHeader>
              <TabList>
                {components.map((comp) => (
                  <Tab key={comp.id} value={comp.id}>
                    <comp.icon className="w-4 h-4 mr-2" />
                    {comp.label}
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {comp.number}
                    </Badge>
                  </Tab>
                ))}
              </TabList>
            </CardHeader>
            <CardBody className="min-h-[500px]">
              <TabPanels>
                <TabPanel value="slider">
                  <SliderDemo />
                </TabPanel>
                <TabPanel value="switch">
                  <SwitchDemo />
                </TabPanel>
                <TabPanel value="progress">
                  <ProgressBarDemo />
                </TabPanel>
                <TabPanel value="alert">
                  <AlertDemo />
                </TabPanel>
                <TabPanel value="chip">
                  <ChipDemo />
                </TabPanel>
                <TabPanel value="autocomplete">
                  <AutocompleteDemo />
                </TabPanel>
                <TabPanel value="pagination">
                  <PaginationDemo />
                </TabPanel>
                <TabPanel value="scroll">
                  <ScrollAreaDemo />
                </TabPanel>
              </TabPanels>
            </CardBody>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default UtilityComponents;
