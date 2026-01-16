import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Eye,
  Copy,
  MoreVertical,
  X,
  ChevronDown,
  ChevronRight,
  Columns,
  LayoutGrid,
  Image,
  FileText,
  Link as LinkIcon,
  ShoppingBag,
  Video,
  MapPin,
  Users,
  Star,
  Zap,
  Sparkles,
  Palette,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Layers,
  Box,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  List,
  Calendar,
  Tag,
  Folder,
  ArrowRight,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Monitor,
  Tablet,
  Smartphone,
  Moon,
  Sun,
  Wand2,
  MousePointer,
  Hand,
  Target,
  Crosshair,
  Sliders,
  PanelLeft,
  PanelRight,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Workflow,
  Boxes,
  Component,
  Puzzle,
  LayoutTemplate,
  Gauge,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Badge,
  Crown,
  Gem,
  Gift,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  Mail,
  Phone,
  Clock,
  Timer,
  Compass,
  Navigation,
  Globe,
  Map
} from 'lucide-react';
import clsx from 'clsx';

// ==================== TYPES ====================

export interface MegaMenuConfig {
  id: string;
  enabled: boolean;
  width: 'full' | 'container' | 'auto' | number;
  columns: MegaMenuColumn[];
  background: BackgroundConfig;
  padding: SpacingConfig;
  animation: AnimationConfig;
  effects: EffectsConfig;
  responsive: ResponsiveConfig;
  advanced: AdvancedConfig;
}

export interface MegaMenuColumn {
  id: string;
  width: number; // percentage 1-100
  widgets: MegaMenuWidget[];
  background?: BackgroundConfig;
  padding?: SpacingConfig;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface MegaMenuWidget {
  id: string;
  type: WidgetType;
  title: string;
  showTitle: boolean;
  config: WidgetConfig;
  style: WidgetStyle;
  animation?: WidgetAnimation;
}

export type WidgetType =
  // Core Navigation
  | 'links'
  | 'breadcrumbs'
  | 'sitemap'
  | 'page-tree'
  // Content
  | 'text'
  | 'html'
  | 'posts'
  | 'featured-post'
  | 'author-box'
  | 'faq'
  // Media
  | 'image'
  | 'image-gallery'
  | 'video'
  | 'banner'
  | 'audio-player'
  | 'podcast'
  | 'lightbox'
  | 'carousel'
  // E-Commerce
  | 'products'
  | 'categories'
  | 'tags'
  | 'sale-banner'
  | 'featured-deal'
  | 'cart-preview'
  | 'product-card'
  | 'coupon-code'
  | 'compare'
  | 'wishlist'
  // Actions & CTA
  | 'cta-button'
  | 'cta-banner'
  | 'download-button'
  | 'app-store'
  | 'book-demo'
  | 'free-trial'
  // Contact & Communication
  | 'contact-info'
  | 'business-hours'
  | 'quick-contact'
  | 'live-chat'
  | 'whatsapp'
  | 'support'
  | 'map'
  | 'newsletter'
  // Data & Stats
  | 'stats'
  | 'chart'
  | 'data-table'
  | 'counter'
  | 'timeline'
  | 'milestone'
  | 'progress-bar'
  | 'countdown'
  // Social Media
  | 'social-links'
  | 'social-icons'
  | 'twitter-feed'
  | 'instagram-feed'
  | 'facebook-feed'
  | 'youtube-videos'
  | 'linkedin-feed'
  | 'tiktok-videos'
  | 'discord-widget'
  // UI Components
  | 'icon-box'
  | 'icon-list'
  | 'icon'
  | 'badge'
  | 'alert'
  | 'tooltip'
  | 'notice'
  | 'qr-code'
  | 'tabs'
  | 'accordion'
  | 'divider'
  | 'spacer'
  // Advanced
  | 'search'
  | 'shortcode'
  | 'code-block'
  | 'widget-area'
  | 'template'
  | 'dynamic-content'
  | 'api-data'
  | 'rust-component'
  | 'webhook'
  // Forms
  | 'contact-form'
  | 'subscribe-form'
  | 'login-form'
  | 'register-form'
  | 'survey'
  | 'poll'
  | 'feedback-form'
  | 'quiz'
  // Branding
  | 'logo'
  | 'tagline'
  | 'trust-badges'
  | 'certifications'
  | 'partner-logos'
  | 'press-mentions'
  | 'awards'
  | 'ratings'
  // People
  | 'testimonial'
  | 'team-member'
  | 'pricing-card'
  // Legacy
  | 'custom';

export interface WidgetConfig {
  // Links widget
  links?: Array<{
    id: string;
    label: string;
    url: string;
    icon?: string;
    badge?: string;
    badgeColor?: string;
    description?: string;
    target?: '_self' | '_blank';
    image?: string;
  }>;

  // Image widget
  image?: {
    src: string;
    alt: string;
    link?: string;
    linkTarget?: '_self' | '_blank';
    caption?: string;
    aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
    objectFit?: 'cover' | 'contain' | 'fill';
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number;
      text?: string;
      textPosition?: 'top' | 'center' | 'bottom';
    };
    hover?: {
      effect: 'none' | 'zoom' | 'brightness' | 'blur' | 'grayscale' | 'sepia';
      intensity: number;
    };
  };

  // Image Gallery
  gallery?: {
    images: Array<{
      id: string;
      src: string;
      alt: string;
      link?: string;
    }>;
    layout: 'grid' | 'masonry' | 'carousel';
    columns: number;
    gap: number;
    lightbox: boolean;
  };

  // Text widget
  text?: {
    content: string;
    format: 'plain' | 'markdown' | 'html';
  };

  // Posts widget
  posts?: {
    source: 'recent' | 'popular' | 'category' | 'tag' | 'custom';
    categoryId?: string;
    tagId?: string;
    postIds?: string[];
    count: number;
    layout: 'list' | 'grid' | 'carousel';
    columns?: number;
    showImage: boolean;
    showExcerpt: boolean;
    showDate: boolean;
    showAuthor: boolean;
    showCategory: boolean;
    excerptLength: number;
    imageAspectRatio: '1:1' | '4:3' | '16:9';
  };

  // Products widget
  products?: {
    source: 'featured' | 'sale' | 'new' | 'bestseller' | 'category' | 'custom';
    categoryId?: string;
    productIds?: string[];
    count: number;
    layout: 'grid' | 'list' | 'carousel';
    columns?: number;
    showImage: boolean;
    showPrice: boolean;
    showRating: boolean;
    showAddToCart: boolean;
    showBadge: boolean;
  };

  // Categories widget
  categories?: {
    ids?: string[];
    showAll: boolean;
    showCount: boolean;
    showImage: boolean;
    layout: 'list' | 'grid' | 'dropdown';
    columns?: number;
    hierarchical: boolean;
  };

  // Icon Box widget
  iconBox?: {
    icon: string;
    iconStyle: 'simple' | 'circle' | 'square' | 'rounded' | 'gradient';
    iconColor: string;
    iconBgColor?: string;
    iconSize: 'sm' | 'md' | 'lg' | 'xl';
    title: string;
    description: string;
    link?: string;
    linkText?: string;
    layout: 'vertical' | 'horizontal';
  };

  // Icon List widget
  iconList?: {
    items: Array<{
      id: string;
      icon: string;
      text: string;
      link?: string;
      color?: string;
    }>;
    iconPosition: 'left' | 'right';
    divider: boolean;
  };

  // CTA Button widget
  ctaButton?: {
    text: string;
    url: string;
    target: '_self' | '_blank';
    style: 'solid' | 'outline' | 'ghost' | 'gradient';
    size: 'sm' | 'md' | 'lg' | 'xl';
    color: string;
    hoverColor?: string;
    icon?: string;
    iconPosition: 'left' | 'right';
    fullWidth: boolean;
    animation: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow';
  };

  // CTA Banner widget
  ctaBanner?: {
    backgroundImage?: string;
    backgroundColor?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonUrl: string;
    buttonStyle: 'solid' | 'outline' | 'ghost';
    buttonColor: string;
    alignment: 'left' | 'center' | 'right';
    minHeight?: number;
  };

  // Video widget
  video?: {
    type: 'youtube' | 'vimeo' | 'self-hosted';
    url: string;
    thumbnail?: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;
    aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  };

  // Map widget
  map?: {
    type: 'google' | 'openstreetmap' | 'static';
    lat: number;
    lng: number;
    zoom: number;
    marker: boolean;
    markerTitle?: string;
    style?: string;
    height: number;
  };

  // Contact Info widget
  contactInfo?: {
    items: Array<{
      id: string;
      type: 'address' | 'phone' | 'email' | 'hours' | 'custom';
      icon?: string;
      label: string;
      value: string;
      link?: string;
    }>;
    layout: 'vertical' | 'horizontal' | 'inline';
  };

  // Social Links widget
  socialLinks?: {
    networks: Array<{
      id: string;
      platform: string;
      url: string;
      icon?: string;
      color?: string;
    }>;
    style: 'icons' | 'buttons' | 'text';
    size: 'sm' | 'md' | 'lg';
    colorStyle: 'brand' | 'mono' | 'custom';
    customColor?: string;
    layout: 'horizontal' | 'vertical';
  };

  // Newsletter widget
  newsletter?: {
    title?: string;
    description?: string;
    placeholder: string;
    buttonText: string;
    buttonColor: string;
    layout: 'horizontal' | 'vertical';
    showName: boolean;
    privacyText?: string;
    privacyLink?: string;
  };

