/**
 * RustBuilder - Full-Featured Visual Page Builder
 * A comprehensive drag-and-drop page editor similar to Elementor
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft, Save, Eye, Settings, Undo, Redo, Smartphone, Tablet, Monitor,
  Loader2, Plus, Trash2, Copy, GripVertical, ChevronRight, ChevronDown,
  Type, Image, Video, Square, Columns, Box, Layout, MousePointer,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
  List, ListOrdered, Link, Code, Quote, Minus, CircleDot, FormInput,
  Mail, Phone, MapPin, Calendar, Clock, Star, Heart, Share2, Download,
  Play, Pause, Volume2, Maximize2, Minimize2, RotateCcw, Layers, Palette,
  Move, Lock, Unlock, EyeOff, Paintbrush, Sliders, Grid, Zap, X,
  ChevronLeft, PanelLeftClose, PanelRightClose, FileText, Globe, Search,
  Menu, MoreVertical, ExternalLink, Sparkles, Wand2, SlidersHorizontal,
  LayoutGrid, LayoutList, Navigation, Footer, Sidebar, Component,
  Table, BarChart, PieChart, LineChart, Database, ShoppingCart, CreditCard,
  User, Users, MessageSquare, ThumbsUp, Award, Target, Bookmark, Tag,
  Folder, File, Upload, CloudUpload, RefreshCw, Check, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// =============================================================================
// TYPES
// =============================================================================

// Block settings following RustBuilder API format
interface BlockSettings {
  // Content settings
  text?: string;
  level?: number | string;
  src?: string;
  alt?: string;
  url?: string;
  target?: string;
  placeholder?: string;

  // Style settings
  color?: string;
  backgroundColor?: string;
  background?: string;
  textAlign?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;

  // Layout settings
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;

  // Border settings
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  borderRadius?: string;

  // Dimension settings
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;

  // Flex/Grid settings
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  columns?: number;

  // Effects
  opacity?: number;
  boxShadow?: string;
  transform?: string;
  transition?: string;

  // Custom properties
  [key: string]: any;
}

interface Block {
  id: string;
  type: string;
  settings: BlockSettings;
  children?: Block[];
  locked?: boolean;
  hidden?: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  blocks: Block[];
}

type Viewport = 'desktop' | 'tablet' | 'mobile';
type Panel = 'blocks' | 'layers' | 'settings' | 'styles' | 'templates' | null;

// =============================================================================
// BLOCK DEFINITIONS
// =============================================================================

const BLOCK_CATEGORIES = [
  {
    id: 'layout',
    name: 'Layout',
    icon: Layout,
    blocks: [
      { type: 'section', name: 'Section', icon: Square, description: 'Full-width container' },
      { type: 'container', name: 'Container', icon: Box, description: 'Centered container' },
      { type: 'row', name: 'Row', icon: Columns, description: 'Horizontal row' },
      { type: 'column', name: 'Column', icon: Sidebar, description: 'Flexible column' },
      { type: 'grid', name: 'Grid', icon: Grid, description: 'CSS Grid layout' },
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: Type,
    blocks: [
      { type: 'heading', name: 'Heading', icon: Type, description: 'H1-H6 heading' },
      { type: 'paragraph', name: 'Paragraph', icon: AlignLeft, description: 'Text paragraph' },
      { type: 'button', name: 'Button', icon: MousePointer, description: 'Call to action' },
      { type: 'image', name: 'Image', icon: Image, description: 'Image with options' },
      { type: 'video', name: 'Video', icon: Video, description: 'Video embed' },
      { type: 'divider', name: 'Divider', icon: Minus, description: 'Horizontal line' },
      { type: 'spacer', name: 'Spacer', icon: Move, description: 'Vertical space' },
    ]
  },
  {
    id: 'content',
    name: 'Content',
    icon: FileText,
    blocks: [
      { type: 'richtext', name: 'Rich Text', icon: FileText, description: 'Formatted text' },
      { type: 'list', name: 'List', icon: List, description: 'Bullet/numbered list' },
      { type: 'quote', name: 'Quote', icon: Quote, description: 'Blockquote' },
      { type: 'code', name: 'Code', icon: Code, description: 'Code snippet' },
      { type: 'table', name: 'Table', icon: Table, description: 'Data table' },
      { type: 'accordion', name: 'Accordion', icon: ChevronDown, description: 'Collapsible content' },
      { type: 'tabs', name: 'Tabs', icon: Folder, description: 'Tabbed content' },
    ]
  },
  {
    id: 'media',
    name: 'Media',
    icon: Image,
    blocks: [
      { type: 'gallery', name: 'Gallery', icon: LayoutGrid, description: 'Image gallery' },
      { type: 'carousel', name: 'Carousel', icon: Play, description: 'Image slider' },
      { type: 'audio', name: 'Audio', icon: Volume2, description: 'Audio player' },
      { type: 'embed', name: 'Embed', icon: Code, description: 'External embed' },
      { type: 'icon', name: 'Icon', icon: Star, description: 'Icon element' },
      { type: 'lottie', name: 'Lottie', icon: Sparkles, description: 'Lottie animation' },
    ]
  },
  {
    id: 'interactive',
    name: 'Interactive',
    icon: MousePointer,
    blocks: [
      { type: 'form', name: 'Form', icon: FormInput, description: 'Contact form' },
      { type: 'input', name: 'Input', icon: FormInput, description: 'Form input' },
      { type: 'textarea', name: 'Textarea', icon: AlignLeft, description: 'Text area' },
      { type: 'select', name: 'Select', icon: ChevronDown, description: 'Dropdown' },
      { type: 'checkbox', name: 'Checkbox', icon: Check, description: 'Checkbox' },
      { type: 'radio', name: 'Radio', icon: CircleDot, description: 'Radio button' },
      { type: 'searchbox', name: 'Search', icon: Search, description: 'Search box' },
    ]
  },
  {
    id: 'widgets',
    name: 'Widgets',
    icon: Component,
    blocks: [
      { type: 'socialicons', name: 'Social Icons', icon: Share2, description: 'Social links' },
      { type: 'testimonial', name: 'Testimonial', icon: Quote, description: 'Customer review' },
      { type: 'pricing', name: 'Pricing', icon: CreditCard, description: 'Pricing table' },
      { type: 'countdown', name: 'Countdown', icon: Clock, description: 'Timer' },
      { type: 'progress', name: 'Progress', icon: Target, description: 'Progress bar' },
      { type: 'counter', name: 'Counter', icon: BarChart, description: 'Animated number' },
      { type: 'map', name: 'Map', icon: MapPin, description: 'Google Map' },
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: Navigation,
    blocks: [
      { type: 'menu', name: 'Menu', icon: Menu, description: 'Navigation menu' },
      { type: 'breadcrumb', name: 'Breadcrumb', icon: ChevronRight, description: 'Breadcrumbs' },
      { type: 'pagination', name: 'Pagination', icon: MoreVertical, description: 'Page numbers' },
      { type: 'anchor', name: 'Anchor', icon: Link, description: 'Scroll anchor' },
      { type: 'backtotop', name: 'Back to Top', icon: ChevronLeft, description: 'Scroll button' },
    ]
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    icon: Database,
    blocks: [
      { type: 'posts', name: 'Posts', icon: FileText, description: 'Post list' },
      { type: 'postmeta', name: 'Post Meta', icon: Tag, description: 'Post metadata' },
      { type: 'author', name: 'Author', icon: User, description: 'Author box' },
      { type: 'comments', name: 'Comments', icon: MessageSquare, description: 'Comments list' },
      { type: 'related', name: 'Related', icon: Layers, description: 'Related posts' },
    ]
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create a new block with default settings - compatible with RustBuilder API
const createBlock = (type: string): Block => {
  const defaults: Record<string, { settings: BlockSettings; children?: Block[] }> = {
    // Layout blocks
    section: { settings: { backgroundColor: '#ffffff', paddingTop: '60px', paddingBottom: '60px', width: '100%' }, children: [] },
    container: { settings: { maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px' }, children: [] },
    row: { settings: { display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }, children: [] },
    column: { settings: { display: 'flex', flexDirection: 'column', width: '50%', minHeight: '100px' }, children: [] },
    grid: { settings: { display: 'grid', columns: 3, gap: '20px' }, children: [] },

    // Basic blocks
    heading: { settings: { text: 'Add your heading here', level: 2, fontSize: '32px', fontWeight: '700', color: '#1f2937' } },
    paragraph: { settings: { text: 'Add your paragraph text here. Click to edit and start typing.', fontSize: '16px', lineHeight: '1.6', color: '#4b5563' } },
    button: { settings: { text: 'Click Here', url: '#', target: '_self', backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600' } },
    image: { settings: { src: '/placeholder.jpg', alt: 'Image', width: '100%', borderRadius: '8px' } },
    video: { settings: { src: '', type: 'youtube', autoplay: false, width: '100%' } },
    divider: { settings: { borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', marginTop: '20px', marginBottom: '20px' } },
    spacer: { settings: { height: '40px' } },

    // Content blocks
    richtext: { settings: { text: '<p>Rich text content here...</p>' } },
    list: { settings: { items: ['Item 1', 'Item 2', 'Item 3'], type: 'bullet' } },
    quote: { settings: { text: 'This is a blockquote', author: 'Author Name', fontSize: '18px', fontStyle: 'italic' } },
    code: { settings: { code: '// Your code here', language: 'javascript' } },
    table: { settings: { rows: 3, columns: 3 } },
    accordion: { settings: { items: [{ title: 'Accordion Title', content: 'Content here' }] } },
    tabs: { settings: { tabs: [{ title: 'Tab 1', content: 'Tab content' }] } },

    // Media blocks
    gallery: { settings: { images: [], columns: 3, gap: '10px' } },
    carousel: { settings: { images: [], autoplay: true, interval: 5000 } },
    audio: { settings: { src: '' } },
    embed: { settings: { url: '', type: 'iframe' } },
    icon: { settings: { icon: 'star', size: '24px', color: '#3b82f6' } },
    lottie: { settings: { src: '', loop: true, autoplay: true } },

    // Interactive blocks
    form: { settings: { action: '', method: 'POST' }, children: [] },
    input: { settings: { type: 'text', placeholder: 'Enter text...', name: '' } },
    textarea: { settings: { placeholder: 'Enter text...', rows: 4 } },
    select: { settings: { options: ['Option 1', 'Option 2'], placeholder: 'Select...' } },
    checkbox: { settings: { label: 'Checkbox label', checked: false } },
    radio: { settings: { label: 'Radio label', name: 'radio-group' } },
    searchbox: { settings: { placeholder: 'Search...' } },

    // Widget blocks
    socialicons: { settings: { icons: ['facebook', 'twitter', 'instagram'], size: '24px' } },
    testimonial: { settings: { quote: 'Great product!', author: 'John Doe', avatar: '', rating: 5 } },
    pricing: { settings: { title: 'Basic', price: '$9.99', period: '/month', features: ['Feature 1', 'Feature 2'] } },
    countdown: { settings: { targetDate: new Date(Date.now() + 86400000).toISOString() } },
    progress: { settings: { value: 75, max: 100, showLabel: true } },
    counter: { settings: { value: 1000, duration: 2000, prefix: '', suffix: '+' } },
    map: { settings: { lat: 0, lng: 0, zoom: 12 } },

    // Navigation blocks
    menu: { settings: { items: [{ label: 'Home', url: '/' }] } },
    breadcrumb: { settings: { separator: '/' } },
    pagination: { settings: { currentPage: 1, totalPages: 10 } },
    anchor: { settings: { id: 'anchor-id' } },
    backtotop: { settings: { icon: 'arrow-up', position: 'bottom-right' } },

    // Dynamic blocks
    posts: { settings: { count: 3, columns: 3, showExcerpt: true } },
    postmeta: { settings: { show: ['date', 'author', 'category'] } },
    author: { settings: { showAvatar: true, showBio: true } },
    comments: { settings: { orderBy: 'date', order: 'desc' } },
    related: { settings: { count: 3, showThumbnail: true } },
  };

  const config = defaults[type] || { settings: {} };

  return {
    id: generateId(),
    type,
    settings: config.settings,
    children: config.children,
  };
};

// Convert settings to inline CSS styles
const settingsToStyle = (settings: BlockSettings): React.CSSProperties => {
  const style: React.CSSProperties = {};

  // Background
  if (settings.backgroundColor) style.backgroundColor = settings.backgroundColor;
  if (settings.background) style.background = settings.background;

  // Typography
  if (settings.color) style.color = settings.color;
  if (settings.fontSize) style.fontSize = settings.fontSize;
  if (settings.fontWeight) style.fontWeight = settings.fontWeight as any;
  if (settings.fontFamily) style.fontFamily = settings.fontFamily;
  if (settings.lineHeight) style.lineHeight = settings.lineHeight;
  if (settings.textAlign) style.textAlign = settings.textAlign as any;

  // Padding
  if (settings.padding) style.padding = settings.padding;
  if (settings.paddingTop) style.paddingTop = settings.paddingTop;
  if (settings.paddingBottom) style.paddingBottom = settings.paddingBottom;
  if (settings.paddingLeft) style.paddingLeft = settings.paddingLeft;
  if (settings.paddingRight) style.paddingRight = settings.paddingRight;

  // Margin
  if (settings.margin) style.margin = settings.margin;
  if (settings.marginTop) style.marginTop = settings.marginTop;
  if (settings.marginBottom) style.marginBottom = settings.marginBottom;
  if (settings.marginLeft) style.marginLeft = settings.marginLeft;
  if (settings.marginRight) style.marginRight = settings.marginRight;

  // Border
  if (settings.borderWidth) style.borderWidth = settings.borderWidth;
  if (settings.borderStyle) style.borderStyle = settings.borderStyle as any;
  if (settings.borderColor) style.borderColor = settings.borderColor;
  if (settings.borderRadius) style.borderRadius = settings.borderRadius;

  // Dimensions
  if (settings.width) style.width = settings.width;
  if (settings.height) style.height = settings.height;
  if (settings.minHeight) style.minHeight = settings.minHeight;
  if (settings.maxWidth) style.maxWidth = settings.maxWidth;

  // Flex/Grid
  if (settings.display) style.display = settings.display as any;
  if (settings.flexDirection) style.flexDirection = settings.flexDirection as any;
  if (settings.justifyContent) style.justifyContent = settings.justifyContent as any;
  if (settings.alignItems) style.alignItems = settings.alignItems as any;
  if (settings.gap) style.gap = settings.gap;

  // Effects
  if (settings.opacity !== undefined) style.opacity = settings.opacity;
  if (settings.boxShadow) style.boxShadow = settings.boxShadow;
  if (settings.transform) style.transform = settings.transform;
  if (settings.transition) style.transition = settings.transition;

  return style;
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Block Renderer
const BlockRenderer: React.FC<{
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  viewport: Viewport;
  depth?: number;
}> = ({ block, selected, onSelect, onUpdate, onDelete, onDuplicate, viewport, depth = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Convert block settings to CSS styles
  const getBlockStyles = (): React.CSSProperties => {
    return settingsToStyle(block.settings);
  };

  // Update block settings
  const handleSettingsChange = (updates: Partial<BlockSettings>) => {
    onUpdate({ ...block, settings: { ...block.settings, ...updates } });
  };

  const renderBlockContent = () => {
    const { settings } = block;

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${settings.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              handleSettingsChange({ text: e.currentTarget.textContent || '' });
              setIsEditing(false);
            }}
            onDoubleClick={() => setIsEditing(true)}
            className="outline-none"
            style={{
              fontSize: settings.fontSize,
              fontWeight: settings.fontWeight as any,
              color: settings.color,
              textAlign: settings.textAlign as any,
            }}
          >
            {settings.text || 'Heading'}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              handleSettingsChange({ text: e.currentTarget.textContent || '' });
              setIsEditing(false);
            }}
            onDoubleClick={() => setIsEditing(true)}
            className="outline-none"
            style={{
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
              color: settings.color,
              textAlign: settings.textAlign as any,
            }}
          >
            {settings.text || 'Paragraph text'}
          </p>
        );

      case 'button':
        return (
          <button
            className="inline-block cursor-pointer"
            onClick={(e) => e.preventDefault()}
            onDoubleClick={() => setIsEditing(true)}
            style={{
              backgroundColor: settings.backgroundColor,
              color: settings.color,
              padding: settings.padding,
              borderRadius: settings.borderRadius,
              fontWeight: settings.fontWeight as any,
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={settings.text || 'Button'}
                onChange={(e) => handleSettingsChange({ text: e.target.value })}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="bg-transparent border-none outline-none text-inherit font-inherit"
              />
            ) : (
              settings.text || 'Button'
            )}
          </button>
        );

      case 'image':
        return settings.src ? (
          <img
            src={settings.src}
            alt={settings.alt || ''}
            className="max-w-full h-auto"
            style={{ borderRadius: settings.borderRadius }}
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[200px]">
            <div className="text-center text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click to add image</p>
            </div>
          </div>
        );

      case 'video':
        return settings.src ? (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={settings.src}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-900 rounded-lg p-8 aspect-video">
            <div className="text-center text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click to add video</p>
            </div>
          </div>
        );

      case 'divider':
        return (
          <hr
            style={{
              borderWidth: settings.borderWidth,
              borderStyle: settings.borderStyle as any,
              borderColor: settings.borderColor,
              margin: `${settings.marginTop || '20px'} 0 ${settings.marginBottom || '20px'} 0`,
            }}
          />
        );

      case 'spacer':
        return <div style={{ height: settings.height || '40px' }} />;

      case 'section':
      case 'container':
      case 'row':
      case 'column':
      case 'grid':
        return (
          <div className="min-h-[60px]">
            {block.children && block.children.length > 0 ? (
              block.children.map((child, index) => (
                <BlockRenderer
                  key={child.id}
                  block={child}
                  selected={false}
                  onSelect={() => {}}
                  onUpdate={(updated) => {
                    const newChildren = [...(block.children || [])];
                    newChildren[index] = updated;
                    onUpdate({ ...block, children: newChildren });
                  }}
                  onDelete={() => {
                    const newChildren = (block.children || []).filter((_, i) => i !== index);
                    onUpdate({ ...block, children: newChildren });
                  }}
                  onDuplicate={() => {
                    const newChildren = [...(block.children || [])];
                    newChildren.splice(index + 1, 0, { ...child, id: generateId() });
                    onUpdate({ ...block, children: newChildren });
                  }}
                  viewport={viewport}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Drop blocks here
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded text-gray-500 text-sm">
            {block.type} block
          </div>
        );
    }
  };

  if (block.hidden) return null;

  return (
    <div
      className={clsx(
        'relative group transition-all',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        isHovered && !selected && 'ring-2 ring-blue-300 ring-offset-1',
        block.locked && 'opacity-75'
      )}
      style={getBlockStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Block Toolbar */}
      <AnimatePresence>
        {(selected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-0 z-50 flex items-center gap-1 bg-gray-900 rounded-lg shadow-lg p-1"
          >
            <div className="flex items-center gap-1 px-2 text-xs text-white font-medium">
              <GripVertical className="w-3 h-3 cursor-grab" />
              {block.type}
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {renderBlockContent()}
    </div>
  );
};

