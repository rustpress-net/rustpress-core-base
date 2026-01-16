import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Type,
  Image,
  Video,
  FileText,
  List,
  ListOrdered,
  Quote,
  Code,
  Table,
  Columns,
  LayoutGrid,
  Box,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  ChevronDown,
  Search,
  Star,
  Clock,
  Sparkles,
  GalleryHorizontal,
  GalleryVertical,
  Play,
  Music,
  FileImage,
  Map,
  Calendar,
  Users,
  MessageSquare,
  Share2,
  Link,
  Bookmark,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Zap,
  Layers,
  Grid3X3,
  LayoutTemplate,
  ShoppingCart,
  FormInput,
  BarChart3,
  PieChart,
  TrendingUp,
  Palette,
  Settings,
  Sliders,
  X,
  GripVertical,
  Eye,
  Copy,
  Trash2,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import clsx from 'clsx'

// Block category and type definitions
export interface BlockType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  keywords: string[]
  isEnabled: boolean
  isPremium: boolean
  hasSettings: boolean
  defaultSettings: Record<string, any>
}

export interface BlockCategory {
  id: string
  name: string
  icon: React.ReactNode
  order: number
}

interface EditorBlockToolbarProps {
  onInsertBlock: (blockType: string, settings?: Record<string, any>) => void
  position?: { x: number; y: number }
  isFloating?: boolean
  enabledBlocks?: string[]
  recentBlocks?: string[]
  favoriteBlocks?: string[]
  onToggleFavorite?: (blockId: string) => void
}

