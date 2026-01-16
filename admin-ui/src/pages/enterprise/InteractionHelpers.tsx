/**
 * Interaction & Layout Helper Components Demo Page
 * Showcasing components 89-96
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Star,
  Heart,
  Code,
  Copy,
  Terminal,
  Image,
  Video,
  Folder,
  ChevronRight,
} from 'lucide-react';

// Import components 89-96
import {
  // 89 - Tooltip
  Tooltip,
  RichTooltip,
  InfoTooltip,
  HelpTooltip,
  StatusTooltip,
  TruncateWithTooltip,
  // 90 - Kbd
  Kbd,
  KeyCombo,
  Shortcut,
  ShortcutLabel,
  HotkeyProvider,
  HotkeyDisplay,
  AnimatedKey,
  KeyListenerDisplay,
  useHotkey,
  // 91 - Separator
  Separator,
  LabeledSeparator,
  IconSeparator,
  FadeSeparator,
  SectionSeparator,
  StepSeparator,
  DecorativeSeparator,
  SpacingSeparator,
  // 92 - AspectRatio
  AspectRatio,
  ImageAspectRatio,
  VideoAspectRatio,
  PlaceholderAspectRatio,
  GalleryAspectRatio,
  AspectRatioPresets,
  // 93 - Collapsible
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  ExpandableSection,
  ExpandableCard,
  DetailsSummary,
  // 94 - CopyButton
  CopyButton,
  CopyField,
  CopyLink,
  CopyCodeBlock,
  ShareButton,
  InlineCopy,
  // 95 - Highlight
  Highlight,
  Mark,
  CodeHighlight,
  SearchHighlight,
  GradientText,
  TextEmphasis,
  // 96 - Portal
  ModalPortal,
  DrawerPortal,
  OverlayPortal,
  FocusTrap,
} from '../../design-system/components';

// Demo wrapper component
const DemoSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
  >
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
      {description}
    </p>
    {children}
  </motion.div>
);

// Hotkey Demo Component
function HotkeyDemo() {
  const [lastAction, setLastAction] = useState<string>('None');

  useHotkey({
    keys: 'mod+k',
    onActivate: () => setLastAction('Command Palette (Mod+K)'),
  });

  useHotkey({
    keys: 'mod+s',
    onActivate: () => setLastAction('Save (Mod+S)'),
  });

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
        Press <Shortcut shortcut="mod+k" /> or <Shortcut shortcut="mod+s" />
      </p>
      <p className="text-sm">
        Last action: <strong>{lastAction}</strong>
      </p>
    </div>
  );
}

export default function InteractionHelpers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  const sampleCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const result = greet("World");
console.log(result);`;

  const hotkeysList = [
    { keys: 'mod+k', description: 'Open command palette', category: 'General' },
    { keys: 'mod+s', description: 'Save changes', category: 'General' },
    { keys: 'mod+shift+p', description: 'Quick actions', category: 'General' },
    { keys: 'mod+/', description: 'Toggle comment', category: 'Editor' },
    { keys: 'mod+b', description: 'Toggle bold', category: 'Editor' },
    { keys: 'mod+i', description: 'Toggle italic', category: 'Editor' },
  ];

  return (
    <HotkeyProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Interaction & Layout Helper Components
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Components 89-96: Tooltips, Keyboard shortcuts, Separators, Aspect ratios,
              Collapsibles, Copy utilities, Text highlighting, and Portals.
            </p>
          </div>

          {/* 89 - Tooltip */}
          <DemoSection
            title="89. Tooltip Components"
            description="Rich tooltips with various styles, positions, and content types"
          >
            <div className="space-y-8">
              {/* Basic Tooltips */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Basic Tooltips
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip content="Default tooltip">
                    <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      Hover me
                    </button>
                  </Tooltip>
                  <InfoTooltip content="This is helpful information about this feature." />
                  <HelpTooltip content="Click to learn more about this setting." />
                </div>
              </div>

              {/* Status Tooltips */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Status Tooltips
                </h4>
                <div className="flex flex-wrap gap-4">
                  <StatusTooltip status="success" message="Operation completed successfully">
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Success
                    </button>
                  </StatusTooltip>
                  <StatusTooltip status="warning" message="Please review before proceeding">
                    <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Warning
                    </button>
                  </StatusTooltip>
                  <StatusTooltip status="error" message="An error occurred">
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Error
                    </button>
                  </StatusTooltip>
                </div>
              </div>

              {/* Rich Tooltip */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Rich Tooltip
                </h4>
                <RichTooltip
                  title="Pro Feature"
                  description="Unlock advanced analytics and reporting features with a Pro subscription."
                  icon={<Star className="w-5 h-5" />}
                  action={{
                    label: 'Upgrade Now',
                    onClick: () => console.log('Upgrade clicked'),
                  }}
                >
                  <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Pro Feature
                  </button>
                </RichTooltip>
              </div>

              {/* Truncate with Tooltip */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Truncate with Tooltip
                </h4>
                <div className="max-w-xs">
                  <TruncateWithTooltip maxWidth={200}>
                    This is a very long text that will be truncated and show full content on hover
                  </TruncateWithTooltip>
                </div>
              </div>
            </div>
          </DemoSection>

          {/* 90 - Kbd */}
          <DemoSection
            title="90. Keyboard Shortcut Components"
            description="Display keyboard shortcuts and handle hotkey interactions"
          >
            <div className="space-y-8">
              {/* Basic Keys */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Basic Keys
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Kbd>A</Kbd>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>Shift</Kbd>
                  <Kbd>Enter</Kbd>
                  <Kbd>Esc</Kbd>
                </div>
              </div>

              {/* Key Combinations */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Key Combinations
                </h4>
                <div className="flex flex-wrap gap-4">
                  <KeyCombo keys={['Ctrl', 'C']} />
                  <KeyCombo keys={['Ctrl', 'Shift', 'P']} />
                  <KeyCombo keys={['Alt', 'Tab']} />
                </div>
              </div>

              {/* Shortcuts with Labels */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Shortcut Labels
                </h4>
                <div className="space-y-2">
                  <ShortcutLabel label="Save file" shortcut="mod+s" />
                  <ShortcutLabel label="Open command palette" shortcut="mod+shift+p" />
                  <ShortcutLabel label="Toggle sidebar" shortcut="mod+b" />
                </div>
              </div>

              {/* Hotkey Demo */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Hotkey Hook Demo
                </h4>
                <HotkeyDemo />
              </div>

              {/* Key Listener */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Key Listener Display
                </h4>
                <KeyListenerDisplay />
              </div>

              {/* Hotkey Reference */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Keyboard Shortcuts Reference
                </h4>
                <HotkeyDisplay hotkeys={hotkeysList} />
              </div>
            </div>
          </DemoSection>

          {/* 91 - Separator */}
          <DemoSection
            title="91. Separator Components"
            description="Visual dividers with various styles and decorations"
          >
            <div className="space-y-8">
              {/* Basic Separators */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Basic Separators
                </h4>
                <div className="space-y-4">
                  <Separator />
                  <Separator variant="dashed" />
                  <Separator variant="dotted" />
                  <Separator variant="gradient" />
                </div>
              </div>

              {/* Labeled Separators */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Labeled Separators
                </h4>
                <div className="space-y-4">
                  <LabeledSeparator label="OR" />
                  <LabeledSeparator label="Section" labelPosition="left" />
                  <LabeledSeparator label="Continue" labelPosition="right" />
                </div>
              </div>

              {/* Icon Separator */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Icon Separator
                </h4>
                <IconSeparator icon={<Star className="w-4 h-4" />} />
              </div>

              {/* Decorative Separators */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Decorative Separators
                </h4>
                <div className="space-y-4">
                  <DecorativeSeparator pattern="dots" />
                  <DecorativeSeparator pattern="diamonds" color="primary" />
                  <DecorativeSeparator pattern="stars" color="accent" />
                </div>
              </div>

              {/* Section Separator */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Section Separator
                </h4>
                <SectionSeparator
                  title="Advanced Settings"
                  subtitle="Configure advanced options"
                  action={
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      Learn more
                    </button>
                  }
                />
              </div>
            </div>
          </DemoSection>

          {/* 92 - AspectRatio */}
          <DemoSection
            title="92. Aspect Ratio Components"
            description="Maintain consistent aspect ratios for media content"
          >
            <div className="space-y-8">
              {/* Basic Aspect Ratios */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Common Aspect Ratios
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">1:1 (Square)</p>
                    <AspectRatio ratio={1}>
                      <div className="bg-primary-100 dark:bg-primary-900 flex items-center justify-center h-full">
                        <span className="text-primary-600">1:1</span>
                      </div>
                    </AspectRatio>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">16:9 (Video)</p>
                    <AspectRatio ratio="16/9">
                      <div className="bg-blue-100 dark:bg-blue-900 flex items-center justify-center h-full">
                        <span className="text-blue-600">16:9</span>
                      </div>
                    </AspectRatio>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">4:3 (Standard)</p>
                    <AspectRatio ratio="4/3">
                      <div className="bg-green-100 dark:bg-green-900 flex items-center justify-center h-full">
                        <span className="text-green-600">4:3</span>
                      </div>
                    </AspectRatio>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">21:9 (Cinema)</p>
                    <AspectRatio ratio="21/9">
                      <div className="bg-purple-100 dark:bg-purple-900 flex items-center justify-center h-full">
                        <span className="text-purple-600">21:9</span>
                      </div>
                    </AspectRatio>
                  </div>
                </div>
              </div>

              {/* Placeholder */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Placeholder with Animation
                </h4>
                <div className="max-w-sm">
                  <PlaceholderAspectRatio ratio="16/9" animate />
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Image Gallery with Aspect Ratio
                </h4>
                <GalleryAspectRatio
                  items={[
                    { src: 'https://picsum.photos/400/400?1', alt: 'Image 1' },
                    { src: 'https://picsum.photos/400/400?2', alt: 'Image 2' },
                    { src: 'https://picsum.photos/400/400?3', alt: 'Image 3' },
                  ]}
                  columns={3}
                  gap="md"
                  defaultRatio="1/1"
                />
              </div>
            </div>
          </DemoSection>

          {/* 93 - Collapsible */}
          <DemoSection
            title="93. Collapsible Components"
            description="Expandable and collapsible content sections"
          >
            <div className="space-y-8">
              {/* Basic Collapsible */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Basic Collapsible
                </h4>
                <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                    <ChevronRight className={`w-4 h-4 transition-transform ${collapsibleOpen ? 'rotate-90' : ''}`} />
                    <span>Click to expand</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      This is the collapsible content. It can contain any React nodes.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Accordion */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Accordion
                </h4>
                <CollapsibleAccordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1" className="border-b border-neutral-200 dark:border-neutral-700">
                    <AccordionTrigger className="py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      What is RustPress?
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-4">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        RustPress is a modern, high-performance CMS built with Rust and React.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-neutral-200 dark:border-neutral-700">
                    <AccordionTrigger className="py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      How do I get started?
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-4">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Install RustPress using cargo and run the setup wizard.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-neutral-200 dark:border-neutral-700">
                    <AccordionTrigger className="py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      Is it production ready?
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-4">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Yes! RustPress is battle-tested and used in production by many companies.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </CollapsibleAccordion>
              </div>

              {/* Expandable Section */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Expandable Sections
                </h4>
                <div className="space-y-2">
                  <ExpandableSection
                    title="General Settings"
                    subtitle="Configure basic options"
                    icon={<Settings className="w-5 h-5" />}
                    variant="bordered"
                  >
                    <p className="text-neutral-600 dark:text-neutral-400">
                      General settings content goes here.
                    </p>
                  </ExpandableSection>
                  <ExpandableSection
                    title="Advanced Options"
                    subtitle="Power user features"
                    icon={<Zap className="w-5 h-5" />}
                    variant="bordered"
                  >
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Advanced options content goes here.
                    </p>
                  </ExpandableSection>
                </div>
              </div>

              {/* Expandable Card */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Expandable Card
                </h4>
                <ExpandableCard
                  header={
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Featured Post</h4>
                        <p className="text-sm text-neutral-500">Published 2 days ago</p>
                      </div>
                    </div>
                  }
                  preview="Click to read the full article about building modern web applications..."
                >
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Full article content would go here. This expandable card is perfect for
                    previewing content with a teaser and allowing users to expand for more details.
                  </p>
                </ExpandableCard>
              </div>
            </div>
          </DemoSection>

          {/* 94 - CopyButton */}
          <DemoSection
            title="94. Copy Button Components"
            description="Clipboard copy functionality with visual feedback"
          >
            <div className="space-y-8">
              {/* Basic Copy Buttons */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Copy Button Variants
                </h4>
                <div className="flex flex-wrap gap-4">
                  <CopyButton text="Hello World" showLabel />
                  <CopyButton text="Copied!" variant="outline" showLabel />
                  <CopyButton text="Ghost variant" variant="ghost" showLabel />
                  <CopyButton text="Subtle" variant="subtle" showLabel />
                </div>
              </div>

              {/* Copy Field */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Copy Field
                </h4>
                <div className="max-w-md space-y-4">
                  <CopyField
                    label="API Key"
                    value="sk-1234567890abcdef"
                    maskValue
                    showToggle
                  />
                  <CopyField
                    label="Installation Command"
                    value="npm install @rustpress/ui"
                  />
                </div>
              </div>

              {/* Copy Link */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Copy Link
                </h4>
                <CopyLink
                  url="https://example.com/very-long-url-that-will-be-truncated"
                  maxLength={40}
                />
              </div>

              {/* Share Button */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Share Button
                </h4>
                <div className="flex gap-4">
                  <ShareButton url="https://rustpress.com" title="Check out RustPress!" />
                  <ShareButton url="https://rustpress.com" variant="outline" />
                </div>
              </div>

              {/* Copy Code Block */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Copy Code Block
                </h4>
                <CopyCodeBlock
                  code={sampleCode}
                  language="typescript"
                  showLineNumbers
                  highlightLines={[2, 3]}
                />
              </div>

              {/* Inline Copy */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Inline Copy
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your user ID is <InlineCopy text="usr_abc123xyz" /> - click to copy.
                </p>
              </div>
            </div>
          </DemoSection>

          {/* 95 - Highlight */}
          <DemoSection
            title="95. Highlight Components"
            description="Text highlighting and search result emphasis"
          >
            <div className="space-y-8">
              {/* Search Highlight */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Search Highlight
                </h4>
                <p className="text-neutral-700 dark:text-neutral-300">
                  <Highlight query="React">
                    RustPress uses React for its admin interface, making it easy to build
                    custom React components that integrate seamlessly.
                  </Highlight>
                </p>
              </div>

              {/* Mark Component */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Mark Variants
                </h4>
                <div className="space-y-2">
                  <p>
                    <Mark color="yellow">Yellow highlight</Mark> - Default
                  </p>
                  <p>
                    <Mark color="green">Green highlight</Mark> - Success
                  </p>
                  <p>
                    <Mark color="blue">Blue highlight</Mark> - Info
                  </p>
                  <p>
                    <Mark color="pink">Pink highlight</Mark> - Accent
                  </p>
                  <p>
                    <Mark color="orange" variant="underline">Underline style</Mark>
                  </p>
                  <p>
                    <Mark color="purple" variant="box">Box style</Mark>
                  </p>
                </div>
              </div>

              {/* Gradient Text */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Gradient Text
                </h4>
                <div className="space-y-4">
                  <p className="text-2xl font-bold">
                    <GradientText>Beautiful Gradient Text</GradientText>
                  </p>
                  <p className="text-2xl font-bold">
                    <GradientText from="#f97316" via="#ef4444" to="#ec4899" animate>
                      Animated Gradient
                    </GradientText>
                  </p>
                </div>
              </div>

              {/* Text Emphasis */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Text Emphasis
                </h4>
                <p className="text-neutral-700 dark:text-neutral-300 space-x-2">
                  <TextEmphasis type="strong">Bold text</TextEmphasis>
                  <TextEmphasis type="em">Italic text</TextEmphasis>
                  <TextEmphasis type="underline">Underlined</TextEmphasis>
                  <TextEmphasis type="strikethrough">Strikethrough</TextEmphasis>
                  <TextEmphasis type="code">code()</TextEmphasis>
                </p>
              </div>

              {/* Code Highlight */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Code Syntax Highlighting
                </h4>
                <CodeHighlight
                  code={sampleCode}
                  language="typescript"
                  showLineNumbers
                  highlightLines={[2]}
                  theme="dark"
                />
              </div>

              {/* Search Highlight with Context */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Search Result Highlight
                </h4>
                <SearchHighlight
                  text="RustPress is a modern content management system built with Rust for the backend and React for the frontend. It provides excellent performance and developer experience."
                  searchTerms={['Rust', 'React']}
                  maxLength={150}
                  contextLength={30}
                />
              </div>
            </div>
          </DemoSection>

          {/* 96 - Portal */}
          <DemoSection
            title="96. Portal Components"
            description="Render content outside the normal DOM hierarchy"
          >
            <div className="space-y-8">
              {/* Modal Portal */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Modal Portal
                </h4>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Open Modal
                </button>
                <ModalPortal
                  open={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  size="md"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                      Modal Title
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      This modal is rendered through a portal, outside the normal DOM hierarchy.
                      It includes focus trapping and escape key handling.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </ModalPortal>
              </div>

              {/* Drawer Portal */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Drawer Portal
                </h4>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700"
                >
                  Open Drawer
                </button>
                <DrawerPortal
                  open={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  position="right"
                  size="md"
                >
                  <div className="p-6 h-full">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                      Drawer Panel
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      This drawer slides in from the right side of the screen.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <h4 className="font-medium mb-2">Navigation Item 1</h4>
                        <p className="text-sm text-neutral-500">Description here</p>
                      </div>
                      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <h4 className="font-medium mb-2">Navigation Item 2</h4>
                        <p className="text-sm text-neutral-500">Description here</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="mt-6 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 w-full"
                    >
                      Close Drawer
                    </button>
                  </div>
                </DrawerPortal>
              </div>

              {/* Focus Trap Demo */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                  Focus Trap
                </h4>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    The FocusTrap component keeps focus within its children when active.
                    Try tabbing through these buttons:
                  </p>
                  <FocusTrap active>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-white dark:bg-neutral-700 border rounded">
                        First
                      </button>
                      <button className="px-3 py-1 bg-white dark:bg-neutral-700 border rounded">
                        Second
                      </button>
                      <button className="px-3 py-1 bg-white dark:bg-neutral-700 border rounded">
                        Third
                      </button>
                    </div>
                  </FocusTrap>
                </div>
              </div>
            </div>
          </DemoSection>

          {/* Summary */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Components 89-96 Complete!</h2>
            <p className="text-primary-100 mb-6">
              These interaction and layout helper components provide essential UI patterns
              for building accessible, user-friendly interfaces.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">89. Tooltip</div>
                <div className="text-primary-200">Rich tooltips</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">90. Kbd</div>
                <div className="text-primary-200">Keyboard shortcuts</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">91. Separator</div>
                <div className="text-primary-200">Visual dividers</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">92. AspectRatio</div>
                <div className="text-primary-200">Media ratios</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">93. Collapsible</div>
                <div className="text-primary-200">Expandable sections</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">94. CopyButton</div>
                <div className="text-primary-200">Clipboard utilities</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">95. Highlight</div>
                <div className="text-primary-200">Text emphasis</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">96. Portal</div>
                <div className="text-primary-200">DOM portals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HotkeyProvider>
  );
}