  // Search widget
  search?: {
    placeholder: string;
    searchType: 'all' | 'posts' | 'products' | 'pages';
    showIcon: boolean;
    showButton: boolean;
    buttonText?: string;
    liveSearch: boolean;
    minChars: number;
  };

  // Tabs widget
  tabs?: {
    items: Array<{
      id: string;
      label: string;
      icon?: string;
      content: MegaMenuWidget[];
    }>;
    style: 'default' | 'pills' | 'underline' | 'vertical';
    activeColor: string;
  };

  // Accordion widget
  accordion?: {
    items: Array<{
      id: string;
      title: string;
      icon?: string;
      content: string;
      defaultOpen?: boolean;
    }>;
    allowMultiple: boolean;
    style: 'default' | 'bordered' | 'separated';
    iconPosition: 'left' | 'right';
  };

  // Carousel widget
  carousel?: {
    items: Array<{
      id: string;
      image: string;
      title?: string;
      description?: string;
      link?: string;
    }>;
    autoplay: boolean;
    interval: number;
    showDots: boolean;
    showArrows: boolean;
    effect: 'slide' | 'fade' | 'cube' | 'flip';
  };

  // Testimonial widget
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
    style: 'card' | 'minimal' | 'bordered';
  };

  // Team Member widget
  teamMember?: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
    social?: Array<{
      platform: string;
      url: string;
    }>;
    layout: 'card' | 'horizontal' | 'minimal';
  };

  // Pricing Card widget
  pricingCard?: {
    title: string;
    price: string;
    period?: string;
    description?: string;
    features: Array<{
      text: string;
      included: boolean;
    }>;
    buttonText: string;
    buttonUrl: string;
    highlighted?: boolean;
    badge?: string;
  };

  // Countdown widget
  countdown?: {
    targetDate: string;
    labels: {
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
    };
    style: 'boxes' | 'inline' | 'flip';
    showLabels: boolean;
    completedText?: string;
    completedAction?: 'hide' | 'show-text' | 'redirect';
    redirectUrl?: string;
  };

  // Stats widget
  stats?: {
    items: Array<{
      id: string;
      value: string;
      label: string;
      icon?: string;
      prefix?: string;
      suffix?: string;
      animated?: boolean;
    }>;
    layout: 'horizontal' | 'grid';
    columns?: number;
    style: 'default' | 'bordered' | 'card';
  };

  // Progress Bar widget
  progressBar?: {
    items: Array<{
      id: string;
      label: string;
      value: number;
      color?: string;
      showValue: boolean;
    }>;
    style: 'default' | 'striped' | 'gradient';
    height: number;
    animated: boolean;
  };

  // Custom widget
  custom?: {
    html: string;
    css?: string;
    js?: string;
  };

  // Shortcode widget
  shortcode?: {
    code: string;
    parameters?: Record<string, any>;
  };

  // Divider widget
  divider?: {
    style: 'solid' | 'dashed' | 'dotted' | 'double';
    color: string;
    thickness: number;
    spacing: number;
  };

  // Spacer widget
  spacer?: {
    height: number;
    responsive?: {
      tablet?: number;
      mobile?: number;
    };
  };
}

export interface WidgetStyle {
  background?: BackgroundConfig;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  border?: BorderConfig;
  borderRadius?: number;
  shadow?: ShadowConfig;
  typography?: TypographyConfig;
  customCss?: string;
}

export interface WidgetAnimation {
  entrance: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'flip' | 'bounce';
  duration: number;
  delay: number;
  stagger: number;
  hover?: 'none' | 'lift' | 'grow' | 'shrink' | 'glow' | 'shake' | 'pulse';
}

export interface BackgroundConfig {
  type: 'none' | 'solid' | 'gradient' | 'image' | 'video' | 'pattern' | 'effect';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial' | 'conic';
    angle?: number;
    colors: Array<{ color: string; position: number }>;
  };
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'auto';
    position: string;
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    attachment: 'scroll' | 'fixed';
    overlay?: {
      color: string;
      opacity: number;
    };
  };
  video?: {
    url: string;
    poster?: string;
    loop?: boolean;
    muted?: boolean;
    autoplay?: boolean;
    overlay?: {
      color: string;
      opacity: number;
    };
  };
  pattern?: {
    type: 'dots' | 'lines' | 'grid' | 'diagonal' | 'waves' | 'triangles' | 'hexagons' | 'circles' | 'squares' | 'diamonds' | 'zigzag' | 'chevron' | 'polka' | 'stripes' | 'crosshatch';
    color: string;
    opacity: number;
    size: number;
  };
  effect?: {
    type: BackgroundEffectType;
    config: BackgroundEffectConfig;
  };
}

// 50+ Background Effect Types
export type BackgroundEffectType =
  // Particle Effects
  | 'particles-float'
  | 'particles-snow'
  | 'particles-rain'
  | 'particles-bubbles'
  | 'particles-confetti'
  | 'particles-stars'
  | 'particles-fireflies'
  | 'particles-dust'
  | 'particles-sparkle'
  | 'particles-meteor'
  // Geometric Effects
  | 'geometric-waves'
  | 'geometric-circles'
  | 'geometric-polygons'
  | 'geometric-hexagons'
  | 'geometric-triangles'
  | 'geometric-squares'
  | 'geometric-mesh'
  | 'geometric-voronoi'
  | 'geometric-lattice'
  | 'geometric-cubes'
  // Gradient Animation Effects
  | 'gradient-shift'
  | 'gradient-aurora'
  | 'gradient-rainbow'
  | 'gradient-sunset'
  | 'gradient-ocean'
  | 'gradient-neon'
  | 'gradient-pulse'
  | 'gradient-wave'
  | 'gradient-morph'
  | 'gradient-flow'
  // Texture Effects
  | 'texture-noise'
  | 'texture-grain'
  | 'texture-paper'
  | 'texture-fabric'
  | 'texture-marble'
  | 'texture-wood'
  | 'texture-concrete'
  | 'texture-glass'
  | 'texture-frosted'
  | 'texture-water'
  // Motion Effects
  | 'motion-blur'
  | 'motion-ripple'
  | 'motion-spiral'
  | 'motion-vortex'
  | 'motion-zoom'
  | 'motion-parallax'
  | 'motion-float'
  | 'motion-bounce'
  | 'motion-sway'
  | 'motion-drift'
  // Light Effects
  | 'light-glow'
  | 'light-spotlight'
  | 'light-rays'
  | 'light-lens-flare'
  | 'light-bokeh'
  | 'light-shimmer'
  | 'light-flash'
  | 'light-neon-glow'
  | 'light-ambient'
  | 'light-caustics';

export interface BackgroundEffectConfig {
  // Common settings
  speed?: number; // Animation speed (0.1-10)
  intensity?: number; // Effect intensity (0-100)
  color1?: string; // Primary color
  color2?: string; // Secondary color
  color3?: string; // Tertiary color
  opacity?: number; // Effect opacity (0-100)
  blend?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn';
  // Particle-specific
  particleCount?: number;
  particleSize?: number;
  particleShape?: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  // Motion-specific
  direction?: 'up' | 'down' | 'left' | 'right' | 'random';
  amplitude?: number;
  frequency?: number;
  // Light-specific
  brightness?: number;
  spread?: number;
  position?: { x: number; y: number };
  // Background color options for particle effects
  bgType?: 'solid' | 'gradient2' | 'gradient4'; // Background type
  bgColor1?: string; // Background color 1 (solid or gradient start)
  bgColor2?: string; // Background color 2 (for gradients)
  bgColor3?: string; // Background color 3 (for 4-color gradient)
  bgColor4?: string; // Background color 4 (for 4-color gradient)
  bgAngle?: number; // Gradient angle (degrees)
}

