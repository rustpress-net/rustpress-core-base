import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Element Categories
export type ElementCategory =
  | 'content'
  | 'media'
  | 'social'
  | 'navigation'
  | 'forms'
  | 'ecommerce'
  | 'interactive'
  | 'layout'
  | 'data'
  | 'custom'
  | 'marketing'
  | 'analytics'
  | 'booking'
  | 'maps'
  | 'portfolio';

// Element Types - 50+ modern elements
export type ElementType =
  // Content Elements (12)
  | 'text-block'
  | 'heading'
  | 'rich-text'
  | 'blockquote'
  | 'code-block'
  | 'divider'
  | 'spacer'
  | 'list'
  | 'table'
  | 'faq-accordion'
  | 'testimonial'
  | 'team-member'
  // Media Elements (10)
  | 'image'
  | 'image-gallery'
  | 'image-carousel'
  | 'video'
  | 'video-playlist'
  | 'audio-player'
  | 'before-after'
  | 'lightbox'
  | 'logo-grid'
  | 'icon-box'
  // Social Elements (8)
  | 'social-links'
  | 'social-feed'
  | 'twitter-feed'
  | 'instagram-feed'
  | 'facebook-feed'
  | 'share-buttons'
  | 'follow-buttons'
  | 'author-box'
  // Navigation Elements (6)
  | 'nav-menu'
  | 'breadcrumbs'
  | 'page-list'
  | 'category-list'
  | 'tag-cloud'
  | 'sitemap'
  // Form Elements (6)
  | 'search-form'
  | 'newsletter-form'
  | 'contact-form'
  | 'login-form'
  | 'survey-poll'
  | 'rating-form'
  // E-commerce Elements (8)
  | 'product-carousel'
  | 'product-grid'
  | 'price-table'
  | 'cart-widget'
  | 'wishlist'
  | 'recently-viewed'
  | 'sale-countdown'
  | 'promo-banner'
  // Interactive Elements (10)
  | 'accordion'
  | 'tabs'
  | 'countdown-timer'
  | 'progress-bar'
  | 'counter'
  | 'flip-box'
  | 'hover-card'
  | 'tooltip'
  | 'modal-trigger'
  | 'scroll-to-top'
  // Layout Elements (4)
  | 'container'
  | 'columns'
  | 'card'
  | 'alert-box'
  // Data Elements (6)
  | 'posts-list'
  | 'posts-grid'
  | 'posts-carousel'
  | 'calendar'
  | 'weather'
  | 'rss-feed'
  // Custom Elements (2)
  | 'custom-html'
  | 'shortcode'
  // Marketing Elements (10)
  | 'cta-banner'
  | 'popup-trigger'
  | 'announcement-bar'
  | 'lead-magnet'
  | 'exit-intent'
  | 'social-proof'
  | 'trust-badges'
  | 'comparison-table'
  | 'feature-list'
  | 'stats-counter'
  // Analytics Elements (8)
  | 'chart-bar'
  | 'chart-line'
  | 'chart-pie'
  | 'chart-donut'
  | 'stats-card'
  | 'metrics-grid'
  | 'leaderboard'
  | 'activity-feed'
  // Booking Elements (8)
  | 'appointment-booking'
  | 'event-list'
  | 'availability-calendar'
  | 'time-slots'
  | 'booking-form'
  | 'service-list'
  | 'staff-list'
  | 'reservation-widget'
  // Maps Elements (6)
  | 'google-map'
  | 'store-locator'
  | 'directions-widget'
  | 'location-card'
  | 'branch-list'
  | 'interactive-map'
  // Portfolio Elements (10)
  | 'project-grid'
  | 'project-carousel'
  | 'case-study'
  | 'client-logos'
  | 'skills-chart'
  | 'experience-timeline'
  | 'certifications'
  | 'awards-showcase'
  | 'portfolio-filter'
  | 'work-samples'
  // Additional Elements (8)
  | 'notification-bell'
  | 'cookie-consent'
  | 'age-verification'
  | 'language-switcher'
  | 'currency-switcher'
  | 'dark-mode-toggle'
  | 'qr-code'
  | 'live-chat';

// Element Style Configuration
export interface ElementStyle {
  // Container
  backgroundColor: string;
  backgroundGradient?: string;
  borderRadius: string;
  borderWidth: string;
  borderColor: string;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  padding: string;
  margin: string;
  boxShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: string;
  // Effects
  opacity: number;
  animation: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
  hoverEffect: 'none' | 'lift' | 'glow' | 'scale' | 'darken';
}

// Element Definition
export interface ElementDefinition {
  type: ElementType;
  label: string;
  category: ElementCategory;
  icon: string;
  description: string;
  defaultSettings: Record<string, any>;
  defaultStyle: Partial<ElementStyle>;
  settingsSchema: SettingField[];
}

// Settings Field Types
export interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'color' | 'image' | 'icon' | 'range' | 'multiselect' | 'repeater';
  defaultValue: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
  group?: string;
  condition?: { key: string; value: any };
  repeaterFields?: SettingField[];
}

// Sidebar Element Instance
export interface SidebarElement {
  id: string;
  type: ElementType;
  title: string;
  settings: Record<string, any>;
  style: Partial<ElementStyle>;
  isVisible: boolean;
  isExpanded: boolean;
}

// Default Style
const defaultElementStyle: ElementStyle = {
  backgroundColor: 'transparent',
  borderRadius: '8px',
  borderWidth: '0px',
  borderColor: '#e5e7eb',
  borderStyle: 'none',
  padding: '16px',
  margin: '0px',
  boxShadow: 'none',
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: '400',
  textColor: 'inherit',
  textAlign: 'left',
  lineHeight: '1.5',
  opacity: 1,
  animation: 'none',
  hoverEffect: 'none',
};