// Block categories
const blockCategories: BlockCategory[] = [
  { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" />, order: 1 },
  { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" />, order: 2 },
  { id: 'layout', name: 'Layout', icon: <LayoutGrid className="w-4 h-4" />, order: 3 },
  { id: 'embeds', name: 'Embeds', icon: <Play className="w-4 h-4" />, order: 4 },
  { id: 'widgets', name: 'Widgets', icon: <Box className="w-4 h-4" />, order: 5 },
  { id: 'ecommerce', name: 'E-Commerce', icon: <ShoppingCart className="w-4 h-4" />, order: 6 },
  { id: 'forms', name: 'Forms', icon: <FormInput className="w-4 h-4" />, order: 7 },
  { id: 'advanced', name: 'Advanced', icon: <Zap className="w-4 h-4" />, order: 8 },
]

// All available blocks
const allBlocks: BlockType[] = [
  // Text blocks
  { id: 'paragraph', name: 'Paragraph', description: 'Start with plain text', icon: <Type className="w-5 h-5" />, category: 'text', keywords: ['text', 'paragraph', 'p'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { fontSize: 16, lineHeight: 1.6 } },
  { id: 'heading', name: 'Heading', description: 'Add a heading (H1-H6)', icon: <Heading1 className="w-5 h-5" />, category: 'text', keywords: ['heading', 'title', 'h1', 'h2', 'h3'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { level: 2 } },
  { id: 'list', name: 'List', description: 'Create a bulleted list', icon: <List className="w-5 h-5" />, category: 'text', keywords: ['list', 'bullet', 'ul'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { style: 'bullet' } },
  { id: 'ordered-list', name: 'Numbered List', description: 'Create a numbered list', icon: <ListOrdered className="w-5 h-5" />, category: 'text', keywords: ['list', 'numbered', 'ol', 'ordered'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { start: 1 } },
  { id: 'quote', name: 'Quote', description: 'Add a blockquote', icon: <Quote className="w-5 h-5" />, category: 'text', keywords: ['quote', 'blockquote', 'citation'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { style: 'default' } },
  { id: 'code', name: 'Code', description: 'Display code with syntax highlighting', icon: <Code className="w-5 h-5" />, category: 'text', keywords: ['code', 'pre', 'syntax'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { language: 'javascript' } },
  { id: 'preformatted', name: 'Preformatted', description: 'Add preformatted text', icon: <FileText className="w-5 h-5" />, category: 'text', keywords: ['preformatted', 'pre'], isEnabled: true, isPremium: false, hasSettings: false, defaultSettings: {} },
  { id: 'pullquote', name: 'Pullquote', description: 'Highlight a key quote', icon: <Quote className="w-5 h-5" />, category: 'text', keywords: ['pullquote', 'highlight'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { alignment: 'center' } },

  // Media blocks
  { id: 'image', name: 'Image', description: 'Insert an image', icon: <Image className="w-5 h-5" />, category: 'media', keywords: ['image', 'photo', 'picture'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { alignment: 'center', size: 'large' } },
  { id: 'gallery', name: 'Gallery', description: 'Display multiple images in a gallery', icon: <GalleryHorizontal className="w-5 h-5" />, category: 'media', keywords: ['gallery', 'images', 'photos'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { columns: 3, linkTo: 'media' } },
  { id: 'carousel', name: 'Image Carousel', description: 'Sliding image carousel with controls', icon: <GalleryVertical className="w-5 h-5" />, category: 'media', keywords: ['carousel', 'slider', 'slideshow'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { autoplay: true, interval: 5000, arrows: true, dots: true } },
  { id: 'video', name: 'Video', description: 'Embed a video file', icon: <Video className="w-5 h-5" />, category: 'media', keywords: ['video', 'movie', 'mp4'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { autoplay: false, controls: true, loop: false } },
  { id: 'audio', name: 'Audio', description: 'Embed an audio file', icon: <Music className="w-5 h-5" />, category: 'media', keywords: ['audio', 'music', 'mp3', 'sound'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { autoplay: false, loop: false } },
  { id: 'file', name: 'File', description: 'Add a downloadable file', icon: <FileImage className="w-5 h-5" />, category: 'media', keywords: ['file', 'download', 'attachment'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { showFileSize: true } },
  { id: 'cover', name: 'Cover', description: 'Image with text overlay', icon: <Layers className="w-5 h-5" />, category: 'media', keywords: ['cover', 'hero', 'banner'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { dimRatio: 50, minHeight: 400 } },
  { id: 'media-text', name: 'Media & Text', description: 'Media alongside content', icon: <Columns className="w-5 h-5" />, category: 'media', keywords: ['media', 'text', 'image text'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { mediaPosition: 'left', mediaWidth: 50 } },
  { id: 'before-after', name: 'Before/After', description: 'Image comparison slider', icon: <SlidersHorizontal className="w-5 h-5" />, category: 'media', keywords: ['before', 'after', 'compare', 'slider'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { orientation: 'horizontal', initialPosition: 50 } },

  // Layout blocks
  { id: 'columns', name: 'Columns', description: 'Add multiple column layout', icon: <Columns className="w-5 h-5" />, category: 'layout', keywords: ['columns', 'grid', 'layout'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { columns: 2, gap: 'medium' } },
  { id: 'group', name: 'Group', description: 'Group blocks together', icon: <Box className="w-5 h-5" />, category: 'layout', keywords: ['group', 'container', 'section'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { tagName: 'div' } },
  { id: 'row', name: 'Row', description: 'Horizontal flex container', icon: <LayoutGrid className="w-5 h-5" />, category: 'layout', keywords: ['row', 'flex', 'horizontal'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { justifyContent: 'flex-start' } },
  { id: 'stack', name: 'Stack', description: 'Vertical flex container', icon: <Layers className="w-5 h-5" />, category: 'layout', keywords: ['stack', 'vertical'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { gap: 'medium' } },
  { id: 'separator', name: 'Separator', description: 'Add a horizontal line', icon: <Minus className="w-5 h-5" />, category: 'layout', keywords: ['separator', 'divider', 'hr', 'line'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { style: 'default' } },
  { id: 'spacer', name: 'Spacer', description: 'Add vertical space', icon: <Box className="w-5 h-5" />, category: 'layout', keywords: ['spacer', 'space', 'gap'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { height: 50 } },
  { id: 'grid', name: 'Grid', description: 'CSS Grid layout', icon: <Grid3X3 className="w-5 h-5" />, category: 'layout', keywords: ['grid', 'layout', 'css grid'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { columns: 3, rows: 2, gap: 20 } },
  { id: 'tabs', name: 'Tabs', description: 'Tabbed content sections', icon: <LayoutTemplate className="w-5 h-5" />, category: 'layout', keywords: ['tabs', 'tabbed', 'sections'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { orientation: 'horizontal', style: 'default' } },
  { id: 'accordion', name: 'Accordion', description: 'Collapsible content sections', icon: <ChevronDown className="w-5 h-5" />, category: 'layout', keywords: ['accordion', 'collapse', 'faq'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { allowMultiple: false, defaultOpen: 0 } },

  // Embed blocks
  { id: 'youtube', name: 'YouTube', description: 'Embed a YouTube video', icon: <Play className="w-5 h-5" />, category: 'embeds', keywords: ['youtube', 'video', 'embed'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { aspectRatio: '16:9' } },
  { id: 'vimeo', name: 'Vimeo', description: 'Embed a Vimeo video', icon: <Play className="w-5 h-5" />, category: 'embeds', keywords: ['vimeo', 'video', 'embed'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { aspectRatio: '16:9' } },
  { id: 'twitter', name: 'Twitter/X', description: 'Embed a tweet', icon: <MessageSquare className="w-5 h-5" />, category: 'embeds', keywords: ['twitter', 'x', 'tweet', 'social'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { theme: 'light' } },
  { id: 'instagram', name: 'Instagram', description: 'Embed an Instagram post', icon: <Image className="w-5 h-5" />, category: 'embeds', keywords: ['instagram', 'social', 'photo'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { captionEnabled: true } },
  { id: 'tiktok', name: 'TikTok', description: 'Embed a TikTok video', icon: <Video className="w-5 h-5" />, category: 'embeds', keywords: ['tiktok', 'video', 'social'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: {} },
  { id: 'spotify', name: 'Spotify', description: 'Embed Spotify content', icon: <Music className="w-5 h-5" />, category: 'embeds', keywords: ['spotify', 'music', 'audio'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { type: 'track' } },
  { id: 'soundcloud', name: 'SoundCloud', description: 'Embed SoundCloud audio', icon: <Music className="w-5 h-5" />, category: 'embeds', keywords: ['soundcloud', 'music', 'audio'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: {} },
  { id: 'google-maps', name: 'Google Maps', description: 'Embed a map', icon: <Map className="w-5 h-5" />, category: 'embeds', keywords: ['map', 'google', 'location'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { zoom: 15, height: 400 } },
  { id: 'iframe', name: 'Custom Embed', description: 'Embed any URL', icon: <Link className="w-5 h-5" />, category: 'embeds', keywords: ['iframe', 'embed', 'custom'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { aspectRatio: '16:9' } },

  // Widget blocks
  { id: 'button', name: 'Button', description: 'Add a call-to-action button', icon: <Box className="w-5 h-5" />, category: 'widgets', keywords: ['button', 'cta', 'link'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { style: 'fill', size: 'medium', alignment: 'left' } },
  { id: 'buttons', name: 'Button Group', description: 'Multiple buttons in a row', icon: <LayoutGrid className="w-5 h-5" />, category: 'widgets', keywords: ['buttons', 'group', 'cta'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { orientation: 'horizontal' } },
  { id: 'table', name: 'Table', description: 'Insert a table', icon: <Table className="w-5 h-5" />, category: 'widgets', keywords: ['table', 'data', 'grid'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { rows: 3, columns: 3, hasHeader: true } },
  { id: 'toc', name: 'Table of Contents', description: 'Auto-generated TOC', icon: <List className="w-5 h-5" />, category: 'widgets', keywords: ['toc', 'contents', 'navigation'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { maxLevel: 3 } },
  { id: 'social-links', name: 'Social Links', description: 'Social media icons', icon: <Share2 className="w-5 h-5" />, category: 'widgets', keywords: ['social', 'links', 'icons'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { style: 'default', size: 'medium' } },
  { id: 'latest-posts', name: 'Latest Posts', description: 'Display recent posts', icon: <FileText className="w-5 h-5" />, category: 'widgets', keywords: ['posts', 'latest', 'recent'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { postsToShow: 5, displayExcerpt: true } },
  { id: 'post-carousel', name: 'Post Carousel', description: 'Posts in carousel format', icon: <GalleryHorizontal className="w-5 h-5" />, category: 'widgets', keywords: ['posts', 'carousel', 'slider'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { postsToShow: 6, autoplay: true } },
  { id: 'categories', name: 'Categories', description: 'Display categories list', icon: <Tag className="w-5 h-5" />, category: 'widgets', keywords: ['categories', 'taxonomy'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { showCounts: true } },
  { id: 'tag-cloud', name: 'Tag Cloud', description: 'Display tags as cloud', icon: <Tag className="w-5 h-5" />, category: 'widgets', keywords: ['tags', 'cloud'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { taxonomy: 'post_tag' } },
  { id: 'author', name: 'Author Box', description: 'Display author info', icon: <Users className="w-5 h-5" />, category: 'widgets', keywords: ['author', 'user', 'profile'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { showBio: true, showAvatar: true } },
  { id: 'calendar', name: 'Calendar', description: 'Display a calendar', icon: <Calendar className="w-5 h-5" />, category: 'widgets', keywords: ['calendar', 'date'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: {} },
  { id: 'search', name: 'Search', description: 'Add a search form', icon: <Search className="w-5 h-5" />, category: 'widgets', keywords: ['search', 'form'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { placeholder: 'Search...' } },
  { id: 'alert', name: 'Alert Box', description: 'Colored alert message', icon: <AlertCircle className="w-5 h-5" />, category: 'widgets', keywords: ['alert', 'notice', 'warning', 'info'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { type: 'info', dismissible: false } },
  { id: 'testimonial', name: 'Testimonial', description: 'Customer testimonial', icon: <MessageSquare className="w-5 h-5" />, category: 'widgets', keywords: ['testimonial', 'review', 'quote'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { style: 'card', showRating: true } },
  { id: 'testimonial-carousel', name: 'Testimonial Carousel', description: 'Multiple testimonials slider', icon: <GalleryHorizontal className="w-5 h-5" />, category: 'widgets', keywords: ['testimonial', 'carousel', 'slider'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { autoplay: true, interval: 5000 } },
  { id: 'team-member', name: 'Team Member', description: 'Team member card', icon: <Users className="w-5 h-5" />, category: 'widgets', keywords: ['team', 'member', 'staff'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { showSocial: true } },
  { id: 'countdown', name: 'Countdown Timer', description: 'Event countdown', icon: <Clock className="w-5 h-5" />, category: 'widgets', keywords: ['countdown', 'timer', 'event'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { endDate: '', style: 'flip' } },
  { id: 'progress', name: 'Progress Bar', description: 'Visual progress indicator', icon: <TrendingUp className="w-5 h-5" />, category: 'widgets', keywords: ['progress', 'bar', 'percentage'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { value: 50, showLabel: true } },
  { id: 'counter', name: 'Counter', description: 'Animated number counter', icon: <BarChart3 className="w-5 h-5" />, category: 'widgets', keywords: ['counter', 'number', 'stats'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { startValue: 0, endValue: 100, duration: 2000 } },
  { id: 'icon-box', name: 'Icon Box', description: 'Icon with text content', icon: <Box className="w-5 h-5" />, category: 'widgets', keywords: ['icon', 'box', 'feature'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { iconPosition: 'top' } },
  { id: 'pricing-table', name: 'Pricing Table', description: 'Pricing comparison table', icon: <Table className="w-5 h-5" />, category: 'widgets', keywords: ['pricing', 'table', 'plans'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { columns: 3 } },
  { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', icon: <HelpCircle className="w-5 h-5" />, category: 'widgets', keywords: ['faq', 'questions', 'accordion'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { schema: true } },
  { id: 'star-rating', name: 'Star Rating', description: 'Display star rating', icon: <Star className="w-5 h-5" />, category: 'widgets', keywords: ['rating', 'stars', 'review'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { maxStars: 5, value: 4 } },

  // E-Commerce blocks (RustCommerce integration)
  { id: 'product', name: 'Product', description: 'Display a single product', icon: <ShoppingCart className="w-5 h-5" />, category: 'ecommerce', keywords: ['product', 'shop', 'woocommerce'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { showPrice: true, showAddToCart: true } },
  { id: 'products', name: 'Products Grid', description: 'Display multiple products', icon: <Grid3X3 className="w-5 h-5" />, category: 'ecommerce', keywords: ['products', 'grid', 'shop'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { columns: 4, limit: 8 } },
  { id: 'product-carousel', name: 'Product Carousel', description: 'Products in carousel', icon: <GalleryHorizontal className="w-5 h-5" />, category: 'ecommerce', keywords: ['product', 'carousel', 'slider'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { autoplay: true } },
  { id: 'add-to-cart', name: 'Add to Cart', description: 'Add to cart button', icon: <ShoppingCart className="w-5 h-5" />, category: 'ecommerce', keywords: ['cart', 'buy', 'add'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { showQuantity: true } },
  { id: 'product-categories', name: 'Product Categories', description: 'Display product categories', icon: <Tag className="w-5 h-5" />, category: 'ecommerce', keywords: ['categories', 'product'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { showCounts: true } },

  // Form blocks (RustForms integration)
  { id: 'contact-form', name: 'Contact Form', description: 'Insert contact form', icon: <FormInput className="w-5 h-5" />, category: 'forms', keywords: ['contact', 'form', 'email'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { formId: null } },
  { id: 'newsletter', name: 'Newsletter Signup', description: 'Email subscription form', icon: <FileText className="w-5 h-5" />, category: 'forms', keywords: ['newsletter', 'subscribe', 'email'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { style: 'inline' } },
  { id: 'form-embed', name: 'Embed Form', description: 'Embed any RustForms form', icon: <FormInput className="w-5 h-5" />, category: 'forms', keywords: ['form', 'embed'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { formId: null } },

  // Advanced blocks
  { id: 'html', name: 'Custom HTML', description: 'Add custom HTML code', icon: <Code className="w-5 h-5" />, category: 'advanced', keywords: ['html', 'code', 'custom'], isEnabled: true, isPremium: false, hasSettings: false, defaultSettings: {} },
  { id: 'shortcode', name: 'Shortcode', description: 'Insert a shortcode', icon: <Zap className="w-5 h-5" />, category: 'advanced', keywords: ['shortcode', 'plugin'], isEnabled: true, isPremium: false, hasSettings: false, defaultSettings: {} },
  { id: 'reusable', name: 'Reusable Block', description: 'Insert saved block pattern', icon: <Bookmark className="w-5 h-5" />, category: 'advanced', keywords: ['reusable', 'pattern', 'template'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { ref: null } },
  { id: 'template-part', name: 'Template Part', description: 'Insert template part', icon: <LayoutTemplate className="w-5 h-5" />, category: 'advanced', keywords: ['template', 'part', 'header', 'footer'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { slug: '' } },
  { id: 'dynamic-content', name: 'Dynamic Content', description: 'Display dynamic data', icon: <Sparkles className="w-5 h-5" />, category: 'advanced', keywords: ['dynamic', 'acf', 'custom field'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { source: 'post_meta', key: '' } },
  { id: 'query-loop', name: 'Query Loop', description: 'Display posts with custom query', icon: <List className="w-5 h-5" />, category: 'advanced', keywords: ['query', 'loop', 'posts'], isEnabled: true, isPremium: false, hasSettings: true, defaultSettings: { postType: 'post', perPage: 10 } },
  { id: 'chart', name: 'Chart', description: 'Data visualization chart', icon: <PieChart className="w-5 h-5" />, category: 'advanced', keywords: ['chart', 'graph', 'data'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { type: 'bar' } },
  { id: 'lottie', name: 'Lottie Animation', description: 'Add Lottie animation', icon: <Play className="w-5 h-5" />, category: 'advanced', keywords: ['lottie', 'animation', 'json'], isEnabled: true, isPremium: true, hasSettings: true, defaultSettings: { loop: true, autoplay: true } },
]

// Block settings modal component
interface BlockSettingsModalProps {
  block: BlockType
  settings: Record<string, any>
  onSave: (settings: Record<string, any>) => void
  onClose: () => void
}

function BlockSettingsModal({ block, settings, onSave, onClose }: BlockSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderSettingsField = (key: string, value: any) => {
    const type = typeof value

    if (type === 'boolean') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings[key] ?? value}
            onChange={e => updateSetting(key, e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
        </label>
      )
    }

    if (type === 'number') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="number"
            value={localSettings[key] ?? value}
            onChange={e => updateSetting(key, parseInt(e.target.value))}
            className="input w-full"
          />
        </div>
      )
    }

    if (key === 'style' || key === 'type' || key === 'orientation' || key === 'size' || key === 'alignment') {
      const options = {
        style: ['default', 'outline', 'fill', 'card', 'minimal', 'flip'],
        type: ['info', 'success', 'warning', 'error', 'track', 'album', 'playlist', 'bar', 'line', 'pie', 'doughnut'],
        orientation: ['horizontal', 'vertical'],
        size: ['small', 'medium', 'large'],
        alignment: ['left', 'center', 'right'],
      }

      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
            {key}
          </label>
          <select
            value={localSettings[key] ?? value}
            onChange={e => updateSetting(key, e.target.value)}
            className="input w-full"
          >
            {(options[key as keyof typeof options] || [value]).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
          {key.replace(/([A-Z])/g, ' $1')}
        </label>
        <input
          type="text"
          value={localSettings[key] ?? value}
          onChange={e => updateSetting(key, e.target.value)}
          className="input w-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
              {block.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{block.name} Settings</h3>
              <p className="text-sm text-gray-500">{block.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(block.defaultSettings).map(([key, value]) => (
            <div key={key}>{renderSettingsField(key, value)}</div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localSettings)
              onClose()
            }}
            className="btn btn-primary"
          >
            Insert Block
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function EditorBlockToolbar({
  onInsertBlock,
  position,
  isFloating = false,
  enabledBlocks,
  recentBlocks = [],
  favoriteBlocks = [],
  onToggleFavorite,
}: EditorBlockToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [settingsBlock, setSettingsBlock] = useState<BlockType | null>(null)
  const [settingsValues, setSettingsValues] = useState<Record<string, any>>({})
  const toolbarRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter blocks based on search and category
  const filteredBlocks = allBlocks.filter(block => {
    if (enabledBlocks && !enabledBlocks.includes(block.id)) return false
    if (!block.isEnabled) return false

    const matchesSearch = searchQuery === '' ||
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || block.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get favorite and recent blocks
  const favoriteBlockItems = allBlocks.filter(b => favoriteBlocks.includes(b.id))
  const recentBlockItems = allBlocks.filter(b => recentBlocks.includes(b.id)).slice(0, 6)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInsertBlock = (block: BlockType) => {
    if (block.hasSettings) {
      setSettingsBlock(block)
      setSettingsValues(block.defaultSettings)
    } else {
      onInsertBlock(block.id, block.defaultSettings)
      setIsOpen(false)
    }
  }

  const handleSaveSettings = (settings: Record<string, any>) => {
    if (settingsBlock) {
      onInsertBlock(settingsBlock.id, settings)
      setSettingsBlock(null)
      setIsOpen(false)
    }
  }

  return (
    <>
      <div
        ref={toolbarRef}
        className={clsx(
          'relative',
          isFloating && 'fixed z-50',
        )}
        style={isFloating && position ? { left: position.x, top: position.y } : undefined}
      >
        {/* Add Block Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'flex items-center gap-1 px-3 py-2 rounded-lg transition-colors',
            isOpen
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Block</span>
          <ChevronDown className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {/* Block Inserter Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 w-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search blocks..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex h-[400px]">
                {/* Categories Sidebar */}
                <div className="w-[140px] border-r border-gray-200 dark:border-gray-700 p-2 space-y-1 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                      !selectedCategory
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    All Blocks
                  </button>

                  {favoriteBlocks.length > 0 && (
                    <button
                      onClick={() => setSelectedCategory('favorites')}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                        selectedCategory === 'favorites'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      <Star className="w-4 h-4" />
                      Favorites
                    </button>
                  )}

                  {recentBlocks.length > 0 && (
                    <button
                      onClick={() => setSelectedCategory('recent')}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                        selectedCategory === 'recent'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      <Clock className="w-4 h-4" />
                      Recent
                    </button>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                  {blockCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                        selectedCategory === category.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Blocks List */}
                <div className="flex-1 p-2 overflow-y-auto">
                  {/* Favorites Section */}
                  {selectedCategory === 'favorites' && (
                    <div className="space-y-1">
                      {favoriteBlockItems.map(block => (
                        <BlockItem
                          key={block.id}
                          block={block}
                          isFavorite={true}
                          onInsert={() => handleInsertBlock(block)}
                          onToggleFavorite={() => onToggleFavorite?.(block.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Recent Section */}
                  {selectedCategory === 'recent' && (
                    <div className="space-y-1">
                      {recentBlockItems.map(block => (
                        <BlockItem
                          key={block.id}
                          block={block}
                          isFavorite={favoriteBlocks.includes(block.id)}
                          onInsert={() => handleInsertBlock(block)}
                          onToggleFavorite={() => onToggleFavorite?.(block.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* All/Category Blocks */}
                  {selectedCategory !== 'favorites' && selectedCategory !== 'recent' && (
                    <div className="space-y-1">
                      {filteredBlocks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No blocks found</p>
                        </div>
                      ) : (
                        filteredBlocks.map(block => (
                          <BlockItem
                            key={block.id}
                            block={block}
                            isFavorite={favoriteBlocks.includes(block.id)}
                            onInsert={() => handleInsertBlock(block)}
                            onToggleFavorite={() => onToggleFavorite?.(block.id)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Settings className="w-4 h-4" />
                  Manage Blocks
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsBlock && (
          <BlockSettingsModal
            block={settingsBlock}
            settings={settingsValues}
            onSave={handleSaveSettings}
            onClose={() => setSettingsBlock(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Individual block item component
interface BlockItemProps {
  block: BlockType
  isFavorite: boolean
  onInsert: () => void
  onToggleFavorite?: () => void
}

function BlockItem({ block, isFavorite, onInsert, onToggleFavorite }: BlockItemProps) {
  return (
    <button
      onClick={onInsert}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group text-left"
    >
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400">
        {block.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {block.name}
          </span>
          {block.isPremium && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">
              Pro
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{block.description}</p>
      </div>
      {onToggleFavorite && (
        <button
          onClick={e => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          <Star className={clsx('w-4 h-4', isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400')} />
        </button>
      )}
      {block.hasSettings && (
        <Sliders className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
      )}
    </button>
  )
}

// Export block data for admin settings
export { allBlocks, blockCategories }