// Background Effect Presets
export const BACKGROUND_EFFECT_PRESETS: Record<string, { effect: BackgroundEffectType; config: BackgroundEffectConfig; label: string; category: string }> = {
  // Particle Presets
  'floating-particles': { effect: 'particles-float', config: { speed: 1, particleCount: 50, color1: '#ffffff', opacity: 30 }, label: 'Floating Particles', category: 'Particles' },
  'gentle-snow': { effect: 'particles-snow', config: { speed: 0.5, particleCount: 100, color1: '#ffffff', opacity: 60 }, label: 'Gentle Snow', category: 'Particles' },
  'light-rain': { effect: 'particles-rain', config: { speed: 2, particleCount: 80, color1: '#87ceeb', opacity: 40 }, label: 'Light Rain', category: 'Particles' },
  'bubbles-float': { effect: 'particles-bubbles', config: { speed: 0.8, particleCount: 30, color1: '#ffffff', opacity: 25 }, label: 'Floating Bubbles', category: 'Particles' },
  'celebration-confetti': { effect: 'particles-confetti', config: { speed: 1.5, particleCount: 100, opacity: 70 }, label: 'Celebration Confetti', category: 'Particles' },
  'twinkling-stars': { effect: 'particles-stars', config: { speed: 0.3, particleCount: 60, color1: '#ffffff', opacity: 80 }, label: 'Twinkling Stars', category: 'Particles' },
  'magical-fireflies': { effect: 'particles-fireflies', config: { speed: 0.6, particleCount: 25, color1: '#ffff88', opacity: 60 }, label: 'Magical Fireflies', category: 'Particles' },
  'subtle-dust': { effect: 'particles-dust', config: { speed: 0.4, particleCount: 40, color1: '#cccccc', opacity: 20 }, label: 'Subtle Dust', category: 'Particles' },
  'sparkle-magic': { effect: 'particles-sparkle', config: { speed: 1, particleCount: 35, color1: '#ffd700', opacity: 70 }, label: 'Sparkle Magic', category: 'Particles' },
  'meteor-shower': { effect: 'particles-meteor', config: { speed: 3, particleCount: 15, color1: '#ffffff', opacity: 80 }, label: 'Meteor Shower', category: 'Particles' },
  // Geometric Presets
  'wave-pattern': { effect: 'geometric-waves', config: { speed: 1, color1: '#3b82f6', color2: '#1e40af', opacity: 30 }, label: 'Wave Pattern', category: 'Geometric' },
  'expanding-circles': { effect: 'geometric-circles', config: { speed: 0.8, color1: '#8b5cf6', opacity: 25 }, label: 'Expanding Circles', category: 'Geometric' },
  'polygon-mesh': { effect: 'geometric-polygons', config: { speed: 0.5, color1: '#10b981', opacity: 20 }, label: 'Polygon Mesh', category: 'Geometric' },
  'hex-grid': { effect: 'geometric-hexagons', config: { speed: 0.3, color1: '#f59e0b', opacity: 15 }, label: 'Hex Grid', category: 'Geometric' },
  'triangle-pattern': { effect: 'geometric-triangles', config: { speed: 0.6, color1: '#ef4444', opacity: 20 }, label: 'Triangle Pattern', category: 'Geometric' },
  'square-dance': { effect: 'geometric-squares', config: { speed: 0.7, color1: '#06b6d4', opacity: 25 }, label: 'Square Dance', category: 'Geometric' },
  'wire-mesh': { effect: 'geometric-mesh', config: { speed: 0.4, color1: '#64748b', opacity: 15 }, label: 'Wire Mesh', category: 'Geometric' },
  'voronoi-cells': { effect: 'geometric-voronoi', config: { speed: 0.5, color1: '#ec4899', opacity: 20 }, label: 'Voronoi Cells', category: 'Geometric' },
  'lattice-structure': { effect: 'geometric-lattice', config: { speed: 0.3, color1: '#14b8a6', opacity: 15 }, label: 'Lattice Structure', category: 'Geometric' },
  'floating-cubes': { effect: 'geometric-cubes', config: { speed: 0.8, color1: '#a855f7', opacity: 30 }, label: 'Floating Cubes', category: 'Geometric' },
  // Gradient Presets
  'color-shift': { effect: 'gradient-shift', config: { speed: 1, color1: '#3b82f6', color2: '#8b5cf6', color3: '#ec4899', opacity: 100 }, label: 'Color Shift', category: 'Gradients' },
  'aurora-borealis': { effect: 'gradient-aurora', config: { speed: 0.5, color1: '#22c55e', color2: '#06b6d4', color3: '#8b5cf6', opacity: 60 }, label: 'Aurora Borealis', category: 'Gradients' },
  'rainbow-flow': { effect: 'gradient-rainbow', config: { speed: 1.5, opacity: 40 }, label: 'Rainbow Flow', category: 'Gradients' },
  'sunset-glow': { effect: 'gradient-sunset', config: { speed: 0.8, color1: '#f97316', color2: '#ec4899', color3: '#8b5cf6', opacity: 70 }, label: 'Sunset Glow', category: 'Gradients' },
  'ocean-depths': { effect: 'gradient-ocean', config: { speed: 0.6, color1: '#0ea5e9', color2: '#0284c7', color3: '#0c4a6e', opacity: 80 }, label: 'Ocean Depths', category: 'Gradients' },
  'neon-nights': { effect: 'gradient-neon', config: { speed: 1.2, color1: '#ff00ff', color2: '#00ffff', opacity: 50 }, label: 'Neon Nights', category: 'Gradients' },
  'pulsing-gradient': { effect: 'gradient-pulse', config: { speed: 1, color1: '#ef4444', color2: '#3b82f6', opacity: 60 }, label: 'Pulsing Gradient', category: 'Gradients' },
  'gradient-waves': { effect: 'gradient-wave', config: { speed: 0.8, color1: '#06b6d4', color2: '#8b5cf6', opacity: 50 }, label: 'Gradient Waves', category: 'Gradients' },
  'morphing-colors': { effect: 'gradient-morph', config: { speed: 0.7, color1: '#f59e0b', color2: '#84cc16', color3: '#22c55e', opacity: 70 }, label: 'Morphing Colors', category: 'Gradients' },
  'flowing-gradient': { effect: 'gradient-flow', config: { speed: 1, color1: '#ec4899', color2: '#f97316', opacity: 60 }, label: 'Flowing Gradient', category: 'Gradients' },
  // Texture Presets
  'subtle-noise': { effect: 'texture-noise', config: { intensity: 20, opacity: 30 }, label: 'Subtle Noise', category: 'Textures' },
  'film-grain': { effect: 'texture-grain', config: { intensity: 30, opacity: 25 }, label: 'Film Grain', category: 'Textures' },
  'paper-texture': { effect: 'texture-paper', config: { intensity: 40, opacity: 20 }, label: 'Paper Texture', category: 'Textures' },
  'fabric-weave': { effect: 'texture-fabric', config: { intensity: 35, opacity: 15 }, label: 'Fabric Weave', category: 'Textures' },
  'marble-veins': { effect: 'texture-marble', config: { intensity: 50, color1: '#ffffff', color2: '#94a3b8', opacity: 30 }, label: 'Marble Veins', category: 'Textures' },
  'wood-grain': { effect: 'texture-wood', config: { intensity: 45, color1: '#a16207', opacity: 25 }, label: 'Wood Grain', category: 'Textures' },
  'concrete-surface': { effect: 'texture-concrete', config: { intensity: 30, opacity: 20 }, label: 'Concrete Surface', category: 'Textures' },
  'glass-surface': { effect: 'texture-glass', config: { intensity: 15, opacity: 10 }, label: 'Glass Surface', category: 'Textures' },
  'frosted-glass': { effect: 'texture-frosted', config: { intensity: 60, opacity: 40 }, label: 'Frosted Glass', category: 'Textures' },
  'water-ripples': { effect: 'texture-water', config: { speed: 0.5, intensity: 40, color1: '#06b6d4', opacity: 30 }, label: 'Water Ripples', category: 'Textures' },
  // Motion Presets
  'blur-motion': { effect: 'motion-blur', config: { speed: 1, intensity: 30, direction: 'random' }, label: 'Blur Motion', category: 'Motion' },
  'ripple-effect': { effect: 'motion-ripple', config: { speed: 0.8, amplitude: 20, color1: '#3b82f6', opacity: 30 }, label: 'Ripple Effect', category: 'Motion' },
  'spiral-motion': { effect: 'motion-spiral', config: { speed: 0.5, color1: '#8b5cf6', opacity: 25 }, label: 'Spiral Motion', category: 'Motion' },
  'vortex-spin': { effect: 'motion-vortex', config: { speed: 0.6, color1: '#06b6d4', opacity: 30 }, label: 'Vortex Spin', category: 'Motion' },
  'zoom-pulse': { effect: 'motion-zoom', config: { speed: 1, intensity: 20, opacity: 20 }, label: 'Zoom Pulse', category: 'Motion' },
  'parallax-depth': { effect: 'motion-parallax', config: { speed: 0.3, intensity: 40 }, label: 'Parallax Depth', category: 'Motion' },
  'floating-motion': { effect: 'motion-float', config: { speed: 0.5, amplitude: 15, opacity: 20 }, label: 'Floating Motion', category: 'Motion' },
  'bounce-effect': { effect: 'motion-bounce', config: { speed: 1, amplitude: 25, opacity: 25 }, label: 'Bounce Effect', category: 'Motion' },
  'gentle-sway': { effect: 'motion-sway', config: { speed: 0.4, amplitude: 10, opacity: 15 }, label: 'Gentle Sway', category: 'Motion' },
  'slow-drift': { effect: 'motion-drift', config: { speed: 0.3, direction: 'random', opacity: 20 }, label: 'Slow Drift', category: 'Motion' },
  // Light Presets
  'soft-glow': { effect: 'light-glow', config: { brightness: 40, spread: 60, color1: '#ffffff', opacity: 30 }, label: 'Soft Glow', category: 'Light' },
  'spotlight-focus': { effect: 'light-spotlight', config: { brightness: 60, spread: 40, position: { x: 50, y: 50 }, opacity: 40 }, label: 'Spotlight Focus', category: 'Light' },
  'sun-rays': { effect: 'light-rays', config: { brightness: 50, spread: 80, color1: '#fbbf24', opacity: 35 }, label: 'Sun Rays', category: 'Light' },
  'lens-flare': { effect: 'light-lens-flare', config: { brightness: 70, color1: '#ffffff', opacity: 25 }, label: 'Lens Flare', category: 'Light' },
  'bokeh-blur': { effect: 'light-bokeh', config: { particleCount: 40, particleSize: 30, color1: '#ffffff', opacity: 30 }, label: 'Bokeh Blur', category: 'Light' },
  'shimmer-effect': { effect: 'light-shimmer', config: { speed: 1.5, brightness: 30, opacity: 25 }, label: 'Shimmer Effect', category: 'Light' },
  'flash-burst': { effect: 'light-flash', config: { speed: 2, brightness: 80, opacity: 20 }, label: 'Flash Burst', category: 'Light' },
  'neon-glow': { effect: 'light-neon-glow', config: { brightness: 60, color1: '#ff00ff', color2: '#00ffff', opacity: 50 }, label: 'Neon Glow', category: 'Light' },
  'ambient-light': { effect: 'light-ambient', config: { brightness: 20, spread: 100, color1: '#fef3c7', opacity: 15 }, label: 'Ambient Light', category: 'Light' },
  'water-caustics': { effect: 'light-caustics', config: { speed: 0.6, intensity: 40, color1: '#06b6d4', opacity: 25 }, label: 'Water Caustics', category: 'Light' },
};