// 50+ Element Definitions
export const elementDefinitions: ElementDefinition[] = [
  // ==================== CONTENT ELEMENTS ====================
  {
    type: 'text-block',
    label: 'Text Block',
    category: 'content',
    icon: 'Type',
    description: 'Simple text paragraph',
    defaultSettings: { content: 'Enter your text here...', format: 'plain' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'content', label: 'Content', type: 'textarea', defaultValue: '', placeholder: 'Enter text...' },
      { key: 'format', label: 'Format', type: 'select', defaultValue: 'plain', options: [
        { value: 'plain', label: 'Plain Text' },
        { value: 'markdown', label: 'Markdown' },
      ]},
    ],
  },
  {
    type: 'heading',
    label: 'Heading',
    category: 'content',
    icon: 'Heading',
    description: 'Section heading with customizable level',
    defaultSettings: { text: 'Heading', level: 'h2', style: 'default' },
    defaultStyle: { fontWeight: '700', fontSize: '24px' },
    settingsSchema: [
      { key: 'text', label: 'Heading Text', type: 'text', defaultValue: 'Heading' },
      { key: 'level', label: 'Level', type: 'select', defaultValue: 'h2', options: [
        { value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' }, { value: 'h3', label: 'H3' },
        { value: 'h4', label: 'H4' }, { value: 'h5', label: 'H5' }, { value: 'h6', label: 'H6' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'underline', label: 'Underlined' },
        { value: 'accent', label: 'With Accent' }, { value: 'gradient', label: 'Gradient' },
      ]},
    ],
  },
  {
    type: 'rich-text',
    label: 'Rich Text',
    category: 'content',
    icon: 'FileText',
    description: 'Rich text editor with formatting',
    defaultSettings: { content: '<p>Rich content here...</p>' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'content', label: 'Content', type: 'textarea', defaultValue: '' },
    ],
  },
  {
    type: 'blockquote',
    label: 'Blockquote',
    category: 'content',
    icon: 'Quote',
    description: 'Styled quote block',
    defaultSettings: { quote: 'Enter your quote here...', author: '', source: '', style: 'default' },
    defaultStyle: { borderStyle: 'solid', borderWidth: '0 0 0 4px', borderColor: '#6366f1', padding: '16px 20px' },
    settingsSchema: [
      { key: 'quote', label: 'Quote Text', type: 'textarea', defaultValue: '' },
      { key: 'author', label: 'Author', type: 'text', defaultValue: '' },
      { key: 'source', label: 'Source', type: 'text', defaultValue: '' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'modern', label: 'Modern' },
        { value: 'minimal', label: 'Minimal' }, { value: 'card', label: 'Card' },
      ]},
    ],
  },
  {
    type: 'code-block',
    label: 'Code Block',
    category: 'content',
    icon: 'Code',
    description: 'Syntax-highlighted code',
    defaultSettings: { code: '// Your code here', language: 'javascript', showLineNumbers: true, theme: 'dark' },
    defaultStyle: { fontFamily: 'monospace', backgroundColor: '#1e1e1e', borderRadius: '8px' },
    settingsSchema: [
      { key: 'code', label: 'Code', type: 'textarea', defaultValue: '' },
      { key: 'language', label: 'Language', type: 'select', defaultValue: 'javascript', options: [
        { value: 'javascript', label: 'JavaScript' }, { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' }, { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' }, { value: 'rust', label: 'Rust' },
        { value: 'go', label: 'Go' }, { value: 'java', label: 'Java' },
      ]},
      { key: 'showLineNumbers', label: 'Show Line Numbers', type: 'checkbox', defaultValue: true },
      { key: 'theme', label: 'Theme', type: 'select', defaultValue: 'dark', options: [
        { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' },
      ]},
    ],
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'content',
    icon: 'Minus',
    description: 'Horizontal line separator',
    defaultSettings: { style: 'solid', width: '100%', color: '#e5e7eb', thickness: '1px' },
    defaultStyle: { margin: '20px 0' },
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'solid', options: [
        { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }, { value: 'gradient', label: 'Gradient' },
        { value: 'double', label: 'Double' },
      ]},
      { key: 'width', label: 'Width', type: 'text', defaultValue: '100%' },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#e5e7eb' },
      { key: 'thickness', label: 'Thickness', type: 'text', defaultValue: '1px' },
    ],
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'content',
    icon: 'Square',
    description: 'Empty space for layout',
    defaultSettings: { height: '40px' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'height', label: 'Height', type: 'text', defaultValue: '40px' },
    ],
  },
  {
    type: 'list',
    label: 'List',
    category: 'content',
    icon: 'List',
    description: 'Bulleted or numbered list',
    defaultSettings: { items: ['Item 1', 'Item 2', 'Item 3'], type: 'bullet', iconStyle: 'default' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'type', label: 'List Type', type: 'select', defaultValue: 'bullet', options: [
        { value: 'bullet', label: 'Bullet Points' }, { value: 'number', label: 'Numbered' },
        { value: 'icon', label: 'Custom Icons' }, { value: 'check', label: 'Checkmarks' },
      ]},
      { key: 'iconStyle', label: 'Icon Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' },
        { value: 'outline', label: 'Outline' },
      ]},
    ],
  },
  {
    type: 'table',
    label: 'Data Table',
    category: 'content',
    icon: 'Table',
    description: 'Responsive data table',
    defaultSettings: { headers: ['Column 1', 'Column 2'], rows: [['Cell 1', 'Cell 2']], striped: true, hoverable: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'striped', label: 'Striped Rows', type: 'checkbox', defaultValue: true },
      { key: 'hoverable', label: 'Hover Effect', type: 'checkbox', defaultValue: true },
      { key: 'bordered', label: 'Show Borders', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'faq-accordion',
    label: 'FAQ Accordion',
    category: 'content',
    icon: 'HelpCircle',
    description: 'Expandable FAQ section',
    defaultSettings: {
      items: [
        { question: 'What is this?', answer: 'This is an example FAQ item.' },
        { question: 'How does it work?', answer: 'Click to expand and see the answer.' }
      ],
      allowMultiple: false,
      iconPosition: 'right',
      style: 'default'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'allowMultiple', label: 'Allow Multiple Open', type: 'checkbox', defaultValue: false },
      { key: 'iconPosition', label: 'Icon Position', type: 'select', defaultValue: 'right', options: [
        { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'boxed', label: 'Boxed' },
        { value: 'minimal', label: 'Minimal' }, { value: 'bordered', label: 'Bordered' },
      ]},
    ],
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    category: 'content',
    icon: 'MessageCircle',
    description: 'Customer testimonial card',
    defaultSettings: {
      quote: 'This product changed my life!',
      author: 'John Doe',
      role: 'CEO, Company',
      avatar: '',
      rating: 5,
      style: 'card'
    },
    defaultStyle: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px' },
    settingsSchema: [
      { key: 'quote', label: 'Quote', type: 'textarea', defaultValue: '' },
      { key: 'author', label: 'Author Name', type: 'text', defaultValue: '' },
      { key: 'role', label: 'Role/Company', type: 'text', defaultValue: '' },
      { key: 'avatar', label: 'Avatar Image', type: 'image', defaultValue: '' },
      { key: 'rating', label: 'Rating (1-5)', type: 'range', defaultValue: 5, min: 1, max: 5 },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'card', options: [
        { value: 'card', label: 'Card' }, { value: 'minimal', label: 'Minimal' },
        { value: 'bubble', label: 'Speech Bubble' }, { value: 'centered', label: 'Centered' },
      ]},
    ],
  },
  {
    type: 'team-member',
    label: 'Team Member',
    category: 'content',
    icon: 'User',
    description: 'Team member profile card',
    defaultSettings: {
      name: 'John Doe',
      role: 'Developer',
      bio: 'A passionate developer.',
      photo: '',
      socialLinks: [],
      style: 'card'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'name', label: 'Name', type: 'text', defaultValue: '' },
      { key: 'role', label: 'Role', type: 'text', defaultValue: '' },
      { key: 'bio', label: 'Bio', type: 'textarea', defaultValue: '' },
      { key: 'photo', label: 'Photo', type: 'image', defaultValue: '' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'card', options: [
        { value: 'card', label: 'Card' }, { value: 'minimal', label: 'Minimal' },
        { value: 'overlay', label: 'Image Overlay' }, { value: 'horizontal', label: 'Horizontal' },
      ]},
    ],
  },

  // ==================== MEDIA ELEMENTS ====================
  {
    type: 'image',
    label: 'Image',
    category: 'media',
    icon: 'Image',
    description: 'Single image with options',
    defaultSettings: { src: '', alt: '', caption: '', link: '', lightbox: false, size: 'full' },
    defaultStyle: { borderRadius: '8px' },
    settingsSchema: [
      { key: 'src', label: 'Image', type: 'image', defaultValue: '' },
      { key: 'alt', label: 'Alt Text', type: 'text', defaultValue: '' },
      { key: 'caption', label: 'Caption', type: 'text', defaultValue: '' },
      { key: 'link', label: 'Link URL', type: 'text', defaultValue: '' },
      { key: 'lightbox', label: 'Open in Lightbox', type: 'checkbox', defaultValue: false },
      { key: 'size', label: 'Size', type: 'select', defaultValue: 'full', options: [
        { value: 'full', label: 'Full Width' }, { value: 'large', label: 'Large' },
        { value: 'medium', label: 'Medium' }, { value: 'small', label: 'Small' },
      ]},
    ],
  },
  {
    type: 'image-gallery',
    label: 'Image Gallery',
    category: 'media',
    icon: 'Grid',
    description: 'Grid of images',
    defaultSettings: { images: [], columns: 3, gap: '16px', lightbox: true, style: 'grid' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 3, min: 1, max: 6 },
      { key: 'gap', label: 'Gap', type: 'text', defaultValue: '16px' },
      { key: 'lightbox', label: 'Enable Lightbox', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'grid', options: [
        { value: 'grid', label: 'Grid' }, { value: 'masonry', label: 'Masonry' },
        { value: 'justified', label: 'Justified' },
      ]},
    ],
  },
  {
    type: 'image-carousel',
    label: 'Image Carousel',
    category: 'media',
    icon: 'Layers',
    description: 'Sliding image carousel',
    defaultSettings: {
      images: [],
      autoplay: true,
      interval: 5000,
      showDots: true,
      showArrows: true,
      effect: 'slide'
    },
    defaultStyle: { borderRadius: '12px' },
    settingsSchema: [
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: true },
      { key: 'interval', label: 'Interval (ms)', type: 'number', defaultValue: 5000 },
      { key: 'showDots', label: 'Show Dots', type: 'checkbox', defaultValue: true },
      { key: 'showArrows', label: 'Show Arrows', type: 'checkbox', defaultValue: true },
      { key: 'effect', label: 'Transition', type: 'select', defaultValue: 'slide', options: [
        { value: 'slide', label: 'Slide' }, { value: 'fade', label: 'Fade' },
        { value: 'zoom', label: 'Zoom' }, { value: 'flip', label: 'Flip' },
      ]},
    ],
  },
  {
    type: 'video',
    label: 'Video',
    category: 'media',
    icon: 'Video',
    description: 'Embedded video player',
    defaultSettings: {
      source: 'youtube',
      url: '',
      autoplay: false,
      muted: false,
      loop: false,
      controls: true,
      aspectRatio: '16:9'
    },
    defaultStyle: { borderRadius: '12px' },
    settingsSchema: [
      { key: 'source', label: 'Source', type: 'select', defaultValue: 'youtube', options: [
        { value: 'youtube', label: 'YouTube' }, { value: 'vimeo', label: 'Vimeo' },
        { value: 'self', label: 'Self-hosted' }, { value: 'embed', label: 'Embed Code' },
      ]},
      { key: 'url', label: 'Video URL', type: 'text', defaultValue: '' },
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: false },
      { key: 'muted', label: 'Muted', type: 'checkbox', defaultValue: false },
      { key: 'loop', label: 'Loop', type: 'checkbox', defaultValue: false },
      { key: 'controls', label: 'Show Controls', type: 'checkbox', defaultValue: true },
      { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', defaultValue: '16:9', options: [
        { value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' },
        { value: '1:1', label: '1:1' }, { value: '9:16', label: '9:16 (Vertical)' },
      ]},
    ],
  },
  {
    type: 'video-playlist',
    label: 'Video Playlist',
    category: 'media',
    icon: 'PlayCircle',
    description: 'Multiple videos playlist',
    defaultSettings: { videos: [], layout: 'list', autoAdvance: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'list', options: [
        { value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
      ]},
      { key: 'autoAdvance', label: 'Auto-advance', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'audio-player',
    label: 'Audio Player',
    category: 'media',
    icon: 'Music',
    description: 'Audio player widget',
    defaultSettings: { src: '', title: '', artist: '', cover: '', autoplay: false, style: 'minimal' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'src', label: 'Audio URL', type: 'text', defaultValue: '' },
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'artist', label: 'Artist', type: 'text', defaultValue: '' },
      { key: 'cover', label: 'Cover Image', type: 'image', defaultValue: '' },
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: false },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'minimal', options: [
        { value: 'minimal', label: 'Minimal' }, { value: 'full', label: 'Full Player' },
        { value: 'compact', label: 'Compact' },
      ]},
    ],
  },
  {
    type: 'before-after',
    label: 'Before/After',
    category: 'media',
    icon: 'Columns',
    description: 'Image comparison slider',
    defaultSettings: { beforeImage: '', afterImage: '', beforeLabel: 'Before', afterLabel: 'After', orientation: 'horizontal' },
    defaultStyle: { borderRadius: '12px' },
    settingsSchema: [
      { key: 'beforeImage', label: 'Before Image', type: 'image', defaultValue: '' },
      { key: 'afterImage', label: 'After Image', type: 'image', defaultValue: '' },
      { key: 'beforeLabel', label: 'Before Label', type: 'text', defaultValue: 'Before' },
      { key: 'afterLabel', label: 'After Label', type: 'text', defaultValue: 'After' },
      { key: 'orientation', label: 'Orientation', type: 'select', defaultValue: 'horizontal', options: [
        { value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' },
      ]},
    ],
  },
  {
    type: 'lightbox',
    label: 'Lightbox Gallery',
    category: 'media',
    icon: 'Maximize2',
    description: 'Fullscreen image gallery',
    defaultSettings: { images: [], thumbnailSize: 'medium', columns: 4 },
    defaultStyle: {},
    settingsSchema: [
      { key: 'thumbnailSize', label: 'Thumbnail Size', type: 'select', defaultValue: 'medium', options: [
        { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ]},
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 4, min: 2, max: 8 },
    ],
  },
  {
    type: 'logo-grid',
    label: 'Logo Grid',
    category: 'media',
    icon: 'Grid',
    description: 'Client/partner logos',
    defaultSettings: { logos: [], columns: 4, grayscale: true, hoverColor: true, gap: '24px' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 4, min: 2, max: 8 },
      { key: 'grayscale', label: 'Grayscale', type: 'checkbox', defaultValue: true },
      { key: 'hoverColor', label: 'Color on Hover', type: 'checkbox', defaultValue: true },
      { key: 'gap', label: 'Gap', type: 'text', defaultValue: '24px' },
    ],
  },
  {
    type: 'icon-box',
    label: 'Icon Box',
    category: 'media',
    icon: 'Box',
    description: 'Icon with text content',
    defaultSettings: { icon: 'Star', title: 'Feature Title', description: 'Feature description', iconPosition: 'top', style: 'default' },
    defaultStyle: { textAlign: 'center', padding: '24px' },
    settingsSchema: [
      { key: 'icon', label: 'Icon', type: 'icon', defaultValue: 'Star' },
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { key: 'iconPosition', label: 'Icon Position', type: 'select', defaultValue: 'top', options: [
        { value: 'top', label: 'Top' }, { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'boxed', label: 'Boxed' },
        { value: 'icon-circle', label: 'Circle Icon' }, { value: 'icon-square', label: 'Square Icon' },
      ]},
    ],
  },

  // ==================== SOCIAL ELEMENTS ====================
  {
    type: 'social-links',
    label: 'Social Links',
    category: 'social',
    icon: 'Share2',
    description: 'Social media profile links',
    defaultSettings: {
      links: [
        { platform: 'facebook', url: '' },
        { platform: 'twitter', url: '' },
        { platform: 'instagram', url: '' },
      ],
      style: 'icons',
      size: 'medium',
      shape: 'circle'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'icons', options: [
        { value: 'icons', label: 'Icons Only' }, { value: 'buttons', label: 'Buttons' },
        { value: 'text', label: 'Text Links' },
      ]},
      { key: 'size', label: 'Size', type: 'select', defaultValue: 'medium', options: [
        { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ]},
      { key: 'shape', label: 'Shape', type: 'select', defaultValue: 'circle', options: [
        { value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' },
        { value: 'rounded', label: 'Rounded' },
      ]},
    ],
  },
  {
    type: 'social-feed',
    label: 'Social Feed',
    category: 'social',
    icon: 'Rss',
    description: 'Combined social media feed',
    defaultSettings: { platforms: ['twitter', 'instagram'], count: 6, layout: 'grid' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'platforms', label: 'Platforms', type: 'multiselect', defaultValue: ['twitter', 'instagram'], options: [
        { value: 'twitter', label: 'Twitter/X' }, { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
      ]},
      { key: 'count', label: 'Posts Count', type: 'range', defaultValue: 6, min: 3, max: 12 },
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'grid', options: [
        { value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' },
        { value: 'masonry', label: 'Masonry' },
      ]},
    ],
  },
  {
    type: 'twitter-feed',
    label: 'Twitter/X Feed',
    category: 'social',
    icon: 'Twitter',
    description: 'Twitter timeline embed',
    defaultSettings: { username: '', count: 5, showReplies: false, theme: 'light' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'username', label: 'Username', type: 'text', defaultValue: '', placeholder: '@username' },
      { key: 'count', label: 'Tweet Count', type: 'range', defaultValue: 5, min: 1, max: 10 },
      { key: 'showReplies', label: 'Show Replies', type: 'checkbox', defaultValue: false },
      { key: 'theme', label: 'Theme', type: 'select', defaultValue: 'light', options: [
        { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
      ]},
    ],
  },
  {
    type: 'instagram-feed',
    label: 'Instagram Feed',
    category: 'social',
    icon: 'Instagram',
    description: 'Instagram photos grid',
    defaultSettings: { username: '', count: 9, columns: 3, showLikes: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'username', label: 'Username', type: 'text', defaultValue: '', placeholder: '@username' },
      { key: 'count', label: 'Post Count', type: 'range', defaultValue: 9, min: 3, max: 12 },
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 3, min: 2, max: 4 },
      { key: 'showLikes', label: 'Show Likes', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'facebook-feed',
    label: 'Facebook Feed',
    category: 'social',
    icon: 'Facebook',
    description: 'Facebook page feed',
    defaultSettings: { pageUrl: '', showFaces: true, showStream: true, height: 400 },
    defaultStyle: {},
    settingsSchema: [
      { key: 'pageUrl', label: 'Page URL', type: 'text', defaultValue: '' },
      { key: 'showFaces', label: 'Show Faces', type: 'checkbox', defaultValue: true },
      { key: 'showStream', label: 'Show Stream', type: 'checkbox', defaultValue: true },
      { key: 'height', label: 'Height (px)', type: 'number', defaultValue: 400 },
    ],
  },
  {
    type: 'share-buttons',
    label: 'Share Buttons',
    category: 'social',
    icon: 'Share',
    description: 'Social sharing buttons',
    defaultSettings: {
      platforms: ['facebook', 'twitter', 'linkedin', 'email'],
      style: 'buttons',
      showCounts: false,
      label: 'Share'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'platforms', label: 'Platforms', type: 'multiselect', defaultValue: ['facebook', 'twitter'], options: [
        { value: 'facebook', label: 'Facebook' }, { value: 'twitter', label: 'Twitter/X' },
        { value: 'linkedin', label: 'LinkedIn' }, { value: 'pinterest', label: 'Pinterest' },
        { value: 'email', label: 'Email' }, { value: 'whatsapp', label: 'WhatsApp' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'buttons', options: [
        { value: 'buttons', label: 'Buttons' }, { value: 'icons', label: 'Icons' },
        { value: 'minimal', label: 'Minimal' },
      ]},
      { key: 'showCounts', label: 'Show Share Counts', type: 'checkbox', defaultValue: false },
      { key: 'label', label: 'Button Label', type: 'text', defaultValue: 'Share' },
    ],
  },
  {
    type: 'follow-buttons',
    label: 'Follow Buttons',
    category: 'social',
    icon: 'UserPlus',
    description: 'Social follow buttons',
    defaultSettings: { platforms: ['twitter', 'instagram', 'youtube'], showFollowerCount: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'platforms', label: 'Platforms', type: 'multiselect', defaultValue: ['twitter'], options: [
        { value: 'twitter', label: 'Twitter/X' }, { value: 'instagram', label: 'Instagram' },
        { value: 'youtube', label: 'YouTube' }, { value: 'facebook', label: 'Facebook' },
        { value: 'tiktok', label: 'TikTok' },
      ]},
      { key: 'showFollowerCount', label: 'Show Follower Count', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'author-box',
    label: 'Author Box',
    category: 'social',
    icon: 'User',
    description: 'Author bio and links',
    defaultSettings: {
      name: 'Author Name',
      bio: 'Author biography...',
      avatar: '',
      showSocial: true,
      showPosts: true,
      style: 'card'
    },
    defaultStyle: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px' },
    settingsSchema: [
      { key: 'name', label: 'Name', type: 'text', defaultValue: '' },
      { key: 'bio', label: 'Bio', type: 'textarea', defaultValue: '' },
      { key: 'avatar', label: 'Avatar', type: 'image', defaultValue: '' },
      { key: 'showSocial', label: 'Show Social Links', type: 'checkbox', defaultValue: true },
      { key: 'showPosts', label: 'Show Recent Posts', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'card', options: [
        { value: 'card', label: 'Card' }, { value: 'minimal', label: 'Minimal' },
        { value: 'horizontal', label: 'Horizontal' },
      ]},
    ],
  },

  // ==================== NAVIGATION ELEMENTS ====================
  {
    type: 'nav-menu',
    label: 'Navigation Menu',
    category: 'navigation',
    icon: 'Menu',
    description: 'Custom navigation menu',
    defaultSettings: { menuId: '', orientation: 'vertical', showIcons: false, style: 'default' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'menuId', label: 'Menu', type: 'select', defaultValue: '', options: [] },
      { key: 'orientation', label: 'Orientation', type: 'select', defaultValue: 'vertical', options: [
        { value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' },
      ]},
      { key: 'showIcons', label: 'Show Icons', type: 'checkbox', defaultValue: false },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'pills', label: 'Pills' },
        { value: 'underline', label: 'Underline' }, { value: 'boxed', label: 'Boxed' },
      ]},
    ],
  },
  {
    type: 'breadcrumbs',
    label: 'Breadcrumbs',
    category: 'navigation',
    icon: 'ChevronRight',
    description: 'Navigation breadcrumbs',
    defaultSettings: { separator: '/', showHome: true, homeLabel: 'Home', style: 'default' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'separator', label: 'Separator', type: 'select', defaultValue: '/', options: [
        { value: '/', label: '/' }, { value: '>', label: '>' },
        { value: '→', label: '→' }, { value: '|', label: '|' },
      ]},
      { key: 'showHome', label: 'Show Home', type: 'checkbox', defaultValue: true },
      { key: 'homeLabel', label: 'Home Label', type: 'text', defaultValue: 'Home' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'pills', label: 'Pills' },
        { value: 'arrow', label: 'Arrows' },
      ]},
    ],
  },
  {
    type: 'page-list',
    label: 'Page List',
    category: 'navigation',
    icon: 'FileText',
    description: 'List of pages',
    defaultSettings: { parentPage: '', depth: 2, excludePages: [], sortBy: 'menu_order' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'depth', label: 'Depth', type: 'range', defaultValue: 2, min: 1, max: 4 },
      { key: 'sortBy', label: 'Sort By', type: 'select', defaultValue: 'menu_order', options: [
        { value: 'menu_order', label: 'Menu Order' }, { value: 'title', label: 'Title' },
        { value: 'date', label: 'Date' },
      ]},
    ],
  },
  {
    type: 'category-list',
    label: 'Category List',
    category: 'navigation',
    icon: 'Folder',
    description: 'Post categories list',
    defaultSettings: { showCount: true, hierarchical: true, showEmpty: false, orderBy: 'name' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showCount', label: 'Show Post Count', type: 'checkbox', defaultValue: true },
      { key: 'hierarchical', label: 'Show Hierarchy', type: 'checkbox', defaultValue: true },
      { key: 'showEmpty', label: 'Show Empty', type: 'checkbox', defaultValue: false },
      { key: 'orderBy', label: 'Order By', type: 'select', defaultValue: 'name', options: [
        { value: 'name', label: 'Name' }, { value: 'count', label: 'Post Count' },
        { value: 'id', label: 'ID' },
      ]},
    ],
  },
  {
    type: 'tag-cloud',
    label: 'Tag Cloud',
    category: 'navigation',
    icon: 'Hash',
    description: 'Visual tag cloud',
    defaultSettings: { maxTags: 30, minSize: 12, maxSize: 24, orderBy: 'count', style: 'cloud' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'maxTags', label: 'Max Tags', type: 'range', defaultValue: 30, min: 5, max: 50 },
      { key: 'minSize', label: 'Min Font Size', type: 'number', defaultValue: 12 },
      { key: 'maxSize', label: 'Max Font Size', type: 'number', defaultValue: 24 },
      { key: 'orderBy', label: 'Order By', type: 'select', defaultValue: 'count', options: [
        { value: 'count', label: 'Post Count' }, { value: 'name', label: 'Name' },
        { value: 'random', label: 'Random' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'cloud', options: [
        { value: 'cloud', label: 'Cloud' }, { value: 'list', label: 'List' },
        { value: 'pills', label: 'Pills' },
      ]},
    ],
  },
  {
    type: 'sitemap',
    label: 'Sitemap',
    category: 'navigation',
    icon: 'Map',
    description: 'Site structure overview',
    defaultSettings: { showPages: true, showPosts: false, showCategories: true, depth: 3 },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showPages', label: 'Show Pages', type: 'checkbox', defaultValue: true },
      { key: 'showPosts', label: 'Show Posts', type: 'checkbox', defaultValue: false },
      { key: 'showCategories', label: 'Show Categories', type: 'checkbox', defaultValue: true },
      { key: 'depth', label: 'Depth', type: 'range', defaultValue: 3, min: 1, max: 5 },
    ],
  },

  // ==================== FORM ELEMENTS ====================
  {
    type: 'search-form',
    label: 'Search Form',
    category: 'forms',
    icon: 'Search',
    description: 'Site search form',
    defaultSettings: { placeholder: 'Search...', buttonText: 'Search', style: 'default', showIcon: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Search...' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Search' },
      { key: 'showIcon', label: 'Show Icon', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' },
        { value: 'expanded', label: 'Expanded' }, { value: 'floating', label: 'Floating' },
      ]},
    ],
  },
  {
    type: 'newsletter-form',
    label: 'Newsletter Form',
    category: 'forms',
    icon: 'Mail',
    description: 'Email subscription form',
    defaultSettings: {
      title: 'Subscribe to Newsletter',
      description: 'Get the latest updates delivered to your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      provider: 'generic',
      style: 'default'
    },
    defaultStyle: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px' },
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'Subscribe to Newsletter' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Enter your email' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Subscribe' },
      { key: 'provider', label: 'Provider', type: 'select', defaultValue: 'generic', options: [
        { value: 'generic', label: 'Generic' }, { value: 'mailchimp', label: 'Mailchimp' },
        { value: 'convertkit', label: 'ConvertKit' }, { value: 'sendinblue', label: 'Sendinblue' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'inline', label: 'Inline' },
        { value: 'stacked', label: 'Stacked' }, { value: 'card', label: 'Card' },
      ]},
    ],
  },
  {
    type: 'contact-form',
    label: 'Contact Form',
    category: 'forms',
    icon: 'MessageSquare',
    description: 'Contact form widget',
    defaultSettings: {
      fields: ['name', 'email', 'message'],
      buttonText: 'Send Message',
      successMessage: 'Thank you for your message!',
      style: 'default'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'fields', label: 'Fields', type: 'multiselect', defaultValue: ['name', 'email', 'message'], options: [
        { value: 'name', label: 'Name' }, { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' }, { value: 'subject', label: 'Subject' },
        { value: 'message', label: 'Message' },
      ]},
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Send Message' },
      { key: 'successMessage', label: 'Success Message', type: 'text', defaultValue: 'Thank you!' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' },
        { value: 'boxed', label: 'Boxed' },
      ]},
    ],
  },
  {
    type: 'login-form',
    label: 'Login Form',
    category: 'forms',
    icon: 'LogIn',
    description: 'User login form',
    defaultSettings: {
      showRemember: true,
      showForgot: true,
      showRegister: true,
      redirectUrl: '',
      style: 'default'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showRemember', label: 'Show Remember Me', type: 'checkbox', defaultValue: true },
      { key: 'showForgot', label: 'Show Forgot Password', type: 'checkbox', defaultValue: true },
      { key: 'showRegister', label: 'Show Register Link', type: 'checkbox', defaultValue: true },
      { key: 'redirectUrl', label: 'Redirect URL', type: 'text', defaultValue: '' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' },
        { value: 'card', label: 'Card' },
      ]},
    ],
  },
  {
    type: 'survey-poll',
    label: 'Survey/Poll',
    category: 'forms',
    icon: 'BarChart2',
    description: 'Quick poll or survey',
    defaultSettings: {
      question: 'What do you think?',
      options: ['Option 1', 'Option 2', 'Option 3'],
      type: 'single',
      showResults: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'question', label: 'Question', type: 'text', defaultValue: '' },
      { key: 'type', label: 'Type', type: 'select', defaultValue: 'single', options: [
        { value: 'single', label: 'Single Choice' }, { value: 'multiple', label: 'Multiple Choice' },
      ]},
      { key: 'showResults', label: 'Show Results After Vote', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'rating-form',
    label: 'Rating/Review',
    category: 'forms',
    icon: 'Star',
    description: 'Star rating widget',
    defaultSettings: { maxRating: 5, allowHalf: true, showCount: true, style: 'stars' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'maxRating', label: 'Max Rating', type: 'range', defaultValue: 5, min: 3, max: 10 },
      { key: 'allowHalf', label: 'Allow Half Stars', type: 'checkbox', defaultValue: true },
      { key: 'showCount', label: 'Show Rating Count', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'stars', options: [
        { value: 'stars', label: 'Stars' }, { value: 'hearts', label: 'Hearts' },
        { value: 'thumbs', label: 'Thumbs' }, { value: 'emoji', label: 'Emoji' },
      ]},
    ],
  },

  // ==================== E-COMMERCE ELEMENTS ====================
  {
    type: 'product-carousel',
    label: 'Product Carousel',
    category: 'ecommerce',
    icon: 'ShoppingBag',
    description: 'Sliding product showcase',
    defaultSettings: {
      source: 'featured',
      count: 6,
      autoplay: true,
      showPrice: true,
      showRating: true,
      showCart: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'source', label: 'Products Source', type: 'select', defaultValue: 'featured', options: [
        { value: 'featured', label: 'Featured' }, { value: 'bestsellers', label: 'Best Sellers' },
        { value: 'new', label: 'New Arrivals' }, { value: 'sale', label: 'On Sale' },
        { value: 'category', label: 'By Category' },
      ]},
      { key: 'count', label: 'Product Count', type: 'range', defaultValue: 6, min: 3, max: 12 },
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: true },
      { key: 'showPrice', label: 'Show Price', type: 'checkbox', defaultValue: true },
      { key: 'showRating', label: 'Show Rating', type: 'checkbox', defaultValue: true },
      { key: 'showCart', label: 'Show Add to Cart', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'product-grid',
    label: 'Product Grid',
    category: 'ecommerce',
    icon: 'Grid',
    description: 'Product grid display',
    defaultSettings: { source: 'featured', count: 4, columns: 2, showPrice: true, showRating: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'source', label: 'Source', type: 'select', defaultValue: 'featured', options: [
        { value: 'featured', label: 'Featured' }, { value: 'bestsellers', label: 'Best Sellers' },
        { value: 'new', label: 'New Arrivals' }, { value: 'sale', label: 'On Sale' },
      ]},
      { key: 'count', label: 'Count', type: 'range', defaultValue: 4, min: 2, max: 8 },
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 2, min: 1, max: 4 },
      { key: 'showPrice', label: 'Show Price', type: 'checkbox', defaultValue: true },
      { key: 'showRating', label: 'Show Rating', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'price-table',
    label: 'Pricing Table',
    category: 'ecommerce',
    icon: 'DollarSign',
    description: 'Pricing comparison table',
    defaultSettings: {
      plans: [
        { name: 'Basic', price: '$9', period: 'month', features: ['Feature 1', 'Feature 2'], highlighted: false },
        { name: 'Pro', price: '$29', period: 'month', features: ['Feature 1', 'Feature 2', 'Feature 3'], highlighted: true },
      ],
      style: 'cards'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'cards', options: [
        { value: 'cards', label: 'Cards' }, { value: 'table', label: 'Table' },
        { value: 'minimal', label: 'Minimal' },
      ]},
    ],
  },
  {
    type: 'cart-widget',
    label: 'Cart Widget',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    description: 'Mini shopping cart',
    defaultSettings: { showItems: true, showTotal: true, showCheckout: true, style: 'dropdown' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showItems', label: 'Show Items', type: 'checkbox', defaultValue: true },
      { key: 'showTotal', label: 'Show Total', type: 'checkbox', defaultValue: true },
      { key: 'showCheckout', label: 'Show Checkout Button', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'dropdown', options: [
        { value: 'dropdown', label: 'Dropdown' }, { value: 'sidebar', label: 'Sidebar' },
        { value: 'inline', label: 'Inline' },
      ]},
    ],
  },
  {
    type: 'wishlist',
    label: 'Wishlist',
    category: 'ecommerce',
    icon: 'Heart',
    description: 'User wishlist display',
    defaultSettings: { layout: 'grid', columns: 2, showPrice: true, showRemove: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'grid', options: [
        { value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' },
      ]},
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 2, min: 1, max: 4 },
      { key: 'showPrice', label: 'Show Price', type: 'checkbox', defaultValue: true },
      { key: 'showRemove', label: 'Show Remove', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'recently-viewed',
    label: 'Recently Viewed',
    category: 'ecommerce',
    icon: 'Eye',
    description: 'Recently viewed products',
    defaultSettings: { count: 4, layout: 'slider', showPrice: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'count', label: 'Count', type: 'range', defaultValue: 4, min: 2, max: 8 },
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'slider', options: [
        { value: 'slider', label: 'Slider' }, { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
      ]},
      { key: 'showPrice', label: 'Show Price', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'sale-countdown',
    label: 'Sale Countdown',
    category: 'ecommerce',
    icon: 'Clock',
    description: 'Sale countdown timer',
    defaultSettings: {
      endDate: '',
      title: 'Sale Ends In',
      expiredMessage: 'Sale has ended',
      style: 'boxes'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'endDate', label: 'End Date', type: 'text', defaultValue: '', placeholder: 'YYYY-MM-DD HH:MM' },
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'Sale Ends In' },
      { key: 'expiredMessage', label: 'Expired Message', type: 'text', defaultValue: 'Sale has ended' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'boxes', options: [
        { value: 'boxes', label: 'Boxes' }, { value: 'inline', label: 'Inline' },
        { value: 'circular', label: 'Circular' },
      ]},
    ],
  },
  {
    type: 'promo-banner',
    label: 'Promo Banner',
    category: 'ecommerce',
    icon: 'Tag',
    description: 'Promotional banner',
    defaultSettings: {
      title: 'Special Offer',
      description: 'Get 20% off your first order',
      buttonText: 'Shop Now',
      buttonLink: '',
      backgroundColor: '#6366f1',
      style: 'default'
    },
    defaultStyle: { borderRadius: '12px', padding: '24px', textAlign: 'center' },
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'Special Offer' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Shop Now' },
      { key: 'buttonLink', label: 'Button Link', type: 'text', defaultValue: '' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#6366f1' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'gradient', label: 'Gradient' },
        { value: 'image', label: 'With Image' },
      ]},
    ],
  },

  // ==================== INTERACTIVE ELEMENTS ====================
  {
    type: 'accordion',
    label: 'Accordion',
    category: 'interactive',
    icon: 'ChevronDown',
    description: 'Collapsible content panels',
    defaultSettings: {
      items: [
        { title: 'Panel 1', content: 'Content for panel 1' },
        { title: 'Panel 2', content: 'Content for panel 2' },
      ],
      allowMultiple: false,
      defaultOpen: 0,
      style: 'default'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'allowMultiple', label: 'Allow Multiple Open', type: 'checkbox', defaultValue: false },
      { key: 'defaultOpen', label: 'Default Open Index', type: 'number', defaultValue: 0 },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'bordered', label: 'Bordered' },
        { value: 'separated', label: 'Separated' }, { value: 'minimal', label: 'Minimal' },
      ]},
    ],
  },
  {
    type: 'tabs',
    label: 'Tabs',
    category: 'interactive',
    icon: 'Layers',
    description: 'Tabbed content panels',
    defaultSettings: {
      tabs: [
        { title: 'Tab 1', content: 'Content for tab 1' },
        { title: 'Tab 2', content: 'Content for tab 2' },
      ],
      defaultTab: 0,
      orientation: 'horizontal',
      style: 'default'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'defaultTab', label: 'Default Tab', type: 'number', defaultValue: 0 },
      { key: 'orientation', label: 'Orientation', type: 'select', defaultValue: 'horizontal', options: [
        { value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'pills', label: 'Pills' },
        { value: 'boxed', label: 'Boxed' }, { value: 'underline', label: 'Underline' },
      ]},
    ],
  },
  {
    type: 'countdown-timer',
    label: 'Countdown Timer',
    category: 'interactive',
    icon: 'Clock',
    description: 'Countdown to a date',
    defaultSettings: {
      targetDate: '',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      expiredMessage: 'Time is up!',
      style: 'boxes'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'targetDate', label: 'Target Date', type: 'text', defaultValue: '', placeholder: 'YYYY-MM-DD HH:MM' },
      { key: 'showDays', label: 'Show Days', type: 'checkbox', defaultValue: true },
      { key: 'showHours', label: 'Show Hours', type: 'checkbox', defaultValue: true },
      { key: 'showMinutes', label: 'Show Minutes', type: 'checkbox', defaultValue: true },
      { key: 'showSeconds', label: 'Show Seconds', type: 'checkbox', defaultValue: true },
      { key: 'expiredMessage', label: 'Expired Message', type: 'text', defaultValue: 'Time is up!' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'boxes', options: [
        { value: 'boxes', label: 'Boxes' }, { value: 'inline', label: 'Inline' },
        { value: 'circles', label: 'Circles' }, { value: 'flip', label: 'Flip Cards' },
      ]},
    ],
  },
  {
    type: 'progress-bar',
    label: 'Progress Bar',
    category: 'interactive',
    icon: 'Percent',
    description: 'Animated progress bar',
    defaultSettings: {
      items: [
        { label: 'Skill 1', value: 75 },
        { label: 'Skill 2', value: 90 },
      ],
      showPercentage: true,
      animate: true,
      style: 'default'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showPercentage', label: 'Show Percentage', type: 'checkbox', defaultValue: true },
      { key: 'animate', label: 'Animate on View', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'striped', label: 'Striped' },
        { value: 'gradient', label: 'Gradient' }, { value: 'circular', label: 'Circular' },
      ]},
    ],
  },
  {
    type: 'counter',
    label: 'Counter',
    category: 'interactive',
    icon: 'Hash',
    description: 'Animated number counter',
    defaultSettings: {
      items: [
        { value: 1500, label: 'Happy Customers', prefix: '', suffix: '+' },
        { value: 500, label: 'Projects Done', prefix: '', suffix: '' },
      ],
      animate: true,
      duration: 2000
    },
    defaultStyle: { textAlign: 'center' },
    settingsSchema: [
      { key: 'animate', label: 'Animate on View', type: 'checkbox', defaultValue: true },
      { key: 'duration', label: 'Animation Duration (ms)', type: 'number', defaultValue: 2000 },
    ],
  },
  {
    type: 'flip-box',
    label: 'Flip Box',
    category: 'interactive',
    icon: 'RotateCw',
    description: 'Flip card on hover',
    defaultSettings: {
      frontTitle: 'Front Title',
      frontContent: 'Front content here',
      frontIcon: 'Star',
      backTitle: 'Back Title',
      backContent: 'Back content here',
      flipDirection: 'horizontal'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'frontTitle', label: 'Front Title', type: 'text', defaultValue: '' },
      { key: 'frontContent', label: 'Front Content', type: 'textarea', defaultValue: '' },
      { key: 'frontIcon', label: 'Front Icon', type: 'icon', defaultValue: 'Star' },
      { key: 'backTitle', label: 'Back Title', type: 'text', defaultValue: '' },
      { key: 'backContent', label: 'Back Content', type: 'textarea', defaultValue: '' },
      { key: 'flipDirection', label: 'Flip Direction', type: 'select', defaultValue: 'horizontal', options: [
        { value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' },
      ]},
    ],
  },
  {
    type: 'hover-card',
    label: 'Hover Card',
    category: 'interactive',
    icon: 'MousePointer',
    description: 'Card with hover effects',
    defaultSettings: {
      title: 'Card Title',
      content: 'Card content here',
      image: '',
      effect: 'lift',
      link: ''
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'content', label: 'Content', type: 'textarea', defaultValue: '' },
      { key: 'image', label: 'Image', type: 'image', defaultValue: '' },
      { key: 'effect', label: 'Hover Effect', type: 'select', defaultValue: 'lift', options: [
        { value: 'lift', label: 'Lift' }, { value: 'glow', label: 'Glow' },
        { value: 'zoom', label: 'Zoom Image' }, { value: 'overlay', label: 'Overlay' },
      ]},
      { key: 'link', label: 'Link URL', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'tooltip',
    label: 'Tooltip',
    category: 'interactive',
    icon: 'Info',
    description: 'Text with tooltip',
    defaultSettings: { text: 'Hover me', tooltip: 'Tooltip content', position: 'top', style: 'default' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'text', label: 'Text', type: 'text', defaultValue: 'Hover me' },
      { key: 'tooltip', label: 'Tooltip Content', type: 'textarea', defaultValue: '' },
      { key: 'position', label: 'Position', type: 'select', defaultValue: 'top', options: [
        { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },
      ]},
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
      ]},
    ],
  },
  {
    type: 'modal-trigger',
    label: 'Modal Trigger',
    category: 'interactive',
    icon: 'ExternalLink',
    description: 'Button to open modal',
    defaultSettings: {
      buttonText: 'Open Modal',
      modalTitle: 'Modal Title',
      modalContent: 'Modal content here',
      buttonStyle: 'primary'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Open Modal' },
      { key: 'modalTitle', label: 'Modal Title', type: 'text', defaultValue: 'Modal Title' },
      { key: 'modalContent', label: 'Modal Content', type: 'textarea', defaultValue: '' },
      { key: 'buttonStyle', label: 'Button Style', type: 'select', defaultValue: 'primary', options: [
        { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' }, { value: 'link', label: 'Link' },
      ]},
    ],
  },
  {
    type: 'scroll-to-top',
    label: 'Scroll to Top',
    category: 'interactive',
    icon: 'ArrowUp',
    description: 'Back to top button',
    defaultSettings: { showAfter: 300, style: 'circle', position: 'bottom-right', smooth: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showAfter', label: 'Show After (px)', type: 'number', defaultValue: 300 },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'circle', options: [
        { value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' },
        { value: 'rounded', label: 'Rounded' },
      ]},
      { key: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-right', options: [
        { value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' },
        { value: 'bottom-center', label: 'Bottom Center' },
      ]},
      { key: 'smooth', label: 'Smooth Scroll', type: 'checkbox', defaultValue: true },
    ],
  },

  // ==================== LAYOUT ELEMENTS ====================
  {
    type: 'container',
    label: 'Container',
    category: 'layout',
    icon: 'Box',
    description: 'Content container',
    defaultSettings: { maxWidth: '100%', centered: false },
    defaultStyle: { padding: '20px' },
    settingsSchema: [
      { key: 'maxWidth', label: 'Max Width', type: 'text', defaultValue: '100%' },
      { key: 'centered', label: 'Centered', type: 'checkbox', defaultValue: false },
    ],
  },
  {
    type: 'columns',
    label: 'Columns',
    category: 'layout',
    icon: 'Columns',
    description: 'Multi-column layout',
    defaultSettings: { columns: 2, gap: '24px', stackOnMobile: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 2, min: 2, max: 6 },
      { key: 'gap', label: 'Gap', type: 'text', defaultValue: '24px' },
      { key: 'stackOnMobile', label: 'Stack on Mobile', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'card',
    label: 'Card',
    category: 'layout',
    icon: 'Square',
    description: 'Content card',
    defaultSettings: {
      title: 'Card Title',
      content: 'Card content here',
      image: '',
      showHeader: true,
      showFooter: false,
      footerContent: ''
    },
    defaultStyle: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 'md' },
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'content', label: 'Content', type: 'textarea', defaultValue: '' },
      { key: 'image', label: 'Header Image', type: 'image', defaultValue: '' },
      { key: 'showHeader', label: 'Show Header', type: 'checkbox', defaultValue: true },
      { key: 'showFooter', label: 'Show Footer', type: 'checkbox', defaultValue: false },
      { key: 'footerContent', label: 'Footer Content', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'alert-box',
    label: 'Alert Box',
    category: 'layout',
    icon: 'AlertCircle',
    description: 'Notification/alert box',
    defaultSettings: {
      type: 'info',
      title: 'Alert Title',
      message: 'Alert message here',
      dismissible: true,
      showIcon: true
    },
    defaultStyle: { borderRadius: '8px', padding: '16px' },
    settingsSchema: [
      { key: 'type', label: 'Type', type: 'select', defaultValue: 'info', options: [
        { value: 'info', label: 'Info' }, { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' },
      ]},
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'message', label: 'Message', type: 'textarea', defaultValue: '' },
      { key: 'dismissible', label: 'Dismissible', type: 'checkbox', defaultValue: true },
      { key: 'showIcon', label: 'Show Icon', type: 'checkbox', defaultValue: true },
    ],
  },

  // ==================== DATA ELEMENTS ====================
  {
    type: 'posts-list',
    label: 'Posts List',
    category: 'data',
    icon: 'FileText',
    description: 'Recent posts list',
    defaultSettings: {
      count: 5,
      category: '',
      orderBy: 'date',
      showDate: true,
      showExcerpt: false,
      showThumbnail: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'count', label: 'Post Count', type: 'range', defaultValue: 5, min: 1, max: 20 },
      { key: 'orderBy', label: 'Order By', type: 'select', defaultValue: 'date', options: [
        { value: 'date', label: 'Date' }, { value: 'title', label: 'Title' },
        { value: 'views', label: 'Views' }, { value: 'comments', label: 'Comments' },
      ]},
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showExcerpt', label: 'Show Excerpt', type: 'checkbox', defaultValue: false },
      { key: 'showThumbnail', label: 'Show Thumbnail', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'posts-grid',
    label: 'Posts Grid',
    category: 'data',
    icon: 'Grid',
    description: 'Posts in grid layout',
    defaultSettings: { count: 6, columns: 3, category: '', showDate: true, showExcerpt: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'count', label: 'Post Count', type: 'range', defaultValue: 6, min: 2, max: 12 },
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 3, min: 2, max: 4 },
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showExcerpt', label: 'Show Excerpt', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'posts-carousel',
    label: 'Posts Carousel',
    category: 'data',
    icon: 'Layers',
    description: 'Sliding posts carousel',
    defaultSettings: { count: 6, category: '', autoplay: true, showDate: true, showExcerpt: false },
    defaultStyle: {},
    settingsSchema: [
      { key: 'count', label: 'Post Count', type: 'range', defaultValue: 6, min: 3, max: 12 },
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: true },
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showExcerpt', label: 'Show Excerpt', type: 'checkbox', defaultValue: false },
    ],
  },
  {
    type: 'calendar',
    label: 'Calendar',
    category: 'data',
    icon: 'Calendar',
    description: 'Event calendar',
    defaultSettings: { showNavigation: true, highlightToday: true, showEvents: true, style: 'default' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showNavigation', label: 'Show Navigation', type: 'checkbox', defaultValue: true },
      { key: 'highlightToday', label: 'Highlight Today', type: 'checkbox', defaultValue: true },
      { key: 'showEvents', label: 'Show Events', type: 'checkbox', defaultValue: true },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'default', options: [
        { value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' },
        { value: 'compact', label: 'Compact' },
      ]},
    ],
  },
  {
    type: 'weather',
    label: 'Weather',
    category: 'data',
    icon: 'Cloud',
    description: 'Weather widget',
    defaultSettings: { location: '', units: 'metric', showForecast: true, forecastDays: 5, style: 'card' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'location', label: 'Location', type: 'text', defaultValue: '', placeholder: 'City, Country' },
      { key: 'units', label: 'Units', type: 'select', defaultValue: 'metric', options: [
        { value: 'metric', label: 'Celsius' }, { value: 'imperial', label: 'Fahrenheit' },
      ]},
      { key: 'showForecast', label: 'Show Forecast', type: 'checkbox', defaultValue: true },
      { key: 'forecastDays', label: 'Forecast Days', type: 'range', defaultValue: 5, min: 1, max: 7 },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'card', options: [
        { value: 'card', label: 'Card' }, { value: 'minimal', label: 'Minimal' },
        { value: 'detailed', label: 'Detailed' },
      ]},
    ],
  },
  {
    type: 'rss-feed',
    label: 'RSS Feed',
    category: 'data',
    icon: 'Rss',
    description: 'External RSS feed',
    defaultSettings: { feedUrl: '', count: 5, showDate: true, showDescription: true, openInNewTab: true },
    defaultStyle: {},
    settingsSchema: [
      { key: 'feedUrl', label: 'Feed URL', type: 'text', defaultValue: '' },
      { key: 'count', label: 'Item Count', type: 'range', defaultValue: 5, min: 1, max: 20 },
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showDescription', label: 'Show Description', type: 'checkbox', defaultValue: true },
      { key: 'openInNewTab', label: 'Open in New Tab', type: 'checkbox', defaultValue: true },
    ],
  },

  // ==================== CUSTOM ELEMENTS ====================
  {
    type: 'custom-html',
    label: 'Custom HTML',
    category: 'custom',
    icon: 'Code',
    description: 'Raw HTML content',
    defaultSettings: { html: '<div>Your HTML here</div>' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'html', label: 'HTML Code', type: 'textarea', defaultValue: '' },
    ],
  },
  {
    type: 'shortcode',
    label: 'Shortcode',
    category: 'custom',
    icon: 'Terminal',
    description: 'WordPress-style shortcode',
    defaultSettings: { shortcode: '' },
    defaultStyle: {},
    settingsSchema: [
      { key: 'shortcode', label: 'Shortcode', type: 'text', defaultValue: '', placeholder: '[shortcode]' },
    ],
  },

  // ==================== MARKETING ELEMENTS ====================
  {
    type: 'cta-banner',
    label: 'CTA Banner',
    category: 'marketing',
    icon: 'Megaphone',
    description: 'Call-to-action banner',
    defaultSettings: {
      headline: 'Ready to Get Started?',
      subheadline: 'Join thousands of happy customers today',
      buttonText: 'Get Started',
      buttonLink: '',
      style: 'gradient',
      backgroundColor: '#6366f1'
    },
    defaultStyle: { borderRadius: '16px', padding: '32px', textAlign: 'center' },
    settingsSchema: [
      { key: 'headline', label: 'Headline', type: 'text', defaultValue: '' },
      { key: 'subheadline', label: 'Subheadline', type: 'text', defaultValue: '' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Get Started' },
      { key: 'buttonLink', label: 'Button Link', type: 'text', defaultValue: '' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#6366f1' },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'gradient', options: [
        { value: 'gradient', label: 'Gradient' }, { value: 'solid', label: 'Solid' },
        { value: 'image', label: 'With Image' }, { value: 'split', label: 'Split' },
      ]},
    ],
  },
  {
    type: 'popup-trigger',
    label: 'Popup Trigger',
    category: 'marketing',
    icon: 'Maximize2',
    description: 'Trigger popup on click',
    defaultSettings: {
      triggerText: 'Learn More',
      popupTitle: 'Special Offer',
      popupContent: 'Get 20% off when you sign up today!',
      triggerStyle: 'button'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'triggerText', label: 'Trigger Text', type: 'text', defaultValue: '' },
      { key: 'popupTitle', label: 'Popup Title', type: 'text', defaultValue: '' },
      { key: 'popupContent', label: 'Popup Content', type: 'textarea', defaultValue: '' },
      { key: 'triggerStyle', label: 'Trigger Style', type: 'select', defaultValue: 'button', options: [
        { value: 'button', label: 'Button' }, { value: 'link', label: 'Link' },
        { value: 'image', label: 'Image' },
      ]},
    ],
  },
  {
    type: 'announcement-bar',
    label: 'Announcement Bar',
    category: 'marketing',
    icon: 'Bell',
    description: 'Top announcement banner',
    defaultSettings: {
      message: '🎉 Free shipping on orders over $50!',
      link: '',
      linkText: 'Shop Now',
      dismissible: true,
      backgroundColor: '#fef3c7'
    },
    defaultStyle: { padding: '12px 16px' },
    settingsSchema: [
      { key: 'message', label: 'Message', type: 'text', defaultValue: '' },
      { key: 'link', label: 'Link URL', type: 'text', defaultValue: '' },
      { key: 'linkText', label: 'Link Text', type: 'text', defaultValue: 'Learn More' },
      { key: 'dismissible', label: 'Dismissible', type: 'checkbox', defaultValue: true },
      { key: 'backgroundColor', label: 'Background', type: 'color', defaultValue: '#fef3c7' },
    ],
  },
  {
    type: 'lead-magnet',
    label: 'Lead Magnet',
    category: 'marketing',
    icon: 'Gift',
    description: 'Free download offer',
    defaultSettings: {
      title: 'Free E-Book',
      description: 'Download our comprehensive guide',
      image: '',
      buttonText: 'Download Now',
      formFields: ['email']
    },
    defaultStyle: { backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '24px' },
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { key: 'image', label: 'Cover Image', type: 'image', defaultValue: '' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Download Now' },
    ],
  },
  {
    type: 'exit-intent',
    label: 'Exit Intent Popup',
    category: 'marketing',
    icon: 'LogOut',
    description: 'Popup on exit intent',
    defaultSettings: {
      title: 'Wait! Before you go...',
      message: 'Get 10% off your first order',
      showOnce: true,
      delay: 0
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'message', label: 'Message', type: 'textarea', defaultValue: '' },
      { key: 'showOnce', label: 'Show Only Once', type: 'checkbox', defaultValue: true },
      { key: 'delay', label: 'Delay (seconds)', type: 'number', defaultValue: 0 },
    ],
  },
  {
    type: 'social-proof',
    label: 'Social Proof',
    category: 'marketing',
    icon: 'Users',
    description: 'Recent activity notifications',
    defaultSettings: {
      type: 'purchases',
      position: 'bottom-left',
      displayTime: 5000,
      interval: 10000
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'type', label: 'Type', type: 'select', defaultValue: 'purchases', options: [
        { value: 'purchases', label: 'Recent Purchases' }, { value: 'signups', label: 'Recent Signups' },
        { value: 'reviews', label: 'Recent Reviews' },
      ]},
      { key: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-left', options: [
        { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-right', label: 'Bottom Right' },
      ]},
      { key: 'displayTime', label: 'Display Time (ms)', type: 'number', defaultValue: 5000 },
    ],
  },
  {
    type: 'trust-badges',
    label: 'Trust Badges',
    category: 'marketing',
    icon: 'Shield',
    description: 'Security and trust icons',
    defaultSettings: {
      badges: ['secure-payment', 'money-back', 'ssl-encrypted'],
      layout: 'horizontal',
      showLabels: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'badges', label: 'Badges', type: 'multiselect', defaultValue: [], options: [
        { value: 'secure-payment', label: 'Secure Payment' }, { value: 'money-back', label: 'Money Back' },
        { value: 'ssl-encrypted', label: 'SSL Encrypted' }, { value: 'free-shipping', label: 'Free Shipping' },
        { value: '24-7-support', label: '24/7 Support' },
      ]},
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'horizontal', options: [
        { value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' },
        { value: 'grid', label: 'Grid' },
      ]},
      { key: 'showLabels', label: 'Show Labels', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'comparison-table',
    label: 'Comparison Table',
    category: 'marketing',
    icon: 'GitCompare',
    description: 'Product/feature comparison',
    defaultSettings: {
      products: ['Basic', 'Pro', 'Enterprise'],
      features: [
        { name: 'Feature 1', values: [true, true, true] },
        { name: 'Feature 2', values: [false, true, true] },
      ],
      highlightColumn: 1
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'highlightColumn', label: 'Highlight Column', type: 'number', defaultValue: 1 },
    ],
  },
  {
    type: 'feature-list',
    label: 'Feature List',
    category: 'marketing',
    icon: 'CheckCircle',
    description: 'Features with checkmarks',
    defaultSettings: {
      title: 'What You Get',
      features: ['Feature one', 'Feature two', 'Feature three'],
      iconStyle: 'check',
      columns: 1
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'iconStyle', label: 'Icon Style', type: 'select', defaultValue: 'check', options: [
        { value: 'check', label: 'Checkmark' }, { value: 'star', label: 'Star' },
        { value: 'arrow', label: 'Arrow' }, { value: 'bullet', label: 'Bullet' },
      ]},
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 1, min: 1, max: 3 },
    ],
  },
  {
    type: 'stats-counter',
    label: 'Stats Counter',
    category: 'marketing',
    icon: 'TrendingUp',
    description: 'Animated statistics',
    defaultSettings: {
      stats: [
        { value: 10000, label: 'Happy Customers', suffix: '+' },
        { value: 500, label: 'Projects Completed', suffix: '' },
        { value: 99, label: 'Satisfaction Rate', suffix: '%' },
      ],
      animate: true,
      columns: 3
    },
    defaultStyle: { textAlign: 'center' },
    settingsSchema: [
      { key: 'animate', label: 'Animate', type: 'checkbox', defaultValue: true },
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 3, min: 2, max: 5 },
    ],
  },

  // ==================== ANALYTICS ELEMENTS ====================
  {
    type: 'chart-bar',
    label: 'Bar Chart',
    category: 'analytics',
    icon: 'BarChart2',
    description: 'Vertical bar chart',
    defaultSettings: {
      title: 'Monthly Sales',
      data: [
        { label: 'Jan', value: 120 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 180 },
      ],
      showLegend: true,
      showGrid: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'showLegend', label: 'Show Legend', type: 'checkbox', defaultValue: true },
      { key: 'showGrid', label: 'Show Grid', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'chart-line',
    label: 'Line Chart',
    category: 'analytics',
    icon: 'TrendingUp',
    description: 'Trend line chart',
    defaultSettings: {
      title: 'Growth Trend',
      data: [],
      showPoints: true,
      smooth: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'showPoints', label: 'Show Points', type: 'checkbox', defaultValue: true },
      { key: 'smooth', label: 'Smooth Lines', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'chart-pie',
    label: 'Pie Chart',
    category: 'analytics',
    icon: 'PieChart',
    description: 'Pie/doughnut chart',
    defaultSettings: {
      title: 'Distribution',
      data: [
        { label: 'Category A', value: 40, color: '#6366f1' },
        { label: 'Category B', value: 30, color: '#22c55e' },
        { label: 'Category C', value: 30, color: '#f59e0b' },
      ],
      showLabels: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'showLabels', label: 'Show Labels', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'chart-donut',
    label: 'Donut Chart',
    category: 'analytics',
    icon: 'Circle',
    description: 'Donut progress chart',
    defaultSettings: {
      title: 'Completion',
      value: 75,
      maxValue: 100,
      centerText: '75%',
      color: '#6366f1'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'value', label: 'Value', type: 'number', defaultValue: 75 },
      { key: 'maxValue', label: 'Max Value', type: 'number', defaultValue: 100 },
      { key: 'centerText', label: 'Center Text', type: 'text', defaultValue: '' },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#6366f1' },
    ],
  },
  {
    type: 'stats-card',
    label: 'Stats Card',
    category: 'analytics',
    icon: 'Activity',
    description: 'Single stat with trend',
    defaultSettings: {
      title: 'Total Revenue',
      value: '$12,500',
      change: '+12.5%',
      changeType: 'increase',
      icon: 'DollarSign'
    },
    defaultStyle: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px' },
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'value', label: 'Value', type: 'text', defaultValue: '' },
      { key: 'change', label: 'Change', type: 'text', defaultValue: '' },
      { key: 'changeType', label: 'Change Type', type: 'select', defaultValue: 'increase', options: [
        { value: 'increase', label: 'Increase' }, { value: 'decrease', label: 'Decrease' },
        { value: 'neutral', label: 'Neutral' },
      ]},
      { key: 'icon', label: 'Icon', type: 'icon', defaultValue: 'TrendingUp' },
    ],
  },
  {
    type: 'metrics-grid',
    label: 'Metrics Grid',
    category: 'analytics',
    icon: 'Grid',
    description: 'Multiple stats in grid',
    defaultSettings: {
      metrics: [
        { label: 'Users', value: '12,543', icon: 'Users' },
        { label: 'Revenue', value: '$45,678', icon: 'DollarSign' },
        { label: 'Orders', value: '1,234', icon: 'ShoppingCart' },
        { label: 'Conversion', value: '3.45%', icon: 'Target' },
      ],
      columns: 4
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 4, min: 2, max: 6 },
    ],
  },
  {
    type: 'leaderboard',
    label: 'Leaderboard',
    category: 'analytics',
    icon: 'Award',
    description: 'Ranked list display',
    defaultSettings: {
      title: 'Top Performers',
      items: [
        { name: 'John Doe', score: 1500, avatar: '' },
        { name: 'Jane Smith', score: 1350, avatar: '' },
      ],
      showRank: true,
      showAvatar: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'showRank', label: 'Show Rank', type: 'checkbox', defaultValue: true },
      { key: 'showAvatar', label: 'Show Avatar', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'activity-feed',
    label: 'Activity Feed',
    category: 'analytics',
    icon: 'Activity',
    description: 'Recent activity stream',
    defaultSettings: {
      title: 'Recent Activity',
      count: 10,
      showTimestamp: true,
      showIcon: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'count', label: 'Item Count', type: 'range', defaultValue: 10, min: 5, max: 20 },
      { key: 'showTimestamp', label: 'Show Timestamp', type: 'checkbox', defaultValue: true },
      { key: 'showIcon', label: 'Show Icons', type: 'checkbox', defaultValue: true },
    ],
  },

  // ==================== BOOKING ELEMENTS ====================
  {
    type: 'appointment-booking',
    label: 'Appointment Booking',
    category: 'booking',
    icon: 'CalendarCheck',
    description: 'Book appointments',
    defaultSettings: {
      title: 'Book an Appointment',
      duration: 30,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '17:00'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'duration', label: 'Duration (minutes)', type: 'number', defaultValue: 30 },
      { key: 'startTime', label: 'Start Time', type: 'text', defaultValue: '09:00' },
      { key: 'endTime', label: 'End Time', type: 'text', defaultValue: '17:00' },
    ],
  },
  {
    type: 'event-list',
    label: 'Event List',
    category: 'booking',
    icon: 'Calendar',
    description: 'Upcoming events list',
    defaultSettings: {
      title: 'Upcoming Events',
      count: 5,
      showDate: true,
      showLocation: true,
      showDescription: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'count', label: 'Event Count', type: 'range', defaultValue: 5, min: 1, max: 10 },
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showLocation', label: 'Show Location', type: 'checkbox', defaultValue: true },
      { key: 'showDescription', label: 'Show Description', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'availability-calendar',
    label: 'Availability Calendar',
    category: 'booking',
    icon: 'Calendar',
    description: 'Show availability',
    defaultSettings: {
      showLegend: true,
      weekStartsOn: 'monday',
      monthsToShow: 1
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showLegend', label: 'Show Legend', type: 'checkbox', defaultValue: true },
      { key: 'weekStartsOn', label: 'Week Starts On', type: 'select', defaultValue: 'monday', options: [
        { value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' },
      ]},
      { key: 'monthsToShow', label: 'Months to Show', type: 'range', defaultValue: 1, min: 1, max: 3 },
    ],
  },
  {
    type: 'time-slots',
    label: 'Time Slots',
    category: 'booking',
    icon: 'Clock',
    description: 'Available time slots',
    defaultSettings: {
      slotDuration: 30,
      columns: 3,
      showDate: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'slotDuration', label: 'Slot Duration (min)', type: 'number', defaultValue: 30 },
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 3, min: 2, max: 5 },
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'booking-form',
    label: 'Booking Form',
    category: 'booking',
    icon: 'FileText',
    description: 'Reservation form',
    defaultSettings: {
      fields: ['name', 'email', 'phone', 'date', 'time', 'notes'],
      submitText: 'Book Now',
      requirePhone: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'submitText', label: 'Submit Text', type: 'text', defaultValue: 'Book Now' },
      { key: 'requirePhone', label: 'Require Phone', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'service-list',
    label: 'Service List',
    category: 'booking',
    icon: 'List',
    description: 'Bookable services',
    defaultSettings: {
      services: [
        { name: 'Consultation', duration: 60, price: 100 },
        { name: 'Follow-up', duration: 30, price: 50 },
      ],
      showPrice: true,
      showDuration: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showPrice', label: 'Show Price', type: 'checkbox', defaultValue: true },
      { key: 'showDuration', label: 'Show Duration', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'staff-list',
    label: 'Staff List',
    category: 'booking',
    icon: 'Users',
    description: 'Team members for booking',
    defaultSettings: {
      showPhoto: true,
      showBio: true,
      showAvailability: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showPhoto', label: 'Show Photo', type: 'checkbox', defaultValue: true },
      { key: 'showBio', label: 'Show Bio', type: 'checkbox', defaultValue: true },
      { key: 'showAvailability', label: 'Show Availability', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'reservation-widget',
    label: 'Reservation Widget',
    category: 'booking',
    icon: 'Bookmark',
    description: 'Quick reservation box',
    defaultSettings: {
      title: 'Make a Reservation',
      fields: ['date', 'time', 'guests'],
      buttonText: 'Reserve'
    },
    defaultStyle: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px' },
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Reserve' },
    ],
  },

  // ==================== MAPS ELEMENTS ====================
  {
    type: 'google-map',
    label: 'Google Map',
    category: 'maps',
    icon: 'Map',
    description: 'Embedded Google Map',
    defaultSettings: {
      address: '',
      latitude: 0,
      longitude: 0,
      zoom: 14,
      height: 400,
      showMarker: true,
      mapType: 'roadmap'
    },
    defaultStyle: { borderRadius: '12px' },
    settingsSchema: [
      { key: 'address', label: 'Address', type: 'text', defaultValue: '' },
      { key: 'zoom', label: 'Zoom Level', type: 'range', defaultValue: 14, min: 1, max: 20 },
      { key: 'height', label: 'Height (px)', type: 'number', defaultValue: 400 },
      { key: 'showMarker', label: 'Show Marker', type: 'checkbox', defaultValue: true },
      { key: 'mapType', label: 'Map Type', type: 'select', defaultValue: 'roadmap', options: [
        { value: 'roadmap', label: 'Roadmap' }, { value: 'satellite', label: 'Satellite' },
        { value: 'hybrid', label: 'Hybrid' }, { value: 'terrain', label: 'Terrain' },
      ]},
    ],
  },
  {
    type: 'store-locator',
    label: 'Store Locator',
    category: 'maps',
    icon: 'MapPin',
    description: 'Find nearby stores',
    defaultSettings: {
      searchPlaceholder: 'Enter your location',
      showSearch: true,
      showList: true,
      showDistance: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text', defaultValue: '' },
      { key: 'showSearch', label: 'Show Search', type: 'checkbox', defaultValue: true },
      { key: 'showList', label: 'Show Store List', type: 'checkbox', defaultValue: true },
      { key: 'showDistance', label: 'Show Distance', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'directions-widget',
    label: 'Directions Widget',
    category: 'maps',
    icon: 'Navigation',
    description: 'Get directions',
    defaultSettings: {
      destination: '',
      showTravelModes: true,
      defaultMode: 'driving'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'destination', label: 'Destination', type: 'text', defaultValue: '' },
      { key: 'showTravelModes', label: 'Show Travel Modes', type: 'checkbox', defaultValue: true },
      { key: 'defaultMode', label: 'Default Mode', type: 'select', defaultValue: 'driving', options: [
        { value: 'driving', label: 'Driving' }, { value: 'walking', label: 'Walking' },
        { value: 'transit', label: 'Transit' }, { value: 'bicycling', label: 'Bicycling' },
      ]},
    ],
  },
  {
    type: 'location-card',
    label: 'Location Card',
    category: 'maps',
    icon: 'Building',
    description: 'Business location info',
    defaultSettings: {
      name: 'Our Office',
      address: '123 Main St, City',
      phone: '',
      email: '',
      hours: '',
      showMap: true
    },
    defaultStyle: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px' },
    settingsSchema: [
      { key: 'name', label: 'Name', type: 'text', defaultValue: '' },
      { key: 'address', label: 'Address', type: 'textarea', defaultValue: '' },
      { key: 'phone', label: 'Phone', type: 'text', defaultValue: '' },
      { key: 'email', label: 'Email', type: 'text', defaultValue: '' },
      { key: 'hours', label: 'Business Hours', type: 'textarea', defaultValue: '' },
      { key: 'showMap', label: 'Show Map Preview', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'branch-list',
    label: 'Branch List',
    category: 'maps',
    icon: 'Building2',
    description: 'List of locations',
    defaultSettings: {
      title: 'Our Locations',
      showAddress: true,
      showPhone: true,
      showHours: true,
      layout: 'cards'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'showAddress', label: 'Show Address', type: 'checkbox', defaultValue: true },
      { key: 'showPhone', label: 'Show Phone', type: 'checkbox', defaultValue: true },
      { key: 'showHours', label: 'Show Hours', type: 'checkbox', defaultValue: true },
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'cards', options: [
        { value: 'cards', label: 'Cards' }, { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
      ]},
    ],
  },
  {
    type: 'interactive-map',
    label: 'Interactive Map',
    category: 'maps',
    icon: 'Globe',
    description: 'Clickable regions map',
    defaultSettings: {
      mapType: 'world',
      showTooltips: true,
      clickable: true,
      colorScheme: 'blue'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'mapType', label: 'Map Type', type: 'select', defaultValue: 'world', options: [
        { value: 'world', label: 'World' }, { value: 'usa', label: 'USA' },
        { value: 'europe', label: 'Europe' }, { value: 'custom', label: 'Custom' },
      ]},
      { key: 'showTooltips', label: 'Show Tooltips', type: 'checkbox', defaultValue: true },
      { key: 'clickable', label: 'Clickable Regions', type: 'checkbox', defaultValue: true },
      { key: 'colorScheme', label: 'Color Scheme', type: 'select', defaultValue: 'blue', options: [
        { value: 'blue', label: 'Blue' }, { value: 'green', label: 'Green' },
        { value: 'purple', label: 'Purple' }, { value: 'orange', label: 'Orange' },
      ]},
    ],
  },

  // ==================== PORTFOLIO ELEMENTS ====================
  {
    type: 'project-grid',
    label: 'Project Grid',
    category: 'portfolio',
    icon: 'Grid',
    description: 'Portfolio projects grid',
    defaultSettings: {
      columns: 3,
      gap: '24px',
      showTitle: true,
      showCategory: true,
      hoverEffect: 'overlay'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 3, min: 2, max: 5 },
      { key: 'gap', label: 'Gap', type: 'text', defaultValue: '24px' },
      { key: 'showTitle', label: 'Show Title', type: 'checkbox', defaultValue: true },
      { key: 'showCategory', label: 'Show Category', type: 'checkbox', defaultValue: true },
      { key: 'hoverEffect', label: 'Hover Effect', type: 'select', defaultValue: 'overlay', options: [
        { value: 'overlay', label: 'Overlay' }, { value: 'zoom', label: 'Zoom' },
        { value: 'slide', label: 'Slide' }, { value: 'none', label: 'None' },
      ]},
    ],
  },
  {
    type: 'project-carousel',
    label: 'Project Carousel',
    category: 'portfolio',
    icon: 'Layers',
    description: 'Sliding portfolio showcase',
    defaultSettings: {
      autoplay: true,
      interval: 5000,
      showNavigation: true,
      showDots: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: true },
      { key: 'interval', label: 'Interval (ms)', type: 'number', defaultValue: 5000 },
      { key: 'showNavigation', label: 'Show Navigation', type: 'checkbox', defaultValue: true },
      { key: 'showDots', label: 'Show Dots', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'case-study',
    label: 'Case Study',
    category: 'portfolio',
    icon: 'FileText',
    description: 'Detailed project case study',
    defaultSettings: {
      showClient: true,
      showDate: true,
      showTechnologies: true,
      showResults: true,
      layout: 'sidebar'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showClient', label: 'Show Client', type: 'checkbox', defaultValue: true },
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showTechnologies', label: 'Show Technologies', type: 'checkbox', defaultValue: true },
      { key: 'showResults', label: 'Show Results', type: 'checkbox', defaultValue: true },
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'sidebar', options: [
        { value: 'sidebar', label: 'With Sidebar' }, { value: 'full', label: 'Full Width' },
        { value: 'centered', label: 'Centered' },
      ]},
    ],
  },
  {
    type: 'client-logos',
    label: 'Client Logos',
    category: 'portfolio',
    icon: 'Briefcase',
    description: 'Client logo showcase',
    defaultSettings: {
      columns: 5,
      grayscale: true,
      colorOnHover: true,
      showCarousel: false
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'columns', label: 'Columns', type: 'range', defaultValue: 5, min: 3, max: 8 },
      { key: 'grayscale', label: 'Grayscale', type: 'checkbox', defaultValue: true },
      { key: 'colorOnHover', label: 'Color on Hover', type: 'checkbox', defaultValue: true },
      { key: 'showCarousel', label: 'Show as Carousel', type: 'checkbox', defaultValue: false },
    ],
  },
  {
    type: 'skills-chart',
    label: 'Skills Chart',
    category: 'portfolio',
    icon: 'BarChart',
    description: 'Skills proficiency display',
    defaultSettings: {
      skills: [
        { name: 'JavaScript', level: 90 },
        { name: 'React', level: 85 },
        { name: 'Node.js', level: 80 },
      ],
      style: 'bars',
      animate: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'bars', options: [
        { value: 'bars', label: 'Progress Bars' }, { value: 'circles', label: 'Circles' },
        { value: 'radar', label: 'Radar Chart' },
      ]},
      { key: 'animate', label: 'Animate', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'experience-timeline',
    label: 'Experience Timeline',
    category: 'portfolio',
    icon: 'GitBranch',
    description: 'Work experience timeline',
    defaultSettings: {
      experiences: [
        { title: 'Senior Developer', company: 'Company A', period: '2022 - Present' },
        { title: 'Developer', company: 'Company B', period: '2020 - 2022' },
      ],
      orientation: 'vertical',
      showIcons: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'orientation', label: 'Orientation', type: 'select', defaultValue: 'vertical', options: [
        { value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' },
      ]},
      { key: 'showIcons', label: 'Show Icons', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'certifications',
    label: 'Certifications',
    category: 'portfolio',
    icon: 'Award',
    description: 'Professional certifications',
    defaultSettings: {
      layout: 'grid',
      showDate: true,
      showIssuer: true,
      showBadge: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'grid', options: [
        { value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' },
        { value: 'carousel', label: 'Carousel' },
      ]},
      { key: 'showDate', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { key: 'showIssuer', label: 'Show Issuer', type: 'checkbox', defaultValue: true },
      { key: 'showBadge', label: 'Show Badge', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'awards-showcase',
    label: 'Awards Showcase',
    category: 'portfolio',
    icon: 'Trophy',
    description: 'Awards and recognition',
    defaultSettings: {
      layout: 'timeline',
      showYear: true,
      showDescription: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'timeline', options: [
        { value: 'timeline', label: 'Timeline' }, { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
      ]},
      { key: 'showYear', label: 'Show Year', type: 'checkbox', defaultValue: true },
      { key: 'showDescription', label: 'Show Description', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'portfolio-filter',
    label: 'Portfolio Filter',
    category: 'portfolio',
    icon: 'Filter',
    description: 'Filterable portfolio',
    defaultSettings: {
      categories: ['All', 'Web Design', 'Branding', 'UI/UX'],
      filterStyle: 'pills',
      showCount: true,
      animation: 'fade'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'filterStyle', label: 'Filter Style', type: 'select', defaultValue: 'pills', options: [
        { value: 'pills', label: 'Pills' }, { value: 'tabs', label: 'Tabs' },
        { value: 'dropdown', label: 'Dropdown' },
      ]},
      { key: 'showCount', label: 'Show Count', type: 'checkbox', defaultValue: true },
      { key: 'animation', label: 'Animation', type: 'select', defaultValue: 'fade', options: [
        { value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' },
        { value: 'scale', label: 'Scale' }, { value: 'none', label: 'None' },
      ]},
    ],
  },
  {
    type: 'work-samples',
    label: 'Work Samples',
    category: 'portfolio',
    icon: 'Folder',
    description: 'Downloadable work samples',
    defaultSettings: {
      showPreview: true,
      showFileSize: true,
      showDownloadCount: false,
      layout: 'grid'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showPreview', label: 'Show Preview', type: 'checkbox', defaultValue: true },
      { key: 'showFileSize', label: 'Show File Size', type: 'checkbox', defaultValue: true },
      { key: 'showDownloadCount', label: 'Show Downloads', type: 'checkbox', defaultValue: false },
      { key: 'layout', label: 'Layout', type: 'select', defaultValue: 'grid', options: [
        { value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' },
      ]},
    ],
  },

  // ==================== ADDITIONAL ELEMENTS ====================
  {
    type: 'notification-bell',
    label: 'Notification Bell',
    category: 'interactive',
    icon: 'Bell',
    description: 'Notification indicator',
    defaultSettings: {
      showBadge: true,
      badgeColor: '#ef4444',
      position: 'top-right',
      sound: false
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'showBadge', label: 'Show Badge', type: 'checkbox', defaultValue: true },
      { key: 'badgeColor', label: 'Badge Color', type: 'color', defaultValue: '#ef4444' },
      { key: 'sound', label: 'Play Sound', type: 'checkbox', defaultValue: false },
    ],
  },
  {
    type: 'cookie-consent',
    label: 'Cookie Consent',
    category: 'layout',
    icon: 'Cookie',
    description: 'GDPR cookie banner',
    defaultSettings: {
      message: 'We use cookies to enhance your experience.',
      acceptText: 'Accept All',
      declineText: 'Decline',
      position: 'bottom',
      showPreferences: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'message', label: 'Message', type: 'textarea', defaultValue: '' },
      { key: 'acceptText', label: 'Accept Button Text', type: 'text', defaultValue: 'Accept All' },
      { key: 'declineText', label: 'Decline Button Text', type: 'text', defaultValue: 'Decline' },
      { key: 'position', label: 'Position', type: 'select', defaultValue: 'bottom', options: [
        { value: 'bottom', label: 'Bottom' }, { value: 'top', label: 'Top' },
        { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-right', label: 'Bottom Right' },
      ]},
      { key: 'showPreferences', label: 'Show Preferences', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'age-verification',
    label: 'Age Verification',
    category: 'forms',
    icon: 'UserCheck',
    description: 'Age gate popup',
    defaultSettings: {
      title: 'Age Verification Required',
      message: 'You must be 21 or older to enter this site.',
      minimumAge: 21,
      style: 'modal'
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'message', label: 'Message', type: 'textarea', defaultValue: '' },
      { key: 'minimumAge', label: 'Minimum Age', type: 'number', defaultValue: 21 },
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'modal', options: [
        { value: 'modal', label: 'Modal' }, { value: 'fullscreen', label: 'Fullscreen' },
      ]},
    ],
  },
  {
    type: 'language-switcher',
    label: 'Language Switcher',
    category: 'navigation',
    icon: 'Globe',
    description: 'Multi-language selector',
    defaultSettings: {
      languages: ['en', 'es', 'fr', 'de'],
      style: 'dropdown',
      showFlags: true,
      showLabel: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'dropdown', options: [
        { value: 'dropdown', label: 'Dropdown' }, { value: 'inline', label: 'Inline' },
        { value: 'flags', label: 'Flags Only' },
      ]},
      { key: 'showFlags', label: 'Show Flags', type: 'checkbox', defaultValue: true },
      { key: 'showLabel', label: 'Show Language Name', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'currency-switcher',
    label: 'Currency Switcher',
    category: 'ecommerce',
    icon: 'DollarSign',
    description: 'Currency selector',
    defaultSettings: {
      currencies: ['USD', 'EUR', 'GBP'],
      style: 'dropdown',
      showSymbol: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'dropdown', options: [
        { value: 'dropdown', label: 'Dropdown' }, { value: 'inline', label: 'Inline' },
      ]},
      { key: 'showSymbol', label: 'Show Symbol', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'dark-mode-toggle',
    label: 'Dark Mode Toggle',
    category: 'interactive',
    icon: 'Moon',
    description: 'Theme switcher',
    defaultSettings: {
      style: 'switch',
      showLabel: false,
      savePreference: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'style', label: 'Style', type: 'select', defaultValue: 'switch', options: [
        { value: 'switch', label: 'Switch' }, { value: 'button', label: 'Button' },
        { value: 'icon', label: 'Icon Only' },
      ]},
      { key: 'showLabel', label: 'Show Label', type: 'checkbox', defaultValue: false },
      { key: 'savePreference', label: 'Save Preference', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'qr-code',
    label: 'QR Code',
    category: 'media',
    icon: 'Scan',
    description: 'Generate QR codes',
    defaultSettings: {
      content: '',
      size: 200,
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      showDownload: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'content', label: 'Content/URL', type: 'text', defaultValue: '' },
      { key: 'size', label: 'Size (px)', type: 'number', defaultValue: 200 },
      { key: 'foregroundColor', label: 'Foreground Color', type: 'color', defaultValue: '#000000' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'showDownload', label: 'Show Download', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    type: 'live-chat',
    label: 'Live Chat',
    category: 'forms',
    icon: 'MessageCircle',
    description: 'Chat widget trigger',
    defaultSettings: {
      provider: 'custom',
      position: 'bottom-right',
      greeting: 'Hi! How can we help?',
      showAvatar: true,
      sound: true
    },
    defaultStyle: {},
    settingsSchema: [
      { key: 'provider', label: 'Provider', type: 'select', defaultValue: 'custom', options: [
        { value: 'custom', label: 'Custom' }, { value: 'intercom', label: 'Intercom' },
        { value: 'crisp', label: 'Crisp' }, { value: 'tawk', label: 'Tawk.to' },
        { value: 'zendesk', label: 'Zendesk' },
      ]},
      { key: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-right', options: [
        { value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' },
      ]},
      { key: 'greeting', label: 'Greeting Message', type: 'text', defaultValue: '' },
      { key: 'showAvatar', label: 'Show Avatar', type: 'checkbox', defaultValue: true },
      { key: 'sound', label: 'Notification Sound', type: 'checkbox', defaultValue: true },
    ],
  },
];

// Category Info
export const elementCategories: { id: ElementCategory; name: string; icon: string; description: string }[] = [
  { id: 'content', name: 'Content', icon: 'FileText', description: 'Text, headings, and rich content' },
  { id: 'media', name: 'Media', icon: 'Image', description: 'Images, videos, and galleries' },
  { id: 'social', name: 'Social', icon: 'Share2', description: 'Social media integrations' },
  { id: 'navigation', name: 'Navigation', icon: 'Menu', description: 'Menus, breadcrumbs, and navigation' },
  { id: 'forms', name: 'Forms', icon: 'FileInput', description: 'Search, contact, and subscription forms' },
  { id: 'ecommerce', name: 'E-commerce', icon: 'ShoppingCart', description: 'Products, carts, and pricing' },
  { id: 'interactive', name: 'Interactive', icon: 'MousePointer', description: 'Tabs, accordions, and animations' },
  { id: 'layout', name: 'Layout', icon: 'Layout', description: 'Containers, columns, and cards' },
  { id: 'data', name: 'Data', icon: 'Database', description: 'Posts, calendars, and feeds' },
  { id: 'custom', name: 'Custom', icon: 'Code', description: 'Custom HTML and shortcodes' },
  { id: 'marketing', name: 'Marketing', icon: 'Zap', description: 'CTAs, banners, and lead generation' },
  { id: 'analytics', name: 'Analytics', icon: 'BarChart2', description: 'Charts, stats, and metrics' },
  { id: 'booking', name: 'Booking', icon: 'Calendar', description: 'Appointments, events, and reservations' },
  { id: 'maps', name: 'Maps', icon: 'Map', description: 'Maps, locations, and directions' },
  { id: 'portfolio', name: 'Portfolio', icon: 'Folder', description: 'Projects, skills, and work samples' },
];

// Store State
interface SidebarElementsState {
  // Elements
  customElements: SidebarElement[];

  // Methods
  getElementDefinition: (type: ElementType) => ElementDefinition | undefined;
  getElementsByCategory: (category: ElementCategory) => ElementDefinition[];
  getAllElements: () => ElementDefinition[];
  searchElements: (query: string) => ElementDefinition[];

  // Custom element management
  addCustomElement: (element: SidebarElement) => void;
  updateCustomElement: (id: string, updates: Partial<SidebarElement>) => void;
  deleteCustomElement: (id: string) => void;
}

export const useSidebarElementsStore = create<SidebarElementsState>()(
  persist(
    (set, get) => ({
      customElements: [],

      getElementDefinition: (type: ElementType) => {
        return elementDefinitions.find(e => e.type === type);
      },

      getElementsByCategory: (category: ElementCategory) => {
        return elementDefinitions.filter(e => e.category === category);
      },

      getAllElements: () => {
        return elementDefinitions;
      },

      searchElements: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return elementDefinitions.filter(e =>
          e.label.toLowerCase().includes(lowerQuery) ||
          e.description.toLowerCase().includes(lowerQuery) ||
          e.category.toLowerCase().includes(lowerQuery)
        );
      },

      addCustomElement: (element: SidebarElement) => {
        set((state) => ({
          customElements: [...state.customElements, element],
        }));
      },

      updateCustomElement: (id: string, updates: Partial<SidebarElement>) => {
        set((state) => ({
          customElements: state.customElements.map(el =>
            el.id === id ? { ...el, ...updates } : el
          ),
        }));
      },

      deleteCustomElement: (id: string) => {
        set((state) => ({
          customElements: state.customElements.filter(el => el.id !== id),
        }));
      },
    }),
    {
      name: 'rustpress-sidebar-elements',
    }
  )
);

// Helper to create a new element instance
export function createElementInstance(type: ElementType, title?: string): SidebarElement {
  const definition = elementDefinitions.find(e => e.type === type);

  return {
    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: title || definition?.label || type,
    settings: definition?.defaultSettings || {},
    style: definition?.defaultStyle || {},
    isVisible: true,
    isExpanded: false,
  };
}