// Style Editor Panel - works with flat settings structure
const StyleEditor: React.FC<{
  block: Block | null;
  onUpdate: (settings: Partial<BlockSettings>) => void;
}> = ({ block, onUpdate }) => {
  if (!block) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Sliders className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select an element to edit styles</p>
      </div>
    );
  }

  const settings = block.settings;

  const updateSetting = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Content */}
      {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'button') && (
        <div className="border-b border-gray-700 pb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Content
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Text</label>
              <input
                type="text"
                value={settings.text || ''}
                onChange={(e) => updateSetting('text', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            {block.type === 'heading' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Heading Level</label>
                <select
                  value={settings.level || 2}
                  onChange={(e) => updateSetting('level', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <option key={level} value={level}>H{level}</option>
                  ))}
                </select>
              </div>
            )}
            {block.type === 'button' && (
              <>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">URL</label>
                  <input
                    type="text"
                    value={settings.url || '#'}
                    onChange={(e) => updateSetting('url', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Target</label>
                  <select
                    value={settings.target || '_self'}
                    onChange={(e) => updateSetting('target', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image/Video Settings */}
      {(block.type === 'image' || block.type === 'video') && (
        <div className="border-b border-gray-700 pb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <Image className="w-3.5 h-3.5" /> Media
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">{block.type === 'image' ? 'Image URL' : 'Video URL'}</label>
              <input
                type="text"
                value={settings.src || ''}
                onChange={(e) => updateSetting('src', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                placeholder={block.type === 'image' ? 'https://...' : 'YouTube/Vimeo URL'}
              />
            </div>
            {block.type === 'image' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Alt Text</label>
                <input
                  type="text"
                  value={settings.alt || ''}
                  onChange={(e) => updateSetting('alt', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Typography */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Type className="w-3.5 h-3.5" /> Typography
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Font Size</label>
            <input
              type="text"
              value={settings.fontSize || '16px'}
              onChange={(e) => updateSetting('fontSize', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Font Weight</label>
            <select
              value={settings.fontWeight || '400'}
              onChange={(e) => updateSetting('fontWeight', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.color || '#000000'}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.color || '#000000'}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Text Align</label>
            <div className="flex gap-1">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
                { value: 'justify', icon: AlignJustify },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('textAlign', value)}
                  className={clsx(
                    'p-2 rounded',
                    settings.textAlign === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Paintbrush className="w-3.5 h-3.5" /> Background
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.backgroundColor || '#ffffff'}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.backgroundColor || ''}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Background (CSS)</label>
            <input
              type="text"
              value={settings.background || ''}
              onChange={(e) => updateSetting('background', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              placeholder="linear-gradient(...) or url(...)"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Move className="w-3.5 h-3.5" /> Spacing
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Padding</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { key: 'paddingTop', label: 'T' },
                { key: 'paddingRight', label: 'R' },
                { key: 'paddingBottom', label: 'B' },
                { key: 'paddingLeft', label: 'L' },
              ].map(({ key, label }) => (
                <input
                  key={key}
                  type="text"
                  value={settings[key] || '0'}
                  onChange={(e) => updateSetting(key, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                  placeholder={label}
                  title={key}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Margin</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { key: 'marginTop', label: 'T' },
                { key: 'marginRight', label: 'R' },
                { key: 'marginBottom', label: 'B' },
                { key: 'marginLeft', label: 'L' },
              ].map(({ key, label }) => (
                <input
                  key={key}
                  type="text"
                  value={settings[key] || '0'}
                  onChange={(e) => updateSetting(key, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                  placeholder={label}
                  title={key}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Border */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Square className="w-3.5 h-3.5" /> Border
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Width</label>
              <input
                type="text"
                value={settings.borderWidth || '0'}
                onChange={(e) => updateSetting('borderWidth', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Radius</label>
              <input
                type="text"
                value={settings.borderRadius || '0'}
                onChange={(e) => updateSetting('borderRadius', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Border Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.borderColor || '#e5e7eb'}
                onChange={(e) => updateSetting('borderColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.borderColor || '#e5e7eb'}
                onChange={(e) => updateSetting('borderColor', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Border Style</label>
            <select
              value={settings.borderStyle || 'solid'}
              onChange={(e) => updateSetting('borderStyle', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5" /> Dimensions
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Width</label>
              <input
                type="text"
                value={settings.width || 'auto'}
                onChange={(e) => updateSetting('width', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Height</label>
              <input
                type="text"
                value={settings.height || 'auto'}
                onChange={(e) => updateSetting('height', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Min Height</label>
              <input
                type="text"
                value={settings.minHeight || 'auto'}
                onChange={(e) => updateSetting('minHeight', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Width</label>
              <input
                type="text"
                value={settings.maxWidth || 'none'}
                onChange={(e) => updateSetting('maxWidth', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PageBuilder: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<Panel>('blocks');
  const [rightPanel, setRightPanel] = useState<Panel>('styles');
  const [history, setHistory] = useState<Block[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['layout', 'basic']);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(100);
  const [layoutData, setLayoutData] = useState<any>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Find selected block
  const findBlock = useCallback((blocks: Block[], id: string): Block | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlock(block.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const selectedBlock = selectedBlockId ? findBlock(blocks, selectedBlockId) : null;

  // Load layout
  useEffect(() => {
    const fetchLayout = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/rustbuilder/layouts/by-post/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setLayoutData(data.data);
          if (data.data?.content_json?.blocks) {
            setBlocks(data.data.content_json.blocks);
          }
        }
      } catch (err) {
        console.error('Error fetching layout:', err);
        toast.error('Failed to load layout');
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [postId]);

  // History management
  const pushHistory = useCallback((newBlocks: Block[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newBlocks)));
    setHistory(newHistory.slice(-50)); // Keep last 50 states
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  // Block operations
  const addBlock = useCallback((type: string) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${type} block`);
  }, [blocks, pushHistory]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    const updateInBlocks = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === id) {
          return { ...block, ...updates };
        }
        if (block.children) {
          return { ...block, children: updateInBlocks(block.children) };
        }
        return block;
      });
    };
    const newBlocks = updateInBlocks(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
  }, [blocks, pushHistory]);

  const deleteBlock = useCallback((id: string) => {
    const deleteFromBlocks = (blocks: Block[]): Block[] => {
      return blocks.filter(block => {
        if (block.id === id) return false;
        if (block.children) {
          block.children = deleteFromBlocks(block.children);
        }
        return true;
      });
    };
    const newBlocks = deleteFromBlocks(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Block deleted');
  }, [blocks, selectedBlockId, pushHistory]);

  const duplicateBlock = useCallback((id: string) => {
    const duplicateInBlocks = (blocks: Block[]): Block[] => {
      const result: Block[] = [];
      for (const block of blocks) {
        result.push(block);
        if (block.id === id) {
          const duplicate = JSON.parse(JSON.stringify(block));
          duplicate.id = generateId();
          result.push(duplicate);
        }
        if (block.children) {
          block.children = duplicateInBlocks(block.children);
        }
      }
      return result;
    };
    const newBlocks = duplicateInBlocks(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    toast.success('Block duplicated');
  }, [blocks, pushHistory]);

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const payload = {
        author_id: userId,
        content_json: { version: '1.0', blocks },
      };

      const url = layoutData?.id
        ? `/api/v1/rustbuilder/layouts/${layoutData.id}/save`
        : `/api/v1/rustbuilder/layouts`;

      const method = layoutData?.id ? 'POST' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layoutData?.id ? payload : {
          post_id: postId,
          post_type: 'page',
          author_id: userId,
          content_json: { version: '1.0', blocks },
        }),
      });

      if (response.ok) {
        toast.success('Layout saved successfully');
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  // Viewport width
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  // Filter blocks by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return BLOCK_CATEGORIES;
    return BLOCK_CATEGORIES.map(cat => ({
      ...cat,
      blocks: cat.blocks.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.blocks.length > 0);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
            <Layers className="absolute inset-0 m-auto w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Page Builder</h2>
          <p className="text-gray-400">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Exit</span>
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLeftPanel(leftPanel === 'blocks' ? null : 'blocks')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                leftPanel === 'blocks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title="Blocks"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLeftPanel(leftPanel === 'layers' ? null : 'layers')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                leftPanel === 'layers' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title="Layers"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport */}
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            {[
              { key: 'desktop', icon: Monitor, label: 'Desktop' },
              { key: 'tablet', icon: Tablet, label: 'Tablet' },
              { key: 'mobile', icon: Smartphone, label: 'Mobile' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setViewport(key as Viewport)}
                className={clsx(
                  'p-2 rounded transition-colors',
                  viewport === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                )}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-700" />

          {/* Zoom */}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <span className="w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="p-1 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-700" />

          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/preview/${postId}`, '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="text-sm font-medium">Save</span>
          </button>

          <button
            onClick={() => setRightPanel(rightPanel === 'styles' ? null : 'styles')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              rightPanel === 'styles' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <AnimatePresence>
          {leftPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden shrink-0"
            >
              <div className="p-3 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search blocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {leftPanel === 'blocks' && (
                  <div className="space-y-2">
                    {filteredCategories.map((category) => (
                      <div key={category.id}>
                        <button
                          onClick={() => setExpandedCategories(
                            expandedCategories.includes(category.id)
                              ? expandedCategories.filter(id => id !== category.id)
                              : [...expandedCategories, category.id]
                          )}
                          className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.name}
                          </div>
                          <ChevronRight className={clsx(
                            'w-4 h-4 transition-transform',
                            expandedCategories.includes(category.id) && 'rotate-90'
                          )} />
                        </button>

                        <AnimatePresence>
                          {expandedCategories.includes(category.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-2 p-2">
                                {category.blocks.map((block) => (
                                  <button
                                    key={block.type}
                                    onClick={() => addBlock(block.type)}
                                    className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                                    title={block.description}
                                  >
                                    <block.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                                    <span className="text-xs text-gray-400 group-hover:text-white">{block.name}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}

                {leftPanel === 'layers' && (
                  <div className="space-y-1">
                    {blocks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No elements yet</p>
                      </div>
                    ) : (
                      blocks.map((block, index) => (
                        <button
                          key={block.id}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={clsx(
                            'w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
                            selectedBlockId === block.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          )}
                        >
                          <GripVertical className="w-4 h-4 opacity-50 cursor-grab" />
                          <span className="capitalize">{block.type}</span>
                          {block.hidden && <EyeOff className="w-3 h-3 ml-auto opacity-50" />}
                          {block.locked && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <main className="flex-1 overflow-auto bg-gray-950 p-8">
          <div
            ref={canvasRef}
            className="mx-auto transition-all duration-300"
            style={{
              width: getViewportWidth(),
              maxWidth: '100%',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div
              className="bg-white min-h-[600px] shadow-2xl rounded-lg overflow-hidden"
              onClick={() => setSelectedBlockId(null)}
            >
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                    <Plus className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Building</h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Add blocks from the left panel or choose a template to get started quickly.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => addBlock('section')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                    <button
                      onClick={() => setLeftPanel('blocks')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Browse Blocks
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {blocks.map((block, index) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      selected={selectedBlockId === block.id}
                      onSelect={() => setSelectedBlockId(block.id)}
                      onUpdate={(updated) => updateBlock(block.id, updated)}
                      onDelete={() => deleteBlock(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                      viewport={viewport}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <AnimatePresence>
          {rightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden shrink-0"
            >
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {selectedBlock ? `${selectedBlock.type} Settings` : 'Element Settings'}
                </h3>
                <button
                  onClick={() => setRightPanel(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <StyleEditor
                  block={selectedBlock}
                  onUpdate={(settingsUpdate) => {
                    if (selectedBlockId && selectedBlock) {
                      updateBlock(selectedBlockId, {
                        settings: { ...selectedBlock.settings, ...settingsUpdate }
                      });
                    }
                  }}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PageBuilder;