export interface SpacingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
  linked?: boolean;
}

export interface BorderConfig {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color: string;
  sides?: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

export interface ShadowConfig {
  enabled: boolean;
  preset?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner' | 'custom';
  custom?: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
}

export interface TypographyConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
}

export interface AnimationConfig {
  entrance: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'flip' | 'bounce' | 'elastic';
    direction?: 'up' | 'down' | 'left' | 'right';
    duration: number;
    delay: number;
    easing: string;
  };
  exit: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'flip';
    direction?: 'up' | 'down' | 'left' | 'right';
    duration: number;
    easing: string;
  };
  hover: {
    type: 'none' | 'lift' | 'glow' | 'scale' | 'border-glow';
    intensity: number;
  };
  stagger: {
    enabled: boolean;
    delay: number;
    from: 'start' | 'center' | 'end';
  };
}

export interface EffectsConfig {
  glassmorphism: {
    enabled: boolean;
    blur: number;
    opacity: number;
    borderOpacity: number;
  };
  blur: {
    enabled: boolean;
    amount: number;
  };
  noise: {
    enabled: boolean;
    opacity: number;
  };
  grain: {
    enabled: boolean;
    opacity: number;
  };
  parallax: {
    enabled: boolean;
    intensity: number;
  };
  cursor: {
    type: 'default' | 'pointer' | 'glow' | 'magnetic' | 'custom';
    customCursor?: string;
  };
}

export interface ResponsiveConfig {
  tablet: {
    columns: 'inherit' | number;
    width: 'full' | 'container' | number;
    hidden: boolean;
  };
  mobile: {
    columns: 'inherit' | number;
    width: 'full' | 'container' | number;
    hidden: boolean;
    accordion: boolean;
  };
}

export interface AdvancedConfig {
  closeOnClick: boolean;
  closeOnOutsideClick: boolean;
  openDelay: number;
  closeDelay: number;
  hoverIntent: boolean;
  touchBehavior: 'toggle' | 'first-tap-open' | 'link';
  preventBodyScroll: boolean;
  trapFocus: boolean;
  ariaBehavior: 'menu' | 'navigation' | 'dialog';
  customClass?: string;
  customId?: string;
}

// ==================== WIDGET DEFINITIONS ====================

const WIDGET_TYPES: Array<{
  type: WidgetType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'media' | 'commerce' | 'interactive' | 'layout' | 'marketing' | 'social';
  description: string;
}> = [
  { type: 'links', label: 'Links List', icon: LinkIcon, category: 'content', description: 'Navigation links with icons and descriptions' },
  { type: 'image', label: 'Image', icon: Image, category: 'media', description: 'Single image with overlay and effects' },
  { type: 'image-gallery', label: 'Image Gallery', icon: LayoutGrid, category: 'media', description: 'Grid or carousel of images' },
  { type: 'text', label: 'Text Block', icon: Type, category: 'content', description: 'Rich text content' },
  { type: 'html', label: 'Custom HTML', icon: FileText, category: 'content', description: 'Custom HTML content' },
  { type: 'posts', label: 'Posts', icon: FileText, category: 'content', description: 'Display blog posts' },
  { type: 'products', label: 'Products', icon: ShoppingBag, category: 'commerce', description: 'Product showcase' },
  { type: 'categories', label: 'Categories', icon: Folder, category: 'content', description: 'Category list or grid' },
  { type: 'tags', label: 'Tags', icon: Tag, category: 'content', description: 'Tag cloud or list' },
  { type: 'icon-box', label: 'Icon Box', icon: Box, category: 'content', description: 'Icon with title and description' },
  { type: 'icon-list', label: 'Icon List', icon: List, category: 'content', description: 'List with custom icons' },
  { type: 'cta-button', label: 'CTA Button', icon: MousePointer, category: 'marketing', description: 'Call-to-action button' },
  { type: 'cta-banner', label: 'CTA Banner', icon: LayoutTemplate, category: 'marketing', description: 'Promotional banner' },
  { type: 'video', label: 'Video', icon: Video, category: 'media', description: 'Embedded video player' },
  { type: 'map', label: 'Map', icon: Map, category: 'content', description: 'Location map' },
  { type: 'contact-info', label: 'Contact Info', icon: Phone, category: 'content', description: 'Contact details' },
  { type: 'social-links', label: 'Social Links', icon: Globe, category: 'social', description: 'Social media links' },
  { type: 'newsletter', label: 'Newsletter', icon: Mail, category: 'marketing', description: 'Email subscription form' },
  { type: 'search', label: 'Search', icon: Target, category: 'interactive', description: 'Search box' },
  { type: 'tabs', label: 'Tabs', icon: Layers, category: 'layout', description: 'Tabbed content' },
  { type: 'accordion', label: 'Accordion', icon: Layers, category: 'layout', description: 'Collapsible sections' },
  { type: 'carousel', label: 'Carousel', icon: Workflow, category: 'interactive', description: 'Image/content slider' },
  { type: 'testimonial', label: 'Testimonial', icon: MessageCircle, category: 'social', description: 'Customer quote' },
  { type: 'team-member', label: 'Team Member', icon: Users, category: 'social', description: 'Team member card' },
  { type: 'pricing-card', label: 'Pricing Card', icon: Tag, category: 'commerce', description: 'Pricing plan' },
  { type: 'countdown', label: 'Countdown', icon: Timer, category: 'marketing', description: 'Countdown timer' },
  { type: 'stats', label: 'Statistics', icon: BarChart3, category: 'content', description: 'Number statistics' },
  { type: 'progress-bar', label: 'Progress Bar', icon: Activity, category: 'content', description: 'Progress indicators' },
  { type: 'custom', label: 'Custom Widget', icon: Puzzle, category: 'content', description: 'Custom HTML/CSS/JS' },
];

const WIDGET_CATEGORIES = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'commerce', label: 'Commerce', icon: ShoppingBag },
  { id: 'interactive', label: 'Interactive', icon: MousePointer },
  { id: 'layout', label: 'Layout', icon: Layers },
  { id: 'marketing', label: 'Marketing', icon: Zap },
  { id: 'social', label: 'Social', icon: Users },
];

// ==================== DEFAULT CONFIGS ====================

