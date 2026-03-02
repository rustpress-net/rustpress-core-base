import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostStore } from '../../store/postStore';
import PostMetadataSidebar from './PostMetadataSidebar';
import {
  Code,
  Eye,
  Settings,
  Save,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelRightClose,
  Undo,
  Redo,
  Copy,
  FileText,
  Sparkles,
  Palette,
  Image,
  Link,
  Table,
  Video,
  Music,
  Quote,
  List,
  Heading,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  ImagePlus,
  BarChart3,
  User,
  Calendar,
  Tag,
  Folder,
  Globe,
  Lock,
  FileEdit,
  Layout,
  MessageSquare,
  Share2,
  Search,
  Zap,
  Target,
  TrendingUp,
  Hash,
  AtSign,
  Bookmark,
  Star,
  Flag,
  Bell,
  Layers,
  Grid,
  Type,
  PenTool,
  GripVertical,
  X,
  Plus,
  Check,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  GripHorizontal,
  Brain,
  Wand2,
  Languages,
  FileSearch,
  MessageCircle
} from 'lucide-react';
import clsx from 'clsx';

// Import new components
import { FeaturedImageSection, type FeaturedImageData } from './FeaturedImageSection';
import { MacroInfoPanel, type PostStats, type PostMeta } from './MacroInfoPanel';
import { PostMetadata, type PostMetadataData } from './PostMetadata';
import {
  CategoriesPanel,
  TagsPanel,
  VisibilityPanel,
  SchedulePanel,
  ExcerptPanel,
  SlugPanel,
  DiscussionPanel,
  RevisionsPanel,
  SEOMetaPanel,
  SocialMetaPanel,
  CustomFieldsPanel,
  PostFormatPanel,
  TemplatePanel,
  AttributesPanel,
  RelatedPostsPanel,
  SeriesPanel,
  LocationPanel,
  LanguagePanel,
  // Configuration panels
  CarouselConfigPanel,
  GalleryConfigPanel,
  BeforeAfterConfigPanel,
  TableConfigPanel,
  EmbedConfigPanel,
  SEOAnalyzerConfigPanel,
  ReadabilityConfigPanel,
  KeywordsConfigPanel,
  HeadingsConfigPanel,
  SchemaMarkupConfigPanel,
  InternalLinksConfigPanel,
  LinkCheckerConfigPanel,
  DevicePreviewConfigPanel,
  SocialPreviewConfigPanel,
  ContentOutlineConfigPanel,
  VersionHistoryConfigPanel,
  AnalyticsConfigPanel,
  CollaborationConfigPanel,
  ImageOptimizerConfigPanel,
  PluginsConfigPanel,
} from './panels';

// Import all enhancement components
import EditorBlockToolbar from './toolbars/EditorBlockToolbar';
import FloatingFormatToolbar from './toolbars/FloatingFormatToolbar';
import QuickInsertToolbar from './toolbars/QuickInsertToolbar';
import WordCountTracker from './toolbars/WordCountTracker';
import ContentOutline from './toolbars/ContentOutline';
import LivePreview from './preview/LivePreview';
import DevicePreview from './preview/DevicePreview';
import SocialPreview from './preview/SocialPreview';
import SEOAnalyzer from './seo/SEOAnalyzer';
import ReadabilityScore from './seo/ReadabilityScore';
import SchemaMarkup from './seo/SchemaMarkup';
import HeadingStructure from './seo/HeadingStructure';
import KeywordDensity from './seo/KeywordDensity';
import InternalLinking from './seo/InternalLinking';
import VersionTimeline from './versioning/VersionTimeline';
import VersionCompare from './versioning/VersionCompare';
import AutosaveIndicator from './versioning/AutosaveIndicator';
import AnimationsLibrary from './blocks/AnimationsLibrary';
import ContentCarousel from './blocks/ContentCarousel';
import BeforeAfterSlider from './blocks/BeforeAfterSlider';
import GalleryGrid from './blocks/GalleryGrid';
import TableEditor from './blocks/TableEditor';
import ImageOptimizer from './blocks/ImageOptimizer';
import EmbedPreview from './blocks/EmbedPreview';
import MediaLibraryPanel from './blocks/MediaLibraryPanel';
import CollaborativeEditing from './advanced/CollaborativeEditing';
import ContentTemplates from './advanced/ContentTemplates';
import PluginIntegration from './integrations/PluginIntegration';
import ContentAnalytics from './analytics/ContentAnalytics';
import LinkChecker from './tools/LinkChecker';

// Import popup modals
import {
  BlockLibraryModal,
  VisualElementsModal,
  SEOAnalysisModal,
  PreviewOptionsModal,
  PostSettingsModal,
  MetadataSEOModal,
  AdvancedModal,
  AIToolsModal,
} from './modals';

type EditorTab = 'visual' | 'blocks' | 'html';
type SidebarPanel =
  | 'blocks'
  | 'animations'
  | 'media'
  | 'templates'
  | 'carousel'
  | 'gallery'
  | 'table'
  | 'embed'
  | 'slider'
  | 'seo'
  | 'readability'
  | 'schema'
  | 'headings'
  | 'keywords'
  | 'links'
  | 'linkchecker'
  | 'versions'
  | 'compare'
  | 'analytics'
  | 'collaboration'
  | 'plugins'
  | 'images'
  | 'devices'
  | 'social'
  | 'outline'
  | 'metadata'
  | 'featuredImage'
  | 'categories'
  | 'tags'
  | 'visibility'
  | 'schedule'
  | 'excerpt'
  | 'slug'
  | 'discussion'
  | 'revisions'
  | 'seoMeta'
  | 'socialMeta'
  | 'customFields'
  | 'postFormat'
  | 'template'
  | 'attributes'
  | 'related'
  | 'series'
  | 'location'
  | 'language'
  | 'postSettings'
  // Configuration panel types
  | 'carouselConfig'
  | 'galleryConfig'
  | 'sliderConfig'
  | 'tableConfig'
  | 'embedConfig'
  | 'seoConfig'
  | 'readabilityConfig'
  | 'keywordsConfig'
  | 'headingsConfig'
  | 'schemaConfig'
  | 'linksConfig'
  | 'linkCheckerConfig'
  | 'devicesConfig'
  | 'socialConfig'
  | 'outlineConfig'
  | 'versionsConfig'
  | 'analyticsConfig'
  | 'collaborationConfig'
  | 'imagesConfig'
  | 'pluginsConfig'
  | null;

// Popup modal types
type PopupModalType =
  | 'block-library'
  | 'visual-elements'
  | 'seo-analysis'
  | 'preview-options'
  | 'post-settings'
  | 'metadata-seo'
  | 'advanced'
  | 'ai-tools'
  | null;

// Active modal state with initial tab
interface ActiveModalState {
  type: PopupModalType;
  initialTab?: string;
  hideTabs?: boolean;
}

// Content block types for block editor
type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'code' | 'divider' | 'embed' | 'table' | 'gallery';

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  settings?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6; // for headings
    listType?: 'ordered' | 'unordered'; // for lists
    language?: string; // for code blocks
    alt?: string; // for images
    caption?: string; // for images, quotes
    alignment?: 'left' | 'center' | 'right';
  };
}

// Mapping from individual tool IDs to modal config (type + initial tab)
const toolToModalConfig: Record<string, { type: PopupModalType; initialTab: string }> = {
  // Block Library
  'blocks': { type: 'block-library', initialTab: 'blocks' },
  'animations': { type: 'block-library', initialTab: 'animations' },
  'templates': { type: 'block-library', initialTab: 'templates' },
  'media': { type: 'block-library', initialTab: 'media' },
  // Visual Elements
  'carousel': { type: 'visual-elements', initialTab: 'carousel' },
  'gallery': { type: 'visual-elements', initialTab: 'gallery' },
  'slider': { type: 'visual-elements', initialTab: 'before-after' },
  'table': { type: 'visual-elements', initialTab: 'table' },
  'embed': { type: 'visual-elements', initialTab: 'embed' },
  // SEO & Analysis
  'seo': { type: 'seo-analysis', initialTab: 'seo' },
  'readability': { type: 'seo-analysis', initialTab: 'readability' },
  'keywords': { type: 'seo-analysis', initialTab: 'keywords' },
  'headings': { type: 'seo-analysis', initialTab: 'headings' },
  'schema': { type: 'seo-analysis', initialTab: 'schema' },
  'links': { type: 'seo-analysis', initialTab: 'links' },
  'linkchecker': { type: 'seo-analysis', initialTab: 'checker' },
  // Preview Options
  'devices': { type: 'preview-options', initialTab: 'device' },
  'social': { type: 'preview-options', initialTab: 'social' },
  'outline': { type: 'preview-options', initialTab: 'outline' },
  // Post Settings
  'featuredImage': { type: 'post-settings', initialTab: 'featured' },
  'metadata': { type: 'post-settings', initialTab: 'featured' },
  'categories': { type: 'post-settings', initialTab: 'categories' },
  'tags': { type: 'post-settings', initialTab: 'tags' },
  'visibility': { type: 'post-settings', initialTab: 'visibility' },
  'schedule': { type: 'post-settings', initialTab: 'schedule' },
  'excerpt': { type: 'post-settings', initialTab: 'excerpt' },
  'slug': { type: 'post-settings', initialTab: 'slug' },
  'discussion': { type: 'post-settings', initialTab: 'discussion' },
  'revisions': { type: 'post-settings', initialTab: 'revisions' },
  // Metadata & SEO
  'seoMeta': { type: 'metadata-seo', initialTab: 'seo' },
  'socialMeta': { type: 'metadata-seo', initialTab: 'social' },
  'customFields': { type: 'metadata-seo', initialTab: 'custom-fields' },
  'postFormat': { type: 'metadata-seo', initialTab: 'format' },
  'template': { type: 'metadata-seo', initialTab: 'template' },
  'attributes': { type: 'metadata-seo', initialTab: 'attributes' },
  'related': { type: 'metadata-seo', initialTab: 'related' },
  'series': { type: 'metadata-seo', initialTab: 'series' },
  'location': { type: 'metadata-seo', initialTab: 'location' },
  'language': { type: 'metadata-seo', initialTab: 'language' },
  // Advanced
  'versions': { type: 'advanced', initialTab: 'history' },
  'compare': { type: 'advanced', initialTab: 'compare' },
  'analytics': { type: 'advanced', initialTab: 'analytics' },
  'collaboration': { type: 'advanced', initialTab: 'collaboration' },
  'images': { type: 'advanced', initialTab: 'optimizer' },
  'plugins': { type: 'advanced', initialTab: 'plugins' },
  // AI Tools
  'ai': { type: 'ai-tools', initialTab: 'assistant' },
  'aiAssistant': { type: 'ai-tools', initialTab: 'assistant' },
  'aiGenerate': { type: 'ai-tools', initialTab: 'generate' },
  'aiImage': { type: 'ai-tools', initialTab: 'image' },
  'aiSeo': { type: 'ai-tools', initialTab: 'seo' },
  'aiTranslate': { type: 'ai-tools', initialTab: 'translate' },
  'aiSummarize': { type: 'ai-tools', initialTab: 'summarize' },
};

// PostEditorProps removed — component is now self-managing via usePostStore + useParams