const getDefaultWidgetConfig = (type: WidgetType): WidgetConfig => {
  const defaults: Partial<Record<WidgetType, WidgetConfig>> = {
    links: {
      links: [
        { id: '1', label: 'Link 1', url: '#', icon: 'arrow-right' },
        { id: '2', label: 'Link 2', url: '#', icon: 'arrow-right' },
        { id: '3', label: 'Link 3', url: '#', icon: 'arrow-right' },
      ]
    },
    image: {
      image: {
        src: '',
        alt: 'Image',
        aspectRatio: '16:9',
        objectFit: 'cover',
        overlay: { enabled: false, color: '#000000', opacity: 0.5 },
        hover: { effect: 'zoom', intensity: 10 }
      }
    },
    'image-gallery': {
      gallery: {
        images: [],
        layout: 'grid',
        columns: 3,
        gap: 8,
        lightbox: true
      }
    },
    text: {
      text: {
        content: 'Enter your text here...',
        format: 'plain'
      }
    },
    html: {
      custom: {
        html: '<div>Custom HTML content</div>',
        css: '',
        js: ''
      }
    },
    posts: {
      posts: {
        source: 'recent',
        count: 4,
        layout: 'list',
        showImage: true,
        showExcerpt: true,
        showDate: true,
        showAuthor: false,
        showCategory: false,
        excerptLength: 80,
        imageAspectRatio: '16:9'
      }
    },
    products: {
      products: {
        source: 'featured',
        count: 4,
        layout: 'grid',
        columns: 2,
        showImage: true,
        showPrice: true,
        showRating: true,
        showAddToCart: false,
        showBadge: true
      }
    },
    categories: {
      categories: {
        showAll: true,
        showCount: true,
        showImage: false,
        layout: 'list',
        hierarchical: false
      }
    },
    tags: {
      categories: {
        showAll: true,
        showCount: false,
        showImage: false,
        layout: 'list',
        hierarchical: false
      }
    },
    'icon-box': {
      iconBox: {
        icon: 'star',
        iconStyle: 'circle',
        iconColor: '#3b82f6',
        iconBgColor: '#eff6ff',
        iconSize: 'lg',
        title: 'Feature Title',
        description: 'Feature description goes here',
        layout: 'vertical'
      }
    },
    'icon-list': {
      iconList: {
        items: [
          { id: '1', icon: 'check', text: 'List item 1', color: '#22c55e' },
          { id: '2', icon: 'check', text: 'List item 2', color: '#22c55e' },
          { id: '3', icon: 'check', text: 'List item 3', color: '#22c55e' },
        ],
        iconPosition: 'left',
        divider: false
      }
    },
    'cta-button': {
      ctaButton: {
        text: 'Click Here',
        url: '#',
        target: '_self',
        style: 'solid',
        size: 'md',
        color: '#3b82f6',
        iconPosition: 'right',
        fullWidth: false,
        animation: 'none'
      }
    },
    'cta-banner': {
      ctaBanner: {
        backgroundColor: '#3b82f6',
        title: 'Special Offer',
        subtitle: 'Limited time only!',
        buttonText: 'Shop Now',
        buttonUrl: '#',
        buttonStyle: 'solid',
        buttonColor: '#ffffff',
        alignment: 'center',
        minHeight: 200
      }
    },
    video: {
      video: {
        type: 'youtube',
        url: '',
        autoplay: false,
        muted: false,
        loop: false,
        controls: true,
        aspectRatio: '16:9'
      }
    },
    map: {
      map: {
        type: 'google',
        lat: 40.7128,
        lng: -74.006,
        zoom: 12,
        marker: true,
        markerTitle: 'Our Location',
        height: 200
      }
    },
    'contact-info': {
      contactInfo: {
        items: [
          { id: '1', type: 'address', icon: 'map-pin', label: 'Address', value: '123 Main St, City, Country' },
          { id: '2', type: 'phone', icon: 'phone', label: 'Phone', value: '+1 234 567 890' },
          { id: '3', type: 'email', icon: 'mail', label: 'Email', value: 'contact@example.com' },
        ],
        layout: 'vertical'
      }
    },
    'social-links': {
      socialLinks: {
        networks: [
          { id: '1', platform: 'facebook', url: '#' },
          { id: '2', platform: 'twitter', url: '#' },
          { id: '3', platform: 'instagram', url: '#' },
          { id: '4', platform: 'linkedin', url: '#' },
        ],
        style: 'icons',
        size: 'md',
        colorStyle: 'brand',
        layout: 'horizontal'
      }
    },
    newsletter: {
      newsletter: {
        title: 'Subscribe to our newsletter',
        description: 'Get the latest updates delivered to your inbox.',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        buttonColor: '#3b82f6',
        layout: 'horizontal',
        showName: false
      }
    },
    search: {
      search: {
        placeholder: 'Search...',
        searchType: 'all',
        showIcon: true,
        showButton: false,
        liveSearch: true,
        minChars: 2
      }
    },
    tabs: {
      tabs: {
        items: [
          { id: '1', label: 'Tab 1', content: [] },
          { id: '2', label: 'Tab 2', content: [] },
        ],
        style: 'default',
        activeColor: '#3b82f6'
      }
    },
    accordion: {
      accordion: {
        items: [
          { id: '1', title: 'Section 1', content: 'Content for section 1', defaultOpen: true },
          { id: '2', title: 'Section 2', content: 'Content for section 2' },
        ],
        allowMultiple: false,
        style: 'default',
        iconPosition: 'right'
      }
    },
    carousel: {
      carousel: {
        items: [],
        autoplay: true,
        interval: 5000,
        showDots: true,
        showArrows: true,
        effect: 'slide'
      }
    },
    testimonial: {
      testimonial: {
        quote: 'This is an amazing product! Highly recommended.',
        author: 'John Doe',
        role: 'CEO',
        company: 'Example Inc.',
        rating: 5,
        style: 'card'
      }
    },
    'team-member': {
      teamMember: {
        name: 'Jane Doe',
        role: 'Designer',
        avatar: '',
        bio: 'A brief bio about the team member.',
        social: [],
        layout: 'card'
      }
    },
    'pricing-card': {
      pricingCard: {
        title: 'Pro Plan',
        price: '$29',
        period: '/month',
        description: 'Perfect for growing businesses',
        features: [
          { text: 'Unlimited projects', included: true },
          { text: 'Priority support', included: true },
          { text: 'Custom domains', included: true },
          { text: 'API access', included: false },
        ],
        buttonText: 'Get Started',
        buttonUrl: '#',
        highlighted: false
      }
    },
    countdown: {
      countdown: {
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        labels: {
          days: 'Days',
          hours: 'Hours',
          minutes: 'Minutes',
          seconds: 'Seconds'
        },
        style: 'boxes',
        showLabels: true,
        completedText: 'Event has ended',
        completedAction: 'show-text'
      }
    },
    stats: {
      stats: {
        items: [
          { id: '1', value: '10K+', label: 'Customers', animated: true },
          { id: '2', value: '99%', label: 'Satisfaction', animated: true },
          { id: '3', value: '24/7', label: 'Support', animated: false },
        ],
        layout: 'horizontal',
        style: 'default'
      }
    },
    'progress-bar': {
      progressBar: {
        items: [
          { id: '1', label: 'HTML/CSS', value: 90, color: '#3b82f6', showValue: true },
          { id: '2', label: 'JavaScript', value: 85, color: '#8b5cf6', showValue: true },
          { id: '3', label: 'React', value: 80, color: '#06b6d4', showValue: true },
        ],
        style: 'default',
        height: 8,
        animated: true
      }
    },
    custom: {
      custom: {
        html: '<div class="custom-content">Your custom content here</div>',
        css: '.custom-content { padding: 20px; }',
        js: ''
      }
    },
    shortcode: {
      shortcode: {
        code: '[rustpress_shortcode]',
        parameters: {}
      }
    },
    divider: {
      divider: {
        style: 'solid',
        color: '#e5e7eb',
        thickness: 1,
        spacing: 16
      }
    },
    spacer: {
      spacer: {
        height: 24,
        responsive: {
          tablet: 20,
          mobile: 16
        }
      }
    }
  };

  return defaults[type] || {};
};

const getDefaultWidgetStyle = (): WidgetStyle => ({
  padding: { top: 16, right: 16, bottom: 16, left: 16, linked: true },
  margin: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
  borderRadius: 8,
});

export const getDefaultMegaMenuConfig = (): MegaMenuConfig => ({
  id: Math.random().toString(36).substr(2, 9),
  enabled: true,
  width: 'container',
  columns: [
    {
      id: '1',
      width: 25,
      widgets: [],
      alignment: 'start',
      verticalAlign: 'top'
    },
    {
      id: '2',
      width: 25,
      widgets: [],
      alignment: 'start',
      verticalAlign: 'top'
    },
    {
      id: '3',
      width: 25,
      widgets: [],
      alignment: 'start',
      verticalAlign: 'top'
    },
    {
      id: '4',
      width: 25,
      widgets: [],
      alignment: 'start',
      verticalAlign: 'top'
    },
  ],
  background: {
    type: 'solid',
    color: '#ffffff'
  },
  padding: { top: 32, right: 32, bottom: 32, left: 32, linked: true },
  animation: {
    entrance: {
      type: 'fade',
      duration: 200,
      delay: 0,
      easing: 'ease-out'
    },
    exit: {
      type: 'fade',
      duration: 150,
      easing: 'ease-in'
    },
    hover: {
      type: 'none',
      intensity: 0
    },
    stagger: {
      enabled: true,
      delay: 50,
      from: 'start'
    }
  },
  effects: {
    glassmorphism: { enabled: false, blur: 10, opacity: 0.8, borderOpacity: 0.2 },
    blur: { enabled: false, amount: 0 },
    noise: { enabled: false, opacity: 0.05 },
    grain: { enabled: false, opacity: 0.05 },
    parallax: { enabled: false, intensity: 0.1 },
    cursor: { type: 'default' }
  },
  responsive: {
    tablet: { columns: 'inherit', width: 'full', hidden: false },
    mobile: { columns: 1, width: 'full', hidden: false, accordion: true }
  },
  advanced: {
    closeOnClick: false,
    closeOnOutsideClick: true,
    openDelay: 0,
    closeDelay: 200,
    hoverIntent: true,
    touchBehavior: 'toggle',
    preventBodyScroll: false,
    trapFocus: true,
    ariaBehavior: 'menu'
  }
});

// ==================== MAIN COMPONENT ====================

interface MegaMenuBuilderProps {
  menuItemId: string;
  config: MegaMenuConfig | null;
  onChange: (config: MegaMenuConfig) => void;
  onClose: () => void;
}

export const MegaMenuBuilder: React.FC<MegaMenuBuilderProps> = ({
  menuItemId,
  config,
  onChange,
  onClose
}) => {
  const [megaConfig, setMegaConfig] = useState<MegaMenuConfig>(
    config || getDefaultMegaMenuConfig()
  );
  const [activeTab, setActiveTab] = useState<'layout' | 'widgets' | 'style' | 'animation' | 'effects' | 'responsive' | 'advanced'>('layout');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);
  const [widgetPickerCategory, setWidgetPickerCategory] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ columnId: string; index: number } | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Column management
  const addColumn = () => {
    if (megaConfig.columns.length >= 6) return;
    const equalWidth = Math.floor(100 / (megaConfig.columns.length + 1));
    const newColumns = megaConfig.columns.map(col => ({ ...col, width: equalWidth }));
    newColumns.push({
      id: generateId(),
      width: equalWidth,
      widgets: [],
      alignment: 'start',
      verticalAlign: 'top'
    });
    setMegaConfig({ ...megaConfig, columns: newColumns });
  };

  const removeColumn = (columnId: string) => {
    if (megaConfig.columns.length <= 1) return;
    const filteredColumns = megaConfig.columns.filter(c => c.id !== columnId);
    const equalWidth = Math.floor(100 / filteredColumns.length);
    const newColumns = filteredColumns.map(col => ({ ...col, width: equalWidth }));
    setMegaConfig({ ...megaConfig, columns: newColumns });
    if (selectedColumn === columnId) setSelectedColumn(null);
  };

  const updateColumn = (columnId: string, updates: Partial<MegaMenuColumn>) => {
    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      )
    });
  };

  const reorderColumns = (newOrder: MegaMenuColumn[]) => {
    setMegaConfig({ ...megaConfig, columns: newOrder });
  };

  // Widget management
  const addWidget = (columnId: string, widgetType: WidgetType) => {
    const widgetDef = WIDGET_TYPES.find(w => w.type === widgetType);
    if (!widgetDef) return;

    const newWidget: MegaMenuWidget = {
      id: generateId(),
      type: widgetType,
      title: widgetDef.label,
      showTitle: true,
      config: getDefaultWidgetConfig(widgetType),
      style: getDefaultWidgetStyle(),
      animation: {
        entrance: 'fade',
        duration: 200,
        delay: 0,
        stagger: 50,
        hover: 'lift'
      }
    };

    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col =>
        col.id === columnId
          ? { ...col, widgets: [...col.widgets, newWidget] }
          : col
      )
    });

    setSelectedWidget(newWidget.id);
    setWidgetPickerOpen(false);
  };

  const updateWidget = (widgetId: string, updates: Partial<MegaMenuWidget>) => {
    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col => ({
        ...col,
        widgets: col.widgets.map(w =>
          w.id === widgetId ? { ...w, ...updates } : w
        )
      }))
    });
  };

  const removeWidget = (widgetId: string) => {
    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col => ({
        ...col,
        widgets: col.widgets.filter(w => w.id !== widgetId)
      }))
    });
    if (selectedWidget === widgetId) setSelectedWidget(null);
  };

  const duplicateWidget = (widgetId: string) => {
    let targetColumn: MegaMenuColumn | null = null;
    let widgetIndex = -1;

    for (const col of megaConfig.columns) {
      const idx = col.widgets.findIndex(w => w.id === widgetId);
      if (idx !== -1) {
        targetColumn = col;
        widgetIndex = idx;
        break;
      }
    }

    if (!targetColumn || widgetIndex === -1) return;

    const widget = targetColumn.widgets[widgetIndex];
    const duplicatedWidget: MegaMenuWidget = {
      ...widget,
      id: generateId(),
      title: `${widget.title} (Copy)`
    };

    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col =>
        col.id === targetColumn!.id
          ? {
              ...col,
              widgets: [
                ...col.widgets.slice(0, widgetIndex + 1),
                duplicatedWidget,
                ...col.widgets.slice(widgetIndex + 1)
              ]
            }
          : col
      )
    });
  };

  const moveWidget = (widgetId: string, toColumnId: string, toIndex: number) => {
    let widget: MegaMenuWidget | null = null;
    let fromColumnId: string | null = null;

    for (const col of megaConfig.columns) {
      const found = col.widgets.find(w => w.id === widgetId);
      if (found) {
        widget = found;
        fromColumnId = col.id;
        break;
      }
    }

    if (!widget || !fromColumnId) return;

    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col => {
        if (col.id === fromColumnId && col.id === toColumnId) {
          const widgets = col.widgets.filter(w => w.id !== widgetId);
          widgets.splice(toIndex, 0, widget!);
          return { ...col, widgets };
        }
        if (col.id === fromColumnId) {
          return { ...col, widgets: col.widgets.filter(w => w.id !== widgetId) };
        }
        if (col.id === toColumnId) {
          const widgets = [...col.widgets];
          widgets.splice(toIndex, 0, widget!);
          return { ...col, widgets };
        }
        return col;
      })
    });
  };

  const getSelectedWidgetData = (): MegaMenuWidget | null => {
    if (!selectedWidget) return null;
    for (const col of megaConfig.columns) {
      const widget = col.widgets.find(w => w.id === selectedWidget);
      if (widget) return widget;
    }
    return null;
  };

  const handleSave = () => {
    onChange(megaConfig);
    onClose();
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderColumnEditor = (column: MegaMenuColumn, index: number) => {
    const isSelected = selectedColumn === column.id;

    return (
      <motion.div
        key={column.id}
        layoutId={column.id}
        className={clsx(
          'relative border-2 rounded-xl transition-all min-h-[200px] p-3',
          isSelected
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        )}
        style={{ width: `${column.width}%` }}
        onClick={() => setSelectedColumn(column.id)}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            <span className="text-sm font-medium text-gray-700">
              Column {index + 1}
            </span>
            <span className="text-xs text-gray-400">
              {column.width}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColumn(column.id);
                setWidgetPickerOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add widget"
            >
              <Plus className="w-4 h-4" />
            </button>
            {megaConfig.columns.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeColumn(column.id);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove column"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Widgets */}
        <div className="space-y-2">
          {column.widgets.length === 0 ? (
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColumn(column.id);
                setWidgetPickerOpen(true);
              }}
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Add Widget</p>
            </div>
          ) : (
            column.widgets.map((widget, widgetIndex) => (
              <motion.div
                key={widget.id}
                layoutId={widget.id}
                className={clsx(
                  'relative border rounded-lg p-3 cursor-pointer transition-all',
                  selectedWidget === widget.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWidget(widget.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-gray-400 cursor-grab" />
                    {React.createElement(
                      WIDGET_TYPES.find(w => w.type === widget.type)?.icon || Box,
                      { className: 'w-4 h-4 text-gray-500' }
                    )}
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                      {widget.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateWidget(widget.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  };

  const renderWidgetPicker = () => {
    const filteredWidgets = widgetPickerCategory === 'all'
      ? WIDGET_TYPES
      : WIDGET_TYPES.filter(w => w.category === widgetPickerCategory);

    return (
      <AnimatePresence>
        {widgetPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setWidgetPickerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Add Widget</h3>
                  <button
                    onClick={() => setWidgetPickerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setWidgetPickerCategory('all')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      widgetPickerCategory === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    All
                  </button>
                  {WIDGET_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setWidgetPickerCategory(cat.id)}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        widgetPickerCategory === cat.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-3 gap-3">
                  {filteredWidgets.map(widget => (
                    <button
                      key={widget.type}
                      onClick={() => selectedColumn && addWidget(selectedColumn, widget.type)}
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <widget.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        {widget.label}
                      </span>
                      <span className="text-xs text-gray-400 text-center">
                        {widget.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderLayoutTab = () => (
    <div className="space-y-6">
      {/* Width Setting */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Mega Menu Width</h4>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'full', label: 'Full Width' },
            { value: 'container', label: 'Container' },
            { value: 'auto', label: 'Auto' },
            { value: 'custom', label: 'Custom' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setMegaConfig({
                ...megaConfig,
                width: option.value === 'custom' ? 800 : option.value as any
              })}
              className={clsx(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                (megaConfig.width === option.value || (typeof megaConfig.width === 'number' && option.value === 'custom'))
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {typeof megaConfig.width === 'number' && (
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-2">
              Custom Width: {megaConfig.width}px
            </label>
            <input
              type="range"
              min="400"
              max="1400"
              value={megaConfig.width}
              onChange={(e) => setMegaConfig({ ...megaConfig, width: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-800">Columns ({megaConfig.columns.length})</h4>
          <button
            onClick={addColumn}
            disabled={megaConfig.columns.length >= 6}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Column
          </button>
        </div>

        {/* Column Width Sliders */}
        <div className="space-y-3 mb-4">
          {megaConfig.columns.map((col, idx) => (
            <div key={col.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-20">Col {idx + 1}</span>
              <input
                type="range"
                min="10"
                max="80"
                value={col.width}
                onChange={(e) => updateColumn(col.id, { width: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{col.width}%</span>
            </div>
          ))}
        </div>

        {/* Visual Column Editor */}
        <div className="flex gap-3 p-4 bg-gray-50 rounded-xl overflow-x-auto">
          {megaConfig.columns.map((col, idx) => renderColumnEditor(col, idx))}
        </div>
      </div>

      {/* Column Settings (when selected) */}
      {selectedColumn && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-4">Column Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Horizontal Alignment</label>
              <div className="flex gap-1">
                {['start', 'center', 'end', 'stretch'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateColumn(selectedColumn, { alignment: align as any })}
                    className={clsx(
                      'flex-1 px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                      megaConfig.columns.find(c => c.id === selectedColumn)?.alignment === align
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Vertical Alignment</label>
              <div className="flex gap-1">
                {['top', 'middle', 'bottom'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateColumn(selectedColumn, { verticalAlign: align as any })}
                    className={clsx(
                      'flex-1 px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                      megaConfig.columns.find(c => c.id === selectedColumn)?.verticalAlign === align
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWidgetSettings = () => {
    const widget = getSelectedWidgetData();
    if (!widget) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Select a widget to edit its settings</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Widget Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            {React.createElement(
              WIDGET_TYPES.find(w => w.type === widget.type)?.icon || Box,
              { className: 'w-6 h-6 text-purple-600' }
            )}
            <div>
              <h4 className="font-medium text-gray-800">{WIDGET_TYPES.find(w => w.type === widget.type)?.label}</h4>
              <p className="text-sm text-gray-500">{WIDGET_TYPES.find(w => w.type === widget.type)?.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Widget Title</label>
              <input
                type="text"
                value={widget.title}
                onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={widget.showTitle}
                onChange={(e) => updateWidget(widget.id, { showTitle: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show Title</span>
            </label>
          </div>
        </div>

        {/* Widget-specific config would go here */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-4">Widget Configuration</h4>
          <p className="text-sm text-gray-500">
            Configure the content and behavior of this {widget.type} widget.
          </p>
          {/* This would expand to show widget-specific settings based on type */}
        </div>

        {/* Widget Animation */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-4">Animation</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Entrance</label>
              <select
                value={widget.animation?.entrance || 'none'}
                onChange={(e) => updateWidget(widget.id, {
                  animation: { ...widget.animation!, entrance: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="zoom">Zoom</option>
                <option value="flip">Flip</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Hover Effect</label>
              <select
                value={widget.animation?.hover || 'none'}
                onChange={(e) => updateWidget(widget.id, {
                  animation: { ...widget.animation!, hover: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="none">None</option>
                <option value="lift">Lift</option>
                <option value="grow">Grow</option>
                <option value="shrink">Shrink</option>
                <option value="glow">Glow</option>
                <option value="shake">Shake</option>
                <option value="pulse">Pulse</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStyleTab = () => (
    <div className="space-y-6">
      {/* Background */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Background</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {['none', 'solid', 'gradient', 'image', 'pattern'].map(type => (
                <button
                  key={type}
                  onClick={() => setMegaConfig({
                    ...megaConfig,
                    background: { ...megaConfig.background, type: type as any }
                  })}
                  className={clsx(
                    'px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                    megaConfig.background.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {megaConfig.background.type === 'solid' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={megaConfig.background.color || '#ffffff'}
                  onChange={(e) => setMegaConfig({
                    ...megaConfig,
                    background: { ...megaConfig.background, color: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-200"
                />
                <input
                  type="text"
                  value={megaConfig.background.color || '#ffffff'}
                  onChange={(e) => setMegaConfig({
                    ...megaConfig,
                    background: { ...megaConfig.background, color: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {megaConfig.background.type === 'gradient' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Gradient Type</label>
                <div className="flex gap-2">
                  {['linear', 'radial'].map(gType => (
                    <button
                      key={gType}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          gradient: {
                            ...megaConfig.background.gradient,
                            type: gType as any,
                            colors: megaConfig.background.gradient?.colors || [
                              { color: '#3b82f6', position: 0 },
                              { color: '#8b5cf6', position: 100 }
                            ]
                          }
                        }
                      })}
                      className={clsx(
                        'flex-1 px-3 py-2 rounded border capitalize transition-colors',
                        megaConfig.background.gradient?.type === gType
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {gType}
                    </button>
                  ))}
                </div>
              </div>

              {megaConfig.background.gradient?.type === 'linear' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Angle: {megaConfig.background.gradient?.angle || 90}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={megaConfig.background.gradient?.angle || 90}
                    onChange={(e) => setMegaConfig({
                      ...megaConfig,
                      background: {
                        ...megaConfig.background,
                        gradient: {
                          ...megaConfig.background.gradient!,
                          angle: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {megaConfig.background.type === 'pattern' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Pattern Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {['dots', 'lines', 'grid', 'diagonal', 'waves', 'triangles', 'hexagons'].map(pattern => (
                    <button
                      key={pattern}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          pattern: {
                            type: pattern as any,
                            color: megaConfig.background.pattern?.color || '#000000',
                            opacity: megaConfig.background.pattern?.opacity || 0.1,
                            size: megaConfig.background.pattern?.size || 20
                          }
                        }
                      })}
                      className={clsx(
                        'px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                        megaConfig.background.pattern?.type === pattern
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Padding */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Padding</h4>
        <div className="grid grid-cols-2 gap-4">
          {['top', 'right', 'bottom', 'left'].map(side => (
            <div key={side}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">{side}</label>
              <input
                type="number"
                value={megaConfig.padding[side as keyof SpacingConfig] as number}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  padding: {
                    ...megaConfig.padding,
                    [side]: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnimationTab = () => (
    <div className="space-y-6">
      {/* Entrance Animation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Entrance Animation</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['none', 'fade', 'slide', 'zoom', 'flip', 'bounce', 'elastic'].map(type => (
                <button
                  key={type}
                  onClick={() => setMegaConfig({
                    ...megaConfig,
                    animation: {
                      ...megaConfig.animation,
                      entrance: { ...megaConfig.animation.entrance, type: type as any }
                    }
                  })}
                  className={clsx(
                    'px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                    megaConfig.animation.entrance.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {megaConfig.animation.entrance.type === 'slide' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Direction</label>
              <div className="grid grid-cols-4 gap-2">
                {['up', 'down', 'left', 'right'].map(dir => (
                  <button
                    key={dir}
                    onClick={() => setMegaConfig({
                      ...megaConfig,
                      animation: {
                        ...megaConfig.animation,
                        entrance: { ...megaConfig.animation.entrance, direction: dir as any }
                      }
                    })}
                    className={clsx(
                      'px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                      megaConfig.animation.entrance.direction === dir
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Duration: {megaConfig.animation.entrance.duration}ms
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={megaConfig.animation.entrance.duration}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  animation: {
                    ...megaConfig.animation,
                    entrance: { ...megaConfig.animation.entrance, duration: parseInt(e.target.value) }
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Delay: {megaConfig.animation.entrance.delay}ms
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={megaConfig.animation.entrance.delay}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  animation: {
                    ...megaConfig.animation,
                    entrance: { ...megaConfig.animation.entrance, delay: parseInt(e.target.value) }
                  }
                })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Easing</label>
            <select
              value={megaConfig.animation.entrance.easing}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                animation: {
                  ...megaConfig.animation,
                  entrance: { ...megaConfig.animation.entrance, easing: e.target.value }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="linear">Linear</option>
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
              <option value="cubic-bezier(0.68,-0.55,0.265,1.55)">Elastic</option>
              <option value="cubic-bezier(0.34,1.56,0.64,1)">Bounce</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stagger Animation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Stagger Animation</h4>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={megaConfig.animation.stagger.enabled}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                animation: {
                  ...megaConfig.animation,
                  stagger: { ...megaConfig.animation.stagger, enabled: e.target.checked }
                }
              })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Enable Stagger</span>
          </label>

          {megaConfig.animation.stagger.enabled && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Stagger Delay: {megaConfig.animation.stagger.delay}ms
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={megaConfig.animation.stagger.delay}
                  onChange={(e) => setMegaConfig({
                    ...megaConfig,
                    animation: {
                      ...megaConfig.animation,
                      stagger: { ...megaConfig.animation.stagger, delay: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Stagger From</label>
                <div className="grid grid-cols-3 gap-2">
                  {['start', 'center', 'end'].map(from => (
                    <button
                      key={from}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        animation: {
                          ...megaConfig.animation,
                          stagger: { ...megaConfig.animation.stagger, from: from as any }
                        }
                      })}
                      className={clsx(
                        'px-3 py-2 rounded border capitalize transition-colors',
                        megaConfig.animation.stagger.from === from
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {from}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Hover Effect</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {['none', 'lift', 'glow', 'scale', 'border-glow'].map(type => (
                <button
                  key={type}
                  onClick={() => setMegaConfig({
                    ...megaConfig,
                    animation: {
                      ...megaConfig.animation,
                      hover: { ...megaConfig.animation.hover, type: type as any }
                    }
                  })}
                  className={clsx(
                    'px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                    megaConfig.animation.hover.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {megaConfig.animation.hover.type !== 'none' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Intensity: {megaConfig.animation.hover.intensity}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={megaConfig.animation.hover.intensity}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  animation: {
                    ...megaConfig.animation,
                    hover: { ...megaConfig.animation.hover, intensity: parseInt(e.target.value) }
                  }
                })}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEffectsTab = () => (
    <div className="space-y-6">
      {/* Glassmorphism */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h4 className="font-medium text-gray-800">Glassmorphism</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={megaConfig.effects.glassmorphism.enabled}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                effects: {
                  ...megaConfig.effects,
                  glassmorphism: { ...megaConfig.effects.glassmorphism, enabled: e.target.checked }
                }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {megaConfig.effects.glassmorphism.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Blur: {megaConfig.effects.glassmorphism.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={megaConfig.effects.glassmorphism.blur}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  effects: {
                    ...megaConfig.effects,
                    glassmorphism: { ...megaConfig.effects.glassmorphism, blur: parseInt(e.target.value) }
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Opacity: {Math.round(megaConfig.effects.glassmorphism.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={megaConfig.effects.glassmorphism.opacity * 100}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  effects: {
                    ...megaConfig.effects,
                    glassmorphism: { ...megaConfig.effects.glassmorphism, opacity: parseInt(e.target.value) / 100 }
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Border Opacity: {Math.round(megaConfig.effects.glassmorphism.borderOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={megaConfig.effects.glassmorphism.borderOpacity * 100}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  effects: {
                    ...megaConfig.effects,
                    glassmorphism: { ...megaConfig.effects.glassmorphism, borderOpacity: parseInt(e.target.value) / 100 }
                  }
                })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Parallax */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500" />
            <h4 className="font-medium text-gray-800">Parallax Effect</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={megaConfig.effects.parallax.enabled}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                effects: {
                  ...megaConfig.effects,
                  parallax: { ...megaConfig.effects.parallax, enabled: e.target.checked }
                }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {megaConfig.effects.parallax.enabled && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Intensity: {Math.round(megaConfig.effects.parallax.intensity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={megaConfig.effects.parallax.intensity * 100}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                effects: {
                  ...megaConfig.effects,
                  parallax: { ...megaConfig.effects.parallax, intensity: parseInt(e.target.value) / 100 }
                }
              })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Noise/Grain */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h4 className="font-medium text-gray-800">Noise/Grain Texture</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={megaConfig.effects.noise.enabled}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                effects: {
                  ...megaConfig.effects,
                  noise: { ...megaConfig.effects.noise, enabled: e.target.checked }
                }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {megaConfig.effects.noise.enabled && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Opacity: {Math.round(megaConfig.effects.noise.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="30"
              value={megaConfig.effects.noise.opacity * 100}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                effects: {
                  ...megaConfig.effects,
                  noise: { ...megaConfig.effects.noise, opacity: parseInt(e.target.value) / 100 }
                }
              })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Cursor Effect */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Cursor Effect</h4>
        <div className="grid grid-cols-4 gap-2">
          {['default', 'pointer', 'glow', 'magnetic'].map(type => (
            <button
              key={type}
              onClick={() => setMegaConfig({
                ...megaConfig,
                effects: {
                  ...megaConfig.effects,
                  cursor: { ...megaConfig.effects.cursor, type: type as any }
                }
              })}
              className={clsx(
                'px-2 py-2 rounded border text-xs capitalize transition-colors',
                megaConfig.effects.cursor.type === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="space-y-6">
      {/* Tablet Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Tablet className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-800">Tablet Settings</h4>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={megaConfig.responsive.tablet.hidden}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                responsive: {
                  ...megaConfig.responsive,
                  tablet: { ...megaConfig.responsive.tablet, hidden: e.target.checked }
                }
              })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Hide on Tablet</span>
          </label>

          {!megaConfig.responsive.tablet.hidden && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Columns</label>
                <div className="grid grid-cols-5 gap-2">
                  {['inherit', 1, 2, 3, 4].map(cols => (
                    <button
                      key={cols}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        responsive: {
                          ...megaConfig.responsive,
                          tablet: { ...megaConfig.responsive.tablet, columns: cols as any }
                        }
                      })}
                      className={clsx(
                        'px-2 py-1.5 rounded border text-xs transition-colors',
                        megaConfig.responsive.tablet.columns === cols
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {cols === 'inherit' ? 'Auto' : cols}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Width</label>
                <div className="grid grid-cols-3 gap-2">
                  {['full', 'container', 'custom'].map(width => (
                    <button
                      key={width}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        responsive: {
                          ...megaConfig.responsive,
                          tablet: {
                            ...megaConfig.responsive.tablet,
                            width: width === 'custom' ? 600 : width as any
                          }
                        }
                      })}
                      className={clsx(
                        'px-2 py-1.5 rounded border text-xs capitalize transition-colors',
                        (megaConfig.responsive.tablet.width === width ||
                          (typeof megaConfig.responsive.tablet.width === 'number' && width === 'custom'))
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-blue-500" />
          <h4 className="font-medium text-gray-800">Mobile Settings</h4>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={megaConfig.responsive.mobile.hidden}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                responsive: {
                  ...megaConfig.responsive,
                  mobile: { ...megaConfig.responsive.mobile, hidden: e.target.checked }
                }
              })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Hide on Mobile</span>
          </label>

          {!megaConfig.responsive.mobile.hidden && (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={megaConfig.responsive.mobile.accordion}
                  onChange={(e) => setMegaConfig({
                    ...megaConfig,
                    responsive: {
                      ...megaConfig.responsive,
                      mobile: { ...megaConfig.responsive.mobile, accordion: e.target.checked }
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Use Accordion Layout</span>
              </label>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Columns</label>
                <div className="grid grid-cols-4 gap-2">
                  {['inherit', 1, 2].map(cols => (
                    <button
                      key={cols}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        responsive: {
                          ...megaConfig.responsive,
                          mobile: { ...megaConfig.responsive.mobile, columns: cols as any }
                        }
                      })}
                      className={clsx(
                        'px-2 py-1.5 rounded border text-xs transition-colors',
                        megaConfig.responsive.mobile.columns === cols
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {cols === 'inherit' ? 'Auto' : cols}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Behavior */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Behavior</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Open Delay: {megaConfig.advanced.openDelay}ms
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={megaConfig.advanced.openDelay}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  advanced: { ...megaConfig.advanced, openDelay: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Close Delay: {megaConfig.advanced.closeDelay}ms
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={megaConfig.advanced.closeDelay}
                onChange={(e) => setMegaConfig({
                  ...megaConfig,
                  advanced: { ...megaConfig.advanced, closeDelay: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { key: 'closeOnClick', label: 'Close on Click' },
              { key: 'closeOnOutsideClick', label: 'Close on Outside Click' },
              { key: 'hoverIntent', label: 'Hover Intent (prevents accidental triggers)' },
              { key: 'preventBodyScroll', label: 'Prevent Body Scroll When Open' },
              { key: 'trapFocus', label: 'Trap Focus (accessibility)' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(megaConfig.advanced as any)[key]}
                  onChange={(e) => setMegaConfig({
                    ...megaConfig,
                    advanced: { ...megaConfig.advanced, [key]: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Touch Behavior */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Touch Behavior</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'toggle', label: 'Toggle' },
            { value: 'first-tap-open', label: 'First Tap Opens' },
            { value: 'link', label: 'Navigate on Tap' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMegaConfig({
                ...megaConfig,
                advanced: { ...megaConfig.advanced, touchBehavior: value as any }
              })}
              className={clsx(
                'px-2 py-2 rounded border text-xs transition-colors',
                megaConfig.advanced.touchBehavior === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Accessibility (ARIA)</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'menu', label: 'Menu' },
            { value: 'navigation', label: 'Navigation' },
            { value: 'dialog', label: 'Dialog' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMegaConfig({
                ...megaConfig,
                advanced: { ...megaConfig.advanced, ariaBehavior: value as any }
              })}
              className={clsx(
                'px-2 py-2 rounded border text-xs transition-colors',
                megaConfig.advanced.ariaBehavior === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Classes */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Custom Attributes</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">CSS Class</label>
            <input
              type="text"
              value={megaConfig.advanced.customClass || ''}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                advanced: { ...megaConfig.advanced, customClass: e.target.value }
              })}
              placeholder="e.g., my-custom-megamenu"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">ID</label>
            <input
              type="text"
              value={megaConfig.advanced.customId || ''}
              onChange={(e) => setMegaConfig({
                ...megaConfig,
                advanced: { ...megaConfig.advanced, customId: e.target.value }
              })}
              placeholder="e.g., main-megamenu"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-50 rounded-2xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Mega Menu Builder</h2>
              <p className="text-sm text-gray-500">Create advanced mega menu layouts with widgets</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                showPreview
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>

            {/* Device Preview Buttons */}
            {showPreview && (
              <div className="flex gap-1 border-l border-gray-200 pl-3">
                {[
                  { device: 'desktop' as const, icon: Monitor },
                  { device: 'tablet' as const, icon: Tablet },
                  { device: 'mobile' as const, icon: Smartphone }
                ].map(({ device, icon: Icon }) => (
                  <button
                    key={device}
                    onClick={() => setPreviewMode(device)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      previewMode === device
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-400 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            <div className="h-6 w-px bg-gray-200" />

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-white border-r border-gray-200 p-3 space-y-1">
            {[
              { id: 'layout', label: 'Layout', icon: Columns },
              { id: 'widgets', label: 'Widgets', icon: Puzzle },
              { id: 'style', label: 'Style', icon: Palette },
              { id: 'animation', label: 'Animation', icon: Sparkles },
              { id: 'effects', label: 'Effects', icon: Wand2 },
              { id: 'responsive', label: 'Responsive', icon: Smartphone },
              { id: 'advanced', label: 'Advanced', icon: Sliders }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'layout' && renderLayoutTab()}
            {activeTab === 'widgets' && renderWidgetSettings()}
            {activeTab === 'style' && renderStyleTab()}
            {activeTab === 'animation' && renderAnimationTab()}
            {activeTab === 'effects' && renderEffectsTab()}
            {activeTab === 'responsive' && renderResponsiveTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-96 bg-gray-100 border-l border-gray-200 p-4 overflow-y-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">Live Preview</h4>
                <div
                  className={clsx(
                    'bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden transition-all',
                    previewMode === 'desktop' && 'w-full',
                    previewMode === 'tablet' && 'w-full max-w-[300px] mx-auto',
                    previewMode === 'mobile' && 'w-full max-w-[200px] mx-auto'
                  )}
                >
                  {/* Preview content would render here */}
                  <div className="p-4 min-h-[300px]">
                    <div className="flex gap-2">
                      {megaConfig.columns.map((col, idx) => (
                        <div
                          key={col.id}
                          className="bg-blue-50 border border-blue-200 rounded p-2 text-center"
                          style={{ width: `${col.width}%` }}
                        >
                          <div className="text-xs text-blue-600 mb-1">Col {idx + 1}</div>
                          {col.widgets.map(w => (
                            <div key={w.id} className="text-xs bg-white rounded p-1 mb-1 truncate">
                              {w.title}
                            </div>
                          ))}
                          {col.widgets.length === 0 && (
                            <div className="text-xs text-blue-400">Empty</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3">Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Columns</span>
                    <span className="font-medium">{megaConfig.columns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Widgets</span>
                    <span className="font-medium">
                      {megaConfig.columns.reduce((sum, col) => sum + col.widgets.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Width</span>
                    <span className="font-medium">
                      {typeof megaConfig.width === 'number' ? `${megaConfig.width}px` : megaConfig.width}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Animation</span>
                    <span className="font-medium capitalize">{megaConfig.animation.entrance.type}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMegaConfig(getDefaultMegaMenuConfig())}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Mega Menu
            </button>
          </div>
        </div>
      </motion.div>

      {/* Widget Picker Modal */}
      {renderWidgetPicker()}
    </div>
  );
};

export default MegaMenuBuilder;