// Static Tailwind color class lookup to avoid dynamic class purging
const toolColorClasses: Record<string, { bg: string; text: string; darkBg: string; darkText: string; iconText: string; dot: string }> = {
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-700',    darkBg: 'dark:bg-blue-900/30',    darkText: 'dark:text-blue-400',    iconText: 'text-blue-600',    dot: 'bg-blue-500' },
  purple:  { bg: 'bg-purple-100',  text: 'text-purple-700',  darkBg: 'dark:bg-purple-900/30',  darkText: 'dark:text-purple-400',  iconText: 'text-purple-600',  dot: 'bg-purple-500' },
  green:   { bg: 'bg-green-100',   text: 'text-green-700',   darkBg: 'dark:bg-green-900/30',   darkText: 'dark:text-green-400',   iconText: 'text-green-600',   dot: 'bg-green-500' },
  pink:    { bg: 'bg-pink-100',    text: 'text-pink-700',    darkBg: 'dark:bg-pink-900/30',    darkText: 'dark:text-pink-400',    iconText: 'text-pink-600',    dot: 'bg-pink-500' },
  indigo:  { bg: 'bg-indigo-100',  text: 'text-indigo-700',  darkBg: 'dark:bg-indigo-900/30',  darkText: 'dark:text-indigo-400',  iconText: 'text-indigo-600',  dot: 'bg-indigo-500' },
  cyan:    { bg: 'bg-cyan-100',    text: 'text-cyan-700',    darkBg: 'dark:bg-cyan-900/30',    darkText: 'dark:text-cyan-400',    iconText: 'text-cyan-600',    dot: 'bg-cyan-500' },
  teal:    { bg: 'bg-teal-100',    text: 'text-teal-700',    darkBg: 'dark:bg-teal-900/30',    darkText: 'dark:text-teal-400',    iconText: 'text-teal-600',    dot: 'bg-teal-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-400', iconText: 'text-emerald-600', dot: 'bg-emerald-500' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-700',  darkBg: 'dark:bg-violet-900/30',  darkText: 'dark:text-violet-400',  iconText: 'text-violet-600',  dot: 'bg-violet-500' },
  orange:  { bg: 'bg-orange-100',  text: 'text-orange-700',  darkBg: 'dark:bg-orange-900/30',  darkText: 'dark:text-orange-400',  iconText: 'text-orange-600',  dot: 'bg-orange-500' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   darkBg: 'dark:bg-amber-900/30',   darkText: 'dark:text-amber-400',   iconText: 'text-amber-600',   dot: 'bg-amber-500' },
  lime:    { bg: 'bg-lime-100',    text: 'text-lime-700',    darkBg: 'dark:bg-lime-900/30',    darkText: 'dark:text-lime-400',    iconText: 'text-lime-600',    dot: 'bg-lime-500' },
  sky:     { bg: 'bg-sky-100',     text: 'text-sky-700',     darkBg: 'dark:bg-sky-900/30',     darkText: 'dark:text-sky-400',     iconText: 'text-sky-600',     dot: 'bg-sky-500' },
  rose:    { bg: 'bg-rose-100',    text: 'text-rose-700',    darkBg: 'dark:bg-rose-900/30',    darkText: 'dark:text-rose-400',    iconText: 'text-rose-600',    dot: 'bg-rose-500' },
  fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', darkBg: 'dark:bg-fuchsia-900/30', darkText: 'dark:text-fuchsia-400', iconText: 'text-fuchsia-600', dot: 'bg-fuchsia-500' },
  red:     { bg: 'bg-red-100',     text: 'text-red-700',     darkBg: 'dark:bg-red-900/30',     darkText: 'dark:text-red-400',     iconText: 'text-red-600',     dot: 'bg-red-500' },
  gray:    { bg: 'bg-gray-100',    text: 'text-gray-700',    darkBg: 'dark:bg-gray-900/30',    darkText: 'dark:text-gray-400',    iconText: 'text-gray-600',    dot: 'bg-gray-500' },
  zinc:    { bg: 'bg-zinc-100',    text: 'text-zinc-700',    darkBg: 'dark:bg-zinc-900/30',    darkText: 'dark:text-zinc-400',    iconText: 'text-zinc-600',    dot: 'bg-zinc-500' },
  slate:   { bg: 'bg-slate-100',   text: 'text-slate-700',   darkBg: 'dark:bg-slate-900/30',   darkText: 'dark:text-slate-400',   iconText: 'text-slate-600',   dot: 'bg-slate-500' },
};

const toolbarGroups = [
  {
    id: 'content',
    label: 'Content Blocks',
    tools: [
      { id: 'blocks', icon: Sparkles, label: 'Block Library', color: 'blue' },
      { id: 'animations', icon: Palette, label: 'Animations (55+)', color: 'purple' },
      { id: 'templates', icon: FileText, label: 'Templates', color: 'green' },
      { id: 'media', icon: Image, label: 'Media Library', color: 'pink' },
    ]
  },
  {
    id: 'visual',
    label: 'Visual Elements',
    tools: [
      { id: 'carousel', icon: Image, label: 'Carousel', color: 'indigo', configId: 'carouselConfig' },
      { id: 'gallery', icon: Image, label: 'Gallery Grid', color: 'cyan', configId: 'galleryConfig' },
      { id: 'slider', icon: Image, label: 'Before/After', color: 'teal', configId: 'sliderConfig' },
      { id: 'table', icon: Table, label: 'Table Editor', color: 'emerald', configId: 'tableConfig' },
      { id: 'embed', icon: Video, label: 'Embeds', color: 'violet', configId: 'embedConfig' },
    ]
  },
  {
    id: 'seo',
    label: 'SEO & Analysis',
    tools: [
      { id: 'seo', icon: FileText, label: 'SEO Analyzer', color: 'orange', configId: 'seoConfig' },
      { id: 'readability', icon: FileText, label: 'Readability', color: 'amber', configId: 'readabilityConfig' },
      { id: 'keywords', icon: FileText, label: 'Keywords', color: 'lime', configId: 'keywordsConfig' },
      { id: 'headings', icon: Heading, label: 'Headings', color: 'sky', configId: 'headingsConfig' },
      { id: 'schema', icon: Code, label: 'Schema Markup', color: 'rose', configId: 'schemaConfig' },
      { id: 'links', icon: Link, label: 'Internal Links', color: 'fuchsia', configId: 'linksConfig' },
      { id: 'linkchecker', icon: Link, label: 'Link Checker', color: 'red', configId: 'linkCheckerConfig' },
    ]
  },
  {
    id: 'preview',
    label: 'Preview Options',
    tools: [
      { id: 'devices', icon: Eye, label: 'Device Preview', color: 'blue', configId: 'devicesConfig' },
      { id: 'social', icon: Eye, label: 'Social Preview', color: 'sky', configId: 'socialConfig' },
      { id: 'outline', icon: List, label: 'Content Outline', color: 'slate', configId: 'outlineConfig' },
    ]
  },
  {
    id: 'post',
    label: 'Post Settings',
    tools: [
      { id: 'featuredImage', icon: ImagePlus, label: 'Featured Image', color: 'pink' },
      { id: 'metadata', icon: User, label: 'Author & Info', color: 'indigo' },
      { id: 'categories', icon: Folder, label: 'Categories', color: 'amber' },
      { id: 'tags', icon: Tag, label: 'Tags', color: 'cyan' },
      { id: 'visibility', icon: Globe, label: 'Visibility', color: 'green' },
      { id: 'schedule', icon: Calendar, label: 'Schedule', color: 'blue' },
      { id: 'excerpt', icon: FileEdit, label: 'Excerpt', color: 'purple' },
      { id: 'slug', icon: Link, label: 'URL Slug', color: 'teal' },
      { id: 'discussion', icon: MessageSquare, label: 'Discussion', color: 'orange' },
      { id: 'revisions', icon: Clock, label: 'Revisions', color: 'gray' },
    ]
  },
  {
    id: 'metadata',
    label: 'Metadata & SEO',
    tools: [
      { id: 'seoMeta', icon: Search, label: 'SEO Settings', color: 'orange' },
      { id: 'socialMeta', icon: Share2, label: 'Social Sharing', color: 'blue' },
      { id: 'customFields', icon: Hash, label: 'Custom Fields', color: 'purple' },
      { id: 'postFormat', icon: Layout, label: 'Post Format', color: 'pink' },
      { id: 'template', icon: Grid, label: 'Template', color: 'indigo' },
      { id: 'attributes', icon: Layers, label: 'Attributes', color: 'teal' },
      { id: 'related', icon: Bookmark, label: 'Related Posts', color: 'amber' },
      { id: 'series', icon: Layers, label: 'Series', color: 'cyan' },
      { id: 'location', icon: Target, label: 'Location', color: 'green' },
      { id: 'language', icon: Globe, label: 'Language', color: 'sky' },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced',
    tools: [
      { id: 'versions', icon: Clock, label: 'Version History', color: 'gray', configId: 'versionsConfig' },
      { id: 'compare', icon: FileText, label: 'Compare Versions', color: 'zinc' },
      { id: 'analytics', icon: FileText, label: 'Analytics', color: 'blue', configId: 'analyticsConfig' },
      { id: 'collaboration', icon: FileText, label: 'Collaboration', color: 'green', configId: 'collaborationConfig' },
      { id: 'images', icon: Image, label: 'Image Optimizer', color: 'amber', configId: 'imagesConfig' },
      { id: 'plugins', icon: Sparkles, label: 'Plugins', color: 'purple', configId: 'pluginsConfig' },
    ]
  },
  {
    id: 'ai',
    label: 'AI Enhancement',
    tools: [
      { id: 'aiAssistant', icon: Brain, label: 'AI Writing Assistant', color: 'violet' },
      { id: 'aiGenerate', icon: Wand2, label: 'AI Content Generator', color: 'purple' },
      { id: 'aiImage', icon: Image, label: 'AI Image Tools', color: 'pink' },
      { id: 'aiSeo', icon: Search, label: 'AI SEO Optimizer', color: 'orange' },
      { id: 'aiTranslate', icon: Languages, label: 'AI Translator', color: 'blue' },
      { id: 'aiSummarize', icon: FileSearch, label: 'AI Summarizer', color: 'teal' },
    ]
  }
];

// Available shortcuts for header customization
const availableShortcuts = [
  // Post Settings
  { id: 'featuredImage', icon: ImagePlus, label: 'Featured Image', color: 'pink', category: 'Post Settings' },
  { id: 'categories', icon: Folder, label: 'Categories', color: 'amber', category: 'Post Settings' },
  { id: 'tags', icon: Tag, label: 'Tags', color: 'cyan', category: 'Post Settings' },
  { id: 'schedule', icon: Calendar, label: 'Schedule', color: 'blue', category: 'Post Settings' },
  { id: 'visibility', icon: Globe, label: 'Visibility', color: 'green', category: 'Post Settings' },
  { id: 'excerpt', icon: FileEdit, label: 'Excerpt', color: 'purple', category: 'Post Settings' },
  { id: 'slug', icon: Link, label: 'URL Slug', color: 'teal', category: 'Post Settings' },
  { id: 'discussion', icon: MessageSquare, label: 'Discussion', color: 'orange', category: 'Post Settings' },
  { id: 'revisions', icon: Clock, label: 'Revisions', color: 'gray', category: 'Post Settings' },
  // Metadata & SEO
  { id: 'seoMeta', icon: Search, label: 'SEO Settings', color: 'orange', category: 'Metadata & SEO' },
  { id: 'socialMeta', icon: Share2, label: 'Social Sharing', color: 'blue', category: 'Metadata & SEO' },
  { id: 'customFields', icon: Hash, label: 'Custom Fields', color: 'purple', category: 'Metadata & SEO' },
  { id: 'postFormat', icon: Layout, label: 'Post Format', color: 'pink', category: 'Metadata & SEO' },
  { id: 'template', icon: Grid, label: 'Template', color: 'indigo', category: 'Metadata & SEO' },
  { id: 'attributes', icon: Layers, label: 'Attributes', color: 'teal', category: 'Metadata & SEO' },
  { id: 'related', icon: Bookmark, label: 'Related Posts', color: 'amber', category: 'Metadata & SEO' },
  { id: 'series', icon: Layers, label: 'Series', color: 'cyan', category: 'Metadata & SEO' },
  { id: 'location', icon: Target, label: 'Location', color: 'green', category: 'Metadata & SEO' },
  { id: 'language', icon: Globe, label: 'Language', color: 'sky', category: 'Metadata & SEO' },
  // Content & Visual
  { id: 'metadata', icon: User, label: 'Author & Info', color: 'indigo', category: 'Content' },
  { id: 'carousel', icon: Image, label: 'Carousel', color: 'indigo', category: 'Visual Elements' },
  { id: 'gallery', icon: Image, label: 'Gallery', color: 'cyan', category: 'Visual Elements' },
  { id: 'table', icon: Table, label: 'Table Editor', color: 'emerald', category: 'Visual Elements' },
  { id: 'embed', icon: Video, label: 'Embeds', color: 'violet', category: 'Visual Elements' },
  // SEO & Analysis
  { id: 'seo', icon: FileText, label: 'SEO Analyzer', color: 'orange', category: 'SEO & Analysis' },
  { id: 'readability', icon: FileText, label: 'Readability', color: 'amber', category: 'SEO & Analysis' },
  { id: 'keywords', icon: FileText, label: 'Keywords', color: 'lime', category: 'SEO & Analysis' },
  { id: 'headings', icon: Heading, label: 'Headings', color: 'sky', category: 'SEO & Analysis' },
  { id: 'schema', icon: Code, label: 'Schema Markup', color: 'rose', category: 'SEO & Analysis' },
  { id: 'links', icon: Link, label: 'Internal Links', color: 'fuchsia', category: 'SEO & Analysis' },
  // Preview & Advanced
  { id: 'devices', icon: Eye, label: 'Device Preview', color: 'blue', category: 'Preview' },
  { id: 'social', icon: Eye, label: 'Social Preview', color: 'sky', category: 'Preview' },
  { id: 'outline', icon: List, label: 'Content Outline', color: 'slate', category: 'Preview' },
  { id: 'versions', icon: Clock, label: 'Version History', color: 'gray', category: 'Advanced' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'blue', category: 'Advanced' },
  { id: 'collaboration', icon: User, label: 'Collaboration', color: 'green', category: 'Advanced' },
  // AI Enhancement
  { id: 'aiAssistant', icon: Brain, label: 'AI Writing Assistant', color: 'violet', category: 'AI Enhancement' },
  { id: 'aiGenerate', icon: Wand2, label: 'AI Content Generator', color: 'purple', category: 'AI Enhancement' },
  { id: 'aiImage', icon: Image, label: 'AI Image Tools', color: 'pink', category: 'AI Enhancement' },
  { id: 'aiSeo', icon: Search, label: 'AI SEO Optimizer', color: 'orange', category: 'AI Enhancement' },
  { id: 'aiTranslate', icon: Languages, label: 'AI Translator', color: 'blue', category: 'AI Enhancement' },
  { id: 'aiSummarize', icon: FileSearch, label: 'AI Summarizer', color: 'teal', category: 'AI Enhancement' },
];

// Default shortcuts
const defaultShortcuts = [
  'featuredImage', 'categories', 'tags', 'schedule', 'visibility', 'excerpt', 'slug', 'discussion',
  'seoMeta', 'socialMeta', 'customFields', 'postFormat', 'template', 'related'
];

// Storage key for persisting user preferences
const SHORTCUTS_STORAGE_KEY = 'rustpress_editor_shortcuts';

export const PostEditor: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = usePostStore();

  // Initialize post from route param
  useEffect(() => {
    if (routeId) {
      store.loadPost(routeId);
    } else {
      store.initNewPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const [activeTab, setActiveTab] = useState<EditorTab>('visual');

  // Derive from store (these are the source of truth now)
  const htmlContent = store.currentPost.content;
  const setHtmlContent = useCallback((val: string) => store.updateField('content', val), [store]);
  const postTitle = store.currentPost.title;
  const setPostTitle = useCallback((val: string) => {
    store.updateField('title', val);
    // Auto-generate slug if slug is empty or was auto-generated
    if (!store.currentPost.slug || store.currentPost.slug === store.generateSlug(store.currentPost.title)) {
      store.updateField('slug', store.generateSlug(val));
    }
  }, [store]);

  // Block editor state
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'paragraph', content: '' }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  // Visual editor ref and initialization tracking
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const visualEditorInitialized = useRef(false);
  const [activePanel, setActivePanel] = useState<SidebarPanel>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);

  // Real-time preview sidebar state (always visible by default)
  const [previewSidebarOpen, setPreviewSidebarOpen] = useState(true);
  const [previewSidebarWidth, setPreviewSidebarWidth] = useState(480);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isResizing, setIsResizing] = useState(false);
  const previewResizeRef = useRef<HTMLDivElement>(null);
  const minPreviewWidth = 320;
  const maxPreviewWidth = 800;

  // Shortcuts customization state
  const [userShortcuts, setUserShortcuts] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultShortcuts;
        }
      }
    }
    return defaultShortcuts;
  });
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [draggedShortcut, setDraggedShortcut] = useState<string | null>(null);

  // Popup modal state with initial tab and hideTabs flag
  const [activeModal, setActiveModal] = useState<ActiveModalState | null>(null);

  // Convert blocks to HTML
  const blocksToHtml = useCallback((blocks: ContentBlock[]): string => {
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return block.content ? `<p>${block.content}</p>` : '';
        case 'heading':
          const level = block.settings?.level || 2;
          return block.content ? `<h${level}>${block.content}</h${level}>` : '';
        case 'image':
          return block.content ? `<figure><img src="${block.content}" alt="${block.settings?.alt || ''}" />${block.settings?.caption ? `<figcaption>${block.settings.caption}</figcaption>` : ''}</figure>` : '';
        case 'quote':
          return block.content ? `<blockquote>${block.content}</blockquote>` : '';
        case 'list':
          const tag = block.settings?.listType === 'ordered' ? 'ol' : 'ul';
          return block.content ? `<${tag}>${block.content}</${tag}>` : '';
        case 'code':
          return block.content ? `<pre><code${block.settings?.language ? ` class="language-${block.settings.language}"` : ''}>${block.content}</code></pre>` : '';
        case 'divider':
          return '<hr />';
        case 'embed':
          return block.content ? `<div class="embed">${block.content}</div>` : '';
        case 'table':
          return block.content ? `<table>${block.content}</table>` : '';
        case 'gallery':
          return block.content ? `<div class="gallery">${block.content}</div>` : '';
        default:
          return block.content ? `<p>${block.content}</p>` : '';
      }
    }).filter(Boolean).join('\n');
  }, []);

  // Parse HTML to blocks
  const htmlToBlocks = useCallback((html: string): ContentBlock[] => {
    if (!html || !html.trim()) {
      return [{ id: Date.now().toString(), type: 'paragraph', content: '' }];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newBlocks: ContentBlock[] = [];

    const processNode = (node: Element) => {
      const tagName = node.tagName.toLowerCase();
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

      switch (tagName) {
        case 'p':
          newBlocks.push({ id, type: 'paragraph', content: node.innerHTML });
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          newBlocks.push({
            id,
            type: 'heading',
            content: node.innerHTML,
            settings: { level: parseInt(tagName[1]) as 1|2|3|4|5|6 }
          });
          break;
        case 'blockquote':
          newBlocks.push({ id, type: 'quote', content: node.innerHTML });
          break;
        case 'ul':
          newBlocks.push({ id, type: 'list', content: node.innerHTML, settings: { listType: 'unordered' } });
          break;
        case 'ol':
          newBlocks.push({ id, type: 'list', content: node.innerHTML, settings: { listType: 'ordered' } });
          break;
        case 'pre':
          const codeEl = node.querySelector('code');
          const langClass = codeEl?.className.match(/language-(\w+)/);
          newBlocks.push({
            id,
            type: 'code',
            content: codeEl?.textContent || node.textContent || '',
            settings: langClass ? { language: langClass[1] } : undefined
          });
          break;
        case 'hr':
          newBlocks.push({ id, type: 'divider', content: '' });
          break;
        case 'figure':
          const img = node.querySelector('img');
          const caption = node.querySelector('figcaption');
          if (img) {
            newBlocks.push({
              id,
              type: 'image',
              content: img.src,
              settings: { alt: img.alt, caption: caption?.textContent || undefined }
            });
          }
          break;
        case 'img':
          newBlocks.push({
            id,
            type: 'image',
            content: (node as HTMLImageElement).src,
            settings: { alt: (node as HTMLImageElement).alt }
          });
          break;
        case 'table':
          newBlocks.push({ id, type: 'table', content: node.innerHTML });
          break;
        case 'div':
          if (node.classList.contains('gallery')) {
            newBlocks.push({ id, type: 'gallery', content: node.innerHTML });
          } else if (node.classList.contains('embed')) {
            newBlocks.push({ id, type: 'embed', content: node.innerHTML });
          } else {
            // Process children for generic divs
            Array.from(node.children).forEach(child => processNode(child as Element));
          }
          break;
        default:
          // For other elements, treat as paragraph
          if (node.textContent?.trim()) {
            newBlocks.push({ id, type: 'paragraph', content: node.innerHTML });
          }
      }
    };

    Array.from(doc.body.children).forEach(child => processNode(child as Element));

    // Return at least one empty paragraph if no blocks were created
    return newBlocks.length > 0 ? newBlocks : [{ id: Date.now().toString(), type: 'paragraph', content: '' }];
  }, []);

  // Handle tab change with sync
  const handleTabChange = useCallback((newTab: EditorTab) => {
    const prevTab = activeTab;

    // Sync content when switching tabs
    if (prevTab === 'blocks' && (newTab === 'visual' || newTab === 'html')) {
      // Convert blocks to HTML
      const html = blocksToHtml(blocks);
      setHtmlContent(html);
      // Update visual editor if switching to it
      if (newTab === 'visual' && visualEditorRef.current) {
        visualEditorRef.current.innerHTML = html || '<p>Start writing here...</p>';
      }
    } else if (prevTab === 'visual' && newTab === 'blocks') {
      // Parse HTML to blocks
      const newBlocks = htmlToBlocks(htmlContent);
      setBlocks(newBlocks);
    } else if (prevTab === 'html' && newTab === 'blocks') {
      // Parse HTML to blocks
      const newBlocks = htmlToBlocks(htmlContent);
      setBlocks(newBlocks);
    } else if (prevTab === 'html' && newTab === 'visual') {
      // Update visual editor with HTML
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = htmlContent || '<p>Start writing here...</p>';
      }
    } else if (prevTab === 'visual' && newTab === 'html') {
      // HTML content is already synced via onInput
    }

    setActiveTab(newTab);
  }, [activeTab, blocks, htmlContent, blocksToHtml, htmlToBlocks]);

  // Save shortcuts to localStorage when they change
  useEffect(() => {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(userShortcuts));
  }, [userShortcuts]);

  // Get shortcut data by ID
  const getShortcutById = useCallback((id: string) => {
    return availableShortcuts.find(s => s.id === id);
  }, []);

  // Add shortcut
  const addShortcut = useCallback((id: string) => {
    if (!userShortcuts.includes(id)) {
      setUserShortcuts([...userShortcuts, id]);
    }
  }, [userShortcuts]);

  // Remove shortcut
  const removeShortcut = useCallback((id: string) => {
    setUserShortcuts(userShortcuts.filter(s => s !== id));
  }, [userShortcuts]);

  // Reorder shortcuts via drag and drop
  const moveShortcut = useCallback((fromIndex: number, toIndex: number) => {
    const newShortcuts = [...userShortcuts];
    const [moved] = newShortcuts.splice(fromIndex, 1);
    newShortcuts.splice(toIndex, 0, moved);
    setUserShortcuts(newShortcuts);
  }, [userShortcuts]);

  // Reset to defaults
  const resetShortcuts = useCallback(() => {
    setUserShortcuts(defaultShortcuts);
  }, []);

  // Featured image state
  const [featuredImage, setFeaturedImage] = useState<FeaturedImageData | undefined>(undefined);
  const [showFeaturedImage, setShowFeaturedImage] = useState(true);

  // Macro info panel state
  const [showMacroInfo, setShowMacroInfo] = useState(true);
  const [macroInfoVariant, setMacroInfoVariant] = useState<'compact' | 'expanded'>('compact');

  // Post metadata state
  const [metadata, setMetadata] = useState<PostMetadataData>({
    author: null,
    coAuthors: [],
    publishDate: null,
    publishTime: '',
    status: 'draft',
    visibility: 'public',
    categories: [],
    tags: [],
    slug: '',
    template: 'default',
    allowComments: true,
    allowPingbacks: true,
    sticky: false,
    format: 'standard',
    excerpt: '',
    customFields: {},
    // Defaults (metadata panel is now powered by PostMetadataSidebar via store)
  });

  // SEO Meta state
  const [seoMeta, setSeoMeta] = useState({
    title: '',
    description: '',
    focusKeyword: '',
    canonicalUrl: '',
    robots: { noindex: false, nofollow: false, noarchive: false, nosnippet: false }
  });

  // Social Meta state
  const [socialMeta, setSocialMeta] = useState({
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image' as 'summary' | 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: ''
  });

  // Custom Fields state
  const [customFieldsList, setCustomFieldsList] = useState<{ id: string; key: string; value: string }[]>([]);

  // Post Format state
  const [postFormatData, setPostFormatData] = useState<Record<string, string>>({});

  // Attributes state
  const [attributes, setAttributes] = useState({
    sticky: false,
    featured: false,
    sponsored: false,
    editorsPick: false,
    customClass: '',
    customId: ''
  });

  // Related Posts state
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);

  // Series state
  const [series, setSeries] = useState<{ id: string | null; order: number }>({ id: null, order: 1 });

  // Location state
  const [location, setLocation] = useState({
    name: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address: ''
  });

  // Language state
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<{ language: string; postId: string }[]>([]);

  // Configuration states for enhancement tools
  const [carouselConfig, setCarouselConfig] = useState({
    autoplay: true,
    autoplaySpeed: 5000,
    effect: 'slide' as 'slide' | 'fade' | 'cube' | 'flip',
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    showNavigation: true,
    showPagination: true,
    showThumbnails: false,
    pauseOnHover: true,
    lazyLoad: true,
  });

  const [galleryConfig, setGalleryConfig] = useState({
    layout: 'grid' as 'grid' | 'masonry' | 'justified' | 'slider',
    columns: 3,
    gap: 16,
    thumbnailSize: 'medium' as 'small' | 'medium' | 'large',
    enableLightbox: true,
    showCaptions: true,
    hoverEffect: 'zoom' as 'none' | 'zoom' | 'fade' | 'slide',
    lazyLoad: true,
    aspectRatio: 'auto' as 'auto' | '1:1' | '4:3' | '16:9',
  });

  const [beforeAfterConfig, setBeforeAfterConfig] = useState({
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    initialPosition: 50,
    showLabels: true,
    beforeLabel: 'Before',
    afterLabel: 'After',
    handleStyle: 'line' as 'line' | 'circle' | 'arrows',
    moveOnHover: false,
    clickToMove: true,
  });

  const [tableConfig, setTableConfig] = useState({
    theme: 'default' as 'default' | 'striped' | 'bordered' | 'minimal',
    headerStyle: 'filled' as 'filled' | 'outline' | 'none',
    enableSorting: true,
    enableFiltering: false,
    enablePagination: false,
    rowsPerPage: 10,
    stickyHeader: false,
    responsive: true,
    compactMode: false,
  });

  const [embedConfig, setEmbedConfig] = useState({
    provider: 'auto' as 'auto' | 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'codepen',
    aspectRatio: '16:9' as '16:9' | '4:3' | '1:1' | '9:16',
    autoplay: false,
    showControls: true,
    loop: false,
    muted: true,
    startTime: 0,
    privacyMode: true,
  });

  const [seoAnalyzerConfig, setSeoAnalyzerConfig] = useState({
    focusKeyword: '',
    enableRealTimeAnalysis: true,
    checkTitleLength: true,
    checkMetaDescription: true,
    checkKeywordDensity: true,
    checkHeadingStructure: true,
    checkImageAlt: true,
    checkInternalLinks: true,
    checkExternalLinks: true,
    minWordCount: 300,
  });

  const [readabilityConfig, setReadabilityConfig] = useState({
    formula: 'flesch-kincaid' as 'flesch-kincaid' | 'gunning-fog' | 'coleman-liau' | 'smog',
    targetGradeLevel: 8,
    highlightComplexSentences: true,
    highlightPassiveVoice: true,
    maxSentenceLength: 25,
    maxParagraphLength: 150,
    showSuggestions: true,
  });

  const [keywordsConfig, setKeywordsConfig] = useState({
    primaryKeyword: '',
    secondaryKeywords: [] as string[],
    targetDensity: { min: 1, max: 3 },
    highlightKeywords: true,
    checkTitlePlacement: true,
    checkFirstParagraph: true,
    checkSubheadings: true,
  });

  const [headingsConfig, setHeadingsConfig] = useState({
    enforceHierarchy: true,
    requireH1: true,
    maxH1Count: 1,
    highlightIssues: true,
    suggestImprovements: true,
    maxHeadingLength: 70,
  });

  const [schemaConfig, setSchemaConfig] = useState({
    schemaType: 'Article' as 'Article' | 'BlogPosting' | 'NewsArticle' | 'HowTo' | 'FAQ' | 'Product' | 'Recipe',
    autoGenerate: true,
    includeAuthor: true,
    includePublisher: true,
    includeDatePublished: true,
    includeImage: true,
    customProperties: {} as Record<string, string>,
  });

  const [internalLinksConfig, setInternalLinksConfig] = useState({
    enableAutoSuggest: true,
    maxSuggestions: 5,
    minRelevanceScore: 0.5,
    linkNewWindow: false,
    addNoFollow: false,
    highlightOrphans: true,
  });

  const [linkCheckerConfig, setLinkCheckerConfig] = useState({
    checkOnSave: true,
    checkOnPublish: true,
    checkSchedule: 'weekly' as 'manual' | 'daily' | 'weekly' | 'monthly',
    checkInternal: true,
    checkExternal: true,
    checkImages: true,
    timeout: 10000,
  });

  const [devicePreviewConfig, setDevicePreviewConfig] = useState({
    defaultDevice: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    showDimensions: true,
    enableZoom: true,
    defaultZoom: 100,
    showDeviceFrame: true,
    enableRotation: true,
  });

  const [socialPreviewConfig, setSocialPreviewConfig] = useState({
    defaultPlatform: 'facebook' as 'facebook' | 'twitter' | 'linkedin' | 'pinterest',
    showCharCount: true,
    maxDescriptionLength: 160,
    enableEditing: true,
    showImageGuidelines: true,
  });

  const [outlineConfig, setOutlineConfig] = useState({
    maxDepth: 3,
    showWordCount: true,
    collapsible: true,
    highlightCurrent: true,
    enableNavigation: true,
    smoothScroll: true,
  });

  const [versionsConfig, setVersionsConfig] = useState({
    maxRevisions: 50,
    autoSaveInterval: 60,
    compareMode: 'inline' as 'inline' | 'side-by-side',
    highlightChanges: true,
    showTimestamps: true,
    showAuthors: true,
  });

  const [analyticsConfig, setAnalyticsConfig] = useState({
    defaultDateRange: '7d' as '24h' | '7d' | '30d' | '90d' | '1y',
    showViews: true,
    showEngagement: true,
    showSocial: true,
    enableComparison: true,
    compareWithPrevious: true,
  });

  const [collaborationConfig, setCollaborationConfig] = useState({
    enableRealTimeEditing: true,
    showPresence: true,
    enableComments: true,
    enableSuggestions: true,
    notifyOnChanges: true,
    conflictResolution: 'auto' as 'auto' | 'manual' | 'last-write-wins',
  });

  const [imageOptimizerConfig, setImageOptimizerConfig] = useState({
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'auto' as 'auto' | 'webp' | 'jpeg' | 'png' | 'avif',
    enableLazyLoad: true,
    generateSrcSet: true,
    compressOnUpload: true,
    preserveMetadata: false,
  });

  const [pluginsConfig, setPluginsConfig] = useState({
    enabledPlugins: [] as string[],
    autoUpdate: true,
    showNotifications: true,
    sandboxMode: false,
    logLevel: 'error' as 'none' | 'error' | 'warn' | 'info' | 'debug',
  });

  // Post meta for MacroInfoPanel
  const postMeta: PostMeta = useMemo(() => ({
    lastSaved: new Date(),
    version: 1,
    revisions: 0,
    status: metadata.status,
  }), [metadata.status]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    if (activeTab === 'html') {
      // HTML Editor mode - insert into textarea
      const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = htmlContent.slice(0, start) + text + htmlContent.slice(end);
        setHtmlContent(newContent);
        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      }
    } else if (activeTab === 'visual') {
      // Visual Editor mode - append to HTML content and update visual editor
      const newContent = htmlContent + '\n' + text;
      setHtmlContent(newContent);
      // Update visual editor content
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = newContent;
      }
    } else if (activeTab === 'blocks') {
      // Block Editor mode - parse HTML and add as new block(s)
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const elements = doc.body.children;

      const newBlocks: ContentBlock[] = [];
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const tagName = el.tagName.toLowerCase();
        let blockType: BlockType = 'paragraph';
        let content = el.innerHTML || el.textContent || '';
        let settings: ContentBlock['settings'] = {};

        if (tagName === 'h1') { blockType = 'heading'; settings.level = 1; content = el.textContent || ''; }
        else if (tagName === 'h2') { blockType = 'heading'; settings.level = 2; content = el.textContent || ''; }
        else if (tagName === 'h3') { blockType = 'heading'; settings.level = 3; content = el.textContent || ''; }
        else if (tagName === 'h4') { blockType = 'heading'; settings.level = 4; content = el.textContent || ''; }
        else if (tagName === 'h5') { blockType = 'heading'; settings.level = 5; content = el.textContent || ''; }
        else if (tagName === 'h6') { blockType = 'heading'; settings.level = 6; content = el.textContent || ''; }
        else if (tagName === 'blockquote') { blockType = 'quote'; }
        else if (tagName === 'ul') { blockType = 'list'; settings.listType = 'unordered'; }
        else if (tagName === 'ol') { blockType = 'list'; settings.listType = 'ordered'; }
        else if (tagName === 'pre') { blockType = 'code'; content = el.textContent || ''; }
        else if (tagName === 'figure' || tagName === 'img') { blockType = 'image'; content = el.querySelector('img')?.getAttribute('src') || ''; }
        else if (tagName === 'hr') { blockType = 'divider'; content = ''; }
        else if (tagName === 'table') { blockType = 'table'; }
        else if (tagName === 'iframe') { blockType = 'embed'; content = el.getAttribute('src') || ''; }
        else { blockType = 'paragraph'; }

        newBlocks.push({
          id: Date.now().toString() + '-' + i,
          type: blockType,
          content,
          settings: Object.keys(settings).length > 0 ? settings : undefined,
        });
      }

      if (newBlocks.length > 0) {
        setBlocks(prev => [...prev, ...newBlocks]);
        setSelectedBlockId(newBlocks[newBlocks.length - 1].id);
      }
    }
  }, [htmlContent, activeTab, blocks]);

  // Open popup modal for a tool
  const openModalForTool = useCallback((toolId: string) => {
    const config = toolToModalConfig[toolId];
    if (config) {
      setActiveModal({
        type: config.type,
        initialTab: config.initialTab,
        hideTabs: true, // Single-tab mode: hide tabs and show only the specific tool's settings
      });
    }
  }, []);

  // Close active modal
  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Preview sidebar resize handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = containerWidth - e.clientX;

      if (newWidth >= minPreviewWidth && newWidth <= maxPreviewWidth) {
        setPreviewSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Toggle preview sidebar
  const togglePreviewSidebar = useCallback(() => {
    setPreviewSidebarOpen(!previewSidebarOpen);
  }, [previewSidebarOpen]);

  // Device dimensions for preview - real dimensions with scaling
  // Desktop uses 1440px width scaled to fit preview panel
  // This gives accurate representation of how content will look
  const deviceDimensions = useMemo(() => {
    const desktopWidth = 1440; // Standard desktop width
    const tabletWidth = 768;   // Standard tablet (iPad) width
    const mobileWidth = 375;   // Standard mobile (iPhone) width

    // Calculate scale factor for desktop to fit in preview panel
    const desktopScale = Math.min(1, (previewSidebarWidth - 32) / desktopWidth);

    return {
      desktop: {
        width: `${desktopWidth}px`,
        maxWidth: `${desktopWidth}px`,
        scale: desktopScale,
        actualWidth: desktopWidth
      },
      tablet: {
        width: `${tabletWidth}px`,
        maxWidth: `${tabletWidth}px`,
        scale: Math.min(1, (previewSidebarWidth - 32) / tabletWidth),
        actualWidth: tabletWidth
      },
      mobile: {
        width: `${mobileWidth}px`,
        maxWidth: `${mobileWidth}px`,
        scale: 1, // Mobile usually fits without scaling
        actualWidth: mobileWidth
      },
    };
  }, [previewSidebarWidth]);

  const handleToolClick = (toolId: SidebarPanel) => {
    // Check if this tool should open a popup modal instead of sidebar
    const config = toolToModalConfig[toolId as string];
    if (config) {
      setActiveModal({
        type: config.type,
        initialTab: config.initialTab,
        hideTabs: true, // Single-tab mode
      });
      return;
    }

    // Fallback to sidebar panel for config panels
    if (activePanel === toolId) {
      setActivePanel(null);
      setRightSidebarOpen(false);
    } else {
      setActivePanel(toolId);
      setRightSidebarOpen(true);
    }
  };

  const renderPanel = () => {
    const panelProps = {
      className: 'h-full',
      content: htmlContent
    };

    switch (activePanel) {
      case 'blocks':
        return <EditorBlockToolbar onInsertBlock={(block: string) => insertAtCursor(block)} {...panelProps} />;
      case 'animations':
        return <AnimationsLibrary {...panelProps} />;
      case 'media':
        return <MediaLibraryPanel onInsert={(item: { url: string; alt?: string }) => insertAtCursor(`<img src="${item.url}" alt="${item.alt || ''}" />`)} {...panelProps} />;
      case 'templates':
        return <ContentTemplates {...panelProps} />;
      case 'carousel':
        return <ContentCarousel {...panelProps} />;
      case 'gallery':
        return <GalleryGrid {...panelProps} />;
      case 'slider':
        return <BeforeAfterSlider {...panelProps} />;
      case 'table':
        return <TableEditor onChange={(data: unknown) => console.log('Table updated:', data)} {...panelProps} />;
      case 'embed':
        return <EmbedPreview {...panelProps} />;
      case 'seo':
        return <SEOAnalyzer title={store.currentPost.title || 'Untitled Post'} {...panelProps} />;
      case 'readability':
        return <ReadabilityScore {...panelProps} />;
      case 'keywords':
        return <KeywordDensity {...panelProps} />;
      case 'headings':
        return <HeadingStructure {...panelProps} />;
      case 'schema':
        return <SchemaMarkup postTitle={store.currentPost.title || 'Untitled Post'} postContent={htmlContent} {...panelProps} />;
      case 'links':
        return <InternalLinking {...panelProps} />;
      case 'linkchecker':
        return <LinkChecker {...panelProps} />;
      case 'devices':
        return <DevicePreview title={store.currentPost.title || 'Untitled Post'} {...panelProps} />;
      case 'social':
        return <SocialPreview title={store.currentPost.title || 'Untitled Post'} description={store.currentPost.excerpt || 'Post description'} {...panelProps} />;
      case 'outline':
        return <ContentOutline {...panelProps} />;
      case 'versions':
        return <VersionTimeline {...panelProps} />;
      case 'compare':
        return <VersionCompare {...panelProps} />;
      case 'analytics':
        return <ContentAnalytics {...panelProps} />;
      case 'collaboration':
        return <CollaborativeEditing {...panelProps} />;
      case 'images':
        return <ImageOptimizer {...panelProps} />;
      case 'plugins':
        return <PluginIntegration {...panelProps} />;
      case 'metadata':
        return (
          <PostMetadata
            data={metadata}
            onChange={setMetadata}
            postTitle={postTitle}
            className="h-full"
          />
        );
      case 'featuredImage':
        return (
          <FeaturedImageSection
            imageUrl={featuredImage?.url}
            imageAlt={featuredImage?.alt}
            imageCaption={featuredImage?.caption}
            onImageChange={setFeaturedImage}
            postTitle={postTitle}
            className="h-full"
          />
        );
      case 'categories':
        return (
          <CategoriesPanel
            selected={metadata.categories}
            onChange={(categories) => setMetadata({ ...metadata, categories })}
          />
        );
      case 'tags':
        return (
          <TagsPanel
            selected={metadata.tags}
            onChange={(tags) => setMetadata({ ...metadata, tags })}
          />
        );
      case 'visibility':
        return (
          <VisibilityPanel
            visibility={metadata.visibility}
            password={metadata.password}
            onChange={(visibility, password) => setMetadata({ ...metadata, visibility, password })}
          />
        );
      case 'schedule':
        return (
          <SchedulePanel
            status={metadata.status}
            publishDate={metadata.publishDate}
            publishTime={metadata.publishTime}
            onChange={(status, publishDate, publishTime) => setMetadata({ ...metadata, status, publishDate, publishTime })}
          />
        );
      case 'excerpt':
        return (
          <ExcerptPanel
            excerpt={metadata.excerpt}
            onChange={(excerpt) => setMetadata({ ...metadata, excerpt })}
            content={htmlContent}
          />
        );
      case 'slug':
        return (
          <SlugPanel
            slug={metadata.slug}
            title={postTitle}
            onChange={(slug) => setMetadata({ ...metadata, slug })}
          />
        );
      case 'discussion':
        return (
          <DiscussionPanel
            allowComments={metadata.allowComments}
            allowPingbacks={metadata.allowPingbacks}
            onChange={(allowComments, allowPingbacks) => setMetadata({ ...metadata, allowComments, allowPingbacks })}
          />
        );
      case 'revisions':
        return (
          <RevisionsPanel
            postId={routeId}
          />
        );
      case 'seoMeta':
        return (
          <SEOMetaPanel
            title={seoMeta.title}
            description={seoMeta.description}
            focusKeyword={seoMeta.focusKeyword}
            canonicalUrl={seoMeta.canonicalUrl}
            robots={seoMeta.robots}
            onChange={setSeoMeta}
            postTitle={postTitle}
          />
        );
      case 'socialMeta':
        return (
          <SocialMetaPanel
            ogTitle={socialMeta.ogTitle}
            ogDescription={socialMeta.ogDescription}
            ogImage={socialMeta.ogImage}
            twitterCard={socialMeta.twitterCard}
            twitterTitle={socialMeta.twitterTitle}
            twitterDescription={socialMeta.twitterDescription}
            twitterImage={socialMeta.twitterImage}
            onChange={setSocialMeta}
            postTitle={postTitle}
          />
        );
      case 'customFields':
        return (
          <CustomFieldsPanel
            fields={customFieldsList}
            onChange={setCustomFieldsList}
          />
        );
      case 'postFormat':
        return (
          <PostFormatPanel
            format={metadata.format as 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio' | 'chat'}
            formatData={postFormatData}
            onChange={(format, data) => {
              setMetadata({ ...metadata, format });
              setPostFormatData(data);
            }}
          />
        );
      case 'template':
        return (
          <TemplatePanel
            selectedTemplate={metadata.template}
            onChange={(template) => setMetadata({ ...metadata, template })}
          />
        );
      case 'attributes':
        return (
          <AttributesPanel
            sticky={attributes.sticky}
            featured={attributes.featured}
            sponsored={attributes.sponsored}
            editorsPick={attributes.editorsPick}
            customClass={attributes.customClass}
            customId={attributes.customId}
            onChange={setAttributes}
          />
        );
      case 'related':
        return (
          <RelatedPostsPanel
            selectedPosts={relatedPosts}
            onChange={setRelatedPosts}
          />
        );
      case 'series':
        return (
          <SeriesPanel
            selectedSeries={series.id}
            seriesOrder={series.order}
            onChange={(id, order) => setSeries({ id, order })}
          />
        );
      case 'location':
        return (
          <LocationPanel
            location={location}
            onChange={setLocation}
          />
        );
      case 'language':
        return (
          <LanguagePanel
            language={language}
            translations={translations}
            onChange={(lang, trans) => {
              setLanguage(lang);
              setTranslations(trans);
            }}
          />
        );
      case 'postSettings':
        return <PostMetadataSidebar />;
      // Configuration panels
      case 'carouselConfig':
        return (
          <CarouselConfigPanel
            config={carouselConfig}
            onChange={setCarouselConfig}
          />
        );
      case 'galleryConfig':
        return (
          <GalleryConfigPanel
            config={galleryConfig}
            onChange={setGalleryConfig}
          />
        );
      case 'sliderConfig':
        return (
          <BeforeAfterConfigPanel
            config={beforeAfterConfig}
            onChange={setBeforeAfterConfig}
          />
        );
      case 'tableConfig':
        return (
          <TableConfigPanel
            config={tableConfig}
            onChange={setTableConfig}
          />
        );
      case 'embedConfig':
        return (
          <EmbedConfigPanel
            config={embedConfig}
            onChange={setEmbedConfig}
          />
        );
      case 'seoConfig':
        return (
          <SEOAnalyzerConfigPanel
            config={seoAnalyzerConfig}
            onChange={setSeoAnalyzerConfig}
          />
        );
      case 'readabilityConfig':
        return (
          <ReadabilityConfigPanel
            config={readabilityConfig}
            onChange={setReadabilityConfig}
          />
        );
      case 'keywordsConfig':
        return (
          <KeywordsConfigPanel
            config={keywordsConfig}
            onChange={setKeywordsConfig}
          />
        );
      case 'headingsConfig':
        return (
          <HeadingsConfigPanel
            config={headingsConfig}
            onChange={setHeadingsConfig}
          />
        );
      case 'schemaConfig':
        return (
          <SchemaMarkupConfigPanel
            config={schemaConfig}
            onChange={setSchemaConfig}
          />
        );
      case 'linksConfig':
        return (
          <InternalLinksConfigPanel
            config={internalLinksConfig}
            onChange={setInternalLinksConfig}
          />
        );
      case 'linkCheckerConfig':
        return (
          <LinkCheckerConfigPanel
            config={linkCheckerConfig}
            onChange={setLinkCheckerConfig}
          />
        );
      case 'devicesConfig':
        return (
          <DevicePreviewConfigPanel
            config={devicePreviewConfig}
            onChange={setDevicePreviewConfig}
          />
        );
      case 'socialConfig':
        return (
          <SocialPreviewConfigPanel
            config={socialPreviewConfig}
            onChange={setSocialPreviewConfig}
          />
        );
      case 'outlineConfig':
        return (
          <ContentOutlineConfigPanel
            config={outlineConfig}
            onChange={setOutlineConfig}
          />
        );
      case 'versionsConfig':
        return (
          <VersionHistoryConfigPanel
            config={versionsConfig}
            onChange={setVersionsConfig}
          />
        );
      case 'analyticsConfig':
        return (
          <AnalyticsConfigPanel
            config={analyticsConfig}
            onChange={setAnalyticsConfig}
          />
        );
      case 'collaborationConfig':
        return (
          <CollaborationConfigPanel
            config={collaborationConfig}
            onChange={setCollaborationConfig}
          />
        );
      case 'imagesConfig':
        return (
          <ImageOptimizerConfigPanel
            config={imageOptimizerConfig}
            onChange={setImageOptimizerConfig}
          />
        );
      case 'pluginsConfig':
        return (
          <PluginsConfigPanel
            config={pluginsConfig}
            onChange={setPluginsConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={clsx(
      'flex flex-col bg-gray-100 dark:bg-gray-950',
      isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'
    )}>
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/posts')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              placeholder="Post Title..."
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-96"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Customizable Shortcuts Bar */}
          <div className="flex items-center gap-0.5 mr-2 border-r pr-3 mr-3">
            {userShortcuts.map((shortcutId) => {
              const shortcut = getShortcutById(shortcutId);
              if (!shortcut) return null;
              const Icon = shortcut.icon;
              const isActive = activePanel === shortcutId;
              return (
                <button
                  key={shortcutId}
                  onClick={() => handleToolClick(shortcutId as SidebarPanel)}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    isActive && toolColorClasses[shortcut.color]
                      ? `${toolColorClasses[shortcut.color].bg} ${toolColorClasses[shortcut.color].iconText} ${toolColorClasses[shortcut.color].darkBg} ${toolColorClasses[shortcut.color].darkText}`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                  )}
                  title={shortcut.label}
                >
                  <Icon size={16} />
                </button>
              );
            })}
            {/* Analytics Toggle */}
            <button
              onClick={() => {
                if (showMacroInfo && macroInfoVariant === 'expanded') {
                  setMacroInfoVariant('compact');
                } else if (showMacroInfo && macroInfoVariant === 'compact') {
                  setShowMacroInfo(false);
                } else {
                  setShowMacroInfo(true);
                  setMacroInfoVariant('compact');
                }
              }}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                showMacroInfo
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
              )}
              title="Toggle Analytics Panel"
            >
              <BarChart3 size={16} />
            </button>
            {/* Customize Shortcuts Button */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 ml-1"
              title="Customize Shortcuts"
            >
              <Settings size={14} />
            </button>
          </div>

          {/* Autosave Indicator */}
          <AutosaveIndicator isDirty={store.isDirty} isSaving={store.isSaving} lastSaved={store.lastSaved || undefined} isOnline={true} />

          {/* Word Count */}
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            {htmlContent.split(/\s+/).filter(Boolean).length} words
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Post Settings Toggle */}
          <button
            onClick={() => {
              if (activePanel === 'postSettings') {
                setActivePanel(null);
                setRightSidebarOpen(false);
              } else {
                setActivePanel('postSettings');
                setRightSidebarOpen(true);
              }
            }}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              activePanel === 'postSettings'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            )}
            title="Post Settings"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={() => store.saveDraft()}
            disabled={store.isSaving}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {store.isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => store.publish()}
            disabled={store.isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />
            {store.isSaving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Top Panel - Macro Info */}
      <AnimatePresence>
        {showMacroInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-900 border-b overflow-hidden"
          >
            <div className="p-4">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                  <button
                    onClick={() => setMacroInfoVariant(macroInfoVariant === 'compact' ? 'expanded' : 'compact')}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title={macroInfoVariant === 'compact' ? 'Expand' : 'Collapse'}
                  >
                    {macroInfoVariant === 'compact' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                </div>
                <MacroInfoPanel
                  content={htmlContent}
                  title={postTitle}
                  postMeta={postMeta}
                  variant={macroInfoVariant}
                  showSEO={macroInfoVariant === 'expanded'}
                  showReadability={macroInfoVariant === 'expanded'}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border-r overflow-y-auto flex-shrink-0"
            >
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Enhancement Tools
                </h3>

                {toolbarGroups.map((group) => (
                  <div key={group.id} className="mb-4">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 px-2">
                      {group.label}
                    </h4>
                    <div className="space-y-1">
                      {group.tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activePanel === tool.id;
                        const isConfigActive = 'configId' in tool && activePanel === tool.configId;
                        const hasConfig = 'configId' in tool && tool.configId;
                        return (
                          <div key={tool.id} className="flex items-center gap-1">
                            <button
                              onClick={() => handleToolClick(tool.id as SidebarPanel)}
                              className={clsx(
                                'flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                isActive && toolColorClasses[tool.color]
                                  ? `${toolColorClasses[tool.color].bg} ${toolColorClasses[tool.color].text} ${toolColorClasses[tool.color].darkBg} ${toolColorClasses[tool.color].darkText}`
                                  : !isActive ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300' : ''
                              )}
                            >
                              <Icon size={18} className={isActive && toolColorClasses[tool.color] ? toolColorClasses[tool.color].iconText : ''} />
                              <span className="flex-1 text-left">{tool.label}</span>
                              {isActive && toolColorClasses[tool.color] && (
                                <div className={`w-2 h-2 rounded-full ${toolColorClasses[tool.color].dot}`} />
                              )}
                            </button>
                            {hasConfig && (
                              <button
                                onClick={() => handleToolClick(tool.configId as SidebarPanel)}
                                className={clsx(
                                  'p-2 rounded-lg transition-all',
                                  isConfigActive && toolColorClasses[tool.color]
                                    ? `${toolColorClasses[tool.color].bg} ${toolColorClasses[tool.color].text} ${toolColorClasses[tool.color].darkBg} ${toolColorClasses[tool.color].darkText}`
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
                                )}
                                title={`${tool.label} Settings`}
                              >
                                <Settings size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle Left Sidebar Button */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 border rounded-r-lg shadow-md"
          style={{ left: leftSidebarOpen ? 280 : 0 }}
        >
          {leftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Center - Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b px-4">
            <div className="flex">
              <button
                onClick={() => handleTabChange('visual')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'visual'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <PenTool size={16} />
                Visual Editor
              </button>
              <button
                onClick={() => handleTabChange('blocks')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'blocks'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <Layers size={16} />
                Block Editor
              </button>
              <button
                onClick={() => handleTabChange('html')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'html'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <Code size={16} />
                HTML
              </button>
            </div>

            {/* Quick Format Toolbar */}
            {(activeTab === 'visual' || activeTab === 'html') && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => insertAtCursor('<strong></strong>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<em></em>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<u></u>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button
                  onClick={() => insertAtCursor('<h2></h2>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Heading"
                >
                  <Heading size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<a href=""></a>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Link"
                >
                  <Link size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<img src="" alt="" />')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Image"
                >
                  <Image size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<blockquote></blockquote>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<ul>\n  <li></li>\n</ul>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="List"
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'visual' && (
              /* WYSIWYG Visual Editor - Article Preview Style */
              <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-950 overflow-auto">
                <div className="flex-1 p-6">
                  <div className="max-w-3xl mx-auto">
                    {/* Article Container */}
                    <article className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                      {/* Featured Image Placeholder */}
                      {featuredImage?.url ? (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <img
                            src={featuredImage.url}
                            alt={featuredImage.alt || postTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <div className="text-center text-gray-400 dark:text-gray-600">
                            <Image size={32} className="mx-auto mb-1" />
                            <span className="text-xs">Featured Image</span>
                          </div>
                        </div>
                      )}

                      {/* Article Header */}
                      <div className="px-8 pt-6 pb-4 border-b dark:border-gray-800">
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full uppercase tracking-wide">
                            Category
                          </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-serif leading-tight">
                          {postTitle || 'Untitled Post'}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Admin</span>
                          </div>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{Math.max(1, Math.ceil(htmlContent.split(/\s+/).filter(Boolean).length / 200))} min read</span>
                        </div>
                      </div>

                      {/* Article Content - Editable */}
                      <div className="px-8 py-6">
                        <div
                          ref={visualEditorRef}
                          contentEditable
                          suppressContentEditableWarning
                          dir="ltr"
                          className="prose prose-lg dark:prose-invert max-w-none min-h-[400px] focus:outline-none text-left
                            prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
                            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
                            prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                            prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                            prose-img:rounded-lg prose-img:shadow-md
                            prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-li:mb-1
                            prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-8
                            prose-table:border-collapse prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-3 prose-td:p-3 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700"
                          onInput={(e) => {
                            const target = e.target as HTMLDivElement;
                            setHtmlContent(target.innerHTML);
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
                            document.execCommand('insertHTML', false, text);
                          }}
                          dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Start writing your article content here. This is a WYSIWYG editor - what you see is what your readers will see!</p><p>You can use formatting like <strong>bold</strong>, <em>italic</em>, and <a href="#">links</a>.</p>' }}
                        />
                      </div>

                      {/* Article Footer */}
                      <div className="px-8 py-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            <div className="flex gap-1">
                              {['tag1', 'tag2', 'tag3'].map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Share2 size={14} />
                            <span>Share</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blocks' && (
              /* Block Editor */
              <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
                <div className="flex-1 p-4 overflow-auto">
                  <div className="max-w-4xl mx-auto space-y-2">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={clsx(
                          'group relative bg-white dark:bg-gray-900 rounded-lg border-2 transition-all',
                          selectedBlockId === block.id
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                        onClick={() => setSelectedBlockId(block.id)}
                        draggable
                        onDragStart={() => setDraggedBlockId(block.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedBlockId && draggedBlockId !== block.id) {
                            const newBlocks = [...blocks];
                            const draggedIndex = newBlocks.findIndex(b => b.id === draggedBlockId);
                            const targetIndex = newBlocks.findIndex(b => b.id === block.id);
                            const [removed] = newBlocks.splice(draggedIndex, 1);
                            newBlocks.splice(targetIndex, 0, removed);
                            setBlocks(newBlocks);
                            setDraggedBlockId(null);
                          }
                        }}
                      >
                        {/* Block Controls */}
                        <div className="absolute -left-12 top-0 bottom-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                          >
                            <GripVertical size={16} />
                          </button>
                        </div>

                        {/* Block Content */}
                        <div className="p-4">
                          {/* Block Type Indicator */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {block.type}
                              </span>
                              {block.type === 'heading' && (
                                <select
                                  value={block.settings?.level || 2}
                                  onChange={(e) => {
                                    const newBlocks = blocks.map(b =>
                                      b.id === block.id
                                        ? { ...b, settings: { ...b.settings, level: parseInt(e.target.value) as 1|2|3|4|5|6 } }
                                        : b
                                    );
                                    setBlocks(newBlocks);
                                  }}
                                  className="text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded px-2 py-0.5"
                                >
                                  <option value={1}>H1</option>
                                  <option value={2}>H2</option>
                                  <option value={3}>H3</option>
                                  <option value={4}>H4</option>
                                  <option value={5}>H5</option>
                                  <option value={6}>H6</option>
                                </select>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBlocks(blocks.filter(b => b.id !== block.id));
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove block"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Block Editor */}
                          {block.type === 'divider' ? (
                            <hr className="border-gray-300 dark:border-gray-600 my-4" />
                          ) : block.type === 'image' ? (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                              <Image size={32} className="mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-500">Click to add image or drag & drop</p>
                              <input
                                type="text"
                                placeholder="Or paste image URL..."
                                value={block.content}
                                onChange={(e) => {
                                  const newBlocks = blocks.map(b =>
                                    b.id === block.id ? { ...b, content: e.target.value } : b
                                  );
                                  setBlocks(newBlocks);
                                }}
                                className="mt-2 w-full text-sm p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                              />
                            </div>
                          ) : block.type === 'code' ? (
                            <textarea
                              value={block.content}
                              onChange={(e) => {
                                const newBlocks = blocks.map(b =>
                                  b.id === block.id ? { ...b, content: e.target.value } : b
                                );
                                setBlocks(newBlocks);
                              }}
                              placeholder="Enter code..."
                              dir="ltr"
                              className="w-full min-h-[100px] p-3 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                            />
                          ) : (
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              dir="ltr"
                              className={clsx(
                                'w-full min-h-[40px] focus:outline-none text-left',
                                block.type === 'heading' && 'text-xl font-bold',
                                block.type === 'quote' && 'pl-4 border-l-4 border-gray-300 dark:border-gray-600 italic text-gray-600 dark:text-gray-400'
                              )}
                              onBlur={(e) => {
                                const newBlocks = blocks.map(b =>
                                  b.id === block.id ? { ...b, content: e.currentTarget.innerHTML } : b
                                );
                                setBlocks(newBlocks);
                              }}
                              dangerouslySetInnerHTML={{ __html: block.content || (block.type === 'paragraph' ? 'Start typing...' : `Add ${block.type} content...`) }}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Block Button */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          // Open block library modal to choose block type
                          setActiveModal({
                            type: 'block-library',
                            initialTab: 'blocks',
                            hideTabs: false,
                          });
                        }}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add Block
                      </button>

                      {/* Quick Block Type Selector */}
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {[
                          { type: 'paragraph' as BlockType, icon: Type, label: 'Paragraph' },
                          { type: 'heading' as BlockType, icon: Heading, label: 'Heading' },
                          { type: 'image' as BlockType, icon: Image, label: 'Image' },
                          { type: 'quote' as BlockType, icon: Quote, label: 'Quote' },
                          { type: 'list' as BlockType, icon: List, label: 'List' },
                          { type: 'code' as BlockType, icon: Code, label: 'Code' },
                          { type: 'divider' as BlockType, icon: MoreHorizontal, label: 'Divider' },
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => {
                              const newBlock: ContentBlock = {
                                id: Date.now().toString(),
                                type,
                                content: '',
                                settings: type === 'heading' ? { level: 2 } : undefined
                              };
                              setBlocks([...blocks, newBlock]);
                              setSelectedBlockId(newBlock.id);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title={label}
                          >
                            <Icon size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'html' && (
              /* Raw HTML Editor */
              <div className="h-full p-4">
                <textarea
                  id="html-editor"
                  value={htmlContent}
                  onChange={handleContentChange}
                  placeholder="Start writing your HTML content here...

Example:
<article>
  <h1>Your Title</h1>
  <p>Your content goes here...</p>
</article>"
                  dir="ltr"
                  className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-t text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Line 1, Column 1</span>
              <span>|</span>
              <span>{htmlContent.length} characters</span>
              <span>|</span>
              <span>{htmlContent.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>|</span>
              <span>HTML</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Panel Content */}
        <AnimatePresence>
          {rightSidebarOpen && activePanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 480, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border-l overflow-hidden flex-shrink-0 flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold capitalize">
                  {activePanel?.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <button
                  onClick={() => {
                    setActivePanel(null);
                    setRightSidebarOpen(false);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <PanelRightClose size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {renderPanel()}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Real-time Preview Sidebar (Always Visible, Resizable) */}
        {/* Resize Handle */}
        <div
          ref={previewResizeRef}
          className={clsx(
            'w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-col-resize flex-shrink-0 relative group transition-colors',
            isResizing && 'bg-blue-500'
          )}
          onMouseDown={startResizing}
        >
          {/* Resize grip indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal size={12} className="text-white rotate-90" />
          </div>
        </div>

        {/* Preview Panel */}
        <aside
          style={{ width: previewSidebarWidth }}
          className="bg-white dark:bg-gray-900 border-l overflow-hidden flex-shrink-0 flex flex-col"
        >
                {/* Preview Header */}
                <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-500" />
                    <h3 className="font-semibold text-sm">Live Preview</h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      Real-time
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Device Selector */}
                    <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={clsx(
                          'p-1.5 rounded transition-colors',
                          previewDevice === 'desktop'
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                        title="Desktop view"
                      >
                        <Monitor size={14} />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('tablet')}
                        className={clsx(
                          'p-1.5 rounded transition-colors',
                          previewDevice === 'tablet'
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                        title="Tablet view (768px)"
                      >
                        <Tablet size={14} />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={clsx(
                          'p-1.5 rounded transition-colors',
                          previewDevice === 'mobile'
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                        title="Mobile view (375px)"
                      >
                        <Smartphone size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview Content - Frontend Theme Preview */}
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-2">
                  {/* Dimension indicator */}
                  <div className="text-center text-xs text-gray-400 dark:text-gray-500 mb-2">
                    {deviceDimensions[previewDevice].actualWidth}px
                    {deviceDimensions[previewDevice].scale < 1 && (
                      <span className="ml-1">
                        (scaled to {Math.round(deviceDimensions[previewDevice].scale * 100)}%)
                      </span>
                    )}
                  </div>
                  <div
                    className={clsx(
                      'mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden transition-all duration-300 origin-top',
                      'border border-gray-300 dark:border-gray-600'
                    )}
                    style={{
                      width: deviceDimensions[previewDevice].width,
                      maxWidth: deviceDimensions[previewDevice].maxWidth,
                      minHeight: 'calc(100% - 16px)',
                      fontSize: previewDevice === 'mobile' ? '14px' : previewDevice === 'tablet' ? '15px' : '16px',
                      transform: `scale(${deviceDimensions[previewDevice].scale})`,
                      transformOrigin: 'top center',
                    }}
                  >
                    {/* Device Frame Header (for mobile/tablet) */}
                    {previewDevice !== 'desktop' && (
                      <div className="flex items-center justify-center py-1.5 bg-gray-900 border-b border-gray-700">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                          <div className="w-10 h-0.5 rounded-full bg-gray-600" />
                        </div>
                      </div>
                    )}

                    {/* ===== THEME: Site Header ===== */}
                    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <div className="px-3 py-2">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between text-[10px] text-indigo-200 mb-2">
                          <span>Welcome to RustPress Blog</span>
                          <div className="flex items-center gap-2">
                            <span>Login</span>
                            <span>|</span>
                            <span>Subscribe</span>
                          </div>
                        </div>
                        {/* Logo & Nav */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold">R</span>
                            </div>
                            <span className="font-bold text-sm">RustPress</span>
                          </div>
                          {previewDevice === 'mobile' ? (
                            <button className="p-1">
                              <MoreHorizontal size={16} />
                            </button>
                          ) : (
                            <nav className="flex items-center gap-3 text-[11px]">
                              <span className="hover:text-white/80 cursor-pointer">Home</span>
                              <span className="hover:text-white/80 cursor-pointer">Blog</span>
                              <span className="hover:text-white/80 cursor-pointer">Categories</span>
                              <span className="hover:text-white/80 cursor-pointer">About</span>
                              <span className="hover:text-white/80 cursor-pointer">Contact</span>
                            </nav>
                          )}
                        </div>
                      </div>
                    </header>

                    {/* ===== THEME: Breadcrumb ===== */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-[10px] text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                      <span className="text-indigo-600 dark:text-indigo-400">Home</span>
                      <span className="mx-1">/</span>
                      <span className="text-indigo-600 dark:text-indigo-400">Blog</span>
                      <span className="mx-1">/</span>
                      <span className="truncate">{postTitle || 'Untitled Post'}</span>
                    </div>

                    {/* ===== THEME: Main Content Area ===== */}
                    <div className={clsx(
                      'flex',
                      previewDevice === 'mobile' ? 'flex-col' : 'flex-row'
                    )}>
                      {/* Article Content */}
                      <article className={clsx(
                        'flex-1 p-3',
                        previewDevice !== 'mobile' && 'border-r dark:border-gray-700'
                      )}>
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 text-[9px] font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full uppercase tracking-wide">
                            Technology
                          </span>
                        </div>

                        {/* Post Title */}
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight font-serif">
                          {postTitle || 'Untitled Post'}
                        </h1>

                        {/* Post Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mb-3 pb-2 border-b dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Admin</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-0.5">
                            <Calendar size={10} />
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-0.5">
                            <Clock size={10} />
                            <span>{Math.max(1, Math.ceil(htmlContent.split(/\s+/).filter(Boolean).length / 200))} min read</span>
                          </div>
                        </div>

                        {/* Featured Image */}
                        {featuredImage?.url ? (
                          <div className="mb-3 rounded-lg overflow-hidden shadow-md">
                            <img
                              src={featuredImage.url}
                              alt={featuredImage.alt || postTitle}
                              className="w-full h-auto object-cover"
                            />
                            {featuredImage.caption && (
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 p-1.5 bg-gray-50 dark:bg-gray-800 italic text-center">
                                {featuredImage.caption}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 h-24 flex items-center justify-center">
                            <Image size={24} className="text-indigo-300 dark:text-indigo-600" />
                          </div>
                        )}

                        {/* Article Content */}
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none
                            prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-white
                            prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[12px]
                            prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:py-1 prose-blockquote:px-2 prose-blockquote:rounded-r
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-code:text-[10px]
                            prose-pre:bg-gray-900 prose-pre:text-[10px]
                            prose-img:rounded-lg prose-img:shadow-md
                            prose-hr:border-gray-200 dark:prose-hr:border-gray-700"
                          style={{ fontSize: 'inherit' }}
                        >
                          {htmlContent ? (
                            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                          ) : (
                            <div className="text-center text-gray-400 py-8">
                              <FileText size={24} className="mx-auto mb-2 opacity-50" />
                              <p className="text-[11px]">Start writing to see your content here.</p>
                              <p className="text-[9px] text-gray-400 mt-1">This preview shows how your post will look on the frontend.</p>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="mt-4 pt-3 border-t dark:border-gray-700">
                          <div className="flex flex-wrap items-center gap-1">
                            <Tag size={10} className="text-gray-400 mr-1" />
                            {['rustpress', 'tutorial', 'web'].map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-colors">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Share:</span>
                            <div className="flex items-center gap-1">
                              <button className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 transition-colors">
                                <span className="text-[8px] font-bold">f</span>
                              </button>
                              <button className="w-5 h-5 bg-sky-500 text-white rounded flex items-center justify-center hover:bg-sky-600 transition-colors">
                                <span className="text-[8px] font-bold">𝕏</span>
                              </button>
                              <button className="w-5 h-5 bg-blue-700 text-white rounded flex items-center justify-center hover:bg-blue-800 transition-colors">
                                <span className="text-[8px] font-bold">in</span>
                              </button>
                              <button className="w-5 h-5 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors">
                                <span className="text-[8px] font-bold">P</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Author Box */}
                        <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[11px] text-gray-900 dark:text-white">Admin</div>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                                Content creator and web developer. Passionate about building great user experiences.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Comments Preview */}
                        <div className="mt-4 pt-3 border-t dark:border-gray-700">
                          <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                            <MessageSquare size={12} />
                            Comments (3)
                          </h3>
                          <div className="space-y-2">
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-[9px]">
                              <div className="flex items-center gap-1 mb-1">
                                <div className="w-4 h-4 bg-green-400 rounded-full" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">John</span>
                                <span className="text-gray-400">• 2h ago</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">Great article! Very helpful.</p>
                            </div>
                          </div>
                        </div>
                      </article>

                      {/* Sidebar - Hidden on mobile */}
                      {previewDevice !== 'mobile' && (
                        <aside className="w-28 p-2 space-y-3 bg-gray-50/50 dark:bg-gray-800/30">
                          {/* Search Widget */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                            <h4 className="text-[9px] font-semibold text-gray-900 dark:text-white mb-1.5 uppercase tracking-wide">Search</h4>
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-1">
                              <Search size={10} className="text-gray-400" />
                              <span className="text-[8px] text-gray-400 ml-1">Search...</span>
                            </div>
                          </div>

                          {/* Categories Widget */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                            <h4 className="text-[9px] font-semibold text-gray-900 dark:text-white mb-1.5 uppercase tracking-wide">Categories</h4>
                            <ul className="space-y-0.5 text-[8px]">
                              {['Technology', 'Design', 'Development', 'News'].map(cat => (
                                <li key={cat} className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                                  <span>{cat}</span>
                                  <span className="text-[7px] bg-gray-100 dark:bg-gray-700 px-1 rounded">5</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recent Posts Widget */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                            <h4 className="text-[9px] font-semibold text-gray-900 dark:text-white mb-1.5 uppercase tracking-wide">Recent Posts</h4>
                            <ul className="space-y-1.5 text-[8px]">
                              {['Getting Started Guide', 'Best Practices', 'New Features'].map(post => (
                                <li key={post} className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer leading-tight">
                                  {post}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Newsletter Widget */}
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2 text-white">
                            <h4 className="text-[9px] font-semibold mb-1">Newsletter</h4>
                            <p className="text-[7px] text-indigo-100 mb-1.5">Get updates directly in your inbox!</p>
                            <div className="bg-white/20 rounded px-1.5 py-1 text-[8px] text-indigo-100">
                              your@email.com
                            </div>
                          </div>
                        </aside>
                      )}
                    </div>

                    {/* ===== THEME: Footer ===== */}
                    <footer className="bg-gray-900 text-white px-3 py-3 mt-auto">
                      <div className={clsx(
                        'grid gap-3 mb-3',
                        previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
                      )}>
                        <div>
                          <h5 className="text-[9px] font-semibold mb-1">About</h5>
                          <p className="text-[7px] text-gray-400 leading-snug">RustPress is a modern CMS built with Rust.</p>
                        </div>
                        <div>
                          <h5 className="text-[9px] font-semibold mb-1">Links</h5>
                          <ul className="text-[7px] text-gray-400 space-y-0.5">
                            <li>Home</li>
                            <li>Blog</li>
                            <li>Contact</li>
                          </ul>
                        </div>
                        {previewDevice !== 'mobile' && (
                          <>
                            <div>
                              <h5 className="text-[9px] font-semibold mb-1">Categories</h5>
                              <ul className="text-[7px] text-gray-400 space-y-0.5">
                                <li>Technology</li>
                                <li>Design</li>
                                <li>News</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-[9px] font-semibold mb-1">Social</h5>
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-gray-700 rounded flex items-center justify-center text-[8px]">f</div>
                                <div className="w-4 h-4 bg-gray-700 rounded flex items-center justify-center text-[8px]">𝕏</div>
                                <div className="w-4 h-4 bg-gray-700 rounded flex items-center justify-center text-[8px]">in</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="pt-2 border-t border-gray-800 text-center text-[7px] text-gray-500">
                        © 2026 RustPress. All rights reserved. | Powered by RustPress CMS
                      </div>
                    </footer>
                  </div>
                </div>

                {/* Preview Footer with info */}
                <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>
                      {previewDevice === 'desktop' ? 'Full width' : previewDevice === 'tablet' ? '768px' : '375px'}
                    </span>
                    <span>|</span>
                    <span>{htmlContent.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Synced</span>
                  </div>
                </div>
        </aside>
      </div>

      {/* Word Count Tracker (floating) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <WordCountTracker content={htmlContent} />
      </div>

      {/* Shortcuts Customization Modal */}
      <AnimatePresence>
        {showShortcutsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowShortcutsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold">Customize Toolbar Shortcuts</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drag to reorder, click to add or remove</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetShortcuts}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5"
                    title="Reset to defaults"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                  <button
                    onClick={() => setShowShortcutsModal(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                {/* Current Shortcuts */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Your Shortcuts ({userShortcuts.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    {userShortcuts.length === 0 ? (
                      <span className="text-sm text-gray-400">No shortcuts selected. Add some from below.</span>
                    ) : (
                      userShortcuts.map((shortcutId, index) => {
                        const shortcut = getShortcutById(shortcutId);
                        if (!shortcut) return null;
                        const Icon = shortcut.icon;
                        return (
                          <div
                            key={shortcutId}
                            draggable
                            onDragStart={() => setDraggedShortcut(shortcutId)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedShortcut && draggedShortcut !== shortcutId) {
                                const fromIndex = userShortcuts.indexOf(draggedShortcut);
                                moveShortcut(fromIndex, index);
                              }
                              setDraggedShortcut(null);
                            }}
                            onDragEnd={() => setDraggedShortcut(null)}
                            className={clsx(
                              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-move transition-all',
                              `bg-${shortcut.color}-100 text-${shortcut.color}-700 dark:bg-${shortcut.color}-900/30 dark:text-${shortcut.color}-400`,
                              draggedShortcut === shortcutId && 'opacity-50'
                            )}
                          >
                            <GripVertical size={12} className="text-gray-400" />
                            <Icon size={14} />
                            <span>{shortcut.label}</span>
                            <button
                              onClick={() => removeShortcut(shortcutId)}
                              className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Available Shortcuts by Category */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Available Shortcuts
                  </h3>
                  {Array.from(new Set(availableShortcuts.map(s => s.category))).map(category => {
                    const categoryShortcuts = availableShortcuts.filter(s => s.category === category);
                    return (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {categoryShortcuts.map(shortcut => {
                            const Icon = shortcut.icon;
                            const isSelected = userShortcuts.includes(shortcut.id);
                            return (
                              <button
                                key={shortcut.id}
                                onClick={() => isSelected ? removeShortcut(shortcut.id) : addShortcut(shortcut.id)}
                                className={clsx(
                                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                                  isSelected
                                    ? `bg-${shortcut.color}-100 text-${shortcut.color}-700 dark:bg-${shortcut.color}-900/30 dark:text-${shortcut.color}-400`
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                )}
                              >
                                <Icon size={14} />
                                <span>{shortcut.label}</span>
                                {isSelected && <Check size={12} className="ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Modals */}
      <BlockLibraryModal
        isOpen={activeModal?.type === 'block-library'}
        onClose={closeModal}
        onInsertBlock={(block: string) => insertAtCursor(block)}
        initialTab={activeModal?.type === 'block-library' ? activeModal.initialTab as 'blocks' | 'animations' | 'templates' | 'media' : undefined}
        hideTabs={activeModal?.type === 'block-library' ? activeModal.hideTabs : false}
      />
      <VisualElementsModal
        isOpen={activeModal?.type === 'visual-elements'}
        onClose={closeModal}
        onInsertBlock={(block: string) => insertAtCursor(block)}
        initialTab={activeModal?.type === 'visual-elements' ? activeModal.initialTab as 'carousel' | 'gallery' | 'before-after' | 'table' | 'embed' : undefined}
        hideTabs={activeModal?.type === 'visual-elements' ? activeModal.hideTabs : false}
      />
      <SEOAnalysisModal
        isOpen={activeModal?.type === 'seo-analysis'}
        onClose={closeModal}
        content={htmlContent}
        title={postTitle}
        initialTab={activeModal?.type === 'seo-analysis' ? activeModal.initialTab as 'seo' | 'readability' | 'keywords' | 'headings' | 'schema' | 'links' | 'checker' : undefined}
        hideTabs={activeModal?.type === 'seo-analysis' ? activeModal.hideTabs : false}
      />
      <PreviewOptionsModal
        isOpen={activeModal?.type === 'preview-options'}
        onClose={closeModal}
        content={htmlContent}
        title={postTitle}
        initialTab={activeModal?.type === 'preview-options' ? activeModal.initialTab as 'device' | 'social' | 'outline' : undefined}
        hideTabs={activeModal?.type === 'preview-options' ? activeModal.hideTabs : false}
      />
      <PostSettingsModal
        isOpen={activeModal?.type === 'post-settings'}
        onClose={closeModal}
        onApply={(settings) => console.log('Applied settings:', settings)}
        initialTab={activeModal?.type === 'post-settings' ? activeModal.initialTab as 'featured' | 'author' | 'categories' | 'tags' | 'visibility' | 'schedule' | 'excerpt' | 'slug' | 'discussion' | 'revisions' : undefined}
        hideTabs={activeModal?.type === 'post-settings' ? activeModal.hideTabs : false}
      />
      <MetadataSEOModal
        isOpen={activeModal?.type === 'metadata-seo'}
        onClose={closeModal}
        initialTab={activeModal?.type === 'metadata-seo' ? activeModal.initialTab as 'seo' | 'social' | 'custom-fields' | 'format' | 'template' | 'attributes' | 'related' | 'series' | 'location' | 'language' : undefined}
        hideTabs={activeModal?.type === 'metadata-seo' ? activeModal.hideTabs : false}
      />
      <AdvancedModal
        isOpen={activeModal?.type === 'advanced'}
        onClose={closeModal}
        initialTab={activeModal?.type === 'advanced' ? activeModal.initialTab as 'history' | 'compare' | 'analytics' | 'collaboration' | 'optimizer' | 'plugins' : undefined}
        hideTabs={activeModal?.type === 'advanced' ? activeModal.hideTabs : false}
      />
      <AIToolsModal
        isOpen={activeModal?.type === 'ai-tools'}
        onClose={closeModal}
        content={htmlContent}
        onInsertContent={(content: string) => insertAtCursor(content)}
        onReplaceContent={(content: string) => setHtmlContent(content)}
        initialTab={activeModal?.type === 'ai-tools' ? activeModal.initialTab as 'assistant' | 'generate' | 'image' | 'seo' | 'translate' | 'summarize' : undefined}
        hideTabs={activeModal?.type === 'ai-tools' ? activeModal.hideTabs : false}
      />
    </div>
  );
};

export default PostEditor;
